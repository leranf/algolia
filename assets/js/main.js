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
      { name: 'Italian' },
      { name: 'American' },
      { name: 'Californian' },
      { name: 'French' },
      { name: 'Seafood' },
      { name: 'Japanese' },
      { name: 'Indian' },
    ];

    $scope.ratings = [[], [], [], [], [], []].map(function(arr, idx) {
      var stars = [];
      for (var i = 0; i < 5; i++) {
        if (i < idx) {
          stars.push('plain');
        } else {
          stars.push('empty');
        }
      }
      return { stars: stars };
    });

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
    // index.setSettings({
    //   attributesForFaceting: ['food_type'],
    // }, function(err) {
    //   if (err) {
    //     console.log(err);
    //   }
    // });

    $scope.$watch('search.query', function() {
      index.search($scope.search.query, {
        facets: '*'
      }).then(function(results) {
        console.log(results);
        $scope.search.hits = results.hits;
        $scope.search.numberOfHits = results.nbHits;
        $scope.search.speed = results.processingTimeMS / 1000;
      })
      .catch(function(err) {
        console.log('some error', err);
      });
    });
  }]);