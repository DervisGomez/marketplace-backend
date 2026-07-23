const logger = require('../../../../../infrastructure/logging/logger');
import type { PaymentHandler } from '../../../presentation/dto/PaymentContracts';
const Payment = require('../../../infrastructure/mongoose/repositories/PaymentRepository');
const Bank = require('../../../infrastructure/gateways/PaymentRelationsGateway').Bank;
const FileGateway = require('../../../infrastructure/gateways/LegacyFileGateway');

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

// TODO(v2): preservar bugs y contratos del flujo Payment legacy.
const useCases: Readonly<Record<string, PaymentHandler>> = {
    pendingPayments: async (req, res) => {
        try {
            let payment = await Payment.find({ type: 'veco', buy: null, status: 2 })
                .populate('account')
                .populate('product')
                .populate('user');
            let banks = await Bank.find({}, { name: 1, logo: 1 });
            res.status(200).json({ status: 1, data: { payment, banks }, token: req.token });
        } catch (err) {
            logger.error({ err: err }, 'Legacy operation failed');
            res.status(500).json({ status: 0, data: [err] });
        }
    },
    pendingExecuted: async (req, res) => {
        try {
            let count = await Payment.countDocuments({ type: 'veco', buy: null, status: 1 });
            let numPages = parseInt(String(count / Number(req.query.limit) + 1));
            let skip = (parseInt(String(req.query.skip)) - 1) * parseInt(String(req.query.limit));
            let payment = await Payment.find({ type: 'veco', buy: null, status: 1 })
                .populate('account')
                .populate('product')
                .populate('user')
                .skip(skip)
                .limit(parseInt(String(req.query.limit)))
                .sort({ $natural: -1 });
            res.status(200).json({ status: 1, data: { payment, numPages }, token: req.token });
        } catch (err) {
            logger.error({ err: err }, 'Legacy operation failed');
            res.status(500).json({ status: 0, data: [err] });
        }
    },
    processPayments: async (req, res) => {
        try {
            let image = await FileGateway.uploadImage(req.body.photo);
            let payment = await Payment.findByIdAndUpdate(
                req.body._id,
                { photo: image, status: 1 },
                { projection: userData, new: true }
            );
            res.status(200).json({ status: 1, data: { payment }, token: req.token });
        } catch (err) {
            logger.error({ err: err }, 'Legacy operation failed');
            res.status(500).json({ status: 0, data: [err] });
        }
    }
};
module.exports = useCases;
