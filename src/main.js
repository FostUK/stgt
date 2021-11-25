import { boot } from "./boot.js"
import { initScene } from "./init-scene.js"
import { Utils } from "./utils.js"
import { postProcess } from "./post-process.js"
import { loadResources } from "./loader/loader.js"
import { setupPointerLock } from "./controls/mouse.js"
import { getStep } from "./step.js"
import { models } from "./loader/models.js"
import { createUi } from "./ui/ui.js"
import { createInput } from "./input.js"
import { telemetry, updateFlightModel } from "./flight-model.js"
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
	createInput()
	const { camera, planet, sun, debugOverlay } = initScene(scene, engine, canvas)
	postProcess(scene, camera, planet, engine, sun)

	setupPointerLock(canvas)

	const ui = createUi(scene)

	const step = getStep(planet, scene, debugOverlay)

	scene.registerBeforeRender(() => {
		updateFlightModel()
		ui.update()

		//husky.body.translate(BABYLON.Axis.Z, telemetry.velocity.z, BABYLON.Space.LOCAL)
		//husky.body.addRotation(telemetry.pitch, 0, 0) //Pitch
		//husky.body.addRotation(0, 0.1, 0)   //yaw
		//husky.body.addRotation(0, 0, telemetry.roll) //roll


		//camera.translate(BABYLON.Axis.Z, telemetry.velocity.z, BABYLON.Space.LOCAL)

		step()
		//main.mouseDX = 0
		//main.mouseDY = 0
	})

	//scene.registerAfterRender(() => {
	//	// postStep();
	//})

	engine.runRenderLoop(() => scene.render())
}

Promise.all(models(scene)).then(() => {
	loadResources(loadComplete, scene, canvas)
})
