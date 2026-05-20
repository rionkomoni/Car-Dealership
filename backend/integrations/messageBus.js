const EventEmitter = require("events");

const localBus = new EventEmitter();
let rabbit = null;
let channel = null;
let activeMode = "local";
const exchangeName = process.env.RABBITMQ_EXCHANGE || "car_dealership.events";

async function initMessageBus() {
  const broker = String(process.env.MESSAGE_BROKER || "local").toLowerCase();
  if (broker !== "rabbitmq") {
    activeMode = "local";
    return { mode: activeMode };
  }

  try {
    // Lazy-load so project runs even without amqplib installed.
    const amqp = require("amqplib");
    const url = process.env.RABBITMQ_URL || "amqp://localhost:5672";
    rabbit = await amqp.connect(url);
    channel = await rabbit.createChannel();
    await channel.assertExchange(exchangeName, "topic", { durable: true });
    activeMode = "rabbitmq";
    return { mode: activeMode };
  } catch (err) {
    console.warn(`RabbitMQ unavailable, fallback to local bus: ${err.message}`);
    activeMode = "local";
    return { mode: activeMode, fallback: true };
  }
}

async function publishEvent(eventName, payload) {
  const envelope = {
    event: eventName,
    payload,
    at: new Date().toISOString(),
  };
  if (activeMode === "rabbitmq" && channel) {
    channel.publish(exchangeName, eventName, Buffer.from(JSON.stringify(envelope)), {
      contentType: "application/json",
      persistent: true,
    });
    return { delivered: true, mode: "rabbitmq" };
  }
  localBus.emit(eventName, envelope);
  return { delivered: true, mode: "local" };
}

async function subscribeEvent(eventName, handler) {
  if (activeMode === "rabbitmq" && channel) {
    const queueName = `cd.${eventName.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const q = await channel.assertQueue(queueName, { durable: true });
    await channel.bindQueue(q.queue, exchangeName, eventName);
    channel.consume(q.queue, (msg) => {
      if (!msg) return;
      try {
        const envelope = JSON.parse(msg.content.toString());
        handler(envelope);
        channel.ack(msg);
      } catch (err) {
        console.warn(`RabbitMQ consumer error (${eventName}):`, err.message);
        channel.nack(msg, false, false);
      }
    });
    return { mode: "rabbitmq", queue: queueName };
  }
  localBus.on(eventName, handler);
  return { mode: "local" };
}

function getMessageBusStatus() {
  return { mode: activeMode, exchange: exchangeName };
}

module.exports = {
  initMessageBus,
  publishEvent,
  subscribeEvent,
  getMessageBusStatus,
};
