const jwt = require('jsonwebtoken');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');

function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return next(ApiError.unauthorized('Missing or malformed Authorization header'));
  }

  try {
    const payload = jwt.verify(token, env.jwt.secret);
    req.user = { userId: payload.userId, role: payload.role };
    next();
  } catch (err) {
    next(ApiError.unauthorized('Invalid or expired token'));
  }
}

module.exports = authenticate;
