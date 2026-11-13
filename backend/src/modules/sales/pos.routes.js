const express = require("express");
const { authenticateToken } = require("../auth/auth.middleware");
const { getCatalog } = require("./sales.controller");

const router = express.Router();
router.use(authenticateToken);
router.get("/catalog", getCatalog);

module.exports = router;
