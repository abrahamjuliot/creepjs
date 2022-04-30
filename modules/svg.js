export const getSVG = async imports => {

	const {
		require: {
			queueEvent,
			createTimer,
			patch,
			html,
			captureError,
			getEmojis,
			cssFontFamily,
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
			lieProps['SVGRect.y'] ||
			lieProps['String.fromCodePoint']
		) || false
						
		const doc = (
			phantomDarkness &&
			phantomDarkness.document &&
			phantomDarkness.document.body ? phantomDarkness.document :
				document
		)
		
		const divElement = document.createElement('div')
		doc.body.appendChild(divElement)

		const emojis = getEmojis()
		
		// patch div
		patch(divElement, html`
			<div id="svg-container">
				<style>
				#svg-container {
					position: absolute;
					left: -9999px;
					height: auto;
				}
				.svgrect-emoji {
					font-family: ${cssFontFamily};
					font-size: 200px !important;
					height: auto;
					position: absolute !important;
					transform: scale(1.000999);
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
		`)

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
		
		const getObjectSum = obj => !obj ? 0 : Object.keys(obj).reduce((acc, key) => acc += Math.abs(obj[key]), 0)
		
		// SVGRect
		const svgBox = doc.getElementById('svgBox')
		const bBox = reduceToObject(svgBox.getBBox())

		// compute SVGRect emojis
		const pattern = new Set()
		const svgElems = [...svgBox.getElementsByClassName('svgrect-emoji')]
		
		await queueEvent(timer)
		const emojiSet = svgElems.reduce((emojiSet, el, i) => {
			const emoji = emojis[i]
			const dimensions = ''+el.getComputedTextLength()
			if (!pattern.has(dimensions)) {
				pattern.add(dimensions)
				emojiSet.add(emoji)
			}
			return emojiSet
		}, new Set())

		// svgRect System Sum
		const svgrectSystemSum = 0.00001 * [...pattern].map(x => {
			return x.split(',').reduce((acc, x) => acc += (+x||0), 0)
		}).reduce((acc, x) => acc += x, 0)
		
		const data = {
			bBox: getObjectSum(bBox),
			extentOfChar: reduceToSum(svgElems[0].getExtentOfChar(emojis[0])),
			subStringLength: svgElems[0].getSubStringLength(0, 10),
			computedTextLength: svgElems[0].getComputedTextLength(),
			emojiSet: [...emojiSet],
			svgrectSystemSum,
			lied
		}

		doc.body.removeChild(doc.getElementById('svg-container'))
		
		logTestResult({ time: timer.stop(), test: 'svg', passed: true })
		return data
	}
	catch (error) {
		logTestResult({ test: 'svg', passed: false })
		captureError(error)
		return
	}
}

export const svgHTML = ({ fp, note, hashSlice, hashMini, formatEmojiSet, performanceLogger, cssFontFamily }) => {
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
			svgrectSystemSum,
			lied
		}
	} = fp
	const divisor = 10000
	const helpTitle = `SVGTextContentElement.getComputedTextLength()\nhash: ${hashMini(emojiSet)}\n${emojiSet.map((x,i) => i && (i % 6 == 0) ? `${x}\n` : x).join('')}`
	return `
	<div class="relative col-six${lied ? ' rejected' : ''}">
		<span class="aside-note">${performanceLogger.getLog().svg}</span>
		<strong>SVGRect</strong><span class="${lied ? 'lies ' : ''}hash">${hashSlice($hash)}</span>
		<div class="help" title="SVGGraphicsElement.getBBox()">bBox: ${bBox ? (bBox/divisor) : note.blocked}</div>
		<div class="help" title="SVGTextContentElement.getExtentOfChar()">char: ${extentOfChar ? (extentOfChar/divisor) : note.blocked}</div>
		<div class="help" title="SVGTextContentElement.getSubStringLength()">subs: ${subStringLength ? (subStringLength/divisor) : note.blocked}</div>
		<div class="help" title="SVGTextContentElement.getComputedTextLength()">text: ${computedTextLength ? (computedTextLength/divisor) : note.blocked}</div>
		<div class="block-text help relative" title="${helpTitle}">
			<span>${svgrectSystemSum || note.unsupported}</span>
			<span class="grey jumbo" style="font-family: ${cssFontFamily}">${formatEmojiSet(emojiSet)}</span>
		</div>
	</div>
	`	
}
		