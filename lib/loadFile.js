var fs = require('fs');
var jsonFile = require('jsonfile');


module.exports = function(path)
{
    return jsonFile.readFileSync(path);
}
