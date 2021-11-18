import { crel } from "../lib/crel.es.js"

const toggleWireFrame = mat => () => (mat.wireframe = !mat.wireframe)

export let ui

export const createUI = (planet, engine) => {
	const onclick = toggleWireFrame(planet.material)
	const wireframeButton = crel("button", { onclick }, "Wireframe")

	const fpsCounter = crel("div")
	const vertexCount = crel("div")
	const level = crel("div")
	const cameraInfo = crel("div")

	const container = crel("div", { id: "ui" }, wireframeButton, fpsCounter, vertexCount, level, cameraInfo)

	document.body.appendChild(container)

	const update = () => (fpsCounter.innerHTML = "|  " + engine.getFps().toFixed() + " fps  |")

	const workUpdate = p => {
		vertexCount.innerText = `Vertex Count: ${p.vertexCount}`
		level.innerText = `Level: ${p.level}`
	}

	ui = {
		update,
		workUpdate,
	}

	return ui
}
