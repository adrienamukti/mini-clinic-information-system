const jwt = require('jsonwebtoken');
const { errorResponse } = require('../utils/response');

const authenticate = (req, res, next) => {
    const authorizationHeader = req.headers.authorization;

    if (
        !authorizationHeader ||
        !authorizationHeader.startsWith('Bearer ')
    ) {
        return errorResponse(
            res,
            'Token tidak ditemukan',
            {},
            401
        );
    }

    const token = authorizationHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.user = decoded;

        next();
    } catch (error) {
        return errorResponse(
            res,
            'Token tidak valid atau telah kedaluwarsa',
            {},
            401
        );
    }
};

module.exports = authenticate;