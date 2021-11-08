import {
	IRRADIANCE_TEXTURE,
	SCATTERING_TEXTURE,
	SINGLE_MIE_SCATTERING_TEXTURE,
	TRANSMITTANCE_TEXTURE,
} from "./loader.js"

export const postProcess = main => {
	const depthRenderer = main.scene.enableDepthRenderer(main.camera, false, true)

	const postProcessEffect = new BABYLON.PostProcess(
		"SOCA",
		"PostProcess",
		[
			"warpFrequency",
			"TIME",
			"lightDir",
			"octaves",
			"frequency",
			"screenSize",
			"RADIUS",
			"amplitude",
			"roughness",
			"camera.far",
			"camera.near",
			"camera.world",
			"camera.view",
			"persistence",
			"warpAmplitude",
			"camera.projection",
			"camera.transform",
			"planet.rCoeff",
			"planet.mCoeff",
			"planet.mieG",
			"camera.position",
			"camera.direction",
			"camera.fov",
			"planet.radius",
			"planet.position",
			"planet.maxHeight",
		],
		[
			"single_mie_scattering_texture",
			"transmittance_texture",
			"permutationTexture",
			"irradiance_texture",
			"scattering_texture",
			"depthMap",
		],
		1.0,
		main.camera,
		0,
		main.engine,
		false,
		`
					#define assert(x)
					#define TEMPLATE(x)
					#define TEMPLATE_ARGUMENT(x)
					#define RADIANCE_API_ENABLED
					#define COMBINED_SCATTERING_TEXTURES
			`,
	)
	postProcessEffect.renderTargetSamplingMode = BABYLON.Texture.NEAREST_LINEAR_MIPLINEAR

	postProcessEffect.onApply = function (effect) {
		effect.setFloat("TIME", main.time)

		effect.setFloat("planet.radius", main.planet.radius)
		effect.setFloat("planet.maxHeight", main.planet.maxHeight)
		effect.setVector3("planet.position", main.planet.getAbsolutePosition())

		effect.setInt("octaves", main.planet.properties.octaves)
		effect.setFloat("frequency", main.planet.properties.frequency)
		effect.setFloat("amplitude", main.planet.properties.amplitude)
		effect.setFloat("roughness", main.planet.properties.roughness)
		effect.setFloat("persistence", main.planet.properties.persistence)
		effect.setFloat("warpAmplitude", main.planet.properties.warpAmplitude)
		effect.setFloat("warpFrequency", main.planet.properties.warpFrequency)

		effect.setVector3("planet.rCoeff", main.planet.properties.rCoeff)
		effect.setVector3("planet.mCoeff", main.planet.properties.mCoeff)
		effect.setFloat("planet.mieG", main.planet.properties.mieG)

		effect.setVector3("lightDir", main.light.direction.multiply(new BABYLON.Vector3(-1, -1, -1)))

		effect.setTexture("depthMap", depthRenderer.getDepthMap())

		effect.setVector2("screenSize", new BABYLON.Vector2(postProcessEffect.width, postProcessEffect.height))

		//effect.setVector3("camera.position", game.universeNode.getAbsolutePosition().multiply(new BABYLON.Vector3(-1,-1,-1)));
		effect.setVector3("camera.position", main.scene.activeCamera.globalPosition)
		effect.setVector3("camera.direction", main.scene.activeCamera.getForwardRay(1).direction)

		effect.setFloat("camera.fov", main.camera.fov)
		effect.setFloat("camera.far", main.camera.maxZ)
		effect.setFloat("camera.near", main.camera.minZ)

		effect.setMatrix("camera.view", main.scene.activeCamera.getViewMatrix())
		effect.setMatrix("camera.projection", main.scene.activeCamera.getProjectionMatrix())
		effect.setMatrix("camera.world", main.scene.activeCamera.getWorldMatrix())
		effect.setMatrix("camera.transform", main.scene.activeCamera.getTransformationMatrix())

		effect.setTexture("irradiance_texture", IRRADIANCE_TEXTURE)
		effect.setTexture("scattering_texture", SCATTERING_TEXTURE)
		effect.setTexture("transmittance_texture", TRANSMITTANCE_TEXTURE)
		effect.setTexture("single_mie_scattering_texture", SINGLE_MIE_SCATTERING_TEXTURE)
		effect.setTexture("permutationTexture", main.planet.permutationTexture)
	}
}
