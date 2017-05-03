var decompress = require('decompress');
var config = require('../config/runtimeConfig');
var path = require('path');

var src = path.join(config.outputPath,"zips") + "/831bc2ea-a43b-46f7-9ad2-d843cb9c4764.zip";
var dest = config.outputPath;
decompress(src, dest)
.then(function(files)
{
    files.forEach(function(file)
    {
        console.log(file.path)
    })
    console.log("done");
})