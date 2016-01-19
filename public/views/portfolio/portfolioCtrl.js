angular.module('portfolioDirective')
      .controller('PortfolioCtrl', function($scope, portfolioService){
        $scope.fileInput = '';
        $scope.click = function(file){
          portfolioService.readPortfolio(file)
          .then(function(data){
            console.log(data);
          })
        }
      })
