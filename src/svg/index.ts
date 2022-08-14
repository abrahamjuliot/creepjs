import { captureError } from '../errors'
import { documentLie, lieProps, PHANTOM_DARKNESS } from '../lies'
import { hashMini } from '../utils/crypto'
import { createTimer, queueEvent, CSS_FONT_FAMILY, EMOJIS, logTestResult, performanceLogger, hashSlice, formatEmojiSet } from '../utils/helpers'
import { patch, html, HTMLNote } from '../utils/html'

export default async function getSVG() {
	try {
		const timer = createTimer()
		await queueEvent(timer)
		let lied = (
			lieProps['SVGRect.height'] ||
			lieProps['SVGRect.width'] ||
			lieProps['SVGRect.x'] ||
			lieProps['SVGRect.y'] ||
			lieProps['String.fromCodePoint'] ||
			lieProps['SVGRectElement.getBBox'] ||
			lieProps['SVGTextContentElement.getExtentOfChar'] ||
			lieProps['SVGTextContentElement.getSubStringLength'] ||
			lieProps['SVGTextContentElement.getComputedTextLength']
		) || false

		const doc = (
			PHANTOM_DARKNESS &&
			PHANTOM_DARKNESS.document &&
			PHANTOM_DARKNESS.document.body ? PHANTOM_DARKNESS.document :
				document
		)

		const divElement = document.createElement('div')
		doc.body.appendChild(divElement)

		// patch div
		patch(divElement, html`
			<div id="svg-container">
				<style>
				#svg-container {
					position: absolute;
					left: -9999px;
					height: auto;
				}
				#svg-container .shift-svg {
					transform: scale(1.000999) !important;
				}
				.svgrect-emoji {
					font-family: ${CSS_FONT_FAMILY};
					font-size: 200px !important;
					height: auto;
					position: absolute !important;
					transform: scale(1.000999);
				}
				</style>
				<svg>
					<g id="svgBox">
						${
							EMOJIS.map((emoji) => {
								return `<text x="32" y="32" class="svgrect-emoji">${emoji}</text>`
							}).join('')
						}
					</g>
				</svg>
			</div>
		`)

		// SVG
		const reduceToObject = (nativeObj) => {
			const keys = Object.keys(nativeObj.__proto__)
			return keys.reduce((acc, key) => {
				const val = nativeObj[key]
				const isMethod = typeof val == 'function'
				return isMethod ? acc : {...acc, [key]: val}
			}, {})
		}
		const reduceToSum = (nativeObj) => {
			const keys = Object.keys(nativeObj.__proto__)
			return keys.reduce((acc, key) => {
				const val = nativeObj[key]
				return isNaN(val) ? acc : (acc += val)
			}, 0)
		}

		const getObjectSum = (obj) => !obj ? 0 : Object.keys(obj).reduce((acc, key) => acc += Math.abs(obj[key]), 0)

		// SVGRect
		const svgBox = doc.getElementById('svgBox')
		const bBox = reduceToObject(svgBox.getBBox())

		// compute SVGRect emojis
		const pattern = new Set()
		const svgElems = [...svgBox.getElementsByClassName('svgrect-emoji')]

		await queueEvent(timer)
		const emojiSet = svgElems.reduce((emojiSet, el, i) => {
			const emoji = EMOJIS[i]
			const dimensions = ''+el.getComputedTextLength()
			if (!pattern.has(dimensions)) {
				pattern.add(dimensions)
				emojiSet.add(emoji)
			}
			return emojiSet
		}, new Set())

		// svgRect System Sum
		const svgrectSystemSum = 0.00001 * [...pattern].map((x) => {
			return x.split(',').reduce((acc, x) => acc += (+x||0), 0)
		}).reduce((acc, x) => acc += x, 0)

		// detect failed shift calculation
		const svgEmojiEl = svgElems[0] as SVGTextContentElement
		const initial = svgEmojiEl.getComputedTextLength()
		svgEmojiEl.classList.add('shift-svg')
		const shifted = svgEmojiEl.getComputedTextLength()
		svgEmojiEl.classList.remove('shift-svg')
		const unshifted = svgEmojiEl.getComputedTextLength()
		if ((initial - shifted) != (unshifted - shifted)) {
			lied = true
			documentLie('SVGTextContentElement.getComputedTextLength', 'failed unshift calculation')
		}

		const data = {
			bBox: getObjectSum(bBox),
			extentOfChar: reduceToSum(svgElems[0].getExtentOfChar(EMOJIS[0])),
			subStringLength: svgElems[0].getSubStringLength(0, 10),
			computedTextLength: svgElems[0].getComputedTextLength(),
			emojiSet: [...emojiSet],
			svgrectSystemSum,
			lied,
		}

		doc.body.removeChild(doc.getElementById('svg-container'))

		logTestResult({ time: timer.stop(), test: 'svg', passed: true })
		return data
	} catch (error) {
		logTestResult({ test: 'svg', passed: false })
		captureError(error)
		return
	}
}

export function svgHTML(fp) {
	if (!fp.svg) {
		return `
		<div class="col-six undefined">
			<strong>SVGRect</strong>
			<div>bBox: ${HTMLNote.BLOCKED}</div>
			<div>char: ${HTMLNote.BLOCKED}</div>
			<div>subs: ${HTMLNote.BLOCKED}</div>
			<div>text: ${HTMLNote.BLOCKED}</div>
			<div class="block-text">${HTMLNote.BLOCKED}</div>
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
			lied,
		},
	} = fp
	const divisor = 10000
	const helpTitle = `SVGTextContentElement.getComputedTextLength()\nhash: ${hashMini(emojiSet)}\n${emojiSet.map((x, i) => i && (i % 6 == 0) ? `${x}\n` : x).join('')}`
	return `
	<div class="relative col-six${lied ? ' rejected' : ''}">
		<span class="aside-note">${performanceLogger.getLog().svg}</span>
		<strong>SVGRect</strong><span class="${lied ? 'lies ' : ''}hash">${hashSlice($hash)}</span>
		<div class="help" title="SVGGraphicsElement.getBBox()">bBox: ${bBox ? (bBox/divisor) : HTMLNote.BLOCKED}</div>
		<div class="help" title="SVGTextContentElement.getExtentOfChar()">char: ${extentOfChar ? (extentOfChar/divisor) : HTMLNote.BLOCKED}</div>
		<div class="help" title="SVGTextContentElement.getSubStringLength()">subs: ${subStringLength ? (subStringLength/divisor) : HTMLNote.BLOCKED}</div>
		<div class="help" title="SVGTextContentElement.getComputedTextLength()">text: ${computedTextLength ? (computedTextLength/divisor) : HTMLNote.BLOCKED}</div>
		<div class="block-text help relative" title="${helpTitle}">
			<span>${svgrectSystemSum || HTMLNote.UNSUPPORTED}</span>
			<span class="grey jumbo" style="font-family: ${CSS_FONT_FAMILY}">${formatEmojiSet(emojiSet)}</span>
		</div>
	</div>
	`
}
