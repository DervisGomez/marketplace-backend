const logger = require('../../../../../infrastructure/logging/logger');
const Payment = require('../../../infrastructure/mongoose/repositories/PaymentRepository');
const Bank = require('../../../infrastructure/gateways/PaymentRelationsGateway').Bank;
const toObjectId = require('../../../infrastructure/mongoose/repositories/MongoObjectId');

// TODO(v2): preservar bugs y contratos del flujo Payment legacy.
module.exports = {
    withdrawals: async (req, res) => {
        try {
            let group = { type: '$type', status: '$status' };
            let match = { user: toObjectId(req.user._id), type: 'veco', $or: [{ status: 1 }, { status: 2 }] };
            let money = await Payment.aggregate([
                { $match: match },
                { $group: { _id: group, count: { $sum: '$amount' } } }
            ]);
            let amount = 0;
            for (let i = 0; i < money.length; i++) {
                amount += money[i].count;
            }

            let payment = Payment.create({
                user: req.user._id,
                account: req.body.account,
                amount: parseInt(req.body.amount) * -1,
                type: 'veco'
            });

            await payment.save();

            res.status(200).json({ status: 1, data: true, token: req.token });
        } catch (err) {
            logger.error({ err: err }, 'Legacy operation failed');
            res.status(500).json({ status: 0, data: [err] });
        }
    },
    listWithdrawals2: async (req, res) => {
        try {
            let payment = await Payment.find({
                user: req.user._id,
                type: 'veco',
                amount: { $lt: 0 },
                $or: [{ status: 1 }, { status: 2 }]
            })
                .sort({ $natural: -1 })
                .populate('account')
                .populate('product');

            let banks = await Bank.find({}, { name: 1 });

            res.status(200).json({ status: 1, data: { payment, banks }, token: req.token });
        } catch (err) {
            logger.error({ err: err }, 'Legacy operation failed');
            res.status(500).json({ status: 0, data: [err] });
        }
    },
    listWithdrawals: async (req, res) => {
        try {
            let date = new Date();
            date.setDate(1);
            date.setHours(0);
            date.setMinutes(0);
            date.setSeconds(0);
            date.setMonth(date.getMonth() - 11);

            let payment = await Payment.find({
                user: req.user._id,
                type: 'veco',
                amount: { $lt: 0 },
                $or: [{ status: 1 }, { status: 2 }],
                createdAt: { $gt: date }
            })
                .sort({ $natural: -1 })
                .populate('account')
                .populate('product');

            let banks = await Bank.find({}, { name: 1, logo: 1 });

            res.status(200).json({ status: 1, data: { payment, banks }, token: req.token });
        } catch (err) {
            logger.error({ err: err }, 'Legacy operation failed');
            res.status(500).json({ status: 0, data: [err] });
        }
    }
};
