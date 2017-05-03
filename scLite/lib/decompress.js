var decompress = require('decompress');
var config = require('../config/runtimeConfig');
var path = require('path');
var Promise = require('bluebird');

var winston = require('winston');
require('winston-daily-rotate-file');

//set up logging
  var logger = new (winston.Logger)({
    level: config.logging.logLevel,
    transports: [
        new (winston.transports.Console)(),
        new (winston.transports.DailyRotateFile)({ filename: config.logging.logPath + "qmcu-sclite.log", prepend:true})
      ]
  });


var foo = {
    extractFiles : function(src)
    {
        return new Promise(function(resolve, reject)
        {
            logger.info("Decompressing " + src, {module:'decompress'});
            var dest = config.outputPath;
            decompress(src, dest)
            .then(function(files)
            {
                var file = files[0].path;
                file = file.split('/');

                logger.info("Decompressed " + src + " to " + dest, {module:'decompress'});
                resolve(file[0]);
            })
            .catch(function(error)
            {
                logger.error(JSON.stringify(error), {module:'decompress'});
                reject(error)
            });
        });  
    }
};

module.exports = foo;