# DEV PLAN

* Gameplay
  * Basic collision (need to avoid negative altitude to start with)

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
  * Update to webgpu
    * setupCompGLProgram in loader.js will need gutting as uses gl specific calls
  * Fix atmosphere rendering
* Create / Add cockpit model
* Babylonjs - can we use lws default extension to allow es6 module loads? 
* Load Ship (convert loader to Promise.all format)
* Networking
  * Bounce positions off server

## BUGS
* Shading shimmer. Possibly due to attempted normal gen in vertex shader
