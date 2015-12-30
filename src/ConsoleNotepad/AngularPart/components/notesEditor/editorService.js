﻿app.factory('notes', ['$http', function ($http) {
    
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

    notes.post = function (keywords) {
        return $http.get('/api/notes/', { TagsToAdd: keywords })
                  .success(function (data) {
                      return data;
                  })
                  .error(function (err) {
                      return err;
                  });
    }

    notes.put = function (note) {
        return $http.get('/api/notes/', note)
                  .success(function (data) {
                      return data;
                  })
                  .error(function (err) {
                      return err;
                  });
    }

    return notes;
}]);