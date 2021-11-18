export const createCamera = (scene, canvas) => {
	const camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(0, 0, 0), scene)
	camera.attachControl(canvas, true)

	camera.minZ = 0.01
	camera.maxZ = 7000000

	return camera
}
