---
layout: post
title: "Adding Additional static paths in Phoenix"
date: 2016-01-24 19:24
comments: true
categories: elixir phoenix
---
Phoenix is awesome.

A problem I ran into lately is how to add additional static paths to be served.

If you take a look in your `lib/endpoint.ex` file, you'll see the plug used for adding static paths:

``` elixir
plug Plug.Static,
  at: "/", from: :electronify, gzip: false,
  only: ~w(css fonts images js favicon.ico robots.txt)
```

I wanted to add another folder to be served, 'zips', that I had to edit the `only:` line in the plug specification as such:

``` elixir
plug Plug.Static,
  at: "/", from: :electronify, gzip: false,
  only: ~w(css fonts images js favicon.ico robots.txt zips)
```


There you have it, now I can access the files in the `zips` folder in `priv/static/zips` through the URL. Cheers!
