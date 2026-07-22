const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { installExternalServiceFakes } = require('./externalServices');

let app;

function createTestApp() {
    if (app) return app;

    installExternalServiceFakes();
    const apiRouter = require('../../src/router');
    app = express();
    app.use(express.json({ limit: '50mb', extended: true, parameterLimit: 50000 }));
    app.use(express.urlencoded({ extended: false }));
    app.use(cookieParser());
    app.use(bodyParser.json({ limit: '50mb' }));
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(cors());
    app.use('/api', apiRouter);
    return app;
}

module.exports = { createTestApp };
