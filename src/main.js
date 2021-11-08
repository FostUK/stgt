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

const main = {
	engine,
	canvas,
	scene,
	delta: 0,
	objects: {},
	mouseDX: 0,
	mouseDY: 0,
}

const preload = () => {
	//console.log(window.navigator.hardwareConcurrency);
	main.dsm = new BABYLON.DeviceSourceManager(main.engine)
}

function updateUniverseNode() {
	main.universeNode.position = main.universeNode.position.subtract(main.camera.position)
	main.camera.position = new BABYLON.Vector3(0, 0, 0)
}

const loadComplete = () => {
	preload()
	initScene(main, scene)
	postProcess(main)

	setupPointerLock(main)

	const step = getStep(main)

	scene.registerBeforeRender(() => {
		step()
		main.mouseDX = 0
		main.mouseDY = 0
	})

	scene.registerAfterRender(() => {
		// postStep();
	})

	engine.runRenderLoop(() => main.scene.render())
}

loadResources(loadComplete, scene, canvas)
