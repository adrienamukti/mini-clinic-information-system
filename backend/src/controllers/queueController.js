const queueService = require(
    '../services/queueService'
);

const {
    successResponse,
    errorResponse,
} = require('../utils/response');

const getQueues = async (req, res) => {
    try {
        const queues = await queueService.getQueues(
            req.query.date || null
        );

        return successResponse(
            res,
            'Data antrean berhasil diambil',
            queues
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

const createQueue = async (req, res) => {
    try {
        const queue = await queueService.createQueue(
            req.body.registration_id
        );

        return successResponse(
            res,
            'Antrean berhasil dibuat',
            queue,
            201
        );
    } catch (error) {
        if (error.code === 'REGISTRATION_NOT_FOUND') {
            return errorResponse(
                res,
                'Validation Error',
                {
                    registration_id:
                        'Pendaftaran tidak ditemukan',
                },
                422
            );
        }

        if (error.code === 'QUEUE_ALREADY_EXISTS') {
            return errorResponse(
                res,
                'Antrean sudah tersedia',
                {
                    registration_id:
                        'Pendaftaran sudah memiliki antrean',
                },
                409
            );
        }

        console.error(error);

        return errorResponse(
            res,
            'Terjadi kesalahan pada server',
            {},
            500
        );
    }
};

const callQueue = async (req, res) => {
    try {
        const queue = await queueService.callQueue(
            req.params.id
        );

        if (!queue) {
            return errorResponse(
                res,
                'Data antrean tidak ditemukan',
                {},
                404
            );
        }

        return successResponse(
            res,
            'Antrean berhasil dipanggil',
            queue
        );
    } catch (error) {
        if (error.code === 'QUEUE_ALREADY_FINISHED') {
            return errorResponse(
                res,
                'Antrean tidak dapat dipanggil',
                {
                    queue:
                        'Antrean telah selesai',
                },
                409
            );
        }

        console.error(error);

        return errorResponse(
            res,
            'Terjadi kesalahan pada server',
            {},
            500
        );
    }
};

const updateQueueStatus = async (req, res) => {
    try {
        const queue =
            await queueService.updateQueueStatus(
                req.params.id,
                req.body.status
            );

        if (!queue) {
            return errorResponse(
                res,
                'Data antrean tidak ditemukan',
                {},
                404
            );
        }

        return successResponse(
            res,
            'Status antrean berhasil diperbarui',
            queue
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

module.exports = {
    getQueues,
    createQueue,
    callQueue,
    updateQueueStatus,
};