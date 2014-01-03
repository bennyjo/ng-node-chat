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
.controller( 'ChatCtrl', function ChatController( $scope, Chat) { 
  var socket = io.connect();
  var chat = new Chat(socket);
  $scope.messages = [];
  $scope.userInput = '';
  $scope.channels = {
    all: [],
    current: 'Channel name'
  };

  socket.on('nameResult', function(result) {
    var message;

    if (result.success) {
      message = 'You are known as ' + result.name + '.';
    } else {
      message = result.message;
    }

    $scope.$apply(function() {
      $scope.messages.push({ text: message, type: 'systemMessage' });
    });
  });

  socket.on('joinResult', function(result) {
    $scope.$apply(function() {
      $scope.messages.push({ text: 'Channel changed.', type: 'systemMessage' });
      $scope.channels.current = result.room;
    });
  });

  socket.on('message', function(message) {
    $scope.$apply(function() {
      $scope.messages.push({ text: message.text, type: 'userMessage' });
    });
  });

  socket.on('channels', function(channels) {
    var channelNames = Object.keys(channels).map(function(channel) {
      return channel.substring(1, channel.length);
    }).filter(function(channel) {
      return channel.length;
    });

    $scope.$apply(function() {
      $scope.channels.all = channelNames;
    });
  });

  $scope.submit = function() {
    var message = $scope.userInput
      , messageSplitByColon = $scope.userInput.split(':')
      , isSpotifyTrack = messageSplitByColon[0] === 'spotify' &&  messageSplitByColon[1] === 'track'
      , systemMessage;

    if (message[0] === '/') {
      systemMessage = chat.processCommand(message);
      if (systemMessage) {
        $scope.messages.push({ text: systemMessage, type: 'systemMessage'});
      }
    }
    else if (isSpotifyTrack) {
      //chat.sendMessage($scope.channels.current, message);
      $scope.messages.push({ text: messageSplitByColon[2], type: 'spotifyTrack'});
    }
     else {
      chat.sendMessage($scope.channels.current, message);
      $scope.messages.push({ text: message, type: 'userMessage'});
      $('#messages').scrollTop($('#messages').prop('scrollHeight'));
    }

    console.log($scope.messages);

    $scope.userInput = '';
    return false;
  };
});