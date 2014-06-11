---
layout: post
title: "Unit Testing AngularJS Services"
date: 2014-06-11 17:52
comments: true
categories: javascript angularjs localstorage jasmine karma
---

I've been using AngularJS a lot lately. Since I do a lot of Javascript, that means I'm prone to make a lot of runtime script errors.

You know those silly javascript errors - like ReferenceError and ParseError? Those can always be avoided by just writing some simple unit tests with Jasmine, right?

(NOTE - I am forever learning, not teaching or saying THIS is the way it MUST be done)

I read through Andy Shora's great blog post about [Unit Testing Best Practices for AngularJS](http://andyshora.com/unit-testing-best-practices-angularjs.html), but I wanted to record my actual steps so I can reference this again and capture my knowledge.


## Tools for Javascript Testing AngularJS Services

Theres a few players in this unit testing game we need to introduce to test these bad boys.

* [Jasmine](http://jasmine.github.io/2.0/introduction.html) (unit testing framework)
* [Karma](http://karma-runner.github.io/0.12/index.html) (for multiple browsers)
* [Grunt](http://http://gruntjs.com/) / [Gulp](http://gulpjs.com/) (task runners / build systems)
* [Angular Mocks](https://github.com/angular/angular.js/blob/master/src/ngMock/angular-mocks.js)

## Setting Up AngularJS Service

Its a pretty basic setup - an Auth service with a few methods to get a user and call a back end service to retrieve a user.

```
angular.module('services')
	.factory('Auth', function Auth($http, $q) {
		var user = null;

		var readStoredUser = function readStoredUser() {
			//Try to read in from localStorage if one exists
			var storedUser = window.localStorage.getItem('user');
			try {
				if(storedUser) {
					// Note: Using a simple user model here
					user = new User(JSON.parse(storedUser));
				}
			} catch (ex) { /* Silently fail..*/ }
		}

		readStoredUser();

		var currentUser = function currentUser() {
			return user;
		}

		var loginWithEmail = function loginWithEmail(name, email) {
			var deferred = $q.defer();

			var postPath = 'http://someurl.dev/api/v1/login';
			var postData = { name: name, email: email };

			$http.post(postPath, postData).success(function(data) {
				if(data.success) {
					deferred.resolve(data);
				} else {
					deferred.reject(data);
				}
			}).error(function(error) {
				deferred.reject(error);
			});

			return deferred.promise;
		}

		return {
			currentUser: currentUser,
			loginWithEmail
		};
	})
```

Thats a simple bare bones `Auth` service above. We have a few interesting parts to test:

* readStoredUser
* currentUser
* loginWithEmail

The first is somewhat hard because it is private to the Auth service. How do we test that? I guess the option is to make it public via a return in the service?

## Setting up Karma / Jasmine / Gulp 

I use gulp these days, that requires me to use the gulp CLI as well as the gulp-jasmine plugin. You can use Grunt as well, just exchange gulp for grunt.

I did the following in my command shell:

```
npm install -g gulp
npm install -g karma
npm install gulp-jasmine --save-dev
npm install karma-jasmine --save-dev
npm install karma-phantomjs-launcher --save-dev
npm install karma-spec-reporter --save-dev
```

## Setting up Karma

I simply ran this in my command shell for a nice simple walk through: `karma init`. It asks a few questions about what browsers to use, to keep running, and what files to use. Pretty basic stuff. I came up with something like this gist:

{% gist jim/jim/ddb3bef5af23b072f526 %}

## Gulpfile for running tests

Next I had to get a little gulpfile together to run my tests. Right away, I found a quick little SNAFU with the way the gulp task runs the source files VS how I specified them in my Karma config file. I found this little hack below:

```
var karma = require('gulp-karma');

gulp.task('test', function() {
  // Be sure to return the stream
  // NOTE: Using the fake './foobar' so as to run the files 
  // listed in karma.conf.js INSTEAD of what was passed to 
  // gulp.src !
  return gulp.src('./foobar')
    .pipe(karma({
      configFile: 'karma.conf.js',
      action: 'run'
    }))
    .on('error', function(err) {
      // Make sure failed tests cause gulp to exit non-zero
      console.log(err);
      throw err;
    });
});
```