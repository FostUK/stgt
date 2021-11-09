import { Utils } from "../../../utils.js"
import { COMP_GL, COMP_GL_PROGRAM } from "../../../loader.js"
const IcoWorker = new Worker("/src/planet/gen/icosahedron/worker.js", { type: "module" })

let IN_TRANSFORM_BUFFER = null
let OUT_TRANSFORM_BUFFER = null
let FEEDBACK_TRANSFORM_BUFFER = null

const useTransformFeedback = (gl, dataIn, dataOut) => {
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
				hashTexture: Utils.getTextureData(planet.hashTexture),
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

const vertCount = document.getElementById("vertCount")
const level = document.getElementById("level")
const debug = p => {
	vertCount.innerHTML = "Vertex Count: " + p.vertexCount
	level.innerHTML = "Current Level: " + p.currentLevel
}

export const initWorker = planet => {
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
