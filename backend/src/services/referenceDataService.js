const db = require('../config/database');

const getDoctors = async () => {
    const [rows] = await db.execute(
        `
        SELECT
            doctors.id,
            doctors.user_id,
            users.name,
            doctors.polyclinic_id,
            polyclinics.name AS polyclinic_name

        FROM doctors

        JOIN users
            ON users.id = doctors.user_id

        JOIN polyclinics
            ON polyclinics.id = doctors.polyclinic_id

        ORDER BY users.name ASC
        `
    );

    return rows;
};

const getPolyclinics = async () => {
    const [rows] = await db.execute(
        `
        SELECT
            id,
            name,
            created_at,
            updated_at
        FROM polyclinics
        ORDER BY name ASC
        `
    );

    return rows;
};

module.exports = {
    getDoctors,
    getPolyclinics,
};