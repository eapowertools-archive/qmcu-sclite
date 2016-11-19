var qsocks = require('qsocks');
var fs = require('fs');
var config = require('../config/testConfig');
var Promise = require('bluebird');
var jsonFile = require('jsonfile');
var loadFile = require('./testloadFile');
var changeAppOwner = require('./testChangeAppOwner');
//var changeOwner = require('./changeOwner');
var repoFuncs = require('./repoFuncs');

var x = {};
var inputPath = 'f:/my documents/_git/qmcu-brundle-fly/output/Travel_Expense_Management';
var makeOwnerid = "4ddcedb3-acbf-4d7a-90bb-40ac7b2bc0a5";

qsocks.Connect(config.qsocks).then(function(global)
{
    console.log("qsocks connection");
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
                //return jsonFile.writeFileSync("f:/my documents/_git/qmcu-brundle-fly/output/deserial.json", x.ids, {spaces: 4});
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
        x.app.doReload();
        x.app.doSave();
        x.global.connection.close();
    })
    .catch(function(error)
    {
        console.log(error);
    })
})

function importAppObjects(x, objects)
{
    return Promise.all(objects.map(function(object)
    {
        return x.app.createObject(object.qProperty)
        .then(function(handle)
        {
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
        return objectIds
    })
    .catch(function(error){
        return error;
    });
}

function importVariables(x, variables)
{
    return Promise.all(variables.variables.map(function(variable)
    {
        if(!variable.qIsScriptCreated)
        {
            return x.app.createVariableEx(variable)
            .then(function(result)
            {
            // console.log("created variable " + variable.qInfo.qId);
                return variable.qInfo.qId;
            })
        }
        else
        {
            return variable.qInfo.qId;
        }
    }))
    .then(function(variableIds)
    {
         //console.log(variableIds);
        return variableIds;
    })
    .catch(function(error){
        return error;
    });
}

function importBookmarks(x, data)
{
    return Promise.all(data.bookmarks.map(function(bookmark)
    {
        return x.app.createBookmark(bookmark)
        .then(function(handle)
        {
         //   console.log("added bookmark " + bookmark.qMetaDef.title)
            return bookmark.qInfo.qId;
        })
    }))
    .then(function(bookmarkIds)
    {
        return bookmarkIds;
    })
    .catch(function(error){
        return error;
    });
}


function importDimensions(x, dimensions)
{
    return Promise.all(dimensions.dimensions.map(function(dimension)
    {
        return x.app.createDimension(dimension)
        .then(function(handle)
        {
            //console.log("Created Dimension " + dimension.qMetaDef.title)
            return dimension.qInfo.qId
        })
    }))
    .then(function(dimensionIds)
    {
        return dimensionIds;
    })
    .catch(function(error){
        return error;
    });
}

function importMeasures(x, measures)
{
    return Promise.all(measures.measures.map(function(measure)
    {
        return x.app.createMeasure(measure)
        .then(function(handle)
        {
           // console.log("Created Measure " + measure.qMetaDef.title)
            return measure.qInfo.qId
        })
    }))
    .then(function(measureIds)
    {
        return measureIds;
    })
    .catch(function(error){
        return error;
    });
}

function getObjectCount(arrObjectIds)
{
    var count =0;

    arrObjectIds.forEach(function(item)
    {
        count += item.ids.length;
    });
    
    return count;
}