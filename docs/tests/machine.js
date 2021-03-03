(async () => {

const hashMini = str => {
	const json = `${JSON.stringify(str)}`
	let i, len, hash = 0x811c9dc5
	for (i = 0, len = json.length; i < len; i++) {
		hash = Math.imul(31, hash) + json.charCodeAt(i) | 0
	}
	return ('0000000' + (hash >>> 0).toString(16)).substr(-8)
}

const hashify = async (x) => {
	const json = `${JSON.stringify(x)}`
	const jsonBuffer = new TextEncoder().encode(json)
	const hashBuffer = await crypto.subtle.digest('SHA-256', jsonBuffer)
	const hashArray = Array.from(new Uint8Array(hashBuffer))
	const hashHex = hashArray.map(b => ('00' + b.toString(16)).slice(-2)).join('')
	return hashHex
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

const start = performance.now()


const perf = performance.now() - start 
patch(document.getElementById('fingerprint-data'), html`
	<div id="fingerprint-data">
		<style>
		#fingerprint-data > .visitor-info > .jumbo {
			font-size: 32px !important;
		}
		.pass, .fail {
			margin: 0 4px 0 0;
			padding: 1px 5px;
			border-radius: 3px;
		}
		.pass {
			color: #2da568;
			background: #2da5681a;
		}
		.fail, .bold-fail, .erratic {
			color: #ca656e;
		}
		.fail, .bold-fail {
			background: #ca656e0d;
		}
		.bold-fail {
			font-weight: bold;
			border-bottom: 1px solid;
		}
		.group {
			font-size: 12px !important;
			border-radius: 3px;
			padding: 10px 15px;
		}
		.isolate {
			background: #657fca1a
		}
		@media (prefers-color-scheme: dark) {
			
		}
		</style>
		<div class="visitor-info">
			<span class="aside-note">${perf.toFixed(2)}ms</span>
			<strong>Machine</strong>
		</div>
	</div>
`)
})()