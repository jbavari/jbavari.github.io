---
layout: post
title: "Enabling Android Remote Debugging in Phonegap 2.9"
date: 2014-04-18 10:13
comments: true
categories: cordova phonegap android
---

Recently the Cordova (as well as Phonegap) team has introduced [the ability to remote debug Android 4.4+](http://www.raymondcamden.com/index.cfm/2014/1/2/Apache-Cordova-33-and-Remote-Debugging-for-Android) from [this issue](https://issues.apache.org/jira/browse/CB-5487).

If you're like us, you have a lot of invested technology into Phonegap 2.9, and are actively making the move to Cordova 3.4. In the real world, you aren't always granted conveniences to move to the latest and greatest all at one time when you have released products. [Raymond Camden did a survey](http://www.raymondcamden.com/index.cfm/2014/4/11/Results-of-PhoneGap-Survey) and apparently there are still some out there utilizing Phonegap/Cordova 2.9.

I wanted to show how easy it was our team to backport some of the changes needed to enable Remote Debugging in Phonegap 2.9.

You'll need to make a few changes to your MainActivity.java file. The first is an import statement, and the second is to make these changes near the bottom of the onCreate method:

```
// At the top near your other import statements:
import android.webkit.WebView;
// ..snip..!

public void onCreate(Bundle savedInstanceState) {
    // ..snip..
    // Enable web debugging
    if(android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.KITKAT) {
		WebView.setWebContentsDebuggingEnabled(true);
    }
}
```

One thing to note, this only works for Android versions 4.4 or greater! If you aren't using Android API 19 or greater, you'll have to keep using Weinre.

Now just start your app, enable USB debugging, open Chrome, go to about:inspect, and enjoy your remote debugging in Phonegap/Cordova 2.9! Cheers!