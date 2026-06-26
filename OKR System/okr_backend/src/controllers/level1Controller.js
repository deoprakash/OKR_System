import Level1OKR from "../models/level1Okr.js";
import mongoose from "mongoose";

const codeField = "level1OkrCode";

export async function list(req, res) {
  try {
    const docs = await Level1OKR.find().sort({ createdAt: -1 }).limit(200);
    res.json({ data: docs });
  } catch (err) {
    res.status(500).json({ error: "Failed to list Level1 OKRs" });
  }
}

export async function get(req, res) {
  const { id } = req.params;
  try {
    let doc = null;
    if (mongoose.isValidObjectId(id)) {
      doc = await Level1OKR.findById(id);
    } else {
      doc = await Level1OKR.findOne({ [codeField]: Number(id) });
    }
    if (!doc) return res.status(404).json({ error: "Not found" });
    res.json({ data: doc });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch Level1 OKR" });
  }
}

export async function create(req, res) {
  try {
    const payload = req.body || {};
    const doc = new Level1OKR({
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
      doc = await Level1OKR.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    } else {
      doc = await Level1OKR.findOneAndUpdate({ [codeField]: Number(id) }, req.body, { new: true, runValidators: true });
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
      doc = await Level1OKR.findByIdAndDelete(id);
    } else {
      doc = await Level1OKR.findOneAndDelete({ [codeField]: Number(id) });
    }
    if (!doc) return res.status(404).json({ error: "Not found" });
    res.json({ data: doc });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete" });
  }
}
