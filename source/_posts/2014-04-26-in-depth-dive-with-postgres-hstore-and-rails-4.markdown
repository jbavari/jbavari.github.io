---
layout: post
title: "In depth dive with Postgres Hstore and Rails 4"
date: 2014-04-26 12:08
comments: true
categories: 
---
I had a unique little situation pop up that needed a little more flexibility when it came to storing data in the db. We use Postgres at RaiseMore because we respect ourselves, so naturally, I wanted to take a swing using some Hstore options for our ever changing data schema.

My intention is not to cover the basics of getting started with Rails 4 and [Postgres HStore](http://www.postgresql.org/docs/9.3/static/hstore.html), so [read at Honey Co](http://tastehoneyco.com/blog/postgresql-array-and-hstore-column-reference/?utm_source=rubyweekly&utm_medium=email/) or [here at inopinatus](http://inopinatus.org/2013/07/12/using-arrays-of-hstore-with-rails-4/) to get started.

## What I needed

Simple, to store a few bits of data about a communication - primarily the subject, message, date/time, and what networks it was sent out on. It may or may not have some of these fields, and the networks may or may not change in the future. This sounds perfect for HStore.

First I started with a simple schema:

```
CREATE TABLE comm_logs (
	id serial NOT NULL,
	user_id integer,
	history hstore
)
```

At first, I just wanted to store when a message was sent and on what networks. I figured I'd just have an AR model with one hstore column and everything would fit into that. It looked like this:

```
class CommunicationLogging < ActiveRecord::Base
	def self.log(user_id, network, message, subject = nil)
		comm = CommunicationLogging.where('user_id = ?', user_id).first
		if comm.nil?
			comm = CommunicationLogging.new
			comm.user_id = user_id
			# Storing network as an array incase they decide to send to another network after this.
			comm.history = { 'message' => message, 'subject' => subject, 'network' => [network], 'time' => DateTime.now }}
		else 
			# Add history to array stored in network
			comm.history['network'].push(network)
		end
		comm.history_will_change!
		comm.save!
	end
end
```

Pretty easy right? I ran into some difficulties REAL fast. The first was from JSON serialization. When I did this:

```
# In Rails Console
CommunicationLogging.find(4).history['network']
=> "[\"facebook\", \"twitter\"]" 
```

It gave me a nice FAT serialized version of a Hash array. What good does a string do me? I want my object! BLEH! 

We still have to get this thing working, so lets proceed anyway and just do some manual converions with PostgreSQL's awesome `to_json` functionality.

Our result:

```
"{"c": "networks", "networks": "[\"facebook\", \"twitter\"]"}"
```

Cool, so its gonna be nasty still. Ok, how about just using Rails to_json method:

```
"{\"id\":11,\"event_user_id\":null,\"history\":null,\"networks\":{\"c\":\"networks\",\"networks\":\"[\\\"facebook\\\", \\\"twitter\\\"]\"}}"
```

Thanks, but no thanks. I'm pretty set on having an array of values instead of some manual labor on converting those values.

I was learning real fast that storing arrays in hstore was going to be a challenge. The next stab I wanted to take was to simplify the storage and retrieval as well as using natural arrays.

NOTE: I changed the way I attacked the problem here partly because I was doing it wrong. Hopefully you can learn from my mistakes? :-)

This was my next stab, altering the table structure just a bit:

```
CREATE TABLE communication_logs (
	id serial NOT NULL,
	user_id integer,
	history hstore[]
	networks hstore
)
```

What I did here was harness the awesome power of PostgreSQL's arrays and hstore. Taking this thing to the limit. I did this for two reasons:

* Constraints changed, we could send multiple communications out on multiple networks at any given time
* I wanted a log of history with whatever pieces of data may or may not be there
* Be able to quickly get the networks sent out per user

Now my AR model is decorated with [store_accessor](http://api.rubyonrails.org/classes/ActiveRecord/Store.html) to give me model attributes for the networks. It also stores the log of messages in an array naturally through the model, and accessed as a real HSTORE with array values (instead of json, yay).

```
class CommunicationLogging < ActiveRecord::Base
	store_accessor :networks, :facebook, :twitter, :email, :sms, :push

	def set_network(network)
		# for brevity only one listed
		case network.downcase
		when 'twitter'
			self.twitter = true
		end
	end

	def self.log(user_id, network, message, subject = nil)
		comm = CommunicationLogging.where('user_id = ?', user_id).first
		if comm.nil?
			comm = CommunicationLogging.new
			comm.user_id = user_id
		end

		comm.set_network(network)

		history_log = { 'message' => message, 'subject' => subject, 'network' => network, 'time' => DateTime.now }
		comm.history.push(history_log)


		comm.networks_will_change!
		comm.history_will_change!
		comm.save!
	end
end
```

So what happens when I to_json my fields now in PostgreSQL?

``` 
// Networks
"{"twitter": "true"}"

// History
"[{"time": "2014-04-27T10:15:50-05:00", "message": "asf", "network": "twitter", "subject": "asd"}]"
```

And rails?

```
# Networks
"{"twitter":\"true"}" 

# History
"[{"time":"2014-04-27T10:15:50-05:00","message":"asf","network":"twitter","subject":"asd"}]" 
```

Beautiful.

I had a lot of fun using PostgreSQL and Rails 4. I didn't find a lot of in-depth knowledge on it so I wanted to shed some light on the topic and hope this would push someone else who might be considering to try it out to give it a go.

I'd like to follow up this post with another article on how to search these bad boys. 

In closing:

* I will definitely use hstore more in the future. I like the freedom to just store whatever I want
* I need to reach out to the Rails team and see what I can do about improving the array support in Active Record
* I hope you try it out as well

### Additional Resources

* [Postgres Guide on HStore](http://postgresguide.com/sexy/hstore.html)
* [Mike Countermash's guide to Hstore with Rails 4](http://mikecoutermarsh.com/using-hstore-with-rails-4/)
* [Platform on Rails - Enabling PostgreSQL Hstore in Rails 4](http://platformonrails.wordpress.com/2013/03/17/enabling-postgresql-hstore-with-rails-4/)
* [RemarkableLabs - A love affair with PostgreSQL [Rails 4 Countdown to 2013]](http://blog.remarkablelabs.com/2012/12/a-love-affair-with-postgresql-rails-4-countdown-to-2013)