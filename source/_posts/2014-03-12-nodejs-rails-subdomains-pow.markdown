---
layout: post
title: "Nodejs Rails subdomains POW!"
date: 2014-03-12 23:44
comments: true
categories:
---

I wanted to do a quick write up of how I use [Pow](http://pow.cx/) to run several rails/rack apps and provide subdomains for the rails / rack apps as well as node.js servers! I'll even throw in a Livereload plug in Rails/rack.

## The why

We have several rails projects - an API server, a queue'ing rails project running [Sidekiq](https://github.com/mperham/sidekiq), an admin dashboard using Rails & angular, and a node.js server running a PhoneGap mobile app run in express.

I needed an easy domain set up, something like:

* project.dev
* my.project.dev
* jobs.project.dev
* m.project.dev

I also needed Livereload due to the time it saves, who doesn't right? I do ok, quit asking questions. (But seriously please comment and ask)

## What I did

After installing POW, I created a few symbolic links and a file containing the port that I would run the node.js server. As seen in the [the POW documentation](http://pow.cx/manual) and listed in the same order as above.

``` sh
ln -s ~/Dev/RM/web ~/.pow/project

ln -s ~/Dev/RM/my ~/.pow/my.project

ln -s ~/Dev/RM/jobs ~/.pow/jobs.project
echo 5000 > ~/.pow/m.project
```

Awesome. So now Pow got the rails/racks apps up. Just need to start my node server by simply running ``node app.js``

### Ensure its there

Now that I've got the servers all running, i'll hit them up to check A-OK. Navigate to ``http://my.project.dev``, ``http://m.project.dev``, ``http://project.dev``. Yep, all A-OK.

### Now to set up Livereload.

Snag up a few gems to help Rails/rack do some livereloads automatically for me.

``` rb
gem 'rack-livereload'
gem 'guard'
gem 'guard-livereload'
```

Two things to configure before livereload will work in the rails/rack apps - the first is a config setting in our development.rb file and our Guardfile with a host definition.

The first is development.rb:

```ruby
MyProjectCom::Application.configure do
  #comments
  config.middleware.use Rack::LiveReload
  #the comments are a lie
end
```

Now the magic for the rails/rack apps is the Guardfile:

``` rb
guard 'livereload', host: 'my.project.dev'do
  watch(%r{app/views/.+\.(erb|haml|slim)$})
  watch(%r{app/helpers/.+\.rb})
  watch(%r{public/.+\.(css|js|html)})
  watch(%r{config/locales/.+\.yml})
  # Rails Assets Pipeline
  watch(%r{(app|vendor)(/assets/\w+/(.+\.(css|js|html|png|jpg))).*}) { |m| "/assets/#{m[3]}" }
end
```
Boom! Now I've got Livereload being injected into each of the rails/rack apps I configured and handling all the other business. I just have to sit back and code.

Hope this helps any who may be wanting a similar set up with subdomains with rails/rack & node.js hosted apps.
