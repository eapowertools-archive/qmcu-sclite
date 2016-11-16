var qsocks = require('qsocks');
var fs = require('fs');
var config = require('../config/testConfig');
var Promise = require('bluebird');
var jsonFile = require('jsonfile');
var loadFile = require('./testloadFile');
var changeAppOwner = require('./testChangeAppOwner');

var x = {};
var inputPath = 'f:/my documents/_git/qmcu-brundle-fly/output/Travel_Expense_Management';
var makeOwnerid = "4ddcedb3-acbf-4d7a-90bb-40ac7b2bc0a5";

qsocks.Connect(config.qsocks).then(function(global)
{
    console.log("qsocks connection");
    x.global = global;
    return global.createApp('Yippee', 'Main')
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
            return changeAppOwner.changeAppOwner(appId,makeOwnerid)
            .then(function()
            {
                var loadScript = loadFile(inputPath + "/loadScript.json");
                return x.app.setScript(loadScript.loadScript);
            })
            .then(function()
            {
                var sheets = loadFile(inputPath + "/sheets.json")
                return importSheets(x.app, sheets);
            })
            .then(function()
            {
                var bookmarks = loadFile(inputPath + "/bookmarks.json")
                return importBookmarks(x.app,bookmarks);
            })
            .then(function()
            {
                console.log('yippee!');
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

function importSheets(app, data)
{
    return Promise.all(data.sheets.map(function(sheet)
    {
        return app.createObject(sheet.qProperty)
        .then(function(handle)
        {
            return handle.setFullPropertyTree(sheet)
            .then(function()
            {
                console.log("added sheet "  + sheet.qProperty.qMetaDef.title);
            })
        })
    }))
}

function importBookmarks(app, data)
{
    return Promise.all(data.bookmarks.map(function(bookmark)
    {
        return app.createBookmark(bookmark)
        .then(function(handle)
        {
            console.log(handle);
        })
    }))
}