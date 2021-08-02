(function () {
	'use strict';

	// Detect Browser
	const mathPI = 3.141592653589793;
	const isChrome = mathPI ** -100 == 1.9275814160560204e-50;
	const isFirefox = mathPI ** -100 == 1.9275814160560185e-50;

	const braveBrowser = async () => {
		const brave = (
			'brave' in navigator &&
			Object.getPrototypeOf(navigator.brave).constructor.name == 'Brave' &&
			navigator.brave.isBrave.toString() == 'function isBrave() { [native code] }'
		);
		if (brave) {
			return true
		}
		const chromium = 3.141592653589793 ** -100 == 1.9275814160560204e-50;
		const storageQuotaIs2Gb = (
			'storage' in navigator && navigator.storage ?
			(2147483648 == (await navigator.storage.estimate()).quota) :
			false
		);
		return chromium && storageQuotaIs2Gb
	};

	function getBraveMode() {
		const mode = {
			unknown: false,
			allow: false,
			standard: false,
			strict: false
		};
		try {
			// strict mode adds float frequency data AnalyserNode
			const strictMode = () => {
				const audioContext = (
					'OfflineAudioContext' in window ? OfflineAudioContext : 
					'webkitOfflineAudioContext' in window ? webkitOfflineAudioContext :
					undefined
				);
				if (!audioContext) {
					return false
				}
				const context = new audioContext(1, 1, 44100);
				const analyser = context.createAnalyser();
				const data = new Float32Array(analyser.frequencyBinCount);
				analyser.getFloatFrequencyData(data);
				const strict = new Set(data).size > 1; // native only has -Infinity
				return strict
			};
			
			if (strictMode()) {
				mode.strict = true;
				return mode
			}
			// standard and strict mode do not have chrome plugins
			const chromePlugins = /(Chrom(e|ium)|Microsoft Edge) PDF (Plugin|Viewer)/;
			const pluginsList = [...navigator.plugins];
			const hasChromePlugins = pluginsList
				.filter(plugin => chromePlugins.test(plugin.name)).length == 2;
			if (pluginsList.length && !hasChromePlugins) {
				mode.standard = true;
				return mode
			}
			mode.allow = true;
			return mode
		} catch (e) {
			mode.unknown = true;
			return mode
		}
	}

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
	const appleRelease = /(ppc |intel |)(mac|mac |)os (x |x|)\d+/i;
	const otherOS = /((symbianos|nokia|blackberry|morphos|mac).+)|\/linux|freebsd|symbos|series \d+|win\d+|unix|hp-ux|bsdi|bsd|x86_64/i;
	const extraSpace = /\s{2,}/;

	const isDevice = (list, device) => list.filter(x => device.test(x)).length;

	const getUserAgentPlatform = ({ userAgent, excludeBuild = true }) => {
		if (!userAgent) {
			return 'unknown'
		}
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
				if (other.length) {
					return other.join(' ').trim().replace(/\s{2,}/, ' ')
				}
				return identifiers.join(' ')
			}
		} else {
			return 'unknown'
		}
	};

	const logTestResult = ({ test, passed, start = false }) => {
		const color = passed ? '#4cca9f' : 'lightcoral';
		const result = passed ? 'passed' : 'failed';
		const symbol = passed ? '✔' : '-';
		return console.log(
			`%c${symbol}${
		start ? ` (${(performance.now() - start).toFixed(2)}ms)` : ''
		} ${test} ${result}`, `color:${color}`
		)
	};

	const getPromiseRaceFulfilled = async ({
		promise,
		responseType,
		limit = 1000
	}) => {
		const slowPromise = new Promise(resolve => setTimeout(resolve, limit));
		const response = await Promise.race([slowPromise, promise])
			.then(response => response instanceof responseType ? response : 'pending')
			.catch(error => 'rejected');
		return (
			response == 'rejected' || response == 'pending' ? undefined : response
		)
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
		unknown: '<span class="blocked">unknown</span>',
		unsupported: '<span class="blocked">unsupported</span>',
		blocked: '<span class="blocked">blocked</span>',
		lied: '<span class="lies">lied</span>'
	};
	const pluralify = len => len > 1 ? 's' : '';
	const count = arr => arr && arr.constructor.name === 'Array' ? '' + (arr.length) : '0';

	const getMismatchStyle = (a, b) => b.map((char, i) => char != a[i] ? `<span class="bold-fail">${char}</span>` : char).join('');

	// modal component
	const modal = (name, result, linkname = 'details') => {
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
		<label class="modal-open-btn" for="toggle-open-${name}" onclick="">${linkname}</label>
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

	const getCapturedErrors = async imports => {

		const {
			require: {
				errorsCaptured
			}
		} = imports;

		const data = errorsCaptured.getErrors();

		return { data }
	};

	const errorsHTML = ({ fp, hashSlice, modal }) => {
		const { capturedErrors: { data, $hash  } } = fp;
		const len = data.length;
		return `
	<div class="col-four${len ? ' errors': ''}">
		<strong>Errors</strong>${len ? `<span class="hash">${hashSlice($hash)}</span>` : ''}
		<div>captured (${!len ? '0' : ''+len}): ${
			len ? modal('creep-captured-errors', Object.keys(data).map((key, i) => `${i+1}: ${data[key].trustedName} - ${data[key].trustedMessage} `).join('<br>')) : ''
		}</div>
	</div>
	`
	};

	// Detect proxy behavior
	const proxyBehavior = x => typeof x == 'function' ? true : false;

	// Detect gibberish 
	const accept = {'aa': 1, 'ab': 1, 'ac': 1, 'ad': 1, 'ae': 1, 'af': 1, 'ag': 1, 'ah': 1, 'ai': 1, 'aj': 1, 'ak': 1, 'al': 1, 'am': 1, 'an': 1, 'ao': 1, 'ap': 1, 'aq': 1, 'ar': 1, 'as': 1, 'at': 1, 'au': 1, 'av': 1, 'aw': 1, 'ax': 1, 'ay': 1, 'az': 1, 'ba': 1, 'bb': 1, 'bc': 1, 'bd': 1, 'be': 1, 'bf': 1, 'bg': 1, 'bh': 1, 'bi': 1, 'bj': 1, 'bk': 1, 'bl': 1, 'bm': 1, 'bn': 1, 'bo': 1, 'bp': 1, 'br': 1, 'bs': 1, 'bt': 1, 'bu': 1, 'bv': 1, 'bw': 1, 'bx': 1, 'by': 1, 'ca': 1, 'cb': 1, 'cc': 1, 'cd': 1, 'ce': 1, 'cg': 1, 'ch': 1, 'ci': 1, 'ck': 1, 'cl': 1, 'cm': 1, 'cn': 1, 'co': 1, 'cp': 1, 'cq': 1, 'cr': 1, 'cs': 1, 'ct': 1, 'cu': 1, 'cw': 1, 'cy': 1, 'cz': 1, 'da': 1, 'db': 1, 'dc': 1, 'dd': 1, 'de': 1, 'df': 1, 'dg': 1, 'dh': 1, 'di': 1, 'dj': 1, 'dk': 1, 'dl': 1, 'dm': 1, 'dn': 1, 'do': 1, 'dp': 1, 'dq': 1, 'dr': 1, 'ds': 1, 'dt': 1, 'du': 1, 'dv': 1, 'dw': 1, 'dx': 1, 'dy': 1, 'dz': 1, 'ea': 1, 'eb': 1, 'ec': 1, 'ed': 1, 'ee': 1, 'ef': 1, 'eg': 1, 'eh': 1, 'ei': 1, 'ej': 1, 'ek': 1, 'el': 1, 'em': 1, 'en': 1, 'eo': 1, 'ep': 1, 'eq': 1, 'er': 1, 'es': 1, 'et': 1, 'eu': 1, 'ev': 1, 'ew': 1, 'ex': 1, 'ey': 1, 'ez': 1, 'fa': 1, 'fb': 1, 'fc': 1, 'fd': 1, 'fe': 1, 'ff': 1, 'fg': 1, 'fh': 1, 'fi': 1, 'fj': 1, 'fk': 1, 'fl': 1, 'fm': 1, 'fn': 1, 'fo': 1, 'fp': 1, 'fr': 1, 'fs': 1, 'ft': 1, 'fu': 1, 'fw': 1, 'fy': 1, 'ga': 1, 'gb': 1, 'gc': 1, 'gd': 1, 'ge': 1, 'gf': 1, 'gg': 1, 'gh': 1, 'gi': 1, 'gj': 1, 'gk': 1, 'gl': 1, 'gm': 1, 'gn': 1, 'go': 1, 'gp': 1, 'gr': 1, 'gs': 1, 'gt': 1, 'gu': 1, 'gw': 1, 'gy': 1, 'gz': 1, 'ha': 1, 'hb': 1, 'hc': 1, 'hd': 1, 'he': 1, 'hf': 1, 'hg': 1, 'hh': 1, 'hi': 1, 'hj': 1, 'hk': 1, 'hl': 1, 'hm': 1, 'hn': 1, 'ho': 1, 'hp': 1, 'hq': 1, 'hr': 1, 'hs': 1, 'ht': 1, 'hu': 1, 'hv': 1, 'hw': 1, 'hy': 1, 'ia': 1, 'ib': 1, 'ic': 1, 'id': 1, 'ie': 1, 'if': 1, 'ig': 1, 'ih': 1, 'ii': 1, 'ij': 1, 'ik': 1, 'il': 1, 'im': 1, 'in': 1, 'io': 1, 'ip': 1, 'iq': 1, 'ir': 1, 'is': 1, 'it': 1, 'iu': 1, 'iv': 1, 'iw': 1, 'ix': 1, 'iy': 1, 'iz': 1, 'ja': 1, 'jc': 1, 'je': 1, 'ji': 1, 'jj': 1, 'jk': 1, 'jn': 1, 'jo': 1, 'ju': 1, 'ka': 1, 'kb': 1, 'kc': 1, 'kd': 1, 'ke': 1, 'kf': 1, 'kg': 1, 'kh': 1, 'ki': 1, 'kj': 1, 'kk': 1, 'kl': 1, 'km': 1, 'kn': 1, 'ko': 1, 'kp': 1, 'kr': 1, 'ks': 1, 'kt': 1, 'ku': 1, 'kv': 1, 'kw': 1, 'ky': 1, 'la': 1, 'lb': 1, 'lc': 1, 'ld': 1, 'le': 1, 'lf': 1, 'lg': 1, 'lh': 1, 'li': 1, 'lj': 1, 'lk': 1, 'll': 1, 'lm': 1, 'ln': 1, 'lo': 1, 'lp': 1, 'lq': 1, 'lr': 1, 'ls': 1, 'lt': 1, 'lu': 1, 'lv': 1, 'lw': 1, 'lx': 1, 'ly': 1, 'lz': 1, 'ma': 1, 'mb': 1, 'mc': 1, 'md': 1, 'me': 1, 'mf': 1, 'mg': 1, 'mh': 1, 'mi': 1, 'mj': 1, 'mk': 1, 'ml': 1, 'mm': 1, 'mn': 1, 'mo': 1, 'mp': 1, 'mq': 1, 'mr': 1, 'ms': 1, 'mt': 1, 'mu': 1, 'mv': 1, 'mw': 1, 'my': 1, 'na': 1, 'nb': 1, 'nc': 1, 'nd': 1, 'ne': 1, 'nf': 1, 'ng': 1, 'nh': 1, 'ni': 1, 'nj': 1, 'nk': 1, 'nl': 1, 'nm': 1, 'nn': 1, 'no': 1, 'np': 1, 'nq': 1, 'nr': 1, 'ns': 1, 'nt': 1, 'nu': 1, 'nv': 1, 'nw': 1, 'nx': 1, 'ny': 1, 'nz': 1, 'oa': 1, 'ob': 1, 'oc': 1, 'od': 1, 'oe': 1, 'of': 1, 'og': 1, 'oh': 1, 'oi': 1, 'oj': 1, 'ok': 1, 'ol': 1, 'om': 1, 'on': 1, 'oo': 1, 'op': 1, 'oq': 1, 'or': 1, 'os': 1, 'ot': 1, 'ou': 1, 'ov': 1, 'ow': 1, 'ox': 1, 'oy': 1, 'oz': 1, 'pa': 1, 'pb': 1, 'pc': 1, 'pd': 1, 'pe': 1, 'pf': 1, 'pg': 1, 'ph': 1, 'pi': 1, 'pj': 1, 'pk': 1, 'pl': 1, 'pm': 1, 'pn': 1, 'po': 1, 'pp': 1, 'pr': 1, 'ps': 1, 'pt': 1, 'pu': 1, 'pw': 1, 'py': 1, 'pz': 1, 'qa': 1, 'qe': 1, 'qi': 1, 'qo': 1, 'qr': 1, 'qs': 1, 'qt': 1, 'qu': 1, 'ra': 1, 'rb': 1, 'rc': 1, 'rd': 1, 're': 1, 'rf': 1, 'rg': 1, 'rh': 1, 'ri': 1, 'rj': 1, 'rk': 1, 'rl': 1, 'rm': 1, 'rn': 1, 'ro': 1, 'rp': 1, 'rq': 1, 'rr': 1, 'rs': 1, 'rt': 1, 'ru': 1, 'rv': 1, 'rw': 1, 'rx': 1, 'ry': 1, 'rz': 1, 'sa': 1, 'sb': 1, 'sc': 1, 'sd': 1, 'se': 1, 'sf': 1, 'sg': 1, 'sh': 1, 'si': 1, 'sj': 1, 'sk': 1, 'sl': 1, 'sm': 1, 'sn': 1, 'so': 1, 'sp': 1, 'sq': 1, 'sr': 1, 'ss': 1, 'st': 1, 'su': 1, 'sv': 1, 'sw': 1, 'sy': 1, 'sz': 1, 'ta': 1, 'tb': 1, 'tc': 1, 'td': 1, 'te': 1, 'tf': 1, 'tg': 1, 'th': 1, 'ti': 1, 'tj': 1, 'tk': 1, 'tl': 1, 'tm': 1, 'tn': 1, 'to': 1, 'tp': 1, 'tr': 1, 'ts': 1, 'tt': 1, 'tu': 1, 'tv': 1, 'tw': 1, 'tx': 1, 'ty': 1, 'tz': 1, 'ua': 1, 'ub': 1, 'uc': 1, 'ud': 1, 'ue': 1, 'uf': 1, 'ug': 1, 'uh': 1, 'ui': 1, 'uj': 1, 'uk': 1, 'ul': 1, 'um': 1, 'un': 1, 'uo': 1, 'up': 1, 'uq': 1, 'ur': 1, 'us': 1, 'ut': 1, 'uu': 1, 'uv': 1, 'uw': 1, 'ux': 1, 'uy': 1, 'uz': 1, 'va': 1, 'vc': 1, 'vd': 1, 've': 1, 'vg': 1, 'vi': 1, 'vl': 1, 'vn': 1, 'vo': 1, 'vr': 1, 'vs': 1, 'vt': 1, 'vu': 1, 'vv': 1, 'vy': 1, 'vz': 1, 'wa': 1, 'wb': 1, 'wc': 1, 'wd': 1, 'we': 1, 'wf': 1, 'wg': 1, 'wh': 1, 'wi': 1, 'wj': 1, 'wk': 1, 'wl': 1, 'wm': 1, 'wn': 1, 'wo': 1, 'wp': 1, 'wr': 1, 'ws': 1, 'wt': 1, 'wu': 1, 'ww': 1, 'wy': 1, 'wz': 1, 'xa': 1, 'xb': 1, 'xc': 1, 'xe': 1, 'xf': 1, 'xg': 1, 'xh': 1, 'xi': 1, 'xl': 1, 'xm': 1, 'xn': 1, 'xo': 1, 'xp': 1, 'xq': 1, 'xs': 1, 'xt': 1, 'xu': 1, 'xv': 1, 'xw': 1, 'xx': 1, 'xy': 1, 'ya': 1, 'yb': 1, 'yc': 1, 'yd': 1, 'ye': 1, 'yf': 1, 'yg': 1, 'yh': 1, 'yi': 1, 'yj': 1, 'yk': 1, 'yl': 1, 'ym': 1, 'yn': 1, 'yo': 1, 'yp': 1, 'yr': 1, 'ys': 1, 'yt': 1, 'yu': 1, 'yv': 1, 'yw': 1, 'yx': 1, 'yz': 1, 'za': 1, 'zb': 1, 'zc': 1, 'zd': 1, 'ze': 1, 'zg': 1, 'zh': 1, 'zi': 1, 'zj': 1, 'zk': 1, 'zl': 1, 'zm': 1, 'zn': 1, 'zo': 1, 'zp': 1, 'zq': 1, 'zs': 1, 'zt': 1, 'zu': 1, 'zv': 1, 'zw': 1, 'zy': 1, 'zz': 1};

	const gibberish = str => {
		if (!str) {
			return []
		}
		// test letter case sequence
		const letterCaseSequenceGibbers = [];
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
				return letterCaseSequenceGibbers.push(match.join(', '))
			}
			return
		});

		// test letter sequence
		const letterSequenceGibbers = [];
		const clean = str.toLowerCase().replace(/\d|\W|_/g, ' ').replace(/\s+/g,' ').trim().split(' ').join('_');
		const len = clean.length;
		const arr = [...clean];
		arr.forEach((char, index) => {
			const next = index+1;
			if (arr[next] == '_' || char == '_' || next == len) { return true }
			const combo = char+arr[index+1];
			const acceptable = !!accept[combo];
			!acceptable && letterSequenceGibbers.push(combo);
			return 
		});
		return [
			// ignore sequence if less than 3 exist
			...(letterSequenceGibbers.length < 3 ? [] : letterSequenceGibbers),
			...(letterCaseSequenceGibbers.length < 4 ? [] : letterCaseSequenceGibbers)
		]
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

	const getTrash = async imports => {
		const {
			require: {
				trashBin
			}
		} = imports;
		const bin = trashBin.getBin();
		return { trashBin: bin }
	};

	const trashHTML = ({ fp, hashSlice, modal }) => {
		const { trash: { trashBin, $hash  } } = fp;
		const trashLen = trashBin.length;
		return `
	<div class="col-four${trashLen ? ' trash': ''}">
		<strong>Trash</strong>${
			trashLen ? `<span class="hash">${hashSlice($hash)}</span>` : ''
		}
		<div>gathered (${!trashLen ? '0' : ''+trashLen }): ${
			trashLen ? modal(
				'creep-trash',
				trashBin.map((trash,i) => `${i+1}: ${trash.name}: ${trash.value}`).join('<br>')
			) : ''
		}</div>
	</div>`
	};

	// Collect lies detected
	const createlieRecords = () => {
		const records = {};
		return {
			getRecords: () => records,
			documentLie: (name, lie) => {
				const isArray = lie instanceof Array;
				if (records[name]) {
					if (isArray) {
						return (records[name] = [...records[name], ...lie])
					}
					return records[name].push(lie)
				}
				return isArray ? (records[name] = lie) : (records[name] = [lie])
			}
		}
	};

	const lieRecords = createlieRecords();
	const { documentLie } = lieRecords;

	const ghost = () => `
	height: 100vh;
	width: 100vw;
	position: absolute;
	left:-10000px;
	visibility: hidden;
`;
	const getRandomValues = () => {
		const id = [...crypto.getRandomValues(new Uint32Array(10))]
			.map(n => n.toString(36)).join('');
		return id
	};

	const getBehemothIframe = win => {
		try {
			const isChrome = (3.141592653589793 ** -100) == 1.9275814160560204e-50;
			if (!isChrome) {
				return win
			}
			const div = win.document.createElement('div');
			div.setAttribute('id', getRandomValues());
			div.setAttribute('style', ghost());
			div.innerHTML = `<div><iframe></iframe></div>`;
			win.document.body.appendChild(div);
			const iframe = [...[...div.childNodes][0].childNodes][0];
			if (!iframe) {
				return
			}
			const { contentWindow } = iframe || {};
			const div2 = contentWindow.document.createElement('div');
			div2.innerHTML = `<div><iframe></iframe></div>`;
			contentWindow.document.body.appendChild(div2);
			const iframe2 = [...[...div2.childNodes][0].childNodes][0];
			return iframe2.contentWindow
		}
		catch (error) {
			captureError(error, 'client blocked behemoth iframe');
			return win
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
			return { iframeWindow: phantomWindow, div }
		}
		catch (error) {
			captureError(error, 'client blocked phantom iframe');
			return { iframeWindow: window, div: undefined }
		}
	};
	const { iframeWindow: phantomDarkness, div: parentPhantom } = getPhantomIframe();

	const getDragonIframe = ({ numberOfNests, kill = false, context = window }) => {
		try {
			let parent, total = numberOfNests;
			return (function getIframeWindow(win, {
				previous = context
			} = {}) {
				if (!win) {
					if (kill) {
						parent.parentNode.removeChild(parent);
					}
					console.log(`\ndragon fire is valid up to ${total - numberOfNests} fiery flames`);
					return { iframeWindow: previous, parent }
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
					if (kill) {
						parent.parentNode.removeChild(parent);
					}
					return { iframeWindow, parent }
				}
				return getIframeWindow(iframeWindow, {
					previous: win
				})
			})(context)
		}
		catch (error) {
			captureError(error, 'client blocked dragon iframe');
			return { iframeWindow: window, parent: undefined }
		}
	};

	const { iframeWindow: dragonFire, parent: parentDragon } = getDragonIframe({ numberOfNests: 2 });

	const { iframeWindow: dragonOfDeath } = getDragonIframe({ numberOfNests: 4, kill: true });

	const chromium = (
		Math.acos(0.123) == 1.4474840516030247 &&
		Math.acosh(Math.SQRT2) == 0.881373587019543 &&
		Math.atan(2) == 1.1071487177940904 &&
		Math.atanh(0.5) == 0.5493061443340548 &&
		Math.cbrt(Math.PI) == 1.4645918875615231 &&
		Math.cos(21 * Math.LN2) == -0.4067775970251724 &&
		Math.cosh(492 * Math.LOG2E) == 9.199870313877772e+307 &&
		Math.expm1(1) == 1.718281828459045 &&
		Math.hypot(6 * Math.PI, -100) == 101.76102278593319 &&
		Math.log10(Math.PI) == 0.4971498726941338 &&
		Math.sin(Math.PI) == 1.2246467991473532e-16 &&
		Math.sinh(Math.PI) == 11.548739357257748 &&
		Math.tan(10 * Math.LOG2E) == -3.3537128705376014 &&
		Math.tanh(0.123) == 0.12238344189440875 &&
		Math.pow(Math.PI, -100) == 1.9275814160560204e-50
	);

	const getFirefox = () => 3.141592653589793 ** -100 == 1.9275814160560185e-50;

	const getPrototypeLies = iframeWindow => {
		// Lie Tests

		// object constructor descriptor should return undefined properties
		const getUndefinedValueLie = (obj, name) => {
			const objName = obj.name;
			const objNameUncapitalized = window[objName.charAt(0).toLowerCase() + objName.slice(1)];
			const hasInvalidValue = !!objNameUncapitalized && (
				typeof Object.getOwnPropertyDescriptor(objNameUncapitalized, name) != 'undefined' ||
				typeof Reflect.getOwnPropertyDescriptor(objNameUncapitalized, name) != 'undefined'
			);
			return hasInvalidValue ? true : false
		};

		// accessing the property from the prototype should throw a TypeError
		const getIllegalTypeErrorLie = (obj, name) => {
			const proto = obj.prototype;
			try {
				proto[name];
				return true
			} catch (error) {
				return error.constructor.name != 'TypeError' ? true : false
			}
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
			const lied = !!illegal.find(prop => {
				try {
					prop == '' ? Object(proto[name]) : Object[prop](proto[name]);
					return true
				} catch (error) {
					return error.constructor.name != 'TypeError' ? true : false
				}
			});
			return lied
		};

		// calling the interface prototype on the function should throw a TypeError
		const getCallInterfaceTypeErrorLie = (apiFunction, proto) => {
			try {
				new apiFunction();
				apiFunction.call(proto);
				return true
			} catch (error) {
				return error.constructor.name != 'TypeError' ? true : false
			}
		};

		// applying the interface prototype on the function should throw a TypeError
		const getApplyInterfaceTypeErrorLie = (apiFunction, proto) => {
			try {
				new apiFunction();
				apiFunction.apply(proto);
				return true
			} catch (error) {
				return error.constructor.name != 'TypeError' ? true : false
			}
		};

		// creating a new instance of the function should throw a TypeError
		const getNewInstanceTypeErrorLie = apiFunction => {
			try {
				new apiFunction();
				return true
			} catch (error) {
				return error.constructor.name != 'TypeError' ? true : false
			}
		};

		// extending the function on a fake class should throw a TypeError and message "not a constructor"
		const getClassExtendsTypeErrorLie = apiFunction => {
			try {
				class Fake extends apiFunction { }
				return true
			} catch (error) {
				// Native has TypeError and 'not a constructor' message in FF & Chrome
				return error.constructor.name != 'TypeError' ? true :
					!/not a constructor/i.test(error.message) ? true : false
			}
		};

		// setting prototype to null and converting to a string should throw a TypeError
		const getNullConversionTypeErrorLie = apiFunction => {
			const nativeProto = Object.getPrototypeOf(apiFunction);
			try {
				Object.setPrototypeOf(apiFunction, null) + '';
				return true
			} catch (error) {
				return error.constructor.name != 'TypeError' ? true : false
			} finally {
				// restore proto
				Object.setPrototypeOf(apiFunction, nativeProto);
			}
		};

		// toString() and toString.toString() should return a native string in all frames
		const getToStringLie = (apiFunction, name, iframeWindow) => {
	        /*
	        Accepted strings:
	        'function name() { [native code] }'
	        'function name() {\n    [native code]\n}'
	        'function get name() { [native code] }'
	        'function get name() {\n    [native code]\n}'
	        'function () { [native code] }'
	        `function () {\n    [native code]\n}`
	        */
			let iframeToString, iframeToStringToString;
			try {
				iframeToString = iframeWindow.Function.prototype.toString.call(apiFunction);
			} catch (e) { }
			try {
				iframeToStringToString = iframeWindow.Function.prototype.toString.call(apiFunction.toString);
			} catch (e) { }

			const apiFunctionToString = (
				iframeToString ?
					iframeToString :
					apiFunction.toString()
			);
			const apiFunctionToStringToString = (
				iframeToStringToString ?
					iframeToStringToString :
					apiFunction.toString.toString()
			);
			const trust = name => ({
				[`function ${name}() { [native code] }`]: true,
				[`function get ${name}() { [native code] }`]: true,
				[`function () { [native code] }`]: true,
				[`function ${name}() {${'\n'}    [native code]${'\n'}}`]: true,
				[`function get ${name}() {${'\n'}    [native code]${'\n'}}`]: true,
				[`function () {${'\n'}    [native code]${'\n'}}`]: true
			});
			return (
				!trust(name)[apiFunctionToString] ||
				!trust('toString')[apiFunctionToStringToString]
			)
		};

		// "prototype" in function should not exist
		const getPrototypeInFunctionLie = apiFunction => 'prototype' in apiFunction ? true : false;

		// "arguments", "caller", "prototype", "toString"  should not exist in descriptor
		const getDescriptorLie = apiFunction => {
			const hasInvalidDescriptor = (
				!!Object.getOwnPropertyDescriptor(apiFunction, 'arguments') ||
				!!Reflect.getOwnPropertyDescriptor(apiFunction, 'arguments') ||
				!!Object.getOwnPropertyDescriptor(apiFunction, 'caller') ||
				!!Reflect.getOwnPropertyDescriptor(apiFunction, 'caller') ||
				!!Object.getOwnPropertyDescriptor(apiFunction, 'prototype') ||
				!!Reflect.getOwnPropertyDescriptor(apiFunction, 'prototype') ||
				!!Object.getOwnPropertyDescriptor(apiFunction, 'toString') ||
				!!Reflect.getOwnPropertyDescriptor(apiFunction, 'toString')
			);
			return hasInvalidDescriptor ? true : false
		};

		// "arguments", "caller", "prototype", "toString" should not exist as own property
		const getOwnPropertyLie = apiFunction => {
			const hasInvalidOwnProperty = (
				apiFunction.hasOwnProperty('arguments') ||
				apiFunction.hasOwnProperty('caller') ||
				apiFunction.hasOwnProperty('prototype') ||
				apiFunction.hasOwnProperty('toString')
			);
			return hasInvalidOwnProperty ? true : false
		};

		// descriptor keys should only contain "name" and "length"
		const getDescriptorKeysLie = apiFunction => {
			const descriptorKeys = Object.keys(Object.getOwnPropertyDescriptors(apiFunction));
			const hasInvalidKeys = '' + descriptorKeys != 'length,name' && '' + descriptorKeys != 'name,length';
			return hasInvalidKeys ? true : false
		};

		// own property names should only contain "name" and "length"
		const getOwnPropertyNamesLie = apiFunction => {
			const ownPropertyNames = Object.getOwnPropertyNames(apiFunction);
			const hasInvalidNames = (
				'' + ownPropertyNames != 'length,name' && '' + ownPropertyNames != 'name,length'
			);
			return hasInvalidNames ? true : false
		};

		// own keys names should only contain "name" and "length"
		const getOwnKeysLie = apiFunction => {
			const ownKeys = Reflect.ownKeys(apiFunction);
			const hasInvalidKeys = '' + ownKeys != 'length,name' && '' + ownKeys != 'name,length';
			return hasInvalidKeys ? true : false
		};

		// calling toString() on an object created from the function should throw a TypeError
		const getNewObjectToStringTypeErrorLie = apiFunction => {
			try {
				Object.create(apiFunction).toString();
				return true
			} catch (error) {
				const stackLines = error.stack.split('\n');
				const traceLines = stackLines.slice(1);
				const objectApply = /at Object\.apply/;
				const functionToString = /at Function\.toString/;
				const validLines = !traceLines.find(line => objectApply.test(line));
				// Stack must be valid
				const validStack = (
					error.constructor.name == 'TypeError' && stackLines.length > 1
				);
				// Chromium must throw error 'at Function.toString' and not 'at Object.apply'
				const isChrome = 3.141592653589793 ** -100 == 1.9275814160560204e-50;
				if (validStack && isChrome && (!functionToString.test(stackLines[1]) || !validLines)) {
					return true
				}
				return !validStack
			}
		};

		// arguments or caller should not throw 'incompatible Proxy' TypeError
		const tryIncompatibleProxy = (isFirefox, fn) => {
			try {
				fn();
				return true
			} catch (error) {
				return (
					error.constructor.name != 'TypeError' ||
						(isFirefox && /incompatible\sProxy/.test(error.message)) ? true : false
				)
			}
		};
		const getIncompatibleProxyTypeErrorLie = apiFunction => {
			const isFirefox = getFirefox();
			return (
				tryIncompatibleProxy(isFirefox, () => apiFunction.arguments) ||
				tryIncompatibleProxy(isFirefox, () => apiFunction.arguments)
			)
		};
		const getToStringIncompatibleProxyTypeErrorLie = apiFunction => {
			const isFirefox = getFirefox();
			return (
				tryIncompatibleProxy(isFirefox, () => apiFunction.toString.arguments) ||
				tryIncompatibleProxy(isFirefox, () => apiFunction.toString.caller)
			)
		};

		// setting prototype to itself should not throw 'Uncaught InternalError: too much recursion'
		/*
			Designed for Firefox Proxies
			
			Trying to bypass this? We can also check if empty Proxies return 'Uncaught InternalError: too much recursion'

			x = new Proxy({}, {})
			Object.setPrototypeOf(x, x)+''

			This generates the same error:
			x = new Proxy({}, {})
			x.__proto__ = x
			x++

			In Blink, we can force a custom stack trace and then check each line
			you = () => {
				const x = Function.prototype.toString
				return Object.setPrototypeOf(x, x) + 1
			}
			can = () => you()
			run = () => can()
			but = () => run()
			u = () => but()
			cant = () => u()
			hide = () => cant()
			hide()
		*/
		const getTooMuchRecursionLie = apiFunction => {
			const isFirefox = getFirefox();
			const nativeProto = Object.getPrototypeOf(apiFunction);
			try {
				Object.setPrototypeOf(apiFunction, apiFunction) + '';
				return true
			} catch (error) {
				return (
					error.constructor.name != 'TypeError' ||
						(isFirefox && /too much recursion/.test(error.message)) ? true : false
				)
			} finally {
				// restore proto
				Object.setPrototypeOf(apiFunction, nativeProto);
			}
		};

		// API Function Test
		const getLies = (apiFunction, proto, obj = null) => {
			if (typeof apiFunction != 'function') {
				return {
					lied: false,
					lieTypes: []
				}
			}
			const name = apiFunction.name.replace(/get\s/, '');
			const lies = {
				// custom lie string names
				[`failed illegal error`]: obj ? getIllegalTypeErrorLie(obj, name) : false,
				[`failed undefined properties`]: obj ? getUndefinedValueLie(obj, name) : false,
				[`failed call interface error`]: getCallInterfaceTypeErrorLie(apiFunction, proto),
				[`failed apply interface error`]: getApplyInterfaceTypeErrorLie(apiFunction, proto),
				[`failed new instance error`]: getNewInstanceTypeErrorLie(apiFunction),
				[`failed class extends error`]: getClassExtendsTypeErrorLie(apiFunction),
				[`failed null conversion error`]: getNullConversionTypeErrorLie(apiFunction),
				[`failed toString`]: getToStringLie(apiFunction, name, iframeWindow),
				[`failed "prototype" in function`]: getPrototypeInFunctionLie(apiFunction),
				[`failed descriptor`]: getDescriptorLie(apiFunction),
				[`failed own property`]: getOwnPropertyLie(apiFunction),
				[`failed descriptor keys`]: getDescriptorKeysLie(apiFunction),
				[`failed own property names`]: getOwnPropertyNamesLie(apiFunction),
				[`failed own keys names`]: getOwnKeysLie(apiFunction),
				[`failed object toString error`]: getNewObjectToStringTypeErrorLie(apiFunction),
				[`failed at incompatible proxy error`]: getIncompatibleProxyTypeErrorLie(apiFunction),
				[`failed at toString incompatible proxy error`]: getToStringIncompatibleProxyTypeErrorLie(apiFunction),
				[`failed at too much recursion error`]: getTooMuchRecursionLie(apiFunction)
			};
			const lieTypes = Object.keys(lies).filter(key => !!lies[key]);
			return {
				lied: lieTypes.length,
				lieTypes
			}
		};

		// Lie Detector
		const createLieDetector = () => {
			const isSupported = obj => typeof obj != 'undefined' && !!obj;
			const props = {}; // lie list and detail
			let propsSearched = []; // list of properties searched
			return {
				getProps: () => props,
				getPropsSearched: () => propsSearched,
				searchLies: (fn, {
					target = [],
					ignore = []
				} = {}) => {
					let obj;
					// check if api is blocked or not supported
					try {
						obj = fn();
						if (!isSupported(obj)) {
							return
						}
					} catch (error) {
						return
					}

					const interfaceObject = !!obj.prototype ? obj.prototype : obj;
					Object.getOwnPropertyNames(interfaceObject)
						;[...new Set([
							...Object.getOwnPropertyNames(interfaceObject),
							...Object.keys(interfaceObject) // backup
						])].sort().forEach(name => {
							const skip = (
								name == 'constructor' ||
								(target.length && !new Set(target).has(name)) ||
								(ignore.length && new Set(ignore).has(name))
							);
							if (skip) {
								return
							}
							const objectNameString = /\s(.+)\]/;
							const apiName = `${
							obj.name ? obj.name : objectNameString.test(obj) ? objectNameString.exec(obj)[1] : undefined
							}.${name}`;
							propsSearched.push(apiName);
							try {
								const proto = obj.prototype ? obj.prototype : obj;
								let res; // response from getLies

								// search if function
								try {
									const apiFunction = proto[name]; // may trigger TypeError
									if (typeof apiFunction == 'function') {
										res = getLies(proto[name], proto);
										if (res.lied) {
											documentLie(apiName, res.lieTypes);
											return (props[apiName] = res.lieTypes)
										}
										return
									}
									// since there is no TypeError and the typeof is not a function,
									// handle invalid values and ingnore name, length, and constants
									if (
										name != 'name' &&
										name != 'length' &&
										name[0] !== name[0].toUpperCase()) {
										const lie = [`failed descriptor.value undefined`];
										documentLie(apiName, lie);
										return (
											props[apiName] = lie
										)
									}
								} catch (error) { }
								// else search getter function
								const getterFunction = Object.getOwnPropertyDescriptor(proto, name).get;
								res = getLies(getterFunction, proto, obj); // send the obj for special tests
								if (res.lied) {
									documentLie(apiName, res.lieTypes);
									return (props[apiName] = res.lieTypes)
								}
								return
							} catch (error) {
								const lie = `failed prototype test execution`;
								documentLie(apiName, lie);
								return (
									props[apiName] = [lie]
								)
							}
						});
				}
			}
		};

		const lieDetector = createLieDetector();
		const {
			searchLies
		} = lieDetector;

		// search for lies: remove target to search all properties
		searchLies(() => AnalyserNode);
		searchLies(() => AudioBuffer, {
			target: [
				'copyFromChannel',
				'getChannelData'
			]
		});
		searchLies(() => BiquadFilterNode, {
			target: [
				'getFrequencyResponse'
			]
		});
		searchLies(() => CanvasRenderingContext2D, {
			target: [
				'getImageData',
				'getLineDash',
				'isPointInPath',
				'isPointInStroke',
				'measureText',
				'quadraticCurveTo'
			]
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
				'valueOf'
			]
		});
		searchLies(() => Intl.DateTimeFormat, {
			target: [
				'format',
				'formatRange',
				'formatToParts',
				'resolvedOptions'
			]
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
				'writeln'
			],
			ignore: [
				// Firefox returns undefined on getIllegalTypeErrorLie test
				'onreadystatechange',
				'onmouseenter',
				'onmouseleave'
			]
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
				'setAttribute'
			]
		});
		searchLies(() => Function, {
			target: [
				'toString',
			],
			ignore: [
				'caller',
				'arguments'
			]
		});
		searchLies(() => HTMLCanvasElement);
		searchLies(() => HTMLElement, {
			target: [
				'clientHeight',
				'clientWidth',
				'offsetHeight',
				'offsetWidth',
				'scrollHeight',
				'scrollWidth'
			],
			ignore: [
				// Firefox returns undefined on getIllegalTypeErrorLie test
				'onmouseenter',
				'onmouseleave'
			]
		});
		searchLies(() => HTMLIFrameElement, {
			target: [
				'contentDocument',
				'contentWindow',
			]
		});
		searchLies(() => IntersectionObserverEntry, {
			target: [
				'boundingClientRect',
				'intersectionRect',
				'rootBounds'
			]
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
				'tanh'
			]
		});
		searchLies(() => MediaDevices, {
			target: [
				'enumerateDevices',
				'getDisplayMedia',
				'getUserMedia'
			]
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
				'vendorSub'
			]
		});
		searchLies(() => Node, {
			target: [
				'appendChild',
				'insertBefore',
				'replaceChild'
			]
		});
		searchLies(() => OffscreenCanvasRenderingContext2D, {
			target: [
				'getImageData',
				'getLineDash',
				'isPointInPath',
				'isPointInStroke',
				'measureText',
				'quadraticCurveTo'
			]
		});
		searchLies(() => Range, {
			target: [
				'getBoundingClientRect',
				'getClientRects',
			]
		});
		searchLies(() => Intl.RelativeTimeFormat, {
			target: [
				'resolvedOptions'
			]
		});
		searchLies(() => Screen);
		searchLies(() => SVGRect);
		searchLies(() => TextMetrics);
		searchLies(() => WebGLRenderingContext, {
			target: [
				'bufferData',
				'getParameter',
				'readPixels'
			]
		});
		searchLies(() => WebGL2RenderingContext, {
			target: [
				'bufferData',
				'getParameter',
				'readPixels'
			]
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
			propsSearched
		}
	};

	// start program
	const start = performance.now();
	const {
		lieDetector: lieProps,
		lieList,
		lieDetail,
		lieCount,
		propsSearched
	} = getPrototypeLies(phantomDarkness); // execute and destructure the list and detail
	const prototypeLies = JSON.parse(JSON.stringify(lieDetail));
	const perf = performance.now() - start;


	console.log(`${propsSearched.length} API properties analyzed in ${(perf).toFixed(2)}ms (${lieList.length} corrupted)`);

	const getPluginLies = (plugins, mimeTypes) => {
		const lies = []; // collect lie types
		const pluginsOwnPropertyNames = Object.getOwnPropertyNames(plugins).filter(name => isNaN(+name));
		const mimeTypesOwnPropertyNames = Object.getOwnPropertyNames(mimeTypes).filter(name => isNaN(+name));

		// cast to array
		plugins = [...plugins];
		mimeTypes = [...mimeTypes];

		// get intitial trusted mimeType names
		const trustedMimeTypes = new Set(mimeTypesOwnPropertyNames);

		// get initial trusted plugin names
		const excludeDuplicates = arr => [...new Set(arr)];
		const mimeTypeEnabledPlugins = excludeDuplicates(
			mimeTypes.map(mimeType => mimeType.enabledPlugin)
		);
		const trustedPluginNames = new Set(pluginsOwnPropertyNames);
		const mimeTypeEnabledPluginsNames = mimeTypeEnabledPlugins.map(plugin => plugin.name);
		const trustedPluginNamesArray = [...trustedPluginNames];
		trustedPluginNamesArray.forEach(name => {
			const validName = new Set(mimeTypeEnabledPluginsNames).has(name);
			if (!validName) {
				trustedPluginNames.delete(name);
			}
		});

		// 1. Expect plugin name to be in plugins own property names
		plugins.forEach(plugin => {
			if (!trustedPluginNames.has(plugin.name)) {
				lies.push('missing plugin name');
			}
		});

		// 2. Expect MimeType Plugins to match Plugins
		const getPluginPropertyValues = plugin => {
			return [
				plugin.description,
				plugin.filename,
				plugin.length,
				plugin.name
			]
		};
		const pluginList = plugins.map(getPluginPropertyValues).sort();
		const enabledpluginList = mimeTypeEnabledPlugins.map(getPluginPropertyValues).sort();
		const mismatchingPlugins = '' + pluginList != '' + enabledpluginList;
		if (mismatchingPlugins) {
			lies.push('mismatching plugins');
		}

		// 3. Expect MimeType object in plugins
		const invalidPlugins = plugins.filter(plugin => {
			try {
				const validMimeType = Object.getPrototypeOf(plugin[0]).constructor.name == 'MimeType';
				if (!validMimeType) {
					trustedPluginNames.delete(plugin.name);
				}
				return !validMimeType
			} catch (error) {
				trustedPluginNames.delete(plugin.name);
				return true // sign of tampering
			}
		});
		if (invalidPlugins.length) {
			lies.push('missing mimetype');
		}

		// 4. Expect valid MimeType(s) in plugin
		const pluginMimeTypes = plugins
			.map(plugin => Object.values(plugin))
			.flat();
		const pluginMimeTypesNames = pluginMimeTypes.map(mimetype => mimetype.type);
		pluginMimeTypesNames.forEach(name => {
			const validName = trustedMimeTypes.has(name);
			if (!validName) {
				trustedMimeTypes.delete(name);
			}
		});

		plugins.forEach(plugin => {
			const pluginMimeTypes = Object.values(plugin).map(mimetype => mimetype.type);
			return pluginMimeTypes.forEach(mimetype => {
				if (!trustedMimeTypes.has(mimetype)) {
					lies.push('invalid mimetype');
					return trustedPluginNames.delete(plugin.name)
				}
			})
		});

		return {
			validPlugins: plugins.filter(plugin => trustedPluginNames.has(plugin.name)),
			validMimeTypes: mimeTypes.filter(mimeType => trustedMimeTypes.has(mimeType.type)),
			lies: [...new Set(lies)] // remove duplicates
		}
	};

	// disregard Function.prototype.toString lies when determining if the API can be trusted
	const getNonFunctionToStringLies = x => !x ? x : x.filter(x => !/object toString|toString incompatible proxy/.test(x)).length;

	const getLies = imports => {

		const {
			require: {
				lieRecords
			}
		} = imports;

		const records = lieRecords.getRecords();
		return new Promise(resolve => {
			const totalLies = Object.keys(records).reduce((acc, key) => {
				acc += records[key].length;
				return acc
			}, 0);
			return resolve({ data: records, totalLies })
		})
	};

	const liesHTML = ({ fp, hashSlice, modal }) => {
		const { lies: { data, totalLies, $hash } } = fp;
		return `
	<div class="col-four${totalLies ? ' lies' : ''}">
		<strong>Lies</strong>${totalLies ? `<span class="hash">${hashSlice($hash)}</span>` : ''}
		<div>unmasked (${!totalLies ? '0' : '' + totalLies}): ${
		totalLies ? modal('creep-lies', Object.keys(data).sort().map(key => {
			const lies = data[key];
			return `
				<br>
				<div style="padding:5px">
					<strong>${key}</strong>:
					${lies.map(lie => `<div>- ${lie}</div>`).join('')}
				</div>
				`
		}).join('')) : ''
		}</div>
	</div>`
	};

	const getKnownAudio = () => ({
		// Chrome
		[-20.538286209106445]: [124.04347527516074, 124.04347503720783],
		[-20.538288116455078]: [124.04344884395687],
		[-20.535268783569336]: [124.080722568091],
		
		// Firefox Android
		[-31.502185821533203]: [35.74996031448245, 35.7499681673944],
		// Firefox windows/mac/linux
		[-31.50218963623047]: [35.74996031448245],
		[-31.509262084960938]: [35.7383295930922, 35.73833402246237] 
	});

	const getOfflineAudioContext = async imports => {

		const {
			require: {
				captureError,
				attempt,
				caniuse,
				sendToTrash,
				documentLie,
				lieProps,
				phantomDarkness,
				logTestResult
			}
		} = imports;

		try {
			await new Promise(setTimeout).catch(e => {});
			const start = performance.now();
			const win = phantomDarkness ? phantomDarkness : window;
			const audioContext = caniuse(() => win.OfflineAudioContext || win.webkitOfflineAudioContext);
			if (!audioContext) {
				logTestResult({ test: 'audio', passed: false });
				return
			}
			// detect lies
			const channelDataLie = lieProps['AudioBuffer.getChannelData'];
			const copyFromChannelLie = lieProps['AudioBuffer.copyFromChannel'];
			let lied = (channelDataLie || copyFromChannelLie) || false;

			const bufferLen = 5000;
			const context = new audioContext(1, bufferLen, 44100);
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
					return caniuse(() => analyser.context.listener.forwardX.maxValue)
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

			const getRenderedBuffer = ({
				context,
				floatFrequencyData,
				floatTimeDomainData
			} = {}) => new Promise(resolve => {
				let analyser;
				const oscillator = context.createOscillator();
				const dynamicsCompressor = context.createDynamicsCompressor();

				oscillator.type = 'triangle';
				oscillator.frequency.value = 10000;

				caniuse(() => dynamicsCompressor.threshold.value = -50);
				caniuse(() => dynamicsCompressor.knee.value = 40);
				caniuse(() => dynamicsCompressor.attack.value = 0);

				oscillator.connect(dynamicsCompressor);

				if (floatFrequencyData || floatTimeDomainData) {
					analyser = context.createAnalyser();
					dynamicsCompressor.connect(analyser);
					analyser.connect(context.destination);
				} else {
					dynamicsCompressor.connect(context.destination);
				}

				oscillator.start(0);
				context.startRendering();

				context.oncomplete = event => {
					try {
						if (floatFrequencyData) {
							const data = new Float32Array(analyser.frequencyBinCount);
							analyser.getFloatFrequencyData(data);
							return resolve(data)
						}
						else if (floatTimeDomainData) {
							const data = new Float32Array(analyser.fftSize);
							analyser.getFloatTimeDomainData(data);
							return resolve(data)
						}
						return resolve({
							buffer: event.renderedBuffer,
							compressorGainReduction: dynamicsCompressor.reduction
						})
					}
					catch (error) {
						return resolve()
					}
					finally {
						dynamicsCompressor.disconnect();
						oscillator.disconnect();
					}
				};
			});

			const [
				response,
				floatFrequencyData,
				floatTimeDomainData
			] = await Promise.all([
				getRenderedBuffer({
					context: new audioContext(1, bufferLen, 44100)
				}),
				getRenderedBuffer({
					context: new audioContext(1, bufferLen, 44100),
					floatFrequencyData: true
				}),
				getRenderedBuffer({
					context: new audioContext(1, bufferLen, 44100),
					floatTimeDomainData: true
				})
			]);
			
			const getSum = arr => !arr ? 0 : arr.reduce((acc, curr) => (acc += Math.abs(curr)), 0);
			const { buffer, compressorGainReduction } = response || {};
			const floatFrequencyDataSum = getSum(floatFrequencyData);
			const floatTimeDomainDataSum = getSum(floatTimeDomainData);

			const copy = new Float32Array(bufferLen);
			caniuse(() => buffer.copyFromChannel(copy, 0));
			const bins = caniuse(() => buffer.getChannelData(0)) || [];
			const copySample = [...copy].slice(4500, 4600);
			const binsSample = [...bins].slice(4500, 4600);
			const sampleSum = getSum([...bins].slice(4500, bufferLen));
			
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
			const getNoiseFactor = () => {
				try {
					const buffer = new AudioBuffer({
						length: 1,
						sampleRate: 44100
					});
					buffer.getChannelData(0)[0] = 1;
					return buffer.getChannelData(0)[0]
				}
				catch (error) {
					return 1
				}
			};
			const noiseFactor = getNoiseFactor();
			const noise = noiseFactor == 1 ? 0 : noiseFactor;
			if (noise) {
				lied = true;
				const audioSampleNoiseLie = 'sample noise detected';
				documentLie('AudioBuffer', audioSampleNoiseLie);
			}

			logTestResult({ start, test: 'audio', passed: true });
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
				lied
			}
				
		}
		catch (error) {
			logTestResult({ test: 'audio', passed: false });
			captureError(error, 'OfflineAudioContext failed or blocked by client');
			return
		}

	};

	const audioHTML = ({ fp, note, modal, getMismatchStyle, hashMini, hashSlice }) => {
		if (!fp.offlineAudioContext) {
			return `<div class="col-four undefined">
			<strong>Audio</strong>
			<div>sum: ${note.blocked}</div>
			<div>gain: ${note.blocked}</div>
			<div>freq: ${note.blocked}</div>
			<div>time: ${note.blocked}</div>
			<div>buffer noise: ${note.blocked}</div>
			<div>unique: ${note.blocked}</div>
			<div>data: ${note.blocked}</div>
			<div>copy: ${note.blocked}</div>
			<div>values: ${note.blocked}</div>
		</div>`
		}
		const {
			offlineAudioContext: {
				$hash,
				totalUniqueSamples,
				compressorGainReduction,
				floatFrequencyDataSum,
				floatTimeDomainDataSum,
				sampleSum,
				binsSample,
				copySample,
				lied,
				noise,
				values
			}
		} = fp;
		const knownSums = getKnownAudio()[compressorGainReduction];
		
		return `
	<div class="col-four${lied ? ' rejected' : ''}">
		<strong>Audio</strong><span class="${lied ? 'lies ' : ''}hash">${hashSlice($hash)}</span>
		<div>sum: ${
			sampleSum && compressorGainReduction && knownSums && !knownSums.includes(sampleSum) ?
			getMismatchStyle((''+knownSums[0]).split(''), (''+sampleSum).split('')) :
			sampleSum
		}</div>
		<div class="help" title="DynamicsCompressorNode.reduction">gain: ${
			compressorGainReduction || note.blocked
		}</div>
		<div class="help" title="AnalyserNode.getFloatFrequencyData()">freq: ${
			floatFrequencyDataSum || note.blocked
		}</div>
		<div class="help" title="AnalyserNode.getFloatTimeDomainData()">time: ${
			floatTimeDomainDataSum || note.blocked
		}</div>
		<div>buffer noise: ${!noise ? 0 : `${noise.toFixed(4)}...`}</div>
		<div>unique: ${totalUniqueSamples}</div>
		<div class="help" title="AudioBuffer.getChannelData()">data:${
			''+binsSample[0] == 'undefined' ? ` ${note.unsupported}` : 
			`<span class="sub-hash">${hashMini(binsSample)}</span>`
		}</div>
		<div class="help" title="AudioBuffer.copyFromChannel()">copy:${
			''+copySample[0] == 'undefined' ? ` ${note.unsupported}` : 
			`<span class="sub-hash">${hashMini(copySample)}</span>`
		}</div>
		<div>values: ${
			modal(
				'creep-offline-audio-context',
				Object.keys(values).map(key => `<div>${key}: ${values[key]}</div>`).join(''),
				hashMini(values)
			)
		}</div>
	</div>
	`
	};

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

			// set the dimensions
			canvasDisplay1.width = len * visualMultiplier;
			canvasDisplay1.height = len * visualMultiplier;
			canvasDisplay2.width = len * visualMultiplier;
			canvasDisplay2.height = len * visualMultiplier;
			canvas1.width = len;
			canvas1.height = len;
			canvas2.width = len;
			canvas2.height = len

			// fill canvas1 with random image data
			;[...Array(len)].forEach((e, x) => [...Array(len)].forEach((e, y) => {
				const red = ~~(Math.random() * 256);
				const green = ~~(Math.random() * 256);
				const blue = ~~(Math.random() * 256);
				const colors = `${red}, ${green}, ${blue}, ${alpha}`;
				context1.fillStyle = `rgba(${colors})`;
				context1.fillRect(x, y, 1, 1);
				// capture data in visuals
				contextDisplay1.fillStyle = `rgba(${colors})`;
				contextDisplay1.fillRect(
					x * visualMultiplier,
					y * visualMultiplier,
					1 * visualMultiplier,
					1 * visualMultiplier
				);
				return pattern1.push(colors) // collect the pixel pattern
			}))

			// fill canvas2 with canvas1 image data
			;[...Array(len)].forEach((e, x) => [...Array(len)].forEach((e, y) => {
				// get context1 pixel data and mirror to context2
				const {
					data: [red, green, blue, alpha]
				} = context1.getImageData(x, y, 1, 1) || {};
				const colors = `${red}, ${green}, ${blue}, ${alpha}`;
				context2.fillStyle = `rgba(${colors})`;
				context2.fillRect(x, y, 1, 1);

				// capture noise in visuals
				const {
					data: [red2, green2, blue2, alpha2]
				} = context2.getImageData(x, y, 1, 1) || {};
				const colorsDisplay = `
				${red != red2 ? red2 : 255},
				${green != green2 ? green2 : 255},
				${blue != blue2 ? blue2 : 255},
				${alpha != alpha2 ? alpha2 : 1}
			`;
				contextDisplay2.fillStyle = `rgba(${colorsDisplay})`;
				contextDisplay2.fillRect(
					x * visualMultiplier,
					y * visualMultiplier,
					1 * visualMultiplier,
					1 * visualMultiplier
				);
				return pattern2.push(colors) // collect the pixel pattern
			}));

			// compare the pattern collections and collect diffs
			const patternDiffs = [];
			const rgbaChannels = new Set()

			;[...Array(pattern1.length)].forEach((e, i) => {
				const pixelColor1 = pattern1[i];
				const pixelColor2 = pattern2[i];
				if (pixelColor1 != pixelColor2) {
					const rgbaValues1 = pixelColor1.split(',');
					const rgbaValues2 = pixelColor2.split(',');
					const colors = [
						rgbaValues1[0] != rgbaValues2[0] ? 'r' : '',
						rgbaValues1[1] != rgbaValues2[1] ? 'g' : '',
						rgbaValues1[2] != rgbaValues2[2] ? 'b' : '',
						rgbaValues1[3] != rgbaValues2[3] ? 'a' : ''
					].join('');
					rgbaChannels.add(colors);
					patternDiffs.push([i, colors]);
				}
			});

			pixelImageRandom = canvasDisplay1.toDataURL(); // template use only
			const pixelImage = canvasDisplay2.toDataURL();

			const rgba = rgbaChannels.size ? [...rgbaChannels].sort().join(', ') : undefined;
			const pixels = patternDiffs.length || undefined;
			return { rgba, pixels, pixelImage }
		}
		catch (error) {
			return console.error(error)
		}
	};

	const getPointIn = (canvas, context) => {
		canvas.width = canvas.height;
		context.fillStyle = 'rgba(0, 0, 0, 1)';
		context.beginPath();
		context.arc(0, 0, 10, 0, Math.PI * 2);
		context.closePath();
		context.fill();
		const isPointInPath = [];
		const isPointInStroke = []
		;[...Array(canvas.width)].forEach((e, x) => [...Array(canvas.height)].forEach((e, y) => {
			context.isPointInPath(x, y) && isPointInPath.push([x, y]);
			return context.isPointInStroke(x, y) && isPointInStroke.push([x, y])
		}));
		return {
			isPointInPath: isPointInPath.length ? isPointInPath : undefined,
			isPointInStroke: isPointInStroke.length ? isPointInStroke : undefined
		}
	};

	const getCanvas2d = async imports => {

		const {
			require: {
				captureError,
				lieProps,
				documentLie,
				phantomDarkness,
				dragonOfDeath,
				logTestResult
			}
		} = imports;

		const fillRect = (canvas, context) => {
			canvas.width = 186;
			canvas.height = 30;
			const str = `😃🙌🧠🦄🐉🌊🍧🏄‍♀️🌠🔮`;
			context.font = '14px Arial';
			context.fillText(str, 0, 20);
			context.fillStyle = 'rgba(0, 0, 0, 0)';
			context.fillRect(0, 0, 186, 30);

			context.beginPath();
			context.arc(15.49, 15.51, 10.314, 0, Math.PI * 2);
			context.closePath();
			context.fill();

			return context
		};

		const getFileReaderData = async blob => {
			if (!blob) {
				return
			}
			const reader1 = new FileReader();
			const reader2 = new FileReader();
			const reader3 = new FileReader();
			const reader4 = new FileReader();
			reader1.readAsArrayBuffer(blob);
			reader2.readAsDataURL(blob);
			reader3.readAsBinaryString(blob);
			reader4.readAsText(blob);
			const [
				readAsArrayBuffer,
				readAsDataURL,
				readAsBinaryString,
				readAsText
			] = await Promise.all([
				new Promise(resolve => {
					reader1.onload = () => resolve(reader1.result);
				}),
				new Promise(resolve => {
					reader2.onload = () => resolve(reader2.result);
				}),
				new Promise(resolve => {
					reader3.onload = () => resolve(reader3.result);
				}),
				new Promise(resolve => {
					reader4.onload = () => resolve(reader4.result);
				})
			]);
			return {
				readAsArrayBuffer: String.fromCharCode.apply(null, new Uint8Array(readAsArrayBuffer)),
				readAsBinaryString,
				readAsDataURL,
				readAsText
			}
		};

		const systemEmojis = [
			[128512],
			[9786],
			[129333, 8205, 9794, 65039],
			[9832],
			[9784],
			[9895],
			[8265],
			[8505],
			[127987, 65039, 8205, 9895, 65039],
			[129394],
			[9785],
			[9760],
			[129489, 8205, 129456],
			[129487, 8205, 9794, 65039],
			[9975],
			[129489, 8205, 129309, 8205, 129489],
			[9752],
			[9968],
			[9961],
			[9972],
			[9992],
			[9201],
			[9928],
			[9730],
			[9969],
			[9731],
			[9732],
			[9976],
			[9823],
			[9937],
			[9000],
			[9993],
			[9999],
			[10002],
			[9986],
			[9935],
			[9874],
			[9876],
			[9881],
			[9939],
			[9879],
			[9904],
			[9905],
			[9888],
			[9762],
			[9763],
			[11014],
			[8599],
			[10145],
			[11013],
			[9883],
			[10017],
			[10013],
			[9766],
			[9654],
			[9197],
			[9199],
			[9167],
			[9792],
			[9794],
			[10006],
			[12336],
			[9877],
			[9884],
			[10004],
			[10035],
			[10055],
			[9724],
			[9642],
			[10083],
			[10084],
			[9996],
			[9757],
			[9997],
			[10052],
			[9878],
			[8618],
			[9775],
			[9770],
			[9774],
			[9745],
			[10036],
			[127344],
			[127359]
		].map(emojiCode => String.fromCodePoint(...emojiCode));

		try {
			await new Promise(setTimeout).catch(e => { });
			const start = performance.now();

			const dataLie = lieProps['HTMLCanvasElement.toDataURL'];
			const contextLie = lieProps['HTMLCanvasElement.getContext'];
			const imageDataLie = lieProps['CanvasRenderingContext2D.getImageData'];
			const textMetricsLie = lieProps['CanvasRenderingContext2D.measureText'];
			let lied = (dataLie || contextLie || imageDataLie || textMetricsLie) || false;

			const doc = phantomDarkness ? phantomDarkness.document : document;
			const canvas = doc.createElement('canvas');
			const context = canvas.getContext('2d');
			fillRect(canvas, context);
			const dataURI = canvas.toDataURL();
			

			if (dragonOfDeath) {
				const result1 = dragonOfDeath.document.createElement('canvas').toDataURL();
				const result2 = document.createElement('canvas').toDataURL();
				if (result1 != result2) {
					lied = true;
					const iframeLie = `expected x in nested iframe and got y`;
					documentLie(`HTMLCanvasElement.toDataURL`, iframeLie);
				}
			}

			const {
				actualBoundingBoxAscent,
				actualBoundingBoxDescent,
				actualBoundingBoxLeft,
				actualBoundingBoxRight,
				fontBoundingBoxAscent,
				fontBoundingBoxDescent,
				width
			} = context.measureText(systemEmojis.join('')) || {};
			const textMetrics = {
				actualBoundingBoxAscent,
				actualBoundingBoxDescent,
				actualBoundingBoxLeft,
				actualBoundingBoxRight,
				fontBoundingBoxAscent,
				fontBoundingBoxDescent,
				width
			};
			const { data: imageData } = context.getImageData(0, 0, canvas.width, canvas.height) || {};
			
			let canvasOffscreen;
			try {
				canvasOffscreen = new OffscreenCanvas(186, 30);
				const contextOffscreen = canvasOffscreen.getContext('2d');
				fillRect(canvasOffscreen, contextOffscreen);
			}
			catch (error) { }

			const [
				blob,
				blobOffscreen
			] = await Promise.all([
				new Promise(resolve => canvas.toBlob(async blob => {
					const data = await getFileReaderData(blob);
					return resolve(data)
				})),
				getFileReaderData(canvasOffscreen && await canvasOffscreen.convertToBlob())
			]);

			const points = getPointIn(canvas, context); // modifies width
			const mods = getPixelMods();

			// lies
			const {
				readAsArrayBuffer,
				readAsBinaryString,
				readAsDataURL,
				readAsText
			} = blob || {};
			
			const {
				readAsArrayBuffer: readAsArrayBufferOffscreen,
				readAsBinaryString: readAsBinaryStringOffscreen,
				readAsDataURL: readAsDataURLOffscreen,
				readAsText: readAsTextOffscreen
			} = blobOffscreen || {};
			const mismatchingFileData = (
				(readAsArrayBufferOffscreen && readAsArrayBufferOffscreen !== readAsArrayBuffer) ||
				(readAsBinaryStringOffscreen && readAsBinaryStringOffscreen !== readAsBinaryString) ||
				(readAsDataURLOffscreen && readAsDataURLOffscreen !== readAsDataURL) ||
				(readAsTextOffscreen && readAsTextOffscreen !== readAsText)
			);
			if (mismatchingFileData) {
				lied = true;
				const iframeLie = `mismatching file data`;
				documentLie(`FileReader`, iframeLie);
			}

			if (mods && mods.pixels) {
				lied = true;
				const iframeLie = `pixel data modified`;
				documentLie(`CanvasRenderingContext2D.getImageData`, iframeLie);
			}

			logTestResult({ start, test: 'canvas 2d', passed: true });
			return {
				dataURI,
				imageData: imageData ? String.fromCharCode.apply(null, imageData) : undefined,
				mods,
				points,
				blob,
				blobOffscreen,
				textMetrics: new Set(Object.keys(textMetrics)).size > 1 ? textMetrics : undefined,
				lied
			}
		}
		catch (error) {
			logTestResult({ test: 'canvas 2d', passed: false });
			captureError(error);
			return
		}
	};

	const canvasHTML = ({ fp, note, modal, getMismatchStyle, hashMini, hashSlice }) => {
		if (!fp.canvas2d) {
			return `
		<div class="col-six undefined">
			<strong>Canvas 2d</strong> <span>${note.blocked}</span>
			<div>data: ${note.blocked}</div>
			<div>textMetrics: ${note.blocked}</div>
			<div>pixel trap:</div>
			<div class="icon-container pixels">${note.blocked}</div>
		</div>`
		}
				
		const {
			canvas2d: {
				lied,
				dataURI,
				imageData,
				mods,
				points,
				blob,
				blobOffscreen,
				textMetrics,
				$hash
			}
		} = fp;
		const { pixels, rgba, pixelImage } = mods || {};
		const modPercent = pixels ? Math.round((pixels / 400) * 100) : 0;

		const {
			readAsArrayBuffer,
			readAsBinaryString,
			readAsDataURL,
			readAsText
		} = blob || {};

		const hash = {
			dataURI: hashMini(dataURI),
			readAsArrayBuffer: hashMini(readAsArrayBuffer),
			readAsBinaryString: hashMini(readAsBinaryString),
			readAsDataURL: hashMini(readAsDataURL),
			readAsText: hashMini(readAsText)
			
		};

		const getBlobtemplate = blob => {
			const {
				readAsArrayBuffer,
				readAsBinaryString,
				readAsDataURL,
				readAsText
			} = blob || {};
			
			return `
			<br>readAsArrayBuffer: ${!readAsArrayBuffer ? note.unsupported : getMismatchStyle(hash.readAsArrayBuffer.split(''), hashMini(readAsArrayBuffer).split(''))}
			<br>readAsBinaryString: ${!readAsBinaryString ? note.unsupported : getMismatchStyle(hash.readAsBinaryString.split(''), hashMini(readAsBinaryString).split(''))}
			<br>readAsDataURL: ${!readAsDataURL ? note.unsupported : getMismatchStyle(hash.dataURI.split(''), hashMini(readAsDataURL).split(''))}
			<br>readAsText: ${!readAsText ? note.unsupported : getMismatchStyle(hash.readAsText.split(''), hashMini(readAsText).split(''))}
		`
		};
		const { isPointInPath, isPointInStroke } = points || {};
		const dataTemplate = `
		${dataURI ? `<div class="icon-item canvas-data"></div>` : ''}
		<br>toDataURL: ${!dataURI ? note.blocked : hash.dataURI}
		<br>getImageData: ${!imageData ? note.blocked : hashMini(imageData)}
		<br>isPointInPath: ${!isPointInPath ? note.blocked : hashMini(isPointInPath)}
		<br>isPointInStroke: ${!isPointInStroke ? note.blocked : hashMini(isPointInStroke)}
		<br><br><strong>HTMLCanvasElement.toBlob</strong>
		${getBlobtemplate(blob)}
		<br><br><strong>OffscreenCanvas.convertToBlob</strong>
		${getBlobtemplate(blobOffscreen)}
	`;

		// rgba: "b, g, gb, r, rb, rg, rgb"
		const rgbaHTML = !rgba ? rgba : rgba.split(', ').map(s => s.split('').map(c => {
			const css = {
				r: 'red',
				g: 'green',
				b: 'blue',
			};
			return `<span class="rgba rgba-${css[c]}"></span>`
		}).join('')).join(' ');

		const getSum = arr => !arr ? 0 : arr.reduce((acc, curr) => (acc += Math.abs(curr)), 0);
		return `
	<div class="col-six${lied ? ' rejected' : ''}">
		<style>
			.pixels {
				padding: 10px;
				position: relative;
				overflow: hidden;
			}
			.canvas-data {
				max-width: 200px;
				height: 30px;
				background-image: url(${dataURI})
			}
			.pixel-image,
			.pixel-image-random {
				max-width: 75px;
    			border-radius: 50%;
			}
			.pixel-image {
				background-image: url(${pixelImage})
			}
			.pixel-image-random {
				background-image: url(${pixelImageRandom})
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
		<strong>Canvas 2d</strong><span class="${lied ? 'lies ' : ''}hash">${hashSlice($hash)}</span>
		<div class="help" title="HTMLCanvasElement.toDataURL()\nCanvasRenderingContext2D.getImageData()\nCanvasRenderingContext2D.isPointInPath()\nCanvasRenderingContext2D.isPointInStroke()\nHTMLCanvasElement.toBlob()\nOffscreenCanvas.convertToBlob()\nFileReader.readAsArrayBuffer()\nFileReader.readAsBinaryString()\nFileReader.readAsDataURL()\nFileReader.readAsText()">data: ${
			modal(
				'creep-canvas-data',
				dataTemplate,
				hashMini({
					dataURI,
					imageData,
					points,
					blob,
					blobOffscreen
				})
			)
		}</div>
		<div class="help" title="CanvasRenderingContext2D.measureText()">textMetrics: ${
			!textMetrics ? note.blocked : getSum(Object.keys(textMetrics).map(key => textMetrics[key] || 0)) || note.blocked
		}</div>
		<div class="help" title="CanvasRenderingContext2D.getImageData()">pixel trap: ${rgba ? `${modPercent}% rgba noise ${rgbaHTML}` : ''}</div>
		<div class="icon-container pixels">
			<div class="icon-item pixel-image-random"></div>
			${rgba ? `<div class="icon-item pixel-image"></div>` : ''}
		</div>
	</div>
	`
	};

	const pnames = new Set([
		'BLEND_EQUATION',
		'BLEND_EQUATION_RGB',
		'BLEND_EQUATION_ALPHA',
		'BLEND_DST_RGB',
		'BLEND_SRC_RGB',
		'BLEND_DST_ALPHA',
		'BLEND_SRC_ALPHA',
		'BLEND_COLOR',
		'CULL_FACE',
		'BLEND',
		'DITHER',
		'STENCIL_TEST',
		'DEPTH_TEST',
		'SCISSOR_TEST',
		'POLYGON_OFFSET_FILL',
		'SAMPLE_ALPHA_TO_COVERAGE',
		'SAMPLE_COVERAGE',
		'LINE_WIDTH',
		'ALIASED_POINT_SIZE_RANGE',
		'ALIASED_LINE_WIDTH_RANGE',
		'CULL_FACE_MODE',
		'FRONT_FACE',
		'DEPTH_RANGE',
		'DEPTH_WRITEMASK',
		'DEPTH_CLEAR_VALUE',
		'DEPTH_FUNC',
		'STENCIL_CLEAR_VALUE',
		'STENCIL_FUNC',
		'STENCIL_FAIL',
		'STENCIL_PASS_DEPTH_FAIL',
		'STENCIL_PASS_DEPTH_PASS',
		'STENCIL_REF',
		'STENCIL_VALUE_MASK',
		'STENCIL_WRITEMASK',
		'STENCIL_BACK_FUNC',
		'STENCIL_BACK_FAIL',
		'STENCIL_BACK_PASS_DEPTH_FAIL',
		'STENCIL_BACK_PASS_DEPTH_PASS',
		'STENCIL_BACK_REF',
		'STENCIL_BACK_VALUE_MASK',
		'STENCIL_BACK_WRITEMASK',
		'VIEWPORT',
		'SCISSOR_BOX',
		'COLOR_CLEAR_VALUE',
		'COLOR_WRITEMASK',
		'UNPACK_ALIGNMENT',
		'PACK_ALIGNMENT',
		'MAX_TEXTURE_SIZE',
		'MAX_VIEWPORT_DIMS',
		'SUBPIXEL_BITS',
		'RED_BITS',
		'GREEN_BITS',
		'BLUE_BITS',
		'ALPHA_BITS',
		'DEPTH_BITS',
		'STENCIL_BITS',
		'POLYGON_OFFSET_UNITS',
		'POLYGON_OFFSET_FACTOR',
		'SAMPLE_BUFFERS',
		'SAMPLES',
		'SAMPLE_COVERAGE_VALUE',
		'SAMPLE_COVERAGE_INVERT',
		'COMPRESSED_TEXTURE_FORMATS',
		'GENERATE_MIPMAP_HINT',
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
		'ACTIVE_TEXTURE',
		'IMPLEMENTATION_COLOR_READ_TYPE',
		'IMPLEMENTATION_COLOR_READ_FORMAT',
		'MAX_RENDERBUFFER_SIZE',
		'UNPACK_FLIP_Y_WEBGL',
		'UNPACK_PREMULTIPLY_ALPHA_WEBGL',
		'UNPACK_COLORSPACE_CONVERSION_WEBGL',
		'READ_BUFFER',
		'UNPACK_ROW_LENGTH',
		'UNPACK_SKIP_ROWS',
		'UNPACK_SKIP_PIXELS',
		'PACK_ROW_LENGTH',
		'PACK_SKIP_ROWS',
		'PACK_SKIP_PIXELS',
		'UNPACK_SKIP_IMAGES',
		'UNPACK_IMAGE_HEIGHT',
		'MAX_3D_TEXTURE_SIZE',
		'MAX_ELEMENTS_VERTICES',
		'MAX_ELEMENTS_INDICES',
		'MAX_TEXTURE_LOD_BIAS',
		'MAX_DRAW_BUFFERS',
		'DRAW_BUFFER0',
		'DRAW_BUFFER1',
		'DRAW_BUFFER2',
		'DRAW_BUFFER3',
		'DRAW_BUFFER4',
		'DRAW_BUFFER5',
		'DRAW_BUFFER6',
		'DRAW_BUFFER7',
		'MAX_FRAGMENT_UNIFORM_COMPONENTS',
		'MAX_VERTEX_UNIFORM_COMPONENTS',
		'FRAGMENT_SHADER_DERIVATIVE_HINT',
		'MAX_ARRAY_TEXTURE_LAYERS',
		'MIN_PROGRAM_TEXEL_OFFSET',
		'MAX_PROGRAM_TEXEL_OFFSET',
		'MAX_VARYING_COMPONENTS',
		'MAX_TRANSFORM_FEEDBACK_SEPARATE_COMPONENTS',
		'RASTERIZER_DISCARD',
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
		'UNIFORM_BUFFER_OFFSET_ALIGNMENT',
		'MAX_VERTEX_OUTPUT_COMPONENTS',
		'MAX_FRAGMENT_INPUT_COMPONENTS',
		'MAX_SERVER_WAIT_TIMEOUT',
		'TRANSFORM_FEEDBACK_PAUSED',
		'TRANSFORM_FEEDBACK_ACTIVE',
		'MAX_ELEMENT_INDEX',
		'MAX_CLIENT_WAIT_TIMEOUT_WEBGL'
	]);

	const draw = gl => {
		//gl.clearColor(0.47, 0.7, 0.78, 1)
		gl.clear(gl.COLOR_BUFFER_BIT);

		// based on https://github.com/Valve/fingerprintjs2/blob/master/fingerprint2.js
		const vertexPosBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, vertexPosBuffer);
		const vertices = new Float32Array([-0.9, -0.7, 0, 0.8, -0.7, 0, 0, 0.5, 0]);
		gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

		vertexPosBuffer.itemSize = 3;
		vertexPosBuffer.numItems = 3;

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
		gl.linkProgram(program);
		gl.useProgram(program);
		program.vertexPosAttrib = gl.getAttribLocation(program, 'attrVertex');
		program.offsetUniform = gl.getUniformLocation(program, 'uniformOffset');
		gl.enableVertexAttribArray(program.vertexPosArray);
		gl.vertexAttribPointer(program.vertexPosAttrib, vertexPosBuffer.itemSize, gl.FLOAT, false, 0, 0);
		gl.uniform2f(program.offsetUniform, 1, 1);

		// draw
		gl.drawArrays(gl.LINE_LOOP, 0, vertexPosBuffer.numItems);

		return gl
	};

	const getCanvasWebgl = async imports => {

		const {
			require: {
				captureError,
				attempt,
				gibberish,
				sendToTrash,
				lieProps,
				phantomDarkness,
				dragonOfDeath,
				logTestResult
			}
		} = imports;

		try {
			const start = performance.now();
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
			if (dragonOfDeath &&
				dragonOfDeath.document.createElement('canvas').toDataURL() != document.createElement('canvas').toDataURL()) {
				lied = true;
			}

			// create canvas context
			const win = phantomDarkness ? phantomDarkness : window;
			const doc = win.document;
			let canvas, canvas2;
			if ('OffscreenCanvas' in window) {
				canvas = new win.OffscreenCanvas(256, 256);
				canvas2 = new win.OffscreenCanvas(256, 256);
			} else {
				canvas = doc.createElement('canvas');
				canvas2 = doc.createElement('canvas');
			}

			const getContext = (canvas, contextType) => {
				try {
					if (contextType == 'webgl2') {
						return (
							canvas.getContext('webgl2') ||
							canvas.getContext('experimental-webgl2')
						)
					}
					return (
						canvas.getContext('webgl') ||
						canvas.getContext('experimental-webgl') ||
						canvas.getContext('moz-webgl') ||
						canvas.getContext('webkit-3d')
					)
				}
				catch (error) {
					return
				}
			};
			const gl = getContext(canvas, 'webgl');
			const gl2 = getContext(canvas2, 'webgl2');
			if (!gl) {
				logTestResult({ test: 'webgl', passed: false });
				return
			}

			// helpers
			const getShaderPrecisionFormat = (gl, shaderType) => {
				if (!gl) {
					return
				}
				const LOW_FLOAT = attempt(() => gl.getShaderPrecisionFormat(gl[shaderType], gl.LOW_FLOAT));
				const MEDIUM_FLOAT = attempt(() => gl.getShaderPrecisionFormat(gl[shaderType], gl.MEDIUM_FLOAT));
				const HIGH_FLOAT = attempt(() => gl.getShaderPrecisionFormat(gl[shaderType], gl.HIGH_FLOAT));
				const HIGH_INT = attempt(() => gl.getShaderPrecisionFormat(gl[shaderType], gl.HIGH_INT));
				return {
					LOW_FLOAT,
					MEDIUM_FLOAT,
					HIGH_FLOAT,
					HIGH_INT
				}
			};

			const getShaderData = (name, shader) => {
				const data = {};
				for (const prop in shader) {
					const obj = shader[prop];
					data[name + '.' + prop + '.precision'] = obj ? attempt(() => obj.precision) : undefined;
					data[name + '.' + prop + '.rangeMax'] = obj ? attempt(() => obj.rangeMax) : undefined;
					data[name + '.' + prop + '.rangeMin'] = obj ? attempt(() => obj.rangeMin) : undefined;
				}
				return data
			};

			const getMaxAnisotropy = gl => {
				if (!gl) {
					return
				}
				const ext = (
					gl.getExtension('EXT_texture_filter_anisotropic') ||
					gl.getExtension('MOZ_EXT_texture_filter_anisotropic') ||
					gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic')
				);
				return ext ? gl.getParameter(ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT) : undefined
			};

			const getParams = gl => {
				if (!gl) {
					return {}
				}
				const data = Object
					.getOwnPropertyNames(Object.getPrototypeOf(gl))
					//.filter(prop => prop.toUpperCase() == prop) // global test
					.filter(name => pnames.has(name))
					.reduce((acc, name) => {
						let val = gl.getParameter(gl[name]);
						if (!!val && 'buffer' in Object.getPrototypeOf(val)) {
							acc[name] = [...val];
						} else {
							acc[name] = val;
						}
						return acc
					}, {});
				return data
			};

			const getUnmasked = gl => {
				const ext = !!gl ? gl.getExtension('WEBGL_debug_renderer_info') : null;
				if (!ext) {
					return {}
				}
				const UNMASKED_VENDOR_WEBGL = gl.getParameter(ext.UNMASKED_VENDOR_WEBGL);
				const UNMASKED_RENDERER_WEBGL = gl.getParameter(ext.UNMASKED_RENDERER_WEBGL);
				const vendorGibbers = gibberish(UNMASKED_VENDOR_WEBGL);
				const rendererGibbers = gibberish(UNMASKED_RENDERER_WEBGL);
				const { name } = Object.getPrototypeOf(gl).constructor;
				if (vendorGibbers.length) {
					sendToTrash(`${name} vendor is gibberish`, `[${vendorGibbers.join(', ')}] ${UNMASKED_VENDOR_WEBGL}`);
				}
				if (rendererGibbers.length) {
					sendToTrash(`${name} renderer is gibberish`, `[${rendererGibbers.join(', ')}] ${UNMASKED_RENDERER_WEBGL}`);
				}
				return {
					UNMASKED_VENDOR_WEBGL,
					UNMASKED_RENDERER_WEBGL
				}
			};

			const getSupportedExtensions = gl => {
				if (!gl) {
					return []
				}
				const ext = attempt(() => gl.getSupportedExtensions());
				if (!ext) {
					return []
				}
				return ext
			};

			const getDataURI = contextType => {
				try {
					const canvas = doc.createElement('canvas');
					const gl = getContext(canvas, contextType);
					draw(gl);
					return canvas.toDataURL()
				}
				catch (error) {
					return
				}
			};

			const getPixels = gl => {
				if (!gl) {
					return []
				}
				const width = gl.drawingBufferWidth;
				const height = gl.drawingBufferHeight;
				try {
					draw(gl);
					const pixels = new Uint8Array(width * height * 4);
					gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
					return [...pixels]
				}
				catch (error) {
					return []
				}
			};

			// get data
			const params = { ...getParams(gl), ...getUnmasked(gl) };
			const params2 = { ...getParams(gl2), ...getUnmasked(gl2) };
			const mismatch = Object.keys(params2)
				.filter(key => !!params[key] && '' + params[key] != '' + params2[key])
				.toString()
				.replace('SHADING_LANGUAGE_VERSION,VERSION', '');
			if (mismatch) {
				sendToTrash('webgl/webgl2 mirrored params mismatch', mismatch);
			}

			const data = {
				extensions: [...getSupportedExtensions(gl), ...getSupportedExtensions(gl2)],
				pixels: getPixels(gl),
				pixels2: getPixels(gl2),
				dataURI: getDataURI('webgl'),
				dataURI2: getDataURI('webgl2'),
				parameters: {
					...{ ...params, ...params2 },
					...{
						antialias: gl.getContextAttributes() ? gl.getContextAttributes().antialias : undefined,
						MAX_VIEWPORT_DIMS: attempt(() => [...gl.getParameter(gl.MAX_VIEWPORT_DIMS)]),
						MAX_TEXTURE_MAX_ANISOTROPY_EXT: getMaxAnisotropy(gl),
						...getShaderData('VERTEX_SHADER', getShaderPrecisionFormat(gl, 'VERTEX_SHADER')),
						...getShaderData('FRAGMENT_SHADER', getShaderPrecisionFormat(gl, 'FRAGMENT_SHADER')),
						MAX_DRAW_BUFFERS_WEBGL: attempt(() => {
							const buffers = gl.getExtension('WEBGL_draw_buffers');
							return buffers ? gl.getParameter(buffers.MAX_DRAW_BUFFERS_WEBGL) : undefined
						})
					}
				},
				lied
			};

			logTestResult({ start, test: 'webgl', passed: true });
			return { ...data }
		}
		catch (error) {
			logTestResult({ test: 'webgl', passed: false });
			captureError(error);
			return
		}
	};

	const webglHTML = ({ fp, note, count, modal, hashMini, hashSlice }) => {
		if (!fp.canvasWebgl) {
			return `
		<div class="col-four undefined">
			<strong>WebGL</strong>
			<div>images: ${note.blocked}</div>
			<div>pixels: ${note.blocked}</div>
			<div>params (0): ${note.blocked}</div>
			<div>exts (0): ${note.blocked}</div>
		</div>
		<div class="col-four undefined">
			<div>unmasked renderer:</div>
			<div class="block-text">${note.blocked}</div>
		</div>
		<div class="col-four undefined"><image /></div>`
		}
		const { canvasWebgl: data } = fp;
		const id = 'creep-canvas-webgl';
		
		const {
			$hash,
			dataURI,
			dataURI2,
			pixels,
			pixels2,
			lied,
			extensions,
			parameters
		} = data;
		
		const paramKeys = parameters ? Object.keys(parameters).sort() : [];
		return `
	<div class="col-four${lied ? ' rejected' : ''}">
		<strong>WebGL</strong><span class="${lied ? 'lies ' : ''}hash">${hashSlice($hash)}</span>
		<div>images:${
			!dataURI ? ' '+note.blocked : `<span class="sub-hash">${hashMini(dataURI)}</span>${!dataURI2 || dataURI == dataURI2 ? '' : `<span class="sub-hash">${hashMini(dataURI2)}</span>`}`
		}</div>
		<div>pixels:${
			!pixels ? ' '+note.unsupported : `<span class="sub-hash">${hashSlice(pixels)}</span>${!pixels2 || pixels == pixels2 ? '' : `<span class="sub-hash">${hashSlice(pixels2)}</span>`}`
		}</div>
		<div>params (${count(paramKeys)}): ${
			!paramKeys.length ? note.unsupported :
			modal(
				`${id}-parameters`,
				paramKeys.map(key => `${key}: ${parameters[key]}`).join('<br>'),
				hashMini(parameters)
			)
		}</div>
		<div>exts (${count(extensions)}): ${
			!extensions.length ? note.unsupported : 
			modal(
				`${id}-extensions`,
				extensions.sort().join('<br>'),
				hashMini(extensions)
			)
		}</div>
	</div>
	<div class="col-four${lied ? ' rejected' : ''}">
		<div>unmasked renderer:</div>
		<div class="block-text">
			<div>${
				!parameters.UNMASKED_RENDERER_WEBGL ? note.unsupported :
				parameters.UNMASKED_RENDERER_WEBGL
			}</div>	
		</div>
	</div>
	<div class="col-four${lied ? ' rejected' : ''}"><image ${!dataURI ? '' : `width="100%" src="${dataURI}"`}/></div>
	`
	};

	const computeStyle = (type, { require: [captureError] }) => {
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
			const proto = Object.getPrototypeOf(cssStyleDeclaration);
			const prototypeProperties = Object.getOwnPropertyNames(proto);
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
			const interfaceName = ('' + proto).match(/\[object (.+)\]/)[1];

			return { keys, interfaceName }
		}
		catch (error) {
			captureError(error);
			return
		}
	};

	const getSystemStyles = (instanceId, { require: [captureError, parentPhantom] }) => {
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

			let rendered;
			if (!parentPhantom) {
				const id = 'creep-system-styles';
				const el = document.createElement('div');
				el.setAttribute('id', id);
				document.body.append(el);
				rendered = document.getElementById(id);
			}
			else {
				rendered = parentPhantom;
			}
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
				const computedStyle = getComputedStyle(rendered);
				system.fonts.push({
					[font]: `${computedStyle.fontSize} ${computedStyle.fontFamily}`
				});
			});

			if (!parentPhantom) {
				rendered.parentNode.removeChild(rendered);
			}
			return { ...system }
		}
		catch (error) {
			captureError(error);
			return
		}
	};

	const getCSS = async imports => {

		const {
			require: {
				instanceId,
				captureError,
				logTestResult,
				parentPhantom
			}
		} = imports;

		try {
			const start = performance.now();
			const computedStyle = computeStyle('getComputedStyle', { require: [captureError] });
			const system = getSystemStyles(instanceId, { require: [captureError, parentPhantom] });
			logTestResult({ start, test: 'computed style', passed: true });
			return {
				computedStyle,
				system
			}
		}
		catch (error) {
			logTestResult({ test: 'computed style', passed: false });
			captureError(error);
			return
		}
	};

	const cssHTML = ({ fp, modal, note, hashMini, hashSlice, count }, systemHash) => {
		if (!fp.css) {
			return `
		<div class="col-six undefined">
			<strong>Computed Style</strong>
			<div>keys (0): ${note.blocked}</div>
			<div>system styles: ${note.blocked}</div>
			<div>0% of samples</div>
			<div>0% of class</div>
			<div>engine: ${note.blocked}</div>
			<div class="gradient"></div>
		</div>`
		}
		const {
			css: data
		} = fp;
		const {
			$hash,
			computedStyle,
			system
		} = data;

		const decryptionData = {"Blink":[{"id":"013c0160adca29684f755e203285ce1aff241c07e420c6660ac66675429a75eb","systems":["Windows"]},{"id":"04f41c67ab3c46b65c7378d7d7843bc1ad3bcb28c9df511718a5b7d52df249ae","systems":["Windows"]},{"id":"05fab64d19db34c7cfaac471a4ea82a2ed34ce9e87e17fd80006f349947374c6","systems":["Windows"]},{"id":"11d7d24270bbfc474513923f710e9f06b802c79f217f0994f25a68fdbaee182b","systems":["Windows"]},{"id":"12abd9597150c09377ebe91955dfb7e2ad2b95e38a66ba9999d908f7171fc333","systems":["Windows"]},{"id":"154d3ceb4889872b74b8e88acfc44c2249563bb50adbf69b574a59304bfd11df","systems":["Windows"]},{"id":"162439465e1a944d38a32f83ca0f237af294d7a3b6348aec31fd5dd640e92830","systems":["Mac"]},{"id":"1743ccffdfeda34030a5d48201d3d37c5346779948a674d90d20164fd30b4e72","systems":["Windows"]},{"id":"1acfa2d58285503e194a0fe6a8294fdbe7a369e2bf50689dde2ee776b93b6347","systems":["Windows"]},{"id":"1b804e05f05337dffacd38446551d39a992683fa7529195b462b503f1de7b30c","systems":["Windows"]},{"id":"1e04904e57be4cfa91615be295c09e7211e056ffef413409009cea0105f93286","systems":["Windows"]},{"id":"1e123a6623b800ac952c0aac14ed5be812a232fa0807426171e9dde6b5c6551b","systems":["Windows"]},{"id":"2166380977aa0c3b75ccf948478c8c84881f627d8a426466a96304f16970033a","systems":["Windows"]},{"id":"248230a91305a10712f9db24bd223a516044244dcc4fa788a2d91b9c8ac93a1f","systems":["Windows"]},{"id":"273853d3b8193e0285cd4bb2e0f6d80005acdd74acb8eccd31a8c330e32547ac","systems":["Windows"]},{"id":"288d80fe6b85835cd6ab4c2938e3415f2514b6cb6aedb54d4c6c1e6f3f1b4a1e","systems":["Windows"]},{"id":"2bf550a2a8a49f9b9bbdf9ead7277b75dd43eefaf640a48f47d97bb64c4063b8","systems":["Windows"]},{"id":"32b90161a99135faac926500157825ab01348e1b0280ecc16900fa02038c665b","systems":["Mac"]},{"id":"35210f565f315034b9e4bade4fde708285e320d1680258b7b467319b6850cdb6","systems":["Windows"]},{"id":"355f97dc7e82e3a1b59f4a68a4495d9a18f23cfe2873dda4f1fc1dd110578473","systems":["Android"]},{"id":"372e054e1dfda2a3c50f206b649d3b99f91339db0fbd05b9bbb49e2975f61607","systems":["Windows"]},{"id":"3d8d6e216762a6d91269984af37051da7902e976347be0f0d158bb1cefdc045b","systems":["Windows"]},{"id":"3e3cb7b1a91331f6ee6e22fa38953e1e5c62908ec8f0433c3a2f217528890ad4","systems":["Windows"]},{"id":"3e453a17812b15f9ba73d4bdd5a823014d7dfb39f42844cc570a2019d41c84ed","systems":["Windows"]},{"id":"3f01de645b91fcf50dd49b1e1498a219f9b24bae42718f2836cd33725e131f85","systems":["Android"]},{"id":"3f8500f11525e3f600e2b14bda60fa818cc7b59e7e27c5bd4a8c38532603ecc1","systems":["Windows"]},{"id":"407a41ef0628bcd3b6b67bcbb0481e00d45c8df1156ab9731d26362955446292","systems":["Windows"]},{"id":"44a6a8d00f526729bf0ef8faef8aa472c1b113d9e54ee386bc8707ae08053b7a","systems":["Mac"]},{"id":"46b9c67ed7354d83267c1db83ccd4afbe48396c24d667efbd86096246302710c","systems":["Windows"]},{"id":"4ac49f9ed67420600f4ee8021f36886b7457f498a0ba024df950ccd7c52f69ce","systems":["Windows"]},{"id":"4b86e79267162ea7bf42e89eb16d7bf3764d215d6154902c5315a17635e55dd9","systems":["Windows"]},{"id":"4cc32754d0ff875bd9a8cea287282aad11cf506cb5f3ab7cf0a4163f14ceff96","systems":["Windows"]},{"id":"4ce0710f58dd630ff590629adca99037d8caacd89836dadfd56a57ecd42d0e2b","systems":["Windows"]},{"id":"586c459e7e58921e7fc8d5dc134226c7b12326c0a260a0a2e5048f30e1462631","systems":["Android"]},{"id":"5b8594738a09c7e3d4d0e8fae08dde68ced5625084d4fd11878efe306fa11222","systems":["Windows"]},{"id":"5d139c453718139140f031160fd31e1ab0c628654c60e30e43f20ba092473309","systems":["Windows"]},{"id":"5d670a4deffaf5dfa268b3936285ff937ab5389b17da3ef71203664420dc03da","systems":["Windows"]},{"id":"61e4b52ace331051e7319fb48e131bf3a160c906baea169b1781e327ae25af55","systems":["Linux"]},{"id":"64d947b53a3916d86c6546e3fe4570b64203bc48a984bd175adc19c55e0de234","systems":["Windows"]},{"id":"65c1185fbc1fb4c35d38016eec07512f5e72fdeabc832e9b3ffc54f4e307b4d3","systems":["Windows"]},{"id":"65fe5bced08bc5fff3aa5df9c1144f1f14d0d85f4b74a7f98f719a6584fc688e","systems":["Windows"]},{"id":"6711a04a40ced57636eefba840d1b609706d05e35f63b21eee057137f6b39716","systems":["Windows"]},{"id":"675c4c651a328f2fa66f36e56fad204581f44713e000f82a0c58850af3d79cc3","systems":["Windows"]},{"id":"69c9381f91ac7330773b9b2800748d0c22f406cab57e455d6a16d5e95999c7a8","systems":["Mac"]},{"id":"69e3a700c40887b8517a6aaf5ed10197d834e34b31c0b57cd28be9aa6ac0dd36","systems":["Windows"]},{"id":"6a5434a6c4d7a05ed2bc15b1f0c45b8d58afa60070050408c74282e03e5d189a","systems":["Chrome OS"]},{"id":"6a74f7a6bf5bf1165ad6eff578c547023c7936ea955369bba5b5287b89d80aea","systems":["Windows"]},{"id":"6bc3526e9d7b3e520d7023bc44fd0f98c3714e94ee989715f4134873b9c7f3c4","systems":["Windows"]},{"id":"730331615c2ed47bf27467e9c0d9bdb68a83c26cd74641b8700feb7e1775a05c","systems":["Windows"]},{"id":"748a6bcca5e740b98dac69a1ad1ad5be47464ab1b9f40a91e5281e0319510c26","systems":["Windows"]},{"id":"75b4691f0e13da37d1b96df4f74f573410a1cc4bf20885992d4a73144769a9d1","systems":["Windows"]},{"id":"763df65a345c1f1002d2e692e8f1697326efddb11216882d024573a77620d135","systems":["Windows"]},{"id":"792a40229d7be97a966290f62cb3ff1a6db8108ebd7b8b5551e29b32b7f37875","systems":["Windows"]},{"id":"79ce14712ef2de768af6d3aed6376dc6390e5790b6ee9cd69e7750de822e2555","systems":["Windows"]},{"id":"7d1d7fcb537329e8fc28d2ce49cddc2c8bec6a35737fb45ccf2452359afb526f","systems":["Windows"]},{"id":"7d7d92b7fa5b9d18273bf00084bc818102f9cf4cdd85d427faf80eac88695ac4","systems":["Windows"]},{"id":"7f2bc834891039f77f623e352a1ce180a95dcf460687023033b200376fba6385","systems":["Windows"]},{"id":"808c71a02197db26dc1fee518cafbaccd301a69d038deaae8d1d0123d3931a09","systems":["Windows"]},{"id":"80f40d30b0cf33da69f5261a169760b4115fa978e66ba7ac399db5b1415ede37","systems":["Windows"]},{"id":"85c71128195570a3fa2251710552b4e0c0b129c5e7b9f0730248aae3070151e2","systems":["Windows"]},{"id":"85cfd7ab33d9da45cd123a78accbb22a1941ac25e3fad14a8852be32e51278b5","systems":["Mac"]},{"id":"889758b96b723e3b17493ff8f6b92d0ddc8d9937bad447c9c19fb0e9a7836ac1","systems":["Linux"]},{"id":"9141c51cda1f52903322e3d83c97996798af8b497fb2c67c489a4e003e5cc6b0","systems":["Windows"]},{"id":"93e2a61504a0ef1b8943c3a639bcfafba8e0b29f83c7c8f9c48a27117e8f22e5","systems":["Windows"]},{"id":"94167144875dedb723275ba0befdeee8410185b37fa888e80cc290aec256b871","systems":["Linux"]},{"id":"96b5b122748ae095789f42e18d2eb56042b8af90d336af391dd3ac94162b8b99","systems":["Mac"]},{"id":"96bac787238d93810ae8634616f1401b186d98df0386cd7b239c291040409978","systems":["Windows"]},{"id":"977b8274804ffd265012a06f9dfe20a91e880fac71366600733c1bbedeed97eb","systems":["Mac"]},{"id":"9824ae5ab89f8388da0ad7826d099febe85ef38d01fd622fdb603b186b194b31","systems":["Windows"]},{"id":"9aad2389fb23f244ad7564f0440eecdbb7261929d8cc06d7168a53830ec70137","systems":["Windows"]},{"id":"9d961b553ce82699d1a79542e673069fc429e15631b2274f85cfcda307adc109","systems":["Windows"]},{"id":"a09d59618259292f23c31673f473c0fe43fa3a17b84a792bd5ccac9b63e37b17","systems":["Windows"]},{"id":"a122bca93de16ce6aa2d840b8f02c5ee89e7f64f166d52821a8adea0637ece8f","systems":["Windows"]},{"id":"a339743de10ba90e5c8ecaa2e5cecc8971b84f190f98851ec7505e9d943e1a59","systems":["Android","Chrome OS","Windows"]},{"id":"a45a696769813c1701a7439ee2f922377c6f8b5f4e656efbbd526490750ff3ab","systems":["Windows"]},{"id":"aa6ea4084d4c4d81b1dddaa1771f174571b2d22a0438c5777fe01e2c6b4e490c","systems":["Mac"]},{"id":"ac806fb7f882f5e01b6c560b1f155bee4be0b280f99488523f9d090096386975","systems":["Windows"]},{"id":"b434261f418fb6565725bde5521ff081683d34a63c98fbd4f2229df74d2beb1e","systems":["Windows"]},{"id":"b4800bd4140ad737df750c275dd4dd5380d77e955ef9a50a42641ae43734e513","systems":["Windows"]},{"id":"b53b9a74ab9e08aa42ffe7c1e7be9132e257545d98b84b871fac1136f4576465","systems":["Mac"]},{"id":"b6b3017109fde67cbfbf3825ce9b3d4cd65c41083beba6eae6d6908c8d8290d5","systems":["Windows"]},{"id":"ba5bc7e25f3dc3b5a925ac7d51ec27f2830819ef2571166ea279476d8894375d","systems":["Windows"]},{"id":"bbaf1265f141a369ccfdc24c8d9f97f54a13f8be50d7533423501955c90f5d76","systems":["Android"]},{"id":"bbe7bb28abe2325e562049acaacea957b7a110268c43df244ddcb5b6ee9d9c2c","systems":["Windows"]},{"id":"bd3accae17d807463db1d46ce22e43e46ec7dd59409a50cbf1cfe870e30d511f","systems":["Windows"]},{"id":"bfc41024a0214fdbdbf65f1914445e3b7becf93efd8f5115f6abcfc03aca208d","systems":["Windows"]},{"id":"c16a5ae83a7e7b5ff35829d5f1ca821f96b0729718ec2aac659f5f9ba5977ff5","systems":["Android"]},{"id":"c39e98e77291e026c1149e4c8e37f6f6dfad3eca307f27dcf0e6b78679098ad3","systems":["Windows"]},{"id":"c3e157e7b0fea9573d467a0b8cf92d5f7f010010884529bea0785635461d5809","systems":["Linux"]},{"id":"c8dad5770d2f8d9df7aef11ecda1ec428a02ef1f5f8c0006b1f6ce80fe0fb843","systems":["Mac"]},{"id":"cc5354bedb7908e1d7409338f7bf71a952d4618d31724fc542993d72868bf06d","systems":["Windows"]},{"id":"cdb4f586e7a3287560032c7c9d37f5060a3b702130ecf29cb827eb93083c4b78","systems":["Windows"]},{"id":"cf30c795a2f2ace81acf51b77ea26736d6c15115b14ca4fdd4c8ca9622ed0a2c","systems":["Windows"]},{"id":"d319e43d23184458d61c4fff1f2136b0ac1ea18535732b5e9e0f7e0f3a2c0601","systems":["Windows"]},{"id":"d460a00a6ec7720591c4311c00694ab587be0a6c4e474db6ac6c9c04dff20b1e","systems":["Windows"]},{"id":"d5506af3d9e903302032974af1c7c23420a92e433c84e534de85545ea40d7080","systems":["Windows"]},{"id":"d7225f5e25025634ada3e6f78e3060d6311bf2e471061aeea18af03538db7660","systems":["Windows"]},{"id":"d83422a0d71aa569c7a83d457a692a5dbaf1d4b60a1b0028da9af06da131e4e6","systems":["Windows"]},{"id":"d86146bf0f3f2b560df22e365350ba498f6e0d5bf94fb5a3cd42bf8b022de1bd","systems":["Android"]},{"id":"d878485870f3cb1fb0342ede9ecb725ed743e5649f7efb02ddd93851a8de8ec8","systems":["Windows"]},{"id":"db49ec7a772f1294f34a9cd6840de6c9d8307a1f04ad1dfee7c218408dd8918d","systems":["Mac"]},{"id":"db5672aabe72cf38de1995692989d65b466bfbc7845df8c30cd8a874dc1488fd","systems":["Mac"]},{"id":"e6c241f17e6b6551672fc21624d2b53079f1a162daee7873db4cf948f65c4957","systems":["Windows"]},{"id":"e6ecb4d28d1325d9feed93310579cfa6c949b41f4c1866964e2fc886c05019eb","systems":["Windows"]},{"id":"eac84f0fcb9223cebc29a6153a35fc467fdec97c3fcbf729a026df098ce63678","systems":["Windows"]},{"id":"eb177350b248c0b1e43ed5808beaf5b1388c38826d0de54a887e48cc19b762c0","systems":["Windows"]},{"id":"edbed37ed249a72d8929829f04640767f6d2fcd51cc435680eebb07debc53508","systems":["Windows"]},{"id":"eebcbef1ddfebb64e3b47a5ac1b8753f389f7a4731971f92d3496c00a2a1510b","systems":["Windows"]},{"id":"f4cc633c63e9319d045dfc029f9d7d784d8d5b0bcb8620a23d3585c75482c2ed","systems":["Windows"]},{"id":"f69b0dc8f17fd4efbb8a641388f4f4e4dab42b517f5356f5578140ff2b6e78f7","systems":["Windows"]},{"id":"f7e618de96d955e6b5d86cf61846a8ebd558926d7e2decf4eceb09239e3a894b","systems":["Windows"]},{"id":"f950eb315e22109982dcb7bcd26f83a33260c18f26461d86824bc186e2bae9e5","systems":["Windows"]},{"id":"fbb7cea45822e4f62db42a81db5a4b84882cfa15d1224dd906cd1b8315f3077d","systems":["Windows"]},{"id":"fbef88ea634e95d5cc773aadac1844444a3ccb40e38c2422ce2aec38717e615c","systems":["Windows"]}],"Gecko":[{"id":"01bb5ef28c6f2c5ef00cea6f143de3d139ea7bcdf21a0c603046fdba897997f3","systems":["Linux"]},{"id":"035f2ff4e42abd5c5e4c65cabfe5eacfb7596bc56bd7bf538978c9810b6b0f2b","systems":["Windows"]},{"id":"043b39165047d137bb61cc649e0fd47bc1b48f02507cfdd697f2f0f55f632f0b","systems":["Android"]},{"id":"047773f3d0ce9a992450c4e4fc07f6feb603f1cfb0c3e212fd62743bc30132eb","systems":["Mac"]},{"id":"04e248a39cda2fe07bfdacf409931a32cbc009e04f2076d3e222362195905674","systems":["Linux"]},{"id":"070cf8e32af542f68862c54ad93087e5c7a488f65a9d88a7b78fcdac6e31c321","systems":["Linux"]},{"id":"08ab46a0fa4799e4134f963614bf81e903d59afe82e77eece8e22af7175ab946","systems":["Mac"]},{"id":"08eae800aecc75045fcc0062a8bcc60433ca723fd045950e296d0c21c07085d3","systems":["Windows"]},{"id":"0a0886b73a51bc2e3ac0ca22e142eb8921dab513df19f4f848dea411587067a9","systems":["Linux"]},{"id":"0b9c7a43e5fbdd80ec698730252eaef6fc32a155c18a1f78b88315d478316cf7","systems":["Windows"]},{"id":"0bcbe7c0e7375e13af1d97c77eab842479b49060f2b42a3b4d561b266438b540","systems":["Linux"]},{"id":"0d916638110d07a9e266deaa838c7cd50a853bf55712992d1be06e18a728d52e","systems":["Windows"]},{"id":"0e6b6cb76fe5ef4e2b1a948b0cf1832768090d3f4fa352c4fcd50e34ea257e03","systems":["Windows"]},{"id":"142d47389cd14acb71d5e85e259fd4cd88d43418cbbc9d133f442390b7c916e6","systems":["Linux"]},{"id":"160f2cc145e14f8b346db2fa50dcdfb21737947f5b46a1984a4f92d7f4d285da","systems":["Linux"]},{"id":"1b2beaeb36e01d7f811a89a368a63c1d816d074bd709c5c8363a3e57c4ad9ed1","systems":["Android"]},{"id":"1f827aa69ed1f016d6f9d7dc08fe4847a9d325ad9ff8fdb739f5eed7ae61665e","systems":["Linux"]},{"id":"2000e11615aa358fa36b3cce333329f3809d43c1a502a05c0b4a2a9ff96b73c8","systems":["Mac"]},{"id":"209d7fdb4839c6c4bb1ff7a14a290913cf0e3b163cdc93c3e91eea6a7f194b9e","systems":["Mac"]},{"id":"23bd327a463aa467c01b3ad716625098537b59860b1098c88341d47cb06a95ab","systems":["Windows"]},{"id":"247031281434f088f325f1ce330b1d34a03bff8223010f61d46b12c97eff24c2","systems":["Windows"]},{"id":"27007c9a3d858ca77bedab60098f1b3416ab6fd4588f0898fd0ce1504dc66831","systems":["Windows"]},{"id":"27a750044491de4f97b0349c279847fbb57862bd4c8cdbb606e99787e40bf457","systems":["Windows"]},{"id":"29ee4de348ef4f013f7975dbe73273f6c588f423d7d4ad0c18a257bd36e10819","systems":["Windows"]},{"id":"2c14a479a570406c812695c881443d87b7cf19f82e3e5a95ca905cb3a8d88d1d","systems":["Windows"]},{"id":"30e1aae486b1a61ae3a66fddc97ff467749ec656886c5b7c49dd71dd2adc17a3","systems":["Windows"]},{"id":"311457ae92794280fbc64fe606ebc1cfa101cc6df014ca0aeef738881e001bcd","systems":["Android"]},{"id":"33c9b35cc5314e116fab69d209ef8c6587d72235f456fc9eb08ffac829de10fa","systems":["Mac"]},{"id":"35b1e320ae27f3afaf18216cb939fe7236e7d5ffac4fbc90111a4d1d1ca6d8ea","systems":["Windows"]},{"id":"3676ce7420b5f2563c0a9d9b5af606629c4f375bdb95d139840712a2b2541728","systems":["Mac"]},{"id":"38b46e11eb3c1c698f3382937783a99b72f55f37958237fdfbc80ccded3c2f30","systems":["Android"]},{"id":"39e4ff575009aa7cc7e399426f7e132d76ac581d66ef1c3b82c23d6e42903ffb","systems":["Mac"]},{"id":"3d2c34578a0fc827a0923110a2b53203f1b3dcfb78a1a7a62ed28154a5e002a8","systems":["Mac"]},{"id":"413da38b4e5d4fb854b02d9bf81fc8193263264ca5e7dc559bed9d543944e1c7","systems":["Mac"]},{"id":"426300eb3654987988da3d36e65fed0a6eca001457efbda1733e30da717aa2e4","systems":["Linux","Mac","Windows"]},{"id":"44f918b47e1bf5b0d5d7279594304098ac4272d71758711e033a6e21db24703e","systems":["Windows"]},{"id":"452831b196f11392b6f4204bc54d412a8f4a8ee14d4b04567153c19aba8c6e0c","systems":["Mac"]},{"id":"477f13dd268a54843f118c70bab0c4a8362263b139fd1b63c39832a8d6ea24c4","systems":["Android"]},{"id":"47da0a3bbc77d088bddcc7529e5a40bc936358db12a59036967e693ea7446b98","systems":["Windows"]},{"id":"49b42b844b10f49bab7a702fc7d809823cacade860fc899a36e6e8f4db1b41f1","systems":["Mac"]},{"id":"4a66f2d42762cc63743587b6926f84c1ce60d397451a5f3d2f7c0d89819a2bf0","systems":["Linux"]},{"id":"4e7a94afbd7e4014ad78b965ddbc7ce31f85c68ba9bdf5b13d40115deedc3048","systems":["Linux"]},{"id":"4f33d6efd5414f0877c302f5a4b2449cccbdffe7aad5c72ebf70cae142257271","systems":["Windows"]},{"id":"4f6907c97b4285e2019de635ed562949c3c0a40d2d744ca0179a952ff03bc936","systems":["Linux"]},{"id":"5334fa44629998a55ef8f88b73aefafaa28d956c648a17254bba5bfb71e9c27a","systems":["Linux"]},{"id":"53f28da13b752e75f870b794355d05d9ac1b71faf81fb1aebc01a6907bbe3592","systems":["Mac"]},{"id":"5434ec81b31725a3eb545a2a316d622fe78353823877fda0bc4f444297df1613","systems":["Linux"]},{"id":"561283c7962e5eb903bae18fe42d2e984527e77af7aeaa09bf67c4fa98d1d4ab","systems":["Windows"]},{"id":"56ad87bbb6e1c59cb76ba0a60816383f476fca1768e39be6b1f43e3db3014b37","systems":["Windows"]},{"id":"5e2e1d5f387ffa620904b847b1bde9b8ff2089e9a646721583eab3b23b77a344","systems":["Windows"]},{"id":"5ec65d4c1c947f6ff7309ea1956a1bc3a09ed85d4ed584664375253689be18bb","systems":["Linux"]},{"id":"5f5bf68646661a39e99288602305e78959b16673938cb8276561ef7de7c34548","systems":["Linux"]},{"id":"602a19bcc3696f4ad353846f2ab9c168926f198913a163a967fbdedabb0ee5fc","systems":["Mac"]},{"id":"620b6b2bf61cdc1f48515041b087caa66c67a493b725268706c5e83cb293bfdf","systems":["Windows"]},{"id":"621f6432312cbcaed644338708eb7b007b098e2cfb5e409cb1b9b2a2ff81a1fb","systems":["Linux"]},{"id":"6352bf925b329859fb89ec7828493b0f37f3656344fce981054963f0d4181e9c","systems":["Linux"]},{"id":"64e424c371a959cd1a694bed68c85a0e3649ba428af52e852da1516933de7404","systems":["Mac"]},{"id":"6781c4cf6efa7ba8cc0d8ea1baadb6f65fdc4b944387512714e74eeba6a9801a","systems":["Linux"]},{"id":"6935c7ba28f7f145c16e8c03d42bd9ecf3e3e790c4863ba4faa4bbdb8fea7728","systems":["Windows"]},{"id":"6a0eeed183e4eed5b50d59e23cf76a7cbccb0f7e278572e7308f8cd5c0e6bb84","systems":["Mac"]},{"id":"6a94edbc9acd00a5fd561f82fc07a39b3ae477631095ffb30691c1744973b74f","systems":["Windows"]},{"id":"720e1d4dcf4406608b36f33db50052a080aa9c1fc9005a07bd74203f39706ac9","systems":["Linux"]},{"id":"750d02f9d681f4c6ff47e93e0fea07945d22d4da926191eba2b549c8aa2736b3","systems":["Linux"]},{"id":"754716083870f316f533a98cf3c7be073d70635529cdf58bcb1851f9b55b517d","systems":["Windows"]},{"id":"7779ccc42ca43cd98480cd2715cc443940b3d092033c0c0762203817e51081c3","systems":["Mac"]},{"id":"77a47b89095a0b178d96d3a95d9e1614ca0a795f305f1792453266c1279a6c76","systems":["Linux"]},{"id":"7817c828ae19da2523166d487462b50d35dd9568f1c888c6a0c06406fc4e887d","systems":["Linux"]},{"id":"7903613ec8a8171a53a77f91afed1ca44cb2d5462fcae9ff2066fe74335b1d7e","systems":["Android"]},{"id":"7b2cbff5e2dfed1e612df8fedb6f7b423c1409317c795078aa5801fbc6357122","systems":["Windows"]},{"id":"7ba545c35eb399084f0a8f4ae2971018cc9c3dd30e7b0febbc55b17760de99fa","systems":["Linux"]},{"id":"7bfa0055ff81836bb5dcef022d7da33c18abd818f4825da9c2d3c9d896332911","systems":["Linux"]},{"id":"7fb7542b3cb2a5133c00cf8e803521f2dd452e8ab7ec1d15dd4ce33e9a99b076","systems":["Linux"]},{"id":"805457d2830699e7098b559f1a542074e4e939b529110f484004878f6cbf6757","systems":["Windows"]},{"id":"810a128a5e8a7d2e619a60e42b03473f57433f1774b181e2b270a69a1e79c816","systems":["Linux"]},{"id":"81ee4c30fffae2eef478b42c6a3f4b58019cd7518431b0ca32544f6be60e9ba8","systems":["Android"]},{"id":"839cd5e28e8f7c9895fd3307daf2995756b1d60379cb967ae5af4280a96c69f3","systems":["Windows"]},{"id":"8404d90c713e92ee7adda9c1103aa66e1b32ba881298da35bf629af0efc6d2b2","systems":["Linux"]},{"id":"8469500151e366bb816b455f56c5c783b8ae34dce6f58695ecf4e39c70bb753b","systems":["Linux"]},{"id":"898bf656be7423b47094d28221e14211b944d64888d76f531a5fe2636cc0e7fe","systems":["Windows"]},{"id":"8a904883c86807130a8f62d10304d446055f7d4d0f969341f684d5711a640e45","systems":["Linux"]},{"id":"8ccb2e934409777e6e0fad6c5119a79c5cadacee5cf1d78ec1d9bef2d0843eb4","systems":["Mac"]},{"id":"8dace8dfad2617a0c0c59956655e5bc76a34ad0585c2365c86a9be25529a7834","systems":["Linux"]},{"id":"8ead3abc53fe99b8b391ac951f6883060f2acccc3325aa56a84413921a3dfad3","systems":["Linux"]},{"id":"8f06235b76193c16c4b6df827426aa6b5363db970a3f40ef9e60c7192ae08386","systems":["Windows"]},{"id":"8f21a3fa392ea7825bc602972fcc2f0faf9f3462b7f75dcf622b0b63e6ddc270","systems":["Windows"]},{"id":"9019d638a729a42b32f3207507a27b24ebcd9b177589449c79fa0515c9bc8a4c","systems":["Mac"]},{"id":"92dae20c21b3998591ed77a11108019cfeaa536cb080a466df755a5cc600e0f1","systems":["Windows"]},{"id":"967577e55cff10c64940d87c029f81fc0a42e2d40636440fc8cc249af09c384c","systems":["Linux"]},{"id":"9769dd665cd36eb4423f9128ed84da8e88c83c83cfe48ee3541c1a672e28f720","systems":["Windows"]},{"id":"98b1b9c1defcc09b22a4d536a27336703db0be939dc6336c2fd7ae33affaff0a","systems":["Android"]},{"id":"99958c209c6468a0b904e75b65f295e4bef26bc5d2b1399fd5a871dc9ed792fb","systems":["Mac"]},{"id":"9ec3dbf6bc2957d04ef48ff710058b12e66afcf3752198929bf1a05f93926ef9","systems":["Linux"]},{"id":"a00242b393a93b80577ff3f17b10ed161ea3597dda51ffbab843eb35b3145efc","systems":["Android"]},{"id":"a0336f7579dd4ab45e92520f12c013866732d4b705b08e6320e9aca357ddf4e5","systems":["Windows"]},{"id":"a200db4ce5f2065d5f0ceb4353fea064d7a7839c9f24e650ba830d72692828bf","systems":["Linux"]},{"id":"a333527845579c00c538fc0132e394106ee475d38c52c0622f9171e9996f2456","systems":["Mac"]},{"id":"a3c40c1c214defead9527c6ebd708c8c2270248cff9d3df2d98e42447f01f308","systems":["Linux"]},{"id":"a6251a98782c6e81a9efc266ac6f385d610f82e5eb514ffa83699087b527a9cd","systems":["Windows"]},{"id":"aa53d8a84c157e9c523109433809889523597cfe67b68db56b321ec3c2ce84f3","systems":["Windows"]},{"id":"aa8024458d007671eaf80a58dc86203655e2472a4f3c0110fe7436e7c44a7d9e","systems":["Linux"]},{"id":"ab11e9d98faf5ab614d6c6b7b3d7728bf1523aae43317830502db887e0b69a63","systems":["Mac"]},{"id":"adb83c54da1309046d6309e98343f72309ebdc44c816518458b84bedb9fc8b52","systems":["Mac"]},{"id":"ae897a9bf25b426ed2bbf4921a54d6a33920631faf99a6681a7079701e1441d6","systems":["Windows"]},{"id":"b1949e0e4b6f52ef3130c493c73605e3ecc89417b50ea220fa2d639551de6db9","systems":["Windows"]},{"id":"b2bace6fa1073e37cfadaf58592a9297d01b9c9fc47cc442b2ff24b9471a7a58","systems":["Linux"]},{"id":"b330dc87a862c222d67a9f551c1ae3c2822478de03daf4a61bfe9ab711df592f","systems":["Windows"]},{"id":"b44b4785aa40c7aebc65d9c1731151cb9c6eed2904e8a0304aae490e07312f2b","systems":["Linux"]},{"id":"b4892ea141c9cdd55a13ae9fc67bb1691721e5345c74146b295cbcd3da5e1305","systems":["Windows"]},{"id":"b49510a6df75742991a2694fc934d77acbc9853c0790e095b45c7fd460bd53c5","systems":["Linux"]},{"id":"b5cb51f740cb5d45863856156531fd071b5655727337973d0eb196c0d0c19bba","systems":["Linux"]},{"id":"b775db35dc50ecc2f701d336b1ef1d89239e743dbef67a6571fd5da62c0fd9da","systems":["Windows"]},{"id":"b8fe170eb8668ecf8240d2ee293d21f63d8b9af6e65eef9e7a527b02d7427221","systems":["Windows"]},{"id":"b95260b424d8646e0591cc0f6e00c9bbb2f22a53c908d06fce17ecfe43885bb9","systems":["Windows"]},{"id":"bb2bc793323eded7c9fd1962bb8cc0fb09abb71d2fc1935bd2511288fb42da30","systems":["Linux"]},{"id":"bc28cafb565ec247da5326a26e561e9f26f54c279a8d0f962eb1bb2b5b8609ef","systems":["Windows"]},{"id":"bc4c7da9b5174ac79dc869763eab3483f8293d9916582add8e8b18618ccb208d","systems":["Linux"]},{"id":"bd7611204311d793fba5489b2f891fc94b80e135ea970502ca9147fe4eec3d77","systems":["Linux"]},{"id":"bda3d0d380025ae0e0408e7653aa66b1a4f33870bdd95bed3aef430294b698d3","systems":["Windows"]},{"id":"c091116d13b8152f73b468997d43b9d3eb08c6804fa16d64bdc89636d522b325","systems":["Linux"]},{"id":"c1abb540bbcde37141d9f468de2f4e256ad0e0a2b8f3b089dbdbe528e6c49c2d","systems":["Windows"]},{"id":"c1e0687fb56d614a3155b7438a39df51587e424ace4cd886d8fb61348c4cd8b3","systems":["Windows"]},{"id":"c3a0c8006444a4f4c5c3d4b3d4e0277db61fbd14d68e5f0a22d1800af64b0fe1","systems":["Windows"]},{"id":"c4845f9346367e9b0327fe8c33fb9bd6365c46eed54ccf8904ea4c00c1470330","systems":["Linux"]},{"id":"c4a243a629ae2a7ec14bb55705e8e7501df1b1e36acd3452171fe7896bd09b52","systems":["Windows"]},{"id":"c7cf96c50a28d154aecfd662233f877c9ba112c5eddbd4b37f9961da5b82b269","systems":["Linux"]},{"id":"cc8dc8185ba0726b1338370314874c7b8c3a9abc301827631eab3b70ed651c54","systems":["Mac"]},{"id":"cccf69174671a07a0b5b78101bdeb8d9a679b586fc315cc506ed084076222b1f","systems":["Windows"]},{"id":"cd1dc4273200aa130bf94621ccad603184e31bcb50d18e50fc911b44068dca5b","systems":["Linux"]},{"id":"cd8280be7f7d19a7df8bcaf102e3124a438b349213e0bd8970e3673b48842a4c","systems":["Windows"]},{"id":"d08c16438b85e7370c57af05eeeed4ba8be8d329013cf2d35ddaaca499162d41","systems":["Linux"]},{"id":"d205792d62952fa18968cbd2ab97abac1452cfa2ed349f25ebb5f21a50fd210a","systems":["Windows"]},{"id":"d295b3138a1e4eb860f85e2d1002952cf4c5d1e3cff51f1e70c9333750520b52","systems":["Mac"]},{"id":"d4e8527a39d9d7ae6ec5cb3c9f6d4e9adc6838a2bec068d397b5f1b222265388","systems":["Windows"]},{"id":"d5e7b9cd8f7777da262911fbde443282cf7f120ed7b5082e79283e912db4809a","systems":["Windows"]},{"id":"dd7917b2be144e2ccf60220ef6f05f74363e33fa0a1cf27081c31e31bfe75400","systems":["Linux"]},{"id":"df8a4b91a553d7d64eb543ee98955dfdcd70baab454f455d1ce90628f06fce72","systems":["Linux"]},{"id":"e1670b25b8bc72935c23a0190ece539b6ac9f81879d60cc166a7c66b96a71a90","systems":["Mac"]},{"id":"e1903db31d088652e75918c625a574df6b29a1ceae1ef6eb5b23a102ae875c60","systems":["Android"]},{"id":"e34dfc035f84e4bef979fa41784b408ff070e5ec1736dd7e8ff815546d6888e9","systems":["Windows"]},{"id":"e57ce08dc4c58fd919c56144e4a8ff9772333987fb5129fd3d86d4ac3e5502bd","systems":["Windows"]},{"id":"e77832ea52aa5c71b784dbe1f8ece0cd6a047ceeab07e70acee2cbdd2c468a04","systems":["Windows"]},{"id":"eafddbae1ea22a8788915549b0abc33f85708a9a55d511c74d54e12e78794d3c","systems":["Linux"]},{"id":"ede9438fe695ad73751a76d1a05891fe1a08aa0dac112951b8dcad7fa3b33e3c","systems":["Mac"]},{"id":"f56348dc70629f22cbcb24d42acbe943246aafe52551a62da9cf19466685add7","systems":["Windows"]},{"id":"f61bb9a4604e54207fcc61f4c4dcf9db53d18014402bda4ab079e926c4774097","systems":["Windows"]},{"id":"f7d23675743c97b56437b4355db0dd738c14a23c53431a6a1eff8a0b47e13df4","systems":["Windows"]},{"id":"f94bfe4610d2d52c0b5a04bd57c4e8e61f88e6d95b3cab49a0b9275ac9b78358","systems":["Linux"]},{"id":"fabfb1a6bb67cc16b89c24ca60ee61b372454e963f1710f206043983a0bd6abc","systems":["Mac"]},{"id":"fb1a5ba7f5fd9b49bd3fc729b919f860c0153b97e902fb46599cc977a297d4d4","systems":["Windows"]},{"id":"fbfa82c0aa262af0bd1c1314170eb8d29104cbce7cb02bf351adfa9e18addde2","systems":["Linux"]},{"id":"fcaa14a0f1598502d3a209a5aa3124172d198882763c23b484a3456e0f8934c1","systems":["Windows"]},{"id":"ff9ce7862d5ad9689d51c67be1030dc673e82d461ce6ff84f62c3fab0b40f3fe","systems":["Mac"]}],"WebKit":[{"id":"0d0c7825a90d93bb57c70ee130d0fb94b3d100412aaa64b56a471a3535bc138f","systems":["Mac"]},{"id":"0d3ee45f794382ab074092e558277073acb5db88186e9778cbfce0bb7d210f5c","systems":["Mac"]},{"id":"0d95913d8db0a4306a72bc3d69c14aaa86f3ec1f198d3deb80c067bd6b04a95d","systems":["iPhone"]},{"id":"1136b633d1762a811c8c1d1a8bb23e3e48d86a4384228daffd76e93d201c6d11","systems":["iPhone"]},{"id":"2f56f8f1523f8a529d3b846b96891c9e0738d13039fd701c1763db4521912b86","systems":["Mac"]},{"id":"3a48470d22f957fe06a5975d8be2d5a6a1a636a7d0b749be3e8b960e18cbd879","systems":["Mac"]},{"id":"4f5b9687660ac846bf98218a8cce03df0fe67ebfb32e0d72978f7a00518a8457","systems":["Mac"]},{"id":"6ad6015a58a4eb83e4aae524e7bb4f98ca7bfff5192b13001cd249b6cf976ca2","systems":["iPhone"]},{"id":"71eb20ceecfd7c860daf884f96048070bead4f65dc1f164c32b737cd28421635","systems":["Mac"]},{"id":"71fc7061e6d37c99f24975b37f1388322dcd4836f2e9eefe4f56b102312b9afc","systems":["Mac"]},{"id":"8184dd4e5f0f5b5e2b32c0cd4f3088a5779f528116f4b90acf55cdcdf4d60c04","systems":["Mac"]},{"id":"8662e70a9793559e5eb0673fd31c8f7d41b598974b3054f1551dc2ca4459b30f","systems":["Mac","iPad","iPhone"]},{"id":"8e9ce03e2483307f62a54e520f45041e82f1de76db26ff6b794144a5f707f08d","systems":["Mac"]},{"id":"975c1fc929dc012b1c0b2058d850009e6bbb5dec07d32cfde6f3518b67416e73","systems":["Mac"]},{"id":"bc45d7778aadd31442fc36f774c2f9b18b5abee888c61a24fe95f3030dc7f535","systems":["Mac"]},{"id":"c6378d7b5a9d5b4a89ad8954186a2c989eca98bb85870d091f5ff3433d84b0e4","systems":["Mac"]},{"id":"c68816e0fb7d641d7a5eb59849c5b30b4c4f522e88293a7373b57d1f0828bc93","systems":["iPhone"]},{"id":"cbc4fd9e29c2fccebaa98aec0ed678799a4a3f9d254daea6106f46af376d21f9","systems":["Mac","iPad","iPhone"]},{"id":"e368895bb23670721309e55867460fa2d19eec56dd9f16dae0281617bb744c3e","systems":["Mac"]}],"unknown":[{"id":"1dc4d8ba2ccdb44cc5860421d3b79d029a689d593407da943d0772052fa908b7","systems":["Linux"]},{"id":"b30d86f0083d70460d2e16e7660a74ab6c3ffc238d45ca80a99e5e10fc9c5edc","systems":["Linux"]}],"Goanna":[{"id":"51a8a735e2df2eb66a8ccce9c006dc675b901c2c356d54962c382b764bcfec6a","systems":["Windows"]},{"id":"555ed2f013455802a8868624e2d8849195f95b29d7f92b21648a44f416773559","systems":["Windows"]},{"id":"a1343183b6ce0a958467cfca2a6b40aa2e678b6d60d6fcb3253c1683c2c01ce8","systems":["Windows"]}]};

		const decryptHash = (hash, data) => {
			let systems = [];
			let poolTotal = 0;
			const metricTotal = Object.keys(data).reduce((acc,item) => acc+= data[item].length, 0);
			const decryption = Object.keys(data).find(key => data[key].find(item => {
				if (!(item.id == hash)) {
					return false
				}
				systems = item.systems;
				poolTotal = data[key].length;
				return true
			}));

			const icon = {
				blink: '<span class="icon blink"></span>',
				webkit: '<span class="icon webkit"></span>',
				tor: '<span class="icon tor"></span>',
				gecko: '<span class="icon gecko"></span>',
				goanna: '<span class="icon goanna"></span>',
				cros: '<span class="icon cros"></span>',
				linux: '<span class="icon linux"></span>',
				apple: '<span class="icon apple"></span>',
				windows: '<span class="icon windows"></span>',
				android: '<span class="icon android"></span>'
			};
			const engineIcon = (
				!decryption ? '' :
					/Gecko/.test(decryption) ? icon.gecko :
						/WebKit/.test(decryption) ? icon.webkit :
							/Blink/.test(decryption) ? icon.blink :
								/Goanna/.test(decryption) ? icon.goanna :
									''
			);
			const systemIcon = (
				!decryption || systems.length != 1 ? '' :
					/windows/i.test(systems[0]) ? icon.windows :
						/linux/i.test(systems[0]) ? icon.linux :
							/ipad|iphone|ipod|ios|mac/i.test(systems[0]) ? icon.apple :
								/android/.test(systems[0]) ? icon.android :
									/chrome os/i.test(systems[0]) ? icon.cros :
										''
			);
			const formatPercent = n => n.toFixed(2).replace('.00', '');
			return {
				engine: decryption || 'unknown',
				engineHTML: (
					!decryption ? undefined : 
						`${engineIcon}${systemIcon}${decryption}${systems.length != 1 ? '' : ` on ${systems[0]}`}`
				),
				uniqueMetric: !decryption ? '0' : formatPercent(1/metricTotal*100),
				uniqueEngine: !decryption ? '0' : formatPercent(1/poolTotal*100)
			}
		};

		const { engine, engineHTML, uniqueMetric, uniqueEngine } = decryptHash(systemHash, decryptionData);

		const colorsLen = system.colors.length;
		const gradientColors = system.colors.map((color, index) => {
			const name = Object.values(color)[0];
			return (
				index == 0 ? `${name}, ${name} ${((index+1)/colorsLen*100).toFixed(2)}%` : 
				index == colorsLen-1 ? `${name} ${((index-1)/colorsLen*100).toFixed(2)}%, ${name} 100%` : 
				`${name} ${(index/colorsLen*100).toFixed(2)}%, ${name} ${((index+1)/colorsLen*100).toFixed(2)}%`
			)
		});
		const id = 'creep-css-style-declaration-version';
		return `
	<div class="col-six">
		<style>
			.system-styles-metric-rating {
				background: linear-gradient(90deg, var(${uniqueMetric < 10 ? '--unique' : '--grey-glass'}) ${uniqueMetric}%, #fff0 ${uniqueMetric}%, #fff0 100%);
			}
			.system-styles-class-rating {
				background: linear-gradient(90deg, var(${uniqueEngine < 10 ? '--unique' : '--grey-glass'}) ${uniqueEngine}%, #fff0 ${uniqueEngine}%, #fff0 100%);
			}
		</style>
		<strong>Computed Style</strong><span class="hash">${hashSlice($hash)}</span>
		<div>keys (${!computedStyle ? '0' : count(computedStyle.keys)}): ${
			!computedStyle ? note.blocked : 
			modal(
				'creep-computed-style',
				computedStyle.keys.join(', '),
				hashMini(computedStyle)
			)
		}</div>
		<div>system styles: ${
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
							<div>${key}: <span style="padding:0 5px;border-radius:3px;font:${val}">${val}</span></div>
						`
					}),
				].join(''),
				hashMini(system)
			) : note.blocked
		}</div>
		<div class="system-styles-metric-rating help" title="% of system styles samples">${uniqueMetric}% of samples</div>
		<div class="system-styles-class-rating help" title="% of ${engine} class">${uniqueEngine}% of class</div>
		<div>engine: ${engineHTML || note.unknown}</div>
		<style>.gradient { background: repeating-linear-gradient(to right, ${gradientColors.join(', ')}); }</style>
		<div class="gradient"></div>
	</div>
	`
	};

	const gcd = (a, b) => b == 0 ? a : gcd(b, a % b);

	const getAspectRatio = (width, height) => {
		const r = gcd(width, height);
		const aspectRatio = `${width / r}/${height / r}`;
		return aspectRatio
	};

	const query = ({ body, type, rangeStart, rangeLen }) => {
		body.innerHTML = `
		<style>
			${[...Array(rangeLen)].map((slot, i) => {
		i += rangeStart;
		return `@media(device-${type}:${i}px){body{--device-${type}:${i};}}`
	}).join('')}
		</style>
	`;
		const style = getComputedStyle(body);
		return style.getPropertyValue(`--device-${type}`).trim()
	};

	const getScreenMedia = body => {
		let i, widthMatched, heightMatched;
		for (i = 0; i < 10; i++) {
			let resWidth, resHeight;
			if (!widthMatched) {
				resWidth = query({ body, type: 'width', rangeStart: i * 1000, rangeLen: 1000 });
				if (resWidth) {
					widthMatched = resWidth;
				}
			}
			if (!heightMatched) {
				resHeight = query({ body, type: 'height', rangeStart: i * 1000, rangeLen: 1000 });
				if (resHeight) {
					heightMatched = resHeight;
				}
			}
			if (widthMatched && heightMatched) {
				break
			}
		}
		return { width: +widthMatched, height: +heightMatched }
	};

	const getScreenMatchMedia = win => {
		let widthMatched, heightMatched;
		for (let i = 0; i < 10; i++) {
			let resWidth, resHeight;
			if (!widthMatched) {
				let rangeStart = i * 1000;
				const rangeLen = 1000;
				for (let i = 0; i < rangeLen; i++) {
					if (win.matchMedia(`(device-width:${rangeStart}px)`).matches) {
						resWidth = rangeStart;
						break
					}
					rangeStart++;
				}
				if (resWidth) {
					widthMatched = resWidth;
				}
			}
			if (!heightMatched) {
				let rangeStart = i * 1000;
				const rangeLen = 1000;
				for (let i = 0; i < rangeLen; i++) {
					if (win.matchMedia(`(device-height:${rangeStart}px)`).matches) {
						resHeight = rangeStart;
						break
					}
					rangeStart++;
				}
				if (resHeight) {
					heightMatched = resHeight;
				}
			}
			if (widthMatched && heightMatched) {
				break
			}
		}
		return { width: widthMatched, height: heightMatched }
	};

	const getCSSDataURI = x => `data:text/css,body {${x}}`;

	const getCSSMedia = async imports => {

		const {
			require: {
				captureError,
				phantomDarkness,
				logTestResult,
				isFirefox
			}
		} = imports;

		try {
			const start = performance.now();
			const win = phantomDarkness.window;

			const { body } = win.document;
			const { width, height } = win.screen;

			const deviceAspectRatio = getAspectRatio(width, height);

			const matchMediaCSS = {
				['prefers-reduced-motion']: (
					win.matchMedia('(prefers-reduced-motion: no-preference)').matches ? 'no-preference' :
						win.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'reduce' : undefined
				),
				['prefers-color-scheme']: (
					win.matchMedia('(prefers-color-scheme: light)').matches ? 'light' :
						win.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : undefined
				),
				monochrome: (
					win.matchMedia('(monochrome)').matches ? 'monochrome' :
						win.matchMedia('(monochrome: 0)').matches ? 'non-monochrome' : undefined
				),
				['inverted-colors']: (
					win.matchMedia('(inverted-colors: inverted)').matches ? 'inverted' :
						win.matchMedia('(inverted-colors: none)').matches ? 'none' : undefined
				),
				['forced-colors']: (
					win.matchMedia('(forced-colors: none)').matches ? 'none' :
						win.matchMedia('(forced-colors: active)').matches ? 'active' : undefined
				),
				['any-hover']: (
					win.matchMedia('(any-hover: hover)').matches ? 'hover' :
						win.matchMedia('(any-hover: none)').matches ? 'none' : undefined
				),
				hover: (
					win.matchMedia('(hover: hover)').matches ? 'hover' :
						win.matchMedia('(hover: none)').matches ? 'none' : undefined
				),
				['any-pointer']: (
					win.matchMedia('(any-pointer: fine)').matches ? 'fine' :
						win.matchMedia('(any-pointer: coarse)').matches ? 'coarse' :
							win.matchMedia('(any-pointer: none)').matches ? 'none' : undefined
				),
				pointer: (
					win.matchMedia('(pointer: fine)').matches ? 'fine' :
						win.matchMedia('(pointer: coarse)').matches ? 'coarse' :
							win.matchMedia('(pointer: none)').matches ? 'none' : undefined
				),
				['device-aspect-ratio']: (
					win.matchMedia(`(device-aspect-ratio: ${deviceAspectRatio})`).matches ? deviceAspectRatio : undefined
				),
				['device-screen']: (
					win.matchMedia(`(device-width: ${width}px) and (device-height: ${height}px)`).matches ? `${width} x ${height}` : undefined
				),
				['display-mode']: (
					win.matchMedia('(display-mode: fullscreen)').matches ? 'fullscreen' :
						win.matchMedia('(display-mode: standalone)').matches ? 'standalone' :
							win.matchMedia('(display-mode: minimal-ui)').matches ? 'minimal-ui' :
								win.matchMedia('(display-mode: browser)').matches ? 'browser' : undefined
				),
				['color-gamut']: (
					win.matchMedia('(color-gamut: srgb)').matches ? 'srgb' :
						win.matchMedia('(color-gamut: p3)').matches ? 'p3' :
							win.matchMedia('(color-gamut: rec2020)').matches ? 'rec2020' : undefined
				),
				orientation: (
					win.matchMedia('(orientation: landscape)').matches ? 'landscape' :
						win.matchMedia('(orientation: portrait)').matches ? 'portrait' : undefined
				)
			};

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
		`;

			let style = getComputedStyle(body);
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

			let importCSS;

			if (!isFirefox) {
				body.innerHTML = `
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
				style = getComputedStyle(body);
				importCSS = {
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
					orientation: style.getPropertyValue('--import-orientation').trim() || undefined
				};
			}

			// get screen query
			let screenQuery = getScreenMedia(body);

			logTestResult({ start, test: 'css media', passed: true });
			return { importCSS, mediaCSS, matchMediaCSS, screenQuery }
		}
		catch (error) {
			logTestResult({ test: 'css media', passed: false });
			captureError(error);
			return
		}
	};



	const cssMediaHTML = ({ fp, modal, note, hashMini, hashSlice }) => {
		if (!fp.css) {
			return `
		<div class="col-six undefined">
			<strong>CSS Media Queries</strong><
			<div>@media: ${note.blocked}</div>
			<div>@import: ${note.blocked}</div>
			<div>matchMedia: ${note.blocked}</div>
			<div>touch device: ${note.blocked}</div>
			<div>screen query: ${note.blocked}</div>
		</div>`
		}
		const {
			cssMedia: data
		} = fp;
		const {
			$hash,
			importCSS,
			mediaCSS,
			matchMediaCSS,
			screenQuery
		} = data;

		return `
	<div class="col-six">
		<strong>CSS Media Queries</strong><span class="hash">${hashSlice($hash)}</span>
		<div>@media: ${
			!mediaCSS || !Object.keys(mediaCSS).filter(key => !!mediaCSS[key]).length ? 
			note.blocked :
			modal(
				'creep-css-media',
				`<strong>@media</strong><br><br>${Object.keys(mediaCSS).map(key => `${key}: ${mediaCSS[key] || note.unsupported}`).join('<br>')}`,
				hashMini(mediaCSS)
			)
		}</div>
		<div>@import: ${
			!importCSS || !Object.keys(importCSS).filter(key => !!importCSS[key]).length ? 
			note.unsupported :
			modal(
				'creep-css-import',
				`<strong>@import</strong><br><br>${Object.keys(importCSS).map(key => `${key}: ${importCSS[key] || note.unsupported}`).join('<br>')}`,
				hashMini(importCSS)
			)
		}</div>
		<div>matchMedia: ${
			!matchMediaCSS || !Object.keys(matchMediaCSS).filter(key => !!matchMediaCSS[key]).length ? 
			note.blocked : 
			modal(
				'creep-css-match-media',
				`<strong>matchMedia</strong><br><br>${Object.keys(matchMediaCSS).map(key => `${key}: ${matchMediaCSS[key] || note.unsupported}`).join('<br>')}`,
				hashMini(matchMediaCSS)
			)
		}</div>
		<div>touch device: ${!mediaCSS ? note.blocked : mediaCSS['any-pointer'] == 'coarse' ? true : note.unknown}</div>
		<div>screen query: ${!screenQuery ? note.blocked : `${screenQuery.width} x ${screenQuery.height}`}</div>
	</div>
	`
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
	const getConsoleErrors = async imports => {

		const {
			require: {
				hashify,
				captureError,
				logTestResult
			}
		} = imports;

		try {
			const start = performance.now();
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
			logTestResult({ start, test: 'console errors', passed: true });
			return { errors }
		}
		catch (error) {
			logTestResult({ test: 'console errors', passed: false });
			captureError(error);
			return
		}
	};

	const consoleErrorsHTML = ({ fp, modal, note, hashSlice }) => {
		if (!fp.consoleErrors) {
			return `
		<div class="col-six undefined">
			<strong>Error</strong>
			<div>0% of samples</div>
			<div>0% of class</div>
			<div>engine: ${note.blocked}</div>
			<div>results: ${note.blocked}</div>
		</div>`
		}
		const {
			consoleErrors: {
				$hash,
				errors
			}
		} = fp;

		const decryptionData = {"V8":[{"id":"4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945","systems":["Linux"]},{"id":"7757f7416b78fb8ac1f079b3e0677c0fe179826a63727d809e7d69795e915cd5","systems":["Android","Chrome OS","Linux","Mac","Other","Windows"]},{"id":"7857f7416b78fb8ac1f079b3e0677c0fe179826a63727d809e7d69795e915cd5","systems":["Windows"]},{"id":"9950c83857654391aed7d172ef75efba4ccbab1a011ed54835251bd863d56ae7","systems":["Windows"]},{"id":"a8c7362bfa3851b0ea294c075f5708b73b679b484498989d7fde311441ed3322","systems":["Android","Chrome OS","Linux","Mac","Other","Windows","Windows Phone","iPhone"]}],"SpiderMonkey":[{"id":"5311d4b7dea48bb3b239b398e1f206b242bfab7b8e51dbf4743919266e48a2d2","systems":["Android","Linux","Mac","Windows"]},{"id":"5bb681a23d4554883f1b12ebe55bacdf625d5190145fad659daaa7e100bafcf0","systems":["Linux","Windows"]},{"id":"7c95559c6754c42c0d87fa0339f8a7cc5ed092e7e91ae9e50d3212f7486fcbeb","systems":["Android","Linux","Mac","Other","Windows"]}],"JavaScriptCore":[{"id":"c6c22e37dc19b13318a1d6dddf87e359c724cdc1ad1da7b21cf0bc4a76d431e8","systems":["Mac"]},{"id":"d420d594c5a7f7f9a93802eebc3bec3fba0ea2dde91843f6c4746121ef5da140","systems":["Mac","iPad","iPhone"]},{"id":"f4d88b59fb7c64d87deb760c851349a5fe47f9fe8ba06599594eab2502c54d97","systems":["iPhone"]}]};

		const decryptHash = (hash, data) => {
			let systems = [];
			let poolTotal = 0;
			const metricTotal = Object.keys(data).reduce((acc,item) => acc+= data[item].length, 0);
			const decryption = Object.keys(data).find(key => data[key].find(item => {
				if (!(item.id == hash)) {
					return false
				}
				systems = item.systems;
				poolTotal = data[key].length;
				return true
			}));

			const icon = {
				blink: '<span class="icon blink"></span>',
				webkit: '<span class="icon webkit"></span>',
				firefox: '<span class="icon firefox"></span>'
			};

			const engineIcon = (
				!decryption ? '' :
					/SpiderMonkey/.test(decryption) ? icon.firefox :
						/JavaScriptCore/.test(decryption) ? icon.webkit :
							/V8/.test(decryption) ? icon.blink :
									''
			);

			const formatPercent = n => n.toFixed(2).replace('.00', '');
			return {
				engine: decryption || 'unknown',
				engineHTML: (
					!decryption ? undefined : 
						`${engineIcon}${decryption}`
				),
				uniqueMetric: !decryption ? '0' : formatPercent(1/metricTotal*100),
				uniqueEngine: !decryption ? '0' : formatPercent(1/poolTotal*100)
			}
		};

		const { engine, engineHTML, uniqueMetric, uniqueEngine } = decryptHash($hash, decryptionData);
		const results = Object.keys(errors).map(key => {
			const value = errors[key];
			return `${+key+1}: ${value}`
		});
		return `
	<div class="col-six">
		<style>
			.console-errors-metric-rating {
				background: linear-gradient(90deg, var(${uniqueMetric < 10 ? '--unique' : '--grey-glass'}) ${uniqueMetric}%, #fff0 ${uniqueMetric}%, #fff0 100%);
			}
			.console-errors-class-rating {
				background: linear-gradient(90deg, var(${uniqueEngine < 10 ? '--unique' : '--grey-glass'}) ${uniqueEngine}%, #fff0 ${uniqueEngine}%, #fff0 100%);
			}
		</style>
		<strong>Error</strong><span class="hash">${hashSlice($hash)}</span>
		<div class="console-errors-metric-rating help" title="% of console errors samples">${uniqueMetric}% of samples</div>
		<div class="console-errors-class-rating help" title="% of ${engine} class">${uniqueEngine}% of class</div>
		<div>engine: ${engineHTML || note.unknown}</div>
		<div>results: ${modal('creep-console-errors', results.join('<br>'))}</div>
	</div>
	`	
	};

	const getWindowFeatures = async imports => {

		const {
			require: {
				captureError,
				phantomDarkness,
				isFirefox,
				logTestResult
			}
		} = imports;

		try {
			const start = performance.now();
			let keys = Object.getOwnPropertyNames(phantomDarkness);
			
			// if Firefox, remove the 'Event' key and push to end for consistent order
			// and disregard keys known to be missing in RFP mode
			const firefoxKeyMovedByInspect = 'Event';
			const varyingKeysMissingInRFP = ['PerformanceNavigationTiming', 'Performance'];
			if (isFirefox) {
				const index = keys.indexOf(firefoxKeyMovedByInspect);
				if (index != -1) {
					keys = keys.slice(0, index).concat(keys.slice(index + 1));
					keys = [...keys, firefoxKeyMovedByInspect];
				}
				varyingKeysMissingInRFP.forEach(key => {
					const index = keys.indexOf(key);
					if (index != -1) {
						keys = keys.slice(0, index).concat(keys.slice(index + 1));
					}
					return keys
				});
			}
			
			const moz = keys.filter(key => (/moz/i).test(key)).length;
			const webkit = keys.filter(key => (/webkit/i).test(key)).length;
			const apple = keys.filter(key => (/apple/i).test(key)).length;
			const data = { keys, apple, moz, webkit };
			logTestResult({ start, test: 'window', passed: true });
			return { ...data }
		}
		catch (error) {
			logTestResult({ test: 'window', passed: false });
			captureError(error);
			return
		}
	};

	const windowFeaturesHTML = ({ fp, modal, note, hashSlice, count }) => {
		if (!fp.windowFeatures) {
			return `
		<div class="col-six undefined">
			<strong>Window</strong>
			<div>keys (0): ${note.blocked}</div>
			<div>0% of samples</div>
			<div>0% of class</div>
			<div>version: ${note.blocked}</div>
		</div>`
		}
		const {
			windowFeatures: {
				$hash,
				keys
			}
		} = fp;
		
		const decryptionData = {"Chrome 89 Edge":[{"id":"00131df3d5b610ea0e839c1a0b5bb590603f139a3827f4cca4dc6d78a6d8f990","systems":["Windows"]},{"id":"01217d2a15566b8cadc6a87fb1bdb77958958f09a60c24138c931e76fadc85b9","systems":["Windows"]},{"id":"013a4c0fa1228a05a62d13db9c9708c8edf700c2c9c320fd70b0049fe4e89569","systems":["Windows"]},{"id":"029d9e75453423a1d24eb358f3e7cc985701d6ffdf4d72d6256fc2c47c805d1d","systems":["Windows"]},{"id":"02d14b7e561a8bcede67dcc15e5b46e1ea686ac72042a79c2ec3f275cc146fd9","systems":["Windows"]},{"id":"02ddc7b9e85a31b8a56ae78d8731f6ee7d25f486ab7f75ae68f81707068336bd","systems":["Windows"]},{"id":"02f5c8ea54f616decbd59fb24923436a409d90693cda20e90b14be4c1dfaa9ae","systems":["Windows"]},{"id":"0348b978e742e7947e622a23b97d84002ee76e0cbdf5e49d4eeccba52a07f539","systems":["Windows"]},{"id":"03674994281e0ea5b5e55a81d0aaea0f7804daa93f0b628f4e6aa35869f8e5fb","systems":["Windows"]},{"id":"039e56020d3ababcdcf765e0eb54edc1e0d3170671a97de1b0b0cecd874c6fac","systems":["Windows"]},{"id":"03b632f8114d21b8226fc5afbb50eb6ceb127e240eba5c9aade27b52686ae6a1","systems":["Windows"]},{"id":"087e9a2df7c06cca7170a331b12d0e154f323e3366eb01d0be7bb8dca4f5765e","systems":["Windows"]},{"id":"0bb8d872eba463284b590b2828a1aad99697925c970f2da8fb91fbf07d0be2e2","systems":["Windows"]},{"id":"0d6d64ec4cf0bcb061686f7bd3ccb045a778765365020f31bbd9b39ff6e2f175","systems":["Windows"]},{"id":"0f56896714fd773f8b3d07c86d379ddc2683311a70381fb840d4f5522dba8ad2","systems":["Windows"]},{"id":"0fa6b38906d801ce03c67250041698fa3542d801869ce5d1163866c4cbf01322","systems":["Windows"]},{"id":"108fd54dc152f2204b28230c12ee9639b97d38b6248e53bcc8e48804520dde52","systems":["Windows"]},{"id":"1190432e9071c28c874300b7dac8f9012878a5a2d8d4a92752eddff44d6a0452","systems":["Windows"]},{"id":"120528e89a22707e0dbf498bb1611b666bf89f4ddce90f2d0c55ac877be60b22","systems":["Windows"]},{"id":"1208a5569ad216988f3c6efe793fcb1da7270890078498b0e33465828313f988","systems":["Windows"]},{"id":"12289ada98abbed0ca995ec5117eea3de5b548d41a0ea20fe503108a4606d5a0","systems":["Windows"]},{"id":"123bbfce3d3cd9ad5e0c718049487ef7c86e0b387b6f931bdbae379e5850d099","systems":["Windows"]},{"id":"12ce0700f51c77c151370bb10bc5dcc8ca19f236cc2a252d6cf6c288897a97e6","systems":["Windows"]},{"id":"135fd0b77b6301b66348088ad8567a937cc8fd11c42edaad8d2d2833438f54e7","systems":["Windows"]},{"id":"1439b48dc274a71ed1a574fe3f4e6f6486e9582617a624a65021818d5c8c6084","systems":["Windows"]},{"id":"16c867a6e5a67ab72c6cde65ee2071040fd303b98ffceffeca16612b4b68ba09","systems":["Windows"]},{"id":"1723bdcde9144bc557885dc8986174d9a278489da9da69f3b8920894f74112b2","systems":["Windows"]},{"id":"18fcf944aab38bd21a3032f2602217e97905923fb09664917f44dd2c59725cae","systems":["Windows"]},{"id":"19496038ea56bfaf00f524585a0da7dfaf081f980cc38e19db1348c14613d242","systems":["Windows"]},{"id":"1980deda413c27207d60d0ce79c21c9133111ca4b664db29a969cdc989754412","systems":["Windows"]},{"id":"19a453c2badedb372b4988fd25c87d0f4ddbb71a7776dc96b7c427e1c6086163","systems":["Windows"]},{"id":"19ea8e1d5ef0a06581a6667d26aec635c8a697debe207b05f379e786ff97b8c5","systems":["Windows"]},{"id":"1a6a435a9a83577536377697d06096e5043b22976dfd2cd197c668fade845cd2","systems":["Windows"]},{"id":"1b02db1b6827ea1ab6f762e8e41b07457ef945ff18e81a3e8b5ec5af08590a70","systems":["Windows"]},{"id":"1b21df458f427b03f907e7d44394238b46eb5090fc2415db36b1d699c0c911b9","systems":["Windows"]},{"id":"1b8d4b485bec9d05f9799017bf64e43cfd487ee968f0cc365b1f509d9f608015","systems":["Windows"]},{"id":"1e26243cb60505463b038c8b366d36150f880b0d933755a0831654d49a7e3e98","systems":["Windows"]},{"id":"1e6e9e2d22c8b90448e9b5cbfde017d6215543720e5912e262de1121bd891a40","systems":["Windows"]},{"id":"1f7e87966b1930d68b8d256bfa55f2073390983f9cda3c29fe7316106363cc3e","systems":["Windows"]},{"id":"214aa4923b09ba7864cc9155cfa27278547b506534962147f88d12e0d4d38c09","systems":["Windows"]},{"id":"21a806ace08d532f1585fc769606b9e29fb355e0a2c3e78e0221dad5d035935f","systems":["Windows"]},{"id":"2219d9ed7cf662fcd617004f6f148c9c17f6bfdedc13cba750ea3585fd1c1eac","systems":["Windows"]},{"id":"2346b70bcc2a198d496ef6ba413660757a2077da4b2abb8b9576ef09a8e3107f","systems":["Windows"]},{"id":"243dc32fe135fb8afcf0fa0d8b1dc2a8db921540ae8e47081a63f900038368a9","systems":["Windows"]},{"id":"289c81757dc79a04833eede7083e6940de5fc1eb0e7da539de0cf8b100310e25","systems":["Windows"]},{"id":"2993ed9f40a9acf5fd52a50f85b3c406419c9cf6565f6fa62040e58bb03818e4","systems":["Windows"]},{"id":"2a59a9ddcd2164fd9dce08682a9bb7d9a272667849f0f89aa9abcc853bfdc0ff","systems":["Windows"]},{"id":"2c83cd7d410eba17fd10bec4f466cf60c6ab4135f8950900694a4ef6218dddb6","systems":["Windows"]},{"id":"2ce629c12debb0cccb0aa474345c2aa4fdfb784b5aa50a8fdf8bfdc380bf5e23","systems":["Windows"]},{"id":"2dfebac494f5bcda00b1a93772da6210c7277cd4f0866a51a92fad6cc8ef2a27","systems":["Windows"]},{"id":"2ec774bfabf16d12b50213f94c282d92d14cb1f2608cd0c48d679105594e9f60","systems":["Windows"]},{"id":"2f63f62331d56659354c3ba687ea4ad7f138c6d17e23c18b87c2da408491428f","systems":["Windows"]},{"id":"302546d902d32b226e6477e38dda234291ab5f63ccceeaf3dea007f305848633","systems":["Windows"]},{"id":"31d78397f6dc49d25521610a5d5603ed3e159c1dd68dff0a7361f35efa2aa0e4","systems":["Windows"]},{"id":"327cda19aa6ebca120ba087d171c2c9a2a385c8cdb1a66e041032508d1dd3a5d","systems":["Windows"]},{"id":"32cb2e9e5307bb8f51e6a9cf03c80cf5e1799e9660a9c3b4ddfe5eb860d43373","systems":["Windows"]},{"id":"32fb5731967a6193d77c580a1709800dc6bf09561cbafca3656b7c3c7494b1f5","systems":["Windows"]},{"id":"3437e77d810ad79ca7b963e0ddb098ca6883cd34f8a6b03706a9a71630f7900e","systems":["Windows"]},{"id":"351ceb3c5a6bc0bc77f02ddb5a17dc029eb24627f71df6c25a4fbd16f1de3864","systems":["Windows"]},{"id":"3582e57429445cc7e0e7ad7860c047a689effc5765ac82a4a1070193e9cbf26f","systems":["Windows"]},{"id":"35e0b4a65a4cbc1c95382e08381ac3d7323164ec711c0640d3518a75f82a3dd1","systems":["Windows"]},{"id":"385ec3750b18cf44d3f28fb2718ef17e2f363d41be5fb0de7a15a5868bb1f7f9","systems":["Windows"]},{"id":"3b4c05442acb14612385c40120824fd7389fb37a99da7f5b2cec9c9fe3c63c77","systems":["Windows"]},{"id":"3b8f6c1d13fae8c2934c58ce0e315ba9dea00a01f36269125f6e44a4b4392a05","systems":["Windows"]},{"id":"3d45a2a5b75aa1e615b4a170d30292a401e3b5d318bef8c8daf2f578f2287cd6","systems":["Windows"]},{"id":"3e11fda0262192c23a8bd91b5747c832ae6c6fafc4448bed222b28d57a77d83a","systems":["Windows"]},{"id":"3e9523af0e7d64555415dab1cf1fd333133c702f17ebe18e8eeb702ce4f935eb","systems":["Windows"]},{"id":"3efe05355dab2e1edbeeae033db7021fa0e3204b91cf70e47d6c64916e516c12","systems":["Windows"]},{"id":"3fd4a6982ff934e5133f125dcc401ff16fc6935897405f3bb33453445d571df7","systems":["Windows"]},{"id":"40c8eea3dcca7b0ea0238a0597328644a40277b9c94a831e7cfcf980f0948554","systems":["Windows"]},{"id":"419a61519246d163c884f8ebb8b57411b232fa6bc8fe0613c8ea885b443aa5e5","systems":["Windows"]},{"id":"42bdbb29df0a60e11c959326e151c9275aff576bce22213f586e3d7903b5a281","systems":["Windows"]},{"id":"46393eb1a1864db04994991556df5f84fcf547582290cfc9124c1bfb95bce83b","systems":["Windows"]},{"id":"47022793e0087f1f6b54e0bfe2da156cbf65ca92c993015907e5b7130515c4e9","systems":["Windows"]},{"id":"476b5af5e36c700a9180c3df825eb4c8d898adbc0e1d061d37efb8cf8215a838","systems":["Windows"]},{"id":"482a1a40b4bb53db39f7ef61547e96aebbf27ba4c9ca692f29e02ecc819441da","systems":["Windows"]},{"id":"48983cbd24eed310507f335f4d116f5df3c85f827e74c9b1871b6e02dde759cc","systems":["Windows"]},{"id":"48a0f6076e6688a031162905fdc43e31c04d1a64834c0edab0596b2ce4f5ed0e","systems":["Windows"]},{"id":"48ee8d9d03fdb13a7f540e8aedfe40e278f031073262d01494ec313ef7a01379","systems":["Windows"]},{"id":"4935b6b0f89a698ff3407a7812be8eb853d70c034299333dde0a686844d80333","systems":["Windows"]},{"id":"4a382c99c116aefd20f4580dc57775aae0ad3300365aad325784c034d99b9a7d","systems":["Windows"]},{"id":"4b8826cd219be501d62733002d9afdaf68bccc98806f4e0fe8008f87a01b7b4b","systems":["Windows"]},{"id":"4d37f61a4b6fa2aa4000b409094581e177a768db9827d45a8b11ab00f3622f9d","systems":["Windows"]},{"id":"4e49aebe97d30850ba26b46259069528aa8499be2793b43a8e7f1b1d929cc271","systems":["Windows"]},{"id":"4f448e4b45baafabe8f91c103af76b3245081fc70af6c32c4de2f8f0d8b4f03f","systems":["Windows"]},{"id":"502166921d30794ee8cb31b330a33a6f03883a12bcd1dc87f1ea551a6884c8fd","systems":["Windows"]},{"id":"50838de35ab1490855c4bbe911543559505d4321a50e2d5b6ed047cf692c8cb5","systems":["Windows"]},{"id":"50f257add5728c1afd2acfa31bfea186b820f23e6c3564bdf9c0196f36941801","systems":["Windows"]},{"id":"5147b1fb0cc8b3ca14b834d83ca5a92f3e5a4498f0c6917de0bae1415a61ece7","systems":["Windows"]},{"id":"527133ee5baacd8ed92f1284f3ff7f46c7916f1b52fd417f48f041ca15cb1115","systems":["Windows"]},{"id":"55fd10bcf42a3b7d7ff0b1e854a5c5fb0b6489022bfe7bf8dcf3ba9331b69c9b","systems":["Windows"]},{"id":"564554d58732c76d449ef8adfabbaf5d5cd629a3dcd9635b381632318caccfa9","systems":["Windows"]},{"id":"586a89392c553f5583b83c0cac2361806b4f2c0d285356a1081077976cb49a82","systems":["Windows"]},{"id":"58ce7784f590ae970f62c63b4d1242f3b8464ce20f24443bd86769268ef02f14","systems":["Windows"]},{"id":"58fbee4bbb41be1762cedcef8976e6bc68b46fbe907cc1c3213b0eb4a4734b75","systems":["Windows"]},{"id":"5a5c9fc85a7414c1605aa027ab28d41923b15e2443fe597b81738dd9cadbdcd5","systems":["Windows"]},{"id":"5a7a41655800f91ce833995ab3a7af52a3682a222432cf1a234ba6a13573611b","systems":["Windows"]},{"id":"5af5c55a2b0df6bb17c3ccdabc1df9b89c988c8dd0ba7d2e0fde6062001c878c","systems":["Windows"]},{"id":"5b5d1f5c12c318eb3f232a364100461277efe4295993dc0d09374b8ef70d8ad7","systems":["Windows"]},{"id":"5b646a93738df370e89390cb5bbbcfce8ad12801b59e4c39a9b98b30177bb1fa","systems":["Windows"]},{"id":"5dfcb4c57d3a4bfd7679c254de8fc31fd3635b9d1a04296de80a68a825e8b0a8","systems":["Windows"]},{"id":"5fae959a19fc2415e85155582e8d27787645ba9ffb0ecb91fc8369996a9e001c","systems":["Windows"]},{"id":"63d01370032f087c170e21525abc9aa37825c9efcd94b38270e8cc433c1d7112","systems":["Windows"]},{"id":"6651b5efab9606652263b3e611f8617c2ea737e3ca665e165b6745a4360adf0a","systems":["Windows"]},{"id":"66a1935c11b09ef303cc051265f9a250ac7a7e424ac7593d809e943af4d56eb1","systems":["Windows"]},{"id":"68a8b7443b47b94625cfb502515e197b387571854890c543ea6bac2c5c1c345e","systems":["Windows"]},{"id":"68da7c6b053d9b245bde2a6568f6acbc7d9fc9706b190f159c5b3bee2bba8d9f","systems":["Windows"]},{"id":"68e2144c9b409d2d6b6dcad2b70720e686fc59e6bd453381a40ba59a692aa2f7","systems":["Windows"]},{"id":"6c3e5444625a1dc0dc442d2be381a46d3ad3e2da1c202471c281c61d7200f4c7","systems":["Windows"]},{"id":"6cbe8d4099f8c77650ab7100db072de821681fc5ce83915dfbfa6443639c94a4","systems":["Windows"]},{"id":"6d53be7df3dbe54451c88711073942cd2247b42d44653050f5c218603fe88229","systems":["Windows"]},{"id":"6ed52e94b491866bd78e5a5a59cd01d0c78998aa02d67c40b315a1fb2ddcbd0a","systems":["Windows"]},{"id":"6f1ea73e1c4b8f004de4241be6f31fe67a83c874e77d8f9e6b88b92c9c0bb3c8","systems":["Windows"]},{"id":"7027ae4687e01986b23e7f595654b17caaf4cf6292141931d2e65179d7f13104","systems":["Windows"]},{"id":"70484f74c4e4a6b0c16c6bd387eb3a8e494f941ccba7eaec229e26854100c93c","systems":["Windows"]},{"id":"70805b4d972a522f103d35b81387faf13296d35623f4b4aba8393e972f9a7145","systems":["Windows"]},{"id":"710437c73cf9ba488f2c3aa82b1690be0c4e44cb898e548ae0cb1ab9b0a2de75","systems":["Windows"]},{"id":"72e2d3d04bd174b164142020e20cff199f1ad51e8a7e829550d9c3e1582705c1","systems":["Windows"]},{"id":"733d8dc2f868aef48856053a0e09193fd86f19bad51e1477dcedd47c0b5ac0a8","systems":["Windows"]},{"id":"75e3c1c7eafee372bcdfd521e233c2da57c3b0d3a6f0e95a3fbad386935ed95f","systems":["Windows"]},{"id":"779fbdfc7f0b58fb5d68a8b7e353159b0fc5e621edc21394de80f33dbcfe0779","systems":["Windows"]},{"id":"77a0272ce992d41e388f298b32d0495e56d9b60df8a5900a648fdece80e49b06","systems":["Windows"]},{"id":"78841ab016ac72229179c9aa1e477cb173fab308682e202fd9e18dd5a5e34bdd","systems":["Windows"]},{"id":"789f3a0ff72ca57d5c98745c1d0602d59e09a55088ea0a77e562ac3730cc59d6","systems":["Windows"]},{"id":"7a063053a9781b740b7a209fd1dbf1149c71934ea0997fa961295db8ebe358ed","systems":["Windows"]},{"id":"7a80446cf3c21eebb9027a4c3fdf94f4d0ae5486ed627e817010b5d0159eb980","systems":["Windows"]},{"id":"7c9d525cdbc19e9e4da067498e84ae151a20082a520c81980a19575b803f83c0","systems":["Windows"]},{"id":"7d3899a7dc04f4bf4f24468640611d113bd7a68760a157da57891e082571d5ed","systems":["Windows"]},{"id":"802058cb8a36af16205f36b692545862c9ebcf23498e490b5babaa731decd05a","systems":["Windows"]},{"id":"805bc766264e2c7aedd108aeb5ede32cbf639d0756c44c9bdd93237c1946b58e","systems":["Windows"]},{"id":"817bf5ed137fbf27b3af436bf9d333c3aa83b1316bd0ba27914c3793dd5b3d81","systems":["Windows"]},{"id":"81c2b2c47d328869053c75d79860bee7f88be62fc6a2747aa27b5fb782d98902","systems":["Windows"]},{"id":"81eddd826f5365169d157d13921c2c4baabeb7c095ecf297d321801493a898a7","systems":["Windows"]},{"id":"82273c50a1ff97e436532c567f17188ad44d32dc0e2bc5db66c92e6c6b3ed6e4","systems":["Windows"]},{"id":"83f9e2bbbef69ea1ad26d34d1b6ad17a22b411c18cb23046d28c448c2a49c358","systems":["Windows"]},{"id":"85322a796807a08658813aaa399d9cf048700bf4975a62fc69fda25306ff07ec","systems":["Windows"]},{"id":"87055892880106d3b5ab432405656e8caadbdabf67ef5f9168f9b5aeeaf64bec","systems":["Windows"]},{"id":"870b6bc7983ee7235ef8d4708898b43596dce3f46676ec1a7f16af46cde8daf1","systems":["Windows"]},{"id":"8737a8846586e04e2d3593b51b7532ed7930c061fbf120bb2121d36ca70b988b","systems":["Windows"]},{"id":"88d10643d0f051b635881316efd8b9d89251f22701fc9c9b2dbbaeaff8764d67","systems":["Windows"]},{"id":"89b46bedfa1acd4f4d72892dc1ec5c9fdc6131e2933204f21c4128f9bcd576ba","systems":["Windows"]},{"id":"8a522f0eefbeaf09d1093e90dc2cb38bb61bc5e6603cbd8ecf95da3201f345d8","systems":["Windows"]},{"id":"8afd0f1cdda114aa9c4b55cb4aa4954ac3988f1418bf7453e0e9a6b09547c09e","systems":["Windows"]},{"id":"8d39b4b02e97a8c554a76ff4c2564ec806d9b98bd877b2439af7310b1dea15dc","systems":["Windows"]},{"id":"8fa028f8116f4db7b487b184d0ed1cd3ca1eb82539d00f3fe89908b48b958d88","systems":["Windows"]},{"id":"91b1072dec6aa60d4ec197984bf42a76147a50576be8cd73ab9efbf8b2505c59","systems":["Windows"]},{"id":"92d8795b6aa706dd6ace6f700752579e60756fd0d5bf35e954c1ad78d6f427b8","systems":["Windows"]},{"id":"93189359ebc76d4ed9a12f23544d74a749dc2925bb855c32a616ecf49fedd6b6","systems":["Windows"]},{"id":"9364818acb8d39a0a320e89fa95f1758455db6580b52f6201073340c84611c93","systems":["Windows"]},{"id":"94637deb6f15a42b243cd647294dd44e5e6b587f96a38f0f61b4f72135b8e04a","systems":["Windows"]},{"id":"959d69c3fee004d5ad5191858a512477d2c1a1543f2988b5d15711081a1f05d6","systems":["Windows"]},{"id":"96fb01d5704f861a85b609041c20a0ac4b4d886028eb6a62a289268f3b60bdb3","systems":["Windows"]},{"id":"982625f383d211dcf49ba57c9b98e0d9ab27a41f7acb30a8b135d6f26c3205c4","systems":["Windows"]},{"id":"986616cdfd070c20d6abbb582e3086ff8710750ce0d231db5d356ae3bf3eb633","systems":["Windows"]},{"id":"9982b0ed008ff2a170c79515e7d1cf722a72ad12de7824f0aed5e9d5770d4609","systems":["Windows"]},{"id":"9baaa16661f6457a6cc6c6bbb09bbe5cbcaf57cab08272b7c436b9e88c95aa09","systems":["Windows"]},{"id":"9f509ee4bbf9f0dc555c44ec6b5b8f2da8d6f8380829439af2854e06da077302","systems":["Windows"]},{"id":"9f75edda20405cb348a8579ea03bc754a096a8061c04c83c7fc8938f72859f2d","systems":["Windows"]},{"id":"a2169d94555fbdbe5cac3dca681316bb88f982b2e88b5eac3afe27be28098e53","systems":["Windows"]},{"id":"a2df53678e907c6129a8f333b61a9f5405198c7c3bae80f5b204cdfb7d861983","systems":["Windows"]},{"id":"a327ff34bab66aa525996f49c81a26bb952ccc36384bd424002b67c5123de94b","systems":["Windows"]},{"id":"a54080bff145c0a36377e1ff933db745a2b05ce4f5802dbb499605de14838482","systems":["Windows"]},{"id":"a554f9ee69068d477fa22a5c6b19bdfcaa3d93f2a2f369e0efd1e21b5d81734f","systems":["Windows"]},{"id":"a67daa2086cb4b88eb2b03e23d339d7501589036720ed52074a8391119693dce","systems":["Windows"]},{"id":"a6e3623ef766aa4f58f0316c48011801e987ae5b71211d21459d56a3aff3ebda","systems":["Windows"]},{"id":"a6f86a1cb1145522f8693b6ae6cfa0af433ffc0f7b53a82f4d40acce11dde3a6","systems":["Windows"]},{"id":"a71cb8e5d02a11f1343796fdedd72ebad9c97397f16bb8b9259f002e146aff8e","systems":["Windows"]},{"id":"aa5c6740cde4fc80cf2235c4ddc8fe7679e831d9bd3bb279c53f5330558c7256","systems":["Windows"]},{"id":"ac4688ab83c7eddfe97ab236643e72d44e856f6affefd3b87c9f2e274d07ad03","systems":["Windows"]},{"id":"aca9d038d855e4a26f2db68ee715aef70643918e7b5396100894bbf2b2d136a4","systems":["Windows"]},{"id":"ad0985548bc07af61db23c8280ddf49651a877672c2e66bbae46f7bf763f445d","systems":["Windows"]},{"id":"aebe9bcc1cd6319e74afd0951b6b53b63c76eb9fc1b3edcb6690ba5cd7cae739","systems":["Windows"]},{"id":"af2b427a080d8496e78c576f1bedda8264cb2a648816f3cd1ad25b93ba2cb8da","systems":["Windows"]},{"id":"af548f98877c5dcea90db6046172fbf53a49246994fc5acfc721ba24ae9f203b","systems":["Windows"]},{"id":"af8c76e2ca64a13807721e6db8fdf24dc1ff820e6f56b52fc492352525fa11ce","systems":["Windows"]},{"id":"afe6a9623031cf5160f609b777beefb30d162b992e8ce38a1d1dcf0c32e65df3","systems":["Windows"]},{"id":"b0b3592d6147dd5df7a77af5baefdfc248123db637df1e9e9fb79583dd6385ee","systems":["Windows"]},{"id":"b0e42e0da82d75ddd70a05380500eeb7f7b8833639201e71e6290650efd234df","systems":["Windows"]},{"id":"b24196c28b220c0a8e345bd539469a7b9a7bc3572507062c0286c297a65a5c88","systems":["Windows"]},{"id":"b28eecca9cb915419cde6093020f795b31f7f43305744e5a0da827ff35edbc5c","systems":["Windows"]},{"id":"b7efe85baff32a994b5c95c9fd1b819012e96fba0f5805cea383f3c3b57b537c","systems":["Windows"]},{"id":"b7f9955c3ab7250a601e166eb327f505cee1757aecf20a0d9cc398f817b38e9f","systems":["Windows"]},{"id":"b82545a61ac1072456e96f39b870c0f8791c5e41b4f0f60bc8447c0319eae71e","systems":["Windows"]},{"id":"b85aaf2616d94213fd8c82bcad877d60c877658e58e139b5613d360795d67c28","systems":["Windows"]},{"id":"b8b1f9aadaa13235ba17a664d4bedc36cd7be4fc67693312ea763619753be941","systems":["Windows"]},{"id":"b8b6fb681b3b37493c4733f24313cf1510699fe2986435d461c4484e75ca2621","systems":["Windows"]},{"id":"b96b382a5c50eb192a7942bce1c0b7ebafe789e4fbcc1c43c044ef2f34fbc482","systems":["Windows"]},{"id":"bc2d80ea573c2a89ebc3ac026a9ba811dcc418cb5832be901cfe3e47c4ccb731","systems":["Windows"]},{"id":"bce9a40ba0f0ddbd3cd72c59b8e22a2c3f736fed63daf1575aae70b878ebaf9d","systems":["Windows"]},{"id":"be163a9f2ad2c27eb67ffa11a51a9661b6d78f24f642cb260b44048af509917d","systems":["Windows"]},{"id":"be86a5a6f1dbd0e13d6dbbab0197835000ba47ef9459ab005818822a3682e791","systems":["Windows"]},{"id":"c05f943c7b4121906f0e5a293ddb56fc93bcc22422ff11cd83e3dc1edb69f700","systems":["Windows"]},{"id":"c147c811f5534167b7e947349825cd2b0a861464555b78f84e106296456f77ca","systems":["Windows"]},{"id":"c280d7fb216843a027a3df4f0cd956502bfe8147b1353703281688012bffd441","systems":["Windows"]},{"id":"c399a08e9a502698d4ba33a007e7c2890ca23fd343f4876e161596d5d774257b","systems":["Windows"]},{"id":"c3d46fd45e1f7cbff2ef2105dbd11a8d561f5f5cd4cb0778d5a422719f2258d5","systems":["Windows"]},{"id":"c47a5dfdbbd70b385da70358652be311bf91490805aef889948688664d8e322a","systems":["Windows"]},{"id":"c4f7194bb2af90f8602e9b9e5c7b402eae648ce295e02bc29a1ed2cde3b90064","systems":["Windows"]},{"id":"c687d2a19556aeb39dca9839e6c950eb577887a7e47edf4d87bc9402adb8ea50","systems":["Windows"]},{"id":"c68f011bac2791c95f355660c93e67a9687c8093a8f2cc44eef59e7b7807a733","systems":["Windows"]},{"id":"c6f99281611e5ac58d6cf067680e35bf97be2f251dd7597a95468b0eda1f2e0a","systems":["Windows"]},{"id":"c76cc6124637da30ec93acf2c70734c8f42b8461f22c7bb341ca91e831dd469d","systems":["Windows"]},{"id":"c783a249d4bfc60f53cb12ecd7d235e7fb7176cdeea6869c1513d96162c9896b","systems":["Windows"]},{"id":"c946db6634101a1551f7d5ff911d00212859e53ba7f9b4090a54c7876fec6b0b","systems":["Windows"]},{"id":"c9a194e64539f799a38fe5bb4a3c286903ac19c018972941f4e60a845e66e168","systems":["Windows"]},{"id":"ca4cfa58d7e291133222c29acb47aadc87c69b81c093dde52539d939ecfe8b2d","systems":["Windows"]},{"id":"ccf1960408ff292a390285afef303ccb5977d5b6d6dc48b092688a71d2ee7bfb","systems":["Windows"]},{"id":"cd00da615c2f704b1d5910d7c162dd65b5e857078b2c60284c7a4656bd6a2ea1","systems":["Windows"]},{"id":"d2a9d7cbca4403262b2ef3aeca6b35828a831af306913b392c78b1ab7b1c4d03","systems":["Windows"]},{"id":"d2ba9791d300c9acc8cc180e124bfa6c2f5665f980e089bc342cacc26875f72f","systems":["Windows"]},{"id":"d359a1d1cc94cd257169333fbf79e68f17a74b24ec953b5d663c639a8353671f","systems":["Windows"]},{"id":"d3b55e997280137ad787fe27f60dcacfc6c77848a0d57c027e059a0cfc8a2559","systems":["Windows"]},{"id":"d439c10ad0a716d6afb7b570049df6fe95875d68bfc5719014b00e6e394921dd","systems":["Windows"]},{"id":"d4bdf4ca0553215657ea1d85cdf00521f2eb3c3c56bc5648899e00870cfdb62b","systems":["Windows"]},{"id":"d523c6e79445d0781f996ab0d6c7bebc5d4ed842e1414958a55ff91e80704850","systems":["Windows"]},{"id":"d6bd2fb8856efb51bd1012682cd00799907f0dfdd2fe85c72b4fc5105981f1c6","systems":["Windows"]},{"id":"d74cbe91dba87a60cfa3d6ba8fc65d825cd09bcd04427d21b478b17318cfb6f6","systems":["Windows"]},{"id":"d99ed3059f3fde472a688f3980cec3ad6c03aceba95d1713797a9ec0dc678449","systems":["Windows"]},{"id":"dabe23d5394b3ab617114cb8aa3084bf191fdf542de26c6499ebd9d9006de18b","systems":["Windows"]},{"id":"dd1d51e0ca57653003c8341e714331c188603074de10e3d04d0c5de80caa899a","systems":["Windows"]},{"id":"dd6570fe928ce1df84ec8a4776411529d39f909fd2cfb1734f9e2a1d663ce461","systems":["Windows"]},{"id":"dd7ac29af10f523fd569156dfb4d50e6e419c1965baa7e366aa0875100c5912b","systems":["Windows"]},{"id":"dddeb5eea652910f076b577dbf47b21ebd0a15cb4dd32c8946956ff6c6596c0a","systems":["Windows"]},{"id":"df8f322ba3d0ffd75f5ca69355bbb09871eb97c323dac317c5795fdb6cb98abc","systems":["Windows"]},{"id":"dfc1694ce7caef3669133109758e6fbacff69a67aef3b0cfebec832f5ac9e9a3","systems":["Windows"]},{"id":"e227918279229d7b4c5204dd2f85a51ec80ce492301d732d6008c89623d4987b","systems":["Windows"]},{"id":"e2b0b209f18fa052867996300e78318afcea2f58c74b8b27791fbddf6ecc8503","systems":["Windows"]},{"id":"e30b706de8216ab4798d2d9c9b741c40e81d3b75e97dbc0e44282c946957370f","systems":["Windows"]},{"id":"e3490ad7c0122d9182a866d578d1ddc5dddaf8236ade590abbfa4d3559224b06","systems":["Windows"]},{"id":"e385f3706d07cee8f3bc71d5e063a20a23d556133ec64fb0807f1253ce60e6aa","systems":["Windows"]},{"id":"e3d675c895ea47e0fd9f43fe5f02a77972cece66a28f022832e7bacdcf8cc994","systems":["Windows"]},{"id":"e571fbdfd7ee12a26361fce1135aea053305b2b61f51bba08666b457feb046be","systems":["Windows"]},{"id":"e67a18bd4345e4e4a62383395f1ad32186f26a81d996565ba38142ef61725fce","systems":["Windows"]},{"id":"e738e923611f2da6647f9724623b43cbfca4a0884d8b9e0ce04c72d92070f244","systems":["Windows"]},{"id":"e76c3f89e93a7dd9ac0f33748a3173370eecfb2a11db97ff27e7e164dd4ee4f3","systems":["Windows"]},{"id":"e78c8853b5a7cc56ac66f66285d2e64c44d440542f9fa21de2cf781d3e4e527c","systems":["Windows"]},{"id":"e8542ece1c21f525e62bae06465648196b2dccad18618dfa2a3891993d70ef9d","systems":["Windows"]},{"id":"e88e04f5008cd9b55333e014c6c79fe814fc8dcedd47cc3c86e18ee33f56fa13","systems":["Windows"]},{"id":"e8a293e4f4ec6119f16904257fdd788d086d69959951db835726b8c81916e296","systems":["Windows"]},{"id":"e90415e839972622a9811c43f743b9da0d30b46ff26544e555233fed3fc8186c","systems":["Windows"]},{"id":"ea68c1786597a506ae7c5f96ea877bcf54bfb2c08e172c26c77a31e470b5314a","systems":["Windows"]},{"id":"ec079f14275a812dd02abe4b7837ebd44454365d64c1e5cee61eb5aed2f9f3f3","systems":["Windows"]},{"id":"ec81fc53c74070533710cb2583d6dc917604f0418356a74ebc846fa691412106","systems":["Windows"]},{"id":"ecc1bc801df8fbba81d3f8ec85457da15fdabf0eec7b2b62681c6ffa49fc33ac","systems":["Windows"]},{"id":"ef24a74ccb8fd0b126be44ad788e432fc9fd9bad9b93d56dfc7f0ce3a1e0f732","systems":["Windows"]},{"id":"ef8ea638823e202eca30c1d59e6bb89310e0e1f2eb462837d391801ad804153e","systems":["Windows"]},{"id":"efcafc148ab4860997c4929979037174b44c0b863b9bb1e028d85fbf8f434428","systems":["Windows"]},{"id":"f1771fa38bfdac2e5385ea475431d894b9c7eaa8a7081ee5d1ffb15b152d47d5","systems":["Windows"]},{"id":"f1f252d4fc9fe3f56b04c497f50de2a089dc896d578f9a9b6253dd5dd67ff89a","systems":["Windows"]},{"id":"f296be4e8b1a7c4ea265c2e7ab263c943e6c920ef9b740157e40975da56f095b","systems":["Windows"]},{"id":"f32be4d80dbba41bdfb25859997f2b918fe66be200fbb4c617a6218d168e26aa","systems":["Windows"]},{"id":"f4b8c8d4b2ca59c426ba32bea59cb05b8e82f722be3ce2a9cdfdafad19b6c63c","systems":["Windows"]},{"id":"f73917f25c9c373ff7bc4e57f3643bf12106e413a11cfbcc194b3ed48c625102","systems":["Windows"]},{"id":"f8acfc910e5f9bd9af1bf47151688b19a80060cef7b8b204c4599e1e89c59d8e","systems":["Windows"]},{"id":"fb5caa347ba1d24d23db3cb0e52cea8facc1408b061b82306cbe5397d037e625","systems":["Windows"]},{"id":"fb635704dbc277f99ddb3c1b99be225b8e4f84532c046b67680dc3259aedd893","systems":["Windows"]},{"id":"fbfd2d9bd34b4f2d931bb0e665fc569df100953b8c8c64730785681bbb097d0b","systems":["Windows"]},{"id":"fce3d39fbfa4b47889c1b2571318c70afc57c0b6629c9fa571196f562478b7ca","systems":["Windows"]},{"id":"ff9ebe2d244cdc970b156faee15c7f280f2b0f08961fd85c7a5f5b25c4ad9b69","systems":["Windows"]}],"Firefox":[{"id":"0022173c464356e8be4eb17d1041bdabc3bdc99a8bc9e736a1809dcf1ae6a09b","systems":["Linux"]},{"id":"0024a20ade7e776b97bbc234cab99c9c3d6926e0bbc68c88ed83ecb4d11e5271","systems":["Linux"]},{"id":"006e65457568af5b0b3ef3222ceb1a752beaabbdde193c746dc5908230f192f4","systems":["Windows"]},{"id":"04ce525fb06f2490f3ad98a3b6bcff1bc3a06bd6b1ada7962149aa47bf2272c2","systems":["Windows"]},{"id":"06732a5e98758dd750498277d868e5a4fe8de41d86944a67deb756ee014e602e","systems":["Windows"]},{"id":"078b76fbb21fa8f17760eab06aa3f37136efdab24d7d70a53ca212fa8fd6159b","systems":["Windows"]},{"id":"07ad7341c3675627c6c99af9cdd64e1ddd13e9eb428cf5d3fedccb1ed4edfb07","systems":["Windows"]},{"id":"07c1d0a003d1c3a28e38d47860bb01df68632296a4611a821f3380a1fadbea4b","systems":["Linux"]},{"id":"0803efdd3c97f515ff612a2d591ccb177b8ff8033a994b4eee0622fd54e1b6ae","systems":["Windows"]},{"id":"08367d12681001a8deccb998556ba5a1a7deb89dec7851dd252b4f45a0ce5cfe","systems":["Windows"]},{"id":"0865d2f55eb0ab89cecae954afe7d257e100bef285a00c327cbe0a52b0a4c7d1","systems":["Windows"]},{"id":"08a43828d344ef2f2ad3345207aada3fdc80a01fa48ba6b51f5ce426856ba3ea","systems":["Android"]},{"id":"08bfd59decb4e630a6c61f5fc1a509cabc74358a1054da03c91833f1370a8d83","systems":["Windows"]},{"id":"08f2b5a44511b2145f9cc50e2fc2450c269c0feced0a6f0c0fd9cbd261ad1057","systems":["Windows"]},{"id":"09b56fe87a3c42aef23b9eed413d01000c45551269b573567ea5270640e85880","systems":["Windows"]},{"id":"0ad52aca39514ac8e5e66e002981c495115cfff0ca7e83c66e666a1d9b6c908e","systems":["Windows"]},{"id":"0bbe0f1466bf85331c4d2ebb88ace32786bc7442b76857edb06af2b6f76b522a","systems":["Windows"]},{"id":"0bf31b8f6dc59aaeccd67c3dde2571b0c54f762d09b34828fe7f50670814f278","systems":["Linux","Windows"]},{"id":"0d04e44d960b87d195fd4d6667f83880f3b251b8594d423085fd90179991848e","systems":["Windows"]},{"id":"0e3e7db6eb185aa1a13a02f032c696d2ed9a4405fbfd2935c00c5350486531ed","systems":["Windows"]},{"id":"0e56f3dfe2cc5c31b6929a16ea016406a79a33d470388337ef64110e2616bb17","systems":["Windows"]},{"id":"0ed604f0847394d9564e786be574bde5db0fc24aeacb569b522671a3fd36ffd0","systems":["Windows"]},{"id":"0ffb52a45a3b1780dd1ffe7958b3591276aac28322429ea8ca3d6daa0a1857ec","systems":["Mac"]},{"id":"119a9c01aefd7bf0c4c9f6b6930aebca8c2fe35086e576a3b1cc7557c558d421","systems":["Linux"]},{"id":"11f711ffbb0ab8804f0fdb54f4a28d3abf1b0c4288c631f50b64f503eedbcc37","systems":["Windows"]},{"id":"122edb1c2f39f303ebba83de9a3e0c12ae7169e0b734f37e09f2e5721650e84a","systems":["Windows"]},{"id":"13ad654855be02c17226e5a334c4e715d19bb79440e388a38e724c47205eb0a2","systems":["Windows"]},{"id":"1441ed26b15fae9e0299f6691eee3dff2244164ee8c564e47ec18e988b865902","systems":["Windows"]},{"id":"147ae5a10c1d1587304138a1d9bebfb5b697ebc8d4bd730557c0e9138dff4fa3","systems":["Windows"]},{"id":"14ead40b44b0975057de7a4dda2a5516131dcf7d98a75b9151d414c4ccdde73e","systems":["Windows"]},{"id":"162219693bb32dcc802580057e0d877454929360ed6c7b762e791d656d251164","systems":["Windows"]},{"id":"177a56c40f160f64849ad242a351878ce41ad6275501630f303083304bf13168","systems":["Windows"]},{"id":"1800e0b044a592d261d5830644bf4c2e471d952b82e08d005b1bccc015568736","systems":["Linux"]},{"id":"184bbf42e2aa0638379ce732c5868af2fdeec80ddb9169b93a0e52d88324752a","systems":["Windows"]},{"id":"1944fb8b43cb5eae5f193093168fd2de4d78bb2e3db8d47a3136cad51a310e42","systems":["Windows"]},{"id":"1c6e0daf890a31ae1a58935f7a53a38a74bfbf91521e679cb68422167c258920","systems":["Linux"]},{"id":"1d681f983175a0208711d129b47113690de8c5e971b47d470eb494f383a6c747","systems":["Windows"]},{"id":"1e0cac54ca092d23f59771aa8140acc8beda831d8f817247e0d7b70fe9bea7b1","systems":["Mac","Windows"]},{"id":"1ee92b73549ff0cc1224805d069176c8808cc5a505779e241044ae55f1c7b5c8","systems":["Linux","Windows"]},{"id":"1fc4ed4a0d4a8c9372145df692b993a43936ae84def5176acf19619ff6379893","systems":["Windows"]},{"id":"1ffadd3b0fbe1a13f958477cf379bcb9c04f0fb5e261685b6ee538fc9b8f986f","systems":["Android"]},{"id":"21512369f6fb7034888825d356dd750134cae502745a4e01b66f93e92f8ee162","systems":["Linux"]},{"id":"21c7cb6b30e124dcd1004403d0d40a2fd47b1c8dbaa252633f7ba219129ba258","systems":["Windows"]},{"id":"2231b9c8efb4baa8fd467c50a0f4aea2e69dbf64ee479942b2e1e605f61dca2a","systems":["Windows"]},{"id":"22e219c84595857989b3ea89044b1ff0ce2d0b1ffb893f4924656cebc7aa77ff","systems":["Windows"]},{"id":"238ba2eaa8aa26e29b020756869e86af38a70a0ce6eef93405b7970763c8e446","systems":["Linux"]},{"id":"2414c168a972f36264be2a97da8093ad261cf9bcb2977a5d9e55ab1ba7dece34","systems":["Linux"]},{"id":"250ad19cd178f916bf981d8d2a7a72fb8098fd205b66c281c0bce983fba02931","systems":["Windows"]},{"id":"26190d778d8f70c3580ffc15f7a47fc2b98c7020be390dccd81a83dd2f54aa57","systems":["Windows"]},{"id":"26f13f5f5eda83328bc263333e89efd7d82a18454509dadf7d7ed8bdfc6efc18","systems":["Windows"]},{"id":"28d0edeba123e8b6462fef1b96c11b905d5c838c71473b223529bfe3c53c191a","systems":["Windows"]},{"id":"28df96bc5fd4aa08f281b4882c8838ae9a4ca007bd4508fce895206b0335b66f","systems":["Mac"]},{"id":"2954ecd6b4f0457ac381e0f707d9b72d67604db042083c5bba8f05922797b8ac","systems":["Linux"]},{"id":"29e1628fc6639d7021e856daa16dfd41d1b3cace172d1d10c6b99290621f4609","systems":["Windows"]},{"id":"2d26298e7b295750ffec1ec4b769730b741990c1c6a56c0bd9d9e0527712c436","systems":["Windows"]},{"id":"2db9b3c7243e964d49b16e25dbdd994013976f1307f5f4d3b6e28a5fc22fc1b1","systems":["Windows"]},{"id":"2dbf8550c8825fa7c179ca7d79f073e3b070141022e2b9f2abc39054229d85d7","systems":["Windows"]},{"id":"3015e66f7071399a7fe43a844679ae4dd6ff00db385e926e8d1bffe6adfda093","systems":["Windows"]},{"id":"303f57ffd603146759d358d69796e0ea54374e6a916b52ff74cc1e84482386cc","systems":["Windows"]},{"id":"30a116af5ee66af190b42a62682901e849b0bb737429dcd829efb638021bcb30","systems":["Windows"]},{"id":"3106c18800e4da88854a83e339f1280b6c2223e42158825c04ddcf00bd53b549","systems":["Linux"]},{"id":"313a2af7ad63bb499db2c53547d4f9f8cba32480b67d791691706da479c3432c","systems":["Windows"]},{"id":"3180535935ac4c1d61662ab621ec7b1eb0b400f6c8204fa45464b348723ac554","systems":["Linux"]},{"id":"31bdf694771ba45c3bf17d939e9d218790f2c7ba1ffe06b0b70255533a99c9e5","systems":["Windows"]},{"id":"3218fcf7d135532eb7568581d5e76c481474807de1c2f8bf2657f26f92e4e60e","systems":["Windows"]},{"id":"328243a5c7830a2329f5fca6a0d0a61ebbbd98614f7d57198aa43dc267921800","systems":["Linux"]},{"id":"3465c5d14ac5dec0c411069f5d0add4a70f94ce4488b9f3cbfd69bc4019ef946","systems":["Windows"]},{"id":"35ebb0a31239a69d6539fb0784f4dcaa9f7271d17f8cc39ac41b5168b4e53a1c","systems":["Windows"]},{"id":"35feb0432e7c011051de798b47e0ec136ee454bd033d0bbe6a07557e54f62d1c","systems":["Linux"]},{"id":"3613c31eb1a6fb4b25f4178939b71ef2a6df46f6ee4831bbf96308cb76466261","systems":["Windows"]},{"id":"36e47e061bf86dc8033073aec124d6b018bbf3412f7792cf3881cda899fe59f9","systems":["Windows"]},{"id":"37849644ec2223f543d4182d285aa316d30450fdedf38f13e3265d866483d1d8","systems":["Linux"]},{"id":"3789eae3b8a238d39ca0ec4c60339e6dc61c09d9a513e62652aa4d4465cdcf27","systems":["Linux"]},{"id":"38216029125a114f5f6fcacbd5c60cdf851d8ad8d08bc67d742c02f131e31364","systems":["Linux"]},{"id":"3be00154b68b424cb0cde995861ba6279e761e89490ef45b116bf16c6df10e70","systems":["Windows"]},{"id":"3c68780c113ecbfeb7cb3f33497a0f225a853e533fe90f96d38a76beb2f63ad1","systems":["Windows"]},{"id":"3c969e3e5347b0fbec5169bfe2210393081c6ada3578f8427ed985257c9aef97","systems":["Windows"]},{"id":"3d2d719cece7b7d0b60a34702cdc5395f66f2c8dfa159bc83dab0afa23ce9384","systems":["Windows"]},{"id":"3d7fc8cecb83e6662e6ec1176247e25de54e2c30a5c96c0b97b804642e6b3063","systems":["Linux"]},{"id":"3d973f904db1f4fd6c670f1c17abfe54bb335ede36fd2852c97d9ef67d369a6d","systems":["Linux"]},{"id":"3ea00faa4a3451844ddcbc39a6919c7964a06842d6e618be00bfb220911d6bb3","systems":["Windows"]},{"id":"3f0fc3ecedb6ae30a813d7b3fc97da9988ba7c57f80f6c8ee4f529a2b8baa29a","systems":["Windows"]},{"id":"3f6894d0d6c16c08494b8b263dcffaadcd0313abdfbffd94b50e9e97347fc9c5","systems":["Linux"]},{"id":"3fdcc89af706f336bbf611fc3366c506ff34cabe5b10e8546db189f4f0e0db7b","systems":["Windows"]},{"id":"402abc919dee1c05a462db8337498bd8f8bdf2ec71df8a8ff2f4c24c3411f044","systems":["Android"]},{"id":"40825c0591ad9ab6db4f017bd5ea089661663cb73ca4c3cf17b0887dadcaec5a","systems":["Linux","Windows"]},{"id":"410f21445ff60c91e72d7fabd225754282b23d5e6f931fafc1dafea44ac36dee","systems":["Linux"]},{"id":"42c20f4e509a3abc3adc2caec30eb95ca3d7c51a891c59b47f0f94832120051c","systems":["Windows"]},{"id":"43338a5023d0e3743d81a640cf712d06371de33cc09ec737aa4fd66379abd7ee","systems":["Mac"]},{"id":"437162f38562e95f0351490caf07f59c52406ebcd04c436d4ffaacacf6173367","systems":["Mac"]},{"id":"443a048dbe5cc7bbce8dd070d70b6c6f841145df0f87fab548898e30b8d3bc16","systems":["Linux"]},{"id":"445850770b769bc8a56266ab0e0362f0d6615a683c79364c8944b8347c015650","systems":["Mac"]},{"id":"44a85acb709954daa2cfeb5339131e9f4dd9d419175df0d21eb0a59f8f0c4311","systems":["Windows"]},{"id":"474433d66470f47a6b04f9124a9720fea46b56f7746244324e39e0b9c9f1a574","systems":["Mac","Windows"]},{"id":"47968b9196b0fc19bbafe9cf82336c4a93895d498ca27563d6dd0b4611ede0ef","systems":["Linux"]},{"id":"48ccc3dd7f52bbf930ed0876aa9e64c19c99edf49cb3fb0321667ac8e16a3fb7","systems":["Mac"]},{"id":"4912370021ad633f4f19553d624a2829f6476a147040228ab8b33d0a54bc01e2","systems":["Windows"]},{"id":"496f7f453f8ece75776e30d3b036b77ddda236173dde9ec05d757ad877701c2a","systems":["Windows"]},{"id":"49b46d425d1b8181ddeca992eb6869a8731be8c8ada99fe6dc821401a51a2c33","systems":["Windows"]},{"id":"4a9da61ff676b3496b6147a1e2646c60ec8d7aeef0edbf42fc736e01af0e6cbd","systems":["Linux"]},{"id":"4d40af07449bfd75bdef27f0e3992c975ad90d13ce90a0a814cbe908bf9bb92a","systems":["Windows"]},{"id":"4dd17f8a481b9e981bf0b6668af8e36f1fc63369443691d6be421fc3d9664a83","systems":["Windows"]},{"id":"4e6a85c58ce510b868cbc42c70d96046c0c0565355a9c51064771f18b6f8a9d9","systems":["Windows"]},{"id":"4e6cb3bd9ac695cdd1fb151983222ece110f8c39e0624384bfa547a4640b6959","systems":["Linux"]},{"id":"4ea482e86c30d9c5f1a299bb0961876e1ba4974dc1f17f6fae9d619bd65adba3","systems":["Linux"]},{"id":"4fe26595e0e00039f5bc13e612702ac0fadb717d52d94a3226606542f483a3fc","systems":["Linux"]},{"id":"519cc321caa14a226b650b794b0b9f337183264a5f9b7681c1b85a1000f8c49f","systems":["Linux"]},{"id":"51da8b62c47c8da3f0965e390f5a242fd895ac71cdd027ae3bf8e1339820e2d4","systems":["Windows"]},{"id":"52635e774d6608a1cc60b0f38fd5d665a86b7cbf412d9ebbe7b43274abc64c02","systems":["Android"]},{"id":"54addb079a58b10cb0a957a463d03eafcf504fca2cbc1866e8a28f561e82e152","systems":["Windows"]},{"id":"551ab2d4a2620a44d4787204d2e56f7e8868a45e2468e1fbe6780f931c95da50","systems":["Linux"]},{"id":"55e7834c022f52cccce2a1949762574255c86a6356775666a20c310fafcdb1bb","systems":["Windows"]},{"id":"570a4cdaef22270a6f89d047bfdee730df7b6e9c5fb00856447622d3ae0f0dc9","systems":["Windows"]},{"id":"581a92357728c02e6edf2ab1115c8d43578a79b3f56219877e826ab526bf403d","systems":["Linux"]},{"id":"598f1aa934ffb301a3929604ac3c79b8982006d2b774278db5435eba4957f7a6","systems":["Windows"]},{"id":"5bc418d4264eca0ecfa2208c1b1b9648d803b992011dd0ce687bd755833d056d","systems":["Windows"]},{"id":"5c0e859c05404988ac75b2fc8444fd7a4133249ba9e501cd4752c8b2e16b97f8","systems":["Linux"]},{"id":"5ef1ae4199a8e4b07264d38c978a7943e287e7be4c77bcbbcc5f4f441bed772d","systems":["Windows"]},{"id":"5f46a7547e081b5174b11e7c0b8d239555b1c6c908e20ee9226d15af79ea1597","systems":["Windows"]},{"id":"5fc23b0514875d69dcb30819f197983b7dec21c523a74a6079ebc3c8b6a6d8f9","systems":["Windows"]},{"id":"601d575a2aee4e97f130aa47547ce81e64a7822f220185fd0922ef80c734958c","systems":["Linux"]},{"id":"6022d6dc7f75278ad99ed091f3212ef08bfdab5307f02c39916c78a83d80d1de","systems":["Windows"]},{"id":"605d8fe6bf6dedd45cccae95c11e843e8548fb51899b5529b97737be8ec2b9b1","systems":["Linux"]},{"id":"60d2ee900f1ee53ea68ea762e62842e965a528f2052600f606116d8628e82669","systems":["Windows"]},{"id":"61ea8b4c761b959470bc6104b459dbdb95b331a5bedeade60aa3862235bbedce","systems":["Windows"]},{"id":"623a48460ec4e748333a287d26522abf1f5782b37c6e64d43f52d08836743378","systems":["Linux","Mac","Windows"]},{"id":"6265d02ceb174c77bb013caab712362af296a2a6136e371b5cde58c861763498","systems":["Linux"]},{"id":"64ff51ccc224615aa2d7851de540e77b410d2e16d3681f7b026542f32e296826","systems":["Windows"]},{"id":"65889f19da8fd2d1ca5001a61eada29cd4b35fa48585e3ecafe5f28c2fb36d85","systems":["Windows"]},{"id":"65914657c3e504c2b8f3bc58fe9d163cb10b4f0f2f9e81466c25f1eaaf130069","systems":["Windows"]},{"id":"659ec68523a3e6c3c1116f7fd2d51ca16ba2df41c8397232c631f2022025123f","systems":["Windows"]},{"id":"65aad40ad246e5bcd60141f86b1e37409a05a865f80fa7c4c19597313478a274","systems":["Windows"]},{"id":"66405a49459eab75201e85488cd6ed084ff0b57fd63822e05e20d1cd09935717","systems":["Windows"]},{"id":"6670089b9e7e2425be8a5231a75b25e079b1108ec56ba0355d884c403ae9a676","systems":["Windows"]},{"id":"67858eec3cdabcbf2176f783bb39f1c7517d01aeae6128b8cec0bbb5b86306d4","systems":["Windows"]},{"id":"67c9b60820f7e6d8a899636a2160eec375424984d80a39cd36444389cb6c038a","systems":["Windows"]},{"id":"698820330dcfafb7ac960e3ea5764d25592e525569be072f37d9b871217f0d59","systems":["Windows"]},{"id":"6a232d03ef56c2debafef906ed13f7134bc8b6129416a56bc093ddc02fc00f07","systems":["Windows"]},{"id":"6a74a9518856d63cb5bc552b538131eaaf30a461f897aefd9ea7fa4be7b7c2e9","systems":["Windows"]},{"id":"6b33a0792dc16070dc53857fa4c69cf8e386ed4d2e6101fc7cd21fb2ec131057","systems":["Linux","Windows"]},{"id":"6b9a52bb2098a6031f00555cb4449ff083d39922072657d675efa074ec616f62","systems":["Windows"]},{"id":"6bc978663543d224b646b5d66875ffd87da2ba6bf1b2b98d0bf9ab8c53bd2ca8","systems":["Windows"]},{"id":"6c230b44b986c20f07d8ed67d1180e13a08ce84ac53abee2f5eb723b1c4d30fc","systems":["Windows"]},{"id":"6d7977708a3dabb2fa417d5afb2f6a9424cf4ab1975863ff690e0bb44650849c","systems":["Android"]},{"id":"6debc0b8546bc4c04a2b76c72a93348bc0ba73fd27e11418c3a674aa1003a904","systems":["Linux"]},{"id":"6f4ce941d7f006e7b74c318a70504a3310d7bdbafabe81b32473be2a03d53fae","systems":["Windows"]},{"id":"6fb68991d26839faa7209f28ede7f9f8170a5a463368ac0b45a2512636fc9c4e","systems":["Linux"]},{"id":"70379eca90167848749b800089245c324e55426f5c3546a4e8ebb75a3a51aca8","systems":["Mac","Windows"]},{"id":"713025e67784f93d21b03366d5dc6302ac7808ec672b7f9b19b1efc4443a8125","systems":["Windows"]},{"id":"71d1fa5da8c0923432fcc18e7cfa86285f711601d70b848744b8d369319d28ac","systems":["Windows"]},{"id":"71f152f3bac42ac1c5c679de102db0a1a758e9fae078d612beba0d3588188679","systems":["Linux"]},{"id":"7263a0861fd57428460f79565fcb8d4fe817ed3d66d91d079fa6e033b81cc124","systems":["Windows"]},{"id":"72d88899fc1be749e46f46c0bcaeb302fc13aaf27b446072cf7ca0dd64c908b6","systems":["Android"]},{"id":"730438dde437a5bc000b2d5efa24ce61085113221d65824dbe0235d995dd90fb","systems":["Linux"]},{"id":"7320c0bc22649012c765e4127f3a89688158716744ce3ca539c3f0d324ca6ecb","systems":["Windows"]},{"id":"7328a592eebce3f51f8cb3bbbfafcee8c83594f227946ff0a0f2bfdd9531dc17","systems":["Android"]},{"id":"742af888732f440dfb13272a772638ecbc932c4222c478e04211998c61849361","systems":["Linux"]},{"id":"7438c572a489a3316da0eb24d52d8ee683d96217bb5c606da9e036def9fe3bca","systems":["Windows"]},{"id":"7605f4bcf079b1f37e7adde55c2ae098b5dc21297421758649251f290b4cbec6","systems":["Mac"]},{"id":"786a779327c042020dd0907c5b2a0505b08539916c48d1590956772fb7649e66","systems":["Android"]},{"id":"791314674241f78c9a8fd1ff96d22cc9a4d06405553f76731b38422ec6669aaa","systems":["Windows"]},{"id":"7a33557a9e322e22ac2b9acc72fe9ae0def60b9ed6b50adb442f0598ae79c71f","systems":["Windows"]},{"id":"7a7eb328409d38122f38235dd463659e630ef4f5f3b9f6325475f5688197eba2","systems":["Windows"]},{"id":"7bb51eb0473476b9487c39ea19a17009d7826e3006faf7f09617a7be2cf1e128","systems":["Windows"]},{"id":"7bcbd11f14eb104265e284310f095fbd997ba54fd7be1be26be94ca5362c2cf9","systems":["Windows"]},{"id":"7c6c804d0fbba6dce9a61c968ee8c038810b8874eaa1f2de9ebaab63f1e13cf6","systems":["Windows"]},{"id":"7cb4fdf3dbdfef6040c22a7aa250001fce5adf9bbf5fae2e6d15435699b59b3a","systems":["Linux"]},{"id":"7cf49c6f7166af136b60688a11fe84b4406ec4384b752384e199bca788228935","systems":["Android"]},{"id":"7da4edfa61bf7d7990a492850fb826c7c255962af61b5693efc5ed3ff7992b6e","systems":["Linux"]},{"id":"7e1921e712d21f9d3e4c0d2c51ad0d797d1d7f2a91db7925aac5254aeb47e5c2","systems":["Windows"]},{"id":"7fef2f24134a724ef4413998071c79f3ba1489a5141bb0df3d6deec02a753432","systems":["Linux"]},{"id":"8090f118a71dd909c174398c9134d2779b6c0554bd818eacbd2075f37d3a73dc","systems":["Windows"]},{"id":"8169c4a0b157f37e2409c82e243ebacc8fc9f52e098583838d3f286a6a0205d3","systems":["Linux"]},{"id":"81e34d9d9cd14a2787833b69e3a36bc57cf5a8da66785e722be2fdddea555d33","systems":["Windows"]},{"id":"82d12e4b6bbbedafad9371c234478306d198c0176ad616eafc4281aed38f15c3","systems":["Linux"]},{"id":"8314d3739d8669c660bf8b16e0752355c91184d965ad150f0c28fee33628fe9a","systems":["Windows"]},{"id":"83b0f371be2a17650729b826d0a9e72a800837080418814a0bda4b993ba194d3","systems":["Windows"]},{"id":"8523cbaa6d2489ce55fe48b89a1e52b52f933f3d6a3338be2ce64ff142a6a513","systems":["Windows"]},{"id":"85ae7ecbfd2a01890fe131082f4331f95b7520572367098d29197659e21476df","systems":["Mac"]},{"id":"865355ce62fe252ac653021b85ccd1aa45a6afecd3b7322526b12ac7b060dfb8","systems":["Linux","Windows"]},{"id":"86557dad4f2e228a2b7dda36d57f30292877c96fd4a7227f7dcc17e0ee5d7025","systems":["Android"]},{"id":"867e3159fabae2cca6474934632178611177cd012c4e9b1f8801d7418a25d53e","systems":["Android"]},{"id":"872c7f1dbd7cdd182807e70ca9329561fb6a07a10221ebaf85cbc0b8ddc79afc","systems":["Windows"]},{"id":"8776547afbea3ee18fb41aadccd47a4ea8d2d4071d395c7a75038e4b26883cdb","systems":["Windows"]},{"id":"885e9050a5876286be091a831abd9f311366d58ce937e0a999385ad1e1acd75e","systems":["Linux"]},{"id":"88f60f53eb69033f8af05f0a166fbe89911356bd71af4e39d2352eaa82ed023e","systems":["Linux"]},{"id":"8920d9fc4b8f0652d2378d985cde45ed0125bd94011651a3200760d3b15cf4f7","systems":["Windows"]},{"id":"898305465aa813c61ca8587db1321472a81b737efb194e7d6999ec39ef9c31cb","systems":["Android"]},{"id":"89871e6e98bb429316992cdcc5dc0c10986fc58b52c2adc1175ad296a2c110c6","systems":["Windows"]},{"id":"8ada068868060fb742493af855d1210a8cb1689900dcc5146b6cfa36ac933e41","systems":["Windows"]},{"id":"8b39da42cf908f70d9aae0d75d16a41d2f29b4d6f84fd1a38397786028453a78","systems":["Mac","Windows"]},{"id":"8c47060be3eff49f89d16df5beec2de7715244a2befb8364b266dae1c03abfa1","systems":["Linux"]},{"id":"8cbdf97be71a45742da3066e87eea0d8342c086c9bae39a9a9bff202c9829c8c","systems":["Mac"]},{"id":"8cdc4cb6d402a9a0d7e8d04dcee3bf74fb5baef36a85c6df90d9131a68a7652c","systems":["Windows"]},{"id":"8d2f91030ff2ad5f3feae3b6427f07be10be131cc51824340dadfcdc728e3deb","systems":["Android"]},{"id":"8ed0b81d702b26a15a525e6792b7bd08de20b879f58238d6505392a90a80c869","systems":["Linux"]},{"id":"8f626bd87694ef4a25cbbf3c3bd896694ab179322cb4d3f35e37c3b39a0da6ff","systems":["Windows"]},{"id":"90c1dc64598dd76c54a089090a924c4d829d5fc9b0d8809b4d13d16d18d13d3c","systems":["Windows"]},{"id":"90c5e6b0df9d7b8989df299add3f0d010f67e2884ab94d113b8bcc97a96e948e","systems":["Android"]},{"id":"91107649943977b960412d259f021e95fc07047ae7f93fb482d35b6106ab5440","systems":["Windows"]},{"id":"91b621e9b661a2032302e606db3fe00519fc902de5a1958ced6ef3bac66a4248","systems":["Windows"]},{"id":"93da9f6351d04b43a512b405154391c4cd5831d968074a2604025f8f143c04e5","systems":["Windows"]},{"id":"94ab6f46ac64b949d3e58bc56c3be47a01e982b5c8398527e72bb75f1ad0f807","systems":["Linux"]},{"id":"951c4b7d0299cf16518135615e2b674a1df89cf4845afbe50f2e3540d3da8fe6","systems":["Linux"]},{"id":"96c4fcf63ea6c3d26134e113131cbcbcce249468965a42f2ee3cb8649e17a8f6","systems":["Linux"]},{"id":"99235d7769194eed28e8c1db8c38c4bea9e000fd9be0fc3c7883c1c03535e10f","systems":["Linux"]},{"id":"99c069760925efaf40720a1f6c8760caac0397418548a0efa7bbb58035e3e5c7","systems":["Windows"]},{"id":"99cc568fc450acc1b4f7562f76f09ffca05ea039c410c2dcb8dc1f6ca32706a2","systems":["Linux"]},{"id":"9b596e1eae13e97b9f0a9ea690b2616c7d9a55c62678fd0286daee646670fc93","systems":["Linux"]},{"id":"9ba38e86040fb3ce22111ded3b51961a2ad8d4583c6cddfea64ff1c4014db374","systems":["Windows"]},{"id":"9c1051e628f48160f949244f20eb3d142e8a263f074d862d40d13b196e491531","systems":["Windows"]},{"id":"9e4edfbca42829558d560b7e5676a1a77255290256d9998b211977741e8e726c","systems":["Linux"]},{"id":"9eca2838475fdb1747f2ca9d6adf6f33ed05a85979c94d977c3ae761e95f867d","systems":["Mac"]},{"id":"9ed1a944b717b4c0e6c96387468b6d5a306fbbcf8d3d6bb6c0eb8f3863caffe8","systems":["Linux"]},{"id":"9fca685764ad88f532de4892d774bfa31ec23e803dae4db9c177f83e042d89d9","systems":["Android"]},{"id":"9ff00d8ceda4ab6c98c2cfcf68ad915b3177d385f8670e192de0d6ab432e40e0","systems":["Windows"]},{"id":"a0c0cb71a64155eb5a89caebf86215331d7475b2578e81c1de3e6f8ec7ce2d7e","systems":["Windows"]},{"id":"a1301ffa99ffb6a7fe9c3f895681daff4a77c669bd5f8022215dcd804ec02d6b","systems":["Windows"]},{"id":"a274ac49d0ca1f40eae5386ff09524c5e38f260b732644e80eebcbee6441732c","systems":["Windows"]},{"id":"a2809a8eb9e6478fa2d428f2ef724f16318e07b2439fdfc03f567dfcae9d2527","systems":["Windows"]},{"id":"a2d3b6f06e2fdd9e1b9a8453a64e2d73b5bad150995f690763d66f8f109340db","systems":["Windows"]},{"id":"a443ec3b886ebdd8985b1c8e083281b1ee0cf9114fe95cffcf802b9c4789cd11","systems":["Windows"]},{"id":"a560d2ac9ed1b7fcf1a1b9a6efb2da33265d2018ea89740a781fec8b3ab0d620","systems":["Linux"]},{"id":"a605032207ac4bb05023356dfd68516afb8a6c3f1efe5099071af6f6c2d646f7","systems":["Mac"]},{"id":"a6df4e59e6089ec11a581a373927d29e6d4c8069def191eed1a0d396f7b5b171","systems":["Linux"]},{"id":"a7421c36ef2f3f05cd1461186a7a1f873ac6822bfed753f8386dc5a060de4985","systems":["Windows"]},{"id":"a8a1f26f436a4231bff250aa1dce7b8fbaf584982676a416364692eb0595708d","systems":["Windows"]},{"id":"a9c2dd32e120f56a827f9386164ca3eca1619eabaafc4e1d0cf90d048b0e6e1b","systems":["Linux"]},{"id":"aada5409ae34307fca7169a2f649c5d7f8386faf3bde0b42931a5575ec2dca7b","systems":["Windows"]},{"id":"aba1ce5e0d923fdf6efc26b6d2a6886d65dbcfffd33601a3466f2e5bb88a3ed5","systems":["Windows"]},{"id":"aba4e1062fd8e2709acef4aeac954832cbefbb6fe49e3bb2f48b70e57dbd9aa1","systems":["Windows"]},{"id":"ac15c94197cb2b1267ade23046f5adbc63d6c7b016f7fb8f42544945cb7de82f","systems":["Windows"]},{"id":"ac3878b84645afdd39bb86170d1b822c99b05b468dc96cde65ddc856af301169","systems":["Linux"]},{"id":"ac9a658f86b83e46fdb0b3f3840b41ada69c2ceca456a9ddc590ccc3726a5351","systems":["Linux"]},{"id":"ade9193d3f055de4d555dd3cee517b2e8ca615e984d81630eb91788b08b5a3eb","systems":["Linux"]},{"id":"ae0cd330effc8cddda711fc63ddc890a92ca08c17c0306abe9f70ef3169bf7b2","systems":["Linux"]},{"id":"b073a3bde5fc231a9a655e09905b52c71f7c6f51e6921875a9f1b603e5f3adc4","systems":["Linux"]},{"id":"b104e240a5ccbc1e149998f4250ab8b2e5bee904ac04deb60cb71ffc653bc31f","systems":["Windows"]},{"id":"b112450fb4f8f60488c6fb2f6ccf6ce52650d68717342f7dd3ec3b78b996c5dc","systems":["Windows"]},{"id":"b1b03fb6f757cb98f7c66f8a2b94086987e1e4301999399cbc00ba4691cb8573","systems":["Linux"]},{"id":"b1d579b2ea8a266ad942a36938dae49340624c9bcfee0d8eb85d3987458072a8","systems":["Windows"]},{"id":"b1fc2c1ce8c6abe64dc06d1604760204d52b3cf23691cbf88947798c45c7bf6b","systems":["Android"]},{"id":"b308d8082445d12c2fa2ea00f4b273580104a90bcdadb41b4f7cd009980eeb5c","systems":["Windows"]},{"id":"b37999fb82c3e440eb78c16e5aa39709815b5fa04d1de7b6cdf3633d7336ada2","systems":["Windows"]},{"id":"b392909f024c6d75b63598356286ab7b002c7e1a865d86c029c79f53da593d99","systems":["Android"]},{"id":"b3daa8fe75f33af0c921f8752cafd7c2941a5fdbfad76c7f6077fdbc2a8228b2","systems":["Linux"]},{"id":"b4083487b645b453726cab64e4cb8ffa77510da0f74a1f2497b7f9b26fedef98","systems":["Linux"]},{"id":"b49902da824196534bd4106bcc0f355f77313c292118657332bf8d0ba4319693","systems":["Linux"]},{"id":"b6ebfafa591aff878bbe2e0807a2ee0a449f3371811ccbc87552e0f0f1e8c3b2","systems":["Windows"]},{"id":"b79f6776dc6db4a226ff4ecd659e9580c3795bb349a793f394be3f1f484dfd2f","systems":["Windows"]},{"id":"b7a7a32f17adf0d991cc8957fd44cd2543b74993068c185272058ef0a7401524","systems":["Windows"]},{"id":"b7b449350251ca65e9e5ea83e46a35030145a9f4faf62b0c08d18edc8a0de81a","systems":["Windows"]},{"id":"b897a6aa4232bae9fb5fcfdb729d791060a2c614070b2313c8f19828d8c3685c","systems":["Windows"]},{"id":"b8f31cb6c26d4fc89c1005ec747516bb70a840e12268b81235b5466c367c1d0a","systems":["Windows"]},{"id":"ba0d7959015249bb6e9a18722555d383b9e241f799be6511d0417a36cb993971","systems":["Windows"]},{"id":"bcf7631ff85e063256540075e0e4f2c4995d0710a3cb2562fdee8a521235d48e","systems":["Windows"]},{"id":"bd297f190e0c8bad6b3e0a43b775357d5979ab03e0ba59ad7b086b2ca9d54fef","systems":["Linux"]},{"id":"bd44f158058a9a587915dda5a85b991e6140c0639c760c7943d08b49da95e50d","systems":["Windows"]},{"id":"bd8a9895c518d0a9e79eca2759e9ef4e0f1317a2284d8a4488e731b97460fc1a","systems":["Windows"]},{"id":"be1ee0a4840c02d65df36c8b2fadfc572b8c89a04b7fe2882ade25c60fb8c226","systems":["Windows"]},{"id":"be2c9cc3ee86b3b1fadb9f660354a15effc38df2dcc23c8859f7f379f9811f2e","systems":["Linux"]},{"id":"be7004e2114bea8113fa96004c47b2bd9449775c1aa1e3fa48044a273d55e82f","systems":["Linux"]},{"id":"c0c999e06bc95a10b7d20a11d17cf22085bb42c5b05e655e88bd4dd53cee24c8","systems":["Linux"]},{"id":"c0ed022f991969c7238cbab42e3041c5ac1a1d8e59a236f55a0e6c515cdb1e6a","systems":["Linux"]},{"id":"c1a0ad51ac82619bc2823bf7e81e7d7434977d08c66f6dece581bd9ac2deb671","systems":["Mac"]},{"id":"c2371b26a92c6d84daeafa12caae32cc77dc54d19a67fae538548fdb8152e1cc","systems":["Linux"]},{"id":"c3d19fa23e6de8878d79f93ce298d8969ef91af28bb3cd8f6f48499df7065aef","systems":["Linux"]},{"id":"c49b35ae7fd6928a5cccf37ae1d0cac1f11ef175eca4ec06865bf6d17de5aaea","systems":["Windows"]},{"id":"c69bb86658355c8b007c500a684aa63e1c1e0602ccccbbfa5d22a862af44b5be","systems":["Linux"]},{"id":"c7d07b21eedb99089c566749c969052277cc65e1a07869791a9d14f23549da02","systems":["Mac","Windows"]},{"id":"c858b3530166a136e45a39c628d72c33d5f2dc9814065a3e3b8068b660c63688","systems":["Windows"]},{"id":"ca95791755d9be35baa0d4bdd0c9cff64c9f8ef219fc8a1f2ec096015ed2287d","systems":["Windows"]},{"id":"cb9e244b62c7036d21a13a49c4d8b1f7817aadb6a9755c65d9759c6f2bf7dd79","systems":["Android"]},{"id":"cbb3e77394ebbc3fe8b3a199f64c2a52ed4fe814c91e5a43d361e7e04aa7ee0c","systems":["Windows"]},{"id":"cc124c6d91b9bede18577e25db8391a4627515c1d839492a07afbd6707dcdcb3","systems":["Windows"]},{"id":"ccb6be0c7ead4e99aaa80fb1daa2d05970e160ad3f546eb85dc393628f7aebf7","systems":["Windows"]},{"id":"cdd8b57fc7a077def93002a20c2e1e5640eba620ed20b434b6c8e50aadf6b7de","systems":["Windows"]},{"id":"cf9c930e14aa4c253ebe731aa56e126beabb2c8d1b9d3c748fe7a597816b6cc7","systems":["Linux"]},{"id":"d022f4bd3a3be5632abfff5dc9389909b28a425eaffd9ad49b0f4317fad38685","systems":["Windows"]},{"id":"d03b7c9251b658376a7fb54c8b455216cad964f9f19c4bac6614592d4a1e15af","systems":["Windows"]},{"id":"d07639d79811f71a2ad0792a443b722c03d9de51ed9a9023ecd276e60227b9ae","systems":["Linux"]},{"id":"d07e7dfa332454a33cfb922c368ca0047a6b2702ab2e3c1a44faa3d061d099e2","systems":["Windows"]},{"id":"d0931de0be95be57a93ea4706ee3c9e26cf60eb298bec9575e5209854774a92b","systems":["Windows"]},{"id":"d0be2d4744111c5d10b533a4841c56e9dd394ac9a71aaac2d23a7a0af4e1359d","systems":["Linux","Mac","Windows"]},{"id":"d15a114b7c1cdc6aea3c6ae144301e20e2abaee083ed73796504df962b410879","systems":["Windows"]},{"id":"d21e19f872f897271432832f733e28669d2971252f3ef42d1b35bd7e168764f6","systems":["Android"]},{"id":"d43012434ab3469394c4c3c50cb753901c5cdc9c8ead2b0b5d2f531c9a9f86d1","systems":["Linux"]},{"id":"d816ce104e7c24a550368fde59ed351f866a0ab201b66e03a270f3b04594be1e","systems":["Linux"]},{"id":"d847047ae0fd728728d090903a3ae096d17c410d155c0118af42f8f08170ec01","systems":["Windows"]},{"id":"d9769eb5789e75b34d45798219859f43a52fd96357b29a01f47605c6997b08f9","systems":["Linux"]},{"id":"dbfc2dcbf22f2876cccc8c12ff0bff319193d3e90dbb96103f7122db1d876d3d","systems":["Windows"]},{"id":"dd38dcb65ee476e3255968e552a707b8b6b32bd67bf006df07feb348b0186ff2","systems":["Mac"]},{"id":"ddc6a87bb9e46358a7817c7ff3dc2df747ed479f9d85b0aee557cb85bf156750","systems":["Windows"]},{"id":"de29224bec02d27c60b4ef00d380720e50b070e16ccd83c2b295cb31e4ab91d4","systems":["Windows"]},{"id":"df9b81d9477cbcb0ca454a823965d65eba5856190a48f7175083db3b011c5b15","systems":["Windows"]},{"id":"e02f2553565288040931bb310f85c7e6546428d141a056a5ea4dab2a771494da","systems":["Mac"]},{"id":"e097fc4942e513f280b7aebc295b6dacc429ed3042f4ab5c96ef26e27f355917","systems":["Windows"]},{"id":"e0b0fdb0d48fd82280bc0dce1b0a786677a5b72c7a07bfc7c6b1e792a782de9b","systems":["Windows"]},{"id":"e19d2169ebf6066f53bed8fa2a27a3bbf1c445144ed11d68c8c50f1fa7abc0ca","systems":["Windows"]},{"id":"e36137a33189e338463524fcd75831e92d9582442b9b5ef4ec6aba65e01b1892","systems":["Linux"]},{"id":"e394acfb5bf9e5bc54d1564282055c3bd27fe5400deb57f19f0ffb02c1dbaf10","systems":["Windows"]},{"id":"e421b3015722b1b315b5a1aef88b40dd0746dcda8dc268082e635dd4926b8266","systems":["Mac"]},{"id":"e43e80e03e024b0886f210a321165b6b0e7fbde8a1b34fcfa23aa887d46bd28c","systems":["Mac"]},{"id":"e455b192a26122fbbd631693d180f164df5de07652c678433659db79dfb483e4","systems":["Linux","Windows"]},{"id":"e56d683f4166593105bf7dea0f70e021ad208f2727e1c61a83d9adba06e71e64","systems":["Linux"]},{"id":"e5da3be6b4b18d7abd75672baf86b198d65b9671baad0a900c7dfa4f5875c02b","systems":["Windows"]},{"id":"e5fa8cf996a0c98068ac5cb4739dcea5ad2391da0df70ba795a8f1cff8493523","systems":["Windows"]},{"id":"e64086cc709736cc1630b76f3b1c5f36bbc6f1fce2eba754f1ba12c16a87389e","systems":["Windows"]},{"id":"e664f2f3fd912d1543d9b84d7c5149e6d5d065e9aff571a1e1463a70ca465b4f","systems":["Linux"]},{"id":"e6b1c56e818201bc9b3e29a0f1ee2d8ab0365108985a5b3d4f3e3b5d6fac7742","systems":["Windows"]},{"id":"e705e9de4cab2e163d178330039747d58f7bd71aa783b0d10f2155dd7e1099f9","systems":["Windows"]},{"id":"e727b26b67d17cc897b8090beb5017e793405a5dfc8fcea665567bb61315553e","systems":["Linux"]},{"id":"e753b9f4b4dc004ee705ecadc8a5e87084ef4887dfd13566911dd57ba1b7379d","systems":["Linux"]},{"id":"e7be40c1af179db9fde3d063661860f086dad24159944809746f3bc802785b64","systems":["Windows"]},{"id":"e80c8fa189470d7ffa7bb1b06a72f210a08ff02b1874a3efca1e8efd3c7a3ef5","systems":["Windows"]},{"id":"e8cfbfd8354f037bbcd7ec65a6eaff801984177013a8dffa6323b26789a6fcca","systems":["Mac","Windows"]},{"id":"e90b828a18d97b9578d7823c0f924eb99abd34e1538e7b198938d36a8779e832","systems":["Linux"]},{"id":"e939aeca2f662599ef5a76f5ac07d55d18d136926445943c8ac656fa2d106d8c","systems":["Linux"]},{"id":"e958742efac17bb0602e85e328ad69805c24f548085c034edd60d874041ee56b","systems":["Windows"]},{"id":"eb175b01366ff04c5d3baecf87b7f1eb9efe783347655f59984028e3f5be7cfa","systems":["Windows"]},{"id":"eb26fdc3fade3c6928167e5714552322a6df3e696175eef2423ba8581e1c88c4","systems":["Windows"]},{"id":"ec47c8f7c1325ed56ef2c123b22f7065031ae50c9d25015d6beacdd177a70c79","systems":["Windows"]},{"id":"ecf930fe324d53ba6c8031a1d409eefcc194fe4217c7dfd08532342db9a5c6c4","systems":["Mac","Windows"]},{"id":"eec32e4b54019fdeb9f91866ec996f4f7aa2fe8c781fb37a1ddf0c9b686cba8c","systems":["Windows"]},{"id":"eff67180347c1b10796200886de1d752410b98f761bbc27e640f9eed970603f6","systems":["Windows"]},{"id":"f0422e824d6276e2729a557d8c94b14e3e3405f1d3cfa52521a7a294a8599e87","systems":["Windows"]},{"id":"f1be5039b52a05bd7375ab5660d965d5b14cd539542aa004cc608f43247cb2e8","systems":["Android"]},{"id":"f2f4388d7dcbfd4a44d8ea204bad19d90526963b7d980271e260c86cf9e98bae","systems":["Windows"]},{"id":"f47473d1780c170d8c62da435a64c1328fcea618caf7d5988748ab217d0c63a9","systems":["Windows"]},{"id":"f4c8769c8380ee2e4acb6c561d59e726cd72c133306d79e7394829bd1933956b","systems":["Windows"]},{"id":"f59779ef5620205fcd34286f46dd7216113ba62fe8ad19051eaf7c327d7124fd","systems":["Linux"]},{"id":"f5ebd4b7c9492566e2787c1a4d17652efd019b1a83b5f28a58b277adfb56b023","systems":["Windows"]},{"id":"f6cd48fd10fda15fe6bf61387fe8e6187d948c1e9b33b1c1f0a2333aa08ee069","systems":["Windows"]},{"id":"f73ad78a2bb6896b9640fe08dcca6e5d1e4d37f260219b7af97aef5ec91879a8","systems":["Windows"]},{"id":"f73c7943c335e8e2157c023e89e5e9aed7ae63a1f7690b1eb05adfc7addede71","systems":["Linux"]},{"id":"f89a0420d7cc141a57de4fb88cdd9fcdf921eab1fc4db3f1214a6a08133e8224","systems":["Linux"]},{"id":"f8a13f2d0ee45c49f1c5a7a244163b760c56ae6c7a5fdd0e006b92021bcd6094","systems":["Windows"]},{"id":"fad40ce940b77ea3520f25dc962b8b58e5d2bfe80f662e91053d2dd0c273f4cd","systems":["Linux"]},{"id":"fb485af26d94d82f6290cf5d1a3c1ba6bacf1445be4919807eeb2b725c89fa65","systems":["Linux"]},{"id":"fe04ba130dc0b9f4a8dab56883864e79942593766ddcff378c236772c1847ce5","systems":["Windows"]},{"id":"fe678ae706f2974549487969e0beabfa52cfb99fbb4d1e84be02779eccea234f","systems":["Windows"]},{"id":"fee868744e69ab924db746bbc827113575fdd512378d13e440b2d7b308c5b6a6","systems":["Mac"]},{"id":"fefed450a9de86436c10bd88a14655541d1c94996e3f114bb194131afacfd001","systems":["Windows"]},{"id":"feff8bde6618dd41cac41405e5b9b0fd58233a80cee206331b9e3a00475858c5","systems":["Linux"]},{"id":"ff37a5f7bca1ae3966bc27925b696919751f538999ba22e04f6022712e3b63dd","systems":["Linux"]},{"id":"ff4c54f7c47e8170a2da1f7b8ec6e644e081daf52f775cdb94896656a6a8549d","systems":["Mac"]},{"id":"ff9b0f7986a57a01fac3ae350bb23390ae6eb22e8a3964bb1175003f11bebe1c","systems":["Mac"]}],"Firefox 88":[{"id":"006a652399db83b7ea6e84e2e85c64a92606d9eeb0cf12143b1032fa6d090887","systems":["Windows"]},{"id":"033405943b225074016a60b90a0708ca881edd1930d16c1227e674b525c0f378","systems":["Windows"]},{"id":"0340ff8423a8031c01716ce5d4e38874516872bef5f1b272a4fc35ebc6796086","systems":["Mac","Windows"]},{"id":"06365864a37e642616dd9d728dd3e1dec1aae719e0b31fb221a880d006447ea4","systems":["Windows"]},{"id":"065c4398eeb94bdc9a6a5ac710981b9ec61e3af689d282d6c6ca427a0c156fe6","systems":["Windows"]},{"id":"09799b83a964d966893e2593b8e9e0f6e6e097a38e5ae5e36f5126127b6bada2","systems":["Windows"]},{"id":"09954a437a2bbd197a716baaaad36c2ccd2d88c5e2def970414d7186a219699b","systems":["Windows"]},{"id":"0ab6994173ec88158d485acae0d340d7406cd4fd30bfeff6b327b3b29901dc13","systems":["Linux"]},{"id":"0b9b49b252ad255ba005c3cbfa38b9de86baa1ee94e0951c961c1bf8fccd0007","systems":["Mac"]},{"id":"0be719dee49f1496450dfa3eacd6da4f7ff91153278a29b4a803bcff9d3265b3","systems":["Windows"]},{"id":"0c0598c7430b2e5f82210a06c286708b848f68e5e9cbcbba316532e5764ed6fd","systems":["Windows"]},{"id":"0c8f4627ffd7511fa5512f63bc9f83e9f9c4e53b6b0c81f3e09484c195185382","systems":["Windows"]},{"id":"132715ee0bb7ab5f53e1834bad40e1653996429b8a3c64be8228dc00e377a27c","systems":["Windows"]},{"id":"18d0f99706c3d6c3205f33445f4c31e5d3cb88da32124e12a08a6404cd7d4f9e","systems":["Windows"]},{"id":"1a8e334f880cc2c6feca254d106ff5cb0afc085bbb0659f65986681da682a908","systems":["Windows"]},{"id":"1cca2c338580e117f18c228a655d9fb910c026b2bb295a5412ac13d3c44b441c","systems":["Windows"]},{"id":"1d08c66e7d58f889fb2ae9e82131fbededb9f4bc51445211d22f1b4dd69dd28a","systems":["Windows"]},{"id":"1ec7f01d20a53dc07fa3b130df816db43d3cea7c4540b5e79e2031822807dede","systems":["Windows"]},{"id":"1f12ac3e163142ff867db414e72e4dd8f5ca9620cf8be39707bca3bf79bcd6ba","systems":["Windows"]},{"id":"20d13a44b30b79b2a1df4b2ada077e8591c76cc58167a9fcd15cc67c7ca445b5","systems":["Windows"]},{"id":"22965b0723e4ac3b11ecae5a355a681c17b5933bc1a515af8df95a2fa3ad5867","systems":["Mac","Windows"]},{"id":"2478a5b313518223390bff0fa7377a7a2f972ea3a3ac79e3a00876cdab93b2c3","systems":["Windows"]},{"id":"261c58540a7dea469fe66f5276f1a8c53a75c70c277a1133cb38ad9dd20353ea","systems":["Android"]},{"id":"26c46b30c1db32d01d8d95de2903b9bbbd92b428909f2b29525a178f59bca498","systems":["Windows"]},{"id":"26d928445aee1d7c972e9765e5f08d906367b55fa23d2da4f701c977f7f2b044","systems":["Windows"]},{"id":"27bad3adcaaace68b62d37f10ac17fa7d448a092f851e991fca018bec9e7da26","systems":["Linux"]},{"id":"27e03d5879c030f709b7197980d3be2c388ee3d6dd40a674723582b47433347a","systems":["Windows"]},{"id":"286dd82ba0ed46cae0e59506579fc2e706e159971854d43bd57060ff6a5b50bf","systems":["Windows"]},{"id":"287b9a2a2a5ee2cd7b31638c1e9fd6ed501770f6d844994ef98d28a677246cdd","systems":["Linux"]},{"id":"28c0d028fedbad777f5816cc0a46c595adf9eafdb6b691a74d087ef086fd7a6b","systems":["Windows"]},{"id":"292bd37ab6bd80637ca7d18bd82d0396c1e4c01d78159898341ce9ab6ab21185","systems":["Windows"]},{"id":"2b8284c60da043a2e3dc8cb40ebae367b888e5bce657d2513a2fee89b3a9952d","systems":["Windows"]},{"id":"2e5f72af914cc959a84fb1a92cde33fec8fd42000dccb63450b6bcb82d8e14ef","systems":["Windows"]},{"id":"2f4ea0f1ee586a8deddd44a9dd116ba7526b6b03cc00f273e7d68fe77d16627f","systems":["Windows"]},{"id":"2f8537b73329f27832e4059d0b4d6134735182e64c7ec2e5223b4efac293c410","systems":["Windows"]},{"id":"3172007612275194dcc443875107f864485534433afe2118c14549099b6fe507","systems":["Windows"]},{"id":"31ff02ee18c80c43ed94cedc341676d1a0ad2befb5110b0847b41141ec3e38dc","systems":["Windows"]},{"id":"358bb3e25305fc4973a6504e51c8936bf3fe4a03cbf7267bef9c361859209d3a","systems":["Mac","Windows"]},{"id":"36ff046e733990852b6cd06b01af335d0071212c2afed2db87112696d00c540e","systems":["Windows"]},{"id":"382389635a90b7b287db5ab532c824c161251b3b1f3dfe066ba568618ee3491f","systems":["Android"]},{"id":"3df832f7522920ccd1b66e8b3a7314d8d98dc6b233d730735759bde8ccd6cb6a","systems":["Linux"]},{"id":"3e651d0b515475924620135971f336b264b5004126186cb0ffb1ea9e5ff327c2","systems":["Windows"]},{"id":"3f706e6e1019d66e07074db7a14edfa64a6e2e94dd3c50e14e1258f4e08dca96","systems":["Windows"]},{"id":"409748ff02369b9b4ea1d7bdc504845fbf4fb88b0b26f5fe11e806a65e843e06","systems":["Windows"]},{"id":"4222a2f3bf12c664d6b131fb9b5445932be908d65dafd239f5ad192a0c521c72","systems":["Linux"]},{"id":"422fd152c8eaafbac4b5a3f6d5d4e66d8f8cd654a9536553624010fec84ca54d","systems":["Windows"]},{"id":"46bd858a80860b86021f45767fca413ac22bc81271be5411dcf40d98b87f4d1a","systems":["Windows"]},{"id":"46bfdcac388df4ad53c34ad9eac0caa034a1a0cb09c389fed7cb3e23937b90df","systems":["Mac"]},{"id":"47051e66ad72e5a9c76ce58f148d0a04a24bb15293eeb56ca8a5d8d1cd22eecc","systems":["Windows"]},{"id":"4b9a2197f1a6dc355a86267a50d304cd663f1e1457187186e5edf3ddfb6e3607","systems":["Windows"]},{"id":"4ccf51c5170a1a20e09687b38ee3f3a4b8a1b26d8436e687bb7e8a799355d6f1","systems":["Mac","Windows"]},{"id":"4eed83cea21f77e0f8e59bc55000cbb15ca99cee31216b36e6b01535b28e5d51","systems":["Windows"]},{"id":"51621bb59d071742e3bd83d749d646e1f29c08106073f0f85864c7ddd4b08536","systems":["Windows"]},{"id":"528cb0b6ce8a22756b9a34caa96767ea328ed7b9c6c1c07e4b3fcbaba350921f","systems":["Mac"]},{"id":"5314d44c532b89d2147ad753f7fc0320ce3652a264282630820764df72d1d83e","systems":["Linux"]},{"id":"5398497db2f08daa5fa478b7ba2077db3e4afcb87c35a1e699f4ac43521d9ea6","systems":["Windows"]},{"id":"53d577251940d0c173f3bfc55f9e32e9f3dd453e58a305a2970b9051fc3f5dbd","systems":["Mac"]},{"id":"569d30cdbe2b95812a55fbe93eb017135da040681bc086015c3796df768fd828","systems":["Windows"]},{"id":"573377009d8ab6167f38a7e57beee830d2c62166ef7f3699b31cd66bd90ae8a8","systems":["Windows"]},{"id":"57bccc3d45ef79d60f7455e3043ae586fca817b60b133401ef913deba317947d","systems":["Windows"]},{"id":"599606fc2973cfde572bea745a9f2d6a9ffaab59cc7dc1fb121eaaf4a587548e","systems":["Mac"]},{"id":"5a48385c488ca466e43e7158e053e2227e47f014609d0fec13f5d68395997d25","systems":["Windows"]},{"id":"5f24dd9ca204ca30cdd5ec5666d0a9cdef913c138101f667bf8343b043bf6b9c","systems":["Linux"]},{"id":"606b6f3dbc32de6e6b0bcd360d55aa36cc9f505b1263a4a0c971250341f79c0c","systems":["Windows"]},{"id":"63960ea0649cb4d811b5c0c9dae43ab64b7ef8ac9a7bb6ecff404fafa56ffb49","systems":["Windows"]},{"id":"6652fdf95318f913c4ad81eafade2f91c7620b40a92e14cf3c56e0d573cf8fe4","systems":["Windows"]},{"id":"67d244b220c5dbc5bf2059c81f2e3f19a9fa2447c703eb7c8c95fbbadd78c04b","systems":["Windows"]},{"id":"6a1646341ab2adea0f025a205607ed4088fab09c2873c5bba0308c7d0517f634","systems":["Windows"]},{"id":"6a772a3af52b439d8acf138d728372e4e0aab936f3a3dbd6e0aaf8a065ce073d","systems":["Windows"]},{"id":"6a86ee22bee1eca169c083db4886b31bd2b028ed5c24f145be8ffb86fb5e2c65","systems":["Linux"]},{"id":"6afe288aed733960cd2f39b2c4f38cb5316910f81ff73ea2f55b21018aa9a662","systems":["Windows"]},{"id":"6c0eef0f83a10b20459ad7a98d91e9b628b86b37170eaa0ac359d8b747abad2a","systems":["Linux"]},{"id":"6c3cd0e655bf19fddad60ddc75b94fdf1ec925ef28eff9f41a5ddeae11f9ca27","systems":["Linux"]},{"id":"6dbb6d089249e94da916f781b4300a0af02572df969ecd4f411c272ac67eab75","systems":["Windows"]},{"id":"6df81976e1e10470e43f8921b130d16e8490afb69b77d644f7bb24e621cb1e3b","systems":["Mac","Windows"]},{"id":"6e3be45da23605f0fcf6723791ea48e3354b507b2ca20e951a713b2e34342d25","systems":["Windows"]},{"id":"6e80ef896efa5feb647562c5904177c97a456cdd5fafa06cf246435d6944b151","systems":["Windows"]},{"id":"741d42a15f799755bea4b2f3a412ab3f4c6e8edf16f79b61ea373aaa15a56ecc","systems":["Windows"]},{"id":"75dff73473a45259f31e39f858f7c68a3bcc46c87acb4ddccf32c82b5b407edb","systems":["Mac"]},{"id":"76aec63ce5e9ee4e2f1b2103fef88339f7d1c4bb61a6bf86d888337e5de34af5","systems":["Windows"]},{"id":"77036324b3ac09f732aa88dec532ca13f06cfbba3742e49eec423cca24f94155","systems":["Linux"]},{"id":"7805ce6b366e27186691033970566d120eed49eb97b843d14072490fcdae85fd","systems":["Windows"]},{"id":"78d21a01f4ce917aad601b7c0c07ad850ba7783fdb21b5a082160165bd678199","systems":["Windows"]},{"id":"7a56916450ad5a8f3c0655b30174369784c660ffec66bbde55dd7ed614ab306c","systems":["Windows"]},{"id":"7b7cad106d03bbfd1723243de63ae21d88dee9628aa2d5d7b35c4138a225a10f","systems":["Windows"]},{"id":"80230df5d4cfcf57ab37dbb65d40f9adf7fc42d8a78b02d4bb57a95e7610a4e4","systems":["Mac"]},{"id":"811ca61f45ff3eeb1d6461e11f8fe672c168135a15f9caaf4a077e7d22e4067c","systems":["Windows"]},{"id":"816d9f9468c7ccf482200714163d2fb7b0be7d9c74471d819c851ee347f0b42b","systems":["Windows"]},{"id":"81f88ae40b4de80d9c29dd0b6dc8415119c49d0916e03ecb43545ac1c7f20064","systems":["Windows"]},{"id":"829298389eb19a9f038c26022ff1283de8f0e1a4d9149991ad2d9e29fc8daa3e","systems":["Windows"]},{"id":"83debef1cacd255e1f82a38d4f61bcef8a61f41a5378660e8896ab53d995a392","systems":["Windows"]},{"id":"84051060269b6e5d09c323734523c118852fa18c3d5c7d15aa8e4818b1895615","systems":["Windows"]},{"id":"85d67ec5acd5a764956321476465380d0d8a51c8d9609b9658fa40ad41d4e86b","systems":["Windows"]},{"id":"85f8667455ecc30c8e14ab136d4c3d594b40f11ba93a47915217be202a4d5144","systems":["Mac"]},{"id":"8667e9c04df2fa430eb67c4be4a8df9dbe0c0d1ed68dd2b23424fe9abd448811","systems":["Windows"]},{"id":"876ac7201e4941bce5d2330b484f2d0b5b9a3de7455a894cc576bafc4d3dca1b","systems":["Windows"]},{"id":"879ef28d0d18e98bca890ee591d89f100c8f20228b902c5b40306730280a2aca","systems":["Android"]},{"id":"8831c3cacb5b21174f9f7fe41609189cbc2cc6c223304a3d3ffe661a20b3b7f8","systems":["Windows"]},{"id":"885356436ba1513839b89829ed9724d19ab2bc8d9682ad2e7d3c77299b8e8f29","systems":["Linux"]},{"id":"89ef10d43b7db15a57398133a14e8ed03257687481beb1d38c80ec94502dea9e","systems":["Windows"]},{"id":"8b5db6877dca826823f6669905c54c1db50efe73d6b8ad565fd0b12587d5f649","systems":["Linux"]},{"id":"8c746992e03539850443d4b1eda47e17535de371032b452755fd9a2f225faa58","systems":["Windows"]},{"id":"8f4a1353fe870ca52852b92af7020d4da6dc821f070db4f4b648dbbe6bc7ba31","systems":["Windows"]},{"id":"9249aeb50f32a08c2147f379dc16dac6c50869b5c0977f6426b14f0eda7853e8","systems":["Windows"]},{"id":"97a0bb16ee2d6377f4467384c9e62d026b8a0b987d4831a3fd8217e03d5fe63d","systems":["Windows"]},{"id":"9812a29d4ca7de8f74683f7dff42c7e30dd9ce917654167f6608d4b52c364ad9","systems":["Windows"]},{"id":"9c56259753df99c97e85e5589763120a03529713cec239306e5b3c07fb61e0d1","systems":["Windows"]},{"id":"a0334a88e94560c2cfc886612a05843ac94838141b0201a3b6438ec3c10c0130","systems":["Windows"]},{"id":"a067fe849ef869be14f24871ca5d3e9707585986e96f69890f96a9a411bd8054","systems":["Windows"]},{"id":"a2f8394c12f596d1e65a1e238485bc70da4e22929933ceaf34e5f0ce033026a8","systems":["Linux"]},{"id":"a46fa4e2d2eacafb34da1f7513b1aebf6cccde70a2f6004c1338456238d8d64a","systems":["Windows"]},{"id":"a54cd2342354c71ad1a24913d53e38127c8514f7eba6686960bc4fc51df8e5c3","systems":["Windows"]},{"id":"a586e6b9b1f2b5d4a278e14cc98e9704b90900bd444ea70c60160d41ac5ad2e4","systems":["Windows"]},{"id":"ad4f48ff11d669f9922cc437eca86fea1c6d6c0e21ecd077a757cc7717293261","systems":["Windows"]},{"id":"b0470620a7035170b23a222689b04973461718d6db9c301e38f5e5b6ce8c47d8","systems":["Windows"]},{"id":"b6a4bb78437050939e4ebcf9a7a25501f5c1164a0daa9190e7a8fcb6f85255c5","systems":["Windows"]},{"id":"b8889481f54189fd9a06016053fb94c651fa0db1c833550d8df72f279b437c15","systems":["Mac"]},{"id":"b975695e93d8f30bbfad17115ebaa86670772a8e86dcaf0db8b63f9a850f4e5a","systems":["Windows"]},{"id":"bb5ad56157996df5f137445b6039934043d3547013bc943e2feb683d094be961","systems":["Windows"]},{"id":"bbf0557c35582c9e609de60f6495238030ce2f45c7486047462ab1627cb740ab","systems":["Windows"]},{"id":"bca1b3babd9c5a3b78d4f35ffb7ff011254ea1caf02b1842ebaea50356e7e943","systems":["Windows"]},{"id":"c16e6bfe7e92f9fbb728e5758899bc65f89ab62dcc25c53166660c1665ed64aa","systems":["Windows"]},{"id":"c79e243e344986bba18813e084338bf1cb708559a501ce4781ae836e87b8d7d4","systems":["Windows"]},{"id":"c7c0a69576182a61eeb634052cce472d9295c96c9f99cc0e6ef3219ee7887a59","systems":["Windows"]},{"id":"c7cb2e3a385ec5c6adbb7ddae70ccc830c989a8b005b2fd21330f2914d7c94b9","systems":["Windows"]},{"id":"c8e158d6113b663849a4f566a9e515759519bef951fe4effec6808c3821ec2e5","systems":["Windows"]},{"id":"c91ec686e5ddfa828f2a538c353533f699267984b5fc5b53608342b931c63157","systems":["Windows"]},{"id":"c9275cdd5228106c3cf2d1c87b8c936b2a4732b2a64b6d8d69af3dd411d66d3b","systems":["Windows"]},{"id":"ca16e0907d0152db55c5faf3f2d7e01be4cc3673b7aa7549e96ea980facdb409","systems":["Windows"]},{"id":"cac3247ff1411ff6d613db35cde6c4d2236862e167a4bcd948d625e23c5847ef","systems":["Windows"]},{"id":"cb29f56d8020bbc07fcc7e216ded8b73d6f54d57e464b978f57e83b2e53c1987","systems":["Windows"]},{"id":"cce8df238a6ce69f3bd35422165f9a405d4b4868976c02ba13f66c8cf88e5fc2","systems":["Linux"]},{"id":"d6aed33a978f8daf332085a88f9b7c3289f0841b4bd0f780fcefbc925dea48e5","systems":["Mac","Windows"]},{"id":"d706cf6d265e1b1a7c5d917aa0a36555c07d064e6216c2f8379224dfa291e6aa","systems":["Windows"]},{"id":"d855237fead783be91b58e2fc762d352ad100c533dd564864a612ed29eb43aad","systems":["Windows"]},{"id":"d9292a08cbcb1265b506d4d91736ea97e96afaab9a98841c6e58cc1bac216c5e","systems":["Windows"]},{"id":"da0ba16ba28f4743c3732d0c6f79c25c401a7aaaf5f3a2cb1046d821427b7191","systems":["Windows"]},{"id":"dc3b3f9aca8f6d6eca9ca455475173895957765f93dcaa0cd083091790a7acc1","systems":["Windows"]},{"id":"e0935ef2a9061b1bdb802f9cbceb8d2a9874b11c9b650b70a33fff31da9c514a","systems":["Mac","Windows"]},{"id":"e0cc6c959cf2a75a315c7a4edef84c2af78881a36c114a857233e3b7dd31cbec","systems":["Windows"]},{"id":"e398a8a5e5b9cf9a86a9b1120eea4f6f9225969de973123710e8d64c74f66616","systems":["Linux"]},{"id":"e85c8c310205654c3510ecb50ec2b4b1c6b4a0f6e6264af96db40033b8ea0a12","systems":["Windows"]},{"id":"e9a0b986e34c036b0cbeae7617d5b8c4e738f255625cc72575b20661271945e3","systems":["Windows"]},{"id":"ea360e59ab8a91b3d12a03ae57b61c778e4b3c573d7c331d865733d7e4ffdca3","systems":["Linux"]},{"id":"ea40f1ec3b81df3e943912359438c8a90590c7bbf0dc8463a2342d6c3ca42d68","systems":["Windows"]},{"id":"ee2a3273557644c80fa1d72342962e4d793fe65779d57b0b16a6464b3df40f90","systems":["Windows"]},{"id":"ee5f02f03a4b0613edc0d71e0d91a583f7dadedddb27bdd83a432496a3806539","systems":["Windows"]},{"id":"f16e4d2a419269efd88b218564f5f0152de876e33a1182541b5d7ee451acf56d","systems":["Windows"]},{"id":"f43e741d12db29173edeb3c8bf5963daf97c7a46c4010191c37e21b22a71d9a3","systems":["Windows"]},{"id":"f7480e39a89236b60669110ca4d3d4b233571fc6e64754a63b3dc6c01d98fd78","systems":["Windows"]},{"id":"f7660d189bca496d1aab8f2dde23f2779d583dc221db5ddf16d636955f8303b9","systems":["Windows"]},{"id":"fe0a1416fb07982741470630d9d1eb0a4ac09b94d32775a6c6dbc3beb9313438","systems":["Linux"]},{"id":"ff6ae6d7c0e8bfa2519ff1e54333715e25b2ca072608b1fda9d49b63310f99a8","systems":["Windows"]}],"Firefox 87":[{"id":"009d2710e37b760afcd6308947998b7358d0c596bfa918d50d16fd4da1b9e694","systems":["Windows"]},{"id":"055b48221803e32155a135d3b7f91763ad0d9f989bc664249670971d61d5b632","systems":["Windows"]},{"id":"07601b71893cf03f631c38f3b10dee5069555666f8d41972b7ba13c2c27b8b14","systems":["Windows"]},{"id":"083a671b304d74020946d2201dbd17f3e86c2e53d079261bf49775bf25d20948","systems":["Linux"]},{"id":"08a36527e2bf517d484aa17259cab8f92ca68885e3347b96044292b503e368f4","systems":["Windows"]},{"id":"0942288ef77290c6c972716ae3f163f05098a2afe2af040b55ac46cbc5cc2698","systems":["Windows"]},{"id":"0cda083011465dfa407087ccbdad88a4f80fabd8f828551601df1883e2c31b14","systems":["Windows"]},{"id":"0d4a86026a7ef64fd75bf78094ba2b555611ddd5175941f33f3a0bcf64af6790","systems":["Windows"]},{"id":"0f1aff686a65294e7dab11d5f18cce3dbb854938c4f2363cd5e81790430573b2","systems":["Mac"]},{"id":"0fd128315fd3accafe7f0c2ec4f3d935cfefcb2a15207475c170cb01fd57a615","systems":["Windows"]},{"id":"1109574310e33a01b672913d1983ea86260c55acde0616c3b29b3af94afd9b5a","systems":["Android"]},{"id":"12046f163ae4d62a3ef6201624aea7c496845790cd4215f534ad97e6813c40a4","systems":["Windows"]},{"id":"1492e02d387c1b8922b2d5813e979ff014bd4189112b75c3c0b27835be56014d","systems":["Windows"]},{"id":"189d5774a6fa2684c76d077f5267a4440ac14378fb747286d456e2a7166e693d","systems":["Linux","Windows"]},{"id":"1b465330f259dfb7246ddd27fa6643606ca2e49e9fc4e5915dbfc71f2f248574","systems":["Mac"]},{"id":"1bfec01e015231aa729197aa9b0bbdbb91e3dcd8ad6bbb2b3de16b6f1dd348d3","systems":["Windows"]},{"id":"1eed4ac66cfa8f6468dc7213bdc7d6c834fbeb5967c8c6545c0ae8e6d6754ecf","systems":["Windows"]},{"id":"20694650ed0ad32bc4ffbb2cd4813aa04737d7519cd4676c6f0af5b607d6f05c","systems":["Windows"]},{"id":"20ec5a328d9adcc42791533f10114a6f591b3508e0674cb50ae3609cbca52f1f","systems":["Linux"]},{"id":"2270eb91433580b1f15c229f44d28e4ce62f4743533efa520c0f0868839dafc5","systems":["Android"]},{"id":"22d0bc0a24140c174f2c0f066e33f34b74330fe75923237cf2c25f5d4439824f","systems":["Mac","Windows"]},{"id":"240be996b9c711001ba69735f16f5624f34ec57b4c6d841d115aadad65b65849","systems":["Windows"]},{"id":"2637a365480ab6b4a3f1658bcc71ceb662e0bdc7b30a65ea61439fa2137577ff","systems":["Windows"]},{"id":"28a18c7c45e7d365bf681ae410e2cfac9a3f744b41d308776f19638ae68f1a01","systems":["Android"]},{"id":"2c0a419eea24a2ec561788ebf09786d4db53a030a3b970926ec91d5cba95b763","systems":["Mac"]},{"id":"2d4300e0b08b41229eec5a0eb46468732c5dbcc83fc22b2694c1c00fb0197da0","systems":["Windows"]},{"id":"2e922dba581a65de52ae140c5dc9defd67090637aa9180caf1b14d4a1d90ebbc","systems":["Windows"]},{"id":"2ea1212054f9c4c52c26012a6d1e04c6379f869ea4b1b6cc62ab1d3affb98bf3","systems":["Windows"]},{"id":"32b0a5818fda5be567b44ab4c1aaeb1d883aa7dd681e3c37d89b02bbf5ff84f9","systems":["Windows"]},{"id":"34df93a5db84df9178e0ae9ca4c52ef9737306492ea32b5b0b5c0988e3b8a59a","systems":["Windows"]},{"id":"36ef95e96c6a7f70c05acb5432ea9c2bbfb2d559d06255350b5e9d0970e5b074","systems":["Windows"]},{"id":"37b88c97f392acca75460e0ca7734f2185ca36184652a46dc2215466be8e667e","systems":["Mac"]},{"id":"37d8d18d8550ca232aa29322c162e1d4b416c8627d7f94c961ff633d0bee72b1","systems":["Windows"]},{"id":"39c5a7d2d03fdc343ab8d788f9b6a4afd4cdf4db480a95c73ab64eb37410abba","systems":["Linux"]},{"id":"3a87e379541f17e611eea25bb78d11496c1e33f60fd9c6674440963424b83e98","systems":["Windows"]},{"id":"3b0ed2500d0cfd76c999c91431ee06722f2dde2de6ff9a58cf5c04f2165aadb7","systems":["Windows"]},{"id":"3c54df9b7bc67f4fdd1c62e0da0aa25c9370e33f9ad88dc9c8c9ccc9538ae716","systems":["Android"]},{"id":"3c79283c220287a4ad4110b6512aa6d9794007715decc01641eee914e876a441","systems":["Windows"]},{"id":"3da715a10331f73f426f02d4a8a4124845febcec0f3c6ade796cad5433f828ef","systems":["Windows"]},{"id":"3e55d5f0df1dad97cb271f0fce3cd9283c81d241ea7699dbd5862d120e5ff8a0","systems":["Windows"]},{"id":"402e626e101f89936071711bfbe119f3e4d65e2b63bc44175e3913e5e154ecb9","systems":["Mac"]},{"id":"410c08110e36a69695be803e87f8e0c57e6504dd0a629eb94d863f54fcd9b149","systems":["Windows"]},{"id":"413c8939f3f47042a85ee1eacb03f05dbf14b89b1cc9d7012ce881a62e87dad2","systems":["Windows"]},{"id":"42338a25f0d75d0a92def139956f1c0589c790c20ba26cf42680247f933f179e","systems":["Mac","Windows"]},{"id":"42e19d9a0fe426dddb1e104c73f60dc9230000e4facbd7a1dc0333e34f850ab0","systems":["Windows"]},{"id":"432c1920af69e56beb919aad59567c0543649c680b3c11cf560f146832341e6b","systems":["Android"]},{"id":"44496eed2dbb86919e662d4cc195b0a17aae0aab43503a793ab72ed0913cc61c","systems":["Windows"]},{"id":"456c83e63265ffe530fb0f1581a5a385742134c8c68302c39270e5254d1caa72","systems":["Windows"]},{"id":"46da803249ae5a5275b536b5f035b8ad24e0333a2106de88b42a0d166cdfef72","systems":["Windows"]},{"id":"4ce7f6e488fc428f7985e69494559a225b754b2e5514e42c3ed0fff859c6a49d","systems":["Linux"]},{"id":"51f9737564f345f63d7c65990912c5ee5579a96fc0ff546019a3f33ff52310d7","systems":["Windows"]},{"id":"52b93e864732ab39fbfb7affb97e639b07c07efda20b69f5553ad24781752cf1","systems":["Windows"]},{"id":"52d16e8fd81871fdd32c62c7291affdee79c97139587acf4d2132fa39a3549e6","systems":["Mac"]},{"id":"53ba33088ac921773e1b9ea1fe7803ce0a97299b4df8bcfade86ee45902ae228","systems":["Windows"]},{"id":"56477f891fa0a5dda6951604198c33b1ed0028b17b26e1190c165cffc01fa25c","systems":["Windows"]},{"id":"5a4fa6dd9bc8822918e0d90c1d1bffdcf835cc366e1dc06474bcb444da498d46","systems":["Windows"]},{"id":"5b41d69c2129010a6c32931232e7725dedd5e66b33cb90af8a29f167c76e0cfc","systems":["Windows"]},{"id":"5c5e67af90bbdba2ced00a084a8f03a8f6af1c5b138b2a80b929ca97439ac997","systems":["Linux","Mac","Windows"]},{"id":"5e64e020e8a44517cb050659e0ae3c16e2b23ef94eeb13c74a748a3c0b2831ed","systems":["Windows"]},{"id":"5e879e3a33c5c3cada7e30b2d692ce87dd50a514db49649dfafb824e1d6b026b","systems":["Windows"]},{"id":"5fd04d5735e7c3fa55ae1c9734ac31c233e0653803f1c85eebdc68bb574c5c3c","systems":["Windows"]},{"id":"60180c2b2bbeb59268a9eb7133c48875fbeb75e2ffed563457de4b6ba6e43ef8","systems":["Windows"]},{"id":"615faabb709e8589e8e9afcb1ea615e3cb740bc54bd055a9a27959b56596b425","systems":["Windows"]},{"id":"61e42acb0dd459b8e918170cd915aa0b0f210c2668fe421492ed7972113e5073","systems":["Windows"]},{"id":"6225488bd064fe6dc3c367ffd2461928b01eac3706ac153173b32abbe0691869","systems":["Windows"]},{"id":"62723f9438fa13e660cebbc060a8d8d2215279ac98afb8341ce594c453daef69","systems":["Windows"]},{"id":"636a2c2bc04033f8f98133ad60627345d466fa553700679a3a63901de6f134a4","systems":["Windows"]},{"id":"63e173c2374ebaff803c07e8a08f8ec9aa689f5153a0310177dfbbbc93299c1e","systems":["Windows"]},{"id":"64eb151b55f0fbcb7b1978422ed7714a196e21d18663119226485faae9474588","systems":["Windows"]},{"id":"66869ad9ceba5589dca260feea9e928761a475c2e7dc9c0097a84344bb53752d","systems":["Linux"]},{"id":"7093163a46f0979452b44d36bd16ab99909aa6e55109099659ab41d5b8e57e5e","systems":["Linux"]},{"id":"70b9adbdf6988fd8e62d2858d9850e70b1b7787610ecafc2c5b6e58825c919ea","systems":["Mac"]},{"id":"71572c75384e10cc225a96f9dabbe403d06614ac4c7587b074bdf8346bc2ef3b","systems":["Linux"]},{"id":"730c4f74b55dca40bc3365b8cbc217876f4f584b20c9ef011b9c3eedd201b07c","systems":["Android","Mac","Windows"]},{"id":"739b19c6ef724555e83425125320e5cfb235557c56e5d5fa25e13f4a9982b3fe","systems":["Windows"]},{"id":"7535025949a973b681bb837ea777370b8f040faf43a34502b5f1d63afef4488a","systems":["Windows"]},{"id":"7c4c2a8d336bdd9bcf47f62da4d6142014b96a19ac08b8597ff77b592a4959c1","systems":["Windows"]},{"id":"7d28357dc12587dd590ff0acf36dd2aed887b840bbb1a137afcacdd2776ecded","systems":["Mac"]},{"id":"7e37316a7710a6f74f2e2370375d0de2aea86c88c84dcbf648ec735cc594acdf","systems":["Windows"]},{"id":"836bdc05913c0fc11a782d0ae853c9fea65237d221f9920a99ae19c8fc3cb530","systems":["Windows"]},{"id":"83d8a1d42c4609878947e18bcfffccf430c6e4a9ed1154fe93734c160547b0ef","systems":["Mac","Windows"]},{"id":"854249aec7c1e52c3f4f457c0e77deda26a3aae566eabb421ffccec79f57dce9","systems":["Mac"]},{"id":"86b47118a5a33b5a0625ea1283b0c6f056bcfc76e182f2be2a16bc18e7296752","systems":["Mac"]},{"id":"871ce39c70ae7d4002b0cc50b311669fe4c91403b1bf16aad81132fe98920fb2","systems":["Mac"]},{"id":"87ab1121ce10a555387e866531432ac219a9a4133bab62f9c2eda790da2f38a3","systems":["Windows"]},{"id":"885a23b077b0624946b1c4904062d11a7930386e21d7bc25542e1b924e27cd2b","systems":["Windows"]},{"id":"88f60d8e3db3b9c000fbe4faf9d8fbe07118f176ceddc426f008f9a6852c80dc","systems":["Windows"]},{"id":"8ab0a4f6649401f87c1c7b9f6ab428a30b60c558dc2fbb7ca4af295ebc69ae95","systems":["Windows"]},{"id":"8ae124deac8a1ee212389d6c2650136b1cf7419acb496237e4eb0fb9a90c2cd0","systems":["Windows"]},{"id":"8b35a353690b96d939df74fa1f295bbbeca6a48f57ac4554fe9646229f773e95","systems":["Mac"]},{"id":"8b84528c876379ead2088d484bcf02384d6d6b0b2cb7915c668b64fee2c34c50","systems":["Windows"]},{"id":"8dec3bcb30c16bb7c7e6a0c143f323d45a688c8e4738666c40ead06929afa0c9","systems":["Windows"]},{"id":"8faef11c72f02fe0c1300043a6a449dd21ec30595ec1222c8563b3b8da1134c1","systems":["Windows"]},{"id":"91302b4299e7ff44aa996ce9ae27d64c8a5522dd7f217383302f7c20a3d92bca","systems":["Windows"]},{"id":"91e8f08be3e212040410a7a65e5af459ba2052a840f384260d213fd3e71959a8","systems":["Windows"]},{"id":"95af2238f8fd6a1b24af3d2165a1afae9aa8ff05496e3c71b8f9771b98716194","systems":["Linux"]},{"id":"96c9d48cf1d14fdf38926504ceba04f6dfe646fcd72bf63c033ebbbd34fdd019","systems":["Windows"]},{"id":"98d6e24549e58161e80171747a5569bb73b9bb8fba8e92acae96da6c0f1fd9fd","systems":["Windows"]},{"id":"9989cc690460f59b354f90e382357a71b6bf716ab8011abd08a27caffbad75f2","systems":["Windows"]},{"id":"9ab47eeaa0e2652794710a52b6d4b90860759b8abbb64a0df8e1faecd553f62c","systems":["Windows"]},{"id":"9ac531ada099cda796a566e29f09e0926d8ba5f55119a9bacb4bd59672c8db29","systems":["Windows"]},{"id":"9b57554dca75f6730c2ed9304f8da12c55a7bcdd7add14ae11197958f9d047bd","systems":["Mac"]},{"id":"9bea3c18ba81c2fd4a81da73852dc5babe53c64206e497f21786428587cfaaa0","systems":["Windows"]},{"id":"9cb02718453efbe0e99ae00f7b910e31c135d661c9025555dd337c468f9fd8e1","systems":["Android","Windows"]},{"id":"9e5dd08eb9473b5bc6e6e996a6b6c8cfdb634959cbd9b3e8b2183676689e242a","systems":["Windows"]},{"id":"a13347872990ec3fd94322765a1263c1bdb943d6d9d89c52437214b23f7b5520","systems":["Windows"]},{"id":"a560298b56f99bf10c7fa81972ac667ac152a3838c258bbb3cb043be1567899a","systems":["Linux","Mac","Windows"]},{"id":"a6034a331ce2f820cc9df0cdfab56661db093c7091a86c78d7a1f140365b55c7","systems":["Windows"]},{"id":"a6c3e9470abcf760b1ebc5e136b6c3dd23369dfbeb84f4fc176048ca50057cbc","systems":["Windows"]},{"id":"a88c2416149199972a8d56a93df7d8649a8f95cae940eaadcafac3b935c01437","systems":["Windows"]},{"id":"ad7208daa1cc7fac58264d88d8cc2956c1a0b9070f8cddf153efbc03b82e73a6","systems":["Mac","Windows"]},{"id":"af78d7405f84392f7e8f933112847cf64da7335d9e65d300535a51ff8404b1fc","systems":["Windows"]},{"id":"b16ec9e6b8987a18507ca11dd49c20b42a6242d7422a729c038b1e6d018ca175","systems":["Windows"]},{"id":"b442f69c92e80f9cea8801f4d61f0fa3095efbef63231c2d82debcd8396a1ef9","systems":["Linux"]},{"id":"b6752a623e285d3ebcc35b9fcb1347206809482f4bc5c93479a3e4c869b4514e","systems":["Windows"]},{"id":"bb6ff25ad0d0349b726f6748553fd5bbbfc2fabafe0dff0b686c56b70dc8762f","systems":["Windows"]},{"id":"bcebb5b36b2dd09a968cffd6ae037b3d8bdc778615367ea7e1487fc190950957","systems":["Windows"]},{"id":"bf17d437cd5632db2a3ba47d3817d2c0f54a74cb59f0d0311723f55f49ea5d89","systems":["Mac"]},{"id":"bf24784f5c5eee9c3d2e566cd5ebbb4ede9aa6f0017101460c0bc5799cf77789","systems":["Windows"]},{"id":"c0beb962e8ae411b152e7111f6a42ecb9f02007f4d8af48ae4aa0780bb50d4d3","systems":["Windows"]},{"id":"c24f4c2196036f3d56e09c6cd352fd5c484a1c8d6c137c0b95cb8d30a8026369","systems":["Windows"]},{"id":"c27419adfd5f0c87d24af0c167a2519a5b18ad27ee386f93b041e3618444a7c8","systems":["Windows"]},{"id":"c315ff6552ffc9f200e454c7ed32606539f8f74e143bf65c8275987542eedd64","systems":["Mac"]},{"id":"c72b57307c3bbb7b731cce7c99d37d6233f268704cd56c03ec262ccb420db791","systems":["Mac"]},{"id":"c745ee9889da6f962bd4250ecd8728faaf503628ae3d88974deacad97ccb98ff","systems":["Android"]},{"id":"c86f0021d8771c709ee0633efefe6a308531adee58c7da798d3ad60f56b4ad69","systems":["Windows"]},{"id":"c88be9a059b48d21c348c3204d275577c4ab6033167549a130986ef8e9fa0402","systems":["Mac"]},{"id":"c8f56e77d28f98d9894d2d76994099be860cc0986de418a9c8dda1f7d766da68","systems":["Windows"]},{"id":"cba55d1306391ae2a45316f52de5361b656f0695c63363fb239c739955f2c934","systems":["Windows"]},{"id":"cc4a5d4b6c6b29f175d8a72f9f15018b5104eb64d957ba2a13697186d8b2b7e6","systems":["Linux"]},{"id":"ccbae709e0b4d2b316c390797ee94b158609e4a84e92c6a5a7f19166c4b72d3c","systems":["Windows"]},{"id":"ccdef3b5e4b20e03a16c2b090668499a5e26486a39c2cf43c6aa690a907dc572","systems":["Android","Windows"]},{"id":"ceb581bfa2b488a7750c548f52c1c5d2c6237f7c83b1d6e52b7854f2b50b91bd","systems":["Windows"]},{"id":"ced4dbeea1cb5aaaa6116646f508aafa3c4b612a8bb5a157d7348e5af45b3750","systems":["Windows"]},{"id":"cf2f4569b5b215b52a16ba7408fd683ca74aa6f128a47b97be30423a26bb308a","systems":["Windows"]},{"id":"cf63dc50c63ea4a74abaedc69480717f1768514116a546c6ffbcf076be4fa367","systems":["Android","Mac","Windows"]},{"id":"d1faa9148790c92c5da54e13543243894d686f4680ba233225b98281c879ea81","systems":["Windows"]},{"id":"d3f0f578f30ac6c68160d866272f21f44a96712b19d267e0c85ae5a160af4d0a","systems":["Windows"]},{"id":"d4e2cfa6215e28cde25be7cdae74a662d79febea0e03c9e394626b65fb25b104","systems":["Windows"]},{"id":"d51b24825e6d71f181fbde5493e784b03fee7d646da78507c48ba421c1730e45","systems":["Windows"]},{"id":"d5c0f06f801c5e6abd0ffb0211b9bcdb906159b92dbf96f6658ea93ac4ef8ec3","systems":["Windows"]},{"id":"d812a0c7ee9dda5a1b410a9da0fc235ec6de62b9f3bea243933c4de1da350341","systems":["Linux"]},{"id":"d982412f1e1d6826c6e702f667260d81a3e5ac9312317cb91a3a443b360d0d8b","systems":["Windows"]},{"id":"e486b651bfb45ff2e572a9358968f60459bdb9ded537845d7293f6c6b8087670","systems":["Mac"]},{"id":"e533453031591bd1fc278e27685d689e9837c3858515c3062c92620e3cfe75ba","systems":["Windows"]},{"id":"e7f49bd807166fe18451ca053f5358ed7c44ace33a27585ce96593f66afdf4af","systems":["Windows"]},{"id":"e8f0c4ffc3b88a1333eabfcd2514bfc2d7be93a27ea7ed420f70301dacf22c8b","systems":["Mac","Windows"]},{"id":"eb95b56ed2fe79b46dc5c003ef5c9c743cf204e5558e4f9a51095b088f6c5f8c","systems":["Linux"]},{"id":"eb9eafec48e89cf3c1df7ebec06fd76568f8b478ca548d2e71a7ef3b17cc335f","systems":["Mac","Windows"]},{"id":"ed08fb66d7938168c4607ab545d6ec451f76d62d08361c2a96468370abd495f5","systems":["Linux"]},{"id":"ef5c5c2253dae31546b9a9718e07add82ed1460d35d0c70ae5810e0e7f8978bb","systems":["Windows"]},{"id":"f036dfb7eb27ef6c5789671105ee0a0b4d30b9eb7e559c20afb36e6e4479db35","systems":["Mac"]},{"id":"f088171004ad45e37f4da5daebeef2fcecb456932bbf2f7de72ad55c130e7558","systems":["Windows"]},{"id":"f2ff48e02f83895fee0bd4b1a8fcca6f97bdc4dca1cc3e7f5af18c0d39a44f76","systems":["Windows"]},{"id":"f617ee010450b4cca41f5a9487d1d7e8718973a45d3339f4eebec59fc945dfbc","systems":["Windows"]},{"id":"f6791d4727c59084a20f3b10a944bbc08060c0836920808e6b19f49c738640d9","systems":["Windows"]},{"id":"f7732ca3dbe0f63cfe4b68417cf5f4b627e22333da937f1715553606e814528f","systems":["Windows"]},{"id":"f84535c350197d6017b299281d4f3ad49ea317a3b6169a89faee32179408ab37","systems":["Windows"]},{"id":"f9464d794780cc9fa99461efe8fbdbbdb6e73d2203d1caee06ba0af1fe577183","systems":["Windows"]},{"id":"fa211f63df449fcd3e00df7abdc342cd7670eed938e244a43dc87793351bc6d3","systems":["Windows"]},{"id":"fbd152bcbdef17ca2eb75aedc6cf444e193cb377012ff412a4918680ca82b0ad","systems":["Windows"]},{"id":"fc6f3788e06c2bb4e5d5d085ad5c8405a18481924a9ac89c9f93f243bae5d8dd","systems":["Windows"]},{"id":"fd3e153a43f9de381d2400470f1e52b37ead5b8187095d5829ec3ad242f2b26f","systems":["Windows"]}],"Firefox 86":[{"id":"00d7b2c40fb97eacf427c90a2e0d5d95fef7d9dfda25774ab14ba8b16906f83f","systems":["Windows"]},{"id":"00f3a27931004bde60c59fcddebb14fcbb096f78e1294b2b621d9cd50dba2071","systems":["Linux"]},{"id":"04e44b526ac8a3ba2858f29f4a873f9520f4ccaa7e529677a3f1a87812bf0b7c","systems":["Windows"]},{"id":"0b36d547b7a9eaebb3f150ffbd665df23421628dbe822c34e467d1dce2ce91bc","systems":["Windows"]},{"id":"0c36b2ee87773e179a96cc99de612ebd6d36623cee18b3485352b2e7d3e5fa90","systems":["Windows"]},{"id":"1856ecb02f9e7dcda0e0ee5e3ec6b4c4565b727609ac0cabcc939d3d62d45f1d","systems":["Windows"]},{"id":"22594bc7abae5cb27cd4481e30e995bc1905d04df4537e81b3716b67f6ed2469","systems":["Mac"]},{"id":"22797e046b3a6aa4b0e06a4f446aa810d65ad5b4d4910a59bc52bbdd38ec1f87","systems":["Windows"]},{"id":"272f4af75f0b38df0254037ddfd142aabe13ed38fef144d1d6d27a4ee5f6a575","systems":["Windows"]},{"id":"28ce4eeca97d6acd264a2325444abeefffb0aea56a430e3233a410ceb415ff6a","systems":["Windows"]},{"id":"36bf0f674426275240c45b7c880eced69cc3e8adcdbabe8baa857491b91b5a9e","systems":["Windows"]},{"id":"3d2062e29c3a8773fc3690b2fa98afd9b0f96934d24ff2f8ebd7d4b73f810952","systems":["Linux"]},{"id":"3ededbabc81e8e6c51ac2c3b5ad14260a64c20b826f5c5c1b7dcd4ae263cbd33","systems":["Windows"]},{"id":"40a87de1f55d99b8f169027158ef459b5e8aae2be57b39ee65ae29dd8dfdca47","systems":["Windows"]},{"id":"428b2912826495d9061e5094b865c9ad9ff03d0e37d24a9ec3f1d41f09eba92c","systems":["Windows"]},{"id":"4c4f5c340d972dd14b94fcda81aafae65b8a43c5a8db5fe8e2f4079a3d64e204","systems":["Windows"]},{"id":"508238543646724e4e34abb194682e4a7a19b65ee6420d8414230396c32975aa","systems":["Windows"]},{"id":"51e47c7d8051a568739eef1fc5c242c0e541c43c20cc03564e29cfef7b82a55f","systems":["Linux"]},{"id":"5209c7ddeed4b843104062155ef1b0986f3c5f0e65dbf096276aabebe4d04f6c","systems":["Linux"]},{"id":"681c1393d177d3c258c58e0b3dfc5c216cf539433e47a4f68de7c066385b27f9","systems":["Windows"]},{"id":"6d9913fa0d327aaed776fe08aa53deb6abf6c92b6bdddf5354c7f6a8a7599f66","systems":["Windows"]},{"id":"74c9190ce9cb4fc91ecff0b22b0ff215a709aaecc42d4ae1d6c68f27559edfa3","systems":["Mac"]},{"id":"79b53cb0aa7b975bcb8cbe7c367eb1d566eb64b2fe80eea5e39ec88824653d0d","systems":["Windows"]},{"id":"82b0b54ba567ea060418e2b7d8379ce5675ce7c1133b38336bdf2a56a26ac0bf","systems":["Windows"]},{"id":"8c36e90e146cd8f3c00e27a1b5c8834aaae89d603b46fe9b617731591ede93f8","systems":["Linux"]},{"id":"962e7bc183331e83e3d278ea52d4122b6f1dadf0f6e009d5fe40ea50ceba2b97","systems":["Mac"]},{"id":"9cae760de6656f4debdd4e51bce3b89f81b381ea60bb87fd2950af519471cacc","systems":["Windows"]},{"id":"9cfdcccc11d2082a6fe22ab3d1bbebd22a8ab3129c968960edf366e3d21947fe","systems":["Windows"]},{"id":"a030c46a0d948064626cc0067e0416abc33a9dadbc08f3ffd57de1df4deeeca3","systems":["Mac"]},{"id":"a2953b3454cf23700068e477c4ebc10f308ee39ccc6198e2bdee29756bd54f6a","systems":["Mac"]},{"id":"abdebe4cb89fc4fb1d9070f4df53af66d1fde75657ca74de8b87a6237014714c","systems":["Mac"]},{"id":"ac4e9e4aa36e45d62ed168cef9f04e2048949eb988a212519e2777348f0608ad","systems":["Windows"]},{"id":"add2916630285aafcb8c313e2d3338e7e21f3e3be7625acd59f7dc59ac6027a1","systems":["Linux"]},{"id":"b1cc794e956fc99f15cff974a3080818b13a0e1af93f7ff927b9ef4200bb537d","systems":["Mac","Windows"]},{"id":"bababc9dbf87055a9850da91dba6abc09d70eda67e7a459bcba16d6549439101","systems":["Mac"]},{"id":"bbb2413ffd8a267efb91cb6709c0ac94e62ae5510166cc9b5df74e830d0236ce","systems":["Linux"]},{"id":"c18c5183f2bfd029a7241939b44734b30fa882067f11f799fd160e7ea378d00e","systems":["Linux"]},{"id":"c19b2c0144600a1b26bebe259a46e4ea63424a05dfba5400ef05411f4ef1f236","systems":["Windows"]},{"id":"c5857d74673fca134b453db525012ec4b9d9cf895bcc9a7e9ab577a18d5fff02","systems":["Mac"]},{"id":"c9f3d0ceb0e2bec84c32bc1d9d6ac4dd7f1885055158e1a37b81eec879db0e79","systems":["Mac","Windows"]},{"id":"d1cb9f03ae2b02a486ce1bdefd4c3d4ebac08e0dd28d1b81836e389c98b6cdc4","systems":["Linux"]},{"id":"d61921dd387e33c9904bfcb3cf79d2935969aba78c32b69604d6b3649407e102","systems":["Windows"]},{"id":"d8517198bbdc5d634d8b514cd9995c7de8b66857b5d2a59a3bfae16907be821b","systems":["Linux"]},{"id":"d95d0b72a925fbff9d435a55f575d3453c5a86ca9f8820ba0e13738ec54a4630","systems":["Mac","Windows"]},{"id":"d9b932214afd57dc7ed6273c2598a0ef021d01c3e34a870958d555d0579f84fa","systems":["Mac"]},{"id":"da57f3955d30f86579dee542cfd6f1a13a14a227cb06f3bcb4bb1f30e8f0c144","systems":["Windows"]},{"id":"da8b8eca41c762b18d4a8b1c112fe3bce6a16622368f81b4b3c02d8a5129183c","systems":["Mac"]},{"id":"ea06fcbf2a3368c6dfd5b8d3236ac4a2404a250f39e74b0ecafe7f49f1bc08f1","systems":["Linux"]},{"id":"ea22a46aa4e687f725a16b9b4f9cdcc7fc6169582e04c7c6ed3a561406d1f74b","systems":["Windows"]},{"id":"eaec4bad6719553a3d9b4879566836ab1ef63d6758aaaf7123502e9610d8e12b","systems":["Windows"]},{"id":"ec72e4813025433268a995aa1135dc34fa7143f8b756edf4b61736189828c80a","systems":["Windows"]},{"id":"ecabc13c18ab0bff0bab0c4c9bacb09108b0fb8e7f535dd38de70173d1cca88b","systems":["Windows"]},{"id":"eea00e460d5719c162727014bf6930f40a5d7d3079c73af37093b2923583a589","systems":["Windows"]},{"id":"f418ff0b8526fb7f5e1d292d36a21d2e96895bc04a43e2e97755f39b4c6f6fbf","systems":["Android"]},{"id":"f74afed3ce89756212197da6226172642df16e18a43783148d2926d666d0d047","systems":["Mac"]}],"Chrome 89":[{"id":"01111cd7e2b35001d00a195c7fe1483228cf93057c5fde4c3bc50a3a6ae532fb","systems":["Windows"]},{"id":"01a4467520695e400d9dda3aad869c1e2bc5fa480c8fba00ad96fc6966515213","systems":["Linux"]},{"id":"04c61c26408435388965f4f00c3c7eca595bfc442eb368d66dbe43f8beb4437f","systems":["Android"]},{"id":"057ed80a113be3989e4da221b153799cecacfefff9e30de94f62b6918b98527c","systems":["Windows"]},{"id":"07472512c6caaf7e0e7e755f7a3d23493da3242eb8d223478870cadbaea48dc0","systems":["Mac"]},{"id":"0eecbff9af82a32950e90c807d78279b84fe83dbee5a841d68ddcbfe8bfe9a5c","systems":["Windows"]},{"id":"0feab4a080ad7cc059930b58b50a6497b3e8efd1ae91705cc41ed4a78be4f9a2","systems":["Windows"]},{"id":"109f1b26026988ebad7d831ee28883a18a9e17d4b099d79719d196e313d2bf2c","systems":["Linux"]},{"id":"10bbd001ff1c42f7397efc5d7c2b35431faf25ccf145570a9192fa3b76f89ea8","systems":["Windows"]},{"id":"12f8c3b86bc084c5f464739a993f1ac10503fb4bc373934ed3dd9c481851614a","systems":["Linux"]},{"id":"1320e23b9d13451f9071f9f467fd6e8beaf98b4d6b696fab2f5d820b28e0c9dd","systems":["Mac"]},{"id":"138968be9b9922a7f006be59ae776797f58e1ec78833b465378e607a7dc35f8c","systems":["Windows"]},{"id":"13d1d6d71faa2da48cef02c5da66d365bb639da816bba87c1e3dee85b5e03931","systems":["Windows"]},{"id":"1436c0ba11ef070627cbcb7e4f6ed441f95d60d7a4fb4904ca25c880602a4691","systems":["Linux"]},{"id":"18a1846df3a549d0b72f658a8f0064e39c6bc8035a173eaa2677232f760b277f","systems":["Windows"]},{"id":"18f417e2a9fbf86af0c6049c952d51ec8a4f7cd18130f50f1192106861de08af","systems":["Mac"]},{"id":"19f206901113df7050966f3a7aa27d7a5a6d37b38828aa6f4aa4d704542005a1","systems":["Windows"]},{"id":"1d018cf3c6c86a0ec4ad0c4789e2371887e32d13bf9af604a2e4a8857dcc1fcf","systems":["Linux"]},{"id":"1dcd6a09e4eb4b8dce543437a44bba5f87ecdd73adf64aa821794550dc52e8a0","systems":["Linux"]},{"id":"1e13aa64f1e2d140942d424cea1c58b23e213800668658823e4d6b72ada38bea","systems":["Linux"]},{"id":"1f3ec33d349e7058fa1e6707fe314749d0d4481a4c445b1fede6ec4ee052fa57","systems":["Windows"]},{"id":"1f80cb93846f0b5b05c32a86f0508856c363efaffd4e23eebcf5b3428a68d718","systems":["Windows"]},{"id":"2037de022ecb243543a7238e0831c98e43d6037022ec6fb6542d9acafbc1ed02","systems":["Mac"]},{"id":"2058cdbdde95e50513cc650f8ef39dfc29a2b2f2886a30dad2065e6c33855cf8","systems":["Windows"]},{"id":"24531c08df7f790b6154331b29c44205fd28e844f21e36022632c1c1f06b97bc","systems":["Windows"]},{"id":"2498d50974913a6e108daa941aa542d8a211da496898d99acd7af09b0e8546ca","systems":["Windows"]},{"id":"2544ac94a10aa56f2ad8ff6d215a53b6959952c8466d41bf1619b09e21965c47","systems":["Windows"]},{"id":"28203ec1794be66b00b0db22f95c455493e76dd98288b43e5cc4f77b9dbd08b4","systems":["Windows"]},{"id":"2849df86da805c9a4e453c8d4cc701aea003f59f66d2d933140eee2238e31271","systems":["Windows"]},{"id":"29635fa2a6a7510232f1fdd48e7aba598bd5675398e6985fb39eba671c171565","systems":["Linux"]},{"id":"2af3f864b2eb0ca081e6ac2c2af7898113d29770d2786e95ab46043d7e232532","systems":["Windows"]},{"id":"2cfe88a96aae9353ca1d3b56d6dc2882b6f147dd07145c4e37b96e5191c8d99a","systems":["Linux","Windows"]},{"id":"2e2c2be3855899b1c79f1e74d259a07d9f3a3602928138fc5fb5183597ff411b","systems":["Windows"]},{"id":"2ff15421704112e542b324da0400ca0173c9363bfc9fc3b184710566285c9a34","systems":["Windows"]},{"id":"309242b52722929447ebf209461b55b8472e832bcc7beeaba053851f7f87e5b4","systems":["Windows"]},{"id":"335a5eb60c1c15aae3d34e65d4af2b7e074cbb54507928e75f79927791755bc4","systems":["Windows"]},{"id":"34b65c399ef3ac24383d68cdefc24bfb7308ed38ea9347e1db3f19ddd24484a5","systems":["Windows"]},{"id":"34c0c861c69341fa4f6b0447fda8968201fa6619b8aa3f8876efb58936afcb5c","systems":["Windows"]},{"id":"35259ebafc23c1ebee70c30281a9618322acd53cfafb533cb842dca685656070","systems":["Windows"]},{"id":"372470fce0a12905253f40649421a2433f157611846e70987a89f8bf6adef130","systems":["Windows"]},{"id":"37300d2ee246345f7c079562792a38325116c2b2bf4cf76b6726f036d34e6fea","systems":["Linux","Mac","Windows"]},{"id":"3c55099e4ebd982c4b897cb26f1ceca060f63454d43eed9e4a07c60b6976882c","systems":["Windows"]},{"id":"3d74f226ba4c9578317024519874c034b7f5a555c605d4ca4309ea2eefbcc9f6","systems":["Mac","Windows"]},{"id":"3d859fb1ef84523c684fab9b3280594f63850180c264ea26cd7c27bd7fcd78b3","systems":["Windows"]},{"id":"3ddb8f4bf4d16f5a6642e572aac4e0b5563fd6c9514e4727abbf503e2207f164","systems":["Windows"]},{"id":"404d23277fd4319daf1b5d65e591262378216bc41d70ab60ea2eaa699d782a1f","systems":["Windows"]},{"id":"41afe280759767276a75d0a7bdbd8e6bb721379bc693f5078dad53b6a32a49cf","systems":["Windows"]},{"id":"42569a42ed1d1a2952f6f37292c6f8e4b49a28f03181b1aae1c101b91e9d9522","systems":["Windows"]},{"id":"4321bdc8fbc07b39af0ebb58acbe11c41bcb0e93b036f2653fec8359f42d8b23","systems":["Windows"]},{"id":"4583193a6b33afde7a0baae98442221903f379eb471e813fafd91a6132911e0c","systems":["Android"]},{"id":"467b8f4bdae2230439e310a19474feef4ab74e4c4d4998126fb1f74fe9ebd433","systems":["Windows"]},{"id":"471931ce5bd351f273a2d7ed3f3d7b9b2869b6185b1d351d2a78267de477c4e0","systems":["Windows"]},{"id":"47dc3d78763e0bff2bd5031e9e7b921f9a872ef3eb4b19207a71f9e4080f0cc9","systems":["Windows"]},{"id":"4a723ab1cf75a3cbfdcc0be39cb1704743c6cc451237942c0bd35b2973123844","systems":["Linux","Windows"]},{"id":"4ad8f053a49930abe7d10f1d61425c4bc600b51b36b94877cfee884ca2b45c52","systems":["Windows"]},{"id":"4ce7625af28f5a4280e7e68dd08b5b11b7f7711ffbe2db5ce812c52659202ea8","systems":["Windows"]},{"id":"4d03edea48b07e11cb3e33ec45e48cd67a6071e83ad394a7e4bc5c9d079a8771","systems":["Windows"]},{"id":"4dff6b27ef49c3dd179858769920bc7fc62cc00db19769c94dc4d4c3acce339d","systems":["Linux"]},{"id":"4ec461d2e50a129d2c6011c26c4d49e337487e8270759ab2956b50c1c9ddb573","systems":["Linux"]},{"id":"4ee3f9ef5cc74ba170e0d21dba43e03036978fdcdfdb5d3a9cc23edae6ddd1cf","systems":["Windows"]},{"id":"4f983b647e4f4e7311ed82ac036d16cfc679ffd28cd2117a77e2317e5e4b422d","systems":["Mac","Windows"]},{"id":"502c3e4bc10907a10f3fe55bc6cf21bab2b0c0fad31eb37f29771436f999b6fd","systems":["Windows"]},{"id":"509e3b3e50925e6e5d0aab0e5e21e87f1fa2f34ada157bedff70324f5c12ba08","systems":["Linux"]},{"id":"50b04a686f4ef5d4e9620525da9129f4ce447c39145c7d5a0bd7b4be4b52b014","systems":["Windows"]},{"id":"513de6de34a6405d98d7ceec7c60d1237b09cad7f49ccfcfae1decc41657b028","systems":["Windows"]},{"id":"51dad77ced162399769968bb4e92c1b79ade80807d7e5472b80b2bd2c418272b","systems":["Windows"]},{"id":"536422024237b2b2359e800d01cf799832bd26b2e1a2e6e78c07f1269e32e1f3","systems":["Linux"]},{"id":"53b52912da01cb1939c3ec946b938a9e85a384eb6a32ac1387530605de0e7e02","systems":["Windows"]},{"id":"5508784b731a30bf8374d7bfb084de0b8decceb363bdbe607eb8895b3b2b3f74","systems":["Windows"]},{"id":"57636d0b143e96dc19625e2140fe2ee77aee5c3d0ed51d99abd98afb25f44b26","systems":["Windows"]},{"id":"58334bdd4417f674447e420ba46ca40e350162fe269a0639522137a5d89626fe","systems":["Mac"]},{"id":"58d6ab1bcc17c43c91dd7d4f99b0c088a44d80009b45b2768bc544c804881468","systems":["Linux"]},{"id":"5a771ece10322d6e0f56b6e5aa292e05756933bff252178f484f419b5c75eaf9","systems":["Windows"]},{"id":"5b412f9e35a1bb4c961da11a6e1651988ccc20293986af5715263a275e0cad97","systems":["Mac"]},{"id":"5b45c1d9528eb7e04ccfd208ecd5dbef2be08f690112cd8ee302003e135d5e17","systems":["Windows"]},{"id":"5c7aad9fb2ea8decc5ffa0342da5be20c047e4c2aa67d7c3ed8b1bdd1b120a64","systems":["Windows"]},{"id":"5ced0f23fc056b71effe402ea9290b3e11f0564a791e6554a78752f9084d856b","systems":["Mac"]},{"id":"60119d177916a88ac5538389c427a533b765f1dd674a35d50c6f233cde85f3f9","systems":["Android"]},{"id":"62a1ff6f32dbcdf8bd00fca24c5ff9f811dd53f74cdd1089db82169597227d04","systems":["Windows"]},{"id":"6384ec2e40b7ba0eb27937e2035ae3fad3e0ebbe1585ec48bb39ab4704f367e9","systems":["Windows"]},{"id":"64b79636e5b62fcacb7028e1374fe5d62bf7b3fc2617e5e972cf4df2345e56c5","systems":["Windows"]},{"id":"64d5c8fb2ae70556296888f4d625f1a6f5789981ebdcdc22343339fa58a2012e","systems":["Windows"]},{"id":"65991921816f1cf9c0f18613b4ea6c39e4f4ae70c3801247a1e771d5965ee445","systems":["Windows"]},{"id":"65f226808c1de1b405281964f0be5bf167d24e9d5c4feb8c0fed2a763f6c776e","systems":["Windows"]},{"id":"67083ee02f0221b68ea6172ef5b056e90875345238a401f8eafcd2739a909178","systems":["Windows"]},{"id":"6709442df54db6d6822c07bb2a39614220df03d6c8d2f64cf724bf2aca680b5f","systems":["Windows"]},{"id":"68ba4e998fac8135478b69bd12b998a2d9801d645e8f143ee3a20c4189630226","systems":["Android","Linux"]},{"id":"69105b07d360163c911e6e85df0946163a36775e07eff8e56b891d445ea431a0","systems":["Linux"]},{"id":"69affab77900bad551fdf2e9409841d41f40bfb6e3cd0f61cca6a2f5863b81cb","systems":["Windows"]},{"id":"6ac945e6095d17ff0e797f8ad3a3277e240eae06046d71e5461876e15c3bfed0","systems":["Windows"]},{"id":"6ecec357492519355a8232300d9589e6c617845132804ee94935577bd03a81e0","systems":["Windows"]},{"id":"6f1a1246b711c39ea446d71b0764d7409859b4ab6f32981926fe20ce0959315c","systems":["Windows"]},{"id":"6fab658c401f84af53aacbd7e927a6996930e7031cea902d52038ce54e1d57fe","systems":["Linux"]},{"id":"70470dd7bbc6e2b4e203d288e0a176f278d24f3e4348c90bcef7e91d24069adc","systems":["Windows"]},{"id":"72f5f07d9e322bdbd9dba239a84c93e370d75f55869520f9869fe7e4ea258aba","systems":["Windows"]},{"id":"73c071b5f18914d0d8e4de6521d084e0e34eda36bad175827a6eea01ad0a78e6","systems":["Linux"]},{"id":"7584d63e065a3fd069fb351d5f67542754b08f52e1233dcdb68acd8c3b5195c1","systems":["Windows"]},{"id":"759d490d4a90c27baae28c453bb3f0ba76b5b12327c7ecd4902616207537d533","systems":["Linux"]},{"id":"778e597b1f5fbb3f3c270230d729f372cd3ab06a7cac1ad6a32d927df1ad766c","systems":["Mac"]},{"id":"7bdeff5678bf00e1cff72e5441b2cb79935de4b2e7ae18da417a0bc00d604060","systems":["Android"]},{"id":"7eb833da6d1da03c89e3fdddec5a24a924bd7623c11312f419b51e7723a03d9d","systems":["Windows"]},{"id":"7ed4f3081b55500814b9ef32e0418f777375e088f0a6e5816798ce403bf5858d","systems":["Windows"]},{"id":"7f17d8d7ec07df3827bba13a9086af7faa247779db410696f62c7e5b9c845e02","systems":["Linux"]},{"id":"81c382777fb96d5f83cabd24a7e22a035e5b5633fce95cb8429e767c22a2c7a2","systems":["Windows"]},{"id":"82be29a496a66cd5f8619d290dcd29b45087d590b9003742ef1d5183f7f17de4","systems":["Windows"]},{"id":"82f31714b06e76d15b603c5155f93609f99b72cc2f2fdab6a898585bfd92371c","systems":["Windows"]},{"id":"82fe485b4a2653beaf2b54c50aab064b1aca4f85930fe961a6ced9776a1f6ff8","systems":["Linux","Windows"]},{"id":"8478058f0fbb70d45e8b81bbc4462edfbf48ab36d0a6c4c592858cfc3e6da2fe","systems":["Windows"]},{"id":"8500d3659c5417ff180691cf6c0d498dc21810c52017cd7b938ba690a30017eb","systems":["Linux"]},{"id":"858a86ab4c3c1812083a540e869b48f6ec7df1898c0c58d5768c4c2ed579d281","systems":["Android","Linux"]},{"id":"876cc8f811a711b2320b9d9887b48882157c4a02b8074f5d9f154a5861f70d77","systems":["Mac"]},{"id":"8778bd6b3720762d44bba5310a9f68ecff500b08501da3fbc34611244480db1f","systems":["Linux","Windows"]},{"id":"87da423ed16fdf51c9a1dd9d462d8a8fad1de6b6abed06ef85fce0686333f4ac","systems":["Windows"]},{"id":"880ec1b1fb3781f71079b49dd37c9cba99914e754c01d3c80cee3820ffe5b4f8","systems":["Windows"]},{"id":"884edd474dd6b41f41d02571612565293f09f7f275ee5c8a2290caafa86effb4","systems":["Chrome OS"]},{"id":"88c25ed5d514691d37bb10ab04ae73f56d691ac170e0daac587c774a288fa876","systems":["Linux"]},{"id":"897467b3903cc8413a614176b036e6a3a3af3f59a91089f7f57b1623b670b8f0","systems":["Mac"]},{"id":"8aec8563c77e2f67a2f1a6858c48f80003838ed732bb8e3d43799367c0514796","systems":["Linux"]},{"id":"8b4690ba13039449a301394b69b792164d1a0aa1e7f8967e2e7c07cbed59ee7d","systems":["Linux"]},{"id":"8c2a50d5ef360a75d11d7cf648f882629c817e8d00dd5de109c428e8b05524de","systems":["Windows"]},{"id":"8c6706eac500f5b33b54628f8aa576700bcdd543af75b0fefe7a0104299b3e47","systems":["Windows"]},{"id":"8df1633004f2d69a4d945b274608f9763ad0a2e249a679c7478e5dad34c07515","systems":["Android"]},{"id":"8ee51b3f3730c55ce195712db8f88b6465a4b027c18d9be8f52ac0c57330508b","systems":["Windows"]},{"id":"8fe871dc283c5eebd3beff2123a63040c7ae8dbc9debc5e0f3d2503544a8d1d2","systems":["Windows"]},{"id":"91534d74bb62929f75fb8e08adfe3879ea95915759648131541b1c0dabf40118","systems":["Windows"]},{"id":"930ba0b87d8c555053b7ce0d282037ca4fda5bd4233b7a62ffc7030b19158ac2","systems":["Windows"]},{"id":"939438d2c8ffe5033e60d2d5772d7b21a67d578d63f69f4064082e90e700a2d1","systems":["Mac","Windows"]},{"id":"945e0ca6349100bca66a75e74758df34d36766fd68d0897ae6e63067829b9737","systems":["Mac","Windows"]},{"id":"97d2983bcd6f5749ca3f3f06b356a34e448fc22cb28675c89e6392671ccc5730","systems":["Windows"]},{"id":"980c383ece3ee7ca60998659c35e7ff984421e5f7acbc915a10ce6bebf30e990","systems":["Mac"]},{"id":"98d3a9ed5c35606c7d279606a4916dadd6c1d0775596aa7884251c3d7ad8cff4","systems":["Windows"]},{"id":"98d8721d41c77f034e82efed379931394ec1bf0915a1781e87e16ae19b28f734","systems":["Windows"]},{"id":"99f3e41ef7fec4978f8af13619d68b6b1cf627c9e0353ae0f3c6b0857dddc4cf","systems":["Chrome OS","Mac","Windows"]},{"id":"9a470e81b32b44ee88fc7c7f5942977eb14412b9bc32ceacecf542fbf42aacf1","systems":["Windows"]},{"id":"9a6221a2469efbbe2bedbda1a2d47abae475c0523be316c6614d4b7ba8e4e53f","systems":["Windows"]},{"id":"9a93db964f13b918eca27da5e56c8ece8a14593e2b67cb8b540d537cc5a2d076","systems":["Windows"]},{"id":"9b0b17bebd891e5994762d5aa110994f837ef13fa9cc8b430e4003dd75bea279","systems":["Windows"]},{"id":"9b2f0b2c5a2efb234831c73f02499752869c6752e1b80447027684d90cbc0888","systems":["Windows"]},{"id":"9fdbf39b8b4dd35d075bd639066d7d6febaae96d98b6d72dc0786be730689f7d","systems":["Windows"]},{"id":"a034511e1aac7a27277e01890a3e064985454af9670c5b36b818274713f35cc3","systems":["Windows"]},{"id":"a24fec3c01c8e47649fb768fab96762d4ef7e3e94c2d9d2018a431a62314f577","systems":["Windows"]},{"id":"a33aa7b27937b2a21c180d1f51af908f51ec682f51c890d8bf9ac6dcc97f1eb2","systems":["Linux"]},{"id":"a5ab83a1f4bfc8c2033a247c4a589e54a7d480be3cc8ae6e8f97f53e580459e2","systems":["Windows"]},{"id":"a609ef985995f2da9db46d2435770e3d277bef79f724539bdcbbef7100987a48","systems":["Mac"]},{"id":"a7190fa13dae864a4680d95ed5fd0e318572f05a0f61fd6d82a007e10ff9dbfb","systems":["Windows"]},{"id":"a7c462787534dc995ae63e64e8f20b61766ea784bf9aa510be71528d75575803","systems":["Windows"]},{"id":"a897a30c6e338166a78a0101689be46a47f2461c2760d69a026fb4f31e158303","systems":["Windows"]},{"id":"a9255109b28ed842e2ec064fdbd9bdd487c945d299984414bab53e54d32882dc","systems":["Mac"]},{"id":"a9a4756b7ffafcc5636124071faded6215a51325da2ab77cbcb43961b9c89963","systems":["Windows"]},{"id":"aad389a1ba329e4ec9fd1db9d894f41683b3a6c8f500bf0821a41767f0e2ca0e","systems":["Windows"]},{"id":"ac0318606646cbde863c10c601d1fedc9eb9e51a77efa750ac9a29ae3fe06978","systems":["Mac","Windows"]},{"id":"ade810fdee6a95c66f677402cc32f3efc0826672e320c3a817c0ba73f49ec65c","systems":["Windows"]},{"id":"aebebf4f1416c01f5999c52e820d489e34bb3072a59744e818efd88d08da74ba","systems":["Windows"]},{"id":"af65f42a1e7dc3879a3aba4fc7c3436a08fd2b811eb756c28dc977f9fd848aeb","systems":["Windows"]},{"id":"afc16b84808409db71bb222f9de6a3de0e1acbdb1a8bd269f489461f172a848a","systems":["Mac"]},{"id":"b05e019b87c952eb49ef390ac284b8ba2dfe0e711b9ec40c943b4b9b962be1bd","systems":["Windows"]},{"id":"b0de4629cfce82d92fd205e04428cf987cbdd2c6c1a0e8c44c494cbefae8f978","systems":["Windows"]},{"id":"b3340f6aee4d9d28476626a011b84d213c62b4bcee0c814c8d73df146722d70b","systems":["Windows"]},{"id":"b370ac36e7e221c9809ca0bfbced4aa7a207fe5219ca7f1c1af909978ba113df","systems":["Windows"]},{"id":"b4cc79a3ba4a776c85a2b2e5f80245cb7b6ed0fdacd7f1a7b237be858b520403","systems":["Linux"]},{"id":"b5947af3c0b13816a0ee718c0dd3adcaa5a0c55bb63841e81398005442f58b85","systems":["Windows"]},{"id":"b7500c3cbd85786db083157cb1f8b3beb9d735ebbe0daa2a22149e07d0f6ef66","systems":["Windows"]},{"id":"ba077fc6759fe4d95b5e8d9ea66cdc06a7df6af175e0b2e3b4a44106030225d1","systems":["Mac"]},{"id":"bbd934083d66e93f6a62baad295c289df6239a85bc48e30129c62cdcd2345c8c","systems":["Windows"]},{"id":"bbe1fc2ca6e90c221455cfe13ba6849323a1b9bcb3082fad1cfa80c98d0c31e0","systems":["Windows"]},{"id":"bd665140db906cba6f13d7dbbe668fd18855628229c202d92f13093ef5abc347","systems":["Windows"]},{"id":"bdcec7d57b645050bb67a2ff8b8588b37aa595f6ae1c0a625ef28b3b7b9c9f91","systems":["Windows"]},{"id":"be6b1a1758862e1bf00b622ca3adfbaa1c6d3c3539549be14ba1758af65c2efb","systems":["Linux"]},{"id":"bff51123af0c036af08e703c598f0806de63e5e78dbd4f7ec5deb9ef94d6696b","systems":["Windows"]},{"id":"bff5ab0a2066e49a5a2031c1c0070e9b1bad11f72fc5ed5111d9105e46ba02c1","systems":["Mac"]},{"id":"c1e18c20cae0651683da321f52b14f4d794971f1a4d019c1a8ec8c6c47c9b8b5","systems":["Windows"]},{"id":"c2887863e55216ef71533e9a0129d936a82e3c2e02e83e86da8e8de42b6fc92c","systems":["Windows"]},{"id":"c29eef4a3de3aa9c438912d71b04664527bd508affead0dc026968ba3143df75","systems":["Linux"]},{"id":"c3f07585d2744224acc42253d911111db2092ea5f7c0bda7c619a95ccc94f486","systems":["Linux"]},{"id":"c54dc7f46ac6d3cfc5e608c4bc134422827e187899072cc85dede4864ace1ff8","systems":["Mac","Windows"]},{"id":"c78ebfa6dccb4102ae9f7f21a05e4273fa6d69055e6c49945a2019f92481ac4d","systems":["Mac","Windows"]},{"id":"c91ebae36595df8ffc61e753eff21638a314cd0bf7b95343889a9cbfa6b6f7ed","systems":["Android"]},{"id":"c986a4b5184948b5cbc9ceac1d3eb926e746df6f0a70a8fa7eb99822a0756f7c","systems":["Windows"]},{"id":"caa11a35b959af6d015d58bf8b85f4fad9c712a2bb7f5e7332317999cb9dcc1c","systems":["Windows"]},{"id":"cc9c0b0b780df8d7266612fb4becb730ff7c357f26cf4969677359605ffeee4f","systems":["Windows"]},{"id":"cd230907d344290c067423eee795e938db66b603b4627fe0f130081f2adda49a","systems":["Windows"]},{"id":"cdd85a2eabc1f4397d22f8b959547b6cedb27ebfa10df7e74ae716363976080b","systems":["Mac"]},{"id":"ce7a0869697a7ef391515eb37409112c5e428f7dff52f629f1dd533349c0bca4","systems":["Windows"]},{"id":"ce9f2b775769acd10c3dd848002ff67f10684b932c6b2761d2d8c2fddf6a3a00","systems":["Windows"]},{"id":"cf122efbab2828ab091ff8cc5ed7611e8c938a81c5b58f7a3a1fca7df476c0b1","systems":["Windows"]},{"id":"cf87711a306bed37f09d67143dac8baa865885f20064384db6afe1659e54026c","systems":["Windows"]},{"id":"d0cffa9fa7e02fb432f34f1a8c7ef3b08a8fa3b9ee221d1f7d462db574e05b08","systems":["Windows"]},{"id":"d358a4a9dc22a58fad9ecc8d625f2946ec2b5453dac57f7b1b70ae6ea2a75ee0","systems":["Mac","Windows"]},{"id":"d3cee3d5b682fd8e5f88733d9a66c66e581c9830f70114b3415dfd90814cf466","systems":["Windows"]},{"id":"d4ea053ed0c4ea398a1af382c7634af74672cfb970df4faa3b129fced05d43c0","systems":["Windows"]},{"id":"d6131890452cfce8c7c800a2c97f29f71be709f7877a4e7e2827a10634133a20","systems":["Windows"]},{"id":"d85187b39ca4644f4b8b4ac1ce74faea86ee408137e812f6a6087136385cb1d2","systems":["Android","Windows"]},{"id":"d935a73ef13dede8e3b839940719d9487a6b725337478d29f21068633bbd782c","systems":["Windows"]},{"id":"d95d9ae1ce86de8e39895ba0723e84f670120e5050260f7df480727a7ed1dce5","systems":["Windows"]},{"id":"d971a95016be6951adf3513451952778320b5930ae4cc5b854c2df550a325db4","systems":["Windows"]},{"id":"d9a48c8a9693e609459300fe10dd128ff9d95fffe8cbfec9b8d9a9d29c9dcf3d","systems":["Linux"]},{"id":"db223f921bc63d5754d40d98997056a0d03060a1ded8524b059f2e688ba496ee","systems":["Windows"]},{"id":"dc1a7ffcc720a15a9c7ccd003fe60aabf101684d1ff98c7eab2c9c4b2fca9804","systems":["Windows"]},{"id":"dcbb830e386a6ffde731a8b6a07890b84c9a374e7eb77272c3514bdc58811968","systems":["Windows"]},{"id":"dcda5e9d20a9817f10ebfa1ea81a89de2d9933d433bffe1f99ae5dba15b60b2c","systems":["Windows"]},{"id":"dd75b2859b37b9f10f7c71a3ed2b8fa645514d5ea9098203b9e8fdf1573c5f7d","systems":["Windows"]},{"id":"ded46980004becef70c149df0c9908914365b04cae08c116b54b1cea37c8a1e0","systems":["Windows"]},{"id":"dfa8d0f9710740ab377cad1adcc8a34a6aa76e8f819be7f95505562c962ff8c0","systems":["Windows"]},{"id":"e042f712c7c4317361c533e5d576c7f21b4beacd3785620329877e51ae490bb1","systems":["Windows"]},{"id":"e072f2bbf08bdfd8c2229a33754918d88d5f334588c47a2992f756d47d04ce5d","systems":["Windows"]},{"id":"e1de71fdd97b1e8d2ef3832c0057c4cd4f032cd88f135a62d461e33d5d5b6963","systems":["Windows"]},{"id":"e5193029af8f66e6c94b4c9f94795a22c7a88b45ef3ce1785fb2a275499fbeb1","systems":["Windows"]},{"id":"e5a3fceb247e367c3b9533170b9f35b7674615fcff7eadeb4505ae1f268098f3","systems":["Windows"]},{"id":"e6e730088ce932319c4b18204e05d21ca07344e907907827d06e133d476ee898","systems":["Windows"]},{"id":"eb230357fcf6984c736d08672060031c637d0b4f1c1765ca680658bbef0c92c5","systems":["Windows"]},{"id":"ebf78452ab64dec64fcd94232b4316da70696c8b15b4c5ffe20dfc1f80a97dd7","systems":["Mac"]},{"id":"ecc36114e38d823fd28d63f3e7e234be460aad02af650e4a82144d041daca3ec","systems":["Android"]},{"id":"ecf97ba76f02f618ab46ed74dee7f2cadeff9a0c5bf998053995dee7bd38af6c","systems":["Windows"]},{"id":"ed8bd5280229f1ff9fe267378fddcb80e40f5384ac4729c880d68d8ffe04361a","systems":["Windows"]},{"id":"efa332e624072543711a5ac237ec755bfb07253d58fc6c1cd17787bb61fa95f5","systems":["Linux","Windows"]},{"id":"f47fab1f578fe39c96c46ac1996a449551f207d2870d06a46c3512e14d1aef4d","systems":["Windows"]},{"id":"f54c4a4f9a7183696ffd4ffafc54004a31fc2019cc067e8b1dee29fd9297df96","systems":["Windows"]},{"id":"f5ee22956639f9b8022096780bab933d820d02fd41d449f5e6564ec33014176c","systems":["Linux"]},{"id":"f6f3ab920ae72cf71e1de5898423e14164bf30abe18f18eac45ac0075d9b29f2","systems":["Windows"]},{"id":"f8555f725f7652b7d648396ec6d9fccbf83a336f68dc814abbe58daf84dab630","systems":["Windows"]},{"id":"f8cd43793d97c609feda0591c74789b45ae74506d77a17471334555927a8ef69","systems":["Mac","Windows"]},{"id":"f9a4f2318590d254a2dd8bd269baaa76c9de9664f96e8dd074abcc7f98c4933b","systems":["Windows"]},{"id":"fa84c32118885594f3dc243aa6152325440da8cd27b1822701ac3d49020afdf7","systems":["Linux"]},{"id":"fb0954908f548765b05c114070d3ddae78948819b5af25fb78cd95b69c123bf5","systems":["Linux"]},{"id":"fb41ed34c2ae7618e9ca40dbe2fc332f74e5d561a3aae73b8ea2e4277ce4f4c3","systems":["Windows"]},{"id":"fc47a3f8838034c4e4c705095a985adb2155a3a319179e0ff8cb82f4ad6fcbc9","systems":["Linux"]},{"id":"fd229db137c7b889802fb2b49e0a0c8d887817e4ec7928a28f6d378d9b9232f2","systems":["Windows"]},{"id":"fe30376a8bbd201d36a53dace8a5a31eb76fe076c1de8165c6bac86aff4fe204","systems":["Windows"]},{"id":"ff32c244f6bde73df781729debfae71203bbf5c88cf299885ce6775aca5fb3fe","systems":["Windows"]}],"Chrome 80":[{"id":"011360946345e15feab12be332e34370f9691f55e2a82421c15de69c223c5ea0","systems":["Mac"]},{"id":"0ea974cf7bcb0ae54a0234133d0926c3cd769be86799918e7725103b69f87362","systems":["Linux","Mac","Windows"]},{"id":"2064132b2933724eb512845376d062ef8e31474db640567dd81cd7be34da248d","systems":["Mac","Windows"]},{"id":"2a42e6d42591f506e4f4040ce8eafe027a29c25a6dd8e9b5bb38935345cfbe0f","systems":["Windows"]},{"id":"318f9e5e59dc95c613dbeb8ff77dacce982f74f0f7f8f1531b0e8b1c3d12f231","systems":["Mac"]},{"id":"3b0e6bb17a637099525816a475503b391d8241d0189bbe1a00316efa5b14b62e","systems":["Mac"]},{"id":"3e8f3010d741c1f974483e109662c5987a0a21aff58a8084f3d4c1cfc7ebf77d","systems":["Windows"]},{"id":"576b00bff0f888a463892010c8130895a399017e7b9e29bf4bb5e07cc6d7f12f","systems":["Windows"]},{"id":"57eb537f4b28370073ca158641ee46e9f9e29d1ade719ab8755e6dbef15b0cc9","systems":["Android"]},{"id":"595b3b10d8abfb688937267c5ab595fc0b1bc73ac5decd6bfc020050d1ee5a9d","systems":["Mac","Windows"]},{"id":"60f5f3386226ded8564499e2a8d34d16eb69aad68c3a64ff88142e693556afa7","systems":["Windows"]},{"id":"772bb92f288b3707cd3711e5eecedf868a712d1838b9b054c5acfdabd4c95597","systems":["Windows"]},{"id":"784fca7937ab01247eac1ad9158fb21cdd56d9bb05ed13bf412100cf6236b19a","systems":["Mac"]},{"id":"78b26021e7209373edb0d198519eb841d8d13b6583257eb5dcad956338cfa2e6","systems":["Mac","Windows"]},{"id":"84ec068942a3e115f567db35f7a42a4e008b5e8dccbad3074b2f783a1c6facb3","systems":["Windows"]},{"id":"91996208285d5f04cdc03f52dfef5b73ead6377fe3ca6e5e70baceb44d45e333","systems":["Mac"]},{"id":"bc16f5f6e891ee95562b5814ed12fcf93de00a023d8f22d329b4aaf2c169cb18","systems":["Mac"]},{"id":"c0863ec9c8a79f255213b04f5d3c2878fe851d852dbdb0aa239816ede87a4810","systems":["Mac"]},{"id":"c97b5cdf9dc92cb397537e0959c49946ec87cace71e1f130c3b4079b8ae25e83","systems":["Mac"]},{"id":"cbec782ba8201bfc92aaaae4693d9c67cf05d898cdda47e837a47e1156129def","systems":["Mac"]},{"id":"ce28de7dc73eca81aff93a4a0546c9f15dbaeed1e597832bb46d881a29e57103","systems":["Windows"]},{"id":"d6c612293a3caadb5cb201d5688cfcf9c8a0e1aef5562eace7c7ede9f75d76a9","systems":["Windows"]},{"id":"df4c1731bcfaa53000719ff959366a81ada710e2c9e6777f6f4944f9245795dd","systems":["Mac"]},{"id":"ed02b1b530447770aa79fed40782739e713b726157b93ff98372fa5a27cc7a5f","systems":["Windows"]},{"id":"f324f76b6cf23ae2695b69aef94b549fc17ca590302561455d2919a620ca77f5","systems":["Android"]}],"Chrome 90":[{"id":"0122b467866d491b7c6ae5715ac8e2a2c8f33b28a78508574d760ccdb7fcc7cb","systems":["Windows"]},{"id":"01cab0bc0e7618083bfb07f46f781426a883d78c1e690cbd3cb979bab8ada75f","systems":["Linux"]},{"id":"02841a93801ebdf522eb36ea63fe16a52cef7837ccba301374922f705d72c4d5","systems":["Windows"]},{"id":"0372a30b9926f0a01f11410857bb980ec7a5b97c86a712bb6c531a5dac47ea67","systems":["Windows"]},{"id":"043ce5f7328f97fc48afaf08a02e49091c02b2ebd20934a446864addb3e21a5c","systems":["Windows"]},{"id":"05622bbabc272125ba882825411e0ef197893d18c175c8c559478f20c96a3ce0","systems":["Windows"]},{"id":"05794f94d01744d067db5cdd13e948f13957fc08e2c706d3f5e7d05e9ff17eea","systems":["Mac"]},{"id":"089035735ddfcd754d365133d4d1d748b8e5a48c9b49ff3662c1717a43e80b24","systems":["Linux"]},{"id":"0a76c31da9835ef13f29f50f2950d1bea5c67a214aa41eb75a59f34e1d742b71","systems":["Android"]},{"id":"0b0dd85cbe088ec74f64e43d7c6b5d8c56c1af2fffbd8e038ad0062f4719d9c8","systems":["Mac"]},{"id":"0b210b4c52a18d4342d4fc34ac64244a70dd2ba6eefc5d77913ccb5523c53650","systems":["Windows"]},{"id":"0b3e629835e9321d820bab1c9b8bed29e79af885598bb37515e15c0d6df93052","systems":["Linux"]},{"id":"0e1be2263c51cdc2313b3a3fc335f250fe993cc256f044695e5c1de5c83e43fa","systems":["Windows"]},{"id":"0fdb60892e24d7eec59d0bcd31914bf07e5b1648977fcf1b6c012cfa045b648f","systems":["Windows"]},{"id":"111f141e9a2705deb59c3ef3f51693316d7d293f6fa15bcef1230ac3b4749e44","systems":["Windows"]},{"id":"11666c592972031171bb28ba88dcde030a67ac631285fb94756a31808d62d8f2","systems":["Windows"]},{"id":"12132b4ca3f16cfde0ec26e733e1f74495b77b19e5e83d117f9371634e057bb4","systems":["Mac","Windows"]},{"id":"1277c398af3b732f2bf1ac34aac6edbf12ed757c3c35e985087ce705debc4542","systems":["Windows"]},{"id":"12f3ad01cb75222c58738afb7dc753b2b48e3b35dd43d515e8d68da87bcee864","systems":["Windows"]},{"id":"13495e94dfced622746b0d636d8fb04cd5465d76e61f44b21d3ab9acc1379799","systems":["Windows"]},{"id":"1407386684d21af010baa300a757aa041a6ba84bbdd35dcd390f79ed48090c11","systems":["Windows"]},{"id":"152e65099df7b06c274afe388d446c31460eb10883d90e0837fdb50a1088b865","systems":["Linux"]},{"id":"16b56d63dae3301375e5c27328b5d5aafd9f1cc837023eaa71b7d01e94a64d36","systems":["Windows"]},{"id":"17232344c4a74776744d212ee0c3af65a76fcf69fcbfe9092344568e74c82db1","systems":["Windows"]},{"id":"175ede246e75a4b576e265685f7fcc0534084c1cfb1785bb4f090a9eaf9d4c6c","systems":["Windows"]},{"id":"180926e536eaa71f8c1fc7af4ee3b06e78b1ad73ef3307632c0fd1a6bf2d0c8e","systems":["Mac"]},{"id":"18b3fc22e0f05783ee9170b64208b9f86ed8cdab6b91696ab118fb96dadb1b01","systems":["Windows"]},{"id":"190e03b3eb6d4d6e9b1cf3871091b8dfd8c410757329b43a9b90e4d4f3ef5d2b","systems":["Windows"]},{"id":"19214eb7111c67f65d38ee4fd4e435c5d4091d9d1796f01ea9a21e16c2d394e0","systems":["Mac"]},{"id":"196b726b1df38eaba05c46d0f74f65456755090e30c193ca4c3a89d0b0366420","systems":["Windows"]},{"id":"19955cfdbd4d0cea3097a8f5e60002deb7cc02b165f99cc8e09cb4d05ba710e9","systems":["Linux"]},{"id":"1a512a9492e841289701fb9d1cbf93c5bd8b201e01423817a2e48c308c7fd442","systems":["Windows"]},{"id":"1ade3fca01ae75152e2ca6501b46df612a9c347e398ad0eed67fbc3e6f3d24b9","systems":["Windows"]},{"id":"1ca30564d6accb39ef14ae4880b336c2f6e4ee5afdc5b4ae4b3ddd7bd01bfa13","systems":["Windows"]},{"id":"1e265313dd550923903065beb8ba60dac6588e5c728e15598c928ed8607d1ccc","systems":["Linux"]},{"id":"1e617ce587e995f12bc496be3841ec8c13aa5c5de80f24c25bc9a99de19f6dd0","systems":["Linux"]},{"id":"1ee1dda53b1c662bc751c62050573ddb052c75751443ef796eab0dfce42fd01e","systems":["Mac"]},{"id":"1f8d001bed032c28dcea794fa801300d9ef41596f80006f292568463e57365e2","systems":["Android"]},{"id":"2162f62d6c2b38cd1af71f4f07c34b8d7b0065ead312550f37675f419b11b0c7","systems":["Windows"]},{"id":"233970d612944e793dfb115f03379705a89f7e938b5f9d7c1bcc0e449cce2bca","systems":["Windows"]},{"id":"24a54b82ffa2ab0eae7e917de341d7bdf5c851d544524f8d1bc7b131aab9eb15","systems":["Windows"]},{"id":"2542ea074359d3017ba409a5d0daaaf652e491a121990bc6f6cdcd056da37b3a","systems":["Windows"]},{"id":"25837d6299b78867d8677030b223fbd1a64fd50a4b434dc18d0cd2c79081f6c0","systems":["Windows"]},{"id":"25e183240ad1156a4998322ff1cbd183e630bb78c3a17b4b6b4696ec9a2d4591","systems":["Linux"]},{"id":"2a34fac15e3152699d89ce0bc09564f82a4817d279e1e8977532e2ca2d105508","systems":["Linux"]},{"id":"2ad7fe0ca53876dab886d116502bd16d66e0a5533cf3cbe7991bd8da550030fc","systems":["Linux"]},{"id":"2b913fa4c27860212ff8c1188caf516c7001cb81df327efd3d10f91d7f624e7c","systems":["Windows"]},{"id":"2ea6cc69b396ba6df2e7922818dc78dae9da6f589ad7947bdd21ea4eac060570","systems":["Windows"]},{"id":"3096c5089e9017030c1401b23651dd3518324a5e0cd6dc30cf7ff5ae488f3655","systems":["Android"]},{"id":"30fe9231d16554240e6ff0a63287726b31c62659b0f644c2a02474bb5088edd9","systems":["Linux"]},{"id":"31a6213a4d09d8c45df3ad6f8bc383fe6102298e3e218fa0581ef4df2d06275e","systems":["Android"]},{"id":"31cc54d7c3c670e66e7dd79c094b5cf27152d8450e174ff76bb561a2ab4579b9","systems":["Linux"]},{"id":"31ed0c83e605b27491ea96945e5d7d14781fec450e569ce48d2b64c2a1a5666f","systems":["Windows"]},{"id":"3420640c0ebeeb9e5fbb23e93e8578d61bccbd4f9770bb24e0c1af45a70fee4a","systems":["Windows"]},{"id":"34778d8ff060383791c779cb9e2a00205428a7aecacf06521c24ba48042977a0","systems":["Windows"]},{"id":"348996afef678a75b442431b856fac0a256103197b161f20d71cccd8e2c76d35","systems":["Windows"]},{"id":"350ef7d7016ae5a8785297f7562b8ffaa2409b5d61aa44234dd5410dc924a652","systems":["Linux","Windows"]},{"id":"39a35e99f422eb2f2e70d7414d6058809ff14b3ac01925ef413a7f5e1a91c8bc","systems":["Windows"]},{"id":"39b1d5a6b74dcb3d2b9a856ac1c4f7bd178d0925af51f971503bd11ea0e2e742","systems":["Mac"]},{"id":"3b52e07e91f75a36dae8d53bf8054299bdb30ad91dafe341f5b7cfbc9a0cdfcf","systems":["Linux"]},{"id":"3bafca78daa5355f646257e55eb9f369b1a61498349bcc92ab621cfa8eef4c46","systems":["Windows"]},{"id":"3cfe74b308548ee16ba7e187a2d920e74435f79fa997db85c7712ceae299b6d3","systems":["Linux"]},{"id":"3d19f87f3356a36d84993ee7e7aa7a9f7dab4e5a4aa615776b9a793806d77459","systems":["Windows"]},{"id":"3d3fe10eacc625bbb9a9263f28a239b9767239b9c0fedb8b1a1d7062ac928d3d","systems":["Windows"]},{"id":"3e47623efce2b3e79222b449e80c7b1d93baf8f567e04ac45e59cceecf17b9d6","systems":["Android"]},{"id":"40233b9852353d29ef3317e05411d0cffcd5e80b8cc8f49d59474ba2e9031f09","systems":["Mac"]},{"id":"40d4372aef9f4a51b15218f8823c42b17506ee4bde027c0f90f0af9e353bf967","systems":["Windows"]},{"id":"41c093fdddacab64d1e7277466d3cea1c3897d8d1552e43f7bbcfab8d27b9a25","systems":["Linux"]},{"id":"4220a1112ec38e06595a0c07348b85975782ca6ebaeacc2e4d13a70eb8576e71","systems":["Linux"]},{"id":"42a7c270805b7535632936fd1cacae6769e38079d2c70a2a976e4fe1e0e65dae","systems":["Windows"]},{"id":"42a9dca9f490e783381de1b4bf318f3d31cba003271a4114b245a96e866a0a78","systems":["Windows"]},{"id":"434b117bd3c907315bb71776338c1c206f0ab84f78e3f7c9cb651e14da1ce5d0","systems":["Linux","Windows"]},{"id":"43d2e4cbd51232dc6f9f9ef49da62db339c71cebeb7ffb4f15a7a2f2529caf46","systems":["Windows"]},{"id":"444f20156ffc1f22a4f71b85714aae47ac10cb070626ee345da54bf92e8494a7","systems":["Mac"]},{"id":"44891aae5cc65f08859c47abce5389a05d38cec63e6857539cd303feab7327fa","systems":["Windows"]},{"id":"44b95d80d418fc1650c2516c5d5e7122eb501a8a780ae509e793d2acfc27fe60","systems":["Windows"]},{"id":"44c4ba1cf0eafc95295a05d2b52d08fd6d0cb3bdc5bc16b8653d1df16413854c","systems":["Windows"]},{"id":"44dcf46c03101eb82fce32b076f68cc06bac6d65e5280f483b5a913a1d740533","systems":["Windows"]},{"id":"44e9852afa03aea301fd372236d06acf529b09ddaa8b00fc3e6cafe454172f56","systems":["Linux"]},{"id":"47659e0d65e7b7489f1f53e4317779a0505d28dc74c7037b3e66d31505f3d7bf","systems":["Linux"]},{"id":"4b654ead28bab217f59d1bf6c1e09dcf1afa1c474fd78b33fd09166dc51d9e58","systems":["Windows"]},{"id":"4c14d45064ae7bfc885e5b89ab8c2d9591375540adfb6d3734c9578f09e38193","systems":["Mac"]},{"id":"4d0c9d42ddf55b9b87171e1d8316fc5fd9393b421d1837c8076d67f7d3d44bd3","systems":["Android"]},{"id":"4ddc5f298b4f4d0ad889d8533745d5fa540e9829eee5f5b214d74a0ee0dd3ed9","systems":["Mac"]},{"id":"4ede5817a80842fdd8019216b4496888c1623160a17f1f06d280851ab92af0ad","systems":["Windows"]},{"id":"4fbc4a2aabc7b748db531e714edf638052dbf5d75b1fc4598956318f214bcc5b","systems":["Windows"]},{"id":"50d38544893894008664bf26ef6f77fd87c224b04cf9a11863e24982b596b25d","systems":["Windows"]},{"id":"51325926f15eddedf21a5acf955b493efa6204bd4fcdb142a27f6a44751e487a","systems":["Mac"]},{"id":"5132d9e537fc78acf410d708e6fa97ec61a31eed4ee6d089dbd8f401e49d6e51","systems":["Android"]},{"id":"5306d21661268890b821d11ae42a9bf33013b5b17e9663c0f6a169491a669281","systems":["Linux"]},{"id":"5350a902f7cf3846fd0884cbb455f9f817f1e4bd1e4e1196b83ecc1a82b2d459","systems":["Linux"]},{"id":"542ef051610153c9895e925bb105aeb57c28f2fc45dddf26bb076c7502113d01","systems":["Windows"]},{"id":"545f94c8b5568d41890f8bbd7a335fbc1b07c5b43f8307dd040fbdb0059aa45b","systems":["Windows"]},{"id":"562bf06a92a4ca18f5945d8294bdbc371fe8d6a1a3b3e5aad9d9f4168659443c","systems":["Windows"]},{"id":"5746b7419d72ffa1740a7c06b99c8e03ad126d6ad88e23dcd2d5b6cf36fd26d7","systems":["Linux"]},{"id":"57b3282f75b4a5fcab7e4e8a523ff81258cc95a8a47d8d1d711df9555efe8f0c","systems":["Windows"]},{"id":"57d2fb595111030ad69d75987a75fc44609a3b8d4f2c238c1d460addf20c4df5","systems":["Android"]},{"id":"585a089e8c1fbc5bf9b2af23ace4416eab93bb21d518db75229586f3f5cebb08","systems":["Windows"]},{"id":"597bde4725f0a67e2882d0d603ccf41f38968f1fec7a85db34ce048644d30ca6","systems":["Windows"]},{"id":"59a386ef2bfb2c60e280aae79490ddbb68b7bee330f9d359446ced232c1cc85d","systems":["Linux","Windows"]},{"id":"5b09d670bb5251648dd3c5a67555f1b275bd1d70f96c0d4ff2fd33d36ac084ad","systems":["Windows"]},{"id":"5c21121cbf3d5626beb26707faa6a6c8c2d809208535d0ba806e8a244529a280","systems":["Windows"]},{"id":"5c2df2dadc015fd75d509812da294d9d51ba453fede000b14e833f738a4517e7","systems":["Windows"]},{"id":"5d3447914db2913505020b4d96af4876202b4bf631a08c69f4edb4df73fc417a","systems":["Windows"]},{"id":"5d5e82e9434814e8b11fcef3fcb033f2eb1b1d4809834cfcddaa90e1846e6f64","systems":["Mac"]},{"id":"604b198d65b944b69c639b380357fbe86fb2837f8bb69819cd9b92be040f3d46","systems":["Windows"]},{"id":"620d52df10583dd9f74b547612c2f7d0d8a54017eec5e2983ebd96f16ec92e4a","systems":["Windows"]},{"id":"6322ec88de430124bc0689d04336081e8e8b10f0a96ba415ad3e0b816a67d427","systems":["Linux"]},{"id":"65deed548dddbb6c9cd4406806a11237ce7ab165cec92163696834dc7d866f93","systems":["Mac"]},{"id":"6632be2dfebb9616266a33dffbcd64ffb509a9e5ed80e31268859288497f64c0","systems":["Windows"]},{"id":"6777bdb62835d077b5becaa697d4662b5ff09aac021fee61da5aab3852840b21","systems":["Windows"]},{"id":"67de067b988d248d1c9897ff9f8bb826c2c9eabce38d1339d17599241cef3d50","systems":["Linux"]},{"id":"687d76612740c4500a03e292c756713b9f57af516f55c41276528258a2da9072","systems":["Linux"]},{"id":"6903fa8d88e392c2fe3f25764294524c911e42250bdbb3728bda417f5a4f0681","systems":["Linux"]},{"id":"694928409a84f35fc0e29300946e0eac53e2b0c01fde58a546a86a7f4a6f4bdc","systems":["Linux"]},{"id":"6a24023bfa9041724a1851cfc04f21587576f97a93e8fe309867eec6c5a57953","systems":["Windows"]},{"id":"6a2bf3e545ca578112989f87d56df6b031bc03ba474a005626640bb8cc4c2db2","systems":["Windows"]},{"id":"6ceeb7f5967b9a1d983a6db0f4e186e26af0f3cb11ae9f767b6aa2ea1fa10952","systems":["Windows"]},{"id":"6e98e64af9d3f93ef67468801a18f6f46167adef2319494639ab21560b9a8934","systems":["Windows"]},{"id":"72e58a74b3448f24894d4fd2a0d714d8e22e001e7c12c1833080cee4efce869b","systems":["Windows"]},{"id":"76b73f3374c582b527b8e59dde9c75a06cb5d01c1e9f7c58e84d7e623c6e30a1","systems":["Windows"]},{"id":"76eb73804bf5be956a2d349562e76eed5a07888243c07d188bfb2ffb5348cc99","systems":["Linux"]},{"id":"7804a0912b087b472b7c3e3960e9f86389e79036261aa849c453911d75e52fee","systems":["Windows"]},{"id":"79d12ed4dff0f1c530385377f90f6b76645e97387003a4b653744b5f24d8f8b9","systems":["Linux"]},{"id":"7a281ce6ffe0ec998e9b6574dcbbda9c6d8824c50ea39224a0c6bf8bb5265f91","systems":["Windows"]},{"id":"7c7645dc2ce8075b036a832cd3d86bdbde53293babdbc9d4d96eaea951c4ab81","systems":["Android"]},{"id":"7d62a0ba7243fc91c445438c669c581834592e7eda0bed7ae3843dcba6afc528","systems":["Mac"]},{"id":"7d93e169e529bd5036dce1adc008a0523a9d44d579f34bf5dd67a8f7482d5d6b","systems":["Linux"]},{"id":"7e4413b9df95ab1fba0ec831d9c31c2e59f6a7d7d6108baeff37d47e3d7fcf66","systems":["Windows"]},{"id":"7e4db3cc4a932d50dfbd3cdeff2afd0a88cd8a7d3fcb6e46ef2d72ef405cc925","systems":["Windows"]},{"id":"7e655e48629f38ba84afe14948ebe430d27cddab2183d7f98b61b41f21600d85","systems":["Windows"]},{"id":"7f647295baf970d15b8aadacf705b7e9cb7d9116e107db75848ba0350d35e85e","systems":["Mac"]},{"id":"7ff6ca6d1a07ea328a9b9885c48a90546e09b32dc8807a0c56387ca987dc4601","systems":["Windows"]},{"id":"80dc47c7e00aa0f34b2acd4099f4a80ed185b8096d31e2ed45d7bebb6f314c2b","systems":["Android"]},{"id":"8106a03d8cb1241b29fcc49fa435f446adfcfabe4935d63a9f3ebdca2f57da96","systems":["Windows"]},{"id":"8128adcec72ff634b25aedeb9545e9efb1912d27d8dc9a2194c5e891ed178220","systems":["Windows"]},{"id":"8345a1066f7b3affa08adedc2325f6724f388f3650541e1d5068613ee742ff47","systems":["Android"]},{"id":"83851c53322e1e7cf694fac0b26b1b197d428b4c9fc71792e31200b3de2f4f37","systems":["Android"]},{"id":"843865af0a2e00f9c27ec9fbb5261c331db837887655a2c289a66f7278b38c51","systems":["Android"]},{"id":"8500f688c7c26d5ed193fc9930f94e6b4ca39d04eea2654fc0234d6218cb2527","systems":["Mac"]},{"id":"86136cb0e2667a3915c14d22a89d0961ce12449eef64fe6787c0d83177ec56c6","systems":["Linux"]},{"id":"86ccc1f537a9bfb0a05fa40e970add00d45b9c1331c93c9ea4700583904b43ba","systems":["Linux"]},{"id":"87978e4bfc0dfc9ad6f9614f0a243e7aff2ece36d524d4a52d0e862c6e843dc0","systems":["Windows"]},{"id":"8aebf8642472be4ba801187a86c5726d5f48de8729c6c418e16f785d0044030d","systems":["Linux"]},{"id":"8be4c815b4096752d7b8da57053cbb8ab7f31ebc18a7ab25a6373010dd283d47","systems":["Linux"]},{"id":"8c9d5544f38bcfd4f2e7e08b4ca28b88c13f7a984c2c90f3f7ffd17d3d7f7f75","systems":["Windows"]},{"id":"8d68fc484d9e1ba6734446a8fed61ed9dc1c6134504357355b239eaa60352cf4","systems":["Windows"]},{"id":"8d96e00fd6e3828d5bdc3e1757cbaf1a09aef34a99b8467858e36aa44a5fdac3","systems":["Android"]},{"id":"8df504d2dcd4234e8673a2910db76b20962f3392e708e758e4a431a12b163150","systems":["Mac"]},{"id":"8e613191e9fe76d504483c4d00efdfe536e48fea73cb2e0f0bc3685ef15046ab","systems":["Windows"]},{"id":"8f74db385b923b43c1abe5d1383320d617818444e177af7b063d01ecbc416c3e","systems":["Windows"]},{"id":"8f8f55a3e054116d6889f6b37543b7431a08131f6af0d0eb838912abd67bf008","systems":["Linux"]},{"id":"92995898cec174fe77d5067a069f65d080dfb69095fdc35793509e848a59783f","systems":["Windows"]},{"id":"9432f7d79f7353492c2fd5102fadbb15fd81e247cbf33de3de335649849bc515","systems":["Linux"]},{"id":"949674eb30931ed0d305cb16ad52c3049d4aa0623fcc8ce32b73fd6de19b5e55","systems":["Windows"]},{"id":"958c1a09c772b7f9d5914472868fd10a8d5dfedfab00a5cf4e5d67b346e9ef6c","systems":["Android"]},{"id":"95deac940c0cfd86e0f3bdc114c6eda204c8c703588b97cf1fc5c502409fdf76","systems":["Windows"]},{"id":"986ba3075161024c547ccead16232cf9937f8a3fb2d1f5fae774f0f9d7bbad68","systems":["Windows"]},{"id":"98e97b85c94ef6c359d1ad0050d8bcbe51e8bc282470bda72db6e5b6dd6452d9","systems":["Linux"]},{"id":"9b1367fb9d37f4f5c6fe02f396729aa78aab21eefce61ab1518aade5e89e2fa3","systems":["Linux"]},{"id":"9b99a4e8f500f72ecb8d4a6b5cc0c3631b2e5a6874a67c959ab09ab1deb7a3b5","systems":["Windows"]},{"id":"9dcca3836395e5e74c4fde5f46975d2958879f0705811a9323858e778fd212f4","systems":["Windows"]},{"id":"9eac7fd78835608aec278531bc2ac690dbe1d501f3500f92e1e9643417595d09","systems":["Linux"]},{"id":"9f95d3e0ed0c26eff365ea214aad5b0f4b8386284ab6af79eaf215504de9850d","systems":["Windows"]},{"id":"a20025a41e1ec709dc9a2a8b2264c135dd11e3244d5e5b38c8a8a4249bdc3286","systems":["Mac"]},{"id":"a20f314681e9b48234c2137ea98618c7aedd30415db9463a0643ccff3f59bf95","systems":["Chrome OS"]},{"id":"a31cce3c8a13d43ed5b3cde8beabe6cf890f171f8f0e73923176d995bd908028","systems":["Linux"]},{"id":"a7d9eae2da801a1ec2ad1850c2feb0666c5932e21becf13375e578a2cac6a358","systems":["Windows"]},{"id":"a81d510b5e550a7c7324a0ed498f64107f0acac8072f9a5afca7f720830d5345","systems":["Windows"]},{"id":"a84b89c69ace3b2bd9bb656aaf509494e66db2ba5bacc2d100e5e3e29484273e","systems":["Mac"]},{"id":"aadd4df62115b42e77520b46c7d09c0fc2f7bd0363e2fa38022d9be7ec189519","systems":["Linux"]},{"id":"abd39f4291193d247afab9dcc6ba0ef3aa691688da290cfd95daf64ab50432d6","systems":["Windows"]},{"id":"ac092c73c96969d7203d359b23b39227ddb316195f399b126b2e4adf8e2ce272","systems":["Linux"]},{"id":"acddd1b2f35180704b7f3f17a37dbe5e9603debba77eacb465994e3587c8c750","systems":["Linux","Windows"]},{"id":"adfc6ee8d8d5758a015a6c7044ba480f7f826a5de4980e708e12a86b90127cc1","systems":["Linux"]},{"id":"afaca97535c1e3e1c3b33cd954c77ea176f3b68bf25a9af2f0912d920bc410e7","systems":["Windows"]},{"id":"b04d22462423d15c44e8313f133a19e4256ee345c9abd53f76dd3ad8073af0ea","systems":["Windows"]},{"id":"b1d556e9c99a440625efb3a5d3f62e532729d0b9b08eb3cb652d28a956fc7bba","systems":["Android"]},{"id":"b2ab437afbb759ee0c2915d733b69d862fba0514c1a2d0b0bd3174bb8ee34d1a","systems":["Windows"]},{"id":"b37411ecb3f625e5b601fc4e225c52f33daea29ce4e0b6d8ea6b7aaa4d7dee81","systems":["Windows"]},{"id":"b5755d6af72ffeb27915dc8c9c39b45b1fec485f6db51ef3d42d1bc46039bb5b","systems":["Windows"]},{"id":"b57a9369e6e93b10ab555d96298fabb59c6d6444823119f55a4e2132aa26c32f","systems":["Windows"]},{"id":"b5d08083fdf331deb3742b2c24f3edc3c97f6e2a5cf016e93cafe116338ae450","systems":["Linux","Windows"]},{"id":"b6a097f3b69387a0bfd869825ace66087defd100bd86958c7a051eb82ce078f3","systems":["Linux"]},{"id":"b72282a9dc3530f0a04a578d6fb5622fcd9d35b8b61d25c088aa9c96922de0a1","systems":["Windows"]},{"id":"b8e2bbe671d0f1fc4590d92b33582cf25070db25ecba9b26fd5f1cc8320f617f","systems":["Android"]},{"id":"babc31dd0222b4a49bb3fa83fd4ec5d8b2883dd0eabcc6559b16cd18e65b8045","systems":["Linux"]},{"id":"bc6553d4009e83d31eebafe18997aaa20e7774d468622bd3ac67c204aed42a21","systems":["Windows"]},{"id":"bdd9902adfb3c2efb1cacb83ff3c2bf4d02aadafd563a3af9521292638aa5d99","systems":["Mac"]},{"id":"bdda092057c141eeee0cdce6470529051a796a70409cc56bd18ff6b31159f90b","systems":["Windows"]},{"id":"bfc2891af73af3689eee67da4433ca1f158dcf6ead00620165bdf7e62416a43a","systems":["Windows"]},{"id":"c30995747fd3d94b46fdda8a930db6a24558dc81977ecf072e861b703f5a8031","systems":["Windows"]},{"id":"c35d5f53cde63134f02b7109fb009116ac9b4c67c8be500b096a8ff7cc1806b3","systems":["Windows"]},{"id":"c3abc355bc5acf53b4200a68ce3d5fd59239c5ec2a1344f0a7239f5dd0968261","systems":["Windows"]},{"id":"c3e8380558e61e5b2920dec742dd838022b52fae74861bf25cdb17b374f18260","systems":["Windows"]},{"id":"c4158fb24645657f84317077a06e59aa9e9bbe68a7d984b2e70ac6ad4fbe8917","systems":["Mac"]},{"id":"c436103327ffbe6f1d250bf26f737400bd740e0fc65d871d38dfe8798fddd08b","systems":["Windows"]},{"id":"c53f4c572f319f6d520d1fb0d2761558c3390edea47f1bc64a389252592f118b","systems":["Linux"]},{"id":"c644a34e2c64b8c7a87ea79908bf7d8d59ebb1cd003c847cdf59ae6638b03b5c","systems":["Android"]},{"id":"c6ab6d598a62e28498ac9bc3a90d8ed31708d34bcd7dca0cf729d384c0e0ee05","systems":["Mac","Windows"]},{"id":"c7e22c6d9b12f5ed227c0ffcacb9bdb4a832cf38917a6f75ee644765db02f905","systems":["Windows"]},{"id":"c8fd725c2888b3293cd8fed482b292582be5ea4031f172c870a03c9887908fb9","systems":["Mac","Windows"]},{"id":"c9a6fb6456e8693304be6d544590cba92849a9669a673de11e1e2f0a895804d1","systems":["Windows"]},{"id":"caca40d411cf28d8e2bd445c8cf176c26eb9b2b2e4ba3878f568c2101ee7c71c","systems":["Linux"]},{"id":"cc9c4d4c123859b88b45bd8036c68287280fa22dee8b993471b63688352a2fb6","systems":["Windows"]},{"id":"ccc0286c847fbbd41242674acf52c75850e91b60a01f74d081d8550769e8d161","systems":["Linux"]},{"id":"cde1ffb9a97f83f81bea5c151302ebdc5137ef1637fd8faab9f91955810c4b24","systems":["Linux"]},{"id":"ce377e0e41896765f7928b6a945b3c409917602b32f9e75448efde1d04beaeda","systems":["Windows"]},{"id":"cec906d3c19818ff4ab073ff2bb73afacabfe7f865a88b15b198a41b267dd529","systems":["Windows"]},{"id":"cfa1f53309fbd6b703cda60899a9fb4d47b8fbd523b0b2efc981f6cadbd73c7d","systems":["Windows"]},{"id":"cfca66513cb81705c4b6a6d763e97cf8a643135d00d4b8568a790c903178ecc8","systems":["Windows"]},{"id":"d121c163a6020c359d774fe38e8113386b6f82537c2833d1a30b8418605abc0f","systems":["Windows"]},{"id":"d1d0108581fd66aa00ee14c853ed0bfeff0b5d71d6eaac8ad476011dd4c511f7","systems":["Windows"]},{"id":"d25108d339cda5d9349705911f66aa52ee370433cf9059a3ef404c7a76a7a793","systems":["Android"]},{"id":"d562e05c05e4b3a49efe96ec0bbcb8c07ad4f8f60cf0314c05df4ada206e3d55","systems":["Windows"]},{"id":"d6075c8cb298daf84b6468525a6ab8b58ed5e7817f9a2909e743ad8e459175bd","systems":["Mac"]},{"id":"d662d68353715d5f0745e25857e3e62e4537336a110798d15840cefd3f46d7a5","systems":["Android"]},{"id":"d73dd738ceb4b116072f2adc11e1148f2ce01da372ce9bb229fc2f63940521f6","systems":["Windows"]},{"id":"d85187b39ca4644f4b8b4ac1ce74faea86ee408137e812f6a6087136385cb100","systems":["Android"]},{"id":"d85187b39ca4644f4b8b4ac1ce74faea86ee408137e812f6a6087136385cb1d1","systems":["Android"]},{"id":"d85187b39ca4644f4b8b4ac1ce74faea86ee408137e812f6a6087136385cb1d3","systems":["Android"]},{"id":"d8a77fe83bfad1b6994601b6a900256f908e1bb559e2e575747c6aa23042075b","systems":["Android"]},{"id":"da4c847f3b9ac97f93361d7186ef33b1aac6587e48ce5c745cb49745d165f443","systems":["Windows"]},{"id":"db0a495b4c6d5804293098af66493d0a6f8a1b726ec94a598bbee7a0cf3edf73","systems":["Mac"]},{"id":"db136ed694f932d63d9c3738be46642efc71fac47a37364f6f950ee03fe63de6","systems":["Android"]},{"id":"db73bc32c78f0860cc257e1b2fa2111926494073794d89f89c31e6e9de0c4550","systems":["Windows"]},{"id":"db8a5078d244fd32bd2e166dff1327c4f01a679d2b13b3f4e7b796d91997cc9f","systems":["Android"]},{"id":"dbb529ea7beccdd7b1e75204637712d4d623c7f3d4d10d2cc86b64fa7ad0fa3a","systems":["Windows"]},{"id":"dbb5895f857f0f660527d491eb17261d3bce8a57ab9b4c4800f8904e0fefe3c7","systems":["Windows"]},{"id":"dc46fe8da7e23cdfa740d053e5a06e8ee3e49e47c3c848f873ae9fa2c7a0c7bb","systems":["Windows"]},{"id":"dc95e40ebd4627ea9a603790b2f5c9432b39f4d89d9c433891dca72027f432ea","systems":["Windows"]},{"id":"dcf17fd95eabbf64797e666a323add074e50a8bd9e794218e2eaf7ecd6070333","systems":["Windows"]},{"id":"dd5ec54aa6acf033b245919c7f47609bcaa17a313a0696b0ce667cbae190fe0c","systems":["Windows"]},{"id":"de2f81009a1ef68162db125d11e826173fcd908bbc8511555fe1dcb75f6d4bc6","systems":["Windows"]},{"id":"ded4f053a6657f40a7c8fcdf1ffcba8e73e87b464f4349420d2852d4c568b69c","systems":["Windows"]},{"id":"e472023ebe06339e0f28c6428f955acbe51951c40bdf5fcc3a0dc1f04a4b3d9e","systems":["Windows"]},{"id":"e5282f95d9e08a1e633970374ceab705506d9a890aab5f778cb78478b3dc9f64","systems":["Mac"]},{"id":"e5ebf075ac3f099766250dcdb12000da25e4775d999cc3e4bcbde6d773321793","systems":["Android"]},{"id":"e65b5559e38592fda4f30457cafef087771f48bfff4325ac86462582adbfb6d9","systems":["Linux"]},{"id":"e6c85278457f42f853dbc638fb274686e44418bd8ff0cde91434a5429f28af9c","systems":["Windows"]},{"id":"e7e48bb66b8c5bc3ad6b98b3ae543451548ef7d27c61a06994a29a922885824d","systems":["Linux"]},{"id":"e85127b39ca4655f1b8b4ac1ce74faea86ad468237e81006a6087136385cb1d2","systems":["Android"]},{"id":"e85187b39ca4644f4b8b4ac1ce74faea86ee408137e812f6a6087136385cb1d2","systems":["Android"]},{"id":"e85e71f1d187d8f56ad058aecd8ce2134476ec1bbbe6720dbb0c7a2b85f7ce56","systems":["Windows"]},{"id":"e88c8b6a6e78cac750472299b4d69ffb62c240068fd8a1878b7d503d3a1db23e","systems":["Linux"]},{"id":"eb616bb36438cb1a96ccce32f244f6c51ae671d93d8d62f800183034050a20a1","systems":["Windows"]},{"id":"ec8b0ca4da6a752bc66034c35927d29c7b74b7600a1cf4b448d5976d1c1a61da","systems":["Windows"]},{"id":"eda5bb7828475aa518888208123ad13dc17cb09ce7e9d86a678309263671b99c","systems":["Windows"]},{"id":"ee97ad6dbc3b2718c807a8292034fc7c5c983eb9ef201df7c1dd423a535aa041","systems":["Windows"]},{"id":"efee17f367a267a363ef75604418b74baf1e24912f168d81b3afbe372666baf4","systems":["Windows"]},{"id":"f0c60bbdc21def77af3fc7bca75370ddb4810670535cc8bdc7af24c9ff9fcd11","systems":["Windows"]},{"id":"f183864ad13e5c0872981f477d21d26f904f1368e665f1328b88df9acd7874a2","systems":["Windows"]},{"id":"f285bc261dcdfc95c2109d22b5c8948e4aa53f1c34dc29cf98e2fdb815dad043","systems":["Windows"]},{"id":"f331a85a0fb7c54c515bd2df67b5321c2e513a2e5fcfaacad3c793adb8d1bd19","systems":["Android"]},{"id":"f37927a41d3ca415b123a3dd6dc8944f24219e0829d9b23c9ab8c961d97ef189","systems":["Windows"]},{"id":"f49715355bb6632f1a0eca1bb35873b0f2d4ed355cb3f689b3976c81874a8499","systems":["Windows"]},{"id":"f6fb0cf8ac83520e52061c0315100a81bbdcf62d4c9dc3fae4e8a516463e3e90","systems":["Windows"]},{"id":"f70c5b58b7a0fa7a0c0700de04fbafb034b6944f58402b0e4de0c3dbc16d45c4","systems":["Windows"]},{"id":"f818aebcf4e3616ef8e2a92cfdc719cae71c7764f6cf2e1db1aa4caf5851a3ef","systems":["Mac","Windows"]},{"id":"f94f35fef341f1a698c984008debb1ba0f71af4a4001b02d7b7667729724c570","systems":["Android"]},{"id":"fb15b152c37ce78a032a6bdadd121cc0137831781f50a016a1e7f5753cedef94","systems":["Windows"]},{"id":"fe75c6ff65062b64f9131aa00420644ad818039ffd62948cc639a217532852a7","systems":["Windows"]}],"Firefox 90":[{"id":"01236f7fa8e8a69c47415cba7804ece0f682f426faabbb4dc29990302bd83cd3","systems":["Windows"]},{"id":"020f3fd11ac3057ab3f69e1c1b9c719efda214029e4c28f6c3a0907ef06cf2d5","systems":["Linux"]},{"id":"11883b38d0ce77bb9b061b0c3b65656e03e2ac729c66c1de0c90ce12c1ed5c64","systems":["Windows"]},{"id":"15e3ac586a78a4371829280bafd83e15b7b04d5daf098e6d9bab7f8738951f50","systems":["Windows"]},{"id":"15edc28164c8b8555f47d5d9bf523c99252d2bf83d5f8d46c0eda9558e343b0b","systems":["Linux"]},{"id":"171a228ca15fb62c724371e9a848e4a4bfb563cb8a9871430fe17c8a9d69d2e4","systems":["Windows"]},{"id":"272ea00ba7041e5217fb936630fcac530f891b79f2e99476d66785a9afb5d490","systems":["Windows"]},{"id":"2d2d562bc8489b8bc5a8dd902a6a5df6b3e70f96d1f97cdb28927efca33e1b69","systems":["Windows"]},{"id":"2e56c8ea281ed6beed0e081aea305d985a914b9d174e89dbceaa70d6de13742d","systems":["Linux"]},{"id":"3982356988cc39d84d6818885b92fb34bfd993983b743ccbc5f16b1b67c3e837","systems":["Windows"]},{"id":"3bdc9a47e302f838030950f93c3ac2224bdceda3b4d0fc3b5493c9cbc66013cf","systems":["Windows"]},{"id":"499ddb1fcc0cfb340a49f77f95424b660b71c7d36e60b746992fe826de1c51f0","systems":["Linux"]},{"id":"5ad4a5ba9dbff15ef55628c3a3d496fc2a87d2ef5b3bf216ebe16a874234dc46","systems":["Mac"]},{"id":"5ce684b018513dde08c723736735108d883a0bbfba19e942069ab54e1674f8c3","systems":["Windows"]},{"id":"64200ad4640b715d46f32683c195e85dd57d5da640dca28c7b05a18a4eca8162","systems":["Windows"]},{"id":"6a62393de9e381b358b366f7991704185164f00cbadd0ced738c8bfa53df7b75","systems":["Linux"]},{"id":"71a817c2a478097a77c9428c7ee0a5f31763d4cf6c4c7c6312d101466adcc68c","systems":["Linux"]},{"id":"724303277ff1928ae5ed1b9e498109c0a8bb01d30e17b208eafda42ba6b82be9","systems":["Linux"]},{"id":"726524d3a02c96ea4295f65082642ad576722ab6be7a6f7f3ec3544d32d6419f","systems":["Linux"]},{"id":"763889a685abd97dee988d7060925671c1d43170d7d1a1417e17cb58d2908834","systems":["Mac"]},{"id":"7b75770cc9e1e22c28dd2b7063518850f0e8cdaffe4f23007d57d84be2af2005","systems":["Windows"]},{"id":"7e96d53dd9f6937c431606ba1e94299eb37f5f60d717f6a032cb4d0dbc031751","systems":["Mac"]},{"id":"8c3dbda07c7ce2685e2146ad71242ca6ed9b0422e55c5b06f8b3d80c7ac538a3","systems":["Windows"]},{"id":"9b01cabc05c9d02538127961fc50a9ff7a39c87186062663e8628cd00ebcd03c","systems":["Linux"]},{"id":"9c512543c25a761f58e1a1a4fbb3aaf25685a85a577ac90cdfc3ff87723cfa70","systems":["Windows"]},{"id":"c9008b3ed2fd6fd02fad7a4e54a73763c4e7a98254af3616b6bd895532c6e3b6","systems":["Linux"]},{"id":"d3d8548822eac1e22fba9aadf190ce2c57fe4c65215fc2b9df9fb0f794b2b6de","systems":["Linux"]},{"id":"dbd74e10f703f7f10a240b24f30d610bd951cbab9cc29e7835f035685271ed92","systems":["Windows"]},{"id":"dcef7c42a6d9966e3dddb7b0ed482ef90efa3b7e7b4f89fd796621af9d119182","systems":["Windows"]},{"id":"e2a7d208f76d673515e4a4b9c548b2bf1e57cfbcae9780b9b67c4dfc7870fe2f","systems":["Windows"]},{"id":"e6e844a4d2b7d7a83b608a72300aa706702dcba6b3c518cddef268a5baba2bf2","systems":["Windows"]},{"id":"edbbff017b8c962528b7e2ee07ba7a1f9e993091c470fa964f00329bb4ba7487","systems":["Windows"]},{"id":"f8e7dd789ac8e14556d58a90fedf69b5f228909703097ffefe63725d988d9b12","systems":["Windows"]},{"id":"f9c7ad8a1a9db4d89dd12f94459edc61859020f07b54d00ef2e758974f7f1835","systems":["Windows"]}],"Chrome 88":[{"id":"0137c5fbff4b0bc0ba40f265c5a86d2933bb4d95c3b7580d56c1494c1af6c7b1","systems":["Android"]},{"id":"01a73d309ecfecff956d74a0fd658fb1474ba545057c1d0e13f38814d0dc5a3a","systems":["Android"]},{"id":"02b371bccf9b23cd8f39577fdcb29fd2bd932ac686c9f8aab9d9d77a7f356c87","systems":["Mac"]},{"id":"06608659104c13f972dd41cff41d8133633118fc7ad93405c1e35c55fa3c18bd","systems":["Linux"]},{"id":"06aada3d7908343c22aa22d2599f206cac2dcd3e68dee2dffbcb60399330480f","systems":["Android"]},{"id":"0949eaeb4c618ffc3642f03f9d759305b9f5d8f9e2b0e3f38b0cdda05cfe5d03","systems":["Windows"]},{"id":"0a4eb5fb70550c66f40203dfe05c5661929349eb6284eba5be3c389529c06401","systems":["Windows"]},{"id":"0cb3b0e37841df77cc0d4050ff28eba0b163e3e071751249fdf640cc9482bdd4","systems":["Android"]},{"id":"0e60384566d9edad6d5268b27485c53838c0986194888e89e13c1cb70447bd30","systems":["Windows"]},{"id":"0e9f6f104fe04344062f0573bc126b2600476be69e064c8b00b15169b5236609","systems":["Android"]},{"id":"1227f8f1f8f640e7ef1ae792d0868ae5746cc6380c6d7467d93bceb176426b7d","systems":["Android"]},{"id":"12e90a400396f46b35406204948afbb5e0b0ee4f7e576844298ed240a5c1e4b0","systems":["Windows"]},{"id":"134def69874f323d1b816e10917a904c4feb145e21f0b3b0c7dddffbe844efda","systems":["Linux"]},{"id":"1400802bb860f9d3f87ee108d0c96c4b590cb4661ce9250a93f72d6e9da69675","systems":["Android"]},{"id":"148ebd0ec67aecb75bdcee5b863393c4bc1d665a9570ee83d386294d731947bb","systems":["Windows"]},{"id":"150524fe102780aa93a90c5e451df9c89f1f561559b6a9944c9db28ae309153d","systems":["Windows"]},{"id":"15a68203fae7ac2afbaa5785dc221729ad8845acca2f4344d70d1badd21637ba","systems":["Linux"]},{"id":"15ed0e37a745aa80cedd3ad700812cf17b9a93a60e1c596c7e3cb9ffe1e96967","systems":["Android"]},{"id":"167a7b20a4a6944b4998ef42a84a9d387e34adf29c9a60615c66cf1dbf5c5e76","systems":["Android"]},{"id":"16819bf25de6568fb8fcdcc0385b0e2c7eec2e50b22853e05c549a79543bed35","systems":["Mac"]},{"id":"184df6dfe08f7f33e2c97b4f8e7e4a4de8f356a32e60b400afe18905985873cc","systems":["Mac"]},{"id":"1c6c54904b5d42f4bc82b83fdbf6f8b019e8405ec835782c15d12b60158d7865","systems":["Android"]},{"id":"20420d00d6787f09321a67fff48982f4f877dbbe5bbe0a1be77e3b149bf4285f","systems":["Linux","Windows"]},{"id":"2302349aba68ff5e0d1738b3b20829709662404fe2310da07dbc654d7a9a40aa","systems":["Mac","Windows"]},{"id":"2321b630b4a9ef3d64c1467d41055837a78f1bb6356e1b92e39c02ac6a2feee6","systems":["Windows"]},{"id":"24a418ce5f8b49c7db0488764d7fce5085af178133a795589b2e638135299444","systems":["Windows"]},{"id":"24d66b9d388e54e1087b901453efeb4f113d60b13f7600273bd0471276c5729b","systems":["Mac"]},{"id":"2665d09e05ff92ba2b8fed1a7091ce848ba34b4faa3024d31a68d3c02853272d","systems":["Windows"]},{"id":"281a15473672f091dfa76c42f5c262caeff7a7656ab4e808474269afc0f0b272","systems":["Mac"]},{"id":"288bee087071b83f47adaff68bf97e266706a027d0556277ffa9ed6374d0d2eb","systems":["Android"]},{"id":"28cfe93b7b6b00fac94f7da5ca50a96a5e383d742c4e59a17c05a06cf87ccfe2","systems":["Windows"]},{"id":"29d29419168d7d6bcc7f6cd7e641f6e86249c6f59fd92c1a87d3e8d48480b97d","systems":["Android"]},{"id":"2b75729c5cc23bcf19c34fbfaf8e2318784dc23b934ac185aebc6f88ac209b41","systems":["Windows"]},{"id":"2b77fe7f08a1236ed287460971ea7a8a874f55de7f992d1d9de4aca05d345fc4","systems":["Android"]},{"id":"2bc78c08fe998d8e91bee43b7327045806af9753ba0702a6df767423baecc4e8","systems":["Android"]},{"id":"2bda3cab58b16a7668298d610fde3a829e68a91491eb805b3699e59a34249b86","systems":["Linux","Windows"]},{"id":"2da8aa771b1f765f2f857b4b8db71cb2cab50fcc8a5d1a898b0a15a1731dbaba","systems":["Android"]},{"id":"2f083b334347d62490140ca2964785dea99ebdccf7974aca9409ea5469eeb4ff","systems":["Android"]},{"id":"30608ca14a6fb6fbce73f21030f1af4deb2cd6a5f52be8218cc0d6687e925957","systems":["Windows"]},{"id":"31e98eb4fdecc80e9d1d0d570e78b44135236a33ef38b3c84e94a03fa5e96b5e","systems":["Windows"]},{"id":"3241fc338e95fa105399b7269e075c9a34f0357ce141ce425d4813b01cd33b38","systems":["Linux","Windows"]},{"id":"325b002eaf9e1e32a51541b43c9e7b026d4b657261c8449cd4e2b1f9559952bc","systems":["Windows"]},{"id":"34368e2267785d8ba4fc0b027abcebfdf736153d3bc8b2dc505095d43516cb5a","systems":["Windows"]},{"id":"348f5e4a3532fdfd32e606219677fa478e37e4dfc92bde68259a4cbf0486e0f9","systems":["Windows"]},{"id":"35ddbd693600bc6400347029eb14fc30ba573ee80d32305ad1c22005374935e2","systems":["Windows"]},{"id":"367dcd95b0e56a4ae6ffa42b37f73cef25b7353282ccf526d9bae427cbcdd631","systems":["Android"]},{"id":"36979ef998b53de3de7b98c2b20699272a2949ad12bbd2383361d2e2f9f3b6e4","systems":["Android"]},{"id":"36a1eeee4c4670f18b0318c79dd797638e2dbfee834654bbb5330507f8104de0","systems":["Mac","Windows"]},{"id":"36cffe072d35e44bea7182c3d3ca171e490ddcc370f3d769714ab0af609ab712","systems":["Android"]},{"id":"37020d3d740efaf0260286fe1b41b74b898bc625151c94e18aced365c9cf8aba","systems":["Linux","Windows"]},{"id":"38c2c9ae62d3882aa9e370c467faca3e7ac2b0957b6dbe8a98dddd7ac3400213","systems":["Windows"]},{"id":"3ba0efdd094d2e2c0dbad64eb84b55678f3b3443be0924c4a5816b31cb8a1cd5","systems":["Mac"]},{"id":"3c077a86b39ba8869a898ebd9cf40b357b85b63f1a89fc94978a9276bacaa8a0","systems":["Windows"]},{"id":"3d953854b28d7de9adfc71caff344bc394850b72786bc361414b5bf7b0c0d375","systems":["Android"]},{"id":"3d955efe9a64b9dcfa846a90043ccf09678757f873ae8c8fc13e2195e7332d2e","systems":["Windows"]},{"id":"3dc3d30eb6366d375a77f04a593bce32e1a161f6f4d3d795cd9b48cda8427bba","systems":["Windows"]},{"id":"3e7f14e74a9967d37606ab3801a9cefed0629db4b9d2b0b199f87f2ba0815a0d","systems":["Mac"]},{"id":"41019b41df9070c48aff8cb324d3fa13dd58c1ffc13a4cb44b16548deb6313be","systems":["Android"]},{"id":"45dce4ab8a0f8f249bb76fc9806b5baf47b2aae3e5cfc333ddd44466256d0555","systems":["Mac"]},{"id":"465514df1d3614d32c57fa2379b93a5bb6a19da763795deae343cf9ad613dddc","systems":["Android"]},{"id":"46b7ec0de24edc9f4633cbedd494ce98f4b16ab90fa514fc25801be32bfc9424","systems":["Android"]},{"id":"46de6ef65a454dfb2d18b1a2d941fffe2af2904e330288897e2ec7783172c0fc","systems":["Windows"]},{"id":"4950cb167a6e713b51df53a82ea5a01a2e832ece7553bb4d6de7dff5a9a32096","systems":["Android"]},{"id":"4aff8d7672050257121666df1c8be1c9de9d339b6bb8bb821889a7bd09435a55","systems":["Android"]},{"id":"4c14a81471e2cb9912279d62180b8edd54f968b25223b38d6a9db4ce7b2f4d16","systems":["Windows"]},{"id":"4e2c6aefe559b68d26d3fe0438023f62668efef71cb14bb08cf74dd0082a568d","systems":["Linux","Mac","Windows"]},{"id":"4e49e65535fb0a8585929d8bdb61166c2a07d4ad2b18e12940b1c15bca3dfcd8","systems":["Windows"]},{"id":"4f2081524b4938df90e885c6c48ddad24f96fbc24d8fa847f67241be89f26017","systems":["Windows"]},{"id":"4f410ab761ffe2ef833704c4d67dfa089bd7c1484f442e0f13bd34defca790b0","systems":["Windows"]},{"id":"50206dcedbd4b4cae8786e9861280e31e615e661de06e316b35caf9e6d6c2306","systems":["Windows"]},{"id":"503929e2680d3d5442ffca4d050518b3131e8b25c61de00db860376d9f5bb04e","systems":["Windows"]},{"id":"510b0c7171eecb25918640bd6a9514b63027873e8b2d784f7950c6c8232265b4","systems":["Windows"]},{"id":"512989111d69326e4936a9e779daa7e2931da90a9a24d591d4f7c6bb8f85f1a4","systems":["Android"]},{"id":"52760ba54c1a67065a732cde54f9be5df6812c0b473cc8014d8aca0e05d7a6ae","systems":["Android"]},{"id":"5284530fd515a6266819cbabf6168e3d5a1ce26ca50a95bf8cf153681e81c31a","systems":["Mac"]},{"id":"541f4090446ff3729f98e4e398d36c3254fda9728b8639f0404838d8748c3b17","systems":["Android"]},{"id":"55218d0c0ace1219da00ecc2707baa76303903ab5a0398f119de5ee34dc68dee","systems":["Windows"]},{"id":"56a65d24078be374fa0444363fd6030be9e4c9b76bb489bbac3c3d4d5059c236","systems":["Windows"]},{"id":"56d39e9abb62df19707cef56f2e4fc149cba0364e9f25ec5026a26e0a92c1eaa","systems":["Linux"]},{"id":"580ca5a05e82b20fbff2089e524ef306b962af61c50bd04f84179207ece6721b","systems":["Android"]},{"id":"58af697706d3f719464883f9e5588928ecbc155b33e658eb9ffa7bd7787295c0","systems":["Android"]},{"id":"59996dca22ee746c8fc1ce870c54476ba5c40fd994e4c498e0afdc418f11f01f","systems":["Windows"]},{"id":"5a9baa2bfce671a83064ba729a8a1dfed9797ad20945f8f8d439af4019a73fcb","systems":["Windows"]},{"id":"5c77b45d32ea6f206651267f8ad8543710148bd97295219b8452bed2db1331f4","systems":["Android"]},{"id":"5cd5b059e3d2bb6c84b898829b7c367fc58f6c41f3c1cd23ae8c90a4fcef261e","systems":["Linux"]},{"id":"5df5a7cb7115c5f23329f2ae316419fb3f8b93de6d1123f23384e362e89e8709","systems":["Android"]},{"id":"5e0be24c234f5046f880084d25a3429f32282f995ee48083a01d3cd303120a11","systems":["Mac"]},{"id":"5f1f42bdfb2d4941fe8a1df633a5be3794f37e13c95fefe5d5361f86561225b1","systems":["Android"]},{"id":"6047ede4ca8816d5c14e2d1129e04a95c0eab8becba329af2cedbfbf48070b45","systems":["Linux"]},{"id":"65cdf5deea30be0aa411da8a243cb7ba716e75c22ce9e450bab9267ec621a530","systems":["Android"]},{"id":"65d8ca63f66a654863f317edd06529778109c8d4aa318d420e138e4306294680","systems":["Windows"]},{"id":"66d1aa82f676ca28f266aacc86bb4f527c705a6743f494a6390acdb5e910638e","systems":["Windows"]},{"id":"67d904ad0e42e5bac1eae268d1f2b19dd9d7db0005a5215c94b56749a3ce6f56","systems":["Mac","Windows"]},{"id":"6914230edd1e8579ab1580aa5ecd99c4fa90e87c1b7a3263c4511d066160969e","systems":["Windows"]},{"id":"6914acc503a6b573221465357a729e508cd75dcc8a24e50e29c1812ec37754f2","systems":["Windows"]},{"id":"6a1aeffb575ecc3d879ac7beca829543e56f303e4301ad8e4be5e68bce7ce0fa","systems":["Mac"]},{"id":"6a2f31ba4dfc4283798b64c78bd00f68d2801946fdfdb0af779ce63b3c9342e3","systems":["Windows"]},{"id":"6a6a298e1c2190d837ff8ac086fa90bd9dae673365baca1a936f92f86a6a08d0","systems":["Windows"]},{"id":"6cfc6c33d6ca25d4af5c84844e2a3c77e9db5f7bf781966f942e57b2b76fa332","systems":["Mac"]},{"id":"6dcd0bfe2e41e4414e787acb37a0c6b2b98e87a45ba173a866623d731c69e6fa","systems":["Android"]},{"id":"6ecf5b52388d2c2f1f37142d1b1575b1bd156665f0db5e8ccab2714200f5f620","systems":["Android"]},{"id":"6fb9395ef86e68f0ff597dee7d00cc528ca64a0b08c67d514fd12ccd00b4a51e","systems":["Linux"]},{"id":"71d6d0235f0805abb3025e723abd63b8cc74abb53b0e7938f4abc218d6d20968","systems":["Windows"]},{"id":"72012884def56b82579b92c441f635265077a0a2a8ba6b6edfa275ef97f2bc82","systems":["Linux"]},{"id":"728db7eccfef86294bcbb69d176b77adf7542059e6258681fb5675dd1bf1c652","systems":["Mac"]},{"id":"72ad6470d00076ea82ea7d8d53033a26f26a52bd0f92594418aaecd198cb67e2","systems":["Windows"]},{"id":"72d092276fc0d763343ea153d6954816046b2cd9e6253eb549ab42e22e999ecf","systems":["Windows"]},{"id":"730d522a3448b1f7a2218c91de169d67329190c2ed2cda8717acba499a0c5e0c","systems":["Android"]},{"id":"73f21dd9bfc087bc29df76114fa7788aa490574761bfe5b73c2a1eb584cffa8f","systems":["Windows"]},{"id":"74a9d81f87dd96e923f082d24ac6206f7893fd199aba8a616ea4f5003c597377","systems":["Linux"]},{"id":"7506fc243f3d7141f2111e7db87e18f6e6f0f050f61caaf279496ac7025d9070","systems":["Windows"]},{"id":"767ce1cc478638bba09cab15afa57d73ca1f237bfaec6bb26cf51bcaac127e83","systems":["Mac","Windows"]},{"id":"77c8d92dec6a54c671163fc6cb14e2254f7c912f64983b63d64b652f1d3b8ee4","systems":["Windows"]},{"id":"7c655e4034110af02f6c391996805f9e18fbe50c8f1b90e5e5b591b751312c3b","systems":["Linux"]},{"id":"7c93db0d0f4ced09cd64b86e907daeb63f01c80e360fc0f4618ed0c737c902b1","systems":["Android"]},{"id":"7d106600d7d3ccbc8aca15f3c2948ac7712818385e53603b7013c60b133af954","systems":["Windows"]},{"id":"7d1b7a8de6884d03667000b6195610a7e50167725a6a9a661b34f608e7cbfc54","systems":["Mac"]},{"id":"7d8fb1b7898f1683d5f8bcb292052a018d4689833aebdf2d294db61008958569","systems":["Android"]},{"id":"8082e5251abfd6d031aa0ab9aee84604a69b3ccc38f38849874f803cb0a0f2fc","systems":["Linux"]},{"id":"8137c3dfe0952882dcac35a8fbdeccf0e7e6fe8e9481651cec06a8d6665a0ec4","systems":["Android"]},{"id":"814b9caebf3aa73be49bc17bacf9d2fa7e615ad796b2e2af588da428736477f8","systems":["Android"]},{"id":"81cc9fe57eb3dc53bf73e2039df0c46e9ae04f88e96801cfc359bfa5ee5f2eb7","systems":["Windows"]},{"id":"821bf065731479f5ea1248e5e1dd36486e3e2e22cf5b1f9c298ebd993d554e28","systems":["Mac"]},{"id":"825d32d802f7106d257d1fe90a9e54e98dc63161fe7477f9a9bc089d51db7cb7","systems":["Windows"]},{"id":"84acadbfec7915f27de4aa6eb4601949faedb1aa02304d796bc2401a40b769ce","systems":["Android"]},{"id":"856054d2d329c790a03394e32f744f1ac447d891ab47524bc91e2e0a5ddc9217","systems":["Windows"]},{"id":"86218191fb8c5a77fcceeb8b6a0d4aa39565ebe1ebef2da64ef7a4956a7386db","systems":["Windows"]},{"id":"8882939262bcc9cff4180246a6100c293adfc934ebcc54fd4d4f6b25d2bf88e7","systems":["Windows"]},{"id":"88a89d25ebf6f91110aefce8493985ed398c8f773ecc08f5ab9657c89a434870","systems":["Android"]},{"id":"893d26bbe5ed67a930da134f40ad2866a5b49e0395c1123821837efe0c5e4ab3","systems":["Mac"]},{"id":"89e98eb4ab93b43c2cdc2eb1feda65b35790a0a421dbac22ec337aa538c897c4","systems":["Windows"]},{"id":"8c7a4fdfb9cb15054a2fd30ae010712355432828338e80a21c0680cda47d3528","systems":["Mac"]},{"id":"8d2ac32196e254f1d6fdc904a646376f772649709def472ced3885bf100902f6","systems":["Android"]},{"id":"90ac9f19858919d8facb100dddf36f330e2f270a101beab1d7b92c4978742bfa","systems":["Android"]},{"id":"92531e88a0c8878da74b6a828289db925cec2ee3dcb39c830a4e6c2adb7d2e1e","systems":["Mac"]},{"id":"9376e646e3811bce68c88ab2d593ffe15ed7323674c27774b2ad7e04b5ad4e3f","systems":["Android"]},{"id":"9409c7c594c2b644e6fc5d631750bb314b764ce4f9a6c1e770be1b3aed6051f9","systems":["Android"]},{"id":"952ef0c29ec272dbd2080ca008a5a854c63ae1fb46a6936b2995525e66c4c10b","systems":["Windows"]},{"id":"9624f1039bfe41b4217a488bc9f8937ca994d17673f646d4fb1cb21ab3b2c18b","systems":["Android"]},{"id":"96deb02edd7c49737baf63a9e358830c9027cc90fdeab8863b185349f0f2a811","systems":["Windows"]},{"id":"982930e5f761e105c079152fe3d5baf00e7647e1c6406799e2652e99faed1ae1","systems":["Android"]},{"id":"98528b489da1bc572d3ec321ba0cbcf4c9278d75d69f9b89e1648fb8bc62b981","systems":["Linux"]},{"id":"98657fac68993c4b87d28665662e2e847fed58c0735fe466c34c030232b4ffee","systems":["Android"]},{"id":"98cde37f7a0e00fff31294ce2df083c2f79fbd0c1cb111885d89a3f5e7c241cc","systems":["Mac"]},{"id":"9b5614c47f89dbef36fb6eaa6a22e3f4b3a90a62dfd254ed0796319f251c96f4","systems":["Mac"]},{"id":"9bbdcda37ef986cc4dc62994d03bb88967026f99dad405568516f5dcd136bbae","systems":["Android"]},{"id":"9c5c4bd30db652c63e045c6914c1519ec9f6c4ba57a4a31e7d6db6a1b9f274ec","systems":["Windows"]},{"id":"9c5fb5d3327624e5d5db735d7c391f2aae377b266a8112f9633d65852149d672","systems":["Windows"]},{"id":"9cb58e7a2380e179261fa685741e95072cd333a9bdb5147876ade429b6c515f6","systems":["Windows"]},{"id":"9d1348d284f1ca95b566ccf29fa1bd2b8462a3f8c28ff5a4a82dc53f59755e20","systems":["Android"]},{"id":"9f7b3bdadaa7a904dd3cab31693f33413812e3e0c7ea69c2f0ec00b7aa30807e","systems":["Windows"]},{"id":"a0a07abdcff642c370f78e6646ac0f0664ffc8de534164551cb710b000a38baf","systems":["Windows"]},{"id":"a1b43ed13ebc92ac1905a81382638b1c8ac1eb2e612dc9b10ecf8aa4849e6048","systems":["Android"]},{"id":"a36141aaaec2b1080c9edf7f8cb351874d79d1d43e64786b4a80d8f95f757655","systems":["Windows"]},{"id":"a3d533576af2b48a315eec60250e9bb7330f3c6d40aae5a8fa34990030578b25","systems":["Linux","Windows"]},{"id":"a496efa19b8384a4c1e8652ae148f47327bdf3d5d43b30b66c994bdd84879ef9","systems":["Android"]},{"id":"a4d7dec93e350870ba60ab862cd13e5a2a70192b9f12317fc7e9bde9e245c0b6","systems":["Windows"]},{"id":"a4e08c210dcbe571730d9ff00a9a2266b00479f9aa80f5af9a6ccd2579ef7c09","systems":["Windows"]},{"id":"a507c514183c7edcadb387db04f1c879775548b24c71f3ca8b99e30f9f0b6667","systems":["Android"]},{"id":"a6bf022e174b0d22079c7cab6b10ee54ecda44f39b496fb327c49af884bf47bd","systems":["Windows"]},{"id":"a74c6f218ed6fdecc120dc4764891958c0e0dc2f23c839a0803d6571a31cfe41","systems":["Windows"]},{"id":"a8f47e2ab7a32c1f9a91a9618c126cfe714bca27924a8e6464d4929fa690c537","systems":["Mac"]},{"id":"aa7b0fa4e896c276fa35a6c262c19e59c66b5a925a143e228a18c46a47feeeb4","systems":["Windows"]},{"id":"ab709dffbd89dbee5ea28154baaabe7121e3c41837b8aa3b525c7be6900a579d","systems":["Linux"]},{"id":"ad766617e5bb2506e11301fac180619838c3070a029c299270c3a45395bf62b7","systems":["Android"]},{"id":"b2527555025fc845a89b2fe53c29ae5d7f51325e110ba3700a7e8dc7616b307e","systems":["Windows"]},{"id":"b2e3113b098c22feec8fb84db4373f496da713772d7e32b78d44a23c890eb854","systems":["Android"]},{"id":"b43f85dabdd11783351d374b5ed2a71168500586025cc1ef9f8cb58cf887bd1f","systems":["Windows"]},{"id":"b4e180b6ac3199268e9aaa8306773d1facd62e36af8a58c4d9413862dc99d299","systems":["Windows"]},{"id":"b5357053639af1219a4ad8f44056939c5d5be85551bf1c89ffa6b5cda2acf1d9","systems":["Android"]},{"id":"b5cace58c01934582bfd44e06949ff5d702c9dc3b239b2515100b2738b450b28","systems":["Windows"]},{"id":"b6283dca4c41be9f3a900e493629009f0c9eecef4c9cb4baca1ec0ed8b37c0ed","systems":["Mac","Windows"]},{"id":"b7be71fa5aec759ea9b62c4769696d8fb058255ecba04fc57871006541120158","systems":["Windows"]},{"id":"b7f743161fd975f4b39573e2a6e92d2abb610aaf65c3b353da0cff583cf70ad6","systems":["Linux","Mac","Windows"]},{"id":"b824ebeace5bb2283f32dfd7279d4baf298a439d02024d81a7cc0f6d5728f993","systems":["Windows"]},{"id":"b8f81f18472800b6c75028c1b88d1973f101dd6fffc6323bbf722d4ab06018c1","systems":["Linux"]},{"id":"ba18f607249d5e9d3abcf894efbe3e51bb4926f6aa3502cfb8340b0b5440f18d","systems":["Android"]},{"id":"bf2b2b06afa2e5cae1171bbc08fef721c78bf72bd3ae85b50d0e0ba4cea19759","systems":["Android"]},{"id":"bff6907aebbed998d5a9d896652229e45b1b07833e0a85bb208f14bffbd60637","systems":["Android"]},{"id":"c11da2d400e71a0c30de8cbce48d30ff9d0045face146f4f823c478f552edf6b","systems":["Windows"]},{"id":"c166b0226fb21dc580ae5d96fdb177878dbe26b1c3398079f4a6ddb360d6ecf1","systems":["Linux"]},{"id":"c198d9a27c336324510204605c1a96a60cced9b155f293f08bcd10311eca2323","systems":["Android"]},{"id":"c20851d232b99e9a453c3ce858b99a93f25ea9a652ac13155838fdfe87773b63","systems":["Windows"]},{"id":"c2808cd10d088f035849302544e1e2a2d9651d107dd5b7f8a1b0fb06f5d26d37","systems":["Windows"]},{"id":"c28857082c3d4c77364d3e559d89760b91d1d7f3e707cec85e3f7d4958cae34c","systems":["Linux","Windows"]},{"id":"c548102913c6a94c423be7d2d9a33c1a808d5cea5930f47813015ad7ec65c256","systems":["Windows"]},{"id":"c55b375b6ddb9e2665a5661df89c2a7e8446590a9a3599f5c15d31b47dd0111a","systems":["Android"]},{"id":"c566dd640418850092b70a26f00abdaaa997066e43912f1abc02cbe665778ffa","systems":["Android"]},{"id":"c71edf1cea89946d9a2cd81c69d33ce194862070ef0c140ba4b126a899cb0df9","systems":["Linux"]},{"id":"c7c54bd2dce853b4fa4198c0839d7d31f78635706474770e0491bccc2f8ed45a","systems":["Mac"]},{"id":"c7eb929293354755bede193cf645a8292663446f75d5c40a6ddf926167c340f9","systems":["Windows"]},{"id":"c86f09831afd17cb6b6307570f31e0378c34545125c6fe657adbc93124e31a9b","systems":["Linux"]},{"id":"c8c9f9885721f5b6995f93dbc02b2a1b19a1b48034ed6f1c3c20bf9ca58ece10","systems":["Windows"]},{"id":"cb30c4f592b02131e379df2224bf2bd40209c749bd019ec6f5c024865e1b9cf1","systems":["Windows"]},{"id":"cbe0e62c05ec08ce00a187d49fb7c44f7b9bd9c5694a5dde24c6be242035f1ca","systems":["Android"]},{"id":"cc488f2b2c758be508ac34972c7103f7e8ba569f222684f1b36eddf95f8e6e61","systems":["Android"]},{"id":"cde1cc4fada0e130592c5ff2eed0ca4fa4bad5374aaa572d77b32b59e0a74679","systems":["Mac"]},{"id":"cef896432cfcca82c4ea3f91ba952f1f862178b35ef85bbc73c795a75ad6fb21","systems":["Android"]},{"id":"d19805c6a80881dc8219e405f3269482ffdb208cfc8a53e6a206786c242ce343","systems":["Linux","Mac","Windows"]},{"id":"d212f5b97f2fb963c93935e51779dc76bbc6c5315cab7ff86d84bb0481aea2bb","systems":["Android"]},{"id":"d6ee967ce97b80dbaccc4c020be5f9d890f432c6b47be25bd14178b3b89f14de","systems":["Windows"]},{"id":"d73a78c37aafe92c717ffca58b3b70735f9031b8d9326303e3fcef13fe7c991a","systems":["Windows"]},{"id":"d9d81451823b74527c75f8160790b43522711bd9645db8085ca7fac067fd5c5b","systems":["Android"]},{"id":"dad1a4fac5c9fdb57be77961ed1f71456236e5d52e31114c5d72fdea9eddd9aa","systems":["Windows"]},{"id":"db6dcff3b3b3da74bcb425d82b67d05369ee856fccfd74c69153de2777828ce1","systems":["Mac","Windows"]},{"id":"dd0ea2e058bbec7fbbbb6adb7d528152ebdd8b5c7df1b8da1e7e85502af11772","systems":["Android"]},{"id":"de4543a6df59686319878beffb34e82e759c30dcf9d35f30c499c023d12ac0cc","systems":["Mac"]},{"id":"e0b9e8ad87a90f2d95601b5ba73fefe0a1b39cc2579f42fb9b3e3f08b1968788","systems":["Windows"]},{"id":"e1b7b83e6552825a48195aef086f0ab28930ed58f9323d2121cee00703a0eca2","systems":["Linux","Mac","Windows"]},{"id":"e3dc779e1b0b75db73c0d0036ff6d1c878ac96fd78ab6ef1d14c123e26bceb9e","systems":["Android"]},{"id":"e451cc1c300554f9ba97ec04cd03ddf8be52c507dfca96a4b290784e4580dfb0","systems":["Windows"]},{"id":"e5047941fe8be09ee274b8b12a65e6efd92bab3136291140d02e3f2ba0c590ba","systems":["Linux"]},{"id":"e5bcf2ea10e5e9a8b400135390ba1cd91104b16f5a3d6b88a13c4da7991ee00e","systems":["Windows"]},{"id":"e60808ccd1801e5c5090fb48655ebc6a35869947515f55bb4c4514c9c6a6803d","systems":["Windows"]},{"id":"e72db50662f8220bbbee3d938b5df6c164d6d09964401022f5d564a176eb444c","systems":["Windows"]},{"id":"eb12a5f00a1614ed99b4df6aed33ebfe43cef7ecb91673caa026a61ba8147b47","systems":["Linux"]},{"id":"eb4a221673de218980c688810bb70154ff8e24dbe88bcb86afb6d74341836edb","systems":["Android"]},{"id":"ee0480699ed39f356388c739a49c4604562f4e19004d819ce6a09f81e2dae930","systems":["Windows"]},{"id":"f318d964fbed6ac4a29e93b74a07042190669204e484083cb7218cd6e9f72939","systems":["Android"]},{"id":"f3f96acca2a04535f53cf108176065ce3da210aeed4a4b4ef25f8fa5b1320675","systems":["Windows"]},{"id":"f89bbb1bad25d157b406fa8dee8c06263e307f70e3e6421d7ad8c951d72d6069","systems":["Windows"]},{"id":"f969bc5f4bd7f8624aa6ddee0d6ca1fe40adb19f3d0f0b3dfe6d6331c7ba08eb","systems":["Windows"]},{"id":"f9f0df99a7b1757cd5cc199e383e846c6e04c58ec637568b3fefa984d0eb2284","systems":["Windows"]},{"id":"f9f5450c471fb028b52869420210ab3ae52051889064c1db69009f25eb82560a","systems":["Android"]},{"id":"fe0fd2ff5d4a9a8dfc478e68de5776c04ff052ffa98666eee8fc479eda16c4bd","systems":["Windows"]}],"Chrome 91":[{"id":"0143d3ca7987e3db46f5ddf58c8c4143222eed291a26a069eda59fd3b1d6d2da","systems":["Mac"]},{"id":"028564042dd26a0d23bd4ce2aa4bc19ccb7a05bef0a128b170c7874c1483f9fa","systems":["Linux","Windows"]},{"id":"038dc8e9690c83cae30247e391eec6660309310963e590e8d10874f961885f87","systems":["Android"]},{"id":"03cb711a3822ffe1c5e88affe1143195cf90f11a64e8dcef9d9212e6eb252f1e","systems":["Mac"]},{"id":"04f642d7273b9f4990fc684222ac8d35c33cac959b455e03005617c969016a02","systems":["Windows"]},{"id":"0540e866e42e0e37d40ada61c6ab7d07a11c4708196728310ee99332ca40e46f","systems":["Linux"]},{"id":"05f2d5d12139b09321457e6982207f35c8e08141cef831c764a1020b693eb289","systems":["Mac"]},{"id":"06998b7b2ea19fefaff49a72e2c64d03b3db66372fd975dc0ca0c24721beb4de","systems":["Windows"]},{"id":"07dbffe6977aa20654bedfa8f0608c717d122fd21c28b2cdd65e44584ce1300f","systems":["Windows"]},{"id":"0874dff0885587e19a546f77e0a0a8d53aaafce5e53996a65ddd12915e56d2e6","systems":["Mac"]},{"id":"0918338f92834822e2f857d4c4feac5e4c7d5ba129a18ba7001f39f08c737e5e","systems":["Mac"]},{"id":"095b4b1fdf0f0df79489f3908454a9c82f346a95d596ee64be850a30b94d4d4f","systems":["Linux"]},{"id":"0c6c265e4bfa13a57be9bb3d6aa17b6290631f71ab61929b2811c83ab0cb3841","systems":["Windows"]},{"id":"0cb033eaa25030bc3427e6988ebe66dcc0040259c8212e0188f920f7d1a0f8bb","systems":["Linux"]},{"id":"0cdcb0b083b7c014096854eb19f804fc219bd910d6aad66e88c1b247bbcd23d9","systems":["Mac"]},{"id":"0d25aeffa29348e24056c42c0b22c7fa841b29f8131ca15062d89d1295387de3","systems":["Linux"]},{"id":"0dc29f31e8a7275dd15bf0f786e34967160bf7f0ab035fedc48e74a14bbbf43a","systems":["Linux"]},{"id":"0fcafc5cd4ce750c995db48a3ffcea143150367e0f5a88fc6fedc69a37125a7b","systems":["Mac"]},{"id":"111878010602631a7560affb3ab24250d5a3927b122b6be6f6755e8c102d3118","systems":["Windows"]},{"id":"142a8e985a6f90c6ffc487d655eebbfc1ff0948318abc2d3bbaf67589efb2578","systems":["Windows"]},{"id":"16effa583fff60c0935a129e2ca864d726791625616905e8f9a24c2938d5ce32","systems":["Mac"]},{"id":"181c450bfd58603a12da5d15ee4c90c0d7e3da861870046c6e1081e392f61c1c","systems":["Linux"]},{"id":"189418875c0a3fd0699f6e01e9d0abe86061de55894f4df2e42dc2b1201ed5ba","systems":["Windows"]},{"id":"194a738249de22e6c17ec3d5d60f626d526b843487e8b2d7fd1eed40e0a68076","systems":["Linux","Windows"]},{"id":"1c7d0fe8da2c43fd71fd190ad8a57cc6b0274b729d14335248c359f92e446152","systems":["Windows"]},{"id":"1fed6e5433bca623098aac5a1241b3864ca63f7b025f922760ed1aea31a9d9f7","systems":["Mac"]},{"id":"20f49ea6caff31677f71f6141b8e1e0c3b6be201cf9898b4a08b9e86a034a358","systems":["Windows"]},{"id":"21c2f15f8450cac1bd509c73990d86c49a8c6a2b54204aeb94dca405c6cdb4ab","systems":["Mac"]},{"id":"2254a5c02ea9d3523be542794e5bd0933999abc790026b350565f3f5714462b6","systems":["Mac","Windows"]},{"id":"24ff12d5be9c639308bc8b0345af6adcbe87c5ddc1a99127dbedfdaa335fb02d","systems":["Android"]},{"id":"28457383c109bbd8bd2c23e8c5ca13c6f6b6896cc66f30ecb9931375f083d679","systems":["Android"]},{"id":"2b1ae3aebb4c7f7096b34235916c27fb185beed6640cd1cb2a0af24760fc1db4","systems":["Mac"]},{"id":"2c6447cdb1c1a66f13b37a13671987f31271ed0201bb07d90c4601795246214d","systems":["Windows"]},{"id":"2c81a7683c4e82ca71ca45c420f719d21f9fa6ad88bb987fe07484a205d45352","systems":["Linux"]},{"id":"2d8705b8739feb48fe29a5537b36b926b34bffc471d6e42bf88d21f94d25a850","systems":["Windows"]},{"id":"30816a262c28a3f723051a4ff479d4a0a4c02590664916d047a63c3935bd13e8","systems":["Windows"]},{"id":"315ced4809f69b84a56c2e8f87cdf26e85b1022033f4f0f48b13e2516c0b0107","systems":["Windows"]},{"id":"3245d9ba10b0b61e2e12b2da153f8599a19ded0ed031c5650b652007f6929460","systems":["Windows"]},{"id":"325a18abbf1ff60803f094e9e79da3ab6ab4144476a2d119586506b32ec3587b","systems":["Linux"]},{"id":"34e2e3b2f175589ca1700a1b273307cec0a7516f94730ef31f2f786803d2d632","systems":["Linux"]},{"id":"35a7fb8d4765b7d8cea0783fc627f3a2a881a468600e9898d5d3720a313da6fd","systems":["Windows"]},{"id":"3a66d62b01fb3b338488de6c9ae72a5472982fa75ae46f894f4b42a80ec2710b","systems":["Linux"]},{"id":"3bf80d33fab32d675ef74b04ea257f77f86bf3993bdaa1dd1c0dd11a2ba49ff8","systems":["Mac","Windows"]},{"id":"3e27cf93f49595d8b5369af93eb2142eea9379405a2255253d3730d72a9e8d0b","systems":["Linux","Mac"]},{"id":"41078e5d5ca6f996585a34d28c11de5d5ae7ddf1d9c88275e1ee14c7c9a9ed04","systems":["Windows"]},{"id":"42d15bff3f99cf46af522016fdae0c7d4be00224ef9ffc975ed14c428c67f7df","systems":["Linux","Windows"]},{"id":"49047f5ed8721726fcaec00afc81976b1087b89506da39876333d4a0b8a2fb39","systems":["Windows"]},{"id":"4ae6bf9820bf333ff655a869bc36cc29fe76c34e615a09d76d8a6bf645847476","systems":["Linux"]},{"id":"4b0d2fdac7f0c3ac4f756d4ae7fc7fc3ccd6ca6a08521dace0d833b1a0f5ac1e","systems":["Windows"]},{"id":"4de9bf07eb1defcbf1b41924b846a15dd5876e1bcfa2abd1654043e30215dbd5","systems":["Windows"]},{"id":"501ed64ef83219c08eaabb8f9c0b6ceac2e4f79c66032eecc297fcc53b3dec3a","systems":["Windows"]},{"id":"51bf17d9b17555b54ad6b69cf0edaa6639231b9eddc27e1f4b459c9c06b280c3","systems":["Windows"]},{"id":"530682bd84124960b48c4bb22fe8093e019337aaf9cb9f89abf18d2171f066aa","systems":["Windows"]},{"id":"557771d90754d0ad1becac662ce79c8557477bed76282e314f79cb6201cb9199","systems":["Android"]},{"id":"580622ab52d974698d51e20c331fdbfa7bf71551296d88da4e7d9a9879c9ceb5","systems":["Windows"]},{"id":"5a21438cf69242e6c023d463e3e1ae12cabc3d1d23b1a1420ec451829058ee59","systems":["Windows"]},{"id":"5a5ddd2edddff20818bd06e89afdcc4014c0cdb0068c21184ae28700ba86f806","systems":["Linux"]},{"id":"5adb788286795e1090370afb94d30ed645d185c4946df6a81c00b1f81d728ea0","systems":["Windows"]},{"id":"5af4e03a370f39ffdfa1fa19af260881bebca73afe0c1ed70dd7d82fdaa6ae18","systems":["Mac"]},{"id":"5ce179de3bff68f5633430888bc39196c86e34533fa6de6042d6dc7ad0c7f328","systems":["Mac"]},{"id":"5d08a14fbd26bd073347456f7878d6d3719c0fd2d9c1f5a3eddb343908bd5483","systems":["Windows"]},{"id":"5db8da4103faaf200017b7bbb7910173820c4ea288b60fdafba24d6d3f22bda2","systems":["Linux"]},{"id":"5f093b123eb939935480087a7c73b1b4c44c3246d3053429ff952fe2e6f93a53","systems":["Windows"]},{"id":"5fd0ed1d68c32c2e9a393a0d93c7c914f6ef4f63bd2e7bb2768889b425a00b61","systems":["Windows"]},{"id":"618f80d6130b107eb47e44fe5ba7bc35ef18c544ef66ef6fdd88ec2296215a3f","systems":["Mac"]},{"id":"62cd3cd86420aae075463d2f5e8547fd533cd7726c8fa50f8a97f01ecc32a608","systems":["Mac"]},{"id":"62f18845f11cd9846ae59a7ee15b2a45b593ec0ab87ba2388d3755bec0adb0c7","systems":["Linux"]},{"id":"63742de068e3d03b09f34cee3e39dc1e34050e94a0a3d7de09a274b3ca44681d","systems":["Windows"]},{"id":"67232961ed4f75eac9d52f38403e935e8c642c64c028a8eddaa70aa66347162e","systems":["Windows"]},{"id":"67793f6ce4c5512c486e41f3bd0e0bb712404b86a58fa5a18adbf62b7111b4f0","systems":["Windows"]},{"id":"67ea71b976306b89470a7cc55c548020727511d9562bc581d1b304396d374855","systems":["Android"]},{"id":"68897a3c4cbf846244613439b4c66f762e1ecdfcac9290c3b466770dc50024f1","systems":["Linux"]},{"id":"6a2ce013b569d7c7b79b427396d861407fc6a6f365745f13efb00fc3f6a7fb6d","systems":["Linux"]},{"id":"6b54fcaf879e4e9c3b46fc6481d3181ddb2d667c82e6b9c11531c16f4999e3a5","systems":["Linux"]},{"id":"6bbda784890fae3f268c34d8688b3b7395d87f92fe9a11daf021adfbf4ec0313","systems":["Android"]},{"id":"6c1659620c2ed77d33dc98a92e9d72a52e6b7febe1b9249f8386114b3c67369c","systems":["Windows"]},{"id":"71a65182b49d1c15688092350bdba21b10d7df15facb48d9a25732e55303bf8e","systems":["Linux","Windows"]},{"id":"720499af5f3d90805d12ec55f411fe837af4f584514c68e2bd70600ce3fc4c28","systems":["Windows"]},{"id":"72c3945e93d1f2556344b0248275200d9567ccfe205e88281ed5a4335470b5b4","systems":["Linux"]},{"id":"76616b342a98bcfd0f3428c639afd020642ede13d77a09db704e96ee09814513","systems":["Linux"]},{"id":"793606e69f5ed66f7dcf4b0d8b7aa93569a78bc6fc5684bdfb386a142b787346","systems":["Windows"]},{"id":"796057315688f2524462dadf572a320f98fac2b6e1d9b0ad190925fbf2c9bf32","systems":["Linux"]},{"id":"79666ed022b4fe519e50353472bd8ad5e5b2ec5fee717a533608cc12f002067d","systems":["Windows"]},{"id":"7bb5b0fb59f327bcaadd1d0889c9f4c6d967bb955663484d8d46d09f428c8e4e","systems":["Linux"]},{"id":"7cf34f948d133f7bbd09a310568c5a488f6d367b16b11da131b820cf6e8e7866","systems":["Linux"]},{"id":"7e65b836d16d9e5d03761f54db10d8cad77d3ab0e0466e70e596e4e5658a9c89","systems":["Android","Windows"]},{"id":"805031bb37c9b85b06924e70d8fff31c9d33377f8c8e4b41fc62827518d71d8e","systems":["Windows"]},{"id":"830a68fbac4b4ae77f4bb82652c0d4934479bc51de16e41430cf3e41f2deb316","systems":["Linux"]},{"id":"851f37c6b0b26ba263966a9130fccb94cf1a22d284fa727be9032035bb5c5eef","systems":["Windows"]},{"id":"89e5c27398e67c5b43a182421eea5ff43a4dc171f750a7a81eb15f6caab57efd","systems":["Windows"]},{"id":"8a0221e361801e28598a42f8b399155eeca47b485df400f97ddbf0ec52451716","systems":["Mac"]},{"id":"8a58f2a49a3e0d5856eea2b0b3557766aa35669ad1fbf9b41265366a0664fee5","systems":["Mac"]},{"id":"8ea440755b96c94736eca612c9ea235d77265884fa42f06ea711382ca95706f0","systems":["Linux"]},{"id":"8f8f3f9371e36046410c5aa853437f9983ac59cd69c6ae0bcad73952ce1d7cde","systems":["Windows"]},{"id":"9046013722574b9153a5e52363b6362510001dac6da47c22ca91bff8cca17617","systems":["Windows"]},{"id":"905f54f27906466792f379764d399dc1db359d0933b84ad34f12781d5de5204c","systems":["Linux"]},{"id":"956f12f33c4b8c11c0e9ecc1140e5d194c35674d88f89bb82fc2197447bec6fa","systems":["Mac"]},{"id":"97218963a80d612f9be5574d3aac0351bbbc13a268126889ef815d963095570e","systems":["Mac"]},{"id":"979d9e011fa5c86191249000309e2d67ce12690420049c30390a9c7d69e62333","systems":["Linux"]},{"id":"9c148722e2f4f958aabb645cf05016726a056b3f0a393c5a85e86ca4033b6eba","systems":["Linux"]},{"id":"9d8a155fcd55cb5d601f89bfc750d23279432326cd6ca37280ac2a537da74b7e","systems":["Linux"]},{"id":"9ea0c8ed26b53e2c6ae042408804f0fe7234a2c14425cec0c31d9c9f60dbaabe","systems":["Windows"]},{"id":"9fa297304a471e63f9c1e9997a310d7819cd013a6288dcf9efbaae70d30dd490","systems":["Windows"]},{"id":"a2862634bd591e6a931e6822508b8f6d2657a1782c3c54da406d213a1d245603","systems":["Linux","Windows"]},{"id":"a5b4a831e4d3a3106a7ac7f0a53efca1414fcbfa07f8ae0194f5368f8ca571fe","systems":["Windows"]},{"id":"a5dc3a77334d705608f166ba82dc8d92cbc2d46480ddebee0493a9abba67f93f","systems":["Linux"]},{"id":"a73170245aac552468fb742810e46124d6911024a050130635a40c373e4d3334","systems":["Windows"]},{"id":"a838b23fe733c24962c56fe2bc26a295217e5d81669f73a399994ae03e8d7c96","systems":["Mac"]},{"id":"a9d3c789dadb182a7d3e3aed3c7ecc15ff8da115b016a799883c599597358719","systems":["Windows"]},{"id":"ab9dc95d887309ee6902d5d0b44182cb9ac3e75c4ee8072d049d2043b5732f02","systems":["Linux"]},{"id":"ac6627f08dd2611e2695aeccfb64a487b5494ad4dc8240669adfc58f5776c8bc","systems":["Linux"]},{"id":"ac76239825035979a312dd0401cf104bc544b8c1822459a9b35b7458920ca258","systems":["Windows"]},{"id":"adddb924c3ced9032c62a1f20925ac0f33ade48675c9c7472361d7580dd55773","systems":["Windows"]},{"id":"ae2b5405dc2c9c95d601f8ed006a7b17cfa145c76b25b1bd03335c7609dbaa9c","systems":["Mac"]},{"id":"b2202971e72139fa3c05019647459af69150ceb80aba92955fb9764774d00889","systems":["Windows"]},{"id":"b237abe0ec925d4a3c77430577a9bba7c33362dd685d7ce6b43a53d0d1c0b53b","systems":["Linux","Windows"]},{"id":"b61e440da6d5c10af38ff3f332a9b29d56360a8747537bc842fe43845722366e","systems":["Windows"]},{"id":"c2ac63a2573eb40a281187ab9140a6605395a9d99423af5a90a764626d641c15","systems":["Windows"]},{"id":"c4d6517eae769f79a179049a1885e7317602cfd2d05353709fb2cf4a453f53aa","systems":["Linux"]},{"id":"c8d95e8b9713f8725a6a51d3012ba2c5459dfc34cac787432f70958702c9ad53","systems":["Linux"]},{"id":"c9fba418bb9358b6b5a335e8145367c5b7fc5d181d4686613b6fc2f8c39bde71","systems":["Android"]},{"id":"caaf86fe742f56ec08644ca8f1d0e37ebe2bda73858022848198754b955c2254","systems":["Windows"]},{"id":"cae0aaac2528492490ea650c9ce7d09baf96192cbd63c601a00338aa5e4fd57f","systems":["Mac"]},{"id":"ceda6a4c6d1e02e4fcbb11269260e1a1ab4aba8c4876032a7af5a808ccf2a4e0","systems":["Windows"]},{"id":"d07675561e6d424fc5e829d0625c06523aa20d04e79ccb49bc357f6cc7a9b9fb","systems":["Mac"]},{"id":"d1c1aeb6fbfe13de2b6dead227cfde818cca7a85e54dbecc58b46e8dc661aab5","systems":["Windows"]},{"id":"d2e0084d4b95d5805da87f2f35c87d705224b75de3038cf06c8a4989e83220c3","systems":["Linux"]},{"id":"d3811e8d462df2bbdbc0059c192e3defe6fbd7778b762d593953d507e6f300f6","systems":["Linux"]},{"id":"d4757fc64af0fa4f33d4e65b3d4aaf765577716e519f4247c50dc0b78701361a","systems":["Mac"]},{"id":"d6fef843e6b08b2ceb4cdcf6ae4f81396d9cfbe2b35d9b589aaa2e9dd75e8fd3","systems":["Linux"]},{"id":"d7d451f93ab71f8bdeec91cdaa02764858dde224ece2ec414ca14959c6f0429b","systems":["Android"]},{"id":"d822e37f4903d99c355af76bfd8d31e78cfc33eaa0adc5568af721da601c7140","systems":["Linux"]},{"id":"d8948b2630c76b954b01bf1255432f582335b4cb7e4b507f3d02f77fd6803f35","systems":["Windows"]},{"id":"db92b7aff8c8847fe19a0f571fa08b0c33a2031a227c28c9d5431f9ca5abc083","systems":["Linux"]},{"id":"e1147621b442ee0b23157dbe6a9307557b2ccf223057a41031be50ee3103833b","systems":["Linux"]},{"id":"e25b072ffc09f5d93a603fb31e54342f8d56e62fad484f382beacea35294508b","systems":["Linux"]},{"id":"e29bc9bc0e59ad607ff71e953a2ff60db505a79b6a70353a06ac2ca00f478fb0","systems":["Mac"]},{"id":"e2b8c6f8c53d67db6bda74d62ebc855951faee242c203369042f409a8ccea4b5","systems":["Linux"]},{"id":"e3a49fc3003188504a53932975fc56c274dade77d0d8e841d79ebc6d0b7131eb","systems":["Windows"]},{"id":"e563080c3213bcd3ebddfab162f87f58b7a0eda6269e1d1dc33e0cf49f7a14d1","systems":["Windows"]},{"id":"e7de523306ee66e8f1a0f8c1ec166331177c6b2eefd43fa6d03b8b442685b2e9","systems":["Mac"]},{"id":"e88100a11837526c7bcf5d4ba72b6c456a13dbec63a978d7a25ec56aa4cab65f","systems":["Linux"]},{"id":"e94627d4c96cc1ad59161e975cff9939370cb2424a9966708d5bd39dffeb8028","systems":["Windows"]},{"id":"e97e1c51c6bc403e912eb5540545b452cba9019f6d87cdd82e7eb8de40a131ad","systems":["Windows"]},{"id":"e9941d8bb78629c034097fbe317012420ba8b8f12c42aaaab248379788e53c63","systems":["Windows"]},{"id":"eabf8d8c879c24fe7e8bf2789918bb6bbe79f18fcc42a077c462dbe7f633e6a2","systems":["Windows"]},{"id":"eb8b6cdc7c959f34e6f73ad0fc5abf74670ca46aeef7e12d37dc778f84e175a4","systems":["Windows"]},{"id":"ec546ed35e297137fc9fc54993ca82288acd52818c3bc5d486daf9358fa142d3","systems":["Mac","Windows"]},{"id":"ef8e483bc5087e01af0127e49537498c01f9775fd70c13e915d640bc70a15910","systems":["Windows"]},{"id":"f081906ffed4a3ca0e2c8da59ea00ae167af112529d85e4ac64ff7ba32488ad2","systems":["Linux"]},{"id":"f8e92c54d6dd14b5df841f45b21fe2a5b2d9291ad13f4640e794b461a8bd780d","systems":["Linux"]},{"id":"f9b262c5c040744813bdaa1ba5dd1c86bd7d72d45e45eaf4947c3222cccff6a0","systems":["Windows"]},{"id":"fbd4f4451ea7bc5dd651024e15b319af163f386cef090bcbce9d1f676126a60c","systems":["Mac"]}],"Chrome 91 Brave":[{"id":"015cca2d8406a71e6794bb9aeb891f8c72f47df0f85cf69fe8a4a8159ecc425f","systems":["Windows"]},{"id":"0edd63a3f97b921a422ab2579124d883eabdfb398daaef9541a6748d2e000ab5","systems":["Windows"]},{"id":"11aa0178345587fbad2b97584afcdc73e2b121570f86307af825fe36e8900a9f","systems":["Windows"]},{"id":"123e2a4ee49071a74461da368b71cee152a24fa96ea5cd004e18c936db0f1f01","systems":["Windows"]},{"id":"131b6aaaa663afa9f42a62f90d8cce176a18de6fd7ff5b1546f36c3a077686ec","systems":["Windows"]},{"id":"21ee55ee0e31f5833dfb23be4c8082560289952b12a3feea82742b8eea0bb188","systems":["Windows"]},{"id":"2b7c89e6db78366f50124ffc02504a129dfc1085da7f2e2a7ec1663437dacc44","systems":["Windows"]},{"id":"35ce2140675cb7a8613d062a857b0c0a79265a46cf19caf516cd9fa205fe9cd3","systems":["Windows"]},{"id":"365b45374e28402b42d71a7d6a594b4017a787f17625561efc5f653b0a79e80e","systems":["Windows"]},{"id":"3969c9645a1430119e263bd92daa3c97ca65a86758f44c8f6ea24eda47e3af00","systems":["Windows"]},{"id":"3c05334d4cd47ab8d5c31d12d68ae7968a727e63448f4574cd0fbaca10271f11","systems":["Windows"]},{"id":"448695df1b41d1b45df2870932d1b86cb78042e8e9778010678dfdf66295e2cb","systems":["Android"]},{"id":"4c3de569fef164093f1a2e09db103da142d6d7f95dcd04b8c3cf142dc41dbb76","systems":["Android"]},{"id":"4e5ba9692a8ba9d228b99bab16f52c56d3f58cba8a9522b5d43456427b96e439","systems":["Windows"]},{"id":"56c0236319d152ad63018701928a314ecf7429a37b0c044a95ef21c104520660","systems":["Windows"]},{"id":"5d0dcf03eefc69f6660aa49f20a1bc55c84038cd6b8abf742c6bf156bb9894e9","systems":["Windows"]},{"id":"6a22604c194713107ddd7cc393ff65c9e0a6fa5a760078993e283f0e530e1639","systems":["Windows"]},{"id":"6ef4da2473cefc12bcff1c7c452a4bb44c46970e4c5786f4c67e00fe5cc6a279","systems":["Windows"]},{"id":"77c592f8278d4286fb757f2a68fd7ceed716eb6423e7f0428696ce5d814075d1","systems":["Windows"]},{"id":"7890a546cafe1aa2808439087ebfdf775d67dc8b78c88b013e1c954639a7e1e0","systems":["Windows"]},{"id":"8c2575087e5b175d8e24e40c40681c31c37eeee8e93a9c1083aeb3e00fef6ed0","systems":["Windows"]},{"id":"8e6a34a95ce65d1252849f56e057e42a88cb5ee13de5b169c3003a714620333c","systems":["Windows"]},{"id":"8f19b4f9a5b0b738335e5e9b5bfe1085dca67318ac47db913bce684e6f13980b","systems":["Windows"]},{"id":"907ef41f15bf51bf059491e3e0f01d52eb72a88acb8414bbcdcd5ccc3eb24a84","systems":["Windows"]},{"id":"918f6024acb00f3dc51962096eacfc9d0d73e7b5c63862859e3dc2ce4b4fc6a6","systems":["Windows"]},{"id":"9370701b442846c571a6d1e4ad675b879be14aa921922c0f856b21a1e1feb2af","systems":["Windows"]},{"id":"a03165228096337caf54105216eb6255a44a3026baf8a8e2636a2d3f2b6d997a","systems":["Windows"]},{"id":"a3313a04cfa6a8ba1e162f873490cf2c0ebec83520d8e263c067b801253ce61f","systems":["Windows"]},{"id":"beb4467054a507b65f84249fd22ae012c064ddabb8abe17be7281e8908361d45","systems":["Linux","Windows"]},{"id":"cce4ab22dd0bd3ff6d32250282ab6def2479e506aa502bf5cd5c38d9daf94f29","systems":["Windows"]},{"id":"d153feeaece3460c7e6fc1ae76884b66a580e011bb4e753159e634a4892db06a","systems":["Windows"]},{"id":"d71b5a52d5ad28d2337f7bea9a3ef1983acd98eb7805c6773b1c1acf9f1744d2","systems":["Windows"]},{"id":"d7a903b9254695ed57884b19fa52e33b50c931b799c5f19618a84cb9c31988a6","systems":["Windows"]},{"id":"dfba9f7ec2ebae27e2b4e47a4120530741913e3511d2cbf096e1891a2fa85e29","systems":["Windows"]},{"id":"e15ec7177301533275abd6dc07d6bf6a6aec1e7e9e8809a6a8da59605ef95451","systems":["Windows"]},{"id":"e435f63c1fc254791ca7b252da7c3f0843f3cca8aaf9d568faeb4d8e5c96cdc9","systems":["Windows"]},{"id":"e59b3e9634127b6a016f7dce386f4864667eeff6a7875270612a1ae5809cda75","systems":["Windows"]},{"id":"f1c396f98f241a1b45bb5aafb54f4b53dde3909ace6376b4c52d69d304f4373c","systems":["Windows"]},{"id":"f36558f2e967d204c72174f307d5b3eaa0dd3ecd8db53757625cf5ed2440c9ed","systems":["Mac"]},{"id":"f6a6bb4300a78e6dfd239d2c08f1c4ccd7e0782de0dafa31c7b4ba6005a7efd9","systems":["Windows"]},{"id":"f8a56cb7d0cdb752fb4d18d7f94c6c78c88e7f60766a579ad1a8b10008ebb73e","systems":["Linux"]},{"id":"fa3c9894138eab3190b3aecde6e69a7ab070eb0530ecd6ec8c2e43feeee131d0","systems":["Windows"]}],"Firefox 85":[{"id":"01a8dff3a2c02b03f6eec5e05d300b093c91e3928a20316d7a1434da47823b3d","systems":["Linux"]},{"id":"038be5f406b655e933081f405e0e6dff1bf118ba718bc8881684fe161e106128","systems":["Windows"]},{"id":"08bc05a615711b6aa1b517af82051cde8c4c102f026d7d892ad17ecde8fe6a33","systems":["Windows"]},{"id":"13eeceb45194a1522c44300e614a6a53daca85607d4086e4b9b4c01f207a0529","systems":["Windows"]},{"id":"2f9865d4c8a6a0bd2d42e923e2e24d18d495462faed48354a8cb3e7a75cf45a7","systems":["Mac","Windows"]},{"id":"4565f50f536f54a4eccdc04fb4912162091ead7d460f1029d8a4f95558cea1c5","systems":["Mac","Windows"]},{"id":"4b9d4a53ba2f4bb70c5139baef2758c66c474b83941a12b4d812c851ce7a03fb","systems":["Mac","Windows"]},{"id":"609652f8a0d92b3c2085eb3a8a3235a5c9dab9aebc99248fcb7d645f23e02e13","systems":["Windows"]},{"id":"6d8bd29ac7bd91cb7ab0804aec052183bcd0ea7cacdccdc90cc610c7b13270c7","systems":["Linux"]},{"id":"a45d29f5ecac4a41136c2505a055a547b4286fc5f486ed942d138216cb424644","systems":["Linux"]},{"id":"a8a741866f3ae309677bbf7a7835660bf3762f1f315af275129ebb8f4f51cdbb","systems":["Windows"]},{"id":"b765f85f4ed0c46d4993d9afedc6281983f19f81c7a36f0b9665dbe1e43865e8","systems":["Windows"]},{"id":"be770dd44c13fe902f2d77297a3b1dbadaad966c54713fb6eb3d01dbf854b1bd","systems":["Windows"]},{"id":"c5a11d562aa3e7210c2db13bffce536bb666ec39b5b54b68f15a0f8c28b4ba91","systems":["Mac","Windows"]},{"id":"c6ce0b2ebcdde8c0ba6d8920a1a0f67a702be18746276cc5fa5333c47dd2c66a","systems":["Windows"]},{"id":"cc74d9ef47a8695700ecdfd59d285c5a23b25980dbd481ffe4416a04e0082523","systems":["Mac"]},{"id":"dabd885fbb32546e47166a22f56438c58c6a5e503aa6cbe0e619fb7ddd6df1bd","systems":["Mac","Windows"]},{"id":"dcdb4a9b8a2f44343ce87c62681982fcfbfbf8cb0020d6e1f9689b5b7eb35c57","systems":["Windows"]},{"id":"e351d8ba33314b8c8baf72119bd316f75b3833e599efadc094cae4aba9e0e421","systems":["Linux"]},{"id":"e57323ba65e5794359a9c953424fc21024e4af93ced768a844bd39328b2ec65c","systems":["Windows"]},{"id":"f642cbe6839ac722b1d6578fed3edc339b7ecb1b165b6b6451cb60525244677a","systems":["Linux"]},{"id":"f88eb04ed6346506ce03d02ab837ef3f0eba40c965a9c5eded6254081425d526","systems":["Windows"]}],"Firefox 91":[{"id":"0216e5a0181759c27a365e469aeeac34a8f181452c8ba12e0c2cc2f69f506862","systems":["Linux"]},{"id":"03d49b44271498766cce3e128fe7d7663758f8cc8ab9bd808080d7879540e803","systems":["Linux","Windows"]},{"id":"07f10e2171726404faa43a308a8f77c37d31404c3db320169b8e45f67927a564","systems":["Linux"]},{"id":"095f75a6fa900ad2f90003556522b3de16b52ae8962c3a75b085b7890790a9ea","systems":["Windows"]},{"id":"0cc62a95a0744843d6ec4aee0040782c8d97c8b6288078065590990f6ff0a9b2","systems":["Windows"]},{"id":"1aca66a08f0af9f9dfc235af3b32dd37934146defee616b4e2877e6e0a9f36e8","systems":["Windows"]},{"id":"23e6f0d9c9af910222ee0756a0096882d89113519ba4a5cc0b88a3b4cd4b6d76","systems":["Windows"]},{"id":"336a2c4136f865e8a847d51c0a6b52fa3d68f9fcc9b6321dd06b19705c34ded8","systems":["Windows"]},{"id":"35f380f193c92569fa88b54568014e93d4bb2925236f19e484a4ec4132817c2c","systems":["Windows"]},{"id":"3873b2f00906d9e5f8f7cbc21715c9ea3cabb4b4316c18a3846fc30d37ae68ff","systems":["Windows"]},{"id":"394637b28419305d1011c9b9d7fe1a150d884991fcd73111abfe8ccaaa8f04b1","systems":["Windows"]},{"id":"40abecd764dec403c4df25781a297e5ae08f461cfc8aa78046fd4115e42b5dfe","systems":["Windows"]},{"id":"42843425e4a02873523d8e11c25c8b15fc596c8a2d37d401faf8a366ec5582cd","systems":["Windows"]},{"id":"429b6cc3197ce344268b09ba207303b497ac446bde6fbf9b47cc58df120a9742","systems":["Windows"]},{"id":"434f3817fc2efe1095a334d99443604780e85212a4c1d199381d703a48f45ac8","systems":["Windows"]},{"id":"479ab50acb551b1f8e546945e30911dd48a08a039e23c6bc984acffd68202933","systems":["Windows"]},{"id":"4df204f0732ba7536bdac99119d445051cf0454fa93c62e751792d00137364b5","systems":["Windows"]},{"id":"4e0001e23d38946ff9cb1538f091d0d1db8933d3c120c521f0cb26487e8487d7","systems":["Windows"]},{"id":"4ecae1e5ba8154c8b760b8f85be2ccb97d63b030e9475eddf799e4b005c5c1c5","systems":["Windows"]},{"id":"5021b8446f61755079a5ae486b9f70350b257f069151b7201fd4019f2044d1a8","systems":["Windows"]},{"id":"50d1c531363b5d3902bb4973ac1c463efb91548dc9830790d8169121b6dcd6ec","systems":["Windows"]},{"id":"5927b08b4a7f0544cbace4f6d2f8483b7b33de0d94e4d84f62623486e18f0c17","systems":["Windows"]},{"id":"5ddeb6eee6ddda6b4a7d1e4ac61c0096058460b9bf3ff2e1f412ab87e4e1dabc","systems":["Windows"]},{"id":"6191282adcc19d74471b652ea72f7a5004a3d2dd730931647c57b30f8407f3c8","systems":["Windows"]},{"id":"629e617c670c6debae89148c0d7c0ce2dfdb000ff7b7912ba9de74cbe92b62c0","systems":["Windows"]},{"id":"6949986b277f36adb98f83b3f83d55bcb1c80189dc5221b6f6072cb7d121c1cb","systems":["Windows"]},{"id":"6da37fda30fad23f9dc9e0f2a8848557b12e8cffe880b55eb4af6b360ce15502","systems":["Windows"]},{"id":"70a1a1c2f564851160edacd27609cb5d0c2e0eed638f89da9713bd4e8040e1f0","systems":["Windows"]},{"id":"7ca4f8d0ddb654a12ed498570eff80d419f2fc9c5b5d465eadb9fb4802a52d71","systems":["Windows"]},{"id":"826b9304d5af37e39a5d8f670b0e9f4b7b5241ddf3fdcd92518293a8f520a0e1","systems":["Windows"]},{"id":"8834e31f890db8288350de6445b97b6335486be933586b0a57b3cb091ed7c9da","systems":["Windows"]},{"id":"8a8e998423ac5269febcd388ab16f6a24d68681fae87fba25d058e85b52b0d94","systems":["Windows"]},{"id":"8e501363c6efc8787c0218c248915841c17ef914e14785af534a2c87e8564361","systems":["Windows"]},{"id":"8ea8d7f9d684956d26480eb388e37ef8d6fd0eabd85bddfc209b6b93769e7163","systems":["Windows"]},{"id":"9a3353a71626fa61ddf695f86aa907928df19c72e23d0b604dfe5ae0285d406c","systems":["Mac"]},{"id":"a8e6cd4f8586f6ca81f19bf245f3d256f8a1868dbebc93c07d44d6d71cf38795","systems":["Windows"]},{"id":"a9a5f7a50370865b7c7b1df272c8e4ea3d74f9b67bcaac6195c6f1912ccc941a","systems":["Windows"]},{"id":"ad6e96ae7c1d215d86c96ed12bc0be97b4aa7b23dabe995a193d3144789bd76e","systems":["Windows"]},{"id":"aea19bae635b54f0ffe1ea50fd4367fbdbd763888706b7fb40b7f5084bc3e943","systems":["Windows"]},{"id":"b883ad90212f43d3e9e1699d77f1cba07500a44b6bc328d524e77a575b7920a1","systems":["Windows"]},{"id":"b9094124d25fcf2fc0a34b28366cc64b01a3841354c04c5dfe69de396af081c3","systems":["Windows"]},{"id":"bbd0e7ba17ab56183919806385560fda80323bcb6b22fca506226166586e96f6","systems":["Windows"]},{"id":"bcb4ddfa0e580ba8499ccadb2fe801f0aea3577b023794c1ab2fc53ac79bd29b","systems":["Windows"]},{"id":"c120543681c185cf231d753a7525f5f9c077e38aef47bafec9a24a050a84d19f","systems":["Windows"]},{"id":"c63b1de51412ff6b9d38ad4bcac1d5456f315ff3c1d298f59d9ef41f04693bda","systems":["Windows"]},{"id":"c6edc898f97d694f26391452e8eaeea57259c68ecdc11ad2ca587c6777551136","systems":["Windows"]},{"id":"c9abfe013b72afdaab01f8eb616ceb3f390d6369f9a7456560f91ed3ebb2eef5","systems":["Linux"]},{"id":"caaafa475149a7f15b1d290f7af38ed0bbfb158892be95c0cf88168e2a72025a","systems":["Windows"]},{"id":"cacc0141c8029722b4af83e54d083227b4511a4960e2b9320fdf7eb45d416eed","systems":["Windows"]},{"id":"ccad3531e246be8868e47354c2c42921bff067ea001992d44129bc40c99af4dc","systems":["Windows"]},{"id":"ceba5a04693a2778de2c80b94a7f39370bd56b29fe110ec0c8c43f216fb26a6d","systems":["Windows"]},{"id":"cf408f9488bc3c982b8a7fb7b462b7beda1ed6254ba72efd8ba5891055fd4d36","systems":["Windows"]},{"id":"cffa395f6dd770ea6fe4ef7480c81e7108c0d0ed3a9995ce5c271c787a40ac40","systems":["Windows"]},{"id":"d03a7bae3c4caff9539dbe6f6befd3d3adfeaea5e84c936afe4dc9b019b6754f","systems":["Linux","Windows"]},{"id":"d39ee42a96abb8aeecb814b38ff23f036f633a5b7f34296ac18bdf073e943a2b","systems":["Windows"]},{"id":"d4e1d48951510028245dc75dfe179a33da57f51b51e236871ae4f5d6d2e5adb7","systems":["Windows"]},{"id":"d633b248b3857d5be72929187db7057100b9638a67558d650c38a2ada81d0ffb","systems":["Windows"]},{"id":"d962fe6083f58935d4bae34ee319f88477e37609b05d957b07c9e0a5c18a6128","systems":["Windows"]},{"id":"db2a72dd38d15ce29a2a4d68d8d7c962e12293e561fe7fb4f342f1f8520c9e85","systems":["Mac"]},{"id":"de92717c6a0204205cfbe14c46d1d9e8dadcfa5d4323e5aec6c688184a9a1599","systems":["Windows"]},{"id":"e45f7211735badd93bfb9a5585dc84cc1629f2b570dbd187891ddbdcaeed6a08","systems":["Windows"]},{"id":"e4794ba5a70d0d161105f5741f25dac45792f7f05ed7c487c6c6d311b81fb01f","systems":["Linux"]},{"id":"e6cd9671eec08ce32721537e2810edb74806a6bdccbb6dde9004a3876155a48a","systems":["Windows"]},{"id":"f024aaf49477b4db983084c1d8eee2b758525e9a4bcf7c3395b8e8258fa1973e","systems":["Windows"]},{"id":"fba7d841c7be97bdcb8135a923434ef665998f10aa52f26828cc7ce4063a5d05","systems":["Windows"]},{"id":"fd0a7ffe71d9f2ef12af7655c201da28a737b4e38f79bd86e861ace0d17e970d","systems":["Linux"]}],"Firefox 89":[{"id":"021c0452f98d8d6c2011361637a4b55468ee0ce4ee2abdebef44bc3fd0eb966c","systems":["Linux"]},{"id":"028293cf23b0ffae7cc2b36aa9489c59f40abdf252ae38ab6550c3eb3a8fac56","systems":["Linux"]},{"id":"0eed45e20da442ec962b51e89cefcff3482b57df875d091f45d3dd1de2202e63","systems":["Windows"]},{"id":"0fe9e20c0b0a809169f8b58fdf896e316632d05852e71a4967a809b4b5e570a1","systems":["Windows"]},{"id":"125ae1305d93ee49a2595c64b5287b5b6e3f51f1251f8c500976b8214a54df2c","systems":["Mac"]},{"id":"1298034e515460b4a14f098cd8f561b92d730a024a650b3e97cb7e39f98f12aa","systems":["Windows"]},{"id":"1673d8f033750606c006f4ccde0375e004b3eef2aa13f802a4de7284cb63882b","systems":["Windows"]},{"id":"1adf2fca31fc63e880dbb8df0cc0f6e9341720d16c52f235efc9b8d7866b8ed4","systems":["Linux"]},{"id":"1ae1bc607a190209bf2ec0cab5306082ab742469b9d682263c3cbdb016da6012","systems":["Mac"]},{"id":"1bdb7d453ab762540a35e49ba13454b1351efc5794a34419ca7accec2266ae36","systems":["Windows"]},{"id":"1c4eefbdf8da42667bc7bca24d83ba04096ccc5aea730d8193dcade2db134061","systems":["Windows"]},{"id":"2093a58eac4d007f2a8aa22448273064356150620ddb3ac9e55450575405aacf","systems":["Windows"]},{"id":"21a97917a4d2a1c2f2ff690d38d6fd3ac420408ed9f9cb11464202a0b9f03b25","systems":["Windows"]},{"id":"21e7733e94dc2d6b4cfa7f4e834802da953f14f0fbdb88266a233f0ee5d89113","systems":["Windows"]},{"id":"22bb447d2b98514a8e70f7628b12e64b3feb8566b85270a1b62d5714ec010c08","systems":["Windows"]},{"id":"23d4bbf029f80a285cae5cf99d7ef7329d76f6ecca06ec2fbb7a10eb011ae0ae","systems":["Windows"]},{"id":"23efa5e4b616745a8bab7716ab9f8a8f70d0c22b10b0a8f8eaf192f62f594a63","systems":["Windows"]},{"id":"244725b67cea249458c5131b589062db32ddf3a97eca0b0161cf1004343ef6d4","systems":["Windows"]},{"id":"27b4561c639dc3310c05ecbbe442ec4e98817ad266e682a6c5897f1a981b44a8","systems":["Windows"]},{"id":"280ca4f2b05345a7e5c34378720611a503f206fb69507d450bf565fd27f70518","systems":["Windows"]},{"id":"285f113f07ad0821d6e34a1b1ebed1e5ec6b7a6d862ab58fc347b36ba927bb87","systems":["Windows"]},{"id":"289504aceedca37091be70f60693ac2f0fffc82ce1b82013326991cd6d2676fc","systems":["Mac"]},{"id":"2a5c2b07493fa71753434a743c3e9db883f3e560af7b5e1084365d02099149e6","systems":["Linux"]},{"id":"2a9c9f6fce50b45007052d1a804c2837c3dee1ee85864c4039f7d541d3b5315b","systems":["Other"]},{"id":"38748663e077fc64b7404a89cf1fe60e2c6dc1d53d88b4fee7f3894752dc1caf","systems":["Windows"]},{"id":"38b78adc1d75f8f78c48d50dde5eb0604991138b2f6dda90ea923a39d7224707","systems":["Windows"]},{"id":"3b5dc687687be95c8b8220baf791b9171edf13fe70e77ef807c3066c5df62c74","systems":["Windows"]},{"id":"3bd6112deb68fffc430263fd93d362c529e17ce033e32bd4a23b2ad4d23f0c3d","systems":["Windows"]},{"id":"41b90da2c744ffdef99c4f59dd39f074654e47d1ea3a61c853f7355866ffd1d9","systems":["Linux"]},{"id":"4239374ca28fd86be319926723b6b0c2e63c4e91329d71d97af6169509ff4d1c","systems":["Mac"]},{"id":"4257c07b21f54f67ad264b0df92892710420a0e9ee1caf56439564859f5f2867","systems":["Mac"]},{"id":"4302b4c8cf68917920dcc3c674ef3c79b8d6ca721c79c05a052cd77f54114d66","systems":["Windows"]},{"id":"46c24c361b5491c8aaa1c373cc2bac4a87deebf8af24ea9b08a0cc86c8c18f7e","systems":["Mac"]},{"id":"47b86b1fef36d963d7d6522f26919b62273bff5c7bc844c62d67810bb0a06b2d","systems":["Windows"]},{"id":"484a0f78f27da33263e71b5b2f02bd40e8f2aaddc36dcc30829d827e7a761752","systems":["Linux"]},{"id":"4c3b17eabb07b0ccfaf0019344f6db2c876b310724e72920af157ac5454f8af4","systems":["Android"]},{"id":"4ca7f66c3528b5b356b2f76583ee26ba2a252f932d41a40cd34c75607e213996","systems":["Android"]},{"id":"4ea3d361a2b3357978282653fb1edf1fed45966115782ad4b0038af2bf72f6f3","systems":["Windows"]},{"id":"523fd96ad485610a9bcf8d803bd9be4f194c6b0fd7f3b40d8dd7bcfbf1b8df4b","systems":["Windows"]},{"id":"528ae35fe046a39ef9ca1e2385b93415b85d3c77993c41a99605d30fced9356e","systems":["Windows"]},{"id":"540d9c1b80a5fb793f64a3d93ea24b2dd88600543b2ab0ce0b83087ce80db317","systems":["Mac","Windows"]},{"id":"551a106470a4f6a6c3231933b45d406bb8a4134b8d150d296194ec97e26352a5","systems":["Linux"]},{"id":"5547a9ef41a6bc95353eb4431c568c5569f8a10dde448ddcdc036f3805764ec5","systems":["Linux"]},{"id":"5783be9cc502b1c571d26a4e5e92631e481d4e72e22477a71a056e531f38121f","systems":["Android"]},{"id":"5793d54dd313153ab573ed80eb318b540875554ae686bc9e9b33b9eb7755ce12","systems":["Windows"]},{"id":"58773c221b0df73e92b24fe80d6de647210cceddd38b0fc86d4fd36c3649b4ca","systems":["Windows"]},{"id":"5acba609aa95971150b71110276c078e8b7dba8ffbe3ce62bdb0d5c46e6960c8","systems":["Linux"]},{"id":"5b5ae1564d5295736c4471bd430a87b3aae86c2910648ffd7aac09aae0cf669e","systems":["Mac","Windows"]},{"id":"5d5802e22035ee6f66b7eb0375eac80b679498a3a21261b813d48c15428b8a94","systems":["Mac","Windows"]},{"id":"5e29e81dbec190a1ad1ce27846d8585a164a924054e9d344966e80ec8cbf1a91","systems":["Windows"]},{"id":"5fa4dd493b65564e49f68f272312c4939a1ec9ecb02dadb9c3880f30ea29ae24","systems":["Mac"]},{"id":"612a5feef2a305e45603c53213fc60e135529a8625b931798e034719d45b5bd7","systems":["Windows"]},{"id":"6393295484670e5b14661a91c827d9ee28803189b61aae28c2200159f7c1e2e1","systems":["Linux"]},{"id":"66ac23fd214aed94d2615d30268033279c985089ba0c42c77b7ae586fb350b67","systems":["Mac"]},{"id":"72cb1db1b4775763f83ad0099a6e2a723f6ae6c568780c05ad2845b3d4999a92","systems":["Windows"]},{"id":"768d285f508c7c6033e4a939332b4a4f0291307c3cb90144f484a8b08bf0796b","systems":["Linux"]},{"id":"76c461f3af236dcaef3c6c40d6ed71a909ec1cf8594f5d7afdf9ac55714dd639","systems":["Mac"]},{"id":"7d6b7c81c90708d73da1a4b8a5573fc3d16728996283dcf5dc4a986c69542e6a","systems":["Mac"]},{"id":"7dca4f47ef4cb29a386db4c5449670380a4cb8df0d21608666d1753efc2cbe45","systems":["Windows"]},{"id":"8592674779347b2ae6311cc96caea969e926be7273334debdb2322ac147084a6","systems":["Linux","Windows"]},{"id":"8b0622bcb5d70375cccb3f25e1e84d8eecde6661031bf074eceebe83ccadf17d","systems":["Mac"]},{"id":"8c26b564a67746067e1826f073ac705c7fce82dafdeeef8b94b86bcd8523add5","systems":["Mac"]},{"id":"917d63e883dbb367742b41bde0c8bf84e540f90fd76c39a0ce74b755e47deb55","systems":["Linux"]},{"id":"9770e0823cfd6df2337ed32b50005689fc75216eee4f17cbb03f382650d8b61d","systems":["Windows"]},{"id":"9b3ae32bd6d8214e615e3278651a872b5c501e18b58f2739f57b70e791f373d6","systems":["Windows"]},{"id":"9d095e794a01c4b150f4b8eb7d3e5f0795610b3361b33f6ee2378f0af82af695","systems":["Windows"]},{"id":"9dfffef68adee7f2c6573fc6e80546bfafbd2b90d6ab2e231c5498cb8a58e859","systems":["Windows"]},{"id":"a05b6e6a428dfc471f2bd26715bcb08dd81c60a5b6a38701681042cac062764f","systems":["Windows"]},{"id":"a4b41dd87604ca9b5996869604d7b20853a2f3e87249c379bdcfd02bd7be8ebd","systems":["Linux"]},{"id":"ab9bd9d691f7b2289a3ed7f900773450353ac70a54738cac1d50b6dbc2f0d6bd","systems":["Linux"]},{"id":"ad9c48d281dc925eed8386b38897425c1d3acf0df49c3cbd6ae2341fb283cc2a","systems":["Linux"]},{"id":"b3f6470d54ee620ba46dab8aa071507c925f3bbbd9cbe065b200dda4a5977641","systems":["Mac","Windows"]},{"id":"b527c507e4d774df46b6434ad230d4b3db1e2240a73091e07e916b5a549bf30c","systems":["Windows"]},{"id":"b8462cc461bc6c687d61e48ed29ffea15e1585e2c49daff84f179bfb2bd0e94c","systems":["Linux"]},{"id":"bcbbe2583870b49a05740a36ceaa05aa645a95f177c7745ce60dd53703fb5139","systems":["Linux"]},{"id":"bf0f3c64e0b5a5862f8f899dd0971dc0ddbca4e7538e9e035fc5376757547579","systems":["Windows"]},{"id":"c002e03ca9253bd7717394be9eea728017b3b834e9f512ed3bff8d0760720b1d","systems":["Windows"]},{"id":"c09b724479d4c20387b9ad5e459490eefebc187c989dab9dcccebdbce0ad9181","systems":["Windows"]},{"id":"c268280eff66a856a43a3e2f190b0613c955a93cc1e165fdd1821afd7e5092b4","systems":["Windows"]},{"id":"c2ccf498ec4fe0cb99ef45b0eeb4e7e5323feb71e31c1932c93654c746caa02c","systems":["Windows"]},{"id":"c4c67e8d4190279c3c334eca0235b594150b950643758defa0c9643556ef8ac6","systems":["Windows"]},{"id":"c887247693a2eeaf057ba7f55ef087ce7df30415be800cc88954224273e38560","systems":["Linux"]},{"id":"ca785c1797128dddcd0e746b6291d70178983fba8ef53eb9b0d7b6fe330d218e","systems":["Mac"]},{"id":"cc7c0616ca80f4989b03652631aca8f33487d1972ccd41d73f0d45efcf33bae6","systems":["Windows"]},{"id":"cc926b7dc614b17b2cc8f21a345c6ad1ef0d418c1ce372689c409b1dde88754b","systems":["Linux"]},{"id":"cd7570aaac348c5425c3bcd03746d9db217da6a826aae51298dd8fb6b40aa966","systems":["Linux"]},{"id":"cda43ec96fd7d69cda09f157f48152188642ad83f4c4d9b782f4376bdb7357f0","systems":["Linux"]},{"id":"d5f7e861ef1980e74eef3030d7947756b2d2003b72dd70a485851f3097c806b9","systems":["Mac"]},{"id":"d7aa76b7f018e058e0b444f22182e6b092d1f5ea78cf7e81456fb1b84c3206d1","systems":["Windows"]},{"id":"dbfffc22ac7143c28a1852297053b192eb4d210505093b7b166c38f1cccacab3","systems":["Mac"]},{"id":"e3b12303bb6dffdf0b43fe890a85720842d3ede3036dc95ef05c85f0fa0a605f","systems":["Windows"]},{"id":"e66102b0fe0388eee6632f988e632191702d612a9725a0c5e0ecdaa3e946c5a2","systems":["Windows"]},{"id":"e898191d8311bd7f9d21545189f2c6ece35464eccd42669284f5dd343f6257e2","systems":["Windows"]},{"id":"f30dd0ee1af8cbed397a0baec14069f3bf44d261796c8e7eef40330a81f8aa4b","systems":["Windows"]},{"id":"f5fdf916c5e6a835d03de3c75fc12d39ea7119e64c69dee2d02f1bf4d4d3e1e1","systems":["Windows"]},{"id":"f6cd9e8a7157e96e8265df9145a075a65c2c9b17a7c521bbbc6d66c81392988f","systems":["Windows"]},{"id":"f704342a04733d93771d1feee35aae98d2e0009d1fbd9c1bdd3ddec1d25194b3","systems":["Windows"]},{"id":"f8bf8f3937cd1f49bd0b4d9e1802cb6c7e3d12a015310ef4c7c5d4810235f809","systems":["Windows"]},{"id":"fb26a0e8457eb7cf72be2b3ccc0ac4da4d09827881401760054f78202dc2d7a0","systems":["Windows"]},{"id":"fc1b733f6a881335a673701b69b6c4919c4aa49067b0ef37e1a3869954799796","systems":["Windows"]}],"Chrome 89 Yandex":[{"id":"022621cb9689dafe27f331499601e5e55a6e6a8614ee3217b6cf4586fb347bf0","systems":["Windows"]},{"id":"03607e5ced3fb2cbb52e6ed972a437139737b82667d47c8ad199a50f88be99b4","systems":["Mac"]},{"id":"440fc9fa6f9bcfe4ae6e85015e3657d97555b393ec709a7ad8cca288dc363b86","systems":["Android"]},{"id":"8f2dcf1977a3383cb7f8d64681ee3aa76067d48b137f8192ef9fa2ed23c9bf22","systems":["Windows"]},{"id":"e207bd8f07031d4cdf6cbf38552af5924bcaa466beead459ecccafd57a5cf696","systems":["Windows"]},{"id":"ebd44378f6fbde2138ded48a2d97f9555fe98e96924299dbb65c1c08ac95d950","systems":["Windows"]},{"id":"ed6c684637fd5ea2d91384d9db8f92bf8bbcfc0e247fcf04bf97021385f64cd8","systems":["Windows"]}],"Chrome 81":[{"id":"0294239230f7d34e8abc1ce94f51587d48eec1a0d2d5609e4ccbc2dc93456f9f","systems":["Android"]},{"id":"0f53fe19ddd35baf032cc9aef79302f7b4560f62bc0698883e0dbb034815592e","systems":["Windows"]},{"id":"1a02dfcde96fc42248891d65840d724eb49482507014f1446ce06b97a6c688d3","systems":["Linux"]},{"id":"2f3b5e239bedb6c37ee9024d8dbcea40e0ef0881ec26e260bcb3435942a982a6","systems":["Windows"]},{"id":"5d0aa57a3292c77ff36079242a8207340fb6671df69d18e5ff7f39ff3dfcca24","systems":["Windows"]},{"id":"7c02543aa236dbd59d0cd40b0ee25d187db1ea2aea0905e24f7a21ee0d9f545f","systems":["Android"]},{"id":"8e06e29c1fa186a0b5d4becdea2b2809a76833b21efee78b6bb13af394ec00fd","systems":["Windows"]},{"id":"8ee7079046c4b58371508927ea8ea1a50207b49b9c27d1f0b3d524a284338502","systems":["Windows"]},{"id":"90022e856287f543b9bd079467e0ec31b7df63e91853e73e0e2548e816865699","systems":["Windows"]},{"id":"98adf70daf71edfd54affe224487d27b9867b056fe942e821d83f7dd2ca4f64d","systems":["Android"]},{"id":"9d88b7e147f301818ae94a883f3b8fc16f2dbd7026d5a7e13fbde9f208aa5dda","systems":["Windows"]},{"id":"9ebda86f07403185b9c20e0604aa85c23ea8512c7bec9a8e4d2cfa70d3331f33","systems":["Mac"]},{"id":"b7e104c7f006fdb6c5ceaa4ecf454018783de145c7fd60304a5a2d9db9b5329e","systems":["Linux"]},{"id":"b916aef5aec115f7487c6997dc56ba4aa7e859461d8790065333c375590ac51d","systems":["Android"]},{"id":"c3d9d7c28b02171ec335539e1055b9b837899a0591d82ef650ba5a1b8f16d0d6","systems":["Mac"]},{"id":"efeab7297cf3f1860075d3d5fea063a493307733666de3d13b8b3574c46f7986","systems":["Windows"]},{"id":"f09aeb22f6cb2715d850f6ff08a6aa18944482e59496a1af581e80d7046ea5e8","systems":["Mac"]}],"Chrome 100":[{"id":"033ac95731ab5c142bec5bfc19a4672237d47b7d055b4b3d92e46afb3bceef81","systems":["Windows"]},{"id":"09060e22ab2f25c73476d0e7480f09dcf38ec1418e3e2fdd165b80fe90e6c8e4","systems":["Windows"]},{"id":"0c23cc224eef985663b8bcc9d0688fe0ab96241000533a9f59f574ee2d8be858","systems":["Windows"]},{"id":"13876a82e713552976f7138898cd33facb9180c542d1e729b7660ee6bafe880a","systems":["Windows"]},{"id":"15917d394e31382ad2b75133dc5a56497d89e681df0be2af8491728b4213750c","systems":["Windows"]},{"id":"16ce0232b0b98b885eaef28a88efc537dd126d21170ac5445a8c03fec8816ff6","systems":["Windows"]},{"id":"18068a55c365a55b1b9ec611c92123d71b384eca77cd78b84d86f2bce126cf9d","systems":["Windows"]},{"id":"199fcc1b69165640f8d94ece1530597df190cde413ddfbd01761a25fa7034368","systems":["Windows"]},{"id":"1c96090904bb1d9c8e005b0c8e845f4167f72a76dcc123ed7210a1278f90fa1d","systems":["Windows"]},{"id":"1d3bbd3954bbc291a7ac18685aa6de547d001d495d88366557d41d3382b83a67","systems":["Windows"]},{"id":"22515f8aa739ad14299182cdf696a6412c5fd4921cb2aa787fda4202dbe08a28","systems":["Windows"]},{"id":"2508a420f100884214701a4df93bbbc4b518567f770cadae13c825a09e76ee3f","systems":["Windows"]},{"id":"2c41ab40c556bdbeb6ea131218da318a564147cad6a2e7e7a06f2814d8186928","systems":["Windows"]},{"id":"2ce74be76b73dec268647bd05e345a25ba85a2e837096ea17335bd54700a32e6","systems":["Windows"]},{"id":"376a4d457bdab4a6cf3fca2a329d175a2d4cb57337cd061195c855e118ffc3a1","systems":["Windows"]},{"id":"38fdd95cf08a004a3a44cfda9507e8d1138d9888472ef1b4d8edc85efe6dd0dd","systems":["Windows"]},{"id":"3c01a04d697e625d0cf6d9c8505faecafb3356d29eb6dff75cf106d5b3a8a0a5","systems":["Windows"]},{"id":"4887a91091af9f96708fb318aaf24705346419f70c6ae428cd5a303aa239b315","systems":["Windows"]},{"id":"4a2fdd4b2db0212b4f608352b3c5aded59eb80a1b1fc5e8470e2dbde72a87fc4","systems":["Windows"]},{"id":"4d9ef7f70b299efcd432b7c67da12a46d09cb89db5eb7dc4c2966aa0a9587d8c","systems":["Windows"]},{"id":"506a82e89115f216f8e961c574458a167df372cf1564c902e639aa54b98f5e68","systems":["Windows"]},{"id":"54483be79aadba61a42efa6255e3ceaaec2ef48fc0d4933adccb5fab1cd17cf2","systems":["Windows"]},{"id":"59c63dc24d42b3796b70c131cd2dbc5651c07e65645d8ed659845d0d6fe90e92","systems":["Windows"]},{"id":"5b0061f9eba5b4d1f1c8e2f922bf9ce82946ebf0cab5661c70c80b43377fcf7c","systems":["Windows"]},{"id":"5d4294a2f9bc69e787f3e3c4fd7ee5603776d9653df4373b4ba933aa5f3c7646","systems":["Windows"]},{"id":"61b69ec048897c871035f093ddb599ea3c0ddfc0ccf90c5e4a2fafef8720204a","systems":["Windows"]},{"id":"621fa820a3627eefa08ce85241a22aa5187a17a28993848e665078191e2f920a","systems":["Windows"]},{"id":"64a586a3352611e775a03e6e0a7a66af646e601dfee9627ca7845602e457236f","systems":["Windows"]},{"id":"65149c13e023ca443e139aae6a55967425a29255c31bd977fd0702dccc451d21","systems":["Windows"]},{"id":"679ab3c3c6cb7b0e7cbaed6216be7832466b27a6b5a8cc79b9f932f6251fc29a","systems":["Windows"]},{"id":"689554579f9f05d4fd5a2ae20c9af88f951fc748e002e15c6dc46398632e5c08","systems":["Windows"]},{"id":"68de4f51cda038901a8cdcf43033176db947a6449e720fbd19309d2188270c8c","systems":["Windows"]},{"id":"6a81d81a384fb3f89043e3b85a1e94ce5e457630e27539134656a17fa4ba952c","systems":["Windows"]},{"id":"6f991839d87bdbd098851f01c2a868efe1012b50961ac3f2cd9dd7f7f544be22","systems":["Windows"]},{"id":"72a518fe1696d9aceef625e67cd1eb9a90abf9109440f85b5fb775ad7812c9bd","systems":["Windows"]},{"id":"77357fe0474a3c8ee404d4d963bdb190ceade549f80c4874e60659a5420ec3c3","systems":["Windows"]},{"id":"79b645e7a1fcf6bad2a03233ba11f1ed77c681b0b93a2fc030cb43267ce4dcdc","systems":["Windows"]},{"id":"7c814bfc5015fe7f4679510fb0d6d508eedea770cd0b341a94f9fa7ca84c79a2","systems":["Windows"]},{"id":"7f63d26126e813482b2f249780c3dbc4f85e10018d8310123a586bd2596014a2","systems":["Windows"]},{"id":"816537c1a16be896250950816509235a4d805a2d024393788c46fc4368387e93","systems":["Windows"]},{"id":"878a8e2d3c48f7f6c6b30e5b25c533ae512bc316ec0aef1505e2b5bc96fb1c7e","systems":["Windows"]},{"id":"8cb4e53a4cb229b3ee979c50ea89bf585cb3f3fa07d145356558aecaf43118b1","systems":["Windows"]},{"id":"8eef735ee59c337615e1aed7ef93a72e68773a6c67f705452fcf719e7ef25ae0","systems":["Windows"]},{"id":"98ca3f38fca8d90e1ced776a46d0541760a20f2e1ac85e3c22a8e426b2d311b7","systems":["Windows"]},{"id":"9e80b4b49444cfbd7f57b371cdc5782f4c0e4ef64e3b04894b740029cdc1bafa","systems":["Windows"]},{"id":"a30f2470cdbdc7e0effe0cc9ff37e796c2575b3ee95acd4eacbab1992874235a","systems":["Windows"]},{"id":"a7bc2ded8fee9d50abef51e0abbd3e6a2abd3140c41aea579030f0e6ef69489a","systems":["Windows"]},{"id":"ab1e3c881285d27037a3b3aec5ef5d71c166e80066ab90a3876396c35c37b196","systems":["Windows"]},{"id":"ad281e701123631a29b73b325cf33dbc7f2ced5742a65bc174dbc82048259eef","systems":["Windows"]},{"id":"b0dee572d4ea006f52d6a482a5e21cda405c0b01ffff250867f93cc0962941b5","systems":["Windows"]},{"id":"b15c009d8826eee23b90e0d02370d43fe59a87015540902c5191066cf7777b00","systems":["Windows"]},{"id":"b1f56d76665b5d29acdd45339d60b6d6d96533400fefba9f5d1a63f77325afb3","systems":["Windows"]},{"id":"b5cd8c5597dfce1f7651abf67dd567efe7bb0e7f1a627e4c4a4270a76c2e36cc","systems":["Windows"]},{"id":"b6a656af6e5962653db6971d3932e3bbe4416f2500f3fb1f679305dc24ad2954","systems":["Windows"]},{"id":"bd5c9a0e79b15c2b17196b5b585354151d6ee1e51628b1e426ab29241dd61c38","systems":["Windows"]},{"id":"c2db3ea270f79e6c4b5ef442e746bda69f82ee7649ad97545e14b22083cb796f","systems":["Windows"]},{"id":"c5e1ce01dd38464dec4ce6c73f1d81fbda1b219efb014edf0a0fcf90a5aefaab","systems":["Windows"]},{"id":"ca2677fb4fb14adfa841b70c3ab2dbadeff8fa3e1062e54ecf2eb4ab7ad34c9e","systems":["Windows"]},{"id":"cab1f56075ee1ce2d720e9bbf44ab724aa2acf0eb22881c140dabe5776236d66","systems":["Windows"]},{"id":"cb49df72aca736a1b0fa3b2d91c76ec68c8cc250e55f1098ab0059ff92f526af","systems":["Windows"]},{"id":"d0dc61c6c954b756274c0349c2c0bd7902750ee25e6f10a16f5f5d5698214867","systems":["Windows"]},{"id":"d754ac83ddf0e1b16f9252b2aed3e144e2156d02d540ec322fa1f1c3fae9455c","systems":["Windows"]},{"id":"de51603d8cf8ec5154ab240a460c773fc7e2db4388da045877c9df88455290ed","systems":["Windows"]},{"id":"e461469a04b2d47fb886295f5303049b7125dc39b908f8671d5dcd249ff83b83","systems":["Windows"]},{"id":"ebc0930b05fbf9e02cd311799ba6b935e8abc37165c05d82593f040f65131ea8","systems":["Windows"]},{"id":"ecb089a0f2bed86e7861a33f4f9bfbd59cf31487b1dda17cf78fc38416255fad","systems":["Windows"]},{"id":"ef550d784ff0ead3e2b09cbb96f832f294f5d0160018b11d761441ac136dfe7f","systems":["Windows"]},{"id":"f21c80d6bfb2b54b9fc4910a2f61014b26d16e6c35434c7a8ff2949f416b3b20","systems":["Windows"]},{"id":"faa521c81edb4022b820722e94acb01bc56dfa4fa4d47bb15651a151507962a8","systems":["Windows"]}],"Chrome":[{"id":"0384a7171219dd6d024d6a184d322e0795133c7982f412fa919b6acfb185d4ed","systems":["Mac"]},{"id":"094d68bcb76400790e332213c8990614194bb0b9a33f9d2f9a2ebe46f14ccf25","systems":["Windows"]},{"id":"0bcd5a6b1ccff9b36f3bf6cef8d80c21ead18cb10eb811308c12bc9e24af924b","systems":["Android"]},{"id":"0dbbaf9a6623877475f079d0b36a42690ae7abaaeb3d9b8aec4d86ef754887b7","systems":["Windows"]},{"id":"1673a9366c18d9753a8b950ed13ede7f088d4bfde1e77ae9e819f1200555c9e5","systems":["Chrome OS"]},{"id":"18a964ef0c6d972de570c324b30335d910e9877f9c54b501cdba7b4fdd6d2c0c","systems":["Android"]},{"id":"199d4967077dfe15451107f292188a3e02eb416ad503b31c478afd3a9e1a5b8b","systems":["Android"]},{"id":"233b7bfafb7d32fbd7fe782d2b7ce34ef550a01afb8cd4f7fc908a0cf94eaf0d","systems":["Windows"]},{"id":"23e5a83b4d3ed2327a7741fc5831c4112f4e54b02389478c03cfdd44718f05c5","systems":["Android"]},{"id":"240bb514a2b63710fde5513ba9cf672898e1ee7aff46d3e27e0b10250bcb2561","systems":["Android"]},{"id":"2496c1dc0a90ba18d82009e9d59e9c30070f488f8bac804ae9da130a93a2ecf2","systems":["Windows"]},{"id":"25d60e1f1a4b531d833d25552193838a9291eb5415c4a18638aa8f0667763c30","systems":["Android"]},{"id":"29b6b290f4be906d15c4b26384e347d45fff696750fc3d72194f86171c51fb82","systems":["Android"]},{"id":"2d8128b6a573f66c9863e0c4eaa31d80523de102ac4ea971203a23fdfea65008","systems":["Android"]},{"id":"2fe2c5f1691e4f86c885df17b0d58a3845c1e329e2b7e7d7a76311050af45fcd","systems":["Android"]},{"id":"30aa904563db94aea4f09ca994de61006226bfd6cf817664a9f7074b113ed20d","systems":["Windows"]},{"id":"36cb26b274293a7ad8d5a120aba8708fa6cc1ed13d58f8983b99c5da7c0aab9d","systems":["Windows"]},{"id":"37b822ffb2d7ccc4f020b91fc20f1a3fe0b8e37b22edde5757ab489acbb41e84","systems":["Windows"]},{"id":"3b53a23b08d27441031318a11865e783459752204428f15a2a42d19af21c0131","systems":["Windows"]},{"id":"44bf4100d2a795939f9c9ea2594fb1ce1f27530c14ffc941534fc7a746c629f9","systems":["Windows"]},{"id":"44f4636a38a06d6d10491424e3627d8cc5dbbf4fbb40e86f0ffd6a85efe76bca","systems":["Linux"]},{"id":"487afbddc01011bf66db784f41277bb015117c303f60f0649bc0601e9746ecbd","systems":["Windows"]},{"id":"4a392bfc588b33d35d65debdcbba2006f13b369ed67c6e087de94e06dfbe9677","systems":["Linux","Windows"]},{"id":"4cd407e3954ab1882f919c6bf2a704a2feb25c183197f4f973514a965b0c1796","systems":["Android"]},{"id":"4f84b2437e4542a789dcac54f6e902ddb06979f695ff7e02c204e1a29a5bc94e","systems":["Windows"]},{"id":"556100f80a060e693f6ab7f10f0d3c06d9dc61eb1c259f2c65f81a9250353d30","systems":["Windows"]},{"id":"56c26f17944e7bd57f5ced4e7ab3a2154a4706ee6bcdcd9f98364f6732d1373b","systems":["Windows"]},{"id":"5cd1fab2c57252a7f6b2db336cdd8a9260877f19b26dac9e9c73b5b9c64e1492","systems":["Windows"]},{"id":"5f5e48bb102f3f58b4ec16760c82e07f0276d035a26a61639e287e380d083415","systems":["Android"]},{"id":"64e02b5caaf5505c05fe9682a27117b2610336becc1cee61037571b667b1ede1","systems":["Windows"]},{"id":"6632821410cf4c680b44ed9b78a28d1eafc47933737860ba5815649cfffc0185","systems":["Windows"]},{"id":"6fb57942f3b9423e1dde9a14ea5ac6f6cd791aa9a6dbe88ec703421c7cfdced9","systems":["Windows"]},{"id":"6fe791fb222464345750a713ae389d4b8dfa764a90f5399b0cee9c8bf8d64bbd","systems":["Mac"]},{"id":"7bc558729e6f34072db635cc6ff247f4d927ef7fea8a393c6d9c933091645a66","systems":["Windows"]},{"id":"842cf0b483104b2085e767637f4fb9ac0f10deeef185958227f0cf86456d27b4","systems":["Windows"]},{"id":"8fedc37b81de55e4af42b52888c42dadf32e56ffa35ccca181df9da4c838567f","systems":["Android"]},{"id":"90e79e2d0541f537e7e887833cc11f915c93ea7f5f737f83beebf1d3c5211233","systems":["Android"]},{"id":"9243e41f0aedda745df43ce284172a5701a58f0c3fb0dfd9f423cd2be8b616bd","systems":["Android"]},{"id":"92631f997ec61bcad5839911aae9301b061cef4c5150f5d6549293c4cb0b1360","systems":["Windows"]},{"id":"937bef88c3bd0f8f8e1e67465a66c68a1b8327ebbd57b52102adb3fd56d2f97f","systems":["Windows"]},{"id":"9b3fe835d3a268adcc7d5be2d1a205ef7c30e387f799452cf69c103d6436c4dc","systems":["Android"]},{"id":"9c1f2008400d320800fcf985d831a24c4e39a11f2d7243ef9e6c985238f49f3b","systems":["Windows"]},{"id":"a12d61538d87fbf2d2e25ff1b2cf7c5e2bac1088620fb0433028146855fa3dca","systems":["Windows"]},{"id":"a94731be2366993d9c60e46b14ee94af87da51dcc4c53c0303b4da0cad0d23a8","systems":["Windows"]},{"id":"a95bb9bb7f2e99700b5a131df360ebfb2df60b12eac9b641700e5fcfdcbfb241","systems":["Android"]},{"id":"a9d43a1fac9fd3b899bda0fa1c08a887918c6c64abd6fbd6c8d49fe989d48f7a","systems":["Windows"]},{"id":"ab243f330b5b6a298d0ee8fefa45acd8930545ed01fd29080e95f4dac94b8a5c","systems":["Linux","Windows"]},{"id":"ad3230800aef6bd881291ed2f9d3584f29b19c216537b629db7d0df5f64198ab","systems":["Windows"]},{"id":"b2d552aa165655578fcb9e2dc8caf76b56bcd055565c61749ccec036d8b323ed","systems":["Android"]},{"id":"b5e31b86723e847afb3ed56032f9dcda03352504f2c5b54911783ac6da28ed47","systems":["Windows"]},{"id":"b6eb8f89cfe203b90d1f49922fe956fbd6bedd0cbe4fff09237dbdc4176af075","systems":["Mac"]},{"id":"c1d46e78ecad846de90a61edcc4091c0713e8d5812c38753a2e13230fd6b0a90","systems":["Windows"]},{"id":"c360a4d6012e76985736a983b52cee218e05162ca94aa649673a38ceb39d2e1b","systems":["Windows"]},{"id":"ccb31c42d18ec38e90f216b5509364ed179a3ad64f750419962b9a309b9708a4","systems":["Windows"]},{"id":"e1c864279da4c59536a9c73d807508eedeecd1ca6cc28637db29568ba569f17a","systems":["Windows"]},{"id":"e2b6e0ea8970708d2215149a4a3381479bf694872f2d2cbff717c64cec4bd301","systems":["Windows"]},{"id":"e2f469a86115f199be90f1f6b0acdc2c34fdec248a20fa69e8b13261c819907e","systems":["Windows"]},{"id":"e2fbaf851b8aab731cdabdb4179901177cacbc3fe908aefe94e9dd10d1945e70","systems":["Windows"]},{"id":"eb7c01e3ef2cb7665d9b38192b7a8154add25d1e1e9a5696a6ad82aee8d6adb6","systems":["Android"]},{"id":"f0a6a9d0bdbf6c712a76dcc49e123a09d2bca6c84d83285457dc046a6bfb647d","systems":["Mac"]},{"id":"f0bffd95c6408773288f711849e135a4915f5f6ce47b53b41beb420015727c20","systems":["Windows"]},{"id":"f702543f34b6ffe4e824d260adeb6778b9debd226497c965ca9f3ef0d5efdab4","systems":["Mac"]},{"id":"f9768ad6dd2c80d764304778a59e91930cba75db8352c22e1170acb624ff4e42","systems":["Linux","Windows"]},{"id":"fc413e9e60622d25ca3d3fce3ea21f0577aea67e7ebc9c19f7f5413911155e44","systems":["Linux","Windows"]}],"Safari 14":[{"id":"0400288a311a02551c4ca10fe4ac2460bcfdbb1dba1e14ccab62c6a01678695e","systems":["iPhone"]},{"id":"0a801bd292a4a3d387968abae49a13f68ce188b201cf0c744bb663c29a2d14d8","systems":["iPhone"]},{"id":"0b7ca0672d426c7a8222196b58619d3626ead43f10684f047b5f0ce828cc333d","systems":["iPhone"]},{"id":"0c203ac8eabbbab4f3ea34f3a24735bd5f0988253ded172db69292296cb3349d","systems":["Mac"]},{"id":"0c255192c72dc63b430f167ca3a143dceeb22391add2129aee7069cab1b9ee63","systems":["iPhone"]},{"id":"110e52f2604c3c84f715c80966493be660ed58ca4068e57bb36dbec94cb4da5b","systems":["iPhone"]},{"id":"11a4ef09e6aa3d27b05a9da5a37ed22c7cdb5fca77b80eb8df860802a4586a65","systems":["iPhone"]},{"id":"159f8603077c039090fba4c58d2fcfc037b4fc23e2f2b23cc7c89b330ca4b20c","systems":["iPhone"]},{"id":"1aae7ecdba0d399d3c3ceadacbacae7badf82ce3c101d57414a94552040fd67c","systems":["Mac","iPad"]},{"id":"1ad9938fca504bf907de254a974db3c4d3e3ff269126eed8590093fbbcc7f726","systems":["Mac"]},{"id":"20ce78e4f80feb5db36b52bfc2e46f81b0b7a1d51beb02d0738460a37b2d3e7d","systems":["iPhone"]},{"id":"2711a40e59e9de885056f53140731c34d915f32ebad0d901eeea967b1de374f7","systems":["iPhone"]},{"id":"272dbc1a4d6391bf82a629fa4f236a8a488f61b54fedb0a7e8c5509ace5c782f","systems":["Mac"]},{"id":"287881145e6ca8f6557d72a7c8d28b21f11b9109facf90803afe20913aefe073","systems":["Mac"]},{"id":"29dc9e13147776d19843a206afae50eb12626c1be4ca935b79a50bd80e84ca9d","systems":["Mac"]},{"id":"2b655a5c75b7636fa15244668fab186d976783751a9daa6335f4ea6523234f21","systems":["Mac"]},{"id":"3785d4eca03c1280e4ed14c01b229b09194d121b5152a1182ee7039b4b0b8ec0","systems":["iPhone"]},{"id":"383e98542a3f6fc51e4e5a52da96b775c383db966d63f85f4028e3e3417e4c0f","systems":["Mac"]},{"id":"38da35666bebcb7612a7762adc68a3dbe89b0147ff2a718b963414d96b1fc713","systems":["Mac"]},{"id":"3d6bd0bef7fa5a68b8ac26e6f5fc36d0caffc2e40a485b8252256b2e206a9884","systems":["Mac"]},{"id":"3f492a5700a5b11e1c125ac13e1bd0fcd7029919fdce8b508a44f7a6fe757e24","systems":["iPhone"]},{"id":"49fff8c049ace3db2030902ada1bcad38a76b4e7ff737f2dd33f5bb484dbb510","systems":["Mac"]},{"id":"536cb5078e9ea4532f2c9b8aae02a6c1b170bea4c9911a19f2d1ef9fd225f83e","systems":["iPhone"]},{"id":"55ce08ebcaba68f975d6320aac94944cf788c7be26eadf2464ecf4f28ffa3f3e","systems":["Mac"]},{"id":"5afe24985becc12a7c7fcb126253eb65df81d06a9cfe3c94c928b9db4fba9536","systems":["iPhone"]},{"id":"5f18f05d2a13053198125ff12d71b5a913074b53cb4b578f9cc15c5f050c41c7","systems":["Mac"]},{"id":"619fccfbb23ce7e17a96207ce8a8e508cd24f636d864851021ecad7141611996","systems":["iPhone"]},{"id":"62df64b49d9a6d678b8130ff64ccc9e3ac9b677fd6a8c50b22fed8f5b480c991","systems":["iPhone"]},{"id":"69e5784504c7b395545f1d32026d39917a5af87001f68f04544c28c2f07d238b","systems":["iPhone"]},{"id":"72f055f93c7eaad14e861472aeac0b233dbaaedf8088a5e1530631ca1404cefe","systems":["iPhone"]},{"id":"7511b2d50b907a6765a7bb659054d2b0263dbc2d995da94444ded32e4330483c","systems":["iPhone"]},{"id":"78eb2bf0f45c2cb142c77f6d0ee4ed10c7ce690d7d32c6700729ed36522c7046","systems":["iPhone"]},{"id":"7caba8d47cbb385eef9603e99b83603dd620ff8b8749b61ccd960d42f3382f72","systems":["Mac"]},{"id":"7d75c37090f2e84c9ba45de315c2178aa0fd957dd5674f0bf380eba5a9340434","systems":["iPhone"]},{"id":"80de824bc6523ea74b0f8e216d43e4877f67d5134a300d316134917c6e5040f7","systems":["iPhone"]},{"id":"868df43c443acf98a9a66959c18e91be1588206c97413097cc0c546caa55e060","systems":["iPhone"]},{"id":"8a7cce0cbf79a91b93af804b0595cb1ed390e915ae3d89568ca6d7e2d7a368d8","systems":["Mac"]},{"id":"8d9b80538bdc4398a3c90d1eb6e403c37505fa50fe873df76e4b3e4c4ec3987c","systems":["iPhone"]},{"id":"934e4e56cd3d440f4f6a3dc9abce96bd851d74910fe37cdd1cb4e70eca837eaa","systems":["Mac"]},{"id":"9429e7c2285f1c520ed808a57998c176e85673ec3c1cc53280aba86b5f0da53c","systems":["Mac"]},{"id":"975daa155f6d3f5f20cd30b71dd85e6735462d1dc48dcbd148a6656d86417237","systems":["Mac"]},{"id":"9815de3498b56b2cfe8a576ab566a4a5ad7e6bb2c45b230e7f5a52c53596b53e","systems":["Mac"]},{"id":"9b394cb343a0998198c8aa65a52fb5678562a75c71f3aa87afe8a315d6431aa5","systems":["iPhone"]},{"id":"9d54d16a22b92fe28e3850e5e613cc8d52058db82656f93fa54600969a122a1d","systems":["iPhone"]},{"id":"9eb4954c76b2478995731d3ef4bc58c9ee1fa67da47414d69ff0f6d201845efe","systems":["iPhone"]},{"id":"a4fce0080b7f3750924ecb225259317580156810f149cfbf475ee52e768d7153","systems":["iPhone"]},{"id":"a6f3fd5bbde95d4b58f85ac3b79d5109c438bb80fc49d5c4537817ce4d415f29","systems":["iPhone"]},{"id":"abec7e9d492524e056fdc7fb5c54f7a075a4281c5972262bc2d043e1f7e4128b","systems":["iPhone"]},{"id":"b505b10b0313158221b3299f3799ffedf76d830e1262d7a9c620e475f69e0487","systems":["iPhone"]},{"id":"b529a7622319a416d85342fc669f04f540cd91daf7ff372200991e78eb95b5e2","systems":["iPhone"]},{"id":"b816f6448c8048bb2de239a44e47989bee3c693759f19b8d39273ae9e9a3713d","systems":["iPhone"]},{"id":"b908b8994409674089e7a0be0b2c85d6241ba897411821377393267a81f86c00","systems":["iPhone"]},{"id":"bc62b64429eedd038e0f68828f4a51f1f0f53bd441b342c320fe83760bb59c84","systems":["iPhone"]},{"id":"bed5dc513c21a9d565126bafc83d93843a6098e962af6deb7134ef88638369a9","systems":["iPhone"]},{"id":"c0f108c9acc3d7d5ceab10e9cac346ce31b1750c96b33dc8308e41bcbf734265","systems":["iPhone"]},{"id":"c87fec30ff2601ce22c7102acacb3d3156d788d7d53237395ea73eb137d5598c","systems":["Mac"]},{"id":"c8e38cbd56790af580e1ef5ddd97c72db15c6e291be393c2b67d3b7a9ac6e84e","systems":["iPad"]},{"id":"ca2b9b66d1ddde6944aa9fd93ec55f90afd8df0420eb70aff3f8db21b8cd9327","systems":["iPad","iPhone"]},{"id":"d04f8db36e44b298295b121d06926c9bb7c816ad49b2c361a41ac743b50174ee","systems":["iPhone"]},{"id":"d06d0c583de58a882052a4a12ed3be298f033caeb63edf70898015ba17bca129","systems":["iPhone"]},{"id":"d247b3388ad8a94066d2e4549329b90185941cf7d55994ff8cbbfb36d5afd4f6","systems":["Mac"]},{"id":"d87b7cc3b2ed9de61b1d3e1a332c90464f6a654fbbe904e9710a9e5194801592","systems":["Mac"]},{"id":"d9fdb2de8f00b7714a6dc6dc017740d4dab3726a11c3bc992ee6b6b4d2614a18","systems":["iPhone"]},{"id":"da2417884fd57b32c4c5ad142b7a6f9223435601cae07e782db087a5ab82ead8","systems":["iPhone"]},{"id":"db5c5261df4491636bcc44175b19ce3a96b43b70d2cd510c89523ce75b4d2eac","systems":["Mac"]},{"id":"dc9b03d14958b7ccbde204358770097fdd61e71742d24684a82b68861c056ab9","systems":["iPhone"]},{"id":"ddfd810356fdfdd2f409935f735dd454c0c406dea880b17ded5df19844ce04c6","systems":["iPhone"]},{"id":"e067b7385585953d671e51a30a5c61efdc8f7e5d0d99086f06f8580f894bca1e","systems":["Mac"]},{"id":"efb1157f59dbe0052b4a67e28c480cb809b94bf62cf75b7f5f1cdeab27b4e419","systems":["iPhone"]},{"id":"f1b1c04eb3fbe4e3f4aa97c247e2ea40a8042bac75b3911b83fe004de8dece41","systems":["iPhone"]},{"id":"f2c556e6dcbb17179272cd5e98f80a8cf568273f4a29917e19bda5ccb6203a59","systems":["iPhone"]},{"id":"faaac3ad128eae7439a5d5977dd8935b6c76df555dbc80e18a05f8800738ca1d","systems":["iPhone"]},{"id":"fbcda4d990d7cc20e641be9c70fe2de4c3a30f3762918fb9ed3dc2493ea68482","systems":["Mac"]},{"id":"fcf47f06c94469b898e26baef7d07bb0c5d61f2c4b0436d4736351b0ce3d105e","systems":["Mac","iPhone"]}],"PaleMoon 29":[{"id":"04f676e0ffce9ebfe49b7a952cfabebb7a536217b8d09a6b418f0ad4c3cd8d9c","systems":["Windows"]},{"id":"5371aa6fe8b0534d83388736c4617fc7efbe2078a3024acd16a5c1d7bb9e92bf","systems":["Windows"]},{"id":"73cde9ee0f2e420480ce3dbbf612e4716ead7e48234ca57813776ca19ac942b6","systems":["Windows"]}],"Firefox 84":[{"id":"0550a1ef5bb4e5c05f37c907b0ecbb17ccb6ad4731288a408a404c71ac19c2a6","systems":["Linux"]},{"id":"170a18021621ad8c67d163667bf96715c795f31e5b1e2f041aa67be5adc2c88b","systems":["Windows"]},{"id":"1b12b289153b3ad373b35fcbaa04491aeaaa5ca025deef7e08c9365375af3fd5","systems":["Windows"]},{"id":"3a6b14fa407230625c516ad5fb73fe966232b0907251d7d65bd814da1f9dae34","systems":["Mac"]},{"id":"4db4fc63e98b72bc10ac052cde2f1beef7ada90f96962422f390e4fb3f39543c","systems":["Windows"]},{"id":"5a480c192bcb68cf6c6cc845285d110d3af611943a6f17bd656fefbfdee1f032","systems":["Android"]},{"id":"96bf5c0f015dbda2e0771dc6e641263aa9b201885d9515c503347149c6b37281","systems":["Windows"]},{"id":"99b1fee83727cc7f3d548f0d1991c6d969ec061c986723368724d3cd3695e85a","systems":["Windows"]},{"id":"bdf567d4e4ee54ebb3770cee1f00dcd76ba4edb90cb2e3c8f1d96dd0f8c5f24b","systems":["Linux"]},{"id":"d992136764ee0c7ffa6ce6e9901b5929ad33a3ad3010b3112e845d3a7609712f","systems":["Windows"]},{"id":"df018a9706297edf334079d9493f02dc6a94d0c98882589583c68f695c002e8d","systems":["Windows"]}],"Chrome 84":[{"id":"06f7f6015d399e3f3fadfaa5a9464f26bc4714168335883c6a1cc66357a9f6f0","systems":["Android"]},{"id":"0a2d31204bce358d650f2cc6aa20d9d4f468bedc59b6449a5c4257b6419d3321","systems":["Chrome OS"]},{"id":"0c08ee38b32b8847c260dd934db38c2b19494aea74dfca3713750b3d6d83166a","systems":["Windows"]},{"id":"0ce847b5ff701f9c464273f5573b1d824a8656f4c166730fec44cef1466938ee","systems":["Android"]},{"id":"0ed1b471fe94a8b9d46debff76876c3b4eade919e6a367782fcc49ec14e51824","systems":["Chrome OS"]},{"id":"109e58c3e81a7bd10e6f759332d2efc5a36fee555a2a731425d6c743bcb13902","systems":["Windows"]},{"id":"12ac28725936dc82f768c022b21e3feedb86da181e0403fee6f03ffdcde8f8e3","systems":["Windows"]},{"id":"1ea2cc9181c0b98806b598a6725c904428a2576c4a1d2720e23c0d3b95a5ed77","systems":["Chrome OS"]},{"id":"254eab9e26d6b861e0fcc9eb57e4bc34e1f60613be00e35a18d4cc39a85caf2b","systems":["Windows"]},{"id":"2da55f00b894c29d535ec9439d4003b715b587accdf1b84c6240b8d1c9d0df76","systems":["Windows"]},{"id":"302d08c61b896f43c9f2e675b15d0897dc3a4c398fcc6cbfb8d3924ab8da7513","systems":["Android"]},{"id":"35b85b52d6a18a85c9347670e61f2055c4d92c4eeb26e097e14e2cce0c25025a","systems":["Windows"]},{"id":"3733a341e7e6b8255ff2e2bd97bf99ef23c186e81fe2c66a12a5648e59599f1f","systems":["Windows"]},{"id":"385db7c506091cbf937cc4cd8b6b3caa0268e3fcc235014c88754ff3a8bad90a","systems":["Windows"]},{"id":"3a94a09e2a0af2ed5ec65ed2c0f63ade9e28ecc7bb9c49dfdeafbde1024c242c","systems":["Mac"]},{"id":"3d3065023c14e1d749cfe9cdcdb19662df57fddf22e7eafc7c704bae9aacf6fa","systems":["Windows"]},{"id":"4415b751a33accdcaf398969887c4979756a5c22fb306811512e98564becec2d","systems":["Android"]},{"id":"44e134f02c0ecba1bb7bf361cceffe586f5ceeb495ec8245015f44a795416d02","systems":["Windows"]},{"id":"53d292de4f5c3def54bee4f5f903fcf4efcac554128378d1cedc881ceb7c5f97","systems":["Windows"]},{"id":"5433075f5ffb7aa205c6a6f55980153be2a2b983615134beccd59c4078f5af98","systems":["Windows"]},{"id":"5beef4e583e6f755ae1d7d9d979036ee3f1bf8969841a29c4cedb1723f390035","systems":["Windows"]},{"id":"63ecbdb70e68e6d25ceffcc95cd4d42178f55e8f866e2b0a57875b1c09feaffc","systems":["Chrome OS"]},{"id":"67dc529f20ed372c32fa64bfea32cb0b758c2f05fa55cd3bc747f7e552229e1f","systems":["Windows"]},{"id":"6d2fed8bcc7a958177f8f4212a6e21c14468ef98f67dde452b2f784d8dedcfda","systems":["Windows"]},{"id":"735c3db17ede66d6587b8eafbec8d92df78a729e1683c283197132cccabde218","systems":["Windows"]},{"id":"7524bbba75193216591759b5a189d34628770e46432d8f2a9cb48580de74c767","systems":["Windows"]},{"id":"778e80617fd01fb281d29aff22a2ca216e0102c362899387b5c1527279deecec","systems":["Windows"]},{"id":"7ac677f315e2d25d828f3c53190591e3c4538838052c86f2543e37c6fb393a37","systems":["Windows"]},{"id":"87cb778e4b1bca8930f678c3db0101ea8fd4a7522cc028c8a50b18a6507e0428","systems":["Windows"]},{"id":"8c6aa4766fe1edf62d2e62aaea0aa3abafdd1d2337e7c2822b7a1912382239c4","systems":["Windows"]},{"id":"9293d9145d5a84c0f6bbe820e4e6f616964cf1ba904068b13c8dc0006fb1f65a","systems":["Windows"]},{"id":"9a19e70c058521217404466659c221b0344500a7f12c864a1fc42d337cb05a1a","systems":["Windows"]},{"id":"a310f968cbf4f59663bbbe23ac73c6beef248b9f79b98441d029e6e8fbc79321","systems":["Windows"]},{"id":"a3acc85f6a507d84d044eb5206aa6c7036e93af1fd11ca8e2673b4ae653b76fb","systems":["Windows"]},{"id":"a6c0dc7d909362607aa93bd4e9d303ad29e6c83c1f565855a762d9adcc9d63c0","systems":["Chrome OS"]},{"id":"ab55bcefac25c2500cd83550a96322e433f00c9eca1d20f4a1c7f6955ffa562f","systems":["Chrome OS"]},{"id":"ae485173bfadcb5032f1037e4f3bfa720b35e54307152ce02028d84a326487f8","systems":["Windows"]},{"id":"b5f6fe7a2cd8a7156990b0b007789c47353fdfdd34edf2d74b464cd44ba875cb","systems":["Windows"]},{"id":"c304a9122edada1abfea090cbd12233e64dd03c00bad7b97d7bcee9c6b889e5e","systems":["Windows"]},{"id":"c3fbd3be0abef252f292e250250d1b3c9e25f7e8a75666a3da987894bc24c08e","systems":["Windows"]},{"id":"c50c917a790dfc150c6d1495758fe80f41604fd39a440234b82f054f81a9cba9","systems":["Chrome OS"]},{"id":"cb86f59f0e926fbd60b3888514d02b9553f0488c63da4252a0cb86a9650d9916","systems":["Windows"]},{"id":"cd46e0509fc240ea431d19a4f7e319ba1a88e9fcf29afa93dda14fe0b8e23ad1","systems":["Windows"]},{"id":"dd1fa8e0e3f3d00226b4ee7de72b448e0840f2127978f37dcb0beb712e4dcd6c","systems":["Windows"]},{"id":"de6b5ffc1fa6ebe3cc829b9751a439d329e8e101009d7a998b583ea57a5db2e8","systems":["Windows"]},{"id":"de9a9494bf625b34aa4ffd6bf5dae668495db79ad6d44af48955e99450629e2a","systems":["Windows"]},{"id":"e1a1c30f5815b202aaa7c979cf748fdb271d1f1d788ffa22c68772c2698a7d06","systems":["Windows"]},{"id":"e1e47a02193908a50ab1407dd6ef1f1e9723480cacbfbf07a006bd2e152c0fb6","systems":["Chrome OS"]},{"id":"e44e6a8b41cbec6d9b1371ce23f08b157c0e11f27b28ac03b30fbf7a48da4796","systems":["Windows"]},{"id":"e4734b3305012946804a47bf088d9c5e0b3ab5a5ed9d3d8384d1b1d4e0dcddb7","systems":["Android","Windows"]}],"Chrome 85":[{"id":"0714197f2eb3bd1d096075599aab8380e145393f1a0219b2263eac6c691c5f1c","systems":["Windows"]},{"id":"0d8043c14f28c688e1ea457019fb9b630466d6b3fef013e70d8aacfe0f9492b1","systems":["Linux"]},{"id":"0e3055d9ed0a9968809f47496372fc761348b528328c2b60bc11160a8845e45c","systems":["Windows"]},{"id":"2caa29771d46909c47bebb4aad3b2ff6b7e6b6062ad5561a6ac1e197ba577a55","systems":["Windows"]},{"id":"36d7bc87658f3435679a4758917e2f6b85964a7a870d96f1c6d1f0612b367f90","systems":["Windows"]},{"id":"5174f65899653eb849ec8945406de0630fc429c42d99b48374c9aec215ee09ed","systems":["Windows"]},{"id":"577825abd50957fec07390b0785d44d00a53cae86873657eb20eec569145177e","systems":["Windows"]},{"id":"59e07d21886a1a07c531ce8fa06babd11a3018ec49b933fb3b763648eccdb1e6","systems":["Windows"]},{"id":"63e308647004d3b001d9af993cf8e371ea866e0251741661734dd490b0e64564","systems":["Windows"]},{"id":"6b0f3ca5cbdfae0e6e7318f57bca5ae206452869765d6a467ecb73c1267b1a51","systems":["Windows"]},{"id":"8e9e0494314e3aacfabe04884f620b3ddabdf3ef09a1d409299858a56ae33141","systems":["Windows"]},{"id":"93f97bdd24d86cfd72953eda1b58adf270823da2a1dbf0c41fb6da7bb777d8b4","systems":["Windows"]},{"id":"9e73be144e67f7da4f3b03594ae5dfa9353b0cda2e64d9affcf37d207198d864","systems":["Windows"]},{"id":"a6d0ff447b06a68699f6783f7eccd16ab1dbd3d2dd3aa8c1d1463c6d58afe47a","systems":["Windows"]},{"id":"a92c405f057329d265c31569600d1b39ee357e11e9e2e013d00377f81591880f","systems":["Android"]},{"id":"abbc713d6f35dfc488ad8d50f732db4e4d19785a911852f65dcf22db9e93a283","systems":["Windows"]},{"id":"b1c42b0fcb1d8b5ffb8adf84e4e88a24c060c434946cbcc854163a3c9d235320","systems":["Linux"]},{"id":"b5570fe630c3049eb315000629ff66570d9cdcd6f1929b6c645c04fac7b52fcb","systems":["Windows"]},{"id":"b9baa5e244faa5f45a900881358820d1b9566c24e1be3139530a5f399c8071fb","systems":["Windows"]},{"id":"c671f8e55b5718eea95c114225fff9240394ad4ae1595d9a2fc47457a530f59d","systems":["Windows"]},{"id":"cc33138ff73327d671824d5c4ef515b59f7251f6f2413bcf964ce9fb8205cc2c","systems":["Windows"]},{"id":"d028b08a936aecfc3c8bf6cb61ebdee14bcb8f7539d28b2b6fac5c05cd746189","systems":["Windows"]},{"id":"d4fdc24b274df2449d39e99524e7b98288e07adbb6d26b39fde78f1c48480157","systems":["Windows"]},{"id":"e8a92ebd376e3fd2a0d1634da2ddae6bb370cb56c8c53778ff641352be15acb7","systems":["Windows"]},{"id":"e9043117719e404d3bc6ebbf3caeab8eae58430adcfe1399d1b333b5dc26f921","systems":["Android"]},{"id":"f5268ed66b709ea13bc6f50ae423943b4ed22ca5138811dcdff7fc0260c1176d","systems":["Windows"]},{"id":"fecdc035b0d3e4341cba7515787f5a367a6172d7045ccdcf7c227bb0c2ac7ec2","systems":["Windows"]},{"id":"ff2c0129cbb2efc784560631ffb361ca2ef449b7aaf31c7fe7289ea2848ea81d","systems":["Linux","Windows"]}],"FxiOS 30":[{"id":"09532a37027b20b0f4ff290accf06c0e7158b2ec743343194c62e92899e0d99b","systems":["iPhone"]},{"id":"24462b19572198c79da97229a34d65ff98c12f19817ca1854dbcc27d06644c7e","systems":["iPhone"]}],"Chrome 87":[{"id":"09fd130a56364f16154453d35a955dc526f82af5cb696843eac6681fd24be2f2","systems":["Android"]},{"id":"218171cee9a5fe7ed0ec7c7ebb2c8551b2ebe28515cfafc3798566b8be4b0e46","systems":["Linux"]},{"id":"3f4b4bc3ad2a4086daa89352ffe54e678da9b952432d5e58b06ca6e5c9a466c6","systems":["Linux","Windows"]},{"id":"41e834cfd0dd73a40fbbb87ce15ec2e398efec2c563ebed5756b24ae00376e56","systems":["Mac","Windows"]},{"id":"5ae50e4d5650c18bcdef1cf365557274b2838732bc12c4fdff7ca6fac4807bd3","systems":["Windows"]},{"id":"6343ee8142486dad267e1b40be65f3a78c1bbcd4a2dd6de3cc1002e42c57af13","systems":["Android"]},{"id":"695948eca713f52c0b63316abac71114b33f96ac4e958b04808df5183b42b3c6","systems":["Windows"]},{"id":"6a2ac00bd8b21c37ffb48615be8c1939f44f114c60820edd214104bb05c32630","systems":["Windows"]},{"id":"6fcd5678bfd207ca4855d61820fb03d70e665f5fd5490f57d8ac1d3322083597","systems":["Android"]},{"id":"7272926b34270a34ba4feee0aabed8294a9589a381221821fa083f8d12e5250a","systems":["Linux"]},{"id":"7e56198eb9d23253d49228a9be996d876d7f4cb6566f7a0a98aa71e4534a5be0","systems":["Linux","Windows"]},{"id":"80d75cdf96d763836e0f7647bbaad7d78979bed23b5394c0303692ce7ce9a1c6","systems":["Windows"]},{"id":"874a77115fd16b79be49c4fe0ae9c5d43070ef5b58321d3e943bc80e1516a24b","systems":["Android"]},{"id":"8bb0c7d368bf3e9595ae3bcd1e6f94bc823110a52ab64fb5f62154c26c8d1b64","systems":["Android"]},{"id":"8c418115842c3b320d05c9e18c7217d433df66203d2216761b5cc24454ad4513","systems":["Linux","Mac","Windows"]},{"id":"8fd057fb7e79e1beac61d88a21e87ed57c31b2f5e5932f1108b71fabff791c3b","systems":["Chrome OS","Windows"]},{"id":"a55c0b14358701d90051651f121720be9244f9c99a7821741b879debab3e6e41","systems":["Linux"]},{"id":"a6ad33da243584925b252d14944b25acb9141fa41428737b4754d0e7b7c690d3","systems":["Linux"]},{"id":"a6bd54dc3b67623e3d5f0165ca8d885622dee15e3fa680d885f3536fdf6fd72e","systems":["Windows"]},{"id":"a7bb241546ee251d31028b3fa71ab7b75b6682cdd9527c820509ed4caea4cce6","systems":["Linux"]},{"id":"a8672caf00d1ad316a962bdf0884e5bba1c71dee8f239239929895a91e09a6cb","systems":["Windows"]},{"id":"bf7c2723815f13cc854f5635b28c181086537e6bc953e68e5b911289fd125a61","systems":["Mac","Windows"]},{"id":"c17d2609ba556bfa3c2cd04f178fc9c508813026852724570d528c8d28283147","systems":["Windows"]},{"id":"c81119a1acebe19dd8ea2af6af475e8feb3eb41fc0be0a33b28b02a6d21143fa","systems":["Windows"]},{"id":"cadf3edcbcce27d93628b8c4935365dd4f76008bb70e450f8fd8049fe3fb7434","systems":["Android"]},{"id":"d6913328ef76524bf52fddd3f6be1f5d44f2e5312d9adc482b150352ef73ffa8","systems":["Android"]},{"id":"decbcfb9bfd107c04d63514d8b634c938e18cce890dc0fc2cf9ab40127cabc91","systems":["Android"]},{"id":"deea2cb576670722c73c57c97b94634c4fdc40e781d474a2e29ba4d95aa9a91d","systems":["Android"]},{"id":"eb03d568c4497d5e3479c37b12d5fc3ce9da1c374357b6e4d4d2271c96faa4e9","systems":["Mac"]},{"id":"f751519d41adb7c3392aae7a88728348c44ffcf8b1db4c3a39eb3b8160b3e406","systems":["Android"]},{"id":"fa2af0170f4b3b6ae96b89e41042f4d6b8764143de0a5333500f7417af274afc","systems":["Windows"]},{"id":"fee18d9d62382975b23cbd8ae20ea89fa907b3317b49620a4b477e8382d7bbd7","systems":["Linux"]}],"CriOS 86":[{"id":"0af9602f629bad3b4a3f50d4a50a876190ef4b093c09d4b8e71098a7df6915e2","systems":["iPad","iPhone"]},{"id":"8676c0396d2a7cf3ea8a23f283175144ea228c747323a6a815fb04b312a6bdd2","systems":["iPhone"]},{"id":"9e4004f72b95df91ad7e46ad8283bd0d5031340600d7aa9f1faf5eac1aba1278","systems":["iPhone"]},{"id":"a7f85d89eee85d604013a013789915eb73ff9b7e61f8fee99d1d4bac7d92d7f2","systems":["iPhone"]},{"id":"e6c7272441bbdb08c4972f9345db6de14678435e82431506c2ee553cc0825423","systems":["iPad"]}],"Firefox 82":[{"id":"0bc862aef3a8f5270b38865f3e3257781b65ef1e087a44908aa8a429abad8cf2","systems":["Windows"]},{"id":"0d0b75b393e712f0392c59905e429494cd7fcac425f6db0acb1462b6086db838","systems":["Mac"]},{"id":"2549388b29c3f31740a5df79acc4c3152c3567dced15cede1d87c90e6a28b479","systems":["Windows"]},{"id":"4bef90ee274ef8ae6189c641c6e30bb8454bd6becc9147a3a99fde9da8866b5a","systems":["Windows"]},{"id":"98c592a4d8c9f60a1baa1a7ca412744fd2c7e83a060ff5b3892fccc9fff6988e","systems":["Linux"]},{"id":"9f9ae445f1dec399761e122dff1245cb11fdefaa7a054d4fd25439bad6e3f3b7","systems":["Mac"]},{"id":"a64a299bfd186c34013f4f8064b02ecc71157d70d5ff69b1d12580a7929e9461","systems":["Mac"]},{"id":"d0f147c0b9adb7640118953d50bf60006338504d3fba17654da22a3d83d0c760","systems":["Mac"]},{"id":"d41e2d8f0525a6659fe2fead4cac14be8e710ba85ba85cb74aa2f0459e451a5d","systems":["Mac"]},{"id":"d5fc7cad8c83052379d5f8720f9ed1dc95417d7dc73c7f1d03472a7a627a8161","systems":["Mac"]},{"id":"fb10804c1a566813118fc9aa37ab45f2fd83a8d35017d69bf0fa3edd6becfd7c","systems":["Mac"]},{"id":"fca4122bdcbeac5a516579c9977977dd2125e2285d75eff8db7cab6de02b73e2","systems":["Mac"]}],"Chrome 92":[{"id":"0cf36e90166e2561cd48d584e63699d59dd4d316826b033194c30fcb56e4585b","systems":["Linux"]},{"id":"2d906342e28218f7763d20826843ddcd97d548e5ff6551964042f7a216ebe438","systems":["Linux"]},{"id":"3053c32e2fe9837bb3361b33ffdc513eee0e7f7fe7050c2ce206a0dd2237cf91","systems":["Windows"]},{"id":"3605ca5d489e3191f28bb16782454e99585dceade229f37ca5d407f07b3b89f4","systems":["Windows"]},{"id":"46c6049ace4637b3b35254f0e8108d423680595b825a017c364c69219aa5b91c","systems":["Mac"]},{"id":"4a1d057ff00657e7b7529c55b6739e984880c4f21097dd47f5ed76418864dd11","systems":["Mac"]},{"id":"6330fd6f1f692b4d9c8afd7f2857aefcd14a3614c0379b1d2fc649d82a43fa2b","systems":["Windows"]},{"id":"718e0d092d766452317d2842b8f384f0d05f56e23dcb8b02a64d1ca2d9027ea3","systems":["Mac"]},{"id":"8d32f5f911b2c56161f92b07370cd48824aacf8a07f818b01af1c3a87dbc07b0","systems":["Linux"]},{"id":"c9defe73cb7df7c3c4ce6994baf82729bc6eaf1e41266a539d8ebc37769dfde7","systems":["Windows"]},{"id":"f11d78c7d643d833026b7e2d0a31849852bd10dc75e14b60aa928c5f50799c4e","systems":["Mac"]},{"id":"f4e2c1196b97a8ad38d3241413b8edf21760f9791a637e32807dc616759cb320","systems":["Windows"]},{"id":"fb0016b88b9786c56c2467390e6966d503631f32cb17869a238777da8c025ee9","systems":["Windows"]}],"Chrome 87 Opera":[{"id":"0da39efa25a50e98e06c55abb0a6944fe9801eaed36718cb27e08acaf624d634","systems":["Android"]},{"id":"42a85c0ff535e50f8d984dbd567fe1d0d697b1ee53f4435aa9953e7e4c9f0be2","systems":["Windows"]},{"id":"c63f4bada2f049792ed5deb753b1106ba37bddf3dd34c62f69b4f3deb0f3a16c","systems":["Windows"]},{"id":"d4a2c0ef5af87ac5bf7d2b8cad3e4402c7fc17284b0744951fc95e060db92b75","systems":["Android"]}],"Safari 13":[{"id":"0efbfcb80dda6db19be3597810e2a7351565b80b03338e28a4001e03846ed308","systems":["Mac"]},{"id":"102398a842ef40310b286fe0e72505b7d6c5ce7205e62e5b7fc85f97e75498ad","systems":["Mac"]},{"id":"11236c14214b45984ed6a33f45d169d1c6f15ee18e81aa92e1ca5f34031d22a0","systems":["Mac"]},{"id":"12b38421eead0532216d91b498e55f5f3381b465d76ce32c096d704d14d3ef3e","systems":["Mac"]},{"id":"2008cffbd4c40c901f4692ab1e226501b5124b941b93bc6739f1bf7c17453b71","systems":["iPhone"]},{"id":"2716cd5bf55f81fc1a39409dbed33f7ba8536732801c481b68ed75e37847b95a","systems":["iPhone"]},{"id":"280a984acdc69fc3565a86a34f6eabb5de0ff6a2c63d78268ca95a7f08110b11","systems":["iPhone"]},{"id":"3f9ea4792fbccaf2fa03bd78220371e61f87ee78c8d7f680c397b24e85133388","systems":["Mac"]},{"id":"42aba5b632397a421f10c9531e61cab3b6aaa53fbc26f189bf0e8aafc91e9ddc","systems":["Mac"]},{"id":"5478c6342b720e48e582e78a85ea426c8a6dfc02dbda252d320aa7707b76ee68","systems":["Mac"]},{"id":"85f9ad51649f223ec75ec067363e1994bd3748f171a4d0f78f60165bdc37188e","systems":["Mac"]},{"id":"881380b9f5e54a5d9edf1287c5f9c8142abfc7075098f5b22225f7debee2b0a4","systems":["Mac"]},{"id":"9250e7efd175946b3cf7f819f3772fec3d15fe761920600f14fb1b932a345a99","systems":["iPhone"]},{"id":"a4e45975cb538e3a353c400db61dc99edfaebcba65228d015743068d48ad096d","systems":["iPhone"]},{"id":"e152aa27f4694cd6c92a2b9256c61ccfc2aa358f9162ab2402798fd70c700097","systems":["Mac"]}],"Chrome 83":[{"id":"0fbeda2fbb7e5c4fabca8e01540295cdb88654ee82a39b874c02872e9e61bc3a","systems":["Windows"]},{"id":"14ae8ddd528e8489e6e177077994d504048676ac346ff0b5372158bc97467b6b","systems":["Windows"]},{"id":"1bcc58335d45236725dbff8d13dce93f3d8facd20d0787e93a8072e808aa4cbb","systems":["Windows"]},{"id":"1d01bbb228d522c59c4682223d7d2f44b3b6b537ee829292cc07038ab124a1e1","systems":["Mac","Windows"]},{"id":"24b5fcbc71259260aa5ce5c752900fd2f91f310382b8b74e401c2379b7d1eaa1","systems":["Windows"]},{"id":"297203442c530d07e07a1d0dfe127a978cd926294627f73fbcdac59268ae6a86","systems":["Linux"]},{"id":"358d7922454f10a6183275805a13e83a6a8cec68cca3deeb9666f80b54651111","systems":["Mac"]},{"id":"361036e7c8a376b2d3030c24173f3055bbe2a0c335a35a9e32d28cb5988c1de4","systems":["Android"]},{"id":"4240ec73c93573bb1d1842a2a66da741ab6694ea54ec838fd353e0d1837c2475","systems":["Linux"]},{"id":"586d78c76bdb95bcbc236e811c0b3bad4dd5fde326589dcd9417efd12460e2cb","systems":["Windows"]},{"id":"5ec2faba377e5513bb4a63ecdbd6bddd861600faf1ceefadc61f9cf74b3c7a6c","systems":["Android"]},{"id":"67e2e39d69b62a81f99c5decd882e679318358bc8103dab6599117e0e3ed35ff","systems":["Mac","Windows"]},{"id":"71e823d66471156d416ba6474ea1ef46109ac6808932ccdeedfe373de0098129","systems":["Android"]},{"id":"74ebfc9c4268accb5c39bc9e2c8e315bd8745b9d090b1514a81b6302321f2e7b","systems":["Mac"]},{"id":"776a90bfa54addad228f66c3b0034ce8ad852aea0ac4402e079670600aa09971","systems":["Windows"]},{"id":"87a015e12a5f32868cc8dcd91e5be9aeaf7421ffe5916a044350727751548b0c","systems":["Mac"]},{"id":"8cc1d8f4cc5d917234607716105bd170f6311fbc4d4a9438d1445a5a138d703c","systems":["Windows"]},{"id":"98dd54235279b8bdf484a93b2b0518f9d64de696ebef274704fb2ee13db67c1b","systems":["Windows"]},{"id":"a409bd4059f286a39cc56725bd20b442e8c445f8f97d5217e46a023d23a61d8a","systems":["Mac"]},{"id":"b49544bed79c4947466255bb2bbc379813f3e281e50edebedd3c3398fc678da3","systems":["Linux","Mac","Windows"]},{"id":"b7db91a417300aa3ba7044a13d2712b7fbf51cf67291856acef3463b878340c4","systems":["Windows"]},{"id":"c5610b6a8acceda5135729165bc03add83ca7b5e15e2ae25790aa708db21f16d","systems":["Android"]},{"id":"d6f143a825f09606cf3f268ba2455237f95ce0a36aea00c2f0ad6584d07af972","systems":["Mac","Windows"]},{"id":"dba5a2e84c962df16867c330edf2f31fc60c8884f13462858c7161bfa2a6bca6","systems":["Android"]},{"id":"f1ba3cf453fb5bdc761aab21914c5805239acb6f15e2c4ecd55a62a06b93cfaf","systems":["Android"]}],"Chrome 85 Opera":[{"id":"1267e2ec23b3febdab5417654e84eee95b6b8f73275af3e20648a299331acbca","systems":["Mac","Windows"]},{"id":"3e2657aa52a61f2bddc4995c3cc5d72bdf7410e12e45588fc827cdc11e07cb5d","systems":["Windows"]}],"Chrome 89 Opera":[{"id":"16a660b2a68aed53bdc2c8771e6cd8f015eec5db97647d22a7670daf8fff91bd","systems":["Android","Linux"]},{"id":"1e7e4ce2addd0f8d7b8817be00528c882da2dd9e667ba444346d5010ec393576","systems":["Android"]}],"Chrome 90 Brave":[{"id":"173a32baa30cde9adf6861bdf47d7633168a33bd50bc1223be8a80baeb5fa5d9","systems":["Android"]},{"id":"33c4a8d1719c7203a64770d372568720848b6b9118452ef80b92b32d05760b05","systems":["Android"]},{"id":"41b6f6802ef70da701e0dd70317629f997d8654d33ad93f6578cf1c4cb2301a6","systems":["Windows"]},{"id":"4c0779388d945d705bf16b15b93f1b56e0e3cadb545173da70e5be6b97da8fc8","systems":["Mac"]},{"id":"522729957fd5158d925ac74580014d7cfc452d136e6b9fed6b356323b01f0f53","systems":["Mac"]},{"id":"5dfd483d57ca4f666bd0a4e09d2e8645ff53f0218bf693b774caf6ec6e446b8e","systems":["Mac"]},{"id":"8f6e0917c4859b2c7f9a1fab7b88cfd80f76608932f324c73268e01836ecf810","systems":["Android"]},{"id":"962084cffd8ab0463609ecee1fd4b35ec8493ea20e080c6de0a4b1fa1366af45","systems":["Windows"]},{"id":"9771a9e71b027c370e617ec49fe110b42ee86d5c21fdec14d9361f5ac05451aa","systems":["Windows"]},{"id":"c627dbe318f9401b90da7c989d8e13e0c3eb63d1c355d7cc3309fdd4772eaad7","systems":["Windows"]},{"id":"f32eb26ee2cede50f4a51927c6fd67c169da9cba9580ba82588098cfd411bb39","systems":["Linux","Windows"]}],"Chrome 91 Edge":[{"id":"198801b2dc4d437827e5dfc41a82c9c5a97a8154fe346f135e1928251cb78336","systems":["Windows"]},{"id":"42f559d72612d31d0c9c078fcf6f49787f29d795919ad9bcf5a9bb3ef21f5096","systems":["Mac"]},{"id":"524405561c9d90880a0e5e107ff605e02796bba42dbd33cddf3a56f3ce05144a","systems":["Windows"]},{"id":"93808dfa81c5f9a753760e7985f4a66dcd0217eb19da782e27f7879435e9e2ef","systems":["Linux","Windows"]},{"id":"95b603d5b2b5d270061a96c9f92372c3f8c97bbf7003898f51a2be71690cf5d5","systems":["Windows"]},{"id":"ab1593a72c7ec91950c736a1766ee72d1cdf6fece77d2af5c7d09f13dbd99c35","systems":["Windows"]}],"Firefox 81":[{"id":"1af4f49d4db97df426e33d4c1ad2f56d8569a01dd06ab131b39e90d1db0060ec","systems":["Windows"]},{"id":"66fe9cda864e67d58c8dc96211ec1c8dd53c8021c0db2e9e70403a87248a3f60","systems":["Windows"]},{"id":"8ff0874a6dfc5389a64936060215a3d893627f99a9f53757fbd41b52d0ee49d9","systems":["Mac","Windows"]},{"id":"fd4b543e2ff6a1c0bd80422cf65203fe41e26de687b8747526b550d1a2d633ed","systems":["Linux"]}],"Chrome 90 Edge":[{"id":"1af999c3e2e70e5cdbeacffeb9ddeeee27a84e9b2527c945a2f3ac29ba025203","systems":["Windows"]},{"id":"405332dfaa26f7c00df19da08f7844386f81674d7e9e27d11cd8dd4d88d83f83","systems":["Windows"]},{"id":"5c06730dc112b708ffe235eeb9a154c057cc1c6c634d4df17b3917cb98e7f31f","systems":["Linux"]},{"id":"6bf4dc074842d44379c038491ad3a8fbadf965c1907f5d4c9a224446081c933f","systems":["Windows"]},{"id":"7dd4c98899131bd50fb922084f25223d85237f05f6a90fffeee632e7406fbe51","systems":["Mac"]},{"id":"afabcc00a78a3ea986e52c716bf5e209ad0f092012743bed91a98e4b4245feed","systems":["Windows"]},{"id":"b2f79614ef206826abc69404c52b9de95fb3db525e6ca3d6c4d84d55006a6567","systems":["Mac"]},{"id":"bcbc7e471cec553370ef1bdd77be8fc4f2f0535755d81c0a4c5177dcdbc7128f","systems":["Windows"]},{"id":"bd5759774059c5cc09fbd7e925fe87bac7f917cd32a74d2279b4c32c4d1bc314","systems":["Windows"]}],"Firefox 79":[{"id":"1e966acc5d178da87f6feb87039309aebbaaceea70732f4862e61866dbd7d674","systems":["Android"]}],"Chrome 92 Edge":[{"id":"218bbfe5355c2375680dda5ab008f81355d56503cb733cc84f4288fa1acd22d8","systems":["Windows"]},{"id":"f33af673199bbc8eb6de6b85f301abc4cc4dc882644d0b398df8224affa1c797","systems":["Windows"]}],"Chrome 88 Edge":[{"id":"248b393bcf39c635790bf290ec04e541d0fa02d6c622846586a905c90aa2c751","systems":["Windows"]},{"id":"4c14d46977aa0a28055f426a09be1141997eb0745928bbc3e88059ea6bfd718d","systems":["Windows"]},{"id":"bdcb55264c1e6a05dbb2e443db136a58424be345a1889d6731e2be9cebd389af","systems":["Windows"]},{"id":"f338a96cda408c37ee9889071f60a0bf327979e9d217c4bf3490384f9583d26a","systems":["Mac"]}],"unknown":[{"id":"270cdd4d1147bc58327c56dfb724ab380cc65cd70ff82b9d891f54daec4c6397","systems":["Linux"]},{"id":"2783f13b6ac47bde3842aded70c468abcf02894ef08007b6ca0ee2031bdade2d","systems":["Linux"]},{"id":"41a90a0e6bdff117e3f3edc06bf9eedd72a25438f052e42e6f937fc693ea70b2","systems":["Android"]},{"id":"4d071ae8d25d9497708430b3ffd428b6c10d2f27e6fb82d42f0efe55497db5ad","systems":["Windows"]},{"id":"7af58e840fd8a95931354fec7e24005ec782fee10b65e6ceb581a0a0750cf8dc","systems":["iPhone"]},{"id":"7f2bac7e5117ddd9779c8f19ac998db7ff816d6be5c07f621dbdc44fe9f50c6c","systems":["iPhone"]},{"id":"7fb18f87007e29df97dd8c035dff50ca8b60c4da70f1e1c97c04f335327f22f2","systems":["iPad"]},{"id":"8686c8b4d0b2a8f6c77d309696676343110a27fa48a62a8636540246c527e906","systems":["iPhone"]},{"id":"a3ae66e2958bb9afbe03967fbd7f6f28e4369593439cac77786d079a20bb2b00","systems":["Mac"]},{"id":"a8a12fedf7b18d5b2c6df05994be8c131e88414b48e45a394e5a11758c08dc23","systems":["Windows"]},{"id":"cf34cd2f60450ebb763275e56530bc350863e13c10cb50b597ac47206009d970","systems":["iPhone"]},{"id":"de85f1f4988c83e74ab555d2cd9578a08435f7c6dcc4310f92e237a9715a7257","systems":["Linux"]},{"id":"fd1afe3017b1e573332315a7a4387b1ae5179fe61a8c966025a6f19f70ac8163","systems":["Linux"]},{"id":"ff8619a2016227d192edc2c298cb4b3a17a29f46e66f4158d3eac8c580fc3c2a","systems":["Linux"]}],"Chrome 86":[{"id":"2b51198fdafbf96ee71c1f696d56468b10f553f4e67b2cdbed8166895f1e9ec3","systems":["Windows"]},{"id":"590fbe6de998eca358300e1cca49d8e1a9237cfbaaf17c7c9533829365da8fd3","systems":["Windows"]},{"id":"65fcb6418014d633c5a429b7db83e23c03898c93503b879c2814f09477272010","systems":["Mac"]},{"id":"8a59e1e25a8672124c07399a62428623a11efbb761ab0e673902810ccc8842ef","systems":["Android","Linux"]},{"id":"8d2e0bb68ddaff882cc97ed41dd5ae926c0719beda5734c5eb60e84dd7a3c496","systems":["Linux"]},{"id":"8f973153e62a42d4a4ece3eebb5dc85b068a88b44a7152fd711b63cf97db9efc","systems":["Linux","Mac","Windows"]},{"id":"931ecad1db7db64c656bc7bbd830f42958e305e98a7628422fb7193863b4ffc4","systems":["Windows"]},{"id":"944e977b49fc56e4eff2b44ccab08fa88f2f12972e3e7217e9fe44f5bd9b9d75","systems":["Windows"]},{"id":"a2d3915e59a92abf1fa6be66b6d5a2f38756ee5e024a662cdb3342a8eb17cf47","systems":["Linux"]},{"id":"af177d68d1de6b7ee17ffea9262cb8eeef691f8c4c64e47454e5c88d8fece603","systems":["Linux"]},{"id":"b50b9863ff3dac07571c2aadc311fc5e8b887780ac7041bc6144aadee0757006","systems":["Linux","Mac","Other","Windows"]},{"id":"c0f881b06948801b8feb3a1bbee9e97deb0c1c945ada205089aeed884ffa3094","systems":["Windows"]},{"id":"e1229bcee353254064b9332b8cc43bc9038332ace335a931b56a05878401365f","systems":["Windows"]},{"id":"e31a857c883ecabc7210a1ff2f698eaa0a225774d53fa9b6a631c520eae9eda6","systems":["Windows"]},{"id":"f2acb0ea8bb04e03c61a10da74b6623179275dbc547bd87ab7a94b1333d3a39d","systems":["Windows"]},{"id":"f698d7c6f9aadaa55ced41b9877356ae4cadf7b20159ed68861c19185dc7ded7","systems":["Android","Windows"]}],"Chrome 88 Brave":[{"id":"2e497153f602fd1adabbc78f0efb63e623b3ed50d9fa2575cb584d6dbc592367","systems":["Mac"]},{"id":"54976d958043ce7aa54b0405c36c9b4b8867e53b39b3f438daa4809c1005a670","systems":["Android"]},{"id":"a149ef8138405edad9a73d080b60e8c671bd7cc1cbb8d4542a1bd427046b4fb3","systems":["Mac","Windows"]},{"id":"b922081f59a1fea233e67ca595041e7f3341da508a4db64c505033a79c1e9be6","systems":["Windows"]},{"id":"de791e3738c4ff68543985863ef11ab940c068ab2d1b8a531069db6452078294","systems":["Linux"]},{"id":"fb9107b4ba301af773298c070213a9f0043f986c4fa0816f92df52f8325b6223","systems":["Mac"]}],"Firefox 83":[{"id":"32127c614fa361575b2f5b61d06c1ac870a9b6a917d2657f35f7d3e48ac15bfa","systems":["Mac","Windows"]},{"id":"7bb75298dfbca819c02229635e6325aa9e5a9b668379b0f9f0a34e40e75e4ea0","systems":["Windows"]},{"id":"8a2bf7ef145c50e12324f2628dc076c220ed0b92c9dec991fdfc84e9e2521f6c","systems":["Windows"]},{"id":"b12fea03a0c1cdebda47776694a819537df56770e8a10365f975673e29ac5693","systems":["Android"]},{"id":"eda298a363b73471fd353ec8339cbdd7d3bbe72af1e6d9a8f756c4c33b8ad124","systems":["Windows"]}],"CriOS 91":[{"id":"3532e2fda301addc8035a58a7f8643e1fe05a09b849e28e86d29a7aeab72738c","systems":["iPhone"]},{"id":"593c6ebec4e3b46362685124df130040d5b49687ae522a42efc34bade8e8fea3","systems":["iPhone"]}],"Safari 12":[{"id":"3cd16d2f0fd9b5a444e116b7fe509fc53da8360d1b8b591da86ae7594e821131","systems":["Mac"]},{"id":"c945ab457c85f4120b1df013140744835103f78d4ee8268fd1ea726957b0f4a9","systems":["iPhone"]},{"id":"f60d261076f16480d9b4fba72e173e13471d31369f21063219c2a48fd6bbfe0f","systems":["Mac"]}],"Chrome 88 Opera":[{"id":"431e7930b2cb8fc7c04378770ab9887d33af7015dba7afca3a33f59ccdf669d7","systems":["Windows"]},{"id":"71992ea29e3f45dbf830ecb0497ea3c491b6511d8336cf3c5e086f1e699b290c","systems":["Windows"]},{"id":"8bea5f1f84ff0cf8d270455c53fb1a12cf496f814adc0edcc771e20410fdeeb2","systems":["Mac"]},{"id":"d93b63bbd54c70c3f04d3cbec7226fe1d0e41ce059ebdf255a827cd8aa0bb66f","systems":["Windows"]}],"Safari 15":[{"id":"458b0bac44dc9ec836ee983e46304dcf636043d82cb44593c0b8fdf1a6f0bc6b","systems":["Mac"]},{"id":"627046acf71d6fa7ff31e28a307dda24f4093a61512bc84c4da18012ea525f1a","systems":["Mac"]},{"id":"d1b03874df5acb29afcc80de793482acda51979617cd8a0254bd3c2327c19228","systems":["Mac"]}],"Chrome 89 Brave":[{"id":"50dc8bf7f44ecbff5b3c02d901e6a4ffa394d29e094cda5df906183e969e430b","systems":["Windows"]},{"id":"571d046124f24ac20bd220f68f3143524bccc8fcc4418e341d509e5cebfb26be","systems":["Linux"]},{"id":"604cb8b65f30cceb4f9bb69624462888a998cdd426a294bc4e97e98d3f68d7d5","systems":["Mac"]},{"id":"7c7a6aabf978f90d254154d31e4f869893d2adbb2cc6ad6c2792df7092541f3c","systems":["Android"]},{"id":"876b0f1c4ae0bae52c92f667ae7fe0ef4b43cf815d730e99af51fcff58f062b2","systems":["Android"]},{"id":"c0dc257221b6fc64bda4b648beaaaaceb21b1c942d9e7bb24676ad08cca7617a","systems":["Windows"]},{"id":"fe849c102468e8e6762afc8b624ab7cbecbf5c40f88171683914cf809148928d","systems":["Windows"]}],"Chrome 99":[{"id":"59262646ba3c28992c912ac30e5ad834ca7753e7da4ab0b1e683e2362422153a","systems":["Linux"]}],"FxiOS 8":[{"id":"5d0e7f893b4a56f0fd8d91579bce6a32e7a61f5effca62ba298e9d3f1299a5b8","systems":["iPhone"]},{"id":"6b40c5de35d5dfe2317b9de135e62974dba7657b9341eeede3e485bdb7f22086","systems":["iPhone"]}],"Chrome 88 Yandex":[{"id":"5f0677b88e09c14028b8eae13bb5fa38bea5b274041b00098c2d5e6a651eeece","systems":["Windows"]},{"id":"785f48e26e245ae25f216669b0e8143ad9cdeb09d5abc574e842389514f212b2","systems":["Windows"]},{"id":"7c852bdbebcc42cc36d3529f2f2b5ef272476614c62f3daec254d2bd834f3fa1","systems":["Android"]},{"id":"8ce9f2da1f66e05f08f468cd90dd04b2006685d5ee6db33bc79475ac736ea155","systems":["Android"]},{"id":"a287998c2e813bdddfdbab7254c7cef41bca392fa8a82de13d79aa462f192194","systems":["Mac"]}],"Firefox 68":[{"id":"6007425129898bec5b95292c125c55568c0a675165b4b500888d8fcc01661d11","systems":["Windows"]}],"Chrome 90 Yandex":[{"id":"606f715b266dfb39a88f301a6da11ec80f6a6892894581709279982fcc60fce7","systems":["Windows"]},{"id":"f8217af6b398f38b66d1d1ee638322c4c405f5b23f935eb2f53307031a2bad49","systems":["Windows"]}],"Chrome 93":[{"id":"66f8d0d528c29ac2d81c3fa305d63d967a188fb2a2724a88f0a58d1b4ec0f6c1","systems":["Mac"]},{"id":"8f308b7afc3cb5892f8dde10d3ace979168eeee531e87ba0072878bc5ab40be6","systems":["Windows"]},{"id":"9619b661491a873f13ead830f11b82865e86a470697527f302893e08d9bd83f5","systems":["Mac"]},{"id":"e29e5c60c93bf355bc8fa39c5b6e7fdc9a943a06c11a2ff0a957c52de02c3e10","systems":["Mac"]},{"id":"e8628260d0b75ca29debe1ac9ed3eb0ec6353688245a2099d5aa52fde50beecd","systems":["Android"]},{"id":"fb97ec682c5d669959aa50226b3277181676b9b393fcc7ea9c67e5ba5374f422","systems":["Windows"]}],"Chrome 74":[{"id":"746a2166e2e76bc1b63974b886542a0a236ae97cc62a6561649f896b7bff3c3d","systems":["Android"]}],"Chrome 79":[{"id":"929117a3a8210a553dba14bf3f046f311c54c58275afade037f9b2efdce855bd","systems":["Windows"]}],"Chrome 93 Edge":[{"id":"7599b17c1f81b0131cf3edf5020a20f2439806160a1ccff8b436ccd61d420fcf","systems":["Windows"]}],"Firefox 80":[{"id":"7bc564cd87b7859d6d04039e824b5bd34b04c267893bd7b129df7afcf124b1e9","systems":["Android"]}],"Chrome 87 Yandex":[{"id":"7d2a743c30062ab57f59c58f6d36b836fc4e1c8d04a1907fc0a75b41ed9cce41","systems":["Android"]},{"id":"e45087a2cf2671e983ff1a69d7dacd51051ee6cd3313d42b27fba0ffc25e6b52","systems":["Mac","Windows"]}],"Chrome 86 Edge":[{"id":"8115933b5a2af0ad76d013f917dba3762d56c38fe44e978c29c130488aab42b6","systems":["Windows"]}],"FxiOS 31":[{"id":"82cb25af676ab83114e406f80a195ba252cdfed59cc984840a8393239d7d876d","systems":["iPhone"]}],"Chrome 87 Brave":[{"id":"86c69fc345bb27a6b07a159716fe53b138cb926d5399cb500c1b1f5f9ebe7cc5","systems":["Mac","Windows"]},{"id":"a8d3e34acfabf1fe3314172448d6cf21d1a43e2f2a390dd077ff3a17f413b544","systems":["Mac","Windows"]}],"FxiOS 33":[{"id":"8a58a82b6aa5f11f0340e0ff1162e6e394df07e09ba4df70c6e10755cc6f6ad2","systems":["iPhone"]}],"CriOS 90":[{"id":"8ab5d23cf4147a47bf20e3f5cbabfaa336534f7d24d44a39108a06d2d60f043f","systems":["iPhone"]},{"id":"ac8efb5351972842cd8e20f388335b48663238a6d701b4eb951b0d52da50c64a","systems":["iPhone"]}],"Chrome 87 Edge":[{"id":"966e795036cac73b38a73f7f197fab7df8529b8635b96c5fd2d409c22200429d","systems":["Windows"]},{"id":"adbda82aaa18bb4a9a0762e4bcba419548473a079466ff3026298f8bb7a48aab","systems":["Windows"]},{"id":"c5fab4ab83f26a1fc36a0c5d9d5f775bdfa8337a01a1b08889d839bcb59674c5","systems":["Windows"]}],"PaleMoon 28":[{"id":"996cc5f008ab75aed2bc8fe65c1d58b2c75beda7633cc6316f07b83a738295b4","systems":["Windows"]}],"Chrome 85 Brave":[{"id":"9bdf4cdc86a28d2e8b17178867a054c340d891943058115519de58c8ff2834c8","systems":["Mac"]}],"CriOS 87":[{"id":"a570f5269c885d0b7f844eb680a561f2c56cc2a5b6906a80bf5d39c9e23d67aa","systems":["iPad","iPhone"]},{"id":"d81031d78d11850b702e1268b0f35ba3a57902f8ef519e23ac3e6b57708efbbb","systems":["iPhone"]}],"Safari 10":[{"id":"af68923bd7433cea45d13700a1b655039e1c103586d7461aaa528d37220fb9ee","systems":["iPhone"]}],"Safari 11":[{"id":"b42d409e95fefb27413dc458202629f6d20fc5cdf26aa5f5c6e7ad0c535b68d1","systems":["iPhone"]}],"FxiOS 34":[{"id":"ba0f4ff0d2595c7c5dbcc823226b6b47c608583aa5ae8c5f2f38cec61b536346","systems":["iPhone"]}],"Chrome 85 Edge":[{"id":"d5331d4912e6fbf6f5fb32ee808b4edd65d546ccf140dd2d080c4f255cf1af76","systems":["Windows"]}],"Chrome 83 Edge":[{"id":"d85121d7f328a34557553956624bc6c2c1ddd227140d5fcd45479152e0170cc0","systems":["Windows"]}],"Chrome 86 DuckDuckGo":[{"id":"fc8f52f16c3ec761734b1241180eecbf6da4c6d7de989aa31d7e3a778f54863e","systems":["Android"]}],"Chrome 75":[{"id":"fd5d79788df85378a7805a8a450b71aa1526c50fede785c87089fd4dc6238ea3","systems":["Android"]}]};

		const decryptHash = (hash, data) => {
			let systems = [];
			let poolTotal = 0;
			const metricTotal = Object.keys(data).reduce((acc,item) => acc+= data[item].length, 0);
			const decryption = Object.keys(data).find(key => data[key].find(item => {
				if (!(item.id == hash)) {
					return false
				}
				systems = item.systems;
				poolTotal = data[key].length;
				return true
			}));

			const getIcon = name => `<span class="icon ${name}"></span>`;
			const browserIcon = (
				!decryption ? '' :
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
																''
			);

			const formatPercent = n => n.toFixed(2).replace('.00', '');
			return {
				browser: decryption || 'unknown',
				browserHTML: (
					!decryption ? undefined : 
						`${browserIcon}${decryption}`
				),
				uniqueMetric: !decryption ? '0' : formatPercent(1/metricTotal*100),
				uniqueEngine: !decryption ? '0' : formatPercent(1/poolTotal*100)
			}
		};

		const { browser, browserHTML, uniqueMetric, uniqueEngine } = decryptHash($hash, decryptionData);

		return `
	<div class="col-six">
		<style>
			.window-features-metric-rating {
				background: linear-gradient(90deg, var(${uniqueMetric < 10 ? '--unique' : '--grey-glass'}) ${uniqueMetric}%, #fff0 ${uniqueMetric}%, #fff0 100%);
			}
			.window-features-class-rating {
				background: linear-gradient(90deg, var(${uniqueEngine < 10 ? '--unique' : '--grey-glass'}) ${uniqueEngine}%, #fff0 ${uniqueEngine}%, #fff0 100%);
			}
		</style>
		<strong>Window</strong><span class="hash">${hashSlice($hash)}</span>
		<div>keys (${count(keys)}): ${keys && keys.length ? modal('creep-iframe-content-window-version', keys.join(', ')) : note.blocked}</div>
		<div class="window-features-metric-rating help" title="% of limited window samples">${uniqueMetric}% of samples</div>
		<div class="window-features-class-rating help" title="% of ${browser} class">${uniqueEngine}% of class</div>
		<div>version: ${browserHTML || note.unknown}</div>
	</div>
	`	
	};

	// inspired by Lalit Patel's fontdetect.js
	// https://www.lalit.org/wordpress/wp-content/uploads/2008/05/fontdetect.js?ver=0.3

	const getFontsShortList = () => [
		'Helvetica Neue', // Apple
		'Geneva', // mac (not iOS)
		'Lucida Console', // Windows
		'Noto Color Emoji', // Linux
		'Ubuntu', // Ubuntu
		'Droid Sans Mono', // Android
		'Roboto', // Android, Chrome OS
	].sort();

	const getAppleFonts = () => [
		'Helvetica Neue'
	];

	const getWindowsFonts = () => [
		'Cambria Math',
		'Lucida Console',
		'MS Serif',
		'Segoe UI',
	];

	const getLinuxFonts = () => [
		'Arimo', // ubuntu, chrome os
		'Cousine', // ubuntu, chrome os
		'MONO', // ubuntu, chrome os (not TB)
		'Jomolhari', // chrome os
		'Ubuntu', // ubuntu (not TB)
		'Chilanka', // ubuntu (not TB)
	];

	const getAndroidFonts = () => [
		'Dancing Script', // android FF
	];

	const getGeneralFonts = () => [
		// Windows
		'Consolas', //FF and Chrome (not TB)
		'HELV', // FF (not TB)
		'Marlett', // chrome
		// Linux 
		'Noto Sans JP', // TB linux
		// Apple
		'Arial Hebrew', // safari + chrome (not FF or TB)
		'Arial Rounded MT Bold', // not TB
		'Geneva', // mac
		'Apple Chancery', // mac (not TB)
		'Apple Color Emoji', // ios, chrome, safari (TB, not FF)
		// Android
		'Roboto', // android FF, Chrome OS
		'Droid Sans Mono', // FF android
		'Cutive Mono', // some android FF
		// Other
		'Liberation Mono', // Chrome OS
		'Noto Sans Yi', // TB on linux and windows, chrome OS, FF android, Mac
		'Monaco', // android + mac
		'Palatino', // android + mac + ios
		'Baskerville', // android + mac
		'Tahoma' // android, mac, windows (not ios, not chrome os 90)
	];

	const getoriginFonts = () => [
		...getAppleFonts(),
		...getWindowsFonts(),
		...getLinuxFonts(),
		...getAndroidFonts(),
		...getGeneralFonts()
	].sort();

	const originPixelsToInt = pixels => Math.round(2 * pixels.replace('px', ''));
	const getPixelDimensions = style => {
		const transform = style.transformOrigin.split(' ');
		const perspective = style.perspectiveOrigin.split(' ');
		const dimensions = {
			transformWidth: originPixelsToInt(transform[0]),
			transformHeight: originPixelsToInt(transform[1]),
			perspectiveWidth: originPixelsToInt(perspective[0]),
			perspectiveHeight: originPixelsToInt(perspective[1])
		};
		return dimensions
	};

	const getPixelFonts = ({ win, id, chars, baseFonts, families }) => {
		try {
			win.document.getElementById(id).innerHTML = `
		<style>
			#${id}-detector {
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
				/* in order to test inlineSize and blockSize */
				writing-mode: horizontal-tb !important;
				/* in order to test perspective-origin */
				/* in order to test origins */
				transform-origin: unset !important;
				perspective-origin: unset !important;
			}
			#${id}-detector::after {
				font-family: var(--font);
				content: '${chars}';
			}
		</style>
		<span id="${id}-detector"></span>
	`;
			const span = win.document.getElementById(`${id}-detector`);
			const detectedViaTransform = new Set();
			const detectedViaPerspective = new Set();
			const style = getComputedStyle(span);
			const base = baseFonts.reduce((acc, font) => {
				span.style.setProperty('--font', font);
				const dimensions = getPixelDimensions(style);
				acc[font] = dimensions;
				return acc
			}, {});
			families.forEach(family => {
				span.style.setProperty('--font', family);
				const basefont = /, (.+)/.exec(family)[1];
				const dimensions = getPixelDimensions(style);
				const font = /\'(.+)\'/.exec(family)[1];
				if (dimensions.transformWidth != base[basefont].transformWidth ||
					dimensions.transformHeight != base[basefont].transformHeight) {
					detectedViaTransform.add(font);
				}
				if (dimensions.perspectiveWidth != base[basefont].perspectiveWidth ||
					dimensions.perspectiveHeight != base[basefont].perspectiveHeight) {
					detectedViaPerspective.add(font);
				}
				return
			});
			const fonts = {
				transform: [...detectedViaTransform],
				perspective: [...detectedViaPerspective]
			};
			return fonts
		} catch (error) {
			console.error(error);
			return {
				transform: [],
				perspective: []
			}
		}
	};

	const getFontFaceLoadFonts = async list => {
		try {
			const fontFaceList = list.map(font => new FontFace(font, `local("${font}")`));
			const responseCollection = await Promise
				.allSettled(fontFaceList.map(font => font.load()));
			const fonts = responseCollection.reduce((acc, font) => {
				if (font.status == 'fulfilled') {
					return [...acc, font.value.family]
				}
				return acc
			}, []);
			return fonts
		} catch (error) {
			console.error(error);
			return []
		}
	};

	const getFonts = async imports => {

		const {
			require: {
				captureError,
				lieProps,
				phantomDarkness,
				logTestResult
			}
		} = imports;

		try {
			await new Promise(setTimeout).catch(e => {});
			const start = performance.now();
			const win = phantomDarkness ? phantomDarkness : window;
			const doc = win.document;
			
			const id = `font-fingerprint`;
			const div = doc.createElement('div');
			div.setAttribute('id', id);
			doc.body.appendChild(div);
			const originFontsList = getoriginFonts();
			const baseFonts = ['monospace', 'sans-serif', 'serif'];
			const families = originFontsList.reduce((acc, font) => {
				baseFonts.forEach(baseFont => acc.push(`'${font}', ${baseFont}`));
				return acc
			}, []);

			const pixelFonts = getPixelFonts({
				win,
				id,
				chars: `mmmmmmmmmmlli`,
				baseFonts,
				families
			});

			const compressToList = fontObject => Object.keys(fontObject).reduce((acc, key) => {
				return [...acc, ...fontObject[key]]
			},[]);
			
			const fontFaceLoadFonts = await getFontFaceLoadFonts(getFontsShortList());

			const originFonts = [...new Set(compressToList(pixelFonts))];

			logTestResult({ start, test: 'fonts', passed: true });
			return {
				fontFaceLoadFonts,
				pixelFonts,
				originFonts
			}
		} catch (error) {
			logTestResult({ test: 'fonts', passed: false });
			captureError(error);
			return
		}

	};

	const fontsHTML = ({ fp, note, modal, count, hashSlice, hashMini }) => {
		if (!fp.fonts) {
			return `
		<div class="col-six undefined">
			<strong>Fonts</strong>
			<div>origin (0): ${note.blocked}</div>
			<div>load (0):</div>
			<div class="block-text">${note.blocked}</div>
		</div>`
		}
		const {
			fonts: {
				$hash,
				fontFaceLoadFonts,
				originFonts
			}
		} = fp;
		
		const apple = new Set(getAppleFonts());
		const linux = new Set(getLinuxFonts());
		const windows = new Set(getWindowsFonts());
		const android = new Set(getAndroidFonts());

		const systemClass = [...originFonts.reduce((acc, font) => {
			if (!acc.has('Apple') && apple.has(font)) {
				acc.add('Apple');
				return acc
			}
			if (!acc.has('Linux') && linux.has(font)) {
				acc.add('Linux');
				return acc
			}
			if (!acc.has('Windows') && windows.has(font)) {
				acc.add('Windows');
				return acc
			}
			if (!acc.has('Android') && android.has(font)) {
				acc.add('Android');
				return acc
			}
			return acc
		}, new Set())];
		const chromeOnAndroid = (
			''+((originFonts || []).sort()) == 'Baskerville,Monaco,Palatino,Tahoma'
		);
		if (!systemClass.length && chromeOnAndroid) {
			systemClass.push('Android');
		}
		const icon = {
			'Linux': '<span class="icon linux"></span>',
			'Apple': '<span class="icon apple"></span>',
			'Windows': '<span class="icon windows"></span>',
			'Android': '<span class="icon android"></span>',
			'CrOS': '<span class="icon cros"></span>'
		};
		const systemClassIcons = systemClass.map(name => icon[name]);
		const originHash = hashMini(originFonts);

		const systemMap = {
			'Lucida Console': [icon.Windows, 'Windows'],
			'Arimo': [icon.Linux, 'Linux'],
			'Noto Color Emoji': [icon.Linux, 'Linux'],
			'Noto Color Emoji,Ubuntu': [icon.Linux, 'Linux Ubuntu'],
			'Noto Color Emoji,Roboto': [icon.CrOS, 'Chrome OS'],
			'Droid Sans Mono,Roboto': [icon.Android, 'Android'],
			'Droid Sans Mono,Noto Color Emoji,Roboto': [`${icon.Linux}${icon.Android}`, 'Linux Android'],
			'Helvetica Neue': [icon.Apple, 'iOS'],
			'Geneva,Helvetica Neue': [icon.Apple, 'Mac']
		}; 

		const fontFaceLoadFontsString = ''+(fontFaceLoadFonts.sort());
		const system = systemMap[fontFaceLoadFontsString]; 

		return `
	<div class="col-six">
		<strong>Fonts</strong><span class="hash">${hashSlice($hash)}</span>
		<div class="help" title="CSSStyleDeclaration.setProperty()\ntransform-origin\nperspective-origin">origin (${originFonts ? count(originFonts) : '0'}/${''+getoriginFonts().length}): ${
			originFonts.length ? modal(
				'creep-fonts', originFonts.map(font => `<span style="font-family:'${font}'">${font}</span>`).join('<br>'),
				`${systemClass.length ? `${systemClassIcons.join('')}${originHash}` : originHash}`
			) : note.unknown
		}</div>
		<div class="help" title="FontFace.load()">load (${fontFaceLoadFonts ? count(fontFaceLoadFonts) : '0'}/${''+getFontsShortList().length}): ${
			system ? system[1] : ''
		}</div>
		<div class="block-text">
			<div>${
				fontFaceLoadFonts.length ? `${system ? system[0] : ''}${fontFaceLoadFontsString}` : 
					note.unknown
			}</div>
		</div>
	</div>
	`	
	};

	const detectChromium = () => (
		Math.acos(0.123) == 1.4474840516030247 &&
		Math.acosh(Math.SQRT2) == 0.881373587019543 &&
		Math.atan(2) == 1.1071487177940904 &&
		Math.atanh(0.5) == 0.5493061443340548 &&
		Math.cbrt(Math.PI) == 1.4645918875615231 &&
		Math.cos(21 * Math.LN2) == -0.4067775970251724 &&
		Math.cosh(492 * Math.LOG2E) == 9.199870313877772e+307 &&
		Math.expm1(1) == 1.718281828459045 &&
		Math.hypot(6 * Math.PI, -100) == 101.76102278593319 &&
		Math.log10(Math.PI) == 0.4971498726941338 &&
		Math.sin(Math.PI) == 1.2246467991473532e-16 &&
		Math.sinh(Math.PI) == 11.548739357257748 &&
		Math.tan(10 * Math.LOG2E) == -3.3537128705376014 &&
		Math.tanh(0.123) == 0.12238344189440875 &&
		Math.pow(Math.PI, -100) == 1.9275814160560204e-50
	);

	const getNewObjectToStringTypeErrorLie = apiFunction => {
		try {
			const you = () => Object.create(apiFunction).toString();
			const cant = () => you();
			const hide = () => cant();
			hide();
			// error must throw
			return true
		} catch (error) {
			const stackLines = error.stack.split('\n');
			const validScope = !/at Object\.apply/.test(stackLines[1]);
			// Stack must be valid
			const validStackSize = (
				error.constructor.name == 'TypeError' && stackLines.length >= 5
			);
			// Chromium must throw error 'at Function.toString'... and not 'at Object.apply'
			const isChromium = 'chrome' in window || detectChromium();
			if (validStackSize && isChromium && (
				!validScope ||
				!/at Function\.toString/.test(stackLines[1]) ||
				!/at you/.test(stackLines[2]) ||
				!/at cant/.test(stackLines[3]) ||
				!/at hide/.test(stackLines[4])
			)) {
				return true
			}
			return !validStackSize
		}
	};


	const getHeadlessFeatures = async (imports, workerScope) => {

		const {
			require: {
				parentPhantom,
				hashMini,
				isChrome,
				captureError,
				logTestResult
			}
		} = imports;

		try {
			const start = performance.now();
			const isChromium = detectChromium() || isChrome;
			const mimeTypes = Object.keys({ ...navigator.mimeTypes });
			const data = {
				chromium: isChromium,
				likeHeadless: {
					['trust token feature is disabled']: (
						!('hasTrustToken' in document) ||
						!('trustTokenOperationError' in XMLHttpRequest.prototype) ||
						!('setTrustToken' in XMLHttpRequest.prototype) ||
						!('trustToken' in HTMLIFrameElement.prototype)
					),
					['navigator.webdriver is on']: 'webdriver' in navigator && !!navigator.webdriver,
					['chrome plugins array is empty']: isChromium && navigator.plugins.length === 0,
					['chrome mimeTypes array is empty']: isChromium && mimeTypes.length === 0,
					['notification permission is denied']: isChromium && Notification.permission == 'denied',
					['chrome system color ActiveText is rgb(255, 0, 0)']: isChromium && (() => {
						let rendered = parentPhantom;
						if (!parentPhantom) {
							rendered = document.createElement('div');
							document.body.appendChild(rendered);
						}
						rendered.setAttribute('style', `background-color: ActiveText`);
						const { backgroundColor: activeText } = getComputedStyle(rendered);
						if (!parentPhantom) {
							rendered.parentNode.removeChild(rendered);
						}
						return activeText === 'rgb(255, 0, 0)'
					})(parentPhantom),
					['prefers light color scheme']: matchMedia('(prefers-color-scheme: light)').matches
				},
				headless: {
					['chrome window.chrome is undefined']: isChromium && !('chrome' in window),
					['chrome permission state is inconsistent']: isChromium && await (async () => {
						const res = await navigator.permissions.query({ name: 'notifications' });
						return (
							res.state == 'prompt' && Notification.permission === 'denied'
						)
					})(),
					['userAgent contains HeadlessChrome']: (
						/HeadlessChrome/.test(navigator.userAgent) ||
						/HeadlessChrome/.test(navigator.appVersion)
					),
					['worker userAgent contains HeadlessChrome']: !!workerScope && (
						/HeadlessChrome/.test(workerScope.userAgent)
					)
				},
				stealth: {
					['srcdoc throws an error']: (() => {
						try {
							const { srcdoc } = document.createElement('iframe');
							return !!srcdoc
						}
						catch (error) {
							return true
						}
					})(),
					['srcdoc triggers a window Proxy']: (() => {
						const iframe = document.createElement('iframe');
						iframe.srcdoc = '' + hashMini(crypto.getRandomValues(new Uint32Array(10)));
						return !!iframe.contentWindow
					})(),
					['index of chrome is too high']: (() => {
						const control = (
							'cookieStore' in window ? 'cookieStore' :
								'ondevicemotion' in window ? 'ondevicemotion' :
									'speechSynthesis'
						);
						const propsInWindow = [];
						for (const prop in window) { propsInWindow.push(prop); }
						const chromeIndex = propsInWindow.indexOf('chrome');
						const controlIndex = propsInWindow.indexOf(control);
						return chromeIndex > controlIndex
					})(),
					['chrome.runtime functions are invalid']: (() => {
						if (!('chrome' in window && 'runtime' in chrome)) {
							return false
						}
						try {
							if ('prototype' in chrome.runtime.sendMessage ||
								'prototype' in chrome.runtime.connect) {
								return true
							}
							new chrome.runtime.sendMessage;
							new chrome.runtime.connect;
							return true
						}
						catch (error) {
							return error.constructor.name != 'TypeError' ? true : false
						}
					})(),
					['Permissions.prototype.query leaks Proxy behavior']: (() => {
						try {
							class Blah extends Permissions.prototype.query { }
							return true
						}
						catch (error) {
							return /\[object Function\]/.test(error.message)
						}
					})(),
					['Function.prototype.toString leaks Proxy behavior']: (() => {
						try {
							class Blah extends Function.prototype.toString { }
							return true
						}
						catch (error) {
							return /\[object Function\]/.test(error.message)
						}
					})(),
					['Function.prototype.toString has invalid TypeError']: (() => {
						const liedToString = (
							getNewObjectToStringTypeErrorLie(Function.prototype.toString) ||
							getNewObjectToStringTypeErrorLie(() => { })
						);
						return liedToString
					})()
				}
			};

			const { likeHeadless, headless, stealth } = data;
			const likeHeadlessKeys = Object.keys(likeHeadless);
			const headlessKeys = Object.keys(headless);
			const stealthKeys = Object.keys(stealth);

			const likeHeadlessRating = +((likeHeadlessKeys.filter(key => likeHeadless[key]).length / likeHeadlessKeys.length) * 100).toFixed(0);
			const headlessRating = +((headlessKeys.filter(key => headless[key]).length / headlessKeys.length) * 100).toFixed(0);
			const stealthRating = +((stealthKeys.filter(key => stealth[key]).length / stealthKeys.length) * 100).toFixed(0);

			logTestResult({ start, test: 'headless', passed: true });
			return { ...data, likeHeadlessRating, headlessRating, stealthRating }
		}
		catch (error) {
			logTestResult({ test: 'headless', passed: false });
			captureError(error);
			return
		}
	};

	const headlesFeaturesHTML = ({ fp, modal, note, hashMini, hashSlice }) => {
		if (!fp.headless) {
			return `
		<div class="col-six">
			<strong>Headless</strong>
			<div>chromium: ${note.blocked}</div>
			<div>0% like headless: ${note.blocked}</div>
			<div>0% headless: ${note.blocked}</div>
			<div>0% stealth: ${note.blocked}</div>
		</div>`
		}
		const {
			headless: data
		} = fp;
		const {
			$hash,
			chromium,
			likeHeadless,
			likeHeadlessRating,
			headless,
			headlessRating,
			stealth,
			stealthRating
		} = data || {};
		
		return `
	<div class="col-six">
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
		<strong>Headless</strong><span class="hash">${hashSlice($hash)}</span>
		<div>chromium: ${''+chromium}</div>
		<div class="like-headless-rating">${''+likeHeadlessRating}% like headless: ${
			modal(
				'creep-like-headless',
				'<strong>Like Headless</strong><br><br>'
				+Object.keys(likeHeadless).map(key => `${key}: ${''+likeHeadless[key]}`).join('<br>'),
				hashMini(likeHeadless)
			)
		}</div>
		<div class="headless-rating">${''+headlessRating}% headless: ${
			modal(
				'creep-headless',
				'<strong>Headless</strong><br><br>'
				+Object.keys(headless).map(key => `${key}: ${''+headless[key]}`).join('<br>'),
				hashMini(headless)
			)
		}</div>
		<div class="stealth-rating">${''+stealthRating}% stealth: ${
			modal(
				'creep-stealth',
				'<strong>Stealth</strong><br><br>'
				+Object.keys(stealth).map(key => `${key}: ${''+stealth[key]}`).join('<br>'),
				hashMini(stealth)
			)
		}</div>
	</div>`
	};

	const getHTMLElementVersion = async imports => {

		const {
			require: {
				captureError,
				logTestResult
			}
		} = imports;

		try {
			const start = performance.now();
			const keys = [];
			for (const key in document.documentElement) {
				keys.push(key);
			}
			logTestResult({ start, test: 'html element', passed: true });
			return { keys }
		}
		catch (error) {
			logTestResult({ test: 'html element', passed: false });
			captureError(error);
			return
		}
	};

	const htmlElementVersionHTML = ({ fp, modal, note, hashSlice, count }) => {
		if (!fp.htmlElementVersion) {
			return `
		<div class="col-six undefined">
			<strong>HTMLElement</strong>
			<div>keys (0): ${note.blocked}</div>
			<div>0% of samples</div>
			<div>0% of class</div>
			<div>engine: ${note.blocked}</div>
		</div>`
		}
		const {
			htmlElementVersion: {
				$hash,
				keys
			}
		} = fp;
		
		const decryptionData = {"Gecko":[{"id":"01ba49ac1ca0fe28eb5c3992ee81c08e752f5e92f4786cb0fb9f759e37de817a","systems":["Windows"]},{"id":"0986f5aa564c731129e69dfa01ba5a6f1698d1f0fe27f3f305e0a4642f622636","systems":["Android"]},{"id":"0b0a5ca85b82681dbf295ad084acee6625124b5b801e9abb7d92a62ac15ec933","systems":["Windows"]},{"id":"0f6563bec30142d4e901d6f683bdbd158a0a38c37c2600011af2ddacd545aef3","systems":["Windows"]},{"id":"10d0dcb9112df8b1be1d87d5b11f326587cb4bb51f8a6af96e84f13ee25caee0","systems":["Mac","Windows"]},{"id":"16370f15b1da59872a6c624e561d6df531f5247ce94218a780640ebdf24c2769","systems":["Windows"]},{"id":"17d0860c3281abc3cf53c5cf645b59aa1df7f08be39c4c61a449fbb1f522150c","systems":["Android"]},{"id":"245d02493621a9bcd74ff209315540f21116339058bb69149b8bc8974505e71e","systems":["Linux","Windows"]},{"id":"27adc5fd38dde8cb0862b26651f0a43a4ee0c373eb68ee776e7e60b4999e7602","systems":["Windows"]},{"id":"2aeeab3022e88965d2a434357b0c6e6899d5636847232f2a3d171b3ddf04fa1e","systems":["Windows"]},{"id":"362868902df957819e273bcce4394932b8b855d02fedc5172686463dd852e685","systems":["Android"]},{"id":"3aa182a2482babb0a895ba3d74f10ee591f0ac33138d5d915f6f56048bce0dd0","systems":["Windows"]},{"id":"4015b7baf724fda043fc74bf72568582401bfdf583885bcfac9e6f0dd1017fef","systems":["Windows"]},{"id":"5326487f63aa88dba49da584d8bb98bfec8c461ab4532bd0358e72274b396a86","systems":["Windows"]},{"id":"5409490945ec01b0558e198e39b1fd60960af60a5b9e5e5379f39c141964dbfd","systems":["Windows"]},{"id":"5c1ef89dfd8347d79e018218f1e464b0b5b103fa9e7cca03b95224bccd7a04cf","systems":["Windows"]},{"id":"68cea511e4ed99be3ac9aaf824c607e592df3417b1cfde6fb3101ee0234a00ca","systems":["Mac","Windows"]},{"id":"6f94b66da90d84a1820a769e41e59f72b21d6f72a1d8f2cb6f116d1dd6c9b11b","systems":["Linux"]},{"id":"7f6beac78bd1ff745400ffca788c2860fcdb440448316a4910afbf6dda14c098","systems":["Windows"]},{"id":"800426f335d49aeb3b3f30bb2617793e046bfd7ddc571974cac0b71a77ae2d3a","systems":["Windows"]},{"id":"9b240116ca5c48b473b8b2e49fe3ff2d8ea6b4c720cee95fde56ef9b68788f0e","systems":["Android","Linux","Mac","Other","Windows"]},{"id":"9d00561eda2d7133ff09b8406b05aca690d43e562c904a94d091f4fc577391e4","systems":["Windows"]},{"id":"a4676a79f6b3540db9fc55e194af36d297d96afad7b24619d9bbbd44928b4bc0","systems":["Android"]},{"id":"a4ef72b16e6140cfdffcd8445d7f8cbfb0793688353a8c3f7a13b5d3ac90c7dd","systems":["Android"]},{"id":"a774eb06b38af7164996c19a3323c2113acc3f6415c23028f8aa3c0673a9730d","systems":["Windows"]},{"id":"b3f9d618c303816370a4242543dba658f252c66fd9250c741456c164fc25383c","systems":["Windows"]},{"id":"b5d3c6666735982913cc808f9bc5588efcf1495ac2fb42eb3d61ea787ec606b0","systems":["Android"]},{"id":"bab9568e3638d66c9713301af004b4143245b642f7e32d881f6f2ae535f99ece","systems":["Windows"]},{"id":"bd4056fb9fceed15b0bc7ed5759e41193a8e11d9efb2e177717183f3f9f50da8","systems":["Linux","Windows"]},{"id":"cf5b270a3061ac1bf3a930d645b8bd80e0672f426c3fe5bf5e7c9241603a71ef","systems":["Android"]},{"id":"d37ecdb1f79df56a4e5b01f3d93f90eb365457454181880d9d8f614b4a802247","systems":["Linux","Windows"]},{"id":"d4e343819902ad58e5f55789e45f817bf218ca1b90247f61a1f92767487656aa","systems":["Android"]},{"id":"d87a4cbbcd73f25e17704aef6e86a540cc815f977519bb6edea047c323a6f189","systems":["Linux","Mac","Other","Windows"]},{"id":"d98cfaba094ef78af871ab8ddd1934f45daafefb365b63284a57ceae0d9efc49","systems":["Windows"]},{"id":"d99fc13e3b0da1908b7ee1e9bba1e6666f13f42349938b8b6f3af8a25ce0bc02","systems":["Linux","Mac","Other","Windows"]},{"id":"db1d11dfcfdd0df843777d60d107b2594ea8e3f3248b1056fa2b997108704c4f","systems":["Linux"]},{"id":"dbaf664457bcfc4585ee78d257cb0778fe6d47368f21791605eaeb4d114881d5","systems":["Windows"]},{"id":"df1b367a80951d9fe705d7135fd8846c41b0ed1a6827805f3181a54c0e738f3e","systems":["Linux","Windows"]},{"id":"e2ab9b471ff2a57f7877e2e968e740abcfed0b1b7735a0dc5f408fc9a6260a1a","systems":["Mac","Windows"]},{"id":"e303245003170a4657acda9a2b68d49d1277265cbda5e9c4518887a32e866efa","systems":["Android","Mac","Windows"]},{"id":"ec6703f85309761fdf85ba65155ee11ad3ced7895b933568ebc4725309cd9925","systems":["Android"]},{"id":"f011609e8367789c03a992aecbaaa89d14d3dfad2cc5cefbaedf1e6134eb1211","systems":["Linux","Mac","Windows"]},{"id":"faf49a406df8da0a61948177cc85b0f6f1d189bdfa17af74e510c8e243e34a4b","systems":["Mac","Windows"]}],"Blink":[{"id":"0442e316ba12b86e5d64df3f2c30a7cac1e141288ed42b89d17785d440eee3ef","systems":["Linux","Mac","Windows"]},{"id":"04ed784bf995e022e8508328b47d8c5bb3f18041ed7db104256730ffee677ccc","systems":["Windows"]},{"id":"0850a0c01bcdbd17cb96ca833e27641159b4cbdc34ae83201fe97dcfbfaa1216","systems":["Linux","Mac","Windows"]},{"id":"09bdf1a2d334de9b31979c1be27e95b8e1bc3dc73a5438fe59d018d36c6b0d1c","systems":["Linux","Windows"]},{"id":"0a3e9328850b15fa5d45b13cf54328d868fd6356403aea644d9cb6ecaea30227","systems":["Android"]},{"id":"0e35f2eec60f4f251fb5676ed11cd09d728ecac1e3de934db6b3f7c8a7ac9cad","systems":["Windows"]},{"id":"19edbfc45258a6443bbc4ea06ddc378f7cc884bfa2913c53a8ea84aa0a5c02b6","systems":["Linux"]},{"id":"1b2bebf3a54371b0e3d40dcda34a83eb690c87a19394b0a8c71cb3b5e0980934","systems":["Android"]},{"id":"1d2393d6321c686c63ad5aac6e5302bb6e474d5e4e2205e54b3c33e31aefbe13","systems":["Android","Linux","Mac","Windows"]},{"id":"1e83ecce0f783bd6b97481fe29f8e9fa40b7f182d1ca3f8d6b69dc194e6e7387","systems":["Windows"]},{"id":"204a007d8b6be8460537c5c32508014065be6c40a835ba3f9e139d24efea00a0","systems":["Android","Linux","Mac","Windows","Windows Phone"]},{"id":"20674865d191c12108b51dadb3d752d753e68df6c876ff9e0ea05b74f81e6511","systems":["Linux"]},{"id":"21ab280329a5cc3e36f0cc21baab6d36a3e28b4897f6ccac48359460eff7e683","systems":["Android","Linux","Mac","Windows"]},{"id":"2265e6e027a196edba45c91744ab50ef7a5187a0d61dda096f12a80f15d4b11e","systems":["Mac","Windows"]},{"id":"23305d67c53356ee087bd9e30a80ddac1a560a0a653c68718dae93c73e237ceb","systems":["Android","Windows"]},{"id":"275bf799483127957c5f4f278f1cfb85bfb840a03a2ef6740de17f54c52e2c10","systems":["Android"]},{"id":"2aa0270b7588cde6fd4da86c8c1f488222408059555954a416820e421ad15f29","systems":["Android","Linux","Mac","Windows"]},{"id":"2b9e75eec15570233c802c1f9f6e3265a0cb92ce6c303dcdfadc1c7cbdcf9c3f","systems":["Linux","Mac","Windows"]},{"id":"32479ad55f1a7a947f4eb05e0e0434c12e606fd5ba933ab203cf90fa1f172a67","systems":["Mac","Windows"]},{"id":"370ef1d47463023b390d6779c02db94ec1d4fda77711cb991d2b919f258f4d40","systems":["Android"]},{"id":"3789c633b8691eacae6ee9354942a8054b9273c16a65976d436d1621bebaeda9","systems":["Mac","Windows"]},{"id":"399f8a4f24244143f634ca3e2e7eb86ceb94a022476f7bdff5b857128bf2cc4f","systems":["Windows"]},{"id":"3ae4b2f0d631f57a1ac0d264123e17f1456cff26500ead57a5c3b2e330220e86","systems":["Android"]},{"id":"41a94f4e07e7ffd3d5678a7a8f34ca5e9de9ed751eadc744d990e1de170b0478","systems":["Linux","Mac","Windows"]},{"id":"440c3191fa0c42fc9498ecc41c431035920fa97b77e218cc8d6587983e82989a","systems":["Mac"]},{"id":"44cb1cc6927151a4d8743cc596ef15eba5d2722eeb937c0412c8e4ade25d96de","systems":["Linux","Mac","Windows"]},{"id":"454f877e5d7e42b611021289065e629e17dfec26605c952b15619e8c5c3d9111","systems":["Android"]},{"id":"465233e6863e853575bd6e3386a033e4af6e4493aee68adca5b069b01d01c135","systems":["Windows"]},{"id":"46ac952658de672cac683bf17356b95cf0d4838119ca78864382cd57edb8db27","systems":["Android"]},{"id":"46b1349734d012e16433072129305624bf930e4b07ae63907cee87c1dbf7dc9d","systems":["Linux","Mac","Windows"]},{"id":"47a98e72f9c4d3b2e8ba548c38f06689a657cf3c99b4b61fddbcb37a34e54c45","systems":["Linux","Mac","Windows"]},{"id":"4a86f4a99f5c5da0546ea0febcabb86efffe63e8467f0149e019443daba971f6","systems":["Windows"]},{"id":"4ba07dd45b72e9e967ead69d538067ccd1ac9410df544c38ad76e6680cbd86fe","systems":["Android"]},{"id":"4bf05e91e8a8501fd84370ac9df232a2700b870874a5f90a686f132972b49070","systems":["Windows"]},{"id":"4ccf4225bfe356d2e9b85f5d75565f39372bd5a92f6216f2722696e839e7c12f","systems":["Android","Windows"]},{"id":"4ed80db7b7c4a2eb67a05e02b1dbda70a172a81315ff0fb96b768fd8adf03e8c","systems":["Windows"]},{"id":"52565968ceeae466c3bf217b44fefe88d96f08fe187f33a7df1a6a89aee9fa55","systems":["Android"]},{"id":"5320b898756899ff5fe5f14ca36c020f956d01641c63825248149e9c7c4c283f","systems":["Android"]},{"id":"5420d6ed0f724cd74be8e6e416a783bbf3f2979790764ce8b303adf9fae40b1f","systems":["Windows"]},{"id":"5500719f9984b4067e4a0701b783b8be29b7176aa302e366ca5a596507a3ebc4","systems":["Android"]},{"id":"564e7bcc4e3f20748544e7bf84d1a9ef8d0d72c6d68fd261df855bd409c2dbfa","systems":["Android"]},{"id":"57a98e72f9c4d3b2e8ba548c38f06689a657cf3c99b4b61fddbcb37a34e54c45","systems":["Windows"]},{"id":"59c4e1e8cfd1a23c0ce2da5adc027b0bf90b2876fec7b8e50172444793cf08a5","systems":["Android"]},{"id":"5fa4fb08e9b729a8d4b12ca784d57e09492c8a4ca3085969430eea1eab9ea234","systems":["Windows"]},{"id":"63d8a13b78922988edace01bbd667ee26923b77d5cdc0d5cfd067ab20ec2b278","systems":["Android","Chrome OS","Linux","Mac","Windows"]},{"id":"63e041273d203593f06511ea74640d15050182ab67a1e00aae9cc1c0275575ec","systems":["Windows"]},{"id":"6505448e0287cc19611bf125b30a5bb92d3d572c99f79bd1193e411db46a66f1","systems":["Linux"]},{"id":"654e2d1d80bea712c890346b95dc42a5371ad648f0e9111ab8333fb4e1e1a721","systems":["Linux"]},{"id":"65f10526dbc57071cedf03bf3345ec35baaad3cac69dd641eaca5c55027ae6f3","systems":["Linux","Windows"]},{"id":"669cb16f5e9f1980aede515ac3fbbe69773101c9a61567ba61861d077cd45262","systems":["Mac","Windows"]},{"id":"67fd2f6584b0b5800c3d79f9142e6cb5673fc0f930a393b9078ad377482f6a1b","systems":["Windows"]},{"id":"68859724526d25e94088e6c4a45c3af84f827844e7bd8b800a5056e90133e296","systems":["Windows"]},{"id":"6e5a33c3c654d8421886aad93abe7692cc55172b9fa3ac82afa54582b5bc37db","systems":["Android"]},{"id":"6eabc7dc0f9879e36bdbae7bc61f84139abc0867f4800002b6a18aac226dec59","systems":["Mac","Windows"]},{"id":"703370543e3d535ab7e9ed733ab850433c0930a9a92ef1334c977ae99f0a9a81","systems":["Android"]},{"id":"709fe9f896c290e91bf6e005803ba0df3df48b378e19870a356093df07bf756f","systems":["Linux","Mac","Windows"]},{"id":"70af2166914e3a7b768f57c4069c09da83fde73eaee5907fe185e8ef5bbc7788","systems":["Android","Chrome OS","Linux","Mac","Windows"]},{"id":"711d91b735b7d780e1259816324608268117a310bb8020365b0dc43455cc74b5","systems":["Mac","Windows"]},{"id":"779422577a5bc09c2f61922346092d9c960ff20050f1b6f38e30d79797de3832","systems":["Windows"]},{"id":"78afcab4e482d121e2ca56fafc9867b708785e747f6b323aac6e4361b90bdb8f","systems":["Linux","Mac","Windows"]},{"id":"7e2efb6c3b99154158bb6bd2813a7c0f0524896fbc37342ec895c2abe84684f0","systems":["Android","Linux","Mac","Windows"]},{"id":"80e63fe6ce7cf03d969fb65522d9d9f80d10ed3efa6e1de7ed2ede7348f4f92d","systems":["Mac","Windows"]},{"id":"8919f73a9da8313113941b78d2b0f7b9a197a0cf6e8a942512e568a897f91ecf","systems":["Linux","Other","Windows"]},{"id":"8998682087b7c4b632bdbf142d917943854a207d1edb51c71e14f047b2ad6606","systems":["Android"]},{"id":"8f1a33e958d4e032171de0982b313349b35ab708f5a11976d921d21bd92c1867","systems":["Android"]},{"id":"8f1c36d0fac09ac9ec17bdcd30139ab067cd24c39201da1a2eec1af0307ac456","systems":["Android"]},{"id":"910380ac869c9c0ff1abe76a8ce641755d19232c9cfb27a664e3b4c6c6ddb66f","systems":["Linux","Mac","Windows"]},{"id":"9166e1b196b0ac54dc98510a00ded8fda2a3e59dc902983030a6adcbe4497b7d","systems":["Mac","Windows"]},{"id":"91e43f53c2eca453f334de2048c2f5e166c152c81e200f4995526eb3911f3d0d","systems":["Mac","Windows"]},{"id":"938a3f409bcbc296ea7094cfe628f60e38e14fc40bf61223bc5154834010ef30","systems":["Mac","Windows"]},{"id":"953c3ee4e87148a395cd0ed723823531f192010bfd5fb8bae0d05f5779f6779e","systems":["Windows"]},{"id":"9677fda086eff73657efe53f02a889f5c89e9b2357e01144f19d10222bf28931","systems":["Linux","Windows"]},{"id":"996dd8bac71dac2ae71aa54afe369e295a3297f5ad3a4cc607b929fd2ec430cf","systems":["Mac"]},{"id":"9b3a21d806c584bb68b0e7fff1e86d14ba4682a1f54c1f2a6efcd2fa430392b6","systems":["Mac"]},{"id":"9b760d7806eb583fdbf581a4da17fb72dc91cbfa40e4acec0873b001fd8eadb4","systems":["Mac","Windows"]},{"id":"9c348bee54b94f4ae6675fa197e4ee486e6f6b539a5b544cbcb1ee67b91492a1","systems":["Mac"]},{"id":"a0b1cb206a51708756fb5825f657afedc2ba0d76d73179aeb2fb5c92ad7c426c","systems":["Linux","Windows"]},{"id":"a2907fb58ef0ed2ce3abde241c99944d551c951ff26ab4dbf9d04d6a79623f1d","systems":["Mac","Windows"]},{"id":"a406566819022d5be4732fbbeb3579f17f42e5bbac7a15cfecba10ab615266d8","systems":["Android","Linux","Windows"]},{"id":"a5a0980d4d95a1ed14831e0cf61efc9701067930f662dbddb748723343221c2e","systems":["Mac"]},{"id":"a5fcb7a59998b28b549588eb683de7eede7f9562a24dc0dd74d3675d8d1cc2d0","systems":["Windows"]},{"id":"a7c4e76005c462946fbc7dad56fda6b92849530660c098baf48e3fd40f2f7d6d","systems":["Android","Chrome OS","Linux","Mac","Windows"]},{"id":"ac47b6f4a6e59d6f243d9783c335dfd08c24bb6b8acfc2d28b6180eb4bffc043","systems":["Windows"]},{"id":"aed61711c6c42c858e345952a6db42497992e28eb27c200690ff939add7323c3","systems":["Windows"]},{"id":"af8e6c406b91e9278e70c3a73841d5060a3350dabfb449cab75dfa9ae728feb4","systems":["Mac"]},{"id":"b07723bbfd0d2e6f18f6b64fc067b5846eb29412fa588bbda36696a588ececf3","systems":["Android"]},{"id":"b1dc6ecac70c7d13a074ff7cc145c30e0d668eb20eb118e59c40dbb2423a13b9","systems":["Linux"]},{"id":"b24337058a1cf4acc67887f8cbba9f7a0939651eebdee5f3b9e09263c9128e9d","systems":["Android"]},{"id":"b665e7b01ba3aae3eddd2d02d77c05a16f3fa90e9d5f22ed5cfe2b944256a433","systems":["Linux"]},{"id":"bb428b65ae13929a16b4a61c20bcd7e8e90c7e1ff6968930eab38bcce68c07b4","systems":["Chrome OS","Linux","Windows"]},{"id":"bd0e8118ebf0f9542910e8a87a2774997f72fff757ec6ae48ce9b55f84b258a0","systems":["Windows"]},{"id":"c02ceb8ef8235ce1ea9a877dc8975080be7272c1148f96112780d11e99fc3eea","systems":["Windows"]},{"id":"c1d4c129b8dbbf2bd7db0ee8d4954f3936b805a1b3c45e8709e6923139e720df","systems":["Mac"]},{"id":"c57affa083689a659cb5f466c2e638a27611f54ea19080c7945b606d91e1fad9","systems":["Android"]},{"id":"c9e5e3dec85eea63e64f4654c3e4c26d306bdceef531025ba7018289934d0d0e","systems":["Windows"]},{"id":"ca81e8078e2d3d9ce502f3053370809bea8653d82f4993b4bdf0a4015795d822","systems":["Windows"]},{"id":"ccbf3f953400d52e1494b6afaf16b1ad354b8a4dc5a49c6eee04f84aca5c7297","systems":["Android"]},{"id":"cee8468f2fe74979d0ac89107efd3d86c7b4a3f1695805a7725e438ee6b077b3","systems":["Android","Windows"]},{"id":"cf39c7b7a94493598a5d989aa674cb01a64eeedbe7b7eab85c5340f775df7898","systems":["Linux","Windows"]},{"id":"cf3a5248d1bea902e4e02a78cfb0b4f422f09ff9746855f9122a189314c97fee","systems":["Linux","Mac","Windows"]},{"id":"cf727342d2c34d358bad9e3e8976706d9434c9c55f5aa8790e7a8c2e77c35caf","systems":["Windows"]},{"id":"d0db1d1549992ca1b5b9946715ce269abdf27f7ab4c68f5b39bab950d963828f","systems":["Linux","Mac","Windows"]},{"id":"d2a520101b292305a26d7cf2f0fc959e12236e8e7001428a8275387714991125","systems":["Android"]},{"id":"d2e0250a92512c0772900c20c62630ff45ddd5c0a1a9043ef0ac54d729f7e37b","systems":["Windows"]},{"id":"d5aef7baad0b1643d49522018df65be34975e60cdac9b41666151b630679369e","systems":["Android","Mac"]},{"id":"dc54bfb95c9e298e51f5456aaf5ae20810820306dbf115be4adcf818e26636a1","systems":["Linux","Windows"]},{"id":"dc5c5fa9cf83bdb124f639fb25373992809d736d55e7f8318ce546d722bee85e","systems":["Android","Linux","Mac","Windows"]},{"id":"de0f45b062d1c97f690b393b8f0967df267ed123d99a608a21f72c9b31be08fa","systems":["Mac","Windows"]},{"id":"df0c39c6dc0825f5eea846cab37abf95d4561e5f6fa10597cab72164fbf90925","systems":["Windows"]},{"id":"dfe6a1ce8b61db0573a19f9533b71b332fa5a63dfe21f43ed0bbe88365af22bb","systems":["Mac","Windows"]},{"id":"e1008d03acd1dcc081cfac8c30d07c75b624dc7290c85aecdfd2fb436f1b8681","systems":["Windows"]},{"id":"e2ae97fe00e36ed731ebc3dfd9e567dd2dc71225edb6333b745c9d74480fb84b","systems":["Windows"]},{"id":"e40d5da4e1ed1e2b14cc9385b9a8240787c2263bdb268180929cd49d7307351b","systems":["Windows"]},{"id":"e5b8c869eaf4ed1dd76e81a4473d13af973a1c4d26f311bd7549fbb528d59548","systems":["Android","Linux","Mac","Windows"]},{"id":"e8c2ca1fa16d07b0bc633140c7f4c7267372776327d2b33786fadf9571f80296","systems":["Linux","Mac","Windows"]},{"id":"ea2bd21f777b1318f6b29436a8f130e4aba81598f6b265c875d91395f26363f0","systems":["Linux"]},{"id":"eb8786700cb285f8b66dfed7a7f89b81679c82821783ce132baafb4331232a07","systems":["Windows"]},{"id":"ebe6bb89f1f50703f0a9b16aa9a811e23364b51b7727e76838ba47ce3b97318e","systems":["Windows"]},{"id":"ecaadc571d87bf19b82357b79ed688524f45ad3acabfddca1ac35c84c0347bb7","systems":["Mac","Windows"]},{"id":"ef5228d685cc0002add68cf8f580286491934674d9f3094ab3603e5121bef0f6","systems":["Linux","Mac","Windows"]},{"id":"f16693b9f5287219a7f58af5e58756da91d955b745636ca415afc069bd7fcea9","systems":["Android","Linux","Mac","Windows"]},{"id":"f1c42ed6f4d10c02461df8ac32dba353b41774bd078fef7b65542518505a89a8","systems":["Windows"]},{"id":"f22362b91ed94e04188f5a5fcae637ab922495d90942446877e5e5faef01c769","systems":["Android","Linux"]},{"id":"f3d0a1c6adf2ba2e501371f1fe94f609d8b3b6b6553301016d7bb4563462c354","systems":["Other","Windows"]},{"id":"fa70209d0f75095845d088408574526f3587034c7cf714858084a8b72ee4ea51","systems":["Mac"]}],"WebKit":[{"id":"05c04fd09a389852ba5a351da462c7958bd7b565df6cd21ed4672044d2a7469a","systems":["iPhone"]},{"id":"0bbb655b0d2f5ce723514e5c76a32b773e23ace301fe630c6b36ef41f33accc6","systems":["Mac"]},{"id":"10f0f3dd57bbde9cdd7a9415badd1b0e29571804c8b6039c3309a39ae5cc12da","systems":["Mac"]},{"id":"11fbaba281483b85b0fe58e03757e2e493e30698be8c8353a6317d07c679ffb6","systems":["Mac","iPad","iPhone"]},{"id":"160b7da7c8b34d99ca566298b57045fcc15c09cc930ec2c9dfb3a5bd4dc3fe3b","systems":["iPhone"]},{"id":"192429c304aed442afd329c7f6876e046908fbb65180ad4736b014d05b65eb1c","systems":["Mac","iPhone"]},{"id":"1e9635d7cb0eb55b01ee200976616da68aa6c842189e8b1adfc82386631d2ecf","systems":["Mac","iPad","iPhone"]},{"id":"26c4799284910d7f9522750716b77537b6fc3eb26a5fd35fdbcb21908178563c","systems":["Mac"]},{"id":"2f14ec58698d0d36b08dfd0da5abf7460786a15288d604ecacfb4e869b02b54e","systems":["Mac","iPhone"]},{"id":"30e3d3be51c0defab1959f7bfe97a53fc58f3b29c4e9d92e760ab3b3ea208d13","systems":["iPhone"]},{"id":"343b7f51117b0d9e714b7cf5f1c8af18144651b8a5f6429efe8600a2338842b6","systems":["Mac"]},{"id":"360f403fe89825554170612376e03d0f6c837991d33f1c8a1072ca4fe7d0e854","systems":["Mac"]},{"id":"3869f27855578e240a33ad14a7148bc1800bd990262e39d85476c8ddda729fec","systems":["Mac"]},{"id":"3a0bc0e1c16dd2d80d6efb1865450bdc86738b3ed400e705dd19f254b0313661","systems":["Mac"]},{"id":"44529cc3409109600ef132521a63e063f6dfc765d862164eb6bd7fddb8612645","systems":["Mac"]},{"id":"45d68a18b23c8b2fd170f9f87e5982b30c2ba6eeac45cc62f27c2ce1db445303","systems":["iPhone"]},{"id":"4bb7e531e67a0d442145e11d742b4efc297165f0dd0dc60ff804e4050dd35a3a","systems":["Mac","iPhone"]},{"id":"4d110bfb433036e516043615ed8137382d2d953dd1d5c3604a53986d63d171e4","systems":["iPhone"]},{"id":"51ed73838a4acf3798dee471a5b19cdb95d4c886ebc70a9f56cbbdacb45ef338","systems":["Mac","iPad","iPhone"]},{"id":"6cac72e24b413d4013a57c855dc9208cf41e589610cbc04a94b81131c8f7efc2","systems":["iPad","iPhone"]},{"id":"6fdc7711a1853beb03121d8c6b7aab7daaddb477898f7b1eed159061396371a3","systems":["Mac"]},{"id":"84c6de48abafd7ba61726212e39fd6c7e483fbd9d8d1a643402a4f88351cf649","systems":["Mac"]},{"id":"8922bcf4f2b59c1d337005a9c3b8cbede7f0ba7438eea5840d4df80b2a467055","systems":["Mac"]},{"id":"9011f816860deb60cbb870a6466609fe52d96b67e88196e20d402cf49431aa53","systems":["iPhone"]},{"id":"94fee9e910102245a530f32f19b59b4a9413600c5a402073199137283602f9b7","systems":["Mac"]},{"id":"99b6492fdfa814272455f9273a66dd2634d8aafb50228ea693af0f7ad2d7b316","systems":["iPhone"]},{"id":"a928828a79f2d37d5cd7c7e77c6501f8aab1561a3e4b159ff3b3ce0a02e417d1","systems":["Mac"]},{"id":"d337ba0aa3e162ad400a41de328710620d06ada2f6a3db03fb04184a2e68a4a4","systems":["iPad","iPhone"]},{"id":"d49211e398d2b504a2458fade47a1c3eda5b28cdb908676e70e50ea1658c01f0","systems":["Mac","iPad"]},{"id":"e1d4e30c06e5bfb4fbf92aaa8b8df0000b6656ff6dfe39d2855af36110d2e1ad","systems":["iPhone"]},{"id":"e9769816256af8a1e0c6c8962f0c0a55186fb481b2ec8f52bb597e503bc35c32","systems":["Mac","iPad"]},{"id":"f1ce334a328b7e05946e63093e8b4fcf996aea844939ca90788da89a3168c437","systems":["Mac","iPhone"]}],"unknown":[{"id":"12fa44923ec37084aa1903bc5aed014de4a6d8529ebbc1a1adc12c8265c9466e","systems":["Linux"]}],"Goanna":[{"id":"67588498f8fc189ca52b992a9711f43ba2ae10e8fa3bd07c038d1f4774f33fc2","systems":["Windows"]}]};

		const decryptHash = (hash, data) => {
			let systems = [];
			let poolTotal = 0;
			const metricTotal = Object.keys(data).reduce((acc,item) => acc+= data[item].length, 0);
			const decryption = Object.keys(data).find(key => data[key].find(item => {
				if (!(item.id == hash)) {
					return false
				}
				systems = item.systems;
				poolTotal = data[key].length;
				return true
			}));

			const icon = {
				blink: '<span class="icon blink"></span>',
				webkit: '<span class="icon webkit"></span>',
				tor: '<span class="icon tor"></span>',
				gecko: '<span class="icon gecko"></span>',
				goanna: '<span class="icon goanna"></span>',
				cros: '<span class="icon cros"></span>',
				linux: '<span class="icon linux"></span>',
				apple: '<span class="icon apple"></span>',
				windows: '<span class="icon windows"></span>',
				android: '<span class="icon android"></span>'
			};
			const engineIcon = (
				!decryption ? '' :
					/Gecko/.test(decryption) ? icon.gecko :
						/WebKit/.test(decryption) ? icon.webkit :
							/Blink/.test(decryption) ? icon.blink :
								/Goanna/.test(decryption) ? icon.goanna :
									''
			);
			const formatPercent = n => n.toFixed(2).replace('.00', '');
			return {
				engine: decryption || 'unknown',
				engineHTML: (
					!decryption ? undefined : 
						`${engineIcon}${decryption}`
				),
				uniqueMetric: !decryption ? '0' : formatPercent(1/metricTotal*100),
				uniqueEngine: !decryption ? '0' : formatPercent(1/poolTotal*100)
			}
		};

		const { engine, engineHTML, uniqueMetric, uniqueEngine } = decryptHash($hash, decryptionData);

		return `
	<div class="col-six">
		<style>
			.html-element-version-metric-rating {
				background: linear-gradient(90deg, var(${uniqueMetric < 10 ? '--unique' : '--grey-glass'}) ${uniqueMetric}%, #fff0 ${uniqueMetric}%, #fff0 100%);
			}
			.html-element-version-class-rating {
				background: linear-gradient(90deg, var(${uniqueEngine < 10 ? '--unique' : '--grey-glass'}) ${uniqueEngine}%, #fff0 ${uniqueEngine}%, #fff0 100%);
			}
		</style>
		<strong>HTMLElement</strong><span class="hash">${hashSlice($hash)}</span>
		<div>keys (${count(keys)}): ${keys && keys.length ? modal('creep-html-element-version', keys.join(', ')) : note.blocked}</div>
		<div class="html-element-version-metric-rating help" title="% of limited html element samples">${uniqueMetric}% of samples</div>
		<div class="html-element-version-class-rating help" title="% of ${engine} class">${uniqueEngine}% of class</div>
		<div>engine: ${engineHTML || note.unknown}</div>
	</div>
	`
	};

	const getMaths = async imports => {

		const {
			require: {
				hashMini,
				captureError,
				attempt,
				documentLie,
				lieProps,
				phantomDarkness,
				logTestResult						
			}
		} = imports;

		try {
			const start = performance.now();
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
			let liedCalc = false;
			const phantomMath = phantomDarkness ? phantomDarkness.Math : Math;
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
					liedCalc = true;
					const mathLie = `expected x and got y`;
					documentLie(`Math.${prop}`, mathLie);
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
			
			const data = {};
			fns.forEach(fn => {
				data[fn[2]] = attempt(() => {
					const result = fn[0] != 'polyfill' ? phantomMath[fn[0]](...fn[1]) : fn[1];
					const chrome = result == fn[3];
					const firefox = fn[4] ? result == fn[4] : false;
					const torBrowser = fn[5] ? result == fn[5] : false;
					const safari = fn[6] ? result == fn[6] : false;
					return { result, chrome, firefox, torBrowser, safari }
				});
			});

			logTestResult({ start, test: 'math', passed: true });
			return { data, lied }
		}
		catch (error) {
			logTestResult({ test: 'math', passed: false });
			captureError(error);
			return
		}
	};

	const mathsHTML = ({ fp, modal, note, hashSlice }) => {
		if (!fp.maths) {
			return `
		<div class="col-six undefined">
			<strong>Math</strong>
			<div>0% of samples</div>
			<div>0% of class</div>
			<div>engine: ${note.blocked}</div>
			<div>results: ${note.blocked}</div>
		</div>`
		}
		const {
			maths: {
				data,
				$hash,
				lied
			}
		} = fp;

		const decryptionData = {"SpiderMonkey":[{"id":"03050b59b3b218df396977f314c284d9ebadd3e6b07de6b70d036608335cb8af","systems":["Android"]},{"id":"09525011e48d69f97b4486a09a7d84dcb702ecb091f28d27b15fdf422960b874","systems":["Windows"]},{"id":"2d6e452c59bce6d48f99f74773a0743875ff51654b96a29c1543a1de6e33bc65","systems":["Windows"]},{"id":"30acab98e0dfbe3a0263e5a8d290e363bc18dc2ce55ae2d7ff7b9086986ea896","systems":["Linux"]},{"id":"41141d85c8cee2ea78ad023124f0ee02e35f509d00742978c7b460e5737919de","systems":["Windows"]},{"id":"7eddeeb8f3046d6f473174b0351f4426f3723cd7f50716374ed496dc861b72bb","systems":["Windows"]},{"id":"870471782bc768a4dae3198669358f0d199b92d9e1c4441a3399141ff502a486","systems":["Android"]},{"id":"87b691d273993fb305b44cecf3429cdd5c5f4d387fb0e66bccaaf7670ca46915","systems":["Android","Linux","Mac","Other","Windows"]},{"id":"8edfa16a45b64ecfd3ea19845d5648eb9e54cefa46c0260ebe9f2a24b0aa7bd5","systems":["Android","Linux","Mac","Windows"]},{"id":"97c2c5b24e5a5d8ef9416e8414789e1a62839846ed63f30cfb88b05a9d3e356d","systems":["Android"]},{"id":"9fc36dcbe858faed7f5c285f6e094be4adf7a1c8255c071feec7c3bbb6c5bce6","systems":["Mac"]},{"id":"bfe705e491590fba17e322c91ef54b4993ffc120c4e72138354d0233261961d0","systems":["Windows"]},{"id":"c0cfd6235e1d51d17dff731d7931ec8375b34ac21225e13dca9963bb1541f1f5","systems":["Windows"]},{"id":"c5caa31a8076a8262b01e69e930460874c141ef82e499ca7a32e1f5d32f3744e","systems":["Windows"]},{"id":"db3f6704dd3e8feed2b5553a95a8a8575beb904af89ce64aa85d537b36b19319","systems":["Windows"]},{"id":"ddc8837ab98695120dae774f04dcf295d2414ffc03431360d46b70380224547a","systems":["Mac"]},{"id":"f631e068c862af0d29de6e1f8e26e871026181d87399df2ecec3ca03fdb95697","systems":["Android"]},{"id":"fa16daafee424c0773328418121d7a80cbb3e44909b56f2c6878a37c03c7144c","systems":["Mac"]}],"V8":[{"id":"2607501c5033cc3ca19e835f701baf381e813f6bacfd5d50955364b078b24ecf","systems":["Android","Linux","Other","Windows"]},{"id":"26b503eba678b005dca85ba4925562be0fbb2be9990159bc169d0eb00c0d2ccc","systems":["Windows"]},{"id":"87455ebb9765644fb98068ec68fbad7fcaaf2768b2cb6e1bd062eee5790c00e8","systems":["Windows"]},{"id":"89455ebb9765644fb98068ec68fbad7fcaaf2768b2cb6e1bd062eee5790c00e8","systems":["Android","Chrome OS","Linux","Mac","Windows","Windows Phone","iPhone"]}],"JavaScriptCore":[{"id":"491869fc2170fe88b6170bab918b3736d3d90188e267175a86a33fcdbb1df93f","systems":["Mac","iPhone"]},{"id":"99740c3678fd95585c1bd0b40e2fabfcf4043a7608a4e67fff2786fc3a59cf8a","systems":["Mac","iPad","iPhone"]},{"id":"b7becd10892e09fe9bd2c63a4fee0b74c2abe122f854f9b9a8088fd85c2d5e9f","systems":["Mac"]},{"id":"c1141e10c4d38a4ca1a49d9c7335fdfdcd7625b4ba04053a2f335434ec7e4d36","systems":["Mac"]}]};


		const decryptHash = (hash, data) => {
			let systems = [];
			let poolTotal = 0;
			const metricTotal = Object.keys(data).reduce((acc,item) => acc+= data[item].length, 0);
			const decryption = Object.keys(data).find(key => data[key].find(item => {
				if (!(item.id == hash)) {
					return false
				}
				systems = item.systems;
				poolTotal = data[key].length;
				return true
			}));

			const icon = {
				blink: '<span class="icon blink"></span>',
				webkit: '<span class="icon webkit"></span>',
				tor: '<span class="icon tor"></span>',
				firefox: '<span class="icon firefox"></span>',
				cros: '<span class="icon cros"></span>',
				linux: '<span class="icon linux"></span>',
				apple: '<span class="icon apple"></span>',
				windows: '<span class="icon windows"></span>',
				android: '<span class="icon android"></span>'
			};
			const engineIcon = (
				!decryption ? '' :
					/SpiderMonkey/.test(decryption) ? icon.firefox :
						/JavaScriptCore/.test(decryption) ? icon.webkit :
							/V8/.test(decryption) ? icon.blink :
								''
			);
			const systemIcon = (
				!decryption || systems.length != 1 ? '' :
					/windows/i.test(systems[0]) ? icon.windows :
						/linux/i.test(systems[0]) ? icon.linux :
							/ipad|iphone|ipod|ios|mac/i.test(systems[0]) ? icon.apple :
								/android/.test(systems[0]) ? icon.android :
									/chrome os/i.test(systems[0]) ? icon.cros :
										''
			);
			const formatPercent = n => n.toFixed(2).replace('.00', '');
			return {
				engine: decryption || 'unknown',
				engineSystem: (
					!decryption ? undefined : 
						`${engineIcon}${systemIcon}${decryption}${systems.length != 1 ? '' : ` on ${systems[0]}`}`
				),
				uniqueMetric: !decryption ? '0' : formatPercent(1/metricTotal*100),
				uniqueEngine: !decryption ? '0' : formatPercent(1/poolTotal*100)
			}
		};

		const { engine, engineSystem, uniqueMetric, uniqueEngine } = decryptHash($hash, decryptionData);

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

		.math-metric-rating {
			background: linear-gradient(90deg, var(${uniqueMetric < 10 ? '--unique' : '--grey-glass'}) ${uniqueMetric}%, #fff0 ${uniqueMetric}%, #fff0 100%);
		}
		.math-class-rating {
			background: linear-gradient(90deg, var(${uniqueEngine < 10 ? '--unique' : '--grey-glass'}) ${uniqueEngine}%, #fff0 ${uniqueEngine}%, #fff0 100%);
		}
	</style>
	<div>
	<br><span class="math-chromium">C - Chromium</span>
	<br><span class="math-firefox">F - Firefox</span>
	<br><span class="math-tor-browser">T - Tor Browser</span>
	<br><span class="math-safari">S - Safari</span>
	</div>`;

		const results = Object.keys(data).map(key => {
			const value = data[key];
			const { result, chrome, firefox, torBrowser, safari } = value;
			return `
		${chrome ? '<span class="math-chromium">C</span>' : '<span class="math-blank-false">-</span>'}${firefox ? '<span class="math-firefox">F</span>' : '<span class="math-blank-false">-</span>'}${torBrowser ? '<span class="math-tor-browser">T</span>' : '<span class="math-blank-false">-</span>'}${safari ? '<span class="math-safari">S</span>' : '<span class="math-blank-false">-</span>'} ${key}`
		});

		return `
	<div class="col-six${lied ? ' rejected' : ''}">
		<strong>Math</strong><span class="${lied ? 'lies ' : ''}hash">${hashSlice($hash)}</span>
		<div class="math-metric-rating help" title="% of math samples">${uniqueMetric}% of samples</div>
		<div class="math-class-rating help" title="% of ${engine} class">${uniqueEngine}% of class</div>
		<div>engine: ${engineSystem || note.unknown}</div>
		<div>results: ${
			!data ? note.blocked : 
			modal(
				'creep-maths',
				header+results.join('<br>')
			)
		}</div>
	</div>
	`
	};

	// inspired by 
	// - https://privacycheck.sec.lrz.de/active/fp_cpt/fp_can_play_type.html
	// - https://arkenfox.github.io/TZP
	const mimeTypes = ['application/mp21', 'application/mp4', 'application/octet-stream', 'application/ogg', 'application/vnd.apple.mpegurl', 'application/vnd.ms-ss', 'application/vnd.ms-sstr+xml', 'application/x-mpegurl', 'application/x-mpegURL; codecs="avc1.42E01E"', 'audio/3gpp', 'audio/3gpp2', 'audio/aac', 'audio/ac-3', 'audio/ac3', 'audio/aiff', 'audio/basic', 'audio/ec-3', 'audio/flac', 'audio/m4a', 'audio/mid', 'audio/midi', 'audio/mp3', 'audio/mp4', 'audio/mp4; codecs="a3ds"', 'audio/mp4; codecs="A52"', 'audio/mp4; codecs="aac"', 'audio/mp4; codecs="ac-3"', 'audio/mp4; codecs="ac-4"', 'audio/mp4; codecs="ac3"', 'audio/mp4; codecs="alac"', 'audio/mp4; codecs="alaw"', 'audio/mp4; codecs="bogus"', 'audio/mp4; codecs="dra1"', 'audio/mp4; codecs="dts-"', 'audio/mp4; codecs="dts+"', 'audio/mp4; codecs="dtsc"', 'audio/mp4; codecs="dtse"', 'audio/mp4; codecs="dtsh"', 'audio/mp4; codecs="dtsl"', 'audio/mp4; codecs="dtsx"', 'audio/mp4; codecs="ec-3"', 'audio/mp4; codecs="enca"', 'audio/mp4; codecs="flac"', 'audio/mp4; codecs="g719"', 'audio/mp4; codecs="g726"', 'audio/mp4; codecs="m4ae"', 'audio/mp4; codecs="mha1"', 'audio/mp4; codecs="mha2"', 'audio/mp4; codecs="mhm1"', 'audio/mp4; codecs="mhm2"', 'audio/mp4; codecs="mlpa"', 'audio/mp4; codecs="mp3"', 'audio/mp4; codecs="mp4a.40.1"', 'audio/mp4; codecs="mp4a.40.12"', 'audio/mp4; codecs="mp4a.40.13"', 'audio/mp4; codecs="mp4a.40.14"', 'audio/mp4; codecs="mp4a.40.15"', 'audio/mp4; codecs="mp4a.40.16"', 'audio/mp4; codecs="mp4a.40.17"', 'audio/mp4; codecs="mp4a.40.19"', 'audio/mp4; codecs="mp4a.40.2"', 'audio/mp4; codecs="mp4a.40.20"', 'audio/mp4; codecs="mp4a.40.21"', 'audio/mp4; codecs="mp4a.40.22"', 'audio/mp4; codecs="mp4a.40.23"', 'audio/mp4; codecs="mp4a.40.24"', 'audio/mp4; codecs="mp4a.40.25"', 'audio/mp4; codecs="mp4a.40.26"', 'audio/mp4; codecs="mp4a.40.27"', 'audio/mp4; codecs="mp4a.40.28"', 'audio/mp4; codecs="mp4a.40.29"', 'audio/mp4; codecs="mp4a.40.3"', 'audio/mp4; codecs="mp4a.40.32"', 'audio/mp4; codecs="mp4a.40.33"', 'audio/mp4; codecs="mp4a.40.34"', 'audio/mp4; codecs="mp4a.40.35"', 'audio/mp4; codecs="mp4a.40.36"', 'audio/mp4; codecs="mp4a.40.4"', 'audio/mp4; codecs="mp4a.40.5"', 'audio/mp4; codecs="mp4a.40.6"', 'audio/mp4; codecs="mp4a.40.7"', 'audio/mp4; codecs="mp4a.40.8"', 'audio/mp4; codecs="mp4a.40.9"', 'audio/mp4; codecs="mp4a.40"', 'audio/mp4; codecs="mp4a.66"', 'audio/mp4; codecs="mp4a.67"', 'audio/mp4; codecs="mp4a.68"', 'audio/mp4; codecs="mp4a.69"', 'audio/mp4; codecs="mp4a.6B"', 'audio/mp4; codecs="mp4a"', 'audio/mp4; codecs="Opus"', 'audio/mp4; codecs="raw "', 'audio/mp4; codecs="samr"', 'audio/mp4; codecs="sawb"', 'audio/mp4; codecs="sawp"', 'audio/mp4; codecs="sevc"', 'audio/mp4; codecs="sqcp"', 'audio/mp4; codecs="ssmv"', 'audio/mp4; codecs="twos"', 'audio/mp4; codecs="ulaw"', 'audio/mpeg', 'audio/mpeg; codecs="mp3"', 'audio/mpegurl', 'audio/ogg; codecs="flac"', 'audio/ogg; codecs="opus"', 'audio/ogg; codecs="speex"', 'audio/ogg; codecs="vorbis"', 'audio/vnd.rn-realaudio', 'audio/vnd.wave', 'audio/wav', 'audio/wav; codecs="0"', 'audio/wav; codecs="1"', 'audio/wav; codecs="2"', 'audio/wave', 'audio/wave; codecs="0"', 'audio/wave; codecs="1"', 'audio/wave; codecs="2"', 'audio/webm', 'audio/webm; codecs="opus"', 'audio/webm; codecs="vorbis"', 'audio/wma', 'audio/x-aac', 'audio/x-ac3', 'audio/x-aiff', 'audio/x-flac', 'audio/x-m4a', 'audio/x-midi', 'audio/x-mpeg', 'audio/x-mpegurl', 'audio/x-pn-realaudio', 'audio/x-pn-realaudio-plugin', 'audio/x-pn-wav', 'audio/x-pn-wav; codecs="0"', 'audio/x-pn-wav; codecs="1"', 'audio/x-pn-wav; codecs="2"', 'audio/x-scpls', 'audio/x-wav', 'audio/x-wav; codecs="0"', 'audio/x-wav; codecs="1"', 'audio/x-wav; codecs="2"', 'video/3gpp', 'video/3gpp; codecs="mp4v.20.8, samr"', 'video/3gpp2', 'video/avi', 'video/h263', 'video/mp2t', 'video/mp4', 'video/mp4; codecs="3gvo"', 'video/mp4; codecs="a3d1"', 'video/mp4; codecs="a3d2"', 'video/mp4; codecs="a3d3"', 'video/mp4; codecs="a3d4"', 'video/mp4; codecs="av01.0.08M.08"', 'video/mp4; codecs="avc1.2c000a"', 'video/mp4; codecs="avc1.2c000b"', 'video/mp4; codecs="avc1.2c000c"', 'video/mp4; codecs="avc1.2c000d"', 'video/mp4; codecs="avc1.2c0014"', 'video/mp4; codecs="avc1.2c0015"', 'video/mp4; codecs="avc1.2c0016"', 'video/mp4; codecs="avc1.2c001e"', 'video/mp4; codecs="avc1.2c001f"', 'video/mp4; codecs="avc1.2c0020"', 'video/mp4; codecs="avc1.2c0028"', 'video/mp4; codecs="avc1.2c0029"', 'video/mp4; codecs="avc1.2c002a"', 'video/mp4; codecs="avc1.2c0032"', 'video/mp4; codecs="avc1.2c0033"', 'video/mp4; codecs="avc1.2c0034"', 'video/mp4; codecs="avc1.2c003c"', 'video/mp4; codecs="avc1.2c003d"', 'video/mp4; codecs="avc1.2c003e"', 'video/mp4; codecs="avc1.2c003f"', 'video/mp4; codecs="avc1.2c0040"', 'video/mp4; codecs="avc1.2c0050"', 'video/mp4; codecs="avc1.2c006e"', 'video/mp4; codecs="avc1.2c0085"', 'video/mp4; codecs="avc1.42000a"', 'video/mp4; codecs="avc1.42000b"', 'video/mp4; codecs="avc1.42000c"', 'video/mp4; codecs="avc1.42000d"', 'video/mp4; codecs="avc1.420014"', 'video/mp4; codecs="avc1.420015"', 'video/mp4; codecs="avc1.420016"', 'video/mp4; codecs="avc1.42001e"', 'video/mp4; codecs="avc1.42001f"', 'video/mp4; codecs="avc1.420020"', 'video/mp4; codecs="avc1.420028"', 'video/mp4; codecs="avc1.420029"', 'video/mp4; codecs="avc1.42002a"', 'video/mp4; codecs="avc1.420032"', 'video/mp4; codecs="avc1.420033"', 'video/mp4; codecs="avc1.420034"', 'video/mp4; codecs="avc1.42003c"', 'video/mp4; codecs="avc1.42003d"', 'video/mp4; codecs="avc1.42003e"', 'video/mp4; codecs="avc1.42003f"', 'video/mp4; codecs="avc1.420040"', 'video/mp4; codecs="avc1.420050"', 'video/mp4; codecs="avc1.42006e"', 'video/mp4; codecs="avc1.420085"', 'video/mp4; codecs="avc1.42400a"', 'video/mp4; codecs="avc1.42400b"', 'video/mp4; codecs="avc1.42400c"', 'video/mp4; codecs="avc1.42400d"', 'video/mp4; codecs="avc1.424014"', 'video/mp4; codecs="avc1.424015"', 'video/mp4; codecs="avc1.424016"', 'video/mp4; codecs="avc1.42401e"', 'video/mp4; codecs="avc1.42401f"', 'video/mp4; codecs="avc1.424020"', 'video/mp4; codecs="avc1.424028"', 'video/mp4; codecs="avc1.424029"', 'video/mp4; codecs="avc1.42402a"', 'video/mp4; codecs="avc1.424032"', 'video/mp4; codecs="avc1.424033"', 'video/mp4; codecs="avc1.424034"', 'video/mp4; codecs="avc1.42403c"', 'video/mp4; codecs="avc1.42403d"', 'video/mp4; codecs="avc1.42403e"', 'video/mp4; codecs="avc1.42403f"', 'video/mp4; codecs="avc1.424040"', 'video/mp4; codecs="avc1.424050"', 'video/mp4; codecs="avc1.42406e"', 'video/mp4; codecs="avc1.424085"', 'video/mp4; codecs="avc1.4d000a"', 'video/mp4; codecs="avc1.4d000b"', 'video/mp4; codecs="avc1.4d000c"', 'video/mp4; codecs="avc1.4d000d"', 'video/mp4; codecs="avc1.4d0014"', 'video/mp4; codecs="avc1.4d0015"', 'video/mp4; codecs="avc1.4d0016"', 'video/mp4; codecs="avc1.4d001e"', 'video/mp4; codecs="avc1.4d001f"', 'video/mp4; codecs="avc1.4d0020"', 'video/mp4; codecs="avc1.4d0028"', 'video/mp4; codecs="avc1.4d0029"', 'video/mp4; codecs="avc1.4d002a"', 'video/mp4; codecs="avc1.4d0032"', 'video/mp4; codecs="avc1.4d0033"', 'video/mp4; codecs="avc1.4d0034"', 'video/mp4; codecs="avc1.4d003c"', 'video/mp4; codecs="avc1.4d003d"', 'video/mp4; codecs="avc1.4d003e"', 'video/mp4; codecs="avc1.4d003f"', 'video/mp4; codecs="avc1.4d0040"', 'video/mp4; codecs="avc1.4d0050"', 'video/mp4; codecs="avc1.4d006e"', 'video/mp4; codecs="avc1.4d0085"', 'video/mp4; codecs="avc1.4d400a"', 'video/mp4; codecs="avc1.4d400b"', 'video/mp4; codecs="avc1.4d400c"', 'video/mp4; codecs="avc1.4d400d"', 'video/mp4; codecs="avc1.4d4014"', 'video/mp4; codecs="avc1.4d4015"', 'video/mp4; codecs="avc1.4d4016"', 'video/mp4; codecs="avc1.4d401e"', 'video/mp4; codecs="avc1.4d401f"', 'video/mp4; codecs="avc1.4d4020"', 'video/mp4; codecs="avc1.4d4028"', 'video/mp4; codecs="avc1.4d4029"', 'video/mp4; codecs="avc1.4d402a"', 'video/mp4; codecs="avc1.4d4032"', 'video/mp4; codecs="avc1.4d4033"', 'video/mp4; codecs="avc1.4d4034"', 'video/mp4; codecs="avc1.4d403c"', 'video/mp4; codecs="avc1.4d403d"', 'video/mp4; codecs="avc1.4d403e"', 'video/mp4; codecs="avc1.4d403f"', 'video/mp4; codecs="avc1.4d4040"', 'video/mp4; codecs="avc1.4d4050"', 'video/mp4; codecs="avc1.4d406e"', 'video/mp4; codecs="avc1.4d4085"', 'video/mp4; codecs="avc1.53000a"', 'video/mp4; codecs="avc1.53000b"', 'video/mp4; codecs="avc1.53000c"', 'video/mp4; codecs="avc1.53000d"', 'video/mp4; codecs="avc1.530014"', 'video/mp4; codecs="avc1.530015"', 'video/mp4; codecs="avc1.530016"', 'video/mp4; codecs="avc1.53001e"', 'video/mp4; codecs="avc1.53001f"', 'video/mp4; codecs="avc1.530020"', 'video/mp4; codecs="avc1.530028"', 'video/mp4; codecs="avc1.530029"', 'video/mp4; codecs="avc1.53002a"', 'video/mp4; codecs="avc1.530032"', 'video/mp4; codecs="avc1.530033"', 'video/mp4; codecs="avc1.530034"', 'video/mp4; codecs="avc1.53003c"', 'video/mp4; codecs="avc1.53003d"', 'video/mp4; codecs="avc1.53003e"', 'video/mp4; codecs="avc1.53003f"', 'video/mp4; codecs="avc1.530040"', 'video/mp4; codecs="avc1.530050"', 'video/mp4; codecs="avc1.53006e"', 'video/mp4; codecs="avc1.530085"', 'video/mp4; codecs="avc1.53040a"', 'video/mp4; codecs="avc1.53040b"', 'video/mp4; codecs="avc1.53040c"', 'video/mp4; codecs="avc1.53040d"', 'video/mp4; codecs="avc1.530414"', 'video/mp4; codecs="avc1.530415"', 'video/mp4; codecs="avc1.530416"', 'video/mp4; codecs="avc1.53041e"', 'video/mp4; codecs="avc1.53041f"', 'video/mp4; codecs="avc1.530420"', 'video/mp4; codecs="avc1.530428"', 'video/mp4; codecs="avc1.530429"', 'video/mp4; codecs="avc1.53042a"', 'video/mp4; codecs="avc1.530432"', 'video/mp4; codecs="avc1.530433"', 'video/mp4; codecs="avc1.530434"', 'video/mp4; codecs="avc1.53043c"', 'video/mp4; codecs="avc1.53043d"', 'video/mp4; codecs="avc1.53043e"', 'video/mp4; codecs="avc1.53043f"', 'video/mp4; codecs="avc1.530440"', 'video/mp4; codecs="avc1.530450"', 'video/mp4; codecs="avc1.53046e"', 'video/mp4; codecs="avc1.530485"', 'video/mp4; codecs="avc1.56000a"', 'video/mp4; codecs="avc1.56000b"', 'video/mp4; codecs="avc1.56000c"', 'video/mp4; codecs="avc1.56000d"', 'video/mp4; codecs="avc1.560014"', 'video/mp4; codecs="avc1.560015"', 'video/mp4; codecs="avc1.560016"', 'video/mp4; codecs="avc1.56001e"', 'video/mp4; codecs="avc1.56001f"', 'video/mp4; codecs="avc1.560020"', 'video/mp4; codecs="avc1.560028"', 'video/mp4; codecs="avc1.560029"', 'video/mp4; codecs="avc1.56002a"', 'video/mp4; codecs="avc1.560032"', 'video/mp4; codecs="avc1.560033"', 'video/mp4; codecs="avc1.560034"', 'video/mp4; codecs="avc1.56003c"', 'video/mp4; codecs="avc1.56003d"', 'video/mp4; codecs="avc1.56003e"', 'video/mp4; codecs="avc1.56003f"', 'video/mp4; codecs="avc1.560040"', 'video/mp4; codecs="avc1.560050"', 'video/mp4; codecs="avc1.56006e"', 'video/mp4; codecs="avc1.560085"', 'video/mp4; codecs="avc1.56040a"', 'video/mp4; codecs="avc1.56040b"', 'video/mp4; codecs="avc1.56040c"', 'video/mp4; codecs="avc1.56040d"', 'video/mp4; codecs="avc1.560414"', 'video/mp4; codecs="avc1.560415"', 'video/mp4; codecs="avc1.560416"', 'video/mp4; codecs="avc1.56041e"', 'video/mp4; codecs="avc1.56041f"', 'video/mp4; codecs="avc1.560420"', 'video/mp4; codecs="avc1.560428"', 'video/mp4; codecs="avc1.560429"', 'video/mp4; codecs="avc1.56042a"', 'video/mp4; codecs="avc1.560432"', 'video/mp4; codecs="avc1.560433"', 'video/mp4; codecs="avc1.560434"', 'video/mp4; codecs="avc1.56043c"', 'video/mp4; codecs="avc1.56043d"', 'video/mp4; codecs="avc1.56043e"', 'video/mp4; codecs="avc1.56043f"', 'video/mp4; codecs="avc1.560440"', 'video/mp4; codecs="avc1.560450"', 'video/mp4; codecs="avc1.56046e"', 'video/mp4; codecs="avc1.560485"', 'video/mp4; codecs="avc1.56100a"', 'video/mp4; codecs="avc1.56100b"', 'video/mp4; codecs="avc1.56100c"', 'video/mp4; codecs="avc1.56100d"', 'video/mp4; codecs="avc1.561014"', 'video/mp4; codecs="avc1.561015"', 'video/mp4; codecs="avc1.561016"', 'video/mp4; codecs="avc1.56101e"', 'video/mp4; codecs="avc1.56101f"', 'video/mp4; codecs="avc1.561020"', 'video/mp4; codecs="avc1.561028"', 'video/mp4; codecs="avc1.561029"', 'video/mp4; codecs="avc1.56102a"', 'video/mp4; codecs="avc1.561032"', 'video/mp4; codecs="avc1.561033"', 'video/mp4; codecs="avc1.561034"', 'video/mp4; codecs="avc1.56103c"', 'video/mp4; codecs="avc1.56103d"', 'video/mp4; codecs="avc1.56103e"', 'video/mp4; codecs="avc1.56103f"', 'video/mp4; codecs="avc1.561040"', 'video/mp4; codecs="avc1.561050"', 'video/mp4; codecs="avc1.56106e"', 'video/mp4; codecs="avc1.561085"', 'video/mp4; codecs="avc1.58000a"', 'video/mp4; codecs="avc1.58000b"', 'video/mp4; codecs="avc1.58000c"', 'video/mp4; codecs="avc1.58000d"', 'video/mp4; codecs="avc1.580014"', 'video/mp4; codecs="avc1.580015"', 'video/mp4; codecs="avc1.580016"', 'video/mp4; codecs="avc1.58001e"', 'video/mp4; codecs="avc1.58001f"', 'video/mp4; codecs="avc1.580020"', 'video/mp4; codecs="avc1.580028"', 'video/mp4; codecs="avc1.580029"', 'video/mp4; codecs="avc1.58002a"', 'video/mp4; codecs="avc1.580032"', 'video/mp4; codecs="avc1.580033"', 'video/mp4; codecs="avc1.580034"', 'video/mp4; codecs="avc1.58003c"', 'video/mp4; codecs="avc1.58003d"', 'video/mp4; codecs="avc1.58003e"', 'video/mp4; codecs="avc1.58003f"', 'video/mp4; codecs="avc1.580040"', 'video/mp4; codecs="avc1.580050"', 'video/mp4; codecs="avc1.58006e"', 'video/mp4; codecs="avc1.580085"', 'video/mp4; codecs="avc1.64000a"', 'video/mp4; codecs="avc1.64000b"', 'video/mp4; codecs="avc1.64000c"', 'video/mp4; codecs="avc1.64000d"', 'video/mp4; codecs="avc1.640014"', 'video/mp4; codecs="avc1.640015"', 'video/mp4; codecs="avc1.640016"', 'video/mp4; codecs="avc1.64001e"', 'video/mp4; codecs="avc1.64001f"', 'video/mp4; codecs="avc1.640020"', 'video/mp4; codecs="avc1.640028"', 'video/mp4; codecs="avc1.640029"', 'video/mp4; codecs="avc1.64002a"', 'video/mp4; codecs="avc1.640032"', 'video/mp4; codecs="avc1.640033"', 'video/mp4; codecs="avc1.640034"', 'video/mp4; codecs="avc1.64003c"', 'video/mp4; codecs="avc1.64003d"', 'video/mp4; codecs="avc1.64003e"', 'video/mp4; codecs="avc1.64003f"', 'video/mp4; codecs="avc1.640040"', 'video/mp4; codecs="avc1.640050"', 'video/mp4; codecs="avc1.64006e"', 'video/mp4; codecs="avc1.640085"', 'video/mp4; codecs="avc1.64080a"', 'video/mp4; codecs="avc1.64080b"', 'video/mp4; codecs="avc1.64080c"', 'video/mp4; codecs="avc1.64080d"', 'video/mp4; codecs="avc1.640814"', 'video/mp4; codecs="avc1.640815"', 'video/mp4; codecs="avc1.640816"', 'video/mp4; codecs="avc1.64081e"', 'video/mp4; codecs="avc1.64081f"', 'video/mp4; codecs="avc1.640820"', 'video/mp4; codecs="avc1.640828"', 'video/mp4; codecs="avc1.640829"', 'video/mp4; codecs="avc1.64082a"', 'video/mp4; codecs="avc1.640832"', 'video/mp4; codecs="avc1.640833"', 'video/mp4; codecs="avc1.640834"', 'video/mp4; codecs="avc1.64083c"', 'video/mp4; codecs="avc1.64083d"', 'video/mp4; codecs="avc1.64083e"', 'video/mp4; codecs="avc1.64083f"', 'video/mp4; codecs="avc1.640840"', 'video/mp4; codecs="avc1.640850"', 'video/mp4; codecs="avc1.64086e"', 'video/mp4; codecs="avc1.640885"', 'video/mp4; codecs="avc1.6e000a"', 'video/mp4; codecs="avc1.6e000b"', 'video/mp4; codecs="avc1.6e000c"', 'video/mp4; codecs="avc1.6e000d"', 'video/mp4; codecs="avc1.6e0014"', 'video/mp4; codecs="avc1.6e0015"', 'video/mp4; codecs="avc1.6e0016"', 'video/mp4; codecs="avc1.6e001e"', 'video/mp4; codecs="avc1.6e001f"', 'video/mp4; codecs="avc1.6e0020"', 'video/mp4; codecs="avc1.6e0028"', 'video/mp4; codecs="avc1.6e0029"', 'video/mp4; codecs="avc1.6e002a"', 'video/mp4; codecs="avc1.6e0032"', 'video/mp4; codecs="avc1.6e0033"', 'video/mp4; codecs="avc1.6e0034"', 'video/mp4; codecs="avc1.6e003c"', 'video/mp4; codecs="avc1.6e003d"', 'video/mp4; codecs="avc1.6e003e"', 'video/mp4; codecs="avc1.6e003f"', 'video/mp4; codecs="avc1.6e0040"', 'video/mp4; codecs="avc1.6e0050"', 'video/mp4; codecs="avc1.6e006e"', 'video/mp4; codecs="avc1.6e0085"', 'video/mp4; codecs="avc1.6e100a"', 'video/mp4; codecs="avc1.6e100b"', 'video/mp4; codecs="avc1.6e100c"', 'video/mp4; codecs="avc1.6e100d"', 'video/mp4; codecs="avc1.6e1014"', 'video/mp4; codecs="avc1.6e1015"', 'video/mp4; codecs="avc1.6e1016"', 'video/mp4; codecs="avc1.6e101e"', 'video/mp4; codecs="avc1.6e101f"', 'video/mp4; codecs="avc1.6e1020"', 'video/mp4; codecs="avc1.6e1028"', 'video/mp4; codecs="avc1.6e1029"', 'video/mp4; codecs="avc1.6e102a"', 'video/mp4; codecs="avc1.6e1032"', 'video/mp4; codecs="avc1.6e1033"', 'video/mp4; codecs="avc1.6e1034"', 'video/mp4; codecs="avc1.6e103c"', 'video/mp4; codecs="avc1.6e103d"', 'video/mp4; codecs="avc1.6e103e"', 'video/mp4; codecs="avc1.6e103f"', 'video/mp4; codecs="avc1.6e1040"', 'video/mp4; codecs="avc1.6e1050"', 'video/mp4; codecs="avc1.6e106e"', 'video/mp4; codecs="avc1.6e1085"', 'video/mp4; codecs="avc1.76000a"', 'video/mp4; codecs="avc1.76000b"', 'video/mp4; codecs="avc1.76000c"', 'video/mp4; codecs="avc1.76000d"', 'video/mp4; codecs="avc1.760014"', 'video/mp4; codecs="avc1.760015"', 'video/mp4; codecs="avc1.760016"', 'video/mp4; codecs="avc1.76001e"', 'video/mp4; codecs="avc1.76001f"', 'video/mp4; codecs="avc1.760020"', 'video/mp4; codecs="avc1.760028"', 'video/mp4; codecs="avc1.760029"', 'video/mp4; codecs="avc1.76002a"', 'video/mp4; codecs="avc1.760032"', 'video/mp4; codecs="avc1.760033"', 'video/mp4; codecs="avc1.760034"', 'video/mp4; codecs="avc1.76003c"', 'video/mp4; codecs="avc1.76003d"', 'video/mp4; codecs="avc1.76003e"', 'video/mp4; codecs="avc1.76003f"', 'video/mp4; codecs="avc1.760040"', 'video/mp4; codecs="avc1.760050"', 'video/mp4; codecs="avc1.76006e"', 'video/mp4; codecs="avc1.760085"', 'video/mp4; codecs="avc1.7a000a"', 'video/mp4; codecs="avc1.7a000b"', 'video/mp4; codecs="avc1.7a000c"', 'video/mp4; codecs="avc1.7a000d"', 'video/mp4; codecs="avc1.7a0014"', 'video/mp4; codecs="avc1.7a0015"', 'video/mp4; codecs="avc1.7a0016"', 'video/mp4; codecs="avc1.7a001e"', 'video/mp4; codecs="avc1.7a001f"', 'video/mp4; codecs="avc1.7a0020"', 'video/mp4; codecs="avc1.7a0028"', 'video/mp4; codecs="avc1.7a0029"', 'video/mp4; codecs="avc1.7a002a"', 'video/mp4; codecs="avc1.7a0032"', 'video/mp4; codecs="avc1.7a0033"', 'video/mp4; codecs="avc1.7a0034"', 'video/mp4; codecs="avc1.7a003c"', 'video/mp4; codecs="avc1.7a003d"', 'video/mp4; codecs="avc1.7a003e"', 'video/mp4; codecs="avc1.7a003f"', 'video/mp4; codecs="avc1.7a0040"', 'video/mp4; codecs="avc1.7a0050"', 'video/mp4; codecs="avc1.7a006e"', 'video/mp4; codecs="avc1.7a0085"', 'video/mp4; codecs="avc1.7a100a"', 'video/mp4; codecs="avc1.7a100b"', 'video/mp4; codecs="avc1.7a100c"', 'video/mp4; codecs="avc1.7a100d"', 'video/mp4; codecs="avc1.7a1014"', 'video/mp4; codecs="avc1.7a1015"', 'video/mp4; codecs="avc1.7a1016"', 'video/mp4; codecs="avc1.7a101e"', 'video/mp4; codecs="avc1.7a101f"', 'video/mp4; codecs="avc1.7a1020"', 'video/mp4; codecs="avc1.7a1028"', 'video/mp4; codecs="avc1.7a1029"', 'video/mp4; codecs="avc1.7a102a"', 'video/mp4; codecs="avc1.7a1032"', 'video/mp4; codecs="avc1.7a1033"', 'video/mp4; codecs="avc1.7a1034"', 'video/mp4; codecs="avc1.7a103c"', 'video/mp4; codecs="avc1.7a103d"', 'video/mp4; codecs="avc1.7a103e"', 'video/mp4; codecs="avc1.7a103f"', 'video/mp4; codecs="avc1.7a1040"', 'video/mp4; codecs="avc1.7a1050"', 'video/mp4; codecs="avc1.7a106e"', 'video/mp4; codecs="avc1.7a1085"', 'video/mp4; codecs="avc1.80000a"', 'video/mp4; codecs="avc1.80000b"', 'video/mp4; codecs="avc1.80000c"', 'video/mp4; codecs="avc1.80000d"', 'video/mp4; codecs="avc1.800014"', 'video/mp4; codecs="avc1.800015"', 'video/mp4; codecs="avc1.800016"', 'video/mp4; codecs="avc1.80001e"', 'video/mp4; codecs="avc1.80001f"', 'video/mp4; codecs="avc1.800020"', 'video/mp4; codecs="avc1.800028"', 'video/mp4; codecs="avc1.800029"', 'video/mp4; codecs="avc1.80002a"', 'video/mp4; codecs="avc1.800032"', 'video/mp4; codecs="avc1.800033"', 'video/mp4; codecs="avc1.800034"', 'video/mp4; codecs="avc1.80003c"', 'video/mp4; codecs="avc1.80003d"', 'video/mp4; codecs="avc1.80003e"', 'video/mp4; codecs="avc1.80003f"', 'video/mp4; codecs="avc1.800040"', 'video/mp4; codecs="avc1.800050"', 'video/mp4; codecs="avc1.80006e"', 'video/mp4; codecs="avc1.800085"', 'video/mp4; codecs="avc1.8a000a"', 'video/mp4; codecs="avc1.8a000b"', 'video/mp4; codecs="avc1.8a000c"', 'video/mp4; codecs="avc1.8a000d"', 'video/mp4; codecs="avc1.8a0014"', 'video/mp4; codecs="avc1.8a0015"', 'video/mp4; codecs="avc1.8a0016"', 'video/mp4; codecs="avc1.8a001e"', 'video/mp4; codecs="avc1.8a001f"', 'video/mp4; codecs="avc1.8a0020"', 'video/mp4; codecs="avc1.8a0028"', 'video/mp4; codecs="avc1.8a0029"', 'video/mp4; codecs="avc1.8a002a"', 'video/mp4; codecs="avc1.8a0032"', 'video/mp4; codecs="avc1.8a0033"', 'video/mp4; codecs="avc1.8a0034"', 'video/mp4; codecs="avc1.8a003c"', 'video/mp4; codecs="avc1.8a003d"', 'video/mp4; codecs="avc1.8a003e"', 'video/mp4; codecs="avc1.8a003f"', 'video/mp4; codecs="avc1.8a0040"', 'video/mp4; codecs="avc1.8a0050"', 'video/mp4; codecs="avc1.8a006e"', 'video/mp4; codecs="avc1.8a0085"', 'video/mp4; codecs="avc1.f4000a"', 'video/mp4; codecs="avc1.f4000b"', 'video/mp4; codecs="avc1.f4000c"', 'video/mp4; codecs="avc1.f4000d"', 'video/mp4; codecs="avc1.f40014"', 'video/mp4; codecs="avc1.f40015"', 'video/mp4; codecs="avc1.f40016"', 'video/mp4; codecs="avc1.f4001e"', 'video/mp4; codecs="avc1.f4001f"', 'video/mp4; codecs="avc1.f40020"', 'video/mp4; codecs="avc1.f40028"', 'video/mp4; codecs="avc1.f40029"', 'video/mp4; codecs="avc1.f4002a"', 'video/mp4; codecs="avc1.f40032"', 'video/mp4; codecs="avc1.f40033"', 'video/mp4; codecs="avc1.f40034"', 'video/mp4; codecs="avc1.f4003c"', 'video/mp4; codecs="avc1.f4003d"', 'video/mp4; codecs="avc1.f4003e"', 'video/mp4; codecs="avc1.f4003f"', 'video/mp4; codecs="avc1.f40040"', 'video/mp4; codecs="avc1.f40050"', 'video/mp4; codecs="avc1.f4006e"', 'video/mp4; codecs="avc1.f40085"', 'video/mp4; codecs="avc1.f4100a"', 'video/mp4; codecs="avc1.f4100b"', 'video/mp4; codecs="avc1.f4100c"', 'video/mp4; codecs="avc1.f4100d"', 'video/mp4; codecs="avc1.f41014"', 'video/mp4; codecs="avc1.f41015"', 'video/mp4; codecs="avc1.f41016"', 'video/mp4; codecs="avc1.f4101e"', 'video/mp4; codecs="avc1.f4101f"', 'video/mp4; codecs="avc1.f41020"', 'video/mp4; codecs="avc1.f41028"', 'video/mp4; codecs="avc1.f41029"', 'video/mp4; codecs="avc1.f4102a"', 'video/mp4; codecs="avc1.f41032"', 'video/mp4; codecs="avc1.f41033"', 'video/mp4; codecs="avc1.f41034"', 'video/mp4; codecs="avc1.f4103c"', 'video/mp4; codecs="avc1.f4103d"', 'video/mp4; codecs="avc1.f4103e"', 'video/mp4; codecs="avc1.f4103f"', 'video/mp4; codecs="avc1.f41040"', 'video/mp4; codecs="avc1.f41050"', 'video/mp4; codecs="avc1.f4106e"', 'video/mp4; codecs="avc1.f41085"', 'video/mp4; codecs="avc1"', 'video/mp4; codecs="avc2"', 'video/mp4; codecs="avc3"', 'video/mp4; codecs="avc4"', 'video/mp4; codecs="avcp"', 'video/mp4; codecs="drac"', 'video/mp4; codecs="dvav"', 'video/mp4; codecs="dvhe"', 'video/mp4; codecs="encf"', 'video/mp4; codecs="encm"', 'video/mp4; codecs="encs"', 'video/mp4; codecs="enct"', 'video/mp4; codecs="encv"', 'video/mp4; codecs="fdp "', 'video/mp4; codecs="hev1.1.6.L93.90"', 'video/mp4; codecs="hev1.1.6.L93.B0"', 'video/mp4; codecs="hev1"', 'video/mp4; codecs="hvc1.1.6.L93.90"', 'video/mp4; codecs="hvc1.1.6.L93.B0"', 'video/mp4; codecs="hvc1"', 'video/mp4; codecs="hvt1"', 'video/mp4; codecs="ixse"', 'video/mp4; codecs="lhe1"', 'video/mp4; codecs="lht1"', 'video/mp4; codecs="lhv1"', 'video/mp4; codecs="m2ts"', 'video/mp4; codecs="mett"', 'video/mp4; codecs="metx"', 'video/mp4; codecs="mjp2"', 'video/mp4; codecs="mlix"', 'video/mp4; codecs="mp4s"', 'video/mp4; codecs="mp4v"', 'video/mp4; codecs="mvc1"', 'video/mp4; codecs="mvc2"', 'video/mp4; codecs="mvc3"', 'video/mp4; codecs="mvc4"', 'video/mp4; codecs="mvd1"', 'video/mp4; codecs="mvd2"', 'video/mp4; codecs="mvd3"', 'video/mp4; codecs="mvd4"', 'video/mp4; codecs="oksd"', 'video/mp4; codecs="pm2t"', 'video/mp4; codecs="prtp"', 'video/mp4; codecs="resv"', 'video/mp4; codecs="rm2t"', 'video/mp4; codecs="rrtp"', 'video/mp4; codecs="rsrp"', 'video/mp4; codecs="rtmd"', 'video/mp4; codecs="rtp "', 'video/mp4; codecs="s263"', 'video/mp4; codecs="sm2t"', 'video/mp4; codecs="srtp"', 'video/mp4; codecs="STGS"', 'video/mp4; codecs="stpp"', 'video/mp4; codecs="svc1"', 'video/mp4; codecs="svc2"', 'video/mp4; codecs="svcM"', 'video/mp4; codecs="tc64"', 'video/mp4; codecs="tmcd"', 'video/mp4; codecs="tx3g"', 'video/mp4; codecs="unid"', 'video/mp4; codecs="urim"', 'video/mp4; codecs="vc-1"', 'video/mp4; codecs="vp08"', 'video/mp4; codecs="vp09.00.10.08"', 'video/mp4; codecs="vp09.00.50.08"', 'video/mp4; codecs="vp09.01.20.08.01.01.01.01.00"', 'video/mp4; codecs="vp09.01.20.08.01"', 'video/mp4; codecs="vp09.02.10.10.01.09.16.09.01"', 'video/mp4; codecs="vp09"', 'video/mp4; codecs="wvtt"', 'video/mpeg', 'video/mpeg2', 'video/mpeg4', 'video/msvideo', 'video/ogg', 'video/ogg; codecs="dirac, flac"', 'video/ogg; codecs="dirac, vorbis"', 'video/ogg; codecs="flac"', 'video/ogg; codecs="theora, flac"', 'video/ogg; codecs="theora, speex"', 'video/ogg; codecs="theora, vorbis"', 'video/ogg; codecs="theora"', 'video/quicktime', 'video/vnd.rn-realvideo', 'video/wavelet', 'video/webm', 'video/webm; codecs="vorbis"', 'video/webm; codecs="vp8, opus"', 'video/webm; codecs="vp8, vorbis"', 'video/webm; codecs="vp8.0, vorbis"', 'video/webm; codecs="vp8.0"', 'video/webm; codecs="vp8"', 'video/webm; codecs="vp9, opus"', 'video/webm; codecs="vp9, vorbis"', 'video/webm; codecs="vp9"', 'video/x-flv', 'video/x-la-asf', 'video/x-m4v', 'video/x-matroska', 'video/x-matroska; codecs="theora, vorbis"', 'video/x-matroska; codecs="theora"', 'video/x-mkv', 'video/x-mng', 'video/x-mpeg2', 'video/x-ms-wmv', 'video/x-msvideo', 'video/x-theora'];

	const getMimeTypes = async mimeTypes => {
	    try {
	        const videoEl = document.createElement('video');
	        const audioEl = new Audio();
	        const isMediaRecorderSupported = 'MediaRecorder' in window;
	        const types = mimeTypes.reduce((acc, type) => {
	            const data = {
	                mimeType: type,
	                audioPlayType: audioEl.canPlayType(type),
	                videoPlayType: videoEl.canPlayType(type),
	                mediaSource: MediaSource.isTypeSupported(type),
	                mediaRecorder: isMediaRecorderSupported ? MediaRecorder.isTypeSupported(type) : false
	            };
				if (!data.audioPlayType && !data.videoPlayType && !data.mediaSource && !data.mediaRecorder) {
					return acc
				}
	            acc.push(data);
	            return acc
	        }, []);
	        return types
	    } catch (error) {
	        return
	    }
	};

	const getMedia = async imports => {

		const {
			require: {
				captureError,
				phantomDarkness,
				caniuse,
				logTestResult,
				getPromiseRaceFulfilled
			}
		} = imports;

		try {
			await new Promise(setTimeout).catch(e => {});
			const start = performance.now();
			const phantomNavigator = phantomDarkness ? phantomDarkness.navigator : navigator;
			let devices, types;
			if (caniuse(() => navigator.mediaDevices.enumerateDevices)) {
				const [
					enumeratedDevices,
					mimes
				] = await Promise.all([
					phantomNavigator.mediaDevices.enumerateDevices(),
					getMimeTypes(mimeTypes)
				])
				.catch(error => console.error(error));

				types = mimes;
				devices = (
					enumeratedDevices ?
					enumeratedDevices.map(device => device.kind).sort() :
					undefined
				);
			}
			else {
				types = await getMimeTypes(mimeTypes);
			}
			const constraints = caniuse(() => Object.keys(navigator.mediaDevices.getSupportedConstraints()));

			logTestResult({ start, test: 'media', passed: true });
			return { mediaDevices: devices, constraints, mimeTypes: types }
		}
		catch (error) {
			logTestResult({ test: 'media', passed: false });
			captureError(error);
			return
		}
	};

	const mediaHTML = ({ fp, note, count, modal, hashMini, hashSlice }) => {
		if (!fp.media) {
			return `
		<div class="col-four undefined">
			<strong>Media</strong>
			<div>devices (0): ${note.blocked}</div>
			<div>constraints: ${note.blocked}</div>
			<div>mimes (0): ${note.blocked}</div>
		</div>`
		}
		const {
			media: {
				mediaDevices,
				constraints,
				mimeTypes,
				$hash
			}
		} = fp;

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
		const mimes = invalidMimeTypes ? undefined : mimeTypes.map(type => {
			const { mimeType, audioPlayType, videoPlayType, mediaSource, mediaRecorder } = type;
			return `
			${audioPlayType == 'probably' ? '<span class="audiop pb">P</span>' : audioPlayType == 'maybe' ? '<span class="audiop mb">M</span>': '<span class="blank-false">-</span>'}${videoPlayType == 'probably' ? '<span class="videop pb">P</span>' : videoPlayType == 'maybe' ? '<span class="videop mb">M</span>': '<span class="blank-false">-</span>'}${mediaSource ? '<span class="medias tr">T</span>'  : '<span class="blank-false">-</span>'}${mediaRecorder ? '<span class="mediar tr">T</span>'  : '<span class="blank-false">-</span>'}: ${mimeType}
		`	
		});

		return `
	<div class="col-four">
		<strong>Media</strong><span class="hash">${hashSlice($hash)}</span>
		<div>devices (${count(mediaDevices)}): ${
			!mediaDevices || !mediaDevices.length ? note.blocked : 
			modal(
				'creep-media-devices',
				mediaDevices.join('<br>'),
				hashMini(mediaDevices)
			)
		}</div>
		<div>constraints: ${
			!constraints || !constraints.length ? note.blocked : 
			modal(
				'creep-media-constraints',
				constraints.join('<br>'),
				hashMini(constraints)
			)
		}</div>
		<div>mimes (${count(mimeTypes)}): ${
			invalidMimeTypes ? note.blocked : 
			modal(
				'creep-media-mimeTypes',
				header+mimes.join('<br>'),
				hashMini(mimeTypes)
			)
		}</div>
	</div>
	`	
	};

	// special thanks to https://arh.antoinevastel.com/reports/stats/menu.html for stats
	const getNavigator = async (imports, workerScope) => {

		const {
			require: {
				getOS,
				hashMini,
				captureError,
				attempt,
				caniuse,
				gibberish,
				sendToTrash,
				trustInteger,
				documentLie,
				lieProps,
				phantomDarkness,
				dragonOfDeath,
				getUserAgentPlatform,
				braveBrowser,
				decryptUserAgent,
				logTestResult,
				getPluginLies
			}
		} = imports;

		try {
			const start = performance.now();
			let lied = (
				lieProps['Navigator.appVersion'] ||
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
				lieProps['Navigator.mimeTypes']
			) || false;
			const phantomNavigator = phantomDarkness ? phantomDarkness.navigator : navigator;
			const detectLies = (name, value) => {
				const workerScopeValue = caniuse(() => workerScope, [name]);
				const workerScopeMatchLie = 'does not match worker scope';
				if (workerScopeValue) {
					if (name == 'userAgent') {
						const navigatorUserAgent = value;
						const system = getOS(navigatorUserAgent);
						if (workerScope.system != system) {
							lied = true;
							documentLie(`Navigator.${name}`, workerScopeMatchLie);
						}
						else if (workerScope.userAgent != navigatorUserAgent) {
							lied = true;
							documentLie(`Navigator.${name}`, workerScopeMatchLie);
						}
						return value
					}
					else if (name != 'userAgent' && workerScopeValue != value) {
						lied = true;
						documentLie(`Navigator.${name}`, workerScopeMatchLie);
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
					const { platform } = phantomNavigator;
					const navigatorPlatform = navigator.platform;
					const systems = ['win', 'linux', 'mac', 'arm', 'pike', 'linux', 'iphone', 'ipad', 'ipod', 'android', 'x11'];
					const trusted = typeof navigatorPlatform == 'string' && systems.filter(val => navigatorPlatform.toLowerCase().includes(val))[0];
					detectLies('platform', navigatorPlatform);
					if (!trusted) {
						sendToTrash(`platform`, `${navigatorPlatform} is unusual`);
					}
					if (platform != navigatorPlatform) {
						lied = true;
						const nestedIframeLie = `Expected "${navigatorPlatform}" in nested iframe and got "${platform}"`;
						documentLie(`Navigator.platform`, nestedIframeLie);
					}

					// user agent os lie
					const { userAgent } = navigator;
					const userAgentOS = (
						// order is important
						/win(dows|16|32|64|95|98|nt)|wow64/ig.test(userAgent) ? 'Windows' :
							/android|linux|cros/ig.test(userAgent) ? 'Linux' :
								/(i(os|p(ad|hone|od)))|mac/ig.test(userAgent) ? 'Apple' :
									'Other'
					);
					const platformOS = (
						// order is important
						/win/ig.test(platform) ? 'Windows' :
							/android|arm|linux/ig.test(platform) ? 'Linux' :
								/(i(os|p(ad|hone|od)))|mac/ig.test(platform) ? 'Apple' :
									'Other'
					);
					const osLie = userAgentOS != platformOS;
					if (osLie) {
						lied = true;
						documentLie(
							`Navigator.platform`,
							`${platformOS} platform and ${userAgentOS} user agent do not match`
						);
					}

					return platform
				}),
				system: attempt(() => getOS(phantomNavigator.userAgent), 'userAgent system failed'),
				userAgentParsed: await attempt(async () => {
					const reportedUserAgent = caniuse(() => navigator.userAgent);
					const reportedSystem = getOS(reportedUserAgent);
					const isBrave = await braveBrowser();
					const report = decryptUserAgent({
						ua: reportedUserAgent,
						os: reportedSystem,
						isBrave
					});
					return report
				}),
				device: attempt(() => getUserAgentPlatform({ userAgent: phantomNavigator.userAgent }), 'userAgent device failed'),
				userAgent: attempt(() => {
					const { userAgent } = phantomNavigator;
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
						const nestedIframeLie = `Expected "${navigatorUserAgent}" in nested iframe and got "${userAgent}"`;
						documentLie(`Navigator.userAgent`, nestedIframeLie);
					}
					return userAgent.trim().replace(/\s{2,}/, ' ')
				}, 'userAgent failed'),
				appVersion: attempt(() => {
					const { appVersion } = phantomNavigator;
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
						const nestedIframeLie = `Expected "${navigatorAppVersion}" in nested iframe and got "${appVersion}"`;
						documentLie(`Navigator.appVersion`, nestedIframeLie);
					}
					return appVersion.trim().replace(/\s{2,}/, ' ')
				}, 'appVersion failed'),
				deviceMemory: attempt(() => {
					if (!('deviceMemory' in navigator)) {
						return undefined
					}
					const { deviceMemory } = phantomNavigator;
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
						const nestedIframeLie = `Expected ${navigatorDeviceMemory} in nested iframe and got ${deviceMemory}`;
						documentLie(`Navigator.deviceMemory`, nestedIframeLie);
					}
					return deviceMemory
				}, 'deviceMemory failed'),
				doNotTrack: attempt(() => {
					const { doNotTrack } = phantomNavigator;
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
						dragonOfDeath ?
							dragonOfDeath.navigator.hardwareConcurrency :
							phantomNavigator.hardwareConcurrency
					);
					const navigatorHardwareConcurrency = navigator.hardwareConcurrency;
					detectLies('hardwareConcurrency', navigatorHardwareConcurrency);
					trustInteger('hardwareConcurrency - invalid return type', navigatorHardwareConcurrency);
					if (hardwareConcurrency != navigatorHardwareConcurrency) {
						lied = true;
						const nestedIframeLie = `Expected ${navigatorHardwareConcurrency} in nested iframe and got ${hardwareConcurrency}`;
						documentLie(`Navigator.hardwareConcurrency`, nestedIframeLie);
					}
					return hardwareConcurrency
				}, 'hardwareConcurrency failed'),
				language: attempt(() => {
					const { language, languages } = phantomNavigator;
					const navigatorLanguage = navigator.language;
					const navigatorLanguages = navigator.languages;
					// disregard detectLies in workers to respect valid engine language switching
					//detectLies('language', navigatorLanguage)
					//detectLies('languages', '' + navigatorLanguages)
					if ('' + language != '' + navigatorLanguage) {
						lied = true;
						const nestedIframeLie = `Expected "${navigatorLanguage}" in nested iframe and got "${language}"`;
						documentLie(`Navigator.language`, nestedIframeLie);
					}

					const lang = ('' + language).split(',')[0];
					let currencyLanguage;
					try {
						currencyLanguage = (1).toLocaleString((lang || undefined), {
							style: 'currency',
							currency: 'USD',
							currencyDisplay: 'name',
							minimumFractionDigits: 0,
							maximumFractionDigits: 0
						});
					} catch (e) { }
					const currencyLocale = (1).toLocaleString(undefined, {
						style: 'currency',
						currency: 'USD',
						currencyDisplay: 'name',
						minimumFractionDigits: 0,
						maximumFractionDigits: 0
					});

					const languageLie = currencyLocale != currencyLanguage;
					if (languageLie) {
						lied = true;
						documentLie(
							`Navigator.language`,
							`${currencyLocale} locale and ${currencyLanguage} language do not match`
						);
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
					const { maxTouchPoints } = phantomNavigator;
					const navigatorMaxTouchPoints = navigator.maxTouchPoints;
					if (maxTouchPoints != navigatorMaxTouchPoints) {
						lied = true;
						const nestedIframeLie = `Expected ${navigatorMaxTouchPoints} in nested iframe and got ${maxTouchPoints}`;
						documentLie(`Navigator.maxTouchPoints`, nestedIframeLie);
					}

					return maxTouchPoints
				}, 'maxTouchPoints failed'),
				vendor: attempt(() => {
					const { vendor } = phantomNavigator;
					const navigatorVendor = navigator.vendor;
					if (vendor != navigatorVendor) {
						lied = true;
						const nestedIframeLie = `Expected "${navigatorVendor}" in nested iframe and got "${vendor}"`;
						documentLie(`Navigator.vendor`, nestedIframeLie);
					}
					return vendor
				}, 'vendor failed'),
				mimeTypes: attempt(() => {
					const mimeTypes = phantomNavigator.mimeTypes;
					return mimeTypes ? [...mimeTypes].map(m => m.type) : []
				}, 'mimeTypes failed'),
				oscpu: attempt(() => {
					const { oscpu } = phantomNavigator;
					const navigatorOscpu = navigator.oscpu;
					if (oscpu != navigatorOscpu) {
						lied = true;
						const nestedIframeLie = `Expected "${navigatorOscpu}" in nested iframe and got "${oscpu}"`;
						documentLie(`Navigator.oscpu`, nestedIframeLie);
					}
					return oscpu
				}, 'oscpu failed'),
				plugins: attempt(() => {
					const navigatorPlugins = navigator.plugins;
					const plugins = phantomNavigator.plugins;
					if (!(navigatorPlugins instanceof PluginArray)) {
						return
					}
					const response = plugins ? [...phantomNavigator.plugins]
						.map(p => ({
							name: p.name,
							description: p.description,
							filename: p.filename,
							version: p.version
						})) : [];

					const { lies } = getPluginLies(navigatorPlugins, navigator.mimeTypes);
					if (lies.length) {
						lied = true;
						lies.forEach(lie => {
							return documentLie(`Navigator.plugins`, lie)
						});
					}

					if (!!response.length) {
						response.forEach(plugin => {
							const { name, description } = plugin;
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
					const keys = Object.keys(Object.getPrototypeOf(phantomNavigator));
					return keys
				}, 'navigator keys failed'),
				userAgentData: await attempt(async () => {
					if (!('userAgentData' in phantomNavigator)) {
						return
					}
					const data = await phantomNavigator.userAgentData.getHighEntropyValues(
						['platform', 'platformVersion', 'architecture',  'model', 'uaFullVersion']
					);
					const { brands, mobile } = phantomNavigator.userAgentData || {};
					const compressedBrands = (brands, captureVersion = false) => brands
						.filter(obj => !/Not/.test(obj.brand)).map(obj => `${obj.brand}${captureVersion ? ` ${obj.version}` : ''}`);
					const removeChromium = brands => (
						brands.length > 1 ? brands.filter(brand => !/Chromium/.test(brand)) : brands
					);
		
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
						return acc
					},{});
					return dataSorted
				}, 'userAgentData failed'),
				keyboard: await attempt(async () => {
					if (!('keyboard' in navigator && navigator.keyboard)) {
						return
					}
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
					const keyoardLayoutMap = await navigator.keyboard.getLayoutMap();
					const writingSystemKeys = keys
						.reduce((acc, key) => {
							acc[key] = keyoardLayoutMap.get(key);
							return acc
						}, {});
					return writingSystemKeys
				}),
				bluetoothAvailability: await attempt(async () => {
					if (!('bluetooth' in phantomNavigator) || !phantomNavigator.bluetooth) {
						return undefined
					}
					const available = await navigator.bluetooth.getAvailability();
					return available
				}, 'bluetoothAvailability failed'),
				mediaCapabilities: await attempt(async () => {
					const codecs = [
						'audio/ogg; codecs=vorbis',
						'audio/ogg; codecs=flac',
						'audio/mp4; codecs="mp4a.40.2"',
						'audio/mpeg; codecs="mp3"',
						'video/ogg; codecs="theora"',
						'video/mp4; codecs="avc1.42E01E"'
					];

					const getMediaConfig = (codec, video, audio) => ({
						type: 'file',
						video: !/^video/.test(codec) ? undefined : {
							contentType: codec,
							...video
						},
						audio: !/^audio/.test(codec) ? undefined : {
							contentType: codec,
							...audio
						}
					});

					const getMediaCapabilities = async () => {
						const video = {
							width: 1920,
							height: 1080,
							bitrate: 120000,
							framerate: 60
						};
						const audio = {
							channels: 2,
							bitrate: 300000,
							samplerate: 5200
						};
						try {
							const decodingInfo = codecs.map(codec => {
								const config = getMediaConfig(codec, video, audio);
								const info = navigator.mediaCapabilities.decodingInfo(config)
									.then(support => ({
										codec,
										...support
									}))
									.catch(error => console.error(codec, error));
								return info
							});
							const data = await Promise.all(decodingInfo)
								.catch(error => console.error(error));
							const codecsSupported = data.reduce((acc, support) => {
								const { codec, supported, smooth, powerEfficient } = support || {};
								if (!supported) { return acc }
								return {
									...acc,
									[codec]: [
										...(smooth ? ['smooth'] : []),
										...(powerEfficient ? ['efficient'] : [])
									]
								}
							}, {});
							return codecsSupported
						}
						catch (error) {
							return
						}
					};
					const mediaCapabilities = await getMediaCapabilities();
					return mediaCapabilities
				}, 'mediaCapabilities failed'),
			
				permissions: await attempt(async () => {
					const getPermissionState = name => navigator.permissions.query({ name })
						.then(res => ({ name, state: res.state }))
						.catch(error => ({ name, state: 'unknown' }));

					// https://w3c.github.io/permissions/#permission-registry
					const permissions = !('permissions' in navigator) ? undefined : await Promise.all([
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
							getPermissionState('speaker-selection')
						]).then(permissions => permissions.reduce((acc, perm) => {
							const { state, name } = perm || {};
							if (acc[state]) {
								acc[state].push(name);
								return acc
							}
							acc[state] = [name];
							return acc
						}, {})).catch(error => console.error(error));
					return permissions
				}, 'permissions failed'),
			};
			logTestResult({ start, test: 'navigator', passed: true });
			return { ...data, lied }
		}
		catch (error) {
			logTestResult({ test: 'navigator', passed: false });
			captureError(error, 'Navigator failed or blocked by client');
			return
		}
	};

	const navigatorHTML = ({ fp, hashSlice, hashMini, note, modal, count }) => {
		if (!fp.navigator) {
			return `
		<div class="col-six undefined">
			<strong>Navigator</strong>
			<div>properties (0): ${note.blocked}</div>
			<div>bluetooth: ${note.blocked}</div>
			<div>codecs (0): ${note.blocked}</div>
			<div>dnt: ${note.blocked}</div>
			<div>gpc:${note.blocked}</div>
			<div>keyboard: ${note.blocked}</div>
			<div>lang: ${note.blocked}</div>
			<div>mimeTypes (0): ${note.blocked}</div>
			<div>permissions (0): ${note.blocked}</div>
			<div>plugins (0): ${note.blocked}</div>
			<div>vendor: ${note.blocked}</div>
			<div>userAgentData:</div>
			<div class="block-text">${note.blocked}</div>
		</div>
		<div class="col-six">
			<div>device:</div>
			<div class="block-text">${note.blocked}</div>
			<div>ua parsed: ${note.blocked}</div>
			<div>userAgent:</div>
			<div class="block-text">${note.blocked}</div>
			<div>appVersion:</div>
			<div class="block-text">${note.blocked}</div>
		</div>`
		}
		const {
			navigator: {
				$hash,
				appVersion,
				deviceMemory,
				doNotTrack,
				globalPrivacyControl,
				hardwareConcurrency,
				language,
				maxTouchPoints,
				mediaCapabilities,
				mimeTypes,
				oscpu,
				permissions,
				platform,
				plugins,
				properties,
				system,
				device,
				userAgent,
				userAgentData,
				userAgentParsed,
				vendor,
				keyboard,
				bluetoothAvailability,
				lied
			}
		} = fp;
		const id = 'creep-navigator';
		const blocked = {
			[null]: !0,
			[undefined]: !0,
			['']: !0
		};
		const codecKeys = Object.keys(mediaCapabilities || {});
		const permissionsKeys = Object.keys(permissions || {});
		const permissionsGranted = (
			permissions && permissions.granted ? permissions.granted.length : 0
		);
		return `
	<div class="col-six${lied ? ' rejected' : ''}">
		<strong>Navigator</strong><span class="${lied ? 'lies ' : ''}hash">${hashSlice($hash)}</span>
		<div>properties (${count(properties)}): ${
		modal(
			`${id}-properties`,
			properties.join(', '),
			hashMini(properties)
		)
		}</div>
		<div>bluetooth: ${
		typeof bluetoothAvailability == 'undefined' ? note.unsupported :
			!bluetoothAvailability ? 'unavailable' : 'available'
		}</div>
		<div class="help" title="MediaCapabilities.decodingInfo()">codecs (${''+codecKeys.length}): ${
		!mediaCapabilities || !codecKeys.length ? note.unsupported :
			modal(
				`${id}-media-codecs`,
				Object.keys(mediaCapabilities).map(key => `${key}: ${mediaCapabilities[key].join(', ')}`).join('<br>'),
				hashMini(mediaCapabilities)
			)
		}</div>
		<div class="help" title="Navigator.doNotTrack">dnt: ${'' + doNotTrack}</div>
		<div class="help" title="Navigator.globalPrivacyControl">gpc: ${
		'' + globalPrivacyControl == 'undefined' ? note.unsupported : '' + globalPrivacyControl
		}</div>
		<div>keyboard: ${
		!keyboard ? note.unsupported :
			modal(
				`${id}-keyboard`,
				Object.keys(keyboard).map(key => `${key}: ${keyboard[key]}`).join('<br>'),
				hashMini(keyboard)
			)
		}</div>
		<div class="help" title="Navigator.language\nNavigator.languages">lang: ${!blocked[language] ? language : note.blocked}</div>
		<div>mimeTypes (${count(mimeTypes)}): ${
		!blocked['' + mimeTypes] ?
			modal(
				`${id}-mimeTypes`,
				mimeTypes.join('<br>'),
				hashMini(mimeTypes)
			) :
			note.blocked
		}</div>
		<div class="help" title="Permissions.query()">permissions (${''+permissionsGranted}): ${
			!permissions || !permissionsKeys ? note.unsupported : modal(
				'creep-permissions',
				permissionsKeys.map(key => `<div class="perm perm-${key}"><strong>${key}</strong>:<br>${permissions[key].join('<br>')}</div>`).join(''),
				hashMini(permissions)
			)
		}</div>
		<div>plugins (${count(plugins)}): ${
		!blocked['' + plugins] ?
			modal(
				`${id}-plugins`,
				plugins.map(plugin => plugin.name).join('<br>'),
				hashMini(plugins)
			) :
			note.blocked
		}</div>
		<div>vendor: ${!blocked[vendor] ? vendor : note.blocked}</div>
		<div>userAgentData:</div>
		<div class="block-text help" title="Navigator.userAgentData\nNavigatorUAData.getHighEntropyValues()">
			<div>
			${((userAgentData) => {
				const {
					architecture,
					brandsVersion,
					uaFullVersion,
					mobile,
					model,
					platformVersion,
					platform
				} = userAgentData || {};
				return !userAgentData ? note.unsupported : `
					${(brandsVersion || []).join(',')}${uaFullVersion ? ` (${uaFullVersion})` : ''}
					<br>${platform} ${platformVersion} ${architecture}
					${model ? `<br>${model}` : ''}
					${mobile ? '<br>mobile' : ''}
				`
			})(userAgentData)}	
			</div>
		</div>
	</div>
	<div class="col-six${lied ? ' rejected' : ''}">
		<div>device:</div>
		<div class="block-text help" title="Navigator.deviceMemory\nNavigator.hardwareConcurrency\nNavigator.maxTouchPoints\nNavigator.oscpu\nNavigator.platform\nNavigator.userAgent">
			${oscpu ? oscpu : ''}
			${`${oscpu ? '<br>' : ''}${system}${platform ? ` (${platform})` : ''}`}
			${device ? `<br>${device}` : note.blocked}
			<br>cores: ${hardwareConcurrency}${deviceMemory ? `, memory: ${deviceMemory}` : ''}${typeof maxTouchPoints != 'undefined' ? `, touch: ${''+maxTouchPoints}` : ''}
		</div>
		<div>ua parsed: ${userAgentParsed || note.blocked}</div>
		<div>userAgent:</div>
		<div class="block-text">
			<div>${userAgent || note.blocked}</div>
		</div>
		<div>appVersion:</div>
		<div class="block-text">
			<div>${appVersion || note.blocked}</div>
		</div>
	</div>
	`
	};

	// inspired by
	// https://privacycheck.sec.lrz.de/active/fp_gcr/fp_getclientrects.html
	// https://privacycheck.sec.lrz.de/active/fp_e/fp_emoji.html
	const emojis = [[128512],[128515],[128516],[128513],[128518],[128517],[129315],[128514],[128578],[128579],[128521],[128522],[128519],[129392],[128525],[129321],[128536],[128535],[9786],[128538],[128537],[129394],[128523],[128539],[128540],[129322],[128541],[129297],[129303],[129325],[129323],[129300],[129296],[129320],[128528],[128529],[128566],[128527],[128530],[128580],[128556],[129317],[128524],[128532],[128554],[129316],[128564],[128567],[129298],[129301],[129314],[129326],[129319],[129397],[129398],[129396],[128565],[129327],[129312],[129395],[129400],[128526],[129299],[129488],[128533],[128543],[128577],[9785],[128558],[128559],[128562],[128563],[129402],[128550],[128551],[128552],[128560],[128549],[128546],[128557],[128561],[128534],[128547],[128542],[128531],[128553],[128555],[129393],[128548],[128545],[128544],[129324],[128520],[128127],[128128],[9760],[128169],[129313],[128121],[128122],[128123],[128125],[128126],[129302],[128570],[128568],[128569],[128571],[128572],[128573],[128576],[128575],[128574],[128584],[128585],[128586],[128139],[128140],[128152],[128157],[128150],[128151],[128147],[128158],[128149],[128159],[10083],[128148],[10084],[129505],[128155],[128154],[128153],[128156],[129294],[128420],[129293],[128175],[128162],[128165],[128171],[128166],[128168],[128371],[128163],[128172],[128065,65039,8205,128488,65039],[128488],[128495],[128173],[128164],[128075],[129306],[128400],[9995],[128406],[128076],[129292],[129295],[9996],[129310],[129311],[129304],[129305],[128072],[128073],[128070],[128405],[128071],[9757],[128077],[128078],[9994],[128074],[129307],[129308],[128079],[128588],[128080],[129330],[129309],[128591],[9997],[128133],[129331],[128170],[129470],[129471],[129461],[129462],[128066],[129467],[128067],[129504],[129728],[129729],[129463],[129460],[128064],[128065],[128069],[128068],[128118],[129490],[128102],[128103],[129489],[128113],[128104],[129492],[128104,8205,129456],[128104,8205,129457],[128104,8205,129459],[128104,8205,129458],[128105],[128105,8205,129456],[129489,8205,129456],[128105,8205,129457],[129489,8205,129457],[128105,8205,129459],[129489,8205,129459],[128105,8205,129458],[129489,8205,129458],[128113,8205,9792,65039],[128113,8205,9794,65039],[129491],[128116],[128117],[128589],[128589,8205,9794,65039],[128589,8205,9792,65039],[128590],[128590,8205,9794,65039],[128590,8205,9792,65039],[128581],[128581,8205,9794,65039],[128581,8205,9792,65039],[128582],[128582,8205,9794,65039],[128582,8205,9792,65039],[128129],[128129,8205,9794,65039],[128129,8205,9792,65039],[128587],[128587,8205,9794,65039],[128587,8205,9792,65039],[129487],[129487,8205,9794,65039],[129487,8205,9792,65039],[128583],[128583,8205,9794,65039],[128583,8205,9792,65039],[129318],[129318,8205,9794,65039],[129318,8205,9792,65039],[129335],[129335,8205,9794,65039],[129335,8205,9792,65039],[129489,8205,9877,65039],[128104,8205,9877,65039],[128105,8205,9877,65039],[129489,8205,127891],[128104,8205,127891],[128105,8205,127891],[129489,8205,127979],[128104,8205,127979],[128105,8205,127979],[129489,8205,9878,65039],[128104,8205,9878,65039],[128105,8205,9878,65039],[129489,8205,127806],[128104,8205,127806],[128105,8205,127806],[129489,8205,127859],[128104,8205,127859],[128105,8205,127859],[129489,8205,128295],[128104,8205,128295],[128105,8205,128295],[129489,8205,127981],[128104,8205,127981],[128105,8205,127981],[129489,8205,128188],[128104,8205,128188],[128105,8205,128188],[129489,8205,128300],[128104,8205,128300],[128105,8205,128300],[129489,8205,128187],[128104,8205,128187],[128105,8205,128187],[129489,8205,127908],[128104,8205,127908],[128105,8205,127908],[129489,8205,127912],[128104,8205,127912],[128105,8205,127912],[129489,8205,9992,65039],[128104,8205,9992,65039],[128105,8205,9992,65039],[129489,8205,128640],[128104,8205,128640],[128105,8205,128640],[129489,8205,128658],[128104,8205,128658],[128105,8205,128658],[128110],[128110,8205,9794,65039],[128110,8205,9792,65039],[128373],[128373,65039,8205,9794,65039],[128373,65039,8205,9792,65039],[128130],[128130,8205,9794,65039],[128130,8205,9792,65039],[129399],[128119],[128119,8205,9794,65039],[128119,8205,9792,65039],[129332],[128120],[128115],[128115,8205,9794,65039],[128115,8205,9792,65039],[128114],[129493],[129333],[129333,8205,9794,65039],[129333,8205,9792,65039],[128112],[128112,8205,9794,65039],[128112,8205,9792,65039],[129328],[129329],[128105,8205,127868],[128104,8205,127868],[129489,8205,127868],[128124],[127877],[129334],[129489,8205,127876],[129464],[129464,8205,9794,65039],[129464,8205,9792,65039],[129465],[129465,8205,9794,65039],[129465,8205,9792,65039],[129497],[129497,8205,9794,65039],[129497,8205,9792,65039],[129498],[129498,8205,9794,65039],[129498,8205,9792,65039],[129499],[129499,8205,9794,65039],[129499,8205,9792,65039],[129500],[129500,8205,9794,65039],[129500,8205,9792,65039],[129501],[129501,8205,9794,65039],[129501,8205,9792,65039],[129502],[129502,8205,9794,65039],[129502,8205,9792,65039],[129503],[129503,8205,9794,65039],[129503,8205,9792,65039],[128134],[128134,8205,9794,65039],[128134,8205,9792,65039],[128135],[128135,8205,9794,65039],[128135,8205,9792,65039],[128694],[128694,8205,9794,65039],[128694,8205,9792,65039],[129485],[129485,8205,9794,65039],[129485,8205,9792,65039],[129486],[129486,8205,9794,65039],[129486,8205,9792,65039],[129489,8205,129455],[128104,8205,129455],[128105,8205,129455],[129489,8205,129468],[128104,8205,129468],[128105,8205,129468],[129489,8205,129469],[128104,8205,129469],[128105,8205,129469],[127939],[127939,8205,9794,65039],[127939,8205,9792,65039],[128131],[128378],[128372],[128111],[128111,8205,9794,65039],[128111,8205,9792,65039],[129494],[129494,8205,9794,65039],[129494,8205,9792,65039],[129495],[129495,8205,9794,65039],[129495,8205,9792,65039],[129338],[127943],[9975],[127938],[127948],[127948,65039,8205,9794,65039],[127948,65039,8205,9792,65039],[127940],[127940,8205,9794,65039],[127940,8205,9792,65039],[128675],[128675,8205,9794,65039],[128675,8205,9792,65039],[127946],[127946,8205,9794,65039],[127946,8205,9792,65039],[9977],[9977,65039,8205,9794,65039],[9977,65039,8205,9792,65039],[127947],[127947,65039,8205,9794,65039],[127947,65039,8205,9792,65039],[128692],[128692,8205,9794,65039],[128692,8205,9792,65039],[128693],[128693,8205,9794,65039],[128693,8205,9792,65039],[129336],[129336,8205,9794,65039],[129336,8205,9792,65039],[129340],[129340,8205,9794,65039],[129340,8205,9792,65039],[129341],[129341,8205,9794,65039],[129341,8205,9792,65039],[129342],[129342,8205,9794,65039],[129342,8205,9792,65039],[129337],[129337,8205,9794,65039],[129337,8205,9792,65039],[129496],[129496,8205,9794,65039],[129496,8205,9792,65039],[128704],[128716],[129489,8205,129309,8205,129489],[128109],[128107],[128108],[128143],[128105,8205,10084,65039,8205,128139,8205,128104],[128104,8205,10084,65039,8205,128139,8205,128104],[128105,8205,10084,65039,8205,128139,8205,128105],[128145],[128105,8205,10084,65039,8205,128104],[128104,8205,10084,65039,8205,128104],[128105,8205,10084,65039,8205,128105],[128106],[128104,8205,128105,8205,128102],[128104,8205,128105,8205,128103],[128104,8205,128105,8205,128103,8205,128102],[128104,8205,128105,8205,128102,8205,128102],[128104,8205,128105,8205,128103,8205,128103],[128104,8205,128104,8205,128102],[128104,8205,128104,8205,128103],[128104,8205,128104,8205,128103,8205,128102],[128104,8205,128104,8205,128102,8205,128102],[128104,8205,128104,8205,128103,8205,128103],[128105,8205,128105,8205,128102],[128105,8205,128105,8205,128103],[128105,8205,128105,8205,128103,8205,128102],[128105,8205,128105,8205,128102,8205,128102],[128105,8205,128105,8205,128103,8205,128103],[128104,8205,128102],[128104,8205,128102,8205,128102],[128104,8205,128103],[128104,8205,128103,8205,128102],[128104,8205,128103,8205,128103],[128105,8205,128102],[128105,8205,128102,8205,128102],[128105,8205,128103],[128105,8205,128103,8205,128102],[128105,8205,128103,8205,128103],[128483],[128100],[128101],[129730],[128099],[129456],[129457],[129459],[129458],[128053],[128018],[129421],[129447],[128054],[128021],[129454],[128021,8205,129466],[128041],[128058],[129418],[129437],[128049],[128008],[128008,8205,11035],[129409],[128047],[128005],[128006],[128052],[128014],[129412],[129427],[129420],[129452],[128046],[128002],[128003],[128004],[128055],[128022],[128023],[128061],[128015],[128017],[128016],[128042],[128043],[129433],[129426],[128024],[129443],[129423],[129435],[128045],[128001],[128e3],[128057],[128048],[128007],[128063],[129451],[129428],[129415],[128059],[128059,8205,10052,65039],[128040],[128060],[129445],[129446],[129448],[129432],[129441],[128062],[129411],[128020],[128019],[128035],[128036],[128037],[128038],[128039],[128330],[129413],[129414],[129442],[129417],[129444],[129718],[129449],[129434],[129436],[128056],[128010],[128034],[129422],[128013],[128050],[128009],[129429],[129430],[128051],[128011],[128044],[129453],[128031],[128032],[128033],[129416],[128025],[128026],[128012],[129419],[128027],[128028],[128029],[129714],[128030],[129431],[129715],[128375],[128376],[129410],[129439],[129712],[129713],[129440],[128144],[127800],[128174],[127989],[127801],[129344],[127802],[127803],[127804],[127799],[127793],[129716],[127794],[127795],[127796],[127797],[127806],[127807],[9752],[127808],[127809],[127810],[127811],[127815],[127816],[127817],[127818],[127819],[127820],[127821],[129389],[127822],[127823],[127824],[127825],[127826],[127827],[129744],[129373],[127813],[129746],[129381],[129361],[127814],[129364],[129365],[127805],[127798],[129745],[129362],[129388],[129382],[129476],[129477],[127812],[129372],[127792],[127838],[129360],[129366],[129747],[129384],[129391],[129374],[129479],[129472],[127830],[127831],[129385],[129363],[127828],[127839],[127829],[127789],[129386],[127790],[127791],[129748],[129369],[129478],[129370],[127859],[129368],[127858],[129749],[129379],[129367],[127871],[129480],[129474],[129387],[127857],[127832],[127833],[127834],[127835],[127836],[127837],[127840],[127842],[127843],[127844],[127845],[129390],[127841],[129375],[129376],[129377],[129408],[129438],[129424],[129425],[129450],[127846],[127847],[127848],[127849],[127850],[127874],[127856],[129473],[129383],[127851],[127852],[127853],[127854],[127855],[127868],[129371],[9749],[129750],[127861],[127862],[127870],[127863],[127864],[127865],[127866],[127867],[129346],[129347],[129380],[129483],[129475],[129481],[129482],[129378],[127869],[127860],[129348],[128298],[127994],[127757],[127758],[127759],[127760],[128506],[128510],[129517],[127956],[9968],[127755],[128507],[127957],[127958],[127964],[127965],[127966],[127967],[127963],[127959],[129521],[129704],[129717],[128726],[127960],[127962],[127968],[127969],[127970],[127971],[127972],[127973],[127974],[127976],[127977],[127978],[127979],[127980],[127981],[127983],[127984],[128146],[128508],[128509],[9962],[128332],[128725],[128333],[9961],[128331],[9970],[9978],[127745],[127747],[127961],[127748],[127749],[127750],[127751],[127753],[9832],[127904],[127905],[127906],[128136],[127914],[128642],[128643],[128644],[128645],[128646],[128647],[128648],[128649],[128650],[128669],[128670],[128651],[128652],[128653],[128654],[128656],[128657],[128658],[128659],[128660],[128661],[128662],[128663],[128664],[128665],[128763],[128666],[128667],[128668],[127950],[127949],[128757],[129469],[129468],[128762],[128690],[128756],[128761],[128764],[128655],[128739],[128740],[128738],[9981],[128680],[128677],[128678],[128721],[128679],[9875],[9973],[128758],[128676],[128755],[9972],[128741],[128674],[9992],[128745],[128747],[128748],[129666],[128186],[128641],[128671],[128672],[128673],[128752],[128640],[128760],[128718],[129523],[8987],[9203],[8986],[9200],[9201],[9202],[128368],[128347],[128359],[128336],[128348],[128337],[128349],[128338],[128350],[128339],[128351],[128340],[128352],[128341],[128353],[128342],[128354],[128343],[128355],[128344],[128356],[128345],[128357],[128346],[128358],[127761],[127762],[127763],[127764],[127765],[127766],[127767],[127768],[127769],[127770],[127771],[127772],[127777],[9728],[127773],[127774],[129680],[11088],[127775],[127776],[127756],[9729],[9925],[9928],[127780],[127781],[127782],[127783],[127784],[127785],[127786],[127787],[127788],[127744],[127752],[127746],[9730],[9748],[9969],[9889],[10052],[9731],[9924],[9732],[128293],[128167],[127754],[127875],[127876],[127878],[127879],[129512],[10024],[127880],[127881],[127882],[127883],[127885],[127886],[127887],[127888],[127889],[129511],[127872],[127873],[127895],[127903],[127915],[127894],[127942],[127941],[129351],[129352],[129353],[9917],[9918],[129358],[127936],[127952],[127944],[127945],[127934],[129359],[127923],[127951],[127953],[127954],[129357],[127955],[127992],[129354],[129355],[129349],[9971],[9976],[127907],[129343],[127933],[127935],[128759],[129356],[127919],[129664],[129665],[127921],[128302],[129668],[129535],[127918],[128377],[127920],[127922],[129513],[129528],[129669],[129670],[9824],[9829],[9830],[9827],[9823],[127183],[126980],[127924],[127917],[128444],[127912],[129525],[129697],[129526],[129698],[128083],[128374],[129405],[129404],[129466],[128084],[128085],[128086],[129507],[129508],[129509],[129510],[128087],[128088],[129403],[129649],[129650],[129651],[128089],[128090],[128091],[128092],[128093],[128717],[127890],[129652],[128094],[128095],[129406],[129407],[128096],[128097],[129648],[128098],[128081],[128082],[127913],[127891],[129506],[129686],[9937],[128255],[128132],[128141],[128142],[128263],[128264],[128265],[128266],[128226],[128227],[128239],[128276],[128277],[127932],[127925],[127926],[127897],[127898],[127899],[127908],[127911],[128251],[127927],[129687],[127928],[127929],[127930],[127931],[129685],[129345],[129688],[128241],[128242],[9742],[128222],[128223],[128224],[128267],[128268],[128187],[128421],[128424],[9e3],[128433],[128434],[128189],[128190],[128191],[128192],[129518],[127909],[127902],[128253],[127916],[128250],[128247],[128248],[128249],[128252],[128269],[128270],[128367],[128161],[128294],[127982],[129684],[128212],[128213],[128214],[128215],[128216],[128217],[128218],[128211],[128210],[128195],[128220],[128196],[128240],[128478],[128209],[128278],[127991],[128176],[129689],[128180],[128181],[128182],[128183],[128184],[128179],[129534],[128185],[9993],[128231],[128232],[128233],[128228],[128229],[128230],[128235],[128234],[128236],[128237],[128238],[128499],[9999],[10002],[128395],[128394],[128396],[128397],[128221],[128188],[128193],[128194],[128450],[128197],[128198],[128466],[128467],[128199],[128200],[128201],[128202],[128203],[128204],[128205],[128206],[128391],[128207],[128208],[9986],[128451],[128452],[128465],[128274],[128275],[128271],[128272],[128273],[128477],[128296],[129683],[9935],[9874],[128736],[128481],[9876],[128299],[129667],[127993],[128737],[129690],[128295],[129691],[128297],[9881],[128476],[9878],[129455],[128279],[9939],[129693],[129520],[129522],[129692],[9879],[129514],[129515],[129516],[128300],[128301],[128225],[128137],[129656],[128138],[129657],[129658],[128682],[128727],[129694],[129695],[128719],[128715],[129681],[128701],[129696],[128703],[128705],[129700],[129682],[129524],[129527],[129529],[129530],[129531],[129699],[129532],[129701],[129533],[129519],[128722],[128684],[9904],[129702],[9905],[128511],[129703],[127975],[128686],[128688],[9855],[128697],[128698],[128699],[128700],[128702],[128706],[128707],[128708],[128709],[9888],[128696],[9940],[128683],[128691],[128685],[128687],[128689],[128695],[128245],[128286],[9762],[9763],[11014],[8599],[10145],[8600],[11015],[8601],[11013],[8598],[8597],[8596],[8617],[8618],[10548],[10549],[128259],[128260],[128281],[128282],[128283],[128284],[128285],[128720],[9883],[128329],[10017],[9784],[9775],[10013],[9766],[9770],[9774],[128334],[128303],[9800],[9801],[9802],[9803],[9804],[9805],[9806],[9807],[9808],[9809],[9810],[9811],[9934],[128256],[128257],[128258],[9654],[9193],[9197],[9199],[9664],[9194],[9198],[128316],[9195],[128317],[9196],[9208],[9209],[9210],[9167],[127910],[128261],[128262],[128246],[128243],[128244],[9792],[9794],[9895],[10006],[10133],[10134],[10135],[9854],[8252],[8265],[10067],[10068],[10069],[10071],[12336],[128177],[128178],[9877],[9851],[9884],[128305],[128219],[128304],[11093],[9989],[9745],[10004],[10060],[10062],[10160],[10175],[12349],[10035],[10036],[10055],[169],[174],[8482],[35,65039,8419],[42,65039,8419],[48,65039,8419],[49,65039,8419],[50,65039,8419],[51,65039,8419],[52,65039,8419],[53,65039,8419],[54,65039,8419],[55,65039,8419],[56,65039,8419],[57,65039,8419],[128287],[128288],[128289],[128290],[128291],[128292],[127344],[127374],[127345],[127377],[127378],[127379],[8505],[127380],[9410],[127381],[127382],[127358],[127383],[127359],[127384],[127385],[127386],[127489],[127490],[127543],[127542],[127535],[127568],[127545],[127514],[127538],[127569],[127544],[127540],[127539],[12951],[12953],[127546],[127541],[128308],[128992],[128993],[128994],[128309],[128995],[128996],[9899],[9898],[128997],[128999],[129e3],[129001],[128998],[129002],[129003],[11035],[11036],[9724],[9723],[9726],[9725],[9642],[9643],[128310],[128311],[128312],[128313],[128314],[128315],[128160],[128280],[128307],[128306],[127937],[128681],[127884],[127988],[127987],[127987,65039,8205,127752],[127987,65039,8205,9895,65039],[127988,8205,9760,65039],[127462,127464],[127462,127465],[127462,127466],[127462,127467],[127462,127468],[127462,127470],[127462,127473],[127462,127474],[127462,127476],[127462,127478],[127462,127479],[127462,127480],[127462,127481],[127462,127482],[127462,127484],[127462,127485],[127462,127487],[127463,127462],[127463,127463],[127463,127465],[127463,127466],[127463,127467],[127463,127468],[127463,127469],[127463,127470],[127463,127471],[127463,127473],[127463,127474],[127463,127475],[127463,127476],[127463,127478],[127463,127479],[127463,127480],[127463,127481],[127463,127483],[127463,127484],[127463,127486],[127463,127487],[127464,127462],[127464,127464],[127464,127465],[127464,127467],[127464,127468],[127464,127469],[127464,127470],[127464,127472],[127464,127473],[127464,127474],[127464,127475],[127464,127476],[127464,127477],[127464,127479],[127464,127482],[127464,127483],[127464,127484],[127464,127485],[127464,127486],[127464,127487],[127465,127466],[127465,127468],[127465,127471],[127465,127472],[127465,127474],[127465,127476],[127465,127487],[127466,127462],[127466,127464],[127466,127466],[127466,127468],[127466,127469],[127466,127479],[127466,127480],[127466,127481],[127466,127482],[127467,127470],[127467,127471],[127467,127472],[127467,127474],[127467,127476],[127467,127479],[127468,127462],[127468,127463],[127468,127465],[127468,127466],[127468,127467],[127468,127468],[127468,127469],[127468,127470],[127468,127473],[127468,127474],[127468,127475],[127468,127477],[127468,127478],[127468,127479],[127468,127480],[127468,127481],[127468,127482],[127468,127484],[127468,127486],[127469,127472],[127469,127474],[127469,127475],[127469,127479],[127469,127481],[127469,127482],[127470,127464],[127470,127465],[127470,127466],[127470,127473],[127470,127474],[127470,127475],[127470,127476],[127470,127478],[127470,127479],[127470,127480],[127470,127481],[127471,127466],[127471,127474],[127471,127476],[127471,127477],[127472,127466],[127472,127468],[127472,127469],[127472,127470],[127472,127474],[127472,127475],[127472,127477],[127472,127479],[127472,127484],[127472,127486],[127472,127487],[127473,127462],[127473,127463],[127473,127464],[127473,127470],[127473,127472],[127473,127479],[127473,127480],[127473,127481],[127473,127482],[127473,127483],[127473,127486],[127474,127462],[127474,127464],[127474,127465],[127474,127466],[127474,127467],[127474,127468],[127474,127469],[127474,127472],[127474,127473],[127474,127474],[127474,127475],[127474,127476],[127474,127477],[127474,127478],[127474,127479],[127474,127480],[127474,127481],[127474,127482],[127474,127483],[127474,127484],[127474,127485],[127474,127486],[127474,127487],[127475,127462],[127475,127464],[127475,127466],[127475,127467],[127475,127468],[127475,127470],[127475,127473],[127475,127476],[127475,127477],[127475,127479],[127475,127482],[127475,127487],[127476,127474],[127477,127462],[127477,127466],[127477,127467],[127477,127468],[127477,127469],[127477,127472],[127477,127473],[127477,127474],[127477,127475],[127477,127479],[127477,127480],[127477,127481],[127477,127484],[127477,127486],[127478,127462],[127479,127466],[127479,127476],[127479,127480],[127479,127482],[127479,127484],[127480,127462],[127480,127463],[127480,127464],[127480,127465],[127480,127466],[127480,127468],[127480,127469],[127480,127470],[127480,127471],[127480,127472],[127480,127473],[127480,127474],[127480,127475],[127480,127476],[127480,127479],[127480,127480],[127480,127481],[127480,127483],[127480,127485],[127480,127486],[127480,127487],[127481,127462],[127481,127464],[127481,127465],[127481,127467],[127481,127468],[127481,127469],[127481,127471],[127481,127472],[127481,127473],[127481,127474],[127481,127475],[127481,127476],[127481,127479],[127481,127481],[127481,127483],[127481,127484],[127481,127487],[127482,127462],[127482,127468],[127482,127474],[127482,127475],[127482,127480],[127482,127486],[127482,127487],[127483,127462],[127483,127464],[127483,127466],[127483,127468],[127483,127470],[127483,127475],[127483,127482],[127484,127467],[127484,127480],[127485,127472],[127486,127466],[127486,127481],[127487,127462],[127487,127474],[127487,127484],[127988,917607,917602,917605,917614,917607,917631],[127988,917607,917602,917619,917603,917620,917631],[127988,917607,917602,917623,917612,917619,917631]];

	const getClientRects = async imports => {

		const {
			require: {
				instanceId,
				hashMini,
				patch,
				html,
				captureError,
				documentLie,
				lieProps,
				logTestResult,
				phantomDarkness
			}
		} = imports;
		
		try {
			const start = performance.now();
			const toNativeObject = domRect => {
				return {
					bottom: domRect.bottom,
					height: domRect.height,
					left: domRect.left,
					right: domRect.right,
					width: domRect.width,
					top: domRect.top,
					x: domRect.x,
					y: domRect.y
				}
			};
			let lied = (
				lieProps['Element.getClientRects'] ||
				lieProps['Element.getBoundingClientRect'] ||
				lieProps['Range.getClientRects'] ||
				lieProps['Range.getBoundingClientRect']
			) || false; // detect lies
			
			const getBestRect = (lieProps, doc, el) => {
				let range;
				if (!lieProps['Element.getClientRects']) {
					return el.getClientRects()[0]
				}
				else if (!lieProps['Element.getBoundingClientRect']) {
					return el.getBoundingClientRect()
				}
				else if (!lieProps['Range.getClientRects']) {
					range = doc.createRange();
					range.selectNode(el);
					return range.getClientRects()[0]
				}
				range = doc.createRange();
				range.selectNode(el);
				return range.getBoundingClientRect()
			};
						
			const doc = phantomDarkness ? phantomDarkness.document : document;

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
			const systemEmojis = [
				[128512],
				[9786],
				[129333,8205,9794,65039],
				[9832],
				[9784],
				[9895],
				[8265],
				[8505],
				[127987,65039,8205,9895,65039],
				[129394],
				[9785],
				[9760],
				[129489,8205,129456],
				[129487,8205,9794,65039],
				[9975],
				[129489,8205,129309,8205,129489],
				[9752],
				[9968],
				[9961],
				[9972],
				[9992],
				[9201],
				[9928],
				[9730],
				[9969],
				[9731],
				[9732],
				[9976],
				[9823],
				[9937],
				[9000],
				[9993],
				[9999],
				[10002],
				[9986],
				[9935],
				[9874],
				[9876],
				[9881],
				[9939],
				[9879],
				[9904],
				[9905],
				[9888],
				[9762],
				[9763],
				[11014],
				[8599],
				[10145],
				[11013],
				[9883],
				[10017],
				[10013],
				[9766],
				[9654],
				[9197],
				[9199],
				[9167],
				[9792],
				[9794],
				[10006],
				[12336],
				[9877],
				[9884],
				[10004],
				[10035],
				[10055],
				[9724],
				[9642],
				[10083],
				[10084],
				[9996],
				[9757],
				[9997],
				[10052],
				[9878],
				[8618],
				[9775],
				[9770],
				[9774],
				[9745],
				[10036],
				[127344],
				[127359]
			];

			const pattern = new Set();
			const emojiDiv = doc.getElementById('emoji');
			const emojiRects = systemEmojis
				.map(emojiCode => {
					const emoji = String.fromCodePoint(...emojiCode);
					emojiDiv.innerHTML = emoji;
					const { height, width } = getBestRect(lieProps, doc, emojiDiv);
					return { emoji, width, height }
				});

			// get emoji set and system
			const emojiSet = emojiRects
				.filter(emoji => {
					const dimensions = `${emoji.width}, ${emoji.heigt}`;
					if (pattern.has(dimensions)) {
						return false
					}
					pattern.add(dimensions);
					return true
				})
				.map(emoji => {
					return emoji.emoji
				});
			const emojiSystem = hashMini(emojiSet);
			
			// get clientRects
			const range = document.createRange();
			const rectElems = doc.getElementsByClassName('rects');

			const elementClientRects = [...rectElems].map(el => {
				return toNativeObject(el.getClientRects()[0])
			});

			const elementBoundingClientRect = [...rectElems].map(el => {
				return toNativeObject(el.getBoundingClientRect())
			});
			
			const rangeClientRects = [...rectElems].map(el => {
				range.selectNode(el);
				return toNativeObject(range.getClientRects()[0])
			});

			const rangeBoundingClientRect = [...rectElems].map(el => {
				range.selectNode(el);
				return toNativeObject(el.getBoundingClientRect())
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
			elementClientRects.forEach(rect => {
				const { right, left, width, bottom, top, height, x, y } = rect;
				if (
					right - left != width ||
					bottom - top != height ||
					right - x != width ||
					bottom - y != height
				) {
					lied = true;
					mathLie = true;
				}
				return
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
						
			logTestResult({ start, test: 'rects', passed: true });
			return {
				emojiRects,
				emojiSet,
				emojiSystem,
				elementClientRects,
				elementBoundingClientRect,
				rangeClientRects,
				rangeBoundingClientRect,
				lied
			}
		}
		catch (error) {
			logTestResult({ test: 'rects', passed: false });
			captureError(error);
			return
		}
	};

	const clientRectsHTML = ({ fp, note, modal, getMismatchStyle, hashMini, hashSlice }) => {
		if (!fp.clientRects) {
			return `
		<div class="col-six undefined">
			<strong>DOMRect</strong>
			<div>elems client: ${note.blocked}</div>
			<div>range client: ${note.blocked}</div>
			<div>elems bounding: ${note.blocked}</div>
			<div>range bounding: ${note.blocked}</div>
			<div>emojis v13.0: ${note.blocked}</div>
			<div>emoji set:</div>
			div class="block-text">${note.blocked}</div>
		</div>`
		}
		const {
			clientRects: {
				$hash,
				elementClientRects,
				elementBoundingClientRect,
				rangeClientRects,
				rangeBoundingClientRect,
				emojiRects,
				emojiSet,
				emojiSystem,
				lied
			}
		} = fp;
		const id = 'creep-client-rects';
		const getRectHash = rect => {
			const {emoji,...excludeEmoji} = rect;
			return hashMini(excludeEmoji)
		};

		// compute mismatch syle
		const getRectSum = rect => Object.keys(rect).reduce((acc, key) => acc += rect[key], 0);
		const reduceRectSum = n => (''+n).split('.').reduce((acc, s) => acc += +s, 0);
		const computeMismatchStyle = rects => {
			if (!rects || !rects.length) {
				return
			}
			const exptectedSum = rects.reduce((acc, rect) => {
				const { right, left, width, bottom, top, height, x, y } = rect;
				const expected = {
					width: right - left,
					height: bottom - top,
					right: left + width,
					left: right - width,
					bottom: top + height,
					top: bottom - height,
					x: right - width,
					y: bottom - height
				};
				return acc += getRectSum(expected)
			}, 0);
			const actualSum = rects.reduce((acc, rect) => acc += getRectSum(rect), 0);
			const expected = reduceRectSum(exptectedSum);
			const actual = reduceRectSum(actualSum);
			return getMismatchStyle((''+actual).split(''), (''+expected).split(''))
		};
		

		return `
	<div class="col-six${lied ? ' rejected' : ''}">
		<strong>DOMRect</strong><span class="${lied ? 'lies ' : ''}hash">${hashSlice($hash)}</span>
		<div class="help" title="Element.getClientRects()">elems client: ${computeMismatchStyle(elementClientRects)}</div>
		<div class="help" title="Range.getClientRects()">range client: ${computeMismatchStyle(rangeClientRects)}</div>
		<div class="help" title="Element.getBoundingClientRect()">elems bounding: ${computeMismatchStyle(elementBoundingClientRect)}</div>
		<div class="help" title="Range.getBoundingClientRect()">range bounding: ${computeMismatchStyle(rangeBoundingClientRect)}</div>
		<div>emojis v13.0: ${
			modal(
				`${id}-emojis`,
				`<div>${emojiRects.map(rect => `${rect.emoji}: ${getRectHash(rect)}`).join('<br>')}</div>`,
				hashMini(emojiRects)
			)
		}</div>
		<div>emoji set:</div>
		<div class="block-text">${emojiSet.join('')}</div>
	</div>
	`
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
		return
	};

	const getScreen = async imports => {

		const {
			require: {
				captureError,
				attempt,
				sendToTrash,
				trustInteger,
				lieProps,
				phantomDarkness,
				logTestResult
			}
		} = imports;
		
		try {
			const start = performance.now();
			let lied = (
				lieProps['Screen.width'] ||
				lieProps['Screen.height'] ||
				lieProps['Screen.availWidth'] ||
				lieProps['Screen.availHeight'] ||
				lieProps['Screen.colorDepth'] ||
				lieProps['Screen.pixelDepth']
			) || false;
			const phantomScreen = phantomDarkness ? phantomDarkness.screen : screen;
			const phantomOuterWidth = phantomDarkness ? phantomDarkness.outerWidth : outerWidth;
			const phantomOuterHeight = phantomDarkness ? phantomDarkness.outerHeight : outerHeight;
			
			const { width, height, availWidth, availHeight, colorDepth, pixelDepth } = phantomScreen;
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
			
			const data = {
				device: getDevice(width, height),
				width: attempt(() => screenWidth ? trustInteger('width - invalid return type', screenWidth) : undefined),
				outerWidth: attempt(() => outerWidth ? trustInteger('outerWidth - invalid return type', outerWidth) : undefined),
				availWidth: attempt(() => screenAvailWidth ? trustInteger('availWidth - invalid return type', screenAvailWidth) : undefined),
				height: attempt(() => screenHeight ? trustInteger('height - invalid return type', screenHeight) : undefined),
				outerHeight: attempt(() => outerHeight ? trustInteger('outerHeight - invalid return type', outerHeight) : undefined),
				availHeight: attempt(() => screenAvailHeight ?  trustInteger('availHeight - invalid return type', screenAvailHeight) : undefined),
				colorDepth: attempt(() => screenColorDepth ? trustInteger('colorDepth - invalid return type', screenColorDepth) : undefined),
				pixelDepth: attempt(() => screenPixelDepth ? trustInteger('pixelDepth - invalid return type', screenPixelDepth) : undefined),
				lied
			};
			logTestResult({ start, test: 'screen', passed: true });
			return { ...data }
		}
		catch (error) {
			logTestResult({ test: 'screen', passed: false });
			captureError(error);
			return
		}
	};

	const screenHTML = ({ fp, note, hashSlice }) => {
		if (!fp.screen) {
			return `
		<div class="col-six undefined">
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
		</div>`
		}
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
	<div class="col-six${lied ? ' rejected' : ''}">
		<strong>Screen</strong><span class="${lied ? 'lies ' : ''}hash">${hashSlice($hash)}</span>
		<div>device: ${device ? device : note.unknown}</div>
		<div>width: ${width ? width : note.blocked}</div>
		<div>outerWidth: ${outerWidth ? outerWidth : note.blocked}</div>
		<div>availWidth: ${availWidth ? availWidth : note.blocked}</div>
		<div>height: ${height ? height : note.blocked}</div>
		<div>outerHeight: ${outerHeight ? outerHeight : note.blocked}</div>
		<div>availHeight: ${availHeight ? availHeight : note.blocked}</div>
		<div>colorDepth: ${colorDepth ? colorDepth : note.blocked}</div>
		<div>pixelDepth: ${pixelDepth ? pixelDepth : note.blocked}</div>
	</div>
	<div class="col-six screen-container${lied ? ' rejected' : ''}">
		<style>.screen-frame { width:${deviceWidth}px;height:${deviceHeight}px; }</style>
		<div class="screen-frame">
			<div class="screen-glass"></div>
		</div>
	</div>
	`
	};

	// inspired by https://arkenfox.github.io/TZP
	// https://github.com/vvo/tzdb/blob/master/time-zones-names.json
	const cities = [
		"UTC",
		"GMT",
		"Etc/GMT+0",
		"Etc/GMT+1",
		"Etc/GMT+10",
		"Etc/GMT+11",
		"Etc/GMT+12",
		"Etc/GMT+2",
		"Etc/GMT+3",
		"Etc/GMT+4",
		"Etc/GMT+5",
		"Etc/GMT+6",
		"Etc/GMT+7",
		"Etc/GMT+8",
		"Etc/GMT+9",
		"Etc/GMT-1",
		"Etc/GMT-10",
		"Etc/GMT-11",
		"Etc/GMT-12",
		"Etc/GMT-13",
		"Etc/GMT-14",
		"Etc/GMT-2",
		"Etc/GMT-3",
		"Etc/GMT-4",
		"Etc/GMT-5",
		"Etc/GMT-6",
		"Etc/GMT-7",
		"Etc/GMT-8",
		"Etc/GMT-9",
		"Etc/GMT",
		"Africa/Abidjan",
		"Africa/Accra",
		"Africa/Addis_Ababa",
		"Africa/Algiers",
		"Africa/Asmara",
		"Africa/Bamako",
		"Africa/Bangui",
		"Africa/Banjul",
		"Africa/Bissau",
		"Africa/Blantyre",
		"Africa/Brazzaville",
		"Africa/Bujumbura",
		"Africa/Cairo",
		"Africa/Casablanca",
		"Africa/Ceuta",
		"Africa/Conakry",
		"Africa/Dakar",
		"Africa/Dar_es_Salaam",
		"Africa/Djibouti",
		"Africa/Douala",
		"Africa/El_Aaiun",
		"Africa/Freetown",
		"Africa/Gaborone",
		"Africa/Harare",
		"Africa/Johannesburg",
		"Africa/Juba",
		"Africa/Kampala",
		"Africa/Khartoum",
		"Africa/Kigali",
		"Africa/Kinshasa",
		"Africa/Lagos",
		"Africa/Libreville",
		"Africa/Lome",
		"Africa/Luanda",
		"Africa/Lubumbashi",
		"Africa/Lusaka",
		"Africa/Malabo",
		"Africa/Maputo",
		"Africa/Maseru",
		"Africa/Mbabane",
		"Africa/Mogadishu",
		"Africa/Monrovia",
		"Africa/Nairobi",
		"Africa/Ndjamena",
		"Africa/Niamey",
		"Africa/Nouakchott",
		"Africa/Ouagadougou",
		"Africa/Porto-Novo",
		"Africa/Sao_Tome",
		"Africa/Tripoli",
		"Africa/Tunis",
		"Africa/Windhoek",
		"America/Adak",
		"America/Anchorage",
		"America/Anguilla",
		"America/Antigua",
		"America/Araguaina",
		"America/Argentina/Buenos_Aires",
		"America/Argentina/Catamarca",
		"America/Argentina/Cordoba",
		"America/Argentina/Jujuy",
		"America/Argentina/La_Rioja",
		"America/Argentina/Mendoza",
		"America/Argentina/Rio_Gallegos",
		"America/Argentina/Salta",
		"America/Argentina/San_Juan",
		"America/Argentina/San_Luis",
		"America/Argentina/Tucuman",
		"America/Argentina/Ushuaia",
		"America/Aruba",
		"America/Asuncion",
		"America/Atikokan",
		"America/Bahia",
		"America/Bahia_Banderas",
		"America/Barbados",
		"America/Belem",
		"America/Belize",
		"America/Blanc-Sablon",
		"America/Boa_Vista",
		"America/Bogota",
		"America/Boise",
		"America/Cambridge_Bay",
		"America/Campo_Grande",
		"America/Cancun",
		"America/Caracas",
		"America/Cayenne",
		"America/Cayman",
		"America/Chicago",
		"America/Chihuahua",
		"America/Costa_Rica",
		"America/Creston",
		"America/Cuiaba",
		"America/Curacao",
		"America/Danmarkshavn",
		"America/Dawson",
		"America/Dawson_Creek",
		"America/Denver",
		"America/Detroit",
		"America/Dominica",
		"America/Edmonton",
		"America/Eirunepe",
		"America/El_Salvador",
		"America/Fort_Nelson",
		"America/Fortaleza",
		"America/Glace_Bay",
		"America/Godthab",
		"America/Goose_Bay",
		"America/Grand_Turk",
		"America/Grenada",
		"America/Guadeloupe",
		"America/Guatemala",
		"America/Guayaquil",
		"America/Guyana",
		"America/Halifax",
		"America/Havana",
		"America/Hermosillo",
		"America/Indiana/Indianapolis",
		"America/Indiana/Knox",
		"America/Indiana/Marengo",
		"America/Indiana/Petersburg",
		"America/Indiana/Tell_City",
		"America/Indiana/Vevay",
		"America/Indiana/Vincennes",
		"America/Indiana/Winamac",
		"America/Inuvik",
		"America/Iqaluit",
		"America/Jamaica",
		"America/Juneau",
		"America/Kentucky/Louisville",
		"America/Kentucky/Monticello",
		"America/Kralendijk",
		"America/La_Paz",
		"America/Lima",
		"America/Los_Angeles",
		"America/Lower_Princes",
		"America/Maceio",
		"America/Managua",
		"America/Manaus",
		"America/Marigot",
		"America/Martinique",
		"America/Matamoros",
		"America/Mazatlan",
		"America/Menominee",
		"America/Merida",
		"America/Metlakatla",
		"America/Mexico_City",
		"America/Miquelon",
		"America/Moncton",
		"America/Monterrey",
		"America/Montevideo",
		"America/Montserrat",
		"America/Nassau",
		"America/New_York",
		"America/Nipigon",
		"America/Nome",
		"America/Noronha",
		"America/North_Dakota/Beulah",
		"America/North_Dakota/Center",
		"America/North_Dakota/New_Salem",
		"America/Ojinaga",
		"America/Panama",
		"America/Pangnirtung",
		"America/Paramaribo",
		"America/Phoenix",
		"America/Port-au-Prince",
		"America/Port_of_Spain",
		"America/Porto_Velho",
		"America/Puerto_Rico",
		"America/Punta_Arenas",
		"America/Rainy_River",
		"America/Rankin_Inlet",
		"America/Recife",
		"America/Regina",
		"America/Resolute",
		"America/Rio_Branco",
		"America/Santarem",
		"America/Santiago",
		"America/Santo_Domingo",
		"America/Sao_Paulo",
		"America/Scoresbysund",
		"America/Sitka",
		"America/St_Barthelemy",
		"America/St_Johns",
		"America/St_Kitts",
		"America/St_Lucia",
		"America/St_Thomas",
		"America/St_Vincent",
		"America/Swift_Current",
		"America/Tegucigalpa",
		"America/Thule",
		"America/Thunder_Bay",
		"America/Tijuana",
		"America/Toronto",
		"America/Tortola",
		"America/Vancouver",
		"America/Whitehorse",
		"America/Winnipeg",
		"America/Yakutat",
		"America/Yellowknife",
		"Antarctica/Casey",
		"Antarctica/Davis",
		"Antarctica/DumontDUrville",
		"Antarctica/Macquarie",
		"Antarctica/Mawson",
		"Antarctica/McMurdo",
		"Antarctica/Palmer",
		"Antarctica/Rothera",
		"Antarctica/Syowa",
		"Antarctica/Troll",
		"Antarctica/Vostok",
		"Arctic/Longyearbyen",
		"Asia/Aden",
		"Asia/Almaty",
		"Asia/Amman",
		"Asia/Anadyr",
		"Asia/Aqtau",
		"Asia/Aqtobe",
		"Asia/Ashgabat",
		"Asia/Atyrau",
		"Asia/Baghdad",
		"Asia/Bahrain",
		"Asia/Baku",
		"Asia/Bangkok",
		"Asia/Barnaul",
		"Asia/Beirut",
		"Asia/Bishkek",
		"Asia/Brunei",
		"Asia/Calcutta",
		"Asia/Chita",
		"Asia/Choibalsan",
		"Asia/Colombo",
		"Asia/Damascus",
		"Asia/Dhaka",
		"Asia/Dili",
		"Asia/Dubai",
		"Asia/Dushanbe",
		"Asia/Famagusta",
		"Asia/Gaza",
		"Asia/Hebron",
		"Asia/Ho_Chi_Minh",
		"Asia/Hong_Kong",
		"Asia/Hovd",
		"Asia/Irkutsk",
		"Asia/Jakarta",
		"Asia/Jayapura",
		"Asia/Jerusalem",
		"Asia/Kabul",
		"Asia/Kamchatka",
		"Asia/Karachi",
		"Asia/Kathmandu",
		"Asia/Khandyga",
		"Asia/Kolkata",
		"Asia/Krasnoyarsk",
		"Asia/Kuala_Lumpur",
		"Asia/Kuching",
		"Asia/Kuwait",
		"Asia/Macau",
		"Asia/Magadan",
		"Asia/Makassar",
		"Asia/Manila",
		"Asia/Muscat",
		"Asia/Nicosia",
		"Asia/Novokuznetsk",
		"Asia/Novosibirsk",
		"Asia/Omsk",
		"Asia/Oral",
		"Asia/Phnom_Penh",
		"Asia/Pontianak",
		"Asia/Pyongyang",
		"Asia/Qatar",
		"Asia/Qostanay",
		"Asia/Qyzylorda",
		"Asia/Riyadh",
		"Asia/Sakhalin",
		"Asia/Samarkand",
		"Asia/Seoul",
		"Asia/Shanghai",
		"Asia/Singapore",
		"Asia/Srednekolymsk",
		"Asia/Taipei",
		"Asia/Tashkent",
		"Asia/Tbilisi",
		"Asia/Tehran",
		"Asia/Thimphu",
		"Asia/Tokyo",
		"Asia/Tomsk",
		"Asia/Ulaanbaatar",
		"Asia/Urumqi",
		"Asia/Ust-Nera",
		"Asia/Vientiane",
		"Asia/Vladivostok",
		"Asia/Yakutsk",
		"Asia/Yangon",
		"Asia/Yekaterinburg",
		"Asia/Yerevan",
		"Atlantic/Azores",
		"Atlantic/Bermuda",
		"Atlantic/Canary",
		"Atlantic/Cape_Verde",
		"Atlantic/Faroe",
		"Atlantic/Madeira",
		"Atlantic/Reykjavik",
		"Atlantic/South_Georgia",
		"Atlantic/St_Helena",
		"Atlantic/Stanley",
		"Australia/Adelaide",
		"Australia/Brisbane",
		"Australia/Broken_Hill",
		"Australia/Currie",
		"Australia/Darwin",
		"Australia/Eucla",
		"Australia/Hobart",
		"Australia/Lindeman",
		"Australia/Lord_Howe",
		"Australia/Melbourne",
		"Australia/Perth",
		"Australia/Sydney",
		"Europe/Amsterdam",
		"Europe/Andorra",
		"Europe/Astrakhan",
		"Europe/Athens",
		"Europe/Belgrade",
		"Europe/Berlin",
		"Europe/Bratislava",
		"Europe/Brussels",
		"Europe/Bucharest",
		"Europe/Budapest",
		"Europe/Busingen",
		"Europe/Chisinau",
		"Europe/Copenhagen",
		"Europe/Dublin",
		"Europe/Gibraltar",
		"Europe/Guernsey",
		"Europe/Helsinki",
		"Europe/Isle_of_Man",
		"Europe/Istanbul",
		"Europe/Jersey",
		"Europe/Kaliningrad",
		"Europe/Kiev",
		"Europe/Kirov",
		"Europe/Lisbon",
		"Europe/Ljubljana",
		"Europe/London",
		"Europe/Luxembourg",
		"Europe/Madrid",
		"Europe/Malta",
		"Europe/Mariehamn",
		"Europe/Minsk",
		"Europe/Monaco",
		"Europe/Moscow",
		"Europe/Oslo",
		"Europe/Paris",
		"Europe/Podgorica",
		"Europe/Prague",
		"Europe/Riga",
		"Europe/Rome",
		"Europe/Samara",
		"Europe/San_Marino",
		"Europe/Sarajevo",
		"Europe/Saratov",
		"Europe/Simferopol",
		"Europe/Skopje",
		"Europe/Sofia",
		"Europe/Stockholm",
		"Europe/Tallinn",
		"Europe/Tirane",
		"Europe/Ulyanovsk",
		"Europe/Uzhgorod",
		"Europe/Vaduz",
		"Europe/Vatican",
		"Europe/Vienna",
		"Europe/Vilnius",
		"Europe/Volgograd",
		"Europe/Warsaw",
		"Europe/Zagreb",
		"Europe/Zaporozhye",
		"Europe/Zurich",
		"Indian/Antananarivo",
		"Indian/Chagos",
		"Indian/Christmas",
		"Indian/Cocos",
		"Indian/Comoro",
		"Indian/Kerguelen",
		"Indian/Mahe",
		"Indian/Maldives",
		"Indian/Mauritius",
		"Indian/Mayotte",
		"Indian/Reunion",
		"Pacific/Apia",
		"Pacific/Auckland",
		"Pacific/Bougainville",
		"Pacific/Chatham",
		"Pacific/Chuuk",
		"Pacific/Easter",
		"Pacific/Efate",
		"Pacific/Enderbury",
		"Pacific/Fakaofo",
		"Pacific/Fiji",
		"Pacific/Funafuti",
		"Pacific/Galapagos",
		"Pacific/Gambier",
		"Pacific/Guadalcanal",
		"Pacific/Guam",
		"Pacific/Honolulu",
		"Pacific/Kiritimati",
		"Pacific/Kosrae",
		"Pacific/Kwajalein",
		"Pacific/Majuro",
		"Pacific/Marquesas",
		"Pacific/Midway",
		"Pacific/Nauru",
		"Pacific/Niue",
		"Pacific/Norfolk",
		"Pacific/Noumea",
		"Pacific/Pago_Pago",
		"Pacific/Palau",
		"Pacific/Pitcairn",
		"Pacific/Pohnpei",
		"Pacific/Port_Moresby",
		"Pacific/Rarotonga",
		"Pacific/Saipan",
		"Pacific/Tahiti",
		"Pacific/Tarawa",
		"Pacific/Tongatapu",
		"Pacific/Wake",
		"Pacific/Wallis"
	];

	const getTimezoneOffset = phantomDate => {
		const [year, month, day] = JSON.stringify(new phantomDate())
			.slice(1,11)
			.split('-');
		const dateString = `${month}/${day}/${year}`;
		const dateStringUTC = `${year}-${month}-${day}`;
		const now = +new phantomDate(dateString);
		const utc = +new phantomDate(dateStringUTC);
		const offset = +((now - utc)/60000);
		return ~~offset 
	};

	const getTimezoneOffsetHistory = ({ year, phantomIntl, phantomDate, city = null }) => {
		const format = {
			timeZone: '',
			year: 'numeric',
			month: 'numeric',
			day: 'numeric',
			hour: 'numeric',
			minute: 'numeric',
			second: 'numeric'
		};
	    const minute = 60000;
	    let formatter, summer;
	    if (city) {
	        const options = {
	            ...format,
	            timeZone: city
	        };
	        formatter = new phantomIntl.DateTimeFormat('en', options);
	        summer = +new phantomDate(formatter.format(new phantomDate(`7/1/${year}`)));
	    } else {
	        summer = +new phantomDate(`7/1/${year}`);
	    }
	    const summerUTCTime = +new phantomDate(`${year}-07-01`);
	    const offset = (summer - summerUTCTime) / minute;
	    return offset
	};

	const binarySearch = (list, fn) => {
	    const end = list.length;
	    const middle = Math.floor(end / 2);
	    const [left, right] = [list.slice(0, middle), list.slice(middle, end)];
	    const found = fn(left);
	    return end == 1 || found.length ? found : binarySearch(right, fn)
	};

	const decryptLocation = ({ year, timeZone, phantomIntl, phantomDate }) => {
		const system = getTimezoneOffsetHistory({ year, phantomIntl, phantomDate});
		const resolvedOptions = getTimezoneOffsetHistory({ year, phantomIntl, phantomDate, city: timeZone});
		const filter = cities => cities
			.filter(city => system == getTimezoneOffsetHistory({ year, phantomIntl, phantomDate, city }));

		// get city region set
		const decryption = (
			system == resolvedOptions ? [timeZone] : binarySearch(cities, filter)
		);

		// reduce set to one city
		const decrypted = (
			decryption.length == 1 && decryption[0] == timeZone ? timeZone : hashMini(decryption)
		);
		return decrypted
	};

	const formatLocation = x => x.replace(/_/, ' ').split('/').join(', '); 

	const getTimezone = async imports => {

		const {
			require: {
				captureError,
				lieProps,
				phantomDarkness,
				logTestResult
			}
		} = imports;

		try {
			const start = performance.now();
			
			let lied = (
				lieProps['Date.getTimezoneOffset'] ||
				lieProps['Intl.DateTimeFormat.resolvedOptions'] ||
				lieProps['Intl.RelativeTimeFormat.resolvedOptions']
			) || false;
			const phantomDate = phantomDarkness ? phantomDarkness.Date : Date;
			const phantomIntl = phantomDarkness ? phantomDarkness.Intl : Intl;

			const year = 1113;
			const { timeZone } = phantomIntl.DateTimeFormat().resolvedOptions();
			const decrypted = decryptLocation({ year, timeZone, phantomIntl, phantomDate });
			const locationEpoch = +new Date(new Date(`7/1/${year}`));
			const notWithinParentheses = /.*\(|\).*/g;
			const data =  {
				zone: (''+new phantomDate()).replace(notWithinParentheses, ''),
				location: formatLocation(timeZone),
				locationMeasured: formatLocation(decrypted),
				locationEpoch,
				offset: new phantomDate().getTimezoneOffset(),
				offsetComputed: getTimezoneOffset(phantomDate),
				lied
			};
			logTestResult({ start, test: 'timezone', passed: true });
			return { ...data }
		}
		catch (error) {
			logTestResult({ test: 'timezone', passed: false });
			captureError(error);
			return
		}
	};

	const timezoneHTML = ({ fp, note, hashSlice }) => {
		if (!fp.timezone) {
			return `
		<div class="col-four undefined">
			<strong>Timezone</strong>
			<div class="block-text">${note.blocked}</div>
		</div>`
		}
		const {
			timezone: {
				$hash,
				zone,
				location,
				locationMeasured,
				locationEpoch,
				offset,
				offsetComputed,
				lied
			}
		} = fp;
		return `
	<div class="col-four${lied ? ' rejected' : ''}">
		<strong>Timezone</strong><span class="${lied ? 'lies ' : ''}hash">${hashSlice($hash)}</span>
		<div class="block-text help"  title="Date\nDate.getTimezoneOffset\nIntl.DateTimeFormat">
			${zone ? zone : ''}
			<br>${location != locationMeasured ? locationMeasured : location}
			<br>${locationEpoch}
			<br>${offset != offsetComputed ? offsetComputed : offset}
		</div>
	</div>
	`
	};

	const getVoices = imports => {

		const {
			require: {
				captureError,
				phantomDarkness,
				logTestResult,
				caniuse,
			}
		} = imports;
			
		return new Promise(async resolve => {
			try {
				const win = phantomDarkness ? phantomDarkness : window;
				const supported = 'speechSynthesis' in win;
				supported && speechSynthesis.getVoices(); // warm up
				await new Promise(setTimeout).catch(e => {});
				const start = performance.now();
				if (!supported) {
					logTestResult({ test: 'speech', passed: false });
					return resolve()
				}
				let success = false;
				const getVoices = () => {
					const data = win.speechSynthesis.getVoices();
					if (!data || !data.length) {
						return
					}
					success = true;
					const voices = data.map(({ name, lang }) => ({ name, lang }));
					const defaultVoice = caniuse(() => data.find(voice => voice.default).name);
					logTestResult({ start, test: 'speech', passed: true });
					return resolve({ voices, defaultVoice })
				};
				
				getVoices();
				win.speechSynthesis.onvoiceschanged = getVoices; // Chrome support
				
				// handle pending resolve
				const wait = 1000;
				setTimeout(() => {
					if (success) {
						return
					}
					logTestResult({ test: 'speech', passed: false });
					return resolve()
				}, wait);
			}
			catch (error) {
				logTestResult({ test: 'speech', passed: false });
				captureError(error);
				return resolve()
			}
		})
	};

	const voicesHTML = ({ fp, note, count, modal, hashMini, hashSlice }) => {
		if (!fp.voices) {
			return `
		<div class="col-four undefined">
			<strong>Speech</strong>
			<div>voices (0): ${note.blocked}</div>
			<div>default: ${note.blocked}</div>
		</div>`
		}
		const {
			voices: {
				$hash,
				defaultVoice,
				voices
			}
		} = fp;
		const voiceList = voices.map(voice => `${voice.name} (${voice.lang})`);
		return `
	<div class="col-four">
		<strong>Speech</strong><span class="hash">${hashSlice($hash)}</span>
		<div>voices (${count(voices)}): ${
			!voiceList || !voiceList.length ? note.unsupported :
			modal(
				'creep-voices',
				voiceList.join('<br>'),
				hashMini(voices)
			)
		}</div>
		<div>default:${
			!defaultVoice ? ` ${note.unsupported}` :
			`<span class="sub-hash">${hashMini(defaultVoice)}</span>`
		}</div>
	</div>
	`
	};

	const getWebRTCData = imports => {

		const {
			require: {
				captureError,
				caniuse,
				logTestResult,
				hashMini
			}
		} = imports;
		
		return new Promise(async resolve => {
			try {
				await new Promise(setTimeout).catch(e => {});
				const start = performance.now();
				let rtcPeerConnection = (
					window.RTCPeerConnection ||
					window.webkitRTCPeerConnection ||
					window.mozRTCPeerConnection ||
					window.msRTCPeerConnection
				);

				const getCapabilities = () => {
					let capabilities;
					try {
						capabilities = {
							sender: !caniuse(() => RTCRtpSender.getCapabilities) ? undefined : {
								audio: RTCRtpSender.getCapabilities('audio'),
								video: RTCRtpSender.getCapabilities('video')
							},
							receiver: !caniuse(() => RTCRtpReceiver.getCapabilities) ? undefined : {
								audio: RTCRtpReceiver.getCapabilities('audio'),
								video: RTCRtpReceiver.getCapabilities('video')
							}
						};
					}
					catch (error) {}
					return capabilities
				};

				// check support
				if (!rtcPeerConnection) {
					logTestResult({ test: 'webrtc', passed: false });
					return resolve()
				}
				
				// get connection
				const connection = new rtcPeerConnection(
					{ iceServers: [{ urls: ['stun:stun.l.google.com:19302?transport=udp'] }] }
				);
				
				// create channel
				let success;
				connection.createDataChannel('creep');

				// set local description
				await connection.createOffer()
				.then(offer => connection.setLocalDescription(offer))
				.catch(error => console.error(error));

				// get sdp capabilities
				let sdpcapabilities;
				const capabilities = getCapabilities();
				await connection.createOffer({
					offerToReceiveAudio: 1,
					offerToReceiveVideo: 1
				})
				.then(offer => (
					sdpcapabilities = caniuse(
						() => offer.sdp
							.match(/((ext|rtp)map|fmtp|rtcp-fb):.+ (.+)/gm)
							.sort()
					)
				))
				.catch(error => console.error(error));
		
				connection.onicecandidate = e => {
					const candidateEncoding = /((udp|tcp)\s)((\d|\w)+\s)((\d|\w|(\.|\:))+)(?=\s)/ig;
					const connectionLineEncoding = /(c=IN\s)(.+)\s/ig;

					// handle null candidate and resolve early
					if (!e.candidate) {
						if (sdpcapabilities) {
							// resolve partial success
							success = true; 
							logTestResult({ start, test: 'webrtc', passed: true });
							return resolve({
								capabilities,
								sdpcapabilities
							})
						}
						// resolve error
						logTestResult({ test: 'webrtc', passed: false });
						return resolve()
					}

					const { candidate } = e.candidate;
					const encodingMatch = candidate.match(candidateEncoding);
					if (encodingMatch) {
						success = true;
						const {
							sdp
						} = e.target.localDescription;
						const ipaddress = caniuse(() => e.candidate.address);
						const candidateIpAddress = caniuse(() => encodingMatch[0].split(' ')[2]);
						const connectionLineIpAddress = caniuse(() => sdp.match(connectionLineEncoding)[0].trim().split(' ')[2]);

						const type = caniuse(() => /typ ([a-z]+)/.exec(candidate)[1]);
						const foundation = caniuse(() => /candidate:(\d+)\s/.exec(candidate)[1]);
						const protocol = caniuse(() => /candidate:\d+ \w+ (\w+)/.exec(candidate)[1]);
						
						const data = {
							ipaddress,
							candidate: candidateIpAddress,
							connection: connectionLineIpAddress,
							type,
							foundation,
							protocol,
							capabilities,
							sdpcapabilities
						};
						logTestResult({ start, test: 'webrtc', passed: true });
						return resolve({ ...data })
					}
					return
				};

				// resolve when Timeout is reached
				setTimeout(() => {
					if (!success) {
						logTestResult({ test: 'webrtc', passed: false });
						return resolve()
					}
				}, 1000);
			}
			catch (error) {
				logTestResult({ test: 'webrtc', passed: false });
				captureError(error, 'RTCPeerConnection failed or blocked by client');
				return resolve()
			}
		})
	};


	const webrtcHTML = ({ fp, hashSlice, hashMini, note, modal }) => {
		if (!fp.webRTC) {
			return `
		<div class="col-four undefined">
			<strong>WebRTC</strong>
			<div class="block-text">${note.blocked}</div>
			<div>type: ${note.blocked}</div>
			<div>foundation: ${note.blocked}</div>
			<div>protocol: ${note.blocked}</div>
			<div>get capabilities: ${note.blocked}</div>
			<div>sdp capabilities: ${note.blocked}</div>
		</div>`
		}
		const { webRTC } = fp;
		const {
			ipaddress,
			candidate,
			connection,
			type,
			foundation,
			protocol,
			capabilities,
			sdpcapabilities,
			$hash
		} = webRTC;
		const id = 'creep-webrtc';

		return `
	<div class="col-four">
		<strong>WebRTC</strong><span class="hash">${hashSlice($hash)}</span>
		<div class="block-text"">
			${ipaddress ? ipaddress : ''}
			${candidate ? `<br>${candidate}` : ''}
			${connection ? `<br>${connection}` : ''}
		</div>
		<div>type: ${type ? type : note.unsupported}</div>
		<div>foundation: ${foundation ? foundation : note.unsupported}</div>
		<div>protocol: ${protocol ? protocol : note.unsupported}</div>
		<div>codecs: ${
			!capabilities.receiver && !capabilities.sender ? note.unsupported :
			modal(
				`${id}-capabilities`,
				Object.keys(capabilities).map(modeKey => {
					const mode = capabilities[modeKey];
					if (!mode) {
						return ''
					}
					return `
						<br><div>mimeType [channels] (clockRate) * sdpFmtpLine</div>
						${
							Object.keys(mode).map(media => Object.keys(mode[media])
								.map(key => {
									return `<br><div><strong>${modeKey} ${media} ${key}</strong>:</div>${
										mode[media][key].map(obj => {
											const {
												channels,
												clockRate,
												mimeType,
												sdpFmtpLine,
												uri
											} = obj;
											return `
												<div>
												${mimeType||''}
												${channels ? `[${channels}]`: ''}
												${clockRate ? `(${clockRate})`: ''}
												${sdpFmtpLine ? `<br>* ${sdpFmtpLine}` : ''}
												${uri||''}
												</div>
											`
										}).join('')
									}`
								}).join('')
							).join('')
						}
					`
				}).join(''),
				hashMini(capabilities)
			)
		}</div>
		<div>codecs sdp: ${
			!sdpcapabilities ? note.unsupported :
			modal(
				`${id}-sdpcapabilities`,
				sdpcapabilities.join('<br>'),
				hashMini(sdpcapabilities)
			)
		}</div>
	</div>
	`	
	};

	const source = 'creepworker.js';

	const getDedicatedWorker = phantomDarkness => {
		return new Promise(resolve => {
			try {
				if (phantomDarkness && !phantomDarkness.Worker) {
					return resolve()
				}
				else if (
					phantomDarkness && phantomDarkness.Worker.prototype.constructor.name != 'Worker'
				) {
					throw new Error('Worker tampered with by client')
				}
				const worker = (
					phantomDarkness ? phantomDarkness.Worker : Worker
				);
				const dedicatedWorker = new worker(source);
				dedicatedWorker.onmessage = message => {
					dedicatedWorker.terminate();
					return resolve(message.data)
				};
			}
			catch(error) {
				console.error(error);
				captureError(error);
				return resolve()
			}
		})
	};

	const getSharedWorker = phantomDarkness => {
		return new Promise(resolve => {
			try {
				if (phantomDarkness && !phantomDarkness.SharedWorker) {
					return resolve()
				}
				else if (
					phantomDarkness && phantomDarkness.SharedWorker.prototype.constructor.name != 'SharedWorker'
				) {
					throw new Error('SharedWorker tampered with by client')
				}

				const worker = (
					phantomDarkness ? phantomDarkness.SharedWorker : SharedWorker
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
				captureError(error);
				return resolve()
			}
		})
	};

	const getServiceWorker = () => {
		return new Promise(async resolve => {
			try {
				if (!('serviceWorker' in navigator)) {
					return resolve()
				}
				else if (navigator.serviceWorker.__proto__.constructor.name != 'ServiceWorkerContainer') {
					throw new Error('ServiceWorkerContainer tampered with by client')
				}

				await navigator.serviceWorker.register(source)
				.catch(error => {
					console.error(error);
					return resolve()
				});
				const registration = await navigator.serviceWorker.ready
				.catch(error => {
					console.error(error);
					return resolve()
				});

				if (!('BroadcastChannel' in window)) {
					return resolve() // no support in Safari and iOS
				}

				const broadcast = new BroadcastChannel('creep_service_primary');
				broadcast.onmessage = message => {
					registration.unregister();
					broadcast.close();
					return resolve(message.data)
				};
				broadcast.postMessage({ type: 'fingerprint'});
				return setTimeout(() => resolve(), 1000)
			}
			catch(error) {
				console.error(error);
				captureError(error);
				return resolve()
			}
		})
	};

	const getBestWorkerScope = async imports => {	
		const {
			require: {
				getOS,
				decryptUserAgent,
				captureError,
				caniuse,
				phantomDarkness,
				getUserAgentPlatform,
				documentLie,
				logTestResult
			}
		} = imports;
		try {
			await new Promise(setTimeout).catch(e => {});
			const start = performance.now();
			let scope = 'ServiceWorkerGlobalScope';
			let type = 'service'; // loads fast but is not available in frames
			let workerScope = await getServiceWorker()
				.catch(error => console.error(error.message));
			if (!caniuse(() => workerScope.userAgent)) {
				scope = 'SharedWorkerGlobalScope';
				type = 'shared'; // no support in Safari, iOS, and Chrome Android
				workerScope = await getSharedWorker(phantomDarkness)
				.catch(error => console.error(error.message));
			}
			if (!caniuse(() => workerScope.userAgent)) {
				scope = 'WorkerGlobalScope';
				type = 'dedicated'; // simulators & extensions can spoof userAgent
				workerScope = await getDedicatedWorker(phantomDarkness)
				.catch(error => console.error(error.message));
			}
			if (caniuse(() => workerScope.userAgent)) {
				const { canvas2d } = workerScope || {};
				workerScope.system = getOS(workerScope.userAgent);
				workerScope.device = getUserAgentPlatform({ userAgent: workerScope.userAgent });
				workerScope.canvas2d = { dataURI: canvas2d };
				workerScope.type = type;
				workerScope.scope = scope;

				// detect lies 
				const {
					fontSystemClass,
					system,
					userAgent,
					userAgentData,
					platform
				} = workerScope || {};
				
				// font system lie
				const fontSystemLie = fontSystemClass && (
					/^((i(pad|phone|os))|mac)$/i.test(system) && fontSystemClass != 'Apple'  ? true :
						/^(windows)$/i.test(system) && fontSystemClass != 'Windows'  ? true :
							/^(linux|chrome os)$/i.test(system) && fontSystemClass != 'Linux'  ? true :
								/^(android)$/i.test(system) && fontSystemClass != 'Android'  ? true :
									false
				);
				if (fontSystemLie) {
					workerScope.lied = true;
					workerScope.lies.system = `${fontSystemClass} fonts and ${system} user agent do not match`;
					documentLie(workerScope.scope, workerScope.lies.system);
				}

				// prototype lies
				if (workerScope.lies.proto) {
					const { proto } = workerScope.lies;
					const keys = Object.keys(proto);
					keys.forEach(key => {
						const api = `${workerScope.scope}.${key}`;
						const lies = proto[key];
						lies.forEach(lie => documentLie(api, lie));
					});
					
				}
				
				// user agent os lie
				const userAgentOS = (
					// order is important
					/win(dows|16|32|64|95|98|nt)|wow64/ig.test(userAgent) ? 'Windows' :
						/android|linux|cros/ig.test(userAgent) ? 'Linux' :
							/(i(os|p(ad|hone|od)))|mac/ig.test(userAgent) ? 'Apple' :
								'Other'
				);
				const platformOS = (
					// order is important
					/win/ig.test(platform) ? 'Windows' :
						/android|arm|linux/ig.test(platform) ? 'Linux' :
							/(i(os|p(ad|hone|od)))|mac/ig.test(platform) ? 'Apple' :
								'Other'
				);
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
					isBrave: false // default false since we are only looking for JS runtime and version
				});
				const reportedEngine = (
					(/safari/i.test(decryptedName) || /iphone|ipad/i.test(userAgent)) ? 'JavaScriptCore' :
						/firefox/i.test(userAgent) ? 'SpiderMonkey' :
							/chrome/i.test(userAgent) ? 'V8' :
								undefined
				);
				const jsRuntimeEngine = {
					'1.9275814160560204e-50': 'V8',
					'1.9275814160560185e-50': 'SpiderMonkey',
					'1.9275814160560206e-50': 'JavaScriptCore'
				};
				const mathPI = 3.141592653589793;
				const engine = jsRuntimeEngine[mathPI ** -100];
				if (reportedEngine != engine) {
					workerScope.lied = true;
					workerScope.lies.engine = `${engine} JS runtime and ${reportedEngine} user agent do not match`;
					documentLie(workerScope.scope, workerScope.lies.engine);
				}
				// user agent version lie
				const getVersion = x => /\s(\d+)/i.test(x) && /\s(\d+)/i.exec(x)[1];
				const reportedVersion = getVersion(decryptedName);
				const userAgenDataVersion = (
					userAgentData &&
					userAgentData.brandsVersion &&
					userAgentData.brandsVersion.length ? 
					getVersion(userAgentData.brandsVersion) :
					false
				);
				const versionSupported = userAgenDataVersion && reportedVersion;
				const versionMatch = userAgenDataVersion == reportedVersion;
				if (versionSupported && !versionMatch) {
					workerScope.lied = true;
					workerScope.lies.version = `userAgentData version ${userAgenDataVersion} and user agent version ${reportedVersion} do not match`;
					documentLie(workerScope.scope, workerScope.lies.version);
				}

				logTestResult({ start, test: `${type} worker`, passed: true });
				return { ...workerScope }
			}
			return
		}
		catch (error) {
			logTestResult({ test: 'worker', passed: false });
			captureError(error, 'workers failed or blocked by client');
			return
		}
	};

	const workerScopeHTML = ({ fp, note, count, modal, hashMini, hashSlice }) => {
		if (!fp.workerScope) {
			return `
		<div class="col-six undefined">
			<strong>Worker</strong>
			<div>canvas 2d: ${note.blocked}</div>
			<div>textMetrics: ${note.blocked}</div>
			<div>fontFaceSet (0): ${note.blocked}</div>
			<div>keys (0): ${note.blocked}</div>
			<div>permissions (0): ${note.blocked}</div>
			<div>codecs (0):${note.blocked}</div>
			<div>timezone: ${note.blocked}</div>
			<div>language: ${note.blocked}</div>
			<div>webgl:</div>
			<div class="block-text">${note.blocked}</div>
		</div>
		<div class="col-six undefined">
			<div>device:</div>
			<div class="block-text">${note.blocked}</div>
			<div>userAgent:</div>
			<div class="block-text">${note.blocked}</div>
			<div>userAgentData:</div>
			<div class="block-text">${note.blocked}</div>
		</div>`
		}
		const { workerScope: data } = fp;

		const {
			scopeKeys,
			lied,
			locale,
			systemCurrencyLocale,
			engineCurrencyLocale,
			localeEntropyIsTrusty,
			localeIntlEntropyIsTrusty,
			timezoneOffset,
			timezoneLocation,
			deviceMemory,
			hardwareConcurrency,
			language,
			languages,
			mediaCapabilities,
			platform,
			userAgent,
			permissions,
			canvas2d,
			textMetrics,
			webglRenderer,
			webglVendor,
			fontFaceSetFonts,
			fontSystemClass,
			fontListLen,
			userAgentData,
			type,
			scope,
			system,
			device,
			$hash
		} = data || {};

		const icon = {
			'Linux': '<span class="icon linux"></span>',
			'Apple': '<span class="icon apple"></span>',
			'Windows': '<span class="icon windows"></span>',
			'Android': '<span class="icon android"></span>'
		};

		const systemClassIcon = icon[fontSystemClass];
		const fontFaceSetHash = hashMini(fontFaceSetFonts);
		const codecKeys = Object.keys(mediaCapabilities || {});
		const permissionsKeys = Object.keys(permissions || {});
		const permissionsGranted = (
			permissions && permissions.granted ? permissions.granted.length : 0
		);
		const getSum = arr => !arr ? 0 : arr.reduce((acc, curr) => (acc += Math.abs(curr)), 0);
		return `
	<div class="ellipsis"><span class="aside-note">${scope || ''}</span></div>
	<div class="col-six${lied ? ' rejected' : ''}">
		<strong>Worker</strong><span class="hash">${hashSlice($hash)}</span>
		<div class="help" title="OffscreenCanvas.convertToBlob()\nFileReader.readAsDataURL()">canvas 2d:${
			canvas2d && canvas2d.dataURI ?
			`<span class="sub-hash">${hashMini(canvas2d.dataURI)}</span>` :
			` ${note.unsupported}`
		}</div>
		<div class="help" title="OffscreenCanvasRenderingContext2D.measureText()">textMetrics: ${
			!textMetrics ? note.blocked : getSum(Object.keys(textMetrics).map(key => textMetrics[key] || 0)) || note.blocked
		}</div>
		<div class="help" title="FontFaceSet.check()">fontFaceSet (${fontFaceSetFonts ? count(fontFaceSetFonts) : '0'}/${''+fontListLen}): ${
			fontFaceSetFonts.length ? modal(
				'creep-worker-fonts-check', fontFaceSetFonts.map(font => `<span style="font-family:'${font}'">${font}</span>`).join('<br>'),
				systemClassIcon ? `${systemClassIcon}${fontFaceSetHash}` : fontFaceSetHash
			) : note.unsupported
		}</div>
		<div>keys (${count(scopeKeys)}): ${
			scopeKeys && scopeKeys.length ? modal(
				'creep-worker-scope-version',
				scopeKeys.join(', '),
				hashMini(scopeKeys)
			) : note.blocked
		}</div>
		<div class="help" title="Permissions.query()">permissions (${''+permissionsGranted}): ${
			!permissions || !permissionsKeys ? note.unsupported : modal(
				'creep-worker-permissions',
				permissionsKeys.map(key => `<div class="perm perm-${key}"><strong>${key}</strong>:<br>${permissions[key].join('<br>')}</div>`).join(''),
				hashMini(permissions)
			)
		}</div>
		<div class="help" title="MediaCapabilities.decodingInfo()">codecs (${''+codecKeys.length}): ${
		!mediaCapabilities || !codecKeys.length ? note.unsupported :
			modal(
				`creep-worker-media-codecs`,
				Object.keys(mediaCapabilities).map(key => `${key}: ${mediaCapabilities[key].join(', ')}`).join('<br>'),
				hashMini(mediaCapabilities)
			)
		}</div>
		<div class="help" title="Intl.DateTimeFormat().resolvedOptions().timeZone\nDate.getDate()\nDate.getMonth()\nDate.parse()">timezone: ${timezoneLocation} (${''+timezoneOffset})</div>
		<div class="help" title="WorkerNavigator.language\nWorkerNavigator.languages\nIntl.Collator.resolvedOptions()\nIntl.DateTimeFormat.resolvedOptions()\nIntl.DisplayNames.resolvedOptions()\nIntl.ListFormat.resolvedOptions()\nIntl.NumberFormat.resolvedOptions()\nIntl.PluralRules.resolvedOptions()\nIntl.RelativeTimeFormat.resolvedOptions()\nNumber.toLocaleString()">lang:
			${
				localeEntropyIsTrusty ? `${language} (${systemCurrencyLocale})` : 
					`${language} (<span class="bold-fail">${engineCurrencyLocale}</span>)`
			}
			${
				locale === language ? '' : localeIntlEntropyIsTrusty ? ` ${locale}` : 
					` <span class="bold-fail">${locale}</span>`
			}
		</div>
		<div>webgl:</div>
		<div class="block-text help" title="WebGLRenderingContext.getParameter()">
			${webglVendor ? `${webglVendor}` : ''}
			${webglRenderer ? `<br>${webglRenderer}` : note.unsupported}
		</div>
	</div>
	<div class="col-six${lied ? ' rejected' : ''}">
		<div>device:</div>
		<div class="block-text help" title="WorkerNavigator.deviceMemory\nWorkerNavigator.hardwareConcurrency\nWorkerNavigator.platform\nWorkerNavigator.userAgent">
			${`${system}${platform ? ` (${platform})` : ''}`}
			${device ? `<br>${device}` : note.blocked}
			<br>cores: ${hardwareConcurrency}${deviceMemory ? `, memory: ${deviceMemory}` : ''}
		</div>
		<div>userAgent:</div>
		<div class="block-text help" title="WorkerNavigator.userAgent">
			<div>${userAgent || note.unsupported}</div>
		</div>
		<div>userAgentData:</div>
		<div class="block-text help" title="WorkerNavigator.userAgentData\nNavigatorUAData.getHighEntropyValues()">
			<div>
			${((userAgentData) => {
				const {
					architecture,
					brandsVersion,
					uaFullVersion,
					mobile,
					model,
					platformVersion,
					platform
				} = userAgentData || {};
				return !userAgentData ? note.unsupported : `
					${(brandsVersion || []).join(',')}${uaFullVersion ? ` (${uaFullVersion})` : ''}
					<br>${platform} ${platformVersion} ${architecture}
					${model ? `<br>${model}` : ''}
					${mobile ? '<br>mobile' : ''}
				`
			})(userAgentData)}	
			</div>
		</div>
	</div>
	`
	};

	const getSVG = async imports => {

		const {
			require: {
				instanceId,
				hashMini,
				patch,
				html,
				captureError,
				documentLie,
				lieProps,
				logTestResult,
				phantomDarkness
			}
		} = imports;
		
		try {
			const start = performance.now();
			let lied = (
				lieProps['SVGRect.height'] ||
				lieProps['SVGRect.width'] ||
				lieProps['SVGRect.x'] ||
				lieProps['SVGRect.y']
			) || false; // detect lies
							
			const doc = phantomDarkness ? phantomDarkness.document : document;

			const svgId = `${instanceId}-svg-div`;
			const divElement = document.createElement('div');
			divElement.setAttribute('id', svgId);
			doc.body.appendChild(divElement);
			const divRendered = doc.getElementById(svgId);
			
			// patch div
			patch(divRendered, html`
		<div id="${svgId}">
			<div id="svg-container">
				<style>
				#svg-container {
					position: absolute;
					left: -9999px;
					height: auto;
				}
				#svgText {
					font-family: monospace !important;
					font-size: 100px;
					font-style: normal;
					font-weight: normal;
					letter-spacing: normal;
					line-break: auto;
					line-height: normal;
					text-transform: none;
					text-align: left;
					text-decoration: none;
					text-shadow: none;
					white-space: normal;
					word-break: normal;
					word-spacing: normal;
				}
				</style>
				<svg>
					<g id="svgBox">
						<text id="svgText" x="32" y="32" transform="scale(0.099999999)">
							qwertyuiopasdfghjklzxcvbnm
						</text>
					</g>
					<path id="svgPath" d="M 10 80 C 50 10, 75 10, 95 80 S 150 110, 150 110 S 80 190, 40 140 Z"/>
				</svg>
			</div>
		</div>
		`);
			
			const svgBox = doc.getElementById('svgBox');
			const bBox = {} // SVGRect 
			;(
				{
					height: bBox.height,
					width: bBox.width,
					x: bBox.x,
					y: bBox.y
				} = svgBox.getBBox()
			);
			
			const svgText = doc.getElementById('svgText');
			const subStringLength = svgText.getSubStringLength(1, 2);
			const extentOfChar = {} // SVGRect 
			;(
				{
					height: extentOfChar.height,
					width: extentOfChar.width,
					x: extentOfChar.x,
					y: extentOfChar.y
				} = svgText.getExtentOfChar('x')
			);
				
			const computedTextLength = svgText.getComputedTextLength();		
			const svgPath = doc.getElementById('svgPath');
			const totalLength = svgPath.getTotalLength();
			const pointAtLength = {} // SVGPoint 
			;(
				{
					x: pointAtLength.x,
					y: pointAtLength.y
				} = svgPath.getPointAtLength(1)
			);

			logTestResult({ start, test: 'svg', passed: true });

			const getSum = obj => !obj ? 0 : Object.keys(obj).reduce((acc, key) => acc += Math.abs(obj[key]), 0);
			return {
				bBox: getSum(bBox),
				subStringLength,
				extentOfChar: getSum(extentOfChar),
				computedTextLength,
				totalLength,
				pointAtLength: getSum(pointAtLength),
				lied
			}
		}
		catch (error) {
			logTestResult({ test: 'svg', passed: false });
			captureError(error);
			return
		}
	};

	const svgHTML = ({ fp, note, hashSlice }) => {
		if (!fp.svg) {
			return `
		<div class="col-six undefined">
			<strong>SVG</strong>
			<div>bBox: ${note.blocked}</div>
			<div>pointAt: ${note.blocked}</div>
			<div>total: ${note.blocked}</div>
			<div>extentOfChar: ${note.blocked}</div>
			<div>subString: ${note.blocked}</div>
			<div>computedText: ${note.blocked}</div>
		</div>`
		}
		const {
			svg: {
				$hash,
				bBox,
				subStringLength,
				extentOfChar,
				computedTextLength,
				totalLength,
				pointAtLength,
				lied
			}
		} = fp;

		return `
	<div class="col-six${lied ? ' rejected' : ''}">
		<strong>SVG</strong><span class="${lied ? 'lies ' : ''}hash">${hashSlice($hash)}</span>
		<div class="help" title="SVGGraphicsElement.getBBox()">bBox: ${bBox || note.blocked}</div>
		<div class="help" title="SVGGeometryElement.getPointAtLength()">pointAt: ${pointAtLength || note.blocked}</div>
		<div class="help" title="SVGGeometryElement.getTotalLength()">total: ${totalLength || note.blocked}</div>
		<div class="help" title="SVGTextContentElement.getExtentOfChar()">extentOfChar: ${extentOfChar || note.blocked}</div>
		<div class="help" title="SVGTextContentElement.getSubStringLength()">subString: ${subStringLength || note.blocked}</div>
		<div class="help" title="SVGTextContentElement.getComputedTextLength()">computedText: ${computedTextLength || note.blocked}</div>
	</div>
	`	
	};

	const getResistance = async imports => {

		const {
			require: {
				isFirefox,
				isChrome,
				getBraveMode,
				braveBrowser,
				prototypeLies,
				hashMini,
				captureError,
				logTestResult
			}
		} = imports;

		try {
			await new Promise(setTimeout).catch(e => {});
			const start = performance.now();
			const data = {
				privacy: undefined,
				security: undefined,
				mode: undefined,
				extension: undefined,
				engine: (
					isChrome ? 'Blink' :
						isFirefox ? 'Gecko' :
							''
				)
			};
			// Brave
			const isBrave = await braveBrowser();
			if (isBrave) {
				const braveMode = getBraveMode();
				data.privacy = 'Brave';
				data.security = {
					'FileSystemWritableFileStream': 'FileSystemWritableFileStream' in window,
					'Serial': 'Serial' in window,
					'ReportingObserver': 'ReportingObserver' in window
				};
				data.mode = (
					braveMode.allow ? 'allow' :
					braveMode.standard ? 'standard' :
					braveMode.strict ? 'strict' :
					undefined
				);
			}
			
			// Firefox/Tor Browser
			const regex = n => new RegExp(`${n}+$`);
			const delay = (ms, baseNumber, baseDate = null) => new Promise(resolve => setTimeout(() => {
				const date = baseDate ? baseDate : +new Date();
				const value = regex(baseNumber).test(date) ? regex(baseNumber).exec(date)[0] : date;
				return resolve(value)
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

				const protection = (
					lastCharA == lastCharB &&
					lastCharA == lastCharC &&
					lastCharA == lastCharD &&
					lastCharA == lastCharE &&
					lastCharA == lastCharF &&
					lastCharA == lastCharG &&
					lastCharA == lastCharH &&
					lastCharA == lastCharI &&
					lastCharA == lastCharJ
				);
				const baseLen = ('' + a).length;
				const collection = [a, b, c, d, e, f, g, h, i, j];
				return {
					protection,
					delays: collection.map(n => ('' + n).length > baseLen ? ('' + n).slice(-baseLen) : n),
					precision: protection ? Math.min(...collection.map(val => ('' + val).length)) : undefined,
					precisionValue: protection ? lastCharA : undefined
				}
			};
			const { protection } = isChrome ? {} : await getTimerPrecision();

			if (isFirefox && protection) {
				const features = {
					'OfflineAudioContext': 'OfflineAudioContext' in window, // dom.webaudio.enabled
					'WebGL2RenderingContext': 'WebGL2RenderingContext' in window, // webgl.enable-webgl2
					'WebAssembly': 'WebAssembly' in window, // javascript.options.wasm
					'maxTouchPoints': 'maxTouchPoints' in navigator,
					'RTCRtpTransceiver':  'RTCRtpTransceiver' in window,
					'MediaDevices': 'MediaDevices' in window,
					'Credential': 'Credential' in window
				};
				const featureKeys = Object.keys(features);
				const targetSet = new Set([
					'RTCRtpTransceiver',
					'MediaDevices',
					'Credential'
				]);
				const torBrowser = featureKeys.filter(key => targetSet.has(key) && !features[key]).length == targetSet.size;
				const safer = !features.WebAssembly;
				data.privacy = torBrowser ? 'Tor Browser' : 'Firefox';
				data.security = {
					'reduceTimerPrecision': true,
					...features
				};
				data.mode = (
					!torBrowser ? 'resistFingerprinting' :
						safer ? 'safer' :
							'standard' 
				);
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
					getContextHash: ['0b637a33', disabled]
				},
				trace: {
					contentDocumentHash: ['ca9d9c2f'],
					contentWindowHash: ['ca9d9c2f'],
					createElementHash: ['77dea834'],
					getElementByIdHash: ['77dea834'],
					getImageDataHash: ['77dea834'],
					toBlobHash: ['77dea834'],
					toDataURLHash: ['77dea834']
				},
				cydec: {
					// [FF, FF Anti OFF, Chrome, Chrome Anti Off, no iframe Chrome, no iframe Chrome Anti Off]
					contentDocumentHash: ['945b0c78', '15771efa', '403a1a21', '55e9b959'],
					contentWindowHash: ['945b0c78', '15771efa', '403a1a21', '55e9b959'],
					createElementHash: ['cc7cb598', '4237b44c', '1466aaf0', '0cb0c682', '73c662d9', '72b1ee2b'],
					getElementByIdHash: ['cc7cb598', '4237b44c', '1466aaf0', '0cb0c682', '73c662d9', '72b1ee2b'],
					getImageDataHash: ['db60d7f9', '15771efa', 'db60d7f9', '55e9b959'],
					toBlobHash: ['044f14c2', '15771efa', 'afec348d', '55e9b959', '0dbbf456'],
					toDataURLHash: ['ecb498d9', '6b838fb6', 'ecb498d9', 'd19104ec', 'ecb498d9', '6985d315']
				},
				canvasblocker: {
					contentDocumentHash: ['6f901c5a'],
					contentWindowHash: ['6f901c5a'],
					appendHash: ['6f901c5a'],
					getImageDataHash: ['6f901c5a', 'a2971888', disabled],
					toBlobHash: ['6f901c5a', '9f1c3dfe', disabled],
					toDataURLHash: ['6f901c5a', disabled]
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
					replaceChildHash: ['77dea834']
				},
				duckduckgo: {
					toDataURLHash: ['fd00bf5d', '8ee7df22'],
					toBlobHash: ['fd00bf5d', '8ee7df22'],
					getImageDataHash: ['fd00bf5d', '8ee7df22'],
					getByteFrequencyDataHash: ['fd00bf5d', '8ee7df22'],
					getByteTimeDomainDataHash: ['fd00bf5d', '8ee7df22'],
					getFloatFrequencyDataHash: ['fd00bf5d', '8ee7df22'],
					getFloatTimeDomainDataHash: ['fd00bf5d', '8ee7df22'],
					copyFromChannelHash: ['fd00bf5d', '8ee7df22'],
					getChannelDataHash: ['fd00bf5d', '8ee7df22'],
					hardwareConcurrencyHash: ['dfd41ab4'],
					availHeightHash: ['dfd41ab4'],
					availLeftHash: ['dfd41ab4'],
					availTopHash: ['dfd41ab4'],
					availWidthHash: ['dfd41ab4'],
					colorDepthHash: ['dfd41ab4'],
					pixelDepthHash: ['dfd41ab4']
				},
				// mode: Learn to block new trackers from your browsing
				privacybadger: {
					getImageDataHash: ['0cb0c682'],
					toDataURLHash: ['0cb0c682']
				},
				privacypossum: {
					hardwareConcurrencyHash: ['452924d5'],
					availWidthHash: ['452924d5'],
					colorDepthHash: ['452924d5']
				}
			};

			/*
			Random User-Agent
			User Agent Switcher and Manager
			ScriptSafe
			Windscribe
			*/
			
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
				pixelDepthHash: hashMini(prototypeLies['Screen.pixelDepth'])
			};
			
			data.extensionHashPattern = Object.keys(hash).reduce((acc, key) => {
				const val = hash[key];
				if (val == disabled) {
					return acc
				}
				acc[key.replace('Hash', '')] = val;
				return acc
			}, {});

			const getExtension = (pattern, hash) => {
				const {
					noscript,
					trace,
					cydec,
					canvasblocker,
					chameleon,
					duckduckgo,
					privacybadger,
					privacypossum
				} = pattern;
				if (prototypeLiesLen) {
					if (prototypeLiesLen >= 7 &&
						trace.contentDocumentHash.includes(hash.contentDocumentHash) &&
						trace.contentWindowHash.includes(hash.contentWindowHash) &&
						trace.createElementHash.includes(hash.createElementHash) &&
						trace.getElementByIdHash.includes(hash.getElementByIdHash) &&
						trace.toDataURLHash.includes(hash.toDataURLHash) &&
						trace.toBlobHash.includes(hash.toBlobHash) &&
						trace.getImageDataHash.includes(hash.getImageDataHash)) {
						return 'Trace'
					}
					if (prototypeLiesLen >= 7 &&
						cydec.contentDocumentHash.includes(hash.contentDocumentHash) &&
						cydec.contentWindowHash.includes(hash.contentWindowHash) &&
						cydec.createElementHash.includes(hash.createElementHash) &&
						cydec.getElementByIdHash.includes(hash.getElementByIdHash) &&
						cydec.toDataURLHash.includes(hash.toDataURLHash) &&
						cydec.toBlobHash.includes(hash.toBlobHash) &&
						cydec.getImageDataHash.includes(hash.getImageDataHash)) {
						return 'CyDec'
					}
					if (prototypeLiesLen >= 6 &&
						canvasblocker.contentDocumentHash.includes(hash.contentDocumentHash) &&
						canvasblocker.contentWindowHash.includes(hash.contentWindowHash)  &&
						canvasblocker.appendHash.includes(hash.appendHash) &&
						canvasblocker.toDataURLHash.includes(hash.toDataURLHash) &&
						canvasblocker.toBlobHash.includes(hash.toBlobHash) &&
						canvasblocker.getImageDataHash.includes(hash.getImageDataHash)) {
						return 'CanvasBlocker'
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
						return 'Chameleon'
					}
					if (prototypeLiesLen >= 16 &&
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
						return 'DuckDuckGo'
					}
					if (prototypeLiesLen >= 2 &&
						privacybadger.getImageDataHash.includes(hash.getImageDataHash) &&
						privacybadger.toDataURLHash.includes(hash.toDataURLHash)) {
						return 'Privacy Badger'
					}
					if (prototypeLiesLen >= 3 &&
						privacypossum.hardwareConcurrencyHash.includes(hash.hardwareConcurrencyHash) &&
						privacypossum.availWidthHash.includes(hash.availWidthHash) &&
						privacypossum.colorDepthHash.includes(hash.colorDepthHash)) {
						return 'Privacy Possum'
					}
					if (prototypeLiesLen >= 2 &&
						noscript.contentDocumentHash.includes(hash.contentDocumentHash) &&
						noscript.contentWindowHash.includes(hash.contentDocumentHash) &&
						noscript.getContextHash.includes(hash.getContextHash)) {
						return 'NoScript'
					}
					return
				}
				return
			};
			
			data.extension = getExtension(pattern, hash);

			logTestResult({ start, test: 'resistance', passed: true });
			return data
		}
		catch (error) {
			logTestResult({ test: 'resistance', passed: false });
			captureError(error);
			return
		}
	};

	const resistanceHTML = ({ fp, modal, note, hashMini, hashSlice }) => {
		if (!fp.resistance) {
			return `
		<div class="col-six undefined">
			<strong>Resistance</strong>
			<div>privacy: ${note.blocked}</div>
			<div>security: ${note.blocked}</div>
			<div>mode: ${note.blocked}</div>
			<div>extension: ${note.blocked}</div>
		</div>`
		}
		const {
			resistance: data
		} = fp;
		const {
			$hash,
			privacy,
			security,
			mode,
			extension,
			extensionHashPattern,
			engine
		} = data || {};
		
		const securitySettings = !security || Object.keys(security).reduce((acc, curr) => {
			if (security[curr]) {
				acc[curr] = 'enabled';
				return acc
			}
			acc[curr] = 'disabled';
			return acc
		}, {});

		const browserIcon = (
			/brave/i.test(privacy) ? '<span class="icon brave"></span>' :
				/tor/i.test(privacy) ? '<span class="icon tor"></span>' :
					/firefox/i.test(privacy) ? '<span class="icon firefox"></span>' :
						''
		);

		const extensionIcon = (
			/blink/i.test(engine) ? '<span class="icon chrome-extension"></span>' :
				/gecko/i.test(engine) ? '<span class="icon firefox-addon"></span>' :
					''
		);

		return `
	<div class="col-six">
		<strong>Resistance</strong><span class="hash">${hashSlice($hash)}</span>
		<div>privacy: ${privacy ? `${browserIcon}${privacy}` : note.unknown}</div>
		<div>security: ${
			!security ? note.unknown :
			modal(
				'creep-resistance',
				'<strong>Security</strong><br><br>'
				+Object.keys(securitySettings).map(key => `${key}: ${''+securitySettings[key]}`).join('<br>'),
				hashMini(security)
			)
		}</div>
		<div>mode: ${mode || note.unknown}</div>
		<div>extension: ${
			!Object.keys(extensionHashPattern || {}).length ? note.unknown :
			modal(
				'creep-extension',
				'<strong>Pattern</strong><br><br>'
				+Object.keys(extensionHashPattern).map(key => `${key}: ${''+extensionHashPattern[key]}`).join('<br>'),
				(extension ? `${extensionIcon}${extension}` : hashMini(extensionHashPattern))
			)
		}</div>
	</div>
	`
	};

	const getLocale = intl => {
		const constructors = [
			'Collator',
			'DateTimeFormat',
			'DisplayNames',
			'ListFormat',
			'NumberFormat',
			'PluralRules',
			'RelativeTimeFormat'
		];
		const locale = constructors.reduce((acc, name) => {
			try {
				const obj = new intl[name];
				if (!obj) {
					return acc
				}
				const { locale } = obj.resolvedOptions() || {};
				return [...acc, locale]
			}
			catch (error) {
				return acc
			}
		}, []);

		return [...new Set(locale)]
	};

	const getIntl = async imports => {

		const {
			require: {
				phantomDarkness,
				lieProps,
				caniuse,
				captureError,
				logTestResult
			}
		} = imports;

		try {
			const start = performance.now();
			let lied = (
				lieProps['Intl.Collator.resolvedOptions'] ||
				lieProps['Intl.DateTimeFormat.resolvedOptions'] ||
				lieProps['Intl.DisplayNames.resolvedOptions'] ||
				lieProps['Intl.ListFormat.resolvedOptions'] ||
				lieProps['Intl.NumberFormat.resolvedOptions'] ||
				lieProps['Intl.PluralRules.resolvedOptions'] ||
				lieProps['Intl.RelativeTimeFormat.resolvedOptions']
			) || false;

			const phantomIntl = phantomDarkness ? phantomDarkness.Intl : Intl;

			const dateTimeFormat = caniuse(() => {
				return new phantomIntl.DateTimeFormat(undefined, {
					month: 'long',
					timeZoneName: 'long'
				}).format(963644400000)
			});

			const displayNames = caniuse(() => {
				return new phantomIntl.DisplayNames(undefined, {
					type: 'language'
				}).of('en-US')
			});

			const listFormat = caniuse(() => {
				return new phantomIntl.ListFormat(undefined, {
					style: 'long',
					type: 'disjunction'
				}).format(['0', '1'])
			});
			
			const numberFormat = caniuse(() => {
				return new phantomIntl.NumberFormat(undefined, {
					notation: 'compact',
					compactDisplay: 'long'
				}).format(21000000)
			});

			const pluralRules = caniuse(() => {
				return new phantomIntl.PluralRules().select(1)
			});

			const relativeTimeFormat = caniuse(() => {
				return new phantomIntl.RelativeTimeFormat(undefined, {
					localeMatcher: 'best fit',
					numeric: 'auto',
					style: 'long'
				}).format(1, 'year')
			});

			const locale = getLocale(phantomIntl);

			logTestResult({ start, test: 'intl', passed: true });
			return {
				dateTimeFormat,
				displayNames,
				listFormat,
				numberFormat,
				pluralRules,
				relativeTimeFormat,
				locale: ''+locale,
				lied
			}
		}
		catch (error) {
			logTestResult({ test: 'intl', passed: false });
			captureError(error);
			return
		}
	};

	const intlHTML = ({ fp, modal, note, hashSlice, count }) => {
		if (!fp.htmlElementVersion) {
			return `
		<div class="col-four undefined">
			<strong>Intl</strong>
			<div>locale: ${note.blocked}</div>
			<div>date: ${note.blocked}</div>
			<div>display: ${note.blocked}</div>
			<div>list: ${note.blocked}</div>
			<div>number: ${note.blocked}</div>
			<div>plural: ${note.blocked}</div>
			<div>relative: ${note.blocked}</div>
		</div>`
		}
		const {
			intl: {
				$hash,
				dateTimeFormat,
				displayNames,
				listFormat,
				numberFormat,
				pluralRules,
				relativeTimeFormat,
				locale,
				lied
			}
		} = fp;

		return `
	<div class="col-four${lied ? ' rejected' : ''}">
		<strong>Intl</strong><span class="hash">${hashSlice($hash)}</span>
		<div class="block-text help"  title="Intl.Collator\nIntl.DateTimeFormat\nIntl.DisplayNames\nIntl.ListFormat\nIntl.NumberFormat\nIntl.PluralRules\nIntl.RelativeTimeFormat">
			${locale ? locale : ''}
			${dateTimeFormat ? `<br>${dateTimeFormat}` : ''}
			${displayNames ? `<br>${displayNames}` : ''}
			${numberFormat ? `<br>${numberFormat}` : ''}
			${relativeTimeFormat ? `<br>${relativeTimeFormat}` : ''}
			${listFormat ? `<br>${listFormat}` : ''}
			${pluralRules ? `<br>${pluralRules}` : ''}
		</div>
	</div>
	`
	};

	const featuresHTML = ({ fp, modal, note, hashMini }) => {
		if (!fp.css || !fp.windowFeatures) {
			return `
		<div class="col-four">
			<div>Features: ${note.unknown}</div>
		</div>
		<div class="col-four">
			<div>CSS: ${note.unknown}</div>
		</div>
		<div class="col-four">
			<div>Window: ${note.unknown}</div>
		</div>`
		}

		const {
			css: {
				computedStyle: {
					keys: computedStyleKeys
				}
			},
			windowFeatures: {
				keys: windowFeaturesKeys
			}
		} = fp || {};

		/*
		console.groupCollapsed('win')
		console.log(windowFeaturesKeys.sort().join('\n'))
		console.groupEnd()
		console.groupCollapsed('css')
		console.log(computedStyleKeys.sort().join('\n'))
		console.groupEnd()
		*/

		const isNative = (win, x) => (
			/\[native code\]/.test(win[x]+'') &&
			'prototype' in win[x] && 
			win[x].prototype.constructor.name === x
		);

		const geckoCSS = {
			'71': ['-moz-column-span'],
			'72': ['offset', 'offset-anchor', 'offset-distance', 'offset-path', 'offset-rotate', 'rotate', 'scale', 'translate'],
			'73': ['overscroll-behavior-block', 'overscroll-behavior-inline'],
			'74-79': ['!-moz-stack-sizing', 'text-underline-position'],
			'80-88': ['appearance'],
			'89-90': ['!-moz-outline-radius', '!-moz-outline-radius-bottomleft', '!-moz-outline-radius-bottomright', '!-moz-outline-radius-topleft', '!-moz-outline-radius-topright', 'aspect-ratio'],
			'91': ['tab-size'],
			'92': ['accent-color', 'align-tracks', 'd', 'justify-tracks', 'masonry-auto-flow', 'math-style']
		};

		const blinkCSS = {
			'81': ['color-scheme', 'image-orientation'],
			'83': ['contain-intrinsic-size'],
			'84': ['appearance', 'ruby-position'],
			'85-86': ['content-visibility', 'counter-set', 'inherits', 'initial-value', 'page-orientation', 'syntax'],
			'87': ['ascent-override', 'border-block', 'border-block-color', 'border-block-style', 'border-block-width', 'border-inline', 'border-inline-color', 'border-inline-style', 'border-inline-width', 'descent-override', 'inset', 'inset-block', 'inset-block-end', 'inset-block-start', 'inset-inline', 'inset-inline-end', 'inset-inline-start', 'line-gap-override', 'margin-block', 'margin-inline', 'padding-block', 'padding-inline', 'text-decoration-thickness', 'text-underline-offset'],
			'88': ['aspect-ratio'],
			'89': ['border-end-end-radius', 'border-end-start-radius', 'border-start-end-radius', 'border-start-start-radius', 'forced-color-adjust'],
			'90': ['overflow-clip-margin'],
			'91': ['additive-symbols', 'fallback', 'negative', 'pad', 'prefix', 'range', 'speak-as', 'suffix', 'symbols', 'system'],
			'92': ['size-adjust']
		};

		const geckoWindow = {
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
			'89-91': ['!ondevicelight', '!ondeviceproximity', '!onuserproximity'],
			'92': ['DeprecationReportBody', 'ElementInternals', 'FeaturePolicyViolationReportBody', 'GamepadAxisMoveEvent', 'GamepadButtonEvent', 'HTMLDialogElement', 'Report', 'ReportBody', 'ReportingObserver', '!content', '!sidebar']
		};

		const blinkWindow = {
			'80': ['CompressionStream', 'DecompressionStream', 'FeaturePolicy', 'FragmentDirective', 'PeriodicSyncManager', 'VideoPlaybackQuality'],
			'81': ['SubmitEvent', 'XRHitTestResult', 'XRHitTestSource', 'XRRay', 'XRTransientInputHitTestResult', 'XRTransientInputHitTestSource'],
			'83': ['BarcodeDetector', 'XRDOMOverlayState', 'XRSystem'],
			'84': ['AnimationPlaybackEvent', 'AnimationTimeline', 'CSSAnimation', 'CSSTransition', 'DocumentTimeline', 'FinalizationRegistry',  'LayoutShiftAttribution', 'ResizeObserverSize', 'WakeLock', 'WakeLockSentinel', 'WeakRef', 'XRLayer'],
			'85': ['AggregateError', 'CSSPropertyRule', 'EventCounts', 'XRAnchor', 'XRAnchorSet'],
			'86': ['RTCEncodedAudioFrame', 'RTCEncodedVideoFrame'],
			'87': ['CookieChangeEvent', 'CookieStore', 'CookieStoreManager', 'Scheduling'],
			'88': ['Scheduling', '!BarcodeDetector'],
			'89': ['ReadableByteStreamController', 'ReadableStreamBYOBReader', 'ReadableStreamBYOBRequest', 'ReadableStreamDefaultController', 'XRWebGLBinding'],
			'90': ['AbstractRange', 'CustomStateSet', 'NavigatorUAData', 'XRCPUDepthInformation', 'XRDepthInformation', 'XRLightEstimate', 'XRLightProbe', 'XRWebGLDepthInformation'],
			'91': ['CSSCounterStyleRule',  'GravitySensor',  'NavigatorManagedData'],
			'92': ['CSSCounterStyleRule','!SharedArrayBuffer'],
		};

		const mathPI = 3.141592653589793;
		const blink = (mathPI ** -100) == 1.9275814160560204e-50;
		const gecko = (mathPI ** -100) == 1.9275814160560185e-50;
		const browser = (
			blink ? 'Chrome' : gecko ? 'Firefox' : ''
		);

		const versionSort = x => x.sort((a, b) => /\d+/.exec(a)[0] - /\d+/.exec(b)[0]).reverse();
		const getFeatures = ({allKeys, engineMap, checkNative = false} = {}) => {
			const allKeysSet = new Set(allKeys);
			const features = new Set();
			const match = Object.keys(engineMap || {}).reduce((acc, key, i) => {
				const version = engineMap[key];
				const versionLen = version.length;
				const featureLen = version.filter(prop => {
					const removedFromVersion = prop.charAt(0) == '!';
					if (removedFromVersion) {
						const propName = prop.slice(1);
						return !allKeysSet.has(propName) && features.add(prop)	
					}
					return (
						allKeysSet.has(prop) &&
						(checkNative ? isNative(window, prop) : true) &&
						features.add(prop)
					)
				}).length;
				return versionLen == featureLen ? [...acc, key] : acc 
			}, []);
			const version = versionSort(match)[0];
			return {
				version,
				features
			}
		};	

		// modal
		const getModal = (id, engineMap, features) => {
			return modal(`creep-${id}`, versionSort(Object.keys(engineMap)).map(key => {
				return `
				<strong>${key}</strong>:<br>${
					engineMap[key].map(prop => {
						return `<span class="${!features.has(prop) ? 'unsupport' : ''}">${prop}</span>`
					}).join('<br>')
				}
			`
			}).join('<br>'), hashMini([...features]))
		};

		// css version
		const engineMapCSS = blink ? blinkCSS : gecko ? geckoCSS : {};
		const {
			version: cssVersion,
			features: cssFeatures
		} = getFeatures({allKeys: computedStyleKeys, engineMap: engineMapCSS});
		const cssModal = getModal('features-css', engineMapCSS, cssFeatures);
		
		// window version
		const engineMapWindow = blink ? blinkWindow : gecko ? geckoWindow : {};
		const {
			version: windowVersion,
			features: windowFeatures
		} = getFeatures({allKeys: windowFeaturesKeys, engineMap: engineMapWindow, checkNative: true});
		const windowModal = getModal('features-window', engineMapWindow, windowFeatures);

		// determine version based on 2 factors
		const versionSet = new Set([
			cssVersion,
			windowVersion
		]);
		versionSet.delete(undefined);
		
		const versionRange = versionSort(
			[...versionSet].reduce((acc, x) => [...acc, ...x.split('-')], [])
		);
		const getVersionFromRange = range => {
			const len = range.length;
			const first = range[0];
			const last = range[len-1];
			return (
				!len ? '' : 
					len == 1 ? first :
						`${last}-${first}`
			)
		};
		const getIcon = name => `<span class="icon ${name}"></span>`;
		const browserIcon = (
			!browser ? '' :
				/chrome/i.test(browser) ? getIcon('chrome') :
					/firefox/i.test(browser) ? getIcon('firefox') :
						''
		);
		return `
	<style>
		.unsupport {
			background: #f1f1f1;
			color: #aaa;
		}
		@media (prefers-color-scheme: dark) {
			.unsupport {
				color: var(--light-grey);
				background: none;
			}
		}
	</style>
	<div class="col-four">
		<div>Features: ${
			versionRange.length ? `${browserIcon}${getVersionFromRange(versionRange)}+` : 
				note.unknown
		}</div>
	</div>
	<div class="col-four">
		<div>CSS: ${cssVersion ? `${cssModal} (v${cssVersion})` : note.unknown}</div>
	</div>
	<div class="col-four">
		<div>Window: ${windowVersion ? `${windowModal} (v${windowVersion})` : note.unknown}</div>
	</div>
	`
	};

	const imports = {
		require: {
			// helpers
			isChrome,
			braveBrowser,
			getBraveMode,
			isFirefox,
			getOS,
			decryptUserAgent,
			getUserAgentPlatform,
			logTestResult,
			getPromiseRaceFulfilled,
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
			getMismatchStyle,
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
			// filter out lies on Function.prototype.toString (this is a false positive on native APIs void of tampering)
			lieProps: (() => {
				const props = lieProps.getProps();
				return Object.keys(props).reduce((acc, key) => {
					acc[key] = getNonFunctionToStringLies(props[key]);
					return acc
				}, {})
			})(),
			prototypeLies,
			// collections
			errorsCaptured,
			trashBin,
			lieRecords,
			phantomDarkness,
			parentPhantom,
			dragonFire,
			dragonOfDeath,
			parentDragon,
			getPluginLies,
			getKnownAudio
		}
	}
	// worker.js

	;(async imports => {
		'use strict';

		const {
			require: {
				instanceId,
				hashMini,
				patch,
				html,
				note,
				count,
				modal,
				caniuse,
				isFirefox
			}
		} = imports;
		
		const fingerprint = async () => {
			const timeStart = timer();
			
			const [
				windowFeaturesComputed,
				htmlElementVersionComputed,
				cssComputed,
				cssMediaComputed,
				screenComputed,
				voicesComputed,
				canvas2dComputed,
				canvasWebglComputed,
				mathsComputed,
				consoleErrorsComputed,
				timezoneComputed,
				clientRectsComputed,
				offlineAudioContextComputed,
				fontsComputed,
				workerScopeComputed,
				mediaComputed,
				webRTCDataComputed,
				svgComputed,
				resistanceComputed,
				intlComputed
			] = await Promise.all([
				getWindowFeatures(imports),
				getHTMLElementVersion(imports),
				getCSS(imports),
				getCSSMedia(imports),
				getScreen(imports),
				getVoices(imports),
				getCanvas2d(imports),
				getCanvasWebgl(imports),
				getMaths(imports),
				getConsoleErrors(imports),
				getTimezone(imports),
				getClientRects(imports),
				getOfflineAudioContext(imports),
				getFonts(imports),
				getBestWorkerScope(imports),
				getMedia(imports),
				getWebRTCData(imports),
				getSVG(imports),
				getResistance(imports),
				getIntl(imports)
			]).catch(error => console.error(error.message));
			
			const [
				navigatorComputed,
				headlessComputed
			] = await Promise.all([
				getNavigator(imports, workerScopeComputed),
				getHeadlessFeatures(imports, workerScopeComputed)
			]).catch(error => console.error(error.message));
			
			const [
				liesComputed,
				trashComputed,
				capturedErrorsComputed
			] = await Promise.all([
				getLies(imports),
				getTrash(imports),
				getCapturedErrors(imports)
			]).catch(error => console.error(error.message));
			
			//const start = performance.now()
			const [
				windowHash,
				headlessHash,
				htmlHash,
				cssMediaHash,
				cssHash,
				styleHash,
				systemHash,
				screenHash,
				voicesHash,
				canvas2dHash,
				canvasWebglHash,
				pixelsHash,
				pixels2Hash,
				mathsHash,
				consoleErrorsHash,
				timezoneHash,
				rectsHash,
				emojiHash,
				audioHash,
				fontsHash,
				workerHash,
				mediaHash,
				webRTCHash,
				navigatorHash,
				liesHash,
				trashHash,
				errorsHash,
				svgHash,
				resistanceHash,
				intlHash
			] = await Promise.all([
				hashify(windowFeaturesComputed),
				hashify(headlessComputed),
				hashify(htmlElementVersionComputed.keys),
				hashify(cssMediaComputed),
				hashify(cssComputed),
				hashify(cssComputed.computedStyle),
				hashify(cssComputed.system),
				hashify(screenComputed),
				hashify(voicesComputed),
				hashify(canvas2dComputed),
				hashify(canvasWebglComputed),
				caniuse(() => canvasWebglComputed.pixels.length) ? hashify(canvasWebglComputed.pixels) : undefined,
				caniuse(() => canvasWebglComputed.pixels2.length) ? hashify(canvasWebglComputed.pixels2) : undefined,
				hashify(mathsComputed.data),
				hashify(consoleErrorsComputed.errors),
				hashify(timezoneComputed),
				hashify(clientRectsComputed),
				hashify(clientRectsComputed.emojiSet),
				hashify(offlineAudioContextComputed),
				hashify(fontsComputed),
				hashify(workerScopeComputed),
				hashify(mediaComputed),
				hashify(webRTCDataComputed),
				hashify(navigatorComputed),
				hashify(liesComputed),
				hashify(trashComputed),
				hashify(capturedErrorsComputed),
				hashify(svgComputed),
				hashify(resistanceComputed),
				hashify(intlComputed)
			]).catch(error => console.error(error.message));
			
			//console.log(performance.now()-start)
			
			const timeEnd = timeStart();

			if (parentPhantom) {
				parentPhantom.parentNode.removeChild(parentPhantom);
			}
			if (parentDragon) {
				parentDragon.parentNode.removeChild(parentDragon);
			}
			
			const fingerprint = {
				workerScope: !workerScopeComputed ? undefined : { ...workerScopeComputed, $hash: workerHash},
				webRTC: !webRTCDataComputed ? undefined : {...webRTCDataComputed, $hash: webRTCHash},
				navigator: !navigatorComputed ? undefined : {...navigatorComputed, $hash: navigatorHash},
				windowFeatures: !windowFeaturesComputed ? undefined : {...windowFeaturesComputed, $hash: windowHash},
				headless: !headlessComputed ? undefined : {...headlessComputed, $hash: headlessHash},
				htmlElementVersion: !htmlElementVersionComputed ? undefined : {...htmlElementVersionComputed, $hash: htmlHash},
				cssMedia: !cssMediaComputed ? undefined : {...cssMediaComputed, $hash: cssMediaHash},
				css: !cssComputed ? undefined : {...cssComputed, $hash: cssHash},
				screen: !screenComputed ? undefined : {...screenComputed, $hash: screenHash},
				voices: !voicesComputed ? undefined : {...voicesComputed, $hash: voicesHash},
				media: !mediaComputed ? undefined : {...mediaComputed, $hash: mediaHash},
				canvas2d: !canvas2dComputed ? undefined : {...canvas2dComputed, $hash: canvas2dHash},
				canvasWebgl: !canvasWebglComputed ? undefined : {...canvasWebglComputed, pixels: pixelsHash, pixels2: pixels2Hash, $hash: canvasWebglHash},
				maths: !mathsComputed ? undefined : {...mathsComputed, $hash: mathsHash},
				consoleErrors: !consoleErrorsComputed ? undefined : {...consoleErrorsComputed, $hash: consoleErrorsHash},
				timezone: !timezoneComputed ? undefined : {...timezoneComputed, $hash: timezoneHash},
				clientRects: !clientRectsComputed ? undefined : {...clientRectsComputed, $hash: rectsHash},
				offlineAudioContext: !offlineAudioContextComputed ? undefined : {...offlineAudioContextComputed, $hash: audioHash},
				fonts: !fontsComputed ? undefined : {...fontsComputed, $hash: fontsHash},
				lies: !liesComputed ? undefined : {...liesComputed, $hash: liesHash},
				trash: !trashComputed ? undefined : {...trashComputed, $hash: trashHash},
				capturedErrors: !capturedErrorsComputed ? undefined : {...capturedErrorsComputed, $hash: errorsHash},
				svg: !svgComputed ? undefined : {...svgComputed, $hash: svgHash },
				resistance: !resistanceComputed ? undefined : {...resistanceComputed, $hash: resistanceHash},
				intl: !intlComputed ? undefined : {...intlComputed, $hash: intlHash}
			};
			return { fingerprint, systemHash, styleHash, emojiHash, timeEnd }
		};
		
		// fingerprint and render
		const { fingerprint: fp, systemHash, styleHash, emojiHash, timeEnd } = await fingerprint().catch(error => console.error(error));
		
		console.log('%c✔ loose fingerprint passed', 'color:#4cca9f');

		console.groupCollapsed('Loose Fingerprint');
		console.log(fp);
		console.groupEnd();

		console.groupCollapsed('Loose Fingerprint JSON');
		console.log('diff check at https://www.diffchecker.com/diff\n\n', JSON.stringify(fp, null, '\t'));
		console.groupEnd();
		
		// Trusted Fingerprint
		const isBrave = await braveBrowser();
		const braveMode = getBraveMode();
		const braveFingerprintingBlocking = isBrave && (braveMode.standard || braveMode.strict);
		const getBraveUnprotectedParameters = parameters => {
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
				'VERTEX_SHADER.MEDIUM_FLOAT.rangeMin'
			]);
			const safeParameters = Object.keys(parameters).reduce((acc, curr) => {
				if (blocked.has(curr)) {
					return acc
				}
				acc[curr] = parameters[curr];
				return acc
			}, {});
			return safeParameters
		};
		const trashLen = fp.trash.trashBin.length;
		const liesLen = !('totalLies' in fp.lies) ? 0 : fp.lies.totalLies;
		const errorsLen = fp.capturedErrors.data.length;

		// limit to known audio
		const { offlineAudioContext } = fp || {};
		const { compressorGainReduction, sampleSum } = offlineAudioContext || {};
		const knownSums = getKnownAudio()[compressorGainReduction];
		const unknownAudio = (
			sampleSum && compressorGainReduction && knownSums && !knownSums.includes(sampleSum)
		);
		const unknownFirefoxAudio = isFirefox && unknownAudio;

		const hardenEntropy = (workerScope, prop) => {
			return (
				!workerScope ? prop : 
					(workerScope.localeEntropyIsTrusty && workerScope.localeIntlEntropyIsTrusty) ? prop : 
						undefined
			)
		};

		const privacyResistFingerprinting = (
			fp.resistance && /^(tor browser|firefox)$/i.test(fp.resistance.privacy)
		);

		const creep = {
			navigator: ( 
				!fp.navigator || fp.navigator.lied ? undefined : {
					bluetoothAvailability: fp.navigator.device,
					device: fp.navigator.device,
					deviceMemory: fp.navigator.deviceMemory,
					hardwareConcurrency: fp.navigator.hardwareConcurrency,
					keyboard: fp.navigator.keyboard,
					// distrust language if worker locale is not trusty
					language: hardenEntropy(fp.workerScope, fp.navigator.language),
					maxTouchPoints: fp.navigator.maxTouchPoints,
					mediaCapabilities: fp.navigator.mediaCapabilities,
					mimeTypes: fp.navigator.mimeTypes,
					oscpu: fp.navigator.oscpu,
					platform: fp.navigator.platform,
					plugins: fp.navigator.plugins,
					system: fp.navigator.system,
					userAgentData: {
						...(fp.navigator.userAgentData || {}),
						// loose
						brandsVersion: undefined, 
						uaFullVersion: undefined
					},
					vendor: fp.navigator.vendor
				}
			),
			screen: ( 
				!fp.screen || fp.screen.lied || privacyResistFingerprinting ? undefined : 
					hardenEntropy(
						fp.workerScope, {
							height: fp.screen.height,
							width: fp.screen.width,
							pixelDepth: fp.screen.pixelDepth,
							colorDepth: fp.screen.colorDepth,
							lied: fp.screen.lied
						}
					)
			),
			workerScope: !fp.workerScope || fp.workerScope.lied ? undefined : {
				canvas2d: (
					(fp.canvas2d && fp.canvas2d.lied) ? undefined : // distrust ungoogled-chromium, brave, firefox, tor browser 
					fp.workerScope.canvas2d
				),
				textMetrics: fp.workerScope.textMetrics,
				deviceMemory: (
					braveFingerprintingBlocking ? undefined : fp.workerScope.deviceMemory
				),
				hardwareConcurrency: (
					braveFingerprintingBlocking ? undefined : fp.workerScope.hardwareConcurrency
				),
				// system locale in blink
				language: fp.workerScope.language,
				languages: fp.workerScope.languages, 
				platform: fp.workerScope.platform,
				system: fp.workerScope.system,
				device: fp.workerScope.device,
				timezoneLocation: hardenEntropy(fp.workerScope, fp.workerScope.timezoneLocation),
				['webgl renderer']: (
					braveFingerprintingBlocking ? undefined : fp.workerScope.webglRenderer
				),
				['webgl vendor']: (
					braveFingerprintingBlocking ? undefined : fp.workerScope.webglVendor
				),
				fontFaceSetFonts: fp.workerScope.fontFaceSetFonts,
				userAgentData: {
					...fp.workerScope.userAgentData,
					// loose
					brandsVersion: undefined, 
					uaFullVersion: undefined
				},
				mediaCapabilities: fp.workerScope.mediaCapabilities,
			},
			media: fp.media,
			canvas2d: ( 
				!fp.canvas2d || fp.canvas2d.lied ? undefined : {
					dataURI: fp.canvas2d.dataURI,
					blob: fp.canvas2d.blob,
					blobOffscreen: fp.canvas2d.blobOffscreen,
					imageData: fp.canvas2d.imageData,
					textMetrics: fp.canvas2d.textMetrics,
					lied: fp.canvas2d.lied
				} 
			),
			canvasWebgl: !fp.canvasWebgl ? undefined : (
				braveFingerprintingBlocking ? {
					parameters: getBraveUnprotectedParameters(fp.canvasWebgl.parameters)
				} : fp.canvasWebgl.lied ? undefined : fp.canvasWebgl
			),
			cssMedia: !fp.cssMedia ? undefined : {
				reducedMotion: caniuse(() => fp.cssMedia.mediaCSS['prefers-reduced-motion']),
				colorScheme: (
					braveFingerprintingBlocking ? undefined :
					caniuse(() => fp.cssMedia.mediaCSS['prefers-color-scheme'])
				),
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
				system: caniuse(() => fp.css.system)
			},
			maths: !fp.maths || fp.maths.lied ? undefined : fp.maths,
			consoleErrors: fp.consoleErrors,
			timezone: !fp.timezone || fp.timezone.lied ? undefined : {
				locationMeasured: hardenEntropy(fp.workerScope, fp.timezone.locationMeasured),
				lied: fp.timezone.lied
			},
			svg: !fp.svg || fp.svg.lied ? undefined : fp.svg,
			clientRects: !fp.clientRects || fp.clientRects.lied ? undefined : fp.clientRects,
			offlineAudioContext: !fp.offlineAudioContext ? undefined : (
				braveFingerprintingBlocking ? {
					values: fp.offlineAudioContext.values,
					compressorGainReduction: fp.offlineAudioContext.compressorGainReduction
				} : 
					fp.offlineAudioContext.lied || unknownFirefoxAudio ? undefined : 
						fp.offlineAudioContext
			),
			fonts: !fp.fonts || fp.fonts.lied ? undefined : fp.fonts,
			// skip trash since it is random
			lies: !!liesLen,
			capturedErrors: !!errorsLen
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

		// expose results to the window
		window.Fingerprint = JSON.parse(JSON.stringify(fp));
		window.Creep = JSON.parse(JSON.stringify(creep));

		// session
		const computeSession = fp => {
			const data = {
				revisedKeys: [],
				initial: undefined,
				loads: undefined
			};
			try {
				const currentFingerprint = Object.keys(fp)
				.reduce((acc, key) => {
					if (!fp[key]) {
						return acc
					}
					acc[key] = fp[key].$hash;
					return acc
				}, {});
				const initialFingerprint = JSON.parse(sessionStorage.getItem('initialFingerprint'));
				if (initialFingerprint) {
					data.initial = hashMini(initialFingerprint);
					data.loads = 1+(+sessionStorage.getItem('loads'));
					sessionStorage.setItem('loads', data.loads);
					const revisedKeys = Object.keys(currentFingerprint)
						.filter(key => currentFingerprint[key] != initialFingerprint[key]);
					if (revisedKeys.length) {
						data.revisedKeys = revisedKeys;
					}
				}
				else {
					sessionStorage.setItem('initialFingerprint', JSON.stringify(currentFingerprint));
					sessionStorage.setItem('loads', 1);
					data.initial = hashMini(currentFingerprint);
					data.loads = 1;
				}
				return data
			}
			catch (error) {
				console.error(error);
				return data
			}
		};
		
		// patch dom
		const hashSlice = x => x.slice(0, 8);
		const templateImports = {
			fp,
			hashSlice,
			hashMini,
			note,
			modal,
			count,
			getMismatchStyle
		};
		const hasTrash = !!trashLen;
		const { lies: hasLied, capturedErrors: hasErrors } = creep;

		const el = document.getElementById('fingerprint-data');
		patch(el, html`
	<div id="fingerprint-data">
		<div class="fingerprint-header-container">
			<div class="fingerprint-header">
				<strong>Your ID:</strong><span class="trusted-fingerprint ellipsis main-hash">${hashSlice(creepHash)}</span>
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
			<div class="flex-grid">
				<div class="col-four">
					<strong>Session ID</strong>
					<div>0</div>
				</div>
				<div class="col-four">
					<strong>Session Loads</strong>
					<div>0</div>
				</div>
				<div class="col-four">
					<strong>Session Switched</strong>
					<div>none</div>
				</div>
			</div>
		</div>
		<div class="flex-grid">
			${trashHTML(templateImports)}
			${liesHTML(templateImports)}
			${errorsHTML(templateImports)}
		</div>
		<div class="flex-grid">
			${webrtcHTML(templateImports)}
			${timezoneHTML(templateImports)}
			${intlHTML(templateImports)}			
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
				<div>emojis:</div>
				<div>audio:</div>
			</div>
			<div class="col-four icon-container">
			</div>
		</div>
		<div id="headless-resistance-detection-results" class="flex-grid">
			${headlesFeaturesHTML(templateImports)}
			${resistanceHTML(templateImports)}
		</div>
		<div class="flex-grid relative">${workerScopeHTML(templateImports)}</div>
		<div class="flex-grid">${webglHTML(templateImports)}</div>
		<div class="flex-grid">
			${canvasHTML(templateImports)}
			${fontsHTML(templateImports)}
		</div>
		<div class="flex-grid">
			${audioHTML(templateImports)}
			${voicesHTML(templateImports)}
			${mediaHTML(templateImports)}
		</div>
		<div class="flex-grid">
			${clientRectsHTML(templateImports)}
			${svgHTML(templateImports)}
		</div>
		<div class="flex-grid">${screenHTML(templateImports)}</div>
		<div class="flex-grid">${featuresHTML(templateImports)}</div>
		<div class="flex-grid">
			${cssMediaHTML(templateImports)}
			${cssHTML(templateImports, systemHash)}
		</div>
		<div>
			<div class="flex-grid">
				${mathsHTML(templateImports)}
				${consoleErrorsHTML(templateImports)}
			</div>
			<div class="flex-grid">
				${windowFeaturesHTML(templateImports)}
				${htmlElementVersionHTML(templateImports)}
			</div>
		</div>
		<div class="flex-grid">${navigatorHTML(templateImports)}</div>
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

				console.groupCollapsed('Server Response');
				console.log(JSON.stringify(data, null, '\t'));
				fetchVisitorDataTimer('response time');
				console.groupEnd();
			
				const { firstVisit, lastVisit: latestVisit, looseFingerprints: subIds, visits,looseSwitchCount: switchCount,  hasTrash, hasLied, hasErrors, signature } = data;
				
				const toLocaleStr = str => {
					const date = new Date(str);
					const dateString = date.toLocaleDateString();
					const timeString = date.toLocaleTimeString();
					return `${dateString}, ${timeString}`
				};
				const hoursAgo = (date1, date2) => Math.abs(date1 - date2) / 36e5;
				const hours = hoursAgo(new Date(firstVisit), new Date(latestVisit)).toFixed(1);

				const computeTrustScore = ({ switchCount, errorsLen, trashLen, liesLen }) => {
					const score = {
						errorsRisk: 5.2,
						trashRisk: 15.5,
						liesRisk: 31,
						reward: 20,
						get switchCountPointLoss() {
							return -Math.round(
								switchCount < 2 ? -score.reward :
								switchCount < 11 ? switchCount * 0.1 :
								switchCount * 0.2
							)
						},
						get errorsPointLoss() {
							return -Math.round(errorsLen * score.errorsRisk)
						},
						get trashPointLoss() {
							return -Math.round(trashLen * score.trashRisk)
						},
						get liesPointLoss() {
							return -Math.round(liesLen * score.liesRisk)
						},
						get total() {
							const points = Math.round(
								100 +
								score.switchCountPointLoss +
								score.errorsPointLoss +
								score.trashPointLoss + 
								score.liesPointLoss
							);
							return points < 0 ? 0 : points > 100 ? 100 : points
						},
						get grade() {
							const total = score.total;
							return (
								total > 95 ? 'A+' :
								total == 95 ? 'A' :
								total >= 90 ? 'A-' :
								total > 85 ? 'B+' :
								total == 85 ? 'B' :
								total >= 80 ? 'B-' :
								total > 75 ? 'C+' :
								total == 75 ? 'C' :
								total >= 70 ? 'C-' :
								total > 65 ? 'D+' :
								total == 65 ? 'D' :
								total >= 60 ? 'D-' :
								total > 55 ? 'F+' :
								total == 55 ? 'F' :
								'F-'
							)
						}
					};
					return score
				};

				const {
					switchCountPointLoss,
					errorsPointLoss,
					trashPointLoss,
					liesPointLoss,
					grade,
					total: scoreTotal
				} = computeTrustScore({
					switchCount,
					errorsLen,
					trashLen,
					liesLen
				});
				const percentify = x => {
					return `<span class="scale-up grade-${x < 0 ? 'F' : x > 0 ? 'A' : ''}">${
					x > 0 ? `+${x}% reward` : x < 0 ? `${x}%` : ''
				}</span>`
				};

				const renewedDate = '2021-8-1';
				const addDays = (date, n) => {
					const d = new Date(date);
					d.setDate(d.getDate() + n);
					return d
				};
				const shouldStyle = d => {
					const endNoticeDate = addDays(renewedDate, 7);
					const daysRemaining = Math.round((+endNoticeDate - +new Date()) / (1000 * 3600 * 24));
					return daysRemaining >= 0
				};
				
				const template = `
				<div class="visitor-info">
					<div class="ellipsis">
						<span class="aside-note">fingerprints renewed <span class="${shouldStyle(renewedDate) ? 'renewed' : ''}">${
							new Date(renewedDate).toLocaleDateString()
						}</span></span>
					</div>
					<div class="flex-grid">
						<div class="col-six">
							<strong>Browser</strong>
							<div>trust score: <span class="unblurred">
								${scoreTotal}% <span class="scale-down grade-${grade.charAt(0)}">${grade}</span>
							</span></div>
							<div>visits: <span class="unblurred">${visits}</span></div>
							<div class="ellipsis">first: <span class="unblurred">${toLocaleStr(firstVisit)}</span></div>
							<div class="ellipsis">last: <span class="unblurred">${toLocaleStr(latestVisit)}</span></div>
							<div>persistence: <span class="unblurred">${hours} hours</span></div>
						</div>
						<div class="col-six">
							<div>has trash: <span class="unblurred">${
								(''+hasTrash) == 'true' ?
								`true ${percentify(trashPointLoss)}` : 
								'false'
							}</span></div>
							<div>has lied: <span class="unblurred">${
								(''+hasLied) == 'true' ? 
								`true ${percentify(liesPointLoss)}` : 
								'false'
							}</span></div>
							<div>has errors: <span class="unblurred">${
								(''+hasErrors) == 'true' ? 
								`true ${percentify(errorsPointLoss)}` : 
								'false'
							}</span></div>
							<div class="ellipsis">loose fingerprint: <span class="unblurred">${hashSlice(fpHash)}</span></div>
							<div class="ellipsis">loose switched: <span class="unblurred">${switchCount}x ${percentify(switchCountPointLoss)}</span></div>
							<div class="ellipsis">bot: <span class="unblurred">${
								caniuse(() => fp.headless.headlessRating) ? 'true (headless)' :
								caniuse(() => fp.headless.stealthRating) ? 'true (stealth)' :
								switchCount > 9 && hours < 48 ? 'true (10 loose in 48 hours)' : 'false'
							}</span></div>
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
					${
						(() => {
							const { initial, loads, revisedKeys } = computeSession(fp);
							
							return `
								<div class="flex-grid">
									<div class="col-four">
										<strong>Session ID</strong>
										<div><span class="sub-hash">${initial}</span></div>
									</div>
									<div class="col-four">
										<strong>Session Loads</strong>
										<div>${loads}</div>
									</div>
									<div class="col-four">
										<strong>Session Switched</strong>
										<div>${
											!revisedKeys.length ? 'none' :
											modal(
												`creep-revisions`,
												revisedKeys.join('<br>'),
												hashMini(revisedKeys)
											)
										}</div>
									</div>
								</div>
							`	
						})()
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

				const {
					maths,
					consoleErrors,
					htmlElementVersion,
					windowFeatures,
					css,
					clientRects,
					offlineAudioContext,
					resistance,
					navigator
				} = fp || {};
				const {
					computedStyle,
					system
				} = css || {};
				const { userAgentParsed: report } = navigator || {};

				const el = document.getElementById('browser-detection');
				const rejectSamplePatch = (el, html) => patch(el, html`
				<div class="flex-grid rejected">
					<div class="col-eight">
						<strong>Sample Rejected</strong>
						<div>client user agent:</div>
						<div>window object:</div>
						<div>system styles:</div>
						<div>computed styles:</div>
						<div>html element:</div>
						<div>js runtime (math):</div>
						<div>js engine (error):</div>
						<div class="ellipsis">emojis:</div>
						<div class="ellipsis">audio:</div>
					</div>
					<div class="col-four icon-container">
					</div>
				</div>
			`);
				 
				if (
					!fp.workerScope ||
					fp.workerScope.lied ||
					!fp.workerScope.userAgent
					//|| ('BroadcastChannel' in window && fp.workerScope.type == 'dedicated')
				) {
					return rejectSamplePatch(el, html)
				}

				const sender = {
					e: 3.141592653589793 ** -100,
					l: +new Date(new Date(`7/1/1113`))
				};
				
				const isTorBrowser = resistance.privacy == 'Tor Browser';
				//console.log(emojiHash) // Tor Browser check
				const {
					compressorGainReduction: gain,
					sampleSum,
					floatFrequencyDataSum: freqSum,
					floatTimeDomainDataSum: timeSum,
					values: audioValues
				} = offlineAudioContext || {};
				const valuesHash = hashMini(audioValues);
				const decryptRequest = `https://creepjs-6bd8e.web.app/decrypt?${[
				`sender=${sender.e}_${sender.l}`,
				`isTorBrowser=${isTorBrowser}`,
				`isBrave=${isBrave}`,
				`mathId=${maths.$hash}`,
				`errorId=${consoleErrors.$hash}`,
				`htmlId=${htmlElementVersion.$hash}`,
				`winId=${windowFeatures.$hash}`,
				`styleId=${styleHash}`,
				`styleSystemId=${systemHash}`,
				`emojiId=${!clientRects || clientRects.lied ? 'undefined' : emojiHash}`,
				`audioId=${
						!offlineAudioContext ||
						offlineAudioContext.lied ||
						unknownFirefoxAudio ? 'undefined' : 
							`${sampleSum}_${gain}_${freqSum}_${timeSum}_${valuesHash}`
				}`,
				`ua=${encodeURIComponent(fp.workerScope.userAgent)}`
			].join('&')}`;

				return fetch(decryptRequest)
				.then(response => response.json())
				.then(data => {
					const {
						jsRuntime,
						jsEngine,
						htmlVersion,
						windowVersion,
						styleVersion,
						styleSystem,
						emojiSystem,
						audioSystem
					} = data;
					
					const iconSet = new Set();
					const htmlIcon = cssClass => `<span class="icon ${cssClass}"></span>`;
					const getTemplate = agent => {
						const { decrypted, system } = agent || {};
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
				<div class="flex-grid relative">
					<div class="ellipsis">
						<span class="aside-note-bottom">pending review: <span class="${data.pendingReview ? 'renewed' : ''}">${data.pendingReview || '0'}</span></span>
					</div>
					<div class="col-eight">
						<strong>Version</strong>
						<div>client user agent:
							<span class="${fakeUserAgent ? 'lies' : ''}">${report}</span>
						</div>
						<div class="ellipsis">window object: ${getTemplate(windowVersion)}</div>
						<div class="ellipsis">system styles: ${getTemplate(styleSystem)}</div>
						<div class="ellipsis">computed styles: ${getTemplate(styleVersion)}</div>
						<div class="ellipsis">html element: ${getTemplate(htmlVersion)}</div>
						<div class="ellipsis">js runtime (math): ${getTemplate(jsRuntime)}</div>
						<div class="ellipsis">js engine (error): ${getTemplate(jsEngine)}</div>
						<div class="ellipsis">emojis: ${!Object.keys(emojiSystem || {}).length ? note.unknown : getTemplate(emojiSystem)}</div>
						<div class="ellipsis">audio: ${!Object.keys(audioSystem || {}).length ? note.unknown : getTemplate(audioSystem)}</div>
					</div>
					<div class="col-four icon-container">
						${[...iconSet].map(icon => {
							return `<div class="icon-item ${icon}"></div>`
						}).join('')}
					</div>
				</div>
				`);
					return
				})
				.catch(error => {
					console.error('Error!', error.message);
					return rejectSamplePatch(el, html)
				})
			})
			.catch(error => {
				fetchVisitorDataTimer('Error fetching version data');
				patch(document.getElementById('browser-detection'), html`
				<style>
					.rejected {
						background: #ca656e14 !important;
					}
				</style>
				<div class="flex-grid rejected">
					<div class="col-eight">
						${error}
					</div>
					<div class="col-four icon-container">
					</div>
				</div>
			`);
				return console.error('Error!', error.message)
			});
		});
	})(imports);

}());
