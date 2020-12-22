(async () => {

const hashMini = str => {
	if (typeof str == 'number') {
		return str
	}
	else if (!str || JSON.stringify(str) =='{}') {
		return 'undefined'
	}
	const json = `${JSON.stringify(str)}`
	let i, len, hash = 0x811c9dc5
	for (i = 0, len = json.length; i < len; i++) {
		hash = Math.imul(31, hash) + json.charCodeAt(i) | 0
	}
	return ('0000000' + (hash >>> 0).toString(16)).substr(-8)
}

const getOS = userAgent => {
	const os = (
		// order is important
		/windows phone/ig.test(userAgent) ? 'Windows Phone' :
		/win(dows|16|32|64|95|98|nt)|wow64/ig.test(userAgent) ? 'Windows' :
		/android/ig.test(userAgent) ? 'Android' :
		/cros/ig.test(userAgent) ? 'Chrome OS' :
		/linux/ig.test(userAgent) ? 'Linux' :
		/ipad/ig.test(userAgent) ? 'iPad' :
		/iphone/ig.test(userAgent) ? 'iPhone' :
		/ipod/ig.test(userAgent) ? 'iPod' :
		/ios/ig.test(userAgent) ? 'iOS' :
		/mac/ig.test(userAgent) ? 'Mac' :
		'Other'
	)
	return os
}

const isBrave = 'brave' in navigator
const decryptUserAgent = ({ua, os, isBrave}) => {
    const apple = /ipad|iphone|ipod|ios|mac/ig.test(os)
    const isOpera = /OPR\//g.test(ua)
    const isVivaldi = /Vivaldi/g.test(ua)
    const isDuckDuckGo = /DuckDuckGo/g.test(ua)
    const isYandex = /YaBrowser/g.test(ua)
    const paleMoon = ua.match(/(palemoon)\/(\d+)./i) 
    const edge = ua.match(/(edgios|edg|edge|edga)\/(\d+)./i)
    const edgios = edge && /edgios/i.test(edge[1])
    const chromium = ua.match(/(crios|chrome)\/(\d+)./i)
    const firefox = ua.match(/(fxios|firefox)\/(\d+)./i)
    const likeSafari = (
        /AppleWebKit/g.test(ua) &&
        /Safari/g.test(ua)
    )
    const safari = (
        likeSafari &&
        !firefox &&
        !chromium &&
        !edge &&
        ua.match(/(version)\/(\d+)\.(\d|\.)+\s(mobile|safari)/i)
    )

    if (chromium) {
        const browser = chromium[1]
        const version = chromium[2]
        const like = (
            isOpera ? ' Opera' :
            isVivaldi ? ' Vivaldi' :
            isDuckDuckGo ? ' DuckDuckGo' :
            isYandex ? ' Yandex' :
            edge ? ' Edge' :
            isBrave ? ' Brave' : ''
        )
        return `${browser} ${version}${like}`
    } else if (edgios) {
        const browser = edge[1]
        const version = edge[2]
        return `${browser} ${version}`
    } else if (firefox) {
        const browser = paleMoon ? paleMoon[1] : firefox[1]
        const version = paleMoon ? paleMoon[2] : firefox[2]
        return `${browser} ${version}`
    } else if (apple && safari) {
        const browser = 'Safari'
        const version = safari[2]
        return `${browser} ${version}`
    }
    return 'unknown'
}

const ghost = () => `
	height: 100vh;
	width: 100vw;
	position: absolute;
	left:-10000px;
	visibility: hidden;
`

const getRandomValues = () => {
	const id = [...crypto.getRandomValues(new Uint32Array(10))]
		.map(n => n.toString(36)).join('')
	return id
}

const getData = frameWindow => {
	if (!frameWindow) {
		return
	}
	const { userAgent, platform, hardwareConcurrency: hardware, deviceMemory: mem, language: lang, vendor} = frameWindow.navigator || {}
	const canvas = frameWindow.document.createElement('canvas').toDataURL()
	return  {
		ua: userAgent ? hashMini(userAgent) : undefined,
		uaVer: userAgent ? decryptUserAgent({ua: userAgent, os: getOS(userAgent), isBrave}) : undefined,
		mem,
		lang,
		hardware,
		platform,
		vendor,
		canvas: hashMini(canvas)
	}
}

const getIframeContentWindow = () => {
	try {
		const iframe = document.createElement('iframe')
		const id = getRandomValues()
		iframe.setAttribute('id', id)
		document.body.appendChild(iframe)
		const data = getData(iframe.contentWindow)
		if (!iframe || !iframe.parentNode) {
			return
		}
		iframe.parentNode.removeChild(iframe)
		return data
	}
	catch (error) {
		console.error(error)
		return
	}
}

const createIframeWindow = () => {
	try {
		const numberOfIframes = window.length
		const div = document.createElement('div')
		div.setAttribute('style', 'display:none')
		document.body.appendChild(div)
		const id = getRandomValues()
		div.innerHTML = `<div style="${ghost()}"><iframe></iframe></div>`
		const iframeWindow = window[numberOfIframes]
		const data = getData(iframeWindow)
		div.parentNode.removeChild(div)
		return data
	}
	catch (error) {
		console.error(error)
		return
	}
}

const getHyperNestedIframe = ({ numberOfNests, kill = false, context = window }) => {
	try {
		let parent, total = numberOfNests
		return (function getIframeWindow(win, {
			previous = context
		} = {}) {
			if (!win) {
				const iframeWindow = previous
				if (kill) {
					parent.parentNode.removeChild(parent)
					const data = getData(previous)
					return data
				}
				const data = getData(iframeWindow)
				return data
			}
			const numberOfIframes = win.length
			const div = win.document.createElement('div')
			win.document.body.appendChild(div)
			div.innerHTML = '<iframe></iframe>'
			const iframeWindow = win[numberOfIframes]
			if (total == numberOfNests) {
				parent = div
				parent.setAttribute('style', 'display:none')
			}
			numberOfNests--
			if (!numberOfNests) {
				if (kill) {
					parent.parentNode.removeChild(parent)
					console.log(iframeWindow)
					const data = getData(iframeWindow)
					return data
				}
				const data = getData(iframeWindow)
				return data
			}
			return getIframeWindow(iframeWindow, {
				previous: win
			})
		})(context)
	}
	catch (error) {
		console.error(error)
		return
	}
}


const windowFrame = getData(window)
const iframeContentWindow = getIframeContentWindow()
const iframeWindow = createIframeWindow()
const hyperNestedIframe = getHyperNestedIframe({ numberOfNests: 20 })
const deadNestedIframe = getHyperNestedIframe({ numberOfNests: 3, kill: true})

console.table({
	windowFrame,
	iframeContentWindow,
	iframeWindow,
	hyperNestedIframe,
	deadNestedIframe
})

})()