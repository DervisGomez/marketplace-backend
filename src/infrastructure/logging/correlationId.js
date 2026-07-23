const { randomUUID } = require('crypto');

const REQUEST_ID_HEADER = 'X-Request-ID';
const SAFE_REQUEST_ID = /^[A-Za-z0-9._:-]{1,128}$/;

function correlationId(req, res, next) {
    const incomingRequestId = req.get(REQUEST_ID_HEADER);
    const requestId = incomingRequestId && SAFE_REQUEST_ID.test(incomingRequestId) ? incomingRequestId : randomUUID();

    req.requestId = requestId;
    res.setHeader(REQUEST_ID_HEADER, requestId);
    next();
}

module.exports = correlationId;
