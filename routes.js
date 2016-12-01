var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var parseUrlencoded = bodyParser.urlencoded({extended: false});
var fs = require('fs');
var path = require('path');
var qrsInteract = require('./lib/qrsInstance');
var config = require('./config/runtimeConfig');
var backupApp = require('./lib/backupApp');
var archive = require('./lib/archive');
var multer = require('multer');
var autoReap = require('multer-autoreap');

router.use('/lib', express.static(config.thisServer.pluginPath + "/sclite/lib"));
router.use('/data', express.static(config.thisServer.pluginPath + "/sclite/data"));
router.use('/output', express.static(config.thisServer.pluginPath + "/sclite/output"));
router.use(autoReap);
autoReap.options.reapOnError= true;

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
    var body = req.body;
    backupApp.backupApp(req.params.id)
    .then(function(result)
    {
        if(body.createZip)
        {
            return archive.createZip(req.params.id)
            .then(function(archiveResult)
            {
                res.setHeader('Content-disposition', 'attachment; filename=' + archiveResult.fileName);
                res.setHeader('Content-Type', 'application/zip');
                res.setHeader('Transfer-Encoding', 'chunked');
                return res.download(archiveResult.fullPath, archiveResult.fileName, function(error)
                {
                    if(!error)
                    {
                        console.log("yay team");
                    }
                });
            });
        }
        else
        {
            res.send(result);
        }
    });
});

router.route("/backup/all")
.post(function(req, res)
{
    //add code for looping through all apps and backing them up.
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

var destDir = path.join(config.thisServer.pluginPath, "sclite/uploads/");
var upload = multer({ dest: destDir});
router.post('/upload', upload.array('file', 1) , function (req, res) 
{
  // req.file is the `avatar` file
  // req.body will hold the text fields, if there were any
 //console.log("Iam files");
  //console.log(req.files);

  console.log(req.files[0]);
  	fs.readFile(req.files[0].path, function(err, data)
    {
        var newPath = path.join(config.thisServer.pluginPath,"sclite/output/zips/", req.files[0].originalname)
        console.log(newPath);
        fs.writeFile(newPath, data, function(err)
        {
            if(err)
            {
                console.log(err);
                // res.on('autoreap', function(reapedFile)
                // {
                //     console.log('reap file: ' + reapedFile);
                // });
                res.send("<h1>ERROR</h1><br><p>" + err + "</p>");
            }
            else{
                console.log("File Saved to " + newPath);
                res.on('autoreap', function(reapedFile)
                {
                    console.log('reap file: ' + reapedFile);
                });
                res.send({filePath: newPath, message: req.files[0].originalname + "uploaded and ready to restore"});
            }

        });
    });
	

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