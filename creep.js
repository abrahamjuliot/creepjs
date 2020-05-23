// 2 fp: may change and should not change
(function() {
    const timer = (logStart) => {
        console.log(logStart)
        const start = Date.now()
        return (logEnd) => {
            const end = Date.now() - start
            console.log(`${logEnd}: ${end/1000} seconds`)
        }
    }
    const attempt = fn => {
        try {
            return fn()
        } catch (err) {
            return undefined
        }
    }
	const jsonify = (x) => JSON.stringify(x)
    function hashify(x) {
		const str = `${JSON.stringify(x)}`
        let i, l = str.length,
            hash = 0x811c9dc5
        for (i = 0; i < l; i++) {
            hash ^= str.charCodeAt(i)
            hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24)
        }
        return ("0000000" + (hash >>> 0).toString(16)).substr(-8)
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
        oldEl.parentNode.replaceChild(newEl, oldEl);
        return typeof fn === 'function'? fn(): true
    }
    const html = (stringSet, ...expressionSet) => {
        const template = document.createElement('template')
        template.innerHTML = stringSet.map((str, i) => `${str}${expressionSet[i]||''}`).join('')
        return templateContent(template) // ie11 fix for template.content
    }
    // change varies
    const nav = () => {
        const n = navigator
        return {
            appVersion: n.appVersion,
            appCodeName: n.appCodeName,
            deviceMemory: n.deviceMemory, // device
            doNotTrack: n.doNotTrack,
            hardwareConcurrency: n.hardwareConcurrency, // device
            languages: n.languages, // device
            maxTouchPoints: n.maxTouchPoints, // device
            platform: n.platform, // device
            userAgent: n.userAgent,
            vendor: n.vendor,
            mimeTypes: attempt(() => [...navigator.mimeTypes].map(m => m.type)),
            plugins: attempt(() => {
                return n.plugins.map((p, i) => ({
                    i: [p.name, p.description, p.filename, p.version]
                }))
            })
        }
    }
    // device + browser
    const screen = () => {
        const s = screen
        let {
            width: w,
            height: h,
            availWidth: aw,
            availHeight: ah,
            availTop: at,
            availLeft: al,
            colorDepth: cd, // device
            pixelDepth: pd // device
        } = s
        if (aw > w || ah > h) {
            w = h = aw = ah = at = al = undefined // distrust
        }
        return {
            w,
            h,
            aw,
            ah,
            at,
            al,
            cd,
            pd
        }
    }
    // browser
    const canvas = () => {
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')
        const str = '%$%^LGFWE($HIF)'
        context.font = '20px Arial'
        context.fillText(str, 100, 100)
        context.fillStyle = 'red'
        context.fillRect(100, 30, 80, 50)
        context.font = '32px Times New Roman'
        context.fillStyle = 'blue'
        context.fillText(str, 20, 70)
        context.font = '20px Arial'
        context.fillStyle = 'green'
        context.fillText(str, 10, 50)
        return canvas.toDataURL()
    }
    // device + browser
    const webgl = () => {
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('webgl')
        return {
            vendor: () => context.getParameter(context.VENDOR), // browser
            renderer: () => context.getParameter(context.RENDERER),
            unmasked: () => {
                const extension = context.getExtension('WEBGL_debug_renderer_info')
                const vendor = context.getParameter(extension.UNMASKED_VENDOR_WEBGL)
                const renderer = context.getParameter(extension.UNMASKED_RENDERER_WEBGL)
                return {
                    vendor,
                    renderer
                }
            },
            dataURL: () => {
                context.clearColor(0.2, 0.4, 0.6, 0.8)
                context.clear(context.COLOR_BUFFER_BIT)
                return canvas.toDataURL()
            }
        }
    }
    // browser+device
    const maths = () => {
        const n = 0.123124234234234242
        const fns = [
            ['acos', [n]],
            ['acosh', [1e308]],
            ['acoshPf', [1e154]],
            ['asin', [n]],
            ['asinh', [1e300]],
            ['asinh', [1]],
            ['asinhPf', [1]],
            ['atan', [2]],
            ['atanh', [0.5]],
            ['atanhPf', [0.5]],
            ['atan2', [90, 15]],
            ['atan2', [1e-310, 2]],
            ['cbrt', [100]],
            ['cbrtPf', [100]],
            ['cosh', [100]],
            ['coshPf', [100]],
            ['expm1', [1]],
            ['expm1Pf', [1]],
            ['sin', [1]],
            ['sinh', [1]],
            ['sinhPf', [1]],
            ['tan', [-1e308]],
            ['tanh', [1e300]],
            ['tanhPf', [1e300]],
            ['cosh', [1]],
            ['coshPf', [1]],
            ['sin', [Math.PI]],
            ['pow', [Math.PI, -100]]
        ]
        return fns.map(fn => ({
            [fn[0]]: attempt(() => Math[fn[0]](...fn[1]))
        }))
    }
    // browser
    const consoleErrs = () => {
        const getErrors = (errs, errFns) => {
            let i, len = errFns.length
            for (i = 0; i < len; i++) {
                try {
                    errFns[i]()
                } catch (err) {
                    errs.push(err.message)
                }
            }
            return errs
        }
        const errFns = [
            () => eval('alert(")'),
            () => eval('const foo;foo.bar'),
            () => eval('null.bar'),
            () => eval('abc.xyz = 123'),
            () => eval('const foo;foo.bar'),
            () => eval('(1).toString(1000)'),
            () => eval('[...undefined].length'),
            () => eval('var x = new Array(-1)'),
            () => eval('const a=1; const a=2;')
        ]
        return getErrors([], errFns)
    }
    // device
    const timezone = () => {
        return {
            offset: (new Date()).getTimezoneOffset,
            format: Intl.DateTimeFormat().resolvedOptions().timeZone,
            string: new Date('1/1/2001').toTimeString()
        }
    }
    // browser
    const speech = () => {
        return [...speechSynthesis.getVoices()].map(voice => voice.name)
    }
	// device + browser
	const cRects = () => {
		const cRectProps = ['x', 'y', 'width', 'height', 'top', 'right', 'bottom', 'left']
        const rectElems = document.getElementsByClassName('rects')
        const rectFp = [...rectElems].map(el => el.getClientRects()[0].toJSON())
		return rectFp
	}
    // scene
    const scene = html `
<fingerprint>
	<div id="fingerpring"></div>
	<style>
	#rect-container{position:relative;border:1px solid #fff}.rects{width:10px;height:10px;max-width:100%}.absolute{position:absolute}#cRect1{border:solid 2.715px;border-color:#fff;padding:3.98px;margin-left:12.12px}#cRect2{border:solid 2px;border-color:#fff;font-size:30px;margin-top:20px;transform:skewY(23.1753218deg)}#cRect3{border:solid 2.89px;border-color:#fff;font-size:45px;transform:scale(100000000000000000000009999999999999.99, 1.89);margin-top:50px}#cRect4{border:solid 2px;border-color:#fff;transform:matrix(1.11, 2.0001, -1.0001, 1.009, 150, 94.4);margin-top:11.1331px;margin-left:12.1212px;padding:4.4545px;left:239.4141px;top:8.5050px}#cRect5{border:solid 2px;border-color:#fff;margin-left:42.395pt}#cRect6{border:solid 2px;border-color:#fff;transform:perspective(12890px) translateZ(101.5px);padding:12px}#cRect7{margin-top:-350.552px;margin-left:0.9099rem;border:solid 2px;border-color:#fff}#cRect8{margin-top:-150.552px;margin-left:15.9099rem;border:solid 2px;border-color:#fff}#cRect9{margin-top:-110.552px;margin-left:15.9099rem;border:solid 2px;border-color:#fff}#cRect10{margin-top:-315.552px;margin-left:15.9099rem;border:solid 2px;border-color:#fff}
	</style>
	<div id="rect-container">
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
	</div>
</fingerprint>
`

    const fingerprint = () => {
		//return device, browser, combined hash
        //return list of data points|github pages
        // compile device fp
		const nav = attempt(() => nav())
		const screen = attempt(() => screen())
		const canvas = attempt(() => canvas())
		const gl = attempt(() => webgl())
		const webglData = {
			renderer: attempt(() => gl.unmasked()),
			vendor: attempt(() => gl.vendor()),
			unmasked: attempt(() => gl.unmasked()),
			dataURL: attempt(() => gl.dataURL())
		}
		const consoleErrs = attempt(() => consoleErrs())
		const timezone = attempt(() => timezone())
		const speech = attempt(() => speech())
		const cRects = attempt(() => cRects())
		const maths = attempt(() => browserMath())
		return {
			nav: nav,
			canvas: [jsonify(canvas), hashify(canvas)],
			webglRenderer: webglData.renderer,
			webglVendor: webglData.vendor,
			webglUnmasked: webglData.unmasked,
			webglDataURL: [jsonify(webglData.dataURL), hashify(webglData.dataURL)],
			consoleErrs: [jsonify(consoleErrs), hashify(consoleErrs)],
			timezone: [jsonify(timezone), hashify(timezone)],
			speech: [jsonify(speech), hashify(speech)],
			cRects: [jsonify(cRects), hashify(cRects)],
			maths: [jsonify(maths), hashify(maths)]
		} 
    }
	
	const app = document.getElementById('fp-app')
    // patch
    patch(app, scene, () => {
		// fingerprint and and render
		const fpElem = document.getElementById('fingerpring')
		fp = hashify(fingerprint())
		return patch(fpElem, html`${fp}`)
    })

})()
