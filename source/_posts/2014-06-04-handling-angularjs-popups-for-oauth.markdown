---
layout: post
title: "Handling AngularJS Popups for OAuth on Rails"
date: 2014-06-04 22:56
comments: true
categories: rails angularjs javascript oauth popups
---

I've been using AngularJS a lot lately in some of my projects at work. It's been a great tool to use to help me solve challenging problems the nicest and cleanest way possible.

I ran into needing some users to log into a variety of different social platforms. Since I was using Rails, I chose to use [omniauth](https://github.com/intridea/omniauth) for [facebook](https://github.com/mkdynamic/omniauth-facebook) and [twitter](https://github.com/arunagw/omniauth-twitter). It became even more challenging because they needed to login to these platforms with THEIR social application ID's, not ours.

## The Problem

* Need to have admin window where user clicks login button for facebook or twitter and logs in with their Facebook application (think Coke, Pepsi, etc)
* User then sees pop up window where OAuth login process happens
* After OAuth login complete, pop up window goes away and they resume their actions

## The solution

### Solving dynamic twitter/facebook log ins for Social Platforms

I started by having this config in Rails for my omniauth initializer:

``` rb 
SETUP_FACEBOOK = lambda do |env| 
    AccountAuth.setup_facebook_keys(env)
end

SETUP_TWITTER = lambda do |env|
    AccountAuth.setup_twitter_keys(env)
end

Rails.application.config.middleware.use OmniAuth::Builder do
    provider :twitter, :setup => SETUP_TWITTER
    provider :facebook, :setup => SETUP_FACEBOOK
end
```

Simple and clean. In those AccountAuth methods, I take the `env` variable (essential the request) and pick off my variables there from an OAuth URL (http://my.dashboard.dev/auth/facebook?appid=123456789).

### Solving the User pop up

I had a dashboard with a ton of user actions, as well as two well placed social log in buttons. View template like so:

``` html
<div class="container" ng-controller="SettingsCtrl">
        <div class="row">
            <div class="col-md-12">
                <div class="header-copy">Account Settings</div>
                <div class="section-title"></div>
            </div>
        </div>

        <div class="row">
            <div class="col-md-6">
                <div class="header-copy">Facebook Settings</div>
                <div class="divider"></div>

                <div ng-show="facebookId">
                    Currently ({% raw %}{{ facebookName}}{% endraw %}) &nbsp;
                    <span class="btn dash-subs" ng-click="logout('facebook')">Logout</span>
                </div>
                <div ng-hide="facebookId">
                    <span class="btn dash-subs login-btn" ng-click="authNetwork('facebook')">Login With Facebook</span>
                </div>
            </div>
            <div class="col-md-6">
                <div class="header-copy">Twitter Settings</div>
                <div class="divider"></div>
                <div ng-show="twitterName">
                    Currently (@{% raw %}{{twitterName}}{% endraw %}) &nbsp;
                    <span class="btn dash-subs" ng-click="logout('twitter')">Logout</span>
                </div>
                <div ng-hide="twitterName">
                    <span class="btn dash-subs login-btn" ng-click="authNetwork('twitter')">Login With Twitter</span>
                </div>
            </div>
        </div>
    </div>

```

Now on my SettingsCtrl, I had to respond to the authNetwork clicks in the template above to show my pop up window for the network specified, handle its settings, then update this controller. We get that link by setting a global variable on the `window` that opened by doing `window.$windowScope = $scope`.

``` js
angular.module('myApp', ['ui.bootstrap']);

function SettingsCtrl($scope, $http) {
  //..snip!..
   $scope.handlePopupAuthentication = function handlePopupAuthentication(network, account) {

      //Note: using $scope.$apply wrapping
      //the window popup will call this 
      //and is unwatched func 
      //so we need to wrap
      $scope.$apply(function(){
         $scope.applyNetwork(network, account);
      });
   }

   $scope.authNetwork = function authNetwork(network) {
      var openUrl = '/auth/' + network + '?account_id=' + $scope.accountTokens['id'] + "&eid=" + eventId;
      window.$windowScope = $scope;
      window.open(openUrl, "Authenticate Account", "width=500, height=500");
   };
}
```

### Solving popup talking to AngularJS controller

Once the OAuth pop up that is being opened via `window.open` is completed, it will come back to our server (http://my.dashboard.dev/session/create) in which I will render a view through Rails that will display a simple 'this window is closing' message. It will also pass in some information from the Rails controller and pass back its completed information back to our calling AngularJS controller. (Thats a lot of controllers, folks)

```
<p>This view will now self-destruct</p>
<script>
   try {
      window.opener.$windowScope.handlePopupAuthentication('<%= @provider %>', <%= @account.to_json.html_safe %>);
   } catch(err) {}
   window.close();
</script>
```

### Conclusion

That's pretty much it. That is how I handled my popups reporting back to its calling AngularJS controller through OAuth on Rails. Hope this helps others out there trying to solve problems like these.