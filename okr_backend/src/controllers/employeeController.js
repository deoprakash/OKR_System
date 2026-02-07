import Employee from "../models/employee.js";
import mongoose from "mongoose";

export async function list(req, res) {
  try {
    const docs = await Employee.find().sort({ createdAt: -1 }).limit(200);
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
    res.json({ data: doc });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch employee" });
  }
}

export async function create(req, res) {
  try {
    const payload = req.body;
    const doc = new Employee(payload);
    await doc.save();
    res.status(201).json({ data: doc });
  } catch (err) {
    res.status(400).json({ error: err.message || "Failed to create" });
  }
}

export async function update(req, res) {
  const { id } = req.params;
  try {
    let doc = null;
    if (mongoose.isValidObjectId(id)) {
      doc = await Employee.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    } else {
      // if updating by empCode, allow upsert so clients that PUT with empCode
      // can create the employee if it doesn't exist instead of returning 404
      doc = await Employee.findOneAndUpdate(
        { empCode: Number(id) },
        req.body,
        { new: true, runValidators: true, upsert: true }
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
