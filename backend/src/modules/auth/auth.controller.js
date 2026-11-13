const { loginUser } = require("./auth.service");

async function login(req, res, next) {
  try {
    const email = typeof req.body?.email === "string" ? req.body.email.trim() : "";
    const password = typeof req.body?.password === "string" ? req.body.password : "";

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const result = await loginUser(email, password);
    return res.status(200).json(result);
  } catch (error) {
    error.statusCode = 401;
    return next(error);
  }
}

module.exports = { login };
