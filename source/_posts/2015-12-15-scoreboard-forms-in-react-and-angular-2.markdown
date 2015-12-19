---
layout: post
title: "Scoreboard forms in React and Angular 2"
date: 2015-12-15 23:01
comments: true
categories: reactjs browserify angular2 webpack javascript es6 typescript
---

As a developer, you should be focused on spending some of your own time learning and staying up to date with technology that is always moving.

I wanted to find a reason to hop into some of the 'newer' front-end frameworks, React and Angular 2, as well as some of the module bundlers [browserify](http://browserify.org/) and [webpack](https://webpack.github.io/).

I had the opportunity to try out Angular 2 while it was still in alpha. With the recent announcement of Angular 2 going out in Beta, I wanted to build a Scoreboard form that went along with my Scoreboard project to evaluate the two frameworks.

This post will aim to build a simple scoreboard form in both frameworks, so you can see the same DOM interactions and the code it takes to form them. 

Please also note, I'm still very much learning, and some code may not be 'ideal'.

We'll cover:

* The scoreboard form idea
* Learning the ideas behind the frameworks
* The bundling systems
* Angular 2 implementation (TypeScript)
* React implementation (ES6)
* The differences between the two
* Pros and Cons of each (in my eyes)

# The Scoreboard Form

A scoreboard is simple - you'll enter the two team names, then specify a touchdown or field goal for either team.

That means we will need a few components: a scoreboard and a team.

The idea will be to build these components in React and Angular2, having them use similar templates to render to the equivalent DOM structures.

## Learning the ideas behind the frameworks

Both frameworks aim to contain all of the functionality and display into a component.

The idea will be to build a team component, that displays teams, and a scoreboard component, that will display both of those teams and have a submit method to post that data to our scoreboard API server.

The main difference we will see between the two frameworks is adapting to [ES6](http://es6-features.org/) or [TypeScript](http://www.typescriptlang.org/).

In either framework, we will create a class for the component in ES6/TypeScript, and then connect the template to it, and finally attach it in the DOM.

# The bundling systems

We will use Browserify to pack up React into a single module, while using webpack to bundle up Angular 2 into a single bundle. 

What is bundling you say? It's taking all the source for our components and bundling them up with the framework code to have one JavaScript file to load the entire bundle. That way, we only need one JavaScript file instead of a whole load of `<script>` tags.

# Angular 2 implementation

Angular 2 is built in TypeScript, which is a superset of JavaScript that allows types to have a 'stronger type' to work with. We will build our component in TypeScript, and transpile it down to ES5 JavaScript.

## Building the Team component

In Angular 2, we need to use a decorator ([see this blog post about TypeScript decorators](https://www.sitepen.com/blog/2015/10/20/typescript-decorators/)) to specify a Team as a component that will render.

We will import the Decorator, `Component`, and then apply it to our class. The `Component` decorator specifies which DOM element it will attach to (in this case, `team`), any inputs our control may have, what template it will use (specified as the `template` key), and what other directives will be used to parse our template.

Then, we have our class that defines the component itself with a name and score, methods to increase score (`touchdown` and `fieldGoal`), a `toJson` method, and finally callbacks to update itself from the parent component.

The team component:

```
import {Component, EventEmitter, Output} from 'angular2/core';
import {NgFor, NgIf, NgModel} from 'angular2/common';

@Component({
  directives: [NgFor, NgIf, NgModel],
  selector: 'team',
  template: `
    <div *ngIf="name == ''">
      <h3>No team set</h3>
      <input type="text" [(ngModel)]="nameInput" placeholder="Enter a name"/>
      <button type="submit" (click)="setName()">Set name</button>
    </div>
    <div *ngIf="name != ''">
      <h3>{{name}}</h3>
      <button (click)="touchdown($event)">Touchdown</button>
      <button (click)="fieldGoal($event)">Field Goal</button>
      <h4>Score: {{score}}</h4>
    </div>
    `
    }
})
export class Team {
  @Output() updateTeam = new EventEmitter<Team>();
  constructor() {
    this.nameInput = '';
    this.name = '';
    this.score = 0;
  }

  fieldGoal(e) {
    e.preventDefault();
    this.score += 3;
  }

  touchdown(e) {
    e.preventDefault();
    this.score += 7;
  }

  setName(nameInput) {
    this.name = this.nameInput;
    this.nameInput = '';
    if(this.updateTeam) {
      this.updateTeam.next(this);
    }
  }

  toJson() {
    return { name: this.name, score: this.score };
  }
}

```

## Defining the scoreboard component

Now we need to displays these teams in a side by side manner, a callback to update information from the team component, and a method to submit the scores to the API.

We'll define the component as follows:

```
import {Component} from 'angular2/core';
import {Team} from '../team/team';

@Component({
  directives: [Team],
  selector: 'scoreboard',
  template: `
    <form (ngSubmit)="submitScore()">
      <div class="row">
        <div class="col-md-6">
          <h2>Home Team</h2>
          <team (updateTeam)="updateHomeTeam($event)" home="true"></team>
        </div>
        <div class="col-md-6">
          <h2>Visitor Team</h2>
          <team (updateTeam)="updateVisitorTeam($event)"></team>
        </div>
      </div>
      <div class="row">
        <button type="submit">Submit</button>
      </div>
      <div *ngIf="submitted">
        JSON payload: {{jsonPayload}}
      </div>
    </form>  
  `
})
export class Scoreboard {
  homeTeam: Team = new Team();
  visitorTeam: Team = new Team();
  submitted: boolean = false;
  jsonPayload: string = null;

  constuctor() {
  }

  submitScore() {
    this.submitted = true;
    this.jsonPayload = JSON.stringify({ homeTeam: this.homeTeam.toJson(), visitorTeam: this.visitorTeam.toJson()});
  }

  updateHomeTeam(team: Team) {
    this.homeTeam = team;
  }

  updateVisitorTeam(team: Team) {
    this.visitorTeam = team;
  }
}

```


## Pros and Cons


### Pros



### Cons

* Angular 2 - docs are all over the place.
* Main blogs that are linked from docs site are using old kabob style (e.g. `*ng-if` instead of `*ngIf`).
* Webpack configuration - I didn't include zone.js in my entries, and I could not get any DOM updates coming from my components changing.
* When to use two-way bindings, and one-way bindings was good enough.
* No 'why' to what im doing - it aims to just follow the same 'idea' as Angular.js.
* Plunkers aren't up to date.


# React implementation (ES6)

Now that we have the basic idea of the team and scoreboard, you'll see React is very similiar. Instead of having a decorator specify the template and DOM elements to attach to, we'll specify a class that extends `React.Component`, a method that will render the markup, and finally, some bootstrap code to attach our class to a DOM element.

## Defining the team component

```
import React from 'react';

export default class Team extends React.Component {
  constructor(props) {
    super(props);
    this.props = props;
    this.name = props.name;
    this.score = props.score || 0;
    this.setName = this.setName.bind(this);
    // this.state = {name: this.name, score: this.score};
    this.touchdown = this.touchdown.bind(this);
    this.fieldGoal = this.fieldGoal.bind(this);
  }

  fieldGoal(e) {
    e.preventDefault();
    this.score += 3;
    this.setState(this);
  }

  touchdown(e) {
    e.preventDefault();
    this.score += 7;
    this.setState(this);
  }

  setName(e) {
    e.preventDefault();
    this.name = this.refs.teamName.value;
    this.setState(this);
    this.props.update(this);
  }

  toJson() {
    return { name: this.name, score: this.score };
  }

  render() {
    if (!this.name) {
      return (
        <div>
          <h3>No team set</h3>
          <input type="text" ref="teamName" placeholder="Enter a name.." value={this.props.name}/>
          <button onClick={this.setName}>Set Name</button>
        </div>
      );
    } else {
      return (
        <div>
          <h3>{this.name}</h3>
          <button onClick={this.touchdown}>Touch Down</button>
          <button onClick={this.fieldGoal}>Field Goal</button>
          <h4>Score: {this.score}</h4>
        </div>
      );
    }
  }
}
```

## Defining the Scoreboard component

```
import Team from './team.jsx';
import React from 'react';

export default class Scoreboard extends React.Component {
  constructor(props) {
    super(props);
    this.homeTeam = {};
    this.visitorTeam = {};
    this.url = this.props.url;
    this.submit = this.submit.bind(this);
    this.updateTeam = this.updateTeam.bind(this);
    this.submitted = false;
    this.jsonPayload = null;
  }

  submit(event) {
    event.preventDefault();
    this.submitted = true;
    this.setState(this);
    this.jsonPayload = JSON.stringify({ homeTeam: this.homeTeam.toJson(), visitorTeam: this.visitorTeam.toJson()});
  }

  updateTeam(team) {
    if (team.props.home) {
      this.homeTeam = team;
    } else {
      this.visitorTeam = team;
    }
  }

  render() {
    var jsonInformation = this.submitted ? (<div>JSON payload: {this.jsonPayload}</div>) : null;
    return (
      <form onSubmit={this.submit}>
        <div className="row">
          <div className="col-md-6">
            <h2>Home Team</h2>
            <Team home="true" update={this.updateTeam}></Team>
          </div>
          <div className="col-md-6">
            <h2>Visitor Team</h2>
            <Team update={this.updateTeam}></Team>
          </div>
        </div>
        <div className="row">
          <button type="submit">Submit</button>
        </div>
        {jsonInformation}
      </form>
    )
  }
}
```

Now you'll see, theres no way we tell React to attach to a DOM node to attach our components to the browser DOM.

This happens by the bootstrapping code:

```
import React from 'react';
import ReactDOM from 'react-dom';
import Scoreboard from '../component/scoreboard.jsx';

window.app = (function() {
  return ReactDOM.render(<Scoreboard/>, document.getElementById('react-scoreboard'));
})();
```

Now, React knows to use our `Scoreboard` component (the one that was imported) to attach it to the `react-scoreboard` DOM element with an id of `react-scoreboard`. Internally for the Scoreboard, it specifies it's render method:

```
import Team from './team.jsx';
// .. snipped code ..
render() {
  var jsonInformation = this.submitted ? (<div>JSON payload: {this.jsonPayload}</div>) : null;
  return (
    <form onSubmit={this.submit}>
      <div className="row">
        <div className="col-md-6">
          <h2>Home Team</h2>
          <Team home="true" update={this.updateTeam}></Team>
        </div>
        <div className="col-md-6">
          <h2>Visitor Team</h2>
          <Team update={this.updateTeam}></Team>
        </div>
      </div>
      <div className="row">
        <button type="submit">Submit</button>
      </div>
      {jsonInformation}
    </form>
  )
}
```

## Pros and Cons

### Pros

[React Dev tools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi?hl=en) - inspect react components, super handy.
Dev docs talk about how to think in react - giving the why before the what, really helped understand the concepts.

### Cons

Dev tooling is not straight forward - you have to decide yourself.
Figuring how to plug in rendering steps between state changes. `this.setState({})` with some state information.


# Conclusions

I really like the approach React takes. I also feel like it is a year early to the Virtual DOM party, and Angular 2 is really trying to keep up. 

As far as intuition and ease of development goes, React was definitely easier. Even with my previous Angular 2 knowledge, it still took me longer to get up and going.

To give Angular 2 a fair shot, it is still in Beta. However, if I were to start a project today, it would be in React, due to the huge community that is building, the tooling available, and being backed by Facebook, one of the utmost leaders in User inface design and performance.

I hope this short write up helps! If you have any questions, please drop a comment and we'll clear things up!

Cheers!
