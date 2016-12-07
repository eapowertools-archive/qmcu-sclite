var qsocks = require('qsocks');
var extend = require('extend');
var fs = require('fs');
var config = require('../config/runtimeConfig');
var Promise = require('bluebird');
var loadFile = require('./loadFile');
var importAppObjects = require('./importAppObjects');
var importBookmarks = require('./importBookmarks');
var importVariables = require('./importVariables');
var importDimensions = require('./importDimensions');
var importMeasures = require('./importMeasures');

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

var restoreApp = {
    restoreApp : function(inputPath, makeOwnerid, reloadData)
    {
        return new Promise(function(resolve, reject)
        {
            logger.info("Restoring " + inputPath + " to owner " + makeOwnerid, {module:'restoreApp'});
            var x = {};
            var qsocksInstance = extend(true, config.qsocks, 
            {
                headers:
                {
                    "X-Qlik-User": makeOwnerid,
                }
            })
            qsocks.Connect(qsocksInstance).then(function(g)
            {
                x.global = g;
                
                var appProps = loadFile(inputPath + "/properties.json");
                return g.createApp(appProps.properties.qTitle, 'Main')
                .then(function(result)
                {
                    if(result.qSuccess)
                    {
                        logger.info("New app created with id " + result.qAppId, {module:'restoreApp'});
                        console.log("app created");
                        return result.qAppId;
                    }
                    else
                    {
                        logger.error(JSON.stringify(error), {module:'restoreApp'});
                        reject(error);
                    }
                })
                .then(function(appId)
                {
                    logger.info("About to Open " + appId, {module:'restoreApp'});
                    console.log(appId);
                    x.appId = appId;
                    return x.global.openDoc(appId,'','','',false);
                })
                .then(function(app)
                {

                    x.app = app;
                    x.ids = [];
                    
                        logger.info("Loading script to " + x.appId, {module:'restoreApp'});
                        var loadScript = loadFile(inputPath + "/loadScript.json");
                        return x.app.setScript(loadScript.loadScript);
                })
                .then(function()
                {
                    //add appobjects
                    logger.info("Adding sheets to " + x.appId, {module:'restoreApp'});
                    var sheets = loadFile(inputPath + "/sheets.json");
                    return importAppObjects(x, sheets.sheets);
                })
                .then(function(sheetIds)
                {
                    logger.info(sheetIds, {module:'restoreApp'});
                    x.ids.push({"type":"sheet","ids": sheetIds});
                })
                .then(function()
                {
                    logger.info("Adding bookmarks to " + x.appId, {module:'restoreApp'});
                    var bookmarks = loadFile(inputPath + "/bookmarks.json")
                    return importBookmarks(x,bookmarks);
                })
                .then(function(bookmarkIds)
                {
                    logger.info(bookmarkIds, {module:'restoreApp'});
                    x.ids.push({"type":"bookmark","ids": bookmarkIds});
                })
                .then(function()
                {
                    logger.info("Adding stories to " + x.appId, {module:'restoreApp'});
                    var stories = loadFile(inputPath + "/stories.json");
                    return importAppObjects(x, stories.stories);
                })
                .then(function(storyIds)
                {
                    x.ids.push({"type":"story","ids": storyIds});
                })
                .then(function()
                {
                    logger.info("Adding variables to " + x.appId, {module:'restoreApp'});
                    var variables = loadFile(inputPath + "/variables.json");
                    return importVariables(x,variables);
                })
                .then(function(variableIds)
                {
                    //x.ids.push({"type":"variables","ids": variableIds});
                })
                .then(function()
                {
                    logger.info("Adding dimensions to " + x.appId, {module:'restoreApp'});
                    var dimensions = loadFile(inputPath + "/dimensions.json");
                    return importDimensions(x,dimensions);
                })
                .then(function(dimensionIds)
                {
                    logger.info(dimensionIds, {module:'restoreApp'});
                    x.ids.push({"type":"dimension","ids": dimensionIds});
                })
                .then(function()
                {
                    logger.info("Adding measures to " + x.appId, {module:'restoreApp'});
                    var measures = loadFile(inputPath + "/measures.json");
                    return importMeasures(x,measures);
                })
                .then(function(measureIds)
                {
                    logger.info(measureIds, {module:'restoreApp'});
                    x.ids.push({"type":"measure","ids": measureIds});
                })
                .then(function()
                {
                    var objectCount = getObjectCount(x.ids);
                })
                .then(function(result)
                {
                    logger.info("App restore complete on " + x.appId, {module:'restoreApp'});
                    console.log(result);
                    
                })
                .then(function()
                {
                    logger.info("Saving App " + x.appId, {module:'restoreApp'});
                    console.log("do save")
                    
                    x.app.doSave()
                    .then(function()
                    {
                        if(reloadData)
                        {
                            logger.info("Reloading data " + x.appId, {module:'restoreApp'});
                            return x.app.doReload()
                            .then(function()
                            {
                                return x.app.doSave()
                                .then(function()
                                {
                                    return x.global.connection.close();
                                })
                            })
                            .catch(function(error){
                                logger.error(JSON.stringify(error), {module:'restoreApp'});
                            });
                        }
                        else
                        {
                            return x.global.connection.close();
                        }
                    })
                    .then(function()
                    {
                        var result = 
                        {
                            appId: x.appId,
                            appName: appProps.properties.qTitle,
                            message: "created and placed in selected owner's work area" 
                        };
                        logger.info(JSON.stringify(result), {module:'restoreApp'});
                        resolve(result);
                    });
                })
                .catch(function(error)
                {
                    logger.error(JSON.stringify(error), {module:'restoreApp'});
                    reject(error);
                    console.log(error);
                });
            })
            .catch(function(error)
            {
                logger.error(JSON.stringify(error), {module:'restoreApp'});
                reject(error);
            });
        });
    }
};

module.exports = restoreApp;

function getObjectCount(arrObjectIds)
{
    var count =0;

    arrObjectIds.forEach(function(item)
    {
        count += item.ids.length;
    });
    
    return count;
}