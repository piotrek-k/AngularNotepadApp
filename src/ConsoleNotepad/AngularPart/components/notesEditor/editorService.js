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

    return notes;
}]);