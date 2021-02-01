(async () => {

const hashMini = str => {
	const json = `${JSON.stringify(str)}`
	let i, len, hash = 0x811c9dc5
	for (i = 0, len = json.length; i < len; i++) {
		hash = Math.imul(31, hash) + json.charCodeAt(i) | 0
	}
	return ('0000000' + (hash >>> 0).toString(16)).substr(-8)
}

// ie11 fix for template.content
function templateContent(template) {
	// template {display: none !important} /* add css if template is in dom */
	if ('content' in document.createElement('template')) {
		return document.importNode(template.content, true)
	} else {
		const frag = document.createDocumentFragment()
		const children = template.childNodes
		for (let i = 0, len = children.length; i < len; i++) {
			frag.appendChild(children[i].cloneNode(true))
		}
		return frag
	}
}

// tagged template literal (JSX alternative)
const patch = (oldEl, newEl, fn = null) => {
	oldEl.parentNode.replaceChild(newEl, oldEl)
	return typeof fn === 'function' ? fn() : true
}
const html = (stringSet, ...expressionSet) => {
	const template = document.createElement('template')
	template.innerHTML = stringSet.map((str, i) => `${str}${expressionSet[i] || ''}`).join('')
	return templateContent(template) // ie11 fix for template.content
}

const start = performance.now()
const el = document.getElementById('fingerprint-data')
patch(el, html`
<div id="rect-test">
	<style>
	#rect1 {
		width: 10px;
		height: 10px;
		position: absolute;
		top: 0;
		left: 0;
		transform: rotate(45deg);
		background: #9165ca87;
	}
	#rect1.shift {
		margin-left: 1px;
	}
	#rect1.matrix {
		transform: matrix(1.11, 2.0001, -1.0001, 1.009, 150, 94.4);
	}
	/*
	width: 1000%;
	height: 1000%;
	max-width: 1000%;
	padding: 3.98px;
	transform: skewY(23.1753218deg) rotate3d(10.00099, 90, 0.100000000000009, 60000000000008.00000009deg);
	border: solid 2.89px;
	transform: skewY(-23.1753218deg) scale(1099.0000000099, 1.89) matrix(1.11, 2.0001, -1.0001, 1.009, 150, 94.4);
	transform: matrix(1.11, 2.0001, -1.0001, 1.009, 150, 94.4);
	padding: 4.4545px;
	margin-left: 42.395pt;
	transform: perspective(12890px) translateZ(101.5px);
	margin-top: -150.552px;
	margin-top: -110.552px;
	margin-left: 15.0000009099rem;
	*/
	</style>
	<div id="rect1"></div>
</div>
`)

const rectElem = document.getElementById('rect1')
const rect = rectElem.getClientRects()[0]
const { x, y, top, bottom, right, left, width, height } = rect
rectElem.classList.add('shift')
rectElem.classList.remove('shift')
const unShiftRect = document.getElementById('rect1').getClientRects()[0]
const {
	x: unShiftX,
	y: unShiftY,
	top: unShiftTop,
	bottom: unShiftBottom,
	right: unShiftRight,
	left: unShiftLeft,
	height: unShiftHeight,
	width: unShiftWidth
} = unShiftRect
rectElem.classList.add('matrix')
const matrixRect = document.getElementById('rect1').getClientRects()[0]
const {
	x: matrixX,
	y: matrixY,
	top: matrixTop,
	bottom: matrixBottom,
	right: matrixRight,
	left: matrixLeft,
	height: matrixHeight,
	width: matrixWidth
} = matrixRect

const valid = {
	matrix: (
		(matrixRight - matrixLeft) == matrixWidth && (matrixRight - matrixX) == matrixWidth &&
		(matrixBottom - matrixTop) == matrixHeight && (matrixBottom - matrixY) == matrixHeight
	),
	dimensions: (
		x == y && x == top && x == left &&
		bottom == right && height == width
	),
	unshift: (
		unShiftX == x &&
		unShiftY == y &&
		unShiftTop == top &&
		unShiftBottom == bottom &&
		unShiftRight == right &&
		unShiftLeft == left &&
		unShiftHeight == height &&
		unShiftWidth == width
	)
}

const lieLen = Object.keys(valid).filter(key => !valid[key]).length
const score = (100/(1+lieLen)).toFixed(0)
const lieHash = hashMini(valid)
const rectHash = hashMini({ x, y, top, bottom, right, left, width, height })

const perf = performance.now() - start 

const styleResult = valid => valid ? `<span class="pass">&#10004;</span>` : `<span class="fail">&#10006;</span>`
const rectEl = document.getElementById('rect-test')
patch(rectEl, html`
	<div id="fingerprint-data">
		<style>
		#fingerprint-data > .visitor-info > .jumbo {
			font-size: 32px !important;
		}
		.pass, .fail {
			margin: 0 10px 0 0;
			padding: 1px 5px;
			border-radius: 3px;
		}
		.pass {
			color: #2da568;
			background: #2da5681a;
		}
		.fail {
			color: #ca656e;
			background: #ca656e0d;
		}
		.erratic {
			color: #ca656e;
		}
		.rect-box {
			position: relative;
			padding: 50px;
			text-align: center;
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
		}
		.rect {
			background: #9165ca87;
			margin-left: 10px;
			display: inline-block;
			width: 10px;
			height: 10px;
			top:0;
			left:0;
		}
		.rect-unshift,
		.rect-dimensions {
			width: 100px;
			height: 100px;
		}
		.rect,
		.rect-dimensions {
			animation: dimensions 1s 0.3s ease both;
		}
		.rect-unshift,
		.rect-dimensions  {
			background: #9165ca26;
    		border: 1px solid #9165ca26;
		}
		.rect-matrix {
			position: absolute;
			top: 0;
			left: -25px;
			background: #70c1b324;
			border: 1px solid #70c1b352;
			width: 75px;
			height: 75px;
			animation: matrix 1s 0.3s ease both;
		}
		.rect-unshift {
			animation: unshift 1s 0.3s ease both;
		}
		@keyframes dimensions {
			0% { opacity: 0 }
			25% { opacity: 0 }
			50% { opacity: 1 }
			100% {
				transform: rotate(45deg);
			}
		}
		@keyframes matrix {
			0% { opacity: 0 }
			25% { opacity: 0 }
			50% { opacity: 1 }
			100% {
				transform: matrix(1.11, 2.0001, -1.0001, 1.009, 150, 94.4);
			}
		}
		@keyframes unshift {
			0% { opacity: 0 }
			25% { opacity: 0 }
			50% { opacity: 1 }
			90% {
				transform: translateX(-50px) rotate(45deg);
			}
			100% {
				transform: translateX(0px) rotate(45deg);
			}
		}
		.group {
			font-size: 12px !important;
			border: 1px solid #eee;
			border-radius: 3px;
			padding: 10px 15px;
			margin: 10px auto;
		}
		@media (prefers-color-scheme: dark) {
			.group {
				border: 1px solid #eeeeee54;
			}
		}
		</style>
		<div class="visitor-info">
			<span class="aside-note">${perf.toFixed(2)}ms</span>
			<strong>DOMRect</strong><span class="rect"></span>
			<div>score: <span class="${score == 100 ? 'pass' : 'fail'}">${score}%</span></div>
			<div>rect: ${rectHash}</div>
			<div>lie pattern: <span class="${!lieLen ? 'pass' : 'fail'}">${lieLen ? lieHash : 'none'}</span></div>
		</div>
		<div class="flex-grid">
			<div class="col-six">
				<div>${styleResult(valid.dimensions)}valid dimensions</div>
				${(({ x, y, top, bottom, right, left, width, height }) => {
					const chars = {
						x: (''+x).split(''),
						y: (''+y).split(''),
						top: (''+top).split(''),
						bottom: (''+bottom).split(''),
						right: (''+right).split(''),
						left: (''+left).split(''),
						width: (''+width).split(''),
						height: (''+height).split('')
					}
					const base = {
						dimension1: chars.x,
						dimension2: chars.right,
						dimension3: chars.width
					}
					const style = (a, b) => b.map(
						(char, i) => char != a[i] ? `<span class="erratic">${char}</span>` : char
					)
					.join('')
					
					return `
					<div>${'x'.padStart(10,'.')}: ${style(base.dimension1, chars.x)}</div>
					<div>${'y'.padStart(10,'.')}: ${style(base.dimension1, chars.y)}</div>
					<div>${'top'.padStart(10,'.')}: ${style(base.dimension1, chars.top)}</div>
					<div>${'left'.padStart(10,'.')}: ${style(base.dimension1, chars.left)}</div>
					<div>${'right'.padStart(10,'.')}: ${style(base.dimension2, chars.right)}</div>
					<div>${'bottom'.padStart(10,'.')}: ${style(base.dimension2, chars.bottom)}</div>
					<div>${'width'.padStart(10,'.')}: ${style(base.dimension3, chars.width)}</div>
					<div>${'height'.padStart(10,'.')}: ${style(base.dimension3, chars.height)}</div>
					`
				})(rect)}
			</div>
			<div class="col-six rect-box">
				<div class="rect-dimensions"></div>
			</div>
		</div>
		<div class="flex-grid">
			<div class="col-six">
				<div>${styleResult(valid.matrix)}valid matrix coordinates</div>
				${(({ x, y, top, bottom, right, left, width, height }) => {
					const chars = {
						width: (''+width).split(''),
						height: (''+height).split('')
					}
					const base = {
						dimension1: ''+(right - left),
						dimension2: ''+(right - x),
						dimension3: ''+(bottom - top),
						dimension4: ''+(bottom - y)
					}
					const style = (a, b) => b.map(
						(char, i) => char != a[i] ? `<span class="erratic">${char}</span>` : char
					)
					.join('')

					const calc = (x, expression) => !expression ? `<span class="erratic">${x}</span>` : x
					
					return `
					<div class="group"> + ${''+right} (r)
					<br> - ${''+left} (l)
					<br> = ${style(base.dimension1, chars.width)} (w)</div>

					<div class="group"> + ${''+right} (r)
					<br> - ${''+x} (x)
					<br> = ${style(base.dimension2, chars.width)} (w)</div>

					<div class="group"> + ${''+bottom} (b)
					<br> - ${''+top} (t)
					<br> = ${style(base.dimension3, chars.height)} (h)</div>

					<div class="group"> + ${''+bottom} (b)
					<br> - ${''+y} (y)
					<br> = ${style(base.dimension4, chars.height)} (h)</div>
					`
				})(matrixRect)}
			</div>
			<div class="col-six rect-box">
				<div class="rect-matrix"></div>
			</div>
		</div>
		<div class="flex-grid">
			<div class="col-six">
				<div>${styleResult(valid.unshift)}valid unshift</div>

				${((unShiftRect, rect) => {

					const { x, y, top, bottom, right, left, width, height } = rect
					const {
						x: unShiftX,
						y: unShiftY,
						top: unShiftTop,
						bottom: unShiftBottom,
						right: unShiftRight,
						left: unShiftLeft,
						height: unShiftHeight,
						width: unShiftWidth
					} = unShiftRect

					const chars = {
						x: (''+x).split(''),
						y: (''+y).split(''),
						top: (''+top).split(''),
						bottom: (''+bottom).split(''),
						right: (''+right).split(''),
						left: (''+left).split(''),
						width: (''+width).split(''),
						height: (''+height).split('')
					}
					const base = {
						dimension1: chars.x,
						dimension2: chars.y,
						dimension3: chars.top,
						dimension4: chars.left,
						dimension5: chars.right,
						dimension6: chars.bottom,
						dimension7: chars.width,
						dimension8: chars.height
					}
					const style = (a, b) => b.map(
						(char, i) => char != a[i] ? `<span class="erratic">${char}</span>` : char
					)
					.join('')
					
					return `
					<div>${'x'.padStart(10,'.')}: ${style(base.dimension1, (''+unShiftX).split(''))}</div>
					<div>${'y'.padStart(10,'.')}: ${style(base.dimension2, (''+unShiftY).split(''))}</div>
					<div>${'top'.padStart(10,'.')}: ${style(base.dimension3, (''+unShiftTop).split(''))}</div>
					<div>${'left'.padStart(10,'.')}: ${style(base.dimension4, (''+unShiftLeft).split(''))}</div>
					<div>${'right'.padStart(10,'.')}: ${style(base.dimension5, (''+unShiftRight).split(''))}</div>
					<div>${'bottom'.padStart(10,'.')}: ${style(base.dimension6, (''+unShiftBottom).split(''))}</div>
					<div>${'width'.padStart(10,'.')}: ${style(base.dimension7, (''+unShiftWidth).split(''))}</div>
					<div>${'height'.padStart(10,'.')}: ${style(base.dimension8, (''+unShiftHeight).split(''))}</div>
					`
				})(unShiftRect, rect)}
			</div>
			<div class="col-six rect-box">
				<div class="rect-unshift"></div>
			</div>
		</div>
	</div>
`)
})()