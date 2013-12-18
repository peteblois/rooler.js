/**
 * Runs in the background of the browser while the extension is loaded.
 * This is responsible for launching the extension in the context of the tabs
 * and responding to requests from the code in the tabs.
 */

var rooler = rooler || {};

/**
 * Handler for all background coordination across all tabs.
 */
rooler.Background = function() {
  chrome.extension.onConnect.addListener(this.handleConnect_.bind(this));
  this.tabManagers = [];
  this.pendingCommands = [];
}

/**
 * Start the distance tool running on the current tab.
 */
rooler.Background.prototype.startDistanceTool = function() {
  var command = {
    msg: 'startDistanceTool'
  };
  var that = this;
  chrome.tabs.getSelected(null, function(tab) {
    that.postCommand(command, tab);
  });
}

/**
 * Start the bounds tool running on the current tab.
 */
rooler.Background.prototype.startBoundsTool = function() {
  var command = {
    msg: 'startBoundsTool'
  };
  var that = this;
  chrome.tabs.getSelected(null, function(tab) {
    that.postCommand(command, tab);
  });
}

/**
 * Start the magnifier tool running on the current tab.
 */
rooler.Background.prototype.startMagnifierTool = function() {
  var command = {
    msg: 'startMagnifierTool'
  };
  var that = this;
  chrome.tabs.getSelected(null, function(tab) {
    that.postCommand(command, tab);
  });
}

/**
 * Start the loupe tool running on the current tab.
 */
rooler.Background.prototype.startLoupeTool = function() {
  var command = {
    msg: 'startLoupeTool'
  };
  var that = this;
  chrome.tabs.getSelected(null, function(tab) {
    that.postCommand(command, tab);
  });
};

rooler.Background.prototype.postCommand = function(command, tab) {
  var tabManager = this.findTabManager(tab);
  if (tabManager != null) {
    tabManager.postCommand(command);
  }
  else {
    this.pendingCommands[tab.id] = command;
    chrome.tabs.executeScript(tab.id, { file: 'base.js' } );
    chrome.tabs.executeScript(tab.id, { file: 'tool.js' } );
    chrome.tabs.executeScript(tab.id, { file: 'distance.js' } );
    chrome.tabs.executeScript(tab.id, { file: 'capture.js' } );
    chrome.tabs.executeScript(tab.id, { file: 'bounds.js' } );
    chrome.tabs.executeScript(tab.id, { file: 'loupe.js' } );
    chrome.tabs.executeScript(tab.id, { file: 'magnifier.js' } );
    chrome.tabs.executeScript(tab.id, { file: 'screencoordinates.js' } );
    chrome.tabs.executeScript(tab.id, { file: 'screenshot.js' } );
    chrome.tabs.insertCSS(tab.id, { file: 'rooler.css' } );
    chrome.tabs.executeScript(tab.id, { file: 'rooler.js' } );
  }
}

rooler.Background.prototype.findTabManager = function(tab) {
  for (var i = 0; i < this.tabManagers.length; ++i) {
    if (this.tabManagers[i].tab.id == tab.id) {
      return this.tabManagers[i];
    }
  }
  return null;
}

/**
 * Handles new connections from tabs.
 */
rooler.Background.prototype.handleConnect_ = function(port) {
  var command = this.pendingCommands[port.sender.tab.id];

  var tabManager = new rooler.TabManager(port, command);
  this.tabManagers.push(tabManager);
}

rooler.Background.prototype.removeTabManager = function(tabManager) {
  var index = this.tabManagers.indexOf(tabManager);
  this.tabManagers.splice(index, 1);
}

/**
 * Handles extension communication with a single tab.
 */
rooler.TabManager = function(port, command) {
  this.port = port;
  this.tab = port.sender.tab;
  this.command = command;

  this.port.onMessage.addListener(this.handleMessage_.bind(this));
  this.port.onDisconnect.addListener(this.handleClose_.bind(this));
}

rooler.TabManager.prototype.handleMessage_ = function(message) {
  //if (msg && msg.msg) {
    var fn = this[message.msg];
    fn.apply(this);
  //}
}

rooler.TabManager.prototype.start = function() {
  this.port.postMessage(this.command);
}

rooler.TabManager.prototype.postCommand = function(command) {
  this.port.postMessage(command);
}

rooler.TabManager.prototype.getPageImage = function() {
  var that = this;
//  chrome.tabs.update(this.tab.id, { selected: true }
  chrome.tabs.captureVisibleTab (this.tab.windowId, { format: "png" }, function(dataUrl) {
    that.port.postMessage({msg:'updateScreenshot', args: [dataUrl]});
  });
}

rooler.TabManager.prototype.handleClose_ = function() {
  window.rooler.background.removeTabManager(this);
}

window.rooler.background = new rooler.Background();