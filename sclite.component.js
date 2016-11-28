(function(){
    "use strict";
    var module = angular.module("QMCUtilities",["ngDialog"]);

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

    function fetchFolders($http)
    {
        return $http.get("/sclite/dir")
        .then(function(response)
        {
            return response.data;
        });
    }
    
    function backupApp($http, appId)
    {
        return $http.post("/sclite/backup/" + appId)
        .then(function(response)
        {
            return response.data;
        });
    }

    function exportRules($http, ruleIds) {
        return $http.post('/rulemanager/exportRules', ruleIds)
            .success(function (data, status, headers, config) {
                var jsonBlob = new Blob([JSON.stringify(data, null, " ") + '\n'], {
                        type: "application/json;charset=utf-8;"
                    });
                var fileName = "exported-rules.json";
                if (window.navigator.msSaveOrOpenBlob) {
                    // IE hack; see http://msdn.microsoft.com/en-us/library/ie/hh779016.aspx
                    window.navigator.msSaveBlob(jsonBlob, fileName);
                } else {
                    var url = URL.createObjectURL(jsonBlob);
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

    function scLiteController($scope, $http, ngDialog)
    {
        var model = this;
        var colNames = [];
        model.columnNames = [];
        model.tableRows = [];
        model.outputs = [];
        model.searchApps = '';
        model.thisRow = [];
        model.folders = [];

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
        };

        model.cancel = function()
        {
            ngDialog.closeAll();
        }

        model.backup = function(row)
        {
            model.thisRow = row;
            backupApp($http, row[1])
            .then(function(response)
            {
                console.log(response);
            });
            // fetchFolders($http)
            // .then(function(response)
            // {
            //     model.folders = response.filter(function(item)
            //         {
            //             return item.children;
            //         });
            // });
            // ngDialog.open({
            //     template: "plugins/scLite/backup-dialog.html",
            //     className: "backup-dialog",
            //     controller: scLiteController,
            //     scope: $scope
            // });
        }

        model.restore = function(row)
        {
            model.thisRow = row;
            ngDialog.open({
                template: "plugins/scLite/restore-dialog.html",
                className: "restore-dialog",
                controller: scLiteController,
                scope: $scope
            });
        }


    }

    module.component("scliteBody", {
        templateUrl:"plugins/sclite/sclite-body.html",
        controllerAs: "model",
        controller: ["$scope", "$http", "ngDialog", scLiteController]
    });

    module.filter('highlight', function () {
        return function (text, search) {
            if (text && search) {
                text = text.toString();
                search = search.toString();
                return text.replace(new RegExp(search, 'gi'), '<span class="lui-texthighlight">$&</span>');
            } else {
                return text;
            }

        }

    });

}());