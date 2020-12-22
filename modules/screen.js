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
	return 'unknown'
}

export const getScreen = imports => {

	const {
		require: {
			hashify,
			captureError,
			attempt,
			sendToTrash,
			trustInteger,
			lieProps,
			phantomDarkness,
			logTestResult
		}
	} = imports
	
	return new Promise(async resolve => {
		try {
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
			
			const trusted = {0:!0, 1:!0, 4:!0, 8:!0, 15:!0, 16:!0, 24:!0, 32:!0, 48:!0}
			if (!trusted[screenColorDepth]) {
				sendToTrash('screen', `colorDepth (${screenColorDepth}) is not within set [0, 16, 24, 32]`)
			}
			
			if (!trusted[screenPixelDepth]) {
				sendToTrash('screen', `pixelDepth (${screenPixelDepth}) is not within set [0, 16, 24, 32]`)
			}

			if (screenPixelDepth != screenColorDepth) {
				sendToTrash('screen', `pixelDepth (${screenPixelDepth}) and colorDepth (${screenColorDepth}) do not match`)
			}

			const data = {
				device: getDevice(width, height),
				width: attempt(() => width ? trustInteger('width - invalid return type', width) : undefined),
				outerWidth: attempt(() => phantomOuterWidth ? trustInteger('outerWidth - invalid return type', phantomOuterWidth) : undefined),
				availWidth: attempt(() => availWidth ? trustInteger('availWidth - invalid return type', availWidth) : undefined),
				height: attempt(() => height ? trustInteger('height - invalid return type', height) : undefined),
				outerHeight: attempt(() => phantomOuterHeight ? trustInteger('outerHeight - invalid return type', phantomOuterHeight) : undefined),
				availHeight: attempt(() => availHeight ?  trustInteger('availHeight - invalid return type', availHeight) : undefined),
				colorDepth: attempt(() => colorDepth ? trustInteger('colorDepth - invalid return type', colorDepth) : undefined),
				pixelDepth: attempt(() => pixelDepth ? trustInteger('pixelDepth - invalid return type', pixelDepth) : undefined),
				lied
			}
			const $hash = await hashify(data)
			logTestResult({ test: 'screen', passed: true })
			return resolve({ ...data, $hash })
		}
		catch (error) {
			logTestResult({ test: 'screen', passed: false })
			captureError(error)
			return resolve()
		}
	})
}