---
layout: post
title: "Ionic 2.0 Generators - Services"
date: 2015-11-06 01:23
comments: true
categories: javascript cli ionic typescript es6 node generators
---

This is the second post in a series covering the new Ionic Generators in Ionic 2.0. In the [first post](http://jbavari.github.io/blog/2015/11/05/using-ionic-2-dot-0-generators/), we discussed generating pages, let's focus now on generating some services to consume some JSON data via an http request.

## Get the tools

Run this to get started:

``` bash Install Ionic CLI and start an Ionic application
npm install -g ionic@alpha
ionic start MyIonic2App tabs --v2
cd MyIonic2App
```

## Generate the service

`ionic g injectable MyDataService`

You should see the service:

``` bash Run generate command
~/Development/testing/MyIonic2App$ ionic g injectable MyDataService
√ Create www/app/my-data-service/my-data-service.js
```

The basic blueprint of the generated service is as follows:

``` javascript Generated Data Service
import {Injectable} from 'angular2/angular2';
import {Http} from 'angular2/http';

@Injectable()
export class MyDataService {
  constructor(http: Http) {
    this.http = http;
    this.data = null;
  }

  retrieveData() {
    //Here, we're going to get a JSON data file, use the `map` call to parse json
    // and finally subscribe to the observable and set our data
    //to the value it provides once the http request is complete.
    this.http.get('path/to/data.json')
      .map(res => res.json())
      .subscribe(data => {
        this.data = data;
      }, error => {
        console.log('Error with http.get: ', error);
      });
  }
}

```

## Wiring it in to be used

Adjust `www/app/app.js` to import the data service, as well as provide it for all of its components:

```js www/app/app.js
import {MyDataService} from './my-data-service/my-data-service';

@App({
  template: '<ion-nav [root]="root"></ion-nav>',
  providers: [Friends, MyDataService]
})
```

## Use the service

We'll use the tabs starter dashboard page to pull data.

Let's modify `www/app/dash/dash.ts` - adding an import for `MyDataService`, adding `MyDataService` to the constructore as an injected dependency, and finally adding the call to `retrieveData` in the constructore method.

``` js www/app/dash/dash.ts
import {Page, NavController, ViewController} from 'ionic/ionic';
import {MyDataService} from '../my-data-service/my-data-service';
import {About} from '../about/about';

@Page({
  templateUrl: 'app/dash/dash.html',
})
export class Dash {
  constructor(nav: NavController, view: ViewController, data: MyDataService) {
    this.nav = nav;
    this.view = view;
    data.retrieveData();
  }

  goToAboutPage() {
    this.nav.push(About);
  }

}
```

## Additional information

If you've used Angular 1, you're probably familiar with promises to return your data from http requests.

Under the hood of Angular 2 lies [RxJs](https://github.com/Reactive-Extensions/RxJS) that builds on promises, focusing on being repeatable.

Enjoy!
