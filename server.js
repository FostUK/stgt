const finalhandler = require("finalhandler")
const http = require("http")
const serveStatic = require("serve-static")

const port = 8000

//Needed to enable shared array buffers
const setHeaders = (res, path) => {
	res.setHeader("Cross-Origin-Opener-Policy", "same-origin")
	res.setHeader("Cross-Origin-Embedder-Policy", "require-corp")
}

const static = serveStatic(__dirname, { setHeaders })
const serve = (req, res) => static(req, res, finalhandler(req, res))

http.createServer(serve).listen(port)

console.log(`Server started on http://127.0.0.1:${port}`)
