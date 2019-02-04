'use strict'
const browserHost = require('../src/hosts/wSpyBrowserHost')

const settings = {
	moreLogs: 'mobx,action',
	includeLogs: 'setHook,registerAction,runAction,worker,applyHook,dispatch',
	stackFilter: /bundle.js|require.min.js|observableDataUtil.js|lodash|mobxDataHandlers.js|react-dom|createEditorStore.js|create-react-class.js|redux-libs.js|throttledStore.js|raven.min.js|Object.store.dispatch|react.development/i
}

describe('browserHost', () => {
	function getSpyFromHost(param, overrideSettings) {
		global.window = {
			location: {
				href: `https://localhost/?wspy=${param}`
			},
			Error: global.Error
		}
		global.window.parent = global.window

		return browserHost.init({
			settings: Object.assign({}, overrideSettings, settings)
		})
	}
	describe('init', () => {
		it('should init with wSpy', () => {
			const wSpy = getSpyFromHost('mobx', {})

			wSpy.log('mobx', [], [])
			wSpy.log('setHook', [], [])

			expect(wSpy.logs['mobx'].length).toBe(1)
			expect(wSpy.logs['setHook'].length).toBe(1)
		})

		it('should init with wSpy without include log', () => {
			const wSpy = getSpyFromHost('mobx,-setHook', {})

			wSpy.log('mobx', [], [])
			wSpy.log('setHook', [], [])

			expect(wSpy.logs['mobx'].length).toBe(1)
			expect(wSpy.logs['setHook']).toBeUndefined()
		})

		it('should init with wSpy with many params', () => {
			const wSpy = getSpyFromHost('mobx,action', {})

			wSpy.log('mobx', [], [])
			wSpy.log('action', [], [])

			expect(wSpy.logs['mobx'].length).toBe(1)
			expect(wSpy.logs['action'].length).toBe(1)
		})

		it('should activate param with default logs', () => {
			const wSpy = getSpyFromHost('true', {})

			wSpy.log('setHook', [], [])

			expect(wSpy.logs['setHook'].length).toBe(1)
		})

		it('should return noopSpy if no param is set', () => {
			const wSpy = getSpyFromHost('', {})

			wSpy.log('setHook', [], [])

			expect(wSpy.logs).toBeUndefined()
		})
	})
})
