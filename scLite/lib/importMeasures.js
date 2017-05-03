var Promise = require('bluebird');

module.exports = function importMeasures(x, measures)
{
    return Promise.all(measures.measures.map(function(measure)
    {
        return x.app.createMeasure(measure)
        .then(function(handle)
        {
           // console.log("Created Measure " + measure.qMetaDef.title)
            return measure.qInfo.qId
        })
    }))
    .then(function(measureIds)
    {
        return measureIds;
    })
    .catch(function(error){
        return error;
    });
};