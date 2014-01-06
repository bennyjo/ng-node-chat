var socketio = require('socket.io')
	, guestNumber = 1
	, nickNames = {}
	, namesUsed = []
	, currentRoom = {};

function assignGuestName (socket, guestNumber, nickNames, namesUsed) {
	var name = 'Guest' + guestNumber;
	nickNames[socket.id] = name;
	socket.emit('nameResult', {
		success: true,
		name: name
	});
	namesUsed.push(name);
	return guestNumber + 1;
}

function handleNameChangeAttempts (socket, nickNames, namesUsed) {
	socket.on('nameAttempt', function(name) {
		if (name.indexOf('Guest') === 0) {
			socket.emit('nameResult', {
				success: false,
				content: 'Names cannot start with "Guest".'
			});
		} else {
			if (namesUsed.indexOf(name) === -1) {
				var previousName = nickNames[socket.id];
				namesUsed.push(name);
				nickNames[socket.id] = name;
				socket.emit('nameResult', {
					success: true,
					name: name
				});
				socket.broadcast.to(currentRoom[socket.id]).emit('message', {
					content: previousName + ' is now known as ' + name + '.',
					type: 'systemMessage'
				});
			} else {
				socket.emit('nameResult', {
					success: false,
					message: 'That name is already in use'
				});
			}
		}
	});
}

function handleMessageBroadcasting(socket, nickNames) {
	socket.on('message', function(message) {
		socket.broadcast.to(message.room).emit('message', {
			type: message.type,
			content: message.content,
			sender: nickNames[socket.id]
		});
	});
}

function handleRoomJoining(socket, sockets) {
	var channels = sockets.manager.rooms;
	socket.on('join', function(room) {
		socket.leave(currentRoom[socket.id]);
		socket.join(room.newRoom);
		currentRoom[socket.id] = room.newRoom;
		socket.emit('joinResult', { room: room.newRoom });
		sockets.emit('channels', channels);
	});
}

function handleClientDisconnection(socket, nickNames, namesUsed) {
	socket.on('disconnect', function() {
		var nameIndex = namesUsed.indexOf(nickNames[socket.id]);
		delete namesUsed[nameIndex];
		delete nickNames[socket.id];
	});
}

exports.listen = function(server) {
	var io = socketio.listen(server);
	var sockets = io.sockets;
	var channels = sockets.manager.rooms;
	io.set('log level', 1);

	sockets.on('connection', function(socket) {
		guestNumber = assignGuestName(
			socket,
			guestNumber,
			nickNames,
			namesUsed
		);

		socket.join('Lobby');
		currentRoom[socket.id] = 'Lobby';
		socket.emit('joinResult', {room: 'Lobby'});
		sockets.emit('channels', channels);

		handleMessageBroadcasting(socket, nickNames);
		handleNameChangeAttempts(socket, nickNames, namesUsed);
		handleRoomJoining(socket, sockets);

		handleClientDisconnection(socket, nickNames, namesUsed);
	});
};