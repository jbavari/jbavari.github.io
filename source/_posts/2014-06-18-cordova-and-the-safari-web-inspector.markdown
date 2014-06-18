---
layout: post
title: "Cordova and the Safari Web Inspector"
date: 2014-06-18 00:22
comments: true
categories: cordova iphone debugging ios
---

If you've ever been doing some iOS development in Cordova, you may have used the Safari Web Inspector (SWI) once or twice. You've also noticed that SWI closes when the app is put in the background or you switch apps.

I found a sweet hack that allows you to keep your safari web inspector running regardless of whether or not the app is in the foreground or not. I'd like to outline that in this post.

I'm not sure how I stumbled across this sweet hack, but I have to write it down before I forget how it's done. My system specs at the time of writing this is Mac OSX 10.8.5 (Mountain Lion).

## Whats involved

* Using a simulator or connected device
* Having Safari web inspector (SWI) running

What normally happens is, when the app closes, SWI will also close. When you relaunch the app, you will need to put Safari in the foreground, click `Develop` on the menu bar, then hover `iPhone Simulator` or `iPhone`, then click the `index.html` (or your page) to connect &amp; launch SWI. 

This is very frustrating because on the app relaunching you may have a callback happening or other code you want to debug/inspect/log on app start up. This hack lets you keep SWI and running gracefully.

Bare with me now, we're going to get funky.

## Setting up a global hotkey

The first thing to do is to set a [global hotkey](http://support.apple.com/kb/ph6889) - steps:

* Open System Preferences / Keyboard
* On the right panel, select `Application Shortcuts`
* Add a hot key - use whatever keys you want (I used `CMD + ALT + I`)
* Have the matching key be `index.html` or whatever your cordova's main html file is

## Steps to keep open SWI

* Launch Cordova App
* Open SWI
* Close SWI 
* Launch SWI with quick key as set up in global hotkey `Application Shortcuts` 
* Close App 
* Reopen app - notice SWI is still running and continues to give us logging/debugging! 

Enjoy, friends!