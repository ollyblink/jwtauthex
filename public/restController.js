app.controller("restController", function ($scope, $http, $window) {

    $scope.baseUrl = "http://localhost:3001";
    $scope.getDashboard = function () {
        var config = {
            headers: {
                'Authorization': $window.localStorage['jwtToken']
            }
        }
        $http.get($scope.baseUrl+"/dashboard", config).then(function (response) {
            $scope.data = response.data;
        });
    };
    $scope.getData = function () {
        var config = {
            headers: {
                'Authorization': $window.localStorage['jwtToken']
            }
        }
        $http.get($scope.baseUrl+"/spirometryData", config).then(function (response) {
            $scope.data = response.data;
        });
    };
    /**
    * Just a helper method to factorise some code in the register and authenticate methods.
    * */
    $scope.getPostRequest = function(url){
        console.log("post: "+  $scope.email + ", "+ $scope.password);
        var request = {
            method: "POST",
            url: $scope.baseUrl+"/"+url,

            data: {
                'email': $scope.email,
                'password': $scope.password
            }
        }
        return request;
    };

    //TODO Dont get it... now it doesn't work anymore. find out why
    $scope.register = function () {
        $http($scope.getPostRequest('register')).then(
            function (response) {//Success
                console.log("success");
                var s = response.data.success;
                var m = response.data.message;
                $scope.answer = "success: " + s + ", " + m;
                console.log($scope.answer);
            },
            function (response) {//Failed
                console.log("Failed");
                var s = response.data.success;
                var m = response.data.message;
                $scope.answer = "failed: " + s + ", " + m;
                console.log($scope.answer);
            }
        )
    }


    $scope.authenticate = function () {
        $http($scope.getPostRequest('authenticate')).then(
            function (response) {//Success
                var s = response.data.success;
                $window.localStorage['jwtToken'] = response.data.token; //Store the token in the local storage
                $scope.authAnswer = "success: " + s + ", " + $window.localStorage['jwtToken'];
            },
            function (response) {//Failed
                var s = response.data.success;
                var m = response.data.message;
                $scope.authAnswer = "failed: " + s + ", " + m;
            }
        )
    }

    $scope.logout = function(){
        $window.localStorage.removeItem('jwtToken');
    }
});