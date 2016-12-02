var decompress = require('decompress');
var config = require('../config/runtimeConfig');
var path = require('path');


var decompress = {
    extractFiles : function(src)
    {
        var dest = config.outputPath;
        return decompress(src, dest)
        .then(function(files)
        {
            return files;
        });
    }
};

module.exports = decompress;