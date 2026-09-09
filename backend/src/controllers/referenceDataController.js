const referenceDataService = require(
    '../services/referenceDataService'
);

const {
    successResponse,
    errorResponse,
} = require('../utils/response');

const getDoctors = async (req, res) => {
    try {
        const doctors =
            await referenceDataService.getDoctors();

        return successResponse(
            res,
            'Data dokter berhasil diambil',
            doctors
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

const getPolyclinics = async (req, res) => {
    try {
        const polyclinics =
            await referenceDataService.getPolyclinics();

        return successResponse(
            res,
            'Data poli berhasil diambil',
            polyclinics
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
    getDoctors,
    getPolyclinics,
};