const useCases = require('../../application/services/ChatUseCaseRegistry');
const RequestDto = require('../dto/ChatRequestDto');
import type { NextFunction, Response } from 'express';
import type { ChatHandler, ChatHttpRequest } from '../dto/ChatContracts';
function handler(name: string): ChatHandler {
    return function chatRequestHandler(req: ChatHttpRequest, res: Response, next: NextFunction) {
        req.body = RequestDto.from(req.body);
        return useCases[name](req, res, next);
    };
}
module.exports = Object.fromEntries(
    ['newMessage', 'meChat', 'list', 'find', 'take', 'end'].map(name => [name, handler(name)])
);
