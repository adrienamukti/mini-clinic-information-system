const express = require('express');

const {
    getQueues,
    createQueue,
    callQueue,
    updateQueueStatus,
} = require('../controllers/queueController');

const authenticate = require(
    '../middlewares/authMiddleware'
);

const authorize = require(
    '../middlewares/roleMiddleware'
);

const validate = require(
    '../middlewares/validationMiddleware'
);

const {
    createQueueValidator,
    queueIdValidator,
    updateQueueStatusValidator,
    queueListValidator,
} = require('../validators/queueValidator');

const router = express.Router();

router.get(
    '/queues',
    authenticate,
    queueListValidator,
    validate,
    getQueues
);

router.post(
    '/queues',
    authenticate,
    authorize(
        'Administrator',
        'Petugas Pendaftaran'
    ),
    createQueueValidator,
    validate,
    createQueue
);

router.put(
    '/queues/:id/call',
    authenticate,
    authorize(
        'Administrator',
        'Petugas Pendaftaran'
    ),
    queueIdValidator,
    validate,
    callQueue
);

router.put(
    '/queues/:id/status',
    authenticate,
    authorize(
        'Administrator',
        'Petugas Pendaftaran'
    ),
    queueIdValidator,
    updateQueueStatusValidator,
    validate,
    updateQueueStatus
);

module.exports = router;