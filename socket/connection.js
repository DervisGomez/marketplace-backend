'use strict';
/*var redis = require('redis');
var client = redis.createClient(global.config.redis.port);
var client2 = redis.createClient(global.config.redis.port);

client.flushdb( function (err, succeeded) {
    console.log(succeeded); // will be true if successfull
});*/
exports.socket = (io,socket) => {
    
    console.log(socket.id)//comprobando que hay conexionio.to(value).emit('delete-nearby',{_id:socket.iduser});
    
    socket.emit('register', 'hola'); 
    
    socket.on('register', (data) => {
        console.log(data);
        socket.user = data;        
        socket.join(socket.user);
        //io.to(socket.user).emit('prueba', 'Agregado');
        //console.log(io.sockets.adapter.rooms[socket.user])
        /*client.rpush([data,socket.id], function(err, reply) {
            console.log(reply);
        });        
        client.lrange(data, 0, -1, function(err, reply) {
            console.log(reply);
            io.to(reply).emit('prueba','hola');
        });*/
    })

    socket.on('notification', (data)=>{
        io.to(data.user).emit('notification', data);
    })    

    socket.on('notification-view-all', (data)=>{
        console.log(data);
        io.to(data.user).emit('notification-view-all', data);
    })

    socket.on('isconection', (data)=>{
        console.log(data);
        var room = io.sockets.adapter.rooms[data.user];
        if(room){
            socket.emit('isconection', room.length);
        }else{
            socket.emit('isconection', 0);
        }        
    })

    socket.on('logout', () => {
        socket.leave(socket.user);
    })

    socket.on('disconnect', () => {
        socket.leave(socket.user);
        //socket.broadcast.to(socket.user).emit('prueba', 'Eliminado');
        //console.log(io.sockets.clients(socket.user))
        /*client.lrem([socket.user,-1,socket.id], function(err, reply) {
            console.log(reply);
        });
        client.lrange(socket.user, 0, -1, function(err, reply) {
            console.log(reply);
        });*/
    })
}