import { google } from "googleapis";

let gmailClient;

function getGmailClient() {
  const gmailClientId = process.env.GMAIL_CLIENT_ID || "";
  const gmailClientSecret = process.env.GMAIL_CLIENT_SECRET || "";
  const gmailRefreshToken = process.env.GMAIL_REFRESH_TOKEN || "";
  const gmailRedirectUri = process.env.GMAIL_REDIRECT_URI || "https://developers.google.com/oauthplayground";

  if (!gmailClientId || !gmailClientSecret || !gmailRefreshToken) {
    throw new Error("GMAIL client not configured. Set GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET and GMAIL_REFRESH_TOKEN");
  }

  if (!gmailClient) {
    const oauth2Client = new google.auth.OAuth2(gmailClientId, gmailClientSecret, gmailRedirectUri);
    oauth2Client.setCredentials({ refresh_token: gmailRefreshToken });
    gmailClient = google.gmail({ version: "v1", auth: oauth2Client });
  }

  return gmailClient;
}

export async function sendEmail({ from, to, subject, text }) {
  if (!to) throw new Error("Recipient email missing");
  const fromAddr = from || process.env.OTP_EMAIL_FROM || "";
  if (!fromAddr) throw new Error("Email sender not configured");

  const mailer = getGmailClient();
  const rawMessage = [
    `From: ${fromAddr}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    'Content-Type: text/plain; charset="UTF-8"',
    "",
    text
  ].join("\r\n");

  const encodedMessage = Buffer.from(rawMessage).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");

  await mailer.users.messages.send({
    userId: "me",
    requestBody: { raw: encodedMessage }
  });
}

export default { sendEmail };
