---
layout: page
title: "npm Registry viewer"
date: 2015-09-20 22:38
comments: true
sharing: true
footer: true
---
<script type="text/javascript" src="javascripts/angular.min.js"></script>
<script type="text/javascript" src="javascripts/registryctrl.js"></script>

Currently I wanted a quick and easy interface to look up npm packages simple information for tags, versions, and other info npm doesnt show.

{% raw %}
<div ng-app="viewer" ng-controller="RegistryCtrl">
  <div class="item">
    <span>Package name</span>
    <input type="text" ng-model="packageName" ng-change="lookUpPackage(packageName)">
    <button class="button button-small" ng-click="lookUpPackage(packageName)">Look up</button>
  </div>
  <div ng-if="npmInfo">
    <h2>Info</h2>
    <div>
      <span>{{npmInfo.name}}</span> -
      <span>{{npmInfo.description}}</span>
    </div>
    <div>
      <br>
      <p>Tags</p>
    </div>
    <div>
      <div class="dist-tag" ng-repeat="(key, value) in npmInfo['dist-tags']">
        {{key}} => {{value}}
      </div>
    </div>
    <div>
      <br>
      <p>Versions</p>
      <div ng-repeat="(key, value) in npmInfo['versions']">
        {{key}}
      </div>
    </div>
  </div>
</div>

{% endraw %}
