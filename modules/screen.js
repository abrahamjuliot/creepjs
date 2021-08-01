// screen (allow some discrepancies otherwise lie detection triggers at random)

const getDevice = (width, height) => {
	// https://gs.statcounter.com/screen-resolution-stats/
	const resolution = [
		{ width: 360, height: 640, device: 'phone'},
		{ width: 360, height: 720, device: 'phone'},
		{ width: 360, height: 740, device: 'phone'},
		{ width: 360, height: 760, device: 'phone'},
		{ width: 360, height: 780, device: 'phone'},
		{ width: 375, height: 667, device: 'phone'},
		{ width: 375, height: 812, device: 'phone'},
		{ width: 412, height: 732, device: 'phone'},
		{ width: 412, height: 846, device: 'phone'},
		{ width: 412, height: 869, device: 'phone'},
		{ width: 412, height: 892, device: 'phone'},
		{ width: 414, height: 736, device: 'phone'},
		{ width: 414, height: 896, device: 'phone'},
		{ width: 600, height: 1024, device: 'tablet'},
		{ width: 601, height: 962, device: 'tablet'},
		{ width: 768, height: 1024, device: 'desktop or tablet'},
		{ width: 800, height: 1280, device: 'desktop or tablet'},
		{ width: 834, height: 1112, device: 'desktop or tablet'},
		{ width: 962, height: 601, device: 'tablet'},
		{ width: 1000, height: 700, device: 'desktop or tablet'},
		{ width: 1000, height: 1000, device: 'desktop or tablet'},
		{ width: 1024, height: 768, device: 'desktop or tablet'},
		{ width: 1024, height: 1366, device: 'desktop or tablet'},
		{ width: 1280, height: 720, device: 'desktop or tablet'},
		{ width: 1280, height: 800, device: 'desktop or tablet'},
		{ width: 1280, height: 1024, device: 'desktop'},
		{ width: 1366, height: 768, device: 'desktop'},
		{ width: 1440, height: 900, device: 'desktop'},
		{ width: 1536, height: 864, device: 'desktop'},
		{ width: 1600, height: 900, device: 'desktop'},
		{ width: 1920, height: 1080, device: 'desktop'}
	]
	for (const display of resolution) {
		if (
			width == display.width && height == display.height || (
				(display.device == 'phone' || display.device == 'tablet') &&
				height == display.width && width == display.height
			)
		) {
			return display.device
		}
	}
	return
}

export const getScreen = async imports => {

	const {
		require: {
			captureError,
			attempt,
			sendToTrash,
			trustInteger,
			lieProps,
			phantomDarkness,
			logTestResult
		}
	} = imports
	
	try {
		const start = performance.now()
		let lied = (
			lieProps['Screen.width'] ||
			lieProps['Screen.height'] ||
			lieProps['Screen.availWidth'] ||
			lieProps['Screen.availHeight'] ||
			lieProps['Screen.colorDepth'] ||
			lieProps['Screen.pixelDepth']
		) || false
		const phantomScreen = phantomDarkness ? phantomDarkness.screen : screen
		const phantomOuterWidth = phantomDarkness ? phantomDarkness.outerWidth : outerWidth
		const phantomOuterHeight = phantomDarkness ? phantomDarkness.outerHeight : outerHeight
		
		const { width, height, availWidth, availHeight, colorDepth, pixelDepth } = phantomScreen
		const {
			width: screenWidth,
			height: screenHeight,
			availWidth: screenAvailWidth,
			availHeight: screenAvailHeight,
			colorDepth: screenColorDepth,
			pixelDepth: screenPixelDepth
		} = screen

		const matching = (
			width == screenWidth &&
			height == screenHeight &&
			availWidth == screenAvailWidth &&
			availHeight == screenAvailHeight &&
			colorDepth == screenColorDepth &&
			pixelDepth == screenPixelDepth
		)

		if (!matching) {
			sendToTrash('screen', `[${
				[
					screenWidth,
					screenHeight,
					screenAvailWidth,
					screenAvailHeight,
					screenColorDepth,
					screenPixelDepth
				].join(', ')
			}] does not match iframe`)
		}

		if (screenAvailWidth > screenWidth) {
			sendToTrash('screen', `availWidth (${screenAvailWidth}) is greater than width (${screenWidth})`)
		}

		if (screenAvailHeight > screenHeight) {
			sendToTrash('screen', `availHeight (${screenAvailHeight}) is greater than height (${screenHeight})`)
		}
		
		const data = {
			device: getDevice(width, height),
			width: attempt(() => screenWidth ? trustInteger('width - invalid return type', screenWidth) : undefined),
			outerWidth: attempt(() => outerWidth ? trustInteger('outerWidth - invalid return type', outerWidth) : undefined),
			availWidth: attempt(() => screenAvailWidth ? trustInteger('availWidth - invalid return type', screenAvailWidth) : undefined),
			height: attempt(() => screenHeight ? trustInteger('height - invalid return type', screenHeight) : undefined),
			outerHeight: attempt(() => outerHeight ? trustInteger('outerHeight - invalid return type', outerHeight) : undefined),
			availHeight: attempt(() => screenAvailHeight ?  trustInteger('availHeight - invalid return type', screenAvailHeight) : undefined),
			colorDepth: attempt(() => screenColorDepth ? trustInteger('colorDepth - invalid return type', screenColorDepth) : undefined),
			pixelDepth: attempt(() => screenPixelDepth ? trustInteger('pixelDepth - invalid return type', screenPixelDepth) : undefined),
			lied
		}
		logTestResult({ start, test: 'screen', passed: true })
		return { ...data }
	}
	catch (error) {
		logTestResult({ test: 'screen', passed: false })
		captureError(error)
		return
	}
}

export const screenHTML = ({ fp, note, hashSlice }) => {
	if (!fp.screen) {
		return `
		<div class="col-six undefined">
			<strong>Screen</strong>
			<div>device: ${note.blocked}</div>
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
	<div class="col-six${lied ? ' rejected' : ''}">
		<strong>Screen</strong><span class="${lied ? 'lies ' : ''}hash">${hashSlice($hash)}</span>
		<div>device: ${device ? device : note.unknown}</div>
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