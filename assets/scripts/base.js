


mainApp.constant("appConstants", {
    'homePath': '/',
    'loginPath': '/login/',
    'templateDir' : 'partials/',
    'imageDir' : 'images/',
});

/* Partial Routes */
mainApp.constant("urlRoutes", [
    {'path':'/','templatePath':'home.html','controller':'homeController'},
]);

//Filters
mainApp.filter('range', function() {
    return function(input, total) {
        total = parseInt(total);
        for (var i=0; i<total; i++)
            input.push(i);
        return input;
    };
});

mainApp.controller('baseController',['$scope','Constants','$location','growl','$http','$timeout','djangoConstants','transformRequestAsFormPost','$routeParams',
    function($scope,Constants,$location,growl,$http,$timeout,djangoConstants,transformRequestAsFormPost,$routeParams){ 


}]);  

mainApp.controller('homeController',['$scope','Constants','$location','growl','$http','$timeout','djangoConstants','transformRequestAsFormPost','$routeParams',
    function($scope,Constants,$location,growl,$http,$timeout,djangoConstants,transformRequestAsFormPost,$routeParams){ 
        
        $scope.statChange = function(){
            var options1 = {
                'method': 'GET',
                'url': '/stats/'
            };

            $http(options1).success(function(data){
                $scope.stats = data;
            }).error(function(data){
                console.log(data);
            });   
        }
        $scope.statChange()     

        $scope.hotels = []

        $scope.page = 1
        $scope.sortBy = "rating"
        $scope.getList = function(){
            url = "/list/?page="+$scope.page+"&sortBy="+$scope.sortBy
            if($scope.query != undefined && $scope.query != ""){
                url = url+"&query="+$scope.query
            }
            var options2 = {
                'method': 'GET',
                'url': url
            };
            $http(options2).success(function(data){
                for(var i=0; i<data.length; i++){
                    $scope.hotels.push(data[i])
                }
            }).error(function(data){
                console.log(data);
            });
        }
        $scope.getList() 

        $scope.showMore = function(){
            $scope.page = $scope.page + 1
            $scope.getList()
            $scope.statChange() 
        }
        
        $scope.onQuery = function(){
            $scope.hotels = []
            $scope.page = 1
            $scope.getList()
            $scope.statChange()
        }
        
        $scope.onSort = function(){
            $scope.hotels = []
            $scope.page = 1
            $scope.getList()
            $scope.statChange()
        }
}]);     




