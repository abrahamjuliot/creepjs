(async () => {

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


let max = 1000
const start = performance.now()

const query = ({type, test, rangeStart, rangeLen}) => {
	const el = document.getElementById('test')
	let testRes
	patch(el, html`
		<div id="test">
			<style>
				${[...Array(rangeLen)].map((slot,i) => {
					i += rangeStart

					if (i==test) {
						console.log(test)
						testRes = test
					}
					
					return `
						@media (device-${type}: ${i}px) {body {--device-${type}: ${i};}}
					`
				}).join('')}
			</style>
		</div>
	`)
	const style = getComputedStyle(document.body)
	const res = style.getPropertyValue(`--device-${type}`).trim()
	return res // or testRes
}

let i, widthMatched, heightMatched
for (i = 0; i < 10; i++) {
	let resWidth, resHeight
	if (!widthMatched) {
		resWidth = query({type: 'width', test: 1920, rangeStart: i*1000, rangeLen: 1000})
		if (resWidth) {
			widthMatched = resWidth
		}
	}
	if (!heightMatched) {
		resHeight = query({type: 'height', test: 1080, rangeStart: i*1000, rangeLen: 1000})
		if (resHeight) {
			heightMatched = resHeight
		}
	}
	if (widthMatched && heightMatched) {
		break
	}
	
}

const testEl = document.getElementById('test')
testEl.parentNode.removeChild(testEl)

console.log(`Perf: ${(performance.now() - start).toFixed(2)}ms`)
console.log(`${widthMatched}x${heightMatched}`)

})()