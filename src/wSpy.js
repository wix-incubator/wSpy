'use strict'
const systemProps = ['index', 'time', '_time', 'mem', 'source']

function isRegex(pattern) {
	return Object.prototype.toString.call(pattern) === '[object RegExp]'
}

function isString(pattern) {
	return typeof pattern === 'string' || pattern instanceof String
}

function getSpy({Error, memoryUsage, frame, wSpyParam, settings}) {
	// TODO: yinonc add validations on settings
	return {
		ver: 3,
		logs: {},
		otherSpies: [],
		init() {
			if (!this.includeLogs) {
				const includeLogsFromParam = (wSpyParam || '').split(',').filter(x => x[0] !== '-').filter(x => x)
				const excludeLogsFromParam = (wSpyParam || '').split(',').filter(x => x[0] === '-').map(x => x.slice(1))
				this.includeLogs = settings.includeLogs.split(',').concat(includeLogsFromParam).filter(log => excludeLogsFromParam.indexOf(log) === -1).reduce((acc, log) => {
					acc[log] = true
					return acc
				}, {})
			}
		},
		shouldLog(logName, record) {
			return Array.isArray(record) && this.includeLogs[logName] && !settings.extraIgnoredEvents.includes(record[0])
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
			if (this.logs[logName].length > settings.MAX_LOG_SIZE) {
				this.logs[logName] = this.logs[logName].slice(-1 * Math.floor(settings.MAX_LOG_SIZE / 2))
			}
			if (!record[0] && record.source) {
				record[0] = record.source[0]
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
			const countFromEnd = -1 * (count || settings.DEFAULT_LOGS_COUNT)
			Object.keys(this.logs).forEach(log => this.logs[log] = this.logs[log].slice(countFromEnd))
		},
		clear() {
			Object.keys(this.logs).forEach(log => this.logs[log] = [])
		},
		recent(count) {
			const countFromEnd = -1 * (count || settings.DEFAULT_LOGS_COUNT)
			return this.merged().slice(countFromEnd)
		},
		merged(filter) {
			return [].concat.apply([], Object.keys(this.logs).filter(log => Array.isArray(this.logs[log])).map(module =>
				this.logs[module].map(arr => {
					const res = [arr.index, module, ...arr]
					systemProps.forEach(p => {
						res[p] = arr[p]
					})
					return res
				}))).
				filter((e, i, src) => !filter || filter(e, i, src)).
				sort((x, y) => x.index - y.index)
		},
		grouped(filter) {
			const merged = this.merged(filter)
			const countFromEnd = -1 * settings.DEFAULT_LOGS_COUNT
			return [].concat.apply([], merged.reduce((acc, curr, i, arr) => {
				const group = acc[acc.length - 1]
				if (!group) {
					return [newGroup(curr)]
				}
				if (curr[1] === group[0][1]) {
					group.push(curr)
				} else {
					if (group.length > settings.GROUP_MIN_LEN) {
						group.unshift(`[${group.length}] ${group[0][1]}`)
					}
					acc.push(newGroup(curr))
				}
				if (i === arr.length - 1 && group.length > settings.GROUP_MIN_LEN) {
					group.unshift(`[${group.length}] ${group[0][1]}`)
				}
				return acc
			}, []).map(e => e.length > settings.GROUP_MIN_LEN ? [e] : e)).
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
		source(takeFrom) {
			Error.stackTraceLimit = 50
			const windows = [frame]
			while (windows[0].parent && windows[0] !== windows[0].parent) {
				windows.unshift(windows[0].parent)
			}
			let stackTrace = windows.reverse().map(window => new window.Error().stack).join('\n').split(/\r|\n/).map(x => x.trim()).slice(4).
				filter(line => line !== 'Error').
				filter(line => !settings.stackFilter.test(line))
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