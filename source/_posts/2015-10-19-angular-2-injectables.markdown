---
layout: post
title: "Angular 2 Injectables"
date: 2015-10-19 16:34
comments: true
categories: angular2
---

I've been fortunate enough to be working on Angular 2 while being on the Ionic team.

I really enjoyed Pascal Precht's post about [Dependency injection in Angular 2](http://blog.thoughtram.io/angular/2015/05/18/dependency-injection-in-angular-2.html). One thing that I want to shed some more light on is how dependency injection works in an Angular 2 application using the `@Injectable` metadata thats passed for a class that's to be injected.

Quick tip: take a quick look at the [Angular 2 cheat sheet](https://angular.io/docs/ts/latest/guide/cheatsheet.html) to see some more of these Angular 2 syntax and API.

## The basics of Depdendency injection

The gist of it we need:

1) A class with `@Injectable` to tell angular 2 that its to be injected - DataService  
2) A class with a constructor that accepts a type to be injected

A solid example, DataService marked as `@Injectable` that also needs `Http` to be injected for its use:

```js
import {Injectable, bind} from 'angular2/angular2';
import {Http} from 'angular2/http';

@Injectable() /* This is #1 */
export class DataService {
  constructor(http: Http /* This is #2 */ ) { 
    this.http = http;
  }
}
```

What we have in the example above is a class, DataService, that needs Http to do what it needs to be done.

## An example scenario

Let's say we have the following scenario, an angular 2 application with an app, a page for sessions, session details, speakers, and a data service that provides the data for those pages.

We'd want the app instance to instantiate the data service, then have a component `schedule` that can use the data service as provided by the app instance. From there, we'd have the session detail that also gets the schedule data from the data service.

The hierarchy would look like this:

```bash
              App 
               |  
      |.............|...............|
      |             |               |
   Schedule      Speakers     Session-detail
      |
      |
  Schedule-list
```

All of these components will need the instance of data service.

We'll need: 

* A data serviced marked with `@Injectable`.
* A schedule page
* A schedule-list component
* A speakers page

Say you have the following:

In `www/app/service/data.js`:

```js
import {Injectable} from 'angular2/angular2';
import {Http} from 'angular2/http';

@Injectable()
export class DataService {
  constructor(http: Http) {
    this.http = http;
    this.data = null;
    console.log('DataService constructor');
  }

  retrieveData() {
    this.http.get('api/data/data.json')
    .map(res => res.json())
    .subscribe(data => {
      this.data = data;
    });
  }
}
```

We'd also have our Application object, `www/app/app.js`:

```js
import {App, Platform, StatusBar} from 'ionic/ionic';
import {DataService} from './service/data';
import {AboutPage} from './about/about';
import {MapPage} from './map/map';
import {SchedulePage} from './schedule/schedule';
import {SpeakersPage} from './speakers/speakers';

@App({
  templateUrl: 'app/app.html',
  providers: [DataService] 
  /* 
    Here we're saying, please include an instance of 
    DataService for all my children components,
    in this case being sessions, speakers, 
    and session detail.
  */
})
class ConferenceApp {
  constructor(platform: Platform, data: DataService) {
    data.retrieveData();
  }
}

```

Then we'd have our speakers component, `www/app/speakers/speakers.js`:

```js
import {Page} from 'ionic/ionic';
import {DataService} from '../service/data';
import {SpeakerDetailPage} from '../speaker-detail/speaker-detail';
import {SessionDetailPage} from '../session-detail/session-detail';

@Page({
  templateUrl: 'app/speakers/speakers.html'
})
export class SpeakersPage {
  constructor(nav: NavController, data: DataService) {
    this.nav = nav;
    this.speakers = null;
    this.dataService = data;
  }

  onInit() {
    this.speakers = this.dataService.getSchedule();
  }
}

```

Now I want to point something out above. If we had the `SpeakersPage` to also have a `providers: [DataService]`, we are telling angular 2 to create an instance of DataService to make it available for `SpeakersPage`'s children, **instead of** using the DataService that `ConferenceApp` provided.

I repeat, we'd have two instances of `DataService` with this:

```js
import {Page} from 'ionic/ionic';
import {DataService} from '../service/data';
import {SpeakerDetailPage} from '../speaker-detail/speaker-detail';
import {SessionDetailPage} from '../session-detail/session-detail';

@Page({
  templateUrl: 'app/speakers/speakers.html',
  providers: [DataService] 
  // This will instantiate a new DataService for its children
})
export class SpeakersPage {
  constructor(nav: NavController, data: DataService) {
    this.nav = nav;
    this.speakers = null;
    this.dataService = data;
  }

  onInit() {
    this.speakers = this.dataService.getSchedule();
  }
}
```

This is very important. If we had a `console.log` statement in the `DataService` constructor, we'd see it run twice with the `providers: [DataService]` being specified.

One thing to remember, if at the root application you specify a provider, it will be available to all children components that it contains, unless you specify a `providers` that then will initialize a new instance of that provided class.


I hope this post helps clear up dependency injection in Angular 2. Now get back to coding!
