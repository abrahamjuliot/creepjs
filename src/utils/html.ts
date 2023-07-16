
// template views
function patch(oldEl: HTMLElement | null, newEl: DocumentFragment, fn?: () => any) {
	if (!oldEl) return null
	oldEl.parentNode?.replaceChild(newEl, oldEl)
	return typeof fn === 'function' ? fn() : true
}
function html(templateStr: TemplateStringsArray, ...expressionSet: any[]) {
	const template = document.createElement('template')
	template.innerHTML = templateStr.map((s, i) => `${s}${expressionSet[i] || ''}`).join('')
	return document.importNode(template.content, true)
}

// template helpers
const HTMLNote = {
	UNKNOWN: '<span class="blocked">unknown</span>',
	UNSUPPORTED: '<span class="blocked">unsupported</span>',
	BLOCKED: '<span class="blocked">blocked</span>',
	LIED: '<span class="lies">lied</span>',
	SECRET: '<span class="blocked">secret</span>',
}

const pluralify = (len) => len > 1 ? 's' : ''
const count = (arr) => arr && arr.constructor.name === 'Array' ? '' + (arr.length) : '0'

const getDiffs = ({ stringA, stringB, charDiff = false, decorate = (diff) => `[${diff}]` }) => {
	if (!stringA || !stringB) return;
	const splitter = charDiff ? '' : ' '
	const listA = (''+stringA).split(splitter)
	const listB = (''+stringB).split(splitter)
	const listBWithDiffs = listB.map((x, i) => {
		const matcher = listA[i]
		const match = x == matcher
		return !match ? decorate(x) : x
	})
	return listBWithDiffs.join(splitter)
}

// modal component
const modal = (name, result, linkname = 'details') => {
	if (!result.length) {
		return ''
	}
	return `
		<style>
		.modal-${name}:checked ~ .modal-container {
			visibility: visible;
			opacity: 1;
			animation: show 0.1s linear both;
		}
		.modal-${name}:checked ~ .modal-container .modal-content {
			animation: enter 0.2s ease both
		}
		.modal-${name}:not(:checked) ~ .modal-container {
			visibility: hidden;
		}
		</style>
		<input type="radio" id="toggle-open-${name}" class="modal-${name}" name="modal-${name}"/>
		<label class="modal-open-btn" for="toggle-open-${name}" onclick="">${linkname}</label>
		<label class="modal-container" for="toggle-close-${name}" onclick="">
			<label class="modal-content" for="toggle-open-${name}" onclick="">
				<input type="radio" id="toggle-close-${name}" name="modal-${name}"/>
				<label class="modal-close-btn" for="toggle-close-${name}" onclick="">×</label>
				<div>${result}</div>
			</label>
		</label>
	`
}

export { patch, html, HTMLNote, pluralify, getDiffs, count, modal }
