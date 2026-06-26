import Level2OKR from "../models/level2Okr.js";
import mongoose from "mongoose";

const codeField = "level2OkrCode";

export async function list(req, res) {
  try {
    const docs = await Level2OKR.find().sort({ createdAt: -1 }).limit(200);
    res.json({ data: docs });
  } catch (err) {
    res.status(500).json({ error: "Failed to list Level2 OKRs" });
  }
}

export async function get(req, res) {
  const { id } = req.params;
  try {
    let doc = null;
    if (mongoose.isValidObjectId(id)) {
      doc = await Level2OKR.findById(id);
    } else {
      doc = await Level2OKR.findOne({ [codeField]: Number(id) });
    }
    if (!doc) return res.status(404).json({ error: "Not found" });
    res.json({ data: doc });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch Level2 OKR" });
  }
}

export async function create(req, res) {
  try {
    const payload = req.body || {};
    const doc = new Level2OKR({
      ...payload,
      createdByName: req.user?.empName || "System",
      createdByEmpCode: req.user?.empCode || null,
      createdByUserId: req.user?.userId || null
    });
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
      doc = await Level2OKR.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    } else {
      doc = await Level2OKR.findOneAndUpdate({ [codeField]: Number(id) }, req.body, { new: true, runValidators: true });
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
      doc = await Level2OKR.findByIdAndDelete(id);
    } else {
      doc = await Level2OKR.findOneAndDelete({ [codeField]: Number(id) });
    }
    if (!doc) return res.status(404).json({ error: "Not found" });
    res.json({ data: doc });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete" });
  }
}
