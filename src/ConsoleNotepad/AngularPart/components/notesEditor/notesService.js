app.factory('notes', ['$http', function ($http) {
    
    var notes = {};

    notes.typeToString = function (type) {
        switch (type) {
            case 0:
                return "Normal";
                break;
            case 1:
                return "Code";
                break;
            case 2:
                return "View";
                break;
            case 3:
                return "System";
                break;
            default:
                return "Normal";
        }
    }
    //notes.get = function () {
        //TODO
        //return $http.get('/api/notes')
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    //}

    //pobierz sugerowane notatki (mające podane tagi)
    notes.getSuggested = function (searchText) {
        return $http({
            method: 'GET',
            url: '/api/notes/suggested?searchText=' + searchText,
            headers: {
                'Accept': 'application/json'
            }
        }).then(null, function (response) {
            console.error("Couldn't get suggested notes");
        });
    }

    //pobierz notatki z dokładnie tymi tagami
    notes.getByTag = function (searchText) {
        console.log("getByTag: " + searchText);
        return $http({
            method: 'GET',
            url: '/api/notes/bytags?searchText=' + searchText,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    notes.post = function (data) {
        //nie testowane
        //console.log("post");
        //console.dir(data);
        return $http({
            method: 'POST',
            url: '/api/Notes',
            data: data,
            headers: {
                'Accept': 'application/json'
            }
        }).then(null, function (response) {
            console.error("Couldn't post a note");
        });
    }

    notes.put = function (note) {
        //nie testowane
        console.table(note);
        return $http({
            method: 'PUT',
            url: '/api/Notes/' + part.ID,
            data: note,
            headers: {
                'Accept': 'application/json'
            }
        }).then(null, function (response) {
            console.error("Couldn't put a note");
        });
    }

    return notes;
}]);