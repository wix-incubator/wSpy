'use strict'
const _ = require('lodash')
const initSpy = require('../src/wSpy')

const nodeHost = {
    Error,
    memoryUsage: () => process.memoryUsage().heapUsed,
    frame: global
}

const settings = {
	moreLogs: 'mobx,createDisplayedPage,livepreview,ds_GETTER',
	includeLogs: 'setHook,registerAction,runAction,worker,applyHook,ds_ACTION,ds_DATA_MANIPULATION_ACTION,dispatch',
	extraIgnoredEvents: [
		'wixCode.fileSystem.getRoots',
		'wixCode.log.trace',
		'bi.event',
		'platform.reportAPICallBI'
	],
	MAX_LOG_SIZE: 10000,
	DEFAULT_LOGS_COUNT: 300,
	GROUP_MIN_LEN: 5,
	stackFilter: /publicMethodUtils|bundle.js|ActionQueue.js|require.min.js|main-r.min.js|observableDataUtil.js|lodash|mobxDataHandlers.js|react-dom|createEditorStore.js|coreUtils.js|create-react-class.js|redux-libs.js|throttledStore.js|raven.min.js|Object.store.dispatch|react.development/i
}

const wSpySystemProps = ['index', 'time', '_time', 'mem', 'source']

describe('wSpy', () => {
	function someFunc() {}
	function getSpyWithOptions(overrideParam, overrideSettings) {
		return initSpy.init({
			...nodeHost,
			wSpyParam: overrideParam,
			settings: Object.assign({}, overrideSettings, settings)
		})
	}
	describe('log', () => {
		it('should not log when logName isn\'t on defaults', () => {
			const wSpy = getSpyWithOptions()

			wSpy.log('operation', [], [])

			expect(wSpy.logs).toEqual({})
		})

		it('should not log when record isn\'t array', () => {
			const wSpy = getSpyWithOptions()

			wSpy.log('setHook', {}, [])

			expect(wSpy.logs).toEqual({})
		})

		it('should log when record is array, logName is one of defaults and not ignored', () => {
			const wSpy = getSpyWithOptions()

			wSpy.log('setHook', [], [])

			expect(wSpy.logs.setHook.length).toBe(1)
		})

		it('should add new log with param', () => {
			const wSpy = getSpyWithOptions('mobx')

			wSpy.log('mobx', [], [])

			expect(wSpy.logs.mobx.length).not.toBe(0)
		})

		it('should add new logs also when multiple extra params', () => {
			const wSpy = getSpyWithOptions('mobx,ds_GETTER')

			wSpy.log('mobx', [], [])

			expect(wSpy.logs.mobx.length).not.toBe(0)

			wSpy.log('ds_GETTER', [], [])

			expect(wSpy.logs.ds_GETTER.length).not.toBe(0)
		})

		it('should not log when disabling a logName', () => {
			const wSpy = getSpyWithOptions('-ds_ACTION')

			wSpy.log('ds_ACTION', [], [])

			expect(wSpy.logs.ds_ACTION).toBeUndefined()
		})

		it('should not log when disabling multiple logNames', () => {
			const wSpy = getSpyWithOptions('-setHook,-ds_ACTION')

			wSpy.log('ds_ACTION', [], [])

			expect(wSpy.logs.ds_ACTION).toBeUndefined()

			wSpy.log('setHook', [], [])

			expect(wSpy.logs.setHook).toBeUndefined()
		})
	})

	describe('logCallBackRegistration', () => {
		it('should log callback registration with correct name', () => {
			const wSpy = getSpyWithOptions()

			wSpy.logCallBackRegistration(someFunc, 'registerAction', [someFunc.name || someFunc], 'wSpyTest')

			expect(wSpy.logs['registerAction'].length).toBe(1)
			expect(_.head(wSpy.logs['registerAction'][0])).toBe(someFunc.name)
		})
	})

	describe('logCallBackExecution', () => {
		it('should log callback execution with correct name', () => {
			const wSpy = getSpyWithOptions()

			wSpy.logCallBackRegistration(someFunc, 'runAction', [someFunc.name || someFunc], 'wSpyTest')

			expect(wSpy.logs['runAction'].length).toBe(1)
			expect(_.head(wSpy.logs['runAction'][0])).toBe(someFunc.name)
		})
	})

	describe('log actions', () => {

		const func = () => null

		it('should log a callback registration', () => {
			const wSpy = getSpyWithOptions()

			wSpy.logCallBackRegistration(func, 'registerAction', func.name, 'ActionQueue')

			expect(wSpy.logs.registerAction.length).not.toBeLessThan(0)
		})

		it('should log a callback execution', () => {
			const wSpy = getSpyWithOptions()

			wSpy.logCallBackExecution(func, 'runAction', func.name, 'ActionQueue')

			expect(wSpy.logs.runAction.length).not.toBeLessThan(0)
		})
	})

	describe('clear', () => {

		it('should clear all logs', () => {
			const wSpy = getSpyWithOptions()

			wSpy.log('setHook', [], [])

			wSpy.clear()

			expect(_.every(wSpy.logs, {length: 0})).toBe(true)
		})
	})

	describe('search', () => {
		it('should find a specific log with a string', () => {
			const wSpy = getSpyWithOptions()

			wSpy.log('setHook', [], [])
			wSpy.log('dispatch', [], [])

			const result = wSpy.search('dispatch')

			expect(result.length).toBe(1)
			expect(result[0][1]).toBe('dispatch')
		})

		it('should find a specific log with a regex', () => {
			const wSpy = getSpyWithOptions()

			wSpy.log('setHook', [], [])
			wSpy.log('worker', [], [])
			wSpy.log('dispatch', [], [])

			const result = wSpy.search(/dispatch|worker/)

			expect(result.length).toBe(2)
		})

		it('should find by function name', () => {
			const wSpy = getSpyWithOptions()

			function runSpy(instance, logName) {
				instance.log(logName, [], [])
			}

			const logName = 'worker'
			runSpy(wSpy, logName)

			const result = wSpy.search(/runSpy/)

			expect(result.length).toBe(1)
			expect(result[0][1]).toEqual(logName)
		})
	})

	describe('merged', () => {
		it('should merge multiple logs', () => {
			const wSpy = getSpyWithOptions()

			wSpy.log('setHook', [], [])
			wSpy.log('dispatch', [], [])

			const merged = wSpy.merged()

			expect(merged.length).toBe(2)
		})
	})

	describe('grouped', () => {
		it('should group multiple logs', () => {
			const wSpy = getSpyWithOptions()

			wSpy.log('setHook', [], [])
			wSpy.log('dispatch', [], [])

			const grouped = wSpy.grouped()

			expect(grouped.length).toBe(2)
		})
	})

	describe('groupedNoMobx', () => {
		it('should add to group mobx logs', () => {
			const wSpy = getSpyWithOptions()

			wSpy.log('mobx', [], [])
			wSpy.log('dispatch', [], [])

			const grouped = wSpy.groupedNoMobx()

			expect(grouped.length).toBe(1)
		})
	})

	describe('recent', () => {
		it('should return only x recent logs', () => {
			const wSpy = getSpyWithOptions()

			wSpy.log('mobx', [], [])
			wSpy.log('runAction', [], [])
			wSpy.log('dispatch', [], [])

			const recent = wSpy.recent(2)

			expect(recent.length).toBe(2)
		})
	})

	describe('system props', () => {
		it('should have all system props in log', () => {
			const wSpy = getSpyWithOptions()

			wSpy.log('setHook', [], [])

			expect(_.every(wSpySystemProps, prop => _.has(wSpy.logs.setHook[0], prop))).toBe(true)
		})
	})
})
