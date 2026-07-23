const logger = require('../../../../../infrastructure/logging/logger');
const Invest = require('../../../infrastructure/mongoose/repositories/InvestRepository');
import type { InvestHandler } from '../../../presentation/dto/InvestContracts';

module.exports = {
    add: async (req, res) => {
        try {
            const newInvest = Invest.create(req.body);
            const invest = await newInvest.save();
            res.status(201).json({ status: 1, data: { invest } });
        } catch (err) {
            logger.error({ err: err }, 'Legacy operation failed');
            res.status(500).json({ status: 0, data: [err] });
        }
    }
} satisfies Readonly<Record<string, InvestHandler>>;
