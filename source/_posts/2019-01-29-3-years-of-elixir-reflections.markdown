---
layout: post
title: "3 years of Elixir: Reflections"
date: 2019-01-29 07:30
comments: true
categories: elixir
---

Back in 2015, I had just started at [CANVAS Technology](http://canvas.technology) and my task was clear: to create a web application that can service many operations concurrently from users, robots, and other integration services. Prior to this new venture, I had spent my last few years doing Ruby on Rails, Node.js JavaScript, mobile applications (cordova, minimal Objective-C, Java/Android). Only a few months before joining CANVAS had I just started playing with Elixir and Phoenix. I was so excited and relieved to find something that was geared exactly for what we were embarking on.

What I want to outline in this post is the lessons I've learned using Elixir these last 3+ years and help others learn quickly.

## Upgrade sooner than later

Discuss pains of upgrading Elixir 1.3 -> 1.6, Ecto 1.0 -> 2.0, Phoenix 0.9 -> 1.3.

## GenServers are your friend - but use them only if you must

Abstract away the API and the Server - link to post by [Dave Thomas explaining splitting the APIs, Servers, and Implementations in Elixir](https://pragdave.me/blog/2017/07/13/decoupling-interface-and-implementation-in-elixir.html).

## Testing pains with GenServers and Ecto's concurrency model

Make sure to restart genservers / supervisors.

## Do not code everything to the `Repo` itself

It's not as easy to cut off your database addiction.

## PubSub is your friend, use structs to pass messages

When using cast/gproc, pass the Structs, don't use tuples. Resist the simple solutiuons.

## Learn ETS

Don't use a cache when the Erlang VM has one built in.

## Use behaviours

Link to post for the crowdfundr app. Code to interfaces, not the implementations. Use the `impl` approach.

## Nginx as a front-end for SSL termination

Links/discussion to the post, security wise, leave Nginx to handle the vulns and your app to handle the impl.

## Releases with Distillery

Ship those tars, let it fly. Easier/safer than shiping your code.

## Clustering - using epmd / GenServers for node communication message passing

Link to swarm and libcluster - knowing that clustering comes out of the box with Erlang/Elixir.
