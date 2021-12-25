(async () => {

const hashMini =  x => {
	if (!x) return x
	const json = `${JSON.stringify(x)}`
	const hash = json.split('').reduce((hash, char, i) => {
		return Math.imul(31, hash) + json.charCodeAt(i) | 0
	}, 0x811c9dc5)
	return ('0000000' + (hash >>> 0).toString(16)).substr(-8)
}

// template views
const patch = (oldEl, newEl) => oldEl.parentNode.replaceChild(newEl, oldEl)
const html = (str, ...expressionSet) => {
	const template = document.createElement('template')
	template.innerHTML = str.map((s, i) => `${s}${expressionSet[i] || ''}`).join('')
	return document.importNode(template.content, true)
}


// metamask
if ('web3' in window && web3.currentProvider.isMetaMask) {
	console.log('metamask web3 detected')
}

/* 
	source viewer:
	https://chrome.google.com/webstore/detail/chrome-extension-source-v/jifpbeccnghkjeaalbbjmodiffmgedin

	query ids from store collections
	[...document.querySelectorAll('.webstore-test-wall-tile a')].map(el => {
		const { href } = el
		const id = /[^\/]+$/.exec(href)[0]
		const name = el.querySelector('div > div:nth-of-type(2) > div:nth-of-type(3) > h3').innerText
		return {
			id,
			name
		}
	})

	do:
	Bitwarden

	Adobe Acrobat
	Tampermonkey
	Avast Online Security
	Adblock Plus
	Adblock
	uBlock Origin
	Pinterest Save Button
	Cisco Webex
	Grammarly for Chrome
	Skype
	Avast SafePrice
	Honey

*/
const getExtensions = () => ({
	'aapbdbdomjkkjkaonfhkkikfgjllcleb': { name: 'Google Translate', file: 'popup_css_compiled.css' },
	'kbfnbcaeplbcioakkpcpgfkobkghlhen': { name: 'Grammarly', file: 'src/css/Grammarly.styles.css' },
	'kgjfgplpablkjnlkjmjdecgdpfankdle': { name: 'Zoom Scheduler', file: 'images/icon.svg'}
})

const getActiveChromeExtensions = async () => {
	const extensions = getExtensions()
	const urls = Object.keys(extensions).map(key => `chrome-extension://${key}/${extensions[key].file}`)
	const idMatcher = /\/\/([^\/]+)/
	const getName = res => extensions[idMatcher.exec(res.url)[1]].name
	const result = Promise.all(urls.map(url => fetch(url).then(getName).catch(e => {}))).then(res => res.filter(x => !!x))
	return result
}

const start = performance.now()
const activeExtensions = await getActiveChromeExtensions()
const perf = performance.now() - start

const extensions = getExtensions()
const getStoreAnchorTag = (name, extensions) => {
	const path = 'https://chrome.google.com/webstore/detail/'
	const id = Object.keys(extensions).find(key => extensions[key].name == name)
	return `<a href="${path}${id}" target="_blank">↗️</a>`
}
const extensionLibrary = Object.keys(extensions).reduce((acc, key) => [...acc, extensions[key].name], [])
patch(document.getElementById('fingerprint-data'), html`
	<div id="fingerprint-data">
		<style>
			.active {
				color: MediumAquaMarine 
			}
		</style>
		<div class="visitor-info relative">
			<span class="aside-note">${perf.toFixed(2)}ms</span>
			<strong>Chrome Extensions</strong><span class="hash">${hashMini(activeExtensions)}</span>
			<div>${''+activeExtensions.length} detected</div>
		</div>
		<div>
		${
			extensionLibrary
				.sort()
				.map(name => `
					<div class="${!activeExtensions.includes(name) ? '' : 'active'}">
						${getStoreAnchorTag(name, extensions)} ${name}
					</div>
				`)
				.join('')
		}
		</div>
	</div>
`)

})()