/**
* chatClient Module
*
* Description
*/

var Chat = function(socket) {
	this.socket = socket;
};

Chat.prototype.sendMessage = function(room, content, type) {
	var message = {
		room: room,
		content: content,
		type: type || 'userMessage'
	};

	this.socket.emit('message', message);
};

Chat.prototype.changeRoom = function(room) {
	this.socket.emit('join', {
		newRoom: room
	});
};

Chat.prototype.processCommand = function(command) {
	var words = command.split(' ')
		, message = false;

	// Remove fist /
	command = words[0].substring(1, words[0].length).toLowerCase();

	switch(command) {
		case 'join':
			words.shift();
			var room = words.join(' ');
			this.changeRoom(room);
			break;

		case 'nick':
			words.shift();
			var name = words.join(' ');
			this.socket.emit('nameAttempt', name);
			break;

		default:
			message = 'Urecognized command.';
			break;
	}

	return message;
};

angular.module('chatClient', [])
	.factory('Chat', function(){
		return Chat;
	});