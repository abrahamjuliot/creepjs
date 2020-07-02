(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

function _templateObject6() {
  var data = _taggedTemplateLiteral(["", ""]);

  _templateObject6 = function _templateObject6() {
    return data;
  };

  return data;
}

function _templateObject5() {
  var data = _taggedTemplateLiteral(["<div>Error loading visitor data</div>"]);

  _templateObject5 = function _templateObject5() {
    return data;
  };

  return data;
}

function _templateObject4() {
  var data = _taggedTemplateLiteral(["", ""]);

  _templateObject4 = function _templateObject4() {
    return data;
  };

  return data;
}

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _templateObject3() {
  var data = _taggedTemplateLiteral(["\n\t<fingerprint>\n\t\t<visitor><div id=\"visitor\">Loading visitor data...</div></visitor>\n\t\t<div id=\"fingerprint\"></div>\n\t\t\n\t\t<div id=\"rect-container\">\n\t\t\t<style>\n\t\t\t.rects{width:10px;height:10px;max-width:100%}.absolute{position:absolute}#cRect1{border:solid 2.715px;border-color:#F72585;padding:3.98px;margin-left:12.12px}#cRect2{border:solid 2px;border-color:#7209B7;font-size:30px;margin-top:20px;transform:skewY(23.1753218deg)}#cRect3{border:solid 2.89px;border-color:#3A0CA3;font-size:45px;transform:scale(100000000000000000000009999999999999.99, 1.89);margin-top:50px}#cRect4{border:solid 2px;border-color:#4361EE;transform:matrix(1.11, 2.0001, -1.0001, 1.009, 150, 94.4);margin-top:11.1331px;margin-left:12.1212px;padding:4.4545px;left:239.4141px;top:8.5050px}#cRect5{border:solid 2px;border-color:#4CC9F0;margin-left:42.395pt}#cRect6{border:solid 2px;border-color:#F72585;transform:perspective(12890px) translateZ(101.5px);padding:12px}#cRect7{margin-top:-350.552px;margin-left:0.9099rem;border:solid 2px;border-color:#4361EE}#cRect8{margin-top:-150.552px;margin-left:15.9099rem;border:solid 2px;border-color:#3A0CA3}#cRect9{margin-top:-110.552px;margin-left:15.9099rem;border:solid 2px;border-color:#7209B7}#cRect10{margin-top:-315.552px;margin-left:15.9099rem;border:solid 2px;border-color:#F72585}\n\t\t\t</style>\n\t\t\t<div id=\"cRect1\" class=\"rects\"></div>\n\t\t\t<div id=\"cRect2\" class=\"rects\"></div>\n\t\t\t<div id=\"cRect3\" class=\"rects\"></div>\n\t\t\t<div id=\"cRect4\" class=\"rects absolute\"></div>\n\t\t\t<div id=\"cRect5\" class=\"rects\"></div>\n\t\t\t<div id=\"cRect6\" class=\"rects\"></div>\n\t\t\t<div id=\"cRect7\" class=\"rects absolute\"></div>\n\t\t\t<div id=\"cRect8\" class=\"rects absolute\"></div>\n\t\t\t<div id=\"cRect9\" class=\"rects absolute\"></div>\n\t\t\t<div id=\"cRect10\" class=\"rects absolute\"></div>\n\t\t</div>\n\t</fingerprint>\n\t"]);

  _templateObject3 = function _templateObject3() {
    return data;
  };

  return data;
}

function _templateObject2() {
  var data = _taggedTemplateLiteral(["Z"]);

  _templateObject2 = function _templateObject2() {
    return data;
  };

  return data;
}

function _templateObject() {
  var data = _taggedTemplateLiteral([""]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}

function _taggedTemplateLiteral(strings, raw) { if (!raw) { raw = strings.slice(0); } return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

(function () {
  // Log performance time
  var timer = function timer(logStart) {
    console.log(logStart);
    var start = Date.now();
    return function (logEnd) {
      var end = Date.now() - start;
      console.log("".concat(logEnd, ": ").concat(end / 1000, " seconds"));
    };
  }; // Handle Errors


  var errorsCaptured = [];

  var captureError = function captureError(error) {
    var type = {
      Error: true,
      EvalError: true,
      InternalError: true,
      RangeError: true,
      ReferenceError: true,
      SyntaxError: true,
      TypeError: true,
      URIError: true
    };

    var hasInnerSpace = function hasInnerSpace(s) {
      return /.+(\s).+/g.test(s);
    }; // ignore AOPR noise


    console.error(error); // log error to educate

    var name = error.name,
        message = error.message;
    var trustedMessage = hasInnerSpace(message) ? message : undefined;
    var trustedName = type[name] ? name : undefined;
    var lineNumber = error.stack.split('\n')[2];
    var index = lineNumber.indexOf('at ');
    var lineAndIndex = lineNumber.slice(index + 2, lineNumber.length);
    errorsCaptured.push({
      trustedName: trustedName,
      trustedMessage: trustedMessage
    });
    return undefined;
  };

  var attempt = function attempt(fn) {
    try {
      return fn();
    } catch (error) {
      return captureError(error);
    }
  }; // https://stackoverflow.com/a/22429679


  var hashMini = function hashMini(str) {
    var json = "".concat(JSON.stringify(str));
    var i,
        len,
        hash = 0x811c9dc5;

    for (i = 0, len = json.length; i < len; i++) {
      hash = Math.imul(31, hash) + json.charCodeAt(i) | 0;
    }

    return ('0000000' + (hash >>> 0).toString(16)).substr(-8);
  }; // https://stackoverflow.com/a/53490958
  // https://stackoverflow.com/a/43383990
  // https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest


  var hashify = /*#__PURE__*/function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(x) {
      var json, jsonBuffer, hashBuffer, hashArray, hashHex;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              json = "".concat(JSON.stringify(x));
              jsonBuffer = new TextEncoder().encode(json);
              _context.next = 4;
              return crypto.subtle.digest('SHA-256', jsonBuffer);

            case 4:
              hashBuffer = _context.sent;
              hashArray = Array.from(new Uint8Array(hashBuffer));
              hashHex = hashArray.map(function (b) {
                return ('00' + b.toString(16)).slice(-2);
              }).join('');
              return _context.abrupt("return", hashHex);

            case 8:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }));

    return function hashify(_x) {
      return _ref.apply(this, arguments);
    };
  }(); // ie11 fix for template.content


  function templateContent(template) {
    // template {display: none !important} /* add css if template is in dom */
    if ('content' in document.createElement('template')) {
      return document.importNode(template.content, true);
    } else {
      var frag = document.createDocumentFragment();
      var children = template.childNodes;

      for (var i = 0, len = children.length; i < len; i++) {
        frag.appendChild(children[i].cloneNode(true));
      }

      return frag;
    }
  } // tagged template literal (JSX alternative)


  var patch = /*#__PURE__*/function () {
    var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(oldEl, newEl) {
      var fn,
          _args2 = arguments;
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              fn = _args2.length > 2 && _args2[2] !== undefined ? _args2[2] : null;
              oldEl.parentNode.replaceChild(newEl, oldEl);

              if (!(typeof fn === 'function')) {
                _context2.next = 8;
                break;
              }

              _context2.next = 5;
              return fn();

            case 5:
              _context2.t0 = _context2.sent;
              _context2.next = 9;
              break;

            case 8:
              _context2.t0 = true;

            case 9:
              return _context2.abrupt("return", _context2.t0);

            case 10:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2);
    }));

    return function patch(_x2, _x3) {
      return _ref2.apply(this, arguments);
    };
  }();

  var html = function html(stringSet) {
    for (var _len = arguments.length, expressionSet = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      expressionSet[_key - 1] = arguments[_key];
    }

    var template = document.createElement('template');
    template.innerHTML = stringSet.map(function (str, i) {
      return "".concat(str).concat(expressionSet[i] || '');
    }).join('');
    return templateContent(template); // ie11 fix for template.content
  }; // Detect proxy behavior


  var proxyBehavior = function proxyBehavior(obj) {
    try {
      window.postMessage(obj, location);
      return false;
    } catch (error) {
      var cloneable = error.code != 25; // data clone error	

      return !cloneable;
    }
  }; // detect and fingerprint Function API lies


  var _native = function _native(result, str) {
    var chrome = "function ".concat(str, "() { [native code] }");
    var firefox = "function ".concat(str, "() {\n    [native code]\n}");
    return result == chrome || result == firefox;
  };

  var hasLiedStringAPI = function hasLiedStringAPI() {
    var lieTypes = []; // detect attempts to rewrite Function.prototype.toString conversion APIs

    var toString = Function.prototype.toString;

    if (!_native(toString, 'toString')) {
      lieTypes.push({
        toString: toString
      });
    } // The idea of checking new is inspired by https://adtechmadness.wordpress.com/2019/03/23/javascript-tampering-detection-and-stealth/


    try {
      var str_1 = new Function.prototype.toString();
      var str_2 = new Function.prototype.toString();
      var str_3 = new Function.prototype.toString.toString();
      var str_4 = new Function.prototype.toString.toString();
      lieTypes.push({
        str_1: str_1,
        str_2: str_2,
        str_3: str_3,
        str_4: str_4
      });
    } catch (error) {
      var nativeTypeError = 'TypeError: Function.prototype.toString is not a constructor';

      if ('' + error != nativeTypeError) {
        lieTypes.push({
          newErr: '' + error.message
        });
      }
    }

    return function () {
      return lieTypes;
    };
  };

  var stringAPILieTypes = hasLiedStringAPI(); // compute and cache result

  var hasLiedAPI = function hasLiedAPI(api, name) {
    var lieTypes = _toConsumableArray(stringAPILieTypes());

    var fingerprint = ''; // detect attempts to rename the API and/or rewrite toString

    var fnToStr = Function.prototype.toString;
    var apiName = api.name,
        apiToString = api.toString;

    if (apiName != name) {
      lieTypes.push({
        apiName: !proxyBehavior(apiName) ? apiName : true
      });
    }

    if (apiToString !== fnToStr || apiToString.toString !== fnToStr) {
      lieTypes.push({
        apiToString: !proxyBehavior(apiToString) ? apiToString : true
      });
    } // collect string conversion result


    var result = '' + api; // fingerprint result if it does not match native code

    if (!_native(result, name)) {
      fingerprint = result;
    }

    return {
      lie: lieTypes.length || fingerprint ? {
        lieTypes: lieTypes,
        fingerprint: fingerprint
      } : false
    };
  }; // Detect Brave Browser and strict fingerprinting blocking


  var brave = function brave() {
    return 'brave' in navigator ? true : false;
  };

  var isBrave = brave(); // compute and cache result
  // Collect trash values

  var trashBin = [];

  var sendToTrash = function sendToTrash(name, val) {
    var proxyLike = proxyBehavior(val);
    var value = !proxyLike ? val : 'proxy behavior detected';
    trashBin.push({
      name: name,
      value: value
    });
    return undefined;
  }; // Collect lies detected


  var lieRecords = [];

  var compress = function compress(x) {
    return JSON.stringify(x).replace(/((\n|\r|\s|:|\"|\,|\{|\}|\[|\]|\(|\))+)/gm, '').toLowerCase();
  };

  var documentLie = function documentLie(name, lieResult, lieTypes) {
    return lieRecords.push({
      name: name,
      lieTypes: lieTypes,
      hash: lieResult,
      lie: hashMini(lieTypes)
    });
  }; // validate


  var isInt = function isInt(x) {
    return typeof x == 'number' && x % 1 == 0;
  };

  var trustInteger = function trustInteger(name, val) {
    var trusted = isInt(val);
    return trusted ? val : sendToTrash(name, val);
  }; // navigator


  var nav = function nav() {
    var credibleUserAgent = 'chrome' in window ? navigator.userAgent.includes(navigator.appVersion) : true // todo: additional checks
    ;
    return {
      appVersion: attempt(function () {
        var _navigator = navigator,
            appVersion = _navigator.appVersion;
        return credibleUserAgent ? appVersion : sendToTrash('appVersion', 'does not match userAgent');
      }),
      deviceMemory: attempt(function () {
        var _navigator2 = navigator,
            deviceMemory = _navigator2.deviceMemory;
        return deviceMemory ? trustInteger('deviceMemory', deviceMemory) : undefined;
      }),
      doNotTrack: attempt(function () {
        var _navigator3 = navigator,
            doNotTrack = _navigator3.doNotTrack;
        var trusted = {
          '1': true,
          'true': true,
          'yes': true,
          '0': true,
          'false': true,
          'no': true,
          'unspecified': true,
          'null': true
        };
        return trusted[doNotTrack] ? doNotTrack : doNotTrack ? sendToTrash('doNotTrack', doNotTrack) : undefined;
      }),
      hardwareConcurrency: attempt(function () {
        var _navigator4 = navigator,
            hardwareConcurrency = _navigator4.hardwareConcurrency;
        return trustInteger('hardwareConcurrency', hardwareConcurrency);
      }),
      language: attempt(function () {
        var _navigator5 = navigator,
            languages = _navigator5.languages,
            language = _navigator5.language;
        var langs = /^.{0,2}/g.exec(languages[0])[0];
        var lang = /^.{0,2}/g.exec(language)[0];
        var trusted = langs == lang;
        return trusted ? "".concat(languages.join(', '), " (").concat(language, ")") : sendToTrash('languages', [languages, language].join(' '));
      }),
      maxTouchPoints: attempt(function () {
        if ('maxTouchPoints' in navigator) {
          var _navigator6 = navigator,
              maxTouchPoints = _navigator6.maxTouchPoints;
          return trustInteger('maxTouchPoints', maxTouchPoints);
        }

        return null;
      }),
      platform: attempt(function () {
        var _navigator7 = navigator,
            platform = _navigator7.platform;
        var systems = ['win', 'linux', 'mac', 'arm', 'pike', 'linux', 'iphone', 'ipad', 'ipod', 'android', 'x11'];
        var trusted = systems.filter(function (val) {
          return platform.toLowerCase().includes(val);
        })[0];
        return trusted ? platform : undefined;
      }),
      userAgent: attempt(function () {
        var _navigator8 = navigator,
            userAgent = _navigator8.userAgent;
        return credibleUserAgent ? userAgent : sendToTrash('userAgent', userAgent);
      }),
      vendor: attempt(function () {
        return navigator.vendor;
      }),
      mimeTypes: attempt(function () {
        return _toConsumableArray(navigator.mimeTypes).map(function (m) {
          return m.type;
        });
      }),
      plugins: attempt(function () {
        return _toConsumableArray(navigator.plugins).map(function (p) {
          return {
            name: p.name,
            description: p.description,
            filename: p.filename,
            version: p.version
          };
        });
      }),
      version: attempt(function () {
        var keys = Object.keys(Object.getPrototypeOf(navigator));
        return keys;
      })
    };
  }; // client hints


  var highEntropyValues = function highEntropyValues() {
    var undfnd = new Promise(function (resolve) {
      return resolve(undefined);
    });

    try {
      if (!('userAgentData' in navigator)) {
        return undfnd;
      }

      return !('userAgentData' in navigator) ? undfnd : attempt(function () {
        return navigator.userAgentData.getHighEntropyValues(['platform', 'platformVersion', 'architecture', 'model', 'uaFullVersion']);
      });
    } catch (error) {
      captureError(error);
      return new Promise(function (resolve) {
        return resolve(undefined);
      });
    }
  }; // screen (allow some discrepancies otherwise lie detection triggers at random)


  var screenFp = function screenFp() {
    var _screen = screen,
        width = _screen.width,
        height = _screen.height,
        availWidth = _screen.availWidth,
        availHeight = _screen.availHeight,
        colorDepth = _screen.colorDepth,
        pixelDepth = _screen.pixelDepth;
    return {
      width: attempt(function () {
        return trustInteger('width', width);
      }),
      outerWidth: attempt(function () {
        return trustInteger('outerWidth', outerWidth);
      }),
      availWidth: attempt(function () {
        return trustInteger('availWidth', availWidth);
      }),
      height: attempt(function () {
        return trustInteger('height', height);
      }),
      outerHeight: attempt(function () {
        return trustInteger('outerHeight', outerHeight);
      }),
      availHeight: attempt(function () {
        return trustInteger('availHeight', availHeight);
      }),
      colorDepth: attempt(function () {
        return trustInteger('colorDepth', colorDepth);
      }),
      pixelDepth: attempt(function () {
        return trustInteger('pixelDepth', pixelDepth);
      })
    };
  }; // voices


  var getVoices = function getVoices() {
    var undfn = new Promise(function (resolve) {
      return resolve(undefined);
    });

    try {
      if (!('chrome' in window)) {
        return speechSynthesis.getVoices();
      }

      var promise = new Promise(function (resolve) {
        try {
          if (typeof speechSynthesis === 'undefined') {
            return resolve(undefined);
          } else if (!speechSynthesis.getVoices || speechSynthesis.getVoices() == undefined) {
            return resolve(undefined);
          } else if (speechSynthesis.getVoices().length) {
            var voices = speechSynthesis.getVoices();
            return resolve(voices);
          } else {
            speechSynthesis.onvoiceschanged = function () {
              return resolve(speechSynthesis.getVoices());
            };
          }
        } catch (error) {
          captureError(error);
          return resolve(undefined);
        }
      });
      return promise;
    } catch (error) {
      captureError(error);
      return undfn;
    }
  }; // media devices


  var getMediaDevices = function getMediaDevices() {
    var undfn = new Promise(function (resolve) {
      return resolve(undefined);
    });

    if (!('mediaDevices' in navigator)) {
      return undfn;
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        return undfn;
      }

      return attempt(function () {
        return navigator.mediaDevices.enumerateDevices();
      });
    } catch (error) {
      captureError(error);
      return undfn;
    }
  }; // canvas


  var canvasToDataURL = attempt(function () {
    return HTMLCanvasElement.prototype.toDataURL;
  });
  var canvasGetContext = attempt(function () {
    return HTMLCanvasElement.prototype.getContext;
  });
  var dataLie = canvasToDataURL ? hasLiedAPI(canvasToDataURL, 'toDataURL').lie : false;
  var contextLie = canvasGetContext ? hasLiedAPI(canvasGetContext, 'getContext').lie : false;

  var canvas = function canvas() {
    var canvas = document.createElement('canvas');
    var canvas2dDataURI = '';

    if (!dataLie && !contextLie) {
      var context = canvas.getContext('2d');
      var str = '%$%^LGFWE($HIF)';
      context.font = '20px Arial';
      context.fillText(str, 100, 100);
      context.fillStyle = 'red';
      context.fillRect(100, 30, 80, 50);
      context.font = '32px Times New Roman';
      context.fillStyle = 'blue';
      context.fillText(str, 20, 70);
      context.font = '20px Arial';
      context.fillStyle = 'green';
      context.fillText(str, 10, 50);
      canvas2dDataURI = canvas.toDataURL();
      return isBrave ? sendToTrash('canvas2dDataURI', hashMini(canvas2dDataURI)) : canvas2dDataURI;
    } // document lie and send to trash


    canvas2dDataURI = canvas.toDataURL();
    var canvas2dContextDataURI = canvas2dDataURI;

    if (contextLie) {
      var contextHash = hashMini(canvas2dContextDataURI);
      documentLie('canvas2dContextDataURI', contextHash, contextLie);
      sendToTrash('canvas2dContextDataURI', contextHash);
    }

    if (dataLie) {
      var dataHash = hashMini(canvas2dDataURI);
      documentLie('canvas2dDataURI', dataHash, dataLie);
      sendToTrash('canvas2dDataURI', dataHash);
    } // fingerprint lie


    return {
      dataLie: dataLie,
      contextLie: contextLie
    };
  }; // webgl


  var webgl = function webgl() {
    var webglGetParameter = attempt(function () {
      return WebGLRenderingContext.prototype.getParameter;
    });
    var webglGetExtension = attempt(function () {
      return WebGLRenderingContext.prototype.getExtension;
    });
    var paramLie = webglGetParameter ? hasLiedAPI(webglGetParameter, 'getParameter').lie : false;
    var extLie = webglGetExtension ? hasLiedAPI(webglGetExtension, 'getExtension').lie : false;
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('webgl');
    return {
      unmasked: function () {
        try {
          var extension = context.getExtension('WEBGL_debug_renderer_info');
          var vendor = extension && context.getParameter(extension.UNMASKED_VENDOR_WEBGL);
          var renderer = extension && context.getParameter(extension.UNMASKED_RENDERER_WEBGL);

          if (!paramLie && !extLie) {
            return {
              vendor: isBrave ? sendToTrash('webglVendor', vendor) : !proxyBehavior(vendor) ? vendor : sendToTrash('webglVendor', 'proxy behavior detected'),
              renderer: isBrave ? sendToTrash('webglRenderer', renderer) : !proxyBehavior(renderer) ? renderer : sendToTrash('webglRenderer', 'proxy behavior detected')
            };
          } // document lie and send to trash


          var webglVendorAndRendererParameter = "".concat(vendor, ", ").concat(renderer);
          var webglVendorAndRendererExtension = webglVendorAndRendererParameter;

          if (paramLie) {
            documentLie('webglVendorAndRendererParameter', webglVendorAndRendererParameter, paramLie);
            sendToTrash('webglVendorAndRendererParameter', webglVendorAndRendererParameter);
          }

          if (extLie) {
            documentLie('webglVendorAndRendererExtension', webglVendorAndRendererExtension, extLie);
            sendToTrash('webglVendorAndRendererExtension', webglVendorAndRendererExtension);
          } // Fingerprint lie


          return {
            vendor: {
              paramLie: paramLie,
              extLie: extLie
            },
            renderer: {
              paramLie: paramLie,
              extLie: extLie
            }
          };
        } catch (error) {
          captureError(error);
          return {
            vendor: isBrave ? sendToTrash('webglVendor', null) : undefined,
            renderer: isBrave ? sendToTrash('webglRenderer', null) : undefined
          };
        }
      }(),
      dataURL: function () {
        try {
          var canvasWebglDataURI = '';

          if (!dataLie && !contextLie) {
            context.clearColor(0.2, 0.4, 0.6, 0.8);
            context.clear(context.COLOR_BUFFER_BIT);
            canvasWebglDataURI = canvas.toDataURL();
            return isBrave ? sendToTrash('canvasWebglDataURI', hashMini(canvasWebglDataURI)) : canvasWebglDataURI;
          } // document lie and send to trash


          canvasWebglDataURI = canvas.toDataURL();
          var canvasWebglContextDataURI = canvasWebglDataURI;

          if (contextLie) {
            var contextHash = hashMini(canvasWebglContextDataURI);
            documentLie('canvasWebglContextDataURI', contextHash, contextLie);
            sendToTrash('canvasWebglContextDataURI', contextHash);
          }

          if (dataLie) {
            var dataHash = hashMini(canvasWebglDataURI);
            documentLie('canvasWebglDataURI', dataHash, dataLie);
            sendToTrash('canvasWebglDataURI', dataHash);
          } // fingerprint lie


          return {
            dataLie: dataLie,
            contextLie: contextLie
          };
        } catch (error) {
          return captureError(error);
        }
      }()
    };
  }; // maths


  var maths = function maths() {
    var n = 0.123124234234234242;
    var fns = [['acos', [n]], ['acosh', [1e308]], ['asin', [n]], ['asinh', [1e300]], ['asinh', [1]], ['atan', [2]], ['atanh', [0.5]], ['atan2', [90, 15]], ['atan2', [1e-310, 2]], ['cbrt', [100]], ['cosh', [100]], ['expm1', [1]], ['sin', [1]], ['sinh', [1]], ['tan', [-1e308]], ['tanh', [1e300]], ['cosh', [1]], ['sin', [Math.PI]], ['pow', [Math.PI, -100]]];
    return fns.map(function (fn) {
      return _defineProperty({}, fn[0], attempt(function () {
        return Math[fn[0]].apply(Math, _toConsumableArray(fn[1]));
      }));
    });
  }; // browser console errors


  var consoleErrs = function consoleErrs() {
    var getErrors = function getErrors(errs, errFns) {
      var i,
          len = errFns.length;

      for (i = 0; i < len; i++) {
        try {
          errFns[i]();
        } catch (err) {
          errs.push(err.message);
        }
      }

      return errs;
    };

    var errFns = [function () {
      return eval('alert(")');
    }, function () {
      return eval('const foo;foo.bar');
    }, function () {
      return eval('null.bar');
    }, function () {
      return eval('abc.xyz = 123');
    }, function () {
      return eval('const foo;foo.bar');
    }, function () {
      return eval('(1).toString(1000)');
    }, function () {
      return eval('[...undefined].length');
    }, function () {
      return eval('var x = new Array(-1)');
    }, function () {
      return eval('const a=1; const a=2;');
    }];
    return getErrors([], errFns);
  }; // timezone


  var timezone = function timezone() {
    var computeTimezoneOffset = function computeTimezoneOffset() {
      var toJSONParsed = function toJSONParsed(x) {
        return JSON.parse(JSON.stringify(x));
      };

      var utc = Date.parse(toJSONParsed(new Date()).split(_templateObject2()).join(_templateObject()));
      var now = +new Date();
      return +((utc - now) / 60000).toFixed(2);
    };

    var dateGetTimezoneOffset = attempt(function () {
      return Date.prototype.getTimezoneOffset;
    });
    var timezoneLie = dateGetTimezoneOffset ? hasLiedAPI(dateGetTimezoneOffset, 'getTimezoneOffset').lie : false;
    var timezoneOffset = new Date().getTimezoneOffset();
    var trusted = true;

    if (!timezoneLie) {
      var timezoneOffsetComputed = computeTimezoneOffset();
      trusted = timezoneOffsetComputed == timezoneOffset;
      var notWithinParentheses = /.*\(|\).*/g;
      var timezoneLocation = Intl.DateTimeFormat().resolvedOptions().timeZone;

      var _timezone = ('' + new Date()).replace(notWithinParentheses, '');

      return trusted ? {
        timezoneOffsetComputed: timezoneOffsetComputed,
        timezoneOffset: timezoneOffset,
        timezoneLocation: timezoneLocation,
        timezone: _timezone
      } : undefined;
    } // document lie and send to trash


    if (timezoneLie) {
      documentLie('timezoneOffset', timezoneOffset, timezoneLie);
    }

    if (timezoneLie || !trusted) {
      sendToTrash('timezoneOffset', timezoneOffset);
    } // Fingerprint lie


    return {
      timezoneLie: timezoneLie
    };
  }; // client rects


  var cRects = function cRects() {
    var toJSONParsed = function toJSONParsed(x) {
      return JSON.parse(JSON.stringify(x));
    };

    var rectContainer = document.getElementById('rect-container');

    var removeRectsFromDom = function removeRectsFromDom() {
      return rectContainer.parentNode.removeChild(rectContainer);
    };

    var elementGetClientRects = attempt(function () {
      return Element.prototype.getClientRects;
    });
    var rectsLie = elementGetClientRects ? hasLiedAPI(elementGetClientRects, 'getClientRects').lie : false;
    var cRectProps = ['x', 'y', 'width', 'height', 'top', 'right', 'bottom', 'left'];
    var rectElems = document.getElementsByClassName('rects');

    var clientRects = _toConsumableArray(rectElems).map(function (el) {
      return toJSONParsed(el.getClientRects()[0]);
    });

    if (!rectsLie) {
      removeRectsFromDom();
      return clientRects;
    } // document lie and send to trash


    if (rectsLie) {
      documentLie('clientRects', hashMini(clientRects), rectsLie);
      sendToTrash('clientRects', hashMini(clientRects));
    } // Fingerprint lie


    removeRectsFromDom();
    return {
      rectsLie: rectsLie
    };
  }; // scene


  var scene = html(_templateObject3()); // fingerprint

  var fingerprint = /*#__PURE__*/function () {
    var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
      var navComputed, mimeTypes, plugins, navVersion, screenComputed, canvasComputed, gl, webglComputed, webglDataURLComputed, consoleErrorsComputed, timezoneComputed, cRectsComputed, mathsComputed, _yield$Promise$all$ca, _yield$Promise$all$ca2, voices, mediaDevices, highEntropy, voicesComputed, mediaDevicesComputed, trashComputed, liesComputed, hashTimer, _yield$Promise$all$ca3, _yield$Promise$all$ca4, navHash, mimeTypesHash, pluginsHash, navVersionHash, voicesHash, mediaDeviceHash, highEntropyHash, timezoneHash, webglHash, screenHash, weglDataURLHash, consoleErrorsHash, cRectsHash, mathsHash, canvasHash, errorsCapturedHash, trashHash, liesHash, fingerprint;

      return regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              // attempt to compute values
              navComputed = attempt(function () {
                return nav();
              });
              mimeTypes = navComputed ? navComputed.mimeTypes : undefined;
              plugins = navComputed ? navComputed.plugins : undefined;
              navVersion = navComputed ? navComputed.version : undefined;
              screenComputed = attempt(function () {
                return screenFp();
              });
              canvasComputed = attempt(function () {
                return canvas();
              });
              gl = attempt(function () {
                return webgl();
              });
              webglComputed = {
                vendor: attempt(function () {
                  return gl.unmasked.vendor;
                }),
                renderer: attempt(function () {
                  return gl.unmasked.renderer;
                })
              };
              webglDataURLComputed = attempt(function () {
                return gl.dataURL;
              });
              consoleErrorsComputed = attempt(function () {
                return consoleErrs();
              });
              timezoneComputed = attempt(function () {
                return timezone();
              });
              cRectsComputed = attempt(function () {
                return cRects();
              });
              mathsComputed = attempt(function () {
                return maths();
              }); // await voices, media, and client hints, then compute

              _context3.next = 15;
              return Promise.all([getVoices(), getMediaDevices(), highEntropyValues()])["catch"](function (error) {
                console.error(error.message);
              });

            case 15:
              _yield$Promise$all$ca = _context3.sent;
              _yield$Promise$all$ca2 = _slicedToArray(_yield$Promise$all$ca, 3);
              voices = _yield$Promise$all$ca2[0];
              mediaDevices = _yield$Promise$all$ca2[1];
              highEntropy = _yield$Promise$all$ca2[2];
              voicesComputed = !voices ? undefined : voices.map(function (_ref5) {
                var name = _ref5.name,
                    lang = _ref5.lang;
                return {
                  name: name,
                  lang: lang
                };
              });
              mediaDevicesComputed = !mediaDevices ? undefined : mediaDevices.map(function (_ref6) {
                var kind = _ref6.kind;
                return {
                  kind: kind
                };
              }); // chrome randomizes groupId
              // Compile property names sent to the trashBin (exclude trash values)

              trashComputed = trashBin.map(function (trash) {
                return trash.name;
              }); // Compile name and lie type values from lie records (exclude random lie results)

              liesComputed = lieRecords.map(function (lie) {
                var name = lie.name,
                    lieTypes = lie.lieTypes;
                return {
                  name: name,
                  lieTypes: lieTypes
                };
              }); // await hash values

              hashTimer = timer('hashing values...');
              _context3.next = 27;
              return Promise.all([hashify(navComputed), hashify(mimeTypes), hashify(plugins), hashify(navVersion), hashify(voicesComputed), hashify(mediaDevicesComputed), hashify(highEntropy), hashify(timezoneComputed), hashify(webglComputed), hashify(screenComputed), hashify(webglDataURLComputed), hashify(consoleErrorsComputed), hashify(cRectsComputed), hashify(mathsComputed), hashify(canvasComputed), hashify(errorsCaptured), hashify(trashComputed), hashify(liesComputed)])["catch"](function (error) {
                console.error(error.message);
              });

            case 27:
              _yield$Promise$all$ca3 = _context3.sent;
              _yield$Promise$all$ca4 = _slicedToArray(_yield$Promise$all$ca3, 18);
              navHash = _yield$Promise$all$ca4[0];
              // order must match
              mimeTypesHash = _yield$Promise$all$ca4[1];
              pluginsHash = _yield$Promise$all$ca4[2];
              navVersionHash = _yield$Promise$all$ca4[3];
              voicesHash = _yield$Promise$all$ca4[4];
              mediaDeviceHash = _yield$Promise$all$ca4[5];
              highEntropyHash = _yield$Promise$all$ca4[6];
              timezoneHash = _yield$Promise$all$ca4[7];
              webglHash = _yield$Promise$all$ca4[8];
              screenHash = _yield$Promise$all$ca4[9];
              weglDataURLHash = _yield$Promise$all$ca4[10];
              consoleErrorsHash = _yield$Promise$all$ca4[11];
              cRectsHash = _yield$Promise$all$ca4[12];
              mathsHash = _yield$Promise$all$ca4[13];
              canvasHash = _yield$Promise$all$ca4[14];
              errorsCapturedHash = _yield$Promise$all$ca4[15];
              trashHash = _yield$Promise$all$ca4[16];
              liesHash = _yield$Promise$all$ca4[17];
              hashTimer('Hashing complete');
              navComputed.mimeTypesHash = mimeTypesHash;
              navComputed.versionHash = navVersionHash;
              navComputed.pluginsHash = pluginsHash;
              fingerprint = {
                nav: [navComputed, navHash],
                highEntropy: [highEntropy, highEntropyHash],
                timezone: [timezoneComputed, timezoneHash],
                webgl: [webglComputed, webglHash],
                voices: [voicesComputed, voicesHash],
                mediaDevices: [mediaDevicesComputed, mediaDeviceHash],
                screen: [screenComputed, screenHash],
                webglDataURL: [webglDataURLComputed, weglDataURLHash],
                consoleErrors: [consoleErrorsComputed, consoleErrorsHash],
                cRects: [cRectsComputed, cRectsHash],
                maths: [mathsComputed, mathsHash],
                canvas: [canvasComputed, canvasHash],
                errorsCaptured: [errorsCaptured, errorsCapturedHash],
                trash: [trashComputed, trashHash],
                lies: [liesComputed, liesHash]
              };
              return _context3.abrupt("return", fingerprint);

            case 53:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3);
    }));

    return function fingerprint() {
      return _ref4.apply(this, arguments);
    };
  }(); // get/post request


  var webapp = 'https://script.google.com/macros/s/AKfycbzKRjt6FPboOEkh1vTXttGyCjp97YBP7z-5bODQmtSkQ9BqDRY/exec';

  function postData(_x4) {
    return _postData.apply(this, arguments);
  } // patch


  function _postData() {
    _postData = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(formData) {
      var response;
      return regeneratorRuntime.wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              _context5.next = 2;
              return fetch(webapp, {
                method: 'POST',
                body: formData
              });

            case 2:
              response = _context5.sent;
              return _context5.abrupt("return", response.json());

            case 4:
            case "end":
              return _context5.stop();
          }
        }
      }, _callee5);
    }));
    return _postData.apply(this, arguments);
  }

  var app = document.getElementById('fp-app');
  patch(app, scene, /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
    var fpElem, fp, creep, log, _yield$Promise$all$ca5, _yield$Promise$all$ca6, fpHash, creepHash, visitorElem, fetchVisitoDataTimer, note, identify, pluralify, data;

    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            // fingerprint and render
            fpElem = document.getElementById('fingerprint');
            _context4.next = 3;
            return fingerprint()["catch"](function (e) {
              return console.log(e);
            });

          case 3:
            fp = _context4.sent;
            // Purified Fingerprint
            creep = {
              //timezone: fp.timezone, // subject to randomization
              voices: fp.voices,
              navVersion: fp.nav[0].navVersion,
              renderer: fp.webgl[0].renderer,
              vendor: fp.webgl[0].vendor,
              webglDataURL: fp.webglDataURL,
              consoleErrors: fp.consoleErrors,
              trash: fp.trash,
              lies: fp.lies,
              //errorsCaptured: fp.errorsCaptured,
              cRects: fp.cRects,
              maths: fp.maths,
              canvas: fp.canvas
            };

            log = function log(message, obj) {
              return console.log(message, JSON.stringify(obj, null, '\t'));
            };

            console.log('Pure Fingerprint (Object):', creep);
            console.log('Fingerprint Id (Object):', fp);
            log('Fingerprint Id (JSON):', fp);
            _context4.next = 11;
            return Promise.all([hashify(fp), hashify(creep)])["catch"](function (error) {
              console.error(error.message);
            });

          case 11:
            _yield$Promise$all$ca5 = _context4.sent;
            _yield$Promise$all$ca6 = _slicedToArray(_yield$Promise$all$ca5, 2);
            fpHash = _yield$Promise$all$ca6[0];
            creepHash = _yield$Promise$all$ca6[1];
            // fetch data from server
            visitorElem = document.getElementById('visitor');
            fetchVisitoDataTimer = timer('Fetching visitor data...');
            fetch("".concat(webapp, "?id=").concat(creepHash, "&subId=").concat(fpHash)).then(function (response) {
              return response.json();
            }).then(function (data) {
              var firstVisit = data.firstVisit,
                  latestVisit = data.latestVisit,
                  subIds = data.subIds,
                  visits = data.visits;
              var subIdsLen = Object.keys(subIds).length;

              var toLocaleStr = function toLocaleStr(str) {
                return new Date(str).toLocaleString();
              };

              var pluralify = function pluralify(len) {
                return len > 1 ? 's' : '';
              };

              var plural = pluralify(subIdsLen);
              var template = "\n\t\t\t\t\t<div>First Visit: ".concat(toLocaleStr(firstVisit), " (x days ago)</div>\n\t\t\t\t\t<div>Latest Visit: ").concat(toLocaleStr(latestVisit), "</div>\n\t\t\t\t\t").concat(subIdsLen ? "<div>".concat(subIdsLen, " sub fingerprint").concat(plural, " detected</div>") : '', "\n\t\t\t\t\t<div>Visits: ").concat(visits, "</div>\n\t\t\t\t");
              fetchVisitoDataTimer('Visitor data received');
              return patch(visitorElem, html(_templateObject4(), template));
            })["catch"](function (err) {
              fetchVisitoDataTimer('Error fetching visitor data');
              patch(visitorElem, html(_templateObject5()));
              return console.error('Error!', err.message);
            }); // symbol notes

            note = {
              blocked: '<span class="blocked">blocked</span>'
            }; // identify known hash

            identify = function identify(prop) {
              var torBrowser =
              /* geo.enabled can be set to true or false:
              Geolocation is in window of Firefox
              Geolocation is not in the window of Tor Browser
              */
              !('Geolocation' in window);
              var catchTorBrowser = torBrowser ? 'Tor Browser' : 'Firefox';
              var catchTorBrowserResist = torBrowser ? 'Tor Browser (pending permission or blocked temporarily)' : 'Firefox (privacy.resistFingerprinting)';
              var catchTorBrowserAllow = torBrowser ? 'Tor Browser' : 'Firefox (privacy.resistFingerprinting)';
              var known = {
                '0df25df426d0ce052d04482c0c2cd4d874ae7a4da4feb430be36150a770f3b6b': 'Browser Plugs',
                '65069db4579c03d49fde85983c905817c8798cad3ad6b39dd93df24bde1449c9': 'Browser Plugs',
                '3ac278638742f3475dcd69559fd1d12e01eefefffe3df66f9129d35635fc3311': 'Browser Plugs',
                'e9f96e6b7f0b93f9d7677f0e270c97d6fa12cbbe3134ab5f906d152f57953e72': 'Browser Plugs',
                '0c3156fbce7624886a6a5485d3fabfb8038f9b656de01100392b2cebf354106d': 'Browser Plugs',
                '235354122e45f69510264fc45ebd5a161eb15ada33702d85ee96a23b28ba2295': 'CyDec',
                '94e40669f496f2cef69cc289f3ee50dc442ced21fb42a88bc223270630002556': 'Canvas Fingerprint Defender',
                'ea43a000cd99bbe3fcd6861a2a5b9da1cba4c75c5ed7756f19562a8b5e034018': 'Privacy Possom',
                '1a2e56badfca47209ba445811f27e848b4c2dae58224445a4af3d3581ffe7561': 'Privacy Possom',
                'e5c60fb55b35e96ec8482d4cfccb2e3b8245ef2a148c96a473ee7e526a2f21c5': 'Privacy Badger or similar',
                'bdcb3de585b3a521cff31e571d854a0bb76c23da7a0105c4806aba01a086f238': 'ScriptSafe',
                '45f81b1215784751b96b83e2f41cd58dfa5242ba8bc59a4caf6ada3cf7b2391d': 'ScriptSafe',
                '785acfe6b266709e167dcc85fdd5697798cfdb1dcb9bed4eab42f422117ebaab': 'Trace',
                'c53d59bceea14b20c5b2a0680457314fc04f71c240604ced26ff37f42242ff0e': 'Trace',
                '96fc9e8167ed27c6f45442df78619601955728422a111e02c08cd5af94378d34': 'Trace',
                '7757f7416b78fb8ac1f079b3e0677c0fe179826a63727d809e7d69795e915cd5': 'Chromium',
                '21f2f6f397db5fa611029154c35cd96eb9a96c4f1c993d4c3a25da765f2dd13b': catchTorBrowser,
                'e086050038b44b8dcb9d0565da3ff448a0162da7023469d347303479f981f5fd': catchTorBrowserAllow,
                '0a1a099e6b0a7365acfdf38ed79c9cde9ec0617b0c39b6366dad4d1a4aa6fcaf': catchTorBrowser,
                '99dfbc2000c9c81588259515fed8a1f6fbe17bf9964c850560d08d0bfabc1fff': catchTorBrowserResist
              };

              var _prop = _slicedToArray(prop, 2),
                  data = _prop[0],
                  hash = _prop[1];

              var iterable = (Symbol.iterator in Object(data));
              return !data || iterable && !data.length ? note.blocked : known[hash] ? "<span class=\"known\">".concat(known[hash], "</span>") : hash;
            };

            pluralify = function pluralify(len) {
              return len > 1 ? 's' : '';
            }; // template


            data = "\n\t\t\t<section>\n\t\t\t\t<div id=\"fingerprint-data\">\n\t\t\t\t\t<div>Purified Fingerprint Id: ".concat(creepHash, "</div>\n\t\t\t\t\t<div>Fingerprint Id: ").concat(fpHash, "</div>\n\n\t\t\t\t\t").concat(!trashBin.length ? '<div>trash: <span class="none">none</span></div>' : function () {
              var plural = pluralify(trashBin.length);
              var hash = fp.trash[1];
              return "\n\t\t\t\t\t\t\t<div class=\"trash\">\n\t\t\t\t\t\t\t\t<strong>".concat(trashBin.length, " API").concat(plural, " are counted as trash</strong>\n\t\t\t\t\t\t\t\t<div>hash: ").concat(hash, "</div>\n\t\t\t\t\t\t\t\t").concat(trashBin.map(function (item) {
                return "<div>".concat(item.name, ": ").concat(item.value, "</div>");
              }).join(''), "\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t");
            }(), "\n\n\t\t\t\t\t").concat(!lieRecords.length ? '<div>lies: <span class="none">none</span></div>' : function () {
              var plural = pluralify(lieRecords.length);
              var hash = fp.lies[1];
              return "\n\t\t\t\t\t\t\t<div class=\"lies\">\n\t\t\t\t\t\t\t\t<strong>".concat(lieRecords.length, " API lie").concat(plural, " detected</strong>\n\t\t\t\t\t\t\t\t<div>hash: ").concat(hash, "</div>\n\t\t\t\t\t\t\t\t").concat(lieRecords.map(function (item) {
                return "<div>".concat(item.name, " Lie Fingerprint: ").concat(item.lie, "</div>");
              }).join(''), "\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t");
            }(), "\n\n\t\t\t\t\t").concat(!fp.errorsCaptured[0].length ? "<div>errors captured: <span class=\"none\">none</span></div>" : function () {
              var _fp$errorsCaptured = _slicedToArray(fp.errorsCaptured, 2),
                  errors = _fp$errorsCaptured[0],
                  hash = _fp$errorsCaptured[1];

              var plural = pluralify(errors);
              return "\n\t\t\t\t\t\t\t<div class=\"errors\">\n\t\t\t\t\t\t\t\t<strong>".concat(errors.length, " error").concat(plural, " captured</strong>\n\t\t\t\t\t\t\t\t<div>hash: ").concat(hash, "</div>\n\t\t\t\t\t\t\t\t").concat(errors.map(function (err) {
                return "\n\t\t\t\t\t\t\t\t\t\t<div>\n\t\t\t\t\t\t\t\t\t\t\t".concat(err.trustedName, ": ").concat(err.trustedMessage, "\n\t\t\t\t\t\t\t\t\t\t</div>");
              }).join(''), "\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t");
            }(), "\n\n\t\t\t\t\t<div>canvas: ").concat(isBrave ? 'Brave Browser' : identify(fp.canvas), "</div>\n\t\t\t\t\t<div>\n\t\t\t\t\t<div>webglDataURL: ").concat(isBrave ? 'Brave Browser' : identify(fp.webglDataURL), "</div>\n\t\t\t\t\t\t<div>webgl renderer: ").concat(function () {
              var _fp$webgl = _slicedToArray(fp.webgl, 2),
                  data = _fp$webgl[0],
                  hash = _fp$webgl[1];

              var renderer = data.renderer;
              var isString = typeof renderer == 'string';
              return isBrave ? 'Brave Browser' : isString && renderer ? renderer : !renderer ? note.blocked : identify(fp.webgl);
            }(), "</div>\n\t\t\t\t\t\t<div>webgl vendor: ").concat(function () {
              var _fp$webgl2 = _slicedToArray(fp.webgl, 2),
                  data = _fp$webgl2[0],
                  hash = _fp$webgl2[1];

              var vendor = data.vendor;
              var isString = typeof vendor == 'string';
              return isBrave ? 'Brave Browser' : isString && vendor ? vendor : !vendor ? note.blocked : identify(fp.webgl);
            }(), "</div>\n\t\t\t\t\t</div>\n\t\t\t\t\t<div>client rects: ").concat(identify(fp.cRects), "</div>\n\t\t\t\t\t<div>console errors: ").concat(identify(fp.consoleErrors), "</div>\t\n\t\t\t\t\t<div>maths: ").concat(identify(fp.maths), "</div>\n\t\t\t\t\t<div>media devices: ").concat(identify(fp.mediaDevices), "</div>\n\t\t\t\t\t\n\t\t\t\t\t").concat(!fp.timezone[0] ? "<div>timezone: ".concat(note.blocked, "</div>") : function () {
              var _fp$timezone = _slicedToArray(fp.timezone, 2),
                  timezone = _fp$timezone[0],
                  hash = _fp$timezone[1];

              return "\n\t\t\t\t\t\t\t<div>\n\t\t\t\t\t\t\t\t<div>timezone hash: ".concat(identify(fp.timezone), "</div>\n\t\t\t\t\t\t\t\t").concat(Object.keys(timezone).map(function (key) {
                var value = timezone[key];
                return "<div>".concat(key, ": ").concat(value != undefined ? value : note.blocked, "</div>");
              }).join(''), "\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t");
            }(), "\n\t\t\t\t\t").concat(!fp.voices[0] ? "<div>voices: ".concat(note.blocked, "</div>") : function () {
              var _fp$voices = _slicedToArray(fp.voices, 2),
                  voices = _fp$voices[0],
                  hash = _fp$voices[1];

              return "\n\t\t\t\t\t\t\t<div>\n\t\t\t\t\t\t\t\t<div>voices hash: ".concat(hash, "</div>\n\t\t\t\t\t\t\t\t").concat(voices.map(function (voice) {
                return "<div>".concat(voice.name, "</div>");
              }).join(''), "\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t");
            }(), "\n\n\t\t\t\t\t").concat(!fp.screen[0] ? "<div>screen: ".concat(note.blocked, "</div>") : function () {
              var _fp$screen = _slicedToArray(fp.screen, 2),
                  scrn = _fp$screen[0],
                  hash = _fp$screen[1];

              return "\n\t\t\t\t\t\t\t<div>\n\t\t\t\t\t\t\t\t<div>screen hash: ".concat(hash, "</div>\n\t\t\t\t\t\t\t\t").concat(Object.keys(scrn).map(function (key) {
                var value = scrn[key];
                return "<div>".concat(key, ": ").concat(value ? value : note.blocked, "</div>");
              }).join(''), "\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t");
            }(), "\n\t\t\t\t\t\n\t\t\t\t\t").concat(!fp.nav[0] ? "<div>navigator: ".concat(note.blocked, "</div>") : function () {
              var _fp$nav = _slicedToArray(fp.nav, 2),
                  nav = _fp$nav[0],
                  hash = _fp$nav[1];

              var platform = nav.platform,
                  deviceMemory = nav.deviceMemory,
                  hardwareConcurrency = nav.hardwareConcurrency,
                  maxTouchPoints = nav.maxTouchPoints,
                  mimeTypes = nav.mimeTypes,
                  mimeTypesHash = nav.mimeTypesHash,
                  version = nav.version,
                  versionHash = nav.versionHash,
                  plugins = nav.plugins,
                  pluginsHash = nav.pluginsHash,
                  userAgent = nav.userAgent,
                  appVersion = nav.appVersion,
                  language = nav.language,
                  vendor = nav.vendor,
                  doNotTrack = nav.doNotTrack;
              return "\n\t\t\t\t\t\t\t<div>\n\t\t\t\t\t\t\t\t<div>navigator hash: ".concat(hash, "</div>\n\t\t\t\t\t\t\t\t<div>version: ").concat(version !== undefined ? versionHash : note.blocked, "</div>\n\t\t\t\t\t\t\t\t<div>platform: ").concat(platform ? platform : "".concat(note.blocked, " or other"), "</div>\n\t\t\t\t\t\t\t\t<div>deviceMemory: ").concat(deviceMemory ? deviceMemory : note.blocked, "</div>\n\t\t\t\t\t\t\t\t<div>hardwareConcurrency: ").concat(hardwareConcurrency ? hardwareConcurrency : note.blocked, "</div>\n\t\t\t\t\t\t\t\t<div>maxTouchPoints: ").concat(maxTouchPoints !== undefined ? maxTouchPoints : note.blocked, "</div>\n\t\t\t\t\t\t\t\t<div>userAgent: ").concat(userAgent ? userAgent : note.blocked, "</div>\n\t\t\t\t\t\t\t\t<div>appVersion: ").concat(appVersion ? appVersion : note.blocked, "</div>\n\t\t\t\t\t\t\t\t<div>language: ").concat(language ? language : note.blocked, "</div>\n\t\t\t\t\t\t\t\t<div>vendor: ").concat(vendor ? vendor : note.blocked, "</div>\n\t\t\t\t\t\t\t\t<div>doNotTrack: ").concat(doNotTrack !== undefined ? doNotTrack : note.blocked, "</div>\n\t\t\t\t\t\t\t\t<div>mimeTypes: ").concat(mimeTypes !== undefined ? mimeTypesHash : note.blocked, "</div>\n\t\t\t\t\t\t\t\t<div>plugins: ").concat(plugins !== undefined ? pluginsHash : note.blocked, "</div>\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t");
            }(), "\n\n\t\t\t\t\t").concat(!fp.highEntropy[0] ? "<div>high entropy: ".concat(note.blocked, " or unsupported</div>") : function () {
              var _fp$highEntropy = _slicedToArray(fp.highEntropy, 2),
                  ua = _fp$highEntropy[0],
                  hash = _fp$highEntropy[1];

              var architecture = ua.architecture,
                  model = ua.model,
                  platform = ua.platform,
                  platformVersion = ua.platformVersion,
                  uaFullVersion = ua.uaFullVersion;
              return "\n\t\t\t\t\t\t\t<div>\n\t\t\t\t\t\t\t\t<div>high entropy hash: ".concat(hash, "</div>\n\t\t\t\t\t\t\t\t<div>ua architecture: ").concat(architecture, "</div>\n\t\t\t\t\t\t\t\t<div>ua model: ").concat(model, "</div>\n\t\t\t\t\t\t\t\t<div>ua platform: ").concat(platform, "</div>\n\t\t\t\t\t\t\t\t<div>ua platform version: ").concat(platformVersion, "</div>\n\t\t\t\t\t\t\t\t<div>ua full version: ").concat(uaFullVersion, "</div>\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t");
            }(), "\n\n\t\t\t\t</div>\n\t\t\t</section>\n\t\t");
            return _context4.abrupt("return", patch(fpElem, html(_templateObject6(), data)));

          case 23:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4);
  })))["catch"](function (e) {
    return console.log(e);
  });
})();

},{}]},{},[1]);
