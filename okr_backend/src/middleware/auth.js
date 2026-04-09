import AuthSession from "../models/authSession.js";
import Employee from "../models/employee.js";

async function resolveUserFromAuthHeader(header) {
  const [scheme, token] = (header || "").split(" ");
  if (scheme !== "Bearer" || !token) return null;

  const session = await AuthSession.findOne({ token, expiresAt: { $gt: new Date() } });
  if (!session) return null;

  const employee = await Employee.findOne({ empCode: session.empCode });
  if (!employee) return null;

  return {
    empCode: employee.empCode,
    userId: employee.userId,
    empName: employee.empName,
    empLevel: Number(employee.empLevel || 0),
    isAdmin: Boolean(employee.isAdmin),
    emailId: employee.emailId,
    cellNumber: employee.cellNumber
  };
}

export async function requireAuth(req, res, next) {
  try {
    const user = await resolveUserFromAuthHeader(req.headers.authorization || "");
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    req.user = user;

    next();
  } catch (err) {
    res.status(500).json({ error: "Auth failed" });
  }
}

export async function attachAuthUser(req, res, next) {
  try {
    const user = await resolveUserFromAuthHeader(req.headers.authorization || "");
    req.user = user;

    next();
  } catch (err) {
    res.status(500).json({ error: "Auth failed" });
  }
}
