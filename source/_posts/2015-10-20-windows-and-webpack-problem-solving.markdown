---
layout: post
title: "Windows and Webpack with TypeScript and Babel"
date: 2015-10-20 21:46
comments: true
categories: windows webpack typescript
---

I've recently been diving into the land of [Webpack](https://webpack.github.io) to handle all the heavy lifting of using [Babel](https://babeljs.io) to compile my [TypeScript](www.typescriptlang.org) and [ES6](http://es6-features.org) into ES5 JavaScript to be used in [Ionic 2](http://ionic.io/2).

The current set up I'm working with involves having Webpack use the [awesome-typescript-loader](https://github.com/s-panferov/awesome-typescript-loader) to load up TypeScript and compile the TypeScript files, as well as load up Babel and compile the ES6 JavaScript using Babel.

## The set up

The file structure looks like this:

```
./
  ./www
    ./app
      ./components
        ./datepipe.js
        ./app.ts
```

This worked great on my Mac. However, one thing I ran into on my Windows machine was this particular error:

`Cannot find module "./www/app/app.js"`

Take a look at the [webpack.config.js](https://github.com/driftyco/ionic-conference-app/blob/master/webpack.config.js) in the [ionic-conference-app](https://github.com/driftyco/ionic-conference-app/), with a portion of it below:

```js
/* snipped */
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: "awesome-typescript-loader?doTypeCheck=false&useBabel=true&useWebpackText=true",
        include: /www\/app\//,
        exclude: /node_modules/
      },
      {
        test: /\.ts$/,
        loader: "awesome-typescript-loader",
        include: /www\/app\//,
        exclude: /node_modules/
       }
    ]
  },
/* snipped */
```

Webpack uses loaders to take the files and add them to the final build output. It knows where to get these files from the webpack config module loaders array, where each loader specifies the `include` paths, as per the [webpack docs](https://webpack.github.io/docs/configuration.html#module-loaders):

> include: A condition that must be met

> A condition may be a RegExp, a string containing the absolute path, a function(absPath): bool, or an array of one of these combined with “and”.

Take note of the include line we had at first: `include: /www\/app\//,`, line 7 and 13 in the pasted snipped above.

Sure this will work in a Unix based runtime. If you're running on a Windows machine, these paths may be a problem. As it doesn't understand the `/`. This tip came from Edward McLeod-Jones, who pointed out [this issue](https://github.com/RisingStack/react-way-getting-started/issues/8#issue-94592829).

You might want to try to make RegEx fun, by doing this: 

```js
include: /www(\/|\\)app(\/|\\)/,  // <--- Change the regex to support either type of folder separator`
```

However, since we're doing Node.js, it provides APIs to help us out with cross-platform changes like this with the `path` module.

Do this instead:

```js
var path = require('path');
var wwwPath = path.resolve(__dirname, 'www');
var outputPath = path.join(wwwPath, 'build', 'js');
var appPath = path.join(wwwPath, 'app');
var appJsPath = path.join(appPath, 'app.js');

/* snip */
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: "awesome-typescript-loader?doTypeCheck=false&useBabel=true&useWebpackText=true",
        include: [wwwPath],
        // include: /www(\/|\\)app(\/|\\)/,
        exclude: /node_modules/
      },
      {
        test: /\.ts$/,
        loader: "awesome-typescript-loader",
        // include: /www(\/|\\)app(\/|\\)/,
        include: [wwwPath],
        exclude: /node_modules/
       }
    ]
  },
/* snip */
```
