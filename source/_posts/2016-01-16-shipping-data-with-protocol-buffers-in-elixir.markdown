---
layout: post
title: "Shipping data with Protocol Buffers in Elixir"
date: 2016-01-16 22:49
comments: true
categories: elixir
---

Lately, I've needed some data shipped across to various nodes to exchange data in a variety of places on a problem I was working on. There were a few ways to get that data shipped across, as the usual suspects are JSON, XML, or Google's [Protocol Buffers](https://developers.google.com/protocol-buffers/?hl=en).

For this specific problem, we were needing to get that data shared from C++ nodes to Elixir/Erlang.

Since the team was using Protocol buffers already, I decided to give them a run in Elixir using [exprotobuf](https://github.com/bitwalker/exprotobuf).

Note: [the client for this experiement is on github](https://github.com/jbavari/elixir-zeromq-protobuf-uploader).

## The idea

The idea here is - we'll capture pieces of data from one node and ship it to the server for processing. We define the data structure by a `.proto` file, then turn our data into binary form by encoding it, and finally shipping it to it's destination. We could do the same thing with JSON, but we want the data as light as possible.

We'll use [ZeroMQ](http://zeromq.org/) to ship the data and use the Elixir package [exzmq](https://github.com/zeromq/exzmq) to encode in protocol buffers.


## The process

First we define our protocol buffer format for an image message we want to send with data, its width, height, and bits per pixel:

``` protobuf
message ImageMsg {
  optional bytes data = 1;
  optional int32 width = 2;
  optional int32 height = 3;
  optional int32 bpp = 4;
}
```

We set up our application to use `exprotobuf` in our `mix.exs` file:

``` elixir
def application do
    [applications: [:logger, :exzmq, :exprotobuf],
     mod: {Zmq2, []}]
end
```

as well as including it as a dependency:

``` elixir
defp deps do
  [
    {:exzmq, git: "https://github.com/zeromq/exzmq"},
    {:exprotobuf, "1.0.0-rc1"}
  ]
end
```

Finally we create an Elixir struct from this [proto file](https://github.com/jbavari/elixir-zeromq-protobuf-uploader/blob/master/lib/proto/imagemsg.proto) as such:

``` elixir
defmodule Zmq2.Protobuf do
  use Protobuf, from: Path.wildcard(Path.expand("./proto/imagemsg.proto", __DIR__))
end
```

Now that we have our protobuf file read in, let's get an images binary data, create an elixir structure from our protobuf file, and send that data over a Zero MQ socket (using `exzmq`):

``` elixir
def check_file(file_path, socket) do
  IO.puts "Sending image from file path: #{Path.expand(file_path, __DIR__)}"

  case File.read(Path.expand(file_path)) do
    {:error, :enoent} ->
      IO.puts "No file at the path: #{file_path}"
    {:ok, img_data} ->
      send_image_data(socket, img_data)
  end
end

def send_image_data(socket, img_data) do
  img_message = Zmq2.Protobuf.ImageMsg.new(data: img_data)
  encoded_data = Zmq2.Protobuf.ImageMsg.encode(img_message)

  IO.puts "The encoded data: #{inspect encoded_data}"

  Exzmq.send(socket, [encoded_data])

  IO.puts "Sent request - awaiting reply\n\n"

  # {:ok, r} =
  case Exzmq.recv(socket) do
    {:ok, r} -> IO.puts("Received reply #{inspect r}")
    _ -> {:error, "No Reply"}
  end

end
```

And there we have it, a message sent serialized with protocol buffers. We can now apply this same strategy over any different protocol buffer messages we define, and ship them over any protocl we'd like.

### Some inspiration

Along the R&D process, I came across [David Beck's blog](http://dbeck.github.io). David has an experiment where he was [sending several million messages in TCP](http://dbeck.github.io/Wrapping-up-my-Elixir-TCP-experiments/) where he explores some ultra-efficient methods of sending messages, it's a great read. He also covers [zeromq and protocol buffers](http://dbeck.github.io/5-lessons-learnt-from-choosing-zeromq-and-protobuf/) that goes more in depth into Protocol buffers and some lessons learned.

Alas, we move on!

Cheers
