---
layout: post
title: "Cordova in Mobile Web"
date: 2014-06-25 23:43
comments: true
categories: cordova phonegap
---

I had a quick meet up with a friend today to show him some of the cool things Cordova can do. He was asking if there's a way to re-use code between his hybrid app and his mobile app. The answer is absolutely!

## Making this happen

There's a few things you'll need to do:

* Include a dummied out Cordova.js file that will signal Mobile web over hybrid
* Understand parts of app that need native functionality

### Functionality still available in Mobile Web

There are a few subset of features available for mobile web browsers that Cordova can still use. Most notably is access to geolocation, which requires user permission. The second is accessing the users photos.


### Native parts

* Contacts
* Emails


### Figuring out whats available

There are a few ways to test to see whats available in the users mobile web browser:

* Modernizr (Not recommended)

#### Simplier methods

`typeof window.FileReader != 'object'` - checking if we are able to read files

`navigator.onLine`

`navigator.geolocation`

#### Choosing from their photo library

<input id="tellWorldFile" class="webPictureAttachment" type="file" data-role="none" display="none" />

This will allow a pop up to show for the user if their browser allows it. At the time of writing this, iOS 6.0 and 7.0 Safari support this feature.

