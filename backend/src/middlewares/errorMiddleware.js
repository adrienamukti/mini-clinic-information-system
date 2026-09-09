const { errorResponse } = require('../utils/response');

const errorHandler = (error, req, res, next) => {
    console.error(error);

    if (
        error instanceof SyntaxError &&
        error.status === 400 &&
        'body' in error
    ) {
        return errorResponse(
            res,
            'JSON tidak valid',
            {
                body: 'Format JSON request tidak valid',
            },
            400
        );
    }

    return errorResponse(
        res,
        'Terjadi kesalahan pada server',
        {},
        500
    );
};

module.exports = errorHandler;