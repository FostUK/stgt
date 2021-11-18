import { Utils } from "../utils.js"
import { makePermTable } from "./gen/noise.js"
import { planetMaterial } from "./planet-material.js"
import { initWorker } from "./gen/icosahedron/init-worker.js"

const PERMUTATION_TABLE_SIZE = 512

let IcoWorkerUser = null

export class Planet extends BABYLON.TransformNode {
	constructor(p, scene) {
		super(p.name || "Earth", scene)
		this.position = p.position || new BABYLON.Vector3.Zero()

		this.observer = new BABYLON.Vector3.Zero()
		this.lastCenter = new BABYLON.Vector3.Zero()

		this.radius = p.radius || 10
		this.maxHeight = p.maxHeight || 0.0025

		this.birthName = this.position.x + ", " + this.position.y + ", " + this.position.z
		this.blankSphere = null
		this.isRunning = false

		this.seed = p.seed || this.name + "(" + this.birthName + ")"
		this.seedHash = this.seed.hashCode()
		this.noise = makePermTable(this.seed, PERMUTATION_TABLE_SIZE)

		this.properties = {
			octaves: 5,
			frequency: 10.0,
			amplitude: 1.0,
			roughness: 4.0,
			persistence: 0.4,

			rCoeff: new BABYLON.Vector3(3.8e-3, 13.5e-3, 33.1e-3),
			mCoeff: new BABYLON.Vector3(21e-3, 21e-3, 21e-3),
			mieG: 0.8,
		}

		const onComplete = function () {
			this.createPlanet()
			this.hashTexture.isEnabled = false
		}.bind(this)

		planetMaterial(this, onComplete)

		this.setObserver(new BABYLON.Vector3(0, 0, 0))
	}

	createBlankSphere() {
		this.blankSphere = BABYLON.MeshBuilder.CreateSphere(
			"blank",
			{ diameter: this.radius * 2, segments: 32 },
			this.getScene(),
		)
		this.blankSphere.material = this.material
		this.blankSphere.material.zOffset = 2
		this.blankSphere.parent = this
	}

	createPlanet() {
		// this.isRunning = true;
		// initWorker(this, this.getScene());
		this.checkIfRunning()
		console.log(this.name + "-(" + this.birthName + ") was created")
	}
	updatePlanet() {
		this.checkIfRunning()
	}

	checkIfRunning() {
		if (Utils.distanceToPoint3DV(this.position, this.lastCenter) < 2) {
			this.isRunning = true
			if (IcoWorkerUser != null && IcoWorkerUser != this) {
				IcoWorkerUser.isRunning = false
				IcoWorkerUser.checkIfRunning()
				IcoWorkerUser = null
			}
		} else {
			this.isRunning = false
			// console.log("not running");
		}

		if (this.isRunning == false) {
			if (this.blankSphere == null) {
				this.mesh?.dispose()
				this.mesh = null
				IcoWorkerUser = null
				this.createBlankSphere()
			}
		} else if (IcoWorkerUser == null) {
			this.blankSphere?.dispose()
			this.mesh?.dispose()
			this.blankSphere = null
			this.mesh = null
			IcoWorkerUser = this
			initWorker(this)
		}
	}

	setObserver(obs) {
		this.observer = obs.clone()
		obs = obs.subtract(this.getAbsolutePosition())
		obs = obs.divide(new BABYLON.Vector3().setAll(this.radius))

		if (this.lastCenter.equals(obs)) return

		this.lastCenter = obs.clone()
	}

	setPosition(pos) {
		this.position = pos.clone()

		const v = this.getAbsolutePosition().multiply(new BABYLON.Vector3(-1, -1, -1))
		const dX = Utils.SplitDouble(v.x)
		const dY = Utils.SplitDouble(v.y)
		const dZ = Utils.SplitDouble(v.z)

		this.material?.setVector3("eyepos", new BABYLON.Vector3(dX[0], dY[0], dZ[0]))
		this.material?.setVector3("eyepos_lowpart", new BABYLON.Vector3(dX[1], dY[1], dZ[1]))
	}

	setLightDirection(direction) {
		this.material?.setVector3("lightDir", direction)
	}

	setWireframe(bool) {
		this.material && (this.material.wireframe = bool)
	}
}
