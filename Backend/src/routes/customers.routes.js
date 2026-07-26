const { Router } = require('express');
const { body, param } = require('express-validator');
const customersController = require('../controllers/customers.controller');
const authenticate = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/authorize.middleware');
const validate = require('../middlewares/validate.middleware');
const asyncHandler = require('../utils/asyncHandler');

const router = Router();

router.use('/customers', authenticate);

router.get('/customers', asyncHandler(customersController.list));

router.get(
  '/customers/:id',
  [param('id').isInt()],
  validate,
  asyncHandler(customersController.getOne)
);

router.post(
  '/customers',
  authorize('admin', 'vet'),
  [
    body('fullName').notEmpty().withMessage('Full name is required'),
    body('phone').optional({ values: 'falsy' }).isString(),
    body('email').optional({ values: 'falsy' }).isEmail().withMessage('Email must be valid'),
    body('address').optional({ values: 'falsy' }).isString(),
  ],
  validate,
  asyncHandler(customersController.create)
);

router.put(
  '/customers/:id',
  authorize('admin', 'vet'),
  [
    param('id').isInt(),
    body('fullName').optional().notEmpty(),
    body('phone').optional({ values: 'falsy' }).isString(),
    body('email').optional({ values: 'falsy' }).isEmail().withMessage('Email must be valid'),
    body('address').optional({ values: 'falsy' }).isString(),
  ],
  validate,
  asyncHandler(customersController.update)
);

router.delete(
  '/customers/:id',
  authorize('admin'),
  [param('id').isInt()],
  validate,
  asyncHandler(customersController.remove)
);

module.exports = router;