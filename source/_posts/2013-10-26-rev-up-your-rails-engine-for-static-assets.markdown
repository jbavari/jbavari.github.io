---
layout: post
title: "Rev Up Your Rails Engine For Static Assets"
date: 2013-10-26 19:32
comments: true
categories: 
---

Lately we've had the desire to move some of our rails services / middleware from our main web project to Rails Engines as gems to help us scale out and reuse that functionality across servers and sites.

Haven't heard of Rails Engines? Rails engines are essentially miniture rails applications that provide funtionality to its host application - you could think of engines of what used to be Rails plugins in Rails 2 and upgraded in Rails 3.2. [RailsGuides] is a great place to start, [RailsCasts] has a nice walk through. I want to focus on showing some tips, tricks, and pitfuls I've encountered to help you be more successful.

Why I started using Rails Engines
================

For our needs, we had to display a mobile version of our application on our main website webserver. All of the code for the mobile application was hosted in another git repository and had different themes that needed to be applied. The big question was, how do we have this hosted on different web nodes and control our changes from the mobile repository?

There are so many different ways to approach this problem, the method I chose was to try out a Rails Engine. The main reasons this was attractive was:

* A set of controllers to handle the requests for only the mobile application
* Not bombarding our web server's public folder with all of the mobile html/images/javascript/css
* Being able to precompile our assets with the rails asset pipeline
* Handle updating the mobile app by just bundle updating the Gem

Rails Engines - Full vs Mountable 
----------

There are two types of Rails Engines available, a full engine and a mountable engine (see this [StackOverflow] article or [Adam St Johns Blog] for more wisdom). The difference lies in how they handle requests. The full engine sets up routes and controllers as if they were part of the hosting app, where as the mounted engine is mounted in the hosting app and handles its own routing.

For a full engine, we'd have something like this in our Hosting application routing file for everything in our mobile engine.

	Rails.application.routes.draw do
		match "/app" => "mobile#app", :via => :get
		match "/" => "mobile#generic", :via => :get
	end

Taken straight from [Rails Engine Code Comments] -

> However, sometimes you want to isolate your engine from the application, especially if your engine has its own router. To do that, you simply need to call +isolate_namespace+. This method requires you to pass a module where all your controllers, helpers and models should be nested to.

For a full engine where all requests are handled as part of hosting app, do this:

	rails plugin new NameOfEngine --full

For a mountable engine, do this:

	rails plugin new NameOfMountableEngine --mountable

This will set up the big difference, which is found in your <NameOfEngineDirectory>/lib/name_of_engine/engine.rb file:

Full:

	module FullEngine
		class Engine < ::Rails::Engine
		end
	end

Mounted:

	module MountedEngine
		class Engine < ::Rails::Engine
		    isolate_namespace MobileEngine
	    end
    end

For our needs, every request for our mobile request should be handled by our mobile engine, therefore we declare our routing for our engine.

	MobileEngine::Engine.routes.draw do
		# We have two requests, the themed app, and the generic
		match "/app" => "mobile#app", :via => :get
		match "/" => "mobile#generic", :via => :get
	end

With these two routes, depending on how we choose to use this 

Getting Started
---------

Rails 3.2 gives you a set of generator tasks 

[RailsCasts]: http://railscasts.com/episodes/277-mountable-engines "RailsCasts - Mountable Engines"
[RailsGuides]: http://guides.rubyonrails.org/engines.html "Rails Guides - Getting Started with Engines"
[StackOverflow]: http://stackoverflow.com/questions/6118905/rails-3-1-engine-vs-mountable-app "Stackoverflow Article on Full Engine vs Mountable Engine"
[Adam St Johns Blog]: http://www.astjohn.ca/2011/08/06/rails-31-engines-mountable-or-full-part-1 "Rails 3.1 Engines – Mountable or Full? – Part 1"
[Rails Engine Code Comments]: https://github.com/rails/rails/blob/master/railties/lib/rails/engine.rb "Rails / Engine.rb Line 197"