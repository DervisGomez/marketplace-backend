const logger = require('../../../../../infrastructure/logging/logger');
const serializeLegacyError = require('../../../../../infrastructure/http/serializeLegacyError');
const Buy = require('../../../infrastructure/mongoose/repositories/BuyRepository');

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
    listBuyer: async (req, res) => {
        try {
            let count = await Buy.countDocuments({
                buyer: req.query._id,
                buyerComment: { $ne: null },
                sellerComment: { $ne: null }
            });
            numPages = parseInt(count / req.query.limit + 1);
            let skip = (parseInt(req.query.skip) - 1) * parseInt(req.query.limit);
            let buy = await Buy.find({ buyer: req.query._id, buyerComment: { $ne: null } })
                .populate('buyer', { userName: 1, photo: 1, recordBuyer: 1 })
                .populate('product', { title: 1, images: 1 })
                .skip(skip)
                .limit(parseInt(req.query.limit))
                .sort({ createdBuyer: -1 });
            res.status(201).json({ status: 1, data: { buy, numPages }, token: req.token });
        } catch (err) {
            logger.error({ err: err }, 'Legacy operation failed');
            res.status(500).json({ status: 0, data: [err] });
        }
    },
    list: async (req, res) => {
        try {
            logger.debug('fin');
            let count = await Buy.countDocuments({
                user: req.query._id,
                sellerComment: { $ne: null },
                buyerComment: { $ne: null }
            });
            numPages = parseInt(count / req.query.limit + 1);
            let skip = (parseInt(req.query.skip) - 1) * parseInt(req.query.limit);
            let buy = await Buy.find({ user: req.query._id, sellerComment: { $ne: null } })
                .populate('buyer', { userName: 1, photo: 1, recordBuyer: 1 })
                .populate('product', { title: 1, images: 1 })
                .skip(skip)
                .limit(parseInt(req.query.limit))
                .sort({ createdSeller: -1 });
            res.status(201).json({ status: 1, data: { buy, numPages }, token: req.token });
        } catch (err) {
            logger.error({ err: err }, 'Legacy operation failed');
            res.status(500).json({ status: 0, data: [err] });
        }
    },
    listProduct: async (req, res) => {
        try {
            let count = await Buy.countDocuments({
                user: req.query._id,
                product: req.query.product,
                sellerComment: { $ne: null }
            });
            numPages = parseInt(count / req.query.limit + 1);
            let skip = (parseInt(req.query.skip) - 1) * parseInt(req.query.limit);
            let buy = await Buy.find({ user: req.query._id, product: req.query.product, sellerComment: { $ne: null } })
                .populate('buyer', { userName: 1, photo: 1, recordBuyer: 1 })
                .populate('product', { title: 1, images: 1 })
                .skip(skip)
                .limit(parseInt(req.query.limit))
                .sort({ $natural: -1 });
            res.status(201).json({ status: 1, data: { buy, numPages }, token: req.token });
        } catch (err) {
            logger.error({ err: err }, 'Legacy operation failed');
            res.status(500).json({ status: 0, data: [err] });
        }
    },
    search: async (req, res) => {
        try {
            let filter = {
                $or: [
                    {
                        buyerName: { $regex: req.query.search, $options: '-i' }
                    },
                    {
                        number: { $regex: req.query.search, $options: '-i' }
                    }
                ],
                user: req.user._id
            };
            let buy = await Buy.find(filter)
                .populate('messages')
                .populate('product', productData)
                .populate('buyer', userData)
                .populate('user', userData);
            res.status(200).json({ status: 1, data: { buy } });
        } catch (err) {
            logger.error({ err: err }, 'Legacy operation failed');
            res.status(500).json({ status: 0, data: [serializeLegacyError(err)] });
        }
    }
};
