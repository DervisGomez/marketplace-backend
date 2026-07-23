const logger = require('../../../../../infrastructure/logging/logger');
import type { BuyHandler } from '../../../presentation/dto/BuyContracts';
const Buy = require('../../../infrastructure/mongoose/repositories/BuyRepository');
const toObjectId = require('../../../infrastructure/mongoose/repositories/MongoObjectId');

const productData = {
    title: 1,
    images: 1,
    price: 1,
    quantitySold: 1,
    city: 1,
    department: 1,
    favorite: 1,
    visits: 1,
    status: 1,
    condition: 1,
    warrantyType: 1,
    warrantyTime: 1
};
const userData = { password: 0, passwordFailures: 0, status: 0, __v: 0 };

// TODO(v2): preservar los bugs conocidos hasta una fase funcional.
const useCases: Readonly<Record<string, BuyHandler>> = {
    noqualifySeller: async (req, res) => {
        try {
            logger.debug('fin');
            let buy = await Buy.find({ user: req.user._id, qualifyBuyer: 'none' })
                .populate('messages')
                .populate('product', productData)
                .populate('buyer', userData)
                .populate('user', userData)
                .sort({ $natural: -1 });
            res.status(201).json({ status: 1, data: { buy }, token: req.token });
        } catch (err) {
            logger.error({ err: err }, 'Legacy operation failed');
            res.status(500).json({ status: 0, data: [err] });
        }
    },
    noqualifyBuyer: async (req, res) => {
        try {
            logger.debug('fin');
            let buy = await Buy.find({ buyer: req.user._id, qualifySeller: 'none' })
                .populate('messages')
                .populate('product', productData)
                .populate('buyer', userData)
                .populate('user', userData)
                .sort({ $natural: -1 });
            res.status(201).json({ status: 1, data: { buy }, token: req.token });
        } catch (err) {
            logger.error({ err: err }, 'Legacy operation failed');
            res.status(500).json({ status: 0, data: [err] });
        }
    },
    lock: async (req, res) => {
        try {
            let date = new Date();
            date.setDate(date.getDate() - 15);
            logger.debug(date);
            let noqualifyBuyer = await Buy.countDocuments({
                buyer: toObjectId(req.user._id),
                qualifySeller: 'none',
                report: 0,
                createdAt: { $lt: date }
            });
            let noqualifySeller = await Buy.countDocuments({
                user: toObjectId(req.user._id),
                qualifyBuyer: 'none',
                createdAt: { $lt: date }
            });

            res.status(201).json({ status: 1, data: { noqualifyBuyer, noqualifySeller }, token: req.token });
        } catch (err) {
            logger.error({ err: err }, 'Legacy operation failed');
            res.status(500).json({ status: 0, data: [err] });
        }
    },
    lockList: async (req, res) => {
        try {
            let date = new Date();
            date.setDate(date.getDate() - 15);
            let buyer = await Buy.find({
                buyer: req.user._id,
                qualifySeller: 'none',
                report: 0,
                createdAt: { $lt: date }
            })
                .populate('product', productData)
                .populate('buyer', userData);
            let seller = await Buy.find({ user: req.user._id, qualifyBuyer: 'none', createdAt: { $lt: date } })
                .populate('product', productData)
                .populate('user', userData);

            res.status(201).json({ status: 1, data: { buyer, seller }, token: req.token });
        } catch (err) {
            logger.error({ err: err }, 'Legacy operation failed');
            res.status(500).json({ status: 0, data: [err] });
        }
    }
};
module.exports = useCases;
