'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _nanoajax = require('nanoajax');

var _nanoajax2 = _interopRequireDefault(_nanoajax);

var _microJsonp = require('micro-jsonp');

var _microJsonp2 = _interopRequireDefault(_microJsonp);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
  var fields = [].slice.call(form.querySelectorAll('[name]')) || false;

  if (!fields) return;

  return fields.map(function (f) {
    return {
      name: f.getAttribute('name'),
      value: f.value || undefined,
      valid: true,
      node: f
    };
  });
};

var runValidation = function runValidation(fields, tests) {
  return tests.forEach(function (test) {
    var field = fields.filter(function (f) {
      return test.name instanceof RegExp ? f.name.match(test.name) : test.name === f.name;
    })[0];

    if (!field) return;

    if (test.validate(field)) {
      test.success(field);
      field.valid = true;
    } else {
      test.error(field);
      field.valid = false;
    }
  });
};

var scrubAction = function scrubAction(base, data) {
  var query = base.match(/\?/) ? true : false;
  return '' + base + (query ? '&' : '?') + toQueryString(data);
};

var jsonpSend = function jsonpSend(action, fields, successCb, errorCb) {
  (0, _microJsonp2.default)(scrubAction(action, fields), {
    param: 'c',
    response: function response(err, data) {
      err ? errorCb(fields, err, null) : successCb(fields, data, null);
    }
  });
};

var send = function send(method, action, fields, successCb, errorCb) {
  return _nanoajax2.default.ajax({
    url: scrubAction(action, fields),
    method: method
  }, function (status, res, req) {
    console.log(req);
    var success = status >= 200 && status <= 300;
    success ? successCb(fields, res, req) : errorCb(fields, res, req);
  });
};

exports.default = function (form) {
  var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  form = form.getAttribute('action') ? form : form.getElementsByTagName('form')[0];

  var instance = {
    method: options.method || 'POST',
    success: options.success ? options.success : function (fields, res, req) {},
    error: options.error ? options.error : function (fields, res, req) {},
    tests: options.tests || [],
    action: form.getAttribute('action'),
    jsonp: options.jsonp || false
  };

  form.onsubmit = function (e) {
    e.preventDefault();

    instance.fields = getFormFields(form);

    runValidation(instance.fields, instance.tests);

    isValid(instance.fields) ? !!instance.jsonp ? jsonpSend(instance.action, instance.fields, instance.success, instance.error) : send(instance.method, instance.action, instance.fields, instance.success, instance.error) : instance.error(fields);
  };

  return instance;
};