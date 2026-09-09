const { randomBytes } = require('crypto');
const db = require('../config/database');

const getPatients = async ({ page, limit, search }) => {
    const offset = (page - 1) * limit;
    const keyword = `%${search}%`;

    const [countRows] = await db.execute(
        `
        SELECT COUNT(*) AS total
        FROM patients
        WHERE
            name LIKE ?
            OR nik LIKE ?
            OR medical_record_number LIKE ?
        `,
        [keyword, keyword, keyword]
    );

    const [rows] = await db.execute(
        `
        SELECT
            id,
            medical_record_number,
            nik,
            name,
            gender,
            date_of_birth,
            phone,
            address,
            created_at,
            updated_at
        FROM patients
        WHERE
            name LIKE ?
            OR nik LIKE ?
            OR medical_record_number LIKE ?
        ORDER BY id DESC
        LIMIT ? OFFSET ?
        `,
        [keyword, keyword, keyword, limit, offset]
    );

    const total = countRows[0].total;

    return {
        patients: rows,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};

const getPatientById = async (id) => {
    const [rows] = await db.execute(
        `
        SELECT
            id,
            medical_record_number,
            nik,
            name,
            gender,
            date_of_birth,
            phone,
            address,
            created_at,
            updated_at
        FROM patients
        WHERE id = ?
        LIMIT 1
        `,
        [id]
    );

    return rows[0] || null;
};

const createPatient = async (data) => {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const [duplicateRows] = await connection.execute(
            'SELECT id FROM patients WHERE nik = ? LIMIT 1',
            [data.nik]
        );

        if (duplicateRows.length > 0) {
            const error = new Error('NIK sudah terdaftar');
            error.code = 'NIK_DUPLICATE';
            throw error;
        }

        // Nilai sementara agar kolom medical_record_number
        // tetap memenuhi NOT NULL + UNIQUE.
        const temporaryRecordNumber =
            `TMP${randomBytes(8).toString('hex')}`;

        const [result] = await connection.execute(
            `
            INSERT INTO patients (
                medical_record_number,
                nik,
                name,
                gender,
                date_of_birth,
                phone,
                address
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
            `,
            [
                temporaryRecordNumber,
                data.nik,
                data.name,
                data.gender,
                data.date_of_birth,
                data.phone || null,
                data.address || null,
            ]
        );

        const medicalRecordNumber =
            `RM${String(result.insertId).padStart(6, '0')}`;

        await connection.execute(
            `
            UPDATE patients
            SET medical_record_number = ?
            WHERE id = ?
            `,
            [medicalRecordNumber, result.insertId]
        );

        const [rows] = await connection.execute(
            `
            SELECT
                id,
                medical_record_number,
                nik,
                name,
                gender,
                date_of_birth,
                phone,
                address,
                created_at,
                updated_at
            FROM patients
            WHERE id = ?
            `,
            [result.insertId]
        );

        await connection.commit();

        return rows[0];
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

const updatePatient = async (id, data) => {
    const patient = await getPatientById(id);

    if (!patient) {
        return null;
    }

    const [duplicateRows] = await db.execute(
        `
        SELECT id
        FROM patients
        WHERE nik = ?
          AND id != ?
        LIMIT 1
        `,
        [data.nik, id]
    );

    if (duplicateRows.length > 0) {
        const error = new Error('NIK sudah terdaftar');
        error.code = 'NIK_DUPLICATE';
        throw error;
    }

    await db.execute(
        `
        UPDATE patients
        SET
            nik = ?,
            name = ?,
            gender = ?,
            date_of_birth = ?,
            phone = ?,
            address = ?
        WHERE id = ?
        `,
        [
            data.nik,
            data.name,
            data.gender,
            data.date_of_birth,
            data.phone || null,
            data.address || null,
            id,
        ]
    );

    return getPatientById(id);
};

const deletePatient = async (id) => {
    const patient = await getPatientById(id);

    if (!patient) {
        return false;
    }

    try {
        await db.execute(
            'DELETE FROM patients WHERE id = ?',
            [id]
        );

        return true;
    } catch (error) {
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            const relationError = new Error(
                'Pasien memiliki data kunjungan dan tidak dapat dihapus'
            );

            relationError.code = 'PATIENT_HAS_RELATIONS';
            throw relationError;
        }

        throw error;
    }
};

module.exports = {
    getPatients,
    getPatientById,
    createPatient,
    updatePatient,
    deletePatient,
};