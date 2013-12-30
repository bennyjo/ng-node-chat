/*global io, Chat */

/**
 * Each section of the site has its own module. It probably also has
 * submodules, though this boilerplate is too simple to demonstrate it. Within
 * `src/app/home`, however, could exist several additional folders representing
 * additional modules that would then be listed as dependencies of this one.
 * For example, a `note` section could have the submodules `note.create`,
 * `note.delete`, `note.edit`, etc.
 *
 * Regardless, so long as dependencies are managed correctly, the build process
 * will automatically take take of the rest.
 *
 * The dependencies block here is also where component dependencies should be
 * specified, as shown below.
 */
angular.module( 'ngBoilerplate.home', [
  'ui.state',
  'chatClient'
])

.value('socket', io.connect())

/**
 * Each section or module of the site can also have its own routes. AngularJS
 * will handle ensuring they are all available at run-time, but splitting it
 * this way makes each module more "self-contained".
 */
.config(function config( $stateProvider ) {
  $stateProvider.state( 'chat', {
    url: '/chat',
    views: {
      "main": {
        controller: 'ChatCtrl',
        templateUrl: 'chat/chat.tpl.html'
      }
    },
    data:{ pageTitle: 'Chat' }
  });
})

/**
 * And of course we define a controller for our route.
 */
.controller( 'ChatCtrl', function ChatController( $scope, chat, socket ) { 
  function divEscapedContentElement(message) {
    return $('<div></div>').text(message);
  }

  function divSystemContentElement(message) {
    return $('<div></div>').html('<i>' + message + '</i>');
  }
  
  function processUserInput(chatApp, socket) {
    var message = $('#send-message').val()
    , systemMessage;

    if (message[0] === '/') {
      systemMessage = chatApp.processCommand(message);
      if (systemMessage) {
        $('#messages').append(divSystemContentElement(systemMessage));
      }
    } else {
      chatApp.sendMessage($('#room').text(), message);
      $('#messages').append(divEscapedContentElement(message));
      $('#messages').scrollTop($('#messages').prop('scrollHeight'));
    }

    $('#send-message').val('');
  }

  $scope.messages = [];

  socket.on('nameResult', function(result) {
    var message;

    if (result.success) {
      message = 'You are known as ' + result.name + '.';
    } else {
      message = result.message;
    }

    $scope.apply(function() {
      $scope.messages.push({ text: 'message', isSystemMessage: true });
    });
  });

  socket.on('joinResult', function(result) {
    $('#room').text(result.room);
    $('#messages').append(divSystemContentElement('Room changed.'));
  });

  socket.on('message', function(message) {
    var newElement = $('<div></div>').text(message.text);
    $('#messages').append(newElement);
  });

  socket.on('rooms', function(rooms) {
    $('#room-list').empty();

    for (var room in rooms) {
      room = room.substring(1, room.length);
      if (room !== '') {
        $('#room-list').append(divSystemContentElement(room));
      }
    }
  });

  $('#room-list').on('click', 'div', function() {
    chat.processCommand('/join ' + $(this).text());
    $('#send-message').focus();
  });

  setInterval(function() {
    socket.emit('rooms');
  }, 1000);

  $('#send-message').focus();

  $scope.submit = function() {
    processUserInput(chat, socket);
    return false;
  };
});