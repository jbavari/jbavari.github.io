---
layout: post
title: "Unit Testing AngularJS Services"
date: 2014-06-11 17:52
comments: true
categories: javascript angularjs localstorage jasmine karma nodejs
---

I've been using AngularJS a lot lately. Since I do a lot of Javascript, that means I'm prone to make a lot of runtime script errors.

You know those silly javascript errors - like ReferenceError and ParseError? Those can always be avoided by just writing some simple unit tests with Jasmine. I'd like to cover just how I do that.

(NOTE - I am forever learning, not teaching or saying THIS is the way it MUST be done)

I read through Andy Shora's great blog post about [Unit Testing Best Practices for AngularJS](http://andyshora.com/unit-testing-best-practices-angularjs.html), but I wanted to record my actual steps so I can reference this again and capture my knowledge.

## Tools for Javascript Testing AngularJS Services

There's a few things going on here. First we need something to set up our tests and set expectations - thats Jasmine. Then we need something to run the tests in browsers (or PhantomJS) - thats Karma. We then need a task runner to go and do these tests for us in some build process, thats Grunt/Gulp. Each tool has a file that will tell it how to run.

* [Jasmine](http://jasmine.github.io/2.0/introduction.html) (unit testing framework)
* [Karma](http://karma-runner.github.io/0.12/index.html) (for multiple browsers)
* [Grunt](http://http://gruntjs.com/) / [Gulp](http://gulpjs.com/) (task runners / build systems)
* [Angular Mocks](https://github.com/angular/angular.js/blob/master/src/ngMock/angular-mocks.js)

Jasmine takes test spec files, Karma takes a config to tell it where to find the test spec files and actual code files, and grunt or gulp will help us run karma. Lets look at how those config files look.

# Setting up Karma / Jasmine / Gulp configs

I use gulp these days, that requires me to use the gulp CLI as well as the gulp-jasmine plugin. You can use Grunt as well, just exchange gulp for grunt.

I did the following in my command shell:

``` sh
npm install -g gulp
npm install -g karma
npm install gulp-jasmine --save-dev
npm install karma-jasmine --save-dev
npm install karma-phantomjs-launcher --save-dev
npm install karma-spec-reporter --save-dev
```

## Setting up Karma config

I simply ran this in my command shell for a nice simple walk through: `karma init`. It asks a few questions about what browsers to use, to keep running, and what files to use. Pretty basic stuff. 

Interesting tidbits: 

* files - simply and array of files and glob's
* frameworks - specify here which you want to use
* reporters - customize your test output
* browsers - list which you'd want to actually test in

``` js
// Karma configuration
// Generated on Wed Jun 11 2014 09:51:52 GMT-0500 (CDT)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser
    files: [
        './www/js/moment.min.js'
        , './www/js/controllers/*.js'
        , './www/js/models/*.js'
        , './www/js/services.js'
        , './www/lib/ionic/js/angular/angular.js'
        , './plugins/org.apache.cordova.FacebookConnect/www/angular/facebookConnect.js'
        , './test/lib/angular-mocks.js'
        , './test/spec/**/*.js'
    ],

    // list of files to exclude
    exclude: [

    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {

    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['spec'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: [
        'PhantomJS'
        // , 'Chrome'
        // , 'Firefox'
        // , 'Safari'
    ],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false
  });
};
```

## Gulpfile for running tests

Next I had to get a little gulpfile together to run my tests. Right away, I found a quick little SNAFU with the way the gulp task runs the source files VS how I specified them in my Karma config file. A few interesting points here:

* Dont actually pass in files to `gulp.src` - instead use a dummy. You specify the files in your karma config file.
* If you intend on running a `gulp.watch` task to autorun, dont error out your karma stream! Use `this.emit('end')` in your error handler

The code itself:

``` js
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
      this.emit('end'); //instead of erroring the stream, end it
    });
});

gulp.task('autotest', function() {
  return gulp.watch(['www/js/**/*.js', 'test/spec/*.js'], ['test']);
});
```
Awesome, not much left to do as far as setting up our test environment, lets get some code to test!

## Setting Up AngularJS Service

Its a pretty basic setup - an Auth service with a few methods to get a user and call a back end service to retrieve a user.

``` js
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
			if(!user) {
				readStoredUser();
			}
			return user;
		}

		var saveUser = function saveUser(userToSave) {
			window.localStorage.setItem('user', JSON.stringify(userToSave));
			user = userToSave;
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
			loginWithEmail: loginWithEmail,
			saveUser: saveUser
		};
	})
```

Thats a simple bare bones `Auth` service above. We have a few interesting parts to test:

* readStoredUser
* currentUser
* loginWithEmail

The first is somewhat hard because it is private to the Auth service. How do we test that? I guess the option is to make it public via a return in the service?

## Test Specs

There was a few interesting things going on my spec - first I have a beforeEach that sets up some modules I need to use. Otherwise you'll get some fun / weird `couldnt bind` errors.

The second was - In my HTTP tests, I mock out the httpBackend (as provided by angular-mocks) to give me a fake version of my actual HTTP call. This way, I know for sure I'm testing my code, not the outside world.

``` js
//Interesting things to test the Auth service for

// Logging in with Facebook
// Handling callback to server for checkuser
// Saving user to localstorage after login
// Logging out (removing user object as well as localstorage)

describe("Auth Service Unit Tests", function() {

  beforeEach(function() {
  	//Ensure angular modules available
    module('starter.services');
    module('ngCordova.plugins.facebookConnect');
  });

   // instantiate service
  var apiResponse = {
    name: 'Josh Bavari',
    email: 'jbavari@gmail.com',
    id: '4409480064'
  };
  var Auth;
  var FB = {
    init: function() {

    },
    login: function() {

    },
    api: function(url, params, callback ) {
      return callback(apiResponse);
    }
  };
  var FacebookConnect = {
    login: FB.login
  };
  var httpBackend = null;

  beforeEach(inject(function (_Auth_) {
    Auth = _Auth_;
  }));

  it('should have Auth service be defined', function () {
    expect(Auth).toBeDefined();
  });

  it('should not have a user existing upon starting up', function() {
    expect(Auth.currentUser()).toBe(null);
  });

  it('should save a user', function() {
    var user = { name: 'Josh Bavari', id: 1 };

    Auth.saveUser(user);
    var currUser = Auth.currentUser();
    expect(currUser.name).toBe(user.name);
    expect(currUser.id).toBe(user.id);
  });

  it('should have a user in local storage after calling saveUser', function() {
    var user = { name: 'Josh Bavari', id: 1 };

    Auth.saveUser(user);

    var localUser = JSON.parse(window.localStorage.getItem('user'));

    expect(localUser.name).toBe(user.name);
    expect(localUser.id).toBe(user.id);
  });

  it('should remove the user from local storage after logging out', function() {
    var user = { name: 'Josh Bavari', id: 1 };

    Auth.saveUser(user);

    var localUser = JSON.parse(window.localStorage.getItem('user'));

    expect(localUser.name).toBe(user.name);
    expect(localUser.id).toBe(user.id);

    Auth.logout();

    expect(Auth.currentUser()).toBe(null);
  });

  describe('Mocked HTTP Requests', function() {

    var $httpBackend;
    var name = 'Josh Bavari';
    var email = 'jbavari@gmail.com';

    beforeEach(inject(function($injector) {
      // Set up the mock http service responses
      $httpBackend = $injector.get('$httpBackend');
      $httpBackend.when('POST', 'http://raisemore.dev/api/v1/user/checkuser')
        .respond(200, {name: name, email: email, success: true});
     }));

    afterEach(function() {
     $httpBackend.verifyNoOutstandingExpectation();
     $httpBackend.verifyNoOutstandingRequest();
    });
   

    it('should have sent a POST request to the checkuser API', function() {
        var result = Auth.checkUser(name, email, 1, '4408064001', null);
        $httpBackend.expectPOST('http://raisemore.dev/api/v1/user/checkuser');
        $httpBackend.flush();
    });

  });

});
```

Theres a few key points to look at in the Jasmine tests:

* `beforeEach(inject(function (_Auth_) {})` sets our local `Auth` variable
* using inject($injector) to get us our mocked out `$httpBackend` to fake our HTTP requests.

That just about covers it. In recap:

* Set up the testing framework Karma
* Got the test runners for Gulp
* Set up some tests with Jasmine
* Mocked out $http requests to return us some fake data
* Ensured our services called the http requests correctly
* Avoided any future errors from testing - as well as avoiding Parse/Reference errors along the way

AngularJS does a lot of the heavy lifting for you. However, it still gives you just enough rope to hang yourself with.

With just some simple tests you can also avoid any silly run time errors you may encounter.

Hope this gives ideas on how to openly test your services as well as models.


### References

* [Andy Shora's Blog post - Unit Testing Best Practices in AngularJS](http://andyshora.com/unit-testing-best-practices-angularjs.html)
* [AngularJS Unit Testing Controllers](http://www.benlesh.com/2013/05/angularjs-unit-testing-controllers.html)
* [AngularJS Unit Testing Services](http://www.benlesh.com/2013/06/angular-js-unit-testing-services.html)