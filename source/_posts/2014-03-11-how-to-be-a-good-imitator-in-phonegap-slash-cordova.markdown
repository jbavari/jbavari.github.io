---
layout: post
title: "How to be a good imitator in PhoneGap/Cordova"
date: 2014-03-11 01:02
comments: true
categories: phonegap cordova mobile ios android
---

If you found your way here, then you're probably seeking knowlege about Phonegap/Cordova. I want to first remind you what the purpose of the PhoneGap / Cordova project is:

> [The ultimate purpose of PhoneGap is to cease to exist.](http://phonegap.com/2012/05/09/phonegap-beliefs-goals-and-philosophy/)

What this means is - you should really start getting ready to make Native-like apps regardless of what technology is used.

How can we give native apps a better feel from PhoneGap / Cordova? Or stated another way, what are some tricks we can use to make the application feel more native? 

The answer then, is to be a better imitator, you must first understand what you are imitating.

## The chameleons change color to their surroundings

Simply stated - you adapt to what your surroundings are. 

Our surroundings for PhoneGap / Cordova are quite wide:

* iOS
* Android
* Windows Phone
* BlackBerry
* Firefox OS

That is a lot to adapt to. It may take a little time to familiarize yourself with each platform. If you do though, your users will thank you.


## Some suggestions

* Put navigation items near the top in Android, for iOS put them near the bottom. Users are used to having their navigation in the same place.
* In Android / Windows Phone - mind the Back button! Users use their phones natively, and if you try to change this, they will hate your app.
* Dont use the same button styles for each platform! Buttons on iOS do not look like buttons on Android - if you try this though, your users will notice and find it odd. [See these great examples from Ratchet.js (look for the Base/iOS/Android buttons near the top)](http://goratchet.com/components/)
* Use Native-like loading animations. iOS generally has a small circle - if you try using this instead of your own custom loading icon, users will most likely blame their phone over your app. [See this study by Facebook for loading animations](http://mercury.io/blog/the-psychology-of-waiting-loading-animations-and-facebook)
* Test on actual devices. You cant get a native feel from clicking on a simulator.


References:

[Performance UX Considerations for successful PhoneGap apps](http://www.tricedesigns.com/2013/03/11/performance-ux-considerations-for-successful-phonegap-apps/)

[Tips for getting that native feel](http://www.mikedellanoce.com/2012/09/10-tips-for-getting-that-native-ios.html)

