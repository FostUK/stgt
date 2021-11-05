import {config} from '../config.js'
import {Utils} from '../utils.js'

export const setupPointerLock = (main) => {
	document.addEventListener("pointerlockchange", changeCallback(main), false)

	main.canvas.onclick = main.canvas.requestPointerLock
}

const changeCallback = (canvas, main) => () => {
	const handleListener = document.pointerLockElement === canvas ? "addEventListener" : "removeEventListener"
	document[handleListener]("mousemove", mouseMove(main), false)
}

const mouseMove = main => e => {
	main.mouseDX = e.movementX || 0
	main.mouseDY = e.movementY || 0

	//updateCamera();
}

function updateCamera() {
	config.mouseX += main.mouseDX * config.mouseSensitivity * main.delta
	config.mouseY += main.mouseDY * config.mouseSensitivity * main.delta
	config.mouseY = Utils.clamp(config.mouseY, config.mouseMin, config.mouseMax)

	main.camera.rotation = Utils.lerp3(
		main.camera.rotation,
		new BABYLON.Vector3(BABYLON.Tools.ToRadians(config.mouseY), BABYLON.Tools.ToRadians(config.mouseX), 0),
		config.cameraSpeed * main.delta,
	)
}
