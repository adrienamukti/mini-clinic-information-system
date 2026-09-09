const { validationResult } = require('express-validator');
const { errorResponse } = require('../utils/response');

const validate = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const formattedErrors = {};

        errors.array().forEach((error) => {
            formattedErrors[error.path] = error.msg;
        });

        return errorResponse(
            res,
            'Validation Error',
            formattedErrors,
            422
        );
    }

    next();
};

module.exports = validate;