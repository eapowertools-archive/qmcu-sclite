var qsocks = require('qsocks');
var serializeApp = require('serializeapp');
var Promise = require('bluebird');
var jsonFile = require('jsonfile');
var fs = require('fs');
var extend = require('extend');
var utils = require('./utils');
var config = require('../config/testConfig');

var backupApp = {
    backupApp: function(appId)
    {
        return new Promise(function(resolve, reject)
        {
            var outputPath = config.outputPath;
            var x ={};

            var qsocksInstance = extend(true, config.qsocks,
            {
                appname: appId
            });

            qsocks.Connect(qsocksInstance).then(function(g)
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
                        utils.dirExists(outputPath + "/" + appId, function(result)
                        {
                            if(!result)
                            {
                                fs.mkdir(outputPath+"/"+ appId, function(result)
                                {
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

                            resolve(result);

                        });
                    })
                    .catch(function(error)
                    {
                        reject(error);
                    });
                })
                .catch(function(error)
                {
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
}