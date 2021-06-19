const computeStyle = (type, { require: [captureError] }) => {
	try {
		// get CSSStyleDeclaration
		const cssStyleDeclaration = (
			type == 'getComputedStyle' ? getComputedStyle(document.body) :
				type == 'HTMLElement.style' ? document.body.style :
					type == 'CSSRuleList.style' ? document.styleSheets[0].cssRules[0].style :
						undefined
		)
		if (!cssStyleDeclaration) {
			throw new TypeError('invalid argument string')
		}
		// get properties
		const proto = Object.getPrototypeOf(cssStyleDeclaration)
		const prototypeProperties = Object.getOwnPropertyNames(proto)
		const ownEnumerablePropertyNames = []
		const cssVar = /^--.*$/
		Object.keys(cssStyleDeclaration).forEach(key => {
			const numericKey = !isNaN(key)
			const value = cssStyleDeclaration[key]
			const customPropKey = cssVar.test(key)
			const customPropValue = cssVar.test(value)
			if (numericKey && !customPropValue) {
				return ownEnumerablePropertyNames.push(value)
			} else if (!numericKey && !customPropKey) {
				return ownEnumerablePropertyNames.push(key)
			}
			return
		})
		// get properties in prototype chain (required only in chrome)
		const propertiesInPrototypeChain = {}
		const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1)
		const uncapitalize = str => str.charAt(0).toLowerCase() + str.slice(1)
		const removeFirstChar = str => str.slice(1)
		const caps = /[A-Z]/g
		ownEnumerablePropertyNames.forEach(key => {
			if (propertiesInPrototypeChain[key]) {
				return
			}
			// determine attribute type
			const isNamedAttribute = key.indexOf('-') > -1
			const isAliasAttribute = caps.test(key)
			// reduce key for computation
			const firstChar = key.charAt(0)
			const isPrefixedName = isNamedAttribute && firstChar == '-'
			const isCapitalizedAlias = isAliasAttribute && firstChar == firstChar.toUpperCase()
			key = (
				isPrefixedName ? removeFirstChar(key) :
					isCapitalizedAlias ? uncapitalize(key) :
						key
			)
			// find counterpart in CSSStyleDeclaration object or its prototype chain
			if (isNamedAttribute) {
				const aliasAttribute = key.split('-').map((word, index) => index == 0 ? word : capitalize(word)).join('')
				if (aliasAttribute in cssStyleDeclaration) {
					propertiesInPrototypeChain[aliasAttribute] = true
				} else if (capitalize(aliasAttribute) in cssStyleDeclaration) {
					propertiesInPrototypeChain[capitalize(aliasAttribute)] = true
				}
			} else if (isAliasAttribute) {
				const namedAttribute = key.replace(caps, char => '-' + char.toLowerCase())
				if (namedAttribute in cssStyleDeclaration) {
					propertiesInPrototypeChain[namedAttribute] = true
				} else if (`-${namedAttribute}` in cssStyleDeclaration) {
					propertiesInPrototypeChain[`-${namedAttribute}`] = true
				}
			}
			return
		})
		// compile keys
		const keys = [
			...new Set([
				...prototypeProperties,
				...ownEnumerablePropertyNames,
				...Object.keys(propertiesInPrototypeChain)
			])
		]
		const interfaceName = ('' + proto).match(/\[object (.+)\]/)[1]

		return { keys, interfaceName }
	}
	catch (error) {
		captureError(error)
		return
	}
}

const getSystemStyles = (instanceId, { require: [captureError, parentPhantom] }) => {
	try {
		const colors = [
			'ActiveBorder',
			'ActiveCaption',
			'ActiveText',
			'AppWorkspace',
			'Background',
			'ButtonBorder',
			'ButtonFace',
			'ButtonHighlight',
			'ButtonShadow',
			'ButtonText',
			'Canvas',
			'CanvasText',
			'CaptionText',
			'Field',
			'FieldText',
			'GrayText',
			'Highlight',
			'HighlightText',
			'InactiveBorder',
			'InactiveCaption',
			'InactiveCaptionText',
			'InfoBackground',
			'InfoText',
			'LinkText',
			'Mark',
			'MarkText',
			'Menu',
			'MenuText',
			'Scrollbar',
			'ThreeDDarkShadow',
			'ThreeDFace',
			'ThreeDHighlight',
			'ThreeDLightShadow',
			'ThreeDShadow',
			'VisitedText',
			'Window',
			'WindowFrame',
			'WindowText'
		]
		const fonts = [
			'caption',
			'icon',
			'menu',
			'message-box',
			'small-caption',
			'status-bar'
		]

		let rendered
		if (!parentPhantom) {
			const id = 'creep-system-styles'
			const el = document.createElement('div')
			el.setAttribute('id', id)
			document.body.append(el)
			rendered = document.getElementById(id)
		}
		else {
			rendered = parentPhantom
		}
		const system = {
			colors: [],
			fonts: []
		}
		
		system.colors = colors.map(color => {
			rendered.setAttribute('style', `background-color: ${color} !important`)
			return {
				[color]: getComputedStyle(rendered).backgroundColor
			}
		})

		fonts.forEach(font => {
			rendered.setAttribute('style', `font: ${font} !important`)
			const computedStyle = getComputedStyle(rendered)
			system.fonts.push({
				[font]: `${computedStyle.fontSize} ${computedStyle.fontFamily}`
			})
		})

		if (!parentPhantom) {
			rendered.parentNode.removeChild(rendered)
		}
		return { ...system }
	}
	catch (error) {
		captureError(error)
		return
	}
}

export const getCSS = async imports => {

	const {
		require: {
			instanceId,
			captureError,
			logTestResult,
			parentPhantom
		}
	} = imports

	try {
		const start = performance.now()
		const computedStyle = computeStyle('getComputedStyle', { require: [captureError] })
		const system = getSystemStyles(instanceId, { require: [captureError, parentPhantom] })
		logTestResult({ start, test: 'computed style', passed: true })
		return {
			computedStyle,
			system
		}
	}
	catch (error) {
		logTestResult({ test: 'computed style', passed: false })
		captureError(error)
		return
	}
}

export const cssHTML = () => {
	
}