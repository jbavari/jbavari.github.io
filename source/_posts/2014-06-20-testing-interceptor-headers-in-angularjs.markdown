---
layout: post
title: "Testing Interceptor Headers in AngularJS"
date: 2014-06-20 21:22
comments: true
categories: angularjs javascript testing
---

In AngularJS, you can set up HTTP Interceptors (middleware) to inject headers etc.

I had a service that I wanted to intercept every http request to our API service to attach a token that we consume to verify a user. This would only happen once a token is set. 

Today I paired with [Jeff French](https://twitter.com/jeff_french). We figured out how to test the AngularJS interceptors properly.

Things I want to test:

* Is the token only being attached when a token is set?
* Are the requests actually being attached via the interceptor

The service and interceptor look like this:

``` js
angular.moduler('services')
.factory('RequestService', function RequestService(){
	var token = null;

	var setToken = function setToken(someToken) {
		token = someToken;
	}

	var getToken = function getToken() {
		return token;
	}

	var request = function request(config) {
		if (token) {
			// jqXHR.setRequestHeader('Authorization','Token token="' + app.user.api_key.access_token + '"');
            config.headers['Authorization'] = 'Token token="' + token + '"';
        }
        return config;
	}

	return {
		setToken: setToken,
		getToken: getToken,
		request: request
	}
})

.config(['$httpProvider', function($httpProvider) {
    $httpProvider.interceptors.push('RequestService');
}]);

```

With just a few simple tests, I'm asserting a few things:

* I have no simple ParseError or ReferenceErrors
* Modules are set up correctly
* Interceptors are set up correctly
* My service is actually setting the token correctly
* The interceptor is attaching the header correctly


``` js
"use strict";

var httpProviderIt;

describe("Service Unit Tests", function() {

  beforeEach(function() {
    module('services', function ($httpProvider) {
      //save our interceptor
      httpProviderIt = $httpProvider;
    });

    inject(function (_Auth_, _RequestService_, _Feed_) {
      RequestService = _RequestService_;
    })
  });

  var RequestService;
  var $httpBackend;
  var token = 'someToken';

  describe('RequestService Tests', function() {
   
    it('should have RequestService be defined', function () {
      expect(RequestService).toBeDefined();
    });

    it('should properly set an api token', function() {
      expect(RequestService.getToken()).toBeNull();
      RequestService.setToken(token);
      expect(RequestService.getToken()).toBe(token);
    });

    it('should save the users api token after saveUser', function() {
      spyOn(RequestService, 'setToken');
      Auth.saveUser(apiResponse);
      expect(RequestService.setToken).toHaveBeenCalled();
    });

    it('should have no api token upon start up', function() {
      var token = RequestService.getToken();
      expect(token).toBeNull();
    });

    describe('HTTP tests', function () {
 
      it('should have the RequestService as an interceptor', function () {
          expect(httpProviderIt.interceptors).toContain('RequestService');
      });

      it('should token in the headers after setting', function() {
        RequestService.setToken(token);
        $httpBackend.when('GET', 'http://example.com', null, function(headers) {
          expect(headers.Authorization).toBe(token);
        }).respond(200, {name: 'example' });
      });

      it('should not place a token in the http request headers if no token is set', function() {
        var config = RequestService.request({headers: {} });
        expect(config.headers['Authorization']).toBe(undefined);
      });

      it('should place a token in the http request headers after a token is set', function() {
        RequestService.setToken(token);
        var config = RequestService.request({headers: {} });
        expect(config.headers['Authorization']).toBe('Token token="' + token + '"');
      });
    }); //Mocked HTTP Requests

  }); //RequestService tests

});
```

Simple and sweet.