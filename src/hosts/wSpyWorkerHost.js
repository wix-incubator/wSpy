'use strict'
const initSpy = require('../wSpy')
const {defaultSettings, noopSpy} = require('./wSpyDefaultData')

function init({wSpyParam, settings}) {
	try {
		if (!wSpyParam) {
			return noopSpy
		}
		return initSpy.init({
			Error: typeof self !== 'undefined' ? self.Error : {},
			memoryUsage: () => 0,
			frame: typeof self !== 'undefined' ? self : {},
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
