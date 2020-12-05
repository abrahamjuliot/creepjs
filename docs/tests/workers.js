(async () => {

// https://stackoverflow.com/a/22429679
const hashMini = str => {
	if(str != 0 && (!str || JSON.stringify(str) =='{}')) {
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

// Tests
const getDedicatedWorker = () => {
	return new Promise(resolve => {
		try {
			const broadcast = new BroadcastChannel('creep_dedicated')
			const dedicatedWorker = new Worker('worker_dedicated.js')
			// dedicatedWorker.addEventListener('message', message => {
			// 	return resolve(message.data)
			// })
			broadcast.onmessage = message => {
				broadcast.close()
				return resolve(message.data)
			}
		}
		catch(error) {
			console.error(error)
			return resolve()
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
			return resolve()
		}
	})
}

const getServiceWorker = () => {
	return new Promise(resolve => {
		try {
			navigator.serviceWorker.register('worker_service.js', {
				scope: '../tests/'
			}).catch(error => {
				console.log(error)
				return resolve()
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
				console.log(error)
				return resolve()
			})
		}
		catch(error) {
			console.error(error)
			return resolve()
		}
	})
}


const dedicatedWorker = await getDedicatedWorker() || {}
const sharedWorker = await getSharedWorker() || {}
const serviceWorker = await getServiceWorker() || {}

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
				<div>hardware: ${hashMini(dedicatedWorker.hardwareConcurrency)}</div>
				<div>user agent: ${hashMini(dedicatedWorker.userAgent)}</div>
				<div>canvas 2d: ${hashMini(dedicatedWorker.canvas2d)}</div>
				<div>gl renderer: ${hashMini(dedicatedWorker.webglRenderer)}</div>
				<div>gl vendor: ${hashMini(dedicatedWorker.webglVendor)}</div>
			</div>
			<div class="col-four" ${style(dedicatedHash, sharedHash)}>
				<strong>Shared</strong>
				<span class="hash">${sharedHash}</span>
				<div>hardware: ${hashMini(sharedWorker.hardwareConcurrency)}</div>
				<div>user agent: ${hashMini(sharedWorker.userAgent)}</div>
				<div>canvas 2d: ${hashMini(sharedWorker.canvas2d)}</div>
				<div>gl renderer: ${hashMini(sharedWorker.webglRenderer)}</div>
				<div>gl vendor: ${hashMini(sharedWorker.webglVendor)}</div>
			</div>
			<div class="col-four" ${style(dedicatedHash, serviceHash)}>
				<strong>Service</strong>
				<span class="hash">${serviceHash}</span>
				<div>hardware: ${hashMini(serviceWorker.hardwareConcurrency)}</div>
				<div>user agent: ${hashMini(serviceWorker.userAgent)}</div>
				<div>canvas 2d: ${hashMini(serviceWorker.canvas2d)}</div>
				<div>gl renderer: ${hashMini(serviceWorker.webglRenderer)}</div>
				<div>gl vendor: ${hashMini(serviceWorker.webglVendor)}</div>
			</div>
		</div>
	</div>
`)

})()