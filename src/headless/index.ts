/* eslint-disable new-cap */
import { captureError } from '../errors'
import { lieProps, PARENT_PHANTOM } from '../lies'
import { instanceId, hashMini } from '../utils/crypto'
import { createTimer, queueEvent, IS_BLINK, logTestResult, performanceLogger, hashSlice } from '../utils/helpers'
import { HTMLNote, modal } from '../utils/html'
import { Platform } from './constants'
import getPlatformEstimate from './getPlatformEstimate'
import { getSystemFonts } from './getSystemFonts'

/**
 * @param {{ userAgent: string; }} workerScope
 */
export default async function getHeadlessFeatures(workerScope) {
	try {
		const timer = createTimer()
		await queueEvent(timer)
		const mimeTypes = Object.keys({ ...navigator.mimeTypes })
		interface Headless {
			chromium: boolean,
			likeHeadless: Record<string, boolean>,
			headless: Record<string, boolean>,
			stealth: Record<string, boolean>,
		}
		const data: Headless = {
			chromium: IS_BLINK,
			likeHeadless: {
				['navigator.webdriver is on']: 'webdriver' in navigator && !!navigator.webdriver,
				['chrome plugins array is empty']: IS_BLINK && navigator.plugins.length === 0,
				['chrome mimeTypes array is empty']: IS_BLINK && mimeTypes.length === 0,
				['notification permission is denied']: (
					IS_BLINK &&
					'Notification' in window &&
					(Notification.permission == 'denied')
				),
				['chrome system color ActiveText is rgb(255, 0, 0)']: IS_BLINK && (() => {
					let rendered = PARENT_PHANTOM
					if (!PARENT_PHANTOM) {
						rendered = document.createElement('div')
						document.body.appendChild(rendered)
					}
					if (!rendered) return false
					rendered.setAttribute('style', `background-color: ActiveText`)
					const { backgroundColor: activeText } = getComputedStyle(rendered)
					if (!PARENT_PHANTOM) {
						document.body.removeChild(rendered)
					}
					return activeText === 'rgb(255, 0, 0)'
				})(),
				['prefers light color scheme']: matchMedia('(prefers-color-scheme: light)').matches,
				// @ts-expect-error rtt will be undefined if not supported
				['network round-trip time is 0']: navigator?.connection?.rtt === 0,
				['userAgentData is blank']: (
					'userAgentData' in navigator && (
						// @ts-expect-error if userAgentData is null
						navigator.userAgentData?.platform === '' ||
						// @ts-expect-error if userAgentData is null
						await navigator.userAgentData.getHighEntropyValues(['platform']).platform === ''
					)
				),
				['Web Share API is not supported']: IS_BLINK && CSS.supports('accent-color: initial') && (
					!('share' in navigator) || !('canShare' in navigator)
				),
				['pdf viewer is disabled']: (
					'pdfViewerEnabled' in navigator && navigator.pdfViewerEnabled === false
				),
				['screen has no taskbar']: (
					screen.height === screen.availHeight &&
					screen.width === screen.availWidth
				),
				['screen res matches viewport res']: (
					(innerWidth === screen.width && outerHeight === screen.height) || (
						'visualViewport' in window &&
						(visualViewport.width === screen.width && visualViewport.height === screen.height)
					)
				),
			},
			headless: {
				['chrome window.chrome is undefined']: IS_BLINK && !('chrome' in window),
				['chrome permission state is inconsistent']: (
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
				['userAgent contains HeadlessChrome']: (
					/HeadlessChrome/.test(navigator.userAgent) ||
					/HeadlessChrome/.test(navigator.appVersion)
				),
				['worker userAgent contains HeadlessChrome']: !!workerScope && (
					/HeadlessChrome/.test(workerScope.userAgent)
				),
			},
			stealth: {
				['srcdoc triggers a window Proxy']: (() => {
					const iframe = document.createElement('iframe')
					iframe.srcdoc = instanceId
					return !!iframe.contentWindow
				})(),
				['index of chrome is too high']: (() => {
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
				['chrome.runtime functions are invalid']: (() => {
					// @ts-ignore
					if (!('chrome' in window && 'runtime' in chrome)) {
						return false
					}
					try {
						// @ts-ignore
						if ('prototype' in chrome.runtime.sendMessage ||
							// @ts-ignore
							'prototype' in chrome.runtime.connect) {
							return true
						}
						// @ts-ignore
						new chrome.runtime.sendMessage
						// @ts-ignore
						new chrome.runtime.connect
						return true
					} catch (err: any) {
						return err.constructor.name != 'TypeError' ? true : false
					}
				})(),
				['Function.prototype.toString has invalid TypeError']: (
					!!lieProps['Function.toString']
				),
			},
		}

		const { likeHeadless, headless, stealth } = data
		const likeHeadlessKeys = Object.keys(likeHeadless)
		const headlessKeys = Object.keys(headless)
		const stealthKeys = Object.keys(stealth)

		const likeHeadlessRating = +((likeHeadlessKeys.filter((key) => likeHeadless[key]).length / likeHeadlessKeys.length) * 100).toFixed(0)
		const headlessRating = +((headlessKeys.filter((key) => headless[key]).length / headlessKeys.length) * 100).toFixed(0)
		const stealthRating = +((stealthKeys.filter((key) => stealth[key]).length / stealthKeys.length) * 100).toFixed(0)

		const systemFonts = getSystemFonts()
		const platformEstimate = getPlatformEstimate()

		logTestResult({ time: timer.stop(), test: 'headless', passed: true })
		return {
			...data,
			likeHeadlessRating,
			headlessRating,
			stealthRating,
			systemFonts,
			platformEstimate,
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
