(async () => {
	const caniuse = (fn, objChainList = [], args = [], method = false) => {
		let api
		try {
			api = fn()
		} catch (error) {
			return undefined
		}
		let i, len = objChainList.length, chain = api
		try {
			for (i = 0; i < len; i++) {
				const obj = objChainList[i]
				chain = chain[obj]
			}
		}
		catch (error) {
			return undefined
		}
		return (
			method && args.length ? chain.apply(api, args) :
			method && !args.length ? chain.apply(api) :
			chain
		)
	}

	let canvas2d = undefined
	try {
		const canvas = new OffscreenCanvas(256, 256)
		const context = canvas.getContext('2d')
		const str = '%$%^LGFWE($HIF)'
		context.font = '20px Arial'
		context.fillText(str, 100, 100)
		context.fillStyle = 'red'
		context.fillRect(100, 30, 80, 50)
		context.font = '32px Times New Roman'
		context.fillStyle = 'blue'
		context.fillText(str, 20, 70)
		context.font = '20px Arial'
		context.fillStyle = 'green'
		context.fillText(str, 10, 50)
		const getDataURI = async () => {
			const blob = await canvas.convertToBlob()
			const reader = new FileReader()
			reader.readAsDataURL(blob)
			return new Promise(resolve => {
				reader.onloadend = () => resolve(reader.result)
			})
		}
		canvas2d = await getDataURI() 
	}
	catch (error) { }
    
	const hardwareConcurrency = caniuse(() => navigator, ['hardwareConcurrency'])
	const language = caniuse(() => navigator, ['language'])
	const platform = caniuse(() => navigator, ['platform'])
	const userAgent = caniuse(() => navigator, ['userAgent'])

	postMessage({ hardwareConcurrency, language, platform, userAgent, canvas2d })
	close()
})()