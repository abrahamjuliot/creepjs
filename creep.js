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
        return typeof fn === 'function' ? fn() : true
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
                return [...n.plugins].map((p, i) => ({
                    i: [p.name, p.description, p.filename, p.version]
                }))
            })
        }
    }
    // device + browser
    const screenFp = () => {
        let {
            width,
            height,
            availWidth,
            availHeight,
            availTop,
            availLeft,
            colorDepth, // device
            pixelDepth // device
        } = screen
        if (availWidth > width || availHeight > height) {
            width = height = availWidth = availHeight = availTop = availLeft = undefined // distrust
        }
        return {
            width,
            height,
            availWidth,
            availHeight,
            availTop,
            availLeft,
            colorDepth,
            pixelDepth
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
            offset: (new Date()).getTimezoneOffset(),
            format: Intl.DateTimeFormat().resolvedOptions().timeZone,
            string: new Date('1/1/2001').toTimeString()
        }
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
	#rect-container{opacity:0;position:relative;border:1px solid #F72585}.rects{width:10px;height:10px;max-width:100%}.absolute{position:absolute}#cRect1{border:solid 2.715px;border-color:#F72585;padding:3.98px;margin-left:12.12px}#cRect2{border:solid 2px;border-color:#7209B7;font-size:30px;margin-top:20px;transform:skewY(23.1753218deg)}#cRect3{border:solid 2.89px;border-color:#3A0CA3;font-size:45px;transform:scale(100000000000000000000009999999999999.99, 1.89);margin-top:50px}#cRect4{border:solid 2px;border-color:#4361EE;transform:matrix(1.11, 2.0001, -1.0001, 1.009, 150, 94.4);margin-top:11.1331px;margin-left:12.1212px;padding:4.4545px;left:239.4141px;top:8.5050px}#cRect5{border:solid 2px;border-color:#4CC9F0;margin-left:42.395pt}#cRect6{border:solid 2px;border-color:#F72585;transform:perspective(12890px) translateZ(101.5px);padding:12px}#cRect7{margin-top:-350.552px;margin-left:0.9099rem;border:solid 2px;border-color:#4361EE}#cRect8{margin-top:-150.552px;margin-left:15.9099rem;border:solid 2px;border-color:#3A0CA3}#cRect9{margin-top:-110.552px;margin-left:15.9099rem;border:solid 2px;border-color:#7209B7}#cRect10{margin-top:-315.552px;margin-left:15.9099rem;border:solid 2px;border-color:#F72585}
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
    // fingerprint
    const fingerprint = () => {
        //return device, browser, combined hash
        //return list of data points|github pages
        // compile device fp
        const navComputed = attempt(() => nav())
        const screenComputed = attempt(() => screenFp())
        const canvasComputed = attempt(() => canvas())
        const gl = attempt(() => webgl())
        const webglComputed = {
            vendor: attempt(() => gl.unmasked().vendor),
            renderer: attempt(() => gl.unmasked().renderer)
        }
        const webglDataURLComputed = attempt(() => gl.dataURL())
        const consoleErrorsComputed = attempt(() => consoleErrs())
        const timezoneComputed = attempt(() => timezone())
        const cRectsComputed = attempt(() => cRects())
        const mathsComputed = attempt(() => maths())
        return {
            nav: navComputed,
            screen: [screenComputed, hashify(screenComputed)],
            webgl: webglComputed,
            webglDataURL: [webglDataURLComputed, hashify(webglDataURLComputed)],
            consoleErrors: [consoleErrorsComputed, hashify(consoleErrorsComputed)],
            timezone: timezoneComputed,
            cRects: [cRectsComputed, hashify(cRectsComputed)],
            maths: [mathsComputed, hashify(mathsComputed)],
            canvas: [canvasComputed, hashify(canvasComputed)]
        }
    }
    // patch
    const app = document.getElementById('fp-app')
    patch(app, scene, () => {
        // fingerprint and and render
        const fpElem = document.getElementById('fingerpring')
        const fp = fingerprint()
		const { nav, webgl } = fp
		const device = {
			renderer: webgl.renderer,
			timezone: fp.timezone,
			deviceMemory: nav.deviceMemory,
			hardwareConcurrency: nav.hardwareConcurrency,
			languages: nav.languages,
			maxTouchPoints: nav.maxTouchPoints,
			platform: nav.platform
		}
        console.log(fp)
        data = `

Device Id: ${hashify(device)}<br>
Device/Browser Id: ${hashify(fp)}<br>
webgl vendor: ${webgl.vendor}<br>
[device] webgl renderer: ${webgl.renderer}<br>
webglDataURL: ${fp.webglDataURL[1]}<br>
client rects: ${fp.cRects[1]}<br>
console errors: ${fp.consoleErrors[1]}<br>
maths: ${fp.maths[1]}<br>
canvas: ${fp.canvas[1]}<br>
[device] timezone: ${hashify(fp.timezone)}<br>
appCodeName: ${nav.appCodeName}<br>
appVersion: ${nav.appVersion}<br>
[device] deviceMemory: ${nav.deviceMemory}<br>
doNotTrack: ${nav.doNotTrack}<br>
[device] hardwareConcurrency: ${nav.hardwareConcurrency}<br>
[device] languages: ${hashify(nav.languages)}<br>
[device] maxTouchPoints: ${nav.maxTouchPoints}<br>
mimeTypes: ${hashify(nav.mimeTypes)}<br>
[device] platform: ${nav.platform}<br>
plugins hash: ${hashify(nav.plugins)}<br>
userAgent: ${nav.userAgent}<br>
vendor: ${nav.vendor}<br>
		`
        return patch(fpElem, html `${data}`)
    })
})()
/*
F72585 pin
7209B7 lpur
3A0CA3 pur
4361EE blue
4CC9F0 lblue
*/
