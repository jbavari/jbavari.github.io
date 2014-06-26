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

### Native parts

* Contacts
* Emails