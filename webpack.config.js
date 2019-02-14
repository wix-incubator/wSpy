const path = require('path')

module.exports = [{
	mode: 'development',
	entry: path.resolve(__dirname, 'dist/index.js'),
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: 'wspy-all-debug.js'
	}
},
{
	entry: path.resolve(__dirname, 'dist/index.js'),
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: 'wspy-all.js'
	}
}]


