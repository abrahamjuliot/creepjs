export const getScreen = async imports => {

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
			availLeft,
			availTop,
			availWidth,
			availHeight,
			colorDepth,
			pixelDepth,
			orientation
		} = s
		const { type: orientationType } = orientation || {}

		const { height: vVHeight, width: vVWidth } = visualViewport || {}
		
		const matchMediaLie = (
			!matchMedia(
				`(device-width: ${s.width}px) and (device-height: ${s.height}px)`
			).matches
		)
		if (matchMediaLie) {
			lied = true
			documentLie('Screen', 'failed matchMedia')
		}
		
		const data = {
			width,
			outerWidth,
			availWidth,
			vVWidth,
			height,
			outerHeight,
			availHeight,
			vVHeight,
			availLeft,
			availTop,
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

		logTestResult({ time: timer.stop(), test: 'screen', passed: true })
		return { ...data }
	}
	catch (error) {
		logTestResult({ test: 'screen', passed: false })
		captureError(error)
		return
	}
}

export const screenHTML = ({ fp, note, hashSlice, performanceLogger }) => {
	if (!fp.screen) {
		return `
		<div class="col-six undefined">
			<strong>Screen</strong>
			<div>width: ${note.blocked}</div>
			<div>outerWidth: ${note.blocked}</div>
			<div>availWidth: ${note.blocked}</div>
			<div>height: ${note.blocked}</div>
			<div>outerHeight: ${note.blocked}</div>
			<div>availHeight: ${note.blocked}</div>
			<div>colorDepth: ${note.blocked}</div>
			<div>pixelDepth: ${note.blocked}</div>
		</div>
		<div class="col-six screen-container">
		</div>`
	}
	const {
		screen: data
	} = fp
	const {
		device,
		width,
		outerWidth,
		availWidth,
		height,
		outerHeight,
		availHeight,
		colorDepth,
		pixelDepth,
		$hash,
		lied
	} = data
	const getDeviceDimensions = (width, height, diameter = 180) => {
		const aspectRatio = width / height
		const isPortrait = height > width
		const deviceHeight = isPortrait ? diameter : diameter / aspectRatio
		const deviceWidth = isPortrait ? diameter * aspectRatio : diameter
		return { deviceHeight, deviceWidth }
	}
	const { deviceHeight, deviceWidth } = getDeviceDimensions(width, height)
	return `
	<span class="time">${performanceLogger.getLog().screen}</span>
	<div class="col-six${lied ? ' rejected' : ''}">
		<strong>Screen</strong><span class="${lied ? 'lies ' : ''}hash">${hashSlice($hash)}</span>
		<div>width: ${width ? width : note.blocked}</div>
		<div>outerWidth: ${outerWidth ? outerWidth : note.blocked}</div>
		<div>availWidth: ${availWidth ? availWidth : note.blocked}</div>
		<div>height: ${height ? height : note.blocked}</div>
		<div>outerHeight: ${outerHeight ? outerHeight : note.blocked}</div>
		<div>availHeight: ${availHeight ? availHeight : note.blocked}</div>
		<div>colorDepth: ${colorDepth ? colorDepth : note.blocked}</div>
		<div>pixelDepth: ${pixelDepth ? pixelDepth : note.blocked}</div>
	</div>
	<div class="col-six screen-container${lied ? ' rejected' : ''}">
		<style>.screen-frame { width:${deviceWidth}px;height:${deviceHeight}px; }</style>
		<div class="screen-frame">
			<div class="screen-glass"></div>
		</div>
	</div>
	`
}