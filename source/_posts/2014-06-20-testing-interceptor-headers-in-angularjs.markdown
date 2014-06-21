---
layout: post
title: "Testing Interceptor Headers in AngularJS"
date: 2014-06-20 21:22
comments: true
categories: angularjs javascript testing
---

In AngularJS, you can set up HTTP Interceptors (middleware) to inject headers etc.

Today I paired with Jeff French. We figured out how to test them properly.

``` js
  it('should token in the headers after setting', function() {
    RequestService.setToken(token);
    $httpBackend.when('GET', 'http://example.com', null, function(headers) {
      expect(headers.Authorization).toBe(token);
    }).respond(200, {name: 'example' });
  });
```