---
layout: post
title: "A field guide to Snap.svg"
date: 2014-10-23 12:31
comments: true
categories: javascript svg snapsvg
---
This last weekend I spent a little time on a fun little side project to learn how to use [Snap.svg](http://snapsvg.io/). I was trying to take my friend Rob's datachomp character and make it a little interactive.

After trying to do what I thought was a few simple little hacks with his PNG image, it turned out to be a great way to fully learn and understand SVG and the Snap.svg library.

I have to admit I did not fully understand what SVG was and what it was composed of. I wanted to compile a list of thoughts, links, blogs, and tutorials that helped me learn along the way.

## What SVG is and what it isnt

First of all, I had to learn that there are two image types - ones that scale (vector), and ones that are defined with strict sizes (bitmaps). For the longest time, I admit I thought they were basically the same.

Vectors are mainly svg, while bitmap types are jpeg, png, gif, to name a few.

You'd want to use an svg element when you need an image that can grow without looking skewed. You'd want to use a bitmap type when the size can remain the same.

One thing to note is, svg's can contain bitmap images as well, as in this example:

``` html
<html>
  <body>
    <svg id="svg-node">
      <circle id="svg-element">
      <image id="datachomp-arm" sketch:type="MSBitmapLayer" x="0" y="0" width="269" height="209" xlink:href="img/datachomp/arm.png"></image>
    </svg>
  </body>
</html>
```

## Svg editors vs bitmap editors

My undertanding is that most bitmap editors can't do svg. GIMP, photoshop, and other editors like these are bitmap editors. Although they can create paths and export them, for the most part, they cannot do svg type modifications.

Some svg editors are illustrator, inkscape, and fireworks, to name a few.

Most vector editors can import bitmap images and use them as an svg element. My understanding is, they cant really modify them other than stretch/skewing them. However, I could and probably am wrong about this. (I dont pretend to be an expert at this!)

## Svg understanding

To start, Mozilla Developer Network had a great set of documents to help understand SVG: what it is, what elements it's composed of, and how to define shapes, paths, and transforms.

[MDN SVG tutorial](https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Introduction)

From the article:
``
Scalable Vector Graphics (SVG) is an XML markup language for describing two-dimensional vector graphics. SVG is essentially to graphics what XHTML is to text.
``

That being said, you'd be interested to know that inside of a root `svg` element, it contains other elements. Here's a [list of those elements available](https://developer.mozilla.org/en-US/docs/Web/SVG/Element).

## Using Snap.svg to make svg elements look alive

### Modifying svg element attributes

You can access and modify any attribute on any element from Snap.svg. Examples could be the stroke, the width of the stroke, the x/y coordinates of the element, and many other [attributes](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute).

First, select the element (using Snap), then do a call to `elem.attr({})`:

Html:

``` html
<html>
  <body>
    <svg id="svg-node">
      <circle id="svg-element">
    </svg>
  </body>
</html>
```

JavaScript:

``` js
var svgNode = Snap.select('#svg-node'),
    svgElement = svgNode.select('#svg-element');

svgElement.attr({
    fill: "#bada55",
    stroke: "#000",
    strokeWidth: 5,
    x: 50,
    y: 100
});
```

### Transforms

[Snap.svg](http://snapsvg.io/docs/#Element.transform) defines some methods to help you transform your svg elements. It looks like this:

``` js
var arm = datachomp = Snap.select("#datachomp"),
      arm = datachomp.select("#datachomp-arm");
var elementTransform = "t0,-80r360t-30,0r360t-30,30t-10,10";
arm.animate({transform: tAmt}, 500, mina.elastic);
```

However, I was having some trouble understanding the transform string syntax. The author also created [Raphael.js](http://raphaeljs.com/) and provides some additional documentation on how to [understand transform strings here](http://raphaeljs.com/reference.html#Element.transform).

Taken from the Raphael reference:

``
Each letter is a command. There are four commands: t is for translate, r is for rotate, s is for scale and m is for matrix.

There are also alternative 'absolute' translation, rotation and scale: T, R and S. They will not take previous transformation into account. For example, ...T100,0 will always move element 100 px horisontally, while ...t100,0 could move it vertically if there is r90 before. Just compare results of r90t100,0 and r90T100,0.

So, the example line above could be read like 'translate by 100, 100; rotate 30° around 100, 100; scale twice around 100, 100; rotate 45° around centre; scale 1.5 times relative to centre'. As you can see rotate and scale commands have origin coordinates as optional parameters, the default is the centre point of the element. Matrix accepts six parameters.
``

### Paths

Again I admit I knew very little about how to define a path. [This document](https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths) helped tremendously in the different types of paths and how to define them.

One task I wanted to do was make an svg element follow along a path. [This CodePen](http://codepen.io/mattsince87/pen/snqLy) helped tremendously with figuring out how to make an element follow along with a path.

Out of [this google group thread](https://groups.google.com/forum/#!topic/snapsvg/TOYtCQvLNHA), a code snippit comes up that helps:

``` js
//Snap.svg helper method to make an element trace a defined path

function animateAlongPath( path, element, start, dur ) {
    var len = Snap.path.getTotalLength( path );
    Snap.animate( start, len, function( value ) {
            var movePoint = Snap.path.getPointAtLength( path, value );
            element.attr({ x: movePoint.x, y: movePoint.y });
    }, dur);
};
```

I found a blog post with a demo that helped show some additional paths and how to use tools to create them, [found here](http://dropthebit.com/592/pathanimator-moving-along-an-svg-path/).

I found another little hack on how to create paths using [GIMP](http://www.gimp.org/). First, start to create your path with the path tool. When you're done, select your path you created from the toolbar (under the 'paths' tab), right click it, and select `export path`. That should give you an svg file with the path inside of it.


## Svg vs Canvas
A question came up, when would you want to use svg over something like the canvas?

After reading [this article](http://www.htmlgoodies.com/html5/other/html5-canvas-vs.-svg-choose-the-best-tool-for-the-job.html#fbid=9b7MQgV-6i0), the author makes a point for which you'd want to use:

``
SVG Relies on Files, Canvas Uses Pure Scripting
SVG images are defined in XML. As a result, every SVG element is appended to the Document Object Model (DOM) and can be manipulated using a combination of JavaScript and CSS. Moreover, you can attach an event handlers to a SVG element or update its properties based on another document event. Canvas, on the other hand, is a simple graphics API. It draws pixels (extremely well I might add) and nothing more. Hence, there's no way to alter existing drawings or react to events. If you want to update the Canvas image, you have to redraw it.
``

I'll continue updating this post as I learn more. I hope this helps others learn these svg topics with ease.
