import { config } from "../config.js"
import { Utils } from "../utils.js"

export const setupPointerLock = canvas => {
	//document.addEventListener("pointerlockchange", changeCallback(main), false)

	canvas.onclick = canvas.requestPointerLock
}

//const changeCallback = main => () => {
//	const handleListener = document.pointerLockElement === main.canvas ? "addEventListener" : "removeEventListener"
//	document[handleListener]("mousemove", mouseMove(main), false)
//}

//const mouseMove = main => e => {
//	main.mouseDX = e.movementX || 0
//	main.mouseDY = e.movementY || 0
//
//	//updateCamera();
//}

function updateCamera() {
	config.mouse.x += main.mouseDX * config.mouse.sensitivity * main.delta
	config.mouse.y += main.mouseDY * config.mouse.sensitivity * main.delta
	config.mouse.y = Utils.clamp(config.mouse.y, config.mouse.min, config.mouse.max)

	main.camera.rotation = Utils.lerp3(
		main.camera.rotation,
		new BABYLON.Vector3(BABYLON.Tools.ToRadians(config.mouse.y), BABYLON.Tools.ToRadians(config.mouse.x), 0),
		config.mouse.cameraSpeed * main.delta,
	)
}
