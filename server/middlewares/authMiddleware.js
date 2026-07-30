import jwt from 'jsonwebtoken';
import { User, Admin } from '../models/schemas.js';

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attempt to find in User (Farmer) first
      let entity = await User.findById(decoded.id).select('-password');
      let role = 'farmer';

      // If not user, search in Admin
      if (!entity) {
        entity = await Admin.findById(decoded.id).select('-password');
        role = 'admin';
      }

      if (!entity) {
        return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
      }

      req.user = entity;
      req.userRole = role;
      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }
};

export default protect;
