---
layout: post
title: "Using npm tags"
date: 2015-10-16 15:16
updated: 2015-11-5 8:53
comments: true
categories: node npm registry
---

If you do any kind of deployments to npm, you'll probably find learning more about npm tags very helpful.

Just as git tags mark commits in your repository history, npm tags mark a specific version in the npm registry of your published versions.

If you didn't know, npm manages a tag 'latest' that points to the last version you put out with `npm publish`.

The syntax to publish a new version and tag that version with the name beta, use: `npm publish --tag beta`.

## Installing from tags

To have your users install your node module, they just type `npm install`. What that does is looks at npm's latest tag for your repository, and installs that version.

They can also specify a version by passing it after the `@` character after the module name: `npm install module@1.7.3`.

Lets say you have some beta users and always want them to grab the beta, without having to remember the latest version you've pushed.

You just run `npm publish --tag beta`, then have them run `npm install module@beta`.

At any time, they can still specify the beta version `npm install module@1.7.3-beta.1` if they want to hop down or up a version, for example.

## Looking up npm tags

Using the npm CLI, you can easily see the versions by running `npm view ionic dist-tags`. Just replace `ionic` with whatever module you'd want to see.

You can also look up the entire list of versions npm maintains at the url, [registry.npmjs.org/ionic](http://registry.npmjs.org/ionic).

As a fun fact, npm uses tags on its own tool, npm, to mark the `latest`, `latest-2`, `next`, `next-2`, as well as their next versions in their current major/minor versions, for example:

`latest => 3.3.8 next => 3.3.9 latest-2 => 2.14.7 next-2 => 2.14.8 v3.x-latest => 3.3.8 3.x-latest => 3.3.8 3.x-next => 3.3.9 v3.x-next => 3.3.9`

Also, I made a [quick tool](http://jbavari.github.io/registry) to look up tags for you npm version.

## Assigning a tag

Let's say you have a blessed version you now want to promote. It's super simple to set up that tag to the previous version.

Just run `npm dist-tags add ionic-app-lib@0.6.5 latest` and you'll have the `latest` tag point at `0.6.5`.

### Whoops, I accidently published without a tag!

This has happened to me thousands of times. I've run `npm publish` without specifying a tag, and now, my `latest` points at an alpha version. How embarassing.

The scenario is this - my module `ionic-app-lib` currently has its latest tag at `0.6.4`, i'm working on `2.0.0-alpha.18`, and I type in `npm publish`. I wanted to tag this as `alpha`, but because of my haste, now all my users will grab this version blindly without wanting it.

Thankfully, this is easily fixed - we just have to point `latest` tag back to its version.

First, just put latest back to 0.6.4, like so: `npm dist-tags add ionic-app-lib@0.6.4 latest`. 

Now we put alpha to what we wanted originally, like so: `npm dist-tags add ionic-app-lib@2.0.0-alpha.18 alpha`.

Bam! Now everything is back to how we want it!


## Removing tags

This is super simple: `npm dist-tags rm alpha` - this wipes it out.

Hope this helps!
