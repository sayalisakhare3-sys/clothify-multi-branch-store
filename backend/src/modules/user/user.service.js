const bcrypt = require("bcryptjs");
const db = require("../../config/db");

const safeUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  branchId: true,
  createdAt: true,
  updatedAt: true,
};

async function getAllUsers() {
  return db.user.findMany({ select: safeUserSelect, orderBy: { id: "asc" } });
}

async function getUserById(id) {
  const userId = Number(id);
  if (!Number.isInteger(userId) || userId <= 0) return null;
  return db.user.findUnique({ where: { id: userId }, select: safeUserSelect });
}

async function createUser(data) {
  const branchId = data.branchId === undefined || data.branchId === "" || data.branchId === null
    ? null
    : Number(data.branchId);
  if (branchId !== null && (!Number.isInteger(branchId) || branchId <= 0)) {
    const error = new Error("Invalid branch ID");
    error.statusCode = 400;
    throw error;
  }
  if (data.role === "CASHIER" && branchId === null) {
    const error = new Error("A branch is required for cashier accounts");
    error.statusCode = 400;
    throw error;
  }
  if (branchId !== null) {
    const branch = await db.branch.findUnique({ where: { id: branchId }, select: { id: true, isActive: true } });
    if (!branch || !branch.isActive) {
      const error = new Error("Select an active branch");
      error.statusCode = 400;
      throw error;
    }
  }
  return db.user.create({
    data: {
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      password: await bcrypt.hash(data.password, 10),
      role: data.role,
      branchId,
    },
    select: safeUserSelect,
  });
}

async function updateUser(id, data) {
  const userId = Number(id);
  if (!Number.isInteger(userId) || userId <= 0) {
    const error = new Error("Invalid user ID");
    error.statusCode = 400;
    throw error;
  }
  const branchId = data.branchId === undefined
    ? undefined
    : data.branchId === "" || data.branchId === null
      ? null
      : Number(data.branchId);
  if (branchId !== undefined && branchId !== null && (!Number.isInteger(branchId) || branchId <= 0)) {
    const error = new Error("Invalid branch ID");
    error.statusCode = 400;
    throw error;
  }
  if (data.role === "CASHIER" && branchId === null) {
    const error = new Error("A branch is required for cashier accounts");
    error.statusCode = 400;
    throw error;
  }
  if (branchId !== undefined && branchId !== null) {
    const branch = await db.branch.findUnique({ where: { id: branchId }, select: { id: true, isActive: true } });
    if (!branch || !branch.isActive) {
      const error = new Error("Select an active branch");
      error.statusCode = 400;
      throw error;
    }
  }

  const update = {};
  if (data.name !== undefined) update.name = data.name.trim();
  if (data.email !== undefined) update.email = data.email.trim().toLowerCase();
  if (data.role !== undefined) update.role = data.role;
  if (branchId !== undefined) update.branchId = branchId;
  if (data.password) update.password = await bcrypt.hash(data.password, 10);
  if (Object.keys(update).length === 0) return getUserById(userId);

  return db.user.update({ where: { id: userId }, data: update, select: safeUserSelect });
}

async function deleteUser(id) {
  const userId = Number(id);
  if (!Number.isInteger(userId) || userId <= 0) {
    const error = new Error("Invalid user ID");
    error.statusCode = 400;
    throw error;
  }
  return db.user.delete({ where: { id: userId }, select: safeUserSelect });
}

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
