'use strict'
const nodeHost = require('../src/hosts/wSpyNodeHost')

const settings = {
	moreLogs: 'set',
	includeLogs: 'get',
	stackFilter: /bundle.js|require.min.js|lodash|raven.min.js/i
}

describe('Node Host', () => {
	function getSpyFromHost(overrideParam, overrideSettings) {
		return nodeHost.init({
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
