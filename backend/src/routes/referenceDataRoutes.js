const express = require('express');

const {
    getDoctors,
    getPolyclinics,
} = require(
    '../controllers/referenceDataController'
);

const authenticate = require(
    '../middlewares/authMiddleware'
);

const router = express.Router();

router.get(
    '/doctors',
    authenticate,
    getDoctors
);

router.get(
    '/polyclinics',
    authenticate,
    getPolyclinics
);

module.exports = router;