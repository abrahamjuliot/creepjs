import { hashSlice } from '../utils/helpers'
import { modal } from '../utils/html'

// Detect proxy behavior
const proxyBehavior = (x) => typeof x == 'function' ? true : false

// Detect gibberish
const accept={};for (let i = 'a'; i <= 'z'; i = String.fromCharCode(i.charCodeAt()+1)){for (let j = 'a'; j <= 'z'; j = String.fromCharCode(j.charCodeAt()+1)){accept[i+j]=1;}}

const gibberish = (str, {strict = false} = {}) => {
	if (!str) {
		return []
	}
	// test letter case sequence
	const letterCaseSequenceGibbers = []
	const tests = [
		/([A-Z]{3,}[a-z])/g, // ABCd
		/([a-z][A-Z]{3,})/g, // aBCD
		/([a-z][A-Z]{2,}[a-z])/g, // aBC...z
		/([a-z][\d]{2,}[a-z])/g, // a##...b
		/([A-Z][\d]{2,}[a-z])/g, // A##...b
		/([a-z][\d]{2,}[A-Z])/g, // a##...B
	]
	tests.forEach((regExp) => {
		const match = str.match(regExp)
		if (match) {
			return letterCaseSequenceGibbers.push(match.join(', '))
		}
		return
	})

	// test letter sequence
	const letterSequenceGibbers = []
	const clean = str.toLowerCase().replace(/\d|\W|_/g, ' ').replace(/\s+/g, ' ').trim().split(' ').join('_')
	const len = clean.length
	const arr = [...clean]
	arr.forEach((char, index) => {
		const next = index+1
		if (arr[next] == '_' || char == '_' || next == len) {
return true
}
		const combo = char+arr[index+1]
		const acceptable = !!accept[combo]
		!acceptable && letterSequenceGibbers.push(combo)
		return
	})

	const gibbers = [
		// ignore sequence if less than 3 exist
		...(!strict && (letterSequenceGibbers.length < 3) ? [] : letterSequenceGibbers),
		...(!strict && (letterCaseSequenceGibbers.length < 4) ? [] : letterCaseSequenceGibbers),
	]

	const allow = [
		// known gibbers
		'bz',
		'cf',
		'fx',
		'mx',
		'vb',
		'xd',
		'gx',
		'PCIe',
		'vm',
		'NVIDIAGa',
	]
	return gibbers.filter((x) => !allow.includes(x))
}

// validate
const isInt = (x) => typeof x == 'number' && x % 1 == 0
const trustInteger = (name, val) => {
	const trusted = isInt(val)
	return trusted ? val : sendToTrash(name, val)
}

// WebGL Renderer helpers
function compressWebGLRenderer(x: string): string | undefined {
	if (!x) return

	return (''+x)
	.replace(/ANGLE \(|\sDirect3D.+|\sD3D.+|\svs_.+\)|\((DRM|POLARIS|LLVM).+|Mesa.+|(ATI|INTEL)-.+|Metal\s-\s.+|NVIDIA\s[\d|\.]+/ig, '')
	.replace(/(\s(ti|\d{1,2}GB|super)$)/ig, '')
	.replace(/\s{2,}/g, ' ')
	.trim()
	.replace(/((r|g)(t|)(x|s|\d) |Graphics |GeForce |Radeon (HD |Pro |))(\d+)/i, (...args) => {
		return `${args[1]}${args[6][0]}${args[6].slice(1).replace(/\d/g, '0')}s`
	})
}

const getWebGLRendererParts = (x) => {
    const knownParts = [
		'AMD',
		'ANGLE',
		'ASUS',
		'ATI',
		'ATI Radeon',
		'ATI Technologies Inc',
		'Adreno',
		'Android Emulator',
		'Apple',
		'Apple GPU',
		'Apple M1',
		'Chipset',
		'D3D11',
		'Direct3D',
		'Express Chipset',
		'GeForce',
		'Generation',
		'Generic Renderer',
		'Google',
		'Google SwiftShader',
		'Graphics',
		'Graphics Media Accelerator',
		'HD Graphics Family',
		'Intel',
		'Intel(R) HD Graphics',
		'Intel(R) UHD Graphics',
		'Iris',
		'KBL Graphics',
		'Mali',
		'Mesa',
		'Mesa DRI',
		'Metal',
		'Microsoft',
		'Microsoft Basic Render Driver',
		'Microsoft Corporation',
		'NVIDIA',
		'NVIDIA Corporation',
		'NVIDIAGameReadyD3D',
		'OpenGL',
		'OpenGL Engine',
		'Open Source Technology Center',
		'Parallels',
		'Parallels Display Adapter',
		'PCIe',
		'Plus Graphics',
		'PowerVR',
		'Pro Graphics',
		'Quadro',
		'Radeon',
		'Radeon Pro',
		'Radeon Pro Vega',
		'Samsung',
		'SSE2',
		'VMware',
		'VMware SVGA 3D',
		'Vega',
		'VirtualBox',
		'VirtualBox Graphics Adapter',
		'Vulkan',
		'Xe Graphics',
		'llvmpipe',
    ]
    const parts = [...knownParts].filter((name) => (''+x).includes(name))
    return [...new Set(parts)].sort().join(', ')
}

const hardenWebGLRenderer = (x) => {
	const gpuHasKnownParts = getWebGLRendererParts(x).length
	return gpuHasKnownParts ? compressWebGLRenderer(x) : x
}

const getWebGLRendererConfidence = (x) => {
	if (!x) {
		return
	}
	const parts = getWebGLRendererParts(x)
	const hasKnownParts = parts.length
	const hasBlankSpaceNoise = /\s{2,}|^\s|\s$/.test(x)
	const hasBrokenAngleStructure = /^ANGLE/.test(x) && !(/^ANGLE \((.+)\)/.exec(x)||[])[1]

	// https://chromium.googlesource.com/angle/angle/+/83fa18905d8fed4f394e4f30140a83a3e76b1577/src/gpu_info_util/SystemInfo.cpp
	// https://chromium.googlesource.com/angle/angle/+/83fa18905d8fed4f394e4f30140a83a3e76b1577/src/gpu_info_util/SystemInfo.h
	// https://chromium.googlesource.com/chromium/src/+/refs/heads/main/ui/gl/gl_version_info.cc
	/*
	const knownVendors = [
		'AMD',
		'ARM',
		'Broadcom',
		'Google',
		'ImgTec',
		'Intel',
		'Kazan',
		'NVIDIA',
		'Qualcomm',
		'VeriSilicon',
		'Vivante',
		'VMWare',
		'Apple',
		'Unknown'
	]
	const angle = {
		vendorId: (/^ANGLE \(([^,]+),/.exec(x)||[])[1] || knownVendors.find(vendor => x.includes(vendor)),
		deviceId: (
			(x.match(/,/g)||[]).length == 2 ? (/^ANGLE \(([^,]+), ([^,]+)[,|\)]/.exec(x)||[])[2] :
				(/^ANGLE \(([^,]+), ([^,]+)[,|\)]/.exec(x)||[])[1] || (/^ANGLE \((.+)\)$/.exec(x)||[])[1]
		).replace(/\sDirect3D.+/, '')
	}
	*/

	const gibbers = gibberish(x, { strict: true }).join(', ')
	const valid = (
		hasKnownParts && !hasBlankSpaceNoise && !hasBrokenAngleStructure
	)
	const confidence = (
		valid && !gibbers.length? 'high' :
		valid && gibbers.length ? 'moderate' :
			'low'
	)
	const grade = (
		confidence == 'high' ? 'A' :
			confidence == 'moderate' ? 'C' :
				'F'
	)

	const warnings = new Set([
		(hasBlankSpaceNoise ? 'found extra spaces' : undefined),
		(hasBrokenAngleStructure ? 'broken angle structure' : undefined),
	])
	warnings.delete(undefined)

	return {
		parts,
		warnings: [...warnings],
		gibbers,
		confidence,
		grade,
	}
}

// Collect trash values
const createTrashBin = () => {
	const bin = []
  return {
		getBin: () => bin,
		sendToTrash: (name, val, response = undefined) => {
			const proxyLike = proxyBehavior(val)
			const value = !proxyLike ? val : 'proxy behavior detected'
			bin.push({ name, value })
			return response
		},
	}
}

const trashBin = createTrashBin()
const { sendToTrash } = trashBin
const getTrash = () => ({ trashBin: trashBin.getBin() })

function trashHTML(fp, pointsHTML) {
	const { trash: { trashBin, $hash } } = fp
	const trashLen = trashBin.length
	return `
		<div class="${trashLen ? ' trash': ''}">trash (${!trashLen ? '0' : ''+trashLen }):${
			!trashLen ? ' none' : modal(
				'creep-trash',
				trashBin.map((trash, i) => `${i+1}: ${trash.name}: ${trash.value}`).join('<br>'),
				hashSlice($hash),
			)
		}${pointsHTML}</div>`
}

export { sendToTrash, proxyBehavior, gibberish, trustInteger, compressWebGLRenderer, getWebGLRendererParts, hardenWebGLRenderer, getWebGLRendererConfidence, trashBin, getTrash, trashHTML }
