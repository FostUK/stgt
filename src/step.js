const divFps = document.getElementById("fps")
const timeSpeed = 0.01

export const getStep = main => () => {

	main.time += timeSpeed
	main.delta = main.engine.getDeltaTime()
	divFps.innerHTML = "|  " + main.engine.getFps().toFixed() + " fps  |"
	// transform.rotation.y = (transform.rotation.y + 0.0015) % (Math.PI*2);
	// transform.rotation.x = (transform.rotation.x + 0.0015) % (Math.PI*2);

	main.light.setDirectionToTarget(main.transform2.getAbsolutePosition())
	main.sun.position = main.light.direction.multiply(new BABYLON.Vector3().setAll(-main.planet.radius * 50))

	//updateCamera();
	//updateUniverseNode();

	// observer = UTILS.sphericalToVector(planet.radius, theta, phi, true);
	// planet.position = observer.multiply(new BABYLON.Vector3(-1,-1,-1));
	//
	// theta = (theta + 1/planet.radius) % 360;
	// phi = (phi + 1/planet.radius) % 360;

	// game.camera.upVector = UTILS.lerp3(
	// 	game.camera.upVector, UTILS.sphereNormal(new BABYLON.Vector3(0,0,0).subtract(planet.getAbsolutePosition())),
	// 	1-UTILS.clamp(UTILS.remap(
	// 		UTILS.distanceToPoint3DV(planet.getAbsolutePosition(), new BABYLON.Vector3(0,0,0)),
	// 		planet.radius*1.5, planet.radius*3, 0, 1
	// 	), 0, 1)
	// );

	// box.alignWithNormal(UTILS.toPlanetUp(box.up, box.getAbsolutePosition(), observer, planet));
	// game.camera.upVector = box.up;

	//planet.setPosition(game.universeNode.position);
	main.planet.setObserver(main.scene.activeCamera.globalPosition)
	main.planet.setLightDirection(main.light.direction.multiply(new BABYLON.Vector3(-1, -1, -1)))
	main.planet.updatePlanet()
}
