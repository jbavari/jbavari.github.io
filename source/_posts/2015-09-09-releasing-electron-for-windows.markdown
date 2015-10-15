---
layout: post
title: "Releasing Electron for Windows"
date: 2015-09-09 18:50
comments: true
categories: electron windows release
---

Releasing Electron applications on Windows can be a tricky issue. Especially if you mainly use a Mac (like me). And you have to think about that pesky [code signing](https://msdn.microsoft.com/en-us/library/ms537361%28v=vs.85%29.aspx) thing you have to do to avoid the annoying 'SmartScreen' filter users may get. 

Thankfully, there's a great tool called Squirrel made by [Paul Betts](https://twitter.com/paulcbetts) that does a ton of the heavy lifting for you. Codesigning and all.

I really got a ton of knowledge from the blog post, [Creating a Windows Distribution of an Electron App using Squirrel](http://www.mylifeforthecode.com/creating-a-windows-distribution-of-an-electron-app-using-squirrel/) and [Using Electron Packager to Package an Electron App](http://www.mylifeforthecode.com/using-electron-packager-to-package-an-electron-app/).

I wanted to curate a ton of knowledge in one place, so here we go.

I use a few tools to get this done on my Mac:

* [Electron Packager](https://github.com/maxogden/electron-packager)
* [Wine](https://www.winehq.org/)
* [Winetricks](http://wiki.winehq.org/winetricks)
* [nuget cli](http://www.nuget.org/nuget.exe)
* [Squirrel.Windows](https://github.com/Squirrel/Squirrel.Windows/releases)


First, let's look at the project layout:

## Project Layout

``` sh
/build # Installers go here
  /osx
  /resources # Icons, iconset, images, etc
  /win # Binaries to build, Package.nuspec file to specify configurations
  packager.json # File used by electron-builder to build OSX DMG file.
/dist # Distributions go here (.app, .exe, .dmg)
  /osx
  /win
/docs # Docs about project.
/node_modules # Modules used for building/packaging/testing
/scss # Sass for CSS compilation in www
/spec # Tests
  AppCtrl.spec.js
www # Source code for the application
  /css
  /data
  /img
  /js
  /lib
  /node_modules # Modules here used by the application itself.
  /templates

karma.conf.js # Configuration for tests.
livereload.js # Dev script to set up live reload in Electron
package.json # Main package.json with scripts/dependencies to package/build.
```

## Process

First we'll need to make the exe and associated files to a `dist` folder. From there, we take the win `dist` files and pack them into the `Setup.exe` file, where Squirrel will do the heavy lifting to pack all this into a one step process.

## npm Scripts

We'll use the npm script `pack:win` task to put all our `www` files into a nice package (resources, exe, etc) and output to the `dist` folder.

`pack:win` step will just execute `electron-packager` with some relevant information. Please note the `asar=true`, this is recommended because sometimes `node_modules` can get nested a few times and the file paths will be too long for certain Windows platforms.

Script:

```js
{
  "scripts": {
    "pack:win": "electron-packager ./www \"Project\" --out=dist/win --platform=win32 --arch=ia32 --version=0.29.1 --icon=build/resources/icon.ico --version-string.CompanyName=\"My Company\" --version-string.ProductName=\"Project\" --version-string.FileDescription=\"Project\" --asar=true"
  }
```

## Electron Build script

I used a simple build script in node to assist in some of the heavy lifting. I recommend getting an Extended Validation certificate from [this blog post](http://blogs.msdn.com/b/ie/archive/2012/08/14/microsoft-smartscreen-amp-extended-validation-ev-code-signing-certificates.aspx).

This will take the windows package in `dist/win` and create `dist/win/Setup.exe`.


```js
#!/usr/bin/env node
// File is in root/build/win/build.js
// First call nuget pack Package.nuspec
// Then you'll have Project.<version>.nupkg
// Run Squirrel.exe --releaseify Project.<version>.nupkg --icon iconPath --loadingGif loadingGifPath
// resources in build/resources/

//Need to get around weird command line passes with windows paths
function addWindowsPathFix(path) {
  return ['"', path, '"'].join('');
}

var childProcess = require('child_process'),
  path = require('path'),
  packageJsonPath = path.join(__dirname, '..', '..', 'package.json'),
  packageJson = require(packageJsonPath),
  loadingGifPath = path.join(__dirname, '..', 'resources', 'windows-loader.png'),
  nugetPackageSpecPath = path.join(__dirname, 'Package.nuspec'),
  nugetPackageOutputPath = path.join(__dirname),
  nugetPackageName = ['Project', '.1.0.0', '.nupkg'].join(''),
  // nugetPackageName = ['Project', packageJson.version, '.nupkg'].join(''),
  nugetPackagePath = path.join(nugetPackageOutputPath, nugetPackageName),
  nugetExePath = path.join(__dirname, 'nuget.exe'),
  setupIconPath = path.join(__dirname, '..', 'resources', 'icon.ico'),
  setupReleasePath = path.join(__dirname, '..', '..', 'dist', 'win'),
  signatureCertificatePath = path.join(__dirname, 'Certificate.pfx'),
  signParams = ['"/a /f "', addWindowsPathFix(signatureCertificatePath), '" /p ', process.env.PRIVATE_CERT_PASSWORD, '"'].join(''),
  squirrelExePath = path.join(__dirname, 'Squirrel.exe');

  console.log('sign params', signParams);

var createNugetPackageCommand = [addWindowsPathFix(nugetExePath), 'pack', addWindowsPathFix(nugetPackageSpecPath), '-OutputDirectory', addWindowsPathFix(nugetPackageOutputPath)].join(' ');
var createSetupCommand = [
              addWindowsPathFix(squirrelExePath), 
              '--releasify', addWindowsPathFix(nugetPackagePath), 
              '--loadingGif', addWindowsPathFix(loadingGifPath), 
              '--icon', addWindowsPathFix(setupIconPath), 
              '--releaseDir', addWindowsPathFix(setupReleasePath), 
              '--signWithParams', signParams
            ].join(' ');


console.log('Creating nuget package from nuget spec file:', nugetPackageSpecPath);
// console.log(createNugetPackageCommand);
childProcess.execSync(createNugetPackageCommand);
console.log('Created nuget package');

console.log('Building Setup.exe');
// console.log(createSetupCommand);
childProcess.execSync(createSetupCommand);
console.log('Built Setup.exe');
```


Hope this helps!
