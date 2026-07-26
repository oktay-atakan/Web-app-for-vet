const { Router } = require('express');
const { body, param } = require('express-validator');
const usersController = require('../controllers/users.controller');
const authenticate = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/authorize.middleware');
const validate = require('../middlewares/validate.middleware');
const asyncHandler = require('../utils/asyncHandler');

const router = Router();

const ROLES = ['admin', 'vet', 'staff'];

router.use('/users', authenticate, authorize('admin'));

router.get('/users', asyncHandler(usersController.list));

router.get('/users/:id', [param('id').isInt()], validate, asyncHandler(usersController.getOne));

router.post(
  '/users',
  [
    body('email').isEmail().withMessage('A valid email is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('fullName').notEmpty().withMessage('Full name is required'),
    body('role').isIn(ROLES).withMessage(`Role must be one of: ${ROLES.join(', ')}`),
  ],
  validate,
  asyncHandler(usersController.create)
);

router.put(
  '/users/:id',
  [
    param('id').isInt(),
    body('fullName').optional().notEmpty(),
    body('role').optional().isIn(ROLES).withMessage(`Role must be one of: ${ROLES.join(', ')}`),
    body('isActive').optional().isBoolean(),
  ],
  validate,
  asyncHandler(usersController.update)
);

module.exports = router;