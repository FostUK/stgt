import { boot } from "./boot.js"
import { initScene } from "./init-scene.js"
import { Utils } from "./utils.js"
import { postProcess } from "./post-process.js"
import { loadResources } from "./loader.js"
import { setupPointerLock } from "./controls/mouse.js"
import { getStep } from "./step.js"
;(window.oldWorkers || []).forEach(w => w.terminate())
Utils.clearAllTimeoutsAndIntervals()

const { scene, engine, canvas } = boot()

const preload = () => {
	//console.log(window.navigator.hardwareConcurrency);
	const dsm = new BABYLON.DeviceSourceManager(engine)
}

//function updateUniverseNode() {
//	universeNode.position = main.universeNode.position.subtract(camera.position)
//	camera.position = new BABYLON.Vector3(0, 0, 0)
//}

const loadComplete = () => {
	preload()
	const {camera, planet, sun, transform2 } = initScene(scene, canvas)
	postProcess(scene, camera, planet, engine, sun)

	setupPointerLock(canvas)

	const step = getStep(engine, sun, planet, scene, transform2)

	scene.registerBeforeRender(() => {
		step()
		//main.mouseDX = 0
		//main.mouseDY = 0
	})

	//scene.registerAfterRender(() => {
	//	// postStep();
	//})

	engine.runRenderLoop(() => scene.render())
}

loadResources(loadComplete, scene, canvas)
