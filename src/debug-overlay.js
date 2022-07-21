import { crel } from "../lib/crel.es.js"
import { config } from './config.js'

export const configX = {
	mouseSensitivity: 0.005,
	cameraSpeed: 0.0075,
	mouseMin: -75,
	mouseMax: 90,

	mouseX: 0,
	mouseY: 0,
}


const toggleWireFrame = mat => () => (mat.wireframe = !mat.wireframe)

export let debugOverlay

export const createDebugOverlay = (planet, engine) => {
	const onclick = toggleWireFrame(planet.material)
	const wireframeButton = crel("button", { onclick }, "Wireframe")

	const fpsCounter = crel("div")
	const vertexCount = crel("div")
	const level = crel("div")
	const cameraInfo = crel("div")

	const container = crel("div", { id: "ui" }, wireframeButton, fpsCounter, vertexCount, level, cameraInfo)

	document.body.appendChild(container)

	const update = () => {
		fpsCounter.innerText = `FPS: ${engine.getFps().toFixed()}`
		cameraInfo.innerText = `MOUSEX: ${config.mouseX}\nMOUSEY: ${config.mouseY}`
	}

	const workUpdate = p => {
		vertexCount.innerText = `Vertex Count: ${p.vertexCount}`
		level.innerText = `Level: ${p.level}`
	}

	debugOverlay = {
		update,
		workUpdate,
	}

	return debugOverlay
}
