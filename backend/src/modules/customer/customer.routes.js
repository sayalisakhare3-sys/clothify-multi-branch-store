const express = require("express");

const {
  getCustomers,
  addCustomer,
  editCustomer,
  removeCustomer,
} = require("./customer.controller");

const { authenticateToken } = require("../auth/auth.middleware");

const router = express.Router();

// Get all customers
router.get("/", authenticateToken, getCustomers);

// Add customer
router.post("/", authenticateToken, addCustomer);

// Update customer
router.put("/:id", authenticateToken, editCustomer);

// Delete customer
router.delete("/:id", authenticateToken, removeCustomer);

module.exports = router;