const patientService = require('../services/patientService');

const {
    successResponse,
    errorResponse,
} = require('../utils/response');

const getPatients = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const search = req.query.search || '';

        const result = await patientService.getPatients({
            page,
            limit,
            search,
        });

        return successResponse(
            res,
            'Data pasien berhasil diambil',
            result
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

const getPatientById = async (req, res) => {
    try {
        const patient = await patientService.getPatientById(
            req.params.id
        );

        if (!patient) {
            return errorResponse(
                res,
                'Data pasien tidak ditemukan',
                {},
                404
            );
        }

        return successResponse(
            res,
            'Detail pasien berhasil diambil',
            patient
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

const createPatient = async (req, res) => {
    try {
        const patient =
            await patientService.createPatient(req.body);

        return successResponse(
            res,
            'Data pasien berhasil ditambahkan',
            patient,
            201
        );
    } catch (error) {
        if (error.code === 'NIK_DUPLICATE') {
            return errorResponse(
                res,
                'Validation Error',
                {
                    nik: 'NIK sudah terdaftar',
                },
                422
            );
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

const updatePatient = async (req, res) => {
    try {
        const patient =
            await patientService.updatePatient(
                req.params.id,
                req.body
            );

        if (!patient) {
            return errorResponse(
                res,
                'Data pasien tidak ditemukan',
                {},
                404
            );
        }

        return successResponse(
            res,
            'Data pasien berhasil diperbarui',
            patient
        );
    } catch (error) {
        if (error.code === 'NIK_DUPLICATE') {
            return errorResponse(
                res,
                'Validation Error',
                {
                    nik: 'NIK sudah terdaftar',
                },
                422
            );
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

const deletePatient = async (req, res) => {
    try {
        const deleted =
            await patientService.deletePatient(req.params.id);

        if (!deleted) {
            return errorResponse(
                res,
                'Data pasien tidak ditemukan',
                {},
                404
            );
        }

        return successResponse(
            res,
            'Data pasien berhasil dihapus',
            {}
        );
    } catch (error) {
        if (error.code === 'PATIENT_HAS_RELATIONS') {
            return errorResponse(
                res,
                'Data pasien tidak dapat dihapus',
                {
                    patient:
                        'Pasien memiliki data kunjungan',
                },
                409
            );
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
    getPatients,
    getPatientById,
    createPatient,
    updatePatient,
    deletePatient,
};