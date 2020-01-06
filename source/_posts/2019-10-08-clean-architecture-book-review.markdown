---
layout: post
title: "Clean Architecture - Book Review"
date: 2019-10-08 21:48
comments: true
categories: software architecture development book review
---

I've recently read and held a nerd book club at work regarding Clean Architecture. Overall, I found this read easy to grok and entertain a few new ideas about software development. Uncle Bob also had a few things [on his blog post](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html) about this topic.

If I could wrap up one picture that encompases the book:

![This image](https://blog.cleancoder.com/uncle-bob/images/2012-08-13-the-clean-architecture/CleanArchitecture.jpg)

I've also recently read parts of Domain Driven Design that introduce this same concept. I think Uncle Bob does a great job of sharing some great examples of the book of how architecture is an art, one that can morph with the needs of the project at hand, and is subject to trade-offs through the entire lifecycle of software. I love that the book starts off expressing the idea that thinking of delivery early on is a wise decision to incorporate into the architecture design.

Some other great points I found worthy of mention:

* How to think of the division of software with regards to firmware and hardware abstraction layers.
* Most things are details - the framework, the database, the GUI, firmware - keep it separated from the internal domain layers of your business logic however possible.
* SOLID Principles are important - also integrate into architecture design.
* Architecture design with traditional monolith, service oriented, and micro-service anti-pattern warnings.
* The idea that there is no silver bullet - [A good developer is like a werewolf: afraid of silver bullets](https://twitter.com/codepitbull/status/784691906005635072)

This book club also gave the team some time to reflect and dive into the design of our current projects. Overall, this was a great book for a team to cover and come up with some action items to drive better software going forward.
