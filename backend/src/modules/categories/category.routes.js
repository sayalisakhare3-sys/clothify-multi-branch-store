const express = require("express");
const { authenticateToken } = require("../auth/auth.middleware");
const {
  getCategories, getCategoryById, createCategory, updateCategory, deleteCategory,
} = require("./category.controller");

const router = express.Router();
router.use(authenticateToken);
router.get("/", getCategories);
router.get("/:id", getCategoryById);
router.post("/", createCategory);
router.put("/:id", updateCategory);
router.delete("/:id", deleteCategory);
module.exports = router;
