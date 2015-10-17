---
layout: post
title: "Understanding Built Node Modules"
date: 2015-10-15 08:32
comments: true
categories: 
---

I've found lately having to understand more how native node modules are used. Since I maintain the [Ionic CLI](https://github.com/driftyco/ionic-cli), we have a few depedencies to a native node module, node-sass.

Node-sass relies on some native bindings to compile SASS down to CSS.

If you have a version of Node 0.12 for example, and install the ionic-cli, then install Node 4.2.1, you may have issues.

This is due to the module building itself with that version of node and using those bindings.

When you change versions of node, make sure you do a quick `rm -rf node_modules` if on mac, or deleting the node_modules folder on windows and doing a fresh `npm install`.

If you want to read a little more, background information is shared by [Chris Williams](http://twitter.com/voodootikigod) about his struggles maintaining the node-serialport module on [this post](http://www.voodootikigod.com/on-maintaining-a-native-node-module/).
