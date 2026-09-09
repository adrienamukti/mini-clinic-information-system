const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const db = require('../src/config/database');

const seed = async () => {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // =============================================
        // ROLES
        // =============================================
        const roles = [
            'Administrator',
            'Dokter',
            'Petugas Pendaftaran',
        ];

        for (const role of roles) {
            await connection.execute(
                `
                INSERT INTO roles (name)
                VALUES (?)
                ON DUPLICATE KEY UPDATE name = VALUES(name)
                `,
                [role]
            );
        }

        // =============================================
        // POLYCLINICS
        // =============================================
        const polyclinics = [
            'Poli Umum',
            'Poli Gigi',
            'Poli Anak',
        ];

        for (const polyclinic of polyclinics) {
            await connection.execute(
                `
                INSERT INTO polyclinics (name)
                VALUES (?)
                ON DUPLICATE KEY UPDATE name = VALUES(name)
                `,
                [polyclinic]
            );
        }

        // =============================================
        // GET ROLE IDS
        // =============================================
        const [roleRows] = await connection.execute(
            'SELECT id, name FROM roles'
        );

        const roleMap = Object.fromEntries(
            roleRows.map((role) => [role.name, role.id])
        );

        // =============================================
        // DEMO ACCOUNTS
        // =============================================
        const users = [
            {
                role: 'Administrator',
                name: 'Administrator',
                email: 'admin@miniclinic.local',
                password: 'Admin123!',
            },
            {
                role: 'Dokter',
                name: 'Dr. Andi',
                email: 'doctor@miniclinic.local',
                password: 'Doctor123!',
            },
            {
                role: 'Petugas Pendaftaran',
                name: 'Petugas Pendaftaran',
                email: 'registration@miniclinic.local',
                password: 'Registration123!',
            },
        ];

        for (const user of users) {
            const hashedPassword = await bcrypt.hash(user.password, 10);

            await connection.execute(
                `
                INSERT INTO users (role_id, name, email, password)
                VALUES (?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    role_id = VALUES(role_id),
                    name = VALUES(name),
                    password = VALUES(password)
                `,
                [
                    roleMap[user.role],
                    user.name,
                    user.email,
                    hashedPassword,
                ]
            );
        }

        // =============================================
        // DOCTOR PROFILE
        // =============================================
        const [[doctorUser]] = await connection.execute(
            `
            SELECT id
            FROM users
            WHERE email = ?
            `,
            ['doctor@miniclinic.local']
        );

        const [[generalPolyclinic]] = await connection.execute(
            `
            SELECT id
            FROM polyclinics
            WHERE name = ?
            `,
            ['Poli Umum']
        );

        await connection.execute(
            `
            INSERT INTO doctors (user_id, polyclinic_id)
            VALUES (?, ?)
            ON DUPLICATE KEY UPDATE
                polyclinic_id = VALUES(polyclinic_id)
            `,
            [doctorUser.id, generalPolyclinic.id]
        );

        await connection.commit();

        console.log('Database seeded successfully');
        console.log('');
        console.log('Demo accounts:');
        console.log('Administrator       : admin@miniclinic.local / Admin123!');
        console.log('Dokter              : doctor@miniclinic.local / Doctor123!');
        console.log(
            'Petugas Pendaftaran : registration@miniclinic.local / Registration123!'
        );
    } catch (error) {
        await connection.rollback();

        console.error('Database seeding failed:', error.message);
        process.exitCode = 1;
    } finally {
        connection.release();
        await db.end();
    }
};

seed();