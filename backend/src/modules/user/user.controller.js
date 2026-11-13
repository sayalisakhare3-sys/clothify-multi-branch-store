const userService = require("./user.service");

function sendError(res, error, fallback) {
  if (error.code === "P2002") {
    return res.status(409).json({ message: "A user with this email already exists" });
  }
  if (error.code === "P2003" || error.code === "P2014") {
    return res.status(409).json({ message: "This user is linked to existing records and cannot be deleted" });
  }
  if (error.code === "P2025") {
    return res.status(404).json({ message: "User not found" });
  }
  if (error.statusCode && error.statusCode < 500) {
    return res.status(error.statusCode).json({ message: error.message });
  }
  console.error(`${fallback}:`, error);
  return res.status(500).json({ message: fallback });
}

// Get all users
async function getUsers(req, res) {
  try {
    const users = await userService.getAllUsers();

    res.status(200).json({
      message: "Users fetched successfully",
      users,
    });
  } catch (error) {
    return sendError(res, error, "Failed to fetch users");
  }
}

// Add new user
async function addUser(req, res) {
  try {
    const { name, email, password, role } = req.body;
    // Managers can only create CASHIER users
if (req.user.role === "MANAGER" && role !== "CASHIER") {
  return res.status(403).json({
    message: "Managers can only create CASHIER users",
  });
}
    const branchId = req.user.role === "MANAGER" ? req.user.branchId : req.body.branchId;

    // Required fields
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        message: "Name, email, password and role are required",
      });
    }

    // Valid roles
    const validRoles = ["OWNER", "MANAGER", "CASHIER"];

    if (!validRoles.includes(role)) {
      return res.status(400).json({
        message: "Invalid role. Use OWNER, MANAGER or CASHIER",
      });
    }

    const user = await userService.createUser({ ...req.body, branchId });

    res.status(201).json({
      message: "User created successfully",
      user,
    });
  } catch (error) {
    return sendError(res, error, "Failed to create user");
  }
}

// Edit user
async function editUser(req, res) {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;
    const userId = Number(id);

    if (req.user.role === "MANAGER") {
      if (role !== "CASHIER") {
        return res.status(403).json({ message: "Managers can only manage CASHIER users" });
      }
      const existingUser = await userService.getUserById(userId);
      if (!existingUser || existingUser.role !== "CASHIER" || existingUser.branchId !== req.user.branchId) {
        return res.status(403).json({ message: "Managers can only manage cashiers in their branch" });
      }
    }

    // Required fields
    if (!name || !email || !role) {
      return res.status(400).json({
        message: "Name, email and role are required",
      });
    }

    // Valid roles
    const validRoles = ["OWNER", "MANAGER", "CASHIER"];

    if (!validRoles.includes(role)) {
      return res.status(400).json({
        message: "Invalid role. Use OWNER, MANAGER or CASHIER",
      });
    }

    const user = await userService.updateUser(id, {
      ...req.body,
      ...(req.user.role === "MANAGER" ? { branchId: req.user.branchId } : {}),
    });

    res.status(200).json({
      message: "User updated successfully",
      user,
    });
  } catch (error) {
    return sendError(res, error, "Failed to update user");
  }
}

// Remove user
async function removeUser(req, res) {
  try {
    const { id } = req.params;

    await userService.deleteUser(id);

    res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (error) {
    return sendError(res, error, "Failed to delete user");
  }
}

module.exports = {
  getUsers,
  addUser,
  editUser,
  removeUser,
};