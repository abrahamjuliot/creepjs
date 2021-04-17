const getWebRTCData = imports => {

	const {
		require: {
			isFirefox,
			captureError,
			caniuse,
			phantomDarkness,
			logTestResult
		}
	} = imports

	return new Promise(async resolve => {
		try {
			const start = performance.now()


			const api = 'https://www.cloudflare.com/cdn-cgi/trace'
			const res = await fetch(api)
			const text = await res.text()
			const lines = text.match(/^(?:ip|uag|loc|tls)=(.*)$/igm)
			const data = {}
			const cloudflare = lines.reduce((acc, line) => {
				const key = line.split('=')[0]
				const value = line.substr(line.indexOf('=') + 1)
				acc[key] = value
				return acc
			}, {})

			console.log(performance.now() - start, cloudflare)

			let rtcPeerConnection
			try {
				rtcPeerConnection = (
					phantomDarkness.RTCPeerConnection ||
					phantomDarkness.webkitRTCPeerConnection ||
					phantomDarkness.mozRTCPeerConnection ||
					phantomDarkness.msRTCPeerConnection
				)
			}
			catch (error) {
				rtcPeerConnection = (
					RTCPeerConnection ||
					webkitRTCPeerConnection ||
					mozRTCPeerConnection ||
					msRTCPeerConnection
				)
			}

			if (!rtcPeerConnection) {
				logTestResult({ test: 'webrtc', passed: false })
				return resolve()
			}
			const connection = new rtcPeerConnection({
				iceServers: [{
					urls: ['stun:stun.l.google.com:19302?transport=udp']
				}]
			}, {
					optional: [{
						RtpDataChannels: true
					}]
				})

			let success = false
			connection.onicecandidate = async e => {
				const candidateEncoding = /((udp|tcp)\s)((\d|\w)+\s)((\d|\w|(\.|\:))+)(?=\s)/ig
				const connectionLineEncoding = /(c=IN\s)(.+)\s/ig
				if (!e.candidate) {
					return
				}
				const { candidate } = e.candidate
				const encodingMatch = candidate.match(candidateEncoding)
				if (encodingMatch) {
					success = true
					const {
						sdp
					} = e.target.localDescription
					const ipAddress = caniuse(() => e.candidate.address)
					const candidateIpAddress = caniuse(() => encodingMatch[0].split(' ')[2])
					const connectionLineIpAddress = caniuse(() => sdp.match(connectionLineEncoding)[0].trim().split(' ')[2])
					const successIpAddresses = [
						ipAddress,
						candidateIpAddress,
						connectionLineIpAddress
					].filter(ip => ip != undefined)
					const setSize = new Set(successIpAddresses).size
					const data = {
						['ip address']: ipAddress,
						candidate: candidateIpAddress,
						connection: connectionLineIpAddress
					}
					logTestResult({ start, test: 'webrtc', passed: true })
					return resolve({ ...data })
				} else {
					return
				}
			}

			setTimeout(() => {
				if (!success) {

					logTestResult({ test: 'webrtc', passed: false })
					captureError(new Error('RTCIceCandidate failed'))
					return resolve()
				}
			}, 1000)
			connection.createDataChannel('creep')
			connection.createOffer()
				.then(e => connection.setLocalDescription(e))
				.catch(error => console.log(error))
		}
		catch (error) {
			logTestResult({ test: 'webrtc', passed: false })
			captureError(error, 'RTCPeerConnection failed or blocked by client')
			return resolve()
		}
	})
}