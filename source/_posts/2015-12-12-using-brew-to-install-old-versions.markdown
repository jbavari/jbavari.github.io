---
layout: post
title: "Using brew to install old versions"
date: 2015-12-12 13:50
comments: true
categories: homebrew
---

I just wanted to share a quick little tidbit on how to install older brew versions.

I was having some issues with an older version of Elixir failing tests (1.0.1), and the latest version (1.1.1) is working fine.

Just running `brew install elixir` gets latest. 

To get 1.0.1 installed, I first went to the [homebrew github repo](https://github.com/Homebrew/homebrew), looked at the `Library/Formula` folder, found the `elixir.rb` formula to install elixir, looked in the history, found 1.0.1, and then executed the following line:

`brew install https://raw.githubusercontent.com/Homebrew/homebrew/8506ced146655c24920f3cc5b20e6bc9e6e703cc/Library/Formula/elixir.rb`

That did it, I easily got 1.0.1 installed, and going back to 1.1.1 was super easy.

Hope this helps, enjoy! Cheers!
