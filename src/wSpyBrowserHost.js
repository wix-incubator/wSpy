'use strict'
const _ = require('lodash')
const initSpy = require('./wSpy')
const urlUtils = require('./urlUtils')

function getSpyParam() {
	const query = _.get(urlUtils.parseUrl(_.get(window.parent, 'location.href', '')), 'query')
	return query.wspy || query.wSpy
}

function isActive() {
	return !_.isNil(getSpyParam())
}

function hasWindowWithParent() {
	return typeof window !== 'undefined' && _.get(window, 'parent')
}

function firstSpyLoaded() {
	try {
		return typeof window !== 'undefined' && _.get(window, 'parent.wSpy')
	} catch (e) {
		return false
	}
}

const wSpy = initSpy.init(hasWindowWithParent() ? {
	Error: window.Error,
	memoryUsage: () => window.performance.memory.usedJSHeapSize,
	frame: window,
	wSpyParam: getSpyParam()
} : {})
wSpy.isActive = isActive

const noopSpy = _.mapValues(wSpy, () => _.noop)

function moduleExports() {
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
		if (hasWindowWithParent() && isActive()) {
			window.parent.wSpy = wSpy
			wSpy.initStack = new Error().stack
			return wSpy
		}
		return noopSpy
	} catch (e) {
		return noopSpy
	}
}

module.exports = moduleExports()
