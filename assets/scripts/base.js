


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
                if(($scope.page * 6) <= $scope.stats.total_count){
                    $scope.my.showMore = true
                }
                else{
                    $scope.my.showMore = false
                }
                $scope.$apply()
            }).error(function(data){
                console.log(data);
            });   
        }
        $scope.statChange()  
        $scope.my = {showMore: false}  

        $scope.hotels = []
        localStorage.setItem("likes",JSON.stringify({}))

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
                likes = JSON.parse(localStorage.getItem("likes"))
                for(var i=0; i<data.length; i++){
                    if(data[i]["id"] in likes){
                        data[i]["likes"] = likes[data[i]["id"]]
                    }
                    else{
                        data[i]["likes"] = 0
                        likes[parseInt(data[i]["id"])] = 0
                    }
                    $scope.hotels.push(data[i])
                }
                localStorage.setItem("likes",JSON.stringify(likes))
                if($scope.stats !== undefined){
                    if(($scope.page * 6) <= $scope.stats.total_count){
                        $scope.my.showMore = true
                    }
                    else{
                        $scope.my.showMore = false
                    }
                    $scope.$apply()
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
        
        $scope.onSort = function(value){
            if(value != "likes"){
                $scope.hotels = []
                $scope.page = 1
                $scope.getList()
                $scope.statChange()
            }
            else{
                function compare(a,b) {
                  if (a.likes < b.likes)
                    return 1;
                  if (a.likes > b.likes)
                    return -1;
                  return 0;
                }
                $scope.hotels.sort(compare);
            }
        }
        
        $scope.onArea = function(location){
            $scope.query = location
            $scope.hotels = []
            $scope.page = 1
            $scope.getList()
            $scope.statChange()
        }
        
        $scope.onLike = function(id,index){
            id = parseInt(id)
            index = parseInt(index)
            console.log(id)
            console.log(index)
            $scope.hotels[index]["likes"] = $scope.hotels[index]["likes"]+1
            likes = JSON.parse(localStorage.getItem("likes"))
            likes[id] = likes[id]+1
            localStorage.setItem("likes",JSON.stringify(likes))
        }
}]);     




