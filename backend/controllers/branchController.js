const db = require("../config/db");

// GET /api/branches
const getBranches = async (req, res) => {
  try {
    const branches = await db.orm.public.Branch.all();

    res.status(200).json({
      success: true,
      count: branches.length,
      data: branches,
    });
  } catch (error) {
    console.error("Get branches error:", error);

    res.status(500).json({
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

    if (Number.isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid branch ID",
      });
    }

    const branch = await db.orm.public.Branch.first({
      id: id,
    });

    if (!branch) {
      return res.status(404).json({
        success: false,
        message: "Branch not found",
      });
    }

    res.status(200).json({
      success: true,
      data: branch,
    });
  } catch (error) {
    console.error("Get branch error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch branch",
      error: error.message,
    });
  }
};

// POST /api/branches
const createBranch = async (req, res) => {
  try {
    const {
      name,
      city,
      address,
      phone,
    } = req.body;

    // Basic validation
    if (!name || !city) {
      return res.status(400).json({
        success: false,
        message: "Branch name and city are required",
      });
    }

    const branch = await db.orm.public.Branch.create({
      name,
      city,
      address: address || null,
      phone: phone || null,
      isActive: true,
    });

    res.status(201).json({
      success: true,
      message: "Branch created successfully",
      data: branch,
    });
  } catch (error) {
    console.error("Create branch error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create branch",
      error: error.message,
    });
  }
};

// PUT /api/branches/:id
// PUT /api/branches/:id
const updateBranch = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid branch ID",
      });
    }

    const {
      name,
      city,
      address,
      phone,
    } = req.body;

    if (!name || !city) {
      return res.status(400).json({
        success: false,
        message: "Branch name and city are required",
      });
    }

    const existingBranch =
      await db.orm.public.Branch.first({
        id: id,
      });

    if (!existingBranch) {
      return res.status(404).json({
        success: false,
        message: "Branch not found",
      });
    }

    const branch =
      await db.orm.public.Branch
        .where({
          id: id,
        })
        .update({
          name,
          city,
          address: address || null,
          phone: phone || null,
        });

    res.status(200).json({
      success: true,
      message: "Branch updated successfully",
      data: branch,
    });
  } catch (error) {
    console.error("Update branch error:", error);

    res.status(500).json({
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

    // Validate branch ID
    if (Number.isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid branch ID",
      });
    }

    // Validate isActive
    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isActive must be true or false",
      });
    }

    // Check whether branch exists
    const existingBranch =
      await db.orm.public.Branch.first({
        id: id,
      });

    if (!existingBranch) {
      return res.status(404).json({
        success: false,
        message: "Branch not found",
      });
    }

    // Prisma 8 syntax:
    // where() MUST come before update()
    const branch =
      await db.orm.public.Branch
        .where({
          id: id,
        })
        .update({
          isActive: isActive,
        });

    res.status(200).json({
      success: true,
      message: isActive
        ? "Branch activated successfully"
        : "Branch deactivated successfully",
      branch,
    });
  } catch (error) {
    console.error("Update branch status error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update branch status",
      error: error.message,
    });
  }
};
// DELETE /api/branches/:id
// DELETE /api/branches/:id
const deleteBranch = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid branch ID",
      });
    }

    const existingBranch =
      await db.orm.public.Branch.first({
        id: id,
      });

    if (!existingBranch) {
      return res.status(404).json({
        success: false,
        message: "Branch not found",
      });
    }

    await db.orm.public.Branch
      .where({
        id: id,
      })
      .delete();

    res.status(200).json({
      success: true,
      message: "Branch deleted successfully",
    });
  } catch (error) {
    console.error("Delete branch error:", error);

    res.status(500).json({
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