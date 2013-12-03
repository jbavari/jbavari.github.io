---
layout: post
title: "Automating Underlying Mobile Infrastructure With Grunt"
date: 2013-12-02 19:15
comments: true
categories: 
---

I'm obsessed with automating some of the tasks that I find myself repetitively doing. I don't know about you, but I hate doing the same thing over and over - it's boring and pointless

I posted a little while ago regarding automation of phonegap build and deployments, see that [here](/blog/2013/11/30/automating-phonegap-builds-with-grunt/).

## Why am I bothering with this?

Our mobile app is the core of what we do. As you may already well know, most mobile apps require an API server serving the application data. In this post, I'd like to address automating the underlying infrastructure that supports the mobile app.

### It's a two-fold win

The main reason is to help get the server stack up without doing all of the repetitive tasks. Getting the mobile infrastructure up can be a slight annoyance, especially when your task is to code. 

We have a designer that works on the mobile app styles, and he shouldn't need to know or care about the requirements of the app just to get to work.

The second reason that I'd want to automate the server stack is due to my frequently using [Weinre](http://people.apache.org/~pmuellr/weinre/docs/latest/). I use it a lot to debug either the iOS app or the Android app. Another thing to automate would be to get the weinre server up and have the script for it injected into my source references without having to manually do it.

### What I'd prefer we do..

I'd like to just type simple commands... Something I can type to get my local dev servers up, or our designer can type that will get the whole stack and emulator running.

For our designer, I'd want 'grunt emulate'. For myself, I'd want 'grunt emulate --weinre=true --host=192.168.1.100' - either of those commands would do the following:

* Boot up Rails server at a specified IP
* Boot up the weinre server at a specified IP (optionally)
* Preprocess the index.html file to have the weinre javascript source reference
* Adjust the app settings to be at the specified IP
* Execute the xcode build command for the iOS project
* Open the built app on the iOS Simulator

### How to get there 

To get some of the servers up and running, we need a grunt task that would invoke those processes and would continue running in the background while the other tasks continue running. For this, we'll need another Grunt plugin, called [Grunt bgShell](https://npmjs.org/package/grunt-bg-shell)

First we'll define the background shell tasks in our grunt config file:

``` javascript Grunt background shell configuration
bgShell: {
	weinre: {
		cmd: 'weinre --httpPort 8080 --boundHost=' + ipAddress,
		bg: true
	},
	rails: {
		cmd: 'cd ../raisemore_web && bundle install && rails s -p 3000 -b ' + ipAddress
	}
}
```

That covers the servers. Now, for the xcode build and ios-simulator, we'll use the standard [grunt shell](https://github.com/sindresorhus/grunt-shell) plugin to keep running in sync. To invoke the iOS simulator, we'll use the Node.js package from Phonegap called [ios-sim](https://github.com/phonegap/ios-sim)

Before we can use ios-sim, we must invoke the npm installer for it, passing the -g flag for it to be globally installed.

``` sh Installing ios-sim
sudo npm install ios-sim -g
```

Now let's configure the grunt shell tasks for xcode build and iphone simulation:

``` javascript Grunt shell configuration for xcode build and ios-sim
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

That covers the configuration. Now we just need to have a grunt task that will handle all the preprocessing, start the servers, and then start the build process, and finally run the simulator with the newly built app.

The preprocessing steps were covered in my previous post [here](/blog/2013/11/30/automating-phonegap-builds-with-grunt/) and I'll leave the preprocessing configuration in that post. 

All that is left now is to define the grunt tasks, as such:

``` javascript Grunt task definition
//Main task for our designer
grunt.registerTask('emulator', ['env:dev', 'preprocess:dev', 'bgShell:weinre', 'bgShell:rails', 'shell:xcodebuild', 'shell:iphonesimulator']);

//Main task I'll probably use, via 'grunt servers --weinre=true --host=192.168.1.100'
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