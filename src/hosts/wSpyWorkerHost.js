'use strict'
const initSpy = require('../wSpy')
const {defaultSettings, noopSpy} = require('./wSpyDefaultData')

function init({wSpyOverrideParam, settings}) {
	try {
		if (!wSpyOverrideParam) {
			return noopSpy
		}
		const wSpy = initSpy.init({
			Error,
			memoryUsage: () =>  0,
			frame: self,
			wSpyParam: wSpyOverrideParam,
			settings: Object.assign({}, defaultSettings, settings)
		})

		self.wSpy = wSpy
		return wSpy
	} catch (e) {
		return noopSpy
	}
}

module.exports = {
	init
}
