const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');
const bcrypt = require('bcryptjs');

const router = express.Router();

// ============================================
// GET ENDPOINTS
// ============================================

// Get current user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all users (Admin only)
router.get('/', auth, async (req, res) => {
  try {
    // Check if user is admin
    const requestingUser = await User.findById(req.user.id);
    if (requestingUser.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can view all users' });
    }

    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ============================================
// PUT ENDPOINTS (Update)
// ============================================

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { 
      name, 
      phone, 
      dateOfBirth, 
      gender, 
      address, 
      city, 
      state, 
      zipCode, 
      medicalHistory, 
      allergies, 
      emergencyContact 
    } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        name,
        phone,
        dateOfBirth,
        gender,
        address,
        city,
        state,
        zipCode,
        medicalHistory,
        allergies,
        emergencyContact,
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ 
      success: true, 
      message: 'Profile updated successfully',
      user 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Change password
router.put('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Validate inputs
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'All password fields are required' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'New passwords do not match' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Get user with password
    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check current password
    const isPasswordCorrect = await user.matchPassword(currentPassword);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ 
      success: true, 
      message: 'Password changed successfully' 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user role (Admin only)
router.put('/:id/role', auth, async (req, res) => {
  try {
    // Check if requesting user is admin
    const requestingUser = await User.findById(req.user.id);
    if (requestingUser.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can update user roles' });
    }

    const { role } = req.body;
    const validRoles = ['patient', 'doctor', 'admin'];
    
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Valid roles: patient, doctor, admin' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role, updatedAt: new Date() },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ 
      success: true, 
      message: 'User role updated successfully',
      user 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ============================================
// DELETE ENDPOINTS
// ============================================

// Delete user account (own account)
router.delete('/profile', auth, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ 
      success: true, 
      message: 'User account deleted successfully' 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete user by ID (Admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    // Check if requesting user is admin
    const requestingUser = await User.findById(req.user.id);
    if (requestingUser.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can delete users' });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ 
      success: true, 
      message: 'User deleted successfully' 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ============================================
// SEARCH ENDPOINTS
// ============================================

// Search users by name or email (Admin only)
router.get('/search/:query', auth, async (req, res) => {
  try {
    // Check if requesting user is admin
    const requestingUser = await User.findById(req.user.id);
    if (requestingUser.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can search users' });
    }

    const { query } = req.params;

    const users = await User.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { phone: { $regex: query, $options: 'i' } }
      ]
    }).select('-password');

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get users by role (Admin only)
router.get('/role/:role', auth, async (req, res) => {
  try {
    // Check if requesting user is admin
    const requestingUser = await User.findById(req.user.id);
    if (requestingUser.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can filter users by role' });
    }

    const { role } = req.params;
    const validRoles = ['patient', 'doctor', 'admin'];
    
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const users = await User.find({ role }).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ============================================
// STATS ENDPOINTS
// ============================================

// Get user statistics (Admin only)
router.get('/stats', auth, async (req, res) => {
  try {
    // Check if requesting user is admin
    const requestingUser = await User.findById(req.user.id);
    if (requestingUser.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can view statistics' });
    }

    const totalUsers = await User.countDocuments();
    const patients = await User.countDocuments({ role: 'patient' });
    const doctors = await User.countDocuments({ role: 'doctor' });
    const admins = await User.countDocuments({ role: 'admin' });

    res.json({
      totalUsers,
      patients,
      doctors,
      admins
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;