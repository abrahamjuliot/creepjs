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

export { isChrome, isBrave, isFirefox, getOS }