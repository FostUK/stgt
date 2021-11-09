import { Utils } from "../../../utils.js"
import { rebuild } from "./build.js"
//TODO could vector utils be babylon vectors?

//function isPointInFrustum(planes, point) {
//	for (let i = 0; i < 6; i++) {
//		if (Utils.Dot(planes[i].normal, point) + planes[i].d < 0) {
//			return false
//		}
//	}
//	return true
//}

const makeSharedData = meshData => {
	let obj = {}

	try {
		var a = SharedArrayBuffer
	} catch (e) {
		console.log("SharedArrayBuffers are not supported/enabled in your browser/setup")

		obj.vertices = meshData.vertices
		obj.indices = meshData.indices

		return obj
	}

	obj.vertices = new Float32Array(new SharedArrayBuffer(4 * meshData.vertices.length))
	obj.indices = new Float32Array(new SharedArrayBuffer(4 * meshData.indices.length))
	obj.vertices.set(meshData.vertices, 0)
	obj.indices.set(meshData.indices, 0)

	return obj
}


//TODO this does nothing now but might be used to init planet props at some point.
const initialise = data => {
	const state = data.state
	postMessage({ state })
}

const build = inData => {
	const state = inData.state
	const center = inData.center || Utils.Vector3([0])
	const radius = inData.radius || 10
	const maxHeight = inData.maxHeight || 1
	const { meshData, level } = rebuild(center, radius, maxHeight)
	const data = makeSharedData(meshData)

	postMessage({
		state,
		data,
		level,
	})
}

self.onmessage = e => [initialise, build][e.data.state](e.data)
