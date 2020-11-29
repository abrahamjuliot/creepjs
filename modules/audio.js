export const getOfflineAudioContext = imports => {
	
	const {
		require: {
			hashMini,
			hashify,
			captureError,
			attempt,
			caniuse,
			sendToTrash,
			documentLie,
			lieProps,
			contentWindow,
			logTestResult
		}
	} = imports

	return new Promise(resolve => {
		try {
			const win = contentWindow ? contentWindow : window
			const audioContext = caniuse(() => win.OfflineAudioContext || win.webkitOfflineAudioContext)
			if (!audioContext) {
				logTestResult({ test: 'audio', passed: false })
				return resolve()
			}
			// detect lies
			const channelDataLie = lieProps['AudioBuffer.getChannelData']
			const copyFromChannelLie = lieProps['AudioBuffer.copyFromChannel']
			let lied = (channelDataLie || copyFromChannelLie) || false
			
			const context = new audioContext(1, 44100, 44100)
			const analyser = context.createAnalyser()
			const oscillator = context.createOscillator()
			const dynamicsCompressor = context.createDynamicsCompressor()
			const biquadFilter = context.createBiquadFilter()

			oscillator.type = 'triangle'
			oscillator.frequency.value = 10000

			if (dynamicsCompressor.threshold) { dynamicsCompressor.threshold.value = -50 }
			if (dynamicsCompressor.knee) { dynamicsCompressor.knee.value = 40 }
			if (dynamicsCompressor.ratio) { dynamicsCompressor.ratio.value = 12 }
			if (dynamicsCompressor.reduction) { dynamicsCompressor.reduction.value = -20 }
			if (dynamicsCompressor.attack) { dynamicsCompressor.attack.value = 0 }
			if (dynamicsCompressor.release) { dynamicsCompressor.release.value = 0.25 }

			oscillator.connect(dynamicsCompressor)
			dynamicsCompressor.connect(context.destination)
			oscillator.start(0)
			context.startRendering()

			const dataArray = new Float32Array(analyser.frequencyBinCount)
			analyser.getFloatFrequencyData(dataArray)
			const floatFrequencyUniqueDataSize = new Set(dataArray).size
			if (floatFrequencyUniqueDataSize > 1) {
				lied = true
				const floatFrequencyDataLie = { fingerprint: '', lies: [{ [`Expected 1 unique frequency and got ${floatFrequencyUniqueDataSize}`]: true }] }
				documentLie(`AnalyserNode.getFloatFrequencyData`, floatFrequencyUniqueDataSize, floatFrequencyDataLie)
			}

			let copySample = []
			let binsSample = []
			let matching = false
			
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
					const chain = ['context', 'listener', 'forwardX', 'maxValue']
					return caniuse(() => analyser, chain)
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
			
			return resolve(new Promise(resolve => {
				context.oncomplete = async event => {
					try {
						const copy = new Float32Array(44100)
						caniuse(() => event.renderedBuffer.copyFromChannel(copy, 0))
						const bins = event.renderedBuffer.getChannelData(0)
						
						copySample = copy ? [...copy].slice(4500, 4600) : [sendToTrash('invalid Audio Sample Copy', null)]
						binsSample = bins ? [...bins].slice(4500, 4600) : [sendToTrash('invalid Audio Sample', null)]
						
						const copyJSON = copy && JSON.stringify([...copy].slice(4500, 4600))
						const binsJSON = bins && JSON.stringify([...bins].slice(4500, 4600))

						matching = binsJSON === copyJSON
						// detect lie
						const copyFromChannelSupported = ('copyFromChannel' in AudioBuffer.prototype)
						if (copyFromChannelSupported && !matching) {
							lied = true
							const audioSampleLie = { fingerprint: '', lies: [{ ['data and copy samples mismatch']: false }] }
							documentLie('AudioBuffer', hashMini(matching), audioSampleLie)
						}

						dynamicsCompressor.disconnect()
						oscillator.disconnect()
						const response = {
							binsSample: binsSample,
							copySample: copyFromChannelSupported ? copySample : [undefined],
							matching,
							values,
							lied
						}
						const $hash = await hashify(response)
						logTestResult({ test: 'audio', passed: true })
						return resolve({...response, $hash })
					}
					catch (error) {
						captureError(error, 'AudioBuffer failed or blocked by client')
						dynamicsCompressor.disconnect()
						oscillator.disconnect()
						const response = {
							copySample: [undefined],
							binsSample: [undefined],
							matching,
							values,
							lied
						}
						const $hash = await hashify(response)
						logTestResult({ test: 'audio', passed: false })
						return resolve({...response, $hash })
					}
				}
			}))
		}
		catch (error) {
			logTestResult({ test: 'audio', passed: false })
			captureError(error, 'OfflineAudioContext failed or blocked by client')
			return resolve()
		}
	})
}