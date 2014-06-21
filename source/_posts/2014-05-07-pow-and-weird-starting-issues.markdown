---
layout: post
title: "Pow and weird starting issues"
date: 2014-05-07 14:56
comments: true
categories: pow rails sinatra ruby
---

Lately I've been getting this weird error from Pow in Rails 4:

`Bundler::GemNotFound: Could not find rake-10.3.1 in any of the sources`

Read more below to see what I did.

In boot.rb:

```
require 'rubygems'
# Set up gems listed in the Gemfile.
ENV['BUNDLE_GEMFILE'] ||= File.expand_path('../../Gemfile', __FILE__)

require 'bundler/setup' if File.exists?(ENV['BUNDLE_GEMFILE'])

```

In config.ru:

```
require ::File.expand_path('../config/environment',  __FILE__)
run Rails.application
```

Hope this helps.