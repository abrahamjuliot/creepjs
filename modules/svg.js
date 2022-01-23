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
				<text id="${fontId}">${emojis.join('')}</text>
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
		const getCharDimensions = (svgText, emojis) => {
			const { width, height, y } = svgText.getExtentOfChar(emojis.join(''))
			return { width, height, y }
		}
		const base = baseFonts.reduce((acc, font) => {
			svgText.style.setProperty('--font', font)
			const dimensions = getCharDimensions(svgText, emojis)
			acc[font] = dimensions
			return acc
		}, {})
		const detectedEmojiFonts = families.reduce((acc, family) => {
			svgText.style.setProperty('--font', family)
			const basefont = /, (.+)/.exec(family)[1]
			const dimensions = getCharDimensions(svgText, emojis)
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
		const pattern = new Set()
		const lengthSet = {
			extentOfChar: new Set(),
			subStringLength: new Set(),
			computedTextLength: new Set()
		}
		await queueEvent(timer)

		const svgElems = [...svgBox.getElementsByClassName('svgrect-emoji')]
		const emojiSet = svgElems.reduce((emojiSet, el, i) => {
			const emoji = emojis[i]
			const extentOfCharSum = reduceToSum(el.getExtentOfChar(emoji))
			const subStringLength = el.getSubStringLength(0, 10)
			const computedTextLength = el.getComputedTextLength()
			const dimensions = `${extentOfCharSum},${subStringLength},${computedTextLength}`
			if (!pattern.has(dimensions)) {
				pattern.add(dimensions)
				emojiSet.add(emoji)
			}
			lengthSet.extentOfChar.add(extentOfCharSum)
			lengthSet.subStringLength.add(subStringLength)
			lengthSet.computedTextLength.add(computedTextLength)
			return emojiSet
		}, new Set())

		// domRect System Sum
		const svgrectSum = 0.00001 * [...pattern].map(x => {
			return x.split(',').reduce((acc, x) => acc += (+x||0), 0)
		}).reduce((acc, x) => acc += x, 0)

		const amplifySum = (n, fontSet) => {
			const { size } = fontSet
			if (size > 1) {
				return n / +`1e${size}00` // ...e-200
			}
			return (
				!size ? n * -1e150 : // -...e+148
					size > 1 ? n / +`1e${size}00` : // ...e-200
						fontSet.has('Segoe UI Emoji') ? n :
							fontSet.has('Apple Color Emoji') ? n / 1e64 : // ...e-66
								n * 1e64 // ...e+62
			)
		} 

		const svgrectSystemSum = amplifySum(svgrectSum, detectedEmojiFonts)

		const data = {
			bBox: getObjectSum(bBox),
			extentOfChar: getListSum([...lengthSet.extentOfChar]),
			subStringLength: getListSum([...lengthSet.subStringLength]),
			computedTextLength: getListSum([...lengthSet.computedTextLength]),
			emojiSet: [...emojiSet],
			emojiFonts: [...detectedEmojiFonts],
			svgrectSystemSum,
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
			svgrectSystemSum,
			lied
		}
	} = fp
	const divisor = 10000
	const helpTitle = `SVGTextContentElement.getExtentOfChar()\nSVGTextContentElement.getSubStringLength()\nSVGTextContentElement.getComputedTextLength()\nhash: ${hashMini(emojiSet)}\n${emojiSet.map((x,i) => i && (i % 6 == 0) ? `${x}\n` : x).join('')}`
	return `
	<div class="relative col-six${lied ? ' rejected' : ''}">
		<span class="aside-note">${performanceLogger.getLog().svg}</span>
		<strong>SVGRect</strong><span class="${lied ? 'lies ' : ''}hash">${hashSlice($hash)}</span>
		<div class="help" title="SVGGraphicsElement.getBBox()">bBox: ${bBox ? (bBox/divisor) : note.blocked}</div>
		<div class="help" title="SVGTextContentElement.getExtentOfChar()">char: ${extentOfChar ? (extentOfChar/divisor) : note.blocked}</div>
		<div class="help" title="SVGTextContentElement.getSubStringLength()">subs: ${subStringLength ? (subStringLength/divisor) : note.blocked}</div>
		<div class="help" title="SVGTextContentElement.getComputedTextLength()">text: ${computedTextLength ? (computedTextLength/divisor) : note.blocked}</div>
		<div class="block-text help relative" title="${helpTitle}">
			<span class="confidence-note">${
				!emojiFonts ? '' : emojiFonts.length > 1 ? `${emojiFonts[0]}...` : (emojiFonts[0] || '')
			}</span>
			<span>${svgrectSystemSum || note.unsupported}</span>
			<span class="grey jumbo" style="${!(emojiFonts || [])[0] ? '' : `font-family: '${emojiFonts[0]}' !important`}">${formatEmojiSet(emojiSet)}</span>
		</div>
	</div>
	`	
}
		