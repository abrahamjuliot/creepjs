(async () => {

  const hashMini = x => {
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

  const note = {
    unsupported: '<span class="blocked">unsupported</span>',
    blocked: '<span class="blocked">blocked</span>',
    lied: '<span class="lies">lied</span>'
  }

  const spawnError = (fn) => {
    try {
      fn()
      throw Error()
    } catch (err) {
      const { name, message, stack } = err
      const data = { name, message, stack }
      return {
        hash: hashMini(data), // need to remove lines
        ...data
      }
    }
  }
  const start = performance.now()
  const objectCreateProtoRecursionError = spawnError(repeat = () => {
    Object.create(Function.prototype.toString.__proto__)
    return repeat()
  })

  const objectCreateFunctionError = spawnError(() => {
    throw Error(Object.create(Function.prototype.toString))
  })

  const perf = performance.now() - start
  
  console.log(objectCreateProtoRecursionError)
  console.log(objectCreateFunctionError)
  console.log(perf)

  const el = document.getElementById('fingerprint-data')
  patch(el, html`
	<div id="fingerprint-data">
		<style>
			#fingerprint-data > .jumbo {
				font-size: 32px;
			}
			.fake {
				color: #ca656e;
				background: #ca656e0d;
				border-radius: 2px;
				margin: 0 5px;
				padding: 1px 3px;
			}

			.bold-fail {
				color: #ca656e;
				font-weight: bold;
			}
		</style>
		<div class="visitor-info">
			<strong>JS Proxy</strong>
		</div>
		<div class="jumbo">
      <div>Function.toString</div>
			<div>${hashMini({ })}</div>
		</div>
		<div class="flex-grid">
			<div class="col-six relative">
			</div>
		</div>
	</div>
`)

})()