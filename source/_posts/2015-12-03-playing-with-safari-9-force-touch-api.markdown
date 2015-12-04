---
layout: post
title: "Playing with Safari 9 Force Touch API"
date: 2015-12-03 10:46
comments: true
categories: es6 safari api
---

I just got the new Macbook Pro not too long ago and noticed they had this intimately named featured called Force Touch.

Force touch, as it sounds, lets you touch things more *intimately*. The gist is this - there are sensors on the new touch pad that let you determine how hard the touch pad is touched, and has some API into that.

I admit, the API is kinda just for fun since only Safari 9 and new Macbooks have the feature. Still, I wanted to play more with ES6 and create a little API wrapper to make it easier and let this feature name to be a little less creepy.

After a little googling, I found an awesome [blog post by Joshua Kehn](http://www.joshuakehn.com/2015/10/22/using-new-force-touch-apis-in-javascript.html) that detailed more about using Force touch. I wanted to make a quick wrapper around it to do some fun effects and animations.

The idea is - we'll have an API called `TheForce` that we can attach handlers to for fun visual effects.

Joshua's demo had a box that when tapped and applying pressure, padding would be increased. I took [his gist](https://gist.github.com/joshkehn/3ed6b535408162fe94ae) and turned it into an ES6 module. (See the [demo](http://www.joshuakehn.com/2015/10/22/using-new-force-touch-apis-in-javascript.html#demo))

## The API

I wrote it up last night in a quick hurry. The gist is this:

* Attach to a DOM element
* Apply a glow to the element based applied pressure to touchpad

Code to attach a button named `you`, and trigger it automatically:

``` js
var luke = TheForce.beWith('you').alter({'boxShadow');

<!-- luke.alter('boxShadow'); -->
```
