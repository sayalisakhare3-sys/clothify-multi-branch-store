const db = require("../../config/db");

function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function sendError(res, error, message) {
  if (error.code === "P2002") {
    return res.status(409).json({ success: false, message: "Variant SKU or product size/color already exists" });
  }
  if (error.code === "P2003" || error.code === "P2014") {
    return res.status(409).json({ success: false, message: "Variant is linked to inventory or sales and cannot be deleted" });
  }
  console.error(`${message}:`, error);
  return res.status(500).json({ success: false, message });
}

function parseVariantInput(body) {
  const productId = parseId(body.productId);
  const size = typeof body.size === "string" ? body.size.trim() : "";
  const color = typeof body.color === "string" ? body.color.trim() : "";
  const sku = typeof body.sku === "string" ? body.sku.trim() : "";
  const price = Number(body.price);
  const costPrice = body.costPrice === undefined || body.costPrice === "" || body.costPrice === null
    ? null
    : Number(body.costPrice);

  if (!productId || !size || !color || !sku || body.price === undefined) {
    return { error: "Product, size, color, SKU and price are required" };
  }
  if (!Number.isFinite(price) || price < 0) {
    return { error: "Price must be a non-negative number" };
  }
  if (costPrice !== null && (!Number.isFinite(costPrice) || costPrice < 0)) {
    return { error: "Cost price must be a non-negative number" };
  }
  return { data: { productId, size, color, sku, price, costPrice } };
}

async function getVariants(_req, res) {
  try {
    const data = await db.productVariant.findMany({ orderBy: { id: "asc" } });
    return res.json({ success: true, count: data.length, data, variants: data });
  } catch (error) {
    return sendError(res, error, "Failed to fetch variants");
  }
}

async function getVariantById(req, res) {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ success: false, message: "Invalid variant ID" });
  try {
    const data = await db.productVariant.findUnique({ where: { id } });
    if (!data) return res.status(404).json({ success: false, message: "Variant not found" });
    return res.json({ success: true, data, variant: data });
  } catch (error) {
    return sendError(res, error, "Failed to fetch variant");
  }
}

async function getVariantsByProduct(req, res) {
  const productId = parseId(req.params.productId);
  if (!productId) return res.status(400).json({ success: false, message: "Invalid product ID" });
  try {
    const data = await db.productVariant.findMany({ where: { productId }, orderBy: { id: "asc" } });
    return res.json({ success: true, count: data.length, data, variants: data });
  } catch (error) {
    return sendError(res, error, "Failed to fetch product variants");
  }
}

async function createVariant(req, res) {
  const parsed = parseVariantInput(req.body || {});
  if (parsed.error) return res.status(400).json({ success: false, message: parsed.error });
  try {
    const product = await db.product.findUnique({ where: { id: parsed.data.productId }, select: { id: true } });
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    const data = await db.productVariant.create({ data: { ...parsed.data, isActive: true } });
    return res.status(201).json({ success: true, message: "Variant created successfully", data, variant: data });
  } catch (error) {
    return sendError(res, error, "Failed to create variant");
  }
}

async function updateVariant(req, res) {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ success: false, message: "Invalid variant ID" });
  const parsed = parseVariantInput(req.body || {});
  if (parsed.error) return res.status(400).json({ success: false, message: parsed.error });
  try {
    const existing = await db.productVariant.findUnique({ where: { id }, select: { id: true } });
    if (!existing) return res.status(404).json({ success: false, message: "Variant not found" });
    const product = await db.product.findUnique({ where: { id: parsed.data.productId }, select: { id: true } });
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    const data = await db.productVariant.update({ where: { id }, data: parsed.data });
    return res.json({ success: true, message: "Variant updated successfully", data, variant: data });
  } catch (error) {
    return sendError(res, error, "Failed to update variant");
  }
}

async function updateVariantStatus(req, res) {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ success: false, message: "Invalid variant ID" });
  if (typeof req.body?.isActive !== "boolean") {
    return res.status(400).json({ success: false, message: "isActive must be true or false" });
  }
  try {
    const existing = await db.productVariant.findUnique({ where: { id }, select: { id: true } });
    if (!existing) return res.status(404).json({ success: false, message: "Variant not found" });
    const data = await db.productVariant.update({ where: { id }, data: { isActive: req.body.isActive } });
    return res.json({
      success: true,
      message: req.body.isActive ? "Variant activated successfully" : "Variant deactivated successfully",
      data,
      variant: data,
    });
  } catch (error) {
    return sendError(res, error, "Failed to update variant status");
  }
}

async function deleteVariant(req, res) {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ success: false, message: "Invalid variant ID" });
  try {
    const existing = await db.productVariant.findUnique({ where: { id }, select: { id: true } });
    if (!existing) return res.status(404).json({ success: false, message: "Variant not found" });
    await db.productVariant.delete({ where: { id } });
    return res.json({ success: true, message: "Variant deleted successfully" });
  } catch (error) {
    return sendError(res, error, "Failed to delete variant");
  }
}

module.exports = {
  getVariants,
  getVariantById,
  getVariantsByProduct,
  createVariant,
  updateVariant,
  updateVariantStatus,
  deleteVariant,
};
