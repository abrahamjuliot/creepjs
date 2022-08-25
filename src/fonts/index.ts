import { captureError } from '../errors'
import { PHANTOM_DARKNESS, lieProps, getRandomValues } from '../lies'
import { sendToTrash } from '../trash'
import { hashMini } from '../utils/crypto'
import { CSS_FONT_FAMILY, createTimer, queueEvent, EMOJIS, logTestResult, performanceLogger, hashSlice, formatEmojiSet, USER_AGENT_OS } from '../utils/helpers'
import { patch, html, HTMLNote, count } from '../utils/html'
import { PlatformClassifier } from '../utils/types'

export function isFontOSBad(userAgentOS: string, fonts: string[]): boolean {
	if (!userAgentOS || !fonts || !fonts.length) return false

	const fontMap = fonts.reduce((acc, x) => {
		acc[x] = true
		return acc
	}, {} as Record<string, boolean>)

	const isLikeWindows = (
		'Cambria Math' in fontMap ||
		'Nirmala UI' in fontMap ||
		'Leelawadee UI' in fontMap ||
		'HoloLens MDL2 Assets' in fontMap ||
		'Segoe Fluent Icons' in fontMap
	)

	const isLikeApple = (
		'Helvetica Neue' in fontMap ||
		'Luminari' in fontMap ||
		'PingFang HK Light' in fontMap ||
		'Futura Bold' in fontMap ||
		'InaiMathi Bold' in fontMap ||
		'Galvji' in fontMap ||
		'Kodchasan' in fontMap
	)

	const isLikeLinux = (
		'Arimo' in fontMap ||
		'MONO' in fontMap ||
		'Ubuntu' in fontMap ||
		'Noto Color Emoji' in fontMap ||
		'Dancing Script' in fontMap ||
		'Droid Sans Mono' in fontMap ||
		'Roboto' in fontMap
	)

	if (isLikeWindows && userAgentOS != PlatformClassifier.WINDOWS) {
		return true
	} else if (isLikeApple && userAgentOS != PlatformClassifier.APPLE) {
		return true
	} else if (isLikeLinux && userAgentOS != PlatformClassifier.LINUX) {
		return true
	}
	return false
}

// inspired by Lalit Patel's fontdetect.js
// https://www.lalit.org/wordpress/wp-content/uploads/2008/05/fontdetect.js?ver=0.3
const WindowsFonts = {
	// https://docs.microsoft.com/en-us/typography/fonts/windows_11_font_list
	'7': [
		'Cambria Math',
		'Lucida Console',
	],
	'8': [
		'Aldhabi',
		'Gadugi',
		'Myanmar Text',
		'Nirmala UI',
	],
	'8.1': [
		'Leelawadee UI',
		'Javanese Text',
		'Segoe UI Emoji',
	],
	'10': [
		'HoloLens MDL2 Assets', // 10 (v1507) +
		'Segoe MDL2 Assets', // 10 (v1507) +
		'Bahnschrift', // 10 (v1709) +-
		'Ink Free', // 10 (v1803) +-
	],
	'11': ['Segoe Fluent Icons'],
}

const MacOSFonts = {
	// Mavericks and below
	'10.9': [
		'Helvetica Neue',
		'Geneva', // mac (not iOS)
	],
	// Yosemite
	'10.10': [
		'Kohinoor Devanagari Medium',
		'Luminari',
	],
	// El Capitan
	'10.11': [
		'PingFang HK Light',
	],
	// Sierra: https://support.apple.com/en-ie/HT206872
	'10.12': [
		'American Typewriter Semibold',
		'Futura Bold',
		'SignPainter-HouseScript Semibold',
	],
	// High Sierra: https://support.apple.com/en-me/HT207962
	// Mojave: https://support.apple.com/en-us/HT208968
	'10.13-10.14': [
		'InaiMathi Bold',
	],
	// Catalina: https://support.apple.com/en-us/HT210192
	// Big Sur: https://support.apple.com/en-sg/HT211240
	'10.15-11': [
		'Galvji',
		'MuktaMahee Regular',
	],
	// Monterey: https://support.apple.com/en-us/HT212587
	'12': [
		'Chakra Petch',
		'Bai Jamjuree',
	],
}

const DesktopAppFonts = {
	// docs.microsoft.com/en-us/typography/font-list/ms-outlook
	'Microsoft Outlook': ['MS Outlook'],
	// https://community.adobe.com/t5/postscript-discussions/zwadobef-font/m-p/3730427#M785
	'Adobe Acrobat': ['ZWAdobeF'],
	// https://wiki.documentfoundation.org/Fonts
	'LibreOffice': [
		'Amiri',
		'KACSTOffice',
		'Liberation Mono',
		'Source Code Pro',
	],
	// https://superuser.com/a/611804
	'OpenOffice': [
		'DejaVu Sans',
		'Gentium Book Basic',
		'OpenSymbol',
	],
}

const APPLE_FONTS = Object.keys(MacOSFonts).map((key) => MacOSFonts[key]).flat()
const WINDOWS_FONTS = Object.keys(WindowsFonts).map((key) => WindowsFonts[key]).flat()
const DESKTOP_APP_FONTS = (
		Object.keys(DesktopAppFonts).map((key) => DesktopAppFonts[key]).flat()
)
const LINUX_FONTS = [
	'Arimo', // ubuntu, chrome os
	'Chilanka', // ubuntu (not TB)
	'Cousine', // ubuntu, chrome os
	'Jomolhari', // chrome os
	'MONO', // ubuntu, chrome os (not TB)
	'Noto Color Emoji', // Linux
	'Ubuntu', // ubuntu (not TB)
]
const ANDROID_FONTS = [
	'Dancing Script', // android
	'Droid Sans Mono', // Android
	'Roboto', // Android, Chrome OS
]

const FONT_LIST = [
	...APPLE_FONTS,
	...WINDOWS_FONTS,
	...LINUX_FONTS,
	...ANDROID_FONTS,
	...DESKTOP_APP_FONTS,
].sort()

export default async function getFonts() {
	const getPixelEmojis = ({ doc, id, emojis }) => {
		try {
			patch(doc.getElementById(id), html`
				<div id="pixel-emoji-container">
				<style>
					.pixel-emoji {
						font-family: ${CSS_FONT_FAMILY};
						font-size: 200px !important;
						height: auto;
						position: absolute !important;
						transform: scale(1.000999);
					}
					</style>
					${
						emojis.map((emoji: string) => {
							return `<div class="pixel-emoji">${emoji}</div>`
						}).join('')
					}
				</div>
			`)

			// get emoji set and system
			const getEmojiDimensions = (style) => {
				return {
					width: style.inlineSize,
					height: style.blockSize,
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

			const pixelToNumber = (pixels) => +(pixels.replace('px', ''))
			const pixelSizeSystemSum = 0.00001 * [...pattern].map((x) => {
				return x.split(',').map((x) => pixelToNumber(x)).reduce((acc, x) => acc += (+x||0), 0)
			}).reduce((acc, x) => acc += x, 0)

			doc.body.removeChild(doc.getElementById('pixel-emoji-container'))

			return {
				emojiSet: [...emojiSet],
				pixelSizeSystemSum,
			}
		} catch (error) {
			console.error(error)
			return {
				emojiSet: [],
				pixelSizeSystemSum: 0,
			}
		}
	}

	const getFontFaceLoadFonts = async (fontList: string[]) => {
		try {
			let fontsChecked: string[] = []
			if (!document.fonts.check(`0px "${getRandomValues()}"`)) {
				fontsChecked = fontList.reduce((acc, font) => {
					const found = document.fonts.check(`0px "${font}"`)
					if (found) acc.push(font)
					return acc
				}, [] as string[])
			}
			const fontFaceList = fontList.map((font) => new FontFace(font, `local("${font}")`))
			const responseCollection = await Promise
				.allSettled(fontFaceList.map((font) => font.load()))
			const fontsLoaded = responseCollection.reduce((acc, font) => {
				if (font.status == 'fulfilled') {
					acc.push(font.value.family)
				}
				return acc
			}, [] as string[])
			return [...new Set([...fontsChecked, ...fontsLoaded])].sort()
		} catch (error) {
			console.error(error)
			return []
		}
	}

	const getPlatformVersion = (fonts) => {
		const getWindows = ({ fonts, fontMap }) => {
			const fontVersion = {
				['11']: fontMap['11'].find((x) => fonts.includes(x)),
				['10']: fontMap['10'].find((x) => fonts.includes(x)),
				['8.1']: fontMap['8.1'].find((x) => fonts.includes(x)),
				['8']: fontMap['8'].find((x) => fonts.includes(x)),
				// require complete set of Windows 7 fonts
				['7']: fontMap['7'].filter((x) => fonts.includes(x)).length == fontMap['7'].length,
			}
			const hash = (
				'' + Object.keys(fontVersion).sort().filter((key) => !!fontVersion[key])
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
				['12']: fontMap['12'].find((x) => fonts.includes(x)),
				['10.15-11']: fontMap['10.15-11'].find((x) => fonts.includes(x)),
				['10.13-10.14']: fontMap['10.13-10.14'].find((x) => fonts.includes(x)),
				['10.12']: fontMap['10.12'].find((x) => fonts.includes(x)),
				['10.11']: fontMap['10.11'].find((x) => fonts.includes(x)),
				['10.10']: fontMap['10.10'].find((x) => fonts.includes(x)),
				// require complete set of 10.9 fonts
				['10.9']: fontMap['10.9'].filter((x) => fonts.includes(x)).length == fontMap['10.9'].length,
			}
			const hash = (
				'' + Object.keys(fontVersion).sort().filter((key) => !!fontVersion[key])
			)
			const hashMap = {
				'10.10,10.11,10.12,10.13-10.14,10.15-11,10.9,12': 'Monterey',
				'10.10,10.11,10.12,10.13-10.14,10.15-11,10.9': '10.15-11',
				'10.10,10.11,10.12,10.13-10.14,10.9': '10.13-10.14',
				'10.10,10.11,10.12,10.9': 'Sierra', // 10.12
				'10.10,10.11,10.9': 'El Capitan', // 10.11
				'10.10,10.9': 'Yosemite', // 10.10
				'10.9': 'Mavericks', // 10.9
			}
			const version = hashMap[hash]
			return version ? `macOS ${version}` : undefined
		}

		return (
			getWindows({ fonts, fontMap: WindowsFonts }) ||
			getMacOS({ fonts, fontMap: MacOSFonts })
		)
	}

	const getDesktopApps = (fonts) => {
		// @ts-ignore
		const apps = Object.keys(DesktopAppFonts).reduce((acc, key) => {
			const appFontSet = DesktopAppFonts[key]
			const match = appFontSet.filter((x) => fonts.includes(x)).length == appFontSet.length
			return match ? [...acc, key] : acc
		}, [])
		return apps
	}

	try {
		const timer = createTimer()
		await queueEvent(timer)
		const doc = (
			PHANTOM_DARKNESS &&
			PHANTOM_DARKNESS.document &&
			PHANTOM_DARKNESS.document.body ? PHANTOM_DARKNESS.document :
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
			emojis: EMOJIS,
		}) || {}

		const fontList = FONT_LIST
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

		if (isFontOSBad(USER_AGENT_OS, fontFaceLoadFonts)) {
			sendToTrash('platform', `${USER_AGENT_OS} system and fonts are suspicious`)
		}

		logTestResult({ time: timer.stop(), test: 'fonts', passed: true })
		return {
			fontFaceLoadFonts,
			platformVersion,
			apps,
			emojiSet,
			pixelSizeSystemSum,
			lied,
		}
	} catch (error) {
		logTestResult({ test: 'fonts', passed: false })
		captureError(error)
		return
	}
}

export function fontsHTML(fp) {
	if (!fp.fonts) {
		return `
		<div class="col-six undefined">
			<strong>Fonts</strong>
			<div>load (0):</div>
			<div>apps:${HTMLNote.BLOCKED}</div>
			<div class="block-text-large">${HTMLNote.BLOCKED}</div>
			<div class="block-text">${HTMLNote.BLOCKED}</div>
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
			lied,
		},
	} = fp

	const icon = {
		'Linux': '<span class="icon linux"></span>',
		'Apple': '<span class="icon apple"></span>',
		'Windows': '<span class="icon windows"></span>',
		'Android': '<span class="icon android"></span>',
		'CrOS': '<span class="icon cros"></span>',
	}

	const blockHelpTitle = `FontFace.load()\nCSSStyleDeclaration.setProperty()\nblock-size\ninline-size\nhash: ${hashMini(emojiSet)}\n${(emojiSet||[]).map((x, i) => i && (i % 6 == 0) ? `${x}\n` : x).join('')}`
	return `
	<div class="relative col-six${lied ? ' rejected' : ''}">
		<span class="aside-note">${performanceLogger.getLog().fonts}</span>
		<strong>Fonts</strong><span class="hash">${hashSlice($hash)}</span>
		<div class="help" title="FontFace.load()">load (${fontFaceLoadFonts ? count(fontFaceLoadFonts) : '0'}/${'' + FONT_LIST.length}): ${platformVersion || ((fonts) => {
			return !(fonts || []).length ? '' : (
				((''+fonts).match(/Lucida Console/)||[]).length ? `${icon.Windows}Windows` :
				((''+fonts).match(/Droid Sans Mono|Noto Color Emoji|Roboto/g)||[]).length == 3 ? `${icon.Linux}${icon.Android}Linux Android` :
				((''+fonts).match(/Droid Sans Mono|Roboto/g)||[]).length == 2 ? `${icon.Android}Android` :
				((''+fonts).match(/Noto Color Emoji|Roboto/g)||[]).length == 2 ? `${icon.CrOS}Chrome OS` :
				((''+fonts).match(/Noto Color Emoji/)||[]).length ? `${icon.Linux}Linux` :
				((''+fonts).match(/Arimo/)||[]).length ? `${icon.Linux}Linux` :
				((''+fonts).match(/Helvetica Neue/g)||[]).length == 2 ? `${icon.Apple}Apple` :
				`${(fonts||[])[0]}...`
			)
		})(fontFaceLoadFonts)}</div>
		<div>apps: ${(apps || []).length ? apps.join(', ') : HTMLNote.UNSUPPORTED}</div>
		<div class="block-text-large help relative" title="FontFace.load()\nFontFaceSet.check()">
			${fontFaceLoadFonts.join(', ') || HTMLNote.UNSUPPORTED}
		</div>
		<div class="block-text help relative" title="${blockHelpTitle}">
			<div>
				<br><span>${pixelSizeSystemSum || HTMLNote.UNSUPPORTED}</span>
				<br><span class="grey jumbo" style="font-family: ${CSS_FONT_FAMILY}">${formatEmojiSet(emojiSet)}</span>
			</div>
		</div>
	</div>
	`
}
