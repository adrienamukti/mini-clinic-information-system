const express = require('express');

const {
    getDashboard,
} = require('../controllers/dashboardController');

const authenticate = require(
    '../middlewares/authMiddleware'
);

const router = express.Router();

router.get(
    '/dashboard',
    authenticate,
    getDashboard
);

module.exports = router;