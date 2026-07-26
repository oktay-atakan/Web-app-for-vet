const { Router } = require('express');
const healthRoutes = require('./health.routes');
const authRoutes = require('./auth.routes');
const usersRoutes = require('./users.routes');

const router = Router();

router.use(healthRoutes);
router.use(authRoutes);
router.use(usersRoutes);

module.exports = router;
