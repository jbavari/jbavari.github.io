---
layout: post
title: "Angular 2 and ng-model"
date: 2015-10-21 23:00
comments: true
categories: angular2 ionic2 javascript
---

Angular 2 introduces `ng-model` from Angular 1 in a completely different manner. Due to this, I wanted to make a quick post on how to use Angular 2's `ng-model` to build components that alert its parents app/component of changes.

I'm going to use the [Ionic 2 conference app](https://github.com/driftyco/ionic-conference-app) as an example.

In this post, we'll look at the schedule page in the app and see how it uses the `ion-search-bar` to update its `searchQuery` to filter out sessions from the schedule when the user changes the search input.

## The set up

On the [schedule component](https://github.com/driftyco/ionic-conference-app/blob/master/www/app/schedule/schedule.js#L24), we set up the search query as a simple string, as such: `this.searchQuery = '';`.

Then in our [schedule page template](https://github.com/driftyco/ionic-conference-app/blob/master/www/app/schedule/schedule.html#L21), we tell the `ion-search-bar` to use the `ng-model` directive and tell it to two-way bind using the schedule component's `searchQuery` variable. 

The template is like this:

```html
<ion-search-bar [(ng-model)]="searchQuery" placeholder="Search"></ion-search-bar>
```

Now, in the search bar, we need to take that `searchQuery` as an ngModel, and ensure the search-bar has a [value accessor](https://github.com/angular/angular/blob/master/modules/angular2/src/core/forms/directives/ng_control.ts#L14) implemented, so that we may tell the schedule component of when things change to update its shadow DOM if need be.

The [ion-search-bar](https://github.com/driftyco/ionic2/blob/master/ionic/components/search-bar/search-bar.ts#L46-L62) will take an `ngControl` as part of it's injection, and sets up the [value accessor](https://github.com/driftyco/ionic2/blob/master/ionic/components/search-bar/search-bar.ts#L61) to itself, like so:

```js
constructor(
  elementRef: ElementRef,
  config: Config,
  ngControl: NgControl,
  renderer: Renderer
) {
  super(elementRef, config);
  this.renderer = renderer;
  this.elementRef = elementRef;
  if(!ngControl) {
    // They don't want to do anything that works, so we won't do anything that breaks
    return;
  }

  this.ngControl = ngControl;
  this.ngControl.valueAccessor = this;
}
```

NOTE: `ngModel` extends the `ngControl` class in angular ([source code](https://github.com/angular/angular/blob/master/modules/angular2/src/core/forms/directives/ng_model.ts#L44)). The [`valueAccessor`](https://github.com/angular/angular/blob/master/modules/angular2/src/core/forms/directives/ng_control.ts#L14) is a [ControlValueAccessor](https://github.com/angular/angular/blob/master/modules/angular2/src/core/forms/directives/control_value_accessor.ts) is an interface that provides certain methods, like so:

```js
export interface ControlValueAccessor {
  writeValue(obj: any): void;
  registerOnChange(fn: any): void;
  registerOnTouched(fn: any): void;
}
```

The `ControlValueAccessor` gives us a method to write the new value, a method to register to listen to the changes, and the register on touched function to allow components to use.

Those are implemented in the search-bar, as seen [here](https://github.com/driftyco/ionic2/blob/master/ionic/components/search-bar/search-bar.ts#L82-L92).

You can see that the `writeValue` method on `search-bar` updates it's local `value`, so that it's internal `<input>` element can update its value it shows. When that internal input is changed, it calls the [inputChanged](https://github.com/driftyco/ionic2/blob/master/ionic/components/search-bar/search-bar.ts#L94-L98) event on the `search-bar`, which alerts other components that it has changed, as well as updating its current value.

```js
  inputChanged(event) {
    this.writeValue(event.target.value);
    this.onChange(event.target.value);
  }
```

### Filtering out sessions

Since the `onChange` event is called, the `schedule` component will see this and cause re-evaluation on its `searchQuery` variable, and filters the code.

That makes our filtering method super easy, [as seen here](https://github.com/driftyco/ionic-conference-app/blob/master/www/app/schedule/schedule.js#L54), copied below for convenience:

```js
getSessionsForTheDay() {
  if (!this.searchQuery || this.searchQuery.trim() == '') {
    return this.sessionsForTheDay;
  }
  var talks = [];
  this.sessionsForTheDay.forEach((session) => {
    var matched = session.talks.filter((v) => {
      if(v.name.toLowerCase().indexOf(this.searchQuery.toLowerCase()) >= 0) {
        return true;
      }
      return false;
    });
    if (matched.length > 0) {
      session.talks = matched;
      talks.push(session);
    }
  });
  return talks;
}
```

When the schedule component's variable for `searchQuery` is updated, this method will be auto-magically re-evaluated, which causes the list to update.

Hope this helps you understand Angular 2 and ng-models better! Enjoy!
