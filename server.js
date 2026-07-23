require('dotenv').config();
const logger = require('./src/infrastructure/logging/logger');

let { app } = require('./app');

let server = require('http').createServer(app);

server.listen(app.get('port'), () => {
    logger.info({ port: app.get('port') }, 'HTTP server listening');
});

let Connection = require('./socket/connection');
let io = require('socket.io')(server);

io.on('connection', socket => {
    Connection.socket(io, socket);
});
