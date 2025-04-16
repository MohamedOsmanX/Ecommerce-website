const prisma = require("../lib/prisma");

/**
 * Create a new order from cart items
 * @route POST /orders/create
 */
const createOrder = async (req, res) => {
  const userId = req.user.id;

  try {
    // Get user's cart items
    const cartItems = await prisma.cart.findMany({
      where: { userid: userId },
      include: { products: true }
    });

    if (cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Cart is empty"
      });
    }

    // Calculate total amount
    const total = cartItems.reduce((sum, item) => {
      return sum + (item.products.price * item.quantity);
    }, 0);

    // Create order and order items in a transaction
    const order = await prisma.$transaction(async (prisma) => {
      // Create the order
      const newOrder = await prisma.orders.create({
        data: {
          user_id: userId,
          total: total,
          status: "pending",
          order_items: {
            create: cartItems.map(item => ({
              product_id: item.productid,
              quantity: item.quantity,
              price: item.products.price
            }))
          }
        },
        include: {
          order_items: {
            include: {
              products: true
            }
          }
        }
      });

      // Update product stock
      for (const item of cartItems) {
        await prisma.products.update({
          where: { id: item.productid },
          data: { stock: { decrement: item.quantity } }
        });
      }

      // Clear the user's cart
      await prisma.cart.deleteMany({
        where: { userid: userId }
      });

      return newOrder;
    });

    res.status(201).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      error: "Failed to create order",
      details: error.message
    });
  }
};

// Get all orders (admin only)
const getAllOrders = async (req, res) => {
  try {
    console.log("Fetching all orders...");
    const orders = await prisma.orders.findMany({
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        order_items: {
          include: {
            products: true,
          },
        },
      },
    });
    console.log("Orders fetched successfully:", orders);
    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error("Error in getAllOrders:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to fetch orders", 
      details: error.message 
    });
  }
};

const getUserOrders = async (req, res) => {
  const userId = req.user.id;

  try {
    const orders = await prisma.orders.findMany({
      where: { user_id: userId },
      include: {
        order_items: {
          include: {
            products: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch orders",
      details: error.message
    });
  }
};

const getOrderById = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const order = await prisma.orders.findFirst({
      where: { 
        id: parseInt(id),
        user_id: userId
      },
      include: {
        order_items: {
          include: {
            products: true
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order not found"
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch order",
      details: error.message
    });
  }
};

const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // Validate status
  const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      error: "Invalid status. Must be one of: " + validStatuses.join(', ')
    });
  }

  try {
    const order = await prisma.orders.update({
      where: { id: parseInt(id) },
      data: { status },
      include: {
        order_items: {
          include: {
            products: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      error: "Failed to update order status",
      details: error.message
    });
  }
};

/**
 * Cancel an order
 * @route POST /orders/:id/cancel
 */
const cancelOrder = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const order = await prisma.orders.findFirst({
      where: { 
        id: parseInt(id),
        user_id: userId,
        status: 'pending'
      },
      include: {
        order_items: true
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order not found or cannot be cancelled"
      });
    }

    // Restore product stock and update order status in a transaction
    await prisma.$transaction(async (prisma) => {
      // Restore product stock
      for (const item of order.order_items) {
        await prisma.products.update({
          where: { id: item.product_id },
          data: { stock: { increment: item.quantity } }
        });
      }

      // Update order status
      await prisma.orders.update({
        where: { id: order.id },
        data: { status: 'cancelled' }
      });
    });

    res.json({
      success: true,
      message: "Order cancelled successfully"
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      error: "Failed to cancel order",
      details: error.message
    });
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  getAllOrders
}; 