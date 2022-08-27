import { attempt, captureError } from '../errors'
import { lieProps, PHANTOM_DARKNESS, documentLie } from '../lies'
import { hashMini } from '../utils/crypto'
import { createTimer, queueEvent, LIKE_BRAVE, CSS_FONT_FAMILY, EMOJIS, logTestResult, performanceLogger, hashSlice, formatEmojiSet, IS_WEBKIT } from '../utils/helpers'
import { HTMLNote, modal } from '../utils/html'

// inspired by https://arkenfox.github.io/TZP/tests/canvasnoise.html
let pixelImageRandom = ''

const getPixelMods = () => {
	const pattern1 = []
	const pattern2 = []
	const len = 8 // canvas dimensions
	const alpha = 255
	const visualMultiplier = 5

	try {
		// create 2 canvas contexts
		const options = {
			willReadFrequently: true,
			desynchronized: true,
		}
		const canvasDisplay1 = document.createElement('canvas')
		const canvasDisplay2 = document.createElement('canvas')
		const canvas1 = document.createElement('canvas')
		const canvas2 = document.createElement('canvas')
		const contextDisplay1 = canvasDisplay1.getContext('2d', options)
		const contextDisplay2 = canvasDisplay2.getContext('2d', options)
		const context1 = canvas1.getContext('2d', options)
		const context2 = canvas2.getContext('2d', options)

		if (!contextDisplay1 || !contextDisplay2 || !context1 || !context2) {
			throw new Error('canvas context blocked')
		}

		// set the dimensions
		canvasDisplay1.width = len * visualMultiplier
		canvasDisplay1.height = len * visualMultiplier
		canvasDisplay2.width = len * visualMultiplier
		canvasDisplay2.height = len * visualMultiplier
		canvas1.width = len
		canvas1.height = len
		canvas2.width = len
		canvas2.height = len

		// fill canvas1 with random image data
		;[...Array(len)].forEach((e, x) => [...Array(len)].forEach((e, y) => {
			const red = ~~(Math.random() * 256)
			const green = ~~(Math.random() * 256)
			const blue = ~~(Math.random() * 256)
			const colors = `${red}, ${green}, ${blue}, ${alpha}`
			context1.fillStyle = `rgba(${colors})`
			context1.fillRect(x, y, 1, 1)
			// capture data in visuals
			contextDisplay1.fillStyle = `rgba(${colors})`
			contextDisplay1.fillRect(
				x * visualMultiplier,
				y * visualMultiplier,
				1 * visualMultiplier,
				1 * visualMultiplier,
			)
			return pattern1.push(colors) // collect the pixel pattern
		}))

		// fill canvas2 with canvas1 image data
		;[...Array(len)].forEach((e, x) => [...Array(len)].forEach((e, y) => {
			// get context1 pixel data and mirror to context2
			const {
				data: [red, green, blue, alpha],
			} = context1.getImageData(x, y, 1, 1) || {}
			const colors = `${red}, ${green}, ${blue}, ${alpha}`
			context2.fillStyle = `rgba(${colors})`
			context2.fillRect(x, y, 1, 1)

			// capture noise in visuals
			const {
				data: [red2, green2, blue2, alpha2],
			} = context2.getImageData(x, y, 1, 1) || {}
			const colorsDisplay = `
				${red != red2 ? red2 : 255},
				${green != green2 ? green2 : 255},
				${blue != blue2 ? blue2 : 255},
				${alpha != alpha2 ? alpha2 : 1}
			`
			contextDisplay2.fillStyle = `rgba(${colorsDisplay})`
			contextDisplay2.fillRect(
				x * visualMultiplier,
				y * visualMultiplier,
				1 * visualMultiplier,
				1 * visualMultiplier,
			)
			return pattern2.push(colors) // collect the pixel pattern
		}))

		// compare the pattern collections and collect diffs
		const patternDiffs = []
		const rgbaChannels = new Set()

		;[...Array(pattern1.length)].forEach((e, i) => {
			const pixelColor1 = pattern1[i]
			const pixelColor2 = pattern2[i]
			if (pixelColor1 != pixelColor2) {
				const rgbaValues1 = pixelColor1.split(',')
				const rgbaValues2 = pixelColor2.split(',')
				const colors = [
					rgbaValues1[0] != rgbaValues2[0] ? 'r' : '',
					rgbaValues1[1] != rgbaValues2[1] ? 'g' : '',
					rgbaValues1[2] != rgbaValues2[2] ? 'b' : '',
					rgbaValues1[3] != rgbaValues2[3] ? 'a' : '',
				].join('')
				rgbaChannels.add(colors)
				patternDiffs.push([i, colors])
			}
		})

		pixelImageRandom = canvasDisplay1.toDataURL() // template use only
		const pixelImage = canvasDisplay2.toDataURL()

		const rgba = rgbaChannels.size ? [...rgbaChannels].sort().join(', ') : undefined
		const pixels = patternDiffs.length || undefined
		return { rgba, pixels, pixelImage }
	} catch (error) {
		return console.error(error)
	}
}

// based on and inspired by https://github.com/antoinevastel/picasso-like-canvas-fingerprinting
const paintCanvas = ({
  canvas,
  context,
	strokeText = false,
	cssFontFamily = '',
  area = { width: 50, height: 50 },
  rounds = 10,
  maxShadowBlur = 50,
  seed = 500,
  offset = 2001000001,
  multiplier = 15000,
}) => {
  if (!context) {
    return
  }

  context.clearRect(0, 0, canvas.width, canvas.height)
  canvas.width = area.width
  canvas.height = area.height

  if (canvas.style) {
    canvas.style.display = 'none'
  }

  const createPicassoSeed = ({ seed, offset, multiplier }) => {
    let current = Number(seed) % Number(offset)
    const getNextSeed = () => {
      current = (Number(multiplier) * current) % Number(offset)
      return current
    }
    return {
      getNextSeed,
    }
  }

  const picassoSeed = createPicassoSeed({ seed, offset, multiplier })
  const { getNextSeed } = picassoSeed

  const patchSeed = (current, offset, maxBound, computeFloat) => {
    const result = (((current - 1) / offset) * (maxBound || 1)) || 0
    return computeFloat ? result : Math.floor(result)
  }

  const addRandomCanvasGradient = (context, offset, area, colors, getNextSeed) => {
    const { width, height } = area
    const canvasGradient = context.createRadialGradient(
      patchSeed(getNextSeed(), offset, width),
      patchSeed(getNextSeed(), offset, height),
      patchSeed(getNextSeed(), offset, width),
      patchSeed(getNextSeed(), offset, width),
      patchSeed(getNextSeed(), offset, height),
      patchSeed(getNextSeed(), offset, width),
    )
    canvasGradient.addColorStop(0, colors[patchSeed(getNextSeed(), offset, colors.length)])
    canvasGradient.addColorStop(1, colors[patchSeed(getNextSeed(), offset, colors.length)])
    context.fillStyle = canvasGradient
  }

  const colors = [
    '#FF6633', '#FFB399', '#FF33FF', '#FFFF99', '#00B3E6',
    '#E6B333', '#3366E6', '#999966', '#99FF99', '#B34D4D',
    '#80B300', '#809900', '#E6B3B3', '#6680B3', '#66991A',
    '#FF99E6', '#CCFF1A', '#FF1A66', '#E6331A', '#33FFCC',
    '#66994D', '#B366CC', '#4D8000', '#B33300', '#CC80CC',
    '#66664D', '#991AFF', '#E666FF', '#4DB3FF', '#1AB399',
    '#E666B3', '#33991A', '#CC9999', '#B3B31A', '#00E680',
    '#4D8066', '#809980', '#E6FF80', '#1AFF33', '#999933',
    '#FF3380', '#CCCC00', '#66E64D', '#4D80CC', '#9900B3',
    '#E64D66', '#4DB380', '#FF4D4D', '#99E6E6', '#6666FF',
  ]

	const drawOutlineOfText = (context, offset, area, getNextSeed) => {
		const { width, height } = area
		const fontSize = 2.99;
		context.font = `${height / fontSize}px ${cssFontFamily.replace(/!important/gm, '')}`;
		context.strokeText(
			'👾A',
			patchSeed(getNextSeed(), offset, width),
			patchSeed(getNextSeed(), offset, height),
			patchSeed(getNextSeed(), offset, width),
		);
	}

  const createCircularArc = (context, offset, area, getNextSeed) => {
    const { width, height } = area
    context.beginPath()
    context.arc(
      patchSeed(getNextSeed(), offset, width),
      patchSeed(getNextSeed(), offset, height),
      patchSeed(getNextSeed(), offset, Math.min(width, height)),
      patchSeed(getNextSeed(), offset, 2 * Math.PI, true),
      patchSeed(getNextSeed(), offset, 2 * Math.PI, true),
    )
    context.stroke()
  }

  const createBezierCurve = (context, offset, area, getNextSeed) => {
    const { width, height } = area
    context.beginPath()
    context.moveTo(
      patchSeed(getNextSeed(), offset, width),
      patchSeed(getNextSeed(), offset, height),
    )
    context.bezierCurveTo(
      patchSeed(getNextSeed(), offset, width),
      patchSeed(getNextSeed(), offset, height),
      patchSeed(getNextSeed(), offset, width),
      patchSeed(getNextSeed(), offset, height),
      patchSeed(getNextSeed(), offset, width),
      patchSeed(getNextSeed(), offset, height),
    )
    context.stroke()
  }

  const createQuadraticCurve = (context, offset, area, getNextSeed) => {
    const { width, height } = area
    context.beginPath()
    context.moveTo(
      patchSeed(getNextSeed(), offset, width),
      patchSeed(getNextSeed(), offset, height),
    )
    context.quadraticCurveTo(
      patchSeed(getNextSeed(), offset, width),
      patchSeed(getNextSeed(), offset, height),
      patchSeed(getNextSeed(), offset, width),
      patchSeed(getNextSeed(), offset, height),
    )
    context.stroke()
  }

  const createEllipticalArc = (context, offset, area, getNextSeed) => {
    if (!('ellipse' in context)) {
      return
    }
    const { width, height } = area
    context.beginPath()
    context.ellipse(
      patchSeed(getNextSeed(), offset, width),
      patchSeed(getNextSeed(), offset, height),
      patchSeed(getNextSeed(), offset, Math.floor(width / 2)),
      patchSeed(getNextSeed(), offset, Math.floor(height / 2)),
      patchSeed(getNextSeed(), offset, 2 * Math.PI, true),
      patchSeed(getNextSeed(), offset, 2 * Math.PI, true),
      patchSeed(getNextSeed(), offset, 2 * Math.PI, true),
    )
    context.stroke()
  }

  const methods = [
    createCircularArc,
    createBezierCurve,
    createQuadraticCurve,
  ]

	if (!IS_WEBKIT) methods.push(createEllipticalArc) // unstable in webkit
	if (strokeText) methods.push(drawOutlineOfText)

  ;[...Array(rounds)].forEach((x) => {
    addRandomCanvasGradient(context, offset, area, colors, getNextSeed)
    context.shadowBlur = patchSeed(getNextSeed(), offset, maxShadowBlur, true)
    context.shadowColor = colors[patchSeed(getNextSeed(), offset, colors.length)]
    const nextMethod = methods[patchSeed(getNextSeed(), offset, methods.length)]
    nextMethod(context, offset, area, getNextSeed)
    context.fill()
  })

  return
}


export default async function getCanvas2d() {
	try {
		const timer = createTimer()
		await queueEvent(timer)

		const dataLie = lieProps['HTMLCanvasElement.toDataURL']
		const contextLie = lieProps['HTMLCanvasElement.getContext']
		const imageDataLie = (
			lieProps['CanvasRenderingContext2D.fillText'] ||
			lieProps['CanvasRenderingContext2D.font'] ||
			lieProps['CanvasRenderingContext2D.getImageData'] ||
			lieProps['CanvasRenderingContext2D.strokeText']
		)
		const codePointLie = lieProps['String.fromCodePoint']
		let textMetricsLie = (
			lieProps['CanvasRenderingContext2D.measureText'] ||
			lieProps['TextMetrics.actualBoundingBoxAscent'] ||
			lieProps['TextMetrics.actualBoundingBoxDescent'] ||
			lieProps['TextMetrics.actualBoundingBoxLeft'] ||
			lieProps['TextMetrics.actualBoundingBoxRight'] ||
			lieProps['TextMetrics.fontBoundingBoxAscent'] ||
			lieProps['TextMetrics.fontBoundingBoxDescent'] ||
			lieProps['TextMetrics.width']
		)
		let lied = (
			dataLie ||
			contextLie ||
			imageDataLie ||
			textMetricsLie ||
			codePointLie
		) || false

		// create canvas context
		let win = window
		if (!LIKE_BRAVE && PHANTOM_DARKNESS) {
			win = PHANTOM_DARKNESS
		}
		const doc = win.document

		const canvas = doc.createElement('canvas')
		const context = canvas.getContext('2d')
		const canvasCPU = doc.createElement('canvas')
		const contextCPU = canvasCPU.getContext('2d', {
			desynchronized: true,
			willReadFrequently: true,
		})

		if (!context) {
			throw new Error('canvas context blocked')
		}

		await queueEvent(timer)
		paintCanvas({
			canvas,
			context,
			strokeText: true,
			cssFontFamily: CSS_FONT_FAMILY,
			area: { width: 75, height: 75 },
			rounds: 10,
		})

		const dataURI = canvas.toDataURL()

		await queueEvent(timer)
		const mods = getPixelMods()

		// TextMetrics: get emoji set and system
		await queueEvent(timer)
		context.font = `10px ${CSS_FONT_FAMILY.replace(/!important/gm, '')}`
		const pattern = new Set()
		const emojiSet = EMOJIS.reduce((emojiSet, emoji) => {
			const {
				actualBoundingBoxAscent,
				actualBoundingBoxDescent,
				actualBoundingBoxLeft,
				actualBoundingBoxRight,
				fontBoundingBoxAscent,
				fontBoundingBoxDescent,
				width,
			} = context.measureText(emoji) || {}
			const dimensions = [
				actualBoundingBoxAscent,
				actualBoundingBoxDescent,
				actualBoundingBoxLeft,
				actualBoundingBoxRight,
				fontBoundingBoxAscent,
				fontBoundingBoxDescent,
				width,
			].join(',')
			if (!pattern.has(dimensions)) {
				pattern.add(dimensions)
				emojiSet.add(emoji)
			}
			return emojiSet
		}, new Set())

		// textMetrics System Sum
		const textMetricsSystemSum = 0.00001 * [...pattern].map((x) => {
			return x.split(',').reduce((acc, x) => acc += (+x||0), 0)
		}).reduce((acc, x) => acc += x, 0)

		// Paint
		const maxSize = 75
		await queueEvent(timer)
		paintCanvas({
			canvas,
			context,
			area: { width: maxSize, height: maxSize },
		}) // clears image
		const paintURI = canvas.toDataURL()

		// Paint with CPU
		await queueEvent(timer)
		paintCanvas({
			canvas: canvasCPU,
			context: contextCPU,
			area: { width: maxSize, height: maxSize },
		}) // clears image
		const paintCpuURI = canvasCPU.toDataURL()

		// Text
		context.restore()
		context.clearRect(0, 0, canvas.width, canvas.height)
		canvas.width = 50
		canvas.height = 50
		context.font = `50px ${CSS_FONT_FAMILY.replace(/!important/gm, '')}`
		context.fillText('A', 7, 37)
		const textURI = canvas.toDataURL()

		// Emoji
		context.restore()
		context.clearRect(0, 0, canvas.width, canvas.height)
		canvas.width = 50
		canvas.height = 50
		context.font = `35px ${CSS_FONT_FAMILY.replace(/!important/gm, '')}`
		context.fillText('👾', 0, 37)
		const emojiURI = canvas.toDataURL()

		// lies
		context.clearRect(0, 0, canvas.width, canvas.height)
		if ((mods && mods.pixels) || !!Math.max(...context.getImageData(0, 0, 8, 8).data)) {
			lied = true
			documentLie(`CanvasRenderingContext2D.getImageData`, `pixel data modified`)
		}

		const getTextMetricsFloatLie = (context) => {
			const isFloat = (n) => n % 1 !== 0
			const {
				actualBoundingBoxAscent: abba,
				actualBoundingBoxDescent: abbd,
				actualBoundingBoxLeft: abbl,
				actualBoundingBoxRight: abbr,
				fontBoundingBoxAscent: fbba,
				fontBoundingBoxDescent: fbbd,
				// width: w,
			} = context.measureText('') || {}
			const lied = [
				abba,
				abbd,
				abbl,
				abbr,
				fbba,
				fbbd,
			].find((x) => isFloat((x || 0)))
			return lied
		}
		await queueEvent(timer)
		if (getTextMetricsFloatLie(context)) {
			textMetricsLie = true
			lied = true
			documentLie(
				'CanvasRenderingContext2D.measureText',
				'metric noise detected',
			)
		}

		logTestResult({ time: timer.stop(), test: 'canvas 2d', passed: true })
		return {
			dataURI,
			paintURI,
			paintCpuURI,
			textURI,
			emojiURI,
			mods,
			textMetricsSystemSum,
			liedTextMetrics: textMetricsLie,
			emojiSet: [...emojiSet],
			lied,
		}
	}	catch (error) {
		logTestResult({ test: 'canvas 2d', passed: false })
		captureError(error)
		return
	}
}

export function canvasHTML(fp) {
	if (!fp.canvas2d) {
		return `
		<div class="col-six undefined">
			<strong>Canvas 2d</strong> <span>${HTMLNote.BLOCKED}</span>
			<div>data: ${HTMLNote.BLOCKED}</div>
			<div>rendering:</div>
			<div class="icon-pixel-container pixels">${HTMLNote.BLOCKED}</div>
			<div class="icon-pixel-container pixels">${HTMLNote.BLOCKED}</div>
			<div>textMetrics:</div>
			<div class="block-text">${HTMLNote.BLOCKED}</div>
		</div>`
	}

	const {
		canvas2d: {
			lied,
			dataURI,
			paintURI,
			paintCpuURI,
			textURI,
			emojiURI,
			mods,
			emojiSet,
			textMetricsSystemSum,
			$hash,
		},
	} = fp
	const { pixels, rgba, pixelImage } = mods || {}
	const modPercent = pixels ? Math.round((pixels / 400) * 100) : 0

	const hash = {
		dataURI: hashMini(dataURI),
		textURI: hashMini(textURI),
		emojiURI: hashMini(emojiURI),
		paintURI: hashMini(paintURI),
		paintCpuURI: hashMini(paintCpuURI),
	}
	const dataTemplate = `
		${textURI ? `<div class="icon-pixel text-image"></div>` : ''}
		<br>text: ${!textURI ? HTMLNote.BLOCKED : hash.textURI}

		<br><br>
		${emojiURI ? `<div class="icon-pixel emoji-image"></div>` : ''}
		<br>emoji: ${!emojiURI ? HTMLNote.BLOCKED : hash.emojiURI}

		<br><br>
		${paintURI ? `<div class="icon-pixel paint-image"></div>` : ''}
		<br>paint (GPU): ${!paintURI ? HTMLNote.BLOCKED : hash.paintURI}

		<br><br>
		${paintCpuURI ? `<div class="icon-pixel paint-cpu-image"></div>` : ''}
		<br>paint (CPU): ${!paintCpuURI ? HTMLNote.BLOCKED : hash.paintCpuURI}

		<br><br>
		${dataURI ? `<div class="icon-pixel combined-image"></div>` : ''}
		<br>combined: ${!dataURI ? HTMLNote.BLOCKED : hash.dataURI}
	`

	// rgba: "b, g, gb, r, rb, rg, rgb"
	const rgbaHTML = !rgba ? rgba : rgba.split(', ').map((s) => s.split('').map((c) => {
		const css = {
			r: 'red',
			g: 'green',
			b: 'blue',
		}
		return `<span class="rgba rgba-${css[c]}"></span>`
	}).join('')).join(' ')

	const emojiHelpTitle = `CanvasRenderingContext2D.measureText()\nhash: ${hashMini(emojiSet)}\n${emojiSet.map((x, i) => i && (i % 6 == 0) ? `${x}\n` : x).join('')}`

	return `
	<div class="relative col-six${lied ? ' rejected' : ''}">
		<style>
			.pixels {
				padding: 19px;
				position: relative;
				overflow: hidden;
			}
			.canvas-data {
				max-width: 200px;
				height: 50px;
				transform: scale(1);
				background-image: url(${dataURI})
			}
			.pixel-image,
			.pixel-image-random,
			.combined-image,
			.paint-image,
			.paint-cpu-image,
			.text-image,
			.emoji-image {
				max-width: 35px;
    		border-radius: 50%;
				transform: scale(1.5);
			}
			.pixel-image {
				background-image: url(${pixelImage})
			}
			.pixel-image-random {
				background-image: url(${pixelImageRandom})
			}
			.paint-image {
				background-image: url(${paintURI})
			}
			.paint-cpu-image {
				background-image: url(${paintCpuURI})
			}
			.text-image {
				background-image: url(${textURI})
			}
			.emoji-image {
				background-image: url(${emojiURI})
			}
			.combined-image {
				background-image: url(${dataURI})
			}
			.rgba {
				width: 8px;
				height: 8px;
				display: inline-block;
				border-radius: 50%;
			}
			.rgba-red {
				background: #ff000c4a;
			}
			.rgba-green {
				background: #00ff584a;
			}
			.rgba-blue {
				background: #009fff5e;
			}
			@media (prefers-color-scheme: dark) {
				.rgba-red {
					background: #e19fa2;
				}
				.rgba-green {
					background: #98dfb1;
				}
				.rgba-blue {
					background: #67b7ff;
				}
			}
		</style>
		<span class="aside-note">${performanceLogger.getLog()['canvas 2d']}</span>
		<strong>Canvas 2d</strong><span class="${lied ? 'lies ' : ''}hash">${hashSlice($hash)}</span>
		<div class="help" title="HTMLCanvasElement.toDataURL()\nCanvasRenderingContext2D.getImageData()">data: ${
			modal(
				'creep-canvas-data',
				dataTemplate,
				hashMini({
					dataURI,
					pixelImage,
					paintURI,
					paintCpuURI,
					textURI,
					emojiURI,
				}),
			)
		}</div>
		<div class="help" title="CanvasRenderingContext2D.getImageData()">rendering: ${rgba ? `${modPercent}% rgba noise ${rgbaHTML}` : ''}</div>
		<div class="icon-pixel-container pixels">
			${textURI ? `<div class="icon-pixel text-image"></div>` : ''}
			${emojiURI ? `<div class="icon-pixel emoji-image"></div>` : ''}
			${paintCpuURI ? `<div class="icon-pixel paint-cpu-image"></div>` : ''}
			${dataURI ? `<div class="icon-pixel combined-image"></div>` : ''}
		</div>
		<div class="icon-pixel-container pixels">
			<div class="icon-pixel pixel-image-random"></div>
			${rgba ? `<div class="icon-pixel pixel-image"></div>` : ''}
		</div>
		<div>textMetrics:</div>
		<div class="block-text help relative" title="${emojiHelpTitle}">
			<span>${textMetricsSystemSum || HTMLNote.UNSUPPORTED}</span>
			<span class="grey jumbo" style="font-family: ${CSS_FONT_FAMILY}">
				${formatEmojiSet(emojiSet)}
			</span>
		</div>
	</div>
	`
}
