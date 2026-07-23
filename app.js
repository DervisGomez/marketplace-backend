var express = require('express');
var db = require('mongoose');
var cookieParser = require('cookie-parser');
var cors = require('cors');
var apiRouter = require('./src/router');
var logger = require('./src/infrastructure/logging/logger');
var correlationId = require('./src/infrastructure/logging/correlationId');
var requestLogger = require('./src/infrastructure/logging/requestLogger');
var errorLogger = require('./src/infrastructure/logging/errorLogger');
var upload = require('./middlewares/upload');
global.config = require('./config');
var validateConfig = require('./src/config/validateConfig');

try {
    validateConfig(global.config, process.env.NODE_ENV || 'development');
} catch (err) {
    logger.fatal({ err }, 'Invalid application configuration');
    throw err;
}

require('./middlewares/cloudinary');

db.set('strictQuery', false);
db.set('autoIndex', false);

var app = express();

app.set('port', global.config.server.port);
app.set('query parser', 'extended');

app.use(correlationId);
app.use(requestLogger);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/uploads', express.static(__dirname + '/uploads'));
app.use(cors());

app.use('/api', apiRouter);
app.use(upload.handleError);
app.use(errorLogger);

module.exports = { app, db };
