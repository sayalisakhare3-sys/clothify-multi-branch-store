const express = require("express");
const { authenticateToken } = require("../auth/auth.middleware");
const {
  getInventory, getInventoryById, getInventoryByBranch, getInventoryByVariant,
  createInventory, updateInventory, updateInventoryQuantity, deleteInventory,
} = require("./inventory.controller");

const router = express.Router();
router.use(authenticateToken);
router.get("/", getInventory);
router.get("/branch/:branchId", getInventoryByBranch);
router.get("/variant/:variantId", getInventoryByVariant);
router.get("/:id", getInventoryById);
router.post("/", createInventory);
router.put("/:id", updateInventory);
router.patch("/:id/quantity", updateInventoryQuantity);
router.delete("/:id", deleteInventory);
module.exports = router;
