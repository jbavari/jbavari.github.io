---
layout: post
title: "AngularJS - testing HTTP Post Data"
date: 2014-06-23 13:37
comments: true
categories: javascript angularjs testing
---

I've been doing a lot of testing lately in AngularJS, as I'm sure you can tell from my many posts as of late.

One thing I'm always curious about is whether or not I'm doing things correctly. Testing always helps reinforce this, as does publishing blogs and getting feedback from my peers. 

## Problem

Many times I'll have my AngularJS service fire off an HTTP post request to the server for a message. I can't even begin to tell you how much I sometimes butcher my POST request data.

I wrote a test to verify my post data was correct for the following function:

``` js
var sendPost = function sendPost(post) {
	var deferred = $q.defer();
	var publishPostPath = 'http://example.com/post';
	var postData = { 
		event_user_id: Auth.currentUser().id,
		lat: location == null ? post.lat : 0,
		lon: location == null ? post.lon : 0,
		message: post.storyMessage,
		post_fb: post.postToFB, 
		post_twitter: post.postToTwitter,
		post_team: post.postToTeam,
		tag: selectedTagId == null ? 0 : selectedTagId
	};

	$http.post(publishPostPath, postData).success(function(data) {
		if(data) {
			deferred.resolve(data);
		} else {
			deferred.reject(data);
		}
	}).error(function(error) {
		deferred.reject(error);
	});

	return deferred.promise;

}
```

Pretty simple, nothing too fancy.

I want to test this bad boy and make sure its passing the correct post data parameters. Luckily for us, AngularJS gives us our friendly `$httpBackend` tool to do things like this:

``` js
// Method declaration
expect(method, url, [data], [headers]);
```

One thing to note, is the function for `[data]` is a version of the POST data object after its been run through something like `JSON.stringify`.

A full test looks like this:

``` js
it('should have true returned for proper sendPost', function() {
	var post = {storyMessage: 'Hello', postToFB: true, postToTwitter: true, postToTeam: false};
	$httpBackend.when('POST', 'http://example.com/post',
		function(postData) {
			jsonData = JSON.parse(postData);
			expect(jsonData.message).toBe(post.storyMessage);
			expect(jsonData.post_fb).toBe(post.postToFB);
			expect(jsonData.post_twitter).toBe(post.postToTwitter);
			expect(jsonData.post_team).toBe(post.postToTeam);
			return true;
		}
	).respond(200, true );

	Feed.sendPost(post).then(function(d) {
		expect(d).toBeTruthy();
	});

	$httpBackend.flush();
});
```

Going forward, there should be no excuses as to why my HTTP post requests fail due to parameters being passed or set incorrectly.

I hope this helps any others looking to test their post data parameters.