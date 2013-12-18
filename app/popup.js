var rooler = rooler || {};

rooler.Popup = function() {
  var distanceMenuItem = document.getElementById('distanceTool');
  distanceMenuItem.addEventListener('click', this.openDistanceTool.bind(this), false);

  var boundsMenuItem = document.getElementById('boundsTool');
  boundsMenuItem.addEventListener('click', this.openBoundsTool.bind(this), false);

  var magnifyMenuItem = document.getElementById('magnifierTool');
  if (magnifyMenuItem) {
    magnifyMenuItem.addEventListener('click', this.openMagnifierTool.bind(this), false);
  }

  var loupeMenuItem = document.getElementById('loupeTool');
  loupeMenuItem.addEventListener('click', this.openLoupeTool.bind(this), false);

  var feedbackMenuItem = document.getElementById('feedback');
  feedbackMenuItem.addEventListener('click', this.sendFeedback.bind(this), false);
};

rooler.Popup.prototype.openDistanceTool = function() {
  chrome.extension.getBackgroundPage().rooler.background.startDistanceTool();
  window.close();
};

rooler.Popup.prototype.openBoundsTool = function() {
  chrome.extension.getBackgroundPage().rooler.background.startBoundsTool();
  window.close();
};

rooler.Popup.prototype.openMagnifierTool = function() {
  chrome.extension.getBackgroundPage().rooler.background.startMagnifierTool();
  window.close();
};

rooler.Popup.prototype.openLoupeTool = function() {
  chrome.extension.getBackgroundPage().rooler.background.startLoupeTool();
  window.close();
};

rooler.Popup.prototype.sendFeedback = function() {
  chrome.tabs.create({
    url: 'http://apps.blois.us/feedback?product=Rooler'
  });
  window.close();
};

window.addEventListener('load', function() {
  var popup = new rooler.Popup();
}, false);