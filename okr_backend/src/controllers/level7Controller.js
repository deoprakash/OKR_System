import Level7OKR from "../models/level7Okr.js";
import mongoose from "mongoose";

const codeField = "level7OkrCode";

export async function list(req, res) {
  try {
    const docs = await Level7OKR.find().sort({ createdAt: -1 }).limit(200);
    res.json({ data: docs });
  } catch (err) {
    res.status(500).json({ error: "Failed to list Level7 OKRs" });
  }
}

export async function get(req, res) {
  const { id } = req.params;
  try {
    let doc = null;
    if (mongoose.isValidObjectId(id)) {
      doc = await Level7OKR.findById(id);
    } else {
      doc = await Level7OKR.findOne({ [codeField]: Number(id) });
    }
    if (!doc) return res.status(404).json({ error: "Not found" });
    res.json({ data: doc });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch Level7 OKR" });
  }
}

export async function create(req, res) {
  try {
    const payload = req.body;
    const doc = new Level7OKR(payload);
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
      doc = await Level7OKR.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    } else {
      doc = await Level7OKR.findOneAndUpdate({ [codeField]: Number(id) }, req.body, { new: true, runValidators: true });
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
      doc = await Level7OKR.findByIdAndDelete(id);
    } else {
      doc = await Level7OKR.findOneAndDelete({ [codeField]: Number(id) });
    }
    if (!doc) return res.status(404).json({ error: "Not found" });
    res.json({ data: doc });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete" });
  }
}
