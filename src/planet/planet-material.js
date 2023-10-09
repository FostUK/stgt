import { COMP_GL, COMP_GL_PROGRAM, TEXTURES } from "../loader/loader.js"

const setFeedbackUniformInt = (name, value) =>
	COMP_GL.uniform1i(COMP_GL.getUniformLocation(COMP_GL_PROGRAM, name), value)

const setFeedbackUniformFloat = (name, value) =>
	COMP_GL.uniform1f(COMP_GL.getUniformLocation(COMP_GL_PROGRAM, name), value)

const PERMUTATION_TEXTURE_HEIGHT = 16
const PERMUTATION_TEXTURE_WIDTH = 32
const HASH_TEXTURE_WIDTH = 256
const MAX_LEVELS = 18

export const planetMaterial = (planet, onComplete) => {
	const material = new BABYLON.ShaderMaterial(
		planet.name,
		planet.getScene(),
		{
			vertex: "IcoPlanet",
			fragment: "IcoPlanet",
		},
		{
			attributes: ["position"],
			uniforms: [
				"world",
				"worldView",
				"worldViewProjection",
				"view",
				"projection",
				"viewProjection",
				"time",
				"cameraPosition",
				"eyepos",
				"eyepos_lowpart",
			],
			samplers: ["hashTexture", "grassTexture", "rockTexture", "permutationTexture"],
		},
	)

	material.setInt("SEED", planet.seedHash)
	material.setFloat("radius", planet.radius)
	material.setFloat("maxHeight", planet.maxHeight)

	material.setInt("octaves", planet.properties.octaves)
	material.setFloat("frequency", planet.properties.frequency)
	material.setFloat("amplitude", planet.properties.amplitude)
	material.setFloat("roughness", planet.properties.roughness)
	material.setFloat("persistence", planet.properties.persistence)
	material.setFloat("warpAmplitude", planet.properties.warpAmplitude)
	material.setFloat("warpFrequency", planet.properties.warpFrequency)

	setFeedbackUniformInt("SEED", planet.seedHash)
	setFeedbackUniformFloat("radius", planet.radius)
	setFeedbackUniformFloat("maxHeight", planet.maxHeight)

	setFeedbackUniformInt("octaves", planet.properties.octaves)
	setFeedbackUniformFloat("frequency", planet.properties.frequency)
	setFeedbackUniformFloat("amplitude", planet.properties.amplitude)
	setFeedbackUniformFloat("roughness", planet.properties.roughness)
	setFeedbackUniformFloat("persistence", planet.properties.persistence)
	setFeedbackUniformFloat("warpAmplitude", planet.properties.warpAmplitude)
	setFeedbackUniformFloat("warpFrequency", planet.properties.warpFrequency)

	const hashTexture = new BABYLON.CustomProceduralTexture(
		planet.name,
		"/assets/textures/hash",
		HASH_TEXTURE_WIDTH,
		planet.getScene(),
	)
	hashTexture.delayLoad()
	hashTexture.setInt("SEED", planet.seedHash)
	material.setTexture("hashTexture", hashTexture)

	material.setTexture("grassTexture[0]", TEXTURES.land["grass.diffuse"])
	material.setTexture("grassTexture[1]", TEXTURES.land["grass.normal"])
	material.setTexture("grassTexture[2]", TEXTURES.land["grass.roughness"])
	material.setTexture("grassTexture[3]", TEXTURES.land["grass.occlusion"])

	material.setTexture("rockTexture[0]", TEXTURES.land["rock.diffuse"])
	material.setTexture("rockTexture[1]", TEXTURES.land["rock.normal"])
	material.setTexture("rockTexture[2]", TEXTURES.land["rock.roughness"])
	material.setTexture("rockTexture[3]", TEXTURES.land["rock.occlusion"])

	const permutationTexture = new BABYLON.RawTexture(
		planet.noise.perm,
		PERMUTATION_TEXTURE_WIDTH,
		PERMUTATION_TEXTURE_HEIGHT,
		BABYLON.Engine.TEXTUREFORMAT_R,
		planet.getScene(),
		false,
		false,
		BABYLON.Texture.LINEAR_LINEAR,
		BABYLON.Engine.TEXTURETYPE_UNSIGNED_BYTE,
	)
	material.setTexture("permutationTexture", permutationTexture)

	hashTexture.onGeneratedObservable.addOnce(onComplete)

	//TODO decouple these
	planet.material = material
	planet.hashTexture = hashTexture
	planet.permutationTexture = permutationTexture
}
