import { crel } from "../lib/crel.es.js"

export const boot = () => {
	const canvas = crel("canvas", { width: 1280, height: 600 })

	document.body.appendChild(canvas)

	const engine = new BABYLON.Engine(canvas)
		//{
		// useHighPrecisionMatrix: true,
		// useHighPrecisionFloats: true
		// }

	const scene = new BABYLON.Scene(engine)

	scene.useRightHandedSystem = true;  //Fixes linking cameras to gltf meshes

	return {
		scene,
		engine,
		canvas,
	}
}
