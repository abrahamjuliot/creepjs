import getOfflineAudioContext from './audio'
import getCanvas2d from './canvas'
import getCSS from './css'
import getCSSMedia from './cssmedia'
import getHTMLElementVersion from './document'
import getClientRects from './domrect'
import getConsoleErrors from './engine'
import getEngineFeatures from './features'
import getFonts from './fonts'
import getHeadlessFeatures from './headless'
import getIntl from './intl'
import { getLies, PARENT_PHANTOM } from './lies'
import getMaths from './math'
import getMedia from './media'
import getNavigator from './navigator'
import getResistance from './resistance'
import getScreen from './screen'
import getVoices from './speech'
import getSVG from './svg'
import getTimezone from './timezone'
import { getTrash } from './trash'
import { hashify, getFuzzyHash } from './utils/crypto'
import {
    braveBrowser,
    getBraveMode,
    getBraveUnprotectedParameters,
    IS_BLINK,
    LowerEntropy,
    queueTask
} from './utils/helpers'
import getCanvasWebgl from './webgl'
import getWindowFeatures from './window'
import getBestWorkerScope, { Scope, spawnWorker } from './worker'
import {caniuse} from "./errors";

!async function() {
    'use strict';

    const scope = await spawnWorker()

    if (scope == Scope.WORKER) {
        return
    }

    await queueTask()

    const fingerprint = async () => {
        // @ts-ignore
        const [
            workerScopeComputed,
            voicesComputed,
            offlineAudioContextComputed,
            canvasWebglComputed,
            canvas2dComputed,
            windowFeaturesComputed,
            htmlElementVersionComputed,
            cssComputed,
            cssMediaComputed,
            screenComputed,
            mathsComputed,
            consoleErrorsComputed,
            timezoneComputed,
            clientRectsComputed,
            fontsComputed,
            mediaComputed,
            svgComputed,
            resistanceComputed,
            intlComputed,
        ] = await Promise.all([
            getBestWorkerScope(),
            getVoices(),
            getOfflineAudioContext(),
            getCanvasWebgl(),
            getCanvas2d(),
            getWindowFeatures(),
            getHTMLElementVersion(),
            getCSS(),
            getCSSMedia(),
            getScreen(),
            getMaths(),
            getConsoleErrors(),
            getTimezone(),
            getClientRects(),
            getFonts(),
            getMedia(),
            getSVG(),
            getResistance(),
            getIntl(),
        ]).catch(() => {})

        const navigatorComputed = await getNavigator(workerScopeComputed)
            .catch(() => {})

        // @ts-ignore
        const [headlessComputed, featuresComputed] = await Promise.all([
            getHeadlessFeatures({
                webgl: canvasWebglComputed,
                workerScope: workerScopeComputed,
            }),
            getEngineFeatures({
                cssComputed,
                navigatorComputed,
                windowFeaturesComputed,
            })
        ]).catch(() => {})

        // @ts-ignore
        const [liesComputed, trashComputed] = await Promise.all([
            getLies(),
            getTrash(),
        ]).catch(() => {})

        // @ts-ignore
        const [
            windowHash,
            headlessHash,
            htmlHash,
            cssMediaHash,
            cssHash,
            screenHash,
            voicesHash,
            canvas2dHash,
            canvasWebglHash,
            pixelsHash,
            pixels2Hash,
            mathsHash,
            consoleErrorsHash,
            timezoneHash,
            rectsHash,
            audioHash,
            fontsHash,
            workerHash,
            mediaHash,
            navigatorHash,
            liesHash,
            trashHash,
            svgHash,
            resistanceHash,
            intlHash,
            featuresHash,
        ] = await Promise.all([
            hashify(windowFeaturesComputed),
            hashify(headlessComputed),
            hashify((htmlElementVersionComputed || {}).keys),
            hashify(cssMediaComputed),
            hashify(cssComputed),
            hashify(screenComputed),
            hashify(voicesComputed),
            hashify(canvas2dComputed),
            hashify(canvasWebglComputed),
            ((canvasWebglComputed || {}).pixels || []).length ? hashify(canvasWebglComputed.pixels) : undefined,
            ((canvasWebglComputed || {}).pixels2 || []).length ? hashify(canvasWebglComputed.pixels2) : undefined,
            hashify((mathsComputed || {}).data),
            hashify((consoleErrorsComputed || {}).errors),
            hashify(timezoneComputed),
            hashify(clientRectsComputed),
            hashify(offlineAudioContextComputed),
            hashify(fontsComputed),
            hashify(workerScopeComputed),
            hashify(mediaComputed),
            hashify(navigatorComputed),
            hashify(liesComputed),
            hashify(trashComputed),
            hashify(svgComputed),
            hashify(resistanceComputed),
            hashify(intlComputed),
            hashify(featuresComputed)
        ]).catch(() => {})

        if (PARENT_PHANTOM) {
            // @ts-ignore
            PARENT_PHANTOM.parentNode.removeChild(PARENT_PHANTOM)
        }

        return {
            workerScope: !workerScopeComputed ? undefined : { ...workerScopeComputed, $hash: workerHash},
            navigator: !navigatorComputed ? undefined : {...navigatorComputed, $hash: navigatorHash},
            windowFeatures: !windowFeaturesComputed ? undefined : {...windowFeaturesComputed, $hash: windowHash},
            headless: !headlessComputed ? undefined : {...headlessComputed, $hash: headlessHash},
            htmlElementVersion: !htmlElementVersionComputed ? undefined : {...htmlElementVersionComputed, $hash: htmlHash},
            cssMedia: !cssMediaComputed ? undefined : {...cssMediaComputed, $hash: cssMediaHash},
            css: !cssComputed ? undefined : {...cssComputed, $hash: cssHash},
            screen: !screenComputed ? undefined : {...screenComputed, $hash: screenHash},
            voices: !voicesComputed ? undefined : {...voicesComputed, $hash: voicesHash},
            media: !mediaComputed ? undefined : {...mediaComputed, $hash: mediaHash},
            canvas2d: !canvas2dComputed ? undefined : {...canvas2dComputed, $hash: canvas2dHash},
            canvasWebgl: !canvasWebglComputed ? undefined : {...canvasWebglComputed, pixels: pixelsHash, pixels2: pixels2Hash, $hash: canvasWebglHash},
            maths: !mathsComputed ? undefined : {...mathsComputed, $hash: mathsHash},
            consoleErrors: !consoleErrorsComputed ? undefined : {...consoleErrorsComputed, $hash: consoleErrorsHash},
            timezone: !timezoneComputed ? undefined : {...timezoneComputed, $hash: timezoneHash},
            clientRects: !clientRectsComputed ? undefined : {...clientRectsComputed, $hash: rectsHash},
            offlineAudioContext: !offlineAudioContextComputed ? undefined : {...offlineAudioContextComputed, $hash: audioHash},
            fonts: !fontsComputed ? undefined : {...fontsComputed, $hash: fontsHash},
            lies: !liesComputed ? undefined : {...liesComputed, $hash: liesHash},
            trash: !trashComputed ? undefined : {...trashComputed, $hash: trashHash},
            svg: !svgComputed ? undefined : {...svgComputed, $hash: svgHash },
            resistance: !resistanceComputed ? undefined : {...resistanceComputed, $hash: resistanceHash},
            intl: !intlComputed ? undefined : {...intlComputed, $hash: intlHash},
            features: !featuresComputed ? undefined : {...featuresComputed, $hash: featuresHash},
        }
    }

    const fp = await fingerprint()

    const isBrave = IS_BLINK ? await braveBrowser() : false
    const braveMode = isBrave ? getBraveMode() : {}
    const braveFingerprintingBlocking = isBrave && (braveMode.standard || braveMode.strict)

    const hardenEntropy = (workerScope, prop) => {
        return (
            !workerScope ? prop :
                (workerScope.localeEntropyIsTrusty && workerScope.localeIntlEntropyIsTrusty) ? prop :
                    undefined
        )
    }

    const privacyResistFingerprinting = (
        fp.resistance && /^(tor browser|firefox)$/i.test(fp.resistance.privacy)
    )

    // harden gpu
    const hardenGPU = (canvasWebgl) => {
        const { gpu: { confidence, compressedGPU } } = canvasWebgl
        return (
            confidence == 'low' ? {} : {
                UNMASKED_RENDERER_WEBGL: compressedGPU,
                UNMASKED_VENDOR_WEBGL: canvasWebgl.parameters.UNMASKED_VENDOR_WEBGL,
            }
        )
    }

    const creep = {
        navigator: (
            !fp.navigator || fp.navigator.lied ? undefined : {
                bluetoothAvailability: fp.navigator.bluetoothAvailability,
                device: fp.navigator.device,
                deviceMemory: fp.navigator.deviceMemory,
                hardwareConcurrency: fp.navigator.hardwareConcurrency,
                maxTouchPoints: fp.navigator.maxTouchPoints,
                oscpu: fp.navigator.oscpu,
                platform: fp.navigator.platform,
                system: fp.navigator.system,
                userAgentData: {
                    ...(fp.navigator.userAgentData || {}),
                    // loose
                    brandsVersion: undefined,
                    uaFullVersion: undefined,
                },
                vendor: fp.navigator.vendor,
            }
        ),
        screen: (
            !fp.screen || fp.screen.lied || privacyResistFingerprinting || LowerEntropy.SCREEN ? undefined :
                hardenEntropy(
                    fp.workerScope, {
                        height: fp.screen.height,
                        width: fp.screen.width,
                        pixelDepth: fp.screen.pixelDepth,
                        colorDepth: fp.screen.colorDepth,
                        lied: fp.screen.lied,
                    },
                )
        ),
        workerScope: !fp.workerScope || fp.workerScope.lied ? undefined : {
            deviceMemory: (
                braveFingerprintingBlocking ? undefined : fp.workerScope.deviceMemory
            ),
            hardwareConcurrency: (
                braveFingerprintingBlocking ? undefined : fp.workerScope.hardwareConcurrency
            ),
            // system locale in blink
            language: !LowerEntropy.TIME_ZONE ? fp.workerScope.language : undefined,
            platform: fp.workerScope.platform,
            system: fp.workerScope.system,
            device: fp.workerScope.device,
            timezoneLocation: (
                !LowerEntropy.TIME_ZONE ?
                    hardenEntropy(fp.workerScope, fp.workerScope.timezoneLocation) :
                    undefined
            ),
            webglRenderer: (
                (fp.workerScope.gpu.confidence != 'low') ? fp.workerScope.gpu.compressedGPU : undefined
            ),
            webglVendor: (
                (fp.workerScope.gpu.confidence != 'low') ? fp.workerScope.webglVendor : undefined
            ),
            userAgentData: {
                ...fp.workerScope.userAgentData,
                // loose
                brandsVersion: undefined,
                uaFullVersion: undefined,
            },
        },
        media: fp.media,
        canvas2d: ((canvas2d) => {
            if (!canvas2d) {
                return
            }
            const { lied, liedTextMetrics } = canvas2d
            let data
            if (!lied) {
                const { dataURI, paintURI, textURI, emojiURI } = canvas2d
                data = {
                    lied,
                    ...{ dataURI, paintURI, textURI, emojiURI },
                }
            }
            if (!liedTextMetrics) {
                const { textMetricsSystemSum, emojiSet } = canvas2d
                data = {
                    ...(data || {}),
                    ...{ textMetricsSystemSum, emojiSet },
                }
            }
            return data
        })(fp.canvas2d),
        canvasWebgl: (!fp.canvasWebgl || fp.canvasWebgl.lied || LowerEntropy.WEBGL) ? undefined : (
            braveFingerprintingBlocking ? {
                parameters: {
                    ...getBraveUnprotectedParameters(fp.canvasWebgl.parameters),
                    ...hardenGPU(fp.canvasWebgl),
                },
            } : {
                ...((gl, canvas2d) => {
                    if ((canvas2d && canvas2d.lied) || LowerEntropy.CANVAS) {
                        // distrust images
                        const { extensions, gpu, lied, parameterOrExtensionLie } = gl
                        return {
                            extensions,
                            gpu,
                            lied,
                            parameterOrExtensionLie,
                        }
                    }
                    return gl
                })(fp.canvasWebgl, fp.canvas2d),
                parameters: {
                    ...fp.canvasWebgl.parameters,
                    ...hardenGPU(fp.canvasWebgl),
                },
            }
        ),
        cssMedia: !fp.cssMedia ? undefined : {
            reducedMotion: caniuse(() => fp.cssMedia.mediaCSS['prefers-reduced-motion']),
            colorScheme: (
                braveFingerprintingBlocking ? undefined :
                    caniuse(() => fp.cssMedia.mediaCSS['prefers-color-scheme'])
            ),
            monochrome: caniuse(() => fp.cssMedia.mediaCSS.monochrome),
            invertedColors: caniuse(() => fp.cssMedia.mediaCSS['inverted-colors']),
            forcedColors: caniuse(() => fp.cssMedia.mediaCSS['forced-colors']),
            anyHover: caniuse(() => fp.cssMedia.mediaCSS['any-hover']),
            hover: caniuse(() => fp.cssMedia.mediaCSS.hover),
            anyPointer: caniuse(() => fp.cssMedia.mediaCSS['any-pointer']),
            pointer: caniuse(() => fp.cssMedia.mediaCSS.pointer),
            colorGamut: caniuse(() => fp.cssMedia.mediaCSS['color-gamut']),
            screenQuery: (
                privacyResistFingerprinting || (LowerEntropy.SCREEN || LowerEntropy.IFRAME_SCREEN) ?
                    undefined :
                    hardenEntropy(fp.workerScope, caniuse(() => fp.cssMedia.screenQuery))
            ),
        },
        css: !fp.css ? undefined : fp.css.system.fonts,
        timezone: !fp.timezone || fp.timezone.lied || LowerEntropy.TIME_ZONE ? undefined : {
            locationMeasured: hardenEntropy(fp.workerScope, fp.timezone.locationMeasured),
            lied: fp.timezone.lied,
        },
        offlineAudioContext: !fp.offlineAudioContext ? undefined : (
            fp.offlineAudioContext.lied || LowerEntropy.AUDIO ? undefined :
                fp.offlineAudioContext
        ),
        fonts: !fp.fonts || fp.fonts.lied || LowerEntropy.FONTS ? undefined : fp.fonts.fontFaceLoadFonts,
        forceRenew: 1682918207897,
    }

    if (typeof window !== 'undefined' && !window.fp) {
        window.fp = await hashify(creep)
    }
}()
