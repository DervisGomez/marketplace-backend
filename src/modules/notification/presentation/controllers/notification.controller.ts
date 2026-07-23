const useCases = require('../../application/services/NotificationUseCaseRegistry');
const NotificationRequestDto = require('../dto/NotificationRequestDto');
import type { NextFunction, Response } from 'express';
import type { NotificationHandler, NotificationHttpRequest } from '../dto/NotificationContracts';

function handler(name: string): NotificationHandler {
    return function notificationRequestHandler(req: NotificationHttpRequest, res: Response, next: NextFunction) {
        req.body = NotificationRequestDto.from(req.body);
        return useCases[name](req, res, next);
    };
}

module.exports = {
    list: handler('list'),
    view: handler('view'),
    find: handler('find')
};
