app.factory('notes', ['$http', function ($http) {
    
    var notes = {};

    notes.get = function () {
        //TODO
        //return $http.get('/api/notes')
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    notes.getSuggested = function (searchText) {
        return $http({
            method: 'GET',
            url: '/api/notes/suggested?searchText=' + searchText,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    notes.getByTag = function (searchText) {
        return $http({
            method: 'GET',
            url: '/api/notes/bytags?searchText=' + searchText,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    notes.post = function (data) {
        //TODO
        //return $http({
        //    method: 'POST',
        //    url: '/api/Parts',
        //    data: data,
        //    headers: {
        //        'Accept': 'application/json'
        //    }
        //});
    }

    notes.put = function (note) {
        console.table(note);
        //TODO
        //return $http.get('/api/notes/', note)
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    return notes;
}]);