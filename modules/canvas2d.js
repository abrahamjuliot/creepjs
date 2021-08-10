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
		context.fillRect(0, 0, 186, 30)

		context.beginPath()
		context.arc(15.49, 15.51, 10.314, 0, Math.PI * 2)
		context.closePath()
		context.fill()

		return context
	}

	const getFileReaderData = async blob => {
		if (!blob) {
			return
		}
		const reader1 = new FileReader()
		const reader2 = new FileReader()
		const reader3 = new FileReader()
		const reader4 = new FileReader()
		reader1.readAsArrayBuffer(blob)
		reader2.readAsDataURL(blob)
		reader3.readAsBinaryString(blob)
		reader4.readAsText(blob)
		const [
			readAsArrayBuffer,
			readAsDataURL,
			readAsBinaryString,
			readAsText
		] = await Promise.all([
			new Promise(resolve => {
				reader1.onload = () => resolve(reader1.result)
			}),
			new Promise(resolve => {
				reader2.onload = () => resolve(reader2.result)
			}),
			new Promise(resolve => {
				reader3.onload = () => resolve(reader3.result)
			}),
			new Promise(resolve => {
				reader4.onload = () => resolve(reader4.result)
			})
		])
		return {
			readAsArrayBuffer: String.fromCharCode.apply(null, new Uint8Array(readAsArrayBuffer)),
			readAsBinaryString,
			readAsDataURL,
			readAsText
		}
	}

	const systemEmojis = [
		[128512],
		[9786],
		[129333, 8205, 9794, 65039],
		[9832],
		[9784],
		[9895],
		[8265],
		[8505],
		[127987, 65039, 8205, 9895, 65039],
		[129394],
		[9785],
		[9760],
		[129489, 8205, 129456],
		[129487, 8205, 9794, 65039],
		[9975],
		[129489, 8205, 129309, 8205, 129489],
		[9752],
		[9968],
		[9961],
		[9972],
		[9992],
		[9201],
		[9928],
		[9730],
		[9969],
		[9731],
		[9732],
		[9976],
		[9823],
		[9937],
		[9000],
		[9993],
		[9999],
		[10002],
		[9986],
		[9935],
		[9874],
		[9876],
		[9881],
		[9939],
		[9879],
		[9904],
		[9905],
		[9888],
		[9762],
		[9763],
		[11014],
		[8599],
		[10145],
		[11013],
		[9883],
		[10017],
		[10013],
		[9766],
		[9654],
		[9197],
		[9199],
		[9167],
		[9792],
		[9794],
		[10006],
		[12336],
		[9877],
		[9884],
		[10004],
		[10035],
		[10055],
		[9724],
		[9642],
		[10083],
		[10084],
		[9996],
		[9757],
		[9997],
		[10052],
		[9878],
		[8618],
		[9775],
		[9770],
		[9774],
		[9745],
		[10036],
		[127344],
		[127359]
	].map(emojiCode => String.fromCodePoint(...emojiCode))

	try {
		await new Promise(setTimeout).catch(e => { })
		const start = performance.now()

		const dataLie = lieProps['HTMLCanvasElement.toDataURL']
		const contextLie = lieProps['HTMLCanvasElement.getContext']
		const imageDataLie = lieProps['CanvasRenderingContext2D.getImageData']
		const textMetricsLie = lieProps['CanvasRenderingContext2D.measureText']
		let lied = (dataLie || contextLie || imageDataLie || textMetricsLie) || false

		const doc = phantomDarkness ? phantomDarkness.document : document
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

		// get system measurements
		const knownTextMetrics = {
			// Blink
			'169.9375': 'Linux', // Chrome OS
			'169.4443359375': 'Linux', // Chrome OS/CloudReady
			'164.6962890625': 'Linux', // Fedora/Ubuntu
			'170.4443359375': 'Linux', // Fedora/Ubuntu (onscreen)
			'173.9521484375': 'Windows', // Windows 10
			'163.5068359375': 'Windows', // Windows 7-8.1
			'156.5068359375': 'Windows', // Windows 7-8.1 (onscreen)
			'159.87109375': 'Android', // Android 8-11
			'161.93359375': 'Android', // Android 9/Chrome OS
			'160.021484375': 'Android', // Android 5-7
			'170.462890625': 'Apple', // Mac Yosemite-Big Sur
			'172.462890625': 'Apple', // Mac Mojave
			'162.462890625': 'Apple', // Mac Yosemite-Big Sur (onscreen)

			// Gecko (onscreen)
			'163.48333384195962': 'Linux', // Fedora/Ubuntu
			'163': 'Linux', // Ubuntu/Tor Browser
			'170.38938852945964': 'Windows', // Windows 10
			'159.9560546875': 'Windows', // Windows 7-8
			'165.9560546875': 'Windows', // Tor Browser
			'173.43938852945962': 'Apple', // Mac Yosemite-Big Sur (+Tor Browser)
			'159.70088922409784': 'Android', // Android 11
			'159.71331355882728': 'Android', // Android 11
			'159.59375152587893': 'Android', // Android 11
			'159.75551515467026': 'Android', // Android 10
			'161.7770797729492': 'Android', // Android 9
			
			// WebKit (onscreen)
			'172.955078125': 'Apple', // Mac, CriOS
		}

		const {
			actualBoundingBoxRight: systemActualBoundingBoxRight,
			width: systemWidth
		} = context.measureText('😀!@#$%^&*') || {}
		const textMetricsSystemSum = ((systemActualBoundingBoxRight || 0) + (systemWidth || 0)) || undefined
		const textMetricsSystemClass = knownTextMetrics[textMetricsSystemSum]
		
		const {
			actualBoundingBoxAscent,
			actualBoundingBoxDescent,
			actualBoundingBoxLeft,
			actualBoundingBoxRight,
			fontBoundingBoxAscent,
			fontBoundingBoxDescent,
			width
		} = context.measureText(systemEmojis.join('')) || {}
		const textMetrics = {
			actualBoundingBoxAscent,
			actualBoundingBoxDescent,
			actualBoundingBoxLeft,
			actualBoundingBoxRight,
			fontBoundingBoxAscent,
			fontBoundingBoxDescent,
			width
		}
		const { data: imageData } = context.getImageData(0, 0, canvas.width, canvas.height) || {}
		
		let canvasOffscreen
		try {
			canvasOffscreen = new OffscreenCanvas(186, 30)
			const contextOffscreen = canvasOffscreen.getContext('2d')
			fillRect(canvasOffscreen, contextOffscreen)
		}
		catch (error) { }

		const [
			blob,
			blobOffscreen
		] = await Promise.all([
			new Promise(resolve => canvas.toBlob(async blob => {
				const data = await getFileReaderData(blob)
				return resolve(data)
			})),
			getFileReaderData(canvasOffscreen && await canvasOffscreen.convertToBlob())
		])

		const points = getPointIn(canvas, context) // modifies width
		const mods = getPixelMods()

		// lies
		const {
			readAsArrayBuffer,
			readAsBinaryString,
			readAsDataURL,
			readAsText
		} = blob || {}
		
		const {
			readAsArrayBuffer: readAsArrayBufferOffscreen,
			readAsBinaryString: readAsBinaryStringOffscreen,
			readAsDataURL: readAsDataURLOffscreen,
			readAsText: readAsTextOffscreen
		} = blobOffscreen || {}
		const mismatchingFileData = (
			(readAsArrayBufferOffscreen && readAsArrayBufferOffscreen !== readAsArrayBuffer) ||
			(readAsBinaryStringOffscreen && readAsBinaryStringOffscreen !== readAsBinaryString) ||
			(readAsDataURLOffscreen && readAsDataURLOffscreen !== readAsDataURL) ||
			(readAsTextOffscreen && readAsTextOffscreen !== readAsText)
		)
		if (mismatchingFileData) {
			lied = true
			const iframeLie = `mismatching file data`
			documentLie(`FileReader`, iframeLie)
		}

		if (mods && mods.pixels) {
			lied = true
			const iframeLie = `pixel data modified`
			documentLie(`CanvasRenderingContext2D.getImageData`, iframeLie)
		}

		logTestResult({ start, test: 'canvas 2d', passed: true })
		return {
			dataURI,
			imageData: imageData ? String.fromCharCode.apply(null, imageData) : undefined,
			mods,
			points,
			blob,
			blobOffscreen,
			textMetrics: new Set(Object.keys(textMetrics)).size > 1 ? textMetrics : undefined,
			textMetricsSystemSum,
			textMetricsSystemClass,
			lied
		}
	}
	catch (error) {
		logTestResult({ test: 'canvas 2d', passed: false })
		captureError(error)
		return
	}
}

export const canvasHTML = ({ fp, note, modal, getMismatchStyle, hashMini, hashSlice }) => {
	if (!fp.canvas2d) {
		return `
		<div class="col-six undefined">
			<strong>Canvas 2d</strong> <span>${note.blocked}</span>
			<div>data: ${note.blocked}</div>
			<div>textMetrics: ${note.blocked}</div>
			<div>pixel trap:</div>
			<div class="icon-container pixels">${note.blocked}</div>
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
			textMetrics,
			textMetricsSystemSum,
			textMetricsSystemClass,
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
		
		return `
			<br>readAsArrayBuffer: ${!readAsArrayBuffer ? note.unsupported : getMismatchStyle(hash.readAsArrayBuffer.split(''), hashMini(readAsArrayBuffer).split(''))}
			<br>readAsBinaryString: ${!readAsBinaryString ? note.unsupported : getMismatchStyle(hash.readAsBinaryString.split(''), hashMini(readAsBinaryString).split(''))}
			<br>readAsDataURL: ${!readAsDataURL ? note.unsupported : getMismatchStyle(hash.dataURI.split(''), hashMini(readAsDataURL).split(''))}
			<br>readAsText: ${!readAsText ? note.unsupported : getMismatchStyle(hash.readAsText.split(''), hashMini(readAsText).split(''))}
		`
	}
	const { isPointInPath, isPointInStroke } = points || {}
	const dataTemplate = `
		${dataURI ? `<div class="icon-item canvas-data"></div>` : ''}
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

	const icon = {
		'Linux': '<span class="icon linux"></span>',
		'Apple': '<span class="icon apple"></span>',
		'Windows': '<span class="icon windows"></span>',
		'Android': '<span class="icon android"></span>'
	}
	
	const systemTextMetricsClassIcon = icon[textMetricsSystemClass]
	const textMetricsHash = hashMini(textMetrics)

	return `
	<div class="col-six${lied ? ' rejected' : ''}">
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
		<strong>Canvas 2d</strong><span class="${lied ? 'lies ' : ''}hash">${hashSlice($hash)}</span>
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
		<div class="help" title="CanvasRenderingContext2D.measureText()">textMetrics: ${
			!textMetrics ? note.blocked : modal(
				'creep-text-metrics',
				`<div>system: ${textMetricsSystemSum}</div><br>` +
				Object.keys(textMetrics).map(key => `<span>${key}: ${typeof textMetrics[key] == 'undefined' ? note.unsupported : textMetrics[key]}</span>`).join('<br>'),
				systemTextMetricsClassIcon ? `${systemTextMetricsClassIcon}${textMetricsHash}` :
					textMetricsHash
			)	
		}</div>
		<div class="help" title="CanvasRenderingContext2D.getImageData()">pixel trap: ${rgba ? `${modPercent}% rgba noise ${rgbaHTML}` : ''}</div>
		<div class="icon-container pixels">
			<div class="icon-item pixel-image-random"></div>
			${rgba ? `<div class="icon-item pixel-image"></div>` : ''}
		</div>
	</div>
	`
}