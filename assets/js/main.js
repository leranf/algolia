// var client = algoliasearch('R5FNFOXMUS', 'bb54ffbf3bb6805fc86ebed846cff7ca');
// var index = client.initIndex('restaurants');

// index.search('italian')
//   .then(function searchSuccess(content) {
//     console.log(content);
//   })
//   .catch(function searchFailure(err) {
//     console.error(err);
//   });

angular.module('algoliaRestaurantSearch', ['algoliasearch'])
  .controller('SearchController', ['$scope', 'algolia', function($scope, algolia) {
    $scope.foodTypes = [
      { name: 'Italian',     results: 0 },
      { name: 'American',    results: 0 },
      { name: 'Californian', results: 0 },
      { name: 'French',      results: 0 },
      { name: 'Seafood',     results: 0 },
      { name: 'Japanese',    results: 0 },
      { name: 'Indian',      results: 0 },
    ];

    $scope.ratings = [
      { stars: ['empty', 'empty', 'empty', 'empty', 'empty'] },
      { stars: ['plain', 'empty', 'empty', 'empty', 'empty'] },
      { stars: ['plain', 'plain', 'empty', 'empty', 'empty'] },
      { stars: ['plain', 'plain', 'plain', 'empty', 'empty'] },
      { stars: ['plain', 'plain', 'plain', 'plain', 'empty'] },
      { stars: ['plain', 'plain', 'plain', 'plain', 'plain'] },
    ];

    $scope.paymentOptions = [
      'American Express',
      'Visa',
      'MasterCard',
      'Discover',
    ];

    $scope.search = {
      query: '',
      hits: [],
      numberOfHits: 0,
      speed: '0'
    };
    var client = algolia.Client('R5FNFOXMUS', 'bb54ffbf3bb6805fc86ebed846cff7ca');
    var index = client.initIndex('restaurants');

    $scope.$watch('search.query', function() {
      index.search($scope.search.query)
        .then(function searchSuccess(results) {
          console.log(results);
          $scope.search.hits = results.hits;
          $scope.search.numberOfHits = results.nbHits;
          $scope.search.speed = results.processingTimeMS / 1000;
        })
        .catch(function searchFailure(err) {
          console.log('some error', err);
        });
    });
  }]);