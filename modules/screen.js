import { captureError } from './captureErrors.js'
import { createTimer, hashSlice, IS_GECKO, logTestResult, performanceLogger } from './helpers.js'
import { html, HTMLNote, patch } from './html.js'
import { lieProps, documentLie } from './lies.js'

export default async function getScreen(log = true) {
	try {
		const timer = createTimer()
		timer.start()
		let lied = (
			lieProps['Screen.width'] ||
			lieProps['Screen.height'] ||
			lieProps['Screen.availWidth'] ||
			lieProps['Screen.availHeight'] ||
			lieProps['Screen.colorDepth'] ||
			lieProps['Screen.pixelDepth']
		) || false

		const s = (window.screen || {})
		const {
			width,
			height,
			availWidth,
			availHeight,
			colorDepth,
			pixelDepth,
		} = s

		const dpr = window.devicePixelRatio || undefined
		const firefoxWithHighDPR = IS_GECKO && (dpr != 1)
		if (!firefoxWithHighDPR) {
			// firefox with high dpr requires floating point precision dimensions
			const matchMediaLie = !matchMedia(
				`(device-width: ${s.width}px) and (device-height: ${s.height}px)`,
			).matches
			if (matchMediaLie) {
				lied = true
				documentLie('Screen', 'failed matchMedia')
			}
		}

		const data = {
			width,
			height,
			availWidth,
			availHeight,
			colorDepth,
			pixelDepth,
			lied,
		}

		log && logTestResult({ time: timer.stop(), test: 'screen', passed: true })
		return { ...data }
	} catch (error) {
		log && logTestResult({ test: 'screen', passed: false })
		captureError(error)
		return
	}
}

export function screenHTML(fp) {
	if (!fp.screen) {
		return `
		<div class="col-six undefined">
			<strong>Screen</strong>
			<div>...screen: ${HTMLNote.BLOCKED}</div>
			<div>....avail: ${HTMLNote.BLOCKED}</div>
			<div>depth: ${HTMLNote.BLOCKED}</div>
			<div>viewport: ${HTMLNote.BLOCKED}</div>
			<div class="screen-container"></div>
		</div>`
	}
	const {
		screen: data,
	} = fp
	const { $hash } = data || {}
	const perf = performanceLogger.getLog().screen

	const paintScreen = (event) => {
		const el = document.getElementById('creep-resize')
		if (!el) {
			return
		}
		removeEventListener('resize', paintScreen)
		return getScreen(false).then((data) => {
			requestAnimationFrame(
				() => patch(el, html`${resizeHTML(({ data, $hash, perf, paintScreen }))}`),
			)
		})
	}

	const resizeHTML = ({ data, $hash, perf, paintScreen }) => {
		const {
			width,
			height,
			availWidth,
			availHeight,
			colorDepth,
			pixelDepth,
			lied,
		} = data


		addEventListener('resize', paintScreen)

		const s = (window.screen || {})
		const { orientation } = s
		const { type: orientationType } = orientation || {}
		const dpr = window.devicePixelRatio || undefined
		const { width: vVWidth, height: vVHeight } = (window.visualViewport || {})
		const mediaOrientation = !window.matchMedia ? undefined : (
			matchMedia('(orientation: landscape)').matches ? 'landscape' :
				matchMedia('(orientation: portrait)').matches ? 'portrait' : undefined
		)
		const displayMode = !window.matchMedia ? undefined : (
			matchMedia('(display-mode: fullscreen)').matches ? 'fullscreen' :
				matchMedia('(display-mode: standalone)').matches ? 'standalone' :
					matchMedia('(display-mode: minimal-ui)').matches ? 'minimal-ui' :
						matchMedia('(display-mode: browser)').matches ? 'browser' : undefined
		)

		const getDeviceDimensions = (width, height, diameter = 180) => {
			const aspectRatio = width / height
			const isPortrait = height > width
			const deviceWidth = isPortrait ? diameter * aspectRatio : diameter
			const deviceHeight = isPortrait ? diameter : diameter / aspectRatio
			return { deviceWidth, deviceHeight }
		}
		// const { deviceWidth, deviceHeight } = getDeviceDimensions(width, height)
		const { deviceWidth: deviceInnerWidth, deviceHeight: deviceInnerHeight } = getDeviceDimensions(innerWidth, innerHeight)
		const toFix = (n, nFix) => {
			const d = +(1+[...Array(nFix)].map((x) => 0).join(''))
			return Math.round(n*d)/d
		}
		const viewportTitle = `Window.outerWidth\nWindow.outerHeight\nWindow.innerWidth\nWindow.innerHeight\nVisualViewport.width\nVisualViewport.height\nWindow.matchMedia()\nScreenOrientation.type\nWindow.devicePixelRatio`
		return `
			<div id="creep-resize" class="relative col-six${lied ? ' rejected' : ''}">
				<span class="time">${perf}</span>
				<strong>Screen</strong><span class="${lied ? 'lies ' : ''}hash">${hashSlice($hash)}</span>
				<div class="help" title="Screen.width\nScreen.height">...screen: ${width} x ${height}</div>
				<div class="help" title="Screen.availWidth\nScreen.availHeight">....avail: ${availWidth} x ${availHeight}</div>
				<div class="help" title="Screen.colorDepth\nScreen.pixelDepth">depth: ${colorDepth}|${pixelDepth}</div>
				<div class="help" title="${viewportTitle}">viewport:</div>
				<div class="screen-container relative help" title="${viewportTitle}">
					<style>
						.screen-frame { width:${deviceInnerWidth}px;height:${deviceInnerHeight}px; }
						.screen-outer-w,
						.screen-outer-h,
						.screen-inner-w,
						.screen-inner-h,
						.screen-visual-w,
						.screen-visual-h,
						.screen-display-mode,
						.screen-media-orientation,
						.screen-orientation-type,
						.screen-dpr {
							position: absolute;
							font-size: 12px !important;
							border-radius: 3px;
							padding: 0 3px;
							margin: 3px 0;
							z-index: 1;
						}
						.screen-outer-w,
						.screen-inner-w,
						.screen-visual-w,
						.screen-display-mode,
						.screen-media-orientation,
						.screen-orientation-type,
						.screen-dpr, {
							text-align: center;
						}
						.screen-outer-h,
						.screen-inner-h,
						.screen-visual-h,
						.screen-display-mode,
						.screen-media-orientation,
						.screen-orientation-type,
						.screen-dpr {
							line-height: 216px; /* this is derived from the container height*/
						}
						.screen-outer-h,
						.screen-inner-h,
						.screen-visual-h {
							left: 0;
						}
						.screen-outer-w,
						.screen-outer-h {
							top: -29px;
						}
						.screen-inner-w,
						.screen-inner-h {
							top: -17px;
						}
						.screen-visual-w,
						.screen-visual-h {
							top: -5px;
						}

						.screen-display-mode {
							top: -31px;
						}
						.screen-media-orientation {
							top: -19px;
						}
						.screen-orientation-type {
							top: -7px;
						}
						.screen-dpr {
							top: 5px;
						}

					</style>
					<span class="screen-outer-w">${outerWidth}</span>
					<span class="screen-inner-w">${innerWidth}</span>
					<span class="screen-visual-w">${toFix(vVWidth, 6)}</span>
					<span class="screen-outer-h">${outerHeight}</span>
					<span class="screen-inner-h">${innerHeight}</span>
					<span class="screen-visual-h">${toFix(vVHeight, 6)}</span>
					<span class="screen-display-mode">${displayMode}</span>
					<span class="screen-media-orientation">${mediaOrientation}</span>
					<span class="screen-orientation-type">${orientationType}</span>
					<span class="screen-dpr">${dpr}</span>
					<div class="screen-frame relative">
						<div class="screen-glass"></div>
					</div>
				</div>
			</div>
			`
	}


	return `
	${resizeHTML({ data, $hash, perf, paintScreen })}
	`
}
