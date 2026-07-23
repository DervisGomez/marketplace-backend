const logger = require('../../../../../infrastructure/logging/logger');
const Buy = require('../../../infrastructure/mongoose/repositories/BuyRepository');
const toObjectId = require('../../../infrastructure/mongoose/repositories/MongoObjectId');
const ReputationGateway = require('../../../infrastructure/gateways/LegacyReputationGateway');

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
    meRecordBuyer: async (req, res) => {
        try {
            logger.debug('cero', req.query.filter);
            group = { type: '$qualifyBuyer' };
            let match = { buyer: toObjectId(req.user._id) };
            let record = await Buy.aggregate([{ $match: match }, { $group: { _id: group, count: { $sum: 1 } } }]);
            let count = 0;
            for (let i = 0; i < record.length; i++) {
                if (record[i]._id.type != 'none') {
                    count = count + record[i].count;
                }
            }
            let filter = {};
            filter.buyer = req.user._id;
            filter.buyerComment = { $ne: null };
            filter.sellerComment = { $ne: null };
            if (req.query.filter != '') {
                filter.qualifyBuyer = req.query.filter;
            }

            let numPages = parseInt(count / req.query.limit + 1);
            let skip = (parseInt(req.query.skip) - 1) * parseInt(req.query.limit);

            let records = await ReputationGateway.infoBuyer(toObjectId(req.user._id));
            let recordName = records.category;

            let messages = await Buy.find(filter, { messages: 0 })
                .populate('user', { userName: 1, photo: 1, record: 1 })
                .populate('product', { title: 1, images: 1 })
                .skip(skip)
                .limit(parseInt(req.query.limit))
                .sort({ createdBuyer: -1 });
            logger.debug('dos::>>', messages.length);
            res.status(200).json({
                status: 1,
                data: { record, messages, numPages, recordName, records },
                token: req.token
            });
        } catch (err) {
            logger.error({ err: err }, 'Legacy operation failed');
            res.status(500).json({ status: 0, data: [err] });
        }
    },
    meRecordUser: async (req, res) => {
        try {
            group = { type: '$qualifySeller' };
            let match = { user: toObjectId(req.user._id) };
            let record = await Buy.aggregate([{ $match: match }, { $group: { _id: group, count: { $sum: 1 } } }]);
            let count = 0;
            for (let i = 0; i < record.length; i++) {
                if (record[i]._id.type != 'none') {
                    count = count + record[i].count;
                }
            }
            let filter = {};
            filter.user = req.user._id;
            filter.sellerComment = { $ne: null };
            filter.buyerComment = { $ne: null };
            if (req.query.filter != '') {
                filter.qualifySeller = req.query.filter;
            }
            let numPages = parseInt(count / req.query.limit + 1);
            let skip = (parseInt(req.query.skip) - 1) * parseInt(req.query.limit);

            //let recordName = await Record.calculate(req.user._id);
            let records = await ReputationGateway.info(toObjectId(req.user._id));
            let recordName = records.category;

            let messages = await Buy.find(filter, { messages: 0 })
                .populate('buyer', { userName: 1, photo: 1, recordBuyer: 1 })
                .populate('product', { title: 1, images: 1 })
                .skip(skip)
                .limit(parseInt(req.query.limit))
                .sort({ createdSeller: -1 });
            res.status(200).json({
                status: 1,
                data: { record, messages, numPages, recordName, records },
                token: req.token
            });
        } catch (err) {
            logger.error({ err: err }, 'Legacy operation failed');
            res.status(500).json({ status: 0, data: [err] });
        }
    }
};
