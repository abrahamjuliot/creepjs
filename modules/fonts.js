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

const getoriginFonts = () => [
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
		await new Promise(setTimeout).catch(e => {})
		const start = performance.now()
		const win = phantomDarkness ? phantomDarkness : window
		const doc = win.document
		
		const id = `font-fingerprint`
		const div = doc.createElement('div')
		div.setAttribute('id', id)
		doc.body.appendChild(div)
		const originFontsList = getoriginFonts()
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
		},[])
		
		const fontFaceLoadFonts = await getFontFaceLoadFonts(getFontsShortList())

		const originFonts = [...new Set(compressToList(pixelFonts))]

		logTestResult({ start, test: 'fonts', passed: true })
		return {
			fontFaceLoadFonts,
			pixelFonts,
			originFonts
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
			<div>origin (0): ${note.blocked}</div>
			<div>load (0):</div>
			<div class="block-text">${note.blocked}</div>
		</div>`
	}
	const {
		fonts: {
			$hash,
			fontFaceLoadFonts,
			originFonts
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
		''+((originFonts || []).sort()) == 'Baskerville,Monaco,Palatino,Tahoma'
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

	const fontFaceLoadFontsString = ''+(fontFaceLoadFonts.sort())
	const system = systemMap[fontFaceLoadFontsString] 

	return `
	<div class="col-six">
		<strong>Fonts</strong><span class="hash">${hashSlice($hash)}</span>
		<div class="help" title="CSSStyleDeclaration.setProperty()\ntransform-origin\nperspective-origin">origin (${originFonts ? count(originFonts) : '0'}/${''+getoriginFonts().length}): ${
			originFonts.length ? modal(
				'creep-fonts', originFonts.map(font => `<span style="font-family:'${font}'">${font}</span>`).join('<br>'),
				`${systemClass.length ? `${systemClassIcons.join('')}${originHash}` : originHash}`
			) : note.unknown
		}</div>
		<div class="help" title="FontFace.load()">load (${fontFaceLoadFonts ? count(fontFaceLoadFonts) : '0'}/${''+getFontsShortList().length}): ${
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