const logger = require('../../../../../infrastructure/logging/logger');
const Denounce = require('../../../infrastructure/mongoose/repositories/DenounceRepository');
const Question = require('../../../infrastructure/gateways/LegacyQuestionGateway');
import type { DenounceHandler } from '../../../presentation/dto/DenounceContracts';

module.exports = {
    add: async (req, res) => {
        try {
            req.body.accuser = req.user._id;
            const newDenounce = Denounce.create(req.body);
            await newDenounce.save();
            const question = await Question.findByIdAndUpdate(req.body.question, { status: 0 }, { new: true });
            res.status(201).json({ status: 1, data: question, token: req.token });
        } catch (err) {
            logger.error({ err: err }, 'Legacy operation failed');
            res.status(500).json({ status: 0, data: [err] });
        }
    }
} satisfies Readonly<Record<string, DenounceHandler>>;
