var fs = require('fs');
var path = require('path');
var archiver = require('archiver');
var config = require('../config/runtimeConfig');
var Promise = require("bluebird");

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
                logger.info("Creating an archive for " + id, {module:'archive'});                       
            }
            else
            {
                output = fs.createWriteStream(config.outputPath + "/zips/allAppsBackup.zip");
                result.fullPath = config.outputPath + "/zips/allAppsBackup.zip";
                result.fileName = "allAppsBackup.zip"; 
                logger.info("Creating an archive for all apps", {module:'archive'});
            }
            // create a file to stream archive data to.
            
            var archive = archiver('zip');

            // listen for all archive data to be written
            output.on('close', function() {
                
                logger.info(archive.pointer() + ' total bytes', {module:'archive'});
                logger.info('archiver has been finalized and the output file descriptor has closed.', {module:'archive'});
                resolve(result);
            });

            // good practice to catch this error explicitly
            archive.on('error', function(err) {
                logger.error(err,{module:'archive'});
                reject(err);
            });

            // pipe archive data to the file
            archive.pipe(output);

            // append files from a directory
            if(resultArray.length==1)
            {
                logger.info("Archiving " + id, {module:'archive'});
                archive.directory(config.outputPath + "/" + id, id);
            }
            else
            {
                resultArray.forEach(function(id)
                {
                    logger.info("Archiving " + id.appId, {module:'archive'});
                    archive.directory(config.outputPath+ "/" + id.appId, id.appId);
                });
            }
            // finalize the archive (ie we are done appending files but streams have to finish yet)
            archive.finalize();
        })
    }
};

module.exports = archive;

