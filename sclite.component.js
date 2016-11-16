(function(){
    "use strict";
    var module = angular.module("QMCUtilities");

    
    
    
    
    module.component("scliteBody", {
        templateUrl:"plugins/sclite/sclite-body.html",
        controllerAs: "model",
        controller: ["$http", scliteController]
    });


}());