// inspired by Lalit Patel's fontdetect.js
// https://www.lalit.org/wordpress/wp-content/uploads/2008/05/fontdetect.js?ver=0.3

const getTextMetrics = (context, font) => {
	context.font = `256px ${font}`
	const metrics = context.measureText('mmmmmmmmmmlli')
	return {
		ascent: Math.round(metrics.actualBoundingBoxAscent),
		descent: Math.round(metrics.actualBoundingBoxDescent),
		left: Math.round(metrics.actualBoundingBoxLeft),
		right: Math.round(metrics.actualBoundingBoxRight),
		width: Math.round(metrics.width),
		fontAscent: Math.round(metrics.fontBoundingBoxAscent),
		fontDescent: Math.round(metrics.fontBoundingBoxDescent)
	}
}
export const getFonts = (imports, fonts) => {

	const {
		require: {
			captureError,
			lieProps,
			phantomDarkness,
			logTestResult
		}
	} = imports

	return new Promise(async resolve => {
		try {
			const start = performance.now()
			const win = phantomDarkness ? phantomDarkness : window
			const doc = win.document
			const offscreenCanvas = win.OffscreenCanvas
			const context = (
				('OffscreenCanvas' in window) ?
				new offscreenCanvas(500, 200).getContext('2d') :
				doc.createElement('canvas').getContext('2d')
			)

			if (!context) {
				throw new Error(`Context blocked or not supported`) 
			}

			const baseFonts = ['monospace', 'sans-serif', 'serif']
			const families = fonts.reduce((acc, font) => {
				baseFonts.forEach(baseFont => acc.push(`'${font}', ${baseFont}`))
				return acc
			}, [])

			const detected = new Set()
			const base = baseFonts.reduce((acc, font) => {
				acc[font] = getTextMetrics(context, font) 
				return acc
			}, {})
			families.forEach(family => {
				const basefont = /, (.+)/.exec(family)[1]
				const dimensions = getTextMetrics(context, family) 
				const font = /\'(.+)\'/.exec(family)[1]
				const support = (
					dimensions.ascent != base[basefont].ascent ||
					dimensions.descent != base[basefont].descent ||
					dimensions.left != base[basefont].left ||
					dimensions.right != base[basefont].right ||
					dimensions.width != base[basefont].width
				)
				const extraSupport = (
					dimensions.fontAscent != base[basefont].fontAscent ||
					dimensions.fontDescent != base[basefont].fontDescent
				)
				if (((!isNaN(dimensions.ascent) && !isNaN(dimensions.fontAscent)) && (support || extraSupport)) ||
					(!isNaN(dimensions.ascent) && support)) {
                    detected.add(font)
                }
				return
			})
			const lied = (
				(('OffscreenCanvas' in window) && lieProps['OffscreenCanvasRenderingContext2D.measureText']) ||
				(!('OffscreenCanvas' in window) && lieProps['CanvasRenderingContext2D.measureText'])
			)
			
			logTestResult({ start, test: 'fonts', passed: true })
			return resolve({ fonts: [...detected], lied })
		} catch (error) {
			logTestResult({ test: 'fonts', passed: false })
			captureError(error)
			return resolve()
		}
	})
}

export const fontList = ["Andale Mono", "Arial", "Arial Black", "Arial Hebrew", "Arial MT", "Arial Narrow", "Arial Rounded MT Bold", "Arial Unicode MS", "Bitstream Vera Sans Mono", "Book Antiqua", "Bookman Old Style", "Calibri", "Cambria", "Cambria Math", "Century", "Century Gothic", "Century Schoolbook", "Comic Sans", "Comic Sans MS", "Consolas", "Courier", "Courier New", "Geneva", "Georgia", "Helvetica", "Helvetica Neue", "Impact", "Lucida Bright", "Lucida Calligraphy", "Lucida Console", "Lucida Fax", "LUCIDA GRANDE", "Lucida Handwriting", "Lucida Sans", "Lucida Sans Typewriter", "Lucida Sans Unicode", "Microsoft Sans Serif", "Monaco", "Monotype Corsiva", "MS Gothic", "MS Outlook", "MS PGothic", "MS Reference Sans Serif", "MS Sans Serif", "MS Serif", "MYRIAD", "MYRIAD PRO", "Palatino", "Palatino Linotype", "Segoe Print", "Segoe Script", "Segoe UI", "Segoe UI Light", "Segoe UI Semibold", "Segoe UI Symbol", "Tahoma", "Times", "Times New Roman", "Times New Roman PS", "Trebuchet MS", "Verdana", "Wingdings", "Wingdings 2", "Wingdings 3"]