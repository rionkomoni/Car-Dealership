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

function getEmailProvider() {
  return String(process.env.EMAIL_PROVIDER || "smtp").trim().toLowerCase();
}

async function sendViaSmtp({ to, subject, text, html }) {
  const transport = getTransportConfig();
  if (!transport) {
    console.log(`[mail:fallback] To ${to} | ${subject}\n${text}`);
    return { delivered: false, mode: "fallback-console" };
  }

  const transporter = nodemailer.createTransport(transport);
  const from = process.env.SMTP_FROM || transport.auth.user;
  await transporter.sendMail({
    from,
    to,
    subject,
    text,
    html,
  });
  return { delivered: true, mode: "smtp" };
}

async function sendViaSendGrid({ to, subject, text, html }) {
  const apiKey = process.env.SENDGRID_API_KEY;
  const from = process.env.SENDGRID_FROM || process.env.SMTP_FROM;
  if (!apiKey || !from) {
    console.log(`[mail:fallback] To ${to} | ${subject}\n${text}`);
    return { delivered: false, mode: "fallback-console" };
  }

  const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: from },
      subject,
      content: [
        { type: "text/plain", value: text },
        { type: "text/html", value: html },
      ],
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`SendGrid error (${response.status}): ${body}`);
  }
  return { delivered: true, mode: "sendgrid" };
}

async function sendMail({ to, subject, text, html }) {
  const provider = getEmailProvider();
  if (provider === "sendgrid") {
    return sendViaSendGrid({ to, subject, text, html });
  }
  return sendViaSmtp({ to, subject, text, html });
}

async function sendActivationEmail({ to, activationLink }) {
  const appName = process.env.APP_NAME || "Car Dealership";
  return sendMail({
    to,
    subject: `${appName} - Aktivizo llogarinë`,
    text: `Përshëndetje,\n\nKliko linkun për aktivizimin e llogarisë:\n${activationLink}\n\nNëse nuk e ke kërkuar këtë, injoroje këtë email.`,
    html: `<p>Përshëndetje,</p><p>Kliko linkun për aktivizimin e llogarisë:</p><p><a href="${activationLink}">${activationLink}</a></p><p>Nëse nuk e ke kërkuar këtë, injoroje këtë email.</p>`,
  });
}

async function sendPasswordResetEmail({ to, resetLink }) {
  const appName = process.env.APP_NAME || "Car Dealership";
  return sendMail({
    to,
    subject: `${appName} - Reset password`,
    text: `Përshëndetje,\n\nKliko linkun për reset të fjalëkalimit:\n${resetLink}\n\nNëse nuk e ke kërkuar këtë, injoroje këtë email.`,
    html: `<p>Përshëndetje,</p><p>Kliko linkun për reset të fjalëkalimit:</p><p><a href="${resetLink}">${resetLink}</a></p><p>Nëse nuk e ke kërkuar këtë, injoroje këtë email.</p>`,
  });
}

module.exports = {
  sendMail,
  sendActivationEmail,
  sendPasswordResetEmail,
};

