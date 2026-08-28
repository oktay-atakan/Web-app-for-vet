const authService = require('../services/auth.service');

async function login(req, res) {
  const { email, password } = req.body;
  const result = await authService.login(email, password);
  res.json(result);
}

module.exports = { login };