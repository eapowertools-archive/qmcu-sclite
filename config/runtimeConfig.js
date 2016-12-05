var extend = require('extend');
var mainConfig = require("../../../config/config");
var baseConfig = require('./baseConfig');


var config;


config = extend(true, mainConfig, config);
config = extend(true, baseConfig, config);
config = extend(true, config, {
    qsocks: {
        ca: fs.readFileSync(path.resolve(config.certPath,'root.pem')),
        key: fs.readFileSync(path.resolve(config.certPath,'client_key.pem')),
        cert: fs.readFileSync(path.resolve(config.certPath,'client.pem')),
        headers: {
            "X-Qlik-User" : config.qsocks.repoAccount
        }
    },
    qrs: {
		localCertPath: certPath,
		repoAccountUserDirectory: 'INTERNAL',
		repoAccountUserId: 'sa_repository'
	}
});
module.exports = config;