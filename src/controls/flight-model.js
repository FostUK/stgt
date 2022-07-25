import { controls } from "./controls.js"
import { clamp } from "../../lib/game-maths.js"

const mass = 5165
const airResistance = 60
const cyclicDamping = 1

let accel = { x: 0, y: 0, z: 0 }

let currentCyclic = {
	x: 0,
	y: 0,
}

const maxV = 0.005
const minV = -0.005

const updateRotation = () => {
	currentCyclic.x = currentCyclic.x + clamp(controls.cyclic.x - currentCyclic.x, -cyclicDamping, cyclicDamping)
	currentCyclic.y = currentCyclic.y + clamp(controls.cyclic.y - currentCyclic.y, -cyclicDamping, cyclicDamping)

	telemetry.pitch = 0.001 * -currentCyclic.y
	telemetry.roll = 0.001 * -currentCyclic.x

	const rotorYaw = controls.rotor * 0.001 //TODO consider velocity
	const cyclicYaw = -currentCyclic.x * currentCyclic.y * 0.00001
	telemetry.yaw = rotorYaw + cyclicYaw
}

const updateVelocity = () => {
	//accel.x = -(controls.cyclic.x * 2 + airResistance * telemetry.velocity.x) / mass
	//telemetry.velocity.x = telemetry.velocity.x + accel.x

	//accel.y = -(controls.cyclic.y * 4 + airResistance * telemetry.velocity.y) / mass
	//telemetry.velocity.y = telemetry.velocity.y + accel.y

	//TODO consider gravity
	accel.z = (controls.throttle - airResistance * telemetry.velocity.z) / mass
	telemetry.velocity.z = clamp(telemetry.velocity.z + accel.z, minV, maxV)
}

export const updateFlightModel = () => {
	updateVelocity()
	updateRotation()
}

export const telemetry = {
	rotor: 0.3,
	velocity: { x: 0, y: 0, z: 0 },
	pitch: 0,
	roll: 0,
	yaw: 0,
	altitude: 0
}
