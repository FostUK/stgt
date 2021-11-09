import {Planet} from './planet/planet.js'
import {createStar} from './star.js'
import {Utils} from './utils.js'


const toggleWireFrame = mat => () => (mat.wireframe = !mat.wireframe)   //TODO move to ui

const phi = 90
const theta = 90

export const initScene = (main, scene) => {
	main.time = 0.0
	main.universeNode = new BABYLON.TransformNode()
	main.camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(0, 0, 0), scene)
	main.camera.attachControl(main.canvas, true)

	main.camera.minZ = 0.01
	main.camera.maxZ = 7000000

	main.planet = new Planet(
		{
			name: "Earth",
			position: new BABYLON.Vector3(0, 0, 0),
			radius: 1000, //100000//6371000
		},
		scene,
	)

	main.light = new BABYLON.DirectionalLight(
		"dirLight",
		BABYLON.Vector3.Normalize(new BABYLON.Vector3(0, -0.1, -1.0)),
		scene,
	)
	main.light.intensity = 0.7

	main.sun = createStar("sun", scene)


	document.getElementById("wireframe").onclick = toggleWireFrame(main.planet.material)

	main.camera.position = Utils.sphericalToVector(main.planet.radius * 1.001, theta, phi, true) //1.051
	main.planet.setObserver(new BABYLON.Vector3(0, 0, 0))

	main.transform = new BABYLON.TransformNode("p")
	main.transform2 = new BABYLON.TransformNode("hh")

	main.transform2.parent = main.transform
	main.transform2.position.z = -main.planet.radius * 10.0
	main.transform2.position.y = -main.planet.radius

	main.transform.rotation.y += 0.16
}
