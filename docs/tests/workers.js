(async () => {

	// https://stackoverflow.com/a/22429679
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


	const nonPlatformParenthesis = /\((khtml|unlike|vizio|like gec|internal dummy|org\.eclipse|openssl|ipv6|via translate|safari|cardamon).+|xt\d+\)/ig
	const parenthesis = /\((.+)\)/
	const android = /((android).+)/i
	const androidNoise = /^(linux|[a-z]|wv|mobile|[a-z]{2}(-|_)[a-z]{2}|[a-z]{2})$|windows|(rv:|trident|webview|iemobile).+/i
	const androidBuild = /build\/.+\s|\sbuild\/.+/i
	const androidRelease = /android( |-)\d+/i
	const windows = /((windows).+)/i
	const windowsNoise = /^(windows|ms(-|)office|microsoft|compatible|[a-z]|x64|[a-z]{2}(-|_)[a-z]{2}|[a-z]{2})$|(rv:|outlook|ms(-|)office|microsoft|trident|\.net|msie|httrack|media center|infopath|aol|opera|iemobile|webbrowser).+/i
	const windows64bitCPU = /w(ow|in)64/i
	const cros = /cros/i
	const crosNoise = /^([a-z]|x11|[a-z]{2}(-|_)[a-z]{2}|[a-z]{2})$|(rv:|trident).+/i
	const crosBuild = /\d+\.\d+\.\d+/i
	const linux = /linux|x11|ubuntu|debian/i
	const linuxNoise = /^([a-z]|x11|unknown|compatible|[a-z]{2}(-|_)[a-z]{2}|[a-z]{2})$|(rv:|java|oracle|\+http|http|unknown|mozilla|konqueror|valve).+/i
	const apple = /(cpu iphone|cpu os|iphone os|mac os|macos|intel os|ppc mac).+/i
	const appleNoise = /^([a-z]|macintosh|compatible|mimic|[a-z]{2}(-|_)[a-z]{2}|[a-z]{2}|rv|\d+\.\d+)$|(rv:|silk|valve).+/i
	const appleRelease = /(ppc |intel |)(mac|mac |)os (x |x|)\d+/i
	const otherOS = /((symbianos|nokia|blackberry|morphos|mac).+)|\/linux|freebsd|symbos|series \d+|win\d+|unix|hp-ux|bsdi|bsd|x86_64/i
	const extraSpace = /\s{2,}/

	const isDevice = (list, device) => list.filter(x => device.test(x)).length

	const getUserAgentPlatform = ({ userAgent, excludeBuild = true }) => {
		userAgent = userAgent.trim().replace(/\s{2,}/, ' ').replace(nonPlatformParenthesis, '')
		if (parenthesis.test(userAgent)) {
			const platformSection = userAgent.match(parenthesis)[0]
			const identifiers = platformSection.slice(1, -1).replace(/,/g, ';').split(';').map(x => x.trim())

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
				const other = identifiers.filter(x => otherOS.test(x))
				if (other.length) {
					return other.join(' ').trim().replace(/\s{2,}/, ' ')
				}
				return identifiers.join(' ')
			}
		} else {
			return 'unknown'
		}
	}

	/* parameter helpers */
	// https://developer.mozilla.org/en-US/docs/Web/API/EXT_texture_filter_anisotropic
	const getMaxAnisotropy = context => {
		try {
			const extension = (
				context.getExtension('EXT_texture_filter_anisotropic') ||
				context.getExtension('WEBKIT_EXT_texture_filter_anisotropic') ||
				context.getExtension('MOZ_EXT_texture_filter_anisotropic')
			)
			return context.getParameter(extension.MAX_TEXTURE_MAX_ANISOTROPY_EXT)
		} catch (error) {
			return
		}
	}

	// https://developer.mozilla.org/en-US/docs/Web/API/WEBGL_draw_buffers
	const getMaxDrawBuffers = context => {
		try {
			const extension = (
				context.getExtension('WEBGL_draw_buffers') ||
				context.getExtension('WEBKIT_WEBGL_draw_buffers') ||
				context.getExtension('MOZ_WEBGL_draw_buffers')
			)
			return context.getParameter(extension.MAX_DRAW_BUFFERS_WEBGL)
		} catch (error) {
			return
		}
	}

	// https://developer.mozilla.org/en-US/docs/Web/API/WebGLShaderPrecisionFormat/precision
	// https://developer.mozilla.org/en-US/docs/Web/API/WebGLShaderPrecisionFormat/rangeMax
	// https://developer.mozilla.org/en-US/docs/Web/API/WebGLShaderPrecisionFormat/rangeMin
	const getShaderData = (name, shader) => {
		const shaderData = {}
		try {
			for (const prop in shader) {
				const shaderPrecisionFormat = shader[prop]
				shaderData[prop] = {
					precision: shaderPrecisionFormat.precision,
					rangeMax: shaderPrecisionFormat.rangeMax,
					rangeMin: shaderPrecisionFormat.rangeMin
				}
			}
			return shaderData
		} catch (error) {
			return
		}
	}

	// https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/getShaderPrecisionFormat
	const getShaderPrecisionFormat = (context, shaderType) => {
		const props = ['LOW_FLOAT', 'MEDIUM_FLOAT', 'HIGH_FLOAT']
		const precisionFormat = {}
		try {
			props.forEach(prop => {
				precisionFormat[prop] = context.getShaderPrecisionFormat(context[shaderType], context[prop])
				return
			})
			return precisionFormat
		} catch (error) {
			return
		}
	}

	const getWebglParams = (context, type) => {
		if (!context) {
			return
		}
		// get parameters
		// https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Constants
		const version1Constants = [
			'ALIASED_LINE_WIDTH_RANGE',
			'ALIASED_POINT_SIZE_RANGE',
			'ALPHA_BITS',
			'BLUE_BITS',
			'DEPTH_BITS',
			'GREEN_BITS',
			'MAX_COMBINED_TEXTURE_IMAGE_UNITS',
			'MAX_CUBE_MAP_TEXTURE_SIZE',
			'MAX_FRAGMENT_UNIFORM_VECTORS',
			'MAX_RENDERBUFFER_SIZE',
			'MAX_TEXTURE_IMAGE_UNITS',
			'MAX_TEXTURE_SIZE',
			'MAX_VARYING_VECTORS',
			'MAX_VERTEX_ATTRIBS',
			'MAX_VERTEX_TEXTURE_IMAGE_UNITS',
			'MAX_VERTEX_UNIFORM_VECTORS',
			'MAX_VIEWPORT_DIMS',
			'RED_BITS',
			'RENDERER',
			'SHADING_LANGUAGE_VERSION',
			'STENCIL_BITS',
			'VERSION'
		]

		const version2Constants = [
			'MAX_VARYING_COMPONENTS',
			'MAX_VERTEX_UNIFORM_COMPONENTS',
			'MAX_VERTEX_UNIFORM_BLOCKS',
			'MAX_VERTEX_OUTPUT_COMPONENTS',
			'MAX_PROGRAM_TEXEL_OFFSET',
			'MAX_3D_TEXTURE_SIZE',
			'MAX_ARRAY_TEXTURE_LAYERS',
			'MAX_COLOR_ATTACHMENTS',
			'MAX_COMBINED_FRAGMENT_UNIFORM_COMPONENTS',
			'MAX_COMBINED_UNIFORM_BLOCKS',
			'MAX_COMBINED_VERTEX_UNIFORM_COMPONENTS',
			'MAX_DRAW_BUFFERS',
			'MAX_ELEMENT_INDEX',
			'MAX_FRAGMENT_INPUT_COMPONENTS',
			'MAX_FRAGMENT_UNIFORM_COMPONENTS',
			'MAX_FRAGMENT_UNIFORM_BLOCKS',
			'MAX_SAMPLES',
			'MAX_SERVER_WAIT_TIMEOUT',
			'MAX_TEXTURE_LOD_BIAS',
			'MAX_TRANSFORM_FEEDBACK_INTERLEAVED_COMPONENTS',
			'MAX_TRANSFORM_FEEDBACK_SEPARATE_ATTRIBS',
			'MAX_TRANSFORM_FEEDBACK_SEPARATE_COMPONENTS',
			'MAX_UNIFORM_BLOCK_SIZE',
			'MAX_UNIFORM_BUFFER_BINDINGS',
			'MIN_PROGRAM_TEXEL_OFFSET',
			'UNIFORM_BUFFER_OFFSET_ALIGNMENT'
		]

		const compileParameters = context => {
			try {
				const parameters = {
					ANTIALIAS: context.getContextAttributes().antialias,
					MAX_TEXTURE_MAX_ANISOTROPY_EXT: getMaxAnisotropy(context),
					MAX_DRAW_BUFFERS_WEBGL: getMaxDrawBuffers(context),
					VERTEX_SHADER: getShaderData('VERTEX_SHADER', getShaderPrecisionFormat(context, 'VERTEX_SHADER')),
					FRAGMENT_SHADER: getShaderData('FRAGMENT_SHADER', getShaderPrecisionFormat(context, 'FRAGMENT_SHADER'))
				}
				const pnames = type == 'webgl2' ? [...version1Constants, ...version2Constants] : version1Constants
				pnames.forEach(key => {
					const value = context[key]
					const result = context.getParameter(value)
					const typedArray = (
						result.constructor === Float32Array ||
						result.constructor === Int32Array
					)
					parameters[key] = typedArray ? [...result] : result
				})
				return parameters
			} catch (error) {
				console.error(error)
				return
			}
		}

		let getParameter
		try {
			getParameter = context.getParameter
		} catch (error) { }

		return !!getParameter ? compileParameters(context) : undefined
	}

	const getWorkerData = async () => {
		let canvas2d,
			webglVendor,
			webglRenderer,
			webglParams,
			webgl2Vendor,
			webgl2Renderer,
			webgl2Params
		try {
			const canvasOffscreen = new OffscreenCanvas(500, 200)
			canvasOffscreen.getContext('2d')
			const getDataURI = async () => {
				const blob = await canvasOffscreen.convertToBlob()
				const reader = new FileReader()
				reader.readAsDataURL(blob)
				return new Promise(resolve => {
					reader.onloadend = () => resolve(reader.result)
				})
			}
			canvas2d = await getDataURI()

			const canvasOffscreenWebgl = new OffscreenCanvas(256, 256)
			const contextWebgl = canvasOffscreenWebgl.getContext('webgl')
			const renererInfo = contextWebgl.getExtension('WEBGL_debug_renderer_info')
			webglVendor = contextWebgl.getParameter(renererInfo.UNMASKED_VENDOR_WEBGL)
			webglRenderer = contextWebgl.getParameter(renererInfo.UNMASKED_RENDERER_WEBGL)
			webglParams = getWebglParams(contextWebgl, 'webgl')
			try {
				const canvasOffscreenWebgl2 = new OffscreenCanvas(256, 256)
				const contextWebgl2 = canvasOffscreenWebgl2.getContext('webgl2')
				const renerer2Info = contextWebgl2.getExtension('WEBGL_debug_renderer_info')
				webgl2Vendor = contextWebgl2.getParameter(renerer2Info.UNMASKED_VENDOR_WEBGL)
				webgl2Renderer = contextWebgl2.getParameter(renerer2Info.UNMASKED_RENDERER_WEBGL)
				webgl2Params = getWebglParams(contextWebgl2, 'webgl2')
			}
			catch (error) { console.error(error) }
		}
		catch (error) { console.error(error) }

		const timezoneLocation = Intl.DateTimeFormat().resolvedOptions().timeZone
		const { deviceMemory, hardwareConcurrency, language, platform, userAgent } = navigator
		const data = {
			timezoneLocation,
			language,
			deviceMemory,
			hardwareConcurrency,
			userAgent,
			platform,
			canvas2d,
			webglVendor,
			webglRenderer,
			webglParams,
			webgl2Vendor,
			webgl2Renderer,
			webgl2Params
		}
		return data
	}

	// Tests
	const isWorker = !globalThis.document && !!globalThis.WorkerGlobalScope
	const isSharedWorker = !!globalThis.SharedWorkerGlobalScope
	const isServiceWorker = !!globalThis.ServiceWorkerGlobalScope

	// WorkerGlobalScope
	const getWorkerGlobalScope = async () => {
		const data = await getWorkerData()
		postMessage(data)
		close()
	}

	const getDedicatedWorker = phantomDarkness => {
		return new Promise(resolve => {
			try {
				if (phantomDarkness && !phantomDarkness.Worker) {
					return resolve({})
				}
				else if (
					phantomDarkness && phantomDarkness.Worker.prototype.constructor.name != 'Worker'
				) {
					throw new Error('Worker tampered with by client')
				}
				const worker = (
					phantomDarkness ? phantomDarkness.Worker : Worker
				)
				const dedicatedWorker = new worker(document.currentScript.src)
				dedicatedWorker.onmessage = message => {
					dedicatedWorker.terminate()
					return resolve(message.data)
				}
			}
			catch (error) {
				console.error(error)
				return resolve({})
			}
		})
	}

	// SharedWorkerGlobalScope
	const getSharedWorkerGlobalScope = () => {
		onconnect = async message => {
			const port = message.ports[0]
			const data = await getWorkerData()
			port.postMessage(data)
		}
	}

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
				)
				const sharedWorker = new worker(document.currentScript.src)
				sharedWorker.port.start()
				sharedWorker.port.addEventListener('message', message => {
					sharedWorker.port.close()
					return resolve(message.data)
				})
			}
			catch (error) {
				console.error(error)
				return resolve({})
			}
		})
	}

	// ServiceWorkerGlobalScope
	const getServiceWorkerGlobalScope = () => {
		const broadcast = new BroadcastChannel('creep_service')
		broadcast.onmessage = async event => {
			if (event.data && event.data.type == 'fingerprint') {
				const data = await getWorkerData()
				broadcast.postMessage(data)
			}
		}
	}

	const getServiceWorker = () => {
		return new Promise(async resolve => {
			try {
				if (!('serviceWorker' in navigator)) {
					return resolve({})
				}
				else if (navigator.serviceWorker.__proto__.constructor.name != 'ServiceWorkerContainer') {
					throw new Error('ServiceWorkerContainer tampered with by client')
				}
				navigator.serviceWorker.register(document.currentScript.src, {
					scope: '../tests/'
				}).catch(error => {
					console.error(error)
					return resolve({})
				})
				navigator.serviceWorker.ready.then(registration => {
					const broadcast = new BroadcastChannel('creep_service')
					broadcast.onmessage = message => {
						registration.unregister()
						broadcast.close()
						return resolve(message.data)
					}
					return broadcast.postMessage({ type: 'fingerprint' })
				}).catch(error => {
					console.error(error)
					return resolve({})
				})
			}
			catch (error) {
				console.error(error)
				return resolve({})
			}
		})
	}

	// WorkerGlobalScope
	if (isWorker) {
		return (
			isServiceWorker ? getServiceWorkerGlobalScope() :
				isSharedWorker ? getSharedWorkerGlobalScope() :
					getWorkerGlobalScope()
		)
	}

	// Window
	// frame 
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
	const getPhantomIframe = () => {
		try {
			const numberOfIframes = window.length
			const frag = new DocumentFragment()
			const div = document.createElement('div')
			const id = getRandomValues()
			div.setAttribute('id', id)
			frag.appendChild(div)
			div.innerHTML = `<div style="${ghost()}"><iframe></iframe></div>`
			document.body.appendChild(frag)
			const iframeWindow = window[numberOfIframes]
			return { iframeWindow, div }
		}
		catch (error) {
			console.error(error)
			return { iframeWindow: window, div: undefined }
		}
	}
	const { iframeWindow: phantomDarkness, div: parentPhantom } = getPhantomIframe()

	const [
		windowScope,
		dedicatedWorker,
		sharedWorker,
		serviceWorker
	] = await Promise.all([
		getWorkerData(),
		getDedicatedWorker(phantomDarkness),
		getSharedWorker(phantomDarkness),
		getServiceWorker()
	]).catch(error => {
		console.error(error.message)
	})

	if (parentPhantom) {
		parentPhantom.parentNode.removeChild(parentPhantom)
	}

	const json = x => JSON.stringify(x, null, '\t')
	//console.log(`\nWorker: ${json(dedicatedWorker)}`)
	//console.log(`\nSharedWorker: ${json(sharedWorker)}`)
	//console.log(`\nServiceWorker: ${json(serviceWorker)}`)

	const red = '#ca656e2b'
	const green = '#2da56821'
	const windowHash = hashMini(windowScope)
	const dedicatedHash = hashMini(dedicatedWorker)
	const sharedHash = hashMini(sharedWorker)
	const serviceHash = hashMini(serviceWorker)
	const style = (controlHash, hash) => {
		return `
		style="
			background: ${hash == 'undefined' ? '#bbbbbb1f' : hash != controlHash ? red : 'none'}
		"
	`
	}

	const el = document.getElementById('fingerprint-data')

	const workerHash = {}
	const computeTemplate = (worker, name) => {
		const { userAgent } = worker || {}
		const system = userAgent ? getOS(userAgent) : undefined
		Object.keys(worker || []).forEach(key => {
			return (
				workerHash[name] = {
					...workerHash[name],
					[key]: hashMini(worker[key])
				}
			)
		})
		const hash = workerHash[name]
		const style = `
		style="
			color: #fff;
			background: #ca656eb8;
			padding: 0 2px;
		"
	`
		if (workerHash.dedicated && hash) {
			Object.keys(hash).forEach(key => {
				if (hash[key] != workerHash.window[key]) {
					return (
						hash[key] = `<span ${style}>${hash[key]}</span>`
					)
				}
				return
			})
		}
		return hash ?
			`
	<div>deviceMemory: ${hash.deviceMemory}</div>
	<div>hardwareConcurrency: ${hash.hardwareConcurrency}</div>
	<div>userAgent: ${hash.userAgent}</div>
	<div>platform: ${hash.platform}</div>
	<div>language: ${hash.language}</div>
	<div>timezone: ${hash.timezoneLocation}</div>
	<div>canvas2d: ${hash.canvas2d}</div>
	<div>webgl renderer: ${hash.webglRenderer}</div>
	<div>webgl vendor: ${hash.webglVendor}</div>
	<div>webgl params: ${hash.webglParams}</div>
	<div>webgl2 renderer: ${hash.webgl2Renderer}</div>
	<div>webgl2 vendor: ${hash.webgl2Vendor}</div>
	<div>webgl2 params: ${hash.webgl2Params}</div>
	<div>ua version:</div>
	<div class="block-text">${
			decryptUserAgent({
				ua: userAgent,
				os: system,
				isBrave: 'brave' in navigator
			})
			} on ${system}</div>
	<div>ua device:</div>
	<div class="block-text">${
			getUserAgentPlatform({ userAgent })
			}</div> 
	` :
			`
	<div>deviceMemory:</div>
	<div>hardwareConcurrency:</div>
	<div>userAgent:</div>
	<div>platform:</div>
	<div>language:</div>
	<div>timezone:</div>
	<div>canvas2d:</div>
	<div>webgl renderer:</div>
	<div>webgl vendor:</div>
	<div>webgl params:</div>
	<div>webgl2 renderer:</div>
	<div>webgl2 vendor:</div>
	<div>webgl2 params:</div>
	<div>ua version:</div>
	<div class="block-text"></div>
	<div>ua device:</div>
	<div class="block-text"></div> 
	`
	}
	patch(el, html`
	<div id="fingerprint-data">
		<div class="flex-grid visitor-info">
			<strong>Window compared to WorkerGlobalScope</strong>
		</div>
		<div class="flex-grid">
			<div class="col-six" ${style(windowHash, windowHash)}>
				<strong>Window</strong>
				<span class="hash">${windowHash}</span>
				${computeTemplate(windowScope, 'window')}
			</div>
			<div class="col-six" ${style(windowHash, dedicatedHash)}>
				<strong>Dedicated</strong>
				<span class="hash">${dedicatedHash}</span>
				${computeTemplate(dedicatedWorker, 'dedicated')}
			</div>
		</div>
		<div class="flex-grid">
			<div class="col-six" ${style(windowHash, sharedHash)}>
				<strong>Shared</strong>
				<span class="hash">${sharedHash}</span>
				${computeTemplate(sharedWorker, 'shared')}
			</div>
			<div class="col-six" ${style(windowHash, serviceHash)}>
				<strong>Service</strong>
				<span class="hash">${serviceHash}</span>
				${computeTemplate(serviceWorker, 'service')}
			</div>
		</div>
	</div>
`)

})()
