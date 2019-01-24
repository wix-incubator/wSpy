const TerserPlugin = require('terser-webpack-plugin')
const path = require('path')

module.exports = {
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: [
					/node_modules/,
					/\.unit\.js$/
				],
				use: ['babel-loader']
			}
		]
	},
	node: {
		fs: 'empty',
		dns: 'empty'
	},
	target: 'node',
	entry: [
		'./src/index.js'
	],
	output: {
		path: path.join(__dirname, 'dist'),
		filename: 'wSpy.min.js'
	},
	optimization: {
		minimizer: [
			new TerserPlugin({
				parallel: true,
				terserOptions: {
					ecma: 6
				}
			})
		]
	}
}