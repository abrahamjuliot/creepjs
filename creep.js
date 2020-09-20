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

	const attempt = (fn, customMessage = null) => {
		try {
			return fn()
		} catch (error) {
			if (customMessage) {
				return captureError(error, customMessage)
			}
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
		lied: '<span class="lies">lied</span>'
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
		const gibbers = []
		if (!str) {
			return gibbers
		}
		const clean = str.toLowerCase().replace(/\d|\W|_/g, ' ').replace(/\s+/g,' ').trim().split(' ').join('_')
		const len = clean.length
		const arr = [...clean]
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
	const validateContentWindow = iframe => {
		if (!iframe.contentWindow) { throw new Error('blocked by client') }
		return iframe
	}
	const getNestedContentWindowContext = instanceId => {
		return new Promise(resolve => {
			const allowScripts = () => !isFirefox && !isChrome ? 'allow-scripts ' : ''
			try {
				const thisSiteCantBeReached = `about:${instanceId}` // url must yield 'this site cant be reached' error
				const createIframe = (win, id) => {
					const doc = win.document
					const iframe = doc.createElement('iframe')
					iframe.setAttribute('id', id)
					iframe.setAttribute('style', 'display:none')
					iframe.setAttribute('sandbox', `${allowScripts()}allow-same-origin`)
					const placeholder = doc.createElement('div')
					placeholder.setAttribute('style', 'display:none')
					const placeholderId = `${instanceId}-contentWindow-placeholder`
					placeholder.setAttribute('id', placeholderId)

					if (isChrome) {
						iframe.src = thisSiteCantBeReached 
					}

					let rendered = win
					
					try {
						doc.body.append(iframe)
						rendered = validateContentWindow(iframe)
					}
					catch(error) {
						captureError(error, 'client tampered with append')
					}

					try {
						doc.body.prepend(iframe)
						rendered = validateContentWindow(iframe)
					}
					catch(error) {
						captureError(error, 'client tampered with prepend')
					}

					try {
						doc.body.appendChild(iframe)
						rendered = validateContentWindow(iframe)
					}
					catch(error) {
						captureError(error, 'client tampered with appendChild')
					}

					try {
						doc.body.appendChild(placeholder)
						placeholder.replaceWith(iframe)
						rendered = validateContentWindow(iframe)
					}
					catch(error) {
						captureError(error, 'client tampered with replaceWith')
					}

					try {
						doc.body.insertBefore(iframe, win.parent.firstChild)
						rendered = validateContentWindow(iframe)
					}
					catch(error) {
						captureError(error, 'client tampered with insertBefore')
					}

					try {
						doc.body.appendChild(placeholder)
						doc.body.replaceChild(iframe, placeholder)
						rendered = validateContentWindow(iframe)
					}
					catch(error) {
						captureError(error, 'client tampered with replaceChild')
					}

					try {
						doc.body.insertAdjacentElement('afterend', iframe)
						rendered = validateContentWindow(iframe)
					}
					catch(error) {
						captureError(error, 'client tampered with insertAdjacentElement afterend')
					}

					try {
						doc.body.insertAdjacentElement('beforeend', iframe)
						rendered = validateContentWindow(iframe)
					}
					catch(error) {
						captureError(error, 'client tampered with insertAdjacentElement beforeend')
					}

					try {
						doc.body.insertAdjacentElement('beforebegin', iframe)
						rendered = validateContentWindow(iframe)
					}
					catch(error) {
						captureError(error, 'client tampered with insertAdjacentElement beforebegin')
					}

					try {
						doc.body.insertAdjacentElement('afterbegin', iframe)
						rendered = validateContentWindow(iframe)
					}
					catch(error) {
						captureError(error, 'client tampered with insertAdjacentElement afterbegin')
					}

					return {
						el: rendered,
						context: rendered.contentWindow,
						remove: () => rendered.parentNode.removeChild(rendered)
					}
				}
				const parentIframe = createIframe(window, `${instanceId}-parent-iframe`)
				const {
					context: contentWindow
				} = createIframe(parentIframe.context, `${instanceId}-nested-iframe`)

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
	const native = (result, str, willHaveBlanks = false) => {
		const chrome = `function ${str}() { [native code] }`
		const chromeGet = `function get ${str}() { [native code] }`
		const firefox = `function ${str}() {\n    [native code]\n}`
		const chromeBlank = `function () { [native code] }`
		const firefoxBlank = `function () {\n    [native code]\n}`

		return (
			result == chrome ||
			result == chromeGet ||
			result == firefox || (
				willHaveBlanks && (result == chromeBlank || result == firefoxBlank)
			)
		)
	}

	const hasLiedAPI = (api, name, obj = undefined) => {
		
		const fnToStr = (
			contentWindow ? 
			contentWindow.Function.prototype.toString.call(Function.prototype.toString) : // aggressive test
			Function.prototype.toString+''
		)

		let willHaveBlanks = false
		try {
			willHaveBlanks = obj && (obj+'' == '[object Navigator]' || obj+'' == '[object Document]')
		}
		catch (error) { }

		if (typeof api == 'function') {
			try {

				let lies = []
				let fingerprint = ''

				// detect failed attempts to tamper with getter
				if (obj && obj.__lookupGetter__(name)) {
					lies.push({
						['failed prototype.__lookupGetter__ test']: true
					})
				}

				// detect failed attempts to tamper with API length
				const apiLen = {
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
				}

				if (apiLen[name] && apiLen[name][0] && api.length != apiLen[name][1]) {
					lies.push({
						['failed length test']: true
					})
				}

				// detect failed attempt to modify object entries
				if (!!Object.entries(api).length) {
					lies.push({
						['failed Object.entries test']: true
					})
				}
				// detect failed attempt to modify object keys
				if (!!Object.keys(api).length) {
					lies.push({
						['failed Object.keys test']: true
					})
				}
				// detect failed attempt to modify object keys
				if (!!Object.values(api).length) {
					lies.push({
						['failed Object.values test']: true
					})
				}
				
				// detect failed attempts to rename the API and/or rewrite toString
				const { name: apiName, toString: apiToString } = api
				if (apiName != '' && apiName != name) {
					lies.push({
						['failed name test']: !proxyBehavior(apiName) ? apiName: true
					})
				}
				if (apiToString+'' !== fnToStr || apiToString.toString+'' !== fnToStr) {
					lies.push({
						['failed toString test']: !proxyBehavior(apiToString) ? apiToString: true
					})
				}

				// detect prototype tampering
				if (api.prototype) {
					lies.push({
						['failed function.prototype test']: true
					})
				}

				// detect failed attempts to tamper with discriptors
				const descriptors = Object.keys(Object.getOwnPropertyDescriptors(api))
				if (''+descriptors != 'length,name') {
					lies.push({
						['failed getOwnPropertyDescriptors [length, name] test']: true
					})
				}

				// detect failed attempts to tamper with property own property names
				const ownPropertyNames = Object.getOwnPropertyNames(api)
				if (''+ownPropertyNames != 'length,name') {
					lies.push({
						['failed getOwnPropertyNames [length, name] test']: true
					})
				}
				
				if (obj) {
					// detect failed attempts to tamper with getter
					try {
						Object.getOwnPropertyDescriptor(obj, name).get.toString()
						lies.push({
							['failed descriptor.get.toString() test']: true
						})
					}
					catch (error) {
						// Native throws error
					}

					// detect failed attempt to tamper with descriptor
					if (!!Object.getOwnPropertyDescriptor(obj, name).name) {
						lies.push({
							['failed descriptor.name test']: true
						})
					}

					// detect attempts to define toString
					if (!!Object.getOwnPropertyDescriptor(api, 'toString')) {
						lies.push({
							['failed getOwnPropertyDescriptor toString test']: true
						})
					}
				}

				// collect string conversion result
				const result = (
					contentWindow ? 
					contentWindow.Function.prototype.toString.call(api) :
					'' + api
				)
				
				// fingerprint result if it does not match native code
				if (!native(result, name, willHaveBlanks)) {
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

		if (typeof api == 'object' && caniuse(() => obj[name]) != undefined) {
				
			try {
				const apiFunction = Object.getOwnPropertyDescriptor(api, name).get
				let lies = []
				let fingerprint = ''

				// detect invocation tampering
				let illegalCount = 0
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
				]
				try {
					api[name]
					illegalCount++
				}
				catch (error) {
					// Native throws error
				}
				illegal.forEach((prop, index) => {
					try {
						!prop ? Object(api[name]) : Object[prop](api[name])
						illegalCount++
					}
					catch (error) {
						// Native throws error
					}
				})

				if (illegalCount) {
					lies.push({
						[`failed Illegal invocation tests: ${illegalCount} of ${illegal.length+1}`]: true
					})
				}
				
				// detect failed attempts to define name
				if (!!Object.getOwnPropertyDescriptor(api, name).name) {
					lies.push({
						['failed descriptor.name test']: true
					})
				}

				// detect failed attempts to tamper with property own property names
				const apiGet = Object.getOwnPropertyDescriptor(api, name).get

				// detect failed attempts to tamper with discriptors
				const descriptors = Object.keys(Object.getOwnPropertyDescriptors(apiGet))
				if (''+descriptors != 'length,name') {
					lies.push({
						['failed getOwnPropertyDescriptors [length, name] test']: true
					})
				}

				const ownPropertyNames = Object.getOwnPropertyNames(apiGet)
				if (''+ownPropertyNames != 'length,name') {
					lies.push({
						['failed getOwnPropertyNames [length, name] test']: true
					})
				}

				// detect failed attempts to rename the API and/or rewrite toString
				const { name: apiName, toString: apiToString } = apiFunction
				if (apiName != `get ${name}` && apiName != name) {
					lies.push({
						['failed name test']: !proxyBehavior(apiName) ? apiName: true
					})
				}
				if (apiToString+'' !== fnToStr || apiToString.toString+'' !== fnToStr) {
					lies.push({
						['failed toString test']: !proxyBehavior(apiToString) ? apiToString : true
					})
				}

				if (obj) {
					try {
						const definedPropertyValue = Object.getOwnPropertyDescriptor(obj, name).value
						lies.push({
							['failed descriptor.value test']: true
						})
					}
					catch (error) {
						// Native throws error
					}
					// detect failed tampering with property names
					const clientPropertyNames = Object.getOwnPropertyNames(obj)
					if (clientPropertyNames.length && clientPropertyNames.indexOf(name) !== -1) {
						lies.push({
							['failed getOwnPropertyNames test']: true
						})
					}

					const clientDescriptorNames = Object.keys(Object.getOwnPropertyDescriptors(obj))
					if (clientDescriptorNames.length && clientDescriptorNames.indexOf(name) !== -1) {
						lies.push({
							['failed getOwnPropertyDescriptors test']: true
						})
					}
				}

				// collect string conversion result
				const result = (
					contentWindow ? 
					contentWindow.Function.prototype.toString.call(apiFunction) :
					'' + apiFunction
				)

				let objlookupGetter, apiProtoLookupGetter, result2, result3
				if (obj) {
					objlookupGetter = obj.__lookupGetter__(name)
					apiProtoLookupGetter = api.__lookupGetter__(name)
					const contentWindowResult = (
						typeof objlookupGetter != 'function' ? undefined : 
						attempt(() => contentWindow.Function.prototype.toString.call(objlookupGetter))
					)
					result2 = (
						contentWindowResult ? 
						contentWindowResult :
						'' + objlookupGetter
					)
					result3 = '' + apiProtoLookupGetter
				}

				// fingerprint result if it does not match native code
				if (!native(result, name, willHaveBlanks)) {
					fingerprint = result
				}
				else if (obj && !native(result2, name, willHaveBlanks)) {
					fingerprint = result2
				}
				else if (obj && !native(result3, name, willHaveBlanks)) {
					fingerprint = result3 != 'undefined' ? result3 : ''
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
			// math
			'89455ebb9765644fb98068ec68fbad7fcaaf2768b2cb6e1bd062eee5790c00e8': 'Chromium',
			'2607501c5033cc3ca19e835f701baf381e813f6bacfd5d50955364b078b24ecf': 'Chromium', // pow ** bug
			"99740c3678fd95585c1bd0b40e2fabfcf4043a7608a4e67fff2786fc3a59cf8a": "iOS",
			'c1141e10c4d38a4ca1a49d9c7335fdfdcd7625b4ba04053a2f335434ec7e4d36': 'Safari (~MacOS)',
			'ddc8837ab98695120dae774f04dcf295d2414ffc03431360d46b70380224547a': 'Firefox (~MacOS)',
			"09525011e48d69f97b4486a09a7d84dcb702ecb091f28d27b15fdf422960b874": "Tor Browser (~Win64)",
			"41141d85c8cee2ea78ad023124f0ee02e35f509d00742978c7b460e5737919de": "Firefox (~Win64)",
			'db3f6704dd3e8feed2b5553a95a8a8575beb904af89ce64aa85d537b36b19319': 'Firefox (~Win64)',
			'87b691d273993fb305b44cecf3429cdd5c5f4d387fb0e66bccaaf7670ca46915': 'Firefox (~Linux)',
			'870471782bc768a4dae3198669358f0d199b92d9e1c4441a3399141ff502a486': 'Firefox (~Android)', 
			"7013d0058ae26c73a4f88aca9c292ef7ac3042d8e96fb53c7ba82723bd6ffbee": "Firefox (~Android)",
			"7868cba1b7206a334ea36b83c59f53cfaff4df2f0ee68f1a3978393195e1c0dc": "Firefox (~Android)",
			
			// errors
			'7757f7416b78fb8ac1f079b3e0677c0fe179826a63727d809e7d69795e915cd5': 'Chromium',
			'a8c7362bfa3851b0ea294c075f5708b73b679b484498989d7fde311441ed3322': 'Chromium',
			'21f2f6f397db5fa611029154c35cd96eb9a96c4f1c993d4c3a25da765f2dd13b': 'Firefox',
			'bec95f2a6f1d2c815b154802467514f7b774ea64667e566acaf903db224c2b38': 'Firefox',
			'7c95559c6754c42c0d87fa0339f8a7cc5ed092e7e91ae9e50d3212f7486fcbeb': 'Firefox',
			'd420d594c5a7f7f9a93802eebc3bec3fba0ea2dde91843f6c4746121ef5da140': 'Safari'
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
	const lieProps = {}
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
	}
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
	}
	const intlConstructors = {
		'Collator': !0,
		'DateTimeFormat': !0,
		'DisplayNames': !0,
		'ListFormat': !0,
		'NumberFormat': !0,
		'PluralRules': !0,
		'RelativeTimeFormat': !0
	}
	const searchLies = (obj, ignore, log = false, proto = null) => {
		if (!obj) {
			return
		}
		let methods
		const isMath = (obj+'' == '[object Math]')
		const isTypeofObject = typeof obj == 'object'
		if (isMath) {
			methods = getMethods(obj, ignore)
		}
		else if (isTypeofObject) {
			methods = getValues(obj, ignore)
		}
		else {
			methods = getMethods(obj.prototype, ignore)
		}
		return methods.forEach(name => {
			let domManipLie
			if (isMath) {
				domManipLie = hasLiedAPI(obj[name], name, obj).lie
				if (domManipLie) {
					const apiName = `Math.${name}`
					lieProps[apiName] = true
					documentLie(apiName, undefined, domManipLie)
				}
			}
			else if (isTypeofObject) {
				domManipLie = hasLiedAPI(proto, name, obj).lie
				if (domManipLie) {
					const objName = /\s(.+)\]/g.exec(proto)[1]
					const apiName = `${objName}.${name}`
					lieProps[apiName] = true
					documentLie(apiName, undefined, domManipLie)
				}
			}
			else {
				domManipLie = hasLiedAPI(obj.prototype[name], name, obj.prototype).lie
				if (domManipLie) {
					const objName = /\s(.+)\(\)/g.exec(obj)[1]
					const apiName = `${intlConstructors[objName] ? 'Intl.' : ''}${objName}.${name}`
					lieProps[apiName] = true
					documentLie(apiName, undefined, domManipLie)
				}
			}
			if (log) {
				console.log(name, domManipLie)
			}	
		})
	}
	
	searchLies(Node, {
		constructor: !0
	})
	searchLies(Element, {
		constructor: !0
	})
	searchLies(HTMLElement, {
		constructor: !0
	})
	searchLies(HTMLCanvasElement, {
		constructor: !0
	})
	searchLies(Navigator, {
		constructor: !0
	})
	searchLies(navigator, {
		constructor: !0
	}, false, Navigator.prototype)
	searchLies(Screen, {
		constructor: !0
	})
	searchLies(screen, {
		constructor: !0
	}, false, Screen.prototype)
	searchLies(Date, {
		constructor: !0,
		toGMTString: !0
	})
	searchLies(Intl.Collator, {
		constructor: !0
	})
	searchLies(Intl.DateTimeFormat, {
		constructor: !0
	})
	searchLies(caniuse(() => Intl.DisplayNames), {
		constructor: !0
	})
	searchLies(Intl.ListFormat, {
		constructor: !0
	})
	searchLies(Intl.NumberFormat, {
		constructor: !0
	})
	searchLies(Intl.PluralRules, {
		constructor: !0
	})
	searchLies(Intl.RelativeTimeFormat, {
		constructor: !0
	})	
	searchLies(Function, {
		constructor: !0
	})
	searchLies(caniuse(() => AnalyserNode), {
		constructor: !0
	})
	searchLies(caniuse(() => AudioBuffer), {
		constructor: !0
	})
	searchLies(SVGTextContentElement, {
		constructor: !0
	})
	searchLies(CanvasRenderingContext2D, {
		constructor: !0
	})
	searchLies(caniuse(() => WebGLRenderingContext), {
		constructor: !0,
		makeXRCompatible: !0, // ignore
	})
	searchLies(caniuse(() => WebGL2RenderingContext), {
		constructor: !0,
		makeXRCompatible: !0, // ignore
	})
	searchLies(Math, {
		constructor: !0
	})
	searchLies(PluginArray, {
		constructor: !0
	})
	searchLies(Plugin, {
		constructor: !0
	})
	searchLies(Document, {
		constructor: !0
	})
	searchLies(String, {
		constructor: !0,
		trimRight: !0,
		trimLeft: !0
	})
	
	
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
			if (contentWindow && !isFirefox) { // firefox throws an error
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
			const canvasOffscreen2d = new OffscreenCanvas(500, 200)
			const context2d = canvasOffscreen2d.getContext('2d')
			const str = '!😃🙌🧠👩‍💻👟👧🏻👩🏻‍🦱👩🏻‍🦰👱🏻‍♀️👩🏻‍🦳👧🏼👧🏽👧🏾👧🏿🦄🐉🌊🍧🏄‍♀️🌠🔮♞'
			context2d.font = '14px Arial'
			context2d.fillText(str, 0, 50)
			context2d.fillStyle = 'rgba(100, 200, 99, 0.78)'
			context2d.fillRect(100, 30, 80, 50)
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
			const format = n => (''+n).length == 1 ? `0${n}` : n
			const dateString = `${month+1}/${format(date)}/${year}`
			const dateStringUTC = `${year}-${format(month+1)}-${format(date)}`
			const utc = Date.parse(
				new Date(dateString)
			)
			const now = +new Date(dateStringUTC)
			return +(((utc - now)/60000).toFixed(0))
		}
		const timezoneOffset = computeTimezoneOffset()
		const hardwareConcurrency = caniuse(() => navigator, ['hardwareConcurrency'])
		const language = caniuse(() => navigator, ['language'])
		const platform = caniuse(() => navigator, ['platform'])
		const userAgent = caniuse(() => navigator, ['userAgent'])

		postMessage({
			['timezone offset']: timezoneOffset,
			hardwareConcurrency,
			language,
			platform,
			userAgent,
			canvas2d,
			['webgl renderer']: webglRenderer,
			['webgl vendor']: webglVendor
		})
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
					const el = document.getElementById('creep-worker-scope')
					patch(el, html`
					<div>
						<strong>WorkerGlobalScope: Date/WorkerNavigator/OffscreenCanvas</strong>
						<div>hash: ${$hash}</div>
						${
							Object.keys(data).map(key => {
								const value = data[key]
								return (
									key != 'canvas2d' && key != 'userAgent'? `<div>${key}: ${value != undefined ? value : note.unsupported}</div>` : ''
								)
							}).join('')
						}
						<div>canvas 2d: ${!!data.canvas2d.dataURI ? data.canvas2d.$hash : note.unsupported}</div>
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
				if (!rtcPeerConnection) {
					return resolve(undefined)
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
						const el = document.getElementById('creep-webrtc')
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
				const el = document.getElementById('creep-cloudflare')
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
	// special thanks to https://arh.antoinevastel.com/reports/stats/menu.html for stats
	const getNavigator = (instanceId, workerScope) => {
		return new Promise(async resolve => {
			try {
				contentWindowNavigator = contentWindow ? contentWindow.navigator : navigator
				const navigatorPrototype = attempt(() => Navigator.prototype)
				const detectLies = (name, value) => {
					const workerScopeValue = caniuse(() => workerScope, [name])
					const workerScopeMatchLie = { fingerprint: '', lies: [{ ['does not match worker scope']: false }] }
					if (workerScopeValue) {
						if (name == 'userAgent') {
							const system = getOS(value)
							if (workerScope.system != system) {
								documentLie(name, system, workerScopeMatchLie)
								return value
							}
						}
						else if (name != 'userAgent' && workerScopeValue != value) {
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
					'chrome' in window ? navigator.userAgent.includes(navigator.appVersion) : true
				)

				const data = {
					appVersion: attempt(() => {
						const { appVersion } = contentWindowNavigator
						const navigatorAppVersion = navigator.appVersion
						detectLies('appVersion', appVersion)
						if (!credibleUserAgent) {
							sendToTrash('appVersion', `${navigatorAppVersion} does not match userAgent`)
						}
						if ('appVersion' in navigator && !navigatorAppVersion) {
							sendToTrash('appVersion', 'Living Standard property returned falsy value')
						}
						if (appVersion != navigatorAppVersion) {
							sendToTrash('appVersion', `[${navigatorAppVersion}] does not match iframe`)
						}
						return appVersion
					}),
					deviceMemory: attempt(() => {
						if (!('deviceMemory' in navigator)) {
							return undefined
						}
						const { deviceMemory } = contentWindowNavigator
						const navigatorDeviceMemory = navigator.deviceMemory
						const trusted = {
							'0': true,
							'1': true, 
							'2': true,
							'4': true, 
							'6': true, 
							'8': true
						}
						detectLies('deviceMemory', navigatorDeviceMemory)
						trustInteger('deviceMemory - invalid return type', navigatorDeviceMemory)
						if (!trusted[navigatorDeviceMemory]) {
							sendToTrash('deviceMemory', `${navigatorDeviceMemory} is not within set [0, 1, 2, 4, 6, 8]`)
						}
						if (deviceMemory != navigatorDeviceMemory) {
							sendToTrash('deviceMemory', `[${navigatorDeviceMemory}] does not match iframe`)
						}
						return deviceMemory
					}),
					doNotTrack: attempt(() => {
						const { doNotTrack } = contentWindowNavigator
						const navigatorDoNotTrack = navigator.doNotTrack
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
						detectLies('doNotTrack', navigatorDoNotTrack)
						if (!trusted[navigatorDoNotTrack]) {
							sendToTrash('doNotTrack - unusual result', navigatorDoNotTrack)
						}
						return doNotTrack
					}),
					hardwareConcurrency: attempt(() => {
						if (!('hardwareConcurrency' in navigator)) {
							return undefined
						}
						const { hardwareConcurrency } = contentWindowNavigator
						const navigatorHardwareConcurrency = navigator.hardwareConcurrency
						detectLies('hardwareConcurrency', navigatorHardwareConcurrency)
						trustInteger('hardwareConcurrency - invalid return type', navigatorHardwareConcurrency)
						if (navigatorHardwareConcurrency != -1 && navigatorHardwareConcurrency != 1 && navigatorHardwareConcurrency % 2 != 0) {
							sendToTrash('hardwareConcurrency', `${navigatorHardwareConcurrency} is not within set [-1, 1, even]`)
						}
						if (hardwareConcurrency != navigatorHardwareConcurrency) {
							sendToTrash('hardwareConcurrency', `[${navigatorHardwareConcurrency}] does not match iframe`)
						}
						return hardwareConcurrency
					}),
					language: attempt(() => {
						const { language, languages } = contentWindowNavigator
						const navigatorLanguage = navigator.language
						const navigatorLanguages = navigator.languages
						detectLies('language', navigatorLanguage)
						detectLies('languages', navigatorLanguages)
						if (language != navigatorLanguage) {
							sendToTrash('language', `[${navigatorLanguage}] does not match iframe`)
						}
						if (navigatorLanguage && navigatorLanguages) {
							const lang = /^.{0,2}/g.exec(navigatorLanguage)[0]
							const langs = /^.{0,2}/g.exec(navigatorLanguages[0])[0]
							if (langs != lang) {
								sendToTrash('language/languages', `${[navigatorLanguage, navigatorLanguages].join(' ')} mismatch`)
							}
							return `${languages.join(', ')} (${language})`
						}
						return `${language} ${languages}`
					}),
					maxTouchPoints: attempt(() => {
						if (!('maxTouchPoints' in navigator)) {
							return null
						}
						const { maxTouchPoints } = contentWindowNavigator
						const navigatorMaxTouchPoints = navigator.maxTouchPoints
						detectLies('maxTouchPoints', navigatorMaxTouchPoints)
						if (maxTouchPoints != navigatorMaxTouchPoints) {
							sendToTrash('maxTouchPoints', `[${navigatorMaxTouchPoints}] does not match iframe`)
						}
						return maxTouchPoints
					}),
					platform: attempt(() => {
						const { platform } = contentWindowNavigator
						const navigatorPlatform = navigator.platform
						const systems = ['win', 'linux', 'mac', 'arm', 'pike', 'linux', 'iphone', 'ipad', 'ipod', 'android', 'x11']
						const trusted = typeof navigatorPlatform == 'string' && systems.filter(val => navigatorPlatform.toLowerCase().includes(val))[0]
						detectLies('platform', navigatorPlatform)
						if (!trusted) {
							sendToTrash(`platform`, `${navigatorPlatform} is unusual`)
						}
						if (platform != navigatorPlatform) {
							sendToTrash('platform', `[${navigatorPlatform}] does not match iframe`)
						}
						return platform
					}),
					userAgent: attempt(() => {
						const { userAgent } = contentWindowNavigator
						const navigatorUserAgent = navigator.userAgent
						const gibbers = gibberish(navigatorUserAgent)
						detectLies('userAgent', navigatorUserAgent)
						if (!!gibbers.length) {
							sendToTrash(`userAgent contains gibberish`, `[${gibbers.join(', ')}] ${navigatorUserAgent}`)
						}
						if (!credibleUserAgent) {
							sendToTrash('userAgent', `${navigatorUserAgent} does not match appVersion`)
						}
						if (userAgent != navigatorUserAgent) {
							sendToTrash('userAgent', `[${navigatorUserAgent}] does not match iframe`)
						}
						return userAgent
					}),
					system: attempt(() => getOS(contentWindowNavigator.userAgent)),
					vendor: attempt(() => {
						const { vendor } = contentWindowNavigator
						const navigatorVendor = navigator.vendor
						detectLies('vendor', navigatorVendor)
						if (vendor != navigatorVendor) {
							sendToTrash('vendor', `[${navigatorVendor}] does not match iframe`)
						}
						return vendor
					}),
					mimeTypes: attempt(() => {
						const mimeTypes = detectLies('mimeTypes', contentWindowNavigator.mimeTypes)
						return mimeTypes ? [...mimeTypes].map(m => m.type) : []
					}),
					plugins: attempt(() => {
						const plugins = detectLies('plugins', contentWindowNavigator.plugins)
						const response = plugins ? [...contentWindowNavigator.plugins]
							.map(p => ({
								name: p.name,
								description: p.description,
								filename: p.filename,
								version: p.version
							})) : []
						
						if (!!response.length) {
							response.forEach(plugin => {
								const { name } = plugin
								const gibbers = gibberish(name)
								if (!!gibbers.length) {
									sendToTrash(`plugin contains gibberish`, `[${gibbers.join(', ')}] ${name}`)
								}
								return
							})
						}
						return response
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
				const id = 'creep-navigator'
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
				const moz = keys.filter(key => (/moz/i).test(key)).length
				const webkit = keys.filter(key => (/webkit/i).test(key)).length
				const apple = keys.filter(key => (/apple/i).test(key)).length
				const data = { keys, apple, moz, webkit } 
				const $hash = await hashify(data)
				resolve({ ...data, $hash })
				const id = 'creep-iframe-content-window-version'
				const el = document.getElementById(id)
				patch(el, html`
				<div>
					<strong>HTMLIFrameElement.contentWindow</strong>
					<div>hash: ${$hash}</div>
					<div>keys (${count(keys)}): ${keys && keys.length ? modal(id, keys.join(', ')) : note.blocked}</div>
					<div>moz: ${''+moz}</div>
					<div>webkit: ${''+webkit}</div>
					<div>apple: ${''+apple}</div>
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
				const elId = 'creep-html-element-version'
				const el = document.getElementById(elId)
				patch(el, html`
				<div>
					<strong>HTMLElement</strong>
					<div>hash: ${$hash}</div>
					<div>keys (${count(keys)}): ${keys && keys.length ? modal(elId, keys.join(', ')) : note.blocked}</div>
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
				const apple = keys.filter(key => (/apple/i).test(key)).length
				const prototypeName = (''+prototype).match(/\[object (.+)\]/)[1]
			
				const data = { keys: keys.sort(), moz, webkit, apple, prototypeName }
				const $hash = await hashify(data)
				return resolve({ ...data, $hash })
			}
			catch (error) {
				captureError(error)
				return resolve(undefined)
			}
		})
	}

	const getSystemStyles = instanceId => {
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
				]
				const fonts = [
					'caption',
					'icon',
					'menu',
					'message-box',
					'small-caption',
					'status-bar'
				]
				const id = 'creep-system-styles'
				const el = document.createElement('div')
				el.setAttribute('id', id)
				document.body.append(el)
				const rendered = document.getElementById(id)
				const system = {
					colors: [],
					fonts: []
				}
				system.colors = colors.map(color => {
					rendered.setAttribute('style', `background-color: ${color} !important`)
					return {
						[color]: getComputedStyle(rendered).backgroundColor
					}
				})
				fonts.forEach(font => {
					rendered.setAttribute('style', `font: ${font} !important`)
					system.fonts.push({
						[font]: getComputedStyle(rendered).font
					})
				})
				rendered.parentNode.removeChild(rendered)
				const $hash = await hashify(system)
				return resolve({...system, $hash})
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
					cssRuleListstyle,
					system
				] = await Promise.all([
					computeStyle('getComputedStyle'),
					computeStyle('HTMLElement.style'),
					computeStyle('CSSRuleList.style'),
					getSystemStyles(instanceId)
				]).catch(error => {
					console.error(error.message)
				})
				
				const data = {
					['getComputedStyle']: getComputedStyle,
					['HTMLElement.style']: htmlElementStyle,
					['CSSRuleList.style']: cssRuleListstyle,
					system,
					matching: (
						''+getComputedStyle.keys == ''+htmlElementStyle.keys &&
						''+htmlElementStyle.keys == ''+cssRuleListstyle.keys
					)
				}
				const $hash = await hashify(data)
				resolve({ ...data, $hash })
				const id = 'creep-css-style-declaration-version'
				const el = document.getElementById(id)
				patch(el, html`
				<div>
					<strong>CSSStyleDeclaration</strong>
					<div>hash: ${$hash}</div>
					<div>prototype: ${htmlElementStyle.prototypeName}</div>
					${
						Object.keys(data).map(key => {
							const value = data[key]
							return key != 'matching' && key != 'system' ? `<div>${key}: ${value ? value.$hash : note.blocked}</div>` : ''
						}).join('')
					}
					<div>keys: ${getComputedStyle.keys.length}, ${htmlElementStyle.keys.length}, ${cssRuleListstyle.keys.length}
					</div>
					<div>moz: ${''+getComputedStyle.moz}, ${''+htmlElementStyle.moz}, ${''+cssRuleListstyle.moz}
					</div>
					<div>webkit: ${''+getComputedStyle.webkit}, ${''+htmlElementStyle.webkit}, ${''+cssRuleListstyle.webkit}
					</div>
					<div>apple: ${''+getComputedStyle.apple}, ${''+htmlElementStyle.apple}, ${''+cssRuleListstyle.apple}
					</div>
					<div>matching: ${''+data.matching}</div>
					<div>system: ${system.$hash}</div>
					<div>system styles: ${
						system && system.colors ? modal(
							`${id}-system-styles`,
							[
								...system.colors.map(color => {
									const key = Object.keys(color)[0]
									const val = color[key]
									return `
										<div><span style="display:inline-block;border:1px solid #eee;border-radius:3px;width:12px;height:12px;background:${val}"></span> ${key}: ${val}</div>
									`
								}),
								...system.fonts.map(font => {
									const key = Object.keys(font)[0]
									const val = font[key]
									return `
										<div>${key}: <span style="border:1px solid #eee;background:#f9f9f9;padding:0 5px;border-radius:3px;font:${val}">${val}</span></div>
									`
								}),

							].join('')
						) : note.blocked
					}</div>
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
			try {
				let lied = (
					lieProps['Screen.width'] ||
					lieProps['Screen.height'] ||
					lieProps['Screen.availWidth'] ||
					lieProps['Screen.availHeight'] ||
					lieProps['Screen.colorDepth'] ||
					lieProps['Screen.pixelDepth']
				)
				const contentWindowScreen = contentWindow && !isFirefox ? contentWindow.screen : screen
				const { width, height, availWidth, availHeight, colorDepth, pixelDepth } = contentWindowScreen
				const {
					width: screenWidth,
					height: screenHeight,
					availWidth: screenAvailWidth,
					availHeight: screenAvailHeight,
					colorDepth: screenColorDepth,
					pixelDepth: screenPixelDepth
				} = screen

				const matching = (
					width == screenWidth &&
					height == screenHeight &&
					availWidth == screenAvailWidth &&
					availHeight == screenAvailHeight &&
					colorDepth == screenColorDepth &&
					pixelDepth == screenPixelDepth
				)

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
					}] does not match iframe`)
				}

				if (screenAvailWidth > screenWidth) {
					sendToTrash('screen', `availWidth (${screenAvailWidth}) is greater than width (${screenWidth})`)
				}

				if (screenAvailHeight > screenHeight) {
					sendToTrash('screen', `availHeight (${screenAvailHeight}) is greater than height (${screenHeight})`)
				}
				
				const trusted = {0:!0, 1:!0, 4:!0, 8:!0, 15:!0, 16:!0, 24:!0, 32:!0, 48:!0}
				if (!trusted[screenColorDepth]) {
					sendToTrash('screen', `colorDepth (${screenColorDepth}) is not within set [0, 16, 24, 32]`)
				}
				
				if (!trusted[screenPixelDepth]) {
					sendToTrash('screen', `pixelDepth (${screenPixelDepth}) is not within set [0, 16, 24, 32]`)
				}

				if (screenPixelDepth != screenColorDepth) {
					sendToTrash('screen', `pixelDepth (${screenPixelDepth}) and colorDepth (${screenColorDepth}) do not match`)
				}

				const data = {
					device: getDevice(width, height),
					width: attempt(() => width ? trustInteger('width - invalid return type', width) : undefined),
					outerWidth: attempt(() => outerWidth ? trustInteger('outerWidth - invalid return type', outerWidth) : undefined),
					availWidth: attempt(() => availWidth ? trustInteger('availWidth - invalid return type', availWidth) : undefined),
					height: attempt(() => height ? trustInteger('height - invalid return type', height) : undefined),
					outerHeight: attempt(() => outerHeight ? trustInteger('outerHeight - invalid return type', outerHeight) : undefined),
					availHeight: attempt(() => availHeight ?  trustInteger('availHeight - invalid return type', availHeight) : undefined),
					colorDepth: attempt(() => colorDepth ? trustInteger('colorDepth - invalid return type', colorDepth) : undefined),
					pixelDepth: attempt(() => pixelDepth ? trustInteger('pixelDepth - invalid return type', pixelDepth) : undefined)
				}
				const $hash = await hashify(data)
				resolve({ ...data, $hash })
				const el = document.getElementById('creep-screen')
				patch(el, html`
				<div>
					<strong>Screen</strong>
					<div>hash: ${lied ? `${note.lied} ` : ''}${$hash}</div>
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
					const check = {}
					check.microsoft = voices.filter(key => (/microsoft/i).test(key.name)).length
					check.google = voices.filter(key => (/google/i).test(key.name)).length
					check.chromeOS = voices.filter(key => (/chrome os/i).test(key.name)).length
					check.android = voices.filter(key => (/android/i).test(key.name)).length
					const $hash = await hashify(voices)
					resolve({ voices, ...check, $hash })
					const id = 'creep-voices'
					const el = document.getElementById(id)
					const voiceList = voices.map(voice => `${voice.name} (${voice.lang})`)
					patch(el, html`
					<div>
						<strong>SpeechSynthesis</strong>
						<div>hash: ${$hash}</div>
						<div>voices (${count(voices)}): ${voiceList && voiceList.length ? modal(id, voiceList.join('<br>')) : note.unsupported}</div>
						<div>microsoft: ${''+check.microsoft}</div>
						<div>google: ${''+check.google}</div>
						<div>chrome OS: ${''+check.chromeOS}</div>
						<div>android: ${''+check.android}</div>
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
				const contentWindowNavigator = contentWindow && !isFirefox ? contentWindow.navigator : navigator
				if (!('mediaDevices' in contentWindowNavigator)) {
					return resolve(undefined)
				}
				if (!contentWindowNavigator.mediaDevices || !contentWindowNavigator.mediaDevices.enumerateDevices) {
					return resolve(undefined)
				}
				const mediaDevicesEnumerated = await contentWindowNavigator.mediaDevices.enumerateDevices()
				const mediaDevices = (
					mediaDevicesEnumerated ? mediaDevicesEnumerated
						.map(({ kind }) => ({ kind })).sort((a, b) => (a.kind > b.kind) ? 1 : -1) :
					undefined
				)
				const $hash = await hashify(mediaDevices)
				resolve({ mediaDevices, $hash })
				const el = document.getElementById('creep-media-devices')
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

	// canvas2d
	const dataLie = lieProps['HTMLCanvasElement.toDataURL']
	const contextLie = lieProps['HTMLCanvasElement.getContext']
	
	// 2d canvas
	const getCanvas2d = instanceId => {
		return new Promise(async resolve => {
			try {
				let lied = dataLie || contextLie
				const patchDom = (lied, response) => {
					const { $hash } = response
					const el = document.getElementById('creep-canvas-2d')
					return patch(el, html`
					<div>
						<strong>CanvasRenderingContext2D</strong>
						<div>hash: ${lied ? `${note.lied} ` : ''}${$hash}</div>
					</div>
					`)
				}
				const canvas = document.createElement('canvas')
				let canvas2dDataURI = ''
				const context = canvas.getContext('2d')
				const str = '!😃🙌🧠👩‍💻👟👧🏻👩🏻‍🦱👩🏻‍🦰👱🏻‍♀️👩🏻‍🦳👧🏼👧🏽👧🏾👧🏿🦄🐉🌊🍧🏄‍♀️🌠🔮♞'
				context.font = '14px Arial'
				context.fillText(str, 0, 50)
				context.fillStyle = 'rgba(100, 200, 99, 0.78)'
				context.fillRect(100, 30, 80, 50)
				canvas2dDataURI = canvas.toDataURL()
				const dataURI = canvas2dDataURI
				const $hash = await hashify(dataURI)
				const response = { dataURI, lied, $hash }
				resolve(response)
				patchDom(lied, response)
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
				let lied = dataLie || contextLie
				const patchDom = (lied, response) => {
					const { $hash } = response
					const el = document.getElementById('creep-canvas-bitmap-renderer')
					return patch(el, html`
					<div>
						<strong>ImageBitmapRenderingContext</strong>
						<div>hash: ${lied ? `${note.lied} ` : ''}${$hash}</div>
					</div>
					`)
				}
				const canvas = document.createElement('canvas')
				let canvasBMRDataURI = ''
				const context = canvas.getContext('bitmaprenderer')
				const image = new Image()
				image.src = 'bitmap.png'
				return resolve(new Promise(resolve => {
					image.onload = async () => {
						if (!caniuse(() => createImageBitmap)) {
							return resolve(undefined)
						}
						const bitmap = await createImageBitmap(image, 0, 0, image.width, image.height)
						context.transferFromImageBitmap(bitmap)
						canvasBMRDataURI = canvas.toDataURL()
						const dataURI = canvasBMRDataURI
						const $hash = await hashify(dataURI)
						const response = { dataURI, lied, $hash }
						resolve(response)
						patchDom(lied, response)
					}
				}))	
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
				// detect lies
				let lied = (
					dataLie ||
					contextLie ||
					lieProps['WebGLRenderingContext.getParameter'] ||
					lieProps['WebGL2RenderingContext.getParameter'] ||
					lieProps['WebGLRenderingContext.getExtension'] ||
					lieProps['WebGL2RenderingContext.getExtension'] ||
					lieProps['WebGLRenderingContext.getSupportedExtensions'] ||
					lieProps['WebGL2RenderingContext.getSupportedExtensions']
				)

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
				const getSupportedExtensions = context => {
					return new Promise(async resolve => {
						try {
							if (!context) {
								return resolve({ extensions: [] })
							}
							const extensions = caniuse(() => context, ['getSupportedExtensions'], [], true) || []
							return resolve({
								extensions
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

				const getSpecs = (webgl, webgl2) => {
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
							return response
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
							return response
						}
						const data = { webglSpecs: getWebglSpecs(webgl), webgl2Specs: getWebgl2Specs(webgl2) }
						return resolve(data)
					})
				}

				const getUnmasked = (context, [rendererTitle, vendorTitle]) => {
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
								const gibbers = gibberish(value)
								if (!!gibbers.length) {
									sendToTrash(`${title} contains gibberish`, `[${gibbers.join(', ')}] ${value}`)
								}
								return (
									!proxyBehavior(value) ? value : 
									sendToTrash(title, 'proxy behavior detected')
								)
							}
							return resolve ({
								vendor: validate(vendor, vendorTitle),
								renderer: validate(renderer, rendererTitle)
							})
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
				const getDataURL = (canvas, context) => {
					return new Promise(async resolve => {
						try {
							const colorBufferBit = caniuse(() => context, ['COLOR_BUFFER_BIT'])
							caniuse(() => context, ['clearColor'], [0.2, 0.4, 0.6, 0.8], true)
							caniuse(() => context, ['clear'], [colorBufferBit], true)
							const canvasWebglDataURI = canvas.toDataURL()
							const dataURI = canvasWebglDataURI
							const $hash = await hashify(dataURI)
							return resolve({ dataURI, $hash })
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
					getSupportedExtensions(context),
					getSupportedExtensions(context2),
					getUnmasked(context, ['webgl renderer', 'webgl vendor']),
					getUnmasked(context2, ['webgl2 renderer', 'webgl2 vendor']),
					getDataURL(canvas, context),
					getDataURL(canvas2, context2),
					getSpecs(context, context2)
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
					specs,
					lied
				}
				data.matchingUnmasked = JSON.stringify(data.unmasked) === JSON.stringify(data.unmasked2)
				data.matchingDataURI = data.dataURI.$hash === data.dataURI2.$hash

				const $hash = await hashify(data)
				resolve({ ...data, $hash })
				const id = 'creep-canvas-webgl'
				const el = document.getElementById(id)
				const { webglSpecs, webgl2Specs } = specs
				const webglSpecsKeys = webglSpecs ? Object.keys(webglSpecs) : []
				const webgl2SpecsKeys = webgl2Specs ? Object.keys(webgl2Specs) : []
				
				const detectParameterLie = (obj, keys, version, id) => {
					if (!obj || !keys.length) {
						return `<div>${version} parameters (0): ${note.blocked}</div>`
					}
					id = `${id}-p-${version}`
					return `
					<div>${version} parameters (${lied ? '0' : count(keys)}): ${
						lied ? note.lied :
						modal(id, keys.map(key => `${key}: ${obj[key]}`).join('<br>'))
					}</div>
					`
				}
				
				patch(el, html`
				<div>
					<strong>WebGLRenderingContext/WebGL2RenderingContext</strong>
					<div>hash: ${lied ? `${note.lied} ` : ''}${$hash}</div>
					<div>v1 toDataURL: ${dataURI.$hash}</div>
					<div>v1 parameters (${count(webglSpecsKeys)}): ${
						!webglSpecsKeys.length ? note.unsupported :
						modal(`${id}-p-v1`, webglSpecsKeys.map(key => `${key}: ${webglSpecs[key]}`).join('<br>'))
					}</div>
					<div>v1 extensions (${count(supported.extensions)}): ${
						!caniuse(() => supported, ['extensions', 'length']) ? note.unsupported : modal(`${id}-e-v1`, supported.extensions.join('<br>'))
					}</div>
					<div>v1 renderer: ${ 
						!unmasked.renderer ? note.unsupported :
						unmasked.renderer
					}</div>
					<div>v1 vendor: ${ 
						!unmasked.vendor ? note.unsupported :
						unmasked.vendor
					}</div>
					<div>v2 toDataURL: ${dataURI2.$hash}</div>
					<div>v2 parameters (${count(webgl2SpecsKeys)}): ${
						!webgl2SpecsKeys.length ? note.unsupported :
						modal(`${id}-p-v2`, webgl2SpecsKeys.map(key => `${key}: ${webgl2Specs[key]}`).join('<br>'))
					}</div>
					<div>v2 extensions (${count(supported2.extensions)}): ${
						!caniuse(() => supported2, ['extensions', 'length']) ? note.unsupported : modal(`${id}-e-v2`, supported2.extensions.join('<br>'))
					}</div>
					<div>v2 renderer: ${
						!unmasked2.renderer ? note.unsupported :
						unmasked2.renderer
					}</div>
					<div>v2 vendor: ${
						!unmasked2.vendor ? note.unsupported :
						unmasked2.vendor
					}</div>
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
				]
				let lied
				check.forEach(prop => {
					lied = lieProps[`Math.${prop}`]
					const test = (
						prop == 'cos' ? [1e308] :
						prop == 'acos' || prop == 'asin' || prop == 'atanh' ? [0.5] :
						prop == 'pow' || prop == 'atan2' ? [Math.PI, 2] : 
						[Math.PI]
					)
					const res1 = Math[prop](...test)
					const res2 = Math[prop](...test)
					const matching = isNaN(res1) && isNaN(res2) ? true : res1 == res2
					if (!matching) {
						lied = true
						const mathLie = { fingerprint: '', lies: [{ [`failed math equality test`]: true }] }
						documentLie(`Math.${prop}`, hashMini({res1, res2}), mathLie)
					}
					return
				})

				const n = 0.123
				const bigN = 5.860847362277284e+38
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
				]
				const contentWindowMath = contentWindow ? contentWindow.Math : Math
				const data = {}
				fns.forEach(fn => {
					data[fn[2]] = attempt(() => {
						const result = fn[0] != 'polyfill' ? contentWindowMath[fn[0]](...fn[1]) : fn[1]
						const chrome = result == fn[3]
						const firefox = fn[4] ? result == fn[4] : false
						const torBrowser = fn[5] ? result == fn[5] : false
						const safari = fn[6] ? result == fn[6] : false
						return { result, chrome, firefox, torBrowser, safari }
					})
				})
				
				const $hash = await hashify(data)
				resolve({...data, lied, $hash })
				const id = 'creep-maths'
				const el = document.getElementById(id)
				const header = `<div>Match to Win10 64bit Chromium > Firefox > Tor Browser > Mac10 Safari<br>[CR][FF][TB][SF]</div>`
				const results = Object.keys(data).map(key => {
					const value = data[key]
					const { result, chrome, firefox, torBrowser, safari } = value
					return `${chrome ? '[CR]' : '[--]'}${firefox ? '[FF]' : '[--]'}${torBrowser ? '[TB]' : '[--]'}${safari ? '[SF]' : '[--]'} ${key} => ${result}`
				})
				patch(el, html`
				<div>
					<strong>Math</strong>
					<div>hash: ${lied ? `${note.lied} ` : ''}${$hash}</div>
					<div>results: ${
						modal(id, header+results.join('<br>'))
					}
					<div>implementation: ${known($hash)}</div>
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
					() => new Function('alert(")')(),
					() => new Function('const foo;foo.bar')(),
					() => new Function('null.bar')(),
					() => new Function('abc.xyz = 123')(),
					() => new Function('const foo;foo.bar')(),
					() => new Function('(1).toString(1000)')(),
					() => new Function('[...undefined].length')(),
					() => new Function('var x = new Array(-1)')(),
					() => new Function('const a=1; const a=2;')()
				]
				const errors = getErrors(errorTests)
				const $hash = await hashify(errors)
				resolve({errors, $hash })
				const id = 'creep-console-errors'
				const el = document.getElementById(id)
				const results = Object.keys(errors).map(key => {
					const value = errors[key]
					return `${+key+1}: ${value}`
				})
				patch(el, html`
				<div>
					<strong>Error</strong>
					<div>hash: ${$hash}</div>
					<div>results: ${modal(id, results.join('<br>'))}
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
				const contentWindowDate = contentWindow ? contentWindow.Date : Date
				const contentWindowIntl = contentWindow ? contentWindow.Intl : Date
				const computeTimezoneOffset = () => {
					const date = new contentWindowDate().getDate()
					const month = new contentWindowDate().getMonth()
					const year = contentWindowDate().split` `[3] // current year
					const format = n => (''+n).length == 1 ? `0${n}` : n
					const dateString = `${month+1}/${format(date)}/${year}`
					const dateStringUTC = `${year}-${format(month+1)}-${format(date)}`
					const utc = contentWindowDate.parse(
						new contentWindowDate(dateString)
					)
					const now = +new contentWindowDate(dateStringUTC)
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
					]
					if (caniuse(() => navigator.keyboard.getLayoutMap)) {
						const keyoardLayoutMap = await navigator.keyboard.getLayoutMap()
						const writingSystemKeys= keys.map(key => {
							const value = keyoardLayoutMap.get(key)
							return { [key]: value }
						})
						return writingSystemKeys
					}
					return undefined
				}
				const writingSystemKeys = await getWritingSystemKeys()		
				const dateGetTimezoneOffset = attempt(() => Date.prototype.getTimezoneOffset)
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
				const seasonLie = timezoneOffsetMeasured.lie ? { fingerprint: '', lies: [{ ['timezone seasons disagree']: true }] } : false
				const localeLie = locale.lie ? { fingerprint: '', lies: [{ ['Intl locales mismatch']: true }] } : false
				const offsetLie = !matchingOffsets ? { fingerprint: '', lies: [{ ['timezone offsets mismatch']: true }] } : false
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
					writingSystemKeys,
					lied: localeLie || timezoneLie || seasonLie || !matchingOffsets
				}
				
				const $hash = await hashify(data)
				resolve({...data, $hash })
				const id = 'creep-timezone'
				const el = document.getElementById(id)
				patch(el, html`
				<div>
					<strong>Date/Intl/Keyboard</strong>
					<div>hash: ${$hash}</div>
					<div>timezone: ${timezone}</div>
					<div>timezone location: ${timezoneLocation}</div>
					<div>timezone offset: ${!timezoneLie && matchingOffsets ? ''+timezoneOffset : note.lied}</div>
					<div>timezone offset computed: ${''+timezoneOffsetComputed}</div>
					<div>matching offsets: ${''+matchingOffsets}</div>
					<div>timezone measured: ${!seasonLie ? measuredTimezones : note.lied}</div>
					<div>relativeTimeFormat: ${
						!relativeTime ? note.unsupported : 
						modal(`${id}-relative-time-format`, Object.keys(relativeTime).sort().map(key => `${key} => ${relativeTime[key]}`).join('<br>'))
					}</div>
					<div>locale language: ${!localeLie ? locale.lang.join(', ') : note.lied}</div>
					<div>writing system keys: ${
						!writingSystemKeys ? note.unsupported :
						modal(`${id}-writing-system-keys`, writingSystemKeys.map(systemKey => {
							const key = Object.keys(systemKey)[0]
							const value = systemKey[key]
							const style = `
								background: #f6f6f6;
								border-radius: 2px;
								padding: 0px 5px;
							`
							return `${key}: <span style="${style}">${value}</span>`
						}).join('<br>'))
					}</div>
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
	// inspired by
	// https://privacycheck.sec.lrz.de/active/fp_gcr/fp_getclientrects.html
	// https://privacycheck.sec.lrz.de/active/fp_e/fp_emoji.html
	const emojis = [[128512],[128515],[128516],[128513],[128518],[128517],[129315],[128514],[128578],[128579],[128521],[128522],[128519],[129392],[128525],[129321],[128536],[128535],[9786],[128538],[128537],[129394],[128523],[128539],[128540],[129322],[128541],[129297],[129303],[129325],[129323],[129300],[129296],[129320],[128528],[128529],[128566],[128527],[128530],[128580],[128556],[129317],[128524],[128532],[128554],[129316],[128564],[128567],[129298],[129301],[129314],[129326],[129319],[129397],[129398],[129396],[128565],[129327],[129312],[129395],[129400],[128526],[129299],[129488],[128533],[128543],[128577],[9785],[128558],[128559],[128562],[128563],[129402],[128550],[128551],[128552],[128560],[128549],[128546],[128557],[128561],[128534],[128547],[128542],[128531],[128553],[128555],[129393],[128548],[128545],[128544],[129324],[128520],[128127],[128128],[9760],[128169],[129313],[128121],[128122],[128123],[128125],[128126],[129302],[128570],[128568],[128569],[128571],[128572],[128573],[128576],[128575],[128574],[128584],[128585],[128586],[128139],[128140],[128152],[128157],[128150],[128151],[128147],[128158],[128149],[128159],[10083],[128148],[10084],[129505],[128155],[128154],[128153],[128156],[129294],[128420],[129293],[128175],[128162],[128165],[128171],[128166],[128168],[128371],[128163],[128172],[128065,65039,8205,128488,65039],[128488],[128495],[128173],[128164],[128075],[129306],[128400],[9995],[128406],[128076],[129292],[129295],[9996],[129310],[129311],[129304],[129305],[128072],[128073],[128070],[128405],[128071],[9757],[128077],[128078],[9994],[128074],[129307],[129308],[128079],[128588],[128080],[129330],[129309],[128591],[9997],[128133],[129331],[128170],[129470],[129471],[129461],[129462],[128066],[129467],[128067],[129504],[129728],[129729],[129463],[129460],[128064],[128065],[128069],[128068],[128118],[129490],[128102],[128103],[129489],[128113],[128104],[129492],[128104,8205,129456],[128104,8205,129457],[128104,8205,129459],[128104,8205,129458],[128105],[128105,8205,129456],[129489,8205,129456],[128105,8205,129457],[129489,8205,129457],[128105,8205,129459],[129489,8205,129459],[128105,8205,129458],[129489,8205,129458],[128113,8205,9792,65039],[128113,8205,9794,65039],[129491],[128116],[128117],[128589],[128589,8205,9794,65039],[128589,8205,9792,65039],[128590],[128590,8205,9794,65039],[128590,8205,9792,65039],[128581],[128581,8205,9794,65039],[128581,8205,9792,65039],[128582],[128582,8205,9794,65039],[128582,8205,9792,65039],[128129],[128129,8205,9794,65039],[128129,8205,9792,65039],[128587],[128587,8205,9794,65039],[128587,8205,9792,65039],[129487],[129487,8205,9794,65039],[129487,8205,9792,65039],[128583],[128583,8205,9794,65039],[128583,8205,9792,65039],[129318],[129318,8205,9794,65039],[129318,8205,9792,65039],[129335],[129335,8205,9794,65039],[129335,8205,9792,65039],[129489,8205,9877,65039],[128104,8205,9877,65039],[128105,8205,9877,65039],[129489,8205,127891],[128104,8205,127891],[128105,8205,127891],[129489,8205,127979],[128104,8205,127979],[128105,8205,127979],[129489,8205,9878,65039],[128104,8205,9878,65039],[128105,8205,9878,65039],[129489,8205,127806],[128104,8205,127806],[128105,8205,127806],[129489,8205,127859],[128104,8205,127859],[128105,8205,127859],[129489,8205,128295],[128104,8205,128295],[128105,8205,128295],[129489,8205,127981],[128104,8205,127981],[128105,8205,127981],[129489,8205,128188],[128104,8205,128188],[128105,8205,128188],[129489,8205,128300],[128104,8205,128300],[128105,8205,128300],[129489,8205,128187],[128104,8205,128187],[128105,8205,128187],[129489,8205,127908],[128104,8205,127908],[128105,8205,127908],[129489,8205,127912],[128104,8205,127912],[128105,8205,127912],[129489,8205,9992,65039],[128104,8205,9992,65039],[128105,8205,9992,65039],[129489,8205,128640],[128104,8205,128640],[128105,8205,128640],[129489,8205,128658],[128104,8205,128658],[128105,8205,128658],[128110],[128110,8205,9794,65039],[128110,8205,9792,65039],[128373],[128373,65039,8205,9794,65039],[128373,65039,8205,9792,65039],[128130],[128130,8205,9794,65039],[128130,8205,9792,65039],[129399],[128119],[128119,8205,9794,65039],[128119,8205,9792,65039],[129332],[128120],[128115],[128115,8205,9794,65039],[128115,8205,9792,65039],[128114],[129493],[129333],[129333,8205,9794,65039],[129333,8205,9792,65039],[128112],[128112,8205,9794,65039],[128112,8205,9792,65039],[129328],[129329],[128105,8205,127868],[128104,8205,127868],[129489,8205,127868],[128124],[127877],[129334],[129489,8205,127876],[129464],[129464,8205,9794,65039],[129464,8205,9792,65039],[129465],[129465,8205,9794,65039],[129465,8205,9792,65039],[129497],[129497,8205,9794,65039],[129497,8205,9792,65039],[129498],[129498,8205,9794,65039],[129498,8205,9792,65039],[129499],[129499,8205,9794,65039],[129499,8205,9792,65039],[129500],[129500,8205,9794,65039],[129500,8205,9792,65039],[129501],[129501,8205,9794,65039],[129501,8205,9792,65039],[129502],[129502,8205,9794,65039],[129502,8205,9792,65039],[129503],[129503,8205,9794,65039],[129503,8205,9792,65039],[128134],[128134,8205,9794,65039],[128134,8205,9792,65039],[128135],[128135,8205,9794,65039],[128135,8205,9792,65039],[128694],[128694,8205,9794,65039],[128694,8205,9792,65039],[129485],[129485,8205,9794,65039],[129485,8205,9792,65039],[129486],[129486,8205,9794,65039],[129486,8205,9792,65039],[129489,8205,129455],[128104,8205,129455],[128105,8205,129455],[129489,8205,129468],[128104,8205,129468],[128105,8205,129468],[129489,8205,129469],[128104,8205,129469],[128105,8205,129469],[127939],[127939,8205,9794,65039],[127939,8205,9792,65039],[128131],[128378],[128372],[128111],[128111,8205,9794,65039],[128111,8205,9792,65039],[129494],[129494,8205,9794,65039],[129494,8205,9792,65039],[129495],[129495,8205,9794,65039],[129495,8205,9792,65039],[129338],[127943],[9975],[127938],[127948],[127948,65039,8205,9794,65039],[127948,65039,8205,9792,65039],[127940],[127940,8205,9794,65039],[127940,8205,9792,65039],[128675],[128675,8205,9794,65039],[128675,8205,9792,65039],[127946],[127946,8205,9794,65039],[127946,8205,9792,65039],[9977],[9977,65039,8205,9794,65039],[9977,65039,8205,9792,65039],[127947],[127947,65039,8205,9794,65039],[127947,65039,8205,9792,65039],[128692],[128692,8205,9794,65039],[128692,8205,9792,65039],[128693],[128693,8205,9794,65039],[128693,8205,9792,65039],[129336],[129336,8205,9794,65039],[129336,8205,9792,65039],[129340],[129340,8205,9794,65039],[129340,8205,9792,65039],[129341],[129341,8205,9794,65039],[129341,8205,9792,65039],[129342],[129342,8205,9794,65039],[129342,8205,9792,65039],[129337],[129337,8205,9794,65039],[129337,8205,9792,65039],[129496],[129496,8205,9794,65039],[129496,8205,9792,65039],[128704],[128716],[129489,8205,129309,8205,129489],[128109],[128107],[128108],[128143],[128105,8205,10084,65039,8205,128139,8205,128104],[128104,8205,10084,65039,8205,128139,8205,128104],[128105,8205,10084,65039,8205,128139,8205,128105],[128145],[128105,8205,10084,65039,8205,128104],[128104,8205,10084,65039,8205,128104],[128105,8205,10084,65039,8205,128105],[128106],[128104,8205,128105,8205,128102],[128104,8205,128105,8205,128103],[128104,8205,128105,8205,128103,8205,128102],[128104,8205,128105,8205,128102,8205,128102],[128104,8205,128105,8205,128103,8205,128103],[128104,8205,128104,8205,128102],[128104,8205,128104,8205,128103],[128104,8205,128104,8205,128103,8205,128102],[128104,8205,128104,8205,128102,8205,128102],[128104,8205,128104,8205,128103,8205,128103],[128105,8205,128105,8205,128102],[128105,8205,128105,8205,128103],[128105,8205,128105,8205,128103,8205,128102],[128105,8205,128105,8205,128102,8205,128102],[128105,8205,128105,8205,128103,8205,128103],[128104,8205,128102],[128104,8205,128102,8205,128102],[128104,8205,128103],[128104,8205,128103,8205,128102],[128104,8205,128103,8205,128103],[128105,8205,128102],[128105,8205,128102,8205,128102],[128105,8205,128103],[128105,8205,128103,8205,128102],[128105,8205,128103,8205,128103],[128483],[128100],[128101],[129730],[128099],[129456],[129457],[129459],[129458],[128053],[128018],[129421],[129447],[128054],[128021],[129454],[128021,8205,129466],[128041],[128058],[129418],[129437],[128049],[128008],[128008,8205,11035],[129409],[128047],[128005],[128006],[128052],[128014],[129412],[129427],[129420],[129452],[128046],[128002],[128003],[128004],[128055],[128022],[128023],[128061],[128015],[128017],[128016],[128042],[128043],[129433],[129426],[128024],[129443],[129423],[129435],[128045],[128001],[128e3],[128057],[128048],[128007],[128063],[129451],[129428],[129415],[128059],[128059,8205,10052,65039],[128040],[128060],[129445],[129446],[129448],[129432],[129441],[128062],[129411],[128020],[128019],[128035],[128036],[128037],[128038],[128039],[128330],[129413],[129414],[129442],[129417],[129444],[129718],[129449],[129434],[129436],[128056],[128010],[128034],[129422],[128013],[128050],[128009],[129429],[129430],[128051],[128011],[128044],[129453],[128031],[128032],[128033],[129416],[128025],[128026],[128012],[129419],[128027],[128028],[128029],[129714],[128030],[129431],[129715],[128375],[128376],[129410],[129439],[129712],[129713],[129440],[128144],[127800],[128174],[127989],[127801],[129344],[127802],[127803],[127804],[127799],[127793],[129716],[127794],[127795],[127796],[127797],[127806],[127807],[9752],[127808],[127809],[127810],[127811],[127815],[127816],[127817],[127818],[127819],[127820],[127821],[129389],[127822],[127823],[127824],[127825],[127826],[127827],[129744],[129373],[127813],[129746],[129381],[129361],[127814],[129364],[129365],[127805],[127798],[129745],[129362],[129388],[129382],[129476],[129477],[127812],[129372],[127792],[127838],[129360],[129366],[129747],[129384],[129391],[129374],[129479],[129472],[127830],[127831],[129385],[129363],[127828],[127839],[127829],[127789],[129386],[127790],[127791],[129748],[129369],[129478],[129370],[127859],[129368],[127858],[129749],[129379],[129367],[127871],[129480],[129474],[129387],[127857],[127832],[127833],[127834],[127835],[127836],[127837],[127840],[127842],[127843],[127844],[127845],[129390],[127841],[129375],[129376],[129377],[129408],[129438],[129424],[129425],[129450],[127846],[127847],[127848],[127849],[127850],[127874],[127856],[129473],[129383],[127851],[127852],[127853],[127854],[127855],[127868],[129371],[9749],[129750],[127861],[127862],[127870],[127863],[127864],[127865],[127866],[127867],[129346],[129347],[129380],[129483],[129475],[129481],[129482],[129378],[127869],[127860],[129348],[128298],[127994],[127757],[127758],[127759],[127760],[128506],[128510],[129517],[127956],[9968],[127755],[128507],[127957],[127958],[127964],[127965],[127966],[127967],[127963],[127959],[129521],[129704],[129717],[128726],[127960],[127962],[127968],[127969],[127970],[127971],[127972],[127973],[127974],[127976],[127977],[127978],[127979],[127980],[127981],[127983],[127984],[128146],[128508],[128509],[9962],[128332],[128725],[128333],[9961],[128331],[9970],[9978],[127745],[127747],[127961],[127748],[127749],[127750],[127751],[127753],[9832],[127904],[127905],[127906],[128136],[127914],[128642],[128643],[128644],[128645],[128646],[128647],[128648],[128649],[128650],[128669],[128670],[128651],[128652],[128653],[128654],[128656],[128657],[128658],[128659],[128660],[128661],[128662],[128663],[128664],[128665],[128763],[128666],[128667],[128668],[127950],[127949],[128757],[129469],[129468],[128762],[128690],[128756],[128761],[128764],[128655],[128739],[128740],[128738],[9981],[128680],[128677],[128678],[128721],[128679],[9875],[9973],[128758],[128676],[128755],[9972],[128741],[128674],[9992],[128745],[128747],[128748],[129666],[128186],[128641],[128671],[128672],[128673],[128752],[128640],[128760],[128718],[129523],[8987],[9203],[8986],[9200],[9201],[9202],[128368],[128347],[128359],[128336],[128348],[128337],[128349],[128338],[128350],[128339],[128351],[128340],[128352],[128341],[128353],[128342],[128354],[128343],[128355],[128344],[128356],[128345],[128357],[128346],[128358],[127761],[127762],[127763],[127764],[127765],[127766],[127767],[127768],[127769],[127770],[127771],[127772],[127777],[9728],[127773],[127774],[129680],[11088],[127775],[127776],[127756],[9729],[9925],[9928],[127780],[127781],[127782],[127783],[127784],[127785],[127786],[127787],[127788],[127744],[127752],[127746],[9730],[9748],[9969],[9889],[10052],[9731],[9924],[9732],[128293],[128167],[127754],[127875],[127876],[127878],[127879],[129512],[10024],[127880],[127881],[127882],[127883],[127885],[127886],[127887],[127888],[127889],[129511],[127872],[127873],[127895],[127903],[127915],[127894],[127942],[127941],[129351],[129352],[129353],[9917],[9918],[129358],[127936],[127952],[127944],[127945],[127934],[129359],[127923],[127951],[127953],[127954],[129357],[127955],[127992],[129354],[129355],[129349],[9971],[9976],[127907],[129343],[127933],[127935],[128759],[129356],[127919],[129664],[129665],[127921],[128302],[129668],[129535],[127918],[128377],[127920],[127922],[129513],[129528],[129669],[129670],[9824],[9829],[9830],[9827],[9823],[127183],[126980],[127924],[127917],[128444],[127912],[129525],[129697],[129526],[129698],[128083],[128374],[129405],[129404],[129466],[128084],[128085],[128086],[129507],[129508],[129509],[129510],[128087],[128088],[129403],[129649],[129650],[129651],[128089],[128090],[128091],[128092],[128093],[128717],[127890],[129652],[128094],[128095],[129406],[129407],[128096],[128097],[129648],[128098],[128081],[128082],[127913],[127891],[129506],[129686],[9937],[128255],[128132],[128141],[128142],[128263],[128264],[128265],[128266],[128226],[128227],[128239],[128276],[128277],[127932],[127925],[127926],[127897],[127898],[127899],[127908],[127911],[128251],[127927],[129687],[127928],[127929],[127930],[127931],[129685],[129345],[129688],[128241],[128242],[9742],[128222],[128223],[128224],[128267],[128268],[128187],[128421],[128424],[9e3],[128433],[128434],[128189],[128190],[128191],[128192],[129518],[127909],[127902],[128253],[127916],[128250],[128247],[128248],[128249],[128252],[128269],[128270],[128367],[128161],[128294],[127982],[129684],[128212],[128213],[128214],[128215],[128216],[128217],[128218],[128211],[128210],[128195],[128220],[128196],[128240],[128478],[128209],[128278],[127991],[128176],[129689],[128180],[128181],[128182],[128183],[128184],[128179],[129534],[128185],[9993],[128231],[128232],[128233],[128228],[128229],[128230],[128235],[128234],[128236],[128237],[128238],[128499],[9999],[10002],[128395],[128394],[128396],[128397],[128221],[128188],[128193],[128194],[128450],[128197],[128198],[128466],[128467],[128199],[128200],[128201],[128202],[128203],[128204],[128205],[128206],[128391],[128207],[128208],[9986],[128451],[128452],[128465],[128274],[128275],[128271],[128272],[128273],[128477],[128296],[129683],[9935],[9874],[128736],[128481],[9876],[128299],[129667],[127993],[128737],[129690],[128295],[129691],[128297],[9881],[128476],[9878],[129455],[128279],[9939],[129693],[129520],[129522],[129692],[9879],[129514],[129515],[129516],[128300],[128301],[128225],[128137],[129656],[128138],[129657],[129658],[128682],[128727],[129694],[129695],[128719],[128715],[129681],[128701],[129696],[128703],[128705],[129700],[129682],[129524],[129527],[129529],[129530],[129531],[129699],[129532],[129701],[129533],[129519],[128722],[128684],[9904],[129702],[9905],[128511],[129703],[127975],[128686],[128688],[9855],[128697],[128698],[128699],[128700],[128702],[128706],[128707],[128708],[128709],[9888],[128696],[9940],[128683],[128691],[128685],[128687],[128689],[128695],[128245],[128286],[9762],[9763],[11014],[8599],[10145],[8600],[11015],[8601],[11013],[8598],[8597],[8596],[8617],[8618],[10548],[10549],[128259],[128260],[128281],[128282],[128283],[128284],[128285],[128720],[9883],[128329],[10017],[9784],[9775],[10013],[9766],[9770],[9774],[128334],[128303],[9800],[9801],[9802],[9803],[9804],[9805],[9806],[9807],[9808],[9809],[9810],[9811],[9934],[128256],[128257],[128258],[9654],[9193],[9197],[9199],[9664],[9194],[9198],[128316],[9195],[128317],[9196],[9208],[9209],[9210],[9167],[127910],[128261],[128262],[128246],[128243],[128244],[9792],[9794],[9895],[10006],[10133],[10134],[10135],[9854],[8252],[8265],[10067],[10068],[10069],[10071],[12336],[128177],[128178],[9877],[9851],[9884],[128305],[128219],[128304],[11093],[9989],[9745],[10004],[10060],[10062],[10160],[10175],[12349],[10035],[10036],[10055],[169],[174],[8482],[35,65039,8419],[42,65039,8419],[48,65039,8419],[49,65039,8419],[50,65039,8419],[51,65039,8419],[52,65039,8419],[53,65039,8419],[54,65039,8419],[55,65039,8419],[56,65039,8419],[57,65039,8419],[128287],[128288],[128289],[128290],[128291],[128292],[127344],[127374],[127345],[127377],[127378],[127379],[8505],[127380],[9410],[127381],[127382],[127358],[127383],[127359],[127384],[127385],[127386],[127489],[127490],[127543],[127542],[127535],[127568],[127545],[127514],[127538],[127569],[127544],[127540],[127539],[12951],[12953],[127546],[127541],[128308],[128992],[128993],[128994],[128309],[128995],[128996],[9899],[9898],[128997],[128999],[129e3],[129001],[128998],[129002],[129003],[11035],[11036],[9724],[9723],[9726],[9725],[9642],[9643],[128310],[128311],[128312],[128313],[128314],[128315],[128160],[128280],[128307],[128306],[127937],[128681],[127884],[127988],[127987],[127987,65039,8205,127752],[127987,65039,8205,9895,65039],[127988,8205,9760,65039],[127462,127464],[127462,127465],[127462,127466],[127462,127467],[127462,127468],[127462,127470],[127462,127473],[127462,127474],[127462,127476],[127462,127478],[127462,127479],[127462,127480],[127462,127481],[127462,127482],[127462,127484],[127462,127485],[127462,127487],[127463,127462],[127463,127463],[127463,127465],[127463,127466],[127463,127467],[127463,127468],[127463,127469],[127463,127470],[127463,127471],[127463,127473],[127463,127474],[127463,127475],[127463,127476],[127463,127478],[127463,127479],[127463,127480],[127463,127481],[127463,127483],[127463,127484],[127463,127486],[127463,127487],[127464,127462],[127464,127464],[127464,127465],[127464,127467],[127464,127468],[127464,127469],[127464,127470],[127464,127472],[127464,127473],[127464,127474],[127464,127475],[127464,127476],[127464,127477],[127464,127479],[127464,127482],[127464,127483],[127464,127484],[127464,127485],[127464,127486],[127464,127487],[127465,127466],[127465,127468],[127465,127471],[127465,127472],[127465,127474],[127465,127476],[127465,127487],[127466,127462],[127466,127464],[127466,127466],[127466,127468],[127466,127469],[127466,127479],[127466,127480],[127466,127481],[127466,127482],[127467,127470],[127467,127471],[127467,127472],[127467,127474],[127467,127476],[127467,127479],[127468,127462],[127468,127463],[127468,127465],[127468,127466],[127468,127467],[127468,127468],[127468,127469],[127468,127470],[127468,127473],[127468,127474],[127468,127475],[127468,127477],[127468,127478],[127468,127479],[127468,127480],[127468,127481],[127468,127482],[127468,127484],[127468,127486],[127469,127472],[127469,127474],[127469,127475],[127469,127479],[127469,127481],[127469,127482],[127470,127464],[127470,127465],[127470,127466],[127470,127473],[127470,127474],[127470,127475],[127470,127476],[127470,127478],[127470,127479],[127470,127480],[127470,127481],[127471,127466],[127471,127474],[127471,127476],[127471,127477],[127472,127466],[127472,127468],[127472,127469],[127472,127470],[127472,127474],[127472,127475],[127472,127477],[127472,127479],[127472,127484],[127472,127486],[127472,127487],[127473,127462],[127473,127463],[127473,127464],[127473,127470],[127473,127472],[127473,127479],[127473,127480],[127473,127481],[127473,127482],[127473,127483],[127473,127486],[127474,127462],[127474,127464],[127474,127465],[127474,127466],[127474,127467],[127474,127468],[127474,127469],[127474,127472],[127474,127473],[127474,127474],[127474,127475],[127474,127476],[127474,127477],[127474,127478],[127474,127479],[127474,127480],[127474,127481],[127474,127482],[127474,127483],[127474,127484],[127474,127485],[127474,127486],[127474,127487],[127475,127462],[127475,127464],[127475,127466],[127475,127467],[127475,127468],[127475,127470],[127475,127473],[127475,127476],[127475,127477],[127475,127479],[127475,127482],[127475,127487],[127476,127474],[127477,127462],[127477,127466],[127477,127467],[127477,127468],[127477,127469],[127477,127472],[127477,127473],[127477,127474],[127477,127475],[127477,127479],[127477,127480],[127477,127481],[127477,127484],[127477,127486],[127478,127462],[127479,127466],[127479,127476],[127479,127480],[127479,127482],[127479,127484],[127480,127462],[127480,127463],[127480,127464],[127480,127465],[127480,127466],[127480,127468],[127480,127469],[127480,127470],[127480,127471],[127480,127472],[127480,127473],[127480,127474],[127480,127475],[127480,127476],[127480,127479],[127480,127480],[127480,127481],[127480,127483],[127480,127485],[127480,127486],[127480,127487],[127481,127462],[127481,127464],[127481,127465],[127481,127467],[127481,127468],[127481,127469],[127481,127471],[127481,127472],[127481,127473],[127481,127474],[127481,127475],[127481,127476],[127481,127479],[127481,127481],[127481,127483],[127481,127484],[127481,127487],[127482,127462],[127482,127468],[127482,127474],[127482,127475],[127482,127480],[127482,127486],[127482,127487],[127483,127462],[127483,127464],[127483,127466],[127483,127468],[127483,127470],[127483,127475],[127483,127482],[127484,127467],[127484,127480],[127485,127472],[127486,127466],[127486,127481],[127487,127462],[127487,127474],[127487,127484],[127988,917607,917602,917605,917614,917607,917631],[127988,917607,917602,917619,917603,917620,917631],[127988,917607,917602,917623,917612,917619,917631]]

	const getClientRects = instanceId => {
		return new Promise(async resolve => {
			try {
				const toJSONParsed = (x) => JSON.parse(JSON.stringify(x))
				let lied = lieProps['Element.getClientRects'] // detect lies
				const rectsId = `${instanceId}-client-rects-div`
				const divElement = document.createElement('div')
				divElement.setAttribute('id', rectsId)
				let iframeRendered, doc = document
				try {
					// create and get rendered iframe
					const id = `${instanceId}-client-rects-iframe`
					const iframeElement = document.createElement('iframe')
					iframeElement.setAttribute('id', id)
					iframeElement.setAttribute('style', 'visibility: hidden; height: 0')
					document.body.appendChild(iframeElement)
					iframeRendered = document.getElementById(id)

					// create and get rendered div in iframe
					doc = iframeRendered.contentDocument
				}
				catch (error) {
					captureError(error, 'client blocked getClientRects iframe')
				}

				doc.body.appendChild(divElement)
				const divRendered = doc.getElementById(rectsId)
				
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
				`)

				// get emojis
				const emojiDiv = doc.getElementById('emoji')
				const emojiRects = emojis
					.map(emoji => String.fromCodePoint(...emoji))
					.map(emoji => {
						emojiDiv.innerHTML = emoji
						const domRect = emojiDiv.getClientRects()[0]
						return {emoji,...toJSONParsed(domRect)}
					})
				
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
						lied = true
						mathLie = { fingerprint: '', lies: [{ ['failed math calculation']: true }] }
					}
					return
				})
				if (mathLie) {
					documentLie('getClientRects', hashMini(clientRects), mathLie)
				}
				
				// detect equal elements mismatch lie
				let offsetLie = false
				const { right: right1, left: left1 } = clientRects[10]
				const { right: right2, left: left2 } = clientRects[11]
				if (right1 != right2 || left1 != left2) {
					offsetLie = { fingerprint: '', lies: [{ ['equal elements mismatch']: true }] }
					documentLie('getClientRects', hashMini(clientRects), offsetLie)
					lied = true
				}

				// resolve 
				const templateId = 'creep-client-rects'
				const templateEl = document.getElementById(templateId)
				if (!!iframeRendered) {
					iframeRendered.parentNode.removeChild(iframeRendered)
				}
				else {
					const rectsDivRendered = doc.getElementById(rectsId)
					rectsDivRendered.parentNode.removeChild(rectsDivRendered)
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
					console.error(error.message)
				})
				resolve({emojiRects, emojiHash, clientRects, clientHash, lied, $hash })
				patch(templateEl, html`
				<div>
					<strong>DOMRect</strong>
					<div>hash: ${lied ? `${note.lied} ` : ''}${$hash}</div>
					<div>elements: ${clientHash}</div>
					<div>results: ${
						modal(`${templateId}-elements`, clientRects.map(domRect => Object.keys(domRect).map(key => `<div>${key}: ${domRect[key]}</div>`).join('')).join('<br>') )
					}</div>
					<div>emojis v13.0: ${emojiHash}</div>
					<div>results: ${
						modal(`${templateId}-emojis`, emojiRects.map(rect => rect.emoji).join('') )
					}</div>
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
				const audioContext = caniuse(() => OfflineAudioContext || webkitOfflineAudioContext)
				if (!audioContext) {
					return resolve(undefined)
				}
				// detect lies
				const channelDataLie = lieProps['AudioBuffer.getChannelData']
				const copyFromChannelLie = lieProps['AudioBuffer.copyFromChannel']
				let lied = channelDataLie || copyFromChannelLie
				
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
							
							copySample = copy ? [...copy].slice(4500, 4600) : [sendToTrash('invalid Audio Sample Copy', null)]
							binsSample = bins ? [...bins].slice(4500, 4600) : [sendToTrash('invalid Audio Sample', null)]
							
							const copyJSON = copy && JSON.stringify([...copy].slice(4500, 4600))
							const binsJSON = bins && JSON.stringify([...bins].slice(4500, 4600))

							matching = binsJSON === copyJSON
							// detect lie
							
							if (!matching) {
								lied = true
								const audioSampleLie = { fingerprint: '', lies: [{ ['data and copy samples mismatch']: false }] }
								documentLie('AudioBuffer', hashMini(matching), audioSampleLie)
							}

							dynamicsCompressor.disconnect()
							oscillator.disconnect()
			
							const response = {
								binsSample: binsSample,
								copySample: copySample,
								matching,
								values,
								lied
							}

							const $hash = await hashify(response)
							resolve({...response, $hash })
							const id = 'creep-offline-audio-context'
							const el = document.getElementById(id)
							patch(el, html`
							<div>
								<strong>OfflineAudioContext</strong>
								<div>hash: ${lied ? `${note.lied} ` : ''}${$hash}</div>
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
				const contentWindowHTMLElement = contentWindow ? contentWindow.HTMLElement : HTMLElement
				const htmlElementPrototype = attempt(() => contentWindowHTMLElement.prototype)
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
				resolve({fonts: fontList, $hash })

				const id = 'creep-fonts'
				const el = document.getElementById(id)
				patch(el, html`
				<div>
					<strong>HTMLElement (font-family)</strong>
					<div>hash: ${$hash}</div>
					<div>results (${count(fontList)}): ${fontList && fontList.length ? modal(id, fontList.join('<br>')) : note.blocked}</div>
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

	const fontList=["Andale Mono","Arial","Arial Black","Arial Hebrew","Arial MT","Arial Narrow","Arial Rounded MT Bold","Arial Unicode MS","Bitstream Vera Sans Mono","Book Antiqua","Bookman Old Style","Calibri","Cambria","Cambria Math","Century","Century Gothic","Century Schoolbook","Comic Sans","Comic Sans MS","Consolas","Courier","Courier New","Geneva","Georgia","Helvetica","Helvetica Neue","Impact","Lucida Bright","Lucida Calligraphy","Lucida Console","Lucida Fax","LUCIDA GRANDE","Lucida Handwriting","Lucida Sans","Lucida Sans Typewriter","Lucida Sans Unicode","Microsoft Sans Serif","Monaco","Monotype Corsiva","MS Gothic","MS Outlook","MS PGothic","MS Reference Sans Serif","MS Sans Serif","MS Serif","MYRIAD","MYRIAD PRO","Palatino","Palatino Linotype","Segoe Print","Segoe Script","Segoe UI","Segoe UI Light","Segoe UI Semibold","Segoe UI Symbol","Tahoma","Times","Times New Roman","Times New Roman PS","Trebuchet MS","Verdana","Wingdings","Wingdings 2","Wingdings 3"],extendedFontList=["Abadi MT Condensed Light","Academy Engraved LET","ADOBE CASLON PRO","Adobe Garamond","ADOBE GARAMOND PRO","Agency FB","Aharoni","Albertus Extra Bold","Albertus Medium","Algerian","Amazone BT","American Typewriter","American Typewriter Condensed","AmerType Md BT","Andalus","Angsana New","AngsanaUPC","Antique Olive","Aparajita","Apple Chancery","Apple Color Emoji","Apple SD Gothic Neo","Arabic Typesetting","ARCHER","ARNO PRO","Arrus BT","Aurora Cn BT","AvantGarde Bk BT","AvantGarde Md BT","AVENIR","Ayuthaya","Bandy","Bangla Sangam MN","Bank Gothic","BankGothic Md BT","Baskerville","Baskerville Old Face","Batang","BatangChe","Bauer Bodoni","Bauhaus 93","Bazooka","Bell MT","Bembo","Benguiat Bk BT","Berlin Sans FB","Berlin Sans FB Demi","Bernard MT Condensed","BernhardFashion BT","BernhardMod BT","Big Caslon","BinnerD","Blackadder ITC","BlairMdITC TT","Bodoni 72","Bodoni 72 Oldstyle","Bodoni 72 Smallcaps","Bodoni MT","Bodoni MT Black","Bodoni MT Condensed","Bodoni MT Poster Compressed","Bookshelf Symbol 7","Boulder","Bradley Hand","Bradley Hand ITC","Bremen Bd BT","Britannic Bold","Broadway","Browallia New","BrowalliaUPC","Brush Script MT","Californian FB","Calisto MT","Calligrapher","Candara","CaslonOpnface BT","Castellar","Centaur","Cezanne","CG Omega","CG Times","Chalkboard","Chalkboard SE","Chalkduster","Charlesworth","Charter Bd BT","Charter BT","Chaucer","ChelthmITC Bk BT","Chiller","Clarendon","Clarendon Condensed","CloisterBlack BT","Cochin","Colonna MT","Constantia","Cooper Black","Copperplate","Copperplate Gothic","Copperplate Gothic Bold","Copperplate Gothic Light","CopperplGoth Bd BT","Corbel","Cordia New","CordiaUPC","Cornerstone","Coronet","Cuckoo","Curlz MT","DaunPenh","Dauphin","David","DB LCD Temp","DELICIOUS","Denmark","DFKai-SB","Didot","DilleniaUPC","DIN","DokChampa","Dotum","DotumChe","Ebrima","Edwardian Script ITC","Elephant","English 111 Vivace BT","Engravers MT","EngraversGothic BT","Eras Bold ITC","Eras Demi ITC","Eras Light ITC","Eras Medium ITC","EucrosiaUPC","Euphemia","Euphemia UCAS","EUROSTILE","Exotc350 Bd BT","FangSong","Felix Titling","Fixedsys","FONTIN","Footlight MT Light","Forte","FrankRuehl","Fransiscan","Freefrm721 Blk BT","FreesiaUPC","Freestyle Script","French Script MT","FrnkGothITC Bk BT","Fruitger","FRUTIGER","Futura","Futura Bk BT","Futura Lt BT","Futura Md BT","Futura ZBlk BT","FuturaBlack BT","Gabriola","Galliard BT","Gautami","Geeza Pro","Geometr231 BT","Geometr231 Hv BT","Geometr231 Lt BT","GeoSlab 703 Lt BT","GeoSlab 703 XBd BT","Gigi","Gill Sans","Gill Sans MT","Gill Sans MT Condensed","Gill Sans MT Ext Condensed Bold","Gill Sans Ultra Bold","Gill Sans Ultra Bold Condensed","Gisha","Gloucester MT Extra Condensed","GOTHAM","GOTHAM BOLD","Goudy Old Style","Goudy Stout","GoudyHandtooled BT","GoudyOLSt BT","Gujarati Sangam MN","Gulim","GulimChe","Gungsuh","GungsuhChe","Gurmukhi MN","Haettenschweiler","Harlow Solid Italic","Harrington","Heather","Heiti SC","Heiti TC","HELV","Herald","High Tower Text","Hiragino Kaku Gothic ProN","Hiragino Mincho ProN","Hoefler Text","Humanst 521 Cn BT","Humanst521 BT","Humanst521 Lt BT","Imprint MT Shadow","Incised901 Bd BT","Incised901 BT","Incised901 Lt BT","INCONSOLATA","Informal Roman","Informal011 BT","INTERSTATE","IrisUPC","Iskoola Pota","JasmineUPC","Jazz LET","Jenson","Jester","Jokerman","Juice ITC","Kabel Bk BT","Kabel Ult BT","Kailasa","KaiTi","Kalinga","Kannada Sangam MN","Kartika","Kaufmann Bd BT","Kaufmann BT","Khmer UI","KodchiangUPC","Kokila","Korinna BT","Kristen ITC","Krungthep","Kunstler Script","Lao UI","Latha","Leelawadee","Letter Gothic","Levenim MT","LilyUPC","Lithograph","Lithograph Light","Long Island","Lydian BT","Magneto","Maiandra GD","Malayalam Sangam MN","Malgun Gothic","Mangal","Marigold","Marion","Marker Felt","Market","Marlett","Matisse ITC","Matura MT Script Capitals","Meiryo","Meiryo UI","Microsoft Himalaya","Microsoft JhengHei","Microsoft New Tai Lue","Microsoft PhagsPa","Microsoft Tai Le","Microsoft Uighur","Microsoft YaHei","Microsoft Yi Baiti","MingLiU","MingLiU_HKSCS","MingLiU_HKSCS-ExtB","MingLiU-ExtB","Minion","Minion Pro","Miriam","Miriam Fixed","Mistral","Modern","Modern No. 20","Mona Lisa Solid ITC TT","Mongolian Baiti","MONO","MoolBoran","Mrs Eaves","MS LineDraw","MS Mincho","MS PMincho","MS Reference Specialty","MS UI Gothic","MT Extra","MUSEO","MV Boli","Nadeem","Narkisim","NEVIS","News Gothic","News GothicMT","NewsGoth BT","Niagara Engraved","Niagara Solid","Noteworthy","NSimSun","Nyala","OCR A Extended","Old Century","Old English Text MT","Onyx","Onyx BT","OPTIMA","Oriya Sangam MN","OSAKA","OzHandicraft BT","Palace Script MT","Papyrus","Parchment","Party LET","Pegasus","Perpetua","Perpetua Titling MT","PetitaBold","Pickwick","Plantagenet Cherokee","Playbill","PMingLiU","PMingLiU-ExtB","Poor Richard","Poster","PosterBodoni BT","PRINCETOWN LET","Pristina","PTBarnum BT","Pythagoras","Raavi","Rage Italic","Ravie","Ribbon131 Bd BT","Rockwell","Rockwell Condensed","Rockwell Extra Bold","Rod","Roman","Sakkal Majalla","Santa Fe LET","Savoye LET","Sceptre","Script","Script MT Bold","SCRIPTINA","Serifa","Serifa BT","Serifa Th BT","ShelleyVolante BT","Sherwood","Shonar Bangla","Showcard Gothic","Shruti","Signboard","SILKSCREEN","SimHei","Simplified Arabic","Simplified Arabic Fixed","SimSun","SimSun-ExtB","Sinhala Sangam MN","Sketch Rockwell","Skia","Small Fonts","Snap ITC","Snell Roundhand","Socket","Souvenir Lt BT","Staccato222 BT","Steamer","Stencil","Storybook","Styllo","Subway","Swis721 BlkEx BT","Swiss911 XCm BT","Sylfaen","Synchro LET","System","Tamil Sangam MN","Technical","Teletype","Telugu Sangam MN","Tempus Sans ITC","Terminal","Thonburi","Traditional Arabic","Trajan","TRAJAN PRO","Tristan","Tubular","Tunga","Tw Cen MT","Tw Cen MT Condensed","Tw Cen MT Condensed Extra Bold","TypoUpright BT","Unicorn","Univers","Univers CE 55 Medium","Univers Condensed","Utsaah","Vagabond","Vani","Vijaya","Viner Hand ITC","VisualUI","Vivaldi","Vladimir Script","Vrinda","Westminster","WHITNEY","Wide Latin","ZapfEllipt BT","ZapfHumnst BT","ZapfHumnst Dm BT","Zapfino","Zurich BlkEx BT","Zurich Ex BT","ZWAdobeF"],googleFonts=["ABeeZee","Abel","Abhaya Libre","Abril Fatface","Aclonica","Acme","Actor","Adamina","Advent Pro","Aguafina Script","Akronim","Aladin","Aldrich","Alef","Alegreya","Alegreya SC","Alegreya Sans","Alegreya Sans SC","Aleo","Alex Brush","Alfa Slab One","Alice","Alike","Alike Angular","Allan","Allerta","Allerta Stencil","Allura","Almarai","Almendra","Almendra Display","Almendra SC","Amarante","Amaranth","Amatic SC","Amethysta","Amiko","Amiri","Amita","Anaheim","Andada","Andika","Angkor","Annie Use Your Telescope","Anonymous Pro","Antic","Antic Didone","Antic Slab","Anton","Arapey","Arbutus","Arbutus Slab","Architects Daughter","Archivo","Archivo Black","Archivo Narrow","Aref Ruqaa","Arima Madurai","Arimo","Arizonia","Armata","Arsenal","Artifika","Arvo","Arya","Asap","Asap Condensed","Asar","Asset","Assistant","Astloch","Asul","Athiti","Atma","Atomic Age","Aubrey","Audiowide","Autour One","Average","Average Sans","Averia Gruesa Libre","Averia Libre","Averia Sans Libre","Averia Serif Libre","B612","B612 Mono","Bad Script","Bahiana","Bahianita","Bai Jamjuree","Baloo","Baloo Bhai","Baloo Bhaijaan","Baloo Bhaina","Baloo Chettan","Baloo Da","Baloo Paaji","Baloo Tamma","Baloo Tammudu","Baloo Thambi","Balthazar","Bangers","Barlow","Barlow Condensed","Barlow Semi Condensed","Barriecito","Barrio","Basic","Battambang","Baumans","Bayon","Be Vietnam","Bebas Neue","Belgrano","Bellefair","Belleza","BenchNine","Bentham","Berkshire Swash","Beth Ellen","Bevan","Big Shoulders Display","Big Shoulders Text","Bigelow Rules","Bigshot One","Bilbo","Bilbo Swash Caps","BioRhyme","BioRhyme Expanded","Biryani","Bitter","Black And White Picture","Black Han Sans","Black Ops One","Blinker","Bokor","Bonbon","Boogaloo","Bowlby One","Bowlby One SC","Brawler","Bree Serif","Bubblegum Sans","Bubbler One","Buda","Buenard","Bungee","Bungee Hairline","Bungee Inline","Bungee Outline","Bungee Shade","Butcherman","Butterfly Kids","Cabin","Cabin Condensed","Cabin Sketch","Caesar Dressing","Cagliostro","Cairo","Calligraffitti","Cambay","Cambo","Candal","Cantarell","Cantata One","Cantora One","Capriola","Cardo","Carme","Carrois Gothic","Carrois Gothic SC","Carter One","Catamaran","Caudex","Caveat","Caveat Brush","Cedarville Cursive","Ceviche One","Chakra Petch","Changa","Changa One","Chango","Charm","Charmonman","Chathura","Chau Philomene One","Chela One","Chelsea Market","Chenla","Cherry Cream Soda","Cherry Swash","Chewy","Chicle","Chilanka","Chivo","Chonburi","Cinzel","Cinzel Decorative","Clicker Script","Coda","Coda Caption","Codystar","Coiny","Combo","Comfortaa","Coming Soon","Concert One","Condiment","Content","Contrail One","Convergence","Cookie","Copse","Corben","Cormorant","Cormorant Garamond","Cormorant Infant","Cormorant SC","Cormorant Unicase","Cormorant Upright","Courgette","Cousine","Coustard","Covered By Your Grace","Crafty Girls","Creepster","Crete Round","Crimson Pro","Crimson Text","Croissant One","Crushed","Cuprum","Cute Font","Cutive","Cutive Mono","DM Sans","DM Serif Display","DM Serif Text","Damion","Dancing Script","Dangrek","Darker Grotesque","David Libre","Dawning of a New Day","Days One","Dekko","Delius","Delius Swash Caps","Delius Unicase","Della Respira","Denk One","Devonshire","Dhurjati","Didact Gothic","Diplomata","Diplomata SC","Do Hyeon","Dokdo","Domine","Donegal One","Doppio One","Dorsa","Dosis","Dr Sugiyama","Duru Sans","Dynalight","EB Garamond","Eagle Lake","East Sea Dokdo","Eater","Economica","Eczar","El Messiri","Electrolize","Elsie","Elsie Swash Caps","Emblema One","Emilys Candy","Encode Sans","Encode Sans Condensed","Encode Sans Expanded","Encode Sans Semi Condensed","Encode Sans Semi Expanded","Engagement","Englebert","Enriqueta","Erica One","Esteban","Euphoria Script","Ewert","Exo","Exo 2","Expletus Sans","Fahkwang","Fanwood Text","Farro","Farsan","Fascinate","Fascinate Inline","Faster One","Fasthand","Fauna One","Faustina","Federant","Federo","Felipa","Fenix","Finger Paint","Fira Code","Fira Mono","Fira Sans","Fira Sans Condensed","Fira Sans Extra Condensed","Fjalla One","Fjord One","Flamenco","Flavors","Fondamento","Fontdiner Swanky","Forum","Francois One","Frank Ruhl Libre","Freckle Face","Fredericka the Great","Fredoka One","Freehand","Fresca","Frijole","Fruktur","Fugaz One","GFS Didot","GFS Neohellenic","Gabriela","Gaegu","Gafata","Galada","Galdeano","Galindo","Gamja Flower","Gayathri","Gentium Basic","Gentium Book Basic","Geo","Geostar","Geostar Fill","Germania One","Gidugu","Gilda Display","Give You Glory","Glass Antiqua","Glegoo","Gloria Hallelujah","Goblin One","Gochi Hand","Gorditas","Gothic A1","Goudy Bookletter 1911","Graduate","Grand Hotel","Gravitas One","Great Vibes","Grenze","Griffy","Gruppo","Gudea","Gugi","Gurajada","Habibi","Halant","Hammersmith One","Hanalei","Hanalei Fill","Handlee","Hanuman","Happy Monkey","Harmattan","Headland One","Heebo","Henny Penny","Hepta Slab","Herr Von Muellerhoff","Hi Melody","Hind","Hind Guntur","Hind Madurai","Hind Siliguri","Hind Vadodara","Holtwood One SC","Homemade Apple","Homenaje","IBM Plex Mono","IBM Plex Sans","IBM Plex Sans Condensed","IBM Plex Serif","IM Fell DW Pica","IM Fell DW Pica SC","IM Fell Double Pica","IM Fell Double Pica SC","IM Fell English","IM Fell English SC","IM Fell French Canon","IM Fell French Canon SC","IM Fell Great Primer","IM Fell Great Primer SC","Iceberg","Iceland","Imprima","Inconsolata","Inder","Indie Flower","Inika","Inknut Antiqua","Irish Grover","Istok Web","Italiana","Italianno","Itim","Jacques Francois","Jacques Francois Shadow","Jaldi","Jim Nightshade","Jockey One","Jolly Lodger","Jomhuria","Jomolhari","Josefin Sans","Josefin Slab","Joti One","Jua","Judson","Julee","Julius Sans One","Junge","Jura","Just Another Hand","Just Me Again Down Here","K2D","Kadwa","Kalam","Kameron","Kanit","Kantumruy","Karla","Karma","Katibeh","Kaushan Script","Kavivanar","Kavoon","Kdam Thmor","Keania One","Kelly Slab","Kenia","Khand","Khmer","Khula","Kirang Haerang","Kite One","Knewave","KoHo","Kodchasan","Kosugi","Kosugi Maru","Kotta One","Koulen","Kranky","Kreon","Kristi","Krona One","Krub","Kulim Park","Kumar One","Kumar One Outline","Kurale","La Belle Aurore","Lacquer","Laila","Lakki Reddy","Lalezar","Lancelot","Lateef","Lato","League Script","Leckerli One","Ledger","Lekton","Lemon","Lemonada","Lexend Deca","Lexend Exa","Lexend Giga","Lexend Mega","Lexend Peta","Lexend Tera","Lexend Zetta","Libre Barcode 128","Libre Barcode 128 Text","Libre Barcode 39","Libre Barcode 39 Extended","Libre Barcode 39 Extended Text","Libre Barcode 39 Text","Libre Baskerville","Libre Caslon Display","Libre Caslon Text","Libre Franklin","Life Savers","Lilita One","Lily Script One","Limelight","Linden Hill","Literata","Liu Jian Mao Cao","Livvic","Lobster","Lobster Two","Londrina Outline","Londrina Shadow","Londrina Sketch","Londrina Solid","Long Cang","Lora","Love Ya Like A Sister","Loved by the King","Lovers Quarrel","Luckiest Guy","Lusitana","Lustria","M PLUS 1p","M PLUS Rounded 1c","Ma Shan Zheng","Macondo","Macondo Swash Caps","Mada","Magra","Maiden Orange","Maitree","Major Mono Display","Mako","Mali","Mallanna","Mandali","Manjari","Mansalva","Manuale","Marcellus","Marcellus SC","Marck Script","Margarine","Markazi Text","Marko One","Marmelad","Martel","Martel Sans","Marvel","Mate","Mate SC","Material Icons","Maven Pro","McLaren","Meddon","MedievalSharp","Medula One","Meera Inimai","Megrim","Meie Script","Merienda","Merienda One","Merriweather","Merriweather Sans","Metal","Metal Mania","Metamorphous","Metrophobic","Michroma","Milonga","Miltonian","Miltonian Tattoo","Mina","Miniver","Miriam Libre","Mirza","Miss Fajardose","Mitr","Modak","Modern Antiqua","Mogra","Molengo","Molle","Monda","Monofett","Monoton","Monsieur La Doulaise","Montaga","Montez","Montserrat","Montserrat Alternates","Montserrat Subrayada","Moul","Moulpali","Mountains of Christmas","Mouse Memoirs","Mr Bedfort","Mr Dafoe","Mr De Haviland","Mrs Saint Delafield","Mrs Sheppards","Mukta","Mukta Mahee","Mukta Malar","Mukta Vaani","Muli","Mystery Quest","NTR","Nanum Brush Script","Nanum Gothic","Nanum Gothic Coding","Nanum Myeongjo","Nanum Pen Script","Neucha","Neuton","New Rocker","News Cycle","Niconne","Niramit","Nixie One","Nobile","Nokora","Norican","Nosifer","Notable","Nothing You Could Do","Noticia Text","Noto Sans","Noto Sans HK","Noto Sans JP","Noto Sans KR","Noto Sans SC","Noto Sans TC","Noto Serif","Noto Serif JP","Noto Serif KR","Noto Serif SC","Noto Serif TC","Nova Cut","Nova Flat","Nova Mono","Nova Oval","Nova Round","Nova Script","Nova Slim","Nova Square","Numans","Nunito","Nunito Sans","Odor Mean Chey","Offside","Old Standard TT","Oldenburg","Oleo Script","Oleo Script Swash Caps","Open Sans","Open Sans Condensed","Oranienbaum","Orbitron","Oregano","Orienta","Original Surfer","Oswald","Over the Rainbow","Overlock","Overlock SC","Overpass","Overpass Mono","Ovo","Oxygen","Oxygen Mono","PT Mono","PT Sans","PT Sans Caption","PT Sans Narrow","PT Serif","PT Serif Caption","Pacifico","Padauk","Palanquin","Palanquin Dark","Pangolin","Paprika","Parisienne","Passero One","Passion One","Pathway Gothic One","Patrick Hand","Patrick Hand SC","Pattaya","Patua One","Pavanam","Paytone One","Peddana","Peralta","Permanent Marker","Petit Formal Script","Petrona","Philosopher","Piedra","Pinyon Script","Pirata One","Plaster","Play","Playball","Playfair Display","Playfair Display SC","Podkova","Poiret One","Poller One","Poly","Pompiere","Pontano Sans","Poor Story","Poppins","Port Lligat Sans","Port Lligat Slab","Pragati Narrow","Prata","Preahvihear","Press Start 2P","Pridi","Princess Sofia","Prociono","Prompt","Prosto One","Proza Libre","Public Sans","Puritan","Purple Purse","Quando","Quantico","Quattrocento","Quattrocento Sans","Questrial","Quicksand","Quintessential","Qwigley","Racing Sans One","Radley","Rajdhani","Rakkas","Raleway","Raleway Dots","Ramabhadra","Ramaraja","Rambla","Rammetto One","Ranchers","Rancho","Ranga","Rasa","Rationale","Ravi Prakash","Red Hat Display","Red Hat Text","Redressed","Reem Kufi","Reenie Beanie","Revalia","Rhodium Libre","Ribeye","Ribeye Marrow","Righteous","Risque","Roboto","Roboto Condensed","Roboto Mono","Roboto Slab","Rochester","Rock Salt","Rokkitt","Romanesco","Ropa Sans","Rosario","Rosarivo","Rouge Script","Rozha One","Rubik","Rubik Mono One","Ruda","Rufina","Ruge Boogie","Ruluko","Rum Raisin","Ruslan Display","Russo One","Ruthie","Rye","Sacramento","Sahitya","Sail","Saira","Saira Condensed","Saira Extra Condensed","Saira Semi Condensed","Saira Stencil One","Salsa","Sanchez","Sancreek","Sansita","Sarabun","Sarala","Sarina","Sarpanch","Satisfy","Sawarabi Gothic","Sawarabi Mincho","Scada","Scheherazade","Schoolbell","Scope One","Seaweed Script","Secular One","Sedgwick Ave","Sedgwick Ave Display","Sevillana","Seymour One","Shadows Into Light","Shadows Into Light Two","Shanti","Share","Share Tech","Share Tech Mono","Shojumaru","Short Stack","Shrikhand","Siemreap","Sigmar One","Signika","Signika Negative","Simonetta","Single Day","Sintony","Sirin Stencil","Six Caps","Skranji","Slabo 13px","Slabo 27px","Slackey","Smokum","Smythe","Sniglet","Snippet","Snowburst One","Sofadi One","Sofia","Song Myung","Sonsie One","Sorts Mill Goudy","Source Code Pro","Source Sans Pro","Source Serif Pro","Space Mono","Special Elite","Spectral","Spectral SC","Spicy Rice","Spinnaker","Spirax","Squada One","Sree Krushnadevaraya","Sriracha","Srisakdi","Staatliches","Stalemate","Stalinist One","Stardos Stencil","Stint Ultra Condensed","Stint Ultra Expanded","Stoke","Strait","Stylish","Sue Ellen Francisco","Suez One","Sumana","Sunflower","Sunshiney","Supermercado One","Sura","Suranna","Suravaram","Suwannaphum","Swanky and Moo Moo","Syncopate","Tajawal","Tangerine","Taprom","Tauri","Taviraj","Teko","Telex","Tenali Ramakrishna","Tenor Sans","Text Me One","Thasadith","The Girl Next Door","Tienne","Tillana","Timmana","Tinos","Titan One","Titillium Web","Tomorrow","Trade Winds","Trirong","Trocchi","Trochut","Trykker","Tulpen One","Turret Road","Ubuntu","Ubuntu Condensed","Ubuntu Mono","Ultra","Uncial Antiqua","Underdog","Unica One","UnifrakturCook","UnifrakturMaguntia","Unkempt","Unlock","Unna","VT323","Vampiro One","Varela","Varela Round","Vast Shadow","Vesper Libre","Vibes","Vibur","Vidaloka","Viga","Voces","Volkhov","Vollkorn","Vollkorn SC","Voltaire","Waiting for the Sunrise","Wallpoet","Walter Turncoat","Warnes","Wellfleet","Wendy One","Wire One","Work Sans","Yanone Kaffeesatz","Yantramanav","Yatra One","Yellowtail","Yeon Sung","Yeseva One","Yesteryear","Yrsa","ZCOOL KuaiLe","ZCOOL QingKe HuangYou","ZCOOL XiaoWei","Zeyada","Zhi Mang Xing","Zilla Slab","Zilla Slab Highlight"],notoFonts=["Noto Naskh Arabic","Noto Sans Armenian","Noto Sans Bengali","Noto Sans Buginese","Noto Sans Canadian Aboriginal","Noto Sans Cherokee","Noto Sans Devanagari","Noto Sans Ethiopic","Noto Sans Georgian","Noto Sans Gujarati","Noto Sans Gurmukhi","Noto Sans Hebrew","Noto Sans JP Regular","Noto Sans KR Regular","Noto Sans Kannada","Noto Sans Khmer","Noto Sans Lao","Noto Sans Malayalam","Noto Sans Mongolian","Noto Sans Myanmar","Noto Sans Oriya","Noto Sans SC Regular","Noto Sans Sinhala","Noto Sans TC Regular","Noto Sans Tamil","Noto Sans Telugu","Noto Sans Thaana","Noto Sans Thai","Noto Sans Tibetan","Noto Sans Yi","Noto Serif Armenian","Noto Serif Khmer","Noto Serif Lao","Noto Serif Thai"];

	const getTrash = (instanceId, trashBin) => {
		return new Promise(async resolve => {
			const len = trashBin.length
			const $hash = await hashify(trashBin)
			resolve({ trashBin, $hash })
			const id = 'creep-trash'
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
			let totalLies = 0
			const sanitize = str => str.replace(/\</g, '&lt;')
			lieRecords.forEach(lie => {
				if (!!lie.lieTypes.fingerprint) {
					totalLies++
				}
				if (!!lie.lieTypes.lies) {
					totalLies += lie.lieTypes.lies.length
				}
			})
			
			const data = lieRecords.map(lie => ({ name: lie.name, lieTypes: lie.lieTypes }))
			data.sort((a, b) => (a.name > b.name) ? 1 : -1)
			const $hash = await hashify(data)
			resolve({data, $hash })
			const id = 'creep-lies'
			const el = document.getElementById(id)
			patch(el, html`
			<div class="${totalLies ? 'lies': ''}">
				<strong>Lies Unmasked</strong>
				<div>hash: ${$hash}</div>
				<div>lies (${!totalLies ? '0' : ''+totalLies }): ${
					totalLies ? modal(id, Object.keys(data).map(key => {
						const { name, lieTypes: { lies, fingerprint } } = data[key]
						const lieFingerprint = !!fingerprint ? { hash: hashMini(fingerprint), json: sanitize(toJSONFormat(fingerprint)) } : undefined
						return `
							<div style="padding:5px">
								<strong>${name}</strong>:
								${lies.length ? lies.map(lie => `<br>${Object.keys(lie)[0]}`).join(''): ''}
								${
									lieFingerprint ? `
										<br>tampering code leaked a fingerprint: ${lieFingerprint.hash}
										<br>code: ${lieFingerprint.json}`: 
									''
								}
							</div>
						`
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
			const id = 'creep-captured-errors'
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
	

	// fingerprint and render
	const { fingerprint: fp, timeEnd } = await fingerprint().catch(error => console.error(error))
	// Trusted Fingerprint
	const distrust = { distrust: { brave: isBrave, firefox: isFirefox } }
	const trashLen = fp.trash.trashBin.length
	const liesLen = !('data' in fp.lies) ? 0 : fp.lies.data.length
	const errorsLen = fp.capturedErrors.data.length
	const creep = {
		workerScope: fp.workerScope ? {
			canvas2d: (
				(isBrave || isFirefox) ? distrust : 
				fp.workerScope.canvas2d
			),
			hardwareConcurrency: (
				isBrave ? distrust : 
				fp.workerScope.hardwareConcurrency
			),
			language: fp.workerScope.language,
			platform: fp.workerScope.platform,
			system: fp.workerScope.system,
			['timezone offset']: fp.workerScope['timezone offset'],
			['webgl renderer']: fp.workerScope['webgl renderer'],
			['webgl vendor']: fp.workerScope['webgl vendor']
		} : undefined,
		mediaDevices: !isBrave ? fp.mediaDevices : distrust,
		canvas2d: (
			(isBrave || isFirefox) ? distrust : 
			!fp.canvas2d || fp.canvas2d.lied ? undefined : 
			fp.canvas2d
		),
		canvasBitmapRenderer: (
			(isBrave || isFirefox) ? distrust : 
			!fp.canvasBitmapRenderer || fp.canvasBitmapRenderer.lied ? undefined : 
			fp.canvasBitmapRenderer
		),
		canvasWebgl: isBrave ? distrust : !fp.canvasWebgl || fp.canvasWebgl.lied ? undefined : {
			supported: fp.canvasWebgl.supported,
			supported2: fp.canvasWebgl.supported2,
			dataURI: isFirefox ? distrust : fp.canvasWebgl.dataURI,
			dataURI2: isFirefox ? distrust : fp.canvasWebgl.dataURI2,
			matchingDataURI: fp.canvasWebgl.matchingDataURI,
			matchingUnmasked: fp.canvasWebgl.matchingUnmasked,
			specs: fp.canvasWebgl.specs,
			unmasked: fp.canvasWebgl.unmasked,
			unmasked2: fp.canvasWebgl.unmasked2
		},
		maths: !fp.maths || fp.maths.lied ? undefined : fp.maths,
		consoleErrors: fp.consoleErrors,
		iframeContentWindowVersion: fp.iframeContentWindowVersion,
		htmlElementVersion: fp.htmlElementVersion,
		cssStyleDeclarationVersion: fp.cssStyleDeclarationVersion,
		// avoid random timezone fingerprint values
		timezone: !fp.timezone || fp.timezone.lied ? undefined : fp.timezone,
		clientRects: !fp.clientRects || fp.clientRects.lied ? undefined : fp.clientRects,
		offlineAudioContext: (
			isBrave ? distrust :
			!fp.offlineAudioContext || fp.offlineAudioContext.lied ? undefined :
			fp.offlineAudioContext
		),
		fonts: fp.fonts,
		trash: !!trashLen,
		lies: !('data' in fp.lies) ? false : !!liesLen,
		capturedErrors: !!errorsLen,
		voices: fp.voices
	}
	const debugLog = (message, obj) => console.log(message, JSON.stringify(obj, null, '\t'))
	
	console.log('Fingerprint (Object):', creep)
	console.log('Loose Fingerprint (Object):', fp)
	//debugLog('Loose Id (JSON):', fp)
	
	const [fpHash, creepHash] = await Promise.all([hashify(fp), hashify(creep)])
	.catch(error => { 
		console.error(error.message)
	})
	
	const { trash: hasTrash, lies: hasLied, capturedErrors: hasErrors } = creep

	//fetch(`/?math=${fp.maths.$hash}&ua=${fp.navigator.userAgent}`, { method: 'POST' })

	// fetch data from server
	const id = 'creep-browser'
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

			// trust score
			const score = (100-(
				(subIdsLen < 2 ? 0 : subIdsLen-1 < 11 ? (subIdsLen-1) * 1 : (subIdsLen-1) * 5 ) +
				(errorsLen * 5.2) +
				(trashLen * 15.5) +
				(liesLen * 31)
			)).toFixed(0)
			const template = `
				<div>
					<strong>Browser</strong>
					<div>trust score: ${
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
					}</div>
					<div>visits: ${visits}</div>
					<div>first: ${toLocaleStr(firstVisit)}
					<div>last: ${toLocaleStr(latestVisit)}</div>
					<div>persistence: ${hours} hours</div>
					<div>has trash: ${
						(''+hasTrash) == 'true' ?
						`true [${hashMini(fp.trash)}]` : 
						'false'
					}</div>
					<div>has lied: ${
						(''+hasLied) == 'true' ? 
						`true [${hashMini(fp.lies)}]` : 
						'false'
					}</div>
					<div>has errors: ${
						(''+hasErrors) == 'true' ? 
						`true [${hashMini(fp.capturedErrors)}]` : 
						'false'
					}</div>
					<div>loose fingerprints: ${subIdsLen}</div>
					<div>bot: ${subIdsLen > 10 && hours < 48 ? 'true [10 loose fingerprints within 48 hours]' : 'false'}</div>
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

	const el = document.getElementById('creep-fingerprint')
	patch(el, html`
	<div>
		<strong>Fingerprint</strong>
		<div class="trusted-fingerprint">${creepHash}</div>
		<div>loose fingerprint: ${fpHash}</div>
		<div class="time">performance: ${timeEnd} milliseconds</div>
	</div>
	`)
})()