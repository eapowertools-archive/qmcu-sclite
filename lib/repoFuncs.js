var qrsInteract = require('./qrsInstance');
var Promise = require('bluebird');
var config = require('./config/testConfig');

var repoFuncs = {
    changeOwner : function(repoIds, ownerId)
    {
        
        var x = {};
        var body = createBody(repoIds,"App.Object");
            console.log(body);
        
        var postPath = "/selection";
        return qrsInteract.Post(postPath, body,'json')
        .then(function(selection)
        {
            x.selectionId = selection.body.id;
            var body =
            {
                "latestModifiedDate": buildModDate(),
                "type": "App.Object",
                "properties": [{
                    "name": "owner",
                    "value": ownerId,
                    "valueIsDifferent": false,
                    "valueIsModified": true
                }]
            };

            var putPath = "/selection/" + x.selectionId + "/app/object/synthetic";
            return qrsInteract.Put(putPath, body)
            .then(function(sCode)
            {
                console.log(sCode);
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
                    return "yay";
                })
                .catch(function(error)
                {
                    return error;
                })
            }
        })
        .catch(function(error)
        {
            return error;
        });
    },
    getRepositoryIds: function(appId, objectCount)
    {
            return repoFuncs.count(appId)
            .then(function(count)
            {
                console.log(count + "===" + objectCount);
                if(count==objectCount)
                {
                    var path = "app/object/full?filter=(owner.userId eq '" + config.qrs.repoAccountUserId + "' and owner.userDirectory eq '";
                    path += config.qrs.repoAccountUserDirectory + "') and (app.id eq " + appId +")";
                    return qrsInteract.Get(path)
                    .then(function(result)
                    {
                        var repoIds =[];
                        repoIds = result.body.map(function(item)
                        {
                            return item.id;
                        });
                        return repoIds;
                    })
                    .catch(function(error)
                    {
                        return error;
                    });
                }
                else
                {
                    return repoFuncs.getRepositoryIds(appId, objectCount)
                }
            })
            .catch(function(error)
            {
                reject(error);
            });
    },
    count : function(appId)
    {
        return new Promise(function(resolve, reject)
        {
            var path = "/app/object/count";
            path += "?filter=owner.userId eq '" + config.qrs.repoAccountUserId + "' and owner.userDirectory eq '";
            path += config.qrs.repoAccountUserDirectory + "' and (app.id eq " + appId + ")";
            return qrsInteract.Get(path)
            .then(function(result)
            {
                resolve(result.body.value);
            })
        })
    }
}

module.exports= repoFuncs;

function buildModDate() {
    var d = new Date();
    return d.toISOString();
}

function createBody(arrObjects, type) {
    
    var resultArray = [];
    
    resultArray = arrObjects.map(function(item)
    {
        var object = {
            "type": type,
            "objectID": item
        };
        return object; 
    });

    var result = {
        "items": resultArray
    }; 
    return result;
}

