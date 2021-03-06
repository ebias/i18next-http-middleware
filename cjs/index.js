"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.handle = handle;
exports.plugin = plugin;
exports.getResourcesHandler = getResourcesHandler;
exports.missingKeyHandler = missingKeyHandler;
exports.addRoute = addRoute;
exports["default"] = exports.LanguageDetector = void 0;

var utils = _interopRequireWildcard(require("./utils.js"));

var _LanguageDetector = _interopRequireDefault(require("./LanguageDetector.js"));

var _httpFunctions = require("./httpFunctions.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

var LanguageDetector = _LanguageDetector["default"];
exports.LanguageDetector = LanguageDetector;

var checkForCombinedReqRes = function checkForCombinedReqRes(req, res, next) {
  if (!res && req.request && req.response) {
    res = req.response;
    if (!req.request.ctx) req.request.ctx = req;
    req = req.request;
    if (!next) next = function next() {};
  }

  return {
    req: req,
    res: res,
    next: next
  };
};

function handle(i18next) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  (0, _httpFunctions.extendOptionsWithDefaults)(options);
  return function i18nextMiddleware(rq, rs, n) {
    var _checkForCombinedReqR = checkForCombinedReqRes(rq, rs, n),
        req = _checkForCombinedReqR.req,
        res = _checkForCombinedReqR.res,
        next = _checkForCombinedReqR.next;

    if (typeof options.ignoreRoutes === 'function') {
      if (options.ignoreRoutes(req, res, options, i18next)) {
        return next();
      }
    } else {
      var ignores = options.ignoreRoutes instanceof Array && options.ignoreRoutes || [];

      for (var i = 0; i < ignores.length; i++) {
        if (options.getPath(req).indexOf(ignores[i]) > -1) return next();
      }
    }

    var i18n = i18next.cloneInstance({
      initImmediate: false
    });
    i18n.on('languageChanged', function (lng) {
      // Keep language in sync
      req.language = req.locale = req.lng = lng;

      if (res.locals) {
        res.locals.language = lng;
        res.locals.languageDir = i18next.dir(lng);
      }

      if (lng) {
        options.setHeader(res, 'Content-Language', lng);
      }

      req.languages = i18next.services.languageUtils.toResolveHierarchy(lng);

      if (i18next.services.languageDetector) {
        i18next.services.languageDetector.cacheUserLanguage(req, res, lng);
      }
    });
    var lng = req.lng;
    if (!lng && i18next.services.languageDetector) lng = i18next.services.languageDetector.detect(req, res); // set locale

    req.language = req.locale = req.lng = lng;

    if (lng) {
      options.setHeader(res, 'Content-Language', lng);
    }

    req.languages = i18next.services.languageUtils.toResolveHierarchy(lng); // trigger sync to instance - might trigger async load!

    i18n.changeLanguage(lng || i18next.options.fallbackLng[0]);

    if (req.i18nextLookupName === 'path' && options.removeLngFromUrl) {
      options.setUrl(req, utils.removeLngFromUrl(options.getUrl(req), i18next.services.languageDetector.options.lookupFromPathIndex));
    }

    var t = i18n.t.bind(i18n);
    var exists = i18n.exists.bind(i18n); // assert for req

    req.i18n = i18n;
    req.t = t; // assert for res -> template

    if (res.locals) {
      res.locals.t = t;
      res.locals.exists = exists;
      res.locals.i18n = i18n;
      res.locals.language = lng;
      res.locals.languageDir = i18next.dir(lng);
    }

    if (i18next.services.languageDetector) i18next.services.languageDetector.cacheUserLanguage(req, res, lng); // load resources

    if (!req.lng) return next();
    i18next.loadLanguages(req.lng, function () {
      return next();
    });
  };
}

function plugin(instance, options, next) {
  var middleware = handle(options.i18next, options);
  instance.addHook('preHandler', function (request, reply, next) {
    return middleware(request, reply, next);
  });
  return next();
}

plugin[Symbol["for"]('skip-override')] = true;

function getResourcesHandler(i18next) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  (0, _httpFunctions.extendOptionsWithDefaults)(options);
  var maxAge = options.maxAge || 60 * 60 * 24 * 30;
  return function (rq, rs) {
    var _checkForCombinedReqR2 = checkForCombinedReqRes(rq, rs),
        req = _checkForCombinedReqR2.req,
        res = _checkForCombinedReqR2.res;

    if (!i18next.services.backendConnector) {
      options.setStatus(res, 404);
      return options.send(res, 'i18next-express-middleware:: no backend configured');
    }

    var resources = {};
    options.setContentType(res, 'application/json');

    if (options.cache !== undefined ? options.cache : typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'production') {
      options.setHeader(res, 'Cache-Control', 'public, max-age=' + maxAge);
      options.setHeader(res, 'Expires', new Date(new Date().getTime() + maxAge * 1000).toUTCString());
    } else {
      options.setHeader(res, 'Pragma', 'no-cache');
      options.setHeader(res, 'Cache-Control', 'no-cache');
    }

    var languages = options.getQuery(req)[options.lngParam || 'lng'] ? options.getQuery(req)[options.lngParam || 'lng'].split(' ') : [];
    var namespaces = options.getQuery(req)[options.nsParam || 'ns'] ? options.getQuery(req)[options.nsParam || 'ns'].split(' ') : []; // extend ns

    namespaces.forEach(function (ns) {
      if (i18next.options.ns && i18next.options.ns.indexOf(ns) < 0) i18next.options.ns.push(ns);
    });
    i18next.services.backendConnector.load(languages, namespaces, function () {
      languages.forEach(function (lng) {
        namespaces.forEach(function (ns) {
          utils.setPath(resources, [lng, ns], i18next.getResourceBundle(lng, ns));
        });
      });
    });
    return options.send(res, resources);
  };
}

function missingKeyHandler(i18next) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  (0, _httpFunctions.extendOptionsWithDefaults)(options);
  return function (rq, rs) {
    var _checkForCombinedReqR3 = checkForCombinedReqRes(rq, rs),
        req = _checkForCombinedReqR3.req,
        res = _checkForCombinedReqR3.res;

    var lng = options.getParams(req)[options.lngParam || 'lng'];
    var ns = options.getParams(req)[options.nsParam || 'ns'];

    if (!i18next.services.backendConnector) {
      options.setStatus(res, 404);
      return options.send(res, 'i18next-express-middleware:: no backend configured');
    }

    var body = options.getBody(req);

    if (typeof body === 'function') {
      var promise = body();

      if (promise && typeof promise.then === 'function') {
        return new Promise(function (resolve) {
          promise.then(function (b) {
            for (var m in b) {
              i18next.services.backendConnector.saveMissing([lng], ns, m, b[m]);
            }

            resolve(options.send(res, 'ok'));
          });
        });
      }
    }

    for (var m in body) {
      i18next.services.backendConnector.saveMissing([lng], ns, m, body[m]);
    }

    return options.send(res, 'ok');
  };
}

function addRoute(i18next, route, lngs, app, verb, fc) {
  if (typeof verb === 'function') {
    fc = verb;
    verb = 'get';
  } // Combine `fc` and possible more callbacks to one array


  var callbacks = [fc].concat(Array.prototype.slice.call(arguments, 6));

  for (var i = 0, li = lngs.length; i < li; i++) {
    var parts = String(route).split('/');
    var locRoute = [];

    for (var y = 0, ly = parts.length; y < ly; y++) {
      var part = parts[y]; // if the route includes the parameter :lng
      // this is replaced with the value of the language

      if (part === ':lng') {
        locRoute.push(lngs[i]);
      } else if (part.indexOf(':') === 0 || part === '') {
        locRoute.push(part);
      } else {
        locRoute.push(i18next.t(part, {
          lng: lngs[i]
        }));
      }
    }

    var routes = [locRoute.join('/')];
    app[verb || 'get'].apply(app, routes.concat(callbacks));
  }
}

var _default = {
  plugin: plugin,
  handle: handle,
  getResourcesHandler: getResourcesHandler,
  missingKeyHandler: missingKeyHandler,
  addRoute: addRoute,
  LanguageDetector: LanguageDetector
};
exports["default"] = _default;