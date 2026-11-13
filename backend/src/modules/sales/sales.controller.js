const {
  createReturn,
  createSale,
  getPosCatalog,
  getSaleById,
  listReturns,
  listSales,
} = require("./sales.service");

function sendError(res, error, message) {
  if (!error.statusCode || error.statusCode >= 500) {
    console.error(`${message}:`, error);
  }
  return res.status(error.statusCode || 500).json({
    success: false,
    message: error.statusCode && error.statusCode < 500 ? error.message : message,
  });
}

async function getCatalog(req, res) {
  try {
    const catalog = await getPosCatalog(req.user, req.query);
    return res.json({ success: true, ...catalog });
  } catch (error) {
    return sendError(res, error, "Failed to load point-of-sale catalog");
  }
}

async function getSales(req, res) {
  try {
    const sales = await listSales(req.user, req.query);
    return res.json({ success: true, count: sales.length, sales });
  } catch (error) {
    return sendError(res, error, "Failed to load sales");
  }
}

async function getSale(req, res) {
  try {
    const sale = await getSaleById(req.user, req.params.id);
    return res.json({ success: true, sale });
  } catch (error) {
    return sendError(res, error, "Failed to load sale");
  }
}

async function postSale(req, res) {
  try {
    const sale = await createSale(req.user, req.body || {});
    return res.status(201).json({ success: true, message: "Sale completed", sale });
  } catch (error) {
    return sendError(res, error, "Failed to complete sale");
  }
}

async function postReturn(req, res) {
  try {
    const saleReturn = await createReturn(req.user, req.params.id, req.body || {});
    return res.status(201).json({ success: true, message: "Return processed", return: saleReturn });
  } catch (error) {
    return sendError(res, error, "Failed to process return");
  }
}

async function getReturns(req, res) {
  try {
    const returns = await listReturns(req.user, req.query);
    return res.json({ success: true, count: returns.length, returns });
  } catch (error) {
    return sendError(res, error, "Failed to load returns");
  }
}

module.exports = { getCatalog, getReturns, getSale, getSales, postReturn, postSale };
