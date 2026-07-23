import pino = require('pino');
import type { Request, Response } from 'express';
import pinoHttp, { type Options } from 'pino-http';
import logger = require('./logger');

const options: Options<Request, Response> = {
    logger,
    genReqId: req => req.requestId!,
    customAttributeKeys: {
        responseTime: 'durationMs'
    },
    customProps(req) {
        return {
            requestId: req.requestId,
            method: req.method,
            route: req.route ? req.route.path : req.originalUrl || req.url,
            ip: req.ip || (req.socket && req.socket.remoteAddress),
            userAgent: req.get && req.get('user-agent')
        };
    },
    serializers: {
        req(req) {
            return {
                requestId: req.id,
                method: req.method,
                route: req.raw && (req.raw.originalUrl || req.raw.url),
                ip: req.raw && (req.raw.ip || (req.raw.socket && req.raw.socket.remoteAddress)),
                userAgent: req.headers && req.headers['user-agent']
            };
        },
        res(res) {
            return {
                status: res.statusCode
            };
        },
        err: pino.stdSerializers.err
    },
    customLogLevel(_req, res, error) {
        if (error || res.statusCode >= 500) return 'error';
        if (res.statusCode >= 400) return 'warn';
        return 'info';
    }
};

const requestLogger = pinoHttp(options);

export = requestLogger;
