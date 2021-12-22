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


const getFile = async (id, path) => {
	if (!('chrome' in window)) {
		return false
	}
	const res = await fetch(`chrome-extension://${id}/${path}`)
	.then(() => path) 
	.catch(error => false)
	return res
}

const extension = {
	googleTranslate: {
		active: false,
		id: 'aapbdbdomjkkjkaonfhkkikfgjllcleb',
		filePaths: [ 'popup_css_compiled.css', 'options.html' ]
	},
	metamask: {
		active: false,
		id: 'nkbihfbeogaeaoehlefnkodbefgpgknn',
		filePaths: [ 'inpage.js', 'phishing.html' ]
	},
	trace: {
		active: false,
		id: 'njkmjblmcfiobddjgebnoeldkjcplfjb',
		filePaths: [
			'html/blocked.html',
			'js/pages/blocked.js',
			'js/common/ux.js',
			'js/common/shared.js',
			'js/libraries/jquery.js'
		]
	},
	cydec: {
		active: false,
		id: 'becfjfjckdhngmmpkhakoknnkgpgfelk'
	}
}

// metamask
const metamaskFiles = await Promise.all(
	extension.metamask.filePaths.map(path => getFile(extension.metamask.id, path))
)
if (!!metamaskFiles.filter(file => !!file).length) {
	console.log('metamask files detected')
	extension.metamask.active ||= true
}
if ('web3' in window && web3.currentProvider.isMetaMask) {
	console.log('metamask web3 detected')
	extension.metamask.active ||= true
}

// google translate
const googleTranslateFiles = await Promise.all(
	extension.googleTranslate.filePaths.map(path => getFile(extension.googleTranslate.id, path))
)
if (!!googleTranslateFiles.filter(file => !!file).length) {
	console.log('googleTranslate files detected')
	extension.googleTranslate.active ||= true
}

// trace
const traceFiles = await Promise.all(
	extension.trace.filePaths.map(path => getFile(extension.trace.id, path))
)
if (!!traceFiles.filter(file => !!file).length) {
	console.log('trace files detected')
	extension.trace.active ||= true
}

if (!!Object.getOwnPropertyNames(window)
	.filter(prop => /^tp_.+_func$/.test(prop)).length) {
	console.log('trace window detected')
	extension.trace.active ||= true
}

// cydec
if (!!Object.getOwnPropertyNames(window)
	.filter(prop => /^hdcd_(date_(ts|js|gt|ms|ls|ds|zo|pr|tz)|canvas_getctx)$/.test(prop)).length) {
	console.log('cydec window detected')
	extension.cydec.active ||= true
}

// trap logs
const old = console.log
console.log = function log() {
	if (/possible fingerprinting detected/i.test(arguments[0])) {
		console.log('cydec console detected')
		extension.cydec.active ||= true
	}
	this.apply(console, arguments)
}.bind(console.log)
navigator.userAgent // trigger
//console.log = old // restore

/*
// trap messages
const oldSend = chrome.runtime.sendMessage
await new Promise(resolve => {
	chrome.runtime.sendMessage = function sendMessage() {
		console.log(arguments)
		if (arguments[0] == extension.cydec.id) {
			console.log('cydec message detected')
			resolve(extension.cydec.active ||= true)
		}
		this.apply(chrome.runtime, arguments)
	}.bind(chrome.runtime.sendMessage)
})
//chrome.runtime.sendMessage = oldSend // restore
*/

console.log(`googleTranslate: ${extension.googleTranslate.active}`)
console.log(`metamask: ${extension.metamask.active}`)
console.log(`trace: ${extension.trace.active}`)
console.log(`cydec: ${extension.cydec.active}`)

})()