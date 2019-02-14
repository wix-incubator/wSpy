const _path = require('path')

const entry = _path.resolve(__dirname, 'dist/index.js')
const path = _path.resolve(__dirname, 'dist/package')

module.exports = [{
	mode: 'development',
	entry,
	output: {
		path,
		filename: 'wspy-all-debug.js'
	}
},
{
	entry,
	output: {
		path,
		filename: 'wspy-all.js'
	}
}]


