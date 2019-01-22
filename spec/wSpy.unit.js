'use strict'
const _ = require('lodash')
const initSpy = require('../src/wSpy')

const nodeHost = {
	Error,
	memoryUsage: () => process.memoryUsage().heapUsed,
	frame: global
}

const wSpySystemProps = ['index', 'time', '_time', 'mem', 'source']

describe('wSpy', () => {
	function getSpyWithParam(param) {
		return initSpy.init({...nodeHost, wSpyParam: param})
	}
	describe('log', () => {
		it('should not log when logName isn\'t on defaults', () => {
			const wSpy = getSpyWithParam()

			wSpy.log('operation', [], [])

			expect(wSpy.logs).toEqual({})
		})

		it('should not log when record isn\'t array', () => {
			const wSpy = getSpyWithParam()

			wSpy.log('setHook', {}, [])

			expect(wSpy.logs).toEqual({})
		})

		it('should log when record is array, logName is one of defaults and not ignored', () => {
			const wSpy = getSpyWithParam()

			wSpy.log('setHook', [], [])

			expect(wSpy.logs.setHook.length).toBe(1)
		})

		it('should add new log with param', () => {
			const wSpy = getSpyWithParam('mobx')

			wSpy.log('mobx', [], [])

			expect(wSpy.logs.mobx.length).not.toBe(0)
		})

		it('should add new logs also when multiple extra params', () => {
			const wSpy = getSpyWithParam('mobx,ds_GETTER')

			wSpy.log('mobx', [], [])

			expect(wSpy.logs.mobx.length).not.toBe(0)

			wSpy.log('ds_GETTER', [], [])

			expect(wSpy.logs.ds_GETTER.length).not.toBe(0)
		})

		it('should not log when disabling a logName', () => {
			const wSpy = getSpyWithParam('-ds_ACTION')

			wSpy.log('ds_ACTION', [], [])

			expect(wSpy.logs.ds_ACTION).toBeUndefined()
		})

		it('should not log when disabling multiple logNames', () => {
			const wSpy = getSpyWithParam('-setHook,-ds_ACTION')

			wSpy.log('ds_ACTION', [], [])

			expect(wSpy.logs.ds_ACTION).toBeUndefined()

			wSpy.log('setHook', [], [])

			expect(wSpy.logs.setHook).toBeUndefined()
		})
	})

	describe('log actions', () => {

		const func = () => null

		it('should log a callback registration', () => {
			const wSpy = getSpyWithParam()

			wSpy.logCallBackRegistration(func, 'registerAction', func.name, 'ActionQueue')

			expect(wSpy.logs.registerAction.length).not.toBeLessThan(0)
		})

		it('should log a callback execution', () => {
			const wSpy = getSpyWithParam()

			wSpy.logCallBackExecution(func, 'runAction', func.name, 'ActionQueue')

			expect(wSpy.logs.runAction.length).not.toBeLessThan(0)
		})
	})

	describe('clear', () => {

		it('should clear all logs', () => {
			const wSpy = getSpyWithParam()

			wSpy.log('setHook', [], [])

			wSpy.clear()

			expect(_.every(wSpy.logs, {length: 0})).toBe(true)
		})
	})

	describe('search', () => {
		it('should find a specific log with a string', () => {
			const wSpy = getSpyWithParam()

			wSpy.log('setHook', [], [])
			wSpy.log('dispatch', [], [])

			const result = wSpy.search('dispatch')

			expect(result.length).toBe(1)
			expect(result[0][1]).toBe('dispatch')
		})

		it('should find a specific log with a regex', () => {
			const wSpy = getSpyWithParam()

			wSpy.log('setHook', [], [])
			wSpy.log('worker', [], [])
			wSpy.log('dispatch', [], [])

			const result = wSpy.search(/dispatch|worker/)

			expect(result.length).toBe(2)
		})
	})

	describe('merged', () => {
		it('should merge multiple logs', () => {
			const wSpy = getSpyWithParam()

			wSpy.log('setHook', [], [])
			wSpy.log('dispatch', [], [])

			const merged = wSpy.merged()

			expect(merged.length).toBe(2)
		})
	})

	describe('grouped', () => {
		it('should group multiple logs', () => {
			const wSpy = getSpyWithParam()

			wSpy.log('setHook', [], [])
			wSpy.log('dispatch', [], [])

			const grouped = wSpy.grouped()

			expect(grouped.length).toBe(2)
		})
	})

	describe('system props', () => {
		it('should have all system props in log', () => {
			const wSpy = getSpyWithParam()

			wSpy.log('setHook', [], [])

			expect(_.every(wSpySystemProps, prop => _.has(wSpy.logs.setHook[0], prop))).toBe(true)
		})
	})
})
