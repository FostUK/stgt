// Reference: https://playground.babylonjs.com/#CTCSWQ#1

import { telemetry } from "./flight-model.js"

let xx = 0

export class flightCameraInput {
	#screenQuaternion
	#constantTransform

	constructor() {
		this.angle = Math.PI / 2
		this.direction = new BABYLON.Vector3(Math.cos(this.angle), 0, Math.sin(this.angle))
		this.#screenQuaternion = new BABYLON.Quaternion();
		this.#constantTransform = new BABYLON.Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5));
	}

	getClassName = () => "flightCameraInput"
	getSimpleName = () => "flightInput"

	attachControl(noPreventDefault) {
		const engine = this.camera.getEngine()
		const element = engine.getInputElement()


		//this.camera.updateUpVectorFromRotation = true
		//this.camera.noRotationConstraint = true

		//this.camera.rotationQuaternion = new BABYLON.Quaternion();


		element.addEventListener("keydown", this.#onKeyDown, false)
		element.addEventListener("keyup", this.#onKeyUp, false)
		BABYLON.Tools.RegisterTopRootEvents(element, [{ name: "blur", handler: this.#onBlur }])
	}

	detachControl() {
		const engine = this.camera.getEngine()
		const element = engine.getInputElement()

		element.removeEventListener("keydown", this.#onKeyDown)
		element.removeEventListener("keyup", this.#onKeyUp)
		BABYLON.Tools.UnregisterTopRootEvents(element, [{ name: "blur", handler: this.#onBlur }])
	}

	checkInputs() {
		//const angle = Math.PI / 2
		//const direction = new BABYLON.Vector3(Math.cos(angle), 0, Math.sin(angle))

		//Forward and backwards
		//this.direction.copyFromFloats(0, 0, telemetry.velocity.z)
		//this.camera.getViewMatrix().invertToRef(this.camera._cameraTransformMatrix)
		//BABYLON.Vector3.TransformNormalToRef(
		//	this.direction,
		//	this.camera._cameraTransformMatrix,
		//	this.camera._transformedDirection,
		//)
		//
		//
		////this.camera.cameraRotation.addInPlace(new BABYLON.Vector2(telemetry.pitch / 5, telemetry.roll / 5))
		//
		////TODO next 2 lines mess up shader
		//this.camera.rotation.x += telemetry.pitch
		//this.camera.rotation.z += telemetry.roll
		//
		//this.camera.cameraDirection.addInPlace(this.camera._transformedDirection)
		//


			//BABYLON.Quaternion.RotationYawPitchRollToRef(BABYLON.Tools.ToRadians(telemetry.pitch), BABYLON.Tools.ToRadians(telemetry.roll), -BABYLON.Tools.ToRadians(telemetry.yaw), this.camera.rotationQuaternion);
	        //this.camera.rotationQuaternion.multiplyInPlace(this.#screenQuaternion);
	        //this.camera.rotationQuaternion.multiplyInPlace(this.#constantTransform);
	        ////Mirror on XY Plane
	        //this.camera.rotationQuaternion.z *= -1;
	        //this.camera.rotationQuaternion.w *= -1;


		 // Initialize to current rotation.
        const currentRotation = BABYLON.Quaternion.RotationYawPitchRoll(
            this.camera.rotation.y,
            this.camera.rotation.x,
            this.camera.rotation.z
        );
        //const rotationChange= new BABYLON.Quaternion();


		//// Pitch.
        //if (this.buttonsPitch.some((v) => { return v === this.activeButton; })) {
        //    // Apply change in Radians to vector Angle.
        //    rotationChange = Quaternion.RotationAxis(Axis.X, y);
        //    // Apply Pitch to quaternion.
        //    currentRotation.multiplyInPlace(rotationChange);
        //}
		//
        //// Yaw.
        //if (this.buttonsYaw.some((v) => { return v === this.activeButton; })) {
        //    // Apply change in Radians to vector Angle.
        //    rotationChange = Quaternion.RotationAxis(Axis.Y, x);
        //    // Apply Yaw to quaternion.
        //    currentRotation.multiplyInPlace(rotationChange);
		//
        //    // Add Roll, if banked turning is enabled, within Roll limit.
        //    let limit = (camera.bankedTurnLimit) + camera._trackRoll; // Defaults to 90° plus manual roll.
        //    if (camera.bankedTurn && -limit < camera.rotation.z && camera.rotation.z < limit) {
        //        let bankingDelta = camera.bankedTurnMultiplier * -x;
        //        // Apply change in Radians to vector Angle.
        //        rotationChange = Quaternion.RotationAxis(Axis.Z, bankingDelta);
        //        // Apply Yaw to quaternion.
        //        currentRotation.multiplyInPlace(rotationChange);
        //    }
        //}

        // Roll.
        //if (this.buttonsRoll.some((v) => { return v === this.activeButton; })) {
            // Apply change in Radians to vector Angle.

		//TODO this definitely looks like the correct way to handle roll. Maybe a shader issue?

		xx = 0.01
        const rotationChange = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Z, xx);
		currentRotation.multiplyInPlace(rotationChange);
		//	this.camera.rotation.z = xx
		//this.camera.cameraDirection.addInPlace(this.camera._transformedDirection)
		//this.camera.cameraRotation.addInPlace(new BABYLON.Vector2(telemetry.pitch / 5, telemetry.roll / 5))

            // Track Rolling.
            //this.camera._trackRoll = this.camera.rotation.z + telemetry.roll;
            // Apply Pitch to quaternion.
            //currentRotation.multiplyInPlace(rotationChange);
        //}

        // Apply rotationQuaternion to Euler camera.rotation.
        currentRotation.toEulerAnglesToRef(this.camera.rotation);


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
