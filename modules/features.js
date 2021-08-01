export const featuresHTML = ({ fp, modal, note, hashMini }) => {
	if (!fp.css || !fp.windowFeatures) {
		return `
		<div class="col-four">
			<div>Features: ${note.unknown}</div>
		</div>
		<div class="col-four">
			<div>CSS: ${note.unknown}</div>
		</div>
		<div class="col-four">
			<div>Window: ${note.unknown}</div>
		</div>`
	}

	const {
		css: {
			computedStyle: {
				keys: computedStyleKeys
			}
		},
		windowFeatures: {
			keys: windowFeaturesKeys
		}
	} = fp || {}

	/*
	console.groupCollapsed('win')
	console.log(windowFeaturesKeys.sort().join('\n'))
	console.groupEnd()
	console.groupCollapsed('css')
	console.log(computedStyleKeys.sort().join('\n'))
	console.groupEnd()
	*/

	const isNative = (win, x) => (
		/\[native code\]/.test(win[x]+'') &&
		'prototype' in win[x] && 
		win[x].prototype.constructor.name === x
	)

	const geckoCSS = {
		'71': ['-moz-column-span'],
		'72': ['offset', 'offset-anchor', 'offset-distance', 'offset-path', 'offset-rotate', 'rotate', 'scale', 'translate'],
		'73': ['overscroll-behavior-block', 'overscroll-behavior-inline'],
		'74-79': ['!-moz-stack-sizing', 'text-underline-position'],
		'80-88': ['appearance'],
		'89-90': ['!-moz-outline-radius', '!-moz-outline-radius-bottomleft', '!-moz-outline-radius-bottomright', '!-moz-outline-radius-topleft', '!-moz-outline-radius-topright', 'aspect-ratio'],
		'91': ['tab-size'],
		'92': ['accent-color', 'align-tracks', 'd', 'justify-tracks', 'masonry-auto-flow', 'math-style']
	}

	const blinkCSS = {
		'81': ['color-scheme', 'image-orientation'],
		'83': ['contain-intrinsic-size'],
		'84': ['appearance', 'ruby-position'],
		'85-86': ['content-visibility', 'counter-set', 'inherits', 'initial-value', 'page-orientation', 'syntax'],
		'87': ['ascent-override', 'border-block', 'border-block-color', 'border-block-style', 'border-block-width', 'border-inline', 'border-inline-color', 'border-inline-style', 'border-inline-width', 'descent-override', 'inset', 'inset-block', 'inset-block-end', 'inset-block-start', 'inset-inline', 'inset-inline-end', 'inset-inline-start', 'line-gap-override', 'margin-block', 'margin-inline', 'padding-block', 'padding-inline', 'text-decoration-thickness', 'text-underline-offset'],
		'88': ['aspect-ratio'],
		'89': ['border-end-end-radius', 'border-end-start-radius', 'border-start-end-radius', 'border-start-start-radius', 'forced-color-adjust'],
		'90': ['overflow-clip-margin'],
		'91': ['additive-symbols', 'fallback', 'negative', 'pad', 'prefix', 'range', 'speak-as', 'suffix', 'symbols', 'system'],
		'92': ['size-adjust']
	}

	const geckoWindow = {
		'71': ['MathMLElement', '!SVGZoomAndPan'],
		'72-73': ['!BatteryManager', 'FormDataEvent', 'Geolocation', 'GeolocationCoordinates', 'GeolocationPosition', 'GeolocationPositionError', '!mozPaintCount'],
		'74': ['FormDataEvent', '!uneval'],
		'75': ['AnimationTimeline', 'CSSAnimation', 'CSSTransition', 'DocumentTimeline', 'SubmitEvent'],
		'76-77': ['AudioParamMap', 'AudioWorklet', 'AudioWorkletNode', 'Worklet'],
		'78': ['Atomics'],
		'79-81': ['AggregateError', 'FinalizationRegistry'],
		'82': ['MediaMetadata', 'MediaSession', 'Sanitizer'],
		'83': ['MediaMetadata', 'MediaSession', '!Sanitizer'],
		'84': ['PerformancePaintTiming'],
		'85-86': ['PerformancePaintTiming', '!HTMLMenuItemElement', '!onshow'],
		'87': ['onbeforeinput'],
		'88': ['onbeforeinput', '!VisualViewport'],
		'89-91': ['!ondevicelight', '!ondeviceproximity', '!onuserproximity'],
		'92': ['DeprecationReportBody', 'ElementInternals', 'FeaturePolicyViolationReportBody', 'GamepadAxisMoveEvent', 'GamepadButtonEvent', 'HTMLDialogElement', 'Report', 'ReportBody', 'ReportingObserver', '!content', '!sidebar']
	}

	const blinkWindow = {
		'80': ['CompressionStream', 'DecompressionStream', 'FeaturePolicy', 'FragmentDirective', 'PeriodicSyncManager', 'VideoPlaybackQuality'],
		'81': ['SubmitEvent', 'XRHitTestResult', 'XRHitTestSource', 'XRRay', 'XRTransientInputHitTestResult', 'XRTransientInputHitTestSource'],
		'83': ['BarcodeDetector', 'XRDOMOverlayState', 'XRSystem'],
		'84': ['AnimationPlaybackEvent', 'AnimationTimeline', 'CSSAnimation', 'CSSTransition', 'DocumentTimeline', 'FinalizationRegistry',  'LayoutShiftAttribution', 'ResizeObserverSize', 'WakeLock', 'WakeLockSentinel', 'WeakRef', 'XRLayer'],
		'85': ['AggregateError', 'CSSPropertyRule', 'EventCounts', 'XRAnchor', 'XRAnchorSet'],
		'86': ['RTCEncodedAudioFrame', 'RTCEncodedVideoFrame'],
		'87': ['CookieChangeEvent', 'CookieStore', 'CookieStoreManager', 'Scheduling'],
		'88': ['Scheduling', '!BarcodeDetector'],
		'89': ['ReadableByteStreamController', 'ReadableStreamBYOBReader', 'ReadableStreamBYOBRequest', 'ReadableStreamDefaultController', 'XRWebGLBinding'],
		'90': ['AbstractRange', 'CustomStateSet', 'NavigatorUAData', 'XRCPUDepthInformation', 'XRDepthInformation', 'XRLightEstimate', 'XRLightProbe', 'XRWebGLDepthInformation'],
		'91': ['CSSCounterStyleRule',  'GravitySensor',  'NavigatorManagedData'],
		'92': ['CSSCounterStyleRule','!SharedArrayBuffer'],
	}

	const mathPI = 3.141592653589793
	const blink = (mathPI ** -100) == 1.9275814160560204e-50
	const gecko = (mathPI ** -100) == 1.9275814160560185e-50
	const browser = (
		blink ? 'Chrome' : gecko ? 'Firefox' : ''
	)

	const versionSort = x => x.sort((a, b) => /\d+/.exec(a)[0] - /\d+/.exec(b)[0]).reverse()
	const getFeatures = ({allKeys, engineMap, checkNative = false} = {}) => {
		const allKeysSet = new Set(allKeys)
		const features = new Set()
		const match = Object.keys(engineMap || {}).reduce((acc, key, i) => {
			const version = engineMap[key]
			const versionLen = version.length
			const featureLen = version.filter(prop => {
				const removedFromVersion = prop.charAt(0) == '!'
				if (removedFromVersion) {
					const propName = prop.slice(1)
					return !allKeysSet.has(propName) && features.add(prop)	
				}
				return (
					allKeysSet.has(prop) &&
					(checkNative ? isNative(window, prop) : true) &&
					features.add(prop)
				)
			}).length
			return versionLen == featureLen ? [...acc, key] : acc 
		}, [])
		const version = versionSort(match)[0]
		return {
			version,
			features
		}
	}	

	// modal
	const getModal = (id, engineMap, features) => {
		return modal(`creep-${id}`, versionSort(Object.keys(engineMap)).map(key => {
			return `
				<strong>${key}</strong>:<br>${
					engineMap[key].map(prop => {
						return `<span class="${!features.has(prop) ? 'unsupport' : ''}">${prop}</span>`
					}).join('<br>')
				}
			`
		}).join('<br>'), hashMini([...features]))
	}

	// css version
	const engineMapCSS = blink ? blinkCSS : gecko ? geckoCSS : {}
	const {
		version: cssVersion,
		features: cssFeatures
	} = getFeatures({allKeys: computedStyleKeys, engineMap: engineMapCSS})
	const cssModal = getModal('features-css', engineMapCSS, cssFeatures)
	
	// window version
	const engineMapWindow = blink ? blinkWindow : gecko ? geckoWindow : {}
	const {
		version: windowVersion,
		features: windowFeatures
	} = getFeatures({allKeys: windowFeaturesKeys, engineMap: engineMapWindow, checkNative: true})
	const windowModal = getModal('features-window', engineMapWindow, windowFeatures)

	// determine version based on 2 factors
	const versionSet = new Set([
		cssVersion,
		windowVersion
	])
	versionSet.delete(undefined)
	
	const versionRange = versionSort(
		[...versionSet].reduce((acc, x) => [...acc, ...x.split('-')], [])
	)
	const getVersionFromRange = range => {
		const len = range.length
		const first = range[0]
		const last = range[len-1]
		return (
			!len ? '' : 
				len == 1 ? first :
					`${last}-${first}`
		)
	}
	const getIcon = name => `<span class="icon ${name}"></span>`
	const browserIcon = (
		!browser ? '' :
			/chrome/i.test(browser) ? getIcon('chrome') :
				/firefox/i.test(browser) ? getIcon('firefox') :
					''
	)
	return `
	<style>
		.unsupport {
			background: #f1f1f1;
			color: #aaa;
		}
		@media (prefers-color-scheme: dark) {
			.unsupport {
				color: var(--light-grey);
				background: none;
			}
		}
	</style>
	<div class="col-four">
		<div>Features: ${
			versionRange.length ? `${browserIcon}${getVersionFromRange(versionRange)}+` : 
				note.unknown
		}</div>
	</div>
	<div class="col-four">
		<div>CSS: ${cssVersion ? `${cssModal} (v${cssVersion})` : note.unknown}</div>
	</div>
	<div class="col-four">
		<div>Window: ${windowVersion ? `${windowModal} (v${windowVersion})` : note.unknown}</div>
	</div>
	`
}