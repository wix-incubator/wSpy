'use strict'
const initSpy = require('../wSpy')

const defaultSettings = {
	moreLogs: '',
	includeLogs: '',
	extraIgnoredEvents: [],
	MAX_LOG_SIZE: 10000,
	DEFAULT_LOGS_COUNT: 300,
	GROUP_MIN_LEN: 5,
	stackFilter: /wSpy/i
}

function getSpyParam(url) {
	if (typeof URL !== 'undefined') {
		const urlObj = new URL(url)
		return urlObj.searchParams.get('wspy') || urlObj.searchParams.get('wSpy')
	}
}

function hasWindowWithParent() {
	return typeof window !== 'undefined' && typeof window.parent !== 'undefined'
}

function firstSpyLoaded() {
	try {
		return hasWindowWithParent() && typeof window.parent.wSpy !== 'undefined' && window.parent.wSpy
	} catch (e) {
		return false
	}
}

function init({wSpyOverrideParam, settings}) {
	const shouldSpy = hasWindowWithParent()
	const wSpyParam = shouldSpy ? wSpyOverrideParam || getSpyParam(window.parent.location.href) : null
	const wSpy = initSpy.init(shouldSpy ? {
		Error: window.Error,
		memoryUsage: () => window.performance.memory.usedJSHeapSize,
		frame: window,
		wSpyParam,
		settings: Object.assign({}, defaultSettings, settings)
	} : {})

	const noopSpy = {}
	Object.keys(wSpy).forEach(key => noopSpy[key] = () => {})

	if (!wSpyParam) {
		return noopSpy
	}

	try {
		const quickestSpy = firstSpyLoaded()
		if (quickestSpy) {
			wSpy.initStack = new Error().stack
			wSpy.logs = quickestSpy.logs || wSpy.logs
			if ((quickestSpy.ver || 0) < wSpy.ver || 0) {
				// newer version hijacks quickest
				quickestSpy.logs = wSpy.logs // to be moved after all spies have 'logs' property
				wSpy.otherSpies = [quickestSpy, ...quickestSpy.otherSpies || []]
				window.parent.wSpy = wSpy
			} else {
				quickestSpy.otherSpies.push(wSpy)
			}
			return wSpy
		}
		if (shouldSpy) {
			window.parent.wSpy = wSpy
			wSpy.initStack = new Error().stack
			return wSpy
		}
		return noopSpy
	} catch (e) {
		return noopSpy
	}
}

module.exports = {
	init
}
