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
import { queueTask } from './utils/helpers'
import getCanvasWebgl from './webgl'
import getWindowFeatures from './window'
import getBestWorkerScope, { Scope, spawnWorker } from './worker'

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
        ]).catch((error) => console.error(error.message))

        const navigatorComputed = await getNavigator(workerScopeComputed)
            .catch((error) => console.error(error.message))

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
        ]).catch((error) => console.error(error.message))

        // @ts-ignore
        const [liesComputed, trashComputed] = await Promise.all([
            getLies(),
            getTrash(),
        ]).catch((error) => console.error(error.message))

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
        ]).catch((error) => console.error(error.message))

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
    if (fp && typeof window !== 'undefined' && !window.fp) {
        window.fp = {
            fuzzyHash: await getFuzzyHash(fp),
            stableHash: await hashify(fp),
        }
    }
}()
