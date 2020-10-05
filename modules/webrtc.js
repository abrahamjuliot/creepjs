export const getWebRTCData = (imports, cloudflare) => {

	const {
		require: {
			isFirefox,
			hashify,
			patch,
			html,
			note,
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
					const matching = setSize == 1 || setSize == 0
					const cloudflareIp = cloudflare && 'ip' in cloudflare ? cloudflare.ip : undefined
					const data = {
						['webRTC leak']: cloudflareIp && (
							!!ipAddress && ipAddress != cloudflareIp
						) ? true : 'unknown',
						['ip address']: ipAddress,
						['candidate encoding']: candidateIpAddress,
						['connection line']: connectionLineIpAddress,
						['matching']: matching
					}
					const $hash = await hashify(data)
					resolve({ ...data, $hash })
					const el = document.getElementById('creep-webrtc')
					patch(el, html`
					<div>
						<strong>RTCPeerConnection</strong>
						<div class="ellipsis">hash: ${$hash}</div>
						${
							Object.keys(data).map(key => {
								const value = data[key]
								return (
									`<div class="ellipsis">${key}: ${value != undefined ? value : note.blocked}</div>`
								)
							}).join('')
						}
					</div>
					`)
					return
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