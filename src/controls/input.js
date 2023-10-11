import { controls } from "./controls.js"
import { clamp } from "../../lib/game-maths.js"

const updateGamePad = (gamepad, state) => {
	console.log("Connected: " + gamepad.id)

	//Handle gamepad types
	if (gamepad instanceof BABYLON.Xbox360Pad) {
		gamepad.onButtonDownObservable.add((button, state) => {
			console.log(BABYLON.Xbox360Button[button] + " pressed")
		})
		gamepad.onButtonUpObservable.add((button, state) => {
			console.log(BABYLON.Xbox360Button[button] + " released")
		})
	} else if (gamepad instanceof BABYLON.DualShockPad) {
		//Dual shock button down/up events
		gamepad.onButtonDownObservable.add((button, state) => {
			console.log(BABYLON.DualShockButton[button] + " pressed")
		})
		gamepad.onButtonUpObservable.add((button, state) => {
			console.log(BABYLON.DualShockButton[button] + " released")
		})

		//Triggers events
		gamepad.onlefttriggerchanged(value => {
			console.log("Trigger:" + value)
		})

		//DPad events
		gamepad.onPadDownObservable.add((button, state) => {
			console.log(BABYLON.DualShockDpad[button] + " pressed")
		})
		gamepad.onPadUpObservable.add((button, state) => {
			console.log(BABYLON.DualShockDpad[button] + " released")
		})
	} else if (gamepad instanceof BABYLON.GenericPad) {
		//Generic button down/up events
		gamepad.onButtonDownObservable.add((button, state) => {
			console.log(button + " pressed")
		})
		gamepad.onButtonUpObservable.add((button, state) => {
			console.log(button + " released")
		})
	} else if (gamepad instanceof BABYLON.PoseEnabledController) {
		//Button events
		gamepad.onTriggerStateChangedObservable.add((button, state) => {
			console.log("Trigger:" + button.value)
		})
		gamepad.onMainButtonStateChangedObservable.add((button, state) => {
			console.log("Main button:" + button.value)
		})
	}

	//Stick events
	gamepad.onleftstickchanged(values => {
		handleRot(values.x)
		handleThrottle(values.y)
	})
	gamepad.onrightstickchanged(handleCyclic)
}

const handleRot = val => (controls.rotor = curveVal(val))
const handleThrottle = val => (controls.throttle = -curveVal(val))
const handleCyclic = values => {
	controls.cyclic.x = curveVal(values.x)
	controls.cyclic.y = curveVal(values.y)
}

const deadzone = 0.2

const applyDeadzone = (val, dz) => clamp(val * (1 + dz) - dz, 0, 1)

const curveVal = val => {
	const abs = Math.abs(val)
	const sign = Math.sign(val) * 50
	return applyDeadzone(abs, deadzone) * sign
}

const onGamepadDisconnectedObservable = (gamepad, state) => console.log("Disconnected: " + gamepad.id)

const keyHandlers = {
	"=": () => controls.throttle += 4,
	"-": () => controls.throttle -= 4,
	"0": () => controls.throttle = 0,
	ArrowDown: () => controls.cyclic.y = 8,
	ArrowUp: () => controls.cyclic.y = -8,
	ArrowLeft: () => controls.cyclic.x = -8,
	ArrowRight: () => controls.cyclic.x = 8,
}

const onKeyDown = event => {
	//console.log(`down: ${event.key}`)
	keyHandlers[event.key]?.()
}

const onKeyUp = () => {
	controls.cyclic.y = 0
	controls.cyclic.x = 0
}

const createKeyboardInput = camera => {
	const element = camera.getEngine().getInputElement()

	element.addEventListener("keydown", onKeyDown, false)
	element.addEventListener("keyup", onKeyUp, false)
}

export const createInput = camera => {
	const gamepadManager = new BABYLON.GamepadManager()
	gamepadManager.onGamepadDisconnectedObservable.add(onGamepadDisconnectedObservable)
	gamepadManager.onGamepadConnectedObservable.add(updateGamePad)

	createKeyboardInput(camera)

}
