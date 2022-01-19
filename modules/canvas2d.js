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
		const canvasDisplay1 = document.createElement('canvas')
		const canvasDisplay2 = document.createElement('canvas')
		const canvas1 = document.createElement('canvas')
		const canvas2 = document.createElement('canvas')
		const contextDisplay1 = canvasDisplay1.getContext('2d')
		const contextDisplay2 = canvasDisplay2.getContext('2d')
		const context1 = canvas1.getContext('2d')
		const context2 = canvas2.getContext('2d')

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
				1 * visualMultiplier
			)
			return pattern1.push(colors) // collect the pixel pattern
		}))

		// fill canvas2 with canvas1 image data
		;[...Array(len)].forEach((e, x) => [...Array(len)].forEach((e, y) => {
			// get context1 pixel data and mirror to context2
			const {
				data: [red, green, blue, alpha]
			} = context1.getImageData(x, y, 1, 1) || {}
			const colors = `${red}, ${green}, ${blue}, ${alpha}`
			context2.fillStyle = `rgba(${colors})`
			context2.fillRect(x, y, 1, 1)

			// capture noise in visuals
			const {
				data: [red2, green2, blue2, alpha2]
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
				1 * visualMultiplier
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
					rgbaValues1[3] != rgbaValues2[3] ? 'a' : ''
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
	}
	catch (error) {
		return console.error(error)
	}
}

const getPointIn = (canvas, context) => {
	canvas.width = canvas.height
	context.fillStyle = 'rgba(0, 0, 0, 1)'
	context.beginPath()
	context.arc(0, 0, 10, 0, Math.PI * 2)
	context.closePath()
	context.fill()
	const isPointInPath = []
	const isPointInStroke = []
	;[...Array(canvas.width)].forEach((e, x) => [...Array(canvas.height)].forEach((e, y) => {
		context.isPointInPath(x, y) && isPointInPath.push([x, y])
		return context.isPointInStroke(x, y) && isPointInStroke.push([x, y])
	}))
	return {
		isPointInPath: isPointInPath.length ? isPointInPath : undefined,
		isPointInStroke: isPointInStroke.length ? isPointInStroke : undefined
	}
}

export const getCanvas2d = async imports => {

	const {
		require: {
			queueEvent,
			createTimer,
			getEmojis,
			captureError,
			lieProps,
			documentLie,
			phantomDarkness,
			dragonOfDeath,
			logTestResult
		}
	} = imports

	const fillRect = (canvas, context) => {
		canvas.width = 186
		canvas.height = 30
		const str = `😃🙌🧠🦄🐉🌊🍧🏄‍♀️🌠🔮`
		context.font = '14px Arial'
		context.fillText(str, 0, 20)
		context.fillStyle = 'rgba(0, 0, 0, 0)'
		context.fillRect(0, 0, canvas.width, canvas.height)
		context.beginPath()
		context.arc(15.49, 15.51, 10.314, 0, Math.PI * 2)
		context.closePath()
		context.fill()
		return context
	}

	const getFileReaderData = blob => {
		if (!blob) {
			return []
		}
		const getRead = (method, blob) => new Promise(resolve => {
			const reader = new FileReader()
			reader[method](blob)
			return reader.addEventListener('loadend', () => resolve(reader.result))
		})
		return Promise.all([
			getRead('readAsArrayBuffer', blob),
			getRead('readAsBinaryString', blob),
			getRead('readAsDataURL', blob),
			getRead('readAsText', blob),
		])
	}

	try {
		const timer = createTimer()
		await queueEvent(timer)

		const dataLie = lieProps['HTMLCanvasElement.toDataURL']
		const contextLie = lieProps['HTMLCanvasElement.getContext']
		const imageDataLie = lieProps['CanvasRenderingContext2D.getImageData']
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
		let lied = (dataLie || contextLie || imageDataLie || textMetricsLie) || false
		const doc = (
			phantomDarkness &&
			phantomDarkness.document &&
			phantomDarkness.document.body ? phantomDarkness.document :
				document
		)

		const canvas = doc.createElement('canvas')
		const context = canvas.getContext('2d')
		fillRect(canvas, context)
		const dataURI = canvas.toDataURL()

		if (dragonOfDeath) {
			const result1 = dragonOfDeath.document.createElement('canvas').toDataURL()
			const result2 = document.createElement('canvas').toDataURL()
			if (result1 != result2) {
				lied = true
				const iframeLie = `expected x in nested iframe and got y`
				documentLie(`HTMLCanvasElement.toDataURL`, iframeLie)
			}
		}
			
		const { data: imageData } = context.getImageData(0, 0, canvas.width, canvas.height) || {}
		
		let canvasOffscreen
		try {
			canvasOffscreen = new OffscreenCanvas(186, 30)
			const contextOffscreen = canvasOffscreen.getContext('2d')
			fillRect(canvasOffscreen, contextOffscreen)
		}
		catch (error) { }

		await queueEvent(timer)
		const [
			fileReaderData,
			fileReaderDataOffscreen
		] = await Promise.all([
			new Promise(resolve => canvas.toBlob(blob => {
				return resolve(getFileReaderData(blob))
			})),
			getFileReaderData(canvasOffscreen && await canvasOffscreen.convertToBlob())
		])
		const [arrayBuffer, binaryString, dataURL, text] = fileReaderData || {}
		const [
			arrayBufferOffScreen,
			binaryStringOffscreen,
			dataURLOffscreen,
			textOffscreen
		] = fileReaderDataOffscreen || {}
		const blob = {
			readAsArrayBuffer: String.fromCharCode.apply(null, new Uint8Array(arrayBuffer)) || undefined,
			readAsBinaryString: binaryString,
			readAsDataURL: dataURL,
			readAsText: text
		}
		const blobOffscreen = {
			readAsArrayBuffer: String.fromCharCode.apply(null, new Uint8Array(arrayBufferOffScreen)) || undefined,
			readAsBinaryString: binaryStringOffscreen,
			readAsDataURL: dataURLOffscreen,
			readAsText: textOffscreen
		}

		await queueEvent(timer)
		const points = getPointIn(canvas, context) // modifies width
		const mods = getPixelMods()

		// get fonts
		const emojis = getEmojis()
		const measureFonts = (context, font, emojis) => {
			//const emoji = String.fromCodePoint(128512)
			context.font = `256px ${font}`
			const metrics = context.measureText(emojis.join(''))
			return {
				ascent: metrics.actualBoundingBoxAscent,
				descent: metrics.actualBoundingBoxDescent,
				left: metrics.actualBoundingBoxLeft,
				right: metrics.actualBoundingBoxRight,
				width: metrics.width,
				fontAscent: metrics.fontBoundingBoxAscent,
				fontDescent: metrics.fontBoundingBoxDescent
			}
		}
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
		const base = baseFonts.reduce((acc, font) => {
			acc[font] = measureFonts(context, font, emojis)
			return acc
		}, {})
		const detectedEmojiFonts = families.reduce((acc, family) => {
			const basefont = /, (.+)/.exec(family)[1]
			const dimensions = measureFonts(context, family, emojis)
			console.log(dimensions)
			const font = /\'(.+)\'/.exec(family)[1]
			const found = (
				dimensions.ascent != base[basefont].ascent ||
				dimensions.descent != base[basefont].descent ||
				dimensions.left != base[basefont].left ||
				dimensions.right != base[basefont].right ||
				dimensions.width != base[basefont].width ||
				dimensions.fontAscent != base[basefont].fontAscent ||
				dimensions.fontDescent != base[basefont].fontDescent
			)
			if (found) {
				acc.add(font)
			}
			return acc
		}, new Set())
		
		// get emojis
		context.font = `200px 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', sans-serif`
		const pattern = new Set()
		const emojiMetrics = emojis.map(emoji => {
			return {
				emoji,
				metrics: (context.measureText(emoji) || {})
			}
		})
		// get emoji set and system
		const emojiSet = emojiMetrics.filter(emoji => {
			const {
				actualBoundingBoxAscent,
				actualBoundingBoxDescent,
				actualBoundingBoxLeft,
				actualBoundingBoxRight,
				fontBoundingBoxAscent,
				fontBoundingBoxDescent,
				width
			} = emoji.metrics
			const dimensions = [
				actualBoundingBoxAscent,
				actualBoundingBoxDescent,
				actualBoundingBoxLeft,
				actualBoundingBoxRight,
				fontBoundingBoxAscent,
				fontBoundingBoxDescent,
				width
			].join(',')
			if (pattern.has(dimensions)) {
				return false
			}
			pattern.add(dimensions)
			return true
		})
		.map(emoji => emoji.emoji)

		// textMetrics System Sum
		const textMetricsSum = 0.00001 * [...pattern].map(x => {
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

		const textMetricsSystemSum = amplifySum(textMetricsSum, detectedEmojiFonts)
	
		// lies
		if (mods && mods.pixels) {
			lied = true
			const iframeLie = `pixel data modified`
			documentLie(`CanvasRenderingContext2D.getImageData`, iframeLie)
		}
		
		const getTextMetricsFloatLie = context => {
			const isFloat = n => n % 1 !== 0
			const {
				actualBoundingBoxAscent: abba,
				actualBoundingBoxDescent: abbd,
				actualBoundingBoxLeft: abbl,
				actualBoundingBoxRight: abbr,
				fontBoundingBoxAscent: fbba,
				fontBoundingBoxDescent: fbbd,
				width: w
			} = context.measureText('') || {}
			const lied = [
				abba,
				abbd,
				abbl,
				abbr,
				fbba,
				fbbd
			].find(x => isFloat((x || 0)))
			return lied
		}
		await queueEvent(timer)
		if (getTextMetricsFloatLie(context)) {
			textMetricsLie = true
			lied = true
			documentLie(
				'CanvasRenderingContext2D.measureText',
				'metric noise detected'
			)
		}
		const imageDataCompressed = (
			imageData ? String.fromCharCode.apply(null, imageData) : undefined
		)
		
		logTestResult({ time: timer.stop(), test: 'canvas 2d', passed: true })
		return {
			dataURI,
			imageData: imageDataCompressed,
			mods,
			points,
			blob,
			blobOffscreen,
			textMetricsSystemSum,
			liedTextMetrics: textMetricsLie,
			emojiSet,
			emojiFonts: [...detectedEmojiFonts],
			lied
		}
	}
	catch (error) {
		logTestResult({ test: 'canvas 2d', passed: false })
		captureError(error)
		return
	}
}

export const canvasHTML = ({ fp, note, modal, getDiffs, hashMini, hashSlice, formatEmojiSet, performanceLogger }) => {
	if (!fp.canvas2d) {
		return `
		<div class="col-six undefined">
			<strong>Canvas 2d</strong> <span>${note.blocked}</span>
			<div>emojis: ${note.blocked}</div>
			<div>sum: ${note.blocked}</div>
			<div>data: ${note.blocked}</div>
			<div>pixel trap:</div>
			<div class="icon-pixel-container pixels">${note.blocked}</div>
		</div>`
	}
			
	const {
		canvas2d: {
			lied,
			dataURI,
			imageData,
			mods,
			points,
			blob,
			blobOffscreen,
			emojiSet,
			emojiFonts,
			textMetricsSystemSum,
			$hash
		}
	} = fp
	const { pixels, rgba, pixelImage } = mods || {}
	const modPercent = pixels ? Math.round((pixels / 400) * 100) : 0

	const {
		readAsArrayBuffer,
		readAsBinaryString,
		readAsDataURL,
		readAsText
	} = blob || {}

	const hash = {
		dataURI: hashMini(dataURI),
		readAsArrayBuffer: hashMini(readAsArrayBuffer),
		readAsBinaryString: hashMini(readAsBinaryString),
		readAsDataURL: hashMini(readAsDataURL),
		readAsText: hashMini(readAsText)
		
	}

	const getBlobtemplate = blob => {
		const {
			readAsArrayBuffer,
			readAsBinaryString,
			readAsDataURL,
			readAsText
		} = blob || {}
    	const decorate = diff => `<span class="bold-fail">${diff}</span>`
		return `
			<br>readAsArrayBuffer: ${
				!readAsArrayBuffer ? note.unsupported : getDiffs({
					stringA: hash.readAsArrayBuffer,
					stringB: hashMini(readAsArrayBuffer),
					charDiff: true,
					decorate
				})
			}
			<br>readAsBinaryString: ${
				!readAsBinaryString ? note.unsupported : getDiffs({
					stringA: hash.readAsBinaryString,
					stringB: hashMini(readAsBinaryString),
					charDiff: true,
					decorate
				})
			}
			<br>readAsDataURL: ${
				!readAsDataURL ? note.unsupported : getDiffs({
					stringA: hash.dataURI,
					stringB: hashMini(readAsDataURL),
					charDiff: true,
					decorate
				})
			}
			<br>readAsText: ${
				!readAsText ? note.unsupported : getDiffs({
					stringA: hash.readAsText,
					stringB: hashMini(readAsText),
					charDiff: true,
					decorate
				})
			}
		`
	}
	const { isPointInPath, isPointInStroke } = points || {}
	const dataTemplate = `
		${dataURI ? `<div class="icon-pixel canvas-data"></div>` : ''}
		<br>toDataURL: ${!dataURI ? note.blocked : hash.dataURI}
		<br>getImageData: ${!imageData ? note.blocked : hashMini(imageData)}
		<br>isPointInPath: ${!isPointInPath ? note.blocked : hashMini(isPointInPath)}
		<br>isPointInStroke: ${!isPointInStroke ? note.blocked : hashMini(isPointInStroke)}
		<br><br><strong>HTMLCanvasElement.toBlob</strong>
		${getBlobtemplate(blob)}
		<br><br><strong>OffscreenCanvas.convertToBlob</strong>
		${getBlobtemplate(blobOffscreen)}
	`

	// rgba: "b, g, gb, r, rb, rg, rgb"
	const rgbaHTML = !rgba ? rgba : rgba.split(', ').map(s => s.split('').map(c => {
		const css = {
			r: 'red',
			g: 'green',
			b: 'blue',
		}
		return `<span class="rgba rgba-${css[c]}"></span>`
	}).join('')).join(' ')

	const emojiHelpTitle = `CanvasRenderingContext2D.measureText()\nhash: ${hashMini(emojiSet)}\n${emojiSet.map((x,i) => i && (i % 6 == 0) ? `${x}\n` : x).join('')}`

	return `
	<div class="relative col-six${lied ? ' rejected' : ''}">
		<style>
			.pixels {
				padding: 10px;
				position: relative;
				overflow: hidden;
			}
			.canvas-data {
				max-width: 200px;
				height: 30px;
				background-image: url(${dataURI})
			}
			.pixel-image,
			.pixel-image-random {
				max-width: 75px;
    			border-radius: 50%;
			}
			.pixel-image {
				background-image: url(${pixelImage})
			}
			.pixel-image-random {
				background-image: url(${pixelImageRandom})
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
		<div class="help relative" title="${emojiHelpTitle}">emojis: <span class="grey">${formatEmojiSet(emojiSet)}</span>
			<span class="confidence-note">${
				!emojiFonts.length ? '' : `${emojiFonts[0].split(' ')[0]}...`
			}</span>
		</div>
		<div class="help" title="CanvasRenderingContext2D.measureText()">sum: ${textMetricsSystemSum}</div>
		<div class="help" title="HTMLCanvasElement.toDataURL()\nCanvasRenderingContext2D.getImageData()\nCanvasRenderingContext2D.isPointInPath()\nCanvasRenderingContext2D.isPointInStroke()\nHTMLCanvasElement.toBlob()\nOffscreenCanvas.convertToBlob()\nFileReader.readAsArrayBuffer()\nFileReader.readAsBinaryString()\nFileReader.readAsDataURL()\nFileReader.readAsText()">data: ${
			modal(
				'creep-canvas-data',
				dataTemplate,
				hashMini({
					dataURI,
					imageData,
					points,
					blob,
					blobOffscreen
				})
			)
		}</div>
		<div class="help" title="CanvasRenderingContext2D.getImageData()">pixel trap: ${rgba ? `${modPercent}% rgba noise ${rgbaHTML}` : ''}</div>
		<div class="icon-pixel-container pixels">
			<div class="icon-pixel pixel-image-random"></div>
			${rgba ? `<div class="icon-pixel pixel-image"></div>` : ''}
		</div>
	</div>
	`
}