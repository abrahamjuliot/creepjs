(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
// @ts-nocheck
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var _this = this;
// Log performance time
var timer = function (logStart) {
    console.log(logStart);
    var start = Date.now();
    return function (logEnd) {
        var end = Date.now() - start;
        console.log(logEnd + ": " + end / 1000 + " seconds");
    };
};
// Handle Errors
var errorsCaptured = [];
var captureError = function (error) {
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
    var hasInnerSpace = function (s) { return /.+(\s).+/g.test(s); }; // ignore AOPR noise
    console.error(error); // log error to educate
    var name = error.name, message = error.message;
    var trustedMessage = hasInnerSpace(message) ? message : undefined;
    var trustedName = type[name] ? name : undefined;
    var lineNumber = error.stack.split('\n')[2];
    var index = lineNumber.indexOf('at ');
    var lineAndIndex = lineNumber.slice(index + 2, lineNumber.length);
    errorsCaptured.push({ trustedName: trustedName, trustedMessage: trustedMessage });
    return undefined;
};
var attempt = function (fn) {
    try {
        return fn();
    }
    catch (error) {
        return captureError(error);
    }
};
// https://stackoverflow.com/a/22429679
var hashMini = function (str) {
    var json = "" + JSON.stringify(str);
    var i, len, hash = 0x811c9dc5;
    for (i = 0, len = json.length; i < len; i++) {
        hash = Math.imul(31, hash) + json.charCodeAt(i) | 0;
    }
    return ('0000000' + (hash >>> 0).toString(16)).substr(-8);
};
// https://stackoverflow.com/a/53490958
// https://stackoverflow.com/a/43383990
// https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest
var hashify = function (x) { return __awaiter(_this, void 0, void 0, function () {
    var json, jsonBuffer, hashBuffer, hashArray, hashHex;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                json = "" + JSON.stringify(x);
                jsonBuffer = new TextEncoder().encode(json);
                return [4 /*yield*/, crypto.subtle.digest('SHA-256', jsonBuffer)];
            case 1:
                hashBuffer = _a.sent();
                hashArray = Array.from(new Uint8Array(hashBuffer));
                hashHex = hashArray.map(function (b) { return ('00' + b.toString(16)).slice(-2); }).join('');
                return [2 /*return*/, hashHex];
        }
    });
}); };
// ie11 fix for template.content
function templateContent(template) {
    // template {display: none !important} /* add css if template is in dom */
    if ('content' in document.createElement('template')) {
        return document.importNode(template.content, true);
    }
    else {
        var frag = document.createDocumentFragment();
        var children = template.childNodes;
        for (var i = 0, len = children.length; i < len; i++) {
            frag.appendChild(children[i].cloneNode(true));
        }
        return frag;
    }
}
// tagged template literal (JSX alternative)
var patch = function (oldEl, newEl, fn) {
    if (fn === void 0) { fn = null; }
    return __awaiter(_this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    oldEl.parentNode.replaceChild(newEl, oldEl);
                    if (!(typeof fn === 'function')) return [3 /*break*/, 2];
                    return [4 /*yield*/, fn()];
                case 1:
                    _a = _b.sent();
                    return [3 /*break*/, 3];
                case 2:
                    _a = true;
                    _b.label = 3;
                case 3: return [2 /*return*/, _a];
            }
        });
    });
};
var html = function (stringSet) {
    var expressionSet = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        expressionSet[_i - 1] = arguments[_i];
    }
    var template = document.createElement('template');
    template.innerHTML = stringSet.map(function (str, i) { return "" + str + (expressionSet[i] || ''); }).join('');
    return templateContent(template); // ie11 fix for template.content
};
// Detect proxy behavior
var proxyBehavior = function (obj) {
    var url = '' + location;
    try {
        window.postMessage(obj, url);
        return false;
    }
    catch (error) {
        var cloneable = error.code != 25; // data clone error	
        return !cloneable;
    }
};
// detect and fingerprint Function API lies
var native = function (result, str) {
    var chrome = "function " + str + "() { [native code] }";
    var firefox = "function " + str + "() {\n    [native code]\n}";
    return result == chrome || result == firefox;
};
var hasLiedStringAPI = function () {
    var lieTypes = [];
    // detect attempts to rewrite Function.prototype.toString conversion APIs
    var toString = Function.prototype.toString;
    if (!native(toString, 'toString')) {
        lieTypes.push({ toString: toString });
    }
    // The idea of checking new is inspired by https://adtechmadness.wordpress.com/2019/03/23/javascript-tampering-detection-and-stealth/
    try {
        var str_1 = new Function.prototype.toString;
        var str_2 = new (Function.prototype.toString());
        var str_3 = new Function.prototype.toString.toString;
        var str_4 = new (Function.prototype.toString.toString());
        lieTypes.push({
            str_1: str_1,
            str_2: str_2,
            str_3: str_3,
            str_4: str_4
        });
    }
    catch (error) {
        var nativeTypeError = 'TypeError: Function.prototype.toString is not a constructor';
        if ('' + error != nativeTypeError) {
            lieTypes.push({ newErr: '' + error.message });
        }
    }
    return function () { return lieTypes; };
};
var stringAPILieTypes = hasLiedStringAPI(); // compute and cache result
var hasLiedAPI = function (api, name) {
    var lieTypes = __spreadArrays(stringAPILieTypes());
    var fingerprint = '';
    // detect attempts to rename the API and/or rewrite toString
    var fnToStr = Function.prototype.toString;
    var apiName = api.name, apiToString = api.toString;
    if (apiName != name) {
        lieTypes.push({
            apiName: !proxyBehavior(apiName) ? apiName : true
        });
    }
    if (apiToString !== fnToStr || apiToString.toString !== fnToStr) {
        lieTypes.push({
            apiToString: !proxyBehavior(apiToString) ? apiToString : true
        });
    }
    // collect string conversion result
    var result = '' + api;
    // fingerprint result if it does not match native code
    if (!native(result, name)) {
        fingerprint = result;
    }
    return {
        lie: lieTypes.length || fingerprint ? { lieTypes: lieTypes, fingerprint: fingerprint } : false
    };
};
// Detect Brave Browser and strict fingerprinting blocking
var brave = function () { return 'brave' in navigator ? true : false; };
var isBrave = brave(); // compute and cache result
// Collect trash values
var trashBin = [];
var sendToTrash = function (name, val) {
    var proxyLike = proxyBehavior(val);
    var value = !proxyLike ? val : 'proxy behavior detected';
    trashBin.push({ name: name, value: value });
    return undefined;
};
// Collect lies detected
var lieRecords = [];
var compress = function (x) {
    return JSON.stringify(x).replace(/((\n|\r|\s|:|\"|\,|\{|\}|\[|\]|\(|\))+)/gm, '').toLowerCase();
};
var documentLie = function (name, lieResult, lieTypes) {
    return lieRecords.push({ name: name, lieTypes: lieTypes, hash: lieResult, lie: hashMini(lieTypes) });
};
// validate
var isInt = function (x) { return typeof x == 'number' && x % 1 == 0; };
var trustInteger = function (name, val) {
    var trusted = isInt(val);
    return trusted ? val : sendToTrash(name, val);
};
// navigator
var nav = function () {
    var credibleUserAgent = ('chrome' in window ? navigator.userAgent.includes(navigator.appVersion) : true
    // todo: additional checks
    );
    return {
        appVersion: attempt(function () {
            var appVersion = navigator.appVersion;
            return credibleUserAgent ? appVersion : sendToTrash('appVersion', 'does not match userAgent');
        }),
        deviceMemory: attempt(function () {
            var deviceMemory = navigator.deviceMemory;
            return deviceMemory ? trustInteger('deviceMemory', deviceMemory) : undefined;
        }),
        doNotTrack: attempt(function () {
            var doNotTrack = navigator.doNotTrack;
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
            var hardwareConcurrency = navigator.hardwareConcurrency;
            return trustInteger('hardwareConcurrency', hardwareConcurrency);
        }),
        language: attempt(function () {
            var languages = navigator.languages, language = navigator.language;
            var langs = /^.{0,2}/g.exec(languages[0])[0];
            var lang = /^.{0,2}/g.exec(language)[0];
            var trusted = langs == lang;
            return (trusted ? languages.join(', ') + " (" + language + ")" :
                sendToTrash('languages', [languages, language].join(' ')));
        }),
        maxTouchPoints: attempt(function () {
            if ('maxTouchPoints' in navigator) {
                var maxTouchPoints = navigator.maxTouchPoints;
                return trustInteger('maxTouchPoints', maxTouchPoints);
            }
            return null;
        }),
        platform: attempt(function () {
            var platform = navigator.platform;
            var systems = ['win', 'linux', 'mac', 'arm', 'pike', 'linux', 'iphone', 'ipad', 'ipod', 'android', 'x11'];
            var trusted = systems.filter(function (val) { return platform.toLowerCase().includes(val); })[0];
            return trusted ? platform : undefined;
        }),
        userAgent: attempt(function () {
            var userAgent = navigator.userAgent;
            return credibleUserAgent ? userAgent : sendToTrash('userAgent', userAgent);
        }),
        vendor: attempt(function () { return navigator.vendor; }),
        mimeTypes: attempt(function () { return __spreadArrays(navigator.mimeTypes).map(function (m) { return m.type; }); }),
        plugins: attempt(function () {
            return __spreadArrays(navigator.plugins).map(function (p) { return ({
                name: p.name,
                description: p.description,
                filename: p.filename,
                version: p.version
            }); });
        }),
        version: attempt(function () {
            var keys = Object.keys(Object.getPrototypeOf(navigator));
            return keys;
        })
    };
};
// client hints
var highEntropyValues = function () {
    var undfnd = new Promise(function (resolve) { return resolve(undefined); });
    try {
        if (!('userAgentData' in navigator)) {
            return undfnd;
        }
        return !('userAgentData' in navigator) ? undfnd :
            attempt(function () { return navigator.userAgentData.getHighEntropyValues(['platform', 'platformVersion', 'architecture', 'model', 'uaFullVersion']); });
    }
    catch (error) {
        captureError(error);
        return new Promise(function (resolve) { return resolve(undefined); });
    }
};
// screen (allow some discrepancies otherwise lie detection triggers at random)
var screenFp = function () {
    var width = screen.width, height = screen.height, availWidth = screen.availWidth, availHeight = screen.availHeight, colorDepth = screen.colorDepth, pixelDepth = screen.pixelDepth;
    return {
        width: attempt(function () { return trustInteger('width', width); }),
        outerWidth: attempt(function () { return trustInteger('outerWidth', outerWidth); }),
        availWidth: attempt(function () { return trustInteger('availWidth', availWidth); }),
        height: attempt(function () { return trustInteger('height', height); }),
        outerHeight: attempt(function () { return trustInteger('outerHeight', outerHeight); }),
        availHeight: attempt(function () { return trustInteger('availHeight', availHeight); }),
        colorDepth: attempt(function () { return trustInteger('colorDepth', colorDepth); }),
        pixelDepth: attempt(function () { return trustInteger('pixelDepth', pixelDepth); })
    };
};
// voices
var getVoices = function () {
    var undfn = new Promise(function (resolve) { return resolve(undefined); });
    try {
        if (!('chrome' in window)) {
            return speechSynthesis.getVoices();
        }
        var promise = new Promise(function (resolve) {
            try {
                if (typeof speechSynthesis === 'undefined') {
                    return resolve(undefined);
                }
                else if (!speechSynthesis.getVoices || speechSynthesis.getVoices() == undefined) {
                    return resolve(undefined);
                }
                else if (speechSynthesis.getVoices().length) {
                    var voices = speechSynthesis.getVoices();
                    return resolve(voices);
                }
                else {
                    speechSynthesis.onvoiceschanged = function () { return resolve(speechSynthesis.getVoices()); };
                }
            }
            catch (error) {
                captureError(error);
                return resolve(undefined);
            }
        });
        return promise;
    }
    catch (error) {
        captureError(error);
        return undfn;
    }
};
// media devices
var getMediaDevices = function () {
    var undfn = new Promise(function (resolve) { return resolve(undefined); });
    if (!('mediaDevices' in navigator)) {
        return undfn;
    }
    try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
            return undfn;
        }
        return attempt(function () { return navigator.mediaDevices.enumerateDevices(); });
    }
    catch (error) {
        captureError(error);
        return undfn;
    }
};
// canvas
var canvasToDataURL = attempt(function () { return HTMLCanvasElement.prototype.toDataURL; });
var canvasGetContext = attempt(function () { return HTMLCanvasElement.prototype.getContext; });
var dataLie = canvasToDataURL ? hasLiedAPI(canvasToDataURL, 'toDataURL').lie : false;
var contextLie = canvasGetContext ? hasLiedAPI(canvasGetContext, 'getContext').lie : false;
var canvas = function () {
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
    }
    // document lie and send to trash
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
    }
    // fingerprint lie
    return { dataLie: dataLie, contextLie: contextLie };
};
// webgl
var webgl = function () {
    var webglGetParameter = attempt(function () { return WebGLRenderingContext.prototype.getParameter; });
    var webglGetExtension = attempt(function () { return WebGLRenderingContext.prototype.getExtension; });
    var paramLie = webglGetParameter ? hasLiedAPI(webglGetParameter, 'getParameter').lie : false;
    var extLie = webglGetExtension ? hasLiedAPI(webglGetExtension, 'getExtension').lie : false;
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('webgl');
    return {
        unmasked: (function () {
            try {
                var extension = context.getExtension('WEBGL_debug_renderer_info');
                var vendor = extension && context.getParameter(extension.UNMASKED_VENDOR_WEBGL);
                var renderer = extension && context.getParameter(extension.UNMASKED_RENDERER_WEBGL);
                if (!paramLie && !extLie) {
                    return {
                        vendor: (isBrave ? sendToTrash('webglVendor', vendor) :
                            !proxyBehavior(vendor) ? vendor :
                                sendToTrash('webglVendor', 'proxy behavior detected')),
                        renderer: (isBrave ? sendToTrash('webglRenderer', renderer) :
                            !proxyBehavior(renderer) ? renderer :
                                sendToTrash('webglRenderer', 'proxy behavior detected'))
                    };
                }
                // document lie and send to trash
                var webglVendorAndRendererParameter = vendor + ", " + renderer;
                var webglVendorAndRendererExtension = webglVendorAndRendererParameter;
                if (paramLie) {
                    documentLie('webglVendorAndRendererParameter', webglVendorAndRendererParameter, paramLie);
                    sendToTrash('webglVendorAndRendererParameter', webglVendorAndRendererParameter);
                }
                if (extLie) {
                    documentLie('webglVendorAndRendererExtension', webglVendorAndRendererExtension, extLie);
                    sendToTrash('webglVendorAndRendererExtension', webglVendorAndRendererExtension);
                }
                // Fingerprint lie
                return {
                    vendor: { paramLie: paramLie, extLie: extLie },
                    renderer: { paramLie: paramLie, extLie: extLie }
                };
            }
            catch (error) {
                captureError(error);
                return {
                    vendor: isBrave ? sendToTrash('webglVendor', null) : undefined,
                    renderer: isBrave ? sendToTrash('webglRenderer', null) : undefined
                };
            }
        })(),
        dataURL: (function () {
            try {
                var canvasWebglDataURI = '';
                if (!dataLie && !contextLie) {
                    context.clearColor(0.2, 0.4, 0.6, 0.8);
                    context.clear(context.COLOR_BUFFER_BIT);
                    canvasWebglDataURI = canvas.toDataURL();
                    return isBrave ? sendToTrash('canvasWebglDataURI', hashMini(canvasWebglDataURI)) : canvasWebglDataURI;
                }
                // document lie and send to trash
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
                }
                // fingerprint lie
                return { dataLie: dataLie, contextLie: contextLie };
            }
            catch (error) {
                return captureError(error);
            }
        })()
    };
};
// maths
var maths = function () {
    var n = 0.123124234234234242;
    var fns = [
        ['acos', [n]],
        ['acosh', [1e308]],
        ['asin', [n]],
        ['asinh', [1e300]],
        ['asinh', [1]],
        ['atan', [2]],
        ['atanh', [0.5]],
        ['atan2', [90, 15]],
        ['atan2', [1e-310, 2]],
        ['cbrt', [100]],
        ['cosh', [100]],
        ['expm1', [1]],
        ['sin', [1]],
        ['sinh', [1]],
        ['tan', [-1e308]],
        ['tanh', [1e300]],
        ['cosh', [1]],
        ['sin', [Math.PI]],
        ['pow', [Math.PI, -100]]
    ];
    return fns.map(function (fn) {
        var _a;
        return (_a = {},
            _a[fn[0]] = attempt(function () { return Math[fn[0]].apply(Math, fn[1]); }),
            _a);
    });
};
// browser console errors
var consoleErrs = function () {
    var getErrors = function (errs, errFns) {
        var i, len = errFns.length;
        for (i = 0; i < len; i++) {
            try {
                errFns[i]();
            }
            catch (err) {
                errs.push(err.message);
            }
        }
        return errs;
    };
    var errFns = [
        function () { return eval('alert(")'); },
        function () { return eval('const foo;foo.bar'); },
        function () { return eval('null.bar'); },
        function () { return eval('abc.xyz = 123'); },
        function () { return eval('const foo;foo.bar'); },
        function () { return eval('(1).toString(1000)'); },
        function () { return eval('[...undefined].length'); },
        function () { return eval('var x = new Array(-1)'); },
        function () { return eval('const a=1; const a=2;'); }
    ];
    return getErrors([], errFns);
};
// timezone
var timezone = function () {
    var computeTimezoneOffset = function () {
        var toJSONParsed = function (x) { return JSON.parse(JSON.stringify(x)); };
        var utc = Date.parse(toJSONParsed(new Date()).split(__makeTemplateObject(["Z"], ["Z"])).join(__makeTemplateObject([""], [""])));
        var now = +new Date();
        return +(((utc - now) / 60000).toFixed(2));
    };
    var dateGetTimezoneOffset = attempt(function () { return Date.prototype.getTimezoneOffset; });
    var timezoneLie = dateGetTimezoneOffset ? hasLiedAPI(dateGetTimezoneOffset, 'getTimezoneOffset').lie : false;
    var timezoneOffset = new Date().getTimezoneOffset();
    var trusted = true;
    if (!timezoneLie) {
        var timezoneOffsetComputed = computeTimezoneOffset();
        trusted = timezoneOffsetComputed == timezoneOffset;
        var notWithinParentheses = /.*\(|\).*/g;
        var timezoneLocation = Intl.DateTimeFormat().resolvedOptions().timeZone;
        var timezone_1 = ('' + new Date()).replace(notWithinParentheses, '');
        return trusted ? { timezoneOffsetComputed: timezoneOffsetComputed, timezoneOffset: timezoneOffset, timezoneLocation: timezoneLocation, timezone: timezone_1 } : undefined;
    }
    // document lie and send to trash
    if (timezoneLie) {
        documentLie('timezoneOffset', timezoneOffset, timezoneLie);
    }
    if (timezoneLie || !trusted) {
        sendToTrash('timezoneOffset', timezoneOffset);
    }
    // Fingerprint lie
    return { timezoneLie: timezoneLie };
};
// client rects
var cRects = function () {
    var toJSONParsed = function (x) { return JSON.parse(JSON.stringify(x)); };
    var rectContainer = document.getElementById('rect-container');
    var removeRectsFromDom = function () { return rectContainer.parentNode.removeChild(rectContainer); };
    var elementGetClientRects = attempt(function () { return Element.prototype.getClientRects; });
    var rectsLie = (elementGetClientRects ? hasLiedAPI(elementGetClientRects, 'getClientRects').lie : false);
    var cRectProps = ['x', 'y', 'width', 'height', 'top', 'right', 'bottom', 'left'];
    var rectElems = document.getElementsByClassName('rects');
    var clientRects = __spreadArrays(rectElems).map(function (el) {
        return toJSONParsed(el.getClientRects()[0]);
    });
    if (!rectsLie) {
        removeRectsFromDom();
        return clientRects;
    }
    // document lie and send to trash
    if (rectsLie) {
        documentLie('clientRects', hashMini(clientRects), rectsLie);
        sendToTrash('clientRects', hashMini(clientRects));
    }
    // Fingerprint lie
    removeRectsFromDom();
    return { rectsLie: rectsLie };
};
// scene
var scene = html(__makeTemplateObject(["\n<fingerprint>\n\t<visitor><div id=\"visitor\">Loading visitor data...</div></visitor>\n\t<div id=\"fingerprint\"></div>\n\t\n\t<div id=\"rect-container\">\n\t\t<style>\n\t\t.rects{width:10px;height:10px;max-width:100%}.absolute{position:absolute}#cRect1{border:solid 2.715px;border-color:#F72585;padding:3.98px;margin-left:12.12px}#cRect2{border:solid 2px;border-color:#7209B7;font-size:30px;margin-top:20px;transform:skewY(23.1753218deg)}#cRect3{border:solid 2.89px;border-color:#3A0CA3;font-size:45px;transform:scale(100000000000000000000009999999999999.99, 1.89);margin-top:50px}#cRect4{border:solid 2px;border-color:#4361EE;transform:matrix(1.11, 2.0001, -1.0001, 1.009, 150, 94.4);margin-top:11.1331px;margin-left:12.1212px;padding:4.4545px;left:239.4141px;top:8.5050px}#cRect5{border:solid 2px;border-color:#4CC9F0;margin-left:42.395pt}#cRect6{border:solid 2px;border-color:#F72585;transform:perspective(12890px) translateZ(101.5px);padding:12px}#cRect7{margin-top:-350.552px;margin-left:0.9099rem;border:solid 2px;border-color:#4361EE}#cRect8{margin-top:-150.552px;margin-left:15.9099rem;border:solid 2px;border-color:#3A0CA3}#cRect9{margin-top:-110.552px;margin-left:15.9099rem;border:solid 2px;border-color:#7209B7}#cRect10{margin-top:-315.552px;margin-left:15.9099rem;border:solid 2px;border-color:#F72585}\n\t\t</style>\n\t\t<div id=\"cRect1\" class=\"rects\"></div>\n\t\t<div id=\"cRect2\" class=\"rects\"></div>\n\t\t<div id=\"cRect3\" class=\"rects\"></div>\n\t\t<div id=\"cRect4\" class=\"rects absolute\"></div>\n\t\t<div id=\"cRect5\" class=\"rects\"></div>\n\t\t<div id=\"cRect6\" class=\"rects\"></div>\n\t\t<div id=\"cRect7\" class=\"rects absolute\"></div>\n\t\t<div id=\"cRect8\" class=\"rects absolute\"></div>\n\t\t<div id=\"cRect9\" class=\"rects absolute\"></div>\n\t\t<div id=\"cRect10\" class=\"rects absolute\"></div>\n\t</div>\n</fingerprint>\n"], ["\n<fingerprint>\n\t<visitor><div id=\"visitor\">Loading visitor data...</div></visitor>\n\t<div id=\"fingerprint\"></div>\n\t\n\t<div id=\"rect-container\">\n\t\t<style>\n\t\t.rects{width:10px;height:10px;max-width:100%}.absolute{position:absolute}#cRect1{border:solid 2.715px;border-color:#F72585;padding:3.98px;margin-left:12.12px}#cRect2{border:solid 2px;border-color:#7209B7;font-size:30px;margin-top:20px;transform:skewY(23.1753218deg)}#cRect3{border:solid 2.89px;border-color:#3A0CA3;font-size:45px;transform:scale(100000000000000000000009999999999999.99, 1.89);margin-top:50px}#cRect4{border:solid 2px;border-color:#4361EE;transform:matrix(1.11, 2.0001, -1.0001, 1.009, 150, 94.4);margin-top:11.1331px;margin-left:12.1212px;padding:4.4545px;left:239.4141px;top:8.5050px}#cRect5{border:solid 2px;border-color:#4CC9F0;margin-left:42.395pt}#cRect6{border:solid 2px;border-color:#F72585;transform:perspective(12890px) translateZ(101.5px);padding:12px}#cRect7{margin-top:-350.552px;margin-left:0.9099rem;border:solid 2px;border-color:#4361EE}#cRect8{margin-top:-150.552px;margin-left:15.9099rem;border:solid 2px;border-color:#3A0CA3}#cRect9{margin-top:-110.552px;margin-left:15.9099rem;border:solid 2px;border-color:#7209B7}#cRect10{margin-top:-315.552px;margin-left:15.9099rem;border:solid 2px;border-color:#F72585}\n\t\t</style>\n\t\t<div id=\"cRect1\" class=\"rects\"></div>\n\t\t<div id=\"cRect2\" class=\"rects\"></div>\n\t\t<div id=\"cRect3\" class=\"rects\"></div>\n\t\t<div id=\"cRect4\" class=\"rects absolute\"></div>\n\t\t<div id=\"cRect5\" class=\"rects\"></div>\n\t\t<div id=\"cRect6\" class=\"rects\"></div>\n\t\t<div id=\"cRect7\" class=\"rects absolute\"></div>\n\t\t<div id=\"cRect8\" class=\"rects absolute\"></div>\n\t\t<div id=\"cRect9\" class=\"rects absolute\"></div>\n\t\t<div id=\"cRect10\" class=\"rects absolute\"></div>\n\t</div>\n</fingerprint>\n"
    // fingerprint
]));
// fingerprint
var fingerprint = function () { return __awaiter(_this, void 0, void 0, function () {
    var navComputed, mimeTypes, plugins, navVersion, screenComputed, canvasComputed, gl, webglComputed, webglDataURLComputed, consoleErrorsComputed, timezoneComputed, cRectsComputed, mathsComputed, _a, voices, mediaDevices, highEntropy, voicesComputed, mediaDevicesComputed, trashComputed, liesComputed, hashTimer, _b, navHash, mimeTypesHash, pluginsHash, navVersionHash, voicesHash, mediaDeviceHash, highEntropyHash, timezoneHash, webglHash, screenHash, weglDataURLHash, consoleErrorsHash, cRectsHash, mathsHash, canvasHash, errorsCapturedHash, trashHash, liesHash, fingerprint;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                navComputed = attempt(function () { return nav(); });
                mimeTypes = navComputed ? navComputed.mimeTypes : undefined;
                plugins = navComputed ? navComputed.plugins : undefined;
                navVersion = navComputed ? navComputed.version : undefined;
                screenComputed = attempt(function () { return screenFp(); });
                canvasComputed = attempt(function () { return canvas(); });
                gl = attempt(function () { return webgl(); });
                webglComputed = {
                    vendor: attempt(function () { return gl.unmasked.vendor; }),
                    renderer: attempt(function () { return gl.unmasked.renderer; })
                };
                webglDataURLComputed = attempt(function () { return gl.dataURL; });
                consoleErrorsComputed = attempt(function () { return consoleErrs(); });
                timezoneComputed = attempt(function () { return timezone(); });
                cRectsComputed = attempt(function () { return cRects(); });
                mathsComputed = attempt(function () { return maths(); });
                return [4 /*yield*/, Promise.all([
                        getVoices(),
                        getMediaDevices(),
                        highEntropyValues()
                    ])["catch"](function (error) {
                        console.error(error.message);
                    })];
            case 1:
                _a = _c.sent(), voices = _a[0], mediaDevices = _a[1], highEntropy = _a[2];
                voicesComputed = !voices ? undefined : voices.map(function (_a) {
                    var name = _a.name, lang = _a.lang;
                    return ({ name: name, lang: lang });
                });
                mediaDevicesComputed = !mediaDevices ? undefined : mediaDevices.map(function (_a) {
                    var kind = _a.kind;
                    return ({ kind: kind });
                }) // chrome randomizes groupId
                ;
                trashComputed = trashBin.map(function (trash) { return trash.name; });
                liesComputed = lieRecords.map(function (lie) {
                    var name = lie.name, lieTypes = lie.lieTypes;
                    return { name: name, lieTypes: lieTypes };
                });
                hashTimer = timer('hashing values...');
                return [4 /*yield*/, Promise.all([
                        hashify(navComputed),
                        hashify(mimeTypes),
                        hashify(plugins),
                        hashify(navVersion),
                        hashify(voicesComputed),
                        hashify(mediaDevicesComputed),
                        hashify(highEntropy),
                        hashify(timezoneComputed),
                        hashify(webglComputed),
                        hashify(screenComputed),
                        hashify(webglDataURLComputed),
                        hashify(consoleErrorsComputed),
                        hashify(cRectsComputed),
                        hashify(mathsComputed),
                        hashify(canvasComputed),
                        hashify(errorsCaptured),
                        hashify(trashComputed),
                        hashify(liesComputed)
                    ])["catch"](function (error) {
                        console.error(error.message);
                    })];
            case 2:
                _b = _c.sent(), navHash = _b[0], mimeTypesHash = _b[1], pluginsHash = _b[2], navVersionHash = _b[3], voicesHash = _b[4], mediaDeviceHash = _b[5], highEntropyHash = _b[6], timezoneHash = _b[7], webglHash = _b[8], screenHash = _b[9], weglDataURLHash = _b[10], consoleErrorsHash = _b[11], cRectsHash = _b[12], mathsHash = _b[13], canvasHash = _b[14], errorsCapturedHash = _b[15], trashHash = _b[16], liesHash = _b[17];
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
                return [2 /*return*/, fingerprint];
        }
    });
}); };
// get/post request
var webapp = 'https://script.google.com/macros/s/AKfycbzKRjt6FPboOEkh1vTXttGyCjp97YBP7z-5bODQmtSkQ9BqDRY/exec';
function postData(formData) {
    return __awaiter(this, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetch(webapp, { method: 'POST', body: formData })];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.json()];
            }
        });
    });
}
// patch
var app = document.getElementById('fp-app');
patch(app, scene, function () { return __awaiter(_this, void 0, void 0, function () {
    var fpElem, fp, creep, log, _a, fpHash, creepHash, visitorElem, fetchVisitoDataTimer, note, identify, pluralify, data;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                fpElem = document.getElementById('fingerprint');
                return [4 /*yield*/, fingerprint()["catch"](function (e) { return console.log(e); })
                    // Purified Fingerprint
                ];
            case 1:
                fp = _b.sent();
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
                log = function (message, obj) { return console.log(message, JSON.stringify(obj, null, '\t')); };
                console.log('Pure Fingerprint (Object):', creep);
                console.log('Fingerprint Id (Object):', fp);
                log('Fingerprint Id (JSON):', fp);
                return [4 /*yield*/, Promise.all([hashify(fp), hashify(creep)])["catch"](function (error) {
                        console.error(error.message);
                    })
                    // fetch data from server
                ];
            case 2:
                _a = _b.sent(), fpHash = _a[0], creepHash = _a[1];
                visitorElem = document.getElementById('visitor');
                fetchVisitoDataTimer = timer('Fetching visitor data...');
                fetch(webapp + "?id=" + creepHash + "&subId=" + fpHash)
                    .then(function (response) { return response.json(); })
                    .then(function (data) {
                    var firstVisit = data.firstVisit, latestVisit = data.latestVisit, subIds = data.subIds, visits = data.visits;
                    var subIdsLen = Object.keys(subIds).length;
                    var toLocaleStr = function (str) { return new Date(str).toLocaleString(); };
                    var pluralify = function (len) { return len > 1 ? 's' : ''; };
                    var plural = pluralify(subIdsLen);
                    var template = "\n\t\t\t\t<div>First Visit: " + toLocaleStr(firstVisit) + " (x days ago)</div>\n\t\t\t\t<div>Latest Visit: " + toLocaleStr(latestVisit) + "</div>\n\t\t\t\t" + (subIdsLen ? "<div>" + subIdsLen + " sub fingerprint" + plural + " detected</div>" : '') + "\n\t\t\t\t<div>Visits: " + visits + "</div>\n\t\t\t";
                    fetchVisitoDataTimer('Visitor data received');
                    return patch(visitorElem, html(__makeTemplateObject(["", ""], ["", ""]), template));
                })["catch"](function (err) {
                    fetchVisitoDataTimer('Error fetching visitor data');
                    patch(visitorElem, html(__makeTemplateObject(["<div>Error loading visitor data</div>"], ["<div>Error loading visitor data</div>"])));
                    return console.error('Error!', err.message);
                });
                note = { blocked: '<span class="blocked">blocked</span>' };
                identify = function (prop) {
                    var torBrowser = (
                    /* geo.enabled can be set to true or false:
                    Geolocation is in window of Firefox
                    Geolocation is not in the window of Tor Browser
                    */
                    !('Geolocation' in window));
                    var catchTorBrowser = (torBrowser ? 'Tor Browser' : 'Firefox');
                    var catchTorBrowserResist = (torBrowser ? 'Tor Browser (pending permission or blocked temporarily)' : 'Firefox (privacy.resistFingerprinting)');
                    var catchTorBrowserAllow = (torBrowser ? 'Tor Browser' : 'Firefox (privacy.resistFingerprinting)');
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
                    var data = prop[0], hash = prop[1];
                    var iterable = Symbol.iterator in Object(data);
                    return (!data || (iterable && !data.length) ? note.blocked :
                        known[hash] ? "<span class=\"known\">" + known[hash] + "</span>" : hash);
                };
                pluralify = function (len) { return len > 1 ? 's' : ''; };
                data = "\n\t\t<section>\n\t\t\t<div id=\"fingerprint-data\">\n\t\t\t\t<div>Purified Fingerprint Id: " + creepHash + "</div>\n\t\t\t\t<div>Fingerprint Id: " + fpHash + "</div>\n\n\t\t\t\t" + (!trashBin.length ? '<div>trash: <span class="none">none</span></div>' : (function () {
                    var plural = pluralify(trashBin.length);
                    var hash = fp.trash[1];
                    return "\n\t\t\t\t\t\t<div class=\"trash\">\n\t\t\t\t\t\t\t<strong>" + trashBin.length + " API" + plural + " are counted as trash</strong>\n\t\t\t\t\t\t\t<div>hash: " + hash + "</div>\n\t\t\t\t\t\t\t" + trashBin.map(function (item) { return "<div>" + item.name + ": " + item.value + "</div>"; }).join('') + "\n\t\t\t\t\t\t</div>\n\t\t\t\t\t\t";
                })()) + "\n\n\t\t\t\t" + (!lieRecords.length ? '<div>lies: <span class="none">none</span></div>' : (function () {
                    var plural = pluralify(lieRecords.length);
                    var hash = fp.lies[1];
                    return "\n\t\t\t\t\t\t<div class=\"lies\">\n\t\t\t\t\t\t\t<strong>" + lieRecords.length + " API lie" + plural + " detected</strong>\n\t\t\t\t\t\t\t<div>hash: " + hash + "</div>\n\t\t\t\t\t\t\t" + lieRecords.map(function (item) { return "<div>" + item.name + " Lie Fingerprint: " + item.lie + "</div>"; }).join('') + "\n\t\t\t\t\t\t</div>\n\t\t\t\t\t\t";
                })()) + "\n\n\t\t\t\t" + (!fp.errorsCaptured[0].length ? "<div>errors captured: <span class=\"none\">none</span></div>" : (function () {
                    var _a = fp.errorsCaptured, errors = _a[0], hash = _a[1];
                    var plural = pluralify(errors);
                    return "\n\t\t\t\t\t\t<div class=\"errors\">\n\t\t\t\t\t\t\t<strong>" + errors.length + " error" + plural + " captured</strong>\n\t\t\t\t\t\t\t<div>hash: " + hash + "</div>\n\t\t\t\t\t\t\t" + errors.map(function (err) {
                        return "\n\t\t\t\t\t\t\t\t\t<div>\n\t\t\t\t\t\t\t\t\t\t" + err.trustedName + ": " + err.trustedMessage + "\n\t\t\t\t\t\t\t\t\t</div>";
                    }).join('') + "\n\t\t\t\t\t\t</div>\n\t\t\t\t\t\t";
                })()) + "\n\n\t\t\t\t<div>canvas: " + (isBrave ? 'Brave Browser' : identify(fp.canvas)) + "</div>\n\t\t\t\t<div>\n\t\t\t\t<div>webglDataURL: " + (isBrave ? 'Brave Browser' : identify(fp.webglDataURL)) + "</div>\n\t\t\t\t\t<div>webgl renderer: " + (function () {
                    var _a = fp.webgl, data = _a[0], hash = _a[1];
                    var renderer = data.renderer;
                    var isString = typeof renderer == 'string';
                    return (isBrave ? 'Brave Browser' :
                        isString && renderer ? renderer :
                            !renderer ? note.blocked : identify(fp.webgl));
                })() + "</div>\n\t\t\t\t\t<div>webgl vendor: " + (function () {
                    var _a = fp.webgl, data = _a[0], hash = _a[1];
                    var vendor = data.vendor;
                    var isString = typeof vendor == 'string';
                    return (isBrave ? 'Brave Browser' :
                        isString && vendor ? vendor :
                            !vendor ? note.blocked : identify(fp.webgl));
                })() + "</div>\n\t\t\t\t</div>\n\t\t\t\t<div>client rects: " + identify(fp.cRects) + "</div>\n\t\t\t\t<div>console errors: " + identify(fp.consoleErrors) + "</div>\t\n\t\t\t\t<div>maths: " + identify(fp.maths) + "</div>\n\t\t\t\t<div>media devices: " + identify(fp.mediaDevices) + "</div>\n\t\t\t\t\n\t\t\t\t" + (!fp.timezone[0] ? "<div>timezone: " + note.blocked + "</div>" : (function () {
                    var _a = fp.timezone, timezone = _a[0], hash = _a[1];
                    return "\n\t\t\t\t\t\t<div>\n\t\t\t\t\t\t\t<div>timezone hash: " + identify(fp.timezone) + "</div>\n\t\t\t\t\t\t\t" + Object.keys(timezone).map(function (key) {
                        var value = timezone[key];
                        return "<div>" + key + ": " + (value != undefined ? value : note.blocked) + "</div>";
                    }).join('') + "\n\t\t\t\t\t\t</div>\n\t\t\t\t\t\t";
                })()) + "\n\t\t\t\t" + (!fp.voices[0] ? "<div>voices: " + note.blocked + "</div>" : (function () {
                    var _a = fp.voices, voices = _a[0], hash = _a[1];
                    return "\n\t\t\t\t\t\t<div>\n\t\t\t\t\t\t\t<div>voices hash: " + hash + "</div>\n\t\t\t\t\t\t\t" + voices.map(function (voice) {
                        return "<div>" + voice.name + "</div>";
                    }).join('') + "\n\t\t\t\t\t\t</div>\n\t\t\t\t\t\t";
                })()) + "\n\n\t\t\t\t" + (!fp.screen[0] ? "<div>screen: " + note.blocked + "</div>" : (function () {
                    var _a = fp.screen, scrn = _a[0], hash = _a[1];
                    return "\n\t\t\t\t\t\t<div>\n\t\t\t\t\t\t\t<div>screen hash: " + hash + "</div>\n\t\t\t\t\t\t\t" + Object.keys(scrn).map(function (key) {
                        var value = scrn[key];
                        return "<div>" + key + ": " + (value ? value : note.blocked) + "</div>";
                    }).join('') + "\n\t\t\t\t\t\t</div>\n\t\t\t\t\t\t";
                })()) + "\n\t\t\t\t\n\t\t\t\t" + (!fp.nav[0] ? "<div>navigator: " + note.blocked + "</div>" : (function () {
                    var _a = fp.nav, nav = _a[0], hash = _a[1];
                    var platform = nav.platform, deviceMemory = nav.deviceMemory, hardwareConcurrency = nav.hardwareConcurrency, maxTouchPoints = nav.maxTouchPoints, mimeTypes = nav.mimeTypes, mimeTypesHash = nav.mimeTypesHash, version = nav.version, versionHash = nav.versionHash, plugins = nav.plugins, pluginsHash = nav.pluginsHash, userAgent = nav.userAgent, appVersion = nav.appVersion, language = nav.language, vendor = nav.vendor, doNotTrack = nav.doNotTrack;
                    return "\n\t\t\t\t\t\t<div>\n\t\t\t\t\t\t\t<div>navigator hash: " + hash + "</div>\n\t\t\t\t\t\t\t<div>version: " + (version !== undefined ? versionHash : note.blocked) + "</div>\n\t\t\t\t\t\t\t<div>platform: " + (platform ? platform : note.blocked + " or other") + "</div>\n\t\t\t\t\t\t\t<div>deviceMemory: " + (deviceMemory ? deviceMemory : note.blocked) + "</div>\n\t\t\t\t\t\t\t<div>hardwareConcurrency: " + (hardwareConcurrency ? hardwareConcurrency : note.blocked) + "</div>\n\t\t\t\t\t\t\t<div>maxTouchPoints: " + (maxTouchPoints !== undefined ? maxTouchPoints : note.blocked) + "</div>\n\t\t\t\t\t\t\t<div>userAgent: " + (userAgent ? userAgent : note.blocked) + "</div>\n\t\t\t\t\t\t\t<div>appVersion: " + (appVersion ? appVersion : note.blocked) + "</div>\n\t\t\t\t\t\t\t<div>language: " + (language ? language : note.blocked) + "</div>\n\t\t\t\t\t\t\t<div>vendor: " + (vendor ? vendor : note.blocked) + "</div>\n\t\t\t\t\t\t\t<div>doNotTrack: " + (doNotTrack !== undefined ? doNotTrack : note.blocked) + "</div>\n\t\t\t\t\t\t\t<div>mimeTypes: " + (mimeTypes !== undefined ? mimeTypesHash : note.blocked) + "</div>\n\t\t\t\t\t\t\t<div>plugins: " + (plugins !== undefined ? pluginsHash : note.blocked) + "</div>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t\t";
                })()) + "\n\n\t\t\t\t" + (!fp.highEntropy[0] ? "<div>high entropy: " + note.blocked + " or unsupported</div>" : (function () {
                    var _a = fp.highEntropy, ua = _a[0], hash = _a[1];
                    var architecture = ua.architecture, model = ua.model, platform = ua.platform, platformVersion = ua.platformVersion, uaFullVersion = ua.uaFullVersion;
                    return "\n\t\t\t\t\t\t<div>\n\t\t\t\t\t\t\t<div>high entropy hash: " + hash + "</div>\n\t\t\t\t\t\t\t<div>ua architecture: " + architecture + "</div>\n\t\t\t\t\t\t\t<div>ua model: " + model + "</div>\n\t\t\t\t\t\t\t<div>ua platform: " + platform + "</div>\n\t\t\t\t\t\t\t<div>ua platform version: " + platformVersion + "</div>\n\t\t\t\t\t\t\t<div>ua full version: " + uaFullVersion + "</div>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t\t";
                })()) + "\n\n\t\t\t</div>\n\t\t</section>\n\t";
                return [2 /*return*/, patch(fpElem, html(__makeTemplateObject(["", ""], ["", ""]), data))];
        }
    });
}); })["catch"](function (e) { return console.log(e); });

},{}]},{},[1]);
