const {
    body,
    param,
} = require('express-validator');

const createMedicalRecordValidator = [
    body('registration_id')
        .notEmpty()
        .withMessage('Pendaftaran wajib dipilih')
        .isInt({ min: 1 })
        .withMessage('ID pendaftaran tidak valid'),

    body('subjective_complaint')
        .trim()
        .notEmpty()
        .withMessage('Keluhan pasien wajib diisi'),

    body('blood_pressure')
        .optional({ checkFalsy: true })
        .matches(/^\d{2,3}\/\d{2,3}$/)
        .withMessage(
            'Tekanan darah harus menggunakan format seperti 120/80'
        ),

    body('temperature')
        .optional({ checkFalsy: true })
        .isFloat({ min: 30, max: 45 })
        .withMessage(
            'Suhu tubuh harus antara 30 sampai 45 derajat Celsius'
        ),

    body('weight')
        .optional({ checkFalsy: true })
        .isFloat({ min: 1, max: 500 })
        .withMessage(
            'Berat badan tidak valid'
        ),

    body('height')
        .optional({ checkFalsy: true })
        .isFloat({ min: 30, max: 250 })
        .withMessage(
            'Tinggi badan tidak valid'
        ),

    body('diagnosis')
        .trim()
        .notEmpty()
        .withMessage('Diagnosa wajib diisi'),

    body('therapy_plan')
        .trim()
        .notEmpty()
        .withMessage('Rencana terapi wajib diisi'),

    body('medical_actions')
        .optional()
        .isArray()
        .withMessage(
            'Tindakan medis harus berupa array'
        ),

    body('medical_actions.*.action_name')
        .if(body('medical_actions').exists())
        .trim()
        .notEmpty()
        .withMessage(
            'Nama tindakan medis wajib diisi'
        ),

    body('medical_actions.*.notes')
        .optional({ checkFalsy: true })
        .trim(),
];

const patientIdValidator = [
    param('patientId')
        .isInt({ min: 1 })
        .withMessage('ID pasien tidak valid'),
];

module.exports = {
    createMedicalRecordValidator,
    patientIdValidator,
};