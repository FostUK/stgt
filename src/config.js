export const config = {
	mouse: {
		sensitivity: 0.005,
		cameraSpeed: 0.0075,
		min: -75,
		max: 90,
		x: 0, //TODO mutable values should not be stored here
		y: 0,
	},
	planet: {
		name: "Earth",
		position: new BABYLON.Vector3(0, 0, 0), //TODO v3 should be applied elsewhere
		radius: 1000, //100000//6371000
		maxHeight: 0.01,
	},
}
