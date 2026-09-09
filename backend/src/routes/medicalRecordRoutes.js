const express = require('express');

const {
    createMedicalRecord,
    getMedicalRecordsByPatient,
} = require(
    '../controllers/medicalRecordController'
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
    createMedicalRecordValidator,
    patientIdValidator,
} = require(
    '../validators/medicalRecordValidator'
);

const router = express.Router();

router.post(
    '/medical-records',
    authenticate,
    authorize('Dokter'),
    createMedicalRecordValidator,
    validate,
    createMedicalRecord
);

router.get(
    '/medical-records/:patientId',
    authenticate,
    patientIdValidator,
    validate,
    getMedicalRecordsByPatient
);

module.exports = router;