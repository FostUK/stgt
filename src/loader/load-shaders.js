import {Utils} from '../utils.js'

const shaderDir = "src/planet/shdr/"

const shaders = [
	"Base_Vertex",
	"PBRFrag",
	"Tools",
	"noise/SimplexNoise",
	"IcoPlanetVertex",
	"IcoPlanetFragment",
	"noise/Cellular3D",
	"noise/SNoise",
	"post/post-process",
	"ocean/Ocean",
	"noise/PrecomputeHash",
	"atmosphere/Eric_B.atmosphere",
	"atmosphere/Sean_O.atmosphere",
	"planet/TerrainTransform",
	"post/post-process-tools",
	"post/lens-flares",
]

const loadShader = name => Utils.loadFile(`${shaderDir}${name}.glsl`)

const unMapShaders = data => {
	const noise = data[6] + data[7] + data[3]
	const terrain_transform = data[2] + noise + data[13]

	BABYLON.Effect.IncludesShadersStore["Tools"] = data[2]
	BABYLON.Effect.IncludesShadersStore["Noise3D"] = noise
	BABYLON.Effect.IncludesShadersStore["Ocean"] = data[9]
	BABYLON.Effect.IncludesShadersStore["PostProcessTools"] = data[14]
	BABYLON.Effect.IncludesShadersStore["LensFlares"] = data[15]
	BABYLON.Effect.IncludesShadersStore["PrecomputedAtmosphericScattering"] = data[11]
	BABYLON.Effect.IncludesShadersStore["SeanONeilAtmosphericScattering"] = data[12]
	//BABYLON.Effect.IncludesShadersStore["PlanetFragment"] = data[13];
	BABYLON.Effect.ShadersStore["QuadTreeVertexShader"] = data[0]
	BABYLON.Effect.ShadersStore["/assets/textures/hashFragmentShader"] = data[10]
	BABYLON.Effect.ShadersStore["PostProcessFragmentShader"] = data[8]
	BABYLON.Effect.ShadersStore["IcoPlanetVertexShader"] = data[4]
	BABYLON.Effect.ShadersStore["QuadTreeFragmentShader"] = data[1]
	BABYLON.Effect.ShadersStore["IcoPlanetFragmentShader"] = data[5]

	console.log("All Shaders loaded")
	return terrain_transform
}



export const loadShaders = () => Promise.all(shaders.map(loadShader)).then(unMapShaders)
