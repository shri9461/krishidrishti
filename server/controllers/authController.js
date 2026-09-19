import jwt from 'jsonwebtoken';
import { User, Admin } from '../models/schemas.js';
import { sendOTPEmail } from '../utils/email.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

export const register = async (req, res) => {
  const { name, email, password, phone, location, state } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const user = await User.create({ name, email, password, phone, location, state });
    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: 'farmer',
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password, role } = req.body;
  try {
    if (role === 'admin') {
      const admin = await Admin.findOne({ email });
      if (admin && (await admin.comparePassword(password))) {
        return res.json({
          success: true,
          data: {
            _id: admin._id,
            name: admin.name,
            email: admin.email,
            role: 'admin',
            token: generateToken(admin._id),
          },
        });
      }
      return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    } else {
      const user = await User.findOne({ email });
      if (user && (await user.comparePassword(password))) {
        return res.json({
          success: true,
          data: {
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            location: user.location,
            state: user.state,
            preferredLanguage: user.preferredLanguage,
            role: 'farmer',
            token: generateToken(user._id),
          },
        });
      }
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'Email not found' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetOTP = otp;
    user.resetOTPExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    await sendOTPEmail(user.email, otp);
    res.json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  try {
    const user = await User.findOne({ email, resetOTP: otp, resetOTPExpires: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });

    user.password = newPassword;
    user.resetOTP = null;
    user.resetOTPExpires = null;
    await user.save();

    res.json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      user.name = req.body.name || user.name;
      user.phone = req.body.phone || user.phone;
      user.location = req.body.location || user.location;
      user.state = req.body.state || user.state;
      user.preferredLanguage = req.body.preferredLanguage || user.preferredLanguage;
      if (req.body.password) user.password = req.body.password;

      const updatedUser = await user.save();
      res.json({
        success: true,
        data: {
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          phone: updatedUser.phone,
          location: updatedUser.location,
          state: updatedUser.state,
          preferredLanguage: updatedUser.preferredLanguage,
          role: 'farmer',
          token: generateToken(updatedUser._id),
        },
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
