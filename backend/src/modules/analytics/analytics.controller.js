const db = require("../../config/db");
const { getScopedBranchId } = require("../sales/sales.service");

function sendError(res, error, message) {
  if (!error.statusCode || error.statusCode >= 500) {
    console.error(`${message}:`, error);
  }
  return res.status(error.statusCode || 500).json({
    success: false,
    message: error.statusCode && error.statusCode < 500 ? error.message : message,
  });
}

async function getRestockRecommendations(req, res) {
  try {
    const branchId = getScopedBranchId(req.user, req.query.branchId);
    const inventory = await db.inventory.findMany({
      where: branchId ? { branchId } : {},
      include: {
        branch: { select: { id: true, name: true } },
        variant: {
          include: { product: { select: { id: true, name: true, sku: true } } },
        },
      },
      orderBy: [{ quantity: "asc" }, { updatedAt: "asc" }],
    });
    const lowInventory = inventory.filter((item) => item.quantity <= item.reorderLevel);
    return res.json({
      success: true,
      count: lowInventory.length,
      recommendations: lowInventory.map((item) => ({
        ...item,
        suggestedQuantity: Math.max(item.reorderLevel * 2 - item.quantity, 1),
      })),
    });
  } catch (error) {
    return sendError(res, error, "Failed to calculate restock recommendations");
  }
}

async function getVariantDemand(req, res) {
  try {
    const branchId = getScopedBranchId(req.user, req.query.branchId);
    const days = Number(req.query.days ?? 30);
    if (!Number.isInteger(days) || days < 1 || days > 365) {
      return res.status(400).json({ success: false, message: "days must be between 1 and 365" });
    }
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const [variants, soldItems] = await Promise.all([
      db.productVariant.findMany({
        where: { isActive: true },
        include: { product: { select: { id: true, name: true, sku: true } } },
        orderBy: { productId: "asc" },
      }),
      db.saleItem.findMany({
        where: {
          sale: {
            status: "COMPLETED",
            createdAt: { gte: since },
            ...(branchId ? { branchId } : {}),
          },
        },
        select: {
          variantId: true,
          quantity: true,
          returns: {
            where: { saleReturn: { createdAt: { gte: since } } },
            select: { quantity: true },
          },
        },
      }),
    ]);
    const counts = new Map();
    for (const item of soldItems) {
      const returned = item.returns.reduce((sum, entry) => sum + entry.quantity, 0);
      const netQuantity = Math.max(0, item.quantity - returned);
      counts.set(item.variantId, (counts.get(item.variantId) || 0) + netQuantity);
    }
    const rows = variants.map((variant) => ({
      variantId: variant.id,
      productId: variant.productId,
      product: variant.product.name,
      productSku: variant.product.sku,
      size: variant.size,
      color: variant.color,
      sku: variant.sku,
      unitsSold: counts.get(variant.id) || 0,
      averageUnitsPerDay: Number(((counts.get(variant.id) || 0) / days).toFixed(2)),
    }));
    const ranked = [...rows].filter((row) => row.unitsSold > 0).sort((a, b) => a.unitsSold - b.unitsSold);
    const slowThreshold = ranked.length ? ranked[Math.floor((ranked.length - 1) * 0.25)].unitsSold : 0;
    const fastThreshold = ranked.length ? ranked[Math.ceil((ranked.length - 1) * 0.75)].unitsSold : 0;
    const variantsWithDemand = rows.map((row) => ({
      ...row,
      demand: row.unitsSold === 0 ? "NO_SALES" : row.unitsSold >= fastThreshold ? "FAST" : row.unitsSold <= slowThreshold ? "SLOW" : "STEADY",
    }));
    return res.json({
      success: true,
      days,
      totalUnitsSold: soldItems.reduce((sum, item) => {
        const returned = item.returns.reduce((total, entry) => total + entry.quantity, 0);
        return sum + Math.max(0, item.quantity - returned);
      }, 0),
      variants: variantsWithDemand,
    });
  } catch (error) {
    return sendError(res, error, "Failed to analyze variant demand");
  }
}

module.exports = { getRestockRecommendations, getVariantDemand };
