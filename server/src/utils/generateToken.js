import jwt from "jsonwebtoken";

/**
 * Generate JWT token for authenticated user
 * @param {string} userId - MongoDB ObjectId of user
 * @returns {string} JWT token
 */
export const generateToken = (userId) => {
  return jwt.sign(
    { userId: userId.toString() },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

/**
 * Verify JWT token
 * @param {string} token - JWT token
 * @returns {object} Decoded token payload
 */
export const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};