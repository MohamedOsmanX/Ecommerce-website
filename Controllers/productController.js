const prisma = require("../lib/prisma");

const createProduct = async (req, res) => {
  const { name, description, price, category, imageurl, stock } = req.body;

  console.log(req.body); // Log the request body for debugging

  // Check for missing fields
  if (!name || !description || !price || !category || !imageurl || !stock) {
    return res.status(401).json({
      error:
        "Name, description, price, category, imageURL, and stock are required",
    });
  }

  try {
    // Await the result of the prisma create method
    const newProduct = await prisma.products.create({
      data: {
        name,
        description, // Corrected spelling
        price,
        category,
        imageurl,
        stock,
      },
    });

    // Respond with the newly created product
    res.status(201).json(newProduct);
  } catch (error) {
    console.error(error); // Log the error for debugging
    res
      .status(500)
      .json({ error: "Something went wrong while creating the product" });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const products = await prisma.products.findMany();
    res.status(200).json(products);
  } catch (error) {
    console.error(error); // Log the error for debugging
    res
      .status(500)
      .json({ error: "Something went wrong while fetching products" });
  }
};

const getProductById = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await prisma.products.findUnique({
      where: { id: parseInt(id) },
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.status(201).json(product);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Something went wrong while fetching the product" });
  }
};

const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await prisma.products.delete({
      where: { id: parseInt(id) },
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.status(201).json({ message: "Product has been deleted" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Something went wrong while deleting the product" });
  }
};

const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, description, price, category, imageurl, stock } = req.body;

  try {
    const updatedProduct = await prisma.products.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description,
        price,
        category,
        imageurl,
        stock,
      },
    });

    res.status(200).json(updatedProduct);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Something went wrong while updating the product" });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  deleteProduct,
  updateProduct,
};
