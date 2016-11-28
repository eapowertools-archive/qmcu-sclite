var extend = require('extend');
var mainConfig = require("../../../config/config");
var testConfig = require('./testConfig');


var config;


config = extend(true, mainConfig, config);
config = extend(true, testConfig, config);

module.exports = config;