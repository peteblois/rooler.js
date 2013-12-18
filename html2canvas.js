var rooler = rooler || {};

// Super hacky class to render an HTML DOM to a canvas element.
rooler.Html2Canvas = function(element) {
  var width = element.scrollWidth;
  var height = element.scrollHeight;

  this.canvas = document.createElement('canvas');
  this.canvas.width = width;
  this.canvas.height = height;
  this.context = this.canvas.getContext('2d');

  this.baseOffset = this.getOffset(element);

  this.draw(element);

  this.offset = {
    x: 0,
    y: 0
  }
};

rooler.Html2Canvas.prototype.draw = function(element) {
  var style = window.getComputedStyle(element);
  var visibility = style.visibility || style['visibility'];
  if (visibility != 'visible') {
    return;
  }
  this.context.save();

  var offset = this.getRelativeOffset(element);
  this.context.translate(offset.x, offset.y);

  var width = element.scrollWidth;
  var height = element.scrollHeight;

  this.renderBackground(element, style, width, height);
  this.renderBorder(element, style, width, height);

  if (this['draw' + element.nodeName]) {
    this['draw' + element.nodeName](element);
  }

  if (element.textContent && element.textContent == element.innerHTML) {
    var fontWeight = style.fontWeight || style['font-weight'];
    var fontSize = style.fontSize || style['font-size'];
    var fontFamily = style.fontFamily || style['font-family'];
    this.context.font = fontWeight + ' '  + fontSize + ' ' + fontFamily;
    this.context.fillStyle = style.color || style['color'];
    this.context.textBaseline = 'top';

    var letterSpacing = this.parseLength(style.letterSpacing || style['letter-spacing']);
    if (letterSpacing != 0) {
      var offsetY = 0;
      if (navigator.userAgent.indexOf('Firefox')!=-1) {
        offsetY = -letterSpacing
      }
      this.renderText(element.textContent, 0, offsetY, letterSpacing);
    } else {
      var paddingTop = this.parseLength(style.paddingTop || style['padding-top']);
      var paddingLeft = this.parseLength(style.paddingLeft || style['padding-left']);
      this.context.fillText(element.textContent, paddingLeft, paddingTop, element.clientWidth);
    }
  }

  this.context.restore();

  for (var i = 0; i < element.children.length; ++i) {
    var child = element.children[i];
    this.draw(child);
  }
};

rooler.Html2Canvas.prototype.parseLength = function(val) {
  var pxIndex = val.indexOf('px');
  if (pxIndex != -1) {
    return parseInt(val.substr(0, pxIndex), 10);
  }
  return 0;
}

rooler.Html2Canvas.prototype.renderBackground = function(element, style, width, height) {
  this.context.fillStyle = style.backgroundColor || style['background-color'];
  this.context.fillRect(0, 0, width, height);

  var backgroundImage = style.backgroundImage || style['background-image'];
  if (backgroundImage && backgroundImage.length > 0 && backgroundImage != 'none') {
    if (backgroundImage.indexOf('linear-gradient(') > 0) {
      var stopsText = backgroundImage.substring(
          backgroundImage.indexOf('(') + 1,
          backgroundImage.lastIndexOf(')'));

      var stops = this.parseStops(stopsText);
      var gradient = this.context.createLinearGradient(0, 0, 0, height);
      for (var i = 0; i < stops.length; ++i) {
        gradient.addColorStop(i / (stops.length - 1), stops[i]);
      }
      this.context.fillStyle = gradient;
      this.context.fillRect(0, 0, width, height);
    }
  }
};

rooler.Html2Canvas.prototype.parseStops = function(text) {
  var stops = [];
  //return;
  while(text.length > 0) {
    if (text.indexOf('top') == 0) {
      text = text.substr(5);
    } else if (text.indexOf('rgba(') == 0 || text.indexOf('rgb(') == 0) {
      stops.push(text.substr(0, text.indexOf(')') + 1));
      text = text.substr(text.indexOf(')') + 3);
    }
  }
  return stops;
}

rooler.Html2Canvas.prototype.renderBorder = function(element, style, width, height) {
  var borderWidth = this.parseLength(style.borderLeftWidth || style['border-left-width']);
  var borderColor = style.borderLeftColor || style['border-left-color'];
  if (borderWidth > 0) {
    this.context.lineWidth = borderWidth;
    this.context.strokeStyle = borderColor;
    this.context.strokeRect(1, 1, width + borderWidth * 2 - 2, height + borderWidth * 2 - 2);

    this.context.translate(borderWidth, borderWidth * 2);
  }
};

// Using code from below to implement letterSpacing in canvas.
// http://davidhong.co/blog/2011/07/26/on-html5-canvas-filltext/
rooler.Html2Canvas.prototype.renderText = function(text, x, y, letterSpacing) {
  if (!text || typeof text !== 'string' || text.length === 0) {
    return;
  }

  if (typeof letterSpacing === 'undefined') {
    letterSpacing = 0;
  }
  var characters = String.prototype.split.call(text, ''),
      index = 0,
      current,
      currentPosition = x,
      align = 1;

  if (this.context.textAlign === 'right') {
      characters = characters.reverse();
      align = -1;
  } else if (this.context.textAlign === 'center') {
      var totalWidth = 0;
      for (var i = 0; i < characters.length; i++) {
          totalWidth += (this.context.measureText(characters[i]).width + letterSpacing);
      }
      currentPosition = x - (totalWidth / 2);
  }

  while (index < text.length) {
      current = characters[index++];
      this.context.fillText(current, currentPosition, y);
      currentPosition += (align * (this.context.measureText(current).width + letterSpacing));
  }
};

rooler.Html2Canvas.prototype.getOffset = function(element) {
  var offset = {
    x: element.offsetLeft,
    y: element.offsetTop
  };
  if (element.offsetParent) {
    var parentOffset = this.getOffset(element.offsetParent);
    offset.x += parentOffset.x;
    offset.y += parentOffset.y;
  }
  return offset;
};

rooler.Html2Canvas.prototype.getRelativeOffset = function(element) {
  var offset = this.getOffset(element);
  return {
    x: offset.x - this.baseOffset.x,
    y: offset.y - this.baseOffset.y
  };
}

rooler.Html2Canvas.prototype.drawIMG = function(element) {
  this.context.drawImage(element, 0, 0);
}

rooler.Html2Canvas.capture = function(element) {
  return new rooler.Html2Canvas(element).canvas;
};