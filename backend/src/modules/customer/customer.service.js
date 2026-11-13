
const db = require("../../config/db");

async function getAllCustomers() {
  return db.customer.findMany({
    orderBy: { id: "asc" },
  });
}

async function createCustomer(data) {
  return db.customer.create({
    data: {
      name: data.name,
      phone: data.phone || null,
      email: data.email || null,
      address: data.address || null,
    },
  });
}

async function updateCustomer(id, data) {
  const customerId = Number(id);

  if (!Number.isInteger(customerId) || customerId <= 0) {
    throw new Error("Invalid customer ID");
  }

  return db.customer.update({
    where: { id: customerId },
    data: {
      name: data.name,
      phone: data.phone || null,
      email: data.email || null,
      address: data.address || null,
    },
  });
}

async function deleteCustomer(id) {
  const customerId = Number(id);

  if (!Number.isInteger(customerId) || customerId <= 0) {
    throw new Error("Invalid customer ID");
  }

  return db.customer.delete({
    where: { id: customerId },
  });
}

module.exports = {
  getAllCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
};