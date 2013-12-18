
/**
 * Runs in the context of the page which is being inspected.
 **/
var rooler = rooler || {};

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

rooler.Rooler.prototype.startDistanceTool = function() {
  this.tools.push(new rooler.DistanceTool());

  this.requestUpdateScreenshot();
}

rooler.Rooler.prototype.startBoundsTool = function() {
  this.tools.push(new rooler.BoundsTool());

  this.requestUpdateScreenshot();
}

rooler.Rooler.prototype.startLoupeTool = function() {
  this.tools.push(new rooler.Loupe());

  this.requestUpdateScreenshot();
}

rooler.Rooler.prototype.startMagnifierTool = function() {
  this.tools.push(new rooler.Magnifier());

  this.requestUpdateScreenshot();
}

rooler.Rooler.prototype.requestUpdateScreenshot = function() {
  for (var i = 0; i < this.tools.length; ++i) {
    this.tools[i].hide();
  }
  this.port.postMessage({
    msg: 'getPageImage'
  });
}

rooler.Rooler.prototype.updateScreenshot = function(data) {
  for (var i = 0; i < this.tools.length; ++i) {
    this.tools[i].show();
  }

  var that = this;

  var img = document.createElement('img');
  img.addEventListener('load', function() {

    var canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    var context = canvas.getContext('2d');
    context.drawImage(img, 0, 0);

    that.screenShot = new rooler.ScreenShot(canvas);
  }, true);
  img.src = data;
}

if (!window.Rooler && window.chrome && window.chrome.extension) {
  window.Rooler = new rooler.Rooler();
}
