angular.module('viewer',[])
.controller('RegistryCtrl', function($scope, $http) {
  
  // var npmBaseUrl = 'http://registry.npmjs.org/';
  // var npmBaseUrl = 'https://www.npmjs.com/package/';
  var npmProxyUrl = 'https://cors-anywhere.herokuapp.com/http://registry.npmjs.org/';
  $scope.packageName = '';
  $scope.npmInfo = null;

  $scope.lookUpPackage = function lookUpPackage(packageName) {
    console.log('looking up package', packageName);
    var npmUrl = [npmProxyUrl, packageName].join('');
    $http.get(npmUrl)
    .then(function(response) {
      // console.log('got:', response);
      $scope.npmInfo = response.data;
      console.log('npminfo', $scope.npmInfo);
    });
  };
});
