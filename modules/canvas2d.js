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
		canvasDisplay1.width = len*visualMultiplier
		canvasDisplay1.height = len*visualMultiplier
		canvasDisplay2.width = len*visualMultiplier
		canvasDisplay2.height = len*visualMultiplier
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
				x*visualMultiplier,
				y*visualMultiplier,
				1*visualMultiplier,
				1*visualMultiplier
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
				x*visualMultiplier,
				y*visualMultiplier,
				1*visualMultiplier,
				1*visualMultiplier
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
		console.error(error)
		return
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

	try {
		const start = performance.now()
		const dataLie = lieProps['HTMLCanvasElement.toDataURL']
		const contextLie = lieProps['HTMLCanvasElement.getContext']
		let lied = (dataLie || contextLie) || false
		const doc = phantomDarkness ? phantomDarkness.document : document
		const canvas = doc.createElement('canvas')
		const context = canvas.getContext('2d')
		const str = '!😃🙌🧠👩‍💻👟👧🏻👩🏻‍🦱👩🏻‍🦰👱🏻‍♀️👩🏻‍🦳👧🏼👧🏽👧🏾👧🏿🦄🐉🌊🍧🏄‍♀️🌠🔮♞'
		context.font = '14px Arial'
		context.fillText(str, 0, 50)
		context.fillStyle = 'rgba(100, 200, 99, 0.78)'
		context.fillRect(100, 30, 80, 50)
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
		const mods = getPixelMods()
		if (mods && mods.pixels) {
			lied = true
			const iframeLie = `pixel data modified`
			documentLie(`CanvasRenderingContext2D.getImageData`, iframeLie)
		}
		logTestResult({ start, test: 'canvas 2d', passed: true })
		return { dataURI, mods, lied }
	}
	catch (error) {
		logTestResult({ test: 'canvas 2d', passed: false })
		captureError(error)
		return
	}
}

export const canvasHTML = ({ fp, note, hashMini, hashSlice }) => {
	if (!fp.canvas2d) {
		return `
		<div class="col-six undefined">
			<strong>Canvas 2d</strong> <span>${note.blocked}</span>
			<div>data:${note.blocked}</div>
			<div>pixels:</div>
			<div class="icon-container pixels">${note.blocked}</div>
		</div>`
	}
	const { canvas2d: { lied, mods, dataURI, $hash } } = fp
	const { pixels, rgba, pixelImage } = mods || {}
	const modPercent = pixels ? Math.round((pixels/400)*100) : 0

	// rgba: "b, g, gb, r, rb, rg, rgb"
	const rgbaHTML= !rgba ? rgba : rgba.split(', ').map(s => s.split('').map(c => {
		const css = {
			r: 'red',
			g: 'green',
			b: 'blue',
		}
		return `<span class="rgba rgba-${css[c]}"></span>`
	}).join('')).join(' ')
	return `
	<div class="col-six${lied ? ' rejected' : ''}">
		<style>
			.pixels {
				padding: 10px;
				position: relative;
				overflow: hidden;
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
		<div class="help" title="HTMLCanvasElement.toDataURL()">data: ${hashMini(dataURI)}</div>
		<div class="help" title="CanvasRenderingContext2D.getImageData()">pixels: ${rgba ? `${modPercent}% rgba noise ${rgbaHTML}` : ''}</div>
		<div class="icon-container pixels">
			<div class="icon-item pixel-image-random"></div>
			${rgba ? `<div class="icon-item pixel-image"></div>` : ''}
		</div>
	</div>
	`
}