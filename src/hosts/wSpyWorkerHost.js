'use strict'
const initSpy = require('../wSpy')
const {defaultSettings, noopSpy} = require('./wSpyDefaultData')

function init({wSpyOverrideParam, settings}) {
	try {
		if (!wSpyOverrideParam) {
			return noopSpy
		}
		return initSpy.init({
			Error: typeof self !== 'undefined' ? self.Error : {},
			memoryUsage: () => 0,
			frame: typeof self !== 'undefined' ? self : {},
			wSpyParam: wSpyOverrideParam,
			settings: Object.assign({}, defaultSettings, settings)
		})
	} catch (e) {
		return noopSpy
	}
}

module.exports = {
	init
}
