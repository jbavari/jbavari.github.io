---
layout: post
title: "RethinkDB the importing json process"
date: 2014-03-19 00:51
comments: true
categories: rethinkdb nodejs json
---
I was playing around tonight with RethinkDB - and I wanted to import some data from a JSON file. It wasn't very well documented, so I wanted to make sure I high-light that for others. [The tutorial post to see RethinkDB's import](http://www.rethinkdb.com/docs/tutorials/elections/) covers this command to fire off:


```
rethinkdb import -c localhost:28015 --table registry.plugins --pkey _id -f plugins.json --format json
```

It's real easy - lets break it down:

* The first part, `-c localhost:28015` specifies the cluster host and port. 
* The next, `--table registry.plugins` specifies the database 'registry', and the table 'plugins'.
* Next up is specifying the primary index key of '_id' with `--pkey _id`.
* Finally, `-f plugins.json --format json` tells Rethink to pull in the file located in the CWD named plugins.json, in the jason formats!

Chances are, you might not have that Python driver, which gives you this message:

```
Error when launching rethinkdb-import: No such file or directory
The rethinkdb-import command depends on the RethinkDB Python driver, which must be installed.
Instructions for installing the RethinkDB Python driver are available here:
http://www.rethinkdb.com/docs/install-drivers/python/
```

If thats the case, run the command to install the rethinkdb-import Python driver:

```
sudo pip install rethinkdb
```

Boom! Now get back to work.