
const db = require("../../config/db");

// GET /api/categories
const getCategories = async (req, res) => {
  try {
    const categories = await db.category.findMany({
      orderBy: { id: "asc" },
    });

    return res.status(200).json({
      success: true,
      count: categories.length,
      categories,
    });
  } catch (error) {
    console.error("Get categories error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
    });
  }
};

// GET /api/categories/:id
const getCategoryById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    const category = await db.category.findUnique({
      where: { id },
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    return res.status(200).json({ success: true, category });
  } catch (error) {
    console.error("Get category error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch category",
    });
  }
};

// POST /api/categories
const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    const cleanName = name.trim();

    const existingCategory = await db.category.findUnique({
      where: { name: cleanName },
    });

    if (existingCategory) {
      return res.status(409).json({
        success: false,
        message: "Category already exists",
      });
    }

    const category = await db.category.create({
      data: {
        name: cleanName,
        description:
          typeof description === "string" && description.trim()
            ? description.trim()
            : null,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "Category already exists",
      });
    }

    console.error("Create category error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create category",
    });
  }
};

// PUT /api/categories/:id
const updateCategory = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, description } = req.body;

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    const existingCategory = await db.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const cleanName = name.trim();

    const duplicateCategory = await db.category.findUnique({
      where: { name: cleanName },
    });

    if (duplicateCategory && duplicateCategory.id !== id) {
      return res.status(409).json({
        success: false,
        message: "Another category with this name already exists",
      });
    }

    const category = await db.category.update({
      where: { id },
      data: {
        name: cleanName,
        description:
          typeof description === "string" && description.trim()
            ? description.trim()
            : null,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
      category,
    });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "Another category with this name already exists",
      });
    }

    console.error("Update category error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update category",
    });
  }
};

// DELETE /api/categories/:id
const deleteCategory = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    const existingCategory = await db.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    if (existingCategory._count.products > 0) {
      return res.status(409).json({
        success: false,
        message: "Cannot delete a category that has products. Move or delete its products first.",
      });
    }

    await db.category.delete({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    if (error.code === "P2003") {
      return res.status(409).json({
        success: false,
        message: "Cannot delete a category that is linked to products.",
      });
    }

    console.error("Delete category error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete category",
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