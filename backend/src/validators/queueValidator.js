const {
    body,
    param,
    query,
} = require('express-validator');

const createQueueValidator = [
    body('registration_id')
        .notEmpty()
        .withMessage('Pendaftaran wajib dipilih')
        .isInt({ min: 1 })
        .withMessage('ID pendaftaran tidak valid'),
];

const queueIdValidator = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('ID antrean tidak valid'),
];

const updateQueueStatusValidator = [
    body('status')
        .notEmpty()
        .withMessage('Status antrean wajib diisi')
        .isIn([
            'Menunggu',
            'Dipanggil',
            'Selesai',
        ])
        .withMessage('Status antrean tidak valid'),
];

const queueListValidator = [
    query('date')
        .optional()
        .isISO8601({ strict: true })
        .withMessage('Format tanggal antrean tidak valid'),
];

module.exports = {
    createQueueValidator,
    queueIdValidator,
    updateQueueStatusValidator,
    queueListValidator,
};