const pnames = new Set([
	'BLEND_EQUATION',
	'BLEND_EQUATION_RGB',
	'BLEND_EQUATION_ALPHA',
	'BLEND_DST_RGB',
	'BLEND_SRC_RGB',
	'BLEND_DST_ALPHA',
	'BLEND_SRC_ALPHA',
	'BLEND_COLOR',
	'CULL_FACE',
	'BLEND',
	'DITHER',
	'STENCIL_TEST',
	'DEPTH_TEST',
	'SCISSOR_TEST',
	'POLYGON_OFFSET_FILL',
	'SAMPLE_ALPHA_TO_COVERAGE',
	'SAMPLE_COVERAGE',
	'LINE_WIDTH',
	'ALIASED_POINT_SIZE_RANGE',
	'ALIASED_LINE_WIDTH_RANGE',
	'CULL_FACE_MODE',
	'FRONT_FACE',
	'DEPTH_RANGE',
	'DEPTH_WRITEMASK',
	'DEPTH_CLEAR_VALUE',
	'DEPTH_FUNC',
	'STENCIL_CLEAR_VALUE',
	'STENCIL_FUNC',
	'STENCIL_FAIL',
	'STENCIL_PASS_DEPTH_FAIL',
	'STENCIL_PASS_DEPTH_PASS',
	'STENCIL_REF',
	'STENCIL_VALUE_MASK',
	'STENCIL_WRITEMASK',
	'STENCIL_BACK_FUNC',
	'STENCIL_BACK_FAIL',
	'STENCIL_BACK_PASS_DEPTH_FAIL',
	'STENCIL_BACK_PASS_DEPTH_PASS',
	'STENCIL_BACK_REF',
	'STENCIL_BACK_VALUE_MASK',
	'STENCIL_BACK_WRITEMASK',
	'VIEWPORT',
	'SCISSOR_BOX',
	'COLOR_CLEAR_VALUE',
	'COLOR_WRITEMASK',
	'UNPACK_ALIGNMENT',
	'PACK_ALIGNMENT',
	'MAX_TEXTURE_SIZE',
	'MAX_VIEWPORT_DIMS',
	'SUBPIXEL_BITS',
	'RED_BITS',
	'GREEN_BITS',
	'BLUE_BITS',
	'ALPHA_BITS',
	'DEPTH_BITS',
	'STENCIL_BITS',
	'POLYGON_OFFSET_UNITS',
	'POLYGON_OFFSET_FACTOR',
	'SAMPLE_BUFFERS',
	'SAMPLES',
	'SAMPLE_COVERAGE_VALUE',
	'SAMPLE_COVERAGE_INVERT',
	'COMPRESSED_TEXTURE_FORMATS',
	'GENERATE_MIPMAP_HINT',
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
	'ACTIVE_TEXTURE',
	'IMPLEMENTATION_COLOR_READ_TYPE',
	'IMPLEMENTATION_COLOR_READ_FORMAT',
	'MAX_RENDERBUFFER_SIZE',
	'UNPACK_FLIP_Y_WEBGL',
	'UNPACK_PREMULTIPLY_ALPHA_WEBGL',
	'UNPACK_COLORSPACE_CONVERSION_WEBGL',
	'READ_BUFFER',
	'UNPACK_ROW_LENGTH',
	'UNPACK_SKIP_ROWS',
	'UNPACK_SKIP_PIXELS',
	'PACK_ROW_LENGTH',
	'PACK_SKIP_ROWS',
	'PACK_SKIP_PIXELS',
	'UNPACK_SKIP_IMAGES',
	'UNPACK_IMAGE_HEIGHT',
	'MAX_3D_TEXTURE_SIZE',
	'MAX_ELEMENTS_VERTICES',
	'MAX_ELEMENTS_INDICES',
	'MAX_TEXTURE_LOD_BIAS',
	'MAX_DRAW_BUFFERS',
	'DRAW_BUFFER0',
	'DRAW_BUFFER1',
	'DRAW_BUFFER2',
	'DRAW_BUFFER3',
	'DRAW_BUFFER4',
	'DRAW_BUFFER5',
	'DRAW_BUFFER6',
	'DRAW_BUFFER7',
	'MAX_FRAGMENT_UNIFORM_COMPONENTS',
	'MAX_VERTEX_UNIFORM_COMPONENTS',
	'FRAGMENT_SHADER_DERIVATIVE_HINT',
	'MAX_ARRAY_TEXTURE_LAYERS',
	'MIN_PROGRAM_TEXEL_OFFSET',
	'MAX_PROGRAM_TEXEL_OFFSET',
	'MAX_VARYING_COMPONENTS',
	'MAX_TRANSFORM_FEEDBACK_SEPARATE_COMPONENTS',
	'RASTERIZER_DISCARD',
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
	'UNIFORM_BUFFER_OFFSET_ALIGNMENT',
	'MAX_VERTEX_OUTPUT_COMPONENTS',
	'MAX_FRAGMENT_INPUT_COMPONENTS',
	'MAX_SERVER_WAIT_TIMEOUT',
	'TRANSFORM_FEEDBACK_PAUSED',
	'TRANSFORM_FEEDBACK_ACTIVE',
	'MAX_ELEMENT_INDEX',
	'MAX_CLIENT_WAIT_TIMEOUT_WEBGL'
])

const draw = gl => {
	//gl.clearColor(0.47, 0.7, 0.78, 1)
	gl.clear(gl.COLOR_BUFFER_BIT)

	// based on https://github.com/Valve/fingerprintjs2/blob/master/fingerprint2.js
	const vertexPosBuffer = gl.createBuffer()
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexPosBuffer)
	const vertices = new Float32Array([-0.9, -0.7, 0, 0.8, -0.7, 0, 0, 0.5, 0])
	gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)

	vertexPosBuffer.itemSize = 3
	vertexPosBuffer.numItems = 3

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
	gl.linkProgram(program)
	gl.useProgram(program)
	program.vertexPosAttrib = gl.getAttribLocation(program, 'attrVertex')
	program.offsetUniform = gl.getUniformLocation(program, 'uniformOffset')
	gl.enableVertexAttribArray(program.vertexPosArray)
	gl.vertexAttribPointer(program.vertexPosAttrib, vertexPosBuffer.itemSize, gl.FLOAT, false, 0, 0)
	gl.uniform2f(program.offsetUniform, 1, 1)

	// draw
	gl.drawArrays(gl.LINE_LOOP, 0, vertexPosBuffer.numItems)

	return gl
}

export const getCanvasWebgl = async imports => {

	const {
		require: {
			captureError,
			attempt,
			gibberish,
			sendToTrash,
			lieProps,
			phantomDarkness,
			dragonOfDeath,
			logTestResult,
			compressWebGLRenderer,
			getWebGLRendererConfidence 
		}
	} = imports

	try {
		const start = performance.now()
		// detect lies
		const dataLie = lieProps['HTMLCanvasElement.toDataURL']
		const contextLie = lieProps['HTMLCanvasElement.getContext']
		const parameterOrExtensionLie = (
			lieProps['WebGLRenderingContext.getParameter'] ||
			lieProps['WebGL2RenderingContext.getParameter'] ||
			lieProps['WebGLRenderingContext.getExtension'] ||
			lieProps['WebGL2RenderingContext.getExtension']
		)
		let lied = (
			dataLie ||
			contextLie ||
			parameterOrExtensionLie ||
			lieProps['WebGLRenderingContext.getSupportedExtensions'] ||
			lieProps['WebGL2RenderingContext.getSupportedExtensions']
		) || false
		if (dragonOfDeath &&
			dragonOfDeath.document.createElement('canvas').toDataURL() != document.createElement('canvas').toDataURL()) {
			lied = true
		}

		// create canvas context
		const win = phantomDarkness ? phantomDarkness : window
		const doc = win.document
		let canvas, canvas2
		if ('OffscreenCanvas' in window) {
			canvas = new win.OffscreenCanvas(256, 256)
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
			}
			catch (error) {
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
				HIGH_INT
			}
		}

		const getShaderData = (name, shader) => {
			const data = {}
			for (const prop in shader) {
				const obj = shader[prop]
				data[name + '.' + prop + '.precision'] = obj ? attempt(() => obj.precision) : undefined
				data[name + '.' + prop + '.rangeMax'] = obj ? attempt(() => obj.rangeMax) : undefined
				data[name + '.' + prop + '.rangeMin'] = obj ? attempt(() => obj.rangeMin) : undefined
			}
			return data
		}

		const getMaxAnisotropy = gl => {
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

		const getParams = gl => {
			if (!gl) {
				return {}
			}
			const data = Object
				.getOwnPropertyNames(Object.getPrototypeOf(gl))
				//.filter(prop => prop.toUpperCase() == prop) // global test
				.filter(name => pnames.has(name))
				.reduce((acc, name) => {
					let val = gl.getParameter(gl[name])
					if (!!val && 'buffer' in Object.getPrototypeOf(val)) {
						acc[name] = [...val]
					} else {
						acc[name] = val
					}
					return acc
				}, {})
			return data
		}

		const getUnmasked = gl => {
			const ext = !!gl ? gl.getExtension('WEBGL_debug_renderer_info') : null
			if (!ext) {
				return {}
			}
			const UNMASKED_VENDOR_WEBGL = gl.getParameter(ext.UNMASKED_VENDOR_WEBGL)
			const UNMASKED_RENDERER_WEBGL = gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)
			const vendorGibbers = gibberish(UNMASKED_VENDOR_WEBGL)
			const rendererGibbers = gibberish(UNMASKED_RENDERER_WEBGL)
			const { name } = Object.getPrototypeOf(gl).constructor
			if (vendorGibbers.length) {
				sendToTrash(`${name} vendor is gibberish`, `[${vendorGibbers.join(', ')}] ${UNMASKED_VENDOR_WEBGL}`)
			}
			if (rendererGibbers.length) {
				sendToTrash(`${name} renderer is gibberish`, `[${rendererGibbers.join(', ')}] ${UNMASKED_RENDERER_WEBGL}`)
			}
			return {
				UNMASKED_VENDOR_WEBGL,
				UNMASKED_RENDERER_WEBGL
			}
		}

		const getSupportedExtensions = gl => {
			if (!gl) {
				return []
			}
			const ext = attempt(() => gl.getSupportedExtensions())
			if (!ext) {
				return []
			}
			return ext
		}

		const getDataURI = contextType => {
			try {
				const canvas = doc.createElement('canvas')
				const gl = getContext(canvas, contextType)
				draw(gl)
				return canvas.toDataURL()
			}
			catch (error) {
				return
			}
		}

		const getPixels = gl => {
			if (!gl) {
				return []
			}
			const width = gl.drawingBufferWidth
			const height = gl.drawingBufferHeight
			try {
				draw(gl)
				const pixels = new Uint8Array(width * height * 4)
				gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels)
				return [...pixels]
			}
			catch (error) {
				return []
			}
		}

		// get data
		const params = { ...getParams(gl), ...getUnmasked(gl) }
		const params2 = { ...getParams(gl2), ...getUnmasked(gl2) }
		const mismatch = Object.keys(params2)
			.filter(key => !!params[key] && '' + params[key] != '' + params2[key])
			.toString()
			.replace('SHADING_LANGUAGE_VERSION,VERSION', '')
		if (mismatch) {
			sendToTrash('webgl/webgl2 mirrored params mismatch', mismatch)
		}

		const data = {
			extensions: [...getSupportedExtensions(gl), ...getSupportedExtensions(gl2)],
			pixels: getPixels(gl),
			pixels2: getPixels(gl2),
			dataURI: getDataURI('webgl'),
			dataURI2: getDataURI('webgl2'),
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
					})
				}
			},
			parameterOrExtensionLie,
			lied
		}

		logTestResult({ start, test: 'webgl', passed: true })
		return {
			...data,
			gpu: {
				...(getWebGLRendererConfidence((data.parameters||{}).UNMASKED_RENDERER_WEBGL) || {}),
				compressedGPU: compressWebGLRenderer((data.parameters||{}).UNMASKED_RENDERER_WEBGL)
			}
		}
	}
	catch (error) {
		logTestResult({ test: 'webgl', passed: false })
		captureError(error)
		return
	}
}

export const webglHTML = ({ fp, note, count, modal, hashMini, hashSlice }) => {
	if (!fp.canvasWebgl) {
		return `
		<div class="col-four undefined">
			<strong>WebGL</strong>
			<div>images: ${note.blocked}</div>
			<div>pixels: ${note.blocked}</div>
			<div>params (0): ${note.blocked}</div>
			<div>exts (0): ${note.blocked}</div>
		</div>
		<div class="col-four undefined">
			<div>gpu:</div>
			<div class="block-text">${note.blocked}</div>
		</div>
		<div class="col-four undefined"><image /></div>`
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
		gpu
	} = data || {}

	const {
		parts,
		warnings,
		gibbers,
		confidence,
		grade: confidenceGrade,
		compressedGPU
	} = gpu || {}
	
	const paramKeys = parameters ? Object.keys(parameters).sort() : []
	
	return `
	<div class="col-four${lied ? ' rejected' : ''}">
		<strong>WebGL</strong><span class="${lied ? 'lies ' : ''}hash">${hashSlice($hash)}</span>
		<div>images:${
			!dataURI ? ' '+note.blocked : `<span class="sub-hash">${hashMini(dataURI)}</span>${!dataURI2 || dataURI == dataURI2 ? '' : `<span class="sub-hash">${hashMini(dataURI2)}</span>`}`
		}</div>
		<div>pixels:${
			!pixels ? ' '+note.blocked : `<span class="sub-hash">${hashSlice(pixels)}</span>${!pixels2 || pixels == pixels2 ? '' : `<span class="sub-hash">${hashSlice(pixels2)}</span>`}`
		}</div>
		<div>params (${count(paramKeys)}): ${
			!paramKeys.length ? note.blocked :
			modal(
				`${id}-parameters`,
				paramKeys.map(key => `${key}: ${parameters[key]}`).join('<br>'),
				hashMini(parameters)
			)
		}</div>
		<div>exts (${count(extensions)}): ${
			!extensions.length ? note.blocked : 
			modal(
				`${id}-extensions`,
				extensions.sort().join('<br>'),
				hashMini(extensions)
			)
		}</div>
	</div>
	<div class="col-four${!parameters.UNMASKED_RENDERER_WEBGL ? ' undefined' : lied ? ' rejected' : ''} relative">
		${
			confidence ? `<span class="confidence-note">confidence: <span class="scale-up grade-${confidenceGrade}">${confidence}</span></span>` : ''
		}
		<div>gpu:</div>
		<div class="block-text help" title="${
			confidence ? `\nWebGLRenderingContext.getParameter()\ngpu compressed: ${compressedGPU}\nknown parts: ${parts || 'none'}\ngibberish: ${gibbers || 'none'}\nwarnings: ${warnings.join(', ') || 'none'}` : 'WebGLRenderingContext.getParameter()'
		}">
			<div>
				${parameters.UNMASKED_VENDOR_WEBGL ? parameters.UNMASKED_VENDOR_WEBGL : ''}
				${!parameters.UNMASKED_RENDERER_WEBGL ? note.blocked : `<br>${parameters.UNMASKED_RENDERER_WEBGL}`}
			</div>
		</div>
	</div>
	<div class="col-four${lied ? ' rejected' : ''}"><image ${!dataURI ? '' : `width="100%" src="${dataURI}"`}/></div>
	`
}