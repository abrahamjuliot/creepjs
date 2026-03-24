import { PlatformClassifier } from './types'

export function isFontOSBad(userAgentOS: string, fonts: string[]): boolean {
	if (!userAgentOS || !fonts || !fonts.length) return false

	const fontMap = fonts.reduce((acc, x) => {
		acc[x] = true
		return acc
	}, {} as Record<string, boolean>)

	const isLikeWindows = (
		'Cambria Math' in fontMap ||
		'Nirmala UI' in fontMap ||
		'Leelawadee UI' in fontMap ||
		'HoloLens MDL2 Assets' in fontMap ||
		'Segoe Fluent Icons' in fontMap
	)

	const isLikeApple = (
		'Helvetica Neue' in fontMap ||
		'Luminari' in fontMap ||
		'PingFang HK Light' in fontMap ||
		'InaiMathi Bold' in fontMap ||
		'Galvji' in fontMap ||
		'Chakra Petch' in fontMap
	)

	const isLikeLinux = (
		'Arimo' in fontMap ||
		'MONO' in fontMap ||
		'Ubuntu' in fontMap ||
		'Noto Color Emoji' in fontMap ||
		'Dancing Script' in fontMap ||
		'Droid Sans Mono' in fontMap
	)

	if (isLikeWindows && userAgentOS != PlatformClassifier.WINDOWS) {
		return true
	} else if (isLikeApple && userAgentOS != PlatformClassifier.APPLE) {
		return true
	} else if (isLikeLinux && userAgentOS != PlatformClassifier.LINUX) {
		return true
	}
	return false
}