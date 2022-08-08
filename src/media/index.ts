import { captureError } from '../errors'
import { hashMini } from '../utils/crypto'
import { createTimer, logTestResult, performanceLogger, hashSlice } from '../utils/helpers'
import { HTMLNote, count, modal } from '../utils/html'

// inspired by
// - https://privacycheck.sec.lrz.de/active/fp_cpt/fp_can_play_type.html
// - https://arkenfox.github.io/TZP
const getMimeTypeShortList = () => [
	'audio/ogg; codecs="vorbis"',
	'audio/mpeg',
	'audio/mpegurl',
	'audio/wav; codecs="1"',
	'audio/x-m4a',
	'audio/aac',
	'video/ogg; codecs="theora"',
	'video/quicktime',
	'video/mp4; codecs="avc1.42E01E"',
	'video/webm; codecs="vp8"',
	'video/webm; codecs="vp9"',
	'video/x-matroska',
].sort()

export default async function getMedia() {
	const getMimeTypes = () => {
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
					mediaRecorder: isMediaRecorderSupported ? MediaRecorder.isTypeSupported(type) : false,
				}
				if (!data.audioPlayType && !data.videoPlayType && !data.mediaSource && !data.mediaRecorder) {
					return acc
				}
				// @ts-ignore
				acc.push(data)
				return acc
			}, [])
			return types
		} catch (error) {
			return
		}
	}

	try {
		const timer = createTimer()
		timer.start()
		const mimeTypes = getMimeTypes()

		logTestResult({ time: timer.stop(), test: 'media', passed: true })
		return { mimeTypes }
	} catch (error) {
		logTestResult({ test: 'media', passed: false })
		captureError(error)
		return
	}
}


export function mediaHTML(fp) {
	if (!fp.media) {
		return `
			<div class="col-four undefined">
				<strong>Media</strong>
				<div>mimes (0): ${HTMLNote.BLOCKED}</div>
			</div>
		`
	}
	const {
		media: {
			mimeTypes,
			$hash,
		},
	} = fp

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
		</div>
	`
	const invalidMimeTypes = !mimeTypes || !mimeTypes.length
	const mimes = invalidMimeTypes ? undefined : mimeTypes.map((type) => {
		const { mimeType, audioPlayType, videoPlayType, mediaSource, mediaRecorder } = type
		return `
			${audioPlayType == 'probably' ? '<span class="audiop pb">P</span>' : audioPlayType == 'maybe' ? '<span class="audiop mb">M</span>': '<span class="blank-false">-</span>'}${videoPlayType == 'probably' ? '<span class="videop pb">P</span>' : videoPlayType == 'maybe' ? '<span class="videop mb">M</span>': '<span class="blank-false">-</span>'}${mediaSource ? '<span class="medias tr">T</span>' : '<span class="blank-false">-</span>'}${mediaRecorder ? '<span class="mediar tr">T</span>' : '<span class="blank-false">-</span>'}: ${mimeType}
		`
	})
	const mimesListLen = getMimeTypeShortList().length

	return `
		<div class="relative col-four">
			<span class="aside-note">${performanceLogger.getLog().media}</span>
			<strong>Media</strong><span class="hash">${hashSlice($hash)}</span>
			<div class="help" title="HTMLMediaElement.canPlayType()\nMediaRecorder.isTypeSupported()\nMediaSource.isTypeSupported()">mimes (${count(mimeTypes)}/${mimesListLen}): ${
				invalidMimeTypes ? HTMLNote.BLOCKED :
				modal(
					'creep-media-mimeTypes',
					header+mimes.join('<br>'),
					hashMini(mimeTypes),
				)
			}</div>
		</div>
	`
}
