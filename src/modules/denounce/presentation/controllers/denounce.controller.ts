const useCases = require('../../application/services/DenounceUseCaseRegistry');
const RequestDto = require('../dto/DenounceRequestDto');
import type { NextFunction, Response } from 'express';
import type { DenounceHandler, DenounceHttpRequest } from '../dto/DenounceContracts';

function handler(name: string): DenounceHandler {
    return function denounceRequestHandler(req: DenounceHttpRequest, res: Response, next: NextFunction) {
        req.body = RequestDto.from(req.body);
        return useCases[name](req, res, next);
    };
}
module.exports = { add: handler('add') };
