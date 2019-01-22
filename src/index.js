const browserHost = require('./hosts/wSpyBrowserHost')
module.exports = {
	initBrowserHost: settings => {
		browserHost.init(settings)
	}
}