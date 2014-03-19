---
layout: post
title: "Automating Jasmine Tests With Grunt Karma"
date: 2013-12-03 09:22
comments: true
categories: gruntjs jasmine karma automation
---

I find myself lately in falling in love unit testing in Javascript with the [Jasmine](http://pivotal.github.io/jasmine/) framework. It's really upped my trust levels that I've been writing lately. 

I don't want to go in depth about jasmine and how to use it, but what I do want to do is discuss a little bit of how to automate some of the precious tests you may already have.

## Why I wanted to start automating these tests

I had a great set of tests created. Since most of the tests were in javascript, I needed a browser of some sort to act as the test runner. 

My initial options for work flow after writing tests:  

* Have a browser (chrome/firefox) pointed at the local SpecRunner.html and manually refresh after making code changes
* Manually execute [phantomJS](https://github.com/ariya/phantomjs/) to get the results from the SpecRunner.html file
* Have a grunt task that would watch the code files and on change open a browser to execute the code changes

### Whats wrong with the prior steps?

It's manual. You have to take control and do it. That means, another step in the process. I'm obsessed with automation which means I want to automate this. 

## Do you believe in Karma?

I did a quick google search for a Grunt plugin for automating jasmine tests and stumbled across [Grunt Karma](https://github.com/karma-runner/grunt-karma) . I bet you're wonder what karma is? [Karma](https://github.com/karma-runner/karma) is a node.js tool that opens multiple browsers and executes the tests you specify. SA-WEET. 

Also to be noted, Karma works with other testing frameworks as well, so you aren't stuck with just Jasmine.

### AUTOMATE ME

Getting started is easy, first running the 'npm install -g karma' command to get karma installed, then running 'karma init' to set up a config. In the config interactive set up,  you specify what testing framework to use, whether or not to use Require.js, what browsers to test with (multiple at a time is an option), what files to test, any files to ignore, and whether or not you want automatically watch and run tests after they change.

Once you're done, add the grunt config settings for karma as such:

``` javascript 
karma: {
  unit: {
    configFile: 'karma.conf.js',
    autoWatch: true
  }
}
```

If you got it right, fire it off with 'grunt karma' - it should automatically start popping up browsers and giving you test statistics.

## What I would like to do with these test results

On any code changes or check-ins, I'd like to automatically run the unit tests and update our developer dashboard statistics (we use [Dashing](http://shopify.github.io/dashing/) ) so we can have live stats of how our code is doing. 

The next step in this process is to have Jenkins fire this puppy off when it needs. Perhaps even fire off a build to TestFlight to get the app right into the hands of our tests after all test have verified!

Cheers!