const logger = require('../../../../../infrastructure/logging/logger');
const Question = require('../../../infrastructure/mongoose/repositories/QuestionRepository');
const User = require('../../../infrastructure/gateways/QuestionRelationsGateway').User;

// TODO(v2): preservar bugs y contratos legacy de Question.
module.exports = {
    lock: async (req, res) => {
        try {
            const update = { ...req.query, status: 0 };
            let question = await Question.findByIdAndUpdate(req.query._id, update, { new: true });
            let user = await User.findByIdAndUpdate(req.query.user, { $addToSet: { complaints: req.user._id } });
            res.status(201).json({ status: 1, data: question, token: req.token });
        } catch (err) {
            logger.error({ err: err }, 'Legacy operation failed');
            res.status(500).json({ status: 0, data: [err] });
        }
    },
    delete: async (req, res) => {
        try {
            const update = { ...req.query, status: 0 };
            let question = await Question.findByIdAndUpdate(req.query._id, update, { new: true });
            res.status(201).json({ status: 1, data: question, token: req.token });
        } catch (err) {
            logger.error({ err: err }, 'Legacy operation failed');
            res.status(500).json({ status: 0, data: [err] });
        }
    }
};
