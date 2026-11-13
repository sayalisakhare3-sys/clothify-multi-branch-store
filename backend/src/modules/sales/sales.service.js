const { randomUUID } = require("node:crypto");
const db = require("../../config/db");

const saleInclude = {
  customer: true,
  branch: true,
  cashier: { select: { id: true, name: true, email: true } },
  items: {
    include: {
      variant: { include: { product: true } },
      returns: { select: { quantity: true, refundAmount: true, saleReturn: { select: { id: true } } } },
    },
    orderBy: { id: "asc" },
  },
  returns: {
    include: {
      items: true,
      replacementSale: { select: { id: true, invoiceNumber: true, total: true } },
    },
    orderBy: { createdAt: "desc" },
  },
};

const money = (value) => Number(value.toFixed(2));

function createInvoiceNumber() {
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  return `CLF-${date}-${randomUUID().slice(0, 8).toUpperCase()}`;
}

function getScopedBranchId(user, requestedBranchId) {
  if (user.role === "CASHIER") {
    if (!Number.isInteger(Number(user.branchId)) || Number(user.branchId) <= 0) {
      const error = new Error("Your account is not assigned to a branch");
      error.statusCode = 403;
      throw error;
    }
    return Number(user.branchId);
  }

  if (requestedBranchId === undefined || requestedBranchId === null || requestedBranchId === "") {
    return null;
  }

  const branchId = Number(requestedBranchId);
  if (!Number.isInteger(branchId) || branchId <= 0) {
    const error = new Error("Invalid branch ID");
    error.statusCode = 400;
    throw error;
  }
  return branchId;
}

function ensureUserId(user) {
  const userId = Number(user.userId);
  if (!Number.isInteger(userId) || userId <= 0) {
    const error = new Error("Invalid authenticated user");
    error.statusCode = 401;
    throw error;
  }
  return userId;
}

async function ensureActiveBranch(client, branchId) {
  const branch = await client.branch.findUnique({ where: { id: branchId } });
  if (!branch || !branch.isActive) {
    const error = new Error("Active branch not found");
    error.statusCode = 404;
    throw error;
  }
  return branch;
}

async function getPosCatalog(user, { branchId: requestedBranchId, search = "" }) {
  const branchId = getScopedBranchId(user, requestedBranchId);
  if (!branchId) {
    const error = new Error("Select a branch to load the point-of-sale catalog");
    error.statusCode = 400;
    throw error;
  }
  await ensureActiveBranch(db, branchId);

  const term = String(search).trim();
  const products = await db.product.findMany({
    where: {
      variants: {
        some: {
          isActive: true,
          inventory: { some: { branchId, quantity: { gt: 0 } } },
        },
      },
    },
    include: {
      variants: {
        where: {
          isActive: true,
          inventory: { some: { branchId, quantity: { gt: 0 } } },
        },
        include: { inventory: { where: { branchId }, select: { quantity: true } } },
        orderBy: [{ size: "asc" }, { color: "asc" }],
      },
    },
    orderBy: { name: "asc" },
  });

  const normalizedTerm = term.toLowerCase();
  const matchingProducts = term
    ? products.flatMap((product) => {
        if (
          product.name.toLowerCase().includes(normalizedTerm) ||
          product.sku.toLowerCase().includes(normalizedTerm)
        ) {
          return [product];
        }
        const matchingVariants = product.variants.filter((variant) =>
          [variant.sku, variant.size, variant.color].some((value) =>
            value.toLowerCase().includes(normalizedTerm)
          )
        );
        return matchingVariants.length ? [{ ...product, variants: matchingVariants }] : [];
      })
    : products;

  return {
    branchId,
    products: matchingProducts.map((product) => ({
      id: product.id,
      name: product.name,
      sku: product.sku,
      variants: product.variants.map((variant) => ({
        id: variant.id,
        size: variant.size,
        color: variant.color,
        sku: variant.sku,
        price: variant.price,
        quantity: variant.inventory[0]?.quantity ?? 0,
      })),
    })),
  };
}

async function createSale(user, input) {
  const cashierId = ensureUserId(user);
  const branchId = getScopedBranchId(user, input.branchId);
  if (!branchId) {
    const error = new Error("A branch is required to complete a sale");
    error.statusCode = 400;
    throw error;
  }

  const paymentMethod = String(input.paymentMethod || "").toUpperCase();
  if (!["CASH", "CARD", "UPI", "OTHER"].includes(paymentMethod)) {
    const error = new Error("Choose a valid payment method");
    error.statusCode = 400;
    throw error;
  }
  if (!Array.isArray(input.items) || input.items.length === 0 || input.items.length > 100) {
    const error = new Error("Add between 1 and 100 sale items");
    error.statusCode = 400;
    throw error;
  }

  const quantities = new Map();
  for (const item of input.items) {
    const variantId = Number(item?.variantId);
    const quantity = Number(item?.quantity);
    if (
      !Number.isInteger(variantId) ||
      variantId <= 0 ||
      !Number.isSafeInteger(quantity) ||
      quantity <= 0 ||
      quantity > 2_147_483_647
    ) {
      const error = new Error("Each item needs a valid variant and positive whole-number quantity");
      error.statusCode = 400;
      throw error;
    }
    quantities.set(variantId, (quantities.get(variantId) || 0) + quantity);
  }

  const discount = Number(input.discount ?? 0);
  if (!Number.isFinite(discount) || discount < 0) {
    const error = new Error("Discount must be a non-negative amount");
    error.statusCode = 400;
    throw error;
  }
  const customerId = input.customerId === undefined || input.customerId === null || input.customerId === ""
    ? null
    : Number(input.customerId);
  if (customerId !== null && (!Number.isInteger(customerId) || customerId <= 0)) {
    const error = new Error("Invalid customer ID");
    error.statusCode = 400;
    throw error;
  }

  return db.$transaction(async (tx) => {
    await ensureActiveBranch(tx, branchId);
    if (customerId !== null && !(await tx.customer.findUnique({ where: { id: customerId }, select: { id: true } }))) {
      const error = new Error("Customer not found");
      error.statusCode = 404;
      throw error;
    }

    const variants = await tx.productVariant.findMany({
      where: { id: { in: [...quantities.keys()] }, isActive: true },
      include: { inventory: { where: { branchId } } },
    });
    if (variants.length !== quantities.size) {
      const error = new Error("One or more selected variants are unavailable");
      error.statusCode = 400;
      throw error;
    }

    const subtotal = money(variants.reduce((sum, variant) => {
      return sum + variant.price * quantities.get(variant.id);
    }, 0));
    if (discount > subtotal) {
      const error = new Error("Discount cannot exceed the sale subtotal");
      error.statusCode = 400;
      throw error;
    }

    for (const variant of variants) {
      const inventory = variant.inventory[0];
      const quantity = quantities.get(variant.id);
      if (!inventory || inventory.quantity < quantity) {
        const error = new Error(`Insufficient stock for ${variant.sku}`);
        error.statusCode = 409;
        throw error;
      }
      const changed = await tx.inventory.updateMany({
        where: { id: inventory.id, quantity: { gte: quantity } },
        data: { quantity: { decrement: quantity } },
      });
      if (changed.count !== 1) {
        const error = new Error(`Stock changed during checkout for ${variant.sku}; refresh and try again`);
        error.statusCode = 409;
        throw error;
      }
    }

    const items = variants.map((variant) => {
      const quantity = quantities.get(variant.id);
      return {
        variantId: variant.id,
        quantity,
        unitPrice: variant.price,
        discount: 0,
        total: money(variant.price * quantity),
      };
    });

    const sale = await tx.sale.create({
      data: {
        invoiceNumber: createInvoiceNumber(),
        branchId,
        cashierId,
        customerId,
        subtotal,
        discount: money(discount),
        tax: 0,
        total: money(subtotal - discount),
        paymentMethod,
        status: "COMPLETED",
        items: { create: items },
      },
      include: saleInclude,
    });
    return sale;
  });
}

async function listSales(user, { search = "", branchId: requestedBranchId, limit = 100 } = {}) {
  const scopedBranchId = getScopedBranchId(user, requestedBranchId);
  const where = {};
  if (scopedBranchId) where.branchId = scopedBranchId;
  if (user.role === "CASHIER") where.cashierId = ensureUserId(user);
  const term = String(search).trim();
  if (term) where.invoiceNumber = { contains: term, mode: "insensitive" };
  return db.sale.findMany({
    where,
    include: {
      customer: true,
      branch: true,
      cashier: { select: { id: true, name: true } },
      items: {
        include: { variant: { include: { product: true } } },
        orderBy: { id: "asc" },
      },
      returns: { select: { id: true, type: true, refundAmount: true, amountDue: true } },
    },
    orderBy: { createdAt: "desc" },
    take: Math.min(Math.max(Number(limit) || 100, 1), 100),
  });
}

async function getSaleById(user, saleId) {
  const id = Number(saleId);
  if (!Number.isInteger(id) || id <= 0) {
    const error = new Error("Invalid sale ID");
    error.statusCode = 400;
    throw error;
  }
  const where = { id };
  if (user.role === "CASHIER") {
    where.cashierId = ensureUserId(user);
    where.branchId = Number(user.branchId);
  }
  const sale = await db.sale.findFirst({ where, include: saleInclude });
  if (!sale) {
    const error = new Error("Sale not found");
    error.statusCode = 404;
    throw error;
  }
  return sale;
}

async function createReturn(user, saleId, input) {
  const id = Number(saleId);
  const cashierId = ensureUserId(user);
  if (!Number.isInteger(id) || id <= 0) {
    const error = new Error("Invalid sale ID");
    error.statusCode = 400;
    throw error;
  }
  const type = String(input.type || "RETURN").toUpperCase();
  if (!["RETURN", "EXCHANGE"].includes(type)) {
    const error = new Error("Return type must be RETURN or EXCHANGE");
    error.statusCode = 400;
    throw error;
  }
  if (!Array.isArray(input.items) || input.items.length === 0) {
    const error = new Error("Select at least one item to return");
    error.statusCode = 400;
    throw error;
  }
  if (type === "EXCHANGE" && (!Array.isArray(input.replacementItems) || input.replacementItems.length === 0)) {
    const error = new Error("Select at least one replacement item for an exchange");
    error.statusCode = 400;
    throw error;
  }

  const requestedItems = new Map();
  for (const item of input.items) {
    const saleItemId = Number(item?.saleItemId);
    const quantity = Number(item?.quantity);
    if (
      !Number.isInteger(saleItemId) ||
      saleItemId <= 0 ||
      !Number.isSafeInteger(quantity) ||
      quantity <= 0 ||
      quantity > 2_147_483_647
    ) {
      const error = new Error("Each return item needs a valid sale item and positive whole-number quantity");
      error.statusCode = 400;
      throw error;
    }
    requestedItems.set(saleItemId, (requestedItems.get(saleItemId) || 0) + quantity);
  }

  const paymentMethod = String(input.paymentMethod || "CASH").toUpperCase();
  if (!["CASH", "CARD", "UPI", "OTHER"].includes(paymentMethod)) {
    const error = new Error("Choose a valid payment method");
    error.statusCode = 400;
    throw error;
  }

  return db.$transaction(async (tx) => {
    const saleWhere = { id };
    if (user.role === "CASHIER") {
      saleWhere.cashierId = cashierId;
      saleWhere.branchId = Number(user.branchId);
    }
    const sale = await tx.sale.findFirst({
      where: saleWhere,
      include: {
        items: { include: { returns: { select: { quantity: true } } } },
      },
    });
    if (!sale || sale.status !== "COMPLETED") {
      const error = new Error("Completed sale not found");
      error.statusCode = 404;
      throw error;
    }

    const grossItems = sale.items.reduce((sum, item) => sum + item.total, 0);
    const returnItems = [];
    let credit = 0;

    for (const [saleItemId, quantity] of requestedItems) {
      const saleItem = sale.items.find((item) => item.id === saleItemId);
      if (!saleItem) {
        const error = new Error("A selected item does not belong to this sale");
        error.statusCode = 400;
        throw error;
      }
      const alreadyReturned = saleItem.returns.reduce((sum, item) => sum + item.quantity, 0);
      if (quantity > saleItem.quantity - alreadyReturned) {
        const error = new Error(`Return quantity exceeds the remaining quantity for sale item ${saleItemId}`);
        error.statusCode = 409;
        throw error;
      }
      const lineGross = saleItem.total / saleItem.quantity * quantity;
      const allocatedSaleDiscount = grossItems > 0
        ? sale.discount * (saleItem.total / grossItems) * (quantity / saleItem.quantity)
        : 0;
      const refundAmount = money(Math.max(0, lineGross - allocatedSaleDiscount));
      credit = money(credit + refundAmount);
      returnItems.push({ saleItemId, quantity, refundAmount, variantId: saleItem.variantId });
    }

    for (const item of returnItems) {
      const changed = await tx.inventory.updateMany({
        where: { branchId: sale.branchId, variantId: item.variantId },
        data: { quantity: { increment: item.quantity } },
      });
      if (changed.count !== 1) {
        const error = new Error("Inventory record missing for a returned variant");
        error.statusCode = 409;
        throw error;
      }
    }

    let replacementSale = null;
    let amountDue = 0;
    let refundAmount = credit;
    const persistedReturnItems = returnItems.map(({ saleItemId, quantity, refundAmount: itemRefund }) => ({
      saleItemId,
      quantity,
      refundAmount: itemRefund,
    }));

    if (type === "EXCHANGE") {
      const replacementQuantities = new Map();
      for (const item of input.replacementItems) {
        const variantId = Number(item?.variantId);
        const quantity = Number(item?.quantity);
        if (
          !Number.isInteger(variantId) ||
          variantId <= 0 ||
          !Number.isSafeInteger(quantity) ||
          quantity <= 0 ||
          quantity > 2_147_483_647
        ) {
          const error = new Error("Each replacement needs a valid variant and positive whole-number quantity");
          error.statusCode = 400;
          throw error;
        }
        replacementQuantities.set(variantId, (replacementQuantities.get(variantId) || 0) + quantity);
      }
      const replacementVariants = await tx.productVariant.findMany({
        where: { id: { in: [...replacementQuantities.keys()] }, isActive: true },
        include: { inventory: { where: { branchId: sale.branchId } } },
      });
      if (replacementVariants.length !== replacementQuantities.size) {
        const error = new Error("One or more replacement variants are unavailable");
        error.statusCode = 400;
        throw error;
      }
      for (const variant of replacementVariants) {
        const quantity = replacementQuantities.get(variant.id);
        const inventory = variant.inventory[0];
        if (!inventory || inventory.quantity < quantity) {
          const error = new Error(`Insufficient stock for replacement ${variant.sku}`);
          error.statusCode = 409;
          throw error;
        }
        const changed = await tx.inventory.updateMany({
          where: { id: inventory.id, quantity: { gte: quantity } },
          data: { quantity: { decrement: quantity } },
        });
        if (changed.count !== 1) {
          const error = new Error(`Stock changed during exchange for ${variant.sku}; refresh and try again`);
          error.statusCode = 409;
          throw error;
        }
      }

      const replacementSubtotal = money(replacementVariants.reduce((sum, variant) => (
        sum + variant.price * replacementQuantities.get(variant.id)
      ), 0));
      const exchangeDiscount = money(Math.min(credit, replacementSubtotal));
      amountDue = money(Math.max(0, replacementSubtotal - exchangeDiscount));
      refundAmount = money(Math.max(0, credit - replacementSubtotal));
      replacementSale = await tx.sale.create({
        data: {
          invoiceNumber: createInvoiceNumber(),
          branchId: sale.branchId,
          cashierId,
          customerId: sale.customerId,
          subtotal: replacementSubtotal,
          discount: exchangeDiscount,
          tax: 0,
          total: amountDue,
          paymentMethod,
          status: "COMPLETED",
          items: {
            create: replacementVariants.map((variant) => {
              const quantity = replacementQuantities.get(variant.id);
              return {
                variantId: variant.id,
                quantity,
                unitPrice: variant.price,
                discount: 0,
                total: money(variant.price * quantity),
              };
            }),
          },
        },
        select: { id: true, invoiceNumber: true, subtotal: true, discount: true, total: true },
      });
    }

    return tx.saleReturn.create({
      data: {
        saleId: sale.id,
        replacementSaleId: replacementSale?.id ?? null,
        type,
        refundAmount,
        amountDue,
        reason: typeof input.reason === "string" && input.reason.trim() ? input.reason.trim() : null,
        items: { create: persistedReturnItems },
      },
      include: { items: true, replacementSale: true },
    });
  });
}

async function listReturns(user, { branchId: requestedBranchId } = {}) {
  const branchId = getScopedBranchId(user, requestedBranchId);
  const where = branchId ? { sale: { branchId } } : {};
  if (user.role === "CASHIER") {
    where.sale = { ...where.sale, cashierId: ensureUserId(user) };
  }
  return db.saleReturn.findMany({
    where,
    include: {
      sale: { select: { id: true, invoiceNumber: true, branch: true, customer: true } },
      replacementSale: { select: { id: true, invoiceNumber: true, total: true } },
      items: { include: { saleItem: { include: { variant: { include: { product: true } } } } } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}

module.exports = {
  createReturn,
  createSale,
  getPosCatalog,
  getSaleById,
  getScopedBranchId,
  listReturns,
  listSales,
};
