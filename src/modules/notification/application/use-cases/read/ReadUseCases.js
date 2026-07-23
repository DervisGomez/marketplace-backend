const logger = require('../../../../../infrastructure/logging/logger');
const Notification = require('../../../infrastructure/mongoose/repositories/NotificationRepository');

// TODO(v2): preservar bugs y contratos legacy de Notification.
module.exports = {
    view: async (req, res) => {
        try {
            let notification = await Notification.updateMany({ status: 1 }, { $set: { status: 2 } });
            res.status(201).json({ status: 1, data: { notification } });
        } catch (err) {
            logger.error({ err: err }, 'Legacy operation failed');
            res.status(500).json({ status: 0, data: [err] });
        }
    }
};
