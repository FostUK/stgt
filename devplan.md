# DEV PLAN

* Admin
  * Update Readme
* Controls / Flight Model
  * Add Altimeter
  * Add in atmospheric drag to slow you down closer to ground level
  * Add in atmospheric banking
  * Prevent crashing through ground.
  * Don't lock mouse. Use pad only for now
* Rendering
  * Fix planet shading
  * Fix triplanar mapping of planet texture
* Create / Add cockpit model
* Babylonjs - can we use lws default extension to allow es6 module loads? 
* Load Ship (convert loader to Promise.all format)
* Networking
  * Bounce positions off server


## BUGS
* Triplanar mapping shimmer
* planet-material.js loading hash config ( delete /Hash/config.json)
