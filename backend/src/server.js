const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const db = require('./config/database');
const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use(authRoutes);

app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Mini Clinic Information System API',
    });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        const connection = await db.getConnection();

        console.log('Database connected successfully');

        connection.release();

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Database connection failed:', error.message);
        process.exit(1);
    }
};

startServer();