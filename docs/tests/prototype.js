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

const ghost = () => `
	height: 100vh;
	width: 100vw;
	position: absolute;
	left:-10000px;
	visibility: hidden;
`

const getRandomValues = () => {
	const id = [...crypto.getRandomValues(new Uint32Array(10))]
		.map(n => n.toString(36)).join('')
	return id
}

const getPhantomIframe = () => {
	try {
		const numberOfIframes = window.length
		const frag = new DocumentFragment()
		const div = document.createElement('div')
		const id = getRandomValues()
		div.setAttribute('id', id)
		frag.appendChild(div)
		div.innerHTML = `<div style="${ghost()}"><iframe></iframe></div>`
		document.body.appendChild(frag)
		const iframeWindow = window[numberOfIframes]
		return { iframeWindow, div }
	}
	catch (error) {
		captureError(error, 'client blocked phantom iframe')
		return { iframeWindow: window, div: undefined }
	}
}
const { iframeWindow: phantomDarkness, div: parentPhantom } = getPhantomIframe()

const getPrototypeLies = phantomDarkness => {
    // Lie Tests
    // object constructor descriptor should return undefined properties
    const getUndefinedValueLie = (obj, name) => {
        const objName = obj.name
        const objNameUncapitalized = window[objName.charAt(0).toLowerCase() + objName.slice(1)]
        const hasInvalidValue = !!objNameUncapitalized && (
            typeof Object.getOwnPropertyDescriptor(objNameUncapitalized, name) != 'undefined' ||
            typeof Reflect.getOwnPropertyDescriptor(objNameUncapitalized, name) != 'undefined'
        )
        return hasInvalidValue ? true : false
    }

    // creating a new instance of the API function should throw a TypeError
    const getNewInstanceTypeErrorLie = apiFunction => {
        try {
            new apiFunction()
            return true
        } catch (error) {
            return error.constructor.name != 'TypeError' ? true : false
        }
    }

    // extending the API function to a fake class should throw a TypeError
    const getClassExtendsTypeErrorLie = apiFunction => {
        try {
            class Fake extends apiFunction {}
            return true
        } catch (error) {
            // Native has TypeError and 'not a constructor' message in FF & Chrome
            return error.constructor.name != 'TypeError' ? true :
                !/not a constructor/i.test(error.message) ? true : false
        }
    }

    // setting prototype to null and converting to primitive value should throw a TypeError
    const getNullConversionTypeErrorLie = apiFunction => {
        const nativeProto = Object.getPrototypeOf(apiFunction)
        try {
            Object.setPrototypeOf(apiFunction, null) + ''
            return true
        } catch (error) {
            return error.constructor.name != 'TypeError' ? true : false
        } finally {
            // restore proto
            Object.setPrototypeOf(apiFunction, nativeProto)
        }
    }

    // toString() and toString.toString() should return a native string
    const getToStringLie = (apiFunction, name, phantomDarkness) => {
        /*
        Accepted strings:
        'function name() { [native code] }'
        'function name() {\n    [native code]\n}'
        'function get name() { [native code] }'
        'function get name() {\n    [native code]\n}'
        'function () { [native code] }'
        `function () {\n    [native code]\n}`
        */
		const apiFunctionToString = (
			phantomDarkness ? 
			phantomDarkness.Function.prototype.toString.call(apiFunction) :
			apiFunction.toString()
		)
		const apiFunctionToStringToString = (
			phantomDarkness ? 
			phantomDarkness.Function.prototype.toString.call(apiFunction.toString) :
			apiFunction.toString.toString()
		)
		const trust = name => ({
			[`function ${name}() { [native code] }`]: true,
			[`function get ${name}() { [native code] }`]: true,
			[`function () { [native code] }`]: true,
			[`function ${name}() {${'\n'}    [native code]${'\n'}}`]: true,
			[`function get ${name}() {${'\n'}     [native code]${'\n'} }`]: true,
			[`function () {${'\n'}     [native code]${'\n'} }`]: true
		})
        return (
            !trust(name)[apiFunctionToString] ||
            !trust('toString')[apiFunctionToStringToString]
        )
    }

    // 'prototype' should not exist in API function
    const getPrototypeInFunctionLie = apiFunction => 'prototype' in apiFunction ? true : false

    // 'arguments', 'caller', 'prototype', 'toString' should not exist in descriptor
    const getDescriptorLie = apiFunction => {
        const hasInvalidDescriptor = (
            !!Object.getOwnPropertyDescriptor(apiFunction, 'arguments') ||
            !!Reflect.getOwnPropertyDescriptor(apiFunction, 'arguments') ||
            !!Object.getOwnPropertyDescriptor(apiFunction, 'caller') ||
            !!Reflect.getOwnPropertyDescriptor(apiFunction, 'caller') ||
            !!Object.getOwnPropertyDescriptor(apiFunction, 'prototype') ||
            !!Reflect.getOwnPropertyDescriptor(apiFunction, 'prototype') ||
            !!Object.getOwnPropertyDescriptor(apiFunction, 'toString') ||
            !!Reflect.getOwnPropertyDescriptor(apiFunction, 'toString')
        )
        return hasInvalidDescriptor ? true : false
    }

    // 'arguments', 'caller', 'prototype', 'toString' should not exist as own property
    const getOwnPropertyLie = apiFunction => {
        const hasInvalidOwnProperty = (
            apiFunction.hasOwnProperty('arguments') ||
            apiFunction.hasOwnProperty('caller') ||
            apiFunction.hasOwnProperty('prototype') ||
            apiFunction.hasOwnProperty('toString')
        )
        return hasInvalidOwnProperty ? true : false
    }

    // descriptor keys should only contain 'length' and 'name' 
    const getDescriptorKeysLie = apiFunction => {
        const descriptorKeys = Object.keys(Object.getOwnPropertyDescriptors(apiFunction))
        const hasInvalidKeys = '' + descriptorKeys != 'length,name' && '' + descriptorKeys != 'name,length'
        return hasInvalidKeys ? true : false
    }

    // own property names should only contain 'length' and 'name' 
    const getOwnPropertyNamesLie = apiFunction => {
        const ownPropertyNames = Object.getOwnPropertyNames(apiFunction)
        const hasInvalidNames = (
            '' + ownPropertyNames != 'length,name' && '' + ownPropertyNames != 'name,length'
        )
        return hasInvalidNames ? true : false
    }

    // own keys names should only contain 'length' and 'name' 
    const getOwnKeysLie = apiFunction => {
        const ownKeys = Reflect.ownKeys(apiFunction)
        const hasInvalidKeys = '' + ownKeys != 'length,name' && '' + ownKeys != 'name,length'
        return hasInvalidKeys ? true : false
    }

    // API Function Test
    const getPrototypeLies = (apiFunction, obj = null) => {
        if (typeof apiFunction != 'function') {
            return {
                lied: false,
                lieTypes: []
            }
        }
        const name = apiFunction.name.replace(/get\s/, '')
        const lies = {
            // custom lie string names
            'failed undefined value': obj ? getUndefinedValueLie(obj, name) : false,
            'failed new instance type error': getNewInstanceTypeErrorLie(apiFunction),
            'failed class extends type error': getClassExtendsTypeErrorLie(apiFunction),
            'failed null conversion type error': getNullConversionTypeErrorLie(apiFunction),
            'failed to string': getToStringLie(apiFunction, name, phantomDarkness),
        	'failed prototype in function': getPrototypeInFunctionLie(apiFunction),
            'failed descriptor': getDescriptorLie(apiFunction),
            'failed own property': getOwnPropertyLie(apiFunction),
            'failed descriptor keys': getDescriptorKeysLie(apiFunction),
            'failed own property names': getOwnPropertyNamesLie(apiFunction),
            'failed own keys': getOwnKeysLie(apiFunction)
        }
        const lieTypes = Object.keys(lies).filter(key => !!lies[key])
        return {
            lied: lieTypes.length,
            lieTypes
        }
    }

    // Lie Detector
    const createLieDetector = () => {
        const props = {} // lie list and detail
		let totalPropCount = 0
        return {
            getProps: () => props,
			getCount: () => totalPropCount,
            searchLies: (obj, {
                ignore
            } = {}) => Object.getOwnPropertyNames(obj.prototype).forEach(name => {
                if (name == 'constructor' || (ignore && new Set(ignore).has(name))) {
                    return
                }
                const apiName = `${obj.name}.${name}`
				totalPropCount++
                try {
                    const proto = obj.prototype
                    let res // response from getPrototypeLies

                    // search if function
                    try {
                        const apiFunction = proto[name] // may trigger TypeError
                        if (typeof apiFunction == 'function') {
                            res = getPrototypeLies(proto[name])
                            if (res.lied) {
                                return (props[`${obj.name}.${name}`] = res.lieTypes)
                            }
                            return
                        }
                    } catch (error) {}
                    // else search getter function
                    const getterFunction = Object.getOwnPropertyDescriptor(proto, name).get
                    res = getPrototypeLies(getterFunction, obj) // send the obj for special tests
                    if (res.lied) {
                        return (props[apiName] = res.lieTypes)
                    }
                    return
                } catch (error) {
                    // API may be blocked or unsupported
                    return console.error(`${apiName} test failed`)
                }
            })
        }
    }

    const lieDetector = createLieDetector()
    const {
        searchLies
    } = lieDetector

    // search for lies: add properties to ignore if desired
    searchLies(Node)
    searchLies(Element)
    searchLies(HTMLElement)
    searchLies(HTMLCanvasElement)
    searchLies(Navigator)
    searchLies(Screen)
    searchLies(Date)
    searchLies(Intl.DateTimeFormat)
    searchLies(Intl.RelativeTimeFormat)
    searchLies(CanvasRenderingContext2D)
    searchLies(PluginArray)
    searchLies(Plugin)
    searchLies(Document)

    // if supported
    if ('WebGLRenderingContext' in window) {
        searchLies(WebGLRenderingContext)
    }
    if ('WebGL2RenderingContext' in window) {
        searchLies(WebGL2RenderingContext)
    }
    if ('OffscreenCanvasRenderingContext2D' in window) {
        searchLies(OffscreenCanvasRenderingContext2D)
    }
    if ('AnalyserNode' in window) {
        searchLies(AnalyserNode)
    }
    if ('AudioBuffer' in window) {
        searchLies(AudioBuffer)
    }

    // return lies list and detail 
    const props = lieDetector.getProps()
	const totalPropCount = lieDetector.getCount()
    return {
        lieList: Object.keys(props),
        lieDetail: props,
		lieCount: Object.keys(props).reduce((acc, key) => acc+props[key].length, 0),
		totalPropCount,
    }
}

// start program
const start = performance.now()
const { lieList, lieDetail, lieCount, totalPropCount } = getPrototypeLies(phantomDarkness) // execute and destructure the list and detail
if (parentPhantom) {
	parentPhantom.parentNode.removeChild(parentPhantom)
}
const perf = performance.now() - start

// check lies later in any function
lieList.includes('HTMLCanvasElement.toDataURL') // returns true or false
lieDetail['HTMLCanvasElement.toDataURL'] // returns the list of lies

const lieLen = lieList.length 
const el = document.getElementById('fingerprint-data')
	patch(el, html`
		<div id="fingerprint-data">
			<style>
				.failure {
					padding: 20px;
					font-size: 12px !important
				}
			</style>
			<div class="visitor-info">
				<span class="aside-note">${perf.toFixed(2)}ms</span>
				<strong>Prototype</strong>
				<div>${''+lieCount} lies detected in ${lieLen ? `${''+lieLen} of ` : '' }${''+totalPropCount} properties</div>
			</div>
			<div>
			${
				lieLen ? Object.keys(lieDetail).map(key => {
					return `${key}`
				}).join('<br>') :
				'passed'
			}
			</div>
			<div>
			${
				lieLen ? Object.keys(lieDetail).map(key => {
					return `${key}:
						<div class="failure">
							${lieDetail[key].map(lie => `<div>${lie}</div>`).join('')}
						</div>
					`
				}).join('<br>') :
				''
			}
			</div>
		</div>
	`)
})()