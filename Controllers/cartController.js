const prisma = require("../lib/prisma");

// Input validation middleware
const validateCartInput = (req, res, next) => {
  const { productid, quantity } = req.body;

  // check if productid and quantity are present
  if (!productid || !quantity) {
    return res.status(400).json({ 
      success: false,
      error: "Product ID and quantity are required" 
    });
  }

  // check if quantity is greater than 0
  if (quantity <= 0) {
    return res.status(400).json({ 
      success: false,
      error: "Quantity must be greater than 0" 
    });
  }

  // check if productid and quantity are numbers          
  if (isNaN(productid) || isNaN(quantity)) {
    return res.status(400).json({
      success: false,
      error: "Product ID and quantity must be numbers"
    });
  }

  next();
};

const addToCart = async (req, res) => {

  const { productid, quantity } = req.body;
  const userid = req.user.id;

  try {
    console.log('Looking for product with ID:', productid);
    // Check if product exists
    const product = await prisma.products.findUnique({
      where: { id: parseInt(productid) }
    });

    if (!product) {
      console.log('Product not found with ID:', productid);
      return res.status(404).json({ 
        success: false,
        error: "Product not found" 
      });
    }

    console.log('Product found:', product);
    
    // Check if product is in stock 
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        error: "Not enough stock available"
      });
    }

    // Check if item already exists in cart
    const existingItem = await prisma.cart.findFirst({
      where: { 
        productid: parseInt(productid),
        userid: userid 
      }
    });

    // check if item already exists in cart
    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > product.stock) {
        return res.status(400).json({
          success: false,
          error: "Total quantity exceeds available stock"
        });
      }

      // update item quantity
      const updatedItem = await prisma.cart.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
        include: { products: true }
      });
      return res.json({
        success: true,
        data: updatedItem
      });
    }

    // create item in cart
    const cartItem = await prisma.cart.create({
      data: { 
        userid: userid,
        productid: parseInt(productid),
        quantity 
      },
      include: { products: true }
    });

    res.status(201).json({
      success: true,
      data: cartItem
    });
  } catch (error) {
    console.error('Cart error details:', error);
    res.status(500).json({ 
      success: false,
      error: "Error adding item to cart",
      details: error.message 
    });
  }
};

const getUserCart = async (req, res) => {
  const userId = req.user.id;
  try {
    // get user cart
    const carts = await prisma.cart.findMany({
      where: { userid: userId },
      include: { 
        products: true 
      },
    });

    // calculate total price for each item
    const cartWithTotals = carts.map(item => ({
      ...item,
      totalPrice: item.products.price * item.quantity
    }));

    res.json({
      success: true,
      data: cartWithTotals
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ 
      success: false,
      error: "Failed to fetch cart",
      details: error.message 
    });
  }
};

const removeFromCart = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    // Verify the cart item belongs to the user
    const cartItem = await prisma.cart.findFirst({
      where: { 
        id: parseInt(id),
        userid: userId
      }
    });

    // check if item is in cart
    if (!cartItem) {
      return res.status(404).json({
        success: false,
        error: "Cart item not found"
      });
    }

    // remove item from cart
    await prisma.cart.delete({ 
      where: { id: parseInt(id) } 
    });
    
    res.json({ 
      success: true,
      message: "Item removed from cart" 
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ 
      success: false,
      error: "Failed to remove item",
      details: error.message 
    });
  }
};

const updateCartQuantity = async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;
  const userId = req.user.id;

  // check if quantity is valid 
  if (!quantity || quantity <= 0) {
    return res.status(400).json({
      success: false,
      error: "Valid quantity is required"
    });
  }

  try {
    // Verify the cart item belongs to the user
    const cartItem = await prisma.cart.findFirst({
      where: { 
        id: parseInt(id),
        userid: userId
      },
      include: { products: true }
    });

    // check if item is in cart
    if (!cartItem) {
      return res.status(404).json({
        success: false,
        error: "Cart item not found"
      });
    }

    // Check if new quantity exceeds stock
    if (quantity > cartItem.products.stock) {
      return res.status(400).json({
        success: false,
        error: "Quantity exceeds available stock"
      });
    }

    // update item quantity
    const updated = await prisma.cart.update({
      where: { id: parseInt(id) },
      data: { quantity },
      include: { products: true }
    });

    res.json({
      success: true,
      data: updated
    });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ 
      success: false,
      error: "Failed to update quantity",
      details: error.message 
    });
  }
};

module.exports = {
  addToCart,
  getUserCart,
  removeFromCart,
  updateCartQuantity,
  validateCartInput
};
