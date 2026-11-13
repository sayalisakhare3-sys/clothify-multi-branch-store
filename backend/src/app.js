require("dotenv").config();
const express = require("express");
const cors = require("cors");

const branchRoutes = require("./modules/branches/branch.routes");
const categoryRoutes = require("./modules/categories/category.routes");
const productRoutes = require("./modules/products/product.routes");
const variantRoutes = require("./modules/variants/variant.routes");
const inventoryRoutes = require("./modules/inventory/inventory.routes");
const authRoutes = require("./modules/auth/auth.routes");
const dashboardRoutes = require("./modules/dashboard/dashboard.routes");
const customerRoutes = require("./modules/customer/customer.routes");
const userRoutes = require("./modules/user/user.routes");
const salesRoutes = require("./modules/sales/sales.routes");
const posRoutes = require("./modules/sales/pos.routes");
const invoiceRoutes = require("./modules/sales/invoices.routes");
const returnRoutes = require("./modules/sales/returns.routes");
const analyticsRoutes = require("./modules/analytics/analytics.routes");
const healthRoutes = require("./routes/health.routes");
const { notFoundHandler, errorHandler } = require("./middleware/error-handler");

const app = express();

const configuredOrigins = (process.env.CORS_ORIGIN || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.disable("x-powered-by");
app.use(
  cors({
    origin: configuredOrigins,
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));

app.get("/", (_req, res) => {
  res.json({ message: "Clothify API is running", version: "1.0" });
});
app.use("/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/users", userRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/pos", posRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/returns", returnRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/branches", branchRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/variants", variantRoutes);
app.use("/api/inventory", inventoryRoutes);

const { authorizeRoles, authenticateToken } = require("./modules/auth/auth.middleware");
app.get(
  "/api/owner-test",
  authenticateToken,
  authorizeRoles("OWNER"),
  (req, res) => res.json({ message: "You accessed an OWNER-only route", user: req.user })
);
app.get(
  "/api/protected-test",
  authenticateToken,
  (req, res) => res.json({ message: "You accessed a protected route", user: req.user })
);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
