const express = require("express");
const authRouter = require("./routes/authRoutes");
const productRouter = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const userRoutes = require("./routes/userRoutes");
const cors = require("cors");
const app = express();
const PORT = 8080;

app.use(cors()); // Enable CORS for all routes
app.use(express.json());

app.use("/cart", cartRoutes);
app.use("/auth", authRouter);
app.use("/product", productRouter);
app.use("/orders", orderRoutes);
app.use("/users", userRoutes);

// Default route
app.get("/", (req, res) => {
  res.send("🛒 Welcome to the E-Commerce API");
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
