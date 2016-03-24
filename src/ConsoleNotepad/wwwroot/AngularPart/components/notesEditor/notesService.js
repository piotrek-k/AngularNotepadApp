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

    //pobierz sugerowane notatki (mające podane tagi)
    notes.getSuggested = function (searchText) {
        return $http({
            method: 'GET',
            url: '/api/notes/suggested?searchText=' + searchText,
            headers: {
                'Accept': 'application/json'
            }
        }).then(function (response) {
            //success
            response.data.TagsToAdd = response.data.TagsAsSingleString; //uzupelniam pole tekstowe w formularzu edycji notatki
            return response;
        }, function (response) {
            //error
            console.error("Error while using notes.getSuggested");
            console.dir(response);
            throw response;
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
        }).then(function (response) {
            //success
            response.data.TagsToAdd = response.data.TagsAsSingleString; //uzupelniam pole tekstowe w formularzu edycji notatki
            return response;
        }, function (response) {
            //error
            console.error("Error while using notes.getByTag");
            console.dir(response);
            throw response;
        });
    }

    //pobierz najczesciej uzywane views
    notes.getPopularViews = function () {
        //console.log("getByTag: " + searchText);
        return $http({
            method: 'GET',
            url: '/api/notes/popularviews',
            headers: {
                'Accept': 'application/json'
            }
        }).then(function (response) {
            //success
            return response;
        }, function (response) {
            //error
            console.error("Error while using notes.getPopularViews");
            console.dir(response);
            throw response;
        });
    }

    notes.post = function (data) {
        return $http({
            method: 'POST',
            url: '/api/Notes',
            data: data,
            headers: {
                'Accept': 'application/json'
            }
        }).then(null, function (response) {
            console.error("Couldn't post a note");
            throw response;
        });
    }

    notes.put = function (note) {
        //nie testowane
        console.table(note);
        return $http({
            method: 'PUT',
            url: '/api/Notes/' + note.NoteId,
            data: note,
            headers: {
                'Accept': 'application/json'
            }
        }).then(function (response) { return response; }, function (response) {
            console.error("Couldn't put a note");
            throw response;
        });
    }

    return notes;
}]);