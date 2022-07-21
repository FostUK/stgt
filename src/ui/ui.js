import { createCylicUI } from "./cyclic.js"
import { createThrottleUI } from "./throttle.js"
import { createRotorUI } from "./rotor.js"

export const createUi = scene => {
	const ui = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI", true, scene)
	ui.layer.layerMask = 0x10000000;

	const updateCyc = createCylicUI(ui)
	const updateCol = createThrottleUI(ui)
	const updateRot = createRotorUI(ui)

	const update = () => {
		updateCyc()
		updateCol()
		updateRot()
	}

	return {
		ui,
		update,
	}
}
