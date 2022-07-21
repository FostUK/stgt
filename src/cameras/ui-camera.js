export const createUICamera = scene => {
	const camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(0, 0, 0), scene)
	camera.layerMask = 0x10000000;

	return camera
}
