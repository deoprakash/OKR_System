import Employee from "../models/employee.js";
import mongoose from "mongoose";

export async function list(req, res) {
  try {
    let filter = {};
    if (!req.user?.isAdmin) {
      filter = { empLevel: { $gte: Number(req.user?.empLevel || 0) } };
    }
    const docs = await Employee.find(filter).sort({ createdAt: -1 }).limit(200);
    res.json({ data: docs });
  } catch (err) {
    res.status(500).json({ error: "Failed to list employees" });
  }
}

export async function get(req, res) {
  const { id } = req.params;
  try {
    let doc = null;
    if (mongoose.isValidObjectId(id)) {
      doc = await Employee.findById(id);
    } else {
      doc = await Employee.findOne({ empCode: Number(id) });
    }
    if (!doc) return res.status(404).json({ error: "Not found" });

    if (!req.user?.isAdmin) {
      const canView =
        Number(doc.empCode) === Number(req.user?.empCode) ||
        Number(doc.empLevel) >= Number(req.user?.empLevel || 0);
      if (!canView) {
        return res.status(403).json({ error: "You can only view lower level employees" });
      }
    }

    res.json({ data: doc });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch employee" });
  }
}

export async function create(req, res) {
  try {
    const payload = req.body || {};
    const totalEmployees = await Employee.countDocuments();

    // Bootstrap flow: first user can be created without auth if marked as admin.
    if (!req.user && totalEmployees > 0) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!req.user && totalEmployees === 0) {
      if (!payload.isAdmin) {
        return res.status(400).json({ error: "First user must be admin" });
      }
    }

    if (req.user && !req.user.isAdmin) {
      return res.status(403).json({ error: "Only admin can create employees" });
    }

    const payloadWithCreator = {
      ...payload,
      createdByName: req.user?.empName || payload.empName || "System",
      createdByEmpCode: req.user?.empCode || null,
      createdByUserId: req.user?.userId || null
    };

    const doc = new Employee(payloadWithCreator);
    await doc.save();
    res.status(201).json({ data: doc });
  } catch (err) {
    res.status(400).json({ error: err.message || "Failed to create" });
  }
}

export async function update(req, res) {
  const { id } = req.params;
  try {
    const incoming = { ...(req.body || {}) };

    if (!req.user?.isAdmin) {
      const targetEmpCode = mongoose.isValidObjectId(id) ? null : Number(id);
      if (targetEmpCode && targetEmpCode !== Number(req.user.empCode)) {
        return res.status(403).json({ error: "You can update only your own profile" });
      }

      delete incoming.isAdmin;
      delete incoming.empLevel;
      delete incoming.empCode;
    }

    let doc = null;
    if (mongoose.isValidObjectId(id)) {
      doc = await Employee.findById(id);
      if (!doc) return res.status(404).json({ error: "Not found" });

      if (!req.user?.isAdmin && Number(doc.empCode) !== Number(req.user?.empCode)) {
        return res.status(403).json({ error: "You can update only your own profile" });
      }

      Object.assign(doc, incoming);
      await doc.save();
    } else {
      doc = await Employee.findOneAndUpdate(
        { empCode: Number(id) },
        incoming,
        { new: true, runValidators: true }
      );
    }
    if (!doc) return res.status(404).json({ error: "Not found" });
    res.json({ data: doc });
  } catch (err) {
    res.status(400).json({ error: err.message || "Failed to update" });
  }
}

export async function remove(req, res) {
  const { id } = req.params;
  try {
    if (!req.user?.isAdmin) {
      return res.status(403).json({ error: "Only admin can delete employees" });
    }

    let doc = null;
    if (mongoose.isValidObjectId(id)) {
      doc = await Employee.findByIdAndDelete(id);
    } else {
      doc = await Employee.findOneAndDelete({ empCode: Number(id) });
    }
    if (!doc) return res.status(404).json({ error: "Not found" });
    res.json({ data: doc });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete" });
  }
}
