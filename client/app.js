angular.module('MyApp', ['ui.router'])
.config(function ($stateProvider, $urlRouterProvider) {
/**
     * App routes
     */
    $stateProvider
      .state('home', {
        url: '/',
        templateUrl: 'pages/home.html'
      }) 
      .state('main', {
        url: '/main',
        templateUrl: 'pages/main.html',
        controller:'searchCtrl'
      })
       $urlRouterProvider.otherwise('/');

  


});