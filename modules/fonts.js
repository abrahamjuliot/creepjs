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

const getWindowsFontMap = () => ({
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
})

const getMacOSFontMap = () => ({
	// Mavericks and below
	'10.9': [
		'Helvetica Neue',
		'Geneva' // mac (not iOS)
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
})

const getDesktopAppFontMap = () => ({
	// docs.microsoft.com/en-us/typography/font-list/ms-outlook
	'Microsoft Outlook': ['MS Outlook'],
	// https://community.adobe.com/t5/postscript-discussions/zwadobef-font/m-p/3730427#M785
	'Adobe Acrobat': ['ZWAdobeF'],
	// https://wiki.documentfoundation.org/Fonts
	'LibreOffice': [
		'Amiri',
		'KACSTOffice',
		'Liberation Mono',
		'Source Code Pro'
	],
	// https://superuser.com/a/611804
	'OpenOffice': [
		'DejaVu Sans',
		'Gentium Book Basic',
		'OpenSymbol'
	]
})

const getAppleFonts = () => {
	const macOSFontMap = getMacOSFontMap()
	return Object.keys(macOSFontMap).map(key => macOSFontMap[key]).flat()
}

const getWindowsFonts = () => {
	const windowsFontMap = getWindowsFontMap()
	return Object.keys(windowsFontMap).map(key => windowsFontMap[key]).flat()
}

const getDesktopAppFonts = () => {
	const desktopAppFontMap = getDesktopAppFontMap()
	return Object.keys(desktopAppFontMap).map(key => desktopAppFontMap[key]).flat()
}

const getLinuxFonts = () => [
	'Arimo', // ubuntu, chrome os
	'Chilanka', // ubuntu (not TB)
	'Cousine', // ubuntu, chrome os
	'Jomolhari', // chrome os
	'MONO', // ubuntu, chrome os (not TB)
	'Noto Color Emoji', // Linux
	'Ubuntu', // ubuntu (not TB)
]

const getAndroidFonts = () => [
	'Dancing Script', // android
	'Droid Sans Mono', // Android
	'Roboto' // Android, Chrome OS
]

const getFontList = () => [
	...getAppleFonts(),
	...getWindowsFonts(),
	...getLinuxFonts(),
	...getAndroidFonts(),
	...getDesktopAppFonts()
].sort()

export const getFonts = async imports => {

	const {
		require: {
			queueEvent,
			createTimer,
			getEmojis,
			captureError,
			lieProps,
			patch,
			html,
			phantomDarkness,
			logTestResult
		}
	} = imports

	

	const getEmojiDimensions = style => {
		return {
			width: style.inlineSize,
			height: style.blockSize
		}
	}

	const originPixelsToNumber = pixels => +(pixels.replace('px', ''))
	const getPixelDimensions = style => {
		const transform = style.transformOrigin.split(' ')
		const perspective = style.perspectiveOrigin.split(' ')
		const dimensions = {
			transformWidth: originPixelsToNumber(transform[0]),
			transformHeight: originPixelsToNumber(transform[1]),
			perspectiveWidth: originPixelsToNumber(perspective[0]),
			perspectiveHeight: originPixelsToNumber(perspective[1])
		}
		return dimensions
	}

	const getPixelFonts = ({ doc, id, chars, baseFonts, families, emojis }) => {
		try {
			patch(doc.getElementById(id), html`
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
				<div id="pixel-emoji-container">
				<style>
					.pixel-emoji {
						font-family:
						'Segoe UI Emoji', /* Windows */
						'Apple Color Emoji', /* Apple */
						'Noto Color Emoji', /* Linux, Android, Chrome OS */
						sans-serif !important;
						font-size: 200px !important;
						height: auto;
						position: absolute !important;
						transform: scale(100);
					}
					</style>
					${
						emojis.map(emoji => {
							return `<div class="pixel-emoji">${emoji}</div>`
						})
					}
				</div>
			`)

			// get emojis
			const pattern = new Set()
			const emojiElems = [...doc.getElementsByClassName('pixel-emoji')]
			const emojiPixels = emojiElems.map((el, i) => {
				const style = getComputedStyle(el)
				const emoji = emojis[i]
				const { height, width } = getEmojiDimensions(style)
				return { emoji, width, height }
			})
			// get emoji set and system
			const emojiSet = emojiPixels.filter(emoji => {
				const dimensions = `${emoji.width}, ${emoji.heigt}`
				if (pattern.has(dimensions)) {
					return false
				}
				pattern.add(dimensions)
				return true
			})
			.map(emoji => emoji.emoji)

			// get fonts
			const span = doc.getElementById(`${id}-detector`)
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

			return {
				emojiSet,
				transform: [...detectedViaTransform],
				perspective: [...detectedViaPerspective]
			}
		} catch (error) {
			console.error(error)
			return {
				transform: [],
				perspective: []
			}
		}
	}

	const getFontFaceLoadFonts = async fontList => {
		try {
			const fontFaceList = fontList.map(font => new FontFace(font, `local("${font}")`))
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

	const getPlatformVersion = fonts => {
		const getWindows = ({ fonts, fontMap }) => {
			const fontVersion = {
				['11']: fontMap['11'].find(x => fonts.includes(x)),
				['10']: fontMap['10'].find(x => fonts.includes(x)),
				['8.1']: fontMap['8.1'].find(x => fonts.includes(x)),
				['8']: fontMap['8'].find(x => fonts.includes(x)),
				// require complete set of Windows 7 fonts
				['7']: fontMap['7'].filter(x => fonts.includes(x)).length == fontMap['7'].length
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

		const getMacOS = ({ fonts, fontMap }) => {
			const fontVersion = {
				['10.15-11']: fontMap['10.15-11'].find(x => fonts.includes(x)),
				['10.13-10.14']: fontMap['10.13-10.14'].find(x => fonts.includes(x)),
				['10.12']: fontMap['10.12'].find(x => fonts.includes(x)),
				['10.11']: fontMap['10.11'].find(x => fonts.includes(x)),
				['10.10']: fontMap['10.10'].find(x => fonts.includes(x)),
				// require complete set of 10.9 fonts
				['10.9']: fontMap['10.9'].filter(x => fonts.includes(x)).length == fontMap['10.9'].length
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

		return  (
			getWindows({ fonts, fontMap: getWindowsFontMap() }) ||
			getMacOS({ fonts, fontMap: getMacOSFontMap() })
		)
	}

	const getDesktopApps = fonts => {
		const desktopAppFontMap = getDesktopAppFontMap()
		const apps = Object.keys(desktopAppFontMap).reduce((acc, key) => {
			const appFontSet = desktopAppFontMap[key]
			const match = appFontSet.filter(x => fonts.includes(x)).length == appFontSet.length
			return match ? [...acc, key] : acc
		}, [])
		return apps
	}

	try {
		const timer = createTimer()
		await queueEvent(timer)
		const doc = (
			phantomDarkness &&
			phantomDarkness.document &&
			phantomDarkness.document.body ? phantomDarkness.document :
				document
		)
		const id = `font-fingerprint`
		const div = doc.createElement('div')
		div.setAttribute('id', id)
		doc.body.appendChild(div)
		const baseFonts = ['monospace', 'sans-serif', 'serif']
		const fontShortList = getFontsShortList()
		const families = fontShortList.reduce((acc, font) => {
			baseFonts.forEach(baseFont => acc.push(`'${font}', ${baseFont}`))
			return acc
		}, [])

		const { emojiSet, transform, perspective } = getPixelFonts({
			doc,
			id,
			chars: `mmmmmmmmmmlli`,
			baseFonts,
			families,
			emojis: getEmojis()
		}) || {}
		const pixelFonts = { transform, perspective }
		const compressToList = fontObject => Object.keys(fontObject).reduce((acc, key) => {
			return [...acc, ...fontObject[key]]
		}, [])
		const originFonts = [...new Set(compressToList(pixelFonts))]
		const fontList = getFontList()
		const fontFaceLoadFonts = await getFontFaceLoadFonts(fontList)
		const platformVersion = getPlatformVersion(fontFaceLoadFonts)
		const apps = getDesktopApps(fontFaceLoadFonts)

		// detect lies
		const lied = (
			lieProps['FontFace.load'] ||
			lieProps['FontFace.family'] ||
			lieProps['FontFace.status']
		)

		logTestResult({ time: timer.stop(), test: 'fonts', passed: true })
		return {
			fontFaceLoadFonts,
			pixelFonts,
			originFonts,
			platformVersion,
			apps,
			emojiSet,
			lied
		}
	} catch (error) {
		logTestResult({ test: 'fonts', passed: false })
		captureError(error)
		return
	}
}

export const fontsHTML = ({ fp, note, modal, count, hashSlice, hashMini, formatEmojiSet, performanceLogger }) => {
	if (!fp.fonts) {
		return `
		<div class="col-six undefined">
			<strong>Fonts</strong>
			<div>emojis: ${note.blocked}</div>
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
			platformVersion,
			apps,
			emojiSet,
			lied
		}
	} = fp

	const icon = {
		'Linux': '<span class="icon linux"></span>',
		'Apple': '<span class="icon apple"></span>',
		'Windows': '<span class="icon windows"></span>',
		'Android': '<span class="icon android"></span>',
		'CrOS': '<span class="icon cros"></span>'
	}

	const systemMap = {
		'Lucida Console': [icon.Windows, 'Windows'],
		'Arimo': [icon.Linux, 'Linux'],
		'Noto Color Emoji': [icon.Linux, 'Linux'],
		'Noto Color Emoji,Ubuntu': [icon.Linux, 'Linux Ubuntu'],
		'Noto Color Emoji,Roboto': [icon.CrOS, 'Chrome OS'],
		'Droid Sans Mono,Roboto': [icon.Android, 'Android'],
		'Droid Sans Mono,Noto Color Emoji,Roboto': [`${icon.Linux}${icon.Android}`, 'Android'], // Android on Chrome OS
		'Helvetica Neue': [icon.Apple, 'iOS'],
		'Geneva,Helvetica Neue': [icon.Apple, 'Mac']
	}

	const originFontString = ''+(originFonts.sort())
	const fontFaceLoadHash = hashMini(fontFaceLoadFonts)
	const system = systemMap[originFontString]
	const emojiHelpTitle = `CSSStyleDeclaration.setProperty()\nblock-size\ninline-size\nhash: ${hashMini(emojiSet)}\n${(emojiSet||[]).map((x,i) => i && (i % 6 == 0) ? `${x}\n` : x).join('')}`
	return `
	<div class="relative col-six${lied ? ' rejected' : ''}">
		<span class="aside-note">${performanceLogger.getLog().fonts}</span>
		<strong>Fonts</strong><span class="hash">${hashSlice($hash)}</span>
		<div class="help" title="${emojiHelpTitle}">emojis: <span class="grey">${formatEmojiSet(emojiSet)}</span></div>
		<div class="help ellipsis-all" title="CSSStyleDeclaration.setProperty()\ntransform-origin\nperspective-origin">origin (${originFonts ? count(originFonts) : '0'}/${'' + getFontsShortList().length}): ${originFontString ? `${system ? system[0] : ''}${originFontString}`: note.unknown }</div>
		<div class="help" title="FontFace.load()">load (${fontFaceLoadFonts ? count(fontFaceLoadFonts) : '0'}/${'' + getFontList().length}): ${
			!(fontFaceLoadFonts||[]).length ? note.unknown : modal(
				'creep-fonts',
				fontFaceLoadFonts.map(font => `<span style="font-family:'${font}'">${font}</span>`).join('<br>'),
				fontFaceLoadHash
			)
		}</div>
		<div class="block-text">
			<div>
				${platformVersion ? `platform version: ${platformVersion}<br>` : ((fonts) => {
					return (
						((''+fonts).match(/Lucida Console/)||[]).length ? `${icon.Windows}Lucida Console...` :
						((''+fonts).match(/Droid Sans Mono|Noto Color Emoji|Roboto/g)||[]).length == 3 ? `${icon.Linux}${icon.Android}Droid Sans Mono,Noto Color...` :
						((''+fonts).match(/Droid Sans Mono|Roboto/g)||[]).length == 2 ? `${icon.Android}Droid Sans Mono,Roboto...` :
						((''+fonts).match(/Noto Color Emoji|Roboto/g)||[]).length == 2 ? `${icon.CrOS}Noto Color Emoji,Roboto...` :
						((''+fonts).match(/Noto Color Emoji/)||[]).length ? `${icon.Linux}Noto Color Emoji...` :
						((''+fonts).match(/Arimo/)||[]).length ? `${icon.Linux}Arimo...` :
						((''+fonts).match(/Helvetica Neue/g)||[]).length == 2 ? `${icon.Apple}Helvetica Neue...` :
						`${(fonts||[])[0]}...`
					)
				})(fontFaceLoadFonts)}
				${''+apps ? `apps: ${(apps||[]).join(', ')}` : ''}
			</div>
		</div>
	</div>
	`
}