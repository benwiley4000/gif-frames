# gif-frames

A pure JavaScript tool for extracting GIF frames and saving to file. Works in Node or the browser. Uses [get-pixels](https://github.com/scijs/get-pixels) and [save-pixels](https://github.com/scijs/save-pixels) under the hood.

## Install

```bash
npm install gif-frames
```

## `require('gif-frames')(options[, callback])`

### Options:

* `url` (**required**): The pathname to the file, or an [in-memory Buffer](http://nodejs.org/api/buffer.html)
* ***TODO:*** `frames` (**required**): The set of frames to extract (currently extracts all)
* `outputType` (*optional*, default "jpg"): Type to use for output (see [`type`](https://github.com/scijs/save-pixels#requiresave-pixelsarray-type-options) for `save-pixels`)
* `quality` (*optional*): Jpeg quality (see [`quality`](https://github.com/scijs/save-pixels#requiresave-pixelsarray-type-options) for `save-pixels`)

The callback accepts the arguments `(error, frameData)`.

### Returns:

A `Promise` resolving to the `frameData` array (if promises are supported in the running environment)

## `frameData`

An array of objects of the form:

```javascript
{
  getImageStream,
  frameIndex
}
```

## Examples

Writing to file in Node:

```javascript
var gifFrames = require('gif-frames');
var fs = require('fs');

gifFrames({ url: 'image.gif', outputType: 'png' }, function (err, frameData) {
  if (err) {
    console.error(err);
    return;
  }
  frameData.forEach(function (frame) {
    frame.getImageStream().pipe(fs.createWriteStream(
      'image-' + frame.frameIndex + '.png'
    ));
  });
});
```

Writing to canvas in the browser (and using a `Promise`):

```javascript
var gifFrames = require('gif-frames');

gifFrames({ url: 'image.gif', outputType: 'canvas' })
  .then(function (frameData) {
    frameData.forEach(function (frame) {
      var canvas = document.createElement('canvas');
      canvas.id = 'frame-' + frame.frameIndex;
      document.body.appendChild(canvas);
      frame.getImageStream().pipe(canvas);
    });
  })
  .catch(function (err) {
    console.error(err);
  });
```
