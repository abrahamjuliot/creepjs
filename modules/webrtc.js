export const getWebRTCData = (imports, cloudflare) => {

	const {
		require: {
			isFirefox,
			hashify,
			captureError,
			attempt,
			contentWindow
		}
	} = imports
	
	return new Promise(resolve => {
		try {
			let rtcPeerConnection
			if (contentWindow && !isFirefox) { // FF throws an error in iframes
				rtcPeerConnection = (
					contentWindow.RTCPeerConnection ||
					contentWindow.webkitRTCPeerConnection ||
					contentWindow.mozRTCPeerConnection ||
					contentWindow.msRTCPeerConnection
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
				return resolve(undefined)
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
				success = true
				const { candidate } = e.candidate
				const encodingMatch = candidate.match(candidateEncoding)
				if (encodingMatch) {
					const {
						sdp
					} = e.target.localDescription
					const ipAddress = attempt(() => e.candidate.address)
					const candidateIpAddress = attempt(() => encodingMatch[0].split(' ')[2])
					const connectionLineIpAddress = attempt(() => sdp.match(connectionLineEncoding)[0].trim().split(' ')[2])
					const successIpAddresses = [
						ipAddress, 
						candidateIpAddress, 
						connectionLineIpAddress
					].filter(ip => ip != undefined)
					const setSize = new Set(successIpAddresses).size
					const cloudflareIp = cloudflare && 'ip' in cloudflare ? cloudflare.ip : undefined
					const data = {
						['webRTC leak']: cloudflareIp && (
							!!ipAddress && ipAddress != cloudflareIp
						) ? 'maybe' : 'unknown',
						['ip address']: ipAddress,
						candidate: candidateIpAddress,
						connection: connectionLineIpAddress
					}
					const $hash = await hashify(data)
					return resolve({ ...data, $hash })
				}
			}
			setTimeout(() => !success && resolve(undefined), 1000)
			connection.createDataChannel('creep')
			connection.createOffer()
				.then(e => connection.setLocalDescription(e))
				.catch(error => console.log(error))
		}
		catch (error) {
			captureError(error, 'RTCPeerConnection failed or blocked by client')
			return resolve(undefined)
		}
	})
}