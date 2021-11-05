import { Utils } from './utils.js'

export const loadResources = (callback, scene, canvas) => {
	var load = function (state) {
		switch (state) {
			case 0:
				loadShaders(() => load(1))
				break
			case 1:
				loadAtmosphereDataTextures(() => load(2), scene)
				break
			case 2:
				loadAssets(() => load(3), scene)
				break
			case 3:
				setupCompGLProgram(() => load(4), canvas)
				break
			default:
				callback()
				break
		}
	}

	load(0)
}

var POSTPROCESS = ""
var BASE_VERTEX = ""
var PRECOMPUTEHASH = ""
var ICOPLANET_VERTEX = ""
var BASE_PBR_FRAGMENT = ""
var TERRAIN_TRANSFORM = ""
var ICOPLANET_FRAGMENT = ""

function loadShaders(callback) {
	Promise.all([
		Utils.loadFile("src/planet/shdr/Base_Vertex.glsl"), //data 0
		Utils.loadFile("src/planet/shdr/PBRFrag.glsl"), //data 1
		Utils.loadFile("src/planet/shdr/Tools.glsl"), //data 2
		Utils.loadFile("src/planet/shdr/noise/SimplexNoise.glsl"), //data 3
		Utils.loadFile("src/planet/shdr/IcoPlanetVertex.glsl"), //data 4
		Utils.loadFile("src/planet/shdr/IcoPlanetFragment.glsl"), //data 5

		Utils.loadFile("src/planet/shdr/noise/Cellular3D.glsl"), //data 6
		Utils.loadFile("src/planet/shdr/noise/SNoise.glsl"), //data 7

		Utils.loadFile("src/planet/shdr/PostProcess.glsl"), //data 8
		Utils.loadFile("src/planet/shdr/ocean/Ocean.glsl"), //data 9

		Utils.loadFile("src/planet/shdr/noise/PrecomputeHash.glsl"), //data 10

		Utils.loadFile("src/planet/shdr/atmosphere/Eric_B.atmosphere.glsl"), //data 11
		Utils.loadFile("src/planet/shdr/atmosphere/Sean_O.atmosphere.glsl"), //data 12

		Utils.loadFile("src/planet/shdr/planet/TerrainTransform.glsl"), //data 13

		Utils.loadFile("src/planet/shdr/PostProcessTools.glsl"), //data 14
	]).then(function (data) {
		BASE_VERTEX = data[0]
		BASE_PBR_FRAGMENT = data[1]
		ICOPLANET_VERTEX = data[4]
		ICOPLANET_FRAGMENT = data[5]
		POSTPROCESS = data[8]
		PRECOMPUTEHASH = data[10]
		const NOISE = data[6] + data[7] + data[3]
		TERRAIN_TRANSFORM = data[2] + NOISE + data[13]

		BABYLON.Effect.IncludesShadersStore["Tools"] = data[2]
		BABYLON.Effect.IncludesShadersStore["Noise3D"] = NOISE

		BABYLON.Effect.IncludesShadersStore["Ocean"] = data[9]
		BABYLON.Effect.IncludesShadersStore["PostProcessTools"] = data[14]
		BABYLON.Effect.IncludesShadersStore["PrecomputedAtmosphericScattering"] = data[11]
		BABYLON.Effect.IncludesShadersStore["SeanONeilAtmosphericScattering"] = data[12]

		//BABYLON.Effect.IncludesShadersStore["PlanetFragment"] = data[13];

		BABYLON.Effect.ShadersStore["QuadTreeVertexShader"] = BASE_VERTEX
		BABYLON.Effect.ShadersStore["HashFragmentShader"] = PRECOMPUTEHASH
		BABYLON.Effect.ShadersStore["PostProcessFragmentShader"] = POSTPROCESS
		BABYLON.Effect.ShadersStore["IcoPlanetVertexShader"] = ICOPLANET_VERTEX
		BABYLON.Effect.ShadersStore["QuadTreeFragmentShader"] = BASE_PBR_FRAGMENT
		BABYLON.Effect.ShadersStore["IcoPlanetFragmentShader"] = ICOPLANET_FRAGMENT

		console.log("All Shaders loaded")
		callback()
	})
}

let ASSET_MANAGER = null
export let ROCK_ONE_TEXTURE = []
export let GRASS_ONE_TEXTURE = []

function loadAssets(callback, scene) {
	ASSET_MANAGER = new BABYLON.AssetsManager(scene)

	ASSET_MANAGER.onProgress = function (remainingCount, totalCount, lastFinishedTask) {
		console.log(remainingCount + 1 + " out of " + totalCount + " textures need to be loaded.")
	}

	ASSET_MANAGER.onTaskErrorObservable.add(function (task) {
		console.log("task failed: ", task.errorObject.message, task.errorObject.exception)
	})

	ASSET_MANAGER.onFinish = function (tasks) {
		callback()
	}

	/// Rock 1
	ASSET_MANAGER.addTextureTask("rock1", "res/textures/material/rock/rock1/diff_1k.png").onSuccess = function (task) {
		ROCK_ONE_TEXTURE[0] = task.texture
	}
	ASSET_MANAGER.addTextureTask("rock1", "res/textures/material/rock/rock1/nor_1k.png").onSuccess = function (task) {
		ROCK_ONE_TEXTURE[1] = task.texture
	}
	ASSET_MANAGER.addTextureTask("rock1", "res/textures/material/rock/rock1/rough_1k.png").onSuccess = function (task) {
		ROCK_ONE_TEXTURE[2] = task.texture
	}
	ASSET_MANAGER.addTextureTask("rock1", "res/textures/material/rock/rock1/ao_1k.png").onSuccess = function (task) {
		ROCK_ONE_TEXTURE[3] = task.texture
	}

	/// Grass 1
	ASSET_MANAGER.addTextureTask("grass1", "res/textures/material/grass/grass1/diff_1k.png").onSuccess = function (
		task,
	) {
		GRASS_ONE_TEXTURE[0] = task.texture
	}
	ASSET_MANAGER.addTextureTask("grass1", "res/textures/material/grass/grass1/nor_1k.png").onSuccess = function (
		task,
	) {
		GRASS_ONE_TEXTURE[1] = task.texture
	}
	ASSET_MANAGER.addTextureTask("grass1", "res/textures/material/grass/grass1/rough_1k.png").onSuccess = function (
		task,
	) {
		GRASS_ONE_TEXTURE[2] = task.texture
	}
	ASSET_MANAGER.addTextureTask("grass1", "res/textures/material/grass/grass1/ao_1k.png").onSuccess = function (task) {
		GRASS_ONE_TEXTURE[3] = task.texture
	}

	ASSET_MANAGER.load()
}

export let IRRADIANCE_TEXTURE
export let SCATTERING_TEXTURE
export let TRANSMITTANCE_TEXTURE
export let SINGLE_MIE_SCATTERING_TEXTURE

const TRANSMITTANCE_TEXTURE_WIDTH = 256
const TRANSMITTANCE_TEXTURE_HEIGHT = 64
const SCATTERING_TEXTURE_WIDTH = 256
const SCATTERING_TEXTURE_HEIGHT = 128
const SCATTERING_TEXTURE_DEPTH = 32
const IRRADIANCE_TEXTURE_WIDTH = 64
const IRRADIANCE_TEXTURE_HEIGHT = 16

function loadAtmosphereDataTextures(callback, scene) {
	// Atmosphere Shader Textures
	Utils.loadTextureData("res/atmosphere/irradiance.raw", function (data) {
		IRRADIANCE_TEXTURE = new BABYLON.RawTexture(
			data,
			IRRADIANCE_TEXTURE_WIDTH,
			IRRADIANCE_TEXTURE_HEIGHT,
			BABYLON.Engine.TEXTUREFORMAT_RGB,
			scene,
			false,
			false,
			BABYLON.Texture.LINEAR_LINEAR,
			BABYLON.Engine.TEXTURETYPE_FLOAT,
		)
	})

	Utils.loadTextureData("res/atmosphere/inscatter.raw", function (data) {
		SCATTERING_TEXTURE = new BABYLON.RawTexture3D(
			data,
			SCATTERING_TEXTURE_WIDTH,
			SCATTERING_TEXTURE_HEIGHT,
			SCATTERING_TEXTURE_DEPTH,
			BABYLON.Engine.TEXTUREFORMAT_RGBA,
			scene,
			false,
			false,
			BABYLON.Texture.LINEAR_LINEAR,
			BABYLON.Engine.TEXTURETYPE_FLOAT,
		)
	})

	Utils.loadTextureData("res/atmosphere/transmittance.raw", function (data) {
		TRANSMITTANCE_TEXTURE = new BABYLON.RawTexture(
			data,
			TRANSMITTANCE_TEXTURE_WIDTH,
			TRANSMITTANCE_TEXTURE_HEIGHT,
			BABYLON.Engine.TEXTUREFORMAT_RGB,
			scene,
			false,
			false,
			BABYLON.Texture.LINEAR_LINEAR,
			BABYLON.Engine.TEXTURETYPE_FLOAT,
		)
	})

	//dummy texture stuff
	let dummyData = new Float32Array(32)
	SINGLE_MIE_SCATTERING_TEXTURE = new BABYLON.RawTexture3D(
		dummyData,
		2,
		2,
		2,
		BABYLON.Engine.TEXTUREFORMAT_RGBA,
		scene,
		false,
		false,
		BABYLON.Texture.LINEAR_LINEAR,
		BABYLON.Engine.TEXTURETYPE_FLOAT,
	)
	//

	let checker = setInterval(function () {
		if (
			IRRADIANCE_TEXTURE == null ||
			SCATTERING_TEXTURE == null ||
			TRANSMITTANCE_TEXTURE == null ||
			SINGLE_MIE_SCATTERING_TEXTURE == null
		) {
			return
		}

		clearInterval(checker)

		console.log("All Data textures loaded")
		callback()
	}, 10)
}

export let COMP_GL = null
export let COMP_GL_PROGRAM = null

function setupCompGLProgram(callback, canvas) {
	function getShader(gl, source, type) {
		let sh = gl.createShader(type)
		gl.shaderSource(sh, source)
		gl.compileShader(sh)
		console.log("Shader Status:", gl.getShaderInfoLog(sh))
		return sh
	}

	const gl = canvas.getContext("webgl2") || canvas.getContext("experimental-webgl2")
	COMP_GL = gl
	// console.log(gl);

	const program = gl.createProgram()
	COMP_GL_PROGRAM = program
	gl.attachShader(program, getShader(gl, `#version 300 es\n` + TERRAIN_TRANSFORM, gl.VERTEX_SHADER))
	gl.attachShader(program, getShader(gl, `#version 300 es\n` + `void main(void) {}`, gl.FRAGMENT_SHADER))
	gl.transformFeedbackVaryings(program, ["outPosition"], gl.SEPARATE_ATTRIBS)

	gl.linkProgram(program)
	console.log("Program Status:", gl.getProgramInfoLog(program))
	gl.useProgram(program)

	callback()

	return {COMP_GL, COMP_GL_PROGRAM}
}
