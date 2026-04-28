const nodemailer = require("nodemailer");

function getTransportConfig() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = String(process.env.SMTP_SECURE || "false").toLowerCase() === "true";

  if (!host || !user || !pass) {
    return null;
  }
  return { host, port, secure, auth: { user, pass } };
}

async function sendActivationEmail({ to, activationLink }) {
  const transport = getTransportConfig();
  if (!transport) {
    console.log(`[mail:fallback] Activation link for ${to}: ${activationLink}`);
    return { delivered: false, mode: "fallback-console" };
  }

  const transporter = nodemailer.createTransport(transport);
  const from = process.env.SMTP_FROM || transport.auth.user;
  const appName = process.env.APP_NAME || "Car Dealership";
  await transporter.sendMail({
    from,
    to,
    subject: `${appName} - Aktivizo llogarinë`,
    text: `Përshëndetje,\n\nKliko linkun për aktivizimin e llogarisë:\n${activationLink}\n\nNëse nuk e ke kërkuar këtë, injoroje këtë email.`,
    html: `<p>Përshëndetje,</p><p>Kliko linkun për aktivizimin e llogarisë:</p><p><a href="${activationLink}">${activationLink}</a></p><p>Nëse nuk e ke kërkuar këtë, injoroje këtë email.</p>`,
  });
  return { delivered: true, mode: "smtp" };
}

module.exports = {
  sendActivationEmail,
};

