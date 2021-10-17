export const Utils = {}

// from by: https://www.shadertoy.com/view/WttXWX
Utils.TripleBias32 = function (x) {
	x ^= x >> 17
	x *= 0xed5ad4bb
	x ^= x >> 11
	x *= 0xac4c1b51
	x ^= x >> 15
	x *= 0x31848bab
	x ^= x >> 14
	return x
}
Utils.LowBias32 = function (x) {
	x ^= x >> 16
	x *= 0x7feb352d
	x ^= x >> 15
	x *= 0x846ca68b
	x ^= x >> 16
	return x
}

Utils.SplitDouble = function (value) {
	var hi = Float32Array.from([value])[0]
	var low = value - hi
	return [hi, low]
}

// From: https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript
Object.defineProperty(String.prototype, "hashCode", {
	value: function () {
		var hash = 0,
			i,
			chr
		for (i = 0; i < this.length; i++) {
			chr = this.charCodeAt(i)
			hash = (hash << 5) - hash + chr
			hash |= 0 // Convert to 32bit integer
		}
		return hash
	},
})

Utils.degrees_to_radians = function (degrees) {
	var pi = Math.PI
	return degrees * (pi / 180)
}

Utils.radians_to_degrees = function (radians) {
	var pi = Math.PI
	return radians * (180 / pi)
}

Utils.lerp = function (start, end, speed) {
	return start + (end - start) * speed
}

Utils.lerp3 = function (p1, p2, t) {
	var x = Utils.lerp(p1.x, p2.x, t)
	var y = Utils.lerp(p1.y, p2.y, t)
	var z = Utils.lerp(p1.z, p2.z, t)

	return new BABYLON.Vector3(x, y, z)
}

Utils.angleDifference = function (start, end) {
	return ((((start - end) % 360) + 540) % 360) - 180
}

Utils.lerpAngle = function (start, end, speed) {
	//var dd = angleDifference(start, end);
	//return start - Math.min(Math.abs(dd), speed) * Math.sign(dd);
	return start - Math.sin(angleDifference(start, end) * speed)
}

Utils.lengthdir_x = function (length, direction) {
	return Math.cos(degrees_to_radians(direction)) * length //x
}

Utils.lengthdir_y = function (length, direction) {
	return Math.sin(degrees_to_radians(direction)) * length //y
}

Utils.clamp = function (value, min, max) {
	return Math.max(Math.min(value, max), min)
}

Utils.saturate = function (x) {
	return Utils.clamp(x, 0.0, 1.0)
}

Utils.distanceToPoint = function (x1, y1, x2, y2) {
	return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2))
}

Utils.distanceToPoint3DV = function (p1, p2) {
	return Math.sqrt(Math.pow(p1._x - p2._x, 2) + Math.pow(p1._y - p2._y, 2) + Math.pow(p1._z - p2._z, 2))
}

Utils.distanceToPoint3D = function (x1, y1, z1, x2, y2, z2) {
	return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2) + Math.pow(z1 - z2, 2))
}

Utils.pointDirection = function (x1, y1, x2, y2) {
	return radians_to_degrees(Math.atan2(y2 - y1, x2 - x1)) % 360
}

Utils.randomRange = function (min, max) {
	return min + Math.random() * Math.abs(min - max)
}

Utils.alphaNumerics = function () {
	return "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890"
}

Utils.repeat = function (value, min, max) {
	if (value > max) {
		return min
	} else if (value < min) {
		return max
	} else {
		return value
	}
}

Utils.cloneArray = function (arr) {
	var newArray = []
	for (var i = 0; i < arr.length; i++) {
		newArray[i] = arr[i].slice()
	}
	return newArray
}

Utils.checkArrayFor = function (ind, array) {
	for (var i = 0; i < array.length; i++) {
		if (array[i] == ind) {
			return true
		}
	}
	return false
}

Utils.switchBase = function (n, base) {
	if (n < 0) {
		n = 0xffffffff + n + 1
	}
	return parseInt(n, 10).toString(base)
}

Utils.remap = function (x, inputMin, inputMax, min, max) {
	return ((x - inputMin) * (max - min)) / (inputMax - inputMin) + min
}

Utils.facePoint = function (rotatingObject, pointToRotateTo) {
	// a directional vector from one object to the other one
	var direction = pointToRotateTo.subtract(rotatingObject.position)

	var v1 = new BABYLON.Vector3(0, 0, 1)
	var v2 = direction

	// caluculate the angel for the new direction
	var angle = Math.acos(BABYLON.Vector3.Dot(v1, v2.normalize()))

	//console.log(angle);

	// decide it the angle has to be positive or negative
	if (direction.x < 0) angle = angle * -1

	// calculate both angles in degrees
	var angleDegrees = Math.round((angle * 180) / Math.PI)
	var playerRotationDegress = Math.round((rotatingObject.rotation.y * 180) / Math.PI)

	// calculate the delta
	var deltaDegrees = playerRotationDegress - angleDegrees

	// check what direction to turn to take the shotest turn
	if (deltaDegrees > 180) {
		deltaDegrees = deltaDegrees - 360
	} else if (deltaDegrees < -180) {
		deltaDegrees = deltaDegrees + 360
	}

	// rotate until the difference between the object angle and the target angle is no more than 3 degrees
	if (Math.abs(deltaDegrees) > 3) {
		var rotationSpeed = Math.round(Math.abs(deltaDegrees) / 8)

		if (deltaDegrees > 0) {
			rotatingObject.rotation.y -= (rotationSpeed * Math.PI) / 180
			if (rotatingObject.rotation.y < -Math.PI) {
				rotatingObject.rotation.y = Math.PI
			}
		}
		if (deltaDegrees < 0) {
			rotatingObject.rotation.y += (rotationSpeed * Math.PI) / 180
			if (rotatingObject.rotation.y > Math.PI) {
				rotatingObject.rotation.y = -Math.PI
			}
		}

		// return true since the rotation is in progress
		return true
	} else {
		// return false since no rotation needed to be done
		return false
	}
}

Utils.moveToTarget = function (objectToMove, pointToMoveTo) {
	var moveVector = pointToMoveTo.subtract(objectToMove.position)

	if (moveVector.length() > 0.2) {
		moveVector = moveVector.normalize()
		moveVector = moveVector.scale(0.2)
		objectToMove.moveWithCollisions(moveVector)
	} else {
		targetPoint = null
	}
}

/*
var tangent = CreateVector3D(quadraticBezierVectors.getPoints()[pos], quadraticBezierVectors.getPoints()[pos+1]);
var normal = normalVector(quadraticBezierVectors.getPoints()[pos], tangent );
var biNormal = CalcNormal(tangent, normal);
*/

// Calculate plane normal (pass in two vectors )
Utils.calcNormal = function (v1, v2) {
	var P = new BABYLON.Vector3(0, 0, 0)
	var Q = P.add(v1)
	var T = P.add(v2)

	var v1v2 = Q.subtract(P)
	var v2v3 = T.subtract(Q)
	var normal = BABYLON.Vector3.Cross(v1v2, v2v3)
	return normal
}

// Simple Create Vector Function
Utils.createVector3D = function (point1, point2) {
	return new BABYLON.Vector3(point2.x - point1.x, point2.y - point1.y, point2.z - point1.z)
}

// private function normalVector(v0, vt, va) :
// returns an arbitrary point in the plane defined by the point v0 and the vector vt orthogonal to this plane
// if va is passed, it returns the va projection on the plane orthogonal to vt at the point v0
//
// Stripped from Babylon Path3D - see: https://github.com/BabylonJS/Babylon.js/blob/master/src/Math/babylon.math.ts#L3691
//
Utils.normalVector = function (v0, vt, va) {
	var normal0 //: Vector3;
	var tgl = vt.length()

	if (tgl === 0.0) {
		tgl = 1.0
	}

	if (va === undefined || va === null) {
		var point
		if (!BABYLON.MathTools.WithinEpsilon(Math.abs(vt.y) / tgl, 1.0, BABYLON.Epsilon)) {
			// search for a point in the plane
			point = new BABYLON.Vector3(0.0, -1.0, 0.0)
		} else if (!BABYLON.MathTools.WithinEpsilon(Math.abs(vt.x) / tgl, 1.0, BABYLON.Epsilon)) {
			point = new BABYLON.Vector3(1.0, 0.0, 0.0)
		} else if (!BABYLON.MathTools.WithinEpsilon(Math.abs(vt.z) / tgl, 1.0, BABYLON.Epsilon)) {
			point = new BABYLON.Vector3(0.0, 0.0, 1.0)
		}
		normal0 = BABYLON.Vector3.Cross(vt, point)
	} else {
		normal0 = BABYLON.Vector3.Cross(vt, va)
		BABYLON.Vector3.CrossToRef(normal0, vt, normal0)
	}
	normal0.normalize()
	return normal0
}

Utils.calculatePointOnSphere = function (p, face, babylon = false) {
	face = Utils.Vector3([face._x, face._y, face._z])
	var axisA = Utils.Vector3([face._y, face._z, face._x])
	var axisB = Utils.Cross(face, axisA)

	var ly = Utils.Multiply33(axisB, Utils.Vector3([p._y * 2]))
	var lx = Utils.Multiply33(axisA, Utils.Vector3([p._x * 2]))
	var pointOnCube = Utils.Add33([face, lx, ly])
	var pointOnSphere = Utils.Normalize(pointOnCube)

	if (babylon == true) {
		return new BABYLON.Vector3(pointOnSphere._z, pointOnSphere._y, pointOnSphere._x)
	}
	return Utils.Vector3([pointOnSphere._z, pointOnSphere._y, pointOnSphere._x])
}

Utils.sphereNormal = function (p) {
	return BABYLON.Vector3.Normalize(p.multiply(new BABYLON.Vector3(2, 2, 2)))
}

///////////////////////////////////
/// CUSTOM VECTOR FUNCTIONS
///////////////////////////////////

Utils.Vector3 = function (arr) {
	if (arr.length == 1) {
		return { _x: arr[0], _y: arr[0], _z: arr[0] }
	}
	return { _x: arr[0], _y: arr[1], _z: arr[2] }
}

Utils.VecToArray = function (vec) {
	return [vec._x, vec._y, vec._z]
}

Utils.Dot = function (p1, p2) {
	return p1._x * p2._x + p1._y * p2._y + p1._z * p2._z
}

Utils.Magnitude = function (p) {
	return Math.sqrt(p._x * p._x + p._y * p._y + p._z * p._z)
}

Utils.Normalize = function (p) {
	let mag = Utils.Magnitude(p)
	return Utils.Divide31(p, mag)
}

Utils.Add33 = function (arr) {
	let r = { _x: 0, _y: 0, _z: 0 }
	for (var i = 0; i < arr.length; i++) {
		r._x += arr[i]._x
		r._y += arr[i]._y
		r._z += arr[i]._z
	}
	return r
}

Utils.Add33V = function (p1, p2) {
	return { _x: p1._x + p2._x, _y: p1._y + p2._y, _z: p1._z + p2._z }
}

Utils.Add31 = function (p, a) {
	return { _x: p._x + a, _y: p._y + a, _z: p._z + a }
}

Utils.Subtract33 = function (p1, p2) {
	return { _x: p1._x - p2._x, _y: p1._y - p2._y, _z: p1._z - p2._z }
}

Utils.Multiply33 = function (p1, p2) {
	return { _x: p1._x * p2._x, _y: p1._y * p2._y, _z: p1._z * p2._z }
}

Utils.Multiply31 = function (p, m) {
	return { _x: p._x * m, _y: p._y * m, _z: p._z * m }
}

Utils.Divide31 = function (p, d) {
	return { _x: p._x / d, _y: p._y / d, _z: p._z / d }
}

Utils.Cross = function (left, right) {
	const x = left._y * right._z - left._z * right._y
	const y = left._z * right._x - left._x * right._z
	const z = left._x * right._y - left._y * right._x
	return { _x: x, _y: y, _z: z }
}

Utils.M33xV3 = function (mat, vec, arr = false) {
	res = [0, 0, 0]
	vec = arr == true ? vec : Utils.VecToArray(vec)
	for (let i = 0; i < 3; i++) {
		for (let j = 0; j < 3; j++) {
			res[i] += mat[i][j] * vec[i]
		}
	}
	return Utils.Vector3(res)
}

Utils.cubeDirections = [
	/* Up */ Utils.Vector3([0, 1, 0]),
	/* Down */ Utils.Vector3([0, -1, 0]),
	/* Right */ Utils.Vector3([1, 0, 0]),
	/* Left */ Utils.Vector3([-1, 0, 0]),
	/* Forward */ Utils.Vector3([0, 0, 1]),
	/* Back */ Utils.Vector3([0, 0, -1]),
]

Utils.sphericalToVector = function (rho, theta, phi, degrees = false) {
	if (degrees == true) {
		theta = Utils.degrees_to_radians(theta)
		phi = Utils.degrees_to_radians(phi)
	}

	return new BABYLON.Vector3(
		Math.cos(phi) * Math.sin(theta),
		Math.sin(phi) * Math.sin(theta),
		Math.cos(theta),
	).multiply(new BABYLON.Vector3().setAll(rho))
}

Utils.vectorToSpherical = function (v, degrees = false) {
	let theta = Math.acos(Utils.clamp(v._z, -1, 1))
	let phi = Math.atan2(v._y, v._x)
	phi = phi < 0 ? phi + 2 * Math.PI : phi

	if (degrees == false) {
		return { theta: theta, phi: phi }
	} else {
		return { theta: Utils.radians_to_degrees(theta), phi: Utils.radians_to_degrees(phi) }
	}
}

Utils.clearAllTimeoutsAndIntervals = function () {
	var id = Math.max(
		setTimeout(function () {}, 0),
		setInterval(function () {}, 0),
	)

	var i = 0
	while (id--) {
		clearTimeout(id)
		clearInterval(id)
		i++
	}
	console.log(i + " timeout(s) and interval(s) cleared")
}

Utils.toPlanetUp = function (upVec, position, observer, planet) {
	return Utils.lerp3(
		upVec,
		Utils.sphereNormal(observer),
		1 -
			Utils.clamp(
				Utils.remap(
					Utils.distanceToPoint3DV(planet.position, position),
					planet.radius,
					planet.radius * 3,
					0,
					1,
				),
				0,
				1,
			),
	)
}

Utils.loadFile = function (url) {
	return fetch(url).then(response => {
		if (!response.ok) {
			throw new Error("HTTP error " + response.status) // Rejects the promise
		} else {
			return response.text()
		}
	})
}

//////////////////////////////////////////////////////////////////////
/// Copyright (c) 2018 Eric Bruneton
/// * All rights reserved.
/// * from: demo.js
////////////////////////////////////////////////////////////////////
Utils.loadTextureData = function (textureName, callback) {
	const xhr = new XMLHttpRequest()
	xhr.open("GET", textureName)
	xhr.responseType = "arraybuffer"
	xhr.onload = event => {
		const data = new DataView(xhr.response)
		const array = new Float32Array(data.byteLength / Float32Array.BYTES_PER_ELEMENT)
		for (var i = 0; i < array.length; ++i) {
			array[i] = data.getFloat32(i * Float32Array.BYTES_PER_ELEMENT, true)
		}
		callback(array)
	}
	xhr.send()
}
//////////////////////////////////////////////////////////////

Utils.getTextureData = function (texture) {
	return {
		data: new Uint8ClampedArray(texture.readPixels()),
		width: texture.getSize().width,
		height: texture.getSize().height,
	}
}

Utils.sampleTexture = function (texture, x, y) {
	x = Utils.repeat(x, 0.0, 1.0)
	y = Utils.repeat(y, 0.0, 1.0)
	x = Math.floor(texture.width * x)
	y = Math.floor(texture.height * y)

	let idx = (y * texture.width + x) * 4
	let r = texture.data[idx] / 255
	let g = texture.data[idx + 1] / 255
	let b = texture.data[idx + 2] / 255
	let a = texture.data[idx + 3] / 255
	return [r, g, b, a]
}

Utils.downloadImagesAsync = function (urls) {
	return new Promise(function (resolve, reject) {
		var pending = urls.length
		var result = []
		if (pending === 0) {
			resolve([])
			return
		}
		urls.forEach(function (url, i) {
			var image = new Image()
			//image.addEventListener("load", function() {
			image.onload = function () {
				var tempcanvas = document.createElement("canvas")
				var tempcontext = tempcanvas.getContext("2d")
				tempcanvas.width = map.width
				tempcanvas.height = map.height
				tempcontext.drawImage(image, 0, 0, map.width, map.height)
				result[i] = tempcontext.getImageData(0, 0, map.width, map.height).data
				pending--
				if (pending === 0) {
					resolve(result)
				}
			}
			image.src = url
		})
	})
}

Utils.planeDotCoordinate = function (plane, point) {
	return plane.normal._x * point._x + plane.normal._y * point._y + plane.normal._z * point._z + plane.d
}
