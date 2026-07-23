const logger = require('../infrastructure/logging/logger');
let Bank = require('./bankSchema');
let mongoose = require('mongoose');
let Files = require('../file/fileCtrl');

module.exports = {
    add: async (req, res) => {
        try {
            let image = req.body.image;
            delete req.body.image;
            req.body.image = await Files.uploadImage(image);
            let newBank = new Bank(req.body);
            let bank = await newBank.save();
            res.status(201).json({ status: 1, data: { bank } });
        } catch (err) {
            logger.error({ err: err }, 'Legacy operation failed');
            res.status(500).json({ status: 0, data: [err] });
        }
    },
    edit: async (req, res) => {
        try {
            if (req.body.image) {
                let image = req.body.image;
                delete req.body.image;
                req.body.image = await Files.uploadImage(image);
            }
            let bank = await Bank.findByIdAndUpdate(req.body._id, req.body, { new: true });
            res.status(201).json({ status: 1, data: { bank } });
        } catch (err) {
            logger.error({ err: err }, 'Legacy operation failed');
            res.status(500).json({ status: 0, data: [err] });
        }
    },
    remove: async (req, res) => {
        try {
            let bank = await Bank.deleteMany({ _id: req.query._id });
            res.status(201).json({ status: 1, data: { bank } });
        } catch (err) {
            logger.error({ err: err }, 'Legacy operation failed');
            res.status(500).json({ status: 0, data: [err] });
        }
    },
    list: async (req, res) => {
        try {
            let bank = await Bank.find({});
            res.status(201).json({ status: 1, data: { bank } });
        } catch (err) {
            logger.error({ err: err }, 'Legacy operation failed');
            res.status(500).json({ status: 0, data: [err] });
        }
    }
};
