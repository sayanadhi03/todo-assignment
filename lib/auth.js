import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is not set");
}

// JWT utilities
function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });
}

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

// Password utilities
async function hashPassword(password) {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

async function comparePassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}

export {
  generateToken,
  verifyToken,
  hashPassword,
  comparePassword,
};
