# gif-frames

A pure JavaScript tool for extracting GIF frames and saving to file. Works in Node or the browser. Uses [get-pixels](https://github.com/scijs/get-pixels) and [save-pixels](https://github.com/scijs/save-pixels) under the hood.

[![NPM](https://nodei.co/npm/gif-frames.png)](https://npmjs.org/package/gif-frames)

## Install

```bash
npm install gif-frames
```

## `require('gif-frames')(options[, callback])`

```javascript
var gifFrames = require('gif-frames');
var fs = require('fs');

gifFrames({ url: 'image.gif', frames: 0 }).then(function (frameData) {
  frameData[0].getImage().pipe(fs.createWriteStream('firstframe.jpg'));
});
```

### Options:

* `url` (**required**): The pathname to the file, or an [in-memory Buffer](http://nodejs.org/api/buffer.html)
* `frames` (**required**): The set of frames to extract. Can be one of:
  - `'all'` (gets every frame)
  - Any valid [`Initializer`](https://github.com/smikitky/node-multi-integer-range#initializers) accepted by the [multi-integer-range library](https://github.com/smikitky/node-multi-integer-range)
* `outputType` (*optional*, default `'jpg'`): Type to use for output (see [`type`](https://github.com/scijs/save-pixels#requiresave-pixelsarray-type-options) for `save-pixels`)
* `quality` (*optional*): Jpeg quality (see [`quality`](https://github.com/scijs/save-pixels#requiresave-pixelsarray-type-options) for `save-pixels`)

The callback accepts the arguments `(error, frameData)`.

### Returns:

A `Promise` resolving to the `frameData` array (if promises are supported in the running environment)

## `frameData`

An array of objects of the form:

```javascript
{
  getImage,
  frameIndex
}
```

### `getImage()`

Returns one of:
* A drawn canvas DOM element, if `options.outputType` is `'canvas'`
* A data stream which can be piped to file output, otherwise

###  `frameIndex`

The index corresponding to the frame's position in the original GIF (not necessarily the same as the frame's position in the result array)

## Examples

Writing selected frames to the file system in Node:

```javascript
var gifFrames = require('gif-frames');
var fs = require('fs');

gifFrames(
  { url: 'image.gif', frames: '0-2,7', outputType: 'png' },
  function (err, frameData) {
    if (err) {
      throw err;
    }
    frameData.forEach(function (frame) {
      frame.getImage().pipe(fs.createWriteStream(
        'image-' + frame.frameIndex + '.png'
      ));
    });
  }
);
```

Drawing first frame to canvas in browser (and using a `Promise`):

```javascript
var gifFrames = require('gif-frames');

gifFrames({ url: 'image.gif', frames: 0, outputType: 'canvas' })
  .then(function (frameData) {
    document.body.appendChild(frameData[0].getImage());
  }).catch(console.error.bind(console));
```
