---
layout: post
title: "Using Erlang Observer on a Remote Elixir Server"
date: 2016-03-11 14:01
comments: true
categories: elixir erlang
---

I’ve been using Elixir a ton at work and in some fun side projects and I’m absolutely in love with it.

One tool I especially love is the Erlang Observer tool, that shows you IO, memory, and CPU usage used by your app and the Erlang VM.

Once I got some apps deployed, I wanted to observe them remotely. I found a few [google forum](https://groups.google.com/forum/#!topic/elixir-lang-talk/312PlJLSgLw) posts and the [IEx docs](http://elixir-lang.org/docs/stable/iex/IEx.html), but I wanted to wrap up this knowledge for when I need it in the future.

I’m going to monitor a Phoenix app in this quick blog post.

First, fire up your Phoenix server on say, a VPS, giving it a node name:

`iex --name server@64.16.134.61 --cookie jbavari -S mix phoenix.server`

Then on your remote viewing machine, say your Mac, run the following:

`iex --name josh@192.168.1.1 --cookie jbavari`

Now we’re set up to do some remote observations!

Fire up `:observer.start` on your local machine, which should open up the Erlang observer.

Now from the menu, select ‘Nodes’, then you should see your node there. If not, click the connect to node button, type in your `server@64.16.134.61` node address and you should be able to view your node via the observer!

Enjoy!
