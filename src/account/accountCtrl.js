const logger = require('../infrastructure/logging/logger');
let Account = require('./accountSchema');
let mongoose = require('mongoose');
let Files = require('../file/fileCtrl');

module.exports = {
    add: async (req, res) => {
        try {
            req.body.user = req.user._id;
            let newAccount = new Account(req.body);
            let account = await newAccount.save();
            res.status(201).json({ status: 1, data: { account } });
        } catch (err) {
            logger.error({ err: err }, 'Legacy operation failed');
            res.status(500).json({ status: 0, data: [err] });
        }
    },
    edit: async (req, res) => {
        try {
            let account = await Account.findByIdAndUpdate(req.body._id, req.body, { new: true });
            res.status(201).json({ status: 1, data: { account } });
        } catch (err) {
            logger.error({ err: err }, 'Legacy operation failed');
            res.status(500).json({ status: 0, data: [err] });
        }
    },
    remove: async (req, res) => {
        try {
            let account = await Account.deleteMany({ _id: req.query._id });
            res.status(201).json({ status: 1, data: { account } });
        } catch (err) {
            logger.error({ err: err }, 'Legacy operation failed');
            res.status(500).json({ status: 0, data: [err] });
        }
    },
    list: async (req, res) => {
        try {
            logger.debug(req.user._id);
            let account = await Account.find({ user: req.user._id }).populate('bank');
            res.status(201).json({ status: 1, data: { account } });
        } catch (err) {
            logger.error({ err: err }, 'Legacy operation failed');
            res.status(500).json({ status: 0, data: [err] });
        }
    }
};
