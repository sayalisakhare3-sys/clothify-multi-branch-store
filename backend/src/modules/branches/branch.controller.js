const db = require("../../config/db");

// GET /api/branches
const getBranches = async (req, res) => {
try {
const branches = await db.branch.findMany({
orderBy: { id: "asc" },
});


return res.status(200).json({
  success: true,
  count: branches.length,
  data: branches,
});


} catch (error) {
console.error("Get branches error:", error);


return res.status(500).json({
  success: false,
  message: "Failed to fetch branches",
  error: error.message,
});


}
};

// GET /api/branches/:id
const getBranchById = async (req, res) => {
try {
const id = Number(req.params.id);


if (!Number.isInteger(id) || id <= 0) {
  return res.status(400).json({
    success: false,
    message: "Invalid branch ID",
  });
}

const branch = await db.branch.findUnique({
  where: { id },
});

if (!branch) {
  return res.status(404).json({
    success: false,
    message: "Branch not found",
  });
}

return res.status(200).json({
  success: true,
  data: branch,
});


} catch (error) {
console.error("Get branch error:", error);


return res.status(500).json({
  success: false,
  message: "Failed to fetch branch",
  error: error.message,
});


}
};

// POST /api/branches
const createBranch = async (req, res) => {
try {
const { name, city, address, phone } = req.body;


if (!name || !city) {
  return res.status(400).json({
    success: false,
    message: "Branch name and city are required",
  });
}

const branch = await db.branch.create({
  data: {
    name,
    city,
    address: address || null,
    phone: phone || null,
    isActive: true,
  },
});

return res.status(201).json({
  success: true,
  message: "Branch created successfully",
  data: branch,
});


} catch (error) {
console.error("Create branch error:", error);


return res.status(500).json({
  success: false,
  message: "Failed to create branch",
  error: error.message,
});


}
};

// PUT /api/branches/:id
const updateBranch = async (req, res) => {
try {
const id = Number(req.params.id);
const { name, city, address, phone } = req.body;


if (!Number.isInteger(id) || id <= 0) {
  return res.status(400).json({
    success: false,
    message: "Invalid branch ID",
  });
}

if (!name || !city) {
  return res.status(400).json({
    success: false,
    message: "Branch name and city are required",
  });
}

const existingBranch = await db.branch.findUnique({
  where: { id },
});

if (!existingBranch) {
  return res.status(404).json({
    success: false,
    message: "Branch not found",
  });
}

const branch = await db.branch.update({
  where: { id },
  data: {
    name,
    city,
    address: address || null,
    phone: phone || null,
  },
});

return res.status(200).json({
  success: true,
  message: "Branch updated successfully",
  data: branch,
});


} catch (error) {
console.error("Update branch error:", error);


return res.status(500).json({
  success: false,
  message: "Failed to update branch",
  error: error.message,
});


}
};

// PATCH /api/branches/:id/status
const updateBranchStatus = async (req, res) => {
try {
const id = Number(req.params.id);
const { isActive } = req.body;


if (!Number.isInteger(id) || id <= 0) {
  return res.status(400).json({
    success: false,
    message: "Invalid branch ID",
  });
}

if (typeof isActive !== "boolean") {
  return res.status(400).json({
    success: false,
    message: "isActive must be true or false",
  });
}

const existingBranch = await db.branch.findUnique({
  where: { id },
});

if (!existingBranch) {
  return res.status(404).json({
    success: false,
    message: "Branch not found",
  });
}

const branch = await db.branch.update({
  where: { id },
  data: { isActive },
});

return res.status(200).json({
  success: true,
  message: isActive
    ? "Branch activated successfully"
    : "Branch deactivated successfully",
  branch,
});


} catch (error) {
console.error("Update branch status error:", error);


return res.status(500).json({
  success: false,
  message: "Failed to update branch status",
  error: error.message,
});


}
};

// DELETE /api/branches/:id
const deleteBranch = async (req, res) => {
try {
const id = Number(req.params.id);


if (!Number.isInteger(id) || id <= 0) {
  return res.status(400).json({
    success: false,
    message: "Invalid branch ID",
  });
}

const existingBranch = await db.branch.findUnique({
  where: { id },
});

if (!existingBranch) {
  return res.status(404).json({
    success: false,
    message: "Branch not found",
  });
}

await db.branch.delete({
  where: { id },
});

return res.status(200).json({
  success: true,
  message: "Branch deleted successfully",
});


} catch (error) {
console.error("Delete branch error:", error);


return res.status(500).json({
  success: false,
  message: "Failed to delete branch",
  error: error.message,
});


}
};

module.exports = {
getBranches,
getBranchById,
createBranch,
updateBranch,
updateBranchStatus,
deleteBranch,
};
