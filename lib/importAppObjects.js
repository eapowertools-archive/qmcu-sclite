var Promise = require('bluebird');

module.exports = function importAppObjects(x, objects)
{
    return Promise.all(objects.map(function(object)
    {
        return x.app.createObject(object.qProperty)
        .then(function(handle)
        {
            return handle.setFullPropertyTree(object)
            .then(function()
            {
                //console.log("added object "  + object.qProperty.qMetaDef.title);
                return object.qProperty.qInfo.qId;
            });
        });
    }))
    .then(function(objectIds)
    {
        return objectIds
    })
    .catch(function(error){
        return error;
    });
};