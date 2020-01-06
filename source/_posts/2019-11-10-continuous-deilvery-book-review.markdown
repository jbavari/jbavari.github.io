---
layout: post
title: "Continuous Delivery - Book Review"
date: 2019-11-10 11:16
comments: true
categories: book review
---

I'm still diving into the [Continuous Delivery book](https://www.amazon.com/Continuous-Delivery-Deployment-Automation-Addison-Wesley/dp/0321601912/ref=sr_1_4?crid=3LLBV00FE8TG3&keywords=continuous+delivery&qid=1576211505&sprefix=continuous+deliv%2Caps%2C192&sr=8-4). I wanted to sketch out some (very) sparse notes in an attempt to retain the material.

# Chapter 1

## Common release Anti-patterns
* Deploying software manually
* Deploying to a production-like environment only after Development is complete
* Manual configuration management of production environments


## Stages of a deployment pipeline

* The commit stage - compile, unit test, analysis, build installers
* Automated acceptance testing
* Automated capacity testing
* Manual testing - showcases, exploratory, testing
* Release

### Deploying to a production-like environment only after Development is complete

#### Problems

* Ensure teams are working towards production type releases on a regular cadence, not in extended periods of time.
* Manual configurations cause issues - work towards trying to automate those portions.
* Scripts to do the deployments are better than manual steps written up. Documentation goes out of date, requires extra effort to keep alignment.
* Need tighter collaboration between development and deployment teams.
* Deploying to staging faster (where environments are closer to production) helps uncover issues, bind the dev/ops teams, and drives fixes to deployments faster.
* The bigger diff between deployment and production environments

#### Solutions

* Rehearse deployments to a staging or production-like environment several times before actually going to production.
* Make sure everyone who is doing the deployments are working together on the deployments from the start of the project.
* Make the cornerstone of deployment a means of testing both software and deployments throughout the process.

### Manual configuration management of production environments

#### Signs of this anti-pattern

* Having deployed successfully to many times to staging, the deployment to production fails.
* The operations teams take longer to prepare an environment for a release.
* You cannot step back to a prior configuration of your system.
* Servers in the operating environments, unintentionally, have different versions of operating systems, third-party infrastructure, libraries, or patch levels.
* Configuration of the system is carried out by modifying the configuration directly on production systems.

#### Solutions

* All aspects of testing, staging, and production specifically the configuration of any third-party elements of the system should be applied from version control through an automated process.
* The only way to make changes to production should be done through an automated process.
* Make it possible to see at a glance what the currently released version of every piece of software is.
* Make releases boring - to the point where they are cheap, low-risk, frequent, rapid, and predictable.

## How to achieve these solutions?

* Automate - make it repeatable without failure.
* Frequent - make deltas between releases smaller to reduce risk and get immediate feedback.

Three criteria to make feedback to be useful:
* Any change, whatever kind, needs to trigger the feedback process.
* The feedback must be delivered as soon as possible.
* The delivery team must receive feedback and then act on it.

How to get this feedback?

Working software decomposed into 4 components:

* Executable code
* Configuration
* Host environment
* Data

You should aim to have the executable code to be reused everywhere it is needed and never rebuilt.

Any change to an applications configuration, in whichever environment, should be tested with a representative range of the example systems.

If the environments are to changed, the whole system should be tested with the changes to the environment.

Finally, if the structure of the data changes, the change must also be tested.

The authors mention a few simple feedback checks:

* The software should fulfill certain requirements such as test coverage and other technology-specific metrics.
* The software's functional acceptance tests must pass. This is a test on the business acceptance criteria.
* The software's nonfunctional tests must pass - in regards to capacity, availability, security, and so on to meet it's users needs.

Another key point the authors bring up that implementing a deployment pipeline is resource-intensive, especially once you have a comprehensive automated test suite. One of the key objectives is to optimize for human resource usage: we want to free the people to do the interesting work and leave repetition to machines.

The authors suggest to aim for 75% or so of the codebase.

### Breaking down the steps of the pipeline

If tests fail in the early stages of the pipeline, they should not advance. We should aim to build a high confidence in the software in the first set of tests.



----------

Random notes:

CH1 - author recommends to get cross-functional groups all along the process. Also aim to have retrospections with the entire crew of developers, infra/operations, and testing

Being able to react to feedback also means broadcasting information. Using big, visible dashboards and other notification mechanisms. Also aim to make one is present in each team room.

Feedback is no good unless it is acted on.

Authors make a point here that by giving more of the pull/self-service model, you can increase velocity:
* Testers can select older versions of software to test with
* Support staff can deploy a released version into an environment to reproduce a defect.
* Operations staff can select a known good build to deploy into production as part of disaster recovery
* Releases can happen at a push of a button.

Note here applying to work:
* In each PR, it should address:
* Change in code
* Change in configuration (if any)
* Change in host environment (if any)
* Change in structures of data
