function noop() {}

module.exports = {
	defaultSettings: {
		moreLogs: '',
		includeLogs: '',
		extraIgnoredEvents: [],
		MAX_LOG_SIZE: 10000,
		DEFAULT_LOGS_COUNT: 300,
		GROUP_MIN_LEN: 5,
		stackFilter: /wSpy/i
	},
	noopSpy: {
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
}