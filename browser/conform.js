(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.conform = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.merge = undefined;

var _nanoajax = require('nanoajax');

var _nanoajax2 = _interopRequireDefault(_nanoajax);

var _microJsonp = require('micro-jsonp');

var _microJsonp2 = _interopRequireDefault(_microJsonp);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var origin = window.location.origin || window.location.protocol + '//' + window.location.host;

var getAction = function getAction(form) {
  var action = form.getAttribute('action');
  return action.split(/\#/)[0];
};

/**
 * Merge two objects into a 
 * new object
 *
 * @param {object} target Root object
 * @param {object} source Object to merge 
 *
 * @return {object} A *new* object with all props of the passed objects
 */
var merge = exports.merge = function merge(target) {
  for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }

  for (var i = 0; i < args.length; i++) {
    var source = args[i];
    for (var key in source) {
      if (source[key]) target[key] = source[key];
    }
  }

  return target;
};

var toQueryString = function toQueryString(fields) {
  var data = '';
  var names = Object.keys(fields);

  for (var i = 0; i < names.length; i++) {
    var field = fields[names[i]];
    data += encodeURIComponent(field.name) + '=' + encodeURIComponent(field.value || '') + (i < names.length - 1 ? '&' : '');
  }

  return data;
};

var isValid = function isValid(fields) {
  var keys = Object.keys(fields);

  for (var i = 0; i < keys.length; i++) {
    var field = fields[keys[i]];
    if (!field.valid) return false;
  }

  return true;
};

var getFormFields = function getFormFields(form) {
  var fields = [].slice.call(form.querySelectorAll('[name]'));

  if (!fields) return;

  return fields.reduce(function (result, field) {
    result[field.getAttribute('name')] = {
      valid: true,
      name: field.getAttribute('name'),
      value: field.value || undefined,
      field: field
    };

    return result;
  }, {});
};

var runValidation = function runValidation(fields, tests) {
  return tests.forEach(function (test) {
    var field = fields[test.name];

    if (test.validate(field)) {
      test.success(field);
      field.valid = true;
    } else {
      test.error(field);
      field.valid = false;
    }
  });
};

var jsonpSend = function jsonpSend(action, fields, successCb, errorCb) {
  (0, _microJsonp2.default)(action + '&' + toQueryString(fields), {
    param: 'c',
    response: function response(err, data) {
      err ? errorCb(fields, err, null) : successCb(fields, data, null);
    }
  });
};

var send = function send(action, fields, successCb, errorCb) {
  return _nanoajax2.default.ajax({
    url: action + '&' + toQueryString(fields),
    method: 'GET'
  }, function (status, res, req) {
    var success = status >= 200 && status <= 300;
    success ? successCb(fields, res, req) : errorCb(fields, res, req);
  });
};

exports.default = function (form) {
  var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  form = form.getAttribute('action') ? form : form.getElementsByTagName('form')[0];

  var instance = Object({});

  merge(instance, {
    success: function success(data, response) {},
    error: function error(data, response) {},
    action: getAction(form),
    tests: []
  }, options);

  form.onsubmit = function (e) {
    e.preventDefault();

    instance.fields = getFormFields(form);

    runValidation(instance.fields, instance.tests);

    isValid(instance.fields) ? !!instance.jsonp ? jsonpSend(instance.action, instance.fields, instance.success, instance.error) : send(instance.action, instance.fields, instance.success, instance.error) : instance.error(fields);
  };

  return instance;
};

},{"micro-jsonp":2,"nanoajax":3}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var count = 0;

/**
 * Options:
 *  - param {String} query parameter + callback name
 *  - timeout {Number} how long to wait for a response 
 *
 * @param {String} url
 * @param {Object} options
 */

exports.default = function (url) {
  var opts = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  var cb = '__c' + count++;
  var param = opts.param || 'callback';
  var query = param + '=' + cb;
  var timeout = opts.timeout || 60000;
  var response = opts.response ? opts.response : function (err, data) {
    return console.log(err, data);
  };
  var script = document.createElement('script');

  var cancel = function cancel() {
    return window[cb] ? cleanup() : null;
  };

  var timer = timeout ? setTimeout(function () {
    cleanup();
    response(new Error('Timeout'));
  }, timeout) : null;

  var cleanup = function cleanup() {
    document.head.removeChild(script);
    window[cb] = function () {};
    if (timer) clearTimeout(timer);
  };

  window[cb] = function (data) {
    response(null, data);
    cleanup();
  };

  script.src = url + '&' + query;
  document.head.appendChild(script);

  return cancel;
};

},{}],3:[function(require,module,exports){
(function (global){
// Best place to find information on XHR features is:
// https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest

var reqfields = [
  'responseType', 'withCredentials', 'timeout', 'onprogress'
]

// Simple and small ajax function
// Takes a parameters object and a callback function
// Parameters:
//  - url: string, required
//  - headers: object of `{header_name: header_value, ...}`
//  - body:
//      + string (sets content type to 'application/x-www-form-urlencoded' if not set in headers)
//      + FormData (doesn't set content type so that browser will set as appropriate)
//  - method: 'GET', 'POST', etc. Defaults to 'GET' or 'POST' based on body
//  - cors: If your using cross-origin, you will need this true for IE8-9
//
// The following parameters are passed onto the xhr object.
// IMPORTANT NOTE: The caller is responsible for compatibility checking.
//  - responseType: string, various compatability, see xhr docs for enum options
//  - withCredentials: boolean, IE10+, CORS only
//  - timeout: long, ms timeout, IE8+
//  - onprogress: callback, IE10+
//
// Callback function prototype:
//  - statusCode from request
//  - response
//    + if responseType set and supported by browser, this is an object of some type (see docs)
//    + otherwise if request completed, this is the string text of the response
//    + if request is aborted, this is "Abort"
//    + if request times out, this is "Timeout"
//    + if request errors before completing (probably a CORS issue), this is "Error"
//  - request object
//
// Returns the request object. So you can call .abort() or other methods
//
// DEPRECATIONS:
//  - Passing a string instead of the params object has been removed!
//
exports.ajax = function (params, callback) {
  // Any variable used more than once is var'd here because
  // minification will munge the variables whereas it can't munge
  // the object access.
  var headers = params.headers || {}
    , body = params.body
    , method = params.method || (body ? 'POST' : 'GET')
    , called = false

  var req = getRequest(params.cors)

  function cb(statusCode, responseText) {
    return function () {
      if (!called) {
        callback(req.status === undefined ? statusCode : req.status,
                 req.status === 0 ? "Error" : (req.response || req.responseText || responseText),
                 req)
        called = true
      }
    }
  }

  req.open(method, params.url, true)

  var success = req.onload = cb(200)
  req.onreadystatechange = function () {
    if (req.readyState === 4) success()
  }
  req.onerror = cb(null, 'Error')
  req.ontimeout = cb(null, 'Timeout')
  req.onabort = cb(null, 'Abort')

  if (body) {
    setDefault(headers, 'X-Requested-With', 'XMLHttpRequest')

    if (!global.FormData || !(body instanceof global.FormData)) {
      setDefault(headers, 'Content-Type', 'application/x-www-form-urlencoded')
    }
  }

  for (var i = 0, len = reqfields.length, field; i < len; i++) {
    field = reqfields[i]
    if (params[field] !== undefined)
      req[field] = params[field]
  }

  for (var field in headers)
    req.setRequestHeader(field, headers[field])

  req.send(body)

  return req
}

function getRequest(cors) {
  // XDomainRequest is only way to do CORS in IE 8 and 9
  // But XDomainRequest isn't standards-compatible
  // Notably, it doesn't allow cookies to be sent or set by servers
  // IE 10+ is standards-compatible in its XMLHttpRequest
  // but IE 10 can still have an XDomainRequest object, so we don't want to use it
  if (cors && global.XDomainRequest && !/MSIE 1/.test(navigator.userAgent))
    return new XDomainRequest
  if (global.XMLHttpRequest)
    return new XMLHttpRequest
}

function setDefault(obj, key, value) {
  obj[key] = obj[key] || value
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}]},{},[1])(1)
});