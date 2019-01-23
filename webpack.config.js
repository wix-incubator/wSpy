const path   = require('path')
const global = {
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: ['babel-loader']
			}
		]
	},
	node: {
		fs: 'empty',
		dns: 'empty'
	},
	target: 'node'
}

module.exports = [
	Object.assign({}, global, {
		entry: [
			'./src/index.js'
		],
		output: {
			path: path.join(__dirname, 'dist'),
			filename: 'wSpy.min.js'
		}
	})
]