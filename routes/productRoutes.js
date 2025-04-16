const express = require("express");
const {
  createProduct,
  getAllProducts,
  getProductById,
  deleteProduct,
  updateProduct,
} = require("../Controllers/productController");
const authenticateToken = require("../middleware/auth");
const checkRole = require("../middleware/checkRole");


const productRouter = express.Router();

productRouter.post("/create", authenticateToken, checkRole("admin"), createProduct);
productRouter.get("/", getAllProducts);
productRouter.get("/:id", getProductById);
productRouter.delete("/:id", authenticateToken, checkRole("admin"), deleteProduct);
productRouter.put("/:id", authenticateToken, checkRole("admin"), updateProduct);

module.exports = productRouter;
