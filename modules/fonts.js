// inspired by Lalit Patel's fontdetect.js
// https://www.lalit.org/wordpress/wp-content/uploads/2008/05/fontdetect.js?ver=0.3

const getFontsShortList = () => [
	'Droid Sans Mono', // Android
	'Geneva', // mac (not iOS)
	'Helvetica Neue', // Apple
	'Lucida Console', // Windows
	'Noto Color Emoji', // Linux
	'Roboto', // Android, Chrome OS
	'Ubuntu' // Ubuntu	
]

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
			cssFontFamily,
			captureError,
			lieProps,
			patch,
			html,
			phantomDarkness,
			logTestResult
		}
	} = imports

	
	const getPixelEmojis = ({ doc, id, emojis }) => {
		try {
			patch(doc.getElementById(id), html`
				<div id="pixel-emoji-container">
				<style>
					.pixel-emoji {
						font-family: ${cssFontFamily};
						font-size: 200px !important;
						height: auto;
						position: absolute !important;
						transform: scale(1.000999);
					}
					</style>
					${
						emojis.map(emoji => {
							return `<div class="pixel-emoji">${emoji}</div>`
						})
					}
				</div>
			`)
						
			// get emoji set and system
			const getEmojiDimensions = style => {
				return {
					width: style.inlineSize,
					height: style.blockSize
				}
			}
			
			const pattern = new Set()
			const emojiElems = [...doc.getElementsByClassName('pixel-emoji')]
			const emojiSet = emojiElems.reduce((emojiSet, el, i) => {
				const style = getComputedStyle(el)
				const emoji = emojis[i]
				const { height, width } = getEmojiDimensions(style)
				const dimensions = `${width},${height}`
				if (!pattern.has(dimensions)) {
					pattern.add(dimensions)
					emojiSet.add(emoji)
				}
				return emojiSet
			}, new Set())

			const pixelToNumber = pixels => +(pixels.replace('px', ''))
			const pixelSizeSystemSum = 0.00001 * [...pattern].map(x => {
				return x.split(',').map(x => pixelToNumber(x)).reduce((acc, x) => acc += (+x||0), 0)
			}).reduce((acc, x) => acc += x, 0)
			
			return {
				emojiSet: [...emojiSet],
				pixelSizeSystemSum
			}
		} catch (error) {
			console.error(error)
			return {
				emojiSet: [],
				pixelSizeSystemSum: 0
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
				'10.10,10.11,10.12,10.9': 'Sierra', // 10.12
				'10.10,10.11,10.9': 'El Capitan', // 10.11
				'10.10,10.9': 'Yosemite', // 10.10
				'10.9': 'Mavericks' // 10.9
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
		
		const {
			emojiSet,
			pixelSizeSystemSum,
		} = getPixelEmojis({
			doc,
			id,
			emojis: getEmojis()
		}) || {}
		
		const fontList = getFontList()
		const fontFaceLoadFonts = await getFontFaceLoadFonts(fontList)
		const platformVersion = getPlatformVersion(fontFaceLoadFonts)
		const apps = getDesktopApps(fontFaceLoadFonts)

		// detect lies
		const lied = (
			lieProps['FontFace.load'] ||
			lieProps['FontFace.family'] ||
			lieProps['FontFace.status'] ||
			lieProps['String.fromCodePoint'] ||
			lieProps['CSSStyleDeclaration.setProperty'] ||
			lieProps['CSS2Properties.setProperty']
		)

		logTestResult({ time: timer.stop(), test: 'fonts', passed: true })
		return {
			fontFaceLoadFonts,
			platformVersion,
			apps,
			emojiSet,
			pixelSizeSystemSum,
			lied
		}
	} catch (error) {
		logTestResult({ test: 'fonts', passed: false })
		captureError(error)
		return
	}
}

export const fontsHTML = ({ fp, note, modal, count, hashSlice, hashMini, formatEmojiSet, performanceLogger, cssFontFamily }) => {
	if (!fp.fonts) {
		return `
		<div class="col-six undefined">
			<strong>Fonts</strong>
			<div>load (0):</div>
			<div class="block-text-large">${note.blocked}</div>
		</div>`
	}
	const {
		fonts: {
			$hash,
			fontFaceLoadFonts,
			platformVersion,
			apps,
			emojiSet,
			pixelSizeSystemSum,
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

	const fontFaceLoadHash = hashMini(fontFaceLoadFonts)
	const blockHelpTitle = `FontFace.load()\nCSSStyleDeclaration.setProperty()\nblock-size\ninline-size\nhash: ${hashMini(emojiSet)}\n${(emojiSet||[]).map((x,i) => i && (i % 6 == 0) ? `${x}\n` : x).join('')}`
	return `
	<div class="relative col-six${lied ? ' rejected' : ''}">
		<span class="aside-note">${performanceLogger.getLog().fonts}</span>
		<strong>Fonts</strong><span class="hash">${hashSlice($hash)}</span>
		<div class="help" title="FontFace.load()">load (${fontFaceLoadFonts ? count(fontFaceLoadFonts) : '0'}/${'' + getFontList().length}): ${
			!(fontFaceLoadFonts||[]).length ? note.unknown : modal(
				'creep-fonts',
				fontFaceLoadFonts.map(font => `<span style="font-family:'${font}'">${font}</span>`).join('<br>'),
				fontFaceLoadHash
			)
		}</div>
		<div class="block-text-large help relative" title="${blockHelpTitle}">
			<div>
				${platformVersion ? `platform: ${platformVersion}` : ((fonts) => {
					return !(fonts || []).length ? '' : (
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
				${(apps || []).length ? `<br>apps: ${(apps || []).join(', ')}` : ''}
				<br><span>${pixelSizeSystemSum || note.unsupported}</span>
				<br><span class="grey jumbo" style="font-family: ${cssFontFamily}">${formatEmojiSet(emojiSet)}</span>
			</div>
		</div>
	</div>
	`
}