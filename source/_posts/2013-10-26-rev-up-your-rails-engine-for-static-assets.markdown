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

1. A set of controllers to handle the requests for only the mobile application
2. Not bombarding our web server's public folder with all of the mobile html/images/javascript/css
3. Being able to configure the mobile gem based on any environment it may be in
4. Being able to precompile our assets with the rails asset pipeline
5. Handle updating the mobile app by just bundle updating the Gem

Rails Engines - Full vs Mountable
----------

There are two types of Rails Engines available, a full engine and a mountable engine (see this [StackOverflow] article or [Adam St Johns Blog] for more wisdom). The difference lies in how they handle requests. The full engine sets up routes and controllers as if they were part of the hosting app, whereas the mounted engine is mounted in the hosting app and handles its own routing.

Getting started is easy. For a full engine where all requests are handled as part of hosting app, do this:

	rails plugin new NameOfEngine --full

For a mountable engine, where we namespace our requests, do this:

	rails plugin new NameOfMountableEngine --mountable

Let's take a look at how a full engine gets requests routed. For a full engine, we'd have something like this in our Hosting application routing file for everything in our mobile engine.

	Rails.application.routes.draw do
		namespace "mobile" do 
			match "/app" => "mobile#app", :via => :get
			match "/modules" => "mobile#modules", :via => :get
			match "/start" => "mobile#start", :via => :get
			match "/tutorials" => "mobile#tutorials", :via => :gets
			match "/" => "mobile#generic", :via => :get
			# Any many more /mobile routes..
		end

		# Other hosting application routing goes here, and mixes in with our mobile routes.
	end

Taken straight from [Rails Engine Code Comments] -

> ... sometimes you want to isolate your engine from the application, especially if your engine has its own router. To do that, you simply need to call +isolate_namespace+. This method requires you to pass a module where all your controllers, helpers and models should be nested to.

Great, so now we dont' have to uglify our routing file AND we get routing and code reusablity across servers for a mounted engine, that means we have our own routing.rb file in our engine:

	MobileEngine::Engine.routes.draw do
		match "/app" => "mobile#app", :via => :get
		match "/" => "mobile#generic", :via => :get
	end

We specify the isolate_namespace in our engine file:

	module MobileEngine
		class Engine < ::Rails::Engine
			isolate_namespace MobileEngine
		end
	end

Finally we mount our engine in the hosting app:

	Rails.application.routes.draw do
		mount MobileEngine::Engine => "/mobile"

		#Other hosted application routing
	end

The main difference between full and mounted is found in your <NameOfEngineDirectory>/lib/name_of_engine/engine.rb file:

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

Awesome, so now no matter what, any hosted rails application that uses our mounted engine gets all of its routes namespaced by whatever we choose, in this case, /mobile. Awesome.

Engines and routing / matching controllers and views
-----------------------
	
Quick reminder on Rails routing:

> Rails routes are matched in the order they are specified, so if you have a resources :photos above a get 'photos/poll' the show action's route for the resources line will be matched before the get line. To fix this, move the get line above the resources line so that it is matched first.

One thing to note is the way you namespace your engine which is done with using your engine name in your file structure, both in your controllers and engines, such as this structure:

	/mobile_engine
		/app
			/assets
			/controllers
				/mobile_engine
					application_controller.rb
					mobile_controller.rb
			/helpers
				/mobile_engine
			/mailers
				/mobile_engine
			/models
				/mobile_engine
			/views
				/layouts
					application.html.erb
				/mobile_engine
					/mobile
						app.html.erb

So for our mobile_controller.rb, we simply have this:

	# Note the use of Engine.root for finding its path
	require File.join(MobileEngine::Engine.root, 'lib', 'mobile_engine', 'file_we_need') 
	module MobileEngine
		class MobileController < ApplicationController
			before_filter :adjust_format_for_iphone
			layout false
			
			def app

				# Code

			end
		end
	end

Let's look at the full request cycle for mounted engines for "/mobile/app":

* A request for "/mobile/app" goes through our hosting application, no routes are found for "/mobile/app" for the hosting application routing file, so it looks at the engine. 
* The engine has a route, so it then begins looking in the hosting application for the mobile controller
* If the hosting application has no mobile controller, it then begins looking at it's included engines for a mobile controller
* The engine has a controller, so it uses that controller's action and goes to render the view.
* The hosting application begins looking for a view in the hosting application for "views/mobile/app"
* If the hosting application did not have a view, it then looks for the view in the engine "views/mobile_engine/mobile/app"

Why is this important? I had an issue where I still had a view in my hosting application that was being used over my engine views - so always note that the hosting application trumps its engines controllers and views. Full overriding capabilities is always the control of the hosting application.

Public folder mashing &amp; configuration
-------------

The second point in choosing an engine is leaving all of our mobile assets in our mobile engine gem's public folder so we don't have to worry about getting those assets copy/pasted between projects that may want the mobile code. Just plunk your JS/CSS/HTML in your public folders as you normally would and make this modification in your engine.rb file in your engine gem:

	module MobileEngine
	  class Engine < ::Rails::Engine
	    isolate_namespace MobileEngine

	    # Add any configuration settings to your Engine here

	    config.mobile_app_name = "mobile_raisemore"
		config.mobile_app_containing_directory = File.join(root, "vendor").to_s
		config.mobile_app_path = File.join(root, "vendor", "mobile_raisemore").to_s
		config.mobile_theme_path = File.join(root, "public", "mobilethemes").to_s
		config.mobile_repo_url = "git@bitbucket.org:raisemore/mobile_raisemore.git"
		config.local_asset_js_path = File.join(root, "vendor", "assets", "javascripts", "mobile").to_s
		config.local_asset_css_path = File.join(root, "vendor", "assets", "stylesheets", "mobile").to_s
		config.local_public_mobile_path = File.join(root, "public", "mobile").to_s

	    # Initializer to combine this engines static assets with the static assets of the hosting site.
	    initializer "static assets" do |app|
			app.middleware.insert_before(::ActionDispatch::Static, ::ActionDispatch::Static, "#{root}/public")
		end
	  end
	end


Then in our hosting application, we can use those configuration settings via an initializer:

	MobileEngine::Engine.config.mobile_app_name = "RaiseMore"

Great, we've isolated our namespace to leave all requests for mobile_engine, as well as setting up some configuration settings for what the mobile code may depend on, as well as merged our engine's public folder with the hosting site application.

One thing to note, when using an Engine, it sets up several helpers for you to use. One of which I use there is root, which is the root path of the engine, not the root path of the hosting application. To get the root path of the application, you can use main_app, like this:

	<%= link_to "Home", main_app.root_path %>

Precompiling any assets
----------------

No difference here, place your assets in your normal locations. Works just like the [Rails Asset Pipelines Guide], and documented nicely for gems by [Stephen Balls Blog], but essentially still the same.

My file structure for assets looks like this:

	/mobile_engine
		/vendor
			/assets
				/images
				/javascripts
					/mobile
						jquery.js
						angular.js
						...many more...
					mobile.js
				/stylesheets

Mobile.js is nothing special, and looks like this:

	//= require ./mobile/

This will package up all javascript files in the /assets/javascripts/mobile folder to be combined and accessed by the hosting application, just run the assets precompile:

	rake assets:precompile

Now access them as usual

	http://hostingapp.com/assets/mobile.js

The big picture
==============


[RailsCasts]: http://railscasts.com/episodes/277-mountable-engines "RailsCasts - Mountable Engines"
[RailsGuides]: http://guides.rubyonrails.org/engines.html "Rails Guides - Getting Started with Engines"
[StackOverflow]: http://stackoverflow.com/questions/6118905/rails-3-1-engine-vs-mountable-app "Stackoverflow Article on Full Engine vs Mountable Engine"
[Adam St Johns Blog]: http://www.astjohn.ca/2011/08/06/rails-31-engines-mountable-or-full-part-1 "Rails 3.1 Engines – Mountable or Full? – Part 1"
[Rails Engine Code Comments]: https://github.com/rails/rails/blob/master/railties/lib/rails/engine.rb "Rails / Engine.rb Line 197"
[Rails Asset Pipelines Guide]: http://guides.rubyonrails.org/index.html "Rails Asset Pipeline"
[Stephen Balls Blog]: http://rakeroutes.com/blog/write-a-gem-for-the-rails-asset-pipeline/ "Write a Gem To Serve Static Assets On The Rails Asset Pipeline"