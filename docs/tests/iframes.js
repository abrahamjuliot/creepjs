(async () => {
	const hashMini = str => {
		if (typeof str == 'number') {
			return str
		}
		else if (!str || JSON.stringify(str) == '{}') {
			return 'undefined'
		}
		const json = `${JSON.stringify(str)}`
		let i, len, hash = 0x811c9dc5
		for (i = 0, len = json.length; i < len; i++) {
			hash = Math.imul(31, hash) + json.charCodeAt(i) | 0
		}
		return ('0000000' + (hash >>> 0).toString(16)).substr(-8)
	}

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

	const isBrave = 'brave' in navigator
	const decryptUserAgent = ({ ua, os, isBrave }) => {
		const apple = /ipad|iphone|ipod|ios|mac/ig.test(os)
		const isOpera = /OPR\//g.test(ua)
		const isVivaldi = /Vivaldi/g.test(ua)
		const isDuckDuckGo = /DuckDuckGo/g.test(ua)
		const isYandex = /YaBrowser/g.test(ua)
		const paleMoon = ua.match(/(palemoon)\/(\d+)./i)
		const edge = ua.match(/(edgios|edg|edge|edga)\/(\d+)./i)
		const edgios = edge && /edgios/i.test(edge[1])
		const chromium = ua.match(/(crios|chrome)\/(\d+)./i)
		const firefox = ua.match(/(fxios|firefox)\/(\d+)./i)
		const likeSafari = (
			/AppleWebKit/g.test(ua) &&
			/Safari/g.test(ua)
		)
		const safari = (
			likeSafari &&
			!firefox &&
			!chromium &&
			!edge &&
			ua.match(/(version)\/(\d+)\.(\d|\.)+\s(mobile|safari)/i)
		)

		if (chromium) {
			const browser = chromium[1]
			const version = chromium[2]
			const like = (
				isOpera ? ' Opera' :
					isVivaldi ? ' Vivaldi' :
						isDuckDuckGo ? ' DuckDuckGo' :
							isYandex ? ' Yandex' :
								edge ? ' Edge' :
									isBrave ? ' Brave' : ''
			)
			return `${browser} ${version}${like}`
		} else if (edgios) {
			const browser = edge[1]
			const version = edge[2]
			return `${browser} ${version}`
		} else if (firefox) {
			const browser = paleMoon ? paleMoon[1] : firefox[1]
			const version = paleMoon ? paleMoon[2] : firefox[2]
			return `${browser} ${version}`
		} else if (apple && safari) {
			const browser = 'Safari'
			const version = safari[2]
			return `${browser} ${version}`
		}
		return 'unknown'
	}

	const ghost = () => `
	height: 100vh;
	width: 100vw;
	position: absolute;
	left:-10000px;
	visibility: hidden;
`

	const getRandomValues = () => {
		const id = [...crypto.getRandomValues(new Uint32Array(10))]
			.map(n => n.toString(36)).join('')
		return id
	}

	const wait = ms => {
		const start = new Date().getTime()
		let end = start
		while (end < start + ms) {
			end = new Date().getTime()
		}
		return
	}

	const getIframeWindowVersion = iframeWindow => {
		return new Promise(async resolve => {
			try {
				const keys = Object.getOwnPropertyNames(iframeWindow)
				const moz = keys.filter(key => (/moz/i).test(key)).length
				const webkit = keys.filter(key => (/webkit/i).test(key)).length
				const apple = keys.filter(key => (/apple/i).test(key)).length
				const data = { keys, apple, moz, webkit }
				const $hash = await hashify(data)
				return resolve($hash)
			}
			catch (error) {
				console.error(error)
				return resolve()
			}
		})
	}

	// get feature data
	const webapp = 'https://script.google.com/macros/s/AKfycbw26MLaK1PwIGzUiStwweOeVfl-sEmIxFIs5Ax7LMoP1Cuw-s0llN-aJYS7F8vxQuVG-A/exec'
	const samples = await fetch(webapp)
		.then(response => response.json())
		.catch(error => {
			console.error(error)
			return
		})
	const { window: windowSamples } = samples || {}

	const hashMapFeatures = Object.keys(windowSamples).reduce((acc, key) => {
		const version = windowSamples[key]
		const ids = version.reduce((acc, fp) => {
			acc[fp.id] = key
			return acc
		}, {})
		acc = { ...acc, ...ids }
		return acc
	}, {})

	const getData = async frameWindow => {
		if (!frameWindow) {
			return
		}

		const uaReported = '' + frameWindow.navigator.userAgent
		const hash = await getIframeWindowVersion(frameWindow).catch(error => console.error(error))

		delete frameWindow.navigator.userAgent

		const { userAgent, platform } = frameWindow.navigator || {}

		let canvasData
		try {
			const canvas = frameWindow.document.createElement('canvas')
			canvasData = canvas.toDataURL()
		} catch (error) { }

		return {
			uaReported: uaReported ? hashMini(uaReported) : undefined,
			verReported: uaReported ? decryptUserAgent({ ua: uaReported, os: getOS(uaReported), isBrave }) : undefined,
			uaRestored: userAgent ? hashMini(userAgent) : undefined,
			verRestored: userAgent ? decryptUserAgent({ ua: userAgent, os: getOS(userAgent), isBrave }) : undefined,
			features: hashMapFeatures[hash] ? hashMapFeatures[hash] : hashMini(hash),
			platform,
			canvas: canvasData ? hashMini(canvasData) : undefined,
		}
	}

	const getIframeContentWindow = async () => {
		try {
			const iframe = document.createElement('iframe')
			const id = getRandomValues()
			iframe.setAttribute('id', id)
			document.body.appendChild(iframe)
			if (!iframe || !iframe.parentNode) {
				return
			}
			const data = await getData(iframe.contentWindow)
			iframe.parentNode.removeChild(iframe)
			return data
		}
		catch (error) {
			console.error(error)
			return
		}
	}

	const getIframeContentWindowNested = async () => {
		try {
			const iframe = document.createElement('iframe')
			iframe.setAttribute('id', getRandomValues())
			iframe.setAttribute('style', ghost())
			document.body.appendChild(iframe)
			if (!iframe || !iframe.parentNode) {
				return
			}
			const win = iframe.contentWindow
			const iframe2 = win.document.createElement('iframe')
			win.document.body.appendChild(iframe2)
			const data = await getData(iframe2.contentWindow)
			iframe.parentNode.removeChild(iframe)
			return data
		}
		catch (error) {
			console.error(error)
			return
		}
	}

	const getIframeWindow = async ({ kill }) => {
		try {
			const numberOfIframes = window.length
			const div = document.createElement('div')
			div.setAttribute('style', 'display:none')
			document.body.appendChild(div)
			div.innerHTML = `<div style="${ghost()}"><iframe></iframe></div>`
			const iframeWindow = window[numberOfIframes]
			if (kill) {
				div.parentNode.removeChild(div)
				const data = await getData(iframeWindow)
				return data
			}
			const data = await getData(iframeWindow)
			div.parentNode.removeChild(div)
			return data
		}
		catch (error) {
			console.error(error)
			return
		}
	}

	const getRejectedIframe = async () => {
		try {
			const iframe = document.createElement('iframe')
			iframe.setAttribute('style', 'display:none')
			iframe.src = `about:${getRandomValues()}`
			wait(10) // let the src error
			document.body.append(iframe)
			const data = await getData(iframe.contentWindow)
			iframe.parentNode.removeChild(iframe)
			return data
		} catch (error) {
			console.error(error)
			return
		}
	}

	const getFragmentIframe = async () => {
		try {
			const fragment = new DocumentFragment()
			const iframe = document.createElement('iframe')
			iframe.setAttribute('style', 'display:none')
			fragment.append(iframe)
			document.body.append(fragment)
			const data = await getData(iframe.contentWindow)
			iframe.parentNode.removeChild(iframe)
			return data
		} catch (error) {
			console.error(error)
			return
		}
	}

	const getSameSourceIframe = async () => {
		try {
			const iframe = document.createElement('iframe')
			iframe.setAttribute('style', 'display:none')
			iframe.src = location.href
			document.body.append(iframe)
			const data = await getData(iframe.contentWindow)
			iframe.parentNode.removeChild(iframe)
			return data
		} catch (error) {
			console.error(error)
			return
		}
	}

	const start = performance.now()
	const [
		windowFrame,
		iframeContentWindow,
		iframeContentWindowNested,
		iframeWindow,
		deadIframeWindow,
		rejectedIframe,
		fragmentIframe,
		sameSourceIframe
	] = await Promise.all([
		getData(window),
		getIframeContentWindow(),
		getIframeContentWindowNested(),
		getIframeWindow({ kill: false }),
		getIframeWindow({ kill: true }),
		getRejectedIframe(),
		getFragmentIframe(),
		getSameSourceIframe()
	]).catch(error => console.error(error))

	const perf = performance.now() - start

	console.table({
		windowFrame,
		iframeContentWindow,
		iframeContentWindowNested,
		iframeWindow,
		deadIframeWindow,
		rejectedIframe,
		fragmentIframe,
		sameSourceIframe
	})

	const contexts = [
		windowFrame,
		iframeContentWindow,
		iframeContentWindowNested,
		iframeWindow,
		deadIframeWindow,
		rejectedIframe,
		fragmentIframe,
		sameSourceIframe
	]

	const contextLabels = [
		'window',
		'contentWindow',
		'nested',
		'window[n]',
		'dead',
		'rejected url',
		'fragment',
		'same origin'
	]

	const label = {
		context: 'context',
		uaReported: 'reported ua',
		verReported: 'reported ver',
		uaRestored: 'restored ua',
		verRestored: 'restored ver',
		features: 'features',
		platform: 'platform',
		canvas: 'canvas'
	}

	const isContentWindowValid = () => {
		try {
			HTMLIFrameElement.prototype.contentWindow
			// new (Object.getOwnPropertyDescriptor(HTMLIFrameElement.prototype, 'contentWindow').get) // 'not a constructor' TypeError
			return false
		}
		catch (error) {
			if (error.constructor.name != 'TypeError') {
				return false
			}
			return true
		}
	}

	const isContentWindowNotProxyLike = () => {
		try {
			const iframe = document.createElement('iframe')
			/*// test
			const proxy = new Proxy(window, {
				get(target, key) {
					return Reflect.get(target, key)
				}
			})
			Object.defineProperty(iframe, 'contentWindow', {
				get() {
					return proxy
				}
			})*/
			if (iframe.contentWindow + '' != 'null') {
				return false
			}
			Object.create(iframe.contentWindow).toString()
			return false
		}
		catch (error) {
			if (error.constructor.name != 'TypeError') {
				return false
			}
			return true
		}
	}

	const appendChildHasValidNewError = () => {
		try {
			new Element.prototype.appendChild
			return false
		}
		catch (error) {
			if (error.constructor.name != 'TypeError') {
				return false
			}
			return true
		}
	}

	const appendChildHasValidClassExtendsError = () => {
		try {
			class Fake extends Element.prototype.appendChild { }
			return false
		}
		catch (error) {
			if (error.constructor.name != 'TypeError') {
				return false
			}
			else if (!/not a constructor/i.test(error.message)) {
				return false
			}
			return true
		}
	}

	const valid = {
		pass: (str) => `<span class="pass">&#10004; ${str}</span>`,
		fail: (str) => `<span class="fail">&#10006; ${str}</span>`,
		passed: true,
		contentWindowErrors: isContentWindowValid(),
		contentWindowProxy: isContentWindowNotProxyLike(),
		appendChildErrors: appendChildHasValidNewError() && appendChildHasValidClassExtendsError(),
		uaReported: true,
		verReported: true,
		uaRestored: true,
		verRestored: true,
		features: true,
		platform: true,
		canvas: true,
		connection: true
	}

	const el = document.getElementById('fingerprint-data')
	patch(el, html`
	<div id="fingerprint-data">
		<div class="visitor-info">
			<span class="aside-note">${perf.toFixed(2)}ms</span>
			<strong>&lt;iframe&gt;</strong>
		</div>
		<div>
			<table>
				<thead>
					<tr>
					<th>${label.context}</th>
					<th>${label.uaReported}</th>
					<th>${label.verReported}</th>
					<th>${label.uaRestored}</th>
					<th>${label.verRestored}</th>
					<th>${label.features}</th>
					<th>${label.platform}</th>
					<th>${label.canvas}</th>
					</tr>
				</thead>
				<tbody>
					${(() => {
			let uaBase, verBase, platformBase, canvasBase
			return contexts.map((context, i) => {
				const { uaReported, verReported, uaRestored, verRestored, features, platform, canvas } = context || {}
				
				// set base values
				if (i == 0) {
					uaBase = uaReported
					verBase = verReported
					platformBase = platform
					canvasBase = canvas
				}

				const validUAReported = uaReported == uaBase
				if (uaReported && !validUAReported) {
					valid.uaReported = false
				}

				const validVerReported = verReported == verBase
				if (verReported && !validVerReported) {
					valid.verReported = false
				}

				const validUARestored = uaRestored == uaReported && uaRestored == uaBase
				if (uaRestored && !validUARestored) {
					valid.uaRestored = false
				}

				const validVerRestored = verRestored == verReported && verRestored == verBase
				if (verRestored && !validVerRestored) {
					valid.verRestored = false
				}

				const knownVersion = /\s/.test(features) && /\d/.test(features)
				const featuresVersion = (/\d+/.exec(features)||[])[0]
				const baseVersion = (/\d+/.exec(verBase)||[])[0]
				const validFeatures = (
					baseVersion >= (+featuresVersion-1) &&
					baseVersion <= (+featuresVersion+1)
				)

				if (knownVersion && !validFeatures) {
					valid.features = false
				}

				const validPlatform = platform == platformBase
				if (platform && !validPlatform) {
					valid.platform = false
				}
				const validCanvas = canvas == canvasBase
				if (canvas && !validCanvas) {
					valid.canvas = false
				}

				const validConnection = !!context
				if (
					contextLabels[i] != 'dead' &&
					contextLabels[i] != 'rejected url' &&
					!validConnection
				) {
					valid.connection = false
				}

				// re-confirm passing
				if (valid.passed) {
					valid.passed = (
						valid.contentWindowErrors &&
						valid.contentWindowProxy &&
						valid.appendChildErrors &&
						valid.uaReported &&
						valid.verReported &&
						valid.uaRestored &&
						valid.verRestored &&
						valid.features &&
						valid.platform &&
						valid.canvas &&
						valid.connection
					)
				}

				return `
								<tr>
									<td class="${
					valid.contentWindowErrors && valid.contentWindowProxy && valid.appendChildErrors ? '' : 'lies'
					}" data-label="${label.context}">${contextLabels[i]}</td>
									<td class="${
					!uaReported ? 'undefined' : !validUAReported ? 'lies' : ''
					}" data-label="${label.uaReported}">${uaReported}</td>
									<td class="${
					!verReported ? 'undefined' : !validVerReported ? 'lies' : ''
					}" data-label="${label.verReported}">${verReported}</td>
									<td class="${
					!uaRestored ? 'undefined' : !validUARestored ? 'lies' : ''
					}" data-label="${label.uaRestored}">${uaRestored}</td>
									<td class="${
					!verRestored ? 'undefined' : !validVerRestored ? 'lies' : ''
					}" data-label="${label.verRestored}">${verRestored}</td>
									<td class="${
					!features ? 'undefined' : !valid.features ? 'lies' : ''
					}" data-label="${label.features}">${features}</td>
									<td class="${
					!platform ? 'undefined' : !validPlatform ? 'lies' : ''
					}" data-label="${label.platform}">${platform}</td>
									<td class="${
					!canvas ? 'undefined' : !validCanvas ? 'lies' : ''
					}" data-label="${label.canvas}">${canvas}</td>
								</tr>
							`
			}).join('')
		})()}
				</tbody>
			</table>
		</div>
		<div class="test-output">
			${valid.passed ? valid.pass('passed') : (() => {
			const invalid = []
			!valid.contentWindowErrors && invalid.push(valid.fail('expect valid error message in HTMLIFrameElement.prototype.contentWindow'))
			!valid.contentWindowProxy && invalid.push(valid.fail('expect contentWindow to be null on creation (not a window Proxy)'))
			!valid.appendChildErrors && invalid.push(valid.fail('expect valid error message in Element.prototype.appendChild'))
			!valid.uaReported && invalid.push(valid.fail('expect reported userAgent to match window'))
			!valid.verReported && invalid.push(valid.fail('expect reported version to match window'))
			!valid.uaRestored && invalid.push(valid.fail('expect restored userAgent to match each reported userAgent'))
			!valid.verRestored && invalid.push(valid.fail('expect restored version to match each reported version'))
			!valid.features && invalid.push(valid.fail('expect reported window version to closely match known features version'))
			!valid.platform && invalid.push(valid.fail('expect platform to match window'))
			!valid.canvas && invalid.push(valid.fail('expect canvas to match window'))
			!valid.connection && invalid.push(valid.fail('expect connections in accepted iframes'))
			return invalid.join('<br>')
		})()}
		</div>
	</div>
`)

})()