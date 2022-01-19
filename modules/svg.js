export const getSVG = async imports => {

	const {
		require: {
			queueEvent,
			createTimer,
			instanceId,
			patch,
			html,
			captureError,
			getEmojis,
			lieProps,
			logTestResult,
			phantomDarkness
		}
	} = imports
	
	try {
		const timer = createTimer()
		await queueEvent(timer)
		let lied = (
			lieProps['SVGRect.height'] ||
			lieProps['SVGRect.width'] ||
			lieProps['SVGRect.x'] ||
			lieProps['SVGRect.y']
		) || false // detect lies
						
		const doc = (
			phantomDarkness &&
			phantomDarkness.document &&
			phantomDarkness.document.body ? phantomDarkness.document :
				document
		)
		
		const svgId = `${instanceId}-svg-div`
		const fontId = 'svgrect-font-detector'
		const chars = `mmmmmmmmmmlli`
		const divElement = document.createElement('div')
		divElement.setAttribute('id', svgId)
		doc.body.appendChild(divElement)

		const emojis = getEmojis()
		
		// patch div
		patch(divElement, html`
		<div id="${svgId}">
			<style>
				#${fontId} {
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
					font-family: var(--font);
				}
			</style>
			<svg viewBox="0 0 200 200">
				<text id="${fontId}">${chars}</text>
			</svg>
			<div id="svg-container">
				<style>
				#svg-container {
					position: absolute;
					left: -9999px;
					height: auto;
				}
				.svgrect-emoji {
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
				<svg>
					<g id="svgBox">
						${
							emojis.map(emoji => {
								return `<text x="32" y="32" class="svgrect-emoji">${emoji}</text>`
							})
						}
					</g>
				</svg>
			</div>
		</div>
		`)

		// fonts
		const baseFonts = ['monospace', 'sans-serif', 'serif']
		const fontShortList = [
			'Segoe UI Emoji', // Windows
			'Apple Color Emoji', // Apple
			'Noto Color Emoji',  // Linux, Android, Chrome OS
		]
		const families = fontShortList.reduce((acc, font) => {
			baseFonts.forEach(baseFont => acc.push(`'${font}', ${baseFont}`))
			return acc
		}, [])
		const svgText = doc.getElementById(fontId)
		const getRectDimensions = svgText => {
			const { width, height, y } = svgText.getExtentOfChar(chars[0])
			return { width, height, y }
		}
		const base = baseFonts.reduce((acc, font) => {
			svgText.style.setProperty('--font', font)
			const dimensions = getRectDimensions(svgText)
			acc[font] = dimensions
			return acc
		}, {})
		const detected = families.reduce((acc, family) => {
			svgText.style.setProperty('--font', family)
			const basefont = /, (.+)/.exec(family)[1]
			const dimensions = getRectDimensions(svgText)
			const font = /\'(.+)\'/.exec(family)[1]
			if ((dimensions.width != base[basefont].width) ||
				(dimensions.height != base[basefont].height) ||
				(dimensions.y != base[basefont].y)) {
				acc.add(font)
			}
			return acc
		}, new Set())

		// SVG
		const reduceToObject = nativeObj => {
			const keys = Object.keys(nativeObj.__proto__)
			return keys.reduce((acc, key) => {
				const val = nativeObj[key]
				const isMethod = typeof val == 'function'
				return isMethod ? acc : {...acc, [key]: val}
			}, {})
		}
		const reduceToSum = nativeObj => {
			const keys = Object.keys(nativeObj.__proto__)
			return keys.reduce((acc, key) => {
				const val = nativeObj[key]
				return isNaN(val) ? acc : (acc += val)
			}, 0)
		}
		const getListSum = list => list.reduce((acc, n) => acc += n, 0)
		const getObjectSum = obj => !obj ? 0 : Object.keys(obj).reduce((acc, key) => acc += Math.abs(obj[key]), 0)
		
		// SVGRect
		const svgBox = doc.getElementById('svgBox')
		const bBox = reduceToObject(svgBox.getBBox())

		// compute SVGRect emojis
		const lengthSet = {
			extentOfChar: new Set(),
			subStringLength: new Set(),
			computedTextLength: new Set()
		}
		await queueEvent(timer)

		const emojiSet = [...svgBox.getElementsByClassName('svgrect-emoji')].reduce((emojiSet, el, i) => {
			const emoji = emojis[i]
			const extentOfCharSum = reduceToSum(el.getExtentOfChar(''))
			const subStringLength = el.getSubStringLength(0, 10)
			const computedTextLength = el.getComputedTextLength()
			if (!lengthSet.extentOfChar.has(extentOfCharSum)) {
				lengthSet.extentOfChar.add(extentOfCharSum)
				emojiSet.add(emoji)
			}
			if (!lengthSet.subStringLength.has(subStringLength)) {
				lengthSet.subStringLength.add(subStringLength)
				emojiSet.add(emoji)
			}
			if (!lengthSet.computedTextLength.has(computedTextLength)) {
				lengthSet.computedTextLength.add(computedTextLength)
				emojiSet.add(emoji)
			}
			return emojiSet
		}, new Set())

		const data = {
			bBox: getObjectSum(bBox),
			extentOfChar: getListSum([...lengthSet.extentOfChar]),
			subStringLength: getListSum([...lengthSet.subStringLength]),
			computedTextLength: getListSum([...lengthSet.computedTextLength]),
			emojiSet: [...emojiSet],
			emojiFonts: [...detected],
			lied
		}
		
		logTestResult({ time: timer.stop(), test: 'svg', passed: true })
		return data
	}
	catch (error) {
		logTestResult({ test: 'svg', passed: false })
		captureError(error)
		return
	}
}

export const svgHTML = ({ fp, note, hashSlice, hashMini, formatEmojiSet, performanceLogger }) => {
	if (!fp.svg) {
		return `
		<div class="col-six undefined">
			<strong>SVGRect</strong>
			<div>bBox: ${note.blocked}</div>
			<div>char: ${note.blocked}</div>
			<div>subs: ${note.blocked}</div>
			<div>text: ${note.blocked}</div>
			<div class="block-text">${note.blocked}</div>
		</div>`
	}
	const {
		svg: {
			$hash,
			bBox,
			subStringLength,
			extentOfChar,
			computedTextLength,
			emojiSet,
			emojiFonts,
			lied
		}
	} = fp
	const divisor = 10000
	const helpTitle = `hash: ${hashMini(emojiSet)}\n${emojiSet.map((x,i) => i && (i % 6 == 0) ? `${x}\n` : x).join('')}`
	return `
	<div class="relative col-six${lied ? ' rejected' : ''}">
		<span class="aside-note">${performanceLogger.getLog().svg}</span>
		<strong>SVGRect</strong><span class="${lied ? 'lies ' : ''}hash">${hashSlice($hash)}</span>
		<div class="help" title="SVGGraphicsElement.getBBox()">bBox: ${bBox ? (bBox/divisor) : note.blocked}</div>
		<div class="help" title="SVGTextContentElement.getExtentOfChar()">char: ${extentOfChar ? (extentOfChar/divisor) : note.blocked}</div>
		<div class="help" title="SVGTextContentElement.getSubStringLength()">subs: ${subStringLength ? (subStringLength/divisor) : note.blocked}</div>
		<div class="help" title="SVGTextContentElement.getComputedTextLength()">text: ${computedTextLength ? (computedTextLength/divisor) : note.blocked}</div>
		<div class="block-text jumbo grey help relative" title="${helpTitle}">
			<span class="confidence-note">${
				emojiFonts.length > 1 ? `${emojiFonts[0]}...` : (emojiFonts[0] || '')
			}</span>
			${formatEmojiSet(emojiSet)}
		</div>
	</div>
	`	
}
		