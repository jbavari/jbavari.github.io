---
layout: post
title: "Automating Local IP Lookup With Grunt and Node"
date: 2013-12-04 15:18
comments: true
categories: 
---

In the last few write-ups I've done lately (see [the servers post](/blog/2013/12/02/automating-underlying-mobile-infrastructure-with-grunt) and the [phonegap builds post](/blog/2013/11/30/automating-phonegap-builds-with-grunt)), I've been requiring the user to pass in the IP or the host in the command line. That works and all, but I usually have to go look up that ip using the good ol 'ifconfig' command. 

Since I'm obsesed with automation, I'd rather be lazy and just have the IP Address look up be automatic.

## You should be asking.. automate the IP?

About 9/10 times I really just want to boot the servers up to my current IP and have the mobile app point at that IP.

Have you guessed it yet? I want to automatically set that ip address / hostname to my local IP without having to go look it up every time.

I found this post on [stackoverflow](http://stackoverflow.com/questions/3653065/get-local-ip-address-in-node-js) that pointed me at this [Node.js documentation](http://nodejs.org/api/os.html#os_os_networkinterfaces). This really lets us dig deeper with Grunt to get the IP Address, especially since grunt sits on Node.js.

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
	var uploadMessage = grunt.option('uploadMessage') || 'Shenzhen Default Upload Message';

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

	//In this line - we're going to use the ip/host from command line over the ip addressed that was looked up
	//if it was passed
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

	require('load-grunt-tasks')(grunt);

	grunt.registerTask('servers', ['bgShell:weinre', 'bgShell:rails']);

}
```

Not much to it - call networkInterfaces(), go through JSON, get ipAddress - assign it to the option unless one was passed in. You're done.

Cheers.