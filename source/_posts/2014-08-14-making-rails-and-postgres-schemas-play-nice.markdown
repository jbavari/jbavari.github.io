---
layout: post
title: "Making Rails Fixtures Across Postgres Schemas play nice"
date: 2014-08-14 20:58
comments: true
categories:
---
This past week or so I've had another run in with using Rails to access data across Postgres schemas. I thought I would share some of my experiences I've had with the two.

I'm going to assume you're comfortable with Rails (ActiveRecord with models) and Postgres (what is a schema and why you'd want to use one).

## The wild wild west of data

I had a `public` schema for most of my data (people, preferences, etc) and another schema `bikeshop` that has several entries from an external data feed, that may or may not change format along the way.

## To ActiveRecord - or not to be

First I tried making some simple ActiveRecord classes, all while admitting I'm really not that fond of ActiveRecord.

``` ruby
class BikeStore < ActiveRecord::Base
	set_table_name 'bikes.store'
end
```

Easy right? It happens to work too, sweet.

## Wait, I thought you wrote tests too?

Woops, let's get that set up too. First I'll start by setting up my fixtures ([heres](http://google.com) a few [reasons](http://googe.com) I still use [minitest & fixtures](http://google.com)). I started by naming my file `bikeshop.yml` and it looks like this:

``` yml
first:
  id: 1
  name: 'Jims Bike shop'
```

And a quick test:

``` ruby
require 'test_helper'
class BikeStoreTest < ActiveSupport::TestCase
	before do
		@bike_store = bikesstore(:first)
	end

	test 'should get bike store name' do
		refute_nil @bike_store
	end
end
```

Right away you'll get one of these errors:

* There is no table named `bikestore`
* There is no function named bikesstore

How do you even use or access the fixture data then?

### Fixture naming with schemas

The trick is this: naming the fixture yaml file `schema.table.yml` - that properly sets up the fixture to let us get some test data. I called my file `bikes.store.yml` and that fixed things up.

### Accessing the fixture data in a test

Still not sure on this one folks. Please someone comment and help the world out!

Hope this helps
