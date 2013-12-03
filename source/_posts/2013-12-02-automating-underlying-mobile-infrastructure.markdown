---
layout: post
title: "Automating Underlying Mobile Infrastructure With Grunt"
date: 2013-12-02 19:15
comments: true
categories: 
---

I'm obsessed about automation lately, especially dealing with tasks that I repetitively doing. I don't know about you, but I hate doing the same repetive tasks. 

I posted a little while ago regarding automation of phonegap build and deployments, see that [here](/blog/2013/11/30/automating-phonegap-builds-with-grunt/).

Our mobile app is the core of what we do. As you may already well know, most mobile apps require an API server serving the application data. In this post, I'd like to address automating the underlying infrastructure that supports the mobile app.

## Why am I bothering with this?

The main reason is to help get the server stack up to take those tasks off the table. Getting the mobile infrastructure up can be a slight annoyance, especially when your task is to code. 

We have a designer that works on the mobile app styles, and he shouldn't need to know or care about the requirements of the app just to get to work.

The second reason that I'd want to automate the server stack is due to my frequently using [Weinre](http://people.apache.org/~pmuellr/weinre/docs/latest/). I use it a lot to debug either the iOS app or the Android app. Another nicety to have would be to get the weinre server up and have the script for it injected into my source references without having to manually do it.

### What I dream of doing..

One simple command... 'grunt emulate' - I'd like to do the following:

* Boot up Rails server at a specified IP
* Boot up the weinre server at a specified IP
* Preprocess the index.html file to have the weinre javascript source reference
* Adjust the app settings to be at the specified IP
* Fire off an xcode build command
* Fire off the iOS simulator

### How to get there 

To get some of the servers up and running, we needed those processes to continue running while the other tasks continue running. For this, we'll need another Grunt plugin.

[Grunt bgShell](https://npmjs.org/package/grunt-bg-shell)

We'll define them using the bg Shell so they can continue in the background as such:

``` javascript Grunt configuration for bgShell
bgShell: {
	weinre: {
		cmd: 'weinre --httpPort 8080 --boundHost=' + ipAddress,
		bg: true
	},
	rails: {
		cmd: 'cd ../raisemore_web && rails s -p 3000 -b ' + ipAddress
	}
}
```

That covers the servers. Now, for the xcode build and ios-simulator, we'll use the standard shell plugin to keep running in sync.

[Grunt Shell](https://github.com/sindresorhus/grunt-shell)

[ios-sim](https://github.com/phonegap/ios-sim)

``` sh Installing ios-sim
sudo npm install ios-sim -g
```

``` javascript Grunt configuration for xcode build and ios-sim
shell: {
	xcodebuild: {
		options: {
		  stdout: true
		},
		command: [ 
			'cd ./ios', 
			'xcodebuild -project RaiseMore.xcodeproj -sdk iphonesimulator7.0 -scheme RaiseMore -configuration Debug install DSTROOT=/tmp/RaiseMore' ].join("&&")
	},
	iphonesimulator: {
		options: {
			stdout: true
		},
		command: [ 
			'ios-sim launch /tmp/RaiseMore/Applications/RaiseMore.app --sdk 5.0'
		].join("&&")
	}
}
```

Boom, now we just need to have a grunt task that will set up all the preprocessing, start the servers, and then start the simulator.

The preprocessing steps were covered in my previous post [here](/blog/2013/11/30/automating-phonegap-builds-with-grunt/)

``` javascript Grunt task definition
grunt.registerTask('emulator', ['env:dev', 'preprocess:dev', 'bgShell:weinre', 'bgShell:rails', 'shell:xcodebuild', 'shell:iphonesimulator']);
grunt.registerTask('servers', ['bgShell:weinre', 'bgShell:rails'])
```

### Using the task

To just boot up the servers, do this:

``` sh Invoking the grunt server task
grunt servers
```

If you want the servers and the simulator, do this:

``` sh Invoking the grunt emulator task
grunt emulator
```

I know these methods aren't perfect, as there are a few areas I'd like to improve on. I'd like to have bgShell track the processes to kill them if the task is stopped, or instead to have them ignored if they are already running.

I guess that work will have to be addressed later. Cheers.