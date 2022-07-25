import { crel } from "../../lib/crel.es.js"
import { telemetry } from '../controls/flight-model.js'

const toggleWireFrame = mat => () => (mat.wireframe = !mat.wireframe)

export let debugOverlay

export const createDebugOverlay = (planet, engine) => {
	const onclick = toggleWireFrame(planet.material)
	const wireframeButton = crel("button", { onclick }, "Wireframe")

	const fpsCounter = crel("div")
	const vertexCount = crel("div")
	const level = crel("div")
	const padInfo = crel("div")

	const container = crel("div", { id: "ui" }, wireframeButton, fpsCounter, vertexCount, level, padInfo)

	document.body.appendChild(container)

	const update = () => {
		fpsCounter.innerText = `FPS: ${engine.getFps().toFixed()}`
		padInfo.innerText = `Throttle: ${telemetry.velocity.z.toFixed(2)}
		Altitude: ${telemetry.altitude.toFixed(2)}`
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
