"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var utils = _interopRequireWildcard(require("./utils.js"));

var _cookie = _interopRequireDefault(require("./languageLookups/cookie.js"));

var _querystring = _interopRequireDefault(require("./languageLookups/querystring.js"));

var _path = _interopRequireDefault(require("./languageLookups/path.js"));

var _header = _interopRequireDefault(require("./languageLookups/header.js"));

var _session = _interopRequireDefault(require("./languageLookups/session.js"));

var _httpFunctions = require("./httpFunctions.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function getDefaults() {
  return (0, _httpFunctions.extendOptionsWithDefaults)({
    order: [
    /* 'path', 'session' */
    'querystring', 'cookie', 'header'],
    lookupQuerystring: 'lng',
    lookupCookie: 'i18next',
    lookupSession: 'lng',
    lookupFromPathIndex: 0,
    // cache user language
    caches: false // ['cookie']
    // cookieExpirationDate: new Date(),
    // cookieDomain: 'myDomain'

  });
}

var LanguageDetector = /*#__PURE__*/function () {
  function LanguageDetector(services) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var allOptions = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    _classCallCheck(this, LanguageDetector);

    this.type = 'languageDetector';
    this.detectors = {};
    this.init(services, options, allOptions);
  }

  _createClass(LanguageDetector, [{
    key: "init",
    value: function init(services) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var allOptions = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      this.services = services;
      this.options = utils.defaults(options, this.options || {}, getDefaults());
      this.allOptions = allOptions;
      this.addDetector(_cookie["default"]);
      this.addDetector(_querystring["default"]);
      this.addDetector(_path["default"]);
      this.addDetector(_header["default"]);
      this.addDetector(_session["default"]);
    }
  }, {
    key: "addDetector",
    value: function addDetector(detector) {
      this.detectors[detector.name] = detector;
    }
  }, {
    key: "detect",
    value: function detect(req, res, detectionOrder) {
      var _this = this;

      if (arguments.length < 2) return;
      if (!detectionOrder) detectionOrder = this.options.order;
      var found;
      detectionOrder.forEach(function (detectorName) {
        if (found || !_this.detectors[detectorName]) return;

        var detections = _this.detectors[detectorName].lookup(req, res, _this.options);

        if (!detections) return;
        if (!Array.isArray(detections)) detections = [detections];
        detections.forEach(function (lng) {
          if (found || typeof lng !== 'string') return;

          var cleanedLng = _this.services.languageUtils.formatLanguageCode(lng);

          if (_this.services.languageUtils.isWhitelisted(cleanedLng)) {
            found = cleanedLng;
            req.i18nextLookupName = detectorName;
          }

          ;
        });
      });

      if (!found) {
        var fallbacks = this.allOptions.fallbackLng;
        if (typeof fallbacks === 'string') fallbacks = [fallbacks];
        if (!fallbacks) fallbacks = [];

        if (Object.prototype.toString.apply(fallbacks) === '[object Array]') {
          found = fallbacks[0];
        } else {
          found = fallbacks[0] || fallbacks["default"] && fallbacks["default"][0];
        }
      }

      ;
      return found;
    }
  }, {
    key: "cacheUserLanguage",
    value: function cacheUserLanguage(req, res, lng, caches) {
      var _this2 = this;

      if (arguments.length < 3) return;
      if (!caches) caches = this.options.caches;
      if (!caches) return;
      caches.forEach(function (cacheName) {
        if (_this2.detectors[cacheName] && _this2.detectors[cacheName].cacheUserLanguage) _this2.detectors[cacheName].cacheUserLanguage(req, res, lng, _this2.options);
      });
    }
  }]);

  return LanguageDetector;
}();

LanguageDetector.type = 'languageDetector';
var _default = LanguageDetector;
exports["default"] = _default;
module.exports = exports.default;