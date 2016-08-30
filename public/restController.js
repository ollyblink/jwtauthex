app.controller("restController", function ($scope, $http) {

    $scope.token = null;
    $scope.getDashboard = function () {
        var config = {
            headers: {
                'Authorization': $scope.token
            }
        }
        $http.get("http://localhost:3001/dashboard", config).then(function (response) {
            $scope.data = response.data;
        });
    };

    $scope.register = function () {
         var data = {
            'email': $scope.email,
            'password': $scope.password
        }

        var config = {
                'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
        }
        $http.post("http://localhost:3001/register", data, config).then(
            function (response) {
                //Success
                var s = response.data.success;
                var m = response.data.message;
                $scope.answer = "success: " + s + ", " + m;
            },
            function (response) {
                //Failed
                var s = response.data.success;
                var m = response.data.message;
                $scope.answer = "failed: " + s + ", " + m;
            }
        )
    }
    $scope.authenticate = function () {
        var data = {
            'email': $scope.email,
            'password': $scope.password
        }

        var config = {
                'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
        }
        $http.post("http://localhost:3001/authenticate", data, config).then(
            function (response) {
                //Success
                var s = response.data.success;
                var t = response.data.token;
                $scope.authAnswer = "success: " + s + ", " + t;
                $scope.token = t;
            },
            function (response) {
                //Failed
                var s = response.data.success;
                var m = response.data.message;
                $scope.authAnswer = "failed: " + s + ", " + m;
            }
        )
    }
})
;