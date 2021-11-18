import { Planet } from "./planet/planet.js"
import { createStar } from "./star.js"
import { Utils } from "./utils.js"
import { createCamera } from "./camera.js"
import { createUI } from "./ui.js"

const phi = 90
const theta = 90

export const initScene = (scene, engine, canvas) => {
	//const universeNode = new BABYLON.TransformNode()
	const camera = createCamera(scene, canvas)

	const planet = new Planet(
		{
			name: "Earth",
			position: new BABYLON.Vector3(0, 0, 0),
			radius: 1000, //100000//6371000
			maxHeight: 0.01,
		},
		scene,
	)

	const ui = createUI(planet, engine)

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

	return { camera, planet, sun, transform2, ui }
}
