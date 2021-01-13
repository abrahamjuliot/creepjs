const gcd = (a, b) => b == 0 ? a : gcd(b, a%b)

const getAspectRatio = (width, height) => {
	const r = gcd(width, height)
	const aspectRatio = `${width/r}/${height/r}`
	return aspectRatio
}

const query = ({ body, type, rangeStart, rangeLen }) => {
	body.innerHTML = `
		<style>
			${[...Array(rangeLen)].map((slot,i) => {
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
			resWidth = query({ body, type: 'width', rangeStart: i*1000, rangeLen: 1000})
			if (resWidth) {
				widthMatched = resWidth
			}
		}
		if (!heightMatched) {
			resHeight = query({ body, type: 'height', rangeStart: i*1000, rangeLen: 1000})
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
			let rangeStart = i*1000
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
			let rangeStart = i*1000
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

export const getCSSMedia = imports => {

	const {
		require: {
			captureError,
			phantomDarkness,
			logTestResult
		}
	} = imports

	return new Promise(async resolve => {
		try {
			const start = performance.now()
			const win = phantomDarkness.window
			
			const { body } = win.document
			const { width, height } = win.screen
			
			const deviceAspectRatio = getAspectRatio(width, height)
			body.innerHTML = `
			<style>
			/* device */
			@media (prefers-reduced-motion: no-preference) {body {--prefers-reduced-motion: no-preference;}}
			@media (prefers-reduced-motion: reduce) {body {--prefers-reduced-motion: reduce;}}

			@media (prefers-color-scheme: light) {body {--prefers-color-scheme: light;}}
			@media (prefers-color-scheme: dark) {body {--prefers-color-scheme: dark;}}
			
			@media (monochrome) {body {--monochrome: monochrome;}}
			@media (monochrome: 0) {body {--monochrome: non-monochrome;}}

			@media (inverted-colors: inverted) {body {--inverted-colors: inverted;}}
			@media (inverted-colors: none) {body {--inverted-colors: none;}}

			@media (forced-colors: none) {body {--forced-colors: none;}}
			@media (forced-colors: active) {body {--forced-colors: active;}}

			/* input mechanisms */
			@media (any-hover: hover) {body {--any-hover: hover;}}
			@media (any-hover: none) {body {--any-hover: none;}}
			
			@media (hover: hover) {body {--hover: hover;}}
			@media (hover: none) {body {--hover: none;}}
			
			@media (any-pointer: fine) {body {--any-pointer: fine;}}
			@media (any-pointer: coarse) {body {--any-pointer: coarse;}}
			@media (any-pointer: none) {body {--any-pointer: none;}}
			
			@media (pointer: fine) {body {--pointer: fine;}}
			@media (pointer: coarse) {body {--pointer: coarse;}}
			@media (pointer: none) {body {--pointer: none;}}

			@media (device-aspect-ratio: ${deviceAspectRatio}) {body {--device-aspect-ratio: ${deviceAspectRatio};}}
			@media (device-width: ${width}px) and (device-height: ${height}px) {body {--device-screen: ${width} x ${height};}}
			@media (display-mode: fullscreen) {body {--display-mode: fullscreen;}}
			@media (display-mode: standalone) {body {--display-mode: standalone;}}
			@media (display-mode: minimal-ui) {body {--display-mode: minimal-ui;}}
			@media (display-mode: browser) {body {--display-mode: browser;}}

			@media (color-gamut: srgb) {body {--color-gamut: srgb;}}
			@media (color-gamut: p3) {body {--color-gamut: p3;}}
			@media (color-gamut: rec2020) {body {--color-gamut: rec2020;}}

			@media (orientation: landscape) {body {--orientation: landscape;}}
			@media (orientation: portrait) {body {--orientation: portrait;}}

			</style>
			`
			const matchMediaCSS = {
				reducedMotion: (
					win.matchMedia('(prefers-reduced-motion: no-preference)').matches ?
					'no-preference' :
					win.matchMedia('(prefers-reduced-motion: reduce)').matches ?
					'reduce' : undefined
				),
				colorScheme: (
					win.matchMedia('(prefers-color-scheme: light)').matches ?
					'light' :
					win.matchMedia('(prefers-color-scheme: dark)').matches ?
					'dark' : undefined
				),
				monochrome: (
					win.matchMedia('(monochrome)').matches ?
					'monochrome' :
					win.matchMedia('(monochrome: 0)').matches ?
					'non-monochrome' : undefined
				),
				invertedColors: (
					win.matchMedia('(inverted-colors: inverted)').matches ?
					'inverted' :
					win.matchMedia('(inverted-colors: none)').matches ?
					'none' : undefined
				),
				forcedColors: (
					win.matchMedia('(forced-colors: none)').matches ?
					'none' :
					win.matchMedia('(forced-colors: active)').matches ?
					'active' : undefined
				),
				anyHover: (
					win.matchMedia('(any-hover: hover)').matches ?
					'hover' :
					win.matchMedia('(any-hover: none)').matches ?
					'none' : undefined
				),
				hover: (
					win.matchMedia('(hover: hover)').matches ?
					'hover' :
					win.matchMedia('(hover: none)').matches ?
					'none' : undefined
				),
				anyPointer: (
					win.matchMedia('(any-pointer: fine)').matches ?
					'fine' :
					win.matchMedia('(any-pointer: coarse)').matches ?
					'coarse' :
					win.matchMedia('(any-pointer: none)').matches ?
					'none' : undefined
				),
				pointer: (
					win.matchMedia('(pointer: fine)').matches ?
					'fine' :
					win.matchMedia('(pointer: coarse)').matches ?
					'coarse' :
					win.matchMedia('(pointer: none)').matches ?
					'none' : undefined
				),
				deviceAspectRatio: (
					win.matchMedia(`(device-aspect-ratio: ${deviceAspectRatio})`).matches ?
					deviceAspectRatio : undefined
				),
				deviceScreen: (
					win.matchMedia(`(device-width: ${width}px) and (device-height: ${height}px)`).matches ?
					`${width} x ${height}` : undefined
				),
				displayMode: (
					win.matchMedia('(display-mode: fullscreen)').matches ?
					'fullscreen' :
					win.matchMedia('(display-mode: standalone)').matches ?
					'standalone' :
					win.matchMedia('(display-mode: minimal-ui)').matches ?
					'minimal-ui' :
					win.matchMedia('(display-mode: browser)').matches ?
					'browser' : undefined
				),
				colorGamut: (
					win.matchMedia('(color-gamut: srgb)').matches ?
					'srgb' :
					win.matchMedia('(color-gamut: p3)').matches ?
					'p3' :
					win.matchMedia('(color-gamut: rec2020)').matches ?
					'rec2020' : undefined
				),
				orientation: (
					win.matchMedia('(orientation: landscape)').matches ?
					'landscape' :
					win.matchMedia('(orientation: portrait)').matches ?
					'portrait' : undefined
				),
				screenQuery: getScreenMatchMedia(win)
			}

			const style = getComputedStyle(body)
			const mediaCSS = {
				reducedMotion: style.getPropertyValue('--prefers-reduced-motion').trim() || undefined,
				colorScheme: style.getPropertyValue('--prefers-color-scheme').trim() || undefined,
				monochrome: style.getPropertyValue('--monochrome').trim() || undefined,
				invertedColors: style.getPropertyValue('--inverted-colors').trim() || undefined,
				forcedColors: style.getPropertyValue('--forced-colors').trim() || undefined,
				anyHover: style.getPropertyValue('--any-hover').trim() || undefined,
				hover: style.getPropertyValue('--hover').trim() || undefined,
				anyPointer: style.getPropertyValue('--any-pointer').trim() || undefined,
				pointer: style.getPropertyValue('--pointer').trim() || undefined,
				deviceAspectRatio: style.getPropertyValue('--device-aspect-ratio').trim() || undefined,
				deviceScreen: style.getPropertyValue('--device-screen').trim() || undefined,
				displayMode: style.getPropertyValue('--display-mode').trim() || undefined,
				colorGamut: style.getPropertyValue('--color-gamut').trim() || undefined,
				orientation: style.getPropertyValue('--orientation').trim() || undefined,
				screenQuery: getScreenMedia(body)
			}

			logTestResult({ start, test: 'css media', passed: true })
			return resolve({ mediaCSS, matchMediaCSS })
		}
		catch (error) {
			logTestResult({ test: 'css media', passed: false })
			captureError(error)
			return resolve()
		}
	})
}