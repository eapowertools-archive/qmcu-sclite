(function(){
    "use strict";
    var module = angular.module("QMCUtilities",["ngFileUpload","ngDialog"]);

    function fetchTableHeaders($http)
    {

        return $http.get("/sclite/data/tableDef.json")
            .then(function (response) {
                return response.data;
            });
    }
    
    function fetchTableRows($http) 
    {
        return $http.get('/sclite/getAppList')
            //return $http.get("data/testData.json")
            .then(function (response) {
                var updatedData = alterTableData(response);
                console.log(updatedData);
                return updatedData.data;
            });
    } 

    function alterTableData(response)
    {
        var newRows =[];
        response.data.rows.forEach(function(row)
        {
            if(row[4].substring(0,4)=="1753")
            {
                row[4] = null;
            }
            newRows.push(row);
        });
        response.data.rows = newRows;
        return response;

    }

    function fetchFolders($http)
    {
        return $http.get("/sclite/dir")
        .then(function(response)
        {
            return response.data;
        });
    }
    
    function fetchUserInfo($http)
    {
        return $http.get("/sclite/getuserinfo")
        .then(function(response)
        {
            return response.data;
        });
    }

    function backupApp($http, params)
    {
        if(params.createZip)
        {
            return exportZip($http, params)
            .then(function(response)
            {
                return response.data;
            })
            .catch(function(error)
            {
                return error;
            });
        }
        else
        {
            return $http.post("/sclite/backup", params)
            .then(function(response)
            {
                return response.data;
            })
            .catch(function(error)
            {
                return error;
            });
        }

    }

    function restoreApp($http, appId, boolZip, filePath, boolReload, owner)
    {
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
        })
        .catch(function(error)
        {
            return error;
        });
    }

    function exportZip($http, params) 
    {
        return $http.post('/sclite/backup', params, {responseType: 'arraybuffer'})
            .success(function (data, status, headers, config) {
                var zipBlob = new Blob([data], {type: 'application/zip'});
                // var jsonBlob = new Blob([JSON.stringify(data, null, " ") + '\n'], {
                //         type: "application/json;charset=utf-8;"
                //     });
                var fileName;
                if(params.appIds.length > 1)
                {
                    fileName = "allAppsBackup.zip";
                }
                else
                {
                    fileName = params.appIds[0] + ".zip";
                }
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
        model.showAll = false;
        model.fileToRestore = null;
        model.users = [];
        model.uploadButtonVal = "Upload File";
        model.modal = false;

        model.$onInit = function()
        {
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

        model.toggleUnpublished = function()
        {
            if(model.showAll)
            {
                model.showAll = false;
            }
            else
            {
                model.showAll = true;
            }
        }

        model.showUnpublished = function(published)
        {
            if(model.showAll)
            {
                return true;
            }
            else
            {
                if(published==null)
                {
                    return false;
                }
                else
                {
                    return true;
                }
            }
        }

        model.userSelect = function()
        {
            console.log(model.user);
        }

        model.cancel = function()
        {
            model.thisRow = [];
            model.zip = false;
            model.modal = false;
            model.boolUpload = false;
            model.boolReload = false;
            model.fileToRestore = null;
            model.user = null;
            model.file = [];
            model.fileUploaded = false;
            $("#selectUser option:eq(0)").prop('selected',true);
            ngDialog.closeAll();
            $scope.form.$setPristine();
            $scope.form.$setUntouched();
        }

        model.backup = function(row)
        {
            model.thisRow = row;
            ngDialog.open({
                template: "plugins/scLite/backup-dialog.html",
                className: "backup-dialog",
                controller: scLiteController,
                scope: $scope
            });
        }

        model.generateBackup = function()
        {
            backupApp($http, {appIds: [model.thisRow[1]], createZip: model.zip})
            .then(function(response)
            {
                //console.log(response);
                model.zip = false;
                return;    
            })
            .then(function()
            {
                // ngDialog.closeAll();
                // $scope.form.$setPristine();
                // $scope.form.$setUntouched();
            })
            .catch(function(error)
            {
                alert(error);
            })
            .finally(function()
            {
                model.zip = false;
                ngDialog.closeAll();
                $scope.form.$setPristine();
                $scope.form.$setUntouched();
            });
        }

        model.backupAll = function()
        {
            ngDialog.open({
                template: "plugins/scLite/backup-all-dialog.html",
                className: "backup-all-dialog",
                controller: scLiteController,
                scope: $scope
            });
        }

        model.generateBackupAll = function ()
        {
            model.modal = true;
            var appIds = []
            if(model.showAll)
            {
                //grab the appIds from the table and send them in body to the engine for backup
                appIds = model.tableRows.map(function(row)
                {
                    return row[1];
                });
            }
            else
            {
                appIds = model.tableRows.filter(function(row)
                {
                    return row[4]!==null
                })
                appIds = appIds.map(function(row)
                {
                    return row[1];
                });
            }
            
            backupApp($http, {appIds: appIds, createZip: model.zip})
            .then(function(response)
            {
                //console.log(response);
                model.zip = false;
                model.modal = false;
                return;
            })
            .then(function()
            {
                ngDialog.closeAll();
                $scope.form.$setPristine();
                $scope.form.$setUntouched();
            })
            .catch(function(error)
            {
                alert(error);
            })
            .finally(function()
            {
                model.zip = false;
                model.modal = false;
            });

        }

        model.checkZip = function()
        {
            if($("#checkZip:checked").length==1)
            {
                model.zip = true;
            }
            else
            {
                model.zip = false;
            }
        }

        model.checkUpload = function()
        {
            if($("#checkUpload:checked").length==1)
            {
                model.boolUpload = true;
            }
            else
            {
                model.boolUpload = false;
            }
        }

        model.checkReload = function() //not implemented
        {
            if($("#checkReload:checked").length==1)
            {
                model.boolReload = true;
            }
            else
            {
                model.boolReload = false;
            }
        }

        model.restore = function(row)
        {
            model.uploadButtonVal = "Upload File";
            model.thisRow = row;
            ngDialog.open({
                    template: "plugins/scLite/restore-dialog.html",
                    className: "restore-dialog",
                    controller: scLiteController,
                    scope: $scope
                });
        }

        model.generateRestore = function()
        {
            model.modal = true;
            restoreApp($http, model.thisRow[1], 
                model.boolUpload, model.fileToRestore, model.boolReload, model.user)
            .then(function(response)
            {
                // model.modal = false;
                // model.boolUpload = false;
                // model.boolReload = false;
                // model.fileUploaded = false;
                // model.fileToRestore = null;
                // model.user = null;
                // $("#selectUser option:eq(0)").prop('selected',true);
                return;
            })
            .then(function()
            {
                ngDialog.closeAll();
                $scope.form.$setPristine();
                $scope.form.$setUntouched();
            })
            .catch(function(error)
            {
                alert(error);
            })
            .finally(function()
            {
                model.modal = false;
                model.boolUpload = false;
                model.boolReload = false;
                model.fileUploaded = false;
                model.fileToRestore = null;
                model.user = null;
                $("#selectUser option:eq(0)").prop('selected',true);
            });
        }

        model.selectFile = function(files)
        {
                model.fileSelected=true;
                model.file = files;
        }

        model.upload = function()
        {
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
                model.fileToRestore = response.data.filePath;
                model.uploadButtonVal = "File Uploaded";
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