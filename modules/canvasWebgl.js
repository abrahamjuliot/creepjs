export const getCanvasWebgl = imports => {

	const {
		require: {
			hashify,
			captureError,
			attempt,
			caniuse,
			gibberish,
			sendToTrash,
			proxyBehavior,
			lieProps,
			phantomDarkness,
			logTestResult
		}
	} = imports

	return new Promise(async resolve => {
		try {
			// detect lies
			const dataLie = lieProps['HTMLCanvasElement.toDataURL']
			const contextLie = lieProps['HTMLCanvasElement.getContext']
			let lied = (
				dataLie ||
				contextLie ||
				lieProps['WebGLRenderingContext.getParameter'] ||
				lieProps['WebGL2RenderingContext.getParameter'] ||
				lieProps['WebGLRenderingContext.getExtension'] ||
				lieProps['WebGL2RenderingContext.getExtension'] ||
				lieProps['WebGLRenderingContext.getSupportedExtensions'] ||
				lieProps['WebGL2RenderingContext.getSupportedExtensions']
			) || false
			if (phantomDarkness &&
				phantomDarkness.document.createElement('canvas').toDataURL() != document.createElement('canvas').toDataURL()) {
				lied = true
			}
			// create canvas context
			const doc = (
				phantomDarkness ? phantomDarkness.document : 
				document
			)
			const canvas = doc.createElement('canvas')
			const canvas2 = doc.createElement('canvas')
			const context = (
				canvas.getContext('webgl') ||
				canvas.getContext('experimental-webgl') ||
				canvas.getContext('moz-webgl') ||
				canvas.getContext('webkit-3d')
			)
			const context2 = canvas2.getContext('webgl2') || canvas2.getContext('experimental-webgl2')
			const getSupportedExtensions = context => {
				return new Promise(async resolve => {
					try {
						if (!context) {
							return resolve({ extensions: [] })
						}
						const extensions = caniuse(() => context, ['getSupportedExtensions'], [], true) || []
						return resolve({
							extensions
						})
					}
					catch (error) {
						captureError(error)
						return resolve({
							extensions: []
						})
					}
				})
			}

			const getSpecs = (webgl, webgl2) => {
				return new Promise(async resolve => {
					const getShaderPrecisionFormat = (gl, shaderType) => {
						const low = attempt(() => gl.getShaderPrecisionFormat(gl[shaderType], gl.LOW_FLOAT))
						const medium = attempt(() => gl.getShaderPrecisionFormat(gl[shaderType], gl.MEDIUM_FLOAT))
						const high = attempt(() => gl.getShaderPrecisionFormat(gl[shaderType], gl.HIGH_FLOAT))
						const highInt = attempt(() => gl.getShaderPrecisionFormat(gl[shaderType], gl.HIGH_INT))
						return { low, medium, high, highInt }
					}
					const getMaxAnisotropy = gl => {
						const ext = (
							gl.getExtension('EXT_texture_filter_anisotropic') ||
							gl.getExtension('MOZ_EXT_texture_filter_anisotropic') ||
							gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic')
						)
						return ext ? gl.getParameter(ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT) : undefined
					}
					
					const getShaderData = (name, shader) => {
						const data = {}
						for (const prop in shader) {
							const obj = shader[prop]
							data[name+'.'+prop+'.precision'] = obj ? attempt(() => obj.precision) : undefined
							data[name+'.'+prop+'.rangeMax'] = obj ? attempt(() => obj.rangeMax) : undefined
							data[name+'.'+prop+'.rangeMin'] = obj ? attempt(() => obj.rangeMin) : undefined
						}
						return data
					}
					const getWebglSpecs = gl => {
						if (!caniuse(() => gl, ['getParameter'])) {
							return undefined
						}
						const data =  {
							VERSION: gl.getParameter(gl.VERSION),
							SHADING_LANGUAGE_VERSION: gl.getParameter(gl.SHADING_LANGUAGE_VERSION),
							antialias: gl.getContextAttributes() ? gl.getContextAttributes().antialias : undefined,
							RED_BITS: gl.getParameter(gl.RED_BITS),
							GREEN_BITS: gl.getParameter(gl.GREEN_BITS),
							BLUE_BITS: gl.getParameter(gl.BLUE_BITS),
							ALPHA_BITS: gl.getParameter(gl.ALPHA_BITS),
							DEPTH_BITS: gl.getParameter(gl.DEPTH_BITS),
							STENCIL_BITS: gl.getParameter(gl.STENCIL_BITS),
							MAX_RENDERBUFFER_SIZE: gl.getParameter(gl.MAX_RENDERBUFFER_SIZE),
							MAX_COMBINED_TEXTURE_IMAGE_UNITS: gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS),
							MAX_CUBE_MAP_TEXTURE_SIZE: gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE),
							MAX_FRAGMENT_UNIFORM_VECTORS: gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS),
							MAX_TEXTURE_IMAGE_UNITS: gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS),
							MAX_TEXTURE_SIZE: gl.getParameter(gl.MAX_TEXTURE_SIZE),
							MAX_VARYING_VECTORS: gl.getParameter(gl.MAX_VARYING_VECTORS),
							MAX_VERTEX_ATTRIBS: gl.getParameter(gl.MAX_VERTEX_ATTRIBS),
							MAX_VERTEX_TEXTURE_IMAGE_UNITS: gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS),
							MAX_VERTEX_UNIFORM_VECTORS: gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS),
							ALIASED_LINE_WIDTH_RANGE: [...gl.getParameter(gl.ALIASED_LINE_WIDTH_RANGE)],
							ALIASED_POINT_SIZE_RANGE: [...gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE)],
							MAX_VIEWPORT_DIMS: attempt(() => [...gl.getParameter(gl.MAX_VIEWPORT_DIMS)]),
							MAX_TEXTURE_MAX_ANISOTROPY_EXT: getMaxAnisotropy(gl),
							...getShaderData('VERTEX_SHADER', getShaderPrecisionFormat(gl, 'VERTEX_SHADER')),
							...getShaderData('FRAGMENT_SHADER', getShaderPrecisionFormat(gl, 'FRAGMENT_SHADER')),
							MAX_DRAW_BUFFERS_WEBGL: attempt(() => {
								const buffers = gl.getExtension('WEBGL_draw_buffers')
								return buffers ? gl.getParameter(buffers.MAX_DRAW_BUFFERS_WEBGL) : undefined
							})
						}
						const response = data
						return response
					}

					const getWebgl2Specs = gl => {
						if (!caniuse(() => gl, ['getParameter'])) {
							return undefined
						}
						const data = {
							MAX_VERTEX_UNIFORM_COMPONENTS: gl.getParameter(gl.MAX_VERTEX_UNIFORM_COMPONENTS),
							MAX_VERTEX_UNIFORM_BLOCKS: gl.getParameter(gl.MAX_VERTEX_UNIFORM_BLOCKS),
							MAX_VERTEX_OUTPUT_COMPONENTS: gl.getParameter(gl.MAX_VERTEX_OUTPUT_COMPONENTS),
							MAX_VARYING_COMPONENTS: gl.getParameter(gl.MAX_VARYING_COMPONENTS),
							MAX_FRAGMENT_UNIFORM_COMPONENTS: gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_COMPONENTS),
							MAX_FRAGMENT_UNIFORM_BLOCKS: gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_BLOCKS),
							MAX_FRAGMENT_INPUT_COMPONENTS: gl.getParameter(gl.MAX_FRAGMENT_INPUT_COMPONENTS),
							MIN_PROGRAM_TEXEL_OFFSET: gl.getParameter(gl.MIN_PROGRAM_TEXEL_OFFSET),
							MAX_PROGRAM_TEXEL_OFFSET: gl.getParameter(gl.MAX_PROGRAM_TEXEL_OFFSET),
							MAX_DRAW_BUFFERS: gl.getParameter(gl.MAX_DRAW_BUFFERS),
							MAX_COLOR_ATTACHMENTS: gl.getParameter(gl.MAX_COLOR_ATTACHMENTS),
							MAX_SAMPLES: gl.getParameter(gl.MAX_SAMPLES),
							MAX_3D_TEXTURE_SIZE: gl.getParameter(gl.MAX_3D_TEXTURE_SIZE),
							MAX_ARRAY_TEXTURE_LAYERS: gl.getParameter(gl.MAX_ARRAY_TEXTURE_LAYERS),
							MAX_TEXTURE_LOD_BIAS: gl.getParameter(gl.MAX_TEXTURE_LOD_BIAS),
							MAX_UNIFORM_BUFFER_BINDINGS: gl.getParameter(gl.MAX_UNIFORM_BUFFER_BINDINGS),
							MAX_UNIFORM_BLOCK_SIZE: gl.getParameter(gl.MAX_UNIFORM_BLOCK_SIZE),
							UNIFORM_BUFFER_OFFSET_ALIGNMENT: gl.getParameter(gl.UNIFORM_BUFFER_OFFSET_ALIGNMENT),
							MAX_COMBINED_UNIFORM_BLOCKS: gl.getParameter(gl.MAX_COMBINED_UNIFORM_BLOCKS),
							MAX_COMBINED_VERTEX_UNIFORM_COMPONENTS: gl.getParameter(gl.MAX_COMBINED_VERTEX_UNIFORM_COMPONENTS),
							MAX_COMBINED_FRAGMENT_UNIFORM_COMPONENTS: gl.getParameter(gl.MAX_COMBINED_FRAGMENT_UNIFORM_COMPONENTS),
							MAX_TRANSFORM_FEEDBACK_INTERLEAVED_COMPONENTS: gl.getParameter(gl.MAX_TRANSFORM_FEEDBACK_INTERLEAVED_COMPONENTS),
							MAX_TRANSFORM_FEEDBACK_SEPARATE_ATTRIBS: gl.getParameter(gl.MAX_TRANSFORM_FEEDBACK_SEPARATE_ATTRIBS),
							MAX_TRANSFORM_FEEDBACK_SEPARATE_COMPONENTS: gl.getParameter(gl.MAX_TRANSFORM_FEEDBACK_SEPARATE_COMPONENTS),
							MAX_ELEMENT_INDEX: gl.getParameter(gl.MAX_ELEMENT_INDEX),
							MAX_SERVER_WAIT_TIMEOUT: gl.getParameter(gl.MAX_SERVER_WAIT_TIMEOUT)
						}
						const response = data
						return response
					}
					const data = { webglSpecs: getWebglSpecs(webgl), webgl2Specs: getWebgl2Specs(webgl2) }
					return resolve(data)
				})
			}

			const getUnmasked = (context, [rendererTitle, vendorTitle]) => {
				return new Promise(async resolve => {
					try {
						if (!context) {
							return resolve({
								vendor: undefined,
								renderer: undefined
							})
						}
						const extension = caniuse(() => context, ['getExtension'], ['WEBGL_debug_renderer_info'], true)
						const vendor = extension && context.getParameter(extension.UNMASKED_VENDOR_WEBGL)
						const renderer = extension && context.getParameter(extension.UNMASKED_RENDERER_WEBGL)
						const validate = (value, title) => {

							const gibbers = gibberish(value)
							if (!!gibbers.length) {	
								sendToTrash(`${title} contains gibberish`, `[${gibbers.join(', ')}] ${value}`)	
							}

							return (
								!proxyBehavior(value) ? value : 
								sendToTrash(title, 'proxy behavior detected')
							)
						}
						return resolve ({
							vendor: validate(vendor, vendorTitle),
							renderer: validate(renderer, rendererTitle)
						})
					}
					catch (error) {
						captureError(error)
						return resolve({
							vendor: undefined,
							renderer: undefined
						})
					}
				})
			}
			const getDataURL = (canvas, context) => {
				return new Promise(async resolve => {
					try {
						const colorBufferBit = caniuse(() => context, ['COLOR_BUFFER_BIT'])
						caniuse(() => context, ['clearColor'], [0.2, 0.4, 0.6, 0.8], true)
						caniuse(() => context, ['clear'], [colorBufferBit], true)
						const canvasWebglDataURI = canvas.toDataURL()
						const dataURI = canvasWebglDataURI
						const $hash = await hashify(dataURI)
						return resolve({ dataURI, $hash })
					}
					catch (error) {
						captureError(error)
						return resolve({ dataURI: undefined, $hash: undefined })
					}
				})
			}

			const [
				supported,
				supported2,
				unmasked,
				unmasked2,
				dataURI,
				dataURI2,
				specs
			] = await Promise.all([
				getSupportedExtensions(context),
				getSupportedExtensions(context2),
				getUnmasked(context, ['webgl renderer', 'webgl vendor']),
				getUnmasked(context2, ['webgl2 renderer', 'webgl2 vendor']),
				getDataURL(canvas, context),
				getDataURL(canvas2, context2),
				getSpecs(context, context2)
			]).catch(error => {
				console.error(error.message)
			})

			const data = {
				supported,
				supported2,
				unmasked,
				unmasked2,
				dataURI,
				dataURI2,
				specs,
				lied
			}
			data.matchingUnmasked = JSON.stringify(data.unmasked) === JSON.stringify(data.unmasked2)
			data.matchingDataURI = data.dataURI.$hash === data.dataURI2.$hash

			const $hash = await hashify(data)
			logTestResult({ test: 'webgl', passed: true })
			return resolve({ ...data, $hash })
		}
		catch (error) {
			logTestResult({ test: 'webgl', passed: false })
			captureError(error)
			return resolve()
		}
	})
}