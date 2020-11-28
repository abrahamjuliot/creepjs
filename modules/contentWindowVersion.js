export const getIframeContentWindowVersion = imports => {

	const {
		require: {
			hashify,
			captureError,
			contentWindow
		}
	} = imports

	return new Promise(async resolve => {
		try {
			const keys = Object.getOwnPropertyNames(contentWindow)
			const moz = keys.filter(key => (/moz/i).test(key)).length
			const webkit = keys.filter(key => (/webkit/i).test(key)).length
			const apple = keys.filter(key => (/apple/i).test(key)).length
			const data = { keys, apple, moz, webkit } 
			const $hash = await hashify(data)
			console.log('%c✔ window passed', 'color:#4cca9f')
			return resolve({ ...data, $hash })
		}
		catch (error) {
			captureError(error)
			return resolve(undefined)
		}
	})
}