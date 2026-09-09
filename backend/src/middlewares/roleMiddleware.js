const { errorResponse } = require('../utils/response');

const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (
            !req.user ||
            !allowedRoles.includes(req.user.role)
        ) {
            return errorResponse(
                res,
                'Anda tidak memiliki akses ke fitur ini',
                {},
                403
            );
        }

        next();
    };
};

module.exports = authorize;