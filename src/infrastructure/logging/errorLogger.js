const logger = require('./logger');

function errorLogger(err, req, res, next) {
    const requestLogger = req.log || logger;

    requestLogger.error(
        {
            err,
            requestId: req.requestId,
            method: req.method,
            route: req.originalUrl || req.url
        },
        'Unhandled request error'
    );

    next(err);
}

module.exports = errorLogger;
