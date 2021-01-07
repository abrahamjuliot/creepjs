(async () => {

const hashMini = str => {
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

const extension = {
	trace: {
		id: 'njkmjblmcfiobddjgebnoeldkjcplfjb',
		filePaths: [
			'html/blocked.html',
			'js/pages/blocked.js',
			'js/common/ux.js',
			'js/common/shared.js',
			'js/libraries/jquery.js'
		]
	}
}
const getFile = async (id, path) => {
	const res = await fetch(`chrome-extension://${id}/${path}`)
	.then(() => path) 
	.catch(error => false)
	return res
}
const trace = await Promise.all(
	extension.trace.filePaths.map(path => getFile(extension.trace.id, path))
)

console.log(trace.filter(file => !!file))

const cydec = [
	'hdcd_date_ts',	
	'hdcd_date_js',	
	'hdcd_date_gt',	
	'hdcd_date_ms',	
	'hdcd_date_ls',	
	'hdcd_date_ds',	
	'hdcd_date_zo',	
	'hdcd_date_pr',	
	'hdcd_date_tz',	
	'hdcd_canvas_getctx'
]
const win = new Set(Object.getOwnPropertyNames(window))

console.log(cydec.filter(prop => win.has(prop)))

})()