import { COMP_GL, COMP_GL_PROGRAM } from "../Loader.js"
import { UTILS } from "../Utils.js"
import { makePermTable } from "./gen/PerlinNoise.js"
import { planetMaterial } from "./planet-material.js"

const PERMUTATION_TABLE_SIZE = 512

var IcoWorker = new Worker("/src/planet/gen/icosahedron/Worker.js", { type: "module" })
var IcoWorkerUser = null

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
		if (UTILS.distanceToPoint3DV(this.position, this.lastCenter) < 2) {
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
				if (this.mesh != null) {
					this.mesh.dispose()
				}
				this.mesh = null
				IcoWorkerUser = null
				this.createBlankSphere()
			}
		} else {
			if (IcoWorkerUser == null) {
				if (this.blankSphere != null) {
					this.blankSphere.dispose()
				}
				if (this.mesh != null) {
					this.mesh.dispose()
				}
				this.blankSphere = null
				this.mesh = null
				initWorker(this)
			}
		}
	}

	setObserver(obs) {
		this.observer = obs.clone()

		obs = obs.subtract(this.getAbsolutePosition())
		obs = obs.divide(new BABYLON.Vector3().setAll(this.radius))

		if (this.lastCenter.equals(obs)) {
			return
		}
		this.lastCenter = obs.clone()
	}

	setPosition(pos) {
		this.position = pos.clone()

		var v = this.getAbsolutePosition().multiply(new BABYLON.Vector3(-1, -1, -1))
		var dX = UTILS.SplitDouble(v.x),
			dY = UTILS.SplitDouble(v.y),
			dZ = UTILS.SplitDouble(v.z)

		if (this.material != null) {
			this.material.setVector3("eyepos", new BABYLON.Vector3(dX[0], dY[0], dZ[0]))
			this.material.setVector3("eyepos_lowpart", new BABYLON.Vector3(dX[1], dY[1], dZ[1]))
		}
	}

	setLightDirection(direction) {
		if (this.material != null) {
			this.material.setVector3("lightDir", direction)
		}
	}

	setWireframe(bool) {
		if (this.material != null) {
			this.material.wireframe = bool
		}
	}
}

var IN_TRANSFORM_BUFFER = null
var OUT_TRANSFORM_BUFFER = null
var FEEDBACK_TRANSFORM_BUFFER = null

function useTransformFeedback(gl, dataIn, dataOut, planet) {
	const VERTEX_COUNT = dataIn.length
	gl.useProgram(COMP_GL_PROGRAM)
	gl.enable(gl.RASTERIZER_DISCARD)

	//input
	//let inputBuffer = gl.createBuffer();
	if (IN_TRANSFORM_BUFFER == null) {
		IN_TRANSFORM_BUFFER = gl.createBuffer()
	}
	gl.bindBuffer(gl.ARRAY_BUFFER, IN_TRANSFORM_BUFFER)
	gl.bufferData(gl.ARRAY_BUFFER, dataIn, gl.STATIC_DRAW)

	//output
	//let resultBuffer = gl.createBuffer();
	if (OUT_TRANSFORM_BUFFER == null) {
		OUT_TRANSFORM_BUFFER = gl.createBuffer()
	}

	// Create a TransformFeedback object
	//var transformFeedback = gl.createTransformFeedback();
	if (FEEDBACK_TRANSFORM_BUFFER == null) {
		FEEDBACK_TRANSFORM_BUFFER = gl.createTransformFeedback()
	}
	gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, FEEDBACK_TRANSFORM_BUFFER)

	gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, OUT_TRANSFORM_BUFFER)
	gl.bufferData(gl.TRANSFORM_FEEDBACK_BUFFER, VERTEX_COUNT * Float32Array.BYTES_PER_ELEMENT, gl.STATIC_DRAW)

	// Attribute position
	const inputAttribLocation = gl.getAttribLocation(COMP_GL_PROGRAM, "position")

	gl.enableVertexAttribArray(inputAttribLocation)
	gl.bindBuffer(gl.ARRAY_BUFFER, IN_TRANSFORM_BUFFER)
	gl.vertexAttribPointer(
		inputAttribLocation, // index
		3, // size
		gl.FLOAT, // type
		gl.FALSE, // normalized?
		0, // stride
		0, // offset
	)

	// Activate the transform feedback
	gl.beginTransformFeedback(gl.POINTS)
	gl.drawArrays(gl.POINTS, 0, Math.floor(VERTEX_COUNT / 3))
	gl.endTransformFeedback()

	// Read back
	gl.getBufferSubData(
		gl.TRANSFORM_FEEDBACK_BUFFER, // target
		0, // srcByteOffset
		dataOut, // dstData
	)

	gl.disable(gl.RASTERIZER_DISCARD)
}

const sendToWorkerFn = planet => state => {
	switch (state) {
		case 0:
			IcoWorker.postMessage({
				state: state,
				seed: planet.seed,
				properties: planet.properties,
				hashTexture: UTILS.getTextureData(planet.hashTexture),
			})
			break

		case 1:
			// let prev = scene.activeCamera.fov;
			// scene.activeCamera.fov = UTILS.degrees_to_radians(180);
			// scene.updateTransformMatrix();
			// let frustumplanes = BABYLON.Frustum.GetPlanes(scene.getTransformMatrix());
			// scene.activeCamera.fov = prev;

			IcoWorker.postMessage({
				state,
				center: planet.lastCenter,
				radius: planet.radius,
				maxHeight: planet.maxHeight,
				position: planet.position,
				//frustumplanes: frustumplanes,
				direction: planet.getScene().activeCamera.getForwardRay(1).direction,
				// windowWidth: IcoWorkerUser.getScene().activeCamera.viewport.width,
				// windowHeight: IcoWorkerUser.getScene().activeCamera.viewport.height
			})
			break
	}
}

const makeMesh = (planet, meshData) => {
		if (planet.mesh == null) {
			planet.mesh = new BABYLON.Mesh("t", planet.getScene())
			planet.mesh.material = planet.material
			planet.mesh.parent = planet
		}
		if (meshData.vertices.length > 0) {
			useTransformFeedback(COMP_GL, meshData.vertices, meshData.vertices, planet)
			planet.mesh.setVerticesData(BABYLON.VertexBuffer.PositionKind, meshData.vertices)
			planet.mesh.setIndices(meshData.indices, null, false)
		}
	}

const initWorker = planet => {
	IcoWorkerUser = planet
	const sendToWorker = sendToWorkerFn(planet)
	sendToWorker(0)

	IcoWorker.onmessage = function (e) {
		switch (e.data.state) {
			case 0:
				// use retained version of planet and not the updated version
				planet.isRunning && sendToWorker(1)
				break
			case 1:
				if (planet.isRunning) {
					makeMesh(planet, e.data.data)

					debug({
						vertexCount: e.data.data.vertices.length / 3,
						currentLevel: e.data.level,
					})
					sendToWorker(1)
				}
				break
		}
	}
}

var vertCount = document.getElementById("vertCount")
var level = document.getElementById("level")
function debug(p) {
	vertCount.innerHTML = "Vertex Count: " + p.vertexCount
	level.innerHTML = "Current Level: " + p.currentLevel
}
