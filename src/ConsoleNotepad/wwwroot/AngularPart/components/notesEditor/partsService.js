﻿app.factory('parts', ['$http', function ($http) {

    var parts = {};

    parts.get = function (idOfNote) {
        return $http({
            method: 'GET',
            url: '/api/parts?idOfNote=' + idOfNote,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    parts.post = function (nextPart) {
        //console.log("nextPart:");
        //console.table(nextPart);
        return $http({
            method: 'POST',
            url: '/api/Parts',
            data: nextPart,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    parts.put = function (part) {
        //console.log("Updating...");
        //console.table(part);
        if (part.Settings == undefined && part.SettingsAsJSON != undefined) {
            console.warn("Ustawienia part'a zostały wyzerowane");
        }
        part.SettingsAsJSON = JSON.stringify(part.Settings);
        //console.log(part.SettingsAsJSON);

        return $http({
            method: 'PUT',
            url: '/api/Parts/' + part.ID,
            data: part,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    parts.history = function (id, page) {
        return $http({
            method: 'GET',
            url: '/api/partshistory?idOfOriginalPart=' + id + '&page=' + page,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    return parts;
}]);