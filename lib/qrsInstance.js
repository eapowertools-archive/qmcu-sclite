var qrsInteract = require('qrs-interact');
var config = require('../config/runtimeConfig');

var qrsInstance = new qrsInteract(config.qrs);

module.exports = qrsInstance;