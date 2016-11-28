var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var parseUrlencoded = bodyParser.urlencoded({extended: false});
var fs = require('fs');
var path = require('path');
var qrsInteract = require('./lib/qrsInstance');
var config = require('./config/runtimeConfig');
var backupApp = require('./lib/backupApp');

router.use('/lib', express.static(config.thisServer.pluginPath + "/sclite/lib"));
router.use('/data', express.static(config.thisServer.pluginPath + "/sclite/data"));

router.route("/dir")
.get(function(req, res)
{
    var _p;
    _p = path.resolve(__dirname, 'output');
    processReq(_p, res);
});

router.route("/backup/:id")
.post(function(req, res)
{
    backupApp.backupApp(req.params.id)
    .then(function(result)
    {
        res.send(result);
    })
});

router.route("/restore/:id")
.post(function(req, res)
{

});

router.route("/getAppList")
.get(function(req, res)
{
    var tableDef = JSON.parse(fs.readFileSync(config.thisServer.pluginPath + "/sclite/data/tableDef.json"));
    
    var columns = tableDef.columns.filter(function(item)
    {
        return item.columnType === "Property";
    });

    tableDef.columns = columns;

    qrsInteract.Post("app/table?filter=published eq true&orderAscending=true&skip=0&sortColumn=name", tableDef, "json")
    .then(function(result)
    {
        var s = JSON.stringify(result.body);
        res.send(s);
    })
    .catch(function(error)
    {
        res.send(error);
    });
});

module.exports = router;

function processReq(_p, res) {
    var resp = [];
    fs.readdir(_p, function(err, list) {
        for (var i = list.length - 1; i >= 0; i--) {
        resp.push(processNode(_p, list[i]));
        }
        res.json(resp);
    });
}
 
function processNode(_p, f) {
    var s = fs.statSync(path.join(_p, f));
    return {
        "id": path.join(_p, f),
        "text": f,
        "icon" : s.isDirectory() ? 'jstree-custom-folder' : 'jstree-custom-file',
        "state": {
        "opened": false,
        "disabled": false,
        "selected": false
        },
        "li_attr": {
        "base": path.join(_p, f),
        "isLeaf": !s.isDirectory()
        },
        "children": s.isDirectory()
    };
}