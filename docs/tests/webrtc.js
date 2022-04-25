(async () => {

	const hashMini =  x => {
		if (!x) return x
		const json = `${JSON.stringify(x)}`
		const hash = json.split('').reduce((hash, char, i) => {
			return Math.imul(31, hash) + json.charCodeAt(i) | 0
		}, 0x811c9dc5)
		return ('0000000' + (hash >>> 0).toString(16)).substr(-8)
	}

	const hashify = async (x) => {
		const json = `${JSON.stringify(x)}`
		const jsonBuffer = new TextEncoder().encode(json)
		const hashBuffer = await crypto.subtle.digest('SHA-256', jsonBuffer)
		const hashArray = Array.from(new Uint8Array(hashBuffer))
		const hashHex = hashArray.map(b => ('00' + b.toString(16)).slice(-2)).join('')
		return hashHex
	}

	// template views
	const patch = (oldEl, newEl) => oldEl.parentNode.replaceChild(newEl, oldEl)
	const html = (str, ...expressionSet) => {
		const template = document.createElement('template')
		template.innerHTML = str.map((s, i) => `${s}${expressionSet[i] || ''}`).join('')
		return document.importNode(template.content, true)
	}

	const pass = () => `<span class="pass">&#10004;</span>`
	const fail = () => `<span class="fail">&#10006;</span>`
	
	const getMediaConfig = (codec, video, audio) => ({
		type: 'file',
		video: !/^video/.test(codec) ? undefined : {
			contentType: codec,
			...video
		},
		audio: !/^audio/.test(codec) ? undefined : {
			contentType: codec,
			...audio
		}
	})
	
	const getMediaCapabilities = async ({ video, audio, codecs }) => {
		const decodingInfo = codecs.map(codec => {
			const config = getMediaConfig(codec, video, audio)
			return navigator.mediaCapabilities.decodingInfo(config).then(support => ({
				codec,
				...support
			}))
			.catch(error => console.error(codec, error))
		})
		const capabilities = await Promise.all(decodingInfo).then(data => {
			return data.reduce((acc, support) => {
				const { codec, supported, smooth, powerEfficient } = support || {}
				if (!supported) { return acc }
				return {
					...acc,
					[codec]: [
						...(smooth ? ['smooth'] : []),
						...(powerEfficient ? ['efficient'] : [])
					]
				}
			}, {})
		}).catch(error => console.error(error))
		
		return capabilities
	}

	const getExtensions = sdp => {
		const extensions = (('' + sdp).match(/extmap:\d+ [^\n|\r]+/g) || [])
			.map(x => x.replace(/extmap:[^\s]+ /, ''))
		return [...new Set(extensions)].sort()
	}

	const createCounter = () => {
		let counter = 0
		return {
			increment: () => counter += 1,
			getValue: () => counter
		}
	}

	// https://webrtchacks.com/sdp-anatomy/
	// https://tools.ietf.org/id/draft-ietf-rtcweb-sdp-08.html
	const constructDecriptions = ({mediaType, sdp, sdpDescriptors, rtxCounter}) => {
		if (!(''+sdpDescriptors)) {
			return
		}
		return sdpDescriptors.reduce((descriptionAcc, descriptor) => {
			const matcher = `(rtpmap|fmtp|rtcp-fb):${descriptor} (.+)`
			const formats = (sdp.match(new RegExp(matcher, 'g')) || [])
			if (!(''+formats)) {
				return descriptionAcc
			}
			const isRtxCodec = ('' + formats).includes(' rtx/')
			if (isRtxCodec) {
				if (rtxCounter.getValue()) {
					return descriptionAcc
				}
				rtxCounter.increment()
			}
			const getLineData = x => x.replace(/[^\s]+ /, '')
			const description = formats.reduce((acc, x) => {
				const rawData = getLineData(x)
				const data = rawData.split('/')
				const codec = data[0]
				const description = {}

				if (x.includes('rtpmap')) {
					if (mediaType == 'audio') {
						description.channels = (+data[2]) || 1
					}
					description.mimeType = `${mediaType}/${codec}`
					description.clockRates = [+data[1]]
					return {
						...acc,
						...description
					}
				}
				else if (x.includes('rtcp-fb')) {
					return {
						...acc,
						feedbackSupport: [...(acc.feedbackSupport||[]), rawData]
					}
				}
				else if (isRtxCodec) {
					return acc // no sdpFmtpLine
				}
				return { ...acc, sdpFmtpLine: [...rawData.split(';')] }
			}, {})

			let shouldMerge = false
			const mergerAcc = descriptionAcc.map(x => {
				shouldMerge = x.mimeType == description.mimeType
				if (shouldMerge) {
					if (x.feedbackSupport) {
						x.feedbackSupport = [
							...new Set([...x.feedbackSupport, ...description.feedbackSupport])
						]
					}
					if (x.sdpFmtpLine) {
						x.sdpFmtpLine = [
							...new Set([...x.sdpFmtpLine, ...description.sdpFmtpLine])
						]
					}
					return {
						...x,
						clockRates: [
							...new Set([...x.clockRates, ...description.clockRates])
						]
					}
				}
				return x
			})
			if (shouldMerge) {
				return mergerAcc
			}
			return [...descriptionAcc, description]
		}, [])
	}

	const getCapabilities = sdp => {
		const videoDescriptors = ((/m=video [^\s]+ [^\s]+ ([^\n|\r]+)/.exec(sdp) || [])[1] || '').split(' ')
		const audioDescriptors = ((/m=audio [^\s]+ [^\s]+ ([^\n|\r]+)/.exec(sdp) || [])[1] || '').split(' ')
		const rtxCounter = createCounter()
		return {
			audio: constructDecriptions({
				mediaType: 'audio',
				sdp,
				sdpDescriptors: audioDescriptors,
				rtxCounter
			}),
			video: constructDecriptions({
				mediaType: 'video',
				sdp,
				sdpDescriptors: videoDescriptors,
				rtxCounter
			})
		}
	}

	const getIPAddress = sdp => {
		const blocked = '0.0.0.0'
		const candidateEncoding = /((udp|tcp)\s)((\d|\w)+\s)((\d|\w|(\.|\:))+)(?=\s)/ig
		const connectionLineEncoding = /(c=IN\s)(.+)\s/ig
		const connectionLineIpAddress = ((sdp.match(connectionLineEncoding) || [])[0] || '').trim().split(' ')[2]
		if (connectionLineIpAddress && (connectionLineIpAddress != blocked)) {
			return connectionLineIpAddress
		}
		const candidateIpAddress = ((sdp.match(candidateEncoding) || [])[0] || '').split(' ')[2]
		return candidateIpAddress && (candidateIpAddress != blocked) ? candidateIpAddress : undefined
	}
	
	const getWebRTCData = () => new Promise(async resolve => {
		if (!window.RTCPeerConnection) {
			return resolve()
		}

		const config = {
			iceCandidatePoolSize: 1,
			iceServers: [
				{
					urls: [
						'stun:stun4.l.google.com:19302?transport=udp',
						'stun:stun3.l.google.com:19302?transport=udp',
						//'stun:stun2.l.google.com:19302?transport=udp',
						//'stun:stun1.l.google.com:19302?transport=udp',
						//'stun:stun.l.google.com:19302?transport=udp',
					]
				}
			]
		}
		const connection = new RTCPeerConnection(config)
		
		const options = { offerToReceiveAudio: 1, offerToReceiveVideo: 1 }
		const offer = await connection.createOffer(options)
		
		connection.setLocalDescription(offer)
		
		const giveUpOnIPAddress = setTimeout(() => {
			const { sdp } = offer || {}
			if (sdp) {
				const { audio, video } = getCapabilities(sdp)
				const extensions = getExtensions(sdp)
				return resolve({
					ipaddress: undefined,
					extensions,
					audio,
					video,
					sdp
				})
			}
			return resolve()
		}, 3000)

		connection.addEventListener('icecandidate', (event) => {
			const { candidate } = event.candidate || {}
			if (!candidate) {
				return
			}
			const { sdp } = connection.localDescription
			const ipaddress = getIPAddress(sdp)
			if (!ipaddress) {
				return
			}
			connection.removeEventListener('icecandidate', computeCandidate)
			clearTimeout(giveUpOnIPAddress)
			connection.close()
			const { audio, video } = getCapabilities(sdp)
			const extensions = getExtensions(sdp)
			
			return resolve({
				ipaddress,
				extensions,
				audio,
				video,
				sdp
			})
		})

	})

	// https://raw.githubusercontent.com/abrahamjuliot/creepjs/e3f6d9b34e2a9cc322dfb4313f9d0611101afb18/modules/webrtc.js

	const start = performance.now()
	const mc = await getMediaCapabilities({
		video: {
			width: 1920,
			height: 1080,
			bitrate: 120000,
			framerate: 60
		},
		audio: {
			channels: 2,
			bitrate: 300000,
			samplerate: 5200
		},
		codecs: [
			'audio/ogg; codecs=vorbis',
			'audio/ogg; codecs=flac',
			'audio/mp4; codecs="mp4a.40.2"',
			'audio/mpeg; codecs="mp3"',
			'video/ogg; codecs="theora"',
			'video/mp4; codecs="avc1.42E01E"'
		]
	})
	console.log(mc)
	
	const perf = performance.now() - start
	patch(document.getElementById('fingerprint-data'), html`
	<div id="fingerprint-data">
		<style>
		#fingerprint-data > .visitor-info > .jumbo {
			font-size: 32px !important;
		}
		.pass, .fail {
			margin: 0 4px 0 0;
			padding: 1px 5px;
			border-radius: 3px;
		}
		.pass {
			color: #2da568;
			background: #2da5681a;
		}
		.fail {
			background: #ca656e0d;
		}
		.fail, .bold-fail, .erratic {
			color: #ca656e;
		}
		.bold-fail {
			background: #ca656e0d;
			font-weight: bold;
			border-bottom: 1px solid;
		}
		.group {
			font-size: 12px !important;
			border-radius: 3px;
			padding: 10px 15px;
			min-height: 60px;
		}
		.identifier {
			background: #657fca26;
			color: #8f8ff1 !important;
		}
		.isolate {
			background: #657fca1a
		}
		@media (prefers-color-scheme: dark) {
			
		}
		
		</style>
		<div class="visitor-info">
			<span class="aside-note">${perf.toFixed(2)}ms</span>
			<strong>WebRTC</strong>
		</div>
	</div>
`)
})()
