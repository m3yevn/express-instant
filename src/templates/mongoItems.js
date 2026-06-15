import { ObjectId } from "mongodb";
import dbService from "./services/dbService.js";

function parseId(id) {
  if (ObjectId.isValid(id)) {
    return new ObjectId(id);
  }
  return id;
}

export const mongoItems = async (req, res, next) => {
  try {
    if (!dbService.db) {
      return res.status(503).json({
        success: false,
        error: "DATABASE_UNAVAILABLE",
        message: "mongoDB must be enabled in config.",
      });
    }

    const collectionName = req.params.collection || "items";
    const collection = dbService.db.collection(collectionName);

    if (req.method === "GET" && !req.params.id) {
      const items = await collection.find({}).limit(200).toArray();
      return res.json({ success: true, items });
    }

    if (req.method === "GET" && req.params.id) {
      const item = await collection.findOne({ _id: parseId(req.params.id) });
      if (!item) {
        return res.status(404).json({ success: false, message: "Not found" });
      }
      return res.json({ success: true, item });
    }

    if (req.method === "POST") {
      const doc = { ...req.body, createdAt: new Date() };
      const result = await collection.insertOne(doc);
      const item = await collection.findOne({ _id: result.insertedId });
      return res.status(201).json({ success: true, item });
    }

    if (req.method === "PUT" && req.params.id) {
      const { _id, ...updates } = req.body;
      const result = await collection.findOneAndUpdate(
        { _id: parseId(req.params.id) },
        { $set: { ...updates, updatedAt: new Date() } },
        { returnDocument: "after" }
      );
      if (!result) {
        return res.status(404).json({ success: false, message: "Not found" });
      }
      return res.json({ success: true, item: result });
    }

    if (req.method === "DELETE" && req.params.id) {
      const result = await collection.findOneAndDelete({
        _id: parseId(req.params.id),
      });
      if (!result) {
        return res.status(404).json({ success: false, message: "Not found" });
      }
      return res.json({ success: true, item: result });
    }

    return res.status(405).json({ success: false, message: "Method not allowed" });
  } catch (ex) {
    next(ex);
  }
};
