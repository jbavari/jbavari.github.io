---
layout: post
title: "Multicast Service Discovery in Electron"
date: 2016-12-29 14:01
comments: true
categories: electron avahi mdns nodejs
---

I’ve been playing around with mDNS lately for broadcasting some services for applications to auto-connect with.

The first experiment I had was setting up a server that broadcasts a TCP endpoint for an Electron application to discover and connect for the application data.

This was so easily done that I challenged myself to see how fast I can whip out a blog post.

First, get an Ubuntu server up (I used a Vagrant VM).

Run the commands:

```
sudo apt-get install avahi-utils
```

From here, the service for avahi (mdns) should be auto-started. Edit the configuration to enable broadcasting:

`vim /etc/avahi/avahi-daemon.conf` – here’s a config that’s minimally broadcasting only the IPv4 address:

```
[server]
host-name=webserver
domain-name=local
use-ipv4=yes
use-ipv6=no
allow-interfaces=eth1
deny-interfaces=eth0
ratelimit-interval-usec=1000000
ratelimit-burst=1000

[wide-area]
enable-wide-area=yes

[publish]
publish-addresses=yes
publish-hinfo=yes
publish-workstation=no
publish-domain=yes
```

Now, create a service configuration: `vim /etc/avahi/services/mywebserver.service`, with this contents:

```
<service-group>
  <name>Webserver</name>
  <service>
    <type>_http._tcp</type>
    <port>80</port>
  </service>
</service-group>
```

Simple as that. Just restart the avahi-daemon – `sudo service avahi-daemon restart`.

This should now have your server broadcasting that it has a webserver running at port 80, named `Webserver`.

To check the service is broadcasting, run `avahi-browse _http._tcp -tr` – this should show your server as servername.local, with `Webserver`, pointing to its IP and port.

Example:

```
+   eth1 IPv4 webserver                              Web Site             local
=   eth1 IPv4 webserver                              Web Site             local
   hostname = [webserver.local]
   address = [192.168.0.101]
   port = [80]
   txt = []
```

Now for the electron portion, in your application, install the node mdns module: `npm install --save mdns`.

This will add the node module to your project, but since it has native compilation steps, you must build it with `electron-rebuild`. Do this: `npm install --save-dev electron-rebuild`.

Then run: `./node_modules/.bin/electron-rebuild` – this will rebuild the mdns module for your electron node version correctly.

To do the DNS lookups, simply run the steps from the node mdns `README`. Set the discovery type to `http` and it will find your service. From there, you can grab the address and then get the data from the web server (or html page redirection) as you so wish!

Happy coding!
