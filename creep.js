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
    function hashify(str) {
        let i, l = str.length, hash = 0x811c9dc5
        for (i = 0; i < l; i++) {
            hash ^= str.charCodeAt(i)
            hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24)
        }
        return ("0000000" + (hash >>> 0).toString(16)).substr(-8)
    }
    // change varies
    const nav = () => {
        const n = navigator
        const {
            appVersion: appV,
            appCodeName: appC,
            deviceMemory: dMem, // device
            doNotTrack: dnt,
            hardwareConcurrency: hCon, // device
            languages: lan, // device
            maxTouchPoints: mtp, // device
            platform: plat, // device
            userAgent: ua,
            vendor: ven,
        } = n
        return {
            appV,
            appC,
            dMem,
            dnt,
            hCon,
            lan,
            mtp,
            plat,
            ua,
            ven,
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
            w = h = aw = ah = at = al = undefined
        } // distrust	
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
    const browserMath = () => {
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
    const browserErrorMessages = () => {
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
        return attempt(() => [...speechSynthesis.getVoices()]
            .map(voice => voice.name))
    }
	const device = () => {
		// compile device fp
	} 
	const browser = () => {
		// compile broswer fp
	}
	const fingerprint = () => {
		//return device, browser, combined hash
		//return list of data points|github pages
	}
})()
/*
...rects
isTypeSupported
*/
