const db = require('../config/database');

/*
 * =========================================
 * GET PRESCRIPTION LIST
 * =========================================
 *
 * Mendukung:
 *
 * GET /prescriptions
 * GET /prescriptions?search=Budi
 * GET /prescriptions?search=RM000001
 * GET /prescriptions?page=1&limit=10
 */
const getPrescriptions = async ({
    search = '',
    page = 1,
    limit = 10,
}) => {
    /*
     * Pastikan page dan limit valid.
     */
    const currentPage = Math.max(
        Number.parseInt(page, 10) || 1,
        1
    );

    const currentLimit = Math.min(
        Math.max(
            Number.parseInt(limit, 10) || 10,
            1
        ),
        100
    );

    const offset =
        (currentPage - 1) *
        currentLimit;

    const normalizedSearch =
        String(search || '').trim();

    const searchKeyword =
        `%${normalizedSearch}%`;

    /*
     * =====================================
     * COUNT TOTAL DATA
     * =====================================
     */
    const [countRows] =
        await db.execute(
            `
            SELECT
                COUNT(
                    prescriptions.id
                ) AS total

            FROM prescriptions

            JOIN medical_records
                ON medical_records.id =
                   prescriptions.medical_record_id

            JOIN registrations
                ON registrations.id =
                   medical_records.registration_id

            JOIN patients
                ON patients.id =
                   registrations.patient_id

            JOIN doctors
                ON doctors.id =
                   registrations.doctor_id

            JOIN users
                ON users.id =
                   doctors.user_id

            JOIN polyclinics
                ON polyclinics.id =
                   registrations.polyclinic_id

            WHERE
                (
                    ? = ''
                    OR patients.name
                        LIKE ?
                    OR patients.medical_record_number
                        LIKE ?
                    OR medical_records.diagnosis
                        LIKE ?
                    OR users.name
                        LIKE ?
                )
            `,
            [
                normalizedSearch,
                searchKeyword,
                searchKeyword,
                searchKeyword,
                searchKeyword,
            ]
        );

    const total =
        Number(
            countRows[0]?.total || 0
        );

    /*
     * =====================================
     * GET DATA
     * =====================================
     */
    const [rows] =
        await db.execute(
            `
            SELECT
                prescriptions.id,
                prescriptions.medical_record_id,
                prescriptions.notes,
                prescriptions.created_at,
                prescriptions.updated_at,

                medical_records.registration_id,
                medical_records.diagnosis,

                patients.id AS patient_id,
                patients.medical_record_number,
                patients.name AS patient_name,

                users.name AS doctor_name,

                polyclinics.name
                    AS polyclinic_name,

                (
                    SELECT COUNT(*)
                    FROM prescription_items
                    WHERE
                        prescription_items.prescription_id =
                        prescriptions.id
                ) AS total_items

            FROM prescriptions

            JOIN medical_records
                ON medical_records.id =
                   prescriptions.medical_record_id

            JOIN registrations
                ON registrations.id =
                   medical_records.registration_id

            JOIN patients
                ON patients.id =
                   registrations.patient_id

            JOIN doctors
                ON doctors.id =
                   registrations.doctor_id

            JOIN users
                ON users.id =
                   doctors.user_id

            JOIN polyclinics
                ON polyclinics.id =
                   registrations.polyclinic_id

            WHERE
                (
                    ? = ''
                    OR patients.name
                        LIKE ?
                    OR patients.medical_record_number
                        LIKE ?
                    OR medical_records.diagnosis
                        LIKE ?
                    OR users.name
                        LIKE ?
                )

            ORDER BY
                prescriptions.created_at DESC,
                prescriptions.id DESC

            LIMIT ${currentLimit}
            OFFSET ${offset}
            `,
            [
                normalizedSearch,
                searchKeyword,
                searchKeyword,
                searchKeyword,
                searchKeyword,
            ]
        );

    const totalPages =
        total === 0
            ? 1
            : Math.ceil(
                  total / currentLimit
              );

    return {
        prescriptions: rows,

        pagination: {
            page: currentPage,
            limit: currentLimit,
            total,
            total_pages:
                totalPages,
        },
    };
};

/*
 * =========================================
 * GET PRESCRIPTION DETAIL
 * =========================================
 */
const getPrescriptionById =
    async (id) => {
        const [rows] =
            await db.execute(
                `
                SELECT
                    prescriptions.id,
                    prescriptions.medical_record_id,
                    prescriptions.notes,
                    prescriptions.created_at,
                    prescriptions.updated_at,

                    medical_records.registration_id,
                    medical_records.diagnosis,

                    patients.id AS patient_id,
                    patients.medical_record_number,
                    patients.name AS patient_name,

                    users.name AS doctor_name,
                    polyclinics.name AS polyclinic_name

                FROM prescriptions

                JOIN medical_records
                    ON medical_records.id =
                       prescriptions.medical_record_id

                JOIN registrations
                    ON registrations.id =
                       medical_records.registration_id

                JOIN patients
                    ON patients.id =
                       registrations.patient_id

                JOIN doctors
                    ON doctors.id =
                       registrations.doctor_id

                JOIN users
                    ON users.id =
                       doctors.user_id

                JOIN polyclinics
                    ON polyclinics.id =
                       registrations.polyclinic_id

                WHERE
                    prescriptions.id = ?

                LIMIT 1
                `,
                [id]
            );

        if (rows.length === 0) {
            return null;
        }

        const prescription =
            rows[0];

        /*
         * Ambil daftar item obat.
         */
        const [items] =
            await db.execute(
                `
                SELECT
                    id,
                    medicine_name,
                    dosage,
                    frequency,
                    duration,
                    quantity,
                    instructions

                FROM prescription_items

                WHERE
                    prescription_id = ?

                ORDER BY id ASC
                `,
                [id]
            );

        prescription.items =
            items;

        return prescription;
    };

/*
 * =========================================
 * CREATE PRESCRIPTION
 * =========================================
 */
const createPrescription =
    async (
        data,
        loggedInUser
    ) => {
        const connection =
            await db.getConnection();

        try {
            await connection
                .beginTransaction();

            /*
             * Cari medical record.
             */
            const [medicalRecords] =
                await connection.execute(
                    `
                    SELECT
                        medical_records.id,
                        registrations.id
                            AS registration_id,
                        doctors.user_id
                            AS doctor_user_id

                    FROM medical_records

                    JOIN registrations
                        ON registrations.id =
                           medical_records.registration_id

                    JOIN doctors
                        ON doctors.id =
                           registrations.doctor_id

                    WHERE
                        medical_records.id = ?

                    LIMIT 1
                    `,
                    [
                        data.medical_record_id,
                    ]
                );

            if (
                medicalRecords.length ===
                0
            ) {
                const error =
                    new Error(
                        'Data pemeriksaan tidak ditemukan'
                    );

                error.code =
                    'MEDICAL_RECORD_NOT_FOUND';

                throw error;
            }

            const medicalRecord =
                medicalRecords[0];

            /*
             * Pastikan pemeriksaan memang
             * milik dokter yang login.
             */
            if (
                Number(
                    medicalRecord
                        .doctor_user_id
                ) !==
                Number(
                    loggedInUser.id
                )
            ) {
                const error =
                    new Error(
                        'Pemeriksaan bukan milik dokter yang sedang login'
                    );

                error.code =
                    'DOCTOR_NOT_ASSIGNED';

                throw error;
            }

            /*
             * Satu medical record hanya
             * memiliki satu resep.
             */
            const [
                existingPrescriptions,
            ] =
                await connection
                    .execute(
                        `
                        SELECT id

                        FROM prescriptions

                        WHERE
                            medical_record_id = ?

                        LIMIT 1
                        `,
                        [
                            data.medical_record_id,
                        ]
                    );

            if (
                existingPrescriptions
                    .length > 0
            ) {
                const error =
                    new Error(
                        'Pemeriksaan sudah memiliki resep'
                    );

                error.code =
                    'PRESCRIPTION_EXISTS';

                throw error;
            }

            /*
             * Insert prescription.
             */
            const [result] =
                await connection
                    .execute(
                        `
                        INSERT INTO prescriptions (
                            medical_record_id,
                            notes
                        )
                        VALUES (?, ?)
                        `,
                        [
                            data.medical_record_id,
                            data.notes ||
                                null,
                        ]
                    );

            const prescriptionId =
                result.insertId;

            /*
             * Insert setiap obat.
             */
            for (
                const item of
                data.items
            ) {
                await connection
                    .execute(
                        `
                        INSERT INTO prescription_items (
                            prescription_id,
                            medicine_name,
                            dosage,
                            frequency,
                            duration,
                            quantity,
                            instructions
                        )
                        VALUES (?, ?, ?, ?, ?, ?, ?)
                        `,
                        [
                            prescriptionId,
                            item.medicine_name,
                            item.dosage,
                            item.frequency,
                            item.duration ||
                                null,
                            item.quantity,
                            item.instructions ||
                                null,
                        ]
                    );
            }

            await connection.commit();

            /*
             * Return lengkap dengan patient,
             * doctor, poli, dan items.
             */
            return getPrescriptionById(
                prescriptionId
            );
        } catch (error) {
            await connection.rollback();

            throw error;
        } finally {
            connection.release();
        }
    };

module.exports = {
    createPrescription,
    getPrescriptions,
    getPrescriptionById,
};