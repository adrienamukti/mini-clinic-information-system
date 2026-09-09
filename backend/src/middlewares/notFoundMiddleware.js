const { errorResponse } = require('../utils/response');

const notFound = (req, res) => {
    return errorResponse(
        res,
        'Endpoint tidak ditemukan',
        {
            path: req.originalUrl,
        },
        404
    );
};

module.exports = notFound;