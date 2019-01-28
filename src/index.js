const browserHost = require('./hosts/wSpyBrowserHost')
const workerHost = require('./hosts/wSpyWorkerHost')
module.exports = {
	initBrowserHost: function(options) {
		browserHost.init(options)
	},
	initWorkerHost: function(options) {
		workerHost.init(options)
	}
}