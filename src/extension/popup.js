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
};

rooler.Popup.prototype.openDistanceTool = function() {
  chrome.runtime.sendMessage({action: 'startDistanceTool'});
  window.close();
};

rooler.Popup.prototype.openBoundsTool = function() {
  chrome.runtime.sendMessage({action: 'startBoundsTool'});
  window.close();
};

rooler.Popup.prototype.openMagnifierTool = function() {
  chrome.runtime.sendMessage({action: 'startMagnifierTool'});
  window.close();
};

rooler.Popup.prototype.openLoupeTool = function() {
  chrome.runtime.sendMessage({action: 'startLoupeTool'});
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