const { Router } = require('express');
const { body, param, query } = require('express-validator');
const appointmentsController = require('../controllers/appointments.controller');
const authenticate = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/authorize.middleware');
const validate = require('../middlewares/validate.middleware');
const asyncHandler = require('../utils/asyncHandler');

const router = Router();

const STATUSES = ['scheduled', 'completed', 'cancelled', 'no_show'];

// Appointments are front-desk data: open to all three roles for read/write.
router.use('/appointments', authenticate);

router.get(
  '/appointments',
  [
    query('status').optional().isIn(STATUSES).withMessage(`status must be one of: ${STATUSES.join(', ')}`),
    query('customerId').optional().isInt(),
  ],
  validate,
  asyncHandler(appointmentsController.list)
);

router.get(
  '/appointments/:id',
  [param('id').isInt()],
  validate,
  asyncHandler(appointmentsController.getOne)
);

router.post(
  '/appointments',
  [
    body('customerId').isInt().withMessage('customerId is required'),
    body('petId').optional({ values: 'falsy' }).isInt(),
    body('scheduledAt').isISO8601().withMessage('scheduledAt must be a valid date-time'),
    body('status').optional().isIn(STATUSES).withMessage(`status must be one of: ${STATUSES.join(', ')}`),
    body('reason').optional({ values: 'falsy' }).isString(),
    body('assignedTo').optional({ values: 'falsy' }).isInt(),
  ],
  validate,
  asyncHandler(appointmentsController.create)
);

router.put(
  '/appointments/:id',
  [
    param('id').isInt(),
    body('petId').optional({ values: 'falsy' }).isInt(),
    body('scheduledAt').optional().isISO8601().withMessage('scheduledAt must be a valid date-time'),
    body('status').optional().isIn(STATUSES).withMessage(`status must be one of: ${STATUSES.join(', ')}`),
    body('reason').optional({ values: 'falsy' }).isString(),
    body('assignedTo').optional({ values: 'falsy' }).isInt(),
  ],
  validate,
  asyncHandler(appointmentsController.update)
);

router.delete(
  '/appointments/:id',
  authorize('admin', 'staff'),
  [param('id').isInt()],
  validate,
  asyncHandler(appointmentsController.remove)
);

module.exports = router;