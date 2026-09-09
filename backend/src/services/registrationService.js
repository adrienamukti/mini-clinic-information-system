const db = require('../config/database');

const validateReferences = async ({
    patient_id,
    doctor_id,
    polyclinic_id,
}) => {
    const [patients] = await db.execute(
        'SELECT id FROM patients WHERE id = ? LIMIT 1',
        [patient_id]
    );

    if (patients.length === 0) {
        const error = new Error('Pasien tidak ditemukan');
        error.code = 'PATIENT_NOT_FOUND';
        throw error;
    }

    const [polyclinics] = await db.execute(
        'SELECT id FROM polyclinics WHERE id = ? LIMIT 1',
        [polyclinic_id]
    );

    if (polyclinics.length === 0) {
        const error = new Error('Poli tidak ditemukan');
        error.code = 'POLYCLINIC_NOT_FOUND';
        throw error;
    }

    const [doctors] = await db.execute(
        `
        SELECT id, polyclinic_id
        FROM doctors
        WHERE id = ?
        LIMIT 1
        `,
        [doctor_id]
    );

    if (doctors.length === 0) {
        const error = new Error('Dokter tidak ditemukan');
        error.code = 'DOCTOR_NOT_FOUND';
        throw error;
    }

    if (doctors[0].polyclinic_id !== Number(polyclinic_id)) {
        const error = new Error(
            'Dokter tidak terdaftar pada poli yang dipilih'
        );
        error.code = 'DOCTOR_POLYCLINIC_MISMATCH';
        throw error;
    }
};

const getRegistrations = async () => {
    const [rows] = await db.execute(
        `
        SELECT
            registrations.id,

            patients.id AS patient_id,
            patients.medical_record_number,
            patients.nik AS patient_nik,
            patients.name AS patient_name,

            doctors.id AS doctor_id,
            users.name AS doctor_name,

            polyclinics.id AS polyclinic_id,
            polyclinics.name AS polyclinic_name,

            registrations.visit_date,
            registrations.payment_type,
            registrations.initial_complaint,
            registrations.status,
            registrations.created_at,
            registrations.updated_at

        FROM registrations

        JOIN patients
            ON patients.id = registrations.patient_id

        JOIN doctors
            ON doctors.id = registrations.doctor_id

        JOIN users
            ON users.id = doctors.user_id

        JOIN polyclinics
            ON polyclinics.id = registrations.polyclinic_id

        ORDER BY registrations.id DESC
        `
    );

    return rows;
};

const getRegistrationById = async (id) => {
    const [rows] = await db.execute(
        `
        SELECT *
        FROM registrations
        WHERE id = ?
        LIMIT 1
        `,
        [id]
    );

    return rows[0] || null;
};

const createRegistration = async (data) => {
    await validateReferences(data);

    const [result] = await db.execute(
        `
        INSERT INTO registrations (
            patient_id,
            doctor_id,
            polyclinic_id,
            visit_date,
            payment_type,
            initial_complaint,
            status
        )
        VALUES (?, ?, ?, ?, ?, ?, 'Menunggu')
        `,
        [
            data.patient_id,
            data.doctor_id,
            data.polyclinic_id,
            data.visit_date,
            data.payment_type,
            data.initial_complaint,
        ]
    );

    return getRegistrationById(result.insertId);
};

const updateRegistration = async (id, data) => {
    const registration = await getRegistrationById(id);

    if (!registration) {
        return null;
    }

    await validateReferences(data);

    await db.execute(
        `
        UPDATE registrations
        SET
            patient_id = ?,
            doctor_id = ?,
            polyclinic_id = ?,
            visit_date = ?,
            payment_type = ?,
            initial_complaint = ?,
            status = ?
        WHERE id = ?
        `,
        [
            data.patient_id,
            data.doctor_id,
            data.polyclinic_id,
            data.visit_date,
            data.payment_type,
            data.initial_complaint,
            data.status,
            id,
        ]
    );

    return getRegistrationById(id);
};

module.exports = {
    getRegistrations,
    getRegistrationById,
    createRegistration,
    updateRegistration,
};