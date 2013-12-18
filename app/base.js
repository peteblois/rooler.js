var rooler = rooler || {};

// From Mozilla's Dev Documentation.
if (!Function.prototype.bind) {
  Function.prototype.bind = function (oThis) {
    if (typeof this !== "function") {
      // closest thing possible to the ECMAScript 5 internal IsCallable function
      throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
    }

    var fSlice = Array.prototype.slice,
        aArgs = fSlice.call(arguments, 1),
        fToBind = this,
        fNOP = function () {},
        fBound = function () {
          return fToBind.apply(this instanceof fNOP
                                 ? this
                                 : oThis || window,
                               aArgs.concat(fSlice.call(arguments)));
        };

    fNOP.prototype = this.prototype;
    fBound.prototype = new fNOP();

    return fBound;
  };
}

rooler.clamp = function(value, min, max) {
  return Math.max(Math.min(value, max), min);
}

rooler.getScreenPixel = function (data, x, y, pixel) {
  var index = (y * 4) * data.width + (x * 4);
  pixel.r = data.data[index];
  pixel.g = data.data[index + 1];
  pixel.b = data.data[index + 2];
}

HTMLElement.prototype.appendTo = function(element) {
  element.appendChild(this);
  return this;
};

rooler.createElement = function(type, className) {
  var element = document.createElement(type);
  rooler.addClass(element, className);
  return element;
}

rooler.addClass = function(element, className) {
  var classes = rooler.getClasses(element);
  if (classes.indexOf(className) != -1) {
    return;
  }
  classes.push(className);
  element.className = classes.join(' ');

  return element;
}

rooler.getClasses = function(element) {
  if (!element.className) {
    return [];
  }
  return element.className.split(/\s+/);
}

rooler.removeClass = function(element, className) {
  var classes = rooler.getClasses(element);
  var index = classes.indexOf(className);
  if (index != -1) {
    classes.splice(index, 1);
    element.className = classes.join(' ');
  }

  return element;
};

rooler.applyRootStyle = function(root) {
  root.style.position = 'fixed';
  root.style.left = 0;
  root.style.right = 0;
  root.style.top = 0;
  root.style.bottom = 0;
};

// From Google Closure
rooler.inherits = function(child, parent) {
  function ctor() {};
  ctor.prototype = parent.prototype;
  child.superClass_ = parent.prototype;
  child.prototype = new ctor();
  child.prototype.constructor = child;
};

// From Google Closure
rooler.base = function(me, opt_methodName, var_args) {
  var caller = arguments.callee.caller;
  if (caller.superClass_) {
    // This is a constructor. Call the superclass constructor.
    return caller.superClass_.constructor.apply(
        me, Array.prototype.slice.call(arguments, 1));
  }

  var args = Array.prototype.slice.call(arguments, 2);
  var foundCaller = false;
  for (var ctor = me.constructor;
       ctor; ctor = ctor.superClass_ && ctor.superClass_.constructor) {
    if (ctor.prototype[opt_methodName] === caller) {
      foundCaller = true;
    } else if (foundCaller) {
      return ctor.prototype[opt_methodName].apply(me, args);
    }
  }

  // If we did not find the caller in the prototype chain,
  // then one of two things happened:
  // 1) The caller is an instance method.
  // 2) This method was not called by the right caller.
  if (me[opt_methodName] === caller) {
    return me.constructor.prototype[opt_methodName].apply(me, args);
  } else {
    throw Error(
        'rooler.base called from a method of one name ' +
        'to a method of a different name');
  }
};