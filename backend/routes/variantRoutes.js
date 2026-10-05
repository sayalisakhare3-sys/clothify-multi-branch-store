const express = require("express");

const {
  getVariants,
  getVariantById,
  getVariantsByProduct,
  createVariant,
  updateVariant,
  updateVariantStatus,
  deleteVariant,
} = require("../controllers/variantController");

const router = express.Router();

router.get("/", getVariants);
router.get("/product/:productId", getVariantsByProduct);
router.get("/:id", getVariantById);

router.post("/", createVariant);

router.put("/:id", updateVariant);

router.patch("/:id/status", updateVariantStatus);

router.delete("/:id", deleteVariant);

module.exports = router;