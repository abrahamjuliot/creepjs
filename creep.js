(async function() {
	
	// Detect Browser
	const isChrome = 'chrome' in window
	const isBrave = 'brave' in navigator
	const isFirefox = typeof InstallTrigger !== 'undefined'

	// Handle Errors
	const errorsCaptured = []
	const captureError = (error, customMessage = null) => {
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
		}
		const hasInnerSpace = s => /.+(\s).+/g.test(s) // ignore AOPR noise
		console.error(error) // log error to educate
		const { name, message } = error
		const trustedMessage = (
			!hasInnerSpace(message) ? undefined :
			!customMessage ? message :
			`${message} [${customMessage}]`
		)
		const trustedName = type[name] ? name : undefined
		errorsCaptured.push(
			{ trustedName, trustedMessage }
		)
		return undefined
	}

	const attempt = fn => {
		try {
			return fn()
		} catch (error) {
			return captureError(error)
		}
	}

	const caniuse = (fn, objChainList = [], args = [], method = false) => {
		let api
		try {
			api = fn()
		} catch (error) {
			return undefined
		}
		let i, len = objChainList.length, chain = api
		try {
			for (i = 0; i < len; i++) {
				const obj = objChainList[i]
				chain = chain[obj]
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
	}

	// Log performance time
	const timer = (logStart) => {
		logStart && console.log(logStart)
		let start = 0
		try {
			start = performance.now()
		}
		catch (error) {
			captureError(error)
		}
		return logEnd => {
			let end = 0
			try {
				end = performance.now() - start
				logEnd && console.log(`${logEnd}: ${end / 1000} seconds`)
				return end
			}
			catch (error) {
				captureError(error)
				return 0
			}
		}
	}

	// https://stackoverflow.com/a/22429679
	const hashMini = str => {
		const json = `${JSON.stringify(str)}`
		let i, len, hash = 0x811c9dc5
		for (i = 0, len = json.length; i < len; i++) {
			hash = Math.imul(31, hash) + json.charCodeAt(i) | 0
		}
		return ('0000000' + (hash >>> 0).toString(16)).substr(-8)
	}

	// instance id
	const instanceId = hashMini(crypto.getRandomValues(new Uint32Array(10)))

	// https://stackoverflow.com/a/53490958
	// https://stackoverflow.com/a/43383990
	// https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest
	const hashify = async (x) => {
		const json = `${JSON.stringify(x)}`
		const jsonBuffer = new TextEncoder().encode(json)
		const hashBuffer = await crypto.subtle.digest('SHA-256', jsonBuffer)
		const hashArray = Array.from(new Uint8Array(hashBuffer))
		const hashHex = hashArray.map(b => ('00' + b.toString(16)).slice(-2)).join('')
		return hashHex
	}

	// ie11 fix for template.content
	function templateContent(template) {
		// template {display: none !important} /* add css if template is in dom */
		if ('content' in document.createElement('template')) {
			return document.importNode(template.content, true)
		} else {
			const frag = document.createDocumentFragment()
			const children = template.childNodes
			for (let i = 0, len = children.length; i < len; i++) {
				frag.appendChild(children[i].cloneNode(true))
			}
			return frag
		}
	}

	// tagged template literal (JSX alternative)
	const patch = (oldEl, newEl, fn = null) => {
		oldEl.parentNode.replaceChild(newEl, oldEl)
		return typeof fn === 'function' ? fn() : true
	}
	const html = (stringSet, ...expressionSet) => {
		const template = document.createElement('template')
		template.innerHTML = stringSet.map((str, i) => `${str}${expressionSet[i] || ''}`).join('')
		return templateContent(template) // ie11 fix for template.content
	}

	// template helpers
	const note = {
		unsupported: '<span class="blocked">blocked</span> or unsupported',
		blocked: '<span class="blocked">blocked</span>',
		lied: '<span class="blocked">lied</span>'
	}
	const pluralify = len => len > 1 ? 's' : ''
	const toJSONFormat = obj => JSON.stringify(obj, null, '\t')
	const count = arr => arr && arr.constructor.name === 'Array' ? ''+(arr.length) : '0'

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
	}

	// Detect proxy behavior
	const proxyBehavior = x => typeof x == 'function' ? true : false

	// Detect gibberish 
	const accept = {'aa': 1, 'ab': 1, 'ac': 1, 'ad': 1, 'ae': 1, 'af': 1, 'ag': 1, 'ah': 1, 'ai': 1, 'aj': 1, 'ak': 1, 'al': 1, 'am': 1, 'an': 1, 'ao': 1, 'ap': 1, 'aq': 1, 'ar': 1, 'as': 1, 'at': 1, 'au': 1, 'av': 1, 'aw': 1, 'ax': 1, 'ay': 1, 'az': 1, 'ba': 1, 'bb': 1, 'bc': 1, 'bd': 1, 'be': 1, 'bf': 1, 'bg': 1, 'bh': 1, 'bi': 1, 'bj': 1, 'bk': 1, 'bl': 1, 'bm': 1, 'bn': 1, 'bo': 1, 'bp': 1, 'br': 1, 'bs': 1, 'bt': 1, 'bu': 1, 'bv': 1, 'bw': 1, 'bx': 1, 'by': 1, 'ca': 1, 'cb': 1, 'cc': 1, 'cd': 1, 'ce': 1, 'cg': 1, 'ch': 1, 'ci': 1, 'ck': 1, 'cl': 1, 'cm': 1, 'cn': 1, 'co': 1, 'cp': 1, 'cq': 1, 'cr': 1, 'cs': 1, 'ct': 1, 'cu': 1, 'cw': 1, 'cy': 1, 'cz': 1, 'da': 1, 'db': 1, 'dc': 1, 'dd': 1, 'de': 1, 'df': 1, 'dg': 1, 'dh': 1, 'di': 1, 'dj': 1, 'dk': 1, 'dl': 1, 'dm': 1, 'dn': 1, 'do': 1, 'dp': 1, 'dq': 1, 'dr': 1, 'ds': 1, 'dt': 1, 'du': 1, 'dv': 1, 'dw': 1, 'dx': 1, 'dy': 1, 'dz': 1, 'ea': 1, 'eb': 1, 'ec': 1, 'ed': 1, 'ee': 1, 'ef': 1, 'eg': 1, 'eh': 1, 'ei': 1, 'ej': 1, 'ek': 1, 'el': 1, 'em': 1, 'en': 1, 'eo': 1, 'ep': 1, 'eq': 1, 'er': 1, 'es': 1, 'et': 1, 'eu': 1, 'ev': 1, 'ew': 1, 'ex': 1, 'ey': 1, 'ez': 1, 'fa': 1, 'fb': 1, 'fc': 1, 'fd': 1, 'fe': 1, 'ff': 1, 'fg': 1, 'fh': 1, 'fi': 1, 'fj': 1, 'fk': 1, 'fl': 1, 'fm': 1, 'fn': 1, 'fo': 1, 'fp': 1, 'fr': 1, 'fs': 1, 'ft': 1, 'fu': 1, 'fw': 1, 'fy': 1, 'ga': 1, 'gb': 1, 'gc': 1, 'gd': 1, 'ge': 1, 'gf': 1, 'gg': 1, 'gh': 1, 'gi': 1, 'gj': 1, 'gk': 1, 'gl': 1, 'gm': 1, 'gn': 1, 'go': 1, 'gp': 1, 'gr': 1, 'gs': 1, 'gt': 1, 'gu': 1, 'gw': 1, 'gy': 1, 'gz': 1, 'ha': 1, 'hb': 1, 'hc': 1, 'hd': 1, 'he': 1, 'hf': 1, 'hg': 1, 'hh': 1, 'hi': 1, 'hj': 1, 'hk': 1, 'hl': 1, 'hm': 1, 'hn': 1, 'ho': 1, 'hp': 1, 'hq': 1, 'hr': 1, 'hs': 1, 'ht': 1, 'hu': 1, 'hv': 1, 'hw': 1, 'hy': 1, 'ia': 1, 'ib': 1, 'ic': 1, 'id': 1, 'ie': 1, 'if': 1, 'ig': 1, 'ih': 1, 'ii': 1, 'ij': 1, 'ik': 1, 'il': 1, 'im': 1, 'in': 1, 'io': 1, 'ip': 1, 'iq': 1, 'ir': 1, 'is': 1, 'it': 1, 'iu': 1, 'iv': 1, 'iw': 1, 'ix': 1, 'iy': 1, 'iz': 1, 'ja': 1, 'jc': 1, 'je': 1, 'ji': 1, 'jj': 1, 'jk': 1, 'jn': 1, 'jo': 1, 'ju': 1, 'ka': 1, 'kb': 1, 'kc': 1, 'kd': 1, 'ke': 1, 'kf': 1, 'kg': 1, 'kh': 1, 'ki': 1, 'kj': 1, 'kk': 1, 'kl': 1, 'km': 1, 'kn': 1, 'ko': 1, 'kp': 1, 'kr': 1, 'ks': 1, 'kt': 1, 'ku': 1, 'kv': 1, 'kw': 1, 'ky': 1, 'la': 1, 'lb': 1, 'lc': 1, 'ld': 1, 'le': 1, 'lf': 1, 'lg': 1, 'lh': 1, 'li': 1, 'lj': 1, 'lk': 1, 'll': 1, 'lm': 1, 'ln': 1, 'lo': 1, 'lp': 1, 'lq': 1, 'lr': 1, 'ls': 1, 'lt': 1, 'lu': 1, 'lv': 1, 'lw': 1, 'lx': 1, 'ly': 1, 'lz': 1, 'ma': 1, 'mb': 1, 'mc': 1, 'md': 1, 'me': 1, 'mf': 1, 'mg': 1, 'mh': 1, 'mi': 1, 'mj': 1, 'mk': 1, 'ml': 1, 'mm': 1, 'mn': 1, 'mo': 1, 'mp': 1, 'mq': 1, 'mr': 1, 'ms': 1, 'mt': 1, 'mu': 1, 'mv': 1, 'mw': 1, 'my': 1, 'na': 1, 'nb': 1, 'nc': 1, 'nd': 1, 'ne': 1, 'nf': 1, 'ng': 1, 'nh': 1, 'ni': 1, 'nj': 1, 'nk': 1, 'nl': 1, 'nm': 1, 'nn': 1, 'no': 1, 'np': 1, 'nq': 1, 'nr': 1, 'ns': 1, 'nt': 1, 'nu': 1, 'nv': 1, 'nw': 1, 'nx': 1, 'ny': 1, 'nz': 1, 'oa': 1, 'ob': 1, 'oc': 1, 'od': 1, 'oe': 1, 'of': 1, 'og': 1, 'oh': 1, 'oi': 1, 'oj': 1, 'ok': 1, 'ol': 1, 'om': 1, 'on': 1, 'oo': 1, 'op': 1, 'oq': 1, 'or': 1, 'os': 1, 'ot': 1, 'ou': 1, 'ov': 1, 'ow': 1, 'ox': 1, 'oy': 1, 'oz': 1, 'pa': 1, 'pb': 1, 'pc': 1, 'pd': 1, 'pe': 1, 'pf': 1, 'pg': 1, 'ph': 1, 'pi': 1, 'pj': 1, 'pk': 1, 'pl': 1, 'pm': 1, 'pn': 1, 'po': 1, 'pp': 1, 'pr': 1, 'ps': 1, 'pt': 1, 'pu': 1, 'pw': 1, 'py': 1, 'pz': 1, 'qa': 1, 'qe': 1, 'qi': 1, 'qo': 1, 'qr': 1, 'qs': 1, 'qt': 1, 'qu': 1, 'ra': 1, 'rb': 1, 'rc': 1, 'rd': 1, 're': 1, 'rf': 1, 'rg': 1, 'rh': 1, 'ri': 1, 'rj': 1, 'rk': 1, 'rl': 1, 'rm': 1, 'rn': 1, 'ro': 1, 'rp': 1, 'rq': 1, 'rr': 1, 'rs': 1, 'rt': 1, 'ru': 1, 'rv': 1, 'rw': 1, 'rx': 1, 'ry': 1, 'rz': 1, 'sa': 1, 'sb': 1, 'sc': 1, 'sd': 1, 'se': 1, 'sf': 1, 'sg': 1, 'sh': 1, 'si': 1, 'sj': 1, 'sk': 1, 'sl': 1, 'sm': 1, 'sn': 1, 'so': 1, 'sp': 1, 'sq': 1, 'sr': 1, 'ss': 1, 'st': 1, 'su': 1, 'sv': 1, 'sw': 1, 'sy': 1, 'sz': 1, 'ta': 1, 'tb': 1, 'tc': 1, 'td': 1, 'te': 1, 'tf': 1, 'tg': 1, 'th': 1, 'ti': 1, 'tj': 1, 'tk': 1, 'tl': 1, 'tm': 1, 'tn': 1, 'to': 1, 'tp': 1, 'tr': 1, 'ts': 1, 'tt': 1, 'tu': 1, 'tv': 1, 'tw': 1, 'tx': 1, 'ty': 1, 'tz': 1, 'ua': 1, 'ub': 1, 'uc': 1, 'ud': 1, 'ue': 1, 'uf': 1, 'ug': 1, 'uh': 1, 'ui': 1, 'uj': 1, 'uk': 1, 'ul': 1, 'um': 1, 'un': 1, 'uo': 1, 'up': 1, 'uq': 1, 'ur': 1, 'us': 1, 'ut': 1, 'uu': 1, 'uv': 1, 'uw': 1, 'ux': 1, 'uy': 1, 'uz': 1, 'va': 1, 'vc': 1, 'vd': 1, 've': 1, 'vg': 1, 'vi': 1, 'vl': 1, 'vn': 1, 'vo': 1, 'vr': 1, 'vs': 1, 'vt': 1, 'vu': 1, 'vv': 1, 'vy': 1, 'vz': 1, 'wa': 1, 'wb': 1, 'wc': 1, 'wd': 1, 'we': 1, 'wf': 1, 'wg': 1, 'wh': 1, 'wi': 1, 'wj': 1, 'wk': 1, 'wl': 1, 'wm': 1, 'wn': 1, 'wo': 1, 'wp': 1, 'wr': 1, 'ws': 1, 'wt': 1, 'wu': 1, 'ww': 1, 'wy': 1, 'wz': 1, 'xa': 1, 'xb': 1, 'xc': 1, 'xe': 1, 'xf': 1, 'xg': 1, 'xh': 1, 'xi': 1, 'xl': 1, 'xm': 1, 'xn': 1, 'xo': 1, 'xp': 1, 'xq': 1, 'xs': 1, 'xt': 1, 'xu': 1, 'xv': 1, 'xw': 1, 'xx': 1, 'xy': 1, 'ya': 1, 'yb': 1, 'yc': 1, 'yd': 1, 'ye': 1, 'yf': 1, 'yg': 1, 'yh': 1, 'yi': 1, 'yj': 1, 'yk': 1, 'yl': 1, 'ym': 1, 'yn': 1, 'yo': 1, 'yp': 1, 'yr': 1, 'ys': 1, 'yt': 1, 'yu': 1, 'yv': 1, 'yw': 1, 'yx': 1, 'yz': 1, 'za': 1, 'zb': 1, 'zc': 1, 'zd': 1, 'ze': 1, 'zg': 1, 'zh': 1, 'zi': 1, 'zj': 1, 'zk': 1, 'zl': 1, 'zm': 1, 'zn': 1, 'zo': 1, 'zp': 1, 'zq': 1, 'zs': 1, 'zt': 1, 'zu': 1, 'zv': 1, 'zw': 1, 'zy': 1, 'zz': 1}

	const gibberish = str => {
		const clean = str.toLowerCase().replace(/\d|\W|_/g, ' ').replace(/\s+/g,' ').trim().split(' ').join('_')
		const len = clean.length
		const arr = [...clean]
		const gibbers = []
		arr.forEach((char, index) => {
			const next = index+1
			if (arr[next] == '_' || char == '_' || next == len) { return true }
			const combo = char+arr[index+1]
			const acceptable = !!accept[combo]
			!acceptable && gibbers.push(combo)
			return 
		})
		return gibbers
	}

	// nested contentWindow context
	const getNestedContentWindowContext = instanceId => {
		return new Promise(resolve => {
			try {
				const thisSiteCantBeReached = `about:${instanceId}` // url must yield 'this site cant be reached' error
				const createIframe = (doc, id, contentWindow = false) => {
					const iframe = doc.createElement('iframe')
					iframe.setAttribute('id', id)
					iframe.setAttribute('style', 'visibility: hidden; height: 0')
					iframe.setAttribute('sandbox', 'allow-same-origin')
					if (isChrome) {
						iframe.src = thisSiteCantBeReached 
					}
					doc.body.appendChild(iframe)
					const rendered = doc.getElementById(id)
					return {
						el: rendered,
						context: rendered[contentWindow ? 'contentWindow' : 'contentDocument'],
						remove: () => rendered.parentNode.removeChild(rendered)
					}
				}
				const parentIframe = createIframe(document, `${instanceId}-parent-iframe`)
				const {
					context: contentWindow
				} = createIframe(parentIframe.context, `${instanceId}-nested-iframe`, true)

				if (isChrome) { contentWindow.location = thisSiteCantBeReached  }

				setTimeout(()=> {
					resolve({ contentWindow, parentIframe })
				}, 100) // delay frame load
				return
			}
			catch (error) {
				captureError(error, 'client blocked nested iframe context')
				return resolve({contentWindow: undefined, parentIframe: undefined})
			}
		})
	}
	const { contentWindow, parentIframe  } = await getNestedContentWindowContext(instanceId)

	// detect and fingerprint Function API lies
	const native = (result, str) => {
		const chrome = `function ${str}() { [native code] }`
		const chromeGet = `function get ${str}() { [native code] }`
		const firefox = `function ${str}() {\n    [native code]\n}`
		return result == chrome || result == chromeGet || result == firefox
	}
	const hasLiedStringAPI = () => {
		let lies = []

		// detect attempts to rewrite Function.prototype.toString conversion APIs
		const toString = (
			contentWindow ? 
			contentWindow.Function.prototype.toString.call(Function.prototype.toString) : // aggressive test
			Function.prototype.toString
		)
		if (!native(toString, 'toString')) {
			lies.push({ ['failed API toString test']: toString })
		}

		return () => lies
	}
	const stringAPILieTypes = hasLiedStringAPI() // compute and cache result
	const hasLiedAPI = (api, name, obj = undefined) => {
		const { toString: fnToStr } = Function.prototype

		if (typeof api == 'function') {
			let lies = [...stringAPILieTypes()]
			let fingerprint = ''

			// detect attempts to rename the API and/or rewrite toString
			const { name: apiName, toString: apiToString } = api
			if (apiName != name) {
				lies.push({
					['failed API name test']: !proxyBehavior(apiName) ? apiName: true
				})
			}
			if (apiToString !== fnToStr || apiToString.toString !== fnToStr) {
				lies.push({
					['failed API toString test']: !proxyBehavior(apiToString) ? apiToString: true
				})
			}

			// detect attempts to tamper with getter
			if (obj) {
				try {
					Object.getOwnPropertyDescriptor(obj, name).get.toString()
					lies.push({
						['failed API get test']: true
					})
				}
				catch (error) {
					// Native throws error
				}
			}

			// collect string conversion result
			const result = (
				contentWindow ? 
				contentWindow.Function.prototype.toString.call(api) :
				'' + api
			)

			// fingerprint result if it does not match native code
			if (!native(result, name)) {
				fingerprint = result
			}
			
			return {
				lie: lies.length || fingerprint ? { lies, fingerprint } : false 
			}
		}

		if (typeof api == 'object') {
			const apiFunction = Object.getOwnPropertyDescriptor(api, name).get
			let lies = [...stringAPILieTypes()]
			let fingerprint = ''

			// detect attempts to rename the API and/or rewrite toString
			try {
				const { name: apiName, toString: apiToString } = apiFunction
				if (apiName != `get ${name}` && apiName != name) {
					lies.push({
						['failed API name test']: !proxyBehavior(apiName) ? apiName: true
					})
				}
				if (apiToString !== fnToStr || apiToString.toString !== fnToStr) {
					lies.push({
						['failed API toString test']: !proxyBehavior(apiToString) ? apiToString : true
					})
				}

				if (obj) {
					try {
						const definedPropertyValue = Object.getOwnPropertyDescriptor(obj, name).value
						lies.push({
							['failed API value test']: true
						})
					}
					catch (error) {
						// Native throws error
					}
				}

				// collect string conversion result
				const result = (
					contentWindow ? 
					contentWindow.Function.prototype.toString.call(apiFunction) :
					'' + apiFunction
				)

				// fingerprint result if it does not match native code
				if (!native(result, name)) {
					fingerprint = result
				}

				return {
					lie: lies.length || fingerprint ? { lies, fingerprint } : false
				}
			}
			catch (error) {
				captureError(error)
				return false
				
			}
		}

		return false
	}

	// id known hash
	const known = hash => {
		const id = {
			'fb4ad71a65a801e6c81c16fd248e41081cc81f853fc4775df812749affb9b3e7': 'Chromium', // math
			'c60fecd4250b930eac196bc4ec84f60ced4a28e2832d5b54f38a755088dd62b1': 'Firefox', // math
			'7757f7416b78fb8ac1f079b3e0677c0fe179826a63727d809e7d69795e915cd5': 'Chromium', // errors
			'21f2f6f397db5fa611029154c35cd96eb9a96c4f1c993d4c3a25da765f2dd13b': 'Firefox' // errors
		}
		return id[hash] ? id[hash] : 'Other'
	}

	// Collect trash values
	const trashBin = []
	const sendToTrash = (name, val, response = undefined) => {
		const proxyLike = proxyBehavior(val)
		const value = !proxyLike ? val : 'proxy behavior detected'
		trashBin.push({ name, value })
		return response
	}

	// Collect lies detected
	const lieRecords = []
	const documentLie = (name, lieResult, lieTypes) => {
		return lieRecords.push({ name, lieTypes, hash: lieResult, lie: hashMini(lieTypes) })
	}

	// validate
	const isInt = (x) => typeof x == 'number' && x % 1 == 0
	const trustInteger = (name, val) => {
		const trusted = isInt(val) 
		return trusted ? val : sendToTrash(name, val)
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
		)
		return os
	}

	// worker
	// https://stackoverflow.com/a/20693860
	// https://stackoverflow.com/a/10372280
	// https://stackoverflow.com/a/9239272
	const newWorker = (fn, caniuse) => {
		const response = `(${''+fn})(${''+caniuse})`
		try {
			const blobURL = URL.createObjectURL(new Blob(
				[response],
				{ type: 'application/javascript' }
			))

			let worker
			if (contentWindow) {
				worker = contentWindow.Worker
			}
			else {
				worker = Worker
			}
			const workerInstance = new worker(blobURL)
			URL.revokeObjectURL(blobURL)
			return workerInstance
		}
		catch (error) {
			captureError(error, 'worker Blob failed or blocked by client')
			// try backup
			try {
				const uri = `data:application/javascript,${encodeURIComponent(response)}`
				return new worker(uri)
			}
			catch (error) {
				captureError(error, 'worker URI failed or blocked by client')
				return undefined
			}
		}
	}
	// inline worker scope
	const inlineWorker = async caniuse => {
		
		let canvas2d = undefined
		try {
			const canvasOffscreen2d = new OffscreenCanvas(256, 256)
			const context2d = canvasOffscreen2d.getContext('2d')
			const str = '%$%^LGFWE($HIF)'
			context2d.font = '20px Arial'
			context2d.fillText(str, 100, 100)
			context2d.fillStyle = 'red'
			context2d.fillRect(100, 30, 80, 50)
			context2d.font = '32px Times New Roman'
			context2d.fillStyle = 'blue'
			context2d.fillText(str, 20, 70)
			context2d.font = '20px Arial'
			context2d.fillStyle = 'green'
			context2d.fillText(str, 10, 50)
			const getDataURI = async () => {
				const blob = await canvasOffscreen2d.convertToBlob()
				const reader = new FileReader()
				reader.readAsDataURL(blob)
				return new Promise(resolve => {
					reader.onloadend = () => resolve(reader.result)
				})
			}
			canvas2d = await getDataURI() 
		}
		catch (error) { }
		let webglVendor = undefined
		let webglRenderer = undefined
		try {
			const canvasOffscreenWebgl = new OffscreenCanvas(256, 256)
			const contextWebgl = canvasOffscreenWebgl.getContext('webgl')
			const renererInfo = contextWebgl.getExtension('WEBGL_debug_renderer_info')
    		webglVendor = contextWebgl.getParameter(renererInfo.UNMASKED_VENDOR_WEBGL)
    		webglRenderer = contextWebgl.getParameter(renererInfo.UNMASKED_RENDERER_WEBGL)
		}
		catch (error) { }

		const computeTimezoneOffset = () => {
			const date = new Date().getDate()
			const month = new Date().getMonth()
			const year = Date().split` `[3] // current year
			const dateString = `${month}/${date}/${year}`
			const toJSONParsed = (x) => JSON.parse(JSON.stringify(x))
			const utc = Date.parse(toJSONParsed(new Date(dateString)).split`Z`.join``)
			const now = +new Date(dateString)
			return +(((utc - now)/60000).toFixed(0))
		}
		const timezoneOffset = computeTimezoneOffset()
		const hardwareConcurrency = caniuse(() => navigator, ['hardwareConcurrency'])
		const language = caniuse(() => navigator, ['language'])
		const platform = caniuse(() => navigator, ['platform'])
		const userAgent = caniuse(() => navigator, ['userAgent'])

		postMessage({ ['timezone offset']: timezoneOffset, hardwareConcurrency, language, platform, userAgent, canvas2d, ['webgl renderer']: webglRenderer, ['webgl vendor']: webglVendor })
		close()
	}

	const getWorkerScope = (instanceId) => {
		return new Promise(resolve => {
			try {
				const worker = newWorker(inlineWorker, caniuse)
				if (!worker) {
					return resolve(undefined)
				}
				worker.addEventListener('message', async event => {
					const { data, data: { canvas2d } } = event
					data.system = getOS(data.userAgent)
					data.canvas2d = { dataURI: canvas2d, $hash: await hashify(canvas2d) }
					const $hash = await hashify(data)
					resolve({ ...data, $hash })
					const el = document.getElementById(`${instanceId}-worker-scope`)
					patch(el, html`
					<div>
						<strong>WorkerGlobalScope: WorkerNavigator/OffscreenCanvas</strong>
						<div>hash: ${$hash}</div>
						${
							Object.keys(data).map(key => {
								const value = data[key]
								return (
									key != 'canvas2d' && key != 'userAgent'? `<div>${key}: ${value != undefined ? value : note.blocked}</div>` : ''
								)
							}).join('')
						}
						<div>canvas 2d: ${data.canvas2d.$hash}</div>
					</div>
					`)
					return
				}, false)
			}
			catch (error) {
				captureError(error)
				return resolve(undefined)
			}
		})
	}
	
	// webtrc
	const getWebRTCData = (instanceId, cloudflare) => {
		return new Promise(resolve => {
			try {
				let rtcPeerConnection
				if (contentWindow && !isFirefox) { // FF throws an error in iframes
					rtcPeerConnection = (
						contentWindow.RTCPeerConnection ||
						contentWindow.webkitRTCPeerConnection ||
						contentWindow.mozRTCPeerConnection ||
						contentWindow.msRTCPeerConnection
					)
				}
				else {
					rtcPeerConnection = (
						window.RTCPeerConnection ||
						window.webkitRTCPeerConnection ||
						window.mozRTCPeerConnection ||
						window.msRTCPeerConnection
					)
				}
				
				const connection = new rtcPeerConnection({
					iceServers: [{
						urls: ['stun:stun.l.google.com:19302?transport=udp']
					}]
				}, {
					optional: [{
						RtpDataChannels: true
					}]
				})
				
				let success = false
				connection.onicecandidate = async e => {
					const candidateEncoding = /((udp|tcp)\s)((\d|\w)+\s)((\d|\w|(\.|\:))+)(?=\s)/ig
					const connectionLineEncoding = /(c=IN\s)(.+)\s/ig
					if (!e.candidate) {
						return
					}
					success = true
					const { candidate } = e.candidate
					const encodingMatch = candidate.match(candidateEncoding)
					if (encodingMatch) {
						const {
							sdp
						} = e.target.localDescription
						const ipAddress = attempt(() => e.candidate.address)
						const candidateIpAddress = attempt(() => encodingMatch[0].split(' ')[2])
						const connectionLineIpAddress = attempt(() => sdp.match(connectionLineEncoding)[0].trim().split(' ')[2])
						const successIpAddresses = [
							ipAddress, 
							candidateIpAddress, 
							connectionLineIpAddress
						].filter(ip => ip != undefined)
						const setSize = new Set(successIpAddresses).size
						const matching = setSize == 1 || setSize == 0
						const cloudflareIp = cloudflare && 'ip' in cloudflare ? cloudflare.ip : undefined
						const data = {
							['webRTC leak']: cloudflareIp && (
								!!ipAddress && ipAddress != cloudflareIp
							) ? true : 'unknown',
							['ip address']: ipAddress,
							['candidate encoding']: candidateIpAddress,
							['connection line']: connectionLineIpAddress,
							['matching']: matching
						}
						const $hash = await hashify(data)
						resolve({ ...data, $hash })
						const el = document.getElementById(`${instanceId}-webrtc`)
						patch(el, html`
						<div>
							<strong>RTCPeerConnection</strong>
							<div>hash: ${$hash}</div>
							${
								Object.keys(data).map(key => {
									const value = data[key]
									return (
										`<div>${key}: ${value != undefined ? value : note.blocked}</div>`
									)
								}).join('')
							}
						</div>
						`)
						return
					}
				}
				setTimeout(() => !success && resolve(undefined), 1000)
				connection.createDataChannel('creep')
				connection.createOffer()
					.then(e => connection.setLocalDescription(e))
					.catch(error => console.log(error))
			}
			catch (error) {
				captureError(error, 'RTCPeerConnection failed or blocked by client')
				return resolve(undefined)
			}
		})
	}

	// cloudflare
	const getCloudflare = instanceId => {
		return new Promise(async resolve => {
			try {
				const api = 'https://www.cloudflare.com/cdn-cgi/trace'
				const res = await fetch(api)
				const text = await res.text()
				const lines = text.match(/^(?:ip|uag|loc|tls)=(.*)$/igm)
				const data = {}
				lines.forEach(line => {
					const key = line.split('=')[0]
					const value = line.substr(line.indexOf('=') + 1)
					data[key] = value
				})
				data.uag = getOS(data.uag)
				const $hash = await hashify(data)
				resolve({ ...data, $hash })
				const el = document.getElementById(`${instanceId}-cloudflare`)
				patch(el, html`
				<div>
					<strong>Cloudflare</strong>
					<div>hash: ${$hash}</div>
					${
						Object.keys(data).map(key => {
							const value = data[key]
							key = (
								key == 'ip' ? 'ip address' :
								key == 'uag' ? 'system' :
								key == 'loc' ? 'ip location' :
								key == 'tls' ? 'tls version' :
								key
							)
							return `<div>${key}: ${value ? value : note.blocked}</div>`
						}).join('')
					}
				</div>
				`)
				return
			}
			catch (error) {
				captureError(error, 'cloudflare.com: failed or client blocked')
				return resolve(undefined)
			}
		})
	}
	
	// navigator
	const getNavigator = (instanceId, workerScope) => {
		return new Promise(async resolve => {
			try {
				contentWindowNavigator = contentWindow.navigator
				const navigatorPrototype = attempt(() => Navigator.prototype)
				const detectLies = (name, value) => {
					const workerScopeValue = caniuse(() => workerScope, [name])
					const workerScopeMatchLie = { lies: [{ ['does not match worker scope']: false }] }
					if (workerScopeValue) {
						if (name == 'userAgent') {
							const system = getOS(value)
							if (workerScope.system != system) {
								documentLie(name, system, workerScopeMatchLie)
								return value
							}
						}
						else if (name != 'userAgent' && workerScopeValue != value) {
							console.log(name+':')
							console.log('Worker', workerScopeValue)
							console.log('Window', value)
							documentLie(name, value, workerScopeMatchLie)
							return value
						}
					}
					const lie = navigatorPrototype ? hasLiedAPI(navigatorPrototype, name, navigator).lie : false
					if (lie) {
						documentLie(name, value, lie)
						return value
					}
					return value
				}
				const credibleUserAgent = (
					'chrome' in window ? contentWindowNavigator.userAgent.includes(contentWindowNavigator.appVersion) : true
				)
				const data = {
					appVersion: attempt(() => {
						const { appVersion } = contentWindowNavigator
						let av = undefined
						av = detectLies('appVersion', appVersion)
						if (!credibleUserAgent) {
							av = sendToTrash('appVersion does not match userAgent', appVersion)
						}
						if ('appVersion' in contentWindowNavigator && !appVersion) {
							av = sendToTrash('appVersion', 'Living Standard property returned falsy value')
						}
						return av
					}),
					deviceMemory: attempt(() => {
						if ('deviceMemory' in contentWindowNavigator) {
							const deviceMemory = detectLies('deviceMemory', contentWindowNavigator.deviceMemory)
							return deviceMemory ? trustInteger('deviceMemory: invalid return type', deviceMemory) : undefined
						}
						return undefined
					}),
					doNotTrack: attempt(() => {
						const doNotTrack = detectLies('doNotTrack', contentWindowNavigator.doNotTrack)
						const trusted = {
							'1': true,
							'true': true, 
							'yes': true,
							'0': true, 
							'false': true, 
							'no': true, 
							'unspecified': true, 
							'null': true,
							'undefined': true
						}
						return trusted[doNotTrack] ? doNotTrack : sendToTrash('DoNotTrack: invalid return type', doNotTrack)
					}),
					hardwareConcurrency: attempt(() => {
						const hardwareConcurrency = detectLies('hardwareConcurrency', contentWindowNavigator.hardwareConcurrency)
						return hardwareConcurrency ? trustInteger('hardwareConcurrency: invalid return type', hardwareConcurrency): undefined
					}),
					language: attempt(() => {
						const languages = detectLies('languages', contentWindowNavigator.languages)
						const language = detectLies('language', contentWindowNavigator.language)

						if (languages && languages) {
							const langs = /^.{0,2}/g.exec(languages[0])[0]
							const lang = /^.{0,2}/g.exec(language)[0]
							const trusted = langs == lang
							return (
								trusted ? `${languages.join(', ')} (${language})` : 
								sendToTrash('languages: language/languages mismatch', [languages, language].join(' '))
							)
						}

						return undefined
					}),
					maxTouchPoints: attempt(() => {
						if ('maxTouchPoints' in contentWindowNavigator) {
							const maxTouchPoints = detectLies('maxTouchPoints', contentWindowNavigator.maxTouchPoints)
							return maxTouchPoints != undefined ? trustInteger('MaxTouchPoints: invalid return type', maxTouchPoints) : undefined
						}

						return null
					}),
					platform: attempt(() => {
						const platform = detectLies('platform', contentWindowNavigator.platform)
						const systems = ['win', 'linux', 'mac', 'arm', 'pike', 'linux', 'iphone', 'ipad', 'ipod', 'android', 'x11']
						const trusted = typeof platform == 'string' && systems.filter(val => platform.toLowerCase().includes(val))[0]
						return trusted ? platform : undefined
					}),
					userAgent: attempt(() => {
						const { userAgent } = contentWindowNavigator
						const gibbers = gibberish(userAgent)
						let ua = undefined
						ua = detectLies('userAgent', userAgent)
						if (!!gibbers.length) {
							ua = sendToTrash(`userAgent contains gibberish`, `[${gibbers.join(', ')}] ${userAgent}`)
						}
						return credibleUserAgent ? ua : sendToTrash('userAgent does not match appVersion', userAgent)
					}),
					system: attempt(() => getOS(contentWindowNavigator.userAgent)),
					vendor: attempt(() => {
						const vendor = detectLies('vendor', contentWindowNavigator.vendor)
						return vendor
					}),
					mimeTypes: attempt(() => {
						const mimeTypes = detectLies('mimeTypes', contentWindowNavigator.mimeTypes)
						return mimeTypes ? [...mimeTypes].map(m => m.type) : []
					}),
					plugins: attempt(() => {
						const plugins = detectLies('plugins', contentWindowNavigator.plugins)
						return plugins ? [...contentWindowNavigator.plugins]
							.map(p => ({
								name: p.name,
								description: p.description,
								filename: p.filename,
								version: p.version
							})) : []
					}),
					properties: attempt(() => {
						const keys = Object.keys(Object.getPrototypeOf(contentWindowNavigator))
						return keys
					}),
					highEntropyValues: await attempt(async () => { 
						if (!('userAgentData' in contentWindowNavigator)) {
							return undefined
						}
						const data = await contentWindowNavigator.userAgentData.getHighEntropyValues(
							['platform', 'platformVersion', 'architecture',  'model', 'uaFullVersion']
						)
						return data
					})
				}
				const $hash = await hashify(data)
				resolve({ ...data, $hash })
				const id = `${instanceId}-navigator`
				const el = document.getElementById(id)
				const { mimeTypes, plugins, highEntropyValues, properties } = data
				const blocked = {
					[null]: true,
					[undefined]: true,
					['']: true
				}
				patch(el, html`
				<div>
					<strong>Navigator</strong>
					<div>hash: ${$hash}</div>
					${
						Object.keys(data).map(key => {
							const skip = [
								'mimeTypes',
								'plugins',
								'properties',
								'highEntropyValues'
							].indexOf(key) > -1
							const value = data[key]
							return (
								!skip ? `<div>${key}: ${!blocked[value] ? value : key == 'doNotTrack' ? value : note.blocked}</div>` : ''
							)
						}).join('')
					}
					<div>plugins (${count(plugins)}): ${!blocked[''+plugins] ? modal(`${id}-plugins`, plugins.map(plugin => plugin.name).join('<br>')) : note.blocked}</div>
					<div>mimeTypes (${count(mimeTypes)}): ${!blocked[''+mimeTypes] ? modal(`${id}-mimeTypes`, mimeTypes.join('<br>')): note.blocked}</div>
					${highEntropyValues ?  
						Object.keys(highEntropyValues).map(key => {
							const value = highEntropyValues[key]
							return `<div>ua ${key}: ${value ? value : note.blocked}</div>`
						}).join('') :
						`<div>ua architecture: ${note.unsupported}</div>
						<div>ua model: ${note.unsupported}</div>
						<div>ua platform: ${note.unsupported}</div>
						<div>ua platformVersion: ${note.unsupported}</div>
						<div>ua uaFullVersion: ${note.unsupported} </div>`
					}
					<div>properties (${count(properties)}): ${modal(`${id}-properties`, properties.join(', '))}</div>
				</div>
				`)
				return
			}
			catch (error) {
				captureError(error)
				return resolve(undefined)
			}
		})
	}
	
	// iframe.contentWindow
	const getIframeContentWindowVersion = (instanceId) => {
		return new Promise(async resolve => {
			try {
				
				const keys = Object.getOwnPropertyNames(contentWindow) 
				const $hash = await hashify(keys)
				resolve({ keys, $hash })
				const el = document.getElementById(`${instanceId}-iframe-content-window-version`)
				patch(el, html`
				<div>
					<strong>HTMLIFrameElement.contentWindow</strong>
					<div>hash: ${$hash}</div>
					<div>keys: ${keys.length}</div>
				</div>
				`)
				return
			}
			catch (error) {
				captureError(error)
				return resolve(undefined)
			}
		})
	}

	// HTMLElement	
	const getHTMLElementVersion = instanceId => {
		return new Promise(async resolve => {
			try {
				const id = `${instanceId}-html-element-version-test`
				const element = document.createElement('div')
				element.setAttribute('id', id)
				document.body.appendChild(element) 
				const htmlElement = document.getElementById(id)
				const keys = []
				for (const key in htmlElement) {
					keys.push(key)
				}
				const $hash = await hashify(keys)
				resolve({ keys, $hash })
				const el = document.getElementById(`${instanceId}-html-element-version`)
				patch(el, html`
				<div>
					<strong>HTMLElement</strong>
					<div>hash: ${$hash}</div>
					<div>keys: ${keys.length}</div>
				</div>
				`)
				return
			}
			catch (error) {
				captureError(error)
				return resolve(undefined)
			}
		})
	}

	// CSSStyleDeclaration
	const computeStyle = type => {
		return new Promise(async resolve => {
			try {
				// get CSSStyleDeclaration
				const cssStyleDeclaration = (
					type == 'getComputedStyle' ? getComputedStyle(document.body) :
					type == 'HTMLElement.style' ? document.body.style :
					type == 'CSSRuleList.style' ? document.styleSheets[0].cssRules[0].style :
					undefined
				)
				if (!cssStyleDeclaration) {
					throw new TypeError('invalid argument string')
				}
				// get properties
				const prototype = Object.getPrototypeOf(cssStyleDeclaration)
				const prototypeProperties = Object.getOwnPropertyNames(prototype)
				const ownEnumerablePropertyNames = []
				const cssVar = /^--.*$/
				Object.keys(cssStyleDeclaration).forEach(key => {
					const numericKey = !isNaN(key)
					const value = cssStyleDeclaration[key]
					const customPropKey = cssVar.test(key)
					const customPropValue = cssVar.test(value)
					if (numericKey && !customPropValue) {
						return ownEnumerablePropertyNames.push(value)
					} else if (!numericKey && !customPropKey) {
						return ownEnumerablePropertyNames.push(key)
					}
					return
				})
				// get properties in prototype chain (required only in chrome)
				const propertiesInPrototypeChain = {}
				const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1)
				const uncapitalize = str => str.charAt(0).toLowerCase() + str.slice(1)
				const removeFirstChar = str => str.slice(1)
				const caps = /[A-Z]/g
				ownEnumerablePropertyNames.forEach(key => {
					if (propertiesInPrototypeChain[key]) {
						return
					}
					// determine attribute type
					const isNamedAttribute = key.indexOf('-') > -1
					const isAliasAttribute = caps.test(key)
					// reduce key for computation
					const firstChar = key.charAt(0)
					const isPrefixedName = isNamedAttribute && firstChar == '-'
					const isCapitalizedAlias = isAliasAttribute && firstChar == firstChar.toUpperCase()
					key = (
						isPrefixedName ? removeFirstChar(key) :
						isCapitalizedAlias ? uncapitalize(key) :
						key
					)
					// find counterpart in CSSStyleDeclaration object or its prototype chain
					if (isNamedAttribute) {
						const aliasAttribute = key.split('-').map((word, index) => index == 0 ? word : capitalize(word)).join('')
						if (aliasAttribute in cssStyleDeclaration) {
							propertiesInPrototypeChain[aliasAttribute] = true
						} else if (capitalize(aliasAttribute) in cssStyleDeclaration) {
							propertiesInPrototypeChain[capitalize(aliasAttribute)] = true
						}
					} else if (isAliasAttribute) {
						const namedAttribute = key.replace(caps, char => '-' + char.toLowerCase())
						if (namedAttribute in cssStyleDeclaration) {
							propertiesInPrototypeChain[namedAttribute] = true
						} else if (`-${namedAttribute}` in cssStyleDeclaration) {
							propertiesInPrototypeChain[`-${namedAttribute}`] = true
						}
					}
					return
				})
				// compile keys
				const keys = [
					...new Set([
						...prototypeProperties,
						...ownEnumerablePropertyNames,
						...Object.keys(propertiesInPrototypeChain)
					])
				]
				// checks
				const moz = keys.filter(key => (/moz/i).test(key)).length
				const webkit = keys.filter(key => (/webkit/i).test(key)).length
				const prototypeName = (''+prototype).match(/\[object (.+)\]/)[1]
				const data = { keys: keys.sort(), moz, webkit, prototypeName }
				const $hash = await hashify(data)
				return resolve({ ...data, $hash })
			}
			catch (error) {
				captureError(error)
				return resolve(undefined)
			}
		})
	}

	const getCSSStyleDeclarationVersion = instanceId => {
		return new Promise(async resolve => {
			try {
				const [
					getComputedStyle,
					htmlElementStyle,
					cssRuleListstyle
				] = await Promise.all([
					computeStyle('getComputedStyle'),
					computeStyle('HTMLElement.style'),
					computeStyle('CSSRuleList.style')
				]).catch(error => {
					console.error(error.message)
				})
				const data = {
					['getComputedStyle']: getComputedStyle,
					['HTMLElement.style']: htmlElementStyle,
					['CSSRuleList.style']: cssRuleListstyle,
					matching: (
						''+getComputedStyle == ''+htmlElementStyle &&
						''+htmlElementStyle == ''+cssRuleListstyle
					)
				}
				const $hash = await hashify(data)
				resolve({ ...data, $hash })
				const el = document.getElementById(`${instanceId}-css-style-declaration-version`)
				patch(el, html`
				<div>
					<strong>CSSStyleDeclaration</strong>
					<div>hash: ${$hash}</div>
					<div>prototype: ${htmlElementStyle.prototypeName}</div>
					${
						Object.keys(data).map(key => {
							const value = data[key]
							return key != 'matching' ? `<div>${key}: ${value ? value.$hash : note.blocked}</div>` : ''
						}).join('')
					}
					<div>keys: ${getComputedStyle.keys.length}, ${htmlElementStyle.keys.length}, ${cssRuleListstyle.keys.length}
					</div>
					<div>moz: ${''+getComputedStyle.moz}, ${''+htmlElementStyle.moz}, ${''+cssRuleListstyle.moz}
					</div>
					<div>webkit: ${''+getComputedStyle.webkit}, ${''+htmlElementStyle.webkit}, ${''+cssRuleListstyle.webkit}
					</div>
					<div>matching: ${''+data.matching}</div>
				</div>
				`)
				return
			}
			catch (error) {
				captureError(error)
				return resolve(undefined)
			}
		})
	}

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
		]
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
	}

	const getScreen = instanceId => {
		return new Promise(async resolve => {
			const contentWindowScreen = contentWindow.screen
			try {
				const screenPrototype = attempt(() => Screen.prototype)
				const detectLies = (name, value) => {
					const lie = screenPrototype ? hasLiedAPI(screenPrototype, name, contentWindowScreen).lie : false
					if (lie) {
						documentLie(name, value, lie)
						return value
					}
					return value
				}
				const width = detectLies('width', contentWindowScreen.width)
				const height = detectLies('height', contentWindowScreen.height)
				const availWidth = detectLies('availWidth', contentWindowScreen.availWidth)
				const availHeight = detectLies('availHeight', contentWindowScreen.availHeight)
				const colorDepth = detectLies('colorDepth', contentWindowScreen.colorDepth)
				const pixelDepth = detectLies('pixelDepth', contentWindowScreen.pixelDepth)
				const data = {
					device: getDevice(contentWindowScreen.width, contentWindowScreen.height),
					width: attempt(() => width ? trustInteger('InvalidWidth', width) : undefined),
					outerWidth: attempt(() => outerWidth ? trustInteger('InvalidOuterWidth', outerWidth) : undefined),
					availWidth: attempt(() => availWidth ? trustInteger('InvalidAvailWidth', availWidth) : undefined),
					height: attempt(() => height ? trustInteger('InvalidHeight', height) : undefined),
					outerHeight: attempt(() => outerHeight ? trustInteger('InvalidOuterHeight', outerHeight) : undefined),
					availHeight: attempt(() => availHeight ?  trustInteger('InvalidAvailHeight', availHeight) : undefined),
					colorDepth: attempt(() => colorDepth ? trustInteger('InvalidColorDepth', colorDepth) : undefined),
					pixelDepth: attempt(() => pixelDepth ? trustInteger('InvalidPixelDepth', pixelDepth) : undefined)
				}
				const $hash = await hashify(data)
				resolve({ ...data, $hash })
				const el = document.getElementById(`${instanceId}-screen`)
				patch(el, html`
				<div>
					<strong>Screen</strong>
					<div>hash: ${$hash}</div>
					${
						Object.keys(data).map(key => {
							const value = data[key]
							return `<div>${key}: ${value ? value : note.blocked}</div>`
						}).join('')
					}
				</div>
				`)
				return
			}
			catch (error) {
				captureError(error)
				return resolve(undefined)
			}
		})
	}

	// voices
	const getVoices = instanceId => {	
		return new Promise(async resolve => {
			try {
				let voices = []
				const respond = async (resolve, voices) => {
					voices = voices.map(({ name, lang }) => ({ name, lang }))
					const $hash = await hashify(voices)
					resolve({ voices, $hash })
					const id = `${instanceId}-voices`
					const el = document.getElementById(id)
					const voiceList = voices.map(voice => `${voice.name} (${voice.lang})`)
					patch(el, html`
					<div>
						<strong>SpeechSynthesis</strong>
						<div>hash: ${$hash}</div>
						<div>voices (${count(voices)}): ${voiceList && voiceList.length ? modal(id, voiceList.join('<br>')) : note.blocked}</div>
					</div>
					`)
					return
				}
				if (!('speechSynthesis' in window)) {
					return resolve(undefined)
				}
				else if (!('chrome' in window)) {
					voices = await speechSynthesis.getVoices()
					return respond(resolve, voices)
				}
				else if (!speechSynthesis.getVoices || speechSynthesis.getVoices() == undefined) {
					return resolve(undefined)
				}
				else if (speechSynthesis.getVoices().length) {
					voices = speechSynthesis.getVoices()
					return respond(resolve, voices)
				} else {
					speechSynthesis.onvoiceschanged = () => {
						voices = speechSynthesis.getVoices()
						return resolve(new Promise(resolve => respond(resolve, voices)))
					}
				}
			}
			catch (error) {
				captureError(error)
				return resolve(undefined)
			}
		})
	}

	// media devices
	const getMediaDevices = instanceId => {
		return new Promise(async resolve => {
			try {
				if (!('mediaDevices' in navigator)) {
					return resolve(undefined)
				}
				if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
					return resolve(undefined)
				}
				const mediaDevicesEnumerated = await navigator.mediaDevices.enumerateDevices()
				const mediaDevices = mediaDevicesEnumerated ? mediaDevicesEnumerated.map(({ kind }) => ({ kind })) : undefined
				const $hash = await hashify(mediaDevices)
				resolve({ mediaDevices, $hash })
				const el = document.getElementById(`${instanceId}-media-devices`)
				patch(el, html`
				<div>
					<strong>MediaDevicesInfo</strong>
					<div>hash: ${$hash}</div>
					<div>devices (${count(mediaDevices)}): ${mediaDevices ? mediaDevices.map(device => device.kind).join(', ') : note.blocked}</div>
				</div>
				`)
				return
			}
			catch (error) {
				captureError(error)
				return resolve(undefined)
			}
		})
	}

	// canvas
	const canvasToDataURL = attempt(() => HTMLCanvasElement.prototype.toDataURL)
	const canvasGetContext = attempt(() => HTMLCanvasElement.prototype.getContext)
	const canvasProto = caniuse(() => HTMLCanvasElement, ['prototype'])
	const dataLie = canvasToDataURL ? hasLiedAPI(canvasToDataURL, 'toDataURL', canvasProto).lie : false
	const contextLie = canvasGetContext ? hasLiedAPI(canvasGetContext, 'getContext', canvasProto).lie : false
	
	// 2d canvas
	const getCanvas2d = instanceId => {
		return new Promise(async resolve => {
			try {
				const patchDom = (response) => {
					const { $hash } = response
					const el = document.getElementById(`${instanceId}-canvas-2d`)
					return patch(el, html`
					<div>
						<strong>CanvasRenderingContext2D</strong>
						<div>hash: ${$hash}</div>
					</div>
					`)
				}
				const canvas = document.createElement('canvas')
				let canvas2dDataURI = ''
				if (!dataLie && !contextLie) {
					const context = canvas.getContext('2d')
					const str = '%$%^LGFWE($HIF)'
					context.font = '20px Arial'
					context.fillText(str, 100, 100)
					context.fillStyle = 'red'
					context.fillRect(100, 30, 80, 50)
					context.font = '32px Times New Roman'
					context.fillStyle = 'blue'
					context.fillText(str, 20, 70)
					context.font = '20px Arial'
					context.fillStyle = 'green'
					context.fillText(str, 10, 50)
					canvas2dDataURI = canvas.toDataURL()
					const dataURI = canvas2dDataURI
					const $hash = await hashify(dataURI)
					const response = { dataURI, $hash }
					resolve(response)
					patchDom(response)
					return
				}
				// document lie and send to trash
				canvas2dDataURI = canvas.toDataURL()
				const hash = hashMini(canvas2dDataURI)
				if (contextLie) {
					documentLie('canvas2dContextDataURI', hash, contextLie)
				}
				if (dataLie) {
					documentLie('canvas2dDataURI', hash, dataLie)
				}
				// fingerprint lie
				const data = { contextLie, dataLie }
				const $hash = await hashify(data)
				const response = { ...data, $hash }
				resolve(response)
				patchDom(response)
				return
			}
			catch (error) {
				captureError(error)
				return resolve(undefined)
			}
		})
	}

	// bitmaprenderer
	const getCanvasBitmapRenderer = instanceId => {
		return new Promise(async resolve => {
			try {
				const patchDom = (response) => {
					const { $hash } = response
					const el = document.getElementById(`${instanceId}-canvas-bitmap-renderer`)
					return patch(el, html`
					<div>
						<strong>ImageBitmapRenderingContext</strong>
						<div>hash: ${$hash}</div>
					</div>
					`)
				}
				const canvas = document.createElement('canvas')
				let canvasBMRDataURI = ''
				if (!dataLie && !contextLie) {
					const context = canvas.getContext('bitmaprenderer')
					const image = new Image()
					image.src = 'bitmap.png'
					return resolve(new Promise(resolve => {
						image.onload = async () => {
							const bitmap = await createImageBitmap(image, 0, 0, image.width, image.height)
							context.transferFromImageBitmap(bitmap)
							canvasBMRDataURI = canvas.toDataURL()
							const dataURI = canvasBMRDataURI
							const $hash = await hashify(dataURI)
							const response = { dataURI, $hash }
							resolve(response)
							patchDom(response)
						}
					}))	
				}
				// document lie and send to trash
				canvasBMRDataURI = canvas.toDataURL()
				const hash = hashMini(canvasBMRDataURI)
				if (contextLie) {
					documentLie('canvasBMRContextDataURI', hash, contextLie)
				}
				if (dataLie) {
					documentLie('canvasBMRDataURI', hash, dataLie)
				}
				// fingerprint lie
				const data = { contextLie, dataLie }
				const $hash = await hashify(data)
				const response = { ...data, $hash }
				resolve(response)
				patchDom(response)
			}
			catch (error) {
				captureError(error)
				return resolve(undefined)
			}
		})
	}

	// webgl
	const getCanvasWebgl = instanceId => {
		return new Promise(async resolve => {
			try {
				// detect webgl lies
				const gl = 'WebGLRenderingContext' in window
				const webglGetParameter = gl && attempt(() => WebGLRenderingContext.prototype.getParameter)
				const webglGetExtension = gl && attempt(() => WebGLRenderingContext.prototype.getExtension)
				const webglProto = caniuse(() => WebGLRenderingContext, ['prototype'])
				const webglGetSupportedExtensions = gl && attempt(() => WebGLRenderingContext.prototype.getSupportedExtensions)
				const paramLie = webglGetParameter ? hasLiedAPI(webglGetParameter, 'getParameter', webglProto).lie : false
				const extLie = webglGetExtension ? hasLiedAPI(webglGetExtension, 'getExtension', webglProto).lie : false
				const supportedExtLie = webglGetSupportedExtensions ? hasLiedAPI(webglGetSupportedExtensions, 'getSupportedExtensions', webglProto).lie : false

				// detect webgl2 lies
				const gl2 = 'WebGL2RenderingContext' in window
				const webgl2GetParameter = gl2 && attempt(() => WebGL2RenderingContext.prototype.getParameter)
				const webgl2GetExtension = gl2 && attempt(() => WebGL2RenderingContext.prototype.getExtension)
				const webgl2Proto = caniuse(() => WebGL2RenderingContext, ['prototype'])
				const webgl2GetSupportedExtensions = gl2 && attempt(() => WebGL2RenderingContext.prototype.getSupportedExtensions)
				const param2Lie = webgl2GetParameter ? hasLiedAPI(webgl2GetParameter, 'getParameter', webgl2Proto).lie : false
				const ext2Lie = webgl2GetExtension ? hasLiedAPI(webgl2GetExtension, 'getExtension', webgl2Proto).lie : false
				const supportedExt2Lie = webgl2GetSupportedExtensions ? hasLiedAPI(webgl2GetSupportedExtensions, 'getSupportedExtensions', webgl2Proto).lie : false

				// crreate canvas context
				const canvas = document.createElement('canvas')
				const canvas2 = document.createElement('canvas')
				const context = (
					canvas.getContext('webgl') ||
					canvas.getContext('experimental-webgl') ||
					canvas.getContext('moz-webgl') ||
					canvas.getContext('webkit-3d')
				)
				const context2 = canvas2.getContext('webgl2') || canvas2.getContext('experimental-webgl2')
				const getSupportedExtensions = (context, supportedExtLie, title) => {
					return new Promise(async resolve => {
						try {
							if (!context) {
								return resolve({ extensions: [] })
							}
							const extensions = caniuse(() => context, ['getSupportedExtensions'], [], true) || []
							if (!supportedExtLie) {
								return resolve({
									extensions: ( 
										!proxyBehavior(extensions) ? extensions : 
										sendToTrash(title, 'proxy behavior detected', []) 
									)
								})
							}

							// document lie and send to trash
							if (supportedExtLie) { 
								documentLie(title, extensions, supportedExtLie)
							}
							// Fingerprint lie
							return resolve({
								extensions: [{ supportedExtLie }]
							})
						}
						catch (error) {
							captureError(error)
							return resolve({
								extensions: []
							})
						}
					})
				}

				const getSpecs = ([webgl, webgl2], [paramLie, param2Lie, extLie, ext2Lie]) => {
					return new Promise(async resolve => {
						const getShaderPrecisionFormat = (gl, shaderType) => {
							const low = attempt(() => gl.getShaderPrecisionFormat(gl[shaderType], gl.LOW_FLOAT))
							const medium = attempt(() => gl.getShaderPrecisionFormat(gl[shaderType], gl.MEDIUM_FLOAT))
							const high = attempt(() => gl.getShaderPrecisionFormat(gl[shaderType], gl.HIGH_FLOAT))
							const highInt = attempt(() => gl.getShaderPrecisionFormat(gl[shaderType], gl.HIGH_INT))
							return { low, medium, high, highInt }
						}
						const getMaxAnisotropy = gl => {
							const ext = (
								gl.getExtension('EXT_texture_filter_anisotropic') ||
								gl.getExtension('MOZ_EXT_texture_filter_anisotropic') ||
								gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic')
							)
							return ext ? gl.getParameter(ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT) : undefined
						}
						
						const getShaderData = (name, shader) => {
							const data = {}
							console.log(shader)
							for (const prop in shader) {
								const obj = shader[prop]
								data[name+'.'+prop+'.precision'] = obj ? attempt(() => obj.precision) : undefined
								data[name+'.'+prop+'.rangeMax'] = obj ? attempt(() => obj.rangeMax) : undefined
								data[name+'.'+prop+'.rangeMin'] = obj ? attempt(() => obj.rangeMin) : undefined
							}
							return data
						}
						const getWebglSpecs = gl => {
							if (!caniuse(() => gl, ['getParameter'])) {
								return undefined
							}
							const data =  {
								VERSION: attempt(() => gl.getParameter(gl.VERSION)),
								SHADING_LANGUAGE_VERSION: attempt( () => gl.getParameter(gl.SHADING_LANGUAGE_VERSION)),
								antialias: attempt(() => (gl.getContextAttributes() ? gl.getContextAttributes().antialias : undefined)),
								RED_BITS: attempt(() => gl.getParameter(gl.RED_BITS)),
								GREEN_BITS: attempt(() => gl.getParameter(gl.GREEN_BITS)),
								BLUE_BITS: attempt(() => gl.getParameter(gl.BLUE_BITS)),
								ALPHA_BITS: attempt(() => gl.getParameter(gl.ALPHA_BITS)),
								DEPTH_BITS: attempt(() => gl.getParameter(gl.DEPTH_BITS)),
								STENCIL_BITS: attempt(() => gl.getParameter(gl.STENCIL_BITS)),
								MAX_RENDERBUFFER_SIZE: attempt(() => gl.getParameter(gl.MAX_RENDERBUFFER_SIZE)),
								MAX_COMBINED_TEXTURE_IMAGE_UNITS: attempt(() => gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS)),
								MAX_CUBE_MAP_TEXTURE_SIZE: attempt(() => gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE)),
								MAX_FRAGMENT_UNIFORM_VECTORS: attempt(() => gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS)),
								MAX_TEXTURE_IMAGE_UNITS: attempt(() => gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS)),
								MAX_TEXTURE_SIZE: attempt(() => gl.getParameter(gl.MAX_TEXTURE_SIZE)),
								MAX_VARYING_VECTORS: attempt(() => gl.getParameter(gl.MAX_VARYING_VECTORS)),
								MAX_VERTEX_ATTRIBS: attempt(() => gl.getParameter(gl.MAX_VERTEX_ATTRIBS)),
								MAX_VERTEX_TEXTURE_IMAGE_UNITS: attempt(() => gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS)),
								MAX_VERTEX_UNIFORM_VECTORS: attempt(() => gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS)),
								ALIASED_LINE_WIDTH_RANGE: attempt(() => [...gl.getParameter(gl.ALIASED_LINE_WIDTH_RANGE)]),
								ALIASED_POINT_SIZE_RANGE: attempt(() => [...gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE)]),
								MAX_VIEWPORT_DIMS: attempt(() => [...gl.getParameter(gl.MAX_VIEWPORT_DIMS)]),
								MAX_TEXTURE_MAX_ANISOTROPY_EXT: attempt(() => getMaxAnisotropy(gl)),
								...getShaderData('VERTEX_SHADER', getShaderPrecisionFormat(gl, 'VERTEX_SHADER')),
								...getShaderData('FRAGMENT_SHADER', getShaderPrecisionFormat(gl, 'FRAGMENT_SHADER')),
								MAX_DRAW_BUFFERS_WEBGL: attempt(() => {
									const buffers = gl.getExtension('WEBGL_draw_buffers')
									return buffers ? gl.getParameter(buffers.MAX_DRAW_BUFFERS_WEBGL) : undefined
								})
							}
							const response = data
							if (!paramLie && !extLie) {
								return response
							}
							// document lie and send to trash
							const paramTitle = `webglGetParameter`
							const extTitle = `webglGetExtension`
							if (paramLie) { 
								documentLie(paramTitle, response, paramLie)
							}
							if (extLie) {
								documentLie(extTitle, response, extLie)
							}
							// Fingerprint lie
							return { paramLie, extLie }
						}

						const getWebgl2Specs = gl => {
							if (!caniuse(() => gl, ['getParameter'])) {
								return undefined
							}
							const data = {
								MAX_VERTEX_UNIFORM_COMPONENTS: attempt(() => gl.getParameter(gl.MAX_VERTEX_UNIFORM_COMPONENTS)),
								MAX_VERTEX_UNIFORM_BLOCKS: attempt(() => gl.getParameter(gl.MAX_VERTEX_UNIFORM_BLOCKS)),
								MAX_VERTEX_OUTPUT_COMPONENTS: attempt(() => gl.getParameter(gl.MAX_VERTEX_OUTPUT_COMPONENTS)),
								MAX_VARYING_COMPONENTS: attempt(() => gl.getParameter(gl.MAX_VARYING_COMPONENTS)),
								MAX_FRAGMENT_UNIFORM_COMPONENTS: attempt(() => gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_COMPONENTS)),
								MAX_FRAGMENT_UNIFORM_BLOCKS: attempt(() => gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_BLOCKS)),
								MAX_FRAGMENT_INPUT_COMPONENTS: attempt(() => gl.getParameter(gl.MAX_FRAGMENT_INPUT_COMPONENTS)),
								MIN_PROGRAM_TEXEL_OFFSET: attempt(() => gl.getParameter(gl.MIN_PROGRAM_TEXEL_OFFSET)),
								MAX_PROGRAM_TEXEL_OFFSET: attempt(() => gl.getParameter(gl.MAX_PROGRAM_TEXEL_OFFSET)),
								MAX_DRAW_BUFFERS: attempt(() => gl.getParameter(gl.MAX_DRAW_BUFFERS)),
								MAX_COLOR_ATTACHMENTS: attempt(() => gl.getParameter(gl.MAX_COLOR_ATTACHMENTS)),
								MAX_SAMPLES: attempt(() => gl.getParameter(gl.MAX_SAMPLES)),
								MAX_3D_TEXTURE_SIZE: attempt(() => gl.getParameter(gl.MAX_3D_TEXTURE_SIZE)),
								MAX_ARRAY_TEXTURE_LAYERS: attempt(() => gl.getParameter(gl.MAX_ARRAY_TEXTURE_LAYERS)),
								MAX_TEXTURE_LOD_BIAS: attempt(() => gl.getParameter(gl.MAX_TEXTURE_LOD_BIAS)),
								MAX_UNIFORM_BUFFER_BINDINGS: attempt(() => gl.getParameter(gl.MAX_UNIFORM_BUFFER_BINDINGS)),
								MAX_UNIFORM_BLOCK_SIZE: attempt(() => gl.getParameter(gl.MAX_UNIFORM_BLOCK_SIZE)),
								UNIFORM_BUFFER_OFFSET_ALIGNMENT: attempt(() => gl.getParameter(gl.UNIFORM_BUFFER_OFFSET_ALIGNMENT)),
								MAX_COMBINED_UNIFORM_BLOCKS: attempt(() => gl.getParameter(gl.MAX_COMBINED_UNIFORM_BLOCKS)),
								MAX_COMBINED_VERTEX_UNIFORM_COMPONENTS: attempt(() => gl.getParameter(gl.MAX_COMBINED_VERTEX_UNIFORM_COMPONENTS)),
								MAX_COMBINED_FRAGMENT_UNIFORM_COMPONENTS: attempt(() => gl.getParameter(gl.MAX_COMBINED_FRAGMENT_UNIFORM_COMPONENTS)),
								MAX_TRANSFORM_FEEDBACK_INTERLEAVED_COMPONENTS: attempt(() => gl.getParameter(gl.MAX_TRANSFORM_FEEDBACK_INTERLEAVED_COMPONENTS)),
								MAX_TRANSFORM_FEEDBACK_SEPARATE_ATTRIBS: attempt(() => gl.getParameter(gl.MAX_TRANSFORM_FEEDBACK_SEPARATE_ATTRIBS)),
								MAX_TRANSFORM_FEEDBACK_SEPARATE_COMPONENTS: attempt(() => gl.getParameter(gl.MAX_TRANSFORM_FEEDBACK_SEPARATE_COMPONENTS)),
								MAX_ELEMENT_INDEX: attempt(() => gl.getParameter(gl.MAX_ELEMENT_INDEX)),
								MAX_SERVER_WAIT_TIMEOUT: attempt(() => gl.getParameter(gl.MAX_SERVER_WAIT_TIMEOUT))
							}
							const response = data
							if (!param2Lie && !ext2Lie) {
								return response
							}
							// document lie and send to trash
							const paramTitle = `webgl2GetParameter`
							const extTitle = `webgl2GetExtension`
							if (param2Lie) { 
								documentLie(paramTitle, response, param2Lie)
							}
							if (ext2Lie) {
								documentLie(extTitle, response, ext2Lie)
							}
							// Fingerprint lie
							return { param2Lie, ext2Lie }
						}
						const data = { webglSpecs: getWebglSpecs(webgl), webgl2Specs: getWebgl2Specs(webgl2) }
						return resolve(data)
					})
				}

				const getUnmasked = (context, [paramLie, extLie], [rendererTitle, vendorTitle]) => {
					return new Promise(async resolve => {
						try {
							if (!context) {
								return resolve({
									vendor: undefined,
									renderer: undefined
								})
							}
							const extension = caniuse(() => context, ['getExtension'], ['WEBGL_debug_renderer_info'], true)
							const vendor = extension && context.getParameter(extension.UNMASKED_VENDOR_WEBGL)
							const renderer = extension && context.getParameter(extension.UNMASKED_RENDERER_WEBGL)
							const validate = (value, title) => {
								return (
									!proxyBehavior(value) ? value : 
									sendToTrash(title, 'proxy behavior detected')
								)
							}
							if (!paramLie && !extLie) {
								return resolve ({
									vendor: validate(vendor, vendorTitle),
									renderer: validate(renderer, rendererTitle)
								})
							}
							// document lie and send to trash
							const webglVendorAndRenderer = `${vendor}, ${renderer}`
							const paramTitle = `${vendorTitle}And${rendererTitle}Parameter`
							const extTitle = `${vendorTitle}And${rendererTitle}Extension`
							if (paramLie) { 
								documentLie(paramTitle, webglVendorAndRenderer, paramLie)
							}
							if (extLie) {
								documentLie(extTitle, webglVendorAndRenderer, extLie)
							}
							const response = (
								rendererTitle == 'webgl2Renderer' ? {
									vendor: { param2Lie: paramLie, ext2Lie: extLie },
									renderer: { param2Lie: paramLie, ext2Lie: extLie }
								} : {
									vendor: { paramLie, extLie },
									renderer: { paramLie, extLie }
								}
							)
							// Fingerprint lie
							return resolve(response)
						}
						catch (error) {
							captureError(error)
							return resolve({
								vendor: undefined,
								renderer: undefined
							})
						}
					})
				}
				const getDataURL = (canvas, context, [dataLie, contextLie], [canvasTitle, contextTitle]) => {
					return new Promise(async resolve => {
						try {
							// document lie and send to trash
							const documentTrashLies = async (canvas, resolve, [dataLie, contextLie], [canvasTitle, contextTitle]) => {
								const canvasWebglDataURI = canvas.toDataURL()
								const hash = hashMini(canvasWebglDataURI)
								if (contextLie) {
									documentLie(contextTitle, hash, contextLie)
								}
								if (dataLie) {
									documentLie(canvasTitle, hash, dataLie)
								}
								// fingerprint lie
								const data = { contextLie, dataLie }
								const $hash = await hashify(data)
								return resolve({ ...data, $hash })
							}
							if (dataLie || contextLie) {
								return documentTrashLies(canvas, resolve, [dataLie, contextLie], [canvasTitle, contextTitle])
							}
							else if (!context) {
								return resolve({ dataURI: undefined, $hash: undefined })
							}
							if (!dataLie && !contextLie) {
								const colorBufferBit = caniuse(() => context, ['COLOR_BUFFER_BIT'])
								caniuse(() => context, ['clearColor'], [0.2, 0.4, 0.6, 0.8], true)
								caniuse(() => context, ['clear'], [colorBufferBit], true)
								const canvasWebglDataURI = canvas.toDataURL()
								const dataURI = canvasWebglDataURI
								const $hash = await hashify(dataURI)
								return resolve({ dataURI, $hash })
							}
						}
						catch (error) {
							captureError(error)
							return resolve({ dataURI: undefined, $hash: undefined })
						}
					})
				}

				const [
					supported,
					supported2,
					unmasked,
					unmasked2,
					dataURI,
					dataURI2,
					specs
				] = await Promise.all([
					getSupportedExtensions(context, supportedExtLie, 'webglSupportedExtensions'),
					getSupportedExtensions(context2, supportedExt2Lie, 'webgl2SupportedExtensions'),
					getUnmasked(context, [paramLie, extLie], ['webglRenderer', 'webglVendor']),
					getUnmasked(context2, [param2Lie, ext2Lie], ['webgl2Renderer', 'webgl2Vendor']),
					getDataURL(canvas, context, [dataLie, contextLie], ['canvasWebglDataURI', 'canvasWebglContextDataURI']),
					getDataURL(canvas2, context2, [dataLie, contextLie], ['canvasWebgl2DataURI', 'canvasWebgl2ContextDataURI']),
					getSpecs([context, context2], [paramLie, param2Lie, extLie, ext2Lie])
				]).catch(error => {
					console.error(error.message)
				})
				const data = {
					supported,
					supported2,
					unmasked,
					unmasked2,
					dataURI,
					dataURI2,
					specs
				}
				data.matchingUnmasked = JSON.stringify(data.unmasked) === JSON.stringify(data.unmasked2)
				data.matchingDataURI = data.dataURI.$hash === data.dataURI2.$hash

				const $hash = await hashify(data)
				resolve({ ...data, $hash })
				const id = `${instanceId}-canvas-webgl`
				const el = document.getElementById(id)
				const { webglSpecs, webgl2Specs } = specs
				const webglSpecsKeys = webglSpecs ? Object.keys(webglSpecs) : []
				const webgl2SpecsKeys = webgl2Specs ? Object.keys(webgl2Specs) : []
				const detectStringLie = (val, id) => {
					if (!val) {
						return note.blocked
					}
					return typeof val == 'string' ? val : note.lied
				}
				const detectParameterLie = (obj, keys, version, id) => {
					if (!obj || !keys.length) {
						return `<div>${version} parameters (0): ${note.blocked}</div>`
					}
					id = `${id}-p-${version}`
					const lied = !!(
						obj['paramLie'] ||
						obj['param2Lie'] ||
						obj['extLie'] ||
						obj['ext2Lie']
					)
					return `
					<div>${version} parameters (${lied ? '0' : count(keys)}): ${
						lied ? note.lied :
						modal(id, keys.map(key => `${key}: ${obj[key]}`).join('<br>'))
					}</div>
					`
				}
				const detectDataURILie = (obj, version, id) => {
					if (!obj) {
						return `<div>${version} toDataURL: ${note.blocked}</div>`
					}
					id = `${id}-d-${version}`
					const lied = !!(obj['dataLie'] || obj['contextLie'])
					return `
					<div>${version} toDataURL: ${
						lied ? note.lied :
						(obj.$hash ? obj.$hash : note.blocked)
					}</div>
					`
				}
				patch(el, html`
				<div>
					<strong>WebGLRenderingContext/WebGL2RenderingContext</strong>
					<div>hash: ${$hash}</div>
					${detectDataURILie(dataURI, 'v1', id)}
					${detectParameterLie(webglSpecs, webglSpecsKeys, 'v1', id)}
					<div>v1 extensions (${count(supported.extensions)}): ${
						!caniuse(() => supported, ['extensions', 'length']) ? note.blocked : modal(`${id}-e-v1`, supported.extensions.join('<br>'))
					}</div>
					<div>v1 renderer: ${detectStringLie(unmasked.renderer, `${id}-r-v1`)}</div>
					<div>v1 vendor: ${detectStringLie(unmasked.vendor, `${id}-v-v1`)}</div>
					${detectDataURILie(dataURI2, 'v2', id)}
					${detectParameterLie(webgl2Specs, webgl2SpecsKeys, 'v2', id)}
					<div>v2 extensions (${count(supported2.extensions)}): ${
						!caniuse(() => supported2, ['extensions', 'length']) ? note.blocked : modal(`${id}-e-v2`, supported2.extensions.join('<br>'))
					}</div>
					<div>v2 renderer: ${detectStringLie(unmasked2.renderer, `${id}-r-v2`)}</div>
					<div>v2 vendor: ${detectStringLie(unmasked2.vendor, `${id}-v-v2`)}</div>
					<div>matching renderer/vendor: ${''+data.matchingUnmasked}</div>
					<div>matching data URI: ${''+data.matchingDataURI}</div>
				</div>
				`)
				return
			}
			catch (error) {
				captureError(error)
				return resolve(undefined)
			}
		})
	}

	// maths
	const getMaths = instanceId => {
		return new Promise(async resolve => {
			try {
				const n = 0.123
				const bigN = 5.860847362277284e+38
				const fns = [
					['acos', [n], `acos(${n})`, 1.4474840516030247],
					['acos', [Math.SQRT1_2], 'acos(Math.SQRT1_2)', 0.7853981633974483],
					
					['acosh', [1e308], 'acosh(1e308)', 709.889355822726],
					['acosh', [Math.PI], 'acosh(Math.PI)', 1.811526272460853],
					['acosh', [Math.SQRT2], 'acosh(Math.SQRT2)', 0.881373587019543],

					['asin', [n], `asin(${n})`, 0.12331227519187199],

					['asinh', [1e300], 'asinh(1e308)', 691.4686750787736],
					['asinh', [Math.PI], 'asinh(Math.PI)', 1.8622957433108482],

					['atan', [2], 'atan(2)', 1.1071487177940904],
					['atan', [Math.PI], 'atan(Math.PI)', 1.2626272556789115],

					['atanh', [0.5], 'atanh(0.5)', 0.5493061443340548],

					['atan2', [1e-310, 2], 'atan2(1e-310, 2)', 5e-311],
					['atan2', [Math.PI, 2], 'atan2(Math.PI)', 1.0038848218538872],

					['cbrt', [100], 'cbrt(100)', 4.641588833612779],
					['cbrt', [Math.PI], 'cbrt(Math.PI)', 1.4645918875615231],
					
					['cos', [n], `cos(${n})`, 0.9924450321351935],
					['cos', [Math.PI], 'cos(Math.PI)', -1],
					['cos', [bigN], `cos(${bigN})`, -0.10868049424995659, -0.10868049424995659, -0.9779661551196617], // unique in Tor

					['cosh', [1], 'cosh(1)', 1.5430806348152437],
					['cosh', [Math.PI], 'cosh(Math.PI)', 11.591953275521519],

					['expm1', [1], 'expm1(1)', 1.718281828459045],
					['expm1', [Math.PI], 'expm1(Math.PI)', 22.140692632779267],

					['exp', [n], `exp(${n})`, 1.1308844209474893],
					['exp', [Math.PI], 'exp(Math.PI)', 23.140692632779267],

					['hypot', [1, 2, 3, 4, 5, 6], 'hypot(1, 2, 3, 4, 5, 6)', 9.539392014169456],
					['hypot', [bigN, bigN], `hypot(${bigN}, ${bigN})`, 8.288489826731116e+38, 8.288489826731114e+38],

					['log', [n], `log(${n})`, -2.0955709236097197],
					['log', [Math.PI], 'log(Math.PI)', 1.1447298858494002],

					['log1p', [n], `log1p(${n})`, 0.11600367575630613],
					['log1p', [Math.PI], 'log1p(Math.PI)', 1.4210804127942926],

					['log10', [n], `log10(${n})`, -0.9100948885606021],
					['log10', [Math.PI], 'log10(Math.PI)', 0.4971498726941338, 0.49714987269413385],
					['log10', [Math.E], 'log10(Math.E])', 0.4342944819032518],
					['log10', [Math.LN2], 'log10(Math.LN2)', -0.1591745389548616],
					['log10', [Math.LOG2E], 'log10(Math.LOG2E)', 0.15917453895486158],
					['log10', [Math.LOG10E], 'log10(Math.LOG10E)', -0.36221568869946325],
					['log10', [Math.SQRT1_2], 'log10(Math.SQRT1_2)', -0.15051499783199057],
					['log10', [Math.SQRT2], 'log10(Math.SQRT2)', 0.1505149978319906, 0.15051499783199063],
					
					['sin', [bigN], `sin(${bigN})`, 0.994076732536068, 0.994076732536068, -0.20876350121720488], // unique in Tor
					['sin', [Math.PI], 'sin(Math.PI)', 1.2246467991473532e-16, 1.2246467991473532e-16, 1.2246063538223773e-16], // unique in Tor
					['sin', [Math.E], 'sin(Math.E])', 0.41078129050290885],
					['sin', [Math.LN2], 'sin(Math.LN2)', 0.6389612763136348],
					['sin', [Math.LOG2E], 'sin(Math.LOG2E)', 0.9918062443936637],
					['sin', [Math.LOG10E], 'sin(Math.LOG10E)', 0.4207704833137573],
					['sin', [Math.SQRT1_2], 'sin(Math.SQRT1_2)', 0.6496369390800625],
					['sin', [Math.SQRT2], 'sin(Math.SQRT2)', 0.9877659459927356],
					
					['sinh', [1], 'sinh(1)', 1.1752011936438014],
					['sinh', [Math.PI], 'sinh(Math.PI)', 11.548739357257748],
					['sinh', [Math.E], 'sinh(Math.E])', 7.544137102816975],
					['sinh', [Math.LN2], 'sinh(Math.LN2)', 0.75],
					['sinh', [Math.LOG2E], 'sinh(Math.LOG2E)', 1.9978980091062795],
					['sinh', [Math.LOG10E], 'sinh(Math.LOG10E)', 0.44807597941469024],
					['sinh', [Math.SQRT1_2], 'sinh(Math.SQRT1_2)', 0.7675231451261164],
					['sinh', [Math.SQRT2], 'sinh(Math.SQRT2)', 1.935066822174357],
					
					['sqrt', [n], `sqrt(${n})`, 0.3507135583350036],
					['sqrt', [Math.PI], 'sqrt(Math.PI)', 1.7724538509055159],
					
					['tan', [-1e308], 'tan(-1e308)', 0.5086861259107568],
					['tan', [Math.PI], 'tan(Math.PI)', -1.2246467991473532e-16],

					['tanh', [n], `tanh(${n})`, 0.12238344189440875],
					['tanh', [Math.PI], 'tanh(Math.PI)', 0.99627207622075],

					['pow', [n, -100], `pow(${n}, -100)`, 1.022089333584519e+91, 1.0220893335845176e+91],
					['pow', [Math.PI, -100], 'pow(Math.PI, -100)', 1.9275814160560204e-50, 1.9275814160560185e-50],
					['pow', [Math.E, -100], 'pow(Math.E, -100)', 3.7200759760208555e-44, 3.720075976020851e-44],
					['pow', [Math.LN2, -100], 'pow(Math.LN2, -100)', 8269017203802394, 8269017203802410],
					['pow', [Math.LN10, -100], 'pow(Math.LN10, -100)', 6.003867926738829e-37, 6.003867926738811e-37],
					['pow', [Math.LOG2E, -100], 'pow(Math.LOG2E, -100)', 1.20933355845501e-16, 1.2093335584550061e-16],
					['pow', [Math.LOG10E, -100], 'pow(Math.LOG10E, -100)', 1.6655929347585958e+36, 1.665592934758592e+36],
					['pow', [Math.SQRT1_2, -100], 'pow(Math.SQRT1_2, -100)', 1125899906842616.2, 1125899906842611.5],
					['pow', [Math.SQRT2, -100], 'pow(Math.SQRT2, -100)', 8.881784197001191e-16, 8.881784197001154e-16]
				]
				const data = {}
				fns.forEach(fn => {
					data[fn[2]] = attempt(() => {
						const result = Math[fn[0]](...fn[1])
						const chrome = result == fn[3]
						const firefox = fn[4] ? result == fn[4] : chrome
						const other = fn[5] ? result == fn[5] : false
						return { result, chrome, firefox, other }
					})
				})
				const $hash = await hashify(data)
				resolve({...data, $hash })
				const id = `${instanceId}-maths`
				const el = document.getElementById(id)
				const header = `<div>Match to 64 bit Chromium (CR64), Firefox (FF64), and Other (OT64)</div>`
				const results = Object.keys(data).map(key => {
					const value = data[key]
					const { result, chrome, firefox, other } = value
					return `${chrome ? '[CR64]' : '[----]'}${firefox ? '[FF64]' : '[----]'}${other ? '[OT64]' : '[----]'} ${key} => ${result}`
				})
				patch(el, html`
				<div>
					<strong>Math</strong>
					<div>hash: ${$hash}</div>
					<div>results: ${
						modal(id, header+results.join('<br>'))
					}
					<div>engine: ${known($hash)}</div>
				</div>
				`)
				return
			}
			catch (error) {
				captureError(error)
				return resolve(undefined)
			}
		})
	}

	// browser console errors
	const getErrors = errFns => {
		const errors = []
		let i, len = errFns.length
		for (i = 0; i < len; i++) {
			try {
				errFns[i]()
			} catch (err) {
				errors.push(err.message)
			}
		}
		return errors
	}
	const getConsoleErrors = instanceId => {
		return new Promise(async resolve => {
			try {
				const errorTests = [
					() => eval('alert(")'),
					() => eval('const foo;foo.bar'),
					() => eval('null.bar'),
					() => eval('abc.xyz = 123'),
					() => eval('const foo;foo.bar'),
					() => eval('(1).toString(1000)'),
					() => eval('[...undefined].length'),
					() => eval('var x = new Array(-1)'),
					() => eval('const a=1; const a=2;')
				]
				const errors = getErrors(errorTests)
				const $hash = await hashify(errors)
				resolve({errors, $hash })
				const id = `${instanceId}-console-errors`
				const el = document.getElementById(id)
				const results = Object.keys(errors).map(key => {
					const value = errors[key]
					return `${+key+1}: ${value}`
				})
				patch(el, html`
				<div>
					<strong>Error</strong>
					<div>hash: ${$hash}</div>
					<div>results: ${
						modal(id, results.join('<br>'))
					}
					<div>engine: ${known($hash)}</div>
				</div>
				`)
				return
			}
			catch (error) {
				captureError(error)
				return resolve(undefined)
			}
		})
	}

	// timezone
	const getTimezone = instanceId => {
		return new Promise(async resolve => {
			try {
				const contentWindowDate = contentWindow.Date
				const contentWindowIntl = contentWindow.Intl
				const computeTimezoneOffset = () => {
					const date = new contentWindowDate().getDate()
					const month = new contentWindowDate().getMonth()
					const year = contentWindowDate().split` `[3] // current year
					const dateString = `${month}/${date}/${year}`
					const toJSONParsed = (x) => JSON.parse(JSON.stringify(x))
					const utc = contentWindowDate.parse(toJSONParsed(new contentWindowDate(dateString)).split`Z`.join``)
					const now = +new contentWindowDate(dateString)
					return +(((utc - now)/60000).toFixed(0))
				}
				// concept inspired by https://github.com/ghacksuserjs/TorZillaPrint
				const measureTimezoneOffset = timezone => {
					let lie = false
					const year = contentWindowDate().split` `[3] // current year
					const minute = 60000
					const winter = new contentWindowDate(`1/1/${year}`)
					const spring = new contentWindowDate(`4/1/${year}`)
					const summer = new contentWindowDate(`7/1/${year}`)
					const fall = new contentWindowDate(`10/1/${year}`)
					const winterUTCTime = +new contentWindowDate(`${year}-01-01`)
					const springUTCTime = +new contentWindowDate(`${year}-04-01`)
					const summerUTCTime = +new contentWindowDate(`${year}-07-01`)
					const fallUTCTime = +new contentWindowDate(`${year}-10-01`)
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
					}
					lie = !!Object.keys(date).filter(key => {
						const season = date[key]
						return season.calculated != season.parsed
					}).length
					const set = new Set(
						[].concat(
							...Object.keys(date).map(key => {
								const season = date[key]
								return [season.calculated, season.parsed]
							})
						)
					)
					lie = !set.has(timezone)
					if (lie) {
						set.add(timezone) // show in result
					}
					return { season: [...set], lie }
				}
				const getRelativeTime = () => {
					const locale = attempt(() => contentWindowIntl.DateTimeFormat().resolvedOptions().locale)
					if (!locale || !caniuse(() => new contentWindowIntl.RelativeTimeFormat)) {
						return undefined
					}
					const relativeTime = new contentWindowIntl.RelativeTimeFormat(locale, {
						localeMatcher: 'best fit',
						numeric: 'auto',
						style: 'long'
					})
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
				}
				const getLocale = () => {
					const constructors = [
						'Collator',
						'DateTimeFormat',
						'DisplayNames',
						'ListFormat',
						'NumberFormat',
						'PluralRules',
						'RelativeTimeFormat',
					]
					const languages = []
					constructors.forEach(name => {
						try {
							const obj = caniuse(() => new contentWindowIntl[name])
							if (!obj) {
								return
							}
							const { locale } = obj.resolvedOptions()
							return languages.push(locale)
						}
						catch (error) {
							return
						}
					})
					const lang = [...new Set(languages)]
					return { lang, lie: lang.length > 1 ? true : false }
				}		
				const dateGetTimezoneOffset = attempt(() => contentWindowDate.prototype.getTimezoneOffset)
				const dateProto = contentWindowDate.prototype
				const timezoneLie = dateGetTimezoneOffset ? hasLiedAPI(dateGetTimezoneOffset, 'getTimezoneOffset', dateProto).lie : false
				const timezoneOffset = new contentWindowDate().getTimezoneOffset()
				const timezoneOffsetComputed = computeTimezoneOffset()
				const timezoneOffsetMeasured = measureTimezoneOffset(timezoneOffset)
				const measuredTimezones = timezoneOffsetMeasured.season.join(', ')
				const matchingOffsets = timezoneOffsetComputed == timezoneOffset
				const notWithinParentheses = /.*\(|\).*/g
				const timezoneLocation = contentWindowIntl.DateTimeFormat().resolvedOptions().timeZone
				const timezone = (''+new contentWindowDate()).replace(notWithinParentheses, '')
				const relativeTime = getRelativeTime()
				const locale = getLocale()
				// document lie
				const seasonLie = timezoneOffsetMeasured.lie ? { lies: [{ ['timezone seasons disagree']: true }] } : false
				const localeLie = locale.lie ? { lies: [{ ['Intl locales mismatch']: true }] } : false
				const offsetLie = !matchingOffsets ? { lies: [{ ['timezone offsets mismatch']: true }] } : false
				if (localeLie) {
					documentLie('IntlLocales', locale, localeLie)	
				}
				if (timezoneLie) {
					documentLie('timezone', timezoneOffset, timezoneLie)
				}
				if (offsetLie) {
					documentLie('timezoneOffsets', timezoneOffset, offsetLie)
				}
				if (seasonLie) {
					documentLie('timezoneMeasured', measuredTimezones, seasonLie)
				}
				const data =  {
					timezone,
					timezoneLocation,
					timezoneOffset: !timezoneLie ? timezoneOffset : timezoneLie,
					timezoneOffsetComputed,
					timezoneOffsetMeasured: !seasonLie ? measuredTimezones : seasonLie,
					matchingOffsets,
					relativeTime,
					locale: !localeLie ? locale : localeLie,
					lied: localeLie || timezoneLie || seasonLie || !matchingOffsets
				}
				
				const $hash = await hashify(data)
				resolve({...data, $hash })
				const id = `${instanceId}-timezone`
				const el = document.getElementById(id)
				patch(el, html`
				<div>
					<strong>Date/Intl</strong>
					<div>hash: ${$hash}</div>
					<div>timezone: ${timezone}</div>
					<div>timezone location: ${timezoneLocation}</div>
					<div>timezone offset: ${!timezoneLie && matchingOffsets ? ''+timezoneOffset : note.lied}</div>
					<div>timezone offset computed: ${''+timezoneOffsetComputed}</div>
					<div>matching offsets: ${''+matchingOffsets}</div>
					<div>timezone measured: ${!seasonLie ? measuredTimezones : note.lied}</div>
					<div>relativeTimeFormat: ${!relativeTime ? note.blocked : modal(`${id}-relativeTimeFormat`, Object.keys(relativeTime).sort().map(key => `${key} => ${relativeTime[key]}`).join('<br>'))}</div>
					<div>locale language: ${!localeLie ? locale.lang.join(', ') : note.lied}</div>
				</div>
				`)
				return
			}
			catch (error) {
				captureError(error)
				return resolve(undefined)
			}
		})
	}

	// client rects
	const getClientRects = instanceId => {
		return new Promise(async resolve => {
			try {
				const toJSONParsed = (x) => JSON.parse(JSON.stringify(x))
				const elementGetClientRects = attempt(() => Element.prototype.getClientRects)
				const elementProto = Element.prototype
				const rectsLie = (
					elementGetClientRects ? hasLiedAPI(elementGetClientRects, 'getClientRects', elementProto).lie : false
				)

				// create and get rendered iframe
				const id = `${instanceId}-client-rects-iframe`
				const rectsId = `${instanceId}-client-rects-div`
				const iframeElement = document.createElement('iframe')
				const divElement = document.createElement('div')
				iframeElement.setAttribute('id', id)
				divElement.setAttribute('id', rectsId)
				iframeElement.setAttribute('style', 'visibility: hidden; height: 0')
				document.body.appendChild(iframeElement)
				const iframeRendered = document.getElementById(id)

				// create and get rendered div in iframe
				const doc = iframeRendered.contentDocument
				doc.body.appendChild(divElement)
				const divRendered = doc.getElementById(rectsId)

				// patch div
				patch(divRendered, html`
				<div id="rect-container">
					<style>
					.rects{width:10px;height:10px;max-width:100%}.absolute{position:absolute}#cRect1{border:solid 2.715px;border-color:#F72585;padding:3.98px;margin-left:12.12px}#cRect2{border:solid 2px;border-color:#7209B7;font-size:30px;margin-top:20px;transform:skewY(23.1753218deg)}#cRect3{border:solid 2.89px;border-color:#3A0CA3;font-size:45px;transform:scale(100000000000000000000009999999999999.99, 1.89);margin-top:50px}#cRect4{border:solid 2px;border-color:#4361EE;transform:matrix(1.11, 2.0001, -1.0001, 1.009, 150, 94.4);margin-top:11.1331px;margin-left:12.1212px;padding:4.4545px;left:239.4141px;top:8.5050px}#cRect5{border:solid 2px;border-color:#4CC9F0;margin-left:42.395pt}#cRect6{border:solid 2px;border-color:#F72585;transform:perspective(12890px) translateZ(101.5px);padding:12px}#cRect7{margin-top:-350.552px;margin-left:0.9099rem;border:solid 2px;border-color:#4361EE}#cRect8{margin-top:-150.552px;margin-left:15.9099rem;border:solid 2px;border-color:#3A0CA3}#cRect9{margin-top:-110.552px;margin-left:15.9099rem;border:solid 2px;border-color:#7209B7}#cRect10{margin-top:-315.552px;margin-left:15.9099rem;border:solid 2px;border-color:#F72585}#cRect11{width:10px;height:10px;margin-left:15.0000009099rem;border:solid 2px;border-color:#F72585}#cRect12{width:10px;height:10px;margin-left:15.0000009099rem;border:solid 2px;border-color:#F72585}
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
				</div>
				`)
				
				// get clientRects
				const rectElems = doc.getElementsByClassName('rects')
				const clientRects = [...rectElems].map(el => {
					return toJSONParsed(el.getClientRects()[0])
				})
								
				// detect failed math calculation lie
				let mathLie = false

				clientRects.forEach(rect => {
					const { right, left, width, bottom, top, height, x, y } = rect
					if (
						right - left != width ||
						bottom - top != height ||
						right - x != width ||
						bottom - y != height
					) {
						mathLie = { lies: [{ ['failed math calculation']: true }] }
					}
					return
				})
				
				// detect equal elements mismatch lie
				let offsetLie = false
				const { right: right1, left: left1 } = clientRects[10]
				const { right: right2, left: left2 } = clientRects[11]
				if (right1 != right2 || left1 != left2) {
					offsetLie = { lies: [{ ['equal elements mismatch']: true }] }
				}

				// resolve if no lies
				if (!(rectsLie || offsetLie || mathLie)) {
					iframeRendered.parentNode.removeChild(iframeRendered)
					const $hash = await hashify(clientRects)
					resolve({clientRects, $hash })
					const templateId = `${instanceId}-client-rects`
					const templateEl = document.getElementById(templateId)
					patch(templateEl, html`
					<div>
						<strong>DOMRect</strong>
						<div>hash: ${$hash}</div>
						<div>results: ${
							modal(templateId, clientRects.map(domRect => Object.keys(domRect).map(key => `<div>${key}: ${domRect[key]}</div>`).join('')).join('<br>') )
						}</div>
					</div>
					`)
					return
				}
				// document lie and send to trash
				if (rectsLie) {
					documentLie('clientRectsAPILie', hashMini(clientRects), rectsLie)
				}
				if (offsetLie) {
					documentLie('clientRectsOffsetLie', hashMini(clientRects), offsetLie)
				}
				if (mathLie) {
					documentLie('clientRectsMathLie', hashMini(clientRects), mathLie)
				}
			
				// Fingerprint lie
				iframeRendered.parentNode.removeChild(iframeRendered)
				const lies = { rectsLie, offsetLie, mathLie }
				const $hash = await hashify(lies)
				resolve({...lies, $hash })
				const templateId = `${instanceId}-client-rects`
				const templateEl = document.getElementById(templateId)
				patch(templateEl, html`
				<div>
					<strong>DOMRect</strong>
					<div>hash: ${$hash}</div>
					<div>results: ${note.lied}</div>
				</div>
				`)
				return
			}
			catch (error) {
				captureError(error)
				return resolve(undefined)
			}
		})
	}

	const getOfflineAudioContext = instanceId => {
		return new Promise(resolve => {
			try {
				if (!('OfflineAudioContext' in window || 'webkitOfflineAudioContext' in window)) {
					return resolve(undefined)
				}
				const audioBuffer = 'AudioBuffer' in window
				const audioBufferGetChannelData = audioBuffer && attempt(() => AudioBuffer.prototype.getChannelData)
				const audioBufferCopyFromChannel = audioBuffer && attempt(() => AudioBuffer.prototype.copyFromChannel)
				const audioBufferProto = caniuse(() => AudioBuffer, ['prototype'])
				const channelDataLie = (
					audioBufferGetChannelData ? hasLiedAPI(audioBufferGetChannelData, 'getChannelData', audioBufferProto).lie : false
				)
				const copyFromChannelLie = (
					audioBufferCopyFromChannel ? hasLiedAPI(audioBufferCopyFromChannel, 'copyFromChannel', audioBufferProto).lie : false
				)
				const audioContext = OfflineAudioContext || webkitOfflineAudioContext
				const context = new audioContext(1, 44100, 44100)
				const analyser = context.createAnalyser()
				const oscillator = context.createOscillator()
				const dynamicsCompressor = context.createDynamicsCompressor()
				const biquadFilter = context.createBiquadFilter()

				oscillator.type = 'triangle'
				oscillator.frequency.value = 10000

				if (dynamicsCompressor.threshold) { dynamicsCompressor.threshold.value = -50 }
				if (dynamicsCompressor.knee) { dynamicsCompressor.knee.value = 40 }
				if (dynamicsCompressor.ratio) { dynamicsCompressor.ratio.value = 12 }
				if (dynamicsCompressor.reduction) { dynamicsCompressor.reduction.value = -20 }
				if (dynamicsCompressor.attack) { dynamicsCompressor.attack.value = 0 }
				if (dynamicsCompressor.release) { dynamicsCompressor.release.value = 0.25 }

				oscillator.connect(dynamicsCompressor)
				dynamicsCompressor.connect(context.destination)
				oscillator.start(0)
				context.startRendering()

				let copySample = []
				let binsSample = []
				let matching = false
				
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
						const chain = ['context', 'listener', 'forwardX', 'maxValue']
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
				}
				
				return resolve(new Promise(resolve => {
					context.oncomplete = async event => {
						try {
							const copy = new Float32Array(44100)
							event.renderedBuffer.copyFromChannel(copy, 0)
							const bins = event.renderedBuffer.getChannelData(0)
							
							copySample = copy ? [...copy].slice(4500, 4600) : [sendToTrash('invalidAudioSampleCopy', null)]
							binsSample = bins ? [...bins].slice(4500, 4600) : [sendToTrash('invalidAudioSample', null)]
							
							const copyJSON = copy && JSON.stringify([...copy].slice(4500, 4600))
							const binsJSON = bins && JSON.stringify([...bins].slice(4500, 4600))

							matching = binsJSON === copyJSON

							const audioSampleLie = { lies: [{ ['audioSampleAndCopyMatch']: false }] }
							if (!matching) {
								documentLie('audioSampleAndCopyMatch', hashMini(matching), audioSampleLie)
							}
							dynamicsCompressor.disconnect()
							oscillator.disconnect()
							if (proxyBehavior(binsSample)) {
								sendToTrash('audio', 'proxy behavior detected')
								return resolve(undefined)
							}
							// document lies and send to trash
							if (copyFromChannelLie) { 
								documentLie('audioBufferCopyFromChannel', (copySample[0] || null), copyFromChannelLie)
							}
							if (channelDataLie) { 
								documentLie('audioBufferGetChannelData', (binsSample[0] || null), channelDataLie)
							}
							// Fingerprint lie if it exists
							const response = {
								binsSample: channelDataLie ? [channelDataLie] : binsSample,
								copySample: copyFromChannelLie ? [copyFromChannelLie] : copySample,
								matching,
								values
							}
							const $hash = await hashify(response)
							resolve({...response, $hash })

							const id = `${instanceId}-offline-audio-context`
							const el = document.getElementById(id)
							patch(el, html`
							<div>
								<strong>OfflineAudioContext</strong>
								<div>hash: ${$hash}</div>
								<div>sample: ${binsSample[0]}</div>
								<div>copy: ${copySample[0]}</div>
								<div>matching: ${matching}</div>
								<div>node values: ${
									modal(id, Object.keys(values).map(key => `<div>${key}: ${values[key]}</div>`).join(''))
								}</div>
							</div>
							`)
							return
						}
						catch (error) {
							captureError(error)
							dynamicsCompressor.disconnect()
							oscillator.disconnect()
							return resolve({
								copySample: [undefined],
								binsSample: [undefined],
								matching,
								values
							})
							const $hash = await hashify(response)
							return resolve({...response, $hash })
						}
					}
				}))
			}
			catch (error) {
				captureError(error)
				return resolve(undefined)
			}
		})
	}
	
	// inspired by Lalit Patel's fontdetect.js
	// https://www.lalit.org/wordpress/wp-content/uploads/2008/05/fontdetect.js?ver=0.3
	const getFonts = (instanceId, fonts) => {
		return new Promise(async resolve => {
			try {
				const htmlElementPrototype = attempt(() => HTMLElement.prototype)
				const detectLies = (name, value) => {
					const lie = htmlElementPrototype ? hasLiedAPI(htmlElementPrototype, name).lie : false
					if (lie) {
						documentLie(name, value, lie)
						return undefined
					}
					return value
				}
				const toInt = val => ~~val // protect against decimal noise
				const baseFonts = ['monospace', 'sans-serif', 'serif']
				const text = 'mmmmmmmmmmlli'
				const baseOffsetWidth = {}
				const baseOffsetHeight = {}
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
				}`
				const baseFontSpan = font => {
					return `<span class="basefont" data-font="${font}" style="font-family: ${font}!important">${text}</span>`
				}
				const systemFontSpan = (font, basefont) => {
					return `<span class="system-font" data-font="${font}" data-basefont="${basefont}" style="font-family: ${`'${font}', ${basefont}`}!important">${text}</span>`
				}
				const fontsElem = document.getElementById('font-detector')
				const stageElem = document.getElementById('font-detector-stage')
				const detectedFonts = {}
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
								`
								return template
							}).join('')
						}
					</div>
					`,
					() => {
						const testElem = document.getElementById('font-detector-test')
						const basefontElems = document.querySelectorAll('#font-detector-test .basefont')
						const systemFontElems = document.querySelectorAll('#font-detector-test .system-font')
						// detect and document lies
						const spanLieDetect = [...basefontElems][0]
						const offsetWidth = detectLies('offsetWidth', spanLieDetect.offsetWidth)
						const offsetHeight = detectLies('offsetHeight', spanLieDetect.offsetHeight)
						if (!offsetWidth || !offsetHeight) { return resolve(undefined) }
						// Compute fingerprint
						;[...basefontElems].forEach(span => {
							const { dataset: { font }, offsetWidth, offsetHeight } = span
							baseOffsetWidth[font] = toInt(offsetWidth)
							baseOffsetHeight[font] = toInt(offsetHeight)
							return
						})
						;[...systemFontElems].forEach(span => {
							const { dataset: { font } }= span
							if (!detectedFonts[font]) {
								const { dataset: { basefont }, offsetWidth, offsetHeight } = span
								const widthMatchesBase = toInt(offsetWidth) == baseOffsetWidth[basefont]
								const heightMatchesBase = toInt(offsetHeight) == baseOffsetHeight[basefont]
								const detected = !widthMatchesBase || !heightMatchesBase
								if (detected) { detectedFonts[font] = true }
							}
							return
						})
						return fontsElem.removeChild(testElem)
					}
				)
				const fontList = Object.keys(detectedFonts)
				const $hash = await hashify(fontList)
				return resolve({fonts: fontList, $hash })
			}
			catch (error) {
				captureError(error)
				return resolve(undefined)
			}
		})
	}

	const fontList=["Andale Mono","Arial","Arial Black","Arial Hebrew","Arial MT","Arial Narrow","Arial Rounded MT Bold","Arial Unicode MS","Bitstream Vera Sans Mono","Book Antiqua","Bookman Old Style","Calibri","Cambria","Cambria Math","Century","Century Gothic","Century Schoolbook","Comic Sans","Comic Sans MS","Consolas","Courier","Courier New","Geneva","Georgia","Helvetica","Helvetica Neue","Impact","Lucida Bright","Lucida Calligraphy","Lucida Console","Lucida Fax","LUCIDA GRANDE","Lucida Handwriting","Lucida Sans","Lucida Sans Typewriter","Lucida Sans Unicode","Microsoft Sans Serif","Monaco","Monotype Corsiva","MS Gothic","MS Outlook","MS PGothic","MS Reference Sans Serif","MS Sans Serif","MS Serif","MYRIAD","MYRIAD PRO","Palatino","Palatino Linotype","Segoe Print","Segoe Script","Segoe UI","Segoe UI Light","Segoe UI Semibold","Segoe UI Symbol","Tahoma","Times","Times New Roman","Times New Roman PS","Trebuchet MS","Verdana","Wingdings","Wingdings 2","Wingdings 3"],extendedFontList=["Abadi MT Condensed Light","Academy Engraved LET","ADOBE CASLON PRO","Adobe Garamond","ADOBE GARAMOND PRO","Agency FB","Aharoni","Albertus Extra Bold","Albertus Medium","Algerian","Amazone BT","American Typewriter","American Typewriter Condensed","AmerType Md BT","Andalus","Angsana New","AngsanaUPC","Antique Olive","Aparajita","Apple Chancery","Apple Color Emoji","Apple SD Gothic Neo","Arabic Typesetting","ARCHER","ARNO PRO","Arrus BT","Aurora Cn BT","AvantGarde Bk BT","AvantGarde Md BT","AVENIR","Ayuthaya","Bandy","Bangla Sangam MN","Bank Gothic","BankGothic Md BT","Baskerville","Baskerville Old Face","Batang","BatangChe","Bauer Bodoni","Bauhaus 93","Bazooka","Bell MT","Bembo","Benguiat Bk BT","Berlin Sans FB","Berlin Sans FB Demi","Bernard MT Condensed","BernhardFashion BT","BernhardMod BT","Big Caslon","BinnerD","Blackadder ITC","BlairMdITC TT","Bodoni 72","Bodoni 72 Oldstyle","Bodoni 72 Smallcaps","Bodoni MT","Bodoni MT Black","Bodoni MT Condensed","Bodoni MT Poster Compressed","Bookshelf Symbol 7","Boulder","Bradley Hand","Bradley Hand ITC","Bremen Bd BT","Britannic Bold","Broadway","Browallia New","BrowalliaUPC","Brush Script MT","Californian FB","Calisto MT","Calligrapher","Candara","CaslonOpnface BT","Castellar","Centaur","Cezanne","CG Omega","CG Times","Chalkboard","Chalkboard SE","Chalkduster","Charlesworth","Charter Bd BT","Charter BT","Chaucer","ChelthmITC Bk BT","Chiller","Clarendon","Clarendon Condensed","CloisterBlack BT","Cochin","Colonna MT","Constantia","Cooper Black","Copperplate","Copperplate Gothic","Copperplate Gothic Bold","Copperplate Gothic Light","CopperplGoth Bd BT","Corbel","Cordia New","CordiaUPC","Cornerstone","Coronet","Cuckoo","Curlz MT","DaunPenh","Dauphin","David","DB LCD Temp","DELICIOUS","Denmark","DFKai-SB","Didot","DilleniaUPC","DIN","DokChampa","Dotum","DotumChe","Ebrima","Edwardian Script ITC","Elephant","English 111 Vivace BT","Engravers MT","EngraversGothic BT","Eras Bold ITC","Eras Demi ITC","Eras Light ITC","Eras Medium ITC","EucrosiaUPC","Euphemia","Euphemia UCAS","EUROSTILE","Exotc350 Bd BT","FangSong","Felix Titling","Fixedsys","FONTIN","Footlight MT Light","Forte","FrankRuehl","Fransiscan","Freefrm721 Blk BT","FreesiaUPC","Freestyle Script","French Script MT","FrnkGothITC Bk BT","Fruitger","FRUTIGER","Futura","Futura Bk BT","Futura Lt BT","Futura Md BT","Futura ZBlk BT","FuturaBlack BT","Gabriola","Galliard BT","Gautami","Geeza Pro","Geometr231 BT","Geometr231 Hv BT","Geometr231 Lt BT","GeoSlab 703 Lt BT","GeoSlab 703 XBd BT","Gigi","Gill Sans","Gill Sans MT","Gill Sans MT Condensed","Gill Sans MT Ext Condensed Bold","Gill Sans Ultra Bold","Gill Sans Ultra Bold Condensed","Gisha","Gloucester MT Extra Condensed","GOTHAM","GOTHAM BOLD","Goudy Old Style","Goudy Stout","GoudyHandtooled BT","GoudyOLSt BT","Gujarati Sangam MN","Gulim","GulimChe","Gungsuh","GungsuhChe","Gurmukhi MN","Haettenschweiler","Harlow Solid Italic","Harrington","Heather","Heiti SC","Heiti TC","HELV","Herald","High Tower Text","Hiragino Kaku Gothic ProN","Hiragino Mincho ProN","Hoefler Text","Humanst 521 Cn BT","Humanst521 BT","Humanst521 Lt BT","Imprint MT Shadow","Incised901 Bd BT","Incised901 BT","Incised901 Lt BT","INCONSOLATA","Informal Roman","Informal011 BT","INTERSTATE","IrisUPC","Iskoola Pota","JasmineUPC","Jazz LET","Jenson","Jester","Jokerman","Juice ITC","Kabel Bk BT","Kabel Ult BT","Kailasa","KaiTi","Kalinga","Kannada Sangam MN","Kartika","Kaufmann Bd BT","Kaufmann BT","Khmer UI","KodchiangUPC","Kokila","Korinna BT","Kristen ITC","Krungthep","Kunstler Script","Lao UI","Latha","Leelawadee","Letter Gothic","Levenim MT","LilyUPC","Lithograph","Lithograph Light","Long Island","Lydian BT","Magneto","Maiandra GD","Malayalam Sangam MN","Malgun Gothic","Mangal","Marigold","Marion","Marker Felt","Market","Marlett","Matisse ITC","Matura MT Script Capitals","Meiryo","Meiryo UI","Microsoft Himalaya","Microsoft JhengHei","Microsoft New Tai Lue","Microsoft PhagsPa","Microsoft Tai Le","Microsoft Uighur","Microsoft YaHei","Microsoft Yi Baiti","MingLiU","MingLiU_HKSCS","MingLiU_HKSCS-ExtB","MingLiU-ExtB","Minion","Minion Pro","Miriam","Miriam Fixed","Mistral","Modern","Modern No. 20","Mona Lisa Solid ITC TT","Mongolian Baiti","MONO","MoolBoran","Mrs Eaves","MS LineDraw","MS Mincho","MS PMincho","MS Reference Specialty","MS UI Gothic","MT Extra","MUSEO","MV Boli","Nadeem","Narkisim","NEVIS","News Gothic","News GothicMT","NewsGoth BT","Niagara Engraved","Niagara Solid","Noteworthy","NSimSun","Nyala","OCR A Extended","Old Century","Old English Text MT","Onyx","Onyx BT","OPTIMA","Oriya Sangam MN","OSAKA","OzHandicraft BT","Palace Script MT","Papyrus","Parchment","Party LET","Pegasus","Perpetua","Perpetua Titling MT","PetitaBold","Pickwick","Plantagenet Cherokee","Playbill","PMingLiU","PMingLiU-ExtB","Poor Richard","Poster","PosterBodoni BT","PRINCETOWN LET","Pristina","PTBarnum BT","Pythagoras","Raavi","Rage Italic","Ravie","Ribbon131 Bd BT","Rockwell","Rockwell Condensed","Rockwell Extra Bold","Rod","Roman","Sakkal Majalla","Santa Fe LET","Savoye LET","Sceptre","Script","Script MT Bold","SCRIPTINA","Serifa","Serifa BT","Serifa Th BT","ShelleyVolante BT","Sherwood","Shonar Bangla","Showcard Gothic","Shruti","Signboard","SILKSCREEN","SimHei","Simplified Arabic","Simplified Arabic Fixed","SimSun","SimSun-ExtB","Sinhala Sangam MN","Sketch Rockwell","Skia","Small Fonts","Snap ITC","Snell Roundhand","Socket","Souvenir Lt BT","Staccato222 BT","Steamer","Stencil","Storybook","Styllo","Subway","Swis721 BlkEx BT","Swiss911 XCm BT","Sylfaen","Synchro LET","System","Tamil Sangam MN","Technical","Teletype","Telugu Sangam MN","Tempus Sans ITC","Terminal","Thonburi","Traditional Arabic","Trajan","TRAJAN PRO","Tristan","Tubular","Tunga","Tw Cen MT","Tw Cen MT Condensed","Tw Cen MT Condensed Extra Bold","TypoUpright BT","Unicorn","Univers","Univers CE 55 Medium","Univers Condensed","Utsaah","Vagabond","Vani","Vijaya","Viner Hand ITC","VisualUI","Vivaldi","Vladimir Script","Vrinda","Westminster","WHITNEY","Wide Latin","ZapfEllipt BT","ZapfHumnst BT","ZapfHumnst Dm BT","Zapfino","Zurich BlkEx BT","Zurich Ex BT","ZWAdobeF"],googleFonts=["ABeeZee","Abel","Abhaya Libre","Abril Fatface","Aclonica","Acme","Actor","Adamina","Advent Pro","Aguafina Script","Akronim","Aladin","Aldrich","Alef","Alegreya","Alegreya SC","Alegreya Sans","Alegreya Sans SC","Aleo","Alex Brush","Alfa Slab One","Alice","Alike","Alike Angular","Allan","Allerta","Allerta Stencil","Allura","Almarai","Almendra","Almendra Display","Almendra SC","Amarante","Amaranth","Amatic SC","Amethysta","Amiko","Amiri","Amita","Anaheim","Andada","Andika","Angkor","Annie Use Your Telescope","Anonymous Pro","Antic","Antic Didone","Antic Slab","Anton","Arapey","Arbutus","Arbutus Slab","Architects Daughter","Archivo","Archivo Black","Archivo Narrow","Aref Ruqaa","Arima Madurai","Arimo","Arizonia","Armata","Arsenal","Artifika","Arvo","Arya","Asap","Asap Condensed","Asar","Asset","Assistant","Astloch","Asul","Athiti","Atma","Atomic Age","Aubrey","Audiowide","Autour One","Average","Average Sans","Averia Gruesa Libre","Averia Libre","Averia Sans Libre","Averia Serif Libre","B612","B612 Mono","Bad Script","Bahiana","Bahianita","Bai Jamjuree","Baloo","Baloo Bhai","Baloo Bhaijaan","Baloo Bhaina","Baloo Chettan","Baloo Da","Baloo Paaji","Baloo Tamma","Baloo Tammudu","Baloo Thambi","Balthazar","Bangers","Barlow","Barlow Condensed","Barlow Semi Condensed","Barriecito","Barrio","Basic","Battambang","Baumans","Bayon","Be Vietnam","Bebas Neue","Belgrano","Bellefair","Belleza","BenchNine","Bentham","Berkshire Swash","Beth Ellen","Bevan","Big Shoulders Display","Big Shoulders Text","Bigelow Rules","Bigshot One","Bilbo","Bilbo Swash Caps","BioRhyme","BioRhyme Expanded","Biryani","Bitter","Black And White Picture","Black Han Sans","Black Ops One","Blinker","Bokor","Bonbon","Boogaloo","Bowlby One","Bowlby One SC","Brawler","Bree Serif","Bubblegum Sans","Bubbler One","Buda","Buenard","Bungee","Bungee Hairline","Bungee Inline","Bungee Outline","Bungee Shade","Butcherman","Butterfly Kids","Cabin","Cabin Condensed","Cabin Sketch","Caesar Dressing","Cagliostro","Cairo","Calligraffitti","Cambay","Cambo","Candal","Cantarell","Cantata One","Cantora One","Capriola","Cardo","Carme","Carrois Gothic","Carrois Gothic SC","Carter One","Catamaran","Caudex","Caveat","Caveat Brush","Cedarville Cursive","Ceviche One","Chakra Petch","Changa","Changa One","Chango","Charm","Charmonman","Chathura","Chau Philomene One","Chela One","Chelsea Market","Chenla","Cherry Cream Soda","Cherry Swash","Chewy","Chicle","Chilanka","Chivo","Chonburi","Cinzel","Cinzel Decorative","Clicker Script","Coda","Coda Caption","Codystar","Coiny","Combo","Comfortaa","Coming Soon","Concert One","Condiment","Content","Contrail One","Convergence","Cookie","Copse","Corben","Cormorant","Cormorant Garamond","Cormorant Infant","Cormorant SC","Cormorant Unicase","Cormorant Upright","Courgette","Cousine","Coustard","Covered By Your Grace","Crafty Girls","Creepster","Crete Round","Crimson Pro","Crimson Text","Croissant One","Crushed","Cuprum","Cute Font","Cutive","Cutive Mono","DM Sans","DM Serif Display","DM Serif Text","Damion","Dancing Script","Dangrek","Darker Grotesque","David Libre","Dawning of a New Day","Days One","Dekko","Delius","Delius Swash Caps","Delius Unicase","Della Respira","Denk One","Devonshire","Dhurjati","Didact Gothic","Diplomata","Diplomata SC","Do Hyeon","Dokdo","Domine","Donegal One","Doppio One","Dorsa","Dosis","Dr Sugiyama","Duru Sans","Dynalight","EB Garamond","Eagle Lake","East Sea Dokdo","Eater","Economica","Eczar","El Messiri","Electrolize","Elsie","Elsie Swash Caps","Emblema One","Emilys Candy","Encode Sans","Encode Sans Condensed","Encode Sans Expanded","Encode Sans Semi Condensed","Encode Sans Semi Expanded","Engagement","Englebert","Enriqueta","Erica One","Esteban","Euphoria Script","Ewert","Exo","Exo 2","Expletus Sans","Fahkwang","Fanwood Text","Farro","Farsan","Fascinate","Fascinate Inline","Faster One","Fasthand","Fauna One","Faustina","Federant","Federo","Felipa","Fenix","Finger Paint","Fira Code","Fira Mono","Fira Sans","Fira Sans Condensed","Fira Sans Extra Condensed","Fjalla One","Fjord One","Flamenco","Flavors","Fondamento","Fontdiner Swanky","Forum","Francois One","Frank Ruhl Libre","Freckle Face","Fredericka the Great","Fredoka One","Freehand","Fresca","Frijole","Fruktur","Fugaz One","GFS Didot","GFS Neohellenic","Gabriela","Gaegu","Gafata","Galada","Galdeano","Galindo","Gamja Flower","Gayathri","Gentium Basic","Gentium Book Basic","Geo","Geostar","Geostar Fill","Germania One","Gidugu","Gilda Display","Give You Glory","Glass Antiqua","Glegoo","Gloria Hallelujah","Goblin One","Gochi Hand","Gorditas","Gothic A1","Goudy Bookletter 1911","Graduate","Grand Hotel","Gravitas One","Great Vibes","Grenze","Griffy","Gruppo","Gudea","Gugi","Gurajada","Habibi","Halant","Hammersmith One","Hanalei","Hanalei Fill","Handlee","Hanuman","Happy Monkey","Harmattan","Headland One","Heebo","Henny Penny","Hepta Slab","Herr Von Muellerhoff","Hi Melody","Hind","Hind Guntur","Hind Madurai","Hind Siliguri","Hind Vadodara","Holtwood One SC","Homemade Apple","Homenaje","IBM Plex Mono","IBM Plex Sans","IBM Plex Sans Condensed","IBM Plex Serif","IM Fell DW Pica","IM Fell DW Pica SC","IM Fell Double Pica","IM Fell Double Pica SC","IM Fell English","IM Fell English SC","IM Fell French Canon","IM Fell French Canon SC","IM Fell Great Primer","IM Fell Great Primer SC","Iceberg","Iceland","Imprima","Inconsolata","Inder","Indie Flower","Inika","Inknut Antiqua","Irish Grover","Istok Web","Italiana","Italianno","Itim","Jacques Francois","Jacques Francois Shadow","Jaldi","Jim Nightshade","Jockey One","Jolly Lodger","Jomhuria","Jomolhari","Josefin Sans","Josefin Slab","Joti One","Jua","Judson","Julee","Julius Sans One","Junge","Jura","Just Another Hand","Just Me Again Down Here","K2D","Kadwa","Kalam","Kameron","Kanit","Kantumruy","Karla","Karma","Katibeh","Kaushan Script","Kavivanar","Kavoon","Kdam Thmor","Keania One","Kelly Slab","Kenia","Khand","Khmer","Khula","Kirang Haerang","Kite One","Knewave","KoHo","Kodchasan","Kosugi","Kosugi Maru","Kotta One","Koulen","Kranky","Kreon","Kristi","Krona One","Krub","Kulim Park","Kumar One","Kumar One Outline","Kurale","La Belle Aurore","Lacquer","Laila","Lakki Reddy","Lalezar","Lancelot","Lateef","Lato","League Script","Leckerli One","Ledger","Lekton","Lemon","Lemonada","Lexend Deca","Lexend Exa","Lexend Giga","Lexend Mega","Lexend Peta","Lexend Tera","Lexend Zetta","Libre Barcode 128","Libre Barcode 128 Text","Libre Barcode 39","Libre Barcode 39 Extended","Libre Barcode 39 Extended Text","Libre Barcode 39 Text","Libre Baskerville","Libre Caslon Display","Libre Caslon Text","Libre Franklin","Life Savers","Lilita One","Lily Script One","Limelight","Linden Hill","Literata","Liu Jian Mao Cao","Livvic","Lobster","Lobster Two","Londrina Outline","Londrina Shadow","Londrina Sketch","Londrina Solid","Long Cang","Lora","Love Ya Like A Sister","Loved by the King","Lovers Quarrel","Luckiest Guy","Lusitana","Lustria","M PLUS 1p","M PLUS Rounded 1c","Ma Shan Zheng","Macondo","Macondo Swash Caps","Mada","Magra","Maiden Orange","Maitree","Major Mono Display","Mako","Mali","Mallanna","Mandali","Manjari","Mansalva","Manuale","Marcellus","Marcellus SC","Marck Script","Margarine","Markazi Text","Marko One","Marmelad","Martel","Martel Sans","Marvel","Mate","Mate SC","Material Icons","Maven Pro","McLaren","Meddon","MedievalSharp","Medula One","Meera Inimai","Megrim","Meie Script","Merienda","Merienda One","Merriweather","Merriweather Sans","Metal","Metal Mania","Metamorphous","Metrophobic","Michroma","Milonga","Miltonian","Miltonian Tattoo","Mina","Miniver","Miriam Libre","Mirza","Miss Fajardose","Mitr","Modak","Modern Antiqua","Mogra","Molengo","Molle","Monda","Monofett","Monoton","Monsieur La Doulaise","Montaga","Montez","Montserrat","Montserrat Alternates","Montserrat Subrayada","Moul","Moulpali","Mountains of Christmas","Mouse Memoirs","Mr Bedfort","Mr Dafoe","Mr De Haviland","Mrs Saint Delafield","Mrs Sheppards","Mukta","Mukta Mahee","Mukta Malar","Mukta Vaani","Muli","Mystery Quest","NTR","Nanum Brush Script","Nanum Gothic","Nanum Gothic Coding","Nanum Myeongjo","Nanum Pen Script","Neucha","Neuton","New Rocker","News Cycle","Niconne","Niramit","Nixie One","Nobile","Nokora","Norican","Nosifer","Notable","Nothing You Could Do","Noticia Text","Noto Sans","Noto Sans HK","Noto Sans JP","Noto Sans KR","Noto Sans SC","Noto Sans TC","Noto Serif","Noto Serif JP","Noto Serif KR","Noto Serif SC","Noto Serif TC","Nova Cut","Nova Flat","Nova Mono","Nova Oval","Nova Round","Nova Script","Nova Slim","Nova Square","Numans","Nunito","Nunito Sans","Odor Mean Chey","Offside","Old Standard TT","Oldenburg","Oleo Script","Oleo Script Swash Caps","Open Sans","Open Sans Condensed","Oranienbaum","Orbitron","Oregano","Orienta","Original Surfer","Oswald","Over the Rainbow","Overlock","Overlock SC","Overpass","Overpass Mono","Ovo","Oxygen","Oxygen Mono","PT Mono","PT Sans","PT Sans Caption","PT Sans Narrow","PT Serif","PT Serif Caption","Pacifico","Padauk","Palanquin","Palanquin Dark","Pangolin","Paprika","Parisienne","Passero One","Passion One","Pathway Gothic One","Patrick Hand","Patrick Hand SC","Pattaya","Patua One","Pavanam","Paytone One","Peddana","Peralta","Permanent Marker","Petit Formal Script","Petrona","Philosopher","Piedra","Pinyon Script","Pirata One","Plaster","Play","Playball","Playfair Display","Playfair Display SC","Podkova","Poiret One","Poller One","Poly","Pompiere","Pontano Sans","Poor Story","Poppins","Port Lligat Sans","Port Lligat Slab","Pragati Narrow","Prata","Preahvihear","Press Start 2P","Pridi","Princess Sofia","Prociono","Prompt","Prosto One","Proza Libre","Public Sans","Puritan","Purple Purse","Quando","Quantico","Quattrocento","Quattrocento Sans","Questrial","Quicksand","Quintessential","Qwigley","Racing Sans One","Radley","Rajdhani","Rakkas","Raleway","Raleway Dots","Ramabhadra","Ramaraja","Rambla","Rammetto One","Ranchers","Rancho","Ranga","Rasa","Rationale","Ravi Prakash","Red Hat Display","Red Hat Text","Redressed","Reem Kufi","Reenie Beanie","Revalia","Rhodium Libre","Ribeye","Ribeye Marrow","Righteous","Risque","Roboto","Roboto Condensed","Roboto Mono","Roboto Slab","Rochester","Rock Salt","Rokkitt","Romanesco","Ropa Sans","Rosario","Rosarivo","Rouge Script","Rozha One","Rubik","Rubik Mono One","Ruda","Rufina","Ruge Boogie","Ruluko","Rum Raisin","Ruslan Display","Russo One","Ruthie","Rye","Sacramento","Sahitya","Sail","Saira","Saira Condensed","Saira Extra Condensed","Saira Semi Condensed","Saira Stencil One","Salsa","Sanchez","Sancreek","Sansita","Sarabun","Sarala","Sarina","Sarpanch","Satisfy","Sawarabi Gothic","Sawarabi Mincho","Scada","Scheherazade","Schoolbell","Scope One","Seaweed Script","Secular One","Sedgwick Ave","Sedgwick Ave Display","Sevillana","Seymour One","Shadows Into Light","Shadows Into Light Two","Shanti","Share","Share Tech","Share Tech Mono","Shojumaru","Short Stack","Shrikhand","Siemreap","Sigmar One","Signika","Signika Negative","Simonetta","Single Day","Sintony","Sirin Stencil","Six Caps","Skranji","Slabo 13px","Slabo 27px","Slackey","Smokum","Smythe","Sniglet","Snippet","Snowburst One","Sofadi One","Sofia","Song Myung","Sonsie One","Sorts Mill Goudy","Source Code Pro","Source Sans Pro","Source Serif Pro","Space Mono","Special Elite","Spectral","Spectral SC","Spicy Rice","Spinnaker","Spirax","Squada One","Sree Krushnadevaraya","Sriracha","Srisakdi","Staatliches","Stalemate","Stalinist One","Stardos Stencil","Stint Ultra Condensed","Stint Ultra Expanded","Stoke","Strait","Stylish","Sue Ellen Francisco","Suez One","Sumana","Sunflower","Sunshiney","Supermercado One","Sura","Suranna","Suravaram","Suwannaphum","Swanky and Moo Moo","Syncopate","Tajawal","Tangerine","Taprom","Tauri","Taviraj","Teko","Telex","Tenali Ramakrishna","Tenor Sans","Text Me One","Thasadith","The Girl Next Door","Tienne","Tillana","Timmana","Tinos","Titan One","Titillium Web","Tomorrow","Trade Winds","Trirong","Trocchi","Trochut","Trykker","Tulpen One","Turret Road","Ubuntu","Ubuntu Condensed","Ubuntu Mono","Ultra","Uncial Antiqua","Underdog","Unica One","UnifrakturCook","UnifrakturMaguntia","Unkempt","Unlock","Unna","VT323","Vampiro One","Varela","Varela Round","Vast Shadow","Vesper Libre","Vibes","Vibur","Vidaloka","Viga","Voces","Volkhov","Vollkorn","Vollkorn SC","Voltaire","Waiting for the Sunrise","Wallpoet","Walter Turncoat","Warnes","Wellfleet","Wendy One","Wire One","Work Sans","Yanone Kaffeesatz","Yantramanav","Yatra One","Yellowtail","Yeon Sung","Yeseva One","Yesteryear","Yrsa","ZCOOL KuaiLe","ZCOOL QingKe HuangYou","ZCOOL XiaoWei","Zeyada","Zhi Mang Xing","Zilla Slab","Zilla Slab Highlight"],notoFonts=["Noto Naskh Arabic","Noto Sans Armenian","Noto Sans Bengali","Noto Sans Buginese","Noto Sans Canadian Aboriginal","Noto Sans Cherokee","Noto Sans Devanagari","Noto Sans Ethiopic","Noto Sans Georgian","Noto Sans Gujarati","Noto Sans Gurmukhi","Noto Sans Hebrew","Noto Sans JP Regular","Noto Sans KR Regular","Noto Sans Kannada","Noto Sans Khmer","Noto Sans Lao","Noto Sans Malayalam","Noto Sans Mongolian","Noto Sans Myanmar","Noto Sans Oriya","Noto Sans SC Regular","Noto Sans Sinhala","Noto Sans TC Regular","Noto Sans Tamil","Noto Sans Telugu","Noto Sans Thaana","Noto Sans Thai","Noto Sans Tibetan","Noto Sans Yi","Noto Serif Armenian","Noto Serif Khmer","Noto Serif Lao","Noto Serif Thai"];

	// scene
	const scene = html`
	<fingerprint>
		<div id="fingerprint-data">
			<div id="${instanceId}-fingerprint">
				<strong>Fingerprint</strong>
				<div class="trusted-fingerprint" style="color:#fff">.</div>
				<div>loose fingerprint:</div>
				<div class="time">performance: 0 milliseconds</div>
			</div>
			<div id="${instanceId}-browser">
				<strong>Browser</strong>
				<div>visits:</div>
				<div>first:</div>
				<div>last:</div>
				<div>persistence:</div>
				<div>has trash:</div>
				<div>has lied:</div>
				<div>has errors:</div>
				<div>loose fingerprints:</div>
				<div>bot:</div>
			</div>
			<div id="${instanceId}-trash">
				<strong>Trash Bin</strong>
				<div>hash:</div>
				<div>trash (0):</div>
			</div>
			<div id="${instanceId}-lies">
				<strong>Lies Unmasked</strong>
				<div>hash:</div>
				<div>lies (0):</div>
			</div>
			<div id="${instanceId}-captured-errors">
				<strong>Errors Captured</strong>
				<div>hash:</div>
				<div>errors (0):</div>
			</div>
			<div id="${instanceId}-worker-scope">
				<strong>WorkerGlobalScope: WorkerNavigator/OffscreenCanvas</strong>
				<div>hash:</div>
				<div>timezone offset</div>
				<div>hardwareConcurrency:</div>
				<div>language:</div>
				<div>platform:</div>
				<div>webgl renderer:</div>
				<div>webgl vendor:</div>
				<div>system:</div>
				<div>canvas 2d:</div>
			</div>
			<div id="${instanceId}-cloudflare">
				<strong>Cloudflare</strong>
				<div>hash:</div>
				<div>ip address:</div>
				<div>system:</div>
				<div>ip location:</div>
				<div>tls version:</div>
			</div>
			<div id="${instanceId}-webrtc">
				<strong>RTCPeerConnection</strong>
				<div>hash:</div>
				<div>webRTC leak:</div>
				<div>ip address:</div>
				<div>candidate encoding:</div>
				<div>connection line:</div>
				<div>matching:</div>
			</div>
			<div id="${instanceId}-canvas-2d">
				<strong>CanvasRenderingContext2D</strong>
				<div>hash:</div>
			</div>
			<div id="${instanceId}-canvas-bitmap-renderer">
				<strong>ImageBitmapRenderingContext</strong>
				<div>hash:</div>
			</div>
			<div id="${instanceId}-canvas-webgl">
				<strong>WebGLRenderingContext/WebGL2RenderingContext</strong>
					<div>hash:</div>
					<div>v1 toDataURL:</div>
					<div>v1 parameters (0):</div>
					<div>v1 extensions (0):</div>
					<div>v1 renderer:</div>
					<div>v1 vendor:</div>
					<div>v2 toDataURL:</div>
					<div>v2 parameters (0):</div>
					<div>v2 extensions (0):</div>
					<div>v2 renderer:</div>
					<div>v2 vendor:</div>
					<div>matching renderer/vendor:</div>
					<div>matching data URI:</div>
			</div>
			<div id="${instanceId}-offline-audio-context">
				<strong>OfflineAudioContext</strong>
				<div>hash:</div>
				<div>sample:</div>
				<div>copy:</div>
				<div>matching:</div>
				<div>node values:</div>
			</div>
			<div id="${instanceId}-client-rects">
				<strong>DOMRect</strong>
				<div>hash:</div>
				<div>results:</div>
			</div>
			<div id="${instanceId}-maths">
				<strong>Math</strong>
				<div>hash:</div>
				<div>results:</div>
				<div>engine:</div>
			</div>
			<div id="${instanceId}-console-errors">
				<strong>Error</strong>
				<div>hash:</div>
				<div>results:</div>
				<div>engine:</div>
			</div>
			<div id="${instanceId}-timezone">
				<strong>Date/Intl</strong>
				<div>hash:</div>
				<div>timezone:</div>
				<div>timezone location:</div>
				<div>timezone offset:</div>
				<div>timezone offset computed:</div>
				<div>matching offsets:</div>
				<div>timezone measured:</div>
				<div>relativeTimeFormat:</div>
				<div>locale language:</div>
			</div>
			<div id="${instanceId}-screen">
				<strong>Screen</strong>
				<div>hash:</div>
				<div>device:</div>
				<div>width:</div>
				<div>outerWidth:</div>
				<div>availWidth:</div>
				<div>height:</div>
				<div>outerHeight:</div>
				<div>availHeight:</div>
				<div>colorDepth:</div>
				<div>pixelDepth:</div>
			</div>
			<div id="${instanceId}-media-devices">
				<strong>MediaDevicesInfo</strong>
				<div>hash:</div>
				<div>devices (0):</div>
			</div>
			<div id="${instanceId}-iframe-content-window-version">
				<strong>HTMLIFrameElement.contentWindow</strong>
				<div>hash:</div>
				<div>keys:</div>
			</div>
			<div id="${instanceId}-html-element-version">
				<strong>HTMLElement</strong>
				<div>hash:</div>
				<div>keys:</div>
			</div>
			<div id="${instanceId}-css-style-declaration-version">
				<strong>CSSStyleDeclaration</strong>
				<div>hash:</div>
				<div>prototype:</div>
				<div>getComputedStyle:</div>
				<div>HTMLElement.style:</div>
				<div>CSSRuleList.style:</div>
				<div>keys:</div>
				<div>moz:</div>
				<div>webkit:</div>
				<div>matching:</div>
			</div>
			<div id="${instanceId}-navigator">
				<strong>Navigator</strong>
				<div>hash:</div>
				<div>appVersion:</div>
				<div>deviceMemory:</div>
				<div>doNotTrack:</div>
				<div>hardwareConcurrency:</div>
				<div>language:</div>
				<div>maxTouchPoints:</div>
				<div>platform:</div>
				<div>userAgent:</div>
				<div>system:</div>
				<div>plugins (0):</div>
				<div>mimeTypes (0):</div>
				<div>ua architecture:</div>
				<div>ua model:</div>
				<div>ua platform:</div>
				<div>ua platformVersion:</div>
				<div>ua uaFullVersion:</div>
				<div>properties (0):</div>
			</div>
			<div id="${instanceId}-voices">
				<strong>SpeechSynthesis</strong>
				<div>hash:</div>
				<div>voices (0):</div>
			</div>
			<div id="${instanceId}-fonts">
			</div>
			<div>
				Data auto deletes <a href="https://github.com/abrahamjuliot/creepjs/blob/8d6603ee39c9534cad700b899ef221e0ee97a5a4/server.gs#L24" target="_blank">every 7 days</a>
			</div>
		</div>

		<div id="font-detector"><div id="font-detector-stage"></div></div>
	</fingerprint>
	`

	const getTrash = (instanceId, trashBin) => {
		return new Promise(async resolve => {
			const len = trashBin.length
			const $hash = await hashify(trashBin)
			resolve({ trashBin, $hash })
			const id = `${instanceId}-trash`
			const el = document.getElementById(id)
			patch(el, html`
			<div class="${len ? 'trash': ''}">
				<strong>Trash Bin</strong>
				<div>hash: ${$hash}</div>
				<div>trash (${!len ? '0' : ''+len }): ${
					len ? modal(id, trashBin.map((trash,i) => `${i+1}: ${trash.name}: ${trash.value}`).join('<br>')) : `<span class="none">none</span>`
				}</div>
			</div>
			`)
			return
		})
	}

	const getLies = (instanceId, lieRecords) => {
		return new Promise(async resolve => {
			const len = lieRecords.length
			const data = lieRecords.map(lie => ({ name: lie.name, lieTypes: lie.lieTypes }))
			const $hash = await hashify(data)
			resolve({data, $hash })
			const id = `${instanceId}-lies`
			const el = document.getElementById(id)
			patch(el, html`
			<div class="${len ? 'lies': ''}">
				<strong>Lies Unmasked</strong>
				<div>hash: ${$hash}</div>
				<div>lies (${!len ? '0' : ''+len }): ${
					len ? modal(id, Object.keys(data).map(key => {
						const { name, lieTypes: { lies, fingerprint } } = data[key]
						const lieFingerprint = !!fingerprint ? { hash: hashMini(fingerprint), json: toJSONFormat(fingerprint) } : undefined
						const type = lies[0] ? Object.keys(lies[0])[0] : ''
						return `<div class="${lieFingerprint ? 'lie-fingerprint' : ''}"><strong>${name}</strong>: ${type}${lieFingerprint ? `<br>tampering code leaked a fingerprint: ${lieFingerprint.hash}<br>code: ${lieFingerprint.json}</div>`: '</div>'}`
					}).join('')) : `<span class="none">none</span>`
				}</div>
			</div>
			`)
			return
		})
	}
	
	const getCapturedErrors = (instanceId, errorsCaptured) => {
		return new Promise(async resolve => {
			const len = errorsCaptured.length
			const data =  errorsCaptured
			const $hash = await hashify(data)
			resolve({data, $hash })
			const id = `${instanceId}-captured-errors`
			const el = document.getElementById(id)
			patch(el, html`
			<div class="${len ? 'errors': ''}">
				<strong>Errors Captured</strong>
				<div>hash: ${$hash}</div>
				<div>errors (${!len ? '0' : ''+len }): ${
					len ? modal(id, Object.keys(data).map((key, i) => `${i+1}: ${data[key].trustedName} - ${data[key].trustedMessage} `).join('<br>')) : `<span class="none">none</span>`
				}</div>
			</div>
			`)
			return
		})
	}
	
	// fingerprint
	const fingerprint = async () => {
		// await

		const timeStart = timer()
		const [
			workerScopeComputed,
			cloudflareComputed,
			iframeContentWindowVersionComputed,
			htmlElementVersionComputed,
			cssStyleDeclarationVersionComputed,
			screenComputed,
			voicesComputed,
			mediaDevicesComputed,
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
			getWorkerScope(instanceId),
			getCloudflare(instanceId),
			getIframeContentWindowVersion(instanceId),
			getHTMLElementVersion(instanceId),
			getCSSStyleDeclarationVersion(instanceId),
			getScreen(instanceId),
			getVoices(instanceId),
			getMediaDevices(instanceId),
			getCanvas2d(instanceId),
			getCanvasBitmapRenderer(instanceId),
			getCanvasWebgl(instanceId),
			getMaths(instanceId),
			getConsoleErrors(instanceId),
			getTimezone(instanceId),
			getClientRects(instanceId),
			getOfflineAudioContext(instanceId),
			getFonts(instanceId, [...fontList, ...notoFonts])
		]).catch(error => {
			console.error(error.message)
		})
		const webRTCDataComputed = await getWebRTCData(instanceId, cloudflareComputed)
		const navigatorComputed = await getNavigator(instanceId, workerScopeComputed)
		const [
			liesComputed,
			trashComputed,
			capturedErrorsComputed
		] = await Promise.all([
			getLies(instanceId, lieRecords),
			getTrash(instanceId, trashBin),
			getCapturedErrors(instanceId, errorsCaptured)
		]).catch(error => {
			console.error(error.message)
		})
		const timeEnd = timeStart()

		if (parentIframe) {
			parentIframe.remove()
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
		}
		return { fingerprint, timeEnd }
	}
	// get/post request
	const webapp = 'https://script.google.com/macros/s/AKfycbzKRjt6FPboOEkh1vTXttGyCjp97YBP7z-5bODQmtSkQ9BqDRY/exec'
	
	// patch
	const app = document.getElementById('fp-app')
	patch(app, scene, async () => {
		// fingerprint and render
		const { fingerprint: fp, timeEnd } = await fingerprint().catch(error => console.error(error))
		// Trusted Fingerprint
		const distrust = { distrust: { brave: isBrave, firefox: isFirefox } }
		const creep = {
			workerScope: fp.workerScope,
			mediaDevices: !isBrave ? fp.mediaDevices : distrust,
			canvas2d: !(isBrave || isFirefox) ? fp.canvas2d : distrust,
			canvasBitmapRenderer: !(isBrave || isFirefox) ? fp.canvasBitmapRenderer : distrust,
			canvasWebgl: !(isBrave || isFirefox) ? fp.canvasWebgl : distrust,
			maths: fp.maths,
			consoleErrors: fp.consoleErrors,
			// avoid random timezone fingerprint values
			timezone: !fp.timezone || !fp.timezone.lied ? fp.timezone : undefined,
			clientRects: fp.clientRects,
			// node values provide essential entropy (bin samples are just math results and randomized in brave)
			offlineAudioContext: caniuse(() => fp.offlineAudioContext.values),
			fonts: fp.fonts,
			// avoid random trash fingerprint
			trash: fp.trash.trashBin.map(trash => trash.name),
			// avoid random lie fingerprint
			lies: !('data' in fp.lies) ? [] : fp.lies.data.map(lie => {
				const { lieTypes, name } = lie
				const types = Object.keys(lieTypes)
				const lies = lieTypes.lies
				return { name, types, lies }
			}),
			capturedErrors: fp.capturedErrors.data.map(error => error.trustedName)
		}
		const debugLog = (message, obj) => console.log(message, JSON.stringify(obj, null, '\t'))
		
		console.log('Fingerprint (Object):', creep)
		console.log('Loose Fingerprint (Object):', fp)
		//debugLog('Loose Id (JSON):', fp)
		
		const [fpHash, creepHash] = await Promise.all([hashify(fp), hashify(creep)])
		.catch(error => { 
			console.error(error.message)
		})

		const hasTrash = !('trashBin' in fp.trash) ? false : !!fp.trash.trashBin.length
		const hasLied = !('data' in fp.lies) ? false : !!fp.lies.data.length
		const hasErrors = !('data' in fp.capturedErrors) ? false : !!fp.capturedErrors.data.length

		// fetch data from server
		const id = `${instanceId}-browser`
		const visitorElem = document.getElementById(id)
		const fetchVisitoDataTimer = timer('Fetching visitor data...')
		fetch(`${webapp}?id=${creepHash}&subId=${fpHash}&hasTrash=${hasTrash}&hasLied=${hasLied}&hasErrors=${hasErrors}`)
			.then(response => response.json())
			.then(data => {
				console.log(data)
				const { firstVisit, latestVisit, subIds, visits, hasTrash, hasLied, hasErrors } = data
				const subIdsLen = Object.keys(subIds).length
				const toLocaleStr = str => {
					const date = new Date(str)
					const dateString = date.toDateString()
					const timeString = date.toLocaleTimeString()
					return `${dateString}, ${timeString}`
				}
				const hoursAgo = (date1, date2) => Math.abs(date1 - date2) / 36e5
				const hours = hoursAgo(new Date(firstVisit), new Date(latestVisit)).toFixed(1)
				const template = `
					<div>
						<strong>Browser</strong>
						<div>visits: ${visits}</div>
						<div>first: ${toLocaleStr(firstVisit)}
						<div>last: ${toLocaleStr(latestVisit)}</div>
						<div>persistence: ${hours} hours</div>
						<div>has trash: ${(''+hasTrash) == 'true' ? 'true' : 'false'}</div>
						<div>has lied: ${(''+hasLied) == 'true'? 'true' : 'false'}</div>
						<div>has errors: ${(''+hasErrors) == 'true' ? 'true' : 'false'}</div>
						<div>loose fingerprints: ${subIdsLen}</div>
						<div>bot: ${subIdsLen > 10 && hours < 48 ? 'true' : 'false'}</div>
					</div>
				`
				fetchVisitoDataTimer('Visitor data received')
				return patch(visitorElem, html`${template}`)
			})
			.catch(err => {
				fetchVisitoDataTimer('Error fetching visitor data')
				patch(visitorElem, html`<div>Error fetching data: <a href="https://status.cloud.google.com" target="_blank">status.cloud.google.com</a></div>`)
				return console.error('Error!', err.message)
			})

		const el = document.getElementById(`${instanceId}-fingerprint`)
		return patch(el, html`
		<div>
			<strong>Fingerprint</strong>
			<div class="trusted-fingerprint">${creepHash}</div>
			<div>loose fingerprint: ${fpHash}</div>
			<div class="time">performance: ${timeEnd} milliseconds</div>
		</div>
		`)
	}).catch((e) => console.log(e))
})()