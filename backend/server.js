const express = require("express");
const cors = require("cors");

const branchRoutes = require("./routes/branchRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const productRoutes = require("./routes/productRoutes");
const variantRoutes = require("./routes/variantRoutes");

const app = express();

const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "Clothify Backend is running successfully!",
  });
});

// Branch routes
app.use("/api/branches", branchRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/variants", variantRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Clothify Backend running on http://localhost:${PORT}`);
});