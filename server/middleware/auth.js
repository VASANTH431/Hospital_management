const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Doctor = require('../models/Doctor');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (decoded.role === 'admin') {
        req.user = await Admin.findById(decoded.id).select('-password');
      } else if (decoded.role === 'doctor') {
        req.user = await Doctor.findOne({ id: decoded.id }).select('-password');
      } else if (decoded.role === 'attender') {
        // For patient attender, store the patient ID in req.user
        req.user = { id: decoded.id, role: 'attender' };
      }

      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: `Role ${req.user ? req.user.role : 'none'} is not authorized to access this route` });
    }
    next();
  };
};

module.exports = { protect, authorize };
