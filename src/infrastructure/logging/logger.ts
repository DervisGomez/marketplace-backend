import pino = require('pino');
import type { LoggerOptions } from 'pino';

const environment = process.env.NODE_ENV || 'development';
const defaultLevel = environment === 'test' ? 'silent' : environment === 'development' ? 'debug' : 'info';

const options: LoggerOptions = {
    level: process.env.LOG_LEVEL || defaultLevel,
    timestamp: pino.stdTimeFunctions.isoTime,
    base: {
        service: 'marketplace-backend',
        environment
    },
    serializers: {
        err: pino.stdSerializers.err,
        error: pino.stdSerializers.err,
        req: pino.stdSerializers.req,
        res: pino.stdSerializers.res
    },
    redact: {
        paths: [
            'authorization',
            'Authorization',
            'cookie',
            'Cookie',
            'password',
            'Password',
            'token',
            'Token',
            'code',
            'codeSend',
            'codeRegister',
            '*.authorization',
            '*.Authorization',
            '*.cookie',
            '*.Cookie',
            '*.password',
            '*.Password',
            '*.token',
            '*.Token',
            '*.code',
            '*.codeSend',
            '*.codeRegister',
            'req.headers.authorization',
            'req.headers.cookie',
            'request.headers.authorization',
            'request.headers.cookie',
            'headers.authorization',
            'headers.cookie',
            'body.password',
            'body.passwordNew',
            'body.token',
            'body.code',
            'body.codeRegister'
        ],
        censor: '[REDACTED]'
    }
};

if (environment === 'development') {
    options.transport = {
        target: 'pino-pretty',
        options: {
            colorize: true,
            singleLine: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname'
        }
    };
}

export = pino(options);
