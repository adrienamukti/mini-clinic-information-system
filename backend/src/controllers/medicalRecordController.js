const medicalRecordService = require(
    '../services/medicalRecordService'
);

const {
    successResponse,
    errorResponse,
} = require('../utils/response');

const createMedicalRecord = async (req, res) => {
    try {
        const medicalRecord =
            await medicalRecordService.createMedicalRecord(
                req.body,
                req.user
            );

        return successResponse(
            res,
            'Pemeriksaan pasien berhasil disimpan',
            medicalRecord,
            201
        );
    } catch (error) {
        if (error.code === 'REGISTRATION_NOT_FOUND') {
            return errorResponse(
                res,
                'Validation Error',
                {
                    registration_id:
                        'Pendaftaran tidak ditemukan',
                },
                422
            );
        }

        if (error.code === 'DOCTOR_NOT_ASSIGNED') {
            return errorResponse(
                res,
                'Akses ditolak',
                {
                    registration_id:
                        'Pendaftaran bukan milik dokter yang sedang login',
                },
                403
            );
        }

        if (
            error.code ===
            'INVALID_REGISTRATION_STATUS'
        ) {
            return errorResponse(
                res,
                'Pemeriksaan belum dapat dilakukan',
                {
                    registration_id:
                        'Pasien belum berada pada tahap Pemeriksaan',
                },
                409
            );
        }

        if (error.code === 'MEDICAL_RECORD_EXISTS') {
            return errorResponse(
                res,
                'Pemeriksaan sudah tersedia',
                {
                    registration_id:
                        'Pemeriksaan untuk kunjungan ini sudah tercatat',
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

const getMedicalRecordsByPatient = async (
    req,
    res
) => {
    try {
        const result =
            await medicalRecordService
                .getMedicalRecordsByPatientId(
                    req.params.patientId
                );

        if (!result) {
            return errorResponse(
                res,
                'Data pasien tidak ditemukan',
                {},
                404
            );
        }

        return successResponse(
            res,
            'Riwayat pemeriksaan berhasil diambil',
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

module.exports = {
    createMedicalRecord,
    getMedicalRecordsByPatient,
};