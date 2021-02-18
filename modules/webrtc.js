export const getWebRTCData = imports => {

	const {
		require: {
			captureError,
			caniuse,
			logTestResult,
			hashMini
		}
	} = imports
	
	return new Promise(async resolve => {
		try {
			await new Promise(setTimeout)
			const start = performance.now()
			let rtcPeerConnection = (
				window.RTCPeerConnection ||
				window.webkitRTCPeerConnection ||
				window.mozRTCPeerConnection ||
				window.msRTCPeerConnection
			)

			const getCapabilities = () => {
				let capabilities
				try {
					capabilities = {
						sender: !caniuse(() => RTCRtpSender.getCapabilities) ? undefined : {
							audio: RTCRtpSender.getCapabilities('audio'),
							video: RTCRtpSender.getCapabilities('video')
						},
						receiver: !caniuse(() => RTCRtpReceiver.getCapabilities) ? undefined : {
							audio: RTCRtpReceiver.getCapabilities('audio'),
							video: RTCRtpReceiver.getCapabilities('video')
						}
					}
				}
				catch (error) {}
				return capabilities
			}

			// check support
			if (!rtcPeerConnection) {
				logTestResult({ test: 'webrtc', passed: false })
				return resolve()
			}
			
			// get connection
			const connection = new rtcPeerConnection(
				{ iceServers: [{ urls: ['stun:stun.l.google.com:19302?transport=udp'] }] }
			)
			
			// create channel
			let success
			connection.createDataChannel('creep')

			// set local description
			await connection.createOffer()
			.then(offer => connection.setLocalDescription(offer))
			.catch(error => console.error(error))

			// get sdp capabilities
			let sdpcapabilities
			const capabilities = getCapabilities()
			await connection.createOffer({
				offerToReceiveAudio: 1,
				offerToReceiveVideo: 1
			})
			.then(offer => (
				sdpcapabilities = offer.sdp.match(/((ext|rtp)map|fmtp|rtcp-fb):.+ (.+)/gm).sort()
			))
			.catch(error => console.error(error))
	
			connection.onicecandidate = e => {
				const candidateEncoding = /((udp|tcp)\s)((\d|\w)+\s)((\d|\w|(\.|\:))+)(?=\s)/ig
				const connectionLineEncoding = /(c=IN\s)(.+)\s/ig

				// handle null candidate and resolve early
				if (!e.candidate) {
					if (sdpcapabilities) {
						// resolve partial success
						success = true 
						logTestResult({ start, test: 'webrtc', passed: true })
						return resolve({
							capabilities,
							sdpcapabilities
						})
					}
					// resolve error
					logTestResult({ test: 'webrtc', passed: false })
					captureError(new Error('RTCIceCandidate connection failed'))
					return resolve()
				}

				const { candidate } = e.candidate
				const encodingMatch = candidate.match(candidateEncoding)
				if (encodingMatch) {
					success = true
					const {
						sdp
					} = e.target.localDescription
					const ipaddress = caniuse(() => e.candidate.address)
					const candidateIpAddress = caniuse(() => encodingMatch[0].split(' ')[2])
					const connectionLineIpAddress = caniuse(() => sdp.match(connectionLineEncoding)[0].trim().split(' ')[2])

					const type = caniuse(() => /typ ([a-z]+)/.exec(candidate)[1])
					const foundation = caniuse(() => /candidate:(\d+)\s/.exec(candidate)[1])
					const protocol = caniuse(() => /candidate:\d+ \w+ (\w+)/.exec(candidate)[1])
					
					const data = {
						ipaddress,
						candidate: candidateIpAddress,
						connection: connectionLineIpAddress,
						type,
						foundation,
						protocol,
						capabilities,
						sdpcapabilities
					}
					logTestResult({ start, test: 'webrtc', passed: true })
					return resolve({ ...data })
				}
				return
			}

			// resolve when Timeout is reached
			setTimeout(() => {
				if (!success) {
					logTestResult({ test: 'webrtc', passed: false })
					captureError(new Error('RTCIceCandidate connection failed'))
					return resolve()
				}
			}, 1000)
		}
		catch (error) {
			logTestResult({ test: 'webrtc', passed: false })
			captureError(error, 'RTCPeerConnection failed or blocked by client')
			return resolve()
		}
	})
}