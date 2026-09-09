const registrationService = require(
    '../services/registrationService'
);

const {
    successResponse,
    errorResponse,
} = require('../utils/response');

const handleReferenceError = (res, error) => {
    switch (error.code) {
        case 'PATIENT_NOT_FOUND':
            return errorResponse(
                res,
                'Validation Error',
                {
                    patient_id: 'Pasien tidak ditemukan',
                },
                422
            );

        case 'DOCTOR_NOT_FOUND':
            return errorResponse(
                res,
                'Validation Error',
                {
                    doctor_id: 'Dokter tidak ditemukan',
                },
                422
            );

        case 'POLYCLINIC_NOT_FOUND':
            return errorResponse(
                res,
                'Validation Error',
                {
                    polyclinic_id: 'Poli tidak ditemukan',
                },
                422
            );

        case 'DOCTOR_POLYCLINIC_MISMATCH':
            return errorResponse(
                res,
                'Validation Error',
                {
                    doctor_id:
                        'Dokter tidak terdaftar pada poli yang dipilih',
                },
                422
            );

        default:
            return null;
    }
};

const getRegistrations = async (req, res) => {
    try {
        const registrations =
            await registrationService.getRegistrations();

        return successResponse(
            res,
            'Data pendaftaran berhasil diambil',
            registrations
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

const createRegistration = async (req, res) => {
    try {
        const registration =
            await registrationService.createRegistration(
                req.body
            );

        return successResponse(
            res,
            'Pendaftaran pasien berhasil dibuat',
            registration,
            201
        );
    } catch (error) {
        const response = handleReferenceError(res, error);

        if (response) {
            return response;
        }

        console.error(error);

        return errorResponse(
            res,
            'Terjadi kesalahan pada server',
            {},
            500
        );
    }
};

const updateRegistration = async (req, res) => {
    try {
        const registration =
            await registrationService.updateRegistration(
                req.params.id,
                req.body
            );

        if (!registration) {
            return errorResponse(
                res,
                'Data pendaftaran tidak ditemukan',
                {},
                404
            );
        }

        return successResponse(
            res,
            'Data pendaftaran berhasil diperbarui',
            registration
        );
    } catch (error) {
        const response = handleReferenceError(res, error);

        if (response) {
            return response;
        }

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
    getRegistrations,
    createRegistration,
    updateRegistration,
};
