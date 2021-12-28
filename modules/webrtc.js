export const getWebRTCData = imports => {

	const {
		require: {
			captureError,
			logTestResult
		}
	} = imports

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
	const constructDecriptions = ({mediaType, sdp, sdpDescriptors, rtxCounter}) => {
		if (!(''+sdpDescriptors)) {
			return
		}
		return sdpDescriptors.reduce((acc, descriptor) => {
			const matcher = `(rtpmap|fmtp):${descriptor} (.+)`
			const formats = (sdp.match(new RegExp(matcher, 'g')) || [])
			if (!(''+formats)) {
				return acc
			}
			const isRtxCodec = ('' + formats).includes(' rtx/')
			if (isRtxCodec) {
				if (rtxCounter.getValue()) {
					return acc
				}
				rtxCounter.increment()
			}
			const description = formats.reduce((acc, x) => {
				const data = x.replace(/[^\s]+ /, '').split('/')
				const codec = data[0]
				const description = {}
				if (mediaType == 'audio') {
					description.channels = (+data[2]) || 1
				}
				description.mimeType = `${mediaType}/${codec}`
				description.clockRate = +data[1]
				if (x.includes('rtpmap')) {
					return {
						...acc,
						...description
					}
				}
				else if (isRtxCodec) {
					return acc // no sdpFmtpLine
				}
				return { ...acc, sdpFmtpLine: x.replace(/[^\s]+ /, '') }
			}, {})
			return [...acc, description]
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

	return new Promise(async resolve => {
		try {
			await new Promise(setTimeout).catch(e => { })
			const start = performance.now()

			if (!window.RTCPeerConnection) {
				logTestResult({ test: 'webrtc', passed: false })
				return resolve()
			}

			const connection = new RTCPeerConnection({
				iceCandidatePoolSize: 1,
				iceServers: [
					{
						urls: [
							'stun:stun4.l.google.com:19302?transport=udp',
							'stun:stun3.l.google.com:19302?transport=udp',
							'stun:stun2.l.google.com:19302?transport=udp',
							//'stun:stun1.l.google.com:19302?transport=udp',
							//'stun:stun.l.google.com:19302?transport=udp',
						]
					}
				]
			})

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

			connection.createDataChannel('')
			const options = { offerToReceiveAudio: 1, offerToReceiveVideo: 1 }
			return connection.createOffer(options).then(offer => {
				connection.setLocalDescription(offer)
				let success = false
				setTimeout(() => {
					if (!success) {
						const { sdp } = offer || {}
						if (sdp) {
							const { audio, video } = getCapabilities(sdp)
							const extensions = getExtensions(sdp)
							logTestResult({ test: 'webrtc', passed: true })
							return resolve({
								ipaddress: undefined,
								extensions,
								audio,
								video
							})
						}
						logTestResult({ test: 'webrtc', passed: false })
						return resolve()
					}
				}, 1000)
				return connection.addEventListener('icecandidate', event => {
					const { candidate } = event.candidate || {}
					if (!candidate) {
						return
					}
					const { sdp } = connection.localDescription
					const ipaddress = getIPAddress(sdp)
					if (!ipaddress) {
						return
					}
					success = true
					connection.close()
					const { audio, video } = getCapabilities(sdp)
					const extensions = getExtensions(sdp)
					logTestResult({ start, test: 'webrtc', passed: true })
					return resolve({
						ipaddress,
						extensions,
						audio,
						video
					})
				})
			})
		}
		catch (error) {
			logTestResult({ test: 'webrtc', passed: false })
			captureError(error, 'RTCPeerConnection failed or blocked by client')
			return resolve()
		}
	})
}


export const webrtcHTML = ({ fp, hashSlice, hashMini, note, modal }) => {
	if (!fp.webRTC) {
		return `
		<div class="col-four undefined">
			<strong>WebRTC</strong>
			<div class="block-text">${note.blocked}</div>
			<div>audio: ${note.blocked}</div>
			<div>video: ${note.blocked}</div>
			<div>exts: ${note.blocked}</div>
		</div>`
	}
	const { webRTC } = fp
	const {
		ipaddress,
		audio,
		video,
		extensions,
		$hash
	} = webRTC
	const id = 'creep-webrtc'

	const getModalTemplate = list => list.map(x => {
		return `
			<strong>${x.mimeType}</strong>
			<br>- clockRate: ${x.clockRate}
			${x.channels > 1 ? `<br>- channels: ${x.channels}` : ''}
			${x.sdpFmtpLine ? `<br>${x.sdpFmtpLine.split(';').map(x => `- ${x.replace('=', ': ')}`).join('<br>')}` : ''}
		`
	}).join('<br>')
	return `
	<div class="col-four">
		<strong>WebRTC</strong><span class="hash">${hashSlice($hash)}</span>
		<div class="block-text help" title="RTCSessionDescription.sdp">
			${ipaddress || note.blocked}
		</div>
		<div class="help" title="RTCSessionDescription.sdp">audio: ${
		!audio ? note.blocked :
			modal(
				`${id}-audio`,
				getModalTemplate(audio),
				hashMini(audio)
			)
		}</div>
		<div class="help" title="RTCSessionDescription.sdp">video: ${
		!audio ? note.blocked :
			modal(
				`${id}-video`,
				getModalTemplate(video),
				hashMini(video)
			)
		}</div>
		<div class="help" title="RTCSessionDescription.sdp">exts: ${
		!audio ? note.blocked :
			modal(
				`${id}-extensions`,
				extensions.join('<br>'),
				hashMini(extensions)
			)
		}</div>
	</div>
	`
}