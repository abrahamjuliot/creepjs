// Detect Browser
function getEngine() {
    const x = [].constructor;
    try {
        (-1).toFixed(-1);
    }
    catch (err) {
        return err.message.length + (x + '').split(x.name).join('').length;
    }
}
const ENGINE_IDENTIFIER = getEngine();
const IS_BLINK = ENGINE_IDENTIFIER == 80;
const IS_GECKO = ENGINE_IDENTIFIER == 58;
const IS_WEBKIT = ENGINE_IDENTIFIER == 77;
const JS_ENGINE = ({
    80: 'V8',
    58: 'SpiderMonkey',
    77: 'JavaScriptCore',
})[ENGINE_IDENTIFIER] || null;
const LIKE_BRAVE = IS_BLINK && 'flat' in Array.prototype /* Chrome 69 */ && !('ReportingObserver' in window /* Brave */);
function braveBrowser() {
    const brave = ('brave' in navigator &&
        // @ts-ignore
        Object.getPrototypeOf(navigator.brave).constructor.name == 'Brave' &&
        // @ts-ignore
        navigator.brave.isBrave.toString() == 'function isBrave() { [native code] }');
    return brave;
}
function getBraveMode() {
    const mode = {
        unknown: false,
        allow: false,
        standard: false,
        strict: false,
    };
    try {
        // strict mode adds float frequency data AnalyserNode
        const strictMode = () => {
            try {
                window.OfflineAudioContext = (
                // @ts-ignore
                OfflineAudioContext || webkitOfflineAudioContext);
            }
            catch (err) { }
            if (!window.OfflineAudioContext) {
                return false;
            }
            const context = new OfflineAudioContext(1, 1, 44100);
            const analyser = context.createAnalyser();
            const data = new Float32Array(analyser.frequencyBinCount);
            analyser.getFloatFrequencyData(data);
            const strict = new Set(data).size > 1; // native only has -Infinity
            return strict;
        };
        if (strictMode()) {
            mode.strict = true;
            return mode;
        }
        // standard and strict mode do not have chrome plugins
        const chromePlugins = /(Chrom(e|ium)|Microsoft Edge) PDF (Plugin|Viewer)/;
        const pluginsList = [...navigator.plugins];
        const hasChromePlugins = pluginsList
            .filter((plugin) => chromePlugins.test(plugin.name)).length == 2;
        if (pluginsList.length && !hasChromePlugins) {
            mode.standard = true;
            return mode;
        }
        mode.allow = true;
        return mode;
    }
    catch (e) {
        mode.unknown = true;
        return mode;
    }
}
const getBraveUnprotectedParameters = (parameters) => {
    const blocked = new Set([
        'FRAGMENT_SHADER.HIGH_FLOAT.precision',
        'FRAGMENT_SHADER.HIGH_FLOAT.rangeMax',
        'FRAGMENT_SHADER.HIGH_FLOAT.rangeMin',
        'FRAGMENT_SHADER.HIGH_INT.precision',
        'FRAGMENT_SHADER.HIGH_INT.rangeMax',
        'FRAGMENT_SHADER.HIGH_INT.rangeMin',
        'FRAGMENT_SHADER.LOW_FLOAT.precision',
        'FRAGMENT_SHADER.LOW_FLOAT.rangeMax',
        'FRAGMENT_SHADER.LOW_FLOAT.rangeMin',
        'FRAGMENT_SHADER.MEDIUM_FLOAT.precision',
        'FRAGMENT_SHADER.MEDIUM_FLOAT.rangeMax',
        'FRAGMENT_SHADER.MEDIUM_FLOAT.rangeMin',
        'MAX_COMBINED_FRAGMENT_UNIFORM_COMPONENTS',
        'MAX_COMBINED_UNIFORM_BLOCKS',
        'MAX_COMBINED_VERTEX_UNIFORM_COMPONENTS',
        'MAX_DRAW_BUFFERS_WEBGL',
        'MAX_FRAGMENT_INPUT_COMPONENTS',
        'MAX_FRAGMENT_UNIFORM_BLOCKS',
        'MAX_FRAGMENT_UNIFORM_COMPONENTS',
        'MAX_TEXTURE_MAX_ANISOTROPY_EXT',
        'MAX_TRANSFORM_FEEDBACK_INTERLEAVED_COMPONENTS',
        'MAX_UNIFORM_BUFFER_BINDINGS',
        'MAX_VARYING_COMPONENTS',
        'MAX_VERTEX_OUTPUT_COMPONENTS',
        'MAX_VERTEX_UNIFORM_BLOCKS',
        'MAX_VERTEX_UNIFORM_COMPONENTS',
        'SHADING_LANGUAGE_VERSION',
        'UNMASKED_RENDERER_WEBGL',
        'UNMASKED_VENDOR_WEBGL',
        'VERSION',
        'VERTEX_SHADER.HIGH_FLOAT.precision',
        'VERTEX_SHADER.HIGH_FLOAT.rangeMax',
        'VERTEX_SHADER.HIGH_FLOAT.rangeMin',
        'VERTEX_SHADER.HIGH_INT.precision',
        'VERTEX_SHADER.HIGH_INT.rangeMax',
        'VERTEX_SHADER.HIGH_INT.rangeMin',
        'VERTEX_SHADER.LOW_FLOAT.precision',
        'VERTEX_SHADER.LOW_FLOAT.rangeMax',
        'VERTEX_SHADER.LOW_FLOAT.rangeMin',
        'VERTEX_SHADER.MEDIUM_FLOAT.precision',
        'VERTEX_SHADER.MEDIUM_FLOAT.rangeMax',
        'VERTEX_SHADER.MEDIUM_FLOAT.rangeMin',
    ]);
    const safeParameters = Object.keys(parameters).reduce((acc, curr) => {
        if (blocked.has(curr)) {
            return acc;
        }
        acc[curr] = parameters[curr];
        return acc;
    }, {});
    return safeParameters;
};
// system
const getOS = (userAgent) => {
    const os = (
    // order is important
    /windows phone/ig.test(userAgent) ? 'Windows Phone' :
        /win(dows|16|32|64|95|98|nt)|wow64/ig.test(userAgent) ? 'Windows' :
            /android/ig.test(userAgent) ? 'Android' :
                /cros/ig.test(userAgent) ? 'Chrome OS' :
                    /linux/ig.test(userAgent) ? 'Linux' :
                        /ipad/ig.test(userAgent) ? 'iPad' :
                            /iphone/ig.test(userAgent) ? 'iPhone' :
                                /ipod/ig.test(userAgent) ? 'iPod' :
                                    /ios/ig.test(userAgent) ? 'iOS' :
                                        /mac/ig.test(userAgent) ? 'Mac' :
                                            'Other');
    return os;
};
const decryptUserAgent = ({ ua, os, isBrave }) => {
    const apple = /ipad|iphone|ipod|ios|mac/ig.test(os);
    const isOpera = /OPR\//g.test(ua);
    const isVivaldi = /Vivaldi/g.test(ua);
    const isDuckDuckGo = /DuckDuckGo/g.test(ua);
    const isYandex = /YaBrowser/g.test(ua);
    const paleMoon = ua.match(/(palemoon)\/(\d+)./i);
    const edge = ua.match(/(edgios|edg|edge|edga)\/(\d+)./i);
    const edgios = edge && /edgios/i.test(edge[1]);
    const chromium = ua.match(/(crios|chrome)\/(\d+)./i);
    const firefox = ua.match(/(fxios|firefox)\/(\d+)./i);
    const likeSafari = (/AppleWebKit/g.test(ua) &&
        /Safari/g.test(ua));
    const safari = (likeSafari &&
        !firefox &&
        !chromium &&
        !edge &&
        ua.match(/(version)\/(\d+)\.(\d|\.)+\s(mobile|safari)/i));
    if (chromium) {
        const browser = chromium[1];
        const version = chromium[2];
        const like = (isOpera ? ' Opera' :
            isVivaldi ? ' Vivaldi' :
                isDuckDuckGo ? ' DuckDuckGo' :
                    isYandex ? ' Yandex' :
                        edge ? ' Edge' :
                            isBrave ? ' Brave' : '');
        return `${browser} ${version}${like}`;
    }
    else if (edgios) {
        const browser = edge[1];
        const version = edge[2];
        return `${browser} ${version}`;
    }
    else if (firefox) {
        const browser = paleMoon ? paleMoon[1] : firefox[1];
        const version = paleMoon ? paleMoon[2] : firefox[2];
        return `${browser} ${version}`;
    }
    else if (apple && safari) {
        const browser = 'Safari';
        const version = safari[2];
        return `${browser} ${version}`;
    }
    return 'unknown';
};
const getUserAgentPlatform = ({ userAgent, excludeBuild = true }) => {
    if (!userAgent) {
        return 'unknown';
    }
    // patterns
    const nonPlatformParenthesis = /\((khtml|unlike|vizio|like gec|internal dummy|org\.eclipse|openssl|ipv6|via translate|safari|cardamon).+|xt\d+\)/ig;
    const parenthesis = /\((.+)\)/;
    const android = /((android).+)/i;
    const androidNoise = /^(linux|[a-z]|wv|mobile|[a-z]{2}(-|_)[a-z]{2}|[a-z]{2})$|windows|(rv:|trident|webview|iemobile).+/i;
    const androidBuild = /build\/.+\s|\sbuild\/.+/i;
    const androidRelease = /android( |-)\d+/i;
    const windows = /((windows).+)/i;
    const windowsNoise = /^(windows|ms(-|)office|microsoft|compatible|[a-z]|x64|[a-z]{2}(-|_)[a-z]{2}|[a-z]{2})$|(rv:|outlook|ms(-|)office|microsoft|trident|\.net|msie|httrack|media center|infopath|aol|opera|iemobile|webbrowser).+/i;
    const windows64bitCPU = /w(ow|in)64/i;
    const cros = /cros/i;
    const crosNoise = /^([a-z]|x11|[a-z]{2}(-|_)[a-z]{2}|[a-z]{2})$|(rv:|trident).+/i;
    const crosBuild = /\d+\.\d+\.\d+/i;
    const linux = /linux|x11|ubuntu|debian/i;
    const linuxNoise = /^([a-z]|x11|unknown|compatible|[a-z]{2}(-|_)[a-z]{2}|[a-z]{2})$|(rv:|java|oracle|\+http|http|unknown|mozilla|konqueror|valve).+/i;
    const apple = /(cpu iphone|cpu os|iphone os|mac os|macos|intel os|ppc mac).+/i;
    const appleNoise = /^([a-z]|macintosh|compatible|mimic|[a-z]{2}(-|_)[a-z]{2}|[a-z]{2}|rv|\d+\.\d+)$|(rv:|silk|valve).+/i;
    const appleRelease = /(ppc |intel |)(mac|mac |)os (x |x|)(\d{2}(_|\.)\d{1,2}|\d{2,})/i;
    const otherOS = /((symbianos|nokia|blackberry|morphos|mac).+)|\/linux|freebsd|symbos|series \d+|win\d+|unix|hp-ux|bsdi|bsd|x86_64/i;
    const isDevice = (list, device) => list.filter((x) => device.test(x)).length;
    userAgent = userAgent.trim().replace(/\s{2,}/, ' ').replace(nonPlatformParenthesis, '');
    if (parenthesis.test(userAgent)) {
        const platformSection = userAgent.match(parenthesis)[0];
        const identifiers = platformSection.slice(1, -1).replace(/,/g, ';').split(';').map((x) => x.trim());
        if (isDevice(identifiers, android)) {
            return identifiers
                // @ts-ignore
                .map((x) => androidRelease.test(x) ? androidRelease.exec(x)[0].replace('-', ' ') : x)
                .filter((x) => !(androidNoise.test(x)))
                .join(' ')
                .replace((excludeBuild ? androidBuild : ''), '')
                .trim().replace(/\s{2,}/, ' ');
        }
        else if (isDevice(identifiers, windows)) {
            return identifiers
                .filter((x) => !(windowsNoise.test(x)))
                .join(' ')
                .replace(/\sNT (\d+\.\d+)/, (match, version) => {
                return (version == '10.0' ? ' 10' :
                    version == '6.3' ? ' 8.1' :
                        version == '6.2' ? ' 8' :
                            version == '6.1' ? ' 7' :
                                version == '6.0' ? ' Vista' :
                                    version == '5.2' ? ' XP Pro' :
                                        version == '5.1' ? ' XP' :
                                            version == '5.0' ? ' 2000' :
                                                version == '4.0' ? match :
                                                    ' ' + version);
            })
                .replace(windows64bitCPU, '(64-bit)')
                .trim().replace(/\s{2,}/, ' ');
        }
        else if (isDevice(identifiers, cros)) {
            return identifiers
                .filter((x) => !(crosNoise.test(x)))
                .join(' ')
                .replace((excludeBuild ? crosBuild : ''), '')
                .trim().replace(/\s{2,}/, ' ');
        }
        else if (isDevice(identifiers, linux)) {
            return identifiers
                .filter((x) => !(linuxNoise.test(x)))
                .join(' ')
                .trim().replace(/\s{2,}/, ' ');
        }
        else if (isDevice(identifiers, apple)) {
            return identifiers
                .map((x) => {
                if (appleRelease.test(x)) {
                    // @ts-ignore
                    const release = appleRelease.exec(x)[0];
                    const versionMap = {
                        '10_7': 'Lion',
                        '10_8': 'Mountain Lion',
                        '10_9': 'Mavericks',
                        '10_10': 'Yosemite',
                        '10_11': 'El Capitan',
                        '10_12': 'Sierra',
                        '10_13': 'High Sierra',
                        '10_14': 'Mojave',
                        '10_15': 'Catalina',
                        '11': 'Big Sur',
                        '12': 'Monterey',
                    };
                    const version = ((/(\d{2}(_|\.)\d{1,2}|\d{2,})/.exec(release) || [])[0] ||
                        '').replace(/\./g, '_');
                    const isOSX = /^10/.test(version);
                    const id = isOSX ? version : (/^\d{2,}/.exec(version) || [])[0];
                    const codeName = versionMap[id];
                    return codeName ? `macOS ${codeName}` : release;
                }
                return x;
            })
                .filter((x) => !(appleNoise.test(x)))
                .join(' ')
                .replace(/\slike mac.+/ig, '')
                .trim().replace(/\s{2,}/, ' ');
        }
        else {
            const other = identifiers.filter((x) => otherOS.test(x));
            if (other.length) {
                return other.join(' ').trim().replace(/\s{2,}/, ' ');
            }
            return identifiers.join(' ');
        }
    }
    else {
        return 'unknown';
    }
};
const computeWindowsRelease = ({ platform, platformVersion, fontPlatformVersion }) => {
    const chrome95Features = (IS_BLINK &&
        CSS.supports('contain-intrinsic-width', 'initial'));
    if ((platform != 'Windows') || !chrome95Features) {
        return;
    }
    const platformVersionNumber = +(/(\d+)\./.exec(platformVersion) || [])[1];
    // https://github.com/WICG/ua-client-hints/issues/220#issuecomment-870858413
    const release = {
        0: '7/8/8.1',
        1: '10 (1507)',
        2: '10 (1511)',
        3: '10 (1607)',
        4: '10 (1703)',
        5: '10 (1709)',
        6: '10 (1803)',
        7: '10 (1809)',
        8: '10 (1903|1909)',
        10: '10 (2004|20H2|21H1)',
    };
    const oldFontPlatformVersionNumber = (/7|8\.1|8/.exec(fontPlatformVersion) || [])[0];
    const version = (platformVersionNumber >= 13 ? '11' :
        platformVersionNumber == 0 && oldFontPlatformVersionNumber ? oldFontPlatformVersionNumber :
            (release[platformVersionNumber] || 'Unknown'));
    return (`Windows ${version} [${platformVersion}]`);
};
// attempt windows 11 userAgent
const attemptWindows11UserAgent = ({ userAgent, userAgentData, fontPlatformVersion }) => {
    const { platformVersion, platform } = userAgentData || {};
    // @ts-ignore
    const windowsRelease = computeWindowsRelease({ platform, platformVersion });
    return (/Windows 11/.test('' + windowsRelease) || /Windows 11/.test(fontPlatformVersion) ?
        ('' + userAgent).replace('Windows NT 10.0', 'Windows 11') :
        userAgent);
};
// attempt restore from User-Agent Reduction
const isUAPostReduction = (userAgent) => {
    const matcher = /Mozilla\/5\.0 \((Macintosh; Intel Mac OS X 10_15_7|Windows NT 10\.0; Win64; x64|(X11; (CrOS|Linux) x86_64)|(Linux; Android 10(; K|)))\) AppleWebKit\/537\.36 \(KHTML, like Gecko\) Chrome\/\d+\.0\.0\.0( Mobile|) Safari\/537\.36/;
    const unifiedPlatform = (matcher.exec(userAgent) || [])[1];
    return IS_BLINK && !!unifiedPlatform;
};
const getUserAgentRestored = ({ userAgent, userAgentData, fontPlatformVersion }) => {
    if (!userAgentData /* || !isUAPostReduction(userAgent)*/) {
        return;
    }
    const { brands, uaFullVersion, platformVersion, model: deviceModel, bitness } = userAgentData;
    const isGoogleChrome = (/X11; CrOS/.test(userAgent) ||
        !!(brands || []).find((x) => x == 'Google Chrome'));
    const versionNumber = +(/(\d+)\./.exec(platformVersion) || [])[1];
    const windowsFontVersion = (/8\.1|8|7/.exec(fontPlatformVersion) || [])[0];
    const windowsVersion = (versionNumber >= 13 ? '11' :
        versionNumber == 0 ? (windowsFontVersion || '7/8/8.1') : '10');
    const windowsVersionMap = {
        '7': 'NT 6.1',
        '8': 'NT 6.2',
        '8.1': 'NT 6.3',
        '10': 'NT 10.0',
    };
    const macVersion = platformVersion.replace(/\./g, '_');
    const userAgentRestored = userAgent
        .replace(/(Chrome\/)([^\s]+)/, (match, p1, p2) => `${p1}${isGoogleChrome ? uaFullVersion : p2}`)
        .replace(/Windows NT 10.0/, `Windows ${windowsVersionMap[windowsVersion] || windowsVersion}`)
        .replace(/(X11; CrOS x86_64)/, (match, p1) => `${p1} ${platformVersion}`)
        .replace(/(Linux; Android )(10)(; K|)/, (match, p1, p2, p3) => {
        return `${p1}${versionNumber}${!p3 ? '' : deviceModel ? `; ${deviceModel}` : '; K'}`;
    })
        .replace(/(Macintosh; Intel Mac OS X )(10_15_7)/, (match, p1) => {
        const isOSX = /^10/.test(macVersion);
        return `${isOSX ? p1 : p1.replace('X ', '')}${macVersion}`;
    })
        .replace(/(; Win64; x64| x86_64)/, (match, p1) => bitness === '64' ? p1 : '');
    return userAgentRestored;
};
const createPerformanceLogger = () => {
    const log = {};
    let total = 0;
    return {
        logTestResult: ({ test, passed, time = 0 }) => {
            total += time;
            const timeString = `${time.toFixed(2)}ms`;
            log[test] = timeString;
            const color = passed ? '#4cca9f' : 'lightcoral';
            const result = passed ? 'passed' : 'failed';
            const symbol = passed ? '✔' : '-';
            return console.log(`%c${symbol}${time ? ` (${timeString})` : ''} ${test} ${result}`, `color:${color}`);
        },
        getLog: () => log,
        getTotal: () => total,
    };
};
const performanceLogger = createPerformanceLogger();
const { logTestResult } = performanceLogger;
const createTimer = () => {
    let start = 0;
    const log = [];
    return {
        stop: () => {
            if (start) {
                log.push(performance.now() - start);
                return log.reduce((acc, n) => acc += n, 0);
            }
            return start;
        },
        start: () => {
            start = performance.now();
            return start;
        },
    };
};
const queueEvent = (timer, delay = 0) => {
    timer.stop();
    return new Promise((resolve) => setTimeout(() => resolve(timer.start()), delay))
        .catch((e) => { });
};
const formatEmojiSet = (emojiSet, limit = 3) => {
    const maxLen = (limit * 2) + 3;
    const list = (emojiSet || []);
    return list.length > maxLen ? `${emojiSet.slice(0, limit).join('')}...${emojiSet.slice(-limit).join('')}` :
        list.join('');
};
const EMOJIS = [
    [128512], [9786], [129333, 8205, 9794, 65039], [9832], [9784], [9895], [8265], [8505], [127987, 65039, 8205, 9895, 65039], [129394], [9785], [9760], [129489, 8205, 129456], [129487, 8205, 9794, 65039], [9975], [129489, 8205, 129309, 8205, 129489], [9752], [9968], [9961], [9972], [9992], [9201], [9928], [9730], [9969], [9731], [9732], [9976], [9823], [9937], [9000], [9993], [9999],
    [128105, 8205, 10084, 65039, 8205, 128139, 8205, 128104],
    [128104, 8205, 128105, 8205, 128103, 8205, 128102],
    [128104, 8205, 128105, 8205, 128102],
    // android 11
    [128512],
    [169], [174], [8482],
    [128065, 65039, 8205, 128488, 65039],
    // other
    [10002], [9986], [9935], [9874], [9876], [9881], [9939], [9879], [9904], [9905], [9888], [9762], [9763], [11014], [8599], [10145], [11013], [9883], [10017], [10013], [9766], [9654], [9197], [9199], [9167], [9792], [9794], [10006], [12336], [9877], [9884], [10004], [10035], [10055], [9724], [9642], [10083], [10084], [9996], [9757], [9997], [10052], [9878], [8618], [9775], [9770], [9774], [9745], [10036], [127344], [127359],
].map((emojiCode) => String.fromCodePoint(...emojiCode));
const CSS_FONT_FAMILY = `
	'Segoe Fluent Icons',
	'Ink Free',
	'Bahnschrift',
	'Segoe MDL2 Assets',
	'HoloLens MDL2 Assets',
	'Leelawadee UI',
	'Javanese Text',
	'Segoe UI Emoji',
	'Aldhabi',
	'Gadugi',
	'Myanmar Text',
	'Nirmala UI',
	'Lucida Console',
	'Cambria Math',
	'Galvji',
	'MuktaMahee Regular',
	'InaiMathi Bold',
	'American Typewriter Semibold',
	'Futura Bold',
	'SignPainter-HouseScript Semibold',
	'PingFang HK Light',
	'Kohinoor Devanagari Medium',
	'Luminari',
	'Geneva',
	'Helvetica Neue',
	'Droid Sans Mono',
	'Dancing Script',
	'Roboto',
	'Ubuntu',
	'Liberation Mono',
	'Source Code Pro',
	'DejaVu Sans',
	'OpenSymbol',
	'Chilanka',
	'Cousine',
	'Arimo',
	'Jomolhari',
	'MONO',
	'Noto Color Emoji',
	sans-serif !important
`;
const hashSlice = (x) => !x ? x : x.slice(0, 8);

// template views
const patch = (oldEl, newEl, fn) => {
    oldEl.parentNode.replaceChild(newEl, oldEl);
    return typeof fn === 'function' ? fn() : true;
};
const html = (str, ...expressionSet) => {
    const template = document.createElement('template');
    template.innerHTML = str.map((s, i) => `${s}${expressionSet[i] || ''}`).join('');
    return document.importNode(template.content, true);
};
// template helpers
const HTMLNote = {
    UNKNOWN: '<span class="blocked">unknown</span>',
    UNSUPPORTED: '<span class="blocked">unsupported</span>',
    BLOCKED: '<span class="blocked">blocked</span>',
    LIED: '<span class="lies">lied</span>',
};
const count = (arr) => arr && arr.constructor.name === 'Array' ? '' + (arr.length) : '0';
const getDiffs = ({ stringA, stringB, charDiff = false, decorate = (diff) => `[${diff}]` }) => {
    const splitter = charDiff ? '' : ' ';
    const listA = ('' + stringA).split(splitter);
    const listB = ('' + stringB).split(splitter);
    const listBWithDiffs = listB.map((x, i) => {
        const matcher = listA[i];
        const match = x == matcher;
        return !match ? decorate(x) : x;
    });
    return listBWithDiffs.join(splitter);
};
// modal component
const modal = (name, result, linkname = 'details') => {
    if (!result.length) {
        return '';
    }
    return `
		<style>
		.modal-${name}:checked ~ .modal-container {
			visibility: visible;
			opacity: 1;
			animation: show 0.1s linear both;
		}
		.modal-${name}:checked ~ .modal-container .modal-content {
			animation: enter 0.2s ease both
		}
		.modal-${name}:not(:checked) ~ .modal-container {
			visibility: hidden;
		}
		</style>
		<input type="radio" id="toggle-open-${name}" class="modal-${name}" name="modal-${name}"/>
		<label class="modal-open-btn" for="toggle-open-${name}" onclick="">${linkname}</label>
		<label class="modal-container" for="toggle-close-${name}" onclick="">
			<label class="modal-content" for="toggle-open-${name}" onclick="">
				<input type="radio" id="toggle-close-${name}" name="modal-${name}"/>
				<label class="modal-close-btn" for="toggle-close-${name}" onclick="">×</label>
				<div>${result}</div>
			</label>
		</label>
	`;
};

const createErrorsCaptured = () => {
    const errors = [];
    return {
        getErrors: () => errors,
        captureError: (error, customMessage = '') => {
            const type = {
                Error: true,
                EvalError: true,
                InternalError: true,
                RangeError: true,
                ReferenceError: true,
                SyntaxError: true,
                TypeError: true,
                URIError: true,
                InvalidStateError: true,
                SecurityError: true,
            };
            const hasInnerSpace = (s) => /.+(\s).+/g.test(s); // ignore AOPR noise
            console.error(error); // log error to educate
            const { name, message } = error;
            const trustedMessage = (!hasInnerSpace(message) ? undefined :
                !customMessage ? message :
                    `${message} [${customMessage}]`);
            const trustedName = type[name] ? name : undefined;
            errors.push({ trustedName, trustedMessage });
            return undefined;
        },
    };
};
const errorsCaptured = createErrorsCaptured();
const { captureError } = errorsCaptured;
const attempt = (fn, customMessage = '') => {
    try {
        return fn();
    }
    catch (error) {
        if (customMessage) {
            return captureError(error, customMessage);
        }
        return captureError(error);
    }
};
const caniuse = (fn, objChainList = [], args = [], method = false) => {
    let api;
    try {
        api = fn();
    }
    catch (error) {
        return undefined;
    }
    let i;
    const len = objChainList.length;
    let chain = api;
    try {
        for (i = 0; i < len; i++) {
            const obj = objChainList[i];
            chain = chain[obj];
        }
    }
    catch (error) {
        return undefined;
    }
    return (method && args.length ? chain.apply(api, args) :
        method && !args.length ? chain.apply(api) :
            chain);
};
// Log performance time
const timer = (logStart) => {
    logStart && console.log(logStart);
    let start = 0;
    try {
        start = performance.now();
    }
    catch (error) {
        captureError(error);
    }
    return (logEnd) => {
        let end = 0;
        try {
            end = performance.now() - start;
            logEnd && console.log(`${logEnd}: ${end / 1000} seconds`);
            return end;
        }
        catch (error) {
            captureError(error);
            return 0;
        }
    };
};
const getCapturedErrors = () => ({ data: errorsCaptured.getErrors() });
const errorsHTML = (fp, pointsHTML) => {
    const { capturedErrors: { data, $hash } } = fp;
    const len = data.length;
    return `
	<div class="${len ? ' errors' : ''}">errors (${!len ? '0' : '' + len}): ${!len ? 'none' : modal('creep-captured-errors', Object.keys(data)
        .map((key, i) => `${i + 1}: ${data[key].trustedName} - ${data[key].trustedMessage} `)
        .join('<br>'), hashSlice($hash))}${pointsHTML}</div>`;
};

// warm up while we detect lies
try {
    navigator.mediaDevices.enumerateDevices();
}
catch (err) { }
try {
    speechSynthesis.getVoices();
}
catch (err) { }
// Collect lies detected
const createLieRecords = () => {
    const records = {};
    return {
        getRecords: () => records,
        documentLie: (name, lie) => {
            const isArray = lie instanceof Array;
            if (records[name]) {
                if (isArray) {
                    return (records[name] = [...records[name], ...lie]);
                }
                return records[name].push(lie);
            }
            return isArray ? (records[name] = lie) : (records[name] = [lie]);
        },
    };
};
const lieRecords = createLieRecords();
const { documentLie } = lieRecords;
const ghost = () => `
	height: 100vh;
	width: 100vw;
	position: absolute;
	left:-10000px;
	visibility: hidden;
`;
const getRandomValues = () => (String.fromCharCode(Math.random() * 26 + 97) +
    Math.random().toString(36).slice(-7));
const getBehemothIframe = (win) => {
    try {
        if (!IS_BLINK) {
            return win;
        }
        const div = win.document.createElement('div');
        div.setAttribute('id', getRandomValues());
        div.setAttribute('style', ghost());
        div.innerHTML = `<div><iframe></iframe></div>`;
        win.document.body.appendChild(div);
        const iframe = [...[...div.childNodes][0].childNodes][0];
        if (!iframe) {
            return;
        }
        const { contentWindow } = iframe || {};
        const div2 = contentWindow.document.createElement('div');
        div2.innerHTML = `<div><iframe></iframe></div>`;
        contentWindow.document.body.appendChild(div2);
        const iframe2 = [...[...div2.childNodes][0].childNodes][0];
        return iframe2.contentWindow;
    }
    catch (error) {
        captureError(error, 'client blocked behemoth iframe');
        return win;
    }
};
const getPhantomIframe = () => {
    try {
        const numberOfIframes = window.length;
        const frag = new DocumentFragment();
        const div = document.createElement('div');
        const id = getRandomValues();
        div.setAttribute('id', id);
        frag.appendChild(div);
        div.innerHTML = `<div style="${ghost()}"><iframe></iframe></div>`;
        document.body.appendChild(frag);
        const iframeWindow = window[numberOfIframes];
        const phantomWindow = getBehemothIframe(iframeWindow);
        return { iframeWindow: phantomWindow, div };
    }
    catch (error) {
        captureError(error, 'client blocked phantom iframe');
        return { iframeWindow: window, div: undefined };
    }
};
const { iframeWindow: PHANTOM_DARKNESS, div: PARENT_PHANTOM } = getPhantomIframe();
function getPrototypeLies(scope) {
    const getRandomValues = () => (String.fromCharCode(Math.random() * 26 + 97) +
        Math.random().toString(36).slice(-7));
    const randomId = getRandomValues();
    // Lie Tests
    // object constructor descriptor should return undefined properties
    const getUndefinedValueLie = (obj, name) => {
        const objName = obj.name;
        const objNameUncapitalized = self[objName.charAt(0).toLowerCase() + objName.slice(1)];
        const hasInvalidValue = !!objNameUncapitalized && (typeof Object.getOwnPropertyDescriptor(objNameUncapitalized, name) != 'undefined' ||
            typeof Reflect.getOwnPropertyDescriptor(objNameUncapitalized, name) != 'undefined');
        return hasInvalidValue;
    };
    // accessing the property from the prototype should throw a TypeError
    const getIllegalTypeErrorLie = (obj, name) => {
        const proto = obj.prototype;
        try {
            proto[name];
            return true;
        }
        catch (error) {
            return error.constructor.name != 'TypeError' ? true : false;
        }
    };
    // calling the interface prototype on the function should throw a TypeError
    const getCallInterfaceTypeErrorLie = (apiFunction, proto) => {
        try {
            // eslint-disable-next-line new-cap
            new apiFunction();
            apiFunction.call(proto);
            return true;
        }
        catch (error) {
            return error.constructor.name != 'TypeError';
        }
    };
    // applying the interface prototype on the function should throw a TypeError
    const getApplyInterfaceTypeErrorLie = (apiFunction, proto) => {
        try {
            // eslint-disable-next-line new-cap
            new apiFunction();
            apiFunction.apply(proto);
            return true;
        }
        catch (error) {
            return error.constructor.name != 'TypeError';
        }
    };
    // creating a new instance of the function should throw a TypeError
    const getNewInstanceTypeErrorLie = (apiFunction) => {
        try {
            // eslint-disable-next-line new-cap
            new apiFunction();
            return true;
        }
        catch (error) {
            return error.constructor.name != 'TypeError';
        }
    };
    // extending the function on a fake class should throw a TypeError and message "not a constructor"
    const getClassExtendsTypeErrorLie = (apiFunction) => {
        try {
            const shouldExitInSafari13 = (/version\/13/i.test((navigator || {}).userAgent) && IS_WEBKIT);
            if (shouldExitInSafari13) {
                return false;
            }
            // begin tests
            // eslint-disable-next-line no-unused-vars
            class Fake extends apiFunction {
            }
            return true;
        }
        catch (error) {
            // Native has TypeError and 'not a constructor' message in FF & Chrome
            return (error.constructor.name != 'TypeError' ||
                !/not a constructor/i.test(error.message));
        }
    };
    // setting prototype to null and converting to a string should throw a TypeError
    const getNullConversionTypeErrorLie = (apiFunction) => {
        const nativeProto = Object.getPrototypeOf(apiFunction);
        try {
            Object.setPrototypeOf(apiFunction, null) + '';
            return true;
        }
        catch (error) {
            return error.constructor.name != 'TypeError';
        }
        finally {
            // restore proto
            Object.setPrototypeOf(apiFunction, nativeProto);
        }
    };
    // toString() and toString.toString() should return a native string in all frames
    const getToStringLie = (apiFunction, name, scope) => {
        /*
        Accepted strings:
        'function name() { [native code] }'
        'function name() {\n    [native code]\n}'
        'function get name() { [native code] }'
        'function get name() {\n    [native code]\n}'
        'function () { [native code] }'
        `function () {\n    [native code]\n}`
        */
        let scopeToString;
        let scopeToStringToString;
        try {
            scopeToString = scope.Function.prototype.toString.call(apiFunction);
        }
        catch (e) { }
        try {
            scopeToStringToString = scope.Function.prototype.toString.call(apiFunction.toString);
        }
        catch (e) { }
        const apiFunctionToString = (scopeToString ?
            scopeToString :
            apiFunction.toString());
        const apiFunctionToStringToString = (scopeToStringToString ?
            scopeToStringToString :
            apiFunction.toString.toString());
        const trust = (name) => ({
            [`function ${name}() { [native code] }`]: true,
            [`function get ${name}() { [native code] }`]: true,
            [`function () { [native code] }`]: true,
            [`function ${name}() {${'\n'}    [native code]${'\n'}}`]: true,
            [`function get ${name}() {${'\n'}    [native code]${'\n'}}`]: true,
            [`function () {${'\n'}    [native code]${'\n'}}`]: true,
        });
        return (!trust(name)[apiFunctionToString] ||
            !trust('toString')[apiFunctionToStringToString]);
    };
    // "prototype" in function should not exist
    const getPrototypeInFunctionLie = (apiFunction) => 'prototype' in apiFunction;
    // "arguments", "caller", "prototype", "toString"  should not exist in descriptor
    const getDescriptorLie = (apiFunction) => {
        const hasInvalidDescriptor = (Object.getOwnPropertyDescriptor(apiFunction, 'arguments') ||
            Reflect.getOwnPropertyDescriptor(apiFunction, 'arguments') ||
            Object.getOwnPropertyDescriptor(apiFunction, 'caller') ||
            Reflect.getOwnPropertyDescriptor(apiFunction, 'caller') ||
            Object.getOwnPropertyDescriptor(apiFunction, 'prototype') ||
            Reflect.getOwnPropertyDescriptor(apiFunction, 'prototype') ||
            Object.getOwnPropertyDescriptor(apiFunction, 'toString') ||
            Reflect.getOwnPropertyDescriptor(apiFunction, 'toString'));
        return hasInvalidDescriptor;
    };
    // "arguments", "caller", "prototype", "toString" should not exist as own property
    const getOwnPropertyLie = (apiFunction) => {
        const hasInvalidOwnProperty = (apiFunction.hasOwnProperty('arguments') ||
            apiFunction.hasOwnProperty('caller') ||
            apiFunction.hasOwnProperty('prototype') ||
            apiFunction.hasOwnProperty('toString'));
        return hasInvalidOwnProperty;
    };
    // descriptor keys should only contain "name" and "length"
    const getDescriptorKeysLie = (apiFunction) => {
        const descriptorKeys = Object.keys(Object.getOwnPropertyDescriptors(apiFunction));
        const hasInvalidKeys = '' + descriptorKeys != 'length,name' && '' + descriptorKeys != 'name,length';
        return hasInvalidKeys;
    };
    // own property names should only contain "name" and "length"
    const getOwnPropertyNamesLie = (apiFunction) => {
        const ownPropertyNames = Object.getOwnPropertyNames(apiFunction);
        const hasInvalidNames = !('' + ownPropertyNames == 'length,name' ||
            '' + ownPropertyNames == 'name,length');
        return hasInvalidNames;
    };
    // own keys names should only contain "name" and "length"
    const getOwnKeysLie = (apiFunction) => {
        const ownKeys = Reflect.ownKeys(apiFunction);
        const hasInvalidKeys = !('' + ownKeys == 'length,name' ||
            '' + ownKeys == 'name,length');
        return hasInvalidKeys;
    };
    // calling toString() on an object created from the function should throw a TypeError
    const getNewObjectToStringTypeErrorLie = (apiFunction) => {
        try {
            const you = () => Object.create(apiFunction).toString();
            const cant = () => you();
            const hide = () => cant();
            hide();
            // error must throw
            return true;
        }
        catch (error) {
            const stackLines = error.stack.split('\n');
            const validScope = !/at Object\.apply/.test(stackLines[1]);
            // Stack must be valid
            const validStackSize = (error.constructor.name == 'TypeError' && stackLines.length >= 5);
            // Chromium must throw error 'at Function.toString'... and not 'at Object.apply'
            if (validStackSize && IS_BLINK && (!validScope ||
                !/at Function\.toString/.test(stackLines[1]) ||
                !/at you/.test(stackLines[2]) ||
                !/at cant/.test(stackLines[3]) ||
                !/at hide/.test(stackLines[4]))) {
                return true;
            }
            return !validStackSize;
        }
    };
    /* Proxy Detection */
    // arguments or caller should not throw 'incompatible Proxy' TypeError
    const tryIncompatibleProxy = (fn) => {
        try {
            fn();
            return true; // failed to throw
        }
        catch (error) {
            return (error.constructor.name != 'TypeError' ||
                (IS_GECKO && /incompatible\sProxy/.test(error.message)));
        }
    };
    const getIncompatibleProxyTypeErrorLie = (apiFunction) => {
        return (tryIncompatibleProxy(() => apiFunction.arguments) ||
            tryIncompatibleProxy(() => apiFunction.caller));
    };
    const getToStringIncompatibleProxyTypeErrorLie = (apiFunction) => {
        return (tryIncompatibleProxy(() => apiFunction.toString.arguments) ||
            tryIncompatibleProxy(() => apiFunction.toString.caller));
    };
    // checking proxy instanceof proxy should throw a valid TypeError
    const getInstanceofCheckLie = (apiFunction) => {
        const proxy = new Proxy(apiFunction, {});
        if (!IS_BLINK) {
            return false;
        }
        const hasValidStack = (error, type = 'Function') => {
            const { message, name, stack } = error;
            const validName = name == 'TypeError';
            const validMessage = message == `Function has non-object prototype 'undefined' in instanceof check`;
            const targetStackLine = ((stack || '').split('\n') || [])[1];
            const validStackLine = (targetStackLine.startsWith(`    at ${type}.[Symbol.hasInstance]`) ||
                targetStackLine.startsWith('    at [Symbol.hasInstance]') // Chrome 102
            );
            return validName && validMessage && validStackLine;
        };
        try {
            proxy instanceof proxy;
            return true; // failed to throw
        }
        catch (error) {
            // expect Proxy.[Symbol.hasInstance]
            if (!hasValidStack(error, 'Proxy')) {
                return true;
            }
            try {
                apiFunction instanceof apiFunction;
                return true; // failed to throw
            }
            catch (error) {
                // expect Function.[Symbol.hasInstance]
                return !hasValidStack(error);
            }
        }
    };
    // defining properties should not throw an error
    const getDefinePropertiesLie = (apiFunction) => {
        if (!IS_BLINK) {
            return false; // chrome only test
        }
        try {
            const _apiFunction = apiFunction;
            Object.defineProperty(_apiFunction, '', {}) + '';
            Object.defineProperties(_apiFunction, {}) + '';
            return false;
        }
        catch (error) {
            return true; // failed at Error
        }
    };
    // setPrototypeOf error tests
    const spawnError = (apiFunction, method) => {
        if (method == 'setPrototypeOf') {
            return Object.setPrototypeOf(apiFunction, Object.create(apiFunction)) + '';
        }
        else {
            apiFunction.__proto__ = apiFunction;
            return apiFunction++;
        }
    };
    const hasValidError = (error) => {
        const { name, message } = error;
        const hasRangeError = name == 'RangeError';
        const hasInternalError = name == 'InternalError';
        const chromeLie = IS_BLINK && (message != `Maximum call stack size exceeded` || !hasRangeError);
        const firefoxLie = IS_GECKO && (message != `too much recursion` || !hasInternalError);
        return (hasRangeError || hasInternalError) && !(chromeLie || firefoxLie);
    };
    const getTooMuchRecursionLie = ({ apiFunction, method = 'setPrototypeOf' }) => {
        const nativeProto = Object.getPrototypeOf(apiFunction);
        const proxy = new Proxy(apiFunction, {});
        try {
            spawnError(proxy, method);
            return true; // failed to throw
        }
        catch (error) {
            return !hasValidError(error);
        }
        finally {
            Object.setPrototypeOf(proxy, nativeProto); // restore
        }
    };
    const getChainCycleLie = ({ apiFunction, method = 'setPrototypeOf' }) => {
        const nativeProto = Object.getPrototypeOf(apiFunction);
        try {
            spawnError(apiFunction, method);
            return true; // failed to throw
        }
        catch (error) {
            const { name, message, stack } = error;
            const targetStackLine = ((stack || '').split('\n') || [])[1];
            const hasTypeError = name == 'TypeError';
            const chromeLie = IS_BLINK && (message != `Cyclic __proto__ value` || (method == '__proto__' && (!targetStackLine.startsWith(`    at Function.set __proto__ [as __proto__]`) &&
                !targetStackLine.startsWith(`    at set __proto__ [as __proto__]`) // Chrome 102
            )));
            const firefoxLie = IS_GECKO && (message != `can't set prototype: it would cause a prototype chain cycle`);
            if (!hasTypeError || chromeLie || firefoxLie) {
                return true; // failed Error
            }
        }
        finally {
            Object.setPrototypeOf(apiFunction, nativeProto); // restore
        }
    };
    const getReflectSetProtoLie = ({ apiFunction, randomId }) => {
        if (!randomId) {
            randomId = getRandomValues();
        }
        const nativeProto = Object.getPrototypeOf(apiFunction);
        try {
            if (Reflect.setPrototypeOf(apiFunction, Object.create(apiFunction))) {
                return true; // failed value (expected false)
            }
            else {
                try {
                    randomId in apiFunction;
                    return false;
                }
                catch (error) {
                    return true; // failed at Error
                }
            }
        }
        catch (error) {
            return true; // failed at Error
        }
        finally {
            Object.setPrototypeOf(apiFunction, nativeProto); // restore
        }
    };
    const getReflectSetProtoProxyLie = ({ apiFunction, randomId }) => {
        if (!randomId) {
            randomId = getRandomValues();
        }
        const nativeProto = Object.getPrototypeOf(apiFunction);
        const proxy = new Proxy(apiFunction, {});
        try {
            if (!Reflect.setPrototypeOf(proxy, Object.create(proxy))) {
                return true; // failed value (expected true)
            }
            else {
                try {
                    randomId in apiFunction;
                    return true; // failed to throw
                }
                catch (error) {
                    return !hasValidError(error);
                }
            }
        }
        catch (error) {
            return true; // failed at Error
        }
        finally {
            Object.setPrototypeOf(proxy, nativeProto); // restore
        }
    };
    // API Function Test
    const getLies = ({ apiFunction, proto, obj = null, lieProps }) => {
        if (typeof apiFunction != 'function') {
            return {
                lied: false,
                lieTypes: [],
            };
        }
        const name = apiFunction.name.replace(/get\s/, '');
        let lies = {
            // custom lie string names
            [`failed illegal error`]: obj ? getIllegalTypeErrorLie(obj, name) : false,
            [`failed undefined properties`]: obj ? getUndefinedValueLie(obj, name) : false,
            [`failed call interface error`]: getCallInterfaceTypeErrorLie(apiFunction, proto),
            [`failed apply interface error`]: getApplyInterfaceTypeErrorLie(apiFunction, proto),
            [`failed new instance error`]: getNewInstanceTypeErrorLie(apiFunction),
            [`failed class extends error`]: getClassExtendsTypeErrorLie(apiFunction),
            [`failed null conversion error`]: getNullConversionTypeErrorLie(apiFunction),
            [`failed toString`]: getToStringLie(apiFunction, name, scope),
            [`failed "prototype" in function`]: getPrototypeInFunctionLie(apiFunction),
            [`failed descriptor`]: getDescriptorLie(apiFunction),
            [`failed own property`]: getOwnPropertyLie(apiFunction),
            [`failed descriptor keys`]: getDescriptorKeysLie(apiFunction),
            [`failed own property names`]: getOwnPropertyNamesLie(apiFunction),
            [`failed own keys names`]: getOwnKeysLie(apiFunction),
            [`failed object toString error`]: getNewObjectToStringTypeErrorLie(apiFunction),
            // Proxy Detection
            [`failed at incompatible proxy error`]: getIncompatibleProxyTypeErrorLie(apiFunction),
            [`failed at toString incompatible proxy error`]: getToStringIncompatibleProxyTypeErrorLie(apiFunction),
            [`failed at too much recursion error`]: getChainCycleLie({ apiFunction }),
        };
        // conditionally use advanced detection
        const detectProxies = (name == 'toString' || !!lieProps['Function.toString']);
        if (detectProxies) {
            lies = Object.assign(Object.assign({}, lies), {
                // Advanced Proxy Detection
                [`failed at too much recursion __proto__ error`]: getChainCycleLie({ apiFunction, method: '__proto__' }), [`failed at chain cycle error`]: getTooMuchRecursionLie({ apiFunction }), [`failed at chain cycle __proto__ error`]: getTooMuchRecursionLie({ apiFunction, method: '__proto__' }), [`failed at reflect set proto`]: getReflectSetProtoLie({ apiFunction, randomId }), [`failed at reflect set proto proxy`]: getReflectSetProtoProxyLie({ apiFunction, randomId }), [`failed at instanceof check error`]: getInstanceofCheckLie(apiFunction), [`failed at define properties`]: getDefinePropertiesLie(apiFunction) });
        }
        const lieTypes = Object.keys(lies).filter((key) => !!lies[key]);
        return {
            lied: lieTypes.length,
            lieTypes,
        };
    };
    // Lie Detector
    const createLieDetector = () => {
        const isSupported = (obj) => typeof obj != 'undefined' && !!obj;
        const props = {}; // lie list and detail
        const propsSearched = []; // list of properties searched
        return {
            getProps: () => props,
            getPropsSearched: () => propsSearched,
            searchLies: (fn, { target = [], ignore = [], } = {}) => {
                let obj;
                // check if api is blocked or not supported
                try {
                    obj = fn();
                    if (!isSupported(obj)) {
                        return;
                    }
                }
                catch (error) {
                    return;
                }
                const interfaceObject = !!obj.prototype ? obj.prototype : obj;
                [...new Set([
                        ...Object.getOwnPropertyNames(interfaceObject),
                        ...Object.keys(interfaceObject), // backup
                    ])].sort().forEach((name) => {
                    const skip = (name == 'constructor' ||
                        (target.length && !new Set(target).has(name)) ||
                        (ignore.length && new Set(ignore).has(name)));
                    if (skip) {
                        return;
                    }
                    const objectNameString = /\s(.+)\]/;
                    const apiName = `${
                    // @ts-ignore
                    obj.name ? obj.name : objectNameString.test(obj) ? objectNameString.exec(obj)[1] : undefined}.${name}`;
                    propsSearched.push(apiName);
                    try {
                        const proto = obj.prototype ? obj.prototype : obj;
                        let res; // response from getLies
                        // search if function
                        try {
                            const apiFunction = proto[name]; // may trigger TypeError
                            if (typeof apiFunction == 'function') {
                                res = getLies({
                                    apiFunction: proto[name],
                                    proto,
                                    lieProps: props,
                                });
                                if (res.lied) {
                                    documentLie(apiName, res.lieTypes);
                                    return (props[apiName] = res.lieTypes);
                                }
                                return;
                            }
                            // since there is no TypeError and the typeof is not a function,
                            // handle invalid values and ingnore name, length, and constants
                            if (name != 'name' &&
                                name != 'length' &&
                                name[0] !== name[0].toUpperCase()) {
                                const lie = [`failed descriptor.value undefined`];
                                documentLie(apiName, lie);
                                return (props[apiName] = lie);
                            }
                        }
                        catch (error) { }
                        // else search getter function
                        // @ts-ignore
                        const getterFunction = Object.getOwnPropertyDescriptor(proto, name).get;
                        res = getLies({
                            apiFunction: getterFunction,
                            proto,
                            obj,
                            lieProps: props,
                        }); // send the obj for special tests
                        if (res.lied) {
                            documentLie(apiName, res.lieTypes);
                            return (props[apiName] = res.lieTypes);
                        }
                        return;
                    }
                    catch (error) {
                        const lie = `failed prototype test execution`;
                        documentLie(apiName, lie);
                        return (props[apiName] = [lie]);
                    }
                });
            },
        };
    };
    const lieDetector = createLieDetector();
    const { searchLies, } = lieDetector;
    // search lies: remove target to search all properties
    // test Function.toString first to determine the depth of the search
    searchLies(() => Function, {
        target: [
            'toString',
        ],
        ignore: [
            'caller',
            'arguments',
        ],
    });
    // other APIs
    searchLies(() => AnalyserNode);
    searchLies(() => AudioBuffer, {
        target: [
            'copyFromChannel',
            'getChannelData',
        ],
    });
    searchLies(() => BiquadFilterNode, {
        target: [
            'getFrequencyResponse',
        ],
    });
    searchLies(() => CanvasRenderingContext2D, {
        target: [
            'getImageData',
            'getLineDash',
            'isPointInPath',
            'isPointInStroke',
            'measureText',
            'quadraticCurveTo',
            'fillText',
            'strokeText',
            'font',
        ],
    });
    searchLies(() => CSSStyleDeclaration, {
        target: [
            'setProperty',
        ],
    });
    // @ts-ignore
    searchLies(() => CSS2Properties, {
        target: [
            'setProperty',
        ],
    });
    searchLies(() => Date, {
        target: [
            'getDate',
            'getDay',
            'getFullYear',
            'getHours',
            'getMinutes',
            'getMonth',
            'getTime',
            'getTimezoneOffset',
            'setDate',
            'setFullYear',
            'setHours',
            'setMilliseconds',
            'setMonth',
            'setSeconds',
            'setTime',
            'toDateString',
            'toJSON',
            'toLocaleDateString',
            'toLocaleString',
            'toLocaleTimeString',
            'toString',
            'toTimeString',
            'valueOf',
        ],
    });
    searchLies(() => Intl.DateTimeFormat, {
        target: [
            'format',
            'formatRange',
            'formatToParts',
            'resolvedOptions',
        ],
    });
    searchLies(() => Document, {
        target: [
            'createElement',
            'createElementNS',
            'getElementById',
            'getElementsByClassName',
            'getElementsByName',
            'getElementsByTagName',
            'getElementsByTagNameNS',
            'referrer',
            'write',
            'writeln',
        ],
        ignore: [
            // Firefox returns undefined on getIllegalTypeErrorLie test
            'onreadystatechange',
            'onmouseenter',
            'onmouseleave',
        ],
    });
    searchLies(() => DOMRect);
    searchLies(() => DOMRectReadOnly);
    searchLies(() => Element, {
        target: [
            'append',
            'appendChild',
            'getBoundingClientRect',
            'getClientRects',
            'insertAdjacentElement',
            'insertAdjacentHTML',
            'insertAdjacentText',
            'insertBefore',
            'prepend',
            'replaceChild',
            'replaceWith',
            'setAttribute',
        ],
    });
    searchLies(() => FontFace, {
        target: [
            'family',
            'load',
            'status',
        ],
    });
    searchLies(() => HTMLCanvasElement);
    searchLies(() => HTMLElement, {
        target: [
            'clientHeight',
            'clientWidth',
            'offsetHeight',
            'offsetWidth',
            'scrollHeight',
            'scrollWidth',
        ],
        ignore: [
            // Firefox returns undefined on getIllegalTypeErrorLie test
            'onmouseenter',
            'onmouseleave',
        ],
    });
    searchLies(() => HTMLIFrameElement, {
        target: [
            'contentDocument',
            'contentWindow',
        ],
    });
    searchLies(() => IntersectionObserverEntry, {
        target: [
            'boundingClientRect',
            'intersectionRect',
            'rootBounds',
        ],
    });
    searchLies(() => Math, {
        target: [
            'acos',
            'acosh',
            'asinh',
            'atan',
            'atan2',
            'atanh',
            'cbrt',
            'cos',
            'cosh',
            'exp',
            'expm1',
            'log',
            'log10',
            'log1p',
            'sin',
            'sinh',
            'sqrt',
            'tan',
            'tanh',
        ],
    });
    searchLies(() => MediaDevices, {
        target: [
            'enumerateDevices',
            'getDisplayMedia',
            'getUserMedia',
        ],
    });
    searchLies(() => Navigator, {
        target: [
            'appCodeName',
            'appName',
            'appVersion',
            'buildID',
            'connection',
            'deviceMemory',
            'getBattery',
            'getGamepads',
            'getVRDisplays',
            'hardwareConcurrency',
            'language',
            'languages',
            'maxTouchPoints',
            'mimeTypes',
            'oscpu',
            'platform',
            'plugins',
            'product',
            'productSub',
            'sendBeacon',
            'serviceWorker',
            'userAgent',
            'vendor',
            'vendorSub',
        ],
    });
    searchLies(() => Node, {
        target: [
            'appendChild',
            'insertBefore',
            'replaceChild',
        ],
    });
    // @ts-ignore
    searchLies(() => OffscreenCanvas, {
        target: [
            'convertToBlob',
            'getContext',
        ],
    });
    // @ts-ignore
    searchLies(() => OffscreenCanvasRenderingContext2D, {
        target: [
            'getImageData',
            'getLineDash',
            'isPointInPath',
            'isPointInStroke',
            'measureText',
            'quadraticCurveTo',
            'font',
        ],
    });
    searchLies(() => Range, {
        target: [
            'getBoundingClientRect',
            'getClientRects',
        ],
    });
    searchLies(() => Intl.RelativeTimeFormat, {
        target: [
            'resolvedOptions',
        ],
    });
    searchLies(() => Screen);
    searchLies(() => speechSynthesis, {
        target: [
            'getVoices',
        ],
    });
    searchLies(() => String, {
        target: [
            'fromCodePoint',
        ],
    });
    searchLies(() => SVGRect);
    searchLies(() => TextMetrics);
    searchLies(() => WebGLRenderingContext, {
        target: [
            'bufferData',
            'getParameter',
            'readPixels',
        ],
    });
    searchLies(() => WebGL2RenderingContext, {
        target: [
            'bufferData',
            'getParameter',
            'readPixels',
        ],
    });
    /* potential targets:
        RTCPeerConnection
        Plugin
        PluginArray
        MimeType
        MimeTypeArray
        Worker
        History
    */
    // return lies list and detail
    const props = lieDetector.getProps();
    const propsSearched = lieDetector.getPropsSearched();
    return {
        lieDetector,
        lieList: Object.keys(props).sort(),
        lieDetail: props,
        lieCount: Object.keys(props).reduce((acc, key) => acc + props[key].length, 0),
        propsSearched,
        proxyDetectionMethods: [
            getTooMuchRecursionLie,
            getNewObjectToStringTypeErrorLie,
            getChainCycleLie,
            getReflectSetProtoLie,
            getReflectSetProtoProxyLie,
            getInstanceofCheckLie,
            getDefinePropertiesLie,
        ],
    };
}
// start program
const start = performance.now();
const { lieDetector, lieList, lieDetail,
// lieCount,
propsSearched, proxyDetectionMethods, } = getPrototypeLies(PHANTOM_DARKNESS); // execute and destructure the list and detail
// disregard Function.prototype.toString lies when determining if the API can be trusted
const getNonFunctionToStringLies = (x) => !x ? x : x.filter((x) => !/object toString|toString incompatible proxy/.test(x)).length;
const lieProps = (() => {
    const props = lieDetector.getProps();
    return Object.keys(props).reduce((acc, key) => {
        acc[key] = getNonFunctionToStringLies(props[key]);
        return acc;
    }, {});
})();
const prototypeLies = JSON.parse(JSON.stringify(lieDetail));
const perf = performance.now() - start;
console.log(`${propsSearched.length} API properties analyzed in ${(perf).toFixed(2)}ms (${lieList.length} corrupted)`);
const getPluginLies = (plugins, mimeTypes) => {
    const lies = []; // collect lie types
    const pluginsOwnPropertyNames = Object.getOwnPropertyNames(plugins).filter((name) => isNaN(+name));
    const mimeTypesOwnPropertyNames = Object.getOwnPropertyNames(mimeTypes).filter((name) => isNaN(+name));
    // cast to array
    plugins = [...plugins];
    mimeTypes = [...mimeTypes];
    // get initial trusted mimeType names
    const trustedMimeTypes = new Set(mimeTypesOwnPropertyNames);
    // get initial trusted plugin names
    const excludeDuplicates = (arr) => [...new Set(arr)];
    const mimeTypeEnabledPlugins = excludeDuplicates(mimeTypes.map((mimeType) => mimeType.enabledPlugin));
    const trustedPluginNames = new Set(pluginsOwnPropertyNames);
    const mimeTypeEnabledPluginsNames = mimeTypeEnabledPlugins.map((plugin) => plugin && plugin.name);
    const trustedPluginNamesArray = [...trustedPluginNames];
    trustedPluginNamesArray.forEach((name) => {
        const validName = new Set(mimeTypeEnabledPluginsNames).has(name);
        if (!validName) {
            trustedPluginNames.delete(name);
        }
    });
    // 1. Expect plugin name to be in plugins own property names
    /* [1-2 are unstable tests as of Chrome 94]
    plugins.forEach(plugin => {
        if (!trustedPluginNames.has(plugin.name)) {
            lies.push('missing plugin name')
        }
    })

    // 2. Expect MimeType Plugins to match Plugins
    const getPluginPropertyValues = plugin => {
        return [
            plugin.description,
            plugin.filename,
            plugin.length,
            plugin.name
        ]
    }
    const pluginList = plugins.map(getPluginPropertyValues).sort()
    const enabledpluginList = mimeTypeEnabledPlugins.map(getPluginPropertyValues).sort()
    const mismatchingPlugins = '' + pluginList != '' + enabledpluginList
    if (mismatchingPlugins) {
        lies.push('mismatching plugins')
    }
    */
    // 3. Expect MimeType object in plugins
    const invalidPlugins = plugins.filter((plugin) => {
        try {
            const validMimeType = Object.getPrototypeOf(plugin[0]).constructor.name == 'MimeType';
            if (!validMimeType) {
                trustedPluginNames.delete(plugin.name);
            }
            return !validMimeType;
        }
        catch (error) {
            trustedPluginNames.delete(plugin.name);
            return true; // sign of tampering
        }
    });
    if (invalidPlugins.length) {
        lies.push('missing mimetype');
    }
    // 4. Expect valid MimeType(s) in plugin
    const pluginMimeTypes = plugins
        .map((plugin) => Object.values(plugin))
        .flat();
    const pluginMimeTypesNames = pluginMimeTypes.map((mimetype) => mimetype.type);
    pluginMimeTypesNames.forEach((name) => {
        const validName = trustedMimeTypes.has(name);
        if (!validName) {
            trustedMimeTypes.delete(name);
        }
    });
    plugins.forEach((plugin) => {
        const pluginMimeTypes = Object.values(plugin).map((mimetype) => mimetype.type);
        return pluginMimeTypes.forEach((mimetype) => {
            if (!trustedMimeTypes.has(mimetype)) {
                lies.push('invalid mimetype');
                return trustedPluginNames.delete(plugin.name);
            }
        });
    });
    return {
        validPlugins: plugins.filter((plugin) => trustedPluginNames.has(plugin.name)),
        validMimeTypes: mimeTypes.filter((mimeType) => trustedMimeTypes.has(mimeType.type)),
        lies: [...new Set(lies)], // remove duplicates
    };
};
const getLies = () => {
    const records = lieRecords.getRecords();
    const totalLies = Object.keys(records).reduce((acc, key) => {
        acc += records[key].length;
        return acc;
    }, 0);
    return { data: records, totalLies };
};
function liesHTML(fp, pointsHTML) {
    const { lies: { data, totalLies, $hash } } = fp;
    return `
	<div class="${totalLies ? ' lies' : ''}">lies (${!totalLies ? '0' : '' + totalLies}): ${!totalLies ? 'none' : modal('creep-lies', Object.keys(data).sort().map((key) => {
        const lies = data[key];
        return `
					<br>
					<div style="padding:5px">
						<strong>${key}</strong>:
						${lies.map((lie) => `<div>- ${lie}</div>`).join('')}
					</div>
					`;
    }).join(''), hashSlice($hash))}${pointsHTML}</div>`;
}

// Detect proxy behavior
const proxyBehavior = (x) => typeof x == 'function' ? true : false;
// Detect gibberish
const accept = { 'aa': 1, 'ab': 1, 'ac': 1, 'ad': 1, 'ae': 1, 'af': 1, 'ag': 1, 'ah': 1, 'ai': 1, 'aj': 1, 'ak': 1, 'al': 1, 'am': 1, 'an': 1, 'ao': 1, 'ap': 1, 'aq': 1, 'ar': 1, 'as': 1, 'at': 1, 'au': 1, 'av': 1, 'aw': 1, 'ax': 1, 'ay': 1, 'az': 1, 'ba': 1, 'bb': 1, 'bc': 1, 'bd': 1, 'be': 1, 'bf': 1, 'bg': 1, 'bh': 1, 'bi': 1, 'bj': 1, 'bk': 1, 'bl': 1, 'bm': 1, 'bn': 1, 'bo': 1, 'bp': 1, 'br': 1, 'bs': 1, 'bt': 1, 'bu': 1, 'bv': 1, 'bw': 1, 'bx': 1, 'by': 1, 'ca': 1, 'cb': 1, 'cc': 1, 'cd': 1, 'ce': 1, 'cg': 1, 'ch': 1, 'ci': 1, 'ck': 1, 'cl': 1, 'cm': 1, 'cn': 1, 'co': 1, 'cp': 1, 'cq': 1, 'cr': 1, 'cs': 1, 'ct': 1, 'cu': 1, 'cw': 1, 'cy': 1, 'cz': 1, 'da': 1, 'db': 1, 'dc': 1, 'dd': 1, 'de': 1, 'df': 1, 'dg': 1, 'dh': 1, 'di': 1, 'dj': 1, 'dk': 1, 'dl': 1, 'dm': 1, 'dn': 1, 'do': 1, 'dp': 1, 'dq': 1, 'dr': 1, 'ds': 1, 'dt': 1, 'du': 1, 'dv': 1, 'dw': 1, 'dx': 1, 'dy': 1, 'dz': 1, 'ea': 1, 'eb': 1, 'ec': 1, 'ed': 1, 'ee': 1, 'ef': 1, 'eg': 1, 'eh': 1, 'ei': 1, 'ej': 1, 'ek': 1, 'el': 1, 'em': 1, 'en': 1, 'eo': 1, 'ep': 1, 'eq': 1, 'er': 1, 'es': 1, 'et': 1, 'eu': 1, 'ev': 1, 'ew': 1, 'ex': 1, 'ey': 1, 'ez': 1, 'fa': 1, 'fb': 1, 'fc': 1, 'fd': 1, 'fe': 1, 'ff': 1, 'fg': 1, 'fh': 1, 'fi': 1, 'fj': 1, 'fk': 1, 'fl': 1, 'fm': 1, 'fn': 1, 'fo': 1, 'fp': 1, 'fr': 1, 'fs': 1, 'ft': 1, 'fu': 1, 'fw': 1, 'fy': 1, 'ga': 1, 'gb': 1, 'gc': 1, 'gd': 1, 'ge': 1, 'gf': 1, 'gg': 1, 'gh': 1, 'gi': 1, 'gj': 1, 'gk': 1, 'gl': 1, 'gm': 1, 'gn': 1, 'go': 1, 'gp': 1, 'gr': 1, 'gs': 1, 'gt': 1, 'gu': 1, 'gw': 1, 'gy': 1, 'gz': 1, 'ha': 1, 'hb': 1, 'hc': 1, 'hd': 1, 'he': 1, 'hf': 1, 'hg': 1, 'hh': 1, 'hi': 1, 'hj': 1, 'hk': 1, 'hl': 1, 'hm': 1, 'hn': 1, 'ho': 1, 'hp': 1, 'hq': 1, 'hr': 1, 'hs': 1, 'ht': 1, 'hu': 1, 'hv': 1, 'hw': 1, 'hy': 1, 'ia': 1, 'ib': 1, 'ic': 1, 'id': 1, 'ie': 1, 'if': 1, 'ig': 1, 'ih': 1, 'ii': 1, 'ij': 1, 'ik': 1, 'il': 1, 'im': 1, 'in': 1, 'io': 1, 'ip': 1, 'iq': 1, 'ir': 1, 'is': 1, 'it': 1, 'iu': 1, 'iv': 1, 'iw': 1, 'ix': 1, 'iy': 1, 'iz': 1, 'ja': 1, 'jc': 1, 'je': 1, 'ji': 1, 'jj': 1, 'jk': 1, 'jn': 1, 'jo': 1, 'ju': 1, 'ka': 1, 'kb': 1, 'kc': 1, 'kd': 1, 'ke': 1, 'kf': 1, 'kg': 1, 'kh': 1, 'ki': 1, 'kj': 1, 'kk': 1, 'kl': 1, 'km': 1, 'kn': 1, 'ko': 1, 'kp': 1, 'kr': 1, 'ks': 1, 'kt': 1, 'ku': 1, 'kv': 1, 'kw': 1, 'ky': 1, 'la': 1, 'lb': 1, 'lc': 1, 'ld': 1, 'le': 1, 'lf': 1, 'lg': 1, 'lh': 1, 'li': 1, 'lj': 1, 'lk': 1, 'll': 1, 'lm': 1, 'ln': 1, 'lo': 1, 'lp': 1, 'lq': 1, 'lr': 1, 'ls': 1, 'lt': 1, 'lu': 1, 'lv': 1, 'lw': 1, 'lx': 1, 'ly': 1, 'lz': 1, 'ma': 1, 'mb': 1, 'mc': 1, 'md': 1, 'me': 1, 'mf': 1, 'mg': 1, 'mh': 1, 'mi': 1, 'mj': 1, 'mk': 1, 'ml': 1, 'mm': 1, 'mn': 1, 'mo': 1, 'mp': 1, 'mq': 1, 'mr': 1, 'ms': 1, 'mt': 1, 'mu': 1, 'mv': 1, 'mw': 1, 'my': 1, 'na': 1, 'nb': 1, 'nc': 1, 'nd': 1, 'ne': 1, 'nf': 1, 'ng': 1, 'nh': 1, 'ni': 1, 'nj': 1, 'nk': 1, 'nl': 1, 'nm': 1, 'nn': 1, 'no': 1, 'np': 1, 'nq': 1, 'nr': 1, 'ns': 1, 'nt': 1, 'nu': 1, 'nv': 1, 'nw': 1, 'nx': 1, 'ny': 1, 'nz': 1, 'oa': 1, 'ob': 1, 'oc': 1, 'od': 1, 'oe': 1, 'of': 1, 'og': 1, 'oh': 1, 'oi': 1, 'oj': 1, 'ok': 1, 'ol': 1, 'om': 1, 'on': 1, 'oo': 1, 'op': 1, 'oq': 1, 'or': 1, 'os': 1, 'ot': 1, 'ou': 1, 'ov': 1, 'ow': 1, 'ox': 1, 'oy': 1, 'oz': 1, 'pa': 1, 'pb': 1, 'pc': 1, 'pd': 1, 'pe': 1, 'pf': 1, 'pg': 1, 'ph': 1, 'pi': 1, 'pj': 1, 'pk': 1, 'pl': 1, 'pm': 1, 'pn': 1, 'po': 1, 'pp': 1, 'pr': 1, 'ps': 1, 'pt': 1, 'pu': 1, 'pw': 1, 'py': 1, 'pz': 1, 'qa': 1, 'qe': 1, 'qi': 1, 'qo': 1, 'qr': 1, 'qs': 1, 'qt': 1, 'qu': 1, 'ra': 1, 'rb': 1, 'rc': 1, 'rd': 1, 're': 1, 'rf': 1, 'rg': 1, 'rh': 1, 'ri': 1, 'rj': 1, 'rk': 1, 'rl': 1, 'rm': 1, 'rn': 1, 'ro': 1, 'rp': 1, 'rq': 1, 'rr': 1, 'rs': 1, 'rt': 1, 'ru': 1, 'rv': 1, 'rw': 1, 'rx': 1, 'ry': 1, 'rz': 1, 'sa': 1, 'sb': 1, 'sc': 1, 'sd': 1, 'se': 1, 'sf': 1, 'sg': 1, 'sh': 1, 'si': 1, 'sj': 1, 'sk': 1, 'sl': 1, 'sm': 1, 'sn': 1, 'so': 1, 'sp': 1, 'sq': 1, 'sr': 1, 'ss': 1, 'st': 1, 'su': 1, 'sv': 1, 'sw': 1, 'sy': 1, 'sz': 1, 'ta': 1, 'tb': 1, 'tc': 1, 'td': 1, 'te': 1, 'tf': 1, 'tg': 1, 'th': 1, 'ti': 1, 'tj': 1, 'tk': 1, 'tl': 1, 'tm': 1, 'tn': 1, 'to': 1, 'tp': 1, 'tr': 1, 'ts': 1, 'tt': 1, 'tu': 1, 'tv': 1, 'tw': 1, 'tx': 1, 'ty': 1, 'tz': 1, 'ua': 1, 'ub': 1, 'uc': 1, 'ud': 1, 'ue': 1, 'uf': 1, 'ug': 1, 'uh': 1, 'ui': 1, 'uj': 1, 'uk': 1, 'ul': 1, 'um': 1, 'un': 1, 'uo': 1, 'up': 1, 'uq': 1, 'ur': 1, 'us': 1, 'ut': 1, 'uu': 1, 'uv': 1, 'uw': 1, 'ux': 1, 'uy': 1, 'uz': 1, 'va': 1, 'vc': 1, 'vd': 1, 've': 1, 'vg': 1, 'vi': 1, 'vl': 1, 'vn': 1, 'vo': 1, 'vr': 1, 'vs': 1, 'vt': 1, 'vu': 1, 'vv': 1, 'vy': 1, 'vz': 1, 'wa': 1, 'wb': 1, 'wc': 1, 'wd': 1, 'we': 1, 'wf': 1, 'wg': 1, 'wh': 1, 'wi': 1, 'wj': 1, 'wk': 1, 'wl': 1, 'wm': 1, 'wn': 1, 'wo': 1, 'wp': 1, 'wr': 1, 'ws': 1, 'wt': 1, 'wu': 1, 'ww': 1, 'wy': 1, 'wz': 1, 'xa': 1, 'xb': 1, 'xc': 1, 'xe': 1, 'xf': 1, 'xg': 1, 'xh': 1, 'xi': 1, 'xl': 1, 'xm': 1, 'xn': 1, 'xo': 1, 'xp': 1, 'xq': 1, 'xs': 1, 'xt': 1, 'xu': 1, 'xv': 1, 'xw': 1, 'xx': 1, 'xy': 1, 'ya': 1, 'yb': 1, 'yc': 1, 'yd': 1, 'ye': 1, 'yf': 1, 'yg': 1, 'yh': 1, 'yi': 1, 'yj': 1, 'yk': 1, 'yl': 1, 'ym': 1, 'yn': 1, 'yo': 1, 'yp': 1, 'yr': 1, 'ys': 1, 'yt': 1, 'yu': 1, 'yv': 1, 'yw': 1, 'yx': 1, 'yz': 1, 'za': 1, 'zb': 1, 'zc': 1, 'zd': 1, 'ze': 1, 'zg': 1, 'zh': 1, 'zi': 1, 'zj': 1, 'zk': 1, 'zl': 1, 'zm': 1, 'zn': 1, 'zo': 1, 'zp': 1, 'zq': 1, 'zs': 1, 'zt': 1, 'zu': 1, 'zv': 1, 'zw': 1, 'zy': 1, 'zz': 1 };
const gibberish = (str, { strict = false } = {}) => {
    if (!str) {
        return [];
    }
    // test letter case sequence
    const letterCaseSequenceGibbers = [];
    const tests = [
        /([A-Z]{3,}[a-z])/g,
        /([a-z][A-Z]{3,})/g,
        /([a-z][A-Z]{2,}[a-z])/g,
        /([a-z][\d]{2,}[a-z])/g,
        /([A-Z][\d]{2,}[a-z])/g,
        /([a-z][\d]{2,}[A-Z])/g, // a##...B
    ];
    tests.forEach((regExp) => {
        const match = str.match(regExp);
        if (match) {
            return letterCaseSequenceGibbers.push(match.join(', '));
        }
        return;
    });
    // test letter sequence
    const letterSequenceGibbers = [];
    const clean = str.toLowerCase().replace(/\d|\W|_/g, ' ').replace(/\s+/g, ' ').trim().split(' ').join('_');
    const len = clean.length;
    const arr = [...clean];
    arr.forEach((char, index) => {
        const next = index + 1;
        if (arr[next] == '_' || char == '_' || next == len) {
            return true;
        }
        const combo = char + arr[index + 1];
        const acceptable = !!accept[combo];
        !acceptable && letterSequenceGibbers.push(combo);
        return;
    });
    const gibbers = [
        // ignore sequence if less than 3 exist
        ...(!strict && (letterSequenceGibbers.length < 3) ? [] : letterSequenceGibbers),
        ...(!strict && (letterCaseSequenceGibbers.length < 4) ? [] : letterCaseSequenceGibbers),
    ];
    const allow = [
        // known gibbers
        'bz',
        'cf',
        'fx',
        'mx',
        'vb',
        'xd',
        'gx',
        'PCIe',
        'vm',
        'NVIDIAGa',
    ];
    return gibbers.filter((x) => !allow.includes(x));
};
// WebGL Renderer helpers
const compressWebGLRenderer = (x) => ('' + x)
    .replace(/ANGLE \(|\sDirect3D.+|\sD3D.+|\svs_.+\)|\((DRM|POLARIS|LLVM).+|Mesa.+|(ATI|INTEL)-.+|Metal\s-\s.+|NVIDIA\s[\d|\.]+/ig, '')
    .replace(/(\s(ti|\d{1,2}GB|super)$)/ig, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
    .replace(/((r|g)(t|)(x|s|\d) |Graphics |GeForce |Radeon (HD |Pro |))(\d+)/i, (...args) => {
    return `${args[1]}${args[6][0]}${args[6].slice(1).replace(/\d/g, '0')}s`;
});
const getWebGLRendererParts = (x) => {
    const knownParts = [
        'AMD',
        'ANGLE',
        'ASUS',
        'ATI',
        'ATI Radeon',
        'ATI Technologies Inc',
        'Adreno',
        'Android Emulator',
        'Apple',
        'Apple GPU',
        'Apple M1',
        'Chipset',
        'D3D11',
        'Direct3D',
        'Express Chipset',
        'GeForce',
        'Generation',
        'Generic Renderer',
        'Google',
        'Google SwiftShader',
        'Graphics',
        'Graphics Media Accelerator',
        'HD Graphics Family',
        'Intel',
        'Intel(R) HD Graphics',
        'Intel(R) UHD Graphics',
        'Iris',
        'KBL Graphics',
        'Mali',
        'Mesa',
        'Mesa DRI',
        'Metal',
        'Microsoft',
        'Microsoft Basic Render Driver',
        'Microsoft Corporation',
        'NVIDIA',
        'NVIDIA Corporation',
        'NVIDIAGameReadyD3D',
        'OpenGL',
        'OpenGL Engine',
        'Open Source Technology Center',
        'Parallels',
        'Parallels Display Adapter',
        'PCIe',
        'Plus Graphics',
        'PowerVR',
        'Pro Graphics',
        'Quadro',
        'Radeon',
        'Radeon Pro',
        'Radeon Pro Vega',
        'Samsung',
        'SSE2',
        'VMware',
        'VMware SVGA 3D',
        'Vega',
        'VirtualBox',
        'VirtualBox Graphics Adapter',
        'Vulkan',
        'Xe Graphics',
        'llvmpipe',
    ];
    const parts = [...knownParts].filter((name) => ('' + x).includes(name));
    return [...new Set(parts)].sort().join(', ');
};
const getWebGLRendererConfidence = (x) => {
    if (!x) {
        return;
    }
    const parts = getWebGLRendererParts(x);
    const hasKnownParts = parts.length;
    const hasBlankSpaceNoise = /\s{2,}|^\s|\s$/.test(x);
    const hasBrokenAngleStructure = /^ANGLE/.test(x) && !(/^ANGLE \((.+)\)/.exec(x) || [])[1];
    // https://chromium.googlesource.com/angle/angle/+/83fa18905d8fed4f394e4f30140a83a3e76b1577/src/gpu_info_util/SystemInfo.cpp
    // https://chromium.googlesource.com/angle/angle/+/83fa18905d8fed4f394e4f30140a83a3e76b1577/src/gpu_info_util/SystemInfo.h
    // https://chromium.googlesource.com/chromium/src/+/refs/heads/main/ui/gl/gl_version_info.cc
    /*
    const knownVendors = [
        'AMD',
        'ARM',
        'Broadcom',
        'Google',
        'ImgTec',
        'Intel',
        'Kazan',
        'NVIDIA',
        'Qualcomm',
        'VeriSilicon',
        'Vivante',
        'VMWare',
        'Apple',
        'Unknown'
    ]
    const angle = {
        vendorId: (/^ANGLE \(([^,]+),/.exec(x)||[])[1] || knownVendors.find(vendor => x.includes(vendor)),
        deviceId: (
            (x.match(/,/g)||[]).length == 2 ? (/^ANGLE \(([^,]+), ([^,]+)[,|\)]/.exec(x)||[])[2] :
                (/^ANGLE \(([^,]+), ([^,]+)[,|\)]/.exec(x)||[])[1] || (/^ANGLE \((.+)\)$/.exec(x)||[])[1]
        ).replace(/\sDirect3D.+/, '')
    }
    */
    const gibbers = gibberish(x, { strict: true }).join(', ');
    const valid = (hasKnownParts && !hasBlankSpaceNoise && !hasBrokenAngleStructure);
    const confidence = (valid && !gibbers.length ? 'high' :
        valid && gibbers.length ? 'moderate' :
            'low');
    const grade = (confidence == 'high' ? 'A' :
        confidence == 'moderate' ? 'C' :
            'F');
    const warnings = new Set([
        (hasBlankSpaceNoise ? 'found extra spaces' : undefined),
        (hasBrokenAngleStructure ? 'broken angle structure' : undefined),
    ]);
    warnings.delete(undefined);
    return {
        parts,
        warnings: [...warnings],
        gibbers,
        confidence,
        grade,
    };
};
// Collect trash values
const createTrashBin = () => {
    const bin = [];
    return {
        getBin: () => bin,
        sendToTrash: (name, val, response = undefined) => {
            const proxyLike = proxyBehavior(val);
            const value = !proxyLike ? val : 'proxy behavior detected';
            bin.push({ name, value });
            return response;
        },
    };
};
const trashBin = createTrashBin();
const { sendToTrash } = trashBin;
const getTrash = () => ({ trashBin: trashBin.getBin() });
function trashHTML(fp, pointsHTML) {
    const { trash: { trashBin, $hash } } = fp;
    const trashLen = trashBin.length;
    return `
		<div class="${trashLen ? ' trash' : ''}">trash (${!trashLen ? '0' : '' + trashLen}):${!trashLen ? ' none' : modal('creep-trash', trashBin.map((trash, i) => `${i + 1}: ${trash.name}: ${trash.value}`).join('<br>'), hashSlice($hash))}${pointsHTML}</div>`;
}

// https://stackoverflow.com/a/22429679
const hashMini = (x) => {
    const json = `${JSON.stringify(x)}`;
    const hash = json.split('').reduce((hash, char, i) => {
        return Math.imul(31, hash) + json.charCodeAt(i) | 0;
    }, 0x811c9dc5);
    return ('0000000' + (hash >>> 0).toString(16)).substr(-8);
};
// instance id
const instanceId = (String.fromCharCode(Math.random() * 26 + 97) +
    Math.random().toString(36).slice(-7));
// https://stackoverflow.com/a/53490958
// https://stackoverflow.com/a/43383990
// https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest
const hashify = (x, algorithm = 'SHA-256') => {
    const json = `${JSON.stringify(x)}`;
    const jsonBuffer = new TextEncoder().encode(json);
    return crypto.subtle.digest(algorithm, jsonBuffer).then((hashBuffer) => {
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map((b) => ('00' + b.toString(16)).slice(-2)).join('');
        return hashHex;
    });
};
const getBotHash = (fp, imports) => {
    const { getFeaturesLie, computeWindowsRelease } = imports;
    const outsideFeaturesVersion = getFeaturesLie(fp);
    const workerScopeIsBlocked = (!fp.workerScope ||
        !fp.workerScope.userAgent ||
        // only accept shared and service types
        // device emulators can easily spoof dedicated scope
        fp.workerScope.type == 'dedicated');
    const liedWorkerScope = !!(fp.workerScope && fp.workerScope.lied);
    let liedPlatformVersion = false;
    if (fp.workerScope && fp.fonts) {
        const { platformVersion, platform } = fp.workerScope.userAgentData || {};
        const { platformVersion: fontPlatformVersion } = fp.fonts || {};
        const windowsRelease = computeWindowsRelease({
            platform,
            platformVersion,
            fontPlatformVersion,
        });
        const windowsPlatformVersionLie = (windowsRelease &&
            fontPlatformVersion &&
            !('' + windowsRelease).includes(fontPlatformVersion));
        // use font platform (window scope) to detect userAgent (worker scope) lies
        const macOrWindowsPlatformVersionLie = (/macOS|Windows/.test(fontPlatformVersion) &&
            (platform && !fontPlatformVersion.includes(platform)));
        liedPlatformVersion = (windowsPlatformVersionLie ||
            macOrWindowsPlatformVersionLie);
    }
    const { totalLies } = fp.lies || {};
    const maxLieCount = 100;
    const extremeLieCount = (totalLies || 0) > maxLieCount;
    const { stealth } = fp.headless || {};
    const functionToStringHasProxy = (!!(stealth || {})['Function.prototype.toString has invalid TypeError'] ||
        !!(stealth || {})['Function.prototype.toString leaks Proxy behavior']);
    // Pattern conditions that warrant rejection
    const botPatterns = {
        // custom order is important
        liedWorkerScope,
        liedPlatformVersion,
        functionToStringHasProxy,
        outsideFeaturesVersion,
        extremeLieCount,
        excessiveLooseFingerprints: false,
        workerScopeIsBlocked,
        crowdBlendingScoreIsLow: false, // csl
    };
    const botHash = Object.keys(botPatterns)
        .map((key) => botPatterns[key] ? '1' : '0').join('');
    return { botHash, badBot: Object.keys(botPatterns).find((key) => botPatterns[key]) };
};
const getFuzzyHash = async (fp) => {
    // requires update log (below) when adding new keys to fp
    const metricKeys = [
        'canvas2d.blob',
        'canvas2d.blobOffscreen',
        'canvas2d.dataURI',
        'canvas2d.emojiSet',
        'canvas2d.emojiURI',
        'canvas2d.liedTextMetrics',
        'canvas2d.mods',
        'canvas2d.paintURI',
        'canvas2d.textMetricsSystemSum',
        'canvas2d.textURI',
        'canvasWebgl.dataURI',
        'canvasWebgl.dataURI2',
        'canvasWebgl.extensions',
        'canvasWebgl.gpu',
        'canvasWebgl.parameterOrExtensionLie',
        'canvasWebgl.parameters',
        'canvasWebgl.pixels',
        'canvasWebgl.pixels2',
        'capturedErrors.data',
        'clientRects.domrectSystemSum',
        'clientRects.elementBoundingClientRect',
        'clientRects.elementClientRects',
        'clientRects.emojiSet',
        'clientRects.rangeBoundingClientRect',
        'clientRects.rangeClientRects',
        'consoleErrors.errors',
        'css.computedStyle',
        'css.system',
        'cssMedia.importCSS',
        'cssMedia.matchMediaCSS',
        'cssMedia.mediaCSS',
        'cssMedia.screenQuery',
        'features.cssFeatures',
        'features.cssVersion',
        'features.jsFeatures',
        'features.jsFeaturesKeys',
        'features.jsVersion',
        'features.version',
        'features.versionRange',
        'features.windowFeatures',
        'features.windowVersion',
        'fonts.apps',
        'fonts.emojiSet',
        'fonts.fontFaceLoadFonts',
        'fonts.pixelSizeSystemSum',
        'fonts.platformVersion',
        'headless.chromium',
        'headless.headless',
        'headless.headlessRating',
        'headless.likeHeadless',
        'headless.likeHeadlessRating',
        'headless.stealth',
        'headless.stealthRating',
        'htmlElementVersion.keys',
        'intl.dateTimeFormat',
        'intl.displayNames',
        'intl.listFormat',
        'intl.locale',
        'intl.numberFormat',
        'intl.pluralRules',
        'intl.relativeTimeFormat',
        'lies.data',
        'lies.totalLies',
        'maths.data',
        'media.mediaDevices',
        'media.mimeTypes',
        'navigator.appVersion',
        'navigator.bluetoothAvailability',
        'navigator.device',
        'navigator.deviceMemory',
        'navigator.doNotTrack',
        'navigator.globalPrivacyControl',
        'navigator.hardwareConcurrency',
        'navigator.language',
        'navigator.maxTouchPoints',
        'navigator.mimeTypes',
        'navigator.oscpu',
        'navigator.permissions',
        'navigator.platform',
        'navigator.plugins',
        'navigator.properties',
        'navigator.system',
        'navigator.uaPostReduction',
        'navigator.userAgent',
        'navigator.userAgentData',
        'navigator.userAgentParsed',
        'navigator.vendor',
        'navigator.webgpu',
        'offlineAudioContext.binsSample',
        'offlineAudioContext.compressorGainReduction',
        'offlineAudioContext.copySample',
        'offlineAudioContext.floatFrequencyDataSum',
        'offlineAudioContext.floatTimeDomainDataSum',
        'offlineAudioContext.noise',
        'offlineAudioContext.sampleSum',
        'offlineAudioContext.totalUniqueSamples',
        'offlineAudioContext.values',
        'resistance.engine',
        'resistance.extension',
        'resistance.extensionHashPattern',
        'resistance.mode',
        'resistance.privacy',
        'resistance.security',
        'screen.availHeight',
        'screen.availWidth',
        'screen.colorDepth',
        'screen.height',
        'screen.pixelDepth',
        'screen.width',
        'svg.bBox',
        'svg.computedTextLength',
        'svg.emojiSet',
        'svg.extentOfChar',
        'svg.subStringLength',
        'svg.svgrectSystemSum',
        'timezone.location',
        'timezone.locationEpoch',
        'timezone.locationMeasured',
        'timezone.offset',
        'timezone.offsetComputed',
        'timezone.zone',
        'trash.trashBin',
        'voices.defaults',
        'voices.languages',
        'voices.local',
        'voices.remote',
        'windowFeatures.apple',
        'windowFeatures.keys',
        'windowFeatures.moz',
        'windowFeatures.webkit',
        'workerScope.device',
        'workerScope.deviceMemory',
        'workerScope.engineCurrencyLocale',
        'workerScope.gpu',
        'workerScope.hardwareConcurrency',
        'workerScope.language',
        'workerScope.languages',
        'workerScope.lies',
        'workerScope.locale',
        'workerScope.localeEntropyIsTrusty',
        'workerScope.localeIntlEntropyIsTrusty',
        'workerScope.platform',
        'workerScope.scope',
        'workerScope.scopeKeys',
        'workerScope.system',
        'workerScope.systemCurrencyLocale',
        'workerScope.timezoneLocation',
        'workerScope.timezoneOffset',
        'workerScope.type',
        'workerScope.uaPostReduction',
        'workerScope.userAgent',
        'workerScope.userAgentData',
        'workerScope.userAgentDataVersion',
        'workerScope.userAgentEngine',
        'workerScope.userAgentVersion',
        'workerScope.webglRenderer',
        'workerScope.webglVendor',
    ];
    // construct map of all metrics
    const metricsAll = Object.keys(fp).sort().reduce((acc, sectionKey) => {
        const section = fp[sectionKey];
        const sectionMetrics = Object.keys(section || {}).sort().reduce((acc, key) => {
            if (key == '$hash' || key == 'lied') {
                return acc;
            }
            return Object.assign(Object.assign({}, acc), { [`${sectionKey}.${key}`]: section[key] });
        }, {});
        return Object.assign(Object.assign({}, acc), sectionMetrics);
    }, {});
    // reduce to 64 bins
    const maxBins = 64;
    const metricKeysReported = Object.keys(metricsAll);
    const binSize = Math.ceil(metricKeys.length / maxBins);
    // update log
    const { host } = window.location || {};
    const devMode = host != 'abrahamjuliot.github.io';
    if (devMode && ('' + metricKeysReported != '' + metricKeys)) {
        const newKeys = metricKeysReported.filter((key) => !metricKeys.includes(key));
        const oldKeys = metricKeys.filter((key) => !metricKeysReported.includes(key));
        if (newKeys.length || oldKeys.length) {
            newKeys.length && console.warn('added fuzzy key(s):\n', newKeys.join('\n'));
            oldKeys.length && console.warn('removed fuzzy key(s):\n', oldKeys.join('\n'));
            console.groupCollapsed('update keys for accurate fuzzy hashing:');
            console.log(metricKeysReported.map((x) => `'${x}',`).join('\n'));
            console.groupEnd();
        }
    }
    // compute fuzzy fingerprint master
    const fuzzyFpMaster = metricKeys.reduce((acc, key, index) => {
        if (!index || ((index % binSize) == 0)) {
            const keySet = metricKeys.slice(index, index + binSize);
            return Object.assign(Object.assign({}, acc), { ['' + keySet]: keySet.map((key) => metricsAll[key]) });
        }
        return acc;
    }, {});
    // hash each bin
    await Promise.all(Object.keys(fuzzyFpMaster).map((key) => hashify(fuzzyFpMaster[key]).then((hash) => {
        fuzzyFpMaster[key] = hash; // swap values for hash
        return hash;
    })));
    // create fuzzy hash
    const fuzzyBits = 64;
    const fuzzyFingerprint = Object.keys(fuzzyFpMaster)
        .map((key) => fuzzyFpMaster[key][0])
        .join('')
        .padEnd(fuzzyBits, '0');
    return fuzzyFingerprint;
};

const KnownAudio = {
    // Blink/WebKit
    [-20.538286209106445]: [
        124.0434488439787,
        124.04344968475198,
        124.04347527516074,
        124.04347503720783,
        124.04347657808103,
    ],
    [-20.538288116455078]: [
        124.04347518575378,
        124.04347527516074,
        124.04344884395687,
        124.04344968475198,
        124.04347657808103,
        124.04347730590962,
        124.0434765110258,
        124.04347656317987,
        124.04375314689969,
        // WebKit
        124.0434485301812,
        124.0434496849557,
        124.043453265891,
        124.04345734833623,
        124.04345808873768,
    ],
    [-20.535268783569336]: [
        // Android/Linux
        124.080722568091,
        124.08072256811283,
        124.08072766105033,
        124.08072787802666,
        124.08072787804849,
        124.08074500028306,
        124.0807470110085,
        124.08075528279005,
        124.08075643483608,
    ],
    // Gecko Android
    [-31.502185821533203]: [35.74996031448245, 35.7499681673944],
    // Gecko Windows/Mac/Linux
    [-31.50218963623047]: [35.74996031448245],
    [-31.509262084960938]: [35.7383295930922, 35.73833402246237],
    // WebKit
    [-29.837873458862305]: [35.10892717540264, 35.10892752557993],
    [-29.83786964416504]: [35.10893232002854, 35.10893253237009],
};
const AUDIO_TRAP = Math.random();
async function getOfflineAudioContext() {
    try {
        const timer = createTimer();
        await queueEvent(timer);
        try {
            // @ts-ignore webkitOfflineAudioContext
            window.OfflineAudioContext = OfflineAudioContext || webkitOfflineAudioContext;
        }
        catch (err) { }
        if (!OfflineAudioContext) {
            logTestResult({ test: 'audio', passed: false });
            return;
        }
        // detect lies
        const channelDataLie = lieProps['AudioBuffer.getChannelData'];
        const copyFromChannelLie = lieProps['AudioBuffer.copyFromChannel'];
        let lied = (channelDataLie || copyFromChannelLie) || false;
        const bufferLen = 5000;
        const context = new OfflineAudioContext(1, bufferLen, 44100);
        const analyser = context.createAnalyser();
        const oscillator = context.createOscillator();
        const dynamicsCompressor = context.createDynamicsCompressor();
        const biquadFilter = context.createBiquadFilter();
        // detect lie
        const dataArray = new Float32Array(analyser.frequencyBinCount);
        analyser.getFloatFrequencyData(dataArray);
        const floatFrequencyUniqueDataSize = new Set(dataArray).size;
        if (floatFrequencyUniqueDataSize > 1) {
            lied = true;
            const floatFrequencyDataLie = `expected -Infinity (silence) and got ${floatFrequencyUniqueDataSize} frequencies`;
            documentLie(`AnalyserNode.getFloatFrequencyData`, floatFrequencyDataLie);
        }
        const values = {
            ['AnalyserNode.channelCount']: attempt(() => analyser.channelCount),
            ['AnalyserNode.channelCountMode']: attempt(() => analyser.channelCountMode),
            ['AnalyserNode.channelInterpretation']: attempt(() => analyser.channelInterpretation),
            ['AnalyserNode.context.sampleRate']: attempt(() => analyser.context.sampleRate),
            ['AnalyserNode.fftSize']: attempt(() => analyser.fftSize),
            ['AnalyserNode.frequencyBinCount']: attempt(() => analyser.frequencyBinCount),
            ['AnalyserNode.maxDecibels']: attempt(() => analyser.maxDecibels),
            ['AnalyserNode.minDecibels']: attempt(() => analyser.minDecibels),
            ['AnalyserNode.numberOfInputs']: attempt(() => analyser.numberOfInputs),
            ['AnalyserNode.numberOfOutputs']: attempt(() => analyser.numberOfOutputs),
            ['AnalyserNode.smoothingTimeConstant']: attempt(() => analyser.smoothingTimeConstant),
            ['AnalyserNode.context.listener.forwardX.maxValue']: attempt(() => {
                return caniuse(() => analyser.context.listener.forwardX.maxValue);
            }),
            ['BiquadFilterNode.gain.maxValue']: attempt(() => biquadFilter.gain.maxValue),
            ['BiquadFilterNode.frequency.defaultValue']: attempt(() => biquadFilter.frequency.defaultValue),
            ['BiquadFilterNode.frequency.maxValue']: attempt(() => biquadFilter.frequency.maxValue),
            ['DynamicsCompressorNode.attack.defaultValue']: attempt(() => dynamicsCompressor.attack.defaultValue),
            ['DynamicsCompressorNode.knee.defaultValue']: attempt(() => dynamicsCompressor.knee.defaultValue),
            ['DynamicsCompressorNode.knee.maxValue']: attempt(() => dynamicsCompressor.knee.maxValue),
            ['DynamicsCompressorNode.ratio.defaultValue']: attempt(() => dynamicsCompressor.ratio.defaultValue),
            ['DynamicsCompressorNode.ratio.maxValue']: attempt(() => dynamicsCompressor.ratio.maxValue),
            ['DynamicsCompressorNode.release.defaultValue']: attempt(() => dynamicsCompressor.release.defaultValue),
            ['DynamicsCompressorNode.release.maxValue']: attempt(() => dynamicsCompressor.release.maxValue),
            ['DynamicsCompressorNode.threshold.defaultValue']: attempt(() => dynamicsCompressor.threshold.defaultValue),
            ['DynamicsCompressorNode.threshold.minValue']: attempt(() => dynamicsCompressor.threshold.minValue),
            ['OscillatorNode.detune.maxValue']: attempt(() => oscillator.detune.maxValue),
            ['OscillatorNode.detune.minValue']: attempt(() => oscillator.detune.minValue),
            ['OscillatorNode.frequency.defaultValue']: attempt(() => oscillator.frequency.defaultValue),
            ['OscillatorNode.frequency.maxValue']: attempt(() => oscillator.frequency.maxValue),
            ['OscillatorNode.frequency.minValue']: attempt(() => oscillator.frequency.minValue),
        };
        const getRenderedBuffer = (context) => (new Promise((resolve) => {
            const analyser = context.createAnalyser();
            const oscillator = context.createOscillator();
            const dynamicsCompressor = context.createDynamicsCompressor();
            try {
                oscillator.type = 'triangle';
                oscillator.frequency.value = 10000;
                dynamicsCompressor.threshold.value = -50;
                dynamicsCompressor.knee.value = 40;
                dynamicsCompressor.attack.value = 0;
            }
            catch (err) { }
            oscillator.connect(dynamicsCompressor);
            dynamicsCompressor.connect(analyser);
            dynamicsCompressor.connect(context.destination);
            oscillator.start(0);
            context.startRendering();
            return context.addEventListener('complete', (event) => {
                try {
                    dynamicsCompressor.disconnect();
                    oscillator.disconnect();
                    const floatFrequencyData = new Float32Array(analyser.frequencyBinCount);
                    analyser.getFloatFrequencyData(floatFrequencyData);
                    const floatTimeDomainData = new Float32Array(analyser.fftSize);
                    if ('getFloatTimeDomainData' in analyser) {
                        analyser.getFloatTimeDomainData(floatTimeDomainData);
                    }
                    return resolve({
                        floatFrequencyData,
                        floatTimeDomainData,
                        buffer: event.renderedBuffer,
                        compressorGainReduction: (dynamicsCompressor.reduction.value || // webkit
                            dynamicsCompressor.reduction),
                    });
                }
                catch (error) {
                    return resolve(null);
                }
            });
        }));
        await queueEvent(timer);
        const { floatFrequencyData, floatTimeDomainData, buffer, compressorGainReduction, } = await getRenderedBuffer(new OfflineAudioContext(1, bufferLen, 44100)) || {};
        await queueEvent(timer);
        const getSnapshot = (arr, start, end) => {
            const collection = [];
            for (let i = start; i < end; i++) {
                collection.push(arr[i]);
            }
            return collection;
        };
        const getSum = (arr) => !arr ? 0 : arr.reduce((acc, curr) => (acc += Math.abs(curr)), 0);
        const floatFrequencyDataSum = getSum(floatFrequencyData);
        const floatTimeDomainDataSum = getSum(floatTimeDomainData);
        const copy = new Float32Array(bufferLen);
        caniuse(() => buffer.copyFromChannel(copy, 0));
        const bins = caniuse(() => buffer.getChannelData(0)) || [];
        const copySample = getSnapshot([...copy], 4500, 4600);
        const binsSample = getSnapshot([...bins], 4500, 4600);
        const sampleSum = getSum(getSnapshot([...bins], 4500, bufferLen));
        // detect lies
        // sample matching
        const matching = '' + binsSample == '' + copySample;
        const copyFromChannelSupported = ('copyFromChannel' in AudioBuffer.prototype);
        if (copyFromChannelSupported && !matching) {
            lied = true;
            const audioSampleLie = 'getChannelData and copyFromChannel samples mismatch';
            documentLie('AudioBuffer', audioSampleLie);
        }
        // sample uniqueness
        const totalUniqueSamples = new Set([...bins]).size;
        if (totalUniqueSamples == bufferLen) {
            const audioUniquenessTrash = `${totalUniqueSamples} unique samples of ${bufferLen} is too high`;
            sendToTrash('AudioBuffer', audioUniquenessTrash);
        }
        // sample noise factor
        const getRandFromRange = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
        const getCopyFrom = (rand, buffer, copy) => {
            const { length } = buffer;
            const max = 20;
            const start = getRandFromRange(275, length - (max + 1));
            const mid = start + max / 2;
            const end = start + max;
            buffer.getChannelData(0)[start] = rand;
            buffer.getChannelData(0)[mid] = rand;
            buffer.getChannelData(0)[end] = rand;
            buffer.copyFromChannel(copy, 0);
            const attack = [
                buffer.getChannelData(0)[start] === 0 ? Math.random() : 0,
                buffer.getChannelData(0)[mid] === 0 ? Math.random() : 0,
                buffer.getChannelData(0)[end] === 0 ? Math.random() : 0,
            ];
            return [...new Set([...buffer.getChannelData(0), ...copy, ...attack])].filter((x) => x !== 0);
        };
        const getCopyTo = (rand, buffer, copy) => {
            buffer.copyToChannel(copy.map((x) => rand), 0);
            const frequency = buffer.getChannelData(0)[0];
            const dataAttacked = [...buffer.getChannelData(0)]
                .map((x) => x !== frequency || !x ? Math.random() : x);
            return dataAttacked.filter((x) => x !== frequency);
        };
        const getNoiseFactor = () => {
            const length = 2000;
            try {
                const result = [...new Set([
                        ...getCopyFrom(AUDIO_TRAP, new AudioBuffer({ length, sampleRate: 44100 }), new Float32Array(length)),
                        ...getCopyTo(AUDIO_TRAP, new AudioBuffer({ length, sampleRate: 44100 }), new Float32Array(length)),
                    ])];
                return +(result.length !== 1 &&
                    result.reduce((acc, n) => acc += +n, 0));
            }
            catch (error) {
                console.error(error);
                return 0;
            }
        };
        const noiseFactor = getNoiseFactor();
        const noise = (noiseFactor || [...new Set(bins.slice(0, 100))].reduce((acc, n) => acc += n, 0));
        // Locked Patterns
        const known = {
            /* BLINK */
            // 124.04347527516074/124.04347518575378
            '-20.538286209106445,164537.64796829224,502.5999283068122': [124.04347527516074],
            '-20.538288116455078,164537.64796829224,502.5999283068122': [124.04347527516074],
            '-20.538288116455078,164537.64795303345,502.5999283068122': [
                124.04347527516074,
                124.04347518575378,
                // sus:
                124.04347519320436,
                124.04347523045726,
            ],
            '-20.538286209106445,164537.64805984497,502.5999283068122': [124.04347527516074],
            '-20.538288116455078,164537.64805984497,502.5999283068122': [
                124.04347527516074,
                124.04347518575378,
                // sus
                124.04347520065494,
                124.04347523790784,
                124.043475252809,
                124.04347526025958,
                124.04347522300668,
                124.04347523045726,
                124.04347524535842,
            ],
            // 124.04344884395687
            '-20.538288116455078,164881.9727935791,502.59990317908887': [124.04344884395687],
            '-20.538288116455078,164881.9729309082,502.59990317908887': [124.04344884395687],
            // 124.0434488439787
            '-20.538286209106445,164882.2082748413,502.59990317911434': [124.0434488439787],
            '-20.538288116455078,164882.20836639404,502.59990317911434': [124.0434488439787],
            // 124.04344968475198
            '-20.538286209106445,164863.45319366455,502.5999033495791': [124.04344968475198],
            '-20.538288116455078,164863.45319366455,502.5999033495791': [
                124.04344968475198,
                124.04375314689969,
                // sus
                124.04341541208123,
            ],
            // 124.04347503720783 (rare)
            '-20.538288116455078,164531.82670593262,502.59992767886797': [
                124.04347503720783,
                // sus
                124.04347494780086,
                124.04347495525144,
                124.04347499250434,
                124.0434750074055,
            ],
            // 124.04347657808103
            '-20.538286209106445,164540.1567993164,502.59992209258417': [124.04347657808103],
            '-20.538288116455078,164540.1567993164,502.59992209258417': [
                124.04347657808103,
                124.0434765110258,
                124.04347656317987,
                // sus
                124.04347657063045,
                124.04378004022874,
            ],
            '-20.538288116455078,164540.1580810547,502.59992209258417': [124.04347657808103],
            // 124.080722568091/124.04347730590962 (rare)
            '-20.535268783569336,164940.360786438,502.69695458233764': [124.080722568091],
            '-20.538288116455078,164538.55073928833,502.5999307175407': [124.04347730590962],
            // Android/Linux
            '-20.535268783569336,164948.14596557617,502.6969545823631': [124.08072256811283],
            '-20.535268783569336,164926.65912628174,502.6969610930064': [124.08072766105033],
            '-20.535268783569336,164932.96168518066,502.69696179985476': [124.08072787802666],
            '-20.535268783569336,164931.54252624512,502.6969617998802': [124.08072787804849],
            '-20.535268783569336,164591.9659729004,502.6969925059784': [124.08074500028306],
            '-20.535268783569336,164590.4111480713,502.6969947774742': [124.0807470110085],
            '-20.535268783569336,164590.41115570068,502.6969947774742': [124.0807470110085],
            '-20.535268783569336,164593.64263916016,502.69700490119067': [124.08075528279005],
            '-20.535268783569336,164595.0285797119,502.69700578315314': [124.08075643483608],
            // sus
            '-20.538288116455078,164860.96576690674,502.6075748118915': [124.0434496279413],
            '-20.538288116455078,164860.9938583374,502.6073723861407': [124.04344962817413],
            '-20.538288116455078,164862.14078521729,502.59991004130643': [124.04345734833623],
            '-20.538288116455078,164534.50047683716,502.61542110471055': [124.04347520368174],
            '-20.538288116455078,164535.1324043274,502.6079200572931': [124.04347521997988],
            '-20.538288116455078,164535.51135635376,502.60633126448374': [124.04347522952594],
            /* GECKO */
            '-31.509262084960938,167722.6894454956,148.42717787250876': [35.7383295930922],
            '-31.509262084960938,167728.72756958008,148.427184343338': [35.73833402246237],
            '-31.50218963623047,167721.27517700195,148.47537828609347': [35.74996031448245],
            '-31.502185821533203,167727.52931976318,148.47542023658752': [35.7499681673944],
            /* WEBKIT */
            '-20.538288116455078,164873.80361557007,502.59989904452596': [124.0434485301812],
            '-20.538288116455078,164863.47760391235,502.5999033453372': [124.0434496849557],
            '-20.538288116455078,164876.62466049194,502.5998911961724': [124.043453265891],
            '-20.538288116455078,164862.14879989624,502.59991004130643': [124.04345734833623],
            '-20.538288116455078,164896.54167175293,502.5999054916465': [124.04345808873768],
            '-29.837873458862305,163206.43050384521,0': [35.10892717540264],
            '-29.837873458862305,163224.69785308838,0': [35.10892752557993],
            '-29.83786964416504,163209.17245483398,0': [35.10893232002854],
            '-29.83786964416504,163202.77336883545,0': [35.10893253237009],
        };
        if (noise) {
            lied = true;
            documentLie('AudioBuffer', 'sample noise detected');
        }
        const pattern = '' + [
            compressorGainReduction,
            floatFrequencyDataSum,
            floatTimeDomainDataSum,
        ];
        const knownPattern = known[pattern];
        if (knownPattern && !knownPattern.includes(sampleSum)) {
            lied = true;
            documentLie('AudioBuffer', 'unknown frequency pattern (suspected lie)');
        }
        logTestResult({ time: timer.stop(), test: 'audio', passed: true });
        return {
            totalUniqueSamples,
            compressorGainReduction,
            floatFrequencyDataSum,
            floatTimeDomainDataSum,
            sampleSum,
            binsSample,
            copySample: copyFromChannelSupported ? copySample : [undefined],
            values,
            noise,
            lied,
        };
    }
    catch (error) {
        logTestResult({ test: 'audio', passed: false });
        captureError(error, 'OfflineAudioContext failed or blocked by client');
        return;
    }
}
function audioHTML(fp) {
    if (!fp.offlineAudioContext) {
        return `<div class="col-four undefined">
			<strong>Audio</strong>
			<div>sum: ${HTMLNote.BLOCKED}</div>
			<div>gain: ${HTMLNote.BLOCKED}</div>
			<div>freq: ${HTMLNote.BLOCKED}</div>
			<div>time: ${HTMLNote.BLOCKED}</div>
			<div>trap: ${HTMLNote.BLOCKED}</div>
			<div>unique: ${HTMLNote.BLOCKED}</div>
			<div>data: ${HTMLNote.BLOCKED}</div>
			<div>copy: ${HTMLNote.BLOCKED}</div>
			<div>values: ${HTMLNote.BLOCKED}</div>
		</div>`;
    }
    const { offlineAudioContext: { $hash, totalUniqueSamples, compressorGainReduction, floatFrequencyDataSum, floatTimeDomainDataSum, sampleSum, binsSample, copySample, lied, noise, values, }, } = fp;
    const knownSums = KnownAudio[compressorGainReduction] || [];
    const validAudio = sampleSum && compressorGainReduction && knownSums.length;
    const matchesKnownAudio = knownSums.includes(sampleSum);
    return `
	<div class="relative col-four${lied ? ' rejected' : ''}">
		<span class="aside-note">${performanceLogger.getLog().audio}</span>
		<strong>Audio</strong><span class="${lied ? 'lies ' : ''}hash">${hashSlice($hash)}</span>
		<div class="help" title="AudioBuffer.getChannelData()">sum: ${!validAudio || matchesKnownAudio ? sampleSum : getDiffs({
        stringA: knownSums[0],
        stringB: sampleSum,
        charDiff: true,
        decorate: (diff) => `<span class="bold-fail">${diff}</span>`,
    })}</div>
		<div class="help" title="DynamicsCompressorNode.reduction">gain: ${compressorGainReduction || HTMLNote.BLOCKED}</div>
		<div class="help" title="AnalyserNode.getFloatFrequencyData()">freq: ${floatFrequencyDataSum || HTMLNote.BLOCKED}</div>
		<div class="help" title="AnalyserNode.getFloatTimeDomainData()">time: ${floatTimeDomainDataSum || HTMLNote.UNSUPPORTED}</div>
		<div class="help" title="AudioBuffer.getChannelData()\nAudioBuffer.copyFromChannel()\nAudioBuffer.copyToChannel">trap: ${!noise ? AUDIO_TRAP : getDiffs({
        stringA: AUDIO_TRAP,
        stringB: noise,
        charDiff: true,
        decorate: (diff) => `<span class="bold-fail">${diff}</span>`,
    })}</div>
		<div>unique: ${totalUniqueSamples}</div>
		<div class="help" title="AudioBuffer.getChannelData()">data:${'' + binsSample[0] == 'undefined' ? ` ${HTMLNote.UNSUPPORTED}` :
        `<span class="sub-hash">${hashMini(binsSample)}</span>`}</div>
		<div class="help" title="AudioBuffer.copyFromChannel()">copy:${'' + copySample[0] == 'undefined' ? ` ${HTMLNote.UNSUPPORTED}` :
        `<span class="sub-hash">${hashMini(copySample)}</span>`}</div>
		<div>values: ${modal('creep-offline-audio-context', Object.keys(values).map((key) => `<div>${key}: ${values[key]}</div>`).join(''), hashMini(values))}</div>
	</div>
	`;
}

// inspired by https://arkenfox.github.io/TZP/tests/canvasnoise.html
let pixelImageRandom = '';
const getPixelMods = () => {
    const pattern1 = [];
    const pattern2 = [];
    const len = 8; // canvas dimensions
    const alpha = 255;
    const visualMultiplier = 5;
    try {
        // create 2 canvas contexts
        const canvasDisplay1 = document.createElement('canvas');
        const canvasDisplay2 = document.createElement('canvas');
        const canvas1 = document.createElement('canvas');
        const canvas2 = document.createElement('canvas');
        const contextDisplay1 = canvasDisplay1.getContext('2d');
        const contextDisplay2 = canvasDisplay2.getContext('2d');
        const context1 = canvas1.getContext('2d');
        const context2 = canvas2.getContext('2d');
        if (!contextDisplay1 || !contextDisplay2 || !context1 || !context2) {
            throw new Error('canvas context blocked');
        }
        // set the dimensions
        canvasDisplay1.width = len * visualMultiplier;
        canvasDisplay1.height = len * visualMultiplier;
        canvasDisplay2.width = len * visualMultiplier;
        canvasDisplay2.height = len * visualMultiplier;
        canvas1.width = len;
        canvas1.height = len;
        canvas2.width = len;
        canvas2.height = len;
        [...Array(len)].forEach((e, x) => [...Array(len)].forEach((e, y) => {
            const red = ~~(Math.random() * 256);
            const green = ~~(Math.random() * 256);
            const blue = ~~(Math.random() * 256);
            const colors = `${red}, ${green}, ${blue}, ${alpha}`;
            context1.fillStyle = `rgba(${colors})`;
            context1.fillRect(x, y, 1, 1);
            // capture data in visuals
            contextDisplay1.fillStyle = `rgba(${colors})`;
            contextDisplay1.fillRect(x * visualMultiplier, y * visualMultiplier, 1 * visualMultiplier, 1 * visualMultiplier);
            return pattern1.push(colors); // collect the pixel pattern
        }));
        [...Array(len)].forEach((e, x) => [...Array(len)].forEach((e, y) => {
            // get context1 pixel data and mirror to context2
            const { data: [red, green, blue, alpha], } = context1.getImageData(x, y, 1, 1) || {};
            const colors = `${red}, ${green}, ${blue}, ${alpha}`;
            context2.fillStyle = `rgba(${colors})`;
            context2.fillRect(x, y, 1, 1);
            // capture noise in visuals
            const { data: [red2, green2, blue2, alpha2], } = context2.getImageData(x, y, 1, 1) || {};
            const colorsDisplay = `
				${red != red2 ? red2 : 255},
				${green != green2 ? green2 : 255},
				${blue != blue2 ? blue2 : 255},
				${alpha != alpha2 ? alpha2 : 1}
			`;
            contextDisplay2.fillStyle = `rgba(${colorsDisplay})`;
            contextDisplay2.fillRect(x * visualMultiplier, y * visualMultiplier, 1 * visualMultiplier, 1 * visualMultiplier);
            return pattern2.push(colors); // collect the pixel pattern
        }));
        // compare the pattern collections and collect diffs
        const patternDiffs = [];
        const rgbaChannels = new Set();
        [...Array(pattern1.length)].forEach((e, i) => {
            const pixelColor1 = pattern1[i];
            const pixelColor2 = pattern2[i];
            if (pixelColor1 != pixelColor2) {
                const rgbaValues1 = pixelColor1.split(',');
                const rgbaValues2 = pixelColor2.split(',');
                const colors = [
                    rgbaValues1[0] != rgbaValues2[0] ? 'r' : '',
                    rgbaValues1[1] != rgbaValues2[1] ? 'g' : '',
                    rgbaValues1[2] != rgbaValues2[2] ? 'b' : '',
                    rgbaValues1[3] != rgbaValues2[3] ? 'a' : '',
                ].join('');
                rgbaChannels.add(colors);
                patternDiffs.push([i, colors]);
            }
        });
        pixelImageRandom = canvasDisplay1.toDataURL(); // template use only
        const pixelImage = canvasDisplay2.toDataURL();
        const rgba = rgbaChannels.size ? [...rgbaChannels].sort().join(', ') : undefined;
        const pixels = patternDiffs.length || undefined;
        return { rgba, pixels, pixelImage };
    }
    catch (error) {
        return console.error(error);
    }
};
// based on and inspired by https://github.com/antoinevastel/picasso-like-canvas-fingerprinting
const paintCanvas = ({ canvas, context, strokeText = false, cssFontFamily = '', area = { width: 100, height: 100 }, rounds = 50, maxShadowBlur = 50, seed = 500, offset = 2001000001, multiplier = 15000, }) => {
    if (!context) {
        return;
    }
    context.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = area.width;
    canvas.height = area.height;
    if (canvas.style) {
        canvas.style.display = 'none';
    }
    const createPicassoSeed = ({ seed, offset, multiplier }) => {
        let current = Number(seed) % Number(offset);
        const getNextSeed = () => {
            current = (Number(multiplier) * current) % Number(offset);
            return current;
        };
        return {
            getNextSeed,
        };
    };
    const picassoSeed = createPicassoSeed({ seed, offset, multiplier });
    const { getNextSeed } = picassoSeed;
    const patchSeed = (current, offset, maxBound, computeFloat) => {
        const result = (((current - 1) / offset) * (maxBound || 1)) || 0;
        return computeFloat ? result : Math.floor(result);
    };
    const addRandomCanvasGradient = (context, offset, area, colors, getNextSeed) => {
        const { width, height } = area;
        const canvasGradient = context.createRadialGradient(patchSeed(getNextSeed(), offset, width), patchSeed(getNextSeed(), offset, height), patchSeed(getNextSeed(), offset, width), patchSeed(getNextSeed(), offset, width), patchSeed(getNextSeed(), offset, height), patchSeed(getNextSeed(), offset, width));
        canvasGradient.addColorStop(0, colors[patchSeed(getNextSeed(), offset, colors.length)]);
        canvasGradient.addColorStop(1, colors[patchSeed(getNextSeed(), offset, colors.length)]);
        context.fillStyle = canvasGradient;
    };
    const colors = [
        '#FF6633', '#FFB399', '#FF33FF', '#FFFF99', '#00B3E6',
        '#E6B333', '#3366E6', '#999966', '#99FF99', '#B34D4D',
        '#80B300', '#809900', '#E6B3B3', '#6680B3', '#66991A',
        '#FF99E6', '#CCFF1A', '#FF1A66', '#E6331A', '#33FFCC',
        '#66994D', '#B366CC', '#4D8000', '#B33300', '#CC80CC',
        '#66664D', '#991AFF', '#E666FF', '#4DB3FF', '#1AB399',
        '#E666B3', '#33991A', '#CC9999', '#B3B31A', '#00E680',
        '#4D8066', '#809980', '#E6FF80', '#1AFF33', '#999933',
        '#FF3380', '#CCCC00', '#66E64D', '#4D80CC', '#9900B3',
        '#E64D66', '#4DB380', '#FF4D4D', '#99E6E6', '#6666FF',
    ];
    const drawOutlineOfText = (context, offset, area, getNextSeed) => {
        const { width, height } = area;
        const fontSize = 2.99;
        context.font = `${height / fontSize}px ${cssFontFamily.replace(/!important/gm, '')}`;
        context.strokeText('👾A', patchSeed(getNextSeed(), offset, width), patchSeed(getNextSeed(), offset, height), patchSeed(getNextSeed(), offset, width));
    };
    const createCircularArc = (context, offset, area, getNextSeed) => {
        const { width, height } = area;
        context.beginPath();
        context.arc(patchSeed(getNextSeed(), offset, width), patchSeed(getNextSeed(), offset, height), patchSeed(getNextSeed(), offset, Math.min(width, height)), patchSeed(getNextSeed(), offset, 2 * Math.PI, true), patchSeed(getNextSeed(), offset, 2 * Math.PI, true));
        context.stroke();
    };
    const createBezierCurve = (context, offset, area, getNextSeed) => {
        const { width, height } = area;
        context.beginPath();
        context.moveTo(patchSeed(getNextSeed(), offset, width), patchSeed(getNextSeed(), offset, height));
        context.bezierCurveTo(patchSeed(getNextSeed(), offset, width), patchSeed(getNextSeed(), offset, height), patchSeed(getNextSeed(), offset, width), patchSeed(getNextSeed(), offset, height), patchSeed(getNextSeed(), offset, width), patchSeed(getNextSeed(), offset, height));
        context.stroke();
    };
    const createQuadraticCurve = (context, offset, area, getNextSeed) => {
        const { width, height } = area;
        context.beginPath();
        context.moveTo(patchSeed(getNextSeed(), offset, width), patchSeed(getNextSeed(), offset, height));
        context.quadraticCurveTo(patchSeed(getNextSeed(), offset, width), patchSeed(getNextSeed(), offset, height), patchSeed(getNextSeed(), offset, width), patchSeed(getNextSeed(), offset, height));
        context.stroke();
    };
    const createEllipticalArc = (context, offset, area, getNextSeed) => {
        if (!('ellipse' in context)) {
            return;
        }
        const { width, height } = area;
        context.beginPath();
        context.ellipse(patchSeed(getNextSeed(), offset, width), patchSeed(getNextSeed(), offset, height), patchSeed(getNextSeed(), offset, Math.floor(width / 2)), patchSeed(getNextSeed(), offset, Math.floor(height / 2)), patchSeed(getNextSeed(), offset, 2 * Math.PI, true), patchSeed(getNextSeed(), offset, 2 * Math.PI, true), patchSeed(getNextSeed(), offset, 2 * Math.PI, true));
        context.stroke();
    };
    const methods = [
        createCircularArc,
        createBezierCurve,
        createQuadraticCurve,
        createEllipticalArc,
    ];
    if (strokeText) {
        methods.push(drawOutlineOfText);
    }
    [...Array(rounds)].forEach((x) => {
        addRandomCanvasGradient(context, offset, area, colors, getNextSeed);
        context.shadowBlur = patchSeed(getNextSeed(), offset, maxShadowBlur, true);
        context.shadowColor = colors[patchSeed(getNextSeed(), offset, colors.length)];
        const nextMethod = methods[patchSeed(getNextSeed(), offset, methods.length)];
        nextMethod(context, offset, area, getNextSeed);
        context.fill();
    });
    return;
};
const emojifyCanvas = ({ canvas, context, cssFontFamily }) => {
    const width = 140;
    const height = 30;
    canvas.width = width;
    canvas.height = height;
    context.font = `5px ${cssFontFamily.replace(/!important/gm, '')}`;
    context.fillText(`😀☺🤵‍♂️♨☸⚧⁉ℹ🏳️‍⚧️🥲☹☠🧑‍🦰🧏‍♂️⛷🧑‍🤝‍🧑☘⛰`, 0, 5);
    context.fillText(`⛩⛴✈⏱⛈☂⛱☃☄⛸♟⛑⌨✉✏👩‍❤️‍`, 0, 10);
    context.fillText(`💋‍👨👨‍👩‍👧‍👦👨‍👩‍👦😀©®™👁️‍�`, 0, 15);
    context.fillText(`�️✒✂⛏⚒⚔⚙⛓⚗⚰⚱⚠☢☣⬆↗➡⬅`, 0, 20);
    context.fillText(`⚛✡✝☦▶⏭⏯⏏♀♂✖〰⚕⚜✔✳❇◼▪❣`, 0, 25);
    context.fillText(`❤✌☝✍❄⚖↪☯☪☮☑✴🅰🅿`, 0, 30);
    return;
};
async function getCanvas2d() {
    const getFileReaderData = (blob) => {
        if (!blob) {
            return;
        }
        const getRead = (method, blob) => new Promise((resolve) => {
            const reader = new FileReader();
            reader[method](blob);
            return reader.addEventListener('loadend', () => resolve(reader.result));
        });
        return getRead('readAsDataURL', blob);
    };
    try {
        const timer = createTimer();
        await queueEvent(timer);
        const dataLie = lieProps['HTMLCanvasElement.toDataURL'];
        const contextLie = lieProps['HTMLCanvasElement.getContext'];
        const imageDataLie = (lieProps['CanvasRenderingContext2D.fillText'] ||
            lieProps['CanvasRenderingContext2D.font'] ||
            lieProps['CanvasRenderingContext2D.getImageData'] ||
            lieProps['CanvasRenderingContext2D.strokeText']);
        const codePointLie = lieProps['String.fromCodePoint'];
        let textMetricsLie = (lieProps['CanvasRenderingContext2D.measureText'] ||
            lieProps['TextMetrics.actualBoundingBoxAscent'] ||
            lieProps['TextMetrics.actualBoundingBoxDescent'] ||
            lieProps['TextMetrics.actualBoundingBoxLeft'] ||
            lieProps['TextMetrics.actualBoundingBoxRight'] ||
            lieProps['TextMetrics.fontBoundingBoxAscent'] ||
            lieProps['TextMetrics.fontBoundingBoxDescent'] ||
            lieProps['TextMetrics.width']);
        let lied = (dataLie ||
            contextLie ||
            imageDataLie ||
            textMetricsLie ||
            codePointLie) || false;
        // create canvas context
        let win = window;
        if (!LIKE_BRAVE && PHANTOM_DARKNESS) {
            win = PHANTOM_DARKNESS;
        }
        const doc = win.document;
        const canvas = doc.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) {
            throw new Error('canvas context blocked');
        }
        await queueEvent(timer);
        paintCanvas({
            canvas,
            context,
            strokeText: true,
            cssFontFamily: CSS_FONT_FAMILY,
            area: { width: 50, height: 50 },
            rounds: 10,
        });
        const dataURI = canvas.toDataURL();
        let canvasOffscreen;
        try {
            // @ts-ignore OffscreenCanvas
            canvasOffscreen = new OffscreenCanvas(140, 30);
            await queueEvent(timer);
            emojifyCanvas({
                canvas: canvasOffscreen,
                context: canvasOffscreen.getContext('2d'),
                cssFontFamily: CSS_FONT_FAMILY,
            });
        }
        catch (error) { }
        await queueEvent(timer);
        const [fileReaderData, fileReaderDataOffscreen,] = await Promise.all([
            new Promise((resolve) => canvas.toBlob((blob) => {
                return resolve(getFileReaderData(blob));
            })),
            getFileReaderData(canvasOffscreen && await attempt(() => canvasOffscreen.convertToBlob())),
        ]);
        const blob = {
            readAsDataURL: fileReaderData,
        };
        const blobOffscreen = {
            readAsDataURL: fileReaderDataOffscreen,
        };
        await queueEvent(timer);
        const mods = getPixelMods();
        // TextMetrics: get emoji set and system
        await queueEvent(timer);
        context.font = `10px ${CSS_FONT_FAMILY.replace(/!important/gm, '')}`;
        const pattern = new Set();
        const emojiSet = EMOJIS.reduce((emojiSet, emoji) => {
            const { actualBoundingBoxAscent, actualBoundingBoxDescent, actualBoundingBoxLeft, actualBoundingBoxRight, fontBoundingBoxAscent, fontBoundingBoxDescent, width, } = context.measureText(emoji) || {};
            const dimensions = [
                actualBoundingBoxAscent,
                actualBoundingBoxDescent,
                actualBoundingBoxLeft,
                actualBoundingBoxRight,
                fontBoundingBoxAscent,
                fontBoundingBoxDescent,
                width,
            ].join(',');
            if (!pattern.has(dimensions)) {
                pattern.add(dimensions);
                emojiSet.add(emoji);
            }
            return emojiSet;
        }, new Set());
        // textMetrics System Sum
        const textMetricsSystemSum = 0.00001 * [...pattern].map((x) => {
            return x.split(',').reduce((acc, x) => acc += (+x || 0), 0);
        }).reduce((acc, x) => acc += x, 0);
        // Paint
        const maxSize = 50;
        await queueEvent(timer);
        paintCanvas({
            canvas,
            context,
            area: { width: maxSize, height: maxSize },
        }); // clears image
        const paintURI = canvas.toDataURL();
        // Text
        context.restore();
        context.clearRect(0, 0, canvas.width, canvas.height);
        canvas.width = maxSize;
        canvas.height = maxSize;
        context.font = `50px ${CSS_FONT_FAMILY.replace(/!important/gm, '')}`;
        context.fillText('A', 7, 37);
        const textURI = canvas.toDataURL();
        // Emoji
        context.restore();
        context.clearRect(0, 0, canvas.width, canvas.height);
        canvas.width = maxSize;
        canvas.height = maxSize;
        context.font = `35px ${CSS_FONT_FAMILY.replace(/!important/gm, '')}`;
        context.fillText('👾', 0, 37);
        const emojiURI = canvas.toDataURL();
        // lies
        context.clearRect(0, 0, canvas.width, canvas.height);
        const liedImageData = !!Math.max(...context.getImageData(0, 0, 8, 8).data);
        if ((mods && mods.pixels) || liedImageData) {
            lied = true;
            documentLie(`CanvasRenderingContext2D.getImageData`, `pixel data modified`);
        }
        const getTextMetricsFloatLie = (context) => {
            const isFloat = (n) => n % 1 !== 0;
            const { actualBoundingBoxAscent: abba, actualBoundingBoxDescent: abbd, actualBoundingBoxLeft: abbl, actualBoundingBoxRight: abbr, fontBoundingBoxAscent: fbba, fontBoundingBoxDescent: fbbd,
            // width: w,
             } = context.measureText('') || {};
            const lied = [
                abba,
                abbd,
                abbl,
                abbr,
                fbba,
                fbbd,
            ].find((x) => isFloat((x || 0)));
            return lied;
        };
        await queueEvent(timer);
        if (getTextMetricsFloatLie(context)) {
            textMetricsLie = true;
            lied = true;
            documentLie('CanvasRenderingContext2D.measureText', 'metric noise detected');
        }
        logTestResult({ time: timer.stop(), test: 'canvas 2d', passed: true });
        return {
            dataURI,
            paintURI,
            textURI,
            emojiURI,
            mods,
            blob,
            blobOffscreen,
            textMetricsSystemSum,
            liedTextMetrics: textMetricsLie,
            emojiSet: [...emojiSet],
            lied,
        };
    }
    catch (error) {
        logTestResult({ test: 'canvas 2d', passed: false });
        captureError(error);
        return;
    }
}
function canvasHTML(fp) {
    if (!fp.canvas2d) {
        return `
		<div class="col-six undefined">
			<strong>Canvas 2d</strong> <span>${HTMLNote.BLOCKED}</span>
			<div>data: ${HTMLNote.BLOCKED}</div>
			<div>rendering:</div>
			<div class="icon-pixel-container pixels">${HTMLNote.BLOCKED}</div>
			<div class="icon-pixel-container pixels">${HTMLNote.BLOCKED}</div>
			<div>textMetrics:</div>
			<div class="block-text">${HTMLNote.BLOCKED}</div>
		</div>`;
    }
    const { canvas2d: { lied, dataURI, paintURI, textURI, emojiURI, mods, blob, blobOffscreen, emojiSet, textMetricsSystemSum, $hash, }, } = fp;
    const { pixels, rgba, pixelImage } = mods || {};
    const modPercent = pixels ? Math.round((pixels / 400) * 100) : 0;
    const blobDataURI = (blob || {}).readAsDataURL;
    const blobOffscreenDataURI = (blobOffscreen || {}).readAsDataURL;
    const hash = {
        dataURI: hashMini(dataURI),
        blobDataURI: hashMini(blobDataURI),
        blobOffscreenDataURI: hashMini(blobOffscreenDataURI),
        textURI: hashMini(textURI),
        emojiURI: hashMini(emojiURI),
        paintURI: hashMini(paintURI),
    };
    const dataTemplate = `
		${textURI ? `<div class="icon-pixel text-image"></div>` : ''}
		<br>text: ${!textURI ? HTMLNote.BLOCKED : hash.textURI}

		<br><br>
		${emojiURI ? `<div class="icon-pixel emoji-image"></div>` : ''}
		<br>emoji: ${!emojiURI ? HTMLNote.BLOCKED : hash.emojiURI}

		<br><br>
		${paintURI ? `<div class="icon-pixel paint-image"></div>` : ''}
		<br>paint: ${!paintURI ? HTMLNote.BLOCKED : hash.paintURI}

		<br><br>
		${dataURI ? `<div class="icon-pixel combined-image"></div>` : ''}
		${dataURI ? `<div class="icon-pixel combined-image-blob"></div>` : ''}
		<br>combined: ${!dataURI ? HTMLNote.BLOCKED : hash.dataURI}
		<br>toBlob (combined): ${!blobDataURI ? HTMLNote.UNSUPPORTED : hash.blobDataURI}
		<br><br>
		${blobOffscreenDataURI ? `<div class="icon-pixel offscreen-image"></div>` : ''}
		<br>convertToBlob (emoji storm): ${!blobOffscreenDataURI ? HTMLNote.UNSUPPORTED : hash.blobOffscreenDataURI}
	`;
    // rgba: "b, g, gb, r, rb, rg, rgb"
    const rgbaHTML = !rgba ? rgba : rgba.split(', ').map((s) => s.split('').map((c) => {
        const css = {
            r: 'red',
            g: 'green',
            b: 'blue',
        };
        return `<span class="rgba rgba-${css[c]}"></span>`;
    }).join('')).join(' ');
    const emojiHelpTitle = `CanvasRenderingContext2D.measureText()\nhash: ${hashMini(emojiSet)}\n${emojiSet.map((x, i) => i && (i % 6 == 0) ? `${x}\n` : x).join('')}`;
    return `
	<div class="relative col-six${lied ? ' rejected' : ''}">
		<style>
			.pixels {
				padding: 19px;
				position: relative;
				overflow: hidden;
			}
			.canvas-data {
				max-width: 200px;
				height: 50px;
				transform: scale(1);
				background-image: url(${dataURI})
			}
			.pixel-image,
			.pixel-image-random,
			.combined-image,
			.combined-image-blob,
			.paint-image,
			.text-image,
			.emoji-image,
			.offscreen-image {
				max-width: 35px;
    		border-radius: 50%;
				transform: scale(1.5);
			}
			.pixel-image {
				background-image: url(${pixelImage})
			}
			.pixel-image-random {
				background-image: url(${pixelImageRandom})
			}
			.paint-image {
				background-image: url(${paintURI})
			}
			.text-image {
				background-image: url(${textURI})
			}
			.emoji-image {
				background-image: url(${emojiURI})
			}
			.combined-image {
				background-image: url(${dataURI})
			}
			.combined-image-blob {
				background-image: url(${blobDataURI})
			}
			.offscreen-image {
				background-image: url(${blobOffscreenDataURI});
				background-repeat: repeat-y;
				background-size: 70px;
			}
			.rgba {
				width: 8px;
				height: 8px;
				display: inline-block;
				border-radius: 50%;
			}
			.rgba-red {
				background: #ff000c4a;
			}
			.rgba-green {
				background: #00ff584a;
			}
			.rgba-blue {
				background: #009fff5e;
			}
			@media (prefers-color-scheme: dark) {
				.rgba-red {
					background: #e19fa2;
				}
				.rgba-green {
					background: #98dfb1;
				}
				.rgba-blue {
					background: #67b7ff;
				}
			}
		</style>
		<span class="aside-note">${performanceLogger.getLog()['canvas 2d']}</span>
		<strong>Canvas 2d</strong><span class="${lied ? 'lies ' : ''}hash">${hashSlice($hash)}</span>
		<div class="help" title="HTMLCanvasElement.toDataURL()\nCanvasRenderingContext2D.getImageData()\nHTMLCanvasElement.toBlob()\nOffscreenCanvas.convertToBlob()\nFileReader.readAsDataURL()">data: ${modal('creep-canvas-data', dataTemplate, hashMini({
        dataURI,
        blob,
        blobOffscreen,
    }))}</div>
		<div class="help" title="CanvasRenderingContext2D.getImageData()">rendering: ${rgba ? `${modPercent}% rgba noise ${rgbaHTML}` : ''}</div>
		<div class="icon-pixel-container pixels">
			${textURI ? `<div class="icon-pixel text-image"></div>` : ''}
			${emojiURI ? `<div class="icon-pixel emoji-image"></div>` : ''}
			${paintURI ? `<div class="icon-pixel paint-image"></div>` : ''}
			${dataURI ? `<div class="icon-pixel combined-image"></div>` : ''}

		</div>
		<div class="icon-pixel-container pixels">
			${blobOffscreenDataURI ? `<div class="icon-pixel offscreen-image"></div>` : ''}
			<div class="icon-pixel pixel-image-random"></div>
			${rgba ? `<div class="icon-pixel pixel-image"></div>` : ''}
		</div>
		<div>textMetrics:</div>
		<div class="block-text help relative" title="${emojiHelpTitle}">
			<span>${textMetricsSystemSum || HTMLNote.UNSUPPORTED}</span>
			<span class="grey jumbo" style="font-family: ${CSS_FONT_FAMILY}">
				${formatEmojiSet(emojiSet)}
			</span>
		</div>
	</div>
	`;
}

function getCSS() {
    const computeStyle = (type, { require: [captureError] }) => {
        try {
            // get CSSStyleDeclaration
            const cssStyleDeclaration = (type == 'getComputedStyle' ? getComputedStyle(document.body) :
                type == 'HTMLElement.style' ? document.body.style :
                    // @ts-ignore
                    type == 'CSSRuleList.style' ? document.styleSheets[0].cssRules[0].style :
                        undefined);
            if (!cssStyleDeclaration) {
                throw new TypeError('invalid argument string');
            }
            // get properties
            const proto = Object.getPrototypeOf(cssStyleDeclaration);
            const prototypeProperties = Object.getOwnPropertyNames(proto);
            const ownEnumerablePropertyNames = [];
            const cssVar = /^--.*$/;
            Object.keys(cssStyleDeclaration).forEach((key) => {
                const numericKey = !isNaN(+key);
                const value = cssStyleDeclaration[key];
                const customPropKey = cssVar.test(key);
                const customPropValue = cssVar.test(value);
                if (numericKey && !customPropValue) {
                    return ownEnumerablePropertyNames.push(value);
                }
                else if (!numericKey && !customPropKey) {
                    return ownEnumerablePropertyNames.push(key);
                }
                return;
            });
            // get properties in prototype chain (required only in chrome)
            const propertiesInPrototypeChain = {};
            const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
            const uncapitalize = (str) => str.charAt(0).toLowerCase() + str.slice(1);
            const removeFirstChar = (str) => str.slice(1);
            const caps = /[A-Z]/g;
            ownEnumerablePropertyNames.forEach((key) => {
                if (propertiesInPrototypeChain[key]) {
                    return;
                }
                // determine attribute type
                const isNamedAttribute = key.indexOf('-') > -1;
                const isAliasAttribute = caps.test(key);
                // reduce key for computation
                const firstChar = key.charAt(0);
                const isPrefixedName = isNamedAttribute && firstChar == '-';
                const isCapitalizedAlias = isAliasAttribute && firstChar == firstChar.toUpperCase();
                key = (isPrefixedName ? removeFirstChar(key) :
                    isCapitalizedAlias ? uncapitalize(key) :
                        key);
                // find counterpart in CSSStyleDeclaration object or its prototype chain
                if (isNamedAttribute) {
                    const aliasAttribute = key.split('-').map((word, index) => index == 0 ? word : capitalize(word)).join('');
                    if (aliasAttribute in cssStyleDeclaration) {
                        propertiesInPrototypeChain[aliasAttribute] = true;
                    }
                    else if (capitalize(aliasAttribute) in cssStyleDeclaration) {
                        propertiesInPrototypeChain[capitalize(aliasAttribute)] = true;
                    }
                }
                else if (isAliasAttribute) {
                    const namedAttribute = key.replace(caps, (char) => '-' + char.toLowerCase());
                    if (namedAttribute in cssStyleDeclaration) {
                        propertiesInPrototypeChain[namedAttribute] = true;
                    }
                    else if (`-${namedAttribute}` in cssStyleDeclaration) {
                        propertiesInPrototypeChain[`-${namedAttribute}`] = true;
                    }
                }
                return;
            });
            // compile keys
            const keys = [
                ...new Set([
                    ...prototypeProperties,
                    ...ownEnumerablePropertyNames,
                    ...Object.keys(propertiesInPrototypeChain),
                ]),
            ];
            // @ts-ignore
            const interfaceName = ('' + proto).match(/\[object (.+)\]/)[1];
            return { keys, interfaceName };
        }
        catch (error) {
            captureError(error);
            return;
        }
    };
    const getSystemStyles = (el) => {
        try {
            const colors = [
                'ActiveBorder',
                'ActiveCaption',
                'ActiveText',
                'AppWorkspace',
                'Background',
                'ButtonBorder',
                'ButtonFace',
                'ButtonHighlight',
                'ButtonShadow',
                'ButtonText',
                'Canvas',
                'CanvasText',
                'CaptionText',
                'Field',
                'FieldText',
                'GrayText',
                'Highlight',
                'HighlightText',
                'InactiveBorder',
                'InactiveCaption',
                'InactiveCaptionText',
                'InfoBackground',
                'InfoText',
                'LinkText',
                'Mark',
                'MarkText',
                'Menu',
                'MenuText',
                'Scrollbar',
                'ThreeDDarkShadow',
                'ThreeDFace',
                'ThreeDHighlight',
                'ThreeDLightShadow',
                'ThreeDShadow',
                'VisitedText',
                'Window',
                'WindowFrame',
                'WindowText',
            ];
            const fonts = [
                'caption',
                'icon',
                'menu',
                'message-box',
                'small-caption',
                'status-bar',
            ];
            const getStyles = (el) => ({
                colors: colors.map((color) => {
                    el.setAttribute('style', `background-color: ${color} !important`);
                    return {
                        [color]: getComputedStyle(el).backgroundColor,
                    };
                }),
                fonts: fonts.map((font) => {
                    el.setAttribute('style', `font: ${font} !important`);
                    const computedStyle = getComputedStyle(el);
                    return {
                        [font]: `${computedStyle.fontSize} ${computedStyle.fontFamily}`,
                    };
                }),
            });
            if (!el) {
                el = document.createElement('div');
                document.body.append(el);
                const systemStyles = getStyles(el);
                el.parentNode.removeChild(el);
                return systemStyles;
            }
            return getStyles(el);
        }
        catch (error) {
            captureError(error);
            return;
        }
    };
    try {
        const timer = createTimer();
        timer.start();
        const computedStyle = computeStyle('getComputedStyle', { require: [captureError] });
        const system = getSystemStyles(PARENT_PHANTOM);
        logTestResult({ time: timer.stop(), test: 'computed style', passed: true });
        return {
            computedStyle,
            system,
        };
    }
    catch (error) {
        logTestResult({ test: 'computed style', passed: false });
        captureError(error);
        return;
    }
}
function cssHTML(fp) {
    if (!fp.css) {
        return `
		<div class="col-six undefined">
			<strong>Computed Style</strong>
			<div>keys (0): ${HTMLNote.BLOCKED}</div>
			<div>system styles: ${HTMLNote.BLOCKED}</div>
			<div>
				<div>${HTMLNote.BLOCKED}</div>
			</div>
			<div class="gradient"></div>
		</div>`;
    }
    const { css: data, } = fp;
    const { $hash, computedStyle, system, } = data;
    const colorsLen = system.colors.length;
    const gradientColors = system.colors.map((color, index) => {
        const name = Object.values(color)[0];
        return (index == 0 ? `${name}, ${name} ${((index + 1) / colorsLen * 100).toFixed(2)}%` :
            index == colorsLen - 1 ? `${name} ${((index - 1) / colorsLen * 100).toFixed(2)}%, ${name} 100%` :
                `${name} ${(index / colorsLen * 100).toFixed(2)}%, ${name} ${((index + 1) / colorsLen * 100).toFixed(2)}%`);
    });
    const id = 'creep-css-style-declaration-version';
    return `
	<div class="relative col-six">
		<span class="aside-note">${performanceLogger.getLog()['computed style']}</span>
		<strong>Computed Style</strong><span class="hash">${hashSlice($hash)}</span>
		<div>keys (${!computedStyle ? '0' : count(computedStyle.keys)}): ${!computedStyle ? HTMLNote.BLOCKED :
        modal('creep-computed-style', computedStyle.keys.join(', '), hashMini(computedStyle))}</div>
		<div>system styles: ${system && system.colors ? modal(`${id}-system-styles`, [
        ...system.colors.map((color) => {
            const key = Object.keys(color)[0];
            const val = color[key];
            return `
							<div><span style="display:inline-block;border:1px solid #eee;border-radius:3px;width:12px;height:12px;background:${val}"></span> ${key}: ${val}</div>
						`;
        }),
        ...system.fonts.map((font) => {
            const key = Object.keys(font)[0];
            const val = font[key];
            return `
							<div>${key}: <span style="padding:0 5px;border-radius:3px;font:${val}">${val}</span></div>
						`;
        }),
    ].join(''), hashMini(system)) : HTMLNote.BLOCKED}</div>
		<div class="blurred" id="system-style-samples">
			<div>system</div>
		</div>
		<style>.gradient { background: repeating-linear-gradient(to right, ${gradientColors.join(', ')}); }</style>
		<div class="gradient"></div>
	</div>
	`;
}

function getCSSMedia() {
    const gcd = (a, b) => b == 0 ? a : gcd(b, a % b);
    const getAspectRatio = (width, height) => {
        const r = gcd(width, height);
        const aspectRatio = `${width / r}/${height / r}`;
        return aspectRatio;
    };
    const query = ({ body, type, rangeStart, rangeLen }) => {
        const html = [...Array(rangeLen)].map((slot, i) => {
            i += rangeStart;
            return `@media(device-${type}:${i}px){body{--device-${type}:${i};}}`;
        }).join('');
        body.innerHTML = `<style>${html}</style>`;
        const style = getComputedStyle(body);
        return style.getPropertyValue(`--device-${type}`).trim();
    };
    const getScreenMedia = ({ body, width, height }) => {
        let widthMatch = query({ body, type: 'width', rangeStart: width, rangeLen: 1 });
        let heightMatch = query({ body, type: 'height', rangeStart: height, rangeLen: 1 });
        if (widthMatch && heightMatch) {
            return { width, height };
        }
        const rangeLen = 1000;
        [...Array(10)].find((slot, i) => {
            if (!widthMatch) {
                widthMatch = query({ body, type: 'width', rangeStart: i * rangeLen, rangeLen });
            }
            if (!heightMatch) {
                heightMatch = query({ body, type: 'height', rangeStart: i * rangeLen, rangeLen });
            }
            return widthMatch && heightMatch;
        });
        return { width: +widthMatch, height: +heightMatch };
    };
    const getCSSDataURI = (x) => `data:text/css,body {${x}}`;
    try {
        const timer = createTimer();
        timer.start();
        const win = PHANTOM_DARKNESS.window;
        const { body } = win.document;
        const { width, height } = win.screen;
        const deviceAspectRatio = getAspectRatio(width, height);
        const matchMediaCSS = {
            ['prefers-reduced-motion']: (win.matchMedia('(prefers-reduced-motion: no-preference)').matches ? 'no-preference' :
                win.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'reduce' : undefined),
            ['prefers-color-scheme']: (win.matchMedia('(prefers-color-scheme: light)').matches ? 'light' :
                win.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : undefined),
            monochrome: (win.matchMedia('(monochrome)').matches ? 'monochrome' :
                win.matchMedia('(monochrome: 0)').matches ? 'non-monochrome' : undefined),
            ['inverted-colors']: (win.matchMedia('(inverted-colors: inverted)').matches ? 'inverted' :
                win.matchMedia('(inverted-colors: none)').matches ? 'none' : undefined),
            ['forced-colors']: (win.matchMedia('(forced-colors: none)').matches ? 'none' :
                win.matchMedia('(forced-colors: active)').matches ? 'active' : undefined),
            ['any-hover']: (win.matchMedia('(any-hover: hover)').matches ? 'hover' :
                win.matchMedia('(any-hover: none)').matches ? 'none' : undefined),
            hover: (win.matchMedia('(hover: hover)').matches ? 'hover' :
                win.matchMedia('(hover: none)').matches ? 'none' : undefined),
            ['any-pointer']: (win.matchMedia('(any-pointer: fine)').matches ? 'fine' :
                win.matchMedia('(any-pointer: coarse)').matches ? 'coarse' :
                    win.matchMedia('(any-pointer: none)').matches ? 'none' : undefined),
            pointer: (win.matchMedia('(pointer: fine)').matches ? 'fine' :
                win.matchMedia('(pointer: coarse)').matches ? 'coarse' :
                    win.matchMedia('(pointer: none)').matches ? 'none' : undefined),
            ['device-aspect-ratio']: (win.matchMedia(`(device-aspect-ratio: ${deviceAspectRatio})`).matches ? deviceAspectRatio : undefined),
            ['device-screen']: (win.matchMedia(`(device-width: ${width}px) and (device-height: ${height}px)`).matches ? `${width} x ${height}` : undefined),
            ['display-mode']: (win.matchMedia('(display-mode: fullscreen)').matches ? 'fullscreen' :
                win.matchMedia('(display-mode: standalone)').matches ? 'standalone' :
                    win.matchMedia('(display-mode: minimal-ui)').matches ? 'minimal-ui' :
                        win.matchMedia('(display-mode: browser)').matches ? 'browser' : undefined),
            ['color-gamut']: (win.matchMedia('(color-gamut: srgb)').matches ? 'srgb' :
                win.matchMedia('(color-gamut: p3)').matches ? 'p3' :
                    win.matchMedia('(color-gamut: rec2020)').matches ? 'rec2020' : undefined),
            orientation: (win.matchMedia('(orientation: landscape)').matches ? 'landscape' :
                win.matchMedia('(orientation: portrait)').matches ? 'portrait' : undefined),
        };
        const importStyles = `
		<style>
		@import '${getCSSDataURI('--import-prefers-reduced-motion: no-preference')}' (prefers-reduced-motion: no-preference);
		@import '${getCSSDataURI('--import-prefers-reduced-motion: reduce')}' (prefers-reduced-motion: reduce);
		@import '${getCSSDataURI('--import-prefers-color-scheme: light')}' (prefers-color-scheme: light);
		@import '${getCSSDataURI('--import-prefers-color-scheme: dark')}' (prefers-color-scheme: dark);
		@import '${getCSSDataURI('--import-monochrome: monochrome')}' (monochrome);
		@import '${getCSSDataURI('--import-monochrome: non-monochrome')}' (monochrome: 0);
		@import '${getCSSDataURI('--import-inverted-colors: inverted')}' (inverted-colors: inverted);
		@import '${getCSSDataURI('--import-inverted-colors: none')}' (inverted-colors: 0);
		@import '${getCSSDataURI('--import-forced-colors: none')}' (forced-colors: none);
		@import '${getCSSDataURI('--import-forced-colors: active')}' (forced-colors: active);
		@import '${getCSSDataURI('--import-any-hover: hover')}' (any-hover: hover);
		@import '${getCSSDataURI('--import-any-hover: none')}' (any-hover: none);
		@import '${getCSSDataURI('--import-hover: hover')}' (hover: hover);
		@import '${getCSSDataURI('--import-hover: none')}' (hover: none);
		@import '${getCSSDataURI('--import-any-pointer: fine')}' (any-pointer: fine);
		@import '${getCSSDataURI('--import-any-pointer: coarse')}' (any-pointer: coarse);
		@import '${getCSSDataURI('--import-any-pointer: none')}' (any-pointer: none);
		@import '${getCSSDataURI('--import-pointer: fine')}' (pointer: fine);
		@import '${getCSSDataURI('--import-pointer: coarse')}' (pointer: coarse);
		@import '${getCSSDataURI('--import-pointer: none')}' (pointer: none);
		@import '${getCSSDataURI(`--import-device-aspect-ratio: ${deviceAspectRatio}`)}' (device-aspect-ratio: ${deviceAspectRatio});
		@import '${getCSSDataURI(`--import-device-screen: ${width} x ${height}`)}' (device-width: ${width}px) and (device-height: ${height}px);
		@import '${getCSSDataURI('--import-display-mode: fullscreen')}' (display-mode: fullscreen);
		@import '${getCSSDataURI('--import-display-mode: standalone')}' (display-mode: standalone);
		@import '${getCSSDataURI('--import-display-mode: minimal-ui')}' (display-mode: minimal-ui);
		@import '${getCSSDataURI('--import-display-mode: browser')}' (display-mode: browser);
		@import '${getCSSDataURI('--import-color-gamut: srgb')}' (color-gamut: srgb);
		@import '${getCSSDataURI('--import-color-gamut: p3')}' (color-gamut: p3);
		@import '${getCSSDataURI('--import-color-gamut: rec2020')}' (color-gamut: rec2020);
		@import '${getCSSDataURI('--import-orientation: landscape')}' (orientation: landscape);
		@import '${getCSSDataURI('--import-orientation: portrait')}' (orientation: portrait);
		</style>
		`;
        body.innerHTML = `
		<style>
		@media (prefers-reduced-motion: no-preference) {body {--prefers-reduced-motion: no-preference}}
		@media (prefers-reduced-motion: reduce) {body {--prefers-reduced-motion: reduce}}
		@media (prefers-color-scheme: light) {body {--prefers-color-scheme: light}}
		@media (prefers-color-scheme: dark) {body {--prefers-color-scheme: dark}}
		@media (monochrome) {body {--monochrome: monochrome}}
		@media (monochrome: 0) {body {--monochrome: non-monochrome}}
		@media (inverted-colors: inverted) {body {--inverted-colors: inverted}}
		@media (inverted-colors: none) {body {--inverted-colors: none}}
		@media (forced-colors: none) {body {--forced-colors: none}}
		@media (forced-colors: active) {body {--forced-colors: active}}
		@media (any-hover: hover) {body {--any-hover: hover}}
		@media (any-hover: none) {body {--any-hover: none}}
		@media (hover: hover) {body {--hover: hover}}
		@media (hover: none) {body {--hover: none}}
		@media (any-pointer: fine) {body {--any-pointer: fine}}
		@media (any-pointer: coarse) {body {--any-pointer: coarse}}
		@media (any-pointer: none) {body {--any-pointer: none}}
		@media (pointer: fine) {body {--pointer: fine}}
		@media (pointer: coarse) {body {--pointer: coarse}}
		@media (pointer: none) {body {--pointer: none}}
		@media (device-aspect-ratio: ${deviceAspectRatio}) {body {--device-aspect-ratio: ${deviceAspectRatio}}}
		@media (device-width: ${width}px) and (device-height: ${height}px) {body {--device-screen: ${width} x ${height}}}
		@media (display-mode: fullscreen) {body {--display-mode: fullscreen}}
		@media (display-mode: standalone) {body {--display-mode: standalone}}
		@media (display-mode: minimal-ui) {body {--display-mode: minimal-ui}}
		@media (display-mode: browser) {body {--display-mode: browser}}
		@media (color-gamut: srgb) {body {--color-gamut: srgb}}
		@media (color-gamut: p3) {body {--color-gamut: p3}}
		@media (color-gamut: rec2020) {body {--color-gamut: rec2020}}
		@media (orientation: landscape) {body {--orientation: landscape}}
		@media (orientation: portrait) {body {--orientation: portrait}}
		</style>
		${!IS_GECKO ? importStyles : ''}
		`;
        const style = getComputedStyle(body);
        const mediaCSS = {
            ['prefers-reduced-motion']: style.getPropertyValue('--prefers-reduced-motion').trim() || undefined,
            ['prefers-color-scheme']: style.getPropertyValue('--prefers-color-scheme').trim() || undefined,
            monochrome: style.getPropertyValue('--monochrome').trim() || undefined,
            ['inverted-colors']: style.getPropertyValue('--inverted-colors').trim() || undefined,
            ['forced-colors']: style.getPropertyValue('--forced-colors').trim() || undefined,
            ['any-hover']: style.getPropertyValue('--any-hover').trim() || undefined,
            hover: style.getPropertyValue('--hover').trim() || undefined,
            ['any-pointer']: style.getPropertyValue('--any-pointer').trim() || undefined,
            pointer: style.getPropertyValue('--pointer').trim() || undefined,
            ['device-aspect-ratio']: style.getPropertyValue('--device-aspect-ratio').trim() || undefined,
            ['device-screen']: style.getPropertyValue('--device-screen').trim() || undefined,
            ['display-mode']: style.getPropertyValue('--display-mode').trim() || undefined,
            ['color-gamut']: style.getPropertyValue('--color-gamut').trim() || undefined,
            orientation: style.getPropertyValue('--orientation').trim() || undefined,
        };
        const importCSS = IS_GECKO ? undefined : {
            ['prefers-reduced-motion']: style.getPropertyValue('--import-prefers-reduced-motion').trim() || undefined,
            ['prefers-color-scheme']: style.getPropertyValue('--import-prefers-color-scheme').trim() || undefined,
            monochrome: style.getPropertyValue('--import-monochrome').trim() || undefined,
            ['inverted-colors']: style.getPropertyValue('--import-inverted-colors').trim() || undefined,
            ['forced-colors']: style.getPropertyValue('--import-forced-colors').trim() || undefined,
            ['any-hover']: style.getPropertyValue('--import-any-hover').trim() || undefined,
            hover: style.getPropertyValue('--import-hover').trim() || undefined,
            ['any-pointer']: style.getPropertyValue('--import-any-pointer').trim() || undefined,
            pointer: style.getPropertyValue('--import-pointer').trim() || undefined,
            ['device-aspect-ratio']: style.getPropertyValue('--import-device-aspect-ratio').trim() || undefined,
            ['device-screen']: style.getPropertyValue('--import-device-screen').trim() || undefined,
            ['display-mode']: style.getPropertyValue('--import-display-mode').trim() || undefined,
            ['color-gamut']: style.getPropertyValue('--import-color-gamut').trim() || undefined,
            orientation: style.getPropertyValue('--import-orientation').trim() || undefined,
        };
        // get screen query
        const screenQuery = getScreenMedia({ body, width, height });
        logTestResult({ time: timer.stop(), test: 'css media', passed: true });
        return { importCSS, mediaCSS, matchMediaCSS, screenQuery };
    }
    catch (error) {
        logTestResult({ test: 'css media', passed: false });
        captureError(error);
        return;
    }
}
function cssMediaHTML(fp) {
    if (!fp.css) {
        return `
		<div class="col-six undefined">
			<strong>CSS Media Queries</strong>
			<div>@media: ${HTMLNote.BLOCKED}</div>
			<div>@import: ${HTMLNote.BLOCKED}</div>
			<div>matchMedia: ${HTMLNote.BLOCKED}</div>
			<div>touch device: ${HTMLNote.BLOCKED}</div>
			<div>screen query: ${HTMLNote.BLOCKED}</div>
		</div>`;
    }
    const { cssMedia: data, } = fp;
    const { $hash, importCSS, mediaCSS, matchMediaCSS, screenQuery, } = data;
    return `
	<div class="relative col-six">
		<span class="aside-note">${performanceLogger.getLog()['css media']}</span>
		<strong>CSS Media Queries</strong><span class="hash">${hashSlice($hash)}</span>
		<div>@media: ${!mediaCSS || !Object.keys(mediaCSS).filter((key) => !!mediaCSS[key]).length ?
        HTMLNote.BLOCKED :
        modal('creep-css-media', `<strong>@media</strong><br><br>${Object.keys(mediaCSS).map((key) => `${key}: ${mediaCSS[key] || HTMLNote.UNSUPPORTED}`).join('<br>')}`, hashMini(mediaCSS))}</div>
		<div>@import: ${!importCSS || !Object.keys(importCSS).filter((key) => !!importCSS[key]).length ?
        HTMLNote.UNSUPPORTED :
        modal('creep-css-import', `<strong>@import</strong><br><br>${Object.keys(importCSS).map((key) => `${key}: ${importCSS[key] || HTMLNote.UNSUPPORTED}`).join('<br>')}`, hashMini(importCSS))}</div>
		<div>matchMedia: ${!matchMediaCSS || !Object.keys(matchMediaCSS).filter((key) => !!matchMediaCSS[key]).length ?
        HTMLNote.BLOCKED :
        modal('creep-css-match-media', `<strong>matchMedia</strong><br><br>${Object.keys(matchMediaCSS).map((key) => `${key}: ${matchMediaCSS[key] || HTMLNote.UNSUPPORTED}`).join('<br>')}`, hashMini(matchMediaCSS))}</div>
		<div>touch device: ${!mediaCSS ? HTMLNote.BLOCKED : mediaCSS['any-pointer'] == 'coarse' ? true : HTMLNote.UNKNOWN}</div>
		<div>screen query: ${!screenQuery ? HTMLNote.BLOCKED : `${screenQuery.width} x ${screenQuery.height}`}</div>
	</div>
	`;
}

function getHTMLElementVersion() {
    try {
        const timer = createTimer();
        timer.start();
        const keys = [];
        // eslint-disable-next-line guard-for-in
        for (const key in document.documentElement) {
            keys.push(key);
        }
        logTestResult({ time: timer.stop(), test: 'html element', passed: true });
        return { keys };
    }
    catch (error) {
        logTestResult({ test: 'html element', passed: false });
        captureError(error);
        return;
    }
}
function htmlElementVersionHTML(fp) {
    if (!fp.htmlElementVersion) {
        return `
		<div class="col-six undefined">
			<strong>HTMLElement</strong>
			<div>keys (0): ${HTMLNote.Blocked}</div>
			<div>
				<div>${HTMLNote.Blocked}</div>
			</div>
		</div>`;
    }
    const { htmlElementVersion: { $hash, keys, }, } = fp;
    return `
	<div class="relative col-six">
		<span class="aside-note">${performanceLogger.getLog()['html element']}</span>
		<strong>HTMLElement</strong><span class="hash">${hashSlice($hash)}</span>
		<div>keys (${count(keys)}): ${keys && keys.length ? modal('creep-html-element-version', keys.join(', ')) : HTMLNote.Blocked}</div>
		<div class="blurred" id="html-element-samples">
			<div>0% of engine</div>
		</div>
	</div>
	`;
}

// inspired by
// https://privacycheck.sec.lrz.de/active/fp_gcr/fp_getclientrects.html
// https://privacycheck.sec.lrz.de/active/fp_e/fp_emoji.html
async function getClientRects() {
    try {
        const timer = createTimer();
        await queueEvent(timer);
        const toNativeObject = (domRect) => {
            return {
                bottom: domRect.bottom,
                height: domRect.height,
                left: domRect.left,
                right: domRect.right,
                width: domRect.width,
                top: domRect.top,
                x: domRect.x,
                y: domRect.y,
            };
        };
        let lied = (lieProps['Element.getClientRects'] ||
            lieProps['Element.getBoundingClientRect'] ||
            lieProps['Range.getClientRects'] ||
            lieProps['Range.getBoundingClientRect'] ||
            lieProps['String.fromCodePoint']) || false;
        const getBestRect = (lieProps, doc, el) => {
            let range;
            if (!lieProps['Element.getClientRects']) {
                return el.getClientRects()[0];
            }
            else if (!lieProps['Element.getBoundingClientRect']) {
                return el.getBoundingClientRect();
            }
            else if (!lieProps['Range.getClientRects']) {
                range = doc.createRange();
                range.selectNode(el);
                return range.getClientRects()[0];
            }
            range = doc.createRange();
            range.selectNode(el);
            return range.getBoundingClientRect();
        };
        const doc = (PHANTOM_DARKNESS &&
            PHANTOM_DARKNESS.document &&
            PHANTOM_DARKNESS.document.body ? PHANTOM_DARKNESS.document :
            document);
        const rectsId = `${instanceId}-client-rects-div`;
        const fontId = 'domrect-font-detector';
        // const chars = `mmmmmmmmmmlli`
        // const emojiChar = String.fromCodePoint(128512)
        const divElement = document.createElement('div');
        divElement.setAttribute('id', rectsId);
        doc.body.appendChild(divElement);
        patch(divElement, html `
		<div id="${rectsId}">
			<style>
			.rect-known {
				top: 0;
				left: 0;
				position: absolute;
				visibility: hidden;
				width: 100px;
				height: 100px;
				transform: rotate(45deg);
			}
			</style>
			<div class="rect-known"></div>
			<div style="perspective:100px;width:1000.099%;" id="rect-container">
				<style>
				.rects {
					width: 1000%;
					height: 1000%;
					max-width: 1000%;
				}
				.absolute {
					position: absolute;
				}
				#cRect1 {
					border: solid 2.715px;
					border-color: #F72585;
					padding: 3.98px;
					margin-left: 12.12px;
				}
				#cRect2 {
					border: solid 2px;
					border-color: #7209B7;
					font-size: 30px;
					margin-top: 20px;
					padding: 3.98px;
					transform: skewY(23.1753218deg) rotate3d(10.00099, 90, 0.100000000000009, 60000000000008.00000009deg);
				}
				#cRect3 {
					border: solid 2.89px;
					border-color: #3A0CA3;
					font-size: 45px;
					transform: skewY(-23.1753218deg) scale(1099.0000000099, 1.89) matrix(1.11, 2.0001, -1.0001, 1.009, 150, 94.4);
					margin-top: 50px;
				}
				#cRect4 {
					border: solid 2px;
					border-color: #4361EE;
					transform: matrix(1.11, 2.0001, -1.0001, 1.009, 150, 94.4);
					margin-top: 11.1331px;
					margin-left: 12.1212px;
					padding: 4.4545px;
					left: 239.4141px;
					top: 8.5050px;
				}
				#cRect5 {
					border: solid 2px;
					border-color: #4CC9F0;
					margin-left: 42.395pt;
				}
				#cRect6 {
					border: solid 2px;
					border-color: #F72585;
					transform: perspective(12890px) translateZ(101.5px);
					padding: 12px;
				}
				#cRect7 {
					margin-top: -350.552px;
					margin-left: 0.9099rem;
					border: solid 2px;
					border-color: #4361EE;
				}
				#cRect8 {
					margin-top: -150.552px;
					margin-left: 15.9099rem;
					border: solid 2px;
					border-color: #3A0CA3;
				}
				#cRect9 {
					margin-top: -110.552px;
					margin-left: 15.9099rem;
					border: solid 2px;
					border-color: #7209B7;
				}
				#cRect10 {
					margin-top: -315.552px;
					margin-left: 15.9099rem;
					border: solid 2px;
					border-color: #F72585;
				}
				#cRect11 {
					width: 10px;
					height: 10px;
					margin-left: 15.0000009099rem;
					border: solid 2px;
					border-color: #F72585;
				}
				#cRect12 {
					width: 10px;
					height: 10px;
					margin-left: 15.0000009099rem;
					border: solid 2px;
					border-color: #F72585;
				}
				#rect-container .shift-dom-rect {
					top: 1px !important;
					left: 1px !important;
				}
				</style>
				<div id="cRect1" class="rects"></div>
				<div id="cRect2" class="rects"></div>
				<div id="cRect3" class="rects"></div>
				<div id="cRect4" class="rects absolute"></div>
				<div id="cRect5" class="rects"></div>
				<div id="cRect6" class="rects"></div>
				<div id="cRect7" class="rects absolute"></div>
				<div id="cRect8" class="rects absolute"></div>
				<div id="cRect9" class="rects absolute"></div>
				<div id="cRect10" class="rects absolute"></div>
				<div id="cRect11" class="rects"></div>
				<div id="cRect12" class="rects"></div>
				<div id="emoji" class="emojis"></div>
			</div>
			<style>
				#${fontId} {
					--font: '';
					position: absolute !important;
					left: -9999px!important;
					font-size: 256px !important;
					font-style: normal !important;
					font-weight: normal !important;
					letter-spacing: normal !important;
					line-break: auto !important;
					line-height: normal !important;
					text-transform: none !important;
					text-align: left !important;
					text-decoration: none !important;
					text-shadow: none !important;
					white-space: normal !important;
					word-break: normal !important;
					word-spacing: normal !important;
					/* in order to test scrollWidth, clientWidth, etc. */
					padding: 0 !important;
					margin: 0 !important;
				}
				#${fontId}::after {
					font-family: var(--font);
					content: '${EMOJIS.join('')}';
				}
			</style>
			<span id="${fontId}"></span>
			<div id="emoji-container">
				<style>
				.domrect-emoji {
					font-family: ${CSS_FONT_FAMILY};
					font-size: 200px !important;
					height: auto;
					position: absolute !important;
					transform: scale(1.000999);
				}
				</style>
				${EMOJIS.map((emoji) => {
            return `<div class="domrect-emoji">${emoji}</div>`;
        })}
			</div>
		</div>
		`);
        // get emoji set and system
        const pattern = new Set();
        await queueEvent(timer);
        const emojiElems = [...doc.getElementsByClassName('domrect-emoji')];
        const emojiSet = emojiElems.reduce((emojiSet, el, i) => {
            const emoji = EMOJIS[i];
            const { height, width } = getBestRect(lieProps, doc, el);
            const dimensions = `${width},${height}`;
            if (!pattern.has(dimensions)) {
                pattern.add(dimensions);
                emojiSet.add(emoji);
            }
            return emojiSet;
        }, new Set());
        const domrectSystemSum = 0.00001 * [...pattern].map((x) => {
            return x.split(',').reduce((acc, x) => acc += (+x || 0), 0);
        }).reduce((acc, x) => acc += x, 0);
        // get clientRects
        const range = document.createRange();
        const rectElems = doc.getElementsByClassName('rects');
        const elementClientRects = [...rectElems].map((el) => {
            return toNativeObject(el.getClientRects()[0]);
        });
        const elementBoundingClientRect = [...rectElems].map((el) => {
            return toNativeObject(el.getBoundingClientRect());
        });
        const rangeClientRects = [...rectElems].map((el) => {
            range.selectNode(el);
            return toNativeObject(range.getClientRects()[0]);
        });
        const rangeBoundingClientRect = [...rectElems].map((el) => {
            range.selectNode(el);
            return toNativeObject(el.getBoundingClientRect());
        });
        // detect failed shift calculation
        // inspired by https://arkenfox.github.io/TZP
        const rect4 = [...rectElems][3];
        const { top: initialTop } = elementClientRects[3];
        rect4.classList.add('shift-dom-rect');
        const { top: shiftedTop } = toNativeObject(rect4.getClientRects()[0]);
        rect4.classList.remove('shift-dom-rect');
        const { top: unshiftedTop } = toNativeObject(rect4.getClientRects()[0]);
        const diff = initialTop - shiftedTop;
        const unshiftLie = diff != (unshiftedTop - shiftedTop);
        if (unshiftLie) {
            lied = true;
            documentLie('Element.getClientRects', 'failed unshift calculation');
        }
        // detect failed math calculation lie
        let mathLie = false;
        elementClientRects.forEach((rect) => {
            const { right, left, width, bottom, top, height, x, y } = rect;
            if (right - left != width ||
                bottom - top != height ||
                right - x != width ||
                bottom - y != height) {
                lied = true;
                mathLie = true;
            }
            return;
        });
        if (mathLie) {
            documentLie('Element.getClientRects', 'failed math calculation');
        }
        // detect equal elements mismatch lie
        const { right: right1, left: left1 } = elementClientRects[10];
        const { right: right2, left: left2 } = elementClientRects[11];
        if (right1 != right2 || left1 != left2) {
            documentLie('Element.getClientRects', 'equal elements mismatch');
            lied = true;
        }
        // detect unknown dimensions
        const elKnown = [...doc.getElementsByClassName('rect-known')][0];
        const dimensionsKnown = toNativeObject(elKnown.getClientRects()[0]);
        const knownSum = Object.keys(dimensionsKnown)
            .reduce((acc, key) => (acc += +dimensionsKnown[key]), 0);
        // console.log(knownSum)
        if (IS_BLINK) {
            const zoom = {
                '441.4213562011719': true,
                '441.3523979187012': true,
                '441.4214057922363': true, // 90
            };
            if (!zoom[knownSum]) {
                documentLie('Element.getClientRects', 'unknown dimensions');
                lied = true;
            }
        }
        else if (IS_GECKO) {
            const zoom = {
                '441.3666687011719': true, // 100, etc
            };
            if (!zoom[knownSum]) {
                documentLie('Element.getClientRects', 'unknown dimensions');
                lied = true;
            }
        }
        doc.body.removeChild(doc.getElementById(rectsId));
        logTestResult({ time: timer.stop(), test: 'rects', passed: true });
        return {
            elementClientRects,
            elementBoundingClientRect,
            rangeClientRects,
            rangeBoundingClientRect,
            emojiSet: [...emojiSet],
            domrectSystemSum,
            lied,
        };
    }
    catch (error) {
        logTestResult({ test: 'rects', passed: false });
        captureError(error);
        return;
    }
}
function clientRectsHTML(fp) {
    if (!fp.clientRects) {
        return `
		<div class="col-six undefined">
			<strong>DOMRect</strong>
			<div>elems A: ${HTMLNote.BLOCKED}</div>
			<div>elems B: ${HTMLNote.BLOCKED}</div>
			<div>range A: ${HTMLNote.BLOCKED}</div>
			<div>range B: ${HTMLNote.BLOCKED}</div>
			<div class="block-text">${HTMLNote.BLOCKED}</div>
		</div>`;
    }
    const { clientRects: { $hash, elementClientRects, elementBoundingClientRect, rangeClientRects, rangeBoundingClientRect, emojiSet, domrectSystemSum, lied, }, } = fp;
    // compute mismatch style
    const getRectSum = (rect) => Object.keys(rect).reduce((acc, key) => acc += rect[key], 0) / 100000000;
    // const reduceRectSum = n => (''+n).split('.').reduce((acc, s) => acc += +s, 0)
    const computeDiffs = (rects) => {
        if (!rects || !rects.length) {
            return;
        }
        const expectedSum = rects.reduce((acc, rect) => {
            const { right, left, width, bottom, top, height } = rect;
            const expected = {
                width: right - left,
                height: bottom - top,
                right: left + width,
                left: right - width,
                bottom: top + height,
                top: bottom - height,
                x: right - width,
                y: bottom - height,
            };
            return acc += getRectSum(expected);
        }, 0);
        const actualSum = rects.reduce((acc, rect) => acc += getRectSum(rect), 0);
        return getDiffs({
            stringA: actualSum,
            stringB: expectedSum,
            charDiff: true,
            decorate: (diff) => `<span class="bold-fail">${diff}</span>`,
        });
    };
    const helpTitle = `Element.getClientRects()\nhash: ${hashMini(emojiSet)}\n${emojiSet.map((x, i) => i && (i % 6 == 0) ? `${x}\n` : x).join('')}`;
    return `
	<div class="relative col-six${lied ? ' rejected' : ''}">
		<span class="aside-note">${performanceLogger.getLog().rects}</span>
		<strong>DOMRect</strong><span class="${lied ? 'lies ' : ''}hash">${hashSlice($hash)}</span>
		<div class="help" title="Element.getClientRects()">elems A: ${computeDiffs(elementClientRects)}</div>
		<div class="help" title="Element.getBoundingClientRect()">elems B: ${computeDiffs(elementBoundingClientRect)}</div>
		<div class="help" title="Range.getClientRects()">range A: ${computeDiffs(rangeClientRects)}</div>
		<div class="help" title="Range.getBoundingClientRect()">range B: ${computeDiffs(rangeBoundingClientRect)}</div>
		<div class="block-text help relative" title="${helpTitle}">
			<span>${domrectSystemSum || HTMLNote.UNSUPPORTED}</span>
			<span class="grey jumbo" style="font-family: ${CSS_FONT_FAMILY}">${formatEmojiSet(emojiSet)}</span>
		</div>
	</div>
	`;
}

function getErrors(errFns) {
    const errors = [];
    let i;
    const len = errFns.length;
    for (i = 0; i < len; i++) {
        try {
            errFns[i]();
        }
        catch (err) {
            errors.push(err.message);
        }
    }
    return errors;
}
function getConsoleErrors() {
    try {
        const timer = createTimer();
        timer.start();
        const errorTests = [
            () => new Function('alert(")')(),
            () => new Function('const foo;foo.bar')(),
            () => new Function('null.bar')(),
            () => new Function('abc.xyz = 123')(),
            () => new Function('const foo;foo.bar')(),
            () => new Function('(1).toString(1000)')(),
            () => new Function('[...undefined].length')(),
            () => new Function('var x = new Array(-1)')(),
            () => new Function('const a=1; const a=2;')(),
        ];
        const errors = getErrors(errorTests);
        logTestResult({ time: timer.stop(), test: 'console errors', passed: true });
        return { errors };
    }
    catch (error) {
        logTestResult({ test: 'console errors', passed: false });
        captureError(error);
        return;
    }
}
function consoleErrorsHTML(fp) {
    if (!fp.consoleErrors) {
        return `
		<div class="col-six undefined">
			<strong>Error</strong>
			<div>results: ${HTMLNote.BLOCKED}</div>
			<div>
				<div>${HTMLNote.BLOCKED}</div>
			</div>
		</div>`;
    }
    const { consoleErrors: { $hash, errors, }, } = fp;
    const results = Object.keys(errors).map((key) => {
        const value = errors[key];
        return `${+key + 1}: ${value}`;
    });
    return `
	<div class="relative col-six">
		<span class="aside-note">${performanceLogger.getLog()['console errors']}</span>
		<strong>Error</strong><span class="hash">${hashSlice($hash)}</span>
		<div>results: ${modal('creep-console-errors', results.join('<br>'))}</div>
		<div class="blurred" id="error-samples">
			<div>0% of engine</div>
		</div>
	</div>
	`;
}

/*
Steps to update:
0. get beta release desktop/mobile
1. get diffs from template
2. update feature list
3. update stable features object
*/
const getStableFeatures = () => ({
    'Chrome': {
        version: 105,
        windowKeys: `Object, Function, Array, Number, parseFloat, parseInt, Infinity, NaN, undefined, Boolean, String, Symbol, Date, Promise, RegExp, Error, AggregateError, EvalError, RangeError, ReferenceError, SyntaxError, TypeError, URIError, globalThis, JSON, Math, Intl, ArrayBuffer, Uint8Array, Int8Array, Uint16Array, Int16Array, Uint32Array, Int32Array, Float32Array, Float64Array, Uint8ClampedArray, BigUint64Array, BigInt64Array, DataView, Map, BigInt, Set, WeakMap, WeakSet, Proxy, Reflect, FinalizationRegistry, WeakRef, decodeURI, decodeURIComponent, encodeURI, encodeURIComponent, escape, unescape, eval, isFinite, isNaN, console, Option, Image, Audio, webkitURL, webkitRTCPeerConnection, webkitMediaStream, WebKitMutationObserver, WebKitCSSMatrix, XPathResult, XPathExpression, XPathEvaluator, XMLSerializer, XMLHttpRequestUpload, XMLHttpRequestEventTarget, XMLHttpRequest, XMLDocument, WritableStreamDefaultWriter, WritableStreamDefaultController, WritableStream, Worker, Window, WheelEvent, WebSocket, WebGLVertexArrayObject, WebGLUniformLocation, WebGLTransformFeedback, WebGLTexture, WebGLSync, WebGLShaderPrecisionFormat, WebGLShader, WebGLSampler, WebGLRenderingContext, WebGLRenderbuffer, WebGLQuery, WebGLProgram, WebGLFramebuffer, WebGLContextEvent, WebGLBuffer, WebGLActiveInfo, WebGL2RenderingContext, WaveShaperNode, VisualViewport, ValidityState, VTTCue, UserActivation, URLSearchParams, URL, UIEvent, TreeWalker, TransitionEvent, TransformStream, TrackEvent, TouchList, TouchEvent, Touch, TimeRanges, TextTrackList, TextTrackCueList, TextTrackCue, TextTrack, TextMetrics, TextEvent, TextEncoderStream, TextEncoder, TextDecoderStream, TextDecoder, Text, TaskAttributionTiming, SyncManager, SubmitEvent, StyleSheetList, StyleSheet, StylePropertyMapReadOnly, StylePropertyMap, StorageEvent, Storage, StereoPannerNode, StaticRange, ShadowRoot, Selection, SecurityPolicyViolationEvent, ScriptProcessorNode, ScreenOrientation, Screen, Scheduling, SVGViewElement, SVGUseElement, SVGUnitTypes, SVGTransformList, SVGTransform, SVGTitleElement, SVGTextPositioningElement, SVGTextPathElement, SVGTextElement, SVGTextContentElement, SVGTSpanElement, SVGSymbolElement, SVGSwitchElement, SVGStyleElement, SVGStringList, SVGStopElement, SVGSetElement, SVGScriptElement, SVGSVGElement, SVGRectElement, SVGRect, SVGRadialGradientElement, SVGPreserveAspectRatio, SVGPolylineElement, SVGPolygonElement, SVGPointList, SVGPoint, SVGPatternElement, SVGPathElement, SVGNumberList, SVGNumber, SVGMetadataElement, SVGMatrix, SVGMaskElement, SVGMarkerElement, SVGMPathElement, SVGLinearGradientElement, SVGLineElement, SVGLengthList, SVGLength, SVGImageElement, SVGGraphicsElement, SVGGradientElement, SVGGeometryElement, SVGGElement, SVGForeignObjectElement, SVGFilterElement, SVGFETurbulenceElement, SVGFETileElement, SVGFESpotLightElement, SVGFESpecularLightingElement, SVGFEPointLightElement, SVGFEOffsetElement, SVGFEMorphologyElement, SVGFEMergeNodeElement, SVGFEMergeElement, SVGFEImageElement, SVGFEGaussianBlurElement, SVGFEFuncRElement, SVGFEFuncGElement, SVGFEFuncBElement, SVGFEFuncAElement, SVGFEFloodElement, SVGFEDropShadowElement, SVGFEDistantLightElement, SVGFEDisplacementMapElement, SVGFEDiffuseLightingElement, SVGFEConvolveMatrixElement, SVGFECompositeElement, SVGFEComponentTransferElement, SVGFEColorMatrixElement, SVGFEBlendElement, SVGEllipseElement, SVGElement, SVGDescElement, SVGDefsElement, SVGComponentTransferFunctionElement, SVGClipPathElement, SVGCircleElement, SVGAnimationElement, SVGAnimatedTransformList, SVGAnimatedString, SVGAnimatedRect, SVGAnimatedPreserveAspectRatio, SVGAnimatedNumberList, SVGAnimatedNumber, SVGAnimatedLengthList, SVGAnimatedLength, SVGAnimatedInteger, SVGAnimatedEnumeration, SVGAnimatedBoolean, SVGAnimatedAngle, SVGAnimateTransformElement, SVGAnimateMotionElement, SVGAnimateElement, SVGAngle, SVGAElement, Response, ResizeObserverSize, ResizeObserverEntry, ResizeObserver, Request, ReportingObserver, ReadableStreamDefaultReader, ReadableStreamDefaultController, ReadableStreamBYOBRequest, ReadableStreamBYOBReader, ReadableStream, ReadableByteStreamController, Range, RadioNodeList, RTCTrackEvent, RTCStatsReport, RTCSessionDescription, RTCSctpTransport, RTCRtpTransceiver, RTCRtpSender, RTCRtpReceiver, RTCPeerConnectionIceEvent, RTCPeerConnectionIceErrorEvent, RTCPeerConnection, RTCIceCandidate, RTCErrorEvent, RTCError, RTCEncodedVideoFrame, RTCEncodedAudioFrame, RTCDtlsTransport, RTCDataChannelEvent, RTCDataChannel, RTCDTMFToneChangeEvent, RTCDTMFSender, RTCCertificate, PromiseRejectionEvent, ProgressEvent, ProcessingInstruction, PopStateEvent, PointerEvent, PluginArray, Plugin, PeriodicWave, PerformanceTiming, PerformanceServerTiming, PerformanceResourceTiming, PerformancePaintTiming, PerformanceObserverEntryList, PerformanceObserver, PerformanceNavigationTiming, PerformanceNavigation, PerformanceMeasure, PerformanceMark, PerformanceLongTaskTiming, PerformanceEventTiming, PerformanceEntry, PerformanceElementTiming, Performance, Path2D, PannerNode, PageTransitionEvent, OverconstrainedError, OscillatorNode, OffscreenCanvasRenderingContext2D, OffscreenCanvas, OfflineAudioContext, OfflineAudioCompletionEvent, NodeList, NodeIterator, NodeFilter, Node, NetworkInformation, Navigator, NamedNodeMap, MutationRecord, MutationObserver, MutationEvent, MouseEvent, MimeTypeArray, MimeType, MessagePort, MessageEvent, MessageChannel, MediaStreamTrackEvent, MediaStreamEvent, MediaStreamAudioSourceNode, MediaStreamAudioDestinationNode, MediaStream, MediaRecorder, MediaQueryListEvent, MediaQueryList, MediaList, MediaError, MediaEncryptedEvent, MediaElementAudioSourceNode, MediaCapabilities, Location, LayoutShiftAttribution, LayoutShift, LargestContentfulPaint, KeyframeEffect, KeyboardEvent, IntersectionObserverEntry, IntersectionObserver, InputEvent, InputDeviceInfo, InputDeviceCapabilities, ImageData, ImageCapture, ImageBitmapRenderingContext, ImageBitmap, IdleDeadline, IIRFilterNode, IDBVersionChangeEvent, IDBTransaction, IDBRequest, IDBOpenDBRequest, IDBObjectStore, IDBKeyRange, IDBIndex, IDBFactory, IDBDatabase, IDBCursorWithValue, IDBCursor, History, Headers, HashChangeEvent, HTMLVideoElement, HTMLUnknownElement, HTMLUListElement, HTMLTrackElement, HTMLTitleElement, HTMLTimeElement, HTMLTextAreaElement, HTMLTemplateElement, HTMLTableSectionElement, HTMLTableRowElement, HTMLTableElement, HTMLTableColElement, HTMLTableCellElement, HTMLTableCaptionElement, HTMLStyleElement, HTMLSpanElement, HTMLSourceElement, HTMLSlotElement, HTMLSelectElement, HTMLScriptElement, HTMLQuoteElement, HTMLProgressElement, HTMLPreElement, HTMLPictureElement, HTMLParamElement, HTMLParagraphElement, HTMLOutputElement, HTMLOptionsCollection, HTMLOptionElement, HTMLOptGroupElement, HTMLObjectElement, HTMLOListElement, HTMLModElement, HTMLMeterElement, HTMLMetaElement, HTMLMenuElement, HTMLMediaElement, HTMLMarqueeElement, HTMLMapElement, HTMLLinkElement, HTMLLegendElement, HTMLLabelElement, HTMLLIElement, HTMLInputElement, HTMLImageElement, HTMLIFrameElement, HTMLHtmlElement, HTMLHeadingElement, HTMLHeadElement, HTMLHRElement, HTMLFrameSetElement, HTMLFrameElement, HTMLFormElement, HTMLFormControlsCollection, HTMLFontElement, HTMLFieldSetElement, HTMLEmbedElement, HTMLElement, HTMLDocument, HTMLDivElement, HTMLDirectoryElement, HTMLDialogElement, HTMLDetailsElement, HTMLDataListElement, HTMLDataElement, HTMLDListElement, HTMLCollection, HTMLCanvasElement, HTMLButtonElement, HTMLBodyElement, HTMLBaseElement, HTMLBRElement, HTMLAudioElement, HTMLAreaElement, HTMLAnchorElement, HTMLAllCollection, GeolocationPositionError, GeolocationPosition, GeolocationCoordinates, Geolocation, GamepadHapticActuator, GamepadEvent, GamepadButton, Gamepad, GainNode, FormDataEvent, FormData, FontFaceSetLoadEvent, FontFace, FocusEvent, FileReader, FileList, File, FeaturePolicy, External, EventTarget, EventSource, EventCounts, Event, ErrorEvent, ElementInternals, Element, DynamicsCompressorNode, DragEvent, DocumentType, DocumentFragment, Document, DelayNode, DecompressionStream, DataTransferItemList, DataTransferItem, DataTransfer, DOMTokenList, DOMStringMap, DOMStringList, DOMRectReadOnly, DOMRectList, DOMRect, DOMQuad, DOMPointReadOnly, DOMPoint, DOMParser, DOMMatrixReadOnly, DOMMatrix, DOMImplementation, DOMException, DOMError, CustomEvent, CustomElementRegistry, Crypto, CountQueuingStrategy, ConvolverNode, ConstantSourceNode, CompressionStream, CompositionEvent, Comment, CloseEvent, ClipboardEvent, CharacterData, ChannelSplitterNode, ChannelMergerNode, CanvasRenderingContext2D, CanvasPattern, CanvasGradient, CanvasFilter, CanvasCaptureMediaStreamTrack, CSSVariableReferenceValue, CSSUnparsedValue, CSSUnitValue, CSSTranslate, CSSTransformValue, CSSTransformComponent, CSSSupportsRule, CSSStyleValue, CSSStyleSheet, CSSStyleRule, CSSStyleDeclaration, CSSSkewY, CSSSkewX, CSSSkew, CSSScale, CSSRuleList, CSSRule, CSSRotate, CSSPropertyRule, CSSPositionValue, CSSPerspective, CSSPageRule, CSSNumericValue, CSSNumericArray, CSSNamespaceRule, CSSMediaRule, CSSMatrixComponent, CSSMathValue, CSSMathSum, CSSMathProduct, CSSMathNegate, CSSMathMin, CSSMathMax, CSSMathInvert, CSSMathClamp, CSSLayerStatementRule, CSSLayerBlockRule, CSSKeywordValue, CSSKeyframesRule, CSSKeyframeRule, CSSImportRule, CSSImageValue, CSSGroupingRule, CSSFontFaceRule, CSSCounterStyleRule, CSSConditionRule, CSS, CDATASection, ByteLengthQueuingStrategy, BroadcastChannel, BlobEvent, Blob, BiquadFilterNode, BeforeUnloadEvent, BeforeInstallPromptEvent, BaseAudioContext, BarProp, AudioWorkletNode, AudioScheduledSourceNode, AudioProcessingEvent, AudioParamMap, AudioParam, AudioNode, AudioListener, AudioDestinationNode, AudioContext, AudioBufferSourceNode, AudioBuffer, Attr, AnimationEvent, AnimationEffect, Animation, AnalyserNode, AbstractRange, AbortSignal, AbortController, window, self, document, name, location, customElements, history, locationbar, menubar, personalbar, scrollbars, statusbar, toolbar, status, closed, frames, length, top, opener, parent, frameElement, navigator, origin, external, screen, innerWidth, innerHeight, scrollX, pageXOffset, scrollY, pageYOffset, visualViewport, screenX, screenY, outerWidth, outerHeight, devicePixelRatio, event, clientInformation, offscreenBuffering, screenLeft, screenTop, defaultStatus, defaultstatus, styleMedia, onsearch, isSecureContext, performance, onappinstalled, onbeforeinstallprompt, crypto, indexedDB, webkitStorageInfo, sessionStorage, localStorage, onbeforexrselect, onabort, onblur, oncancel, oncanplay, oncanplaythrough, onchange, onclick, onclose, oncontextlost, oncontextmenu, oncontextrestored, oncuechange, ondblclick, ondrag, ondragend, ondragenter, ondragleave, ondragover, ondragstart, ondrop, ondurationchange, onemptied, onended, onerror, onfocus, onformdata, oninput, oninvalid, onkeydown, onkeypress, onkeyup, onload, onloadeddata, onloadedmetadata, onloadstart, onmousedown, onmouseenter, onmouseleave, onmousemove, onmouseout, onmouseover, onmouseup, onmousewheel, onpause, onplay, onplaying, onprogress, onratechange, onreset, onresize, onscroll, onsecuritypolicyviolation, onseeked, onseeking, onselect, onslotchange, onstalled, onsubmit, onsuspend, ontimeupdate, ontoggle, onvolumechange, onwaiting, onwebkitanimationend, onwebkitanimationiteration, onwebkitanimationstart, onwebkittransitionend, onwheel, onauxclick, ongotpointercapture, onlostpointercapture, onpointerdown, onpointermove, onpointerup, onpointercancel, onpointerover, onpointerout, onpointerenter, onpointerleave, onselectstart, onselectionchange, onanimationend, onanimationiteration, onanimationstart, ontransitionrun, ontransitionstart, ontransitionend, ontransitioncancel, onafterprint, onbeforeprint, onbeforeunload, onhashchange, onlanguagechange, onmessage, onmessageerror, onoffline, ononline, onpagehide, onpageshow, onpopstate, onrejectionhandled, onstorage, onunhandledrejection, onunload, crossOriginIsolated, alert, atob, blur, btoa, cancelAnimationFrame, cancelIdleCallback, captureEvents, clearInterval, clearTimeout, close, confirm, createImageBitmap, fetch, find, focus, getComputedStyle, getSelection, matchMedia, moveBy, moveTo, open, postMessage, print, prompt, queueMicrotask, releaseEvents, reportError, requestAnimationFrame, requestIdleCallback, resizeBy, resizeTo, scroll, scrollBy, scrollTo, setInterval, setTimeout, stop, structuredClone, webkitCancelAnimationFrame, webkitRequestAnimationFrame, Atomics, chrome, WebAssembly, caches, cookieStore, ondevicemotion, ondeviceorientation, ondeviceorientationabsolute, launchQueue, onbeforematch, AbsoluteOrientationSensor, Accelerometer, AudioWorklet, Cache, CacheStorage, Clipboard, ClipboardItem, CookieChangeEvent, CookieStore, CookieStoreManager, Credential, CredentialsContainer, CryptoKey, DeviceMotionEvent, DeviceMotionEventAcceleration, DeviceMotionEventRotationRate, DeviceOrientationEvent, FederatedCredential, Gyroscope, Keyboard, KeyboardLayoutMap, LinearAccelerationSensor, Lock, LockManager, MIDIAccess, MIDIConnectionEvent, MIDIInput, MIDIInputMap, MIDIMessageEvent, MIDIOutput, MIDIOutputMap, MIDIPort, MediaDeviceInfo, MediaDevices, MediaKeyMessageEvent, MediaKeySession, MediaKeyStatusMap, MediaKeySystemAccess, MediaKeys, NavigationPreloadManager, NavigatorManagedData, OrientationSensor, PasswordCredential, RTCIceTransport, RelativeOrientationSensor, Sensor, SensorErrorEvent, ServiceWorker, ServiceWorkerContainer, ServiceWorkerRegistration, StorageManager, SubtleCrypto, Worklet, XRDOMOverlayState, XRLayer, XRWebGLBinding, AudioData, EncodedAudioChunk, EncodedVideoChunk, ImageTrack, ImageTrackList, VideoColorSpace, VideoFrame, AudioDecoder, AudioEncoder, ImageDecoder, VideoDecoder, VideoEncoder, AuthenticatorAssertionResponse, AuthenticatorAttestationResponse, AuthenticatorResponse, PublicKeyCredential, BatteryManager, Bluetooth, BluetoothCharacteristicProperties, BluetoothDevice, BluetoothRemoteGATTCharacteristic, BluetoothRemoteGATTDescriptor, BluetoothRemoteGATTServer, BluetoothRemoteGATTService, BrowserCaptureMediaStreamTrack, CropTarget, EyeDropper, FileSystemDirectoryHandle, FileSystemFileHandle, FileSystemHandle, FileSystemWritableFileStream, FontData, FragmentDirective, GravitySensor, HID, HIDConnectionEvent, HIDDevice, HIDInputReportEvent, IdleDetector, LaunchParams, LaunchQueue, MediaStreamTrackGenerator, MediaStreamTrackProcessor, OTPCredential, PaymentAddress, PaymentRequest, PaymentResponse, PaymentMethodChangeEvent, Presentation, PresentationAvailability, PresentationConnection, PresentationConnectionAvailableEvent, PresentationConnectionCloseEvent, PresentationConnectionList, PresentationReceiver, PresentationRequest, Profiler, ScreenDetailed, ScreenDetails, Serial, SerialPort, USB, USBAlternateInterface, USBConfiguration, USBConnectionEvent, USBDevice, USBEndpoint, USBInTransferResult, USBInterface, USBIsochronousInTransferPacket, USBIsochronousInTransferResult, USBIsochronousOutTransferPacket, USBIsochronousOutTransferResult, USBOutTransferResult, VirtualKeyboard, WakeLock, WakeLockSentinel, WebTransport, WebTransportBidirectionalStream, WebTransportDatagramDuplexStream, WebTransportError, WindowControlsOverlay, WindowControlsOverlayGeometryChangeEvent, XRAnchor, XRAnchorSet, XRBoundedReferenceSpace, XRFrame, XRInputSource, XRInputSourceArray, XRInputSourceEvent, XRInputSourcesChangeEvent, XRPose, XRReferenceSpace, XRReferenceSpaceEvent, XRRenderState, XRRigidTransform, XRSession, XRSessionEvent, XRSpace, XRSystem, XRView, XRViewerPose, XRViewport, XRWebGLLayer, XRCPUDepthInformation, XRDepthInformation, XRWebGLDepthInformation, XRHitTestResult, XRHitTestSource, XRRay, XRTransientInputHitTestResult, XRTransientInputHitTestSource, XRLightEstimate, XRLightProbe, getScreenDetails, queryLocalFonts, showDirectoryPicker, showOpenFilePicker, showSaveFilePicker, originAgentCluster, trustedTypes, navigation, speechSynthesis, onpointerrawupdate, scheduler, AnimationPlaybackEvent, AnimationTimeline, CSSAnimation, CSSTransition, DocumentTimeline, BackgroundFetchManager, BackgroundFetchRecord, BackgroundFetchRegistration, BluetoothUUID, CSSContainerRule, CSSFontPaletteValuesRule, CustomStateSet, DelegatedInkTrailPresenter, Ink, MediaMetadata, MediaSession, MediaSource, SourceBuffer, SourceBufferList, MediaStreamTrack, NavigateEvent, Navigation, NavigationCurrentEntryChangeEvent, NavigationDestination, NavigationHistoryEntry, NavigationTransition, NavigatorUAData, Notification, PaymentInstruments, PaymentManager, PaymentRequestUpdateEvent, PeriodicSyncManager, PermissionStatus, Permissions, PictureInPictureEvent, PictureInPictureWindow, PushManager, PushSubscription, PushSubscriptionOptions, RemotePlayback, Scheduler, TaskController, TaskPriorityChangeEvent, TaskSignal, SharedWorker, SpeechSynthesisErrorEvent, SpeechSynthesisEvent, SpeechSynthesisUtterance, TrustedHTML, TrustedScript, TrustedScriptURL, TrustedTypePolicy, TrustedTypePolicyFactory, URLPattern, VideoPlaybackQuality, VirtualKeyboardGeometryChangeEvent, XSLTProcessor, webkitSpeechGrammar, webkitSpeechGrammarList, webkitSpeechRecognition, webkitSpeechRecognitionError, webkitSpeechRecognitionEvent, openDatabase, webkitRequestFileSystem, webkitResolveLocalFileSystemURL`,
        cssKeys: `cssText, length, parentRule, cssFloat, getPropertyPriority, getPropertyValue, item, removeProperty, setProperty, constructor, accent-color, align-content, align-items, align-self, alignment-baseline, animation-delay, animation-direction, animation-duration, animation-fill-mode, animation-iteration-count, animation-name, animation-play-state, animation-timing-function, app-region, appearance, backdrop-filter, backface-visibility, background-attachment, background-blend-mode, background-clip, background-color, background-image, background-origin, background-position, background-repeat, background-size, baseline-shift, block-size, border-block-end-color, border-block-end-style, border-block-end-width, border-block-start-color, border-block-start-style, border-block-start-width, border-bottom-color, border-bottom-left-radius, border-bottom-right-radius, border-bottom-style, border-bottom-width, border-collapse, border-end-end-radius, border-end-start-radius, border-image-outset, border-image-repeat, border-image-slice, border-image-source, border-image-width, border-inline-end-color, border-inline-end-style, border-inline-end-width, border-inline-start-color, border-inline-start-style, border-inline-start-width, border-left-color, border-left-style, border-left-width, border-right-color, border-right-style, border-right-width, border-start-end-radius, border-start-start-radius, border-top-color, border-top-left-radius, border-top-right-radius, border-top-style, border-top-width, bottom, box-shadow, box-sizing, break-after, break-before, break-inside, buffered-rendering, caption-side, caret-color, clear, clip, clip-path, clip-rule, color, color-interpolation, color-interpolation-filters, color-rendering, column-count, column-gap, column-rule-color, column-rule-style, column-rule-width, column-span, column-width, contain-intrinsic-block-size, contain-intrinsic-height, contain-intrinsic-inline-size, contain-intrinsic-size, contain-intrinsic-width, container-name, container-type, content, cursor, cx, cy, d, direction, display, dominant-baseline, empty-cells, fill, fill-opacity, fill-rule, filter, flex-basis, flex-direction, flex-grow, flex-shrink, flex-wrap, float, flood-color, flood-opacity, font-family, font-kerning, font-optical-sizing, font-palette, font-size, font-stretch, font-style, font-synthesis-small-caps, font-synthesis-style, font-synthesis-weight, font-variant, font-variant-caps, font-variant-east-asian, font-variant-ligatures, font-variant-numeric, font-weight, grid-auto-columns, grid-auto-flow, grid-auto-rows, grid-column-end, grid-column-start, grid-row-end, grid-row-start, grid-template-areas, grid-template-columns, grid-template-rows, height, hyphens, image-orientation, image-rendering, inline-size, inset-block-end, inset-block-start, inset-inline-end, inset-inline-start, isolation, justify-content, justify-items, justify-self, left, letter-spacing, lighting-color, line-break, line-height, list-style-image, list-style-position, list-style-type, margin-block-end, margin-block-start, margin-bottom, margin-inline-end, margin-inline-start, margin-left, margin-right, margin-top, marker-end, marker-mid, marker-start, mask-type, max-block-size, max-height, max-inline-size, max-width, min-block-size, min-height, min-inline-size, min-width, mix-blend-mode, object-fit, object-position, object-view-box, offset-distance, offset-path, offset-rotate, opacity, order, orphans, outline-color, outline-offset, outline-style, outline-width, overflow-anchor, overflow-clip-margin, overflow-wrap, overflow-x, overflow-y, overscroll-behavior-block, overscroll-behavior-inline, padding-block-end, padding-block-start, padding-bottom, padding-inline-end, padding-inline-start, padding-left, padding-right, padding-top, paint-order, perspective, perspective-origin, pointer-events, position, r, resize, right, rotate, row-gap, ruby-position, rx, ry, scale, scroll-behavior, scroll-margin-block-end, scroll-margin-block-start, scroll-margin-inline-end, scroll-margin-inline-start, scroll-padding-block-end, scroll-padding-block-start, scroll-padding-inline-end, scroll-padding-inline-start, scrollbar-gutter, shape-image-threshold, shape-margin, shape-outside, shape-rendering, speak, stop-color, stop-opacity, stroke, stroke-dasharray, stroke-dashoffset, stroke-linecap, stroke-linejoin, stroke-miterlimit, stroke-opacity, stroke-width, tab-size, table-layout, text-align, text-align-last, text-anchor, text-decoration, text-decoration-color, text-decoration-line, text-decoration-skip-ink, text-decoration-style, text-emphasis-color, text-emphasis-position, text-emphasis-style, text-indent, text-overflow, text-rendering, text-shadow, text-size-adjust, text-transform, text-underline-position, top, touch-action, transform, transform-origin, transform-style, transition-delay, transition-duration, transition-property, transition-timing-function, translate, unicode-bidi, user-select, vector-effect, vertical-align, visibility, white-space, widows, width, will-change, word-break, word-spacing, writing-mode, x, y, z-index, zoom, -webkit-border-horizontal-spacing, -webkit-border-image, -webkit-border-vertical-spacing, -webkit-box-align, -webkit-box-decoration-break, -webkit-box-direction, -webkit-box-flex, -webkit-box-ordinal-group, -webkit-box-orient, -webkit-box-pack, -webkit-box-reflect, -webkit-font-smoothing, -webkit-highlight, -webkit-hyphenate-character, -webkit-line-break, -webkit-line-clamp, -webkit-locale, -webkit-mask-box-image, -webkit-mask-box-image-outset, -webkit-mask-box-image-repeat, -webkit-mask-box-image-slice, -webkit-mask-box-image-source, -webkit-mask-box-image-width, -webkit-mask-clip, -webkit-mask-composite, -webkit-mask-image, -webkit-mask-origin, -webkit-mask-position, -webkit-mask-repeat, -webkit-mask-size, -webkit-print-color-adjust, -webkit-rtl-ordering, -webkit-tap-highlight-color, -webkit-text-combine, -webkit-text-decorations-in-effect, -webkit-text-fill-color, -webkit-text-orientation, -webkit-text-security, -webkit-text-stroke-color, -webkit-text-stroke-width, -webkit-user-drag, -webkit-user-modify, -webkit-writing-mode, accentColor, additiveSymbols, alignContent, alignItems, alignSelf, alignmentBaseline, all, animation, animationDelay, animationDirection, animationDuration, animationFillMode, animationIterationCount, animationName, animationPlayState, animationTimingFunction, appRegion, ascentOverride, aspectRatio, backdropFilter, backfaceVisibility, background, backgroundAttachment, backgroundBlendMode, backgroundClip, backgroundColor, backgroundImage, backgroundOrigin, backgroundPosition, backgroundPositionX, backgroundPositionY, backgroundRepeat, backgroundRepeatX, backgroundRepeatY, backgroundSize, basePalette, baselineShift, blockSize, border, borderBlock, borderBlockColor, borderBlockEnd, borderBlockEndColor, borderBlockEndStyle, borderBlockEndWidth, borderBlockStart, borderBlockStartColor, borderBlockStartStyle, borderBlockStartWidth, borderBlockStyle, borderBlockWidth, borderBottom, borderBottomColor, borderBottomLeftRadius, borderBottomRightRadius, borderBottomStyle, borderBottomWidth, borderCollapse, borderColor, borderEndEndRadius, borderEndStartRadius, borderImage, borderImageOutset, borderImageRepeat, borderImageSlice, borderImageSource, borderImageWidth, borderInline, borderInlineColor, borderInlineEnd, borderInlineEndColor, borderInlineEndStyle, borderInlineEndWidth, borderInlineStart, borderInlineStartColor, borderInlineStartStyle, borderInlineStartWidth, borderInlineStyle, borderInlineWidth, borderLeft, borderLeftColor, borderLeftStyle, borderLeftWidth, borderRadius, borderRight, borderRightColor, borderRightStyle, borderRightWidth, borderSpacing, borderStartEndRadius, borderStartStartRadius, borderStyle, borderTop, borderTopColor, borderTopLeftRadius, borderTopRightRadius, borderTopStyle, borderTopWidth, borderWidth, boxShadow, boxSizing, breakAfter, breakBefore, breakInside, bufferedRendering, captionSide, caretColor, clipPath, clipRule, colorInterpolation, colorInterpolationFilters, colorRendering, colorScheme, columnCount, columnFill, columnGap, columnRule, columnRuleColor, columnRuleStyle, columnRuleWidth, columnSpan, columnWidth, columns, contain, containIntrinsicBlockSize, containIntrinsicHeight, containIntrinsicInlineSize, containIntrinsicSize, containIntrinsicWidth, container, containerName, containerType, contentVisibility, counterIncrement, counterReset, counterSet, descentOverride, dominantBaseline, emptyCells, fallback, fillOpacity, fillRule, flex, flexBasis, flexDirection, flexFlow, flexGrow, flexShrink, flexWrap, floodColor, floodOpacity, font, fontDisplay, fontFamily, fontFeatureSettings, fontKerning, fontOpticalSizing, fontPalette, fontSize, fontStretch, fontStyle, fontSynthesis, fontSynthesisSmallCaps, fontSynthesisStyle, fontSynthesisWeight, fontVariant, fontVariantCaps, fontVariantEastAsian, fontVariantLigatures, fontVariantNumeric, fontVariationSettings, fontWeight, forcedColorAdjust, gap, grid, gridArea, gridAutoColumns, gridAutoFlow, gridAutoRows, gridColumn, gridColumnEnd, gridColumnGap, gridColumnStart, gridGap, gridRow, gridRowEnd, gridRowGap, gridRowStart, gridTemplate, gridTemplateAreas, gridTemplateColumns, gridTemplateRows, imageOrientation, imageRendering, inherits, initialValue, inlineSize, inset, insetBlock, insetBlockEnd, insetBlockStart, insetInline, insetInlineEnd, insetInlineStart, justifyContent, justifyItems, justifySelf, letterSpacing, lightingColor, lineBreak, lineGapOverride, lineHeight, listStyle, listStyleImage, listStylePosition, listStyleType, margin, marginBlock, marginBlockEnd, marginBlockStart, marginBottom, marginInline, marginInlineEnd, marginInlineStart, marginLeft, marginRight, marginTop, marker, markerEnd, markerMid, markerStart, mask, maskType, maxBlockSize, maxHeight, maxInlineSize, maxWidth, maxZoom, minBlockSize, minHeight, minInlineSize, minWidth, minZoom, mixBlendMode, negative, objectFit, objectPosition, objectViewBox, offset, offsetDistance, offsetPath, offsetRotate, orientation, outline, outlineColor, outlineOffset, outlineStyle, outlineWidth, overflow, overflowAnchor, overflowClipMargin, overflowWrap, overflowX, overflowY, overrideColors, overscrollBehavior, overscrollBehaviorBlock, overscrollBehaviorInline, overscrollBehaviorX, overscrollBehaviorY, pad, padding, paddingBlock, paddingBlockEnd, paddingBlockStart, paddingBottom, paddingInline, paddingInlineEnd, paddingInlineStart, paddingLeft, paddingRight, paddingTop, page, pageBreakAfter, pageBreakBefore, pageBreakInside, pageOrientation, paintOrder, perspectiveOrigin, placeContent, placeItems, placeSelf, pointerEvents, prefix, quotes, range, rowGap, rubyPosition, scrollBehavior, scrollMargin, scrollMarginBlock, scrollMarginBlockEnd, scrollMarginBlockStart, scrollMarginBottom, scrollMarginInline, scrollMarginInlineEnd, scrollMarginInlineStart, scrollMarginLeft, scrollMarginRight, scrollMarginTop, scrollPadding, scrollPaddingBlock, scrollPaddingBlockEnd, scrollPaddingBlockStart, scrollPaddingBottom, scrollPaddingInline, scrollPaddingInlineEnd, scrollPaddingInlineStart, scrollPaddingLeft, scrollPaddingRight, scrollPaddingTop, scrollSnapAlign, scrollSnapStop, scrollSnapType, scrollbarGutter, shapeImageThreshold, shapeMargin, shapeOutside, shapeRendering, size, sizeAdjust, speakAs, src, stopColor, stopOpacity, strokeDasharray, strokeDashoffset, strokeLinecap, strokeLinejoin, strokeMiterlimit, strokeOpacity, strokeWidth, suffix, symbols, syntax, system, tabSize, tableLayout, textAlign, textAlignLast, textAnchor, textCombineUpright, textDecoration, textDecorationColor, textDecorationLine, textDecorationSkipInk, textDecorationStyle, textDecorationThickness, textEmphasis, textEmphasisColor, textEmphasisPosition, textEmphasisStyle, textIndent, textOrientation, textOverflow, textRendering, textShadow, textSizeAdjust, textTransform, textUnderlineOffset, textUnderlinePosition, touchAction, transformBox, transformOrigin, transformStyle, transition, transitionDelay, transitionDuration, transitionProperty, transitionTimingFunction, unicodeBidi, unicodeRange, userSelect, userZoom, vectorEffect, verticalAlign, webkitAlignContent, webkitAlignItems, webkitAlignSelf, webkitAnimation, webkitAnimationDelay, webkitAnimationDirection, webkitAnimationDuration, webkitAnimationFillMode, webkitAnimationIterationCount, webkitAnimationName, webkitAnimationPlayState, webkitAnimationTimingFunction, webkitAppRegion, webkitAppearance, webkitBackfaceVisibility, webkitBackgroundClip, webkitBackgroundOrigin, webkitBackgroundSize, webkitBorderAfter, webkitBorderAfterColor, webkitBorderAfterStyle, webkitBorderAfterWidth, webkitBorderBefore, webkitBorderBeforeColor, webkitBorderBeforeStyle, webkitBorderBeforeWidth, webkitBorderBottomLeftRadius, webkitBorderBottomRightRadius, webkitBorderEnd, webkitBorderEndColor, webkitBorderEndStyle, webkitBorderEndWidth, webkitBorderHorizontalSpacing, webkitBorderImage, webkitBorderRadius, webkitBorderStart, webkitBorderStartColor, webkitBorderStartStyle, webkitBorderStartWidth, webkitBorderTopLeftRadius, webkitBorderTopRightRadius, webkitBorderVerticalSpacing, webkitBoxAlign, webkitBoxDecorationBreak, webkitBoxDirection, webkitBoxFlex, webkitBoxOrdinalGroup, webkitBoxOrient, webkitBoxPack, webkitBoxReflect, webkitBoxShadow, webkitBoxSizing, webkitClipPath, webkitColumnBreakAfter, webkitColumnBreakBefore, webkitColumnBreakInside, webkitColumnCount, webkitColumnGap, webkitColumnRule, webkitColumnRuleColor, webkitColumnRuleStyle, webkitColumnRuleWidth, webkitColumnSpan, webkitColumnWidth, webkitColumns, webkitFilter, webkitFlex, webkitFlexBasis, webkitFlexDirection, webkitFlexFlow, webkitFlexGrow, webkitFlexShrink, webkitFlexWrap, webkitFontFeatureSettings, webkitFontSmoothing, webkitHighlight, webkitHyphenateCharacter, webkitJustifyContent, webkitLineBreak, webkitLineClamp, webkitLocale, webkitLogicalHeight, webkitLogicalWidth, webkitMarginAfter, webkitMarginBefore, webkitMarginEnd, webkitMarginStart, webkitMask, webkitMaskBoxImage, webkitMaskBoxImageOutset, webkitMaskBoxImageRepeat, webkitMaskBoxImageSlice, webkitMaskBoxImageSource, webkitMaskBoxImageWidth, webkitMaskClip, webkitMaskComposite, webkitMaskImage, webkitMaskOrigin, webkitMaskPosition, webkitMaskPositionX, webkitMaskPositionY, webkitMaskRepeat, webkitMaskRepeatX, webkitMaskRepeatY, webkitMaskSize, webkitMaxLogicalHeight, webkitMaxLogicalWidth, webkitMinLogicalHeight, webkitMinLogicalWidth, webkitOpacity, webkitOrder, webkitPaddingAfter, webkitPaddingBefore, webkitPaddingEnd, webkitPaddingStart, webkitPerspective, webkitPerspectiveOrigin, webkitPerspectiveOriginX, webkitPerspectiveOriginY, webkitPrintColorAdjust, webkitRtlOrdering, webkitRubyPosition, webkitShapeImageThreshold, webkitShapeMargin, webkitShapeOutside, webkitTapHighlightColor, webkitTextCombine, webkitTextDecorationsInEffect, webkitTextEmphasis, webkitTextEmphasisColor, webkitTextEmphasisPosition, webkitTextEmphasisStyle, webkitTextFillColor, webkitTextOrientation, webkitTextSecurity, webkitTextSizeAdjust, webkitTextStroke, webkitTextStrokeColor, webkitTextStrokeWidth, webkitTransform, webkitTransformOrigin, webkitTransformOriginX, webkitTransformOriginY, webkitTransformOriginZ, webkitTransformStyle, webkitTransition, webkitTransitionDelay, webkitTransitionDuration, webkitTransitionProperty, webkitTransitionTimingFunction, webkitUserDrag, webkitUserModify, webkitUserSelect, webkitWritingMode, whiteSpace, willChange, wordBreak, wordSpacing, wordWrap, writingMode, zIndex, additive-symbols, ascent-override, aspect-ratio, background-position-x, background-position-y, background-repeat-x, background-repeat-y, base-palette, border-block, border-block-color, border-block-end, border-block-start, border-block-style, border-block-width, border-bottom, border-color, border-image, border-inline, border-inline-color, border-inline-end, border-inline-start, border-inline-style, border-inline-width, border-left, border-radius, border-right, border-spacing, border-style, border-top, border-width, color-scheme, column-fill, column-rule, content-visibility, counter-increment, counter-reset, counter-set, descent-override, flex-flow, font-display, font-feature-settings, font-synthesis, font-variation-settings, forced-color-adjust, grid-area, grid-column, grid-column-gap, grid-gap, grid-row, grid-row-gap, grid-template, initial-value, inset-block, inset-inline, line-gap-override, list-style, margin-block, margin-inline, max-zoom, min-zoom, override-colors, overscroll-behavior, overscroll-behavior-x, overscroll-behavior-y, padding-block, padding-inline, page-break-after, page-break-before, page-break-inside, page-orientation, place-content, place-items, place-self, scroll-margin, scroll-margin-block, scroll-margin-bottom, scroll-margin-inline, scroll-margin-left, scroll-margin-right, scroll-margin-top, scroll-padding, scroll-padding-block, scroll-padding-bottom, scroll-padding-inline, scroll-padding-left, scroll-padding-right, scroll-padding-top, scroll-snap-align, scroll-snap-stop, scroll-snap-type, size-adjust, speak-as, text-combine-upright, text-decoration-thickness, text-emphasis, text-orientation, text-underline-offset, transform-box, unicode-range, user-zoom, -webkit-align-content, -webkit-align-items, -webkit-align-self, -webkit-animation, -webkit-animation-delay, -webkit-animation-direction, -webkit-animation-duration, -webkit-animation-fill-mode, -webkit-animation-iteration-count, -webkit-animation-name, -webkit-animation-play-state, -webkit-animation-timing-function, -webkit-app-region, -webkit-appearance, -webkit-backface-visibility, -webkit-background-clip, -webkit-background-origin, -webkit-background-size, -webkit-border-after, -webkit-border-after-color, -webkit-border-after-style, -webkit-border-after-width, -webkit-border-before, -webkit-border-before-color, -webkit-border-before-style, -webkit-border-before-width, -webkit-border-bottom-left-radius, -webkit-border-bottom-right-radius, -webkit-border-end, -webkit-border-end-color, -webkit-border-end-style, -webkit-border-end-width, -webkit-border-radius, -webkit-border-start, -webkit-border-start-color, -webkit-border-start-style, -webkit-border-start-width, -webkit-border-top-left-radius, -webkit-border-top-right-radius, -webkit-box-shadow, -webkit-box-sizing, -webkit-clip-path, -webkit-column-break-after, -webkit-column-break-before, -webkit-column-break-inside, -webkit-column-count, -webkit-column-gap, -webkit-column-rule, -webkit-column-rule-color, -webkit-column-rule-style, -webkit-column-rule-width, -webkit-column-span, -webkit-column-width, -webkit-columns, -webkit-filter, -webkit-flex, -webkit-flex-basis, -webkit-flex-direction, -webkit-flex-flow, -webkit-flex-grow, -webkit-flex-shrink, -webkit-flex-wrap, -webkit-font-feature-settings, -webkit-justify-content, -webkit-logical-height, -webkit-logical-width, -webkit-margin-after, -webkit-margin-before, -webkit-margin-end, -webkit-margin-start, -webkit-mask, -webkit-mask-position-x, -webkit-mask-position-y, -webkit-mask-repeat-x, -webkit-mask-repeat-y, -webkit-max-logical-height, -webkit-max-logical-width, -webkit-min-logical-height, -webkit-min-logical-width, -webkit-opacity, -webkit-order, -webkit-padding-after, -webkit-padding-before, -webkit-padding-end, -webkit-padding-start, -webkit-perspective, -webkit-perspective-origin, -webkit-perspective-origin-x, -webkit-perspective-origin-y, -webkit-ruby-position, -webkit-shape-image-threshold, -webkit-shape-margin, -webkit-shape-outside, -webkit-text-emphasis, -webkit-text-emphasis-color, -webkit-text-emphasis-position, -webkit-text-emphasis-style, -webkit-text-size-adjust, -webkit-text-stroke, -webkit-transform, -webkit-transform-origin, -webkit-transform-origin-x, -webkit-transform-origin-y, -webkit-transform-origin-z, -webkit-transform-style, -webkit-transition, -webkit-transition-delay, -webkit-transition-duration, -webkit-transition-property, -webkit-transition-timing-function, -webkit-user-select, word-wrap`,
        jsKeys: 'Object.assign, Object.getOwnPropertyDescriptor, Object.getOwnPropertyDescriptors, Object.getOwnPropertyNames, Object.getOwnPropertySymbols, Object.is, Object.preventExtensions, Object.seal, Object.create, Object.defineProperties, Object.defineProperty, Object.freeze, Object.getPrototypeOf, Object.setPrototypeOf, Object.isExtensible, Object.isFrozen, Object.isSealed, Object.keys, Object.entries, Object.fromEntries, Object.values, Object.hasOwn, Object.__defineGetter__, Object.__defineSetter__, Object.hasOwnProperty, Object.__lookupGetter__, Object.__lookupSetter__, Object.isPrototypeOf, Object.propertyIsEnumerable, Object.toString, Object.valueOf, Object.__proto__, Object.toLocaleString, Function.apply, Function.bind, Function.call, Function.toString, Boolean.toString, Boolean.valueOf, Symbol.for, Symbol.keyFor, Symbol.asyncIterator, Symbol.hasInstance, Symbol.isConcatSpreadable, Symbol.iterator, Symbol.match, Symbol.matchAll, Symbol.replace, Symbol.search, Symbol.species, Symbol.split, Symbol.toPrimitive, Symbol.toStringTag, Symbol.unscopables, Symbol.toString, Symbol.valueOf, Symbol.description, Error.captureStackTrace, Error.stackTraceLimit, Error.message, Error.toString, Number.isFinite, Number.isInteger, Number.isNaN, Number.isSafeInteger, Number.parseFloat, Number.parseInt, Number.MAX_VALUE, Number.MIN_VALUE, Number.NaN, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER, Number.EPSILON, Number.toExponential, Number.toFixed, Number.toPrecision, Number.toString, Number.valueOf, Number.toLocaleString, BigInt.asUintN, BigInt.asIntN, BigInt.toLocaleString, BigInt.toString, BigInt.valueOf, Math.abs, Math.acos, Math.acosh, Math.asin, Math.asinh, Math.atan, Math.atanh, Math.atan2, Math.ceil, Math.cbrt, Math.expm1, Math.clz32, Math.cos, Math.cosh, Math.exp, Math.floor, Math.fround, Math.hypot, Math.imul, Math.log, Math.log1p, Math.log2, Math.log10, Math.max, Math.min, Math.pow, Math.random, Math.round, Math.sign, Math.sin, Math.sinh, Math.sqrt, Math.tan, Math.tanh, Math.trunc, Math.E, Math.LN10, Math.LN2, Math.LOG10E, Math.LOG2E, Math.PI, Math.SQRT1_2, Math.SQRT2, Date.now, Date.parse, Date.UTC, Date.toString, Date.toDateString, Date.toTimeString, Date.toISOString, Date.toUTCString, Date.toGMTString, Date.getDate, Date.setDate, Date.getDay, Date.getFullYear, Date.setFullYear, Date.getHours, Date.setHours, Date.getMilliseconds, Date.setMilliseconds, Date.getMinutes, Date.setMinutes, Date.getMonth, Date.setMonth, Date.getSeconds, Date.setSeconds, Date.getTime, Date.setTime, Date.getTimezoneOffset, Date.getUTCDate, Date.setUTCDate, Date.getUTCDay, Date.getUTCFullYear, Date.setUTCFullYear, Date.getUTCHours, Date.setUTCHours, Date.getUTCMilliseconds, Date.setUTCMilliseconds, Date.getUTCMinutes, Date.setUTCMinutes, Date.getUTCMonth, Date.setUTCMonth, Date.getUTCSeconds, Date.setUTCSeconds, Date.valueOf, Date.getYear, Date.setYear, Date.toJSON, Date.toLocaleString, Date.toLocaleDateString, Date.toLocaleTimeString, String.fromCharCode, String.fromCodePoint, String.raw, String.anchor, String.at, String.big, String.blink, String.bold, String.charAt, String.charCodeAt, String.codePointAt, String.concat, String.endsWith, String.fontcolor, String.fontsize, String.fixed, String.includes, String.indexOf, String.italics, String.lastIndexOf, String.link, String.localeCompare, String.match, String.matchAll, String.normalize, String.padEnd, String.padStart, String.repeat, String.replace, String.replaceAll, String.search, String.slice, String.small, String.split, String.strike, String.sub, String.substr, String.substring, String.sup, String.startsWith, String.toString, String.trim, String.trimStart, String.trimLeft, String.trimEnd, String.trimRight, String.toLocaleLowerCase, String.toLocaleUpperCase, String.toLowerCase, String.toUpperCase, String.valueOf, RegExp.input, RegExp.$_, RegExp.lastMatch, RegExp.$&, RegExp.lastParen, RegExp.$+, RegExp.leftContext, RegExp.$`, RegExp.rightContext, RegExp.$\', RegExp.$1, RegExp.$2, RegExp.$3, RegExp.$4, RegExp.$5, RegExp.$6, RegExp.$7, RegExp.$8, RegExp.$9, RegExp.exec, RegExp.dotAll, RegExp.flags, RegExp.global, RegExp.hasIndices, RegExp.ignoreCase, RegExp.multiline, RegExp.source, RegExp.sticky, RegExp.unicode, RegExp.compile, RegExp.toString, RegExp.test, Array.isArray, Array.from, Array.of, Array.at, Array.concat, Array.copyWithin, Array.fill, Array.find, Array.findIndex, Array.lastIndexOf, Array.pop, Array.push, Array.reverse, Array.shift, Array.unshift, Array.slice, Array.sort, Array.splice, Array.includes, Array.indexOf, Array.join, Array.keys, Array.entries, Array.values, Array.forEach, Array.filter, Array.flat, Array.flatMap, Array.map, Array.every, Array.some, Array.reduce, Array.reduceRight, Array.toLocaleString, Array.toString, Array.findLast, Array.findLastIndex, Map.get, Map.set, Map.has, Map.delete, Map.clear, Map.entries, Map.forEach, Map.keys, Map.size, Map.values, Set.has, Set.add, Set.delete, Set.clear, Set.entries, Set.forEach, Set.size, Set.values, Set.keys, WeakMap.delete, WeakMap.get, WeakMap.set, WeakMap.has, WeakSet.delete, WeakSet.has, WeakSet.add, Atomics.load, Atomics.store, Atomics.add, Atomics.sub, Atomics.and, Atomics.or, Atomics.xor, Atomics.exchange, Atomics.compareExchange, Atomics.isLockFree, Atomics.wait, Atomics.waitAsync, Atomics.notify, JSON.parse, JSON.stringify, Promise.all, Promise.allSettled, Promise.any, Promise.race, Promise.resolve, Promise.reject, Promise.then, Promise.catch, Promise.finally, Reflect.defineProperty, Reflect.deleteProperty, Reflect.apply, Reflect.construct, Reflect.get, Reflect.getOwnPropertyDescriptor, Reflect.getPrototypeOf, Reflect.has, Reflect.isExtensible, Reflect.ownKeys, Reflect.preventExtensions, Reflect.set, Reflect.setPrototypeOf, Proxy.revocable, Intl.getCanonicalLocales, Intl.supportedValuesOf, Intl.DateTimeFormat, Intl.NumberFormat, Intl.Collator, Intl.v8BreakIterator, Intl.PluralRules, Intl.RelativeTimeFormat, Intl.ListFormat, Intl.Locale, Intl.DisplayNames, Intl.Segmenter, WebAssembly.compile, WebAssembly.validate, WebAssembly.instantiate, WebAssembly.compileStreaming, WebAssembly.instantiateStreaming, WebAssembly.Module, WebAssembly.Instance, WebAssembly.Table, WebAssembly.Memory, WebAssembly.Global, WebAssembly.Tag, WebAssembly.Exception, WebAssembly.CompileError, WebAssembly.LinkError, WebAssembly.RuntimeError, Document.implementation, Document.URL, Document.documentURI, Document.compatMode, Document.characterSet, Document.charset, Document.inputEncoding, Document.contentType, Document.doctype, Document.documentElement, Document.xmlEncoding, Document.xmlVersion, Document.xmlStandalone, Document.domain, Document.referrer, Document.cookie, Document.lastModified, Document.readyState, Document.title, Document.dir, Document.body, Document.head, Document.images, Document.embeds, Document.plugins, Document.links, Document.forms, Document.scripts, Document.currentScript, Document.defaultView, Document.designMode, Document.onreadystatechange, Document.anchors, Document.applets, Document.fgColor, Document.linkColor, Document.vlinkColor, Document.alinkColor, Document.bgColor, Document.all, Document.scrollingElement, Document.onpointerlockchange, Document.onpointerlockerror, Document.hidden, Document.visibilityState, Document.wasDiscarded, Document.featurePolicy, Document.webkitVisibilityState, Document.webkitHidden, Document.onbeforecopy, Document.onbeforecut, Document.onbeforepaste, Document.onfreeze, Document.onresume, Document.onsearch, Document.onvisibilitychange, Document.fullscreenEnabled, Document.fullscreen, Document.onfullscreenchange, Document.onfullscreenerror, Document.webkitIsFullScreen, Document.webkitCurrentFullScreenElement, Document.webkitFullscreenEnabled, Document.webkitFullscreenElement, Document.onwebkitfullscreenchange, Document.onwebkitfullscreenerror, Document.rootElement, Document.onbeforexrselect, Document.onabort, Document.onblur, Document.oncancel, Document.oncanplay, Document.oncanplaythrough, Document.onchange, Document.onclick, Document.onclose, Document.oncontextlost, Document.oncontextmenu, Document.oncontextrestored, Document.oncuechange, Document.ondblclick, Document.ondrag, Document.ondragend, Document.ondragenter, Document.ondragleave, Document.ondragover, Document.ondragstart, Document.ondrop, Document.ondurationchange, Document.onemptied, Document.onended, Document.onerror, Document.onfocus, Document.onformdata, Document.oninput, Document.oninvalid, Document.onkeydown, Document.onkeypress, Document.onkeyup, Document.onload, Document.onloadeddata, Document.onloadedmetadata, Document.onloadstart, Document.onmousedown, Document.onmouseenter, Document.onmouseleave, Document.onmousemove, Document.onmouseout, Document.onmouseover, Document.onmouseup, Document.onmousewheel, Document.onpause, Document.onplay, Document.onplaying, Document.onprogress, Document.onratechange, Document.onreset, Document.onresize, Document.onscroll, Document.onsecuritypolicyviolation, Document.onseeked, Document.onseeking, Document.onselect, Document.onslotchange, Document.onstalled, Document.onsubmit, Document.onsuspend, Document.ontimeupdate, Document.ontoggle, Document.onvolumechange, Document.onwaiting, Document.onwebkitanimationend, Document.onwebkitanimationiteration, Document.onwebkitanimationstart, Document.onwebkittransitionend, Document.onwheel, Document.onauxclick, Document.ongotpointercapture, Document.onlostpointercapture, Document.onpointerdown, Document.onpointermove, Document.onpointerup, Document.onpointercancel, Document.onpointerover, Document.onpointerout, Document.onpointerenter, Document.onpointerleave, Document.onselectstart, Document.onselectionchange, Document.onanimationend, Document.onanimationiteration, Document.onanimationstart, Document.ontransitionrun, Document.ontransitionstart, Document.ontransitionend, Document.ontransitioncancel, Document.oncopy, Document.oncut, Document.onpaste, Document.children, Document.firstElementChild, Document.lastElementChild, Document.childElementCount, Document.activeElement, Document.styleSheets, Document.pointerLockElement, Document.fullscreenElement, Document.adoptedStyleSheets, Document.fonts, Document.adoptNode, Document.append, Document.captureEvents, Document.caretRangeFromPoint, Document.clear, Document.close, Document.createAttribute, Document.createAttributeNS, Document.createCDATASection, Document.createComment, Document.createDocumentFragment, Document.createElement, Document.createElementNS, Document.createEvent, Document.createExpression, Document.createNSResolver, Document.createNodeIterator, Document.createProcessingInstruction, Document.createRange, Document.createTextNode, Document.createTreeWalker, Document.elementFromPoint, Document.elementsFromPoint, Document.evaluate, Document.execCommand, Document.exitFullscreen, Document.exitPointerLock, Document.getElementById, Document.getElementsByClassName, Document.getElementsByName, Document.getElementsByTagName, Document.getElementsByTagNameNS, Document.getSelection, Document.hasFocus, Document.importNode, Document.open, Document.prepend, Document.queryCommandEnabled, Document.queryCommandIndeterm, Document.queryCommandState, Document.queryCommandSupported, Document.queryCommandValue, Document.querySelector, Document.querySelectorAll, Document.releaseEvents, Document.replaceChildren, Document.webkitCancelFullScreen, Document.webkitExitFullscreen, Document.write, Document.writeln, Document.fragmentDirective, Document.onbeforematch, Document.timeline, Document.pictureInPictureEnabled, Document.pictureInPictureElement, Document.onpointerrawupdate, Document.exitPictureInPicture, Document.getAnimations, Element.namespaceURI, Element.prefix, Element.localName, Element.tagName, Element.id, Element.className, Element.classList, Element.slot, Element.attributes, Element.shadowRoot, Element.part, Element.assignedSlot, Element.innerHTML, Element.outerHTML, Element.scrollTop, Element.scrollLeft, Element.scrollWidth, Element.scrollHeight, Element.clientTop, Element.clientLeft, Element.clientWidth, Element.clientHeight, Element.attributeStyleMap, Element.onbeforecopy, Element.onbeforecut, Element.onbeforepaste, Element.onsearch, Element.elementTiming, Element.onfullscreenchange, Element.onfullscreenerror, Element.onwebkitfullscreenchange, Element.onwebkitfullscreenerror, Element.role, Element.ariaAtomic, Element.ariaAutoComplete, Element.ariaBusy, Element.ariaChecked, Element.ariaColCount, Element.ariaColIndex, Element.ariaColSpan, Element.ariaCurrent, Element.ariaDescription, Element.ariaDisabled, Element.ariaExpanded, Element.ariaHasPopup, Element.ariaHidden, Element.ariaInvalid, Element.ariaKeyShortcuts, Element.ariaLabel, Element.ariaLevel, Element.ariaLive, Element.ariaModal, Element.ariaMultiLine, Element.ariaMultiSelectable, Element.ariaOrientation, Element.ariaPlaceholder, Element.ariaPosInSet, Element.ariaPressed, Element.ariaReadOnly, Element.ariaRelevant, Element.ariaRequired, Element.ariaRoleDescription, Element.ariaRowCount, Element.ariaRowIndex, Element.ariaRowSpan, Element.ariaSelected, Element.ariaSetSize, Element.ariaSort, Element.ariaValueMax, Element.ariaValueMin, Element.ariaValueNow, Element.ariaValueText, Element.children, Element.firstElementChild, Element.lastElementChild, Element.childElementCount, Element.previousElementSibling, Element.nextElementSibling, Element.after, Element.animate, Element.append, Element.attachShadow, Element.before, Element.closest, Element.computedStyleMap, Element.getAttribute, Element.getAttributeNS, Element.getAttributeNames, Element.getAttributeNode, Element.getAttributeNodeNS, Element.getBoundingClientRect, Element.getClientRects, Element.getElementsByClassName, Element.getElementsByTagName, Element.getElementsByTagNameNS, Element.getInnerHTML, Element.hasAttribute, Element.hasAttributeNS, Element.hasAttributes, Element.hasPointerCapture, Element.insertAdjacentElement, Element.insertAdjacentHTML, Element.insertAdjacentText, Element.matches, Element.prepend, Element.querySelector, Element.querySelectorAll, Element.releasePointerCapture, Element.remove, Element.removeAttribute, Element.removeAttributeNS, Element.removeAttributeNode, Element.replaceChildren, Element.replaceWith, Element.requestFullscreen, Element.requestPointerLock, Element.scroll, Element.scrollBy, Element.scrollIntoView, Element.scrollIntoViewIfNeeded, Element.scrollTo, Element.setAttribute, Element.setAttributeNS, Element.setAttributeNode, Element.setAttributeNodeNS, Element.setPointerCapture, Element.toggleAttribute, Element.webkitMatchesSelector, Element.webkitRequestFullScreen, Element.webkitRequestFullscreen, Element.getAnimations',
    },
    'Firefox': {
        version: 102,
        windowKeys: `undefined, globalThis, Array, Boolean, JSON, Date, Math, Number, String, RegExp, Error, InternalError, AggregateError, EvalError, RangeError, ReferenceError, SyntaxError, TypeError, URIError, ArrayBuffer, Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array, Uint8ClampedArray, BigInt64Array, BigUint64Array, BigInt, Proxy, WeakMap, Set, DataView, Symbol, Intl, Reflect, WeakSet, Atomics, Promise, WebAssembly, FinalizationRegistry, WeakRef, NaN, Infinity, isNaN, isFinite, parseFloat, parseInt, escape, unescape, decodeURI, encodeURI, decodeURIComponent, encodeURIComponent, SVGGradientElement, StyleSheetList, HTMLSlotElement, SVGMPathElement, SVGPathElement, PermissionStatus, CSSMediaRule, TrackEvent, PopStateEvent, GamepadButton, Attr, CSSConditionRule, ConstantSourceNode, BaseAudioContext, StaticRange, HTMLAreaElement, HTMLPictureElement, FileReader, SVGLengthList, SpeechSynthesisUtterance, SVGSymbolElement, ElementInternals, PerformanceServerTiming, LockManager, HTMLFrameElement, FocusEvent, SVGAElement, SVGAnimatedPreserveAspectRatio, Credential, RTCStatsReport, WebGLProgram, TextEncoder, MediaSession, MediaDevices, MediaSource, PerformanceEventTiming, PerformanceObserverEntryList, SVGAnimatedInteger, SVGSVGElement, Screen, SVGFEComponentTransferElement, CSSFontFaceRule, FileSystem, IDBOpenDBRequest, PeriodicWave, IDBVersionChangeEvent, WebGLRenderingContext, CanvasCaptureMediaStream, Image, DOMMatrixReadOnly, DataTransfer, HTMLUListElement, ReadableStreamDefaultReader, SVGTransform, Path2D, SVGAnimatedNumberList, SubmitEvent, SVGTextPathElement, GainNode, ReadableByteStreamController, SVGMatrix, PaintRequestList, KeyframeEffect, SVGFETileElement, SVGFESpotLightElement, HTMLOutputElement, PerformanceResourceTiming, FileSystemDirectoryEntry, DOMStringMap, SVGGeometryElement, SVGFEFuncGElement, PageTransitionEvent, HTMLAudioElement, DOMQuad, ByteLengthQueuingStrategy, SVGUseElement, MathMLElement, CSSPageRule, AnimationTimeline, GeolocationPosition, ClipboardEvent, CSS2Properties, CloseEvent, HTMLTemplateElement, DragEvent, WebGLShader, SVGFEImageElement, HTMLMarqueeElement, URLSearchParams, MediaStreamEvent, SharedWorker, MimeType, CompositionEvent, PerformanceTiming, SVGFEMergeElement, mozRTCIceCandidate, ResizeObserver, RTCIceCandidate, DOMRectList, CustomElementRegistry, XMLDocument, Worklet, DOMRectReadOnly, MediaList, HTMLFormControlsCollection, SVGRectElement, DOMPointReadOnly, IDBFactory, HTMLCollection, HTMLBRElement, HTMLFieldSetElement, HTMLSelectElement, Gamepad, AudioNode, SVGSetElement, CaretPosition, HTMLParagraphElement, HTMLScriptElement, WebGLShaderPrecisionFormat, FileList, MediaDeviceInfo, RadioNodeList, AudioDestinationNode, SVGNumberList, BeforeUnloadEvent, IDBCursor, HTMLAllCollection, MediaError, SVGFEBlendElement, WebGLActiveInfo, InputEvent, MediaStream, Range, HTMLHtmlElement, HTMLAnchorElement, FormData, DOMMatrix, AudioBufferSourceNode, HTMLElement, IdleDeadline, CanvasGradient, TreeWalker, MouseEvent, KeyboardEvent, PerformanceNavigation, AudioBuffer, HTMLInputElement, DOMRect, SpeechSynthesisErrorEvent, SVGAnimatedRect, BroadcastChannel, SVGTextPositioningElement, RTCRtpSender, HTMLButtonElement, FileSystemDirectoryReader, SVGStopElement, GamepadEvent, MediaKeySystemAccess, FontFaceSetLoadEvent, PushSubscriptionOptions, StereoPannerNode, HTMLDialogElement, SVGAnimatedEnumeration, MutationRecord, HTMLStyleElement, SVGPolylineElement, SVGFESpecularLightingElement, FontFace, DocumentFragment, NamedNodeMap, WebGL2RenderingContext, MediaRecorder, FileSystemFileEntry, VideoPlaybackQuality, Selection, Response, CSSSupportsRule, Request, MediaCapabilities, ServiceWorker, HTMLDataElement, WritableStreamDefaultWriter, SVGFilterElement, PerformancePaintTiming, CSSStyleSheet, SVGGraphicsElement, URL, CSSStyleDeclaration, PerformanceMark, HTMLVideoElement, ErrorEvent, SVGForeignObjectElement, GeolocationPositionError, ResizeObserverSize, SVGNumber, WebGLUniformLocation, ImageBitmap, TransformStream, PointerEvent, ShadowRoot, GeolocationCoordinates, DOMParser, SVGPreserveAspectRatio, DelayNode, HTMLDivElement, SVGTextElement, HTMLOptionElement, NodeFilter, StorageManager, ScrollAreaEvent, WebGLRenderbuffer, TextTrackCue, SVGTextContentElement, TransformStreamDefaultController, RTCRtpTransceiver, SVGAnimatedString, CredentialsContainer, PopupBlockedEvent, WaveShaperNode, CSSRuleList, FileSystemEntry, SVGAnimateTransformElement, SVGMetadataElement, CSSKeyframeRule, SVGCircleElement, HTMLTableRowElement, IIRFilterNode, IntersectionObserverEntry, Notification, CSSLayerStatementRule, SVGAnimatedNumber, MediaStreamTrack, HTMLImageElement, ScriptProcessorNode, SVGFEGaussianBlurElement, AudioParam, CustomEvent, MessageChannel, MediaQueryListEvent, CacheStorage, SVGFEFloodElement, PaintRequest, DOMImplementation, HTMLPreElement, ConvolverNode, HTMLEmbedElement, SVGElement, TextTrack, IDBKeyRange, DeviceOrientationEvent, RTCDataChannelEvent, MediaQueryList, SVGLength, SVGStyleElement, Geolocation, CSS, SVGFEDropShadowElement, ServiceWorkerContainer, MediaStreamTrackEvent, NavigationPreloadManager, SVGViewElement, FormDataEvent, MediaStreamTrackAudioSourceNode, MouseScrollEvent, RTCRtpReceiver, IDBObjectStore, PerformanceEntry, HTMLBodyElement, HashChangeEvent, SVGAngle, RTCDTMFToneChangeEvent, Clipboard, Cache, HTMLIFrameElement, SVGScriptElement, Storage, BiquadFilterNode, WritableStreamDefaultController, IDBMutableFile, console, RTCPeerConnectionIceEvent, StyleSheet, ProgressEvent, BlobEvent, HTMLMediaElement, HTMLSourceElement, MediaKeyMessageEvent, IDBIndex, webkitURL, Worker, WebGLQuery, HTMLLabelElement, RTCDtlsTransport, SVGFEMorphologyElement, ChannelSplitterNode, SourceBuffer, SVGTSpanElement, MediaMetadata, SVGPatternElement, CSSNamespaceRule, HTMLQuoteElement, HTMLMenuElement, WebGLTransformFeedback, MediaCapabilitiesInfo, SVGFEFuncBElement, ValidityState, HTMLUnknownElement, CharacterData, HTMLDataListElement, SVGRect, DeviceMotionEvent, OfflineResourceList, XMLSerializer, HTMLMeterElement, SourceBufferList, CountQueuingStrategy, SecurityPolicyViolationEvent, AudioContext, PerformanceMeasure, HTMLHeadingElement, ResizeObserverEntry, Audio, TextMetrics, U2F, ServiceWorkerRegistration, History, AnimationPlaybackEvent, Plugin, CSSImportRule, DOMStringList, HTMLOptGroupElement, RTCTrackEvent, XPathResult, Lock, RTCDataChannel, HTMLDirectoryElement, ProcessingInstruction, DOMException, ReadableStream, TextTrackCueList, AnimationEvent, MediaStreamAudioDestinationNode, HTMLTableElement, SVGPoint, HTMLModElement, IDBTransaction, DynamicsCompressorNode, SVGAnimatedTransformList, PublicKeyCredential, SVGFEDiffuseLightingElement, CSSRule, IDBDatabase, HTMLSpanElement, SVGFEColorMatrixElement, TransitionEvent, AudioListener, HTMLFormElement, SVGFEMergeNodeElement, AbortController, RTCPeerConnection, AnimationEffect, Permissions, CanvasRenderingContext2D, SVGLineElement, MediaStreamAudioSourceNode, CSSKeyframesRule, Directory, MediaKeys, WebGLTexture, MediaKeySession, Comment, WritableStream, CSSGroupingRule, SVGEllipseElement, WheelEvent, SubtleCrypto, XPathExpression, NodeList, AuthenticatorAssertionResponse, CSSMozDocumentRule, SVGAnimatedAngle, File, SVGLinearGradientElement, AnalyserNode, MutationObserver, SVGStringList, SVGAnimateMotionElement, BarProp, XMLHttpRequestEventTarget, Text, CanvasPattern, FontFaceSet, Crypto, IDBRequest, UIEvent, SVGFEDisplacementMapElement, VTTCue, KeyEvent, WebGLBuffer, StorageEvent, OscillatorNode, AuthenticatorResponse, OfflineAudioContext, MediaElementAudioSourceNode, HTMLTextAreaElement, ImageData, SpeechSynthesisVoice, SVGFEConvolveMatrixElement, SVGMarkerElement, AudioParamMap, CSSTransition, CSSFontFeatureValuesRule, ChannelMergerNode, AudioProcessingEvent, HTMLHeadElement, AudioScheduledSourceNode, WebKitCSSMatrix, MediaKeyError, DOMRequest, HTMLLIElement, SVGDefsElement, SVGFETurbulenceElement, SVGUnitTypes, PushSubscription, RTCCertificate, ReadableStreamBYOBRequest, GamepadHapticActuator, TextDecoder, HTMLHRElement, SVGClipPathElement, MimeTypeArray, Element, TextTrackList, SVGPointList, XMLHttpRequest, ImageBitmapRenderingContext, MutationEvent, GamepadPose, MediaRecorderErrorEvent, SVGFEDistantLightElement, HTMLParamElement, OfflineAudioCompletionEvent, IntersectionObserver, HTMLOptionsCollection, SVGAnimationElement, HTMLOListElement, SVGFEFuncAElement, HTMLCanvasElement, SVGAnimatedLength, HTMLProgressElement, HTMLTableColElement, SpeechSynthesisEvent, Location, SVGAnimatedBoolean, HTMLDListElement, HTMLTableCellElement, HTMLDetailsElement, CSSAnimation, XPathEvaluator, RTCDTMFSender, SVGFEOffsetElement, XSLTProcessor, SVGFECompositeElement, ReadableStreamDefaultController, WebGLSync, mozRTCSessionDescription, MediaEncryptedEvent, WebGLSampler, AuthenticatorAttestationResponse, ScreenOrientation, SVGComponentTransferFunctionElement, PerformanceObserver, CDATASection, CSSStyleRule, HTMLTableSectionElement, AudioWorklet, MessagePort, HTMLLegendElement, WebGLFramebuffer, VisualViewport, Blob, PannerNode, SVGFEPointLightElement, TimeEvent, HTMLFontElement, DOMPoint, NodeIterator, WebGLContextEvent, DOMTokenList, HTMLTitleElement, XMLHttpRequestUpload, VTTRegion, SVGSwitchElement, SVGTransformList, AbortSignal, SVGFEFuncRElement, Option, HTMLTrackElement, EventSource, CSSCounterStyleRule, HTMLFrameSetElement, SVGImageElement, HTMLMetaElement, SVGGElement, HTMLLinkElement, HTMLMapElement, mozRTCPeerConnection, HTMLObjectElement, HTMLTableCaptionElement, HTMLBaseElement, SVGAnimatedLengthList, AbstractRange, PromiseRejectionEvent, TimeRanges, PluginArray, Animation, SVGMaskElement, IDBFileRequest, SVGRadialGradientElement, SVGAnimateElement, MediaKeyStatusMap, IDBFileHandle, DocumentTimeline, DataTransferItemList, PushManager, Navigator, ReadableStreamBYOBReader, MessageEvent, WebSocket, SVGPolygonElement, WebGLVertexArrayObject, SVGTitleElement, HTMLTimeElement, IDBCursorWithValue, AudioWorkletNode, SpeechSynthesis, DocumentType, DataTransferItem, RTCSessionDescription, CSSLayerBlockRule, CryptoKey, SVGDescElement, Headers, Function, Object, eval, EventTarget, Window, close, stop, focus, blur, open, alert, confirm, prompt, print, postMessage, captureEvents, releaseEvents, getSelection, getComputedStyle, matchMedia, moveTo, moveBy, resizeTo, resizeBy, scroll, scrollTo, scrollBy, getDefaultComputedStyle, scrollByLines, scrollByPages, sizeToContent, updateCommands, find, dump, setResizable, requestIdleCallback, cancelIdleCallback, requestAnimationFrame, cancelAnimationFrame, reportError, btoa, atob, setTimeout, clearTimeout, setInterval, clearInterval, queueMicrotask, createImageBitmap, structuredClone, fetch, self, name, history, customElements, locationbar, menubar, personalbar, scrollbars, statusbar, toolbar, status, closed, event, frames, length, opener, parent, frameElement, navigator, clientInformation, external, applicationCache, screen, innerWidth, innerHeight, scrollX, pageXOffset, scrollY, pageYOffset, screenLeft, screenTop, screenX, screenY, outerWidth, outerHeight, performance, mozInnerScreenX, mozInnerScreenY, devicePixelRatio, scrollMaxX, scrollMaxY, fullScreen, ondevicemotion, ondeviceorientation, onabsolutedeviceorientation, InstallTrigger, visualViewport, crypto, onabort, onblur, onfocus, onauxclick, onbeforeinput, oncanplay, oncanplaythrough, onchange, onclick, onclose, oncontextmenu, oncuechange, ondblclick, ondrag, ondragend, ondragenter, ondragexit, ondragleave, ondragover, ondragstart, ondrop, ondurationchange, onemptied, onended, onformdata, oninput, oninvalid, onkeydown, onkeypress, onkeyup, onload, onloadeddata, onloadedmetadata, onloadend, onloadstart, onmousedown, onmouseenter, onmouseleave, onmousemove, onmouseout, onmouseover, onmouseup, onwheel, onpause, onplay, onplaying, onprogress, onratechange, onreset, onresize, onscroll, onsecuritypolicyviolation, onseeked, onseeking, onselect, onslotchange, onstalled, onsubmit, onsuspend, ontimeupdate, onvolumechange, onwaiting, onselectstart, onselectionchange, ontoggle, onpointercancel, onpointerdown, onpointerup, onpointermove, onpointerout, onpointerover, onpointerenter, onpointerleave, ongotpointercapture, onlostpointercapture, onmozfullscreenchange, onmozfullscreenerror, onanimationcancel, onanimationend, onanimationiteration, onanimationstart, ontransitioncancel, ontransitionend, ontransitionrun, ontransitionstart, onwebkitanimationend, onwebkitanimationiteration, onwebkitanimationstart, onwebkittransitionend, u2f, onerror, speechSynthesis, onafterprint, onbeforeprint, onbeforeunload, onhashchange, onlanguagechange, onmessage, onmessageerror, onoffline, ononline, onpagehide, onpageshow, onpopstate, onrejectionhandled, onstorage, onunhandledrejection, onunload, ongamepadconnected, ongamepaddisconnected, localStorage, origin, crossOriginIsolated, isSecureContext, indexedDB, caches, sessionStorage, window, document, location, top, netscape, Node, Document, HTMLDocument, EventCounts, Map, Event`,
        cssKeys: `alignContent, align-content, alignItems, align-items, alignSelf, align-self, aspectRatio, aspect-ratio, backfaceVisibility, backface-visibility, borderCollapse, border-collapse, borderImageRepeat, border-image-repeat, boxDecorationBreak, box-decoration-break, boxSizing, box-sizing, breakInside, break-inside, captionSide, caption-side, clear, colorInterpolation, color-interpolation, colorInterpolationFilters, color-interpolation-filters, columnCount, column-count, columnFill, column-fill, columnSpan, column-span, contain, direction, display, dominantBaseline, dominant-baseline, emptyCells, empty-cells, flexDirection, flex-direction, flexWrap, flex-wrap, cssFloat, float, fontKerning, font-kerning, fontOpticalSizing, font-optical-sizing, fontSizeAdjust, font-size-adjust, fontStretch, font-stretch, fontStyle, font-style, fontSynthesis, font-synthesis, fontVariantCaps, font-variant-caps, fontVariantEastAsian, font-variant-east-asian, fontVariantLigatures, font-variant-ligatures, fontVariantNumeric, font-variant-numeric, fontVariantPosition, font-variant-position, fontWeight, font-weight, gridAutoFlow, grid-auto-flow, hyphens, imageOrientation, image-orientation, imageRendering, image-rendering, imeMode, ime-mode, isolation, justifyContent, justify-content, justifyItems, justify-items, justifySelf, justify-self, lineBreak, line-break, listStylePosition, list-style-position, maskType, mask-type, mixBlendMode, mix-blend-mode, MozBoxAlign, -moz-box-align, MozBoxDirection, -moz-box-direction, MozBoxOrient, -moz-box-orient, MozBoxPack, -moz-box-pack, MozFloatEdge, -moz-float-edge, MozForceBrokenImageIcon, -moz-force-broken-image-icon, MozOrient, -moz-orient, MozTextSizeAdjust, -moz-text-size-adjust, MozUserFocus, -moz-user-focus, MozUserInput, -moz-user-input, MozUserModify, -moz-user-modify, MozWindowDragging, -moz-window-dragging, objectFit, object-fit, offsetRotate, offset-rotate, outlineStyle, outline-style, overflowAnchor, overflow-anchor, overflowWrap, overflow-wrap, paintOrder, paint-order, pointerEvents, pointer-events, position, printColorAdjust, print-color-adjust, resize, rubyAlign, ruby-align, rubyPosition, ruby-position, scrollBehavior, scroll-behavior, scrollSnapAlign, scroll-snap-align, scrollSnapType, scroll-snap-type, scrollbarGutter, scrollbar-gutter, scrollbarWidth, scrollbar-width, shapeRendering, shape-rendering, strokeLinecap, stroke-linecap, strokeLinejoin, stroke-linejoin, tableLayout, table-layout, textAlign, text-align, textAlignLast, text-align-last, textAnchor, text-anchor, textCombineUpright, text-combine-upright, textDecorationLine, text-decoration-line, textDecorationSkipInk, text-decoration-skip-ink, textDecorationStyle, text-decoration-style, textEmphasisPosition, text-emphasis-position, textJustify, text-justify, textOrientation, text-orientation, textRendering, text-rendering, textTransform, text-transform, textUnderlinePosition, text-underline-position, touchAction, touch-action, transformBox, transform-box, transformStyle, transform-style, unicodeBidi, unicode-bidi, userSelect, user-select, vectorEffect, vector-effect, visibility, webkitLineClamp, WebkitLineClamp, -webkit-line-clamp, whiteSpace, white-space, wordBreak, word-break, writingMode, writing-mode, zIndex, z-index, appearance, breakAfter, break-after, breakBefore, break-before, clipRule, clip-rule, fillRule, fill-rule, fillOpacity, fill-opacity, strokeOpacity, stroke-opacity, MozBoxOrdinalGroup, -moz-box-ordinal-group, order, flexGrow, flex-grow, flexShrink, flex-shrink, MozBoxFlex, -moz-box-flex, strokeMiterlimit, stroke-miterlimit, overflowBlock, overflow-block, overflowInline, overflow-inline, overflowX, overflow-x, overflowY, overflow-y, overscrollBehaviorBlock, overscroll-behavior-block, overscrollBehaviorInline, overscroll-behavior-inline, overscrollBehaviorX, overscroll-behavior-x, overscrollBehaviorY, overscroll-behavior-y, floodOpacity, flood-opacity, opacity, shapeImageThreshold, shape-image-threshold, stopOpacity, stop-opacity, borderBlockEndStyle, border-block-end-style, borderBlockStartStyle, border-block-start-style, borderBottomStyle, border-bottom-style, borderInlineEndStyle, border-inline-end-style, borderInlineStartStyle, border-inline-start-style, borderLeftStyle, border-left-style, borderRightStyle, border-right-style, borderTopStyle, border-top-style, columnRuleStyle, column-rule-style, accentColor, accent-color, animationDelay, animation-delay, animationDirection, animation-direction, animationDuration, animation-duration, animationFillMode, animation-fill-mode, animationIterationCount, animation-iteration-count, animationName, animation-name, animationPlayState, animation-play-state, animationTimingFunction, animation-timing-function, backgroundAttachment, background-attachment, backgroundBlendMode, background-blend-mode, backgroundClip, background-clip, backgroundImage, background-image, backgroundOrigin, background-origin, backgroundPositionX, background-position-x, backgroundPositionY, background-position-y, backgroundRepeat, background-repeat, backgroundSize, background-size, borderImageOutset, border-image-outset, borderImageSlice, border-image-slice, borderImageWidth, border-image-width, borderSpacing, border-spacing, boxShadow, box-shadow, caretColor, caret-color, clipPath, clip-path, color, colorScheme, color-scheme, columnWidth, column-width, content, counterIncrement, counter-increment, counterReset, counter-reset, counterSet, counter-set, cursor, d, filter, flexBasis, flex-basis, fontFamily, font-family, fontFeatureSettings, font-feature-settings, fontLanguageOverride, font-language-override, fontSize, font-size, fontVariantAlternates, font-variant-alternates, fontVariationSettings, font-variation-settings, gridTemplateAreas, grid-template-areas, hyphenateCharacter, hyphenate-character, letterSpacing, letter-spacing, lineHeight, line-height, listStyleType, list-style-type, maskClip, mask-clip, maskComposite, mask-composite, maskImage, mask-image, maskMode, mask-mode, maskOrigin, mask-origin, maskPositionX, mask-position-x, maskPositionY, mask-position-y, maskRepeat, mask-repeat, maskSize, mask-size, offsetAnchor, offset-anchor, offsetPath, offset-path, perspective, quotes, rotate, scale, scrollbarColor, scrollbar-color, shapeOutside, shape-outside, strokeDasharray, stroke-dasharray, strokeDashoffset, stroke-dashoffset, strokeWidth, stroke-width, tabSize, tab-size, textDecorationThickness, text-decoration-thickness, textEmphasisStyle, text-emphasis-style, textOverflow, text-overflow, textShadow, text-shadow, transitionDelay, transition-delay, transitionDuration, transition-duration, transitionProperty, transition-property, transitionTimingFunction, transition-timing-function, translate, verticalAlign, vertical-align, willChange, will-change, wordSpacing, word-spacing, clip, MozImageRegion, -moz-image-region, objectPosition, object-position, perspectiveOrigin, perspective-origin, fill, stroke, transformOrigin, transform-origin, gridTemplateColumns, grid-template-columns, gridTemplateRows, grid-template-rows, borderImageSource, border-image-source, listStyleImage, list-style-image, gridAutoColumns, grid-auto-columns, gridAutoRows, grid-auto-rows, transform, columnGap, column-gap, rowGap, row-gap, markerEnd, marker-end, markerMid, marker-mid, markerStart, marker-start, gridColumnEnd, grid-column-end, gridColumnStart, grid-column-start, gridRowEnd, grid-row-end, gridRowStart, grid-row-start, maxBlockSize, max-block-size, maxHeight, max-height, maxInlineSize, max-inline-size, maxWidth, max-width, cx, cy, offsetDistance, offset-distance, textIndent, text-indent, x, y, borderBottomLeftRadius, border-bottom-left-radius, borderBottomRightRadius, border-bottom-right-radius, borderEndEndRadius, border-end-end-radius, borderEndStartRadius, border-end-start-radius, borderStartEndRadius, border-start-end-radius, borderStartStartRadius, border-start-start-radius, borderTopLeftRadius, border-top-left-radius, borderTopRightRadius, border-top-right-radius, blockSize, block-size, height, inlineSize, inline-size, minBlockSize, min-block-size, minHeight, min-height, minInlineSize, min-inline-size, minWidth, min-width, width, outlineOffset, outline-offset, overflowClipMargin, overflow-clip-margin, scrollMarginBlockEnd, scroll-margin-block-end, scrollMarginBlockStart, scroll-margin-block-start, scrollMarginBottom, scroll-margin-bottom, scrollMarginInlineEnd, scroll-margin-inline-end, scrollMarginInlineStart, scroll-margin-inline-start, scrollMarginLeft, scroll-margin-left, scrollMarginRight, scroll-margin-right, scrollMarginTop, scroll-margin-top, paddingBlockEnd, padding-block-end, paddingBlockStart, padding-block-start, paddingBottom, padding-bottom, paddingInlineEnd, padding-inline-end, paddingInlineStart, padding-inline-start, paddingLeft, padding-left, paddingRight, padding-right, paddingTop, padding-top, r, shapeMargin, shape-margin, rx, ry, scrollPaddingBlockEnd, scroll-padding-block-end, scrollPaddingBlockStart, scroll-padding-block-start, scrollPaddingBottom, scroll-padding-bottom, scrollPaddingInlineEnd, scroll-padding-inline-end, scrollPaddingInlineStart, scroll-padding-inline-start, scrollPaddingLeft, scroll-padding-left, scrollPaddingRight, scroll-padding-right, scrollPaddingTop, scroll-padding-top, borderBlockEndWidth, border-block-end-width, borderBlockStartWidth, border-block-start-width, borderBottomWidth, border-bottom-width, borderInlineEndWidth, border-inline-end-width, borderInlineStartWidth, border-inline-start-width, borderLeftWidth, border-left-width, borderRightWidth, border-right-width, borderTopWidth, border-top-width, columnRuleWidth, column-rule-width, outlineWidth, outline-width, webkitTextStrokeWidth, WebkitTextStrokeWidth, -webkit-text-stroke-width, bottom, insetBlockEnd, inset-block-end, insetBlockStart, inset-block-start, insetInlineEnd, inset-inline-end, insetInlineStart, inset-inline-start, left, marginBlockEnd, margin-block-end, marginBlockStart, margin-block-start, marginBottom, margin-bottom, marginInlineEnd, margin-inline-end, marginInlineStart, margin-inline-start, marginLeft, margin-left, marginRight, margin-right, marginTop, margin-top, right, textUnderlineOffset, text-underline-offset, top, backgroundColor, background-color, borderBlockEndColor, border-block-end-color, borderBlockStartColor, border-block-start-color, borderBottomColor, border-bottom-color, borderInlineEndColor, border-inline-end-color, borderInlineStartColor, border-inline-start-color, borderLeftColor, border-left-color, borderRightColor, border-right-color, borderTopColor, border-top-color, columnRuleColor, column-rule-color, floodColor, flood-color, lightingColor, lighting-color, outlineColor, outline-color, stopColor, stop-color, textDecorationColor, text-decoration-color, textEmphasisColor, text-emphasis-color, webkitTextFillColor, WebkitTextFillColor, -webkit-text-fill-color, webkitTextStrokeColor, WebkitTextStrokeColor, -webkit-text-stroke-color, background, backgroundPosition, background-position, borderColor, border-color, borderStyle, border-style, borderWidth, border-width, borderTop, border-top, borderRight, border-right, borderBottom, border-bottom, borderLeft, border-left, borderBlockStart, border-block-start, borderBlockEnd, border-block-end, borderInlineStart, border-inline-start, borderInlineEnd, border-inline-end, border, borderRadius, border-radius, borderImage, border-image, borderBlockWidth, border-block-width, borderBlockStyle, border-block-style, borderBlockColor, border-block-color, borderInlineWidth, border-inline-width, borderInlineStyle, border-inline-style, borderInlineColor, border-inline-color, borderBlock, border-block, borderInline, border-inline, overflow, overscrollBehavior, overscroll-behavior, pageBreakBefore, page-break-before, pageBreakAfter, page-break-after, pageBreakInside, page-break-inside, offset, columns, columnRule, column-rule, font, fontVariant, font-variant, marker, textEmphasis, text-emphasis, webkitTextStroke, WebkitTextStroke, -webkit-text-stroke, listStyle, list-style, margin, marginBlock, margin-block, marginInline, margin-inline, scrollMargin, scroll-margin, scrollMarginBlock, scroll-margin-block, scrollMarginInline, scroll-margin-inline, outline, padding, paddingBlock, padding-block, paddingInline, padding-inline, scrollPadding, scroll-padding, scrollPaddingBlock, scroll-padding-block, scrollPaddingInline, scroll-padding-inline, flexFlow, flex-flow, flex, gap, gridRow, grid-row, gridColumn, grid-column, gridArea, grid-area, gridTemplate, grid-template, grid, placeContent, place-content, placeSelf, place-self, placeItems, place-items, inset, insetBlock, inset-block, insetInline, inset-inline, mask, maskPosition, mask-position, textDecoration, text-decoration, transition, animation, all, webkitBackgroundClip, WebkitBackgroundClip, -webkit-background-clip, webkitBackgroundOrigin, WebkitBackgroundOrigin, -webkit-background-origin, webkitBackgroundSize, WebkitBackgroundSize, -webkit-background-size, MozBorderStartColor, -moz-border-start-color, MozBorderStartStyle, -moz-border-start-style, MozBorderStartWidth, -moz-border-start-width, MozBorderEndColor, -moz-border-end-color, MozBorderEndStyle, -moz-border-end-style, MozBorderEndWidth, -moz-border-end-width, webkitBorderTopLeftRadius, WebkitBorderTopLeftRadius, -webkit-border-top-left-radius, webkitBorderTopRightRadius, WebkitBorderTopRightRadius, -webkit-border-top-right-radius, webkitBorderBottomRightRadius, WebkitBorderBottomRightRadius, -webkit-border-bottom-right-radius, webkitBorderBottomLeftRadius, WebkitBorderBottomLeftRadius, -webkit-border-bottom-left-radius, MozTransform, -moz-transform, webkitTransform, WebkitTransform, -webkit-transform, MozPerspective, -moz-perspective, webkitPerspective, WebkitPerspective, -webkit-perspective, MozPerspectiveOrigin, -moz-perspective-origin, webkitPerspectiveOrigin, WebkitPerspectiveOrigin, -webkit-perspective-origin, MozBackfaceVisibility, -moz-backface-visibility, webkitBackfaceVisibility, WebkitBackfaceVisibility, -webkit-backface-visibility, MozTransformStyle, -moz-transform-style, webkitTransformStyle, WebkitTransformStyle, -webkit-transform-style, MozTransformOrigin, -moz-transform-origin, webkitTransformOrigin, WebkitTransformOrigin, -webkit-transform-origin, MozAppearance, -moz-appearance, webkitAppearance, WebkitAppearance, -webkit-appearance, webkitBoxShadow, WebkitBoxShadow, -webkit-box-shadow, webkitFilter, WebkitFilter, -webkit-filter, MozFontFeatureSettings, -moz-font-feature-settings, MozFontLanguageOverride, -moz-font-language-override, colorAdjust, color-adjust, MozHyphens, -moz-hyphens, webkitTextSizeAdjust, WebkitTextSizeAdjust, -webkit-text-size-adjust, wordWrap, word-wrap, MozTabSize, -moz-tab-size, MozMarginStart, -moz-margin-start, MozMarginEnd, -moz-margin-end, MozPaddingStart, -moz-padding-start, MozPaddingEnd, -moz-padding-end, webkitFlexDirection, WebkitFlexDirection, -webkit-flex-direction, webkitFlexWrap, WebkitFlexWrap, -webkit-flex-wrap, webkitJustifyContent, WebkitJustifyContent, -webkit-justify-content, webkitAlignContent, WebkitAlignContent, -webkit-align-content, webkitAlignItems, WebkitAlignItems, -webkit-align-items, webkitFlexGrow, WebkitFlexGrow, -webkit-flex-grow, webkitFlexShrink, WebkitFlexShrink, -webkit-flex-shrink, webkitAlignSelf, WebkitAlignSelf, -webkit-align-self, webkitOrder, WebkitOrder, -webkit-order, webkitFlexBasis, WebkitFlexBasis, -webkit-flex-basis, MozBoxSizing, -moz-box-sizing, webkitBoxSizing, WebkitBoxSizing, -webkit-box-sizing, gridColumnGap, grid-column-gap, gridRowGap, grid-row-gap, webkitMaskRepeat, WebkitMaskRepeat, -webkit-mask-repeat, webkitMaskPositionX, WebkitMaskPositionX, -webkit-mask-position-x, webkitMaskPositionY, WebkitMaskPositionY, -webkit-mask-position-y, webkitMaskClip, WebkitMaskClip, -webkit-mask-clip, webkitMaskOrigin, WebkitMaskOrigin, -webkit-mask-origin, webkitMaskSize, WebkitMaskSize, -webkit-mask-size, webkitMaskComposite, WebkitMaskComposite, -webkit-mask-composite, webkitMaskImage, WebkitMaskImage, -webkit-mask-image, MozUserSelect, -moz-user-select, webkitUserSelect, WebkitUserSelect, -webkit-user-select, MozTransitionDuration, -moz-transition-duration, webkitTransitionDuration, WebkitTransitionDuration, -webkit-transition-duration, MozTransitionTimingFunction, -moz-transition-timing-function, webkitTransitionTimingFunction, WebkitTransitionTimingFunction, -webkit-transition-timing-function, MozTransitionProperty, -moz-transition-property, webkitTransitionProperty, WebkitTransitionProperty, -webkit-transition-property, MozTransitionDelay, -moz-transition-delay, webkitTransitionDelay, WebkitTransitionDelay, -webkit-transition-delay, MozAnimationName, -moz-animation-name, webkitAnimationName, WebkitAnimationName, -webkit-animation-name, MozAnimationDuration, -moz-animation-duration, webkitAnimationDuration, WebkitAnimationDuration, -webkit-animation-duration, MozAnimationTimingFunction, -moz-animation-timing-function, webkitAnimationTimingFunction, WebkitAnimationTimingFunction, -webkit-animation-timing-function, MozAnimationIterationCount, -moz-animation-iteration-count, webkitAnimationIterationCount, WebkitAnimationIterationCount, -webkit-animation-iteration-count, MozAnimationDirection, -moz-animation-direction, webkitAnimationDirection, WebkitAnimationDirection, -webkit-animation-direction, MozAnimationPlayState, -moz-animation-play-state, webkitAnimationPlayState, WebkitAnimationPlayState, -webkit-animation-play-state, MozAnimationFillMode, -moz-animation-fill-mode, webkitAnimationFillMode, WebkitAnimationFillMode, -webkit-animation-fill-mode, MozAnimationDelay, -moz-animation-delay, webkitAnimationDelay, WebkitAnimationDelay, -webkit-animation-delay, webkitBoxAlign, WebkitBoxAlign, -webkit-box-align, webkitBoxDirection, WebkitBoxDirection, -webkit-box-direction, webkitBoxFlex, WebkitBoxFlex, -webkit-box-flex, webkitBoxOrient, WebkitBoxOrient, -webkit-box-orient, webkitBoxPack, WebkitBoxPack, -webkit-box-pack, webkitBoxOrdinalGroup, WebkitBoxOrdinalGroup, -webkit-box-ordinal-group, MozBorderStart, -moz-border-start, MozBorderEnd, -moz-border-end, webkitBorderRadius, WebkitBorderRadius, -webkit-border-radius, MozBorderImage, -moz-border-image, webkitBorderImage, WebkitBorderImage, -webkit-border-image, webkitFlexFlow, WebkitFlexFlow, -webkit-flex-flow, webkitFlex, WebkitFlex, -webkit-flex, gridGap, grid-gap, webkitMask, WebkitMask, -webkit-mask, webkitMaskPosition, WebkitMaskPosition, -webkit-mask-position, MozTransition, -moz-transition, webkitTransition, WebkitTransition, -webkit-transition, MozAnimation, -moz-animation, webkitAnimation, WebkitAnimation, -webkit-animation, constructor`,
        jsKeys: 'Object.assign, Object.getPrototypeOf, Object.setPrototypeOf, Object.getOwnPropertyDescriptor, Object.getOwnPropertyDescriptors, Object.keys, Object.values, Object.entries, Object.is, Object.defineProperty, Object.defineProperties, Object.create, Object.getOwnPropertyNames, Object.getOwnPropertySymbols, Object.isExtensible, Object.preventExtensions, Object.freeze, Object.isFrozen, Object.seal, Object.isSealed, Object.fromEntries, Object.hasOwn, Object.toString, Object.toLocaleString, Object.valueOf, Object.hasOwnProperty, Object.isPrototypeOf, Object.propertyIsEnumerable, Object.__defineGetter__, Object.__defineSetter__, Object.__lookupGetter__, Object.__lookupSetter__, Object.__proto__, Function.toString, Function.apply, Function.call, Function.bind, Boolean.toString, Boolean.valueOf, Symbol.for, Symbol.keyFor, Symbol.isConcatSpreadable, Symbol.iterator, Symbol.match, Symbol.replace, Symbol.search, Symbol.species, Symbol.hasInstance, Symbol.split, Symbol.toPrimitive, Symbol.toStringTag, Symbol.unscopables, Symbol.asyncIterator, Symbol.matchAll, Symbol.toString, Symbol.valueOf, Symbol.description, Error.toString, Error.message, Error.stack, Number.isFinite, Number.isInteger, Number.isNaN, Number.isSafeInteger, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.MAX_VALUE, Number.MIN_VALUE, Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER, Number.EPSILON, Number.parseInt, Number.parseFloat, Number.NaN, Number.toString, Number.toLocaleString, Number.valueOf, Number.toFixed, Number.toExponential, Number.toPrecision, BigInt.asUintN, BigInt.asIntN, BigInt.valueOf, BigInt.toString, BigInt.toLocaleString, Math.abs, Math.acos, Math.asin, Math.atan, Math.atan2, Math.ceil, Math.clz32, Math.cos, Math.exp, Math.floor, Math.imul, Math.fround, Math.log, Math.max, Math.min, Math.pow, Math.random, Math.round, Math.sin, Math.sqrt, Math.tan, Math.log10, Math.log2, Math.log1p, Math.expm1, Math.cosh, Math.sinh, Math.tanh, Math.acosh, Math.asinh, Math.atanh, Math.hypot, Math.trunc, Math.sign, Math.cbrt, Math.E, Math.LOG2E, Math.LOG10E, Math.LN2, Math.LN10, Math.PI, Math.SQRT2, Math.SQRT1_2, Date.UTC, Date.parse, Date.now, Date.getTime, Date.getTimezoneOffset, Date.getYear, Date.getFullYear, Date.getUTCFullYear, Date.getMonth, Date.getUTCMonth, Date.getDate, Date.getUTCDate, Date.getDay, Date.getUTCDay, Date.getHours, Date.getUTCHours, Date.getMinutes, Date.getUTCMinutes, Date.getSeconds, Date.getUTCSeconds, Date.getMilliseconds, Date.getUTCMilliseconds, Date.setTime, Date.setYear, Date.setFullYear, Date.setUTCFullYear, Date.setMonth, Date.setUTCMonth, Date.setDate, Date.setUTCDate, Date.setHours, Date.setUTCHours, Date.setMinutes, Date.setUTCMinutes, Date.setSeconds, Date.setUTCSeconds, Date.setMilliseconds, Date.setUTCMilliseconds, Date.toUTCString, Date.toLocaleString, Date.toLocaleDateString, Date.toLocaleTimeString, Date.toDateString, Date.toTimeString, Date.toISOString, Date.toJSON, Date.toString, Date.valueOf, Date.toGMTString, String.fromCharCode, String.fromCodePoint, String.raw, String.toString, String.valueOf, String.toLowerCase, String.toUpperCase, String.charAt, String.charCodeAt, String.substring, String.padStart, String.padEnd, String.codePointAt, String.includes, String.indexOf, String.lastIndexOf, String.startsWith, String.endsWith, String.trim, String.trimStart, String.trimEnd, String.toLocaleLowerCase, String.toLocaleUpperCase, String.localeCompare, String.repeat, String.normalize, String.match, String.matchAll, String.search, String.replace, String.replaceAll, String.split, String.substr, String.concat, String.slice, String.at, String.bold, String.italics, String.fixed, String.strike, String.small, String.big, String.blink, String.sup, String.sub, String.anchor, String.link, String.fontcolor, String.fontsize, String.trimLeft, String.trimRight, RegExp.input, RegExp.lastMatch, RegExp.lastParen, RegExp.leftContext, RegExp.rightContext, RegExp.$1, RegExp.$2, RegExp.$3, RegExp.$4, RegExp.$5, RegExp.$6, RegExp.$7, RegExp.$8, RegExp.$9, RegExp.$_, RegExp.$&, RegExp.$+, RegExp.$`, RegExp.$\', RegExp.toString, RegExp.compile, RegExp.exec, RegExp.test, RegExp.flags, RegExp.hasIndices, RegExp.global, RegExp.ignoreCase, RegExp.multiline, RegExp.dotAll, RegExp.source, RegExp.sticky, RegExp.unicode, Array.isArray, Array.from, Array.of, Array.toString, Array.toLocaleString, Array.join, Array.reverse, Array.sort, Array.push, Array.pop, Array.shift, Array.unshift, Array.splice, Array.concat, Array.slice, Array.lastIndexOf, Array.indexOf, Array.forEach, Array.map, Array.filter, Array.reduce, Array.reduceRight, Array.some, Array.every, Array.find, Array.findIndex, Array.copyWithin, Array.fill, Array.entries, Array.keys, Array.values, Array.includes, Array.flatMap, Array.flat, Array.at, Map.get, Map.has, Map.set, Map.delete, Map.keys, Map.values, Map.clear, Map.forEach, Map.entries, Map.size, Set.has, Set.add, Set.delete, Set.entries, Set.clear, Set.forEach, Set.values, Set.keys, Set.size, WeakMap.has, WeakMap.get, WeakMap.delete, WeakMap.set, WeakSet.add, WeakSet.delete, WeakSet.has, Atomics.compareExchange, Atomics.load, Atomics.store, Atomics.exchange, Atomics.add, Atomics.sub, Atomics.and, Atomics.or, Atomics.xor, Atomics.isLockFree, Atomics.wait, Atomics.notify, Atomics.wake, JSON.parse, JSON.stringify, Promise.all, Promise.allSettled, Promise.any, Promise.race, Promise.reject, Promise.resolve, Promise.then, Promise.catch, Promise.finally, Reflect.apply, Reflect.construct, Reflect.defineProperty, Reflect.deleteProperty, Reflect.get, Reflect.getOwnPropertyDescriptor, Reflect.getPrototypeOf, Reflect.has, Reflect.isExtensible, Reflect.ownKeys, Reflect.preventExtensions, Reflect.set, Reflect.setPrototypeOf, Proxy.revocable, Intl.getCanonicalLocales, Intl.supportedValuesOf, Intl.Collator, Intl.DateTimeFormat, Intl.DisplayNames, Intl.ListFormat, Intl.Locale, Intl.NumberFormat, Intl.PluralRules, Intl.RelativeTimeFormat, WebAssembly.compile, WebAssembly.instantiate, WebAssembly.validate, WebAssembly.compileStreaming, WebAssembly.instantiateStreaming, WebAssembly.Module, WebAssembly.Instance, WebAssembly.Memory, WebAssembly.Table, WebAssembly.Global, WebAssembly.CompileError, WebAssembly.LinkError, WebAssembly.RuntimeError, WebAssembly.Tag, WebAssembly.Exception, Document.getElementsByTagName, Document.getElementsByTagNameNS, Document.getElementsByClassName, Document.getElementById, Document.createElement, Document.createElementNS, Document.createDocumentFragment, Document.createTextNode, Document.createComment, Document.createProcessingInstruction, Document.importNode, Document.adoptNode, Document.createEvent, Document.createRange, Document.createNodeIterator, Document.createTreeWalker, Document.createCDATASection, Document.createAttribute, Document.createAttributeNS, Document.getElementsByName, Document.open, Document.close, Document.write, Document.writeln, Document.hasFocus, Document.execCommand, Document.queryCommandEnabled, Document.queryCommandIndeterm, Document.queryCommandState, Document.queryCommandSupported, Document.queryCommandValue, Document.releaseCapture, Document.mozSetImageElement, Document.clear, Document.captureEvents, Document.releaseEvents, Document.exitFullscreen, Document.mozCancelFullScreen, Document.exitPointerLock, Document.enableStyleSheetsForSet, Document.caretPositionFromPoint, Document.querySelector, Document.querySelectorAll, Document.getSelection, Document.hasStorageAccess, Document.requestStorageAccess, Document.elementFromPoint, Document.elementsFromPoint, Document.getAnimations, Document.prepend, Document.append, Document.replaceChildren, Document.createExpression, Document.createNSResolver, Document.evaluate, Document.implementation, Document.URL, Document.documentURI, Document.compatMode, Document.characterSet, Document.charset, Document.inputEncoding, Document.contentType, Document.doctype, Document.documentElement, Document.domain, Document.referrer, Document.cookie, Document.lastModified, Document.readyState, Document.title, Document.dir, Document.body, Document.head, Document.images, Document.embeds, Document.plugins, Document.links, Document.forms, Document.scripts, Document.defaultView, Document.designMode, Document.onreadystatechange, Document.onbeforescriptexecute, Document.onafterscriptexecute, Document.currentScript, Document.fgColor, Document.linkColor, Document.vlinkColor, Document.alinkColor, Document.bgColor, Document.anchors, Document.applets, Document.all, Document.fullscreen, Document.mozFullScreen, Document.fullscreenEnabled, Document.mozFullScreenEnabled, Document.onfullscreenchange, Document.onfullscreenerror, Document.onpointerlockchange, Document.onpointerlockerror, Document.hidden, Document.visibilityState, Document.onvisibilitychange, Document.selectedStyleSheetSet, Document.lastStyleSheetSet, Document.preferredStyleSheetSet, Document.styleSheetSets, Document.scrollingElement, Document.timeline, Document.rootElement, Document.oncopy, Document.oncut, Document.onpaste, Document.activeElement, Document.styleSheets, Document.pointerLockElement, Document.fullscreenElement, Document.mozFullScreenElement, Document.adoptedStyleSheets, Document.fonts, Document.onabort, Document.onblur, Document.onfocus, Document.onauxclick, Document.onbeforeinput, Document.oncanplay, Document.oncanplaythrough, Document.onchange, Document.onclick, Document.onclose, Document.oncontextmenu, Document.oncuechange, Document.ondblclick, Document.ondrag, Document.ondragend, Document.ondragenter, Document.ondragexit, Document.ondragleave, Document.ondragover, Document.ondragstart, Document.ondrop, Document.ondurationchange, Document.onemptied, Document.onended, Document.onformdata, Document.oninput, Document.oninvalid, Document.onkeydown, Document.onkeypress, Document.onkeyup, Document.onload, Document.onloadeddata, Document.onloadedmetadata, Document.onloadend, Document.onloadstart, Document.onmousedown, Document.onmouseenter, Document.onmouseleave, Document.onmousemove, Document.onmouseout, Document.onmouseover, Document.onmouseup, Document.onwheel, Document.onpause, Document.onplay, Document.onplaying, Document.onprogress, Document.onratechange, Document.onreset, Document.onresize, Document.onscroll, Document.onsecuritypolicyviolation, Document.onseeked, Document.onseeking, Document.onselect, Document.onslotchange, Document.onstalled, Document.onsubmit, Document.onsuspend, Document.ontimeupdate, Document.onvolumechange, Document.onwaiting, Document.onselectstart, Document.onselectionchange, Document.ontoggle, Document.onpointercancel, Document.onpointerdown, Document.onpointerup, Document.onpointermove, Document.onpointerout, Document.onpointerover, Document.onpointerenter, Document.onpointerleave, Document.ongotpointercapture, Document.onlostpointercapture, Document.onmozfullscreenchange, Document.onmozfullscreenerror, Document.onanimationcancel, Document.onanimationend, Document.onanimationiteration, Document.onanimationstart, Document.ontransitioncancel, Document.ontransitionend, Document.ontransitionrun, Document.ontransitionstart, Document.onwebkitanimationend, Document.onwebkitanimationiteration, Document.onwebkitanimationstart, Document.onwebkittransitionend, Document.onerror, Document.children, Document.firstElementChild, Document.lastElementChild, Document.childElementCount, Element.getAttributeNames, Element.getAttribute, Element.getAttributeNS, Element.toggleAttribute, Element.setAttribute, Element.setAttributeNS, Element.removeAttribute, Element.removeAttributeNS, Element.hasAttribute, Element.hasAttributeNS, Element.hasAttributes, Element.closest, Element.matches, Element.webkitMatchesSelector, Element.getElementsByTagName, Element.getElementsByTagNameNS, Element.getElementsByClassName, Element.insertAdjacentElement, Element.insertAdjacentText, Element.mozMatchesSelector, Element.setPointerCapture, Element.releasePointerCapture, Element.hasPointerCapture, Element.setCapture, Element.releaseCapture, Element.getAttributeNode, Element.setAttributeNode, Element.removeAttributeNode, Element.getAttributeNodeNS, Element.setAttributeNodeNS, Element.getClientRects, Element.getBoundingClientRect, Element.scrollIntoView, Element.scroll, Element.scrollTo, Element.scrollBy, Element.insertAdjacentHTML, Element.querySelector, Element.querySelectorAll, Element.attachShadow, Element.requestFullscreen, Element.mozRequestFullScreen, Element.requestPointerLock, Element.animate, Element.getAnimations, Element.before, Element.after, Element.replaceWith, Element.remove, Element.prepend, Element.append, Element.replaceChildren, Element.namespaceURI, Element.prefix, Element.localName, Element.tagName, Element.id, Element.className, Element.classList, Element.part, Element.attributes, Element.scrollTop, Element.scrollLeft, Element.scrollWidth, Element.scrollHeight, Element.clientTop, Element.clientLeft, Element.clientWidth, Element.clientHeight, Element.scrollTopMax, Element.scrollLeftMax, Element.innerHTML, Element.outerHTML, Element.shadowRoot, Element.assignedSlot, Element.slot, Element.onfullscreenchange, Element.onfullscreenerror, Element.previousElementSibling, Element.nextElementSibling, Element.children, Element.firstElementChild, Element.lastElementChild, Element.childElementCount',
    },
});
// @ts-ignore
const getListDiff = ({ oldList, newList, removeCamelCase = false } = {}) => {
    const oldSet = new Set(oldList);
    const newSet = new Set(newList);
    newList.forEach((x) => oldSet.delete(x));
    oldList.forEach((x) => newSet.delete(x));
    const camelCase = /[a-z][A-Z]/;
    return {
        removed: !removeCamelCase ? [...oldSet] : [...oldSet].filter((key) => !camelCase.test(key)),
        added: !removeCamelCase ? [...newSet] : [...newSet].filter((key) => !camelCase.test(key)),
    };
};
const BROWSER = (IS_BLINK ? 'Chrome' : IS_GECKO ? 'Firefox' : '');
const getEngineMaps = (browser) => {
    const geckoCSS = {
        '71': ['-moz-column-span'],
        '72': ['offset', 'offset-anchor', 'offset-distance', 'offset-path', 'offset-rotate', 'rotate', 'scale', 'translate'],
        '73': ['overscroll-behavior-block', 'overscroll-behavior-inline'],
        '74-79': ['!-moz-stack-sizing', 'text-underline-position'],
        '80-88': ['appearance'],
        '89-90': ['!-moz-outline-radius', '!-moz-outline-radius-bottomleft', '!-moz-outline-radius-bottomright', '!-moz-outline-radius-topleft', '!-moz-outline-radius-topright', 'aspect-ratio'],
        '91': ['tab-size'],
        '92-95': ['accent-color'],
        '96': ['color-scheme'],
        '97': ['print-color-adjust', 'scrollbar-gutter', 'd'],
        '98-101': ['hyphenate-character'],
        '102': ['overflow-clip-margin'],
    };
    const blinkCSS = {
        '76': ['backdrop-filter'],
        '77-80': ['overscroll-behavior-block', 'overscroll-behavior-inline'],
        '81': ['color-scheme', 'image-orientation'],
        '83': ['contain-intrinsic-size'],
        '84': ['appearance', 'ruby-position'],
        '85-86': ['content-visibility', 'counter-set', 'inherits', 'initial-value', 'page-orientation', 'syntax'],
        '87': ['ascent-override', 'border-block', 'border-block-color', 'border-block-style', 'border-block-width', 'border-inline', 'border-inline-color', 'border-inline-style', 'border-inline-width', 'descent-override', 'inset', 'inset-block', 'inset-block-end', 'inset-block-start', 'inset-inline', 'inset-inline-end', 'inset-inline-start', 'line-gap-override', 'margin-block', 'margin-inline', 'padding-block', 'padding-inline', 'text-decoration-thickness', 'text-underline-offset'],
        '88': ['aspect-ratio'],
        '89': ['border-end-end-radius', 'border-end-start-radius', 'border-start-end-radius', 'border-start-start-radius', 'forced-color-adjust'],
        '90': ['overflow-clip-margin'],
        '91': ['additive-symbols', 'fallback', 'negative', 'pad', 'prefix', 'range', 'speak-as', 'suffix', 'symbols', 'system'],
        '92': ['size-adjust'],
        '93': ['accent-color'],
        '94': ['scrollbar-gutter'],
        '95-96': ['app-region', 'contain-intrinsic-block-size', 'contain-intrinsic-height', 'contain-intrinsic-inline-size', 'contain-intrinsic-width'],
        '97-98': ['font-synthesis-small-caps', 'font-synthesis-style', 'font-synthesis-weight', 'font-synthesis'],
        '99-100': ['text-emphasis-color', 'text-emphasis-position', 'text-emphasis-style', 'text-emphasis'],
        '101-103': ['font-palette', 'base-palette', 'override-colors'],
        '104': ['object-view-box'],
        '105': ['container-name', 'container-type', 'container'],
    };
    const geckoWindow = {
        // disregard: 'reportError','onsecuritypolicyviolation','onslotchange'
        '71': ['MathMLElement', '!SVGZoomAndPan'],
        '72-73': ['!BatteryManager', 'FormDataEvent', 'Geolocation', 'GeolocationCoordinates', 'GeolocationPosition', 'GeolocationPositionError', '!mozPaintCount'],
        '74': ['FormDataEvent', '!uneval'],
        '75': ['AnimationTimeline', 'CSSAnimation', 'CSSTransition', 'DocumentTimeline', 'SubmitEvent'],
        '76-77': ['AudioParamMap', 'AudioWorklet', 'AudioWorkletNode', 'Worklet'],
        '78': ['Atomics'],
        '79-81': ['AggregateError', 'FinalizationRegistry'],
        '82': ['MediaMetadata', 'MediaSession', 'Sanitizer'],
        '83': ['MediaMetadata', 'MediaSession', '!Sanitizer'],
        '84': ['PerformancePaintTiming'],
        '85-86': ['PerformancePaintTiming', '!HTMLMenuItemElement', '!onshow'],
        '87': ['onbeforeinput'],
        '88': ['onbeforeinput', '!VisualViewport'],
        '89-92': ['!ondevicelight', '!ondeviceproximity', '!onuserproximity'],
        '93-95': ['ElementInternals'],
        '96': ['Lock', 'LockManager'],
        '97': ['CSSLayerBlockRule', 'CSSLayerStatementRule'],
        '98': ['HTMLDialogElement'],
        '99': ['NavigationPreloadManager'],
        '100-102': ['WritableStream'],
    };
    const blinkWindow = {
        // disregard: EyeDropper
        '80': ['CompressionStream', 'DecompressionStream', 'FeaturePolicy', 'FragmentDirective', 'PeriodicSyncManager', 'VideoPlaybackQuality'],
        '81': ['SubmitEvent', 'XRHitTestResult', 'XRHitTestSource', 'XRRay', 'XRTransientInputHitTestResult', 'XRTransientInputHitTestSource'],
        '83': ['BarcodeDetector', 'XRDOMOverlayState', 'XRSystem'],
        '84': ['AnimationPlaybackEvent', 'AnimationTimeline', 'CSSAnimation', 'CSSTransition', 'DocumentTimeline', 'FinalizationRegistry', 'LayoutShiftAttribution', 'ResizeObserverSize', 'WakeLock', 'WakeLockSentinel', 'WeakRef', 'XRLayer'],
        '85': ['AggregateError', 'CSSPropertyRule', 'EventCounts', 'XRAnchor', 'XRAnchorSet'],
        '86': ['RTCEncodedAudioFrame', 'RTCEncodedVideoFrame'],
        '87': ['CookieChangeEvent', 'CookieStore', 'CookieStoreManager', 'Scheduling'],
        '88': ['Scheduling', '!BarcodeDetector'],
        '89': ['ReadableByteStreamController', 'ReadableStreamBYOBReader', 'ReadableStreamBYOBRequest', 'ReadableStreamDefaultController', 'XRWebGLBinding'],
        '90': ['AbstractRange', 'CustomStateSet', 'NavigatorUAData', 'XRCPUDepthInformation', 'XRDepthInformation', 'XRLightEstimate', 'XRLightProbe', 'XRWebGLDepthInformation'],
        '91': ['CSSCounterStyleRule', 'GravitySensor', 'NavigatorManagedData'],
        '92': ['CSSCounterStyleRule', '!SharedArrayBuffer'],
        '93': ['WritableStreamDefaultController'],
        '94': ['AudioData', 'AudioDecoder', 'AudioEncoder', 'EncodedAudioChunk', 'EncodedVideoChunk', 'IdleDetector', 'ImageDecoder', 'ImageTrack', 'ImageTrackList', 'VideoColorSpace', 'VideoDecoder', 'VideoEncoder', 'VideoFrame', 'MediaStreamTrackGenerator', 'MediaStreamTrackProcessor', 'Profiler', 'VirtualKeyboard', 'DelegatedInkTrailPresenter', 'Ink', 'Scheduler', 'TaskController', 'TaskPriorityChangeEvent', 'TaskSignal', 'VirtualKeyboardGeometryChangeEvent'],
        '95-96': ['URLPattern'],
        '97-98': ['WebTransport', 'WebTransportBidirectionalStream', 'WebTransportDatagramDuplexStream', 'WebTransportError'],
        '99': ['CanvasFilter', 'CSSLayerBlockRule', 'CSSLayerStatementRule'],
        '100': ['CSSMathClamp'],
        '101-104': ['CSSFontPaletteValuesRule'],
        '105': ['CSSContainerRule'],
    };
    const blinkJS = {
        '76': ['Document.onsecuritypolicyviolation', 'Promise.allSettled'],
        '77': ['Document.onformdata', 'Document.onpointerrawupdate'],
        '78': ['Element.elementTiming'],
        '79': ['Document.onanimationend', 'Document.onanimationiteration', 'Document.onanimationstart', 'Document.ontransitionend'],
        '80': ['!Document.registerElement', '!Element.createShadowRoot', '!Element.getDestinationInsertionPoints'],
        '81': ['Document.onwebkitanimationend', 'Document.onwebkitanimationiteration', 'Document.onwebkitanimationstart', 'Document.onwebkittransitionend', 'Element.ariaAtomic', 'Element.ariaAutoComplete', 'Element.ariaBusy', 'Element.ariaChecked', 'Element.ariaColCount', 'Element.ariaColIndex', 'Element.ariaColSpan', 'Element.ariaCurrent', 'Element.ariaDisabled', 'Element.ariaExpanded', 'Element.ariaHasPopup', 'Element.ariaHidden', 'Element.ariaKeyShortcuts', 'Element.ariaLabel', 'Element.ariaLevel', 'Element.ariaLive', 'Element.ariaModal', 'Element.ariaMultiLine', 'Element.ariaMultiSelectable', 'Element.ariaOrientation', 'Element.ariaPlaceholder', 'Element.ariaPosInSet', 'Element.ariaPressed', 'Element.ariaReadOnly', 'Element.ariaRelevant', 'Element.ariaRequired', 'Element.ariaRoleDescription', 'Element.ariaRowCount', 'Element.ariaRowIndex', 'Element.ariaRowSpan', 'Element.ariaSelected', 'Element.ariaSort', 'Element.ariaValueMax', 'Element.ariaValueMin', 'Element.ariaValueNow', 'Element.ariaValueText', 'Intl.DisplayNames'],
        '83': ['Element.ariaDescription', 'Element.onbeforexrselect'],
        '84': ['Document.getAnimations', 'Document.timeline', 'Element.ariaSetSize', 'Element.getAnimations'],
        '85': ['Promise.any', 'String.replaceAll'],
        '86': ['Document.fragmentDirective', 'Document.replaceChildren', 'Element.replaceChildren', '!Atomics.wake'],
        '87-89': ['Atomics.waitAsync', 'Document.ontransitioncancel', 'Document.ontransitionrun', 'Document.ontransitionstart', 'Intl.Segmenter'],
        '90': ['Document.onbeforexrselect', 'RegExp.hasIndices', '!Element.onbeforexrselect'],
        '91': ['Element.getInnerHTML'],
        '92': ['Array.at', 'String.at'],
        '93': ['Error.cause', 'Object.hasOwn'],
        '94': ['!Error.cause', 'Object.hasOwn'],
        '95-96': ['WebAssembly.Exception', 'WebAssembly.Tag'],
        '97-98': ['Array.findLast', 'Array.findLastIndex', 'Document.onslotchange'],
        '99-101': ['Intl.supportedValuesOf', 'Document.oncontextlost', 'Document.oncontextrestored'],
        '102': ['Element.ariaInvalid', 'Document.onbeforematch'],
        '103-105': ['Element.role'],
    };
    const geckoJS = {
        '71': ['Promise.allSettled'],
        '72-73': ['Document.onformdata', 'Element.part'],
        '74': ['!Array.toSource', '!Boolean.toSource', '!Date.toSource', '!Error.toSource', '!Function.toSource', '!Intl.toSource', '!JSON.toSource', '!Math.toSource', '!Number.toSource', '!Object.toSource', '!RegExp.toSource', '!String.toSource', '!WebAssembly.toSource'],
        '75-76': ['Document.getAnimations', 'Document.timeline', 'Element.getAnimations', 'Intl.Locale'],
        '77': ['String.replaceAll'],
        '78': ['Atomics.add', 'Atomics.and', 'Atomics.compareExchange', 'Atomics.exchange', 'Atomics.isLockFree', 'Atomics.load', 'Atomics.notify', 'Atomics.or', 'Atomics.store', 'Atomics.sub', 'Atomics.wait', 'Atomics.wake', 'Atomics.xor', 'Document.replaceChildren', 'Element.replaceChildren', 'Intl.ListFormat', 'RegExp.dotAll'],
        '79-84': ['Promise.any'],
        '85': ['!Document.onshow', 'Promise.any'],
        '86': ['Intl.DisplayNames'],
        '87': ['Document.onbeforeinput'],
        '88-89': ['RegExp.hasIndices'],
        '90-91': ['Array.at', 'String.at'],
        '92': ['Object.hasOwn'],
        '93-99': ['Intl.supportedValuesOf', 'Document.onsecuritypolicyviolation', 'Document.onslotchange'],
        '100': ['WebAssembly.Tag', 'WebAssembly.Exception'],
        '101-102': ['Document.adoptedStyleSheets'],
    };
    const IS_BLINK = browser == 'Chrome';
    const IS_GECKO = browser == 'Firefox';
    const css = (IS_BLINK ? blinkCSS : IS_GECKO ? geckoCSS : {});
    const win = (IS_BLINK ? blinkWindow : IS_GECKO ? geckoWindow : {});
    const js = (IS_BLINK ? blinkJS : IS_GECKO ? geckoJS : {});
    return {
        css,
        win,
        js,
    };
};
const getJSCoreFeatures = (win) => {
    const globalObjects = [
        'Object',
        'Function',
        'Boolean',
        'Symbol',
        'Error',
        'Number',
        'BigInt',
        'Math',
        'Date',
        'String',
        'RegExp',
        'Array',
        'Map',
        'Set',
        'WeakMap',
        'WeakSet',
        'Atomics',
        'JSON',
        'Promise',
        'Reflect',
        'Proxy',
        'Intl',
        'WebAssembly',
        'Document',
        'Element',
    ];
    try {
        // @ts-ignore
        const features = globalObjects.reduce((acc, name) => {
            const ignore = ['name', 'length', 'constructor', 'prototype', 'arguments', 'caller'];
            const descriptorKeys = Object.keys(Object.getOwnPropertyDescriptors(win[name] || {}));
            const descriptorProtoKeys = Object.keys(Object.getOwnPropertyDescriptors((win[name] || {}).prototype || {}));
            const uniques = [...new Set([...descriptorKeys, ...descriptorProtoKeys].filter((key) => !ignore.includes(key)))];
            const keys = uniques.map((key) => `${name}.${key}`);
            return [...acc, ...keys];
        }, []);
        return features;
    }
    catch (error) {
        console.error(error);
        return [];
    }
};
// @ts-ignore
const versionSort = (x) => x.sort((a, b) => /\d+/.exec(a)[0] - /\d+/.exec(b)[0]).reverse();
const getVersionLie = (vReport, version, forgivenessOffset = 0) => {
    const stable = getStableFeatures();
    const { version: maxVersion } = stable[BROWSER] || {};
    const validMetrics = vReport && version;
    if (!validMetrics) {
        return {};
    }
    const [vStart, vEnd] = version ? version.split('-') : [];
    const vMax = (vEnd || vStart);
    const reportIsTooHigh = +vReport > (+vMax + forgivenessOffset);
    const reportIsTooLow = +vReport < (+vStart - forgivenessOffset);
    const reportIsOff = (reportIsTooHigh || reportIsTooLow);
    const versionIsAboveMax = ((+vMax == maxVersion) &&
        (+vReport > maxVersion));
    const liedVersion = !versionIsAboveMax && reportIsOff;
    const distance = !liedVersion ? 0 : (Math.abs(vReport - (reportIsTooLow ? vStart : vMax)));
    return { liedVersion, distance };
};
// feature firewall
function getFeaturesLie(fp) {
    if (!fp.workerScope || !fp.workerScope.userAgent) {
        return false;
    }
    const { userAgentVersion: reportedVersion } = fp.workerScope;
    // let RFP pass
    const { privacy } = fp.resistance || {};
    if (privacy == 'Firefox' || privacy == 'Tor Browser') {
        return false;
    }
    const { cssVersion, jsVersion } = fp.features || {};
    const { liedVersion: liedCSS } = getVersionLie(reportedVersion, cssVersion);
    const { liedVersion: liedJS } = getVersionLie(reportedVersion, jsVersion);
    const liedVersion = liedCSS || liedJS;
    return liedVersion;
}
async function getEngineFeatures({ cssComputed, navigatorComputed, windowFeaturesComputed, }) {
    try {
        const timer = createTimer();
        await queueEvent(timer);
        const win = PHANTOM_DARKNESS ? PHANTOM_DARKNESS : window;
        if (!cssComputed || !windowFeaturesComputed) {
            logTestResult({ test: 'features', passed: false });
            return;
        }
        const jsFeaturesKeys = getJSCoreFeatures(win);
        const { keys: computedStyleKeys } = cssComputed.computedStyle || {};
        const { keys: windowFeaturesKeys } = windowFeaturesComputed || {};
        const { userAgentParsed: decryptedName } = navigatorComputed || {};
        const isNative = (win, x) => (/\[native code\]/.test(win[x] + '') &&
            'prototype' in win[x] &&
            win[x].prototype.constructor.name === x);
        // @ts-ignore
        const getFeatures = ({ context, allKeys, engineMap, checkNative = false } = {}) => {
            const allKeysSet = new Set(allKeys);
            const features = new Set();
            // @ts-ignore
            const match = Object.keys(engineMap || {}).reduce((acc, key) => {
                const version = engineMap[key];
                const versionLen = version.length;
                const featureLen = version.filter((prop) => {
                    const removedFromVersion = prop.charAt(0) == '!';
                    if (removedFromVersion) {
                        const propName = prop.slice(1);
                        return !allKeysSet.has(propName) && features.add(prop);
                    }
                    return (allKeysSet.has(prop) &&
                        (checkNative ? isNative(context, prop) : true) &&
                        features.add(prop));
                }).length;
                return versionLen == featureLen ? [...acc, key] : acc;
            }, []);
            const version = versionSort(match)[0];
            return {
                version,
                features,
            };
        };
        // engine maps
        const { css: engineMapCSS, win: engineMapWindow, js: engineMapJS, } = getEngineMaps(BROWSER);
        // css version
        const { version: cssVersion, features: cssFeatures, } = getFeatures({
            context: win,
            allKeys: computedStyleKeys,
            engineMap: engineMapCSS,
        });
        // window version
        const { version: windowVersion, features: windowFeatures, } = getFeatures({
            context: win,
            allKeys: windowFeaturesKeys,
            engineMap: engineMapWindow,
            checkNative: true,
        });
        // js version
        const { version: jsVersion, features: jsFeatures, } = getFeatures({
            context: win,
            allKeys: jsFeaturesKeys,
            engineMap: engineMapJS,
        });
        // determine version based on 3 factors
        const getVersionFromRange = (range, versionCollection) => {
            const exactVersion = versionCollection.find((version) => version && !/-/.test(version));
            if (exactVersion) {
                return exactVersion;
            }
            const len = range.length;
            const first = range[0];
            const last = range[len - 1];
            return (!len ? '' :
                len == 1 ? first :
                    `${last}-${first}`);
        };
        const versionSet = new Set([
            cssVersion,
            windowVersion,
            jsVersion,
        ]);
        versionSet.delete(undefined);
        const versionRange = versionSort([...versionSet].reduce((acc, x) => [...acc, ...x.split('-')], []));
        const version = getVersionFromRange(versionRange, [cssVersion, windowVersion, jsVersion]);
        const vReport = (/\d+/.exec(decryptedName) || [])[0];
        const { liedVersion: liedCSS, distance: distanceCSS, } = getVersionLie(vReport, cssVersion);
        const { liedVersion: liedJS, distance: distanceJS, } = getVersionLie(vReport, jsVersion);
        const { liedVersion: liedWindow, distance: distanceWindow, } = getVersionLie(vReport, windowVersion);
        if (liedCSS) {
            sendToTrash('userAgent', `v${vReport} failed v${cssVersion} CSS features`);
            if (distanceCSS > 1) {
                documentLie(`Navigator.userAgent`, `v${vReport} failed CSS features by ${distanceCSS} versions`);
            }
        }
        if (liedJS) {
            sendToTrash('userAgent', `v${vReport} failed v${jsVersion} JS features`);
            if (distanceJS > 2) {
                documentLie(`Navigator.userAgent`, `v${vReport} failed JS features by ${distanceJS} versions`);
            }
        }
        if (liedWindow) {
            sendToTrash('userAgent', `v${vReport} failed v${windowVersion} Window features`);
            if (distanceWindow > 3) {
                documentLie(`Navigator.userAgent`, `v${vReport} failed Window features by ${distanceWindow} versions`);
            }
        }
        logTestResult({ time: timer.stop(), test: 'features', passed: true });
        return {
            versionRange,
            version,
            cssVersion,
            windowVersion,
            jsVersion,
            cssFeatures: [...cssFeatures],
            windowFeatures: [...windowFeatures],
            jsFeatures: [...jsFeatures],
            jsFeaturesKeys,
        };
    }
    catch (error) {
        logTestResult({ test: 'features', passed: false });
        captureError(error);
        return;
    }
}
function featuresHTML(fp) {
    if (!fp.features) {
        return `
		<div class="col-six undefined">
			<div>Features: ${HTMLNote.UNKNOWN}</div>
			<div>JS/DOM: ${HTMLNote.UNKNOWN}</div>
		</div>
		<div class="col-six undefined">
			<div>CSS: ${HTMLNote.UNKNOWN}</div>
			<div>Window: ${HTMLNote.UNKNOWN}</div>
		</div>`;
    }
    const { versionRange, version, cssVersion, jsVersion, windowVersion, cssFeatures, windowFeatures, jsFeatures, jsFeaturesKeys, } = fp.features || {};
    const { keys: windowFeaturesKeys } = fp.windowFeatures || {};
    const { keys: computedStyleKeys } = fp.css.computedStyle || {};
    const { userAgentVersion } = fp.workerScope || {};
    const { css: engineMapCSS, win: engineMapWindow, js: engineMapJS, } = getEngineMaps(BROWSER);
    // logger
    const shouldLogFeatures = (browser, version, userAgentVersion) => {
        const shouldLog = userAgentVersion > version;
        return shouldLog;
    };
    const log = ({ features, name, diff }) => {
        console.groupCollapsed(`%c ${name} Features %c-${diff.removed.length} %c+${diff.added.length}`, 'color: #4cc1f9', 'color: Salmon', 'color: MediumAquaMarine');
        Object.keys(diff).forEach((key) => {
            console.log(`%c${key}:`, `color: ${key == 'added' ? 'MediumAquaMarine' : 'Salmon'}`);
            return console.log(diff[key].join('\n'));
        });
        console.log(features.join(', '));
        return console.groupEnd();
    };
    // modal
    const report = { computedStyleKeys, windowFeaturesKeys, jsFeaturesKeys };
    const getModal = ({ id, engineMap, features, browser, report, userAgentVersion }) => {
        // capture diffs from stable release
        const stable = getStableFeatures();
        const { windowKeys, cssKeys, jsKeys, version } = stable[browser] || {};
        const logger = shouldLogFeatures(browser, version, userAgentVersion);
        let diff;
        if (id == 'css') {
            const { computedStyleKeys } = report;
            diff = !cssKeys ? undefined : getListDiff({
                oldList: cssKeys.split(', '),
                newList: computedStyleKeys,
                removeCamelCase: true,
            });
            logger && console.log(`computing ${browser} ${userAgentVersion} diffs from ${browser} ${version}...`);
            logger && log({ features: computedStyleKeys, name: 'CSS', diff });
        }
        else if (id == 'window') {
            const { windowFeaturesKeys } = report;
            diff = !windowKeys ? undefined : getListDiff({
                oldList: windowKeys.split(', '),
                newList: windowFeaturesKeys,
            });
            logger && log({ features: windowFeaturesKeys, name: 'Window', diff });
        }
        else if (id == 'js') {
            const { jsFeaturesKeys } = report;
            diff = !jsKeys ? undefined : getListDiff({
                oldList: jsKeys.split(', '),
                newList: jsFeaturesKeys,
            });
            logger && log({ features: jsFeaturesKeys, name: 'JS', diff });
        }
        const header = !version || !diff || (!diff.added.length && !diff.removed.length) ? '' : `
			<strong>diffs from ${version}</strong>:
			<div>
			${diff && diff.added.length ?
            diff.added.map((key) => `<div><span>${key}</span></div>`).join('') : ''}
			${diff && diff.removed.length ?
            diff.removed.map((key) => `<div><span class="unsupport">${key}</span></div>`).join('') : ''}
			</div>

		`;
        return modal(`creep-features-${id}`, header + versionSort(Object.keys(engineMap)).map((key) => {
            return `
				<strong>${key}</strong>:<br>${engineMap[key].map((prop) => {
                return `<span class="${!features.has(prop) ? 'unsupport' : ''}">${prop}</span>`;
            }).join('<br>')}
			`;
        }).join('<br>'), hashMini([...features]));
    };
    const cssModal = getModal({
        id: 'css',
        engineMap: engineMapCSS,
        features: new Set(cssFeatures),
        browser: BROWSER,
        report,
        userAgentVersion,
    });
    const windowModal = getModal({
        id: 'window',
        engineMap: engineMapWindow,
        features: new Set(windowFeatures),
        browser: BROWSER,
        report,
        userAgentVersion,
    });
    const jsModal = getModal({
        id: 'js',
        engineMap: engineMapJS,
        features: new Set(jsFeatures),
        browser: BROWSER,
        report,
        userAgentVersion,
    });
    const getIcon = (name) => `<span class="icon ${name}"></span>`;
    const browserIcon = (!BROWSER ? '' :
        /chrome/i.test(BROWSER) ? getIcon('chrome') :
            /firefox/i.test(BROWSER) ? getIcon('firefox') :
                '');
    return `
	<style>
		.unsupport {
			background: #f1f1f1;
			color: #aaa;
		}
		.features-removed {
			background: red;
			color: #fff;
		}
		.features-added {
			background: green;
			color: #fff;
		}
		@media (prefers-color-scheme: dark) {
			.unsupport {
				color: var(--light-grey);
				background: none;
			}
		}
	</style>
	<span class="time">${performanceLogger.getLog().features}</span>
	<div class="col-six">
		<div>Features: ${versionRange.length ? `${browserIcon}${version}+` : HTMLNote.UNKNOWN}</div>
		<div>JS/DOM: ${jsVersion ? `${jsModal} (v${jsVersion})` : HTMLNote.UNKNOWN}</div>
	</div>
	<div class="col-six">
		<div>CSS: ${cssVersion ? `${cssModal} (v${cssVersion})` : HTMLNote.UNKNOWN}</div>
		<div>Window: ${windowVersion ? `${windowModal} (v${windowVersion})` : HTMLNote.UNKNOWN}</div>
	</div>
	`;
}

// inspired by Lalit Patel's fontdetect.js
// https://www.lalit.org/wordpress/wp-content/uploads/2008/05/fontdetect.js?ver=0.3
const WindowsFonts = {
    // https://docs.microsoft.com/en-us/typography/fonts/windows_11_font_list
    '7': [
        'Cambria Math',
        'Lucida Console',
    ],
    '8': [
        'Aldhabi',
        'Gadugi',
        'Myanmar Text',
        'Nirmala UI',
    ],
    '8.1': [
        'Leelawadee UI',
        'Javanese Text',
        'Segoe UI Emoji',
    ],
    '10': [
        'HoloLens MDL2 Assets',
        'Segoe MDL2 Assets',
        'Bahnschrift',
        'Ink Free', // 10 (v1803) +-
    ],
    '11': ['Segoe Fluent Icons'],
};
const MacOSFonts = {
    // Mavericks and below
    '10.9': [
        'Helvetica Neue',
        'Geneva', // mac (not iOS)
    ],
    // Yosemite
    '10.10': [
        'Kohinoor Devanagari Medium',
        'Luminari',
    ],
    // El Capitan
    '10.11': [
        'PingFang HK Light',
    ],
    // Sierra: https://support.apple.com/en-ie/HT206872
    '10.12': [
        'American Typewriter Semibold',
        'Futura Bold',
        'SignPainter-HouseScript Semibold',
    ],
    // High Sierra: https://support.apple.com/en-me/HT207962
    // Mojave: https://support.apple.com/en-us/HT208968
    '10.13-10.14': [
        'InaiMathi Bold',
    ],
    // Catalina: https://support.apple.com/en-us/HT210192
    // Big Sur: https://support.apple.com/en-sg/HT211240
    '10.15-11': [
        'Galvji',
        'MuktaMahee Regular',
    ],
    // Monterey: https://www.apple.com/my/macos/monterey/features/
    // https://apple.stackexchange.com/questions/429548/request-for-list-of-fonts-folder-contents-on-monterey
    // '12': []
};
const DesktopAppFonts = {
    // docs.microsoft.com/en-us/typography/font-list/ms-outlook
    'Microsoft Outlook': ['MS Outlook'],
    // https://community.adobe.com/t5/postscript-discussions/zwadobef-font/m-p/3730427#M785
    'Adobe Acrobat': ['ZWAdobeF'],
    // https://wiki.documentfoundation.org/Fonts
    'LibreOffice': [
        'Amiri',
        'KACSTOffice',
        'Liberation Mono',
        'Source Code Pro',
    ],
    // https://superuser.com/a/611804
    'OpenOffice': [
        'DejaVu Sans',
        'Gentium Book Basic',
        'OpenSymbol',
    ],
};
const APPLE_FONTS = Object.keys(MacOSFonts).map((key) => MacOSFonts[key]).flat();
const WINDOWS_FONTS = Object.keys(WindowsFonts).map((key) => WindowsFonts[key]).flat();
const DESKTOP_APP_FONTS = (Object.keys(DesktopAppFonts).map((key) => DesktopAppFonts[key]).flat());
const LINUX_FONTS = [
    'Arimo',
    'Chilanka',
    'Cousine',
    'Jomolhari',
    'MONO',
    'Noto Color Emoji',
    'Ubuntu', // ubuntu (not TB)
];
const ANDROID_FONTS = [
    'Dancing Script',
    'Droid Sans Mono',
    'Roboto', // Android, Chrome OS
];
const FONT_LIST = [
    ...APPLE_FONTS,
    ...WINDOWS_FONTS,
    ...LINUX_FONTS,
    ...ANDROID_FONTS,
    ...DESKTOP_APP_FONTS,
].sort();
async function getFonts() {
    const getPixelEmojis = ({ doc, id, emojis }) => {
        try {
            patch(doc.getElementById(id), html `
				<div id="pixel-emoji-container">
				<style>
					.pixel-emoji {
						font-family: ${CSS_FONT_FAMILY};
						font-size: 200px !important;
						height: auto;
						position: absolute !important;
						transform: scale(1.000999);
					}
					</style>
					${emojis.map((emoji) => {
                return `<div class="pixel-emoji">${emoji}</div>`;
            })}
				</div>
			`);
            // get emoji set and system
            const getEmojiDimensions = (style) => {
                return {
                    width: style.inlineSize,
                    height: style.blockSize,
                };
            };
            const pattern = new Set();
            const emojiElems = [...doc.getElementsByClassName('pixel-emoji')];
            const emojiSet = emojiElems.reduce((emojiSet, el, i) => {
                const style = getComputedStyle(el);
                const emoji = emojis[i];
                const { height, width } = getEmojiDimensions(style);
                const dimensions = `${width},${height}`;
                if (!pattern.has(dimensions)) {
                    pattern.add(dimensions);
                    emojiSet.add(emoji);
                }
                return emojiSet;
            }, new Set());
            const pixelToNumber = (pixels) => +(pixels.replace('px', ''));
            const pixelSizeSystemSum = 0.00001 * [...pattern].map((x) => {
                return x.split(',').map((x) => pixelToNumber(x)).reduce((acc, x) => acc += (+x || 0), 0);
            }).reduce((acc, x) => acc += x, 0);
            doc.body.removeChild(doc.getElementById('pixel-emoji-container'));
            return {
                emojiSet: [...emojiSet],
                pixelSizeSystemSum,
            };
        }
        catch (error) {
            console.error(error);
            return {
                emojiSet: [],
                pixelSizeSystemSum: 0,
            };
        }
    };
    const getFontFaceLoadFonts = async (fontList) => {
        try {
            const fontFaceList = fontList.map((font) => new FontFace(font, `local("${font}")`));
            const responseCollection = await Promise
                .allSettled(fontFaceList.map((font) => font.load()));
            // @ts-ignore
            const fonts = responseCollection.reduce((acc, font) => {
                if (font.status == 'fulfilled') {
                    return [...acc, font.value.family];
                }
                return acc;
            }, []);
            return fonts;
        }
        catch (error) {
            console.error(error);
            return [];
        }
    };
    const getPlatformVersion = (fonts) => {
        const getWindows = ({ fonts, fontMap }) => {
            const fontVersion = {
                ['11']: fontMap['11'].find((x) => fonts.includes(x)),
                ['10']: fontMap['10'].find((x) => fonts.includes(x)),
                ['8.1']: fontMap['8.1'].find((x) => fonts.includes(x)),
                ['8']: fontMap['8'].find((x) => fonts.includes(x)),
                // require complete set of Windows 7 fonts
                ['7']: fontMap['7'].filter((x) => fonts.includes(x)).length == fontMap['7'].length,
            };
            const hash = ('' + Object.keys(fontVersion).sort().filter((key) => !!fontVersion[key]));
            const hashMap = {
                '10,11,7,8,8.1': '11',
                '10,7,8,8.1': '10',
                '7,8,8.1': '8.1',
                '11,7,8,8.1': '8.1',
                '7,8': '8',
                '10,7,8': '8',
                '10,11,7,8': '8',
                '7': '7',
                '7,8.1': '7',
                '10,7,8.1': '7',
                '10,11,7,8.1': '7', // missing 8
            };
            const version = hashMap[hash];
            return version ? `Windows ${version}` : undefined;
        };
        const getMacOS = ({ fonts, fontMap }) => {
            const fontVersion = {
                ['10.15-11']: fontMap['10.15-11'].find((x) => fonts.includes(x)),
                ['10.13-10.14']: fontMap['10.13-10.14'].find((x) => fonts.includes(x)),
                ['10.12']: fontMap['10.12'].find((x) => fonts.includes(x)),
                ['10.11']: fontMap['10.11'].find((x) => fonts.includes(x)),
                ['10.10']: fontMap['10.10'].find((x) => fonts.includes(x)),
                // require complete set of 10.9 fonts
                ['10.9']: fontMap['10.9'].filter((x) => fonts.includes(x)).length == fontMap['10.9'].length,
            };
            const hash = ('' + Object.keys(fontVersion).sort().filter((key) => !!fontVersion[key]));
            const hashMap = {
                '10.10,10.11,10.12,10.13-10.14,10.15-11,10.9': '10.15-11',
                '10.10,10.11,10.12,10.13-10.14,10.9': '10.13-10.14',
                '10.10,10.11,10.12,10.9': 'Sierra',
                '10.10,10.11,10.9': 'El Capitan',
                '10.10,10.9': 'Yosemite',
                '10.9': 'Mavericks', // 10.9
            };
            const version = hashMap[hash];
            return version ? `macOS ${version}` : undefined;
        };
        return (getWindows({ fonts, fontMap: WindowsFonts }) ||
            getMacOS({ fonts, fontMap: MacOSFonts }));
    };
    const getDesktopApps = (fonts) => {
        // @ts-ignore
        const apps = Object.keys(DesktopAppFonts).reduce((acc, key) => {
            const appFontSet = DesktopAppFonts[key];
            const match = appFontSet.filter((x) => fonts.includes(x)).length == appFontSet.length;
            return match ? [...acc, key] : acc;
        }, []);
        return apps;
    };
    try {
        const timer = createTimer();
        await queueEvent(timer);
        const doc = (PHANTOM_DARKNESS &&
            PHANTOM_DARKNESS.document &&
            PHANTOM_DARKNESS.document.body ? PHANTOM_DARKNESS.document :
            document);
        const id = `font-fingerprint`;
        const div = doc.createElement('div');
        div.setAttribute('id', id);
        doc.body.appendChild(div);
        const { emojiSet, pixelSizeSystemSum, } = getPixelEmojis({
            doc,
            id,
            emojis: EMOJIS,
        }) || {};
        const fontList = FONT_LIST;
        const fontFaceLoadFonts = await getFontFaceLoadFonts(fontList);
        const platformVersion = getPlatformVersion(fontFaceLoadFonts);
        const apps = getDesktopApps(fontFaceLoadFonts);
        // detect lies
        const lied = (lieProps['FontFace.load'] ||
            lieProps['FontFace.family'] ||
            lieProps['FontFace.status'] ||
            lieProps['String.fromCodePoint'] ||
            lieProps['CSSStyleDeclaration.setProperty'] ||
            lieProps['CSS2Properties.setProperty']);
        logTestResult({ time: timer.stop(), test: 'fonts', passed: true });
        return {
            fontFaceLoadFonts,
            platformVersion,
            apps,
            emojiSet,
            pixelSizeSystemSum,
            lied,
        };
    }
    catch (error) {
        logTestResult({ test: 'fonts', passed: false });
        captureError(error);
        return;
    }
}
function fontsHTML(fp) {
    if (!fp.fonts) {
        return `
		<div class="col-six undefined">
			<strong>Fonts</strong>
			<div>load (0):</div>
			<div>apps:${HTMLNote.BLOCKED}</div>
			<div class="block-text-large">${HTMLNote.BLOCKED}</div>
			<div class="block-text">${HTMLNote.BLOCKED}</div>
		</div>`;
    }
    const { fonts: { $hash, fontFaceLoadFonts, platformVersion, apps, emojiSet, pixelSizeSystemSum, lied, }, } = fp;
    const icon = {
        'Linux': '<span class="icon linux"></span>',
        'Apple': '<span class="icon apple"></span>',
        'Windows': '<span class="icon windows"></span>',
        'Android': '<span class="icon android"></span>',
        'CrOS': '<span class="icon cros"></span>',
    };
    const blockHelpTitle = `FontFace.load()\nCSSStyleDeclaration.setProperty()\nblock-size\ninline-size\nhash: ${hashMini(emojiSet)}\n${(emojiSet || []).map((x, i) => i && (i % 6 == 0) ? `${x}\n` : x).join('')}`;
    return `
	<div class="relative col-six${lied ? ' rejected' : ''}">
		<span class="aside-note">${performanceLogger.getLog().fonts}</span>
		<strong>Fonts</strong><span class="hash">${hashSlice($hash)}</span>
		<div class="help" title="FontFace.load()">load (${fontFaceLoadFonts ? count(fontFaceLoadFonts) : '0'}/${'' + FONT_LIST.length}): ${platformVersion || ((fonts) => {
        return !(fonts || []).length ? '' : ((('' + fonts).match(/Lucida Console/) || []).length ? `${icon.Windows}Windows` :
            (('' + fonts).match(/Droid Sans Mono|Noto Color Emoji|Roboto/g) || []).length == 3 ? `${icon.Linux}${icon.Android}Linux Android` :
                (('' + fonts).match(/Droid Sans Mono|Roboto/g) || []).length == 2 ? `${icon.Android}Android` :
                    (('' + fonts).match(/Noto Color Emoji|Roboto/g) || []).length == 2 ? `${icon.CrOS}Chrome OS` :
                        (('' + fonts).match(/Noto Color Emoji/) || []).length ? `${icon.Linux}Linux` :
                            (('' + fonts).match(/Arimo/) || []).length ? `${icon.Linux}Linux` :
                                (('' + fonts).match(/Helvetica Neue/g) || []).length == 2 ? `${icon.Apple}Apple` :
                                    `${(fonts || [])[0]}...`);
    })(fontFaceLoadFonts)}</div>
		<div>apps: ${(apps || []).length ? apps.join(', ') : HTMLNote.UNSUPPORTED}</div>
		<div class="block-text-large help relative" title="FontFace.load()">
			${fontFaceLoadFonts.join(', ') || HTMLNote.UNSUPPORTED}
		</div>
		<div class="block-text help relative" title="${blockHelpTitle}">
			<div>
				<br><span>${pixelSizeSystemSum || HTMLNote.UNSUPPORTED}</span>
				<br><span class="grey jumbo" style="font-family: ${CSS_FONT_FAMILY}">${formatEmojiSet(emojiSet)}</span>
			</div>
		</div>
	</div>
	`;
}

/* eslint-disable new-cap */
/**
 * @param {{ userAgent: string; }} workerScope
 */
async function getHeadlessFeatures(workerScope) {
    try {
        const timer = createTimer();
        await queueEvent(timer);
        const [getTooMuchRecursionLie, getNewObjectToStringTypeErrorLie, getChainCycleLie, getReflectSetProtoLie, getReflectSetProtoProxyLie, getInstanceofCheckLie, getDefinePropertiesLie,] = proxyDetectionMethods;
        const mimeTypes = Object.keys(Object.assign({}, navigator.mimeTypes));
        const data = {
            chromium: IS_BLINK,
            likeHeadless: {
                ['navigator.webdriver is on']: 'webdriver' in navigator && !!navigator.webdriver,
                ['chrome plugins array is empty']: IS_BLINK && navigator.plugins.length === 0,
                ['chrome mimeTypes array is empty']: IS_BLINK && mimeTypes.length === 0,
                ['notification permission is denied']: (IS_BLINK &&
                    'Notification' in window &&
                    (Notification.permission == 'denied')),
                ['chrome system color ActiveText is rgb(255, 0, 0)']: IS_BLINK && (() => {
                    let rendered = PARENT_PHANTOM;
                    if (!PARENT_PHANTOM) {
                        rendered = document.createElement('div');
                        document.body.appendChild(rendered);
                    }
                    if (!rendered)
                        return false;
                    rendered.setAttribute('style', `background-color: ActiveText`);
                    const { backgroundColor: activeText } = getComputedStyle(rendered);
                    if (!PARENT_PHANTOM) {
                        // @ts-ignore
                        rendered.parentNode.removeChild(rendered);
                    }
                    return activeText === 'rgb(255, 0, 0)';
                })(),
                ['prefers light color scheme']: matchMedia('(prefers-color-scheme: light)').matches,
            },
            headless: {
                ['chrome window.chrome is undefined']: IS_BLINK && !('chrome' in window),
                ['chrome permission state is inconsistent']: (IS_BLINK &&
                    'permissions' in navigator &&
                    await (async () => {
                        const res = await navigator.permissions.query({ name: 'notifications' });
                        return (res.state == 'prompt' &&
                            'Notification' in window &&
                            Notification.permission === 'denied');
                    })()),
                ['userAgent contains HeadlessChrome']: (/HeadlessChrome/.test(navigator.userAgent) ||
                    /HeadlessChrome/.test(navigator.appVersion)),
                ['worker userAgent contains HeadlessChrome']: !!workerScope && (/HeadlessChrome/.test(workerScope.userAgent)),
            },
            stealth: {
                ['srcdoc throws an error']: (() => {
                    try {
                        const { srcdoc } = document.createElement('iframe');
                        return !!srcdoc;
                    }
                    catch (error) {
                        return true;
                    }
                })(),
                ['srcdoc triggers a window Proxy']: (() => {
                    const iframe = document.createElement('iframe');
                    iframe.srcdoc = instanceId;
                    return !!iframe.contentWindow;
                })(),
                ['index of chrome is too high']: (() => {
                    const control = ('cookieStore' in window ? 'cookieStore' :
                        'ondevicemotion' in window ? 'ondevicemotion' :
                            'speechSynthesis');
                    const propsInWindow = [];
                    // eslint-disable-next-line guard-for-in
                    for (const prop in window) {
                        propsInWindow.push(prop);
                    }
                    const chromeIndex = propsInWindow.indexOf('chrome');
                    const controlIndex = propsInWindow.indexOf(control);
                    return chromeIndex > controlIndex;
                })(),
                ['chrome.runtime functions are invalid']: (() => {
                    // @ts-ignore
                    if (!('chrome' in window && 'runtime' in chrome)) {
                        return false;
                    }
                    try {
                        // @ts-ignore
                        if ('prototype' in chrome.runtime.sendMessage ||
                            // @ts-ignore
                            'prototype' in chrome.runtime.connect) {
                            return true;
                        }
                        // @ts-ignore
                        new chrome.runtime.sendMessage;
                        // @ts-ignore
                        new chrome.runtime.connect;
                        return true;
                    }
                    catch (error) {
                        return error.constructor.name != 'TypeError' ? true : false;
                    }
                })(),
                ['Permissions.prototype.query leaks Proxy behavior']: (() => {
                    if (!('Permissions' in window)) {
                        return false;
                    }
                    const apiFunction = Permissions.prototype.query;
                    return (
                    // @ts-ignore
                    getTooMuchRecursionLie({ apiFunction }) ||
                        // @ts-ignore
                        getTooMuchRecursionLie({ apiFunction, method: '__proto__' }) ||
                        // @ts-ignore
                        getChainCycleLie({ apiFunction }) ||
                        // @ts-ignore
                        getChainCycleLie({ apiFunction, method: '__proto__' }) ||
                        // @ts-ignore
                        getReflectSetProtoLie({ apiFunction }) ||
                        // @ts-ignore
                        getReflectSetProtoProxyLie({ apiFunction }) ||
                        // @ts-ignore
                        getInstanceofCheckLie(apiFunction) ||
                        // @ts-ignore
                        getDefinePropertiesLie(apiFunction));
                })(),
                ['Function.prototype.toString leaks Proxy behavior']: (() => {
                    try {
                        // @ts-ignore
                        class Blah extends Function.prototype.toString {
                        } // eslint-disable-line no-unused-vars
                        return true;
                    }
                    catch (error) {
                        return /\[object Function\]/.test(error.message);
                    }
                })(),
                ['Function.prototype.toString has invalid TypeError']: (() => {
                    const apiFunction = Function.prototype.toString;
                    const liedToString = (
                    // @ts-ignore
                    getNewObjectToStringTypeErrorLie(apiFunction) ||
                        // @ts-ignore
                        getNewObjectToStringTypeErrorLie(() => { }) ||
                        // @ts-ignore
                        getTooMuchRecursionLie({ apiFunction }) ||
                        // @ts-ignore
                        getTooMuchRecursionLie({ apiFunction, method: '__proto__' }) ||
                        // @ts-ignore
                        getChainCycleLie({ apiFunction }) ||
                        // @ts-ignore
                        getChainCycleLie({ apiFunction, method: '__proto__' }) ||
                        // @ts-ignore
                        getReflectSetProtoLie({ apiFunction }) ||
                        // @ts-ignore
                        getReflectSetProtoProxyLie({ apiFunction }) ||
                        // @ts-ignore
                        getInstanceofCheckLie(apiFunction) ||
                        // @ts-ignore
                        getDefinePropertiesLie(apiFunction));
                    return liedToString;
                })(),
            },
        };
        const { likeHeadless, headless, stealth } = data;
        const likeHeadlessKeys = Object.keys(likeHeadless);
        const headlessKeys = Object.keys(headless);
        const stealthKeys = Object.keys(stealth);
        const likeHeadlessRating = +((likeHeadlessKeys.filter((key) => likeHeadless[key]).length / likeHeadlessKeys.length) * 100).toFixed(0);
        const headlessRating = +((headlessKeys.filter((key) => headless[key]).length / headlessKeys.length) * 100).toFixed(0);
        const stealthRating = +((stealthKeys.filter((key) => stealth[key]).length / stealthKeys.length) * 100).toFixed(0);
        logTestResult({ time: timer.stop(), test: 'headless', passed: true });
        return Object.assign(Object.assign({}, data), { likeHeadlessRating, headlessRating, stealthRating });
    }
    catch (error) {
        logTestResult({ test: 'headless', passed: false });
        captureError(error);
        return;
    }
}
function headlessFeaturesHTML(fp) {
    if (!fp.headless) {
        return `
		<div class="col-six">
			<strong>Headless</strong>
			<div>chromium: ${HTMLNote.Blocked}</div>
			<div>0% like headless: ${HTMLNote.Blocked}</div>
			<div>0% headless: ${HTMLNote.Blocked}</div>
			<div>0% stealth: ${HTMLNote.Blocked}</div>
		</div>`;
    }
    const { headless: data, } = fp;
    const { $hash, chromium, likeHeadless, likeHeadlessRating, headless, headlessRating, stealth, stealthRating, } = data || {};
    return `
	<div class="relative col-six">
		<style>
			.like-headless-rating {
				background: linear-gradient(90deg, var(${likeHeadlessRating < 100 ? '--grey-glass' : '--error'}) ${likeHeadlessRating}%, #fff0 ${likeHeadlessRating}%, #fff0 100%);
			}
			.headless-rating {
				background: linear-gradient(90deg, var(--error) ${headlessRating}%, #fff0 ${headlessRating}%, #fff0 100%);
			}
			.stealth-rating {
				background: linear-gradient(90deg, var(--error) ${stealthRating}%, #fff0 ${stealthRating}%, #fff0 100%);
			}
		</style>
		<span class="aside-note">${performanceLogger.getLog().headless}</span>
		<strong>Headless</strong><span class="hash">${hashSlice($hash)}</span>
		<div>chromium: ${'' + chromium}</div>
		<div class="like-headless-rating">${'' + likeHeadlessRating}% like headless: ${modal('creep-like-headless', '<strong>Like Headless</strong><br><br>' +
        Object.keys(likeHeadless).map((key) => `${key}: ${'' + likeHeadless[key]}`).join('<br>'), hashMini(likeHeadless))}</div>
		<div class="headless-rating">${'' + headlessRating}% headless: ${modal('creep-headless', '<strong>Headless</strong><br><br>' +
        Object.keys(headless).map((key) => `${key}: ${'' + headless[key]}`).join('<br>'), hashMini(headless))}</div>
		<div class="stealth-rating">${'' + stealthRating}% stealth: ${modal('creep-stealth', '<strong>Stealth</strong><br><br>' +
        Object.keys(stealth).map((key) => `${key}: ${'' + stealth[key]}`).join('<br>'), hashMini(stealth))}</div>
	</div>`;
}

async function getIntl() {
    const getLocale = (intl) => {
        const constructors = [
            'Collator',
            'DateTimeFormat',
            'DisplayNames',
            'ListFormat',
            'NumberFormat',
            'PluralRules',
            'RelativeTimeFormat',
        ];
        // @ts-ignore
        const locale = constructors.reduce((acc, name) => {
            try {
                const obj = new intl[name];
                if (!obj) {
                    return acc;
                }
                const { locale } = obj.resolvedOptions() || {};
                return [...acc, locale];
            }
            catch (error) {
                return acc;
            }
        }, []);
        return [...new Set(locale)];
    };
    try {
        const timer = createTimer();
        await queueEvent(timer);
        const lied = (lieProps['Intl.Collator.resolvedOptions'] ||
            lieProps['Intl.DateTimeFormat.resolvedOptions'] ||
            lieProps['Intl.DisplayNames.resolvedOptions'] ||
            lieProps['Intl.ListFormat.resolvedOptions'] ||
            lieProps['Intl.NumberFormat.resolvedOptions'] ||
            lieProps['Intl.PluralRules.resolvedOptions'] ||
            lieProps['Intl.RelativeTimeFormat.resolvedOptions']) || false;
        const dateTimeFormat = caniuse(() => {
            return new Intl.DateTimeFormat(undefined, {
                month: 'long',
                timeZoneName: 'long',
            }).format(963644400000);
        });
        const displayNames = caniuse(() => {
            return new Intl.DisplayNames(undefined, {
                type: 'language',
            }).of('en-US');
        });
        const listFormat = caniuse(() => {
            // @ts-ignore
            return new Intl.ListFormat(undefined, {
                style: 'long',
                type: 'disjunction',
            }).format(['0', '1']);
        });
        const numberFormat = caniuse(() => {
            return new Intl.NumberFormat(undefined, {
                notation: 'compact',
                compactDisplay: 'long',
            }).format(21000000);
        });
        const pluralRules = caniuse(() => {
            return new Intl.PluralRules().select(1);
        });
        const relativeTimeFormat = caniuse(() => {
            return new Intl.RelativeTimeFormat(undefined, {
                localeMatcher: 'best fit',
                numeric: 'auto',
                style: 'long',
            }).format(1, 'year');
        });
        const locale = getLocale(Intl);
        logTestResult({ time: timer.stop(), test: 'intl', passed: true });
        return {
            dateTimeFormat,
            displayNames,
            listFormat,
            numberFormat,
            pluralRules,
            relativeTimeFormat,
            locale: '' + locale,
            lied,
        };
    }
    catch (error) {
        logTestResult({ test: 'intl', passed: false });
        captureError(error);
        return;
    }
}
function intlHTML(fp) {
    if (!fp.htmlElementVersion) {
        return `
		<div class="col-six undefined">
			<strong>Intl</strong>
			<div>locale: ${HTMLNote.Blocked}</div>
			<div>date: ${HTMLNote.Blocked}</div>
			<div>display: ${HTMLNote.Blocked}</div>
			<div>list: ${HTMLNote.Blocked}</div>
			<div>number: ${HTMLNote.Blocked}</div>
			<div>plural: ${HTMLNote.Blocked}</div>
			<div>relative: ${HTMLNote.Blocked}</div>
		</div>`;
    }
    const { $hash, dateTimeFormat, displayNames, listFormat, numberFormat, pluralRules, relativeTimeFormat, locale, lied, } = fp.intl || {};
    return `
	<div class="relative col-six${lied ? ' rejected' : ''}">
		<span class="aside-note">${performanceLogger.getLog().intl}</span>
		<strong>Intl</strong><span class="hash">${hashSlice($hash)}</span>
		<div class="block-text help"  title="Intl.Collator\nIntl.DateTimeFormat\nIntl.DisplayNames\nIntl.ListFormat\nIntl.NumberFormat\nIntl.PluralRules\nIntl.RelativeTimeFormat">
			${[
        locale,
        dateTimeFormat,
        displayNames,
        numberFormat,
        relativeTimeFormat,
        listFormat,
        pluralRules,
    ].join('<br>')}
		</div>
	</div>
	`;
}

function getMaths() {
    try {
        const timer = createTimer();
        timer.start();
        // detect failed math equality lie
        const check = [
            'acos',
            'acosh',
            'asin',
            'asinh',
            'atan',
            'atanh',
            'atan2',
            'cbrt',
            'cos',
            'cosh',
            'expm1',
            'exp',
            'hypot',
            'log',
            'log1p',
            'log10',
            'sin',
            'sinh',
            'sqrt',
            'tan',
            'tanh',
            'pow',
        ];
        let lied = false;
        check.forEach((prop) => {
            if (!!lieProps[`Math.${prop}`]) {
                lied = true;
            }
            const test = (prop == 'cos' ? [1e308] :
                prop == 'acos' || prop == 'asin' || prop == 'atanh' ? [0.5] :
                    prop == 'pow' || prop == 'atan2' ? [Math.PI, 2] :
                        [Math.PI]);
            const res1 = Math[prop](...test);
            const res2 = Math[prop](...test);
            const matching = isNaN(res1) && isNaN(res2) ? true : res1 == res2;
            if (!matching) {
                lied = true;
                const mathLie = `expected x and got y`;
                documentLie(`Math.${prop}`, mathLie);
            }
            return;
        });
        const n = 0.123;
        const bigN = 5.860847362277284e+38;
        const fns = [
            ['acos', [n], `acos(${n})`, 1.4474840516030247, NaN, NaN, 1.4474840516030245],
            ['acos', [Math.SQRT1_2], 'acos(Math.SQRT1_2)', 0.7853981633974483, NaN, NaN, NaN],
            ['acosh', [1e308], 'acosh(1e308)', 709.889355822726, NaN, NaN, NaN],
            ['acosh', [Math.PI], 'acosh(Math.PI)', 1.811526272460853, NaN, NaN, NaN],
            ['acosh', [Math.SQRT2], 'acosh(Math.SQRT2)', 0.881373587019543, NaN, NaN, 0.8813735870195432],
            ['asin', [n], `asin(${n})`, 0.12331227519187199, NaN, NaN, NaN],
            ['asinh', [1e300], 'asinh(1e308)', 691.4686750787736, NaN, NaN, NaN],
            ['asinh', [Math.PI], 'asinh(Math.PI)', 1.8622957433108482, NaN, NaN, NaN],
            ['atan', [2], 'atan(2)', 1.1071487177940904, NaN, NaN, 1.1071487177940906],
            ['atan', [Math.PI], 'atan(Math.PI)', 1.2626272556789115, NaN, NaN, NaN],
            ['atanh', [0.5], 'atanh(0.5)', 0.5493061443340548, NaN, NaN, 0.5493061443340549],
            ['atan2', [1e-310, 2], 'atan2(1e-310, 2)', 5e-311, NaN, NaN, NaN],
            ['atan2', [Math.PI, 2], 'atan2(Math.PI)', 1.0038848218538872, NaN, NaN, NaN],
            ['cbrt', [100], 'cbrt(100)', 4.641588833612779, NaN, NaN, NaN],
            ['cbrt', [Math.PI], 'cbrt(Math.PI)', 1.4645918875615231, NaN, NaN, 1.4645918875615234],
            ['cos', [n], `cos(${n})`, 0.9924450321351935, NaN, NaN, NaN],
            ['cos', [Math.PI], 'cos(Math.PI)', -1, NaN, NaN, NaN],
            ['cos', [bigN], `cos(${bigN})`, -0.10868049424995659, NaN, -0.9779661551196617, NaN],
            ['cos', [-1e308], 'cos(-1e308)', -0.8913089376870335, NaN, 0.99970162388838, NaN],
            ['cos', [13 * Math.E], 'cos(13*Math.E)', -0.7108118501064331, -0.7108118501064332, NaN, NaN],
            ['cos', [57 * Math.E], 'cos(57*Math.E)', -0.536911695749024, -0.5369116957490239, NaN, NaN],
            ['cos', [21 * Math.LN2], 'cos(21*Math.LN2)', -0.4067775970251724, -0.40677759702517235, -0.6534063185820197, NaN],
            ['cos', [51 * Math.LN2], 'cos(51*Math.LN2)', -0.7017203400855446, -0.7017203400855445, NaN, NaN],
            ['cos', [21 * Math.LOG2E], 'cos(21*Math.LOG2E)', 0.4362848063618998, 0.43628480636189976, NaN, NaN],
            ['cos', [25 * Math.SQRT2], 'cos(25*Math.SQRT2)', -0.6982689820462377, -0.6982689820462376, NaN, NaN],
            ['cos', [50 * Math.SQRT1_2], 'cos(50*Math.SQRT1_2)', -0.6982689820462377, -0.6982689820462376, NaN, NaN],
            ['cos', [21 * Math.SQRT1_2], 'cos(21*Math.SQRT1_2)', -0.6534063185820198, NaN, NaN, NaN],
            ['cos', [17 * Math.LOG10E], 'cos(17*Math.LOG10E)', 0.4537557425982784, 0.45375574259827833, NaN, NaN],
            ['cos', [2 * Math.LOG10E], 'cos(2*Math.LOG10E)', 0.6459044007438142, NaN, 0.6459044007438141, NaN],
            ['cosh', [1], 'cosh(1)', 1.5430806348152437, NaN, NaN, NaN],
            ['cosh', [Math.PI], 'cosh(Math.PI)', 11.591953275521519, NaN, NaN, NaN],
            ['cosh', [492 * Math.LOG2E], 'cosh(492*Math.LOG2E)', 9.199870313877772e+307, 9.199870313877774e+307, NaN, NaN],
            ['cosh', [502 * Math.SQRT2], 'cosh(502*Math.SQRT2)', 1.0469199669023138e+308, 1.046919966902314e+308, NaN, NaN],
            ['expm1', [1], 'expm1(1)', 1.718281828459045, NaN, NaN, 1.7182818284590453],
            ['expm1', [Math.PI], 'expm1(Math.PI)', 22.140692632779267, NaN, NaN, NaN],
            ['exp', [n], `exp(${n})`, 1.1308844209474893, NaN, NaN, NaN],
            ['exp', [Math.PI], 'exp(Math.PI)', 23.140692632779267, NaN, NaN, NaN],
            ['hypot', [1, 2, 3, 4, 5, 6], 'hypot(1, 2, 3, 4, 5, 6)', 9.539392014169456, NaN, NaN, NaN],
            ['hypot', [bigN, bigN], `hypot(${bigN}, ${bigN})`, 8.288489826731116e+38, 8.288489826731114e+38, NaN, NaN],
            ['hypot', [2 * Math.E, -100], 'hypot(2*Math.E, -100)', 100.14767208675259, 100.14767208675258, NaN, NaN],
            ['hypot', [6 * Math.PI, -100], 'hypot(6*Math.PI, -100)', 101.76102278593319, 101.7610227859332, NaN, NaN],
            ['hypot', [2 * Math.LN2, -100], 'hypot(2*Math.LN2, -100)', 100.0096085986525, 100.00960859865252, NaN, NaN],
            ['hypot', [Math.LOG2E, -100], 'hypot(Math.LOG2E, -100)', 100.01040630344929, 100.01040630344927, NaN, NaN],
            ['hypot', [Math.SQRT2, -100], 'hypot(Math.SQRT2, -100)', 100.00999950004999, 100.00999950005, NaN, NaN],
            ['hypot', [Math.SQRT1_2, -100], 'hypot(Math.SQRT1_2, -100)', 100.0024999687508, 100.00249996875078, NaN, NaN],
            ['hypot', [2 * Math.LOG10E, -100], 'hypot(2*Math.LOG10E, -100)', 100.00377216279416, 100.00377216279418, NaN, NaN],
            ['log', [n], `log(${n})`, -2.0955709236097197, NaN, NaN, NaN],
            ['log', [Math.PI], 'log(Math.PI)', 1.1447298858494002, NaN, NaN, NaN],
            ['log1p', [n], `log1p(${n})`, 0.11600367575630613, NaN, NaN, NaN],
            ['log1p', [Math.PI], 'log1p(Math.PI)', 1.4210804127942926, NaN, NaN, NaN],
            ['log10', [n], `log10(${n})`, -0.9100948885606021, NaN, NaN, NaN],
            ['log10', [Math.PI], 'log10(Math.PI)', 0.4971498726941338, 0.49714987269413385, NaN, NaN],
            ['log10', [Math.E], 'log10(Math.E)', 0.4342944819032518, NaN, NaN, NaN],
            ['log10', [34 * Math.E], 'log10(34*Math.E)', 1.9657733989455068, 1.965773398945507, NaN, NaN],
            ['log10', [Math.LN2], 'log10(Math.LN2)', -0.1591745389548616, NaN, NaN, NaN],
            ['log10', [11 * Math.LN2], 'log10(11*Math.LN2)', 0.8822181462033634, 0.8822181462033635, NaN, NaN],
            ['log10', [Math.LOG2E], 'log10(Math.LOG2E)', 0.15917453895486158, NaN, NaN, NaN],
            ['log10', [43 * Math.LOG2E], 'log10(43*Math.LOG2E)', 1.792642994534448, 1.7926429945344482, NaN, NaN],
            ['log10', [Math.LOG10E], 'log10(Math.LOG10E)', -0.36221568869946325, NaN, NaN, NaN],
            ['log10', [7 * Math.LOG10E], 'log10(7*Math.LOG10E)', 0.4828823513147936, 0.48288235131479357, NaN, NaN],
            ['log10', [Math.SQRT1_2], 'log10(Math.SQRT1_2)', -0.15051499783199057, NaN, NaN, NaN],
            ['log10', [2 * Math.SQRT1_2], 'log10(2*Math.SQRT1_2)', 0.1505149978319906, 0.15051499783199063, NaN, NaN],
            ['log10', [Math.SQRT2], 'log10(Math.SQRT2)', 0.1505149978319906, 0.15051499783199063, NaN, NaN],
            ['sin', [bigN], `sin(${bigN})`, 0.994076732536068, NaN, -0.20876350121720488, NaN],
            ['sin', [Math.PI], 'sin(Math.PI)', 1.2246467991473532e-16, NaN, 1.2246063538223773e-16, NaN],
            ['sin', [39 * Math.E], 'sin(39*Math.E)', -0.7181630308570677, -0.7181630308570678, NaN, NaN],
            ['sin', [35 * Math.LN2], 'sin(35*Math.LN2)', -0.7659964138980511, -0.765996413898051, NaN, NaN],
            ['sin', [110 * Math.LOG2E], 'sin(110*Math.LOG2E)', 0.9989410140273756, 0.9989410140273757, NaN, NaN],
            ['sin', [7 * Math.LOG10E], 'sin(7*Math.LOG10E)', 0.10135692924965616, 0.10135692924965614, NaN, NaN],
            ['sin', [35 * Math.SQRT1_2], 'sin(35*Math.SQRT1_2)', -0.3746357547858202, -0.37463575478582023, NaN, NaN],
            ['sin', [21 * Math.SQRT2], 'sin(21*Math.SQRT2)', -0.9892668187780498, -0.9892668187780497, NaN, NaN],
            ['sinh', [1], 'sinh(1)', 1.1752011936438014, NaN, NaN, NaN],
            ['sinh', [Math.PI], 'sinh(Math.PI)', 11.548739357257748, NaN, NaN, 11.548739357257746],
            ['sinh', [Math.E], 'sinh(Math.E)', 7.544137102816975, NaN, NaN, NaN],
            ['sinh', [Math.LN2], 'sinh(Math.LN2)', 0.75, NaN, NaN, NaN],
            ['sinh', [Math.LOG2E], 'sinh(Math.LOG2E)', 1.9978980091062795, NaN, NaN, NaN],
            ['sinh', [492 * Math.LOG2E], 'sinh(492*Math.LOG2E)', 9.199870313877772e+307, 9.199870313877774e+307, NaN, NaN],
            ['sinh', [Math.LOG10E], 'sinh(Math.LOG10E)', 0.44807597941469024, NaN, NaN, NaN],
            ['sinh', [Math.SQRT1_2], 'sinh(Math.SQRT1_2)', 0.7675231451261164, NaN, NaN, NaN],
            ['sinh', [Math.SQRT2], 'sinh(Math.SQRT2)', 1.935066822174357, NaN, NaN, 1.9350668221743568],
            ['sinh', [502 * Math.SQRT2], 'sinh(502*Math.SQRT2)', 1.0469199669023138e+308, 1.046919966902314e+308, NaN, NaN],
            ['sqrt', [n], `sqrt(${n})`, 0.3507135583350036, NaN, NaN, NaN],
            ['sqrt', [Math.PI], 'sqrt(Math.PI)', 1.7724538509055159, NaN, NaN, NaN],
            ['tan', [-1e308], 'tan(-1e308)', 0.5086861259107568, NaN, NaN, 0.5086861259107567],
            ['tan', [Math.PI], 'tan(Math.PI)', -1.2246467991473532e-16, NaN, NaN, NaN],
            ['tan', [6 * Math.E], 'tan(6*Math.E)', 0.6866761546452431, 0.686676154645243, NaN, NaN],
            ['tan', [6 * Math.LN2], 'tan(6*Math.LN2)', 1.6182817135715877, 1.618281713571588, NaN, 1.6182817135715875],
            ['tan', [10 * Math.LOG2E], 'tan(10*Math.LOG2E)', -3.3537128705376014, -3.353712870537601, NaN, -3.353712870537602],
            ['tan', [17 * Math.SQRT2], 'tan(17*Math.SQRT2)', -1.9222955461799982, -1.922295546179998, NaN, NaN],
            ['tan', [34 * Math.SQRT1_2], 'tan(34*Math.SQRT1_2)', -1.9222955461799982, -1.922295546179998, NaN, NaN],
            ['tan', [10 * Math.LOG10E], 'tan(10*Math.LOG10E)', 2.5824856130712432, 2.5824856130712437, NaN, NaN],
            ['tanh', [n], `tanh(${n})`, 0.12238344189440875, NaN, NaN, 0.12238344189440876],
            ['tanh', [Math.PI], 'tanh(Math.PI)', 0.99627207622075, NaN, NaN, NaN],
            ['pow', [n, -100], `pow(${n}, -100)`, 1.022089333584519e+91, 1.0220893335845176e+91, NaN, NaN],
            ['pow', [Math.PI, -100], 'pow(Math.PI, -100)', 1.9275814160560204e-50, 1.9275814160560185e-50, NaN, 1.9275814160560206e-50],
            ['pow', [Math.E, -100], 'pow(Math.E, -100)', 3.7200759760208555e-44, 3.720075976020851e-44, NaN, NaN],
            ['pow', [Math.LN2, -100], 'pow(Math.LN2, -100)', 8269017203802394, 8269017203802410, NaN, NaN],
            ['pow', [Math.LN10, -100], 'pow(Math.LN10, -100)', 6.003867926738829e-37, 6.003867926738811e-37, NaN, NaN],
            ['pow', [Math.LOG2E, -100], 'pow(Math.LOG2E, -100)', 1.20933355845501e-16, 1.2093335584550061e-16, NaN, NaN],
            ['pow', [Math.LOG10E, -100], 'pow(Math.LOG10E, -100)', 1.6655929347585958e+36, 1.665592934758592e+36, NaN, 1.6655929347585955e+36],
            ['pow', [Math.SQRT1_2, -100], 'pow(Math.SQRT1_2, -100)', 1125899906842616.2, 1125899906842611.5, NaN, NaN],
            ['pow', [Math.SQRT2, -100], 'pow(Math.SQRT2, -100)', 8.881784197001191e-16, 8.881784197001154e-16, NaN, NaN],
            ['polyfill', [2e-3 ** -100], 'polyfill pow(2e-3, -100)', 7.888609052210102e+269, 7.888609052210126e+269, NaN, NaN],
        ];
        const data = {};
        fns.forEach((fn) => {
            data[fn[2]] = attempt(() => {
                // @ts-ignore
                const result = fn[0] != 'polyfill' ? Math[fn[0]](...fn[1]) : fn[1];
                const chrome = result == fn[3];
                const firefox = fn[4] ? result == fn[4] : false;
                const torBrowser = fn[5] ? result == fn[5] : false;
                const safari = fn[6] ? result == fn[6] : false;
                return { result, chrome, firefox, torBrowser, safari };
            });
        });
        logTestResult({ time: timer.stop(), test: 'math', passed: true });
        return { data, lied };
    }
    catch (error) {
        logTestResult({ test: 'math', passed: false });
        captureError(error);
        return;
    }
}
function mathsHTML(fp) {
    if (!fp.maths) {
        return `
		<div class="col-six undefined">
			<strong>Math</strong>
			<div>results: ${HTMLNote.Blocked}</div>
			<div>
				<div>${HTMLNote.Blocked}</div>
			</div>

		</div>`;
    }
    const { maths: { data, $hash, lied, }, } = fp;
    const header = `
	<style>
		.math-chromium,
		.math-firefox,
		.math-tor-browser,
		.math-safari,
		.math-blank-false {
			padding: 2px 8px;
		}
		.math-chromium {
			background: #657fca26;
		}
		.math-firefox {
			background: #657fca54;
		}
		.math-tor-browser {
			background: #ca65b424;
		}
		.math-safari {
			background: #ca65b459;
		}
	</style>
	<div>
	<br><span class="math-chromium">C - Chromium</span>
	<br><span class="math-firefox">F - Firefox</span>
	<br><span class="math-tor-browser">T - Tor Browser</span>
	<br><span class="math-safari">S - Safari</span>
	</div>`;
    const results = Object.keys(data).map((key) => {
        const value = data[key];
        const { chrome, firefox, torBrowser, safari } = value;
        return `
		${chrome ? '<span class="math-chromium">C</span>' : '<span class="math-blank-false">-</span>'}${firefox ? '<span class="math-firefox">F</span>' : '<span class="math-blank-false">-</span>'}${torBrowser ? '<span class="math-tor-browser">T</span>' : '<span class="math-blank-false">-</span>'}${safari ? '<span class="math-safari">S</span>' : '<span class="math-blank-false">-</span>'} ${key}`;
    });
    return `
	<div class="relative col-six${lied ? ' rejected' : ''}">
		<span class="aside-note">${performanceLogger.getLog().math}</span>
		<strong>Math</strong><span class="${lied ? 'lies ' : ''}hash">${hashSlice($hash)}</span>
		<div>results: ${!data ? HTMLNote.Blocked :
        modal('creep-maths', header + results.join('<br>'))}</div>
		<div class="blurred" id="math-samples">
			<div>0% of engine</div>
		</div>
	</div>
	`;
}

// inspired by
// - https://privacycheck.sec.lrz.de/active/fp_cpt/fp_can_play_type.html
// - https://arkenfox.github.io/TZP
const getMimeTypeShortList = () => [
    'audio/ogg; codecs="vorbis"',
    'audio/mpeg',
    'audio/mpegurl',
    'audio/wav; codecs="1"',
    'audio/x-m4a',
    'audio/aac',
    'video/ogg; codecs="theora"',
    'video/quicktime',
    'video/mp4; codecs="avc1.42E01E"',
    'video/webm; codecs="vp8"',
    'video/webm; codecs="vp9"',
    'video/x-matroska',
].sort();
async function getMedia() {
    const getMimeTypes = () => {
        try {
            const mimeTypes = getMimeTypeShortList();
            const videoEl = document.createElement('video');
            const audioEl = new Audio();
            const isMediaRecorderSupported = 'MediaRecorder' in window;
            const types = mimeTypes.reduce((acc, type) => {
                const data = {
                    mimeType: type,
                    audioPlayType: audioEl.canPlayType(type),
                    videoPlayType: videoEl.canPlayType(type),
                    mediaSource: MediaSource.isTypeSupported(type),
                    mediaRecorder: isMediaRecorderSupported ? MediaRecorder.isTypeSupported(type) : false,
                };
                if (!data.audioPlayType && !data.videoPlayType && !data.mediaSource && !data.mediaRecorder) {
                    return acc;
                }
                // @ts-ignore
                acc.push(data);
                return acc;
            }, []);
            return types;
        }
        catch (error) {
            return;
        }
    };
    try {
        const timer = createTimer();
        timer.start();
        const mimeTypes = getMimeTypes();
        if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
            logTestResult({ time: timer.stop(), test: 'media', passed: true });
            return { mediaDevices: null, mimeTypes };
        }
        return navigator.mediaDevices.enumerateDevices().then((devices) => {
            logTestResult({ time: timer.stop(), test: 'media', passed: true });
            return {
                mediaDevices: devices.map((device) => device.kind).sort(),
                mimeTypes,
            };
        }).catch((error) => {
            console.error(error);
            logTestResult({ time: timer.stop(), test: 'media', passed: true });
            return { mediaDevices: null, mimeTypes };
        });
    }
    catch (error) {
        logTestResult({ test: 'media', passed: false });
        captureError(error);
        return;
    }
}
function mediaHTML(fp) {
    if (!fp.media) {
        return `
		<div class="col-four undefined">
			<strong>Media</strong>
			<div>mimes (0): ${HTMLNote.BLOCKED}</div>
			<div>devices (0): ${HTMLNote.BLOCKED}</div>
			<div class="block-text">${HTMLNote.BLOCKED}</div>
		</div>`;
    }
    const { media: { mediaDevices, mimeTypes, $hash, }, } = fp;
    const deviceMap = {
        'audioinput': 'mic',
        'audiooutput': 'audio',
        'videoinput': 'webcam',
    };
    const header = `
	<style>
		.audiop, .videop, .medias, .mediar, .blank-false {
			padding: 2px 8px;
		}
		.audiop {
			background: #657fca26;
		}
		.medias {
			background: #657fca54;
		}
		.videop {
			background: #ca65b424;
		}
		.mediar {
			background: #ca65b459;
		}
		.audiop.pb, .videop.pb, .guide.pr {
			color: #8f8ff1 !important;
		}
		.audiop.mb, .videop.mb, .guide.mb {
			color: #98cee4 !important;
		}
		.medias.tr, .mediar.tr, .guide.tr {
			color: #c778ba !important;
		}
	</style>
	<div>
	<br><span class="audiop">audioPlayType</span>
	<br><span class="videop">videoPlayType</span>
	<br><span class="medias">mediaSource</span>
	<br><span class="mediar">mediaRecorder</span>
	<br><span class="guide pr">P (Probably)</span>
	<br><span class="guide mb">M (Maybe)</span>
	<br><span class="guide tr">T (True)</span>
	</div>`;
    const invalidMimeTypes = !mimeTypes || !mimeTypes.length;
    const mimes = invalidMimeTypes ? undefined : mimeTypes.map((type) => {
        const { mimeType, audioPlayType, videoPlayType, mediaSource, mediaRecorder } = type;
        return `
			${audioPlayType == 'probably' ? '<span class="audiop pb">P</span>' : audioPlayType == 'maybe' ? '<span class="audiop mb">M</span>' : '<span class="blank-false">-</span>'}${videoPlayType == 'probably' ? '<span class="videop pb">P</span>' : videoPlayType == 'maybe' ? '<span class="videop mb">M</span>' : '<span class="blank-false">-</span>'}${mediaSource ? '<span class="medias tr">T</span>' : '<span class="blank-false">-</span>'}${mediaRecorder ? '<span class="mediar tr">T</span>' : '<span class="blank-false">-</span>'}: ${mimeType}
		`;
    });
    const mimesListLen = getMimeTypeShortList().length;
    const replaceIndex = ({ list, index, replacement }) => [
        ...list.slice(0, index),
        replacement,
        ...list.slice(index + 1),
    ];
    const mediaDevicesByType = (mediaDevices || []).reduce((acc, x) => {
        const deviceType = deviceMap[x] || x;
        if (!acc.includes(deviceType)) {
            return (acc = [...acc, deviceType]);
        }
        else if (!deviceType.includes('dual') && (acc.filter((x) => x == deviceType) || []).length == 1) {
            return (acc = replaceIndex({
                list: acc,
                index: acc.indexOf(deviceType),
                replacement: `dual ${deviceType}`,
            }));
        }
        return (acc = [...acc, deviceType]);
    }, []);
    return `
	<div class="relative col-four">
		<span class="aside-note">${performanceLogger.getLog().media}</span>
		<strong>Media</strong><span class="hash">${hashSlice($hash)}</span>
		<div class="help" title="HTMLMediaElement.canPlayType()\nMediaRecorder.isTypeSupported()\nMediaSource.isTypeSupported()">mimes (${count(mimeTypes)}/${mimesListLen}): ${invalidMimeTypes ? HTMLNote.BLOCKED :
        modal('creep-media-mimeTypes', header + mimes.join('<br>'), hashMini(mimeTypes))}</div>
		<div class="help" title="MediaDevices.enumerateDevices()\nMediaDeviceInfo.kind">devices (${count(mediaDevices)}):</div>
		<div class="block-text">
			${!mediaDevices || !mediaDevices.length ? HTMLNote.BLOCKED :
        mediaDevicesByType.join(', ')}
		</div>
	</div>
	`;
}

// special thanks to https://arh.antoinevastel.com for inspiration
async function getNavigator() {
    try {
        const timer = createTimer();
        await queueEvent(timer);
        let lied = (lieProps['Navigator.appVersion'] ||
            lieProps['Navigator.deviceMemory'] ||
            lieProps['Navigator.doNotTrack'] ||
            lieProps['Navigator.hardwareConcurrency'] ||
            lieProps['Navigator.language'] ||
            lieProps['Navigator.languages'] ||
            lieProps['Navigator.maxTouchPoints'] ||
            lieProps['Navigator.oscpu'] ||
            lieProps['Navigator.platform'] ||
            lieProps['Navigator.userAgent'] ||
            lieProps['Navigator.vendor'] ||
            lieProps['Navigator.plugins'] ||
            lieProps['Navigator.mimeTypes']) || false;
        const credibleUserAgent = ('chrome' in window ? navigator.userAgent.includes(navigator.appVersion) : true);
        const data = {
            platform: attempt(() => {
                const { platform } = navigator;
                const systems = ['win', 'linux', 'mac', 'arm', 'pike', 'linux', 'iphone', 'ipad', 'ipod', 'android', 'x11'];
                const trusted = typeof platform == 'string' && systems.filter((val) => platform.toLowerCase().includes(val))[0];
                if (!trusted) {
                    sendToTrash(`platform`, `${platform} is unusual`);
                }
                // user agent os lie
                const { userAgent } = navigator;
                const userAgentOS = (
                // order is important
                /win(dows|16|32|64|95|98|nt)|wow64/ig.test(userAgent) ? 'Windows' :
                    /android|linux|cros/ig.test(userAgent) ? 'Linux' :
                        /(i(os|p(ad|hone|od)))|mac/ig.test(userAgent) ? 'Apple' :
                            'Other');
                const platformOS = (
                // order is important
                /win/ig.test(platform) ? 'Windows' :
                    /android|arm|linux/ig.test(platform) ? 'Linux' :
                        /(i(os|p(ad|hone|od)))|mac/ig.test(platform) ? 'Apple' :
                            'Other');
                const osLie = userAgentOS != platformOS;
                if (osLie) {
                    lied = true;
                    documentLie(`Navigator.platform`, `${platformOS} platform and ${userAgentOS} user agent do not match`);
                }
                return platform;
            }),
            system: attempt(() => getOS(navigator.userAgent), 'userAgent system failed'),
            userAgentParsed: await attempt(async () => {
                const reportedUserAgent = caniuse(() => navigator.userAgent);
                const reportedSystem = getOS(reportedUserAgent);
                const isBrave = await braveBrowser();
                const report = decryptUserAgent({
                    ua: reportedUserAgent,
                    os: reportedSystem,
                    isBrave,
                });
                return report;
            }),
            device: attempt(() => getUserAgentPlatform({ userAgent: navigator.userAgent }), 'userAgent device failed'),
            userAgent: attempt(() => {
                const { userAgent } = navigator;
                if (!credibleUserAgent) {
                    sendToTrash('userAgent', `${userAgent} does not match appVersion`);
                }
                if (/\s{2,}|^\s|\s$/g.test(userAgent)) {
                    sendToTrash('userAgent', `extra spaces detected`);
                }
                const gibbers = gibberish(userAgent);
                if (!!gibbers.length) {
                    sendToTrash(`userAgent is gibberish`, userAgent);
                }
                return userAgent.trim().replace(/\s{2,}/, ' ');
            }, 'userAgent failed'),
            uaPostReduction: isUAPostReduction((navigator || {}).userAgent),
            appVersion: attempt(() => {
                const { appVersion } = navigator;
                if (!credibleUserAgent) {
                    sendToTrash('appVersion', `${appVersion} does not match userAgent`);
                }
                if ('appVersion' in navigator && !appVersion) {
                    sendToTrash('appVersion', 'Living Standard property returned falsy value');
                }
                if (/\s{2,}|^\s|\s$/g.test(appVersion)) {
                    sendToTrash('appVersion', `extra spaces detected`);
                }
                return appVersion.trim().replace(/\s{2,}/, ' ');
            }, 'appVersion failed'),
            deviceMemory: attempt(() => {
                if (!('deviceMemory' in navigator)) {
                    return undefined;
                }
                // @ts-ignore
                const { deviceMemory } = navigator;
                const trusted = {
                    '0.25': true,
                    '0.5': true,
                    '1': true,
                    '2': true,
                    '4': true,
                    '8': true,
                };
                if (!trusted[deviceMemory]) {
                    sendToTrash('deviceMemory', `${deviceMemory} is not a valid value [0.25, 0.5, 1, 2, 4, 8]`);
                }
                return deviceMemory;
            }, 'deviceMemory failed'),
            doNotTrack: attempt(() => {
                const { doNotTrack } = navigator;
                const trusted = {
                    '1': !0,
                    'true': !0,
                    'yes': !0,
                    '0': !0,
                    'false': !0,
                    'no': !0,
                    'unspecified': !0,
                    'null': !0,
                    'undefined': !0,
                };
                if (!trusted[doNotTrack]) {
                    sendToTrash('doNotTrack - unusual result', doNotTrack);
                }
                return doNotTrack;
            }, 'doNotTrack failed'),
            globalPrivacyControl: attempt(() => {
                if (!('globalPrivacyControl' in navigator)) {
                    return undefined;
                }
                // @ts-ignore
                const { globalPrivacyControl } = navigator;
                const trusted = {
                    '1': !0,
                    'true': !0,
                    'yes': !0,
                    '0': !0,
                    'false': !0,
                    'no': !0,
                    'unspecified': !0,
                    'null': !0,
                    'undefined': !0,
                };
                if (!trusted[globalPrivacyControl]) {
                    sendToTrash('globalPrivacyControl - unusual result', globalPrivacyControl);
                }
                return globalPrivacyControl;
            }, 'globalPrivacyControl failed'),
            hardwareConcurrency: attempt(() => {
                if (!('hardwareConcurrency' in navigator)) {
                    return undefined;
                }
                return navigator.hardwareConcurrency;
            }, 'hardwareConcurrency failed'),
            language: attempt(() => {
                const { language, languages } = navigator;
                const lang = ('' + language).split(',')[0];
                let currencyLanguage;
                try {
                    currencyLanguage = (1).toLocaleString((lang || undefined), {
                        style: 'currency',
                        currency: 'USD',
                        currencyDisplay: 'name',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                    });
                }
                catch (e) { }
                const currencyLocale = (1).toLocaleString(undefined, {
                    style: 'currency',
                    currency: 'USD',
                    currencyDisplay: 'name',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                });
                const languageLie = currencyLocale != currencyLanguage;
                if (languageLie) {
                    lied = true;
                    documentLie(`Navigator.language`, `${currencyLocale} locale and ${currencyLanguage} language do not match`);
                }
                if (language && languages) {
                    // @ts-ignore
                    const lang = /^.{0,2}/g.exec(language)[0];
                    // @ts-ignore
                    const langs = /^.{0,2}/g.exec(languages[0])[0];
                    if (langs != lang) {
                        sendToTrash('language/languages', `${[language, languages].join(' ')} mismatch`);
                    }
                    return `${languages.join(', ')} (${language})`;
                }
                return `${language} ${languages}`;
            }, 'language(s) failed'),
            maxTouchPoints: attempt(() => {
                if (!('maxTouchPoints' in navigator)) {
                    return null;
                }
                return navigator.maxTouchPoints;
            }, 'maxTouchPoints failed'),
            vendor: attempt(() => navigator.vendor, 'vendor failed'),
            mimeTypes: attempt(() => {
                const { mimeTypes } = navigator;
                return mimeTypes ? [...mimeTypes].map((m) => m.type) : [];
            }, 'mimeTypes failed'),
            // @ts-ignore
            oscpu: attempt(() => navigator.oscpu, 'oscpu failed'),
            plugins: attempt(() => {
                // https://html.spec.whatwg.org/multipage/system-state.html#pdf-viewing-support
                const { plugins } = navigator;
                if (!(plugins instanceof PluginArray)) {
                    return;
                }
                const response = plugins ? [...plugins]
                    .map((p) => ({
                    name: p.name,
                    description: p.description,
                    filename: p.filename,
                    // @ts-ignore
                    version: p.version,
                })) : [];
                const { lies } = getPluginLies(plugins, navigator.mimeTypes);
                if (lies.length) {
                    lied = true;
                    lies.forEach((lie) => {
                        return documentLie(`Navigator.plugins`, lie);
                    });
                }
                if (response.length) {
                    response.forEach((plugin) => {
                        const { name, description } = plugin;
                        const nameGibbers = gibberish(name);
                        const descriptionGibbers = gibberish(description);
                        if (nameGibbers.length) {
                            sendToTrash(`plugin name is gibberish`, name);
                        }
                        if (descriptionGibbers.length) {
                            sendToTrash(`plugin description is gibberish`, description);
                        }
                        return;
                    });
                }
                return response;
            }, 'plugins failed'),
            properties: attempt(() => {
                const keys = Object.keys(Object.getPrototypeOf(navigator));
                return keys;
            }, 'navigator keys failed'),
        };
        const getUserAgentData = () => attempt(() => {
            // @ts-ignore
            if (!navigator.userAgentData ||
                // @ts-ignore
                !navigator.userAgentData.getHighEntropyValues) {
                return;
            }
            // @ts-ignore
            return navigator.userAgentData.getHighEntropyValues(['platform', 'platformVersion', 'architecture', 'bitness', 'model', 'uaFullVersion']).then((data) => {
                // @ts-ignore
                const { brands, mobile } = navigator.userAgentData || {};
                const compressedBrands = (brands, captureVersion = false) => brands
                    .filter((obj) => !/Not/.test(obj.brand)).map((obj) => `${obj.brand}${captureVersion ? ` ${obj.version}` : ''}`);
                const removeChromium = (brands) => (brands.length > 1 ? brands.filter((brand) => !/Chromium/.test(brand)) : brands);
                // compress brands
                if (!data.brands) {
                    data.brands = brands;
                }
                data.brandsVersion = compressedBrands(data.brands, true);
                data.brands = compressedBrands(data.brands);
                data.brandsVersion = removeChromium(data.brandsVersion);
                data.brands = removeChromium(data.brands);
                if (!data.mobile) {
                    data.mobile = mobile;
                }
                const dataSorted = Object.keys(data).sort().reduce((acc, key) => {
                    acc[key] = data[key];
                    return acc;
                }, {});
                return dataSorted;
            });
        }, 'userAgentData failed');
        const getBluetoothAvailability = () => attempt(() => {
            if (!('bluetooth' in navigator) ||
                // @ts-ignore
                !navigator.bluetooth ||
                // @ts-ignore
                !navigator.bluetooth.getAvailability) {
                return undefined;
            }
            // @ts-ignore
            return navigator.bluetooth.getAvailability();
        }, 'bluetoothAvailability failed');
        const getPermissions = () => attempt(() => {
            const getPermissionState = (name) => navigator.permissions.query({ name })
                .then((res) => ({ name, state: res.state }))
                .catch((error) => ({ name, state: 'unknown' }));
            // https://w3c.github.io/permissions/#permission-registry
            const permissions = !('permissions' in navigator) ? undefined : Promise.all([
                getPermissionState('accelerometer'),
                getPermissionState('ambient-light-sensor'),
                getPermissionState('background-fetch'),
                getPermissionState('background-sync'),
                getPermissionState('bluetooth'),
                getPermissionState('camera'),
                getPermissionState('clipboard'),
                getPermissionState('device-info'),
                getPermissionState('display-capture'),
                getPermissionState('gamepad'),
                getPermissionState('geolocation'),
                getPermissionState('gyroscope'),
                getPermissionState('magnetometer'),
                getPermissionState('microphone'),
                getPermissionState('midi'),
                getPermissionState('nfc'),
                getPermissionState('notifications'),
                getPermissionState('persistent-storage'),
                getPermissionState('push'),
                getPermissionState('screen-wake-lock'),
                getPermissionState('speaker'),
                getPermissionState('speaker-selection'),
            ]).then((permissions) => permissions.reduce((acc, perm) => {
                const { state, name } = perm || {};
                if (acc[state]) {
                    acc[state].push(name);
                    return acc;
                }
                acc[state] = [name];
                return acc;
            }, {})).catch((error) => console.error(error));
            return permissions;
        }, 'permissions failed');
        const getWebgpu = () => attempt(() => {
            if (!('gpu' in navigator)) {
                return;
            }
            // @ts-ignore
            return navigator.gpu.requestAdapter().then(({ limits, features }) => {
                return {
                    features: [...features.values()],
                    limits: ((limits) => {
                        const data = {};
                        // eslint-disable-next-line guard-for-in
                        for (const prop in limits) {
                            data[prop] = limits[prop];
                        }
                        return data;
                    })(limits),
                };
            });
        }, 'webgpu failed');
        await queueEvent(timer);
        return Promise.all([
            getUserAgentData(),
            getBluetoothAvailability(),
            getPermissions(),
            getWebgpu(),
        ]).then(([userAgentData, bluetoothAvailability, permissions, webgpu,]) => {
            logTestResult({ time: timer.stop(), test: 'navigator', passed: true });
            return Object.assign(Object.assign({}, data), { userAgentData,
                bluetoothAvailability,
                permissions,
                webgpu,
                lied });
        }).catch((error) => {
            console.error(error);
            logTestResult({ time: timer.stop(), test: 'navigator', passed: true });
            return Object.assign(Object.assign({}, data), { lied });
        });
    }
    catch (error) {
        logTestResult({ test: 'navigator', passed: false });
        captureError(error, 'Navigator failed or blocked by client');
        return;
    }
}
function navigatorHTML(fp) {
    if (!fp.navigator) {
        return `
		<div class="col-six undefined">
			<strong>Navigator</strong>
			<div>properties (0): ${HTMLNote.BLOCKED}</div>
			<div>dnt: ${HTMLNote.BLOCKED}</div>
			<div>gpc:${HTMLNote.BLOCKED}</div>
			<div>lang: ${HTMLNote.BLOCKED}</div>
			<div>mimeTypes (0): ${HTMLNote.BLOCKED}</div>
			<div>permissions (0): ${HTMLNote.BLOCKED}</div>
			<div>plugins (0): ${HTMLNote.BLOCKED}</div>
			<div>vendor: ${HTMLNote.BLOCKED}</div>
			<div>webgpu: ${HTMLNote.BLOCKED}</div>
			<div>userAgentData:</div>
			<div class="block-text">${HTMLNote.BLOCKED}</div>
		</div>
		<div class="col-six">
			<div>device:</div>
			<div class="block-text">${HTMLNote.BLOCKED}</div>
			<div>ua parsed: ${HTMLNote.BLOCKED}</div>
			<div>userAgent:</div>
			<div class="block-text">${HTMLNote.BLOCKED}</div>
			<div>appVersion:</div>
			<div class="block-text">${HTMLNote.BLOCKED}</div>
		</div>`;
    }
    const { navigator: { $hash, appVersion, deviceMemory, doNotTrack, globalPrivacyControl, hardwareConcurrency, language, maxTouchPoints, mimeTypes, oscpu, permissions, platform, plugins, properties, system, device, userAgent, uaPostReduction, userAgentData, userAgentParsed, vendor, bluetoothAvailability, webgpu, lied, }, } = fp;
    const id = 'creep-navigator';
    const blocked = {
        ['null']: !0,
        ['undefined']: !0,
        ['']: !0,
    };
    const permissionsKeys = Object.keys(permissions || {});
    const permissionsGranted = (permissions && permissions.granted ? permissions.granted.length : 0);
    return `
	<span class="time">${performanceLogger.getLog().navigator}</span>
	<div class="col-six${lied ? ' rejected' : ''}">
		<strong>Navigator</strong><span class="${lied ? 'lies ' : ''}hash">${hashSlice($hash)}</span>
		<div>properties (${count(properties)}): ${modal(`${id}-properties`, properties.join(', '), hashMini(properties))}</div>
		<div class="help" title="Navigator.doNotTrack">dnt: ${'' + doNotTrack}</div>
		<div class="help" title="Navigator.globalPrivacyControl">gpc: ${'' + globalPrivacyControl == 'undefined' ? HTMLNote.UNSUPPORTED : '' + globalPrivacyControl}</div>
		<div class="help" title="Navigator.language\nNavigator.languages">lang: ${!blocked[language] ? language : HTMLNote.BLOCKED}</div>
		<div>mimeTypes (${count(mimeTypes)}): ${!blocked['' + mimeTypes] ?
        modal(`${id}-mimeTypes`, mimeTypes.join('<br>'), hashMini(mimeTypes)) :
        HTMLNote.BLOCKED}</div>
		<div class="help" title="Permissions.query()">permissions (${'' + permissionsGranted}): ${!permissions || !permissionsKeys ? HTMLNote.UNSUPPORTED : modal('creep-permissions', permissionsKeys.map((key) => `<div class="perm perm-${key}"><strong>${key}</strong>:<br>${permissions[key].join('<br>')}</div>`).join(''), hashMini(permissions))}</div>
		<div>plugins (${count(plugins)}): ${!blocked['' + plugins] ?
        modal(`${id}-plugins`, plugins.map((plugin) => plugin.name).join('<br>'), hashMini(plugins)) :
        HTMLNote.BLOCKED}</div>
		<div>vendor: ${!blocked[vendor] ? vendor : HTMLNote.BLOCKED}</div>
		<div>webgpu: ${!webgpu ? HTMLNote.UNSUPPORTED :
        modal(`${id}-webgpu`, ((webgpu) => {
            const { limits, features } = webgpu;
            return `
					<div>
						<strong>Features</strong><br>${features.join('<br>')}
					</div>
					<div>
						<br><strong>Limits</strong><br>${Object.keys(limits).map((x) => `${x}: ${limits[x]}`).join('<br>')}
					</div>
					`;
        })(webgpu), hashMini(webgpu))}</div>
		<div>userAgentData:</div>
		<div class="block-text help" title="Navigator.userAgentData\nNavigatorUAData.getHighEntropyValues()">
			<div>
			${((userAgentData) => {
        const { architecture, bitness, brandsVersion, uaFullVersion, mobile, model, platformVersion, platform, } = userAgentData || {};
        // @ts-ignore
        const windowsRelease = computeWindowsRelease({ platform, platformVersion });
        return !userAgentData ? HTMLNote.UNSUPPORTED : `
					${(brandsVersion || []).join(',')}${uaFullVersion ? ` (${uaFullVersion})` : ''}
					<br>${windowsRelease || `${platform} ${platformVersion}`} ${architecture ? `${architecture}${bitness ? `_${bitness}` : ''}` : ''}
					${model ? `<br>${model}` : ''}
					${mobile ? '<br>mobile' : ''}
				`;
    })(userAgentData)}
			</div>
		</div>
	</div>
	<div class="col-six${lied ? ' rejected' : ''}">
		<div>device:</div>
		<div class="block-text help" title="Navigator.deviceMemory\nNavigator.hardwareConcurrency\nNavigator.maxTouchPoints\nNavigator.oscpu\nNavigator.platform\nNavigator.userAgent\nBluetooth.getAvailability()">
			${oscpu ? oscpu : ''}
			${`${oscpu ? '<br>' : ''}${system}${platform ? ` (${platform})` : ''}`}
			${device ? `<br>${device}` : HTMLNote.BLOCKED}${hardwareConcurrency && deviceMemory ? `<br>cores: ${hardwareConcurrency}, ram: ${deviceMemory}` :
        hardwareConcurrency && !deviceMemory ? `<br>cores: ${hardwareConcurrency}` :
            !hardwareConcurrency && deviceMemory ? `<br>ram: ${deviceMemory}` : ''}${typeof maxTouchPoints != 'undefined' ? `, touch: ${'' + maxTouchPoints}` : ''}${bluetoothAvailability ? `, bluetooth` : ''}
		</div>
		<div>ua parsed: ${userAgentParsed || HTMLNote.BLOCKED}</div>
		<div class="relative">userAgent:${!uaPostReduction ? '' : `<span class="confidence-note">ua reduction</span>`}</div>
		<div class="block-text">
			<div>${userAgent || HTMLNote.BLOCKED}</div>
		</div>
		<div>appVersion:</div>
		<div class="block-text">
			<div>${appVersion || HTMLNote.BLOCKED}</div>
		</div>
	</div>
	`;
}

function getPrediction({ hash, data }) {
    const getBaseDeviceName = (devices) => {
        // ex: find Android 10 in [Android 10, Android 10 Blah Blah]
        return devices.find((a) => devices.filter((b) => b.includes(a)).length == devices.length);
    };
    let systems = [];
    let devices = [];
    let gpus = [];
    const decrypted = Object.keys(data).find((key) => data[key].find((item) => {
        if (!(item.id == hash)) {
            return false;
        }
        devices = item.devices || [];
        systems = item.systems || [];
        gpus = item.gpus || [];
        return true;
    }));
    const prediction = {
        decrypted,
        system: systems.length == 1 ? systems[0] : undefined,
        device: (devices.length == 1 ? devices[0] : getBaseDeviceName(devices)),
        gpu: gpus.length == 1 ? gpus[0] : undefined,
    };
    return prediction;
}
function renderPrediction({ decryptionData, crowdBlendingScore, bot = false, }) {
    const { jsRuntime, jsEngine, htmlVersion, windowVersion, styleVersion, resistance, styleSystem, emojiSystem, domRectSystem, svgSystem, mimeTypesSystem, audioSystem, canvasSystem, canvasBlobSystem, canvasPaintSystem, canvasTextSystem, canvasEmojiSystem, textMetricsSystem, webglSystem, gpuSystem, gpuModelSystem, fontsSystem, voicesSystem, screenSystem, deviceOfTimezone, pendingReview, } = decryptionData;
    const iconSet = new Set();
    const getBlankIcons = () => `<span class="icon"></span><span class="icon"></span>`;
    const htmlIcon = (cssClass) => `<span class="icon ${cssClass}"></span>`;
    const getTemplate = ({ title, agent, showVersion = false }) => {
        const { decrypted, system, device, score } = agent || {};
        const browserIcon = (/edgios|edge/i.test(decrypted) ? iconSet.add('edge') && htmlIcon('edge') :
            /brave/i.test(decrypted) ? iconSet.add('brave') && htmlIcon('brave') :
                /vivaldi/i.test(decrypted) ? iconSet.add('vivaldi') && htmlIcon('vivaldi') :
                    /duckduckgo/i.test(decrypted) ? iconSet.add('duckduckgo') && htmlIcon('duckduckgo') :
                        /yandex/i.test(decrypted) ? iconSet.add('yandex') && htmlIcon('yandex') :
                            /opera/i.test(decrypted) ? iconSet.add('opera') && htmlIcon('opera') :
                                /crios|chrome/i.test(decrypted) ? iconSet.add('chrome') && htmlIcon('chrome') :
                                    /tor browser/i.test(decrypted) ? iconSet.add('tor') && htmlIcon('tor') :
                                        /palemoon/i.test(decrypted) ? iconSet.add('palemoon') && htmlIcon('palemoon') :
                                            /fxios|firefox/i.test(decrypted) ? iconSet.add('firefox') && htmlIcon('firefox') :
                                                /v8/i.test(decrypted) ? iconSet.add('v8') && htmlIcon('v8') :
                                                    /gecko/i.test(decrypted) ? iconSet.add('gecko') && htmlIcon('gecko') :
                                                        /goanna/i.test(decrypted) ? iconSet.add('goanna') && htmlIcon('goanna') :
                                                            /spidermonkey/i.test(decrypted) ? iconSet.add('firefox') && htmlIcon('firefox') :
                                                                /safari/i.test(decrypted) ? iconSet.add('safari') && htmlIcon('safari') :
                                                                    /webkit|javascriptcore/i.test(decrypted) ? iconSet.add('webkit') && htmlIcon('webkit') :
                                                                        /blink/i.test(decrypted) ? iconSet.add('blink') && htmlIcon('blink') : htmlIcon(''));
        const systemIcon = (/chrome os/i.test(system) ? iconSet.add('cros') && htmlIcon('cros') :
            /linux/i.test(system) ? iconSet.add('linux') && htmlIcon('linux') :
                /android/i.test(system) ? iconSet.add('android') && htmlIcon('android') :
                    /ipad|iphone|ipod|ios|mac|apple/i.test(system) ? iconSet.add('apple') && htmlIcon('apple') :
                        /windows/i.test(system) ? iconSet.add('windows') && htmlIcon('windows') : htmlIcon(''));
        const icons = [
            systemIcon,
            browserIcon,
        ].join('');
        const unknown = '' + [...new Set([decrypted, system, device])] == '';
        // const renderBlankIfKnown = (unknown) => unknown ? ` ${HTMLNote.unknown}` : ''
        const renderIfKnown = (unknown, decrypted) => unknown ? ` ${HTMLNote.UNKNOWN}` : `<span class="user-agent">${decrypted}</span>`;
        const renderFailingScore = (title, score) => {
            return (!score || (score > 36) ? title : `<span class="high-entropy">${title}</span>`);
        };
        return (device ? `<span class="help" title="${device}">
				${renderFailingScore(`${icons}${title}`, score)}<span>*</span>
			</span>` :
            showVersion ? renderFailingScore(`${icons}${renderIfKnown(unknown, decrypted)}`, score) :
                renderFailingScore(`${icons}${title}`, score));
    };
    const unknownHTML = (title) => `${getBlankIcons()}<span class="blocked-entropy">${title}</span>`;
    const devices = new Set([
        (jsRuntime || {}).device,
        (emojiSystem || {}).device,
        (domRectSystem || {}).device,
        (svgSystem || {}).device,
        (mimeTypesSystem || {}).device,
        (audioSystem || {}).device,
        (canvasSystem || {}).device,
        (canvasBlobSystem || {}).device,
        (canvasPaintSystem || {}).device,
        (canvasTextSystem || {}).device,
        (canvasEmojiSystem || {}).device,
        (textMetricsSystem || {}).device,
        (webglSystem || {}).device,
        (gpuSystem || {}).device,
        (gpuModelSystem || {}).device,
        (fontsSystem || {}).device,
        (voicesSystem || {}).device,
        (screenSystem || {}).device,
        (deviceOfTimezone || {}).device,
    ]);
    devices.delete(undefined);
    const getBaseDeviceName = (devices) => {
        return devices.find((a) => devices.filter((b) => b.includes(a)).length == devices.length);
    };
    const getRFPWindowOS = (devices) => {
        // FF RFP is ingnored in samples data since it returns Windows 10
        // So, if we have multiples versions of Windows, prefer the lowest then Windows 11
        const windowsCoreRatio = devices.filter((x) => /windows/i.test(x)).length / devices.length;
        const windowsCore = windowsCoreRatio > 0.5;
        if (windowsCore) {
            return (devices.includes('Windows 7 (64-bit)') ? 'Windows 7 (64-bit)' :
                devices.includes('Windows 7') ? 'Windows 7' :
                    devices.includes('Windows 8 (64-bit)') ? 'Windows 8 (64-bit)' :
                        devices.includes('Windows 8') ? 'Windows 8' :
                            devices.includes('Windows 8.1 (64-bit)') ? 'Windows 8.1 (64-bit)' :
                                devices.includes('Windows 8.1') ? 'Windows 8.1' :
                                    devices.includes('Windows 11 (64-bit)') ? 'Windows 11 (64-bit)' :
                                        devices.includes('Windows 11') ? 'Windows 11' :
                                            devices.includes('Windows 10 (64-bit)') ? 'Windows 10 (64-bit)' :
                                                devices.includes('Windows 10') ? 'Windows 10' :
                                                    undefined);
        }
        return undefined;
    };
    const deviceCollection = [...devices];
    const deviceName = (getRFPWindowOS(deviceCollection) ||
        getBaseDeviceName(deviceCollection));
    // Crowd-Blending Score Grade
    const crowdBlendingScoreGrade = (crowdBlendingScore >= 90 ? 'A' :
        crowdBlendingScore >= 80 ? 'B' :
            crowdBlendingScore >= 70 ? 'C' :
                crowdBlendingScore >= 60 ? 'D' :
                    'F');
    const hasValue = (data) => Object.values(data || {}).find((x) => typeof x != 'undefined');
    const el = document.getElementById('browser-detection');
    return patch(el, html `
	<div class="flex-grid relative">
		${pendingReview ? `<span class="aside-note-bottom">pending review: <span class="renewed">${pendingReview}</span></span>` : ''}
		${bot ? `<span class="time"><span class="renewed">locked</span></span>` :
        typeof crowdBlendingScore == 'number' ? `<span class="time">crowd-blending score: ${'' + crowdBlendingScore}% <span class="scale-up grade-${crowdBlendingScoreGrade}">${crowdBlendingScoreGrade}</span></span>` : ''}
		<div class="col-six">
			<strong>Prediction</strong>
			<div class="ellipsis relative">${deviceName ? `<span class="user-agent"><span>*</span>${deviceName}</span>` : getBlankIcons()}</div>
			<div class="ellipsis relative">
				<span id="window-entropy"></span>${getTemplate({ title: 'self', agent: windowVersion, showVersion: true })}</div>
			<div class="ellipsis relative">
				<span id="style-entropy"></span>${getTemplate({ title: 'system styles', agent: styleSystem })}</div>
			<div class="ellipsis relative">
				<span id="styleVersion-entropy"></span>${getTemplate({ title: 'computed styles', agent: styleVersion })}</div>
			<div class="ellipsis relative">
				<span id="html-entropy"></span>${getTemplate({ title: 'html element', agent: htmlVersion })}</div>
			<div class="ellipsis relative">
				<span id="math-entropy"></span>${getTemplate({ title: 'js runtime', agent: jsRuntime })}</div>
			<div class="ellipsis relative">
				<span id="error-entropy"></span>${getTemplate({ title: 'js engine', agent: jsEngine })}</div>
			<div class="ellipsis relative">
				<span id="emoji-entropy"></span>${!hasValue(emojiSystem) ? unknownHTML('domRect emojis') :
        getTemplate({ title: 'domRect emojis', agent: emojiSystem })}</div>
			<div class="ellipsis relative">
				<span id="domRect-entropy"></span>${!hasValue(domRectSystem) ? unknownHTML('domRect') :
        getTemplate({ title: 'domRect', agent: domRectSystem })}</div>
			<div class="ellipsis relative">
				<span id="svg-entropy"></span>${!hasValue(svgSystem) ? unknownHTML('svg emojis') :
        getTemplate({ title: 'svg emojis', agent: svgSystem })}</div>
			<div class="ellipsis relative">
				<span id="mimeTypes-entropy"></span>${!hasValue(mimeTypesSystem) ? unknownHTML('mimeTypes') :
        getTemplate({ title: 'mimeTypes', agent: mimeTypesSystem })}</div>
			<div class="ellipsis relative">
				<span id="audio-entropy"></span>${!hasValue(audioSystem) ? unknownHTML('audio') :
        getTemplate({ title: 'audio', agent: audioSystem })}</div>
			<div class="ellipsis relative">
				<span id="canvas-entropy"></span>${!hasValue(canvasSystem) ? unknownHTML('canvas image') :
        getTemplate({ title: 'canvas image', agent: canvasSystem })}</div>
			<div class="ellipsis relative">
				<span id="canvasBlob-entropy"></span>${!hasValue(canvasBlobSystem) ? unknownHTML('canvas blob') :
        getTemplate({ title: 'canvas blob', agent: canvasBlobSystem })}</div>
			<div class="ellipsis relative">
				<span id="canvasPaint-entropy"></span>${!hasValue(canvasPaintSystem) ? unknownHTML('canvas paint') :
        getTemplate({ title: 'canvas paint', agent: canvasPaintSystem })}</div>
			<div class="ellipsis relative">
				<span id="canvasText-entropy"></span>${!hasValue(canvasTextSystem) ? unknownHTML('canvas text') :
        getTemplate({ title: 'canvas text', agent: canvasTextSystem })}</div>
			<div class="ellipsis relative">
				<span id="canvasEmoji-entropy"></span>${!hasValue(canvasEmojiSystem) ? unknownHTML('canvas emoji') :
        getTemplate({ title: 'canvas emoji', agent: canvasEmojiSystem })}</div>
			<div class="ellipsis relative">
				<span id="textMetrics-entropy"></span>${!hasValue(textMetricsSystem) ? unknownHTML('textMetrics') :
        getTemplate({ title: 'textMetrics', agent: textMetricsSystem })}</div>
			<div class="ellipsis relative">
				<span id="webgl-entropy"></span>${!hasValue(webglSystem) ? unknownHTML('webgl') :
        getTemplate({ title: 'webgl', agent: webglSystem })}</div>
			<div class="ellipsis relative">
				<span id="gpu-entropy"></span>${!hasValue(gpuSystem) ? unknownHTML('gpu params') :
        getTemplate({ title: 'gpu params', agent: gpuSystem })}</div>
			<div class="ellipsis relative">
				<span id="gpuModel-entropy"></span>${!hasValue(gpuModelSystem) ? unknownHTML('gpu model') :
        getTemplate({ title: 'gpu model', agent: gpuModelSystem })}</div>
			<div class="ellipsis relative">
				<span id="fonts-entropy"></span>${!hasValue(fontsSystem) ? unknownHTML('fonts') :
        getTemplate({ title: 'fonts', agent: fontsSystem })}</div>
			<div class="ellipsis relative">
				<span id="voices-entropy"></span>${!hasValue(voicesSystem) ? unknownHTML('voices') :
        getTemplate({ title: 'voices', agent: voicesSystem })}</div>
			<div class="ellipsis relative">
				<span id="screen-entropy"></span>${!hasValue(screenSystem) ? unknownHTML('screen') :
        getTemplate({ title: 'screen', agent: screenSystem })}</div>
			<div class="ellipsis relative">
				<span id="resistance-entropy"></span>${!hasValue(resistance) ? unknownHTML('resistance') :
        getTemplate({ title: 'resistance', agent: resistance })}</div>
			<div class="ellipsis relative">
				<span id="deviceOfTimezone-entropy"></span>${!hasValue(deviceOfTimezone) ? unknownHTML('device of timezone') :
        getTemplate({ title: 'device of timezone', agent: deviceOfTimezone })}</div>
		</div>
		<div class="col-six icon-prediction-container">
			${[...iconSet].map((icon) => {
        return `<div class="icon-prediction ${icon}"></div>`;
    }).join('')}
			${gpuSystem && !(/^(undefined|false)$/.test('' + gpuSystem.gpu)) ?
        `<div class="icon-prediction block-text-borderless">gpu:<br>${gpuSystem.gpu}</div>` : ''}
		</div>
	</div>
	`);
}
function predictionErrorPatch({ error, patch, html }) {
    const getBlankIcons = () => `<span class="icon"></span><span class="icon"></span>`;
    const el = document.getElementById('browser-detection');
    return patch(el, html `
		<div class="flex-grid rejected">
			<div class="col-eight">
				<strong>Prediction Failed: ${error}</strong>
				<div>${getBlankIcons()}</div>
				<div class="ellipsis">${getBlankIcons()}window object:</div>
				<div>${getBlankIcons()}system styles</div>
				<div>${getBlankIcons()}computed styles</div>
				<div>${getBlankIcons()}html element</div>
				<div>${getBlankIcons()}js runtime</div>
				<div>${getBlankIcons()}js engine</div>
				<div>${getBlankIcons()}emojis</div>
				<div>${getBlankIcons()}domRect</div>
				<div>${getBlankIcons()}svg</div>
				<div>${getBlankIcons()}mimeTypes</div>
				<div>${getBlankIcons()}audio</div>
				<div>${getBlankIcons()}canvas image</div>
				<div>${getBlankIcons()}canvas blob</div>
				<div>${getBlankIcons()}canvas paint</div>
				<div>${getBlankIcons()}canvas text</div>
				<div>${getBlankIcons()}canvas emoji</div>
				<div>${getBlankIcons()}textMetrics</div>
				<div>${getBlankIcons()}webgl</div>
				<div>${getBlankIcons()}gpu params</div>
				<div>${getBlankIcons()}gpu model</div>
				<div>${getBlankIcons()}fonts</div>
				<div>${getBlankIcons()}voices</div>
				<div>${getBlankIcons()}screen</div>
				<div>${getBlankIcons()}resistance</div>
				<div>${getBlankIcons()}device of timezone</div>
			</div>
			<div class="col-four icon-prediction-container">
			</div>
		</div>
	`);
}

async function getResistance() {
    try {
        const timer = createTimer();
        await queueEvent(timer);
        const data = {
            privacy: undefined,
            security: undefined,
            mode: undefined,
            extension: undefined,
            engine: (IS_BLINK ? 'Blink' :
                IS_GECKO ? 'Gecko' :
                    ''),
        };
        // Firefox/Tor Browser
        const regex = (n) => new RegExp(`${n}+$`);
        const delay = (ms, baseNumber, baseDate) => new Promise((resolve) => setTimeout(() => {
            const date = baseDate ? baseDate : +new Date();
            // @ts-ignore
            const value = regex(baseNumber).test(date) ? regex(baseNumber).exec(date)[0] : date;
            return resolve(value);
        }, ms));
        const getTimerPrecision = async () => {
            const baseDate = +new Date();
            const baseNumber = +('' + baseDate).slice(-1);
            const a = await delay(0, baseNumber, baseDate);
            const b = await delay(1, baseNumber);
            const c = await delay(2, baseNumber);
            const d = await delay(3, baseNumber);
            const e = await delay(4, baseNumber);
            const f = await delay(5, baseNumber);
            const g = await delay(6, baseNumber);
            const h = await delay(7, baseNumber);
            const i = await delay(8, baseNumber);
            const j = await delay(9, baseNumber);
            const lastCharA = ('' + a).slice(-1);
            const lastCharB = ('' + b).slice(-1);
            const lastCharC = ('' + c).slice(-1);
            const lastCharD = ('' + d).slice(-1);
            const lastCharE = ('' + e).slice(-1);
            const lastCharF = ('' + f).slice(-1);
            const lastCharG = ('' + g).slice(-1);
            const lastCharH = ('' + h).slice(-1);
            const lastCharI = ('' + i).slice(-1);
            const lastCharJ = ('' + j).slice(-1);
            const protection = (lastCharA == lastCharB &&
                lastCharA == lastCharC &&
                lastCharA == lastCharD &&
                lastCharA == lastCharE &&
                lastCharA == lastCharF &&
                lastCharA == lastCharG &&
                lastCharA == lastCharH &&
                lastCharA == lastCharI &&
                lastCharA == lastCharJ);
            const baseLen = ('' + a).length;
            const collection = [a, b, c, d, e, f, g, h, i, j];
            return {
                protection,
                delays: collection.map((n) => ('' + n).length > baseLen ? ('' + n).slice(-baseLen) : n),
                precision: protection ? Math.min(...collection.map((val) => ('' + val).length)) : undefined,
                precisionValue: protection ? lastCharA : undefined,
            };
        };
        const [isBrave, timerPrecision,] = await Promise.all([
            braveBrowser(),
            IS_BLINK ? undefined : getTimerPrecision(),
        ]);
        if (isBrave) {
            const braveMode = getBraveMode();
            data.privacy = 'Brave';
            // @ts-ignore
            data.security = {
                'FileSystemWritableFileStream': 'FileSystemWritableFileStream' in window,
                'Serial': 'Serial' in window,
                'ReportingObserver': 'ReportingObserver' in window,
            };
            data.mode = (braveMode.allow ? 'allow' :
                braveMode.standard ? 'standard' :
                    braveMode.strict ? 'strict' :
                        '');
        }
        const { protection } = timerPrecision || {};
        if (IS_GECKO && protection) {
            const features = {
                'OfflineAudioContext': 'OfflineAudioContext' in window,
                'WebGL2RenderingContext': 'WebGL2RenderingContext' in window,
                'WebAssembly': 'WebAssembly' in window,
                'maxTouchPoints': 'maxTouchPoints' in navigator,
                'RTCRtpTransceiver': 'RTCRtpTransceiver' in window,
                'MediaDevices': 'MediaDevices' in window,
                'Credential': 'Credential' in window,
            };
            const featureKeys = Object.keys(features);
            const targetSet = new Set([
                'RTCRtpTransceiver',
                'MediaDevices',
                'Credential',
            ]);
            const torBrowser = featureKeys.filter((key) => targetSet.has(key) && !features[key]).length == targetSet.size;
            const safer = !features.WebAssembly;
            data.privacy = torBrowser ? 'Tor Browser' : 'Firefox';
            // @ts-ignore
            data.security = Object.assign({ 'reduceTimerPrecision': true }, features);
            data.mode = (!torBrowser ? 'resistFingerprinting' :
                safer ? 'safer' :
                    'standard');
        }
        // extension
        // - this technique gets a small sample of known lie patterns
        // - patterns vary based on extensions settings, version, browser
        const prototypeLiesLen = Object.keys(prototypeLies).length;
        // patterns based on settings
        const disabled = 'c767712b';
        const pattern = {
            noscript: {
                contentDocumentHash: ['0b637a33', '37e2f32e'],
                contentWindowHash: ['0b637a33', '37e2f32e'],
                getContextHash: ['0b637a33', '081d6d1b', disabled],
            },
            trace: {
                contentDocumentHash: ['ca9d9c2f'],
                contentWindowHash: ['ca9d9c2f'],
                createElementHash: ['77dea834'],
                getElementByIdHash: ['77dea834'],
                getImageDataHash: ['77dea834'],
                toBlobHash: ['77dea834'],
                toDataURLHash: ['77dea834'],
            },
            cydec: {
                // [FF, FF Anti OFF, Chrome, Chrome Anti Off, no iframe Chrome, no iframe Chrome Anti Off]
                contentDocumentHash: ['945b0c78', '15771efa', '403a1a21', '55e9b959'],
                contentWindowHash: ['945b0c78', '15771efa', '403a1a21', '55e9b959'],
                createElementHash: ['3dd86d6f', 'cc7cb598', '4237b44c', '1466aaf0', '0cb0c682', '73c662d9', '72b1ee2b', 'ae3d02c9'],
                getElementByIdHash: ['3dd86d6f', 'cc7cb598', '4237b44c', '1466aaf0', '0cb0c682', '73c662d9', '72b1ee2b', 'ae3d02c9'],
                getImageDataHash: ['044f14c2', 'db60d7f9', '15771efa', 'db60d7f9', '55e9b959'],
                toBlobHash: ['044f14c2', '15771efa', 'afec348d', '55e9b959', '0dbbf456'],
                toDataURLHash: ['ecb498d9', '15771efa', '6b838fb6', 'd19104ec', '6985d315', '55e9b959', 'fe88259f'],
            },
            canvasblocker: {
                contentDocumentHash: ['98ec858e'],
                contentWindowHash: ['98ec858e'],
                appendHash: ['98ec858e'],
                getImageDataHash: ['98ec858e', 'a2971888', disabled],
                toBlobHash: ['9f1c3dfe', 'a2971888', disabled],
                toDataURLHash: ['98ec858e', 'a2971888', disabled],
            },
            chameleon: {
                appendHash: ['77dea834'],
                insertAdjacentElementHash: ['77dea834'],
                insertAdjacentHTMLHash: ['77dea834'],
                insertAdjacentTextHash: ['77dea834'],
                prependHash: ['77dea834'],
                replaceWithHash: ['77dea834'],
                appendChildHash: ['77dea834'],
                insertBeforeHash: ['77dea834'],
                replaceChildHash: ['77dea834'],
            },
            duckduckgo: {
                toDataURLHash: ['fd00bf5d', '8ee7df22'],
                toBlobHash: ['fd00bf5d', '8ee7df22'],
                getImageDataHash: ['fd00bf5d', '8ee7df22'],
                getByteFrequencyDataHash: ['fd00bf5d', '8ee7df22', disabled],
                getByteTimeDomainDataHash: ['fd00bf5d', '8ee7df22', disabled],
                getFloatFrequencyDataHash: ['fd00bf5d', '8ee7df22', disabled],
                getFloatTimeDomainDataHash: ['fd00bf5d', '8ee7df22', disabled],
                copyFromChannelHash: ['fd00bf5d', '8ee7df22', disabled],
                getChannelDataHash: ['fd00bf5d', '8ee7df22', disabled],
                hardwareConcurrencyHash: ['dfd41ab4'],
                availHeightHash: ['dfd41ab4'],
                availLeftHash: ['dfd41ab4'],
                availTopHash: ['dfd41ab4'],
                availWidthHash: ['dfd41ab4'],
                colorDepthHash: ['dfd41ab4'],
                pixelDepthHash: ['dfd41ab4'],
            },
            // mode: Learn to block new trackers from your browsing
            privacybadger: {
                getImageDataHash: ['0cb0c682'],
                toDataURLHash: ['0cb0c682'],
            },
            privacypossum: {
                hardwareConcurrencyHash: ['452924d5'],
                availWidthHash: ['452924d5'],
                colorDepthHash: ['452924d5'],
            },
            jshelter: {
                contentDocumentHash: ['0007ab4e', '0b637a33'],
                contentWindowHash: ['0007ab4e', '0b637a33'],
                appendHash: ['0007ab4e', '0b637a33'],
                insertAdjacentElementHash: ['0007ab4e', '0b637a33'],
                insertAdjacentHTMLHash: ['0007ab4e', '0b637a33'],
                prependHash: ['0007ab4e', '0b637a33'],
                replaceWithHash: ['0007ab4e', '0b637a33'],
                appendChildHash: ['0007ab4e', '0b637a33'],
                insertBeforeHash: ['0007ab4e', '0b637a33'],
                replaceChildHash: ['0007ab4e', '0b637a33'],
                hardwareConcurrencyHash: ['dfd41ab4'],
            },
            puppeteerExtra: {
                contentDocumentHash: ['55e9b959'],
                contentWindowHash: [
                    '55e9b959',
                    '50a281b5', // @2.10.0
                ],
                createElementHash: ['55e9b959'],
                getElementByIdHash: ['55e9b959'],
                appendHash: ['55e9b959'],
                insertAdjacentElementHash: ['55e9b959'],
                insertAdjacentHTMLHash: ['55e9b959'],
                insertAdjacentTextHash: ['55e9b959'],
                prependHash: ['55e9b959'],
                replaceWithHash: ['55e9b959'],
                appendChildHash: ['55e9b959'],
                insertBeforeHash: ['55e9b959'],
                replaceChildHash: ['55e9b959'],
                getContextHash: ['55e9b959'],
                toDataURLHash: ['55e9b959'],
                toBlobHash: ['55e9b959'],
                getImageDataHash: ['55e9b959'],
                hardwareConcurrencyHash: ['efbd4cf9', 'a63491fb'],
            },
            fakeBrowser: {
                appendChildHash: ['8dfec2ec', 'f43e6134'],
                getContextHash: ['83b825ab', 'a63491fb'],
                toDataURLHash: ['83b825ab', 'a63491fb'],
                toBlobHash: ['83b825ab', 'a63491fb'],
                getImageDataHash: ['83b825ab', 'a63491fb'],
                hardwareConcurrencyHash: ['83b825ab', 'a63491fb'],
                availHeightHash: ['83b825ab', 'a63491fb'],
                availLeftHash: ['83b825ab', 'a63491fb'],
                availTopHash: ['83b825ab', 'a63491fb'],
                availWidthHash: ['83b825ab', 'a63491fb'],
                colorDepthHash: ['83b825ab', 'a63491fb'],
                pixelDepthHash: ['83b825ab', 'a63491fb'],
            },
        };
        /*
        Random User-Agent
        User Agent Switcher and Manager
        ScriptSafe
        Windscribe
        */
        await queueEvent(timer);
        const hash = {
            // iframes
            contentDocumentHash: hashMini(prototypeLies['HTMLIFrameElement.contentDocument']),
            contentWindowHash: hashMini(prototypeLies['HTMLIFrameElement.contentWindow']),
            createElementHash: hashMini(prototypeLies['Document.createElement']),
            getElementByIdHash: hashMini(prototypeLies['Document.getElementById']),
            appendHash: hashMini(prototypeLies['Element.append']),
            insertAdjacentElementHash: hashMini(prototypeLies['Element.insertAdjacentElement']),
            insertAdjacentHTMLHash: hashMini(prototypeLies['Element.insertAdjacentHTML']),
            insertAdjacentTextHash: hashMini(prototypeLies['Element.insertAdjacentText']),
            prependHash: hashMini(prototypeLies['Element.prepend']),
            replaceWithHash: hashMini(prototypeLies['Element.replaceWith']),
            appendChildHash: hashMini(prototypeLies['Node.appendChild']),
            insertBeforeHash: hashMini(prototypeLies['Node.insertBefore']),
            replaceChildHash: hashMini(prototypeLies['Node.replaceChild']),
            // canvas
            getContextHash: hashMini(prototypeLies['HTMLCanvasElement.getContext']),
            toDataURLHash: hashMini(prototypeLies['HTMLCanvasElement.toDataURL']),
            toBlobHash: hashMini(prototypeLies['HTMLCanvasElement.toBlob']),
            getImageDataHash: hashMini(prototypeLies['CanvasRenderingContext2D.getImageData']),
            // Audio
            getByteFrequencyDataHash: hashMini(prototypeLies['AnalyserNode.getByteFrequencyData']),
            getByteTimeDomainDataHash: hashMini(prototypeLies['AnalyserNode.getByteTimeDomainData']),
            getFloatFrequencyDataHash: hashMini(prototypeLies['AnalyserNode.getFloatFrequencyData']),
            getFloatTimeDomainDataHash: hashMini(prototypeLies['AnalyserNode.getFloatTimeDomainData']),
            copyFromChannelHash: hashMini(prototypeLies['AudioBuffer.copyFromChannel']),
            getChannelDataHash: hashMini(prototypeLies['AudioBuffer.getChannelData']),
            // Hardware
            hardwareConcurrencyHash: hashMini(prototypeLies['Navigator.hardwareConcurrency']),
            // Screen
            availHeightHash: hashMini(prototypeLies['Screen.availHeight']),
            availLeftHash: hashMini(prototypeLies['Screen.availLeft']),
            availTopHash: hashMini(prototypeLies['Screen.availTop']),
            availWidthHash: hashMini(prototypeLies['Screen.availWidth']),
            colorDepthHash: hashMini(prototypeLies['Screen.colorDepth']),
            pixelDepthHash: hashMini(prototypeLies['Screen.pixelDepth']),
        };
        data.extensionHashPattern = Object.keys(hash).reduce((acc, key) => {
            const val = hash[key];
            if (val == disabled) {
                return acc;
            }
            acc[key.replace('Hash', '')] = val;
            return acc;
        }, {});
        const getExtension = ({ pattern, hash, prototypeLiesLen }) => {
            const { noscript, trace, cydec, canvasblocker, chameleon, duckduckgo, privacybadger, privacypossum, jshelter, puppeteerExtra, fakeBrowser, } = pattern;
            const disabled = 'c767712b';
            if (prototypeLiesLen) {
                if (prototypeLiesLen >= 7 &&
                    trace.contentDocumentHash.includes(hash.contentDocumentHash) &&
                    trace.contentWindowHash.includes(hash.contentWindowHash) &&
                    trace.createElementHash.includes(hash.createElementHash) &&
                    trace.getElementByIdHash.includes(hash.getElementByIdHash) &&
                    trace.toDataURLHash.includes(hash.toDataURLHash) &&
                    trace.toBlobHash.includes(hash.toBlobHash) &&
                    trace.getImageDataHash.includes(hash.getImageDataHash)) {
                    return 'Trace';
                }
                if (prototypeLiesLen >= 7 &&
                    cydec.contentDocumentHash.includes(hash.contentDocumentHash) &&
                    cydec.contentWindowHash.includes(hash.contentWindowHash) &&
                    cydec.createElementHash.includes(hash.createElementHash) &&
                    cydec.getElementByIdHash.includes(hash.getElementByIdHash) &&
                    cydec.toDataURLHash.includes(hash.toDataURLHash) &&
                    cydec.toBlobHash.includes(hash.toBlobHash) &&
                    cydec.getImageDataHash.includes(hash.getImageDataHash)) {
                    return 'CyDec';
                }
                if (prototypeLiesLen >= 6 &&
                    canvasblocker.contentDocumentHash.includes(hash.contentDocumentHash) &&
                    canvasblocker.contentWindowHash.includes(hash.contentWindowHash) &&
                    canvasblocker.appendHash.includes(hash.appendHash) &&
                    canvasblocker.toDataURLHash.includes(hash.toDataURLHash) &&
                    canvasblocker.toBlobHash.includes(hash.toBlobHash) &&
                    canvasblocker.getImageDataHash.includes(hash.getImageDataHash)) {
                    return 'CanvasBlocker';
                }
                if (prototypeLiesLen >= 9 &&
                    chameleon.appendHash.includes(hash.appendHash) &&
                    chameleon.insertAdjacentElementHash.includes(hash.insertAdjacentElementHash) &&
                    chameleon.insertAdjacentHTMLHash.includes(hash.insertAdjacentHTMLHash) &&
                    chameleon.insertAdjacentTextHash.includes(hash.insertAdjacentTextHash) &&
                    chameleon.prependHash.includes(hash.prependHash) &&
                    chameleon.replaceWithHash.includes(hash.replaceWithHash) &&
                    chameleon.appendChildHash.includes(hash.appendChildHash) &&
                    chameleon.insertBeforeHash.includes(hash.insertBeforeHash) &&
                    chameleon.replaceChildHash.includes(hash.replaceChildHash)) {
                    return 'Chameleon';
                }
                if (prototypeLiesLen >= 10 &&
                    duckduckgo.toDataURLHash.includes(hash.toDataURLHash) &&
                    duckduckgo.toBlobHash.includes(hash.toBlobHash) &&
                    duckduckgo.getImageDataHash.includes(hash.getImageDataHash) &&
                    duckduckgo.getByteFrequencyDataHash.includes(hash.getByteFrequencyDataHash) &&
                    duckduckgo.getByteTimeDomainDataHash.includes(hash.getByteTimeDomainDataHash) &&
                    duckduckgo.getFloatFrequencyDataHash.includes(hash.getFloatFrequencyDataHash) &&
                    duckduckgo.getFloatTimeDomainDataHash.includes(hash.getFloatTimeDomainDataHash) &&
                    duckduckgo.copyFromChannelHash.includes(hash.copyFromChannelHash) &&
                    duckduckgo.getChannelDataHash.includes(hash.getChannelDataHash) &&
                    duckduckgo.hardwareConcurrencyHash.includes(hash.hardwareConcurrencyHash) &&
                    duckduckgo.availHeightHash.includes(hash.availHeightHash) &&
                    duckduckgo.availLeftHash.includes(hash.availLeftHash) &&
                    duckduckgo.availTopHash.includes(hash.availTopHash) &&
                    duckduckgo.availWidthHash.includes(hash.availWidthHash) &&
                    duckduckgo.colorDepthHash.includes(hash.colorDepthHash) &&
                    duckduckgo.pixelDepthHash.includes(hash.pixelDepthHash)) {
                    return 'DuckDuckGo';
                }
                if (prototypeLiesLen >= 2 &&
                    privacybadger.getImageDataHash.includes(hash.getImageDataHash) &&
                    privacybadger.toDataURLHash.includes(hash.toDataURLHash)) {
                    return 'Privacy Badger';
                }
                if (prototypeLiesLen >= 3 &&
                    privacypossum.hardwareConcurrencyHash.includes(hash.hardwareConcurrencyHash) &&
                    privacypossum.availWidthHash.includes(hash.availWidthHash) &&
                    privacypossum.colorDepthHash.includes(hash.colorDepthHash)) {
                    return 'Privacy Possum';
                }
                if (prototypeLiesLen >= 2 &&
                    noscript.contentDocumentHash.includes(hash.contentDocumentHash) &&
                    noscript.contentWindowHash.includes(hash.contentDocumentHash) &&
                    noscript.getContextHash.includes(hash.getContextHash) &&
                    // distinguish NoScript from JShelter
                    hash.hardwareConcurrencyHash == disabled) {
                    return 'NoScript';
                }
                if (prototypeLiesLen >= 14 &&
                    jshelter.contentDocumentHash.includes(hash.contentDocumentHash) &&
                    jshelter.contentWindowHash.includes(hash.contentDocumentHash) &&
                    jshelter.appendHash.includes(hash.appendHash) &&
                    jshelter.insertAdjacentElementHash.includes(hash.insertAdjacentElementHash) &&
                    jshelter.insertAdjacentHTMLHash.includes(hash.insertAdjacentHTMLHash) &&
                    jshelter.prependHash.includes(hash.prependHash) &&
                    jshelter.replaceWithHash.includes(hash.replaceWithHash) &&
                    jshelter.appendChildHash.includes(hash.appendChildHash) &&
                    jshelter.insertBeforeHash.includes(hash.insertBeforeHash) &&
                    jshelter.replaceChildHash.includes(hash.replaceChildHash) &&
                    jshelter.hardwareConcurrencyHash.includes(hash.hardwareConcurrencyHash)) {
                    return 'JShelter';
                }
                if (prototypeLiesLen >= 13 &&
                    puppeteerExtra.contentDocumentHash.includes(hash.contentDocumentHash) &&
                    puppeteerExtra.contentWindowHash.includes(hash.contentWindowHash) &&
                    puppeteerExtra.createElementHash.includes(hash.createElementHash) &&
                    puppeteerExtra.getElementByIdHash.includes(hash.getElementByIdHash) &&
                    puppeteerExtra.appendHash.includes(hash.appendHash) &&
                    puppeteerExtra.insertAdjacentElementHash.includes(hash.insertAdjacentElementHash) &&
                    puppeteerExtra.insertAdjacentHTMLHash.includes(hash.insertAdjacentHTMLHash) &&
                    puppeteerExtra.insertAdjacentTextHash.includes(hash.insertAdjacentTextHash) &&
                    puppeteerExtra.prependHash.includes(hash.prependHash) &&
                    puppeteerExtra.replaceWithHash.includes(hash.replaceWithHash) &&
                    puppeteerExtra.appendChildHash.includes(hash.appendChildHash) &&
                    puppeteerExtra.insertBeforeHash.includes(hash.insertBeforeHash) &&
                    puppeteerExtra.contentDocumentHash.includes(hash.contentDocumentHash) &&
                    puppeteerExtra.replaceChildHash.includes(hash.replaceChildHash) &&
                    puppeteerExtra.getContextHash.includes(hash.getContextHash) &&
                    puppeteerExtra.toDataURLHash.includes(hash.toDataURLHash) &&
                    puppeteerExtra.toBlobHash.includes(hash.toBlobHash) &&
                    puppeteerExtra.getImageDataHash.includes(hash.getImageDataHash) &&
                    puppeteerExtra.hardwareConcurrencyHash.includes(hash.hardwareConcurrencyHash)) {
                    return 'puppeteer-extra';
                }
                if (prototypeLiesLen >= 12 &&
                    fakeBrowser.appendChildHash.includes(hash.appendChildHash) &&
                    fakeBrowser.getContextHash.includes(hash.getContextHash) &&
                    fakeBrowser.toDataURLHash.includes(hash.toDataURLHash) &&
                    fakeBrowser.toBlobHash.includes(hash.toBlobHash) &&
                    fakeBrowser.getImageDataHash.includes(hash.getImageDataHash) &&
                    fakeBrowser.hardwareConcurrencyHash.includes(hash.hardwareConcurrencyHash) &&
                    fakeBrowser.availHeightHash.includes(hash.availHeightHash) &&
                    fakeBrowser.availLeftHash.includes(hash.availLeftHash) &&
                    fakeBrowser.availTopHash.includes(hash.availTopHash) &&
                    fakeBrowser.availWidthHash.includes(hash.availWidthHash) &&
                    fakeBrowser.colorDepthHash.includes(hash.colorDepthHash) &&
                    fakeBrowser.pixelDepthHash.includes(hash.pixelDepthHash)) {
                    return 'FakeBrowser';
                }
                return;
            }
            return;
        };
        // @ts-ignore
        data.extension = getExtension({ pattern, hash, prototypeLiesLen });
        logTestResult({ time: timer.stop(), test: 'resistance', passed: true });
        return data;
    }
    catch (error) {
        logTestResult({ test: 'resistance', passed: false });
        captureError(error);
        return;
    }
}
function resistanceHTML(fp) {
    if (!fp.resistance) {
        return `
		<div class="col-six undefined">
			<strong>Resistance</strong>
			<div>privacy: ${HTMLNote.BLOCKED}</div>
			<div>security: ${HTMLNote.BLOCKED}</div>
			<div>mode: ${HTMLNote.BLOCKED}</div>
			<div>extension: ${HTMLNote.BLOCKED}</div>
		</div>`;
    }
    const { resistance: data, } = fp;
    const { $hash, privacy, security, mode, extension, extensionHashPattern, engine, } = data || {};
    const securitySettings = !security || Object.keys(security).reduce((acc, curr) => {
        if (security[curr]) {
            acc[curr] = 'enabled';
            return acc;
        }
        acc[curr] = 'disabled';
        return acc;
    }, {});
    const browserIcon = (/brave/i.test(privacy) ? '<span class="icon brave"></span>' :
        /tor/i.test(privacy) ? '<span class="icon tor"></span>' :
            /firefox/i.test(privacy) ? '<span class="icon firefox"></span>' :
                '');
    const extensionIcon = (/blink/i.test(engine) ? '<span class="icon chrome-extension"></span>' :
        /gecko/i.test(engine) ? '<span class="icon firefox-addon"></span>' :
            '');
    return `
	<div class="relative col-six">
		<span class="aside-note">${performanceLogger.getLog().resistance}</span>
		<strong>Resistance</strong><span class="hash">${hashSlice($hash)}</span>
		<div>privacy: ${privacy ? `${browserIcon}${privacy}` : HTMLNote.UNKNOWN}</div>
		<div>security: ${!security ? HTMLNote.UNKNOWN :
        modal('creep-resistance', '<strong>Security</strong><br><br>' +
            Object.keys(securitySettings).map((key) => `${key}: ${'' + securitySettings[key]}`).join('<br>'), hashMini(security))}</div>
		<div>mode: ${mode || HTMLNote.UNKNOWN}</div>
		<div>extension: ${!Object.keys(extensionHashPattern || {}).length ? HTMLNote.UNKNOWN :
        modal('creep-extension', '<strong>Pattern</strong><br><br>' +
            Object.keys(extensionHashPattern).map((key) => `${key}: ${'' + extensionHashPattern[key]}`).join('<br>'), (extension ? `${extensionIcon}${extension}` : hashMini(extensionHashPattern)))}</div>
	</div>
	`;
}

async function renderSamples(samples, { fp, styleSystemHash }) {
    if (!samples) {
        return;
    }
    const { window: windowSamples, math: mathSamples, error: errorSamples, html: htmlSamples, style: styleSamples, } = samples || {};
    const computeData = (hash, data) => {
        let systems = [];
        let poolTotal = 0;
        const metricTotal = Object.keys(data).reduce((acc, item) => acc += data[item].length, 0);
        const decryption = Object.keys(data).find((key) => data[key].find((item) => {
            if (!(item.id == hash)) {
                return false;
            }
            systems = item.systems;
            poolTotal = data[key].length;
            return true;
        }));
        return {
            systems,
            poolTotal,
            metricTotal,
            decryption,
        };
    };
    const decryptHash = (hash, data) => {
        const { systems, poolTotal, metricTotal, decryption } = computeData(hash, data);
        const getIcon = (name) => `<span class="icon ${name}"></span>`;
        const browserIcon = (!decryption ? '' :
            /edgios|edge/i.test(decryption) ? getIcon('edge') :
                /brave/i.test(decryption) ? getIcon('brave') :
                    /vivaldi/i.test(decryption) ? getIcon('vivaldi') :
                        /duckduckgo/i.test(decryption) ? getIcon('duckduckgo') :
                            /yandex/i.test(decryption) ? getIcon('yandex') :
                                /opera/i.test(decryption) ? getIcon('opera') :
                                    /crios|chrome/i.test(decryption) ? getIcon('chrome') :
                                        /tor browser/i.test(decryption) ? getIcon('tor') :
                                            /palemoon/i.test(decryption) ? getIcon('palemoon') :
                                                /fxios|firefox/i.test(decryption) ? getIcon('firefox') :
                                                    /safari/i.test(decryption) ? getIcon('safari') :
                                                        '');
        const icon = {
            blink: '<span class="icon blink"></span>',
            v8: '<span class="icon v8"></span>',
            webkit: '<span class="icon webkit"></span>',
            gecko: '<span class="icon gecko"></span>',
            goanna: '<span class="icon goanna"></span>',
            tor: '<span class="icon tor"></span>',
            firefox: '<span class="icon firefox"></span>',
            cros: '<span class="icon cros"></span>',
            linux: '<span class="icon linux"></span>',
            apple: '<span class="icon apple"></span>',
            windows: '<span class="icon windows"></span>',
            android: '<span class="icon android"></span>',
        };
        const engineIcon = (!decryption ? '' :
            /SpiderMonkey/.test(decryption) ? icon.firefox :
                /JavaScriptCore/.test(decryption) ? icon.webkit :
                    /V8/.test(decryption) ? icon.v8 :
                        '');
        const engineRendererIcon = (!decryption ? '' :
            /Gecko/.test(decryption) ? icon.gecko :
                /WebKit/.test(decryption) ? icon.webkit :
                    /Blink/.test(decryption) ? icon.blink :
                        /Goanna/.test(decryption) ? icon.goanna :
                            '');
        const systemIcon = ((!decryption || (systems.length != 1)) ? '' :
            /windows/i.test(systems[0]) ? icon.windows :
                /linux/i.test(systems[0]) ? icon.linux :
                    /ipad|iphone|ipod|ios|mac/i.test(systems[0]) ? icon.apple :
                        /android/i.test(systems[0]) ? icon.android :
                            /chrome os/i.test(systems[0]) ? icon.cros :
                                '');
        const formatPercent = (n) => n.toFixed(2).replace('.00', '');
        return {
            decryption: decryption || 'unknown',
            browserHTML: (!decryption ? undefined :
                `${browserIcon}${decryption}`),
            engineHTML: (!decryption ? undefined :
                `${engineIcon}${decryption}`),
            engineRendererHTML: (!decryption ? undefined :
                `${engineRendererIcon}${decryption}`),
            engineRendererSystemHTML: (!decryption ? undefined :
                `${engineRendererIcon}${systemIcon}${decryption}${systems.length != 1 ? '' : ` on ${systems[0]}`}`),
            engineSystem: (!decryption ? undefined :
                `${engineIcon}${systemIcon}${decryption}${systems.length != 1 ? '' : ` on ${systems[0]}`}`),
            uniqueMetric: !decryption ? '0' : formatPercent(1 / metricTotal * 100),
            uniqueEngine: !decryption ? '0' : formatPercent(1 / poolTotal * 100),
        };
    };
    const renderWindowSamples = (fp) => {
        const id = document.getElementById(`window-features-samples`);
        if (!fp.windowFeatures || !id) {
            return;
        }
        const { windowFeatures: { $hash } } = fp;
        const { browserHTML, uniqueEngine } = decryptHash($hash, windowSamples);
        return patch(id, html `
			<div>
				<style>
					.window-features-class-rating {
						background: linear-gradient(90deg, var(${uniqueEngine < 10 ? '--unique' : '--grey-glass'}) ${uniqueEngine}%, #fff0 ${uniqueEngine}%, #fff0 100%);
					}
				</style>
				<div class="window-features-class-rating">${uniqueEngine}% of ${browserHTML || HTMLNote.UNKNOWN}</div>
			</div>
		`);
    };
    const renderMathSamples = (fp) => {
        const id = document.getElementById(`math-samples`);
        if (!fp.maths || !id) {
            return;
        }
        const { maths: { $hash } } = fp;
        const { engineHTML, uniqueEngine } = decryptHash($hash, mathSamples);
        return patch(id, html `
			<div>
				<style>
					.math-class-rating {
						background: linear-gradient(90deg, var(${uniqueEngine < 10 ? '--unique' : '--grey-glass'}) ${uniqueEngine}%, #fff0 ${uniqueEngine}%, #fff0 100%);
					}
				</style>
				<div class="math-class-rating">${uniqueEngine}% of ${engineHTML || HTMLNote.UNKNOWN}</div>
			</div>
		`);
    };
    const renderErrorSamples = (fp) => {
        const id = document.getElementById(`error-samples`);
        if (!fp.consoleErrors || !id) {
            return;
        }
        const { consoleErrors: { $hash } } = fp;
        const { engineHTML, uniqueEngine } = decryptHash($hash, errorSamples);
        return patch(id, html `
			<div>
				<style>
					.console-errors-class-rating {
						background: linear-gradient(90deg, var(${uniqueEngine < 10 ? '--unique' : '--grey-glass'}) ${uniqueEngine}%, #fff0 ${uniqueEngine}%, #fff0 100%);
					}
				</style>
				<div class="console-errors-class-rating">${uniqueEngine}% of ${engineHTML || HTMLNote.UNKNOWN}</div>
			</div>
		`);
    };
    const renderHTMLElementSamples = (fp) => {
        const id = document.getElementById(`html-element-samples`);
        if (!fp.htmlElementVersion || !id) {
            return;
        }
        const { htmlElementVersion: { $hash } } = fp;
        const { engineRendererHTML, uniqueEngine } = decryptHash($hash, htmlSamples);
        return patch(id, html `
			<div>
				<style>
					.html-element-version-class-rating {
						background: linear-gradient(90deg, var(${uniqueEngine < 10 ? '--unique' : '--grey-glass'}) ${uniqueEngine}%, #fff0 ${uniqueEngine}%, #fff0 100%);
					}
				</style>
				<div class="html-element-version-class-rating">${uniqueEngine}% of ${engineRendererHTML || HTMLNote.UNKNOWN}</div>
			</div>
		`);
    };
    const renderSystemStylesSamples = (fp, styleSystemHash) => {
        const id = document.getElementById(`system-style-samples`);
        if (!fp.css || !id) {
            return;
        }
        const { engineRendererSystemHTML } = decryptHash(styleSystemHash, styleSamples);
        return patch(id, html `
			<div>
				<div>${engineRendererSystemHTML || HTMLNote.UNKNOWN}</div>
			</div>
		`);
    };
    renderWindowSamples(fp);
    renderMathSamples(fp);
    renderErrorSamples(fp);
    renderHTMLElementSamples(fp);
    renderSystemStylesSamples(fp, styleSystemHash);
    return;
}

async function getScreen(log = true) {
    try {
        const timer = createTimer();
        timer.start();
        let lied = (lieProps['Screen.width'] ||
            lieProps['Screen.height'] ||
            lieProps['Screen.availWidth'] ||
            lieProps['Screen.availHeight'] ||
            lieProps['Screen.colorDepth'] ||
            lieProps['Screen.pixelDepth']) || false;
        const s = (window.screen || {});
        const { width, height, availWidth, availHeight, colorDepth, pixelDepth, } = s;
        const dpr = window.devicePixelRatio || undefined;
        const firefoxWithHighDPR = IS_GECKO && (dpr != 1);
        if (!firefoxWithHighDPR) {
            // firefox with high dpr requires floating point precision dimensions
            const matchMediaLie = !matchMedia(`(device-width: ${s.width}px) and (device-height: ${s.height}px)`).matches;
            if (matchMediaLie) {
                lied = true;
                documentLie('Screen', 'failed matchMedia');
            }
        }
        const data = {
            width,
            height,
            availWidth,
            availHeight,
            colorDepth,
            pixelDepth,
            lied,
        };
        log && logTestResult({ time: timer.stop(), test: 'screen', passed: true });
        return Object.assign({}, data);
    }
    catch (error) {
        log && logTestResult({ test: 'screen', passed: false });
        captureError(error);
        return;
    }
}
function screenHTML(fp) {
    if (!fp.screen) {
        return `
		<div class="col-six undefined">
			<strong>Screen</strong>
			<div>...screen: ${HTMLNote.BLOCKED}</div>
			<div>....avail: ${HTMLNote.BLOCKED}</div>
			<div>depth: ${HTMLNote.BLOCKED}</div>
			<div>viewport: ${HTMLNote.BLOCKED}</div>
			<div class="screen-container"></div>
		</div>`;
    }
    const { screen: data, } = fp;
    const { $hash } = data || {};
    const perf = performanceLogger.getLog().screen;
    const paintScreen = (event) => {
        const el = document.getElementById('creep-resize');
        if (!el) {
            return;
        }
        removeEventListener('resize', paintScreen);
        return getScreen(false).then((data) => {
            requestAnimationFrame(() => patch(el, html `${resizeHTML(({ data, $hash, perf, paintScreen }))}`));
        });
    };
    const resizeHTML = ({ data, $hash, perf, paintScreen }) => {
        const { width, height, availWidth, availHeight, colorDepth, pixelDepth, lied, } = data;
        addEventListener('resize', paintScreen);
        const s = (window.screen || {});
        const { orientation } = s;
        const { type: orientationType } = orientation || {};
        const dpr = window.devicePixelRatio || undefined;
        const { width: vVWidth, height: vVHeight } = (window.visualViewport || {});
        const mediaOrientation = !window.matchMedia ? undefined : (matchMedia('(orientation: landscape)').matches ? 'landscape' :
            matchMedia('(orientation: portrait)').matches ? 'portrait' : undefined);
        const displayMode = !window.matchMedia ? undefined : (matchMedia('(display-mode: fullscreen)').matches ? 'fullscreen' :
            matchMedia('(display-mode: standalone)').matches ? 'standalone' :
                matchMedia('(display-mode: minimal-ui)').matches ? 'minimal-ui' :
                    matchMedia('(display-mode: browser)').matches ? 'browser' : undefined);
        const getDeviceDimensions = (width, height, diameter = 180) => {
            const aspectRatio = width / height;
            const isPortrait = height > width;
            const deviceWidth = isPortrait ? diameter * aspectRatio : diameter;
            const deviceHeight = isPortrait ? diameter : diameter / aspectRatio;
            return { deviceWidth, deviceHeight };
        };
        // const { deviceWidth, deviceHeight } = getDeviceDimensions(width, height)
        const { deviceWidth: deviceInnerWidth, deviceHeight: deviceInnerHeight } = getDeviceDimensions(innerWidth, innerHeight);
        const toFix = (n, nFix) => {
            const d = +(1 + [...Array(nFix)].map((x) => 0).join(''));
            return Math.round(n * d) / d;
        };
        const viewportTitle = `Window.outerWidth\nWindow.outerHeight\nWindow.innerWidth\nWindow.innerHeight\nVisualViewport.width\nVisualViewport.height\nWindow.matchMedia()\nScreenOrientation.type\nWindow.devicePixelRatio`;
        return `
			<div id="creep-resize" class="relative col-six${lied ? ' rejected' : ''}">
				<span class="time">${perf}</span>
				<strong>Screen</strong><span class="${lied ? 'lies ' : ''}hash">${hashSlice($hash)}</span>
				<div class="help" title="Screen.width\nScreen.height">...screen: ${width} x ${height}</div>
				<div class="help" title="Screen.availWidth\nScreen.availHeight">....avail: ${availWidth} x ${availHeight}</div>
				<div class="help" title="Screen.colorDepth\nScreen.pixelDepth">depth: ${colorDepth}|${pixelDepth}</div>
				<div class="help" title="${viewportTitle}">viewport:</div>
				<div class="screen-container relative help" title="${viewportTitle}">
					<style>
						.screen-frame { width:${deviceInnerWidth}px;height:${deviceInnerHeight}px; }
						.screen-outer-w,
						.screen-outer-h,
						.screen-inner-w,
						.screen-inner-h,
						.screen-visual-w,
						.screen-visual-h,
						.screen-display-mode,
						.screen-media-orientation,
						.screen-orientation-type,
						.screen-dpr {
							position: absolute;
							font-size: 12px !important;
							border-radius: 3px;
							padding: 0 3px;
							margin: 3px 0;
							z-index: 1;
						}
						.screen-outer-w,
						.screen-inner-w,
						.screen-visual-w,
						.screen-display-mode,
						.screen-media-orientation,
						.screen-orientation-type,
						.screen-dpr, {
							text-align: center;
						}
						.screen-outer-h,
						.screen-inner-h,
						.screen-visual-h,
						.screen-display-mode,
						.screen-media-orientation,
						.screen-orientation-type,
						.screen-dpr {
							line-height: 216px; /* this is derived from the container height*/
						}
						.screen-outer-h,
						.screen-inner-h,
						.screen-visual-h {
							left: 0;
						}
						.screen-outer-w,
						.screen-outer-h {
							top: -29px;
						}
						.screen-inner-w,
						.screen-inner-h {
							top: -17px;
						}
						.screen-visual-w,
						.screen-visual-h {
							top: -5px;
						}

						.screen-display-mode {
							top: -31px;
						}
						.screen-media-orientation {
							top: -19px;
						}
						.screen-orientation-type {
							top: -7px;
						}
						.screen-dpr {
							top: 5px;
						}

					</style>
					<span class="screen-outer-w">${outerWidth}</span>
					<span class="screen-inner-w">${innerWidth}</span>
					<span class="screen-visual-w">${toFix(vVWidth, 6)}</span>
					<span class="screen-outer-h">${outerHeight}</span>
					<span class="screen-inner-h">${innerHeight}</span>
					<span class="screen-visual-h">${toFix(vVHeight, 6)}</span>
					<span class="screen-display-mode">${displayMode}</span>
					<span class="screen-media-orientation">${mediaOrientation}</span>
					<span class="screen-orientation-type">${orientationType}</span>
					<span class="screen-dpr">${dpr}</span>
					<div class="screen-frame relative">
						<div class="screen-glass"></div>
					</div>
				</div>
			</div>
			`;
    };
    return `
	${resizeHTML({ data, $hash, perf, paintScreen })}
	`;
}

async function getVoices() {
    return new Promise(async (resolve) => {
        try {
            const timer = createTimer();
            await queueEvent(timer);
            // use window since iframe is unstable in FF
            const supported = 'speechSynthesis' in window;
            supported && speechSynthesis.getVoices(); // warm up
            if (!supported) {
                logTestResult({ test: 'speech', passed: false });
                return resolve(null);
            }
            const voicesLie = !!lieProps['SpeechSynthesis.getVoices'];
            const giveUpOnVoices = setTimeout(() => {
                logTestResult({ test: 'speech', passed: false });
                return resolve(null);
            }, 3000);
            const getVoices = () => {
                const data = speechSynthesis.getVoices();
                const localServiceDidLoad = (data || []).find((x) => x.localService);
                if (!data || !data.length || (IS_BLINK && !localServiceDidLoad)) {
                    return;
                }
                clearTimeout(giveUpOnVoices);
                const filterFirstOccurrenceOfUniqueVoiceURIData = ({ data, voiceURISet }) => data
                    .filter((x) => {
                    const { voiceURI } = x;
                    if (!voiceURISet.has(voiceURI)) {
                        voiceURISet.add(voiceURI);
                        return true;
                    }
                    return false;
                });
                const dataUnique = filterFirstOccurrenceOfUniqueVoiceURIData({
                    data,
                    voiceURISet: new Set(),
                });
                // https://wicg.github.io/speech-api/#speechsynthesisvoice-attributes
                const local = dataUnique.filter((x) => x.localService).map((x) => x.name);
                const remote = dataUnique.filter((x) => !x.localService).map((x) => x.name);
                const languages = [...new Set(dataUnique.map((x) => x.lang))];
                const defaults = dataUnique.filter((x) => x.default).map((x) => x.name);
                logTestResult({ time: timer.stop(), test: 'speech', passed: true });
                return resolve({
                    local,
                    remote,
                    languages,
                    defaults,
                    lied: voicesLie,
                });
            };
            getVoices();
            if (speechSynthesis.addEventListener) {
                return speechSynthesis.addEventListener('voiceschanged', getVoices);
            }
            speechSynthesis.onvoiceschanged = getVoices;
        }
        catch (error) {
            logTestResult({ test: 'speech', passed: false });
            captureError(error);
            return resolve(null);
        }
    });
}
function voicesHTML(fp) {
    if (!fp.voices) {
        return `
		<div class="col-four undefined">
			<strong>Speech</strong>
			<div>local (0): ${HTMLNote.BLOCKED}</div>
			<div>remote (0): ${HTMLNote.BLOCKED}</div>
			<div>lang (0): ${HTMLNote.BLOCKED}</div>
			<div>default (0):</div>
			<div class="block-text">${HTMLNote.BLOCKED}</div>
		</div>`;
    }
    const { voices: { $hash, local, remote, languages, defaults, lied, }, } = fp;
    const icon = {
        'Linux': '<span class="icon linux"></span>',
        'Apple': '<span class="icon apple"></span>',
        'Windows': '<span class="icon windows"></span>',
        'Android': '<span class="icon android"></span>',
        'CrOS': '<span class="icon cros"></span>',
    };
    const system = {
        'Chrome OS': icon.CrOS,
        'Maged': icon.Apple,
        'Microsoft': icon.Windows,
        'English United States': icon.Android,
        'English (United States)': icon.Android,
    };
    const systemVoice = Object.keys(system).find((key) => local.find((voice) => voice.includes(key)));
    return `
	<div class="relative col-four${lied ? ' rejected' : ''}">
		<span class="aside-note">${performanceLogger.getLog().speech}</span>
		<strong>Speech</strong><span class="${lied ? 'lies ' : ''}hash">${hashSlice($hash)}</span>
		<div class="help" title="SpeechSynthesis.getVoices()\nSpeechSynthesisVoice.localService">local (${count(local)}): ${!local || !local.length ? HTMLNote.UNSUPPORTED :
        modal('creep-voices-local', local.join('<br>'), `${system[systemVoice] || ''}${hashMini(local)}`)}</div>
		<div class="help" title="SpeechSynthesis.getVoices()">remote (${count(remote)}): ${!remote || !remote.length ? HTMLNote.UNSUPPORTED :
        modal('creep-voices-remote', remote.join('<br>'), hashMini(remote))}</div>
		<div class="help" title="SpeechSynthesis.getVoices()\nSpeechSynthesisVoice.lang">lang (${count(languages)}): ${!languages || !languages.length ? HTMLNote.BLOCKED :
        languages.length == 1 ? languages[0] : modal('creep-voices-languages', languages.join('<br>'), hashMini(languages))}</div>
		<div class="help" title="SpeechSynthesis.getVoices()\nSpeechSynthesisVoice.default">default (${count(defaults)}):</div>
		<div class="block-text">
			${!defaults || !defaults.length ? HTMLNote.UNSUPPORTED :
        defaults.length == 1 ? defaults[0] : modal('creep-voices-defaults', defaults.join('<br>'), hashMini(defaults))}
		</div>
	</div>
	`;
}

async function getSVG() {
    try {
        const timer = createTimer();
        await queueEvent(timer);
        const lied = (lieProps['SVGRect.height'] ||
            lieProps['SVGRect.width'] ||
            lieProps['SVGRect.x'] ||
            lieProps['SVGRect.y'] ||
            lieProps['String.fromCodePoint']) || false;
        const doc = (PHANTOM_DARKNESS &&
            PHANTOM_DARKNESS.document &&
            PHANTOM_DARKNESS.document.body ? PHANTOM_DARKNESS.document :
            document);
        const divElement = document.createElement('div');
        doc.body.appendChild(divElement);
        // patch div
        patch(divElement, html `
			<div id="svg-container">
				<style>
				#svg-container {
					position: absolute;
					left: -9999px;
					height: auto;
				}
				.svgrect-emoji {
					font-family: ${CSS_FONT_FAMILY};
					font-size: 200px !important;
					height: auto;
					position: absolute !important;
					transform: scale(1.000999);
				}
				</style>
				<svg>
					<g id="svgBox">
						${EMOJIS.map((emoji) => {
            return `<text x="32" y="32" class="svgrect-emoji">${emoji}</text>`;
        })}
					</g>
				</svg>
			</div>
		`);
        // SVG
        const reduceToObject = (nativeObj) => {
            const keys = Object.keys(nativeObj.__proto__);
            return keys.reduce((acc, key) => {
                const val = nativeObj[key];
                const isMethod = typeof val == 'function';
                return isMethod ? acc : Object.assign(Object.assign({}, acc), { [key]: val });
            }, {});
        };
        const reduceToSum = (nativeObj) => {
            const keys = Object.keys(nativeObj.__proto__);
            return keys.reduce((acc, key) => {
                const val = nativeObj[key];
                return isNaN(val) ? acc : (acc += val);
            }, 0);
        };
        const getObjectSum = (obj) => !obj ? 0 : Object.keys(obj).reduce((acc, key) => acc += Math.abs(obj[key]), 0);
        // SVGRect
        const svgBox = doc.getElementById('svgBox');
        const bBox = reduceToObject(svgBox.getBBox());
        // compute SVGRect emojis
        const pattern = new Set();
        const svgElems = [...svgBox.getElementsByClassName('svgrect-emoji')];
        await queueEvent(timer);
        const emojiSet = svgElems.reduce((emojiSet, el, i) => {
            const emoji = EMOJIS[i];
            const dimensions = '' + el.getComputedTextLength();
            if (!pattern.has(dimensions)) {
                pattern.add(dimensions);
                emojiSet.add(emoji);
            }
            return emojiSet;
        }, new Set());
        // svgRect System Sum
        const svgrectSystemSum = 0.00001 * [...pattern].map((x) => {
            return x.split(',').reduce((acc, x) => acc += (+x || 0), 0);
        }).reduce((acc, x) => acc += x, 0);
        const data = {
            bBox: getObjectSum(bBox),
            extentOfChar: reduceToSum(svgElems[0].getExtentOfChar(EMOJIS[0])),
            subStringLength: svgElems[0].getSubStringLength(0, 10),
            computedTextLength: svgElems[0].getComputedTextLength(),
            emojiSet: [...emojiSet],
            svgrectSystemSum,
            lied,
        };
        doc.body.removeChild(doc.getElementById('svg-container'));
        logTestResult({ time: timer.stop(), test: 'svg', passed: true });
        return data;
    }
    catch (error) {
        logTestResult({ test: 'svg', passed: false });
        captureError(error);
        return;
    }
}
function svgHTML(fp) {
    if (!fp.svg) {
        return `
		<div class="col-six undefined">
			<strong>SVGRect</strong>
			<div>bBox: ${HTMLNote.BLOCKED}</div>
			<div>char: ${HTMLNote.BLOCKED}</div>
			<div>subs: ${HTMLNote.BLOCKED}</div>
			<div>text: ${HTMLNote.BLOCKED}</div>
			<div class="block-text">${HTMLNote.BLOCKED}</div>
		</div>`;
    }
    const { svg: { $hash, bBox, subStringLength, extentOfChar, computedTextLength, emojiSet, svgrectSystemSum, lied, }, } = fp;
    const divisor = 10000;
    const helpTitle = `SVGTextContentElement.getComputedTextLength()\nhash: ${hashMini(emojiSet)}\n${emojiSet.map((x, i) => i && (i % 6 == 0) ? `${x}\n` : x).join('')}`;
    return `
	<div class="relative col-six${lied ? ' rejected' : ''}">
		<span class="aside-note">${performanceLogger.getLog().svg}</span>
		<strong>SVGRect</strong><span class="${lied ? 'lies ' : ''}hash">${hashSlice($hash)}</span>
		<div class="help" title="SVGGraphicsElement.getBBox()">bBox: ${bBox ? (bBox / divisor) : HTMLNote.BLOCKED}</div>
		<div class="help" title="SVGTextContentElement.getExtentOfChar()">char: ${extentOfChar ? (extentOfChar / divisor) : HTMLNote.BLOCKED}</div>
		<div class="help" title="SVGTextContentElement.getSubStringLength()">subs: ${subStringLength ? (subStringLength / divisor) : HTMLNote.BLOCKED}</div>
		<div class="help" title="SVGTextContentElement.getComputedTextLength()">text: ${computedTextLength ? (computedTextLength / divisor) : HTMLNote.BLOCKED}</div>
		<div class="block-text help relative" title="${helpTitle}">
			<span>${svgrectSystemSum || HTMLNote.UNSUPPORTED}</span>
			<span class="grey jumbo" style="font-family: ${CSS_FONT_FAMILY}">${formatEmojiSet(emojiSet)}</span>
		</div>
	</div>
	`;
}

function getTimezone() {
    // inspired by https://arkenfox.github.io/TZP
    // https://github.com/vvo/tzdb/blob/master/time-zones-names.json
    const cities = [
        'UTC',
        'GMT',
        'Etc/GMT+0',
        'Etc/GMT+1',
        'Etc/GMT+10',
        'Etc/GMT+11',
        'Etc/GMT+12',
        'Etc/GMT+2',
        'Etc/GMT+3',
        'Etc/GMT+4',
        'Etc/GMT+5',
        'Etc/GMT+6',
        'Etc/GMT+7',
        'Etc/GMT+8',
        'Etc/GMT+9',
        'Etc/GMT-1',
        'Etc/GMT-10',
        'Etc/GMT-11',
        'Etc/GMT-12',
        'Etc/GMT-13',
        'Etc/GMT-14',
        'Etc/GMT-2',
        'Etc/GMT-3',
        'Etc/GMT-4',
        'Etc/GMT-5',
        'Etc/GMT-6',
        'Etc/GMT-7',
        'Etc/GMT-8',
        'Etc/GMT-9',
        'Etc/GMT',
        'Africa/Abidjan',
        'Africa/Accra',
        'Africa/Addis_Ababa',
        'Africa/Algiers',
        'Africa/Asmara',
        'Africa/Bamako',
        'Africa/Bangui',
        'Africa/Banjul',
        'Africa/Bissau',
        'Africa/Blantyre',
        'Africa/Brazzaville',
        'Africa/Bujumbura',
        'Africa/Cairo',
        'Africa/Casablanca',
        'Africa/Ceuta',
        'Africa/Conakry',
        'Africa/Dakar',
        'Africa/Dar_es_Salaam',
        'Africa/Djibouti',
        'Africa/Douala',
        'Africa/El_Aaiun',
        'Africa/Freetown',
        'Africa/Gaborone',
        'Africa/Harare',
        'Africa/Johannesburg',
        'Africa/Juba',
        'Africa/Kampala',
        'Africa/Khartoum',
        'Africa/Kigali',
        'Africa/Kinshasa',
        'Africa/Lagos',
        'Africa/Libreville',
        'Africa/Lome',
        'Africa/Luanda',
        'Africa/Lubumbashi',
        'Africa/Lusaka',
        'Africa/Malabo',
        'Africa/Maputo',
        'Africa/Maseru',
        'Africa/Mbabane',
        'Africa/Mogadishu',
        'Africa/Monrovia',
        'Africa/Nairobi',
        'Africa/Ndjamena',
        'Africa/Niamey',
        'Africa/Nouakchott',
        'Africa/Ouagadougou',
        'Africa/Porto-Novo',
        'Africa/Sao_Tome',
        'Africa/Tripoli',
        'Africa/Tunis',
        'Africa/Windhoek',
        'America/Adak',
        'America/Anchorage',
        'America/Anguilla',
        'America/Antigua',
        'America/Araguaina',
        'America/Argentina/Buenos_Aires',
        'America/Argentina/Catamarca',
        'America/Argentina/Cordoba',
        'America/Argentina/Jujuy',
        'America/Argentina/La_Rioja',
        'America/Argentina/Mendoza',
        'America/Argentina/Rio_Gallegos',
        'America/Argentina/Salta',
        'America/Argentina/San_Juan',
        'America/Argentina/San_Luis',
        'America/Argentina/Tucuman',
        'America/Argentina/Ushuaia',
        'America/Aruba',
        'America/Asuncion',
        'America/Atikokan',
        'America/Bahia',
        'America/Bahia_Banderas',
        'America/Barbados',
        'America/Belem',
        'America/Belize',
        'America/Blanc-Sablon',
        'America/Boa_Vista',
        'America/Bogota',
        'America/Boise',
        'America/Cambridge_Bay',
        'America/Campo_Grande',
        'America/Cancun',
        'America/Caracas',
        'America/Cayenne',
        'America/Cayman',
        'America/Chicago',
        'America/Chihuahua',
        'America/Costa_Rica',
        'America/Creston',
        'America/Cuiaba',
        'America/Curacao',
        'America/Danmarkshavn',
        'America/Dawson',
        'America/Dawson_Creek',
        'America/Denver',
        'America/Detroit',
        'America/Dominica',
        'America/Edmonton',
        'America/Eirunepe',
        'America/El_Salvador',
        'America/Fort_Nelson',
        'America/Fortaleza',
        'America/Glace_Bay',
        'America/Godthab',
        'America/Goose_Bay',
        'America/Grand_Turk',
        'America/Grenada',
        'America/Guadeloupe',
        'America/Guatemala',
        'America/Guayaquil',
        'America/Guyana',
        'America/Halifax',
        'America/Havana',
        'America/Hermosillo',
        'America/Indiana/Indianapolis',
        'America/Indiana/Knox',
        'America/Indiana/Marengo',
        'America/Indiana/Petersburg',
        'America/Indiana/Tell_City',
        'America/Indiana/Vevay',
        'America/Indiana/Vincennes',
        'America/Indiana/Winamac',
        'America/Inuvik',
        'America/Iqaluit',
        'America/Jamaica',
        'America/Juneau',
        'America/Kentucky/Louisville',
        'America/Kentucky/Monticello',
        'America/Kralendijk',
        'America/La_Paz',
        'America/Lima',
        'America/Los_Angeles',
        'America/Lower_Princes',
        'America/Maceio',
        'America/Managua',
        'America/Manaus',
        'America/Marigot',
        'America/Martinique',
        'America/Matamoros',
        'America/Mazatlan',
        'America/Menominee',
        'America/Merida',
        'America/Metlakatla',
        'America/Mexico_City',
        'America/Miquelon',
        'America/Moncton',
        'America/Monterrey',
        'America/Montevideo',
        'America/Montserrat',
        'America/Nassau',
        'America/New_York',
        'America/Nipigon',
        'America/Nome',
        'America/Noronha',
        'America/North_Dakota/Beulah',
        'America/North_Dakota/Center',
        'America/North_Dakota/New_Salem',
        'America/Ojinaga',
        'America/Panama',
        'America/Pangnirtung',
        'America/Paramaribo',
        'America/Phoenix',
        'America/Port-au-Prince',
        'America/Port_of_Spain',
        'America/Porto_Velho',
        'America/Puerto_Rico',
        'America/Punta_Arenas',
        'America/Rainy_River',
        'America/Rankin_Inlet',
        'America/Recife',
        'America/Regina',
        'America/Resolute',
        'America/Rio_Branco',
        'America/Santarem',
        'America/Santiago',
        'America/Santo_Domingo',
        'America/Sao_Paulo',
        'America/Scoresbysund',
        'America/Sitka',
        'America/St_Barthelemy',
        'America/St_Johns',
        'America/St_Kitts',
        'America/St_Lucia',
        'America/St_Thomas',
        'America/St_Vincent',
        'America/Swift_Current',
        'America/Tegucigalpa',
        'America/Thule',
        'America/Thunder_Bay',
        'America/Tijuana',
        'America/Toronto',
        'America/Tortola',
        'America/Vancouver',
        'America/Whitehorse',
        'America/Winnipeg',
        'America/Yakutat',
        'America/Yellowknife',
        'Antarctica/Casey',
        'Antarctica/Davis',
        'Antarctica/DumontDUrville',
        'Antarctica/Macquarie',
        'Antarctica/Mawson',
        'Antarctica/McMurdo',
        'Antarctica/Palmer',
        'Antarctica/Rothera',
        'Antarctica/Syowa',
        'Antarctica/Troll',
        'Antarctica/Vostok',
        'Arctic/Longyearbyen',
        'Asia/Aden',
        'Asia/Almaty',
        'Asia/Amman',
        'Asia/Anadyr',
        'Asia/Aqtau',
        'Asia/Aqtobe',
        'Asia/Ashgabat',
        'Asia/Atyrau',
        'Asia/Baghdad',
        'Asia/Bahrain',
        'Asia/Baku',
        'Asia/Bangkok',
        'Asia/Barnaul',
        'Asia/Beirut',
        'Asia/Bishkek',
        'Asia/Brunei',
        'Asia/Calcutta',
        'Asia/Chita',
        'Asia/Choibalsan',
        'Asia/Colombo',
        'Asia/Damascus',
        'Asia/Dhaka',
        'Asia/Dili',
        'Asia/Dubai',
        'Asia/Dushanbe',
        'Asia/Famagusta',
        'Asia/Gaza',
        'Asia/Hebron',
        'Asia/Ho_Chi_Minh',
        'Asia/Hong_Kong',
        'Asia/Hovd',
        'Asia/Irkutsk',
        'Asia/Jakarta',
        'Asia/Jayapura',
        'Asia/Jerusalem',
        'Asia/Kabul',
        'Asia/Kamchatka',
        'Asia/Karachi',
        'Asia/Kathmandu',
        'Asia/Khandyga',
        'Asia/Kolkata',
        'Asia/Krasnoyarsk',
        'Asia/Kuala_Lumpur',
        'Asia/Kuching',
        'Asia/Kuwait',
        'Asia/Macau',
        'Asia/Magadan',
        'Asia/Makassar',
        'Asia/Manila',
        'Asia/Muscat',
        'Asia/Nicosia',
        'Asia/Novokuznetsk',
        'Asia/Novosibirsk',
        'Asia/Omsk',
        'Asia/Oral',
        'Asia/Phnom_Penh',
        'Asia/Pontianak',
        'Asia/Pyongyang',
        'Asia/Qatar',
        'Asia/Qostanay',
        'Asia/Qyzylorda',
        'Asia/Riyadh',
        'Asia/Sakhalin',
        'Asia/Samarkand',
        'Asia/Seoul',
        'Asia/Shanghai',
        'Asia/Singapore',
        'Asia/Srednekolymsk',
        'Asia/Taipei',
        'Asia/Tashkent',
        'Asia/Tbilisi',
        'Asia/Tehran',
        'Asia/Thimphu',
        'Asia/Tokyo',
        'Asia/Tomsk',
        'Asia/Ulaanbaatar',
        'Asia/Urumqi',
        'Asia/Ust-Nera',
        'Asia/Vientiane',
        'Asia/Vladivostok',
        'Asia/Yakutsk',
        'Asia/Yangon',
        'Asia/Yekaterinburg',
        'Asia/Yerevan',
        'Atlantic/Azores',
        'Atlantic/Bermuda',
        'Atlantic/Canary',
        'Atlantic/Cape_Verde',
        'Atlantic/Faroe',
        'Atlantic/Madeira',
        'Atlantic/Reykjavik',
        'Atlantic/South_Georgia',
        'Atlantic/St_Helena',
        'Atlantic/Stanley',
        'Australia/Adelaide',
        'Australia/Brisbane',
        'Australia/Broken_Hill',
        'Australia/Currie',
        'Australia/Darwin',
        'Australia/Eucla',
        'Australia/Hobart',
        'Australia/Lindeman',
        'Australia/Lord_Howe',
        'Australia/Melbourne',
        'Australia/Perth',
        'Australia/Sydney',
        'Europe/Amsterdam',
        'Europe/Andorra',
        'Europe/Astrakhan',
        'Europe/Athens',
        'Europe/Belgrade',
        'Europe/Berlin',
        'Europe/Bratislava',
        'Europe/Brussels',
        'Europe/Bucharest',
        'Europe/Budapest',
        'Europe/Busingen',
        'Europe/Chisinau',
        'Europe/Copenhagen',
        'Europe/Dublin',
        'Europe/Gibraltar',
        'Europe/Guernsey',
        'Europe/Helsinki',
        'Europe/Isle_of_Man',
        'Europe/Istanbul',
        'Europe/Jersey',
        'Europe/Kaliningrad',
        'Europe/Kiev',
        'Europe/Kirov',
        'Europe/Lisbon',
        'Europe/Ljubljana',
        'Europe/London',
        'Europe/Luxembourg',
        'Europe/Madrid',
        'Europe/Malta',
        'Europe/Mariehamn',
        'Europe/Minsk',
        'Europe/Monaco',
        'Europe/Moscow',
        'Europe/Oslo',
        'Europe/Paris',
        'Europe/Podgorica',
        'Europe/Prague',
        'Europe/Riga',
        'Europe/Rome',
        'Europe/Samara',
        'Europe/San_Marino',
        'Europe/Sarajevo',
        'Europe/Saratov',
        'Europe/Simferopol',
        'Europe/Skopje',
        'Europe/Sofia',
        'Europe/Stockholm',
        'Europe/Tallinn',
        'Europe/Tirane',
        'Europe/Ulyanovsk',
        'Europe/Uzhgorod',
        'Europe/Vaduz',
        'Europe/Vatican',
        'Europe/Vienna',
        'Europe/Vilnius',
        'Europe/Volgograd',
        'Europe/Warsaw',
        'Europe/Zagreb',
        'Europe/Zaporozhye',
        'Europe/Zurich',
        'Indian/Antananarivo',
        'Indian/Chagos',
        'Indian/Christmas',
        'Indian/Cocos',
        'Indian/Comoro',
        'Indian/Kerguelen',
        'Indian/Mahe',
        'Indian/Maldives',
        'Indian/Mauritius',
        'Indian/Mayotte',
        'Indian/Reunion',
        'Pacific/Apia',
        'Pacific/Auckland',
        'Pacific/Bougainville',
        'Pacific/Chatham',
        'Pacific/Chuuk',
        'Pacific/Easter',
        'Pacific/Efate',
        'Pacific/Enderbury',
        'Pacific/Fakaofo',
        'Pacific/Fiji',
        'Pacific/Funafuti',
        'Pacific/Galapagos',
        'Pacific/Gambier',
        'Pacific/Guadalcanal',
        'Pacific/Guam',
        'Pacific/Honolulu',
        'Pacific/Kiritimati',
        'Pacific/Kosrae',
        'Pacific/Kwajalein',
        'Pacific/Majuro',
        'Pacific/Marquesas',
        'Pacific/Midway',
        'Pacific/Nauru',
        'Pacific/Niue',
        'Pacific/Norfolk',
        'Pacific/Noumea',
        'Pacific/Pago_Pago',
        'Pacific/Palau',
        'Pacific/Pitcairn',
        'Pacific/Pohnpei',
        'Pacific/Port_Moresby',
        'Pacific/Rarotonga',
        'Pacific/Saipan',
        'Pacific/Tahiti',
        'Pacific/Tarawa',
        'Pacific/Tongatapu',
        'Pacific/Wake',
        'Pacific/Wallis',
    ];
    const getTimezoneOffset = () => {
        const [year, month, day] = JSON.stringify(new Date())
            .slice(1, 11)
            .split('-');
        const dateString = `${month}/${day}/${year}`;
        const dateStringUTC = `${year}-${month}-${day}`;
        const now = +new Date(dateString);
        const utc = +new Date(dateStringUTC);
        const offset = +((now - utc) / 60000);
        return ~~offset;
    };
    const getTimezoneOffsetHistory = ({ year, city = null }) => {
        const format = {
            timeZone: '',
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
        };
        const minute = 60000;
        let formatter;
        let summer;
        if (city) {
            const options = Object.assign(Object.assign({}, format), { timeZone: city });
            // @ts-ignore
            formatter = new Intl.DateTimeFormat('en', options);
            summer = +new Date(formatter.format(new Date(`7/1/${year}`)));
        }
        else {
            summer = +new Date(`7/1/${year}`);
        }
        const summerUTCTime = +new Date(`${year}-07-01`);
        const offset = (summer - summerUTCTime) / minute;
        return offset;
    };
    const binarySearch = (list, fn) => {
        const end = list.length;
        const middle = Math.floor(end / 2);
        const [left, right] = [list.slice(0, middle), list.slice(middle, end)];
        const found = fn(left);
        return end == 1 || found.length ? found : binarySearch(right, fn);
    };
    const decryptLocation = ({ year, timeZone }) => {
        const system = getTimezoneOffsetHistory({ year });
        const resolvedOptions = getTimezoneOffsetHistory({ year, city: timeZone });
        const filter = (cities) => cities
            .filter((city) => system == getTimezoneOffsetHistory({ year, city }));
        // get city region set
        const decryption = (system == resolvedOptions ? [timeZone] : binarySearch(cities, filter));
        // reduce set to one city
        const decrypted = (decryption.length == 1 && decryption[0] == timeZone ? timeZone : hashMini(decryption));
        return decrypted;
    };
    const formatLocation = (x) => {
        try {
            return x.replace(/_/, ' ').split('/').join(', ');
        }
        catch (error) { }
        return x;
    };
    try {
        const timer = createTimer();
        timer.start();
        const lied = (lieProps['Date.getTimezoneOffset'] ||
            lieProps['Intl.DateTimeFormat.resolvedOptions'] ||
            lieProps['Intl.RelativeTimeFormat.resolvedOptions']) || false;
        const year = 1113;
        // eslint-disable-next-line new-cap
        const { timeZone } = Intl.DateTimeFormat().resolvedOptions();
        const decrypted = decryptLocation({ year, timeZone });
        const locationEpoch = +new Date(new Date(`7/1/${year}`));
        const notWithinParentheses = /.*\(|\).*/g;
        const data = {
            zone: ('' + new Date()).replace(notWithinParentheses, ''),
            location: formatLocation(timeZone),
            locationMeasured: formatLocation(decrypted),
            locationEpoch,
            offset: new Date().getTimezoneOffset(),
            offsetComputed: getTimezoneOffset(),
            lied,
        };
        logTestResult({ time: timer.stop(), test: 'timezone', passed: true });
        return Object.assign({}, data);
    }
    catch (error) {
        logTestResult({ test: 'timezone', passed: false });
        captureError(error);
        return;
    }
}
function timezoneHTML(fp) {
    if (!fp.timezone) {
        return `
		<div class="col-six undefined">
			<strong>Timezone</strong>
			<div class="block-text">${HTMLNote.BLOCKED}</div>
		</div>`;
    }
    const { timezone: { $hash, zone, location, locationMeasured, locationEpoch, offset, offsetComputed, lied, }, } = fp;
    return `
	<div class="relative col-six${lied ? ' rejected' : ''}">
		<span class="aside-note">${performanceLogger.getLog().timezone}</span>
		<strong>Timezone</strong><span class="${lied ? 'lies ' : ''}hash">${hashSlice($hash)}</span>
		<div class="block-text help"  title="Date\nDate.getTimezoneOffset\nIntl.DateTimeFormat">
			${zone ? zone : ''}
			<br>${location != locationMeasured ? locationMeasured : location}
			<br>${locationEpoch}
			<br>${offset != offsetComputed ? offsetComputed : offset}
		</div>
	</div>
	`;
}

async function getCanvasWebgl() {
    // use short list to improve performance
    const getParamNames = () => [
        // 'BLEND_EQUATION',
        // 'BLEND_EQUATION_RGB',
        // 'BLEND_EQUATION_ALPHA',
        // 'BLEND_DST_RGB',
        // 'BLEND_SRC_RGB',
        // 'BLEND_DST_ALPHA',
        // 'BLEND_SRC_ALPHA',
        // 'BLEND_COLOR',
        // 'CULL_FACE',
        // 'BLEND',
        // 'DITHER',
        // 'STENCIL_TEST',
        // 'DEPTH_TEST',
        // 'SCISSOR_TEST',
        // 'POLYGON_OFFSET_FILL',
        // 'SAMPLE_ALPHA_TO_COVERAGE',
        // 'SAMPLE_COVERAGE',
        // 'LINE_WIDTH',
        'ALIASED_POINT_SIZE_RANGE',
        'ALIASED_LINE_WIDTH_RANGE',
        // 'CULL_FACE_MODE',
        // 'FRONT_FACE',
        // 'DEPTH_RANGE',
        // 'DEPTH_WRITEMASK',
        // 'DEPTH_CLEAR_VALUE',
        // 'DEPTH_FUNC',
        // 'STENCIL_CLEAR_VALUE',
        // 'STENCIL_FUNC',
        // 'STENCIL_FAIL',
        // 'STENCIL_PASS_DEPTH_FAIL',
        // 'STENCIL_PASS_DEPTH_PASS',
        // 'STENCIL_REF',
        'STENCIL_VALUE_MASK',
        'STENCIL_WRITEMASK',
        // 'STENCIL_BACK_FUNC',
        // 'STENCIL_BACK_FAIL',
        // 'STENCIL_BACK_PASS_DEPTH_FAIL',
        // 'STENCIL_BACK_PASS_DEPTH_PASS',
        // 'STENCIL_BACK_REF',
        'STENCIL_BACK_VALUE_MASK',
        'STENCIL_BACK_WRITEMASK',
        // 'VIEWPORT',
        // 'SCISSOR_BOX',
        // 'COLOR_CLEAR_VALUE',
        // 'COLOR_WRITEMASK',
        // 'UNPACK_ALIGNMENT',
        // 'PACK_ALIGNMENT',
        'MAX_TEXTURE_SIZE',
        'MAX_VIEWPORT_DIMS',
        'SUBPIXEL_BITS',
        // 'RED_BITS',
        // 'GREEN_BITS',
        // 'BLUE_BITS',
        // 'ALPHA_BITS',
        // 'DEPTH_BITS',
        // 'STENCIL_BITS',
        // 'POLYGON_OFFSET_UNITS',
        // 'POLYGON_OFFSET_FACTOR',
        // 'SAMPLE_BUFFERS',
        // 'SAMPLES',
        // 'SAMPLE_COVERAGE_VALUE',
        // 'SAMPLE_COVERAGE_INVERT',
        // 'COMPRESSED_TEXTURE_FORMATS',
        // 'GENERATE_MIPMAP_HINT',
        'MAX_VERTEX_ATTRIBS',
        'MAX_VERTEX_UNIFORM_VECTORS',
        'MAX_VARYING_VECTORS',
        'MAX_COMBINED_TEXTURE_IMAGE_UNITS',
        'MAX_VERTEX_TEXTURE_IMAGE_UNITS',
        'MAX_TEXTURE_IMAGE_UNITS',
        'MAX_FRAGMENT_UNIFORM_VECTORS',
        'SHADING_LANGUAGE_VERSION',
        'VENDOR',
        'RENDERER',
        'VERSION',
        'MAX_CUBE_MAP_TEXTURE_SIZE',
        // 'ACTIVE_TEXTURE',
        // 'IMPLEMENTATION_COLOR_READ_TYPE',
        // 'IMPLEMENTATION_COLOR_READ_FORMAT',
        'MAX_RENDERBUFFER_SIZE',
        // 'UNPACK_FLIP_Y_WEBGL',
        // 'UNPACK_PREMULTIPLY_ALPHA_WEBGL',
        // 'UNPACK_COLORSPACE_CONVERSION_WEBGL',
        // 'READ_BUFFER',
        // 'UNPACK_ROW_LENGTH',
        // 'UNPACK_SKIP_ROWS',
        // 'UNPACK_SKIP_PIXELS',
        // 'PACK_ROW_LENGTH',
        // 'PACK_SKIP_ROWS',
        // 'PACK_SKIP_PIXELS',
        // 'UNPACK_SKIP_IMAGES',
        // 'UNPACK_IMAGE_HEIGHT',
        'MAX_3D_TEXTURE_SIZE',
        'MAX_ELEMENTS_VERTICES',
        'MAX_ELEMENTS_INDICES',
        'MAX_TEXTURE_LOD_BIAS',
        'MAX_DRAW_BUFFERS',
        // 'DRAW_BUFFER0',
        // 'DRAW_BUFFER1',
        // 'DRAW_BUFFER2',
        // 'DRAW_BUFFER3',
        // 'DRAW_BUFFER4',
        // 'DRAW_BUFFER5',
        // 'DRAW_BUFFER6',
        // 'DRAW_BUFFER7',
        'MAX_FRAGMENT_UNIFORM_COMPONENTS',
        'MAX_VERTEX_UNIFORM_COMPONENTS',
        // 'FRAGMENT_SHADER_DERIVATIVE_HINT',
        'MAX_ARRAY_TEXTURE_LAYERS',
        // 'MIN_PROGRAM_TEXEL_OFFSET',
        'MAX_PROGRAM_TEXEL_OFFSET',
        'MAX_VARYING_COMPONENTS',
        'MAX_TRANSFORM_FEEDBACK_SEPARATE_COMPONENTS',
        // 'RASTERIZER_DISCARD',
        'MAX_TRANSFORM_FEEDBACK_INTERLEAVED_COMPONENTS',
        'MAX_TRANSFORM_FEEDBACK_SEPARATE_ATTRIBS',
        'MAX_COLOR_ATTACHMENTS',
        'MAX_SAMPLES',
        'MAX_VERTEX_UNIFORM_BLOCKS',
        'MAX_FRAGMENT_UNIFORM_BLOCKS',
        'MAX_COMBINED_UNIFORM_BLOCKS',
        'MAX_UNIFORM_BUFFER_BINDINGS',
        'MAX_UNIFORM_BLOCK_SIZE',
        'MAX_COMBINED_VERTEX_UNIFORM_COMPONENTS',
        'MAX_COMBINED_FRAGMENT_UNIFORM_COMPONENTS',
        // 'UNIFORM_BUFFER_OFFSET_ALIGNMENT',
        'MAX_VERTEX_OUTPUT_COMPONENTS',
        'MAX_FRAGMENT_INPUT_COMPONENTS',
        'MAX_SERVER_WAIT_TIMEOUT',
        // 'TRANSFORM_FEEDBACK_PAUSED',
        // 'TRANSFORM_FEEDBACK_ACTIVE',
        'MAX_ELEMENT_INDEX',
        'MAX_CLIENT_WAIT_TIMEOUT_WEBGL',
    ].sort();
    const draw = (gl) => {
        const isSafari15AndAbove = ('BigInt64Array' in window &&
            IS_WEBKIT &&
            !/(Cr|Fx)iOS/.test(navigator.userAgent));
        if (!gl || isSafari15AndAbove) {
            return;
        }
        // gl.clearColor(0.47, 0.7, 0.78, 1)
        gl.clear(gl.COLOR_BUFFER_BIT);
        // based on https://github.com/Valve/fingerprintjs2/blob/master/fingerprint2.js
        const vertexPosBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexPosBuffer);
        const vertices = new Float32Array([-0.9, -0.7, 0, 0.8, -0.7, 0, 0, 0.5, 0]);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        // create program
        const program = gl.createProgram();
        // compile and attach vertex shader
        const vertexShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertexShader, `
			attribute vec2 attrVertex;
			varying vec2 varyinTexCoordinate;
			uniform vec2 uniformOffset;
			void main(){
				varyinTexCoordinate = attrVertex + uniformOffset;
				gl_Position = vec4(attrVertex, 0, 1);
			}
		`);
        gl.compileShader(vertexShader);
        gl.attachShader(program, vertexShader);
        // compile and attach fragment shader
        const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragmentShader, `
			precision mediump float;
			varying vec2 varyinTexCoordinate;
			void main() {
				gl_FragColor = vec4(varyinTexCoordinate, 1, 1);
			}
		`);
        gl.compileShader(fragmentShader);
        gl.attachShader(program, fragmentShader);
        // use program
        const componentSize = 3;
        gl.linkProgram(program);
        gl.useProgram(program);
        program.vertexPosAttrib = gl.getAttribLocation(program, 'attrVertex');
        program.offsetUniform = gl.getUniformLocation(program, 'uniformOffset');
        gl.enableVertexAttribArray(program.vertexPosArray);
        gl.vertexAttribPointer(program.vertexPosAttrib, componentSize, gl.FLOAT, false, 0, 0);
        gl.uniform2f(program.offsetUniform, 1, 1);
        // draw
        const numOfIndices = 3;
        gl.drawArrays(gl.LINE_LOOP, 0, numOfIndices);
        return gl;
    };
    try {
        const timer = createTimer();
        await queueEvent(timer);
        // detect lies
        const dataLie = lieProps['HTMLCanvasElement.toDataURL'];
        const contextLie = lieProps['HTMLCanvasElement.getContext'];
        const parameterOrExtensionLie = (lieProps['WebGLRenderingContext.getParameter'] ||
            lieProps['WebGL2RenderingContext.getParameter'] ||
            lieProps['WebGLRenderingContext.getExtension'] ||
            lieProps['WebGL2RenderingContext.getExtension']);
        const lied = (dataLie ||
            contextLie ||
            parameterOrExtensionLie ||
            lieProps['WebGLRenderingContext.getSupportedExtensions'] ||
            lieProps['WebGL2RenderingContext.getSupportedExtensions']) || false;
        // create canvas context
        let win = window;
        if (!LIKE_BRAVE && PHANTOM_DARKNESS) {
            win = PHANTOM_DARKNESS;
        }
        const doc = win.document;
        let canvas;
        let canvas2;
        if ('OffscreenCanvas' in window) {
            // @ts-ignore OffscreenCanvas
            canvas = new win.OffscreenCanvas(256, 256);
            // @ts-ignore OffscreenCanvas
            canvas2 = new win.OffscreenCanvas(256, 256);
        }
        else {
            canvas = doc.createElement('canvas');
            canvas2 = doc.createElement('canvas');
        }
        const getContext = (canvas, contextType) => {
            try {
                if (contextType == 'webgl2') {
                    return (canvas.getContext('webgl2') ||
                        canvas.getContext('experimental-webgl2'));
                }
                return (canvas.getContext('webgl') ||
                    canvas.getContext('experimental-webgl') ||
                    canvas.getContext('moz-webgl') ||
                    canvas.getContext('webkit-3d'));
            }
            catch (error) {
                return;
            }
        };
        const gl = getContext(canvas, 'webgl');
        const gl2 = getContext(canvas2, 'webgl2');
        if (!gl) {
            logTestResult({ test: 'webgl', passed: false });
            return;
        }
        // helpers
        const getShaderPrecisionFormat = (gl, shaderType) => {
            if (!gl) {
                return;
            }
            const LOW_FLOAT = attempt(() => gl.getShaderPrecisionFormat(gl[shaderType], gl.LOW_FLOAT));
            const MEDIUM_FLOAT = attempt(() => gl.getShaderPrecisionFormat(gl[shaderType], gl.MEDIUM_FLOAT));
            const HIGH_FLOAT = attempt(() => gl.getShaderPrecisionFormat(gl[shaderType], gl.HIGH_FLOAT));
            const HIGH_INT = attempt(() => gl.getShaderPrecisionFormat(gl[shaderType], gl.HIGH_INT));
            return {
                LOW_FLOAT,
                MEDIUM_FLOAT,
                HIGH_FLOAT,
                HIGH_INT,
            };
        };
        const getShaderData = (name, shader) => {
            const data = {};
            // eslint-disable-next-line guard-for-in
            for (const prop in shader) {
                const obj = shader[prop];
                data[name + '.' + prop + '.precision'] = obj ? attempt(() => obj.precision) : undefined;
                data[name + '.' + prop + '.rangeMax'] = obj ? attempt(() => obj.rangeMax) : undefined;
                data[name + '.' + prop + '.rangeMin'] = obj ? attempt(() => obj.rangeMin) : undefined;
            }
            return data;
        };
        const getMaxAnisotropy = (gl) => {
            if (!gl) {
                return;
            }
            const ext = (gl.getExtension('EXT_texture_filter_anisotropic') ||
                gl.getExtension('MOZ_EXT_texture_filter_anisotropic') ||
                gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic'));
            return ext ? gl.getParameter(ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT) : undefined;
        };
        const getParams = (gl) => {
            if (!gl) {
                return {};
            }
            const pnamesShortList = new Set(getParamNames());
            const pnames = Object.getOwnPropertyNames(Object.getPrototypeOf(gl))
                // .filter(prop => prop.toUpperCase() == prop) // global test
                .filter((name) => pnamesShortList.has(name));
            return pnames.reduce((acc, name) => {
                const val = gl.getParameter(gl[name]);
                if (!!val && 'buffer' in Object.getPrototypeOf(val)) {
                    acc[name] = [...val];
                }
                else {
                    acc[name] = val;
                }
                return acc;
            }, {});
        };
        const getUnmasked = (gl) => {
            const ext = !!gl ? gl.getExtension('WEBGL_debug_renderer_info') : null;
            return !ext ? {} : {
                UNMASKED_VENDOR_WEBGL: gl.getParameter(ext.UNMASKED_VENDOR_WEBGL),
                UNMASKED_RENDERER_WEBGL: gl.getParameter(ext.UNMASKED_RENDERER_WEBGL),
            };
        };
        const getSupportedExtensions = (gl) => {
            if (!gl) {
                return [];
            }
            const ext = attempt(() => gl.getSupportedExtensions());
            if (!ext) {
                return [];
            }
            return ext;
        };
        const getWebGLData = (gl, contextType) => {
            if (!gl) {
                return {
                    dataURI: undefined,
                    pixels: undefined,
                };
            }
            try {
                draw(gl);
                const { drawingBufferWidth, drawingBufferHeight } = gl;
                let dataURI = '';
                if (gl.canvas.constructor.name === 'OffscreenCanvas') {
                    const canvas = document.createElement('canvas');
                    draw(getContext(canvas, contextType));
                    dataURI = canvas.toDataURL();
                }
                else {
                    dataURI = gl.canvas.toDataURL();
                }
                // reduce excessive reads to improve performance
                const width = drawingBufferWidth / 15;
                const height = drawingBufferHeight / 6;
                const pixels = new Uint8Array(width * height * 4);
                try {
                    gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
                }
                catch (error) {
                    return {
                        dataURI,
                        pixels: undefined,
                    };
                }
                // console.log([...pixels].filter(x => !!x)) // test read
                return {
                    dataURI,
                    pixels: [...pixels],
                };
            }
            catch (error) {
                return captureError(error);
            }
        };
        // get data
        await queueEvent(timer);
        const params = Object.assign(Object.assign({}, getParams(gl)), getUnmasked(gl));
        const params2 = Object.assign(Object.assign({}, getParams(gl2)), getUnmasked(gl2));
        const mismatch = Object.keys(params2)
            .filter((key) => !!params[key] && '' + params[key] != '' + params2[key])
            .toString()
            .replace('SHADING_LANGUAGE_VERSION,VERSION', '');
        if (mismatch) {
            sendToTrash('webgl/webgl2 mirrored params mismatch', mismatch);
        }
        await queueEvent(timer);
        const { dataURI, pixels } = getWebGLData(gl, 'webgl') || {};
        const { dataURI: dataURI2, pixels: pixels2 } = getWebGLData(gl2, 'webgl2') || {};
        const data = {
            extensions: [...getSupportedExtensions(gl), ...getSupportedExtensions(gl2)],
            pixels,
            pixels2,
            dataURI,
            dataURI2,
            parameters: Object.assign(Object.assign({}, Object.assign(Object.assign({}, params), params2)), Object.assign(Object.assign(Object.assign({ antialias: gl.getContextAttributes() ? gl.getContextAttributes().antialias : undefined, MAX_VIEWPORT_DIMS: attempt(() => [...gl.getParameter(gl.MAX_VIEWPORT_DIMS)]), MAX_TEXTURE_MAX_ANISOTROPY_EXT: getMaxAnisotropy(gl) }, getShaderData('VERTEX_SHADER', getShaderPrecisionFormat(gl, 'VERTEX_SHADER'))), getShaderData('FRAGMENT_SHADER', getShaderPrecisionFormat(gl, 'FRAGMENT_SHADER'))), { MAX_DRAW_BUFFERS_WEBGL: attempt(() => {
                    const buffers = gl.getExtension('WEBGL_draw_buffers');
                    return buffers ? gl.getParameter(buffers.MAX_DRAW_BUFFERS_WEBGL) : undefined;
                }) })),
            parameterOrExtensionLie,
            lied,
        };
        logTestResult({ time: timer.stop(), test: 'webgl', passed: true });
        return Object.assign(Object.assign({}, data), { gpu: Object.assign(Object.assign({}, (getWebGLRendererConfidence((data.parameters || {}).UNMASKED_RENDERER_WEBGL) || {})), { compressedGPU: compressWebGLRenderer((data.parameters || {}).UNMASKED_RENDERER_WEBGL) }) });
    }
    catch (error) {
        logTestResult({ test: 'webgl', passed: false });
        captureError(error);
        return;
    }
}
function webglHTML(fp) {
    if (!fp.canvasWebgl) {
        return `
		<div class="col-six undefined">
			<strong>WebGL</strong>
			<div>images: ${HTMLNote.BLOCKED}</div>
			<div>pixels: ${HTMLNote.BLOCKED}</div>
			<div>params (0): ${HTMLNote.BLOCKED}</div>
			<div>exts (0): ${HTMLNote.BLOCKED}</div>
			<div>gpu:</div>
			<div class="block-text">${HTMLNote.BLOCKED}</div>
			<div class="gl-image"></div>
		</div>`;
    }
    const { canvasWebgl: data } = fp;
    const id = 'creep-canvas-webgl';
    const { $hash, dataURI, dataURI2, pixels, pixels2, lied, extensions, parameters, gpu, } = data || {};
    const { parts, warnings, gibbers, confidence, grade: confidenceGrade, compressedGPU, } = gpu || {};
    const paramKeys = parameters ? Object.keys(parameters).sort() : [];
    return `

	<div class="relative col-six${lied ? ' rejected' : ''}">
		<span class="time">${performanceLogger.getLog().webgl}</span>
		<strong>WebGL</strong><span class="${lied ? 'lies ' : ''}hash">${hashSlice($hash)}</span>
		<div>images:${!dataURI ? ' ' + HTMLNote.BLOCKED : `<span class="sub-hash">${hashMini(dataURI)}</span>${!dataURI2 || dataURI == dataURI2 ? '' : `<span class="sub-hash">${hashMini(dataURI2)}</span>`}`}</div>
		<div>pixels:${!pixels ? ' ' + HTMLNote.BLOCKED : `<span class="sub-hash">${hashSlice(pixels)}</span>${!pixels2 || pixels == pixels2 ? '' : `<span class="sub-hash">${hashSlice(pixels2)}</span>`}`}</div>
		<div>params (${count(paramKeys)}): ${!paramKeys.length ? HTMLNote.BLOCKED :
        modal(`${id}-parameters`, paramKeys.map((key) => `${key}: ${parameters[key]}`).join('<br>'), hashMini(parameters))}</div>
		<div>exts (${count(extensions)}): ${!extensions.length ? HTMLNote.BLOCKED :
        modal(`${id}-extensions`, extensions.sort().join('<br>'), hashMini(extensions))}</div>

		<div class="relative">gpu:${confidence ? `<span class="confidence-note">confidence: <span class="scale-up grade-${confidenceGrade}">${confidence}</span></span>` : ''}</div>
		<div class="block-text help" title="${confidence ? `\nWebGLRenderingContext.getParameter()\ngpu compressed: ${compressedGPU}\nknown parts: ${parts || 'none'}\ngibberish: ${gibbers || 'none'}\nwarnings: ${warnings.join(', ') || 'none'}` : 'WebGLRenderingContext.getParameter()'}">
			<div>
				${parameters.UNMASKED_VENDOR_WEBGL ? parameters.UNMASKED_VENDOR_WEBGL : ''}
				${!parameters.UNMASKED_RENDERER_WEBGL ? HTMLNote.BLOCKED : `<br>${parameters.UNMASKED_RENDERER_WEBGL}`}
			</div>
		</div>
		${!dataURI ? '<div class="gl-image"></div>' : `<image class="gl-image" src="${dataURI}"/>`}
	</div>
	`;
}

const getExtensions = (sdp) => {
    const extensions = (('' + sdp).match(/extmap:\d+ [^\n|\r]+/g) || [])
        .map((x) => x.replace(/extmap:[^\s]+ /, ''));
    return [...new Set(extensions)].sort();
};
const createCounter = () => {
    let counter = 0;
    return {
        increment: () => counter += 1,
        getValue: () => counter,
    };
};
// https://webrtchacks.com/sdp-anatomy/
// https://tools.ietf.org/id/draft-ietf-rtcweb-sdp-08.html
const constructDescriptions = ({ mediaType, sdp, sdpDescriptors, rtxCounter }) => {
    if (!('' + sdpDescriptors)) {
        return;
    }
    return sdpDescriptors.reduce((descriptionAcc, descriptor) => {
        const matcher = `(rtpmap|fmtp|rtcp-fb):${descriptor} (.+)`;
        const formats = (sdp.match(new RegExp(matcher, 'g')) || []);
        if (!('' + formats)) {
            return descriptionAcc;
        }
        const isRtxCodec = ('' + formats).includes(' rtx/');
        if (isRtxCodec) {
            if (rtxCounter.getValue()) {
                return descriptionAcc;
            }
            rtxCounter.increment();
        }
        const getLineData = (x) => x.replace(/[^\s]+ /, '');
        const description = formats.reduce((acc, x) => {
            const rawData = getLineData(x);
            const data = rawData.split('/');
            const codec = data[0];
            const description = {};
            if (x.includes('rtpmap')) {
                if (mediaType == 'audio') {
                    description.channels = (+data[2]) || 1;
                }
                description.mimeType = `${mediaType}/${codec}`;
                description.clockRates = [+data[1]];
                return Object.assign(Object.assign({}, acc), description);
            }
            else if (x.includes('rtcp-fb')) {
                return Object.assign(Object.assign({}, acc), { feedbackSupport: [...(acc.feedbackSupport || []), rawData] });
            }
            else if (isRtxCodec) {
                return acc; // no sdpFmtpLine
            }
            return Object.assign(Object.assign({}, acc), { sdpFmtpLine: [...rawData.split(';')] });
        }, {});
        let shouldMerge = false;
        const mergerAcc = descriptionAcc.map((x) => {
            shouldMerge = x.mimeType == description.mimeType;
            if (shouldMerge) {
                if (x.feedbackSupport) {
                    x.feedbackSupport = [
                        ...new Set([...x.feedbackSupport, ...description.feedbackSupport]),
                    ];
                }
                if (x.sdpFmtpLine) {
                    x.sdpFmtpLine = [
                        ...new Set([...x.sdpFmtpLine, ...description.sdpFmtpLine]),
                    ];
                }
                return Object.assign(Object.assign({}, x), { clockRates: [
                        ...new Set([...x.clockRates, ...description.clockRates]),
                    ] });
            }
            return x;
        });
        if (shouldMerge) {
            return mergerAcc;
        }
        return [...descriptionAcc, description];
    }, []);
};
const getCapabilities = (sdp) => {
    const videoDescriptors = ((/m=video [^\s]+ [^\s]+ ([^\n|\r]+)/.exec(sdp) || [])[1] || '').split(' ');
    const audioDescriptors = ((/m=audio [^\s]+ [^\s]+ ([^\n|\r]+)/.exec(sdp) || [])[1] || '').split(' ');
    const rtxCounter = createCounter();
    return {
        audio: constructDescriptions({
            mediaType: 'audio',
            sdp,
            sdpDescriptors: audioDescriptors,
            rtxCounter,
        }),
        video: constructDescriptions({
            mediaType: 'video',
            sdp,
            sdpDescriptors: videoDescriptors,
            rtxCounter,
        }),
    };
};
const getIPAddress = (sdp) => {
    const blocked = '0.0.0.0';
    const candidateEncoding = /((udp|tcp)\s)((\d|\w)+\s)((\d|\w|(\.|\:))+)(?=\s)/ig;
    const connectionLineEncoding = /(c=IN\s)(.+)\s/ig;
    const connectionLineIpAddress = ((sdp.match(connectionLineEncoding) || [])[0] || '').trim().split(' ')[2];
    if (connectionLineIpAddress && (connectionLineIpAddress != blocked)) {
        return connectionLineIpAddress;
    }
    const candidateIpAddress = ((sdp.match(candidateEncoding) || [])[0] || '').split(' ')[2];
    return candidateIpAddress && (candidateIpAddress != blocked) ? candidateIpAddress : undefined;
};
async function getWebRTCData() {
    return new Promise(async (resolve) => {
        if (!window.RTCPeerConnection) {
            return resolve(null);
        }
        const config = {
            iceCandidatePoolSize: 1,
            iceServers: [
                {
                    urls: [
                        'stun:stun4.l.google.com:19302?transport=udp',
                        'stun:stun3.l.google.com:19302?transport=udp',
                        // 'stun:stun2.l.google.com:19302?transport=udp',
                        // 'stun:stun1.l.google.com:19302?transport=udp',
                        // 'stun:stun.l.google.com:19302?transport=udp',
                    ],
                },
            ],
        };
        const connection = new RTCPeerConnection(config);
        connection.createDataChannel('');
        const options = { offerToReceiveAudio: 1, offerToReceiveVideo: 1 };
        // @ts-ignore
        const offer = await connection.createOffer(options);
        connection.setLocalDescription(offer);
        const { sdp } = offer || {};
        const extensions = getExtensions(sdp);
        const codecsSdp = getCapabilities(sdp);
        let iceCandidate = '';
        let foundation = '';
        const giveUpOnIPAddress = setTimeout(() => {
            connection.removeEventListener('icecandidate', computeCandidate);
            connection.close();
            if (sdp) {
                return resolve({
                    codecsSdp,
                    extensions,
                    foundation,
                    iceCandidate,
                });
            }
            return resolve(null);
        }, 3000);
        const computeCandidate = (event) => {
            const { candidate } = event.candidate || {};
            if (!candidate) {
                return;
            }
            if (!iceCandidate) {
                iceCandidate = candidate;
                foundation = (/^candidate:([\w]+)/.exec(candidate) || [])[1] || '';
            }
            const { sdp } = connection.localDescription || {};
            const address = getIPAddress(sdp);
            if (!address) {
                return;
            }
            connection.removeEventListener('icecandidate', computeCandidate);
            clearTimeout(giveUpOnIPAddress);
            connection.close();
            return resolve({
                codecsSdp,
                extensions,
                foundation,
                iceCandidate,
                address,
                stunConnection: candidate,
            });
        };
        connection.addEventListener('icecandidate', computeCandidate);
    });
}
function webrtcHTML(webRTC) {
    if (!webRTC) {
        return `
	<div class="col-six">
		<strong>WebRTC</strong>
		<div>host connection:</div>
		<div class="block-text">${HTMLNote.BLOCKED}</div>
	</div>
	<div class="col-six">
		<div>sdp capabilities: ${HTMLNote.BLOCKED}</div>
		<div>stun connection:</div>
		<div class="block-text">${HTMLNote.BLOCKED}</div>
	</div>`;
    }
    const { codecsSdp, extensions, foundation, iceCandidate, address, stunConnection, } = webRTC || {};
    const { audio, video } = codecsSdp || {};
    const id = 'creep-webrtc';
    const webRTCHash = hashMini({
        codecsSdp,
        extensions,
        foundation,
        address,
    });
    const feedbackId = {
        'ccm fir': 'Codec Control Message Full Intra Request (ccm fir)',
        'goog-remb': 'Google\'s Receiver Estimated Maximum Bitrate (goog-remb)',
        'nack': 'Negative ACKs (nack)',
        'nack pli': 'Picture loss Indication and NACK (nack pli)',
        'transport-cc': 'Transport Wide Congestion Control (transport-cc)',
    };
    const getModalTemplate = (list) => list.map((x) => {
        return `
			<strong>${x.mimeType}</strong>
			<br>Clock Rates: ${x.clockRates.sort((a, b) => b - a).join(', ')}
			${x.channels > 1 ? `<br>Channels: ${x.channels}` : ''}
			${x.sdpFmtpLine ? `<br>Format Specific Parameters:<br>- ${x.sdpFmtpLine.sort().map((x) => x.replace('=', ': ')).join('<br>- ')}` : ''}
			${x.feedbackSupport ? `<br>Feedback Support:<br>- ${x.feedbackSupport.map((x) => {
            return feedbackId[x] || x;
        }).sort().join('<br>- ')}` : ''}
		`;
    }).join('<br><br>');
    return `
	<div class="relative col-six">
		<strong>WebRTC</strong><span class="hash">${webRTCHash}</span>
		<div>host connection:</div>
		<div class="block-text">${iceCandidate || HTMLNote.BLOCKED}</div>
	</div>
	<div class="relative col-six">
		<div class="help" title="RTCSessionDescription.sdp">sdp capabilities: ${!codecsSdp ? HTMLNote.BLOCKED :
        modal(`${id}-sdp-capabilities`, getModalTemplate(audio) +
            '<br><br>' + getModalTemplate(video) +
            '<br><br><strong>extensions</strong><br>' + extensions.join('<br>'), hashMini({ audio, video, extensions }))}</div>
		<div>stun connection:</div>
		<div class="block-text">${stunConnection || HTMLNote.BLOCKED}</div>
	</div>
	`;
}

function getWindowFeatures() {
    try {
        const timer = createTimer();
        timer.start();
        const win = PHANTOM_DARKNESS || window;
        let keys = Object.getOwnPropertyNames(win)
            .filter((key) => !/_|\d{3,}/.test(key)); // clear out known ddg noise
        // if Firefox, remove the 'Event' key and push to end for consistent order
        // and disregard keys known to be missing in RFP mode
        const firefoxKeyMovedByInspect = 'Event';
        const varyingKeysMissingInRFP = ['PerformanceNavigationTiming', 'Performance'];
        if (IS_GECKO) {
            const index = keys.indexOf(firefoxKeyMovedByInspect);
            if (index != -1) {
                keys = keys.slice(0, index).concat(keys.slice(index + 1));
                keys = [...keys, firefoxKeyMovedByInspect];
            }
            varyingKeysMissingInRFP.forEach((key) => {
                const index = keys.indexOf(key);
                if (index != -1) {
                    keys = keys.slice(0, index).concat(keys.slice(index + 1));
                }
                return keys;
            });
        }
        const moz = keys.filter((key) => (/moz/i).test(key)).length;
        const webkit = keys.filter((key) => (/webkit/i).test(key)).length;
        const apple = keys.filter((key) => (/apple/i).test(key)).length;
        const data = { keys, apple, moz, webkit };
        logTestResult({ time: timer.stop(), test: 'window', passed: true });
        return Object.assign({}, data);
    }
    catch (error) {
        logTestResult({ test: 'window', passed: false });
        captureError(error);
        return;
    }
}
function windowFeaturesHTML(fp) {
    if (!fp.windowFeatures) {
        return `
		<div class="col-six undefined">
			<strong>Window</strong>
			<div>keys (0): ${HTMLNote.BLOCKED}</div>
			<div>
				<div>${HTMLNote.BLOCKED}</div>
			</div>
		</div>`;
    }
    const { windowFeatures: { $hash, keys, }, } = fp;
    return `
	<div class="relative col-six">
		<span class="aside-note">${performanceLogger.getLog().window}</span>
		<strong>Window</strong><span class="hash">${hashSlice($hash)}</span>
		<div>keys (${count(keys)}): ${keys && keys.length ? modal('creep-iframe-content-window-version', keys.join(', ')) : HTMLNote.BLOCKED}</div>
		<div class="blurred" id="window-features-samples">
			<div>0% of version</div>
		</div>
	</div>
	`;
}

async function getBestWorkerScope() {
    try {
        const timer = createTimer();
        await queueEvent(timer);
        const ask = (fn) => {
            try {
                return fn();
            }
            catch (e) {
                return;
            }
        };
        const hasConstructor = (x, name) => x && x.__proto__.constructor.name == name;
        const getDedicatedWorker = ({ scriptSource }) => new Promise((resolve) => {
            const giveUpOnWorker = setTimeout(() => {
                return resolve(null);
            }, 3000);
            const dedicatedWorker = ask(() => new Worker(scriptSource));
            if (!hasConstructor(dedicatedWorker, 'Worker'))
                return resolve(null);
            dedicatedWorker.onmessage = (event) => {
                dedicatedWorker.terminate();
                clearTimeout(giveUpOnWorker);
                return resolve(event.data);
            };
        });
        const getSharedWorker = ({ scriptSource }) => new Promise((resolve) => {
            const giveUpOnWorker = setTimeout(() => {
                return resolve(null);
            }, 3000);
            const sharedWorker = ask(() => new SharedWorker(scriptSource));
            if (!hasConstructor(sharedWorker, 'SharedWorker'))
                return resolve(null);
            sharedWorker.port.start();
            sharedWorker.port.onmessage = (event) => {
                sharedWorker.port.close();
                clearTimeout(giveUpOnWorker);
                return resolve(event.data);
            };
        });
        const getServiceWorker = ({ scriptSource }) => new Promise((resolve) => {
            const giveUpOnWorker = setTimeout(() => {
                return resolve(null);
            }, 3000);
            if (!ask(() => navigator.serviceWorker.register))
                return resolve(null);
            return navigator.serviceWorker.register(scriptSource).then((registration) => {
                if (!hasConstructor(registration, 'ServiceWorkerRegistration'))
                    return resolve(null);
                return navigator.serviceWorker.ready.then((registration) => {
                    // @ts-ignore
                    registration.active.postMessage(undefined);
                    navigator.serviceWorker.onmessage = (event) => {
                        registration.unregister();
                        clearTimeout(giveUpOnWorker);
                        return resolve(event.data);
                    };
                });
            }).catch((error) => {
                console.error(error);
                clearTimeout(giveUpOnWorker);
                return resolve(null);
            });
        });
        const scriptSource = 'creepworker.js';
        let scope = 'ServiceWorkerGlobalScope';
        let type = 'service'; // loads fast but is not available in frames
        let workerScope = await getServiceWorker({ scriptSource }).catch((error) => {
            captureError(error);
            console.error(error.message);
            return;
        });
        if (!(workerScope || {}).userAgent) {
            scope = 'SharedWorkerGlobalScope';
            type = 'shared'; // no support in Safari, iOS, and Chrome Android
            workerScope = await getSharedWorker({ scriptSource }).catch((error) => {
                captureError(error);
                console.error(error.message);
                return;
            });
        }
        if (!(workerScope || {}).userAgent) {
            scope = 'WorkerGlobalScope';
            type = 'dedicated'; // device emulators can easily spoof dedicated scope
            workerScope = await getDedicatedWorker({ scriptSource }).catch((error) => {
                captureError(error);
                console.error(error.message);
                return;
            });
        }
        if (!(workerScope || {}).userAgent) {
            return;
        }
        workerScope.system = getOS(workerScope.userAgent);
        workerScope.device = getUserAgentPlatform({ userAgent: workerScope.userAgent });
        workerScope.type = type;
        workerScope.scope = scope;
        // detect lies
        const { system, userAgent, userAgentData, platform, deviceMemory, hardwareConcurrency, } = workerScope || {};
        // navigator lies
        // skip language and languages to respect valid engine language switching bug in Chrome
        // these are more likely navigator lies, so don't trigger lied worker scope
        const workerScopeMatchLie = 'does not match worker scope';
        if (platform != navigator.platform) {
            documentLie('Navigator.platform', workerScopeMatchLie);
        }
        if (userAgent != navigator.userAgent) {
            documentLie('Navigator.userAgent', workerScopeMatchLie);
        }
        if (hardwareConcurrency && (hardwareConcurrency != navigator.hardwareConcurrency)) {
            documentLie('Navigator.hardwareConcurrency', workerScopeMatchLie);
        }
        // @ts-ignore
        if (deviceMemory && (deviceMemory != navigator.deviceMemory)) {
            documentLie('Navigator.deviceMemory', workerScopeMatchLie);
        }
        // prototype lies
        if (workerScope.lies.proto) {
            const { proto } = workerScope.lies;
            const keys = Object.keys(proto);
            keys.forEach((key) => {
                const api = `${workerScope.scope}.${key}`;
                const lies = proto[key];
                lies.forEach((lie) => documentLie(api, lie));
            });
        }
        // user agent os lie
        const userAgentOS = (
        // order is important
        /win(dows|16|32|64|95|98|nt)|wow64/ig.test(userAgent) ? 'Windows' :
            /android|linux|cros/ig.test(userAgent) ? 'Linux' :
                /(i(os|p(ad|hone|od)))|mac/ig.test(userAgent) ? 'Apple' :
                    'Other');
        const platformOS = (
        // order is important
        /win/ig.test(platform) ? 'Windows' :
            /android|arm|linux/ig.test(platform) ? 'Linux' :
                /(i(os|p(ad|hone|od)))|mac/ig.test(platform) ? 'Apple' :
                    'Other');
        const osLie = userAgentOS != platformOS;
        if (osLie) {
            workerScope.lied = true;
            workerScope.lies.os = `${platformOS} platform and ${userAgentOS} user agent do not match`;
            documentLie(workerScope.scope, workerScope.lies.os);
        }
        // user agent engine lie
        const decryptedName = decryptUserAgent({
            ua: userAgent,
            os: system,
            isBrave: false, // default false since we are only looking for JS runtime and version
        });
        const userAgentEngine = ((/safari/i.test(decryptedName) || /iphone|ipad/i.test(userAgent)) ? 'JavaScriptCore' :
            /firefox/i.test(userAgent) ? 'SpiderMonkey' :
                /chrome/i.test(userAgent) ? 'V8' :
                    undefined);
        if (userAgentEngine != JS_ENGINE) {
            workerScope.lied = true;
            workerScope.lies.engine = `${JS_ENGINE} JS runtime and ${userAgentEngine} user agent do not match`;
            documentLie(workerScope.scope, workerScope.lies.engine);
        }
        // user agent version lie
        const getVersion = (x) => (/\d+/.exec(x) || [])[0];
        const userAgentVersion = getVersion(decryptedName);
        const userAgentDataVersion = getVersion(userAgentData ? userAgentData.uaFullVersion : '');
        const versionSupported = userAgentDataVersion && userAgentVersion;
        const versionMatch = userAgentDataVersion == userAgentVersion;
        if (versionSupported && !versionMatch) {
            workerScope.lied = true;
            workerScope.lies.version = `userAgentData version ${userAgentDataVersion} and user agent version ${userAgentVersion} do not match`;
            documentLie(workerScope.scope, workerScope.lies.version);
        }
        // windows platformVersion lie
        // https://docs.microsoft.com/en-us/microsoft-edge/web-platform/how-to-detect-win11
        const getWindowsVersionLie = (device, userAgentData) => {
            if (!/windows/i.test(device) || !userAgentData || !userAgentData.platformVersion) {
                return false;
            }
            const reportedVersionNumber = +(/windows ([\d|\.]+)/i.exec(device) || [])[1];
            const windows1OrHigherReport = reportedVersionNumber == 10;
            const { platformVersion } = userAgentData;
            // userAgentData version format changed in Chrome 95
            // https://github.com/WICG/ua-client-hints/issues/220#issuecomment-870858413
            const chrome95AndAbove = (((3.141592653589793 ** -100) == 1.9275814160560204e-50) && CSS.supports('app-region: initial'));
            const versionMap = {
                '6.1': '7',
                '6.1.0': '7',
                '6.2': '8',
                '6.2.0': '8',
                '6.3': '8.1',
                '6.3.0': '8.1',
                '10.0': '10',
                '10.0.0': '10',
            };
            let versionNumber = versionMap[platformVersion];
            if (!chrome95AndAbove && versionNumber) {
                return versionNumber != ('' + reportedVersionNumber);
            }
            versionNumber = +(/(\d+)\./.exec('' + platformVersion) || [])[1];
            const windows10OrHigherPlatform = versionNumber > 0;
            return ((windows10OrHigherPlatform && !windows1OrHigherReport) ||
                (!windows10OrHigherPlatform && windows1OrHigherReport));
        };
        const windowsVersionLie = getWindowsVersionLie(workerScope.device, userAgentData);
        if (windowsVersionLie) {
            workerScope.lied = true;
            workerScope.lies.platformVersion = `Windows platformVersion ${(userAgentData || {}).platformVersion} does not match user agent version ${workerScope.device}`;
            documentLie(workerScope.scope, workerScope.lies.platformVersion);
        }
        // capture userAgent version
        workerScope.userAgentVersion = userAgentVersion;
        workerScope.userAgentDataVersion = userAgentDataVersion;
        workerScope.userAgentEngine = userAgentEngine;
        const gpu = Object.assign(Object.assign({}, (getWebGLRendererConfidence(workerScope.webglRenderer) || {})), { compressedGPU: compressWebGLRenderer(workerScope.webglRenderer) });
        logTestResult({ time: timer.stop(), test: `${type} worker`, passed: true });
        return Object.assign(Object.assign({}, workerScope), { gpu, uaPostReduction: isUAPostReduction(workerScope.userAgent) });
    }
    catch (error) {
        logTestResult({ test: 'worker', passed: false });
        captureError(error, 'workers failed or blocked by client');
        return;
    }
}
function workerScopeHTML(fp) {
    if (!fp.workerScope) {
        return `
		<div class="col-six undefined">
			<strong>Worker</strong>
			<div>keys (0): ${HTMLNote.BLOCKED}</div>
			<div>lang/timezone:</div>
			<div class="block-text">${HTMLNote.BLOCKED}</div>
			<div>gpu:</div>
			<div class="block-text">${HTMLNote.BLOCKED}</div>
		</div>
		<div class="col-six undefined">
			<div>userAgent:</div>
			<div class="block-text">${HTMLNote.BLOCKED}</div>
			<div>device:</div>
			<div class="block-text">${HTMLNote.BLOCKED}</div>
			<div>userAgentData:</div>
			<div class="block-text">${HTMLNote.BLOCKED}</div>
		</div>`;
    }
    const { workerScope: data } = fp;
    const { scopeKeys, lied, locale, systemCurrencyLocale, engineCurrencyLocale, localeEntropyIsTrusty, localeIntlEntropyIsTrusty, timezoneOffset, timezoneLocation, deviceMemory, hardwareConcurrency, language,
    // languages,
    platform, userAgent, uaPostReduction, webglRenderer, webglVendor, gpu, userAgentData, type, scope, system, device, $hash, } = data || {};
    const { parts, warnings, gibbers, confidence, grade: confidenceGrade, compressedGPU, } = gpu || {};
    return `
	<span class="time">${performanceLogger.getLog()[`${type} worker`]}</span>
	<span class="aside-note-bottom">${scope || ''}</span>

	<div class="relative col-six${lied ? ' rejected' : ''}">

		<strong>Worker</strong><span class="hash">${hashSlice($hash)}</span>
		<div>keys (${count(scopeKeys)}): ${scopeKeys && scopeKeys.length ? modal('creep-worker-scope-version', scopeKeys.join(', '), hashMini(scopeKeys)) : HTMLNote.BLOCKED}</div>
		<div class="help">lang/timezone:</div>
		<div class="block-text help" title="WorkerNavigator.language\nWorkerNavigator.languages\nIntl.Collator.resolvedOptions()\nIntl.DateTimeFormat.resolvedOptions()\nIntl.DisplayNames.resolvedOptions()\nIntl.ListFormat.resolvedOptions()\nIntl.NumberFormat.resolvedOptions()\nIntl.PluralRules.resolvedOptions()\nIntl.RelativeTimeFormat.resolvedOptions()\nNumber.toLocaleString()\nIntl.DateTimeFormat().resolvedOptions().timeZone\nDate.getDate()\nDate.getMonth()\nDate.parse()">
			${localeEntropyIsTrusty ? `${language} (${systemCurrencyLocale})` :
        `${language} (<span class="bold-fail">${engineCurrencyLocale}</span>)`}
			${locale === language ? '' : localeIntlEntropyIsTrusty ? ` ${locale}` :
        ` <span class="bold-fail">${locale}</span>`}
			<br>${timezoneLocation} (${'' + timezoneOffset})
		</div>

		<div class="relative">${confidence ? `<span class="confidence-note">confidence: <span class="scale-up grade-${confidenceGrade}">${confidence}</span></span>` : ''}gpu:</div>
		<div class="block-text help" title="${confidence ? `\nWebGLRenderingContext.getParameter()\ngpu compressed: ${compressedGPU}\nknown parts: ${parts || 'none'}\ngibberish: ${gibbers || 'none'}\nwarnings: ${warnings.join(', ') || 'none'}` : 'WebGLRenderingContext.getParameter()'}">
			${webglVendor ? webglVendor : ''}
			${webglRenderer ? `<br>${webglRenderer}` : HTMLNote.UNSUPPORTED}
		</div>

	</div>
	<div class="col-six${lied ? ' rejected' : ''}">

		<div class="relative">userAgent:${!uaPostReduction ? '' : `<span class="confidence-note">ua reduction</span>`}</div>
		<div class="block-text help" title="WorkerNavigator.userAgent">
			<div>${userAgent || HTMLNote.UNSUPPORTED}</div>
		</div>

		<div>device:</div>
		<div class="block-text help" title="WorkerNavigator.deviceMemory\nWorkerNavigator.hardwareConcurrency\nWorkerNavigator.platform\nWorkerNavigator.userAgent">
			${`${system}${platform ? ` (${platform})` : ''}`}
			${device ? `<br>${device}` : HTMLNote.BLOCKED}
			${hardwareConcurrency && deviceMemory ? `<br>cores: ${hardwareConcurrency}, ram: ${deviceMemory}` :
        hardwareConcurrency && !deviceMemory ? `<br>cores: ${hardwareConcurrency}` :
            !hardwareConcurrency && deviceMemory ? `<br>ram: ${deviceMemory}` : ''}
		</div>

		<div>userAgentData:</div>
		<div class="block-text help" title="WorkerNavigator.userAgentData\nNavigatorUAData.getHighEntropyValues()">
			<div>
			${((userAgentData) => {
        const { architecture, bitness, brandsVersion, uaFullVersion, mobile, model, platformVersion, platform, } = userAgentData || {};
        // @ts-ignore
        const windowsRelease = computeWindowsRelease({ platform, platformVersion });
        return !userAgentData ? HTMLNote.UNSUPPORTED : `
					${(brandsVersion || []).join(',')}${uaFullVersion ? ` (${uaFullVersion})` : ''}
					<br>${windowsRelease || `${platform} ${platformVersion}`} ${architecture ? `${architecture}${bitness ? `_${bitness}` : ''}` : ''}
					${model ? `<br>${model}` : ''}
					${mobile ? '<br>mobile' : ''}
				`;
    })(userAgentData)}
			</div>
		</div>

	</div>
	`;
}

!async function () {
    const isBrave = IS_BLINK ? await braveBrowser() : false;
    const braveMode = isBrave ? getBraveMode() : {};
    const braveFingerprintingBlocking = isBrave && (braveMode.standard || braveMode.strict);
    const fingerprint = async () => {
        const timeStart = timer();
        const fingerprintTimeStart = timer();
        // @ts-ignore
        const [windowFeaturesComputed, htmlElementVersionComputed, cssComputed, cssMediaComputed, screenComputed, voicesComputed, canvas2dComputed, canvasWebglComputed, mathsComputed, consoleErrorsComputed, timezoneComputed, clientRectsComputed, fontsComputed, workerScopeComputed, mediaComputed, svgComputed, resistanceComputed, intlComputed, navigatorComputed, offlineAudioContextComputed,] = await Promise.all([
            getWindowFeatures(),
            getHTMLElementVersion(),
            getCSS(),
            getCSSMedia(),
            getScreen(),
            getVoices(),
            getCanvas2d(),
            getCanvasWebgl(),
            getMaths(),
            getConsoleErrors(),
            getTimezone(),
            getClientRects(),
            getFonts(),
            getBestWorkerScope(),
            getMedia(),
            getSVG(),
            getResistance(),
            getIntl(),
            getNavigator(),
            getOfflineAudioContext(),
        ]).catch((error) => console.error(error.message));
        // @ts-ignore
        const [headlessComputed, featuresComputed,] = await Promise.all([
            getHeadlessFeatures(workerScopeComputed),
            getEngineFeatures({
                cssComputed,
                navigatorComputed,
                windowFeaturesComputed,
            }),
        ]).catch((error) => console.error(error.message));
        // @ts-ignore
        const [liesComputed, trashComputed, capturedErrorsComputed,] = await Promise.all([
            getLies(),
            getTrash(),
            getCapturedErrors(),
        ]).catch((error) => console.error(error.message));
        const fingerprintTimeEnd = fingerprintTimeStart();
        console.log(`Fingerprinting complete in ${(fingerprintTimeEnd).toFixed(2)}ms`);
        // GPU Prediction
        const { parameters: gpuParameter } = canvasWebglComputed || {};
        const reducedGPUParameters = Object.assign(Object.assign({}, (braveFingerprintingBlocking ? getBraveUnprotectedParameters(gpuParameter) :
            gpuParameter)), { RENDERER: undefined, SHADING_LANGUAGE_VERSION: undefined, UNMASKED_RENDERER_WEBGL: undefined, UNMASKED_VENDOR_WEBGL: undefined, VERSION: undefined, VENDOR: undefined });
        // Hashing
        const hashStartTime = timer();
        // @ts-ignore
        const [windowHash, headlessHash, htmlHash, cssMediaHash, cssHash, styleHash, styleSystemHash, screenHash, voicesHash, canvas2dHash, canvas2dImageHash, canvas2dBlobHash, canvas2dPaintHash, canvas2dTextHash, canvas2dEmojiHash, canvasWebglHash, canvasWebglImageHash, canvasWebglParametersHash, pixelsHash, pixels2Hash, mathsHash, consoleErrorsHash, timezoneHash, rectsHash, domRectHash, audioHash, fontsHash, workerHash, mediaHash, mimeTypesHash, navigatorHash, liesHash, trashHash, errorsHash, svgHash, resistanceHash, intlHash, featuresHash, deviceOfTimezoneHash,] = await Promise.all([
            hashify(windowFeaturesComputed),
            hashify(headlessComputed),
            hashify((htmlElementVersionComputed || {}).keys),
            hashify(cssMediaComputed),
            hashify(cssComputed),
            hashify((cssComputed || {}).computedStyle),
            hashify((cssComputed || {}).system),
            hashify(screenComputed),
            hashify(voicesComputed),
            hashify(canvas2dComputed),
            hashify((canvas2dComputed || {}).dataURI),
            hashify((canvas2dComputed || {}).blob.readAsDataURL),
            hashify((canvas2dComputed || {}).paintURI),
            hashify((canvas2dComputed || {}).textURI),
            hashify((canvas2dComputed || {}).emojiURI),
            hashify(canvasWebglComputed),
            hashify((canvasWebglComputed || {}).dataURI),
            hashify(reducedGPUParameters),
            ((canvasWebglComputed || {}).pixels || []).length ? hashify(canvasWebglComputed.pixels) : undefined,
            ((canvasWebglComputed || {}).pixels2 || []).length ? hashify(canvasWebglComputed.pixels2) : undefined,
            hashify((mathsComputed || {}).data),
            hashify((consoleErrorsComputed || {}).errors),
            hashify(timezoneComputed),
            hashify(clientRectsComputed),
            hashify([
                (clientRectsComputed || {}).elementBoundingClientRect,
                (clientRectsComputed || {}).elementClientRects,
                (clientRectsComputed || {}).rangeBoundingClientRect,
                (clientRectsComputed || {}).rangeClientRects,
            ]),
            hashify(offlineAudioContextComputed),
            hashify(fontsComputed),
            hashify(workerScopeComputed),
            hashify(mediaComputed),
            hashify((mediaComputed || {}).mimeTypes),
            hashify(navigatorComputed),
            hashify(liesComputed),
            hashify(trashComputed),
            hashify(capturedErrorsComputed),
            hashify(svgComputed),
            hashify(resistanceComputed),
            hashify(intlComputed),
            hashify(featuresComputed),
            hashify((() => {
                const { bluetoothAvailability, device, deviceMemory, hardwareConcurrency, maxTouchPoints, oscpu, platform, system, userAgentData, } = navigatorComputed || {};
                const { architecture, bitness, mobile, model, platform: uaPlatform, platformVersion, } = userAgentData || {};
                const { anyPointer } = cssMediaComputed || {};
                const { colorDepth, pixelDepth, height, width } = screenComputed || {};
                const { location, locationEpoch, zone } = timezoneComputed || {};
                const { deviceMemory: deviceMemoryWorker, hardwareConcurrency: hardwareConcurrencyWorker, gpu, platform: platformWorker, system: systemWorker, timezoneLocation: locationWorker, userAgentData: userAgentDataWorker, } = workerScopeComputed || {};
                const { compressedGPU, confidence } = gpu || {};
                const { architecture: architectureWorker, bitness: bitnessWorker, mobile: mobileWorker, model: modelWorker, platform: uaPlatformWorker, platformVersion: platformVersionWorker, } = userAgentDataWorker || {};
                return [
                    anyPointer,
                    architecture,
                    architectureWorker,
                    bitness,
                    bitnessWorker,
                    bluetoothAvailability,
                    colorDepth,
                    ...(compressedGPU && confidence != 'low' ? [compressedGPU] : []),
                    device,
                    deviceMemory,
                    deviceMemoryWorker,
                    hardwareConcurrency,
                    hardwareConcurrencyWorker,
                    height,
                    location,
                    locationWorker,
                    locationEpoch,
                    maxTouchPoints,
                    mobile,
                    mobileWorker,
                    model,
                    modelWorker,
                    oscpu,
                    pixelDepth,
                    platform,
                    platformWorker,
                    platformVersion,
                    platformVersionWorker,
                    system,
                    systemWorker,
                    uaPlatform,
                    uaPlatformWorker,
                    width,
                    zone,
                ];
            })()),
        ]).catch((error) => console.error(error.message));
        // console.log(performance.now()-start)
        const hashTimeEnd = hashStartTime();
        const timeEnd = timeStart();
        console.log(`Hashing complete in ${(hashTimeEnd).toFixed(2)}ms`);
        if (PARENT_PHANTOM) {
            // @ts-ignore
            PARENT_PHANTOM.parentNode.removeChild(PARENT_PHANTOM);
        }
        const fingerprint = {
            workerScope: !workerScopeComputed ? undefined : Object.assign(Object.assign({}, workerScopeComputed), { $hash: workerHash }),
            navigator: !navigatorComputed ? undefined : Object.assign(Object.assign({}, navigatorComputed), { $hash: navigatorHash }),
            windowFeatures: !windowFeaturesComputed ? undefined : Object.assign(Object.assign({}, windowFeaturesComputed), { $hash: windowHash }),
            headless: !headlessComputed ? undefined : Object.assign(Object.assign({}, headlessComputed), { $hash: headlessHash }),
            htmlElementVersion: !htmlElementVersionComputed ? undefined : Object.assign(Object.assign({}, htmlElementVersionComputed), { $hash: htmlHash }),
            cssMedia: !cssMediaComputed ? undefined : Object.assign(Object.assign({}, cssMediaComputed), { $hash: cssMediaHash }),
            css: !cssComputed ? undefined : Object.assign(Object.assign({}, cssComputed), { $hash: cssHash }),
            screen: !screenComputed ? undefined : Object.assign(Object.assign({}, screenComputed), { $hash: screenHash }),
            voices: !voicesComputed ? undefined : Object.assign(Object.assign({}, voicesComputed), { $hash: voicesHash }),
            media: !mediaComputed ? undefined : Object.assign(Object.assign({}, mediaComputed), { $hash: mediaHash }),
            canvas2d: !canvas2dComputed ? undefined : Object.assign(Object.assign({}, canvas2dComputed), { $hash: canvas2dHash }),
            canvasWebgl: !canvasWebglComputed ? undefined : Object.assign(Object.assign({}, canvasWebglComputed), { pixels: pixelsHash, pixels2: pixels2Hash, $hash: canvasWebglHash }),
            maths: !mathsComputed ? undefined : Object.assign(Object.assign({}, mathsComputed), { $hash: mathsHash }),
            consoleErrors: !consoleErrorsComputed ? undefined : Object.assign(Object.assign({}, consoleErrorsComputed), { $hash: consoleErrorsHash }),
            timezone: !timezoneComputed ? undefined : Object.assign(Object.assign({}, timezoneComputed), { $hash: timezoneHash }),
            clientRects: !clientRectsComputed ? undefined : Object.assign(Object.assign({}, clientRectsComputed), { $hash: rectsHash }),
            offlineAudioContext: !offlineAudioContextComputed ? undefined : Object.assign(Object.assign({}, offlineAudioContextComputed), { $hash: audioHash }),
            fonts: !fontsComputed ? undefined : Object.assign(Object.assign({}, fontsComputed), { $hash: fontsHash }),
            lies: !liesComputed ? undefined : Object.assign(Object.assign({}, liesComputed), { $hash: liesHash }),
            trash: !trashComputed ? undefined : Object.assign(Object.assign({}, trashComputed), { $hash: trashHash }),
            capturedErrors: !capturedErrorsComputed ? undefined : Object.assign(Object.assign({}, capturedErrorsComputed), { $hash: errorsHash }),
            svg: !svgComputed ? undefined : Object.assign(Object.assign({}, svgComputed), { $hash: svgHash }),
            resistance: !resistanceComputed ? undefined : Object.assign(Object.assign({}, resistanceComputed), { $hash: resistanceHash }),
            intl: !intlComputed ? undefined : Object.assign(Object.assign({}, intlComputed), { $hash: intlHash }),
            features: !featuresComputed ? undefined : Object.assign(Object.assign({}, featuresComputed), { $hash: featuresHash }),
        };
        return {
            fingerprint,
            styleSystemHash,
            styleHash,
            domRectHash,
            mimeTypesHash,
            canvas2dImageHash,
            canvasWebglImageHash,
            canvas2dBlobHash,
            canvas2dPaintHash,
            canvas2dTextHash,
            canvas2dEmojiHash,
            canvasWebglParametersHash,
            deviceOfTimezoneHash,
            timeEnd,
        };
    };
    // fingerprint and render
    const { fingerprint: fp, styleSystemHash, styleHash, domRectHash, mimeTypesHash, canvas2dImageHash, canvas2dBlobHash, canvas2dPaintHash, canvas2dTextHash, canvas2dEmojiHash, canvasWebglImageHash, canvasWebglParametersHash, deviceOfTimezoneHash, timeEnd, } = await fingerprint().catch((error) => console.error(error)) || {};
    if (!fp) {
        throw new Error('Fingerprint failed!');
    }
    console.log('%c✔ loose fingerprint passed', 'color:#4cca9f');
    console.groupCollapsed('Loose Fingerprint');
    console.log(fp);
    console.groupEnd();
    console.groupCollapsed('Loose Fingerprint JSON');
    console.log('diff check at https://www.diffchecker.com/diff\n\n', JSON.stringify(fp, null, '\t'));
    console.groupEnd();
    // Trusted Fingerprint
    const trashLen = fp.trash.trashBin.length;
    const liesLen = !('totalLies' in fp.lies) ? 0 : fp.lies.totalLies;
    const errorsLen = fp.capturedErrors.data.length;
    // limit to known audio
    const { offlineAudioContext } = fp || {};
    const { compressorGainReduction, sampleSum } = offlineAudioContext || {};
    const knownSums = KnownAudio[compressorGainReduction];
    const unknownAudio = (sampleSum && compressorGainReduction && knownSums && !knownSums.includes(sampleSum));
    const unknownFirefoxAudio = IS_GECKO && unknownAudio;
    const hardenEntropy = (workerScope, prop) => {
        return (!workerScope ? prop :
            (workerScope.localeEntropyIsTrusty && workerScope.localeIntlEntropyIsTrusty) ? prop :
                undefined);
    };
    const privacyResistFingerprinting = (fp.resistance && /^(tor browser|firefox)$/i.test(fp.resistance.privacy));
    // harden gpu
    const hardenGPU = (canvasWebgl) => {
        const { gpu: { confidence, compressedGPU } } = canvasWebgl;
        return (confidence == 'low' ? {} : {
            UNMASKED_RENDERER_WEBGL: compressedGPU,
            UNMASKED_VENDOR_WEBGL: canvasWebgl.parameters.UNMASKED_VENDOR_WEBGL,
        });
    };
    const creep = {
        navigator: (!fp.navigator || fp.navigator.lied ? undefined : {
            bluetoothAvailability: fp.navigator.bluetoothAvailability,
            device: fp.navigator.device,
            deviceMemory: fp.navigator.deviceMemory,
            hardwareConcurrency: fp.navigator.hardwareConcurrency,
            // distrust language if worker locale is not trusty
            language: hardenEntropy(fp.workerScope, fp.navigator.language),
            maxTouchPoints: fp.navigator.maxTouchPoints,
            mimeTypes: fp.navigator.mimeTypes,
            oscpu: fp.navigator.oscpu,
            platform: fp.navigator.platform,
            plugins: fp.navigator.plugins,
            system: fp.navigator.system,
            userAgentData: Object.assign(Object.assign({}, (fp.navigator.userAgentData || {})), {
                // loose
                brandsVersion: undefined, uaFullVersion: undefined }),
            vendor: fp.navigator.vendor,
        }),
        screen: (!fp.screen || fp.screen.lied || privacyResistFingerprinting ? undefined :
            hardenEntropy(fp.workerScope, {
                height: fp.screen.height,
                width: fp.screen.width,
                pixelDepth: fp.screen.pixelDepth,
                colorDepth: fp.screen.colorDepth,
                lied: fp.screen.lied,
            })),
        workerScope: !fp.workerScope || fp.workerScope.lied ? undefined : {
            deviceMemory: (braveFingerprintingBlocking ? undefined : fp.workerScope.deviceMemory),
            hardwareConcurrency: (braveFingerprintingBlocking ? undefined : fp.workerScope.hardwareConcurrency),
            // system locale in blink
            language: fp.workerScope.language,
            languages: fp.workerScope.languages,
            platform: fp.workerScope.platform,
            system: fp.workerScope.system,
            device: fp.workerScope.device,
            timezoneLocation: hardenEntropy(fp.workerScope, fp.workerScope.timezoneLocation),
            webglRenderer: ((fp.workerScope.gpu.confidence != 'low') ? fp.workerScope.gpu.compressedGPU : undefined),
            webglVendor: ((fp.workerScope.gpu.confidence != 'low') ? fp.workerScope.webglVendor : undefined),
            userAgentData: Object.assign(Object.assign({}, fp.workerScope.userAgentData), {
                // loose
                brandsVersion: undefined, uaFullVersion: undefined }),
        },
        media: fp.media,
        canvas2d: ((canvas2d) => {
            if (!canvas2d) {
                return;
            }
            const { lied, liedTextMetrics } = canvas2d;
            let data;
            if (!lied) {
                const { dataURI, paintURI, textURI, emojiURI, blob, blobOffscreen } = canvas2d;
                data = Object.assign({ lied }, { dataURI, paintURI, textURI, emojiURI, blob, blobOffscreen });
            }
            if (!liedTextMetrics) {
                const { textMetricsSystemSum, emojiSet } = canvas2d;
                data = Object.assign(Object.assign({}, (data || {})), { textMetricsSystemSum, emojiSet });
            }
            return data;
        })(fp.canvas2d),
        canvasWebgl: !fp.canvasWebgl ? undefined : (braveFingerprintingBlocking ? {
            parameters: Object.assign(Object.assign({}, getBraveUnprotectedParameters(fp.canvasWebgl.parameters)), hardenGPU(fp.canvasWebgl)),
        } : fp.canvasWebgl.lied ? undefined : Object.assign(Object.assign({}, ((gl, canvas2d) => {
            if (canvas2d && canvas2d.lied) {
                // distrust images
                const { extensions, gpu, lied, parameterOrExtensionLie } = gl;
                return {
                    extensions,
                    gpu,
                    lied,
                    parameterOrExtensionLie,
                };
            }
            return gl;
        })(fp.canvasWebgl, fp.canvas2d)), { parameters: Object.assign(Object.assign({}, fp.canvasWebgl.parameters), hardenGPU(fp.canvasWebgl)) })),
        cssMedia: !fp.cssMedia ? undefined : {
            reducedMotion: caniuse(() => fp.cssMedia.mediaCSS['prefers-reduced-motion']),
            colorScheme: (braveFingerprintingBlocking ? undefined :
                caniuse(() => fp.cssMedia.mediaCSS['prefers-color-scheme'])),
            monochrome: caniuse(() => fp.cssMedia.mediaCSS.monochrome),
            invertedColors: caniuse(() => fp.cssMedia.mediaCSS['inverted-colors']),
            forcedColors: caniuse(() => fp.cssMedia.mediaCSS['forced-colors']),
            anyHover: caniuse(() => fp.cssMedia.mediaCSS['any-hover']),
            hover: caniuse(() => fp.cssMedia.mediaCSS.hover),
            anyPointer: caniuse(() => fp.cssMedia.mediaCSS['any-pointer']),
            pointer: caniuse(() => fp.cssMedia.mediaCSS.pointer),
            colorGamut: caniuse(() => fp.cssMedia.mediaCSS['color-gamut']),
            screenQuery: privacyResistFingerprinting ? undefined : hardenEntropy(fp.workerScope, caniuse(() => fp.cssMedia.screenQuery)),
        },
        css: !fp.css ? undefined : {
            interfaceName: caniuse(() => fp.css.computedStyle.interfaceName),
            system: caniuse(() => fp.css.system),
        },
        maths: !fp.maths || fp.maths.lied ? undefined : fp.maths,
        consoleErrors: fp.consoleErrors,
        timezone: !fp.timezone || fp.timezone.lied ? undefined : {
            locationMeasured: hardenEntropy(fp.workerScope, fp.timezone.locationMeasured),
            lied: fp.timezone.lied,
        },
        svg: !fp.svg || fp.svg.lied ? undefined : fp.svg,
        clientRects: !fp.clientRects || fp.clientRects.lied ? undefined : fp.clientRects,
        offlineAudioContext: !fp.offlineAudioContext ? undefined : (braveFingerprintingBlocking ? {
            values: fp.offlineAudioContext.values,
            compressorGainReduction: fp.offlineAudioContext.compressorGainReduction,
        } :
            fp.offlineAudioContext.lied || unknownFirefoxAudio ? undefined :
                fp.offlineAudioContext),
        fonts: !fp.fonts || fp.fonts.lied ? undefined : fp.fonts,
        // skip trash since it is random
        capturedErrors: !!errorsLen,
        lies: !!liesLen,
        resistance: fp.resistance || undefined,
        forceRenew: 1650847106767,
    };
    console.log('%c✔ stable fingerprint passed', 'color:#4cca9f');
    console.groupCollapsed('Stable Fingerprint');
    console.log(creep);
    console.groupEnd();
    console.groupCollapsed('Stable Fingerprint JSON');
    console.log('diff check at https://www.diffchecker.com/diff\n\n', JSON.stringify(creep, null, '\t'));
    console.groupEnd();
    // get/post request
    const webapp = 'https://creepjs-api.web.app/fp';
    const [fpHash, creepHash] = await Promise.all([hashify(fp), hashify(creep)])
        .catch((error) => {
        console.error(error.message);
    }) || [];
    // expose results to the window
    // @ts-ignore
    window.Fingerprint = JSON.parse(JSON.stringify(fp));
    // @ts-ignore
    window.Creep = JSON.parse(JSON.stringify(creep));
    // session
    const computeSession = ({ fingerprint, loading = false, computePreviousLoadRevision = false }) => {
        const data = {
            revisedKeysFromPreviousLoad: [],
            revisedKeys: [],
            initial: '',
            loads: 0,
        };
        try {
            const currentFingerprint = Object.keys(fingerprint).reduce((acc, key) => {
                if (!fingerprint[key]) {
                    return acc;
                }
                acc[key] = fingerprint[key].$hash;
                return acc;
            }, {});
            // @ts-ignore
            const loads = +(sessionStorage.getItem('loads'));
            // @ts-ignore
            const initialFingerprint = JSON.parse(sessionStorage.getItem('initialFingerprint'));
            // @ts-ignore
            const previousFingerprint = JSON.parse(sessionStorage.getItem('previousFingerprint'));
            if (initialFingerprint) {
                data.initial = hashMini(initialFingerprint);
                if (loading) {
                    data.loads = 1 + loads;
                    sessionStorage.setItem('loads', '' + data.loads);
                }
                else {
                    data.loads = loads;
                }
                if (computePreviousLoadRevision) {
                    sessionStorage.setItem('previousFingerprint', JSON.stringify(currentFingerprint));
                }
                const currentFingerprintKeys = Object.keys(currentFingerprint);
                const revisedKeysFromPreviousLoad = currentFingerprintKeys
                    .filter((key) => currentFingerprint[key] != previousFingerprint[key]);
                const revisedKeys = currentFingerprintKeys
                    .filter((key) => currentFingerprint[key] != initialFingerprint[key]);
                // @ts-ignore
                data.revisedKeys = revisedKeys.length ? revisedKeys : [];
                // @ts-ignore
                data.revisedKeysFromPreviousLoad = revisedKeysFromPreviousLoad.length ? revisedKeysFromPreviousLoad : [];
                return data;
            }
            sessionStorage.setItem('initialFingerprint', JSON.stringify(currentFingerprint));
            sessionStorage.setItem('previousFingerprint', JSON.stringify(currentFingerprint));
            sessionStorage.setItem('loads', '' + 1);
            data.initial = hashMini(currentFingerprint);
            data.loads = 1;
            return data;
        }
        catch (error) {
            console.error(error);
            return data;
        }
    };
    // patch dom
    const hasTrash = !!trashLen;
    const { lies: hasLied, capturedErrors: hasErrors } = creep;
    const getBlankIcons = () => `<span class="icon"></span><span class="icon"></span>`;
    const el = document.getElementById('fingerprint-data');
    patch(el, html `
	<div id="fingerprint-data">
		<div class="fingerprint-header-container">
			<div class="fingerprint-header">
				<div class="ellipsis-all">FP ID: ${creepHash}</div>
				<div id="fuzzy-fingerprint">
					<div class="ellipsis-all fuzzy-fp">Fuzzy: <span class="blurred-pause">0000000000000000000000000000000000000000000000000000000000000000</span></div>
					<div class="ellipsis-all fuzzy-diffs">Diffs: <span class="blurred-pause">0000000000000000000000000000000000000000000000000000000000000000</span></div>
				</div>
				<div class="ellipsis"><span class="time">${(timeEnd || 0).toFixed(2)} ms</span></div>
			</div>
		</div>
		<div id="creep-browser" class="visitor-info">
			<div class="flex-grid">
				<div class="col-six">
					<strong id="loader">Loading...</strong>
					<div>trust score: <span class="blurred">100%</span></div>
					<div>visits: <span class="blurred">1</span></div>
					<div>first: <span class="blurred">##/##/####, 00:00:00 AM</span></div>
					<div>alive: <span class="blurred">0.0 hrs</span></div>
					<div id="auto-delete">auto-delete in</div>
					<div>shadow: <span class="blurred">0.00000</span></div>
					<div class="block-text shadow-icon"></div>
				</div>
				<div class="col-six">
					<div>trash (0): none</div>
					<div>lies (0): none</div>
					<div>errors (0): none</div>
					<div>session (0): <span class="blurred">00000000</span></div>
					<div>revisions (0): <span class="blurred">00000000</span></div>
					<div>loose fp (0): <span class="blurred">00000000</span></div>
					<div class="block-text">
						<div class="blurred">bot: 0:friend:00000</div>
						<div class="blurred">idle min-max: 0.000-0.000 hrs</div>
						<div class="blurred">performance benchmark: 0.00 ms</div>
					</div>
					<div id="signature"></div>
				</div>
			</div>
		</div>
		<div id="browser-detection" class="flex-grid">
			<div class="col-six">
				<strong>Loading...</strong>
				<div>${getBlankIcons()}</div>
				<div>${getBlankIcons()}<span class="user-agent">self</span></div>
				<div>${getBlankIcons()}system styles</div>
				<div>${getBlankIcons()}computed styles</div>
				<div>${getBlankIcons()}html element</div>
				<div>${getBlankIcons()}js runtime</div>
				<div>${getBlankIcons()}js engine</div>
				<div>${getBlankIcons()}domRect emojis</div>
				<div>${getBlankIcons()}domRect</div>
				<div>${getBlankIcons()}svg emojis</div>
				<div>${getBlankIcons()}mimeTypes</div>
				<div>${getBlankIcons()}audio</div>
				<div>${getBlankIcons()}canvas image</div>
				<div>${getBlankIcons()}canvas blob</div>
				<div>${getBlankIcons()}canvas paint</div>
				<div>${getBlankIcons()}canvas text</div>
				<div>${getBlankIcons()}canvas emoji</div>
				<div>${getBlankIcons()}textMetrics</div>
				<div>${getBlankIcons()}webgl</div>
				<div>${getBlankIcons()}gpu params</div>
				<div>${getBlankIcons()}gpu model</div>
				<div>${getBlankIcons()}fonts</div>
				<div>${getBlankIcons()}voices</div>
				<div>${getBlankIcons()}screen</div>
				<div>${getBlankIcons()}resistance</div>
				<div>${getBlankIcons()}device of timezone</div>
			</div>
			<div class="col-six icon-prediction-container">
			</div>
		</div>
		<div id="webrtc-connection" class="flex-grid">
			<div class="col-six">
				<strong>WebRTC</strong>
				<div>host connection:</div>
				<div class="block-text"></div>
			</div>
			<div class="col-six">
				<div>capabilities:</div>
				<div>stun connection:</div>
				<div class="block-text"></div>
			</div>
		</div>
		<div class="flex-grid">
			${timezoneHTML(fp)}
			${intlHTML(fp)}
		</div>
		<div id="headless-resistance-detection-results" class="flex-grid">
			${headlessFeaturesHTML(fp)}
			${resistanceHTML(fp)}
		</div>
		<div class="flex-grid relative">${workerScopeHTML(fp)}</div>
		<div class="flex-grid relative">
			${webglHTML(fp)}
			${screenHTML(fp)}
		</div>
		<div class="flex-grid">
			${canvasHTML(fp)}
			${fontsHTML(fp)}
		</div>
		<div class="flex-grid">
			${clientRectsHTML(fp)}
			${svgHTML(fp)}
		</div>
		<div class="flex-grid">
			${audioHTML(fp)}
			${voicesHTML(fp)}
			${mediaHTML(fp)}
		</div>
		<div class="flex-grid relative">${featuresHTML(fp)}</div>
		<div class="flex-grid">
			${cssMediaHTML(fp)}
			${cssHTML(fp)}
		</div>
		<div>
			<div class="flex-grid">
				${mathsHTML(fp)}
				${consoleErrorsHTML(fp)}
			</div>
			<div class="flex-grid">
				${windowFeaturesHTML(fp)}
				${htmlElementVersionHTML(fp)}
			</div>
		</div>
		<div class="flex-grid relative">${navigatorHTML(fp)}</div>
		<div>
			<strong>Tests</strong>
			<div>
				<a class="tests" href="./tests/workers.html">Workers</a>
				<br><a class="tests" href="./tests/iframes.html">Iframes</a>
				<br><a class="tests" href="./tests/fonts.html">Fonts</a>
				<br><a class="tests" href="./tests/timezone.html">Timezone</a>
				<br><a class="tests" href="./tests/window.html">Window Version</a>
				<br><a class="tests" href="./tests/screen.html">Screen</a>
				<br><a class="tests" href="./tests/prototype.html">Prototype</a>
				<br><a class="tests" href="./tests/domrect.html">DOMRect</a>
				<br><a class="tests" href="./tests/emojis.html">Emojis</a>
				<br><a class="tests" href="./tests/math.html">Math</a>
				<br><a class="tests" href="./tests/machine.html">Machine</a>
				<br><a class="tests" href="./tests/extensions.html">Chrome Extensions</a>
				<br><a class="tests" href="./tests/proxy.html">JS Proxy</a>
			</div>
		</div>
	</div>
	`, async () => {
        // get WebRTC data
        getWebRTCData().then((data) => {
            patch(document.getElementById('webrtc-connection'), html `
				<div class="flex-grid">
					${webrtcHTML(data)}
				</div>
			`);
        });
        // fetch fingerprint data from server
        const id = 'creep-browser';
        const visitorElem = document.getElementById(id);
        const { botHash, badBot } = getBotHash(fp, { getFeaturesLie, computeWindowsRelease });
        const fuzzyFingerprint = await getFuzzyHash(fp);
        const { privacy, mode, extension } = fp.resistance || {};
        const resistanceSet = new Set([privacy, (mode ? `(${mode})` : mode), extension]);
        resistanceSet.delete(undefined);
        const resistanceType = [...resistanceSet].join(' ');
        const fetchVisitorDataTimer = timer();
        const request = `${webapp}?id=${creepHash}&subId=${fpHash}&hasTrash=${hasTrash}&hasLied=${hasLied}&hasErrors=${hasErrors}&trashLen=${trashLen}&liesLen=${liesLen}&errorsLen=${errorsLen}&fuzzy=${fuzzyFingerprint}&botHash=${botHash}&perf=${(timeEnd || 0).toFixed(2)}&resistance=${resistanceType}`;
        fetch(request)
            .then((response) => response.json())
            .then(async (data) => {
            console.groupCollapsed('Server Response');
            console.log(JSON.stringify(data, null, '\t'));
            fetchVisitorDataTimer('response time');
            console.groupEnd();
            const { firstVisit,
            // lastVisit: latestVisit,
            // lastVisitEpoch,
            timeHoursAlive: persistence,
            // looseFingerprints: subIds,
            visits, looseSwitchCount: switchCount,
            // hasTrash,
            // hasLied,
            // hasErrors,
            signature, fuzzyInit, fuzzyLast, shadow, shadowBits, score, scoreData, crowdBlendingScore: fpCrowdBlendingScore, bot, botHash, botLevel, timeHoursIdleMin, timeHoursIdleMax, benchmark, resistance: resistanceId, } = data || {};
            const fuzzyFpEl = document.getElementById('fuzzy-fingerprint');
            const fuzzyDiff = getDiffs({
                stringA: fuzzyInit,
                stringB: fuzzyLast,
                charDiff: true,
                decorate: (diff) => `<span class="fuzzy-fp">${diff}</span>`,
            });
            patch(fuzzyFpEl, html `
				<div id="fuzzy-fingerprint">
					<div class="ellipsis-all fuzzy-fp">Fuzzy: <span class="unblurred">${fuzzyInit}</span></div>
					<div class="ellipsis-all fuzzy-diffs">Diffs: <span class="unblurred">${fuzzyDiff}</span></div>
				</div>
			`);
            const toLocaleStr = (str) => {
                const date = new Date(str);
                const dateString = date.toLocaleDateString();
                const timeString = date.toLocaleTimeString();
                return `${dateString}, ${timeString}`;
            };
            const { switchCountPointGain, errorsPointGain, trashPointGain, liesPointGain, shadowBitsPointGain, grade, } = JSON.parse(scoreData);
            const computePoints = (x) => {
                return `<span class="scale-up grade-${x < 0 ? 'F' : x > 0 ? 'A' : ''}">${x > 0 ? `+${x}` : x < 0 ? `${x}` : ''}</span>`;
            };
            const renewedDate = new Date(creep.forceRenew);
            const renewedDateString = `${renewedDate.getMonth() + 1}/${renewedDate.getDate()}/${renewedDate.getFullYear()}`;
            const addDays = (date, n) => {
                const d = new Date(date);
                d.setDate(d.getDate() + n);
                return d;
            };
            const shouldStyle = (renewedDateString) => {
                const endNoticeDate = addDays(renewedDateString, 7);
                const daysRemaining = Math.round((+endNoticeDate - +new Date()) / (1000 * 3600 * 24));
                return daysRemaining >= 0;
            };
            const getChunks = (list, chunkLen) => list.reduce((acc, x, i) => {
                const chunk = Math.floor(i / chunkLen);
                acc[chunk] = [...(acc[chunk] || []), x];
                return acc;
            }, []);
            const styleChunks = (chunks) => chunks.map((y, yi) => {
                const animate = (n) => `animation: balloon ${3 * n}00ms ${6 * n}00ms cubic-bezier(.47,.47,.56,1.26) alternate infinite`;
                return `<div>${y.map((x, xi) => `<span class="${x == '1' ? 'shadow' : 'blank'}" style="${x == 1 ? animate(xi + yi) : ''}"></span>`).join('')}</div>`;
            }).join('');
            const { initial, loads, revisedKeys } = computeSession({ fingerprint: fp, loading: true });
            const template = `
				<div class="visitor-info">
					<span class="time">fingerprints renewed <span class="${shouldStyle(renewedDateString) ? 'renewed' : ''}">${new Date(renewedDateString).toLocaleDateString()}</span></span>
					<div class="flex-grid relative">
						<span class="aside-note-bottom left">${resistanceId}</span>
						<div class="col-six">
							<strong>Browser</strong>
							<div>trust score: <span class="unblurred">
								${score}% <span class="scale-down grade-${grade.charAt(0)}">${grade}</span>
							</span></div>
							<div>visits: <span class="unblurred">${visits}</span></div>
							<div class="ellipsis">first: <span class="unblurred">${toLocaleStr(firstVisit)}</span></div>
							<div>alive: <span class="unblurred">${((hours) => {
                const format = (n) => {
                    const fixed = n.toFixed(1);
                    const shouldMakeNumberWhole = /\.0/.test(fixed);
                    return shouldMakeNumberWhole ? n.toFixed() : fixed;
                };
                return (hours > 48 ? `${format(hours / 24)} days` : `${format(hours)} hrs`);
            })(persistence)}</span></div>
							<div id="auto-delete">auto-delete in</div>
							<div class="relative">shadow: <span class="unblurred">${!shadowBits ? '0' : shadowBits.toFixed(5)}</span>  ${computePoints(shadowBitsPointGain)}
							${!shadowBits ? '' : `<span class="confidence-note">${hashMini(shadow)}</span>`}
							</div>
							<div class="block-text shadow-icon help" title="fuzzy diff history">
								${styleChunks(getChunks(shadow.split(''), 8))}
							</div>
						</div>
						<div class="col-six">
							${trashHTML(fp, computePoints(trashPointGain))}
							${liesHTML(fp, computePoints(liesPointGain))}
							${errorsHTML(fp, computePoints(errorsPointGain))}
							<div>session (${'' + loads}):<span class="unblurred sub-hash">${initial}</span></div>
							<div>revisions (${'' + revisedKeys.length}): ${!revisedKeys.length ? 'none' : modal(`creep-revisions`, revisedKeys.join('<br>'), hashMini(revisedKeys))}
							<div class="ellipsis">loose fp (${'' + switchCount}):<span class="unblurred sub-hash">${hashSlice(fpHash)}</span> ${computePoints(switchCountPointGain)}</div>

							<div class="block-text">
								<div class="unblurred">bot: ${bot.toFixed(2)}:${botLevel}:${botHash}</div>
								<div class="unblurred">idle min-max: ${timeHoursIdleMin}-${timeHoursIdleMax} hrs</div>
								<div class="unblurred">performance benchmark: ${benchmark.toFixed(2)} ms</div>
							</div>

							${signature ?
                `
								<div class="fade-right-in" id="signature">
									<div class="ellipsis"><strong>signed</strong>: <span>${signature}</span></div>
								</div>
								` :
                `<form class="fade-right-in" id="signature">
									<input id="signature-input" type="text" placeholder="add a signature" title="sign this fingerprint" required minlength="4" maxlength="64">
									<input type="submit" value="Sign">
								</form>
								`}
						</div>
					</div>
				</div>
			`;
            patch(visitorElem, html `${template}`, () => {
                // show self destruct time
                const el = document.getElementById('auto-delete');
                const arrivalTime = +new Date;
                const showTime = () => {
                    requestAnimationFrame(showTime);
                    const hoursInMs = 36e5;
                    const day = hoursInMs * 24;
                    const destructionDate = +new Date(+new Date - (day * 30));
                    const hoursTillSelfDestruct = Math.abs(arrivalTime - destructionDate) / hoursInMs / 24;
                    // @ts-ignore
                    return el.style.setProperty('--auto-delete-time', `'${hoursTillSelfDestruct.toFixed(8)}'`);
                };
                showTime();
                // listen to form signature if not already signed
                if (signature) {
                    return;
                }
                const form = document.getElementById('signature');
                // @ts-ignore
                form.addEventListener('submit', async (event) => {
                    event.preventDefault();
                    // @ts-ignore
                    const input = document.getElementById('signature-input').value;
                    const submit = confirm(`Are you sure? This cannot be undone.\n\nsignature: ${input}`);
                    if (!submit) {
                        return;
                    }
                    const signatureRequest = `https://creepjs-api.web.app/sign?id=${creepHash}&signature=${input}`;
                    // animate out
                    // @ts-ignore
                    form.classList.remove('fade-right-in');
                    // @ts-ignore
                    form.classList.add('fade-down-out');
                    // fetch/animate in
                    return fetch(signatureRequest)
                        .then((response) => response.json())
                        .then((data) => {
                        return setTimeout(() => {
                            patch(form, html `
								<div class="fade-right-in" id="signature">
									<div class="ellipsis"><strong>signed</strong>: <span>${input}</span></div>
								</div>
							`);
                            return console.log('Signed: ', JSON.stringify(data, null, '\t'));
                        }, 300);
                    })
                        .catch((error) => {
                        patch(form, html `
							<div class="fade-right-in" id="signature">
								<div class="ellipsis"><strong style="color:crimson">${error}</strong></div>
							</div>
						`);
                        return console.error('Error!', error.message);
                    });
                });
            });
            const { maths, consoleErrors, htmlElementVersion, windowFeatures,
            // css,
            clientRects, offlineAudioContext, resistance, canvas2d, canvasWebgl, screen: screenFp, fonts, voices, svg, media, } = fp || {};
            // const { computedStyle, system } = css || {}
            const isTorBrowser = resistance.privacy == 'Tor Browser';
            const isRFP = resistance.privacy == 'Firefox';
            // const isBravePrivacy = resistance.privacy == 'Brave'
            const screenMetrics = (!screenFp || screenFp.lied || isRFP || isTorBrowser ? 'undefined' :
                `${screenFp.width}x${screenFp.height}`);
            const { compressorGainReduction: gain, sampleSum, floatFrequencyDataSum: freqSum, floatTimeDomainDataSum: timeSum, values: audioValues, } = offlineAudioContext || {};
            const valuesHash = hashMini(audioValues);
            const audioMetrics = `${sampleSum}_${gain}_${freqSum}_${timeSum}_${valuesHash}`;
            const getBestGPUModel = ({ canvasWebgl, workerScope }) => {
                const gpuHasGoodConfidence = (data) => {
                    return ((data.gpu || {}).confidence &&
                        (data.gpu.confidence != 'low'));
                };
                if (!canvasWebgl || canvasWebgl.parameterOrExtensionLie) {
                    return 'undefined';
                }
                else if (workerScope && gpuHasGoodConfidence(workerScope)) {
                    return workerScope.webglRenderer;
                }
                else if (canvasWebgl && !canvasWebgl.parameterOrExtensionLie && gpuHasGoodConfidence(canvasWebgl)) {
                    return '' + ((canvasWebgl.parameters || {}).UNMASKED_RENDERER_WEBGL);
                }
                return 'undefined';
            };
            const gpuModel = encodeURIComponent(getBestGPUModel({ canvasWebgl, workerScope: fp.workerScope }));
            if (!badBot) {
                // get data from session
                // @ts-ignore
                let decryptionData = window.sessionStorage && JSON.parse(sessionStorage.getItem('decryptionData'));
                const targetMetrics = [
                    'canvas2d',
                    'canvasWebgl',
                    'clientRects',
                    'consoleErrors',
                    'css',
                    'cssMedia',
                    'fonts',
                    'htmlElementVersion',
                    'maths',
                    'media',
                    'navigator',
                    'offlineAudioContext',
                    'resistance',
                    'screen',
                    'svg',
                    'timezone',
                    'voices',
                    'windowFeatures',
                    'workerScope',
                    /* disregard metrics not in samples:
                        capturedErrors,
                        features,
                        headless,
                        intl,
                        lies,
                        trash,
                    */
                ];
                const { revisedKeysFromPreviousLoad } = computeSession({
                    fingerprint: fp,
                    computePreviousLoadRevision: true,
                });
                // @ts-ignore
                const sessionFingerprintRevision = targetMetrics.filter((x) => revisedKeysFromPreviousLoad.includes(x));
                const revisionLen = sessionFingerprintRevision.length;
                // fetch data
                const requireNewDecryptionFetch = !decryptionData || revisionLen;
                console.log(`${revisionLen} revisions: fetching prediction data from ${requireNewDecryptionFetch ? 'server' : 'session'}...`);
                if (requireNewDecryptionFetch) {
                    const sender = {
                        e: ({
                            // this just allows us to keep using Math.PI ** -100 results in the data base for consistency
                            80: 1.9275814160560204e-50,
                            58: 1.9275814160560185e-50,
                            77: 1.9275814160560206e-50,
                        })[ENGINE_IDENTIFIER] || 0,
                        l: +new Date('7/1/1113'),
                    };
                    const { userAgent, userAgentData } = fp.workerScope || {};
                    const { platformVersion: fontPlatformVersion } = fp.fonts || {};
                    const restoredUA = getUserAgentRestored({ userAgent, userAgentData, fontPlatformVersion });
                    const windows11UA = attemptWindows11UserAgent({
                        userAgent,
                        userAgentData,
                        fontPlatformVersion,
                    });
                    const workerScopeUserAgent = restoredUA || windows11UA;
                    if (restoredUA && (restoredUA != userAgent)) {
                        console.log(`corrected: ${workerScopeUserAgent}`);
                    }
                    const decryptRequest = `https://creepjs-api.web.app/decrypt?${[
                        `sender=${sender.e}_${sender.l}`,
                        `isTorBrowser=${isTorBrowser}`,
                        `isRFP=${isRFP}`,
                        `isBrave=${isBrave}`,
                        `resistanceId=${resistance.$hash}`,
                        `mathId=${maths.$hash}`,
                        `errorId=${consoleErrors.$hash}`,
                        `htmlId=${htmlElementVersion.$hash}`,
                        `winId=${windowFeatures.$hash}`,
                        `styleId=${styleHash}`,
                        `styleSystemId=${styleSystemHash}`,
                        `emojiId=${!clientRects || clientRects.lied ? 'undefined' :
                            encodeURIComponent(clientRects.domrectSystemSum)}`,
                        `domRectId=${!clientRects || clientRects.lied ? 'undefined' : domRectHash}`,
                        `svgId=${!svg || svg.lied ? 'undefined' :
                            encodeURIComponent(svg.svgrectSystemSum)}`,
                        `mimeTypesId=${!media || media.lied ? 'undefined' : mimeTypesHash}`,
                        `audioId=${!offlineAudioContext ||
                            offlineAudioContext.lied ||
                            unknownFirefoxAudio ? 'undefined' :
                            audioMetrics}`,
                        `canvasId=${!canvas2d || canvas2d.lied ? 'undefined' :
                            canvas2dImageHash}`,
                        `canvasBlobId=${!canvas2d || canvas2d.lied ? 'undefined' :
                            canvas2dBlobHash}`,
                        `canvasPaintId=${!canvas2d || canvas2d.lied ? 'undefined' :
                            canvas2dPaintHash}`,
                        `canvasTextId=${!canvas2d || canvas2d.lied ? 'undefined' :
                            canvas2dTextHash}`,
                        `canvasEmojiId=${!canvas2d || canvas2d.lied ? 'undefined' :
                            canvas2dEmojiHash}`,
                        `textMetricsId=${!canvas2d || canvas2d.liedTextMetrics || ((+canvas2d.textMetricsSystemSum) == 0) ? 'undefined' :
                            encodeURIComponent(canvas2d.textMetricsSystemSum)}`,
                        `webglId=${!canvasWebgl || (canvas2d || {}).lied || canvasWebgl.lied ? 'undefined' :
                            canvasWebglImageHash}`,
                        `gpuId=${!canvasWebgl || canvasWebgl.parameterOrExtensionLie ? 'undefined' :
                            canvasWebglParametersHash}`,
                        `gpu=${gpuModel}`,
                        `fontsId=${!fonts || fonts.lied ? 'undefined' : fonts.$hash}`,
                        `voicesId=${!voices || voices.lied ? 'undefined' : voices.$hash}`,
                        `screenId=${screenMetrics}`,
                        `deviceOfTimezoneId=${deviceOfTimezoneHash}`,
                        `ua=${encodeURIComponent(workerScopeUserAgent)}`,
                    ].join('&')}`;
                    const decryptionResponse = await fetch(decryptRequest)
                        .catch((error) => {
                        console.error(error);
                        predictionErrorPatch({ error, patch, html });
                        return;
                    });
                    if (!decryptionResponse) {
                        return;
                    }
                    decryptionData = await decryptionResponse.json();
                    if (decryptionData && window.sessionStorage) {
                        sessionStorage.setItem('decryptionData', JSON.stringify(decryptionData));
                    }
                }
                // Crowd-Blending Score
                const scoreKeys = [
                    'windowVersion',
                    'jsRuntime',
                    'jsEngine',
                    'htmlVersion',
                    'styleVersion',
                    'resistance',
                    'styleSystem',
                    'emojiSystem',
                    'domRectSystem',
                    'svgSystem',
                    'mimeTypesSystem',
                    'audioSystem',
                    'canvasSystem',
                    'canvasBlobSystem',
                    'canvasPaintSystem',
                    'canvasTextSystem',
                    'canvasEmojiSystem',
                    'textMetricsSystem',
                    'webglSystem',
                    'gpuSystem',
                    'gpuModelSystem',
                    'fontsSystem',
                    'voicesSystem',
                    'screenSystem',
                    'deviceOfTimezone',
                ];
                const decryptionDataScores = scoreKeys.reduce((acc, key) => {
                    const { score } = decryptionData[key] || {};
                    const reporters = (score == 36 ? 1 :
                        score == 84 ? 2 :
                            score == 96 ? 3 :
                                score == 100 ? 4 :
                                    0);
                    // @ts-ignore
                    acc.metrics = [...(acc.metrics || []), { key, score: (score || 0), reporters }];
                    // @ts-ignore
                    acc.scores = [...(acc.scores || []), (score || 0)];
                    return acc;
                }, {});
                // @ts-ignore
                const { metrics: scoreMetrics } = decryptionDataScores;
                const scoreMetricsMap = Object.keys(scoreMetrics).reduce((acc, key) => {
                    const scoreMetricData = scoreMetrics[key];
                    const { score, reporters } = scoreMetricData;
                    acc[scoreMetricData.key] = { score, reporters };
                    return acc;
                }, {});
                // @ts-ignore
                const blockedOrOpenlyPoisonedMetric = decryptionDataScores.scores.includes(0);
                // @ts-ignore
                const validScores = decryptionDataScores.scores.filter((n) => !!n);
                const crowdBlendingScoreMin = Math.min(...validScores);
                const crowdBlendingScore = blockedOrOpenlyPoisonedMetric ? (0.75 * crowdBlendingScoreMin) : crowdBlendingScoreMin;
                console.groupCollapsed(`Crowd-Blending Score: ${crowdBlendingScore}%`);
                console.table(scoreMetricsMap);
                console.groupEnd();
                if (crowdBlendingScore != fpCrowdBlendingScore) {
                    console.log(`updating crowd-blending score from ${fpCrowdBlendingScore} to ${crowdBlendingScore}`);
                    const scoreRequest = `https://creepjs-api.web.app/score-crowd-blending?id=${creepHash}&crowdBlendingScore=${crowdBlendingScore}`;
                    fetch(scoreRequest)
                        .catch((error) => console.error('Failed Score Request', error));
                }
                renderPrediction({ decryptionData, crowdBlendingScore });
            }
            // get GCD Samples
            const getSamples = async () => {
                const samples = window.sessionStorage && sessionStorage.getItem('samples');
                if (samples) {
                    return {
                        samples: JSON.parse(samples),
                        samplesDidLoadFromSession: true,
                    };
                }
                const url = 'https://script.google.com/macros/s/AKfycbw26MLaK1PwIGzUiStwweOeVfl-sEmIxFIs5Ax7LMoP1Cuw-s0llN-aJYS7F8vxQuVG-A/exec';
                const cloudSamples = await fetch(url).then((res) => res.json()).catch((error) => {
                    console.error(error);
                    return;
                });
                if (cloudSamples && window.sessionStorage) {
                    sessionStorage.setItem('samples', JSON.stringify(cloudSamples));
                }
                return {
                    samples: cloudSamples,
                    samplesDidLoadFromSession: false,
                };
            };
            const { samples: decryptionSamples, samplesDidLoadFromSession } = await getSamples();
            // prevent Error: value for argument "documentPath" must point to a document
            const cleanGPUString = (x) => !x ? x : ('' + x).replace(/\//g, '');
            const { window: winSamples, math: mathSamples, error: errorSamples, html: htmlSamples, style: styleSamples, resistance: resistanceSamples, styleVersion: styleVersionSamples, emoji: emojiSamples, domRect: domRectSamples, svg: svgSamples, mimeTypes: mimeTypesSamples, audio: audioSamples, canvas: canvasSamples, canvasBlob: canvasBlobSamples, canvasPaint: canvasPaintSamples, canvasText: canvasTextSamples, canvasEmoji: canvasEmojiSamples, textMetrics: textMetricsSamples, webgl: webglSamples, fonts: fontsSamples, voices: voicesSamples, screen: screenSamples, gpu: gpuSamples, gpuModel: gpuModelSamples, deviceOfTimezone: deviceOfTimezoneSamples, } = decryptionSamples || {};
            if (badBot && !decryptionSamples) {
                predictionErrorPatch({ error: 'Failed prediction fetch', patch, html });
            }
            if (badBot && decryptionSamples) {
                // Perform Dragon Fire Magic
                const decryptionData = {
                    windowVersion: getPrediction({ hash: (windowFeatures || {}).$hash, data: winSamples }),
                    jsRuntime: getPrediction({ hash: (maths || {}).$hash, data: mathSamples }),
                    jsEngine: getPrediction({ hash: (consoleErrors || {}).$hash, data: errorSamples }),
                    htmlVersion: getPrediction({ hash: (htmlElementVersion || {}).$hash, data: htmlSamples }),
                    styleVersion: getPrediction({ hash: styleHash, data: styleVersionSamples }),
                    styleSystem: getPrediction({ hash: styleSystemHash, data: styleSamples }),
                    resistance: getPrediction({ hash: (resistance || {}).$hash, data: resistanceSamples }),
                    emojiSystem: getPrediction({
                        hash: (clientRects || {}).domrectSystemSum,
                        data: emojiSamples,
                    }),
                    domRectSystem: getPrediction({ hash: domRectHash, data: domRectSamples }),
                    svgSystem: getPrediction({
                        hash: (svg || {}).svgrectSystemSum,
                        data: svgSamples,
                    }),
                    mimeTypesSystem: getPrediction({ hash: mimeTypesHash, data: mimeTypesSamples }),
                    audioSystem: getPrediction({ hash: audioMetrics, data: audioSamples }),
                    canvasSystem: getPrediction({ hash: canvas2dImageHash, data: canvasSamples }),
                    canvasBlobSystem: getPrediction({ hash: canvas2dBlobHash, data: canvasBlobSamples }),
                    canvasPaintSystem: getPrediction({ hash: canvas2dPaintHash, data: canvasPaintSamples }),
                    canvasTextSystem: getPrediction({ hash: canvas2dTextHash, data: canvasTextSamples }),
                    canvasEmojiSystem: getPrediction({ hash: canvas2dEmojiHash, data: canvasEmojiSamples }),
                    textMetricsSystem: getPrediction({
                        hash: (canvas2d || {}).textMetricsSystemSum,
                        data: textMetricsSamples,
                    }),
                    webglSystem: getPrediction({ hash: canvasWebglImageHash, data: webglSamples }),
                    gpuSystem: getPrediction({ hash: canvasWebglParametersHash, data: gpuSamples }),
                    gpuModelSystem: getPrediction({ hash: cleanGPUString(gpuModel), data: gpuModelSamples }),
                    fontsSystem: getPrediction({ hash: (fonts || {}).$hash, data: fontsSamples }),
                    voicesSystem: getPrediction({ hash: (voices || {}).$hash, data: voicesSamples }),
                    screenSystem: getPrediction({ hash: screenMetrics, data: screenSamples }),
                    deviceOfTimezone: getPrediction({ hash: deviceOfTimezoneHash, data: deviceOfTimezoneSamples }),
                };
                // @ts-ignore
                renderPrediction({ decryptionData, bot: true });
            }
            // render entropy notes
            if (decryptionSamples) {
                const getEntropy = (hash, data) => {
                    let classTotal = 0;
                    const metricTotal = Object.keys(data)
                        .reduce((acc, key) => acc += data[key].length, 0);
                    const decryption = Object.keys(data).find((key) => data[key].find((item) => {
                        if ((item.id == hash) && (item.reporterTrustScore > 36)) {
                            const trustedSamples = data[key].filter((sample) => {
                                return (sample.reporterTrustScore > 36);
                            });
                            classTotal = trustedSamples.length;
                            return true;
                        }
                        return false;
                    }));
                    return {
                        classTotal,
                        decryption,
                        metricTotal,
                    };
                };
                const entropyHash = {
                    window: (windowFeatures || {}).$hash,
                    math: (maths || {}).$hash,
                    error: (consoleErrors || {}).$hash,
                    html: (htmlElementVersion || {}).$hash,
                    style: styleSystemHash,
                    resistance: (resistance || {}).$hash,
                    styleVersion: styleHash,
                    emoji: (clientRects || {}).domrectSystemSum,
                    domRect: domRectHash,
                    svg: (svg || {}).svgrectSystemSum,
                    mimeTypes: mimeTypesHash,
                    audio: audioMetrics,
                    canvas: canvas2dImageHash,
                    canvasBlob: canvas2dBlobHash,
                    canvasPaint: canvas2dPaintHash,
                    canvasText: canvas2dTextHash,
                    canvasEmoji: canvas2dEmojiHash,
                    textMetrics: (canvas2d || {}).textMetricsSystemSum,
                    webgl: canvasWebglImageHash,
                    fonts: (fonts || {}).$hash,
                    voices: (voices || {}).$hash,
                    screen: screenMetrics,
                    gpu: canvasWebglParametersHash,
                    gpuModel,
                    deviceOfTimezone: deviceOfTimezoneHash,
                };
                const entropyDescriptors = {
                    window: 'window object',
                    math: 'engine math runtime',
                    error: 'engine console errors',
                    html: 'html element',
                    style: 'system styles',
                    resistance: 'resistance patterns',
                    styleVersion: 'computed styles',
                    emoji: 'domrect emojis',
                    domRect: 'domrect metrics',
                    svg: 'svg emojis',
                    mimeTypes: 'media mimeTypes',
                    audio: 'audio metrics',
                    canvas: 'canvas image',
                    canvasBlob: 'canvas blob',
                    canvasPaint: 'canvas paint',
                    canvasText: 'canvas text',
                    canvasEmoji: 'canvas emoji',
                    textMetrics: 'textMetrics',
                    webgl: 'webgl image',
                    fonts: 'system fonts',
                    voices: 'voices',
                    screen: 'screen metrics',
                    gpu: 'webgl parameters',
                    gpuModel: 'webgl renderer',
                    deviceOfTimezone: 'device of timezone',
                };
                Object.keys(decryptionSamples).forEach((key, i) => {
                    const hash = (key == 'gpuModel' ? cleanGPUString(decodeURIComponent(entropyHash[key])) :
                        entropyHash[key]);
                    const { classTotal, decryption,
                    // metricTotal,
                     } = getEntropy(hash, decryptionSamples[key]);
                    const el = document.getElementById(`${key}-entropy`);
                    const deviceMetric = ((key == 'screen') || (key == 'fonts') || (key == 'gpuModel') || (key == 'deviceOfTimezone'));
                    const uniquePercent = !classTotal ? 0 : (1 / classTotal) * 100;
                    const signal = (uniquePercent == 0 ? 'entropy-unknown' :
                        uniquePercent < 1 ? 'entropy-high' :
                            uniquePercent > 10 ? 'entropy-low' :
                                '');
                    const animate = samplesDidLoadFromSession ? '' : `style="animation: fade-up .3s ${100 * i}ms ease both;"`;
                    return patch(el, html `
						<span ${animate} class="${signal} entropy-note help" title="1 of ${classTotal || Infinity}${deviceMetric ? ' in x device' : ` in ${decryption || 'unknown'}`}${` (trusted ${entropyDescriptors[key]})`}">
							${(uniquePercent).toFixed(2)}%
						</span>
					`);
                });
            }
            return renderSamples(decryptionSamples, { fp, styleSystemHash });
        })
            .catch((error) => {
            fetchVisitorDataTimer('Error fetching visitor data');
            const el = document.getElementById('browser-detection');
            console.error('Error!', error.message);
            if (!el) {
                return;
            }
            return patch(el, html `
				<style>
					.rejected {
						background: #ca656e14 !important;
					}
				</style>
				<div class="flex-grid rejected">
					<div class="col-eight">
						${'prediction service unavailable'}
					</div>
					<div class="col-four icon-prediction-container">
					</div>
				</div>
			`);
        });
    });
}();
//# sourceMappingURL=creep.js.map
