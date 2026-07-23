const useCases = require('../../application/services/InvestUseCaseRegistry');
const RequestDto = require('../dto/InvestRequestDto');
import type { NextFunction, Response } from 'express';
import type { InvestHandler, InvestHttpRequest } from '../dto/InvestContracts';
function handler(name: string): InvestHandler {
    return function investRequestHandler(req: InvestHttpRequest, res: Response, next: NextFunction) {
        req.body = RequestDto.from(req.body);
        return useCases[name](req, res, next);
    };
}
module.exports = { add: handler('add') };
