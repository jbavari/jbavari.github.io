---
layout: post
title: "Using npm scripts for Cordova"
date: 2014-06-19 00:25
comments: true
categories: npm nodejs cordova
---

For those of you that don't know, Cordova has [hooks](https://github.com/apache/cordova-lib/blob/master/cordova-lib/templates/hooks-README.md) that can run on each of the specific build tasks that Cordova goes through. For example the task that happens after all the platform specific code is set up, the `after_prepare` hook is fired.

Tonight I had the pleasure of collaborating with my friend [Ross Martin](https://twitter.com/MountainDoofus) over a project he put together. The project is called [cordova-uglify](https://github.com/rossmartin/cordova-uglify) and it focuses on uglifying/minifying JavaScript before building your Cordova app. See his comment in response to [Dan Moore's Accessing more build information from your Cordova CLI hooks](http://www.mooreds.com/wordpress/archives/1425) blog for more information on why.

The project was having an `after_prepare` hook in Cordova to uglify the application's JavaScript once the code is put in place for iOS/Android. 

This project Ross put together was interesting. There have been some blogs on [using hooks in Cordova](http://www.mooreds.com/wordpress/archives/1197) as well as [three hooks every cordova / phonegap project needs](http://devgirl.org/2013/11/12/three-hooks-your-cordovaphonegap-project-needs/#comments). Moving forward, it'd be nice to make some of these hooks and share them out much like we share packages on npm.

The only problem with using them as packages, is we need to place code somewhere outside of the `node_modules` folder (where the package will be installed from `npm install`).

This is what we'd get if we just used npm install cordova-uglify (notice uglify.js is only in `node_modules` directory):

```
// ./CordovaProjectDirectory
//		/hooks
//		/node_modules
//			/cordova-uglify
//				/after_prepare
//					/uglify.js
//				/scripts
//					install.js
//					uninstall.js
//		/www

```

What we actually want has our uglify.js in our `hooks/after_prepare` directory:

```
// ./CordovaProjectDirectory
//		/hooks
//			/after_prepare
//				uglify.js
//		/node_modules
//			/cordova-uglify
//				/after_prepare
//					uglify.js
```

Then it hit me, we can use npm scripts!

## The idea

Let's package up Cordova tools, publish on npm, and then use [npm scripts](https://www.npmjs.org/doc/misc/npm-scripts.html) to install/uninstall them as necessary.

npm gives its package owners the ability to run scripts on various events in the npm life cycle. The interesting ones we care about are those being `postinstall` and `postuninstall`.

The idea is this:

* You run `npm install cordova-uglify`
* After installing, npm runs the `postinstall` script to copy files into proper location
* Profit $$$

Ross put me up to the challenge, so I took it up. Here's what I put our package.json to be:

``` js
{
  "name": "cordova-uglify",
  "version": "0.0.5",
  "description": "Cordova hook that allows you to uglify or minify your apps JavaScript and CSS.",
  "homepage": "https://github.com/rossmartin/cordova-uglify",
  "keywords": [
    "cordova",
    "uglify",
    "minify",
    "hook",
    "hooks"
  ],
  "peerDependencies" : {
    "yuicompressor" : "2.4.8"
  },
  "author": "Ross Martin",
  "license": "MIT",
  "bugs": {
    "url": "https://github.com/rossmartin/cordova-uglify/issues"
  },
  "readmeFilename": "README.md",
  "scripts": {
    "postinstall": "node scripts/install.js",
    "postuninstall": "node scripts/uninstall.js"
  }
}
```

To which I then created a quick script to do the file copying - `scripts/install.js`

``` js
#!/usr/bin/env node

var fs = require('fs')
var path = require('path')
var cwd = process.cwd() //proj directory
var scriptPath = __dirname //node_modules/cordova-uglify/scripts

var paths = [ path.join(cwd, '../../hooks'), path.join(cwd, '../../hooks/after_prepare') ];

for(var pathIndex in paths) {
	if(!fs.existsSync(paths[pathIndex])) {
		console.log('Creating directory: ', paths[pathIndex])
		fs.mkdirSync(paths[pathIndex]);
	}	
}

var uglifyScriptPath = path.join(cwd, 'after_prepare', 'uglify.js');

var uglifyFile = fs.readFileSync(uglifyScriptPath);
console.log('uglifyFile: ', uglifyFile)
var uglifyAfterPreparePath = path.join(paths[1], 'uglify.js')

console.log('Creating uglify hook: ', uglifyAfterPreparePath)
fs.writeFileSync(uglifyAfterPreparePath, uglifyFile);

```

As well as uninstalling it - `scripts/uninstall.js`:

``` js
#!/usr/bin/env node

//After uninstall script to remove the uglify.js script from the users hooks/after_prepare directory

var fs = require('fs')
var path = require('path')
var cwd = process.cwd()

var uglifyJsPath = path.join(cwd, '../../', 'hooks', 'after_prepare', 'uglify.js')

fs.unlink(uglifyJsPath)
console.log('Removed: ', uglifyJsPath)
```

Simple and sweet.

Now, is it an anti-pattern? I'm not sure. 

Does it make it easier for other developers to get started and using it? Yes.

That's exactly what I was going for.

Thanks Ross for planting the idea in my head, and more importantly, for the challenge to learn.

