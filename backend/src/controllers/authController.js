const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const {
    successResponse,
    errorResponse,
} = require('../utils/response');

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const [rows] = await db.execute(
            `
            SELECT
                users.id,
                users.name,
                users.email,
                users.password,
                roles.name AS role
            FROM users
            JOIN roles ON roles.id = users.role_id
            WHERE users.email = ?
            LIMIT 1
            `,
            [email]
        );

        if (rows.length === 0) {
            return errorResponse(
                res,
                'Email atau password salah',
                {},
                401
            );
        }

        const user = rows[0];

        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return errorResponse(
                res,
                'Email atau password salah',
                {},
                401
            );
        }

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN || '8h',
            }
        );

        return successResponse(
            res,
            'Login berhasil',
            {
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
            }
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

const logout = async (req, res) => {
    return successResponse(
        res,
        'Logout berhasil',
        {}
    );
};

module.exports = {
    login,
    logout,
};