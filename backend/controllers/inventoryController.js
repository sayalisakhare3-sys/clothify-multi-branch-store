const db = require("../config/db");

// ==========================================
// GET ALL INVENTORY
// ==========================================
const getInventory = async (req, res) => {
  try {
    const inventory = await db.orm.public.Inventory.all();

    return res.status(200).json({
      success: true,
      count: inventory.length,
      inventory,
    });
  } catch (error) {
    console.error("Get inventory error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch inventory",
      error: error.message,
    });
  }
};

// ==========================================
// GET INVENTORY BY ID
// ==========================================
const getInventoryById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid inventory ID",
      });
    }

    const inventory = await db.orm.public.Inventory.first({
      id: id,
    });

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: "Inventory record not found",
      });
    }

    return res.status(200).json({
      success: true,
      inventory,
    });
  } catch (error) {
    console.error("Get inventory by ID error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch inventory record",
      error: error.message,
    });
  }
};

// ==========================================
// GET INVENTORY BY BRANCH
// ==========================================
const getInventoryByBranch = async (req, res) => {
  try {
    const branchId = Number(req.params.branchId);

    if (!Number.isInteger(branchId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid branch ID",
      });
    }

    const inventory = await db.orm.public.Inventory.where({
      branchId: branchId,
    }).all();

    return res.status(200).json({
      success: true,
      count: inventory.length,
      inventory,
    });
  } catch (error) {
    console.error("Get inventory by branch error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch branch inventory",
      error: error.message,
    });
  }
};

// ==========================================
// GET INVENTORY BY VARIANT
// ==========================================
const getInventoryByVariant = async (req, res) => {
  try {
    const variantId = Number(req.params.variantId);

    if (!Number.isInteger(variantId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid variant ID",
      });
    }

    const inventory = await db.orm.public.Inventory.where({
      variantId: variantId,
    }).all();

    return res.status(200).json({
      success: true,
      count: inventory.length,
      inventory,
    });
  } catch (error) {
    console.error("Get inventory by variant error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch variant inventory",
      error: error.message,
    });
  }
};

// ==========================================
// CREATE INVENTORY
// ==========================================
const createInventory = async (req, res) => {
  try {
    const {
      branchId,
      variantId,
      quantity,
      reorderLevel,
    } = req.body;

    // -----------------------------
    // Validation
    // -----------------------------
    if (!branchId || !variantId) {
      return res.status(400).json({
        success: false,
        message: "branchId and variantId are required",
      });
    }

    const parsedBranchId = Number(branchId);
    const parsedVariantId = Number(variantId);
    const parsedQuantity = quantity === undefined ? 0 : Number(quantity);
    const parsedReorderLevel =
      reorderLevel === undefined ? 5 : Number(reorderLevel);

    if (
      !Number.isInteger(parsedBranchId) ||
      !Number.isInteger(parsedVariantId)
    ) {
      return res.status(400).json({
        success: false,
        message: "branchId and variantId must be valid numbers",
      });
    }

    if (
      !Number.isInteger(parsedQuantity) ||
      parsedQuantity < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "quantity must be a non-negative integer",
      });
    }

    if (
      !Number.isInteger(parsedReorderLevel) ||
      parsedReorderLevel < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "reorderLevel must be a non-negative integer",
      });
    }

    // -----------------------------
    // Check branch
    // -----------------------------
    const branch = await db.orm.public.Branch.first({
      id: parsedBranchId,
    });

    if (!branch) {
      return res.status(404).json({
        success: false,
        message: "Branch not found",
      });
    }

    // -----------------------------
    // Check variant
    // -----------------------------
    const variant = await db.orm.public.ProductVariant.first({
      id: parsedVariantId,
    });

    if (!variant) {
      return res.status(404).json({
        success: false,
        message: "Product variant not found",
      });
    }

    // -----------------------------
    // Prevent duplicate inventory
    // -----------------------------
    const existingInventory =
      await db.orm.public.Inventory.where({
        branchId: parsedBranchId,
        variantId: parsedVariantId,
      }).first();

    if (existingInventory) {
      return res.status(409).json({
        success: false,
        message:
          "Inventory already exists for this branch and product variant",
      });
    }

    // -----------------------------
    // Create inventory
    // -----------------------------
    const inventory = await db.orm.public.Inventory.create({
      branchId: parsedBranchId,
      variantId: parsedVariantId,
      quantity: parsedQuantity,
      reorderLevel: parsedReorderLevel,
    });

    return res.status(201).json({
      success: true,
      message: "Inventory created successfully",
      inventory,
    });
  } catch (error) {
    console.error("Create inventory error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create inventory",
      error: error.message,
    });
  }
};

// ==========================================
// UPDATE INVENTORY
// ==========================================
const updateInventory = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid inventory ID",
      });
    }

    const {
      branchId,
      variantId,
      quantity,
      reorderLevel,
    } = req.body;

    // -----------------------------
    // Check existing inventory
    // -----------------------------
    const existingInventory =
      await db.orm.public.Inventory.first({
        id: id,
      });

    if (!existingInventory) {
      return res.status(404).json({
        success: false,
        message: "Inventory record not found",
      });
    }

    const parsedBranchId =
      branchId === undefined
        ? existingInventory.branchId
        : Number(branchId);

    const parsedVariantId =
      variantId === undefined
        ? existingInventory.variantId
        : Number(variantId);

    const parsedQuantity =
      quantity === undefined
        ? existingInventory.quantity
        : Number(quantity);

    const parsedReorderLevel =
      reorderLevel === undefined
        ? existingInventory.reorderLevel
        : Number(reorderLevel);

    // -----------------------------
    // Validation
    // -----------------------------
    if (
      !Number.isInteger(parsedBranchId) ||
      !Number.isInteger(parsedVariantId)
    ) {
      return res.status(400).json({
        success: false,
        message: "branchId and variantId must be valid numbers",
      });
    }

    if (
      !Number.isInteger(parsedQuantity) ||
      parsedQuantity < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "quantity must be a non-negative integer",
      });
    }

    if (
      !Number.isInteger(parsedReorderLevel) ||
      parsedReorderLevel < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "reorderLevel must be a non-negative integer",
      });
    }

    // -----------------------------
    // Check branch
    // -----------------------------
    const branch = await db.orm.public.Branch.first({
      id: parsedBranchId,
    });

    if (!branch) {
      return res.status(404).json({
        success: false,
        message: "Branch not found",
      });
    }

    // -----------------------------
    // Check variant
    // -----------------------------
    const variant = await db.orm.public.ProductVariant.first({
      id: parsedVariantId,
    });

    if (!variant) {
      return res.status(404).json({
        success: false,
        message: "Product variant not found",
      });
    }

    // -----------------------------
    // Check duplicate combination
    // -----------------------------
    const duplicateInventory =
      await db.orm.public.Inventory
        .where({
          branchId: parsedBranchId,
          variantId: parsedVariantId,
        })
        .first();

    if (
      duplicateInventory &&
      duplicateInventory.id !== id
    ) {
      return res.status(409).json({
        success: false,
        message:
          "Another inventory record already exists for this branch and variant",
      });
    }

    // -----------------------------
    // Update inventory
    // -----------------------------
    const inventory =
      await db.orm.public.Inventory
        .where({
          id: id,
        })
        .update({
          branchId: parsedBranchId,
          variantId: parsedVariantId,
          quantity: parsedQuantity,
          reorderLevel: parsedReorderLevel,
        });

    return res.status(200).json({
      success: true,
      message: "Inventory updated successfully",
      inventory,
    });
  } catch (error) {
    console.error("Update inventory error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update inventory",
      error: error.message,
    });
  }
};

// ==========================================
// UPDATE INVENTORY QUANTITY
// ==========================================
const updateInventoryQuantity = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { quantity } = req.body;

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid inventory ID",
      });
    }

    const parsedQuantity = Number(quantity);

    if (
      !Number.isInteger(parsedQuantity) ||
      parsedQuantity < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "quantity must be a non-negative integer",
      });
    }

    const existingInventory =
      await db.orm.public.Inventory.first({
        id: id,
      });

    if (!existingInventory) {
      return res.status(404).json({
        success: false,
        message: "Inventory record not found",
      });
    }

    const inventory =
      await db.orm.public.Inventory
        .where({
          id: id,
        })
        .update({
          quantity: parsedQuantity,
        });

    return res.status(200).json({
      success: true,
      message: "Inventory quantity updated successfully",
      inventory,
    });
  } catch (error) {
    console.error("Update inventory quantity error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update inventory quantity",
      error: error.message,
    });
  }
};

// ==========================================
// DELETE INVENTORY
// ==========================================
const deleteInventory = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid inventory ID",
      });
    }

    const existingInventory =
      await db.orm.public.Inventory.first({
        id: id,
      });

    if (!existingInventory) {
      return res.status(404).json({
        success: false,
        message: "Inventory record not found",
      });
    }

    await db.orm.public.Inventory
      .where({
        id: id,
      })
      .delete();

    return res.status(200).json({
      success: true,
      message: "Inventory deleted successfully",
    });
  } catch (error) {
    console.error("Delete inventory error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete inventory",
      error: error.message,
    });
  }
};

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