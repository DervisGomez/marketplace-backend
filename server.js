require('dotenv').config();
const logger = require('./src/infrastructure/logging/logger');

let { app } = require('./app');
let db = require('mongoose');
let createServer = require('http').createServer;
const { Server } = require('socket.io');
let Connection = require('./socket/connection');
let startServer = require('./src/infrastructure/http/startServer');

startServer({
    app,
    db,
    logger,
    mongoUri: global.config.db.port,
    createServer,
    SocketServer: Server,
    connection: Connection
}).catch(() => {
    process.exitCode = 1;
});
