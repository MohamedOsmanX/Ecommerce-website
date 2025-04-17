const prisma = require("../lib/prisma");
const bcrypt = require("bcryptjs");

const getUserProfile = async (req, res) => {
  try {
    console.log('User object from request:', req.user);
    
    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      console.log('Authentication failed - no user or user ID');
      return res.status(401).json({
        success: false,
        error: "Unauthorized: User not authenticated"
      });
    }

    // Convert userId to integer if it's a string
    const userId = parseInt(req.user.id);
    console.log('Parsed user ID:', userId);

    if (isNaN(userId)) {
      console.log('Invalid user ID format:', req.user.id);
      return res.status(400).json({
        success: false,
        error: "Invalid user ID format"
      });
    }

    // Get user by id with selected fields
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdat: true
      }
    }).catch(error => {
      console.error('Database query error:', error);
      throw error;
    });

    console.log('Database query result:', user ? 'User found' : 'User not found');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    // Format dates for better readability
    const formattedUser = {
      ...user,
      createdat: user.createdat ? new Date(user.createdat).toISOString() : null
    };

    console.log('Formatted user data:', formattedUser);

    res.json({
      success: true,
      data: formattedUser
    });
  } catch (error) {
    console.error('Get profile error details:', {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id,
      errorType: error.constructor.name
    });
    
    res.status(500).json({
      success: false,
      error: "Failed to fetch profile",
      details: error.message
    });
  }
};


const updateUserProfile = async (req, res) => {
  const userId = req.user.id;
  const { name, email } = req.body;

  try {
    // Check if email is already taken by another user
    if (email) {
      const existingUser = await prisma.users.findFirst({
        where: {
          email,
          NOT: {
            id: userId
          }
        }
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: "Email is already taken"
        });
      }
    }

    // update user by id
    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: {
        name,
        email
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdat: true
      }
    });

    res.json({
      success: true,
      data: updatedUser
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: "Failed to update profile",
      details: error.message
    });
  }
};


const changePassword = async (req, res) => {
  const userId = req.user.id;
  const { currentPassword, newPassword } = req.body;

  try {
    // Get user with current password
    const user = await prisma.users.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        error: "Current password is incorrect"
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.users.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    res.json({
      success: true,
      message: "Password updated successfully"
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      error: "Failed to change password",
      details: error.message
    });
  }
};


const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await prisma.users.findUnique({
      where: { email }
    });

    if (!user) {
      // Return success even if user not found for security
      return res.json({
        success: true,
        message: "If your email is registered, you will receive a password reset link"
      });
    }

    // Generate reset token 
    const resetToken = Math.random().toString(36).substring(2, 15);
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Save reset token to database
    await prisma.users.update({
      where: { id: user.id },
      data: {
        reset_token: resetToken,
        reset_token_expiry: resetTokenExpiry
      }
    });

    // TODO: Send email with reset link
    // For now, just return the token in response
    res.json({
      success: true,
      message: "Password reset link sent to your email",
      resetToken
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      error: "Failed to process password reset request",
      details: error.message
    });
  }
};


const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const user = await prisma.users.findFirst({
      where: {
        reset_token: token,
        reset_token_expiry: {
          gt: new Date()
        }
      }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: "Invalid or expired reset token"
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset token
    await prisma.users.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        reset_token: null,
        reset_token_expiry: null
      }
    });

    res.json({
      success: true,
      message: "Password reset successfully"
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      error: "Failed to reset password",
      details: error.message
    });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  changePassword,
  forgotPassword,
  resetPassword
}; 