---
layout: post
title: "Test Coverage Reports in Elixir"
date: 2017-03-13 18:38
comments: true
categories: elixir test cover
---

Lately I've been learning a ton more about Elixir and really working towards refactoring and hardening the system.

On my current project, I've got about 200 tests that exercise various parts of the system. Lately though, I've been trying to analyze which parts of the system aren't being covered, and of course, theres tools to help with that.

The two I looked at were [Coveralls](https://github.com/parroty/excoveralls) and [Coverex](https://github.com/alfert/coverex). I'm going to be using `coverex` in this post.

Getting started is a breeze, check the readme for that. I'll cover it briefly for a bit here, my modifying our `mix.exs` file:


``` elixir
  # in `def project`, we add test_coverage
  test_coverage: [
    tool: Coverex.Task
  ],

  # in deps, add the depedency for only test environment
  {:coverex, "~> 1.4.10", only: :test},
```

After setup, running `mix test --cover` generates some reports in your projects `./cover` folder - with `functions.html` and `modules.html`. These give you your standard coverage reports with lines covered / ratio covered.

For my project, I had quite a bit of generated files using [exprotobuf](https://github.com/bitwalker/exprotobuf). The coverage report was getting butchered from not using these many files in my tests.

According to the docs, we can add a keyword for `ignore_modules` in the keyword list `test_coverage` and the coverage reports will ignore those modules.

However, for my generated list of modules, I had quite the growing list to ignore and it quickly became unwieldy to put that list of modules in my `mix.exs` file.

Since we can't access other modules from our mix file, I had a quick solution. I created a `.coverignore` file in the project directory, lumped in all the modules I wanted to ignore (from the `modules.html` generated file) and put them all in the `.coverignore` file.

I ensured all the modules I wanted to ignore were all newline delimited (`\n`).

From there, I modified my `mix.exs` file as such:

```elixir
  # Near the top
  @ignore_modules File.read!("./.coverignore") |> String.split("\n") |> Enum.map(&(String.to_atom(&1)))

  # in def project
  test_coverage: [
    tool: Coverex.Task,
    ignore_modules: @ignore_modules
  ],
```

Boom, that does it! Now we've got a manageable list of modules to ignore in a separate file so we can keep our mix file clean.

All in all, `coverex` is a great module, and I would suggest using it if you do not want to ship data to coveralls.

Hope this helps, happy coding. Cheers!
