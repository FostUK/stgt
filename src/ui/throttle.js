import { uiGreen } from "./colours.js"
import { controls } from "../controls/controls.js"
import { clamp } from "../../lib/game-maths.js"

const createLegend = () => {
	const control = new BABYLON.GUI.TextBlock()
	control.left = 285
	control.top = 201
	control.text = Array.from("THROTTLE").join("\n")
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
	control.left = 440
	control.top = 270
	control.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT

	return control
}

const createBox = () => {
	const control = new BABYLON.GUI.Rectangle()
	control.width = `30px`
	control.height = `120px`
	control.color = uiGreen
	control.thickness = 2
	control.left = 310
	control.top = 200
	control.isPointerBlocker = true

	return control
}

const createThrottle = () => {
	const control = new BABYLON.GUI.Ellipse()
	control.width = "20px"
	control.height = "20px"
	control.thickness = 0
	control.background = uiGreen
	control.left = 310
	control.top = 200
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
	controls.throttle = 0
}

const moveThrottle = coords => {
	if (!startingPoint) return
	if (drag === true) {
		const diff = startingPoint.subtract(new BABYLON.Vector2(coords.x, coords.y))
		controls.throttle = (200 - clamp(-diff.y + 200, 150, 250))
	}
}

export const createThrottleUI = ui => {
	const value = createValue()
	const box = createBox()
	const throttle = createThrottle()

	ui.addControl(createLegend())
	ui.addControl(value)
	ui.addControl(box)
	ui.addControl(throttle)

	throttle.onPointerDownObservable.add(pointerDown)
	throttle.onPointerUpObservable.add(pointerUp)

	box.onPointerMoveObservable.add(moveThrottle)
	throttle.onPointerMoveObservable.add(moveThrottle)

	return () => {
		value.text = `${controls.throttle.toFixed(1)}`
		throttle.top = 200 -controls.throttle
	}
}
