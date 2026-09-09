const db = require('../config/database');

const getQueueById = async (id) => {
    const [rows] = await db.execute(
        `
        SELECT
            queues.id,
            queues.registration_id,
            queues.queue_date,
            queues.queue_number,
            queues.status,
            queues.called_at,
            queues.created_at,
            queues.updated_at,

            patients.medical_record_number,
            patients.name AS patient_name,

            users.name AS doctor_name,
            polyclinics.name AS polyclinic_name,

            registrations.visit_date,
            registrations.status AS registration_status

        FROM queues

        JOIN registrations
            ON registrations.id = queues.registration_id

        JOIN patients
            ON patients.id = registrations.patient_id

        JOIN doctors
            ON doctors.id = registrations.doctor_id

        JOIN users
            ON users.id = doctors.user_id

        JOIN polyclinics
            ON polyclinics.id = registrations.polyclinic_id

        WHERE queues.id = ?
        LIMIT 1
        `,
        [id]
    );

    return rows[0] || null;
};

const getQueues = async (queueDate = null) => {
    const params = [];

    let whereClause = '';

    if (queueDate) {
        whereClause = 'WHERE queues.queue_date = ?';
        params.push(queueDate);
    }

    const [rows] = await db.execute(
        `
        SELECT
            queues.id,
            queues.registration_id,
            queues.queue_date,
            queues.queue_number,
            queues.status,
            queues.called_at,

            patients.medical_record_number,
            patients.name AS patient_name,

            users.name AS doctor_name,
            polyclinics.name AS polyclinic_name,

            registrations.visit_date,
            registrations.status AS registration_status

        FROM queues

        JOIN registrations
            ON registrations.id = queues.registration_id

        JOIN patients
            ON patients.id = registrations.patient_id

        JOIN doctors
            ON doctors.id = registrations.doctor_id

        JOIN users
            ON users.id = doctors.user_id

        JOIN polyclinics
            ON polyclinics.id = registrations.polyclinic_id

        ${whereClause}

        ORDER BY
            queues.queue_date DESC,
            queues.queue_number ASC
        `,
        params
    );

    return rows;
};

const createQueue = async (registrationId) => {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const [registrations] = await connection.execute(
            `
            SELECT
                id,
                visit_date,
                status
            FROM registrations
            WHERE id = ?
            LIMIT 1
            `,
            [registrationId]
        );

        if (registrations.length === 0) {
            const error = new Error(
                'Pendaftaran tidak ditemukan'
            );

            error.code = 'REGISTRATION_NOT_FOUND';
            throw error;
        }

        const registration = registrations[0];

        const [existingQueues] = await connection.execute(
            `
            SELECT id
            FROM queues
            WHERE registration_id = ?
            LIMIT 1
            `,
            [registrationId]
        );

        if (existingQueues.length > 0) {
            const error = new Error(
                'Pendaftaran sudah memiliki antrean'
            );

            error.code = 'QUEUE_ALREADY_EXISTS';
            throw error;
        }

        const [lastQueues] = await connection.execute(
            `
            SELECT queue_number
            FROM queues
            WHERE queue_date = ?
            ORDER BY queue_number DESC
            LIMIT 1
            FOR UPDATE
            `,
            [registration.visit_date]
        );

        let nextNumber = 1;

        if (lastQueues.length > 0) {
            const lastNumber = parseInt(
                lastQueues[0].queue_number.substring(1),
                10
            );

            nextNumber = lastNumber + 1;
        }

        const queueNumber =
            `A${String(nextNumber).padStart(3, '0')}`;

        const [result] = await connection.execute(
            `
            INSERT INTO queues (
                registration_id,
                queue_date,
                queue_number,
                status
            )
            VALUES (?, ?, ?, 'Menunggu')
            `,
            [
                registrationId,
                registration.visit_date,
                queueNumber,
            ]
        );

        await connection.commit();

        return getQueueById(result.insertId);
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

const callQueue = async (id) => {
    const queue = await getQueueById(id);

    if (!queue) {
        return null;
    }

    if (queue.status === 'Selesai') {
        const error = new Error(
            'Antrean yang telah selesai tidak dapat dipanggil kembali'
        );

        error.code = 'QUEUE_ALREADY_FINISHED';
        throw error;
    }

    await db.execute(
        `
        UPDATE queues
        SET
            status = 'Dipanggil',
            called_at = NOW()
        WHERE id = ?
        `,
        [id]
    );

    /*
     * Ketika pasien dipanggil, kunjungan
     * dianggap memasuki tahap Check In.
     */
    await db.execute(
        `
        UPDATE registrations
        SET status = 'Check In'
        WHERE id = ?
          AND status = 'Menunggu'
        `,
        [queue.registration_id]
    );

    return getQueueById(id);
};

const updateQueueStatus = async (id, status) => {
    const queue = await getQueueById(id);

    if (!queue) {
        return null;
    }

    await db.execute(
        `
        UPDATE queues
        SET
            status = ?,
            called_at = CASE
                WHEN ? = 'Dipanggil' AND called_at IS NULL
                    THEN NOW()
                ELSE called_at
            END
        WHERE id = ?
        `,
        [status, status, id]
    );

    /*
     * Sinkronisasi sederhana dengan status kunjungan.
     */
    if (status === 'Dipanggil') {
        await db.execute(
            `
            UPDATE registrations
            SET status = 'Check In'
            WHERE id = ?
              AND status = 'Menunggu'
            `,
            [queue.registration_id]
        );
    }

    if (status === 'Selesai') {
        await db.execute(
            `
            UPDATE registrations
            SET status = 'Pemeriksaan'
            WHERE id = ?
              AND status IN ('Menunggu', 'Check In')
            `,
            [queue.registration_id]
        );
    }

    return getQueueById(id);
};

module.exports = {
    getQueues,
    getQueueById,
    createQueue,
    callQueue,
    updateQueueStatus,
};