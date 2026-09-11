const prescriptionService =
    require(
        '../services/prescriptionService'
    );

const {
    successResponse,
    errorResponse,
} = require('../utils/response');

/*
 * =========================================
 * CREATE PRESCRIPTION
 * =========================================
 */
const createPrescription =
    async (req, res) => {
        try {
            const prescription =
                await prescriptionService
                    .createPrescription(
                        req.body,
                        req.user
                    );

            return successResponse(
                res,
                'Resep obat berhasil disimpan',
                prescription,
                201
            );
        } catch (error) {
            if (
                error.code ===
                'MEDICAL_RECORD_NOT_FOUND'
            ) {
                return errorResponse(
                    res,
                    'Validation Error',
                    {
                        medical_record_id:
                            'Data pemeriksaan tidak ditemukan',
                    },
                    422
                );
            }

            if (
                error.code ===
                'DOCTOR_NOT_ASSIGNED'
            ) {
                return errorResponse(
                    res,
                    'Akses ditolak',
                    {
                        medical_record_id:
                            'Pemeriksaan bukan milik dokter yang sedang login',
                    },
                    403
                );
            }

            if (
                error.code ===
                'PRESCRIPTION_EXISTS'
            ) {
                return errorResponse(
                    res,
                    'Resep sudah tersedia',
                    {
                        medical_record_id:
                            'Pemeriksaan ini sudah memiliki resep',
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

/*
 * =========================================
 * GET PRESCRIPTION LIST
 * =========================================
 */
const getPrescriptions =
    async (req, res) => {
        try {
            const {
                search = '',
                page = 1,
                limit = 10,
            } = req.query;

            const result =
                await prescriptionService
                    .getPrescriptions({
                        search,
                        page,
                        limit,
                    });

            return successResponse(
                res,
                'Daftar resep berhasil diambil',
                result
            );
        } catch (error) {
            console.error(
                'Get prescriptions error:',
                error
            );

            return errorResponse(
                res,
                'Terjadi kesalahan pada server',
                {},
                500
            );
        }
    };

/*
 * =========================================
 * GET PRESCRIPTION DETAIL
 * =========================================
 */
const getPrescription =
    async (req, res) => {
        try {
            const prescription =
                await prescriptionService
                    .getPrescriptionById(
                        req.params.id
                    );

            if (!prescription) {
                return errorResponse(
                    res,
                    'Data resep tidak ditemukan',
                    {},
                    404
                );
            }

            return successResponse(
                res,
                'Data resep berhasil diambil',
                prescription
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
    createPrescription,
    getPrescriptions,
    getPrescription,
};