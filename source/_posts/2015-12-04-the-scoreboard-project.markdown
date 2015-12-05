---
layout: post
title: "The Scoreboard Project"
date: 2015-12-04 17:22
comments: true
categories: ruby sinatra javascript api cli
---

Lately I've been wanting to dig more into some technologies I've been wanting to explore and gain more experience. Not only this, but I wanted to make sure my dev workflow was still improving, my tools were getting sharpened, and I was re-establishing the best practices as much as I could.

Those specific technologies I wanted to dig into was:

* Building a CLI in Ruby, using [Thor](https://github.com/erikhuda/thor)
* A [Sinatra](http://sinatrarb.com) Modular API
* Solifying [Sequel](https://github.com/jeremyevans/sequel) Model usage and JSON serialization
* Building a dashboard using [Dashing](https://github.com/Shopify/dashing)
* Diving more into [Rubocop](https://github.com/bbatsov/rubocop) for Ruby static code analysis
* Automated Code Review using [CodeClimate](http://codeclimate.com)

I found a way to connect all the dots in what I'm calling the scoreboard project. I chose these technologies because it would let me shine up my ruby/sql skills without a framework carrying me the way. (Although they mostly did anyway!)

This blog post will go over the idea of making an API around scoreboards. There will be a simple CLI tool to gather scores on 'games'. Those scores will be sent to the API, to store in Postgres. The dashboard project will then pull these values from postgres and display them in an easy to view manner.

## This post

With this post, i'll go over the individual pieces of the project, the interesting tidbits of each one, and finally go over a short retrospective over the entire project.

In entire time, the project took about a day and a half. It was fun, and I really enjoyed the experience over all.

## The pieces

* [Scoreboard CLI](https://github.com/jbavari/scoreboard-cli)
* [Scoreboard API](https://github.com/jbavari/scoreboard-api)
* [Scoreboard Dashboard](https://github.com/jbavari/scoreboard-dashboard)
* Scoreboard Mobile App (coming soon)

All of the projects are listed on my github profile. I've been trying to keep most issues in the github repo's issue page for each respective project. 

All of the projects are checked by CodeClimate, and I've been trying to keep up with rubocop's rules on these as I go.

## Scoreboard CLI

The idea for the CLI was to prompt the user for a home team and visitor team, then collect data about getting a touch down for the home team, for example: `h:td`.

It would keep prompting for more scoring plays until the user gives a SIGTERM or hits CTRL+D.

First I started by reading up on Thor, which was an absolute pleasure to work with. You can download it via `gem install scoreboard`.

To make it available via command line, I added this:

``` ruby
  spec.bindir        = "bin"
  spec.executables   = spec.files.grep(%r{^bin/}) { |f| File.basename(f) }
```

Then in `bin/scoreboard` [link](https://github.com/jbavari/scoreboard-cli/blob/master/bin/scoreboard), we just require in our CLI and run it with the arguments:

``` ruby
#!/usr/bin/env ruby

require_relative "../lib/scoreboard/cli"

begin
  cli = Scoreboard::Cli.new
  cli.start(ARGV)
rescue => e
  raise e if $DEBUG
  STDERR.puts e.message
  STDERR.puts e.backtrace.join("\n")
  exit 1
end
```

### A note on the SIGTERM exception handling

If you see in my `STDIN.each_line` loop where I read in scoring entries, [you will see](https://github.com/jbavari/scoreboard-cli/blob/master/lib/scoreboard/cli.rb#L47) I rescue all Exception. This could be improved to find the exact SIGTERM exception is being thrown, but for simplicity, I left it catching the general exception.

## Scoreboard API

The API has a few paths, based on the `/api/v1` namespace for requests.

You can access its teams or the entire scoreboard, via `GET /api/v1/teams` or `GET /api/v1/scores`. You can see the core [Sinatra Application](https://github.com/jbavari/scoreboard-api/blob/master/application.rb) on github.

It was absolutely easy to set up the [Sequel migrations](https://github.com/jbavari/scoreboard-api/tree/master/migrations) to define the team table and the scoreboard table in postgres.

The main tying point was getting the Sequel models to serialize, which was solved in another blog post. 

## Scoreboard Dashboard

Dashing was really easy to get started, a project set up, and out the gate.

First I had to include Sequel to get me my data, which I included an `Api` model to ease the SQL bridge for me.

The main point here was the `scoreboard.rb` file which was scheduled to run every 5 seconds, gather data from some crafty queries, and send that data to the dashboard. Other than the HTML markup, this was the chunky part of it:

``` ruby
require 'sequel'


DB = Sequel.connect('postgres://localhost/scoreboard')
scoreboard = DB[:scoreboard]
team = DB[:team]

send_event('games-played', { value: scoreboard.count })

def teams_played
  DB[<<-eos 
      select
        sum(value)::int as value,
        label
      from (
        select count(home_id) as value, name as label from team inner join scoreboard on team.id = scoreboard.home_id group by scoreboard.home_id, team.name

        UNION ALL

        select count(visitor_id) as value, name as label from team inner join scoreboard on team.id = scoreboard.visitor_id group by scoreboard.visitor_id, team.name
      ) sub
      group by value, label
      order by value desc
    eos
  ]

end

def team_scoreboard
  DB[<<-eos
      select 
        s.id,
        t.name as home_team, 
        t2.name as visitor_team, 
        home_score, 
        visitor_score 
      from team t 
      inner join scoreboard s on s.home_id = t.id 
      inner join team t2 on t2.id = s.visitor_id
      limit 10;
    eos
  ]
end

SCHEDULER.every '5s' do
  teams = teams_played.map do |item|
    {:label => item[:label], :value => item[:value]}
  end
  send_event('games-played', { value: scoreboard.count })
  send_event('teams', { items: teams })
  puts "Scoreboard: #{team_scoreboard.to_a}"

  send_event('scoreboard', { items: team_scoreboard.to_a })
end
```

# Retrospective

* What went right
* What went wrong
* What could be improved

## What went right

* The CLI came together smoothly. Thor was easy to get running.
* Getting data to post to the API was a breeze
* Sinatra and Sequel were easy to hoist up a simple API to take POST data and serve GET requests as JSON
* Getting data into the dashboard was SUPER easy with Sequel, no need to do the ORM dance
* Dashing was easy to create my own scoreboard component, using the `data-` type DOM attributes

## What went wrong

* Had some issues handling SIGTERM in CLI
* CLI still doesnt validate input
* API for Sinatra was a little difficult to get JSON serialization off the bat
* Dashing is very 'opinionated' and doesnt give you more room to fit into an existing app
* No tests were made
* Nothing is deployed to servers yet

## What could be improved

* Minitest suite for CLI, API, and the Dashboard
* Dashboard process tasks could be broken out to be more DRY
* CLI needs to check and validate input
* API needs to add in rollbar, new relic, or other metrics to help find errors
* Deploy all the things!

# Future plans

The plan is to keep working on this project and continue improving tooling and getting other best practices in place. Finally, ship it to digital ocean and enjoy the conveniences they provide.
