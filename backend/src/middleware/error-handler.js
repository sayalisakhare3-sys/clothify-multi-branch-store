function notFoundHandler(req, res) {
  res.status(404).json({
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  const status = Number(err.statusCode || err.status) || 500;
  const message = status >= 500 ? "Internal server error" : err.message || "Request failed";

  if (status >= 500) {
    console.error(err);
  }

  res.status(status).json({ message });
}

module.exports = { notFoundHandler, errorHandler };
