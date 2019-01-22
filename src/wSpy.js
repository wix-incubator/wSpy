'use strict'
const _ = require('lodash')

const settings = {
	moreLogs: 'mobx,createDisplayedPage,livepreview,ds_GETTER',
	includeLogs: 'setHook,registerAction,runAction,worker,applyHook,ds_ACTION,ds_DATA_MANIPULATION_ACTION,dispatch',
	ignoredDSEvents: [
		'wixCode.fileSystem.getRoots',
		'wixCode.log.trace',
		'bi.event',
		'platform.reportAPICallBI'
	],
	stackFilter: /wSpy|publicMethodUtils|bundle.js|ActionQueue.js|require.min.js|main-r.min.js|observableDataUtil.js|lodash|mobxDataHandlers.js|react-dom|createEditorStore.js|coreUtils.js|create-react-class.js|redux-libs.js|throttledStore.js|raven.min.js|Object.store.dispatch|react.development/i
}
const MAX_LOG_SIZE = 10000
const DEFAULT_LOGS_COUNT = 300
const GROUP_MIN_LEN = 5
const {ignoredDSEvents, stackFilter} = settings

function isRegex(pattern) {
	return Object.prototype.toString.call(pattern) === '[object RegExp]'
}

function isString(pattern) {
	return typeof pattern === 'string' || pattern instanceof String
}

const systemProps = ['index', 'time', '_time', 'mem', 'source']
function getSpy({Error, memoryUsage, frame, wSpyParam}) {
	return {
		ver: 3,
		logs: {},
		otherSpies: [],
		init() {
			if (!this.includeLogs) {
				const includeLogsFromParam = (wSpyParam || '').split(',').filter(x => x[0] !== '-').filter(x => x)
				const excludeLogsFromParam = (wSpyParam || '').split(',').filter(x => x[0] === '-').map(x => x.slice(1))
				this.includeLogs = _(settings.includeLogs).
					split(',').
					concat(includeLogsFromParam).
					reject(x => excludeLogsFromParam.indexOf(x) !== -1).
					keyBy(x => x).
					value()
			}
		},
		shouldLog(logName, record) {
			return Array.isArray(record) && this.includeLogs[logName] && !ignoredDSEvents.includes(record[0])
		},
		log(logName, record, takeFrom) {
			this.init()
			if (!this.shouldLog(logName, record)) {
				return
			}
			this.logs.index = this.logs.index || 1
			this.logs[logName] = this.logs[logName] || []
			record.index = this.logs.index++
			record.source = this.source(takeFrom)
			const now = new Date()
			record._time = `${now.getSeconds()}:${now.getMilliseconds()}`
			record.time = now.getTime()
			record.mem = memoryUsage() / 1000000
			if (this.logs[logName].length > MAX_LOG_SIZE) {
				this.logs[logName] = this.logs[logName].slice(-1 * Math.floor(MAX_LOG_SIZE / 2))
			}
			if (!record[0]) {
				record[0] = record.source && record.source[0]
			}
			this.logs[logName].push(record)
		},
		getCallbackName(cb, takeFrom) {
			if (!cb) {
				return
			}
			if (!cb.name || isString(cb.name) && cb.name.startsWith('bound ')) {
				if (Array.isArray(cb.source)) {
					return cb.source[0]
				}
				const nameFromSource = this.source(takeFrom)
				if (Array.isArray(nameFromSource)) {
					return nameFromSource
				}
			}
			return cb.name.trim()
		},
		search(pattern) {
			if (isRegex(pattern)) {
				return this.merged(x => pattern.test(x.join(' ')))
			} else if (isString(pattern)) {
				return this.merged(x => x.join(' ').indexOf(pattern) !== -1)
			} else if (Number.isInteger(pattern)) {
				return this.merged().slice(-1 * pattern)
			}
		},
		logCallBackRegistration(cb, logName, record, takeFrom) {
			cb.source = this.source(takeFrom)
			this.log(logName, [this.getCallbackName(cb, takeFrom), ...record], takeFrom)
		},
		logCallBackExecution(cb, logName, record, takeFrom) {
			this.log(logName, [this.getCallbackName(cb, takeFrom), cb.source, ...record], takeFrom)
		},
		spyMobx(mobx) {
			mobx.spy(e => {
				if (e.spyReportEnd) {
					return
				}
				if (e.type === 'update') {
					const src = this.source()
					this.log('mobx', [`update: ${e.name}`, ...src, e.newValue, e])
				}
			})
		},
		purge(count) {
			const countFromEnd = -1 * (count || DEFAULT_LOGS_COUNT)
			Object.keys(this.logs).forEach(log => this.logs[log] = this.logs[log].slice(countFromEnd))
		},
		clear() {
			Object.keys(this.logs).forEach(log => this.logs[log] = [])
		},
		recent(count) {
			const countFromEnd = -1 * (count || DEFAULT_LOGS_COUNT)
			return this.merged().slice(countFromEnd)
		},
		merged(filter) {
			return _(this.logs).keys().flatMap(module =>
				_(this.logs[module]).map(arr => {
					const res = [arr.index, module, ...arr]
					systemProps.forEach(p => {
						res[p] = arr[p]
					})
					return res
				}).value()).
				filter((e, i, src) => !filter || filter(e, i, src)).
				sort((x, y) => x.index - y.index).
				value()
		},
		grouped(filter) {
			const merged = this.merged(filter)
			const countFromEnd = -1 * DEFAULT_LOGS_COUNT
			return [].concat.apply([], merged.reduce((acc, curr, i, arr) => {
				const group = acc[acc.length - 1]
				if (!group) {
					return [newGroup(curr)]
				}
				if (curr[1] === group[0][1]) {
					group.push(curr)
				} else {
					if (group.length > GROUP_MIN_LEN) {
						group.unshift(`[${group.length}] ${group[0][1]}`)
					}
					acc.push(newGroup(curr))
				}
				if (i === arr.length - 1 && group.length > GROUP_MIN_LEN) {
					group.unshift(`[${group.length}] ${group[0][1]}`)
				}
				return acc
			}, []).map(e => e.length > GROUP_MIN_LEN ? [e] : e)).
				slice(countFromEnd).
				map((x, i, arr) => {
					const delay = i === 0 ? 0 : x.time - arr[i - 1].time
					x[0] = `${x[0]} +${delay}`
					return x
				})
			function newGroup(rec) {
				const res = [rec]
				res.time = rec.time
				return res
			}
		},
		groupedNoMobx(filter) {
			return this.grouped((e, i, src) => e[1] !== 'mobx' && (!filter || filter(e, i, src)))
		},
		enabled() {
			return true // enabled is noop if wspy is closed. (only for devs)
		},
		source(takeFrom) {
			Error.stackTraceLimit = 50
			const windows = [frame]
			while (windows[0].parent && windows[0] !== windows[0].parent) {
				windows.unshift(windows[0].parent)
			}
			let stackTrace = windows.reverse().map(window => new window.Error().stack).join('\n').split(/\r|\n/).map(x => x.trim()).slice(4).
				filter(line => line !== 'Error').
				filter(line => !stackFilter.test(line))
			if (takeFrom) {
				const firstIndex = stackTrace.findIndex(line => line.indexOf(takeFrom) !== -1)
				stackTrace = stackTrace.slice(firstIndex + 1)
			}
			const line = stackTrace[0] || ''
			return [
				line.split(/at |as /).pop().split(/ |]/)[0],
				line.split('/').pop().slice(0, -1).trim(),
				...stackTrace
			]
		}
	}
}

module.exports = {
	init: options => getSpy(options)
}