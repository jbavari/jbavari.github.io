---
layout: post
title: "Managing Cordova Plugins with package.json and hooks"
date: 2014-06-24 17:52
comments: true
categories: cordova
---

In a previous post, I blogged about [how to manage plugins with variables](http://jbavari.github.io/blog/2014/03/29/how-i-use-plugins-with-variables-in-phonegap-slash-cordova-applications/). I wanted to expand on that some more, and this time, talk about how to use your package.json to manage your plugins with versions as well as a way to reset your cordova set up.

## The problem

Whenever I start a new Cordova project, I start by adding in all my plugins. Then once they are added, I'll then commit them all and push the repository with all the plugins. 

My workflow is usually like this:

* cordova create new ProjectApp
* cd ProjectApp
* cordova platform add ios
* cordova plugin add org.apache.cordova.camera
* cordova plugin add org.apache.cordova.contacts
* <insert more plugin statements for every plugin we want>
* cordova run ios
* cordova run android


Occassionaly, I run into this issue when I'm using plugins that require native variable hooks when installing. The prime example is the facebook plugin, it requires the `APP_ID` to be passed in with the `cordova plugin add` command with the options of `--variable APP_ID="some_id"`.

## What I'd rather do

It'd be nice to have these plugins being saved with their version, so when the next user needs to pull the plugins, or modify the installation, they can just modify the package.json and run a command to install them all. That way, we can get some kind of versioning on our plugins.

Ideally, I want to just type `cordova setup` - have it look at my package.json file, and just begin installing what's listed there.

### Making the dream come true

First, lets start by putting our platforms and plugins in our package.json like so:

``` js
{
  "name": "SampleApp",
  "version": "0.0.0",
  "description": "Sample App",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "",
  "license": "ISC",
  "platforms": [
    "ios",
    "android"
  ],
  "plugins": [
    "org.apache.cordova.camera",
    "org.apache.cordova.console",
    "org.apache.cordova.contacts",
    "org.apache.cordova.device",
    "org.apache.cordova.dialogs",
    "org.apache.cordova.file",
    "org.apache.cordova.file-transfer",
    "org.apache.cordova.geolocation",
    "org.apache.cordova.inappbrowser",
    "org.apache.cordova.media",
    "org.apache.cordova.media-capture",
    "org.apache.cordova.network-information",
    "org.apache.cordova.splashscreen",
    {
    	"locator": "https://github.com/jbavari/cordova-facebook-connect.git",
    	"variables": {
    		"APP_ID": "some_id",
    		"APP_NAME": "some_name"
	    }
	}
  ],
  "devDependencies": {
    "load-grunt-tasks": "~0.4.0",
    "time-grunt": "~0.3.1",
    "grunt": "~0.4.4",
    "grunt-shell": "~0.6.4"
  },
  "dependencies": {}
}

```

### Automating Platforms

Now, we'll need a script that will look at our `package.json` and begin installing our platforms and plugins. 

My platform installation script is located in the `tasks` directory named `platforms.js`, and looks like so:

``` js
#!/usr/bin/env node

//This script will add or remove all plugins listed in package.json
//usage: node platforms.js [add | remove]

var command = process.argv[2] || 'add';
var packageJson = require('../package.json');
 
var fs = require('fs');
var path = require('path');
var sys = require('sys')
var exec = require('child_process').exec;
 
packageJson.platforms.forEach(function(platform) {
    var platformCmd = 'cordova platform ' + command + ' ' + platform;
    exec(platformCmd);
});
```

### Automating Plugins

My plugin installation script is also in my `tasks` directory, and named `plugins.js`:

``` js
#!/usr/bin/env node

//This script will add or remove all plugins listed in package.json

//usage: node plugins.js [ add | remove ]

var command = process.argv[2] || 'add';

var packageJson = require('../package.json');
 
var fs = require('fs');
var path = require('path');
var sys = require('sys')
var exec = require('child_process').exec;

function createAddRemoveStatement(plugin) {
    var pluginCmd = 'cordova plugin ' + command + ' ';
    if(typeof plugin === 'string') {
        pluginCmd += plugin;
    } else {
        if(command === 'add') {
            pluginCmd += plugin.locator + ' ';
            if(plugin.variables) {
                Object.keys(plugin.variables).forEach(function(variable){
                    pluginCmd += '--variable ' + variable + '="' + plugin.variables[variable] + '" ';
                });
            }
        } else {
            pluginCmd += plugin.id;
        }
    }

    return pluginCmd;
}

function processPlugin(index) {
    if(index >= packageJson.plugins.length)
        return;

    var plugin = packageJson.plugins[index];
    var pluginCommand = createAddRemoveStatement(plugin);
    console.log(pluginCommand);
    exec(pluginCommand, function(){
        processPlugin(index + 1);
    });
}

processPlugin(0);
```

Great. Now I don't really need to add all the plugins, remove them, or worry about platforms. I can just run my scripts by doing `node tasks/platforms.js` or `node tasks/plugins.js` to have it set up my project as stated in my `package.json` file.

Easier management for teams, I'd like to think.

Hope this helps others.