const gcd = (a, b) => b == 0 ? a : gcd(b, a % b)

const getAspectRatio = (width, height) => {
	const r = gcd(width, height)
	const aspectRatio = `${width / r}/${height / r}`
	return aspectRatio
}

const query = ({ body, type, rangeStart, rangeLen }) => {
	body.innerHTML = `
		<style>
			${[...Array(rangeLen)].map((slot, i) => {
		i += rangeStart
		return `@media(device-${type}:${i}px){body{--device-${type}:${i};}}`
	}).join('')}
		</style>
	`
	const style = getComputedStyle(body)
	return style.getPropertyValue(`--device-${type}`).trim()
}

const getScreenMedia = body => {
	let i, widthMatched, heightMatched
	for (i = 0; i < 10; i++) {
		let resWidth, resHeight
		if (!widthMatched) {
			resWidth = query({ body, type: 'width', rangeStart: i * 1000, rangeLen: 1000 })
			if (resWidth) {
				widthMatched = resWidth
			}
		}
		if (!heightMatched) {
			resHeight = query({ body, type: 'height', rangeStart: i * 1000, rangeLen: 1000 })
			if (resHeight) {
				heightMatched = resHeight
			}
		}
		if (widthMatched && heightMatched) {
			break
		}
	}
	return { width: +widthMatched, height: +heightMatched }
}

const getScreenMatchMedia = win => {
	let widthMatched, heightMatched
	for (let i = 0; i < 10; i++) {
		let resWidth, resHeight
		if (!widthMatched) {
			let rangeStart = i * 1000
			const rangeLen = 1000
			for (let i = 0; i < rangeLen; i++) {
				if (win.matchMedia(`(device-width:${rangeStart}px)`).matches) {
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
				if (win.matchMedia(`(device-height:${rangeStart}px)`).matches) {
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

const getCSSDataURI = x => `data:text/css,body {${x}}`

export const getCSSMedia = async imports => {

	const {
		require: {
			captureError,
			phantomDarkness,
			logTestResult,
			isFirefox
		}
	} = imports

	try {
		const start = performance.now()
		const win = phantomDarkness.window

		const { body } = win.document
		const { width, height } = win.screen

		const deviceAspectRatio = getAspectRatio(width, height)

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
		}

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
		`

		let style = getComputedStyle(body)
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
		}

		let importCSS

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
			`
			style = getComputedStyle(body)
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
			}
		}

		// get screen query
		let screenQuery = getScreenMedia(body)

		logTestResult({ start, test: 'css media', passed: true })
		return { importCSS, mediaCSS, matchMediaCSS, screenQuery }
	}
	catch (error) {
		logTestResult({ test: 'css media', passed: false })
		captureError(error)
		return
	}
}



export const cssMediaHTML = ({ fp, modal, note, hashMini, hashSlice }) => {
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
	} = fp
	const {
		$hash,
		importCSS,
		mediaCSS,
		matchMediaCSS,
		screenQuery
	} = data

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
}