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


	const getUserAgentPlatform = ({ userAgent, excludeBuild = true }) => {
		if (!userAgent) {
			return 'unknown'
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
		const appleRelease = /(ppc |intel |)(mac|mac |)os (x |x|)\d+/i;
		const otherOS = /((symbianos|nokia|blackberry|morphos|mac).+)|\/linux|freebsd|symbos|series \d+|win\d+|unix|hp-ux|bsdi|bsd|x86_64/i;
		const extraSpace = /\s{2,}/;

		const isDevice = (list, device) => list.filter(x => device.test(x)).length;

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

	const computeWindowsRelease = (platform, platformVersion) => {
		if (platform != 'Windows') {
			return false
		}
		const platformVersionNumber = +(/(\d+)\./.exec(platformVersion)||[])[1];

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
			10: '10 (2004|20H2|21H1)'
		};
		return (
			`Windows ${platformVersionNumber >= 13 ? '11' : release[platformVersionNumber] || 'Unknown'}`
		)
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

	const gibberish = (str, {strict = false} = {}) => {
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

		const gibbers = [
			// ignore sequence if less than 3 exist
			...(!strict && (letterSequenceGibbers.length < 3) ? [] : letterSequenceGibbers),
			...(!strict && (letterCaseSequenceGibbers.length < 4) ? [] : letterCaseSequenceGibbers)
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
			'NVIDIAGa'
		];
		return gibbers.filter(x => !allow.includes(x))
	};

	// validate
	const isInt = (x) => typeof x == 'number' && x % 1 == 0;
	const trustInteger = (name, val) => {
		const trusted = isInt(val); 
		return trusted ? val : sendToTrash(name, val)
	};

	// WebGL Renderer helpers
	const compressWebGLRenderer = x => (''+x)
		.replace(/ANGLE \(|\sDirect3D.+|\sD3D.+|\svs_.+\)|\((DRM|POLARIS|LLVM).+|Mesa.+|(ATI|INTEL)-.+|Metal\s-\s.+|NVIDIA\s[\d|\.]+/ig, '')
		.replace(/(\s(ti|\d{1,2}GB|super)$)/ig, '')
		.replace(/\s{2,}/g, ' ')
		.trim()
		.replace(/((r|g)(t|)(x|s|\d) |Graphics |GeForce |Radeon (HD |Pro |))(\d+)/i, (...args) => {
			return `${args[1]}${args[6][0]}${args[6].slice(1).replace(/\d/g, '0')}s`
		});

	const getWebGLRendererParts = x => {
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
			'SSE2',
			'VMware',
			'VMware SVGA 3D',
			'Vega',
			'VirtualBox',
			'VirtualBox Graphics Adapter',
			'Xe Graphics',
			'llvmpipe'
	    ];
	    const parts = [...knownParts].filter(name => (''+x).includes(name));
	    return [...new Set(parts)].sort().join(', ')
	};

	const hardenWebGLRenderer = x => {
		const gpuHasKnownParts = getWebGLRendererParts(x).length;
		return gpuHasKnownParts ? compressWebGLRenderer(x) : x
	};

	const getWebGLRendererConfidence = x => {
		if (!x) {
			return
		}
		const parts = getWebGLRendererParts(x);
		const hasKnownParts = parts.length;
		const hasBlankSpaceNoise = /\s{2,}/.test(x);
		const hasBrokenAngleStructure = /^ANGLE/.test(x) && !(/^ANGLE \((.+)\)$/.exec(x)||[])[1];

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
		const valid = (
			hasKnownParts && !hasBlankSpaceNoise && !hasBrokenAngleStructure
		);
		const confidence =  (
			valid && !gibbers.length? 'high' :
			valid && gibbers.length ? 'moderate' :
				'low'
		);
		const grade = (
			confidence == 'high' ? 'A' :
				confidence == 'moderate' ? 'C' :
					'F'
		);
		return {
			parts,
			gibbers,
			confidence,
			grade
		}
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
				const shouldExitInSafari13 = (
					/version\/13/i.test((navigator || {}).userAgent) &&
					((3.141592653589793 ** -100) == 1.9275814160560206e-50)
				);
				if (shouldExitInSafari13) {
					return false
				}
				// begin tests
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
		const mimeTypeEnabledPluginsNames = mimeTypeEnabledPlugins.map(plugin => plugin && plugin.name);
		const trustedPluginNamesArray = [...trustedPluginNames];
		trustedPluginNamesArray.forEach(name => {
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
		[-20.538286209106445]: [
			124.0434488439787,
			124.04344968475198,
			124.04347527516074,
			124.04347503720783,
			124.04347657808103
		],
		[-20.538288116455078]: [
			124.04347527516074,
			124.04344884395687,
			124.04344968475198,
			124.04347657808103,
			124.04347730590962,
			124.0434806260746
		],
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
							compressorGainReduction: (
								dynamicsCompressor.reduction.value || // webkit
								dynamicsCompressor.reduction
							)
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
			let textMetricsLie = (
				lieProps['CanvasRenderingContext2D.measureText'] ||
				lieProps['TextMetrics.actualBoundingBoxAscent'] ||
				lieProps['TextMetrics.actualBoundingBoxDescent'] ||
				lieProps['TextMetrics.actualBoundingBoxLeft'] ||
				lieProps['TextMetrics.actualBoundingBoxRight'] ||
				lieProps['TextMetrics.fontBoundingBoxAscent'] ||
				lieProps['TextMetrics.fontBoundingBoxDescent'] ||
				lieProps['TextMetrics.width']
			);
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

			// get system measurements
			const knownTextMetrics = {
				// Blink
				'169.9375': 'Linux', // Chrome OS
				'169.4443359375': 'Linux', // Chrome OS/CloudReady
				'164.6962890625': 'Linux', // Fedora/Ubuntu
				'170.4443359375': 'Linux', // Fedora/Ubuntu (onscreen)
				'173.9521484375': 'Windows', // Windows 10
				'163.5068359375': 'Windows', // Windows 7-8.1
				'156.5068359375': 'Windows', // Windows 7-8.1 (onscreen)
				'159.87109375': 'Android', // Android 8-11
				'161.93359375': 'Android', // Android 9/Chrome OS
				'160.021484375': 'Android', // Android 5-7
				'170.462890625': 'Apple', // Mac Yosemite-Big Sur
				'172.462890625': 'Apple', // Mac Mojave
				'162.462890625': 'Apple', // Mac Yosemite-Big Sur (onscreen)

				// Gecko (onscreen)
				'163.48333384195962': 'Linux', // Fedora/Ubuntu
				'163': 'Linux', // Ubuntu/Tor Browser
				'170.38938852945964': 'Windows', // Windows 10
				'159.9560546875': 'Windows', // Windows 7-8
				'165.9560546875': 'Windows', // Tor Browser
				'173.43938852945962': 'Apple', // Mac Yosemite-Big Sur (+Tor Browser)
				'159.70088922409784': 'Android', // Android 11
				'159.71331355882728': 'Android', // Android 11
				'159.59375152587893': 'Android', // Android 11
				'159.75551515467026': 'Android', // Android 10
				'161.7770797729492': 'Android', // Android 9
				
				// WebKit (onscreen)
				'172.955078125': 'Apple', // Mac, CriOS
			};

			const {
				actualBoundingBoxRight: systemActualBoundingBoxRight,
				width: systemWidth
			} = context.measureText('😀!@#$%^&*') || {};
			const textMetricsSystemSum = ((systemActualBoundingBoxRight || 0) + (systemWidth || 0)) || undefined;
			const textMetricsSystemClass = knownTextMetrics[textMetricsSystemSum];
			
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

			const getTextMetricsFloatLie = context => {
				const isFloat = n => n % 1 !== 0;
				const {
					actualBoundingBoxAscent: abba,
					actualBoundingBoxDescent: abbd,
					actualBoundingBoxLeft: abbl,
					actualBoundingBoxRight: abbr,
					fontBoundingBoxAscent: fbba,
					fontBoundingBoxDescent: fbbd,
					width: w
				} = context.measureText('') || {};
				const lied = [
					abba,
					abbd,
					abbl,
					abbr,
					fbba,
					fbbd
				].find(x => isFloat((x || 0)));
				return lied
			};
			if (getTextMetricsFloatLie(context)) {
				textMetricsLie = true;
				lied = true;
				documentLie(
					'CanvasRenderingContext2D.measureText',
					'metric noise detected'
				);
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
				textMetricsSystemSum,
				textMetricsSystemClass,
				liedTextMetrics: textMetricsLie,
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
			<div class="icon-pixel-container pixels">${note.blocked}</div>
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
				textMetricsSystemSum,
				textMetricsSystemClass,
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
		${dataURI ? `<div class="icon-pixel canvas-data"></div>` : ''}
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

		const icon = {
			'Linux': '<span class="icon linux"></span>',
			'Apple': '<span class="icon apple"></span>',
			'Windows': '<span class="icon windows"></span>',
			'Android': '<span class="icon android"></span>'
		};
		
		const systemTextMetricsClassIcon = icon[textMetricsSystemClass];
		const textMetricsHash = hashMini(textMetrics);

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
			!textMetrics ? note.blocked : modal(
				'creep-text-metrics',
				`<div>system: ${textMetricsSystemSum}</div><br>` +
				Object.keys(textMetrics).map(key => `<span>${key}: ${typeof textMetrics[key] == 'undefined' ? note.unsupported : textMetrics[key]}</span>`).join('<br>'),
				systemTextMetricsClassIcon ? `${systemTextMetricsClassIcon}${textMetricsHash}` :
					textMetricsHash
			)	
		}</div>
		<div class="help" title="CanvasRenderingContext2D.getImageData()">pixel trap: ${rgba ? `${modPercent}% rgba noise ${rgbaHTML}` : ''}</div>
		<div class="icon-pixel-container pixels">
			<div class="icon-pixel pixel-image-random"></div>
			${rgba ? `<div class="icon-pixel pixel-image"></div>` : ''}
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
			const parameterOrExtensionLie = (
				lieProps['WebGLRenderingContext.getParameter'] ||
				lieProps['WebGL2RenderingContext.getParameter'] ||
				lieProps['WebGLRenderingContext.getExtension'] ||
				lieProps['WebGL2RenderingContext.getExtension']
			);
			let lied = (
				dataLie ||
				contextLie ||
				parameterOrExtensionLie ||
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
				parameterOrExtensionLie,
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

	const webglHTML = ({ fp, note, count, modal, hashMini, hashSlice, compressWebGLRenderer, getWebGLRendererConfidence }) => {
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
			<div>gpu:</div>
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

		const compressedGPU = compressWebGLRenderer((parameters||{}).UNMASKED_RENDERER_WEBGL);
		const { parts, gibbers, confidence, grade: confidenceGrade } = getWebGLRendererConfidence((parameters||{}).UNMASKED_RENDERER_WEBGL) || {};
		
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
	<div class="col-four${lied ? ' rejected' : ''} relative">
		${
			confidence ? `<span class="confidence-note">confidence: <span class="scale-up grade-${confidenceGrade}">${confidence}</span></span>` : ''
		}
		<div>gpu:</div>
		<div class="block-text help" title="${
			confidence ? `\nWebGLRenderingContext.getParameter()\ngpu compressed: ${compressedGPU}\nknown parts: ${parts || 'none'}\ngibberish: ${gibbers || 'none'}` : 'WebGLRenderingContext.getParameter()'
		}">
			<div>
				${parameters.UNMASKED_VENDOR_WEBGL ? parameters.UNMASKED_VENDOR_WEBGL : ''}
				${!parameters.UNMASKED_RENDERER_WEBGL ? note.unsupported : `<br>${parameters.UNMASKED_RENDERER_WEBGL}`}
			</div>
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

	const cssHTML = ({ fp, modal, note, hashMini, hashSlice, count }) => {
		if (!fp.css) {
			return `
		<div class="col-six undefined">
			<strong>Computed Style</strong>
			<div>keys (0): ${note.blocked}</div>
			<div>system styles: ${note.blocked}</div>
			<div>
				<div>${note.blocked}</div>
			</div>
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
		<div class="blurred" id="system-style-samples">
			<div>system</div>
		</div>
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
			<strong>CSS Media Queries</strong>
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
			<div>results: ${note.blocked}</div>
			<div>
				<div>${note.blocked}</div>
			</div>
		</div>`
		}
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
		<strong>Error</strong><span class="hash">${hashSlice($hash)}</span>
		<div>results: ${modal('creep-console-errors', results.join('<br>'))}</div>
		<div class="blurred" id="error-samples">
			<div>0% of engine</div>
		</div>
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
			const win = phantomDarkness || window;
			let keys = Object.getOwnPropertyNames(win)
				.filter(key => !/_|\d{3,}/.test(key)); // clear out known ddg noise

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
			<div>
				<div>${note.blocked}</div>
			</div>
		</div>`
		}
		const {
			windowFeatures: {
				$hash,
				keys
			}
		} = fp;
		
		return `
	<div class="col-six">
		<strong>Window</strong><span class="hash">${hashSlice($hash)}</span>
		<div>keys (${count(keys)}): ${keys && keys.length ? modal('creep-iframe-content-window-version', keys.join(', ')) : note.blocked}</div>
		<div class="blurred" id="window-features-samples">
			<div>0% of version</div>
		</div>
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
					['navigator.webdriver is on']: 'webdriver' in navigator && !!navigator.webdriver,
					['chrome plugins array is empty']: isChromium && navigator.plugins.length === 0,
					['chrome mimeTypes array is empty']: isChromium && mimeTypes.length === 0,
					['notification permission is denied']: (
						isChromium &&
						'Notification' in window &&
						(Notification.permission == 'denied')
					),
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
					['chrome permission state is inconsistent']: (
						isChromium &&
						'permissions' in navigator &&
						await (async () => {
							const res = await navigator.permissions.query({ name: 'notifications' });
							return (
								res.state == 'prompt' &&
								'Notification' in window &&
								Notification.permission === 'denied'
							)
						})()
					),
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
			<div>
				<div>${note.blocked}</div>
			</div>
		</div>`
		}
		const {
			htmlElementVersion: {
				$hash,
				keys
			}
		} = fp;

		return `
	<div class="col-six">
		<strong>HTMLElement</strong><span class="hash">${hashSlice($hash)}</span>
		<div>keys (${count(keys)}): ${keys && keys.length ? modal('creep-html-element-version', keys.join(', ')) : note.blocked}</div>
		<div class="blurred" id="html-element-samples">
			<div>0% of engine</div>
		</div>
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
			<div>results: ${note.blocked}</div>
			<div>
				<div>${note.blocked}</div>
			</div>
			
		</div>`
		}
		const {
			maths: {
				data,
				$hash,
				lied
			}
		} = fp;

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

		const results = Object.keys(data).map(key => {
			const value = data[key];
			const { result, chrome, firefox, torBrowser, safari } = value;
			return `
		${chrome ? '<span class="math-chromium">C</span>' : '<span class="math-blank-false">-</span>'}${firefox ? '<span class="math-firefox">F</span>' : '<span class="math-blank-false">-</span>'}${torBrowser ? '<span class="math-tor-browser">T</span>' : '<span class="math-blank-false">-</span>'}${safari ? '<span class="math-safari">S</span>' : '<span class="math-blank-false">-</span>'} ${key}`
		});

		return `
	<div class="col-six${lied ? ' rejected' : ''}">
		<strong>Math</strong><span class="${lied ? 'lies ' : ''}hash">${hashSlice($hash)}</span>
		<div>results: ${
			!data ? note.blocked : 
			modal(
				'creep-maths',
				header+results.join('<br>')
			)
		}</div>
		<div class="blurred" id="math-samples">
			<div>0% of engine</div>
		</div>
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
					if (
						!('bluetooth' in phantomNavigator) ||
						!phantomNavigator.bluetooth ||
						!phantomNavigator.bluetooth.getAvailability) {
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

	const navigatorHTML = ({ fp, hashSlice, hashMini, note, modal, count, computeWindowsRelease }) => {
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
				
				const brandsVersionNumber = +(/\d+/.exec(''+(brandsVersion||[])[0])||[])[0]
				const windowsRelease = (
					brandsVersionNumber > 94 ? computeWindowsRelease(platform, platformVersion) :
						undefined
				)

				return !userAgentData ? note.unsupported : `
					${(brandsVersion || []).join(',')}${uaFullVersion ? ` (${uaFullVersion})` : ''}
					<br>${windowsRelease ? windowsRelease : `${platform} ${platformVersion}`} ${architecture}
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
			${device ? `<br>${device}` : note.blocked}${
				hardwareConcurrency && deviceMemory ? `<br>cores: ${hardwareConcurrency}, memory: ${deviceMemory}` :
				hardwareConcurrency && !deviceMemory ? `<br>cores: ${hardwareConcurrency}` :
				!hardwareConcurrency && deviceMemory ? `<br>memory: ${deviceMemory}` : ''
			}${typeof maxTouchPoints != 'undefined' ? `, touch: ${''+maxTouchPoints}` : ''}
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

	const formatLocation = x => {
		try {
			return x.replace(/_/, ' ').split('/').join(', ')
		}
		catch (error) {}
		return x
	};

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
			<div>codecs: ${note.blocked}</div>
			<div>codecs sdp: ${note.blocked}</div>
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
				//const registration = await navigator.serviceWorker.ready
				const registration = await navigator.serviceWorker.getRegistration(source)
				.catch(error => {
					console.error(error);
					return resolve()
				});
				if (!registration) {
					return resolve()
				}

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
					textMetricsSystemClass,
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
					workerScope.lies.systemFonts = `${fontSystemClass} fonts and ${system} user agent do not match`;
					documentLie(workerScope.scope, workerScope.lies.systemFonts);
				}

				// text metrics system lie
				const textMetricsSystemLie = textMetricsSystemClass && (
					/^((i(pad|phone|os))|mac)$/i.test(system) && textMetricsSystemClass != 'Apple'  ? true :
						/^(windows)$/i.test(system) && textMetricsSystemClass != 'Windows'  ? true :
							/^(linux|chrome os)$/i.test(system) && textMetricsSystemClass != 'Linux'  ? true :
								/^(android)$/i.test(system) && textMetricsSystemClass != 'Android'  ? true :
									false
				);
				if (textMetricsSystemLie) {
					workerScope.lied = true;
					workerScope.lies.systemTextMetrics = `${textMetricsSystemClass} text metrics and ${system} user agent do not match`;
					documentLie(workerScope.scope, workerScope.lies.systemTextMetrics);
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
				const userAgentEngine = (
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
				if (userAgentEngine != engine) {
					workerScope.lied = true;
					workerScope.lies.engine = `${engine} JS runtime and ${userAgentEngine} user agent do not match`;
					documentLie(workerScope.scope, workerScope.lies.engine);
				}
				// user agent version lie
				const getVersion = x => /\s(\d+)/i.test(x) && /\s(\d+)/i.exec(x)[1];
				const userAgentVersion = getVersion(decryptedName);
				const userAgentDataVersion = (
					userAgentData &&
					userAgentData.brandsVersion &&
					userAgentData.brandsVersion.length ? 
					getVersion(userAgentData.brandsVersion) :
					undefined
				);
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
					if (!/windows/i.test(device) || !userAgentData) {
						return false
					}
					const reportedVersionNumber = +(/windows ([\d|\.]+)/i.exec(device)||[])[1]
					const windows1OrHigherReport = reportedVersionNumber == 10
					const { platformVersion, brandsVersion } = userAgentData

					const brandsVersionNumber = +(/\d+/.exec(''+(brandsVersion||[])[0])||[])[0]
					const versionMap = {
						'6.1': '7',
						'6.1.0': '7',
						'6.2': '8',
						'6.2.0': '8',
						'6.3': '8.1',
						'6.3.0': '8.1',
						'10.0': '10',
						'10.0.0': '10'
					}
					let versionNumber = versionMap[platformVersion]
					if ((brandsVersionNumber < 95) && versionNumber) {
						return versionNumber != (''+reportedVersionNumber)
					}
					versionNumber = +(/(\d+)\./.exec(''+platformVersion)||[])[1]
					const windows10OrHigherPlatform = versionNumber > 0
					return (
						(windows10OrHigherPlatform && !windows1OrHigherReport) ||
						(!windows10OrHigherPlatform && windows1OrHigherReport)
					)
				}
				const windowsVersionLie  = getWindowsVersionLie(workerScope.device, userAgentData);
				if (windowsVersionLie) {
					workerScope.lied = true;
					workerScope.lies.platformVersion = `Windows platformVersion ${(userAgentData||{}).platformVersion} does not match user agent version ${workerScope.device}`;
					documentLie(workerScope.scope, workerScope.lies.platformVersion);
				}			
				
				// capture userAgent version
				workerScope.userAgentVersion = userAgentVersion;
				workerScope.userAgentDataVersion = userAgentDataVersion;
				workerScope.userAgentEngine = userAgentEngine;

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

	const workerScopeHTML = ({ fp, note, count, modal, hashMini, hashSlice, compressWebGLRenderer, getWebGLRendererConfidence, computeWindowsRelease }) => {
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
			<div>gpu:</div>
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
			textMetricsSystemSum,
			textMetricsSystemClass,
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
		
		const systemFontClassIcon = icon[fontSystemClass];
		const systemTextMetricsClassIcon = icon[textMetricsSystemClass];
		const fontFaceSetHash = hashMini(fontFaceSetFonts);
		const textMetricsHash = hashMini(textMetrics);
		const codecKeys = Object.keys(mediaCapabilities || {});
		const permissionsKeys = Object.keys(permissions || {});
		const permissionsGranted = (
			permissions && permissions.granted ? permissions.granted.length : 0
		);

		const compressedGPU = compressWebGLRenderer(webglRenderer);
		const { parts, gibbers, confidence, grade: confidenceGrade } = getWebGLRendererConfidence(webglRenderer) || {};

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
			!textMetrics ? note.blocked : modal(
				'creep-worker-text-metrics',
				`<div>system: ${textMetricsSystemSum}</div><br>` +
				Object.keys(textMetrics).map(key => `<span>${key}: ${typeof textMetrics[key] == 'undefined' ? note.unsupported : textMetrics[key]}</span>`).join('<br>'),
				systemTextMetricsClassIcon ? `${systemTextMetricsClassIcon}${textMetricsHash}` :
					textMetricsHash
			)	
		}</div>
		<div class="help" title="FontFaceSet.check()">fontFaceSet (${fontFaceSetFonts ? count(fontFaceSetFonts) : '0'}/${''+fontListLen}): ${
			fontFaceSetFonts.length ? modal(
				'creep-worker-fonts-check', 
				fontFaceSetFonts.map(font => `<span style="font-family:'${font}'">${font}</span>`).join('<br>'),
				systemFontClassIcon ? `${systemFontClassIcon}${fontFaceSetHash}` : fontFaceSetHash
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
		<div class="relative">${
			confidence ? `<span class="confidence-note">confidence: <span class="scale-up grade-${confidenceGrade}">${confidence}</span></span>` : ''
		}gpu:</div>
		<div class="block-text help" title="${
			confidence ? `\nWebGLRenderingContext.getParameter()\ngpu compressed: ${compressedGPU}\nknown parts: ${parts || 'none'}\ngibberish: ${gibbers || 'none'}` : 'WebGLRenderingContext.getParameter()'
		}">
			${webglVendor ? webglVendor : ''}
			${webglRenderer ? `<br>${webglRenderer}` : note.unsupported}
		</div>
	</div>
	<div class="col-six${lied ? ' rejected' : ''}">
		<div>device:</div>
		<div class="block-text help" title="WorkerNavigator.deviceMemory\nWorkerNavigator.hardwareConcurrency\nWorkerNavigator.platform\nWorkerNavigator.userAgent">
			${`${system}${platform ? ` (${platform})` : ''}`}
			${device ? `<br>${device}` : note.blocked}
			${
				hardwareConcurrency && deviceMemory ? `<br>cores: ${hardwareConcurrency}, memory: ${deviceMemory}` :
				hardwareConcurrency && !deviceMemory ? `<br>cores: ${hardwareConcurrency}` :
				!hardwareConcurrency && deviceMemory ? `<br>memory: ${deviceMemory}` : ''
			}
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

				const brandsVersionNumber = +(/\d+/.exec(''+(brandsVersion||[])[0])||[])[0]
				const windowsRelease = (
					brandsVersionNumber > 94 ? computeWindowsRelease(platform, platformVersion) :
						undefined
				)

				return !userAgentData ? note.unsupported : `
					${(brandsVersion || []).join(',')}${uaFullVersion ? ` (${uaFullVersion})` : ''}
					<br>${windowsRelease ? windowsRelease : `${platform} ${platformVersion}`} ${architecture}
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

	/*
	Steps to update:
	0. get beta release desktop/mobile
	1. get diffs from template
	2. update feature list
	3. update stable features object
	*/
	const getStableFeatures = () => ({
		'Chrome': {
			version: 97,
			windowKeys: `Object, Function, Array, Number, parseFloat, parseInt, Infinity, NaN, undefined, Boolean, String, Symbol, Date, Promise, RegExp, Error, AggregateError, EvalError, RangeError, ReferenceError, SyntaxError, TypeError, URIError, globalThis, JSON, Math, console, Intl, ArrayBuffer, Uint8Array, Int8Array, Uint16Array, Int16Array, Uint32Array, Int32Array, Float32Array, Float64Array, Uint8ClampedArray, BigUint64Array, BigInt64Array, DataView, Map, BigInt, Set, WeakMap, WeakSet, Proxy, Reflect, FinalizationRegistry, WeakRef, decodeURI, decodeURIComponent, encodeURI, encodeURIComponent, escape, unescape, eval, isFinite, isNaN, Option, Image, Audio, webkitURL, webkitRTCPeerConnection, webkitMediaStream, WebKitMutationObserver, WebKitCSSMatrix, XPathResult, XPathExpression, XPathEvaluator, XMLSerializer, XMLHttpRequestUpload, XMLHttpRequestEventTarget, XMLHttpRequest, XMLDocument, WritableStreamDefaultWriter, WritableStreamDefaultController, WritableStream, Worker, Window, WheelEvent, WebSocket, WebGLVertexArrayObject, WebGLUniformLocation, WebGLTransformFeedback, WebGLTexture, WebGLSync, WebGLShaderPrecisionFormat, WebGLShader, WebGLSampler, WebGLRenderingContext, WebGLRenderbuffer, WebGLQuery, WebGLProgram, WebGLFramebuffer, WebGLContextEvent, WebGLBuffer, WebGLActiveInfo, WebGL2RenderingContext, WaveShaperNode, VisualViewport, ValidityState, VTTCue, UserActivation, URLSearchParams, URL, UIEvent, TreeWalker, TransitionEvent, TransformStream, TrackEvent, TouchList, TouchEvent, Touch, TimeRanges, TextTrackList, TextTrackCueList, TextTrackCue, TextTrack, TextMetrics, TextEvent, TextEncoderStream, TextEncoder, TextDecoderStream, TextDecoder, Text, TaskAttributionTiming, SyncManager, SubmitEvent, StyleSheetList, StyleSheet, StylePropertyMapReadOnly, StylePropertyMap, StorageEvent, Storage, StereoPannerNode, StaticRange, ShadowRoot, Selection, SecurityPolicyViolationEvent, ScriptProcessorNode, ScreenOrientation, Screen, SVGViewElement, SVGUseElement, SVGUnitTypes, SVGTransformList, SVGTransform, SVGTitleElement, SVGTextPositioningElement, SVGTextPathElement, SVGTextElement, SVGTextContentElement, SVGTSpanElement, SVGSymbolElement, SVGSwitchElement, SVGStyleElement, SVGStringList, SVGStopElement, SVGSetElement, SVGScriptElement, SVGSVGElement, SVGRectElement, SVGRect, SVGRadialGradientElement, SVGPreserveAspectRatio, SVGPolylineElement, SVGPolygonElement, SVGPointList, SVGPoint, SVGPatternElement, SVGPathElement, SVGNumberList, SVGNumber, SVGMetadataElement, SVGMatrix, SVGMaskElement, SVGMarkerElement, SVGMPathElement, SVGLinearGradientElement, SVGLineElement, SVGLengthList, SVGLength, SVGImageElement, SVGGraphicsElement, SVGGradientElement, SVGGeometryElement, SVGGElement, SVGForeignObjectElement, SVGFilterElement, SVGFETurbulenceElement, SVGFETileElement, SVGFESpotLightElement, SVGFESpecularLightingElement, SVGFEPointLightElement, SVGFEOffsetElement, SVGFEMorphologyElement, SVGFEMergeNodeElement, SVGFEMergeElement, SVGFEImageElement, SVGFEGaussianBlurElement, SVGFEFuncRElement, SVGFEFuncGElement, SVGFEFuncBElement, SVGFEFuncAElement, SVGFEFloodElement, SVGFEDropShadowElement, SVGFEDistantLightElement, SVGFEDisplacementMapElement, SVGFEDiffuseLightingElement, SVGFEConvolveMatrixElement, SVGFECompositeElement, SVGFEComponentTransferElement, SVGFEColorMatrixElement, SVGFEBlendElement, SVGEllipseElement, SVGElement, SVGDescElement, SVGDefsElement, SVGComponentTransferFunctionElement, SVGClipPathElement, SVGCircleElement, SVGAnimationElement, SVGAnimatedTransformList, SVGAnimatedString, SVGAnimatedRect, SVGAnimatedPreserveAspectRatio, SVGAnimatedNumberList, SVGAnimatedNumber, SVGAnimatedLengthList, SVGAnimatedLength, SVGAnimatedInteger, SVGAnimatedEnumeration, SVGAnimatedBoolean, SVGAnimatedAngle, SVGAnimateTransformElement, SVGAnimateMotionElement, SVGAnimateElement, SVGAngle, SVGAElement, Response, ResizeObserverSize, ResizeObserverEntry, ResizeObserver, Request, ReportingObserver, ReadableStreamDefaultReader, ReadableStreamDefaultController, ReadableStreamBYOBRequest, ReadableStreamBYOBReader, ReadableStream, ReadableByteStreamController, Range, RadioNodeList, RTCTrackEvent, RTCStatsReport, RTCSessionDescription, RTCSctpTransport, RTCRtpTransceiver, RTCRtpSender, RTCRtpReceiver, RTCPeerConnectionIceEvent, RTCPeerConnectionIceErrorEvent, RTCPeerConnection, RTCIceCandidate, RTCErrorEvent, RTCError, RTCEncodedVideoFrame, RTCEncodedAudioFrame, RTCDtlsTransport, RTCDataChannelEvent, RTCDataChannel, RTCDTMFToneChangeEvent, RTCDTMFSender, RTCCertificate, PromiseRejectionEvent, ProgressEvent, ProcessingInstruction, PopStateEvent, PointerEvent, PluginArray, Plugin, PeriodicWave, PerformanceTiming, PerformanceServerTiming, PerformanceResourceTiming, PerformancePaintTiming, PerformanceObserverEntryList, PerformanceObserver, PerformanceNavigationTiming, PerformanceNavigation, PerformanceMeasure, PerformanceMark, PerformanceLongTaskTiming, PerformanceEventTiming, PerformanceEntry, PerformanceElementTiming, Performance, Path2D, PannerNode, PageTransitionEvent, OverconstrainedError, OscillatorNode, OffscreenCanvasRenderingContext2D, OffscreenCanvas, OfflineAudioContext, OfflineAudioCompletionEvent, NodeList, NodeIterator, NodeFilter, Node, NetworkInformation, Navigator, NamedNodeMap, MutationRecord, MutationObserver, MutationEvent, MouseEvent, MimeTypeArray, MimeType, MessagePort, MessageEvent, MessageChannel, MediaStreamTrackEvent, MediaStreamTrack, MediaStreamEvent, MediaStreamAudioSourceNode, MediaStreamAudioDestinationNode, MediaStream, MediaRecorder, MediaQueryListEvent, MediaQueryList, MediaList, MediaError, MediaEncryptedEvent, MediaElementAudioSourceNode, MediaCapabilities, Location, LayoutShiftAttribution, LayoutShift, LargestContentfulPaint, KeyframeEffect, KeyboardEvent, IntersectionObserverEntry, IntersectionObserver, InputEvent, InputDeviceInfo, InputDeviceCapabilities, ImageData, ImageCapture, ImageBitmapRenderingContext, ImageBitmap, IdleDeadline, IIRFilterNode, IDBVersionChangeEvent, IDBTransaction, IDBRequest, IDBOpenDBRequest, IDBObjectStore, IDBKeyRange, IDBIndex, IDBFactory, IDBDatabase, IDBCursorWithValue, IDBCursor, History, Headers, HashChangeEvent, HTMLVideoElement, HTMLUnknownElement, HTMLUListElement, HTMLTrackElement, HTMLTitleElement, HTMLTimeElement, HTMLTextAreaElement, HTMLTemplateElement, HTMLTableSectionElement, HTMLTableRowElement, HTMLTableElement, HTMLTableColElement, HTMLTableCellElement, HTMLTableCaptionElement, HTMLStyleElement, HTMLSpanElement, HTMLSourceElement, HTMLSlotElement, HTMLSelectElement, HTMLScriptElement, HTMLQuoteElement, HTMLProgressElement, HTMLPreElement, HTMLPictureElement, HTMLParamElement, HTMLParagraphElement, HTMLOutputElement, HTMLOptionsCollection, HTMLOptionElement, HTMLOptGroupElement, HTMLObjectElement, HTMLOListElement, HTMLModElement, HTMLMeterElement, HTMLMetaElement, HTMLMenuElement, HTMLMediaElement, HTMLMarqueeElement, HTMLMapElement, HTMLLinkElement, HTMLLegendElement, HTMLLabelElement, HTMLLIElement, HTMLInputElement, HTMLImageElement, HTMLIFrameElement, HTMLHtmlElement, HTMLHeadingElement, HTMLHeadElement, HTMLHRElement, HTMLFrameSetElement, HTMLFrameElement, HTMLFormElement, HTMLFormControlsCollection, HTMLFontElement, HTMLFieldSetElement, HTMLEmbedElement, HTMLElement, HTMLDocument, HTMLDivElement, HTMLDirectoryElement, HTMLDialogElement, HTMLDetailsElement, HTMLDataListElement, HTMLDataElement, HTMLDListElement, HTMLCollection, HTMLCanvasElement, HTMLButtonElement, HTMLBodyElement, HTMLBaseElement, HTMLBRElement, HTMLAudioElement, HTMLAreaElement, HTMLAnchorElement, HTMLAllCollection, GeolocationPositionError, GeolocationPosition, GeolocationCoordinates, Geolocation, GamepadHapticActuator, GamepadEvent, GamepadButton, Gamepad, GainNode, FormDataEvent, FormData, FontFaceSetLoadEvent, FontFace, FocusEvent, FileReader, FileList, File, FeaturePolicy, External, EventTarget, EventSource, EventCounts, Event, ErrorEvent, ElementInternals, Element, DynamicsCompressorNode, DragEvent, DocumentType, DocumentFragment, Document, DelayNode, DecompressionStream, DataTransferItemList, DataTransferItem, DataTransfer, DOMTokenList, DOMStringMap, DOMStringList, DOMRectReadOnly, DOMRectList, DOMRect, DOMQuad, DOMPointReadOnly, DOMPoint, DOMParser, DOMMatrixReadOnly, DOMMatrix, DOMImplementation, DOMException, DOMError, CustomEvent, CustomElementRegistry, Crypto, CountQueuingStrategy, ConvolverNode, ConstantSourceNode, CompressionStream, CompositionEvent, Comment, CloseEvent, ClipboardEvent, CharacterData, ChannelSplitterNode, ChannelMergerNode, CanvasRenderingContext2D, CanvasPattern, CanvasGradient, CanvasCaptureMediaStreamTrack, CSSVariableReferenceValue, CSSUnparsedValue, CSSUnitValue, CSSTranslate, CSSTransformValue, CSSTransformComponent, CSSSupportsRule, CSSStyleValue, CSSStyleSheet, CSSStyleRule, CSSStyleDeclaration, CSSSkewY, CSSSkewX, CSSSkew, CSSScale, CSSRuleList, CSSRule, CSSRotate, CSSPropertyRule, CSSPositionValue, CSSPerspective, CSSPageRule, CSSNumericValue, CSSNumericArray, CSSNamespaceRule, CSSMediaRule, CSSMatrixComponent, CSSMathValue, CSSMathSum, CSSMathProduct, CSSMathNegate, CSSMathMin, CSSMathMax, CSSMathInvert, CSSKeywordValue, CSSKeyframesRule, CSSKeyframeRule, CSSImportRule, CSSImageValue, CSSGroupingRule, CSSFontFaceRule, CSSCounterStyleRule, CSSConditionRule, CSS, CDATASection, ByteLengthQueuingStrategy, BroadcastChannel, BlobEvent, Blob, BiquadFilterNode, BeforeUnloadEvent, BeforeInstallPromptEvent, BatteryManager, BaseAudioContext, BarProp, AudioWorkletNode, AudioScheduledSourceNode, AudioProcessingEvent, AudioParamMap, AudioParam, AudioNode, AudioListener, AudioDestinationNode, AudioContext, AudioBufferSourceNode, AudioBuffer, Attr, AnimationEvent, AnimationEffect, Animation, AnalyserNode, AbstractRange, AbortSignal, AbortController, window, self, document, name, location, customElements, history, locationbar, menubar, personalbar, scrollbars, statusbar, toolbar, status, closed, frames, length, top, opener, parent, frameElement, navigator, origin, external, screen, innerWidth, innerHeight, scrollX, pageXOffset, scrollY, pageYOffset, visualViewport, screenX, screenY, outerWidth, outerHeight, devicePixelRatio, event, clientInformation, offscreenBuffering, screenLeft, screenTop, defaultStatus, defaultstatus, styleMedia, onsearch, isSecureContext, performance, onappinstalled, onbeforeinstallprompt, crypto, indexedDB, webkitStorageInfo, sessionStorage, localStorage, onbeforexrselect, onabort, onblur, oncancel, oncanplay, oncanplaythrough, onchange, onclick, onclose, oncontextmenu, oncuechange, ondblclick, ondrag, ondragend, ondragenter, ondragleave, ondragover, ondragstart, ondrop, ondurationchange, onemptied, onended, onerror, onfocus, onformdata, oninput, oninvalid, onkeydown, onkeypress, onkeyup, onload, onloadeddata, onloadedmetadata, onloadstart, onmousedown, onmouseenter, onmouseleave, onmousemove, onmouseout, onmouseover, onmouseup, onmousewheel, onpause, onplay, onplaying, onprogress, onratechange, onreset, onresize, onscroll, onsecuritypolicyviolation, onseeked, onseeking, onselect, onslotchange, onstalled, onsubmit, onsuspend, ontimeupdate, ontoggle, onvolumechange, onwaiting, onwebkitanimationend, onwebkitanimationiteration, onwebkitanimationstart, onwebkittransitionend, onwheel, onauxclick, ongotpointercapture, onlostpointercapture, onpointerdown, onpointermove, onpointerup, onpointercancel, onpointerover, onpointerout, onpointerenter, onpointerleave, onselectstart, onselectionchange, onanimationend, onanimationiteration, onanimationstart, ontransitionrun, ontransitionstart, ontransitionend, ontransitioncancel, onafterprint, onbeforeprint, onbeforeunload, onhashchange, onlanguagechange, onmessage, onmessageerror, onoffline, ononline, onpagehide, onpageshow, onpopstate, onrejectionhandled, onstorage, onunhandledrejection, onunload, alert, atob, blur, btoa, cancelAnimationFrame, cancelIdleCallback, captureEvents, clearInterval, clearTimeout, close, confirm, createImageBitmap, fetch, find, focus, getComputedStyle, getSelection, matchMedia, moveBy, moveTo, open, postMessage, print, prompt, queueMicrotask, releaseEvents, reportError, requestAnimationFrame, requestIdleCallback, resizeBy, resizeTo, scroll, scrollBy, scrollTo, setInterval, setTimeout, stop, webkitCancelAnimationFrame, webkitRequestAnimationFrame, Atomics, chrome, WebAssembly, caches, cookieStore, ondevicemotion, ondeviceorientation, ondeviceorientationabsolute, AbsoluteOrientationSensor, Accelerometer, AudioWorklet, Cache, CacheStorage, Clipboard, ClipboardItem, CookieChangeEvent, CookieStore, CookieStoreManager, Credential, CredentialsContainer, CryptoKey, DeviceMotionEvent, DeviceMotionEventAcceleration, DeviceMotionEventRotationRate, DeviceOrientationEvent, FederatedCredential, Gyroscope, Keyboard, KeyboardLayoutMap, LinearAccelerationSensor, Lock, LockManager, MIDIAccess, MIDIConnectionEvent, MIDIInput, MIDIInputMap, MIDIMessageEvent, MIDIOutput, MIDIOutputMap, MIDIPort, MediaDeviceInfo, MediaDevices, MediaKeyMessageEvent, MediaKeySession, MediaKeyStatusMap, MediaKeySystemAccess, MediaKeys, NavigationPreloadManager, NavigatorManagedData, OrientationSensor, PasswordCredential, RTCIceTransport, RelativeOrientationSensor, Sensor, SensorErrorEvent, ServiceWorker, ServiceWorkerContainer, ServiceWorkerRegistration, StorageManager, SubtleCrypto, Worklet, XRDOMOverlayState, XRLayer, XRWebGLBinding, AudioData, EncodedAudioChunk, EncodedVideoChunk, ImageTrack, ImageTrackList, VideoColorSpace, VideoFrame, AudioDecoder, AudioEncoder, ImageDecoder, VideoDecoder, VideoEncoder, AuthenticatorAssertionResponse, AuthenticatorAttestationResponse, AuthenticatorResponse, PublicKeyCredential, Bluetooth, BluetoothCharacteristicProperties, BluetoothDevice, BluetoothRemoteGATTCharacteristic, BluetoothRemoteGATTDescriptor, BluetoothRemoteGATTServer, BluetoothRemoteGATTService, EyeDropper, FileSystemDirectoryHandle, FileSystemFileHandle, FileSystemHandle, FileSystemWritableFileStream, FragmentDirective, GravitySensor, HID, HIDConnectionEvent, HIDDevice, HIDInputReportEvent, IdleDetector, MediaStreamTrackGenerator, MediaStreamTrackProcessor, OTPCredential, PaymentAddress, PaymentRequest, PaymentResponse, PaymentMethodChangeEvent, Presentation, PresentationAvailability, PresentationConnection, PresentationConnectionAvailableEvent, PresentationConnectionCloseEvent, PresentationConnectionList, PresentationReceiver, PresentationRequest, Profiler, Scheduling, Serial, SerialPort, USB, USBAlternateInterface, USBConfiguration, USBConnectionEvent, USBDevice, USBEndpoint, USBInTransferResult, USBInterface, USBIsochronousInTransferPacket, USBIsochronousInTransferResult, USBIsochronousOutTransferPacket, USBIsochronousOutTransferResult, USBOutTransferResult, VirtualKeyboard, WakeLock, WakeLockSentinel, WebTransport, WebTransportBidirectionalStream, WebTransportDatagramDuplexStream, WebTransportError, XRAnchor, XRAnchorSet, XRBoundedReferenceSpace, XRFrame, XRInputSource, XRInputSourceArray, XRInputSourceEvent, XRInputSourcesChangeEvent, XRPose, XRReferenceSpace, XRReferenceSpaceEvent, XRRenderState, XRRigidTransform, XRSession, XRSessionEvent, XRSpace, XRSystem, XRView, XRViewerPose, XRViewport, XRWebGLLayer, XRCPUDepthInformation, XRDepthInformation, XRWebGLDepthInformation, XRHitTestResult, XRHitTestSource, XRRay, XRTransientInputHitTestResult, XRTransientInputHitTestSource, XRLightEstimate, XRLightProbe, showDirectoryPicker, showOpenFilePicker, showSaveFilePicker, originAgentCluster, trustedTypes, speechSynthesis, onpointerrawupdate, crossOriginIsolated, scheduler, AnimationPlaybackEvent, AnimationTimeline, CSSAnimation, CSSTransition, DocumentTimeline, BackgroundFetchManager, BackgroundFetchRecord, BackgroundFetchRegistration, BluetoothUUID, CustomStateSet, DelegatedInkTrailPresenter, Ink, MediaMetadata, MediaSession, MediaSource, SourceBuffer, SourceBufferList, NavigatorUAData, Notification, PaymentInstruments, PaymentManager, PaymentRequestUpdateEvent, PeriodicSyncManager, PermissionStatus, Permissions, PictureInPictureEvent, PictureInPictureWindow, PushManager, PushSubscription, PushSubscriptionOptions, RemotePlayback, Scheduler, TaskController, TaskPriorityChangeEvent, TaskSignal, SharedWorker, SpeechSynthesisErrorEvent, SpeechSynthesisEvent, SpeechSynthesisUtterance, TrustedHTML, TrustedScript, TrustedScriptURL, TrustedTypePolicy, TrustedTypePolicyFactory, URLPattern, VideoPlaybackQuality, VirtualKeyboardGeometryChangeEvent, XSLTProcessor, webkitSpeechGrammar, webkitSpeechGrammarList, webkitSpeechRecognition, webkitSpeechRecognitionError, webkitSpeechRecognitionEvent, openDatabase, webkitRequestFileSystem, webkitResolveLocalFileSystemURL`,
			cssKeys: `cssText, length, parentRule, cssFloat, getPropertyPriority, getPropertyValue, item, removeProperty, setProperty, constructor, accent-color, align-content, align-items, align-self, alignment-baseline, animation-delay, animation-direction, animation-duration, animation-fill-mode, animation-iteration-count, animation-name, animation-play-state, animation-timing-function, app-region, appearance, backdrop-filter, backface-visibility, background-attachment, background-blend-mode, background-clip, background-color, background-image, background-origin, background-position, background-repeat, background-size, baseline-shift, block-size, border-block-end-color, border-block-end-style, border-block-end-width, border-block-start-color, border-block-start-style, border-block-start-width, border-bottom-color, border-bottom-left-radius, border-bottom-right-radius, border-bottom-style, border-bottom-width, border-collapse, border-end-end-radius, border-end-start-radius, border-image-outset, border-image-repeat, border-image-slice, border-image-source, border-image-width, border-inline-end-color, border-inline-end-style, border-inline-end-width, border-inline-start-color, border-inline-start-style, border-inline-start-width, border-left-color, border-left-style, border-left-width, border-right-color, border-right-style, border-right-width, border-start-end-radius, border-start-start-radius, border-top-color, border-top-left-radius, border-top-right-radius, border-top-style, border-top-width, bottom, box-shadow, box-sizing, break-after, break-before, break-inside, buffered-rendering, caption-side, caret-color, clear, clip, clip-path, clip-rule, color, color-interpolation, color-interpolation-filters, color-rendering, column-count, column-gap, column-rule-color, column-rule-style, column-rule-width, column-span, column-width, contain-intrinsic-block-size, contain-intrinsic-height, contain-intrinsic-inline-size, contain-intrinsic-size, contain-intrinsic-width, content, cursor, cx, cy, d, direction, display, dominant-baseline, empty-cells, fill, fill-opacity, fill-rule, filter, flex-basis, flex-direction, flex-grow, flex-shrink, flex-wrap, float, flood-color, flood-opacity, font-family, font-kerning, font-optical-sizing, font-size, font-stretch, font-style, font-synthesis-small-caps, font-synthesis-style, font-synthesis-weight, font-variant, font-variant-caps, font-variant-east-asian, font-variant-ligatures, font-variant-numeric, font-weight, grid-auto-columns, grid-auto-flow, grid-auto-rows, grid-column-end, grid-column-start, grid-row-end, grid-row-start, grid-template-areas, grid-template-columns, grid-template-rows, height, hyphens, image-orientation, image-rendering, inline-size, inset-block-end, inset-block-start, inset-inline-end, inset-inline-start, isolation, justify-content, justify-items, justify-self, left, letter-spacing, lighting-color, line-break, line-height, list-style-image, list-style-position, list-style-type, margin-block-end, margin-block-start, margin-bottom, margin-inline-end, margin-inline-start, margin-left, margin-right, margin-top, marker-end, marker-mid, marker-start, mask-type, max-block-size, max-height, max-inline-size, max-width, min-block-size, min-height, min-inline-size, min-width, mix-blend-mode, object-fit, object-position, offset-distance, offset-path, offset-rotate, opacity, order, orphans, outline-color, outline-offset, outline-style, outline-width, overflow-anchor, overflow-clip-margin, overflow-wrap, overflow-x, overflow-y, overscroll-behavior-block, overscroll-behavior-inline, padding-block-end, padding-block-start, padding-bottom, padding-inline-end, padding-inline-start, padding-left, padding-right, padding-top, paint-order, perspective, perspective-origin, pointer-events, position, r, resize, right, row-gap, ruby-position, rx, ry, scroll-behavior, scroll-margin-block-end, scroll-margin-block-start, scroll-margin-inline-end, scroll-margin-inline-start, scroll-padding-block-end, scroll-padding-block-start, scroll-padding-inline-end, scroll-padding-inline-start, scrollbar-gutter, shape-image-threshold, shape-margin, shape-outside, shape-rendering, speak, stop-color, stop-opacity, stroke, stroke-dasharray, stroke-dashoffset, stroke-linecap, stroke-linejoin, stroke-miterlimit, stroke-opacity, stroke-width, tab-size, table-layout, text-align, text-align-last, text-anchor, text-decoration, text-decoration-color, text-decoration-line, text-decoration-skip-ink, text-decoration-style, text-indent, text-overflow, text-rendering, text-shadow, text-size-adjust, text-transform, text-underline-position, top, touch-action, transform, transform-origin, transform-style, transition-delay, transition-duration, transition-property, transition-timing-function, unicode-bidi, user-select, vector-effect, vertical-align, visibility, white-space, widows, width, will-change, word-break, word-spacing, writing-mode, x, y, z-index, zoom, -webkit-border-horizontal-spacing, -webkit-border-image, -webkit-border-vertical-spacing, -webkit-box-align, -webkit-box-decoration-break, -webkit-box-direction, -webkit-box-flex, -webkit-box-ordinal-group, -webkit-box-orient, -webkit-box-pack, -webkit-box-reflect, -webkit-font-smoothing, -webkit-highlight, -webkit-hyphenate-character, -webkit-line-break, -webkit-line-clamp, -webkit-locale, -webkit-mask-box-image, -webkit-mask-box-image-outset, -webkit-mask-box-image-repeat, -webkit-mask-box-image-slice, -webkit-mask-box-image-source, -webkit-mask-box-image-width, -webkit-mask-clip, -webkit-mask-composite, -webkit-mask-image, -webkit-mask-origin, -webkit-mask-position, -webkit-mask-repeat, -webkit-mask-size, -webkit-print-color-adjust, -webkit-rtl-ordering, -webkit-tap-highlight-color, -webkit-text-combine, -webkit-text-decorations-in-effect, -webkit-text-emphasis-color, -webkit-text-emphasis-position, -webkit-text-emphasis-style, -webkit-text-fill-color, -webkit-text-orientation, -webkit-text-security, -webkit-text-stroke-color, -webkit-text-stroke-width, -webkit-user-drag, -webkit-user-modify, -webkit-writing-mode, accentColor, additiveSymbols, alignContent, alignItems, alignSelf, alignmentBaseline, all, animation, animationDelay, animationDirection, animationDuration, animationFillMode, animationIterationCount, animationName, animationPlayState, animationTimingFunction, appRegion, ascentOverride, aspectRatio, backdropFilter, backfaceVisibility, background, backgroundAttachment, backgroundBlendMode, backgroundClip, backgroundColor, backgroundImage, backgroundOrigin, backgroundPosition, backgroundPositionX, backgroundPositionY, backgroundRepeat, backgroundRepeatX, backgroundRepeatY, backgroundSize, baselineShift, blockSize, border, borderBlock, borderBlockColor, borderBlockEnd, borderBlockEndColor, borderBlockEndStyle, borderBlockEndWidth, borderBlockStart, borderBlockStartColor, borderBlockStartStyle, borderBlockStartWidth, borderBlockStyle, borderBlockWidth, borderBottom, borderBottomColor, borderBottomLeftRadius, borderBottomRightRadius, borderBottomStyle, borderBottomWidth, borderCollapse, borderColor, borderEndEndRadius, borderEndStartRadius, borderImage, borderImageOutset, borderImageRepeat, borderImageSlice, borderImageSource, borderImageWidth, borderInline, borderInlineColor, borderInlineEnd, borderInlineEndColor, borderInlineEndStyle, borderInlineEndWidth, borderInlineStart, borderInlineStartColor, borderInlineStartStyle, borderInlineStartWidth, borderInlineStyle, borderInlineWidth, borderLeft, borderLeftColor, borderLeftStyle, borderLeftWidth, borderRadius, borderRight, borderRightColor, borderRightStyle, borderRightWidth, borderSpacing, borderStartEndRadius, borderStartStartRadius, borderStyle, borderTop, borderTopColor, borderTopLeftRadius, borderTopRightRadius, borderTopStyle, borderTopWidth, borderWidth, boxShadow, boxSizing, breakAfter, breakBefore, breakInside, bufferedRendering, captionSide, caretColor, clipPath, clipRule, colorInterpolation, colorInterpolationFilters, colorRendering, colorScheme, columnCount, columnFill, columnGap, columnRule, columnRuleColor, columnRuleStyle, columnRuleWidth, columnSpan, columnWidth, columns, contain, containIntrinsicBlockSize, containIntrinsicHeight, containIntrinsicInlineSize, containIntrinsicSize, containIntrinsicWidth, contentVisibility, counterIncrement, counterReset, counterSet, descentOverride, dominantBaseline, emptyCells, fallback, fillOpacity, fillRule, flex, flexBasis, flexDirection, flexFlow, flexGrow, flexShrink, flexWrap, floodColor, floodOpacity, font, fontDisplay, fontFamily, fontFeatureSettings, fontKerning, fontOpticalSizing, fontSize, fontStretch, fontStyle, fontSynthesis, fontSynthesisSmallCaps, fontSynthesisStyle, fontSynthesisWeight, fontVariant, fontVariantCaps, fontVariantEastAsian, fontVariantLigatures, fontVariantNumeric, fontVariationSettings, fontWeight, forcedColorAdjust, gap, grid, gridArea, gridAutoColumns, gridAutoFlow, gridAutoRows, gridColumn, gridColumnEnd, gridColumnGap, gridColumnStart, gridGap, gridRow, gridRowEnd, gridRowGap, gridRowStart, gridTemplate, gridTemplateAreas, gridTemplateColumns, gridTemplateRows, imageOrientation, imageRendering, inherits, initialValue, inlineSize, inset, insetBlock, insetBlockEnd, insetBlockStart, insetInline, insetInlineEnd, insetInlineStart, justifyContent, justifyItems, justifySelf, letterSpacing, lightingColor, lineBreak, lineGapOverride, lineHeight, listStyle, listStyleImage, listStylePosition, listStyleType, margin, marginBlock, marginBlockEnd, marginBlockStart, marginBottom, marginInline, marginInlineEnd, marginInlineStart, marginLeft, marginRight, marginTop, marker, markerEnd, markerMid, markerStart, mask, maskType, maxBlockSize, maxHeight, maxInlineSize, maxWidth, maxZoom, minBlockSize, minHeight, minInlineSize, minWidth, minZoom, mixBlendMode, negative, objectFit, objectPosition, offset, offsetDistance, offsetPath, offsetRotate, orientation, outline, outlineColor, outlineOffset, outlineStyle, outlineWidth, overflow, overflowAnchor, overflowClipMargin, overflowWrap, overflowX, overflowY, overscrollBehavior, overscrollBehaviorBlock, overscrollBehaviorInline, overscrollBehaviorX, overscrollBehaviorY, pad, padding, paddingBlock, paddingBlockEnd, paddingBlockStart, paddingBottom, paddingInline, paddingInlineEnd, paddingInlineStart, paddingLeft, paddingRight, paddingTop, page, pageBreakAfter, pageBreakBefore, pageBreakInside, pageOrientation, paintOrder, perspectiveOrigin, placeContent, placeItems, placeSelf, pointerEvents, prefix, quotes, range, rowGap, rubyPosition, scrollBehavior, scrollMargin, scrollMarginBlock, scrollMarginBlockEnd, scrollMarginBlockStart, scrollMarginBottom, scrollMarginInline, scrollMarginInlineEnd, scrollMarginInlineStart, scrollMarginLeft, scrollMarginRight, scrollMarginTop, scrollPadding, scrollPaddingBlock, scrollPaddingBlockEnd, scrollPaddingBlockStart, scrollPaddingBottom, scrollPaddingInline, scrollPaddingInlineEnd, scrollPaddingInlineStart, scrollPaddingLeft, scrollPaddingRight, scrollPaddingTop, scrollSnapAlign, scrollSnapStop, scrollSnapType, scrollbarGutter, shapeImageThreshold, shapeMargin, shapeOutside, shapeRendering, size, sizeAdjust, speakAs, src, stopColor, stopOpacity, strokeDasharray, strokeDashoffset, strokeLinecap, strokeLinejoin, strokeMiterlimit, strokeOpacity, strokeWidth, suffix, symbols, syntax, system, tabSize, tableLayout, textAlign, textAlignLast, textAnchor, textCombineUpright, textDecoration, textDecorationColor, textDecorationLine, textDecorationSkipInk, textDecorationStyle, textDecorationThickness, textIndent, textOrientation, textOverflow, textRendering, textShadow, textSizeAdjust, textTransform, textUnderlineOffset, textUnderlinePosition, touchAction, transformBox, transformOrigin, transformStyle, transition, transitionDelay, transitionDuration, transitionProperty, transitionTimingFunction, unicodeBidi, unicodeRange, userSelect, userZoom, vectorEffect, verticalAlign, webkitAlignContent, webkitAlignItems, webkitAlignSelf, webkitAnimation, webkitAnimationDelay, webkitAnimationDirection, webkitAnimationDuration, webkitAnimationFillMode, webkitAnimationIterationCount, webkitAnimationName, webkitAnimationPlayState, webkitAnimationTimingFunction, webkitAppRegion, webkitAppearance, webkitBackfaceVisibility, webkitBackgroundClip, webkitBackgroundOrigin, webkitBackgroundSize, webkitBorderAfter, webkitBorderAfterColor, webkitBorderAfterStyle, webkitBorderAfterWidth, webkitBorderBefore, webkitBorderBeforeColor, webkitBorderBeforeStyle, webkitBorderBeforeWidth, webkitBorderBottomLeftRadius, webkitBorderBottomRightRadius, webkitBorderEnd, webkitBorderEndColor, webkitBorderEndStyle, webkitBorderEndWidth, webkitBorderHorizontalSpacing, webkitBorderImage, webkitBorderRadius, webkitBorderStart, webkitBorderStartColor, webkitBorderStartStyle, webkitBorderStartWidth, webkitBorderTopLeftRadius, webkitBorderTopRightRadius, webkitBorderVerticalSpacing, webkitBoxAlign, webkitBoxDecorationBreak, webkitBoxDirection, webkitBoxFlex, webkitBoxOrdinalGroup, webkitBoxOrient, webkitBoxPack, webkitBoxReflect, webkitBoxShadow, webkitBoxSizing, webkitClipPath, webkitColumnBreakAfter, webkitColumnBreakBefore, webkitColumnBreakInside, webkitColumnCount, webkitColumnGap, webkitColumnRule, webkitColumnRuleColor, webkitColumnRuleStyle, webkitColumnRuleWidth, webkitColumnSpan, webkitColumnWidth, webkitColumns, webkitFilter, webkitFlex, webkitFlexBasis, webkitFlexDirection, webkitFlexFlow, webkitFlexGrow, webkitFlexShrink, webkitFlexWrap, webkitFontFeatureSettings, webkitFontSmoothing, webkitHighlight, webkitHyphenateCharacter, webkitJustifyContent, webkitLineBreak, webkitLineClamp, webkitLocale, webkitLogicalHeight, webkitLogicalWidth, webkitMarginAfter, webkitMarginBefore, webkitMarginEnd, webkitMarginStart, webkitMask, webkitMaskBoxImage, webkitMaskBoxImageOutset, webkitMaskBoxImageRepeat, webkitMaskBoxImageSlice, webkitMaskBoxImageSource, webkitMaskBoxImageWidth, webkitMaskClip, webkitMaskComposite, webkitMaskImage, webkitMaskOrigin, webkitMaskPosition, webkitMaskPositionX, webkitMaskPositionY, webkitMaskRepeat, webkitMaskRepeatX, webkitMaskRepeatY, webkitMaskSize, webkitMaxLogicalHeight, webkitMaxLogicalWidth, webkitMinLogicalHeight, webkitMinLogicalWidth, webkitOpacity, webkitOrder, webkitPaddingAfter, webkitPaddingBefore, webkitPaddingEnd, webkitPaddingStart, webkitPerspective, webkitPerspectiveOrigin, webkitPerspectiveOriginX, webkitPerspectiveOriginY, webkitPrintColorAdjust, webkitRtlOrdering, webkitRubyPosition, webkitShapeImageThreshold, webkitShapeMargin, webkitShapeOutside, webkitTapHighlightColor, webkitTextCombine, webkitTextDecorationsInEffect, webkitTextEmphasis, webkitTextEmphasisColor, webkitTextEmphasisPosition, webkitTextEmphasisStyle, webkitTextFillColor, webkitTextOrientation, webkitTextSecurity, webkitTextSizeAdjust, webkitTextStroke, webkitTextStrokeColor, webkitTextStrokeWidth, webkitTransform, webkitTransformOrigin, webkitTransformOriginX, webkitTransformOriginY, webkitTransformOriginZ, webkitTransformStyle, webkitTransition, webkitTransitionDelay, webkitTransitionDuration, webkitTransitionProperty, webkitTransitionTimingFunction, webkitUserDrag, webkitUserModify, webkitUserSelect, webkitWritingMode, whiteSpace, willChange, wordBreak, wordSpacing, wordWrap, writingMode, zIndex, additive-symbols, ascent-override, aspect-ratio, background-position-x, background-position-y, background-repeat-x, background-repeat-y, border-block, border-block-color, border-block-end, border-block-start, border-block-style, border-block-width, border-bottom, border-color, border-image, border-inline, border-inline-color, border-inline-end, border-inline-start, border-inline-style, border-inline-width, border-left, border-radius, border-right, border-spacing, border-style, border-top, border-width, color-scheme, column-fill, column-rule, content-visibility, counter-increment, counter-reset, counter-set, descent-override, flex-flow, font-display, font-feature-settings, font-synthesis, font-variation-settings, forced-color-adjust, grid-area, grid-column, grid-column-gap, grid-gap, grid-row, grid-row-gap, grid-template, initial-value, inset-block, inset-inline, line-gap-override, list-style, margin-block, margin-inline, max-zoom, min-zoom, overscroll-behavior, overscroll-behavior-x, overscroll-behavior-y, padding-block, padding-inline, page-break-after, page-break-before, page-break-inside, page-orientation, place-content, place-items, place-self, scroll-margin, scroll-margin-block, scroll-margin-bottom, scroll-margin-inline, scroll-margin-left, scroll-margin-right, scroll-margin-top, scroll-padding, scroll-padding-block, scroll-padding-bottom, scroll-padding-inline, scroll-padding-left, scroll-padding-right, scroll-padding-top, scroll-snap-align, scroll-snap-stop, scroll-snap-type, size-adjust, speak-as, text-combine-upright, text-decoration-thickness, text-orientation, text-underline-offset, transform-box, unicode-range, user-zoom, -webkit-align-content, -webkit-align-items, -webkit-align-self, -webkit-animation, -webkit-animation-delay, -webkit-animation-direction, -webkit-animation-duration, -webkit-animation-fill-mode, -webkit-animation-iteration-count, -webkit-animation-name, -webkit-animation-play-state, -webkit-animation-timing-function, -webkit-app-region, -webkit-appearance, -webkit-backface-visibility, -webkit-background-clip, -webkit-background-origin, -webkit-background-size, -webkit-border-after, -webkit-border-after-color, -webkit-border-after-style, -webkit-border-after-width, -webkit-border-before, -webkit-border-before-color, -webkit-border-before-style, -webkit-border-before-width, -webkit-border-bottom-left-radius, -webkit-border-bottom-right-radius, -webkit-border-end, -webkit-border-end-color, -webkit-border-end-style, -webkit-border-end-width, -webkit-border-radius, -webkit-border-start, -webkit-border-start-color, -webkit-border-start-style, -webkit-border-start-width, -webkit-border-top-left-radius, -webkit-border-top-right-radius, -webkit-box-shadow, -webkit-box-sizing, -webkit-clip-path, -webkit-column-break-after, -webkit-column-break-before, -webkit-column-break-inside, -webkit-column-count, -webkit-column-gap, -webkit-column-rule, -webkit-column-rule-color, -webkit-column-rule-style, -webkit-column-rule-width, -webkit-column-span, -webkit-column-width, -webkit-columns, -webkit-filter, -webkit-flex, -webkit-flex-basis, -webkit-flex-direction, -webkit-flex-flow, -webkit-flex-grow, -webkit-flex-shrink, -webkit-flex-wrap, -webkit-font-feature-settings, -webkit-justify-content, -webkit-logical-height, -webkit-logical-width, -webkit-margin-after, -webkit-margin-before, -webkit-margin-end, -webkit-margin-start, -webkit-mask, -webkit-mask-position-x, -webkit-mask-position-y, -webkit-mask-repeat-x, -webkit-mask-repeat-y, -webkit-max-logical-height, -webkit-max-logical-width, -webkit-min-logical-height, -webkit-min-logical-width, -webkit-opacity, -webkit-order, -webkit-padding-after, -webkit-padding-before, -webkit-padding-end, -webkit-padding-start, -webkit-perspective, -webkit-perspective-origin, -webkit-perspective-origin-x, -webkit-perspective-origin-y, -webkit-ruby-position, -webkit-shape-image-threshold, -webkit-shape-margin, -webkit-shape-outside, -webkit-text-emphasis, -webkit-text-size-adjust, -webkit-text-stroke, -webkit-transform, -webkit-transform-origin, -webkit-transform-origin-x, -webkit-transform-origin-y, -webkit-transform-origin-z, -webkit-transform-style, -webkit-transition, -webkit-transition-delay, -webkit-transition-duration, -webkit-transition-property, -webkit-transition-timing-function, -webkit-user-select, word-wrap`,
			jsKeys: "Array.at, Array.concat, Array.copyWithin, Array.entries, Array.every, Array.fill, Array.filter, Array.find, Array.findIndex, Array.findLast, Array.findLastIndex, Array.flat, Array.flatMap, Array.forEach, Array.from, Array.includes, Array.indexOf, Array.isArray, Array.join, Array.keys, Array.lastIndexOf, Array.map, Array.of, Array.pop, Array.push, Array.reduce, Array.reduceRight, Array.reverse, Array.shift, Array.slice, Array.some, Array.sort, Array.splice, Array.toLocaleString, Array.toString, Array.unshift, Array.values, Atomics.add, Atomics.and, Atomics.compareExchange, Atomics.exchange, Atomics.isLockFree, Atomics.load, Atomics.notify, Atomics.or, Atomics.store, Atomics.sub, Atomics.wait, Atomics.waitAsync, Atomics.xor, BigInt.asIntN, BigInt.asUintN, BigInt.toLocaleString, BigInt.toString, BigInt.valueOf, Boolean.toString, Boolean.valueOf, Date.UTC, Date.getDate, Date.getDay, Date.getFullYear, Date.getHours, Date.getMilliseconds, Date.getMinutes, Date.getMonth, Date.getSeconds, Date.getTime, Date.getTimezoneOffset, Date.getUTCDate, Date.getUTCDay, Date.getUTCFullYear, Date.getUTCHours, Date.getUTCMilliseconds, Date.getUTCMinutes, Date.getUTCMonth, Date.getUTCSeconds, Date.getYear, Date.now, Date.parse, Date.setDate, Date.setFullYear, Date.setHours, Date.setMilliseconds, Date.setMinutes, Date.setMonth, Date.setSeconds, Date.setTime, Date.setUTCDate, Date.setUTCFullYear, Date.setUTCHours, Date.setUTCMilliseconds, Date.setUTCMinutes, Date.setUTCMonth, Date.setUTCSeconds, Date.setYear, Date.toDateString, Date.toGMTString, Date.toISOString, Date.toJSON, Date.toLocaleDateString, Date.toLocaleString, Date.toLocaleTimeString, Date.toString, Date.toTimeString, Date.toUTCString, Date.valueOf, Document.URL, Document.activeElement, Document.adoptNode, Document.adoptedStyleSheets, Document.alinkColor, Document.all, Document.anchors, Document.append, Document.applets, Document.bgColor, Document.body, Document.captureEvents, Document.caretRangeFromPoint, Document.characterSet, Document.charset, Document.childElementCount, Document.children, Document.clear, Document.close, Document.compatMode, Document.contentType, Document.cookie, Document.createAttribute, Document.createAttributeNS, Document.createCDATASection, Document.createComment, Document.createDocumentFragment, Document.createElement, Document.createElementNS, Document.createEvent, Document.createExpression, Document.createNSResolver, Document.createNodeIterator, Document.createProcessingInstruction, Document.createRange, Document.createTextNode, Document.createTreeWalker, Document.currentScript, Document.defaultView, Document.designMode, Document.dir, Document.doctype, Document.documentElement, Document.documentURI, Document.domain, Document.elementFromPoint, Document.elementsFromPoint, Document.embeds, Document.evaluate, Document.execCommand, Document.exitFullscreen, Document.exitPictureInPicture, Document.exitPointerLock, Document.featurePolicy, Document.fgColor, Document.firstElementChild, Document.fonts, Document.forms, Document.fragmentDirective, Document.fullscreen, Document.fullscreenElement, Document.fullscreenEnabled, Document.getAnimations, Document.getElementById, Document.getElementsByClassName, Document.getElementsByName, Document.getElementsByTagName, Document.getElementsByTagNameNS, Document.getSelection, Document.hasFocus, Document.head, Document.hidden, Document.images, Document.implementation, Document.importNode, Document.inputEncoding, Document.lastElementChild, Document.lastModified, Document.linkColor, Document.links, Document.onabort, Document.onanimationend, Document.onanimationiteration, Document.onanimationstart, Document.onauxclick, Document.onbeforecopy, Document.onbeforecut, Document.onbeforepaste, Document.onbeforexrselect, Document.onblur, Document.oncancel, Document.oncanplay, Document.oncanplaythrough, Document.onchange, Document.onclick, Document.onclose, Document.oncontextmenu, Document.oncopy, Document.oncuechange, Document.oncut, Document.ondblclick, Document.ondrag, Document.ondragend, Document.ondragenter, Document.ondragleave, Document.ondragover, Document.ondragstart, Document.ondrop, Document.ondurationchange, Document.onemptied, Document.onended, Document.onerror, Document.onfocus, Document.onformdata, Document.onfreeze, Document.onfullscreenchange, Document.onfullscreenerror, Document.ongotpointercapture, Document.oninput, Document.oninvalid, Document.onkeydown, Document.onkeypress, Document.onkeyup, Document.onload, Document.onloadeddata, Document.onloadedmetadata, Document.onloadstart, Document.onlostpointercapture, Document.onmousedown, Document.onmouseenter, Document.onmouseleave, Document.onmousemove, Document.onmouseout, Document.onmouseover, Document.onmouseup, Document.onmousewheel, Document.onpaste, Document.onpause, Document.onplay, Document.onplaying, Document.onpointercancel, Document.onpointerdown, Document.onpointerenter, Document.onpointerleave, Document.onpointerlockchange, Document.onpointerlockerror, Document.onpointermove, Document.onpointerout, Document.onpointerover, Document.onpointerrawupdate, Document.onpointerup, Document.onprogress, Document.onratechange, Document.onreadystatechange, Document.onreset, Document.onresize, Document.onresume, Document.onscroll, Document.onsearch, Document.onsecuritypolicyviolation, Document.onseeked, Document.onseeking, Document.onselect, Document.onselectionchange, Document.onselectstart, Document.onslotchange, Document.onstalled, Document.onsubmit, Document.onsuspend, Document.ontimeupdate, Document.ontoggle, Document.ontransitioncancel, Document.ontransitionend, Document.ontransitionrun, Document.ontransitionstart, Document.onvisibilitychange, Document.onvolumechange, Document.onwaiting, Document.onwebkitanimationend, Document.onwebkitanimationiteration, Document.onwebkitanimationstart, Document.onwebkitfullscreenchange, Document.onwebkitfullscreenerror, Document.onwebkittransitionend, Document.onwheel, Document.open, Document.pictureInPictureElement, Document.pictureInPictureEnabled, Document.plugins, Document.pointerLockElement, Document.prepend, Document.queryCommandEnabled, Document.queryCommandIndeterm, Document.queryCommandState, Document.queryCommandSupported, Document.queryCommandValue, Document.querySelector, Document.querySelectorAll, Document.readyState, Document.referrer, Document.releaseEvents, Document.replaceChildren, Document.rootElement, Document.scripts, Document.scrollingElement, Document.styleSheets, Document.timeline, Document.title, Document.visibilityState, Document.vlinkColor, Document.wasDiscarded, Document.webkitCancelFullScreen, Document.webkitCurrentFullScreenElement, Document.webkitExitFullscreen, Document.webkitFullscreenElement, Document.webkitFullscreenEnabled, Document.webkitHidden, Document.webkitIsFullScreen, Document.webkitVisibilityState, Document.write, Document.writeln, Document.xmlEncoding, Document.xmlStandalone, Document.xmlVersion, Element.after, Element.animate, Element.append, Element.ariaAtomic, Element.ariaAutoComplete, Element.ariaBusy, Element.ariaChecked, Element.ariaColCount, Element.ariaColIndex, Element.ariaColSpan, Element.ariaCurrent, Element.ariaDescription, Element.ariaDisabled, Element.ariaExpanded, Element.ariaHasPopup, Element.ariaHidden, Element.ariaKeyShortcuts, Element.ariaLabel, Element.ariaLevel, Element.ariaLive, Element.ariaModal, Element.ariaMultiLine, Element.ariaMultiSelectable, Element.ariaOrientation, Element.ariaPlaceholder, Element.ariaPosInSet, Element.ariaPressed, Element.ariaReadOnly, Element.ariaRelevant, Element.ariaRequired, Element.ariaRoleDescription, Element.ariaRowCount, Element.ariaRowIndex, Element.ariaRowSpan, Element.ariaSelected, Element.ariaSetSize, Element.ariaSort, Element.ariaValueMax, Element.ariaValueMin, Element.ariaValueNow, Element.ariaValueText, Element.assignedSlot, Element.attachShadow, Element.attributeStyleMap, Element.attributes, Element.before, Element.childElementCount, Element.children, Element.classList, Element.className, Element.clientHeight, Element.clientLeft, Element.clientTop, Element.clientWidth, Element.closest, Element.computedStyleMap, Element.elementTiming, Element.firstElementChild, Element.getAnimations, Element.getAttribute, Element.getAttributeNS, Element.getAttributeNames, Element.getAttributeNode, Element.getAttributeNodeNS, Element.getBoundingClientRect, Element.getClientRects, Element.getElementsByClassName, Element.getElementsByTagName, Element.getElementsByTagNameNS, Element.getInnerHTML, Element.hasAttribute, Element.hasAttributeNS, Element.hasAttributes, Element.hasPointerCapture, Element.id, Element.innerHTML, Element.insertAdjacentElement, Element.insertAdjacentHTML, Element.insertAdjacentText, Element.lastElementChild, Element.localName, Element.matches, Element.namespaceURI, Element.nextElementSibling, Element.onbeforecopy, Element.onbeforecut, Element.onbeforepaste, Element.onfullscreenchange, Element.onfullscreenerror, Element.onsearch, Element.onwebkitfullscreenchange, Element.onwebkitfullscreenerror, Element.outerHTML, Element.part, Element.prefix, Element.prepend, Element.previousElementSibling, Element.querySelector, Element.querySelectorAll, Element.releasePointerCapture, Element.remove, Element.removeAttribute, Element.removeAttributeNS, Element.removeAttributeNode, Element.replaceChildren, Element.replaceWith, Element.requestFullscreen, Element.requestPointerLock, Element.scroll, Element.scrollBy, Element.scrollHeight, Element.scrollIntoView, Element.scrollIntoViewIfNeeded, Element.scrollLeft, Element.scrollTo, Element.scrollTop, Element.scrollWidth, Element.setAttribute, Element.setAttributeNS, Element.setAttributeNode, Element.setAttributeNodeNS, Element.setPointerCapture, Element.shadowRoot, Element.slot, Element.tagName, Element.toggleAttribute, Element.webkitMatchesSelector, Element.webkitRequestFullScreen, Element.webkitRequestFullscreen, Error.captureStackTrace, Error.message, Error.stackTraceLimit, Error.toString, Function.apply, Function.bind, Function.call, Function.toString, Intl.Collator, Intl.DateTimeFormat, Intl.DisplayNames, Intl.ListFormat, Intl.Locale, Intl.NumberFormat, Intl.PluralRules, Intl.RelativeTimeFormat, Intl.Segmenter, Intl.getCanonicalLocales, Intl.v8BreakIterator, JSON.parse, JSON.stringify, Map.clear, Map.delete, Map.entries, Map.forEach, Map.get, Map.has, Map.keys, Map.set, Map.size, Map.values, Math.E, Math.LN10, Math.LN2, Math.LOG10E, Math.LOG2E, Math.PI, Math.SQRT1_2, Math.SQRT2, Math.abs, Math.acos, Math.acosh, Math.asin, Math.asinh, Math.atan, Math.atan2, Math.atanh, Math.cbrt, Math.ceil, Math.clz32, Math.cos, Math.cosh, Math.exp, Math.expm1, Math.floor, Math.fround, Math.hypot, Math.imul, Math.log, Math.log10, Math.log1p, Math.log2, Math.max, Math.min, Math.pow, Math.random, Math.round, Math.sign, Math.sin, Math.sinh, Math.sqrt, Math.tan, Math.tanh, Math.trunc, Number.EPSILON, Number.MAX_SAFE_INTEGER, Number.MAX_VALUE, Number.MIN_SAFE_INTEGER, Number.MIN_VALUE, Number.NEGATIVE_INFINITY, Number.NaN, Number.POSITIVE_INFINITY, Number.isFinite, Number.isInteger, Number.isNaN, Number.isSafeInteger, Number.parseFloat, Number.parseInt, Number.toExponential, Number.toFixed, Number.toLocaleString, Number.toPrecision, Number.toString, Number.valueOf, Object.__defineGetter__, Object.__defineSetter__, Object.__lookupGetter__, Object.__lookupSetter__, Object.__proto__, Object.assign, Object.create, Object.defineProperties, Object.defineProperty, Object.entries, Object.freeze, Object.fromEntries, Object.getOwnPropertyDescriptor, Object.getOwnPropertyDescriptors, Object.getOwnPropertyNames, Object.getOwnPropertySymbols, Object.getPrototypeOf, Object.hasOwn, Object.hasOwnProperty, Object.is, Object.isExtensible, Object.isFrozen, Object.isPrototypeOf, Object.isSealed, Object.keys, Object.preventExtensions, Object.propertyIsEnumerable, Object.seal, Object.setPrototypeOf, Object.toLocaleString, Object.toString, Object.valueOf, Object.values, Promise.all, Promise.allSettled, Promise.any, Promise.catch, Promise.finally, Promise.race, Promise.reject, Promise.resolve, Promise.then, Proxy.revocable, Reflect.apply, Reflect.construct, Reflect.defineProperty, Reflect.deleteProperty, Reflect.get, Reflect.getOwnPropertyDescriptor, Reflect.getPrototypeOf, Reflect.has, Reflect.isExtensible, Reflect.ownKeys, Reflect.preventExtensions, Reflect.set, Reflect.setPrototypeOf, RegExp.$&, RegExp.$', RegExp.$+, RegExp.$1, RegExp.$2, RegExp.$3, RegExp.$4, RegExp.$5, RegExp.$6, RegExp.$7, RegExp.$8, RegExp.$9, RegExp.$_, RegExp.$`, RegExp.compile, RegExp.dotAll, RegExp.exec, RegExp.flags, RegExp.global, RegExp.hasIndices, RegExp.ignoreCase, RegExp.input, RegExp.lastMatch, RegExp.lastParen, RegExp.leftContext, RegExp.multiline, RegExp.rightContext, RegExp.source, RegExp.sticky, RegExp.test, RegExp.toString, RegExp.unicode, Set.add, Set.clear, Set.delete, Set.entries, Set.forEach, Set.has, Set.keys, Set.size, Set.values, String.anchor, String.at, String.big, String.blink, String.bold, String.charAt, String.charCodeAt, String.codePointAt, String.concat, String.endsWith, String.fixed, String.fontcolor, String.fontsize, String.fromCharCode, String.fromCodePoint, String.includes, String.indexOf, String.italics, String.lastIndexOf, String.link, String.localeCompare, String.match, String.matchAll, String.normalize, String.padEnd, String.padStart, String.raw, String.repeat, String.replace, String.replaceAll, String.search, String.slice, String.small, String.split, String.startsWith, String.strike, String.sub, String.substr, String.substring, String.sup, String.toLocaleLowerCase, String.toLocaleUpperCase, String.toLowerCase, String.toString, String.toUpperCase, String.trim, String.trimEnd, String.trimLeft, String.trimRight, String.trimStart, String.valueOf, Symbol.asyncIterator, Symbol.description, Symbol.for, Symbol.hasInstance, Symbol.isConcatSpreadable, Symbol.iterator, Symbol.keyFor, Symbol.match, Symbol.matchAll, Symbol.replace, Symbol.search, Symbol.species, Symbol.split, Symbol.toPrimitive, Symbol.toString, Symbol.toStringTag, Symbol.unscopables, Symbol.valueOf, WeakMap.delete, WeakMap.get, WeakMap.has, WeakMap.set, WeakSet.add, WeakSet.delete, WeakSet.has, WebAssembly.CompileError, WebAssembly.Exception, WebAssembly.Global, WebAssembly.Instance, WebAssembly.LinkError, WebAssembly.Memory, WebAssembly.Module, WebAssembly.RuntimeError, WebAssembly.Table, WebAssembly.Tag, WebAssembly.compile, WebAssembly.compileStreaming, WebAssembly.instantiate, WebAssembly.instantiateStreaming, WebAssembly.validate",
		},
		'Firefox': {
			version: 94,
			windowKeys: `undefined, globalThis, Array, Boolean, JSON, Date, Math, Number, String, RegExp, Error, InternalError, AggregateError, EvalError, RangeError, ReferenceError, SyntaxError, TypeError, URIError, ArrayBuffer, Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array, Uint8ClampedArray, BigInt64Array, BigUint64Array, BigInt, Proxy, WeakMap, Set, DataView, Symbol, Intl, Reflect, WeakSet, Atomics, Promise, ReadableStream, ByteLengthQueuingStrategy, CountQueuingStrategy, WebAssembly, FinalizationRegistry, WeakRef, NaN, Infinity, isNaN, isFinite, parseFloat, parseInt, escape, unescape, decodeURI, encodeURI, decodeURIComponent, encodeURIComponent, TimeRanges, GeolocationCoordinates, HTMLLinkElement, SVGImageElement, RTCTrackEvent, ServiceWorkerContainer, DOMMatrixReadOnly, ResizeObserverSize, Audio, MediaQueryList, MediaStreamTrackAudioSourceNode, HTMLOListElement, PerformanceMeasure, HTMLMetaElement, GamepadPose, MediaStreamAudioDestinationNode, VisualViewport, CSSAnimation, PerformanceMark, RTCDTMFToneChangeEvent, RTCDTMFSender, MediaCapabilities, UIEvent, HashChangeEvent, HTMLParagraphElement, WebSocket, DynamicsCompressorNode, PerformanceResourceTiming, StorageEvent, ResizeObserverEntry, HTMLFieldSetElement, TextDecoder, Option, RTCRtpTransceiver, PerformanceObserver, ChannelSplitterNode, TimeEvent, HTMLIFrameElement, IDBKeyRange, CharacterData, MediaDevices, MediaRecorder, IDBMutableFile, Directory, HTMLSourceElement, MediaKeySession, BeforeUnloadEvent, SVGLength, FileSystem, WebKitCSSMatrix, SVGPolygonElement, HTMLObjectElement, CSSMediaRule, OfflineResourceList, SVGPreserveAspectRatio, IDBRequest, InputEvent, ImageData, DelayNode, VideoPlaybackQuality, HTMLMapElement, XMLDocument, ProgressEvent, TreeWalker, HTMLCollection, HTMLQuoteElement, PerformanceEntry, ValidityState, MediaRecorderErrorEvent, AudioListener, SVGFEColorMatrixElement, SVGAnimatedNumber, HTMLTableSectionElement, MutationEvent, HTMLLabelElement, WebGLRenderingContext, MouseScrollEvent, VRDisplay, DeviceMotionEvent, HTMLBaseElement, FileSystemFileEntry, SVGNumberList, CSSFontFeatureValuesRule, HTMLTimeElement, WebGLFramebuffer, mozRTCSessionDescription, SVGFEDropShadowElement, DeviceOrientationEvent, MessageChannel, RTCSessionDescription, PopStateEvent, Worklet, Plugin, GamepadEvent, RTCDataChannel, Screen, PaintRequestList, SVGLengthList, VRPose, ChannelMergerNode, SVGFEFuncRElement, XPathExpression, GamepadHapticActuator, VRDisplayCapabilities, VRFieldOfView, DOMRect, SharedWorker, HTMLBRElement, MediaDeviceInfo, SpeechSynthesisVoice, WebGLShaderPrecisionFormat, SVGSymbolElement, MessageEvent, AuthenticatorAttestationResponse, HTMLSelectElement, SVGTransformList, MediaList, SVGDefsElement, SVGDescElement, HTMLOptionElement, HTMLMarqueeElement, SubtleCrypto, mozRTCIceCandidate, WebGLVertexArrayObject, PerformanceTiming, U2F, AbstractRange, CSSFontFaceRule, HTMLAllCollection, KeyframeEffect, WebGLTransformFeedback, HTMLOptionsCollection, RTCPeerConnection, SpeechSynthesis, SVGGElement, SVGFEDistantLightElement, SVGAnimatedPreserveAspectRatio, HTMLVideoElement, ImageBitmap, DOMMatrix, SVGUnitTypes, SVGCircleElement, HTMLEmbedElement, SVGScriptElement, HTMLCanvasElement, HTMLModElement, AudioParamMap, CSSTransition, HTMLOutputElement, CustomEvent, ServiceWorker, Animation, WebGLSync, MediaKeyError, MediaKeys, DOMRectList, HTMLElement, Cache, DOMQuad, PaintRequest, Text, Geolocation, RTCDtlsTransport, XSLTProcessor, PerformanceNavigation, NodeIterator, SVGAnimatedBoolean, HTMLLegendElement, CSSRule, Crypto, SVGFETurbulenceElement, XMLSerializer, CacheStorage, SourceBuffer, SVGStopElement, SVGFEMergeElement, DataTransfer, ScrollAreaEvent, SVGFEDiffuseLightingElement, MediaKeyStatusMap, XMLHttpRequest, SVGAnimatedLengthList, IDBDatabase, SVGFEFloodElement, MediaStreamEvent, SVGGraphicsElement, ErrorEvent, Response, KeyboardEvent, SubmitEvent, SVGFEMorphologyElement, MimeTypeArray, HTMLUnknownElement, WebGLBuffer, AbortSignal, Element, SVGElement, MediaError, DOMTokenList, HTMLTrackElement, PerformanceServerTiming, Credential, PageTransitionEvent, Attr, PermissionStatus, IDBVersionChangeEvent, HTMLHeadingElement, FileSystemDirectoryEntry, OfflineAudioContext, AnimationTimeline, CSSMozDocumentRule, SVGMatrix, HTMLTableCaptionElement, SVGMetadataElement, SVGFEImageElement, EventSource, SVGFEFuncAElement, Blob, VRFrameData, HTMLMediaElement, MediaMetadata, SVGRect, BarProp, FocusEvent, SVGAngle, PerformanceEventTiming, WebGLShader, HTMLProgressElement, PublicKeyCredential, IntersectionObserver, IDBCursorWithValue, SVGLinearGradientElement, ScreenOrientation, PushSubscriptionOptions, HTMLImageElement, IIRFilterNode, ConstantSourceNode, IDBFileHandle, TextEncoder, PopupBlockedEvent, DOMPointReadOnly, MediaStream, AuthenticatorResponse, IDBIndex, AnimationEvent, TextTrackCue, webkitURL, HTMLPictureElement, CDATASection, ProcessingInstruction, ResizeObserver, IdleDeadline, DOMRequest, CustomElementRegistry, FileList, WaveShaperNode, XPathResult, MediaKeyMessageEvent, MathMLElement, HTMLFrameElement, SVGMarkerElement, VREyeParameters, RTCRtpReceiver, VRDisplayEvent, FontFaceSet, DocumentFragment, MediaSource, DOMStringMap, HTMLDetailsElement, SVGAnimatedNumberList, Path2D, CompositionEvent, SVGUseElement, StyleSheet, TextTrackList, HTMLTableCellElement, AbortController, AudioScheduledSourceNode, SourceBufferList, RTCPeerConnectionIceEvent, VRStageParameters, XMLHttpRequestEventTarget, FormData, SVGMaskElement, NodeList, DataTransferItemList, FileSystemEntry, IDBTransaction, HTMLSpanElement, TransitionEvent, HTMLTableRowElement, SVGFESpecularLightingElement, HTMLSlotElement, IDBObjectStore, DOMImplementation, CSSImportRule, SVGAnimatedLength, HTMLDListElement, FontFace, HTMLAnchorElement, SVGFEGaussianBlurElement, NodeFilter, WebGLTexture, DOMPoint, MessagePort, SVGAnimatedRect, MediaKeySystemAccess, WheelEvent, AudioDestinationNode, DOMRectReadOnly, IDBCursor, MediaElementAudioSourceNode, History, HTMLHtmlElement, HTMLTableElement, SVGTextContentElement, XMLHttpRequestUpload, IDBOpenDBRequest, MediaStreamTrackEvent, SVGSetElement, FormDataEvent, URLSearchParams, SVGAnimationElement, HTMLTemplateElement, HTMLParamElement, ElementInternals, Selection, SVGLineElement, HTMLScriptElement, MediaStreamTrack, CSSGroupingRule, ScriptProcessorNode, CSSSupportsRule, Range, SVGGeometryElement, MutationRecord, HTMLMenuElement, HTMLUListElement, HTMLTableColElement, HTMLFrameSetElement, SVGFEPointLightElement, CanvasRenderingContext2D, Clipboard, HTMLButtonElement, CSSKeyframesRule, ShadowRoot, SVGEllipseElement, IntersectionObserverEntry, SVGComponentTransferFunctionElement, mozRTCPeerConnection, CSS2Properties, WebGLUniformLocation, PeriodicWave, Gamepad, SVGClipPathElement, HTMLPreElement, SVGPathElement, DataTransferItem, HTMLFormElement, GainNode, SVGFEFuncBElement, RTCIceCandidate, SVGFETileElement, ServiceWorkerRegistration, RadioNodeList, SVGMPathElement, KeyEvent, PointerEvent, SVGFESpotLightElement, Worker, Location, RTCStatsReport, SVGAnimatedString, HTMLDirectoryElement, WebGLQuery, HTMLFormControlsCollection, AudioNode, CaretPosition, SVGStyleElement, HTMLDataListElement, SVGTextPositioningElement, SVGAnimatedInteger, Storage, AuthenticatorAssertionResponse, MimeType, DOMException, AnimationEffect, SVGTextPathElement, GeolocationPositionError, CSSNamespaceRule, SVGPoint, SVGFECompositeElement, SVGGradientElement, SVGAnimatedTransformList, MediaStreamAudioSourceNode, CSS, WebGLRenderbuffer, RTCDataChannelEvent, HTMLLIElement, TextTrackCueList, HTMLTitleElement, MutationObserver, Comment, BroadcastChannel, MediaSession, SVGFEComponentTransferElement, HTMLHRElement, HTMLTextAreaElement, HTMLMeterElement, SVGAnimatedAngle, MediaQueryListEvent, WebGL2RenderingContext, TextTrack, VTTCue, CloseEvent, SpeechSynthesisErrorEvent, Headers, BiquadFilterNode, AudioWorklet, IDBFileRequest, MouseEvent, WebGLContextEvent, IDBFactory, NamedNodeMap, SVGSVGElement, SVGRadialGradientElement, TextMetrics, SVGAnimateMotionElement, PushSubscription, CryptoKey, CredentialsContainer, ClipboardEvent, PerformancePaintTiming, PushManager, OfflineAudioCompletionEvent, DOMStringList, SVGPatternElement, RTCCertificate, DocumentType, Request, DocumentTimeline, SVGTSpanElement, SVGTitleElement, StyleSheetList, RTCRtpSender, GamepadButton, ConvolverNode, HTMLAudioElement, HTMLDataElement, AudioProcessingEvent, StaticRange, SVGAnimateTransformElement, AudioBufferSourceNode, SVGAElement, WebGLActiveInfo, XPathEvaluator, SVGFEConvolveMatrixElement, Navigator, SVGRectElement, URL, CSSKeyframeRule, console, SVGAnimatedEnumeration, AnalyserNode, HTMLInputElement, SVGStringList, SVGFEOffsetElement, PannerNode, File, CSSStyleRule, AudioParam, AudioWorkletNode, SpeechSynthesisUtterance, HTMLFontElement, AudioBuffer, SecurityPolicyViolationEvent, DOMParser, CanvasCaptureMediaStream, PerformanceObserverEntryList, SVGNumber, FileSystemDirectoryReader, GeolocationPosition, BaseAudioContext, CSSStyleSheet, SVGFilterElement, HTMLHeadElement, SVGTransform, MediaCapabilitiesInfo, CSSRuleList, SVGFEMergeNodeElement, HTMLAreaElement, SVGTextElement, SVGSwitchElement, Permissions, AnimationPlaybackEvent, CanvasGradient, VTTRegion, MediaEncryptedEvent, WebGLSampler, CSSPageRule, AudioContext, SVGPathSegList, FileReader, SVGPolylineElement, CSSCounterStyleRule, CSSConditionRule, BlobEvent, DragEvent, ImageBitmapRenderingContext, SVGViewElement, SVGFEBlendElement, PluginArray, SVGFEDisplacementMapElement, HTMLOptGroupElement, HTMLDivElement, PromiseRejectionEvent, CSSStyleDeclaration, SVGAnimateElement, CanvasPattern, WebGLProgram, TrackEvent, SpeechSynthesisEvent, Notification, HTMLBodyElement, HTMLStyleElement, SVGFEFuncGElement, StorageManager, Image, FontFaceSetLoadEvent, SVGPointList, StereoPannerNode, OscillatorNode, SVGForeignObjectElement, Function, Object, eval, EventTarget, Window, close, stop, focus, blur, open, alert, confirm, prompt, print, postMessage, captureEvents, releaseEvents, getSelection, getComputedStyle, matchMedia, moveTo, moveBy, resizeTo, resizeBy, scroll, scrollTo, scrollBy, requestAnimationFrame, cancelAnimationFrame, getDefaultComputedStyle, scrollByLines, scrollByPages, sizeToContent, updateCommands, find, dump, setResizable, requestIdleCallback, cancelIdleCallback, reportError, btoa, atob, setTimeout, clearTimeout, setInterval, clearInterval, queueMicrotask, createImageBitmap, structuredClone, fetch, self, name, history, customElements, locationbar, menubar, personalbar, scrollbars, statusbar, toolbar, status, closed, event, frames, length, opener, parent, frameElement, navigator, clientInformation, external, applicationCache, screen, innerWidth, innerHeight, scrollX, pageXOffset, scrollY, pageYOffset, screenLeft, screenTop, screenX, screenY, outerWidth, outerHeight, performance, mozInnerScreenX, mozInnerScreenY, devicePixelRatio, scrollMaxX, scrollMaxY, fullScreen, ondevicemotion, ondeviceorientation, onabsolutedeviceorientation, content, InstallTrigger, sidebar, onvrdisplayconnect, onvrdisplaydisconnect, onvrdisplayactivate, onvrdisplaydeactivate, onvrdisplaypresentchange, visualViewport, crypto, onabort, onblur, onfocus, onauxclick, onbeforeinput, oncanplay, oncanplaythrough, onchange, onclick, onclose, oncontextmenu, oncuechange, ondblclick, ondrag, ondragend, ondragenter, ondragexit, ondragleave, ondragover, ondragstart, ondrop, ondurationchange, onemptied, onended, onformdata, oninput, oninvalid, onkeydown, onkeypress, onkeyup, onload, onloadeddata, onloadedmetadata, onloadend, onloadstart, onmousedown, onmouseenter, onmouseleave, onmousemove, onmouseout, onmouseover, onmouseup, onwheel, onpause, onplay, onplaying, onprogress, onratechange, onreset, onresize, onscroll, onsecuritypolicyviolation, onseeked, onseeking, onselect, onslotchange, onstalled, onsubmit, onsuspend, ontimeupdate, onvolumechange, onwaiting, onselectstart, onselectionchange, ontoggle, onpointercancel, onpointerdown, onpointerup, onpointermove, onpointerout, onpointerover, onpointerenter, onpointerleave, ongotpointercapture, onlostpointercapture, onmozfullscreenchange, onmozfullscreenerror, onanimationcancel, onanimationend, onanimationiteration, onanimationstart, ontransitioncancel, ontransitionend, ontransitionrun, ontransitionstart, onwebkitanimationend, onwebkitanimationiteration, onwebkitanimationstart, onwebkittransitionend, u2f, onerror, speechSynthesis, onafterprint, onbeforeprint, onbeforeunload, onhashchange, onlanguagechange, onmessage, onmessageerror, onoffline, ononline, onpagehide, onpageshow, onpopstate, onrejectionhandled, onstorage, onunhandledrejection, onunload, ongamepadconnected, ongamepaddisconnected, localStorage, origin, crossOriginIsolated, isSecureContext, indexedDB, caches, sessionStorage, window, document, location, top, netscape, Node, Document, HTMLDocument, EventCounts, Map, Event`,
			cssKeys: `alignContent, align-content, alignItems, align-items, alignSelf, align-self, aspectRatio, aspect-ratio, backfaceVisibility, backface-visibility, borderCollapse, border-collapse, borderImageRepeat, border-image-repeat, boxDecorationBreak, box-decoration-break, boxSizing, box-sizing, breakInside, break-inside, captionSide, caption-side, clear, colorAdjust, color-adjust, colorInterpolation, color-interpolation, colorInterpolationFilters, color-interpolation-filters, columnCount, column-count, columnFill, column-fill, columnSpan, column-span, contain, direction, display, dominantBaseline, dominant-baseline, emptyCells, empty-cells, flexDirection, flex-direction, flexWrap, flex-wrap, cssFloat, float, fontKerning, font-kerning, fontOpticalSizing, font-optical-sizing, fontSizeAdjust, font-size-adjust, fontStretch, font-stretch, fontStyle, font-style, fontSynthesis, font-synthesis, fontVariantCaps, font-variant-caps, fontVariantEastAsian, font-variant-east-asian, fontVariantLigatures, font-variant-ligatures, fontVariantNumeric, font-variant-numeric, fontVariantPosition, font-variant-position, fontWeight, font-weight, gridAutoFlow, grid-auto-flow, hyphens, imageOrientation, image-orientation, imageRendering, image-rendering, imeMode, ime-mode, isolation, justifyContent, justify-content, justifyItems, justify-items, justifySelf, justify-self, lineBreak, line-break, listStylePosition, list-style-position, maskType, mask-type, mixBlendMode, mix-blend-mode, MozBoxAlign, -moz-box-align, MozBoxDirection, -moz-box-direction, MozBoxOrient, -moz-box-orient, MozBoxPack, -moz-box-pack, MozFloatEdge, -moz-float-edge, MozForceBrokenImageIcon, -moz-force-broken-image-icon, MozOrient, -moz-orient, MozTextSizeAdjust, -moz-text-size-adjust, MozUserFocus, -moz-user-focus, MozUserInput, -moz-user-input, MozUserModify, -moz-user-modify, MozWindowDragging, -moz-window-dragging, objectFit, object-fit, offsetRotate, offset-rotate, outlineStyle, outline-style, overflowAnchor, overflow-anchor, overflowWrap, overflow-wrap, paintOrder, paint-order, pointerEvents, pointer-events, position, resize, rubyAlign, ruby-align, rubyPosition, ruby-position, scrollBehavior, scroll-behavior, scrollSnapAlign, scroll-snap-align, scrollSnapType, scroll-snap-type, scrollbarWidth, scrollbar-width, shapeRendering, shape-rendering, strokeLinecap, stroke-linecap, strokeLinejoin, stroke-linejoin, tableLayout, table-layout, textAlign, text-align, textAlignLast, text-align-last, textAnchor, text-anchor, textCombineUpright, text-combine-upright, textDecorationLine, text-decoration-line, textDecorationSkipInk, text-decoration-skip-ink, textDecorationStyle, text-decoration-style, textEmphasisPosition, text-emphasis-position, textJustify, text-justify, textOrientation, text-orientation, textRendering, text-rendering, textTransform, text-transform, textUnderlinePosition, text-underline-position, touchAction, touch-action, transformBox, transform-box, transformStyle, transform-style, unicodeBidi, unicode-bidi, userSelect, user-select, vectorEffect, vector-effect, visibility, webkitLineClamp, WebkitLineClamp, -webkit-line-clamp, whiteSpace, white-space, wordBreak, word-break, writingMode, writing-mode, zIndex, z-index, appearance, breakAfter, break-after, breakBefore, break-before, clipRule, clip-rule, fillRule, fill-rule, fillOpacity, fill-opacity, strokeOpacity, stroke-opacity, MozBoxOrdinalGroup, -moz-box-ordinal-group, order, flexGrow, flex-grow, flexShrink, flex-shrink, MozBoxFlex, -moz-box-flex, strokeMiterlimit, stroke-miterlimit, overflowBlock, overflow-block, overflowInline, overflow-inline, overflowX, overflow-x, overflowY, overflow-y, overscrollBehaviorBlock, overscroll-behavior-block, overscrollBehaviorInline, overscroll-behavior-inline, overscrollBehaviorX, overscroll-behavior-x, overscrollBehaviorY, overscroll-behavior-y, floodOpacity, flood-opacity, opacity, shapeImageThreshold, shape-image-threshold, stopOpacity, stop-opacity, borderBlockEndStyle, border-block-end-style, borderBlockStartStyle, border-block-start-style, borderBottomStyle, border-bottom-style, borderInlineEndStyle, border-inline-end-style, borderInlineStartStyle, border-inline-start-style, borderLeftStyle, border-left-style, borderRightStyle, border-right-style, borderTopStyle, border-top-style, columnRuleStyle, column-rule-style, accentColor, accent-color, animationDelay, animation-delay, animationDirection, animation-direction, animationDuration, animation-duration, animationFillMode, animation-fill-mode, animationIterationCount, animation-iteration-count, animationName, animation-name, animationPlayState, animation-play-state, animationTimingFunction, animation-timing-function, backgroundAttachment, background-attachment, backgroundBlendMode, background-blend-mode, backgroundClip, background-clip, backgroundImage, background-image, backgroundOrigin, background-origin, backgroundPositionX, background-position-x, backgroundPositionY, background-position-y, backgroundRepeat, background-repeat, backgroundSize, background-size, borderImageOutset, border-image-outset, borderImageSlice, border-image-slice, borderImageWidth, border-image-width, borderSpacing, border-spacing, boxShadow, box-shadow, caretColor, caret-color, clipPath, clip-path, color, columnWidth, column-width, content, counterIncrement, counter-increment, cursor, filter, flexBasis, flex-basis, fontFamily, font-family, fontFeatureSettings, font-feature-settings, fontLanguageOverride, font-language-override, fontSize, font-size, fontVariantAlternates, font-variant-alternates, fontVariationSettings, font-variation-settings, gridTemplateAreas, grid-template-areas, letterSpacing, letter-spacing, lineHeight, line-height, listStyleType, list-style-type, maskClip, mask-clip, maskComposite, mask-composite, maskImage, mask-image, maskMode, mask-mode, maskOrigin, mask-origin, maskPositionX, mask-position-x, maskPositionY, mask-position-y, maskRepeat, mask-repeat, maskSize, mask-size, offsetAnchor, offset-anchor, offsetPath, offset-path, perspective, quotes, rotate, scale, scrollbarColor, scrollbar-color, shapeOutside, shape-outside, strokeDasharray, stroke-dasharray, strokeDashoffset, stroke-dashoffset, strokeWidth, stroke-width, tabSize, tab-size, textDecorationThickness, text-decoration-thickness, textEmphasisStyle, text-emphasis-style, textOverflow, text-overflow, textShadow, text-shadow, transitionDelay, transition-delay, transitionDuration, transition-duration, transitionProperty, transition-property, transitionTimingFunction, transition-timing-function, translate, verticalAlign, vertical-align, willChange, will-change, wordSpacing, word-spacing, clip, MozImageRegion, -moz-image-region, objectPosition, object-position, perspectiveOrigin, perspective-origin, fill, stroke, transformOrigin, transform-origin, counterReset, counter-reset, counterSet, counter-set, gridTemplateColumns, grid-template-columns, gridTemplateRows, grid-template-rows, borderImageSource, border-image-source, listStyleImage, list-style-image, gridAutoColumns, grid-auto-columns, gridAutoRows, grid-auto-rows, transform, columnGap, column-gap, rowGap, row-gap, markerEnd, marker-end, markerMid, marker-mid, markerStart, marker-start, gridColumnEnd, grid-column-end, gridColumnStart, grid-column-start, gridRowEnd, grid-row-end, gridRowStart, grid-row-start, maxBlockSize, max-block-size, maxHeight, max-height, maxInlineSize, max-inline-size, maxWidth, max-width, cx, cy, offsetDistance, offset-distance, textIndent, text-indent, x, y, borderBottomLeftRadius, border-bottom-left-radius, borderBottomRightRadius, border-bottom-right-radius, borderEndEndRadius, border-end-end-radius, borderEndStartRadius, border-end-start-radius, borderStartEndRadius, border-start-end-radius, borderStartStartRadius, border-start-start-radius, borderTopLeftRadius, border-top-left-radius, borderTopRightRadius, border-top-right-radius, blockSize, block-size, height, inlineSize, inline-size, minBlockSize, min-block-size, minHeight, min-height, minInlineSize, min-inline-size, minWidth, min-width, width, outlineOffset, outline-offset, scrollMarginBlockEnd, scroll-margin-block-end, scrollMarginBlockStart, scroll-margin-block-start, scrollMarginBottom, scroll-margin-bottom, scrollMarginInlineEnd, scroll-margin-inline-end, scrollMarginInlineStart, scroll-margin-inline-start, scrollMarginLeft, scroll-margin-left, scrollMarginRight, scroll-margin-right, scrollMarginTop, scroll-margin-top, paddingBlockEnd, padding-block-end, paddingBlockStart, padding-block-start, paddingBottom, padding-bottom, paddingInlineEnd, padding-inline-end, paddingInlineStart, padding-inline-start, paddingLeft, padding-left, paddingRight, padding-right, paddingTop, padding-top, r, shapeMargin, shape-margin, rx, ry, scrollPaddingBlockEnd, scroll-padding-block-end, scrollPaddingBlockStart, scroll-padding-block-start, scrollPaddingBottom, scroll-padding-bottom, scrollPaddingInlineEnd, scroll-padding-inline-end, scrollPaddingInlineStart, scroll-padding-inline-start, scrollPaddingLeft, scroll-padding-left, scrollPaddingRight, scroll-padding-right, scrollPaddingTop, scroll-padding-top, borderBlockEndWidth, border-block-end-width, borderBlockStartWidth, border-block-start-width, borderBottomWidth, border-bottom-width, borderInlineEndWidth, border-inline-end-width, borderInlineStartWidth, border-inline-start-width, borderLeftWidth, border-left-width, borderRightWidth, border-right-width, borderTopWidth, border-top-width, columnRuleWidth, column-rule-width, outlineWidth, outline-width, webkitTextStrokeWidth, WebkitTextStrokeWidth, -webkit-text-stroke-width, bottom, insetBlockEnd, inset-block-end, insetBlockStart, inset-block-start, insetInlineEnd, inset-inline-end, insetInlineStart, inset-inline-start, left, marginBlockEnd, margin-block-end, marginBlockStart, margin-block-start, marginBottom, margin-bottom, marginInlineEnd, margin-inline-end, marginInlineStart, margin-inline-start, marginLeft, margin-left, marginRight, margin-right, marginTop, margin-top, right, textUnderlineOffset, text-underline-offset, top, backgroundColor, background-color, borderBlockEndColor, border-block-end-color, borderBlockStartColor, border-block-start-color, borderBottomColor, border-bottom-color, borderInlineEndColor, border-inline-end-color, borderInlineStartColor, border-inline-start-color, borderLeftColor, border-left-color, borderRightColor, border-right-color, borderTopColor, border-top-color, columnRuleColor, column-rule-color, floodColor, flood-color, lightingColor, lighting-color, outlineColor, outline-color, stopColor, stop-color, textDecorationColor, text-decoration-color, textEmphasisColor, text-emphasis-color, webkitTextFillColor, WebkitTextFillColor, -webkit-text-fill-color, webkitTextStrokeColor, WebkitTextStrokeColor, -webkit-text-stroke-color, background, backgroundPosition, background-position, borderColor, border-color, borderStyle, border-style, borderWidth, border-width, borderTop, border-top, borderRight, border-right, borderBottom, border-bottom, borderLeft, border-left, borderBlockStart, border-block-start, borderBlockEnd, border-block-end, borderInlineStart, border-inline-start, borderInlineEnd, border-inline-end, border, borderRadius, border-radius, borderImage, border-image, borderBlockWidth, border-block-width, borderBlockStyle, border-block-style, borderBlockColor, border-block-color, borderInlineWidth, border-inline-width, borderInlineStyle, border-inline-style, borderInlineColor, border-inline-color, borderBlock, border-block, borderInline, border-inline, overflow, transition, animation, overscrollBehavior, overscroll-behavior, pageBreakBefore, page-break-before, pageBreakAfter, page-break-after, pageBreakInside, page-break-inside, offset, columns, columnRule, column-rule, font, fontVariant, font-variant, marker, textEmphasis, text-emphasis, webkitTextStroke, WebkitTextStroke, -webkit-text-stroke, listStyle, list-style, margin, marginBlock, margin-block, marginInline, margin-inline, scrollMargin, scroll-margin, scrollMarginBlock, scroll-margin-block, scrollMarginInline, scroll-margin-inline, outline, padding, paddingBlock, padding-block, paddingInline, padding-inline, scrollPadding, scroll-padding, scrollPaddingBlock, scroll-padding-block, scrollPaddingInline, scroll-padding-inline, flexFlow, flex-flow, flex, gap, gridRow, grid-row, gridColumn, grid-column, gridArea, grid-area, gridTemplate, grid-template, grid, placeContent, place-content, placeSelf, place-self, placeItems, place-items, inset, insetBlock, inset-block, insetInline, inset-inline, mask, maskPosition, mask-position, textDecoration, text-decoration, all, webkitBackgroundClip, WebkitBackgroundClip, -webkit-background-clip, webkitBackgroundOrigin, WebkitBackgroundOrigin, -webkit-background-origin, webkitBackgroundSize, WebkitBackgroundSize, -webkit-background-size, MozBorderStartColor, -moz-border-start-color, MozBorderStartStyle, -moz-border-start-style, MozBorderStartWidth, -moz-border-start-width, MozBorderEndColor, -moz-border-end-color, MozBorderEndStyle, -moz-border-end-style, MozBorderEndWidth, -moz-border-end-width, webkitBorderTopLeftRadius, WebkitBorderTopLeftRadius, -webkit-border-top-left-radius, webkitBorderTopRightRadius, WebkitBorderTopRightRadius, -webkit-border-top-right-radius, webkitBorderBottomRightRadius, WebkitBorderBottomRightRadius, -webkit-border-bottom-right-radius, webkitBorderBottomLeftRadius, WebkitBorderBottomLeftRadius, -webkit-border-bottom-left-radius, MozTransitionDuration, -moz-transition-duration, webkitTransitionDuration, WebkitTransitionDuration, -webkit-transition-duration, MozTransitionTimingFunction, -moz-transition-timing-function, webkitTransitionTimingFunction, WebkitTransitionTimingFunction, -webkit-transition-timing-function, MozTransitionProperty, -moz-transition-property, webkitTransitionProperty, WebkitTransitionProperty, -webkit-transition-property, MozTransitionDelay, -moz-transition-delay, webkitTransitionDelay, WebkitTransitionDelay, -webkit-transition-delay, MozAnimationName, -moz-animation-name, webkitAnimationName, WebkitAnimationName, -webkit-animation-name, MozAnimationDuration, -moz-animation-duration, webkitAnimationDuration, WebkitAnimationDuration, -webkit-animation-duration, MozAnimationTimingFunction, -moz-animation-timing-function, webkitAnimationTimingFunction, WebkitAnimationTimingFunction, -webkit-animation-timing-function, MozAnimationIterationCount, -moz-animation-iteration-count, webkitAnimationIterationCount, WebkitAnimationIterationCount, -webkit-animation-iteration-count, MozAnimationDirection, -moz-animation-direction, webkitAnimationDirection, WebkitAnimationDirection, -webkit-animation-direction, MozAnimationPlayState, -moz-animation-play-state, webkitAnimationPlayState, WebkitAnimationPlayState, -webkit-animation-play-state, MozAnimationFillMode, -moz-animation-fill-mode, webkitAnimationFillMode, WebkitAnimationFillMode, -webkit-animation-fill-mode, MozAnimationDelay, -moz-animation-delay, webkitAnimationDelay, WebkitAnimationDelay, -webkit-animation-delay, MozTransform, -moz-transform, webkitTransform, WebkitTransform, -webkit-transform, MozPerspective, -moz-perspective, webkitPerspective, WebkitPerspective, -webkit-perspective, MozPerspectiveOrigin, -moz-perspective-origin, webkitPerspectiveOrigin, WebkitPerspectiveOrigin, -webkit-perspective-origin, MozBackfaceVisibility, -moz-backface-visibility, webkitBackfaceVisibility, WebkitBackfaceVisibility, -webkit-backface-visibility, MozTransformStyle, -moz-transform-style, webkitTransformStyle, WebkitTransformStyle, -webkit-transform-style, MozTransformOrigin, -moz-transform-origin, webkitTransformOrigin, WebkitTransformOrigin, -webkit-transform-origin, MozAppearance, -moz-appearance, webkitAppearance, WebkitAppearance, -webkit-appearance, webkitBoxShadow, WebkitBoxShadow, -webkit-box-shadow, webkitFilter, WebkitFilter, -webkit-filter, MozFontFeatureSettings, -moz-font-feature-settings, MozFontLanguageOverride, -moz-font-language-override, MozHyphens, -moz-hyphens, webkitTextSizeAdjust, WebkitTextSizeAdjust, -webkit-text-size-adjust, wordWrap, word-wrap, MozTabSize, -moz-tab-size, MozMarginStart, -moz-margin-start, MozMarginEnd, -moz-margin-end, MozPaddingStart, -moz-padding-start, MozPaddingEnd, -moz-padding-end, webkitFlexDirection, WebkitFlexDirection, -webkit-flex-direction, webkitFlexWrap, WebkitFlexWrap, -webkit-flex-wrap, webkitJustifyContent, WebkitJustifyContent, -webkit-justify-content, webkitAlignContent, WebkitAlignContent, -webkit-align-content, webkitAlignItems, WebkitAlignItems, -webkit-align-items, webkitFlexGrow, WebkitFlexGrow, -webkit-flex-grow, webkitFlexShrink, WebkitFlexShrink, -webkit-flex-shrink, webkitAlignSelf, WebkitAlignSelf, -webkit-align-self, webkitOrder, WebkitOrder, -webkit-order, webkitFlexBasis, WebkitFlexBasis, -webkit-flex-basis, MozBoxSizing, -moz-box-sizing, webkitBoxSizing, WebkitBoxSizing, -webkit-box-sizing, gridColumnGap, grid-column-gap, gridRowGap, grid-row-gap, webkitMaskRepeat, WebkitMaskRepeat, -webkit-mask-repeat, webkitMaskPositionX, WebkitMaskPositionX, -webkit-mask-position-x, webkitMaskPositionY, WebkitMaskPositionY, -webkit-mask-position-y, webkitMaskClip, WebkitMaskClip, -webkit-mask-clip, webkitMaskOrigin, WebkitMaskOrigin, -webkit-mask-origin, webkitMaskSize, WebkitMaskSize, -webkit-mask-size, webkitMaskComposite, WebkitMaskComposite, -webkit-mask-composite, webkitMaskImage, WebkitMaskImage, -webkit-mask-image, MozUserSelect, -moz-user-select, webkitUserSelect, WebkitUserSelect, -webkit-user-select, webkitBoxAlign, WebkitBoxAlign, -webkit-box-align, webkitBoxDirection, WebkitBoxDirection, -webkit-box-direction, webkitBoxFlex, WebkitBoxFlex, -webkit-box-flex, webkitBoxOrient, WebkitBoxOrient, -webkit-box-orient, webkitBoxPack, WebkitBoxPack, -webkit-box-pack, webkitBoxOrdinalGroup, WebkitBoxOrdinalGroup, -webkit-box-ordinal-group, MozBorderStart, -moz-border-start, MozBorderEnd, -moz-border-end, webkitBorderRadius, WebkitBorderRadius, -webkit-border-radius, MozBorderImage, -moz-border-image, webkitBorderImage, WebkitBorderImage, -webkit-border-image, MozTransition, -moz-transition, webkitTransition, WebkitTransition, -webkit-transition, MozAnimation, -moz-animation, webkitAnimation, WebkitAnimation, -webkit-animation, webkitFlexFlow, WebkitFlexFlow, -webkit-flex-flow, webkitFlex, WebkitFlex, -webkit-flex, gridGap, grid-gap, webkitMask, WebkitMask, -webkit-mask, webkitMaskPosition, WebkitMaskPosition, -webkit-mask-position, constructor`,
			jsKeys: "Array.at, Array.concat, Array.copyWithin, Array.entries, Array.every, Array.fill, Array.filter, Array.find, Array.findIndex, Array.flat, Array.flatMap, Array.forEach, Array.from, Array.includes, Array.indexOf, Array.isArray, Array.join, Array.keys, Array.lastIndexOf, Array.map, Array.of, Array.pop, Array.push, Array.reduce, Array.reduceRight, Array.reverse, Array.shift, Array.slice, Array.some, Array.sort, Array.splice, Array.toLocaleString, Array.toString, Array.unshift, Array.values, Atomics.add, Atomics.and, Atomics.compareExchange, Atomics.exchange, Atomics.isLockFree, Atomics.load, Atomics.notify, Atomics.or, Atomics.store, Atomics.sub, Atomics.wait, Atomics.wake, Atomics.xor, BigInt.asIntN, BigInt.asUintN, BigInt.toLocaleString, BigInt.toString, BigInt.valueOf, Boolean.toString, Boolean.valueOf, Date.UTC, Date.getDate, Date.getDay, Date.getFullYear, Date.getHours, Date.getMilliseconds, Date.getMinutes, Date.getMonth, Date.getSeconds, Date.getTime, Date.getTimezoneOffset, Date.getUTCDate, Date.getUTCDay, Date.getUTCFullYear, Date.getUTCHours, Date.getUTCMilliseconds, Date.getUTCMinutes, Date.getUTCMonth, Date.getUTCSeconds, Date.getYear, Date.now, Date.parse, Date.setDate, Date.setFullYear, Date.setHours, Date.setMilliseconds, Date.setMinutes, Date.setMonth, Date.setSeconds, Date.setTime, Date.setUTCDate, Date.setUTCFullYear, Date.setUTCHours, Date.setUTCMilliseconds, Date.setUTCMinutes, Date.setUTCMonth, Date.setUTCSeconds, Date.setYear, Date.toDateString, Date.toGMTString, Date.toISOString, Date.toJSON, Date.toLocaleDateString, Date.toLocaleString, Date.toLocaleTimeString, Date.toString, Date.toTimeString, Date.toUTCString, Date.valueOf, Document.URL, Document.activeElement, Document.adoptNode, Document.alinkColor, Document.all, Document.anchors, Document.append, Document.applets, Document.bgColor, Document.body, Document.captureEvents, Document.caretPositionFromPoint, Document.characterSet, Document.charset, Document.childElementCount, Document.children, Document.clear, Document.close, Document.compatMode, Document.contentType, Document.cookie, Document.createAttribute, Document.createAttributeNS, Document.createCDATASection, Document.createComment, Document.createDocumentFragment, Document.createElement, Document.createElementNS, Document.createEvent, Document.createExpression, Document.createNSResolver, Document.createNodeIterator, Document.createProcessingInstruction, Document.createRange, Document.createTextNode, Document.createTreeWalker, Document.currentScript, Document.defaultView, Document.designMode, Document.dir, Document.doctype, Document.documentElement, Document.documentURI, Document.domain, Document.elementFromPoint, Document.elementsFromPoint, Document.embeds, Document.enableStyleSheetsForSet, Document.evaluate, Document.execCommand, Document.exitFullscreen, Document.exitPointerLock, Document.fgColor, Document.firstElementChild, Document.fonts, Document.forms, Document.fullscreen, Document.fullscreenElement, Document.fullscreenEnabled, Document.getAnimations, Document.getElementById, Document.getElementsByClassName, Document.getElementsByName, Document.getElementsByTagName, Document.getElementsByTagNameNS, Document.getSelection, Document.hasFocus, Document.hasStorageAccess, Document.head, Document.hidden, Document.images, Document.implementation, Document.importNode, Document.inputEncoding, Document.lastElementChild, Document.lastModified, Document.lastStyleSheetSet, Document.linkColor, Document.links, Document.mozCancelFullScreen, Document.mozFullScreen, Document.mozFullScreenElement, Document.mozFullScreenEnabled, Document.mozSetImageElement, Document.onabort, Document.onafterscriptexecute, Document.onanimationcancel, Document.onanimationend, Document.onanimationiteration, Document.onanimationstart, Document.onauxclick, Document.onbeforeinput, Document.onbeforescriptexecute, Document.onblur, Document.oncanplay, Document.oncanplaythrough, Document.onchange, Document.onclick, Document.onclose, Document.oncontextmenu, Document.oncopy, Document.oncuechange, Document.oncut, Document.ondblclick, Document.ondrag, Document.ondragend, Document.ondragenter, Document.ondragexit, Document.ondragleave, Document.ondragover, Document.ondragstart, Document.ondrop, Document.ondurationchange, Document.onemptied, Document.onended, Document.onerror, Document.onfocus, Document.onformdata, Document.onfullscreenchange, Document.onfullscreenerror, Document.ongotpointercapture, Document.oninput, Document.oninvalid, Document.onkeydown, Document.onkeypress, Document.onkeyup, Document.onload, Document.onloadeddata, Document.onloadedmetadata, Document.onloadend, Document.onloadstart, Document.onlostpointercapture, Document.onmousedown, Document.onmouseenter, Document.onmouseleave, Document.onmousemove, Document.onmouseout, Document.onmouseover, Document.onmouseup, Document.onmozfullscreenchange, Document.onmozfullscreenerror, Document.onpaste, Document.onpause, Document.onplay, Document.onplaying, Document.onpointercancel, Document.onpointerdown, Document.onpointerenter, Document.onpointerleave, Document.onpointerlockchange, Document.onpointerlockerror, Document.onpointermove, Document.onpointerout, Document.onpointerover, Document.onpointerup, Document.onprogress, Document.onratechange, Document.onreadystatechange, Document.onreset, Document.onresize, Document.onscroll, Document.onsecuritypolicyviolation, Document.onseeked, Document.onseeking, Document.onselect, Document.onselectionchange, Document.onselectstart, Document.onslotchange, Document.onstalled, Document.onsubmit, Document.onsuspend, Document.ontimeupdate, Document.ontoggle, Document.ontransitioncancel, Document.ontransitionend, Document.ontransitionrun, Document.ontransitionstart, Document.onvisibilitychange, Document.onvolumechange, Document.onwaiting, Document.onwebkitanimationend, Document.onwebkitanimationiteration, Document.onwebkitanimationstart, Document.onwebkittransitionend, Document.onwheel, Document.open, Document.plugins, Document.pointerLockElement, Document.preferredStyleSheetSet, Document.prepend, Document.queryCommandEnabled, Document.queryCommandIndeterm, Document.queryCommandState, Document.queryCommandSupported, Document.queryCommandValue, Document.querySelector, Document.querySelectorAll, Document.readyState, Document.referrer, Document.releaseCapture, Document.releaseEvents, Document.replaceChildren, Document.requestStorageAccess, Document.rootElement, Document.scripts, Document.scrollingElement, Document.selectedStyleSheetSet, Document.styleSheetSets, Document.styleSheets, Document.timeline, Document.title, Document.visibilityState, Document.vlinkColor, Document.write, Document.writeln, Element.after, Element.animate, Element.append, Element.assignedSlot, Element.attachShadow, Element.attributes, Element.before, Element.childElementCount, Element.children, Element.classList, Element.className, Element.clientHeight, Element.clientLeft, Element.clientTop, Element.clientWidth, Element.closest, Element.firstElementChild, Element.getAnimations, Element.getAttribute, Element.getAttributeNS, Element.getAttributeNames, Element.getAttributeNode, Element.getAttributeNodeNS, Element.getBoundingClientRect, Element.getClientRects, Element.getElementsByClassName, Element.getElementsByTagName, Element.getElementsByTagNameNS, Element.hasAttribute, Element.hasAttributeNS, Element.hasAttributes, Element.hasPointerCapture, Element.id, Element.innerHTML, Element.insertAdjacentElement, Element.insertAdjacentHTML, Element.insertAdjacentText, Element.lastElementChild, Element.localName, Element.matches, Element.mozMatchesSelector, Element.mozRequestFullScreen, Element.namespaceURI, Element.nextElementSibling, Element.onfullscreenchange, Element.onfullscreenerror, Element.outerHTML, Element.part, Element.prefix, Element.prepend, Element.previousElementSibling, Element.querySelector, Element.querySelectorAll, Element.releaseCapture, Element.releasePointerCapture, Element.remove, Element.removeAttribute, Element.removeAttributeNS, Element.removeAttributeNode, Element.replaceChildren, Element.replaceWith, Element.requestFullscreen, Element.requestPointerLock, Element.scroll, Element.scrollBy, Element.scrollHeight, Element.scrollIntoView, Element.scrollLeft, Element.scrollLeftMax, Element.scrollTo, Element.scrollTop, Element.scrollTopMax, Element.scrollWidth, Element.setAttribute, Element.setAttributeNS, Element.setAttributeNode, Element.setAttributeNodeNS, Element.setCapture, Element.setPointerCapture, Element.shadowRoot, Element.slot, Element.tagName, Element.toggleAttribute, Element.webkitMatchesSelector, Error.message, Error.stack, Error.toString, Function.apply, Function.bind, Function.call, Function.toString, Intl.Collator, Intl.DateTimeFormat, Intl.DisplayNames, Intl.ListFormat, Intl.Locale, Intl.NumberFormat, Intl.PluralRules, Intl.RelativeTimeFormat, Intl.getCanonicalLocales, Intl.supportedValuesOf, JSON.parse, JSON.stringify, Map.clear, Map.delete, Map.entries, Map.forEach, Map.get, Map.has, Map.keys, Map.set, Map.size, Map.values, Math.E, Math.LN10, Math.LN2, Math.LOG10E, Math.LOG2E, Math.PI, Math.SQRT1_2, Math.SQRT2, Math.abs, Math.acos, Math.acosh, Math.asin, Math.asinh, Math.atan, Math.atan2, Math.atanh, Math.cbrt, Math.ceil, Math.clz32, Math.cos, Math.cosh, Math.exp, Math.expm1, Math.floor, Math.fround, Math.hypot, Math.imul, Math.log, Math.log10, Math.log1p, Math.log2, Math.max, Math.min, Math.pow, Math.random, Math.round, Math.sign, Math.sin, Math.sinh, Math.sqrt, Math.tan, Math.tanh, Math.trunc, Number.EPSILON, Number.MAX_SAFE_INTEGER, Number.MAX_VALUE, Number.MIN_SAFE_INTEGER, Number.MIN_VALUE, Number.NEGATIVE_INFINITY, Number.NaN, Number.POSITIVE_INFINITY, Number.isFinite, Number.isInteger, Number.isNaN, Number.isSafeInteger, Number.parseFloat, Number.parseInt, Number.toExponential, Number.toFixed, Number.toLocaleString, Number.toPrecision, Number.toString, Number.valueOf, Object.__defineGetter__, Object.__defineSetter__, Object.__lookupGetter__, Object.__lookupSetter__, Object.__proto__, Object.assign, Object.create, Object.defineProperties, Object.defineProperty, Object.entries, Object.freeze, Object.fromEntries, Object.getOwnPropertyDescriptor, Object.getOwnPropertyDescriptors, Object.getOwnPropertyNames, Object.getOwnPropertySymbols, Object.getPrototypeOf, Object.hasOwn, Object.hasOwnProperty, Object.is, Object.isExtensible, Object.isFrozen, Object.isPrototypeOf, Object.isSealed, Object.keys, Object.preventExtensions, Object.propertyIsEnumerable, Object.seal, Object.setPrototypeOf, Object.toLocaleString, Object.toString, Object.valueOf, Object.values, Promise.all, Promise.allSettled, Promise.any, Promise.catch, Promise.finally, Promise.race, Promise.reject, Promise.resolve, Promise.then, Proxy.revocable, Reflect.apply, Reflect.construct, Reflect.defineProperty, Reflect.deleteProperty, Reflect.get, Reflect.getOwnPropertyDescriptor, Reflect.getPrototypeOf, Reflect.has, Reflect.isExtensible, Reflect.ownKeys, Reflect.preventExtensions, Reflect.set, Reflect.setPrototypeOf, RegExp.$&, RegExp.$', RegExp.$+, RegExp.$1, RegExp.$2, RegExp.$3, RegExp.$4, RegExp.$5, RegExp.$6, RegExp.$7, RegExp.$8, RegExp.$9, RegExp.$_, RegExp.$`, RegExp.compile, RegExp.dotAll, RegExp.exec, RegExp.flags, RegExp.global, RegExp.hasIndices, RegExp.ignoreCase, RegExp.input, RegExp.lastMatch, RegExp.lastParen, RegExp.leftContext, RegExp.multiline, RegExp.rightContext, RegExp.source, RegExp.sticky, RegExp.test, RegExp.toString, RegExp.unicode, Set.add, Set.clear, Set.delete, Set.entries, Set.forEach, Set.has, Set.keys, Set.size, Set.values, String.anchor, String.at, String.big, String.blink, String.bold, String.charAt, String.charCodeAt, String.codePointAt, String.concat, String.endsWith, String.fixed, String.fontcolor, String.fontsize, String.fromCharCode, String.fromCodePoint, String.includes, String.indexOf, String.italics, String.lastIndexOf, String.link, String.localeCompare, String.match, String.matchAll, String.normalize, String.padEnd, String.padStart, String.raw, String.repeat, String.replace, String.replaceAll, String.search, String.slice, String.small, String.split, String.startsWith, String.strike, String.sub, String.substr, String.substring, String.sup, String.toLocaleLowerCase, String.toLocaleUpperCase, String.toLowerCase, String.toString, String.toUpperCase, String.trim, String.trimEnd, String.trimLeft, String.trimRight, String.trimStart, String.valueOf, Symbol.asyncIterator, Symbol.description, Symbol.for, Symbol.hasInstance, Symbol.isConcatSpreadable, Symbol.iterator, Symbol.keyFor, Symbol.match, Symbol.matchAll, Symbol.replace, Symbol.search, Symbol.species, Symbol.split, Symbol.toPrimitive, Symbol.toString, Symbol.toStringTag, Symbol.unscopables, Symbol.valueOf, WeakMap.delete, WeakMap.get, WeakMap.has, WeakMap.set, WeakSet.add, WeakSet.delete, WeakSet.has, WebAssembly.CompileError, WebAssembly.Global, WebAssembly.Instance, WebAssembly.LinkError, WebAssembly.Memory, WebAssembly.Module, WebAssembly.RuntimeError, WebAssembly.Table, WebAssembly.compile, WebAssembly.compileStreaming, WebAssembly.instantiate, WebAssembly.instantiateStreaming, WebAssembly.validate"
		}
	});

	const getListDiff = ({oldList, newList, removeCamelCase = false} = {}) => {
		const oldSet = new Set(oldList);
		const newSet = new Set(newList);
		newList.forEach(x => oldSet.delete(x));
		oldList.forEach(x => newSet.delete(x));
		const camelCase = /[a-z][A-Z]/;
		return {
			removed: !removeCamelCase ? [...oldSet] : [...oldSet].filter(key => !camelCase.test(key)),
			added: !removeCamelCase ? [...newSet] : [...newSet].filter(key => !camelCase.test(key))
		}
	};

	const getFeaturesBrowser = () => {
		const mathPI = 3.141592653589793;
		const blink = (mathPI ** -100) == 1.9275814160560204e-50;
		const gecko = (mathPI ** -100) == 1.9275814160560185e-50;
		const browser = (
			blink ? 'Chrome' : gecko ? 'Firefox' : ''
		);
		return browser
	};

	const getEngineMaps = browser => {
		const geckoCSS = {
			'71': ['-moz-column-span'],
			'72': ['offset', 'offset-anchor', 'offset-distance', 'offset-path', 'offset-rotate', 'rotate', 'scale', 'translate'],
			'73': ['overscroll-behavior-block', 'overscroll-behavior-inline'],
			'74-79': ['!-moz-stack-sizing', 'text-underline-position'],
			'80-88': ['appearance'],
			'89-90': ['!-moz-outline-radius', '!-moz-outline-radius-bottomleft', '!-moz-outline-radius-bottomright', '!-moz-outline-radius-topleft', '!-moz-outline-radius-topright', 'aspect-ratio'],
			'91': ['tab-size'],
			'92-94': ['accent-color']
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
			'97': ['font-synthesis-small-caps', 'font-synthesis-style', 'font-synthesis-weight', 'font-synthesis']
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
			'93-94': ['ElementInternals']
		};

		const blinkWindow = {
			// disregard: EyeDropper
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
			'93': ['WritableStreamDefaultController'],
			'94': ['AudioData', 'AudioDecoder', 'AudioEncoder', 'EncodedAudioChunk', 'EncodedVideoChunk', 'IdleDetector', 'ImageDecoder', 'ImageTrack', 'ImageTrackList', 'VideoColorSpace', 'VideoDecoder', 'VideoEncoder', 'VideoFrame', 'MediaStreamTrackGenerator', 'MediaStreamTrackProcessor', 'Profiler', 'VirtualKeyboard', 'DelegatedInkTrailPresenter', 'Ink', 'Scheduler', 'TaskController', 'TaskPriorityChangeEvent', 'TaskSignal', 'VirtualKeyboardGeometryChangeEvent'],
			'95-96': ['URLPattern'],
			'97': ['WebTransport', 'WebTransportBidirectionalStream', 'WebTransportDatagramDuplexStream', 'WebTransportError']
		};

		const blinkJS = {
			'76': ['Document.onsecuritypolicyviolation','Promise.allSettled'],
			'77': ['Document.onformdata','Document.onpointerrawupdate'],
			'78': ['Element.elementTiming'],
			'79': ['Document.onanimationend','Document.onanimationiteration','Document.onanimationstart','Document.ontransitionend'],
			'80': ['!Document.registerElement','!Element.createShadowRoot','!Element.getDestinationInsertionPoints'],
			'81': ['Document.onwebkitanimationend','Document.onwebkitanimationiteration','Document.onwebkitanimationstart','Document.onwebkittransitionend','Element.ariaAtomic','Element.ariaAutoComplete','Element.ariaBusy','Element.ariaChecked','Element.ariaColCount','Element.ariaColIndex','Element.ariaColSpan','Element.ariaCurrent','Element.ariaDisabled','Element.ariaExpanded','Element.ariaHasPopup','Element.ariaHidden','Element.ariaKeyShortcuts','Element.ariaLabel','Element.ariaLevel','Element.ariaLive','Element.ariaModal','Element.ariaMultiLine','Element.ariaMultiSelectable','Element.ariaOrientation','Element.ariaPlaceholder','Element.ariaPosInSet','Element.ariaPressed','Element.ariaReadOnly','Element.ariaRelevant','Element.ariaRequired','Element.ariaRoleDescription','Element.ariaRowCount','Element.ariaRowIndex','Element.ariaRowSpan','Element.ariaSelected','Element.ariaSort','Element.ariaValueMax','Element.ariaValueMin','Element.ariaValueNow','Element.ariaValueText','Intl.DisplayNames'],
			'83': ['Element.ariaDescription','Element.onbeforexrselect'],
			'84': ['Document.getAnimations','Document.timeline','Element.ariaSetSize','Element.getAnimations'],
			'85': ['Promise.any','String.replaceAll'],
			'86': ['Document.fragmentDirective','Document.replaceChildren','Element.replaceChildren', '!Atomics.wake'],
			'87-89': ['Atomics.waitAsync','Document.ontransitioncancel','Document.ontransitionrun','Document.ontransitionstart','Intl.Segmenter'],
			'90': ['Document.onbeforexrselect','RegExp.hasIndices','!Element.onbeforexrselect'],
			'91': ['Element.getInnerHTML'],
			'92': ['Array.at','String.at'],
			'93': ['Error.cause','Object.hasOwn'],
			'94': ['!Error.cause', 'Object.hasOwn'],
			'95-96': ['WebAssembly.Exception','WebAssembly.Tag'],
			'97': ['Array.findLast', 'Array.findLastIndex', 'Document.onslotchange']
		};

		const geckoJS = {
			'71': ['Promise.allSettled'],
			'72-73': ['Document.onformdata','Element.part'],
			'74': ['!Array.toSource','!Boolean.toSource','!Date.toSource','!Error.toSource','!Function.toSource','!Intl.toSource','!JSON.toSource','!Math.toSource','!Number.toSource','!Object.toSource','!RegExp.toSource','!String.toSource','!WebAssembly.toSource'],
			'75-76': ['Document.getAnimations','Document.timeline','Element.getAnimations','Intl.Locale'],
			'77': ['String.replaceAll'],
			'78': ['Atomics.add','Atomics.and','Atomics.compareExchange','Atomics.exchange','Atomics.isLockFree','Atomics.load','Atomics.notify','Atomics.or','Atomics.store','Atomics.sub','Atomics.wait','Atomics.wake','Atomics.xor','Document.replaceChildren','Element.replaceChildren','Intl.ListFormat','RegExp.dotAll'],
			'79-84': ['Promise.any'],
			'85': ['!Document.onshow','Promise.any'],
			'86': ['Intl.DisplayNames'],
			'87': ['Document.onbeforeinput'],
			'88-89': ['RegExp.hasIndices'],
			'90-91': ['Array.at','String.at'],
			'92': ['Object.hasOwn'],
			'93-94': ['Intl.supportedValuesOf','Document.onsecuritypolicyviolation','Document.onslotchange']
		};

		const isChrome = browser == 'Chrome';
		const isFirefox = browser == 'Firefox';
		const css = (
			isChrome ? blinkCSS : isFirefox ? geckoCSS : {}
		);
		const win = (
			isChrome ? blinkWindow : isFirefox ? geckoWindow : {}
		);
		const js = (
			isChrome ? blinkJS : isFirefox ? geckoJS : {}
		);
		return {
			css,
			win,
			js
		}
	};

	const getJSCoreFeatures = win => {
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
			'Element'
		];
		try {
			const features = globalObjects.reduce((acc, name) => {
				const ignore = ['name', 'length', 'constructor', 'prototype', 'arguments', 'caller'];
				const descriptorKeys = Object.keys(Object.getOwnPropertyDescriptors(win[name]||{}));
				const descriptorProtoKeys = Object.keys(Object.getOwnPropertyDescriptors((win[name]||{}).prototype||{}));
				const uniques = [...new Set([...descriptorKeys, ...descriptorProtoKeys].filter(key => !ignore.includes(key)))];
				const keys = uniques.map(key => `${name}.${key}`);
				return [...acc, ...keys] 
			}, []);
			return features
		}
		catch (error) {
			console.error(error);
			return []
		}
	};

	const versionSort = x => x.sort((a, b) => /\d+/.exec(a)[0] - /\d+/.exec(b)[0]).reverse();

	// feature firewall
	const getFeaturesLie = fp => {
		if (!fp.workerScope || !fp.workerScope.userAgent) {
			return false
		}
		const browser = getFeaturesBrowser();
		const stable = getStableFeatures();
		const { version: maxVersion } = stable[browser] || {};
		const { userAgentVersion: reportedVersion } = fp.workerScope;
		
		// let RFP pass
		const { privacy } = fp.resistance || {};
		if (privacy == 'Firefox' || privacy == 'Tor Browser') {
			return false
		}

		const getVersionLie = version => {
			const versionParts = version ? version.split('-') : [];
			const versionNotAboveSamples = (+reportedVersion <= maxVersion);
			const validMetrics = reportedVersion && version;
			const forgivenessOffset = 0; // 0 is strict (dev and canary builds may fail)
			const outsideOfVersion = (
				versionParts.length == 1 && (
					+reportedVersion > (+versionParts[0]+forgivenessOffset) ||
					+reportedVersion < (+versionParts[0]-forgivenessOffset)
				)
			);
			const outsideOfVersionRange = (
				versionParts.length == 2 && (
					+reportedVersion > (+versionParts[1]+forgivenessOffset) ||
					+reportedVersion < (+versionParts[0]-forgivenessOffset)
				)
			);
			const liedVersion = validMetrics && versionNotAboveSamples && (
				outsideOfVersion || outsideOfVersionRange
			);
			return liedVersion
		};
		const { cssVersion, jsVersion } = fp.features || {};
		const liedVersion = (
			getVersionLie(cssVersion) ||
			getVersionLie(jsVersion)
		);
		return liedVersion
	};

	const getEngineFeatures = async ({ imports, cssComputed, windowFeaturesComputed }) => {
		const {
			require: {
				captureError,
				phantomDarkness,
				logTestResult
			}
		} = imports;

		try {
			const start = performance.now();
			const win = phantomDarkness ? phantomDarkness : window;
			if (!cssComputed || !windowFeaturesComputed) {
				logTestResult({ test: 'features', passed: false });
				return
			}
			
			const jsFeaturesKeys = getJSCoreFeatures(win);
			//console.log(jsFeaturesKeys.sort().join(', ')) // log features
			const { keys: computedStyleKeys } = cssComputed.computedStyle || {};
			const { keys: windowFeaturesKeys } = windowFeaturesComputed || {};

			const isNative = (win, x) => (
				/\[native code\]/.test(win[x]+'') &&
				'prototype' in win[x] && 
				win[x].prototype.constructor.name === x
			);

			const browser = getFeaturesBrowser();

			const getFeatures = ({context, allKeys, engineMap, checkNative = false} = {}) => {
				const allKeysSet = new Set(allKeys);
				const features = new Set();
				const match = Object.keys(engineMap || {}).reduce((acc, key) => {
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
							(checkNative ? isNative(context, prop) : true) &&
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

			// engine maps
			const {
				css: engineMapCSS,
				win: engineMapWindow,
				js: engineMapJS
			} = getEngineMaps(browser);

			// css version
			const {
				version: cssVersion,
				features: cssFeatures
			} = getFeatures({
				context: win,
				allKeys: computedStyleKeys,
				engineMap: engineMapCSS
			});
			
			// window version
			const {
				version: windowVersion,
				features: windowFeatures
			} = getFeatures({
				context: win,
				allKeys: windowFeaturesKeys,
				engineMap: engineMapWindow,
				checkNative: true
			});

			// js version
			const {
				version: jsVersion,
				features: jsFeatures
			} = getFeatures({
				context: win,
				allKeys: jsFeaturesKeys,
				engineMap: engineMapJS
			});
				
			// determine version based on 3 factors
			const getVersionFromRange = (range, versionCollection) => {
				const exactVersion = versionCollection.find(version => version && !/-/.test(version));
				if (exactVersion) {
					return exactVersion
				}
				const len = range.length;
				const first = range[0];
				const last = range[len-1];
				return (
					!len ? '' : 
						len == 1 ? first :
							`${last}-${first}`
				)
			};
			const versionSet = new Set([
				cssVersion,
				windowVersion,
				jsVersion
			]);
			versionSet.delete(undefined);
			const versionRange = versionSort(
				[...versionSet].reduce((acc, x) => [...acc, ...x.split('-')], [])
			);
			const version = getVersionFromRange(versionRange, [cssVersion, windowVersion, jsVersion]);
			logTestResult({ start, test: 'features', passed: true });
			return {
				versionRange,
				version,
				cssVersion,
				windowVersion,
				jsVersion,
				cssFeatures: [...cssFeatures],
				windowFeatures: [...windowFeatures],
				jsFeatures: [...jsFeatures],
				jsFeaturesKeys
			}
		}
		catch (error) {
			logTestResult({ test: 'features', passed: false });
			captureError(error);
			return
		}
	};

	const featuresHTML = ({ fp, modal, note, hashMini }) => {
		if (!fp.features) {
			return `
		<div class="col-six undefined">
			<div>Features: ${note.unknown}</div>
			<div>JS/DOM: ${note.unknown}</div>
		</div>
		<div class="col-six undefined">
			<div>CSS: ${note.unknown}</div>
			<div>Window: ${note.unknown}</div>
		</div>`
		}

		const {
			versionRange,
			version,
			cssVersion,
			jsVersion,
			windowVersion,
			cssFeatures,
			windowFeatures,
			jsFeatures,
			jsFeaturesKeys
		} = fp.features || {};

		const { keys: windowFeaturesKeys } = fp.windowFeatures || {};
		const { keys: computedStyleKeys } = fp.css.computedStyle || {};

		const browser = getFeaturesBrowser();
		const {
			css: engineMapCSS,
			win: engineMapWindow,
			js: engineMapJS
		} = getEngineMaps(browser);
			
		// modal
		const getModal = ({id, engineMap, features, browser}) => {
			// capture diffs from stable release
			const stable = getStableFeatures();
			const { windowKeys, cssKeys, jsKeys, version } = stable[browser] || {};
			let diff;
			if (id == 'css') {
				diff = !cssKeys ? undefined : getListDiff({
					oldList: cssKeys.split(', '),
					newList: computedStyleKeys,
					removeCamelCase: true
				});
			}
			else if (id == 'window') {
				diff = !windowKeys ? undefined : getListDiff({
					oldList: windowKeys.split(', '),
					newList: windowFeaturesKeys
				});
			}
			else if (id == 'js') {
				diff = !jsKeys ? undefined : getListDiff({
					oldList: jsKeys.split(', '),
					newList: jsFeaturesKeys
				});
			}

			const header = !version || !diff || (!diff.added.length && !diff.removed.length) ? '' : `
			<strong>diffs from ${version}</strong>:
			<div>
			${
				diff && diff.added.length ? 
					diff.added.map(key => `<div><span>${key}</span></div>`).join('') : ''
			}
			${
				diff && diff.removed.length ? 
					diff.removed.map(key => `<div><span class="unsupport">${key}</span></div>`).join('') : ''
			}
			</div>
			
		`;
		
			return modal(`creep-features-${id}`, header + versionSort(Object.keys(engineMap)).map(key => {
				return `
				<strong>${key}</strong>:<br>${
					engineMap[key].map(prop => {
						return `<span class="${!features.has(prop) ? 'unsupport' : ''}">${prop}</span>`
					}).join('<br>')
				}
			`
			}).join('<br>'), hashMini([...features]))
		};

		const cssModal = getModal({
			id: 'css',
			engineMap: engineMapCSS,
			features: new Set(cssFeatures),
			browser
		});
		
		const windowModal = getModal({
			id: 'window',
			engineMap: engineMapWindow,
			features: new Set(windowFeatures),
			browser
		});

		const jsModal = getModal({
			id: 'js',
			engineMap: engineMapJS,
			features: new Set(jsFeatures),
			browser
		});

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
	<div class="col-six">
		<div>Features: ${
			versionRange.length ? `${browserIcon}${version}+` :
				note.unknown
		}</div>
		<div>JS/DOM: ${jsVersion ? `${jsModal} (v${jsVersion})` : note.unknown}</div>
	</div>
	<div class="col-six">
		<div>CSS: ${cssVersion ? `${cssModal} (v${cssVersion})` : note.unknown}</div>
		<div>Window: ${windowVersion ? `${windowModal} (v${windowVersion})` : note.unknown}</div>
	</div>
	`
	};

	const renderSamples = async ({samples, templateImports}) => {

		if (!samples) {
			return
		}

		const {
			window: windowSamples,
			math: mathSamples,
			error: errorSamples,
			html: htmlSamples,
			style: styleSamples
		} = samples || {};

		const computeData = (hash, data) => {
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

			return {
				systems,
				poolTotal,
				metricTotal,
				decryption
			}
		};
		const decryptHash = (hash, data) => {
			const { systems, poolTotal, metricTotal, decryption } = computeData(hash, data);
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
				android: '<span class="icon android"></span>'
			};
			const engineIcon = (
				!decryption ? '' :
					/SpiderMonkey/.test(decryption) ? icon.firefox :
						/JavaScriptCore/.test(decryption) ? icon.webkit :
							/V8/.test(decryption) ? icon.v8 :
								''
			);
			const engineRendererIcon = (
				!decryption ? '' :
					/Gecko/.test(decryption) ? icon.gecko :
						/WebKit/.test(decryption) ? icon.webkit :
							/Blink/.test(decryption) ? icon.blink :
								/Goanna/.test(decryption) ? icon.goanna :
									''
			);
			const systemIcon = (
				(!decryption || (systems.length != 1)) ? '' :
					/windows/i.test(systems[0]) ? icon.windows :
						/linux/i.test(systems[0]) ? icon.linux :
							/ipad|iphone|ipod|ios|mac/i.test(systems[0]) ? icon.apple :
								/android/i.test(systems[0]) ? icon.android :
									/chrome os/i.test(systems[0]) ? icon.cros :
										''
			);

			const formatPercent = n => n.toFixed(2).replace('.00', '');
			return {
				decryption: decryption || 'unknown',
				browserHTML: (
					!decryption ? undefined : 
						`${browserIcon}${decryption}`
				),
				engineHTML: (
					!decryption ? undefined : 
						`${engineIcon}${decryption}`
				),
				engineRendererHTML: (
					!decryption ? undefined : 
						`${engineRendererIcon}${decryption}`
				),
				engineRendererSystemHTML: (
					!decryption ? undefined : 
						`${engineRendererIcon}${systemIcon}${decryption}${systems.length != 1 ? '' : ` on ${systems[0]}`}`
				),
				engineSystem: (
					!decryption ? undefined : 
						`${engineIcon}${systemIcon}${decryption}${systems.length != 1 ? '' : ` on ${systems[0]}`}`
				),
				uniqueMetric: !decryption ? '0' : formatPercent(1/metricTotal*100),
				uniqueEngine: !decryption ? '0' : formatPercent(1/poolTotal*100)
			}
		};

		

		const renderWindowSamples = ({ fp, note, patch, html }) => {
			const id = document.getElementById(`window-features-samples`);
			if (!fp.windowFeatures || !id) {
				return
			}
			const { windowFeatures: { $hash } } = fp;
			const { browserHTML, uniqueEngine } = decryptHash($hash, windowSamples);
			return patch(id, html`
			<div>
				<style>
					.window-features-class-rating {
						background: linear-gradient(90deg, var(${uniqueEngine < 10 ? '--unique' : '--grey-glass'}) ${uniqueEngine}%, #fff0 ${uniqueEngine}%, #fff0 100%);
					}
				</style>
				<div class="window-features-class-rating">${uniqueEngine}% of ${browserHTML || note.unknown}</div>
			</div>
		`)
		};

		const renderMathSamples = ({ fp, note, patch, html }) => {
			const id = document.getElementById(`math-samples`);
			if (!fp.maths || !id) {
				return
			}
			const { maths: { $hash } } = fp;
			const { engineHTML, uniqueEngine } = decryptHash($hash, mathSamples);
			return patch(id, html`
			<div>
				<style>
					.math-class-rating {
						background: linear-gradient(90deg, var(${uniqueEngine < 10 ? '--unique' : '--grey-glass'}) ${uniqueEngine}%, #fff0 ${uniqueEngine}%, #fff0 100%);
					}
				</style>
				<div class="math-class-rating">${uniqueEngine}% of ${engineHTML || note.unknown}</div>
			</div>
		`)
		};

		const renderErrorSamples = ({ fp, note, patch, html }) => {
			const id = document.getElementById(`error-samples`);
			if (!fp.consoleErrors || !id) {
				return
			}
			const { consoleErrors: { $hash } } = fp;
			const { engineHTML, uniqueEngine } = decryptHash($hash, errorSamples);
			return patch(id, html`
			<div>
				<style>
					.console-errors-class-rating {
						background: linear-gradient(90deg, var(${uniqueEngine < 10 ? '--unique' : '--grey-glass'}) ${uniqueEngine}%, #fff0 ${uniqueEngine}%, #fff0 100%);
					}
				</style>
				<div class="console-errors-class-rating">${uniqueEngine}% of ${engineHTML || note.unknown}</div>
			</div>
		`)
		};

		const renderHTMLElementSamples = ({ fp, note, patch, html }) => {
			const id = document.getElementById(`html-element-samples`);
			if (!fp.htmlElementVersion || !id) {
				return
			}
			const { htmlElementVersion: { $hash } } = fp;
			const { engineRendererHTML, uniqueEngine } = decryptHash($hash, htmlSamples);
			return patch(id, html`
			<div>
				<style>
					.html-element-version-class-rating {
						background: linear-gradient(90deg, var(${uniqueEngine < 10 ? '--unique' : '--grey-glass'}) ${uniqueEngine}%, #fff0 ${uniqueEngine}%, #fff0 100%);
					}
				</style>
				<div class="html-element-version-class-rating">${uniqueEngine}% of ${engineRendererHTML || note.unknown}</div>
			</div>
		`)
		};

		const renderSystemStylesSamples = ({ fp, note, patch, html, styleSystemHash }) => {
			const id = document.getElementById(`system-style-samples`);
			if (!fp.css || !id) {
				return
			}
			const { engineRendererSystemHTML, uniqueEngine } = decryptHash(styleSystemHash, styleSamples);
			return patch(id, html`
			<div>
				<div>${engineRendererSystemHTML || note.unknown}</div>
			</div>
		`)
		};

		renderWindowSamples(templateImports);
		renderMathSamples(templateImports);
		renderErrorSamples(templateImports);
		renderHTMLElementSamples(templateImports);
		renderSystemStylesSamples(templateImports);

		return
	};

	const getPrediction = ({hash, data}) => {
		const getBaseDeviceName = devices => {
			// ex: find Android 10 in [Android 10, Android 10 Blah Blah]
			return devices.find(a => devices.filter(b => b.includes(a)).length == devices.length)
		};
		let systems = [], devices = [], gpus = [];
		const decrypted = Object.keys(data).find(key => data[key].find(item => {
			if (!(item.id == hash)) {
				return false
			}
			devices = item.devices || [];
			systems = item.systems || [];
			gpus = item.gpus || [];
			return true
		}));
		const prediction = {
			decrypted,
			system: systems.length == 1 ? systems[0] : undefined,
			device: (
				devices.length == 1 ? devices[0] : getBaseDeviceName(devices)
			),
			gpu: gpus.length == 1 ? gpus[0] : undefined
		};
		return prediction
	};

	const renderPrediction = ({decryptionData, crowdBlendingScore, patch, html, note, bot = false}) => {
		const {
			jsRuntime,
			jsEngine,
			htmlVersion,
			windowVersion,
			styleVersion,
			resistance,
			styleSystem,
			emojiSystem,
			domRectSystem,
			svgSystem,
			mimeTypesSystem,
			audioSystem,
			canvasSystem,
			textMetricsSystem,
			webglSystem,
			gpuSystem,
			gpuModelSystem,
			fontsSystem,
			voicesSystem,
			screenSystem,
			pendingReview
		} = decryptionData;

		const iconSet = new Set();
		const getBlankIcons = () => `<span class="icon"></span><span class="icon"></span>`;
		const htmlIcon = cssClass => `<span class="icon ${cssClass}"></span>`;
		const getTemplate = ({title, agent, showVersion = false}) => {
			const { decrypted, system, device, score } = agent || {};
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
				/webkit|javascriptcore/i.test(decrypted) ? iconSet.add('webkit') && htmlIcon('webkit') :
				/blink/i.test(decrypted) ? iconSet.add('blink') && htmlIcon('blink') : htmlIcon('')
			);
			const systemIcon = (
				/chrome os/i.test(system) ? iconSet.add('cros') && htmlIcon('cros') :
				/linux/i.test(system) ? iconSet.add('linux') && htmlIcon('linux') :
				/android/i.test(system) ? iconSet.add('android') && htmlIcon('android') :
				/ipad|iphone|ipod|ios|mac|apple/i.test(system) ? iconSet.add('apple') && htmlIcon('apple') :
				/windows/i.test(system) ? iconSet.add('windows') && htmlIcon('windows') : htmlIcon('')
			);
			const icons = [
				systemIcon,
				browserIcon
			].join('');

			const unknown = ''+[...new Set([decrypted, system, device])] == '';
			const renderBlankIfKnown = unknown => unknown ? ` ${note.unknown}` : '';
			const renderIfKnown = (unknown, decrypted) => unknown ? ` ${note.unknown}` : decrypted;
			const renderFailingScore = (title, score) => {
				return (
					(score||0) > 36 ? title : `<span class="bold-fail">${title}</span>` 
				)
			};
			
			return (
				device ? `<span class="help" title="${device}">
				${renderFailingScore(`${icons}${title}`, score)}<strong>*</strong>
			</span>` :
					showVersion ? renderFailingScore(`${icons}${title}: ${renderIfKnown(unknown, decrypted)}`, score) :
						renderFailingScore(`${icons}${title}${renderBlankIfKnown(unknown)}`, score)
			)
		};

		const unknownHTML = title => `${getBlankIcons()}<span class="blocked">${title}</span>`;
		const devices = new Set([
			(jsRuntime || {}).device,
			(emojiSystem || {}).device,
			(domRectSystem || {}).device,
			(svgSystem || {}).device,
			(mimeTypesSystem || {}).device,
			(audioSystem || {}).device,
			(canvasSystem || {}).device,
			(textMetricsSystem || {}).device,
			(webglSystem || {}).device,
			(gpuSystem || {}).device,
			(gpuModelSystem || {}).device,
			(fontsSystem || {}).device,
			(voicesSystem || {}).device,
			(screenSystem || {}).device
		]);
		devices.delete(undefined);
		const getBaseDeviceName = devices => {
			return devices.find(a => devices.filter(b => b.includes(a)).length == devices.length)
		};
		const getOldestWindowOS = devices => {
			// FF RFP is ingnored in samples data since it returns Windows 10
			// So, if we have multiples versions of Windows, the lowest is the most accurate
			const windowsCore = (
				devices.length == devices.filter(x => /windows/i.test(x)).length
			);
			if (windowsCore) {
				return (
					devices.includes('Windows 7') ? 'Windows 7' :
					devices.includes('Windows 7 (64-bit)') ? 'Windows 7 (64-bit)' :
					devices.includes('Windows 8') ? 'Windows 8' :
					devices.includes('Windows 8 (64-bit)') ? 'Windows 8 (64-bit)' :
					devices.includes('Windows 8.1') ? 'Windows 8.1' :
					devices.includes('Windows 8.1 (64-bit)') ? 'Windows 8.1 (64-bit)' :
					devices.includes('Windows 10') ? 'Windows 10' :
					devices.includes('Windows 10 (64-bit)') ? 'Windows 10 (64-bit)' :
						undefined
				)
			}
			return undefined
		};
		const deviceCollection = [...devices];
		const deviceName = (
			getOldestWindowOS(deviceCollection) ||
			getBaseDeviceName(deviceCollection)
		);

		// Crowd-Blending Score Grade
		const crowdBlendingScoreGrade = (
			crowdBlendingScore >= 90 ? 'A' :
				crowdBlendingScore >= 80 ? 'B' :
					crowdBlendingScore >= 70 ? 'C' :
						crowdBlendingScore >= 60 ? 'D' :
							'F'
		);

		const el = document.getElementById('browser-detection');
		return patch(el, html`
	<div class="flex-grid relative">
		${
			pendingReview ? `<span class="aside-note-bottom">pending review: <span class="renewed">${pendingReview}</span></span>` : ''
		}
		${
			bot ? `<span class="aside-note"><span class="renewed">bot pattern detected</span></span>` :
				typeof crowdBlendingScore == 'number' ? `<span class="aside-note">crowd-blending score: ${''+crowdBlendingScore}% <span class="scale-up grade-${crowdBlendingScoreGrade}">${crowdBlendingScoreGrade}</span></span>` : ''
		}
		<div class="col-eight">
			<strong>Prediction</strong>
			<div class="ellipsis relative">${
				deviceName ? `<strong>*</strong>${deviceName}` : getBlankIcons()
			}</div>
			<div class="ellipsis relative">
				<span id="window-entropy"></span>${
				getTemplate({title: 'self', agent: windowVersion, showVersion: true})
			}</div>
			<div class="ellipsis relative">
				<span id="style-entropy"></span>${
				getTemplate({title: 'system styles', agent: styleSystem})
			}</div>
			<div class="ellipsis relative">
				<span id="styleVersion-entropy"></span>${
				getTemplate({title: 'computed styles', agent: styleVersion})
			}</div>
			<div class="ellipsis relative">
				<span id="html-entropy"></span>${
				getTemplate({title: 'html element', agent: htmlVersion})
			}</div>
			<div class="ellipsis relative">
				<span id="math-entropy"></span>${
				getTemplate({title: 'js runtime', agent: jsRuntime})
			}</div>
			<div class="ellipsis relative">
				<span id="error-entropy"></span>${
				getTemplate({title: 'js engine', agent: jsEngine})
			}</div>
			<div class="ellipsis relative">
				<span id="emoji-entropy"></span>${
				!Object.keys(emojiSystem || {}).length ? unknownHTML('emojis') : 
					getTemplate({title: 'emojis', agent: emojiSystem})
			}</div>
			<div class="ellipsis relative">
				<span id="domRect-entropy"></span>${
				!Object.keys(domRectSystem || {}).length ? unknownHTML('domRect') : 
					getTemplate({title: 'domRect', agent: domRectSystem})
			}</div>
			<div class="ellipsis relative">
				<span id="svg-entropy"></span>${
				!Object.keys(svgSystem || {}).length ? unknownHTML('svg') : 
					getTemplate({title: 'svg', agent: svgSystem})
			}</div>
			<div class="ellipsis relative">
				<span id="mimeTypes-entropy"></span>${
				!Object.keys(mimeTypesSystem || {}).length ? unknownHTML('mimeTypes') : 
					getTemplate({title: 'mimeTypes', agent: mimeTypesSystem})
			}</div>
			<div class="ellipsis relative">
				<span id="audio-entropy"></span>${
				!Object.keys(audioSystem || {}).length ? unknownHTML('audio') : 
					getTemplate({title: 'audio', agent: audioSystem})
			}</div>
			<div class="ellipsis relative">
				<span id="canvas-entropy"></span>${
				!Object.keys(canvasSystem || {}).length ? unknownHTML('canvas') : 
					getTemplate({title: 'canvas', agent: canvasSystem})
			}</div>
			<div class="ellipsis relative">
				<span id="textMetrics-entropy"></span>${
				!Object.keys(textMetricsSystem || {}).length ? unknownHTML('textMetrics') : 
					getTemplate({title: 'textMetrics', agent: textMetricsSystem})
			}</div>
			<div class="ellipsis relative">
				<span id="webgl-entropy"></span>${
				!Object.keys(webglSystem || {}).length ? unknownHTML('webgl') : 
					getTemplate({title: 'webgl', agent: webglSystem})
			}</div>
			<div class="ellipsis relative">
				<span id="gpu-entropy"></span>${
				!Object.keys(gpuSystem || {}).length ? unknownHTML('gpu params') : 
					getTemplate({title: 'gpu params', agent: gpuSystem})
			}</div>
			<div class="ellipsis relative">
				<span id="gpuModel-entropy"></span>${
				!Object.keys(gpuModelSystem || {}).length ? unknownHTML('gpu model') : 
					getTemplate({title: 'gpu model', agent: gpuModelSystem})
			}</div>
			<div class="ellipsis relative">
				<span id="fonts-entropy"></span>${
				!Object.keys(fontsSystem || {}).length ? unknownHTML('fonts') : 
					getTemplate({title: 'fonts', agent: fontsSystem})
			}</div>
			<div class="ellipsis relative">
				<span id="voices-entropy"></span>${
				!Object.keys(voicesSystem || {}).length ? unknownHTML('voices') : 
					getTemplate({title: 'voices', agent: voicesSystem})
			}</div>
			<div class="ellipsis relative">
				<span id="screen-entropy"></span>${
				!Object.keys(screenSystem || {}).length ? unknownHTML('screen') : 
					getTemplate({title: 'screen', agent: screenSystem})
			}</div>
			<div class="ellipsis relative">
				<span id="resistance-entropy"></span>${
				!Object.keys(resistance || {}).length ? unknownHTML('resistance') : 
					getTemplate({title: 'resistance', agent: resistance})
			}</div>
		</div>
		<div class="col-four icon-prediction-container">
			${[...iconSet].map(icon => {
				return `<div class="icon-prediction ${icon}"></div>`
			}).join('')}
			${
				gpuSystem && !(/^(undefined|false)$/.test(''+gpuSystem.gpu)) ? 
				`<div class="icon-prediction block-text-borderless">gpu:<br>${gpuSystem.gpu}</div>` : ''
			}
		</div>
	</div>
	`)
	};

	const predictionErrorPatch = ({error, patch, html}) => {
		const getBlankIcons = () => `<span class="icon"></span><span class="icon"></span>`;
		const el = document.getElementById('browser-detection');
		return patch(el, html`
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
				<div>${getBlankIcons()}canvas</div>
				<div>${getBlankIcons()}textMetrics</div>
				<div>${getBlankIcons()}webgl</div>
				<div>${getBlankIcons()}gpu params</div>
				<div>${getBlankIcons()}gpu model</div>
				<div>${getBlankIcons()}fonts</div>
				<div>${getBlankIcons()}voices</div>
				<div>${getBlankIcons()}screen</div>
				<div>${getBlankIcons()}resistance</div>
			</div>
			<div class="col-four icon-prediction-container">
			</div>
		</div>
	`)
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
			compressWebGLRenderer,
			getWebGLRendererParts,
			hardenWebGLRenderer,
			getWebGLRendererConfidence,
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

		const isBrave = isChrome ? await braveBrowser() : false;
		const braveMode = isBrave ? getBraveMode() : {};
		const braveFingerprintingBlocking = isBrave && (braveMode.standard || braveMode.strict);

		const fingerprint = async () => {
			const timeStart = timer();
			const fingerprintTimeStart = timer();
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
				headlessComputed,
				featuresComputed
			] = await Promise.all([
				getNavigator(imports, workerScopeComputed),
				getHeadlessFeatures(imports, workerScopeComputed),
				getEngineFeatures({
					imports,
					cssComputed, 
					windowFeaturesComputed
				})
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
			
			const fingerprintTimeEnd = fingerprintTimeStart();
			console.log(`Fingerprinting complete in ${(fingerprintTimeEnd).toFixed(2)}ms`);

			// GPU Prediction
			const { parameters: gpuParameter } = canvasWebglComputed || {};
			const reducedGPUParameters = {
				...(
					braveFingerprintingBlocking ? getBraveUnprotectedParameters(gpuParameter) :
						gpuParameter
				),
				RENDERER: undefined,
				SHADING_LANGUAGE_VERSION: undefined,
				UNMASKED_RENDERER_WEBGL: undefined,
				UNMASKED_VENDOR_WEBGL: undefined,
				VERSION: undefined,
				VENDOR: undefined
			};

			//console.log(hashMini(reducedGPUParameters))

			// Hashing
			const hashStartTime = timer();
			const [
				windowHash,
				headlessHash,
				htmlHash,
				cssMediaHash,
				cssHash,
				styleHash,
				styleSystemHash,
				screenHash,
				voicesHash,
				canvas2dHash,
				canvas2dImageHash,
				canvasWebglHash,
				canvasWebglImageHash,
				canvasWebglParametersHash,
				pixelsHash,
				pixels2Hash,
				mathsHash,
				consoleErrorsHash,
				timezoneHash,
				rectsHash,
				emojiHash,
				domRectHash,
				audioHash,
				fontsHash,
				workerHash,
				mediaHash,
				mimeTypesHash,
				webRTCHash,
				navigatorHash,
				liesHash,
				trashHash,
				errorsHash,
				svgHash,
				resistanceHash,
				intlHash,
				featuresHash
			] = await Promise.all([
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
				hashify(canvasWebglComputed),
				hashify((canvasWebglComputed || {}).dataURI),
				hashify(reducedGPUParameters),
				caniuse(() => canvasWebglComputed.pixels.length) ? hashify(canvasWebglComputed.pixels) : undefined,
				caniuse(() => canvasWebglComputed.pixels2.length) ? hashify(canvasWebglComputed.pixels2) : undefined,
				hashify((mathsComputed || {}).data),
				hashify((consoleErrorsComputed || {}).errors),
				hashify(timezoneComputed),
				hashify(clientRectsComputed),
				hashify((clientRectsComputed || {}).emojiSet),
				hashify([
					(clientRectsComputed || {}).elementBoundingClientRect,
					(clientRectsComputed || {}).elementClientRects,
					(clientRectsComputed || {}).rangeBoundingClientRect,
					(clientRectsComputed || {}).rangeClientRects
				]),
				hashify(offlineAudioContextComputed),
				hashify(fontsComputed),
				hashify(workerScopeComputed),
				hashify(mediaComputed),
				hashify((mediaComputed || {}).mimeTypes),
				hashify(webRTCDataComputed),
				hashify(navigatorComputed),
				hashify(liesComputed),
				hashify(trashComputed),
				hashify(capturedErrorsComputed),
				hashify(svgComputed),
				hashify(resistanceComputed),
				hashify(intlComputed),
				hashify(featuresComputed)
			]).catch(error => console.error(error.message));
			
			//console.log(performance.now()-start)
			const hashTimeEnd = hashStartTime();
			const timeEnd = timeStart();

			console.log(`Hashing complete in ${(hashTimeEnd).toFixed(2)}ms`);

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
				intl: !intlComputed ? undefined : {...intlComputed, $hash: intlHash},
				features: !featuresComputed ? undefined : {...featuresComputed, $hash: featuresHash},
			};
			return {
				fingerprint,
				styleSystemHash,
				styleHash,
				emojiHash,
				domRectHash,
				mimeTypesHash,
				canvas2dImageHash,
				canvasWebglImageHash,
				canvasWebglParametersHash,
				timeEnd
			}
		};
		
		// fingerprint and render
		const {
			fingerprint: fp,
			styleSystemHash,
			styleHash,
			emojiHash,
			domRectHash,
			mimeTypesHash,
			canvas2dImageHash,
			canvasWebglImageHash,
			canvasWebglParametersHash,
			timeEnd
		} = await fingerprint().catch(error => console.error(error));
		
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
					bluetoothAvailability: fp.navigator.bluetoothAvailability,
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
					braveFingerprintingBlocking ? undefined : hardenWebGLRenderer(fp.workerScope.webglRenderer)
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
				} : fp.canvasWebgl.lied ? undefined : {
					...fp.canvasWebgl,
					parameters: {
						...fp.canvasWebgl.parameters,
						UNMASKED_RENDERER_WEBGL: hardenWebGLRenderer(fp.canvasWebgl.parameters.UNMASKED_RENDERER_WEBGL)
					}
				}
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
			capturedErrors: !!errorsLen,
			resistance: fp.resistance || undefined
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
			getMismatchStyle,
			patch,
			html,
			styleSystemHash,
			compressWebGLRenderer,
			getWebGLRendererConfidence,
			computeWindowsRelease
		};
		const hasTrash = !!trashLen;
		const { lies: hasLied, capturedErrors: hasErrors } = creep;
		const getBlankIcons = () => `<span class="icon"></span><span class="icon"></span>`;
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
				<div>${getBlankIcons()}</div>
				<div>${getBlankIcons()}self:</div>
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
				<div>${getBlankIcons()}canvas</div>
				<div>${getBlankIcons()}textMetrics</div>
				<div>${getBlankIcons()}webgl</div>
				<div>${getBlankIcons()}gpu params</div>
				<div>${getBlankIcons()}gpu model</div>
				<div>${getBlankIcons()}fonts</div>
				<div>${getBlankIcons()}voices</div>
				<div>${getBlankIcons()}screen</div>
				<div>${getBlankIcons()}resistance</div>
			</div>
			<div class="col-four icon-prediction-container">
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
			${cssHTML(templateImports)}
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

			// fetch fingerprint data from server
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

				const renewedDate = '11/14/2021';
				const addDays = (date, n) => {
					const d = new Date(date);
					d.setDate(d.getDate() + n);
					return d
				};
				const shouldStyle = renewedDate => {
					const endNoticeDate = addDays(renewedDate, 7);
					const daysRemaining = Math.round((+endNoticeDate - +new Date()) / (1000 * 3600 * 24));
					return daysRemaining >= 0
				};

				// Bot Detection
				const getBot = ({ fp, hours, hasLied, switchCount }) => {
					const userAgentReportIsOutsideOfFeaturesVersion = getFeaturesLie(fp);
					const userShouldGetThrottled = (switchCount > 20) && ((hours/switchCount) <= 7); // 
					const excessiveLooseFingerprints = hasLied && userShouldGetThrottled;
					const workerScopeIsTrashed = !fp.workerScope || !fp.workerScope.userAgent;
					const liedWorkerScope = !!(fp.workerScope && fp.workerScope.lied);
					// Patern conditions that warrant rejection
					const botPatterns = {
						excessiveLooseFingerprints,
						userAgentReportIsOutsideOfFeaturesVersion,
						workerScopeIsTrashed,
						liedWorkerScope
					};
					const totalBotPatterns = Object.keys(botPatterns).length;
					const totalBotTriggers = (
						Object.keys(botPatterns).filter(key => botPatterns[key]).length
					);
					const botProbability = totalBotTriggers / totalBotPatterns;
					const isBot = !!botProbability;
					const botPercentString = `${(botProbability*100).toFixed(0)}%`;
					if (isBot) {
						console.warn('bot patterns: ', botPatterns);
					}
					return {
						isBot,
						botPercentString
					}
				};
				
				const { isBot, botPercentString } = getBot({fp, hours, hasLied, switchCount}); 
				
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
							<div class="ellipsis">bot: <span class="unblurred">${botPercentString}</span></div>
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

						const signatureRequest = `https://creepjs-api.web.app/sign?id=${creepHash}&signature=${input}`;

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
					canvas2d,
					canvasWebgl,
					screen: screenFp,
					fonts,
					voices,
					svg,
					media
				} = fp || {};
				const {
					computedStyle,
					system
				} = css || {};
				const isTorBrowser = resistance.privacy == 'Tor Browser';
				const isRFP = resistance.privacy == 'Firefox';
				const isBravePrivacy = resistance.privacy == 'Brave';
				//console.log(emojiHash) // Tor Browser check
				const screenMetrics = (
					!screenFp || screenFp.lied || isRFP || isTorBrowser ? 'undefined' : 
						`${screenFp.width}x${screenFp.height}`
				);
				const {
					compressorGainReduction: gain,
					sampleSum,
					floatFrequencyDataSum: freqSum,
					floatTimeDomainDataSum: timeSum,
					values: audioValues
				} = offlineAudioContext || {};
				const valuesHash = hashMini(audioValues);
				const audioMetrics = `${sampleSum}_${gain}_${freqSum}_${timeSum}_${valuesHash}`;

				const gpuModel = (
					!canvasWebgl || canvasWebgl.parameterOrExtensionLie ? 'undefined' : (
						(fp.workerScope && (fp.workerScope.type != 'dedicated') && fp.workerScope.webglRenderer) ? encodeURIComponent(fp.workerScope.webglRenderer) :
							(canvasWebgl.parameters && !isBravePrivacy) ? encodeURIComponent(canvasWebgl.parameters.UNMASKED_RENDERER_WEBGL) : 
								'undefined'
					)
				);

				if (!isBot) {
					const sender = {
						e: 3.141592653589793 ** -100,
						l: +new Date(new Date(`7/1/1113`))
					};
					
					// attempt windows 11 userAgent
					const { userAgent, userAgentData } = fp.workerScope || {};
					const attemptWindows11UserAgent = (userAgent, userAgentData) => {
						const  { platformVersion, platform } = userAgentData || {};
						const windowsRelease = computeWindowsRelease(platform, platformVersion);
						if (windowsRelease == 'Windows 11') {
							return (''+userAgent).replace('Windows NT 10.0', 'Windows 11')
						}
						return userAgent
					};
					const workerScopeUserAgent = attemptWindows11UserAgent(userAgent, userAgentData);

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
					`emojiId=${!clientRects || clientRects.lied ? 'undefined' : emojiHash}`,
					`domRectId=${!clientRects || clientRects.lied ? 'undefined' : domRectHash}`,
					`svgId=${!svg || svg.lied ? 'undefined' : svg.$hash}`,
					`mimeTypesId=${!media || media.lied ? 'undefined' : mimeTypesHash}`,
					`audioId=${
							!offlineAudioContext ||
							offlineAudioContext.lied ||
							unknownFirefoxAudio ? 'undefined' : 
								audioMetrics
					}`,
					`canvasId=${
						!canvas2d || canvas2d.lied ? 'undefined' :
							canvas2dImageHash
					}`,
					`textMetricsId=${
						!canvas2d || canvas2d.liedTextMetrics || ((+canvas2d.textMetricsSystemSum) == 0) ? 'undefined' : 
							canvas2d.textMetricsSystemSum
					}`,
					`webglId=${
						!canvasWebgl || (canvas2d || {}).lied || canvasWebgl.lied ? 'undefined' :
							canvasWebglImageHash
					}`,
					`gpuId=${
						!canvasWebgl || canvasWebgl.parameterOrExtensionLie ? 'undefined' :
							canvasWebglParametersHash
					}`,
					`gpu=${gpuModel}`,
					`fontsId=${!fonts || fonts.lied ? 'undefined' : fonts.$hash}`,
					`voicesId=${!voices || voices.lied ? 'undefined' : voices.$hash}`,
					`screenId=${screenMetrics}`,
					`ua=${encodeURIComponent(workerScopeUserAgent)}`
				].join('&')}`;

					const decryptionResponse = await fetch(decryptRequest)
						.catch(error => {
							console.error(error);
							predictionErrorPatch({error, patch, html});
							return
						});
					if (!decryptionResponse) {
						return
					}
					const decryptionData = await decryptionResponse.json();
					
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
						'textMetricsSystem',
						'webglSystem',
						'gpuSystem',
						'gpuModelSystem',
						'fontsSystem',
						'voicesSystem',
						'screenSystem'
					];

					const decryptionDataScores = scoreKeys.reduce((acc, key) => {
						const { score } = decryptionData[key] || {};
						const reporters = (
							score == 36 ? 1:
							score == 84 ? 2 :
							score == 96 ? 3 :
							score == 100 ? 4 :
								0
						);
						acc.metrics = [...(acc.metrics||[]), { key, score: (score||0), reporters }];
						acc.scores = [...(acc.scores||[]), (score||0)];
						return acc
					}, {});

					const { metrics: scoreMetrics } = decryptionDataScores;
					const scoreMetricsMap = Object.keys(scoreMetrics).reduce((acc, key) => {
						const scoreMetricData = scoreMetrics[key];
						const { score , reporters } = scoreMetricData;
						acc[scoreMetricData.key] = { score, reporters };
						return acc
					}, {});
					
					const blockedOrOpenlyPoisonedMetric = decryptionDataScores.scores.includes(0);
					const validScores = decryptionDataScores.scores.filter(n => !!n);
					const crowdBlendingScoreMin = Math.min(...validScores);
					const crowdBlendingScore = blockedOrOpenlyPoisonedMetric ? (0.75 * crowdBlendingScoreMin) : crowdBlendingScoreMin;

					console.groupCollapsed(`Crowd-Blending Score: ${crowdBlendingScore}%`);
						console.table(scoreMetricsMap);
					console.groupEnd();

					renderPrediction({
						decryptionData,
						crowdBlendingScore,
						patch,
						html,
						note
					});
				}
			

				// get GCD Samples
				const webapp = 'https://script.google.com/macros/s/AKfycbw26MLaK1PwIGzUiStwweOeVfl-sEmIxFIs5Ax7LMoP1Cuw-s0llN-aJYS7F8vxQuVG-A/exec';
				const decryptionResponse = await fetch(webapp)
					.catch(error => {
						console.error(error);
						return
					});
				const decryptionSamples = (
					decryptionResponse ? await decryptionResponse.json() : undefined
				);

				// prevent Error: value for argument "documentPath" must point to a document
				const cleanGPUString = x => !x ? x : (''+x).replace(/\//g,'');
				
				const {
					window: winSamples,
					math: mathSamples,
					error: errorSamples,
					html: htmlSamples,
					style: styleSamples,
					resistance: resistanceSamples,
					styleVersion: styleVersionSamples,
					emoji: emojiSamples,
					domRect: domRectSamples,
					svg: svgSamples,
					mimeTypes: mimeTypesSamples,
					audio: audioSamples,
					canvas: canvasSamples,
					textMetrics: textMetricsSamples,
					webgl: webglSamples,
					fonts: fontsSamples,
					voices: voicesSamples,
					screen: screenSamples,
					gpu: gpuSamples,
					gpuModel: gpuModelSamples
				} = decryptionSamples || {};

				if (isBot && !decryptionSamples) {
					predictionErrorPatch({error: 'Failed prediction fetch', patch, html});
				}
				
				if (isBot && decryptionSamples) {
					// Perform Dragon Fire Magic
					const decryptionData = {
						windowVersion: getPrediction({ hash: (windowFeatures || {}).$hash, data: winSamples }),
						jsRuntime: getPrediction({ hash: (maths || {}).$hash, data: mathSamples }),
						jsEngine: getPrediction({ hash: (consoleErrors || {}).$hash, data: errorSamples }),
						htmlVersion: getPrediction({ hash: (htmlElementVersion || {}).$hash, data: htmlSamples }),
						styleVersion: getPrediction({ hash: styleHash, data: styleVersionSamples }),
						styleSystem: getPrediction({ hash: styleSystemHash, data: styleSamples }),
						resistance: getPrediction({ hash: (resistance || {}).$hash, data: resistanceSamples }),
						emojiSystem: getPrediction({ hash: emojiHash, data: emojiSamples }),
						domRectSystem: getPrediction({ hash: domRectHash, data: domRectSamples }),
						svgSystem: getPrediction({ hash: (svg || {}).$hash, data: svgSamples }),
						mimeTypesSystem: getPrediction({ hash: mimeTypesHash, data: mimeTypesSamples }),
						audioSystem: getPrediction({ hash: audioMetrics, data: audioSamples }),
						canvasSystem: getPrediction({ hash: canvas2dImageHash, data: canvasSamples }),
						textMetricsSystem: getPrediction({
							hash: (canvas2d || {}).textMetricsSystemSum,
							data: textMetricsSamples
						}),
						webglSystem: getPrediction({ hash: canvasWebglImageHash, data: webglSamples }),
						gpuSystem: getPrediction({ hash: canvasWebglParametersHash, data: gpuSamples }),
						gpuModelSystem: getPrediction({ hash: cleanGPUString(gpuModel), data: gpuModelSamples }),
						fontsSystem: getPrediction({ hash: (fonts || {}).$hash, data: fontsSamples }),
						voicesSystem: getPrediction({ hash: (voices || {}).$hash, data: voicesSamples }),
						screenSystem: getPrediction({ hash: screenMetrics, data: screenSamples })
					};

					renderPrediction({
						decryptionData,
						patch,
						html,
						note,
						bot: true
					});
				}
				
				// render entropy notes
				if (decryptionSamples) {
					const getEntropy = (hash, data) => {
						let classTotal = 0;
						const metricTotal = Object.keys(data)
							.reduce((acc, key) => acc+= data[key].length, 0);
						const decryption = Object.keys(data).find(key => data[key].find(item => {
							if ((item.id == hash) && (item.reporterTrustScore > 36)) {
								const trustedSamples = data[key].filter(sample => {
									return (sample.reporterTrustScore > 36)
								});
								classTotal = trustedSamples.length;
								return true
							}
							return false
						}));
						return {
							classTotal,
							decryption,
							metricTotal
						}
					};
					const entropyHash = {
						window: (windowFeatures || {}).$hash,
						math: (maths || {}).$hash,
						error: (consoleErrors || {}).$hash,
						html: (htmlElementVersion || {}).$hash,
						style: styleSystemHash,
						resistance: (resistance || {}).$hash,
						styleVersion: styleHash,
						emoji: emojiHash,
						domRect: domRectHash,
						svg: (svg || {}).$hash,
						mimeTypes: mimeTypesHash,
						audio: audioMetrics,
						canvas: canvas2dImageHash,
						textMetrics: (canvas2d || {}).textMetricsSystemSum,
						webgl: canvasWebglImageHash,
						fonts: (fonts || {}).$hash,
						voices: (voices || {}).$hash,
						screen: screenMetrics,
						gpu: canvasWebglParametersHash,
						gpuModel
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
						svg: 'svg metrics',
						mimeTypes: 'media mimeTypes',
						audio: 'audio metrics',
						canvas: 'canvas image',
						textMetrics: 'textMetrics',
						webgl: 'webgl image',
						fonts: 'system fonts',
						voices: 'voices',
						screen: 'screen metrics',
						gpu: 'webgl parameters',
						gpuModel: 'webgl renderer'
					};
					Object.keys(decryptionSamples).forEach((key,i) => {
						const hash = (
							key == 'gpuModel' ? cleanGPUString(decodeURIComponent(entropyHash[key])) :
								entropyHash[key]
						);
						const {
							classTotal,
							decryption,
							metricTotal
						} = getEntropy(hash, decryptionSamples[key]);
						const el = document.getElementById(`${key}-entropy`);
						const deviceMetric = (
							(key == 'screen') || (key == 'fonts') || (key == 'gpuModel')
						);
						const uniquePercent = !classTotal ? 0 : (1/classTotal)*100;
						const signal = (
							uniquePercent == 0 ? 'entropy-unknown' :
							uniquePercent < 1 ? 'entropy-high' :
							uniquePercent > 10 ? 'entropy-low' :
								''
						);
						const animate = `style="animation: fade-up .3s ${100*i}ms ease both;"`;
						return patch(el, html`
						<span ${animate} class="${signal} entropy-note help" title="1 of ${classTotal || Infinity}${deviceMetric ? ' in x device' : ` in ${decryption || 'unknown'}`}${` (trusted ${entropyDescriptors[key]})`}">
							${(uniquePercent).toFixed(2)}%
						</span>
					`)
					});
				}
				
				return renderSamples({ samples: decryptionSamples, templateImports })
			})
			.catch(error => {
				fetchVisitorDataTimer('Error fetching vistor data');
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
					<div class="col-four icon-prediction-container">
					</div>
				</div>
			`);
				return console.error('Error!', error.message)
			});
		});
	})(imports);

}());
