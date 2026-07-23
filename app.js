var express = require('express');
var db = require('mongoose');
var cookieParser = require('cookie-parser');
var cors = require('cors');
var apiRouter = require('./src/router');
var logger = require('./src/infrastructure/logging/logger');
var correlationId = require('./src/infrastructure/logging/correlationId');
var requestLogger = require('./src/infrastructure/logging/requestLogger');
var errorLogger = require('./src/infrastructure/logging/errorLogger');
global.config = require('./config');
require('./middlewares/cloudinary');

db.set('strictQuery', false);
db.set('autoIndex', false);

db.connect(global.config.db.port)
    .then(() => logger.info({ database: global.config.db.port }, 'Database connected'))
    .catch(err => logger.error({ err }, 'Database connection failed'));

var app = express();

app.set('port', global.config.server.port);
app.set('query parser', 'extended');

app.use(correlationId);
app.use(requestLogger);
app.use(express.json({ limit: '50mb', extended: true, parameterLimit: 50000 }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/uploads', express.static(__dirname + '/uploads'));
app.use(cors());

app.use('/api', apiRouter);
app.use(errorLogger);

module.exports = { app, db };
