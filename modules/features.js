const getStableFeatures = () => ({
	'Chrome': {
		version: 93,
		windowKeys: `Object, Function, Array, Number, parseFloat, parseInt, Infinity, NaN, undefined, Boolean, String, Symbol, Date, Promise, RegExp, Error, AggregateError, EvalError, RangeError, ReferenceError, SyntaxError, TypeError, URIError, globalThis, JSON, Math, console, Intl, ArrayBuffer, Uint8Array, Int8Array, Uint16Array, Int16Array, Uint32Array, Int32Array, Float32Array, Float64Array, Uint8ClampedArray, BigUint64Array, BigInt64Array, DataView, Map, BigInt, Set, WeakMap, WeakSet, Proxy, Reflect, FinalizationRegistry, WeakRef, decodeURI, decodeURIComponent, encodeURI, encodeURIComponent, escape, unescape, eval, isFinite, isNaN, Option, Image, Audio, webkitURL, webkitRTCPeerConnection, webkitMediaStream, WebKitMutationObserver, WebKitCSSMatrix, XPathResult, XPathExpression, XPathEvaluator, XMLSerializer, XMLHttpRequestUpload, XMLHttpRequestEventTarget, XMLHttpRequest, XMLDocument, WritableStreamDefaultWriter, WritableStreamDefaultController, WritableStream, Worker, Window, WheelEvent, WebSocket, WebGLVertexArrayObject, WebGLUniformLocation, WebGLTransformFeedback, WebGLTexture, WebGLSync, WebGLShaderPrecisionFormat, WebGLShader, WebGLSampler, WebGLRenderingContext, WebGLRenderbuffer, WebGLQuery, WebGLProgram, WebGLFramebuffer, WebGLContextEvent, WebGLBuffer, WebGLActiveInfo, WebGL2RenderingContext, WaveShaperNode, VisualViewport, ValidityState, VTTCue, UserActivation, URLSearchParams, URL, UIEvent, TreeWalker, TransitionEvent, TransformStream, TrackEvent, TouchList, TouchEvent, Touch, TimeRanges, TextTrackList, TextTrackCueList, TextTrackCue, TextTrack, TextMetrics, TextEvent, TextEncoderStream, TextEncoder, TextDecoderStream, TextDecoder, Text, TaskAttributionTiming, SyncManager, SubmitEvent, StyleSheetList, StyleSheet, StylePropertyMapReadOnly, StylePropertyMap, StorageEvent, Storage, StereoPannerNode, StaticRange, ShadowRoot, Selection, SecurityPolicyViolationEvent, ScriptProcessorNode, ScreenOrientation, Screen, SVGViewElement, SVGUseElement, SVGUnitTypes, SVGTransformList, SVGTransform, SVGTitleElement, SVGTextPositioningElement, SVGTextPathElement, SVGTextElement, SVGTextContentElement, SVGTSpanElement, SVGSymbolElement, SVGSwitchElement, SVGStyleElement, SVGStringList, SVGStopElement, SVGSetElement, SVGScriptElement, SVGSVGElement, SVGRectElement, SVGRect, SVGRadialGradientElement, SVGPreserveAspectRatio, SVGPolylineElement, SVGPolygonElement, SVGPointList, SVGPoint, SVGPatternElement, SVGPathElement, SVGNumberList, SVGNumber, SVGMetadataElement, SVGMatrix, SVGMaskElement, SVGMarkerElement, SVGMPathElement, SVGLinearGradientElement, SVGLineElement, SVGLengthList, SVGLength, SVGImageElement, SVGGraphicsElement, SVGGradientElement, SVGGeometryElement, SVGGElement, SVGForeignObjectElement, SVGFilterElement, SVGFETurbulenceElement, SVGFETileElement, SVGFESpotLightElement, SVGFESpecularLightingElement, SVGFEPointLightElement, SVGFEOffsetElement, SVGFEMorphologyElement, SVGFEMergeNodeElement, SVGFEMergeElement, SVGFEImageElement, SVGFEGaussianBlurElement, SVGFEFuncRElement, SVGFEFuncGElement, SVGFEFuncBElement, SVGFEFuncAElement, SVGFEFloodElement, SVGFEDropShadowElement, SVGFEDistantLightElement, SVGFEDisplacementMapElement, SVGFEDiffuseLightingElement, SVGFEConvolveMatrixElement, SVGFECompositeElement, SVGFEComponentTransferElement, SVGFEColorMatrixElement, SVGFEBlendElement, SVGEllipseElement, SVGElement, SVGDescElement, SVGDefsElement, SVGComponentTransferFunctionElement, SVGClipPathElement, SVGCircleElement, SVGAnimationElement, SVGAnimatedTransformList, SVGAnimatedString, SVGAnimatedRect, SVGAnimatedPreserveAspectRatio, SVGAnimatedNumberList, SVGAnimatedNumber, SVGAnimatedLengthList, SVGAnimatedLength, SVGAnimatedInteger, SVGAnimatedEnumeration, SVGAnimatedBoolean, SVGAnimatedAngle, SVGAnimateTransformElement, SVGAnimateMotionElement, SVGAnimateElement, SVGAngle, SVGAElement, Response, ResizeObserverSize, ResizeObserverEntry, ResizeObserver, Request, ReportingObserver, ReadableStreamDefaultReader, ReadableStreamDefaultController, ReadableStreamBYOBRequest, ReadableStreamBYOBReader, ReadableStream, ReadableByteStreamController, Range, RadioNodeList, RTCTrackEvent, RTCStatsReport, RTCSessionDescription, RTCSctpTransport, RTCRtpTransceiver, RTCRtpSender, RTCRtpReceiver, RTCPeerConnectionIceEvent, RTCPeerConnectionIceErrorEvent, RTCPeerConnection, RTCIceCandidate, RTCErrorEvent, RTCError, RTCEncodedVideoFrame, RTCEncodedAudioFrame, RTCDtlsTransport, RTCDataChannelEvent, RTCDataChannel, RTCDTMFToneChangeEvent, RTCDTMFSender, RTCCertificate, PromiseRejectionEvent, ProgressEvent, ProcessingInstruction, PopStateEvent, PointerEvent, PluginArray, Plugin, PeriodicWave, PerformanceTiming, PerformanceServerTiming, PerformanceResourceTiming, PerformancePaintTiming, PerformanceObserverEntryList, PerformanceObserver, PerformanceNavigationTiming, PerformanceNavigation, PerformanceMeasure, PerformanceMark, PerformanceLongTaskTiming, PerformanceEventTiming, PerformanceEntry, PerformanceElementTiming, Performance, Path2D, PannerNode, PageTransitionEvent, OverconstrainedError, OscillatorNode, OffscreenCanvasRenderingContext2D, OffscreenCanvas, OfflineAudioContext, OfflineAudioCompletionEvent, NodeList, NodeIterator, NodeFilter, Node, NetworkInformation, Navigator, NamedNodeMap, MutationRecord, MutationObserver, MutationEvent, MouseEvent, MimeTypeArray, MimeType, MessagePort, MessageEvent, MessageChannel, MediaStreamTrackEvent, MediaStreamTrack, MediaStreamEvent, MediaStreamAudioSourceNode, MediaStreamAudioDestinationNode, MediaStream, MediaRecorder, MediaQueryListEvent, MediaQueryList, MediaList, MediaError, MediaEncryptedEvent, MediaElementAudioSourceNode, MediaCapabilities, Location, LayoutShiftAttribution, LayoutShift, LargestContentfulPaint, KeyframeEffect, KeyboardEvent, IntersectionObserverEntry, IntersectionObserver, InputEvent, InputDeviceInfo, InputDeviceCapabilities, ImageData, ImageCapture, ImageBitmapRenderingContext, ImageBitmap, IdleDeadline, IIRFilterNode, IDBVersionChangeEvent, IDBTransaction, IDBRequest, IDBOpenDBRequest, IDBObjectStore, IDBKeyRange, IDBIndex, IDBFactory, IDBDatabase, IDBCursorWithValue, IDBCursor, History, Headers, HashChangeEvent, HTMLVideoElement, HTMLUnknownElement, HTMLUListElement, HTMLTrackElement, HTMLTitleElement, HTMLTimeElement, HTMLTextAreaElement, HTMLTemplateElement, HTMLTableSectionElement, HTMLTableRowElement, HTMLTableElement, HTMLTableColElement, HTMLTableCellElement, HTMLTableCaptionElement, HTMLStyleElement, HTMLSpanElement, HTMLSourceElement, HTMLSlotElement, HTMLSelectElement, HTMLScriptElement, HTMLQuoteElement, HTMLProgressElement, HTMLPreElement, HTMLPictureElement, HTMLParamElement, HTMLParagraphElement, HTMLOutputElement, HTMLOptionsCollection, HTMLOptionElement, HTMLOptGroupElement, HTMLObjectElement, HTMLOListElement, HTMLModElement, HTMLMeterElement, HTMLMetaElement, HTMLMenuElement, HTMLMediaElement, HTMLMarqueeElement, HTMLMapElement, HTMLLinkElement, HTMLLegendElement, HTMLLabelElement, HTMLLIElement, HTMLInputElement, HTMLImageElement, HTMLIFrameElement, HTMLHtmlElement, HTMLHeadingElement, HTMLHeadElement, HTMLHRElement, HTMLFrameSetElement, HTMLFrameElement, HTMLFormElement, HTMLFormControlsCollection, HTMLFontElement, HTMLFieldSetElement, HTMLEmbedElement, HTMLElement, HTMLDocument, HTMLDivElement, HTMLDirectoryElement, HTMLDialogElement, HTMLDetailsElement, HTMLDataListElement, HTMLDataElement, HTMLDListElement, HTMLCollection, HTMLCanvasElement, HTMLButtonElement, HTMLBodyElement, HTMLBaseElement, HTMLBRElement, HTMLAudioElement, HTMLAreaElement, HTMLAnchorElement, HTMLAllCollection, GeolocationPositionError, GeolocationPosition, GeolocationCoordinates, Geolocation, GamepadHapticActuator, GamepadEvent, GamepadButton, Gamepad, GainNode, FormDataEvent, FormData, FontFaceSetLoadEvent, FontFace, FocusEvent, FileReader, FileList, File, FeaturePolicy, External, EventTarget, EventSource, Event, ErrorEvent, ElementInternals, Element, DynamicsCompressorNode, DragEvent, DocumentType, DocumentFragment, Document, DelayNode, DecompressionStream, DataTransferItemList, DataTransferItem, DataTransfer, DOMTokenList, DOMStringMap, DOMStringList, DOMRectReadOnly, DOMRectList, DOMRect, DOMQuad, DOMPointReadOnly, DOMPoint, DOMParser, DOMMatrixReadOnly, DOMMatrix, DOMImplementation, DOMException, DOMError, CustomEvent, CustomElementRegistry, Crypto, CountQueuingStrategy, ConvolverNode, ConstantSourceNode, CompressionStream, CompositionEvent, Comment, CloseEvent, ClipboardEvent, CharacterData, ChannelSplitterNode, ChannelMergerNode, CanvasRenderingContext2D, CanvasPattern, CanvasGradient, CanvasCaptureMediaStreamTrack, CSSVariableReferenceValue, CSSUnparsedValue, CSSUnitValue, CSSTranslate, CSSTransformValue, CSSTransformComponent, CSSSupportsRule, CSSStyleValue, CSSStyleSheet, CSSStyleRule, CSSStyleDeclaration, CSSSkewY, CSSSkewX, CSSSkew, CSSScale, CSSRuleList, CSSRule, CSSRotate, CSSPropertyRule, CSSPositionValue, CSSPerspective, CSSPageRule, CSSNumericValue, CSSNumericArray, CSSNamespaceRule, CSSMediaRule, CSSMatrixComponent, CSSMathValue, CSSMathSum, CSSMathProduct, CSSMathNegate, CSSMathMin, CSSMathMax, CSSMathInvert, CSSKeywordValue, CSSKeyframesRule, CSSKeyframeRule, CSSImportRule, CSSImageValue, CSSGroupingRule, CSSFontFaceRule, CSSCounterStyleRule, CSSConditionRule, CSS, CDATASection, ByteLengthQueuingStrategy, BroadcastChannel, BlobEvent, Blob, BiquadFilterNode, BeforeUnloadEvent, BeforeInstallPromptEvent, BatteryManager, BaseAudioContext, BarProp, AudioWorkletNode, AudioScheduledSourceNode, AudioProcessingEvent, AudioParamMap, AudioParam, AudioNode, AudioListener, AudioDestinationNode, AudioContext, AudioBufferSourceNode, AudioBuffer, Attr, AnimationEvent, AnimationEffect, Animation, AnalyserNode, AbstractRange, AbortSignal, AbortController, window, self, document, name, location, customElements, history, locationbar, menubar, personalbar, scrollbars, statusbar, toolbar, status, closed, frames, length, top, opener, parent, frameElement, navigator, origin, external, screen, innerWidth, innerHeight, scrollX, pageXOffset, scrollY, pageYOffset, visualViewport, screenX, screenY, outerWidth, outerHeight, devicePixelRatio, event, clientInformation, offscreenBuffering, screenLeft, screenTop, defaultStatus, defaultstatus, styleMedia, onsearch, isSecureContext, performance, onappinstalled, onbeforeinstallprompt, crypto, indexedDB, webkitStorageInfo, sessionStorage, localStorage, onbeforexrselect, onabort, onblur, oncancel, oncanplay, oncanplaythrough, onchange, onclick, onclose, oncontextmenu, oncuechange, ondblclick, ondrag, ondragend, ondragenter, ondragleave, ondragover, ondragstart, ondrop, ondurationchange, onemptied, onended, onerror, onfocus, onformdata, oninput, oninvalid, onkeydown, onkeypress, onkeyup, onload, onloadeddata, onloadedmetadata, onloadstart, onmousedown, onmouseenter, onmouseleave, onmousemove, onmouseout, onmouseover, onmouseup, onmousewheel, onpause, onplay, onplaying, onprogress, onratechange, onreset, onresize, onscroll, onseeked, onseeking, onselect, onstalled, onsubmit, onsuspend, ontimeupdate, ontoggle, onvolumechange, onwaiting, onwebkitanimationend, onwebkitanimationiteration, onwebkitanimationstart, onwebkittransitionend, onwheel, onauxclick, ongotpointercapture, onlostpointercapture, onpointerdown, onpointermove, onpointerup, onpointercancel, onpointerover, onpointerout, onpointerenter, onpointerleave, onselectstart, onselectionchange, onanimationend, onanimationiteration, onanimationstart, ontransitionrun, ontransitionstart, ontransitionend, ontransitioncancel, onafterprint, onbeforeprint, onbeforeunload, onhashchange, onlanguagechange, onmessage, onmessageerror, onoffline, ononline, onpagehide, onpageshow, onpopstate, onrejectionhandled, onstorage, onunhandledrejection, onunload, alert, atob, blur, btoa, cancelAnimationFrame, cancelIdleCallback, captureEvents, clearInterval, clearTimeout, close, confirm, createImageBitmap, fetch, find, focus, getComputedStyle, getSelection, matchMedia, moveBy, moveTo, open, postMessage, print, prompt, queueMicrotask, releaseEvents, requestAnimationFrame, requestIdleCallback, resizeBy, resizeTo, scroll, scrollBy, scrollTo, setInterval, setTimeout, stop, webkitCancelAnimationFrame, webkitRequestAnimationFrame, Atomics, chrome, WebAssembly, caches, cookieStore, ondevicemotion, ondeviceorientation, ondeviceorientationabsolute, AbsoluteOrientationSensor, Accelerometer, AudioWorklet, Cache, CacheStorage, Clipboard, ClipboardItem, CookieChangeEvent, CookieStore, CookieStoreManager, Credential, CredentialsContainer, CryptoKey, DeviceMotionEvent, DeviceMotionEventAcceleration, DeviceMotionEventRotationRate, DeviceOrientationEvent, FederatedCredential, Gyroscope, Keyboard, KeyboardLayoutMap, LinearAccelerationSensor, Lock, LockManager, MIDIAccess, MIDIConnectionEvent, MIDIInput, MIDIInputMap, MIDIMessageEvent, MIDIOutput, MIDIOutputMap, MIDIPort, MediaDeviceInfo, MediaDevices, MediaKeyMessageEvent, MediaKeySession, MediaKeyStatusMap, MediaKeySystemAccess, MediaKeys, NavigationPreloadManager, NavigatorManagedData, OrientationSensor, PasswordCredential, RTCIceTransport, RelativeOrientationSensor, Sensor, SensorErrorEvent, ServiceWorker, ServiceWorkerContainer, ServiceWorkerRegistration, StorageManager, SubtleCrypto, Worklet, XRDOMOverlayState, XRLayer, XRWebGLBinding, AuthenticatorAssertionResponse, AuthenticatorAttestationResponse, AuthenticatorResponse, PublicKeyCredential, Bluetooth, BluetoothCharacteristicProperties, BluetoothDevice, BluetoothRemoteGATTCharacteristic, BluetoothRemoteGATTDescriptor, BluetoothRemoteGATTServer, BluetoothRemoteGATTService, FileSystemDirectoryHandle, FileSystemFileHandle, FileSystemHandle, FileSystemWritableFileStream, FragmentDirective, GravitySensor, HID, HIDConnectionEvent, HIDDevice, HIDInputReportEvent, OTPCredential, PaymentAddress, PaymentRequest, PaymentResponse, PaymentMethodChangeEvent, Presentation, PresentationAvailability, PresentationConnection, PresentationConnectionAvailableEvent, PresentationConnectionCloseEvent, PresentationConnectionList, PresentationReceiver, PresentationRequest, Scheduling, Serial, SerialPort, USB, USBAlternateInterface, USBConfiguration, USBConnectionEvent, USBDevice, USBEndpoint, USBInTransferResult, USBInterface, USBIsochronousInTransferPacket, USBIsochronousInTransferResult, USBIsochronousOutTransferPacket, USBIsochronousOutTransferResult, USBOutTransferResult, WakeLock, WakeLockSentinel, XRAnchor, XRAnchorSet, XRBoundedReferenceSpace, XRFrame, XRInputSource, XRInputSourceArray, XRInputSourceEvent, XRInputSourcesChangeEvent, XRPose, XRReferenceSpace, XRReferenceSpaceEvent, XRRenderState, XRRigidTransform, XRSession, XRSessionEvent, XRSpace, XRSystem, XRView, XRViewerPose, XRViewport, XRWebGLLayer, XRCPUDepthInformation, XRDepthInformation, XRWebGLDepthInformation, XRHitTestResult, XRHitTestSource, XRRay, XRTransientInputHitTestResult, XRTransientInputHitTestSource, XRLightEstimate, XRLightProbe, showDirectoryPicker, showOpenFilePicker, showSaveFilePicker, originAgentCluster, trustedTypes, speechSynthesis, onpointerrawupdate, crossOriginIsolated, AnimationPlaybackEvent, AnimationTimeline, CSSAnimation, CSSTransition, DocumentTimeline, BackgroundFetchManager, BackgroundFetchRecord, BackgroundFetchRegistration, BluetoothUUID, CustomStateSet, EventCounts, MediaMetadata, MediaSession, MediaSource, SourceBuffer, SourceBufferList, NavigatorUAData, Notification, PaymentInstruments, PaymentManager, PaymentRequestUpdateEvent, PeriodicSyncManager, PermissionStatus, Permissions, PictureInPictureEvent, PictureInPictureWindow, PushManager, PushSubscription, PushSubscriptionOptions, RemotePlayback, SharedWorker, SpeechSynthesisErrorEvent, SpeechSynthesisEvent, SpeechSynthesisUtterance, TrustedHTML, TrustedScript, TrustedScriptURL, TrustedTypePolicy, TrustedTypePolicyFactory, VideoPlaybackQuality, XSLTProcessor, webkitSpeechGrammar, webkitSpeechGrammarList, webkitSpeechRecognition, webkitSpeechRecognitionError, webkitSpeechRecognitionEvent, openDatabase, webkitRequestFileSystem, webkitResolveLocalFileSystemURL`,
		cssKeys: `cssText, length, parentRule, cssFloat, getPropertyPriority, getPropertyValue, item, removeProperty, setProperty, constructor, accent-color, align-content, align-items, align-self, alignment-baseline, animation-delay, animation-direction, animation-duration, animation-fill-mode, animation-iteration-count, animation-name, animation-play-state, animation-timing-function, appearance, backdrop-filter, backface-visibility, background-attachment, background-blend-mode, background-clip, background-color, background-image, background-origin, background-position, background-repeat, background-size, baseline-shift, block-size, border-block-end-color, border-block-end-style, border-block-end-width, border-block-start-color, border-block-start-style, border-block-start-width, border-bottom-color, border-bottom-left-radius, border-bottom-right-radius, border-bottom-style, border-bottom-width, border-collapse, border-end-end-radius, border-end-start-radius, border-image-outset, border-image-repeat, border-image-slice, border-image-source, border-image-width, border-inline-end-color, border-inline-end-style, border-inline-end-width, border-inline-start-color, border-inline-start-style, border-inline-start-width, border-left-color, border-left-style, border-left-width, border-right-color, border-right-style, border-right-width, border-start-end-radius, border-start-start-radius, border-top-color, border-top-left-radius, border-top-right-radius, border-top-style, border-top-width, bottom, box-shadow, box-sizing, break-after, break-before, break-inside, buffered-rendering, caption-side, caret-color, clear, clip, clip-path, clip-rule, color, color-interpolation, color-interpolation-filters, color-rendering, column-count, column-gap, column-rule-color, column-rule-style, column-rule-width, column-span, column-width, content, cursor, cx, cy, d, direction, display, dominant-baseline, empty-cells, fill, fill-opacity, fill-rule, filter, flex-basis, flex-direction, flex-grow, flex-shrink, flex-wrap, float, flood-color, flood-opacity, font-family, font-kerning, font-optical-sizing, font-size, font-stretch, font-style, font-variant, font-variant-caps, font-variant-east-asian, font-variant-ligatures, font-variant-numeric, font-weight, grid-auto-columns, grid-auto-flow, grid-auto-rows, grid-column-end, grid-column-start, grid-row-end, grid-row-start, grid-template-areas, grid-template-columns, grid-template-rows, height, hyphens, image-orientation, image-rendering, inline-size, inset-block-end, inset-block-start, inset-inline-end, inset-inline-start, isolation, justify-content, justify-items, justify-self, left, letter-spacing, lighting-color, line-break, line-height, list-style-image, list-style-position, list-style-type, margin-block-end, margin-block-start, margin-bottom, margin-inline-end, margin-inline-start, margin-left, margin-right, margin-top, marker-end, marker-mid, marker-start, mask-type, max-block-size, max-height, max-inline-size, max-width, min-block-size, min-height, min-inline-size, min-width, mix-blend-mode, object-fit, object-position, offset-distance, offset-path, offset-rotate, opacity, order, orphans, outline-color, outline-offset, outline-style, outline-width, overflow-anchor, overflow-clip-margin, overflow-wrap, overflow-x, overflow-y, overscroll-behavior-block, overscroll-behavior-inline, padding-block-end, padding-block-start, padding-bottom, padding-inline-end, padding-inline-start, padding-left, padding-right, padding-top, paint-order, perspective, perspective-origin, pointer-events, position, r, resize, right, row-gap, ruby-position, rx, ry, scroll-behavior, scroll-margin-block-end, scroll-margin-block-start, scroll-margin-inline-end, scroll-margin-inline-start, scroll-padding-block-end, scroll-padding-block-start, scroll-padding-inline-end, scroll-padding-inline-start, shape-image-threshold, shape-margin, shape-outside, shape-rendering, speak, stop-color, stop-opacity, stroke, stroke-dasharray, stroke-dashoffset, stroke-linecap, stroke-linejoin, stroke-miterlimit, stroke-opacity, stroke-width, tab-size, table-layout, text-align, text-align-last, text-anchor, text-decoration, text-decoration-color, text-decoration-line, text-decoration-skip-ink, text-decoration-style, text-indent, text-overflow, text-rendering, text-shadow, text-size-adjust, text-transform, text-underline-position, top, touch-action, transform, transform-origin, transform-style, transition-delay, transition-duration, transition-property, transition-timing-function, unicode-bidi, user-select, vector-effect, vertical-align, visibility, white-space, widows, width, will-change, word-break, word-spacing, writing-mode, x, y, z-index, zoom, -webkit-app-region, -webkit-border-horizontal-spacing, -webkit-border-image, -webkit-border-vertical-spacing, -webkit-box-align, -webkit-box-decoration-break, -webkit-box-direction, -webkit-box-flex, -webkit-box-ordinal-group, -webkit-box-orient, -webkit-box-pack, -webkit-box-reflect, -webkit-font-smoothing, -webkit-highlight, -webkit-hyphenate-character, -webkit-line-break, -webkit-line-clamp, -webkit-locale, -webkit-mask-box-image, -webkit-mask-box-image-outset, -webkit-mask-box-image-repeat, -webkit-mask-box-image-slice, -webkit-mask-box-image-source, -webkit-mask-box-image-width, -webkit-mask-clip, -webkit-mask-composite, -webkit-mask-image, -webkit-mask-origin, -webkit-mask-position, -webkit-mask-repeat, -webkit-mask-size, -webkit-print-color-adjust, -webkit-rtl-ordering, -webkit-tap-highlight-color, -webkit-text-combine, -webkit-text-decorations-in-effect, -webkit-text-emphasis-color, -webkit-text-emphasis-position, -webkit-text-emphasis-style, -webkit-text-fill-color, -webkit-text-orientation, -webkit-text-security, -webkit-text-stroke-color, -webkit-text-stroke-width, -webkit-user-drag, -webkit-user-modify, -webkit-writing-mode, accentColor, additiveSymbols, alignContent, alignItems, alignSelf, alignmentBaseline, all, animation, animationDelay, animationDirection, animationDuration, animationFillMode, animationIterationCount, animationName, animationPlayState, animationTimingFunction, ascentOverride, aspectRatio, backdropFilter, backfaceVisibility, background, backgroundAttachment, backgroundBlendMode, backgroundClip, backgroundColor, backgroundImage, backgroundOrigin, backgroundPosition, backgroundPositionX, backgroundPositionY, backgroundRepeat, backgroundRepeatX, backgroundRepeatY, backgroundSize, baselineShift, blockSize, border, borderBlock, borderBlockColor, borderBlockEnd, borderBlockEndColor, borderBlockEndStyle, borderBlockEndWidth, borderBlockStart, borderBlockStartColor, borderBlockStartStyle, borderBlockStartWidth, borderBlockStyle, borderBlockWidth, borderBottom, borderBottomColor, borderBottomLeftRadius, borderBottomRightRadius, borderBottomStyle, borderBottomWidth, borderCollapse, borderColor, borderEndEndRadius, borderEndStartRadius, borderImage, borderImageOutset, borderImageRepeat, borderImageSlice, borderImageSource, borderImageWidth, borderInline, borderInlineColor, borderInlineEnd, borderInlineEndColor, borderInlineEndStyle, borderInlineEndWidth, borderInlineStart, borderInlineStartColor, borderInlineStartStyle, borderInlineStartWidth, borderInlineStyle, borderInlineWidth, borderLeft, borderLeftColor, borderLeftStyle, borderLeftWidth, borderRadius, borderRight, borderRightColor, borderRightStyle, borderRightWidth, borderSpacing, borderStartEndRadius, borderStartStartRadius, borderStyle, borderTop, borderTopColor, borderTopLeftRadius, borderTopRightRadius, borderTopStyle, borderTopWidth, borderWidth, boxShadow, boxSizing, breakAfter, breakBefore, breakInside, bufferedRendering, captionSide, caretColor, clipPath, clipRule, colorInterpolation, colorInterpolationFilters, colorRendering, colorScheme, columnCount, columnFill, columnGap, columnRule, columnRuleColor, columnRuleStyle, columnRuleWidth, columnSpan, columnWidth, columns, contain, containIntrinsicSize, contentVisibility, counterIncrement, counterReset, counterSet, descentOverride, dominantBaseline, emptyCells, fallback, fillOpacity, fillRule, flex, flexBasis, flexDirection, flexFlow, flexGrow, flexShrink, flexWrap, floodColor, floodOpacity, font, fontDisplay, fontFamily, fontFeatureSettings, fontKerning, fontOpticalSizing, fontSize, fontStretch, fontStyle, fontVariant, fontVariantCaps, fontVariantEastAsian, fontVariantLigatures, fontVariantNumeric, fontVariationSettings, fontWeight, forcedColorAdjust, gap, grid, gridArea, gridAutoColumns, gridAutoFlow, gridAutoRows, gridColumn, gridColumnEnd, gridColumnGap, gridColumnStart, gridGap, gridRow, gridRowEnd, gridRowGap, gridRowStart, gridTemplate, gridTemplateAreas, gridTemplateColumns, gridTemplateRows, imageOrientation, imageRendering, inherits, initialValue, inlineSize, inset, insetBlock, insetBlockEnd, insetBlockStart, insetInline, insetInlineEnd, insetInlineStart, justifyContent, justifyItems, justifySelf, letterSpacing, lightingColor, lineBreak, lineGapOverride, lineHeight, listStyle, listStyleImage, listStylePosition, listStyleType, margin, marginBlock, marginBlockEnd, marginBlockStart, marginBottom, marginInline, marginInlineEnd, marginInlineStart, marginLeft, marginRight, marginTop, marker, markerEnd, markerMid, markerStart, mask, maskType, maxBlockSize, maxHeight, maxInlineSize, maxWidth, maxZoom, minBlockSize, minHeight, minInlineSize, minWidth, minZoom, mixBlendMode, negative, objectFit, objectPosition, offset, offsetDistance, offsetPath, offsetRotate, orientation, outline, outlineColor, outlineOffset, outlineStyle, outlineWidth, overflow, overflowAnchor, overflowClipMargin, overflowWrap, overflowX, overflowY, overscrollBehavior, overscrollBehaviorBlock, overscrollBehaviorInline, overscrollBehaviorX, overscrollBehaviorY, pad, padding, paddingBlock, paddingBlockEnd, paddingBlockStart, paddingBottom, paddingInline, paddingInlineEnd, paddingInlineStart, paddingLeft, paddingRight, paddingTop, page, pageBreakAfter, pageBreakBefore, pageBreakInside, pageOrientation, paintOrder, perspectiveOrigin, placeContent, placeItems, placeSelf, pointerEvents, prefix, quotes, range, rowGap, rubyPosition, scrollBehavior, scrollMargin, scrollMarginBlock, scrollMarginBlockEnd, scrollMarginBlockStart, scrollMarginBottom, scrollMarginInline, scrollMarginInlineEnd, scrollMarginInlineStart, scrollMarginLeft, scrollMarginRight, scrollMarginTop, scrollPadding, scrollPaddingBlock, scrollPaddingBlockEnd, scrollPaddingBlockStart, scrollPaddingBottom, scrollPaddingInline, scrollPaddingInlineEnd, scrollPaddingInlineStart, scrollPaddingLeft, scrollPaddingRight, scrollPaddingTop, scrollSnapAlign, scrollSnapStop, scrollSnapType, shapeImageThreshold, shapeMargin, shapeOutside, shapeRendering, size, sizeAdjust, speakAs, src, stopColor, stopOpacity, strokeDasharray, strokeDashoffset, strokeLinecap, strokeLinejoin, strokeMiterlimit, strokeOpacity, strokeWidth, suffix, symbols, syntax, system, tabSize, tableLayout, textAlign, textAlignLast, textAnchor, textCombineUpright, textDecoration, textDecorationColor, textDecorationLine, textDecorationSkipInk, textDecorationStyle, textDecorationThickness, textIndent, textOrientation, textOverflow, textRendering, textShadow, textSizeAdjust, textTransform, textUnderlineOffset, textUnderlinePosition, touchAction, transformBox, transformOrigin, transformStyle, transition, transitionDelay, transitionDuration, transitionProperty, transitionTimingFunction, unicodeBidi, unicodeRange, userSelect, userZoom, vectorEffect, verticalAlign, webkitAlignContent, webkitAlignItems, webkitAlignSelf, webkitAnimation, webkitAnimationDelay, webkitAnimationDirection, webkitAnimationDuration, webkitAnimationFillMode, webkitAnimationIterationCount, webkitAnimationName, webkitAnimationPlayState, webkitAnimationTimingFunction, webkitAppRegion, webkitAppearance, webkitBackfaceVisibility, webkitBackgroundClip, webkitBackgroundOrigin, webkitBackgroundSize, webkitBorderAfter, webkitBorderAfterColor, webkitBorderAfterStyle, webkitBorderAfterWidth, webkitBorderBefore, webkitBorderBeforeColor, webkitBorderBeforeStyle, webkitBorderBeforeWidth, webkitBorderBottomLeftRadius, webkitBorderBottomRightRadius, webkitBorderEnd, webkitBorderEndColor, webkitBorderEndStyle, webkitBorderEndWidth, webkitBorderHorizontalSpacing, webkitBorderImage, webkitBorderRadius, webkitBorderStart, webkitBorderStartColor, webkitBorderStartStyle, webkitBorderStartWidth, webkitBorderTopLeftRadius, webkitBorderTopRightRadius, webkitBorderVerticalSpacing, webkitBoxAlign, webkitBoxDecorationBreak, webkitBoxDirection, webkitBoxFlex, webkitBoxOrdinalGroup, webkitBoxOrient, webkitBoxPack, webkitBoxReflect, webkitBoxShadow, webkitBoxSizing, webkitClipPath, webkitColumnBreakAfter, webkitColumnBreakBefore, webkitColumnBreakInside, webkitColumnCount, webkitColumnGap, webkitColumnRule, webkitColumnRuleColor, webkitColumnRuleStyle, webkitColumnRuleWidth, webkitColumnSpan, webkitColumnWidth, webkitColumns, webkitFilter, webkitFlex, webkitFlexBasis, webkitFlexDirection, webkitFlexFlow, webkitFlexGrow, webkitFlexShrink, webkitFlexWrap, webkitFontFeatureSettings, webkitFontSmoothing, webkitHighlight, webkitHyphenateCharacter, webkitJustifyContent, webkitLineBreak, webkitLineClamp, webkitLocale, webkitLogicalHeight, webkitLogicalWidth, webkitMarginAfter, webkitMarginBefore, webkitMarginEnd, webkitMarginStart, webkitMask, webkitMaskBoxImage, webkitMaskBoxImageOutset, webkitMaskBoxImageRepeat, webkitMaskBoxImageSlice, webkitMaskBoxImageSource, webkitMaskBoxImageWidth, webkitMaskClip, webkitMaskComposite, webkitMaskImage, webkitMaskOrigin, webkitMaskPosition, webkitMaskPositionX, webkitMaskPositionY, webkitMaskRepeat, webkitMaskRepeatX, webkitMaskRepeatY, webkitMaskSize, webkitMaxLogicalHeight, webkitMaxLogicalWidth, webkitMinLogicalHeight, webkitMinLogicalWidth, webkitOpacity, webkitOrder, webkitPaddingAfter, webkitPaddingBefore, webkitPaddingEnd, webkitPaddingStart, webkitPerspective, webkitPerspectiveOrigin, webkitPerspectiveOriginX, webkitPerspectiveOriginY, webkitPrintColorAdjust, webkitRtlOrdering, webkitRubyPosition, webkitShapeImageThreshold, webkitShapeMargin, webkitShapeOutside, webkitTapHighlightColor, webkitTextCombine, webkitTextDecorationsInEffect, webkitTextEmphasis, webkitTextEmphasisColor, webkitTextEmphasisPosition, webkitTextEmphasisStyle, webkitTextFillColor, webkitTextOrientation, webkitTextSecurity, webkitTextSizeAdjust, webkitTextStroke, webkitTextStrokeColor, webkitTextStrokeWidth, webkitTransform, webkitTransformOrigin, webkitTransformOriginX, webkitTransformOriginY, webkitTransformOriginZ, webkitTransformStyle, webkitTransition, webkitTransitionDelay, webkitTransitionDuration, webkitTransitionProperty, webkitTransitionTimingFunction, webkitUserDrag, webkitUserModify, webkitUserSelect, webkitWritingMode, whiteSpace, willChange, wordBreak, wordSpacing, wordWrap, writingMode, zIndex, additive-symbols, ascent-override, aspect-ratio, background-position-x, background-position-y, background-repeat-x, background-repeat-y, border-block, border-block-color, border-block-end, border-block-start, border-block-style, border-block-width, border-bottom, border-color, border-image, border-inline, border-inline-color, border-inline-end, border-inline-start, border-inline-style, border-inline-width, border-left, border-radius, border-right, border-spacing, border-style, border-top, border-width, color-scheme, column-fill, column-rule, contain-intrinsic-size, content-visibility, counter-increment, counter-reset, counter-set, descent-override, flex-flow, font-display, font-feature-settings, font-variation-settings, forced-color-adjust, grid-area, grid-column, grid-column-gap, grid-gap, grid-row, grid-row-gap, grid-template, initial-value, inset-block, inset-inline, line-gap-override, list-style, margin-block, margin-inline, max-zoom, min-zoom, overscroll-behavior, overscroll-behavior-x, overscroll-behavior-y, padding-block, padding-inline, page-break-after, page-break-before, page-break-inside, page-orientation, place-content, place-items, place-self, scroll-margin, scroll-margin-block, scroll-margin-bottom, scroll-margin-inline, scroll-margin-left, scroll-margin-right, scroll-margin-top, scroll-padding, scroll-padding-block, scroll-padding-bottom, scroll-padding-inline, scroll-padding-left, scroll-padding-right, scroll-padding-top, scroll-snap-align, scroll-snap-stop, scroll-snap-type, size-adjust, speak-as, text-combine-upright, text-decoration-thickness, text-orientation, text-underline-offset, transform-box, unicode-range, user-zoom, -webkit-align-content, -webkit-align-items, -webkit-align-self, -webkit-animation, -webkit-animation-delay, -webkit-animation-direction, -webkit-animation-duration, -webkit-animation-fill-mode, -webkit-animation-iteration-count, -webkit-animation-name, -webkit-animation-play-state, -webkit-animation-timing-function, -webkit-appearance, -webkit-backface-visibility, -webkit-background-clip, -webkit-background-origin, -webkit-background-size, -webkit-border-after, -webkit-border-after-color, -webkit-border-after-style, -webkit-border-after-width, -webkit-border-before, -webkit-border-before-color, -webkit-border-before-style, -webkit-border-before-width, -webkit-border-bottom-left-radius, -webkit-border-bottom-right-radius, -webkit-border-end, -webkit-border-end-color, -webkit-border-end-style, -webkit-border-end-width, -webkit-border-radius, -webkit-border-start, -webkit-border-start-color, -webkit-border-start-style, -webkit-border-start-width, -webkit-border-top-left-radius, -webkit-border-top-right-radius, -webkit-box-shadow, -webkit-box-sizing, -webkit-clip-path, -webkit-column-break-after, -webkit-column-break-before, -webkit-column-break-inside, -webkit-column-count, -webkit-column-gap, -webkit-column-rule, -webkit-column-rule-color, -webkit-column-rule-style, -webkit-column-rule-width, -webkit-column-span, -webkit-column-width, -webkit-columns, -webkit-filter, -webkit-flex, -webkit-flex-basis, -webkit-flex-direction, -webkit-flex-flow, -webkit-flex-grow, -webkit-flex-shrink, -webkit-flex-wrap, -webkit-font-feature-settings, -webkit-justify-content, -webkit-logical-height, -webkit-logical-width, -webkit-margin-after, -webkit-margin-before, -webkit-margin-end, -webkit-margin-start, -webkit-mask, -webkit-mask-position-x, -webkit-mask-position-y, -webkit-mask-repeat-x, -webkit-mask-repeat-y, -webkit-max-logical-height, -webkit-max-logical-width, -webkit-min-logical-height, -webkit-min-logical-width, -webkit-opacity, -webkit-order, -webkit-padding-after, -webkit-padding-before, -webkit-padding-end, -webkit-padding-start, -webkit-perspective, -webkit-perspective-origin, -webkit-perspective-origin-x, -webkit-perspective-origin-y, -webkit-ruby-position, -webkit-shape-image-threshold, -webkit-shape-margin, -webkit-shape-outside, -webkit-text-emphasis, -webkit-text-size-adjust, -webkit-text-stroke, -webkit-transform, -webkit-transform-origin, -webkit-transform-origin-x, -webkit-transform-origin-y, -webkit-transform-origin-z, -webkit-transform-style, -webkit-transition, -webkit-transition-delay, -webkit-transition-duration, -webkit-transition-property, -webkit-transition-timing-function, -webkit-user-select, word-wrap`
	},
	'Firefox': {
		version: 91,
		windowKeys: `undefined, globalThis, Array, Boolean, JSON, Date, Math, Number, String, RegExp, Error, InternalError, AggregateError, EvalError, RangeError, ReferenceError, SyntaxError, TypeError, URIError, ArrayBuffer, Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array, Uint8ClampedArray, BigInt64Array, BigUint64Array, BigInt, Proxy, WeakMap, Set, DataView, Symbol, Intl, Reflect, WeakSet, Atomics, Promise, ReadableStream, ByteLengthQueuingStrategy, CountQueuingStrategy, WebAssembly, FinalizationRegistry, WeakRef, NaN, Infinity, isNaN, isFinite, parseFloat, parseInt, escape, unescape, decodeURI, encodeURI, decodeURIComponent, encodeURIComponent, SVGCircleElement, CanvasPattern, AudioWorklet, MimeType, PageTransitionEvent, SecurityPolicyViolationEvent, HTMLSourceElement, CSSPageRule, CanvasRenderingContext2D, HTMLOptGroupElement, WebGLShaderPrecisionFormat, Screen, TimeRanges, SVGForeignObjectElement, PopupBlockedEvent, SVGFEDistantLightElement, RTCDataChannelEvent, SVGFEDisplacementMapElement, SVGDefsElement, CSSMediaRule, CharacterData, HTMLAllCollection, ConstantSourceNode, HTMLFieldSetElement, ScreenOrientation, FontFace, SVGNumber, TextTrack, SpeechSynthesisEvent, SourceBufferList, DocumentTimeline, History, WebGLSync, ProgressEvent, SVGFECompositeElement, SVGGradientElement, HTMLTableSectionElement, SVGFETileElement, DOMPointReadOnly, WheelEvent, FileReader, AudioBufferSourceNode, SVGDescElement, TextMetrics, SVGFEFuncBElement, CSSMozDocumentRule, GeolocationPosition, Request, HTMLBRElement, DOMRequest, ServiceWorker, HTMLDetailsElement, AudioListener, HTMLElement, IDBOpenDBRequest, HTMLParagraphElement, SVGAnimatedRect, SVGAnimatedLength, DataTransfer, Cache, MessageChannel, WebGLProgram, DOMRectReadOnly, URLSearchParams, HTMLImageElement, SVGUseElement, MediaMetadata, MediaRecorder, RTCCertificate, PopStateEvent, SVGFEMergeElement, RTCIceCandidate, SVGFEFuncRElement, HTMLAudioElement, StorageEvent, OfflineResourceList, NodeList, HTMLCollection, mozRTCIceCandidate, HTMLOptionElement, PublicKeyCredential, SVGFEImageElement, AudioProcessingEvent, XPathResult, HTMLTemplateElement, AudioDestinationNode, SVGFEPointLightElement, SVGStyleElement, AbortController, Comment, DOMQuad, HTMLModElement, SVGMPathElement, WebSocket, RTCTrackEvent, HTMLFrameElement, Navigator, SVGImageElement, HTMLMapElement, MutationRecord, AuthenticatorAttestationResponse, SVGAnimatedPreserveAspectRatio, MediaStreamEvent, ImageBitmap, VRDisplayEvent, StaticRange, CSSImportRule, MutationEvent, SVGFEMorphologyElement, CSSFontFeatureValuesRule, SVGLength, OfflineAudioContext, DOMStringList, HTMLObjectElement, WebGLTransformFeedback, IDBKeyRange, Element, SVGFEComponentTransferElement, TimeEvent, ChannelMergerNode, SVGAnimatedTransformList, VTTCue, RTCDtlsTransport, WebGLVertexArrayObject, webkitURL, RTCPeerConnection, Gamepad, DOMMatrix, CSSRule, SVGAElement, HTMLTrackElement, MediaKeySession, XSLTProcessor, CSSStyleDeclaration, IDBObjectStore, AudioNode, SVGFEColorMatrixElement, DOMParser, SpeechSynthesisVoice, SVGGeometryElement, AudioContext, Worklet, SpeechSynthesisErrorEvent, CanvasCaptureMediaStream, ServiceWorkerRegistration, PaintRequest, SVGAnimatedBoolean, Headers, PushSubscriptionOptions, PannerNode, SVGFEFuncAElement, HTMLAnchorElement, MediaRecorderErrorEvent, WebGL2RenderingContext, HTMLCanvasElement, WebGLBuffer, SVGSymbolElement, DOMTokenList, DOMRect, WebKitCSSMatrix, IDBTransaction, CredentialsContainer, AudioBuffer, PerformanceObserverEntryList, SVGAnimateTransformElement, CSSRuleList, SVGFESpotLightElement, MediaSource, AnimationPlaybackEvent, ScrollAreaEvent, HTMLTextAreaElement, FormDataEvent, HTMLBaseElement, SVGStringList, SVGClipPathElement, AbortSignal, MediaCapabilities, Option, HTMLMenuElement, BroadcastChannel, DOMImplementation, FileSystem, PerformanceEntry, HTMLTableRowElement, SVGPolylineElement, CSSSupportsRule, SVGLinearGradientElement, FontFaceSetLoadEvent, HTMLSlotElement, IIRFilterNode, VTTRegion, TextDecoder, HTMLTableElement, SVGAnimateMotionElement, BaseAudioContext, SVGTextElement, PerformanceEventTiming, DelayNode, DOMPoint, DeviceOrientationEvent, IDBMutableFile, SpeechSynthesisUtterance, Notification, MediaStreamTrack, TransitionEvent, SVGAnimatedString, SVGFEDiffuseLightingElement, VRFrameData, HTMLPictureElement, SVGTransform, MediaEncryptedEvent, HTMLQuoteElement, HTMLInputElement, WebGLContextEvent, SVGFEGaussianBlurElement, MediaQueryListEvent, XMLDocument, HTMLSpanElement, WebGLRenderbuffer, TextEncoder, RTCDTMFSender, HTMLDivElement, ImageBitmapRenderingContext, SVGAnimatedEnumeration, WebGLQuery, CSS, CanvasGradient, WebGLActiveInfo, PerformanceServerTiming, FontFaceSet, ScriptProcessorNode, SVGAnimatedNumberList, SVGFEConvolveMatrixElement, HTMLDListElement, AudioParamMap, WebGLTexture, CSSTransition, HTMLLinkElement, TextTrackCue, SVGLengthList, console, XPathEvaluator, ShadowRoot, IntersectionObserverEntry, MouseEvent, Geolocation, NamedNodeMap, DocumentType, HTMLTableCellElement, HTMLProgressElement, IDBCursorWithValue, SVGMatrix, MediaDevices, PerformanceNavigation, PaintRequestList, SVGAnimateElement, Range, SVGAnimatedLengthList, TextTrackList, FileList, AbstractRange, DynamicsCompressorNode, IDBRequest, FileSystemDirectoryReader, MediaStreamTrackAudioSourceNode, WebGLShader, VRFieldOfView, HTMLFormElement, CompositionEvent, Directory, PerformancePaintTiming, VRDisplayCapabilities, RTCRtpSender, HTMLHeadingElement, ValidityState, GainNode, HTMLMetaElement, DocumentFragment, SVGPathSegList, EventSource, HTMLIFrameElement, PointerEvent, SVGTSpanElement, BiquadFilterNode, Storage, SVGPathElement, SVGGElement, AnalyserNode, WebGLRenderingContext, IdleDeadline, SVGPreserveAspectRatio, CSSConditionRule, MediaQueryList, HTMLOptionsCollection, HTMLDataListElement, MediaKeyMessageEvent, StyleSheetList, HTMLUListElement, PerformanceMark, TextTrackCueList, HTMLLIElement, HTMLTableCaptionElement, GeolocationPositionError, SharedWorker, NodeIterator, HTMLOListElement, U2F, XMLSerializer, RTCRtpTransceiver, HTMLLegendElement, CryptoKey, CacheStorage, NodeFilter, SVGAnimatedInteger, HTMLHtmlElement, WebGLUniformLocation, HTMLMarqueeElement, SVGPatternElement, IDBCursor, HTMLFormControlsCollection, HTMLHeadElement, HTMLSelectElement, MediaElementAudioSourceNode, HTMLBodyElement, Blob, SVGFilterElement, HTMLMeterElement, SVGSetElement, SVGGraphicsElement, File, CSSStyleRule, IDBFileRequest, SVGLineElement, PushManager, TrackEvent, PeriodicWave, RadioNodeList, XPathExpression, VREyeParameters, MediaKeyStatusMap, GeolocationCoordinates, IDBDatabase, DeviceMotionEvent, MediaKeyError, ServiceWorkerContainer, GamepadButton, AudioScheduledSourceNode, MessagePort, SVGAnimatedNumber, SVGMarkerElement, BeforeUnloadEvent, TreeWalker, FileSystemDirectoryEntry, Permissions, SVGFESpecularLightingElement, SVGAnimatedAngle, DOMRectList, SVGSwitchElement, IDBFactory, SVGPolygonElement, SVGFEBlendElement, GamepadHapticActuator, Animation, CSSFontFaceRule, HTMLLabelElement, SVGRect, PerformanceMeasure, SVGNumberList, ResizeObserverSize, HTMLAreaElement, OscillatorNode, SVGStopElement, SVGViewElement, RTCSessionDescription, MediaKeySystemAccess, SVGElement, Text, mozRTCSessionDescription, HTMLButtonElement, SVGFEDropShadowElement, AnimationEvent, Image, WaveShaperNode, MediaCapabilitiesInfo, HTMLTableColElement, KeyEvent, DOMMatrixReadOnly, CDATASection, SVGTextContentElement, PluginArray, XMLHttpRequest, VRDisplay, Credential, HashChangeEvent, DataTransferItemList, AnimationTimeline, ChannelSplitterNode, MediaStream, HTMLMediaElement, VRPose, Crypto, CSSKeyframesRule, FileSystemFileEntry, AudioWorkletNode, Response, XMLHttpRequestEventTarget, HTMLScriptElement, HTMLTitleElement, KeyboardEvent, Plugin, HTMLOutputElement, MediaSession, DragEvent, FormData, PromiseRejectionEvent, DOMStringMap, InputEvent, CSSStyleSheet, SpeechSynthesis, CSSAnimation, AuthenticatorAssertionResponse, GamepadPose, SubtleCrypto, Audio, VisualViewport, PerformanceResourceTiming, RTCStatsReport, SVGPoint, StereoPannerNode, WebGLFramebuffer, SVGComponentTransferFunctionElement, PerformanceTiming, RTCRtpReceiver, SVGFETurbulenceElement, Path2D, CSSGroupingRule, PushSubscription, URL, CustomElementRegistry, MathMLElement, SVGScriptElement, Clipboard, SVGTextPositioningElement, StorageManager, MediaStreamAudioSourceNode, HTMLHRElement, SVGEllipseElement, WebGLSampler, CSSCounterStyleRule, RTCDTMFToneChangeEvent, SourceBuffer, SVGTextPathElement, AudioParam, MediaList, SVGRectElement, SVGAngle, HTMLPreElement, Selection, SVGUnitTypes, PermissionStatus, BlobEvent, RTCPeerConnectionIceEvent, MediaStreamTrackEvent, Attr, Location, MediaKeys, CustomEvent, SVGFEMergeNodeElement, GamepadEvent, VideoPlaybackQuality, Worker, ClipboardEvent, HTMLEmbedElement, PerformanceObserver, HTMLDirectoryElement, HTMLFrameSetElement, HTMLVideoElement, MutationObserver, SVGFEFloodElement, CloseEvent, IDBIndex, IDBFileHandle, DataTransferItem, CSSKeyframeRule, SVGRadialGradientElement, SVGAnimationElement, MimeTypeArray, CaretPosition, SVGMaskElement, MediaError, BarProp, ResizeObserver, SVGTitleElement, SVGPointList, HTMLStyleElement, UIEvent, DOMException, ImageData, XMLHttpRequestUpload, CSS2Properties, IDBVersionChangeEvent, ResizeObserverEntry, mozRTCPeerConnection, FocusEvent, HTMLDataElement, VRStageParameters, FileSystemEntry, SVGFEFuncGElement, MessageEvent, AuthenticatorResponse, SVGFEOffsetElement, ProcessingInstruction, RTCDataChannel, AnimationEffect, MediaStreamAudioDestinationNode, StyleSheet, SubmitEvent, ConvolverNode, IntersectionObserver, SVGSVGElement, OfflineAudioCompletionEvent, KeyframeEffect, MouseScrollEvent, CSSNamespaceRule, HTMLFontElement, ErrorEvent, MediaDeviceInfo, HTMLParamElement, SVGTransformList, HTMLUnknownElement, HTMLTimeElement, SVGMetadataElement, Function, Object, eval, EventTarget, Window, close, stop, focus, blur, open, alert, confirm, prompt, print, postMessage, captureEvents, releaseEvents, getSelection, getComputedStyle, matchMedia, moveTo, moveBy, resizeTo, resizeBy, scroll, scrollTo, scrollBy, requestAnimationFrame, cancelAnimationFrame, getDefaultComputedStyle, scrollByLines, scrollByPages, sizeToContent, updateCommands, find, dump, setResizable, requestIdleCallback, cancelIdleCallback, btoa, atob, setTimeout, clearTimeout, setInterval, clearInterval, queueMicrotask, createImageBitmap, fetch, self, name, history, customElements, locationbar, menubar, personalbar, scrollbars, statusbar, toolbar, status, closed, event, frames, length, opener, parent, frameElement, navigator, clientInformation, external, applicationCache, screen, innerWidth, innerHeight, scrollX, pageXOffset, scrollY, pageYOffset, screenLeft, screenTop, screenX, screenY, outerWidth, outerHeight, performance, mozInnerScreenX, mozInnerScreenY, devicePixelRatio, scrollMaxX, scrollMaxY, fullScreen, ondevicemotion, ondeviceorientation, onabsolutedeviceorientation, content, InstallTrigger, sidebar, onvrdisplayconnect, onvrdisplaydisconnect, onvrdisplayactivate, onvrdisplaydeactivate, onvrdisplaypresentchange, visualViewport, crypto, onabort, onblur, onfocus, onauxclick, onbeforeinput, oncanplay, oncanplaythrough, onchange, onclick, onclose, oncontextmenu, oncuechange, ondblclick, ondrag, ondragend, ondragenter, ondragexit, ondragleave, ondragover, ondragstart, ondrop, ondurationchange, onemptied, onended, onformdata, oninput, oninvalid, onkeydown, onkeypress, onkeyup, onload, onloadeddata, onloadedmetadata, onloadend, onloadstart, onmousedown, onmouseenter, onmouseleave, onmousemove, onmouseout, onmouseover, onmouseup, onwheel, onpause, onplay, onplaying, onprogress, onratechange, onreset, onresize, onscroll, onseeked, onseeking, onselect, onstalled, onsubmit, onsuspend, ontimeupdate, onvolumechange, onwaiting, onselectstart, ontoggle, onpointercancel, onpointerdown, onpointerup, onpointermove, onpointerout, onpointerover, onpointerenter, onpointerleave, ongotpointercapture, onlostpointercapture, onmozfullscreenchange, onmozfullscreenerror, onanimationcancel, onanimationend, onanimationiteration, onanimationstart, ontransitioncancel, ontransitionend, ontransitionrun, ontransitionstart, onwebkitanimationend, onwebkitanimationiteration, onwebkitanimationstart, onwebkittransitionend, u2f, onerror, speechSynthesis, onafterprint, onbeforeprint, onbeforeunload, onhashchange, onlanguagechange, onmessage, onmessageerror, onoffline, ononline, onpagehide, onpageshow, onpopstate, onrejectionhandled, onstorage, onunhandledrejection, onunload, ongamepadconnected, ongamepaddisconnected, localStorage, origin, crossOriginIsolated, isSecureContext, indexedDB, caches, sessionStorage, window, document, location, top, netscape, Node, Document, HTMLDocument, EventCounts, Map, Event`,
		cssKeys: `alignContent, align-content, alignItems, align-items, alignSelf, align-self, aspectRatio, aspect-ratio, backfaceVisibility, backface-visibility, borderCollapse, border-collapse, borderImageRepeat, border-image-repeat, boxDecorationBreak, box-decoration-break, boxSizing, box-sizing, breakInside, break-inside, captionSide, caption-side, clear, colorAdjust, color-adjust, colorInterpolation, color-interpolation, colorInterpolationFilters, color-interpolation-filters, columnCount, column-count, columnFill, column-fill, columnSpan, column-span, contain, direction, display, dominantBaseline, dominant-baseline, emptyCells, empty-cells, flexDirection, flex-direction, flexWrap, flex-wrap, cssFloat, float, fontKerning, font-kerning, fontOpticalSizing, font-optical-sizing, fontSizeAdjust, font-size-adjust, fontStretch, font-stretch, fontStyle, font-style, fontSynthesis, font-synthesis, fontVariantCaps, font-variant-caps, fontVariantEastAsian, font-variant-east-asian, fontVariantLigatures, font-variant-ligatures, fontVariantNumeric, font-variant-numeric, fontVariantPosition, font-variant-position, fontWeight, font-weight, gridAutoFlow, grid-auto-flow, hyphens, imageOrientation, image-orientation, imageRendering, image-rendering, imeMode, ime-mode, isolation, justifyContent, justify-content, justifyItems, justify-items, justifySelf, justify-self, lineBreak, line-break, listStylePosition, list-style-position, maskType, mask-type, mixBlendMode, mix-blend-mode, MozBoxAlign, -moz-box-align, MozBoxDirection, -moz-box-direction, MozBoxOrient, -moz-box-orient, MozBoxPack, -moz-box-pack, MozFloatEdge, -moz-float-edge, MozForceBrokenImageIcon, -moz-force-broken-image-icon, MozOrient, -moz-orient, MozTextSizeAdjust, -moz-text-size-adjust, MozUserFocus, -moz-user-focus, MozUserInput, -moz-user-input, MozUserModify, -moz-user-modify, MozWindowDragging, -moz-window-dragging, objectFit, object-fit, offsetRotate, offset-rotate, outlineStyle, outline-style, overflowAnchor, overflow-anchor, overflowWrap, overflow-wrap, paintOrder, paint-order, pointerEvents, pointer-events, position, resize, rubyAlign, ruby-align, rubyPosition, ruby-position, scrollBehavior, scroll-behavior, scrollSnapAlign, scroll-snap-align, scrollSnapType, scroll-snap-type, scrollbarWidth, scrollbar-width, shapeRendering, shape-rendering, strokeLinecap, stroke-linecap, strokeLinejoin, stroke-linejoin, tableLayout, table-layout, textAlign, text-align, textAlignLast, text-align-last, textAnchor, text-anchor, textCombineUpright, text-combine-upright, textDecorationLine, text-decoration-line, textDecorationSkipInk, text-decoration-skip-ink, textDecorationStyle, text-decoration-style, textEmphasisPosition, text-emphasis-position, textJustify, text-justify, textOrientation, text-orientation, textRendering, text-rendering, textTransform, text-transform, textUnderlinePosition, text-underline-position, touchAction, touch-action, transformBox, transform-box, transformStyle, transform-style, unicodeBidi, unicode-bidi, userSelect, user-select, vectorEffect, vector-effect, visibility, webkitLineClamp, WebkitLineClamp, -webkit-line-clamp, whiteSpace, white-space, wordBreak, word-break, writingMode, writing-mode, zIndex, z-index, appearance, breakAfter, break-after, breakBefore, break-before, clipRule, clip-rule, fillRule, fill-rule, fillOpacity, fill-opacity, strokeOpacity, stroke-opacity, MozBoxOrdinalGroup, -moz-box-ordinal-group, order, flexGrow, flex-grow, flexShrink, flex-shrink, MozBoxFlex, -moz-box-flex, strokeMiterlimit, stroke-miterlimit, overflowBlock, overflow-block, overflowInline, overflow-inline, overflowX, overflow-x, overflowY, overflow-y, overscrollBehaviorBlock, overscroll-behavior-block, overscrollBehaviorInline, overscroll-behavior-inline, overscrollBehaviorX, overscroll-behavior-x, overscrollBehaviorY, overscroll-behavior-y, floodOpacity, flood-opacity, opacity, shapeImageThreshold, shape-image-threshold, stopOpacity, stop-opacity, borderBlockEndStyle, border-block-end-style, borderBlockStartStyle, border-block-start-style, borderBottomStyle, border-bottom-style, borderInlineEndStyle, border-inline-end-style, borderInlineStartStyle, border-inline-start-style, borderLeftStyle, border-left-style, borderRightStyle, border-right-style, borderTopStyle, border-top-style, columnRuleStyle, column-rule-style, animationDelay, animation-delay, animationDirection, animation-direction, animationDuration, animation-duration, animationFillMode, animation-fill-mode, animationIterationCount, animation-iteration-count, animationName, animation-name, animationPlayState, animation-play-state, animationTimingFunction, animation-timing-function, backgroundAttachment, background-attachment, backgroundBlendMode, background-blend-mode, backgroundClip, background-clip, backgroundImage, background-image, backgroundOrigin, background-origin, backgroundPositionX, background-position-x, backgroundPositionY, background-position-y, backgroundRepeat, background-repeat, backgroundSize, background-size, borderImageOutset, border-image-outset, borderImageSlice, border-image-slice, borderImageWidth, border-image-width, borderSpacing, border-spacing, boxShadow, box-shadow, caretColor, caret-color, clipPath, clip-path, color, columnWidth, column-width, content, counterIncrement, counter-increment, cursor, filter, flexBasis, flex-basis, fontFamily, font-family, fontFeatureSettings, font-feature-settings, fontLanguageOverride, font-language-override, fontSize, font-size, fontVariantAlternates, font-variant-alternates, fontVariationSettings, font-variation-settings, gridTemplateAreas, grid-template-areas, letterSpacing, letter-spacing, lineHeight, line-height, listStyleType, list-style-type, maskClip, mask-clip, maskComposite, mask-composite, maskImage, mask-image, maskMode, mask-mode, maskOrigin, mask-origin, maskPositionX, mask-position-x, maskPositionY, mask-position-y, maskRepeat, mask-repeat, maskSize, mask-size, offsetAnchor, offset-anchor, offsetPath, offset-path, perspective, quotes, rotate, scale, scrollbarColor, scrollbar-color, shapeOutside, shape-outside, strokeDasharray, stroke-dasharray, strokeDashoffset, stroke-dashoffset, strokeWidth, stroke-width, tabSize, tab-size, textDecorationThickness, text-decoration-thickness, textEmphasisStyle, text-emphasis-style, textOverflow, text-overflow, textShadow, text-shadow, transitionDelay, transition-delay, transitionDuration, transition-duration, transitionProperty, transition-property, transitionTimingFunction, transition-timing-function, translate, verticalAlign, vertical-align, willChange, will-change, wordSpacing, word-spacing, clip, MozImageRegion, -moz-image-region, objectPosition, object-position, perspectiveOrigin, perspective-origin, fill, stroke, transformOrigin, transform-origin, counterReset, counter-reset, counterSet, counter-set, gridTemplateColumns, grid-template-columns, gridTemplateRows, grid-template-rows, borderImageSource, border-image-source, listStyleImage, list-style-image, gridAutoColumns, grid-auto-columns, gridAutoRows, grid-auto-rows, transform, columnGap, column-gap, rowGap, row-gap, markerEnd, marker-end, markerMid, marker-mid, markerStart, marker-start, gridColumnEnd, grid-column-end, gridColumnStart, grid-column-start, gridRowEnd, grid-row-end, gridRowStart, grid-row-start, maxBlockSize, max-block-size, maxHeight, max-height, maxInlineSize, max-inline-size, maxWidth, max-width, cx, cy, offsetDistance, offset-distance, textIndent, text-indent, x, y, borderBottomLeftRadius, border-bottom-left-radius, borderBottomRightRadius, border-bottom-right-radius, borderEndEndRadius, border-end-end-radius, borderEndStartRadius, border-end-start-radius, borderStartEndRadius, border-start-end-radius, borderStartStartRadius, border-start-start-radius, borderTopLeftRadius, border-top-left-radius, borderTopRightRadius, border-top-right-radius, blockSize, block-size, height, inlineSize, inline-size, minBlockSize, min-block-size, minHeight, min-height, minInlineSize, min-inline-size, minWidth, min-width, width, outlineOffset, outline-offset, scrollMarginBlockEnd, scroll-margin-block-end, scrollMarginBlockStart, scroll-margin-block-start, scrollMarginBottom, scroll-margin-bottom, scrollMarginInlineEnd, scroll-margin-inline-end, scrollMarginInlineStart, scroll-margin-inline-start, scrollMarginLeft, scroll-margin-left, scrollMarginRight, scroll-margin-right, scrollMarginTop, scroll-margin-top, paddingBlockEnd, padding-block-end, paddingBlockStart, padding-block-start, paddingBottom, padding-bottom, paddingInlineEnd, padding-inline-end, paddingInlineStart, padding-inline-start, paddingLeft, padding-left, paddingRight, padding-right, paddingTop, padding-top, r, shapeMargin, shape-margin, rx, ry, scrollPaddingBlockEnd, scroll-padding-block-end, scrollPaddingBlockStart, scroll-padding-block-start, scrollPaddingBottom, scroll-padding-bottom, scrollPaddingInlineEnd, scroll-padding-inline-end, scrollPaddingInlineStart, scroll-padding-inline-start, scrollPaddingLeft, scroll-padding-left, scrollPaddingRight, scroll-padding-right, scrollPaddingTop, scroll-padding-top, borderBlockEndWidth, border-block-end-width, borderBlockStartWidth, border-block-start-width, borderBottomWidth, border-bottom-width, borderInlineEndWidth, border-inline-end-width, borderInlineStartWidth, border-inline-start-width, borderLeftWidth, border-left-width, borderRightWidth, border-right-width, borderTopWidth, border-top-width, columnRuleWidth, column-rule-width, outlineWidth, outline-width, webkitTextStrokeWidth, WebkitTextStrokeWidth, -webkit-text-stroke-width, bottom, insetBlockEnd, inset-block-end, insetBlockStart, inset-block-start, insetInlineEnd, inset-inline-end, insetInlineStart, inset-inline-start, left, marginBlockEnd, margin-block-end, marginBlockStart, margin-block-start, marginBottom, margin-bottom, marginInlineEnd, margin-inline-end, marginInlineStart, margin-inline-start, marginLeft, margin-left, marginRight, margin-right, marginTop, margin-top, right, textUnderlineOffset, text-underline-offset, top, backgroundColor, background-color, borderBlockEndColor, border-block-end-color, borderBlockStartColor, border-block-start-color, borderBottomColor, border-bottom-color, borderInlineEndColor, border-inline-end-color, borderInlineStartColor, border-inline-start-color, borderLeftColor, border-left-color, borderRightColor, border-right-color, borderTopColor, border-top-color, columnRuleColor, column-rule-color, floodColor, flood-color, lightingColor, lighting-color, outlineColor, outline-color, stopColor, stop-color, textDecorationColor, text-decoration-color, textEmphasisColor, text-emphasis-color, webkitTextFillColor, WebkitTextFillColor, -webkit-text-fill-color, webkitTextStrokeColor, WebkitTextStrokeColor, -webkit-text-stroke-color, background, backgroundPosition, background-position, borderColor, border-color, borderStyle, border-style, borderWidth, border-width, borderTop, border-top, borderRight, border-right, borderBottom, border-bottom, borderLeft, border-left, borderBlockStart, border-block-start, borderBlockEnd, border-block-end, borderInlineStart, border-inline-start, borderInlineEnd, border-inline-end, border, borderRadius, border-radius, borderImage, border-image, borderBlockWidth, border-block-width, borderBlockStyle, border-block-style, borderBlockColor, border-block-color, borderInlineWidth, border-inline-width, borderInlineStyle, border-inline-style, borderInlineColor, border-inline-color, borderBlock, border-block, borderInline, border-inline, overflow, transition, animation, overscrollBehavior, overscroll-behavior, pageBreakBefore, page-break-before, pageBreakAfter, page-break-after, offset, columns, columnRule, column-rule, font, fontVariant, font-variant, marker, textEmphasis, text-emphasis, webkitTextStroke, WebkitTextStroke, -webkit-text-stroke, listStyle, list-style, margin, marginBlock, margin-block, marginInline, margin-inline, scrollMargin, scroll-margin, scrollMarginBlock, scroll-margin-block, scrollMarginInline, scroll-margin-inline, outline, padding, paddingBlock, padding-block, paddingInline, padding-inline, scrollPadding, scroll-padding, scrollPaddingBlock, scroll-padding-block, scrollPaddingInline, scroll-padding-inline, flexFlow, flex-flow, flex, gap, gridRow, grid-row, gridColumn, grid-column, gridArea, grid-area, gridTemplate, grid-template, grid, placeContent, place-content, placeSelf, place-self, placeItems, place-items, inset, insetBlock, inset-block, insetInline, inset-inline, mask, maskPosition, mask-position, textDecoration, text-decoration, all, webkitBackgroundClip, WebkitBackgroundClip, -webkit-background-clip, webkitBackgroundOrigin, WebkitBackgroundOrigin, -webkit-background-origin, webkitBackgroundSize, WebkitBackgroundSize, -webkit-background-size, MozBorderStartColor, -moz-border-start-color, MozBorderStartStyle, -moz-border-start-style, MozBorderStartWidth, -moz-border-start-width, MozBorderEndColor, -moz-border-end-color, MozBorderEndStyle, -moz-border-end-style, MozBorderEndWidth, -moz-border-end-width, webkitBorderTopLeftRadius, WebkitBorderTopLeftRadius, -webkit-border-top-left-radius, webkitBorderTopRightRadius, WebkitBorderTopRightRadius, -webkit-border-top-right-radius, webkitBorderBottomRightRadius, WebkitBorderBottomRightRadius, -webkit-border-bottom-right-radius, webkitBorderBottomLeftRadius, WebkitBorderBottomLeftRadius, -webkit-border-bottom-left-radius, MozTransitionDuration, -moz-transition-duration, webkitTransitionDuration, WebkitTransitionDuration, -webkit-transition-duration, MozTransitionTimingFunction, -moz-transition-timing-function, webkitTransitionTimingFunction, WebkitTransitionTimingFunction, -webkit-transition-timing-function, MozTransitionProperty, -moz-transition-property, webkitTransitionProperty, WebkitTransitionProperty, -webkit-transition-property, MozTransitionDelay, -moz-transition-delay, webkitTransitionDelay, WebkitTransitionDelay, -webkit-transition-delay, MozAnimationName, -moz-animation-name, webkitAnimationName, WebkitAnimationName, -webkit-animation-name, MozAnimationDuration, -moz-animation-duration, webkitAnimationDuration, WebkitAnimationDuration, -webkit-animation-duration, MozAnimationTimingFunction, -moz-animation-timing-function, webkitAnimationTimingFunction, WebkitAnimationTimingFunction, -webkit-animation-timing-function, MozAnimationIterationCount, -moz-animation-iteration-count, webkitAnimationIterationCount, WebkitAnimationIterationCount, -webkit-animation-iteration-count, MozAnimationDirection, -moz-animation-direction, webkitAnimationDirection, WebkitAnimationDirection, -webkit-animation-direction, MozAnimationPlayState, -moz-animation-play-state, webkitAnimationPlayState, WebkitAnimationPlayState, -webkit-animation-play-state, MozAnimationFillMode, -moz-animation-fill-mode, webkitAnimationFillMode, WebkitAnimationFillMode, -webkit-animation-fill-mode, MozAnimationDelay, -moz-animation-delay, webkitAnimationDelay, WebkitAnimationDelay, -webkit-animation-delay, MozTransform, -moz-transform, webkitTransform, WebkitTransform, -webkit-transform, pageBreakInside, page-break-inside, MozPerspective, -moz-perspective, webkitPerspective, WebkitPerspective, -webkit-perspective, MozPerspectiveOrigin, -moz-perspective-origin, webkitPerspectiveOrigin, WebkitPerspectiveOrigin, -webkit-perspective-origin, MozBackfaceVisibility, -moz-backface-visibility, webkitBackfaceVisibility, WebkitBackfaceVisibility, -webkit-backface-visibility, MozTransformStyle, -moz-transform-style, webkitTransformStyle, WebkitTransformStyle, -webkit-transform-style, MozTransformOrigin, -moz-transform-origin, webkitTransformOrigin, WebkitTransformOrigin, -webkit-transform-origin, MozAppearance, -moz-appearance, webkitAppearance, WebkitAppearance, -webkit-appearance, webkitBoxShadow, WebkitBoxShadow, -webkit-box-shadow, webkitFilter, WebkitFilter, -webkit-filter, MozFontFeatureSettings, -moz-font-feature-settings, MozFontLanguageOverride, -moz-font-language-override, MozHyphens, -moz-hyphens, webkitTextSizeAdjust, WebkitTextSizeAdjust, -webkit-text-size-adjust, wordWrap, word-wrap, MozTabSize, -moz-tab-size, MozMarginStart, -moz-margin-start, MozMarginEnd, -moz-margin-end, MozPaddingStart, -moz-padding-start, MozPaddingEnd, -moz-padding-end, webkitFlexDirection, WebkitFlexDirection, -webkit-flex-direction, webkitFlexWrap, WebkitFlexWrap, -webkit-flex-wrap, webkitJustifyContent, WebkitJustifyContent, -webkit-justify-content, webkitAlignContent, WebkitAlignContent, -webkit-align-content, webkitAlignItems, WebkitAlignItems, -webkit-align-items, webkitFlexGrow, WebkitFlexGrow, -webkit-flex-grow, webkitFlexShrink, WebkitFlexShrink, -webkit-flex-shrink, webkitAlignSelf, WebkitAlignSelf, -webkit-align-self, webkitOrder, WebkitOrder, -webkit-order, webkitFlexBasis, WebkitFlexBasis, -webkit-flex-basis, MozBoxSizing, -moz-box-sizing, webkitBoxSizing, WebkitBoxSizing, -webkit-box-sizing, gridColumnGap, grid-column-gap, gridRowGap, grid-row-gap, webkitMaskRepeat, WebkitMaskRepeat, -webkit-mask-repeat, webkitMaskPositionX, WebkitMaskPositionX, -webkit-mask-position-x, webkitMaskPositionY, WebkitMaskPositionY, -webkit-mask-position-y, webkitMaskClip, WebkitMaskClip, -webkit-mask-clip, webkitMaskOrigin, WebkitMaskOrigin, -webkit-mask-origin, webkitMaskSize, WebkitMaskSize, -webkit-mask-size, webkitMaskComposite, WebkitMaskComposite, -webkit-mask-composite, webkitMaskImage, WebkitMaskImage, -webkit-mask-image, MozUserSelect, -moz-user-select, webkitUserSelect, WebkitUserSelect, -webkit-user-select, webkitBoxAlign, WebkitBoxAlign, -webkit-box-align, webkitBoxDirection, WebkitBoxDirection, -webkit-box-direction, webkitBoxFlex, WebkitBoxFlex, -webkit-box-flex, webkitBoxOrient, WebkitBoxOrient, -webkit-box-orient, webkitBoxPack, WebkitBoxPack, -webkit-box-pack, webkitBoxOrdinalGroup, WebkitBoxOrdinalGroup, -webkit-box-ordinal-group, MozBorderStart, -moz-border-start, MozBorderEnd, -moz-border-end, webkitBorderRadius, WebkitBorderRadius, -webkit-border-radius, MozBorderImage, -moz-border-image, webkitBorderImage, WebkitBorderImage, -webkit-border-image, MozTransition, -moz-transition, webkitTransition, WebkitTransition, -webkit-transition, MozAnimation, -moz-animation, webkitAnimation, WebkitAnimation, -webkit-animation, webkitFlexFlow, WebkitFlexFlow, -webkit-flex-flow, webkitFlex, WebkitFlex, -webkit-flex, gridGap, grid-gap, webkitMask, WebkitMask, -webkit-mask, webkitMaskPosition, WebkitMaskPosition, -webkit-mask-position, constructor`
	}
})

const getListDiff = ({oldList, newList, removeCamelCase = false} = {}) => {
	const oldSet = new Set(oldList)
	const newSet = new Set(newList)
	newList.forEach(x => oldSet.delete(x))
	oldList.forEach(x => newSet.delete(x))
	const camelCase = /[a-z][A-Z]/
	return {
		removed: !removeCamelCase ? [...oldSet] : [...oldSet].filter(key => !camelCase.test(key)),
		added: !removeCamelCase ? [...newSet] : [...newSet].filter(key => !camelCase.test(key))
	}
}

const getFeaturesBrowser = () => {
	const mathPI = 3.141592653589793
	const blink = (mathPI ** -100) == 1.9275814160560204e-50
	const gecko = (mathPI ** -100) == 1.9275814160560185e-50
	const browser = (
		blink ? 'Chrome' : gecko ? 'Firefox' : ''
	)
	return browser
}

const getEngineMaps = browser => {
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
		'92': ['size-adjust'],
		'93': ['accent-color']
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
		'93': ['WritableStreamDefaultController', 'OTPCredential']
	}

	const isChrome = browser == 'Chrome'
	const isFirefox = browser == 'Firefox'
	const css = (
		isChrome ? blinkCSS : isFirefox ? geckoCSS : {}
	)
	const win = (
		isChrome ? blinkWindow : isFirefox ? geckoWindow : {}
	)
	return {
		css,
		win
	}
}

const versionSort = x => x.sort((a, b) => /\d+/.exec(a)[0] - /\d+/.exec(b)[0]).reverse()

// CSS feature firewall
const getCSSFeaturesLie = fp => {
	if (!fp.workerScope || !fp.workerScope.userAgent) {
		return false
	}
	const browser = getFeaturesBrowser()
	const stable = getStableFeatures()
	const { version: maxVersion } = stable[browser] || {}
	const { userAgenVersion: reportedVersion } = fp.workerScope
	
	// let RFP pass
	const { privacy } = fp.resistance || {}
	if (privacy == 'Firefox' || privacy == 'Tor Browser') {
		return false
	}

	const { cssVersion } = fp.features || {}
	const versionParts = cssVersion ? cssVersion.split('-') : []
	const liedVersion = reportedVersion && cssVersion && (+reportedVersion <= maxVersion) && (
		(
			versionParts.length == 1 &&
			(+reportedVersion > +versionParts[0]+1 || +reportedVersion < +versionParts[0]-1)
		) || (
			versionParts.length == 2 &&
			(+reportedVersion > +versionParts[1]+1 || +reportedVersion < +versionParts[0]-1)
		)
	)
	return liedVersion
}

const getEngineFeatures = async ({ imports, cssComputed, windowFeaturesComputed }) => {
	const {
		require: {
			captureError,
			phantomDarkness,
			logTestResult
		}
	} = imports

	try {
		const start = performance.now()
		if (!cssComputed || !windowFeaturesComputed) {
			logTestResult({ test: 'features', passed: false })
			return
		}
		const win = phantomDarkness ? phantomDarkness : window
		const { keys: computedStyleKeys } = cssComputed.computedStyle || {}
		const { keys: windowFeaturesKeys } = windowFeaturesComputed || {}

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

		const browser = getFeaturesBrowser()

		const getFeatures = ({context, allKeys, engineMap, checkNative = false} = {}) => {
			const allKeysSet = new Set(allKeys)
			const features = new Set()
			const match = Object.keys(engineMap || {}).reduce((acc, key) => {
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
						(checkNative ? isNative(context, prop) : true) &&
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

		// css version
		const {
			css: engineMapCSS,
			win: engineMapWindow
		} = getEngineMaps(browser)

		const {
			version: cssVersion,
			features: cssFeatures
		} = getFeatures({
			context: win,
			allKeys: computedStyleKeys,
			engineMap: engineMapCSS
		})
		
		// window version
		const {
			version: windowVersion,
			features: windowFeatures
		} = getFeatures({
			context: win,
			allKeys: windowFeaturesKeys,
			engineMap: engineMapWindow,
			checkNative: true
		})
			
		// determine version based on 2 factors
		const getVersionFromRange = (range, versionCollection) => {
			const exactVersion = versionCollection.find(version => version && !/-/.test(version))
			if (exactVersion) {
				return exactVersion
			}
			const len = range.length
			const first = range[0]
			const last = range[len-1]
			return (
				!len ? '' : 
					len == 1 ? first :
						`${last}-${first}`
			)
		}
		const versionSet = new Set([
			cssVersion,
			windowVersion
		])
		versionSet.delete(undefined)
		const versionRange = versionSort(
			[...versionSet].reduce((acc, x) => [...acc, ...x.split('-')], [])
		)
		const version = getVersionFromRange(versionRange, [cssVersion, windowVersion])
		logTestResult({ start, test: 'features', passed: true })
		return {
			versionRange,
			version,
			cssVersion,
			windowVersion,
			cssFeatures: [...cssFeatures],
			windowFeatures: [...windowFeatures]
		}
	}
	catch (error) {
		logTestResult({ test: 'features', passed: false })
		captureError(error)
		return
	}
}

const featuresHTML = ({ fp, modal, note, hashMini }) => {
	if (!fp.features) {
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
		versionRange,
		version,
		cssVersion,
		windowVersion,
		cssFeatures,
		windowFeatures
	} = fp.features || {}

	const { keys: windowFeaturesKeys } = fp.windowFeatures || {}
	const { keys: computedStyleKeys } = fp.css.computedStyle || {}

	const browser = getFeaturesBrowser()
	const {
		css: engineMapCSS,
		win: engineMapWindow
	} = getEngineMaps(browser)
		
	// modal
	const getModal = ({id, engineMap, features, browser}) => {
		// capture diffs from stable release
		const stable = getStableFeatures()
		const { windowKeys, cssKeys, version } = stable[browser] || {}
		let diff
		if (id == 'css') {
			diff = !cssKeys ? undefined : getListDiff({
				oldList: cssKeys.split(', '),
				newList: computedStyleKeys,
				removeCamelCase: true
			})
		}
		else if (id == 'window') {
			diff = !windowKeys ? undefined : getListDiff({
				oldList: windowKeys.split(', '),
				newList: windowFeaturesKeys
			})
		}

		const header = !version || !diff || (!diff.added.length && !diff.removed.length) ? '' : `
			<strong>diffs from ${version}</strong>:
			<div>
			${
				diff && diff.added.length ? 
					diff.added.map(key => `<div><span>${key}</span></div>`).join('') : ''
			}
			${
				diff && diff.removed.length ? 
					diff.removed.map(key => `<div><span class="unsupport">${key}</span></div>`).join('') : ''
			}
			</div>
			
		`
	
		return modal(`creep-features-${id}`, header + versionSort(Object.keys(engineMap)).map(key => {
			return `
				<strong>${key}</strong>:<br>${
					engineMap[key].map(prop => {
						return `<span class="${!features.has(prop) ? 'unsupport' : ''}">${prop}</span>`
					}).join('<br>')
				}
			`
		}).join('<br>'), hashMini([...features]))
	}

	const cssModal = getModal({
		id: 'css',
		engineMap: engineMapCSS,
		features: new Set(cssFeatures),
		browser
	})
	
	const windowModal = getModal({
		id: 'window',
		engineMap: engineMapWindow,
		features: new Set(windowFeatures),
		browser
	})

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
		.features-removed {
			background: red;
			color: #fff;
		}
		.features-added {
			background: green;
			color: #fff;
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
			versionRange.length ? `${browserIcon}${version}+` : 
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

export { getCSSFeaturesLie, getEngineFeatures, featuresHTML }