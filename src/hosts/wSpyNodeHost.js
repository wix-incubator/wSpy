'use strict'
const initSpy = require('../wSpy')
const {defaultSettings, noopSpy} = require('./wSpyDefaultData')

function init({wSpyParam, settings}) {
	try {
		if (!wSpyParam) {
			return noopSpy
		}
		return initSpy.init({
			Error: global.Error,
			memoryUsage: () => process.memoryUsage().heapUsed,
			frame: global,
			wSpyParam,
			settings: Object.assign({}, defaultSettings, settings)
		})
	} catch (e) {
		return noopSpy
	}
}

module.exports = {
	init
}
