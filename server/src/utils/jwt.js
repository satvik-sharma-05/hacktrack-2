import jwt from "jsonwebtoken";
import { config } from "../config/env.js";

export function sendToken(user, res) {
  const token = jwt.sign({ id: user._id }, config.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    redirectHint:
      user.role === "student"
        ? "/profile"
        : user.role === "organizer"
        ? "/organizer"
        : "/select-role",
  });
}
