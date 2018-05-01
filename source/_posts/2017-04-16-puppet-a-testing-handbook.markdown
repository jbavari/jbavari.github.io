---
layout: post
title: "Puppet: A Testing Handbook"
date: 2017-04-16 13:09
comments: true
categories: puppet testing vagrant
---

* Explain why the post - job required, growing pains, need for stability and health of the repo
* Why to test
* What to test
* How to test
** Lint - Rake file
** Parser - rake file with globbing to run easier
** Rspec - spec type tests to run on puppet code (syntax mainly)
** Beaker - run tests on provisioned VM to ensure correct

Cover:

puppet-lint
puppet parser validate <manifest.pp>
puppet-rspec - A gem that runs rspec unit tests on a module (Based on compiled catalog)
Beaker

-----------------------

Part of my role at work is managing a fleet of robots, servers, and other
infrastructure responsible for running our business. Due to the nature of our
business, we run within customer warehouses.

Being a one man operation, one of my main concerns is keeping all the systems
stable and proper working conditions. I am not the only developer touching our
puppet code, but I'm the one responsible for the system(s).

As I embarked on the journey to add reliability to our infrastructure, something
very clear came up: there's a lot of information about testing puppet, but most
of it is fractured, out of date, or hard to understand. [See this slideshow from 2016 about the state of testing puppet](https://www.slideshare.net/PuppetLabs/puppetconf-2016-the-future-of-testing-puppet-code-gareth-rushgrove-puppet?qid=eee7d5c2-f52e-4ceb-8000-42e4fc174721&v=&b=&from_search=2).

I'm writing this post up to act as a handbook of sorts for testing puppet, as
well as a 'repository' for testing puppet.

# Testing resources

* [Puppet-lint](http://puppet-lint.com/) - Useful for linting your puppet code
* [Rspec Puppet](http://rspec-puppet.com/) - Rspec tests for puppet code
* [Puppet: module smoke testing](https://docs.puppet.com/puppet/4.10/tests_smoke.html)
* [Slideshow about all things puppet](http://www.example42.com/tutorials/PuppetTutorial/#slide-80)
* [Extending Puppet - Second Edition](https://www.safaribooksonline.com/library/view/extending-puppet-/9781785885686/)
* [Beaker](https://github.com/puppetlabs/beaker/)
* [Getting Started Puppet Acceptance Tests With Beaker](http://www.xkyle.com/getting-started-puppet-acceptance-tests-with-beaker/)
* [Great example of testing - Puppet MySQL module](https://github.com/puppetlabs/puppetlabs-mysql/tree/master/spec)
* [Puppetlabs Spec Helper](https://github.com/puppetlabs/puppetlabs_spec_helper)
* [Puppet Cookbook - Simple Syntax Check](https://www.puppetcookbook.com/posts/simple-syntax-check-manifests.html)
* [Testing Puppet](http://www.cakesolutions.net/teamblogs/testing-puppet)
