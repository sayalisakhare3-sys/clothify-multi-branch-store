const db = require("../config/db");

// ==========================================
// GET ALL CATEGORIES
// GET /api/categories
// ==========================================
const getCategories = async (req, res) => {
  try {
    const categories = await db.orm.public.Category.all();

    res.status(200).json({
      success: true,
      count: categories.length,
      categories,
    });
  } catch (error) {
    console.error("Get categories error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
      error: error.message,
    });
  }
};

// ==========================================
// GET CATEGORY BY ID
// GET /api/categories/:id
// ==========================================
const getCategoryById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    const category = await db.orm.public.Category.first({
      id: id,
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.status(200).json({
      success: true,
      category,
    });
  } catch (error) {
    console.error("Get category error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch category",
      error: error.message,
    });
  }
};

// ==========================================
// CREATE CATEGORY
// POST /api/categories
// ==========================================
const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    // Validate category name
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    // Check duplicate category
    const existingCategory =
      await db.orm.public.Category.first({
        name: name.trim(),
      });

    if (existingCategory) {
      return res.status(409).json({
        success: false,
        message: "Category already exists",
      });
    }

    // Create category
    const category =
      await db.orm.public.Category.create({
        name: name.trim(),
        description: description?.trim() || null,
      });

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    console.error("Create category error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create category",
      error: error.message,
    });
  }
};

// ==========================================
// UPDATE CATEGORY
// PUT /api/categories/:id
// ==========================================
const updateCategory = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, description } = req.body;

    if (Number.isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    // Check category exists
    const existingCategory =
      await db.orm.public.Category.first({
        id: id,
      });

    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Check if another category already uses this name
    const duplicateCategory =
      await db.orm.public.Category.first({
        name: name.trim(),
      });

    if (duplicateCategory && duplicateCategory.id !== id) {
      return res.status(409).json({
        success: false,
        message: "Another category with this name already exists",
      });
    }

    // Prisma 8 syntax:
    // where() comes BEFORE update()
    const category =
      await db.orm.public.Category
        .where({
          id: id,
        })
        .update({
          name: name.trim(),
          description: description?.trim() || null,
        });

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      category,
    });
  } catch (error) {
    console.error("Update category error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update category",
      error: error.message,
    });
  }
};

// ==========================================
// DELETE CATEGORY
// DELETE /api/categories/:id
// ==========================================
const deleteCategory = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    // Check category exists
    const existingCategory =
      await db.orm.public.Category.first({
        id: id,
      });

    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Prisma 8 syntax:
    // where() comes BEFORE delete()
    await db.orm.public.Category
      .where({
        id: id,
      })
      .delete();

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Delete category error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete category",
      error: error.message,
    });
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};