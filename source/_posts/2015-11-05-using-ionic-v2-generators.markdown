---
layout: post
title: "Using Ionic v2 Generators"
date: 2015-11-05 21:49
comments: true
categories: javascript cli ionic typescript es6 node
---

At the time of writing this, Ionic v2 is still in alpha. 

Ionic v2 builds on a ton of new technologies, and if you've never dabbled in these technologies, you can use the generators available in the [`ionic-framework`](http://npmjs.org/package/ionic-framework) module to get ramped up quickly!

## Getting started

First, install the `alpha` version of the Ionic CLI: `npm install -g ionic@alpha`, currently version 2.0.0-alpha.19.

Start an app with the tabs template: `ionic start MyIonic2App tabs --v2`.

Change directories and serve the app in the browser: `cd MyIonic2App && ionic serve`.

You'll see, we've got a basic tabs starter now avilable at `MyIonic2App` directory. Note: the `ionic-framework` module will be installed from the `ionic start` command. 

## Generating a few pages

Let's say we want to link to a new page, 'About', from one of the tabs. First, let's generate our page with this command: `ionic g page About`.

You'll see a few files added:

```bash
~/Development/testing/MyIonic2App$ ionic g page About
√ Create www/app/about/about.html
√ Create www/app/about/about.js
√ Create www/app/about/about.scss
```

## Adding link on view to the About page

Let's add the link to the main tab page in `www/app/dash/dash.html`, via the `(click)` handler on an anchor, like so:

```html
<ion-card>
  <ion-card-header>
    Go to about page
  </ion-card-header>
  <ion-card-content>
    <a (click)="goToAboutPage()" href="#">About this</a>
  </ion-card-content>
</ion-card>
```

## Navigating to the page

Modify the Dashboard TypeScript file (`www/app/dash/dash.ts`) to import our new about page, add the click event handler, and push the page on the nav controller, all like so:

```js
import {Page, NavController, ViewController} from 'ionic/ionic';
import {About} from '../about/about';

@Page({
  templateUrl: 'app/dash/dash.html',
})
export class Dash {
  constructor(nav: NavController, view: ViewController) {
    this.nav = nav;
    this.view = view;
  }

  goToAboutPage() {
    this.nav.push(About);
  }

}
```

## Try it out!

Look in your browser, you should have an anchor available to click/tap that will then navigate you to the About page, fresh for you to get working!

Here's a GIF of what it looks like: 

{% img [pic] /images/IonicV2Generators.gif [250] [250] [Ionic V2 - Page generator example] %}

## Wiring up sass

If you want to use the custom sass styles on the about page, first wire in the `about.scss` page in your `www/app/app.scss` sass file, like so: `@import 'about/about';`.

## A quick note on naming conventions

For Ionic v2, we've contributed to a [naming convention](https://en.wikipedia.org/wiki/Naming_convention_%28programming%29#Multiple-word_identifiers) of kabob-casing for file names (my-about-page.html) and css classes (.my-about-page), and using PascalCasing for JavaScript classes in ES6 / TypeScript (MyAboutPage).


## Other generators

Check out all the generators available: `ionic g --list`

```bash
~/Development/testing/MyIonic2App$ ionic g --list
Available generators:
 * component
 * directive
 * injectable
 * page
 * page-login
 * page-sidemenu
 * page-signup
 * pipe
 * tabs
```

# Final words

We hope you find the generators help you get started with ramping up quickly and building some awesome Ionic applications! Enjoy.
