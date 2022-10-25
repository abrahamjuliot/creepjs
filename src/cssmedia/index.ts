import { captureError } from '../errors'
import { PHANTOM_DARKNESS } from '../lies'
import { hashMini } from '../utils/crypto'
import { createTimer, logTestResult, performanceLogger, hashSlice, LowerEntropy } from '../utils/helpers'
import { HTMLNote, modal } from '../utils/html'

export default function getCSSMedia() {
	const gcd = (a, b) => b == 0 ? a : gcd(b, a % b)

	const getAspectRatio = (width, height) => {
		const r = gcd(width, height)
		const aspectRatio = `${width / r}/${height / r}`
		return aspectRatio
	}

	const query = ({ body, type, rangeStart, rangeLen }) => {
		const html = [...Array(rangeLen)].map((slot, i) => {
			i += rangeStart
			return `@media(device-${type}:${i}px){body{--device-${type}:${i};}}`
		}).join('')
		body.innerHTML = `<style>${html}</style>`
		const style = getComputedStyle(body)
		return style.getPropertyValue(`--device-${type}`).trim()
	}

	const getScreenMedia = ({ body, width, height }) => {
		let widthMatch = query({ body, type: 'width', rangeStart: width, rangeLen: 1 })
		let heightMatch = query({ body, type: 'height', rangeStart: height, rangeLen: 1 })
		if (widthMatch && heightMatch) {
			return { width, height }
		}
		const rangeLen = 1000
		;[...Array(10)].find((slot, i) => {
			if (!widthMatch) {
				widthMatch = query({ body, type: 'width', rangeStart: i * rangeLen, rangeLen })
			}
			if (!heightMatch) {
				heightMatch = query({ body, type: 'height', rangeStart: i * rangeLen, rangeLen })
			}
			return widthMatch && heightMatch
		})
		return { width: +widthMatch, height: +heightMatch }
	}

	try {
		const timer = createTimer()
		timer.start()
		const win = PHANTOM_DARKNESS.window

		const { body } = win.document
		const { width, availWidth, height, availHeight } = win.screen

		const noTaskbar = !(width - availWidth || height - availHeight)
		if (screen.width !== width || (width > 800 && noTaskbar)) {
			LowerEntropy.IFRAME_SCREEN = true
		}

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
			),
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

		const style = getComputedStyle(body)
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

		// get screen query
		const screenQuery = getScreenMedia({ body, width, height })

		logTestResult({ time: timer.stop(), test: 'css media', passed: true })
		return { mediaCSS, matchMediaCSS, screenQuery }
	} catch (error) {
		logTestResult({ test: 'css media', passed: false })
		captureError(error)
		return
	}
}


export function cssMediaHTML(fp) {
	if (!fp.css) {
		return `
		<div class="col-six undefined">
			<strong>CSS Media Queries</strong>
			<div>@media: ${HTMLNote.BLOCKED}</div>
			<div>matchMedia: ${HTMLNote.BLOCKED}</div>
			<div>touch device: ${HTMLNote.BLOCKED}</div>
			<div>screen query: ${HTMLNote.BLOCKED}</div>
		</div>`
	}
	const {
		cssMedia: data,
	} = fp
	const {
		$hash,
		mediaCSS,
		matchMediaCSS,
		screenQuery,
	} = data

	return `
	<div class="relative col-six">
		<span class="aside-note">${performanceLogger.getLog()['css media']}</span>
		<strong>CSS Media Queries</strong><span class="hash">${hashSlice($hash)}</span>
		<div>@media: ${
			!mediaCSS || !Object.keys(mediaCSS).filter((key) => !!mediaCSS[key]).length ?
			HTMLNote.BLOCKED :
			modal(
				'creep-css-media',
				`<strong>@media</strong><br><br>${Object.keys(mediaCSS).map((key) => `${key}: ${mediaCSS[key] || HTMLNote.UNSUPPORTED}`).join('<br>')}`,
				hashMini(mediaCSS),
			)
		}</div>
		<div>matchMedia: ${
			!matchMediaCSS || !Object.keys(matchMediaCSS).filter((key) => !!matchMediaCSS[key]).length ?
			HTMLNote.BLOCKED :
			modal(
				'creep-css-match-media',
				`<strong>matchMedia</strong><br><br>${Object.keys(matchMediaCSS).map((key) => `${key}: ${matchMediaCSS[key] || HTMLNote.UNSUPPORTED}`).join('<br>')}`,
				hashMini(matchMediaCSS),
			)
		}</div>
		<div>touch device: ${!mediaCSS ? HTMLNote.BLOCKED : mediaCSS['any-pointer'] == 'coarse' ? true : HTMLNote.UNKNOWN}</div>
		<div>screen query: <span class="${(LowerEntropy.SCREEN || LowerEntropy.IFRAME_SCREEN) ? 'bold-fail ' : ''}">
			${!screenQuery ? HTMLNote.BLOCKED : `${screenQuery.width} x ${screenQuery.height}`}
		</span></div>
	</div>
	`
}
