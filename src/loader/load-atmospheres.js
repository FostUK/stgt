import { Utils } from "../utils.js"

const isDefined = item => item !== undefined

const specs = [
	{ name: "transmittance", width: 256, height: 64, format: BABYLON.Engine.TEXTUREFORMAT_RGB },
	{ name: "scattering", width: 256, height: 128, depth: 32, format: BABYLON.Engine.TEXTUREFORMAT_RGBA },
	{ name: "irradiance", width: 64, height: 16, format: BABYLON.Engine.TEXTUREFORMAT_RGB },
]

const getTexture = (scene, spec) => data => {
	const type = spec.depth ? "RawTexture3D" : "RawTexture"

	const params = [
		data,
		spec.width,
		spec.height,
		spec.depth,
		spec.format,
		scene,
		false,
		false,
		BABYLON.Texture.LINEAR_LINEAR,
		BABYLON.Engine.TEXTURETYPE_FLOAT,
	].filter(isDefined)

	const texture = new BABYLON[type](...params)
	texture.name = spec.name

	return texture
}

const loadTextureFromSpec = scene => spec =>
	Utils.fetchTexture(`assets/atmosphere/${spec.name}.raw`).then(getTexture(scene, spec))

export const loadAtmospheres = scene => {
	const loadingTextures = specs.map(loadTextureFromSpec(scene))

	loadingTextures.push(
		getTexture(scene, {
			name: "mie",
			width: 2,
			height: 2,
			depth: 2,
			format: BABYLON.Engine.TEXTUREFORMAT_RGBA,
		})(new Float32Array(32)),
	)

	return Promise.all(loadingTextures).then(textures => Object.fromEntries(textures.map(tex => [tex.name, tex])))
}
