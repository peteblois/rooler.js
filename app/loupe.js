var rooler = rooler || {};

rooler.Loupe = function() {
  rooler.base(this);
};
rooler.inherits(rooler.Loupe, rooler.Tool);

rooler.Loupe.prototype.initialize = function(root) {
  rooler.base(this, 'initialize', root);

  this.circles = {
    c1: {
      r: 20
    },
    c2: {
      r: 80
    }
  };

  this.loupe = rooler.createElement('div', 'roolerLoupe').appendTo(root);

  this.canvas = document.createElement('canvas');
  this.canvas.width = 210;
  this.canvas.height = 210;
  this.context = this.canvas.getContext('2d');
  this.loupe.appendChild(this.canvas);

  var info = rooler.createElement('div', 'roolerLoupeInfo').appendTo(root);
  this.colorPreview = rooler.createElement('div', 'roolerLoupeColorPreview').appendTo(info);
  this.pixelColorText = rooler.createElement('div', 'roolerLoupeColorText').appendTo(info);
  this.pixelColorText.textContent = '#FFFFFF';
  this.positionText = rooler.createElement('div', 'roolerLoupePositionText').appendTo(info);
  this.positionText.textContent = '0,0';

  this.handleMouseMove = this.handleMouseMove.bind(this);
  this.handleMouseDown = this.handleMouseDown.bind(this);
  this.handleKeyDown = this.handleKeyDown.bind(this);

  document.body.addEventListener('mousemove', this.handleMouseMove, false);
  document.body.addEventListener('mousedown', this.handleMouseDown, false);
  document.body.addEventListener('keydown', this.handleKeyDown, false);

  this.zoomCanvas = document.createElement('canvas');
  this.zoomCanvas.width = this.circles.c2.r * 2;
  this.zoomCanvas.height = this.circles.c2.r * 2;

  this.base = {x: 0, y: 0};
  this.offset = {x: 0, y: 0};

  this.updateLoupe();
};

rooler.Loupe.prototype.circlesLeft = {
  c1: 30,
  c2: 110
};

rooler.Loupe.prototype.circlesRight = {
  c1: 180,
  c2: 100
}

rooler.Loupe.prototype.circlesTop = {
  c1: 30,
  c2: 110
};

rooler.Loupe.prototype.circlesBottom = {
  c1: 180,
  c2: 100
};

rooler.Loupe.prototype.magnification = 4;

rooler.Loupe.prototype.close = function() {
  rooler.base(this, 'close');

  document.body.removeEventListener('mousemove', this.handleMouseMove, false);
  document.body.removeEventListener('mousedown', this.handleMouseDown, false);
  document.body.removeEventListener('keydown', this.handleKeyDown, false);
}

rooler.Loupe.prototype.handleMouseMove = function(e) {
  this.offset = {
    x: e.pageX - window.pageXOffset,
    y: e.pageY - window.pageYOffset
  };

  this.update();
}

rooler.Loupe.prototype.update = function() {
  this.updateLoupe();

  var c1 = this.circles.c1;
  var c2 = this.circles.c2;

  this.loupe.style.left = this.offset.x - c1.x + 'px';
  this.loupe.style.top = this.offset.y - c1.y + 'px';


  if (window.Rooler.screenShot) {
    var scale = this.magnification;
    var offset = {
      x: this.offset.x * window.devicePixelRatio - c2.r / scale,
      y: this.offset.y * window.devicePixelRatio - c2.r / scale
    }
    var zoomContext = this.zoomCanvas.getContext('2d');
    zoomContext.clearRect(0, 0, this.zoomCanvas.width, this.zoomCanvas.height);

    rooler.Magnifier.scale(window.Rooler.screenShot.canvas, this.zoomCanvas, scale, offset);
    zoomContext.strokeStyle = 'rgba(255, 0, 0, .5)';
    zoomContext.lineWidth = 1;
    zoomContext.beginPath();
    zoomContext.moveTo(this.zoomCanvas.width / 2, 0);
    zoomContext.lineTo(this.zoomCanvas.width / 2, this.zoomCanvas.height);
    zoomContext.moveTo(0, this.zoomCanvas.height / 2);
    zoomContext.lineTo(this.zoomCanvas.width, this.zoomCanvas.height / 2);
    zoomContext.stroke();

    var ctx = this.context;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(c2.x, c2.y);
    ctx.arc(c2.x, c2.y, c2.r - 5, 0, 2 * Math.PI);
    ctx.clip();
    this.context.drawImage(this.zoomCanvas,
      c2.x - c2.r, c2.y - c2.r,
      this.zoomCanvas.width, this.zoomCanvas.height);

    ctx.restore();

    this.positionText.textContent = (this.offset.x - this.base.x) + ', ' + (this.offset.y - this.base.y);

    var pixel = zoomContext.getImageData(this.zoomCanvas.width / 2 - scale / 2, this.zoomCanvas.height / 2 - scale / 2, 1, 1);
    var color = this.colorToHex(pixel.data[0], pixel.data[1], pixel.data[2]);
    this.pixelColorText.textContent = color;
    this.colorPreview.style.background = color;

    var gradient = ctx.createLinearGradient(0, 0, 0, c2.r * 2);
    gradient.addColorStop(0, '#666');
    gradient.addColorStop(1, '#555');
    ctx.fillStyle = 'white';
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.arc(c2.x, c2.y, c2.r - 5, 0, Math.PI * 2, false);
    ctx.stroke();
  }
};

rooler.Loupe.prototype.handleMouseDown = function() {
  if (this.canClose) {
    this.close();
  }
};

rooler.Loupe.prototype.handleKeyDown = function(e) {
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

rooler.Loupe.prototype.updateLoupe = function() {
  var width = document.body.clientWidth;
  var height = window.innerHeight;

  var changed = false;
  if (this.offset.x - this.circlesLeft.c1 + this.circlesLeft.c2 + this.circles.c2.r > width) {
    if (this.circles.c1.x != this.circlesRight.c1) {
      changed = true;
      this.circles.c1.x = this.circlesRight.c1;
      this.circles.c2.x = this.circlesRight.c2;
    }
  } else if (this.circles.c1.x != this.circlesLeft.c1) {
    changed = true;
    this.circles.c1.x = this.circlesLeft.c1;
    this.circles.c2.x = this.circlesLeft.c2;
  }

  if (this.offset.y - this.circlesTop.c1 + this.circlesTop.c2 + this.circles.c2.r > height) {
    if (this.circles.c1.y != this.circlesBottom.c1) {
      changed = true;
      this.circles.c1.y = this.circlesBottom.c1;
      this.circles.c2.y = this.circlesBottom.c2;
    }
  } else if (this.circles.c1.y != this.circlesTop.c1) {
    changed = true;
    this.circles.c1.y = this.circlesTop.c1;
    this.circles.c2.y = this.circlesTop.c2;
  }
  if (changed) {
    this.drawLoupe();
  }
}

rooler.Loupe.prototype.drawLoupe = function() {
  this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  function ray(origin, radius, distance) {
    return {
      x: origin.x + Math.cos(radius) * distance,
      y: origin.y + Math.sin(radius) * distance
    };
  }

  var ctx = this.context;

  var c1 = this.circles.c1;
  var c2 = this.circles.c2;

  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, .8)';

  var angle = Math.atan2(c2.y - c1.y, c2.x - c1.x);

  var spread1 = Math.PI / 4;
  // Point at which the bezier curve A leaves circle 1.
  var c1a = ray(c1, angle - spread1, c1.r);
  // Control point for bezier curve A as it leaves circle 1.
  var cpa1 = ray(c1a, angle - spread1 + Math.PI / 2, c1.r / 3);
  // Point at which the bezier curve B leaves circle 1.
  var c1b = ray(c1, angle + spread1, c1.r);
  // Control point for bezier curve B as it leaves circle 1.
  var cpb1 = ray(c1b, angle + spread1 - Math.PI / 2, c1.r / 3);

  var spread2 = Math.PI / 8;
  var c2a = ray(c2, angle + spread2 + Math.PI, c2.r);
  var cpa2 = ray(c2a, angle + spread2 + Math.PI / 2, c2.r / 3);
  var c2b = ray(c2, angle - spread2 + Math.PI, c2.r);
  var cpb2 = ray(c2b, angle - spread2 + Math.PI + Math.PI / 2, c2.r / 3);

  ctx.beginPath();

  ctx.moveTo(c1a.x, c1a.y);
  ctx.bezierCurveTo(cpa1.x, cpa1.y, cpa2.x, cpa2.y, c2a.x, c2a.y);

  ctx.arc(c2.x, c2.y, c2.r, angle + spread2 + Math.PI, angle - spread2 + Math.PI);
  ctx.bezierCurveTo(cpb2.x, cpb2.y, cpb1.x, cpb1.y, c1b.x, c1b.y);
  ctx.arc(c1.x, c1.y, c1.r, angle - spread1, angle + spread1, true);
  ctx.moveTo(c1.x, c1.y);
  ctx.arc(c1.x, c1.y, c1.r - 5, angle + spread1, angle + spread1 + Math.PI * 2, false);

  ctx.shadowColor = 'rgba(0,0,0,.7)';
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 5;
  ctx.shadowBlur = 10;

  ctx.fill();
  ctx.restore();
};

rooler.Loupe.prototype.colorToHex = function(r, g, b) {
  function toHex(v) {
    var str = v.toString(16).toUpperCase();
    if (str.length == 1) {
      str = '0' + str;
    }
    return str;
  }
  return '#' + toHex(r) + toHex(g) + toHex(b);
};

rooler.Loupe.prototype.dot = function(pt) {
  var fill = this.context.fillStyle;
  this.context.fillStyle = 'red';

  this.context.beginPath();
  this.context.arc(pt.x, pt.y, 2, 0, 360, false);
  this.context.fill();
  this.context.fillStyle = fill;
}
