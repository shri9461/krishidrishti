const adminOnly = (req, res, next) => {
  if (req.user && req.userRole === 'admin') {
    next();
  } else {
    return res.status(403).json({ success: false, message: 'Access denied: Admin access required' });
  }
};

export default adminOnly;
