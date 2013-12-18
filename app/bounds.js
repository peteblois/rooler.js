var rooler = rooler || {};

rooler.BoundsTool = function() {
  this.element = rooler.createElement('div', 'roolerRoot');

  this.boundsRoot = rooler.createElement('div', 'roolerBoundsRoot');
  this.element.appendChild(this.boundsRoot);

  this.top = rooler.createElement('div', 'roolerBoundsTop');
  this.boundsRoot.appendChild(this.top);
  this.right = rooler.createElement('div', 'roolerBoundsRight');
  this.boundsRoot.appendChild(this.right);
  this.bottom = rooler.createElement('div', 'roolerBoundsBottom');
  this.boundsRoot.appendChild(this.bottom);
  this.left = rooler.createElement('div', 'roolerBoundsLeft');
  this.boundsRoot.appendChild(this.left);

  this.bodyUserSelect = document.body.style.webkitUserSelect;
  document.body.style.webkitUserSelect = 'none';

  this.dimensionsRoot = rooler.createElement('div', 'roolerDimensionsHost');
  this.right.appendChild(this.dimensionsRoot);
  this.dimensions = rooler.createElement('div', 'roolerDimensions');
  this.dimensionsRoot.appendChild(this.dimensions);
  this.cameraButton = rooler.createElement('a', 'roolerCameraButton');
  this.cameraButton.href = '#';
  this.cameraButton.title = 'Capture Snapshot';
  var cameraIcon = rooler.createElement('div', 'roolerCamera');
  if (window.chrome && window.chrome.extension) {
    cameraIcon.style.background = 'url(' + window.chrome.extension.getURL('camera.png') + ')';
  }
  this.cameraButton.appendChild(cameraIcon);
  this.dimensionsRoot.appendChild(this.cameraButton);

  this.handleMouseMove = this.handleMouseMove.bind(this);
  this.handleMouseDown = this.handleMouseDown.bind(this);
  this.handleMouseUp = this.handleMouseUp.bind(this);
  this.handleWindowScroll = this.handleWindowScroll.bind(this);
  this.handleMouseWheel = this.handleMouseWheel.bind(this);
  this.handleCameraClick = this.handleCameraClick.bind(this);
  this.handleResize = this.handleResize.bind(this);

  this.instructions = rooler.createElement('div', 'roolerInstructions');
  this.instructions.textContent = 'Click and drag to create a rectangle to be measured.';
  this.boundsRoot.appendChild(this.instructions);

  document.body.addEventListener('mousemove', this.handleMouseMove, false);
  document.body.addEventListener('mousedown', this.handleMouseDown, false);
  document.body.addEventListener('mouseup', this.handleMouseUp, false);
  document.body.addEventListener('touchmove', this.handleMouseMove, false);
  document.body.addEventListener('touchstart', this.handleMouseDown, false);
  document.body.addEventListener('touchend', this.handleMouseUp, false);
  window.addEventListener('scroll', this.handleWindowScroll, false);
  window.addEventListener('mousewheel', this.handleMouseWheel, false);
  window.addEventListener('resize', this.handleResize, false);
  this.cameraButton.addEventListener('mousedown', this.handleCameraClick, false);
  this.cameraButton.onclick = function() {
    return false;
  };

  this.overlay = rooler.createElement('div', 'roolerOverlay');
  document.body.appendChild(this.overlay);

  document.body.appendChild(this.element);

  this.start = {
    x: 0,
    y: 0
  };
  this.end = {
    x: 0,
    y: 0
  };

  this.hideCamera();
  //this.startTest();
};

rooler.BoundsTool.prototype.startTest = function() {
  if (!this.testFunc) {
    this.testFunc = this.startTest.bind(this);
  }
  if (!window.Rooler.screenShot) {
    window.setTimeout(this.testFunc, 1000);
  } else {
    this.start = {
      x: 510,
      y: 167
    };
    this.end = {
      x: 750,
      y: 269
    };
    this.collapseRect();
    this.captureScreenshot();
  }
}

rooler.BoundsTool.prototype.isMouseDown = false;

rooler.BoundsTool.prototype.canClose = true;
rooler.BoundsTool.prototype.closeOnClick = false;

rooler.BoundsTool.prototype.setCanClose = function(canClose) {
  this.canClose = canClose;
};

rooler.BoundsTool.prototype.close = function() {
  document.body.removeEventListener('mousemove', this.handleMouseMove, false);
  document.body.removeEventListener('mousedown', this.handleMouseDown, false);
  document.body.removeEventListener('mouseup', this.handleMouseUp, false);
  document.body.removeEventListener('touchmove', this.handleMouseMove, false);
  document.body.removeEventListener('touchstart', this.handleMouseDown, false);
  document.body.removeEventListener('touchend', this.handleMouseUp, false);
  window.removeEventListener('scroll', this.handleWindowScroll, false);
  window.removeEventListener('mousewheel', this.handleMouseWheel, false);
  window.removeEventListener('resize', this.handleResize, false);

  document.body.removeChild(this.element);
  document.body.removeChild(this.overlay);

  document.body.style.webkitUserSelect = this.bodyUserSelect;
}

rooler.BoundsTool.prototype.hide = function() {
  this.element.className += ' roolerHidden';
}

rooler.BoundsTool.prototype.show = function() {
  this.element.className = this.element.className.replace(' roolerHidden', '');
}

rooler.BoundsTool.prototype.handleMouseDown = function(e) {
  if (this.closeOnClick) {
    this.close();
    return;
  }
  this.isMouseDown = true;
  this.start = {
    x: e.pageX - window.pageXOffset,
    y: e.pageY - window.pageYOffset
  };
  this.end = {
    x: e.pageX - window.pageXOffset,
    y: e.pageY - window.pageYOffset
  };
  this.updateRect();
  this.hideCamera();
  this.showDimensions();

  if (this.canClose) {
    this.closeOnClick = true;
  }
};

rooler.BoundsTool.prototype.handleMouseMove = function(e) {
  if (this.isMouseDown) {
    this.end = {
      x: e.pageX - window.pageXOffset,
      y: e.pageY - window.pageYOffset
    };
    this.updateRect();
    if (this.canClose) {
      this.hideInstructions();
    }
    e.preventDefault();
    return true;
  }
};

rooler.BoundsTool.prototype.handleMouseUp = function(e) {
  if (!this.isMouseDown) {
    return;
  }
  this.isMouseDown = false;

  if (e.pageX) {
    this.end = {
      x: e.pageX - window.pageXOffset,
      y: e.pageY - window.pageYOffset
    };
  }
  this.collapseRect();
};

rooler.BoundsTool.prototype.collapseRect = function() {
  this.updateRect();
  if (window.Rooler.screenShot) {
    var bounds = window.Rooler.screenCoordinates.collapseBox(this.rect, window.Rooler.screenShot);
    if (bounds) {
      this.rect = bounds;
      this.update();
      this.showCamera();
    } else {
      //alert('no bounds: L' + this.rect.left + ' R: ' + this.rect.right + ' T: ' + this.rect.top + ' B:' + this.rect.bottom);
      //alert('ex: ' + this.end.x + ' ey: ' + this.end.y + ' sx: ' + this.start.x + ' sy: ' + this.start.y);
      this.end = this.start;
      this.updateRect();
      this.hideDimensions();
    }
  }
};

rooler.BoundsTool.prototype.updateRect = function() {
  if (!window.Rooler.screenShot) {
    return;
  }
  var rect = {
    left: Math.min(this.start.x, this.end.x),
    right: Math.max(this.start.x, this.end.x),
    top: Math.min(this.start.y, this.end.y),
    bottom: Math.max(this.start.y, this.end.y),
  };
  this.rect = rect;

  this.update();
}

rooler.BoundsTool.prototype.update = function() {
  this.top.style.height = this.rect.top + 'px';
  this.bottom.style.height = window.innerHeight - this.rect.bottom + 'px';
  this.bottom.style.width = this.rect.right + 'px';
  this.left.style.width = this.rect.left + 'px';
  this.left.style.top = this.rect.top + 'px';
  this.left.style.bottom = window.innerHeight - this.rect.bottom + 'px';
  this.right.style.width = document.body.clientWidth - this.rect.right + 'px';
  this.right.style.top = this.rect.top + 'px';
  //this.right.style.bottom = window.innerHeight - this.rect.bottom + 'px';

  var width = this.rect.right - this.rect.left;
  var height = this.rect.bottom - this.rect.top;
  this.dimensions.textContent = (width + ' x ' + height);
}

rooler.BoundsTool.prototype.handleWindowScroll = function(e) {
  if (window.Rooler.requestUpdateScreenshot) {
    window.Rooler.requestUpdateScreenshot();
  }
};

rooler.BoundsTool.prototype.handleMouseWheel = function(e) {
  e.preventDefault();
  if (e.wheelDelta > 0) {
    rooler.ScreenCoordinates.colorTolerance += 1;
  }
  else {
    rooler.ScreenCoordinates.colorTolerance -= 1;
    if (rooler.ScreenCoordinates.colorTolerance < 0) {
      rooler.ScreenCoordinates.colorTolerance = 0;
    }
  }
  this.update();
};

rooler.BoundsTool.prototype.showDimensions = function() {
  rooler.removeClass(this.dimensionsRoot, 'roolerHidden');
}

rooler.BoundsTool.prototype.hideDimensions = function() {
  rooler.addClass(this.dimensionsRoot, 'roolerHidden');
}

rooler.BoundsTool.prototype.showCamera = function() {
  rooler.removeClass(this.cameraButton, 'roolerHidden');
}

rooler.BoundsTool.prototype.hideCamera = function() {
  rooler.addClass(this.cameraButton, 'roolerHidden');
}

rooler.BoundsTool.prototype.handleCameraClick = function(e) {
  this.captureScreenshot();

  e.preventDefault();
  e.stopPropagation();
  return true;
};

rooler.BoundsTool.prototype.handleResize = function() {
  this.update();
};

rooler.BoundsTool.prototype.captureScreenshot = function(e) {
  if (this.rect && window.Rooler.screenShot) {
    var image = window.Rooler.screenShot.captureRect(this.rect);
    if (image) {
      var data = image.toDataURL();
      var popup = new rooler.Capture(data, {
        width: this.rect.right - this.rect.left,
        height: this.rect.bottom - this.rect.top
      });
      //window.open(data);
    }
  }
}

rooler.BoundsTool.prototype.hideInstructions = function() {
  rooler.addClass(this.instructions, 'roolerHidden');
}