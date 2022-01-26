export const getScreen = async (imports, logger = true) => {

	const {
		require: {
			queueEvent,
			createTimer,
			isFirefox,
			captureError,
			lieProps,
			documentLie,
			logTestResult
		}
	} = imports

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
			pixelDepth
		} = s

		const dpr = window.devicePixelRatio || undefined
		const firefoxWithHighDPR = isFirefox && dpr > 1
		if (!firefoxWithHighDPR) {
			// firefox with high dpr requires floating point precision dimensions
			const matchMediaLie = !matchMedia(
				`(device-width: ${s.width}px) and (device-height: ${s.height}px)`
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
			lied
		}

		if (logger) {
			logTestResult({ time: timer.stop(), test: 'screen', passed: true })
		}
		return { ...data }
	}
	catch (error) {
		if (logger) {
			logTestResult({ test: 'screen', passed: false })
		}
		captureError(error)
		return
	}
}

export const screenHTML = ({ fp, note, hashSlice, performanceLogger, patch, html, imports }) => {
	if (!fp.screen) {
		return `
		<div class="col-six undefined">
			<strong>Screen</strong>
			<div>...screen: ${note.blocked}</div>
			<div>....avail: ${note.blocked}</div>
			<div>depth: ${note.blocked}</div>
			<div>viewport: ${note.blocked}</div>
			<div class="screen-container"></div>
		</div>`
	}
	const {
		screen: data
	} = fp
	const { $hash } = data || {}
	const perf = performanceLogger.getLog().screen
	
	const resizeHTML = ({ data, $hash, perf }) => {
		const {
			width,
			height,
			availWidth,
			availHeight,
			colorDepth,
			pixelDepth,
			lied,
		} = data

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
		//const { deviceWidth, deviceHeight } = getDeviceDimensions(width, height)
		const { deviceWidth: deviceInnerWidth, deviceHeight: deviceInnerHeight } = getDeviceDimensions(innerWidth, innerHeight)
		const toFix = (n, nFix) => {
			const d = +(1+[...Array(nFix)].map(x => 0).join(''))
			return Math.round(n*d)/d
		}
		return `
			<div id="creep-resize" class="relative col-six${lied ? ' rejected' : ''}">
				<span class="time">${perf}</span>
				<strong>Screen</strong><span class="${lied ? 'lies ' : ''}hash">${hashSlice($hash)}</span>
				<div>...screen: ${width} x ${height}</div>
				<div>....avail: ${availWidth} x ${availHeight}</div>
				<div>depth: ${colorDepth}|${pixelDepth}</div>
				<div>viewport:</div>
				<div class="screen-container relative">
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
							top: -36px;
						}
						.screen-media-orientation {
							top: -24px;
						}
						.screen-orientation-type {
							top: -12px;
						}
						.screen-dpr {
							top: 0px;
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
	addEventListener('resize', event => {
		const el = document.getElementById('creep-resize')
		if (!el) {
			return
		}
		return getScreen(imports, false).then(data => {
			patch(el, html`${resizeHTML(({ data, $hash, perf }))}`)
		})

	})
	return `
	${resizeHTML({ data, $hash, perf })}
	`
}