angular.module('MyApp')

    .controller('searchCtrl', function($scope,$http) {

 $http.get('http://localhost:3000/retrive').success(function(result) {
            if(result){
             console.log(result)
             var as=[]
             as.push(result)
             $scope.data=as;

          }
          else{
              console.log('error');
          }
          
            // $location.path('project')  ;
        })

        $scope.find=function(){
          var gameName={'url':this.name};
          

          //sending game name to server
          $http.post('http://localhost:3002/game',gameName).success(function(data){
          if(data){
             console.log(data)
             var as=[]
             as.push(data)
             $scope.data=as;

          }
          else{
              console.log('error');
          }

          })

        }

    })