const User = require('../models/User');

/**
 * @desc    Get user profile data
 * @route   GET /api/user/profile
 */
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * @desc    Simulate buying credits (Stripe placeholder)
 * @route   POST /api/user/add-credits
 */
const addCredits = async (req, res) => {
  try {
    const { amount } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $inc: { credits: amount } },
      { new: true }
    ).select('-password');

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getProfile,
  addCredits
};
