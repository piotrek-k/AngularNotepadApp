(function () {
    'use strict';

    
})();

var app = angular.module('ConsoleNotepad', [
        // Angular modules 
        'ngRoute'

        // Custom modules 

        // 3rd Party Modules

]);

app.controller('editorController', function ($scope) {
    $scope.test = 'Yeah, works';
});
app.factory('notes', ['$http', function ($http) {
    
    var notes = {};

    notes.get = function () {
        return $http.get('/api/notes')
                  .success(function (data) {
                      return data;
                  })
                  .error(function (err) {
                      return err;
                  });
    }

    notes.getSuggested = function (searchText) {
        return $http.get('/api/notes/suggest/' + searchText)
                  .success(function (data) {
                      return data;
                  })
                  .error(function (err) {
                      return err;
                  });
    }

    return notes;
}]);