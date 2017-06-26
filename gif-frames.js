var path = require('path');
var getPixels = require('get-pixels');
var savePixels = require('save-pixels');
var fs = require('fs');

// https://stackoverflow.com/a/28203456
function numDigits (x) {
  return (Math.log10((x ^ (x >> 31)) - (x >> 31)) | 0) + 1;
}

// https://stackoverflow.com/a/2998822
function padNumber (num, size) {
  var s = num + '';
  while (s.length < size) {
    s = '0' + s;
  }
  return s;
}

function gifFrames (options, callback) {
  options = options || {};
  callback = callback || function () {};
  var input = options.input;
  if (!input) {
    callback(new Error('"input" option is required.'));
    return;
  }
  var filename = options.filename
    || (typeof input === 'string' ? path.basename(input) : '');
  if (typeof input !== 'string' && !filename) {
    callback(new Error('"filename" option is required for non-string inputs.'));
    return;
  }
  var filenameType = path.extname(filename).slice(1);
  var outputType = options.outputType || filenameType || 'jpg';
  var outputPathBase = filename
    && filenameType.toLowerCase() === outputType.toLowerCase()
    && filename.slice(0, -(outputType.length + 1))
    || filename;

  getPixels(input, 'image/gif', function (err, pixels) {
    if (err) {
      callback(err);
      return;
    }
    if (pixels.shape.length < 4) {
      callback(new Error('Input should be multi-frame GIF.'));
      return;
    }
    var frameCount = pixels.shape[0];
    var frameCountDigits = numDigits(frameCount);
    for (var i = 0; i < frameCount; i++) {
      savePixels(pixels.pick(i), outputType, {
        quality: options.quality
      }).pipe(fs.createWriteStream(
        outputPathBase + '-' + padNumber(i, frameCountDigits) + '.' + outputType
      ));
    }
  });
}

module.exports = gifFrames;
