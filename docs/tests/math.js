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

	const poly = `const poly = {
	atanh: x => Math.log((1 + x) / (1 - x)) / 2,
	expm1: x => Math.exp(x) - 1,
	log1p: x => {
		const nearX = (x + 1) - 1
		return (
			x < -1 || x !== x ? NaN :
			x === 0 || x === Infinity ? x :
			nearX === 0 ? x :
			x * (Math.log(x + 1) / nearX)
		)
	},
	log2: x => Math.log(x) * Math.LOG2E,
	pow: (x, y) => x ** y
}`

	const start = performance.now()

	const css = {
		unknown: 'unknown',
		crossBrowser: 'cross-browser',
		chromium: 'chromium',
		firefox: 'firefox',
		torBrowser: 'tor-browser',
		safari: 'safari'
	}
	const maths = {
		// diff lengths must match for this test
		['Math.acos(0.123)']: [
			'1.44748405160302', {
				['47']: css.chromium,
				['45']: css.safari
			}
		],
		['Math.acos(Math.SQRT1_2)']: [
			'0.7853981633974483', {
				['']: css.crossBrowser
			}
		],
		['Math.acosh(Math.PI)']: [
			'1.811526272460853', {
				['']: css.crossBrowser
			}
		],
		['Math.acosh(Math.SQRT2)']: [
			'0.88137358701954', {
				['30']: css.chromium,
				['32']: css.safari
			}
		],
		['Math.asin(0.123)']: [
			'0.12331227519187199', {
				['']: css.crossBrowser
			}
		],
		['Math.asinh(Math.PI)']: [
			'1.8622957433108482', {
				['']: css.crossBrowser
			}
		],
		['Math.atan(2)']: [
			'1.1071487177940', {
				['904']: css.chromium,
				['906']: css.safari
			}
		],
		['Math.atan(Math.PI)']: [
			'1.2626272556789115', {
				['']: css.crossBrowser
			}
		],
		['Math.atanh(0.5)']: [
			'0.54930614433405', {
				['48']: css.chromium,
				['49']: css.safari
			}
		],
		['Math.atan2(1e-310, 2)']: [
			'5e-311', {
				['']: css.crossBrowser
			}
		],
		['Math.cbrt(100)']: [
			'4.641588833612779', {
				['']: css.crossBrowser
			}
		],
		['Math.cbrt(Math.PI)']: [
			'1.46459188756152', {
				['31']: css.chromium,
				['34']: css.safari
			}
		],
		['Math.cos(21*Math.LN2)']: [
			'-0.', {
				['40677759702517240']: css.chromium,
				['40677759702517235']: css.firefox,
				['65340631858201970']: css.torBrowser
			}
		],
		['Math.cos(21*Math.SQRT1_2)']: [
			'-0.6534063185820', {
				['198']: css.chromium,
				['197']: css.torBrowser
			}
		],
		['Math.cosh(Math.PI)']: [
			'11.591953275521519', {
				['']: css.crossBrowser
			}
		],
		['Math.cosh(492*Math.LOG2E)']: [
			'9.19987031387777', {
				['2e+307']: css.chromium,
				['4e+307']: css.firefox
			}
		],
		['Math.expm1(1)']: [
			'1.7182818284590', {
				['450']: css.chromium,
				['453']: css.safari
			}
		],
		['Math.expm1(Math.PI)']: [
			'22.140692632779267', {
				['']: css.crossBrowser
			}
		],
		['Math.exp(Math.PI)']: [
			'23.140692632779267', {
				['']: css.crossBrowser
			}
		],
		['Math.hypot(1, 2, 3, 4, 5, 6)']: [
			'9.539392014169456', {
				['']: css.crossBrowser
			}
		],
		['Math.hypot(Math.LOG2E, -100)']: [
			'100.010406303449', {
				['29']: css.chromium,
				['27']: css.firefox
			}
		],
		['Math.log(Math.PI)']: [
			'1.1447298858494002', {
				['']: css.crossBrowser
			}
		],
		['Math.log1p(Math.PI)']: [
			'1.4210804127942926', {
				['']: css.crossBrowser
			}
		],
		['Math.log10(Math.LOG10E)']: [
			'-0.36221568869946325', {
				['']: css.crossBrowser
			}
		],
		['Math.log10(7*Math.LOG10E)']: [
			'0.48288235131479', {
				['360']: css.chromium,
				['357']: css.firefox
			}
		],
		['Math.pow(Math.PI, -100)']: [
			'1.9275814160560', {
				['204e-50']: css.chromium,
				['185e-50']: css.firefox,
				['206e-50']: css.safari
			}
		],
		['Math.pow(2e-3, -100)']: [
			'7.8886090522101', {
				['02e+269']: css.chromium,
				['26e+269']: css.firefox
			}
		],
		['Math.sin(Math.PI)']: [
			'1.2246', {
				['467991473532e-16']: css.chromium,
				['063538223773e-16']: css.torBrowser
			}
		],
		['Math.sin(39*Math.E)']: [
			'-0.71816303085706', {
				['77']: css.chromium,
				['78']: css.firefox
			}
		],
		['Math.sinh(1)']: [
			'1.1752011936438014', {
				['']: css.crossBrowser
			}
		],
		['Math.sinh(Math.PI)']: [
			'11.5487393572577', {
				['48']: css.chromium,
				['46']: css.safari
			}
		],
		['Math.sinh(492*Math.LOG2E)']: [
			'9.19987031387777', {
				['2e+307']: css.chromium,
				['4e+307']: css.firefox
			}
		],
		['Math.sqrt(0.123)']: [
			'0.3507135583350036', {
				['']: css.crossBrowser
			}
		],
		['Math.tan(Math.PI)']: [
			'-1.2246467991473532e-16', {
				['']: css.crossBrowser
			}
		],
		['Math.tan(Math.PI)']: [
			'-1.2246467991473532e-16', {
				['']: css.crossBrowser
			}
		],
		['Math.tan(10*Math.LOG2E)']: [
			'-3.35371287053760', {
				['14']: css.chromium,
				['10']: css.firefox,
				['20']: css.safari
			}
		],
		['Math.tanh(0.123)']: [
			'0.122383441894408', {
				['75']: css.chromium,
				['76']: css.safari
			}
		],
		['Math.tanh(Math.PI)']: [
			'0.99627207622075', {
				['']: css.crossBrowser
			}
		]
	}

	const browser = new Set() // collect browser matches to determine engine
	const validMath = [] // collect valid fingerprints
	const invalidMath = [] // collect invalid results

	const style = (a, b) => b.map((char, i) => char != a[i] ? `<span class="bold-fail">${char}</span>` : char).join('')

	const polyMaths = Object.keys(maths).reduce((acc, key) => {
		const methodName = /Math\.(.+)\(/.exec(key)[1]
		return !new RegExp(`(\t|\s|\n)${methodName}:`, 'gm').test(poly) ? {
			...acc,
			[key]: maths[key]
		} : {
				...acc,
				[key]: maths[key],
				[key.replace(/Math\./, 'poly.')]: maths[key]
			}
	}, {})

	const template = Object.keys(polyMaths).map(key => {
		// compute the math result
		const mathComputed = '' + new Function(`
		${poly}
		return ${key}
	`)()

		// get known entropy and its length
		const knownEntropy = polyMaths[key][1]
		const knownEntropyLen = Object.keys(knownEntropy)[0].length

		// get known stability
		const knownStability = '' + polyMaths[key][0]

		// get the expected char length
		const expectedCharLen = knownStability.length + knownEntropyLen

		// pad result
		const mathComputedPadded = mathComputed.padEnd(expectedCharLen, '0')

		// get computed stability
		const computedStability = (
			// if entropy is unknown, the result is cross browser and stable
			knownEntropyLen ? mathComputedPadded.slice(0, -1 * knownEntropyLen) : mathComputed
		)

		// test length
		const validLen = (knownStability.padEnd(expectedCharLen, '0')).length
		const mathComputedLen = mathComputedPadded.length
		const lenPass = validLen == mathComputedLen

		// test stability
		const stablePass = computedStability === knownStability

		// get computed entropy
		const entropyComputed = (
			// if entropy is unknown, the result is cross browser and entropy is empty
			knownEntropyLen ? mathComputedPadded.slice(-1 * knownEntropyLen) : ''
		)

		// collect browser name in set to compute js engine and fingerprint valid results
		let browserName
		if (stablePass && lenPass) {
			browserName = knownEntropy[entropyComputed] || css.unknown
			validMath.push(mathComputed) // fingerprint colelction
		} else {
			invalidMath.push(mathComputed)
		}
		browser.add(browserName)

		// create erratice templates
		const erraticTemplate = (
			!stablePass ? style(knownStability.split(''), mathComputed.split('')) : ''
		)
		const erraticeLength = (
			!lenPass ? Math.abs(mathComputedLen - validLen) : 0
		)

		// compute template
		return `
		<div class="group">${key}: ${
			erraticTemplate ? `<span class="erratic">${erraticTemplate}</span>` :
				`${computedStability}<span class="math-${browserName}">${entropyComputed}</span>`
			}
		${erraticeLength ? `<span class="erratic"> (length off by ${erraticeLength})</span>` : ''}
		</div>
	`
	})

	const perf = performance.now() - start
	const $hash = await hashify(validMath)
	const invalidLen = invalidMath.length
	const pluralify = len => len > 1 ? 's' : ''
	const hashSlice = x => x.slice(0, 8)
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
		.math-chromium,
		.math-firefox,
		.math-tor-browser,
		.math-safari,
		.math-unknown {
			padding: 2px 0;
		}
		.math-unknown {
			background: rgba(255,224,102,0.48);
		}
		.math-chromium {
			background: #657fca26;
			color: #8f8ff1 !important;
		}
		.math-firefox {
			background: #657fca54;
		}
		.math-tor-browser {
			background: #ca65b424;
		}
		.math-safari {
			background: #ca65b459;
		}
		@media (prefers-color-scheme: dark) {
			.math-firefox {
				color: #c778ba !important;
			}
			.math-tor-browser {
				color: #c778ba !important;
			}
		}
		</style>
		<div class="visitor-info">
			<span class="aside-note">${perf.toFixed(2)}ms</span>
			<strong>Math</strong>
			<div>${hashSlice($hash)}</div>
			<div>${invalidLen ? `<span class="erratic">${invalidLen} calculation${pluralify(invalidLen)} discarded</span>` : ''}</div>

			<div>JS Runtime: ${
		browser.has('tor-browser') ? 'SpiderMonkey (Tor Browser)' :
			browser.has('firefox') && !browser.has('safari') ? 'SpiderMonkey' :
				browser.has('safari') ? 'JavaScriptCore' :
					browser.has('chromium') ? 'V8' :
						'unknown'
		}</div>

			
			
			<br><span class="math-chromium">Chromium</span>
			<br><span class="math-firefox">Firefox</span>
			<br><span class="math-tor-browser">Tor Browser</span>
			<br><span class="math-safari">Safari</span>
		</div>
		<div>
			${template.join('')}
		</div>
	</div>
`)
})()