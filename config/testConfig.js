var config = require('./baseConfig');
var extend = require('extend');
var path = require('path');
var fs = require('fs');

var certPath = 'F:/my documents/_git/qmcu-brundle-fly/certs';

config = extend(true, config, {
    certificates:
    {
        client: path.resolve(certPath, 'client.pem'),
		client_key: path.resolve(certPath,'client_key.pem'),
		server: path.resolve(certPath, 'server.pem'),
		server_key: path.resolve(certPath, 'server_key.pem'),
		root: path.resolve(certPath,'root.pem')
    },
    qsocks: {
        host: 'sense3.112adams.local',
        port: 4747,
        isSecure: true,
        origin: 'https://localhost',
        ca: fs.readFileSync(path.resolve(certPath,'root.pem')),
        key: fs.readFileSync(path.resolve(certPath,'client_key.pem')),
        cert: fs.readFileSync(path.resolve(certPath,'client.pem')),
        headers: {
            "X-Qlik-User" : config.engine.repoAccount
        }
    },
    qrs: {
		localCertPath: certPath,
		hostname: "sense3.112adams.local",
		repoAccountUserDirectory: 'INTERNAL',
		repoAccountUserId: 'sa_repository',
		changeInterval: 15
	}
});

module.exports = config;