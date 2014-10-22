---
layout: post
title: "Exploring Best Practices with Docker for older libraries"
date: 2014-10-21 21:29
comments: true
categories: docker
---

I am not pretending to be an expert about what's in this post, but merely a talking point to learn upon.

# Problem: I need to reassemble an old C++ project with some old libraries and files that may not be around (or have disappeared already).

First theres a big chunk of files that are used strictly for rendering a video, ~560MB. Some of which had since gone missing.

Then theres some old C++ libraries which a previous shell script was doing a `wget` request for, and the files are nowhere to be found.

Finally, there's the need to rebuild the image used to render the files.

Theres so many ways to attack this problem, I'm just going to cover my approaches. I'm open to new ones as well.

# Potential solutions for rendering files

* store on AWS S3
* put into git repo
* store on server somewhere

#### Lets break down the pros / cons of these

## Store on AWS S3

### PROS:

* quick to add
* cheap to store

### CONS:

* can go missing (and did)

## Put into git repo

### PROS:

* versioning control with notes (none before)
* the files give a story in time
* cheap or free

### CONS:

* slow to pull repo (duh)
* storing binary files (derp)

## Store on server somewhere

### PROS:

* cheap to store
* fast to access (local network)

### CONS:

* can go missing (and did)
* no story to the files

# Potential solutions for server image

* single shell script to run for setting up image
* dockerfile to build up the image with `RUN` commands
* dockerfile to execute the single shell script

Some of the libraries this said project was depending on are no longer where they were from a previous shell script to set them all up. That means I have to do some kind of dependency management. Whether that be forking the libraries into a git repo I know will be solid, or copying the files somewhere I can trust, or more simply committing them to my own repo (560 MB or more.. ugh).

This is my thought process, not sure if its right:

If your aim is to have something fully repeatable and easy to run again, go with the docker solution.

If your aim is to just get it done quickly, go with the shell script.

However, I still can't decipher what the pro/cons of the dockerfile just running a single shell script.

Let's dive deeper into the pros and cons of each.

## Single shell script

Steps:

* Create instance from Amazon AMI
* create / test shell script
* copy shell script to server
* run shell script on server

### PROS:

* quick to run (once completed, overall time)
* quick to tell you of errors
* works on my machine

### CONS:

* not easily repeatable
* may not work in another environment (things are assumed)
* not always easy to debug

## Dockerfile with RUN commmands

Steps:

* install docker (if not already)
* create Dockerfile with RUN commands
* ADD dependencies to the docker container
* docker build image
* docker run image
* bundle image to Amazon AMI
* start instance
* profit

### PROS:

* control the starting point environment
* commands verified to work step by step
* easily repeatable
* quick to tell you of errors
* fast after first run (cache)

### CONS:

* slow start up with downloads/updates/git clones/etc
* costly for disk space
* must install docker / boot2docker / etc

## Dockerfile to execute single shell script

Steps:

* install docker (if not already)
* create image from dockerfile
* run image
* create / test shell script in image
* modify dockerfile - ADD shell script created in previous step

### PROS:

* quick to test out your commands

### CONS

* harder to have the diffs between images when modifying shell script
