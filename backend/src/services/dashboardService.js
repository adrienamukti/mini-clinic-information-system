const db = require('../config/database');

const getDashboardSummary = async () => {
    const [[totalPatients]] = await db.execute(
        `
        SELECT COUNT(*) AS total
        FROM patients
        `
    );

    const [[todayPatients]] = await db.execute(
        `
        SELECT COUNT(*) AS total
        FROM registrations
        WHERE visit_date = CURDATE()
        `
    );

    const [[todayQueues]] = await db.execute(
        `
        SELECT COUNT(*) AS total
        FROM queues
        WHERE queue_date = CURDATE()
        `
    );

    const [[waitingPatients]] = await db.execute(
        `
        SELECT COUNT(*) AS total
        FROM registrations
        WHERE visit_date = CURDATE()
          AND status = 'Menunggu'
        `
    );

    const [[completedPatients]] = await db.execute(
        `
        SELECT COUNT(*) AS total
        FROM registrations
        WHERE visit_date = CURDATE()
          AND status = 'Selesai'
        `
    );

    return {
        total_patients: totalPatients.total,
        patients_today: todayPatients.total,
        queues_today: todayQueues.total,
        waiting_patients: waitingPatients.total,
        completed_patients: completedPatients.total,
    };
};

module.exports = {
    getDashboardSummary,
};