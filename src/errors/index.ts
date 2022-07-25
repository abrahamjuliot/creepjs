import { hashSlice } from '../utils/helpers'
import { modal } from '../utils/html'

const createErrorsCaptured = () => {
	const errors = []
	return {
		getErrors: () => errors,
		captureError: (error, customMessage = '') => {
			const type = {
				Error: true,
				EvalError: true,
				InternalError: true,
				RangeError: true,
				ReferenceError: true,
				SyntaxError: true,
				TypeError: true,
				URIError: true,
				InvalidStateError: true,
				SecurityError: true,
			}
			const hasInnerSpace = (s) => /.+(\s).+/g.test(s) // ignore AOPR noise
			console.error(error) // log error to educate
			const { name, message } = error
			const trustedMessage = (
				!hasInnerSpace(message) ? undefined :
					!customMessage ? message :
						`${message} [${customMessage}]`
			)
			const trustedName = type[name] ? name : undefined
			errors.push(
				{ trustedName, trustedMessage },
			)
			return undefined
		},
	}
}
const errorsCaptured = createErrorsCaptured()
const { captureError } = errorsCaptured

const attempt = (fn, customMessage = '') => {
	try {
		return fn()
	} catch (error) {
		if (customMessage) {
			return captureError(error, customMessage)
		}
		return captureError(error)
	}
}

const caniuse = (fn, objChainList = [], args = [], method = false) => {
	let api
	try {
		api = fn()
	} catch (error) {
		return undefined
	}
	let i; const len = objChainList.length; let chain = api
	try {
		for (i = 0; i < len; i++) {
			const obj = objChainList[i]
			chain = chain[obj]
		}
	} catch (error) {
		return undefined
	}
	return (
		method && args.length ? chain.apply(api, args) :
			method && !args.length ? chain.apply(api) :
				chain
	)
}

// Log performance time
const timer = (logStart) => {
	logStart && console.log(logStart)
	let start = 0
	try {
		start = performance.now()
	} catch (error) {
		captureError(error)
	}
	return (logEnd) => {
		let end = 0
		try {
			end = performance.now() - start
			logEnd && console.log(`${logEnd}: ${end / 1000} seconds`)
			return end
		} catch (error) {
			captureError(error)
			return 0
		}
	}
}

const getCapturedErrors = () => ({ data: errorsCaptured.getErrors() })

const errorsHTML = (fp, pointsHTML) => {
	const { capturedErrors: { data, $hash } } = fp
	const len = data.length
	return `
	<div class="${len ? ' errors': ''}">errors (${!len ? '0' : ''+len}): ${
		!len ? 'none' : modal(
			'creep-captured-errors',
			Object.keys(data)
			.map((key, i) => `${i+1}: ${data[key].trustedName} - ${data[key].trustedMessage} `)
			.join('<br>'),
			hashSlice($hash),
		)
	}${pointsHTML}</div>`
}

export { captureError, attempt, caniuse, timer, errorsCaptured, getCapturedErrors, errorsHTML }
