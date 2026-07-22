var express = require('express');
var path = require('path');
var db = require('mongoose');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var multer = require('multer');
var cors =  require('cors');
var bodyParser = require('body-parser');
var apiRouter = require('./src/router');
global.config = require('./config');
var cloudinary = require('./middlewares/cloudinary');

db.Promise = global.Promise;

db.connect(global.config.db.port,{useCreateIndex: true, useNewUrlParser: true})
.then(db => console.log('db is conected '+ global.config.db.port))
.catch(err => console.log(err));

var cloudinary = require('cloudinary');

cloudinary.config({
    cloud_name : global.config.cloudinary.name,
    api_key : global.config.cloudinary.key,
    api_secret : global.config.cloudinary.secret
})

var app = express();

app.set('port',global.config.server.port);

app.use(logger('dev'));
app.use(express.json({limit: "50mb", extended: true, parameterLimit:50000}));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/uploads', express.static(__dirname +'/uploads'));
app.use(bodyParser.json({limit: "50mb"}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors())

app.use('/api', apiRouter);

module.exports = { app, db };
