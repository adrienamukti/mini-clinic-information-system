const express = require('express');

const {
    getRegistrations,
    createRegistration,
    updateRegistration,
} = require('../controllers/registrationController');

const authenticate = require(
    '../middlewares/authMiddleware'
);

const authorize = require(
    '../middlewares/roleMiddleware'
);

const validate = require(
    '../middlewares/validationMiddleware'
);

const {
    createRegistrationValidator,
    updateRegistrationValidator,
    registrationIdValidator,
} = require('../validators/registrationValidator');

const router = express.Router();

router.get(
    '/registrations',
    authenticate,
    getRegistrations
);

router.post(
    '/registrations',
    authenticate,

    (req, res, next) => {
        console.log('CONTENT TYPE:', req.headers['content-type']);
        console.log('BODY:', req.body);
        next();
    },

    authorize(
        'Administrator',
        'Petugas Pendaftaran'
    ),
    createRegistrationValidator,
    validate,
    createRegistration
);

router.put(
    '/registrations/:id',
    authenticate,
    authorize(
        'Administrator',
        'Petugas Pendaftaran'
    ),
    registrationIdValidator,
    updateRegistrationValidator,
    validate,
    updateRegistration
);

module.exports = router;