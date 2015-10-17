---
layout: post
title: "Understanding Built Node Modules"
date: 2015-10-15 08:32
comments: true
categories: node npm ionic
---

I've found lately having to understand more how native node modules are used. What I'm referring to, is using [Node addons](https://nodejs.org/api/addons.html):

> Addons are dynamically linked shared objects. They can provide glue to C and C++ libraries. The API (at the moment) is rather complex, involving knowledge of several libraries

> Node.js statically compiles all its dependencies into the executable. When compiling your module, you don't need to worry about linking to any of these libraries.

Since I maintain the [Ionic CLI](https://github.com/driftyco/ionic-cli), we have a few depedencies to a native node module, node-sass.

Node-sass relies on some native C/C++ bindings to compile SASS down to CSS.

If you have a version of Node 0.12 for example, and install the ionic-cli, then install Node 4.2.1, you may have issues running the CLI.

This is due to the module building itself with that version of node and using those bindings, then when you install a new version of Node, you can't use those same bindings.

When you change versions of node, make sure you do a quick `rm -rf node_modules` if on mac, or deleting the node_modules folder on windows and doing a fresh `npm install`.

If you want to read a little more, background information is shared by [Chris Williams](http://twitter.com/voodootikigod) about his struggles maintaining the node-serialport module on [this post](http://www.voodootikigod.com/on-maintaining-a-native-node-module/).
