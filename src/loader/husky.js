export const parseHusky = husky => {
	const body = husky.getMeshByName("Husky")
	//const rotor = husky.getMeshByName("rotor")
	//const root = husky.getMeshByName("__root__")

	//body.rotationQuaternion = null
	//root.rotationQuaternion = null

	//root.rotation.y = Math.PI

	return {
		body,
		//rotor,
		//root,
	}
}
