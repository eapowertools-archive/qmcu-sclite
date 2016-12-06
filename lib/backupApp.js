var qsocks = require('qsocks');
var serializeApp = require('serializeapp');
var Promise = require('bluebird');
var jsonFile = require('jsonfile');
var fs = require('fs');
var extend = require('extend');
var utils = require('./utils');
var config = require('../config/runtimeConfig');

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



var backupApp = {
    backupApp: function(appId)
    {
        return new Promise(function(resolve, reject)
        {
            var outputPath = config.outputPath;
            var x ={};

            logger.info("Backing up " + appId, {module:'backupApp'});

            var qsocksInstance = extend(true, config.qsocks,
            {
                appname: appId
            });

            qsocks.Connect(qsocksInstance).then(function(g)
            {
                x.global = g;
                logger.info("Opening app " + appId, {module:'backupApp'});
                return g.openDoc(appId,'','','',true)
                .then(function(app)
                {
                    return serializeApp(app).then(function(appData)
                    {
                        logger.info("Serialized App " + appId, {module:'backupApp'});
                        //console.log(path.resolve(outputPath + '/' + appId + "/"));
                        
                        var appName = utils.cleanString(appData.properties.qTitle);
                        utils.dirExists(outputPath + "/" + appId, function(result)
                        {
                            if(!result)
                            {
                                fs.mkdir(outputPath+"/"+ appId, function(result)
                                {
                                    logger.info("Output path created: " + outputPath+"/"+ appId, {module:'backupApp'});
                                    writeFiles(outputPath, appData, appName, appId);
                                })
                            }
                            else
                            {
                                writeFiles(outputPath, appData, appName, appId);
                            }

                            x.global.connection.close();
                            var result = {
                                appId: appId,
                                appName: appName,
                                message: "App serialized and saved to disk"
                            };

                            logger.info(JSON.stringify(result),{module:'backupApp'});

                            resolve(result);

                        });
                    })
                    .catch(function(error)
                    {
                        logger.error(JSON.stringify(error),{module:'backupApp'});
                        console.log(JSON.stringify(error));
                        reject(error);
                    });
                })
                .catch(function(error)
                {
                    logger.error(JSON.stringify(error),{module:'backupApp'});
                    console.log(JSON.stringify(error));
                    reject(error);
                });
            });
        });
    }
};


module.exports = backupApp;


function buildModDate() {
    var d = new Date();
    return d.toISOString();
}


function writeFiles(outputPath, appData, appName, appId)
{
    var filename = outputPath + '/' + appId + '/' + appId + '.json';
    var filepath = outputPath + '/' + appId + '/';
    jsonFile.writeFileSync(filename, appData, {spaces: 4});
    
    for(var key in appData)
    {
        if(appData.hasOwnProperty(key))
        {
            var strObj = "{\"" + key + "\":" + JSON.stringify(appData[key]) + "}";
            //console.log(strObj);
            var obj = JSON.parse(strObj);
            jsonFile.writeFileSync(filepath + key + '.json', obj, {spaces: 4});
        }
    }
    logger.info("All files written to " + filepath + "::" + appName, {module:'backupApp'});
}