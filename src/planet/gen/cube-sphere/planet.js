import { SimplexNoise } from "../../../../lib/simplex-noise-es.js"

const simplex = new SimplexNoise()

const config = {
	size: 300,
	divisions: 160,
}

const rotateYFn = angle => vec => [
	vec[0] * Math.cos(angle) - vec[2] * Math.sin(angle),
	vec[1],
	vec[2] * Math.cos(angle) + vec[0] * Math.sin(angle),
]

const rotateXFn = angle => vec => [
	vec[0],
	vec[1] * Math.cos(angle) - vec[2] * Math.sin(angle),
	vec[1] * Math.sin(angle) + vec[2] * Math.cos(angle),
]

const transformTo = {
	south: a => a,
	east: rotateYFn(Math.PI * 0.5),
	north: rotateYFn(Math.PI),
	west: rotateYFn(Math.PI * 1.5),
	up: rotateXFn(Math.PI * 0.5),
	down: rotateXFn(Math.PI * -0.5),
}

const scalePoint = scale => point => [point[0] * scale, point[1] * scale, point[2] * scale]

const textureFace = {
	north: "px",
	east: "nx",
	south: "nz",
	west: "ny",
	up: "py",
	down: "pz",
}

const getMaterial = (scene, facing) => {
	const material = new BABYLON.StandardMaterial(`facing_${facing}`, scene)

	///material.wireframe = true
	// material.backFaceCulling = false;
	material.diffuseTexture = new BABYLON.Texture(`assets/mars/mars_${textureFace[facing]}.jpg`, scene)

	material.diffuseTexture.wrapU = 0
	material.diffuseTexture.wrapV = 0

	material.emissiveColor = new BABYLON.Color3(0.05, 0.1, 0.1)
	material.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1)
	//material.specularTexture = material.diffuseTexture

	return material
}

const normalise = pos => {
	const length = Math.sqrt(Math.pow(pos[0], 2) + Math.pow(pos[1], 2) + Math.pow(pos[2], 2))
	return pos.map(a => a / length)
}

const noiseify = pos => {
	const noiseDensity = 8
	const noiseScale = 0.1
	const noise =
		(1 + simplex.noise3D(pos[0] * noiseDensity, pos[1] * noiseDensity, pos[2] * noiseDensity)) * noiseScale

	return pos.map(v => v + v * noise)
}

const createFace = scene => facing => {
	const verts = [...Array((config.divisions + 1) * (config.divisions + 1))]
		.map((_, i) => {
			const col = i % (config.divisions + 1)
			const row = Math.floor(i / (config.divisions + 1))
			const width = 2 / config.divisions

			return [width * col - 1, width * row - 1, -1]
		})
		.map(transformTo[facing])

	const faces = [...Array(config.divisions * config.divisions * 2)].map((_, i) => {
		const quad = Math.floor(i * 0.5)
		const row = Math.floor(quad / config.divisions)
		const f2 = i % 2

		return [quad + row + f2, quad + row + 1 + f2 * (config.divisions + 1), quad + row + 1 + config.divisions]
	})

	const uvs = [...Array((config.divisions + 1) * (config.divisions + 1))]
		.map((_, i) => {
			const col = i % (config.divisions + 1)
			const row = Math.floor(i / (config.divisions + 1))

			const wide = 1 / config.divisions

			return [col * wide, row * wide]
		})
		.flat(2)

	const positions = verts.map(normalise).map(noiseify)

	const vertexData = new BABYLON.VertexData()
	vertexData.positions = positions.map(scalePoint(config.size)).flat()
	vertexData.indices = faces.flat()
	vertexData.normals = positions.flat()
	vertexData.uvs = uvs.flat()

	const planetFacing = new BABYLON.Mesh(`facing${facing}`, scene)
	vertexData.applyToMesh(planetFacing)

	planetFacing.material = getMaterial(scene, facing)

	return planetFacing
}

export const createPlanet = scene => {
	const planetFacings = ["south", "east", "north", "west", "up", "down"].map(createFace(scene))
}
