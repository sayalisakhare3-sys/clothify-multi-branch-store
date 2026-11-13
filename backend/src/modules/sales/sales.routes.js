const express = require("express");
const { authenticateToken } = require("../auth/auth.middleware");
const {
  getCatalog,
  getReturns,
  getSale,
  getSales,
  postReturn,
  postSale,
} = require("./sales.controller");

const router = express.Router();
router.use(authenticateToken);
router.get("/", getSales);
router.get("/:id", getSale);
router.post("/", postSale);
router.post("/:id/returns", postReturn);

module.exports = router;
