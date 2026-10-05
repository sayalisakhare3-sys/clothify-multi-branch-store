const express = require("express");

const {
  getBranches,
  getBranchById,
  createBranch,
  updateBranch,
  updateBranchStatus,
  deleteBranch,
} = require("../controllers/branchController");

const router = express.Router();

// GET all branches
router.get("/", getBranches);

// GET one branch
router.get("/:id", getBranchById);

// CREATE branch
router.post("/", createBranch);

// UPDATE branch
router.put("/:id", updateBranch);

// ACTIVATE / DEACTIVATE branch
router.patch("/:id/status", updateBranchStatus);

// DELETE branch
router.delete("/:id", deleteBranch);

module.exports = router;