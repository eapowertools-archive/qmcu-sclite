var qsocks = require('qsocks');
var fs = require('fs');
var config = require('./config/testConfig');
var Promise = require('bluebird');
var loadFile = require('./loadFile');
var changeAppOwner = require('./ChangeAppOwner');
var repoFuncs = require('./repoFuncs');
var importAppObjects = require('./importAppObjects');
var importBookmarks = require('./importBookmarks');
var importVariables = require('./importVariables');
var importDimensions = require('./importDimensions');
var importMeasures = require('./importMeasures');

var restoreApp = {
    restoreApp : function(inputPath, makeOwnerid, reloadData)
    {
        return new Promise(function(resolve, reject)
        {
            var x = {};
            qsocks.Connect(config.qsocks).then(function(global)
            {
                x.global = global;
                var appProps = loadFile(inputPath + "/properties.json");
                return global.createApp(appProps.properties.qTitle, 'Main')
                .then(function(result)
                {
                    if(result.qSuccess)
                    {
                        console.log("app created");
                        return result.qAppId;
                    }
                    else
                    {
                        reject(error);
                    }
                })
                .then(function(appId)
                {
                    console.log(appId);
                    x.appId = appId;
                    return x.global.openDoc(appId,'','','',false)
                    .then(function(app)
                    {
                        x.app = app;
                        x.ids = [];
                        return changeAppOwner.changeAppOwner(appId,makeOwnerid)
                        .then(function()
                        {
                            var loadScript = loadFile(inputPath + "/loadScript.json");
                            return x.app.setScript(loadScript.loadScript);
                        })
                        .then(function()
                        {
                            //add appobjects
                            var sheets = loadFile(inputPath + "/sheets.json")
                            return importAppObjects(x, sheets.sheets);
                        })
                        .then(function(sheetIds)
                        {
                            x.ids.push({"type":"sheet","ids": sheetIds});
                        })
                        .then(function()
                        {
                            var bookmarks = loadFile(inputPath + "/bookmarks.json")
                            return importBookmarks(x,bookmarks);
                        })
                        .then(function(bookmarkIds)
                        {
                            x.ids.push({"type":"bookmark","ids": bookmarkIds});
                        })
                        .then(function()
                        {
                            var stories = loadFile(inputPath + "/stories.json")
                            return importAppObjects(x, stories.stories);
                        })
                        .then(function(storyIds)
                        {
                            x.ids.push({"type":"story","ids": storyIds});
                        })
                        .then(function()
                        {
                            var variables = loadFile(inputPath + "/variables.json")
                            return importVariables(x,variables);
                        })
                        .then(function(variableIds)
                        {
                            //x.ids.push({"type":"variables","ids": variableIds});
                        })
                        .then(function()
                        {
                            var dimensions = loadFile(inputPath + "/dimensions.json")
                            return importDimensions(x,dimensions);
                        })
                        .then(function(dimensionIds)
                        {
                            x.ids.push({"type":"dimension","ids": dimensionIds});
                        })
                        .then(function()
                        {
                            var measures = loadFile(inputPath + "/measures.json")
                            return importMeasures(x,measures);
                        })
                        .then(function(measureIds)
                        {
                            x.ids.push({"type":"measure","ids": measureIds});
                        })
                        .then(function()
                        {
                            var objectCount = getObjectCount(x.ids)
                            console.log(objectCount);
                            return repoFuncs.getRepositoryIds(x.appId,objectCount)
                        })
                        .then(function(repoIds)
                        {
                            //console.log(repoIds);
                            return repoFuncs.changeOwner(repoIds,makeOwnerid)
                        })
                        .then(function(result)
                        {
                            console.log(result);
                            
                        })
                        .catch(function(error)
                        {
                            console.log(error);
                        })
                    })
                    .catch(function(error)
                    {
                        console.log(error);
                    })
                })
                .then(function()
                {
                    console.log("do save")
                    if(reloadData)
                    {
                        x.app.doReload();
                    }
                    x.app.doSave();
                    x.global.connection.close();
                    var result = 
                    {
                        appId: x.appId,
                        appName: appProps.properties.qTitle,
                        message: "created and placed in selected owner's work area" 
                    };
                    resolve(result);
                })
                .catch(function(error)
                {
                    console.log(error);
                });
            })
            .catch(function(error)
            {
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