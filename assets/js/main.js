// var client = algoliasearch('R5FNFOXMUS', 'bb54ffbf3bb6805fc86ebed846cff7ca');
// var index = client.initIndex('restaurants');

// index.search('italian')
//   .then(function searchSuccess(content) {
//     console.log(content);
//   })
//   .catch(function searchFailure(err) {
//     console.error(err);
//   });

angular.module('algoliaRestaurantSearch', ['instantsearch'])
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

    var filters = {
      
    }

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
    
    $scope.toggleFilter = function(filter) {

    }

    var client = algolia.Client('R5FNFOXMUS', 'bb54ffbf3bb6805fc86ebed846cff7ca');
    var index = client.initIndex('restaurants');

    $scope.$watch('search.query', function() {
      index.search($scope.search.query, {
        facets: '*'
      }).then(function(results) {
        console.log(results);
        results.hits.forEach(function(hit) {
          hit.starsArr = [];
          for (var i = 1; i <= 5; i++) {
            if (i <= hit.stars_count) {
              hit.starsArr.push('plain');
            } else {
              hit.starsArr.push('empty');
            }
          }
        });
        $scope.foodTypes.forEach(function(foodType) {
          foodType.results = results.facets.food_type[foodType.name] || 0;
        });
        $scope.search.hits = results.hits;
        $scope.search.numberOfHits = results.nbHits;
        $scope.search.speed = results.processingTimeMS / 1000;
      })
      .catch(function(err) {
        console.log('some error', err);
      });
    });
  }]);