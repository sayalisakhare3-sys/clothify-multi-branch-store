const express = require("express");
const { getDashboard } = require("./dashboard.controller");
const { authenticateToken } = require("../auth/auth.middleware");

const router = express.Router();

router.get("/", authenticateToken, getDashboard);

module.exports = router;