module.exports = require('pico-conf').env().argv()
	.file(`./${process.env.NODE_ENV}.js`)
	.defaults('./default.js');