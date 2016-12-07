var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var parseUrlencoded = bodyParser.urlencoded({extended: false});
var fs = require('fs');
var path = require('path');
var qrsInteract = require('./lib/qrsInstance');
var config = require('./config/runtimeConfig');
var backupApp = require('./lib/backupApp');
var restoreApp = require('./lib/restoreApp');
var archive = require('./lib/archive');
var multer = require('multer');
var autoReap = require('multer-autoreap');
var decompress = require('./lib/decompress');
var Promise = require('bluebird');

var winston = require('winston');
require('winston-daily-rotate-file');

//set up logging
  var logger = new (winston.Logger)({
    level: config.logging.logLevel,
    transports: [
        new (winston.transports.Console)(),
        new (winston.transports.DailyRotateFile)({ filename: config.logging.logPath + "qmcu-sclite.log", prepend:true})
      ]
  });

logger.info("qmcu-sclite logging started");

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

router.route("/backup")
.post(function(req, res)
{
    logger.info("Commencing backup process", {module:'sclite-routes', method:'backup'});
    var body = req.body;
    Promise.map(body.appIds, (function(appId)
    {
        return backupApp.backupApp(appId)
        .then(function(result)
        {
            return result;
        });      
    }))
    .then(function(resultArray)
    {
        logger.info("Backup(s) complete", {module:'sclite-routes', method:'backup'});
        console.log(resultArray);
        if(body.createZip)
        {
            logger.info("Zip files requested", {module:'sclite-routes', method:'backup'});
            return archive.createZip(resultArray)
            .then(function(archiveResult)
            {
                res.setHeader('Content-disposition', 'attachment; filename=' + archiveResult.fileName);
                res.setHeader('Content-Type', 'application/zip');
                res.setHeader('Transfer-Encoding', 'chunked');
                return res.download(archiveResult.fullPath, archiveResult.fileName, function(error)
                {
                    if(!error)
                    {
                        logger.info("Backup process complete", {module:'sclite-routes', method:'backup'});
                        logger.info("Spawning download of zip archive", {module:'sclite-routes', method:'backup'});
                        logger.info("yay team", {module:'sclite-routes', method:'backup'});
                    }
                });
            });
        }
        else
        {
            logger.info("Backup process complete", {module:'sclite-routes', method:'backup'});
             res.send(resultArray);
        }
    });
});

router.route("/restore")
.post(parseUrlencoded, function(req, res)
{
    logger.info("Commencing Restore process", {module:'sclite-routes', method:'restore'});
    var body = req.body;
    if(body.boolZip)
    {
        logger.info("A zip file (" + body.filePath + ") has been uploaded for restore", {module:'sclite-routes', method:'restore'});
        //decompress here
        decompress.extractFiles(body.filePath)
        .then(function(fileName)
        {
            console.log(body.filePath);
            var appFileName = fileName;
            var appLocation = path.join(config.outputPath, fileName);
            console.log(appLocation)
            logger.info("Commencing Restore process on " + body.appId + "to owner " + body.owner, {module:'sclite-routes', method:'restore'});
            restoreApp.restoreApp(appLocation,body.owner,body.boolReload)
            .then(function(result)
            {
                logger.info("App has been restored.  Here is the result::" + JSON.stringify(result), {module:'sclite-routes', method:'restore'});
                console.log(result);
                res.json(result);
            });
        });
    }
    else
    {
        logger.info("Commencing Restore process on " + body.appId + "to owner " + body.owner, {module:'sclite-routes', method:'restore'});
        restoreApp.restoreApp(path.join(config.outputPath, body.appId),body.owner,body.boolReload)
        .then(function(result)
        {
            console.log(result);
            res.json(result);
        });
    }
});

var destDir = path.join(config.thisServer.pluginPath, "sclite/uploads/");
var upload = multer({ dest: destDir});
router.post('/upload', upload.array('file', 1) , function (req, res) 
{
  // req.file is the `avatar` file
  // req.body will hold the text fields, if there were any
 //console.log("Iam files");
  //console.log(req.files);
logger.info("Uploading file " + req.files[0], {module:'sclite-routes', method:'upload'});
  console.log(req.files[0]);
  	fs.readFile(req.files[0].path, function(err, data)
    {
        var newPath = path.join(config.thisServer.pluginPath,"sclite/output/zips/", req.files[0].originalname)
        console.log(newPath);
        fs.writeFile(newPath, data, function(err)
        {
            if(err)
            {
                logger.error(err, {module:'sclite-routes', method:'upload'});
                console.log(err);
                // res.on('autoreap', function(reapedFile)
                // {
                //     console.log('reap file: ' + reapedFile);
                // });
                res.send("<h1>ERROR</h1><br><p>" + err + "</p>");
            }
            else{
                logger.info("File Saved to " + newPath, {module:'sclite-routes', method:'upload'});
                console.log("File Saved to " + newPath);
                res.on('autoreap', function(reapedFile)
                {
                   logger.info("temp upload file removed", {module:'sclite-routes', method:'upload'});
                    console.log(reapedFile);
                });
                res.send({filePath: newPath, message: req.files[0].originalname + "uploaded and ready to restore"});
                res.end();
                
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

    qrsInteract.Post("app/table?orderAscending=true&skip=0&sortColumn=name", tableDef, "json")
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

router.route("/getuserinfo")
.get(function(req,res)
{
    var path = "user/full";
    qrsInteract.Get(path)
    .then(function(result)
    {
        res.json(result.body);
    })
})

router.route("/getOwnerId/:userDirectory/:userId")
.get(function(req,res)
{
    var path = "user?filter=(userDirectory eq '" 
        + req.params.userDirectory 
        + "') and (userId eq '" 
        + req.params.userId + "')";

    qrsInteract.Get(path)
    .then(function(result)
    {
        res.send(result.body[0].id);
    });
})

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