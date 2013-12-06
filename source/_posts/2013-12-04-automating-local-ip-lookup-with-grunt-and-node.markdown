---
layout: post
title: "Automating Local IP Lookup With Grunt and Node"
date: 2013-12-04 15:18
comments: true
categories: 
---

In the last few write-ups I've done lately (see [the servers post](/blog/2013/12/02/automating-underlying-mobile-infrastructure-with-grunt) and the [phonegap builds post](/blog/2013/11/30/automating-phonegap-builds-with-grunt)), I've been requiring the user to pass in the IP or the host in the command line. That works and all, but I usually have to go look up that ip using the good ol 'ifconfig' command. 

Since I'm obsesed with automation, I'd rather be lazy and just have the IP Address look up be automatic.

## Why am I writing this?

I work in a dozen of different places. At any given time I may be at home, work, a coffee shop, etc. Most times my ip address will be different. I really just want to boot the servers up to my current IP and have the mobile app point at that IP. (The actual device can't understand localhost or a local 0.0.0.0 IP address over wifi)

Have you guessed it yet? I want to automatically set that ip address / hostname to my local IP without having to go look it up every time.

I found this post on [stackoverflow](http://stackoverflow.com/questions/3653065/get-local-ip-address-in-node-js) that pointed me at this [Node.js documentation](http://nodejs.org/api/os.html#os_os_networkinterfaces) to look up the network interfaces. This lets us dig deeper with Grunt to get the IP Address, especially since grunt sits on Node.js.

### Simple and (too) easy

There's a Node.js call that puts all of the config settings into nice JSON for you to work with.

``` javascript Node.js command for getting network interfaces
	//Gets a JSON much like running 'ifconfig'
	var ifaces = os.networkInterfaces();
```

The next key is to go through all the interfaces, and get the current local IP from the device from ethernet or wifi.

My grunt config looks something like this:


``` javascript 
module.exports = function(grunt) {

	var os=require('os');
	var ifaces=os.networkInterfaces();
	var lookupIpAddress = null;
	for (var dev in ifaces) {
		if(dev != "en1" && dev != "en0") {
			continue;
		}
		ifaces[dev].forEach(function(details){
		  if (details.family=='IPv4') {
		    lookupIpAddress = details.address;
		    break;
		  }
		});
	}

	//If an IP Address is passed
	//we're going to use the ip/host from the param
	//passed over the command line 
	//over the ip addressed that was looked up
	var ipAddress = grunt.option('host') || lookupIpAddress;

	grunt.initConfig({
		bgShell: {
			weinre: {
				cmd: 'weinre --httpPort 8080 --boundHost=' + ipAddress,
				bg: false
			},
			rails: {
				cmd: 'cd ../raisemore_web && rails s -p 3000 -b ' + ipAddress
			}
		}
	});

	//Load in the preprocess tasks
	grunt.loadTasks('preprocess');
	require('load-grunt-tasks')(grunt);

	//Tasks to have both servers at local ip and app at local ip
	grunt.registerTask('servers', ['env:dev', 'preprocess:dev', 'bgShell:weinre', 'bgShell:rails']);

	//Task to set up app files pointing at stage ip
	//and setting up weinre at current local ip
	grunt.registerTask('debug', [ 'env:stage', 'preprocess:stage', 'bgShell:weinre']);

}
```

Now we can just do 'grunt servers' to have both servers up at my current local ip or 'grunt debug' to get app accessing the stage server and having weinre run locally to debug the app.

Not much to it - call networkInterfaces(), go through JSON, get ipAddress - assign it to the option unless one was passed in. You're done.

Cheers.