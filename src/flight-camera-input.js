// Reference: https://playground.babylonjs.com/#CTCSWQ#1

import { telemetry } from "./flight-model.js"

const halfPI = Math.PI / 2

export class flightCameraInput {
	constructor() {}

	getClassName = () => "flightCameraInput"
	getSimpleName = () => "flightInput"

	attachControl(noPreventDefault) {
		const element = this.camera.getEngine().getInputElement()

		element.addEventListener("keydown", this.#onKeyDown, false)
		element.addEventListener("keyup", this.#onKeyUp, false)
		BABYLON.Tools.RegisterTopRootEvents(element, [{ name: "blur", handler: this.#onBlur }])
	}

	detachControl() {
		const element = this.camera.getEngine().getInputElement()

		element.removeEventListener("keydown", this.#onKeyDown)
		element.removeEventListener("keyup", this.#onKeyUp)
		BABYLON.Tools.UnregisterTopRootEvents(element, [{ name: "blur", handler: this.#onBlur }])
	}

	checkInputs() {
		const direction = new BABYLON.Vector3()
		direction.copyFromFloats(0, 0, telemetry.velocity.z)
		this.camera.getViewMatrix().invertToRef(this.camera._cameraTransformMatrix)
		BABYLON.Vector3.TransformNormalToRef(
			direction,
			this.camera._cameraTransformMatrix,
			this.camera._transformedDirection,
		)


		this.camera.cameraDirection.addInPlace(this.camera._transformedDirection)


		const currentRotation = BABYLON.Quaternion.RotationYawPitchRoll(
			this.camera.rotation.y,
			this.camera.rotation.x,
			this.camera.rotation.z,
		)

		const rotationChange = BABYLON.Quaternion.RotationYawPitchRoll(telemetry.yaw, telemetry.pitch, telemetry.roll)
		currentRotation.multiplyInPlace(rotationChange)
		currentRotation.toEulerAnglesToRef(this.camera.rotation)
	}

	#onKeyDown(event) {
		console.log(`down: ${event.key}`)
	}

	#onKeyUp(event) {
		console.log(`down: ${event.key}`)
	}

	#onBlur(event) {
		console.log("lost focus")
	}
}
