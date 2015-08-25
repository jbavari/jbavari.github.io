---
layout: post
title: "Lazy loading your node modules"
date: 2015-08-25 15:29
comments: true
categories: 
---

While working at [Ionic](http://ionicframework.com) I've been focused on the [Ionic CLI](http://npmjs.org/package/ionic). 

My first big refactor of the CLI was pulling out most of the 21 commands it offers into an external library ([ionic-app-lib](http://github.com/driftyco/ionic-app-lib)) that could be consumed by both the Ionic CLI and our GUI - [Ionic Lab](http://lab.ionic.io).

The refactor went rather smoothly. 

However, one thing happened that was not expected - now that the ionic-app-lib bundled all the commands together, whenever you required the app-lib module, it was rather slower than expected.

For example, whenever you ran: `var IonicAppLib = require('ionic-app-lib');` - it would take a wee bit longer.

Here's the code for the included moduled `ionic-app-lib`:

``` js

var browser = require('./lib/browser'),
    configXml = require('./lib/config-xml'),
    cordova = require('./lib/cordova'),
    events = require('./lib/events'),
    hooks = require('./lib/hooks'),
    info = require('./lib/info'),
    ioConfig = require('./lib/io-config'),
    login = require('./lib/login'),
    logging = require('./lib/logging'),
    multibar = require('./lib/multibar'),
    opbeat = require('./lib/opbeat'),
    project = require('./lib/project'),
    share = require('./lib/share'),
    semver = require('semver'),
    serve = require('./lib/serve'),
    settings = require('./lib/settings'),
    setup = require('./lib/setup'),
    start = require('./lib/start'),
    state = require('./lib/state'),
    upload = require('./lib/upload'),
    utils = require('./lib/utils');

module.exports = {
  browser: browser,
  configXml: configXml,
  cordova: cordova,
  events: events,
  hooks: hooks,
  info: info,
  ioConfig: ioConfig,
  login: login,
  logging: logging,
  multibar: multibar,
  opbeat: opbeat,
  project: project,
  share: share,
  semver: semver,
  serve: serve,
  settings: settings,
  setup: setup,
  start: start,
  state: state,
  upload: upload,
  utils: utils
}

```

As you can see, whenever this module is `require`'d in, it `require`'s even more modules. This means, more file read requests and fulfilling those just to get this module working.


Also to note - anytime a new command was added in, it must be exported by adding in another annoying `require` statement.

## Lazy loading via JavaScript getters

While looking through other open source projects, I came across the idea of lazy loading your modules on demand.

One way to do this is with JavaScript getters being defined. We wont `require` the module until it is requested.

For example, the code snippet:

``` js

var IonicAppLib = require('ionic-app-lib');
var options = { port: 8100, liveReloadPort: 35729 };

//Do not load the serve command until it is requested as below:
IonicAppLib.serve.start(options);

```

What's happening above - `require('ionic-app-lib')` is called, which sets up the `getters` for start, serve, run, etc. Then, when the command is called, the `require` for the module then happens, thereby getting the module loaded, and returning it to the caller.

Here's that code to enforce the lazy loading of modules:

``` js

var fs = require('fs'),
    IonicAppLib = module.exports,
    path = require('path');

var camelCase = function camelCase(input) { 
    return input.toLowerCase().replace(/-(.)/g, function(match, group1) {
        return group1.toUpperCase();
    });
};

//
// Setup all modules as lazy-loaded getters.
//
fs.readdirSync(path.join(__dirname, 'lib')).forEach(function (file) {
  file = file.replace('.js', '');
  var command;

  if (file.indexOf('-') > 0) {
    // console.log('file', file);
    command = camelCase(file);
  } else {
    command = file;
  }

  IonicAppLib.__defineGetter__(command, function () {
    return require('./lib/' + file);
  });
});

IonicAppLib.__defineGetter__('semver', function () {
  return require('semver');
});

```


### Testing

I threw together a quick test to ensure that all of the modules were still correctly being accessible:

``` js

var index = require('../index');

describe('index', function() {

  it('should have index defined', function() {
    expect(index).toBeDefined();
  });

  function testForProperty(input) {
    it('should have ' + input + ' available', function() {
      expect(index[input]).toBeDefined();
    });
  }

  var objs = ['browser', 'configXml', 'cordova', 'events', 'hooks', 'info', 
              'ioConfig', 'login', 'logging', 'multibar', 'opbeat', 'project', 
              'share', 'semver', 'serve', 'settings', 'setup', 'start', 'state', 
              'stats', 'upload', 'utils'];

  // Doing it this way to give better failure messages. 
  // Ensures all commands are available currently from
  objs.forEach(function(obj) {
    // expect(index[obj], obj).toBeDefined();
    testForProperty(obj);
  });

});
```

## Gotchas

For one - you'll need to ensure your files adhere to some naming conventions. For our commands, we had some with hyphens (`-`) that we had to account for, as you can see above `if (file.indexOf('-') > 0)`.

Also - if you want to export other modules you can set up other getters, as I did with `semver` above. 

If you want to short circuit lazy loading, go ahead and just export them as normal.

## Performance

We say about a 8x performance increase by lazy loading the modules. 

CLI run times:
```
Not lazy loading modules:   830ms
Lazy loading modules:       200ms
``` 

Enjoy!
