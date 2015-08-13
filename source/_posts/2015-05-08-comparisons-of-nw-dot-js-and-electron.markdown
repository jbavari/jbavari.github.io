---
layout: post
title: "Comparisons of nw.js and Electron"
date: 2015-05-08 17:11
comments: true
categories: 
---

In the last few months, I've been playing around with two tools to help bridge the gap between the web and native desktop applications. There are two main tools that come to mind - nw.js (formerly known as Node Webkit) and Electron (formerly known as Atom Shell).

This post focuses on using both, the differences between the two, and focusing on issues that I've encountered.

Outline: 

* Getting started - package.json
* Native Menus (application menu)
* Shell execution (child processes)
* Packaging / run
* Icons
* Performance

# Nw.js

## Getting started

Nw.js and Electron share a lot of the same steps for getting started. The only real difference between the two is how they are run, and how they handle the node process internally.

With Nw.js, your app is bundled together. With Electron, the application is set up differently - with the main node process the handle running the browser process, and the rendering process, which handles all things from the browser (the event loop).

To get running, [download the nw.js app]() or the [electron app](). Both of these applications look at your `package.json` file to get running by looking at the `main` attribute.

## Bootstrapping

For nw.js, the `main` attribute should specify which html file to start loading when your application launched. With Electron, your `main` attribute should specify a JavaScript file to be run.

You also specify attributes about the nw.js window that runs via the `window` attribute, things like `toolbar`, `width`, and `height`, notably.

With Electron, the JS file that you specify will launch the browser window and specify other attributes like width, height, and other window attributes.

For convenience sake, I also created a node run script to execute the Nw.js app with my current folder. To run the node-webkit app, you simply type `npm run nwjs`. I also included a livereload script to watch my `www` folder to live reload my changes in the nw.js app.

Here's a quick look at the `package.json` file used to bootstrap nw.js:

```json
{
  "name": "nwjs-app",
  "version": "1.0.0",
  "description": "",
  "main": "www/index.html",
  "scripts": {
    "nwjs": "/Applications/nwjs.app/Contents/MacOS/nwjs . & node livereload",
    "electron": "/Applications/Electron.app/Contents/MacOS/Electron . & node livereload"
  },
  "window": {
    "toolbar": true,
    "width": 800,
    "height": 500
  }
}
```

Here's a quick look at the `package.json` file used to bootstrap Electron:

```json
{
  "name": "nwjs-app",
  "version": "1.0.0",
  "description": "",
  "main": "src/main.js",
  "scripts": {
    "nwjs": "/Applications/nwjs.app/Contents/MacOS/nwjs . & node livereload",
    "electron": "/Applications/Electron.app/Contents/MacOS/Electron . & node livereload"
  },
  "window": {
    "toolbar": true,
    "width": 800,
    "height": 500
  }
}
```

Additionally for Electron, my `main.js` file looks like the following:

```js
var app = require('app');  // Module to control application life.
var BrowserWindow = require('browser-window');  // Module to create native browser window.
var Menu = require('menu');
var ipc = require('ipc');

// var menu = new Menu();
// Report crashes to our server.
// require('crash-reporter').start();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the javascript object is GCed.
var mainWindow = null;
var menu;

var browserOptions = {
  height: 600,
  title: 'Electron App',
  width: 800
};

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  if (process.platform != 'darwin')
    app.quit();
});

// This method will be called when Electron has done everything
// initialization and ready for creating browser windows.
app.on('ready', function() {
  // Create the browser window.
  mainWindow = new BrowserWindow(browserOptions);

  // and load the index.html of the app.
  mainWindow.loadUrl('file://' + __dirname + '/www/index.html');

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });

  ipc.on('update-application-menu', function(event, template, keystrokesByCommand) {
    //Go through the templates, wrap their click events back to the browser
    console.log('update-application-menu - template');
    console.log(template);
    translateTemplate(template, keystrokesByCommand);
    menu = Menu
    Menu.setApplicationMenu(menu);
  });
});
```

## Native Menus


### Electron

Due to the way electron is split up into two processes, the main process (that handles native menus) and the browser process (mainly your app), menus are mainly available to be set on the main process.

If you want your app to change your application menus, you'll need to use the [`ipc`](https://github.com/atom/electron/blob/master/docs/api/ipc-main-process.md) module electron provides to get a message out to the main process to update the menus.

Other than that, the menu system is super easy if you wish to use static menus.

### Nw.js

It's dead simple. Since it's all one bundled process, just call the set menu, and you're good. It's easy to set short cuts and modify the menus.

## Shell execution

In nw.js, you're good to go when it comes to making external shell calls. 

When it comes to electron, make sure you spawn your child processes with the `pipe` stdio option. Without that option, you may run into some errors (due to the fact electron doesnt have a stdout it manages easily).

## Packaging / running

It's really easy on both platforms. Just set up your package.json/index.html/main.js file and run the appropriate command.

I don't have a lot of experience with nw.js, so I cant speak to the packaging process.

For electron, to run I like to use [electron-prebuilt](https://github.com/mafintosh/electron-prebuilt) to run my `www` files as an app, using [electron-packager](https://github.com/maxogden/electron-packager) to package into an `.app` file, and [electron-builder](https://github.com/loopline-systems/electron-builder) to create installers (dmg/setup.exe).

## Icons

To get custom icons for your app files for Mac, you need an `.icns` file that bundles up all your icons in all the formats/sizes for your dock icon, your cmd+tab icon, and your running icon.

I used this as a [walkthrough](http://stackoverflow.com/questions/12306223/how-to-manually-create-icns-files-using-iconutil).

I first started with a size of 1024x1024 pixels, then used the following commands:

```

# Enter app.iconset, drop in icon.png as a 1024 x 1024 image.
# Run the following commands:
sips -z 16 16     icon.png --out ./icon_16x16.png
sips -z 32 32     icon.png --out ./icon_16x16@2x.png
sips -z 32 32     icon.png --out ./icon_32x32.png
sips -z 64 64     icon.png --out ./icon_32x32@2x.png
sips -z 128 128   icon.png --out ./icon_128x128.png
sips -z 256 256   icon.png --out ./icon_128x128@2x.png
sips -z 256 256   icon.png --out ./icon_256x256.png
sips -z 512 512   icon.png --out ./icon_256x256@2x.png
sips -z 512 512   icon.png --out ./icon_512x512.png
cp icon.png icon_512x512@2x.png
```

Then just run:

```
iconutil -c icns app.iconset -o ./app-dir/YourAppName.app/Contents/Resources/app.icns
```

You should now have your app with icons ready to go.

## Performance

I didn't see a lot of major performance bumps from using either platform. It's JavaScript after all.

## Closing words

Most of all, have fun with developing with these tools! They're open source and free, so when you get a chance, share some knowledge, post an issue, respond to an issue, or even submit a PR.

We're all in this together.
