const {
    body,
    param,
} = require('express-validator');

const createPrescriptionValidator = [
    body('medical_record_id')
        .notEmpty()
        .withMessage('Data pemeriksaan wajib dipilih')
        .isInt({ min: 1 })
        .withMessage('ID pemeriksaan tidak valid'),

    body('notes')
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ max: 2000 })
        .withMessage('Catatan maksimal 2000 karakter'),

    body('items')
        .isArray({ min: 1 })
        .withMessage(
            'Resep minimal harus memiliki satu obat'
        ),

    body('items.*.medicine_name')
        .trim()
        .notEmpty()
        .withMessage('Nama obat wajib diisi')
        .isLength({ max: 150 })
        .withMessage('Nama obat maksimal 150 karakter'),

    body('items.*.dosage')
        .trim()
        .notEmpty()
        .withMessage('Dosis obat wajib diisi'),

    body('items.*.frequency')
        .trim()
        .notEmpty()
        .withMessage('Frekuensi obat wajib diisi'),

    body('items.*.duration')
        .optional({ checkFalsy: true })
        .trim(),

    body('items.*.quantity')
        .notEmpty()
        .withMessage('Jumlah obat wajib diisi')
        .isInt({ min: 1 })
        .withMessage(
            'Jumlah obat harus berupa angka minimal 1'
        ),

    body('items.*.instructions')
        .optional({ checkFalsy: true })
        .trim(),
];

const prescriptionIdValidator = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('ID resep tidak valid'),
];

module.exports = {
    createPrescriptionValidator,
    prescriptionIdValidator,
};