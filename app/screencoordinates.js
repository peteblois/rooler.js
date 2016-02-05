var rooler = rooler || {};

rooler.ScreenCoordinates = function() {
};

rooler.ScreenCoordinates.colorTolerance = 15;

rooler.ScreenCoordinates.prototype.expandPoint = function (position, screenshot) {
  var x = position.x * window.devicePixelRatio;
  var y = position.y * window.devicePixelRatio;

  var top = screenshot.top;
  var bottom = screenshot.bottom;

  var left = this.findNearestX(x, y - 5, y + 5, -1, screenshot).x;
  var right = this.findNearestX(x, y - 5, y + 5, 1, screenshot).x;
  var top = this.findNearestY(x - 5, x + 5, y, -1, screenshot).y;
  var bottom = this.findNearestY(x - 5, x + 5, y, 1, screenshot).y;

  if (right > left && bottom > top) {
    return {
      left: left / window.devicePixelRatio,
      top: top / window.devicePixelRatio,
      width: (right - left) / window.devicePixelRatio,
      height: (bottom - top) / window.devicePixelRatio
    };
  }
  return {};
};

rooler.ScreenCoordinates.prototype.collapseBox = function(rect, screenshot) {
  var rectLeft = rect.left * window.devicePixelRatio;
  var rectRight = rect.right * window.devicePixelRatio;
  var rectTop = rect.top * window.devicePixelRatio;
  var rectBottom = rect.bottom * window.devicePixelRatio;
  var left = this.findNearestX(rectLeft, rectTop, rectBottom, 1, screenshot).x;
  var right = this.findNearestX(rectRight, rectTop, rectBottom, -1, screenshot).x;
  var top = this.findNearestY(rectLeft, rectRight, rectTop, 1, screenshot).y;
  var bottom = this.findNearestY(rectLeft, rectRight, rectBottom, -1, screenshot).y;

  if (left < right && top < bottom) {
    return {
      left: left / window.devicePixelRatio,
      top: top / window.devicePixelRatio,
      right: right / window.devicePixelRatio,
      bottom: bottom / window.devicePixelRatio
    };
  }
  return null;
}

rooler.ScreenCoordinates.prototype.findNearestX = function findNearestX(xStart, yStart, yEnd, xIncrement, screenshot) {

  yStart = Math.max(screenshot.top, yStart);
  yEnd = Math.min(screenshot.bottom, yEnd);

  var xEdge = xIncrement < 0 ? -100000 : 100000;
  var yEdge = yStart;

  var imageData = screenshot.imageData;
  var currentPixel = {r: 0, g: 0, b: 0};
  var startPixel = {r: 0, g: 0, b: 0};

  for (var y = yStart; y < yEnd; ++y) {
    screenshot.getScreenPixel(xStart, y, startPixel);

    var cont = true;
    for (var x = xStart; x >= screenshot.left && x <= screenshot.right && cont == true; x += xIncrement) {
      screenshot.getScreenPixel(x, y, currentPixel);
      if (!this.isPixelClose(currentPixel, startPixel)) {
        var edge = x - xIncrement;
        if (xIncrement > 0) {
          edge += 1;
        }
        if (xIncrement > 0 && edge < xEdge) {
          xEdge = edge;
        } else if (xIncrement < 0 && edge > xEdge) {
          xEdge = edge;
        }
        cont = false;
      }
      var tmp = startPixel;
      startPixel = currentPixel;
      currentPixel = tmp;
    }
  }

  xEdge = rooler.clamp(xEdge, screenshot.left, screenshot.right);

  return {
    x: xEdge,
    y: yEdge
  };
},

rooler.ScreenCoordinates.prototype.findNearestY = function (xStart, xEnd, yStart, yIncrement, screenshot) {
  xStart = Math.max(screenshot.left, xStart);
  xEnd = Math.min(screenshot.right, xEnd);

  var xEdge = xStart;
  var yEdge = yIncrement < 0 ? -100000 : 100000;

  var imageData = screenshot.imageData;
  var currentPixel = {r: 0, g: 0, b: 0};
  var startPixel = {r: 0, g: 0, b: 0};

  for (var x = xStart; x < xEnd; ++x) {
    screenshot.getScreenPixel(x, yStart, startPixel);

    var cont = true;
    for (var y = yStart; y >= screenshot.top && y <= screenshot.bottom && cont == true; y += yIncrement) {
      rooler.getScreenPixel(imageData, x, y, currentPixel);
      if (!this.isPixelClose(currentPixel, startPixel)) {
        var edge = y - yIncrement;
        if (yIncrement > 0) {
          edge += 1;
        }
        if (yIncrement > 0 && edge < yEdge) {
          yEdge = edge;
        } else if (yIncrement < 0 && edge > yEdge) {
          yEdge = edge;
        }
      }
      var tmp = startPixel;
      startPixel = currentPixel;
      currentPixel = tmp;
    }
  }

  yEdge = rooler.clamp(yEdge, screenshot.top, screenshot.bottom);

  return {
    x: xEdge,
    y: yEdge
  };
},

rooler.ScreenCoordinates.prototype.isPixelClose = function (a, b) {
  var totalDifference = Math.abs(a.r - b.r) +
    Math.abs(a.g - b.g) +
    Math.abs(a.b - b.b);

  if (totalDifference > rooler.ScreenCoordinates.colorTolerance)
    return false;

  return true;
}