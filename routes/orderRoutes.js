const express = require("express");
const orderRouter = express.Router();
const authenticateToken = require("../middleware/auth");
const checkRole = require("../middleware/checkRole");
const {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  getAllOrders
} = require("../Controllers/orderController");

// Apply authentication middleware to all routes
orderRouter.use(authenticateToken);

// Create new order
orderRouter.post("/create", createOrder);

// Get user's orders
orderRouter.get("/", getUserOrders);

// Get all orders (admin only)
orderRouter.get("/all", checkRole("admin"), getAllOrders);

// Get specific order
orderRouter.get("/:id", getOrderById);

// Update order status (admin only)
orderRouter.put("/:id/status", checkRole("admin"), updateOrderStatus);

// Cancel order
orderRouter.post("/:id/cancel", cancelOrder);

module.exports = orderRouter; 