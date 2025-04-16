const express = require('express');
const { registerUser, loginUser } = require('../Controllers/authControllers.js');
const authenticateToken = require('../middleware/auth.js');
const authRouter = express.Router();

authRouter.post('/register', registerUser);
authRouter.post('/login', loginUser);
authRouter.get('/protected-route', authenticateToken, (req, res) => {
    res.json({ message: 'You have access!', user: req.user });
});





module.exports = authRouter;