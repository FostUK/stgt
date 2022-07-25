import { Planet } from "../planet/planet.js"
import { createStar } from "../star.js"
import { Utils } from "../utils.js"
import { createCamera } from "../cameras/camera.js"
import { createUICamera } from "../cameras/ui-camera.js"
import { createDebugOverlay } from "../debug/debug-overlay.js"
import { config } from "../config.js"

const phi = 90
const theta = 90

export const initScene = (scene, engine, canvas) => {
	//const universeNode = new BABYLON.TransformNode()
	const camera = createCamera(scene, canvas)

	const uiCamera = createUICamera()

	scene.activeCameras = [camera, uiCamera]

	const planet = new Planet(config.planet, scene)

	const debugOverlay = createDebugOverlay(planet, engine)

	camera.position = Utils.sphericalToVector(planet.radius * 1.001, theta, phi, true) //1.051

	const transform = new BABYLON.TransformNode("p")
	const transform2 = new BABYLON.TransformNode("hh")

	transform2.parent = transform
	transform2.position.z = -planet.radius * 10.0
	transform2.position.y = -planet.radius

	transform.rotation.y += 0.16

	const sun = createStar(scene, {
		name: "sun",
		directionToTarget: transform2.getAbsolutePosition(),
		meshPosition: new BABYLON.Vector3().setAll(-planet.radius * 50),
	})

	planet.setLightDirection(sun.light.direction.multiply(new BABYLON.Vector3(-1, -1, -1)))

	return { camera, planet, sun, debugOverlay }
}
