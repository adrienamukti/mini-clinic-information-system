const express =
    require('express');

const {
    createPrescription,
    getPrescriptions,
    getPrescription,
} = require(
    '../controllers/prescriptionController'
);

const authenticate =
    require(
        '../middlewares/authMiddleware'
    );

const authorize =
    require(
        '../middlewares/roleMiddleware'
    );

const validate =
    require(
        '../middlewares/validationMiddleware'
    );

const {
    createPrescriptionValidator,
    prescriptionIdValidator,
} = require(
    '../validators/prescriptionValidator'
);

const router =
    express.Router();

/*
 * =========================================
 * CREATE PRESCRIPTION
 * =========================================
 *
 * POST /prescriptions
 *
 * Hanya Dokter.
 */
router.post(
    '/prescriptions',
    authenticate,
    authorize('Dokter'),
    createPrescriptionValidator,
    validate,
    createPrescription
);

/*
 * =========================================
 * GET PRESCRIPTION LIST
 * =========================================
 *
 * GET /prescriptions
 *
 * Contoh:
 *
 * /prescriptions
 *
 * /prescriptions?search=Budi
 *
 * /prescriptions?search=RM000001
 *
 * /prescriptions?page=1&limit=10
 */
router.get(
    '/prescriptions',
    authenticate,
    getPrescriptions
);

/*
 * =========================================
 * GET PRESCRIPTION DETAIL
 * =========================================
 *
 * GET /prescriptions/1
 *
 * PENTING:
 * route /prescriptions harus berada
 * sebelum /prescriptions/:id.
 */
router.get(
    '/prescriptions/:id',
    authenticate,
    prescriptionIdValidator,
    validate,
    getPrescription
);

module.exports = router;