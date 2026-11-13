const db = require("../../config/db");

async function getDashboardStats(user) {
  const branchId = user.role === "CASHIER" ? Number(user.branchId) : undefined;
  if (user.role === "CASHIER" && (!Number.isInteger(branchId) || branchId <= 0)) {
    const error = new Error("Your account is not assigned to a branch");
    error.statusCode = 403;
    throw error;
  }

  const saleScope = branchId ? { branchId } : {};
  const cashierScope = branchId ? { cashierId: Number(user.userId) } : {};
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayScope = { createdAt: { gte: startOfToday } };

  const [
    totalCustomers,
    totalProducts,
    totalBranches,
    totalOrders,
    completedSales,
    todaySales,
    todayOrders,
    inventory,
    recentSales,
  ] = await Promise.all([
    db.customer.count(),
    db.product.count(),
    db.branch.count({ where: { isActive: true } }),
    db.sale.count({ where: { ...saleScope, ...cashierScope } }),
    db.sale.aggregate({
      where: { ...saleScope, ...cashierScope, status: "COMPLETED" },
      _sum: { total: true },
    }),
    db.sale.aggregate({
      where: { ...saleScope, ...cashierScope, status: "COMPLETED", ...todayScope },
      _sum: { total: true },
      _count: { _all: true },
    }),
    db.sale.count({
      where: { ...saleScope, ...cashierScope, status: "COMPLETED", ...todayScope },
    }),
    db.inventory.findMany({
      where: branchId ? { branchId } : {},
      include: {
        branch: { select: { id: true, name: true } },
        variant: {
          include: {
            product: { select: { id: true, name: true, sku: true } },
          },
        },
      },
      orderBy: [{ quantity: "asc" }, { updatedAt: "asc" }],
    }),
    db.sale.findMany({
      where: { ...saleScope, ...cashierScope, status: "COMPLETED" },
      include: {
        customer: { select: { id: true, name: true } },
        branch: { select: { id: true, name: true } },
        items: {
          include: { variant: { include: { product: { select: { name: true } } } } },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const lowStockItems = inventory
    .filter((item) => item.quantity <= item.reorderLevel)
    .slice(0, 8);

  return {
    totalSales: completedSales._sum.total || 0,
    totalOrders,
    totalCustomers,
    totalProducts,
    lowStockProducts: inventory.filter((item) => item.quantity <= item.reorderLevel).length,
    totalBranches,
    todaySales: todaySales._sum.total || 0,
    todayOrders,
    recentSales,
    lowStockItems,
  };
}

module.exports = { getDashboardStats };
