app.factory('parts', ['$http', function ($http) {

    var parts = {};

    parts.get = function (idOfNote) {
        //TODO
        return $http({
            method: 'GET',
            url: '/api/parts?idOfNote=' + idOfNote,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    parts.post = function (nextPart) {
        console.log("nextPart:");
        console.table(nextPart);
        //TODO
        //return $http.get('/api/notes/', { TagsToAdd: keywords })
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    parts.put = function (part) {
        //console.table(part);
        //TODO
        //return $http.get('/api/notes/', note)
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    return parts;
}]);