(function () {
	'use strict';

	// Detect Browser
	const isChrome = 'chrome' in window;
	const isBrave = 'brave' in navigator;
	const isFirefox = typeof InstallTrigger !== 'undefined';

	// system
	const getOS = userAgent => {
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
			'Other'
		);
		return os
	};

	const decryptUserAgent = ({ua, os, isBrave}) => {
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
	    const likeSafari = (
	        /AppleWebKit/g.test(ua) &&
	        /Safari/g.test(ua)
	    );
	    const safari = (
	        likeSafari &&
	        !firefox &&
	        !chromium &&
	        !edge &&
	        ua.match(/(version)\/(\d+)\.(\d|\.)+\s(mobile|safari)/i)
	    );

	    if (chromium) {
	        const browser = chromium[1];
	        const version = chromium[2];
	        const like = (
	            isOpera ? ' Opera' :
	            isVivaldi ? ' Vivaldi' :
	            isDuckDuckGo ? ' DuckDuckGo' :
	            isYandex ? ' Yandex' :
	            edge ? ' Edge' :
	            isBrave ? ' Brave' : ''
	        );
	        return `${browser} ${version}${like}`
	    } else if (edgios) {
	        const browser = edge[1];
	        const version = edge[2];
	        return `${browser} ${version}`
	    } else if (firefox) {
	        const browser = paleMoon ? paleMoon[1] : firefox[1];
	        const version = paleMoon ? paleMoon[2] : firefox[2];
	        return `${browser} ${version}`
	    } else if (apple && safari) {
	        const browser = 'Safari';
	        const version = safari[2];
	        return `${browser} ${version}`
	    }
	    return 'unknown'
	};


	const nonPlatformParenthesis = /\((khtml|unlike|vizio|like gec|internal dummy|org\.eclipse|openssl|ipv6|via translate|safari|cardamon).+|xt\d+\)/ig;
	const parenthesis = /\((.+)\)/;
	const android = /((android).+)/i;
	const androidNoise = /^(linux|[a-z]|wv|mobile|[a-z]{2}(-|_)[a-z]{2}|[a-z]{2})$|windows|(rv:|trident|webview|iemobile).+/i;
	const androidBuild = /build\/.+\s|\sbuild\/.+/i;
	const androidRelease = /android( |-)\d/i;
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
	const appleRelease = /(ppc |intel |)(mac|mac |)os (x |x|)\d+/i;
	const otherOS = /((symbianos|nokia|blackberry|morphos|mac).+)|\/linux|freebsd|symbos|series \d+|win\d+|unix|hp-ux|bsdi|bsd|x86_64/i;

	const isDevice = (list, device) => list.filter(x => device.test(x)).length;

	const getUserAgentPlatform = ({ userAgent, excludeBuild = true }) => {
		userAgent = userAgent.trim().replace(/\s{2,}/, ' ').replace(nonPlatformParenthesis, '');
		if (parenthesis.test(userAgent)) {
			const platformSection = userAgent.match(parenthesis)[0];
			const identifiers = platformSection.slice(1, -1).replace(/,/g, ';').split(';').map(x => x.trim());

			if (isDevice(identifiers, android)) {
				return identifiers
					.map(x => androidRelease.test(x) ? androidRelease.exec(x)[0].replace('-', ' ') : x)
					.filter(x => !(androidNoise.test(x)))
					.join(' ')
					.replace((excludeBuild ? androidBuild : ''), '')
					.trim().replace(/\s{2,}/, ' ')
			} else if (isDevice(identifiers, windows)) {
				return identifiers
					.filter(x => !(windowsNoise.test(x)))
					.join(' ')
					.replace(/\sNT (\d+\.\d+)/, (match, version) => {
						return (
							version == '10.0' ? ' 10' :
							version == '6.3' ? ' 8.1' :
							version == '6.2' ? ' 8' :
							version == '6.1' ? ' 7' :
							version == '6.0' ? ' Vista' :
							version == '5.2' ? ' XP Pro' :
							version == '5.1' ? ' XP' :
							version == '5.0' ? ' 2000' :
							version == '4.0' ? match :
							' ' + version
						)
					})
					.replace(windows64bitCPU, '(64-bit)')
					.trim().replace(/\s{2,}/, ' ')
			} else if (isDevice(identifiers, cros)) {
				return identifiers
					.filter(x => !(crosNoise.test(x)))
					.join(' ')
					.replace((excludeBuild ? crosBuild : ''), '')
					.trim().replace(/\s{2,}/, ' ')
			} else if (isDevice(identifiers, linux)) {
				return identifiers
					.filter(x => !(linuxNoise.test(x)))
					.join(' ')
					.trim().replace(/\s{2,}/, ' ')
			} else if (isDevice(identifiers, apple)) {
				return identifiers
					.map(x => appleRelease.test(x) ? appleRelease.exec(x)[0] : x)
					.filter(x => !(appleNoise.test(x)))
					.join(' ')
					.replace(/\slike mac.+/ig, '')
					.trim().replace(/\s{2,}/, ' ')
			} else {
				const other = identifiers.filter(x => otherOS.test(x));
				if (other.legnth) {
					return other.join(' ').trim().replace(/\s{2,}/, ' ')
				}
				return identifiers.join(' ')
			}
		} else {
			return 'unknown'
		}
	};

	const logTestResult = ({ test, passed }) => {
		const color = passed ? '#4cca9f' : 'lightcoral';
		const result = passed ? 'passed' : 'failed';
		const symbol = passed ? '✔' : '-';
		return console.log(`%c${symbol} ${test} ${result}`, `color:${color}`)
	};

	// ie11 fix for template.content
	function templateContent(template) {
		// template {display: none !important} /* add css if template is in dom */
		if ('content' in document.createElement('template')) {
			return document.importNode(template.content, true)
		} else {
			const frag = document.createDocumentFragment();
			const children = template.childNodes;
			for (let i = 0, len = children.length; i < len; i++) {
				frag.appendChild(children[i].cloneNode(true));
			}
			return frag
		}
	}

	// tagged template literal (JSX alternative)
	const patch = (oldEl, newEl, fn = null) => {
		oldEl.parentNode.replaceChild(newEl, oldEl);
		return typeof fn === 'function' ? fn() : true
	};
	const html = (stringSet, ...expressionSet) => {
		const template = document.createElement('template');
		template.innerHTML = stringSet.map((str, i) => `${str}${expressionSet[i] || ''}`).join('');
		return templateContent(template) // ie11 fix for template.content
	};

	// template helpers
	const note = {
		unsupported: '<span class="blocked">unsupported</span>',
		blocked: '<span class="blocked">blocked</span>',
		lied: '<span class="lies">lied</span>'
	};
	const count = arr => arr && arr.constructor.name === 'Array' ? ''+(arr.length) : '0';

	// modal component
	const modal = (name, result) => {
		if (!result.length) {
			return ''
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
		<label class="modal-open-btn" for="toggle-open-${name}" onclick="">details</label>
		<label class="modal-container" for="toggle-close-${name}" onclick="">
			<label class="modal-content" for="toggle-open-${name}" onclick="">
				<input type="radio" id="toggle-close-${name}" name="modal-${name}"/>
				<label class="modal-close-btn" for="toggle-close-${name}" onclick="">×</label>
				<div>${result}</div>
			</label>
		</label>
	`
	};

	// https://stackoverflow.com/a/22429679
	const hashMini = str => {
		const json = `${JSON.stringify(str)}`;
		let i, len, hash = 0x811c9dc5;
		for (i = 0, len = json.length; i < len; i++) {
			hash = Math.imul(31, hash) + json.charCodeAt(i) | 0;
		}
		return ('0000000' + (hash >>> 0).toString(16)).substr(-8)
	};

	// instance id
	const instanceId = hashMini(crypto.getRandomValues(new Uint32Array(10)));

	// https://stackoverflow.com/a/53490958
	// https://stackoverflow.com/a/43383990
	// https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest
	const hashify = async (x) => {
		const json = `${JSON.stringify(x)}`;
		const jsonBuffer = new TextEncoder().encode(json);
		const hashBuffer = await crypto.subtle.digest('SHA-256', jsonBuffer);
		const hashArray = Array.from(new Uint8Array(hashBuffer));
		const hashHex = hashArray.map(b => ('00' + b.toString(16)).slice(-2)).join('');
		return hashHex
	};

	const createErrorsCaptured = () => {
		const errors = [];
	  	return {
			getErrors: () => errors,
			captureError: (error, customMessage = null) => {
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
					SecurityError: true
				};
				const hasInnerSpace = s => /.+(\s).+/g.test(s); // ignore AOPR noise
				console.error(error); // log error to educate
				const { name, message } = error;
				const trustedMessage = (
					!hasInnerSpace(message) ? undefined :
					!customMessage ? message :
					`${message} [${customMessage}]`
				);
				const trustedName = type[name] ? name : undefined;
				errors.push(
					{ trustedName, trustedMessage }
				);
				return undefined
			}
		}
	};
	const errorsCaptured = createErrorsCaptured();
	const { captureError } = errorsCaptured;

	const attempt = (fn, customMessage = null) => {
		try {
			return fn()
		} catch (error) {
			if (customMessage) {
				return captureError(error, customMessage)
			}
			return captureError(error)
		}
	};

	const caniuse = (fn, objChainList = [], args = [], method = false) => {
		let api;
		try {
			api = fn();
		} catch (error) {
			return undefined
		}
		let i, len = objChainList.length, chain = api;
		try {
			for (i = 0; i < len; i++) {
				const obj = objChainList[i];
				chain = chain[obj];
			}
		}
		catch (error) {
			return undefined
		}
		return (
			method && args.length ? chain.apply(api, args) :
			method && !args.length ? chain.apply(api) :
			chain
		)
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
		return logEnd => {
			let end = 0;
			try {
				end = performance.now() - start;
				logEnd && console.log(`${logEnd}: ${end / 1000} seconds`);
				return end
			}
			catch (error) {
				captureError(error);
				return 0
			}
		}
	};

	const getCapturedErrors = imports => {

		const {
			require: {
				hashify,
				errorsCaptured
			}
		} = imports;

		const errors = errorsCaptured.getErrors();

		return new Promise(async resolve => {
			const data =  errors;
			const $hash = await hashify(data);
			return resolve({data, $hash })
		})
	};

	// Detect proxy behavior
	const proxyBehavior = x => typeof x == 'function' ? true : false;

	// Detect gibberish 
	const accept = {'aa': 1, 'ab': 1, 'ac': 1, 'ad': 1, 'ae': 1, 'af': 1, 'ag': 1, 'ah': 1, 'ai': 1, 'aj': 1, 'ak': 1, 'al': 1, 'am': 1, 'an': 1, 'ao': 1, 'ap': 1, 'aq': 1, 'ar': 1, 'as': 1, 'at': 1, 'au': 1, 'av': 1, 'aw': 1, 'ax': 1, 'ay': 1, 'az': 1, 'ba': 1, 'bb': 1, 'bc': 1, 'bd': 1, 'be': 1, 'bf': 1, 'bg': 1, 'bh': 1, 'bi': 1, 'bj': 1, 'bk': 1, 'bl': 1, 'bm': 1, 'bn': 1, 'bo': 1, 'bp': 1, 'br': 1, 'bs': 1, 'bt': 1, 'bu': 1, 'bv': 1, 'bw': 1, 'bx': 1, 'by': 1, 'ca': 1, 'cb': 1, 'cc': 1, 'cd': 1, 'ce': 1, 'cg': 1, 'ch': 1, 'ci': 1, 'ck': 1, 'cl': 1, 'cm': 1, 'cn': 1, 'co': 1, 'cp': 1, 'cq': 1, 'cr': 1, 'cs': 1, 'ct': 1, 'cu': 1, 'cw': 1, 'cy': 1, 'cz': 1, 'da': 1, 'db': 1, 'dc': 1, 'dd': 1, 'de': 1, 'df': 1, 'dg': 1, 'dh': 1, 'di': 1, 'dj': 1, 'dk': 1, 'dl': 1, 'dm': 1, 'dn': 1, 'do': 1, 'dp': 1, 'dq': 1, 'dr': 1, 'ds': 1, 'dt': 1, 'du': 1, 'dv': 1, 'dw': 1, 'dx': 1, 'dy': 1, 'dz': 1, 'ea': 1, 'eb': 1, 'ec': 1, 'ed': 1, 'ee': 1, 'ef': 1, 'eg': 1, 'eh': 1, 'ei': 1, 'ej': 1, 'ek': 1, 'el': 1, 'em': 1, 'en': 1, 'eo': 1, 'ep': 1, 'eq': 1, 'er': 1, 'es': 1, 'et': 1, 'eu': 1, 'ev': 1, 'ew': 1, 'ex': 1, 'ey': 1, 'ez': 1, 'fa': 1, 'fb': 1, 'fc': 1, 'fd': 1, 'fe': 1, 'ff': 1, 'fg': 1, 'fh': 1, 'fi': 1, 'fj': 1, 'fk': 1, 'fl': 1, 'fm': 1, 'fn': 1, 'fo': 1, 'fp': 1, 'fr': 1, 'fs': 1, 'ft': 1, 'fu': 1, 'fw': 1, 'fy': 1, 'ga': 1, 'gb': 1, 'gc': 1, 'gd': 1, 'ge': 1, 'gf': 1, 'gg': 1, 'gh': 1, 'gi': 1, 'gj': 1, 'gk': 1, 'gl': 1, 'gm': 1, 'gn': 1, 'go': 1, 'gp': 1, 'gr': 1, 'gs': 1, 'gt': 1, 'gu': 1, 'gw': 1, 'gy': 1, 'gz': 1, 'ha': 1, 'hb': 1, 'hc': 1, 'hd': 1, 'he': 1, 'hf': 1, 'hg': 1, 'hh': 1, 'hi': 1, 'hj': 1, 'hk': 1, 'hl': 1, 'hm': 1, 'hn': 1, 'ho': 1, 'hp': 1, 'hq': 1, 'hr': 1, 'hs': 1, 'ht': 1, 'hu': 1, 'hv': 1, 'hw': 1, 'hy': 1, 'ia': 1, 'ib': 1, 'ic': 1, 'id': 1, 'ie': 1, 'if': 1, 'ig': 1, 'ih': 1, 'ii': 1, 'ij': 1, 'ik': 1, 'il': 1, 'im': 1, 'in': 1, 'io': 1, 'ip': 1, 'iq': 1, 'ir': 1, 'is': 1, 'it': 1, 'iu': 1, 'iv': 1, 'iw': 1, 'ix': 1, 'iy': 1, 'iz': 1, 'ja': 1, 'jc': 1, 'je': 1, 'ji': 1, 'jj': 1, 'jk': 1, 'jn': 1, 'jo': 1, 'ju': 1, 'ka': 1, 'kb': 1, 'kc': 1, 'kd': 1, 'ke': 1, 'kf': 1, 'kg': 1, 'kh': 1, 'ki': 1, 'kj': 1, 'kk': 1, 'kl': 1, 'km': 1, 'kn': 1, 'ko': 1, 'kp': 1, 'kr': 1, 'ks': 1, 'kt': 1, 'ku': 1, 'kv': 1, 'kw': 1, 'ky': 1, 'la': 1, 'lb': 1, 'lc': 1, 'ld': 1, 'le': 1, 'lf': 1, 'lg': 1, 'lh': 1, 'li': 1, 'lj': 1, 'lk': 1, 'll': 1, 'lm': 1, 'ln': 1, 'lo': 1, 'lp': 1, 'lq': 1, 'lr': 1, 'ls': 1, 'lt': 1, 'lu': 1, 'lv': 1, 'lw': 1, 'lx': 1, 'ly': 1, 'lz': 1, 'ma': 1, 'mb': 1, 'mc': 1, 'md': 1, 'me': 1, 'mf': 1, 'mg': 1, 'mh': 1, 'mi': 1, 'mj': 1, 'mk': 1, 'ml': 1, 'mm': 1, 'mn': 1, 'mo': 1, 'mp': 1, 'mq': 1, 'mr': 1, 'ms': 1, 'mt': 1, 'mu': 1, 'mv': 1, 'mw': 1, 'my': 1, 'na': 1, 'nb': 1, 'nc': 1, 'nd': 1, 'ne': 1, 'nf': 1, 'ng': 1, 'nh': 1, 'ni': 1, 'nj': 1, 'nk': 1, 'nl': 1, 'nm': 1, 'nn': 1, 'no': 1, 'np': 1, 'nq': 1, 'nr': 1, 'ns': 1, 'nt': 1, 'nu': 1, 'nv': 1, 'nw': 1, 'nx': 1, 'ny': 1, 'nz': 1, 'oa': 1, 'ob': 1, 'oc': 1, 'od': 1, 'oe': 1, 'of': 1, 'og': 1, 'oh': 1, 'oi': 1, 'oj': 1, 'ok': 1, 'ol': 1, 'om': 1, 'on': 1, 'oo': 1, 'op': 1, 'oq': 1, 'or': 1, 'os': 1, 'ot': 1, 'ou': 1, 'ov': 1, 'ow': 1, 'ox': 1, 'oy': 1, 'oz': 1, 'pa': 1, 'pb': 1, 'pc': 1, 'pd': 1, 'pe': 1, 'pf': 1, 'pg': 1, 'ph': 1, 'pi': 1, 'pj': 1, 'pk': 1, 'pl': 1, 'pm': 1, 'pn': 1, 'po': 1, 'pp': 1, 'pr': 1, 'ps': 1, 'pt': 1, 'pu': 1, 'pw': 1, 'py': 1, 'pz': 1, 'qa': 1, 'qe': 1, 'qi': 1, 'qo': 1, 'qr': 1, 'qs': 1, 'qt': 1, 'qu': 1, 'ra': 1, 'rb': 1, 'rc': 1, 'rd': 1, 're': 1, 'rf': 1, 'rg': 1, 'rh': 1, 'ri': 1, 'rj': 1, 'rk': 1, 'rl': 1, 'rm': 1, 'rn': 1, 'ro': 1, 'rp': 1, 'rq': 1, 'rr': 1, 'rs': 1, 'rt': 1, 'ru': 1, 'rv': 1, 'rw': 1, 'rx': 1, 'ry': 1, 'rz': 1, 'sa': 1, 'sb': 1, 'sc': 1, 'sd': 1, 'se': 1, 'sf': 1, 'sg': 1, 'sh': 1, 'si': 1, 'sj': 1, 'sk': 1, 'sl': 1, 'sm': 1, 'sn': 1, 'so': 1, 'sp': 1, 'sq': 1, 'sr': 1, 'ss': 1, 'st': 1, 'su': 1, 'sv': 1, 'sw': 1, 'sy': 1, 'sz': 1, 'ta': 1, 'tb': 1, 'tc': 1, 'td': 1, 'te': 1, 'tf': 1, 'tg': 1, 'th': 1, 'ti': 1, 'tj': 1, 'tk': 1, 'tl': 1, 'tm': 1, 'tn': 1, 'to': 1, 'tp': 1, 'tr': 1, 'ts': 1, 'tt': 1, 'tu': 1, 'tv': 1, 'tw': 1, 'tx': 1, 'ty': 1, 'tz': 1, 'ua': 1, 'ub': 1, 'uc': 1, 'ud': 1, 'ue': 1, 'uf': 1, 'ug': 1, 'uh': 1, 'ui': 1, 'uj': 1, 'uk': 1, 'ul': 1, 'um': 1, 'un': 1, 'uo': 1, 'up': 1, 'uq': 1, 'ur': 1, 'us': 1, 'ut': 1, 'uu': 1, 'uv': 1, 'uw': 1, 'ux': 1, 'uy': 1, 'uz': 1, 'va': 1, 'vc': 1, 'vd': 1, 've': 1, 'vg': 1, 'vi': 1, 'vl': 1, 'vn': 1, 'vo': 1, 'vr': 1, 'vs': 1, 'vt': 1, 'vu': 1, 'vv': 1, 'vy': 1, 'vz': 1, 'wa': 1, 'wb': 1, 'wc': 1, 'wd': 1, 'we': 1, 'wf': 1, 'wg': 1, 'wh': 1, 'wi': 1, 'wj': 1, 'wk': 1, 'wl': 1, 'wm': 1, 'wn': 1, 'wo': 1, 'wp': 1, 'wr': 1, 'ws': 1, 'wt': 1, 'wu': 1, 'ww': 1, 'wy': 1, 'wz': 1, 'xa': 1, 'xb': 1, 'xc': 1, 'xe': 1, 'xf': 1, 'xg': 1, 'xh': 1, 'xi': 1, 'xl': 1, 'xm': 1, 'xn': 1, 'xo': 1, 'xp': 1, 'xq': 1, 'xs': 1, 'xt': 1, 'xu': 1, 'xv': 1, 'xw': 1, 'xx': 1, 'xy': 1, 'ya': 1, 'yb': 1, 'yc': 1, 'yd': 1, 'ye': 1, 'yf': 1, 'yg': 1, 'yh': 1, 'yi': 1, 'yj': 1, 'yk': 1, 'yl': 1, 'ym': 1, 'yn': 1, 'yo': 1, 'yp': 1, 'yr': 1, 'ys': 1, 'yt': 1, 'yu': 1, 'yv': 1, 'yw': 1, 'yx': 1, 'yz': 1, 'za': 1, 'zb': 1, 'zc': 1, 'zd': 1, 'ze': 1, 'zg': 1, 'zh': 1, 'zi': 1, 'zj': 1, 'zk': 1, 'zl': 1, 'zm': 1, 'zn': 1, 'zo': 1, 'zp': 1, 'zq': 1, 'zs': 1, 'zt': 1, 'zu': 1, 'zv': 1, 'zw': 1, 'zy': 1, 'zz': 1};

	const gibberish = str => {
		const gibbers = [];
		if (!str) {
			return gibbers
		}

		// test letter case sequence
		const tests = [
			/([A-Z]{3,}[a-z])/g, // ABCd
			/([a-z][A-Z]{3,})/g, // aBCD
			/([a-z][A-Z]{2,}[a-z])/g, // aBC...z
			/([a-z][\d]{2,}[a-z])/g, // a##...b
			/([A-Z][\d]{2,}[a-z])/g, // A##...b
			/([a-z][\d]{2,}[A-Z])/g // a##...B
		];
		tests.forEach(regExp => {
			const match = str.match(regExp);
			if (match) {
				return gibbers.push(match.join(', '))
			}
			return
		});

		// test letter sequence
		const clean = str.toLowerCase().replace(/\d|\W|_/g, ' ').replace(/\s+/g,' ').trim().split(' ').join('_');
		const len = clean.length;
		const arr = [...clean];
		arr.forEach((char, index) => {
			const next = index+1;
			if (arr[next] == '_' || char == '_' || next == len) { return true }
			const combo = char+arr[index+1];
			const acceptable = !!accept[combo];
			!acceptable && gibbers.push(combo);
			return 
		});
		return gibbers
	};

	// validate
	const isInt = (x) => typeof x == 'number' && x % 1 == 0;
	const trustInteger = (name, val) => {
		const trusted = isInt(val); 
		return trusted ? val : sendToTrash(name, val)
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
				return response
			}
		}
	};

	const trashBin = createTrashBin();
	const { sendToTrash } = trashBin;

	const getTrash = imports => {
		const {
			require: {
				hashify,
				trashBin
			}
		} = imports;
		const bin = trashBin.getBin();
		return new Promise(async resolve => {
			const $hash = await hashify(bin);
			return resolve({ trashBin: bin, $hash })
		})
	};

	// Collect lies detected
	const createlieRecords = () => {
		const records = [];
	  	return {
			getRecords: () => records,
			documentLie: (name, lieResult, lieTypes) => {
				return records.push({ name, lieTypes, hash: lieResult, lie: hashMini(lieTypes) })
			}
		}
	};

	const lieRecords = createlieRecords();
	const { documentLie } = lieRecords;

	const getNestedWindowFrameContext = imports => {

		const {
			require: {
				instanceId,
				captureError
			}
		} = imports;

		try {
			const createIframe = context => {
				const numberOfIframes = context.length;
				const div = document.createElement('div');
				div.setAttribute('style', 'display:none');
				document.body.appendChild(div);

				const id = [...crypto.getRandomValues(new Uint32Array(10))]
					.map(n => n.toString(36)).join('');

				// avoid dead object error
				const ghost = `
				style="
				height: 100vh;
				width: 100vw;
				position: absolute;
				left:-10000px;
				visibility: hidden;
				"
			`;
				const hide = `style="display: none;"`;
				patch(div, html`<div ${ghost} id="${id}"><iframe ${ isFirefox ? ghost : hide }></iframe></div>`);
				const el = document.getElementById(id);

				return {
					el,
					contentWindow: context[numberOfIframes],
					remove: () => el.parentNode.removeChild(el)
				}
			};

			const parentNest = createIframe(window);
			const { contentWindow } = parentNest;
			return { contentWindow, parentNest }
		}
		catch (error) {
			captureError(error, 'client blocked nested iframe');
			return { contentWindow: window, parentNest: undefined }
		}
	};

	const { contentWindow, parentNest  } = getNestedWindowFrameContext({
		require: { isChrome, isFirefox, instanceId, captureError }
	});

	const getHyperNestedIframes = (numberOfNests, context = window) => {
		let parent, total = numberOfNests;
		return (function getIframeWindow(win, {
			previous = context
		} = {}) {
			if (!win) {
				console.log(`\nnested iframe is valid up to nest ${total - numberOfNests}`);
				return previous
			}
			const numberOfIframes = win.length;
			const div = win.document.createElement('div');
			win.document.body.appendChild(div);
			div.innerHTML = '<iframe></iframe>';
			const iframeWindow = win[numberOfIframes];
			if (total == numberOfNests) {
				parent = div;
				parent.setAttribute('style', 'display:none');
			}
			numberOfNests--;
			if (!numberOfNests) {
				parent.parentNode.removeChild(parent);
				return iframeWindow
			}
			return getIframeWindow(iframeWindow, {
				previous: win
			})
		})(context)
	};
	const hyperNestedIframeWindow = getHyperNestedIframes(20);

	// detect and fingerprint Function API lies
	const native = (result, str, willHaveBlanks = false) => {
		const chrome = `function ${str}() { [native code] }`;
		const chromeGet = `function get ${str}() { [native code] }`;
		const firefox = `function ${str}() {\n    [native code]\n}`;
		const chromeBlank = `function () { [native code] }`;
		const firefoxBlank = `function () {\n    [native code]\n}`;
		return (
			result == chrome ||
			result == chromeGet ||
			result == firefox || (
				willHaveBlanks && (result == chromeBlank || result == firefoxBlank)
			)
		)
	};

	const testLookupGetter = (proto, name) => {
		if (proto.__lookupGetter__(name)) {
			return {
				[`Expected __lookupGetter__ to return undefined`]: true
			}
		}
		return false
	};

	const testLength = (apiFunction, name) => {
		const apiLen = {
			createElement: [true, 1],
			createElementNS: [true, 2],
			toBlob: [true, 1],
			getImageData: [true, 4],
			measureText: [true, 1],
			toDataURL: [true, 0],
			getContext: [true, 1],
			getParameter: [true, 1],
			getExtension: [true, 1],
			getSupportedExtensions: [true, 0],
			getParameter: [true, 1],
			getExtension: [true, 1],
			getSupportedExtensions: [true, 0],
			getClientRects: [true, 0],
			getChannelData: [true, 1],
			copyFromChannel: [true, 2],
			getTimezoneOffset: [true, 0]
		};
		if (apiLen[name] && apiLen[name][0] && apiFunction.length != apiLen[name][1]) {
			return {
				[`Expected length ${apiLen[name][1]} and got ${apiFunction.length}`]: true
			}
		}
		return false
	};

	const testEntries = apiFunction => {
		const objectFail = {
			entries: 0,
			keys: 0,
			values: 0
		};
		let totalFail = 0;
		const objEntriesLen = Object.entries(apiFunction).length;
		const objKeysLen = Object.keys(apiFunction).length;
		const objKeysValues = Object.values(apiFunction).length;
		if (!!objEntriesLen) {
			totalFail++;
			objectFail.entries = objEntriesLen;
		}
		if (!!objKeysLen) {
			totalFail++;
			objectFail.keys = objKeysLen;
		}
		if (!!objKeysValues) {
			totalFail++;
			objectFail.values = objKeysValues;
		}
		if (totalFail) {
			return {
				[`Expected entries, keys, values [0, 0, 0] and got [${objectFail.entries}, ${objectFail.keys}, ${objectFail.values}]`]: true
			}
		}
		return false
	};

	const testPrototype = apiFunction => {
		if ('prototype' in apiFunction) {
			return {
				[`Unexpected 'prototype' in function`]: true
			}
		} 
		return false
	};

	const testNew = apiFunction => {
		try {
			new apiFunction;
			return {
				['Expected new to throw an error']: true
			}
		}
		catch (error) {
			// Native throws error
			return false
		}
	};

	const testClassExtends = apiFunction => {
		try { 
			class Fake extends apiFunction { }
			return {
				['Expected class extends to throw an error']: true
			}
		}
		catch (error) {
			// Native throws error
			return false
		}
	};

	const testSetPrototypeNull = apiFunction => {
		const nativeProto = Object.getPrototypeOf(apiFunction);
		try { 
			Object.setPrototypeOf(apiFunction, null)+'';
			Object.setPrototypeOf(apiFunction, nativeProto);
			return {
				['Expected set prototype null to throw an error']: true
			}
		}
		catch (error) {
			// Native throws error
			Object.setPrototypeOf(apiFunction, nativeProto);
			return false
		}
	};

	const testName = (apiFunction, name) => {
		const { name: apiName } = apiFunction;
		if (apiName != '' && apiName != name) {
			return {
				[`Expected name "${name}" and got "${apiName}"`]: true
			}
		}
		return false
	};

	const testToString = (apiFunction, fnToStr, contentWindow) => {
		const { toString: apiToString } = apiFunction;
		if (apiToString+'' !== fnToStr || apiToString.toString+'' !== fnToStr) {
			return {
				[`Expected toString to match ${contentWindow ? 'contentWindow.' : ''}Function.toString`]: true
			}
		}
		return false
	};

	const testOwnProperty = apiFunction => {
		const notOwnProperties = [];
		if (apiFunction.hasOwnProperty('arguments')) {
			notOwnProperties.push('arguments');
		}
		if (apiFunction.hasOwnProperty('caller')) {
			notOwnProperties.push('caller');
		}
		if (apiFunction.hasOwnProperty('prototype')) {
			notOwnProperties.push('prototype');
		}
		if (apiFunction.hasOwnProperty('toString')) {
			notOwnProperties.push('toString');
		}
		if (!!notOwnProperties.length) {
			return {
				[`Unexpected own property: ${notOwnProperties.join(', ')}`]: true
			}
		}
		return false
	};

	const testOwnPropertyDescriptor = apiFunction => {
		const notDescriptors = [];
		if (!!Object.getOwnPropertyDescriptor(apiFunction, 'arguments') ||
			!!Reflect.getOwnPropertyDescriptor(apiFunction, 'arguments')) {
			notDescriptors.push('arguments');
		}
		if (!!Object.getOwnPropertyDescriptor(apiFunction, 'caller') ||
			!!Reflect.getOwnPropertyDescriptor(apiFunction, 'caller')) {
			notDescriptors.push('caller');
		}
		if (!!Object.getOwnPropertyDescriptor(apiFunction, 'prototype') ||
			!!Reflect.getOwnPropertyDescriptor(apiFunction, 'prototype')) {
			notDescriptors.push('prototype');
		}
		if (!!Object.getOwnPropertyDescriptor(apiFunction, 'toString') ||
			!!Reflect.getOwnPropertyDescriptor(apiFunction, 'toString')) {
			notDescriptors.push('toString');
		}
		if (!!notDescriptors.length) {
			return {
				[`Unexpected descriptor: ${notDescriptors.join(', ')}`]: true
			}
		}
		return
	};

	const testDescriptorKeys = apiFunction => {
		const descriptorKeys = Object.keys(Object.getOwnPropertyDescriptors(apiFunction));
		if (''+descriptorKeys != 'length,name' && ''+descriptorKeys != 'name,length') {
			return {
				['Expected own property descriptor keys [length, name]']: true
			}
		}
		return false
	};

	const testOwnPropertyNames = apiFunction => {
		const ownPropertyNames = Object.getOwnPropertyNames(apiFunction);
		if (''+ownPropertyNames != 'length,name' && ''+ownPropertyNames != 'name,length') {
			return {
				['Expected own property names [length, name]']: true
			}
		}
		return false
	};

	const testOwnKeys = apiFunction => {
		const ownKeys = Reflect.ownKeys(apiFunction);
		if (''+ownKeys != 'length,name' && ''+ownKeys != 'name,length') {
			return {
				['Expected own keys [length, name]']: true
			}
		}
		return false
	};

	const testSpread = apiFunction => {
		const ownPropLen = Object.getOwnPropertyNames({...apiFunction}).length;
		if (ownPropLen) {
			return {
				[`Expected 0 own property names in spread and got ${ownPropLen}`]: true
			}
		}
		return false
	};

	const testDescriptor = (proto, name) => {
		const descriptor = Object.getOwnPropertyDescriptor(proto, name);
		const ownPropLen = Object.getOwnPropertyNames(descriptor).length;
		const ownKeysLen = Reflect.ownKeys(descriptor).length;
		const keysLen = Object.keys(descriptor).length;
		if (ownPropLen != keysLen || ownPropLen != ownKeysLen) {
			return {
				['Expected keys and own property names to match in length']: true
			}
		}
		return false
	};

	const testGetToString = (proto, name) => {
		try {
			Object.getOwnPropertyDescriptor(proto, name).get.toString();
			Reflect.getOwnPropertyDescriptor(proto, name).get.toString();
			return {
				['Expected descriptor.get.toString() to throw an error']: true
			}
		}
		catch (error) {
			// Native throws error
			return false
		}
	};

	const testIllegal = (api, name) => {
		let illegalCount = 0;
		const illegal = [
			'',
			'is',
			'call',
			'seal',
			'keys',
			'bind',
			'apply',
			'assign',
			'freeze',
			'values',
			'entries',
			'toString',
			'isFrozen',
			'isSealed',
			'constructor',
			'isExtensible',
			'getPrototypeOf',
			'preventExtensions',
			'propertyIsEnumerable',
			'getOwnPropertySymbols',
			'getOwnPropertyDescriptors'
		];
		try {
			api[name];
			illegalCount++;
		}
		catch (error) {
			// Native throws error
		}
		illegal.forEach((prop, index) => {
			try {
				!prop ? Object(api[name]) : Object[prop](api[name]);
				illegalCount++;
			}
			catch (error) {
				// Native throws error
			}
		});
		if (illegalCount) {
			const total = illegal.length+1;
			return {
				[`Expected illegal invocation error: ${total-illegalCount} of ${total} passed`]: true
			}
		}
		return false
	};

	const testValue = (obj, name) => {
		try {
			Object.getOwnPropertyDescriptor(obj, name).value;
			Reflect.getOwnPropertyDescriptor(obj, name).value;
			return {
				['Expected descriptor.value to throw an error']: true
			}
		}
		catch (error) {
			// Native throws error
			return false
		}
	};

	const hasLiedAPI = (api, name, obj) => {
		
		const fnToStr = (
			contentWindow ? 
			contentWindow.Function.prototype.toString.call(Function.prototype.toString) : // aggressive test
			Function.prototype.toString+''
		);

		let willHaveBlanks = false;
		try {
			willHaveBlanks = obj && (obj+'' == '[object Navigator]' || obj+'' == '[object Document]');
		}
		catch (error) { }

		if (typeof api == 'function') {
			const proto = obj;
			const apiFunction = api;
			try {
				const testResults = new Set(
					[
						testLookupGetter(proto, name),
						testLength(apiFunction, name),
						testEntries(apiFunction),
						testGetToString(proto, name),
						testSpread(apiFunction),
						testSetPrototypeNull(apiFunction),

						// common tests
						testPrototype(apiFunction),
						testNew(apiFunction),
						testClassExtends(apiFunction),
						testName(apiFunction, name),
						testToString(apiFunction, fnToStr, contentWindow),
						testOwnProperty(apiFunction),
						testOwnPropertyDescriptor(apiFunction),
						testDescriptorKeys(apiFunction),
						testOwnPropertyNames(apiFunction),
						testOwnKeys(apiFunction),
						testDescriptor(proto, name)
					]
				);
				testResults.delete(false);
				testResults.delete(undefined);
				const lies = [...testResults];

				// collect string conversion result
				const result = (
					contentWindow ? 
					contentWindow.Function.prototype.toString.call(apiFunction) :
					'' + apiFunction
				);
				
				// fingerprint result if it does not match native code
				let fingerprint = '';
				if (!native(result, name, willHaveBlanks)) {
					fingerprint = result;
				}
				
				return {
					lie: lies.length || fingerprint ? { lies, fingerprint } : false 
				}
			}
			catch (error) {
				captureError(error);
				return false
			}
		}

		if (typeof api == 'object' && caniuse(() => obj[name]) != undefined) {
				
			try {
				const proto = api;
				const apiFunction = Object.getOwnPropertyDescriptor(api, name).get;
				const testResults = new Set(
					[
						testIllegal(api, name),
						testValue(obj, name),
						
						// common tests
						testPrototype(apiFunction),
						testNew(apiFunction),
						testClassExtends(apiFunction),
						testName(apiFunction, name),
						testToString(apiFunction, fnToStr, contentWindow),
						testOwnProperty(apiFunction),
						testOwnPropertyDescriptor(apiFunction),
						testDescriptorKeys(apiFunction),
						testOwnPropertyNames(apiFunction),
						testOwnKeys(apiFunction),
						testDescriptor(proto, name)
					]
				);
				testResults.delete(false);
				testResults.delete(undefined);
				const lies = [...testResults];
				// collect string conversion result
				const result = (
					contentWindow ? 
					contentWindow.Function.prototype.toString.call(apiFunction) :
					'' + apiFunction
				);

				let objlookupGetter, apiProtoLookupGetter, result2, result3;
				if (obj) {
					objlookupGetter = obj.__lookupGetter__(name);
					apiProtoLookupGetter = api.__lookupGetter__(name);
					const contentWindowResult = (
						typeof objlookupGetter != 'function' ? undefined : 
						attempt(() => contentWindow.Function.prototype.toString.call(objlookupGetter))
					);
					result2 = (
						contentWindowResult ? 
						contentWindowResult :
						'' + objlookupGetter
					);
					result3 = '' + apiProtoLookupGetter;
				}

				// fingerprint result if it does not match native code
				let fingerprint = '';
				if (!native(result, name, willHaveBlanks)) {
					fingerprint = result;
				}
				else if (obj && !native(result2, name, willHaveBlanks)) {
					fingerprint = result2;
				}
				else if (obj && !native(result3, name, willHaveBlanks)) {
					fingerprint = result3 != 'undefined' ? result3 : '';
				}

				return {
					lie: lies.length || fingerprint ? { lies, fingerprint } : false
				}
			}
			catch (error) {
				captureError(error);
				return false
			}
		}

		return false
	};

	// deep search lies
	const getMethods = (obj, ignore) => {
		if (!obj) {
			return []
		}
		return Object.getOwnPropertyNames(obj).filter(item => {
			if (ignore[item]) {
				// validate critical methods elsewhere
				return false
			}
			try {
				return typeof obj[item] === 'function'
			}
			catch (error) {
				return false
			}
		})
	};
	const getValues = (obj, ignore) => {
		if (!obj) {
			return []
		}
		return Object.getOwnPropertyNames(obj).filter(item => {
			if (ignore[item]) {
				// validate critical methods elsewhere
				return false
			}
			try {
				return (
					typeof obj[item] == 'string' ||
					typeof obj[item] == 'number' ||
					!obj[item]
				)
			}
			catch (error) {
				return false
			}
		})
	};
	const intlConstructors = {
		'Collator': !0,
		'DateTimeFormat': !0,
		'DisplayNames': !0,
		'ListFormat': !0,
		'NumberFormat': !0,
		'PluralRules': !0,
		'RelativeTimeFormat': !0
	};

	const createLieProps = () => {
		const props = {};
	  	return {
			getProps: () => props,
			searchLies: (obj, ignoreProps, { logToConsole = false, proto = null } = {}) => {
				if (!obj) {
					return
				}
				let methods;
				const isMath = (obj+'' == '[object Math]');
				const isTypeofObject = typeof obj == 'object';
				if (isMath) {
					methods = getMethods(obj, ignoreProps);
				}
				else if (isTypeofObject) {
					methods = getValues(obj, ignoreProps);
				}
				else {
					methods = getMethods(obj.prototype, ignoreProps);
				}
				return methods.forEach(name => {
					let domManipLie;
					if (isMath) {
						domManipLie = hasLiedAPI(obj[name], name, obj).lie;
						if (domManipLie) {
							const apiName = `Math.${name}`;
							props[apiName] = true;
							documentLie(apiName, undefined, domManipLie);
						}
					}
					else if (isTypeofObject) {
						domManipLie = hasLiedAPI(proto, name, obj).lie;
						if (domManipLie) {
							const objName = /\s(.+)\]/g.exec(proto)[1];
							const apiName = `${objName}.${name}`;
							props[apiName] = true;
							documentLie(apiName, undefined, domManipLie);
						}
					}
					else {
						domManipLie = hasLiedAPI(obj.prototype[name], name, obj.prototype).lie;
						if (domManipLie) {
							const objName = /\s(.+)\(\)/g.exec(obj)[1];
							const apiName = `${intlConstructors[objName] ? 'Intl.' : ''}${objName}.${name}`;
							props[apiName] = true;
							documentLie(apiName, undefined, domManipLie);
						}
					}
					if (logToConsole) {
						console.log(name, domManipLie);
					}	
				})
			}
		}
	};

	const lieProps = createLieProps();
	const { searchLies } = lieProps;

	searchLies(Node, {
		constructor: !0,
		appendChild: !0 // opera fix
	});
	searchLies(Element, {
		constructor: !0,
		querySelector: !0, // opera fix
		setAttribute: !0 // opera fix
	});
	searchLies(HTMLElement, {
		constructor: !0,
		requestFullscreen: !0 // in FF mobile, this does not appear native 
	});
	searchLies(HTMLCanvasElement, {
		constructor: !0
	});
	searchLies(Navigator, {
		constructor: !0
	});
	searchLies(navigator, {
		constructor: !0
	}, { logToConsole: false, proto: Navigator.prototype });
	searchLies(Screen, {
		constructor: !0
	});
	searchLies(screen, {
		constructor: !0
	}, { logToConsole: false, proto: Screen.prototype });
	searchLies(Date, {
		constructor: !0,
		toGMTString: !0
	});
	searchLies(Intl.Collator, {
		constructor: !0
	});
	searchLies(Intl.DateTimeFormat, {
		constructor: !0
	});
	searchLies(caniuse(() => Intl.DisplayNames), {
		constructor: !0
	});
	searchLies(Intl.ListFormat, {
		constructor: !0
	});
	searchLies(Intl.NumberFormat, {
		constructor: !0
	});
	searchLies(Intl.PluralRules, {
		constructor: !0
	});
	searchLies(Intl.RelativeTimeFormat, {
		constructor: !0
	});	
	searchLies(Function, {
		constructor: !0
	});
	searchLies(caniuse(() => AnalyserNode), {
		constructor: !0
	});
	searchLies(caniuse(() => AudioBuffer), {
		constructor: !0
	});
	searchLies(SVGTextContentElement, {
		constructor: !0
	});
	searchLies(CanvasRenderingContext2D, {
		constructor: !0
	});
	searchLies(caniuse(() => WebGLRenderingContext), {
		constructor: !0,
		makeXRCompatible: !0, // ignore
	});
	searchLies(caniuse(() => WebGL2RenderingContext), {
		constructor: !0,
		makeXRCompatible: !0, // ignore
	});
	searchLies(Math, {
		constructor: !0
	});
	searchLies(PluginArray, {
		constructor: !0
	});
	searchLies(Plugin, {
		constructor: !0
	});
	searchLies(Document, {
		constructor: !0,
		createElement: !0, // opera fix
		createTextNode: !0, // opera fix
		querySelector: !0 // opera fix
	});
	searchLies(String, {
		constructor: !0,
		trimRight: !0,
		trimLeft: !0
	});

	const getLies = imports => {

		const {
			require: {
				hashify,
				lieRecords
			}
		} = imports;

		const records = lieRecords.getRecords();
		return new Promise(async resolve => {
			let totalLies = 0;
			records.forEach(lie => {
				if (!!lie.lieTypes.fingerprint) {
					totalLies++;
				}
				if (!!lie.lieTypes.lies) {
					totalLies += lie.lieTypes.lies.length;
				}
			});
			const data = records
				.map(lie => ({ name: lie.name, lieTypes: lie.lieTypes }))
				.sort((a, b) => (a.name > b.name) ? 1 : -1);
			const $hash = await hashify(data);
			return resolve({data, totalLies, $hash })
		})
	};

	const getOfflineAudioContext = imports => {
		
		const {
			require: {
				hashMini,
				hashify,
				captureError,
				attempt,
				caniuse,
				sendToTrash,
				documentLie,
				lieProps,
				contentWindow,
				logTestResult
			}
		} = imports;

		return new Promise(resolve => {
			try {
				const win = contentWindow ? contentWindow : window;
				const audioContext = caniuse(() => win.OfflineAudioContext || win.webkitOfflineAudioContext);
				if (!audioContext) {
					logTestResult({ test: 'audio', passed: false });
					return resolve()
				}
				// detect lies
				const channelDataLie = lieProps['AudioBuffer.getChannelData'];
				const copyFromChannelLie = lieProps['AudioBuffer.copyFromChannel'];
				let lied = (channelDataLie || copyFromChannelLie) || false;
				
				const context = new audioContext(1, 44100, 44100);
				const analyser = context.createAnalyser();
				const oscillator = context.createOscillator();
				const dynamicsCompressor = context.createDynamicsCompressor();
				const biquadFilter = context.createBiquadFilter();

				oscillator.type = 'triangle';
				oscillator.frequency.value = 10000;

				if (dynamicsCompressor.threshold) { dynamicsCompressor.threshold.value = -50; }
				if (dynamicsCompressor.knee) { dynamicsCompressor.knee.value = 40; }
				if (dynamicsCompressor.ratio) { dynamicsCompressor.ratio.value = 12; }
				if (dynamicsCompressor.reduction) { dynamicsCompressor.reduction.value = -20; }
				if (dynamicsCompressor.attack) { dynamicsCompressor.attack.value = 0; }
				if (dynamicsCompressor.release) { dynamicsCompressor.release.value = 0.25; }

				oscillator.connect(dynamicsCompressor);
				dynamicsCompressor.connect(context.destination);
				oscillator.start(0);
				context.startRendering();

				const dataArray = new Float32Array(analyser.frequencyBinCount);
				analyser.getFloatFrequencyData(dataArray);
				const floatFrequencyUniqueDataSize = new Set(dataArray).size;
				if (floatFrequencyUniqueDataSize > 1) {
					lied = true;
					const floatFrequencyDataLie = { fingerprint: '', lies: [{ [`Expected 1 unique frequency and got ${floatFrequencyUniqueDataSize}`]: true }] };
					documentLie(`AnalyserNode.getFloatFrequencyData`, floatFrequencyUniqueDataSize, floatFrequencyDataLie);
				}

				let copySample = [];
				let binsSample = [];
				let matching = false;
				
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
						const chain = ['context', 'listener', 'forwardX', 'maxValue'];
						return caniuse(() => analyser, chain)
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
					['OscillatorNode.frequency.minValue']: attempt(() => oscillator.frequency.minValue)
				};
				
				return resolve(new Promise(resolve => {
					context.oncomplete = async event => {
						try {
							const copy = new Float32Array(44100);
							caniuse(() => event.renderedBuffer.copyFromChannel(copy, 0));
							const bins = event.renderedBuffer.getChannelData(0);
							
							copySample = copy ? [...copy].slice(4500, 4600) : [sendToTrash('invalid Audio Sample Copy', null)];
							binsSample = bins ? [...bins].slice(4500, 4600) : [sendToTrash('invalid Audio Sample', null)];
							
							const copyJSON = copy && JSON.stringify([...copy].slice(4500, 4600));
							const binsJSON = bins && JSON.stringify([...bins].slice(4500, 4600));

							matching = binsJSON === copyJSON;
							// detect lie
							const copyFromChannelSupported = ('copyFromChannel' in AudioBuffer.prototype);
							if (copyFromChannelSupported && !matching) {
								lied = true;
								const audioSampleLie = { fingerprint: '', lies: [{ ['data and copy samples mismatch']: false }] };
								documentLie('AudioBuffer', hashMini(matching), audioSampleLie);
							}

							dynamicsCompressor.disconnect();
							oscillator.disconnect();
							const response = {
								binsSample: binsSample,
								copySample: copyFromChannelSupported ? copySample : [undefined],
								matching,
								values,
								lied
							};
							const $hash = await hashify(response);
							logTestResult({ test: 'audio', passed: true });
							return resolve({...response, $hash })
						}
						catch (error) {
							captureError(error, 'AudioBuffer failed or blocked by client');
							dynamicsCompressor.disconnect();
							oscillator.disconnect();
							const response = {
								copySample: [undefined],
								binsSample: [undefined],
								matching,
								values,
								lied
							};
							const $hash = await hashify(response);
							logTestResult({ test: 'audio', passed: false });
							return resolve({...response, $hash })
						}
					};
				}))
			}
			catch (error) {
				logTestResult({ test: 'audio', passed: false });
				captureError(error, 'OfflineAudioContext failed or blocked by client');
				return resolve()
			}
		})
	};

	const getCanvas2d = imports => {
		
		const {
			require: {
				hashify,
				hashMini,
				captureError,
				lieProps,
				documentLie,
				contentWindow,
				hyperNestedIframeWindow,
				logTestResult
			}
		} = imports;
		
		return new Promise(async resolve => {
			try {
				const dataLie = lieProps['HTMLCanvasElement.toDataURL'];
				const contextLie = lieProps['HTMLCanvasElement.getContext'];
				let lied = (dataLie || contextLie) || false;
				const doc = contentWindow ? contentWindow.document : document;
				const canvas = doc.createElement('canvas');
				const context = canvas.getContext('2d');
				const str = '!😃🙌🧠👩‍💻👟👧🏻👩🏻‍🦱👩🏻‍🦰👱🏻‍♀️👩🏻‍🦳👧🏼👧🏽👧🏾👧🏿🦄🐉🌊🍧🏄‍♀️🌠🔮♞';
				context.font = '14px Arial';
				context.fillText(str, 0, 50);
				context.fillStyle = 'rgba(100, 200, 99, 0.78)';
				context.fillRect(100, 30, 80, 50);
				const dataURI = canvas.toDataURL();
				if (hyperNestedIframeWindow) {
					const result1 = hashMini(hyperNestedIframeWindow.document.createElement('canvas').toDataURL());
					const result2 = hashMini(document.createElement('canvas').toDataURL());
					if (result1 != result2) {
						lied = true;
						const hyperNestedIframeLie = { fingerprint: '', lies: [{ [`Expected ${result1} in nested iframe and got ${result2}`]: true }] };
						documentLie(`HTMLCanvasElement.toDataURL`, hashMini({result1, result2}), hyperNestedIframeLie);
					}
				}
				const $hash = await hashify(dataURI);
				const response = { dataURI, lied, $hash };
				logTestResult({ test: 'canvas 2d', passed: true });
				return resolve(response)
			}
			catch (error) {
				logTestResult({ test: 'canvas 2d', passed: false });
				captureError(error);
				return resolve()
			}
		})
	};

	const getCanvasBitmapRenderer = imports => {

		const {
			require: {
				hashify,
				captureError,
				caniuse,
				lieProps,
				contentWindow,
				hyperNestedIframeWindow,
				logTestResult
			}
		} = imports;

		return new Promise(async resolve => {
			try {
				const dataLie = lieProps['HTMLCanvasElement.toDataURL'];
				const contextLie = lieProps['HTMLCanvasElement.getContext'];
				let lied = (dataLie || contextLie) || false;
				if (hyperNestedIframeWindow &&
					hyperNestedIframeWindow.document.createElement('canvas').toDataURL() != document.createElement('canvas').toDataURL()) {
					lied = true;
				}
				const doc = contentWindow ? contentWindow.document : document;
				const canvas = doc.createElement('canvas');
				const context = canvas.getContext('bitmaprenderer');
				const image = new Image();
				image.src = 'bitmap.png';
				return resolve(new Promise(resolve => {
					image.onload = async () => {
						if (!caniuse(() => createImageBitmap)) {
							logTestResult({ test: 'canvas bitmaprenderer', passed: false });
							return resolve()
						}
						const bitmap = await createImageBitmap(image, 0, 0, image.width, image.height);
						context.transferFromImageBitmap(bitmap);
						const dataURI = canvas.toDataURL();
						const $hash = await hashify(dataURI);
						const response = { dataURI, lied, $hash };
						logTestResult({ test: 'canvas bitmaprenderer', passed: true });
						return resolve(response)
					};
				}))	
			}
			catch (error) {
				logTestResult({ test: 'canvas bitmaprenderer', passed: false });
				captureError(error);
				return resolve()
			}
		})
	};

	const getCanvasWebgl = imports => {

		const {
			require: {
				hashify,
				captureError,
				attempt,
				caniuse,
				gibberish,
				sendToTrash,
				proxyBehavior,
				lieProps,
				contentWindow,
				hyperNestedIframeWindow,
				logTestResult
			}
		} = imports;

		return new Promise(async resolve => {
			try {
				// detect lies
				const dataLie = lieProps['HTMLCanvasElement.toDataURL'];
				const contextLie = lieProps['HTMLCanvasElement.getContext'];
				let lied = (
					dataLie ||
					contextLie ||
					lieProps['WebGLRenderingContext.getParameter'] ||
					lieProps['WebGL2RenderingContext.getParameter'] ||
					lieProps['WebGLRenderingContext.getExtension'] ||
					lieProps['WebGL2RenderingContext.getExtension'] ||
					lieProps['WebGLRenderingContext.getSupportedExtensions'] ||
					lieProps['WebGL2RenderingContext.getSupportedExtensions']
				) || false;
				if (hyperNestedIframeWindow &&
					hyperNestedIframeWindow.document.createElement('canvas').toDataURL() != document.createElement('canvas').toDataURL()) {
					lied = true;
				}
				// create canvas context
				const doc = (
					contentWindow ? contentWindow.document : 
					document
				);
				const canvas = doc.createElement('canvas');
				const canvas2 = doc.createElement('canvas');
				const context = (
					canvas.getContext('webgl') ||
					canvas.getContext('experimental-webgl') ||
					canvas.getContext('moz-webgl') ||
					canvas.getContext('webkit-3d')
				);
				const context2 = canvas2.getContext('webgl2') || canvas2.getContext('experimental-webgl2');
				const getSupportedExtensions = context => {
					return new Promise(async resolve => {
						try {
							if (!context) {
								return resolve({ extensions: [] })
							}
							const extensions = caniuse(() => context, ['getSupportedExtensions'], [], true) || [];
							return resolve({
								extensions
							})
						}
						catch (error) {
							captureError(error);
							return resolve({
								extensions: []
							})
						}
					})
				};

				const getSpecs = (webgl, webgl2) => {
					return new Promise(async resolve => {
						const getShaderPrecisionFormat = (gl, shaderType) => {
							const low = attempt(() => gl.getShaderPrecisionFormat(gl[shaderType], gl.LOW_FLOAT));
							const medium = attempt(() => gl.getShaderPrecisionFormat(gl[shaderType], gl.MEDIUM_FLOAT));
							const high = attempt(() => gl.getShaderPrecisionFormat(gl[shaderType], gl.HIGH_FLOAT));
							const highInt = attempt(() => gl.getShaderPrecisionFormat(gl[shaderType], gl.HIGH_INT));
							return { low, medium, high, highInt }
						};
						const getMaxAnisotropy = gl => {
							const ext = (
								gl.getExtension('EXT_texture_filter_anisotropic') ||
								gl.getExtension('MOZ_EXT_texture_filter_anisotropic') ||
								gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic')
							);
							return ext ? gl.getParameter(ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT) : undefined
						};
						
						const getShaderData = (name, shader) => {
							const data = {};
							for (const prop in shader) {
								const obj = shader[prop];
								data[name+'.'+prop+'.precision'] = obj ? attempt(() => obj.precision) : undefined;
								data[name+'.'+prop+'.rangeMax'] = obj ? attempt(() => obj.rangeMax) : undefined;
								data[name+'.'+prop+'.rangeMin'] = obj ? attempt(() => obj.rangeMin) : undefined;
							}
							return data
						};
						const getWebglSpecs = gl => {
							if (!caniuse(() => gl, ['getParameter'])) {
								return undefined
							}
							const data =  {
								VERSION: gl.getParameter(gl.VERSION),
								SHADING_LANGUAGE_VERSION: gl.getParameter(gl.SHADING_LANGUAGE_VERSION),
								antialias: gl.getContextAttributes() ? gl.getContextAttributes().antialias : undefined,
								RED_BITS: gl.getParameter(gl.RED_BITS),
								GREEN_BITS: gl.getParameter(gl.GREEN_BITS),
								BLUE_BITS: gl.getParameter(gl.BLUE_BITS),
								ALPHA_BITS: gl.getParameter(gl.ALPHA_BITS),
								DEPTH_BITS: gl.getParameter(gl.DEPTH_BITS),
								STENCIL_BITS: gl.getParameter(gl.STENCIL_BITS),
								MAX_RENDERBUFFER_SIZE: gl.getParameter(gl.MAX_RENDERBUFFER_SIZE),
								MAX_COMBINED_TEXTURE_IMAGE_UNITS: gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS),
								MAX_CUBE_MAP_TEXTURE_SIZE: gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE),
								MAX_FRAGMENT_UNIFORM_VECTORS: gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS),
								MAX_TEXTURE_IMAGE_UNITS: gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS),
								MAX_TEXTURE_SIZE: gl.getParameter(gl.MAX_TEXTURE_SIZE),
								MAX_VARYING_VECTORS: gl.getParameter(gl.MAX_VARYING_VECTORS),
								MAX_VERTEX_ATTRIBS: gl.getParameter(gl.MAX_VERTEX_ATTRIBS),
								MAX_VERTEX_TEXTURE_IMAGE_UNITS: gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS),
								MAX_VERTEX_UNIFORM_VECTORS: gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS),
								ALIASED_LINE_WIDTH_RANGE: [...gl.getParameter(gl.ALIASED_LINE_WIDTH_RANGE)],
								ALIASED_POINT_SIZE_RANGE: [...gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE)],
								MAX_VIEWPORT_DIMS: attempt(() => [...gl.getParameter(gl.MAX_VIEWPORT_DIMS)]),
								MAX_TEXTURE_MAX_ANISOTROPY_EXT: getMaxAnisotropy(gl),
								...getShaderData('VERTEX_SHADER', getShaderPrecisionFormat(gl, 'VERTEX_SHADER')),
								...getShaderData('FRAGMENT_SHADER', getShaderPrecisionFormat(gl, 'FRAGMENT_SHADER')),
								MAX_DRAW_BUFFERS_WEBGL: attempt(() => {
									const buffers = gl.getExtension('WEBGL_draw_buffers');
									return buffers ? gl.getParameter(buffers.MAX_DRAW_BUFFERS_WEBGL) : undefined
								})
							};
							const response = data;
							return response
						};

						const getWebgl2Specs = gl => {
							if (!caniuse(() => gl, ['getParameter'])) {
								return undefined
							}
							const data = {
								MAX_VERTEX_UNIFORM_COMPONENTS: gl.getParameter(gl.MAX_VERTEX_UNIFORM_COMPONENTS),
								MAX_VERTEX_UNIFORM_BLOCKS: gl.getParameter(gl.MAX_VERTEX_UNIFORM_BLOCKS),
								MAX_VERTEX_OUTPUT_COMPONENTS: gl.getParameter(gl.MAX_VERTEX_OUTPUT_COMPONENTS),
								MAX_VARYING_COMPONENTS: gl.getParameter(gl.MAX_VARYING_COMPONENTS),
								MAX_FRAGMENT_UNIFORM_COMPONENTS: gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_COMPONENTS),
								MAX_FRAGMENT_UNIFORM_BLOCKS: gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_BLOCKS),
								MAX_FRAGMENT_INPUT_COMPONENTS: gl.getParameter(gl.MAX_FRAGMENT_INPUT_COMPONENTS),
								MIN_PROGRAM_TEXEL_OFFSET: gl.getParameter(gl.MIN_PROGRAM_TEXEL_OFFSET),
								MAX_PROGRAM_TEXEL_OFFSET: gl.getParameter(gl.MAX_PROGRAM_TEXEL_OFFSET),
								MAX_DRAW_BUFFERS: gl.getParameter(gl.MAX_DRAW_BUFFERS),
								MAX_COLOR_ATTACHMENTS: gl.getParameter(gl.MAX_COLOR_ATTACHMENTS),
								MAX_SAMPLES: gl.getParameter(gl.MAX_SAMPLES),
								MAX_3D_TEXTURE_SIZE: gl.getParameter(gl.MAX_3D_TEXTURE_SIZE),
								MAX_ARRAY_TEXTURE_LAYERS: gl.getParameter(gl.MAX_ARRAY_TEXTURE_LAYERS),
								MAX_TEXTURE_LOD_BIAS: gl.getParameter(gl.MAX_TEXTURE_LOD_BIAS),
								MAX_UNIFORM_BUFFER_BINDINGS: gl.getParameter(gl.MAX_UNIFORM_BUFFER_BINDINGS),
								MAX_UNIFORM_BLOCK_SIZE: gl.getParameter(gl.MAX_UNIFORM_BLOCK_SIZE),
								UNIFORM_BUFFER_OFFSET_ALIGNMENT: gl.getParameter(gl.UNIFORM_BUFFER_OFFSET_ALIGNMENT),
								MAX_COMBINED_UNIFORM_BLOCKS: gl.getParameter(gl.MAX_COMBINED_UNIFORM_BLOCKS),
								MAX_COMBINED_VERTEX_UNIFORM_COMPONENTS: gl.getParameter(gl.MAX_COMBINED_VERTEX_UNIFORM_COMPONENTS),
								MAX_COMBINED_FRAGMENT_UNIFORM_COMPONENTS: gl.getParameter(gl.MAX_COMBINED_FRAGMENT_UNIFORM_COMPONENTS),
								MAX_TRANSFORM_FEEDBACK_INTERLEAVED_COMPONENTS: gl.getParameter(gl.MAX_TRANSFORM_FEEDBACK_INTERLEAVED_COMPONENTS),
								MAX_TRANSFORM_FEEDBACK_SEPARATE_ATTRIBS: gl.getParameter(gl.MAX_TRANSFORM_FEEDBACK_SEPARATE_ATTRIBS),
								MAX_TRANSFORM_FEEDBACK_SEPARATE_COMPONENTS: gl.getParameter(gl.MAX_TRANSFORM_FEEDBACK_SEPARATE_COMPONENTS),
								MAX_ELEMENT_INDEX: gl.getParameter(gl.MAX_ELEMENT_INDEX),
								MAX_SERVER_WAIT_TIMEOUT: gl.getParameter(gl.MAX_SERVER_WAIT_TIMEOUT)
							};
							const response = data;
							return response
						};
						const data = { webglSpecs: getWebglSpecs(webgl), webgl2Specs: getWebgl2Specs(webgl2) };
						return resolve(data)
					})
				};

				const getUnmasked = (context, [rendererTitle, vendorTitle]) => {
					return new Promise(async resolve => {
						try {
							if (!context) {
								return resolve({
									vendor: undefined,
									renderer: undefined
								})
							}
							const extension = caniuse(() => context, ['getExtension'], ['WEBGL_debug_renderer_info'], true);
							const vendor = extension && context.getParameter(extension.UNMASKED_VENDOR_WEBGL);
							const renderer = extension && context.getParameter(extension.UNMASKED_RENDERER_WEBGL);
							const validate = (value, title) => {

								const gibbers = gibberish(value);
								if (!!gibbers.length) {	
									sendToTrash(`${title} contains gibberish`, `[${gibbers.join(', ')}] ${value}`);	
								}

								return (
									!proxyBehavior(value) ? value : 
									sendToTrash(title, 'proxy behavior detected')
								)
							};
							return resolve ({
								vendor: validate(vendor, vendorTitle),
								renderer: validate(renderer, rendererTitle)
							})
						}
						catch (error) {
							captureError(error);
							return resolve({
								vendor: undefined,
								renderer: undefined
							})
						}
					})
				};
				const getDataURL = (canvas, context) => {
					return new Promise(async resolve => {
						try {
							const colorBufferBit = caniuse(() => context, ['COLOR_BUFFER_BIT']);
							caniuse(() => context, ['clearColor'], [0.2, 0.4, 0.6, 0.8], true);
							caniuse(() => context, ['clear'], [colorBufferBit], true);
							const canvasWebglDataURI = canvas.toDataURL();
							const dataURI = canvasWebglDataURI;
							const $hash = await hashify(dataURI);
							return resolve({ dataURI, $hash })
						}
						catch (error) {
							captureError(error);
							return resolve({ dataURI: undefined, $hash: undefined })
						}
					})
				};

				const [
					supported,
					supported2,
					unmasked,
					unmasked2,
					dataURI,
					dataURI2,
					specs
				] = await Promise.all([
					getSupportedExtensions(context),
					getSupportedExtensions(context2),
					getUnmasked(context, ['webgl renderer', 'webgl vendor']),
					getUnmasked(context2, ['webgl2 renderer', 'webgl2 vendor']),
					getDataURL(canvas, context),
					getDataURL(canvas2, context2),
					getSpecs(context, context2)
				]).catch(error => {
					console.error(error.message);
				});

				const data = {
					supported,
					supported2,
					unmasked,
					unmasked2,
					dataURI,
					dataURI2,
					specs,
					lied
				};
				data.matchingUnmasked = JSON.stringify(data.unmasked) === JSON.stringify(data.unmasked2);
				data.matchingDataURI = data.dataURI.$hash === data.dataURI2.$hash;

				const $hash = await hashify(data);
				logTestResult({ test: 'webgl', passed: true });
				return resolve({ ...data, $hash })
			}
			catch (error) {
				logTestResult({ test: 'webgl', passed: false });
				captureError(error);
				return resolve()
			}
		})
	};

	const getCloudflare = imports => {

		const {
			require: {
				getOS,
				hashify,
				captureError,
				logTestResult
			}
		} = imports;

		return new Promise(async resolve => {
			try {
				const api = 'https://www.cloudflare.com/cdn-cgi/trace';
				const res = await fetch(api);
				const text = await res.text();
				const lines = text.match(/^(?:ip|uag|loc|tls)=(.*)$/igm);
				const data = {};
				lines.forEach(line => {
					const key = line.split('=')[0];
					const value = line.substr(line.indexOf('=') + 1);
					data[key] = value;
				});
				data.uag = getOS(data.uag);
				const $hash = await hashify(data);
				logTestResult({ test: 'cloudflare', passed: true });
				return resolve({ ...data, $hash })
			}
			catch (error) {
				logTestResult({ test: 'cloudflare', passed: false });
				captureError(error, 'cloudflare.com: failed or client blocked');
				return resolve()
			}
		})
	};

	const computeStyle = (type, { require: [ hashify, captureError ] }) => {
		return new Promise(async resolve => {
			try {
				// get CSSStyleDeclaration
				const cssStyleDeclaration = (
					type == 'getComputedStyle' ? getComputedStyle(document.body) :
					type == 'HTMLElement.style' ? document.body.style :
					type == 'CSSRuleList.style' ? document.styleSheets[0].cssRules[0].style :
					undefined
				);
				if (!cssStyleDeclaration) {
					throw new TypeError('invalid argument string')
				}
				// get properties
				const prototype = Object.getPrototypeOf(cssStyleDeclaration);
				const prototypeProperties = Object.getOwnPropertyNames(prototype);
				const ownEnumerablePropertyNames = [];
				const cssVar = /^--.*$/;
				Object.keys(cssStyleDeclaration).forEach(key => {
					const numericKey = !isNaN(key);
					const value = cssStyleDeclaration[key];
					const customPropKey = cssVar.test(key);
					const customPropValue = cssVar.test(value);
					if (numericKey && !customPropValue) {
						return ownEnumerablePropertyNames.push(value)
					} else if (!numericKey && !customPropKey) {
						return ownEnumerablePropertyNames.push(key)
					}
					return
				});
				// get properties in prototype chain (required only in chrome)
				const propertiesInPrototypeChain = {};
				const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1);
				const uncapitalize = str => str.charAt(0).toLowerCase() + str.slice(1);
				const removeFirstChar = str => str.slice(1);
				const caps = /[A-Z]/g;
				ownEnumerablePropertyNames.forEach(key => {
					if (propertiesInPrototypeChain[key]) {
						return
					}
					// determine attribute type
					const isNamedAttribute = key.indexOf('-') > -1;
					const isAliasAttribute = caps.test(key);
					// reduce key for computation
					const firstChar = key.charAt(0);
					const isPrefixedName = isNamedAttribute && firstChar == '-';
					const isCapitalizedAlias = isAliasAttribute && firstChar == firstChar.toUpperCase();
					key = (
						isPrefixedName ? removeFirstChar(key) :
						isCapitalizedAlias ? uncapitalize(key) :
						key
					);
					// find counterpart in CSSStyleDeclaration object or its prototype chain
					if (isNamedAttribute) {
						const aliasAttribute = key.split('-').map((word, index) => index == 0 ? word : capitalize(word)).join('');
						if (aliasAttribute in cssStyleDeclaration) {
							propertiesInPrototypeChain[aliasAttribute] = true;
						} else if (capitalize(aliasAttribute) in cssStyleDeclaration) {
							propertiesInPrototypeChain[capitalize(aliasAttribute)] = true;
						}
					} else if (isAliasAttribute) {
						const namedAttribute = key.replace(caps, char => '-' + char.toLowerCase());
						if (namedAttribute in cssStyleDeclaration) {
							propertiesInPrototypeChain[namedAttribute] = true;
						} else if (`-${namedAttribute}` in cssStyleDeclaration) {
							propertiesInPrototypeChain[`-${namedAttribute}`] = true;
						}
					}
					return
				});
				// compile keys
				const keys = [
					...new Set([
						...prototypeProperties,
						...ownEnumerablePropertyNames,
						...Object.keys(propertiesInPrototypeChain)
					])
				];
				// checks
				const moz = keys.filter(key => (/moz/i).test(key)).length;
				const webkit = keys.filter(key => (/webkit/i).test(key)).length;
				const apple = keys.filter(key => (/apple/i).test(key)).length;
				const prototypeName = (''+prototype).match(/\[object (.+)\]/)[1];
			
				const data = { keys: keys.sort(), moz, webkit, apple, prototypeName };
				const $hash = await hashify(data);
				return resolve({ ...data, $hash })
			}
			catch (error) {
				captureError(error);
				return resolve(undefined)
			}
		})
	};

	const getSystemStyles = (instanceId, { require: [ hashify, captureError ] }) => {
		return new Promise(async resolve => {
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
					'WindowText'
				];
				const fonts = [
					'caption',
					'icon',
					'menu',
					'message-box',
					'small-caption',
					'status-bar'
				];
				const id = 'creep-system-styles';
				const el = document.createElement('div');
				el.setAttribute('id', id);
				document.body.append(el);
				const rendered = document.getElementById(id);
				const system = {
					colors: [],
					fonts: []
				};
				system.colors = colors.map(color => {
					rendered.setAttribute('style', `background-color: ${color} !important`);
					return {
						[color]: getComputedStyle(rendered).backgroundColor
					}
				});
				fonts.forEach(font => {
					rendered.setAttribute('style', `font: ${font} !important`);
					system.fonts.push({
						[font]: getComputedStyle(rendered).font
					});
				});
				rendered.parentNode.removeChild(rendered);
				const $hash = await hashify(system);
				return resolve({...system, $hash})
			}
			catch (error) {
				captureError(error);
				return resolve(undefined)
			}
		})
	};

	const getCSSStyleDeclarationVersion = imports => {

		const {
			require: {
				instanceId,
				hashify,
				captureError,
				logTestResult
			}
		} = imports;

		return new Promise(async resolve => {
			try {
				const [
					computedStyle,
					htmlElementStyle,
					cssRuleListstyle,
					system
				] = await Promise.all([
					computeStyle('getComputedStyle', { require: [ hashify, captureError ] }),
					computeStyle('HTMLElement.style', { require: [ hashify, captureError ] }),
					computeStyle('CSSRuleList.style', { require: [ hashify, captureError ] }),
					getSystemStyles(instanceId, { require: [ hashify, captureError ] })
				]).catch(error => {
					console.error(error.message);
				});
				
				const data = {
					['getComputedStyle']: computedStyle,
					['HTMLElement.style']: htmlElementStyle,
					['CSSRuleList.style']: cssRuleListstyle,
					system,
					matching: (
						''+computedStyle.keys == ''+htmlElementStyle.keys &&
						''+htmlElementStyle.keys == ''+cssRuleListstyle.keys
					)
				};
				const $hash = await hashify(data);
				logTestResult({ test: 'computed style', passed: true });
				return resolve({ ...data, $hash })
			}
			catch (error) {
				logTestResult({ test: 'computed style', passed: false });
				captureError(error);
				return resolve()
			}
		})
	};

	const getErrors = errFns => {
		const errors = [];
		let i, len = errFns.length;
		for (i = 0; i < len; i++) {
			try {
				errFns[i]();
			} catch (err) {
				errors.push(err.message);
			}
		}
		return errors
	};
	const getConsoleErrors = imports => {

		const {
			require: {
				hashify,
				captureError,
				logTestResult
			}
		} = imports;

		return new Promise(async resolve => {
			try {
				const errorTests = [
					() => new Function('alert(")')(),
					() => new Function('const foo;foo.bar')(),
					() => new Function('null.bar')(),
					() => new Function('abc.xyz = 123')(),
					() => new Function('const foo;foo.bar')(),
					() => new Function('(1).toString(1000)')(),
					() => new Function('[...undefined].length')(),
					() => new Function('var x = new Array(-1)')(),
					() => new Function('const a=1; const a=2;')()
				];
				const errors = getErrors(errorTests);
				const $hash = await hashify(errors);
				logTestResult({ test: 'console errors', passed: true });
				return resolve({errors, $hash })
			}
			catch (error) {
				logTestResult({ test: 'console errors', passed: false });
				captureError(error);
				return resolve()
			}
		})
	};

	const getIframeContentWindowVersion = imports => {

		const {
			require: {
				hashify,
				captureError,
				contentWindow,
				logTestResult
			}
		} = imports;

		return new Promise(async resolve => {
			try {
				const keys = Object.getOwnPropertyNames(contentWindow);
				const moz = keys.filter(key => (/moz/i).test(key)).length;
				const webkit = keys.filter(key => (/webkit/i).test(key)).length;
				const apple = keys.filter(key => (/apple/i).test(key)).length;
				const data = { keys, apple, moz, webkit }; 
				const $hash = await hashify(data);
				logTestResult({ test: 'window', passed: true });
				return resolve({ ...data, $hash })
			}
			catch (error) {
				logTestResult({ test: 'window', passed: false });
				captureError(error);
				return resolve()
			}
		})
	};

	// inspired by Lalit Patel's fontdetect.js
	// https://www.lalit.org/wordpress/wp-content/uploads/2008/05/fontdetect.js?ver=0.3
	const getFonts = (imports, fonts) => {

		const {
			require: {
				hashify,
				patch,
				html,
				captureError,
				instanceId,
				lieProps,
				logTestResult
			}
		} = imports;

		return new Promise(async resolve => {
			try {

				let lied = (
					lieProps['Element.offsetWidth'],
					lieProps['Element.offsetHeight'],
					lieProps['HTMLElement.offsetWidth'],
					lieProps['HTMLElement.offsetHeight']
				);

				let iframeContainer, doc = document;
				try {
					const len = window.length;
					const div = document.createElement('div');
					div.setAttribute('style', 'visibility:hidden');
					document.body.appendChild(div);
					div.innerHTML = '<iframe></iframe>';
					const iframeWindow = window[len];
					iframeContainer = div;
					doc = iframeWindow.document;
				}
				catch (error) {
					captureError(error, 'client blocked fonts iframe');
				}

				const fontsId = `${instanceId}-fonts-div`;
				const divElement = document.createElement('div');
				const divStageRendered = document.createElement('div');
				divElement.setAttribute('id', fontsId);
				divStageRendered.setAttribute('id', 'font-detector-stage');
				doc.body.appendChild(divElement);
				const divRendered = doc.getElementById(fontsId);
				divRendered.appendChild(divStageRendered);

				const toInt = val => ~~val; // protect against decimal noise
				const baseFonts = ['monospace', 'sans-serif', 'serif'];
				const text = 'mmmmmmmmmmlli';
				const baseOffsetWidth = {};
				const baseOffsetHeight = {};
				const style = ` > span {
				position: absolute!important;
				left: -9999px!important;
				font-size: 256px!important;
				font-style: normal!important;
				font-weight: normal!important;
				letter-spacing: normal!important;
				line-break: auto!important;
				line-height: normal!important;
				text-transform: none!important;
				text-align: left!important;
				text-decoration: none!important;
				text-shadow: none!important;
				white-space: normal!important;
				word-break: normal!important;
				word-spacing: normal!important;
			}`;
				const baseFontSpan = font => {
					return `<span class="basefont" data-font="${font}" style="font-family: ${font}!important">${text}</span>`
				};
				const systemFontSpan = (font, basefont) => {
					return `<span class="system-font" data-font="${font}" data-basefont="${basefont}" style="font-family: ${`'${font}', ${basefont}`}!important">${text}</span>`
				};
				
				const stageElem = divStageRendered; 
				const detectedFonts = {};
				patch(stageElem, html`
				<div id="font-detector-test">
					<style>#font-detector-test${style}</style>
					${baseFonts.map(font => baseFontSpan(font)).join('')}
					${
						fonts.map(font => {
							const template = `
							${systemFontSpan(font, baseFonts[0])}
							${systemFontSpan(font, baseFonts[1])}
							${systemFontSpan(font, baseFonts[2])}
							`;
							return template
						}).join('')
					}
				</div>
				`,
					() => {
						const basefontElems = doc.querySelectorAll('#font-detector-test .basefont');
						const systemFontElems = doc.querySelectorAll('#font-detector-test .system-font')

						// Compute fingerprint
						;[...basefontElems].forEach(span => {
							const { dataset: { font }, offsetWidth, offsetHeight } = span;
							baseOffsetWidth[font] = toInt(offsetWidth);
							baseOffsetHeight[font] = toInt(offsetHeight);
							return
						})
						;[...systemFontElems].forEach(span => {
							const { dataset: { font } }= span;
							if (!detectedFonts[font]) {
								const { dataset: { basefont }, offsetWidth, offsetHeight } = span;
								const widthMatchesBase = toInt(offsetWidth) == baseOffsetWidth[basefont];
								const heightMatchesBase = toInt(offsetHeight) == baseOffsetHeight[basefont];
								const detected = !widthMatchesBase || !heightMatchesBase;
								if (detected) { detectedFonts[font] = true; }
							}
							return
						});

						if (!!iframeContainer) {
							iframeContainer.parentNode.removeChild(iframeContainer);
						}
						else {
							divRendered.parentNode.removeChild(divRendered);
						}
					}
				);
				const fontList = Object.keys(detectedFonts);
				const $hash = await hashify(fontList);
				logTestResult({ test: 'fonts', passed: true });
				return resolve({fonts: fontList, $hash })
			}
			catch (error) {
				logTestResult({ test: 'fonts', passed: false });
				captureError(error);
				return resolve()
			}
		})
	};

	const fontList = ["Andale Mono","Arial","Arial Black","Arial Hebrew","Arial MT","Arial Narrow","Arial Rounded MT Bold","Arial Unicode MS","Bitstream Vera Sans Mono","Book Antiqua","Bookman Old Style","Calibri","Cambria","Cambria Math","Century","Century Gothic","Century Schoolbook","Comic Sans","Comic Sans MS","Consolas","Courier","Courier New","Geneva","Georgia","Helvetica","Helvetica Neue","Impact","Lucida Bright","Lucida Calligraphy","Lucida Console","Lucida Fax","LUCIDA GRANDE","Lucida Handwriting","Lucida Sans","Lucida Sans Typewriter","Lucida Sans Unicode","Microsoft Sans Serif","Monaco","Monotype Corsiva","MS Gothic","MS Outlook","MS PGothic","MS Reference Sans Serif","MS Sans Serif","MS Serif","MYRIAD","MYRIAD PRO","Palatino","Palatino Linotype","Segoe Print","Segoe Script","Segoe UI","Segoe UI Light","Segoe UI Semibold","Segoe UI Symbol","Tahoma","Times","Times New Roman","Times New Roman PS","Trebuchet MS","Verdana","Wingdings","Wingdings 2","Wingdings 3"];

	const notoFonts = ["Noto Naskh Arabic","Noto Sans Armenian","Noto Sans Bengali","Noto Sans Buginese","Noto Sans Canadian Aboriginal","Noto Sans Cherokee","Noto Sans Devanagari","Noto Sans Ethiopic","Noto Sans Georgian","Noto Sans Gujarati","Noto Sans Gurmukhi","Noto Sans Hebrew","Noto Sans JP Regular","Noto Sans KR Regular","Noto Sans Kannada","Noto Sans Khmer","Noto Sans Lao","Noto Sans Malayalam","Noto Sans Mongolian","Noto Sans Myanmar","Noto Sans Oriya","Noto Sans SC Regular","Noto Sans Sinhala","Noto Sans TC Regular","Noto Sans Tamil","Noto Sans Telugu","Noto Sans Thaana","Noto Sans Thai","Noto Sans Tibetan","Noto Sans Yi","Noto Serif Armenian","Noto Serif Khmer","Noto Serif Lao","Noto Serif Thai"];

	const getHTMLElementVersion = imports => {

		const {
			require: {
				hashify,
				instanceId,
				captureError,
				parentNest,
				logTestResult
			}
		} = imports;

		return new Promise(async resolve => {
			try {
				
				let htmlElementRendered;
				if (parentNest &&  parentNest.el) {
					htmlElementRendered = parentNest.el;
				}
				else {
					const id = `${instanceId}-html-element-version-test`;
					const htmlElement = document.createElement('div');
					htmlElement.setAttribute('id', id);
					htmlElement.setAttribute('style', 'display:none;');
					document.body.appendChild(htmlElement);
					htmlElementRendered = document.getElementById(id);
				}

				const keys = [];
				for (const key in htmlElementRendered) {
					keys.push(key);
				}

				if (!parentNest) {
					htmlElementRendered.parentNode.removeChild(htmlElementRendered);
				}

				const $hash = await hashify(keys);
				logTestResult({ test: 'html element', passed: true });
				return resolve({ keys, $hash })
			}
			catch (error) {
				logTestResult({ test: 'html element', passed: false });
				captureError(error);
				return resolve()
			}
		})
	};

	const getMaths = imports => {

		const {
			require: {
				hashMini,
				hashify,
				captureError,
				attempt,
				documentLie,
				lieProps,
				contentWindow,
				logTestResult						
			}
		} = imports;

		return new Promise(async resolve => {
			try {
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
					'pow'
				];
				let lied = false;
				check.forEach(prop => {
					if (!!lieProps[`Math.${prop}`]) {
						lied = true;
					}
					const test = (
						prop == 'cos' ? [1e308] :
						prop == 'acos' || prop == 'asin' || prop == 'atanh' ? [0.5] :
						prop == 'pow' || prop == 'atan2' ? [Math.PI, 2] : 
						[Math.PI]
					);
					const res1 = Math[prop](...test);
					const res2 = Math[prop](...test);
					const matching = isNaN(res1) && isNaN(res2) ? true : res1 == res2;
					if (!matching) {
						lied = true;
						const mathLie = { fingerprint: '', lies: [{ [`Expected ${res1} and got ${res2}`]: true }] };
						documentLie(`Math.${prop}`, hashMini({res1, res2}), mathLie);
					}
					return
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
					['cos', [13*Math.E], 'cos(13*Math.E)', -0.7108118501064331, -0.7108118501064332, NaN, NaN],
					['cos', [57*Math.E], 'cos(57*Math.E)', -0.536911695749024, -0.5369116957490239, NaN, NaN],
					['cos', [21*Math.LN2], 'cos(21*Math.LN2)', -0.4067775970251724, -0.40677759702517235, -0.6534063185820197, NaN],
					['cos', [51*Math.LN2], 'cos(51*Math.LN2)', -0.7017203400855446, -0.7017203400855445, NaN, NaN],
					['cos', [21*Math.LOG2E], 'cos(21*Math.LOG2E)', 0.4362848063618998, 0.43628480636189976, NaN, NaN],
					['cos', [25*Math.SQRT2], 'cos(25*Math.SQRT2)', -0.6982689820462377, -0.6982689820462376, NaN, NaN],
					['cos', [50*Math.SQRT1_2], 'cos(50*Math.SQRT1_2)', -0.6982689820462377, -0.6982689820462376, NaN, NaN],
					['cos', [21*Math.SQRT1_2], 'cos(21*Math.SQRT1_2)', -0.6534063185820198, NaN, NaN, NaN],
					['cos', [17*Math.LOG10E], 'cos(17*Math.LOG10E)', 0.4537557425982784, 0.45375574259827833, NaN, NaN],
					['cos', [2*Math.LOG10E], 'cos(2*Math.LOG10E)', 0.6459044007438142, NaN, 0.6459044007438141, NaN],

					['cosh', [1], 'cosh(1)', 1.5430806348152437, NaN, NaN, NaN],
					['cosh', [Math.PI], 'cosh(Math.PI)', 11.591953275521519, NaN, NaN, NaN],
					['cosh', [492*Math.LOG2E], 'cosh(492*Math.LOG2E)', 9.199870313877772e+307, 9.199870313877774e+307, NaN, NaN],
					['cosh', [502*Math.SQRT2], 'cosh(502*Math.SQRT2)', 1.0469199669023138e+308, 1.046919966902314e+308, NaN, NaN],

					['expm1', [1], 'expm1(1)', 1.718281828459045, NaN, NaN, 1.7182818284590453],
					['expm1', [Math.PI], 'expm1(Math.PI)', 22.140692632779267, NaN, NaN, NaN],

					['exp', [n], `exp(${n})`, 1.1308844209474893, NaN, NaN, NaN],
					['exp', [Math.PI], 'exp(Math.PI)', 23.140692632779267, NaN, NaN, NaN],

					['hypot', [1, 2, 3, 4, 5, 6], 'hypot(1, 2, 3, 4, 5, 6)', 9.539392014169456, NaN, NaN, NaN],
					['hypot', [bigN, bigN], `hypot(${bigN}, ${bigN})`, 8.288489826731116e+38, 8.288489826731114e+38, NaN, NaN],
					['hypot', [2*Math.E, -100], 'hypot(2*Math.E, -100)', 100.14767208675259, 100.14767208675258, NaN, NaN],
					['hypot', [6*Math.PI, -100], 'hypot(6*Math.PI, -100)', 101.76102278593319, 101.7610227859332, NaN, NaN],
					['hypot', [2*Math.LN2, -100], 'hypot(2*Math.LN2, -100)', 100.0096085986525, 100.00960859865252, NaN, NaN],
					['hypot', [Math.LOG2E, -100], 'hypot(Math.LOG2E, -100)', 100.01040630344929, 100.01040630344927, NaN, NaN],
					['hypot', [Math.SQRT2, -100], 'hypot(Math.SQRT2, -100)', 100.00999950004999, 100.00999950005, NaN, NaN],
					['hypot', [Math.SQRT1_2, -100], 'hypot(Math.SQRT1_2, -100)', 100.0024999687508, 100.00249996875078, NaN, NaN],
					['hypot', [2*Math.LOG10E, -100], 'hypot(2*Math.LOG10E, -100)', 100.00377216279416, 100.00377216279418, NaN, NaN],

					['log', [n], `log(${n})`, -2.0955709236097197, NaN, NaN, NaN],
					['log', [Math.PI], 'log(Math.PI)', 1.1447298858494002, NaN, NaN, NaN],

					['log1p', [n], `log1p(${n})`, 0.11600367575630613, NaN, NaN, NaN],
					['log1p', [Math.PI], 'log1p(Math.PI)', 1.4210804127942926, NaN, NaN, NaN],

					['log10', [n], `log10(${n})`, -0.9100948885606021, NaN, NaN, NaN],
					['log10', [Math.PI], 'log10(Math.PI)', 0.4971498726941338, 0.49714987269413385, NaN, NaN],
					['log10', [Math.E], 'log10(Math.E)', 0.4342944819032518, NaN, NaN, NaN],
					['log10', [34*Math.E], 'log10(34*Math.E)', 1.9657733989455068, 1.965773398945507, NaN, NaN],
					['log10', [Math.LN2], 'log10(Math.LN2)', -0.1591745389548616, NaN, NaN, NaN],
					['log10', [11*Math.LN2], 'log10(11*Math.LN2)', 0.8822181462033634, 0.8822181462033635, NaN, NaN],
					['log10', [Math.LOG2E], 'log10(Math.LOG2E)', 0.15917453895486158, NaN, NaN, NaN],
					['log10', [43*Math.LOG2E], 'log10(43*Math.LOG2E)', 1.792642994534448, 1.7926429945344482, NaN, NaN],
					['log10', [Math.LOG10E], 'log10(Math.LOG10E)', -0.36221568869946325, NaN, NaN, NaN],
					['log10', [7*Math.LOG10E], 'log10(7*Math.LOG10E)', 0.4828823513147936, 0.48288235131479357, NaN, NaN],
					['log10', [Math.SQRT1_2], 'log10(Math.SQRT1_2)', -0.15051499783199057, NaN, NaN, NaN],
					['log10', [2*Math.SQRT1_2], 'log10(2*Math.SQRT1_2)', 0.1505149978319906, 0.15051499783199063, NaN, NaN],
					['log10', [Math.SQRT2], 'log10(Math.SQRT2)', 0.1505149978319906, 0.15051499783199063, NaN, NaN],
					
					['sin', [bigN], `sin(${bigN})`, 0.994076732536068, NaN, -0.20876350121720488, NaN],
					['sin', [Math.PI], 'sin(Math.PI)', 1.2246467991473532e-16, NaN, 1.2246063538223773e-16, NaN],

					['sin', [39*Math.E], 'sin(39*Math.E)', -0.7181630308570677, -0.7181630308570678, NaN, NaN],
					['sin', [35*Math.LN2], 'sin(35*Math.LN2)', -0.7659964138980511, -0.765996413898051, NaN, NaN],
					['sin', [110*Math.LOG2E], 'sin(110*Math.LOG2E)', 0.9989410140273756, 0.9989410140273757, NaN, NaN],
					['sin', [7*Math.LOG10E], 'sin(7*Math.LOG10E)', 0.10135692924965616, 0.10135692924965614, NaN, NaN],
					['sin', [35*Math.SQRT1_2], 'sin(35*Math.SQRT1_2)', -0.3746357547858202, -0.37463575478582023, NaN, NaN],
					['sin', [21*Math.SQRT2], 'sin(21*Math.SQRT2)', -0.9892668187780498, -0.9892668187780497, NaN, NaN],

					['sinh', [1], 'sinh(1)', 1.1752011936438014, NaN, NaN, NaN],
					['sinh', [Math.PI], 'sinh(Math.PI)', 11.548739357257748, NaN, NaN, 11.548739357257746],
					['sinh', [Math.E], 'sinh(Math.E)', 7.544137102816975, NaN, NaN, NaN],
					['sinh', [Math.LN2], 'sinh(Math.LN2)', 0.75, NaN, NaN, NaN],
					['sinh', [Math.LOG2E], 'sinh(Math.LOG2E)', 1.9978980091062795, NaN, NaN, NaN],
					['sinh', [492*Math.LOG2E], 'sinh(492*Math.LOG2E)', 9.199870313877772e+307, 9.199870313877774e+307, NaN, NaN],
					['sinh', [Math.LOG10E], 'sinh(Math.LOG10E)', 0.44807597941469024, NaN, NaN, NaN],
					['sinh', [Math.SQRT1_2], 'sinh(Math.SQRT1_2)', 0.7675231451261164, NaN, NaN, NaN],
					['sinh', [Math.SQRT2], 'sinh(Math.SQRT2)', 1.935066822174357, NaN, NaN, 1.9350668221743568],
					['sinh', [502*Math.SQRT2], 'sinh(502*Math.SQRT2)', 1.0469199669023138e+308, 1.046919966902314e+308, NaN, NaN],

					['sqrt', [n], `sqrt(${n})`, 0.3507135583350036, NaN, NaN, NaN],
					['sqrt', [Math.PI], 'sqrt(Math.PI)', 1.7724538509055159, NaN, NaN, NaN],
					
					['tan', [-1e308], 'tan(-1e308)', 0.5086861259107568, NaN, NaN, 0.5086861259107567],
					['tan', [Math.PI], 'tan(Math.PI)', -1.2246467991473532e-16, NaN, NaN, NaN],

					['tan', [6*Math.E], 'tan(6*Math.E)', 0.6866761546452431, 0.686676154645243, NaN, NaN],
					['tan', [6*Math.LN2], 'tan(6*Math.LN2)', 1.6182817135715877, 1.618281713571588, NaN, 1.6182817135715875],
					['tan', [10*Math.LOG2E], 'tan(10*Math.LOG2E)', -3.3537128705376014, -3.353712870537601, NaN, -3.353712870537602],
					['tan', [17*Math.SQRT2], 'tan(17*Math.SQRT2)', -1.9222955461799982, -1.922295546179998, NaN, NaN],
					['tan', [34*Math.SQRT1_2], 'tan(34*Math.SQRT1_2)', -1.9222955461799982, -1.922295546179998, NaN, NaN],
					['tan', [10*Math.LOG10E], 'tan(10*Math.LOG10E)', 2.5824856130712432, 2.5824856130712437, NaN, NaN], 
										
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
					
					['polyfill', [2e-3 ** -100], 'polyfill pow(2e-3, -100)', 7.888609052210102e+269, 7.888609052210126e+269, NaN, NaN]
				];
				const contentWindowMath = contentWindow ? contentWindow.Math : Math;
				const data = {};
				fns.forEach(fn => {
					data[fn[2]] = attempt(() => {
						const result = fn[0] != 'polyfill' ? contentWindowMath[fn[0]](...fn[1]) : fn[1];
						const chrome = result == fn[3];
						const firefox = fn[4] ? result == fn[4] : false;
						const torBrowser = fn[5] ? result == fn[5] : false;
						const safari = fn[6] ? result == fn[6] : false;
						return { result, chrome, firefox, torBrowser, safari }
					});
				});
				
				const $hash = await hashify(data);
				logTestResult({ test: 'math', passed: true });
				return resolve({ data, lied, $hash })
			}
			catch (error) {
				logTestResult({ test: 'math', passed: false });
				captureError(error);
				return resolve()
			}
		})
	};

	// media devices
	const getMediaDevices = imports => {

		const {
			require: {
				hashify,
				captureError,
				contentWindow,
				logTestResult
			}
		} = imports;

		return new Promise(async resolve => {
			try {
				const contentWindowNavigator = contentWindow ? contentWindow.navigator : navigator;
				if (!('mediaDevices' in contentWindowNavigator)) {
					logTestResult({ test: 'media devices', passed: false });
					return resolve()
				}
				if (!contentWindowNavigator.mediaDevices || !contentWindowNavigator.mediaDevices.enumerateDevices) {
					logTestResult({ test: 'media devices', passed: false });
					return resolve()
				}
				const mediaDevicesEnumerated = await contentWindowNavigator.mediaDevices.enumerateDevices();
				const mediaDevices = (
					mediaDevicesEnumerated ? mediaDevicesEnumerated
						.map(({ kind }) => ({ kind })).sort((a, b) => (a.kind > b.kind) ? 1 : -1) :
					undefined
				);
				const $hash = await hashify(mediaDevices);
				logTestResult({ test: 'media devices', passed: true });
				return resolve({ mediaDevices, $hash })
			}
			catch (error) {
				logTestResult({ test: 'media devices', passed: false });
				captureError(error);
				return resolve()
			}
		})
	};

	// inspired by 
	// - https://privacycheck.sec.lrz.de/active/fp_cpt/fp_can_play_type.html
	// - https://arkenfox.github.io/TZP/tzp.html
	const mimeTypes = ['application/mp21','application/mp4','application/octet-stream','application/ogg','application/vnd.apple.mpegurl','application/vnd.ms-ss','application/vnd.ms-sstr+xml','application/x-mpegurl','application/x-mpegURL; codecs="avc1.42E01E"','audio/3gpp','audio/3gpp2','audio/aac','audio/ac-3','audio/ac3','audio/aiff','audio/basic','audio/ec-3','audio/flac','audio/m4a','audio/mid','audio/midi','audio/mp3','audio/mp4','audio/mp4; codecs="a3ds"','audio/mp4; codecs="A52"','audio/mp4; codecs="aac"','audio/mp4; codecs="ac-3"','audio/mp4; codecs="ac-4"','audio/mp4; codecs="ac3"','audio/mp4; codecs="alac"','audio/mp4; codecs="alaw"','audio/mp4; codecs="bogus"','audio/mp4; codecs="dra1"','audio/mp4; codecs="dts-"','audio/mp4; codecs="dts+"','audio/mp4; codecs="dtsc"','audio/mp4; codecs="dtse"','audio/mp4; codecs="dtsh"','audio/mp4; codecs="dtsl"','audio/mp4; codecs="dtsx"','audio/mp4; codecs="ec-3"','audio/mp4; codecs="enca"','audio/mp4; codecs="flac"','audio/mp4; codecs="g719"','audio/mp4; codecs="g726"','audio/mp4; codecs="m4ae"','audio/mp4; codecs="mha1"','audio/mp4; codecs="mha2"','audio/mp4; codecs="mhm1"','audio/mp4; codecs="mhm2"','audio/mp4; codecs="mlpa"','audio/mp4; codecs="mp3"','audio/mp4; codecs="mp4a.40.1"','audio/mp4; codecs="mp4a.40.12"','audio/mp4; codecs="mp4a.40.13"','audio/mp4; codecs="mp4a.40.14"','audio/mp4; codecs="mp4a.40.15"','audio/mp4; codecs="mp4a.40.16"','audio/mp4; codecs="mp4a.40.17"','audio/mp4; codecs="mp4a.40.19"','audio/mp4; codecs="mp4a.40.2"','audio/mp4; codecs="mp4a.40.20"','audio/mp4; codecs="mp4a.40.21"','audio/mp4; codecs="mp4a.40.22"','audio/mp4; codecs="mp4a.40.23"','audio/mp4; codecs="mp4a.40.24"','audio/mp4; codecs="mp4a.40.25"','audio/mp4; codecs="mp4a.40.26"','audio/mp4; codecs="mp4a.40.27"','audio/mp4; codecs="mp4a.40.28"','audio/mp4; codecs="mp4a.40.29"','audio/mp4; codecs="mp4a.40.3"','audio/mp4; codecs="mp4a.40.32"','audio/mp4; codecs="mp4a.40.33"','audio/mp4; codecs="mp4a.40.34"','audio/mp4; codecs="mp4a.40.35"','audio/mp4; codecs="mp4a.40.36"','audio/mp4; codecs="mp4a.40.4"','audio/mp4; codecs="mp4a.40.5"','audio/mp4; codecs="mp4a.40.6"','audio/mp4; codecs="mp4a.40.7"','audio/mp4; codecs="mp4a.40.8"','audio/mp4; codecs="mp4a.40.9"','audio/mp4; codecs="mp4a.40"','audio/mp4; codecs="mp4a.66"','audio/mp4; codecs="mp4a.67"','audio/mp4; codecs="mp4a.68"','audio/mp4; codecs="mp4a.69"','audio/mp4; codecs="mp4a.6B"','audio/mp4; codecs="mp4a"','audio/mp4; codecs="Opus"','audio/mp4; codecs="raw "','audio/mp4; codecs="samr"','audio/mp4; codecs="sawb"','audio/mp4; codecs="sawp"','audio/mp4; codecs="sevc"','audio/mp4; codecs="sqcp"','audio/mp4; codecs="ssmv"','audio/mp4; codecs="twos"','audio/mp4; codecs="ulaw"','audio/mpeg','audio/mpeg; codecs="mp3"','audio/mpegurl','audio/ogg; codecs="flac"','audio/ogg; codecs="opus"','audio/ogg; codecs="speex"','audio/ogg; codecs="vorbis"','audio/vnd.rn-realaudio','audio/vnd.wave','audio/wav','audio/wav; codecs="0"','audio/wav; codecs="1"','audio/wav; codecs="2"','audio/wave','audio/wave; codecs="0"','audio/wave; codecs="1"','audio/wave; codecs="2"','audio/webm','audio/webm; codecs="opus"','audio/webm; codecs="vorbis"','audio/wma','audio/x-aac','audio/x-ac3','audio/x-aiff','audio/x-flac','audio/x-m4a','audio/x-midi','audio/x-mpeg','audio/x-mpegurl','audio/x-pn-realaudio','audio/x-pn-realaudio-plugin','audio/x-pn-wav','audio/x-pn-wav; codecs="0"','audio/x-pn-wav; codecs="1"','audio/x-pn-wav; codecs="2"','audio/x-scpls','audio/x-wav','audio/x-wav; codecs="0"','audio/x-wav; codecs="1"','audio/x-wav; codecs="2"','video/3gpp','video/3gpp; codecs="mp4v.20.8, samr"','video/3gpp2','video/avi','video/h263','video/mp2t','video/mp4','video/mp4; codecs="3gvo"','video/mp4; codecs="a3d1"','video/mp4; codecs="a3d2"','video/mp4; codecs="a3d3"','video/mp4; codecs="a3d4"','video/mp4; codecs="av01.0.08M.08"','video/mp4; codecs="avc1.2c000a"','video/mp4; codecs="avc1.2c000b"','video/mp4; codecs="avc1.2c000c"','video/mp4; codecs="avc1.2c000d"','video/mp4; codecs="avc1.2c0014"','video/mp4; codecs="avc1.2c0015"','video/mp4; codecs="avc1.2c0016"','video/mp4; codecs="avc1.2c001e"','video/mp4; codecs="avc1.2c001f"','video/mp4; codecs="avc1.2c0020"','video/mp4; codecs="avc1.2c0028"','video/mp4; codecs="avc1.2c0029"','video/mp4; codecs="avc1.2c002a"','video/mp4; codecs="avc1.2c0032"','video/mp4; codecs="avc1.2c0033"','video/mp4; codecs="avc1.2c0034"','video/mp4; codecs="avc1.2c003c"','video/mp4; codecs="avc1.2c003d"','video/mp4; codecs="avc1.2c003e"','video/mp4; codecs="avc1.2c003f"','video/mp4; codecs="avc1.2c0040"','video/mp4; codecs="avc1.2c0050"','video/mp4; codecs="avc1.2c006e"','video/mp4; codecs="avc1.2c0085"','video/mp4; codecs="avc1.42000a"','video/mp4; codecs="avc1.42000b"','video/mp4; codecs="avc1.42000c"','video/mp4; codecs="avc1.42000d"','video/mp4; codecs="avc1.420014"','video/mp4; codecs="avc1.420015"','video/mp4; codecs="avc1.420016"','video/mp4; codecs="avc1.42001e"','video/mp4; codecs="avc1.42001f"','video/mp4; codecs="avc1.420020"','video/mp4; codecs="avc1.420028"','video/mp4; codecs="avc1.420029"','video/mp4; codecs="avc1.42002a"','video/mp4; codecs="avc1.420032"','video/mp4; codecs="avc1.420033"','video/mp4; codecs="avc1.420034"','video/mp4; codecs="avc1.42003c"','video/mp4; codecs="avc1.42003d"','video/mp4; codecs="avc1.42003e"','video/mp4; codecs="avc1.42003f"','video/mp4; codecs="avc1.420040"','video/mp4; codecs="avc1.420050"','video/mp4; codecs="avc1.42006e"','video/mp4; codecs="avc1.420085"','video/mp4; codecs="avc1.42400a"','video/mp4; codecs="avc1.42400b"','video/mp4; codecs="avc1.42400c"','video/mp4; codecs="avc1.42400d"','video/mp4; codecs="avc1.424014"','video/mp4; codecs="avc1.424015"','video/mp4; codecs="avc1.424016"','video/mp4; codecs="avc1.42401e"','video/mp4; codecs="avc1.42401f"','video/mp4; codecs="avc1.424020"','video/mp4; codecs="avc1.424028"','video/mp4; codecs="avc1.424029"','video/mp4; codecs="avc1.42402a"','video/mp4; codecs="avc1.424032"','video/mp4; codecs="avc1.424033"','video/mp4; codecs="avc1.424034"','video/mp4; codecs="avc1.42403c"','video/mp4; codecs="avc1.42403d"','video/mp4; codecs="avc1.42403e"','video/mp4; codecs="avc1.42403f"','video/mp4; codecs="avc1.424040"','video/mp4; codecs="avc1.424050"','video/mp4; codecs="avc1.42406e"','video/mp4; codecs="avc1.424085"','video/mp4; codecs="avc1.4d000a"','video/mp4; codecs="avc1.4d000b"','video/mp4; codecs="avc1.4d000c"','video/mp4; codecs="avc1.4d000d"','video/mp4; codecs="avc1.4d0014"','video/mp4; codecs="avc1.4d0015"','video/mp4; codecs="avc1.4d0016"','video/mp4; codecs="avc1.4d001e"','video/mp4; codecs="avc1.4d001f"','video/mp4; codecs="avc1.4d0020"','video/mp4; codecs="avc1.4d0028"','video/mp4; codecs="avc1.4d0029"','video/mp4; codecs="avc1.4d002a"','video/mp4; codecs="avc1.4d0032"','video/mp4; codecs="avc1.4d0033"','video/mp4; codecs="avc1.4d0034"','video/mp4; codecs="avc1.4d003c"','video/mp4; codecs="avc1.4d003d"','video/mp4; codecs="avc1.4d003e"','video/mp4; codecs="avc1.4d003f"','video/mp4; codecs="avc1.4d0040"','video/mp4; codecs="avc1.4d0050"','video/mp4; codecs="avc1.4d006e"','video/mp4; codecs="avc1.4d0085"','video/mp4; codecs="avc1.4d400a"','video/mp4; codecs="avc1.4d400b"','video/mp4; codecs="avc1.4d400c"','video/mp4; codecs="avc1.4d400d"','video/mp4; codecs="avc1.4d4014"','video/mp4; codecs="avc1.4d4015"','video/mp4; codecs="avc1.4d4016"','video/mp4; codecs="avc1.4d401e"','video/mp4; codecs="avc1.4d401f"','video/mp4; codecs="avc1.4d4020"','video/mp4; codecs="avc1.4d4028"','video/mp4; codecs="avc1.4d4029"','video/mp4; codecs="avc1.4d402a"','video/mp4; codecs="avc1.4d4032"','video/mp4; codecs="avc1.4d4033"','video/mp4; codecs="avc1.4d4034"','video/mp4; codecs="avc1.4d403c"','video/mp4; codecs="avc1.4d403d"','video/mp4; codecs="avc1.4d403e"','video/mp4; codecs="avc1.4d403f"','video/mp4; codecs="avc1.4d4040"','video/mp4; codecs="avc1.4d4050"','video/mp4; codecs="avc1.4d406e"','video/mp4; codecs="avc1.4d4085"','video/mp4; codecs="avc1.53000a"','video/mp4; codecs="avc1.53000b"','video/mp4; codecs="avc1.53000c"','video/mp4; codecs="avc1.53000d"','video/mp4; codecs="avc1.530014"','video/mp4; codecs="avc1.530015"','video/mp4; codecs="avc1.530016"','video/mp4; codecs="avc1.53001e"','video/mp4; codecs="avc1.53001f"','video/mp4; codecs="avc1.530020"','video/mp4; codecs="avc1.530028"','video/mp4; codecs="avc1.530029"','video/mp4; codecs="avc1.53002a"','video/mp4; codecs="avc1.530032"','video/mp4; codecs="avc1.530033"','video/mp4; codecs="avc1.530034"','video/mp4; codecs="avc1.53003c"','video/mp4; codecs="avc1.53003d"','video/mp4; codecs="avc1.53003e"','video/mp4; codecs="avc1.53003f"','video/mp4; codecs="avc1.530040"','video/mp4; codecs="avc1.530050"','video/mp4; codecs="avc1.53006e"','video/mp4; codecs="avc1.530085"','video/mp4; codecs="avc1.53040a"','video/mp4; codecs="avc1.53040b"','video/mp4; codecs="avc1.53040c"','video/mp4; codecs="avc1.53040d"','video/mp4; codecs="avc1.530414"','video/mp4; codecs="avc1.530415"','video/mp4; codecs="avc1.530416"','video/mp4; codecs="avc1.53041e"','video/mp4; codecs="avc1.53041f"','video/mp4; codecs="avc1.530420"','video/mp4; codecs="avc1.530428"','video/mp4; codecs="avc1.530429"','video/mp4; codecs="avc1.53042a"','video/mp4; codecs="avc1.530432"','video/mp4; codecs="avc1.530433"','video/mp4; codecs="avc1.530434"','video/mp4; codecs="avc1.53043c"','video/mp4; codecs="avc1.53043d"','video/mp4; codecs="avc1.53043e"','video/mp4; codecs="avc1.53043f"','video/mp4; codecs="avc1.530440"','video/mp4; codecs="avc1.530450"','video/mp4; codecs="avc1.53046e"','video/mp4; codecs="avc1.530485"','video/mp4; codecs="avc1.56000a"','video/mp4; codecs="avc1.56000b"','video/mp4; codecs="avc1.56000c"','video/mp4; codecs="avc1.56000d"','video/mp4; codecs="avc1.560014"','video/mp4; codecs="avc1.560015"','video/mp4; codecs="avc1.560016"','video/mp4; codecs="avc1.56001e"','video/mp4; codecs="avc1.56001f"','video/mp4; codecs="avc1.560020"','video/mp4; codecs="avc1.560028"','video/mp4; codecs="avc1.560029"','video/mp4; codecs="avc1.56002a"','video/mp4; codecs="avc1.560032"','video/mp4; codecs="avc1.560033"','video/mp4; codecs="avc1.560034"','video/mp4; codecs="avc1.56003c"','video/mp4; codecs="avc1.56003d"','video/mp4; codecs="avc1.56003e"','video/mp4; codecs="avc1.56003f"','video/mp4; codecs="avc1.560040"','video/mp4; codecs="avc1.560050"','video/mp4; codecs="avc1.56006e"','video/mp4; codecs="avc1.560085"','video/mp4; codecs="avc1.56040a"','video/mp4; codecs="avc1.56040b"','video/mp4; codecs="avc1.56040c"','video/mp4; codecs="avc1.56040d"','video/mp4; codecs="avc1.560414"','video/mp4; codecs="avc1.560415"','video/mp4; codecs="avc1.560416"','video/mp4; codecs="avc1.56041e"','video/mp4; codecs="avc1.56041f"','video/mp4; codecs="avc1.560420"','video/mp4; codecs="avc1.560428"','video/mp4; codecs="avc1.560429"','video/mp4; codecs="avc1.56042a"','video/mp4; codecs="avc1.560432"','video/mp4; codecs="avc1.560433"','video/mp4; codecs="avc1.560434"','video/mp4; codecs="avc1.56043c"','video/mp4; codecs="avc1.56043d"','video/mp4; codecs="avc1.56043e"','video/mp4; codecs="avc1.56043f"','video/mp4; codecs="avc1.560440"','video/mp4; codecs="avc1.560450"','video/mp4; codecs="avc1.56046e"','video/mp4; codecs="avc1.560485"','video/mp4; codecs="avc1.56100a"','video/mp4; codecs="avc1.56100b"','video/mp4; codecs="avc1.56100c"','video/mp4; codecs="avc1.56100d"','video/mp4; codecs="avc1.561014"','video/mp4; codecs="avc1.561015"','video/mp4; codecs="avc1.561016"','video/mp4; codecs="avc1.56101e"','video/mp4; codecs="avc1.56101f"','video/mp4; codecs="avc1.561020"','video/mp4; codecs="avc1.561028"','video/mp4; codecs="avc1.561029"','video/mp4; codecs="avc1.56102a"','video/mp4; codecs="avc1.561032"','video/mp4; codecs="avc1.561033"','video/mp4; codecs="avc1.561034"','video/mp4; codecs="avc1.56103c"','video/mp4; codecs="avc1.56103d"','video/mp4; codecs="avc1.56103e"','video/mp4; codecs="avc1.56103f"','video/mp4; codecs="avc1.561040"','video/mp4; codecs="avc1.561050"','video/mp4; codecs="avc1.56106e"','video/mp4; codecs="avc1.561085"','video/mp4; codecs="avc1.58000a"','video/mp4; codecs="avc1.58000b"','video/mp4; codecs="avc1.58000c"','video/mp4; codecs="avc1.58000d"','video/mp4; codecs="avc1.580014"','video/mp4; codecs="avc1.580015"','video/mp4; codecs="avc1.580016"','video/mp4; codecs="avc1.58001e"','video/mp4; codecs="avc1.58001f"','video/mp4; codecs="avc1.580020"','video/mp4; codecs="avc1.580028"','video/mp4; codecs="avc1.580029"','video/mp4; codecs="avc1.58002a"','video/mp4; codecs="avc1.580032"','video/mp4; codecs="avc1.580033"','video/mp4; codecs="avc1.580034"','video/mp4; codecs="avc1.58003c"','video/mp4; codecs="avc1.58003d"','video/mp4; codecs="avc1.58003e"','video/mp4; codecs="avc1.58003f"','video/mp4; codecs="avc1.580040"','video/mp4; codecs="avc1.580050"','video/mp4; codecs="avc1.58006e"','video/mp4; codecs="avc1.580085"','video/mp4; codecs="avc1.64000a"','video/mp4; codecs="avc1.64000b"','video/mp4; codecs="avc1.64000c"','video/mp4; codecs="avc1.64000d"','video/mp4; codecs="avc1.640014"','video/mp4; codecs="avc1.640015"','video/mp4; codecs="avc1.640016"','video/mp4; codecs="avc1.64001e"','video/mp4; codecs="avc1.64001f"','video/mp4; codecs="avc1.640020"','video/mp4; codecs="avc1.640028"','video/mp4; codecs="avc1.640029"','video/mp4; codecs="avc1.64002a"','video/mp4; codecs="avc1.640032"','video/mp4; codecs="avc1.640033"','video/mp4; codecs="avc1.640034"','video/mp4; codecs="avc1.64003c"','video/mp4; codecs="avc1.64003d"','video/mp4; codecs="avc1.64003e"','video/mp4; codecs="avc1.64003f"','video/mp4; codecs="avc1.640040"','video/mp4; codecs="avc1.640050"','video/mp4; codecs="avc1.64006e"','video/mp4; codecs="avc1.640085"','video/mp4; codecs="avc1.64080a"','video/mp4; codecs="avc1.64080b"','video/mp4; codecs="avc1.64080c"','video/mp4; codecs="avc1.64080d"','video/mp4; codecs="avc1.640814"','video/mp4; codecs="avc1.640815"','video/mp4; codecs="avc1.640816"','video/mp4; codecs="avc1.64081e"','video/mp4; codecs="avc1.64081f"','video/mp4; codecs="avc1.640820"','video/mp4; codecs="avc1.640828"','video/mp4; codecs="avc1.640829"','video/mp4; codecs="avc1.64082a"','video/mp4; codecs="avc1.640832"','video/mp4; codecs="avc1.640833"','video/mp4; codecs="avc1.640834"','video/mp4; codecs="avc1.64083c"','video/mp4; codecs="avc1.64083d"','video/mp4; codecs="avc1.64083e"','video/mp4; codecs="avc1.64083f"','video/mp4; codecs="avc1.640840"','video/mp4; codecs="avc1.640850"','video/mp4; codecs="avc1.64086e"','video/mp4; codecs="avc1.640885"','video/mp4; codecs="avc1.6e000a"','video/mp4; codecs="avc1.6e000b"','video/mp4; codecs="avc1.6e000c"','video/mp4; codecs="avc1.6e000d"','video/mp4; codecs="avc1.6e0014"','video/mp4; codecs="avc1.6e0015"','video/mp4; codecs="avc1.6e0016"','video/mp4; codecs="avc1.6e001e"','video/mp4; codecs="avc1.6e001f"','video/mp4; codecs="avc1.6e0020"','video/mp4; codecs="avc1.6e0028"','video/mp4; codecs="avc1.6e0029"','video/mp4; codecs="avc1.6e002a"','video/mp4; codecs="avc1.6e0032"','video/mp4; codecs="avc1.6e0033"','video/mp4; codecs="avc1.6e0034"','video/mp4; codecs="avc1.6e003c"','video/mp4; codecs="avc1.6e003d"','video/mp4; codecs="avc1.6e003e"','video/mp4; codecs="avc1.6e003f"','video/mp4; codecs="avc1.6e0040"','video/mp4; codecs="avc1.6e0050"','video/mp4; codecs="avc1.6e006e"','video/mp4; codecs="avc1.6e0085"','video/mp4; codecs="avc1.6e100a"','video/mp4; codecs="avc1.6e100b"','video/mp4; codecs="avc1.6e100c"','video/mp4; codecs="avc1.6e100d"','video/mp4; codecs="avc1.6e1014"','video/mp4; codecs="avc1.6e1015"','video/mp4; codecs="avc1.6e1016"','video/mp4; codecs="avc1.6e101e"','video/mp4; codecs="avc1.6e101f"','video/mp4; codecs="avc1.6e1020"','video/mp4; codecs="avc1.6e1028"','video/mp4; codecs="avc1.6e1029"','video/mp4; codecs="avc1.6e102a"','video/mp4; codecs="avc1.6e1032"','video/mp4; codecs="avc1.6e1033"','video/mp4; codecs="avc1.6e1034"','video/mp4; codecs="avc1.6e103c"','video/mp4; codecs="avc1.6e103d"','video/mp4; codecs="avc1.6e103e"','video/mp4; codecs="avc1.6e103f"','video/mp4; codecs="avc1.6e1040"','video/mp4; codecs="avc1.6e1050"','video/mp4; codecs="avc1.6e106e"','video/mp4; codecs="avc1.6e1085"','video/mp4; codecs="avc1.76000a"','video/mp4; codecs="avc1.76000b"','video/mp4; codecs="avc1.76000c"','video/mp4; codecs="avc1.76000d"','video/mp4; codecs="avc1.760014"','video/mp4; codecs="avc1.760015"','video/mp4; codecs="avc1.760016"','video/mp4; codecs="avc1.76001e"','video/mp4; codecs="avc1.76001f"','video/mp4; codecs="avc1.760020"','video/mp4; codecs="avc1.760028"','video/mp4; codecs="avc1.760029"','video/mp4; codecs="avc1.76002a"','video/mp4; codecs="avc1.760032"','video/mp4; codecs="avc1.760033"','video/mp4; codecs="avc1.760034"','video/mp4; codecs="avc1.76003c"','video/mp4; codecs="avc1.76003d"','video/mp4; codecs="avc1.76003e"','video/mp4; codecs="avc1.76003f"','video/mp4; codecs="avc1.760040"','video/mp4; codecs="avc1.760050"','video/mp4; codecs="avc1.76006e"','video/mp4; codecs="avc1.760085"','video/mp4; codecs="avc1.7a000a"','video/mp4; codecs="avc1.7a000b"','video/mp4; codecs="avc1.7a000c"','video/mp4; codecs="avc1.7a000d"','video/mp4; codecs="avc1.7a0014"','video/mp4; codecs="avc1.7a0015"','video/mp4; codecs="avc1.7a0016"','video/mp4; codecs="avc1.7a001e"','video/mp4; codecs="avc1.7a001f"','video/mp4; codecs="avc1.7a0020"','video/mp4; codecs="avc1.7a0028"','video/mp4; codecs="avc1.7a0029"','video/mp4; codecs="avc1.7a002a"','video/mp4; codecs="avc1.7a0032"','video/mp4; codecs="avc1.7a0033"','video/mp4; codecs="avc1.7a0034"','video/mp4; codecs="avc1.7a003c"','video/mp4; codecs="avc1.7a003d"','video/mp4; codecs="avc1.7a003e"','video/mp4; codecs="avc1.7a003f"','video/mp4; codecs="avc1.7a0040"','video/mp4; codecs="avc1.7a0050"','video/mp4; codecs="avc1.7a006e"','video/mp4; codecs="avc1.7a0085"','video/mp4; codecs="avc1.7a100a"','video/mp4; codecs="avc1.7a100b"','video/mp4; codecs="avc1.7a100c"','video/mp4; codecs="avc1.7a100d"','video/mp4; codecs="avc1.7a1014"','video/mp4; codecs="avc1.7a1015"','video/mp4; codecs="avc1.7a1016"','video/mp4; codecs="avc1.7a101e"','video/mp4; codecs="avc1.7a101f"','video/mp4; codecs="avc1.7a1020"','video/mp4; codecs="avc1.7a1028"','video/mp4; codecs="avc1.7a1029"','video/mp4; codecs="avc1.7a102a"','video/mp4; codecs="avc1.7a1032"','video/mp4; codecs="avc1.7a1033"','video/mp4; codecs="avc1.7a1034"','video/mp4; codecs="avc1.7a103c"','video/mp4; codecs="avc1.7a103d"','video/mp4; codecs="avc1.7a103e"','video/mp4; codecs="avc1.7a103f"','video/mp4; codecs="avc1.7a1040"','video/mp4; codecs="avc1.7a1050"','video/mp4; codecs="avc1.7a106e"','video/mp4; codecs="avc1.7a1085"','video/mp4; codecs="avc1.80000a"','video/mp4; codecs="avc1.80000b"','video/mp4; codecs="avc1.80000c"','video/mp4; codecs="avc1.80000d"','video/mp4; codecs="avc1.800014"','video/mp4; codecs="avc1.800015"','video/mp4; codecs="avc1.800016"','video/mp4; codecs="avc1.80001e"','video/mp4; codecs="avc1.80001f"','video/mp4; codecs="avc1.800020"','video/mp4; codecs="avc1.800028"','video/mp4; codecs="avc1.800029"','video/mp4; codecs="avc1.80002a"','video/mp4; codecs="avc1.800032"','video/mp4; codecs="avc1.800033"','video/mp4; codecs="avc1.800034"','video/mp4; codecs="avc1.80003c"','video/mp4; codecs="avc1.80003d"','video/mp4; codecs="avc1.80003e"','video/mp4; codecs="avc1.80003f"','video/mp4; codecs="avc1.800040"','video/mp4; codecs="avc1.800050"','video/mp4; codecs="avc1.80006e"','video/mp4; codecs="avc1.800085"','video/mp4; codecs="avc1.8a000a"','video/mp4; codecs="avc1.8a000b"','video/mp4; codecs="avc1.8a000c"','video/mp4; codecs="avc1.8a000d"','video/mp4; codecs="avc1.8a0014"','video/mp4; codecs="avc1.8a0015"','video/mp4; codecs="avc1.8a0016"','video/mp4; codecs="avc1.8a001e"','video/mp4; codecs="avc1.8a001f"','video/mp4; codecs="avc1.8a0020"','video/mp4; codecs="avc1.8a0028"','video/mp4; codecs="avc1.8a0029"','video/mp4; codecs="avc1.8a002a"','video/mp4; codecs="avc1.8a0032"','video/mp4; codecs="avc1.8a0033"','video/mp4; codecs="avc1.8a0034"','video/mp4; codecs="avc1.8a003c"','video/mp4; codecs="avc1.8a003d"','video/mp4; codecs="avc1.8a003e"','video/mp4; codecs="avc1.8a003f"','video/mp4; codecs="avc1.8a0040"','video/mp4; codecs="avc1.8a0050"','video/mp4; codecs="avc1.8a006e"','video/mp4; codecs="avc1.8a0085"','video/mp4; codecs="avc1.f4000a"','video/mp4; codecs="avc1.f4000b"','video/mp4; codecs="avc1.f4000c"','video/mp4; codecs="avc1.f4000d"','video/mp4; codecs="avc1.f40014"','video/mp4; codecs="avc1.f40015"','video/mp4; codecs="avc1.f40016"','video/mp4; codecs="avc1.f4001e"','video/mp4; codecs="avc1.f4001f"','video/mp4; codecs="avc1.f40020"','video/mp4; codecs="avc1.f40028"','video/mp4; codecs="avc1.f40029"','video/mp4; codecs="avc1.f4002a"','video/mp4; codecs="avc1.f40032"','video/mp4; codecs="avc1.f40033"','video/mp4; codecs="avc1.f40034"','video/mp4; codecs="avc1.f4003c"','video/mp4; codecs="avc1.f4003d"','video/mp4; codecs="avc1.f4003e"','video/mp4; codecs="avc1.f4003f"','video/mp4; codecs="avc1.f40040"','video/mp4; codecs="avc1.f40050"','video/mp4; codecs="avc1.f4006e"','video/mp4; codecs="avc1.f40085"','video/mp4; codecs="avc1.f4100a"','video/mp4; codecs="avc1.f4100b"','video/mp4; codecs="avc1.f4100c"','video/mp4; codecs="avc1.f4100d"','video/mp4; codecs="avc1.f41014"','video/mp4; codecs="avc1.f41015"','video/mp4; codecs="avc1.f41016"','video/mp4; codecs="avc1.f4101e"','video/mp4; codecs="avc1.f4101f"','video/mp4; codecs="avc1.f41020"','video/mp4; codecs="avc1.f41028"','video/mp4; codecs="avc1.f41029"','video/mp4; codecs="avc1.f4102a"','video/mp4; codecs="avc1.f41032"','video/mp4; codecs="avc1.f41033"','video/mp4; codecs="avc1.f41034"','video/mp4; codecs="avc1.f4103c"','video/mp4; codecs="avc1.f4103d"','video/mp4; codecs="avc1.f4103e"','video/mp4; codecs="avc1.f4103f"','video/mp4; codecs="avc1.f41040"','video/mp4; codecs="avc1.f41050"','video/mp4; codecs="avc1.f4106e"','video/mp4; codecs="avc1.f41085"','video/mp4; codecs="avc1"','video/mp4; codecs="avc2"','video/mp4; codecs="avc3"','video/mp4; codecs="avc4"','video/mp4; codecs="avcp"','video/mp4; codecs="drac"','video/mp4; codecs="dvav"','video/mp4; codecs="dvhe"','video/mp4; codecs="encf"','video/mp4; codecs="encm"','video/mp4; codecs="encs"','video/mp4; codecs="enct"','video/mp4; codecs="encv"','video/mp4; codecs="fdp "','video/mp4; codecs="hev1.1.6.L93.90"','video/mp4; codecs="hev1.1.6.L93.B0"','video/mp4; codecs="hev1"','video/mp4; codecs="hvc1.1.6.L93.90"','video/mp4; codecs="hvc1.1.6.L93.B0"','video/mp4; codecs="hvc1"','video/mp4; codecs="hvt1"','video/mp4; codecs="ixse"','video/mp4; codecs="lhe1"','video/mp4; codecs="lht1"','video/mp4; codecs="lhv1"','video/mp4; codecs="m2ts"','video/mp4; codecs="mett"','video/mp4; codecs="metx"','video/mp4; codecs="mjp2"','video/mp4; codecs="mlix"','video/mp4; codecs="mp4s"','video/mp4; codecs="mp4v"','video/mp4; codecs="mvc1"','video/mp4; codecs="mvc2"','video/mp4; codecs="mvc3"','video/mp4; codecs="mvc4"','video/mp4; codecs="mvd1"','video/mp4; codecs="mvd2"','video/mp4; codecs="mvd3"','video/mp4; codecs="mvd4"','video/mp4; codecs="oksd"','video/mp4; codecs="pm2t"','video/mp4; codecs="prtp"','video/mp4; codecs="resv"','video/mp4; codecs="rm2t"','video/mp4; codecs="rrtp"','video/mp4; codecs="rsrp"','video/mp4; codecs="rtmd"','video/mp4; codecs="rtp "','video/mp4; codecs="s263"','video/mp4; codecs="sm2t"','video/mp4; codecs="srtp"','video/mp4; codecs="STGS"','video/mp4; codecs="stpp"','video/mp4; codecs="svc1"','video/mp4; codecs="svc2"','video/mp4; codecs="svcM"','video/mp4; codecs="tc64"','video/mp4; codecs="tmcd"','video/mp4; codecs="tx3g"','video/mp4; codecs="unid"','video/mp4; codecs="urim"','video/mp4; codecs="vc-1"','video/mp4; codecs="vp08"','video/mp4; codecs="vp09.00.10.08"','video/mp4; codecs="vp09.00.50.08"','video/mp4; codecs="vp09.01.20.08.01.01.01.01.00"','video/mp4; codecs="vp09.01.20.08.01"','video/mp4; codecs="vp09.02.10.10.01.09.16.09.01"','video/mp4; codecs="vp09"','video/mp4; codecs="wvtt"','video/mpeg','video/mpeg2','video/mpeg4','video/msvideo','video/ogg','video/ogg; codecs="dirac, flac"','video/ogg; codecs="dirac, vorbis"','video/ogg; codecs="flac"','video/ogg; codecs="theora, flac"','video/ogg; codecs="theora, speex"','video/ogg; codecs="theora, vorbis"','video/ogg; codecs="theora"','video/quicktime','video/vnd.rn-realvideo','video/wavelet','video/webm','video/webm; codecs="vorbis"','video/webm; codecs="vp8, opus"','video/webm; codecs="vp8, vorbis"','video/webm; codecs="vp8.0, vorbis"','video/webm; codecs="vp8.0"','video/webm; codecs="vp8"','video/webm; codecs="vp9, opus"','video/webm; codecs="vp9, vorbis"','video/webm; codecs="vp9"','video/x-flv','video/x-la-asf','video/x-m4v','video/x-matroska','video/x-matroska; codecs="theora, vorbis"','video/x-matroska; codecs="theora"','video/x-mkv','video/x-mng','video/x-mpeg2','video/x-ms-wmv','video/x-msvideo','video/x-theora'];

	const getMediaTypes = imports => {

		const {
			require: {
				hashify,
				captureError,
				logTestResult
			}
		} = imports;

		return new Promise(async resolve => {
			try {
				const mediaTypes = [];
				const videoEl = document.createElement('video');
				const audioEl = new Audio();
				const isMediaRecorderSupported = 'MediaRecorder' in window;
				mimeTypes.forEach(type => {
					const data = {
						mimeType: type,
						audioPlayType: audioEl.canPlayType(type),
						videoPlayType: videoEl.canPlayType(type),
						mediaSource: MediaSource.isTypeSupported(type),
						mediaRecorder: isMediaRecorderSupported ? MediaRecorder.isTypeSupported(type) : false
					};
					return mediaTypes.push(data)
				});
				const $hash = await hashify(mediaTypes);
				logTestResult({ test: 'media types', passed: true });
				return resolve({ mediaTypes, $hash })
			}
			catch (error) {
				logTestResult({ test: 'media types', passed: false });
				captureError(error);
				return resolve()
			}
		})
	};

	// special thanks to https://arh.antoinevastel.com/reports/stats/menu.html for stats
	const getNavigator = (imports, workerScope) => {

		const {
			require: {
				getOS,
				hashify,
				hashMini,
				captureError,
				attempt,
				caniuse,
				gibberish,
				sendToTrash,
				trustInteger,
				documentLie,
				lieProps,
				contentWindow,
				hyperNestedIframeWindow,
				getUserAgentPlatform,
				logTestResult
			}
		} = imports;

		return new Promise(async resolve => {
			try {
				let lied = (
					lieProps['Navigator.appVersion'] ||
					lieProps['Navigator.deviceMemory'] ||
					lieProps['Navigator.doNotTrack'] ||
					lieProps['Navigator.hardwareConcurrency'] ||
					lieProps['Navigator.language'] ||
					lieProps['Navigator.languages'] ||
					lieProps['Navigator.maxTouchPoints'] ||
					lieProps['Navigator.platform'] ||
					lieProps['Navigator.userAgent'] ||
					lieProps['Navigator.vendor'] ||
					lieProps['Navigator.plugins'] ||
					lieProps['Navigator.mimeTypes']
				) || false;

				const contentWindowNavigator = contentWindow ? contentWindow.navigator : navigator;
				const detectLies = (name, value) => {
					const workerScopeValue = caniuse(() => workerScope, [name]);
					const workerScopeMatchLie = { fingerprint: '', lies: [{ ['does not match worker scope']: false }] };
					if (workerScopeValue) {
						if (name == 'userAgent') {
							const navigatorUserAgent = value;
							const system = getOS(navigatorUserAgent);
							if (workerScope.system != system) {
								lied = true;
								documentLie(`Navigator.${name}`, system, workerScopeMatchLie);
							}
							if (workerScope.userAgent != navigatorUserAgent) {
								lied = true;
								documentLie(`Navigator.${name}`, navigatorUserAgent, workerScopeMatchLie);
							}
							return value
						}
						else if (name != 'userAgent' && workerScopeValue != value) {
							lied = true;
							documentLie(`Navigator.${name}`, value, workerScopeMatchLie);
							return value
						}
					}
					return value
				};
				const credibleUserAgent = (
					'chrome' in window ? navigator.userAgent.includes(navigator.appVersion) : true
				);

				const data = {
					platform: attempt(() => {
						const { platform } = contentWindowNavigator;
						const navigatorPlatform = navigator.platform;
						const systems = ['win', 'linux', 'mac', 'arm', 'pike', 'linux', 'iphone', 'ipad', 'ipod', 'android', 'x11'];
						const trusted = typeof navigatorPlatform == 'string' && systems.filter(val => navigatorPlatform.toLowerCase().includes(val))[0];
						detectLies('platform', navigatorPlatform);
						if (!trusted) {
							sendToTrash(`platform`, `${navigatorPlatform} is unusual`);
						}
						if (platform != navigatorPlatform) {
							lied = true;
							const nestedIframeLie = {
								fingerprint: '',
								lies: [{ [`Expected "${navigatorPlatform}" in nested iframe and got "${platform}"`]: true }]
							};
							documentLie(`Navigator.platform`, hashMini({platform, navigatorPlatform}), nestedIframeLie);
						}
						return platform
					}),
					system: attempt(() => getOS(contentWindowNavigator.userAgent), 'userAgent system failed'),
					device: attempt(() => getUserAgentPlatform({ userAgent: contentWindowNavigator.userAgent }), 'userAgent device failed'),
					userAgent: attempt(() => {
						const { userAgent } = contentWindowNavigator;
						const navigatorUserAgent = navigator.userAgent;
						detectLies('userAgent', navigatorUserAgent);
						if (!credibleUserAgent) {
							sendToTrash('userAgent', `${navigatorUserAgent} does not match appVersion`);
						}
						if (/\s{2,}|^\s|\s$/g.test(navigatorUserAgent)) {
							sendToTrash('userAgent', `extra spaces in "${navigatorUserAgent.replace(/\s{2,}|^\s|\s$/g, '[...]')}"`);
						}
						const gibbers = gibberish(navigatorUserAgent);
						if (!!gibbers.length) {	
							sendToTrash(`userAgent contains gibberish`, `[${gibbers.join(', ')}] ${navigatorUserAgent}`);	
						}
						if (userAgent != navigatorUserAgent) {
							lied = true;
							const nestedIframeLie = {
								fingerprint: '',
								lies: [{ [`Expected "${navigatorUserAgent}" in nested iframe and got "${userAgent}"`]: true }]
							};
							documentLie(`Navigator.userAgent`, hashMini({userAgent, navigatorUserAgent}), nestedIframeLie);
						}
						return userAgent.trim().replace(/\s{2,}/, ' ')
					}, 'userAgent failed'),
					appVersion: attempt(() => {
						const { appVersion } = contentWindowNavigator;
						const navigatorAppVersion = navigator.appVersion;
						detectLies('appVersion', appVersion);
						if (!credibleUserAgent) {
							sendToTrash('appVersion', `${navigatorAppVersion} does not match userAgent`);
						}
						if ('appVersion' in navigator && !navigatorAppVersion) {
							sendToTrash('appVersion', 'Living Standard property returned falsy value');
						}
						if (/\s{2,}|^\s|\s$/g.test(navigatorAppVersion)) {
							sendToTrash('appVersion', `extra spaces in "${navigatorAppVersion.replace(/\s{2,}|^\s|\s$/g, '[...]')}"`);
						}
						if (appVersion != navigatorAppVersion) {
							lied = true;
							const nestedIframeLie = {
								fingerprint: '',
								lies: [{ [`Expected "${navigatorAppVersion}" in nested iframe and got "${appVersion}"`]: true }]
							};
							documentLie(`Navigator.appVersion`, hashMini({appVersion, navigatorAppVersion}), nestedIframeLie);
						}
						return appVersion.trim().replace(/\s{2,}/, ' ')
					}, 'appVersion failed'),
					deviceMemory: attempt(() => {
						if (!('deviceMemory' in navigator)) {
							return undefined
						}
						const { deviceMemory } = contentWindowNavigator;
						const navigatorDeviceMemory = navigator.deviceMemory;
						const trusted = {
							'0': true,
							'1': true, 
							'2': true,
							'4': true, 
							'6': true, 
							'8': true
						};
						trustInteger('deviceMemory - invalid return type', navigatorDeviceMemory);
						if (!trusted[navigatorDeviceMemory]) {
							sendToTrash('deviceMemory', `${navigatorDeviceMemory} is not within set [0, 1, 2, 4, 6, 8]`);
						}
						if (deviceMemory != navigatorDeviceMemory) {
							lied = true;
							const nestedIframeLie = {
								fingerprint: '',
								lies: [{ [`Expected ${navigatorDeviceMemory} in nested iframe and got ${deviceMemory}`]: true }]
							};
							documentLie(`Navigator.deviceMemory`, hashMini({deviceMemory, navigatorDeviceMemory}), nestedIframeLie);
						}
						return deviceMemory
					}, 'deviceMemory failed'),
					doNotTrack: attempt(() => {
						const { doNotTrack } = contentWindowNavigator;
						const navigatorDoNotTrack = navigator.doNotTrack;
						const trusted = {
							'1': !0,
							'true': !0, 
							'yes': !0,
							'0': !0, 
							'false': !0, 
							'no': !0, 
							'unspecified': !0, 
							'null': !0,
							'undefined': !0
						};
						if (!trusted[navigatorDoNotTrack]) {
							sendToTrash('doNotTrack - unusual result', navigatorDoNotTrack);
						}
						return doNotTrack
					}, 'doNotTrack failed'),
					globalPrivacyControl: attempt(() => {
						if (!('globalPrivacyControl' in navigator)) {
							return undefined
						}
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
							'undefined': !0
						};
						if (!trusted[globalPrivacyControl]) {
							sendToTrash('globalPrivacyControl - unusual result', globalPrivacyControl);
						}
						return globalPrivacyControl
					}, 'globalPrivacyControl failed'),
					hardwareConcurrency: attempt(() => {
						if (!('hardwareConcurrency' in navigator)) {
							return undefined
						}
						const hardwareConcurrency = (
							hyperNestedIframeWindow ?
							hyperNestedIframeWindow.navigator.hardwareConcurrency :
							contentWindowNavigator.hardwareConcurrency
						);
						const navigatorHardwareConcurrency = navigator.hardwareConcurrency;
						detectLies('hardwareConcurrency', navigatorHardwareConcurrency);
						trustInteger('hardwareConcurrency - invalid return type', navigatorHardwareConcurrency);
						if (hardwareConcurrency != navigatorHardwareConcurrency) {
							lied = true;
							const nestedIframeLie = {
								fingerprint: '',
								lies: [{ [`Expected ${navigatorHardwareConcurrency} in nested iframe and got ${hardwareConcurrency}`]: true }]
							};
							documentLie(`Navigator.hardwareConcurrency`, hashMini({hardwareConcurrency, navigatorHardwareConcurrency}), nestedIframeLie);
						}
						return hardwareConcurrency
					}, 'hardwareConcurrency failed'),
					language: attempt(() => {
						const { language, languages } = contentWindowNavigator;
						const navigatorLanguage = navigator.language;
						const navigatorLanguages = navigator.languages;
						detectLies('language', navigatorLanguage);
						detectLies('languages', navigatorLanguages);
						if (language != navigatorLanguage) {
							lied = true;
							const nestedIframeLie = {
								fingerprint: '',
								lies: [{ [`Expected "${navigatorLanguage}" in nested iframe and got "${language}"`]: true }]
							};
							documentLie(`Navigator.language`, hashMini({language, navigatorLanguage}), nestedIframeLie);
						}
						if (navigatorLanguage && navigatorLanguages) {
							const lang = /^.{0,2}/g.exec(navigatorLanguage)[0];
							const langs = /^.{0,2}/g.exec(navigatorLanguages[0])[0];
							if (langs != lang) {
								sendToTrash('language/languages', `${[navigatorLanguage, navigatorLanguages].join(' ')} mismatch`);
							}
							return `${languages.join(', ')} (${language})`
						}
						return `${language} ${languages}`
					}, 'language(s) failed'),
					maxTouchPoints: attempt(() => {
						if (!('maxTouchPoints' in navigator)) {
							return null
						}
						const { maxTouchPoints } = contentWindowNavigator;
						const navigatorMaxTouchPoints = navigator.maxTouchPoints;	
						if (maxTouchPoints != navigatorMaxTouchPoints) {	
							lied = true;
							const nestedIframeLie = {
								fingerprint: '',
								lies: [{ [`Expected ${navigatorMaxTouchPoints} in nested iframe and got ${maxTouchPoints}`]: true }]
							};
							documentLie(`Navigator.maxTouchPoints`, hashMini({maxTouchPoints, navigatorMaxTouchPoints}), nestedIframeLie);	
						}

						return maxTouchPoints
					}, 'maxTouchPoints failed'),
					vendor: attempt(() => {
						const { vendor } = contentWindowNavigator;
						const navigatorVendor = navigator.vendor;
						if (vendor != navigatorVendor) {
							lied = true;
							const nestedIframeLie = {
								fingerprint: '',
								lies: [{ [`Expected "${navigatorVendor}" in nested iframe and got "${vendor}"`]: true }]
							};
							documentLie(`Navigator.vendor`, hashMini({vendor, navigatorVendor}), nestedIframeLie);
						}
						return vendor
					}, 'vendor failed'),
					mimeTypes: attempt(() => {
						const mimeTypes = contentWindowNavigator.mimeTypes;
						return mimeTypes ? [...mimeTypes].map(m => m.type) : []
					}, 'mimeTypes failed'),
					plugins: attempt(() => {
						const navigatorPlugins = navigator.plugins;
						const ownProperties = Object.getOwnPropertyNames(navigatorPlugins).filter(name => isNaN(+name));
						const ownPropertiesSet = new Set(ownProperties);
						const plugins = contentWindowNavigator.plugins;
						const response = plugins ? [...contentWindowNavigator.plugins]
							.map(p => ({
								name: p.name,
								description: p.description,
								filename: p.filename,
								version: p.version
							})) : [];

						const mimeTypesDescriptions = new Set([...navigator.mimeTypes].map(mime => mime.description));
						mimeTypesDescriptions.delete('');
						const mimeTypesDescriptionsString = `${[...mimeTypesDescriptions].join(', ')}`;
						const pluginsList = [...navigator.plugins].filter(plugin => plugin.description != '');
						const validPluginList = pluginsList.filter(plugin => !!caniuse(() => plugin[0].description));
						
						const mimeTypePluginNames = ''+[...new Set([...navigator.mimeTypes].map(mimeType => mimeType.enabledPlugin.name))].sort();
						const rawPluginNames = ''+[...new Set([...navigator.plugins].map(plugin => plugin.name))].sort();
						if (mimeTypePluginNames != rawPluginNames) {
							lied = true;
							const pluginsLie = {
								fingerprint: '',
								lies: [{ [`Expected MimeType Plugins to match Plugins: "${mimeTypePluginNames}" should match "${rawPluginNames}"`]: true }]
							};
							documentLie(`Navigator.plugins`, hashMini({mimeTypePluginNames, rawPluginNames}), pluginsLie);
						}

						const nonMimetypePlugins = pluginsList
							.filter(plugin => !caniuse(() => plugin[0].description))
							.map(plugin => plugin.description);
						if (!!nonMimetypePlugins.length) {
							lied = true;
							const pluginsLie = {
								fingerprint: '',
								lies: [{ [`Expected a MimeType object in plugins [${nonMimetypePlugins.join(', ')}]`]: true }]
							};
							documentLie(`Navigator.plugins`, hashMini(nonMimetypePlugins), pluginsLie);
						}

						const nonMatchingMimetypePlugins = validPluginList
							.filter(plugin => plugin[0].description != plugin.description)
							.map(plugin => [plugin.description, plugin[0].description]);
						if (!!nonMatchingMimetypePlugins.length) {
							lied = true;
							const pluginsLie = {
								fingerprint: '',
								lies: [{ [`Expected plugin MimeType description to match plugin description: ${
								nonMatchingMimetypePlugins
									.map(description => `${description[0]} should match ${description[1]}`)
									.join(', ')
							}`]: true }]
							};
							documentLie(`Navigator.plugins`, hashMini(nonMatchingMimetypePlugins), pluginsLie);
						}
						
						const invalidPrototypeMimeTypePlugins = validPluginList
							.filter(plugin => !mimeTypesDescriptions.has(plugin[0].description))
							.map(plugin => [plugin[0].description, mimeTypesDescriptionsString]);
						if (!!invalidPrototypeMimeTypePlugins.length) {
							lied = true;
							const pluginsLie = {
								fingerprint: '',
								lies: [{ [`Expected plugin MimeType description to match a MimeType description: ${
								invalidPrototypeMimeTypePlugins
									.map(description => `${description[0]} is not in [${description[1]}]`)
									.join(', ')
							}`]: true }]
							};
							documentLie(`Navigator.plugins`, hashMini(invalidPrototypeMimeTypePlugins), pluginsLie);
						}
						
						const invalidMimetypePlugins = validPluginList
							.filter(plugin => !mimeTypesDescriptions.has(plugin.description))
							.map(plugin => [plugin.description, mimeTypesDescriptionsString]);
						if (!!invalidMimetypePlugins.length) {
							lied = true;
							const pluginsLie = {
								fingerprint: '',
								lies: [{ [`Expected plugin description to match a MimeType description: ${
								invalidMimetypePlugins
									.map(description => `${description[0]} is not in [${description[1]}]`)
									.join(', ')
							}`]: true }]
							};
							documentLie(`Navigator.plugins`, hashMini(invalidMimetypePlugins), pluginsLie);
						}

						if (!!response.length) {	
							response.forEach(plugin => {	
								const { name, description } = plugin;

								if (!ownPropertiesSet.has(name)) {
									lied = true;
									const pluginsLie = {
										fingerprint: '',
										lies: [{ [`Expected name "${name}" in plugins own properties and got [${ownProperties.join(', ')}]`]: true }]
									};
									documentLie(`Navigator.plugins`, hashMini(ownProperties), pluginsLie);
								}

								const nameGibbers = gibberish(name);
								const descriptionGibbers = gibberish(description);	
								if (!!nameGibbers.length) {	
									sendToTrash(`plugin name contains gibberish`, `[${nameGibbers.join(', ')}] ${name}`);	
								}
								if (!!descriptionGibbers.length) {	
									sendToTrash(`plugin description contains gibberish`, `[${descriptionGibbers.join(', ')}] ${description}`);
								}	
								return	
							});	
						}
						return response
					}, 'plugins failed'),
					properties: attempt(() => {
						const keys = Object.keys(Object.getPrototypeOf(contentWindowNavigator));
						return keys
					}, 'navigator keys failed'),
					highEntropyValues: await attempt(async () => { 
						if (!('userAgentData' in contentWindowNavigator)) {
							return undefined
						}
						const data = await contentWindowNavigator.userAgentData.getHighEntropyValues(
							['platform', 'platformVersion', 'architecture',  'model', 'uaFullVersion']
						);
						return data
					}, 'highEntropyValues failed')
				};
				const $hash = await hashify(data);
				logTestResult({ test: 'navigator', passed: true });
				return resolve({ ...data, lied, $hash })
			}
			catch (error) {
				logTestResult({ test: 'navigator', passed: false });
				captureError(error, 'Navigator failed or blocked by client');
				return resolve(undefined)
			}
		})
	};

	// inspired by
	// https://privacycheck.sec.lrz.de/active/fp_gcr/fp_getclientrects.html
	// https://privacycheck.sec.lrz.de/active/fp_e/fp_emoji.html
	const emojis = [[128512],[128515],[128516],[128513],[128518],[128517],[129315],[128514],[128578],[128579],[128521],[128522],[128519],[129392],[128525],[129321],[128536],[128535],[9786],[128538],[128537],[129394],[128523],[128539],[128540],[129322],[128541],[129297],[129303],[129325],[129323],[129300],[129296],[129320],[128528],[128529],[128566],[128527],[128530],[128580],[128556],[129317],[128524],[128532],[128554],[129316],[128564],[128567],[129298],[129301],[129314],[129326],[129319],[129397],[129398],[129396],[128565],[129327],[129312],[129395],[129400],[128526],[129299],[129488],[128533],[128543],[128577],[9785],[128558],[128559],[128562],[128563],[129402],[128550],[128551],[128552],[128560],[128549],[128546],[128557],[128561],[128534],[128547],[128542],[128531],[128553],[128555],[129393],[128548],[128545],[128544],[129324],[128520],[128127],[128128],[9760],[128169],[129313],[128121],[128122],[128123],[128125],[128126],[129302],[128570],[128568],[128569],[128571],[128572],[128573],[128576],[128575],[128574],[128584],[128585],[128586],[128139],[128140],[128152],[128157],[128150],[128151],[128147],[128158],[128149],[128159],[10083],[128148],[10084],[129505],[128155],[128154],[128153],[128156],[129294],[128420],[129293],[128175],[128162],[128165],[128171],[128166],[128168],[128371],[128163],[128172],[128065,65039,8205,128488,65039],[128488],[128495],[128173],[128164],[128075],[129306],[128400],[9995],[128406],[128076],[129292],[129295],[9996],[129310],[129311],[129304],[129305],[128072],[128073],[128070],[128405],[128071],[9757],[128077],[128078],[9994],[128074],[129307],[129308],[128079],[128588],[128080],[129330],[129309],[128591],[9997],[128133],[129331],[128170],[129470],[129471],[129461],[129462],[128066],[129467],[128067],[129504],[129728],[129729],[129463],[129460],[128064],[128065],[128069],[128068],[128118],[129490],[128102],[128103],[129489],[128113],[128104],[129492],[128104,8205,129456],[128104,8205,129457],[128104,8205,129459],[128104,8205,129458],[128105],[128105,8205,129456],[129489,8205,129456],[128105,8205,129457],[129489,8205,129457],[128105,8205,129459],[129489,8205,129459],[128105,8205,129458],[129489,8205,129458],[128113,8205,9792,65039],[128113,8205,9794,65039],[129491],[128116],[128117],[128589],[128589,8205,9794,65039],[128589,8205,9792,65039],[128590],[128590,8205,9794,65039],[128590,8205,9792,65039],[128581],[128581,8205,9794,65039],[128581,8205,9792,65039],[128582],[128582,8205,9794,65039],[128582,8205,9792,65039],[128129],[128129,8205,9794,65039],[128129,8205,9792,65039],[128587],[128587,8205,9794,65039],[128587,8205,9792,65039],[129487],[129487,8205,9794,65039],[129487,8205,9792,65039],[128583],[128583,8205,9794,65039],[128583,8205,9792,65039],[129318],[129318,8205,9794,65039],[129318,8205,9792,65039],[129335],[129335,8205,9794,65039],[129335,8205,9792,65039],[129489,8205,9877,65039],[128104,8205,9877,65039],[128105,8205,9877,65039],[129489,8205,127891],[128104,8205,127891],[128105,8205,127891],[129489,8205,127979],[128104,8205,127979],[128105,8205,127979],[129489,8205,9878,65039],[128104,8205,9878,65039],[128105,8205,9878,65039],[129489,8205,127806],[128104,8205,127806],[128105,8205,127806],[129489,8205,127859],[128104,8205,127859],[128105,8205,127859],[129489,8205,128295],[128104,8205,128295],[128105,8205,128295],[129489,8205,127981],[128104,8205,127981],[128105,8205,127981],[129489,8205,128188],[128104,8205,128188],[128105,8205,128188],[129489,8205,128300],[128104,8205,128300],[128105,8205,128300],[129489,8205,128187],[128104,8205,128187],[128105,8205,128187],[129489,8205,127908],[128104,8205,127908],[128105,8205,127908],[129489,8205,127912],[128104,8205,127912],[128105,8205,127912],[129489,8205,9992,65039],[128104,8205,9992,65039],[128105,8205,9992,65039],[129489,8205,128640],[128104,8205,128640],[128105,8205,128640],[129489,8205,128658],[128104,8205,128658],[128105,8205,128658],[128110],[128110,8205,9794,65039],[128110,8205,9792,65039],[128373],[128373,65039,8205,9794,65039],[128373,65039,8205,9792,65039],[128130],[128130,8205,9794,65039],[128130,8205,9792,65039],[129399],[128119],[128119,8205,9794,65039],[128119,8205,9792,65039],[129332],[128120],[128115],[128115,8205,9794,65039],[128115,8205,9792,65039],[128114],[129493],[129333],[129333,8205,9794,65039],[129333,8205,9792,65039],[128112],[128112,8205,9794,65039],[128112,8205,9792,65039],[129328],[129329],[128105,8205,127868],[128104,8205,127868],[129489,8205,127868],[128124],[127877],[129334],[129489,8205,127876],[129464],[129464,8205,9794,65039],[129464,8205,9792,65039],[129465],[129465,8205,9794,65039],[129465,8205,9792,65039],[129497],[129497,8205,9794,65039],[129497,8205,9792,65039],[129498],[129498,8205,9794,65039],[129498,8205,9792,65039],[129499],[129499,8205,9794,65039],[129499,8205,9792,65039],[129500],[129500,8205,9794,65039],[129500,8205,9792,65039],[129501],[129501,8205,9794,65039],[129501,8205,9792,65039],[129502],[129502,8205,9794,65039],[129502,8205,9792,65039],[129503],[129503,8205,9794,65039],[129503,8205,9792,65039],[128134],[128134,8205,9794,65039],[128134,8205,9792,65039],[128135],[128135,8205,9794,65039],[128135,8205,9792,65039],[128694],[128694,8205,9794,65039],[128694,8205,9792,65039],[129485],[129485,8205,9794,65039],[129485,8205,9792,65039],[129486],[129486,8205,9794,65039],[129486,8205,9792,65039],[129489,8205,129455],[128104,8205,129455],[128105,8205,129455],[129489,8205,129468],[128104,8205,129468],[128105,8205,129468],[129489,8205,129469],[128104,8205,129469],[128105,8205,129469],[127939],[127939,8205,9794,65039],[127939,8205,9792,65039],[128131],[128378],[128372],[128111],[128111,8205,9794,65039],[128111,8205,9792,65039],[129494],[129494,8205,9794,65039],[129494,8205,9792,65039],[129495],[129495,8205,9794,65039],[129495,8205,9792,65039],[129338],[127943],[9975],[127938],[127948],[127948,65039,8205,9794,65039],[127948,65039,8205,9792,65039],[127940],[127940,8205,9794,65039],[127940,8205,9792,65039],[128675],[128675,8205,9794,65039],[128675,8205,9792,65039],[127946],[127946,8205,9794,65039],[127946,8205,9792,65039],[9977],[9977,65039,8205,9794,65039],[9977,65039,8205,9792,65039],[127947],[127947,65039,8205,9794,65039],[127947,65039,8205,9792,65039],[128692],[128692,8205,9794,65039],[128692,8205,9792,65039],[128693],[128693,8205,9794,65039],[128693,8205,9792,65039],[129336],[129336,8205,9794,65039],[129336,8205,9792,65039],[129340],[129340,8205,9794,65039],[129340,8205,9792,65039],[129341],[129341,8205,9794,65039],[129341,8205,9792,65039],[129342],[129342,8205,9794,65039],[129342,8205,9792,65039],[129337],[129337,8205,9794,65039],[129337,8205,9792,65039],[129496],[129496,8205,9794,65039],[129496,8205,9792,65039],[128704],[128716],[129489,8205,129309,8205,129489],[128109],[128107],[128108],[128143],[128105,8205,10084,65039,8205,128139,8205,128104],[128104,8205,10084,65039,8205,128139,8205,128104],[128105,8205,10084,65039,8205,128139,8205,128105],[128145],[128105,8205,10084,65039,8205,128104],[128104,8205,10084,65039,8205,128104],[128105,8205,10084,65039,8205,128105],[128106],[128104,8205,128105,8205,128102],[128104,8205,128105,8205,128103],[128104,8205,128105,8205,128103,8205,128102],[128104,8205,128105,8205,128102,8205,128102],[128104,8205,128105,8205,128103,8205,128103],[128104,8205,128104,8205,128102],[128104,8205,128104,8205,128103],[128104,8205,128104,8205,128103,8205,128102],[128104,8205,128104,8205,128102,8205,128102],[128104,8205,128104,8205,128103,8205,128103],[128105,8205,128105,8205,128102],[128105,8205,128105,8205,128103],[128105,8205,128105,8205,128103,8205,128102],[128105,8205,128105,8205,128102,8205,128102],[128105,8205,128105,8205,128103,8205,128103],[128104,8205,128102],[128104,8205,128102,8205,128102],[128104,8205,128103],[128104,8205,128103,8205,128102],[128104,8205,128103,8205,128103],[128105,8205,128102],[128105,8205,128102,8205,128102],[128105,8205,128103],[128105,8205,128103,8205,128102],[128105,8205,128103,8205,128103],[128483],[128100],[128101],[129730],[128099],[129456],[129457],[129459],[129458],[128053],[128018],[129421],[129447],[128054],[128021],[129454],[128021,8205,129466],[128041],[128058],[129418],[129437],[128049],[128008],[128008,8205,11035],[129409],[128047],[128005],[128006],[128052],[128014],[129412],[129427],[129420],[129452],[128046],[128002],[128003],[128004],[128055],[128022],[128023],[128061],[128015],[128017],[128016],[128042],[128043],[129433],[129426],[128024],[129443],[129423],[129435],[128045],[128001],[128e3],[128057],[128048],[128007],[128063],[129451],[129428],[129415],[128059],[128059,8205,10052,65039],[128040],[128060],[129445],[129446],[129448],[129432],[129441],[128062],[129411],[128020],[128019],[128035],[128036],[128037],[128038],[128039],[128330],[129413],[129414],[129442],[129417],[129444],[129718],[129449],[129434],[129436],[128056],[128010],[128034],[129422],[128013],[128050],[128009],[129429],[129430],[128051],[128011],[128044],[129453],[128031],[128032],[128033],[129416],[128025],[128026],[128012],[129419],[128027],[128028],[128029],[129714],[128030],[129431],[129715],[128375],[128376],[129410],[129439],[129712],[129713],[129440],[128144],[127800],[128174],[127989],[127801],[129344],[127802],[127803],[127804],[127799],[127793],[129716],[127794],[127795],[127796],[127797],[127806],[127807],[9752],[127808],[127809],[127810],[127811],[127815],[127816],[127817],[127818],[127819],[127820],[127821],[129389],[127822],[127823],[127824],[127825],[127826],[127827],[129744],[129373],[127813],[129746],[129381],[129361],[127814],[129364],[129365],[127805],[127798],[129745],[129362],[129388],[129382],[129476],[129477],[127812],[129372],[127792],[127838],[129360],[129366],[129747],[129384],[129391],[129374],[129479],[129472],[127830],[127831],[129385],[129363],[127828],[127839],[127829],[127789],[129386],[127790],[127791],[129748],[129369],[129478],[129370],[127859],[129368],[127858],[129749],[129379],[129367],[127871],[129480],[129474],[129387],[127857],[127832],[127833],[127834],[127835],[127836],[127837],[127840],[127842],[127843],[127844],[127845],[129390],[127841],[129375],[129376],[129377],[129408],[129438],[129424],[129425],[129450],[127846],[127847],[127848],[127849],[127850],[127874],[127856],[129473],[129383],[127851],[127852],[127853],[127854],[127855],[127868],[129371],[9749],[129750],[127861],[127862],[127870],[127863],[127864],[127865],[127866],[127867],[129346],[129347],[129380],[129483],[129475],[129481],[129482],[129378],[127869],[127860],[129348],[128298],[127994],[127757],[127758],[127759],[127760],[128506],[128510],[129517],[127956],[9968],[127755],[128507],[127957],[127958],[127964],[127965],[127966],[127967],[127963],[127959],[129521],[129704],[129717],[128726],[127960],[127962],[127968],[127969],[127970],[127971],[127972],[127973],[127974],[127976],[127977],[127978],[127979],[127980],[127981],[127983],[127984],[128146],[128508],[128509],[9962],[128332],[128725],[128333],[9961],[128331],[9970],[9978],[127745],[127747],[127961],[127748],[127749],[127750],[127751],[127753],[9832],[127904],[127905],[127906],[128136],[127914],[128642],[128643],[128644],[128645],[128646],[128647],[128648],[128649],[128650],[128669],[128670],[128651],[128652],[128653],[128654],[128656],[128657],[128658],[128659],[128660],[128661],[128662],[128663],[128664],[128665],[128763],[128666],[128667],[128668],[127950],[127949],[128757],[129469],[129468],[128762],[128690],[128756],[128761],[128764],[128655],[128739],[128740],[128738],[9981],[128680],[128677],[128678],[128721],[128679],[9875],[9973],[128758],[128676],[128755],[9972],[128741],[128674],[9992],[128745],[128747],[128748],[129666],[128186],[128641],[128671],[128672],[128673],[128752],[128640],[128760],[128718],[129523],[8987],[9203],[8986],[9200],[9201],[9202],[128368],[128347],[128359],[128336],[128348],[128337],[128349],[128338],[128350],[128339],[128351],[128340],[128352],[128341],[128353],[128342],[128354],[128343],[128355],[128344],[128356],[128345],[128357],[128346],[128358],[127761],[127762],[127763],[127764],[127765],[127766],[127767],[127768],[127769],[127770],[127771],[127772],[127777],[9728],[127773],[127774],[129680],[11088],[127775],[127776],[127756],[9729],[9925],[9928],[127780],[127781],[127782],[127783],[127784],[127785],[127786],[127787],[127788],[127744],[127752],[127746],[9730],[9748],[9969],[9889],[10052],[9731],[9924],[9732],[128293],[128167],[127754],[127875],[127876],[127878],[127879],[129512],[10024],[127880],[127881],[127882],[127883],[127885],[127886],[127887],[127888],[127889],[129511],[127872],[127873],[127895],[127903],[127915],[127894],[127942],[127941],[129351],[129352],[129353],[9917],[9918],[129358],[127936],[127952],[127944],[127945],[127934],[129359],[127923],[127951],[127953],[127954],[129357],[127955],[127992],[129354],[129355],[129349],[9971],[9976],[127907],[129343],[127933],[127935],[128759],[129356],[127919],[129664],[129665],[127921],[128302],[129668],[129535],[127918],[128377],[127920],[127922],[129513],[129528],[129669],[129670],[9824],[9829],[9830],[9827],[9823],[127183],[126980],[127924],[127917],[128444],[127912],[129525],[129697],[129526],[129698],[128083],[128374],[129405],[129404],[129466],[128084],[128085],[128086],[129507],[129508],[129509],[129510],[128087],[128088],[129403],[129649],[129650],[129651],[128089],[128090],[128091],[128092],[128093],[128717],[127890],[129652],[128094],[128095],[129406],[129407],[128096],[128097],[129648],[128098],[128081],[128082],[127913],[127891],[129506],[129686],[9937],[128255],[128132],[128141],[128142],[128263],[128264],[128265],[128266],[128226],[128227],[128239],[128276],[128277],[127932],[127925],[127926],[127897],[127898],[127899],[127908],[127911],[128251],[127927],[129687],[127928],[127929],[127930],[127931],[129685],[129345],[129688],[128241],[128242],[9742],[128222],[128223],[128224],[128267],[128268],[128187],[128421],[128424],[9e3],[128433],[128434],[128189],[128190],[128191],[128192],[129518],[127909],[127902],[128253],[127916],[128250],[128247],[128248],[128249],[128252],[128269],[128270],[128367],[128161],[128294],[127982],[129684],[128212],[128213],[128214],[128215],[128216],[128217],[128218],[128211],[128210],[128195],[128220],[128196],[128240],[128478],[128209],[128278],[127991],[128176],[129689],[128180],[128181],[128182],[128183],[128184],[128179],[129534],[128185],[9993],[128231],[128232],[128233],[128228],[128229],[128230],[128235],[128234],[128236],[128237],[128238],[128499],[9999],[10002],[128395],[128394],[128396],[128397],[128221],[128188],[128193],[128194],[128450],[128197],[128198],[128466],[128467],[128199],[128200],[128201],[128202],[128203],[128204],[128205],[128206],[128391],[128207],[128208],[9986],[128451],[128452],[128465],[128274],[128275],[128271],[128272],[128273],[128477],[128296],[129683],[9935],[9874],[128736],[128481],[9876],[128299],[129667],[127993],[128737],[129690],[128295],[129691],[128297],[9881],[128476],[9878],[129455],[128279],[9939],[129693],[129520],[129522],[129692],[9879],[129514],[129515],[129516],[128300],[128301],[128225],[128137],[129656],[128138],[129657],[129658],[128682],[128727],[129694],[129695],[128719],[128715],[129681],[128701],[129696],[128703],[128705],[129700],[129682],[129524],[129527],[129529],[129530],[129531],[129699],[129532],[129701],[129533],[129519],[128722],[128684],[9904],[129702],[9905],[128511],[129703],[127975],[128686],[128688],[9855],[128697],[128698],[128699],[128700],[128702],[128706],[128707],[128708],[128709],[9888],[128696],[9940],[128683],[128691],[128685],[128687],[128689],[128695],[128245],[128286],[9762],[9763],[11014],[8599],[10145],[8600],[11015],[8601],[11013],[8598],[8597],[8596],[8617],[8618],[10548],[10549],[128259],[128260],[128281],[128282],[128283],[128284],[128285],[128720],[9883],[128329],[10017],[9784],[9775],[10013],[9766],[9770],[9774],[128334],[128303],[9800],[9801],[9802],[9803],[9804],[9805],[9806],[9807],[9808],[9809],[9810],[9811],[9934],[128256],[128257],[128258],[9654],[9193],[9197],[9199],[9664],[9194],[9198],[128316],[9195],[128317],[9196],[9208],[9209],[9210],[9167],[127910],[128261],[128262],[128246],[128243],[128244],[9792],[9794],[9895],[10006],[10133],[10134],[10135],[9854],[8252],[8265],[10067],[10068],[10069],[10071],[12336],[128177],[128178],[9877],[9851],[9884],[128305],[128219],[128304],[11093],[9989],[9745],[10004],[10060],[10062],[10160],[10175],[12349],[10035],[10036],[10055],[169],[174],[8482],[35,65039,8419],[42,65039,8419],[48,65039,8419],[49,65039,8419],[50,65039,8419],[51,65039,8419],[52,65039,8419],[53,65039,8419],[54,65039,8419],[55,65039,8419],[56,65039,8419],[57,65039,8419],[128287],[128288],[128289],[128290],[128291],[128292],[127344],[127374],[127345],[127377],[127378],[127379],[8505],[127380],[9410],[127381],[127382],[127358],[127383],[127359],[127384],[127385],[127386],[127489],[127490],[127543],[127542],[127535],[127568],[127545],[127514],[127538],[127569],[127544],[127540],[127539],[12951],[12953],[127546],[127541],[128308],[128992],[128993],[128994],[128309],[128995],[128996],[9899],[9898],[128997],[128999],[129e3],[129001],[128998],[129002],[129003],[11035],[11036],[9724],[9723],[9726],[9725],[9642],[9643],[128310],[128311],[128312],[128313],[128314],[128315],[128160],[128280],[128307],[128306],[127937],[128681],[127884],[127988],[127987],[127987,65039,8205,127752],[127987,65039,8205,9895,65039],[127988,8205,9760,65039],[127462,127464],[127462,127465],[127462,127466],[127462,127467],[127462,127468],[127462,127470],[127462,127473],[127462,127474],[127462,127476],[127462,127478],[127462,127479],[127462,127480],[127462,127481],[127462,127482],[127462,127484],[127462,127485],[127462,127487],[127463,127462],[127463,127463],[127463,127465],[127463,127466],[127463,127467],[127463,127468],[127463,127469],[127463,127470],[127463,127471],[127463,127473],[127463,127474],[127463,127475],[127463,127476],[127463,127478],[127463,127479],[127463,127480],[127463,127481],[127463,127483],[127463,127484],[127463,127486],[127463,127487],[127464,127462],[127464,127464],[127464,127465],[127464,127467],[127464,127468],[127464,127469],[127464,127470],[127464,127472],[127464,127473],[127464,127474],[127464,127475],[127464,127476],[127464,127477],[127464,127479],[127464,127482],[127464,127483],[127464,127484],[127464,127485],[127464,127486],[127464,127487],[127465,127466],[127465,127468],[127465,127471],[127465,127472],[127465,127474],[127465,127476],[127465,127487],[127466,127462],[127466,127464],[127466,127466],[127466,127468],[127466,127469],[127466,127479],[127466,127480],[127466,127481],[127466,127482],[127467,127470],[127467,127471],[127467,127472],[127467,127474],[127467,127476],[127467,127479],[127468,127462],[127468,127463],[127468,127465],[127468,127466],[127468,127467],[127468,127468],[127468,127469],[127468,127470],[127468,127473],[127468,127474],[127468,127475],[127468,127477],[127468,127478],[127468,127479],[127468,127480],[127468,127481],[127468,127482],[127468,127484],[127468,127486],[127469,127472],[127469,127474],[127469,127475],[127469,127479],[127469,127481],[127469,127482],[127470,127464],[127470,127465],[127470,127466],[127470,127473],[127470,127474],[127470,127475],[127470,127476],[127470,127478],[127470,127479],[127470,127480],[127470,127481],[127471,127466],[127471,127474],[127471,127476],[127471,127477],[127472,127466],[127472,127468],[127472,127469],[127472,127470],[127472,127474],[127472,127475],[127472,127477],[127472,127479],[127472,127484],[127472,127486],[127472,127487],[127473,127462],[127473,127463],[127473,127464],[127473,127470],[127473,127472],[127473,127479],[127473,127480],[127473,127481],[127473,127482],[127473,127483],[127473,127486],[127474,127462],[127474,127464],[127474,127465],[127474,127466],[127474,127467],[127474,127468],[127474,127469],[127474,127472],[127474,127473],[127474,127474],[127474,127475],[127474,127476],[127474,127477],[127474,127478],[127474,127479],[127474,127480],[127474,127481],[127474,127482],[127474,127483],[127474,127484],[127474,127485],[127474,127486],[127474,127487],[127475,127462],[127475,127464],[127475,127466],[127475,127467],[127475,127468],[127475,127470],[127475,127473],[127475,127476],[127475,127477],[127475,127479],[127475,127482],[127475,127487],[127476,127474],[127477,127462],[127477,127466],[127477,127467],[127477,127468],[127477,127469],[127477,127472],[127477,127473],[127477,127474],[127477,127475],[127477,127479],[127477,127480],[127477,127481],[127477,127484],[127477,127486],[127478,127462],[127479,127466],[127479,127476],[127479,127480],[127479,127482],[127479,127484],[127480,127462],[127480,127463],[127480,127464],[127480,127465],[127480,127466],[127480,127468],[127480,127469],[127480,127470],[127480,127471],[127480,127472],[127480,127473],[127480,127474],[127480,127475],[127480,127476],[127480,127479],[127480,127480],[127480,127481],[127480,127483],[127480,127485],[127480,127486],[127480,127487],[127481,127462],[127481,127464],[127481,127465],[127481,127467],[127481,127468],[127481,127469],[127481,127471],[127481,127472],[127481,127473],[127481,127474],[127481,127475],[127481,127476],[127481,127479],[127481,127481],[127481,127483],[127481,127484],[127481,127487],[127482,127462],[127482,127468],[127482,127474],[127482,127475],[127482,127480],[127482,127486],[127482,127487],[127483,127462],[127483,127464],[127483,127466],[127483,127468],[127483,127470],[127483,127475],[127483,127482],[127484,127467],[127484,127480],[127485,127472],[127486,127466],[127486,127481],[127487,127462],[127487,127474],[127487,127484],[127988,917607,917602,917605,917614,917607,917631],[127988,917607,917602,917619,917603,917620,917631],[127988,917607,917602,917623,917612,917619,917631]];

	const getClientRects = imports => {

		const {
			require: {
				instanceId,
				hashMini,
				hashify,
				patch,
				html,
				captureError,
				documentLie,
				lieProps,
				logTestResult
			}
		} = imports;
		
		return new Promise(async resolve => {
			try {
				const toJSONParsed = (x) => JSON.parse(JSON.stringify(x));
				let lied = lieProps['Element.getClientRects'] || false; // detect lies
				
				let iframeContainer, doc = document;
				try {
					// create and get rendered iframe

					const len = window.length;
					const div = document.createElement('div');
					div.setAttribute('style', 'visibility:hidden');
					document.body.appendChild(div);
					div.innerHTML = '<iframe></iframe>';
					const iframeWindow = window[len];

					// create and get rendered div in iframe
					iframeContainer = div;
					doc = iframeWindow.document;
				}
				catch (error) {
					captureError(error, 'client blocked getClientRects iframe');
				}

				const rectsId = `${instanceId}-client-rects-div`;
				const divElement = document.createElement('div');
				divElement.setAttribute('id', rectsId);
				doc.body.appendChild(divElement);
				const divRendered = doc.getElementById(rectsId);
				
				// patch div
				patch(divRendered, html`
			<div id="${rectsId}">
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
				<div id="emoji-container">
					<style>
					#emoji {
						position: absolute;
						font-size: 200px;
						height: auto;
					}
					</style>
					<div id="emoji" class="emojis"></div>
				</div>
			</div>
			`);

				// get emojis
				const emojiDiv = doc.getElementById('emoji');
				
				const emojiRects = emojis
					.slice(99, 199) // limit to improve performance
					.map(emoji => String.fromCodePoint(...emoji))
					.map(emoji => {
						emojiDiv.innerHTML = emoji;
						const domRect = emojiDiv.getClientRects()[0];
						return {emoji,...toJSONParsed(domRect)}
					});
				
				// get clientRects
				const rectElems = doc.getElementsByClassName('rects');
				const clientRects = [...rectElems].map(el => {
					return toJSONParsed(el.getClientRects()[0])
				});
				
				// detect failed math calculation lie
				let mathLie = false;
				clientRects.forEach(rect => {
					const { right, left, width, bottom, top, height, x, y } = rect;
					if (
						right - left != width ||
						bottom - top != height ||
						right - x != width ||
						bottom - y != height
					) {
						lied = true;
						mathLie = { fingerprint: '', lies: [{ ['failed math calculation']: true }] };
					}
					return
				});
				if (mathLie) {
					documentLie('Element.getClientRects', hashMini(clientRects), mathLie);
				}
				
				// detect equal elements mismatch lie
				let offsetLie = false;
				const { right: right1, left: left1 } = clientRects[10];
				const { right: right2, left: left2 } = clientRects[11];
				if (right1 != right2 || left1 != left2) {
					offsetLie = { fingerprint: '', lies: [{ ['equal elements mismatch']: true }] };
					documentLie('Element.getClientRects', hashMini(clientRects), offsetLie);
					lied = true;
				}
				
				if (!!iframeContainer) {
					iframeContainer.parentNode.removeChild(iframeContainer);
				}
				else {
					divRendered.parentNode.removeChild(divRendered);
				}
				
				const [
					emojiHash,
					clientHash,
					$hash
				] = await Promise.all([
					hashify(emojiRects),
					hashify(clientRects),
					hashify({emojiRects, clientRects})
				]).catch(error => {
					console.error(error.message);
				});
				logTestResult({ test: 'rects', passed: true });
				return resolve({emojiRects, emojiHash, clientRects, clientHash, lied, $hash })
			}
			catch (error) {
				logTestResult({ test: 'rects', passed: false });
				captureError(error);
				return resolve()
			}
		})
	};

	// screen (allow some discrepancies otherwise lie detection triggers at random)

	const getDevice = (width, height) => {
		// https://gs.statcounter.com/screen-resolution-stats/
		const resolution = [
			{ width: 360, height: 640, device: 'phone'},
			{ width: 360, height: 720, device: 'phone'},
			{ width: 360, height: 740, device: 'phone'},
			{ width: 360, height: 760, device: 'phone'},
			{ width: 360, height: 780, device: 'phone'},
			{ width: 375, height: 667, device: 'phone'},
			{ width: 375, height: 812, device: 'phone'},
			{ width: 412, height: 732, device: 'phone'},
			{ width: 412, height: 846, device: 'phone'},
			{ width: 412, height: 869, device: 'phone'},
			{ width: 412, height: 892, device: 'phone'},
			{ width: 414, height: 736, device: 'phone'},
			{ width: 414, height: 896, device: 'phone'},
			{ width: 600, height: 1024, device: 'tablet'},
			{ width: 601, height: 962, device: 'tablet'},
			{ width: 768, height: 1024, device: 'desktop or tablet'},
			{ width: 800, height: 1280, device: 'desktop or tablet'},
			{ width: 834, height: 1112, device: 'desktop or tablet'},
			{ width: 962, height: 601, device: 'tablet'},
			{ width: 1000, height: 700, device: 'desktop or tablet'},
			{ width: 1000, height: 1000, device: 'desktop or tablet'},
			{ width: 1024, height: 768, device: 'desktop or tablet'},
			{ width: 1024, height: 1366, device: 'desktop or tablet'},
			{ width: 1280, height: 720, device: 'desktop or tablet'},
			{ width: 1280, height: 800, device: 'desktop or tablet'},
			{ width: 1280, height: 1024, device: 'desktop'},
			{ width: 1366, height: 768, device: 'desktop'},
			{ width: 1440, height: 900, device: 'desktop'},
			{ width: 1536, height: 864, device: 'desktop'},
			{ width: 1600, height: 900, device: 'desktop'},
			{ width: 1920, height: 1080, device: 'desktop'}
		];
		for (const display of resolution) {
			if (
				width == display.width && height == display.height || (
					(display.device == 'phone' || display.device == 'tablet') &&
					height == display.width && width == display.height
				)
			) {
				return display.device
			}
		}
		return 'unknown'
	};

	const getScreen = imports => {

		const {
			require: {
				hashify,
				captureError,
				attempt,
				sendToTrash,
				trustInteger,
				lieProps,
				contentWindow,
				logTestResult
			}
		} = imports;
		
		return new Promise(async resolve => {
			try {
				let lied = (
					lieProps['Screen.width'] ||
					lieProps['Screen.height'] ||
					lieProps['Screen.availWidth'] ||
					lieProps['Screen.availHeight'] ||
					lieProps['Screen.colorDepth'] ||
					lieProps['Screen.pixelDepth']
				) || false;
				const contentWindowScreen = contentWindow ? contentWindow.screen : screen;
				const contentWindowOuterWidth = contentWindow ? contentWindow.outerWidth : outerWidth;
				const contentWindowOuterHeight = contentWindow ? contentWindow.outerHeight : outerHeight;
				
				const { width, height, availWidth, availHeight, colorDepth, pixelDepth } = contentWindowScreen;
				const {
					width: screenWidth,
					height: screenHeight,
					availWidth: screenAvailWidth,
					availHeight: screenAvailHeight,
					colorDepth: screenColorDepth,
					pixelDepth: screenPixelDepth
				} = screen;

				const matching = (
					width == screenWidth &&
					height == screenHeight &&
					availWidth == screenAvailWidth &&
					availHeight == screenAvailHeight &&
					colorDepth == screenColorDepth &&
					pixelDepth == screenPixelDepth
				);

				if (!matching) {
					sendToTrash('screen', `[${
					[
						screenWidth,
						screenHeight,
						screenAvailWidth,
						screenAvailHeight,
						screenColorDepth,
						screenPixelDepth
					].join(', ')
				}] does not match iframe`);
				}

				if (screenAvailWidth > screenWidth) {
					sendToTrash('screen', `availWidth (${screenAvailWidth}) is greater than width (${screenWidth})`);
				}

				if (screenAvailHeight > screenHeight) {
					sendToTrash('screen', `availHeight (${screenAvailHeight}) is greater than height (${screenHeight})`);
				}
				
				const trusted = {0:!0, 1:!0, 4:!0, 8:!0, 15:!0, 16:!0, 24:!0, 32:!0, 48:!0};
				if (!trusted[screenColorDepth]) {
					sendToTrash('screen', `colorDepth (${screenColorDepth}) is not within set [0, 16, 24, 32]`);
				}
				
				if (!trusted[screenPixelDepth]) {
					sendToTrash('screen', `pixelDepth (${screenPixelDepth}) is not within set [0, 16, 24, 32]`);
				}

				if (screenPixelDepth != screenColorDepth) {
					sendToTrash('screen', `pixelDepth (${screenPixelDepth}) and colorDepth (${screenColorDepth}) do not match`);
				}

				const data = {
					device: getDevice(width, height),
					width: attempt(() => width ? trustInteger('width - invalid return type', width) : undefined),
					outerWidth: attempt(() => contentWindowOuterWidth ? trustInteger('outerWidth - invalid return type', contentWindowOuterWidth) : undefined),
					availWidth: attempt(() => availWidth ? trustInteger('availWidth - invalid return type', availWidth) : undefined),
					height: attempt(() => height ? trustInteger('height - invalid return type', height) : undefined),
					outerHeight: attempt(() => contentWindowOuterHeight ? trustInteger('outerHeight - invalid return type', contentWindowOuterHeight) : undefined),
					availHeight: attempt(() => availHeight ?  trustInteger('availHeight - invalid return type', availHeight) : undefined),
					colorDepth: attempt(() => colorDepth ? trustInteger('colorDepth - invalid return type', colorDepth) : undefined),
					pixelDepth: attempt(() => pixelDepth ? trustInteger('pixelDepth - invalid return type', pixelDepth) : undefined),
					lied
				};
				const $hash = await hashify(data);
				logTestResult({ test: 'screen', passed: true });
				return resolve({ ...data, $hash })
			}
			catch (error) {
				logTestResult({ test: 'screen', passed: false });
				captureError(error);
				return resolve()
			}
		})
	};

	const getTimezone = imports => {

		const {
			require: {
				hashify,
				captureError,
				attempt,
				caniuse,
				documentLie,
				lieProps,
				contentWindow,
				logTestResult
			}
		} = imports;
		
		return new Promise(async resolve => {
			try {
				let lied;
				const contentWindowDate = contentWindow ? contentWindow.Date : Date;
				const contentWindowIntl = contentWindow ? contentWindow.Intl : Date;
				const computeTimezoneOffset = () => {
					const date = new contentWindowDate().getDate();
					const month = new contentWindowDate().getMonth();
					const year = contentWindowDate().split` `[3]; // current year
					const format = n => (''+n).length == 1 ? `0${n}` : n;
					const dateString = `${month+1}/${format(date)}/${year}`;
					const dateStringUTC = `${year}-${format(month+1)}-${format(date)}`;
					const utc = contentWindowDate.parse(
						new contentWindowDate(dateString)
					);
					const now = +new contentWindowDate(dateStringUTC);
					return +(((utc - now)/60000).toFixed(0))
				};
				// concept inspired by https://arkenfox.github.io/TZP
				const measureTimezoneOffset = timezone => {
					let lie = false;
					const year = contentWindowDate().split` `[3]; // current year
					const minute = 60000;
					const winter = new contentWindowDate(`1/1/${year}`);
					const spring = new contentWindowDate(`4/1/${year}`);
					const summer = new contentWindowDate(`7/1/${year}`);
					const fall = new contentWindowDate(`10/1/${year}`);
					const winterUTCTime = +new contentWindowDate(`${year}-01-01`);
					const springUTCTime = +new contentWindowDate(`${year}-04-01`);
					const summerUTCTime = +new contentWindowDate(`${year}-07-01`);
					const fallUTCTime = +new contentWindowDate(`${year}-10-01`);
					const date = {
						winter: {
							calculated: (+winter - winterUTCTime)/minute,
							parsed: (contentWindowDate.parse(winter) - winterUTCTime)/minute
						},
						spring: {
							calculated: (+spring - springUTCTime)/minute,
							parsed: (contentWindowDate.parse(spring) - springUTCTime)/minute
						},
						summer: {
							calculated: (+summer - summerUTCTime)/minute,
							parsed: (contentWindowDate.parse(summer) - summerUTCTime)/minute
						},
						fall: {
							calculated: (+fall - fallUTCTime)/minute,
							parsed: (contentWindowDate.parse(fall) - fallUTCTime)/minute
						}
					};
					lie = !!Object.keys(date).filter(key => {
						const season = date[key];
						return season.calculated != season.parsed
					}).length;
					const set = new Set(
						[].concat(
							...Object.keys(date).map(key => {
								const season = date[key];
								return [season.calculated, season.parsed]
							})
						)
					);
					lie = !set.has(timezone);
					if (lie) {
						set.add(timezone); // show in result
					}
					return { season: [...set], lie }
				};
				const getTimezoneOffsetSeasons = year => {
					const minute = 60000;
					const winter = new contentWindowDate(`1/1/${year}`);
					const spring = new contentWindowDate(`4/1/${year}`);
					const summer = new contentWindowDate(`7/1/${year}`);
					const fall = new contentWindowDate(`10/1/${year}`);
					const winterUTCTime = +new contentWindowDate(`${year}-01-01`);
					const springUTCTime = +new contentWindowDate(`${year}-04-01`);
					const summerUTCTime = +new contentWindowDate(`${year}-07-01`);
					const fallUTCTime = +new contentWindowDate(`${year}-10-01`);
					const seasons = [
						(+winter - winterUTCTime) / minute,
						(+spring - springUTCTime) / minute,
						(+summer - summerUTCTime) / minute,
						(+fall - fallUTCTime) / minute
					];
					return seasons
				};
				const getRelativeTime = () => {
					const locale = attempt(() => contentWindowIntl.DateTimeFormat().resolvedOptions().locale);
					if (!locale || !caniuse(() => new contentWindowIntl.RelativeTimeFormat)) {
						return undefined
					}
					const relativeTime = new contentWindowIntl.RelativeTimeFormat(locale, {
						localeMatcher: 'best fit',
						numeric: 'auto',
						style: 'long'
					});
					return {
						["format(-1, 'second')"]: relativeTime.format(-1, 'second'),
						["format(0, 'second')"]: relativeTime.format(0, 'second'),
						["format(1, 'second')"]: relativeTime.format(1, 'second'),
						["format(-1, 'minute')"]: relativeTime.format(-1, 'minute'),
						["format(0, 'minute')"]: relativeTime.format(0, 'minute'),
						["format(1, 'minute')"]: relativeTime.format(1, 'minute'),
						["format(-1, 'hour')"]: relativeTime.format(-1, 'hour'),
						["format(0, 'hour')"]: relativeTime.format(0, 'hour'),
						["format(1, 'hour')"]: relativeTime.format(1, 'hour'),
						["format(-1, 'day')"]: relativeTime.format(-1, 'day'),
						["format(0, 'day')"]: relativeTime.format(0, 'day'),
						["format(1, 'day')"]: relativeTime.format(1, 'day'),
						["format(-1, 'week')"]: relativeTime.format(-1, 'week'),
						["format(0, 'week')"]: relativeTime.format(0, 'week'),
						["format(1, 'week'),"]: relativeTime.format(1, 'week'),
						["format(-1, 'month')"]: relativeTime.format(-1, 'month'),
						["format(0, 'month'),"]: relativeTime.format(0, 'month'),
						["format(1, 'month')"]: relativeTime.format(1, 'month'),
						["format(-1, 'quarter')"]: relativeTime.format(-1, 'quarter'),
						["format(0, 'quarter')"]: relativeTime.format(0, 'quarter'),
						["format(1, 'quarter')"]: relativeTime.format(1, 'quarter'),
						["format(-1, 'year')"]: relativeTime.format(-1, 'year'),
						["format(0, 'year')"]: relativeTime.format(0, 'year'),
						["format(1, 'year')"]: relativeTime.format(1, 'year')
					}
				};
				const getLocale = () => {
					const constructors = [
						'Collator',
						'DateTimeFormat',
						'DisplayNames',
						'ListFormat',
						'NumberFormat',
						'PluralRules',
						'RelativeTimeFormat',
					];
					const languages = [];
					constructors.forEach(name => {
						try {
							const obj = caniuse(() => new contentWindowIntl[name]);
							if (!obj) {
								return
							}
							const { locale } = obj.resolvedOptions();
							return languages.push(locale)
						}
						catch (error) {
							return
						}
					});
					const lang = [...new Set(languages)];
					return { lang, lie: lang.length > 1 ? true : false }
				};
				const getWritingSystemKeys = async () => {
					const keys = [
						'Backquote',
						'Backslash',
						'Backspace',
						'BracketLeft',
						'BracketRight',
						'Comma',
						'Digit0',
						'Digit1',
						'Digit2',
						'Digit3',
						'Digit4',
						'Digit5',
						'Digit6',
						'Digit7',
						'Digit8',
						'Digit9',
						'Equal',
						'IntlBackslash',
						'IntlRo',
						'IntlYen',
						'KeyA',
						'KeyB',
						'KeyC',
						'KeyD',
						'KeyE',
						'KeyF',
						'KeyG',
						'KeyH',
						'KeyI',
						'KeyJ',
						'KeyK',
						'KeyL',
						'KeyM',
						'KeyN',
						'KeyO',
						'KeyP',
						'KeyQ',
						'KeyR',
						'KeyS',
						'KeyT',
						'KeyU',
						'KeyV',
						'KeyW',
						'KeyX',
						'KeyY',
						'KeyZ',
						'Minus',
						'Period',
						'Quote',
						'Semicolon',
						'Slash'
					];
					if (caniuse(() => navigator.keyboard.getLayoutMap)) {
						const keyoardLayoutMap = await navigator.keyboard.getLayoutMap();
						const writingSystemKeys= keys.map(key => {
							const value = keyoardLayoutMap.get(key);
							return { [key]: value }
						});
						return writingSystemKeys
					}
					return undefined
				};
				const writingSystemKeys = await getWritingSystemKeys();		
				const timezoneOffset = new contentWindowDate().getTimezoneOffset();
				const timezoneOffsetComputed = computeTimezoneOffset();
				const timezoneOffsetMeasured = measureTimezoneOffset(timezoneOffset);
				const measuredTimezones = timezoneOffsetMeasured.season.join(', ');
				const matchingOffsets = timezoneOffsetComputed == timezoneOffset;
				const notWithinParentheses = /.*\(|\).*/g;
				const timezoneLocation = contentWindowIntl.DateTimeFormat().resolvedOptions().timeZone;
				const timezone = (''+new contentWindowDate()).replace(notWithinParentheses, '');
				const relativeTime = getRelativeTime();
				const locale = getLocale();
				const timezoneOffsetHistory = { };
				const timezoneOffsetUniqueYearHistory = { };
				const years = [...Array(71)].map((val, i) => !i ? 1950 : 1950+i);
				// unique years based work by https://arkenfox.github.io/TZP
				const uniqueYears = [1879, 1884, 1894, 1900, 1921, 1952, 1957, 1976, 2018];
				years.forEach(year => {
					return (timezoneOffsetHistory[year] = getTimezoneOffsetSeasons(year))
				});
				uniqueYears.forEach(year => {
					return (timezoneOffsetUniqueYearHistory[year] = getTimezoneOffsetSeasons(year))
				});
				// document lies
				lied = (
					lieProps['Date.getTimezoneOffset'] ||
					lieProps['Intl.Collator.resolvedOptions'] ||
					lieProps['Intl.DateTimeFormat.resolvedOptions'] ||
					lieProps['Intl.DisplayNames.resolvedOptions'] ||
					lieProps['Intl.ListFormat.resolvedOptions'] ||
					lieProps['Intl.NumberFormat.resolvedOptions'] ||
					lieProps['Intl.PluralRules.resolvedOptions'] ||
					lieProps['Intl.RelativeTimeFormat.resolvedOptions']
				) || false;
				const seasonLie = timezoneOffsetMeasured.lie ? { fingerprint: '', lies: [{ ['timezone seasons disagree']: true }] } : false;
				const localeLie = locale.lie ? { fingerprint: '', lies: [{ ['Intl locales mismatch']: true }] } : false;
				
				if (seasonLie) {
					lied = true;
					documentLie('Date', measuredTimezones, seasonLie);
				}
				if (localeLie) {
					lied = true;
					documentLie('Intl', locale, localeLie);	
				}
				const timezoneHistoryLocation = await hashify(timezoneOffsetUniqueYearHistory);
				const data =  {
					timezone,
					timezoneLocation,
					timezoneHistoryLocation,
					timezoneOffset,
					timezoneOffsetComputed,
					timezoneOffsetMeasured: measuredTimezones,
					timezoneOffsetHistory,
					matchingOffsets,
					relativeTime,
					locale,
					writingSystemKeys,
					lied
				};
				const $hash = await hashify(data);
				logTestResult({ test: 'timezone', passed: true });
				return resolve({...data, $hash })
			}
			catch (error) {
				logTestResult({ test: 'timezone', passed: false });
				captureError(error);
				return resolve()
			}
		})
	};

	const getVoices = imports => {

		const {
			require: {
				hashify,
				captureError,
				contentWindow,
				logTestResult
			}
		} = imports;
			
		return new Promise(async resolve => {
			try {
				const win = contentWindow ? contentWindow : window;
				let voices = [];
				const respond = async (resolve, voices) => {
					voices = voices.map(({ name, lang }) => ({ name, lang }));
					const check = {};
					check.microsoft = voices.filter(key => (/microsoft/i).test(key.name)).length;
					check.google = voices.filter(key => (/google/i).test(key.name)).length;
					check.chromeOS = voices.filter(key => (/chrome os/i).test(key.name)).length;
					check.android = voices.filter(key => (/android/i).test(key.name)).length;
					const $hash = await hashify(voices);
					logTestResult({ test: 'speech', passed: true });
					return resolve({ voices, ...check, $hash })
				};
				if (!('speechSynthesis' in win)) {
					logTestResult({ test: 'speech', passed: false });
					return resolve()
				}
				else if (!('chrome' in win)) {
					voices = await win.speechSynthesis.getVoices();
					return respond(resolve, voices)
				}
				else if (!win.speechSynthesis.getVoices || win.speechSynthesis.getVoices() == undefined) {
					logTestResult({ test: 'speech', passed: false });
					return resolve()
				}
				else if (win.speechSynthesis.getVoices().length) {
					voices = win.speechSynthesis.getVoices();
					return respond(resolve, voices)
				} else {
					win.speechSynthesis.onvoiceschanged = () => {
						voices = win.speechSynthesis.getVoices();
						return resolve(new Promise(resolve => respond(resolve, voices)))
					};
				}
			}
			catch (error) {
				logTestResult({ test: 'speech', passed: false });
				captureError(error);
				return resolve(undefined)
			}
		})
	};

	const getWebRTCData = (imports, cloudflare) => {

		const {
			require: {
				isFirefox,
				hashify,
				captureError,
				caniuse,
				contentWindow,
				logTestResult
			}
		} = imports;
		
		return new Promise(resolve => {
			try {
				let rtcPeerConnection;
				if (contentWindow && !isFirefox) { // FF throws an error in iframes
					rtcPeerConnection = (
						contentWindow.RTCPeerConnection ||
						contentWindow.webkitRTCPeerConnection ||
						contentWindow.mozRTCPeerConnection ||
						contentWindow.msRTCPeerConnection
					);
				}
				else {
					rtcPeerConnection = (
						window.RTCPeerConnection ||
						window.webkitRTCPeerConnection ||
						window.mozRTCPeerConnection ||
						window.msRTCPeerConnection
					);
				}
				
				if (!rtcPeerConnection) {
					logTestResult({ test: 'webrtc', passed: false });
					return resolve()
				}
				const connection = new rtcPeerConnection({
					iceServers: [{
						urls: ['stun:stun.l.google.com:19302?transport=udp']
					}]
				}, {
					optional: [{
						RtpDataChannels: true
					}]
				});
				
				let success = false;
				connection.onicecandidate = async e => { 
					const candidateEncoding = /((udp|tcp)\s)((\d|\w)+\s)((\d|\w|(\.|\:))+)(?=\s)/ig;
					const connectionLineEncoding = /(c=IN\s)(.+)\s/ig;
					if (!e.candidate) {
						return
					}
					const { candidate } = e.candidate;
					const encodingMatch = candidate.match(candidateEncoding);
					if (encodingMatch) {
						success = true;
						const {
							sdp
						} = e.target.localDescription;
						const ipAddress = caniuse(() => e.candidate.address);
						const candidateIpAddress = caniuse(() => encodingMatch[0].split(' ')[2]);
						const connectionLineIpAddress = caniuse(() => sdp.match(connectionLineEncoding)[0].trim().split(' ')[2]);
						const successIpAddresses = [
							ipAddress, 
							candidateIpAddress, 
							connectionLineIpAddress
						].filter(ip => ip != undefined);
						const setSize = new Set(successIpAddresses).size;
						const cloudflareIp = cloudflare && 'ip' in cloudflare ? cloudflare.ip : undefined;
						const data = {
							['webRTC leak']: cloudflareIp && (
								!!ipAddress && ipAddress != cloudflareIp
							) ? 'maybe' : 'unknown',
							['ip address']: ipAddress,
							candidate: candidateIpAddress,
							connection: connectionLineIpAddress
						};
						const $hash = await hashify(data);
						logTestResult({ test: 'webrtc', passed: true });
						return resolve({ ...data, $hash })
					} else {
						return
					}
				};
				
				setTimeout(() => {
					if (!success) {
						logTestResult({ test: 'webrtc', passed: false });
						captureError(new Error('RTCIceCandidate failed'));
						return resolve()
					}
				}, 1000);
				connection.createDataChannel('creep');
				connection.createOffer()
					.then(e => connection.setLocalDescription(e))
					.catch(error => console.log(error));
			}
			catch (error) {
				logTestResult({ test: 'webrtc', passed: false });
				captureError(error, 'RTCPeerConnection failed or blocked by client');
				return resolve()
			}
		})
	};

	const source = 'creepworker.js';

	const getDedicatedWorker = contentWindow => {
		return new Promise(resolve => {
			try {
				const worker = (
					contentWindow ? contentWindow.Worker : Worker
				);
				const dedicatedWorker = new worker(source);
				dedicatedWorker.onmessage = message => {
					dedicatedWorker.terminate();
					return resolve(message.data)
				};
			}
			catch(error) {
				return resolve()
			}
		})
	};

	const getSharedWorker = contentWindow => {
		return new Promise(resolve => {
			try {
				const worker = (
					contentWindow ? contentWindow.SharedWorker : SharedWorker
				);
				const sharedWorker = new worker(source);
				sharedWorker.port.start();
				sharedWorker.port.addEventListener('message', message => {
					sharedWorker.port.close();
					return resolve(message.data)
				});
			}
			catch(error) {
				console.error(error);
				return resolve()
			}
		})
	};

	const getServiceWorker = () => {
		return new Promise(async resolve => {
			try {
				navigator.serviceWorker.register(source).catch(error => {
					console.error(error);
					return resolve()
				});
				navigator.serviceWorker.ready.then(registration => {
					const broadcast = new BroadcastChannel('creep_service_primary');
					broadcast.onmessage = message => {
						registration.unregister();
						broadcast.close();
						return resolve(message.data)
					};
					return broadcast.postMessage({ type: 'fingerprint'})
				}).catch(error => {
					console.error(error);
					return resolve()
				});
			}
			catch(error) {
				console.error(error);
				return resolve()
			}
		})
	};

	const getBestWorkerScope = imports => {	
		const {
			require: {
				isFirefox,
				getOS,
				hashify,
				captureError,
				caniuse,
				contentWindow,
				getUserAgentPlatform,
				logTestResult
			}
		} = imports;
		return new Promise(async resolve => {
			try {
				let type = 'service'; // loads fast but is not available in frames
				let workerScope = await getServiceWorker()
					.catch(error => console.error(error.message));
				if (!workerScope) {
					type = 'shared'; // no support in Safari, iOS, and Chrome Android
					workerScope = await getSharedWorker(contentWindow)
					.catch(error => console.error(error.message));
				}
				if (!workerScope) {
					type = 'dedicated'; // simulators & extensions can spoof userAgent
					workerScope = await getDedicatedWorker(contentWindow)
					.catch(error => console.error(error.message));
				}
				if (workerScope) {
					const { canvas2d, timezoneHistoryLocation } = workerScope || {};
					workerScope.system = getOS(workerScope.userAgent);
					workerScope.device = getUserAgentPlatform({ userAgent: workerScope.userAgent });
					workerScope.canvas2d = { dataURI: canvas2d, $hash: await hashify(canvas2d) };
					workerScope.timezoneHistoryLocation = await hashify(timezoneHistoryLocation);
					workerScope.type = type;
					const $hash = await hashify(workerScope);
					logTestResult({ test: `${type} worker`, passed: true });
					return resolve({ ...workerScope, $hash })
				}
				return resolve()
				
			}
			catch (error) {
				logTestResult({ test: 'worker', passed: false });
				captureError(error, 'workers failed or blocked by client');
				return resolve()
			}
		})
	};

	const imports = {
		require: {
			// helpers
			isChrome,
			isBrave,
			isFirefox,
			getOS,
			decryptUserAgent,
			getUserAgentPlatform,
			logTestResult,
			// crypto
			instanceId,
			hashMini,
			hashify,
			// html
			patch,
			html,
			note,
			count,
			modal,
			// captureErrors
			captureError,
			attempt,
			caniuse,
			// trash
			sendToTrash,
			proxyBehavior,
			gibberish,
			trustInteger,
			// lies
			documentLie,
			lieProps: lieProps.getProps(),
			// collections
			errorsCaptured,
			trashBin,
			lieRecords,
			// nested contentWindow
			contentWindow,
			parentNest,
			hyperNestedIframeWindow
		}
	}
	// worker.js

	;(async imports => {
		
		const fingerprint = async () => {
			const timeStart = timer();
			const [
				cloudflareComputed,
				iframeContentWindowVersionComputed,
				htmlElementVersionComputed,
				cssStyleDeclarationVersionComputed,
				screenComputed,
				voicesComputed,
				mediaTypesComputed,
				canvas2dComputed,
				canvasBitmapRendererComputed,
				canvasWebglComputed,
				mathsComputed,
				consoleErrorsComputed,
				timezoneComputed,
				clientRectsComputed,
				offlineAudioContextComputed,
				fontsComputed
			] = await Promise.all([
				getCloudflare(imports),
				getIframeContentWindowVersion(imports),
				getHTMLElementVersion(imports),
				getCSSStyleDeclarationVersion(imports),
				getScreen(imports),
				getVoices(imports),
				getMediaTypes(imports),
				getCanvas2d(imports),
				getCanvasBitmapRenderer(imports),
				getCanvasWebgl(imports),
				getMaths(imports),
				getConsoleErrors(imports),
				getTimezone(imports),
				getClientRects(imports),
				getOfflineAudioContext(imports),
				getFonts(imports, [...fontList, ...notoFonts])
			]).catch(error => {
				console.error(error.message);
			});

			const [
				workerScopeComputed,
				mediaDevicesComputed,
				webRTCDataComputed
			] = await Promise.all([
				getBestWorkerScope(imports),
				getMediaDevices(imports),
				getWebRTCData(imports, cloudflareComputed)
			]).catch(error => {
				console.error(error.message);
			});

			const navigatorComputed = await getNavigator(imports, workerScopeComputed)
				.catch(error => console.error(error.message));

			const [
				liesComputed,
				trashComputed,
				capturedErrorsComputed
			] = await Promise.all([
				getLies(imports),
				getTrash(imports),
				getCapturedErrors(imports)
			]).catch(error => {
				console.error(error.message);
			});

			const timeEnd = timeStart();

			if (parentNest) {
				parentNest.remove();
			}

			const fingerprint = {
				workerScope: workerScopeComputed,
				cloudflare: cloudflareComputed,
				webRTC: webRTCDataComputed,
				navigator: navigatorComputed,
				iframeContentWindowVersion: iframeContentWindowVersionComputed,
				htmlElementVersion: htmlElementVersionComputed,
				cssStyleDeclarationVersion: cssStyleDeclarationVersionComputed,
				screen: screenComputed,
				voices: voicesComputed,
				mediaDevices: mediaDevicesComputed,
				mediaTypes: mediaTypesComputed,
				canvas2d: canvas2dComputed,
				canvasBitmapRenderer: canvasBitmapRendererComputed,
				canvasWebgl: canvasWebglComputed,
				maths: mathsComputed,
				consoleErrors: consoleErrorsComputed,
				timezone: timezoneComputed,
				clientRects: clientRectsComputed,
				offlineAudioContext: offlineAudioContextComputed,
				fonts: fontsComputed,
				lies: liesComputed,
				trash: trashComputed,
				capturedErrors: capturedErrorsComputed
			};
			return { fingerprint, timeEnd }
		};
		
		// fingerprint and render
		const { fingerprint: fp, timeEnd } = await fingerprint().catch(error => console.error(error));

		console.log('%c✔ loose fingerprint passed', 'color:#4cca9f');

		console.groupCollapsed('Loose Fingerprint');
		console.log(fp);
		console.groupEnd();

		console.groupCollapsed('Loose Fingerprint JSON');
		console.log('diff check at https://www.diffchecker.com/diff\n\n', JSON.stringify(fp, null, '\t'));
		console.groupEnd();
		
		// Trusted Fingerprint
		const distrust = { distrust: { brave: isBrave, firefox: isFirefox } };
		const trashLen = fp.trash.trashBin.length;
		const liesLen = !('data' in fp.lies) ? 0 : fp.lies.data.length;
		const errorsLen = fp.capturedErrors.data.length;
		const creep = {
			navigator: ( 
				!fp.navigator || fp.navigator.lied ? undefined : {
					device: fp.navigator.device,
					deviceMemory: isBrave ? distrust : fp.navigator.deviceMemory,
					doNotTrack: fp.navigator.doNotTrack,
					hardwareConcurrency: isBrave ? distrust : fp.navigator.hardwareConcurrency,
					maxTouchPoints: fp.navigator.maxTouchPoints,
					mimeTypes: fp.navigator.mimeTypes,
					plugins: isBrave ? distrust : fp.navigator.plugins,
					platform: fp.navigator.platform,
					system: fp.navigator.system,
					vendor: fp.navigator.vendor
				}
			),
			screen: ( 
				!fp.screen || fp.screen.lied || (!!liesLen && isFirefox) ? undefined : {
					height: fp.screen.height,
					width: fp.screen.width,
					pixelDepth: fp.screen.pixelDepth,
					colorDepth: fp.screen.colorDepth
				}
			),
			workerScope: fp.workerScope ? {
				canvas2d: (
					!!liesLen && (isBrave || isFirefox) ? distrust : 
					fp.workerScope.canvas2d
				),
				deviceMemory: (
					!!liesLen && isBrave ? distrust : 
					fp.workerScope.deviceMemory
				),
				hardwareConcurrency: (
					!!liesLen && isBrave ? distrust : 
					fp.workerScope.hardwareConcurrency
				),
				language: fp.workerScope.language,
				platform: fp.workerScope.platform,
				system: fp.workerScope.system,
				device: fp.workerScope.device,
				timezoneLocation: fp.workerScope.timezoneLocation,
				timezoneHistoryLocation: fp.workerScope.timezoneHistoryLocation,
				['webgl renderer']: (
					!!liesLen && isBrave ? distrust : 
					fp.workerScope.webglRenderer
				),
				['webgl vendor']: (
					!!liesLen && isBrave ? distrust : 
					fp.workerScope.webglVendor
				)
			} : undefined,
			mediaDevices: fp.mediaDevices,
			mediaTypes: fp.mediaTypes,
			canvas2d: ( 
				!fp.canvas2d || fp.canvas2d.lied ? undefined : 
				fp.canvas2d
			),
			canvasBitmapRenderer: (
				!fp.canvasBitmapRenderer || fp.canvasBitmapRenderer.lied ? undefined : 
				fp.canvasBitmapRenderer
			),
			canvasWebgl: (
				!!fp.canvasWebgl && !!liesLen && isBrave ? {
					specs: {
						webgl2Specs: attempt(() => {
							const { webgl2Specs } = fp.canvasWebgl.specs || {};
							const clone = {...webgl2Specs};
							const blocked = /vertex|fragment|varying|bindings|combined|interleaved/i;
							Object.keys(clone || {}).forEach(key => blocked.test(key) && (delete clone[key]));
							return clone
						}) || fp.canvasWebgl.specs.webgl2Specs,
						webglSpecs: attempt(() => {
							const { webglSpecs } = fp.canvasWebgl.specs || {};
							const clone = {...webglSpecs};
							const blocked = /vertex|fragment/i;
							Object.keys(clone || {}).forEach(key => blocked.test(key) && (delete clone[key]));
							return clone
						}) || fp.canvasWebgl.specs.webglSpecs
					}
				}
				: !!fp.canvasWebgl && !!liesLen && isFirefox ? {
					supported: fp.canvasWebgl.supported,
					supported2: fp.canvasWebgl.supported2,
					specs: fp.canvasWebgl.specs
				}
				: !fp.canvasWebgl || fp.canvasWebgl.lied ? undefined : {
					supported: fp.canvasWebgl.supported,
					supported2: fp.canvasWebgl.supported2,
					dataURI: fp.canvasWebgl.dataURI,
					dataURI2: fp.canvasWebgl.dataURI2,
					matchingDataURI: fp.canvasWebgl.matchingDataURI,
					matchingUnmasked: fp.canvasWebgl.matchingUnmasked,
					specs: fp.canvasWebgl.specs,
					unmasked: fp.canvasWebgl.unmasked,
					unmasked2: fp.canvasWebgl.unmasked2
				}
			),
			maths: !fp.maths || fp.maths.lied ? undefined : fp.maths,
			consoleErrors: fp.consoleErrors,
			// avoid random timezone fingerprint values
			timezone: !fp.timezone || fp.timezone.lied ? undefined : {
				timezone: fp.timezone.timezone,
				timezoneLocation: fp.timezone.timezoneLocation,
				timezoneHistoryLocation: fp.timezone.timezoneHistoryLocation,
				timezoneOffsetHistory: fp.timezone.timezoneOffsetHistory,
				relativeTime: fp.timezone.relativeTime,
				locale: fp.timezone.locale,
				writingSystemKeys: fp.timezone.writingSystemKeys,
				lied: fp.timezone.lied
			},
			clientRects: !fp.clientRects || fp.clientRects.lied ? undefined : fp.clientRects,
			offlineAudioContext: (
				!!liesLen && isBrave ? fp.offlineAudioContext.values :
				!fp.offlineAudioContext || fp.offlineAudioContext.lied ? undefined :
				fp.offlineAudioContext
			),
			fonts: fp.fonts,
			// skip trash since it is random
			lies: !('data' in fp.lies) ? false : !!liesLen,
			capturedErrors: !!errorsLen,
			voices: isFirefox ? distrust : fp.voices // Firefox is inconsistent
		};

		console.log('%c✔ stable fingerprint passed', 'color:#4cca9f');

		console.groupCollapsed('Stable Fingerprint');
		console.log(creep);
		console.groupEnd();

		console.groupCollapsed('Stable Fingerprint JSON');
		console.log('diff check at https://www.diffchecker.com/diff\n\n', JSON.stringify(creep, null, '\t'));
		console.groupEnd();

		// get/post request
		const webapp = 'https://creepjs-6bd8e.web.app/fingerprint';

		const [fpHash, creepHash] = await Promise.all([hashify(fp), hashify(creep)])
		.catch(error => { 
			console.error(error.message);
		});
		
		const hasTrash = !!trashLen;
		const { lies: hasLied, capturedErrors: hasErrors } = creep;

		// patch dom
		const {
			require: {
				instanceId,
				hashMini,
				patch,
				html,
				note,
				count,
				modal,
				caniuse
			}
		} = imports;
		
		const el = document.getElementById('fingerprint-data');
		patch(el, html`
	<div id="fingerprint-data">
		<div class="fingerprint-header-container">
			<div class="fingerprint-header">
				<strong>Your ID:</strong><span class="trusted-fingerprint ellipsis main-hash">${hashMini(creepHash)}</span>
				<div class="ellipsis"><span class="time">${timeEnd.toFixed(2)} ms</span></div>
			</div>
		</div>
		<div id="creep-browser" class="visitor-info">
			<div class="flex-grid">
				<div class="col-six">
					<strong id="loader">Loading...</strong>
					<div>trust score: <span class="blurred">100%</span></div>
					<div>visits: <span class="blurred">1</span></div>
					<div>first: <span class="blurred">##/##/####, 00:00:00 AM</span></div>
					<div>last: <span class="blurred">##/##/####, 00:00:00 AM</span></div>
					<div>persistence: <span class="blurred">0.0 hours/span></div>
				</div>
				<div class="col-six">
					<div>has trash: <span class="blurred">false</span></div>
					<div>has lied: <span class="blurred">false</span></div>
					<div>has errors: <span class="blurred">false</span></div>
					<div>loose fingerprint: <span class="blurred">00000000</span></div>
					<div>loose count: <span class="blurred">1</span></div>
					<div>bot: <span class="blurred">false</span></div>
				</div>
			</div>
			<div id="signature">
			</div>
		</div>
		<div class="flex-grid">
			${(() => {
				const { trash: { trashBin, $hash } } = fp;
				const trashLen = trashBin.length;
				return `
				<div class="col-four${trashLen ? ' trash': ''}">
					<strong>Trash</strong>${
						trashLen ? `<span class="hash">${hashMini($hash)}</span>` : ''
					}
					<div>gathered (${!trashLen ? '0' : ''+trashLen }): ${
						trashLen ? modal(
							'creep-trash',
							trashBin.map((trash,i) => `${i+1}: ${trash.name}: ${trash.value}`).join('<br>')
						) : ''
					}</div>
				</div>`
			})()}
			${(() => {
				const { lies: { data, totalLies, $hash } } = fp; 
				const toJSONFormat = obj => JSON.stringify(obj, null, '\t');
				const sanitize = str => str.replace(/\</g, '&lt;');
				return `
				<div class="col-four${totalLies ? ' lies': ''}">
					<strong>Lies</strong>${totalLies ? `<span class="hash">${hashMini($hash)}</span>` : ''}
					<div>unmasked (${!totalLies ? '0' : ''+totalLies }): ${
						totalLies ? modal('creep-lies', Object.keys(data).map(key => {
							const { name, lieTypes: { lies, fingerprint } } = data[key];
							const lieFingerprint = !!fingerprint ? { hash: hashMini(fingerprint), json: sanitize(toJSONFormat(fingerprint)) } : undefined;
							return `
							<div style="padding:5px">
								<strong>${name}</strong>:
								${lies.length ? lies.map(lie => `<br>${Object.keys(lie)[0]}`).join(''): ''}
								${
									lieFingerprint ? `
										<br>Tampering code leaked a fingerprint: ${lieFingerprint.hash}
										<br>Unexpected code: ${lieFingerprint.json}`: 
									''
								}
							</div>
							`
						}).join('')) : ''
					}</div>
				</div>`
			})()}
			${(() => {
				const { capturedErrors: { data, $hash } } = fp;
				const len = data.length;
				return `
				<div class="col-four${len ? ' errors': ''}">
					<strong>Errors</strong>${len ? `<span class="hash">${hashMini($hash)}</span>` : ''}
					<div>captured (${!len ? '0' : ''+len}): ${
						len ? modal('creep-captured-errors', Object.keys(data).map((key, i) => `${i+1}: ${data[key].trustedName} - ${data[key].trustedMessage} `).join('<br>')) : ''
					}</div>
				</div>
				`
			})()}
		</div>
		<div class="flex-grid">
			${!fp.cloudflare ?
				`<div class="col-six">
					<strong>Cloudflare</strong>
					<div>ip address: ${note.blocked}</div>
					<div>system: ${note.blocked}</div>
					<div>ip location: ${note.blocked}</div>
					<div>tls version: ${note.blocked}</div>
				</div>` :
			(() => {
				const { cloudflare: { ip, uag, loc, tls, $hash } } = fp;
				return `
				<div class="col-six">
					<strong>Cloudflare</strong><span class="hash">${hashMini($hash)}</span>
					<div>ip address: ${ip ? ip : note.blocked}</div>
					<div>system: ${uag ? uag : note.blocked}</div>
					<div>ip location: ${loc ? loc : note.blocked}</div>
					<div>tls version: ${tls ? tls : note.blocked}</div>
				</div>
				`
			})()}
			${!fp.webRTC ?
				`<div class="col-six">
					<strong>WebRTC</strong>
					<div>webRTC leak: ${note.blocked}</div>
					<div>ip address: ${note.blocked}</div>
					<div>candidate: ${note.blocked}</div>
					<div>connection: ${note.blocked}</div>
				</div>` :
			(() => {
				const { webRTC } = fp;
				const { candidate, connection, $hash } = webRTC;
				const ip = webRTC['ip address'];
				const leak = webRTC['webRTC leak'];
				return `
				<div class="col-six">
					<strong>WebRTC</strong><span class="hash">${hashMini($hash)}</span>
					<div>webRTC leak: ${leak}</div>
					<div>ip address: ${ip ? ip : note.blocked}</div>
					<div>candidate: ${candidate ? candidate : note.blocked}</div>
					<div>connection: ${connection ? connection : note.blocked}</div>
				</div>
				`
			})()}			
		</div>
		<div id="browser-detection" class="flex-grid">
			<div class="col-eight">
				<strong>Loading...</strong>
				<div>client user agent:</div>
				<div>window object:</div>
				<div>system styles:</div>
				<div>computed styles:</div>
				<div>html element:</div>
				<div>js runtime (math):</div>
				<div>js engine (error):</div>
			</div>
			<div class="col-four icon-container">
			</div>
		</div>
		<div class="flex-grid relative">
		<div class="ellipsis"><span class="aside-note">${
			fp.workerScope && fp.workerScope.type ? fp.workerScope.type : ''
		} worker</span></div>
		${!fp.workerScope ?
			`<div class="col-six">
				<strong>Worker</strong>
				<div>timezone offset: ${note.blocked}</div>
				<div>location: ${note.blocked}</div>
				<div>offset location: ${note.blocked}</div>
				<div>language: ${note.blocked}</div>
				<div>deviceMemory: ${note.blocked}</div>
				<div>hardwareConcurrency: ${note.blocked}</div>
				<div>js runtime: ${note.blocked}</div>
				<div>platform: ${note.blocked}</div>
				<div>system: ${note.blocked}</div>
				<div>canvas 2d: ${note.blocked}</div>
				<div>webgl vendor: ${note.blocked}</div>
			</div>
			<div class="col-six">
				<div>device:</div>
				<div class="block-text">${note.blocked}</div>
				<div>userAgent:</div>
				<div class="block-text">${note.blocked}</div>
				<div>webgl renderer:</div>
				<div class="block-text">${note.blocked}</div>
			</div>` :
		(() => {
			const { workerScope: data } = fp;
			return `
			<div class="col-six">
				<strong>Worker</strong><span class="hash">${hashMini(data.$hash)}</span>
				<div>timezone offset: ${data.timezoneOffset != undefined ? ''+data.timezoneOffset : note.unsupported}</div>
				<div>location: ${data.timezoneLocation}</div>
				<div>offset location:<span class="sub-hash">${hashMini(data.timezoneHistoryLocation)}</span></div>
				<div>language: ${data.language || note.unsupported}</div>
				<div>deviceMemory: ${data.deviceMemory || note.unsupported}</div>
				<div>hardwareConcurrency: ${data.hardwareConcurrency || note.unsupported}</div>
				<div>js runtime: ${data.jsImplementation}</div>
				<div>platform: ${data.platform || note.unsupported}</div>
				<div>system: ${data.system || note.unsupported}${
					/android/i.test(data.system) && !/arm/i.test(data.platform) && /linux/i.test(data.platform) ?
					' [emulator]' : ''
				}</div>
				<div>canvas 2d:${
					data.canvas2d && data.canvas2d.dataURI ?
					`<span class="sub-hash">${hashMini(data.canvas2d.$hash)}</span>` :
					` ${note.unsupported}`
				}</div>
				<div>webgl vendor: ${data.webglVendor || note.unsupported}</div>
			</div>
			<div class="col-six">
				<div>device:</div>
				<div class="block-text">
					<div>${data.device || note.unsupported}</div>
				</div>
				<div>userAgent:</div>
				<div class="block-text">
					<div>${data.userAgent || note.unsupported}</div>
				</div>
				<div>webgl renderer:</div>
				<div class="block-text">
					<div>${data.webglRenderer || note.unsupported}</div>
				</div>
			</div>
			`
		})()}
		</div>
		<div class="flex-grid">
		${!fp.canvasWebgl ?
			`<div class="col-six">
				<strong>Canvas webgl</strong>
				<div>matching renderer/vendor: ${note.blocked}</div>
				<div>matching data URI: ${note.blocked}</div>
				<div>webgl: ${note.blocked}</div>
				<div>parameters (0): ${note.blocked}</div>
				<div>extensions (0): ${note.blocked}</div>
				<div>vendor: ${note.blocked}</div>
				<div>renderer: ${note.blocked}</div>
				<div class="block-text">${note.blocked}</div>
			</div>
			<div class="col-six">
				<div>webgl2: ${note.blocked}</div>
				<div>parameters (0): ${note.blocked}</div>
				<div>extensions (0): ${note.blocked}</div>
				<div>vendor: ${note.blocked}</div>
				<div>renderer: ${note.blocked}</div>
				<div class="block-text">${note.blocked}</div>
			</div>` :
		(() => {
			const { canvasWebgl: data } = fp;
			const id = 'creep-canvas-webgl';
			const {
				$hash,
				dataURI,
				dataURI2,
				lied,
				matchingDataURI,
				matchingUnmasked,
				specs: { webglSpecs, webgl2Specs },
				supported,
				supported2,
				unmasked,
				unmasked2
			} = data;
			const webglSpecsKeys = webglSpecs ? Object.keys(webglSpecs) : [];
			const webgl2SpecsKeys = webgl2Specs ? Object.keys(webgl2Specs) : [];
			return `
			<div class="col-six">
				<strong>Canvas webgl</strong><span class="${lied ? 'lies ' : ''}hash">${hashMini($hash)}</span>
				<div>matching renderer/vendor: ${''+matchingUnmasked}</div>
				<div>matching data URI: ${''+matchingDataURI}</div>
				<div>webgl:<span class="sub-hash">${hashMini(dataURI.$hash)}</span></div>
				<div>parameters (${count(webglSpecsKeys)}): ${
					!webglSpecsKeys.length ? note.unsupported :
					modal(`${id}-p-v1`, webglSpecsKeys.map(key => `${key}: ${webglSpecs[key]}`).join('<br>'))
				}</div>
				<div>extensions (${count(supported.extensions)}): ${
					!caniuse(() => supported, ['extensions', 'length']) ? note.unsupported : modal(`${id}-e-v1`, supported.extensions.join('<br>'))
				}</div>
				<div>vendor: ${!unmasked.vendor ? note.unsupported : unmasked.vendor}</div>
				<div>renderer:</div>
				<div class="block-text">
					<div>${!unmasked.renderer ? note.unsupported : unmasked.renderer}</div>	
				</div>
			</div>
			<div class="col-six">
				<div>webgl2:<span class="sub-hash">${hashMini(dataURI2.$hash)}</span></div>
				<div>parameters (${count(webgl2SpecsKeys)}): ${
					!webgl2SpecsKeys.length ? note.unsupported :
					modal(`${id}-p-v2`, webgl2SpecsKeys.map(key => `${key}: ${webgl2Specs[key]}`).join('<br>'))
				}</div>
				<div>extensions (${count(supported2.extensions)}): ${
					!caniuse(() => supported2, ['extensions', 'length']) ? note.unsupported : modal(`${id}-e-v2`, supported2.extensions.join('<br>'))
				}</div>
				<div>vendor: ${!unmasked2.vendor ? note.unsupported : unmasked2.vendor }</div>
				<div>renderer:</div>
				<div class="block-text">
					<div>${!unmasked2.renderer ? note.unsupported : unmasked2.renderer}</div>	
				</div>
			</div>
			`
		})()}
		</div>
		<div class="flex-grid">
		${!fp.canvas2d ?
			`<div class="col-six">
				<strong>Canvas 2d</strong> <span>${note.blocked}</span>
			</div>` :
		(() => {
			const { canvas2d: { lied, $hash } } = fp;
			return `
			<div class="col-six">
				<strong>Canvas 2d</strong><span class="${lied ? 'lies ' : ''}hash">${hashMini($hash)}</span>
			</div>
			`
		})()}
		${!fp.canvasBitmapRenderer ?
			`<div class="col-six">
				<strong>Canvas bitmaprenderer</strong> <span>${note.blocked}</span>
			</div>` :
		(() => {
			const { canvasBitmapRenderer: { lied, $hash } } = fp;
			return `
			<div class="col-six">
				<strong>Canvas bitmaprenderer</strong><span class="${lied ? 'lies ' : ''}hash">${hashMini($hash)}</span>
			</div>
			`
		})()}
		</div>
		<div class="flex-grid">
		${!fp.offlineAudioContext ?
			`<div class="col-six">
				<strong>Audio</strong>
				<div>sample: ${note.blocked}</div>
				<div>copy: ${note.blocked}</div>
				<div>matching: ${note.blocked}</div>
				<div>node values: ${note.blocked}</div>
			</div>` :
		(() => {
			const {
				offlineAudioContext: {
					$hash,
					binsSample,
					copySample,
					lied,
					matching,
					values
				}
			} = fp;
			return `
			<div class="col-six">
				<strong>Audio</strong><span class="${lied ? 'lies ' : ''}hash">${hashMini($hash)}</span>
				<div>sample: ${binsSample[0]}</div>
				<div>copy: ${''+copySample[0] == 'undefined' ? note.unsupported : copySample[0]}</div>
				<div>matching: ${matching}</div>
				<div>node values: ${
					modal('creep-offline-audio-context', Object.keys(values).map(key => `<div>${key}: ${values[key]}</div>`).join(''))
				}</div>
			</div>
			`
		})()}
		${!fp.voices ?
			`<div class="col-six">
				<strong>Speech</strong>
				<div>microsoft: ${note.blocked}</div>
				<div>google: ${note.blocked}</div>
				<div>chrome OS: ${note.blocked}</div>
				<div>android: ${note.blocked}</div>
				<div>voices (0): ${note.blocked}</div>
			</div>` :
		(() => {
			const {
				voices: {
					$hash,
					android,
					chromeOS,
					google,
					microsoft,
					voices
				}
			} = fp;
			const voiceList = voices.map(voice => `${voice.name} (${voice.lang})`);
			return `
			<div class="col-six">
				<strong>Speech</strong><span class="hash">${hashMini($hash)}</span>
				<div>microsoft: ${''+microsoft}</div>
				<div>google: ${''+google}</div>
				<div>chrome OS: ${''+chromeOS}</div>
				<div>android: ${''+android}</div>
				<div>voices (${count(voices)}): ${voiceList && voiceList.length ? modal('creep-voices', voiceList.join('<br>')) : note.unsupported}</div>
			</div>
			`
		})()}
		</div>
		<div class="flex-grid">
		${!fp.mediaTypes ?
			`<div class="col-six">
				<strong>Media Types</strong>
				<div>results: ${note.blocked}</div>
			</div>` :
		(() => {
			const {
				mediaTypes: {
					$hash,
					mediaTypes
				} 
			} = fp;
			const header = `<div>
			<br>Audio play type [AP]
			<br>Video play type [VP]
			<br>Media Source support [MS]
			<br>Media Recorder support [MR]
			<br><br>[PR]=Probably, [MB]=Maybe, [TR]=True, [--]=False/""
			<br>[AP][VP][MS][MR]</div>`;
			const results = mediaTypes.map(type => {
				const { mimeType, audioPlayType, videoPlayType, mediaSource, mediaRecorder } = type;
				return `${audioPlayType == 'probably' ? '[PB]' : audioPlayType == 'maybe' ? '[MB]': '[--]'}${videoPlayType == 'probably' ? '[PB]' : videoPlayType == 'maybe' ? '[MB]': '[--]'}${mediaSource ? '[TR]' : '[--]'}${mediaRecorder ? '[TR]' : '[--]'}: ${mimeType}
				`
			});
			return `
			<div class="col-six" id="creep-media-types">
				<strong>Media Types</strong><span class="hash">${hashMini($hash)}</span>
				<div>results: ${
					modal('creep-media-types', header+results.join('<br>'))
				}</div>
			</div>
			`
		})()}
		${!fp.mediaDevices ?
			`<div class="col-six">
				<strong>Media Devices</strong>
				<div>devices (0): ${note.blocked}</div>
			</div>` :
		(() => {
			const {
				mediaDevices: {
					$hash,
					mediaDevices
				}
			} = fp;
			return `
			<div class="col-six">
				<strong>Media Devices</strong><span class="hash">${hashMini($hash)}</span>
				<div>devices (${count(mediaDevices)}):${mediaDevices && mediaDevices.length ? modal('creep-media-devices', mediaDevices.map(device => device.kind).join('<br>')) : note.blocked}</div>
			</div>
			`
		})()}
		</div>
		<div class="flex-grid">
		${!fp.clientRects ?
			`<div class="col-six">
				<strong>DOMRect</strong>
				<div>elements: ${note.blocked}</div>
				<div>results: ${note.blocked}</div>
				<div>emojis v13.0: ${note.blocked}</div>
				<div>results: ${note.blocked}</div>
			</div>` :
		(() => {
			const {
				clientRects: {
					$hash,
					clientHash,
					clientRects,
					emojiHash,
					emojiRects,
					lied
				}
			} = fp;
			const id = 'creep-client-rects';
			return `
			<div class="col-six">
				<strong>DOMRect</strong><span class="${lied ? 'lies ' : ''}hash">${hashMini($hash)}</span>
				<div>elements:<span class="sub-hash">${hashMini(clientHash)}</span></div>
				<div>results: ${
					modal(`${id}-elements`, clientRects.map(domRect => Object.keys(domRect).map(key => `<div>${key}: ${domRect[key]}</div>`).join('')).join('<br>') )
				}</div>
				<div>emojis v13.0:<span class="sub-hash">${hashMini(emojiHash)}</span></div>
				<div>results: ${
					modal(`${id}-emojis`, emojiRects.map(rect => rect.emoji).join('') )
				}</div>
			</div>
			`
		})()}
		${!fp.fonts ?
			`<div class="col-six">
				<strong>Fonts</strong>
				<div>results (0): ${note.blocked}</div>
			</div>` :
		(() => {
			const {
				fonts: {
					$hash,
					fonts,
				}
			} = fp;
			return `
			<div class="col-six">
				<strong>Fonts</strong><span class="hash">${hashMini($hash)}</span>
				<div>results (${count(fonts)}): ${fonts && fonts.length ? modal('creep-fonts', fonts.join('<br>')) : note.blocked}</div>
			</div>
			`
		})()}
		</div>
		<div class="flex-grid">
		${!fp.timezone ?
			`<div class="col-six">
				<strong>Timezone</strong>
				<div>zone: ${note.blocked}</div>
				<div>offset: ${note.blocked}</div>
				<div>offset computed: ${note.blocked}</div>
				<div>matching offsets: ${note.blocked}</div>
				<div>seasonal offsets: ${note.blocked}</div>	
			</div>
			<div class="col-six">
				<div>location: ${note.blocked}</div>
				<div>offset location: ${note.blocked}</div>
				<div>offset history: ${note.blocked}</div>
				<div>relativeTimeFormat: ${note.blocked}</div>
				<div>locale language: ${note.blocked}</div>
				<div>writing system keys: ${note.blocked}</div>
			</div>` :
		(() => {
			const {
				timezone: {
					$hash,
					timezone,
					timezoneLocation,
					timezoneHistoryLocation,
					timezoneOffset: timezoneOffset,
					timezoneOffsetComputed,
					timezoneOffsetMeasured: measuredTimezones,
					timezoneOffsetHistory,
					matchingOffsets,
					relativeTime,
					locale,
					writingSystemKeys,
					lied
				}
			} = fp;
			const id = 'creep-timezone';
			return `
			<div class="col-six">
				<strong>Timezone</strong><span class="${lied ? 'lies ' : ''}hash">${hashMini($hash)}</span>
				<div>zone: ${timezone}</div>
				<div>offset: ${''+timezoneOffset}</div>
				<div>offset computed: ${''+timezoneOffsetComputed}</div>
				<div>matching offsets: ${''+matchingOffsets}</div>
				<div>seasonal offsets: ${measuredTimezones}</div>
			</div>
			<div class="col-six">
				<div>location: ${timezoneLocation}</div>
				<div>offset location:<span class="sub-hash">${hashMini(timezoneHistoryLocation)}</span></div>
				<div>offset history: ${
					modal(`${id}-timezone-offset-history`, `
						&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<strong>Jan</strong>&nbsp;&nbsp;&nbsp;<strong>Apr</strong>&nbsp;&nbsp;&nbsp;<strong>Jul</strong>&nbsp;&nbsp;&nbsp;<strong>Oct</strong><br>`+Object.keys(timezoneOffsetHistory).map(year => {
						const baseYear = timezoneOffsetHistory[1950];
						const seasons = timezoneOffsetHistory[year];
						const jan = seasons[0];
						const apr = seasons[1];
						const jul = seasons[2];
						const oct = seasons[3];
						const style = `color: #2da568;background:#2da5681f;`;
						return `
							<strong>${year}</strong>: 
							<span style="${baseYear[0] != jan ? style : ''}">${jan}</span> | 
							<span style="${baseYear[1] != apr ? style : ''}">${apr}</span> | 
							<span style="${baseYear[2] != jul ? style : ''}">${jul}</span> | 
							<span style="${baseYear[3] != oct ? style : ''}">${oct}</span>
						`
					}).join('<br>'))
				}</div>
				<div>relativeTimeFormat: ${
					!relativeTime ? note.unsupported : 
					modal(`${id}-relative-time-format`, Object.keys(relativeTime).sort().map(key => `${key} => ${relativeTime[key]}`).join('<br>'))
				}</div>
				<div>locale language: ${locale.lang.join(', ')}</div>
				<div>writing system keys: ${
					!writingSystemKeys ? note.unsupported :
					modal(`${id}-writing-system-keys`, writingSystemKeys.map(systemKey => {
						const key = Object.keys(systemKey)[0];
						const value = systemKey[key];
						const style = `
							background: #f6f6f6;
							border-radius: 2px;
							padding: 0px 5px;
						`;
						return `${key}: <span style="${style}">${value}</span>`
					}).join('<br>'))
				}</div>
			</div>
			`
		})()}
		</div>
		<div class="flex-grid">
		${!fp.screen ?
			`<div class="col-six">
				<strong>Screen</strong>
				<div>device: ${note.blocked}</div>
				<div>width: ${note.blocked}</div>
				<div>outerWidth: ${note.blocked}</div>
				<div>availWidth: ${note.blocked}</div>
				<div>height: ${note.blocked}</div>
				<div>outerHeight: ${note.blocked}</div>
				<div>availHeight: ${note.blocked}</div>
				<div>colorDepth: ${note.blocked}</div>
				<div>pixelDepth: ${note.blocked}</div>
			</div>
			<div class="col-six screen-container">
			</div>` :
		(() => {
			const {
				screen: data
			} = fp;
			const {
				device,
				width,
				outerWidth,
				availWidth,
				height,
				outerHeight,
				availHeight,
				colorDepth,
				pixelDepth,
				$hash,
				lied
			} = data;
			const getDeviceDimensions = (width, height, diameter = 180) => {
				const aspectRatio = width / height;
				const isPortrait = height > width;
				const deviceHeight = isPortrait ? diameter : diameter / aspectRatio;
				const deviceWidth = isPortrait ? diameter * aspectRatio : diameter;
				return { deviceHeight, deviceWidth }
			};
			const { deviceHeight, deviceWidth } = getDeviceDimensions(width, height);
			return `
			<div class="col-six">
				<strong>Screen</strong><span class="${lied ? 'lies ' : ''}hash">${hashMini($hash)}</span>
				<div>device: ${device ? device : note.blocked}</div>
				<div>width: ${width ? width : note.blocked}</div>
				<div>outerWidth: ${outerWidth ? outerWidth : note.blocked}</div>
				<div>availWidth: ${availWidth ? availWidth : note.blocked}</div>
				<div>height: ${height ? height : note.blocked}</div>
				<div>outerHeight: ${outerHeight ? outerHeight : note.blocked}</div>
				<div>availHeight: ${availHeight ? availHeight : note.blocked}</div>
				<div>colorDepth: ${colorDepth ? colorDepth : note.blocked}</div>
				<div>pixelDepth: ${pixelDepth ? pixelDepth : note.blocked}</div>
			</div>
			<div class="col-six screen-container">
				<div class="screen-frame" style="width:${deviceWidth}px;height:${deviceHeight}px;">
					<div class="screen-glass"></div>
				</div>
			</div>
			`
		})()}
		</div>
		<div class="flex-grid">
		${!fp.cssStyleDeclarationVersion ?
			`<div class="col-six">
				<strong>Computed Style</strong>
				<div>engine: ${note.blocked}</div>
				<div>prototype: ${note.blocked}</div>
				<div>getComputedStyle: ${note.blocked}</div>
				<div>HTMLElement.style: ${note.blocked}</div>
				<div>CSSRuleList.style: ${note.blocked}</div>
				<div>matching: ${note.blocked}</div>
			</div>
			<div class="col-six">
				<div>keys: ${note.blocked}</div>
				<div>moz: ${note.blocked}</div>
				<div>webkit: ${note.blocked}</div>
				<div>apple: ${note.blocked}</div>
				<div>system styles: ${note.blocked}</div>
				<div>system styles rendered: ${note.blocked}</div>
			</div>` :
		(() => {
			const {
				cssStyleDeclarationVersion: data
			} = fp;
			const {
				$hash,
				getComputedStyle: computedStyle,
				matching,
				system
			} = data;
			const cssRuleListstyle = data['CSSRuleList.style'];
			const htmlElementStyle = data['HTMLElement.style'];
			const id = 'creep-css-style-declaration-version';
			const { prototypeName } = htmlElementStyle;
			return `
			<div class="col-six">
				<strong>Computed Style</strong><span class="hash">${hashMini($hash)}</span>
				<div>engine: ${
					prototypeName == 'CSS2Properties' ? 'Gecko' :
					prototypeName == 'CSS2PropertiesPrototype' ? 'Gecko (like Goanna)' :
					prototypeName == 'MSCSSPropertiesPrototype' ? 'Trident' :
					prototypeName == 'CSSStyleDeclaration' ? 'Blink' :
					prototypeName == 'CSSStyleDeclarationPrototype' ? 'Webkit' :
					'unknown'
				}</div>
				<div>prototype: ${prototypeName}</div>
				${
					Object.keys(data).map(key => {
						const value = data[key];
						return (
							key != 'matching' && key != 'system' && key != '$hash' ?
							`<div>${key}:${
								value ? `<span class="sub-hash">${hashMini(value.$hash)}</span>` : ` ${note.blocked}`
							}</div>` : 
							''
						)
					}).join('')
				}
				<div>matching: ${''+matching}</div>
			</div>
			<div class="col-six">
				<div>keys: ${computedStyle.keys.length}, ${htmlElementStyle.keys.length}, ${cssRuleListstyle.keys.length}
				</div>
				<div>moz: ${''+computedStyle.moz}, ${''+htmlElementStyle.moz}, ${''+cssRuleListstyle.moz}
				</div>
				<div>webkit: ${''+computedStyle.webkit}, ${''+htmlElementStyle.webkit}, ${''+cssRuleListstyle.webkit}
				</div>
				<div>apple: ${''+computedStyle.apple}, ${''+htmlElementStyle.apple}, ${''+cssRuleListstyle.apple}
				</div>
				<div>system styles:<span class="sub-hash">${hashMini(system.$hash)}</span></div>
				<div>system styles rendered: ${
					system && system.colors ? modal(
						`${id}-system-styles`,
						[
							...system.colors.map(color => {
								const key = Object.keys(color)[0];
								const val = color[key];
								return `
									<div><span style="display:inline-block;border:1px solid #eee;border-radius:3px;width:12px;height:12px;background:${val}"></span> ${key}: ${val}</div>
								`
							}),
							...system.fonts.map(font => {
								const key = Object.keys(font)[0];
								const val = font[key];
								return `
									<div>${key}: <span style="border:1px solid #eee;background:#f9f9f9;padding:0 5px;border-radius:3px;font:${val}">${val}</span></div>
								`
							}),
						].join('')
					) : note.blocked
				}</div>
			</div>
			`
		})()}
		</div>
		<div>
			<div class="flex-grid">
			${!fp.maths ?
				`<div class="col-six">
					<strong>Math</strong>
					<div>results: ${note.blocked}</div>
				</div>` :
			(() => {
				const {
					maths: {
						data,
						$hash,
						lied
					}
				} = fp;
				const id = 'creep-maths';
				const header = `<div>Match to Win10 64bit Chromium > Firefox > Tor Browser > Mac10 Safari<br>[CR][FF][TB][SF]</div>`;
				const results = Object.keys(data).map(key => {
					const value = data[key];
					const { result, chrome, firefox, torBrowser, safari } = value;
					return `${chrome ? '[CR]' : '[--]'}${firefox ? '[FF]' : '[--]'}${torBrowser ? '[TB]' : '[--]'}${safari ? '[SF]' : '[--]'} ${key} => ${result}`
				});
				return `
				<div class="col-six">
					<strong>Math</strong><span class="${lied ? 'lies ' : ''}hash">${hashMini($hash)}</span>
					<div>results: ${modal(id, header+results.join('<br>'))}</div>
				</div>
				`
			})()}
			${!fp.consoleErrors ?
				`<div class="col-six">
					<strong>Error</strong>
					<div>results: ${note.blocked}</div>
				</div>` :
			(() => {
				const {
					consoleErrors: {
						$hash,
						errors
					}
				} = fp;
				const results = Object.keys(errors).map(key => {
					const value = errors[key];
					return `${+key+1}: ${value}`
				});
				return `
				<div class="col-six">
					<strong>Error</strong><span class="hash">${hashMini($hash)}</span>
					<div>results: ${modal('creep-console-errors', results.join('<br>'))}</div>
				</div>
				`
			})()}
			</div>
			<div class="flex-grid">
			${!fp.iframeContentWindowVersion ?
				`<div class="col-six">
					<strong>Window</strong>
					<div>keys (0): ${note.blocked}</div>
					<div>moz: ${note.blocked}</div>
					<div>webkit: ${note.blocked}</div>
					<div>apple: ${note.blocked}</div>
				</div>` :
			(() => {
				const {
					iframeContentWindowVersion: {
						$hash,
						apple,
						keys,
						moz,
						webkit
					}
				} = fp;
				return `
				<div class="col-six">
					<strong>Window</strong><span class="hash">${hashMini($hash)}</span>
					<div>keys (${count(keys)}): ${keys && keys.length ? modal('creep-iframe-content-window-version', keys.join(', ')) : note.blocked}</div>
					<div>moz: ${''+moz}</div>
					<div>webkit: ${''+webkit}</div>
					<div>apple: ${''+apple}</div>
				</div>
				`
			})()}
			${!fp.htmlElementVersion ?
				`<div class="col-six">
					<strong>HTMLElement</strong>
					<div>keys (0): ${note.blocked}</div>
				</div>` :
			(() => {
				const {
					htmlElementVersion: {
						$hash,
						keys
					}
				} = fp;
				return `
				<div class="col-six">
					<strong>HTMLElement</strong><span class="hash">${hashMini($hash)}</span>
					<div>keys (${count(keys)}): ${keys && keys.length ? modal('creep-html-element-version', keys.join(', ')) : note.blocked}</div>
				</div>
				`
			})()}
			</div>
		</div>
		<div class="flex-grid">
		${!fp.navigator ?
			`<div class="col-six">
				<strong>Navigator</strong>
				<div>deviceMemory: ${note.blocked}</div>
				<div>doNotTrack: ${note.blocked}</div>
				<div>globalPrivacyControl:${note.blocked}</div>
				<div>hardwareConcurrency: ${note.blocked}</div>
				<div>language: ${note.blocked}</div>
				<div>maxTouchPoints: ${note.blocked}</div>
				<div>vendor: ${note.blocked}</div>
				<div>plugins (0): ${note.blocked}</div>
				<div>mimeTypes (0): ${note.blocked}</div>
				<div>platform: ${note.blocked}</div>
				<div>system: ${note.blocked}</div>
				<div>ua architecture: ${note.blocked}</div>
				<div>ua model: ${note.blocked}</div>
				<div>ua platform: ${note.blocked}</div>
				<div>ua platformVersion: ${note.blocked}</div>
				<div>ua uaFullVersion: ${note.blocked}</div>
				<div>properties (0): ${note.blocked}</div>
			</div>
			<div class="col-six">
				<div>device:</div>
				<div class="block-text">${note.blocked}</div>
				<div>userAgent:</div>
				<div class="block-text">${note.blocked}</div>
				<div>appVersion:</div>
				<div class="block-text">${note.blocked}</div>
			</div>` :
		(() => {
			const {
				navigator: {
					$hash,
					appVersion,
					deviceMemory,
					doNotTrack,
					globalPrivacyControl,
					hardwareConcurrency,
					highEntropyValues,
					language,
					maxTouchPoints,
					mimeTypes,
					platform,
					plugins,
					properties,
					system,
					device,
					userAgent,
					vendor,
					lied
				}
			} = fp;
			const id = 'creep-navigator';
			const blocked = {
				[null]: !0,
				[undefined]: !0,
				['']: !0
			};
			return `
			<div class="col-six">
				<strong>Navigator</strong><span class="${lied ? 'lies ' : ''}hash">${hashMini($hash)}</span>
				<div>deviceMemory: ${!blocked[deviceMemory] ? deviceMemory : note.blocked}</div>
				<div>doNotTrack: ${''+doNotTrack}</div>
				<div>globalPrivacyControl: ${
					''+globalPrivacyControl == 'undefined' ? note.unsupported : ''+globalPrivacyControl
				}</div>
				<div>hardwareConcurrency: ${!blocked[hardwareConcurrency] ? hardwareConcurrency : note.blocked}</div>
				<div>language: ${!blocked[language] ? language : note.blocked}</div>
				<div>maxTouchPoints: ${!blocked[maxTouchPoints] ? ''+maxTouchPoints : note.blocked}</div>
				<div>vendor: ${!blocked[vendor] ? vendor : note.blocked}</div>
				<div>plugins (${count(plugins)}): ${
					!blocked[''+plugins] ?
					modal(`${id}-plugins`, plugins.map(plugin => plugin.name).join('<br>')) :
					note.blocked
				}</div>
				<div>mimeTypes (${count(mimeTypes)}): ${
					!blocked[''+mimeTypes] ? 
					modal(`${id}-mimeTypes`, mimeTypes.join('<br>')) :
					note.blocked
				}</div>
				<div>platform: ${!blocked[platform] ? platform : note.blocked}</div>
				<div>system: ${system}${
					/android/i.test(system) && !/arm/i.test(platform) && /linux/i.test(platform) ?
					' [emulator]' : ''
				}</div>
				${highEntropyValues ?  
					Object.keys(highEntropyValues).map(key => {
						const value = highEntropyValues[key];
						return `<div>ua ${key}: ${value ? value : note.unsupported}</div>`
					}).join('') :
					`<div>ua architecture: ${note.unsupported}</div>
					<div>ua model: ${note.unsupported}</div>
					<div>ua platform: ${note.unsupported}</div>
					<div>ua platformVersion: ${note.unsupported}</div>
					<div>ua uaFullVersion: ${note.unsupported} </div>`
				}
				<div>properties (${count(properties)}): ${modal(`${id}-properties`, properties.join(', '))}</div>
			</div>
			<div class="col-six">
				<div>device:</div>
				<div class="block-text">
					<div>${!blocked[device] ? device : note.blocked}</div>
				</div>
				<div>userAgent:</div>
				<div class="block-text">
					<div>${!blocked[userAgent] ? userAgent : note.blocked}</div>
				</div>
				<div>appVersion:</div>
				<div class="block-text">
					<div>${!blocked[appVersion] ? appVersion : note.blocked}</div>
				</div>
			</div>
			`
		})()}
		</div>
		<div>
			<strong>Tests</strong>
			<div>
				<a class="tests" href="./tests/workers.html">Workers</a>
			</div>
		</div>
	</div>
	`, () => {
			// fetch data from server
			const id = 'creep-browser';
			const visitorElem = document.getElementById(id);
			const fetchVisitorDataTimer = timer();
			const request = `${webapp}?id=${creepHash}&subId=${fpHash}&hasTrash=${hasTrash}&hasLied=${hasLied}&hasErrors=${hasErrors}`;
			
			fetch(request)
			.then(response => response.json())
			.then(async data => {
				console.log('\n\n⚡server response: ', JSON.stringify(data, null, '\t'));
				fetchVisitorDataTimer('server response time');
				const { firstVisit, lastVisit: latestVisit, looseFingerprints: subIds, visits, hasTrash, hasLied, hasErrors, signature } = data;
				const subIdsLen = Object.keys(subIds).length;
				const toLocaleStr = str => {
					const date = new Date(str);
					const dateString = date.toLocaleDateString();
					const timeString = date.toLocaleTimeString();
					return `${dateString}, ${timeString}`
				};
				const hoursAgo = (date1, date2) => Math.abs(date1 - date2) / 36e5;
				const hours = hoursAgo(new Date(firstVisit), new Date(latestVisit)).toFixed(1);

				// trust score
				const score = (100-(
					(subIdsLen < 2 ? 0 : subIdsLen-1 < 11 ? (subIdsLen-1) * 0.1 : (subIdsLen-1) * 0.2 ) +
					(errorsLen * 5.2) +
					(trashLen * 15.5) +
					(liesLen * 31)
				)).toFixed(0);
				const template = `
				<div class="visitor-info">
					<div class="ellipsis"><span class="aside-note">script modified 2020-12-5</span></div>
					<div class="flex-grid">
						<div class="col-six">
							<strong>Browser</strong>
							<div>trust score: <span class="unblurred">${
								score > 95 ? `${score}% <span class="grade-A">A+</span>` :
								score == 95 ? `${score}% <span class="grade-A">A</span>` :
								score >= 90 ? `${score}% <span class="grade-A">A-</span>` :
								score > 85 ? `${score}% <span class="grade-B">B+</span>` :
								score == 85 ? `${score}% <span class="grade-B">B</span>` :
								score >= 80 ? `${score}% <span class="grade-B">B-</span>` :
								score > 75 ? `${score}% <span class="grade-C">C+</span>` :
								score == 75 ? `${score}% <span class="grade-C">C</span>` :
								score >= 70 ? `${score}% <span class="grade-C">C-</span>` :
								score > 65 ? `${score}% <span class="grade-D">D+</span>` :
								score == 65 ? `${score}% <span class="grade-D">D</span>` :
								score >= 60 ? `${score}% <span class="grade-D">D-</span>` :
								score > 55 ? `${score}% <span class="grade-F">F+</span>` :
								score == 55 ? `${score}% <span class="grade-F">F</span>` :
								`${score < 0 ? 0 : score}% <span class="grade-F">F-</span>`
							}</span></div>
							<div>visits: <span class="unblurred">${visits}</span></div>
							<div class="ellipsis">first: <span class="unblurred">${toLocaleStr(firstVisit)}</span></div>
							<div class="ellipsis">last: <span class="unblurred">${toLocaleStr(latestVisit)}</span></div>
							<div>persistence: <span class="unblurred">${hours} hours</span></div>
						</div>
						<div class="col-six">
							<div>has trash: <span class="unblurred">${
								(''+hasTrash) == 'true' ?
								`true (${hashMini(fp.trash.$hash)})` : 
								'false'
							}</span></div>
							<div>has lied: <span class="unblurred">${
								(''+hasLied) == 'true' ? 
								`true (${hashMini(fp.lies.$hash)})` : 
								'false'
							}</span></div>
							<div>has errors: <span class="unblurred">${
								(''+hasErrors) == 'true' ? 
								`true (${hashMini(fp.capturedErrors.$hash)})` : 
								'false'
							}</span></div>
							<div class="ellipsis">loose fingerprint: <span class="unblurred">${hashMini(fpHash)}</span></div>
							<div class="ellipsis">loose count: <span class="unblurred">${subIdsLen}</span></div>
							<div class="ellipsis">bot: <span class="unblurred">${subIdsLen > 10 && hours < 48 ? 'true (10 loose in 48 hours)' : 'false'}</span></div>
						</div>
					</div>
					${
						signature ? 
						`
						<div class="fade-right-in" id="signature">
							<div class="ellipsis"><strong>signed</strong>: <span>${signature}</span></div>
						</div>
						` :
						`<form class="fade-right-in" id="signature">
							<input id="signature-input" type="text" placeholder="add a signature to your fingerprint" title="sign your fingerprint" required minlength="4" maxlength="64">
							<input type="submit" value="Sign">
						</form>
						`
					}
				</div>
			`;
				patch(visitorElem, html`${template}`, () => {
					if (signature) {
						return
					}
					const form = document.getElementById('signature');
					form.addEventListener('submit', async () => {
						event.preventDefault();

						
						const input = document.getElementById('signature-input').value;
						const submit = confirm(`Are you sure? This cannot be undone.\n\nsignature: ${input}`);

						if (!submit) {
							return
						}

						const signatureRequest = `https://creepjs-6bd8e.web.app/sign?id=${creepHash}&signature=${input}`;

						// animate out
						form.classList.remove('fade-right-in');
						form.classList.add('fade-down-out');

						// fetch/animate in
						return fetch(signatureRequest)
						.then(response => response.json())
						.then(data => {
							return setTimeout(() => {
								patch(form, html`
								<div class="fade-right-in" id="signature">
									<div class="ellipsis"><strong>signed</strong>: <span>${input}</span></div>
								</div>
							`);
								return console.log('Signed: ', JSON.stringify(data, null, '\t'))
							}, 300)
						})
						.catch(error => {
							patch(form, html`
							<div class="fade-right-in" id="signature">
								<div class="ellipsis"><strong style="color:crimson">${error}</strong></div>
							</div>
						`);
							return console.error('Error!', error.message)
						})
					});
				});

				const decryptRequest = `https://creepjs-6bd8e.web.app/decrypt?${[
				`isBrave=${isBrave}`,
				`mathId=${caniuse(() => fp.maths.$hash)}`,
				`errorId=${caniuse(() => fp.consoleErrors.$hash)}`,
				`htmlId=${caniuse(() => fp.htmlElementVersion.$hash)}`,
				`winId=${caniuse(() => fp.iframeContentWindowVersion.$hash)}`,
				`styleId=${caniuse(() => fp.cssStyleDeclarationVersion.getComputedStyle.$hash)}`,
				`styleSystemId=${caniuse(() => fp.cssStyleDeclarationVersion.system.$hash)}`,
				`ua=${encodeURIComponent(caniuse(() => fp.workerScope.userAgent))}`
			].join('&')}`;

				return fetch(decryptRequest)
				.then(response => response.json())
				.then(data => {
					const el = document.getElementById('browser-detection');
					const {
						jsRuntime,
						jsEngine,
						htmlVersion,
						windowVersion,
						styleVersion,
						styleSystem,
					} = data;
					const reportedUserAgent = caniuse(() => navigator.userAgent);
					const reportedSystem = getOS(reportedUserAgent);
					const report = decryptUserAgent({
						ua: reportedUserAgent,
						os: reportedSystem,
						isBrave
					});
					const iconSet = new Set();
					const htmlIcon = cssClass => `<span class="icon ${cssClass}"></span>`;
					const getTemplate = agent => {
						const { decrypted, system } = agent;
						const browserIcon = (
							/edgios|edge/i.test(decrypted) ? iconSet.add('edge') && htmlIcon('edge') :
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
							/webkit/i.test(decrypted) ? iconSet.add('webkit') && htmlIcon('webkit') :
							/blink/i.test(decrypted) ? iconSet.add('blink') && htmlIcon('blink') : ''
						);
						const systemIcon = (
							/chrome os/i.test(system) ? iconSet.add('cros') && htmlIcon('cros') :
							/linux/i.test(system) ? iconSet.add('linux') && htmlIcon('linux') :
							/android/i.test(system) ? iconSet.add('android') && htmlIcon('android') :
							/ipad|iphone|ipod|ios|mac/i.test(system) ? iconSet.add('apple') && htmlIcon('apple') :
							/windows/i.test(system) ? iconSet.add('windows') && htmlIcon('windows') : ''
						);
						const icons = [
							browserIcon,
							systemIcon
						].join('');
						return (
							system ? `${icons}${decrypted} on ${system}` :
							`${icons}${decrypted}`
						)
					};
					
					const fakeUserAgent = (
						/\d+/.test(windowVersion.decrypted) &&
						windowVersion.decrypted != report
					);

					patch(el, html`
				<div class="flex-grid">
					<div class="col-eight">
						<strong>Version</strong>
						<div>client user agent:
							<span class="${fakeUserAgent ? 'lies' : ''}">${report}${fakeUserAgent ?` (fake)` : ''}</span>
						</div>
						<div class="ellipsis">window object: ${getTemplate(windowVersion)}</div>
						<div class="ellipsis">system styles: ${getTemplate(styleSystem)}</div>
						<div class="ellipsis">computed styles: ${getTemplate(styleVersion)}</div>
						<div class="ellipsis">html element: ${getTemplate(htmlVersion)}</div>
						<div class="ellipsis">js runtime (math): ${getTemplate(jsRuntime)}</div>
						<div class="ellipsis">js engine (error): ${getTemplate(jsEngine)}</div>
					</div>
					<div class="col-four icon-container">
						${[...iconSet].map(icon => {
							return `<div class="icon-item ${icon}"></div>`
						}).join('')}
					</div>
				</div>
				`);
					return console.log(`user agents pending review: ${data.pendingReview}`)
				})
				.catch(error => {
					return console.error('Error!', error.message)
				})
			})
			.catch(error => {
				fetchVisitorDataTimer('Error fetching visitor data');
				patch(document.getElementById('loader'), html`<strong style="color:crimson">${error}</strong>`);
				return console.error('Error!', error.message)
			});
		});
	})(imports);

}());
