# gif-frames

A pure JavaScript tool for extracting GIF frames and saving to file. Works in Node or the browser. Uses [get-pixels](https://github.com/scijs/get-pixels) and [save-pixels](https://github.com/scijs/save-pixels) under the hood.

## `require('gif-frames')(options[, callback])`

Options:
* `input` (**required**): The pathname to the file, or an [in-memory Buffer](http://nodejs.org/api/buffer.html)
* ***TODO:*** `frames` (**required**): The set of frames to extract (currently extracts all)
* `filename` (*optional* if `input` is a pathname, **required** if `input` is a `Buffer`): The input file's name
* `outputType` (*optional*, default "jpg"): Type to use for output (see [`type`](https://github.com/scijs/save-pixels#requiresave-pixelsarray-type-options) for `save-pixels`)
* `quality` (*optional*): Jpeg quality (see [`quality`](https://github.com/scijs/save-pixels#requiresave-pixelsarray-type-options) for `save-pixels`)

The optional callback is called if an error occurs, with the error object
as its only argument.

Returns:
***TODO:*** A stream of the extracted frames
