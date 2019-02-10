'use strict'
const workerHost = require('../src/hosts/wSpyWorkerHost')

const settings = {
	moreLogs: 'set',
	includeLogs: 'get',
	stackFilter: /bundle.js|require.min.js|lodash|raven.min.js/i
}

const mockWorker = {
	Error
}

describe('Worker Host', () => {
	beforeAll(() => {
		global.self = mockWorker
	})

	function getSpyFromHost(overrideParam, overrideSettings) {
		return workerHost.init({
			wSpyParam: overrideParam,
			settings: Object.assign({}, overrideSettings, settings)
		})
	}

	describe('init', () => {
		it('should init with wSpy', () => {
			const wSpy = getSpyFromHost('set', {})

			wSpy.log('set', [], [])
			wSpy.log('get', [], [])

			expect(wSpy.logs['set'].length).toBe(1)
			expect(wSpy.logs['get'].length).toBe(1)
		})

		it('should init with noop wSpy when no overrided param and no href param', () => {
			const wSpy = getSpyFromHost('', {})

			wSpy.log('set', [], [])
			wSpy.log('get', [], [])

			expect(wSpy.logs).toBeUndefined()
		})
	})
})
