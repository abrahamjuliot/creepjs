export const getOfflineAudioContext = imports => {
	
	const {
		require: {
			hashMini,
			hashify,
			patch,
			html,
			modal,
			captureError,
			attempt,
			caniuse,
			sendToTrash,
			documentLie,
			lieProps
		}
	} = imports

	return new Promise(resolve => {
		try {
			const audioContext = caniuse(() => OfflineAudioContext || webkitOfflineAudioContext)
			if (!audioContext) {
				return resolve(undefined)
			}
			// detect lies
			const channelDataLie = lieProps['AudioBuffer.getChannelData']
			const copyFromChannelLie = lieProps['AudioBuffer.copyFromChannel']
			let lied = channelDataLie || copyFromChannelLie
			
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
						event.renderedBuffer.copyFromChannel(copy, 0)
						const bins = event.renderedBuffer.getChannelData(0)
						
						copySample = copy ? [...copy].slice(4500, 4600) : [sendToTrash('invalid Audio Sample Copy', null)]
						binsSample = bins ? [...bins].slice(4500, 4600) : [sendToTrash('invalid Audio Sample', null)]
						
						const copyJSON = copy && JSON.stringify([...copy].slice(4500, 4600))
						const binsJSON = bins && JSON.stringify([...bins].slice(4500, 4600))

						matching = binsJSON === copyJSON
						// detect lie
						
						if (!matching) {
							lied = true
							const audioSampleLie = { fingerprint: '', lies: [{ ['data and copy samples mismatch']: false }] }
							documentLie('AudioBuffer', hashMini(matching), audioSampleLie)
						}

						dynamicsCompressor.disconnect()
						oscillator.disconnect()
		
						const response = {
							binsSample: binsSample,
							copySample: copySample,
							matching,
							values,
							lied
						}

						const $hash = await hashify(response)
						resolve({...response, $hash })
						const id = 'creep-offline-audio-context'
						const el = document.getElementById(id)
						return patch(el, html`
						<div class="col-six">
							<strong>Audio</strong><span class="${lied ? 'lies ' : ''}hash">${hashMini($hash)}</span>
							<div>sample: ${binsSample[0]}</div>
							<div>copy: ${copySample[0]}</div>
							<div>matching: ${matching}</div>
							<div>node values: ${
								modal(id, Object.keys(values).map(key => `<div>${key}: ${values[key]}</div>`).join(''))
							}</div>
						</div>
						`)
					}
					catch (error) {
						captureError(error)
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
						return resolve({...response, $hash })
					}
				}
			}))
		}
		catch (error) {
			captureError(error)
			return resolve(undefined)
		}
	})
}