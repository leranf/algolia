$(document).ready(function () {
  var APPLICATION_ID = 'R5FNFOXMUS';
  var SEARCH_ONLY_API_KEY = 'bb54ffbf3bb6805fc86ebed846cff7ca';
  var INDEX_NAME = 'restaurants';
  var PARAMS = {
    hitsPerPage: 10,
    maxValuesPerFacet: 7,
    facets: ['food_type', 'payment_options'],
  };
  var FACETS_ORDER_OF_DISPLAY = ['food_type', 'payment_options'];
  var FACETS_LABELS = { food_type: 'Cuisine/Food Type', payment_options: 'Payment Options' };

  // Client + Helper initialization
  var algolia = algoliasearch(APPLICATION_ID, SEARCH_ONLY_API_KEY);
  var algoliaHelper = algoliasearchHelper(algolia, INDEX_NAME, PARAMS);

  // DOM BINDING
  var $searchInput = $('#search-input');
  var $searchInputIcon = $('#search-input-icon');
  var $main = $('main');
  var $hits = $('#hits');
  var $stats = $('#stats');
  var $facets = $('#facets');

  // Hogan templates binding
  var hitTemplate = Hogan.compile($('#hit-template').text());
  var statsTemplate = Hogan.compile($('#stats-template').text());
  var facetTemplate = Hogan.compile($('#facet-template').text());
  var noResultsTemplate = Hogan.compile($('#no-results-template').text());

  // Input binding
  $searchInput
  .on('input propertychange', function (e) {
    var query = e.currentTarget.value;

    toggleIconEmptyInput(query);
    algoliaHelper.setQuery(query).search();
  })
  .focus();

  // Search errors
  algoliaHelper.on('error', function (error) {
    /* eslint-disable no-console */
    console.log(error);
    /* eslint-enable no-console */
  });

  // Update URL
  algoliaHelper.on('change', function () {
    setURLParams();
  });

  // Search results
  algoliaHelper.on('result', function (content, state) {
    renderStats(content);
    renderHits(content);
    renderFacets(content, state);
    bindSearchObjects(state);
    handleNoResults(content);
  });

  // Initial search
  initFromURLParams();
  algoliaHelper.search();

  // RENDER SEARCH COMPONENTS
  // ========================

  function renderStats(content) {
    var stats = {
      nbHits: content.nbHits,
      nbHits_plural: content.nbHits !== 1,
      processingTimeMS: content.processingTimeMS
    };
    $stats.html(statsTemplate.render(stats));
  }

  function renderHits(content) {
    $hits.html(hitTemplate.render(content));
  }

  function renderFacets(content, state) {
    var facetsHtml = '';
    for (var facetIndex = 0; facetIndex < FACETS_ORDER_OF_DISPLAY.length; ++facetIndex) {
      var facetName = FACETS_ORDER_OF_DISPLAY[facetIndex];
      var facetResult = content.getFacetByName(facetName);
      if (!facetResult) continue;
      var facetContent = {};

      // Conjunctive + Disjunctive facets
      facetContent = {
        facet: facetName,
        title: FACETS_LABELS[facetName],
        values: content.getFacetValues(facetName, {sortBy: ['isRefined:desc', 'count:desc']}),
        disjunctive: $.inArray(facetName, PARAMS.disjunctiveFacets) !== -1
      };
      facetsHtml += facetTemplate.render(facetContent);
    }
    $facets.html(facetsHtml);
  }

  function bindSearchObjects(state) {
    // Bind Sliders
    function prettify(num) {
      return '$' + parseInt(num, 10);
    }

    function onFinish(facetName) {
      return function (data) {
        var lowerBound = state.getNumericRefinement(facetName, '>=');
        lowerBound = lowerBound && lowerBound[0] || data.min;
        if (data.from !== lowerBound) {
          algoliaHelper.removeNumericRefinement(facetName, '>=');
          algoliaHelper.addNumericRefinement(facetName, '>=', data.from).search();
        }
        var upperBound = state.getNumericRefinement(facetName, '<=');
        upperBound = upperBound && upperBound[0] || data.max;
        if (data.to !== upperBound) {
          algoliaHelper.removeNumericRefinement(facetName, '<=');
          algoliaHelper.addNumericRefinement(facetName, '<=', data.to).search();
        }
      };
    }
  }

  // NO RESULTS
  // ==========

  function handleNoResults(content) {
    if (content.nbHits > 0) {
      $main.removeClass('no-results');
      return;
    }
    $main.addClass('no-results');

    var filters = [];
    var i;
    var j;
    for (i in algoliaHelper.state.facetsRefinements) {
      if ({}.hasOwnProperty(algoliaHelper.state.facetsRefinements, i)) {
        filters.push({
          'class': 'toggle-refine',
          facet: i, facet_value: algoliaHelper.state.facetsRefinements[i],
          label: FACETS_LABELS[i] + ': ',
          label_value: algoliaHelper.state.facetsRefinements[i]
        });
      }
    }
    for (i in algoliaHelper.state.disjunctiveFacetsRefinements) {
      if ({}.hasOwnProperty(algoliaHelper.state.disjunctiveFacetsRefinements, i)) {
        for (j in algoliaHelper.state.disjunctiveFacetsRefinements[i]) {
          if ({}.hasOwnProperty(algoliaHelper.state.disjunctiveFacetsRefinements[i], j)) {
            filters.push({
              'class': 'toggle-refine',
              facet: i,
              facet_value: algoliaHelper.state.disjunctiveFacetsRefinements[i][j],
              label: FACETS_LABELS[i] + ': ',
              label_value: algoliaHelper.state.disjunctiveFacetsRefinements[i][j]
            });
          }
        }
      }
    }
    for (i in algoliaHelper.state.numericRefinements) {
      if ({}.hasOwnProperty(algoliaHelper.state.numericRefinements, i)) {
        for (j in algoliaHelper.state.numericRefinements[i]) {
          if ({}.hasOwnProperty(algoliaHelper.state.numericRefinements[i], j)) {
            filters.push({
              'class': 'remove-numeric-refine',
              facet: i,
              facet_value: j,
              label: FACETS_LABELS[i] + ' ',
              label_value: j + ' ' + algoliaHelper.state.numericRefinements[i][j]
            });
          }
        }
      }
    }
    $hits.html(noResultsTemplate.render({query: content.query, filters: filters}));
  }

  // EVENTS BINDING
  // ==============

  $(document).on('click', '.toggle-refine', function (e) {
    e.preventDefault();
    algoliaHelper.toggleRefine($(this).data('facet'), $(this).data('value')).search();
  });
  $searchInputIcon.on('click', function (e) {
    e.preventDefault();
    $searchInput.val('').keyup().focus();
  });
  $(document).on('click', '.clear-all', function (e) {
    e.preventDefault();
    $searchInput.val('').focus();
    algoliaHelper.setQuery('').clearRefinements().search();
  });

  // URL MANAGEMENT
  // ==============

  function initFromURLParams() {
    var URLString = window.location.search.slice(1);
    var URLParams = algoliasearchHelper.url.getStateFromQueryString(URLString);
    if (URLParams.query) $searchInput.val(URLParams.query);
    if (URLParams.index) $sortBySelect.val(URLParams.index.replace(INDEX_NAME, ''));
    algoliaHelper.overrideStateWithoutTriggeringChangeEvent(
      algoliaHelper.state.setQueryParameters(URLParams)
    );
  }

  var URLHistoryTimer = Date.now();
  var URLHistoryThreshold = 700;
  function setURLParams() {
    var trackedParameters = ['attribute:*'];
    if (algoliaHelper.state.query.trim() !== '') trackedParameters.push('query');
    if (algoliaHelper.state.page !== 0) trackedParameters.push('page');
    if (algoliaHelper.state.index !== INDEX_NAME) trackedParameters.push('index');

    var URLParams = window.location.search.slice(1);
    var nonAlgoliaURLParams = algoliasearchHelper.url.getUnrecognizedParametersInQueryString(URLParams);
    var nonAlgoliaURLHash = window.location.hash;
    var helperParams = algoliaHelper.getStateAsQueryString({
      filters: trackedParameters,
      moreAttributes: nonAlgoliaURLParams
    });
    if (URLParams === helperParams) return;

    var now = Date.now();
    if (URLHistoryTimer > now) {
      window.history.replaceState(null, '', '?' + helperParams + nonAlgoliaURLHash);
    } else {
      window.history.pushState(null, '', '?' + helperParams + nonAlgoliaURLHash);
    }
    URLHistoryTimer = now + URLHistoryThreshold;
  }

  window.addEventListener('popstate', function () {
    initFromURLParams();
    algoliaHelper.search();
  });

  // HELPER METHODS
  // ==============

  function toggleIconEmptyInput(query) {
    $searchInputIcon.toggleClass('empty', query.trim() !== '');
  }
});