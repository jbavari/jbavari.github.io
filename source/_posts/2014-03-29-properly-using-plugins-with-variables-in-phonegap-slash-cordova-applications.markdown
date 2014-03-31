---
layout: post
title: "Properly using Plugins with variables in Phonegap / Cordova applications"
date: 2014-03-29 02:14
comments: true
categories: 
---

In the past week I've been working on upgrading our mobile application from PhoneGap 2.9 to Cordova 3.4. (There is no real reason for going from PhoneGap to Cordova, just that I've been actively committing to the Cordova project).

I've come in contact with a weird bug with the Cordova CLI when using plugins that require variables to install them.

Currently [Holly Schinsky and Dan Moore](http://devgirl.org/2013/11/12/three-hooks-your-cordovaphonegap-project-needs/) recommend using the [Cordova Hook](https://github.com/apache/cordova-cli/blob/master/templates/hooks-README.md) `after_platform_add` to add in the plugins via a plugin list. While I too think this is a great idea, there is a small problem with it as of Phonegap/Cordova 3.4 when you use plugins with variables.

Before we go further, lets just get a quick intro to the platform hook calls that the [Cordova CLI](https://github.com/apache/cordova-cli/blob/master/src/platform.js#l56) gives us. First it will fire off the scripts in the `/app/hooks/before_platform_add` (or `/app/.cordova/hooks/before_platform_add` if you're on PhoneGap/Cordova <= 3.3) folder. 

Next, Cordova CLI will go through some configs and eventually use a function named `call_into_create` that will do some housecleaning, but most importantly will [re-install currently installed plugins](https://github.com/apache/cordova-cli/blob/master/src/platform.js#l378).

Certain plugins will require variables for them to be installed. Take a look at the Phonegap Facebook Connect plugin, for example: `cordova plugin add https://github.com/phonegap/phonegap-facebook-plugin.git --variable APP_ID='appId' --variable APP_NAME='appName'`. Using Holly and Dan's solution, you an add that inline as well, like so:

```
var pluginlist = [
    "https://github.com/phonegap/phonegap-facebook-plugin.git --variable APP_ID='" + appId + "' --variable APP_NAME='" + appName + "'",
    "org.apache.cordova.camera",
    "org.apache.cordova.console",
    "org.apache.cordova.contacts"];

var fs = require('fs');
var path = require('path');
var sys = require('sys')
var exec = require('child_process').exec;
 
function puts(error, stdout, stderr) {
    sys.puts(stdout)
}
 
pluginlist.forEach(function(plug) {
    exec("cordova plugin add " + plug, puts);
});

```

The problem is, when Cordova CLI goes through to reinstall the plugins, it isn't passing in the variables and will fail to install them, but it will still add the folder to the plugins directory and json file. In fact, after adding the plugins, it will then call the hook (as seen above) and try to install plug-ins yet a second time. And by fail, I mean it will still fail with the facebook plugin - cordova CLI failed therefore it's half installed, so the hook will fail. (I hope this is clear)

To recap, here's the flow of how to reproduce the problem:

* Create new project with `cordova create`
* Add platform for ios
* Add plugin with variables - `cordova plugin add https://github.com/phonegap/phonegap-facebook-plugin.git --variable APP_ID='appId' --variable APP_NAME='appName'`
* Add platform for android

That's when you'll see: 

```
Installing com.phonegap.plugins.facebookconnect (android)
Error: Variable(s) missing: APP_ID, APP_NAME
    at /usr/local/lib/node_modules/cordova/node_modules/plugman/src/install.js:252:29
    at _fulfilled (/usr/local/lib/node_modules/cordova/node_modules/q/q.js:798:54)
    at self.promiseDispatch.done (/usr/local/lib/node_modules/cordova/node_modules/q/q.js:827:30)
    at Promise.promise.promiseDispatch (/usr/local/lib/node_modules/cordova/node_modules/q/q.js:760:13)
    at /usr/local/lib/node_modules/cordova/node_modules/q/q.js:574:44
    at flush (/usr/local/lib/node_modules/cordova/node_modules/q/q.js:108:17)
    at process._tickCallback (node.js:415:13)
```

You're probably wondering - why not add both of the platforms first, then add the plugin? That's what I recommend doing now. 

However, going back to Holly and Dan's post, I highly recommend if you have any plugins with variables that you do a little clean-up of plugin's before adding them. And by clean-up, I mean, remove the plugins before adding them. 

This should only be an issue until the awesome Cordova team fixes the issue of adding plugins correctly.

Hope this helps!