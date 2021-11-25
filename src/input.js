import { controls } from "./controls.js"
import { clamp } from "./game-maths.js"

const updateGamePad = (gamepad, state) => {
	console.log("Connected: " + gamepad.id)

	//Handle gamepad types
	if (gamepad instanceof BABYLON.Xbox360Pad) {
		//Xbox button down/up events
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

export const createInput = () => {
	const gamepadManager = new BABYLON.GamepadManager()

	gamepadManager.onGamepadDisconnectedObservable.add((gamepad, state) => {
		console.log("Disconnected: " + gamepad.id)
	})

	gamepadManager.onGamepadConnectedObservable.add(updateGamePad)
}
