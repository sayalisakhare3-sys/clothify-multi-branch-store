const express = require("express");
const { authenticateToken } = require("../auth/auth.middleware");
const {
  getVariants, getVariantById, getVariantsByProduct, createVariant,
  updateVariant, updateVariantStatus, deleteVariant,
} = require("./variant.controller");

const router = express.Router();
router.use(authenticateToken);
router.get("/", getVariants);
router.get("/:id", getVariantById);
router.get("/product/:productId", getVariantsByProduct);
router.post("/", createVariant);
router.put("/:id", updateVariant);
router.patch("/:id/status", updateVariantStatus);
router.delete("/:id", deleteVariant);
module.exports = router;
