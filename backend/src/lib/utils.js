import jwt from "jsonwebtoken";
import { env } from "./env.js";

export const generateToken = (userId, res) => {
  const jwtSecret = env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not configured")
  }
  const token = jwt.sign({ userId }, jwtSecret, {
    expiresIn: "7d",
  });
  res.cookie("jwt", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: "none",
    secure: true,
    path: "/",
  });

  return token;
};