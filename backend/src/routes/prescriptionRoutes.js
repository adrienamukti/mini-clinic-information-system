const express = require('express');

const {
    createPrescription,
    getPrescription,
} = require(
    '../controllers/prescriptionController'
);

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
    createPrescriptionValidator,
    prescriptionIdValidator,
} = require(
    '../validators/prescriptionValidator'
);

const router = express.Router();

router.post(
    '/prescriptions',
    authenticate,
    authorize('Dokter'),
    createPrescriptionValidator,
    validate,
    createPrescription
);

router.get(
    '/prescriptions/:id',
    authenticate,
    prescriptionIdValidator,
    validate,
    getPrescription
);

module.exports = router;