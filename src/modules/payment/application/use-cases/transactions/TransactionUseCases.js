const logger = require('../../../../../infrastructure/logging/logger');
const Payment = require('../../../infrastructure/mongoose/repositories/PaymentRepository');

// TODO(v2): preservar bugs y contratos del flujo Payment legacy.
module.exports = {
    queryPayment: async (req, res) => {
        try {
            let skip = req.query.skip;
            let limit = req.query.limit;
            const filter = { ...req.query, user: req.user._id };
            delete filter.skip;
            delete filter.limit;
            if (filter.max) {
                filter.amount = { $lt: filter.max };
                delete filter.max;
            }
            if (filter.min) {
                filter.amount = { $gt: filter.min };
                delete filter.min;
            }
            if (filter.status) {
                let status = filter.status.split(',');
                filter.$or = [];
                for (let i = 0; i < status.length; i++) {
                    filter.$or.push({ status: status[i] });
                }
                delete filter.status;
            }
            logger.debug(filter);
            let payment = await Payment.find(filter).populate('buy').populate('product').sort({ $natural: -1 });
            res.status(200).json({ status: 1, data: { payment }, token: req.token });
        } catch (err) {
            logger.error({ err: err }, 'Legacy operation failed');
            res.status(500).json({ status: 0, data: [err] });
        }
    }
};
