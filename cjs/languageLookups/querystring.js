"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _default = {
  name: 'querystring',
  lookup: function lookup(req, res, options) {
    var found;

    if (options.lookupQuerystring !== undefined && typeof req !== 'undefined') {
      if (options.getQuery(req)) {
        found = options.getQuery(req)[options.lookupQuerystring];
      }

      if (!found && options.getUrl(req) && options.getUrl(req).indexOf('?')) {
        var urlParams = new URLSearchParams(options.getUrl(req).substring(options.getUrl(req).indexOf('?')));
        found = urlParams.get(options.lookupQuerystring);
      }
    }

    return found;
  }
};
exports["default"] = _default;
module.exports = exports.default;