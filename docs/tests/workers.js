(async () => {

// https://stackoverflow.com/a/22429679
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
	oldEl.parentNode.replaceChild(newEl, oldEl)
	return typeof fn === 'function' ? fn() : true
}
const html = (stringSet, ...expressionSet) => {
	const template = document.createElement('template')
	template.innerHTML = stringSet.map((str, i) => `${str}${expressionSet[i] || ''}`).join('')
	return templateContent(template) // ie11 fix for template.content
}

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


const nonPlatformParenthesis = /\((khtml|unlike|vizio|like gec|internal dummy|org\.eclipse|openssl|ipv6|via translate|safari|cardamon).+|xt\d+\)/ig
const parenthesis = /\((.+)\)/
const android = /((android).+)/i
const androidNoise = /^(linux|[a-z]|wv|mobile|[a-z]{2}(-|_)[a-z]{2}|[a-z]{2})$|windows|(rv:|trident|webview|iemobile).+/i
const androidBuild = /build\/.+\s|\sbuild\/.+/i
const androidRelease = /android( |-)\d/i
const windows = /((windows).+)/i
const windowsNoise = /^(windows|ms(-|)office|microsoft|compatible|[a-z]|x64|[a-z]{2}(-|_)[a-z]{2}|[a-z]{2})$|(rv:|outlook|ms(-|)office|microsoft|trident|\.net|msie|httrack|media center|infopath|aol|opera|iemobile|webbrowser).+/i
const windows64bitCPU = /w(ow|in)64/i
const cros = /cros/i
const crosNoise = /^([a-z]|x11|[a-z]{2}(-|_)[a-z]{2}|[a-z]{2})$|(rv:|trident).+/i
const crosBuild = /\d+\.\d+\.\d+/i
const linux = /linux|x11|ubuntu|debian/i
const linuxNoise = /^([a-z]|x11|unknown|compatible|[a-z]{2}(-|_)[a-z]{2}|[a-z]{2})$|(rv:|java|oracle|\+http|http|unknown|mozilla|konqueror|valve).+/i
const apple = /(cpu iphone|cpu os|iphone os|mac os|macos|intel os|ppc mac).+/i
const appleNoise = /^([a-z]|macintosh|compatible|mimic|[a-z]{2}(-|_)[a-z]{2}|[a-z]{2}|rv|\d+\.\d+)$|(rv:|silk|valve).+/i
const appleRelease = /(ppc |intel |)(mac|mac |)os (x |x|)\d+/i
const otherOS = /((symbianos|nokia|blackberry|morphos|mac).+)|\/linux|freebsd|symbos|series \d+|win\d+|unix|hp-ux|bsdi|bsd|x86_64/i
const extraSpace = /\s{2,}/

const isDevice = (list, device) => list.filter(x => device.test(x)).length

const getUserAgentPlatform = ({ userAgent, excludeBuild = true }) => {
	userAgent = userAgent.trim().replace(/\s{2,}/, ' ').replace(nonPlatformParenthesis, '')
	if (parenthesis.test(userAgent)) {
		const platformSection = userAgent.match(parenthesis)[0]
		const identifiers = platformSection.slice(1, -1).replace(/,/g, ';').split(';').map(x => x.trim())

		if (isDevice(identifiers, android)) {
			return identifiers
				.map(x => androidRelease.test(x) ? androidRelease.exec(x)[0].replace('-', ' ') : x)
				.filter(x => !(androidNoise.test(x)))
				.join(' ')
				.replace((excludeBuild ? androidBuild : ''), '')
				.trim().replace(/\s{2,}/, ' ')
		} else if (isDevice(identifiers, windows)) {
			return identifiers
				.filter(x => !(windowsNoise.test(x)))
				.join(' ')
				.replace(/\sNT (\d+\.\d+)/, (match, version) => {
					return (
						version == '10.0' ? ' 10' :
						version == '6.3' ? ' 8.1' :
						version == '6.2' ? ' 8' :
						version == '6.1' ? ' 7' :
						version == '6.0' ? ' Vista' :
						version == '5.2' ? ' XP Pro' :
						version == '5.1' ? ' XP' :
						version == '5.0' ? ' 2000' :
						version == '4.0' ? match :
						' ' + version
					)
				})
				.replace(windows64bitCPU, '(64-bit)')
				.trim().replace(/\s{2,}/, ' ')
		} else if (isDevice(identifiers, cros)) {
			return identifiers
				.filter(x => !(crosNoise.test(x)))
				.join(' ')
				.replace((excludeBuild ? crosBuild : ''), '')
				.trim().replace(/\s{2,}/, ' ')
		} else if (isDevice(identifiers, linux)) {
			return identifiers
				.filter(x => !(linuxNoise.test(x)))
				.join(' ')
				.trim().replace(/\s{2,}/, ' ')
		} else if (isDevice(identifiers, apple)) {
			return identifiers
				.map(x => appleRelease.test(x) ? appleRelease.exec(x)[0] : x)
				.filter(x => !(appleNoise.test(x)))
				.join(' ')
				.replace(/\slike mac.+/ig, '')
				.trim().replace(/\s{2,}/, ' ')
		} else {
			const other = identifiers.filter(x => otherOS.test(x))
			if (other.legnth) {
				return other.join(' ').trim().replace(/\s{2,}/, ' ')
			}
			return identifiers.join(' ')
		}
	} else {
		return 'unknown'
	}
}

// Tests
const getDedicatedWorker = () => {
	return new Promise(resolve => {
		try {
			const dedicatedWorker = new Worker('worker_dedicated.js')
			dedicatedWorker.onmessage = message => {
				return resolve(message.data)
			}
		}
		catch(error) {
			console.error(error)
			return resolve({})
		}
	})
}

const getSharedWorker = () => {
	return new Promise(resolve => {
		try {
			const sharedWorker = new SharedWorker('worker_shared.js')
			sharedWorker.port.start()
			sharedWorker.port.addEventListener('message', message => {
				sharedWorker.port.close()
				return resolve(message.data)
			})
		}
		catch(error) {
			console.error(error)
			return resolve({})
		}
	})
}

const getServiceWorker = () => {
	return new Promise(resolve => {
		try {
			navigator.serviceWorker.register('worker_service.js', {
				scope: '../tests/'
			}).catch(error => {
				console.error(error)
				return resolve({})
			})
			navigator.serviceWorker.ready.then(registration => {
				const broadcast = new BroadcastChannel('creep_service')
				broadcast.onmessage = message => {
					registration.unregister()
					broadcast.close()
					return resolve(message.data)
				}
				return broadcast.postMessage({ type: 'fingerprint'})
			}).catch(error => {
				console.error(error)
				return resolve({})
			})
		}
		catch(error) {
			console.error(error)
			return resolve({})
		}
	})
}

const [
	dedicatedWorker,
	sharedWorker,
	serviceWorker
] = await Promise.all([
	getDedicatedWorker(),
	getSharedWorker(),
	getServiceWorker()
]).catch(error => {
	console.error(error.message)
})

const json = x => JSON.stringify(x, null, '\t')
//console.log(`\nWorker: ${json(dedicatedWorker)}`)
//console.log(`\nSharedWorker: ${json(sharedWorker)}`)
//console.log(`\nServiceWorker: ${json(serviceWorker)}`)

const red = '#ca656e2b'
const green = '#2da56821'
const dedicatedHash = hashMini(dedicatedWorker)
const sharedHash = hashMini(sharedWorker)
const serviceHash = hashMini(serviceWorker)
const style = (controlHash, hash) => {
	return `
		style="
			background: ${hash == 'undefined' ? '#eee' : hash != controlHash ? red : green}
		"
	`
}

const el = document.getElementById('fingerprint-data')
patch(el, html`
	<div id="fingerprint-data">
		<div class="flex-grid visitor-info">
			<strong>Workers</strong>
		</div>
		<div class="flex-grid">
			<div class="col-four" ${style(dedicatedHash, dedicatedHash)}>
				<strong>Dedicated</strong>
				<span class="hash">${dedicatedHash}</span>
				<div>memory: ${hashMini(dedicatedWorker.deviceMemory)}</div>
				<div>hardware: ${hashMini(dedicatedWorker.hardwareConcurrency)}</div>
				<div>user agent: ${hashMini(dedicatedWorker.userAgent)}</div>
				<div>platform: ${hashMini(dedicatedWorker.platform)}</div>
				<div>language: ${hashMini(dedicatedWorker.language)}</div>
				<div>timezone: ${hashMini(dedicatedWorker.timezoneLocation)}</div>
				<div>canvas 2d: ${hashMini(dedicatedWorker.canvas2d)}</div>
				<div>gl1 renderer: ${hashMini(dedicatedWorker.webglRenderer)}</div>
				<div>gl2 renderer: ${hashMini(dedicatedWorker.webgl2Renderer)}</div>
				<div>gl1 vendor: ${hashMini(dedicatedWorker.webglVendor)}</div>
				<div>gl2 vendor: ${hashMini(dedicatedWorker.webgl2Vendor)}</div>
				<div>gl1 params: ${hashMini(dedicatedWorker.webglParams)}</div>
				<div>gl2 params: ${hashMini(dedicatedWorker.webgl2Params)}</div>
				${(() => {
					const { userAgent } = dedicatedWorker || {}
					const system = userAgent ? getOS(userAgent) : undefined
					return userAgent ?
					`
					<div>ua version:</div>
					<div class="block-text">${
						decryptUserAgent({
							ua: userAgent,
							os: system,
							isBrave: 'brave' in navigator
						})
					} on ${system}</div>
					<div>ua device:</div>
					<div class="block-text">${
						getUserAgentPlatform({ userAgent })
					}</div> 
					` :
					`
					<div>ua version:</div>
					<div class="block-text"></div>
					<div>ua device:</div>
					<div class="block-text"></div> 
					`
				})()}
			</div>
			<div class="col-four" ${style(dedicatedHash, sharedHash)}>
				<strong>Shared</strong>
				<span class="hash">${sharedHash}</span>
				<div>memory: ${hashMini(sharedWorker.deviceMemory)}</div>
				<div>hardware: ${hashMini(sharedWorker.hardwareConcurrency)}</div>
				<div>user agent: ${hashMini(sharedWorker.userAgent)}</div>
				<div>platform: ${hashMini(sharedWorker.platform)}</div>
				<div>language: ${hashMini(sharedWorker.language)}</div>
				<div>timezone: ${hashMini(sharedWorker.timezoneLocation)}</div>
				<div>canvas 2d: ${hashMini(sharedWorker.canvas2d)}</div>
				<div>gl1 renderer: ${hashMini(sharedWorker.webglRenderer)}</div>
				<div>gl2 renderer: ${hashMini(sharedWorker.webgl2Renderer)}</div>
				<div>gl1 vendor: ${hashMini(sharedWorker.webglVendor)}</div>
				<div>gl2 vendor: ${hashMini(sharedWorker.webgl2Vendor)}</div>
				<div>gl1 params: ${hashMini(sharedWorker.webglParams)}</div>
				<div>gl2 params: ${hashMini(sharedWorker.webgl2Params)}</div>
				${(() => {
					const { userAgent } = sharedWorker || {}
					const system = userAgent ? getOS(userAgent) : undefined
					return userAgent ?
					`
					<div>ua version:</div>
					<div class="block-text">${
						decryptUserAgent({
							ua: userAgent,
							os: system,
							isBrave: 'brave' in navigator
						})
					} on ${system}</div>
					<div>ua device:</div>
					<div class="block-text">${
						getUserAgentPlatform({ userAgent })
					}</div> 
					` :
					`
					<div>ua version:</div>
					<div class="block-text"></div>
					<div>ua device:</div>
					<div class="block-text"></div> 
					`
				})()}
			</div>
			<div class="col-four" ${style(dedicatedHash, serviceHash)}>
				<strong>Service</strong>
				<span class="hash">${serviceHash}</span>
				<div>memory: ${hashMini(serviceWorker.deviceMemory)}</div>
				<div>hardware: ${hashMini(serviceWorker.hardwareConcurrency)}</div>
				<div>user agent: ${hashMini(serviceWorker.userAgent)}</div>
				<div>platform: ${hashMini(sharedWorker.platform)}</div>
				<div>language: ${hashMini(serviceWorker.language)}</div>
				<div>timezone: ${hashMini(serviceWorker.timezoneLocation)}</div>
				<div>canvas 2d: ${hashMini(serviceWorker.canvas2d)}</div>
				<div>gl1 renderer: ${hashMini(serviceWorker.webglRenderer)}</div>
				<div>gl2 renderer: ${hashMini(serviceWorker.webgl2Renderer)}</div>
				<div>gl1 vendor: ${hashMini(serviceWorker.webglVendor)}</div>
				<div>gl2 vendor: ${hashMini(serviceWorker.webgl2Vendor)}</div>
				<div>gl1 params: ${hashMini(serviceWorker.webglParams)}</div>
				<div>gl2 params: ${hashMini(serviceWorker.webgl2Params)}</div>
				${(() => {
					const { userAgent } = serviceWorker || {}
					const system = userAgent ? getOS(userAgent) : undefined
					return userAgent ?
					`
					<div>ua version:</div>
					<div class="block-text">${
						decryptUserAgent({
							ua: userAgent,
							os: system,
							isBrave: 'brave' in navigator
						})
					} on ${system}</div>
					<div>ua device:</div>
					<div class="block-text">${
						getUserAgentPlatform({ userAgent })
					}</div> 
					` :
					`
					<div>ua version:</div>
					<div class="block-text"></div>
					<div>ua device:</div>
					<div class="block-text"></div> 
					`
				})()}
			</div>
		</div>
	</div>
`)

})()