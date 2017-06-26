var path = require('path');
var MultiRange = require('multi-integer-range').MultiRange;
var getPixels = require('get-pixels');
var savePixels = require('save-pixels');

function nopromises () {
  throw new Error(
    'Promises not supported in your environment. ' +
    'Use the callback argument or a Promise polyfill.'
  );
}

var brokenPromise = {
  then: nopromises,
  catch: nopromises
};

function gifFrames (options, callback) {
  options = options || {};
  callback = callback || function () {};

  var promise;
  var resolve;
  var reject;
  if (typeof Promise === 'function') {
    promise = new Promise(function (_resolve, _reject) {
      resolve = function (res) {
        callback(null, res);
        _resolve(res);
      };
      reject = function (err) {
        callback(err);
        _reject(err);
      };
    });
  } else {
    promise = brokenPromise;
    resolve = function (res) {
      callback(null, res);
    };
    reject = callback;
  }

  var url = options.url;
  if (!url) {
    reject(new Error('"url" option is required.'));
    return promise;
  }
  var frames = options.frames;
  if (!frames && frames !== 0) {
    reject(new Error('"frames" option is required.'));
    return promise;
  }
  var outputType = options.outputType || 'jpg';
  var quality = options.quality;

  var acceptedFrames = frames === 'all' ? 'all' : new MultiRange(frames);

  // Necessary to check if we're in Node or the browser until this is fixed:
  // https://github.com/scijs/get-pixels/issues/33
  var inputType = typeof window === 'undefined' ? 'image/gif' : '.GIF';
  getPixels(url, inputType, function (err, pixels) {
    if (err) {
      reject(err);
      return;
    }
    if (pixels.shape.length < 4) {
      reject(new Error('"url" input should be multi-frame GIF.'));
      return;
    }
    var frameData = [];
    for (var i = 0; i < pixels.shape[0]; i++) {
      if (acceptedFrames !== 'all' && !acceptedFrames.has(i)) {
        continue;
      }
      (function (frameIndex) {
        frameData.push({
          getImage: function () {
            return savePixels(pixels.pick(frameIndex), outputType, {
              quality: quality
            });
          },
          frameIndex: frameIndex
        });
      })(i);
    }
    resolve(frameData);
  });

  return promise;
}

module.exports = gifFrames;
