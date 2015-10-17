---
layout: post
title: "Using npm tags correctly"
date: 2015-10-16 15:16
comments: true
categories: 
---

If you do any kind of deployments to npm, you'll probably find learning more about npm tags very helpful.

Just as git tags mark commits in your repository history, npm tags mark a specific version in the npm registry of your published versions.

If you didn't know, npm manages a tag 'latest' that points to the last version you put out with `npm publish`. 

The syntax to publish a new version and tag that version with the name beta, use: `npm publish --tag beta`.

You can look up the entire list of versions npm maintains at the url, [registry.npmjs.org/ionic](http://registry.npmjs.org/ionic).

As a fun fact, npm uses tags on its own tool, npm, to mark the `latest`, `latest-2`, `next`, `next-2`, as well as their next versions in their current major/minor versions, for example:

`latest => 3.3.8 next => 3.3.9 latest-2 => 2.14.7 next-2 => 2.14.8 v3.x-latest => 3.3.8 3.x-latest => 3.3.8 3.x-next => 3.3.9 v3.x-next => 3.3.9`

Also, I made a [quick tool](http://jbavari.github.io/registry) to look up tags for you npm version.

Hope this helps!
