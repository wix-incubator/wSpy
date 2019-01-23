const TerserPlugin = require('terser-webpack-plugin')
const path = require('path')

// config.module.rules.push({
// 	test: /\.js$/,
// 	loader: 'babel-loader',
// 	exclude: function(modulePath) {
// 		return /node_modules/.test(modulePath) &&
//             !/node_modules\/vue-particles/.test(modulePath)
// 	},
// 	options: Object.assign({}, this.babelOptions)
// })

module.exports = {
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