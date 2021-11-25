import { parseHusky } from "./husky.js"

export const models = scene => [
	//BABYLON.SceneLoader.AppendAsync("./assets/ah64/", "ah64.gltf", scene).then(parseAH64Model)
	BABYLON.SceneLoader.AppendAsync("./assets/vehicles/husky/", "husky.glb", scene).then(parseHusky)
]
