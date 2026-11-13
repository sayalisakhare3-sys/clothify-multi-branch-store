const express = require("express");
const { authenticateToken } = require("../auth/auth.middleware");
const { getSale, getSales } = require("./sales.controller");

const router = express.Router();
router.use(authenticateToken);
router.get("/", getSales);
router.get("/:id", getSale);

module.exports = router;
