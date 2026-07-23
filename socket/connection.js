const logger = require('../src/infrastructure/logging/logger');
('use strict');
/*var redis = require('redis');
var client = redis.createClient(global.config.redis.port);
var client2 = redis.createClient(global.config.redis.port);

client.flushdb( function (err, succeeded) {
    logger.debug(succeeded); // will be true if successfull
});*/
exports.socket = (io, socket) => {
    logger.debug(socket.id); //comprobando que hay conexionio.to(value).emit('delete-nearby',{_id:socket.iduser});

    socket.emit('register', 'hola');

    socket.on('register', data => {
        logger.debug(data);
        socket.user = data;
        socket.join(socket.user);
        //io.to(socket.user).emit('prueba', 'Agregado');
        //logger.debug(io.sockets.adapter.rooms[socket.user])
        /*client.rpush([data,socket.id], function(err, reply) {
            logger.debug(reply);
        });        
        client.lrange(data, 0, -1, function(err, reply) {
            logger.debug(reply);
            io.to(reply).emit('prueba','hola');
        });*/
    });

    socket.on('notification', data => {
        io.to(data.user).emit('notification', data);
    });

    socket.on('notification-view-all', data => {
        logger.debug(data);
        io.to(data.user).emit('notification-view-all', data);
    });

    socket.on('isconection', data => {
        logger.debug(data);
        var room = io.sockets.adapter.rooms[data.user];
        if (room) {
            socket.emit('isconection', room.length);
        } else {
            socket.emit('isconection', 0);
        }
    });

    socket.on('logout', () => {
        socket.leave(socket.user);
    });

    socket.on('disconnect', () => {
        socket.leave(socket.user);
        //socket.broadcast.to(socket.user).emit('prueba', 'Eliminado');
        //logger.debug(io.sockets.clients(socket.user))
        /*client.lrem([socket.user,-1,socket.id], function(err, reply) {
            logger.debug(reply);
        });
        client.lrange(socket.user, 0, -1, function(err, reply) {
            logger.debug(reply);
        });*/
    });
};
