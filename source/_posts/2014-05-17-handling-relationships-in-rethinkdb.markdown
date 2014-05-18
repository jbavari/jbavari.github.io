---
layout: post
title: "Handling Relationships in RethinkDB"
date: 2014-05-17 23:06
comments: true
categories: rethinkdb nosql docdb
---
Lately I've been playing a lot with [RethinkDB](http://rethinkdb.com) and I'm in love with it. Such a sweet document database, amazingly beautiful web interface, and easy to use API's in three different languages. I started up a side project that involves some relational data, and ran into a few bumps along the road.

I'm writing this post to share some of the knowledge I've acquired along the way, and hopefully some will find it helpful.

## The problem
I'm using a doc db because I'm still not sure of my database schema, and since its mostly a prototype, I need something flexible. The project is for physical therapy patients involving rehabilitation programs. Each program is comprised of several exercises, and a program is assigned to one user. A user can have multiple 

Eat your ER heart out:

{% img [pic] /images/PtMotions.png [250] [250] [PT Motions ER Diagram [ER Diagram]] %}

### Technologies Used
I wanted to keep it light, so I chose using [Sinatra](http://www.sinatrarb.com/) for my API and [Ionic Framework](http://ionicframework.com) for my mobile application. BTW - when it comes to choosing a framework for Cordova, I suggest trying Ionic. They are crushing it.

## Setting up the tables

First I made a dataload.rb file, which would be run on the init of my server which would set up my database, set up the tables, and dump some initial data in the tables. It looked something like this:

``` ruby InitialData.rb
require 'rethinkdb'

# We will use these settings later in the code to connect 
# to the RethinkDB server.
RDB_CONFIG = {
	:host => ENV['RDB_HOST'] || 'localhost', 
	:port => ENV['RDB_PORT'] || 28015,
	:db   => ENV['RDB_DB']   || 'PtMotions'
}

# A friendlly shortcut for accessing ReQL functions
r = RethinkDB::RQL.new

@rdb_connection = r.connect(:host => RDB_CONFIG[:host], :port => RDB_CONFIG[:port], :db => RDB_CONFIG[:db])

@users = [
	{ 
		:clinicId => 'At Home PT',
		:patientId => 'jbavari'
	}
]

user_id = nil

@users.each do |user|
	begin
		result = r.table('Users').insert(user).run(@rdb_connection)
		# Grab user id from result to use later for assigning the program
		user_id = result['generated_keys'][0]
	rescue
		p 'Error: ' + result.to_s
	end
end

@exercises = [{
          :name => 'Resisted Right Shoulder Internal/External Rotation',
          :startingPosition => 'Lying on your back with your legs bent with your right hand holding a kettle bell.',
          :description => 'Lift the kettle bell straight up in the air and hold. Pull your shoulder into the ground and away from your ear. Slowly rotate your arm all the way in then all the way out without letting your arm sway',
          :whatYouFeel => 'Strengthing in your right shoulder',
          :videoUrl => 'http://ptmotions.com/ptm_mp4_768_432/s11t02_063.mp4'
        },
        {
          :name => 'Side Resisted Right Shoulder Internal/External Rotation',
          :startingPosition => 'Lying on your left side with your right hand holding a kettle bell',
          :description => 'Lift the kettle bell straight up in the air and hold. Pull your shoulder down away from your ear. Slowly rotate your arm all the way in, then all the way out without letting your arm sway',
          :whatYouFeel => 'Strengthing in your right shoulder',
          :videoUrl => 'http://ptmotions.com/ptm_mp4_768_432/s11t02_065.mp4'
        }
]

exercise_list = Array.new

@exercises.each do |exercise|
	begin
		result = r.table('Exercises').insert(exercise).run(@rdb_connection)
		exercise_list.push result['generated_keys'][0]
	rescue
		p 'Error: ' + result.to_s
	end
end

@joshs_program = { 
	:name => 'Joshs Shoulder Rehab',
	:notes => 'Focus on keeping core tight',
	:instructions => {
		:howOften => '3 sets per day',
		:howMany => '15 per side'
	},
	:exercises => exercise_list,
	:userId => user_id
}

begin
	result = r.table('Programs').insert(@joshs_program).run(@rdb_connection)
rescue
	p 'Error: ' + result.to_s
end
```

Above you'll see I have a list of exercises, as they are inserted I add their ID's to an array. I then take that array and use that to store in `@joshs_program` so that I can set up a relationship with exercises.

## Retrieving data

Now that I have programs with an array of exercises, I need to get all the exercises by the program. First - I need a query that will get me all of my exercises by program ID - so thats similar to a type of inner join, or a SQL equivalent of `SELECT IN`. Luckily, RethinkDB has awesome documentation about [SQL-to-RQL](http://rethinkdb.com/docs/sql-to-reql/) and [data modeling](http://rethinkdb.com/docs/data-modeling/).

From the documentation, they recommend doing the following:

``` python
r.table("users").filter(lambda doc:
    r.expr(["Peter", "John"])
        .contains(doc["name"])
)
```

However, the example is in Python, so you'll need to do a little more work to get it in Ruby.

This led me to take a different path in RQL. I found out how to do a `SELECT IN` type query, and in Ruby it looks like this with `inner_join`:

``` ruby
@programId = params[:programId] || '37feebf9-54ce-45f5-ba76-d13fe634b035'
exercises = r.table("Programs")
		.filter({'id' => @programId})
		.inner_join( r.table("Exercises")) { |p, e| 
			p['exercises'].contains( e['id'] ) 
		}
		.zip()
		.without('exercises', 'userId')
		.order_by(r.desc('created_at'))
		.run(@rdb_connection)
```

You'll see I'm using the RQL `inner_join`, and as part of my lamba I use the table attribute `p['exercises']` which contains my array of exercise ID's, then using the `contains` method on my exercise table `e['id']`. It works wonderfully. I'm not sure if it is the best way to handle this, and I'm still a RethinkDB newbie so this was a good workout for me.

### The API code

The rest of my API code relied heavily on the RethinkDB [sample app - Pastie](http://www.rethinkdb.com/docs/examples/sinatra-pastie/). The really interesting joins are found around line 77.


I'm including my own version here to help give some ideas how I'm setting up my API:

``` ruby server.rb
require 'sinatra'
require 'rethinkdb'
require 'json'

RDB_CONFIG = {
  :host => ENV['RDB_HOST'] || 'localhost', 
  :port => ENV['RDB_PORT'] || 28015,
  :db   => ENV['RDB_DB']   || 'PtMotions'
}

r = RethinkDB::RQL.new

# The pattern we're using for managing database connections is to have **a connection per request**. 
# We're using Sinatra's `before` and `after` for 
# [opening a database connection](http://www.rethinkdb.com/api/ruby/connect/) and 
# [closing it](http://www.rethinkdb.com/api/ruby/close/) respectively.
before do
	headers 'Access-Control-Allow-Origin' => '*', 
            'Access-Control-Allow-Methods' => ['OPTIONS', 'GET', 'POST']
  begin
    # When openning a connection we can also specify the database:
    @rdb_connection = r.connect(:host => RDB_CONFIG[:host], :port => RDB_CONFIG[:port], :db => settings.db)
  rescue Exception => err
    logger.error "Cannot connect to RethinkDB database #{RDB_CONFIG[:host]}:#{RDB_CONFIG[:port]} (#{err.message})"
    halt 501, 'This page could look nicer, unfortunately the error is the same: database not available.'
  end
end

# After each request we [close the database connection](http://www.rethinkdb.com/api/ruby/close/).
after do
  begin
    @rdb_connection.close if @rdb_connection
  rescue
    logger.warn "Couldn't close connection"
  end
end

get '/' do
  @snippet = {}
  erb :new
end

post '/add' do
	@user = { :clinicId => params[:clinicId], :patientId => params[:patientId] }
	# result = r.table('Users').insert(@user).run(@rdb_connnection)
	result = r.table('Users').insert(@user).run(@rdb_connection)


	if result['inserted'] == 1
		redirect "/#{result['generated_keys'][0]}"
	else
		logger.error result
		redirect '/'
	end
end

get '/programs/:userId' do 
	content_type :json
	@userId = params[:userId].downcase
	max_results = params[:limit] || 10
	results = r.table('Programs').
		filter('userId' => @userId).
		# pluck('id', 'name', 'created_at').
		without('userId').
		order_by(r.desc('created_at')).
		limit(max_results).
		run(@rdb_connection)

	results.to_json
end

get '/exercises/:programId' do
	content_type :json

	@programId = params[:programId] || '37feebf9-54ce-45f5-ba76-d13fe634b035'

	exercises = r.table("Programs")
		.filter({'id' => @programId})
		.inner_join( r.table("Exercises")) { |p, e| 
  			p['exercises'].contains( e['id'] ) 
  		}
  		.zip()
  		.without('exercises', 'userId')
  		.order_by(r.desc('created_at'))
  		.run(@rdb_connection)

	exercises.to_json
	# exercise_ids.to_json

end

get '/getuser/:patientId' do
	content_type :json
	user = r.table('Users')
		.filter({'patientId' => params[:patientId]})
		.run(@rdb_connection)

	user.first.to_json
end
```

That's all folks! Hope this helps some in understanding how to do foreign key references in RethinkDB!