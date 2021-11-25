import {
	IRRADIANCE_TEXTURE,
	SCATTERING_TEXTURE,
	SINGLE_MIE_SCATTERING_TEXTURE,
	TRANSMITTANCE_TEXTURE,
} from "./loader/loader.js"

export const postProcess = (scene, camera, planet, engine, sun) => {
	const depthRenderer = scene.enableDepthRenderer(camera, false, true)

	const postProcessEffect = new BABYLON.PostProcess(
		"SOCA",
		"PostProcess",
		[
			"lightDir",
			"screenSize",
			"roughness",
			"camera.far",
			"camera.near",
			"camera.world",
			"camera.view",
			"camera.projection",
			"camera.transform",
			"planet.rCoeff",
			"planet.mCoeff",
			"planet.mieG",
			"camera.position",
			"camera.direction",
			"camera.fov",
			"camera.up",
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
		camera,
		0,
		engine,
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
		effect.setFloat("planet.radius", planet.radius)
		effect.setFloat("planet.maxHeight", planet.maxHeight)
		effect.setVector3("planet.position", planet.getAbsolutePosition())
		effect.setFloat("roughness", planet.properties.roughness)
		effect.setVector3("planet.rCoeff", planet.properties.rCoeff)
		effect.setVector3("planet.mCoeff", planet.properties.mCoeff)
		effect.setFloat("planet.mieG", planet.properties.mieG)

		effect.setVector3("lightDir", sun.light.direction.multiply(new BABYLON.Vector3(-1, -1, -1)))
		effect.setTexture("depthMap", depthRenderer.getDepthMap())
		effect.setVector2("screenSize", new BABYLON.Vector2(postProcessEffect.width, postProcessEffect.height))

		//effect.setVector3("camera.position", game.universeNode.getAbsolutePosition().multiply(new BABYLON.Vector3(-1,-1,-1)));
		effect.setVector3("camera.position", scene.activeCamera.globalPosition)
		effect.setVector3("camera.direction", scene.activeCamera.getForwardRay(1).direction)
		effect.setVector3("camera.up", scene.activeCamera.upVector)

		effect.setFloat("camera.fov", camera.fov)
		effect.setFloat("camera.far", camera.maxZ)
		effect.setFloat("camera.near", camera.minZ)

		effect.setMatrix("camera.view", scene.activeCamera.getViewMatrix())
		effect.setMatrix("camera.projection", scene.activeCamera.getProjectionMatrix())
		effect.setMatrix("camera.world", scene.activeCamera.getWorldMatrix())
		effect.setMatrix("camera.transform", scene.activeCamera.getTransformationMatrix())

		effect.setTexture("irradiance_texture", IRRADIANCE_TEXTURE)
		effect.setTexture("scattering_texture", SCATTERING_TEXTURE)
		effect.setTexture("transmittance_texture", TRANSMITTANCE_TEXTURE)
		effect.setTexture("single_mie_scattering_texture", SINGLE_MIE_SCATTERING_TEXTURE)
		effect.setTexture("permutationTexture", planet.permutationTexture)
	}
}
