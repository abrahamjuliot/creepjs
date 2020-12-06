/* parameter helpers */
// https://developer.mozilla.org/en-US/docs/Web/API/EXT_texture_filter_anisotropic
const getMaxAnisotropy = context => {
    try {
        const extension = (
            context.getExtension('EXT_texture_filter_anisotropic') ||
            context.getExtension('WEBKIT_EXT_texture_filter_anisotropic') ||
            context.getExtension('MOZ_EXT_texture_filter_anisotropic')
        )
        return context.getParameter(extension.MAX_TEXTURE_MAX_ANISOTROPY_EXT)
    } catch (error) {
        return
    }
}

// https://developer.mozilla.org/en-US/docs/Web/API/WEBGL_draw_buffers
const getMaxDrawBuffers = context => {
    try {
        const extension = (
            context.getExtension('WEBGL_draw_buffers') ||
            context.getExtension('WEBKIT_WEBGL_draw_buffers') ||
            context.getExtension('MOZ_WEBGL_draw_buffers')
        )
        return context.getParameter(extension.MAX_DRAW_BUFFERS_WEBGL)
    } catch (error) {
        return
    }
}

// https://developer.mozilla.org/en-US/docs/Web/API/WebGLShaderPrecisionFormat/precision
// https://developer.mozilla.org/en-US/docs/Web/API/WebGLShaderPrecisionFormat/rangeMax
// https://developer.mozilla.org/en-US/docs/Web/API/WebGLShaderPrecisionFormat/rangeMin
const getShaderData = (name, shader) => {
    const shaderData = {}
    try {
        for (const prop in shader) {
            const shaderPrecisionFormat = shader[prop]
            shaderData[prop] = {
                precision: shaderPrecisionFormat.precision,
                rangeMax: shaderPrecisionFormat.rangeMax,
                rangeMin: shaderPrecisionFormat.rangeMin
            }
        }
        return shaderData
    } catch (error) {
        return
    }
}

// https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/getShaderPrecisionFormat
const getShaderPrecisionFormat = (context, shaderType) => {
    const props = ['LOW_FLOAT', 'MEDIUM_FLOAT', 'HIGH_FLOAT']
    const precisionFormat = {}
    try {
        props.forEach(prop => {
            precisionFormat[prop] = context.getShaderPrecisionFormat(context[shaderType], context[prop])
            return
        })
        return precisionFormat
    } catch (error) {
        return
    }
}

const getWebglParams = (context, type) => {
	if (!context) {
		return
	}
	// get parameters
	// https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Constants
	const version1Constants = [
		'ALIASED_LINE_WIDTH_RANGE',
		'ALIASED_POINT_SIZE_RANGE',
		'ALPHA_BITS',
		'BLUE_BITS',
		'DEPTH_BITS',
		'GREEN_BITS',
		'MAX_COMBINED_TEXTURE_IMAGE_UNITS',
		'MAX_CUBE_MAP_TEXTURE_SIZE',
		'MAX_FRAGMENT_UNIFORM_VECTORS',
		'MAX_RENDERBUFFER_SIZE',
		'MAX_TEXTURE_IMAGE_UNITS',
		'MAX_TEXTURE_SIZE',
		'MAX_VARYING_VECTORS',
		'MAX_VERTEX_ATTRIBS',
		'MAX_VERTEX_TEXTURE_IMAGE_UNITS',
		'MAX_VERTEX_UNIFORM_VECTORS',
		'MAX_VIEWPORT_DIMS',
		'RED_BITS',
		'RENDERER',
		'SHADING_LANGUAGE_VERSION',
		'STENCIL_BITS',
		'VERSION'
	]

	const version2Constants = [
		'MAX_VARYING_COMPONENTS',
		'MAX_VERTEX_UNIFORM_COMPONENTS',
		'MAX_VERTEX_UNIFORM_BLOCKS',
		'MAX_VERTEX_OUTPUT_COMPONENTS',
		'MAX_PROGRAM_TEXEL_OFFSET',
		'MAX_3D_TEXTURE_SIZE',
		'MAX_ARRAY_TEXTURE_LAYERS',
		'MAX_COLOR_ATTACHMENTS',
		'MAX_COMBINED_FRAGMENT_UNIFORM_COMPONENTS',
		'MAX_COMBINED_UNIFORM_BLOCKS',
		'MAX_COMBINED_VERTEX_UNIFORM_COMPONENTS',
		'MAX_DRAW_BUFFERS',
		'MAX_ELEMENT_INDEX',
		'MAX_FRAGMENT_INPUT_COMPONENTS',
		'MAX_FRAGMENT_UNIFORM_COMPONENTS',
		'MAX_FRAGMENT_UNIFORM_BLOCKS',
		'MAX_SAMPLES',
		'MAX_SERVER_WAIT_TIMEOUT',
		'MAX_TEXTURE_LOD_BIAS',
		'MAX_TRANSFORM_FEEDBACK_INTERLEAVED_COMPONENTS',
		'MAX_TRANSFORM_FEEDBACK_SEPARATE_ATTRIBS',
		'MAX_TRANSFORM_FEEDBACK_SEPARATE_COMPONENTS',
		'MAX_UNIFORM_BLOCK_SIZE',
		'MAX_UNIFORM_BUFFER_BINDINGS',
		'MIN_PROGRAM_TEXEL_OFFSET',
		'UNIFORM_BUFFER_OFFSET_ALIGNMENT'
	]

	const compileParameters = context => {
		try {
			const parameters = {
				ANTIALIAS: context.getContextAttributes().antialias,
				MAX_TEXTURE_MAX_ANISOTROPY_EXT: getMaxAnisotropy(context),
				MAX_DRAW_BUFFERS_WEBGL: getMaxDrawBuffers(context),
				VERTEX_SHADER: getShaderData('VERTEX_SHADER', getShaderPrecisionFormat(context, 'VERTEX_SHADER')),
				FRAGMENT_SHADER: getShaderData('FRAGMENT_SHADER', getShaderPrecisionFormat(context, 'FRAGMENT_SHADER'))
			}
			const pnames = type == 'webgl2' ? [...version1Constants, ...version2Constants] : version1Constants
			pnames.forEach(key => {
				const value = context[key]
				const result = context.getParameter(value)
				const typedArray = (
					result.constructor === Float32Array ||
					result.constructor === Int32Array
				)
				parameters[key] = typedArray ? [...result] : result
			})
			return parameters
		} catch (error) {
			console.error(error)
			return
		}
	}

	let getParameter
	try {
		getParameter = context.getParameter
	} catch (error) { }

	return !!getParameter ? compileParameters(context) : undefined
}

const getWorkerData = async () => {
	let canvas2d,
		webglVendor,
		webglRenderer,
		webglParams, 
		webgl2Vendor,
		webgl2Renderer,
		webgl2Params
	try {
		const canvasOffscreen = new OffscreenCanvas(500, 200)
		const context2d = canvasOffscreen.getContext('2d')
		const str = '!😃🙌🧠👩‍💻👟👧🏻👩🏻‍🦱👩🏻‍🦰👱🏻‍♀️👩🏻‍🦳👧🏼👧🏽👧🏾👧🏿🦄🐉🌊🍧🏄‍♀️🌠🔮♞'
		context2d.font = '14px Arial'
		context2d.fillText(str, 0, 50)
		context2d.fillStyle = 'rgba(100, 200, 99, 0.78)'
		context2d.fillRect(100, 30, 80, 50)
		const getDataURI = async () => {
			const blob = await canvasOffscreen.convertToBlob()
			const reader = new FileReader()
			reader.readAsDataURL(blob)
			return new Promise(resolve => {
				reader.onloadend = () => resolve(reader.result)
			})
		}
		canvas2d = await getDataURI()

		const canvasOffscreenWebgl = new OffscreenCanvas(256, 256)
		const contextWebgl = canvasOffscreenWebgl.getContext('webgl')
		const renererInfo = contextWebgl.getExtension('WEBGL_debug_renderer_info')
		webglVendor = contextWebgl.getParameter(renererInfo.UNMASKED_VENDOR_WEBGL)
		webglRenderer = contextWebgl.getParameter(renererInfo.UNMASKED_RENDERER_WEBGL)
		webglParams = getWebglParams(contextWebgl, 'webgl')
		try {
			const canvasOffscreenWebgl2 = new OffscreenCanvas(256, 256)
			const contextWebgl2 = canvasOffscreenWebgl2.getContext('webgl2')
			const renerer2Info = contextWebgl2.getExtension('WEBGL_debug_renderer_info')
			webgl2Vendor = contextWebgl2.getParameter(renerer2Info.UNMASKED_VENDOR_WEBGL)
			webgl2Renderer = contextWebgl2.getParameter(renerer2Info.UNMASKED_RENDERER_WEBGL)
			webgl2Params = getWebglParams(contextWebgl2, 'webgl2')
		}
		catch (error) { console.error(error) }
	}
	catch (error) { console.error(error) }

	const timezoneLocation = Intl.DateTimeFormat().resolvedOptions().timeZone
	const { deviceMemory, hardwareConcurrency, language, platform, userAgent } = navigator
	const data = {
		timezoneLocation,
		language,
		deviceMemory,
		hardwareConcurrency,
		userAgent,
		platform,
		canvas2d,
		webglVendor,
		webglRenderer,
		webglParams, 
		webgl2Vendor,
		webgl2Renderer,
		webgl2Params
	}
	return data
}

// SharedWorkerGlobalScope
onconnect = async message => {
    const port = message.ports[0]
	const data = await getWorkerData()
    port.postMessage(data)
}
