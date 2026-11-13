const express = require("express");
const { authenticateToken } = require("../auth/auth.middleware");
const { getReturns } = require("./sales.controller");

const router = express.Router();
router.use(authenticateToken);
router.get("/", getReturns);

module.exports = router;
