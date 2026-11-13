const {
  getAllCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} = require("./customer.service");

async function getCustomers(req, res) {
  try {
    const customers = await getAllCustomers();

    return res.status(200).json(customers);
  } catch (error) {
    console.error("Customer error:", error);
    console.error("Customer error message:", error.message);

    return res.status(500).json({
      message: "Failed to load customers",
    });
  }
}

async function addCustomer(req, res) {
  try {
    const { name, phone, email, address } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "Customer name is required",
      });
    }

    const customer = await createCustomer({
      name,
      phone,
      email,
      address,
    });

    return res.status(201).json(customer);
  } catch (error) {
    console.error("Create customer error:", error);
    console.error("Create customer error message:", error.message);

    return res.status(500).json({
      message: "Failed to create customer",
    });
  }
}

// Update customer
async function editCustomer(req, res) {
  try {
    const { id } = req.params;
    const { name, phone, email, address } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "Customer name is required",
      });
    }

    const customer = await updateCustomer(id, {
      name,
      phone,
      email,
      address,
    });

    return res.status(200).json(customer);
  } catch (error) {
    console.error("Update customer error:", error);
    console.error("Update customer error message:", error.message);

    return res.status(500).json({
      message: "Failed to update customer",
    });
  }
}

// Delete customer
async function removeCustomer(req, res) {
  try {
    const { id } = req.params;

    await deleteCustomer(id);

    return res.status(200).json({
      message: "Customer deleted successfully",
    });
  } catch (error) {
    console.error("Delete customer error:", error);
    console.error("Delete customer error message:", error.message);

    return res.status(500).json({
      message: "Failed to delete customer",
    });
  }
}

module.exports = {
  getCustomers,
  addCustomer,
  editCustomer,
  removeCustomer,
};
