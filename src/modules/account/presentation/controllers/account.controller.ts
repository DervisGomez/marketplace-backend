const useCases = require('../../application/services/AccountUseCaseRegistry');
const RequestDto = require('../dto/AccountRequestDto');
import type { NextFunction, Response } from 'express';
import type { AccountHandler, AccountHttpRequest } from '../dto/AccountContracts';
function handler(name: string): AccountHandler {
    return function accountRequestHandler(req: AccountHttpRequest, res: Response, next: NextFunction) {
        req.body = RequestDto.from(req.body);
        return useCases[name](req, res, next);
    };
}
module.exports = Object.fromEntries(['list', 'add', 'edit', 'remove'].map(name => [name, handler(name)]));
