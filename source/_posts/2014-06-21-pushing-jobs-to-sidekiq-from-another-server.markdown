---
layout: post
title: "Pushing Jobs to Sidekiq From Another Server"
date: 2014-06-21 00:35
comments: true
categories: redis rails ruby sinatra sidekiq
---

We use [Sidekiq](http://sidekiq.org/) for our background job processing for videos, social integrations, and other tasks. It works great for what it does.

Due to some of technical decisions at work, we have a few servers set up.

* An API server 
* A job processing server
* An analytical dashboard Rails server

The job processing server has all the Sidekiq worker models in it, as you'd expect. We did this to keep all processing in one central location. 

Some use cases we have for it is to have all Push notifications sent from a single location, the job server. However, we need to trigger some of those from our API or analytical dashboard.

## The problem and solution

How do we get workers queued up from other servers without replicating the Worker class in other servers? Since Sidekiq uses [Redis](http://redis.io), we figure'd we'd make a simple `RedisJobPusher` class to push workers to list in Redis that Sidekiq watches. Using this class, we can now queue jobs from other servers.

The class has a core method, `push_to_queue`, that other methods (`push_leg_notification`, etc) call to push the worker name and parameters in redis. The above class assumes it is able to connect to redis. 

It looks like this:

``` ruby
require 'redis'
require 'json'
class RedisJobPusher

	def self.push_leg_notification(user_id, event_id, message, title)
		params = [user_id, event_id, 'leg', message, title, nil]
		RedisJobPusher.push_to_queue('PushNotificationWorker', params)
	end

	def self.push_post_notification(user_id, event_id, message, title, event_user_social_id)
		params = [user_id, event_id, 'post', message, title, event_user_social_id]
		RedisJobPusher.push_to_queue('PushNotificationWorker', params)
	end

	def self.push_to_queue(worker_name, params)
    # using <<  rather than + because it cats instead of newing up string objects
    redisurl = 'redis://' << CONFIG[:redis_server] << ':6379' << '/' << CONFIG[:redis_db_num]

		msg = { 'class' => worker_name, 'args' => params, 'retry' => true }
		redis = Redis.new(:url => redisurl)
		redis.lpush("raisemore_sidekiq:queue:JobWorker", JSON.dump(msg))
	end

end
```

As you can see, there isn't a lot going on here. Simple and easy. Just connect to redis, do a quick `lpush`, and go on your day.