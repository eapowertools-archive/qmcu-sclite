var Promise = require('bluebird');
var winston = require('winston');
require('winston-daily-rotate-file');
var config = require('../config/runtimeConfig');

//set up logging
  var logger = new (winston.Logger)({
    level: config.logging.logLevel,
    transports: [
        new (winston.transports.Console)(),
        new (winston.transports.DailyRotateFile)({ filename: config.logging.logPath + "qmcu-sclite.log", prepend:true})
      ]
  });


module.exports = function importAppObjects(x, objects)
{
    return Promise.all(objects.map(function(object)
    {
        logger.info("Attempting to create " + object.qProperty.qInfo.qType + " " + object.qProperty.qMetaDef.title, {module: "importAppObjects"});
        return x.app.createObject(object.qProperty)
        .then(function(handle)
        {
            logger.info(object.qProperty.qInfo.qType + " created " + object.qProperty.qMetaDef.title, {module: "importAppObjects"});
            return handle.setFullPropertyTree(object)
            .then(function()
            {
                //console.log("added object "  + object.qProperty.qMetaDef.title);
                return object.qProperty.qInfo.qId;
            });
        });
    }))
    .then(function(objectIds)
    {
        return objectIds;
    })
    .catch(function(error){
        logger.error(error, {module: "importAppObjects"});
        return error;
    });
};