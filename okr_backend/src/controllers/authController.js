import crypto from "crypto";
import { google } from "googleapis";
import Employee from "../models/employee.js";
import OtpChallenge from "../models/otpChallenge.js";
import AuthSession from "../models/authSession.js";

let gmailClient;
const OTP_EMAIL_TIMEOUT_MS = Number(process.env.OTP_EMAIL_TIMEOUT_MS || 15000);
const OTP_EXPIRY_SECONDS = Number(process.env.OTP_EXPIRY_SECONDS || 60);
const isProduction = process.env.NODE_ENV === "production";
const OTP_EMAIL_ENABLED = String(process.env.OTP_EMAIL_ENABLED || (isProduction ? "true" : "false")).toLowerCase() === "true";

function getOtpTemplate() {
  return process.env.OTP_TEMPLATE_TEXT || "Your login OTP is {}. This is valid for 1 minute. NEVER share your OTP.";
}

function buildOtpMessage(otp) {
  const template = getOtpTemplate();
  if (template.includes("{}")) {
    return template.replace("{}", String(otp));
  }
  return `${template} ${String(otp)}`;
}

function getGmailClient() {
  const otpEmailFrom = process.env.OTP_EMAIL_FROM || "";
  const gmailClientId = process.env.GMAIL_CLIENT_ID || "";
  const gmailClientSecret = process.env.GMAIL_CLIENT_SECRET || "";
  const gmailRefreshToken = process.env.GMAIL_REFRESH_TOKEN || "";
  const gmailRedirectUri = process.env.GMAIL_REDIRECT_URI || "https://developers.google.com/oauthplayground";

  if (!otpEmailFrom || !gmailClientId || !gmailClientSecret || !gmailRefreshToken) {
    throw new Error("OTP email is not configured. Set OTP_EMAIL_FROM, GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET and GMAIL_REFRESH_TOKEN");
  }

  if (!gmailClient) {
    const oauth2Client = new google.auth.OAuth2(gmailClientId, gmailClientSecret, gmailRedirectUri);
    oauth2Client.setCredentials({
      refresh_token: gmailRefreshToken
    });

    gmailClient = google.gmail({
      version: "v1",
      auth: oauth2Client
    });
  }

  return gmailClient;
}

async function sendOtpEmail(emailTo, otp) {
  const otpEmailFrom = process.env.OTP_EMAIL_FROM || "";
  const message = buildOtpMessage(otp);

  if (!emailTo) {
    throw new Error("Employee email is missing");
  }

  if (!otpEmailFrom) {
    throw new Error("OTP_EMAIL_FROM is required");
  }

  const mailer = getGmailClient();
  const rawMessage = [
    `From: ${otpEmailFrom}`,
    `To: ${emailTo}`,
    "Subject: Your OKR Login OTP",
    "MIME-Version: 1.0",
    'Content-Type: text/plain; charset="UTF-8"',
    "",
    message
  ].join("\r\n");

  const encodedMessage = Buffer.from(rawMessage)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");

  await Promise.race([
    mailer.users.messages.send({
      userId: "me",
      requestBody: {
        raw: encodedMessage
      }
    }),
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error("OTP email send timed out")), OTP_EMAIL_TIMEOUT_MS);
    })
  ]);
}

function maskEmail(email) {
  if (!email || !email.includes("@")) return "";
  const [name, domain] = email.split("@");
  if (name.length <= 2) return `**@${domain}`;
  return `${name.slice(0, 2)}***@${domain}`;
}

function maskMobile(number) {
  if (!number || number.length < 4) return "";
  const last4 = number.slice(-4);
  return `******${last4}`;
}

function hashOtp(otp) {
  return crypto.createHash("sha256").update(String(otp)).digest("hex");
}

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function requestOtp(req, res) {
  try {
    const emailInput = String(req.body?.email || req.body?.userId || "").trim().toLowerCase();
    if (!emailInput) {
      return res.status(400).json({ error: "email is required" });
    }

    const emailRegex = new RegExp(`^${escapeRegex(emailInput)}$`, "i");
    const employee = await Employee.findOne({ emailId: emailRegex });
    if (!employee) return res.status(404).json({ error: "Employee not found" });

    const otp = generateOtp();
    const otpHash = hashOtp(otp);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_SECONDS * 1000);

    await OtpChallenge.findOneAndUpdate(
      { empCode: employee.empCode, consumed: false },
      {
        $set: {
          empCode: employee.empCode,
          otpHash,
          expiresAt,
          attempts: 0,
          consumed: false
        }
      },
      { upsert: true, new: true }
    );

    if (OTP_EMAIL_ENABLED) {
      try {
        await sendOtpEmail(employee.emailId, otp);
      } catch (sendErr) {
        console.error("OTP email send failed", {
          userId: employee.userId,
          email: employee.emailId,
          message: sendErr?.message,
          code: sendErr?.code,
          command: sendErr?.command,
          response: sendErr?.response,
          responseCode: sendErr?.responseCode
        });
        return res.status(502).json({ error: sendErr.message || "Failed to send OTP email" });
      }
    } else {
      // In non-production, skip outgoing email to keep local/dev flows simple.
      console.log(`OTP generated (email disabled): userId=${employee.userId} otp=${otp}`);
    }

    const payload = {
      message: "OTP sent successfully",
      data: {
        userId: employee.userId,
        email: maskEmail(employee.emailId),
        cellNumber: maskMobile(employee.cellNumber),
        expiresInSeconds: OTP_EXPIRY_SECONDS
      }
    };

    res.json(payload);
  } catch (err) {
    console.error("requestOtp failed", {
      message: err?.message,
      stack: err?.stack
    });
    res.status(500).json({ error: "Failed to request OTP" });
  }
}

export async function verifyOtp(req, res) {
  try {
    const emailInput = String(req.body?.email || req.body?.userId || "").trim().toLowerCase();
    const otp = String(req.body?.otp || "").trim();

    if (!emailInput || !otp) {
      return res.status(400).json({ error: "email and otp are required" });
    }

    const emailRegex = new RegExp(`^${escapeRegex(emailInput)}$`, "i");
    const employee = await Employee.findOne({ emailId: emailRegex });
    if (!employee) return res.status(404).json({ error: "Employee not found" });

    const challenge = await OtpChallenge.findOne({
      empCode: employee.empCode,
      consumed: false
    }).sort({ createdAt: -1 });

    if (!challenge) {
      return res.status(400).json({ error: "No OTP challenge found" });
    }

    if (challenge.expiresAt <= new Date()) {
      return res.status(400).json({ error: "OTP expired" });
    }

    if (challenge.attempts >= 5) {
      return res.status(400).json({ error: "Too many attempts. Request a new OTP" });
    }

    if (challenge.otpHash !== hashOtp(otp)) {
      challenge.attempts += 1;
      await challenge.save();
      return res.status(400).json({ error: "Invalid OTP" });
    }

    challenge.consumed = true;
    await challenge.save();

    const token = crypto.randomBytes(48).toString("hex");
    const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000);

    await AuthSession.create({
      token,
      empCode: employee.empCode,
      expiresAt
    });

    res.json({
      message: "Login successful",
      data: {
        token,
        expiresAt,
        user: {
          empCode: employee.empCode,
          userId: employee.userId,
          empName: employee.empName,
          empDesignation: employee.empDesignation,
          empLevel: employee.empLevel,
          isAdmin: Boolean(employee.isAdmin),
          emailId: employee.emailId,
          cellNumber: employee.cellNumber
        }
      }
    });
  } catch (err) {
    console.error("verifyOtp failed", {
      message: err?.message,
      stack: err?.stack
    });
    res.status(500).json({ error: "Failed to verify OTP" });
  }
}

export async function me(req, res) {
  res.json({ data: req.user });
}

export async function logout(req, res) {
  try {
    const header = req.headers.authorization || "";
    const [scheme, token] = header.split(" ");
    if (scheme === "Bearer" && token) {
      await AuthSession.deleteOne({ token });
    }
    res.json({ message: "Logged out" });
  } catch (err) {
    res.status(500).json({ error: "Failed to logout" });
  }
}
