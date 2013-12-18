var rooler = rooler || {};

rooler.Magnifier = function() {
  this.root = rooler.createElement('div', 'roolerRoot');
  rooler.applyRootStyle(this.root);
  var magnifier = rooler.createElement('div', 'roolerMagnifier').appendTo(this.root);
  //rooler.addClass(this.root, 'roolerRoot');

  this.handleCloseClick = this.handleCloseClick.bind(this);
  this.handleMouseMove = this.handleMouseMove.bind(this);
  this.handleMouseWheel = this.handleMouseWheel.bind(this);
  this.handleWindowScroll = this.handleWindowScroll.bind(this);
  this.handleKeyDown = this.handleKeyDown.bind(this);

  this.canvas = rooler.createElement('canvas', 'roolerMagnifierCanvas');
  this.canvas.width = this.width;
  this.canvas.height = this.height;
  this.canvas.style['image-rendering'] = 'optimizespeed';

  this.context = this.canvas.getContext('2d');
  magnifier.appendChild(this.canvas);
  magnifier.appendChild(rooler.createElement('div', 'roolerMagnifierCrosshairV'));
  magnifier.appendChild(rooler.createElement('div', 'roolerMagnifierCrosshairH'));

  this.closeButton = rooler.createElement('a', 'roolerMagnifierCloseButton');
  this.closeButton.title = 'Close';
  var icon = rooler.createElement('div', 'roolerMagnifierCloseIcon');
  this.closeButton.appendChild(icon);
  if (window.chrome && window.chrome.extension) {
    icon.style.background = 'url(' + window.chrome.extension.getURL('close.png') + ')';
  }
  this.closeButton.addEventListener('click', this.handleCloseClick, false);
  magnifier.appendChild(this.closeButton);

  this.colorPreview = rooler.createElement('div', 'roolerMagnifierColorPreview');
  magnifier.appendChild(this.colorPreview);

  this.pixelColorText = rooler.createElement('div', 'roolerMagnifierColorText');
  magnifier.appendChild(this.pixelColorText);
  this.pixelColorText.textContent = '#FFFFFF';

  this.positionText = rooler.createElement('div', 'roolerMagnifierPositionText');
  magnifier.appendChild(this.positionText);
  this.positionText.textContent = '0,0';

  // this.handleRefresh = this.handleRefresh.bind(this);
  // this.refreshTimer = window.setInterval(this.handleRefresh, 500);

  document.body.appendChild(this.root);
  document.addEventListener('mousemove', this.handleMouseMove, false);
  //this.root.addEventListener('mousewheel', this.handleMouseWheel, false);

  document.body.addEventListener('keydown', this.handleKeyDown, false);

  window.addEventListener('scroll', this.handleWindowScroll, false);

  this.base = {x: 0, y: 0};
}

rooler.Magnifier.prototype.width = 300;
rooler.Magnifier.prototype.height = 300;
rooler.Magnifier.prototype.magnification = 4;
rooler.Magnifier.prototype.offset = {x: 0, y: 0};
rooler.Magnifier.prototype.canClose = false;

rooler.Magnifier.prototype.update = function() {

  if (!window.Rooler.screenShot) {
    return;
  }

  this.context.fillStyle = 'transparent';

  this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

  this.context.save();
  var scale = this.magnification;
  var offset = {
    x: (this.offset.x - window.pageXOffset) - this.canvas.width / 2 / scale,
    y: (this.offset.y - window.pageYOffset) - this.canvas.height / 2 / scale
  }
  rooler.Magnifier.scale(window.Rooler.screenShot.canvas, this.canvas, scale, offset);

  this.positionText.textContent = (this.offset.x - this.base.x) + ', ' + (this.offset.y - this.base.y);

  var pixel = this.context.getImageData(this.width / 2 - scale, this.height / 2 - scale, 1, 1);
  var color = this.colorToHex(pixel.data[0], pixel.data[1], pixel.data[2]);
  //var color = '#' + pixel.data[0].toString(16).toUpperCase() + pixel.data[1].toString(16).toUpperCase() + pixel.data[2].toString(16).toUpperCase();
  this.pixelColorText.textContent = color;
  this.colorPreview.style.background = color;

  this.context.restore();
};

rooler.Magnifier.prototype.colorToHex = function(r, g, b) {
  function toHex(v) {
    var str = v.toString(16).toUpperCase();
    if (str.length == 1) {
      str = '0' + str;
    }
    return str;
  }
  return '#' + toHex(r) + toHex(g) + toHex(b);
};

rooler.Magnifier.scale = function(srcCanvas, dstCanvas, scale, offset) {
  var height = dstCanvas.height;
  var width = dstCanvas.width;
  var src = srcCanvas.getContext('2d');
  var dst = dstCanvas.getContext('2d');
  var srcImageData = src.getImageData(offset.x, offset.y, width / scale, height / scale);
  var srcData = srcImageData.data;

  var dstImageData = dst.getImageData(0, 0, width, height);
  var dstData = dstImageData.data;
  for (var y = 0; y < height; ++y) {
    var dstIndex = (y * dstCanvas.width) * 4;
    for (var x = 0; x < width; ++x) {
      var srcIndex = (Math.round(y / scale) * srcImageData.width + Math.round(x / scale)) * 4;
      dstData[dstIndex] = srcData[srcIndex];
      dstData[dstIndex + 1] = srcData[srcIndex + 1];
      dstData[dstIndex + 2] = srcData[srcIndex + 2];
      dstData[dstIndex + 3] = srcData[srcIndex + 3];

      dstIndex += 4;
    }
  }
  dst.putImageData(dstImageData, 0, 0);
}

rooler.Magnifier.prototype.setCanClose = function(canClose) {
  this.canClose = canClose;
  if (!this.canClose) {
    rooler.addClass(this.closeButton, 'roolerHidden');
  } else {
    rooler.removeClass(this.closeButton, 'roolerHidden');
  }
}

rooler.Magnifier.prototype.handleKeyDown = function(e) {
  if (e.keyCode == 32) {
    e.preventDefault();
    this.base.x = this.offset.x;
    this.base.y = this.offset.y;

    this.update();
  } else if (e.keyCode == 37) {
    this.offset.x -= 1;
    this.update();
    e.preventDefault();
  } else if (e.keyCode == 38) {
    this.offset.y -= 1;
    this.update();
    e.preventDefault();
  } else if (e.keyCode == 39) {
    this.offset.x += 1;
    this.update();
    e.preventDefault();
  } else if (e.keyCode == 40) {
    this.offset.y += 1;
    this.update();
    e.preventDefault();
  }
};

rooler.Magnifier.prototype.handleMouseWheel = function(e) {
  e.preventDefault();
  e.stopPropagation();
  if (e.wheelDelta > 0) {
    this.magnification = this.magnification * 2;
  }
  else {
    this.magnification = this.magnification / 2;
    if (this.magnification < 1) {
      this.magnification = 1;
    }
  }
  this.update();
}

rooler.Magnifier.prototype.handleMouseMove = function(e) {
  this.offset = {
    x: e.pageX,
    y: e.pageY,
  };
  this.update();
}

rooler.Magnifier.prototype.handleCloseClick = function() {
  this.close();
}

rooler.Magnifier.prototype.handleWindowScroll = function() {
  if (window.Rooler.requestUpdateScreenshot) {
    window.Rooler.requestUpdateScreenshot();
  }
}

rooler.Magnifier.prototype.handleRefresh = function() {
  if (window.Rooler.requestUpdateScreenshot) {
    window.Rooler.requestUpdateScreenshot();
  }
}

rooler.Magnifier.prototype.hide = function() {
  this.root.className += ' roolerHidden';
}

rooler.Magnifier.prototype.show = function() {
  this.root.className = this.root.className.replace(' roolerHidden', '');
}

rooler.Magnifier.prototype.close = function() {
  document.removeEventListener('mousemove', this.handleMouseMove, false);
  this.root.removeEventListener('mousewheel', this.handleMouseWheel, false);
  window.removeEventListener('scroll', this.handleWindowScroll, false);
  document.body.removeEventListener('keydown', this.handleKeyDown, false);
  document.body.removeChild(this.root);

  window.clearInterval(this.refreshTimer);
}