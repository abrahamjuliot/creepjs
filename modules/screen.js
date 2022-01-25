export const getScreen = async (imports, logger = true) => {

	const {
		require: {
			queueEvent,
			createTimer,
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

		const s = (screen || {})
		const {
			width,
			height,
			availWidth,
			availHeight,
			colorDepth,
			pixelDepth,
			orientation
		} = s
		const { type: orientationType } = orientation || {}
		const { width: vVWidth, height: vVHeight } = visualViewport || {}
		
		const matchMediaLie = !matchMedia(
			`(device-width: ${s.width}px) and (device-height: ${s.height}px)`
		).matches
		if (matchMediaLie) {
			lied = true
			documentLie('Screen', 'failed matchMedia')
		}
		
		const data = {
			width,
			height,
			availWidth,
			availHeight,
			outerWidth,
			outerHeight,
			innerWidth,
			innerHeight,
			vVWidth,
			vVHeight,
			colorDepth,
			pixelDepth,
			orientationType,
			orientation: (
				matchMedia('(orientation: landscape)').matches ? 'landscape' :
					matchMedia('(orientation: portrait)').matches ? 'portrait' : undefined
			),
			displayMode: (
				matchMedia('(display-mode: fullscreen)').matches ? 'fullscreen' :
					matchMedia('(display-mode: standalone)').matches ? 'standalone' :
						matchMedia('(display-mode: minimal-ui)').matches ? 'minimal-ui' :
							matchMedia('(display-mode: browser)').matches ? 'browser' : undefined
			),
			devicePixelRatio,
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
			<div>....outer: ${note.blocked}</div>
			<div>....inner: ${note.blocked}</div>
			<div>...visual: ${note.blocked}</div>
			<div>orientation: ${note.blocked}</div>
			<div>type: ${note.blocked}</div>
			<div>depth: ${note.blocked}</div>
			<div>dpr: ${note.blocked}</div>
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
			outerWidth,
			outerHeight,
			innerWidth,
			innerHeight,
			vVWidth,
			vVHeight,
			colorDepth,
			pixelDepth,
			orientationType,
			orientation,
			devicePixelRatio,
			lied,
		} = data

		const getDeviceDimensions = (width, height, diameter = 180) => {
			const aspectRatio = width / height
			const isPortrait = height > width
			const deviceWidth = isPortrait ? diameter * aspectRatio : diameter
			const deviceHeight = isPortrait ? diameter : diameter / aspectRatio
			return { deviceWidth, deviceHeight }
		}
		const { deviceWidth, deviceHeight } = getDeviceDimensions(width, height)
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
				<div>....outer: ${outerWidth} x ${outerHeight}</div>
				<div>....inner: ${innerWidth} x ${innerHeight}</div>
				<div>...visual: ${toFix(vVWidth, 6)} x ${toFix(vVHeight, 6)}</div>
				<div>orientation: ${orientation}</div>
				<div>type: ${orientationType}</div>
				<div>depth: ${colorDepth}|${pixelDepth}</div>
				<div>dpr: ${devicePixelRatio}</div>
				<div>viewport:</div>
				<div class="screen-container">
					<style>
						.screen-frame { width:${deviceInnerWidth}px;height:${deviceInnerHeight}px; }
					</style>
					<div class="screen-frame">
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