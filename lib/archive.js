var fs = require('fs');
var path = require('path');
var archiver = require('archiver');
var config = require('../config/runtimeConfig');
var Promise = require("bluebird");


var archive = {
    createZip: function(id)
    {
        return new Promise(function(resolve, reject)
        {
            // create a file to stream archive data to.
            var output = fs.createWriteStream(config.outputPath + "/zips/" + id + ".zip");
            var archive = archiver('zip');

            // listen for all archive data to be written
            output.on('close', function() {
                console.log(archive.pointer() + ' total bytes');
                console.log('archiver has been finalized and the output file descriptor has closed.');
                var result =   {
                    fullPath: config.outputPath + "/zips/" + id + ".zip",
                    fileName: id + ".zip"
                };
                resolve(result);
            });

            // good practice to catch this error explicitly
            archive.on('error', function(err) {
                reject(err);
            });

            // pipe archive data to the file
            archive.pipe(output);

            // append files from a directory
            archive.directory(config.outputPath + "/" + id, id);

            // finalize the archive (ie we are done appending files but streams have to finish yet)
            archive.finalize();
        })
    }
};

module.exports = archive;

