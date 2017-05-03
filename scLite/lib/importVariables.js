var Promise = require('bluebird');

module.exports = function importVariables(x, variables)
{
    return Promise.all(variables.variables.map(function(variable)
    {
        if(!variable.qIsScriptCreated)
        {
            return x.app.createVariableEx(variable)
            .then(function(result)
            {
            // console.log("created variable " + variable.qInfo.qId);
                return variable.qInfo.qId;
            })
        }
        else
        {
            return variable.qInfo.qId;
        }
    }))
    .then(function(variableIds)
    {
         //console.log(variableIds);
        return variableIds;
    })
    .catch(function(error){
        return error;
    });
};