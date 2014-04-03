---
layout: post
title: "How I use npm link"
date: 2014-04-03 10:04
comments: true
categories: 
---

Throughout the last few months, I've began helping out the [Cordova](http://cordova.apache.orc) team with a few bug fixes that I come across and want to contribute back.

Cordova is a host of different [components](https://issues.apache.org/jira/browse/CB/?selectedTab=com.atlassian.jira.jira-projects-plugin:components-panel), many of which rely on node.js modules from npm. 

When I first started wantint go help, I didnt know how to make changes to the cordova code to use globally, and I didnt want to just go modify the code in the global node_modules/cordova-cli folder. This post covers on how to get started modifying existing node modules you may use from npm.

## Why?

Recently, I came across [a small bug](https://groups.google.com/forum/#!topic/phonegap/ahzIwbUqr4A) in Cordova CLI 3.4. To begin to poke around the code to find a fix in the cordova-cli project.

When I first started, I had to figure out how to get access to the verion pulled from the repo on Github to use my code instead of the globally installed cordova.

# How I use npm-link

* Uninstalled the currently used cordova cli, `npm uninstall -g cordova`
* Forked the [cordova-cli repo from github](https://github.com/apache/cordova-cli)
* `git clone git@github.com:jbavari/cordova-cli.git`
* Changed directory to the repo I just cloned
* Ran `npm link`

After running npm link, I can now run `cordova create HelloWorld` from any directory, and it will use the code that I just `npm link`'d.

Now, when I make changes to that repo that I cloned on my machine, I can run it immediately instead of having to push or update the package in npm.

Hope this helps others in trying to get started contributing to any projects that they might use from npm! (Or contributing to the Cordova project!)