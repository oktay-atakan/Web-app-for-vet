const { Router } = require('express');
const healthRoutes = require('./health.routes');
const authRoutes = require('./auth.routes');
const usersRoutes = require('./users.routes');
const customersRoutes = require('./customers.routes');
const petsRoutes = require('./pets.routes');
const proceduresRoutes = require('./procedures.routes');

const router = Router();

router.use(healthRoutes);
router.use(authRoutes);
router.use(usersRoutes);
router.use(customersRoutes);
router.use(petsRoutes);
router.use(proceduresRoutes);

module.exports = router;
