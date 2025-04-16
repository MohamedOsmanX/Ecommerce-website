const express = require("express");
const userRouter = express.Router();
const authenticateToken = require("../middleware/auth");
const {
  getUserProfile,
  updateUserProfile,
  changePassword,
  forgotPassword,
  resetPassword
} = require("../Controllers/userController");

// Public routes
userRouter.post("/forgot-password", forgotPassword);
userRouter.post("/reset-password", resetPassword);

// Protected routes
userRouter.use(authenticateToken);
userRouter.get("/profile", getUserProfile);
userRouter.put("/profile", updateUserProfile);
userRouter.put("/change-password", changePassword);

module.exports = userRouter; 