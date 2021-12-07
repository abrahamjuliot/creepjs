export const getKnownAudio = () => ({
	// Chrome
	[-20.538286209106445]: [
		124.0434488439787,
		124.04344968475198,
		124.04347527516074,
		124.04347503720783,
		124.04347657808103
	],
	[-20.538288116455078]: [
		124.04347527516074,
		124.04344884395687,
		124.04344968475198,
		124.04347657808103,
		124.04347730590962,
		124.0434806260746
	],
	[-20.535268783569336]: [124.080722568091],

	// Firefox Android
	[-31.502185821533203]: [35.74996031448245, 35.7499681673944],
	// Firefox windows/mac/linux
	[-31.50218963623047]: [35.74996031448245],
	[-31.509262084960938]: [35.7383295930922, 35.73833402246237] 
})

export const getOfflineAudioContext = async imports => {

	const {
		require: {
			captureError,
			attempt,
			caniuse,
			sendToTrash,
			documentLie,
			lieProps,
			phantomDarkness,
			logTestResult
		}
	} = imports

	try {
		await new Promise(setTimeout).catch(e => {})
		const start = performance.now()
		const win = phantomDarkness ? phantomDarkness : window
		const audioContext = caniuse(() => win.OfflineAudioContext || win.webkitOfflineAudioContext)
		if (!audioContext) {
			logTestResult({ test: 'audio', passed: false })
			return
		}
		// detect lies
		const channelDataLie = lieProps['AudioBuffer.getChannelData']
		const copyFromChannelLie = lieProps['AudioBuffer.copyFromChannel']
		let lied = (channelDataLie || copyFromChannelLie) || false

		const bufferLen = 5000
		const context = new audioContext(1, bufferLen, 44100)
		const analyser = context.createAnalyser()
		const oscillator = context.createOscillator()
		const dynamicsCompressor = context.createDynamicsCompressor()
		const biquadFilter = context.createBiquadFilter()

		// detect lie
		const dataArray = new Float32Array(analyser.frequencyBinCount)
		analyser.getFloatFrequencyData(dataArray)
		const floatFrequencyUniqueDataSize = new Set(dataArray).size
		if (floatFrequencyUniqueDataSize > 1) {
			lied = true
			const floatFrequencyDataLie = `expected -Infinity (silence) and got ${floatFrequencyUniqueDataSize} frequencies`
			documentLie(`AnalyserNode.getFloatFrequencyData`, floatFrequencyDataLie)
		}

		const values = {
			['AnalyserNode.channelCount']: attempt(() => analyser.channelCount),
			['AnalyserNode.channelCountMode']: attempt(() => analyser.channelCountMode),
			['AnalyserNode.channelInterpretation']: attempt(() => analyser.channelInterpretation),
			['AnalyserNode.context.sampleRate']: attempt(() => analyser.context.sampleRate),
			['AnalyserNode.fftSize']: attempt(() => analyser.fftSize),
			['AnalyserNode.frequencyBinCount']: attempt(() => analyser.frequencyBinCount),
			['AnalyserNode.maxDecibels']: attempt(() => analyser.maxDecibels),
			['AnalyserNode.minDecibels']: attempt(() => analyser.minDecibels),
			['AnalyserNode.numberOfInputs']: attempt(() => analyser.numberOfInputs),
			['AnalyserNode.numberOfOutputs']: attempt(() => analyser.numberOfOutputs),
			['AnalyserNode.smoothingTimeConstant']: attempt(() => analyser.smoothingTimeConstant),
			['AnalyserNode.context.listener.forwardX.maxValue']: attempt(() => {
				return caniuse(() => analyser.context.listener.forwardX.maxValue)
			}),
			['BiquadFilterNode.gain.maxValue']: attempt(() => biquadFilter.gain.maxValue),
			['BiquadFilterNode.frequency.defaultValue']: attempt(() => biquadFilter.frequency.defaultValue),
			['BiquadFilterNode.frequency.maxValue']: attempt(() => biquadFilter.frequency.maxValue),
			['DynamicsCompressorNode.attack.defaultValue']: attempt(() => dynamicsCompressor.attack.defaultValue),
			['DynamicsCompressorNode.knee.defaultValue']: attempt(() => dynamicsCompressor.knee.defaultValue),
			['DynamicsCompressorNode.knee.maxValue']: attempt(() => dynamicsCompressor.knee.maxValue),
			['DynamicsCompressorNode.ratio.defaultValue']: attempt(() => dynamicsCompressor.ratio.defaultValue),
			['DynamicsCompressorNode.ratio.maxValue']: attempt(() => dynamicsCompressor.ratio.maxValue),
			['DynamicsCompressorNode.release.defaultValue']: attempt(() => dynamicsCompressor.release.defaultValue),
			['DynamicsCompressorNode.release.maxValue']: attempt(() => dynamicsCompressor.release.maxValue),
			['DynamicsCompressorNode.threshold.defaultValue']: attempt(() => dynamicsCompressor.threshold.defaultValue),
			['DynamicsCompressorNode.threshold.minValue']: attempt(() => dynamicsCompressor.threshold.minValue),
			['OscillatorNode.detune.maxValue']: attempt(() => oscillator.detune.maxValue),
			['OscillatorNode.detune.minValue']: attempt(() => oscillator.detune.minValue),
			['OscillatorNode.frequency.defaultValue']: attempt(() => oscillator.frequency.defaultValue),
			['OscillatorNode.frequency.maxValue']: attempt(() => oscillator.frequency.maxValue),
			['OscillatorNode.frequency.minValue']: attempt(() => oscillator.frequency.minValue)
		}

		const getRenderedBuffer = ({
			context,
			floatFrequencyData,
			floatTimeDomainData
		} = {}) => new Promise(resolve => {
			let analyser
			const oscillator = context.createOscillator()
			const dynamicsCompressor = context.createDynamicsCompressor()

			oscillator.type = 'triangle'
			oscillator.frequency.value = 10000

			caniuse(() => dynamicsCompressor.threshold.value = -50)
			caniuse(() => dynamicsCompressor.knee.value = 40)
			caniuse(() => dynamicsCompressor.attack.value = 0)

			oscillator.connect(dynamicsCompressor)

			if (floatFrequencyData || floatTimeDomainData) {
				analyser = context.createAnalyser()
				dynamicsCompressor.connect(analyser)
				analyser.connect(context.destination)
			} else {
				dynamicsCompressor.connect(context.destination)
			}

			oscillator.start(0)
			context.startRendering()

			context.oncomplete = event => {
				try {
					if (floatFrequencyData) {
						const data = new Float32Array(analyser.frequencyBinCount)
						analyser.getFloatFrequencyData(data)
						return resolve(data)
					}
					else if (floatTimeDomainData) {
						const data = new Float32Array(analyser.fftSize)
						analyser.getFloatTimeDomainData(data)
						return resolve(data)
					}
					return resolve({
						buffer: event.renderedBuffer,
						compressorGainReduction: (
							dynamicsCompressor.reduction.value || // webkit
							dynamicsCompressor.reduction
						)
					})
				}
				catch (error) {
					return resolve()
				}
				finally {
					dynamicsCompressor.disconnect()
					oscillator.disconnect()
				}
			}
		})

		const [
			response,
			floatFrequencyData,
			floatTimeDomainData
		] = await Promise.all([
			getRenderedBuffer({
				context: new audioContext(1, bufferLen, 44100)
			}),
			getRenderedBuffer({
				context: new audioContext(1, bufferLen, 44100),
				floatFrequencyData: true
			}),
			getRenderedBuffer({
				context: new audioContext(1, bufferLen, 44100),
				floatTimeDomainData: true
			})
		])
		
		const getSum = arr => !arr ? 0 : arr.reduce((acc, curr) => (acc += Math.abs(curr)), 0)
		const { buffer, compressorGainReduction } = response || {}
		const floatFrequencyDataSum = getSum(floatFrequencyData)
		const floatTimeDomainDataSum = getSum(floatTimeDomainData)

		const copy = new Float32Array(bufferLen)
		caniuse(() => buffer.copyFromChannel(copy, 0))
		const bins = caniuse(() => buffer.getChannelData(0)) || []
		const copySample = [...copy].slice(4500, 4600)
		const binsSample = [...bins].slice(4500, 4600)
		const sampleSum = getSum([...bins].slice(4500, bufferLen))
		
		// detect lies

		// sample matching
		const matching = '' + binsSample == '' + copySample
		const copyFromChannelSupported = ('copyFromChannel' in AudioBuffer.prototype)
		if (copyFromChannelSupported && !matching) {
			lied = true
			const audioSampleLie = 'getChannelData and copyFromChannel samples mismatch'
			documentLie('AudioBuffer', audioSampleLie)
		}

		// sample uniqueness
		const totalUniqueSamples = new Set([...bins]).size
		if (totalUniqueSamples == bufferLen) {
			const audioUniquenessTrash = `${totalUniqueSamples} unique samples of ${bufferLen} is too high`
			sendToTrash('AudioBuffer', audioUniquenessTrash)
		}

		// sample noise factor
		const getNoiseFactor = () => {
			try {
				const buffer = new AudioBuffer({
					length: 1,
					sampleRate: 44100
				})
				buffer.getChannelData(0)[0] = 1
				return buffer.getChannelData(0)[0]
			}
			catch (error) {
				return 1
			}
		}
		const noiseFactor = getNoiseFactor()
		const noise = noiseFactor == 1 ? 0 : noiseFactor
		if (noise) {
			lied = true
			const audioSampleNoiseLie = 'sample noise detected'
			documentLie('AudioBuffer', audioSampleNoiseLie)
		}

		logTestResult({ start, test: 'audio', passed: true })
		return {
			totalUniqueSamples,
			compressorGainReduction,
			floatFrequencyDataSum,
			floatTimeDomainDataSum,
			sampleSum,
			binsSample,
			copySample: copyFromChannelSupported ? copySample : [undefined],
			values,
			noise,
			lied
		}
			
	}
	catch (error) {
		logTestResult({ test: 'audio', passed: false })
		captureError(error, 'OfflineAudioContext failed or blocked by client')
		return
	}

}

export const audioHTML = ({ fp, note, modal, getMismatchStyle, hashMini, hashSlice }) => {
	if (!fp.offlineAudioContext) {
		return `<div class="col-four undefined">
			<strong>Audio</strong>
			<div>sum: ${note.blocked}</div>
			<div>gain: ${note.blocked}</div>
			<div>freq: ${note.blocked}</div>
			<div>time: ${note.blocked}</div>
			<div>buffer noise: ${note.blocked}</div>
			<div>unique: ${note.blocked}</div>
			<div>data: ${note.blocked}</div>
			<div>copy: ${note.blocked}</div>
			<div>values: ${note.blocked}</div>
		</div>`
	}
	const {
		offlineAudioContext: {
			$hash,
			totalUniqueSamples,
			compressorGainReduction,
			floatFrequencyDataSum,
			floatTimeDomainDataSum,
			sampleSum,
			binsSample,
			copySample,
			lied,
			noise,
			values
		}
	} = fp
	const knownSums = getKnownAudio()[compressorGainReduction]
	
	return `
	<div class="col-four${lied ? ' rejected' : ''}">
		<strong>Audio</strong><span class="${lied ? 'lies ' : ''}hash">${hashSlice($hash)}</span>
		<div class="help" title="AudioBuffer.getChannelData()">sum: ${
			sampleSum && compressorGainReduction && knownSums && !knownSums.includes(sampleSum) ?
			getMismatchStyle((''+knownSums[0]).split(''), (''+sampleSum).split('')) :
			sampleSum
		}</div>
		<div class="help" title="DynamicsCompressorNode.reduction">gain: ${
			compressorGainReduction || note.blocked
		}</div>
		<div class="help" title="AnalyserNode.getFloatFrequencyData()">freq: ${
			floatFrequencyDataSum || note.blocked
		}</div>
		<div class="help" title="AnalyserNode.getFloatTimeDomainData()">time: ${
			floatTimeDomainDataSum || note.blocked
		}</div>
		<div>buffer noise: ${!noise ? 0 : `${noise.toFixed(4)}...`}</div>
		<div>unique: ${totalUniqueSamples}</div>
		<div class="help" title="AudioBuffer.getChannelData()">data:${
			''+binsSample[0] == 'undefined' ? ` ${note.unsupported}` : 
			`<span class="sub-hash">${hashMini(binsSample)}</span>`
		}</div>
		<div class="help" title="AudioBuffer.copyFromChannel()">copy:${
			''+copySample[0] == 'undefined' ? ` ${note.unsupported}` : 
			`<span class="sub-hash">${hashMini(copySample)}</span>`
		}</div>
		<div>values: ${
			modal(
				'creep-offline-audio-context',
				Object.keys(values).map(key => `<div>${key}: ${values[key]}</div>`).join(''),
				hashMini(values)
			)
		}</div>
	</div>
	`
}