const db = require("../config/db");

// GET all variants
const getVariants = async (req, res) => {
  try {
    const variants = await db.orm.public.ProductVariant.all();

    res.status(200).json({
      success: true,
      data: variants,
    });
  } catch (error) {
    console.error("Get variants error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch variants",
      error: error.message,
    });
  }
};

// GET variant by ID
const getVariantById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid variant ID",
      });
    }

    const variant = await db.orm.public.ProductVariant.first({
      id: id,
    });

    if (!variant) {
      return res.status(404).json({
        success: false,
        message: "Variant not found",
      });
    }

    res.status(200).json({
      success: true,
      data: variant,
    });
  } catch (error) {
    console.error("Get variant error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch variant",
      error: error.message,
    });
  }
};

// GET variants by product ID
const getVariantsByProduct = async (req, res) => {
  try {
    const productId = Number(req.params.productId);

    if (!Number.isInteger(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const variants = await db.orm.public.ProductVariant.where({
      productId: productId,
    }).all();

    res.status(200).json({
      success: true,
      data: variants,
    });
  } catch (error) {
    console.error("Get product variants error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch product variants",
      error: error.message,
    });
  }
};

// CREATE variant
const createVariant = async (req, res) => {
  try {
    const {
      productId,
      size,
      color,
      sku,
      price,
      costPrice,
    } = req.body;

    // Basic validation
    if (!productId || !size || !color || !sku || price === undefined) {
      return res.status(400).json({
        success: false,
        message: "Product, size, color, SKU and price are required",
      });
    }

    const parsedProductId = Number(productId);
    const parsedPrice = Number(price);

    if (!Number.isInteger(parsedProductId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be a valid positive number",
      });
    }

    // Check product exists
    const product = await db.orm.public.Product.first({
      id: parsedProductId,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Check duplicate SKU
    const existingSku = await db.orm.public.ProductVariant.first({
      sku: sku,
    });

    if (existingSku) {
      return res.status(409).json({
        success: false,
        message: "Variant SKU already exists",
      });
    }

    // Check duplicate size + color for same product
    const existingVariant =
      await db.orm.public.ProductVariant
        .where({
          productId: parsedProductId,
          size: size,
          color: color,
        })
        .first();

    if (existingVariant) {
      return res.status(409).json({
        success: false,
        message: "This size and color variant already exists for this product",
      });
    }

    const variant = await db.orm.public.ProductVariant.create({
      productId: parsedProductId,
      size: size,
      color: color,
      sku: sku,
      price: parsedPrice,
      costPrice:
        costPrice === undefined || costPrice === ""
          ? null
          : Number(costPrice),
      isActive: true,
    });

    res.status(201).json({
      success: true,
      message: "Variant created successfully",
      data: variant,
    });
  } catch (error) {
    console.error("Create variant error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create variant",
      error: error.message,
    });
  }
};

// UPDATE variant
const updateVariant = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const {
      productId,
      size,
      color,
      sku,
      price,
      costPrice,
    } = req.body;

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid variant ID",
      });
    }

    if (!productId || !size || !color || !sku || price === undefined) {
      return res.status(400).json({
        success: false,
        message: "Product, size, color, SKU and price are required",
      });
    }

    const parsedProductId = Number(productId);
    const parsedPrice = Number(price);

    if (!Number.isInteger(parsedProductId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be a valid positive number",
      });
    }

    // Check variant exists
    const existingVariant =
      await db.orm.public.ProductVariant.first({
        id: id,
      });

    if (!existingVariant) {
      return res.status(404).json({
        success: false,
        message: "Variant not found",
      });
    }

    // Check product exists
    const product = await db.orm.public.Product.first({
      id: parsedProductId,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Check SKU belongs to another variant
    const skuVariant =
      await db.orm.public.ProductVariant.first({
        sku: sku,
      });

    if (skuVariant && skuVariant.id !== id) {
      return res.status(409).json({
        success: false,
        message: "Variant SKU already exists",
      });
    }

    // Check size + color belongs to another variant
    const duplicateVariant =
      await db.orm.public.ProductVariant
        .where({
          productId: parsedProductId,
          size: size,
          color: color,
        })
        .first();

    if (duplicateVariant && duplicateVariant.id !== id) {
      return res.status(409).json({
        success: false,
        message: "This size and color variant already exists for this product",
      });
    }

    const variant =
      await db.orm.public.ProductVariant
        .where({
          id: id,
        })
        .update({
          productId: parsedProductId,
          size: size,
          color: color,
          sku: sku,
          price: parsedPrice,
          costPrice:
            costPrice === undefined || costPrice === ""
              ? null
              : Number(costPrice),
        });

    res.status(200).json({
      success: true,
      message: "Variant updated successfully",
      data: variant,
    });
  } catch (error) {
    console.error("Update variant error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update variant",
      error: error.message,
    });
  }
};

// ACTIVATE / DEACTIVATE variant
const updateVariantStatus = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { isActive } = req.body;

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid variant ID",
      });
    }

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isActive must be true or false",
      });
    }

    const existingVariant =
      await db.orm.public.ProductVariant.first({
        id: id,
      });

    if (!existingVariant) {
      return res.status(404).json({
        success: false,
        message: "Variant not found",
      });
    }

    const variant =
      await db.orm.public.ProductVariant
        .where({
          id: id,
        })
        .update({
          isActive: isActive,
        });

    res.status(200).json({
      success: true,
      message: isActive
        ? "Variant activated successfully"
        : "Variant deactivated successfully",
      data: variant,
    });
  } catch (error) {
    console.error("Update variant status error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update variant status",
      error: error.message,
    });
  }
};

// DELETE variant
const deleteVariant = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid variant ID",
      });
    }

    const existingVariant =
      await db.orm.public.ProductVariant.first({
        id: id,
      });

    if (!existingVariant) {
      return res.status(404).json({
        success: false,
        message: "Variant not found",
      });
    }

    await db.orm.public.ProductVariant
      .where({
        id: id,
      })
      .delete();

    res.status(200).json({
      success: true,
      message: "Variant deleted successfully",
    });
  } catch (error) {
    console.error("Delete variant error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete variant",
      error: error.message,
    });
  }
};

module.exports = {
  getVariants,
  getVariantById,
  getVariantsByProduct,
  createVariant,
  updateVariant,
  updateVariantStatus,
  deleteVariant,
};