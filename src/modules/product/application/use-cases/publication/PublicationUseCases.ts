const logger = require('../../../../../infrastructure/logging/logger');
import type { ProductHandler } from '../../../presentation/dto/ProductContracts';
const Product = require('../../../infrastructure/mongoose/repositories/ProductRepository');
const Increment = require('../../../infrastructure/mongoose/repositories/ProductIncrementRepository');
const ImageGateway = require('../../../infrastructure/cloudinary/LegacyImageGateway');

// TODO(v2): los bugs documentados se preservan para mantener compatibilidad.
module.exports = {
    createIncrement: async (req, res) => {
        let increment = Increment.create();
        increment = await increment.save();
        res.status(201).json({ status: 1, data: increment });
    },
    new: async (req, res) => {
        try {
            let increment = await Increment.findOneAndUpdate({ status: 1 }, { $inc: { number: 1 } }, { new: true });
            req.body.number = increment.number;
            let images = req.body.images;
            Reflect.deleteProperty(req.body, 'images');
            req.body.user = req.user._id;
            req.body.city = req.user.city;
            req.body.department = req.user.department;
            req.body.month = new Date().getMonth();
            req.body.year = new Date().getFullYear();
            let newProduct = Product.create(req.body);
            let product = await newProduct.save();
            let response = await ImageGateway.uploadImages(images);
            if (response.length > 0) {
                product = await Product.findByIdAndUpdate(product._id, { images: response }, { new: true });
                res.status(201).json({ status: 1, data: product, token: req.token });
            } else {
                res.status(500).json({ status: 0, data: ['Ha ocurrido un error'] });
            }
        } catch (err) {
            logger.error({ err: err }, 'Legacy operation failed');
            res.status(500).json({ status: 0, data: [err] });
        }
    },
    edit: async (req, res) => {
        try {
            let imagesDelete = req.body.imagesDelete;
            if (req.body.imagesNew.length > 0) {
                let response = await ImageGateway.uploadImages(req.body.imagesNew);
                req.body.images = response;
            }
            Reflect.deleteProperty(req.body, 'imagesNew');
            Reflect.deleteProperty(req.body, 'imagesDelete');
            let product = await Product.findByIdAndUpdate(req.body._id, req.body, { new: true });
            //product = await Product.findByIdAndUpdate(product._id,{$pullAll:{images:imagesDelete}},{new: true });
            res.status(201).json({ status: 1, data: product, token: req.token });
        } catch (err) {
            logger.error({ err: err }, 'Legacy operation failed');
            res.status(500).json({ status: 0, data: [err] });
        }
    },
    pause: async (req, res) => {
        try {
            let product = await Product.findByIdAndUpdate(req.body._id, { status: 2 }, { new: true });
            res.status(200).json({ status: 1, data: { product }, token: req.token });
        } catch (err) {
            logger.error({ err: err }, 'Legacy operation failed');
            res.status(500).json({ status: 0, data: [err] });
        }
    },
    start: async (req, res) => {
        try {
            let product = await Product.findById(req.body._id);
            if (product.quantity > 0) {
                product = await Product.findByIdAndUpdate(req.body._id, { status: 1 }, { new: true });
                res.status(200).json({ status: 1, data: { product }, token: req.token });
            } else {
                res.status(200).json({ status: 0, data: ['No hay inventario disponible'], token: req.token });
            }
        } catch (err) {
            logger.error({ err: err }, 'Legacy operation failed');
            res.status(500).json({ status: 0, data: [err] });
        }
    }
} satisfies Readonly<Record<string, ProductHandler>>;
