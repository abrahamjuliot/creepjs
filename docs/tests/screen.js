(async () => {

	const hashMini = str => {
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

	const query = ({ type, rangeStart, rangeLen }) => {
		const el = document.getElementById('fingerprint-data')
		patch(el, html`
		<div id="fingerprint-data">
			<style>
				${[...Array(rangeLen)].map((slot, i) => {
			i += rangeStart
			return `@media(device-${type}:${i}px){body{--device-${type}:${i};}}`
		}).join('')}
			</style>
		</div>
	`)
		const style = getComputedStyle(document.body)
		return style.getPropertyValue(`--device-${type}`).trim()
	}

	const getScreenMedia = () => {
		let i, widthMatched, heightMatched
		for (i = 0; i < 10; i++) {
			let resWidth, resHeight
			if (!widthMatched) {
				resWidth = query({ type: 'width', rangeStart: i * 1000, rangeLen: 1000 })
				if (resWidth) {
					widthMatched = resWidth
				}
			}
			if (!heightMatched) {
				resHeight = query({ type: 'height', rangeStart: i * 1000, rangeLen: 1000 })
				if (resHeight) {
					heightMatched = resHeight
				}
			}
			if (widthMatched && heightMatched) {
				break
			}
		}
		return { width: widthMatched, height: heightMatched }
	}

	const getScreenMatchMedia = () => {
		let widthMatched, heightMatched
		for (let i = 0; i < 10; i++) {
			let resWidth, resHeight
			if (!widthMatched) {
				let rangeStart = i * 1000
				const rangeLen = 1000
				for (let i = 0; i < rangeLen; i++) {
					if (matchMedia(`(device-width:${rangeStart}px)`).matches) {
						resWidth = rangeStart
						break
					}
					rangeStart++
				}
				if (resWidth) {
					widthMatched = resWidth
				}
			}
			if (!heightMatched) {
				let rangeStart = i * 1000
				const rangeLen = 1000
				for (let i = 0; i < rangeLen; i++) {
					if (matchMedia(`(device-height:${rangeStart}px)`).matches) {
						resHeight = rangeStart
						break
					}
					rangeStart++
				}
				if (resHeight) {
					heightMatched = resHeight
				}
			}
			if (widthMatched && heightMatched) {
				break
			}
		}
		return { width: widthMatched, height: heightMatched }
	}

	const getCSS = () => {
		const gcd = (a, b) => b == 0 ? a : gcd(b, a % b)
		const { innerWidth, innerHeight } = window
		const { width: screenWidth, height: screenHeight } = screen
		const ratio = gcd(innerWidth, innerHeight)
		const screenRatio = gcd(screenWidth, screenHeight)
		const aspectRatio = `${innerWidth / ratio}/${innerHeight / ratio}`
		const deviceAspectRatio = `${screenWidth / screenRatio}/${screenHeight / screenRatio}`
		const el = document.getElementById('fingerprint-data')
		patch(el, html`
		<div id="fingerprint-data">
			<style>
				body {
					width: 100vw;
					height: 100vh;
				}
				@media (width: ${innerWidth}px) and (height: ${innerHeight}px) {
					body {--viewport: ${innerWidth} x ${innerHeight};}
				}
				@media (min-width: ${innerWidth}px) and (min-height: ${innerHeight}px) {
					body {--viewport: ${innerWidth} x ${innerHeight};}
				}
				@media (max-width: ${innerWidth}px) and (max-height: ${innerHeight}px) {
					body {--viewport: ${innerWidth} x ${innerHeight};}
				}
				@media (aspect-ratio: ${aspectRatio}) {
					body {--viewport-aspect-ratio: ${aspectRatio};}
				}
				@media (device-aspect-ratio: ${deviceAspectRatio}) {
					body {--device-aspect-ratio: ${deviceAspectRatio};}
				}
				@media (device-width: ${screenWidth}px) and (device-height: ${screenHeight}px) {
					body {--device-screen: ${screenWidth} x ${screenHeight};}
				}
				@media (display-mode: fullscreen) {body {--display-mode: fullscreen;}}
				@media (display-mode: standalone) {body {--display-mode: standalone;}}
				@media (display-mode: minimal-ui) {body {--display-mode: minimal-ui;}}
				@media (display-mode: browser) {body {--display-mode: browser;}}
				@media (orientation: landscape) {body {--orientation: landscape;}}
				@media (orientation: portrait) {body {--orientation: portrait;}}
			</style>
		</div>
	`)
		const { width: domRectWidth, height: domRectHeight } = document.body.getBoundingClientRect()
		const style = getComputedStyle(document.body)
		return {
			domRectViewport: [domRectWidth, domRectHeight],
			viewport: style.getPropertyValue('--viewport').trim() || undefined,
			viewportAspectRatio: style.getPropertyValue('--viewport-aspect-ratio').trim() || undefined,
			deviceAspectRatio: style.getPropertyValue('--device-aspect-ratio').trim() || undefined,
			deviceScreen: style.getPropertyValue('--device-screen').trim() || undefined,
			orientation: style.getPropertyValue('--orientation').trim() || undefined,
			displayMode: style.getPropertyValue('--display-mode').trim() || undefined
		}
	}

	const start = performance.now()

	const {
		width,
		height,
		availWidth,
		availHeight,
		colorDepth,
		pixelDepth,
	} = screen

	const {
		clientHeight,
		clientWidth
	} = document.documentElement

	const { type: orientationType } = screen.orientation || {}

	const vViewport = 'visualViewport' in window ? visualViewport : {}
	const { width: viewportWidth, height: viewportHeight } = vViewport
	const { width: mediaWidth, height: mediaHeight } = getScreenMedia()
	const { width: matchMediaWidth, height: matchMediaHeight } = getScreenMatchMedia()
	const {
		domRectViewport,
		viewport,
		viewportAspectRatio,
		deviceAspectRatio,
		deviceScreen,
		orientation,
		displayMode
	} = getCSS()

	const style = (a, b) => b.map((char, i) => char != a[i] ? `<span class="bold-fail">${char}</span>` : char).join('')
	const note = {
		unsupported: '<span class="blocked">unsupported</span>',
		blocked: '<span class="blocked">blocked</span>',
		lied: '<span class="lies">lied</span>'
	}
	const pad = x => x.padStart(22, '.')
	const fake = () => `<span class="fake">fake screen</span>`
	const el = document.getElementById('fingerprint-data')
	patch(el, html`
	<div id="fingerprint-data">
		<style>
			#fingerprint-data > .jumbo {
				font-size: 32px;
			}
			.fake {
				color: #ca656e;
				background: #ca656e0d;
				border-radius: 2px;
				margin: 0 5px;
				padding: 1px 3px;
			}
			
			.bold-fail {
				color: #ca656e;
				font-weight: bold;
			}
		</style>
		<div class="visitor-info">
			<strong>Screen</strong>
		</div>
		<div class="jumbo">
			<div>${hashMini({ mediaWidth, mediaHeight })}</div>
		</div>
		<div class="flex-grid">
			<div class="col-six relative">
				<span class="aside-note">${(performance.now() - start).toFixed(2)}ms</span>
				<br>
				<div>${pad('@media search')}: ${
		mediaWidth && mediaHeight ? `${'' + mediaWidth} x ${'' + mediaHeight}` : '<span class="fake">failed</span>'
		}</div>
				<div>${pad('matchMedia search')}: ${
		matchMediaWidth && matchMediaHeight ? `${'' + matchMediaWidth} x ${'' + matchMediaHeight}` : '<span class="fake">failed</span>'
		}</div>

				<div>${pad('@media device')}: ${deviceScreen ? '' + deviceScreen : '<span class="fake">failed</span>'}</div>
				
				<div>${pad('device-aspect-ratio')}: ${deviceAspectRatio ? '' + deviceAspectRatio : '<span class="fake">failed</span>'}</div>
				<div>${pad('aspect-ratio')}: ${'' + viewportAspectRatio}</div>

				<div>${pad('screen')}: ${
		style(('' + mediaWidth).split(''), ('' + width).split(''))} x ${style(('' + mediaHeight).split(''), ('' + height).split(''))
		}</div>
				
				<div>${pad('avail')}: ${'' + availWidth} x ${'' + availHeight}${
		availWidth > width || availHeight > height ? '<span class="fake">out of bounds</span>' : ''
		}</div>
				<div>${pad('client')}: 
				${
		style(('' + Math.round(domRectViewport[0])).split(''), ('' + clientWidth).split(''))
		} x ${'' + clientHeight}
				${
		clientWidth > width || clientHeight > height ? '<span class="fake">out of bounds</span>' : ''
		}</div>
				<div>${pad('inner')}: 
				${
		style(('' + Math.round(domRectViewport[0])).split(''), ('' + innerWidth).split(''))
		} x ${'' + innerHeight}
				${
		innerWidth > width || innerHeight > height ? '<span class="fake">out of bounds</span>' : ''
		}</div>
				<div>${pad('outer')}: ${'' + outerWidth} x ${'' + outerHeight}${
		outerWidth > width ? '<span class="fake">out of bounds</span>' : ''
		}</div>

				
				<div>${pad('@media viewport')}: ${'' + viewport}</div>
				<div>${pad('dom rect viewport')}: ${'' + domRectViewport.join(' x ')}</div>
				<div>${pad('visualViewport')}: ${viewportWidth && viewportHeight ? `${'' + viewportWidth} x ${'' + viewportHeight}` : note.unsupported}</div>

				<div>${pad('colorDepth')}: ${'' + colorDepth}</div>
				<div>${pad('pixelDepth')}: ${'' + pixelDepth}</div>
				<div>${pad('devicePixelRatio')}: ${'' + devicePixelRatio}</div>
				<div>${pad('orientation type')}: ${'' + orientationType}</div>
				<div>${pad('@media orientation')}: ${'' + orientation}</div>
				<div>${pad('@media display-mode')}: ${'' + displayMode}</div>

			</div>
		</div>
	</div>
`)

})()