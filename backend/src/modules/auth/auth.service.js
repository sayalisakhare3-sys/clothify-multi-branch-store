const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../../config/db");

async function loginUser(email, password) {
if (!email || !password) {
throw new Error("Email and password are required");
}

const user = await db.user.findUnique({
where: { email },
});

if (!user) {
throw new Error("Invalid email or password");
}

const passwordMatch = await bcrypt.compare(password, user.password);

if (!passwordMatch) {
throw new Error("Invalid email or password");
}

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
throw new Error("JWT_SECRET is not configured");
}

const token = jwt.sign(
{
userId: user.id,
role: user.role,
branchId: user.branchId,
},
jwtSecret,
{ expiresIn: "1d" }
);

return {
message: "Login successful",
token,
user: {
id: user.id,
name: user.name,
email: user.email,
role: user.role,
branchId: user.branchId,
},
};
}

module.exports = { loginUser };
