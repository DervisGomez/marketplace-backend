const pinoHttp = require('pino-http');
const pino = require('pino');
const logger = require('./logger');

module.exports = pinoHttp({
    logger,
    genReqId: req => req.requestId,
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
    customLogLevel(req, res, err) {
        if (err || res.statusCode >= 500) return 'error';
        if (res.statusCode >= 400) return 'warn';
        return 'info';
    }
});
