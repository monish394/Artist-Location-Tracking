// middleware/auth.js
import jwt from 'jsonwebtoken';

export const auth = (req, res, next) => {
  try {
    // Expect token in Authorization header: "Bearer <token>"
    const authHeader = req.headers.authorization || '';

    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not defined in environment variables');
      return res
        .status(500)
        .json({ msg: 'Server misconfiguration. Please contact support.' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Your token payload is: { user: { id, role } }
    // Attach to request so controllers can use req.user, req.userId, req.userRole
    if (decoded.user) {
      req.user = decoded.user;        // { id, role }
      req.userid = decoded.user.id;
      req.userRole = decoded.user.role;
    } else {
      // fallback if you ever change the payload shape
      req.user = decoded;
      req.userId = decoded.id;
      req.userRole = decoded.role;
    }

    return next();
  } catch (err) {
    console.error('Auth middleware error:', err.message);
    return res.status(401).json({ msg: 'Token is not valid' });
  }
};

/**
 * Role-based authorization middleware
 * Usage: router.get('/admin', auth, requireRole('admin'), handler)
 */
export const requireRole = (...allowedRoles) => (req, res, next) => {
  try {
    if (!req.user || !req.userRole) {
      return res.status(401).json({ msg: 'Not authenticated' });
    }

    if (!allowedRoles.includes(req.userRole)) {
      return res.status(403).json({ msg: 'Access denied for this role' });
    }

    return next();
  } catch (err) {
    console.error('requireRole middleware error:', err.message);
    return res.status(500).json({ msg: 'Server error' });
  }
};