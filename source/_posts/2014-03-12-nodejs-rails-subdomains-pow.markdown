---
layout: post
title: "Nodejs Rails subdomains - POW!"
date: 2014-03-12 23:44
comments: true
categories: 
---

I wanted to do a quick write up of how I use to fire up a node.js server and several rails/rack apps - all with subdomains using [Pow](http://pow.cx/)!

## The why

We have several rails projects - an API server, a queue'ing rails project basically using [Sidekiq](https://github.com/mperham/sidekiq), an admin dashboard using Rails & angular, and a node.js server running a PhoneGap web-port run in Node.js express.

I needed an easy domain set up, something like:

* project.dev
* my.project.dev
* jobs.project.dev
* m.project.dev

## What I did

After installing POW, I created a few symbolic links, as per docs in the same order as above:

``
ln -s ~/Dev/RM/web ~/.pow/project
ln -s ~/Dev/RM/my ~/.pow/my.project
ln -s ~/Dev/RM/jobs ~/.pow/jobs.project
echo 5000 > ~/.pow/m.project

``