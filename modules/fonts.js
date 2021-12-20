// inspired by Lalit Patel's fontdetect.js
// https://www.lalit.org/wordpress/wp-content/uploads/2008/05/fontdetect.js?ver=0.3

const getFontsShortList = () => [
	'Helvetica Neue', // Apple
	'Geneva', // mac (not iOS)
	'Lucida Console', // Windows
	'Noto Color Emoji', // Linux
	'Ubuntu', // Ubuntu
	'Droid Sans Mono', // Android
	'Roboto', // Android, Chrome OS
].sort()

const getAppleFonts = () => [
	'Helvetica Neue'
]

const getWindowsFonts = () => [
	'Cambria Math',
	'Lucida Console',
	'MS Serif',
	'Segoe UI',
]

const getLinuxFonts = () => [
	'Arimo', // ubuntu, chrome os
	'Cousine', // ubuntu, chrome os
	'MONO', // ubuntu, chrome os (not TB)
	'Jomolhari', // chrome os
	'Ubuntu', // ubuntu (not TB)
	'Chilanka', // ubuntu (not TB)
]

const getAndroidFonts = () => [
	'Dancing Script', // android FF
]

const getGeneralFonts = () => [
	// Windows
	'Consolas', //FF and Chrome (not TB)
	'HELV', // FF (not TB)
	'Marlett', // chrome
	// Linux 
	'Noto Sans JP', // TB linux
	// Apple
	'Arial Hebrew', // safari + chrome (not FF or TB)
	'Arial Rounded MT Bold', // not TB
	'Geneva', // mac
	'Apple Chancery', // mac (not TB)
	'Apple Color Emoji', // ios, chrome, safari (TB, not FF)
	// Android
	'Roboto', // android FF, Chrome OS
	'Droid Sans Mono', // FF android
	'Cutive Mono', // some android FF
	// Other
	'Liberation Mono', // Chrome OS
	'Noto Sans Yi', // TB on linux and windows, chrome OS, FF android, Mac
	'Monaco', // android + mac
	'Palatino', // android + mac + ios
	'Baskerville', // android + mac
	'Tahoma' // android, mac, windows (not ios, not chrome os 90)
]

const getOriginFonts = () => [
	...getAppleFonts(),
	...getWindowsFonts(),
	...getLinuxFonts(),
	...getAndroidFonts(),
	...getGeneralFonts()
].sort()

const originPixelsToInt = pixels => Math.round(2 * pixels.replace('px', ''))
const getPixelDimensions = style => {
	const transform = style.transformOrigin.split(' ')
	const perspective = style.perspectiveOrigin.split(' ')
	const dimensions = {
		transformWidth: originPixelsToInt(transform[0]),
		transformHeight: originPixelsToInt(transform[1]),
		perspectiveWidth: originPixelsToInt(perspective[0]),
		perspectiveHeight: originPixelsToInt(perspective[1])
	}
	return dimensions
}

const getPixelFonts = ({ win, id, chars, baseFonts, families }) => {
	try {
		win.document.getElementById(id).innerHTML = `
		<style>
			#${id}-detector {
				--font: '';
				position: absolute !important;
				left: -9999px!important;
				font-size: 256px !important;
				font-style: normal !important;
				font-weight: normal !important;
				letter-spacing: normal !important;
				line-break: auto !important;
				line-height: normal !important;
				text-transform: none !important;
				text-align: left !important;
				text-decoration: none !important;
				text-shadow: none !important;
				white-space: normal !important;
				word-break: normal !important;
				word-spacing: normal !important;
				/* in order to test scrollWidth, clientWidth, etc. */
				padding: 0 !important;
				margin: 0 !important;
				/* in order to test inlineSize and blockSize */
				writing-mode: horizontal-tb !important;
				/* in order to test perspective-origin */
				/* in order to test origins */
				transform-origin: unset !important;
				perspective-origin: unset !important;
			}
			#${id}-detector::after {
				font-family: var(--font);
				content: '${chars}';
			}
		</style>
		<span id="${id}-detector"></span>
	`
		const span = win.document.getElementById(`${id}-detector`)
		const detectedViaTransform = new Set()
		const detectedViaPerspective = new Set()
		const style = getComputedStyle(span)
		const base = baseFonts.reduce((acc, font) => {
			span.style.setProperty('--font', font)
			const dimensions = getPixelDimensions(style)
			acc[font] = dimensions
			return acc
		}, {})
		families.forEach(family => {
			span.style.setProperty('--font', family)
			const basefont = /, (.+)/.exec(family)[1]
			const dimensions = getPixelDimensions(style)
			const font = /\'(.+)\'/.exec(family)[1]
			if (dimensions.transformWidth != base[basefont].transformWidth ||
				dimensions.transformHeight != base[basefont].transformHeight) {
				detectedViaTransform.add(font)
			}
			if (dimensions.perspectiveWidth != base[basefont].perspectiveWidth ||
				dimensions.perspectiveHeight != base[basefont].perspectiveHeight) {
				detectedViaPerspective.add(font)
			}
			return
		})
		const fonts = {
			transform: [...detectedViaTransform],
			perspective: [...detectedViaPerspective]
		}
		return fonts
	} catch (error) {
		console.error(error)
		return {
			transform: [],
			perspective: []
		}
	}
}

const getFontFaceLoadFonts = async list => {
	try {
		const fontFaceList = list.map(font => new FontFace(font, `local("${font}")`))
		const responseCollection = await Promise
			.allSettled(fontFaceList.map(font => font.load()))
		const fonts = responseCollection.reduce((acc, font) => {
			if (font.status == 'fulfilled') {
				return [...acc, font.value.family]
			}
			return acc
		}, [])
		return fonts
	} catch (error) {
		console.error(error)
		return []
	}
}

const getPlatformVersion = async () => {
	const windowsFonts = {
		// https://docs.microsoft.com/en-us/typography/fonts/windows_11_font_list
		'7': [
			'Cambria Math',
			'Lucida Console'
		],
		'8': [
			'Aldhabi',
			'Gadugi',
			'Myanmar Text',
			'Nirmala UI'
		],
		'8.1': [
			'Leelawadee UI',
			'Javanese Text',
			'Segoe UI Emoji'
		],
		'10': [
			'HoloLens MDL2 Assets', // 10 (v1507) +
			'Segoe MDL2 Assets', // 10 (v1507) +
			'Bahnschrift', // 10 (v1709) +-
			'Ink Free', // 10 (v1803) +-
		],
		'11': ['Segoe Fluent Icons']
	}

	const macOSFonts = {
		// Mavericks and below
		'10.9': [
			'Helvetica Neue',
			'Geneva'
		],
		// Yosemite
		'10.10': [
			'Kohinoor Devanagari Medium',
			'Luminari'
		],
		// El Capitan
		'10.11': [
			'PingFang HK Light'
		],
		// Sierra: https://support.apple.com/en-ie/HT206872
		'10.12': [
			'American Typewriter Semibold',
			'Futura Bold',
			'SignPainter-HouseScript Semibold'
		],
		// High Sierra: https://support.apple.com/en-me/HT207962
		// Mojave: https://support.apple.com/en-us/HT208968
		'10.13-10.14': [
			'InaiMathi Bold'
		],
		// Catalina: https://support.apple.com/en-us/HT210192
		// Big Sur: https://support.apple.com/en-sg/HT211240
		'10.15-11': [
			'Galvji',
			'MuktaMahee Regular'
		],
		// Monterey: https://www.apple.com/my/macos/monterey/features/
		// https://apple.stackexchange.com/questions/429548/request-for-list-of-fonts-folder-contents-on-monterey
		//'12': []
	}

	const fontList = [
		...Object.keys(windowsFonts).map(key => windowsFonts[key]).flat(),
		...Object.keys(macOSFonts).map(key => macOSFonts[key]).flat()
	]
	const fontFaceList = fontList.map(font => new FontFace(font, `local("${font}")`))
	const responseCollection = await Promise.allSettled(fontFaceList.map(font => font.load()))
	const fonts = responseCollection.reduce((acc, font) => {
		return font.status == 'fulfilled' ? [...acc, font.value.family] : acc
	}, [])

	const getWindows = fonts => {
		const fontVersion = {
			['11']: windowsFonts['11'].find(x => fonts.includes(x)),
			['10']: windowsFonts['10'].find(x => fonts.includes(x)),
			['8.1']: windowsFonts['8.1'].find(x => fonts.includes(x)),
			['8']: windowsFonts['8'].find(x => fonts.includes(x)),
			// require complete set of Windows 7 fonts
			['7']: windowsFonts['7'].filter(x => fonts.includes(x)).length == windowsFonts['7'].length
		}
		const hash = (
			'' + Object.keys(fontVersion).sort().filter(key => !!fontVersion[key])
		)
		const hashMap = {
			'10,11,7,8,8.1': '11',
			'10,7,8,8.1': '10',
			'7,8,8.1': '8.1',
			'11,7,8,8.1': '8.1', // missing 10
			'7,8': '8',
			'10,7,8': '8', // missing 8.1
			'10,11,7,8': '8', // missing 8.1
			'7': '7',
			'7,8.1': '7',
			'10,7,8.1': '7', // missing 8
			'10,11,7,8.1': '7', // missing 8
		}
		const version = hashMap[hash]
		return version ? `Windows ${version}` : undefined
	}

	const getMacOS = fonts => {
		const fontVersion = {
			['10.15-11']: macOSFonts['10.15-11'].find(x => fonts.includes(x)),
			['10.13-10.14']: macOSFonts['10.13-10.14'].find(x => fonts.includes(x)),
			['10.12']: macOSFonts['10.12'].find(x => fonts.includes(x)),
			['10.11']: macOSFonts['10.11'].find(x => fonts.includes(x)),
			['10.10']: macOSFonts['10.10'].find(x => fonts.includes(x)),
			// require complete set of 10.9 fonts
			['10.9']: macOSFonts['10.9'].filter(x => fonts.includes(x)).length == macOSFonts['10.9'].length
		}
		const hash = (
			'' + Object.keys(fontVersion).sort().filter(key => !!fontVersion[key])
		)
		const hashMap = {
			'10.10,10.11,10.12,10.13-10.14,10.15-11,10.9': '10.15-11',
			'10.10,10.11,10.12,10.13-10.14,10.9': '10.13-10.14',
			'10.10,10.11,10.12,10.9': '10.12',
			'10.10,10.11,10.9': '10.11',
			'10.10,10.9': '10.10',
			'10.9': '10.9'
		}
		const version = hashMap[hash]
		return version ? `macOS ${version}` : undefined
	}

	return {
		fonts,
		version: getWindows(fonts) || getMacOS(fonts)
	}
}


export const getFonts = async imports => {

	const {
		require: {
			captureError,
			lieProps,
			phantomDarkness,
			logTestResult
		}
	} = imports

	try {
		await new Promise(setTimeout).catch(e => { })
		const start = performance.now()
		const win = phantomDarkness ? phantomDarkness : window
		const doc = win.document

		const id = `font-fingerprint`
		const div = doc.createElement('div')
		div.setAttribute('id', id)
		doc.body.appendChild(div)
		const originFontsList = getOriginFonts()
		const baseFonts = ['monospace', 'sans-serif', 'serif']
		const families = originFontsList.reduce((acc, font) => {
			baseFonts.forEach(baseFont => acc.push(`'${font}', ${baseFont}`))
			return acc
		}, [])

		const pixelFonts = getPixelFonts({
			win,
			id,
			chars: `mmmmmmmmmmlli`,
			baseFonts,
			families
		})

		const compressToList = fontObject => Object.keys(fontObject).reduce((acc, key) => {
			return [...acc, ...fontObject[key]]
		}, [])

		const [
			fontFaceLoadFonts,
			platformVersion
		] = await Promise.all([
			getFontFaceLoadFonts(getFontsShortList()),
			getPlatformVersion()
		])
		//console.log(platformVersion.version)
		//console.log(platformVersion.fonts.join('\n'))
		const originFonts = [...new Set(compressToList(pixelFonts))]

		logTestResult({ start, test: 'fonts', passed: true })
		return {
			fontFaceLoadFonts,
			pixelFonts,
			originFonts,
			platformVersion: (platformVersion||{}).version,
			platformFonts: (platformVersion||{}).fonts
		}
	} catch (error) {
		logTestResult({ test: 'fonts', passed: false })
		captureError(error)
		return
	}

}

export const fontsHTML = ({ fp, note, modal, count, hashSlice, hashMini }) => {
	if (!fp.fonts) {
		return `
		<div class="col-six undefined">
			<strong>Fonts</strong>
			<div>version: ${note.blocked}</div>
			<div>origin (0): ${note.blocked}</div>
			<div>load (0):</div>
			<div class="block-text">${note.blocked}</div>
		</div>`
	}
	const {
		fonts: {
			$hash,
			fontFaceLoadFonts,
			originFonts,
			platformVersion
		}
	} = fp

	const apple = new Set(getAppleFonts())
	const linux = new Set(getLinuxFonts())
	const windows = new Set(getWindowsFonts())
	const android = new Set(getAndroidFonts())

	const systemClass = [...originFonts.reduce((acc, font) => {
		if (!acc.has('Apple') && apple.has(font)) {
			acc.add('Apple')
			return acc
		}
		if (!acc.has('Linux') && linux.has(font)) {
			acc.add('Linux')
			return acc
		}
		if (!acc.has('Windows') && windows.has(font)) {
			acc.add('Windows')
			return acc
		}
		if (!acc.has('Android') && android.has(font)) {
			acc.add('Android')
			return acc
		}
		return acc
	}, new Set())]
	const chromeOnAndroid = (
		'' + ((originFonts || []).sort()) == 'Baskerville,Monaco,Palatino,Tahoma'
	)
	if (!systemClass.length && chromeOnAndroid) {
		systemClass.push('Android')
	}
	const icon = {
		'Linux': '<span class="icon linux"></span>',
		'Apple': '<span class="icon apple"></span>',
		'Windows': '<span class="icon windows"></span>',
		'Android': '<span class="icon android"></span>',
		'CrOS': '<span class="icon cros"></span>'
	}
	const systemClassIcons = systemClass.map(name => icon[name])
	const originHash = hashMini(originFonts)

	const systemMap = {
		'Lucida Console': [icon.Windows, 'Windows'],
		'Arimo': [icon.Linux, 'Linux'],
		'Noto Color Emoji': [icon.Linux, 'Linux'],
		'Noto Color Emoji,Ubuntu': [icon.Linux, 'Linux Ubuntu'],
		'Noto Color Emoji,Roboto': [icon.CrOS, 'Chrome OS'],
		'Droid Sans Mono,Roboto': [icon.Android, 'Android'],
		'Droid Sans Mono,Noto Color Emoji,Roboto': [`${icon.Linux}${icon.Android}`, 'Linux Android'],
		'Helvetica Neue': [icon.Apple, 'iOS'],
		'Geneva,Helvetica Neue': [icon.Apple, 'Mac']
	}

	const fontFaceLoadFontsString = '' + (fontFaceLoadFonts.sort())
	const system = systemMap[fontFaceLoadFontsString]

	return `
	<div class="col-six">
		<strong>Fonts</strong><span class="hash">${hashSlice($hash)}</span>
		<div>version: ${platformVersion || note.unknown}</div>
		<div class="help" title="CSSStyleDeclaration.setProperty()\ntransform-origin\nperspective-origin">origin (${originFonts ? count(originFonts) : '0'}/${'' + getOriginFonts().length}): ${
		originFonts.length ? modal(
			'creep-fonts', originFonts.map(font => `<span style="font-family:'${font}'">${font}</span>`).join('<br>'),
			`${systemClass.length ? `${systemClassIcons.join('')}${originHash}` : originHash}`
		) : note.unknown
		}</div>
		<div class="help" title="FontFace.load()">load (${fontFaceLoadFonts ? count(fontFaceLoadFonts) : '0'}/${'' + getFontsShortList().length}): ${
		system ? system[1] : ''
		}</div>
		<div class="block-text">
			<div>${
		fontFaceLoadFonts.length ? `${system ? system[0] : ''}${fontFaceLoadFontsString}` :
			note.unknown
		}</div>
		</div>
	</div>
	`
}