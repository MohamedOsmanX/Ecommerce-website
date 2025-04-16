const express = require("express");
const cartRouter = express.Router();
const authenticateToken = require("../middleware/auth");
const {
  addToCart,
  getUserCart,
  removeFromCart,
  updateCartQuantity,
  validateCartInput
} = require("../Controllers/cartController");

cartRouter.use(authenticateToken);
cartRouter.post("/add", validateCartInput, addToCart);
cartRouter.get("/", getUserCart);
cartRouter.delete("/:id", removeFromCart);
cartRouter.put("/:id", updateCartQuantity);

module.exports = cartRouter;
