const { Router } = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller');
const validate = require('../middlewares/validate.middleware');
const asyncHandler = require('../utils/asyncHandler');

const router = Router();

router.post(
  '/auth/login',
  [body('email').isEmail().withMessage('A valid email is required'), body('password').notEmpty().withMessage('Password is required')],
  validate,
  asyncHandler(authController.login)
);

module.exports = router;