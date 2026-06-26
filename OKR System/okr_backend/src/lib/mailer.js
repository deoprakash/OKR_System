import nodemailer from "nodemailer";

let transporter;

function getTransporter() {
  const host = process.env.SMTP_HOST || "";
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER || "";
  const pass = process.env.SMTP_PASS || "";
  const secure = process.env.SMTP_SECURE === "true" || port === 465;

  if (!host || !user || !pass) {
    throw new Error(
      "SMTP not configured. Set SMTP_HOST, SMTP_USER, and SMTP_PASS"
    );
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass }
    });
  }

  return transporter;
}

export async function sendEmail({ from, to, subject, text }) {
  if (!to) throw new Error("Recipient email missing");

  const fromAddr = from || process.env.OTP_EMAIL_FROM || "";
  if (!fromAddr) throw new Error("Email sender not configured (OTP_EMAIL_FROM)");

  await getTransporter().sendMail({
    from: fromAddr,
    to,
    subject,
    text
  });
}

export default { sendEmail };
