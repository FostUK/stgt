import { boot } from './boot.js'
import { Planet } from "./planet/planet.js"
import { Utils } from "./utils.js"
import { postProcess } from "./post-process.js"
import {loadResources} from "./loader.js"
import { setupPointerLock } from "./controls/mouse.js"
;(window.oldWorkers || []).forEach(w => w.terminate())
Utils.clearAllTimeoutsAndIntervals()

const { scene, engine, canvas } = boot()

var main = {
	engine,
	canvas,
	scene,
	delta: 0,
	objects: {},
	mouseDX: 0,
	mouseDY: 0,
}

function preload() {
	//console.log(window.navigator.hardwareConcurrency);
	main.dsm = new BABYLON.DeviceSourceManager(main.engine)
}

var box, observer
var planet
var light
var sun

function create() {
	main.time = 0.0
	main.universeNode = new BABYLON.TransformNode()
	main.camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(0, 0, 0), scene)
	main.camera.attachControl(canvas, true)

	main.camera.minZ = 0.01
	main.camera.maxZ = 7000000

	planet = new Planet(
		{
			name: "Earth",
			position: new BABYLON.Vector3(0, 0, 0),
			radius: 1000, //100000//6371000
		},
		scene,
	)

	light = new BABYLON.DirectionalLight(
		"dirLight",
		BABYLON.Vector3.Normalize(new BABYLON.Vector3(0, -0.1, -1.0)),
		scene,
	)
	light.intensity = 0.7

	sun = BABYLON.MeshBuilder.CreateDisc(
		"sun",
		{ radius: planet.radius * 4 / 4.0, arc: 1, tessellation: 64, sideOrientation: BABYLON.Mesh.DEFAULTSIDE },
		scene,
	)
	sun.infiniteDistance = true
	sun.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL
	const sunMat = new BABYLON.StandardMaterial("sun", main.scene)
	sunMat.emissiveColor = new BABYLON.Color3(100, 100, 95)
	sunMat.disableLighting = true
	sun.material = sunMat

	let ll = new BABYLON.PointLight("sunLight", sun.position, main.scene)
	ll.parent = sun

	box = BABYLON.MeshBuilder.CreateBox("box", { size: 1 }, main.scene)
	box.position = new BABYLON.Vector3(0, 0, 7)
	observer = new BABYLON.Vector3(0, 0, 0)

	document.getElementById("wireframe").onclick = function () {
		planet.material.wireframe = !planet.material.wireframe
	}

	// observer = UTILS.sphericalToVector(planet.radius, theta, phi, true);
	// planet.position = observer.multiply(new BABYLON.Vector3(-1,-1,-1));

	main.camera.position = Utils.sphericalToVector(planet.radius * 1.001, theta, phi, true) //1.051
	box.position = main.camera.position.clone()

	planet.setObserver(new BABYLON.Vector3(0, 0, 0))

	transform = new BABYLON.TransformNode("p")
	transform2 = new BABYLON.TransformNode("hh")

	transform2.parent = transform
	transform2.position.z = -planet.radius * 10.0
	transform2.position.y = -planet.radius

	transform.rotation.y += 0.16
}

let divFps = document.getElementById("fps")
let cameraInfo = document.getElementById("cameraInfo")
var startRecording = false
var keyboard = null
const timeSpeed = 0.01
var phi = 90,
	theta = 90

var transform
var transform2
function step() {
	main.time += timeSpeed
	main.delta = main.engine.getDeltaTime()
	divFps.innerHTML = "|  " + main.engine.getFps().toFixed() + " fps  |"
	// transform.rotation.y = (transform.rotation.y + 0.0015) % (Math.PI*2);
	// transform.rotation.x = (transform.rotation.x + 0.0015) % (Math.PI*2);

	light.setDirectionToTarget(transform2.getAbsolutePosition())
	sun.position = light.direction.multiply(new BABYLON.Vector3().setAll(-planet.radius * 50))

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
	planet.setObserver(main.scene.activeCamera.globalPosition)
	planet.setLightDirection(light.direction.multiply(new BABYLON.Vector3(-1, -1, -1)))
	planet.updatePlanet()
}

function updateUniverseNode() {
	main.universeNode.position = main.universeNode.position.subtract(main.camera.position)
	main.camera.position = new BABYLON.Vector3(0, 0, 0)
}


loadResources(() => {
	preload()
	create()
	postProcess(main, planet, light)

	setupPointerLock(main)
	// game.scene.detachControl();

	scene.registerBeforeRender(function () {
		step()
		main.mouseDX = 0
		main.mouseDY = 0
	})

	scene.registerAfterRender(function () {
		// postStep();
	})

	engine.runRenderLoop(function () {
		main.scene.render()
	})
}, scene, canvas)
