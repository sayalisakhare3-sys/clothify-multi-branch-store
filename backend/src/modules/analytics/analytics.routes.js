const express = require("express");
const { authenticateToken } = require("../auth/auth.middleware");
const { getRestockRecommendations, getVariantDemand } = require("./analytics.controller");

const router = express.Router();
router.use(authenticateToken);
router.get("/restock", getRestockRecommendations);
router.get("/variant-demand", getVariantDemand);

module.exports = router;
