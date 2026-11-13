const express = require("express");
const { authenticateToken } = require("../auth/auth.middleware");
const {
  getBranches, getBranchById, createBranch, updateBranch,
  updateBranchStatus, deleteBranch,
} = require("./branch.controller");

const router = express.Router();
router.use(authenticateToken);
router.get("/", getBranches);
router.get("/:id", getBranchById);
router.post("/", createBranch);
router.put("/:id", updateBranch);
router.patch("/:id/status", updateBranchStatus);
router.delete("/:id", deleteBranch);
module.exports = router;
