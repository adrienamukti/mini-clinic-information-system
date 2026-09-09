const db = require('../config/database');

const getMedicalRecordById = async (id) => {
    const [rows] = await db.execute(
        `
        SELECT
            medical_records.id,
            medical_records.registration_id,
            medical_records.subjective_complaint,
            medical_records.blood_pressure,
            medical_records.temperature,
            medical_records.weight,
            medical_records.height,
            medical_records.diagnosis,
            medical_records.therapy_plan,
            medical_records.examined_at,
            medical_records.created_at,
            medical_records.updated_at,

            patients.id AS patient_id,
            patients.medical_record_number,
            patients.name AS patient_name,

            users.name AS doctor_name,
            polyclinics.name AS polyclinic_name

        FROM medical_records

        JOIN registrations
            ON registrations.id = medical_records.registration_id

        JOIN patients
            ON patients.id = registrations.patient_id

        JOIN doctors
            ON doctors.id = registrations.doctor_id

        JOIN users
            ON users.id = doctors.user_id

        JOIN polyclinics
            ON polyclinics.id = registrations.polyclinic_id

        WHERE medical_records.id = ?
        LIMIT 1
        `,
        [id]
    );

    if (rows.length === 0) {
        return null;
    }

    const record = rows[0];

    const [actions] = await db.execute(
        `
        SELECT
            id,
            action_name,
            notes
        FROM medical_actions
        WHERE medical_record_id = ?
        ORDER BY id ASC
        `,
        [id]
    );

    record.medical_actions = actions;

    return record;
};

const createMedicalRecord = async (data, loggedInUser) => {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const [registrations] = await connection.execute(
            `
            SELECT
                registrations.id,
                registrations.patient_id,
                registrations.status,
                doctors.user_id AS doctor_user_id

            FROM registrations

            JOIN doctors
                ON doctors.id = registrations.doctor_id

            WHERE registrations.id = ?
            LIMIT 1
            FOR UPDATE
            `,
            [data.registration_id]
        );

        if (registrations.length === 0) {
            const error = new Error(
                'Pendaftaran tidak ditemukan'
            );

            error.code = 'REGISTRATION_NOT_FOUND';
            throw error;
        }

        const registration = registrations[0];

        if (
            Number(registration.doctor_user_id) !==
            Number(loggedInUser.id)
        ) {
            const error = new Error(
                'Pendaftaran bukan milik dokter yang sedang login'
            );

            error.code = 'DOCTOR_NOT_ASSIGNED';
            throw error;
        }

        if (registration.status !== 'Pemeriksaan') {
            const error = new Error(
                'Pasien belum berada pada tahap pemeriksaan'
            );

            error.code = 'INVALID_REGISTRATION_STATUS';
            throw error;
        }

        const [existingRecords] = await connection.execute(
            `
            SELECT id
            FROM medical_records
            WHERE registration_id = ?
            LIMIT 1
            `,
            [data.registration_id]
        );

        if (existingRecords.length > 0) {
            const error = new Error(
                'Pemeriksaan sudah tercatat'
            );

            error.code = 'MEDICAL_RECORD_EXISTS';
            throw error;
        }

        const [result] = await connection.execute(
            `
            INSERT INTO medical_records (
                registration_id,
                subjective_complaint,
                blood_pressure,
                temperature,
                weight,
                height,
                diagnosis,
                therapy_plan,
                examined_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
            `,
            [
                data.registration_id,
                data.subjective_complaint,
                data.blood_pressure || null,
                data.temperature || null,
                data.weight || null,
                data.height || null,
                data.diagnosis,
                data.therapy_plan,
            ]
        );

        const medicalRecordId = result.insertId;

        if (
            Array.isArray(data.medical_actions) &&
            data.medical_actions.length > 0
        ) {
            for (const action of data.medical_actions) {
                await connection.execute(
                    `
                    INSERT INTO medical_actions (
                        medical_record_id,
                        action_name,
                        notes
                    )
                    VALUES (?, ?, ?)
                    `,
                    [
                        medicalRecordId,
                        action.action_name,
                        action.notes || null,
                    ]
                );
            }
        }

        await connection.execute(
            `
            UPDATE registrations
            SET status = 'Selesai'
            WHERE id = ?
            `,
            [data.registration_id]
        );

        await connection.commit();

        return getMedicalRecordById(medicalRecordId);
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

const getMedicalRecordsByPatientId = async (patientId) => {
    const [patientRows] = await db.execute(
        `
        SELECT
            id,
            medical_record_number,
            nik,
            name,
            gender,
            date_of_birth
        FROM patients
        WHERE id = ?
        LIMIT 1
        `,
        [patientId]
    );

    if (patientRows.length === 0) {
        return null;
    }

    const patient = patientRows[0];

    const [records] = await db.execute(
        `
        SELECT
            medical_records.id,
            medical_records.registration_id,
            medical_records.subjective_complaint,
            medical_records.blood_pressure,
            medical_records.temperature,
            medical_records.weight,
            medical_records.height,
            medical_records.diagnosis,
            medical_records.therapy_plan,
            medical_records.examined_at,

            registrations.visit_date,

            users.name AS doctor_name,
            polyclinics.name AS polyclinic_name

        FROM medical_records

        JOIN registrations
            ON registrations.id = medical_records.registration_id

        JOIN doctors
            ON doctors.id = registrations.doctor_id

        JOIN users
            ON users.id = doctors.user_id

        JOIN polyclinics
            ON polyclinics.id = registrations.polyclinic_id

        WHERE registrations.patient_id = ?

        ORDER BY medical_records.examined_at DESC
        `,
        [patientId]
    );

    for (const record of records) {
        const [actions] = await db.execute(
            `
            SELECT
                id,
                action_name,
                notes
            FROM medical_actions
            WHERE medical_record_id = ?
            ORDER BY id ASC
            `,
            [record.id]
        );

        record.medical_actions = actions;
    }

    return {
        patient,
        medical_records: records,
    };
};

module.exports = {
    createMedicalRecord,
    getMedicalRecordsByPatientId,
};