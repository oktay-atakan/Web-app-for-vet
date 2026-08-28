const { Router } = require('express');
const { body, param, query } = require('express-validator');
const petsController = require('../controllers/pets.controller');
const authenticate = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/authorize.middleware');
const validate = require('../middlewares/validate.middleware');
const asyncHandler = require('../utils/asyncHandler');

const router = Router();

router.use('/pets', authenticate);

router.get(
  '/pets',
  [query('customerId').optional().isInt()],
  validate,
  asyncHandler(petsController.list)
);

router.get('/pets/:id', [param('id').isInt()], validate, asyncHandler(petsController.getOne));

router.post(
  '/pets',
  authorize('admin', 'vet'),
  [
    body('customerId').isInt().withMessage('customerId is required'),
    body('name').notEmpty().withMessage('Name is required'),
    body('species').notEmpty().withMessage('Species is required'),
    body('breed').optional({ values: 'falsy' }).isString(),
    body('birthDate').optional({ values: 'falsy' }).isISO8601().withMessage('birthDate must be a valid date'),
    body('weightKg').optional({ values: 'falsy' }).isFloat({ min: 0 }),
    body('notes').optional({ values: 'falsy' }).isString(),
  ],
  validate,
  asyncHandler(petsController.create)
);

router.put(
  '/pets/:id',
  authorize('admin', 'vet'),
  [
    param('id').isInt(),
    body('name').optional().notEmpty(),
    body('species').optional().notEmpty(),
    body('breed').optional({ values: 'falsy' }).isString(),
    body('birthDate').optional({ values: 'falsy' }).isISO8601().withMessage('birthDate must be a valid date'),
    body('weightKg').optional({ values: 'falsy' }).isFloat({ min: 0 }),
    body('notes').optional({ values: 'falsy' }).isString(),
  ],
  validate,
  asyncHandler(petsController.update)
);

router.delete(
  '/pets/:id',
  authorize('admin'),
  [param('id').isInt()],
  validate,
  asyncHandler(petsController.remove)
);

module.exports = router;