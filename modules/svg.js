export const getSVG = async imports => {

	const {
		require: {
			instanceId,
			hashMini,
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
		const start = performance.now()
		let lied = (
			lieProps['SVGRect.height'] ||
			lieProps['SVGRect.width'] ||
			lieProps['SVGRect.x'] ||
			lieProps['SVGRect.y']
		) || false // detect lies
						
		const doc = phantomDarkness ? phantomDarkness.document : document

		const svgId = `${instanceId}-svg-div`
		const divElement = document.createElement('div')
		divElement.setAttribute('id', svgId)
		doc.body.appendChild(divElement)
		const divRendered = doc.getElementById(svgId)
		
		// patch div
		patch(divRendered, html`
		<div id="${svgId}">
			<div id="svg-container">
				<style>
				#svg-container {
					position: absolute;
					left: -9999px;
					height: auto;
				}
				#svgText {
					font-family: monospace !important;
					font-size: 100px;
					font-style: normal;
					font-weight: normal;
					letter-spacing: normal;
					line-break: auto;
					line-height: normal;
					text-transform: none;
					text-align: left;
					text-decoration: none;
					text-shadow: none;
					white-space: normal;
					word-break: normal;
					word-spacing: normal;
				}
				</style>
				<svg>
					<g id="svgBox">
						<text id="svgText" x="32" y="32" transform="scale(0.099999999)">
							qwertyuiopasdfghjklzxcvbnm
						</text>
					</g>
					<path id="svgPath" d="M 10 80 C 50 10, 75 10, 95 80 S 150 110, 150 110 S 80 190, 40 140 Z"/>
				</svg>
			</div>
		</div>
		`)
		
		const svgBox = doc.getElementById('svgBox')
		const bBox = {} // SVGRect 
		;(
			{
				height: bBox.height,
				width: bBox.width,
				x: bBox.x,
				y: bBox.y
			} = svgBox.getBBox()
		)
		
		const svgText = doc.getElementById('svgText')
		const subStringLength = svgText.getSubStringLength(1, 2)
		const extentOfChar = {} // SVGRect 
		;(
			{
				height: extentOfChar.height,
				width: extentOfChar.width,
				x: extentOfChar.x,
				y: extentOfChar.y
			} = svgText.getExtentOfChar('x')
		)
			
		const computedTextLength = svgText.getComputedTextLength()		
		const svgPath = doc.getElementById('svgPath')
		const totalLength = svgPath.getTotalLength()
		const pointAtLength = {} // SVGPoint 
		;(
			{
				x: pointAtLength.x,
				y: pointAtLength.y
			} = svgPath.getPointAtLength(1)
		)

		logTestResult({ start, test: 'svg', passed: true })

		const getSum = obj => !obj ? 0 : Object.keys(obj).reduce((acc, key) => acc += Math.abs(obj[key]), 0)
		return {
			bBox: getSum(bBox),
			subStringLength,
			extentOfChar: getSum(extentOfChar),
			computedTextLength,
			totalLength,
			pointAtLength: getSum(pointAtLength),
			lied
		}
	}
	catch (error) {
		logTestResult({ test: 'svg', passed: false })
		captureError(error)
		return
	}
}

export const svgHTML = ({ fp, note, hashSlice }) => {
	if (!fp.svg) {
		return `
		<div class="col-six undefined">
			<strong>SVG</strong>
			<div>bBox: ${note.blocked}</div>
			<div>pointAt: ${note.blocked}</div>
			<div>total: ${note.blocked}</div>
			<div>extentOfChar: ${note.blocked}</div>
			<div>subString: ${note.blocked}</div>
			<div>computedText: ${note.blocked}</div>
		</div>`
	}
	const {
		svg: {
			$hash,
			bBox,
			subStringLength,
			extentOfChar,
			computedTextLength,
			totalLength,
			pointAtLength,
			lied
		}
	} = fp

	return `
	<div class="col-six${lied ? ' rejected' : ''}">
		<strong>SVG</strong><span class="${lied ? 'lies ' : ''}hash">${hashSlice($hash)}</span>
		<div class="help" title="SVGGraphicsElement.getBBox()">bBox: ${bBox || note.blocked}</div>
		<div class="help" title="SVGGeometryElement.getPointAtLength()">pointAt: ${pointAtLength || note.blocked}</div>
		<div class="help" title="SVGGeometryElement.getTotalLength()">total: ${totalLength || note.blocked}</div>
		<div class="help" title="SVGTextContentElement.getExtentOfChar()">extentOfChar: ${extentOfChar || note.blocked}</div>
		<div class="help" title="SVGTextContentElement.getSubStringLength()">subString: ${subStringLength || note.blocked}</div>
		<div class="help" title="SVGTextContentElement.getComputedTextLength()">computedText: ${computedTextLength || note.blocked}</div>
	</div>
	`	
}
		