const db = require("../config/db");

// ==========================================
// GET ALL PRODUCTS
// GET /api/products
// ==========================================
const getProducts = async (req, res) => {
  try {
    const products = await db.orm.public.Product.all();

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Get products error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
      error: error.message,
    });
  }
};

// ==========================================
// GET PRODUCT BY ID
// GET /api/products/:id
// ==========================================
const getProductById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await db.orm.public.Product.first({
      id: id,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Get product error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch product",
      error: error.message,
    });
  }
};

// ==========================================
// CREATE PRODUCT
// POST /api/products
// ==========================================
const createProduct = async (req, res) => {
  try {
    const {
      name,
      sku,
      description,
      categoryId,
    } = req.body;

    // Validate name
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Product name is required",
      });
    }

    // Validate SKU
    if (!sku || !sku.trim()) {
      return res.status(400).json({
        success: false,
        message: "Product SKU is required",
      });
    }

    // Validate category
    if (
      categoryId === undefined ||
      categoryId === null ||
      Number.isNaN(Number(categoryId))
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid category ID is required",
      });
    }

    const parsedCategoryId = Number(categoryId);

    // Check category exists
    const category =
      await db.orm.public.Category.first({
        id: parsedCategoryId,
      });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Check duplicate SKU
    const existingSku =
      await db.orm.public.Product.first({
        sku: sku.trim(),
      });

    if (existingSku) {
      return res.status(409).json({
        success: false,
        message: "Product SKU already exists",
      });
    }

    // Create product
    const product =
      await db.orm.public.Product.create({
        name: name.trim(),
        sku: sku.trim(),
        description: description?.trim() || null,
        categoryId: parsedCategoryId,
      });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("Create product error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create product",
      error: error.message,
    });
  }
};

// ==========================================
// UPDATE PRODUCT
// PUT /api/products/:id
// ==========================================
const updateProduct = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const {
      name,
      sku,
      description,
      categoryId,
    } = req.body;

    if (Number.isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    // Validate name
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Product name is required",
      });
    }

    // Validate SKU
    if (!sku || !sku.trim()) {
      return res.status(400).json({
        success: false,
        message: "Product SKU is required",
      });
    }

    // Validate category
    if (
      categoryId === undefined ||
      categoryId === null ||
      Number.isNaN(Number(categoryId))
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid category ID is required",
      });
    }

    const parsedCategoryId = Number(categoryId);

    // Check product exists
    const existingProduct =
      await db.orm.public.Product.first({
        id: id,
      });

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Check category exists
    const category =
      await db.orm.public.Category.first({
        id: parsedCategoryId,
      });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Check duplicate SKU
    const duplicateSku =
      await db.orm.public.Product.first({
        sku: sku.trim(),
      });

    if (duplicateSku && duplicateSku.id !== id) {
      return res.status(409).json({
        success: false,
        message: "Another product with this SKU already exists",
      });
    }

    // Prisma 8 syntax:
    // where() comes BEFORE update()
    const product =
      await db.orm.public.Product
        .where({
          id: id,
        })
        .update({
          name: name.trim(),
          sku: sku.trim(),
          description: description?.trim() || null,
          categoryId: parsedCategoryId,
        });

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("Update product error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update product",
      error: error.message,
    });
  }
};

// ==========================================
// DELETE PRODUCT
// DELETE /api/products/:id
// ==========================================
const deleteProduct = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    // Check product exists
    const existingProduct =
      await db.orm.public.Product.first({
        id: id,
      });

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Delete product
    // Prisma 8 syntax:
    // where() comes BEFORE delete()
    await db.orm.public.Product
      .where({
        id: id,
      })
      .delete();

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Delete product error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete product",
      error: error.message,
    });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};