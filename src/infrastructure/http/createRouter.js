const express = require('express');
const asyncHandler = require('./asyncHandler');

const routeMethods = ['all', 'delete', 'get', 'head', 'options', 'patch', 'post', 'put'];

function createRouter() {
    const router = express.Router();

    for (const method of routeMethods) {
        const register = router[method].bind(router);
        router[method] = (path, ...handlers) => register(path, ...handlers.map(handler => asyncHandler(handler)));
    }

    return router;
}

module.exports = createRouter;
