require('dotenv').config();
const logger = require('./src/infrastructure/logging/logger');

let { app } = require('./app');

let server = require('http').createServer(app);
const { Server } = require('socket.io');

server.listen(app.get('port'), () => {
    logger.info({ port: app.get('port') }, 'HTTP server listening');
});

let Connection = require('./socket/connection');
let io = new Server(server, { allowEIO3: true });

io.on('connection', socket => {
    Connection.socket(io, socket);
});
