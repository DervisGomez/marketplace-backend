const logger = require('../../../../../infrastructure/logging/logger');
import type { ProductHandler } from '../../../presentation/dto/ProductContracts';
const { updateResult } = require('../../../../../infrastructure/http/serializeLegacyWriteResult');
const Product = require('../../../infrastructure/mongoose/repositories/ProductRepository');

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
    number: 1
};

// TODO(v2): los bugs documentados se preservan para mantener compatibilidad.
module.exports = {
    favoriteAdd: async (req, res) => {
        try {
            //let product = req.query._id.toLowerCase();
            let product = await Product.updateMany(
                { _id: req.body._id },
                {
                    $addToSet: {
                        favorite: req.user._id
                    }
                },
                { multi: true }
            );
            product = updateResult(product);
            res.status(200).json({ status: 1, data: product });
        } catch (err) {
            logger.error({ err: err }, 'Legacy operation failed');
            res.status(500).json({ status: 0, data: [err] });
        }
    },
    favoriteRemove: async (req, res) => {
        try {
            logger.debug(req.user._id);
            let product = await Product.updateMany(
                { _id: req.query._id },
                {
                    $pull: {
                        favorite: req.user._id
                    }
                },
                { multi: true }
            );
            product = updateResult(product);
            res.status(200).json({ status: 1, data: product });
        } catch (err) {
            logger.error({ err: err }, 'Legacy operation failed');
            res.status(500).json({ status: 0, data: [err] });
        }
    },
    favorite: async (req, res) => {
        try {
            let count = await Product.countDocuments({ favorite: req.user._id });
            let numPages = parseInt(String(count / Number(req.query.limit) + 1));
            let skip = (parseInt(req.query.skip) - 1) * parseInt(req.query.limit);
            let product = await Product.find({ favorite: req.user._id }, productData)
                .populate('user', { city: 1, department: 1 })
                .skip(skip)
                .limit(parseInt(req.query.limit))
                .sort({ $natural: -1 });
            res.status(200).json({ status: 1, data: { product, numPages }, token: req.token });
        } catch (err) {
            logger.error({ err: err }, 'Legacy operation failed');
            res.status(500).json({ status: 0, data: [err] });
        }
    }
} satisfies Readonly<Record<string, ProductHandler>>;
