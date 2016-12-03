var fs = require('fs');
var path = require('path');
var archiver = require('archiver');
var config = require('../config/runtimeConfig');
var Promise = require("bluebird");


var archive = {
    createZip: function(resultArray)
    {
        return new Promise(function(resolve, reject)
        {
            var id;
            var output;
            var result = {};
            if(resultArray.length==1)
            {
                id = resultArray[0].appId;
                output = fs.createWriteStream(config.outputPath + "/zips/" + id + ".zip");
                result.fullPath = config.outputPath + "/zips/" + id + ".zip";
                result.fileName = id + ".zip";                       
            }
            else
            {
                output = fs.createWriteStream(config.outputPath + "/zips/allAppsBackup.zip");
                result.fullPath = config.outputPath + "/zips/allAppsBackup.zip";
                result.fileName = "allAppsBackup.zip"; 
            }
            // create a file to stream archive data to.
            
            var archive = archiver('zip');

            // listen for all archive data to be written
            output.on('close', function() {
                console.log(archive.pointer() + ' total bytes');
                console.log('archiver has been finalized and the output file descriptor has closed.');
                resolve(result);
            });

            // good practice to catch this error explicitly
            archive.on('error', function(err) {
                reject(err);
            });

            // pipe archive data to the file
            archive.pipe(output);

            // append files from a directory
            if(resultArray.length==1)
            {
                archive.directory(config.outputPath + "/" + id, id);
            }
            else
            {
                resultArray.forEach(function(id)
                {
                    console.log("archiving " + id.appId);
                    archive.directory(config.outputPath+ "/" + id.appId, id.appId);
                });
            }
            // finalize the archive (ie we are done appending files but streams have to finish yet)
            archive.finalize();
        })
    }
};

module.exports = archive;

