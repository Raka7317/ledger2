const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

// Checks for a valid "Authorization: Bearer <token>" header.
// On success, attaches { id, username, role } to req.user and continues.
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Login required.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, username, role }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Session expired or invalid. Please log in again.' });
  }
}

// Use AFTER verifyToken. Blocks anyone whose role isn't 'admin'.
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Only admins can do this.' });
  }
  next();
}

module.exports = { verifyToken, requireAdmin, JWT_SECRET };
