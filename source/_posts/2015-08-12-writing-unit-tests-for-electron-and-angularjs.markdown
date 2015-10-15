---
layout: post
title: "Writing Unit Tests for Electron and AngularJS"
date: 2015-08-12 19:53
comments: true
categories: electron testing angularjs
---

Unit testing is something most of us dev's don't think much of. Until we encounter some simple to solve bugs or have regressions in code that drives us crazy.

JavaScript testing itself is hard with no clear cut path to take. Most times, you'll have to decide important things for yourself as far as which testing framework to use and the tools to do them.

I enjoy Jasmine testing framework right now. For my node projects, I like to use the node package [jasmine-node](https://github.com/mhevery/jasmine-node). However, Electron is basically a web browser with node conveniences, so we want to test browser related things.

Since Electron applications take a unique approach to combining elements from the browser with conveniences from node, such as `require`, `__dirname`, `global` and other keywords specific to node, testing gets a little more complicated.

I'm going to outline a few of the approaches I took. I'm sure they are not perfect, I'm still learning and I'm outlining that here.


## Tools of the trade

I outlined [some things I did to test AngularJS](http://jbavari.github.io/blog/2014/06/11/unit-testing-angularjs-services/) in a previous post. I pretty much use the same tools and set up:

``` sh
npm install -g karma karma-jasmine karma-phantomjs-launcher karma-spec-reporter phantomjs
```

Now I've got my `karma.config.js` file:

``` js
//..snip..
// list of files / patterns to load in the browser
files: [
  'www/lib/angular/angular.min.js',
  'node_modules/angular-mocks/angular-mocks.js',
  'www/js/**/*.js',
  'spec/**/*.js'
]
//..snip..
```

Now we're set up to do some testing!

## Exposing `require` to AngularJS service

I first wanted a one stop shop for all my node conveniences in one angular js service to contain what Electron provides. 

Here's my service:

``` js
angular.module('app.services')
.factory('NodeService', function() {
  var fixPath = require('fix-path'),
      fs = require('fs'),
      ipc = require('ipc'),
      opn = require('opn'),
      path = require('path'),
      shell = require('shell');

  //Fixes the path issue with node being run outside of this GUI  
  fixPath();
  process.env.PATH = process.env.PATH + ':/usr/local/bin';

  //Path from root -> 'www'
  //__dirname == 'www' dir
  var appJsonPath = path.join(__dirname, 'package.json');
  var appJson = require(appJsonPath);

  return {
    appJson: appJson,
    fixPath: fixPath,
    fs: fs,
    ipc: ipc,
    opn: opn,
    path: path;
  };
});
```

## Test set up for Service

Now, hopefully I have all my node conveniences in one place (`require`, `__dirname`, etc).

Let's get a simple test up:

``` js
describe('#NodeService', function() {
  var NodeService;

  beforeEach(function() {
      //Ensure angular modules available
    module('app.services');
  });

  beforeEach(inject(function(_NodeService_) {
    NodeService = _NodeService_;
  }));

  it('should have node service defined', function() {
    expect(NodeService).toBeDefined();
  });
});
```

If we run this test without anything else, we'll see immediately a problem:

``` sh
ReferenceError: Can't find variable: require
```

My approach to this is simple - create a faked out global variable that represents `require` and does what you want, such as:

``` js
var fakePackageJson = { name: "Fake package.json name" };
window.require = function(requirePath) {
  console.log('Requiring:', requirePath);
  switch(requirePath) {
    case 'ipc':
      return ipcSpy;
    case 'fs':
      return fsSpy;
    case '/spec/package.json':
      return fakePackageJson;
  }
};
window.__dirname = '/some/fake/path';
```


## Package.json test setup

Let's define some quick `scripts` to run from our package.json to help others run our tests:

``` json
//..snip..
  "scripts": {
    "test": "karma start"
  }
//..snip
```

Now when we run our tests, we'll have the faked out node modules passed back.

This is just one approach to take to setting up some faking out for node modules using Electron, Angular JS, and Jasmine.

Hope this helps.
