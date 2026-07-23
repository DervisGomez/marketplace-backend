const logger = require('../../../../../infrastructure/logging/logger');
const { updateResult } = require('../../../../../infrastructure/http/serializeLegacyWriteResult');
const Notification = require('../../../infrastructure/mongoose/repositories/NotificationRepository');
import type { NotificationHandler } from '../../../presentation/dto/NotificationContracts';

// TODO(v2): preservar bugs y contratos legacy de Notification.
module.exports = {
    find: async (req, res) => {
        try {
            let notification = await Notification.updateMany({ _id: req.body._id }, { $set: { status: 3 } });
            notification = updateResult(notification);
            res.status(201).json({ status: 1, data: { notification } });
        } catch (err) {
            logger.error({ err: err }, 'Legacy operation failed');
            res.status(500).json({ status: 0, data: [err] });
        }
    }
} satisfies Readonly<Record<string, NotificationHandler>>;
