(async () => {
	const caniuse = (api, objChainList = [], args = [], method = false) => {
		if (!api) { return undefined }
		let i, len = objChainList.length, chain = api
		try {
			for (i = 0; i < len; i++) {
				const obj = objChainList[i]
				chain = chain[obj]
			}
		}
		catch (error) {
			const prop = `${api.name}`
			return undefined
		}
		return (
			method && args.length ? chain.apply(api, args) :
			method && !args.length ? chain.apply(api) :
			chain
		)
	}

	let dataURI = undefined
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
			const file = new File([blob], 'offscreen')
			const reader = new FileReader()
			reader.readAsDataURL(blob)
			return new Promise(resolve => {
				reader.onloadend = () => resolve(reader.result)
			})
		}
		dataURI = await getDataURI() 
	}
	catch (error) { }
    
	const hardwareConcurrency = caniuse(navigator, ['hardwareConcurrency'])
	const language = caniuse(navigator, ['language'])
	const platform = caniuse(navigator, ['platform'])
	const userAgent = caniuse(navigator, ['userAgent'])

	postMessage({ hardwareConcurrency, language, platform, userAgent, dataURI })
	close()
})()