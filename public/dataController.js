/***
 * This controller is used to access a user's data
 */
app.controller("dataController", function ($scope, $rootScope,$http, $window) {

    $scope.getData = function () {
        var config = {
            headers: {
                'Authorization': $window.localStorage['jwtToken']
            }
        }
        $http.get($rootScope.baseUrl + "/spirometrydata", config).then(function (response) {
            $scope.data = response.data;
        });
    };
});