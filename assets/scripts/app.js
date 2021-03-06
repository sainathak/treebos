


var mainApp = angular.module('mainApp', [
    'ngRoute',
    'ngCookies',
    'ngResource',
    'xeditable',
    'ui.bootstrap',
    'ngAnimate',
    'ngSanitize',
    'angular-growl',
    'ngAnimate',
]);


/* mainApp Module Configuration */
mainApp.config(['$interpolateProvider','$httpProvider',
    function($interpolateProvider,$httpProvider) {
        $interpolateProvider.startSymbol('{[');
        $interpolateProvider.endSymbol(']}');
        $httpProvider.defaults.headers.post['Content-Type'] = 'application/json'; //required for json web services
        //$httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded'; //required for django 
        $httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
}]);


mainApp.run(['$http','$cookies','editableOptions',
    function($http, $cookies,editableOptions) {
        $http.defaults.headers.post['X-CSRFToken'] = $cookies.csrftoken;
        $http.defaults.xsrfCookieName = 'csrftoken';
        $http.defaults.xsrfHeaderName = 'X-CSRFToken';
        editableOptions.theme = 'bs3';
}]);

/* mainApp Generic Constants */

mainApp.constant("exInObj", function(exkey,obj){
    for(var key in obj){
        if(key===exkey){
            return true;
        }
    }
    return false;
});

mainApp.constant("loadTemplate", function(staticLink,templateDir,templatePath){
    return staticLink+templateDir+templatePath;
});

mainApp.constant("waitForResponse", function(data){
    if(data['type'] == "add"){
        //add loading symbol
        // alert("running..");
        document.getElementById('loading').className += " active";
        document.getElementsByTagName('body')[0].className+= " loading";        
    }
    if(data['type'] == "remove"){
        //remove loading symbol
        if(data['status'] == "success"){
            // alert("success");
            document.getElementById("loading").classList.remove("active");
            document.getElementsByTagName('body')[0].classList.remove("loading");
        }
        else{
            // alert("fail");
            document.getElementById("loading").classList.remove("active");
            document.getElementsByTagName('body')[0].classList.remove("loading");
        }
    }
});

mainApp.constant("getByKey", function(data, key, val){
    if(data && data.length > 0){
        var iter, output = [];
        for(iter = 0; iter < data.length; iter++){
            if(data[iter].hasOwnProperty(key)){
                console.log(key, val);
                if(data[iter][key] == val){
                    output.push(data[iter]);
                }
            }
        }
        return output;
    }
});


mainApp.directive('ngScript',['djangoConstants','loadTemplate',
    function(djangoConstants,loadTemplate) {
        return {
            restrict: 'E',
            scope: false,
            link: function(scope, elem, attr){
                if (attr.type==='text/javascript'){
                    var s = document.createElement("script");
                    s.type = "text/javascript";
                    var src = elem.attr('src');
                    var script = djangoConstants['staticLink']+src;
                    if(src!==undefined){
                        s.src = script;
                    }
                    else{
                        var code = elem.text();
                        s.text = code;
                    }
                    document.head.appendChild(s);
                    elem.remove();
                }
            }
        };
}]);


/* mainApp Generic Services */
mainApp.provider('dynamicRoutes',['appConstants','djangoConstants','urlRoutes','loadTemplate','exInObj','loadTemplate',
    function(appConstants,djangoConstants,urlRoutes,loadTemplate,exInObj,loadTemplate){
        var staticLink=djangoConstants['staticLink'];
        var templateDir=appConstants['templateDir'];
        this.$get=function(){
            return {
                resolveRoutes : function(){
                    var resolvedRoutes=[];
                    angular.forEach(urlRoutes,function(route){
                        if(exInObj('templatePath',route)){
                            route['templatePath'] = loadTemplate(staticLink,templateDir,route['templatePath']);
                        }
                        resolvedRoutes.push(route);
                    });
                    return resolvedRoutes;
                }
            }
        };
}]);


mainApp.factory('Constants',['djangoConstants','appConstants',
    function(djangoConstants,appConstants){
        var constants = {};
        angular.extend(constants, appConstants);
        angular.extend(constants, djangoConstants); 
        return {
            get: function(key) {
                return constants[key];
            },
            all: function() {
                return constants;
            }
        };
}]);

mainApp.factory('Template',['Constants','loadTemplate',
    function(Constants){
        var staticLink = Constants.get('staticLink');
        var templateDir = Constants.get('templateDir');
        return {
            get: function(templatePath) {
                return loadTemplate(staticLink,templateDir,templatePath);
            }
        };
}]);

mainApp.factory('transformRequestAsFormPost',[
    function(djangoConstants,appConstants){
        function transformRequest( data, getHeaders ) {
            var headers = getHeaders();
            if("Content-Type" in headers){
                headers["Content-Type"] = null;
                delete headers["Content-Type"];
            }
            headers["Content-Type"] = "application/x-www-form-urlencoded; charset=utf-8";             
            return(serializeData(data));         
        }
        return(transformRequest);
        function serializeData( data ) {         
            if (!angular.isObject(data)) {             
                return((data == null) ? "" : data.toString() );             
            }         
            var buffer = [];             
            for (var name in data) {             
                if (!data.hasOwnProperty(name)) {                 
                    continue;             
                }         
                var value = data[name];         
                buffer.push(encodeURIComponent(name) +"=" +encodeURIComponent((value == null) ? "" : value ));         
            }
            var source = buffer.join("&").replace(/%20/g, "+" );         
            return(source);         
        }
}]);

/* mainApp Generic Controller */

mainApp.controller('mainController',['$scope','Constants',
    function($scope,Constants){
        $scope.staticPath = Constants.get('staticLink');
        $scope.loadStatic = function(assetPath){
            return Constants.get('staticLink')+assetPath;
        };
        $scope.loadImage = function(assetPath){
            return Constants.get('staticLink')+Constants.get('imageDir')+assetPath;
        };
}]);

/* mainApp Generic Router */



/* mainApp Generic Router */

mainApp.config(['$injector','$routeProvider','$locationProvider','dynamicRoutesProvider','exInObj',
    function($injector,$routeProvider,$locationProvider,dynamicRoutes,exInObj) {
        var routes=dynamicRoutes.$get().resolveRoutes();
        angular.forEach(routes,function(dynamicRoute){
            if(exInObj('redirectTo',dynamicRoute)){
                $routeProvider.when(dynamicRoute['path'],{
                    redirectTo : dynamicRoute['redirectTo']
                });
            }
            else if(exInObj('templatePath',dynamicRoute)){
                if(exInObj('controller',dynamicRoute)){
                    $routeProvider.when(dynamicRoute['path'],{
                        templateUrl : dynamicRoute['templatePath'],
                        controller : dynamicRoute['controller']
                    });
                }
                else{
                    $routeProvider.when(dynamicRoute['path'],{
                        templateUrl : dynamicRoute['templatePath']
                    });
                }
            }
        });
        $routeProvider.otherwise({redirectTo: '/'});
        $locationProvider.hashPrefix('!');
        $locationProvider.html5Mode(true);
}]);