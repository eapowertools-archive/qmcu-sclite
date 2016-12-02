var decompress = require('decompress');
var config = require('../config/runtimeConfig');
var path = require('path');
var Promise = require('bluebird');

var foo = {
    extractFiles : function(src)
    {
        return new Promise(function(resolve, reject)
        {
            var dest = config.outputPath;
            decompress(src, dest)
            .then(function(files)
            {
                resolve(files);
            })
            .catch(function(error)
            {
                reject(error)
            });
        });  
    }
};

module.exports = foo;