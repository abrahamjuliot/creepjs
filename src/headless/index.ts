/* eslint-disable new-cap */
import { captureError } from '../errors'
import { lieProps, PARENT_PHANTOM } from '../lies'
import { instanceId, hashMini } from '../utils/crypto'
import { createTimer, queueEvent, IS_BLINK, logTestResult, performanceLogger, hashSlice } from '../utils/helpers'
import { HTMLNote, modal } from '../utils/html'
import { Platform } from './constants'
import getPlatformEstimate from './getPlatformEstimate'
import { getSystemFonts } from './getSystemFonts'

export default async function getHeadlessFeatures({
	webgl,
	workerScope,
}) {
	try {
		const timer = createTimer()
		await queueEvent(timer)
		const mimeTypes = Object.keys({ ...navigator.mimeTypes })

		const systemFonts = getSystemFonts()
		const [scores, highestScore, headlessEstimate] = getPlatformEstimate()

		interface Headless {
			chromium: boolean,
			likeHeadless: Record<string, boolean>,
			headless: Record<string, boolean>,
			stealth: Record<string, boolean>,
		}
		const data: Headless = {
			chromium: IS_BLINK,
			likeHeadless: {
				noPlugins: IS_BLINK && navigator.plugins.length === 0,
				noMimeTypes: IS_BLINK && mimeTypes.length === 0,
				notificationIsDenied: (
					IS_BLINK &&
					'Notification' in window &&
					(Notification.permission == 'denied')
				),
				hasKnownBgColor: IS_BLINK && (() => {
					let rendered = PARENT_PHANTOM
					if (!PARENT_PHANTOM) {
						rendered = document.createElement('div')
						document.body.appendChild(rendered)
					}
					if (!rendered) return false
					rendered.setAttribute('style', `background-color: ActiveText`)
					const { backgroundColor: activeText } = getComputedStyle(rendered) || []
					if (!PARENT_PHANTOM) {
						document.body.removeChild(rendered)
					}
					return activeText === 'rgb(255, 0, 0)'
				})(),
				prefersLightColor: matchMedia('(prefers-color-scheme: light)').matches,
				// @ts-expect-error rtt will be undefined if not supported
				rttIsZero: navigator?.connection?.rtt === 0,
				['userAgentData is blank']: (
					'userAgentData' in navigator && (
						// @ts-expect-error if userAgentData is null
						navigator.userAgentData?.platform === '' ||
						// @ts-expect-error if userAgentData is null
						await navigator.userAgentData.getHighEntropyValues(['platform']).platform === ''
					)
				),
				pdfIsDisabled: (
					'pdfViewerEnabled' in navigator && navigator.pdfViewerEnabled === false
				),
				noTaskbar: (
					screen.height === screen.availHeight &&
					screen.width === screen.availWidth
				),
				hasVvpScreenRes: (
					(innerWidth === screen.width && outerHeight === screen.height) || (
						'visualViewport' in window &&
						// @ts-expect-error if unsupported
						(visualViewport.width === screen.width && visualViewport.height === screen.height)
					)
				),
				hasSwiftShader: /SwiftShader/.test(workerScope?.webglRenderer),
				noWebShare: IS_BLINK && CSS.supports('accent-color: initial') && (
					!('share' in navigator) || !('canShare' in navigator)
				),
				noContentIndex: !!headlessEstimate?.noContentIndex,
				noContactsManager: !!headlessEstimate?.noContactsManager,
				noDownlinkMax: !!headlessEstimate?.noDownlinkMax,
			},
			headless: {
				webDriverIsOn: (
					(CSS.supports('border-end-end-radius: initial') && navigator.webdriver === undefined) ||
					!!navigator.webdriver
				),
				noChrome: IS_BLINK && !('chrome' in window),
				hasPermissionsBug: (
					IS_BLINK &&
					'permissions' in navigator &&
					await (async () => {
						const res = await navigator.permissions.query({ name: 'notifications' })
						return (
							res.state == 'prompt' &&
							'Notification' in window &&
							Notification.permission === 'denied'
						)
					})()
				),
				hasHeadlessUA: (
					/HeadlessChrome/.test(navigator.userAgent) ||
					/HeadlessChrome/.test(navigator.appVersion)
				),
				hasHeadlessWorkerUA: !!workerScope && (
					/HeadlessChrome/.test(workerScope.userAgent)
				),
			},
			stealth: {
				hasIframeProxy: (() => {
					try {
						const iframe = document.createElement('iframe')
						iframe.srcdoc = instanceId
						return !!iframe.contentWindow
					} catch (err) {
						return true
					}
				})(),
				hasHighChromeIndex: (() => {
					const control = (
						'cookieStore' in window ? 'cookieStore' :
							'ondevicemotion' in window ? 'ondevicemotion' :
								'speechSynthesis'
					)
					const propsInWindow = []
					// eslint-disable-next-line guard-for-in
					for (const prop in window) {
						propsInWindow.push(prop)
					}
					const chromeIndex = propsInWindow.indexOf('chrome')
					const controlIndex = propsInWindow.indexOf(control)
					return chromeIndex > controlIndex
				})(),
				hasBadChromeRuntime: (() => {
					// @ts-expect-error if unsupported
					if (!('chrome' in window && 'runtime' in chrome)) {
						return false
					}
					try {
						// @ts-expect-error if unsupported
						if ('prototype' in chrome.runtime.sendMessage ||
							// @ts-expect-error if unsupported
							'prototype' in chrome.runtime.connect) {
							return true
						}
						// @ts-expect-error if unsupported
						new chrome.runtime.sendMessage
						// @ts-expect-error if unsupported
						new chrome.runtime.connect
						return true
					} catch (err: any) {
						return err.constructor.name != 'TypeError' ? true : false
					}
				})(),
				hasToStringProxy: (
					!!lieProps['Function.toString']
				),
				hasBadWebGL: (() => {
					const { UNMASKED_RENDERER_WEBGL: gpu } = webgl?.parameters || {}
					const { webglRenderer: workerGPU } = workerScope || {}
					return (gpu && workerGPU && (gpu !== workerGPU))
				})(),
			},
		}

		const { likeHeadless, headless, stealth } = data
		const likeHeadlessKeys = Object.keys(likeHeadless)
		const headlessKeys = Object.keys(headless)
		const stealthKeys = Object.keys(stealth)

		const likeHeadlessRating = +((likeHeadlessKeys.filter((key) => likeHeadless[key]).length / likeHeadlessKeys.length) * 100).toFixed(0)
		const headlessRating = +((headlessKeys.filter((key) => headless[key]).length / headlessKeys.length) * 100).toFixed(0)
		const stealthRating = +((stealthKeys.filter((key) => stealth[key]).length / stealthKeys.length) * 100).toFixed(0)

		logTestResult({ time: timer.stop(), test: 'headless', passed: true })
		return {
			...data,
			likeHeadlessRating,
			headlessRating,
			stealthRating,
			systemFonts,
			platformEstimate: [scores, highestScore],
		}
	} catch (error) {
		logTestResult({ test: 'headless', passed: false })
		captureError(error)
		return
	}
}

export function headlessFeaturesHTML(fp) {
	if (!fp.headless) {
		return `
		<div class="col-six">
			<strong>Headless</strong>
			<div>chromium: ${HTMLNote.BLOCKED}</div>
			<div>0% like headless: ${HTMLNote.BLOCKED}</div>
			<div>0% headless: ${HTMLNote.BLOCKED}</div>
			<div>0% stealth: ${HTMLNote.BLOCKED}</div>
			<div>platform hints:</div>
			<div class="block-text">${HTMLNote.BLOCKED}</div>
		</div>`
	}
	const {
		headless: data,
	} = fp
	const {
		$hash,
		chromium,
		likeHeadless,
		likeHeadlessRating,
		headless,
		headlessRating,
		stealth,
		stealthRating,
		systemFonts,
		platformEstimate,
	} = data || {}

	const [scores, highestScore] = platformEstimate || []

	const IconMap: Record<string, string> = {
		[Platform.ANDROID]: `<span class="icon android"></span>`,
		[Platform.CHROME_OS]: `<span class="icon cros"></span>`,
		[Platform.WINDOWS]: `<span class="icon windows"></span>`,
		[Platform.MAC]: `<span class="icon apple"></span>`,
		[Platform.LINUX]: `<span class="icon linux"></span>`,
	}

	const scoreKeys = Object.keys(scores || {})
	const platformTemplate = !scores ? '' : `
		${scoreKeys.map((key) => (scores[key]*100).toFixed(0)).join(':')}
		<br>${scoreKeys.map((key) => {
			const score = scores[key]
			const style = `
				filter: opacity(${score == highestScore ? 100 : 15}%);
			`
			return `<span style="${style}">${IconMap[key]}</span>`
		}).join('')}
		`

	return `
	<div class="relative col-six">
		<style>
			.like-headless-rating {
				background: linear-gradient(90deg, var(${likeHeadlessRating < 100 ? '--grey-glass' : '--error'}) ${likeHeadlessRating}%, #fff0 ${likeHeadlessRating}%, #fff0 100%);
			}
			.headless-rating {
				background: linear-gradient(90deg, var(--error) ${headlessRating}%, #fff0 ${headlessRating}%, #fff0 100%);
			}
			.stealth-rating {
				background: linear-gradient(90deg, var(--error) ${stealthRating}%, #fff0 ${stealthRating}%, #fff0 100%);
			}
		</style>
		<span class="aside-note">${performanceLogger.getLog().headless}</span>
		<strong>Headless</strong><span class="hash">${hashSlice($hash)}</span>
		<div>chromium: ${''+chromium}</div>
		<div class="like-headless-rating">${''+likeHeadlessRating}% like headless: ${
			modal(
				'creep-like-headless',
				'<strong>Like Headless</strong><br><br>'+
				Object.keys(likeHeadless).map((key) => `${key}: ${''+likeHeadless[key]}`).join('<br>'),
				hashMini(likeHeadless),
			)
		}</div>
		<div class="headless-rating">${''+headlessRating}% headless: ${
			modal(
				'creep-headless',
				'<strong>Headless</strong><br><br>'+
				Object.keys(headless).map((key) => `${key}: ${''+headless[key]}`).join('<br>'),
				hashMini(headless),
			)
		}</div>
		<div class="stealth-rating">${''+stealthRating}% stealth: ${
			modal(
				'creep-stealth',
				'<strong>Stealth</strong><br><br>'+
				Object.keys(stealth).map((key) => `${key}: ${''+stealth[key]}`).join('<br>'),
				hashMini(stealth),
			)
		}</div>
		<div>platform hints:</div>
		<div class="block-text">
			${systemFonts ? `<div>${systemFonts}</div>` : ''}
			${platformTemplate ? `<div>${platformTemplate}</div>` : ''}
		</div>
	</div>`
}
