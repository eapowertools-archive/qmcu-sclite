var qrsInteract = require('./qrsInstance');
var Promise = require('bluebird');

var changeOwner = {
    changeOwner : function(type, objId, ownerId, endpoint)
    {
        return new Promise(function(resolve, reject)
        {
            var x = {};
            var body = {
                "items": [
                    {
                        "type": type,
                        "objectID": objId
                    }
                ]
            };
            var postPath = "/selection";
            return qrsInteract.Post(postPath, body,'json')
            .then(function(selection)
            {
                x.selectionId = selection.body.id;
                var body =
                {
                    "latestModifiedDate": buildModDate(),
                    "type": type,
                    "properties": [{
                        "name": "owner",
                        "value": ownerId,
                        "valueIsDifferent": false,
                        "valueIsModified": true
                    }]
                };

                var putPath = "/selection/" + x.selectionId + "/" + endpoint + "/synthetic";
                return qrsInteract.Put(putPath, body)
                .then(function(sCode)
                {
                    return sCode.statusCode;
                });
            })
            .then(function(sCode)
            {
                if(sCode==204)
                {
                    var deletePath = "/selection/" + x.selectionId;
                    return qrsInteract.Delete(deletePath)
                    .then(function(result)
                    {
                        resolve("yay");
                    })
                    .catch(function(error)
                    {
                        reject(error);
                    })
                }
            })
            .catch(function(error)
            {
                reject(error);
            });
        });
    }
}

module.exports= changeOwner;

function buildModDate() {
    var d = new Date();
    return d.toISOString();
}
