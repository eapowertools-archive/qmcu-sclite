var extend = require('extend');
var path = require('path');

var config = {
	qsocks: {
		repoAccount: 'UserDirectory=Internal;UserId=sa_repository'
	},
	outputPath: path.resolve(__dirname,"..","output")
};

module.exports = config;