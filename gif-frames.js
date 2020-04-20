var MultiRange = require('multi-integer-range').MultiRange;
var getPixels = require('get-pixels-frame-info-update');
var savePixels = require('save-pixels-jpeg-js-upgrade');

function renderCumulativeFrames (frameData) {
  if (frameData.length === 0) {
    return frameData;
  }
  const previous = document.createElement("canvas");
  const previousContext = previous.getContext("2d");
  const current = document.createElement("canvas");
  const currentContext = current.getContext("2d");

  // Setting the canvas width will clear the canvas, so we only want to do it once.
  const firstFrameCanvas = frameData[0].getImage();

  // It also apperas that 'gif-frames' always returns a consistent sized canvas for all frames.
  previous.width = firstFrameCanvas.width;
  previous.height = firstFrameCanvas.height;
  current.width = firstFrameCanvas.width;
  current.height = firstFrameCanvas.height;

  for (const frame of frameData) {
    // Copy the current to the previous.
    previousContext.clearRect(0, 0, previous.width, previous.height);
    previousContext.drawImage(current, 0, 0);

    // Draw the current frame to the cumulative buffer.
    const canvas = frame.getImage();
    const context = canvas.getContext("2d");
    currentContext.drawImage(canvas, 0, 0);
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(current, 0, 0);

    const {frameInfo} = frame;
    const {disposal} = frameInfo;
    // If the disposal method is clear to the background color, then clear the canvas.
    if (disposal === 2) {
      currentContext.clearRect(frameInfo.x, frameInfo.y, frameInfo.width, frameInfo.height);
    // If the disposal method is reset to the previous, then copy the previous over the current.
    } else if (disposal === 3) {
      currentContext.clearRect(0, 0, current.width, current.height);
      currentContext.drawImage(previous, 0, 0);
    }
    frame.getImage = () => canvas;
  }
  return frameData;
};

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
  getPixels(url, inputType, function (err, pixels, framesInfo) {
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
          frameIndex: frameIndex,
          frameInfo: framesInfo && framesInfo[frameIndex]
        });
      })(i);
    }
    resolve(frameData);
  });

  //  programatically fixes 
  promise.then((frameData) => {return (renderCumulativeFrames(frameData))});

  return promise;
}

module.exports = gifFrames;
