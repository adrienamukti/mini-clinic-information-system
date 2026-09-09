const {
    body,
    param,
} = require('express-validator');

const baseRegistrationValidator = [
    body('patient_id')
        .isInt({ min: 1 })
        .withMessage('Pasien wajib dipilih'),

    body('doctor_id')
        .isInt({ min: 1 })
        .withMessage('Dokter wajib dipilih'),

    body('polyclinic_id')
        .isInt({ min: 1 })
        .withMessage('Poli wajib dipilih'),

    body('visit_date')
        .notEmpty()
        .withMessage('Tanggal kunjungan wajib diisi')
        .isISO8601({ strict: true })
        .withMessage('Format tanggal kunjungan tidak valid'),

    body('payment_type')
        .trim()
        .notEmpty()
        .withMessage('Jenis pembayaran wajib diisi')
        .isLength({ max: 50 })
        .withMessage(
            'Jenis pembayaran maksimal 50 karakter'
        ),

    body('initial_complaint')
        .trim()
        .notEmpty()
        .withMessage('Keluhan awal wajib diisi')
        .isLength({ max: 2000 })
        .withMessage(
            'Keluhan awal maksimal 2000 karakter'
        ),
];

const createRegistrationValidator = [
    ...baseRegistrationValidator,
];

const updateRegistrationValidator = [
    ...baseRegistrationValidator,

    body('status')
        .notEmpty()
        .withMessage('Status kunjungan wajib diisi')
        .isIn([
            'Menunggu',
            'Check In',
            'Pemeriksaan',
            'Selesai',
        ])
        .withMessage('Status kunjungan tidak valid'),
];

const registrationIdValidator = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('ID pendaftaran tidak valid'),
];

module.exports = {
    createRegistrationValidator,
    updateRegistrationValidator,
    registrationIdValidator,
};