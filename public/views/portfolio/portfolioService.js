angular.module('portfolioDirective')
      .service('portfolioService', function($http){
          this.readPortfolio = function(file){
            return $http.put('/portfolio', {file: file})
          }
      })
