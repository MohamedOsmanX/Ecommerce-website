const jwt = require('jsonwebtoken');
require('dotenv').config();


const authenticateToken = (req, res, next) => {
    console.log('Auth headers:', req.headers['authorization']);
    
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if(!token) {
        console.log('No token provided');
        return res.status(401).json({ 
            success: false,
            error: 'Access denied. No token provided.' 
        });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            console.error('Token verification error:', err.message);
            return res.status(403).json({ 
                success: false,
                error: 'Invalid token' 
            });
        }
        
        console.log('Decoded token:', decoded);
        
        // Set the user information in the request object
        req.user = {
            id: decoded.id,
            role: decoded.role
        };
        
        next();
    });
};

module.exports = authenticateToken;


