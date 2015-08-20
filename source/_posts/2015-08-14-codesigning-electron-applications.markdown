---
layout: post
title: "Codesigning Electron Applications"
date: 2015-08-14 11:30
comments: true
categories: 
---

Lately I've been busy at work creating and maintaining [Ionic Lab](http://lab.ionic.io). It's been a fun and challenging problem using HTML/CSS/JavaScript to create native OSX/Windows applications.

I'm going to admit - I've gotten a few hybrid projects on the App store. Honestly though I had a lot of help. 

This time I was mostly on my own. 

I'm not great at the native dev and half the problems I occur are with the platform I am dealing with. In this I mean - Android I deal with how Google does signing and releasing and how Apple does signing and releasing.

I'm going to cover mainly Apple policies to release an app on your own with or without the App store. With Electron, we're going to make a native build, so we'll need to know how to do this.

## Mac's Gatekeeper

On Mac OSX, there's an application that checks all the applications you download and run to see if they are valid and trusted.

Certainly you've seen the message from an app you've downloaded: `"App can't be opened because it is from an unidentified developer."`

If you create and app and do not codesign it with a valid Apple dev account, your users will see this. It's not a good thing.

## How to codesign

The main tool of codesigning is the CLI tool `codesign`.

I really found a lot of help from [OSX Code Signing in Depth](https://developer.apple.com/library/mac/technotes/tn2206/_index.html#//apple_ref/doc/uid/DTS40007919-CH1-TNTAG400).

It's pretty clear right away what you need to run and how to verify what you need to run. I'd like to go over how to do it with Electron, specifically.

I posted the script below. I want to highlight the issues I ran into as a result of my ignorance.

One issue I ran into - I was using the "Mac Development" certificate to sign - and when I ran the verify command (`codesign -vvvv -d "/path/to/MyApp.app"`) it gave me a good to go signal. When I ran the security CLI command (`spctl --assess -vvvv "/path/to/MyApp.app"`), it was rejected. 

My error: I thought "Mac Development" was a "Developer-ID application". 

It's not. I was an account admin. In the Apple Member Center for Certificate Administration, I could only set up a "Mac Development" type certificate. Apple member center would not let met set up a "Developer ID Application" certificate. You need a 'team agent' to set one up for you. (That or become a team agent)

That being said - ensure you sign with a certificate type of "Developer ID Application" to sign with, and you're good to go.

I set up my codesign script like [the following](https://github.com/nwjs/nw.js/issues/616#issuecomment-30844482). There's comments to help understand:

```sh
# Invoke this script with a relative `.app` path
# EX:
# codesign.sh "dist/osx/MyApp-darwin-x64/MyApp.app"

# I had better luck using the iPhoneOS codesign_allocate
export CODESIGN_ALLOCATE="/Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/usr/bin/codesign_allocate"

# Next two are specified in Apple docs:
# export CODESIGN_ALLOCATE="/Applications/Xcode.app/Contents/Developer/usr/bin/codesign_allocate"
# export CODESIGN_ALLOCATE="/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/codesign_allocate"

# However, neither worked, and gave error:
# /Users/JoshBavari/Development/ionic-gui/dist/osx/MyApp-darwin-x64/MyApp.app/Contents/Frameworks/Electron Framework.framework/Electron Framework: cannot find code object on disk

#Run the following to get a list of certs
# security find-identity
app="$PWD/$1"
identity="<ENTER_ID_OF_RESULT_FROM_SECURITY_FIND_IDENTITY_COMMAND>"

echo "### signing frameworks"
codesign --deep --force --verify --verbose --sign "$identity" "$app/Contents/Frameworks/Electron Framework.framework/Electron Framework"
codesign --deep --force --verify --verbose --sign "$identity" "$app/Contents/Frameworks/Electron Framework.framework/"
/Versions/A"
codesign --deep --force --verify --verbose --sign "$identity" "$app/Contents/Frameworks/Electron Framework.framework/Versions/Current/Electron Framework"
codesign --deep --force --verify --verbose --sign "$identity" "$app/Contents/Frameworks/Electron Helper EH.app/Contents/MacOS/Electron Helper EH"
codesign --deep --force --verify --verbose --sign "$identity" "$app/Contents/Frameworks/Electron Helper NP.app/Contents/MacOS/Electron Helper NP"
codesign --deep --force --verify --verbose --sign "$identity" "$app/Contents/Frameworks/Electron Helper NP.app/Contents/MacOS/Electron Helper NP"
codesign --deep --force --verify --verbose --sign "$identity" "$app/Contents/Frameworks/MyApp Helper.app/Contents/MacOS/MyApp Helper"
codesign --deep --force --verify --verbose --sign "$identity" "$app/Contents/Frameworks/Mantle.framework/Mantle"
codesign --deep --force --verify --verbose --sign "$identity" "$app/Contents/Frameworks/Mantle.framework/Versions/A"
codesign --deep --force --verify --verbose --sign "$identity" "$app/Contents/Frameworks/ReactiveCocoa.framework/ReactiveCocoa"
codesign --deep --force --verify --verbose --sign "$identity" "$app/Contents/Frameworks/ReactiveCocoa.framework/Versions/A"
codesign --deep --force --verify --verbose --sign "$identity" "$app/Contents/Frameworks/Squirrel.framework/Squirrel"
codesign --deep --force --verify --verbose --sign "$identity" "$app/Contents/Frameworks/Squirrel.framework/Versions/A"

echo "### signing app"
codesign --deep --force --verify --verbose --sign "$identity" "$app"


echo "### Zipping app"
ditto -c -k --sequesterRsrc --keepParent dist/osx/MyApp-darwin-x64/MyApp.app/ dist/osx/MyApp-Mac.zip

echo "### verifying signature",
codesign -vvvv -d "$app"
sudo spctl -a -vvvv "$app"
```

## Pitfalls

Since I wasn't very familiar with the Apple specifics I'd like to high light a few pitfalls I ran into with my ignorance.

A 'Developer-ID signed app' means setting up a certificate (private key + cert) with "type" as "Developer ID Application". This does *NOT* mean a "Mac Development" certificate. From the OSX Codesigning guide:

> Like Gatekeeper, spctl will only accept Developer ID-signed apps and apps downloaded from the Mac App Store by default. It will reject apps signed with Mac App Store development or distribution certificates.

# Issues

Most users say to specify this environment variable:

`export CODESIGN_ALLOCATE="/Applications/Xcode.app/Contents/Developer/usr/bin/codesign_allocate"`

For some reason, I couldn't use the default codesign allocate as specified in the Github issue above. Instead, I had to go with this Environment variable for CODESIGN_ALLOCATE for `iPhoneOS.platform`:

`export CODESIGN_ALLOCATE="/Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/usr/bin/codesign_allocate"`

# Hints

Only include signed code in directories that should contain signed code.
Only include resources in directories that should contain
resources.
Do not use the --resource-rules flag or ResourceRules.plist. They have been obsoleted and will be rejected.

## A little note on signing frameworks [5]:

### Signing Frameworks

When you sign frameworks, you have to sign a specific version. So, let’s say your framework is called CSMail, you’d sign CSMail.framework/Versions/A. If you try and just sign the top level folder it will silently fail, as will CSMail.framework/Versions/Current (see “Symbolic Links” below).

### Symbolic Links

Any symbolic links will be silently ignored and this extends to the path you give to the codesign command line utility. I think there’s actually a problem with symbolic links: you can add them to a Resources folder and it won’t invalidate the signature (whereas you cannot add normal files). I’ve reported this to Apple (rdar://problem/6050445).

# Helpful links

1. [Apple Code Signing Overview](https://developer.apple.com/library/mac/documentation/Security/Conceptual/CodeSigningGuide/AboutCS/AboutCS.html)
2.  [Apple OS X Code Signing In Depth](https://developer.apple.com/library/mac/technotes/tn2206/_index.html#//apple_ref/doc/uid/DTS40007919-CH1-TNTAG205)
3. [Apple Anatomy of Framework Bundles](https://developer.apple.com/library/mac/documentation/MacOSX/Conceptual/BPFrameworks/Concepts/FrameworkAnatomy.html)
4. [Apple codesign Man Page](https://developer.apple.com/library/mac/documentation/Darwin/Reference/ManPages/man1/codesign.1.html#//apple_ref/doc/man/1/codesign)
5. [Chris Suter's Blog - Code signing](http://sutes.co.uk/2008/07/code-signing.html)
6. [Stackoverflow - Creating Symlinks in OSX Frameworks](http://stackoverflow.com/questions/27871099/creating-symlinks-in-osx-frameworks-inside-app-bundle)
7. [How to sign your Mac OSX app for Gatekeeper](http://successfulsoftware.net/2012/08/30/how-to-sign-your-mac-os-x-app-for-gatekeeper/)
8. [Codesigning and Mavericks](http://furbo.org/2013/10/17/code-signing-and-mavericks/)
9 [Atom Electron - Signing Mac App](http://www.pracucci.com/atom-electron-signing-mac-app.html)
10. [Codesign - useful info in Xcode > 5.0](http://blog.hoachuck.biz/blog/2013/10/29/codesign-useful-info-in-xcode-5-dot-0-1/)
11. [Electron for the Mac App Store](http://www.saschawise.com/blog/2015/08/12/electron-for-the-mac-app-store.html)
12. [nw.js issue about code signing](https://github.com/nwjs/nw.js/issues/616#issuecomment-30844482).
