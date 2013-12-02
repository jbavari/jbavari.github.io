---
layout: post
title: "Automating Phonegap Builds with Grunt"
date: 2013-11-30 21:36
comments: true
categories: 
---

One big thorn in my side lately has been getting our Phonegap/Cordova builds out to our team and having to jump through a ton of steps that are very error prone.

### What usually happens

"Hey can we please get a new build out to test with?" - Datachomp  
"Yea, give me a few minutes to get the build out." - DevDweeb  
"Ok, lemme know when" - Datachomp  
--30 minutes later--  
"Hows that build coming?" - Datachomp  
"Oh man.. not sure.. something messed up along the way. It'll be a bit more" - DevDweeb  
--waits a bit more---  
"Nevermind. I figured it out." - Datachomp  
"Ok whew, cuz it will be a bit more" - DevDweeb  

### What I wish would happen

"Hey can we please get a new build out to test with?" - Datachomp  
"That was done an hour ago, sir" - Jenkins  

### What is the prob, bob

It's the process. Here's what a human would typically go through for the project:

1) Point the build at the correct API end point (localhost/stage/production)  
2) Ensure the HTML has the script for weinre remote debugging (may need to be commented out if not needed)  
3) Open XCode - build the ios project  
4) Take the build from the project - upload to Testflight  
5) Open Eclipse - build the android project  
6) Take the build from the android project - upload to Testflight  

That is a predictable set of steps for a human, but as we all know, humans are prone to make errors. I know I do. 

The answer, then, is I didn't know how bad ass Grunt was and has so many plugins to assist with automation as I do now.

Luckily for me, I found a great post from Jim at imgur, from his post here: http://imgur.com/blog/2013/07/16/tech-tuesday-using-grunt-to-simplify-deployment-processes/

I'm going to dive in to some ways I've put together some grunt tasks to accomplish the above tasks.

## Introducing Grunt Task Runner 

Grunt is a javascript task runner. Learn more at http://gruntjs.com/ 

The reason I like using it - the config for grunt is in javascript, grunt is lightweight, grunt has very little requirements, and you can get started with a ton of plug-ins available. 

I plan on looking at Jenkins to integrate some of these tasks on check-ins for auto or nightly builds. See this post for an idea: http://sideroad.secret.jp/articles/grunt-on-jenkins/

### A few plug-ins I'm using so far:

Grunt Shell - https://github.com/sindresorhus/grunt-shell
This plugin gives you some shell commands to easily fire off shell commands such as xcodebuild, or even fire up a weinre server.

Grunt preprocess - https://github.com/jsoverson/grunt-preprocess
Great tool to combine template files with environment settings to preprocess HTML/Javascript files to drop in IPs or other settings you specify

Grunt env - https://github.com/jsoverson/grunt-env
Grunt tasks to automate environment configuration for future tasks.

Removing the human element for app settings
-------------------

The human must first place the proper host or ip address in place based on where the build may desire to be pointed at as well as whether or not they want Weinre remote debugging (Read about weinre here: http://people.apache.org/~pmuellr/weinre/docs/latest/). 

The host/ip address is stored in the appsettings.js file and the weinre remote debugging IP is stored in the index.html page. 

First I specified the files that would be preprocessed in the grunt config file. In this case, I specified both appsettings.js and index.html located in a template directory being processed to another location relative from the gruntfile.

``` javascript Grunt preprocess settings
preprocess: {
  dev: {
    files : {
      './appsettings.js': '../tmpl/appsettings.js',
      '../index.html': '../tmpl/index.html'
    }
  },
  prod: {
    files: {
      './appsettings.js': '../tmpl/appsettings.js',
      '../index.html': '../tmpl/index.html'
    }
  },
  stage: {
    files : {
      './appsettings.js': '../tmpl/appsettings.js',
      '../index.html': '../tmpl/index.html'
    }
  }
}
```

Then I specified the ENV settings in the grunt config:

``` javascript Grunt env settings
env: {
  dev: {
      NODE_ENV: 'DEVELOPMENT',
      IP_ADDRESS: ipAddress
  },
  prod : {
      NODE_ENV: 'PRODUCTION'
  },
  stage: {
    NODE_ENV: 'STAGE'
  }
}
```

You'll notice above, I assigned an ENV variable IP_ADDRESS to a variable ipAddress, which I've specified for Grunt as an option that is passed in via command line. That looked something like this snip:

``` javascript Grunt option for command line parameters
module.exports = function(grunt) {
  var ipAddress = grunt.option('host') || 'localhost';
  // Project configuration.
  grunt.initConfig({
    preprocess: {
      dev: {
        files : {
          './appsettings.js': '../tmpl/appsettings.js',
          '../index.html': '../tmpl/index.html'
        }
      }
    },
    env: {
      dev: {
        NODE_ENV: 'Development',
        IP_ADDRESS: ipAddress
      }
    }
  });
};
```

Using the command line to specify the host, you'd invoke the following grunt command to set up a local dev environment with the server at the specified IP Address:

``` bash Passing host/ip address to the grunt tasks
grunt preprocess:dev --host=192.168.1.100
```

Now I need to specify some templates to make use of the ENV variables set up. The grunt preprocess plugin documentation is great, so head there for more info. Here is how I applied it to the two files, appsettings.js and index.html

``` javascript AppSettings.js
AppSettings = {
	// @if NODE_ENV == 'DEVELOPMENT'
	basePath: "http:///* @echo IP_ADDRESS */:3000/",
	uploadBasePath: "http:///* @echo IP_ADDRESS */:3000/",
	uploadURI: "https://media.address.com",
	debug: true
	// @endif
	// @if NODE_ENV == 'STAGE'
	basePath: "http://stage.server.com/",
	uploadBasePath: "http://stage.server.com/"
	// @endif
	// @if NODE_ENV == 'PRODUCTION'
	basePath: "http://prod.server.com/",
	uploadBasePath: "http://prod.server.com/"
	// @endif	
}
```

And the template for index.html:

``` html index.html
.... snip ....
<!-- @if NODE_ENV='DEVELOPMENT' || NODE_ENV='STAGE' -->
<script src="http://<!-- @echo IP_ADDRESS -->:8080/target/target-script-min.js"></script> 
<!-- @endif -->
.... snip ....
```

Removing the human element from app uploads
-------

Another tool that changed the game up for me was the Nomad-cli - a set of tools to build and upload to testflight, amazon, or your FTP choice - found at http://nomad-cli.com/

This gives us a ruby gem we can use to fire off to handle all of our iOS tasks for building and pushing to test flight. The tool I mainly use is called Shenzhen.

A few things are needed. First, we had to create a Gemfile in a subdirectory that used the nomad cli gem:

``` ruby Gemfile for nomad
source 'https://rubygems.org'
gem 'nomad-cli'
```

Using the grunt shell task, I needed to ensure whoever ran this task got the nomad-cli gem first, fired off the command to build and distribute to testflight via shenzhen. It looked like this

``` javascript Grunt shell command for xcode build
shell: {
  testflight: {
    options: {
      stdout: true
    },
    command: [ 
      'cd ../../', 
      'bundle install', 
      'cd ./ios',
      'ipa build -p RaiseMore.xcodeproj -c Debug -s RaiseMore', 
      'ipa distribute -a <%= testflight_settings.raisemore.apiKey %> -T <%= testflight_settings.raisemore.teamToken -m "' + uploadMessage + '"'
      'cd ../android', 
      'ant debug', 
      'cd bin',
      "curl http://testflightapp.com/api/builds.json " +
      "-F file=@MainActivity-debug.apk " +
      "-F api_token='<%= testflight_settings.raisemore.apiToken %>' " +
      "-F team_token='<%= testflight_settings.raisemore.teamToken %>' " +
      "-F notes='Some notes for automated upload' " + 
      "-F notify=False " +
      "-F distribution_lists='Testers'"
    ].join("&&")
  }
}
```
As you can see, there are quite a bit of commands contained in that grunt shell task. Let's step through the steps, just to be clear.

1. CD to the IOS folder  
2. Call the nomad CLI tool to build iOS app  
3. Call the nomad CLI tool to upload to test flight  
4. CD to the Android folder  
5. Call the ant script to build the app  
6. Curl to upload the file to Test Flight

Perhaps you're wondering how I got the testflight_settings, I specified those as follows:

``` javascript Grunt testflight_settings
grunt.initConfig({
  testflight_settings: {
    raisemore: {
      apiToken: 'some_api_token_here',
      teamToken: 'some_team_token_here'
    }
  }
}
```

## Putting the pieces together

Lets see that Grunt config file now...

``` javascript Grunt config
module.exports = function(grunt) {

  //Options and variables

  var ipAddress = grunt.option('host') || 'localhost';
  var preprocess_files = {
    './appsettings.js': '../tmpl/appsettings.js',
    '../index.html': '../tmpl/index.html'
  };

  // Grunt Plug in configuration.

  grunt.initConfig({
    testflight_settings: {
      raisemore: {
        apiToken: 'apitoken',
        teamToken: 'teamtoken'
      }
    },
    preprocess: {
      dev: {
        files: preprocess_files
      },
      stage: {
        files: preprocess_files
      },
      prod: {
        files: preprocess_files
      }
    },
    env: {
      dev: {
        NODE_ENV: 'Development',
        IP_ADDRESS: ipAddress
      },
      stage: {
        NODE_ENV: 'Staging',
        IP_ADDRESS: ipAddress
      },
      prod: {
        NODE_ENV: 'Production'
      }
    },
    shell: {
      testflight: {
        options: {
          stdout: true
        },
        command: [ 
          'cd ../../', 
          'bundle install', 
          'cd ./ios',
          'ipa build -p RaiseMore.xcodeproj -c Debug -s RaiseMore', 
          'ipa distribute -a <%= testflight_settings.raisemore.apiKey %> -T <%= testflight_settings.raisemore.teamToken -m "' + uploadMessage + '"'
          'cd ../android', 
          'ant debug', 
          'cd bin',
          "curl http://testflightapp.com/api/builds.json " +
          "-F file=@MainActivity-debug.apk " +
          "-F api_token='<%= testflight_settings.raisemore.apiToken %>' " +
          "-F team_token='<%= testflight_settings.raisemore.teamToken %>' " +
          "-F notes='Some notes for automated upload' " + 
          "-F notify=False " +
          "-F distribution_lists='Testers'"
        ].join("&&")
      }
    }
  });

  //Now grunt tasks
  grunt.registerTask('dev', ['env:dev', 'preprocess:dev']);
  grunt.registerTask('stage', ['env:stage', 'preprocess:stage']);
  grunt.registerTask('prod', ['env:prod', 'preprocess:prod']);

  grunt.registerTask('testflight', ['env:stage', 'preprocess:stage', 'shell:testflight']);
};
```

So say then, our designer wants to try his design changes out with data from stage. He doesn't know what files to go touch, and most likely it gets confusing for him. Now with automation, he just types 'grunt stage'.

Or say, now someone needs to get a build out on test flight for some testers. Simply type 'grunt testflight'. 1 step is easier and way more predictable than the handful of steps one must jump through.

Although I'm sure there are better ways to do this, I'd love to hear about them. After fighting through tasks such as the grunt testflight plugin, and some vague issues there, the rather clear shell commands provide enough value for myself and my team to automate builds and even have these tasks integrated with any CL like Jenkins. 

I hope you can walk away with a few ideas and become more productive. Cheers!