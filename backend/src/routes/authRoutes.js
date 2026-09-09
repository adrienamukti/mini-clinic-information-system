const express = require('express');

const {
    login,
    logout,
} = require('../controllers/authController');

const authenticate = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validationMiddleware');

const {
    loginValidator,
} = require('../validators/authValidator');

const router = express.Router();

router.post(
    '/login',
    loginValidator,
    validate,
    login
);

router.post(
    '/logout',
    authenticate,
    logout
);

module.exports = router;