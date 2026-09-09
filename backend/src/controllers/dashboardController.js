const dashboardService = require(
    '../services/dashboardService'
);

const {
    successResponse,
    errorResponse,
} = require('../utils/response');

const getDashboard = async (req, res) => {
    try {
        const dashboard =
            await dashboardService.getDashboardSummary();

        return successResponse(
            res,
            'Data dashboard berhasil diambil',
            dashboard
        );
    } catch (error) {
        console.error(error);

        return errorResponse(
            res,
            'Terjadi kesalahan pada server',
            {},
            500
        );
    }
};

module.exports = {
    getDashboard,
};