import { attempt, captureError } from '../errors'
import { lieProps, PHANTOM_DARKNESS } from '../lies'
import { sendToTrash, getWebGLRendererConfidence, compressWebGLRenderer } from '../trash'
import { hashMini } from '../utils/crypto'
import { IS_WEBKIT, createTimer, queueEvent, LIKE_BRAVE, logTestResult, performanceLogger, hashSlice, LowerEntropy, getGpuBrand, Analysis } from '../utils/helpers'
import { HTMLNote, count, modal } from '../utils/html'

export default async function getCanvasWebgl() {
	// use short list to improve performance
	const getParamNames = () => [
		// 'BLEND_EQUATION',
		// 'BLEND_EQUATION_RGB',
		// 'BLEND_EQUATION_ALPHA',
		// 'BLEND_DST_RGB',
		// 'BLEND_SRC_RGB',
		// 'BLEND_DST_ALPHA',
		// 'BLEND_SRC_ALPHA',
		// 'BLEND_COLOR',
		// 'CULL_FACE',
		// 'BLEND',
		// 'DITHER',
		// 'STENCIL_TEST',
		// 'DEPTH_TEST',
		// 'SCISSOR_TEST',
		// 'POLYGON_OFFSET_FILL',
		// 'SAMPLE_ALPHA_TO_COVERAGE',
		// 'SAMPLE_COVERAGE',
		// 'LINE_WIDTH',
		'ALIASED_POINT_SIZE_RANGE',
		'ALIASED_LINE_WIDTH_RANGE',
		// 'CULL_FACE_MODE',
		// 'FRONT_FACE',
		// 'DEPTH_RANGE',
		// 'DEPTH_WRITEMASK',
		// 'DEPTH_CLEAR_VALUE',
		// 'DEPTH_FUNC',
		// 'STENCIL_CLEAR_VALUE',
		// 'STENCIL_FUNC',
		// 'STENCIL_FAIL',
		// 'STENCIL_PASS_DEPTH_FAIL',
		// 'STENCIL_PASS_DEPTH_PASS',
		// 'STENCIL_REF',
		'STENCIL_VALUE_MASK',
		'STENCIL_WRITEMASK',
		// 'STENCIL_BACK_FUNC',
		// 'STENCIL_BACK_FAIL',
		// 'STENCIL_BACK_PASS_DEPTH_FAIL',
		// 'STENCIL_BACK_PASS_DEPTH_PASS',
		// 'STENCIL_BACK_REF',
		'STENCIL_BACK_VALUE_MASK',
		'STENCIL_BACK_WRITEMASK',
		// 'VIEWPORT',
		// 'SCISSOR_BOX',
		// 'COLOR_CLEAR_VALUE',
		// 'COLOR_WRITEMASK',
		// 'UNPACK_ALIGNMENT',
		// 'PACK_ALIGNMENT',
		'MAX_TEXTURE_SIZE',
		'MAX_VIEWPORT_DIMS',
		'SUBPIXEL_BITS',
		// 'RED_BITS',
		// 'GREEN_BITS',
		// 'BLUE_BITS',
		// 'ALPHA_BITS',
		// 'DEPTH_BITS',
		// 'STENCIL_BITS',
		// 'POLYGON_OFFSET_UNITS',
		// 'POLYGON_OFFSET_FACTOR',
		// 'SAMPLE_BUFFERS',
		// 'SAMPLES',
		// 'SAMPLE_COVERAGE_VALUE',
		// 'SAMPLE_COVERAGE_INVERT',
		// 'COMPRESSED_TEXTURE_FORMATS',
		// 'GENERATE_MIPMAP_HINT',
		'MAX_VERTEX_ATTRIBS',
		'MAX_VERTEX_UNIFORM_VECTORS',
		'MAX_VARYING_VECTORS',
		'MAX_COMBINED_TEXTURE_IMAGE_UNITS',
		'MAX_VERTEX_TEXTURE_IMAGE_UNITS',
		'MAX_TEXTURE_IMAGE_UNITS',
		'MAX_FRAGMENT_UNIFORM_VECTORS',
		'SHADING_LANGUAGE_VERSION',
		'VENDOR',
		'RENDERER',
		'VERSION',
		'MAX_CUBE_MAP_TEXTURE_SIZE',
		// 'ACTIVE_TEXTURE',
		// 'IMPLEMENTATION_COLOR_READ_TYPE',
		// 'IMPLEMENTATION_COLOR_READ_FORMAT',
		'MAX_RENDERBUFFER_SIZE',
		// 'UNPACK_FLIP_Y_WEBGL',
		// 'UNPACK_PREMULTIPLY_ALPHA_WEBGL',
		// 'UNPACK_COLORSPACE_CONVERSION_WEBGL',
		// 'READ_BUFFER',
		// 'UNPACK_ROW_LENGTH',
		// 'UNPACK_SKIP_ROWS',
		// 'UNPACK_SKIP_PIXELS',
		// 'PACK_ROW_LENGTH',
		// 'PACK_SKIP_ROWS',
		// 'PACK_SKIP_PIXELS',
		// 'UNPACK_SKIP_IMAGES',
		// 'UNPACK_IMAGE_HEIGHT',
		'MAX_3D_TEXTURE_SIZE',
		'MAX_ELEMENTS_VERTICES',
		'MAX_ELEMENTS_INDICES',
		'MAX_TEXTURE_LOD_BIAS',
		'MAX_DRAW_BUFFERS',
		// 'DRAW_BUFFER0',
		// 'DRAW_BUFFER1',
		// 'DRAW_BUFFER2',
		// 'DRAW_BUFFER3',
		// 'DRAW_BUFFER4',
		// 'DRAW_BUFFER5',
		// 'DRAW_BUFFER6',
		// 'DRAW_BUFFER7',
		'MAX_FRAGMENT_UNIFORM_COMPONENTS',
		'MAX_VERTEX_UNIFORM_COMPONENTS',
		// 'FRAGMENT_SHADER_DERIVATIVE_HINT',
		'MAX_ARRAY_TEXTURE_LAYERS',
		// 'MIN_PROGRAM_TEXEL_OFFSET',
		'MAX_PROGRAM_TEXEL_OFFSET',
		'MAX_VARYING_COMPONENTS',
		'MAX_TRANSFORM_FEEDBACK_SEPARATE_COMPONENTS',
		// 'RASTERIZER_DISCARD',
		'MAX_TRANSFORM_FEEDBACK_INTERLEAVED_COMPONENTS',
		'MAX_TRANSFORM_FEEDBACK_SEPARATE_ATTRIBS',
		'MAX_COLOR_ATTACHMENTS',
		'MAX_SAMPLES',
		'MAX_VERTEX_UNIFORM_BLOCKS',
		'MAX_FRAGMENT_UNIFORM_BLOCKS',
		'MAX_COMBINED_UNIFORM_BLOCKS',
		'MAX_UNIFORM_BUFFER_BINDINGS',
		'MAX_UNIFORM_BLOCK_SIZE',
		'MAX_COMBINED_VERTEX_UNIFORM_COMPONENTS',
		'MAX_COMBINED_FRAGMENT_UNIFORM_COMPONENTS',
		// 'UNIFORM_BUFFER_OFFSET_ALIGNMENT',
		'MAX_VERTEX_OUTPUT_COMPONENTS',
		'MAX_FRAGMENT_INPUT_COMPONENTS',
		'MAX_SERVER_WAIT_TIMEOUT',
		// 'TRANSFORM_FEEDBACK_PAUSED',
		// 'TRANSFORM_FEEDBACK_ACTIVE',
		'MAX_ELEMENT_INDEX',
		'MAX_CLIENT_WAIT_TIMEOUT_WEBGL',
	].sort()

	const draw = (gl) => {
		const isSafari15AndAbove = (
			'BigInt64Array' in window &&
			IS_WEBKIT &&
			!/(Cr|Fx)iOS/.test(navigator.userAgent)
		)

		if (!gl || isSafari15AndAbove) {
			return
		}

		// gl.clearColor(0.47, 0.7, 0.78, 1)
		gl.clear(gl.COLOR_BUFFER_BIT)

		// based on https://github.com/Valve/fingerprintjs2/blob/master/fingerprint2.js
		const vertexPosBuffer = gl.createBuffer()
		gl.bindBuffer(gl.ARRAY_BUFFER, vertexPosBuffer)
		const vertices = new Float32Array([-0.9, -0.7, 0, 0.8, -0.7, 0, 0, 0.5, 0])
		gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)

		// create program
		const program = gl.createProgram()

		// compile and attach vertex shader
		const vertexShader = gl.createShader(gl.VERTEX_SHADER)
		gl.shaderSource(vertexShader, `
			attribute vec2 attrVertex;
			varying vec2 varyinTexCoordinate;
			uniform vec2 uniformOffset;
			void main(){
				varyinTexCoordinate = attrVertex + uniformOffset;
				gl_Position = vec4(attrVertex, 0, 1);
			}
		`)
		gl.compileShader(vertexShader)
		gl.attachShader(program, vertexShader)

		// compile and attach fragment shader
		const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)
		gl.shaderSource(fragmentShader, `
			precision mediump float;
			varying vec2 varyinTexCoordinate;
			void main() {
				gl_FragColor = vec4(varyinTexCoordinate, 1, 1);
			}
		`)
		gl.compileShader(fragmentShader)
		gl.attachShader(program, fragmentShader)

		// use program
		const componentSize = 3
		gl.linkProgram(program)
		gl.useProgram(program)
		program.vertexPosAttrib = gl.getAttribLocation(program, 'attrVertex')
		program.offsetUniform = gl.getUniformLocation(program, 'uniformOffset')
		gl.enableVertexAttribArray(program.vertexPosArray)
		gl.vertexAttribPointer(program.vertexPosAttrib, componentSize, gl.FLOAT, false, 0, 0)
		gl.uniform2f(program.offsetUniform, 1, 1)

		// draw
		const numOfIndices = 3
		gl.drawArrays(gl.LINE_LOOP, 0, numOfIndices)
		return gl
	}

	try {
		const timer = createTimer()
		await queueEvent(timer)

		// detect lies
		const dataLie = lieProps['HTMLCanvasElement.toDataURL']
		const contextLie = lieProps['HTMLCanvasElement.getContext']
		const parameterOrExtensionLie = (
			lieProps['WebGLRenderingContext.getParameter'] ||
			lieProps['WebGL2RenderingContext.getParameter'] ||
			lieProps['WebGLRenderingContext.getExtension'] ||
			lieProps['WebGL2RenderingContext.getExtension']
		)
		const lied = (
			dataLie ||
			contextLie ||
			parameterOrExtensionLie ||
			lieProps['WebGLRenderingContext.getSupportedExtensions'] ||
			lieProps['WebGL2RenderingContext.getSupportedExtensions']
		) || false

		// create canvas context
		let win = window
		if (!LIKE_BRAVE && PHANTOM_DARKNESS) {
			win = PHANTOM_DARKNESS
		}
		const doc = win.document

		let canvas; let canvas2
		if ('OffscreenCanvas' in window) {
			// @ts-ignore OffscreenCanvas
			canvas = new win.OffscreenCanvas(256, 256)
			// @ts-ignore OffscreenCanvas
			canvas2 = new win.OffscreenCanvas(256, 256)
		} else {
			canvas = doc.createElement('canvas')
			canvas2 = doc.createElement('canvas')
		}

		const getContext = (canvas, contextType) => {
			try {
				if (contextType == 'webgl2') {
					return (
						canvas.getContext('webgl2') ||
						canvas.getContext('experimental-webgl2')
					)
				}
				return (
					canvas.getContext('webgl') ||
					canvas.getContext('experimental-webgl') ||
					canvas.getContext('moz-webgl') ||
					canvas.getContext('webkit-3d')
				)
			} catch (error) {
				return
			}
		}

		const gl = getContext(canvas, 'webgl')
		const gl2 = getContext(canvas2, 'webgl2')
		if (!gl) {
			logTestResult({ test: 'webgl', passed: false })
			return
		}

		// helpers
		const getShaderPrecisionFormat = (gl, shaderType) => {
			if (!gl) {
				return
			}
			const LOW_FLOAT = attempt(() => gl.getShaderPrecisionFormat(gl[shaderType], gl.LOW_FLOAT))
			const MEDIUM_FLOAT = attempt(() => gl.getShaderPrecisionFormat(gl[shaderType], gl.MEDIUM_FLOAT))
			const HIGH_FLOAT = attempt(() => gl.getShaderPrecisionFormat(gl[shaderType], gl.HIGH_FLOAT))
			const HIGH_INT = attempt(() => gl.getShaderPrecisionFormat(gl[shaderType], gl.HIGH_INT))
			return {
				LOW_FLOAT,
				MEDIUM_FLOAT,
				HIGH_FLOAT,
				HIGH_INT,
			}
		}

		const getShaderData = (name, shader) => {
			const data = {}
			// eslint-disable-next-line guard-for-in
			for (const prop in shader) {
				const obj = shader[prop]
				data[name + '.' + prop + '.precision'] = obj ? attempt(() => obj.precision) : undefined
				data[name + '.' + prop + '.rangeMax'] = obj ? attempt(() => obj.rangeMax) : undefined
				data[name + '.' + prop + '.rangeMin'] = obj ? attempt(() => obj.rangeMin) : undefined
			}
			return data
		}

		const getMaxAnisotropy = (gl) => {
			if (!gl) {
				return
			}
			const ext = (
				gl.getExtension('EXT_texture_filter_anisotropic') ||
				gl.getExtension('MOZ_EXT_texture_filter_anisotropic') ||
				gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic')
			)
			return ext ? gl.getParameter(ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT) : undefined
		}

		const getParams = (gl) => {
			if (!gl) {
				return {}
			}
			const pnamesShortList = new Set(getParamNames())
			const pnames = Object.getOwnPropertyNames(Object.getPrototypeOf(gl))
				// .filter(prop => prop.toUpperCase() == prop) // global test
				.filter((name) => pnamesShortList.has(name))
			return pnames.reduce((acc, name) => {
				const val = gl.getParameter(gl[name])
				if (!!val && 'buffer' in Object.getPrototypeOf(val)) {
					acc[name] = [...val]
				} else {
					acc[name] = val
				}
				return acc
			}, {})
		}

		const getUnmasked = (gl) => {
			const ext = !!gl ? gl.getExtension('WEBGL_debug_renderer_info') : null
			return !ext ? {} : {
				UNMASKED_VENDOR_WEBGL: gl.getParameter(ext.UNMASKED_VENDOR_WEBGL),
				UNMASKED_RENDERER_WEBGL: gl.getParameter(ext.UNMASKED_RENDERER_WEBGL),
			}
		}

		const getSupportedExtensions = (gl) => {
			if (!gl) {
				return []
			}
			const ext = attempt(() => gl.getSupportedExtensions())
			if (!ext) {
				return []
			}
			return ext
		}

		const getWebGLData = (gl, contextType) => {
			if (!gl) {
				return {
					dataURI: undefined,
					pixels: undefined,
				}
			}
			try {
				draw(gl)
				const { drawingBufferWidth, drawingBufferHeight } = gl
				let dataURI = ''
				if (gl.canvas.constructor.name === 'OffscreenCanvas') {
					const canvas = document.createElement('canvas')
					draw(getContext(canvas, contextType))
					dataURI = canvas.toDataURL()
				} else {
					dataURI = gl.canvas.toDataURL()
				}

				// reduce excessive reads to improve performance
				const width = drawingBufferWidth/15
				const height = drawingBufferHeight/6
				const pixels = new Uint8Array(
					width * height * 4,
				)
				try {
					gl.readPixels(
						0,
						0,
						width,
						height,
						gl.RGBA,
						gl.UNSIGNED_BYTE,
						pixels,
					)
				} catch (error) {
					return {
						dataURI,
						pixels: undefined,
					}
				}
				// console.log([...pixels].filter(x => !!x)) // test read
				return {
					dataURI,
					pixels: [...pixels],
				}
			} catch (error) {
				return captureError(error)
			}
		}

		// get data
		await queueEvent(timer)
		const params = { ...getParams(gl), ...getUnmasked(gl) }
		const params2 = { ...getParams(gl2), ...getUnmasked(gl2) }
		const VersionParam: Record<string, boolean> = {
			ALIASED_LINE_WIDTH_RANGE: true,
			SHADING_LANGUAGE_VERSION: true,
			VERSION: true,
		}
		const mismatch = Object.keys(params2)
			.filter((key) => !!params[key] && !VersionParam[key] && ('' + params[key] != '' + params2[key]))

		if (mismatch.length) {
			sendToTrash('webgl/webgl2 mirrored params mismatch', mismatch.toString())
		}

		await queueEvent(timer)
		const { dataURI, pixels } = getWebGLData(gl, 'webgl') || {}
		const { dataURI: dataURI2, pixels: pixels2 } = getWebGLData(gl2, 'webgl2') || {}

		const data = {
			extensions: [...getSupportedExtensions(gl), ...getSupportedExtensions(gl2)],
			pixels,
			pixels2,
			dataURI,
			dataURI2,
			parameters: {
				...{ ...params, ...params2 },
				...{
					antialias: gl.getContextAttributes() ? gl.getContextAttributes().antialias : undefined,
					MAX_VIEWPORT_DIMS: attempt(() => [...gl.getParameter(gl.MAX_VIEWPORT_DIMS)]),
					MAX_TEXTURE_MAX_ANISOTROPY_EXT: getMaxAnisotropy(gl),
					...getShaderData('VERTEX_SHADER', getShaderPrecisionFormat(gl, 'VERTEX_SHADER')),
					...getShaderData('FRAGMENT_SHADER', getShaderPrecisionFormat(gl, 'FRAGMENT_SHADER')),
					MAX_DRAW_BUFFERS_WEBGL: attempt(() => {
						const buffers = gl.getExtension('WEBGL_draw_buffers')
						return buffers ? gl.getParameter(buffers.MAX_DRAW_BUFFERS_WEBGL) : undefined
					}),
				},
			},
			parameterOrExtensionLie,
			lied,
		}

		// Firewall
		const brandCapabilities = ['e9bdc904', 'fca66520', 'b62321c3', 'b362c2f5', '0eb2fc19', '55e821f7', '6951838b', '08847ba5', 'c00582e9', '6edf1720', '2b80fd96', '6346cf49', '2259b706', 'e796b84e', '5a5658f1', '58871380', '5a90a5f8', 'cfd20274', '5582debe', 'e4569a5b', 'f2293447', 'c04889b1', '1b251fd7', 'ea59b343', 'b8ea6e7f', '16c481a6', '58fdc720', 'bf06317e', '6294d84e', 'e6464c9f', 'a397a568', '81b9cd29', '1bfd326c', '70859bdb', '70a095b1', '230d6a0d', '3bf321b8', 'c04e374a', 'be2dfaea', 'f9714b3d', '461f97e1', 'd09c1c07', 'a1c808d5', '0b2d4333', '5ddb9237', '39ead506', '802e2547', '49bf7358', 'c026469d', '581f3282', 'f0d5a3c7', '6357365c', 'ae2c4777', '849ccb64', 'e965d541', '794f8929', '2402c3d2', 'e15afab0', '696e1548', 'afa583bc', 'ea54d525', '5ca55292', 'f51cab9a', '087d5759', '8d371161', 'd860ff42', '1453d59a', '12e92e62', 'b504662d', 'cf9643e6', 'dd67b076', 'a581f55e', 'b224cc7c', '2f014c41', '33bc5492', '0fc123c7', 'dbdbe7a4', 'd2172943', '6864dcb0', '3fea1100', 'd913dafa', 'd6bf35ad', 'a26e9aa9', '171831c5', '534002ab', '12f8ac14', '3ff82303', '99b1a1c6', '74daf866', 'fc37fe1f', '6aa1ff7e', 'ec928655', '8428fc8e', 'd8bd9e5a', '8bd0b91b', '52e348ba', 'c2bce496', 'e142d1f9', '2f582ed9', '4065cd69', '66628310', '903c8847', '1ff7c7e7', '402e1064', 'eb799d34', 'ef8f5db1', 'e155c47e', '177cc258', '6f81cbe7', '6b290cd4', 'f1077334', 'd1e76c89', '5d786cef', 'eaa13804', 'fafa14c0', '2c04c2eb', 'c93b5366', '4962ada1', '25a760b8', 'bf610cdb', 'bcf7315f', '801d73af', '00fe1ec9', '0f39d057', 'f8e65486', '3999a5e1', 'ad01a422', 'dc271c35', 'b50edd99', 'e68b5c4e', '82a9a2f1', '0cdb985d', 'a2383001', 'ce2e3d16', 'c9bc4ffd', 'eed2e5e1', 'e10339b3', 'f7451c92', '43038e3d', '8541aa4c', 'fa994f33', 'b2d6fc98', '6a75ae3b', '67995996', '0f840379', 'e574bef6', 'b5494027', '3660b71f', 'a22788f8', 'e16bb1bb', 'e5962ba3', 'c5e9a883', '5ee41456', '3a91d0d6', 'c05f7596', 'ded74044', 'f5d19934', 'c79634c2', '18579e83', '1e8a9a79', '508d1625', 'd05a66eb', '34270469', 'f3c6ea11', '55d3aa56', '7b2e5242', 'e965d180', '258789d0', 'd2dc2474', 'd498797d', 'ea7f90ea', 'a4d34176', 'c04b0635', '02b3eea3', '6b07d4f8', '6c168801', 'ab40bece', 'a4b988da', '4c9e8f5d', '5aea1af1', '795e5c95', '27db292c', '057857ac', '23d1ce20', '917871e7', 'beffda26', '482c81b2', 'c092fdf8', '6248d9e3', 'e316e4c0', 'ade75c4f', '7360ebd1', '300ee927', '5bef9a39', '3740c4c7', '668f0f93', '6dfae3cb', '9b67b7dc', 'de793ead', '149a1efa', '79a57aa9', 'bfe1c212', '62bf7ef1', '25f9385d', '4027d193', 'e9dbb8d5', 'cba1878b', '4503e771', 'cbeade8c', 'c07307c6', 'cefb72ca', '623c3bfd', '00b72507', '8219e1a4', '61d9464e', '7238c5dd', 'b4d40dcc', '0463627d', '5831d5fd', '0586e20b', '467b99a5', 'b10c2a85', 'f221fef5', '7b811cdd', '99ef2c3b', '5b6a17aa', 'a5a477ae', '19594666', '464d51ac', 'a97d3858', '2048bc5a', '6e806ffc', '698c5c2e', '27938830', '66d992e8', 'c7e37ca0', '78640859', '502c402c', 'd970d345', 'ec050bb6', '741688e4', '61178f2a', '9c814c1b', '79284c47', 'd734ea08', '101e0582', 'ea8f5ad0', '61eecaae', 'dcd9a29e', '48af038f', 'bb77a469', '85479b99', '0639a81a', 'df9daeb6', '9fd76352', '3b724916', '2bb488da', 'fe0997b6', '9e2b5e94', 'f33d918e', 'b8961d15', 'a3f9ee34', 'a9640880', 'bc0f9686', '2d15287f', 'aa73f3a4', '00c1b42d']
		const capabilities = [-2147287810, -2147382251, -2147361769, -2147382272, -2147361792, -2145974612, -2145974598, -2147287834, -2147133749, -2146384027, -2147295822, -2146384003, -1147451901, -2147383246, -2145966545, -2147447137, -1147160553, 349912, -2147429201, -2147459031, -2146384011, -1147464177, -2145966535, -2147440422, -1148326739, 1229835, -2147362760, -2147337003, -2147333118, -2147407821, -2147447161, -2147316383, -2146251641, -1147451883, 999156922, -2146286438, -2146286463, -1147464169, -1147168724, -2147136328, -2147382221, -2147447149, -2147287854, -2130659912, -2146253693, -1148678631, -2147387335, -2147361775, -1147602934, -2147365863, -1147419775, -1962919974, -2147466972, -2145966529, -1164279890, -2147385825, -2147361774, 1147714426, -2147287820, -2147336998, -2147461169, -2147475352, -1148572354, -2146384281, -2147361731, -2147304193, -2147389930, -2147386292, -1962928178, -2147344686, -2147447111, -2147447122, 998804992, -134823971, -2147447873, -2147346747, -2146286583, -2147389951, -2130164388, 184555483, -2147394188, 1610618841, -1332029332, 2147440438, 351513, -2146400384, -2146187766, -1147160399, 1197075, 998911268, -2147295849, -2130164162, -2147385849, -2130164546, -1147765274, -1073719331, -2146417027, -2147365760, 999148597, -1878111124, -677558160, -133757475, -2147128275, -2147453701, -2130172573, -1147419751, -2146526795, -2146236703, -2147410941, -2147415037, -2145974657, -2147306321, -2147378146, -2146237020, -2145966414, -2147453768, -2147291820, -2147470173, -638494755, -1342154787, -2147467172, -2145974489, -1147643759, -2147447892, 83625, -2146232503, -2147295857, -2146253671, -2147316382, -2147429223, -2147390461, -2147291718, -2146526934, -2147447126, -2146384120, 21667, -2145974729, -2147293058, -2146251619, 1099536, -2147142429, -2146379955, -2147365827, -2146400556, -2147295768, -2146251681, -1878102921, -2145974343, 2147475085, -2147394251, -2146232723, -2147400057, -2147414956, -2147439020, -2146319268, -2147406798, -1148680509, -2146277218, 2146590728, -2146400620, -2147414733, -2146376065, -2147387364, -2147386326, -1962893370, -2130164382, -2145933648, -2147447928, -2147448592, -2145974380, -2147133747, -2145941977, -2147407643, -2147447157, -2147300019, 2147479181, -1164800478, -2146232338, -2145974637, -2147453767, -2146401928, -2147365730, -2146384034, -2147475351, -2146232480, -2146236588, -2147447896, -2147295823, -999987216, -2145966441, -2147134974, -1147419753, -2147394484, -16746546, -2146232724, -1148335070, -2146232590, -2146398568, -1164800191, -2147466956, -1147643872, -1148713259, -1147427826, -2147365759, -2147337012, -2145970658, -2147125544, -2147414987, -2147373914, -2147373984, -1147488144, -671082546, -2147361652, -2147374080, -2147287835, -2145974596, 1508998, -2147378041, -2147374032, -2147410938, -2145958228, -2147337022, -2147382130, -2147287811]

		const webglParams = !data.parameters ? undefined : [
			...new Set(Object.values(data.parameters)
				.filter((val) => val && typeof val != 'string')
				.flat()
				.map((val) => Number(val))),
		].sort((a, b) => (a - b))

		const gpuBrand = getGpuBrand(data.parameters?.UNMASKED_RENDERER_WEBGL)
		const webglParamsStr = ''+webglParams
		const webglBrandCapabilities = !gpuBrand || !webglParamsStr ? undefined : hashMini([gpuBrand, webglParamsStr])
		const webglCapabilities = !webglParams ? undefined : webglParams.reduce((acc, val, i) => acc ^ (+val + i), 0)
		Analysis.webglParams = webglParamsStr
		Analysis.webglBrandCapabilities = webglBrandCapabilities
		Analysis.webglCapabilities = webglCapabilities
		const hasSusGpu = webglBrandCapabilities && !brandCapabilities.includes(webglBrandCapabilities)
		const hasSusCapabilities = webglCapabilities && !capabilities.includes(webglCapabilities)

		if (hasSusGpu) {
			LowerEntropy.WEBGL = true
			sendToTrash('WebGLRenderingContext.getParameter', 'suspicious gpu')
		}

		if (hasSusCapabilities) {
			LowerEntropy.WEBGL = true
			sendToTrash('WebGLRenderingContext.getParameter', 'suspicious capabilities')
		}

		logTestResult({ time: timer.stop(), test: 'webgl', passed: true })
		return {
			...data,
			gpu: {
				...(getWebGLRendererConfidence((data.parameters||{}).UNMASKED_RENDERER_WEBGL) || {}),
				compressedGPU: compressWebGLRenderer((data.parameters||{}).UNMASKED_RENDERER_WEBGL),
			},
		}
	} catch (error) {
		logTestResult({ test: 'webgl', passed: false })
		captureError(error)
		return
	}
}

export function webglHTML(fp) {
	if (!fp.canvasWebgl) {
		return `
		<div class="col-six undefined">
			<strong>WebGL</strong>
			<div>images: ${HTMLNote.BLOCKED}</div>
			<div>pixels: ${HTMLNote.BLOCKED}</div>
			<div>params (0): ${HTMLNote.BLOCKED}</div>
			<div>exts (0): ${HTMLNote.BLOCKED}</div>
			<div>gpu:</div>
			<div class="block-text">${HTMLNote.BLOCKED}</div>
			<div class="gl-image"></div>
		</div>`
	}
	const { canvasWebgl: data } = fp
	const id = 'creep-canvas-webgl'

	const {
		$hash,
		dataURI,
		dataURI2,
		pixels,
		pixels2,
		lied,
		extensions,
		parameters,
		gpu,
	} = data || {}

	const {
		parts,
		warnings,
		gibbers,
		confidence,
		grade: confidenceGrade,
		compressedGPU,
	} = gpu || {}

	const paramKeys = parameters ? Object.keys(parameters).sort() : []

	return `

	<div class="relative col-six${lied ? ' rejected' : ''}">
		<span class="time">${performanceLogger.getLog().webgl}</span>
		<strong>WebGL</strong><span class="${lied ? 'lies ' : (LowerEntropy.CANVAS || LowerEntropy.WEBGL) ? 'bold-fail ' : ''}hash">${hashSlice($hash)}</span>
		<div>images:${
			!dataURI ? ' '+HTMLNote.BLOCKED : `<span class="sub-hash">${hashMini(dataURI)}</span>${!dataURI2 || dataURI == dataURI2 ? '' : `<span class="sub-hash">${hashMini(dataURI2)}</span>`}`
		}</div>
		<div>pixels:${
			!pixels ? ' '+HTMLNote.BLOCKED: `<span class="sub-hash">${hashSlice(pixels)}</span>${!pixels2 || pixels == pixels2 ? '' : `<span class="sub-hash">${hashSlice(pixels2)}</span>`}`
		}</div>
		<div>params (${count(paramKeys)}): ${
			!paramKeys.length ? HTMLNote.BLOCKED :
			modal(
				`${id}-parameters`,
				paramKeys.map((key) => `${key}: ${parameters[key]}`).join('<br>'),
				hashMini(parameters),
			)
		}</div>
		<div>exts (${count(extensions)}): ${
			!extensions.length ? HTMLNote.BLOCKED :
			modal(
				`${id}-extensions`,
				extensions.sort().join('<br>'),
				hashMini(extensions),
			)
		}</div>

		<div class="relative">gpu:${
			confidence ? `<span class="confidence-note">confidence: <span class="scale-up grade-${confidenceGrade}">${confidence}</span></span>` : ''
		}</div>
		<div class="block-text help" title="${
			confidence ? `\nWebGLRenderingContext.getParameter()\ngpu compressed: ${compressedGPU}\nknown parts: ${parts || 'none'}\ngibberish: ${gibbers || 'none'}\nwarnings: ${warnings.join(', ') || 'none'}` : 'WebGLRenderingContext.getParameter()'
		}">
			<div>
				${parameters.UNMASKED_VENDOR_WEBGL ? parameters.UNMASKED_VENDOR_WEBGL : ''}
				${!parameters.UNMASKED_RENDERER_WEBGL ? HTMLNote.BLOCKED : `<br>${parameters.UNMASKED_RENDERER_WEBGL}`}
			</div>
		</div>
		${!dataURI ? '<div class="gl-image"></div>' : `<image class="gl-image" src="${dataURI}"/>`}
	</div>
	`
}
