import { crel } from "../../lib/crel.es.js"

export const boot = () => {
	const canvas = crel("canvas", { width: 1280, height: 600 })

	document.body.appendChild(canvas)
	//const engine = new BABYLON.WebGPUEngine(canvas)
	const engine = new BABYLON.Engine(canvas)

	//return engine.initAsync().then(() => {
	const setRenderWindow = () => engine.setSize(window.innerWidth, window.innerHeight)
	setRenderWindow()
	window.addEventListener("resize", setRenderWindow)

	const scene = new BABYLON.Scene(engine)

	//scene.useRightHandedSystem = true //Fixes linking cameras to gltf meshes

	return Promise.resolve({
		scene,
		engine,
		canvas,
	})
	//})
	//{
	// useHighPrecisionMatrix: true,
	// useHighPrecisionFloats: true
	// }
}
