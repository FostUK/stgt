import { indices, recurseIndices, points, distanceLevels } from "./pre-compute.js"
import { Utils } from "../../../utils.js"
import { MaxLevel } from "./config.js"

let level = 0

class MeshData {
	constructor(v, i, u, n) {
		this.vertices = v || []
		this.indices = i || []
	}
}

const addTriangle = (meshData, p1, p2, p3, radius) => {
	// let np1 = UTILS.Multiply31(p1, Radius + (SampleNoise(p1, NoiseOpt) * radius * maxHeight) );
	// let np2 = UTILS.Multiply31(p2, Radius + (SampleNoise(p2, NoiseOpt) * radius * maxHeight) );
	// let np3 = UTILS.Multiply31(p3, Radius + (SampleNoise(p3, NoiseOpt) * radius * maxHeight) );
	let np1 = Utils.Multiply31(p1, radius)
	let np2 = Utils.Multiply31(p2, radius)
	let np3 = Utils.Multiply31(p3, radius)

	meshData.vertices.push(np3._x, np3._y, np3._z)
	meshData.vertices.push(np2._x, np2._y, np2._z)
	meshData.vertices.push(np1._x, np1._y, np1._z)

	const len = meshData.vertices.length / 3
	meshData.indices.push(len - 3, len - 2, len - 1)
}

const recurse = (meshData, p1, p2, p3, center, newLevel, radius, maxHeight) => {
	newLevel > level && (level = newLevel)

	//The Great Cull
	if (
		Utils.Dot(Utils.Multiply31(p1, 1 + maxHeight), center) < 0.85 &&
		Utils.Dot(Utils.Multiply31(p2, 1 + maxHeight), center) < 0.85 &&
		Utils.Dot(Utils.Multiply31(p3, 1 + maxHeight), center) < 0.85
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
		edgeDist[i] = newLevel > 3 ? distance > distanceLevels[newLevel] : false
	}

	// Add Triangle
	if ((edgeDist[0] && edgeDist[1] && edgeDist[2]) || newLevel >= MaxLevel) {
		addTriangle(meshData, p1, p2, p3, radius)
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
				Utils.Normalize(p[recurseIndices[3 * i + 0]]),
				Utils.Normalize(p[recurseIndices[3 * i + 1]]),
				Utils.Normalize(p[recurseIndices[3 * i + 2]]),
				center,
				newLevel + 1,
				radius,
				maxHeight,
			)
		}
	}
}

export const rebuild = (center, radius, maxHeight) => {
	const meshData = new MeshData()

	level = 0

	for (let i = 0; i < indices.length / 3; i++) {
		let p1 = Utils.Normalize(points[indices[i * 3 + 0]]) // triangle point 1
		let p2 = Utils.Normalize(points[indices[i * 3 + 1]]) // triangle point 2
		let p3 = Utils.Normalize(points[indices[i * 3 + 2]]) // triangle point 3
		recurse(meshData, p1, p2, p3, center, 0, radius, maxHeight)
	}

	return { meshData, level }
}
