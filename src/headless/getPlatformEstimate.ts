import { IS_BLINK } from '../utils/helpers'
import { Platform } from './constants'

export default function getPlatformEstimate(): [
    scores: Record<string, number>,
    highestScore: number,
    headlessEstimate: Record<string, boolean>
] | [] {
    if (!IS_BLINK) return []
    const v80 = 'getVideoPlaybackQuality' in HTMLVideoElement.prototype
    const v81 = CSS.supports('color-scheme: initial')
    const v84 = CSS.supports('appearance: initial')
    const v86 = 'DisplayNames' in Intl
    const v88 = CSS.supports('aspect-ratio: initial')
    const v89 = CSS.supports('border-end-end-radius: initial')
    const v95 = 'randomUUID' in Crypto.prototype
    const hasBarcodeDetector = 'BarcodeDetector' in window
    // @ts-expect-error if not supported
    const hasDownlinkMax = 'downlinkMax' in (window.NetworkInformation?.prototype || {})
    const hasContentIndex = 'ContentIndex' in window
    const hasContactsManager = 'ContactsManager' in window
    const hasEyeDropper = 'EyeDropper' in window
    const hasFileSystemWritableFileStream = 'FileSystemWritableFileStream' in window
    const hasHid = 'HID' in window && 'HIDDevice' in window
    const hasSerialPort = 'SerialPort' in window && 'Serial' in window
    const hasSharedWorker = 'SharedWorker' in window
    const hasTouch = 'ontouchstart' in Window && 'TouchEvent' in window
    const hasAppBadge = 'setAppBadge' in Navigator.prototype

    const hasFeature = (version: boolean, condition: boolean) => {
        return (version ? [condition] : [])
    }
    const estimate: Record<string, boolean[]> = {
        [Platform.ANDROID]: [
            ...hasFeature(v88, hasBarcodeDetector),
            ...hasFeature(v84, hasContentIndex),
            ...hasFeature(v80, hasContactsManager),
            hasDownlinkMax,
            ...hasFeature(v95, !hasEyeDropper),
            ...hasFeature(v86, !hasFileSystemWritableFileStream),
            ...hasFeature(v89, !hasHid),
            ...hasFeature(v89, !hasSerialPort),
            !hasSharedWorker,
            hasTouch,
            ...hasFeature(v81, !hasAppBadge),
        ],
        [Platform.CHROME_OS]: [
            ...hasFeature(v88, hasBarcodeDetector),
            ...hasFeature(v84, !hasContentIndex),
            ...hasFeature(v80, !hasContactsManager),
            hasDownlinkMax,
            ...hasFeature(v95, hasEyeDropper),
            ...hasFeature(v86, hasFileSystemWritableFileStream),
            ...hasFeature(v89, hasHid),
            ...hasFeature(v89, hasSerialPort),
            hasSharedWorker,
            hasTouch || !hasTouch,
            ...hasFeature(v81, !hasAppBadge),
        ],
        [Platform.WINDOWS]: [
            ...hasFeature(v88, !hasBarcodeDetector),
            ...hasFeature(v84, !hasContentIndex),
            ...hasFeature(v80, !hasContactsManager),
            !hasDownlinkMax,
            ...hasFeature(v95, hasEyeDropper),
            ...hasFeature(v86, hasFileSystemWritableFileStream),
            ...hasFeature(v89, hasHid),
            ...hasFeature(v89, hasSerialPort),
            hasSharedWorker,
            hasTouch || !hasTouch,
            ...hasFeature(v81, hasAppBadge),
        ],
        [Platform.MAC]: [
            ...hasFeature(v88, hasBarcodeDetector),
            ...hasFeature(v84, !hasContentIndex),
            ...hasFeature(v80, !hasContactsManager),
            !hasDownlinkMax,
            ...hasFeature(v95, hasEyeDropper),
            ...hasFeature(v86, hasFileSystemWritableFileStream),
            ...hasFeature(v89, hasHid),
            ...hasFeature(v89, hasSerialPort),
            hasSharedWorker,
            !hasTouch,
            ...hasFeature(v81, hasAppBadge),
        ],
        [Platform.LINUX]: [
            ...hasFeature(v88, !hasBarcodeDetector),
            ...hasFeature(v84, !hasContentIndex),
            ...hasFeature(v80, !hasContactsManager),
            !hasDownlinkMax,
            ...hasFeature(v95, hasEyeDropper),
            ...hasFeature(v86, hasFileSystemWritableFileStream),
            ...hasFeature(v89, hasHid),
            ...hasFeature(v89, hasSerialPort),
            hasSharedWorker,
            !hasTouch || !hasTouch,
            ...hasFeature(v81, !hasAppBadge),
        ],
    }

    // Chrome only features
    const headlessEstimate: Record<string, boolean> = {
        noContentIndex: v84 && !hasContentIndex,
        noContactsManager: v80 && !hasContactsManager,
        noDownlinkMax: !hasDownlinkMax,
    }

    const scores = Object.keys(estimate).reduce((acc, key) => {
        const list = estimate[key]
        const score = +((list.filter((x) => x).length / list.length).toFixed(2))
        acc[key] = score
        return acc
    }, {} as Record<string, number>)

    const platform = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b)
    const highestScore = scores[platform]

    return [scores, highestScore, headlessEstimate]
}
