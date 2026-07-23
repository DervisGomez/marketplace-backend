const useCases = require('../../application/services/BankUseCaseRegistry');
const RequestDto = require('../dto/BankRequestDto');
import type { NextFunction, Response } from 'express';
import type { BankHandler, BankHttpRequest } from '../dto/BankContracts';
function handler(name: string): BankHandler {
    return function bankRequestHandler(req: BankHttpRequest, res: Response, next: NextFunction) {
        req.body = RequestDto.from(req.body);
        return useCases[name](req, res, next);
    };
}
module.exports = Object.fromEntries(['list', 'add', 'edit', 'remove'].map(name => [name, handler(name)]));
