const logger = require('../../../../../infrastructure/logging/logger');
const Buy = require('../../../infrastructure/mongoose/repositories/BuyRepository');
const Question = require('../../../infrastructure/gateways/BuyRelationsGateway').Question;
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
module.exports = {
    find: async (req, res) => {
        try {
            logger.debug('data');
            let buy = await Buy.findById(req.query._id)
                .populate('product', productData)
                .populate('user', userData)
                .populate('buyer', userData);
            let question = await Question.find({ product: buy.product._id, client: buy.buyer._id })
                .limit(10)
                .sort({ $natural: -1 });
            res.status(201).json({ status: 1, data: { buy, question }, token: req.token });
        } catch (err) {
            logger.error({ err: err }, 'Legacy operation failed');
            res.status(500).json({ status: 0, data: [err] });
        }
    },
    findNumber: async (req, res) => {
        try {
            let buy = await Buy.find({ number: req.query.number })
                .populate('product', productData)
                .populate('user', userData)
                .populate('buyer', userData)
                .populate('messages');
            if (buy.length > 0) {
                let question = await Question.find({ product: buy[0].product._id, client: buy[0].buyer._id })
                    .limit(10)
                    .sort({ $natural: -1 });
                res.status(201).json({ status: 1, data: { buy, question }, token: req.token });
            } else {
                res.status(201).json({ status: 0, data: 'Compra/Venta no encontrada', token: req.token });
            }
        } catch (err) {
            logger.error({ err: err }, 'Legacy operation failed');
            res.status(500).json({ status: 0, data: [err] });
        }
    },
    purchases: async (req, res) => {
        try {
            let group = { status: '$status' };
            let match = { buyer: toObjectId(req.user._id) };
            let counts = await Buy.aggregate([{ $match: match }, { $group: { _id: group, count: { $sum: 1 } } }]);
            let count = await Buy.countDocuments({ buyer: req.user._id, status: req.query.status });
            numPages = parseInt(count / req.query.limit + 1);
            let skip = (parseInt(req.query.skip) - 1) * parseInt(req.query.limit);
            let buy = await Buy.find({ buyer: req.user._id, status: req.query.status })
                .populate('messages')
                .populate('product', productData)
                .populate('user', userData)
                .skip(skip)
                .limit(parseInt(req.query.limit))
                .sort({ $natural: -1 });
            res.status(201).json({ status: 1, data: { buy, counts }, token: req.token });
        } catch (err) {
            logger.error({ err: err }, 'Legacy operation failed');
            res.status(500).json({ status: 0, data: [err] });
        }
    },
    purchasesDate: async (req, res) => {
        try {
            let date = new Date();
            date.setHours(0);
            date.setMinutes(0);
            date.setSeconds(0);
            switch (req.query.date) {
                case 'today':
                    break;
                case 'sevenDays':
                    date.setDate(date.getDate() - 7);
                    break;
                case 'fifteenDays':
                    date.setDate(date.getDate() - 15);
                    break;
                case 'thirtyDays':
                    date.setDate(date.getDate() - 30);
                    break;
            }
            let buy = await Buy.find({ buyer: req.user._id, status: 2, createdAt: { $gt: date } })
                .populate('messages')
                .populate('product', productData)
                .populate('user', userData)
                .sort({ $natural: -1 });
            res.status(201).json({ status: 1, data: buy, token: req.token });
        } catch (err) {
            logger.error({ err: err }, 'Legacy operation failed');
            res.status(500).json({ status: 0, data: [err] });
        }
    },
    sale: async (req, res) => {
        try {
            let group = { status: '$status' };
            let match = { user: toObjectId(req.user._id) };
            let counts = await Buy.aggregate([{ $match: match }, { $group: { _id: group, count: { $sum: 1 } } }]);
            let count = await Buy.countDocuments({ user: req.user._id, status: req.query.status });
            numPages = parseInt(count / req.query.limit + 1);
            let skip = (parseInt(req.query.skip) - 1) * parseInt(req.query.limit);
            let buy = await Buy.find({ user: req.user._id, status: req.query.status })
                .populate('messages')
                .populate('product', productData)
                .populate('buyer', userData)
                .populate('user', userData)
                .skip(skip)
                .limit(parseInt(req.query.limit))
                .sort({ $natural: -1 });
            res.status(201).json({ status: 1, data: { buy, counts }, token: req.token });
        } catch (err) {
            logger.error({ err: err }, 'Legacy operation failed');
            res.status(500).json({ status: 0, data: [err] });
        }
    },
    saleDate: async (req, res) => {
        try {
            let date = new Date();
            date.setHours(0);
            date.setMinutes(0);
            date.setSeconds(0);
            switch (req.query.date) {
                case 'today':
                    break;
                case 'sevenDays':
                    date.setDate(date.getDate() - 7);
                    break;
                case 'fifteenDays':
                    date.setDate(date.getDate() - 15);
                    break;
                case 'thirtyDays':
                    date.setDate(date.getDate() - 30);
                    break;
            }
            let buy = await Buy.find({ user: req.user._id, status: 2, createdAt: { $gt: date } })
                .populate('messages')
                .populate('product', productData)
                .populate('buyer', userData)
                .populate('user', userData)
                .sort({ $natural: -1 });
            res.status(201).json({ status: 1, data: buy, token: req.token });
        } catch (err) {
            logger.error({ err: err }, 'Legacy operation failed');
            res.status(500).json({ status: 0, data: [err] });
        }
    }
};
