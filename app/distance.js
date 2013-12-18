var rooler = rooler || {};

rooler.DistanceTool = function() {
  rooler.base(this);
};
rooler.inherits(rooler.DistanceTool, rooler.Tool);

rooler.DistanceTool.prototype.initialize = function(root) {
  rooler.base(this, 'initialize', root);

  this.crosshairs = rooler.createElement('div', 'roolerCrosshairs');
  root.appendChild(this.crosshairs);

  this.vertical = rooler.createElement('div', 'roolerVertical');
  this.crosshairs.appendChild(this.vertical);

  this.vertical.appendChild(rooler.createElement('div', 'roolerVerticalBar'));
  this.vertical.appendChild(rooler.createElement('div', 'roolerVerticalTop'));
  this.vertical.appendChild(rooler.createElement('div', 'roolerVerticalBottom'));

  this.horizontal = rooler.createElement('div', 'roolerHorizontal');
  this.crosshairs.appendChild(this.horizontal);

  this.horizontal.appendChild(rooler.createElement('div', 'roolerHorizontalBar'));
  this.horizontal.appendChild(rooler.createElement('div', 'roolerHorizontalLeft'));
  this.horizontal.appendChild(rooler.createElement('div', 'roolerHorizontalRight'));

  this.handleMouseMove = this.handleMouseMove.bind(this);
  this.handleMouseDown = this.handleMouseDown.bind(this);
  this.handleMouseWheel = this.handleMouseWheel.bind(this);

  document.body.addEventListener('mousemove', this.handleMouseMove, false);
  document.body.addEventListener('mousedown', this.handleMouseDown, false);
  document.body.addEventListener('touchmove', this.handleMouseMove, false);
  document.body.addEventListener('touchstart', this.handleMouseDown, false);
  window.addEventListener('mousewheel', this.handleMouseWheel, false);

  this.dimensions = rooler.createElement('div', 'roolerDimensions');
  root.appendChild(this.dimensions);
};

rooler.DistanceTool.prototype.close = function() {
  rooler.base(this, 'close');

  document.body.removeEventListener('mousemove', this.handleMouseMove, false);
  document.body.removeEventListener('mousedown', this.handleMouseDown, false);
  document.body.removeEventListener('touchmove', this.handleMouseMove, false);
  document.body.removeEventListener('touchstart', this.handleMouseDown, false);
  window.removeEventListener('mousewheel', this.handleMouseWheel, false);
}

rooler.DistanceTool.prototype.handleMouseDown = function(e) {
  if (this.canClose) {
    this.close();
  }
};

rooler.DistanceTool.prototype.handleMouseMove = function(e) {
  this.cursorPosition = {
    x: e.pageX,
    y: e.pageY
  };
  e.preventDefault();

  this.update();
  return true;
};

rooler.DistanceTool.prototype.update = function() {
  if (!window.Rooler.screenShot) {
    return;
  }

  var myOffset = {left: 0, top: 0};
  var position = {
    x: this.cursorPosition.x - myOffset.left,
    y: this.cursorPosition.y - myOffset.top - window.pageYOffset
  }

  var coordinates = null;
  if (window.Rooler.screenShot) {
    coordinates = window.Rooler.screenCoordinates.expandPoint(position, window.Rooler.screenShot);
  }
  else {
    coordinates = {left: this.cursorPosition.x - 100,
                   top: this.cursorPosition.y - 100,
                   width: 200,
                   height: 200,
                  };
  }

  //coordinates.top += window.pageYOffset;
  coordinates.left += window.pageXOffset;

  this.crosshairs.style.left = coordinates.left + myOffset.left + 'px';
  this.crosshairs.style.top = coordinates.top + myOffset.top + 'px';

  var width = coordinates.width + "px";
  this.crosshairs.style.width = width;

  var height = coordinates.height + "px";
  this.crosshairs.style.height = height;

  this.vertical.style.left = (this.cursorPosition.x - coordinates.left - myOffset.left - 5) + 'px';
  this.horizontal.style.top = (this.cursorPosition.y - coordinates.top - myOffset.top - 5 - window.pageYOffset) + 'px';

  this.dimensions.textContent = (coordinates.width + ' x ' + coordinates.height);

  if (this.cursorPosition.x > window.innerWidth - 100) {
    var width = this.dimensions.clientWidth;
    this.dimensions.style.left = (this.cursorPosition.x - myOffset.left - (width + 10)) + 'px';
  } else {
    this.dimensions.style.left = (this.cursorPosition.x - myOffset.left + 10) + 'px';
  }

  if (this.cursorPosition.y < 100) {
    this.dimensions.style.top = (this.cursorPosition.y - myOffset.top + 2 - window.pageYOffset) + 'px';
  } else {
    this.dimensions.style.top = (this.cursorPosition.y - myOffset.top - 20 - window.pageYOffset) + 'px';
  }
}

rooler.DistanceTool.prototype.handleMouseWheel = function(e) {
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
}
