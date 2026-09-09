const {
    body,
    param,
    query,
} = require('express-validator');

const patientValidator = [
    body('nik')
        .notEmpty()
        .withMessage('NIK wajib diisi')
        .matches(/^\d{16}$/)
        .withMessage('NIK harus terdiri dari 16 digit angka'),

    body('name')
        .trim()
        .notEmpty()
        .withMessage('Nama pasien wajib diisi')
        .isLength({ max: 100 })
        .withMessage('Nama pasien maksimal 100 karakter'),

    body('gender')
        .notEmpty()
        .withMessage('Jenis kelamin wajib diisi')
        .isIn(['Laki-laki', 'Perempuan'])
        .withMessage('Jenis kelamin tidak valid'),

    body('date_of_birth')
        .notEmpty()
        .withMessage('Tanggal lahir wajib diisi')
        .isISO8601({ strict: true })
        .withMessage('Format tanggal lahir tidak valid')
        .custom((value) => {
            if (new Date(value) > new Date()) {
                throw new Error(
                    'Tanggal lahir tidak boleh melebihi hari ini'
                );
            }

            return true;
        }),

    body('phone')
        .optional({ checkFalsy: true })
        .matches(/^[0-9+\-\s()]{8,20}$/)
        .withMessage('Nomor telepon tidak valid'),

    body('address')
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Alamat maksimal 1000 karakter'),
];

const patientIdValidator = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('ID pasien tidak valid'),
];

const patientListValidator = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page harus berupa angka minimal 1'),

    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit harus antara 1 sampai 100'),

    query('search')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Pencarian maksimal 100 karakter'),
];

module.exports = {
    patientValidator,
    patientIdValidator,
    patientListValidator,
};