const db = require("../../config/db");

// GET /api/products
const getProducts = async (req, res) => {
try {
const products = await db.product.findMany({
orderBy: { id: "asc" },
});


return res.status(200).json({
  success: true,
  count: products.length,
  products,
});


} catch (error) {
console.error("Get products error:", error);


return res.status(500).json({
  success: false,
  message: "Failed to fetch products",
  error: error.message,
});


}
};

// GET /api/products/:id
const getProductById = async (req, res) => {
try {
const id = Number(req.params.id);


if (!Number.isInteger(id) || id <= 0) {
  return res.status(400).json({
    success: false,
    message: "Invalid product ID",
  });
}

const product = await db.product.findUnique({
  where: { id },
});

if (!product) {
  return res.status(404).json({
    success: false,
    message: "Product not found",
  });
}

return res.status(200).json({
  success: true,
  product,
});


} catch (error) {
console.error("Get product error:", error);


return res.status(500).json({
  success: false,
  message: "Failed to fetch product",
  error: error.message,
});


}
};

// POST /api/products
const createProduct = async (req, res) => {
try {
const { name, sku, description, categoryId } = req.body;


if (typeof name !== "string" || !name.trim()) {
  return res.status(400).json({
    success: false,
    message: "Product name is required",
  });
}

if (typeof sku !== "string" || !sku.trim()) {
  return res.status(400).json({
    success: false,
    message: "Product SKU is required",
  });
}

if (
  categoryId === undefined ||
  categoryId === null ||
  !Number.isInteger(Number(categoryId)) ||
  Number(categoryId) <= 0
) {
  return res.status(400).json({
    success: false,
    message: "Valid category ID is required",
  });
}

const parsedCategoryId = Number(categoryId);

const category = await db.category.findUnique({
  where: { id: parsedCategoryId },
});

if (!category) {
  return res.status(404).json({
    success: false,
    message: "Category not found",
  });
}

const normalizedSku = sku.trim();

const existingSku = await db.product.findUnique({
  where: { sku: normalizedSku },
});

if (existingSku) {
  return res.status(409).json({
    success: false,
    message: "Product SKU already exists",
  });
}

const product = await db.product.create({
  data: {
    name: name.trim(),
    sku: normalizedSku,
    description:
      typeof description === "string" && description.trim()
        ? description.trim()
        : null,
    categoryId: parsedCategoryId,
  },
});

return res.status(201).json({
  success: true,
  message: "Product created successfully",
  product,
});


} catch (error) {
console.error("Create product error:", error);


if (error.code === "P2002") {
  return res.status(409).json({
    success: false,
    message: "Product SKU already exists",
  });
}

return res.status(500).json({
  success: false,
  message: "Failed to create product",
  error: error.message,
});


}
};

// PUT /api/products/:id
const updateProduct = async (req, res) => {
try {
const id = Number(req.params.id);
const { name, sku, description, categoryId } = req.body;


if (!Number.isInteger(id) || id <= 0) {
  return res.status(400).json({
    success: false,
    message: "Invalid product ID",
  });
}

if (typeof name !== "string" || !name.trim()) {
  return res.status(400).json({
    success: false,
    message: "Product name is required",
  });
}

if (typeof sku !== "string" || !sku.trim()) {
  return res.status(400).json({
    success: false,
    message: "Product SKU is required",
  });
}

if (
  categoryId === undefined ||
  categoryId === null ||
  !Number.isInteger(Number(categoryId)) ||
  Number(categoryId) <= 0
) {
  return res.status(400).json({
    success: false,
    message: "Valid category ID is required",
  });
}

const parsedCategoryId = Number(categoryId);

const existingProduct = await db.product.findUnique({
  where: { id },
});

if (!existingProduct) {
  return res.status(404).json({
    success: false,
    message: "Product not found",
  });
}

const category = await db.category.findUnique({
  where: { id: parsedCategoryId },
});

if (!category) {
  return res.status(404).json({
    success: false,
    message: "Category not found",
  });
}

const normalizedSku = sku.trim();

const duplicateSku = await db.product.findUnique({
  where: { sku: normalizedSku },
});

if (duplicateSku && duplicateSku.id !== id) {
  return res.status(409).json({
    success: false,
    message: "Another product with this SKU already exists",
  });
}

const product = await db.product.update({
  where: { id },
  data: {
    name: name.trim(),
    sku: normalizedSku,
    description:
      typeof description === "string" && description.trim()
        ? description.trim()
        : null,
    categoryId: parsedCategoryId,
  },
});

return res.status(200).json({
  success: true,
  message: "Product updated successfully",
  product,
});


} catch (error) {
console.error("Update product error:", error);


if (error.code === "P2002") {
  return res.status(409).json({
    success: false,
    message: "Another product with this SKU already exists",
  });
}

return res.status(500).json({
  success: false,
  message: "Failed to update product",
  error: error.message,
});


}
};

// DELETE /api/products/:id
const deleteProduct = async (req, res) => {
try {
const id = Number(req.params.id);


if (!Number.isInteger(id) || id <= 0) {
  return res.status(400).json({
    success: false,
    message: "Invalid product ID",
  });
}

const existingProduct = await db.product.findUnique({
  where: { id },
});

if (!existingProduct) {
  return res.status(404).json({
    success: false,
    message: "Product not found",
  });
}

await db.product.delete({
  where: { id },
});

return res.status(200).json({
  success: true,
  message: "Product deleted successfully",
});


} catch (error) {
console.error("Delete product error:", error);


return res.status(500).json({
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
