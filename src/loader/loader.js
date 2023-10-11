import { loadShaders } from "./load-shaders.js"
import { loadAtmospheres } from "./load-atmospheres.js"

let TERRAIN_TRANSFORM = ""
export let TEXTURES = {
	land: {},
}

export const loadResources = (callback, scene, canvas) => {
	let stageIdx = 0
	let stages

	//TODO this could be done as a promise chain
	const nextStage = value => stages[stageIdx++](value)

	stages = [
		() => loadShaders(nextStage),
		tt => {
			TERRAIN_TRANSFORM = tt
			nextStage()
		},
		() => {
			loadAtmospheres(scene).then(textures => {
				TEXTURES.atmo = textures
				nextStage()
			})
		},
		() => loadAssets(nextStage, scene),
		() => setupCompGLProgram(nextStage, canvas),
		callback,
	]

	nextStage()
}

const manifest = [
	{ name: "rock.diffuse", url: "rock/rock1/diff_1k.png" },
	{ name: "rock.normal", url: "rock/rock1/nor_1k.png" },
	{ name: "rock.roughness", url: "rock/rock1/rough_1k.png" },
	{ name: "rock.occlusion", url: "rock/rock1/ao_1k.png" },

	{ name: "grass.diffuse", url: "grass/grass1/diff_1k.png" },
	{ name: "grass.normal", url: "grass/grass1/nor_1k.png" },
	{ name: "grass.roughness", url: "grass/grass1/rough_1k.png" },
	{ name: "grass.occlusion", url: "grass/grass1/ao_1k.png" },
]

const onFail = task => console.log("task failed: ", task.errorObject.message, task.errorObject.exception)
const onProgress = (remainingCount, totalCount) =>
	console.log(remainingCount + 1 + " out of " + totalCount + " textures need to be loaded.")

const loadAssets = (callback, scene) => {
	const assetManager = new BABYLON.AssetsManager(scene)

	assetManager.onProgress = onProgress
	assetManager.onTaskErrorObservable.add(onFail)

	manifest.map(spec => {
		assetManager.addTextureTask(spec.name, `assets/textures/material/${spec.url}`).onSuccess = task => {
			TEXTURES.land[task.name] = task.texture
		}
	})


	assetManager.loadAsync().then(callback)
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
}
