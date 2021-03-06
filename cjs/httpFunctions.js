"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.extendOptionsWithDefaults = exports.getSession = exports.send = exports.setStatus = exports.setContentType = exports.setHeader = exports.getBody = exports.getCookies = exports.getHeaders = exports.getParams = exports.getQuery = exports.getOriginalUrl = exports.setUrl = exports.getUrl = exports.getPath = void 0;

var getPath = function getPath(req) {
  if (req.path) return req.path;
  if (req.raw && req.raw.path) return req.raw.path;
  if (req.url) return req.url;
  console.log('no possibility found to get path');
};

exports.getPath = getPath;

var getUrl = function getUrl(req) {
  if (req.url) return req.url;
  if (req.raw && req.raw.url) return req.raw.url;
  console.log('no possibility found to get url');
};

exports.getUrl = getUrl;

var setUrl = function setUrl(req, url) {
  if (req.url) {
    req.url = url;
    return;
  }

  console.log('no possibility found to get url');
};

exports.setUrl = setUrl;

var getOriginalUrl = function getOriginalUrl(req) {
  if (req.originalUrl) return req.originalUrl;
  if (req.raw && req.raw.originalUrl) return req.raw.originalUrl;
  return getUrl(req);
};

exports.getOriginalUrl = getOriginalUrl;

var getQuery = function getQuery(req) {
  if (req.query) return req.query;
  if (req.raw && req.raw.query) return req.raw.query;
  if (req.ctx && req.ctx.queryParams) return req.ctx.queryParams;
  console.log('no possibility found to get query');
  return {};
};

exports.getQuery = getQuery;

var getParams = function getParams(req) {
  if (req.params) return req.params;
  if (req.raw && req.raw.params) return req.raw.params;
  if (req.ctx && req.ctx.params) return req.ctx.params;
  console.log('no possibility found to get params');
  return {};
};

exports.getParams = getParams;

var getHeaders = function getHeaders(req) {
  if (req.headers) return req.headers;
  console.log('no possibility found to get headers');
};

exports.getHeaders = getHeaders;

var getCookies = function getCookies(req) {
  if (req.cookies) return req.cookies;

  if (getHeaders(req)) {
    var list = {};
    var rc = getHeaders(req).cookie;
    rc && rc.split(';').forEach(function (cookie) {
      var parts = cookie.split('=');
      list[parts.shift().trim()] = parts.join('=');
    });
    return list;
  }

  console.log('no possibility found to get cookies');
};

exports.getCookies = getCookies;

var getBody = function getBody(req) {
  if (req.ctx && req.ctx.body) return req.ctx.body.bind(req.ctx);
  if (req.body) return req.body;
  console.log('no possibility found to get body');
  return {};
};

exports.getBody = getBody;

var setHeader = function setHeader(res, name, value) {
  if (typeof res.setHeader === 'function' && !(res._headerSent || res.headersSent)) return res.setHeader(name, value);
  if (typeof res.header === 'function') return res.header(name, value);
  if (res.headers && typeof res.headers.set === 'function') return res.headers.set(name, value);
  console.log('no possibility found to set header');
};

exports.setHeader = setHeader;

var setContentType = function setContentType(res, type) {
  if (typeof res.contentType === 'function') return res.contentType(type);
  if (typeof res.type === 'function') return res.type(type);
  setHeader(res, 'Content-Type', type);
};

exports.setContentType = setContentType;

var setStatus = function setStatus(res, code) {
  if (typeof res.status === 'function') return res.status(code); // eslint-disable-next-line no-return-assign

  if (res.status) return res.status = code;
  console.log('no possibility found to set status');
};

exports.setStatus = setStatus;

var send = function send(res, body) {
  if (typeof res.send === 'function') return res.send(body);
  return body;
};

exports.send = send;

var getSession = function getSession(req) {
  if (req.session) return req.session;
  if (req.raw && req.raw.session) return req.raw.session;
  console.log('no possibility found to get session');
};

exports.getSession = getSession;

var extendOptionsWithDefaults = function extendOptionsWithDefaults() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  options.getPath = options.getPath || getPath;
  options.getOriginalUrl = options.getOriginalUrl || getOriginalUrl;
  options.getUrl = options.getUrl || getUrl;
  options.setUrl = options.setUrl || setUrl;
  options.getParams = options.getParams || getParams;
  options.getSession = options.getSession || getSession;
  options.getQuery = options.getQuery || getQuery;
  options.getCookies = options.getCookies || getCookies;
  options.getBody = options.getBody || getBody;
  options.getHeaders = options.getHeaders || getHeaders;
  options.setHeader = options.setHeader || setHeader;
  options.setContentType = options.setContentType || setContentType;
  options.setStatus = options.setStatus || setStatus;
  options.send = options.send || send;
  return options;
};

exports.extendOptionsWithDefaults = extendOptionsWithDefaults;