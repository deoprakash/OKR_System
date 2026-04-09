import mongoose from "mongoose";

function canViewLevel(user, level) {
  if (user.isAdmin) return true;
  return Number(level) >= Number(user.empLevel || 0);
}

function canWriteLevel(user, level) {
  if (user.isAdmin) return true;
  return Number(level) === Number(user.empLevel || 0);
}

export function allowLevelRead(level) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    if (!canViewLevel(req.user, level)) {
      return res.status(403).json({ error: "You can only view lower level records" });
    }
    next();
  };
}

export function allowLevelWrite({ level, model, codeField }) {
  return async (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    if (!canWriteLevel(req.user, level)) {
      return res.status(403).json({ error: "You can edit only your own level records" });
    }

    if (req.user.isAdmin) return next();

    try {
      if (req.method === "POST") {
        const bodyEmpCode = Number(req.body?.empCode || 0);
        if (bodyEmpCode !== Number(req.user.empCode)) {
          return res.status(403).json({ error: "You can create only your own records" });
        }
        return next();
      }

      const { id } = req.params;
      let doc = null;

      if (mongoose.isValidObjectId(id)) {
        doc = await model.findById(id);
      } else {
        doc = await model.findOne({ [codeField]: Number(id) });
      }

      if (!doc) return res.status(404).json({ error: "Not found" });

      if (Number(doc.empCode) !== Number(req.user.empCode)) {
        return res.status(403).json({ error: "You can edit only your own records" });
      }

      if (req.method === "PUT" && req.body?.empCode != null) {
        if (Number(req.body.empCode) !== Number(req.user.empCode)) {
          return res.status(403).json({ error: "Cannot change ownership of record" });
        }
      }

      next();
    } catch (err) {
      res.status(500).json({ error: "Permission check failed" });
    }
  };
}
