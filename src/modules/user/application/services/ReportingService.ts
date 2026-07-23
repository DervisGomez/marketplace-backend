const logger = require('../../../../infrastructure/logging/logger');
const { updateResult } = require('../../../../infrastructure/http/serializeLegacyWriteResult');
const User = require('../repositories/UserRepository');
const Marketplace = require('../repositories/MarketplaceRepository');
const Product = Marketplace.Product;
const Buy = Marketplace.Buy;
const ObjectId = require('mongoose').Types.ObjectId;
const MagicNumbers = require('../../../../../../src/modules/user/shared/constants/MagicNumbers');
import type { UserServiceHandler } from '../dtos/UserContracts';

/**
 * Casos de uso de Reporting.
 * Sus dependencias se limitan a repositorios y adaptadores requeridos por estos flujos.
 */
module.exports = {
    operations: async (req, res) => {
        try {
            let seller = await User.find({}, { userName: 1, name: 1, lastName: 1, photo: 1, record: 1 })
                .sort({ record: -1 })
                .limit(MagicNumbers.USER_RANKING_LIMIT);
            let buyer = await User.find({}, { userName: 1, name: 1, lastName: 1, photo: 1, recordBuyer: 1 })
                .sort({ recordBuyer: -1 })
                .limit(MagicNumbers.USER_RANKING_LIMIT);
            let date = new Date();
            switch (req.query.date) {
                case 'day':
                    date.setDate(date.getDate() - 1);
                    break;
                case 'week':
                    date.setDate(date.getDate() - 7);
                    break;
                case 'fortnight':
                    date.setDate(date.getDate() - 15);
                    break;
                case 'monthly':
                    date.setDate(date.getDate() - 30);
                    break;
            }
            let group = { type: '$highlight' };
            let match = { $or: [{ status: 1 }, { status: 2 }], createdAt: { $gt: date } };
            let buy = await Product.aggregate([{ $match: match }, { $group: { _id: group, count: { $sum: 1 } } }]);
            logger.debug(buy);
            let publication: Record<string, unknown> = {};
            let active = await Product.countDocuments({ status: 1 });
            for (let i = 0; i < buy.length; i++) {
                publication[buy[i]._id.type] = buy[i].count;
            }
            res.status(200).json({ status: 1, data: { seller, buyer, publication, active } });
        } catch (err) {
            logger.error({ err: err }, 'Legacy operation failed');
            res.status(500).json({ status: 0, data: [err] });
        }
    },
    operationsSeller: async (req, res) => {
        try {
            let count = await Buy.countDocuments({ $or: [{ status: 1 }, { status: 2 }] });
            let numPages = parseInt(String(count / Number(req.query.limit) + 1));
            let skip = (parseInt(req.query.skip) - 1) * parseInt(req.query.limit);
            let seller = await User.find({}, { userName: 1, name: 1, lastName: 1, photo: 1, record: 1 })
                .skip(skip)
                .limit(parseInt(req.query.limit))
                .sort({ record: -1 });
            res.status(200).json({ status: 1, data: { seller, numPages } });
        } catch (err) {
            logger.error({ err: err }, 'Legacy operation failed');
            res.status(500).json({ status: 0, data: [err] });
        }
    },
    operationsBuyer: async (req, res) => {
        try {
            let count = await Buy.countDocuments({ $or: [{ status: 1 }, { status: 2 }] });
            let numPages = parseInt(String(count / Number(req.query.limit) + 1));
            let skip = (parseInt(req.query.skip) - 1) * parseInt(req.query.limit);
            let buyer = await User.find({}, { userName: 1, name: 1, lastName: 1, photo: 1, recordBuyer: 1 })
                .skip(skip)
                .limit(parseInt(req.query.limit))
                .sort({ recordBuyer: -1 });
            res.status(200).json({ status: 1, data: { buyer, numPages } });
        } catch (err) {
            logger.error({ err: err }, 'Legacy operation failed');
            res.status(500).json({ status: 0, data: [err] });
        }
    },
    userNew: async (req, res) => {
        try {
            let date = new Date();
            switch (req.query.date) {
                case 'day':
                    date.setDate(date.getDate() - 1);
                    break;
                case 'week':
                    date.setDate(date.getDate() - 7);
                    break;
                case 'fortnight':
                    date.setDate(date.getDate() - 15);
                    break;
                case 'monthly':
                    date.setDate(date.getDate() - 3000);
                    break;
            }
            const group = { type: '$status' };
            let users = await User.find({ $or: [{ status: 1 }, { status: 2 }], createdAt: { $gt: date } });

            res.status(200).json({ status: 1, data: { users } });
        } catch (err) {
            logger.error({ err: err }, 'Legacy operation failed');
            res.status(500).json({ status: 0, data: [err] });
        }
    },
    userActive: async (req, res) => {
        try {
            let count = await Buy.countDocuments({ $or: [{ status: 1 }, { status: 2 }] });
            let numPages = parseInt(String(count / Number(req.query.limit) + 1));
            let skip = (parseInt(req.query.skip) - 1) * parseInt(req.query.limit);
            let users = await User.find({ $or: [{ status: 1 }, { status: 2 }] })
                .skip(skip)
                .limit(parseInt(req.query.limit))
                .sort({ $natural: -1 });
            res.status(200).json({ status: 1, data: { users, numPages } });
        } catch (err) {
            logger.error({ err: err }, 'Legacy operation failed');
            res.status(500).json({ status: 0, data: [err] });
        }
    },
    record: async (req, res) => {
        try {
            let user = await User.findById(req.user._id, { record: 1, recordBuyer: 1 });
            res.status(200).json({ status: 1, data: user });
        } catch (err) {
            logger.error({ err: err }, 'Legacy operation failed');
            res.status(500).json({ status: 0, data: [err] });
        }
    },
    recordUser: async (req, res) => {
        try {
            let user = await User.updateOne({ status: 2 }, { record: 0, recordBuyer: 0 });
            user = updateResult(user);
            res.status(200).json({ status: 1, data: user });
        } catch (err) {
            logger.error({ err: err }, 'Legacy operation failed');
            res.status(500).json({ status: 0, data: [err] });
        }
    },
    recordInfo: async (req, res) => {
        try {
            let group = { type: '$qualifyBuyer' };
            let match: Record<string, unknown> = { buyer: new ObjectId(req.query._id) };
            let buyer = await Buy.aggregate([{ $match: match }, { $group: { _id: group, count: { $sum: 1 } } }]);

            group = { type: '$qualifySeller' };
            match = { user: new ObjectId(req.query._id) };
            let seller = await Buy.aggregate([{ $match: match }, { $group: { _id: group, count: { $sum: 1 } } }]);

            let user = await User.findById(req.query._id);

            res.status(200).json({ status: 1, data: { buyer, seller, user }, token: req.token });
        } catch (err) {
            logger.error({ err: err }, 'Legacy operation failed');
            res.status(500).json({ status: 0, data: [err] });
        }
    },
    birthdate: async (req, res) => {
        try {
            let date = new Date();
            logger.debug({ month: date.getMonth() + 1, day: date.getDate() });
            let user = await User.find({ month: date.getMonth() + 1, day: date.getDate() });
            res.status(200).json({ status: 1, data: { user }, token: req.token });
        } catch (err) {
            logger.error({ err: err }, 'Legacy operation failed');
            res.status(500).json({ status: 0, data: [err] });
        }
    }
} satisfies Readonly<Record<string, UserServiceHandler>>;
