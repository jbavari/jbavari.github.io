---
layout: post
title: "Grunt.js Orchestration & Organization of Applescript Actions"
date: 2014-01-24 14:14
comments: true
categories: 
---

Lately I've learned a little about AppleScript. If you're not familiar, I suggest reading the [AppleScript Language Guide](https://developer.apple.com/library/mac/documentation/applescript/conceptual/applescriptlangguide/introduction/ASLR_intro.html#//apple_ref/doc/uid/TP40000983-CH208-SW1) to get a little more background information about it. In a nutshell, however, its basically a scripting language developed by Apple to do Inter-application communication using AppleEvents (yes, I used the language from the Wiki page).

In the last few months, I've been absolutely obsessed with automating the boring tasks that wear me out. This is just another platform to add automation events. Imagine making a script that will open all your dev programs, set them up how you want them, launch a build process, focus a device simulator, and then begin clicking around that simulator. That is my vision for now.

In this post, I'd like to address some ways I'm leveraging AppleScript to automate some of my boring tasks. I won't focus much on the syntax, or how to navigate the language, but rather the methods I've used to learn this knowledge. I'll be using [Grunt.js](http://gruntjs.com/) to handle all my orchestration of applescript actions.

## Requirements

You must be using an Apple device such as a Mac. That's about it

## A Handy Tip

You might want to ensure you have Accessibility options turned on. You can learn about how to do that [here](http://www.macosxautomation.com/applescript/uiscripting/)

## Getting started

It's really easy folks, just pop open your favorite text editor or use the native AppleScript Editor and start cranking it out. 

Let's look an easy script that will do the following:

* Execute XCode run command
* Open Safari
* Run the Web Inspector for the Simulator running

```applescript
on open_developer_window()
	try
		tell application "Safari"
			activate
		end tell
		tell application "System Events"
			tell process "Safari"
				tell menu bar 1
					tell menu bar item 8
						tell menu 1
							tell menu item 4
								tell menu 1
									click menu item 2
								end tell
							end tell
						end tell
					end tell
				end tell
			end tell
		end tell
		return "Yo good job"
	on error error_message
		return error_message
	end try
end open_developer_window
```

## The problem

After finding out how powerful AppleScript is, I began cranking out scripts for all my boring tasks. It became pretty nasty to manage having hundreds of lines into a single script. 

The good news is, AppleScript has a way to import other scripts to use their methods, just by calling `load script <name>`.

The bad news is, it gets pretty sloppy trying to do the applescript 'load script' command, as it became pretty nasty pretty quick.

Thats where Grunt came in. I figured instead of having a few include scripts - make the applescript files have just the functionality I wanted

## Using Grunt Shell

I chose to use the [Grunt shell](https://github.com/sindresorhus/grunt-shell) plugin to execute these scripts. You can easily do it over shell by executing `osascript <name_of_script>`. 

What I did was create a nice layout for my applescript tasks as follows:

```
Applescripts
|
+---+--iPhone simulator tasks
	|  |
	|  +-- reset_simulator.applescript
	|
	+--safari tasks
	|  |
	|  +-- start_safari_dev_console.applescript
	|  +-- dev_console_test_runner.applescript
	|
	+--XCode tasks
	   |
	   +-- open_ios_project_file.applescript
	   +-- run_simulator.applescript
	   +-- select_simulator_6.applescript
```

Then, I created Grunt tasks for each applescript task as I wanted, as such:

``` javascript
grunt.initConfig({
	shell: {
		start_safari_dev_console: {
		    command: ['osascript ./applescripts/safari_tasks/start_safari_dev_console.applescript'].join("&&")
		},
		dev_console_test_runner: {
			command: ['osascript ./applescripts/safari_tasks/dev_console_test_runner.applescript'].join("&&")
		},
		open_ios_project_file: {
			command: ['osascript ./applescripts/xcode_tasks/open_ios_project_file.applescript'].join("&&")
		},
		run_simulator: {
			command: ['osascript ./applescripts/xcode_tasks/run_simulator.applescript'].join("&&")
		},
		simulator_6: {
			command: ['osascript ./applescripts/xcode_tasks/simulator_6.applescript'].join("&&")
		},
		reset_simulator: {
			command: ['osascript ./applescripts/simulator_tasks/reset_simulator.applescript'].join("&&")
		}
	}
});
```

Followed by a few set of tasks:

``` javascript

grunt.registerTask('run_sim', ['shell:run_simulator', 'shell:start_safari_dev_console']);

grunt.registerTask('start_project', ['shell:open_ios_project_file', 'shell:simulator_6', 'run_sim']);

grunt.registerTask('restart_sim', ['shell:reset_simulator', 'run_sim']);

```

## Useful tools

After learning the basic structure of AppleScript, it's easy to see how the structures are laid out. The hard part, is figuring out how they are actually laid out. There's an awesome built in tool, called "Accessibility Inspector". This tool will tell you the control you are focusing on an application.

The second tool that is EXTREMELY helpful is a tool called [UI Browser](http://pfiddlesoft.com/uibrowser/). This is a tool that you can select an application, hover over that application, and UI Browser will tell you that controls. It even has a drop down of common actions, like clicking, filling in text, and other common uses.

## Overall results

Altogether, I'm pretty happy with how my little Applescript trials went. It's very easy now to chain together applescript tasks using Grunt.

On a side note.. Apparently applescript is already used in some grunt plugins, as I've found tucked away in some projects code.

Happy coding.