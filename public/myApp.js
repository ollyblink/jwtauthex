var app = angular.module('myApp', ["ngRoute"]).run(function($rootScope){

    $rootScope.baseUrl = "https://localhost:8080";
});
app.config(function ($routeProvider) {
    $routeProvider
        .when("/", {
            templateUrl: "login.html",
            controller:"restController"
        })
        .when("/data", {
            templateUrl: "data.html",
            controller:"dataController"
        })
        .when("/register", {
            templateUrl: "register.html",
            controller: "restController"
        });
});