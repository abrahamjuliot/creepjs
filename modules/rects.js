// inspired by
// https://privacycheck.sec.lrz.de/active/fp_gcr/fp_getclientrects.html
// https://privacycheck.sec.lrz.de/active/fp_e/fp_emoji.html

export const getClientRects = async imports => {

	const {
		require: {
			queueEvent,
			createTimer,
			instanceId,
			getEmojis,
			patch,
			html,
			captureError,
			documentLie,
			lieProps,
			logTestResult,
			phantomDarkness
		}
	} = imports
	
	try {
		const timer = createTimer()
		await queueEvent(timer)
		const toNativeObject = domRect => {
			return {
				bottom: domRect.bottom,
				height: domRect.height,
				left: domRect.left,
				right: domRect.right,
				width: domRect.width,
				top: domRect.top,
				x: domRect.x,
				y: domRect.y
			}
		}
		let lied = (
			lieProps['Element.getClientRects'] ||
			lieProps['Element.getBoundingClientRect'] ||
			lieProps['Range.getClientRects'] ||
			lieProps['Range.getBoundingClientRect']
		) || false // detect lies
		
		const getBestRect = (lieProps, doc, el) => {
			let range
			if (!lieProps['Element.getClientRects']) {
				return el.getClientRects()[0]
			}
			else if (!lieProps['Element.getBoundingClientRect']) {
				return el.getBoundingClientRect()
			}
			else if (!lieProps['Range.getClientRects']) {
				range = doc.createRange()
				range.selectNode(el)
				return range.getClientRects()[0]
			}
			range = doc.createRange()
			range.selectNode(el)
			return range.getBoundingClientRect()
		}
					
		const doc = phantomDarkness ? phantomDarkness.document : document

		const rectsId = `${instanceId}-client-rects-div`
		const divElement = document.createElement('div')
		divElement.setAttribute('id', rectsId)
		doc.body.appendChild(divElement)
		
		const emojis = getEmojis()

		patch(divElement, html`
		<div id="${rectsId}">
			<div style="perspective:100px;width:1000.099%;" id="rect-container">
				<style>
				.rects {
					width: 1000%;
					height: 1000%;
					max-width: 1000%;
				}
				.absolute {
					position: absolute;
				}
				#cRect1 {
					border: solid 2.715px;
					border-color: #F72585;
					padding: 3.98px;
					margin-left: 12.12px;
				}
				#cRect2 {
					border: solid 2px;
					border-color: #7209B7;
					font-size: 30px;
					margin-top: 20px;
					padding: 3.98px;
					transform: skewY(23.1753218deg) rotate3d(10.00099, 90, 0.100000000000009, 60000000000008.00000009deg);
				}
				#cRect3 {
					border: solid 2.89px;
					border-color: #3A0CA3;
					font-size: 45px;
					transform: skewY(-23.1753218deg) scale(1099.0000000099, 1.89) matrix(1.11, 2.0001, -1.0001, 1.009, 150, 94.4);
					margin-top: 50px;
				}
				#cRect4 {
					border: solid 2px;
					border-color: #4361EE;
					transform: matrix(1.11, 2.0001, -1.0001, 1.009, 150, 94.4);
					margin-top: 11.1331px;
					margin-left: 12.1212px;
					padding: 4.4545px;
					left: 239.4141px;
					top: 8.5050px;
				}
				#cRect5 {
					border: solid 2px;
					border-color: #4CC9F0;
					margin-left: 42.395pt;
				}
				#cRect6 {
					border: solid 2px;
					border-color: #F72585;
					transform: perspective(12890px) translateZ(101.5px);
					padding: 12px;
				}
				#cRect7 {
					margin-top: -350.552px;
					margin-left: 0.9099rem;
					border: solid 2px;
					border-color: #4361EE;
				}
				#cRect8 {
					margin-top: -150.552px;
					margin-left: 15.9099rem;
					border: solid 2px;
					border-color: #3A0CA3;
				}
				#cRect9 {
					margin-top: -110.552px;
					margin-left: 15.9099rem;
					border: solid 2px;
					border-color: #7209B7;
				}
				#cRect10 {
					margin-top: -315.552px;
					margin-left: 15.9099rem;
					border: solid 2px;
					border-color: #F72585;
				}
				#cRect11 {
					width: 10px;
					height: 10px;
					margin-left: 15.0000009099rem;
					border: solid 2px;
					border-color: #F72585;
				}
				#cRect12 {
					width: 10px;
					height: 10px;
					margin-left: 15.0000009099rem;
					border: solid 2px;
					border-color: #F72585;
				}
				#rect-container .shift-dom-rect {
					top: 1px !important;
					left: 1px !important;
				}
				</style>
				<div id="cRect1" class="rects"></div>
				<div id="cRect2" class="rects"></div>
				<div id="cRect3" class="rects"></div>
				<div id="cRect4" class="rects absolute"></div>
				<div id="cRect5" class="rects"></div>
				<div id="cRect6" class="rects"></div>
				<div id="cRect7" class="rects absolute"></div>
				<div id="cRect8" class="rects absolute"></div>
				<div id="cRect9" class="rects absolute"></div>
				<div id="cRect10" class="rects absolute"></div>
				<div id="cRect11" class="rects"></div>
				<div id="cRect12" class="rects"></div>
				<div id="emoji" class="emojis"></div>
			</div>
			<div id="emoji-container">
				<style>
				.domrect-emoji {
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
						return `<div class="domrect-emoji">${emoji}</div>`
					})
				}
			</div>
		</div>
		`)

		const pattern = new Set()
		const emojiElems = [...doc.getElementsByClassName('domrect-emoji')]
		const emojiRects = emojiElems.map((el, i) => {
			const emoji = emojis[i]
			const { height, width } = getBestRect(lieProps, doc, el)
			return { emoji, width, height }
		})
		// get emoji set and system
		const emojiSet = emojiRects.filter(emoji => {
			const dimensions = `${emoji.width}, ${emoji.heigt}`
			if (pattern.has(dimensions)) {
				return false
			}
			pattern.add(dimensions)
			return true
		})
		.map(emoji => emoji.emoji)

		// get clientRects
		const range = document.createRange()
		const rectElems = doc.getElementsByClassName('rects')

		const elementClientRects = [...rectElems].map(el => {
			return toNativeObject(el.getClientRects()[0])
		})

		const elementBoundingClientRect = [...rectElems].map(el => {
			return toNativeObject(el.getBoundingClientRect())
		})
		
		const rangeClientRects = [...rectElems].map(el => {
			range.selectNode(el)
			return toNativeObject(range.getClientRects()[0])
		})

		const rangeBoundingClientRect = [...rectElems].map(el => {
			range.selectNode(el)
			return toNativeObject(el.getBoundingClientRect())
		})


		// detect failed shift calculation
		// inspired by https://arkenfox.github.io/TZP
		const rect4 = [...rectElems][3]
		const { top: initialTop } = elementClientRects[3]
		rect4.classList.add('shift-dom-rect')
		const { top: shiftedTop } = toNativeObject(rect4.getClientRects()[0])
		rect4.classList.remove('shift-dom-rect')
		const { top: unshiftedTop } = toNativeObject(rect4.getClientRects()[0])
		const diff = initialTop - shiftedTop
		const unshiftLie = diff != (unshiftedTop - shiftedTop)
		if (unshiftLie) {
			lied = true
			documentLie('Element.getClientRects', 'failed unshift calculation')
		}

		// detect failed math calculation lie
		let mathLie = false
		elementClientRects.forEach(rect => {
			const { right, left, width, bottom, top, height, x, y } = rect
			if (
				right - left != width ||
				bottom - top != height ||
				right - x != width ||
				bottom - y != height
			) {
				lied = true
				mathLie = true
			}
			return
		})
		if (mathLie) {
			documentLie('Element.getClientRects', 'failed math calculation')
		}
		
		// detect equal elements mismatch lie
		const { right: right1, left: left1 } = elementClientRects[10]
		const { right: right2, left: left2 } = elementClientRects[11]
		if (right1 != right2 || left1 != left2) {
			documentLie('Element.getClientRects', 'equal elements mismatch')
			lied = true
		}
					
		logTestResult({ time: timer.stop(), test: 'rects', passed: true })
		return {
			emojiSet,
			elementClientRects,
			elementBoundingClientRect,
			rangeClientRects,
			rangeBoundingClientRect,
			lied
		}
	}
	catch (error) {
		logTestResult({ test: 'rects', passed: false })
		captureError(error)
		return
	}
}

export const clientRectsHTML = ({ fp, note, modal, getDiffs, hashMini, hashSlice, formatEmojiSet, performanceLogger }) => {
	if (!fp.clientRects) {
		return `
		<div class="col-six undefined">
			<strong>DOMRect</strong>
			<div>elems A: ${note.blocked}</div>
			<div>elems B: ${note.blocked}</div>
			<div>range A: ${note.blocked}</div>
			<div>range B: ${note.blocked}</div>
			<div class="block-text">${note.blocked}</div>
		</div>`
	}
	const {
		clientRects: {
			$hash,
			elementClientRects,
			elementBoundingClientRect,
			rangeClientRects,
			rangeBoundingClientRect,
			emojiSet,
			lied
		}
	} = fp

	// compute mismatch style
	const getRectSum = rect => Object.keys(rect).reduce((acc, key) => acc += rect[key], 0)/100_000_000
	//const reduceRectSum = n => (''+n).split('.').reduce((acc, s) => acc += +s, 0)
	const computeDiffs = rects => {
		if (!rects || !rects.length) {
			return
		}
		const exptectedSum = rects.reduce((acc, rect) => {
			const { right, left, width, bottom, top, height, x, y } = rect
			const expected = {
				width: right - left,
				height: bottom - top,
				right: left + width,
				left: right - width,
				bottom: top + height,
				top: bottom - height,
				x: right - width,
				y: bottom - height
			}
			return acc += getRectSum(expected)
		}, 0)
		const actualSum = rects.reduce((acc, rect) => acc += getRectSum(rect), 0)
		return getDiffs({
			stringA: actualSum,
			stringB: exptectedSum,
			charDiff: true,
			decorate: diff => `<span class="bold-fail">${diff}</span>`
		})
	}

	const helpTitle = `hash: ${hashMini(emojiSet)}\n${emojiSet.map((x,i) => i && (i % 6 == 0) ? `${x}\n` : x).join('')}`
	return `
	<div class="relative col-six${lied ? ' rejected' : ''}">
		<span class="aside-note">${performanceLogger.getLog().rects}</span>
		<strong>DOMRect</strong><span class="${lied ? 'lies ' : ''}hash">${hashSlice($hash)}</span>
		<div class="help" title="Element.getClientRects()">elems A: ${computeDiffs(elementClientRects)}</div>
		<div class="help" title="Element.getBoundingClientRect()">elems B: ${computeDiffs(elementBoundingClientRect)}</div>
		<div class="help" title="Range.getClientRects()">range A: ${computeDiffs(rangeClientRects)}</div>
		<div class="help" title="Range.getBoundingClientRect()">range B: ${computeDiffs(rangeBoundingClientRect)}</div>
		<div class="block-text jumbo grey help" title="${helpTitle}">${formatEmojiSet(emojiSet)}</div>
	</div>
	`
}