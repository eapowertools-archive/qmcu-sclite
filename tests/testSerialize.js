var qsocks = require('qsocks');
var serializeApp = require('serializeapp');
var config = require('../config/testConfig');
var extend = require('extend');
var Promise = require('bluebird');
var jsonFile = require('jsonfile');
var utils = require('./utils');
var fs = require('fs');


var x = {};
var outputPath = 'f:/my documents/_git/qmcu-brundle-fly/output';

var appId = '4ddcedb3-acbf-4d7a-90bb-40ac7b2bc0a5';


qsocksAppConfig = extend(true, config.qsocks, {
    appname: appId
});

qsocks.Connect(qsocksAppConfig).then(function(g)
{
    x.global = g;
    console.log('opening app');
    return g.openDoc(appId,'','','',true)
    .then(function(app)
    {
        return serializeApp(app).then(function(appData)
        {
            console.log('serialized app');
            //console.log(path.resolve(outputPath + '/' + appId + "/"));
            
            var appName = utils.cleanString(appData.properties.qTitle);
            utils.dirExists(outputPath + "/" + appName, function(result)
            {
                if(!result)
                {
                    fs.mkdir(outputPath+"/"+ appName, function(result)
                    {
                        writeFiles(appData, appName, appId, x);
                    })
                }
                else
                {
                    writeFiles(appData, appName, appId, x);
                }
            });
        });
    });
});

function buildModDate() {
    var d = new Date();
    return d.toISOString();
}


function writeFiles(appData, appName, appId, x)
{
    var filename = outputPath + '/' + appName + '/' + appId + '.json';
    var filepath = outputPath + '/' + appName + '/';
    jsonFile.writeFileSync(filename, appData, {spaces: 4});
    // var properties = outputPath + '/' + appName + '/' + 'properties.json';
    // var loadscript = outputPath + '/' + appName + '/' + 'loadscript.json';
    // var sheets = outputPath + '/' + appName + '/' + 'sheets.json';
    // var stories = outputPath + '/' + appName + '/' + 'stories.json';
    // var masterobjects = outputPath + '/' + appName + '/' + 'masterobjects.json';
    // var sheets = outputPath + '/' + appName + '/' + 'sheets.json';
    // var embeddedMedia = outputPath + '/' + appName + '/' + 'embeddedmedia.json';
    // var dataconnections = outputPath + '/' + appName + '/' + 'dataconnections.json';
    // var dimensions = outputPath + '/' + appName + '/' + 'dimensions.json';
    // var measures = outputPath + '/' + appName + '/' + 'measures.json';
    // var bookmarks = outputPath + '/' + appName + '/' + 'bookmarks.json';
    // var snapshots = outputPath + '/' + appName + '/' + 'snapshots.json';
    // var variables = outputPath + '/' + appName + '/' + 'variables.json';
    
    for(var key in appData)
    {
        if(appData.hasOwnProperty(key))
        {
            // if(key=="properties")
            // {
                var strObj = "{\"" + key + "\":" + JSON.stringify(appData[key]) + "}";
                console.log(strObj);
                var obj = JSON.parse(strObj);
                jsonFile.writeFileSync(filepath + key + '.json', obj, {spaces: 4});

            // }
        }
    }


    
    //jsonFile.writeFileSync(properties, , {spaces: 4});
    // jsonFile.writeFileSync(loadscript, appData.loadScript, {spaces: 4});
    // jsonFile.writeFileSync(sheets, appData.sheets, {spaces: 4});
    // jsonFile.writeFileSync(stories, appData.stories, {spaces: 4});
    // jsonFile.writeFileSync(masterobjects, appData.masterobjects, {spaces: 4});
    // jsonFile.writeFileSync(embeddedMedia, appData.embeddedmedia, {spaces: 4});
    // jsonFile.writeFileSync(dataconnections, appData.dataconnections, {spaces: 4});
    // jsonFile.writeFileSync(dimensions, appData.dimensions, {spaces: 4});
    // jsonFile.writeFileSync(measures, appData.measures, {spaces: 4});
    // jsonFile.writeFileSync(bookmarks, appData.bookmarks, {spaces: 4});
    // jsonFile.writeFileSync(snapshots, appData.snapshots, {spaces: 4});
    // jsonFile.writeFileSync(variables, appData.variables, {spaces: 4});
    
    x.global.connection.close();
    
}