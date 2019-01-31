'use strict'
const browserHost = require('../src/hosts/wSpyBrowserHost')

const settings = {
	moreLogs: 'mobx',
	includeLogs: 'setHook,registerAction,runAction,worker,applyHook,dispatch',
	stackFilter: /bundle.js|require.min.js|observableDataUtil.js|lodash|mobxDataHandlers.js|react-dom|createEditorStore.js|create-react-class.js|redux-libs.js|throttledStore.js|raven.min.js|Object.store.dispatch|react.development/i
}

describe('browserHost', () => {
	function getSpyFromHost(overrideParam, overrideSettings) {
		return browserHost.init({
			wSpyOverrideParam: overrideParam,
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

		it('should init with noop wSpy when no overrided param and no href param', () => {
			const wSpy = getSpyFromHost('', {})

			wSpy.log('mobx', [], [])
			wSpy.log('setHook', [], [])

			expect(wSpy.logs).toBeUndefined()
		})
	})
})
