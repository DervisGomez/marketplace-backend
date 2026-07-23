const logger = require('../../../../../infrastructure/logging/logger');
const Notification = require('../../../infrastructure/mongoose/repositories/NotificationRepository');

// TODO(v2): preservar bugs y contratos legacy de Notification.
module.exports = {
    list: async (req, res) => {
        try {
            let filter = { status: 1 };
            let count = await Notification.aggregate([
                { $match: filter },
                { $group: { _id: { status: '$status' }, count: { $sum: 1 } } }
            ]);
            let notification = await Notification.find({
                user: req.user._id,
                $or: [{ status: 1 }, { status: 2 }]
            }).limit(20);
            if (count.length > 0) {
                let counts = count[0].count;
                res.status(201).json({ status: 1, data: { notification, counts } });
            } else {
                res.status(201).json({ status: 1, data: { notification, counts: 0 } });
            }
        } catch (err) {
            logger.error({ err: err }, 'Legacy operation failed');
            res.status(500).json({ status: 0, data: [err] });
        }
    }
};
