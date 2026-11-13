require("dotenv").config();

const app = require("./app");

const PORT = Number(process.env.PORT) || 5000;
const HOST = process.env.HOST || "0.0.0.0";

const server = app.listen(PORT, HOST, () => {
  console.log(`Clothify API running on http://localhost:${PORT}`);
});

function shutdown(signal) {
  console.log(`${signal} received. Shutting down Clothify API...`);
  server.close(() => process.exit(0));
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
