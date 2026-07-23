const logger = require('../../../../../infrastructure/logging/logger');
import type { BuyHandler } from '../../../presentation/dto/BuyContracts';
const Buy = require('../../../infrastructure/mongoose/repositories/BuyRepository');
const Payment = require('../../../infrastructure/mongoose/repositories/PaymentRepository');
const User = require('../../../infrastructure/gateways/BuyRelationsGateway').User;
const toObjectId = require('../../../infrastructure/mongoose/repositories/MongoObjectId');

// TODO(v2): preservar los bugs conocidos hasta una fase funcional.
const useCases: Readonly<Record<string, BuyHandler>> = {
    qualifyBuyer: async (req, res) => {
        try {
            let data = {
                qualifyBuyer: req.body.qualify,
                buyerComment: req.body.comment,
                createdBuyer: new Date()
            };
            let buy = await Buy.findByIdAndUpdate(req.body._id, data);
            logger.debug(buy);
            if (req.body.qualify == 'positive') {
                await User.findByIdAndUpdate(buy.buyer, { $inc: { recordBuyer: 1 } });
            } else {
                await User.findByIdAndUpdate(buy.buyer, { $inc: { recordBuyer: -1 } });
            }
            res.status(201).json({ status: 1, data: buy, token: req.token });
        } catch (err) {
            logger.error({ err: err }, 'Legacy operation failed');
            res.status(500).json({ status: 0, data: [err] });
        }
    },
    qualifySeller: async (req, res) => {
        try {
            let data = {
                qualifySeller: req.body.qualify,
                sellerComment: req.body.comment,
                status: 2,
                createdSeller: new Date()
            };
            let buy = await Buy.findByIdAndUpdate(req.body._id, data);

            await Payment.updateMany({ buy: req.body._id }, { status: 1 });

            let user = '';
            if (req.body.qualify == 'positive') {
                user = await User.findByIdAndUpdate(buy.user, { $inc: { record: 1 } });
            } else {
                user = await User.findByIdAndUpdate(buy.user, { $inc: { record: -1 } });
            }
            logger.debug(req.user);
            if (req.user.referred) {
                await User.findByIdAndUpdate(req.user._id, { $inc: { balanceReferred: (buy.total * 2) / 100 } });
                let payment = Payment.create({
                    type: 'referred',
                    amount: (buy.total * 2) / 100,
                    user: req.user.referred,
                    buy: buy._id,
                    product: buy.product,
                    buyer: req.user._id,
                    status: 1
                });
                let pay = await payment.save();
                logger.debug(pay);
            }

            res.status(201).json({ status: 1, data: buy, token: req.token });
        } catch (err) {
            logger.error({ err: err }, 'Legacy operation failed');
            res.status(500).json({ status: 0, data: [err] });
        }
    },
    recordBuyer: async (req, res) => {
        try {
            let group = { type: '$qualifyBuyer' };
            logger.debug(req.query._id);
            let match = { buyer: toObjectId(req.query._id) };
            let sales = await Buy.aggregate([{ $match: match }, { $group: { _id: group, count: { $sum: 1 } } }]);
            res.status(200).json({ status: 1, data: sales, token: req.token });
        } catch (err) {
            logger.error({ err: err }, 'Legacy operation failed');
            res.status(500).json({ status: 0, data: [err] });
        }
    },
    recordSeller: async (req, res) => {
        try {
            let group = { type: '$qualifySeller' };
            logger.debug(req.query._id);
            let match = { user: toObjectId(req.query._id) };
            let sales = await Buy.aggregate([{ $match: match }, { $group: { _id: group, count: { $sum: 1 } } }]);
            res.status(200).json({ status: 1, data: sales, token: req.token });
        } catch (err) {
            logger.error({ err: err }, 'Legacy operation failed');
            res.status(500).json({ status: 0, data: [err] });
        }
    }
};
module.exports = useCases;
