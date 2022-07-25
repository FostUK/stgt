# DEV PLAN


* Ship handling
  * Add in atmospheric drag to slow you down closer to ground level
  * Add in atmospheric banking
  * Prevent crashing through ground.
* Flatten to base zero and push to cloud.
* Fix gui overlay
* Work out control scheme.
  * Don't lock mouse. Use pad only for now
* Fix triplanar mapping of planet texture
* Fix planet shading
* Create / Add cockpit model
* Babylonjs - can we use lws default extension to allow es6 module loads? 
* Load Ship (convert loader to Promise.all format)
* Implement better controls using gamepad.
* bounce positions off server
* Fix triplanar mapping

## BUGS
* Triplanar mapping shimmer
* planet-material.js loading hash config ( delete /Hash/config.json)
