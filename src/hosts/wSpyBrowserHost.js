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

function getFirstLoadedSpy() {
	try {
		return hasWindowWithParent() && typeof window.parent.wSpy !== 'undefined' && window.parent.wSpy
	} catch (e) {
		return null
	}
}

function noop() {}

const noopSpy = {
	init: noop,
	shouldLog: noop,
	log: noop,
	getCallbackName: noop,
	search: noop,
	logCallBackRegistration: noop,
	logCallBackExecution: noop,
	spyMobx: noop,
	enabled: noop,
	isActive: noop
}

function getUsedMemory(performance) {
	return performance && performance.memory && performance.memory.usedJSHeapSize
}

function init({wSpyOverrideParam, settings}) {
	try {
		const shouldSpy = hasWindowWithParent()
		const wSpyParam = wSpyOverrideParam || getSpyParam(window.parent.location.href)
		if (!wSpyParam || !shouldSpy) {
			return noopSpy
		}
		const wSpy = initSpy.init({
			Error: window.Error,
			memoryUsage: () => getUsedMemory(window.performance) || 0,
			frame: window,
			wSpyParam,
			settings: Object.assign({}, defaultSettings, settings)
		})

		const quickestSpy = getFirstLoadedSpy()
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
