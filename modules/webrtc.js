export const getWebRTCData = imports => {

	const {
		require: {
			isFirefox,
			captureError,
			caniuse,
			phantomDarkness,
			logTestResult
		}
	} = imports
	
	return new Promise(resolve => {
		try {
			const start = performance.now()
			let rtcPeerConnection
			if (phantomDarkness && !isFirefox) { // FF throws an error in iframes
				rtcPeerConnection = (
					phantomDarkness.RTCPeerConnection ||
					phantomDarkness.webkitRTCPeerConnection ||
					phantomDarkness.mozRTCPeerConnection ||
					phantomDarkness.msRTCPeerConnection
				)
			}
			else {
				rtcPeerConnection = (
					window.RTCPeerConnection ||
					window.webkitRTCPeerConnection ||
					window.mozRTCPeerConnection ||
					window.msRTCPeerConnection
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