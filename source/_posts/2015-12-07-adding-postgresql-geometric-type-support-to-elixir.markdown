---
layout: post
title: "Adding PostgreSQL geometric type support to Elixir"
date: 2015-12-07 18:04
comments: true
categories: elixir postgres phoenix
---

In the last week or so, I've had a blast playing around with basic Postgres [geometric types](http://www.postgresql.org/docs/9.4/static/datatype-geometric.html) to do basic earth distance queries.

From my favorite blog, [Datachomp shows how to use radius queries in postgres](http://datachomp.com/archives/radius-queries-in-postgres/) to find the closest place to get a burrito fix. Since I've been on an [Elixir](http://elixir-lang.org/) kick lately, I figured it was time to contribute back to the open source world by adding first class burrito, err, point type support.

## Initial reaction

I immediately made an Ecto model trying to use the point type in my model:

```
defmodule MyApp.LocationPoint do
  use MyApp.Web, :model

  schema "concerts" do
    field :name, :string
    field :date, Ecto.DateTime
    field :location, :point
    timestamps
  end

  @required_fields ~w(name date)
  @optional_fields ~w(location)

  @doc """
  Creates a changeset based on the `model` and `params`.

  If no params are provided, an invalid changeset is returned
  with no validation performed.
  """
  def changeset(model, params \\ :empty) do
    model
    |> cast(params, @required_fields, @optional_fields)
  end
end
```

Right away, when I ran the commands to retrieve this location from `iex`, it gave me some errors:

```
$ iex -S mix
$ alias MyApp.Repo
$ alias MyApp.LocationPoint
$ Repo.all(LocationPoint)
$ ** (ArgumentError) no extension found for oid `600`
```

Right away, I knew this mission was up to me to get point support into Postgrex. 

In this post, I'll outline how to add type support to Postgres via the Elixir package, [postgrex](https://github.com/ericmj/postgrex). We will walk through adding the `Point` data type in Postgres.

This post will cover:

* How to see how postgres stores its types (built in and composite)
* How postgrex does its type lookups
* Finding the source type - adding it to postgres senders
* Looking up postgres source code for data mapping
* Adding new type `Point` type
* Adding built in `Type` structs
* Adding encode method
* Adding decode method

# How Postgres stores its types

Postgres stores its types in a special system table called `pg_type` ([docs](http://www.postgresql.org/docs/9.4/static/catalog-pg-type.html)). It defines a few things about the type:

* Its `typelem` - how the type is stored - array, or otherwise
* Its `typsend` - Output conversion function (binary format), or 0 if none
* Its `typarray` - an oid to another array type that has its send method

# How Postgrex does type lookups

Postgrex at it's core is a simple data adapter into PostgreSQL from Elixir. It's an awesome library, and if you're using [Ecto](https://github.com/elixir-lang/ecto), you're already using it!

First, let's look at how they are loading most types, by looking them up in the `pg_type` table in postgres:

```
  ### BOOTSTRAP TYPES AND EXTENSIONS ###

  @doc false
  def bootstrap_query(m, version) do
    {rngsubtype, join_range} =
      if version >= {9, 2, 0} do
        {"coalesce(r.rngsubtype, 0)",
         "LEFT JOIN pg_range AS r ON r.rngtypid = t.oid"}
      else
        {"0", ""}
      end

    """
    SELECT t.oid, t.typname, t.typsend, t.typreceive, t.typoutput, t.typinput,
           t.typelem, #{rngsubtype}, ARRAY (
      SELECT a.atttypid
      FROM pg_attribute AS a
      WHERE a.attrelid = t.typrelid AND a.attnum > 0 AND NOT a.attisdropped
      ORDER BY a.attnum
    )
    FROM pg_type AS t
    #{join_range}
    WHERE
      t.typname::text = ANY ((#{sql_array(m.type)})::text[]) OR
      t.typsend::text = ANY ((#{sql_array(m.send)})::text[]) OR
      t.typreceive::text = ANY ((#{sql_array(m.receive)})::text[]) OR
      t.typoutput::text = ANY ((#{sql_array(m.output)})::text[]) OR
      t.typinput::text = ANY ((#{sql_array(m.input)})::text[])
    """
  end
```

You can see that under the hood, we're querying Postgres and asking it for it's types, so we can do OID lookups and call the appropriate encoder/decoder methods. From here, we can match up our newly added types encoding/decoding methods.

# Finding the source type - adding it to postgres senders

Find information about the geometrics category:

`SELECT * from pg_type where typcategory = 'G';`

We will see the point type has an oid of 600, which is using a send specification of `point_send`. Other notable send types for geometries: `point_send lseg_send path_send box_send poly_send line_send circle_send`.

Thus, we'll update the send types in postgrex, located in the `binary.ex` file:

```
@senders ~w(boolsend bpcharsend textsend varcharsend byteasend
            int2send int4send int8send float4send float8send numeric_send
            uuid_send date_send time_send timetz_send timestamp_send
            timestamptz_send interval_send enum_send tidsend unknownsend
            inet_send cidr_send macaddr_send point_send
            ) ++ @oid_senders
```

Boom, that gets us the oid to encode/decode off of!

# Looking up postgres source code for data mapping

I hopped into the Postgres source code and looked up the struct type for point, [found here](https://github.com/postgres/postgres/blob/master/src/include/utils/geo_decls.h#L58-L62). 

Great, its just two floats, no big deal. 

# Adding the point struct

Let's craft our Postgrex stuct type in `builtins.ex` then!

```
defmodule Postgrex.Point do
  @moduledoc """
  Struct for Postgres point.

  ## Fields
    * `x`
    * `y`
  """
  require Decimal
  @type t :: %__MODULE__{x: float, y: float}

  defstruct [
    x: nil,
    y: nil]
end
```

# Adding the encode method

Now since we are sending PostgreSQL binary data, we need to take our data and map it to it's binary form, via an `encode` method.

However, postgrex is going to do a type look up, based on the types that we used in that query above.

We'll add the methods to encode, that does some pattern matching to decipher we are getting the correct sender value.

```
def encode(%TypeInfo{type: "point", send: "point_send"}, %Postgrex.Point{} = point, _, _),
  do: encode_point(point)
```

As you can see, we are encoding, when a `TypeInfo` tuple is passed with type `point` and `send` `point_send`! Great, we just pass that to this method to parse out the two floats passed in the binary object:

```
defp encode_point(%Postgrex.Point{x: x, y: y}),
  do: <<x::float64, y::float64>>
```

It just takes those two values, and serializes them down to their binary counterparts.

That now handles the test we've got to keep us honest:

```
test "encode point", context do
  assert [[%Postgrex.Point{x: -97, y: 100}]] == query("SELECT $1::point", [%Postgrex.Point{x: -97, y: 100}])
end
```

This test as promised, takes a `Postgrex.Point` type, and encodes it to the binary form, and sends it off to Postgres. How beautiful.

# Adding the decode method

Now, when we get binary values from Postgres, we need to map that to our `Point` type we've created.

Adding the functions to `decode` in `binary.ex`:

```
def decode(%TypeInfo{type: "point"}, binary, _, _),
  do: decode_point(binary)

# ..snip..

defp decode_point(<<x::float64, y::float64>>) do
  %Postgrex.Point{x: x, y: y}
end
```
The real meat and potatoes is, receiving our binary parameter, mapping its individual segmets as two floats, sized 8 bytes, and then with the pattern matching mapping those to our `Postgrex.Point` struct. QED.

And the test:

```
test "decode point", context do
  assert [[%Postgrex.Point{x: -97, y: 100}]] == query("SELECT point(-97, 100)::point", [])
  assert [[%Postgrex.Point{x: -97.5, y: 100.1}]] == query("SELECT point(-97.5, 100.1)::point", [])
end
```

# Conclusion

Once I finally figured out what pieces were what, I was able to run and create the point type, its mappings, and its senders it required, easily mapping to the struct in Elixir.

I plan to keep working on postgrex, to add first class support for Postgres geometric types.

Cheers!
