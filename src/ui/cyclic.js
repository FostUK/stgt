import { uiGreen } from "./colours.js"
import { controls } from "../controls/controls.js"
import { clamp } from "../../lib/game-maths.js"

const boxWidth = 120

let drag = false
let startingPoint = null

const createValue = () => {
	const control = new BABYLON.GUI.TextBlock("cyclicValues", "")
	control.width = 0.2
	control.height = "40px"
	control.color = uiGreen
	control.fontSize = 12
	control.isHitTestVisible = false
	control.left = 610
	control.top = 240
	control.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT

	window.bxx = control

	return control
}

const createLegend = () => {
	const control = new BABYLON.GUI.TextBlock()
	control.left = 440
	control.top = 133
	control.text = "CYCLIC"
	control.color = uiGreen
	control.fontSize = 9
	control.isHitTestVisible = false

	return control
}

const createBox = () => {
	const control = new BABYLON.GUI.Rectangle()
	control.width = `${boxWidth}px`
	control.height = `${boxWidth}px`
	control.color = uiGreen
	control.thickness = 2
	control.left = 400
	control.top = 200
	control.isPointerBlocker = true

	return control
}

const createCyclic = () => {
	const control = new BABYLON.GUI.Ellipse()
	control.width = "20px"
	control.height = "20px"
	control.thickness = 0
	control.background = uiGreen
	control.left = cyclicZero.left
	control.top = cyclicZero.top
	control.hoverCursor = "pointer"
	control.isPointerBlocker = true

	return control
}

const pointerDown = coords => {
	startingPoint = new BABYLON.Vector2(coords.x, coords.y)
	drag = true
}

const pointerUp = () => {
	drag = false
	startingPoint = null

	controls.cyclic.x = 0
	controls.cyclic.y = 0
}

const cyclicZero = { left: 460 - boxWidth / 2, top: 260 - boxWidth / 2 }
cyclicZero.point = new BABYLON.Vector2(parseFloat(cyclicZero.left), parseFloat(cyclicZero.top))

const moveCyclic = coords => {
	if (!startingPoint) return
	if (drag == true) {
		const diff = startingPoint.subtract(new BABYLON.Vector2(coords.x, coords.y))

		controls.cyclic.x = cyclicZero.left - clamp(diff.x + cyclicZero.point.x, 350, 450)
		controls.cyclic.y = cyclicZero.top - clamp(diff.y + cyclicZero.point.y, 150, 250)
	}
}

export const createCylicUI = ui => {
	const values = createValue()
	const cyclic = createCyclic()
	const box = createBox()
	ui.addControl(createLegend())
	ui.addControl(values)
	ui.addControl(box)
	ui.addControl(cyclic)

	cyclic.onPointerDownObservable.add(pointerDown)
	cyclic.onPointerUpObservable.add(pointerUp)

	box.onPointerMoveObservable.add(moveCyclic)
	cyclic.onPointerMoveObservable.add(moveCyclic)

	return () => {
		values.text = `X: ${controls.cyclic.x.toFixed(1)}\nY: ${controls.cyclic.y.toFixed(1)}`

		cyclic.left = controls.cyclic.x + cyclicZero.left
		cyclic.top = controls.cyclic.y + cyclicZero.top
	}
}
