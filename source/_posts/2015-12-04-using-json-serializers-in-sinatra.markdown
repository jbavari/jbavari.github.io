---
layout: post
title: "Using JSON serializers in Sinatra"
date: 2015-12-04 11:17
comments: true
categories: ruby sinatra api json
---

I ran into a quick little issue with serializing some of my [Sequel](https://github.com/jeremyevans/sequel) models.

The [official JSON serializer docs](http://sequel.jeremyevans.net/rdoc-plugins/classes/Sequel/Plugins/JsonSerializer.html) are great, I just wanted to shine more light on the issue.

If you're using Sequel models, just throw in the quick line of `plugin :json_serializer`.

``` ruby
# Get our database connection
require_relative "./db"
module ScoreboardApi
  class Team < Sequel::Model(:team)
    plugin :json_serializer
    serialize_attributes :json, :name
  end
end
```

Then, you just use the Sinatra contrib gem to have it json serializer attach:

```
# Web framework
gem "sinatra", "1.4.6", require: "sinatra/base"
# Sinatra addons - JSON, Namespace
gem "sinatra-contrib", "1.4.6"
```

Set up your API routes and spit out JSON:

```
require "bundler"
require "sinatra/base"
require "sinatra/json"
require "sinatra/namespace"

require "./models/scoreboard"
require "./models/team"

Bundler.require

module ScoreboardApi
  class App < Sinatra::Application
    register Sinatra::Namespace
    configure do
      disable :method_override
      disable :static

      set :sessions,
          :httponly     => true,
          :secure       => production?,
          :expire_after => 31557600, # 1 year
          :secret       => ENV["SESSION_SECRET"]
    end

    use Rack::Deflater

    namespace "/api/v1" do
      get "/scores" do
        json :scoreboard => Scoreboard.all
      end

      get "/teams" do
        json :teams => Team.all
      end
    end
  end
end

```

That"s all folks!
