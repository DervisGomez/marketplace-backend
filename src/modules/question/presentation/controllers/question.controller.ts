const useCases = require('../../application/services/QuestionUseCaseRegistry');
const QuestionRequestDto = require('../dto/QuestionRequestDto');
import type { NextFunction, Response } from 'express';
import type { QuestionHandler, QuestionHttpRequest } from '../dto/QuestionContracts';

function handler(name: string): QuestionHandler {
    return function questionRequestHandler(req: QuestionHttpRequest, res: Response, next: NextFunction) {
        req.body = QuestionRequestDto.from(req.body);
        return useCases[name](req, res, next);
    };
}

module.exports = {
    new: handler('new'),
    answer: handler('answer'),
    product: handler('product'),
    user: handler('user'),
    client: handler('client'),
    productClient: handler('productClient'),
    lock: handler('lock'),
    delete: handler('delete')
};
