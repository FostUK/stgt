//TODO this colour is always white - post shader is overwriting it

export const createStar = (title, scene) => {
	const mesh = BABYLON.MeshBuilder.CreateDisc(
		title,
		{ radius: 1000, arc: 1, tessellation: 64, sideOrientation: BABYLON.Mesh.DEFAULTSIDE },
		scene,
	)


	//mesh.infiniteDistance = true
	mesh.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL

	const starMat = new BABYLON.StandardMaterial("star", scene)
	mesh.material = starMat
	starMat.emissiveColor = BABYLON.Color3.Red()

	starMat.disableLighting = true



	const ll = new BABYLON.PointLight("sunLight", mesh.position, scene)
	ll.parent = mesh

	return mesh
}
