import { Utils } from "../../../utils.js"
import { MaxLevel, StartRes } from "./config.js"

//const PERMUTATION_TABLE_SIZE = 512

export const indices = [
	0, 11, 5, 0, 5, 1, 0, 1, 7, 0, 7, 10, 0, 10, 11, 1, 5, 9, 5, 11, 4, 11, 10, 2, 10, 7, 6, 10, 7, 6, 7, 1, 8, 3, 9, 4,
	3, 4, 2, 3, 2, 6, 3, 6, 8, 3, 8, 9, 4, 9, 5, 2, 4, 11, 6, 2, 10, 8, 6, 7, 9, 8, 1,
]
export const recurseIndices = [0, 3, 5, 5, 3, 4, 3, 1, 4, 5, 4, 2]

export let points
export let distanceLevels

export const precompute = e => {
	// const noiseOptions = e.properties
	// NoiseOpt.noise = new SimplexNoise(e.seed);
	// NoiseOpt.noise = new PerlinNoise(makePermTable(e.seed, PERMUTATION_TABLE_SIZE).perm);

	distanceLevels = [...Array(MaxLevel)].map((v, i) => StartRes * (StartRes / Math.pow(3, i / 1.8)))

	const t = (1.0 + Math.sqrt(5.0)) / 2.0
	points = [
		Utils.Vector3([-1, t, 0]),
		Utils.Vector3([1, t, 0]),
		Utils.Vector3([-1, -t, 0]),
		Utils.Vector3([1, -t, 0]),
		Utils.Vector3([0, -1, t]),
		Utils.Vector3([0, 1, t]),
		Utils.Vector3([0, -1, -t]),
		Utils.Vector3([0, 1, -t]),
		Utils.Vector3([t, 0, -1]),
		Utils.Vector3([t, 0, 1]),
		Utils.Vector3([-t, 0, -1]),
		Utils.Vector3([-t, 0, 1]),
	]

	return true
}
