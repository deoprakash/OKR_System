import crypto from "crypto";
import Employee from "../models/employee.js";
import AuthSession from "../models/authSession.js";
import mailer from "../lib/mailer.js";

function findEmployeeByLoginIdentifier(input) {
  const v = String(input || "").trim();
  if (!v) return null;
  if (v.includes("@")) {
    return Employee.findOne({ emailId: new RegExp(`^${v.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")}$`, "i") });
  }
  return Employee.findOne({ userId: new RegExp(`^${v.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")}$`, "i") });
}

export async function login(req, res) {
  try {
    const identifier = String(req.body?.identifier || req.body?.userId || req.body?.email || "").trim();
    const password = String(req.body?.password || "");
    if (!identifier || !password) return res.status(400).json({ error: "identifier and password are required" });

    const employee = await findEmployeeByLoginIdentifier(identifier);
    if (!employee) return res.status(404).json({ error: "Employee not found" });

    if (!employee.validatePassword(password)) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = crypto.randomBytes(48).toString("hex");
    const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000);

    await AuthSession.create({ token, empCode: employee.empCode, expiresAt });

    res.json({
      message: "Login successful",
      data: {
        token,
        expiresAt,
        mustChangePassword: Boolean(employee.mustChangePassword),
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
    console.error("login failed", { message: err?.message, stack: err?.stack });
    res.status(500).json({ error: "Failed to login" });
  }
}

export async function changePassword(req, res) {
  try {
    const empCode = req.user?.empCode;
    if (!empCode) return res.status(401).json({ error: "Unauthorized" });

    const { oldPassword, newPassword } = req.body || {};
    if (!newPassword) return res.status(400).json({ error: "newPassword is required" });

    const employee = await Employee.findOne({ empCode });
    if (!employee) return res.status(404).json({ error: "Employee not found" });

    // require oldPassword to validate
    if (!employee.validatePassword(oldPassword)) {
      return res.status(401).json({ error: "Invalid current password" });
    }

    employee.setPassword(newPassword);
    employee.mustChangePassword = false;
    await employee.save();

    res.json({ message: "Password changed" });
  } catch (err) {
    console.error("changePassword failed", { message: err?.message, stack: err?.stack });
    res.status(500).json({ error: "Failed to change password" });
  }
}

export async function forgotPassword(req, res) {
  try {
    const identifier = String(req.body?.identifier || req.body?.email || req.body?.userId || "").trim();
    if (!identifier) return res.status(400).json({ error: "identifier is required" });

    const employee = await findEmployeeByLoginIdentifier(identifier);
    if (!employee) return res.status(404).json({ error: "Employee not found" });

    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const expiresAt = new Date(Date.now() + (process.env.PASSWORD_RESET_EXPIRY_MINUTES ? Number(process.env.PASSWORD_RESET_EXPIRY_MINUTES) * 60000 : 60 * 60 * 1000));

    employee.resetTokenHash = tokenHash;
    employee.resetTokenExpires = expiresAt;
    await employee.save();

    // send email with token (simple text)
    try {
      const subject = "Password reset for your OKR account";
      const text = `A password reset was requested for your account. Use this code to reset your password:\n\n${token}\n\nThis code expires at ${expiresAt.toISOString()}. If you did not request this, please ignore.`;
      await mailer.sendEmail({ to: employee.emailId, subject, text });
    } catch (mailErr) {
      console.error('Failed to send reset email', mailErr?.message);
    }

    res.json({ message: "Password reset requested" });
  } catch (err) {
    console.error('forgotPassword failed', err?.message);
    res.status(500).json({ error: "Failed to request password reset" });
  }
}

export async function resetPassword(req, res) {
  try {
    const token = String(req.body?.token || "").trim();
    const newPassword = String(req.body?.newPassword || "");
    if (!token || !newPassword) return res.status(400).json({ error: "token and newPassword are required" });

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const employee = await Employee.findOne({ resetTokenHash: tokenHash, resetTokenExpires: { $gt: new Date() } });
    if (!employee) return res.status(400).json({ error: "Invalid or expired token" });

    employee.setPassword(newPassword);
    employee.mustChangePassword = false;
    employee.resetTokenHash = undefined;
    employee.resetTokenExpires = undefined;
    await employee.save();

    res.json({ message: "Password has been reset" });
  } catch (err) {
    console.error('resetPassword failed', err?.message);
    res.status(500).json({ error: "Failed to reset password" });
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
