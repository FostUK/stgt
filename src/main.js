import { Planet } from "./planet/planet.js"
import { Utils } from "./utils.js"
import { postProcess } from "./post-process.js"
import {loadResources} from "./loader.js"
;(window.oldWorkers || []).forEach(w => w.terminate())
Utils.clearAllTimeoutsAndIntervals()

const RENDER_WIDTH = 0 //1920;
const RENDER_HEIGHT = 0 //1080;

var main = {
	engine: new BABYLON.Engine(canvas, false, {
		// useHighPrecisionMatrix: true,
		// useHighPrecisionFloats: true
	}),
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

	//game.camera = new BABYLON.ArcRotateCamera("camera", BABYLON.Tools.ToRadians(90), BABYLON.Tools.ToRadians(65), 30, BABYLON.Vector3.Zero(), game.scene);
	main.camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(0, 0, 0), main.scene)
	main.camera.attachControl(canvas, true)

	// game.camera = new BABYLON.UniversalCamera("camera", new BABYLON.Vector3.Zero(), game.scene);
	// game.camera.inputs.clear();

	//game.scene.render();

	main.camera.minZ = 0.01
	main.camera.maxZ = 7000000

	planet = new Planet(
		{
			name: "Earth",
			position: new BABYLON.Vector3(0, 0, 0),
			radius: 1000, //100000//6371000
		},
		main.scene,
	)

	light = new BABYLON.DirectionalLight(
		"dirLight",
		BABYLON.Vector3.Normalize(new BABYLON.Vector3(0, -0.1, -1.0)),
		main.scene,
	)
	light.intensity = 0.7

	//sun properties
	sun = BABYLON.MeshBuilder.CreateDisc(
		"sun",
		{ radius: planet.radius / 4.0, arc: 1, tessellation: 64, sideOrientation: BABYLON.Mesh.DEFAULTSIDE },
		main.scene,
	)
	sun.infiniteDistance = true
	sun.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL
	var sunMat = new BABYLON.StandardMaterial("sun", main.scene)
	sunMat.emissiveColor = new BABYLON.Color3(100, 100, 100)
	sunMat.disableLighting = true
	sun.material = sunMat

	let ll = new BABYLON.PointLight("sunLight", sun.position, main.scene)
	ll.parent = sun

	box = BABYLON.MeshBuilder.CreateBox("box", { size: 1 }, main.scene)
	box.position = new BABYLON.Vector3(0, 0, 7)
	observer = new BABYLON.Vector3(0, 0, 0)

	//planet.parent = game.universeNode;

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

	//cameraInfo.innerHTML = "pos: "+(game.camera.position)+"\ndir: "+(game.camera.getDirection(new BABYLON.Vector3.Up()));

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

var mouseSensitivity = 0.005
var cameraSpeed = 0.0075
var mouseMin = -75,
	mouseMax = 90

var mouseX = 0,
	mouseY = 0

function updateCamera() {
	mouseX += main.mouseDX * mouseSensitivity * main.delta
	mouseY += main.mouseDY * mouseSensitivity * main.delta
	mouseY = Utils.clamp(mouseY, mouseMin, mouseMax)

	main.camera.rotation = Utils.lerp3(
		main.camera.rotation,
		new BABYLON.Vector3(BABYLON.Tools.ToRadians(mouseY), BABYLON.Tools.ToRadians(mouseX), 0),
		cameraSpeed * main.delta,
	)
}

main.canvas = document.getElementById("canvas")
main.engine.setSize(
	RENDER_WIDTH > 0 ? RENDER_WIDTH : window.innerWidth,
	RENDER_HEIGHT > 0 ? RENDER_HEIGHT : window.innerHeight,
)

main.scene = new BABYLON.Scene(main.engine)
main.scene.clearColor = new BABYLON.Color3.Black()

loadResources(function () {
	preload()
	create()
	postProcess(main, planet, light)

	setupPointerLock()
	// game.scene.detachControl();

	main.scene.registerBeforeRender(function () {
		step()
		main.mouseDX = 0
		main.mouseDY = 0
	})

	main.scene.registerAfterRender(function () {
		// postStep();
	})

	main.engine.runRenderLoop(function () {
		main.scene.render()
	})
}, main.scene)

// the canvas/window resize event handler
window.addEventListener("resize", function () {
	main.engine.setSize(
		RENDER_WIDTH > 0 ? RENDER_WIDTH : window.innerWidth,
		RENDER_HEIGHT > 0 ? RENDER_HEIGHT : window.innerHeight,
	)
})

//mouse lock
// Configure all the pointer lock stuff
function setupPointerLock() {
	// register the callback when a pointerlock event occurs
	document.addEventListener("pointerlockchange", changeCallback, false)
	document.addEventListener("mozpointerlockchange", changeCallback, false)
	document.addEventListener("webkitpointerlockchange", changeCallback, false)

	// when element is clicked, we're going to request a
	// pointerlock
	canvas.onclick = function () {
		canvas.requestPointerLock =
			canvas.requestPointerLock || canvas.mozRequestPointerLock || canvas.webkitRequestPointerLock

		// Ask the browser to lock the pointer)
		canvas.requestPointerLock()
	}
}

var mouseMove = function (e) {
	var movementX = e.movementX || e.mozMovementX || e.webkitMovementX || 0

	var movementY = e.movementY || e.mozMovementY || e.webkitMovementY || 0

	main.mouseDX = movementX
	main.mouseDY = movementY

	//updateCamera();
}

// called when the pointer lock has changed. Here we check whether the
// pointerlock was initiated on the element we want.
function changeCallback(e) {
	if (
		document.pointerLockElement === canvas ||
		document.mozPointerLockElement === canvas ||
		document.webkitPointerLockElement === canvas
	) {
		// we've got a pointerlock for our element, add a mouselistener
		document.addEventListener("mousemove", mouseMove, false)
	} else {
		// pointer lock is no longer active, remove the callback
		document.removeEventListener("mousemove", mouseMove, false)
	}
}
