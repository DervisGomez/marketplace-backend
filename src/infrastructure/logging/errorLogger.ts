import type { NextFunction, Request, Response } from 'express';
import logger = require('./logger');

function errorLogger(error: unknown, req: Request, _res: Response, next: NextFunction): void {
    const requestLogger = req.log || logger;

    requestLogger.error(
        {
            err: error,
            requestId: req.requestId,
            method: req.method,
            route: req.originalUrl || req.url
        },
        'Unhandled request error'
    );

    next(error);
}

export = errorLogger;
