---
layout: post
title: "Building a chat client with Ionic / Socket.io / Redis / Node.js"
date: 2014-06-17 00:09
comments: true
categories: ionic socket.io redis nodejs javascript cordova phonegap angularjs
---

I wanted a fun challenge to push myself and cross a few things off my ever so growing `I want to play with this` type of lists. I love learning, and there are so many awesome tools / utilities / libraries out there to evaluate its hard to justify incorporating them into every project at work without having some knowledge of the tools.

DISCLAIMER: I may use some tools incorrectly, but the main purpose of this fun little project was to learn and have fun.

The list was this:

* [Ionic Framework](http://ionicframework.com)
* [Socket.io](http://socket.io)
* [Redis](http://redis.io)
* [Node.js Redis client](https://github.com/mranney/node_redis)

## The Idea

I wanted to build a chat client that would have messages that disappear after a certain time, much like SnapChat. The idea also included the ability to create channels that also disappear after a certain time like messages.

In future versions, I'd love to include location to join channels that are near you.

Users can join existing channels, or create their own. All users can see channels, and join any.

## Tech details - using Redis / Node.js

At first, I wanted to create messages some how and have them each have `expire` times. After failing miserably, I got the amazing chance to pair up with [Michael Gorsuch](https://twitter.com/michaelgorsuch) to give me some alternative ideas. (Shameless plug - if you need to do some server monitoring, check out his project [Canary.io](http://canary.io/), it's AWESOME).

The concept is - instead of using separate keys with ezxpire times - use Redis' sorted sets with scores of the times in UNIX format and the member being a JSON encoded string. I had my channels keys in the format of `messages:ChannelName`.

Something like:

```
//ZADD key score member [score member ...]
zadd messages:RedisChat 10581098019 '{"name": "Josh", "id": "5"}'
```

Now, when we want to get all messages for a channel, its simply:

```
//ZRANGEBYSCORE key min max [WITHSCORES] [LIMIT offset count]
zrangebyscore messages:RedisChat 0 10924019840
```

Since I was using Node.js - I simply used `setInterval` to have a function be run that removes all old posts named `removeKeys`, and looked as such:

``` js
//NOTE: Using Moment.js, as well as having channelWatchList being populated
var channelWatchList = ['Lobby', 'RedisChat'];

function removeKeys() {
  console.log('We are removing old messages');

  for(var channelIndex in channelWatchList) {
    var channel = channelWatchList[channelIndex];
    var messageChannel = 'messages:' + channel;
    console.log('message channel', messageChannel)
    var timeToRemove = moment().subtract('m', 1).unix(); //Remove messages before min ago

    redisClient.zrangebyscore(messageChannel, 0, timeToRemove, function(err, result) {
      if(result && result.length > 0) {
        for (var resultIndex in result) {
          var message = JSON.parse(result[resultIndex]);
          //NOTE: Using socket.io
          io.emit('message:remove:channel:' + channel, { message: message, channel: channel });
        }
      }
    });

    redisClient.zremrangebyscore(messageChannel, 0, timeToRemove, function(err, result) {
      console.log('Removed ', result, ' messages');
    });
  }
}
```

## The client - Ionic

This was by far the easy part. First I just used the Ionic CLI to create a basic app.

I started by modifying the index.html file to include Socket.io. Nothing too fancy: `<script src="js/socket.io.js"></script>`.

Next, I used some AngularJS [services](https://github.com/jbavari/ionic-socket.io-redis-chat/blob/master/client/RedisChat/www/js/services.js) for socket.io:

```
angular.module('services', [])

.factory('socket', function socket($rootScope) {
  var socket = io.connect(baseUrl);
  return {
    on: function (eventName, callback) {
      socket.on(eventName, function () {  
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });
    },
    emit: function (eventName, data, callback) {
      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      })
    }
  };
})
```

Then, I constructed my `AppCtrl` to handle my [controllers](https://github.com/jbavari/ionic-socket.io-redis-chat/blob/master/client/RedisChat/www/js/controllers.js) interaction with Socket.io:

``` js
angular.module('starter.controllers', ['services'])

.controller('AppCtrl', function($scope, $state, $filter, socket, Auth) {
	//Ensure they are authed first.
	if(Auth.currentUser() == null) {
		$state.go('login');
		return;
	}

	//input models
	$scope.draft = { message: '' };
	$scope.channel = { name: '' };

	//App info
	$scope.channels = [];
	$scope.listeningChannels = [];
	$scope.activeChannel = null;
	$scope.userName = Auth.currentUser().name;
	$scope.messages = [];

///////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////
//Socket.io listeners
///////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////

	socket.on('channels', function channels(channels){
		console.log('channels', channels);

		console.log(channels);
		$scope.channels = channels;
	});

	socket.on('message:received', function messageReceived(message) {
		$scope.messages.push(message);
	});

	socket.emit('user:joined', {name: Auth.currentUser().name});

	socket.on('user:joined', function(user) {
		console.log('user:joined');
		$scope.messages.push(user);
	});

	$scope.listenChannel = function listenChannel (channel) {
		socket.on('messages:channel:' + channel, function messages(messages) {
			console.log('got messages: ', messages);
			console.log(messages.length);
			for(var i = 0, j = messages.length; i < j; i++) {
				var message = messages[i];
				console.log('message');
				console.log(message);
					console.log('apply with function');
				$scope.messages.push(message);
			}
		});

		socket.on('message:channel:' + channel, function message(message) {
			console.log('got message: ' + message);
			if(channel != $scope.activeChannel) {
				return;
			}
			$scope.messages.push(message);
		});

		socket.on('message:remove:channel:' + channel, function(removalInfo) {
			console.log('removalInfo to remove: ', removalInfo);
			var expires = removalInfo.message.expires;
			var expireMessageIndex = $filter('messageByExpires')($scope.messages, expires);
			if(expireMessageIndex) {
				$scope.messages.splice(expireMessageIndex, 1);
			}

		});

		$scope.listeningChannels.push(channel);

	}

///////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////
// Controller methods
///////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////

	$scope.joinChannel = function joinChannel(channel) {
		$scope.activeChannel = channel;
		$scope.messages = [];

		$scope.channel.name = '';

		//Listen to channel if we dont have it already.
		if($scope.listeningChannels.indexOf(channel) == -1) {
			$scope.listenChannel(channel);		
		}

		socket.emit('channel:join', { channel: channel, name: Auth.currentUser().name });
	}

	$scope.sendMessage = function sendMessage(draft) {
		if(!draft.message || draft.message == null || typeof draft == 'undefined' || draft.length == 0) {
			return;
		}
		socket.emit('message:send', { message: draft.message, name: Auth.currentUser().name, channel: $scope.activeChannel });
		$scope.draft.message = '';
	};

	$scope.logout = function logout() {
		Auth.logout();
		$state.go('login');
	}

	//Auto join the lobby
	$scope.joinChannel('Lobby');
})
```

All of the code can be found on [github here](https://github.com/jbavari/ionic-socket.io-redis-chat).

### Things to improve

* Testing - for sure. I definitely failed in getting tests first
* Removing the inline functions from Socket.io callbacks - not sure I like how I handled that to be honest
* Improve the UI
* Actually make the channels expire over time - and alert the user
* Have some kind of location tracking to pull local channels near you

Enjoy! Hope this helps any others learn some tips for developing in any of these technologies used!