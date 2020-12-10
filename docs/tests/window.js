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

// get data
const res = await fetch('window.json').catch(error => console.error(error))
const data = await res.json().catch(error => console.error(error))
const useragent = data.reduce((useragent, item, index) => {
	const { decrypted: name, id, systems } = item
	const version = useragent[name]
	if (version) {
		version.push({ id, systems })
	}
	else {
		useragent[name] = [{ id, systems }]
	}
	return useragent
}, {})
console.log(useragent)

/*
Chrome 81: Array(2)
0:
id: "1a02dfcde96fc42248891d65840d724eb49482507014f1446ce06b97a6c688d3"
systems: ["Linux"]
*/
const computeTemplate = ({name, fingerprints}) => {
	return `
	<div>
		<strong>${name}</strong>
		${
			fingerprints.map(fp => {
				return `<div>${hashMini(fp.id)}: ${fp.systems.join(', ')}</div>`
			}).join('')
		}
	</div>
	`
}

const el = document.getElementById('fingerprint-data')
patch(el, html`
	<div id="fingerprint-data">
		<style>
		@media (min-width: 600px) {
			.col-six {
				flex: 20%;
			}
		}
		</style>
		<div class="flex-grid visitor-info">
			<strong>Window Version</strong>
		</div>
		<div class="relative">
			<div class="ellipsis"><span class="aside-note">updated 2020-12-9</span></div>
			${
				Object.keys(useragent).sort().map(key => {
					return computeTemplate({ name: key, fingerprints: useragent[key] })
				}).join('')
			}
		</div>
	</div>
`)

})()
