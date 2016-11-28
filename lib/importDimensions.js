var Promise = require('bluebird');


module.exports = function importDimensions(x, dimensions)
{
    return Promise.all(dimensions.dimensions.map(function(dimension)
    {
        return x.app.createDimension(dimension)
        .then(function(handle)
        {
            //console.log("Created Dimension " + dimension.qMetaDef.title)
            return dimension.qInfo.qId
        })
    }))
    .then(function(dimensionIds)
    {
        return dimensionIds;
    })
    .catch(function(error){
        return error;
    });
};