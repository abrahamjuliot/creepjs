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

  const spawnError = (fn, matcher = null, final = null) => {
    const start = performance.now()
    try {
      fn()
      throw Error()
    } catch (err) {
      const { name, message, stack } = err
      if (!message) {
        return null
      }
      console.log(stack)
      const match = (stack.match(matcher) || [])[0]
      return {
        data: {
          stackLen: stack.split('\n').length,
          match,
          name,
          message,
        },
        perf: performance.now() - start
      }
    } finally {
      if (final) {
        final()
      }
    }
  }
  const start = performance.now()
  const apiFunction = Function.prototype.toString
  const proxy = new Proxy(apiFunction, {})
  const proto = Object.getPrototypeOf(apiFunction)
  /*

  */
  const results = [
    // new Proxy
    spawnError(() => {
      new Proxy(apiFunction, () => { const x = 0; x = 1 })()
    }, /Function/g),
    spawnError(() => {
      new Proxy(proxy, () => { const x = 0; x = 1 })()
    }, /Proxy/g),

    // Reflect.setPrototypeOf
    spawnError(() => {
      Reflect.setPrototypeOf(apiFunction, Object.create(apiFunction))
      null in apiFunction
    }, null, () => Object.setPrototypeOf(apiFunction, proto)),
    spawnError(() => {
      Reflect.setPrototypeOf(proxy, Object.create(proxy))
      null in apiFunction
    }, null, () => Object.setPrototypeOf(proxy, proto)),

    // Object.setPrototypeOf
    spawnError(() => {
      Object.setPrototypeOf(apiFunction, Object.create(apiFunction)).toString()
    }, /Function\.setPrototypeOf/g, () => Object.setPrototypeOf(apiFunction, proto)),
    spawnError(() => {Function.setPrototypeOf
      Object.setPrototypeOf(apiFunction, Object.create(proxy)).toString()
    }, null, () => Object.setPrototypeOf(proxy, proto)),

    // set __proto__
    spawnError(() => {
      apiFunction.__proto__ = Object.create(apiFunction)
      return apiFunction++
    }, /(Function\.|)set __proto__ \[as __proto__\]/g, () => Object.setPrototypeOf(apiFunction, proto)),
    spawnError(() => {
      proxy.__proto__ = Object.create(proxy)
      return proxy++
    }, null, () => Object.setPrototypeOf(proxy, proto)),

    // Symbol.hasInstance (< Chrome 102)
    spawnError(() => {
      (1).toString instanceof apiFunction
    }, /(Function\.|)\[Symbol\.hasInstance\]/g),
    spawnError(() => {
      (1).toString instanceof proxy
    }, /(Proxy\.|)\[Symbol\.hasInstance\]/g),

    // Recursion (< Chrome 102)
    /*
    spawnError(repeat = () => {
      Object.create(apiFunction.__proto__)
      return repeat()
    }, /Function.create/g),
    spawnError(repeat = () => {
      Object.create(proxy.__proto__)
      return repeat()
    }, /(Proxy\.|)get __proto__/g),
    */

    // Object.toString
    spawnError(() => {
      throw Error(Object.create(apiFunction))
    }, /Function.toString/g),
    spawnError(() => {
      throw Error(Object.create(proxy))
    }, /Object.toString/g),

    spawnError(() => {
      Object.defineProperty(Object.create(apiFunction), '', {}).toString()
    }, /Function.toString/g),
    spawnError(() => {
      Object.defineProperty(Object.create(proxy), '', {}).toString()
    }, /Object.toString/g),

    spawnError(() => {
      Object.defineProperties(Object.create(apiFunction), {}).toString()
    }, /Function.toString/g),
    spawnError(() => {
      Object.defineProperties(Object.create(proxy), {}).toString()
    }, /Object.toString/g),

    spawnError(() => {
      Object.create(apiFunction).toString(-1)
    }, /Function.toString/g),
    spawnError(() => {
      Object.create(proxy).toString(-1)
    }, /Object.toString/g),

    // Incompatible proxy
    spawnError(() => {
      apiFunction.arguments
      apiFunction.caller
    }),
    spawnError(() => {
      proxy.arguments
      proxy.caller
    }),
    spawnError(() => {
      apiFunction.toString.arguments
      apiFunction.toString.caller
    }),
    spawnError(() => {
      proxy.toString.arguments
      proxy.toString.caller
    }),

  ]

  const perf = performance.now() - start

  console.log(results)

  const hash = hashMini(results.map(x => x && x.data))
  const known = {
    // Blink
    'ebbd435a': 1, // 102+
    'e7dfce38': 1,
    // Gecko
    'fab6356e': 1,
		'cfb5d320': 1, // ~70
		// WebKit
		'82f12639': 1, // 15
		'7b8a7b35': 1 // 14
  }

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

      .error-info {
      }
		</style>
		<div class="relative">
			<strong>Function.toString Proxy</strong>
		</div>
		<div class="relative">
      <span class="aside-note">${perf.toFixed(2)}ms</span>
			<div class="jumbo" >${known[hash] ? hash : `<span class="bold-fail">${hash}</span>`}</div>
      <div>${results.filter(x => !!x).length} errors</div>
		</div>

		<div class="flex-grid">
			<div class="col-six relative">
        ${results.map(err => !err ? '' : `
          <div class="error-info ellipsis relative"><span class="aside-note">${err.perf.toFixed(2)}ms</span>
          ${
            ((err) => {
              const { match, stackLen, name, message } = err.data
              return `<span class="help" title="${name}: ${message}">${[
                stackLen,
                name,
                message.slice(0,20)+'...',
                ...(match ? [match] : []),
              ].join(':').toLocaleLowerCase().replace(/\s/g,'')}</span>`
            })(err)
          }
          </div>`
        ).join('')}
			</div>
		</div>
	</div>
`)

})()