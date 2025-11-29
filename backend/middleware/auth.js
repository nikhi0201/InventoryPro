// backend/middleware/auth.js
const jwt = require('jsonwebtoken');

function auth(req, res, next) {
  const bearer = req.header('Authorization');
  if (!bearer) return res.status(401).json({ msg: 'No auth token' });
  const parts = bearer.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ msg: 'Invalid auth format' });
  const token = parts[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
    req.user = payload.user;
    next();
  } catch (err) {
    return res.status(401).json({ msg: 'Token invalid or expired' });
  }
}
module.exports = auth;
