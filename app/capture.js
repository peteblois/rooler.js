var rooler = rooler || {};

rooler.Capture = function(url, size) {
  this.url = url;
  this.size = size;

  this.root = rooler.createElement('div', 'roolerShield roolerRoot');

  this.popup = rooler.createElement('div', 'roolerPopup');
  this.root.appendChild(this.popup);

  var instructions = rooler.createElement('div', 'roolerCaptureInstructions');
  this.popup.appendChild(instructions);
  instructions.innerHTML = 'Right click on image and<br/> \'Save Image As...\' to save.';

  var matte = rooler.createElement('div', 'roolerCaptureMatte');
  this.popup.appendChild(matte);

  this.img = document.createElement('img');
  this.img.src = url;
  matte.appendChild(this.img);

  document.body.appendChild(this.root);

  this.popup.style.left = (window.innerWidth - size.width) / 2 + 'px';
  this.popup.style.top = (window.innerHeight - size.height) / 2 + 'px';

  this.close = this.close.bind(this);
  this.save = this.save.bind(this);

  this.root.addEventListener('mousedown', this.close, false);
  this.popup.addEventListener('mousedown', this.suppressEvent, false);
};

rooler.Capture.prototype.suppressEvent = function(e) {
  e.preventDefault();
  e.stopPropagation();
  return true;
};

rooler.Capture.prototype.close = function(e) {
  document.body.removeChild(this.root);

  e.preventDefault();
  e.stopPropagation();
  return true;
};

rooler.Capture.prototype.save = function() {
};