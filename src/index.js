const browserHost = require('./hosts/wSpyBrowserHost')
const workerHost = require('./hosts/wSpyWorkerHost')
const nodeHost = require('./hosts/wSpyNodeHost')
module.exports = {
	initBrowserHost: options => browserHost.init(options),
	initWorkerHost: options => workerHost.init(options),
	initNodeHost: options => nodeHost.init(options)
}