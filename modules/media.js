
// inspired by 
// - https://privacycheck.sec.lrz.de/active/fp_cpt/fp_can_play_type.html
// - https://arkenfox.github.io/TZP
const getMimeTypeShortList = () => [
	'audio/mpegurl',
	'video/ogg; codecs="theora"',
	'video/quicktime',
	'video/webm'
]

const getMimeTypes = async () => {
    try {
		const mimeTypes = getMimeTypeShortList()
        const videoEl = document.createElement('video')
        const audioEl = new Audio()
        const isMediaRecorderSupported = 'MediaRecorder' in window
        const types = mimeTypes.reduce((acc, type) => {
            const data = {
                mimeType: type,
                audioPlayType: audioEl.canPlayType(type),
                videoPlayType: videoEl.canPlayType(type),
                mediaSource: MediaSource.isTypeSupported(type),
                mediaRecorder: isMediaRecorderSupported ? MediaRecorder.isTypeSupported(type) : false
            }
			if (!data.audioPlayType && !data.videoPlayType && !data.mediaSource && !data.mediaRecorder) {
				return acc
			}
            acc.push(data)
            return acc
        }, [])
        return types
    } catch (error) {
        return
    }
}

export const getMedia = async imports => {

	const {
		require: {
			captureError,
			phantomDarkness,
			caniuse,
			logTestResult,
			getPromiseRaceFulfilled
		}
	} = imports

	try {
		await new Promise(setTimeout).catch(e => {})
		const start = performance.now()
		const phantomNavigator = phantomDarkness ? phantomDarkness.navigator : navigator
		let devices, types
		if (caniuse(() => navigator.mediaDevices.enumerateDevices)) {
			const [
				enumeratedDevices,
				mimes
			] = await Promise.all([
				phantomNavigator.mediaDevices.enumerateDevices(),
				getMimeTypes()
			])
			.catch(error => console.error(error))

			types = mimes
			devices = (
				enumeratedDevices ?
				enumeratedDevices.map(device => device.kind).sort() :
				undefined
			)
		}
		else {
			types = await getMimeTypes()
		}
		logTestResult({ start, test: 'media', passed: true })
		return { mediaDevices: devices, mimeTypes: types }
	}
	catch (error) {
		logTestResult({ test: 'media', passed: false })
		captureError(error)
		return
	}
}

export const mediaHTML = ({ fp, note, count, modal, hashMini, hashSlice }) => {
	if (!fp.media) {
		return `
		<div class="col-four undefined">
			<strong>Media</strong>
			<div>mimes (0): ${note.blocked}</div>
			<div>devices (0): ${note.blocked}</div>
			<div class="block-text">${note.blocked}</div>
		</div>`
	}
	const {
		media: {
			mediaDevices,
			mimeTypes,
			$hash
		}
	} = fp

	const deviceMap = {
		'audioinput': 'mic',
		'audiooutput': 'audio',
		'videoinput': 'webcam'
	}

	const header = `
	<style>
		.audiop, .videop, .medias, .mediar, .blank-false {
			padding: 2px 8px;
		}
		.audiop {
			background: #657fca26;
		}
		.medias {
			background: #657fca54;
		}
		.videop {
			background: #ca65b424;
		}
		.mediar {
			background: #ca65b459;
		}
		.audiop.pb, .videop.pb, .guide.pr {
			color: #8f8ff1 !important;
		}
		.audiop.mb, .videop.mb, .guide.mb {
			color: #98cee4 !important;
		}
		.medias.tr, .mediar.tr, .guide.tr {
			color: #c778ba !important;
		}
	</style>
	<div>
	<br><span class="audiop">audioPlayType</span>
	<br><span class="videop">videoPlayType</span>
	<br><span class="medias">mediaSource</span>
	<br><span class="mediar">mediaRecorder</span>
	<br><span class="guide pr">P (Probably)</span>
	<br><span class="guide mb">M (Maybe)</span>
	<br><span class="guide tr">T (True)</span>
	</div>`
	const invalidMimeTypes = !mimeTypes || !mimeTypes.length
	const mimes = invalidMimeTypes ? undefined : mimeTypes.map(type => {
		const { mimeType, audioPlayType, videoPlayType, mediaSource, mediaRecorder } = type
		return `
			${audioPlayType == 'probably' ? '<span class="audiop pb">P</span>' : audioPlayType == 'maybe' ? '<span class="audiop mb">M</span>': '<span class="blank-false">-</span>'}${videoPlayType == 'probably' ? '<span class="videop pb">P</span>' : videoPlayType == 'maybe' ? '<span class="videop mb">M</span>': '<span class="blank-false">-</span>'}${mediaSource ? '<span class="medias tr">T</span>'  : '<span class="blank-false">-</span>'}${mediaRecorder ? '<span class="mediar tr">T</span>'  : '<span class="blank-false">-</span>'}: ${mimeType}
		`	
	})
	const mimesListLen = getMimeTypeShortList().length

	const replaceIndex = ({ list, index, replacement }) => [
		...list.slice(0, index),
		replacement,
		...list.slice(index + 1)
	]

	const mediaDevicesByType = (mediaDevices || []).reduce((acc, x) => {
		const deviceType = deviceMap[x] || x
		if (!acc.includes(deviceType)) {
			return (acc = [...acc, deviceType])
		}
		else if (!deviceType.includes('dual') && (acc.filter(x => x == deviceType) || []).length == 1) {
			return (
				acc = replaceIndex({
					list: acc,
					index: acc.indexOf(deviceType),
					replacement: `dual ${deviceType}`
				})
			)
		}
		return (acc = [...acc, deviceType])
	}, [])
	
	return `
	<div class="col-four">
		<strong>Media</strong><span class="hash">${hashSlice($hash)}</span>
		<div class="help" title="HTMLMediaElement.canPlayType()\nMediaRecorder.isTypeSupported()\nMediaSource.isTypeSupported()">mimes (${count(mimeTypes)}/${mimesListLen}): ${
			invalidMimeTypes ? note.blocked : 
			modal(
				'creep-media-mimeTypes',
				header+mimes.join('<br>'),
				hashMini(mimeTypes)
			)
		}</div>
		<div class="help" title="MediaDevices.enumerateDevices()\nMediaDeviceInfo.kind">devices (${count(mediaDevices)}):</div>
		<div class="block-text">
			${
				!mediaDevices || !mediaDevices.length ? note.blocked : 
					mediaDevicesByType.join(', ')
			}
		</div>
	</div>
	`	
}