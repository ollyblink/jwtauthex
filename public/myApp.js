var app = angular.module('myApp', ["ngRoute"]);
app.config(function ($routeProvider) {
    $routeProvider
        .when("/", {
            templateUrl: "login.html",
            controller:"restController"
        })
        .when("/register", {
            templateUrl: "register.html",
            controller: "restController"
        });
});