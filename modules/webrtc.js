export const getWebRTCData = imports => {

	const {
		require: {
			captureError,
			logTestResult
		}
	} = imports
	
	return new Promise(async resolve => {
		try {
			await new Promise(setTimeout).catch(e => {})
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
				const connectionLineIpAddress = ((sdp.match(connectionLineEncoding)||[])[0]||'').trim().split(' ')[2]
				if (connectionLineIpAddress && (connectionLineIpAddress != blocked)) {
					return connectionLineIpAddress
				}	
				const candidateIpAddress = ((sdp.match(candidateEncoding)||[])[0]||'').split(' ')[2]
				return candidateIpAddress && (candidateIpAddress != blocked) ? candidateIpAddress : undefined
			}

			connection.createDataChannel('')
			return connection.createOffer({offerToReceiveAudio: 1, offerToReceiveVideo: 1}).then(offer => {
				connection.setLocalDescription(offer)
				let success = false
				setTimeout(() => {
					if (!success) {
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
					if (ipaddress) {
						success = true
						connection.close() 
						logTestResult({ start, test: 'webrtc', passed: true })
						return resolve({
							ipaddress,
							capabilities: {
								sender: !('getCapabilities' in RTCRtpSender) ? undefined : {
									audio: RTCRtpSender.getCapabilities('audio'),
									video: RTCRtpSender.getCapabilities('video')
								},
								receiver: !('getCapabilities' in RTCRtpReceiver) ? undefined : {
									audio: RTCRtpReceiver.getCapabilities('audio'),
									video: RTCRtpReceiver.getCapabilities('video')
								}
							},
							sdpcapabilities: (offer.sdp.match(/((ext|rtp)map|fmtp|rtcp-fb):.+ (.+)/gm)||[]).sort()
						})
					}
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
			<div>codecs: ${note.blocked}</div>
			<div>codecs sdp: ${note.blocked}</div>
		</div>`
	}
	const { webRTC } = fp
	const {
		ipaddress,
		capabilities,
		sdpcapabilities,
		$hash
	} = webRTC
	const id = 'creep-webrtc'

	return `
	<div class="col-four">
		<strong>WebRTC</strong><span class="hash">${hashSlice($hash)}</span>
		<div class="block-text help" title="RTCSessionDescription.sdp">
			${ipaddress || note.blocked}
		</div>
		<div class="help" title="RTCRtpSender.getCapabilities()\nRTCRtpReceiver.getCapabilities()">codecs: ${
			!capabilities || (!capabilities.receiver && !capabilities.sender) ? note.unsupported :
			modal(
				`${id}-capabilities`,
				Object.keys(capabilities).map(modeKey => {
					const mode = capabilities[modeKey]
					if (!mode) {
						return ''
					}
					return `
						<br><div>mimeType [channels] (clockRate) * sdpFmtpLine</div>
						${
							Object.keys(mode).map(media => Object.keys(mode[media])
								.map(key => {
									return `<br><div><strong>${modeKey} ${media} ${key}</strong>:</div>${
										mode[media][key].map(obj => {
											const {
												channels,
												clockRate,
												mimeType,
												sdpFmtpLine,
												uri
											} = obj
											return `
												<div>
												${mimeType||''}
												${channels ? `[${channels}]`: ''}
												${clockRate ? `(${clockRate})`: ''}
												${sdpFmtpLine ? `<br>* ${sdpFmtpLine}` : ''}
												${uri||''}
												</div>
											`
										}).join('')
									}`
								}).join('')
							).join('')
						}
					`
				}).join(''),
				hashMini(capabilities)
			)
		}</div>
		<div class="help" title="RTCSessionDescription.sdp">codecs sdp: ${
			!sdpcapabilities ? note.unsupported :
			modal(
				`${id}-sdpcapabilities`,
				sdpcapabilities.join('<br>'),
				hashMini(sdpcapabilities)
			)
		}</div>
	</div>
	`	
}