const logger = require('../../../../../infrastructure/logging/logger');
const Product = require('../../../infrastructure/mongoose/repositories/ProductRepository');

// TODO(v2): los bugs documentados se preservan para mantener compatibilidad.
module.exports = {
    operations: async (req, res) => {
        try {
            let date = new Date();
            date.setDate(1);
            date.setHours(0);
            date.setMinutes(0);
            date.setSeconds(0);
            date.setMonth(date.setMonth() - 11);
            let group = { month: '$month', type: '$highlight' };
            let match = { createdAt: { $gt: date }, $or: [{ status: 1 }, { status: 2 }] };
            let product = await Product.aggregate([{ $match: match }, { $group: { _id: group, count: { $sum: 1 } } }]);

            let group2 = { month: '$month' };
            let match2 = { createdAt: { $gt: date }, status: 1 };
            let product2 = await Product.aggregate([
                { $match: match2 },
                { $group: { _id: group2, count: { $sum: 1 } } }
            ]);

            let months = [];
            let month = new Date().getMonth();
            let monthArray = [
                'Enero',
                'Febrero',
                'Marzo',
                'Abril',
                'Mayo',
                'Junio',
                'Julio',
                'Agosto',
                'Septiembre',
                'Octubre',
                'Noviembre',
                'Diciembre'
            ];
            for (let i = 0; i < 12; i++) {
                let normal = 0;
                let highlight = 0;
                let active = 0;
                for (let e = 0; e < product.length; e++) {
                    if (product[e]._id.month == month && product[e]._id.type == 'normal') {
                        normal = product[e].count;
                    }
                }
                for (let e = 0; e < product.length; e++) {
                    if (product[e]._id.month == month && product[e]._id.type == 'highlight') {
                        highlight = product[e].count;
                    }
                }
                for (let e = 0; e < product2.length; e++) {
                    if (product2[e]._id.month == month) {
                        active = product2[e].count;
                    }
                }
                months.push({
                    month: monthArray[month],
                    normal: normal,
                    highlight: highlight,
                    active: active
                });
                --month;
                if (month < 0) {
                    month = 11;
                }
            }
            res.status(201).json({ status: 1, data: { product: months }, token: req.token });
        } catch (err) {
            logger.error({ err: err }, 'Legacy operation failed');
            res.status(500).json({ status: 0, data: [err] });
        }
    },
    outstanding: async (req, res) => {
        try {
            let count = await Product.countDocuments({ status: 1, highlight: 'highlight' });
            numPages = parseInt(count / req.query.limit + 1);
            let skip = (parseInt(req.query.skip) - 1) * parseInt(req.query.limit);
            let product = await Product.find(
                { status: 1, highlight: 'highlight' },
                { title: 1, images: 1, price: 1, favorite: 1, city: 1, department: 1 }
            )
                .skip(skip)
                .limit(parseInt(req.query.limit))
                .sort({ $natural: -1 });
            res.status(200).json({ status: 1, data: { product, numPages }, token: req.token });
        } catch (err) {
            logger.error({ err: err }, 'Legacy operation failed');
            res.status(500).json({ status: 0, data: [err] });
        }
    },
    last: async (req, res) => {
        try {
            let count = await Product.countDocuments({ status: 1 });
            numPages = parseInt(count / req.query.limit + 1);
            let skip = (parseInt(req.query.skip) - 1) * parseInt(req.query.limit);
            let product = await Product.find(
                { status: 1 },
                { title: 1, images: 1, price: 1, favorite: 1, city: 1, department: 1 }
            )
                .skip(skip)
                .limit(parseInt(req.query.limit))
                .sort({ $natural: -1 });
            res.status(200).json({ status: 1, data: { product, numPages }, token: req.token });
        } catch (err) {
            logger.error({ err: err }, 'Legacy operation failed');
            res.status(500).json({ status: 0, data: [err] });
        }
    },
    sold: async (req, res) => {
        try {
            let count = await Product.countDocuments({ status: 1, quantitySold: { $gt: 0 } });
            numPages = parseInt(count / req.query.limit + 1);
            let skip = (parseInt(req.query.skip) - 1) * parseInt(req.query.limit);
            let product = await Product.find(
                { status: 1, quantitySold: { $gt: 0 } },
                { title: 1, images: 1, price: 1, favorite: 1, city: 1, department: 1, quantitySold: 1 }
            )
                .skip(skip)
                .limit(parseInt(req.query.limit))
                .sort({ quantitySold: -1 });
            res.status(200).json({ status: 1, data: { product, numPages }, token: req.token });
        } catch (err) {
            logger.error({ err: err }, 'Legacy operation failed');
            res.status(500).json({ status: 0, data: [err] });
        }
    }
};
