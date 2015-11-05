---
layout: post
title: "npm Production Checklist"
date: 2015-10-17 18:33
comments: true
categories: node npm release
---

Updated Nov 4th, 2015.

I recently read this post by RisingStack over the [Node.js Production Checklist](https://blog.risingstack.com/node-js-production-checklist). 

Since this was aimed at releasing node.js applications for the most part, I wanted to touch base on a 'production checklist' on releasing a npm module.

This post will mainly serve as a work in progress document, as I'm still learning best practices all the time.

Some of the methods I use in my npm release schedule are as follows:

1. Pruning
2. Locking versions
3. Continuous integration (tests, install, etc)
4. Alpha/beta pushes (user testing)
5. [npm-check-updates](https://github.com/tjunnone/npm-check-updates)

## Pruning

Again, straight from the [npm documentation](https://docs.npmjs.com/cli/prune):

> This command removes "extraneous" packages. If a package name is provided, then only packages matching one of the supplied names are removed.
> Extraneous packages are packages that are not listed on the parent package's dependencies list.
> If the --production flag is specified or the NODE_ENV environment variable is set to production, this command will remove the packages specified in your devDependencies. Setting --production=false will negate NODE_ENV being set to production.

This is a great way to ensure you dont have any extra packages you might have installed via `npm install` and either forgot to pass the `--save` flag or were just testing functionality.

You can also use this command inline with the `--production` flag when installing node modules to avoid having the extra cruft of the `devDependencies`, which are mainly used for developing the modules (think testing, etc).

## Locking versions

Theres a few methods to use with npm to lock down your versions. You can use the `npm shrinkwrap` command or specify node modules to bundle in your module with `bundleDependencies`. 

The strategy is, you can either pack those in with your tarball as they are in your `node_modules` folder, or you can lock down those exact versions by storing the exact tarball to download when the user `npm install`s your module.

Edit: I've just learned on a new method to package bundle up node modules by using the `bundledDependencies` attribute in your projects `package.json` file.

## Bundling

By specifying `bundleDependencies` in your package.json, you are telling npm on its publishing process to include those modules listed in the tarball it creates and pushes up to the npm registry. For example, if you go to any npm repo and download the tarball in the url there, unzip it and open it, you'll see those exact node modules in them as you've got in your own `node_modules` folder. 

This effectively locks down your version, at the cost of a larger tarball size the user will do

## Shrinkwrapping

If you've ever done any Rails, you've probably seen the gemfile.lock. The equivalent in Node land is the `npm-shrinkwrap.json` file. 

What the `npm shrinkwrap` command does is looks at your `node_modules` folder and looks at the packages installed there and compares those to what is in your `package.json` file. 

Straight from [npm documentation](https://docs.npmjs.com/cli/shrinkwrap):

> The shrinkwrap command has locked down the dependencies based on what's currently installed in node_modules. The installation behavior is changed to:

> The module tree described by the shrinkwrap is reproduced. This means reproducing the structure described in the file, using the specific files referenced in "resolved" if available, falling back to normal package resolution using "version" if one isn't.

> The tree is walked and any missing dependencies are installed in the usual fasion.

A huge misconception is that shrinkwrap locks down what versions are in your `package.json` file. This is incorrect. Just to reiterate, it will look in your `node_modules` and use that compared to your `package.json` file.

Edit: Another thing to note, if you take a look in your npm-shrinkwrap.json, you'll see the exact URL for that versions tarball to download, which npm cli will use to grab without taking a peep at anything else. This may cause issues for some users, as stated by [Forrest on this Ionic CLI issue](https://github.com/driftyco/ionic-cli/issues/636):

> Due to how shrinkwrap works, it ends up bypassing the npm cache and redownloading every package mentioned in the shrinkwrap each time npm install is run. If users have any issues with their network, or something gets sticky with npm's CDN, the whole install can fail, forcing them to start over again.

Heed this warning, friends.

## Testing

Try to avoid the old addage, 'it worked on my machine', by having a CI server pull your package, run some tests, and even sometimes install the module to make sure it works on other machines besides your own.

I really enjoy using [CircleCI](https://circleci.com/), as it is free for open source projects! You can normally specify a config file that says what version of node/npm to use and the rest is automated.

## Alpha/beta pushes

I covered this in a [previous article about using npm tags](http://jbavari.github.io/blog/2015/10/16/using-npm-tags). 

The idea is, before publishing your version to npm, try doing a alpha/beta push first (to save the version in npm you're about to publish, since there can only be *one* version) to let users `npm install` the module to run some tests before commiting that to the `latest` tag for everyone to install.

## npm Check Updates

There's a nice module that looks at your `package.json` file and looks to see the latest tags on the modules you specify in your dependencies. 

It will give you some heads up if there are latest packages, so you can update if you have too many out of date packages.

Hope this helps!
