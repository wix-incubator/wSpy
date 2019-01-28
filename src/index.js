const browserHost = require('./hosts/wSpyBrowserHost')
const workerHost = require('./hosts/wSpyWorkerHost')
module.exports = {
	initBrowserHost: options => browserHost.init(options),
	initWorkerHost: options => workerHost.init(options)
}