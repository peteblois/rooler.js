
/**
 * Runs in the context of the page which is being inspected.
 **/
var rooler = rooler || {};

rooler.clamp = function(value, min, max) {
	return Math.max(Math.min(value, max), min);
}

rooler.getScreenPixel = function (data, x, y) {
	var index = (y * 4) * data.width + (x * 4);
	return {
		r: data.data[index],
		g: data.data[index + 1],
		b: data.data[index + 2],
		a: data.data[index + 3]
	};
}

rooler.Rooler = function() {
  this.port = chrome.extension.connect();
  
  this.port.onMessage.addListener(this.handleMessage.bind(this));
  //chrome.extension.onRequest.addListener(this.handleRequest.bind(this));
  
  this.port.postMessage({
    msg: 'start'
  });
  
  this.tools = [];
  this.screenCoordinates = new rooler.ScreenCoordinates();
}

rooler.Rooler.prototype.handleMessage = function(msg) {
  var fn = this[msg.msg];
  fn.apply(this, msg.args);
}

/*
rooler.Rooler.prototype.handleRequest = function(request, sender, response) {
  alert('got request ' + request.fn);
  var fn this[request.fn];
  var result = fn.call(this);
  if (response)
    response(result);
}*/

rooler.Rooler.prototype.startDistanceTool = function() {
  //alert('got start distance tool command!');
  this.port.postMessage({
    msg: 'getPageImage'
  });
  
  this.tools.push(new rooler.DistanceTool());
}

rooler.Rooler.prototype.updateScreenshot = function(data) {
  //alert('got updated screenshot ' + data);
  //debugger;
  
  var that = this;
  
  var img = document.createElement('img');
  img.addEventListener('load', function() {
  
    var canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    
    var context = canvas.getContext('2d');
    context.drawImage(img, 0, 0);
    
    var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    that.screenShot = new rooler.ScreenShot(imageData);
    
  }, true);
  img.src = data;
}

rooler.DistanceTool = function() {
  this.element = document.createElement('div');
  
  this.crosshairs = this.createElement('div', 'roolerCrosshairs');
  this.element.appendChild(this.crosshairs);

  this.vertical = this.createElement('div', 'roolerVertical');
  this.crosshairs.appendChild(this.vertical);
  
  this.vertical.appendChild(this.createElement('div', 'roolerVerticalBar'));
  this.vertical.appendChild(this.createElement('div', 'roolerVerticalTop'));
  this.vertical.appendChild(this.createElement('div', 'roolerVerticalBottom'));

  this.horizontal = this.createElement('div', 'roolerHorizontal');
  this.crosshairs.appendChild(this.horizontal);

  this.horizontal.appendChild(this.createElement('div', 'roolerHorizontalBar'));
  this.horizontal.appendChild(this.createElement('div', 'roolerHorizontalLeft'));
  this.horizontal.appendChild(this.createElement('div', 'roolerHorizontalRight'));

  this.handleMouseMove = this.handleMouseMove.bind(this);
  this.handleMouseDown = this.handleMouseDown.bind(this);
  
  document.body.addEventListener('mousemove', this.handleMouseMove, false);
  document.body.addEventListener('mousedown', this.handleMouseDown, false);

  this.dimensions = this.createElement('div', 'roolerDimensions');
  this.element.appendChild(this.dimensions);
  
  document.body.appendChild(this.element);
}

rooler.DistanceTool.prototype.close = function() {
  document.body.removeEventListener('mousemove', this.handleMouseMove, false);
  document.body.removeEventListener('mousedown', this.handleMouseDown, false);
  
  document.body.removeChild(this.element);
}

rooler.DistanceTool.prototype.handleMouseDown = function(e) {
  this.close();
}

rooler.DistanceTool.prototype.handleMouseMove = function(e) {
  if (!window.Rooler.screenShot) {
    return;
  }
  
  var myOffset = {left: 0, top: 0};

  var position = {
  	X: e.pageX - myOffset.left,
  	Y: e.pageY - myOffset.top
  };

  var coordinates = window.Rooler.screenCoordinates.expandPoint(position, window.Rooler.screenShot);

  this.crosshairs.style.left = coordinates.left + myOffset.left + 'px';
  this.crosshairs.style.top = coordinates.top + myOffset.top + 'px';

  var width = coordinates.width + "px";
  this.crosshairs.style.width = width;

  var height = coordinates.height + "px";
  this.crosshairs.style.height = height;

  this.vertical.style.left = (e.pageX - coordinates.left - myOffset.left - 5) + 'px';
  this.horizontal.style.top = (e.pageY - coordinates.top - myOffset.top - 5) + 'px';

  this.dimensions.textContent = (coordinates.width + ' x ' + coordinates.height);
  this.dimensions.style.left = (e.pageX - myOffset.left + 10) + 'px';
  this.dimensions.style.top = (e.pageY - myOffset.top - 15) + 'px';
}

rooler.DistanceTool.prototype.createElement = function(type, className) {
  var element = document.createElement(type);
  element.className = className;
  return element;
}

rooler.ScreenCoordinates = function() {
    this.colorTolerance = 15;
}

rooler.ScreenCoordinates.prototype.expandPoint = function (position, screenshot) {
  var x = position.X;
  var y = position.Y;

  var top = screenshot.top;
  var bottom = screenshot.bottom;

  var left = this.findNearestX(x, y - 5, y + 5, -1, screenshot).x + 1;
  var right = this.findNearestX(x, y - 5, y + 5, 1, screenshot).x;
  var top = this.findNearestY(x - 5, x + 5, y, -1, screenshot).y + 1;
  var bottom = this.findNearestY(x - 5, x + 5, y, 1, screenshot).y;

  if (right > left && bottom > top) {
    return {
      left: left,
      top: top,
      width: right - left,
      height: bottom - top
    };
  }
  return {};
},

rooler.ScreenCoordinates.prototype.findNearestX = function (xStart, yStart, yEnd, xIncrement, screenshot) {

  yStart = Math.max(screenshot.top, yStart);
  yEnd = Math.min(screenshot.bottom, yEnd);

  var xEdge = xIncrement < 0 ? -100000 : 100000;
  var yEdge = yStart;

  var imageData = screenshot.imageData;

  for (var y = yStart; y < yEnd; ++y) {
    var startPixel = screenshot.getScreenPixel(xStart, y);

    var cont = true;
    for (var x = xStart; x >= screenshot.left && x <= screenshot.right && cont == true; x += xIncrement) {
      var currentPixel = rooler.getScreenPixel(imageData, x, y);
      if (!this.isPixelClose(currentPixel, startPixel)) {
        if (xIncrement > 0 && xEdge > x) {
          xEdge = x;
          yEdge = y;
        }
        else if (xIncrement < 0 && xEdge < x) {
          xEdge = x;
          yEdge = y;
        }
        cont = false;
      }
      startPixel = currentPixel;
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

  for (var x = xStart; x < xEnd; ++x) {
    var startPixel = screenshot.getScreenPixel(x, yStart);

    var cont = true;
    for (var y = yStart; y >= screenshot.top && y <= screenshot.bottom && cont == true; y += yIncrement) {
      var currentPixel = rooler.getScreenPixel(imageData, x, y);
      if (!this.isPixelClose(currentPixel, startPixel)) {
        if (yIncrement > 0 && yEdge > y) {
          xEdge = x;
          yEdge = y;
        }
        else if (yIncrement < 0 && yEdge < y) {
          xEdge = x;
          yEdge = y;
        }
        cont = false;
      }
      startPixel = currentPixel;
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
    Math.abs(a.b - b.b) +
    Math.abs(a.a - b.a);

  if (totalDifference > this.colorTolerance)
    return false;

  return true;
}

rooler.ScreenShot = function(imageData) {
    this.imageData = imageData;
    this.top = 0;
    this.left = 0;
    this.right = imageData.width;
    this.bottom = imageData.height;
}

rooler.ScreenShot.prototype.getScreenPixel = function(x, y) {
  var index = (y * 4) * this.imageData.width + (x * 4);
  return {
    r: this.imageData.data[index],
    g: this.imageData.data[index + 1],
    b: this.imageData.data[index + 2],
    a: this.imageData.data[index + 3]
  };
}

if (!window.Rooler && chrome.extension) {
  window.Rooler = new rooler.Rooler();
  
  var link = document.createElement('link');
  link.href = chrome.extension.getURL('rooler.css');
  link.rel = 'stylesheet';
  link.type = 'text/css';
  document.head.appendChild(link);
  //alert('here');
}