---
layout: post
title: "Making Rails and Postgres Arrays Play Nice"
date: 2014-01-14 12:01
comments: true
categories: 
---

Lately I've had a small need to store an array of string values in a Postgres array instead of making foreign tables and dealing with the fun ActiveRecord fancies there are to play with.

Digging into the topic, I was looking for some pre-existing knowledge on the topic. Turns out the people at [Relatabase](http://blog.relatabase.com/rails-postgres-arrays) and [Stuart Liston at CoderWall](https://coderwall.com/p/sud9ja) had some great knowledge to share on this.

Being the simpleton that I am, I found a ton of knowledge on how to query them, how to add them to your models, but still lacked some basic knowledge of how to USE them. Maybe you're like me, and this will help.

Adding to Stuart's code, lets assume we've added the postgres column:

``` ruby
class AddTechToCompanies < ActiveRecord::Migration
  def change
    add_column :companies, :technology_used, :string, array: true, default: '{}'
  end
end
```

Using [Ruby Scopes](http://guides.rubyonrails.org/active_record_querying.html#scopes) and the proper Postgres querying syntax:

``` ruby
class Company < ActiveRecord::Base
	scope :any_tech, -> (tech){where('? = ANY(technology_used)', tech)}
	scope :all_tech, -> (tech){where('? = ALL(technology_used)', tech)}
end
```

Simple enough and easy to read. Lets tackle the simple task of adding a company with a few properties: Name, website, and technology_used.

``` ruby
#..snip..
company = Company.new
company.name = "RaiseMore"
company.website_url = "http://www.raisemore.com"
company.technology_used = ['Ruby', 'Rails', 'Sinatra', 'JavaScript', 'Redis', 'PhoneGap', 'Sidekiq']

company.save!
```

This will add our basic info, as well as get us our data back by doing this:

``` ruby Interactive Console Output
rails_company = Company.any_tech('Rails')

Company Load (2.6ms)  SELECT "companies".* FROM "companies" WHERE ('Rails' = ANY(technology_used))
 => #<ActiveRecord::Relation [#<Company id: 1, name: "RaiseMore", founded: "2011", website_url: "http://www.raisemore.com", logo_url: "http://res.cloudinary.com/hfjjoialf/image/upload/v1...", description: "We are an event fundraising platform focused on hel...", company_type: "Start up", market: "Charity Fundraising", technology_used: ["Rails", "Postgres", "Sinatra", "PhoneGap", "JavaScript", "HTML5", "Redis"], interns_needed: true, twitter_id: "@raise_more", created_at: "2014-01-13 21:49:39", updated_at: "2014-01-13 21:49:39">]> 

rails_company.technology_used

=> ["Rails", "Postgres", "Sinatra", "PhoneGap", "JavaScript", "HTML5", "Redis"] 

```

Cool, so saving the array data is easy. What about updating? As [the relatabase post points out](http://blog.relatabase.com/rails-postgres-arrays),

`One huge caveat of this approach is that rails doesn’t clone the array when saving the original for dirty checking, so any in-place modification to the array won’t register that it’s changed.`

This leaves us with these options:

* set the dirty flag ourselves: `rails_company.technology_used_will_change!`
* update using update_attributes: `rails_company.update_attributes(:technology_used => ['Rails', 'Redis', 'Go', 'Erlang'] )`

## Overall results

The way Rails handles arrays is not as complete as a like, but hey, we are skipping a step by getting around foreign key tables. It's not like you should expect much. I'd say they are allowed for small use projects, but if you really need to do some searching or have referential integrity, stick with foreign key tables.

Also, check out the following resources:

[Postgres - The Best Tool You're Already Using](http://adamsanderson.github.io/railsconf_2013/?full#1)

[Rails 4.0 Sneak Peek: PostgreSQL array support](http://reefpoints.dockyard.com/ruby/2012/09/18/rails-4-sneak-peek-postgresql-array-support.html)