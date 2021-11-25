import { uiGreen } from "./colours.js"
import { controls } from "../controls.js"
import { clamp } from "../game-maths.js"

const createLegend = () => {
	const control = new BABYLON.GUI.TextBlock()
	control.left = 440
	control.top = 310
	control.text = "ROTORS"
	control.color = uiGreen
	control.fontSize = 9
	control.isHitTestVisible = false

	return control
}

const createValue = () => {
	const control = new BABYLON.GUI.TextBlock("throttleValue", "0")
	control.width = 0.2
	control.height = "40px"
	control.color = uiGreen
	control.fontSize = 12
	control.isHitTestVisible = false
	control.left = 610
	control.top = 285
	control.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT

	return control
}

const createBox = () => {
	const control = new BABYLON.GUI.Rectangle()
	control.width = "120px"
	control.height = "30px"
	control.color = uiGreen
	control.thickness = 2
	control.left = 400
	control.top = 285
	control.isPointerBlocker = true

	return control
}

const createRotor = () => {
	const control = new BABYLON.GUI.Ellipse()
	control.width = "20px"
	control.height = "20px"
	control.thickness = 0
	control.background = uiGreen
	control.left = 400
	control.top = 285
	control.hoverCursor = "pointer"
	control.isPointerBlocker = true

	return control
}

let drag = false
let startingPoint = null

const pointerDown = coords => {
	startingPoint = new BABYLON.Vector2(coords.x, coords.y)
	drag = true
}

const pointerUp = () => {
	drag = false
	startingPoint = null
	controls.rotor = 0
}

const movePedals =  coords => {
	if (!startingPoint) return
	if (drag === true) {
		const diff = startingPoint.subtract(new BABYLON.Vector2(coords.x, coords.y))
		controls.rotor = -(400 - clamp(-diff.x + 400, 350, 450))
	}
}

export const createRotorUI = ui => {
	const value = createValue()
	const box = createBox()
	const rotor = createRotor()

	ui.addControl(createLegend())
	ui.addControl(value)
	ui.addControl(box)
	ui.addControl(rotor)

	rotor.onPointerDownObservable.add(pointerDown)
	rotor.onPointerUpObservable.add(pointerUp)

	box.onPointerMoveObservable.add(movePedals)
	rotor.onPointerMoveObservable.add(movePedals)

	return () => {
		value.text = `${controls.rotor.toFixed(1)}`
		rotor.left = 400 + controls.rotor
	}
}
