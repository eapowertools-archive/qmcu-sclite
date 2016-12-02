(function(){
    "use strict";
    var module = angular.module("QMCUtilities",["ngFileUpload","ngDialog"]);

    function fetchTableHeaders($http) {
        return $http.get("/sclite/data/tableDef.json")
            .then(function (response) {
                return response.data;
            });
    }
    
    function fetchTableRows($http) {
        return $http.get('/sclite/getAppList')
            //return $http.get("data/testData.json")
            .then(function (response) {
                return response.data;
            });
    } 

    function fetchFolders($http){
        return $http.get("/sclite/dir")
        .then(function(response)
        {
            return response.data;
        });
    }

    function fetchOwner($http, userInfo){
        return $http.get("/sclite/getOwnerId/" + userInfo.userDirectory + "/" + userInfo.userId)
        .then(function(response)
        {
            return response.data;
        });
    }
    
    function fetchUserInfo($http){
        return $http.get("/sclite/getuserinfo")
        .then(function(response)
        {
            console.log(response.data);
            return response.data;
        });
    }

    function backupApp($http, appId, boolZip){
        if(boolZip)
        {
            return exportZip($http, appId, boolZip)
            .then(function(response)
            {
                return response.data;
            });
        }
        else
        {
            return $http.post("/sclite/backup/" + appId, boolZip)
            .then(function(response)
            {
                return response.data;
            });
        }

    }

    function restoreApp($http, appId, boolZip, filePath, boolReload, owner){
        var body = {
            appId : appId,
            boolZip : boolZip,
            filePath : filePath,
            boolReload : boolReload,
            owner: owner
        };
        return $http.post("/sclite/restore", body)
        .then(function(response)
        {
            console.log(response);
            return response.data
        });
    }

    function exportZip($http, appId, createZip) {
        return $http.post('/sclite/backup/' + appId, createZip, {responseType: 'arraybuffer'})
            .success(function (data, status, headers, config) {
                var zipBlob = new Blob([data], {type: 'application/zip'});
                // var jsonBlob = new Blob([JSON.stringify(data, null, " ") + '\n'], {
                //         type: "application/json;charset=utf-8;"
                //     });
                var fileName = appId + ".zip";
                if (window.navigator.msSaveOrOpenBlob) {
                    // IE hack; see http://msdn.microsoft.com/en-us/library/ie/hh779016.aspx
                    window.navigator.msSaveBlob(zipBlob, fileName);
                } else {
                    var url = URL.createObjectURL(zipBlob);
                    var link = document.createElement('a');
                    document.body.appendChild(link);
                    link.href = url;
                    link.download = fileName;
                    link.target = '_blank';
                    link.click();
                }
            })
            .error(function (data, status, headers, config) {
                console.log(status);
            });
    }

    function scLiteController($scope, $http, ngDialog, Upload)
    {
        var model = this;
        var colNames = [];
        model.columnNames = [];
        model.tableRows = [];
        model.outputs = [];
        model.searchApps = '';
        model.thisRow = [];
        model.folders = [];
        model.zip = false;
        model.boolUpload = false;
        model.boolReload = false;
        model.file = [];
        model.fileUploaded = false;
        //model.fileToRestore = null;
        model.users = [];

        model.$onInit = function(){
            fetchTableHeaders($http)
            .then(function(table){
                model.columnNames = table.columns;
            })
            .then(function(){
                fetchTableRows($http).then(function (response) {
                    model.tableRows = response.rows;
                    // for (var index = 0; index < model.tableRows.length; index++) {
                    //     model.tableRows[index].unshift(false);
                    // }
                });
            });
             fetchUserInfo($http)
            .then(function(response)
            {
                model.users = response;
            });
        };

        model.userSelect = function(){
            
            console.log(model.user);
        }

        model.cancel = function(){
            model.thisRow = [];
            model.zip = false;
            model.boolUpload = false;
            ngDialog.closeAll();
        }

        model.backup = function(row){
            model.thisRow = row;
            ngDialog.open({
                template: "plugins/scLite/backup-dialog.html",
                className: "backup-dialog",
                controller: scLiteController,
                scope: $scope
            });
        }

        model.checkZip = function(){
            if($("#checkZip:checked").length==1)
            {
                model.zip = true;
            }
            else
            {
                model.zip = false;
            }
        }

        model.checkUpload = function(){
            if($("#checkUpload:checked").length==1)
            {
                model.boolUpload = true;
            }
            else
            {
                model.boolUpload = false;
            }
        }

        model.checkReload = function(){
            
            if($("#checkReload:checked").length==1)
            {
                model.boolReload = true;
            }
            else
            {
                model.boolReload = false;
            }
        }

        model.generateBackup = function(){
            backupApp($http, model.thisRow[1], {createZip: model.zip})
            .then(function(response)
            {
                //console.log(response);
                model.zip = false;
                ngDialog.closeAll();
            })
        }

        model.restore = function(row){
            model.thisRow = row;
            ngDialog.open({
                    template: "plugins/scLite/restore-dialog.html",
                    className: "restore-dialog",
                    controller: scLiteController,
                    scope: $scope
                });
        }

       model.selectFile = function(files){
            model.fileSelected=true;
            console.log(files);
            //return model.file = files;
            model.file = files;
        }

        model.upload = function(){
            Upload.upload({
                url:"/sclite/upload",
                data:
                {
                    file: model.file
                },
                arrayKey: ''
            })
            .then(function(response)
            {
                //expose file to ui
                model.file = [];
                model.fileSelected = false;
                model.fileUploaded = true;
                console.log(response);
                model.fileToRestore = response.data.filePath;

            })
        }

        model.generateRestore = function(){
            
            restoreApp($http, model.thisRow[1], 
                model.boolUpload, model.fileToRestore, model.boolReload, model.user)
            .then(function(response)
            {
                console.log(response)
            });
        }
    }

    module.component("scliteBody", {
        templateUrl:"plugins/sclite/sclite-body.html",
        controllerAs: "model",
        controller: ["$scope", "$http", "ngDialog", "Upload", scLiteController]
    });

    module.filter('highlight', function () {
        return function (text, search) {
            if (text && search) {
                text = text.toString();
                search = search.toString();
                return text.replace(new RegExp(search, 'gi'), '<span class="lui-texthighlight">$&</span>');
            } 
            else
            {
                return text;
            }
        }
    });

}());