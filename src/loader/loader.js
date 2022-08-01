import { loadShaders } from "./load-shaders.js"
import { loadAtmospheres } from "./load-atmospheres.js"

let TERRAIN_TRANSFORM = ""
export let IRRADIANCE_TEXTURE
export let SCATTERING_TEXTURE
export let TRANSMITTANCE_TEXTURE
export let SINGLE_MIE_SCATTERING_TEXTURE

export const loadResources = (callback, scene, canvas) => {
	let stageIdx = 0
	let stages

	const nextStage = value => stages[stageIdx++](value)

	stages = [
		() => loadShaders(nextStage),
		tt => {
			TERRAIN_TRANSFORM = tt
			nextStage()
		},
		() => {
			loadAtmospheres(scene).then(textures => {
				IRRADIANCE_TEXTURE = textures.irradiance
				SCATTERING_TEXTURE = textures.scattering
				TRANSMITTANCE_TEXTURE = textures.transmittance
				SINGLE_MIE_SCATTERING_TEXTURE = textures.mie
				nextStage()
			})
		},
		() => loadAssets(nextStage, scene),
		() => setupCompGLProgram(nextStage, canvas),
		callback,
	]

	nextStage()
}

let ASSET_MANAGER = null
export let ROCK_ONE_TEXTURE = []
export let GRASS_ONE_TEXTURE = []

const loadAssets = (callback, scene) => {
	ASSET_MANAGER = new BABYLON.AssetsManager(scene)

	ASSET_MANAGER.onProgress = (remainingCount, totalCount, lastFinishedTask) => {
		console.log(remainingCount + 1 + " out of " + totalCount + " textures need to be loaded.")
	}

	ASSET_MANAGER.onTaskErrorObservable.add(task => {
		console.log("task failed: ", task.errorObject.message, task.errorObject.exception)
	})

	ASSET_MANAGER.onFinish = callback

	/// Rock 1
	ASSET_MANAGER.addTextureTask("rock1", "assets/textures/material/rock/rock1/diff_1k.png").onSuccess = task => {
		ROCK_ONE_TEXTURE[0] = task.texture
	}
	ASSET_MANAGER.addTextureTask("rock1", "assets/textures/material/rock/rock1/nor_1k.png").onSuccess = task => {
		ROCK_ONE_TEXTURE[1] = task.texture
	}
	ASSET_MANAGER.addTextureTask("rock1", "assets/textures/material/rock/rock1/rough_1k.png").onSuccess = task => {
		ROCK_ONE_TEXTURE[2] = task.texture
	}
	ASSET_MANAGER.addTextureTask("rock1", "assets/textures/material/rock/rock1/ao_1k.png").onSuccess = function (task) {
		ROCK_ONE_TEXTURE[3] = task.texture
	}

	/// Grass 1
	ASSET_MANAGER.addTextureTask("grass1", "assets/textures/material/grass/grass1/diff_1k.png").onSuccess = task => {
		GRASS_ONE_TEXTURE[0] = task.texture
	}
	ASSET_MANAGER.addTextureTask("grass1", "assets/textures/material/grass/grass1/nor_1k.png").onSuccess = task => {
		GRASS_ONE_TEXTURE[1] = task.texture
	}
	ASSET_MANAGER.addTextureTask("grass1", "assets/textures/material/grass/grass1/rough_1k.png").onSuccess = task => {
		GRASS_ONE_TEXTURE[2] = task.texture
	}
	ASSET_MANAGER.addTextureTask("grass1", "assets/textures/material/grass/grass1/ao_1k.png").onSuccess = task => {
		GRASS_ONE_TEXTURE[3] = task.texture
	}

	ASSET_MANAGER.load()
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

	return { COMP_GL, COMP_GL_PROGRAM }
}
