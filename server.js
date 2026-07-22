require('dotenv').config();

let { app } = require('./app');

let server = require('http').createServer(app);

server.listen(app.get('port'), () => {
	//console.log('port ' + app.get('port'));
});

let Connection=require('./socket/connection');
let io = require('socket.io')(server);

io.on('connection', socket => {

	Connection.socket(io,socket);
})
