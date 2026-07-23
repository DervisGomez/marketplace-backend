const logger = require('../../../../../infrastructure/logging/logger');
const { deleteResult } = require('../../../../../infrastructure/http/serializeLegacyWriteResult');
const Bank = require('../../../infrastructure/mongoose/repositories/BankRepository');
const Files = require('../../../infrastructure/gateways/LegacyImageGateway');
import type { BankHandler } from '../../../presentation/dto/BankContracts';

module.exports = {
    add: async (req, res) => {
        try {
            const image = req.body.image;
            Reflect.deleteProperty(req.body, 'image');
            req.body.image = await Files.uploadImage(image);
            const bank = await Bank.create(req.body).save();
            res.status(201).json({ status: 1, data: { bank } });
        } catch (err) {
            logger.error({ err: err }, 'Legacy operation failed');
            res.status(500).json({ status: 0, data: [err] });
        }
    },
    edit: async (req, res) => {
        try {
            if (req.body.image) {
                const image = req.body.image;
                Reflect.deleteProperty(req.body, 'image');
                req.body.image = await Files.uploadImage(image);
            }
            const bank = await Bank.findByIdAndUpdate(req.body._id, req.body, { new: true });
            res.status(201).json({ status: 1, data: { bank } });
        } catch (err) {
            logger.error({ err: err }, 'Legacy operation failed');
            res.status(500).json({ status: 0, data: [err] });
        }
    },
    remove: async (req, res) => {
        try {
            let bank = await Bank.deleteMany({ _id: req.query._id });
            bank = deleteResult(bank);
            res.status(201).json({ status: 1, data: { bank } });
        } catch (err) {
            logger.error({ err: err }, 'Legacy operation failed');
            res.status(500).json({ status: 0, data: [err] });
        }
    },
    list: async (_req, res) => {
        try {
            const bank = await Bank.find({});
            res.status(201).json({ status: 1, data: { bank } });
        } catch (err) {
            logger.error({ err: err }, 'Legacy operation failed');
            res.status(500).json({ status: 0, data: [err] });
        }
    }
} satisfies Readonly<Record<string, BankHandler>>;
