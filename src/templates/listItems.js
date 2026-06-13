const store = new Map();

export const listItems = (req, res, next) => {
  try {
    const collection = req.params.collection || "default";
    if (!store.has(collection)) {
      store.set(collection, []);
    }
    const items = store.get(collection);

    if (req.method === "GET" && !req.params.id) {
      return res.json({ success: true, items });
    }

    if (req.method === "GET" && req.params.id) {
      const item = items.find((i) => i.id === req.params.id);
      if (!item) {
        return res.status(404).json({ success: false, message: "Not found" });
      }
      return res.json({ success: true, item });
    }

    if (req.method === "POST") {
      const item = { id: crypto.randomUUID(), ...req.body, createdAt: new Date() };
      items.push(item);
      return res.status(201).json({ success: true, item });
    }

    if (req.method === "PUT" && req.params.id) {
      const index = items.findIndex((i) => i.id === req.params.id);
      if (index === -1) {
        return res.status(404).json({ success: false, message: "Not found" });
      }
      items[index] = { ...items[index], ...req.body, updatedAt: new Date() };
      return res.json({ success: true, item: items[index] });
    }

    if (req.method === "DELETE" && req.params.id) {
      const index = items.findIndex((i) => i.id === req.params.id);
      if (index === -1) {
        return res.status(404).json({ success: false, message: "Not found" });
      }
      const [removed] = items.splice(index, 1);
      return res.json({ success: true, item: removed });
    }

    return res.status(405).json({ success: false, message: "Method not allowed" });
  } catch (ex) {
    next(ex);
  }
};
