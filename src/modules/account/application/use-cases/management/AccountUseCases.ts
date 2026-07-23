const logger = require('../../../../../infrastructure/logging/logger');
const { deleteResult } = require('../../../../../infrastructure/http/serializeLegacyWriteResult');
const Account = require('../../../infrastructure/mongoose/repositories/AccountRepository');
import type { AccountHandler } from '../../../presentation/dto/AccountContracts';

module.exports = {
    add: async (req, res) => {
        try {
            req.body.user = req.user._id;
            const account = await Account.create(req.body).save();
            res.status(201).json({ status: 1, data: { account } });
        } catch (err) {
            logger.error({ err: err }, 'Legacy operation failed');
            res.status(500).json({ status: 0, data: [err] });
        }
    },
    edit: async (req, res) => {
        try {
            const account = await Account.findByIdAndUpdate(req.body._id, req.body, { new: true });
            res.status(201).json({ status: 1, data: { account } });
        } catch (err) {
            logger.error({ err: err }, 'Legacy operation failed');
            res.status(500).json({ status: 0, data: [err] });
        }
    },
    remove: async (req, res) => {
        try {
            let account = await Account.deleteMany({ _id: req.query._id });
            account = deleteResult(account);
            res.status(201).json({ status: 1, data: { account } });
        } catch (err) {
            logger.error({ err: err }, 'Legacy operation failed');
            res.status(500).json({ status: 0, data: [err] });
        }
    },
    list: async (req, res) => {
        try {
            logger.debug(req.user._id);
            const account = await Account.find({ user: req.user._id }).populate('bank');
            res.status(201).json({ status: 1, data: { account } });
        } catch (err) {
            logger.error({ err: err }, 'Legacy operation failed');
            res.status(500).json({ status: 0, data: [err] });
        }
    }
} satisfies Readonly<Record<string, AccountHandler>>;
