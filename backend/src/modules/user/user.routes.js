const express = require("express");

const router = express.Router();

const {
  getUsers,
  addUser,
  editUser,
  removeUser,
} = require("./user.controller");

const { authenticateToken } = require("../auth/auth.middleware");
const { authorizeRoles } = require("../auth/auth.middleware");

// Get all users
router.get(
  "/",
  authenticateToken,
  authorizeRoles("OWNER", "MANAGER"),
  getUsers
);

// Add new user
router.post(
  "/",
  authenticateToken,
  authorizeRoles("OWNER", "MANAGER"),
  addUser
);

// Edit user
router.put(
  "/:id",
  authenticateToken,
  authorizeRoles("OWNER", "MANAGER"),
  editUser
);

// Remove user
router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("OWNER"),
  removeUser
);

module.exports = router;