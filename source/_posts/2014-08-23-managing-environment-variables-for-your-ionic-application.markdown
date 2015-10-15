---
layout: post
title: "Managing Environment Variables for your Ionic Application"
date: 2014-08-23 20:43
comments: true
categories: ionic angularjs
---
I've been lucky enough to be developing with the Ionic framework lately. One issue I keep running into is - how do I manage some environment variables (base api url, debug enabled, upload url, etc) across my code, both tests and application.

I'd like to share a little solution I've come up with. It may not be the BEST solution to take, but it has been working great for me.

## The idea

I'd like to have some files that I can preprocess - say 'AppSettings.js' that will expose some variables for the rest of my application to use. This could contain those pesky variables that I will need to change frequently.

I put my preprocess file templates in my root folder named `templates`. I will have that file contain my preprocess variables. I will spit out the preprocessed file as `www/js/appsettings.js` file once its been preprocessed.

That preprocessed file will be used in both my `index.html` and my `karma.conf.js` for testing.

I harness [gulp](http://gulpjs.com/) a lot, however you can still use [Grunt](http://gruntjs.com/) or just plain node.js as well.

My `AppSettings.js` file:

``` js
AppSettings = {
  // @if ENV == 'DEVELOPMENT'
  baseApiUrl: 'http://localhost:4400/',
  debug: true
  // @endif
  // @if ENV == 'TEST'
  baseApiUrl: 'https://test.api-example.com/'
  // @endif
  // @if ENV == 'PRODUCTION'
  baseApiUrl: 'https://api-example.com/'
  // @endif
}
```

In my preprocess file - you can see I have some `@if ENV == ''` statements beginning with `//` - these will be replaced if the `if` statement is true. (Duh)

## Gulp Preprocess Task

I like [gulp preproces](https://www.npmjs.org/package/gulp-preprocess). Install with `npm install --save-dev gulp-preprocess`.

My gulpfile contains 3 tasks - `dev` / `test_env` / and `prod`, looking like this:

``` js
var preprocess = require('gulp-preprocess');
gulp.task('dev', function() {
  gulp.src('./template/appsettings.js')
    .pipe(preprocess({context: { NODE_ENV: 'DEVELOPMENT', DEBUG: true}}))
    .pipe(gulp.dest('./www/js/'));
});

gulp.task('test_env', function() {
  gulp.src('./template/appsettings.js')
    .pipe(preprocess({context: { NODE_ENV: 'TEST', DEBUG: true}}))
    .pipe(gulp.dest('./www/js/'));
});

gulp.task('prod', function() {
  gulp.src('./template/appsettings.js')
    .pipe(preprocess({context: { NODE_ENV: 'PRODUCTION'}}))
    .pipe(gulp.dest('./www/js/'));
});
```

## Invocation

Now I just have to fire off `gulp dev` for my development settings, `gulp test_env` for test settings, and `gulp prod` for production settings.

As I mentioned - this works great for my tests, as I include the preprocessed file in `karma.conf.js` so my tests can use `AppSettings.baseApiUrl` (make sure you have your tests call the `dev` task first!)

I hope this helps any who may have some environment variables they need to change between environments!
