const bcrypt = require("bcryptjs");
const prisma = require("../lib/prisma"); // Ensure the path is correct
const jwt = require("jsonwebtoken");
require('dotenv').config();

const registerUser = async (req, res) => {
  const { email, password, name, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const existingUser = await prisma.users.findUnique({
    where: { email },
  });

  if (existingUser) {
    return res.status(400).json({ error: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.users.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: role || "customer", 
    },
  });

  res.status(201).json({ message: "User registered successfully" });
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  // Check if required fields are present
  if (!email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const user = await prisma.users.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      password: true,
      role: true,
      createdat: true
    }
  });

  // If no user is found
  if (!user) {
    return res.status(400).json({ error: "User not found" });
  }

  // Compare password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ error: "Invalid password" });
  }

  // Generate JWT token
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET, 
    { expiresIn: "1h" }
  );

  // Success response
  res.json({
    message: "Login successful",
    token,
  });
};

module.exports = { registerUser, loginUser };
