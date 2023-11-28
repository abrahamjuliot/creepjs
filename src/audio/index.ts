import { attempt, caniuse, captureError } from '../errors'
import { lieProps, documentLie } from '../lies'
import { sendToTrash } from '../trash'
import { hashMini } from '../utils/crypto'
import { createTimer, queueEvent, logTestResult, performanceLogger, hashSlice, LowerEntropy } from '../utils/helpers'
import { HTMLNote, getDiffs, modal } from '../utils/html'

export const KnownAudio: Record<string, number[]> = {
	// Blink/WebKit
	[-20.538286209106445]: [
		124.0434488439787,
		124.04344968475198,
		124.04347527516074,
		124.04347503720783,
		124.04347657808103,
	],
	[-20.538288116455078]: [
		124.04347518575378,
		124.04347527516074,
		124.04344884395687,
		124.04344968475198,
		124.04347657808103,
		124.04347730590962, // pattern (rare)
		124.0434765110258, // pattern (rare)
		124.04347656317987, // pattern (rare)
		124.04375314689969, // pattern (rare)
		// WebKit
		124.0434485301812,
		124.0434496849557,
		124.043453265891,
		124.04345734833623,
		124.04345808873768,
	],
	[-20.535268783569336]: [
		// Android/Linux
		124.080722568091,
		124.08072256811283,
		124.08072766105033,
		124.08072787802666,
		124.08072787804849,
		124.08074500028306,
		124.0807470110085,
		124.08075528279005,
		124.08075643483608,
	],

	// Gecko
	[-31.502185821533203]: [35.74996031448245, 35.7499681673944, 35.749968223273754],
	[-31.50218963623047]: [35.74996031448245],
	[-31.509262084960938]: [35.7383295930922, 35.73833402246237],

	// WebKit
	[-29.837873458862305]: [35.10892717540264, 35.10892752557993],
	[-29.83786964416504]: [35.10893232002854, 35.10893253237009],
}

const AUDIO_TRAP = Math.random()

async function hasFakeAudio() {
	const context = new OfflineAudioContext(1, 100, 44100)
	const oscillator = context.createOscillator()
	oscillator.frequency.value = 0
	oscillator.start(0)
	context.startRendering()

	return new Promise((resolve) => {
		context.oncomplete = (event) => {
			const channelData = event.renderedBuffer.getChannelData?.(0)
			if (!channelData) resolve(false)
			resolve(''+[...new Set(channelData)] !== '0')
		}
	}).finally(() => oscillator.disconnect())
}

export default async function getOfflineAudioContext() {
	try {
		const timer = createTimer()
		await queueEvent(timer)
		try {
			// @ts-expect-error if unsupported
			window.OfflineAudioContext = OfflineAudioContext || webkitOfflineAudioContext
		} catch (err) { }

		if (!window.OfflineAudioContext) {
			logTestResult({test: 'audio', passed: false})
			return
		}

		// detect lies
		const channelDataLie = lieProps['AudioBuffer.getChannelData']
		const copyFromChannelLie = lieProps['AudioBuffer.copyFromChannel']
		let lied = (channelDataLie || copyFromChannelLie) || false

		const bufferLen = 5000
		const context = new OfflineAudioContext(1, bufferLen, 44100)
		const analyser = context.createAnalyser()
		const oscillator = context.createOscillator()
		const dynamicsCompressor = context.createDynamicsCompressor()
		const biquadFilter = context.createBiquadFilter()

		// detect lie
		const dataArray = new Float32Array(analyser.frequencyBinCount)
		analyser.getFloatFrequencyData?.(dataArray)
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
			['OscillatorNode.frequency.minValue']: attempt(() => oscillator.frequency.minValue),
		}

		interface AudioData {
			floatFrequencyData: Float32Array
			floatTimeDomainData: Float32Array
			buffer: AudioBuffer
			compressorGainReduction: number
		}
		const getRenderedBuffer = (context: OfflineAudioContext): Promise<AudioData | null> => (new Promise((resolve) => {
			const analyser = context.createAnalyser()
			const oscillator = context.createOscillator()
			const dynamicsCompressor = context.createDynamicsCompressor()

			try {
				oscillator.type = 'triangle'
				oscillator.frequency.value = 10000
				dynamicsCompressor.threshold.value = -50
				dynamicsCompressor.knee.value = 40
				dynamicsCompressor.attack.value = 0
			} catch (err) {}

			oscillator.connect(dynamicsCompressor)
			dynamicsCompressor.connect(analyser)
			dynamicsCompressor.connect(context.destination)

			oscillator.start(0)
			context.startRendering()

			return context.addEventListener('complete', (event) => {
				try {
					dynamicsCompressor.disconnect()
					oscillator.disconnect()
					const floatFrequencyData = new Float32Array(analyser.frequencyBinCount)
					analyser.getFloatFrequencyData?.(floatFrequencyData)
					const floatTimeDomainData = new Float32Array(analyser.fftSize)
					if ('getFloatTimeDomainData' in analyser) {
						analyser.getFloatTimeDomainData(floatTimeDomainData)
					}

					return resolve({
						floatFrequencyData,
						floatTimeDomainData,
						buffer: event.renderedBuffer,
						compressorGainReduction: (
							// @ts-expect-error if unsupported
							dynamicsCompressor.reduction.value || // webkit
							dynamicsCompressor.reduction
						),
					})
				} catch (error) {
					return resolve(null)
				}
			})
		}))
		await queueEvent(timer)
		const [
			audioData,
			audioIsFake,
		] = await Promise.all([
			getRenderedBuffer(new OfflineAudioContext(1, bufferLen, 44100)),
			hasFakeAudio().catch(() => false),
		])

		const {
			floatFrequencyData,
			floatTimeDomainData,
			buffer,
			compressorGainReduction,
		} = audioData || {}


		await queueEvent(timer)
		const getSnapshot = (arr: number[], start: number, end: number) => {
			const collection = []
			for (let i = start; i < end; i++) {
				collection.push(arr[i])
			}
			return collection
		}
		const getSum = (arr?: Float32Array | number[]) => !arr ? 0 : [...arr]
			.reduce((acc, curr) => (acc += Math.abs(curr)), 0)
		const floatFrequencyDataSum = getSum(floatFrequencyData)
		const floatTimeDomainDataSum = getSum(floatTimeDomainData)

		const copy = new Float32Array(bufferLen)
		let bins = new Float32Array()
		if (buffer) {
			buffer.copyFromChannel?.(copy, 0)
			bins = buffer.getChannelData?.(0) || []
		}
		const copySample = getSnapshot([...copy], 4500, 4600)
		const binsSample = getSnapshot([...bins], 4500, 4600)
		const sampleSum = getSum(getSnapshot([...bins], 4500, bufferLen))

		// detect lies
		if (audioIsFake) {
			lied = true
			documentLie('AudioBuffer', 'audio is fake')
		}

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
		const getRandFromRange = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min
		const getCopyFrom = (rand: number, buffer: AudioBuffer, copy: Float32Array) => {
			const {length} = buffer

			const max = 20;
			const start = getRandFromRange(275, length - (max + 1));
			const mid = start + max / 2;
			const end = start + max;

			buffer.getChannelData(0)[start] = rand
			buffer.getChannelData(0)[mid] = rand
			buffer.getChannelData(0)[end] = rand
			buffer.copyFromChannel(copy, 0)
			const attack = [
				buffer.getChannelData(0)[start] === 0 ? Math.random() : 0,
				buffer.getChannelData(0)[mid] === 0 ? Math.random() : 0,
				buffer.getChannelData(0)[end] === 0 ? Math.random() : 0,
			]
			return [...new Set([...buffer.getChannelData(0), ...copy, ...attack])].filter((x) => x !== 0)
		}

		const getCopyTo = (rand: number, buffer: AudioBuffer, copy: Float32Array) => {
			buffer.copyToChannel(copy.map(() => rand), 0)
			const frequency = buffer.getChannelData(0)[0]
			const dataAttacked = [...buffer.getChannelData(0)]
				.map((x) => x !== frequency || !x ? Math.random() : x)
			return dataAttacked.filter((x) => x !== frequency)
		}

		const getNoiseFactor = () => {
			const length = 2000
			try {
				const result = [...new Set([
					...getCopyFrom(
						AUDIO_TRAP,
						new AudioBuffer({length, sampleRate: 44100}),
						new Float32Array(length),
					),
					...getCopyTo(
						AUDIO_TRAP,
						new AudioBuffer({length, sampleRate: 44100}),
						new Float32Array(length),
					),
				])]
				return +(
					result.length !== 1 &&
					result.reduce((acc, n) => acc += +n, 0)
				)
			} catch (error) {
				console.error(error)
				return 0
			}
		}

		const noiseFactor = getNoiseFactor()
		const noise = (
			noiseFactor || [...new Set(bins.slice(0, 100))]
				.reduce((acc, n) => acc += n, 0)
		)

		// Locked Patterns
		const known: Record<string, number[]> = {
			/* BLINK */
			// 124.04347527516074/124.04347518575378
			'-20.538286209106445,164537.64796829224,502.5999283068122': [124.04347527516074],
			'-20.538288116455078,164537.64796829224,502.5999283068122': [124.04347527516074],
			'-20.538288116455078,164537.64795303345,502.5999283068122': [
				124.04347527516074,
				124.04347518575378,
				// sus:
				124.04347519320436,
				124.04347523045726,
			],
			'-20.538286209106445,164537.64805984497,502.5999283068122': [124.04347527516074],
			'-20.538288116455078,164537.64805984497,502.5999283068122': [
				124.04347527516074,
				124.04347518575378,
				// sus
				124.04347520065494,
				124.04347523790784,
				124.043475252809,
				124.04347526025958,
				124.04347522300668,
				124.04347523045726,
				124.04347524535842,
			],
			// 124.04344884395687
			'-20.538288116455078,164881.9727935791,502.59990317908887': [124.04344884395687],
			'-20.538288116455078,164881.9729309082,502.59990317908887': [124.04344884395687],
			// 124.0434488439787
			'-20.538286209106445,164882.2082748413,502.59990317911434': [124.0434488439787],
			'-20.538288116455078,164882.20836639404,502.59990317911434': [124.0434488439787],
			// 124.04344968475198
			'-20.538286209106445,164863.45319366455,502.5999033495791': [124.04344968475198],
			'-20.538288116455078,164863.45319366455,502.5999033495791': [
				124.04344968475198,
				124.04375314689969, // rare
				// sus
				124.04341541208123,
			],
			// 124.04347503720783 (rare)
			'-20.538288116455078,164531.82670593262,502.59992767886797': [
				124.04347503720783,
				// sus
				124.04347494780086,
				124.04347495525144,
				124.04347499250434,
				124.0434750074055,
			],
			// 124.04347657808103
			'-20.538286209106445,164540.1567993164,502.59992209258417': [124.04347657808103],
			'-20.538288116455078,164540.1567993164,502.59992209258417': [
				124.04347657808103,
				124.0434765110258, // rare
				124.04347656317987, // rare
				// sus
				124.04347657063045,
				124.04378004022874,
			],
			'-20.538288116455078,164540.1580810547,502.59992209258417': [124.04347657808103],
			// 124.080722568091/124.04347730590962 (rare)
			'-20.535268783569336,164940.360786438,502.69695458233764': [124.080722568091],
			'-20.538288116455078,164538.55073928833,502.5999307175407': [124.04347730590962],
			// Android/Linux
			'-20.535268783569336,164948.14596557617,502.6969545823631': [124.08072256811283],
			'-20.535268783569336,164926.65912628174,502.6969610930064': [124.08072766105033],
			'-20.535268783569336,164932.96168518066,502.69696179985476': [124.08072787802666],
			'-20.535268783569336,164931.54252624512,502.6969617998802': [124.08072787804849],
			'-20.535268783569336,164591.9659729004,502.6969925059784': [124.08074500028306],
			'-20.535268783569336,164590.4111480713,502.6969947774742': [124.0807470110085],
			'-20.535268783569336,164590.41115570068,502.6969947774742': [124.0807470110085],
			'-20.535268783569336,164593.64263916016,502.69700490119067': [124.08075528279005],
			'-20.535268783569336,164595.0285797119,502.69700578315314': [124.08075643483608],
			// sus
			'-20.538288116455078,164860.96576690674,502.6075748118915': [124.0434496279413],
			'-20.538288116455078,164860.9938583374,502.6073723861407': [124.04344962817413],
			'-20.538288116455078,164862.14078521729,502.59991004130643': [124.04345734833623],
			'-20.538288116455078,164534.50047683716,502.61542110471055': [124.04347520368174],
			'-20.538288116455078,164535.1324043274,502.6079200572931': [124.04347521997988],
			'-20.538288116455078,164535.51135635376,502.60633126448374': [124.04347522952594],
			/* GECKO */
			'-31.509262084960938,167722.6894454956,148.42717787250876': [35.7383295930922],
			'-31.509262084960938,167728.72756958008,148.427184343338': [35.73833402246237],
			'-31.50218963623047,167721.27517700195,148.47537828609347': [35.74996031448245],
			'-31.502185821533203,167727.52931976318,148.47542023658752': [35.7499681673944],
			'-31.502185821533203,167700.7530517578,148.475412953645': [35.749968223273754],
			/* WEBKIT */
			'-20.538288116455078,164873.80361557007,502.59989904452596': [124.0434485301812],
			'-20.538288116455078,164863.47760391235,502.5999033453372': [124.0434496849557],
			'-20.538288116455078,164876.62466049194,502.5998911961724': [124.043453265891],
			'-20.538288116455078,164862.14879989624,502.59991004130643': [124.04345734833623],
			'-20.538288116455078,164896.54167175293,502.5999054916465': [124.04345808873768],
			'-29.837873458862305,163206.43050384521,0': [35.10892717540264],
			'-29.837873458862305,163224.69785308838,0': [35.10892752557993],
			'-29.83786964416504,163209.17245483398,0': [35.10893232002854],
			'-29.83786964416504,163202.77336883545,0': [35.10893253237009],
		}

		if (noise) {
			lied = true
			documentLie('AudioBuffer', 'sample noise detected')
		}
		const pattern = ''+[
			compressorGainReduction,
			floatFrequencyDataSum,
			floatTimeDomainDataSum,
		]

		const knownPattern = known[pattern]
		if (knownPattern && !knownPattern.includes(sampleSum)) {
			LowerEntropy.AUDIO = true
			sendToTrash('AudioBuffer', 'suspicious frequency data')
		}

		logTestResult({time: timer.stop(), test: 'audio', passed: true})
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
			lied,
		}
	} catch (error) {
		logTestResult({test: 'audio', passed: false})
		captureError(error, 'OfflineAudioContext failed or blocked by client')
		return
	}
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function audioHTML(fp: any) {
	if (!fp.offlineAudioContext) {
		return `<div class="col-four undefined">
			<strong>Audio</strong>
			<div>sum: ${HTMLNote.BLOCKED}</div>
			<div>gain: ${HTMLNote.BLOCKED}</div>
			<div>freq: ${HTMLNote.BLOCKED}</div>
			<div>time: ${HTMLNote.BLOCKED}</div>
			<div>trap: ${HTMLNote.BLOCKED}</div>
			<div>unique: ${HTMLNote.BLOCKED}</div>
			<div>data: ${HTMLNote.BLOCKED}</div>
			<div>copy: ${HTMLNote.BLOCKED}</div>
			<div>values: ${HTMLNote.BLOCKED}</div>
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
			values,
		},
	} = fp
	const knownSums = KnownAudio[compressorGainReduction] || []
	const validAudio = sampleSum && compressorGainReduction && knownSums.length
	const matchesKnownAudio = knownSums.includes(sampleSum)
	return `
	<div class="relative col-four${lied ? ' rejected' : ''}">
		<span class="aside-note">${performanceLogger.getLog().audio}</span>
		<strong>Audio</strong><span class="${lied ? 'lies ' : LowerEntropy.AUDIO ? 'bold-fail ' : ''}hash">${hashSlice($hash)}</span>
		<div class="help" title="AudioBuffer.getChannelData()">sum: ${
			!sampleSum ? HTMLNote.BLOCKED : (!validAudio || matchesKnownAudio) ? sampleSum : getDiffs({
				stringA: knownSums[0],
				stringB: sampleSum,
				charDiff: true,
				decorate: (diff) => `<span class="bold-fail">${diff}</span>`,
			})
		}</div>
		<div class="help" title="DynamicsCompressorNode.reduction">gain: ${
			compressorGainReduction || HTMLNote.BLOCKED
		}</div>
		<div class="help" title="AnalyserNode.getFloatFrequencyData()">freq: ${
			floatFrequencyDataSum || HTMLNote.BLOCKED
		}</div>
		<div class="help" title="AnalyserNode.getFloatTimeDomainData()">time: ${
			floatTimeDomainDataSum || HTMLNote.UNSUPPORTED
		}</div>
		<div class="help" title="AudioBuffer.getChannelData()\nAudioBuffer.copyFromChannel()\nAudioBuffer.copyToChannel">trap: ${
			!noise ? AUDIO_TRAP : getDiffs({
				stringA: AUDIO_TRAP,
				stringB: noise,
				charDiff: true,
				decorate: (diff) => `<span class="bold-fail">${diff}</span>`,
			})
		}</div>
		<div>unique: ${totalUniqueSamples}</div>
		<div class="help" title="AudioBuffer.getChannelData()">data:${
			''+binsSample[0] == 'undefined' ? ` ${HTMLNote.BLOCKED}` :
			`<span class="sub-hash">${hashMini(binsSample)}</span>`
		}</div>
		<div class="help" title="AudioBuffer.copyFromChannel()">copy:${
			''+copySample[0] == 'undefined' ? ` ${HTMLNote.BLOCKED}` :
			`<span class="sub-hash">${hashMini(copySample)}</span>`
		}</div>
		<div>values: ${
			modal(
				'creep-offline-audio-context',
				Object.keys(values).map((key) => `<div>${key}: ${values[key]}</div>`).join(''),
				hashMini(values),
			)
		}</div>
	</div>
	`
}
