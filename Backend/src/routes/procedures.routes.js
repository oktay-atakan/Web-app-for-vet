const { Router } = require('express');
const { body, param } = require('express-validator');
const proceduresController = require('../controllers/procedures.controller');
const authenticate = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/authorize.middleware');
const validate = require('../middlewares/validate.middleware');
const asyncHandler = require('../utils/asyncHandler');

const router = Router();

const TYPES = ['vaccination', 'checkup', 'treatment', 'surgery', 'other'];

// Procedures are clinical data: staff get no access at all (403), unlike
// customers/pets which are read-only for staff.
router.use('/pets/:petId/procedures', authenticate, authorize('admin', 'vet'));
router.use('/procedures', authenticate, authorize('admin', 'vet'));

router.get(
  '/pets/:petId/procedures',
  [param('petId').isInt()],
  validate,
  asyncHandler(proceduresController.listForPet)
);

router.post(
  '/pets/:petId/procedures',
  [
    param('petId').isInt(),
    body('type').isIn(TYPES).withMessage(`Type must be one of: ${TYPES.join(', ')}`),
    body('name').notEmpty().withMessage('Name is required'),
    body('dateAdministered').isISO8601().withMessage('dateAdministered must be a valid date'),
    body('nextDueDate').optional({ values: 'falsy' }).isISO8601(),
    body('performedBy').optional({ values: 'falsy' }).isInt(),
    body('notes').optional({ values: 'falsy' }).isString(),
  ],
  validate,
  asyncHandler(proceduresController.createForPet)
);

router.put(
  '/procedures/:id',
  [
    param('id').isInt(),
    body('type').optional().isIn(TYPES).withMessage(`Type must be one of: ${TYPES.join(', ')}`),
    body('name').optional().notEmpty(),
    body('dateAdministered').optional().isISO8601(),
    body('nextDueDate').optional({ values: 'falsy' }).isISO8601(),
    body('performedBy').optional({ values: 'falsy' }).isInt(),
    body('notes').optional({ values: 'falsy' }).isString(),
  ],
  validate,
  asyncHandler(proceduresController.update)
);

router.delete(
  '/procedures/:id',
  authorize('admin'),
  [param('id').isInt()],
  validate,
  asyncHandler(proceduresController.remove)
);

module.exports = router;