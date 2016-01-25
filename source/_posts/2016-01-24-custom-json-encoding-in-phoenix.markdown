---
layout: post
title: "Custom JSON encoding in Phoenix"
date: 2016-01-24 19:30
comments: true
categories: elixir phoenix
---

I recently have been working a lot using Leaflet.js to do some mapping.

In some of my models, I use the lovely `Geo` package for Elixir point and geospatial usage. I needed to add support for Poison to encode my model.

I've been serving geo json from my models, and I needed a way to use the JSON encoding way easier. I'm sending some data out to a ZeroMQ socket so I need to encode it by transorming my Geo module in a way that I could encode it with Geo JSON.

I modified my model in two ways - one by putting the `@derive` directive to tell Poison to encode only certain fields. That is one way.

In another way, I needed to encode it everytime by calling the `Geo.JSON.encode` method without me having to do it. You can see that in the `defimpl`.


``` elixir
defmodule MyApp.Point do
  use MyApp.Web, :model

  # Option 1 - specify exactly which fields to encode
  @derive {Poison.Encoder, only: [:id, :name, :geo_json]}
  schema "points" do
    field :name, :string
    field :position, Geo.Point
    field :geo_json, :string, virtual: true

    timestamps
  end

  def encode_model(point) do
    %MyApp.Point{point | geo_json: Geo.JSON.encode(point.position) }
  end

  defimpl Poison.Encoder, for: MyApp.Point do
    def encode(point, options) do
      point = MyApp.Point.encode_model(point)
      Poison.Encoder.Map.encode(Map.take(point, [:id, :name, :geo_json]), options)
    end
  end
end
```


Cheers.
