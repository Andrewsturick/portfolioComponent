angular.module('portfolioDirective', ['ui.router'])
        .config(function($stateProvider, $urlRouterProvider){
            $stateProvider
              .state('portfolio', {
                  url: '/',
                  templateUrl: 'views/portfolio/portfolioDirective.html',
                  controller:'PortfolioCtrl'
              })
            $urlRouterProvider.otherwise('/')
        })
