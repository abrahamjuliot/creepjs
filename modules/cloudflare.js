export const getCloudflare = imports => {

	const {
		require: {
			getOS,
			hashMini,
			hashify,
			patch,
			html,
			note,
			captureError,
			attempt
		}
	} = imports

	return new Promise(async resolve => {
		try {
			const api = 'https://www.cloudflare.com/cdn-cgi/trace'
			const res = await fetch(api)
			const text = await res.text()
			const lines = text.match(/^(?:ip|uag|loc|tls)=(.*)$/igm)
			const data = {}
			lines.forEach(line => {
				const key = line.split('=')[0]
				const value = line.substr(line.indexOf('=') + 1)
				data[key] = value
			})
			data.uag = getOS(data.uag)
			const $hash = await hashify(data)
			resolve({ ...data, $hash })
			const el = document.getElementById('creep-cloudflare')
			return patch(el, html`
			<div class="col-six">
				<strong>Cloudflare</strong><span class="hash">${hashMini($hash)}</span>
				${
					Object.keys(data).map(key => {
						const value = data[key]
						key = (
							key == 'ip' ? 'ip address' :
							key == 'uag' ? 'system' :
							key == 'loc' ? 'ip location' :
							key == 'tls' ? 'tls version' :
							key
						)
						return `<div>${key}: ${value ? value : note.blocked}</div>`
					}).join('')
				}
			</div>
			`)
		}
		catch (error) {
			captureError(error, 'cloudflare.com: failed or client blocked')
			return resolve(undefined)
		}
	})
}