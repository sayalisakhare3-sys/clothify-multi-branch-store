const db = require("../../config/db");

function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function sendError(res, error, message) {
  if (error.code === "P2002") {
    return res.status(409).json({ success: false, message: "Inventory already exists for this branch and variant" });
  }
  if (error.code === "P2003" || error.code === "P2014") {
    return res.status(409).json({ success: false, message: "Inventory is linked to sales and cannot be deleted" });
  }
  console.error(`${message}:`, error);
  return res.status(500).json({ success: false, message });
}

function parseStock(value, field) {
  const number = Number(value);
  return Number.isInteger(number) && number >= 0 && number <= 2_147_483_647
    ? number
    : null;
}

async function getInventory(_req, res) {
  try {
    const inventory = await db.inventory.findMany({ orderBy: { id: "asc" } });
    return res.json({ success: true, count: inventory.length, inventory, data: inventory });
  } catch (error) {
    return sendError(res, error, "Failed to fetch inventory");
  }
}

async function getInventoryById(req, res) {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ success: false, message: "Invalid inventory ID" });
  try {
    const inventory = await db.inventory.findUnique({ where: { id } });
    if (!inventory) return res.status(404).json({ success: false, message: "Inventory record not found" });
    return res.json({ success: true, inventory });
  } catch (error) {
    return sendError(res, error, "Failed to fetch inventory record");
  }
}

async function getInventoryByBranch(req, res) {
  const branchId = parseId(req.params.branchId);
  if (!branchId) return res.status(400).json({ success: false, message: "Invalid branch ID" });
  try {
    const inventory = await db.inventory.findMany({ where: { branchId }, orderBy: { id: "asc" } });
    return res.json({ success: true, count: inventory.length, inventory, data: inventory });
  } catch (error) {
    return sendError(res, error, "Failed to fetch branch inventory");
  }
}

async function getInventoryByVariant(req, res) {
  const variantId = parseId(req.params.variantId);
  if (!variantId) return res.status(400).json({ success: false, message: "Invalid variant ID" });
  try {
    const inventory = await db.inventory.findMany({ where: { variantId }, orderBy: { id: "asc" } });
    return res.json({ success: true, count: inventory.length, inventory, data: inventory });
  } catch (error) {
    return sendError(res, error, "Failed to fetch variant inventory");
  }
}

async function createInventory(req, res) {
  const branchId = parseId(req.body?.branchId);
  const variantId = parseId(req.body?.variantId);
  const quantity = req.body?.quantity === undefined ? 0 : parseStock(req.body.quantity, "quantity");
  const reorderLevel = req.body?.reorderLevel === undefined ? 5 : parseStock(req.body.reorderLevel, "reorderLevel");
  if (!branchId || !variantId) {
    return res.status(400).json({ success: false, message: "Valid branchId and variantId are required" });
  }
  if (quantity === null || reorderLevel === null) {
    return res.status(400).json({ success: false, message: "quantity and reorderLevel must be non-negative whole numbers" });
  }
  try {
    const [branch, variant] = await Promise.all([
      db.branch.findUnique({ where: { id: branchId }, select: { id: true } }),
      db.productVariant.findUnique({ where: { id: variantId }, select: { id: true } }),
    ]);
    if (!branch) return res.status(404).json({ success: false, message: "Branch not found" });
    if (!variant) return res.status(404).json({ success: false, message: "Product variant not found" });
    const inventory = await db.inventory.create({ data: { branchId, variantId, quantity, reorderLevel } });
    return res.status(201).json({ success: true, message: "Inventory created successfully", inventory, data: inventory });
  } catch (error) {
    return sendError(res, error, "Failed to create inventory");
  }
}

async function updateInventory(req, res) {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ success: false, message: "Invalid inventory ID" });
  try {
    const existing = await db.inventory.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ success: false, message: "Inventory record not found" });

    const branchId = req.body?.branchId === undefined ? existing.branchId : parseId(req.body.branchId);
    const variantId = req.body?.variantId === undefined ? existing.variantId : parseId(req.body.variantId);
    const quantity = req.body?.quantity === undefined ? existing.quantity : parseStock(req.body.quantity, "quantity");
    const reorderLevel = req.body?.reorderLevel === undefined ? existing.reorderLevel : parseStock(req.body.reorderLevel, "reorderLevel");
    if (!branchId || !variantId || quantity === null || reorderLevel === null) {
      return res.status(400).json({ success: false, message: "Branch, variant, quantity and reorder level must be valid" });
    }

    const [branch, variant] = await Promise.all([
      db.branch.findUnique({ where: { id: branchId }, select: { id: true } }),
      db.productVariant.findUnique({ where: { id: variantId }, select: { id: true } }),
    ]);
    if (!branch) return res.status(404).json({ success: false, message: "Branch not found" });
    if (!variant) return res.status(404).json({ success: false, message: "Product variant not found" });

    const inventory = await db.inventory.update({
      where: { id },
      data: { branchId, variantId, quantity, reorderLevel },
    });
    return res.json({ success: true, message: "Inventory updated successfully", inventory, data: inventory });
  } catch (error) {
    return sendError(res, error, "Failed to update inventory");
  }
}

async function updateInventoryQuantity(req, res) {
  const id = parseId(req.params.id);
  const quantity = parseStock(req.body?.quantity, "quantity");
  if (!id) return res.status(400).json({ success: false, message: "Invalid inventory ID" });
  if (quantity === null) return res.status(400).json({ success: false, message: "quantity must be a non-negative whole number" });
  try {
    const result = await db.inventory.updateMany({ where: { id }, data: { quantity } });
    if (result.count === 0) return res.status(404).json({ success: false, message: "Inventory record not found" });
    const inventory = await db.inventory.findUnique({ where: { id } });
    return res.json({ success: true, message: "Inventory quantity updated successfully", inventory, data: inventory });
  } catch (error) {
    return sendError(res, error, "Failed to update inventory quantity");
  }
}

async function deleteInventory(req, res) {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ success: false, message: "Invalid inventory ID" });
  try {
    const result = await db.inventory.deleteMany({ where: { id } });
    if (result.count === 0) return res.status(404).json({ success: false, message: "Inventory record not found" });
    return res.json({ success: true, message: "Inventory deleted successfully" });
  } catch (error) {
    return sendError(res, error, "Failed to delete inventory");
  }
}

module.exports = {
  getInventory,
  getInventoryById,
  getInventoryByBranch,
  getInventoryByVariant,
  createInventory,
  updateInventory,
  updateInventoryQuantity,
  deleteInventory,
};
