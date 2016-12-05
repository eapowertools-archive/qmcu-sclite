var extend = require('extend');
var mainConfig = require("../../../config/config");
var baseConfig = require('./baseConfig');
var fs= require('fs');


var config;


config = extend(true, mainConfig, config);
config = extend(true, baseConfig, config);
config = extend(true, config, {
    qsocks: {
        ca: fs.readFileSync(config.certificates.root),
        key: fs.readFileSync(config.certificates.client),
        cert: fs.readFileSync(config.certificates.client_key),
        headers: {
            "X-Qlik-User" : config.qsocks.repoAccount
        }
    },
    qrs: {
		localCertPath: config.certificates.certPath,
		repoAccountUserDirectory: 'INTERNAL',
		repoAccountUserId: 'sa_repository'
	}
});
module.exports = config;