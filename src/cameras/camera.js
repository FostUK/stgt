import { flightCameraInput } from '../controls/flight-camera-input.js'

export const createCamera = (scene, canvas) => {
	const camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(0, 0, 0), scene)
	camera.minZ = 0.01
	camera.maxZ = 7000000

	camera.inputs.clear()
	camera.inputs.add(new flightCameraInput())

	camera.attachControl(canvas, true)

	return camera
}

