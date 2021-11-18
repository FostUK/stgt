import {Planet} from './planet/planet.js'
import {createStar} from './star.js'
import {Utils} from './utils.js'


const toggleWireFrame = mat => () => (mat.wireframe = !mat.wireframe)   //TODO move to ui

const phi = 90
const theta = 90

export const initScene = (scene, canvas) => {
	const universeNode = new BABYLON.TransformNode()
	const camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(0, 0, 0), scene)
	camera.attachControl(canvas, true)

	camera.minZ = 0.01
	camera.maxZ = 7000000

	const planet = new Planet(
		{
			name: "Earth",
			position: new BABYLON.Vector3(0, 0, 0),
			radius: 1000, //100000//6371000
			maxHeight: 0.01
		},
		scene,
	)

	const sun = createStar("sun", scene)

	document.getElementById("wireframe").onclick = toggleWireFrame(planet.material)

	camera.position = Utils.sphericalToVector(planet.radius * 1.001, theta, phi, true) //1.051
	planet.setObserver(new BABYLON.Vector3(0, 0, 0))

	const transform = new BABYLON.TransformNode("p")
	const transform2 = new BABYLON.TransformNode("hh")

	transform2.parent = transform
	transform2.position.z = -planet.radius * 10.0
	transform2.position.y = -planet.radius

	transform.rotation.y += 0.16

	return {universeNode, camera, planet, sun, transform2}
}
