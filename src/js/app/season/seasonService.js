
function progressSeason() {
  return {
    restrict: "E",
    templateUrl: "../templates/progress-bar.html",
    controller: 'progressCtrl',
    replace: true
  };
};

function sheduleSeason() {
  return {
    restrict: "E",
    templateUrl: "../templates/shedule.html",
    controller: 'sheduleCtrl',
    replace: true
  };
};

function categoriesSeason() {
  return {
    restrict: "E",
    templateUrl: "../templates/categories.html",
    controller: 'categoriesCtrl',
    replace: true
  };
};

function bathroomsSeason() {
  return {
    restrict: "E",
    templateUrl: "../templates/bathrooms.html",
    controller: 'bathroomsCtrl',
    replace: true
  };
};

function pricesSeason() {
  return {
    restrict: "E",
    templateUrl: "../templates/prices.html",
    controller: 'pricesCtrl',
    replace: true
  };
};

function fullPriceSeason() {
  return {
    restrict: "E",
    templateUrl: "../templates/full-price.html",
    controller: 'fullPriceCtrl',
    replace: true
  };
};
