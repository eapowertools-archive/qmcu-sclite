var Promise = require('bluebird');

//TODO -- Review if associated dimension keeps its id.
//        Review if associated dimension keeps coloring -> colorMapRef property value




module.exports = function importColourMaps(x, colourmaps)
{
    return Promise.all(colourmaps.colourmaps.map(function(colourmap)
    {
        return x.app.createObject({
            qInfo: {
                qType: 'colorMap',
                qId: colourmap.qInfo.qId,
                colorMap: {}
            }
        })
        .then(function (colourMap) 
        {
            x.app.setProperties(colourMap)
        })
        .then(function(handle)
        {
            //console.log("Created Dimension " + dimension.qMetaDef.title)
            return colourmap.qInfo.qId
        })
    }))
    .then(function(colourMapIds)
    {
        return colourMapIds;
    })
    .catch(function(error){
        return error;
    });
};