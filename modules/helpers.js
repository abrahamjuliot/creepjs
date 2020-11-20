// Detect Browser
const isChrome = 'chrome' in window
const isBrave = 'brave' in navigator
const isFirefox = typeof InstallTrigger !== 'undefined'

// system
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

export { isChrome, isBrave, isFirefox, getOS, decryptUserAgent }