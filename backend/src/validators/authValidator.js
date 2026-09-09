const { body } = require('express-validator');

const loginValidator = [
    body('email')
        .notEmpty()
        .withMessage('Email wajib diisi')
        .isEmail()
        .withMessage('Format email tidak valid'),

    body('password')
        .notEmpty()
        .withMessage('Password wajib diisi'),
];

module.exports = {
    loginValidator,
};