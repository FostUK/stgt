import { Utils } from "../../../utils.js"
//TODO could vector utils be babylon vectors?

import { precompute, icoIndices, icoRecurseIndices } from "./ico-sphere.js"
import { MaxLevel } from "./config.js"

let level = 0
var Radius = 10
var MaxHeight = 1
var Position = null
var Frustumplanes = []

const recurse = (meshData, p1, p2, p3, center, newLevel) => {
	if (newLevel > level) {
		level = newLevel
	}

	//The Great Cull
	if (
		Utils.Dot(Utils.Multiply31(p1, 1 + MaxHeight), center) < 0.85 &&
		Utils.Dot(Utils.Multiply31(p2, 1 + MaxHeight), center) < 0.85 &&
		Utils.Dot(Utils.Multiply31(p3, 1 + MaxHeight), center) < 0.85
	) {
		return
	}

	//let size = StartRes/Math.pow(2, level);

	//Post culling
	// if (level > 3){
	//     if (
	//         isPointInFrustum(Frustumplanes, UTILS.Multiply31(UTILS.Add33V(p1, Position), Radius)) == false &&
	//         isPointInFrustum(Frustumplanes, UTILS.Multiply31(UTILS.Add33V(p2, Position), Radius)) == false &&
	//         isPointInFrustum(Frustumplanes, UTILS.Multiply31(UTILS.Add33V(p3, Position), Radius)) == false
	//     ){
	//         return;
	//     }
	// }

	// The survivors after the cull
	let edges = [
		Utils.Divide31(Utils.Add33V(p1, p2), 2),
		Utils.Divide31(Utils.Add33V(p2, p3), 2),
		Utils.Divide31(Utils.Add33V(p3, p1), 2),
	]
	let edgeDist = []

	// Their distance is evaluated
	for (let i = 0; i < 3; i++) {
		let distance = Utils.distanceToPoint3DV(edges[i], center)
		edgeDist[i] = newLevel > 3 ? distance > DistanceLevels[newLevel] : false
	}

	// Add Triangle
	if ((edgeDist[0] && edgeDist[1] && edgeDist[2]) || newLevel >= MaxLevel) {
		addTriangle(meshData, p1, p2, p3)
		return
	}

	// Recurse
	let p = [p1, p2, p3, edges[0], edges[1], edges[2]]
	let valid = [true, true, true, true]

	if (edgeDist[0]) {
		p[3] = p1
		valid[0] = false
	} // skip triangle 0
	if (edgeDist[1]) {
		p[4] = p2
		valid[2] = false
	} // skip triangle 2
	if (edgeDist[2]) {
		p[5] = p3
		valid[3] = false
	} // skip triangle 3

	for (let i = 0; i < 4; i++) {
		if (valid[i] == true) {
			recurse(
				meshData,
				Utils.Normalize(p[icoRecurseIndices[3 * i + 0]]),
				Utils.Normalize(p[icoRecurseIndices[3 * i + 1]]),
				Utils.Normalize(p[icoRecurseIndices[3 * i + 2]]),
				center,
				newLevel + 1,
			)
		}
	}
}

const addTriangle = (meshData, p1, p2, p3) => {
	// let np1 = UTILS.Multiply31(p1, Radius + (SampleNoise(p1, NoiseOpt) * Radius * MaxHeight) );
	// let np2 = UTILS.Multiply31(p2, Radius + (SampleNoise(p2, NoiseOpt) * Radius * MaxHeight) );
	// let np3 = UTILS.Multiply31(p3, Radius + (SampleNoise(p3, NoiseOpt) * Radius * MaxHeight) );
	let np1 = Utils.Multiply31(p1, Radius)
	let np2 = Utils.Multiply31(p2, Radius)
	let np3 = Utils.Multiply31(p3, Radius)

	meshData.vertices.push(np3._x, np3._y, np3._z)
	meshData.vertices.push(np2._x, np2._y, np2._z)
	meshData.vertices.push(np1._x, np1._y, np1._z)

	const len = meshData.vertices.length / 3
	meshData.indices.push(len - 3, len - 2, len - 1)
}

const rebuild = center => {
	//delete MeshData
	const meshData = new MeshData()

	level = 0

	for (let i = 0; i < icoIndices.length / 3; i++) {
		let p1 = Utils.Normalize(IcoPoints[icoIndices[i * 3 + 0]]) // triangle point 1
		let p2 = Utils.Normalize(IcoPoints[icoIndices[i * 3 + 1]]) // triangle point 2
		let p3 = Utils.Normalize(IcoPoints[icoIndices[i * 3 + 2]]) // triangle point 3
		recurse(meshData, p1, p2, p3, center, 0, p1, p2, p3)
	}

	return meshData
}

function isPointInFrustum(planes, point) {
	for (let i = 0; i < 6; i++) {
		if (Utils.Dot(planes[i].normal, point) + planes[i].d < 0) {
			return false
		}
	}
	return true
}

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

let IcoPoints
let DistanceLevels

const initialise = e => {
		const state = e.data.state
		const { icoPoints, distanceLevels, noiseOptions } = precompute(e.data)

		IcoPoints = icoPoints //TODO stop sharing with module "globals"
		DistanceLevels = distanceLevels //TODO stop sharing with module "globals"

		postMessage({ state })
	}

const build = e => {
		const state = e.data.state
		const center = e.data.center || Utils.Vector3([0])
		Radius = e.data.radius || 10
		Frustumplanes = e.data.frustumplanes
		MaxHeight = e.data.maxHeight
		Position = e.data.position
		const meshData = rebuild(center)
		const data = makeSharedData(meshData)

		postMessage({
			state,
			data,
			level,
		})
	}

const dispatcher = [initialise, build]

self.onmessage = e => dispatcher[e.data.state](e)

class MeshData {
	constructor(v, i, u, n) {
		this.vertices = v || []
		this.indices = i || []
	}
}
