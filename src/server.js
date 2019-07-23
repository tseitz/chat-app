import sirv from 'sirv';
import polka from 'polka';
import compression from 'compression';
import * as sapper from '@sapper/server';
import http from 'http';
import io from 'socket.io';

const { PORT, NODE_ENV } = process.env;
const dev = NODE_ENV === 'development';

const server = http.createServer();

polka({ server }) // You can also use Express
	.use(
		compression({ threshold: 0 }),
		sirv('static', { dev }),
		sapper.middleware()
	)
	.listen(PORT, err => {
		if (err) console.log('error', err);
	});

let numUsers = 0;

io(server).on('connection', function(socket) {
	console.log('a user connected');
	++numUsers;
	let message = 'Server: A new user has joined the chat';
	socket.emit('user joined', { message, numUsers });
	socket.broadcast.emit('user joined', { message, numUsers });

	socket.on('message', function(msg) {
		socket.broadcast.emit('message', msg);
	})


	socket.on('disconnect', function() {
		--numUsers;
		let message = `Server: A user has left the chat.`;
		socket.broadcast.emit('user left', { message, numUsers });
	})
});


