const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { installExternalServiceFakes } = require('./externalServices');

let app;

function createTestApp() {
    if (app) return app;

    installExternalServiceFakes();
    const apiRouter = require('../../src/router');
    app = express();
    app.set('query parser', 'extended');
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: false }));
    app.use(cookieParser());
    app.use(cors());
    app.use('/api', apiRouter);
    return app;
}

module.exports = { createTestApp };
