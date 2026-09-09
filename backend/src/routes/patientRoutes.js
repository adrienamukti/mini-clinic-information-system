const express = require('express');

const {
    getPatients,
    getPatientById,
    createPatient,
    updatePatient,
    deletePatient,
} = require('../controllers/patientController');

const authenticate = require('../middlewares/authMiddleware');
const authorize = require('../middlewares/roleMiddleware');
const validate = require('../middlewares/validationMiddleware');

const {
    patientValidator,
    patientIdValidator,
    patientListValidator,
} = require('../validators/patientValidator');

const router = express.Router();

router.get(
    '/patients',
    authenticate,
    patientListValidator,
    validate,
    getPatients
);

router.get(
    '/patients/:id',
    authenticate,
    patientIdValidator,
    validate,
    getPatientById
);

router.post(
    '/patients',
    authenticate,
    authorize(
        'Administrator',
        'Petugas Pendaftaran'
    ),
    patientValidator,
    validate,
    createPatient
);

router.put(
    '/patients/:id',
    authenticate,
    authorize(
        'Administrator',
        'Petugas Pendaftaran'
    ),
    patientIdValidator,
    patientValidator,
    validate,
    updatePatient
);

router.delete(
    '/patients/:id',
    authenticate,
    authorize(
        'Administrator',
        'Petugas Pendaftaran'
    ),
    patientIdValidator,
    validate,
    deletePatient
);

module.exports = router;