const browserHost = require('./hosts/wSpyBrowserHost')
module.exports = {
	initBrowserHost: options => {
		browserHost.init(options)
	}
}