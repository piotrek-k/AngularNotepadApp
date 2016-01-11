(function () {
    'use strict';

    
})();

var app = angular.module('ConsoleNotepad', [
        // Angular modules 
        'ngRoute'

        // Custom modules 

        // 3rd Party Modules

]);

app.directive('contenteditable', function () {
    return {
        restrict: 'A', // only activate on element attribute
        require: '?ngModel', // get a hold of NgModelController
        link: function (scope, element, attrs, ngModel) {
            if (!ngModel) return; // do nothing if no ng-model

            // Specify how UI should be updated
            ngModel.$render = function () {
                element.html(ngModel.$viewValue || '');
            };

            // Listen for change events to enable binding
            element.on('blur keyup change', function () {
                scope.$apply(read);
            });
            read(); // initialize

            // Write data to the model
            function read() {
                var html = element.html();
                // When we clear the content editable the browser leaves a <br> behind
                // If strip-br attribute is provided then we strip this out
                if (attrs.stripBr && html == '<br>') {
                    html = '';
                }
                ngModel.$setViewValue(html);
            }
        }
    };
});
app.directive('focusOn', function () {
    return function (scope, elem, attr) {
        scope.$on('focusOn', function (e, name) {
            if (name === attr.focusOn) {
                elem[0].focus();
            }
        });
    };
});

app.factory('focusOn', function ($rootScope, $timeout) {
    return function (name) {
        $timeout(function () {
            $rootScope.$broadcast('focusOn', name);
        });
    }
});
app.controller('editorController', function ($scope, notes, parts, focusOn) {
    $scope.suggestions = {};
    $scope.highlightedSuggestion = -1;
    $scope.currentNoteId = 0;
    $scope.parts = [
        {
            Data: "new"
        }
    ];
    var timeoutUpdate; //setTimeout to update Part
    var editingPartOptions = {};
    $scope.focusOnPart = 0;

    $scope.smartBarKeyDown = function (event) {
        console.log("Refresh " + event.keyCode)
        if (event.keyCode == 32) { //space
            $scope.suggestions = notes.getSuggested($scope.smartBar).success(function (data) {
                console.table(data);
                $scope.suggestions = data;
            });
            console.log("Refreshed");
        }

        if (event.keyCode == 40 && $scope.highlightedSuggestion < $scope.suggestions.length-1) { //arrow down
            event.preventDefault();
            $scope.highlightedSuggestion++;
        }
        if (event.keyCode == 38 && $scope.highlightedSuggestion > -1) { //arrow up
            event.preventDefault();
            $scope.highlightedSuggestion--;
        }

        if (event.keyCode == 13 && $scope.highlightedSuggestion > -1) { //enter
            //uzupełnij inputa, zacznij pisanie notatki
            $scope.smartBar = "";
            console.table($scope.suggestions[$scope.highlightedSuggestion].NoteTags);
            var note = $scope.suggestions[$scope.highlightedSuggestion];
            console.table(note);
            for (var nt in note.NoteTags) {
                //console.log(nt);
                $scope.smartBar += note.NoteTags[nt].Tag.Name + " ";
            }

            $scope.currentNoteId = note.NoteId;
            $scope.parts = parts.get($scope.currentNoteId).success(function (data) {
                $scope.parts = data;
                partsCheckForNull();
            });

        }
    }

    $scope.editingPartKeyDown = function (event, partObjIndex) {
        clearTimeout(timeoutUpdate);
        timeoutUpdate = setTimeout(function () { updatePart(partObjIndex) }, 3000);
        //timeoutUpdate = setTimeout(function () { alert("chuj");}, 3000);

        //2x enter dodaje nowy part
        //console.log(partObj.Data);

        var partObj = $scope.parts[partObjIndex];
        if (event.keyCode == 13 && /\s*<br>\s*<br>\s*$/.test(partObj.Data)) { //enter
            //console.log("three enters");
            //console.log("before: " + $scope.parts[partObjIndex].Data);
            //$scope.parts[partObjIndex].Data = $scope.parts[partObjIndex].Data.replace(/\s*<br>\s*<br>\s*$/g, ""); //usun ostatni enter
            $scope.parts[partObjIndex].Data = $scope.parts[partObjIndex].Data.replace(/\s*<br>\s*$/g, "");
            //console.log("after: " + $scope.parts[partObjIndex].Data);
            addPart(partObjIndex);
            event.preventDefault(); //żeby nie dawało już tego entera
        }
    }
    
    function updatePart(index) {
        //console.log("update");
        var partObj = $scope.parts[index];
        parts.put(partObj);
    }

    function addPart(lastIndex) {
        //$scope.parts.push({ Data: "new" });
        //console.log("lastIndex: " + lastIndex);
        //console.table($scope.parts);
        var atIndex = lastIndex + 1;
        if (lastIndex == null) {
            atIndex = 0;
        }

        $scope.parts.splice(atIndex, 0, { Data: "new" }); //add at index
        //console.log("after");
        //console.table($scope.parts);
        focusOn("part" + atIndex);
        parts.post($scope.parts[atIndex]);
    }

    function partsCheckForNull(){
        if ($scope.parts.length == 0 || $scope.parts == null) {
            addPart();
        }
    }
});
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
(function () {
    'use strict';

    
})();

var app = angular.module('ConsoleNotepad', [
        // Angular modules 
        'ngRoute'

        // Custom modules 

        // 3rd Party Modules

]);

app.directive('contenteditable', function () {
    return {
        restrict: 'A', // only activate on element attribute
        require: '?ngModel', // get a hold of NgModelController
        link: function (scope, element, attrs, ngModel) {
            if (!ngModel) return; // do nothing if no ng-model

            // Specify how UI should be updated
            ngModel.$render = function () {
                element.html(ngModel.$viewValue || '');
            };

            // Listen for change events to enable binding
            element.on('blur keyup change', function () {
                scope.$apply(read);
            });
            read(); // initialize

            // Write data to the model
            function read() {
                var html = element.html();
                // When we clear the content editable the browser leaves a <br> behind
                // If strip-br attribute is provided then we strip this out
                if (attrs.stripBr && html == '<br>') {
                    html = '';
                }
                ngModel.$setViewValue(html);
            }
        }
    };
});
app.directive('focusOn', function () {
    return function (scope, elem, attr) {
        scope.$on('focusOn', function (e, name) {
            if (name === attr.focusOn) {
                elem[0].focus();
            }
        });
    };
});

app.factory('focusOn', function ($rootScope, $timeout) {
    return function (name) {
        $timeout(function () {
            $rootScope.$broadcast('focusOn', name);
        });
    }
});
app.controller('editorController', function ($scope, notes, parts, focusOn) {
    $scope.suggestions = {};
    $scope.highlightedSuggestion = -1;
    $scope.currentNoteId = 0;
    $scope.parts = [
        {
            Data: "new"
        }
    ];
    var timeoutUpdate; //setTimeout to update Part
    var editingPartOptions = {};
    $scope.focusOnPart = 0;

    $scope.smartBarKeyDown = function (event) {
        console.log("Refresh " + event.keyCode)
        if (event.keyCode == 32) { //space
            $scope.suggestions = notes.getSuggested($scope.smartBar).success(function (data) {
                console.table(data);
                $scope.suggestions = data;
            });
            console.log("Refreshed");
        }

        if (event.keyCode == 40 && $scope.highlightedSuggestion < $scope.suggestions.length-1) { //arrow down
            event.preventDefault();
            $scope.highlightedSuggestion++;
        }
        if (event.keyCode == 38 && $scope.highlightedSuggestion > -1) { //arrow up
            event.preventDefault();
            $scope.highlightedSuggestion--;
        }

        if (event.keyCode == 13 && $scope.highlightedSuggestion > -1) { //enter
            //uzupełnij inputa, zacznij pisanie notatki
            $scope.smartBar = "";
            console.table($scope.suggestions[$scope.highlightedSuggestion].NoteTags);
            var note = $scope.suggestions[$scope.highlightedSuggestion];
            console.table(note);
            for (var nt in note.NoteTags) {
                //console.log(nt);
                $scope.smartBar += note.NoteTags[nt].Tag.Name + " ";
            }

            $scope.currentNoteId = note.NoteId;
            $scope.parts = parts.get($scope.currentNoteId).success(function (data) {
                $scope.parts = data;
                partsCheckForNull();
            });

        }
    }

    $scope.editingPartKeyDown = function (event, partObjIndex) {
        clearTimeout(timeoutUpdate);
        timeoutUpdate = setTimeout(function () { updatePart(partObjIndex) }, 3000);
        //timeoutUpdate = setTimeout(function () { alert("chuj");}, 3000);

        //2x enter dodaje nowy part
        //console.log(partObj.Data);

        var partObj = $scope.parts[partObjIndex];
        if (event.keyCode == 13 && /\s*<br>\s*<br>\s*$/.test(partObj.Data)) { //enter
            //console.log("three enters");
            //console.log("before: " + $scope.parts[partObjIndex].Data);
            //$scope.parts[partObjIndex].Data = $scope.parts[partObjIndex].Data.replace(/\s*<br>\s*<br>\s*$/g, ""); //usun ostatni enter
            $scope.parts[partObjIndex].Data = $scope.parts[partObjIndex].Data.replace(/\s*<br>\s*$/g, "");
            //console.log("after: " + $scope.parts[partObjIndex].Data);
            addPart(partObjIndex);
            event.preventDefault(); //żeby nie dawało już tego entera
        }
    }
    
    function updatePart(index) {
        //console.log("update");
        var partObj = $scope.parts[index];
        parts.put(partObj);
    }

    function addPart(lastIndex) {
        //$scope.parts.push({ Data: "new" });
        //console.log("lastIndex: " + lastIndex);
        //console.table($scope.parts);
        var atIndex = lastIndex + 1;
        if (lastIndex == null) {
            atIndex = 0;
        }

        $scope.parts.splice(atIndex, 0, { Data: "new", NoteID: $scope.currentNoteId }); //add at index
        //console.log("after");
        //console.table($scope.parts);
        focusOn("part" + atIndex);
        parts.post($scope.parts[atIndex]);
    }

    function partsCheckForNull(){
        if ($scope.parts.length == 0 || $scope.parts == null) {
            addPart();
        }
    }
});
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
(function () {
    'use strict';

    
})();

var app = angular.module('ConsoleNotepad', [
        // Angular modules 
        'ngRoute'

        // Custom modules 

        // 3rd Party Modules

]);

app.directive('contenteditable', function () {
    return {
        restrict: 'A', // only activate on element attribute
        require: '?ngModel', // get a hold of NgModelController
        link: function (scope, element, attrs, ngModel) {
            if (!ngModel) return; // do nothing if no ng-model

            // Specify how UI should be updated
            ngModel.$render = function () {
                element.html(ngModel.$viewValue || '');
            };

            // Listen for change events to enable binding
            element.on('blur keyup change', function () {
                scope.$apply(read);
            });
            read(); // initialize

            // Write data to the model
            function read() {
                var html = element.html();
                // When we clear the content editable the browser leaves a <br> behind
                // If strip-br attribute is provided then we strip this out
                if (attrs.stripBr && html == '<br>') {
                    html = '';
                }
                ngModel.$setViewValue(html);
            }
        }
    };
});
app.directive('focusOn', function () {
    return function (scope, elem, attr) {
        scope.$on('focusOn', function (e, name) {
            if (name === attr.focusOn) {
                elem[0].focus();
            }
        });
    };
});

app.factory('focusOn', function ($rootScope, $timeout) {
    return function (name) {
        $timeout(function () {
            $rootScope.$broadcast('focusOn', name);
        });
    }
});
app.controller('editorController', function ($scope, notes, parts, focusOn) {
    $scope.suggestions = {};
    $scope.highlightedSuggestion = -1;
    $scope.currentNoteId = 0;
    $scope.parts = [
        {
            Data: "new"
        }
    ];
    var timeoutUpdate; //setTimeout to update Part
    var editingPartOptions = {};
    $scope.focusOnPart = 0;

    $scope.smartBarKeyDown = function (event) {
        console.log("Refresh " + event.keyCode)
        if (event.keyCode == 32) { //space
            $scope.suggestions = notes.getSuggested($scope.smartBar).success(function (data) {
                console.table(data);
                $scope.suggestions = data;
            });
            console.log("Refreshed");
        }

        if (event.keyCode == 40 && $scope.highlightedSuggestion < $scope.suggestions.length-1) { //arrow down
            event.preventDefault();
            $scope.highlightedSuggestion++;
        }
        if (event.keyCode == 38 && $scope.highlightedSuggestion > -1) { //arrow up
            event.preventDefault();
            $scope.highlightedSuggestion--;
        }

        if (event.keyCode == 13 && $scope.highlightedSuggestion > -1) { //enter
            //uzupełnij inputa, zacznij pisanie notatki
            $scope.smartBar = "";
            console.table($scope.suggestions[$scope.highlightedSuggestion].NoteTags);
            var note = $scope.suggestions[$scope.highlightedSuggestion];
            console.table(note);
            for (var nt in note.NoteTags) {
                //console.log(nt);
                $scope.smartBar += note.NoteTags[nt].Tag.Name + " ";
            }

            $scope.currentNoteId = note.NoteId;
            $scope.parts = parts.get($scope.currentNoteId).success(function (data) {
                $scope.parts = data;
                partsCheckForNull();
            });

        }
    }

    $scope.editingPartKeyDown = function (event, partObjIndex) {
        clearTimeout(timeoutUpdate);
        timeoutUpdate = setTimeout(function () { updatePart(partObjIndex) }, 3000);
        //timeoutUpdate = setTimeout(function () { alert("chuj");}, 3000);

        //2x enter dodaje nowy part
        //console.log(partObj.Data);

        var partObj = $scope.parts[partObjIndex];
        if (event.keyCode == 13 && /\s*<br>\s*<br>\s*$/.test(partObj.Data)) { //enter
            //console.log("three enters");
            //console.log("before: " + $scope.parts[partObjIndex].Data);
            //$scope.parts[partObjIndex].Data = $scope.parts[partObjIndex].Data.replace(/\s*<br>\s*<br>\s*$/g, ""); //usun ostatni enter
            $scope.parts[partObjIndex].Data = $scope.parts[partObjIndex].Data.replace(/\s*<br>\s*$/g, "");
            //console.log("after: " + $scope.parts[partObjIndex].Data);
            addPart(partObjIndex);
            event.preventDefault(); //żeby nie dawało już tego entera
        }
    }
    
    function updatePart(index) {
        //console.log("update");
        var partObj = $scope.parts[index];
        parts.put(partObj);
    }

    function addPart(lastIndex) {
        //$scope.parts.push({ Data: "new" });
        //console.log("lastIndex: " + lastIndex);
        //console.table($scope.parts);
        var atIndex = lastIndex + 1;
        if (lastIndex == null) {
            atIndex = 0;
        }

        $scope.parts.splice(atIndex, 0, { Data: "new", NoteID: $scope.currentNoteId }); //add at index
        //console.log("after");
        //console.table($scope.parts);
        focusOn("part" + atIndex);
        parts.post($scope.parts[atIndex]);
    }

    function partsCheckForNull(){
        if ($scope.parts.length == 0 || $scope.parts == null) {
            addPart();
        }
    }
});
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
        //console.table(part);
        //TODO
        return $http({
            method: 'PUT',
            url: '/api/Parts',
            data: nextPart,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    return parts;
}]);
(function () {
    'use strict';

    
})();

var app = angular.module('ConsoleNotepad', [
        // Angular modules 
        'ngRoute'

        // Custom modules 

        // 3rd Party Modules

]);

app.directive('contenteditable', function () {
    return {
        restrict: 'A', // only activate on element attribute
        require: '?ngModel', // get a hold of NgModelController
        link: function (scope, element, attrs, ngModel) {
            if (!ngModel) return; // do nothing if no ng-model

            // Specify how UI should be updated
            ngModel.$render = function () {
                element.html(ngModel.$viewValue || '');
            };

            // Listen for change events to enable binding
            element.on('blur keyup change', function () {
                scope.$apply(read);
            });
            read(); // initialize

            // Write data to the model
            function read() {
                var html = element.html();
                // When we clear the content editable the browser leaves a <br> behind
                // If strip-br attribute is provided then we strip this out
                if (attrs.stripBr && html == '<br>') {
                    html = '';
                }
                ngModel.$setViewValue(html);
            }
        }
    };
});
app.directive('focusOn', function () {
    return function (scope, elem, attr) {
        scope.$on('focusOn', function (e, name) {
            if (name === attr.focusOn) {
                elem[0].focus();
            }
        });
    };
});

app.factory('focusOn', function ($rootScope, $timeout) {
    return function (name) {
        $timeout(function () {
            $rootScope.$broadcast('focusOn', name);
        });
    }
});
app.controller('editorController', function ($scope, notes, parts, focusOn) {
    $scope.suggestions = {};
    $scope.highlightedSuggestion = -1;
    $scope.currentNoteId = 0;
    $scope.parts = [
        {
            Data: "new"
        }
    ];
    var timeoutUpdate; //setTimeout to update Part
    var editingPartOptions = {};
    $scope.focusOnPart = 0;

    $scope.smartBarKeyDown = function (event) {
        console.log("Refresh " + event.keyCode)
        if (event.keyCode == 32) { //space
            $scope.suggestions = notes.getSuggested($scope.smartBar).success(function (data) {
                console.table(data);
                $scope.suggestions = data;
            });
            console.log("Refreshed");
        }

        if (event.keyCode == 40 && $scope.highlightedSuggestion < $scope.suggestions.length-1) { //arrow down
            event.preventDefault();
            $scope.highlightedSuggestion++;
        }
        if (event.keyCode == 38 && $scope.highlightedSuggestion > -1) { //arrow up
            event.preventDefault();
            $scope.highlightedSuggestion--;
        }

        if (event.keyCode == 13 && $scope.highlightedSuggestion > -1) { //enter
            //uzupełnij inputa, zacznij pisanie notatki
            $scope.smartBar = "";
            console.table($scope.suggestions[$scope.highlightedSuggestion].NoteTags);
            var note = $scope.suggestions[$scope.highlightedSuggestion];
            console.table(note);
            for (var nt in note.NoteTags) {
                //console.log(nt);
                $scope.smartBar += note.NoteTags[nt].Tag.Name + " ";
            }

            $scope.currentNoteId = note.NoteId;
            $scope.parts = parts.get($scope.currentNoteId).success(function (data) {
                $scope.parts = data;
                partsCheckForNull();
            });

        }
    }

    $scope.editingPartKeyDown = function (event, partObjIndex) {
        clearTimeout(timeoutUpdate);
        timeoutUpdate = setTimeout(function () { updatePart(partObjIndex) }, 3000);
        //timeoutUpdate = setTimeout(function () { alert("chuj");}, 3000);

        //2x enter dodaje nowy part
        //console.log(partObj.Data);

        var partObj = $scope.parts[partObjIndex];
        if (event.keyCode == 13 && /\s*<br>\s*<br>\s*$/.test(partObj.Data)) { //enter
            //console.log("three enters");
            //console.log("before: " + $scope.parts[partObjIndex].Data);
            //$scope.parts[partObjIndex].Data = $scope.parts[partObjIndex].Data.replace(/\s*<br>\s*<br>\s*$/g, ""); //usun ostatni enter
            $scope.parts[partObjIndex].Data = $scope.parts[partObjIndex].Data.replace(/\s*<br>\s*$/g, "");
            //console.log("after: " + $scope.parts[partObjIndex].Data);
            addPart(partObjIndex);
            event.preventDefault(); //żeby nie dawało już tego entera
        }
    }
    
    function updatePart(index) {
        //console.log("update");
        var partObj = $scope.parts[index];
        parts.put(partObj);
    }

    function addPart(lastIndex) {
        //$scope.parts.push({ Data: "new" });
        //console.log("lastIndex: " + lastIndex);
        //console.table($scope.parts);
        var atIndex = lastIndex + 1;
        if (lastIndex == null) {
            atIndex = 0;
        }

        $scope.parts.splice(atIndex, 0, { Data: "new", NoteID: $scope.currentNoteId }); //add at index
        //console.log("after");
        //console.table($scope.parts);
        focusOn("part" + atIndex);
        parts.post($scope.parts[atIndex]);
    }

    function partsCheckForNull(){
        if ($scope.parts.length == 0 || $scope.parts == null) {
            addPart();
        }
    }
});
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
        //console.table(part);
        //TODO
        return $http({
            method: 'PUT',
            url: '/api/Parts',
            data: part,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    return parts;
}]);
(function () {
    'use strict';

    
})();

var app = angular.module('ConsoleNotepad', [
        // Angular modules 
        'ngRoute'

        // Custom modules 

        // 3rd Party Modules

]);

app.directive('contenteditable', function () {
    return {
        restrict: 'A', // only activate on element attribute
        require: '?ngModel', // get a hold of NgModelController
        link: function (scope, element, attrs, ngModel) {
            if (!ngModel) return; // do nothing if no ng-model

            // Specify how UI should be updated
            ngModel.$render = function () {
                element.html(ngModel.$viewValue || '');
            };

            // Listen for change events to enable binding
            element.on('blur keyup change', function () {
                scope.$apply(read);
            });
            read(); // initialize

            // Write data to the model
            function read() {
                var html = element.html();
                // When we clear the content editable the browser leaves a <br> behind
                // If strip-br attribute is provided then we strip this out
                if (attrs.stripBr && html == '<br>') {
                    html = '';
                }
                ngModel.$setViewValue(html);
            }
        }
    };
});
app.directive('focusOn', function () {
    return function (scope, elem, attr) {
        scope.$on('focusOn', function (e, name) {
            if (name === attr.focusOn) {
                elem[0].focus();
            }
        });
    };
});

app.factory('focusOn', function ($rootScope, $timeout) {
    return function (name) {
        $timeout(function () {
            $rootScope.$broadcast('focusOn', name);
        });
    }
});
app.controller('editorController', function ($scope, notes, parts, focusOn) {
    $scope.suggestions = {};
    $scope.highlightedSuggestion = -1;
    $scope.currentNoteId = 0;
    $scope.parts = [
        {
            Data: "new"
        }
    ];
    var timeoutUpdate; //setTimeout to update Part
    var editingPartOptions = {};
    $scope.focusOnPart = 0;

    $scope.smartBarKeyDown = function (event) {
        console.log("Refresh " + event.keyCode)
        if (event.keyCode == 32) { //space
            $scope.suggestions = notes.getSuggested($scope.smartBar).success(function (data) {
                console.table(data);
                $scope.suggestions = data;
            });
            console.log("Refreshed");
        }

        if (event.keyCode == 40 && $scope.highlightedSuggestion < $scope.suggestions.length-1) { //arrow down
            event.preventDefault();
            $scope.highlightedSuggestion++;
        }
        if (event.keyCode == 38 && $scope.highlightedSuggestion > -1) { //arrow up
            event.preventDefault();
            $scope.highlightedSuggestion--;
        }

        if (event.keyCode == 13 && $scope.highlightedSuggestion > -1) { //enter
            //uzupełnij inputa, zacznij pisanie notatki
            $scope.smartBar = "";
            console.table($scope.suggestions[$scope.highlightedSuggestion].NoteTags);
            var note = $scope.suggestions[$scope.highlightedSuggestion];
            console.table(note);
            for (var nt in note.NoteTags) {
                //console.log(nt);
                $scope.smartBar += note.NoteTags[nt].Tag.Name + " ";
            }

            $scope.currentNoteId = note.NoteId;
            $scope.parts = parts.get($scope.currentNoteId).success(function (data) {
                $scope.parts = data;
                partsCheckForNull();
            });

        }
    }

    $scope.editingPartKeyDown = function (event, partObjIndex) {
        clearTimeout(timeoutUpdate);
        timeoutUpdate = setTimeout(function () { updatePart(partObjIndex) }, 3000);
        //timeoutUpdate = setTimeout(function () { alert("chuj");}, 3000);

        //2x enter dodaje nowy part
        //console.log(partObj.Data);

        var partObj = $scope.parts[partObjIndex];
        if (event.keyCode == 13 && /\s*<br>\s*<br>\s*$/.test(partObj.Data)) { //enter
            //console.log("three enters");
            //console.log("before: " + $scope.parts[partObjIndex].Data);
            //$scope.parts[partObjIndex].Data = $scope.parts[partObjIndex].Data.replace(/\s*<br>\s*<br>\s*$/g, ""); //usun ostatni enter
            $scope.parts[partObjIndex].Data = $scope.parts[partObjIndex].Data.replace(/\s*<br>\s*$/g, "");
            //console.log("after: " + $scope.parts[partObjIndex].Data);
            addPart(partObjIndex);
            event.preventDefault(); //żeby nie dawało już tego entera
        }
    }
    
    function updatePart(index) {
        //console.log("update");
        var partObj = $scope.parts[index];
        parts.put(partObj);
    }

    function addPart(lastIndex) {
        //$scope.parts.push({ Data: "new" });
        //console.log("lastIndex: " + lastIndex);
        //console.table($scope.parts);
        var atIndex = lastIndex + 1;
        if (lastIndex == null) {
            atIndex = 0;
        }

        $scope.parts.splice(atIndex, 0, { Data: "new", NoteID: $scope.currentNoteId }); //add at index
        //console.log("after");
        //console.table($scope.parts);
        focusOn("part" + atIndex);
        parts.post($scope.parts[atIndex]);
    }

    function partsCheckForNull(){
        if ($scope.parts.length == 0 || $scope.parts == null) {
            addPart();
        }
    }
});
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
        console.table(part);
        //TODO
        return $http({
            method: 'PUT',
            url: '/api/Parts',
            data: part,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    return parts;
}]);
(function () {
    'use strict';

    
})();

var app = angular.module('ConsoleNotepad', [
        // Angular modules 
        'ngRoute'

        // Custom modules 

        // 3rd Party Modules

]);

app.directive('contenteditable', function () {
    return {
        restrict: 'A', // only activate on element attribute
        require: '?ngModel', // get a hold of NgModelController
        link: function (scope, element, attrs, ngModel) {
            if (!ngModel) return; // do nothing if no ng-model

            // Specify how UI should be updated
            ngModel.$render = function () {
                element.html(ngModel.$viewValue || '');
            };

            // Listen for change events to enable binding
            element.on('blur keyup change', function () {
                scope.$apply(read);
            });
            read(); // initialize

            // Write data to the model
            function read() {
                var html = element.html();
                // When we clear the content editable the browser leaves a <br> behind
                // If strip-br attribute is provided then we strip this out
                if (attrs.stripBr && html == '<br>') {
                    html = '';
                }
                ngModel.$setViewValue(html);
            }
        }
    };
});
app.directive('focusOn', function () {
    return function (scope, elem, attr) {
        scope.$on('focusOn', function (e, name) {
            if (name === attr.focusOn) {
                elem[0].focus();
            }
        });
    };
});

app.factory('focusOn', function ($rootScope, $timeout) {
    return function (name) {
        $timeout(function () {
            $rootScope.$broadcast('focusOn', name);
        });
    }
});
app.controller('editorController', function ($scope, notes, parts, focusOn) {
    $scope.suggestions = {};
    $scope.highlightedSuggestion = -1;
    $scope.currentNoteId = 0;
    $scope.parts = [
        {
            Data: "new"
        }
    ];
    var timeoutUpdate; //setTimeout to update Part
    var editingPartOptions = {};
    $scope.focusOnPart = 0;

    $scope.smartBarKeyDown = function (event) {
        console.log("Refresh " + event.keyCode)
        if (event.keyCode == 32) { //space
            $scope.suggestions = notes.getSuggested($scope.smartBar).success(function (data) {
                console.table(data);
                $scope.suggestions = data;
            });
            console.log("Refreshed");
        }

        if (event.keyCode == 40 && $scope.highlightedSuggestion < $scope.suggestions.length-1) { //arrow down
            event.preventDefault();
            $scope.highlightedSuggestion++;
        }
        if (event.keyCode == 38 && $scope.highlightedSuggestion > -1) { //arrow up
            event.preventDefault();
            $scope.highlightedSuggestion--;
        }

        if (event.keyCode == 13 && $scope.highlightedSuggestion > -1) { //enter
            //uzupełnij inputa, zacznij pisanie notatki
            $scope.smartBar = "";
            console.table($scope.suggestions[$scope.highlightedSuggestion].NoteTags);
            var note = $scope.suggestions[$scope.highlightedSuggestion];
            console.table(note);
            for (var nt in note.NoteTags) {
                //console.log(nt);
                $scope.smartBar += note.NoteTags[nt].Tag.Name + " ";
            }

            $scope.currentNoteId = note.NoteId;
            $scope.parts = parts.get($scope.currentNoteId).success(function (data) {
                $scope.parts = data;
                partsCheckForNull();
            });

        }
    }

    $scope.editingPartKeyDown = function (event, partObjIndex) {
        clearTimeout(timeoutUpdate);
        timeoutUpdate = setTimeout(function () { updatePart(partObjIndex) }, 3000);
        //timeoutUpdate = setTimeout(function () { alert("chuj");}, 3000);

        //2x enter dodaje nowy part
        //console.log(partObj.Data);

        var partObj = $scope.parts[partObjIndex];
        if (event.keyCode == 13 && /\s*<br>\s*<br>\s*$/.test(partObj.Data)) { //enter
            //console.log("three enters");
            //console.log("before: " + $scope.parts[partObjIndex].Data);
            //$scope.parts[partObjIndex].Data = $scope.parts[partObjIndex].Data.replace(/\s*<br>\s*<br>\s*$/g, ""); //usun ostatni enter
            $scope.parts[partObjIndex].Data = $scope.parts[partObjIndex].Data.replace(/\s*<br>\s*$/g, "");
            //console.log("after: " + $scope.parts[partObjIndex].Data);
            addPart(partObjIndex);
            event.preventDefault(); //żeby nie dawało już tego entera
        }
    }
    
    function updatePart(index) {
        //console.log("update");
        var partObj = $scope.parts[index];
        parts.put(partObj);
    }

    function addPart(lastIndex) {
        //$scope.parts.push({ Data: "new" });
        //console.log("lastIndex: " + lastIndex);
        //console.table($scope.parts);
        var atIndex = lastIndex + 1;
        if (lastIndex == null) {
            atIndex = 0;
        }

        $scope.parts.splice(atIndex, 0, { Data: "new", NoteID: $scope.currentNoteId }); //add at index
        //console.log("after");
        //console.table($scope.parts);
        focusOn("part" + atIndex);
        parts.post($scope.parts[atIndex]);
    }

    function partsCheckForNull(){
        if ($scope.parts.length == 0 || $scope.parts == null) {
            addPart();
        }
    }
});
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
        console.log("Updating");
        console.table(part);
        //TODO
        return $http({
            method: 'PUT',
            url: '/api/Parts',
            data: part,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    return parts;
}]);
(function () {
    'use strict';

    
})();

var app = angular.module('ConsoleNotepad', [
        // Angular modules 
        'ngRoute'

        // Custom modules 

        // 3rd Party Modules

]);

app.directive('contenteditable', function () {
    return {
        restrict: 'A', // only activate on element attribute
        require: '?ngModel', // get a hold of NgModelController
        link: function (scope, element, attrs, ngModel) {
            if (!ngModel) return; // do nothing if no ng-model

            // Specify how UI should be updated
            ngModel.$render = function () {
                element.html(ngModel.$viewValue || '');
            };

            // Listen for change events to enable binding
            element.on('blur keyup change', function () {
                scope.$apply(read);
            });
            read(); // initialize

            // Write data to the model
            function read() {
                var html = element.html();
                // When we clear the content editable the browser leaves a <br> behind
                // If strip-br attribute is provided then we strip this out
                if (attrs.stripBr && html == '<br>') {
                    html = '';
                }
                ngModel.$setViewValue(html);
            }
        }
    };
});
app.directive('focusOn', function () {
    return function (scope, elem, attr) {
        scope.$on('focusOn', function (e, name) {
            if (name === attr.focusOn) {
                elem[0].focus();
            }
        });
    };
});

app.factory('focusOn', function ($rootScope, $timeout) {
    return function (name) {
        $timeout(function () {
            $rootScope.$broadcast('focusOn', name);
        });
    }
});
app.controller('editorController', function ($scope, notes, parts, focusOn) {
    $scope.suggestions = {};
    $scope.highlightedSuggestion = -1;
    $scope.currentNoteId = 0;
    $scope.parts = [
        {
            Data: "new"
        }
    ];
    var timeoutUpdate; //setTimeout to update Part
    var editingPartOptions = {};
    $scope.focusOnPart = 0;

    $scope.smartBarKeyDown = function (event) {
        console.log("Refresh " + event.keyCode)
        if (event.keyCode == 32) { //space
            $scope.suggestions = notes.getSuggested($scope.smartBar).success(function (data) {
                console.table(data);
                $scope.suggestions = data;
            });
            console.log("Refreshed");
        }

        if (event.keyCode == 40 && $scope.highlightedSuggestion < $scope.suggestions.length-1) { //arrow down
            event.preventDefault();
            $scope.highlightedSuggestion++;
        }
        if (event.keyCode == 38 && $scope.highlightedSuggestion > -1) { //arrow up
            event.preventDefault();
            $scope.highlightedSuggestion--;
        }

        if (event.keyCode == 13 && $scope.highlightedSuggestion > -1) { //enter
            //uzupełnij inputa, zacznij pisanie notatki
            $scope.smartBar = "";
            console.table($scope.suggestions[$scope.highlightedSuggestion].NoteTags);
            var note = $scope.suggestions[$scope.highlightedSuggestion];
            console.table(note);
            for (var nt in note.NoteTags) {
                //console.log(nt);
                $scope.smartBar += note.NoteTags[nt].Tag.Name + " ";
            }

            $scope.currentNoteId = note.NoteId;
            $scope.parts = parts.get($scope.currentNoteId).success(function (data) {
                $scope.parts = data;
                partsCheckForNull();
            });

        }
    }

    $scope.editingPartKeyDown = function (event, partObjIndex) {
        clearTimeout(timeoutUpdate);
        timeoutUpdate = setTimeout(function () { updatePart(partObjIndex) }, 3000);
        //timeoutUpdate = setTimeout(function () { alert("chuj");}, 3000);

        //2x enter dodaje nowy part
        //console.log(partObj.Data);

        var partObj = $scope.parts[partObjIndex];
        if (event.keyCode == 13 && /\s*<br>\s*<br>\s*$/.test(partObj.Data)) { //enter
            //console.log("three enters");
            //console.log("before: " + $scope.parts[partObjIndex].Data);
            //$scope.parts[partObjIndex].Data = $scope.parts[partObjIndex].Data.replace(/\s*<br>\s*<br>\s*$/g, ""); //usun ostatni enter
            $scope.parts[partObjIndex].Data = $scope.parts[partObjIndex].Data.replace(/\s*<br>\s*$/g, "");
            //console.log("after: " + $scope.parts[partObjIndex].Data);
            addPart(partObjIndex);
            event.preventDefault(); //żeby nie dawało już tego entera
        }
    }
    
    function updatePart(index) {
        //console.log("update");
        var partObj = $scope.parts[index];
        parts.put(partObj);
    }

    function addPart(lastIndex) {
        //$scope.parts.push({ Data: "new" });
        //console.log("lastIndex: " + lastIndex);
        //console.table($scope.parts);
        var atIndex = lastIndex + 1;
        if (lastIndex == null) {
            atIndex = 0;
        }

        $scope.parts.splice(atIndex, 0, { Data: "new", NoteID: $scope.currentNoteId }); //add at index
        //console.log("after");
        //console.table($scope.parts);
        focusOn("part" + atIndex);
        parts.post($scope.parts[atIndex]);
    }

    function partsCheckForNull(){
        if ($scope.parts.length == 0 || $scope.parts == null) {
            addPart();
        }
    }
});
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
        console.log("Updating...");
        console.table(part);
        //TODO
        return $http({
            method: 'PUT',
            url: '/api/Parts',
            data: part,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    return parts;
}]);
(function () {
    'use strict';

    
})();

var app = angular.module('ConsoleNotepad', [
        // Angular modules 
        'ngRoute'

        // Custom modules 

        // 3rd Party Modules

]);

app.directive('contenteditable', function () {
    return {
        restrict: 'A', // only activate on element attribute
        require: '?ngModel', // get a hold of NgModelController
        link: function (scope, element, attrs, ngModel) {
            if (!ngModel) return; // do nothing if no ng-model

            // Specify how UI should be updated
            ngModel.$render = function () {
                element.html(ngModel.$viewValue || '');
            };

            // Listen for change events to enable binding
            element.on('blur keyup change', function () {
                scope.$apply(read);
            });
            read(); // initialize

            // Write data to the model
            function read() {
                var html = element.html();
                // When we clear the content editable the browser leaves a <br> behind
                // If strip-br attribute is provided then we strip this out
                if (attrs.stripBr && html == '<br>') {
                    html = '';
                }
                ngModel.$setViewValue(html);
            }
        }
    };
});
app.directive('focusOn', function () {
    return function (scope, elem, attr) {
        scope.$on('focusOn', function (e, name) {
            if (name === attr.focusOn) {
                elem[0].focus();
            }
        });
    };
});

app.factory('focusOn', function ($rootScope, $timeout) {
    return function (name) {
        $timeout(function () {
            $rootScope.$broadcast('focusOn', name);
        });
    }
});
app.controller('editorController', function ($scope, notes, parts, focusOn) {
    $scope.suggestions = {};
    $scope.highlightedSuggestion = -1;
    $scope.currentNoteId = 0;
    $scope.parts = [
        {
            Data: "new"
        }
    ];
    var timeoutUpdate; //setTimeout to update Part
    var editingPartOptions = {};
    $scope.focusOnPart = 0;

    $scope.smartBarKeyDown = function (event) {
        console.log("Refresh " + event.keyCode)
        if (event.keyCode == 32) { //space
            $scope.suggestions = notes.getSuggested($scope.smartBar).success(function (data) {
                console.table(data);
                $scope.suggestions = data;
            });
            console.log("Refreshed");
        }

        if (event.keyCode == 40 && $scope.highlightedSuggestion < $scope.suggestions.length-1) { //arrow down
            event.preventDefault();
            $scope.highlightedSuggestion++;
        }
        if (event.keyCode == 38 && $scope.highlightedSuggestion > -1) { //arrow up
            event.preventDefault();
            $scope.highlightedSuggestion--;
        }

        if (event.keyCode == 13 && $scope.highlightedSuggestion > -1) { //enter
            //uzupełnij inputa, zacznij pisanie notatki
            $scope.smartBar = "";
            console.table($scope.suggestions[$scope.highlightedSuggestion].NoteTags);
            var note = $scope.suggestions[$scope.highlightedSuggestion];
            console.table(note);
            for (var nt in note.NoteTags) {
                //console.log(nt);
                $scope.smartBar += note.NoteTags[nt].Tag.Name + " ";
            }

            $scope.currentNoteId = note.NoteId;
            $scope.parts = parts.get($scope.currentNoteId).success(function (data) {
                $scope.parts = data;
                console.table(data);
                partsCheckForNull();
            });

        }
    }

    $scope.editingPartKeyDown = function (event, partObjIndex) {
        clearTimeout(timeoutUpdate);
        timeoutUpdate = setTimeout(function () { updatePart(partObjIndex) }, 3000);
        //timeoutUpdate = setTimeout(function () { alert("chuj");}, 3000);

        //2x enter dodaje nowy part
        //console.log(partObj.Data);

        var partObj = $scope.parts[partObjIndex];
        if (event.keyCode == 13 && /\s*<br>\s*<br>\s*$/.test(partObj.Data)) { //enter
            //console.log("three enters");
            //console.log("before: " + $scope.parts[partObjIndex].Data);
            //$scope.parts[partObjIndex].Data = $scope.parts[partObjIndex].Data.replace(/\s*<br>\s*<br>\s*$/g, ""); //usun ostatni enter
            $scope.parts[partObjIndex].Data = $scope.parts[partObjIndex].Data.replace(/\s*<br>\s*$/g, "");
            //console.log("after: " + $scope.parts[partObjIndex].Data);
            addPart(partObjIndex);
            event.preventDefault(); //żeby nie dawało już tego entera
        }
    }
    
    function updatePart(index) {
        //console.log("update");
        var partObj = $scope.parts[index];
        parts.put(partObj);
    }

    function addPart(lastIndex) {
        //$scope.parts.push({ Data: "new" });
        //console.log("lastIndex: " + lastIndex);
        //console.table($scope.parts);
        var atIndex = lastIndex + 1;
        if (lastIndex == null) {
            atIndex = 0;
        }

        $scope.parts.splice(atIndex, 0, { Data: "new", NoteID: $scope.currentNoteId }); //add at index
        //console.log("after");
        //console.table($scope.parts);
        focusOn("part" + atIndex);
        parts.post($scope.parts[atIndex]);
    }

    function partsCheckForNull(){
        if ($scope.parts.length == 0 || $scope.parts == null) {
            addPart();
        }
    }
});
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
        console.log("Updating...");
        console.table(part);
        //TODO
        return $http({
            method: 'PUT',
            url: '/api/Parts',
            data: part,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    return parts;
}]);
(function () {
    'use strict';

    
})();

var app = angular.module('ConsoleNotepad', [
        // Angular modules 
        'ngRoute'

        // Custom modules 

        // 3rd Party Modules

]);

app.directive('contenteditable', function () {
    return {
        restrict: 'A', // only activate on element attribute
        require: '?ngModel', // get a hold of NgModelController
        link: function (scope, element, attrs, ngModel) {
            if (!ngModel) return; // do nothing if no ng-model

            // Specify how UI should be updated
            ngModel.$render = function () {
                element.html(ngModel.$viewValue || '');
            };

            // Listen for change events to enable binding
            element.on('blur keyup change', function () {
                scope.$apply(read);
            });
            read(); // initialize

            // Write data to the model
            function read() {
                var html = element.html();
                // When we clear the content editable the browser leaves a <br> behind
                // If strip-br attribute is provided then we strip this out
                if (attrs.stripBr && html == '<br>') {
                    html = '';
                }
                ngModel.$setViewValue(html);
            }
        }
    };
});
app.directive('focusOn', function () {
    return function (scope, elem, attr) {
        scope.$on('focusOn', function (e, name) {
            if (name === attr.focusOn) {
                elem[0].focus();
            }
        });
    };
});

app.factory('focusOn', function ($rootScope, $timeout) {
    return function (name) {
        $timeout(function () {
            $rootScope.$broadcast('focusOn', name);
        });
    }
});
app.controller('editorController', function ($scope, notes, parts, focusOn) {
    $scope.suggestions = {};
    $scope.highlightedSuggestion = -1;
    $scope.currentNoteId = 0;
    $scope.parts = [
        {
            Data: "new"
        }
    ];
    var timeoutUpdate; //setTimeout to update Part
    var editingPartOptions = {};
    $scope.focusOnPart = 0;

    $scope.smartBarKeyDown = function (event) {
        console.log("Refresh " + event.keyCode)
        if (event.keyCode == 32) { //space
            $scope.suggestions = notes.getSuggested($scope.smartBar).success(function (data) {
                console.table(data);
                $scope.suggestions = data;
            });
            console.log("Refreshed");
        }

        if (event.keyCode == 40 && $scope.highlightedSuggestion < $scope.suggestions.length-1) { //arrow down
            event.preventDefault();
            $scope.highlightedSuggestion++;
        }
        if (event.keyCode == 38 && $scope.highlightedSuggestion > -1) { //arrow up
            event.preventDefault();
            $scope.highlightedSuggestion--;
        }

        if (event.keyCode == 13 && $scope.highlightedSuggestion > -1) { //enter
            //uzupełnij inputa, zacznij pisanie notatki
            $scope.smartBar = "";
            console.table($scope.suggestions[$scope.highlightedSuggestion].NoteTags);
            var note = $scope.suggestions[$scope.highlightedSuggestion];
            console.table(note);
            for (var nt in note.NoteTags) {
                //console.log(nt);
                $scope.smartBar += note.NoteTags[nt].Tag.Name + " ";
            }

            $scope.currentNoteId = note.NoteId;
            $scope.parts = parts.get($scope.currentNoteId).success(function (data) {
                $scope.parts = data;
                console.console("Got data: ");
                console.table(data);
                partsCheckForNull();
            });

        }
    }

    $scope.editingPartKeyDown = function (event, partObjIndex) {
        clearTimeout(timeoutUpdate);
        timeoutUpdate = setTimeout(function () { updatePart(partObjIndex) }, 3000);
        //timeoutUpdate = setTimeout(function () { alert("chuj");}, 3000);

        //2x enter dodaje nowy part
        //console.log(partObj.Data);

        var partObj = $scope.parts[partObjIndex];
        if (event.keyCode == 13 && /\s*<br>\s*<br>\s*$/.test(partObj.Data)) { //enter
            //console.log("three enters");
            //console.log("before: " + $scope.parts[partObjIndex].Data);
            //$scope.parts[partObjIndex].Data = $scope.parts[partObjIndex].Data.replace(/\s*<br>\s*<br>\s*$/g, ""); //usun ostatni enter
            $scope.parts[partObjIndex].Data = $scope.parts[partObjIndex].Data.replace(/\s*<br>\s*$/g, "");
            //console.log("after: " + $scope.parts[partObjIndex].Data);
            addPart(partObjIndex);
            event.preventDefault(); //żeby nie dawało już tego entera
        }
    }
    
    function updatePart(index) {
        //console.log("update");
        var partObj = $scope.parts[index];
        parts.put(partObj);
    }

    function addPart(lastIndex) {
        //$scope.parts.push({ Data: "new" });
        //console.log("lastIndex: " + lastIndex);
        //console.table($scope.parts);
        var atIndex = lastIndex + 1;
        if (lastIndex == null) {
            atIndex = 0;
        }

        $scope.parts.splice(atIndex, 0, { Data: "new", NoteID: $scope.currentNoteId }); //add at index
        //console.log("after");
        //console.table($scope.parts);
        focusOn("part" + atIndex);
        parts.post($scope.parts[atIndex]);
    }

    function partsCheckForNull(){
        if ($scope.parts.length == 0 || $scope.parts == null) {
            addPart();
        }
    }
});
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
        console.log("Updating...");
        console.table(part);
        //TODO
        return $http({
            method: 'PUT',
            url: '/api/Parts',
            data: part,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    return parts;
}]);
(function () {
    'use strict';

    
})();

var app = angular.module('ConsoleNotepad', [
        // Angular modules 
        'ngRoute'

        // Custom modules 

        // 3rd Party Modules

]);

app.directive('contenteditable', function () {
    return {
        restrict: 'A', // only activate on element attribute
        require: '?ngModel', // get a hold of NgModelController
        link: function (scope, element, attrs, ngModel) {
            if (!ngModel) return; // do nothing if no ng-model

            // Specify how UI should be updated
            ngModel.$render = function () {
                element.html(ngModel.$viewValue || '');
            };

            // Listen for change events to enable binding
            element.on('blur keyup change', function () {
                scope.$apply(read);
            });
            read(); // initialize

            // Write data to the model
            function read() {
                var html = element.html();
                // When we clear the content editable the browser leaves a <br> behind
                // If strip-br attribute is provided then we strip this out
                if (attrs.stripBr && html == '<br>') {
                    html = '';
                }
                ngModel.$setViewValue(html);
            }
        }
    };
});
app.directive('focusOn', function () {
    return function (scope, elem, attr) {
        scope.$on('focusOn', function (e, name) {
            if (name === attr.focusOn) {
                elem[0].focus();
            }
        });
    };
});

app.factory('focusOn', function ($rootScope, $timeout) {
    return function (name) {
        $timeout(function () {
            $rootScope.$broadcast('focusOn', name);
        });
    }
});
app.controller('editorController', function ($scope, notes, parts, focusOn) {
    $scope.suggestions = {};
    $scope.highlightedSuggestion = -1;
    $scope.currentNoteId = 0;
    $scope.parts = [
        {
            Data: "new"
        }
    ];
    var timeoutUpdate; //setTimeout to update Part
    var editingPartOptions = {};
    $scope.focusOnPart = 0;

    $scope.smartBarKeyDown = function (event) {
        console.log("Refresh " + event.keyCode)
        if (event.keyCode == 32) { //space
            $scope.suggestions = notes.getSuggested($scope.smartBar).success(function (data) {
                console.table(data);
                $scope.suggestions = data;
            });
            console.log("Refreshed");
        }

        if (event.keyCode == 40 && $scope.highlightedSuggestion < $scope.suggestions.length-1) { //arrow down
            event.preventDefault();
            $scope.highlightedSuggestion++;
        }
        if (event.keyCode == 38 && $scope.highlightedSuggestion > -1) { //arrow up
            event.preventDefault();
            $scope.highlightedSuggestion--;
        }

        if (event.keyCode == 13 && $scope.highlightedSuggestion > -1) { //enter
            //uzupełnij inputa, zacznij pisanie notatki
            $scope.smartBar = "";
            console.table($scope.suggestions[$scope.highlightedSuggestion].NoteTags);
            var note = $scope.suggestions[$scope.highlightedSuggestion];
            console.table(note);
            for (var nt in note.NoteTags) {
                //console.log(nt);
                $scope.smartBar += note.NoteTags[nt].Tag.Name + " ";
            }

            $scope.currentNoteId = note.NoteId;
            $scope.parts = parts.get($scope.currentNoteId).success(function (data) {
                $scope.parts = data;
                console.log("Got data: ");
                console.table(data);
                partsCheckForNull();
            });

        }
    }

    $scope.editingPartKeyDown = function (event, partObjIndex) {
        clearTimeout(timeoutUpdate);
        timeoutUpdate = setTimeout(function () { updatePart(partObjIndex) }, 3000);
        //timeoutUpdate = setTimeout(function () { alert("chuj");}, 3000);

        //2x enter dodaje nowy part
        //console.log(partObj.Data);

        var partObj = $scope.parts[partObjIndex];
        if (event.keyCode == 13 && /\s*<br>\s*<br>\s*$/.test(partObj.Data)) { //enter
            //console.log("three enters");
            //console.log("before: " + $scope.parts[partObjIndex].Data);
            //$scope.parts[partObjIndex].Data = $scope.parts[partObjIndex].Data.replace(/\s*<br>\s*<br>\s*$/g, ""); //usun ostatni enter
            $scope.parts[partObjIndex].Data = $scope.parts[partObjIndex].Data.replace(/\s*<br>\s*$/g, "");
            //console.log("after: " + $scope.parts[partObjIndex].Data);
            addPart(partObjIndex);
            event.preventDefault(); //żeby nie dawało już tego entera
        }
    }
    
    function updatePart(index) {
        //console.log("update");
        var partObj = $scope.parts[index];
        parts.put(partObj);
    }

    function addPart(lastIndex) {
        //$scope.parts.push({ Data: "new" });
        //console.log("lastIndex: " + lastIndex);
        //console.table($scope.parts);
        var atIndex = lastIndex + 1;
        if (lastIndex == null) {
            atIndex = 0;
        }

        $scope.parts.splice(atIndex, 0, { Data: "new", NoteID: $scope.currentNoteId }); //add at index
        //console.log("after");
        //console.table($scope.parts);
        focusOn("part" + atIndex);
        parts.post($scope.parts[atIndex]);
    }

    function partsCheckForNull(){
        if ($scope.parts.length == 0 || $scope.parts == null) {
            addPart();
        }
    }
});
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
        console.log("Updating...");
        console.table(part);
        //TODO
        return $http({
            method: 'PUT',
            url: '/api/Parts',
            data: part,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    return parts;
}]);
(function () {
    'use strict';

    
})();

var app = angular.module('ConsoleNotepad', [
        // Angular modules 
        'ngRoute'

        // Custom modules 

        // 3rd Party Modules

]);

app.directive('contenteditable', function () {
    return {
        restrict: 'A', // only activate on element attribute
        require: '?ngModel', // get a hold of NgModelController
        link: function (scope, element, attrs, ngModel) {
            if (!ngModel) return; // do nothing if no ng-model

            // Specify how UI should be updated
            ngModel.$render = function () {
                element.html(ngModel.$viewValue || '');
            };

            // Listen for change events to enable binding
            element.on('blur keyup change', function () {
                scope.$apply(read);
            });
            read(); // initialize

            // Write data to the model
            function read() {
                var html = element.html();
                // When we clear the content editable the browser leaves a <br> behind
                // If strip-br attribute is provided then we strip this out
                if (attrs.stripBr && html == '<br>') {
                    html = '';
                }
                ngModel.$setViewValue(html);
            }
        }
    };
});
app.directive('focusOn', function () {
    return function (scope, elem, attr) {
        scope.$on('focusOn', function (e, name) {
            if (name === attr.focusOn) {
                elem[0].focus();
            }
        });
    };
});

app.factory('focusOn', function ($rootScope, $timeout) {
    return function (name) {
        $timeout(function () {
            $rootScope.$broadcast('focusOn', name);
        });
    }
});
app.controller('editorController', function ($scope, notes, parts, focusOn) {
    $scope.suggestions = {};
    $scope.highlightedSuggestion = -1;
    $scope.currentNoteId = 0;
    $scope.parts = [
        {
            Data: "new"
        }
    ];
    var timeoutUpdate; //setTimeout to update Part
    var editingPartOptions = {};
    $scope.focusOnPart = 0;

    $scope.smartBarKeyDown = function (event) {
        console.log("Refresh " + event.keyCode)
        if (event.keyCode == 32) { //space
            $scope.suggestions = notes.getSuggested($scope.smartBar).success(function (data) {
                console.table(data);
                $scope.suggestions = data;
            });
            console.log("Refreshed");
        }

        if (event.keyCode == 40 && $scope.highlightedSuggestion < $scope.suggestions.length-1) { //arrow down
            event.preventDefault();
            $scope.highlightedSuggestion++;
        }
        if (event.keyCode == 38 && $scope.highlightedSuggestion > -1) { //arrow up
            event.preventDefault();
            $scope.highlightedSuggestion--;
        }

        if (event.keyCode == 13 && $scope.highlightedSuggestion > -1) { //enter
            //uzupełnij inputa, zacznij pisanie notatki
            $scope.smartBar = "";
            console.table($scope.suggestions[$scope.highlightedSuggestion].NoteTags);
            var note = $scope.suggestions[$scope.highlightedSuggestion];
            console.table(note);
            for (var nt in note.NoteTags) {
                //console.log(nt);
                $scope.smartBar += note.NoteTags[nt].Tag.Name + " ";
            }

            $scope.currentNoteId = note.NoteId;
            $scope.parts = parts.get($scope.currentNoteId).success(function (data) {
                $scope.parts = data;
                console.log("Got data: ");
                console.table(data);
                partsCheckForNull();
            });

        }
    }

    $scope.editingPartKeyDown = function (event, partObjIndex) {
        clearTimeout(timeoutUpdate);
        timeoutUpdate = setTimeout(function () { updatePart(partObjIndex) }, 3000);
        //timeoutUpdate = setTimeout(function () { alert("chuj");}, 3000);

        //2x enter dodaje nowy part
        //console.log(partObj.Data);

        var partObj = $scope.parts[partObjIndex];
        if (event.keyCode == 13 && /\s*<br>\s*<br>\s*$/.test(partObj.Data)) { //enter
            //console.log("three enters");
            //console.log("before: " + $scope.parts[partObjIndex].Data);
            //$scope.parts[partObjIndex].Data = $scope.parts[partObjIndex].Data.replace(/\s*<br>\s*<br>\s*$/g, ""); //usun ostatni enter
            $scope.parts[partObjIndex].Data = $scope.parts[partObjIndex].Data.replace(/\s*<br>\s*$/g, "");
            //console.log("after: " + $scope.parts[partObjIndex].Data);
            addPart(partObjIndex);
            event.preventDefault(); //żeby nie dawało już tego entera
        }
    }
    
    function updatePart(index) {
        //console.log("update");
        var partObj = $scope.parts[index];
        parts.put(partObj);
    }

    function addPart(lastIndex) {
        //$scope.parts.push({ Data: "new" });
        //console.log("lastIndex: " + lastIndex);
        //console.table($scope.parts);
        var atIndex = lastIndex + 1;
        if (lastIndex == null) {
            atIndex = 0;
        }

        $scope.parts.splice(atIndex, 0, { Data: "new", NoteID: $scope.currentNoteId }); //add at index
        //console.log("after");
        //console.table($scope.parts);
        focusOn("part" + atIndex);
        parts.post($scope.parts[atIndex]);
    }

    function partsCheckForNull(){
        if ($scope.parts.length == 0 || $scope.parts == null) {
            addPart();
        }
    }
});
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
        console.log("Updating...");
        console.table(part);
        //TODO
        return $http({
            method: 'PUT',
            url: '/api/Parts/'+part.ID,
            data: part,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    return parts;
}]);
(function () {
    'use strict';

    
})();

var app = angular.module('ConsoleNotepad', [
        // Angular modules 
        'ngRoute'

        // Custom modules 

        // 3rd Party Modules

]);

app.directive('contenteditable', function () {
    return {
        restrict: 'A', // only activate on element attribute
        require: '?ngModel', // get a hold of NgModelController
        link: function (scope, element, attrs, ngModel) {
            if (!ngModel) return; // do nothing if no ng-model

            // Specify how UI should be updated
            ngModel.$render = function () {
                element.html(ngModel.$viewValue || '');
            };

            // Listen for change events to enable binding
            element.on('blur keyup change', function () {
                scope.$apply(read);
            });
            read(); // initialize

            // Write data to the model
            function read() {
                var html = element.html();
                // When we clear the content editable the browser leaves a <br> behind
                // If strip-br attribute is provided then we strip this out
                if (attrs.stripBr && html == '<br>') {
                    html = '';
                }
                ngModel.$setViewValue(html);
            }
        }
    };
});
app.directive('focusOn', function () {
    return function (scope, elem, attr) {
        scope.$on('focusOn', function (e, name) {
            if (name === attr.focusOn) {
                elem[0].focus();
            }
        });
    };
});

app.factory('focusOn', function ($rootScope, $timeout) {
    return function (name) {
        $timeout(function () {
            $rootScope.$broadcast('focusOn', name);
        });
    }
});
app.controller('editorController', function ($scope, notes, parts, focusOn) {
    $scope.suggestions = {};
    $scope.highlightedSuggestion = -1;
    $scope.currentNoteId = 0;
    $scope.parts = [
        {
            Data: "new"
        }
    ];
    var timeoutUpdate; //setTimeout to update Part
    var editingPartOptions = {};
    $scope.focusOnPart = 0;

    $scope.smartBarKeyDown = function (event) {
        console.log("Refresh " + event.keyCode)
        if (event.keyCode == 32) { //space
            $scope.suggestions = notes.getSuggested($scope.smartBar).success(function (data) {
                console.table(data);
                $scope.suggestions = data;
            });
            console.log("Refreshed");
        }

        if (event.keyCode == 40 && $scope.highlightedSuggestion < $scope.suggestions.length-1) { //arrow down
            event.preventDefault();
            $scope.highlightedSuggestion++;
        }
        if (event.keyCode == 38 && $scope.highlightedSuggestion > -1) { //arrow up
            event.preventDefault();
            $scope.highlightedSuggestion--;
        }

        if (event.keyCode == 13 && $scope.highlightedSuggestion > -1) { //enter
            //uzupełnij inputa, zacznij pisanie notatki
            $scope.smartBar = "";
            console.table($scope.suggestions[$scope.highlightedSuggestion].NoteTags);
            var note = $scope.suggestions[$scope.highlightedSuggestion];
            console.table(note);
            for (var nt in note.NoteTags) {
                //console.log(nt);
                $scope.smartBar += note.NoteTags[nt].Tag.Name + " ";
            }

            $scope.currentNoteId = note.NoteId;
            $scope.parts = parts.get($scope.currentNoteId).success(function (data) {
                $scope.parts = data;
                console.log("Got data: ");
                console.table(data);
                partsCheckForNull();
            });

        }
    }

    $scope.editingPartKeyDown = function (event, partObjIndex) {
        clearTimeout(timeoutUpdate);
        timeoutUpdate = setTimeout(function () { updatePart(partObjIndex) }, 1000);
        //timeoutUpdate = setTimeout(function () { alert("chuj");}, 3000);

        //2x enter dodaje nowy part
        //console.log(partObj.Data);

        var partObj = $scope.parts[partObjIndex];
        if (event.keyCode == 13 && /\s*<br>\s*<br>\s*$/.test(partObj.Data)) { //enter
            //console.log("three enters");
            //console.log("before: " + $scope.parts[partObjIndex].Data);
            //$scope.parts[partObjIndex].Data = $scope.parts[partObjIndex].Data.replace(/\s*<br>\s*<br>\s*$/g, ""); //usun ostatni enter
            $scope.parts[partObjIndex].Data = $scope.parts[partObjIndex].Data.replace(/\s*<br>\s*$/g, "");
            //console.log("after: " + $scope.parts[partObjIndex].Data);
            addPart(partObjIndex);
            event.preventDefault(); //żeby nie dawało już tego entera
        }
    }
    
    function updatePart(index) {
        //console.log("update");
        var partObj = $scope.parts[index];
        parts.put(partObj);
    }

    function addPart(lastIndex) {
        //$scope.parts.push({ Data: "new" });
        //console.log("lastIndex: " + lastIndex);
        //console.table($scope.parts);
        var atIndex = lastIndex + 1;
        if (lastIndex == null) {
            atIndex = 0;
        }

        $scope.parts.splice(atIndex, 0, { Data: "new", NoteID: $scope.currentNoteId }); //add at index
        //console.log("after");
        //console.table($scope.parts);
        focusOn("part" + atIndex);
        parts.post($scope.parts[atIndex]);
    }

    function partsCheckForNull(){
        if ($scope.parts.length == 0 || $scope.parts == null) {
            addPart();
        }
    }
});
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
        console.log("Updating...");
        console.table(part);
        //TODO
        return $http({
            method: 'PUT',
            url: '/api/Parts/'+part.ID,
            data: part,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    return parts;
}]);
(function () {
    'use strict';

    
})();

var app = angular.module('ConsoleNotepad', [
        // Angular modules 
        'ngRoute'

        // Custom modules 

        // 3rd Party Modules

]);

//app.directive('contenteditable', function () {
//    return {
//        restrict: 'A', // only activate on element attribute
//        require: '?ngModel', // get a hold of NgModelController
//        link: function (scope, element, attrs, ngModel) {
//            if (!ngModel) return; // do nothing if no ng-model

//            // Specify how UI should be updated
//            ngModel.$render = function () {
//                element.html(ngModel.$viewValue || '');
//            };

//            // Listen for change events to enable binding
//            element.on('blur keyup change', function () {
//                scope.$apply(read);
//            });
//            read(); // initialize

//            // Write data to the model
//            function read() {
//                var html = element.html();
//                // When we clear the content editable the browser leaves a <br> behind
//                // If strip-br attribute is provided then we strip this out
//                if (attrs.stripBr && html == '<br>') {
//                    html = '';
//                }
//                ngModel.$setViewValue(html);
//            }
//        }
//    };
//});
app.directive('focusOn', function () {
    return function (scope, elem, attr) {
        scope.$on('focusOn', function (e, name) {
            if (name === attr.focusOn) {
                elem[0].focus();
            }
        });
    };
});

app.factory('focusOn', function ($rootScope, $timeout) {
    return function (name) {
        $timeout(function () {
            $rootScope.$broadcast('focusOn', name);
        });
    }
});
app.controller('editorController', function ($scope, notes, parts, focusOn) {
    $scope.suggestions = {};
    $scope.highlightedSuggestion = -1;
    $scope.currentNoteId = 0;
    $scope.parts = [
        {
            Data: "new"
        }
    ];
    var timeoutUpdate; //setTimeout to update Part
    var editingPartOptions = {};
    $scope.focusOnPart = 0;

    $scope.smartBarKeyDown = function (event) {
        console.log("Refresh " + event.keyCode)
        if (event.keyCode == 32) { //space
            $scope.suggestions = notes.getSuggested($scope.smartBar).success(function (data) {
                console.table(data);
                $scope.suggestions = data;
            });
            console.log("Refreshed");
        }

        if (event.keyCode == 40 && $scope.highlightedSuggestion < $scope.suggestions.length-1) { //arrow down
            event.preventDefault();
            $scope.highlightedSuggestion++;
        }
        if (event.keyCode == 38 && $scope.highlightedSuggestion > -1) { //arrow up
            event.preventDefault();
            $scope.highlightedSuggestion--;
        }

        if (event.keyCode == 13 && $scope.highlightedSuggestion > -1) { //enter
            //uzupełnij inputa, zacznij pisanie notatki
            $scope.smartBar = "";
            console.table($scope.suggestions[$scope.highlightedSuggestion].NoteTags);
            var note = $scope.suggestions[$scope.highlightedSuggestion];
            console.table(note);
            for (var nt in note.NoteTags) {
                //console.log(nt);
                $scope.smartBar += note.NoteTags[nt].Tag.Name + " ";
            }

            $scope.currentNoteId = note.NoteId;
            $scope.parts = parts.get($scope.currentNoteId).success(function (data) {
                $scope.parts = data;
                console.log("Got data: ");
                console.table(data);
                partsCheckForNull();
            });

        }
    }

    $scope.editingPartKeyDown = function (event, partObjIndex) {
        clearTimeout(timeoutUpdate);
        timeoutUpdate = setTimeout(function () { updatePart(partObjIndex) }, 1000);
        //timeoutUpdate = setTimeout(function () { alert("chuj");}, 3000);

        //2x enter dodaje nowy part
        //console.log(partObj.Data);

        var partObj = $scope.parts[partObjIndex];
        if (event.keyCode == 13 && /\s*<br>\s*<br>\s*$/.test(partObj.Data)) { //enter
            //console.log("three enters");
            //console.log("before: " + $scope.parts[partObjIndex].Data);
            //$scope.parts[partObjIndex].Data = $scope.parts[partObjIndex].Data.replace(/\s*<br>\s*<br>\s*$/g, ""); //usun ostatni enter
            $scope.parts[partObjIndex].Data = $scope.parts[partObjIndex].Data.replace(/\s*<br>\s*$/g, "");
            //console.log("after: " + $scope.parts[partObjIndex].Data);
            addPart(partObjIndex);
            event.preventDefault(); //żeby nie dawało już tego entera
        }
    }
    
    function updatePart(index) {
        //console.log("update");
        var partObj = $scope.parts[index];
        parts.put(partObj);
    }

    function addPart(lastIndex) {
        //$scope.parts.push({ Data: "new" });
        //console.log("lastIndex: " + lastIndex);
        //console.table($scope.parts);
        var atIndex = lastIndex + 1;
        if (lastIndex == null) {
            atIndex = 0;
        }

        $scope.parts.splice(atIndex, 0, { Data: "new", NoteID: $scope.currentNoteId }); //add at index
        //console.log("after");
        //console.table($scope.parts);
        focusOn("part" + atIndex);
        parts.post($scope.parts[atIndex]);
    }

    function partsCheckForNull(){
        if ($scope.parts.length == 0 || $scope.parts == null) {
            addPart();
        }
    }
});
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
        console.log("Updating...");
        console.table(part);
        //TODO
        return $http({
            method: 'PUT',
            url: '/api/Parts/'+part.ID,
            data: part,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    return parts;
}]);
(function () {
    'use strict';

    
})();

var app = angular.module('ConsoleNotepad', [
        // Angular modules 
        'ngRoute'

        // Custom modules 

        // 3rd Party Modules

]);

//app.directive('contenteditable', function () {
//    return {
//        restrict: 'A', // only activate on element attribute
//        require: '?ngModel', // get a hold of NgModelController
//        link: function (scope, element, attrs, ngModel) {
//            if (!ngModel) return; // do nothing if no ng-model

//            // Specify how UI should be updated
//            ngModel.$render = function () {
//                element.html(ngModel.$viewValue || '');
//            };

//            // Listen for change events to enable binding
//            element.on('blur keyup change', function () {
//                scope.$apply(read);
//            });
//            read(); // initialize

//            // Write data to the model
//            function read() {
//                var html = element.html();
//                // When we clear the content editable the browser leaves a <br> behind
//                // If strip-br attribute is provided then we strip this out
//                if (attrs.stripBr && html == '<br>') {
//                    html = '';
//                }
//                ngModel.$setViewValue(html);
//            }
//        }
//    };
//});

app.directive('contenteditable', [function () {
    return {
        require: '?ngModel',
        scope: {

        },
        link: function (scope, element, attrs, ctrl) {
            // view -> model (when div gets blur update the view value of the model)
            element.bind('blur', function () {
                scope.$apply(function () {
                    ctrl.$setViewValue(element.html());
                });
            });

            // model -> view
            ctrl.$render = function () {
                element.html(ctrl.$viewValue);
            };

            // load init value from DOM
            ctrl.$render();

            // remove the attached events to element when destroying the scope
            scope.$on('$destroy', function () {
                element.unbind('blur');
                element.unbind('paste');
                element.unbind('focus');
            });
        }
    };
}]);
app.directive('focusOn', function () {
    return function (scope, elem, attr) {
        scope.$on('focusOn', function (e, name) {
            if (name === attr.focusOn) {
                elem[0].focus();
            }
        });
    };
});

app.factory('focusOn', function ($rootScope, $timeout) {
    return function (name) {
        $timeout(function () {
            $rootScope.$broadcast('focusOn', name);
        });
    }
});
app.controller('editorController', function ($scope, notes, parts, focusOn) {
    $scope.suggestions = {};
    $scope.highlightedSuggestion = -1;
    $scope.currentNoteId = 0;
    $scope.parts = [
        {
            Data: "new"
        }
    ];
    var timeoutUpdate; //setTimeout to update Part
    var editingPartOptions = {};
    $scope.focusOnPart = 0;

    $scope.smartBarKeyDown = function (event) {
        console.log("Refresh " + event.keyCode)
        if (event.keyCode == 32) { //space
            $scope.suggestions = notes.getSuggested($scope.smartBar).success(function (data) {
                console.table(data);
                $scope.suggestions = data;
            });
            console.log("Refreshed");
        }

        if (event.keyCode == 40 && $scope.highlightedSuggestion < $scope.suggestions.length-1) { //arrow down
            event.preventDefault();
            $scope.highlightedSuggestion++;
        }
        if (event.keyCode == 38 && $scope.highlightedSuggestion > -1) { //arrow up
            event.preventDefault();
            $scope.highlightedSuggestion--;
        }

        if (event.keyCode == 13 && $scope.highlightedSuggestion > -1) { //enter
            //uzupełnij inputa, zacznij pisanie notatki
            $scope.smartBar = "";
            console.table($scope.suggestions[$scope.highlightedSuggestion].NoteTags);
            var note = $scope.suggestions[$scope.highlightedSuggestion];
            console.table(note);
            for (var nt in note.NoteTags) {
                //console.log(nt);
                $scope.smartBar += note.NoteTags[nt].Tag.Name + " ";
            }

            $scope.currentNoteId = note.NoteId;
            $scope.parts = parts.get($scope.currentNoteId).success(function (data) {
                $scope.parts = data;
                console.log("Got data: ");
                console.table(data);
                partsCheckForNull();
            });

        }
    }

    $scope.editingPartKeyDown = function (event, partObjIndex) {
        clearTimeout(timeoutUpdate);
        timeoutUpdate = setTimeout(function () { updatePart(partObjIndex) }, 1000);
        //timeoutUpdate = setTimeout(function () { alert("chuj");}, 3000);

        //2x enter dodaje nowy part
        //console.log(partObj.Data);

        var partObj = $scope.parts[partObjIndex];
        if (event.keyCode == 13 && /\s*<br>\s*<br>\s*$/.test(partObj.Data)) { //enter
            //console.log("three enters");
            //console.log("before: " + $scope.parts[partObjIndex].Data);
            //$scope.parts[partObjIndex].Data = $scope.parts[partObjIndex].Data.replace(/\s*<br>\s*<br>\s*$/g, ""); //usun ostatni enter
            $scope.parts[partObjIndex].Data = $scope.parts[partObjIndex].Data.replace(/\s*<br>\s*$/g, "");
            //console.log("after: " + $scope.parts[partObjIndex].Data);
            addPart(partObjIndex);
            event.preventDefault(); //żeby nie dawało już tego entera
        }
    }
    
    function updatePart(index) {
        //console.log("update");
        var partObj = $scope.parts[index];
        parts.put(partObj);
    }

    function addPart(lastIndex) {
        //$scope.parts.push({ Data: "new" });
        //console.log("lastIndex: " + lastIndex);
        //console.table($scope.parts);
        var atIndex = lastIndex + 1;
        if (lastIndex == null) {
            atIndex = 0;
        }

        $scope.parts.splice(atIndex, 0, { Data: "new", NoteID: $scope.currentNoteId }); //add at index
        //console.log("after");
        //console.table($scope.parts);
        focusOn("part" + atIndex);
        parts.post($scope.parts[atIndex]);
    }

    function partsCheckForNull(){
        if ($scope.parts.length == 0 || $scope.parts == null) {
            addPart();
        }
    }
});
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
        console.log("Updating...");
        console.table(part);
        //TODO
        return $http({
            method: 'PUT',
            url: '/api/Parts/'+part.ID,
            data: part,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    return parts;
}]);
(function () {
    'use strict';

    
})();

var app = angular.module('ConsoleNotepad', [
        // Angular modules 
        'ngRoute'

        // Custom modules 

        // 3rd Party Modules

]);

//app.directive('contenteditable', function () {
//    return {
//        restrict: 'A', // only activate on element attribute
//        require: '?ngModel', // get a hold of NgModelController
//        link: function (scope, element, attrs, ngModel) {
//            if (!ngModel) return; // do nothing if no ng-model

//            // Specify how UI should be updated
//            ngModel.$render = function () {
//                element.html(ngModel.$viewValue || '');
//            };

//            // Listen for change events to enable binding
//            element.on('blur keyup change', function () {
//                scope.$apply(read);
//            });
//            read(); // initialize

//            // Write data to the model
//            function read() {
//                var html = element.html();
//                // When we clear the content editable the browser leaves a <br> behind
//                // If strip-br attribute is provided then we strip this out
//                if (attrs.stripBr && html == '<br>') {
//                    html = '';
//                }
//                ngModel.$setViewValue(html);
//            }
//        }
//    };
//});

app.directive('contenteditable', [function () {
    return {
        require: '?ngModel',
        scope: {

        },
        link: function (scope, element, attrs, ctrl) {
            // view -> model (when div gets blur update the view value of the model)
            element.bind('blur keyup change', function () {
                scope.$apply(function () {
                    ctrl.$setViewValue(element.html());
                });
            });

            // model -> view
            ctrl.$render = function () {
                element.html(ctrl.$viewValue);
            };

            // load init value from DOM
            ctrl.$render();

            // remove the attached events to element when destroying the scope
            scope.$on('$destroy', function () {
                element.unbind('blur');
                element.unbind('paste');
                element.unbind('focus');
            });
        }
    };
}]);
app.directive('focusOn', function () {
    return function (scope, elem, attr) {
        scope.$on('focusOn', function (e, name) {
            if (name === attr.focusOn) {
                elem[0].focus();
            }
        });
    };
});

app.factory('focusOn', function ($rootScope, $timeout) {
    return function (name) {
        $timeout(function () {
            $rootScope.$broadcast('focusOn', name);
        });
    }
});
app.controller('editorController', function ($scope, notes, parts, focusOn) {
    $scope.suggestions = {};
    $scope.highlightedSuggestion = -1;
    $scope.currentNoteId = 0;
    $scope.parts = [
        {
            Data: "new"
        }
    ];
    var timeoutUpdate; //setTimeout to update Part
    var editingPartOptions = {};
    $scope.focusOnPart = 0;

    $scope.smartBarKeyDown = function (event) {
        console.log("Refresh " + event.keyCode)
        if (event.keyCode == 32) { //space
            $scope.suggestions = notes.getSuggested($scope.smartBar).success(function (data) {
                console.table(data);
                $scope.suggestions = data;
            });
            console.log("Refreshed");
        }

        if (event.keyCode == 40 && $scope.highlightedSuggestion < $scope.suggestions.length-1) { //arrow down
            event.preventDefault();
            $scope.highlightedSuggestion++;
        }
        if (event.keyCode == 38 && $scope.highlightedSuggestion > -1) { //arrow up
            event.preventDefault();
            $scope.highlightedSuggestion--;
        }

        if (event.keyCode == 13 && $scope.highlightedSuggestion > -1) { //enter
            //uzupełnij inputa, zacznij pisanie notatki
            $scope.smartBar = "";
            console.table($scope.suggestions[$scope.highlightedSuggestion].NoteTags);
            var note = $scope.suggestions[$scope.highlightedSuggestion];
            console.table(note);
            for (var nt in note.NoteTags) {
                //console.log(nt);
                $scope.smartBar += note.NoteTags[nt].Tag.Name + " ";
            }

            $scope.currentNoteId = note.NoteId;
            $scope.parts = parts.get($scope.currentNoteId).success(function (data) {
                $scope.parts = data;
                console.log("Got data: ");
                console.table(data);
                partsCheckForNull();
            });

        }
    }

    $scope.editingPartKeyDown = function (event, partObjIndex) {
        clearTimeout(timeoutUpdate);
        timeoutUpdate = setTimeout(function () { updatePart(partObjIndex) }, 1000);
        //timeoutUpdate = setTimeout(function () { alert("chuj");}, 3000);

        //2x enter dodaje nowy part
        //console.log(partObj.Data);

        var partObj = $scope.parts[partObjIndex];
        if (event.keyCode == 13 && /\s*<br>\s*<br>\s*$/.test(partObj.Data)) { //enter
            //console.log("three enters");
            //console.log("before: " + $scope.parts[partObjIndex].Data);
            //$scope.parts[partObjIndex].Data = $scope.parts[partObjIndex].Data.replace(/\s*<br>\s*<br>\s*$/g, ""); //usun ostatni enter
            $scope.parts[partObjIndex].Data = $scope.parts[partObjIndex].Data.replace(/\s*<br>\s*$/g, "");
            //console.log("after: " + $scope.parts[partObjIndex].Data);
            addPart(partObjIndex);
            event.preventDefault(); //żeby nie dawało już tego entera
        }
    }
    
    function updatePart(index) {
        //console.log("update");
        var partObj = $scope.parts[index];
        parts.put(partObj);
    }

    function addPart(lastIndex) {
        //$scope.parts.push({ Data: "new" });
        //console.log("lastIndex: " + lastIndex);
        //console.table($scope.parts);
        var atIndex = lastIndex + 1;
        if (lastIndex == null) {
            atIndex = 0;
        }

        $scope.parts.splice(atIndex, 0, { Data: "new", NoteID: $scope.currentNoteId }); //add at index
        //console.log("after");
        //console.table($scope.parts);
        focusOn("part" + atIndex);
        parts.post($scope.parts[atIndex]);
    }

    function partsCheckForNull(){
        if ($scope.parts.length == 0 || $scope.parts == null) {
            addPart();
        }
    }
});
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
        console.log("Updating...");
        console.table(part);
        //TODO
        return $http({
            method: 'PUT',
            url: '/api/Parts/'+part.ID,
            data: part,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    return parts;
}]);
(function () {
    'use strict';

    
})();

var app = angular.module('ConsoleNotepad', [
        // Angular modules 
        'ngRoute'

        // Custom modules 

        // 3rd Party Modules

]);

//app.directive('contenteditable', function () {
//    return {
//        restrict: 'A', // only activate on element attribute
//        require: '?ngModel', // get a hold of NgModelController
//        link: function (scope, element, attrs, ngModel) {
//            if (!ngModel) return; // do nothing if no ng-model

//            // Specify how UI should be updated
//            ngModel.$render = function () {
//                element.html(ngModel.$viewValue || '');
//            };

//            // Listen for change events to enable binding
//            element.on('blur keyup change', function () {
//                scope.$apply(read);
//            });
//            read(); // initialize

//            // Write data to the model
//            function read() {
//                var html = element.html();
//                // When we clear the content editable the browser leaves a <br> behind
//                // If strip-br attribute is provided then we strip this out
//                if (attrs.stripBr && html == '<br>') {
//                    html = '';
//                }
//                ngModel.$setViewValue(html);
//            }
//        }
//    };
//});

app.directive('contenteditable', [function () {
    return {
        require: '?ngModel',
        scope: {

        },
        link: function (scope, element, attrs, ctrl) {
            // view -> model (when div gets blur update the view value of the model)
            element.bind('blur keyup change', function () {
                scope.$apply(function () {
                    ctrl.$setViewValue(element.html());
                });
            });

            // model -> view
            ctrl.$render = function () {
                element.html(ctrl.$viewValue);
            };

            // load init value from DOM
            ctrl.$render();

            // remove the attached events to element when destroying the scope
            scope.$on('$destroy', function () {
                element.unbind('blur');
                element.unbind('paste');
                element.unbind('focus');
            });
        }
    };
}]);
app.directive('focusOn', function () {
    return function (scope, elem, attr) {
        scope.$on('focusOn', function (e, name) {
            if (name === attr.focusOn) {
                elem[0].focus();
            }
        });
    };
});

app.factory('focusOn', function ($rootScope, $timeout) {
    return function (name) {
        $timeout(function () {
            $rootScope.$broadcast('focusOn', name);
        });
    }
});
app.controller('editorController', function ($scope, notes, parts, focusOn) {
    $scope.suggestions = {};
    $scope.highlightedSuggestion = -1;
    $scope.currentNoteId = 0;
    $scope.parts = [
        {
            Data: "new"
        }
    ];
    var timeoutUpdate; //setTimeout to update Part
    var editingPartOptions = {};
    $scope.focusOnPart = 0;

    $scope.smartBarKeyDown = function (event) {
        console.log("Refresh " + event.keyCode)
        if (event.keyCode == 32) { //space
            $scope.suggestions = notes.getSuggested($scope.smartBar).success(function (data) {
                console.table(data);
                $scope.suggestions = data;
            });
            console.log("Refreshed");
        }

        if (event.keyCode == 40 && $scope.highlightedSuggestion < $scope.suggestions.length-1) { //arrow down
            event.preventDefault();
            $scope.highlightedSuggestion++;
        }
        if (event.keyCode == 38 && $scope.highlightedSuggestion > -1) { //arrow up
            event.preventDefault();
            $scope.highlightedSuggestion--;
        }

        if (event.keyCode == 13 && $scope.highlightedSuggestion > -1) { //enter
            //uzupełnij inputa, zacznij pisanie notatki
            $scope.smartBar = "";
            console.table($scope.suggestions[$scope.highlightedSuggestion].NoteTags);
            var note = $scope.suggestions[$scope.highlightedSuggestion];
            console.table(note);
            for (var nt in note.NoteTags) {
                //console.log(nt);
                $scope.smartBar += note.NoteTags[nt].Tag.Name + " ";
            }

            $scope.currentNoteId = note.NoteId;
            $scope.parts = parts.get($scope.currentNoteId).success(function (data) {
                $scope.parts = data;
                console.log("Got data: ");
                console.table(data);
                partsCheckForNull();
            });

        }
    }

    $scope.editingPartKeyDown = function (event, partObjIndex) {
        clearTimeout(timeoutUpdate);
        timeoutUpdate = setTimeout(function () { updatePart(partObjIndex) }, 1000);
        //timeoutUpdate = setTimeout(function () { alert("chuj");}, 3000);

        //2x enter dodaje nowy part
        //console.log(partObj.Data);

        var partObj = $scope.parts[partObjIndex];
        if (event.keyCode == 13 && /\s*<br>\s*<br>\s*$/.test(partObj.Data)) { //enter
            //console.log("three enters");
            //console.log("before: " + $scope.parts[partObjIndex].Data);
            //$scope.parts[partObjIndex].Data = $scope.parts[partObjIndex].Data.replace(/\s*<br>\s*<br>\s*$/g, ""); //usun ostatni enter
            $scope.parts[partObjIndex].Data = $scope.parts[partObjIndex].Data.replace(/\s*<br>\s*$/g, "");
            //console.log("after: " + $scope.parts[partObjIndex].Data);
            addPart(partObjIndex);
            event.preventDefault(); //żeby nie dawało już tego entera
        }
    }
    
    function updatePart(index) {
        //console.log("update");
        $scope.parts[index].localState = "Sending";
        var partObj = $scope.parts[index];
        parts.put(partObj);
    }

    function addPart(lastIndex) {
        //$scope.parts.push({ Data: "new" });
        //console.log("lastIndex: " + lastIndex);
        //console.table($scope.parts);
        var atIndex = lastIndex + 1;
        if (lastIndex == null) {
            atIndex = 0;
        }

        $scope.parts.splice(atIndex, 0, { Data: "new", NoteID: $scope.currentNoteId }); //add at index
        //console.log("after");
        //console.table($scope.parts);
        focusOn("part" + atIndex);
        parts.post($scope.parts[atIndex]);
    }

    function partsCheckForNull(){
        if ($scope.parts.length == 0 || $scope.parts == null) {
            addPart();
        }
    }
});
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
        console.log("Updating...");
        console.table(part);
        //TODO
        return $http({
            method: 'PUT',
            url: '/api/Parts/'+part.ID,
            data: part,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    return parts;
}]);
(function () {
    'use strict';

    
})();

var app = angular.module('ConsoleNotepad', [
        // Angular modules 
        'ngRoute'

        // Custom modules 

        // 3rd Party Modules

]);

//app.directive('contenteditable', function () {
//    return {
//        restrict: 'A', // only activate on element attribute
//        require: '?ngModel', // get a hold of NgModelController
//        link: function (scope, element, attrs, ngModel) {
//            if (!ngModel) return; // do nothing if no ng-model

//            // Specify how UI should be updated
//            ngModel.$render = function () {
//                element.html(ngModel.$viewValue || '');
//            };

//            // Listen for change events to enable binding
//            element.on('blur keyup change', function () {
//                scope.$apply(read);
//            });
//            read(); // initialize

//            // Write data to the model
//            function read() {
//                var html = element.html();
//                // When we clear the content editable the browser leaves a <br> behind
//                // If strip-br attribute is provided then we strip this out
//                if (attrs.stripBr && html == '<br>') {
//                    html = '';
//                }
//                ngModel.$setViewValue(html);
//            }
//        }
//    };
//});

app.directive('contenteditable', [function () {
    return {
        require: '?ngModel',
        scope: {

        },
        link: function (scope, element, attrs, ctrl) {
            // view -> model (when div gets blur update the view value of the model)
            element.bind('blur keyup change', function () {
                scope.$apply(function () {
                    ctrl.$setViewValue(element.html());
                });
            });

            // model -> view
            ctrl.$render = function () {
                element.html(ctrl.$viewValue);
            };

            // load init value from DOM
            ctrl.$render();

            // remove the attached events to element when destroying the scope
            scope.$on('$destroy', function () {
                element.unbind('blur');
                element.unbind('paste');
                element.unbind('focus');
            });
        }
    };
}]);
app.directive('focusOn', function () {
    return function (scope, elem, attr) {
        scope.$on('focusOn', function (e, name) {
            if (name === attr.focusOn) {
                elem[0].focus();
            }
        });
    };
});

app.factory('focusOn', function ($rootScope, $timeout) {
    return function (name) {
        $timeout(function () {
            $rootScope.$broadcast('focusOn', name);
        });
    }
});
app.controller('editorController', function ($scope, notes, parts, focusOn) {
    $scope.suggestions = {};
    $scope.highlightedSuggestion = -1;
    $scope.currentNoteId = 0;
    $scope.parts = [
        {
            Data: "new"
        }
    ];
    var timeoutUpdate; //setTimeout to update Part
    var editingPartOptions = {};
    $scope.focusOnPart = 0;

    $scope.smartBarKeyDown = function (event) {
        console.log("Refresh " + event.keyCode)
        if (event.keyCode == 32) { //space
            $scope.suggestions = notes.getSuggested($scope.smartBar).success(function (data) {
                console.table(data);
                $scope.suggestions = data;
            });
            console.log("Refreshed");
        }

        if (event.keyCode == 40 && $scope.highlightedSuggestion < $scope.suggestions.length-1) { //arrow down
            event.preventDefault();
            $scope.highlightedSuggestion++;
        }
        if (event.keyCode == 38 && $scope.highlightedSuggestion > -1) { //arrow up
            event.preventDefault();
            $scope.highlightedSuggestion--;
        }

        if (event.keyCode == 13 && $scope.highlightedSuggestion > -1) { //enter
            //uzupełnij inputa, zacznij pisanie notatki
            $scope.smartBar = "";
            console.table($scope.suggestions[$scope.highlightedSuggestion].NoteTags);
            var note = $scope.suggestions[$scope.highlightedSuggestion];
            console.table(note);
            for (var nt in note.NoteTags) {
                //console.log(nt);
                $scope.smartBar += note.NoteTags[nt].Tag.Name + " ";
            }

            $scope.currentNoteId = note.NoteId;
            $scope.parts = parts.get($scope.currentNoteId).success(function (data) {
                $scope.parts = data;
                console.log("Got data: ");
                console.table(data);
                partsCheckForNull();
            });

        }
    }

    $scope.editingPartKeyDown = function (event, partObjIndex) {
        clearTimeout(timeoutUpdate);
        timeoutUpdate = setTimeout(function () { updatePart(partObjIndex) }, 1000);
        //timeoutUpdate = setTimeout(function () { alert("chuj");}, 3000);

        //2x enter dodaje nowy part
        //console.log(partObj.Data);

        var partObj = $scope.parts[partObjIndex];
        if (event.keyCode == 13 && /\s*<br>\s*<br>\s*$/.test(partObj.Data)) { //enter
            //console.log("three enters");
            //console.log("before: " + $scope.parts[partObjIndex].Data);
            //$scope.parts[partObjIndex].Data = $scope.parts[partObjIndex].Data.replace(/\s*<br>\s*<br>\s*$/g, ""); //usun ostatni enter
            $scope.parts[partObjIndex].Data = $scope.parts[partObjIndex].Data.replace(/\s*<br>\s*$/g, "");
            //console.log("after: " + $scope.parts[partObjIndex].Data);
            addPart(partObjIndex);
            event.preventDefault(); //żeby nie dawało już tego entera
        }
    }
    
    function updatePart(index) {
        //console.log("update");
        $scope.parts[index].localState = "Sending";
        var partObj = $scope.parts[index];
        parts.put(partObj).success(function () {
            $scope.parts[index].localState = "OK";
        });
    }

    function addPart(lastIndex) {
        //$scope.parts.push({ Data: "new" });
        //console.log("lastIndex: " + lastIndex);
        //console.table($scope.parts);
        var atIndex = lastIndex + 1;
        if (lastIndex == null) {
            atIndex = 0;
        }

        $scope.parts.splice(atIndex, 0, { Data: "new", NoteID: $scope.currentNoteId }); //add at index
        //console.log("after");
        //console.table($scope.parts);
        focusOn("part" + atIndex);
        parts.post($scope.parts[atIndex]);
    }

    function partsCheckForNull(){
        if ($scope.parts.length == 0 || $scope.parts == null) {
            addPart();
        }
    }
});
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
        console.log("Updating...");
        console.table(part);
        //TODO
        return $http({
            method: 'PUT',
            url: '/api/Parts/'+part.ID,
            data: part,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    return parts;
}]);
(function () {
    'use strict';

    
})();

var app = angular.module('ConsoleNotepad', [
        // Angular modules 
        'ngRoute'

        // Custom modules 

        // 3rd Party Modules

]);

//app.directive('contenteditable', function () {
//    return {
//        restrict: 'A', // only activate on element attribute
//        require: '?ngModel', // get a hold of NgModelController
//        link: function (scope, element, attrs, ngModel) {
//            if (!ngModel) return; // do nothing if no ng-model

//            // Specify how UI should be updated
//            ngModel.$render = function () {
//                element.html(ngModel.$viewValue || '');
//            };

//            // Listen for change events to enable binding
//            element.on('blur keyup change', function () {
//                scope.$apply(read);
//            });
//            read(); // initialize

//            // Write data to the model
//            function read() {
//                var html = element.html();
//                // When we clear the content editable the browser leaves a <br> behind
//                // If strip-br attribute is provided then we strip this out
//                if (attrs.stripBr && html == '<br>') {
//                    html = '';
//                }
//                ngModel.$setViewValue(html);
//            }
//        }
//    };
//});

app.directive('contenteditable', [function () {
    return {
        require: '?ngModel',
        scope: {

        },
        link: function (scope, element, attrs, ctrl) {
            // view -> model (when div gets blur update the view value of the model)
            element.bind('blur keyup change', function () {
                scope.$apply(function () {
                    ctrl.$setViewValue(element.html());
                });
            });

            // model -> view
            ctrl.$render = function () {
                element.html(ctrl.$viewValue);
            };

            // load init value from DOM
            ctrl.$render();

            // remove the attached events to element when destroying the scope
            scope.$on('$destroy', function () {
                element.unbind('blur');
                element.unbind('paste');
                element.unbind('focus');
            });
        }
    };
}]);
app.directive('focusOn', function () {
    return function (scope, elem, attr) {
        scope.$on('focusOn', function (e, name) {
            if (name === attr.focusOn) {
                elem[0].focus();
            }
        });
    };
});

app.factory('focusOn', function ($rootScope, $timeout) {
    return function (name) {
        $timeout(function () {
            $rootScope.$broadcast('focusOn', name);
        });
    }
});
app.controller('editorController', function ($scope, notes, parts, focusOn) {
    $scope.suggestions = {};
    $scope.highlightedSuggestion = -1;
    $scope.currentNoteId = 0;
    $scope.parts = [
        {
            Data: "new"
        }
    ];
    var timeoutUpdate; //setTimeout to update Part
    var editingPartOptions = {};
    $scope.focusOnPart = 0;

    $scope.smartBarKeyDown = function (event) {
        console.log("Refresh " + event.keyCode)
        if (event.keyCode == 32) { //space
            $scope.suggestions = notes.getSuggested($scope.smartBar).success(function (data) {
                console.table(data);
                $scope.suggestions = data;
            });
            console.log("Refreshed");
        }

        if (event.keyCode == 40 && $scope.highlightedSuggestion < $scope.suggestions.length-1) { //arrow down
            event.preventDefault();
            $scope.highlightedSuggestion++;
        }
        if (event.keyCode == 38 && $scope.highlightedSuggestion > -1) { //arrow up
            event.preventDefault();
            $scope.highlightedSuggestion--;
        }

        if (event.keyCode == 13 && $scope.highlightedSuggestion > -1) { //enter
            //uzupełnij inputa, zacznij pisanie notatki
            $scope.smartBar = "";
            console.table($scope.suggestions[$scope.highlightedSuggestion].NoteTags);
            var note = $scope.suggestions[$scope.highlightedSuggestion];
            console.table(note);
            for (var nt in note.NoteTags) {
                //console.log(nt);
                $scope.smartBar += note.NoteTags[nt].Tag.Name + " ";
            }

            $scope.currentNoteId = note.NoteId;
            $scope.parts = parts.get($scope.currentNoteId).success(function (data) {
                $scope.parts = data;
                console.log("Got data: ");
                console.table(data);
                partsCheckForNull();
            });

        }
    }

    $scope.editingPartKeyDown = function (event, partObjIndex) {
        clearTimeout(timeoutUpdate);
        timeoutUpdate = setTimeout(function () { updatePart(partObjIndex) }, 1000);
        //timeoutUpdate = setTimeout(function () { alert("chuj");}, 3000);

        //2x enter dodaje nowy part
        //console.log(partObj.Data);

        var partObj = $scope.parts[partObjIndex];
        if (event.keyCode == 13 && /\s*<br>\s*<br>\s*$/.test(partObj.Data)) { //enter
            //console.log("three enters");
            //console.log("before: " + $scope.parts[partObjIndex].Data);
            //$scope.parts[partObjIndex].Data = $scope.parts[partObjIndex].Data.replace(/\s*<br>\s*<br>\s*$/g, ""); //usun ostatni enter
            $scope.parts[partObjIndex].Data = $scope.parts[partObjIndex].Data.replace(/\s*<br>\s*$/g, "");
            //console.log("after: " + $scope.parts[partObjIndex].Data);
            addPart(partObjIndex);
            event.preventDefault(); //żeby nie dawało już tego entera
        }
    }
    
    function updatePart(index) {
        //console.log("update");
        $scope.parts[index].localState = "Sending";
        var partObj = $scope.parts[index];
        parts.put(partObj).success(function () {
            $scope.parts[index].localState = "OK";
        }).fail(function () {
            $scope.parts[index].localState = "Problem";
        });
    }

    function addPart(lastIndex) {
        //$scope.parts.push({ Data: "new" });
        //console.log("lastIndex: " + lastIndex);
        //console.table($scope.parts);
        var atIndex = lastIndex + 1;
        if (lastIndex == null) {
            atIndex = 0;
        }

        $scope.parts.splice(atIndex, 0, { Data: "new", NoteID: $scope.currentNoteId }); //add at index
        //console.log("after");
        //console.table($scope.parts);
        focusOn("part" + atIndex);
        parts.post($scope.parts[atIndex]);
    }

    function partsCheckForNull(){
        if ($scope.parts.length == 0 || $scope.parts == null) {
            addPart();
        }
    }
});
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
        console.log("Updating...");
        console.table(part);
        //TODO
        return $http({
            method: 'PUT',
            url: '/api/Parts/'+part.ID,
            data: part,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    return parts;
}]);
(function () {
    'use strict';

    
})();

var app = angular.module('ConsoleNotepad', [
        // Angular modules 
        'ngRoute'

        // Custom modules 

        // 3rd Party Modules

]);

//app.directive('contenteditable', function () {
//    return {
//        restrict: 'A', // only activate on element attribute
//        require: '?ngModel', // get a hold of NgModelController
//        link: function (scope, element, attrs, ngModel) {
//            if (!ngModel) return; // do nothing if no ng-model

//            // Specify how UI should be updated
//            ngModel.$render = function () {
//                element.html(ngModel.$viewValue || '');
//            };

//            // Listen for change events to enable binding
//            element.on('blur keyup change', function () {
//                scope.$apply(read);
//            });
//            read(); // initialize

//            // Write data to the model
//            function read() {
//                var html = element.html();
//                // When we clear the content editable the browser leaves a <br> behind
//                // If strip-br attribute is provided then we strip this out
//                if (attrs.stripBr && html == '<br>') {
//                    html = '';
//                }
//                ngModel.$setViewValue(html);
//            }
//        }
//    };
//});

app.directive('contenteditable', [function () {
    return {
        require: '?ngModel',
        scope: {

        },
        link: function (scope, element, attrs, ctrl) {
            // view -> model (when div gets blur update the view value of the model)
            element.bind('blur keyup change', function () {
                scope.$apply(function () {
                    ctrl.$setViewValue(element.html());
                });
            });

            // model -> view
            ctrl.$render = function () {
                element.html(ctrl.$viewValue);
            };

            // load init value from DOM
            ctrl.$render();

            // remove the attached events to element when destroying the scope
            scope.$on('$destroy', function () {
                element.unbind('blur');
                element.unbind('paste');
                element.unbind('focus');
            });
        }
    };
}]);
app.directive('focusOn', function () {
    return function (scope, elem, attr) {
        scope.$on('focusOn', function (e, name) {
            if (name === attr.focusOn) {
                elem[0].focus();
            }
        });
    };
});

app.factory('focusOn', function ($rootScope, $timeout) {
    return function (name) {
        $timeout(function () {
            $rootScope.$broadcast('focusOn', name);
        });
    }
});
app.controller('editorController', function ($scope, notes, parts, focusOn) {
    $scope.suggestions = {};
    $scope.highlightedSuggestion = -1;
    $scope.currentNoteId = 0;
    $scope.parts = [
        {
            Data: "new"
        }
    ];
    var timeoutUpdate; //setTimeout to update Part
    var editingPartOptions = {};
    $scope.focusOnPart = 0;

    $scope.smartBarKeyDown = function (event) {
        console.log("Refresh " + event.keyCode)
        if (event.keyCode == 32) { //space
            $scope.suggestions = notes.getSuggested($scope.smartBar).success(function (data) {
                console.table(data);
                $scope.suggestions = data;
            });
            console.log("Refreshed");
        }

        if (event.keyCode == 40 && $scope.highlightedSuggestion < $scope.suggestions.length-1) { //arrow down
            event.preventDefault();
            $scope.highlightedSuggestion++;
        }
        if (event.keyCode == 38 && $scope.highlightedSuggestion > -1) { //arrow up
            event.preventDefault();
            $scope.highlightedSuggestion--;
        }

        if (event.keyCode == 13 && $scope.highlightedSuggestion > -1) { //enter
            //uzupełnij inputa, zacznij pisanie notatki
            $scope.smartBar = "";
            console.table($scope.suggestions[$scope.highlightedSuggestion].NoteTags);
            var note = $scope.suggestions[$scope.highlightedSuggestion];
            console.table(note);
            for (var nt in note.NoteTags) {
                //console.log(nt);
                $scope.smartBar += note.NoteTags[nt].Tag.Name + " ";
            }

            $scope.currentNoteId = note.NoteId;
            $scope.parts = parts.get($scope.currentNoteId).success(function (data) {
                $scope.parts = data;
                console.log("Got data: ");
                console.table(data);
                partsCheckForNull();
            });

        }
    }

    $scope.editingPartKeyDown = function (event, partObjIndex) {
        clearTimeout(timeoutUpdate);
        timeoutUpdate = setTimeout(function () { updatePart(partObjIndex) }, 1000);
        //timeoutUpdate = setTimeout(function () { alert("chuj");}, 3000);

        //2x enter dodaje nowy part
        //console.log(partObj.Data);

        var partObj = $scope.parts[partObjIndex];
        if (event.keyCode == 13 && /\s*<br>\s*<br>\s*$/.test(partObj.Data)) { //enter
            //console.log("three enters");
            //console.log("before: " + $scope.parts[partObjIndex].Data);
            //$scope.parts[partObjIndex].Data = $scope.parts[partObjIndex].Data.replace(/\s*<br>\s*<br>\s*$/g, ""); //usun ostatni enter
            $scope.parts[partObjIndex].Data = $scope.parts[partObjIndex].Data.replace(/\s*<br>\s*$/g, "");
            //console.log("after: " + $scope.parts[partObjIndex].Data);
            addPart(partObjIndex);
            event.preventDefault(); //żeby nie dawało już tego entera
        }
    }
    
    function updatePart(index) {
        //console.log("update");
        $scope.parts[index].localState = "Sending";
        var partObj = $scope.parts[index];
        parts.put(partObj).success(function () {
            $scope.parts[index].localState = "OK";
        }).fail(function () {
            $scope.parts[index].localState = "Problem";
        });
    }

    function addPart(lastIndex) {
        //$scope.parts.push({ Data: "new" });
        //console.log("lastIndex: " + lastIndex);
        //console.table($scope.parts);
        var atIndex = lastIndex + 1;
        if (lastIndex == null) {
            atIndex = 0;
        }

        $scope.parts.splice(atIndex, 0, { Data: "new", NoteID: $scope.currentNoteId }); //add at index
        //console.log("after");
        //console.table($scope.parts);
        focusOn("part" + atIndex);
        $scope.parts[index].localState = "Sending";
        parts.post($scope.parts[atIndex]);
    }

    function partsCheckForNull(){
        if ($scope.parts.length == 0 || $scope.parts == null) {
            addPart();
        }
    }
});
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
        console.log("Updating...");
        console.table(part);
        //TODO
        return $http({
            method: 'PUT',
            url: '/api/Parts/'+part.ID,
            data: part,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    return parts;
}]);
(function () {
    'use strict';

    
})();

var app = angular.module('ConsoleNotepad', [
        // Angular modules 
        'ngRoute'

        // Custom modules 

        // 3rd Party Modules

]);

//app.directive('contenteditable', function () {
//    return {
//        restrict: 'A', // only activate on element attribute
//        require: '?ngModel', // get a hold of NgModelController
//        link: function (scope, element, attrs, ngModel) {
//            if (!ngModel) return; // do nothing if no ng-model

//            // Specify how UI should be updated
//            ngModel.$render = function () {
//                element.html(ngModel.$viewValue || '');
//            };

//            // Listen for change events to enable binding
//            element.on('blur keyup change', function () {
//                scope.$apply(read);
//            });
//            read(); // initialize

//            // Write data to the model
//            function read() {
//                var html = element.html();
//                // When we clear the content editable the browser leaves a <br> behind
//                // If strip-br attribute is provided then we strip this out
//                if (attrs.stripBr && html == '<br>') {
//                    html = '';
//                }
//                ngModel.$setViewValue(html);
//            }
//        }
//    };
//});

app.directive('contenteditable', [function () {
    return {
        require: '?ngModel',
        scope: {

        },
        link: function (scope, element, attrs, ctrl) {
            // view -> model (when div gets blur update the view value of the model)
            element.bind('blur keyup change', function () {
                scope.$apply(function () {
                    ctrl.$setViewValue(element.html());
                });
            });

            // model -> view
            ctrl.$render = function () {
                element.html(ctrl.$viewValue);
            };

            // load init value from DOM
            ctrl.$render();

            // remove the attached events to element when destroying the scope
            scope.$on('$destroy', function () {
                element.unbind('blur');
                element.unbind('paste');
                element.unbind('focus');
            });
        }
    };
}]);
app.directive('focusOn', function () {
    return function (scope, elem, attr) {
        scope.$on('focusOn', function (e, name) {
            if (name === attr.focusOn) {
                elem[0].focus();
            }
        });
    };
});

app.factory('focusOn', function ($rootScope, $timeout) {
    return function (name) {
        $timeout(function () {
            $rootScope.$broadcast('focusOn', name);
        });
    }
});
app.controller('editorController', function ($scope, notes, parts, focusOn) {
    $scope.suggestions = {};
    $scope.highlightedSuggestion = -1;
    $scope.currentNoteId = 0;
    $scope.parts = [
        {
            Data: "new"
        }
    ];
    var timeoutUpdate; //setTimeout to update Part
    var editingPartOptions = {};
    $scope.focusOnPart = 0;

    $scope.smartBarKeyDown = function (event) {
        console.log("Refresh " + event.keyCode)
        if (event.keyCode == 32) { //space
            $scope.suggestions = notes.getSuggested($scope.smartBar).success(function (data) {
                console.table(data);
                $scope.suggestions = data;
            });
            console.log("Refreshed");
        }

        if (event.keyCode == 40 && $scope.highlightedSuggestion < $scope.suggestions.length-1) { //arrow down
            event.preventDefault();
            $scope.highlightedSuggestion++;
        }
        if (event.keyCode == 38 && $scope.highlightedSuggestion > -1) { //arrow up
            event.preventDefault();
            $scope.highlightedSuggestion--;
        }

        if (event.keyCode == 13 && $scope.highlightedSuggestion > -1) { //enter
            //uzupełnij inputa, zacznij pisanie notatki
            $scope.smartBar = "";
            console.table($scope.suggestions[$scope.highlightedSuggestion].NoteTags);
            var note = $scope.suggestions[$scope.highlightedSuggestion];
            console.table(note);
            for (var nt in note.NoteTags) {
                //console.log(nt);
                $scope.smartBar += note.NoteTags[nt].Tag.Name + " ";
            }

            $scope.currentNoteId = note.NoteId;
            $scope.parts = parts.get($scope.currentNoteId).success(function (data) {
                $scope.parts = data;
                console.log("Got data: ");
                console.table(data);
                partsCheckForNull();
            });

        }
    }

    $scope.editingPartKeyDown = function (event, partObjIndex) {
        clearTimeout(timeoutUpdate);
        timeoutUpdate = setTimeout(function () { updatePart(partObjIndex) }, 1000);
        //timeoutUpdate = setTimeout(function () { alert("chuj");}, 3000);

        //2x enter dodaje nowy part
        //console.log(partObj.Data);

        var partObj = $scope.parts[partObjIndex];
        if (event.keyCode == 13 && /\s*<br>\s*<br>\s*$/.test(partObj.Data)) { //enter
            //console.log("three enters");
            //console.log("before: " + $scope.parts[partObjIndex].Data);
            //$scope.parts[partObjIndex].Data = $scope.parts[partObjIndex].Data.replace(/\s*<br>\s*<br>\s*$/g, ""); //usun ostatni enter
            $scope.parts[partObjIndex].Data = $scope.parts[partObjIndex].Data.replace(/\s*<br>\s*$/g, "");
            //console.log("after: " + $scope.parts[partObjIndex].Data);
            addPart(partObjIndex);
            event.preventDefault(); //żeby nie dawało już tego entera
        }
    }
    
    function updatePart(index) {
        //console.log("update");
        $scope.parts[index].localState = "Sending";
        var partObj = $scope.parts[index];
        parts.put(partObj).success(function () {
            $scope.parts[index].localState = "OK";
        }).fail(function () {
            $scope.parts[index].localState = "Problem";
        });
    }

    function addPart(lastIndex) {
        //$scope.parts.push({ Data: "new" });
        //console.log("lastIndex: " + lastIndex);
        //console.table($scope.parts);
        var atIndex = lastIndex + 1;
        if (lastIndex == null) {
            atIndex = 0;
        }

        $scope.parts.splice(atIndex, 0, { Data: "new", NoteID: $scope.currentNoteId }); //add at index
        //console.log("after");
        //console.table($scope.parts);
        focusOn("part" + atIndex);
        $scope.parts[index].localState = "Sending";
        parts.post($scope.parts[atIndex]).success(function () {
            $scope.parts[index].localState = "OK";
        }).fail(function () {
            $scope.parts[index].localState = "Problem";
        });;
    }

    function partsCheckForNull(){
        if ($scope.parts.length == 0 || $scope.parts == null) {
            addPart();
        }
    }
});
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
        console.log("Updating...");
        console.table(part);
        //TODO
        return $http({
            method: 'PUT',
            url: '/api/Parts/'+part.ID,
            data: part,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    return parts;
}]);
(function () {
    'use strict';

    
})();

var app = angular.module('ConsoleNotepad', [
        // Angular modules 
        'ngRoute'

        // Custom modules 

        // 3rd Party Modules

]);

//app.directive('contenteditable', function () {
//    return {
//        restrict: 'A', // only activate on element attribute
//        require: '?ngModel', // get a hold of NgModelController
//        link: function (scope, element, attrs, ngModel) {
//            if (!ngModel) return; // do nothing if no ng-model

//            // Specify how UI should be updated
//            ngModel.$render = function () {
//                element.html(ngModel.$viewValue || '');
//            };

//            // Listen for change events to enable binding
//            element.on('blur keyup change', function () {
//                scope.$apply(read);
//            });
//            read(); // initialize

//            // Write data to the model
//            function read() {
//                var html = element.html();
//                // When we clear the content editable the browser leaves a <br> behind
//                // If strip-br attribute is provided then we strip this out
//                if (attrs.stripBr && html == '<br>') {
//                    html = '';
//                }
//                ngModel.$setViewValue(html);
//            }
//        }
//    };
//});

app.directive('contenteditable', [function () {
    return {
        require: '?ngModel',
        scope: {

        },
        link: function (scope, element, attrs, ctrl) {
            // view -> model (when div gets blur update the view value of the model)
            element.bind('blur keyup change', function () {
                scope.$apply(function () {
                    ctrl.$setViewValue(element.html());
                });
            });

            // model -> view
            ctrl.$render = function () {
                element.html(ctrl.$viewValue);
            };

            // load init value from DOM
            ctrl.$render();

            // remove the attached events to element when destroying the scope
            scope.$on('$destroy', function () {
                element.unbind('blur');
                element.unbind('paste');
                element.unbind('focus');
            });
        }
    };
}]);
app.directive('focusOn', function () {
    return function (scope, elem, attr) {
        scope.$on('focusOn', function (e, name) {
            if (name === attr.focusOn) {
                elem[0].focus();
            }
        });
    };
});

app.factory('focusOn', function ($rootScope, $timeout) {
    return function (name) {
        $timeout(function () {
            $rootScope.$broadcast('focusOn', name);
        });
    }
});
app.controller('editorController', function ($scope, notes, parts, focusOn) {
    $scope.suggestions = {};
    $scope.highlightedSuggestion = -1;
    $scope.currentNoteId = 0;
    $scope.parts = [
        {
            Data: "new"
        }
    ];
    var timeoutUpdate; //setTimeout to update Part
    var editingPartOptions = {};
    $scope.focusOnPart = 0;

    $scope.smartBarKeyDown = function (event) {
        console.log("Refresh " + event.keyCode)
        if (event.keyCode == 32) { //space
            $scope.suggestions = notes.getSuggested($scope.smartBar).success(function (data) {
                console.table(data);
                $scope.suggestions = data;
            });
            console.log("Refreshed");
        }

        if (event.keyCode == 40 && $scope.highlightedSuggestion < $scope.suggestions.length-1) { //arrow down
            event.preventDefault();
            $scope.highlightedSuggestion++;
        }
        if (event.keyCode == 38 && $scope.highlightedSuggestion > -1) { //arrow up
            event.preventDefault();
            $scope.highlightedSuggestion--;
        }

        if (event.keyCode == 13 && $scope.highlightedSuggestion > -1) { //enter
            //uzupełnij inputa, zacznij pisanie notatki
            $scope.smartBar = "";
            console.table($scope.suggestions[$scope.highlightedSuggestion].NoteTags);
            var note = $scope.suggestions[$scope.highlightedSuggestion];
            console.table(note);
            for (var nt in note.NoteTags) {
                //console.log(nt);
                $scope.smartBar += note.NoteTags[nt].Tag.Name + " ";
            }

            $scope.currentNoteId = note.NoteId;
            $scope.parts = parts.get($scope.currentNoteId).success(function (data) {
                $scope.parts = data;
                console.log("Got data: ");
                console.table(data);
                partsCheckForNull();
            });

        }
    }

    $scope.editingPartKeyDown = function (event, partObjIndex) {
        clearTimeout(timeoutUpdate);
        timeoutUpdate = setTimeout(function () { updatePart(partObjIndex) }, 1000);
        //timeoutUpdate = setTimeout(function () { alert("chuj");}, 3000);

        //2x enter dodaje nowy part
        //console.log(partObj.Data);

        var partObj = $scope.parts[partObjIndex];
        if (event.keyCode == 13 && /\s*<br>\s*<br>\s*$/.test(partObj.Data)) { //enter
            //console.log("three enters");
            //console.log("before: " + $scope.parts[partObjIndex].Data);
            //$scope.parts[partObjIndex].Data = $scope.parts[partObjIndex].Data.replace(/\s*<br>\s*<br>\s*$/g, ""); //usun ostatni enter
            $scope.parts[partObjIndex].Data = $scope.parts[partObjIndex].Data.replace(/\s*<br>\s*$/g, "");
            //console.log("after: " + $scope.parts[partObjIndex].Data);
            addPart(partObjIndex);
            event.preventDefault(); //żeby nie dawało już tego entera
        }
    }
    
    function updatePart(index) {
        //console.log("update");
        $scope.parts[index].localState = "Sending";
        var partObj = $scope.parts[index];
        parts.put(partObj).success(function () {
            $scope.parts[index].localState = "OK";
        }).fail(function () {
            $scope.parts[index].localState = "Problem";
        });
    }

    function addPart(lastIndex) {
        //$scope.parts.push({ Data: "new" });
        //console.log("lastIndex: " + lastIndex);
        //console.table($scope.parts);
        var atIndex = lastIndex + 1;
        if (lastIndex == null) {
            atIndex = 0;
        }

        $scope.parts.splice(atIndex, 0, { Data: "new", NoteID: $scope.currentNoteId }); //add at index
        //console.log("after");
        //console.table($scope.parts);
        focusOn("part" + atIndex);
        $scope.parts[index].localState = "Sending";
        parts.post($scope.parts[atIndex]).success(function () {
            $scope.parts[index].localState = "OK";
        }).fail(function () {
            $scope.parts[index].localState = "Problem";
        });
    }

    function partsCheckForNull(){
        if ($scope.parts.length == 0 || $scope.parts == null) {
            addPart();
        }
    }
});
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
        console.log("Updating...");
        console.table(part);
        //TODO
        return $http({
            method: 'PUT',
            url: '/api/Parts/'+part.ID,
            data: part,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    return parts;
}]);
(function () {
    'use strict';

    
})();

var app = angular.module('ConsoleNotepad', [
        // Angular modules 
        'ngRoute'

        // Custom modules 

        // 3rd Party Modules

]);

//app.directive('contenteditable', function () {
//    return {
//        restrict: 'A', // only activate on element attribute
//        require: '?ngModel', // get a hold of NgModelController
//        link: function (scope, element, attrs, ngModel) {
//            if (!ngModel) return; // do nothing if no ng-model

//            // Specify how UI should be updated
//            ngModel.$render = function () {
//                element.html(ngModel.$viewValue || '');
//            };

//            // Listen for change events to enable binding
//            element.on('blur keyup change', function () {
//                scope.$apply(read);
//            });
//            read(); // initialize

//            // Write data to the model
//            function read() {
//                var html = element.html();
//                // When we clear the content editable the browser leaves a <br> behind
//                // If strip-br attribute is provided then we strip this out
//                if (attrs.stripBr && html == '<br>') {
//                    html = '';
//                }
//                ngModel.$setViewValue(html);
//            }
//        }
//    };
//});

app.directive('contenteditable', [function () {
    return {
        require: '?ngModel',
        scope: {

        },
        link: function (scope, element, attrs, ctrl) {
            // view -> model (when div gets blur update the view value of the model)
            element.bind('blur keyup change', function () {
                scope.$apply(function () {
                    ctrl.$setViewValue(element.html());
                });
            });

            // model -> view
            ctrl.$render = function () {
                element.html(ctrl.$viewValue);
            };

            // load init value from DOM
            ctrl.$render();

            // remove the attached events to element when destroying the scope
            scope.$on('$destroy', function () {
                element.unbind('blur');
                element.unbind('paste');
                element.unbind('focus');
            });
        }
    };
}]);
app.directive('focusOn', function () {
    return function (scope, elem, attr) {
        scope.$on('focusOn', function (e, name) {
            if (name === attr.focusOn) {
                elem[0].focus();
            }
        });
    };
});

app.factory('focusOn', function ($rootScope, $timeout) {
    return function (name) {
        $timeout(function () {
            $rootScope.$broadcast('focusOn', name);
        });
    }
});
app.controller('editorController', function ($scope, notes, parts, focusOn) {
    $scope.suggestions = {};
    $scope.highlightedSuggestion = -1;
    $scope.currentNoteId = 0;
    $scope.parts = [
        {
            Data: "new"
        }
    ];
    var timeoutUpdate; //setTimeout to update Part
    var editingPartOptions = {};
    $scope.focusOnPart = 0;

    $scope.smartBarKeyDown = function (event) {
        console.log("Refresh " + event.keyCode)
        if (event.keyCode == 32) { //space
            $scope.suggestions = notes.getSuggested($scope.smartBar).success(function (data) {
                console.table(data);
                $scope.suggestions = data;
            });
            console.log("Refreshed");
        }

        if (event.keyCode == 40 && $scope.highlightedSuggestion < $scope.suggestions.length-1) { //arrow down
            event.preventDefault();
            $scope.highlightedSuggestion++;
        }
        if (event.keyCode == 38 && $scope.highlightedSuggestion > -1) { //arrow up
            event.preventDefault();
            $scope.highlightedSuggestion--;
        }

        if (event.keyCode == 13 && $scope.highlightedSuggestion > -1) { //enter
            //uzupełnij inputa, zacznij pisanie notatki
            $scope.smartBar = "";
            console.table($scope.suggestions[$scope.highlightedSuggestion].NoteTags);
            var note = $scope.suggestions[$scope.highlightedSuggestion];
            console.table(note);
            for (var nt in note.NoteTags) {
                //console.log(nt);
                $scope.smartBar += note.NoteTags[nt].Tag.Name + " ";
            }

            $scope.currentNoteId = note.NoteId;
            $scope.parts = parts.get($scope.currentNoteId).success(function (data) {
                $scope.parts = data;
                console.log("Got data: ");
                console.table(data);
                partsCheckForNull();
            });

        }
    }

    $scope.editingPartKeyDown = function (event, partObjIndex) {
        clearTimeout(timeoutUpdate);
        timeoutUpdate = setTimeout(function () { updatePart(partObjIndex) }, 1000);
        //timeoutUpdate = setTimeout(function () { alert("chuj");}, 3000);

        //2x enter dodaje nowy part
        //console.log(partObj.Data);

        var partObj = $scope.parts[partObjIndex];
        if (event.keyCode == 13 && /\s*<br>\s*<br>\s*$/.test(partObj.Data)) { //enter
            //console.log("three enters");
            //console.log("before: " + $scope.parts[partObjIndex].Data);
            //$scope.parts[partObjIndex].Data = $scope.parts[partObjIndex].Data.replace(/\s*<br>\s*<br>\s*$/g, ""); //usun ostatni enter
            $scope.parts[partObjIndex].Data = $scope.parts[partObjIndex].Data.replace(/\s*<br>\s*$/g, "");
            //console.log("after: " + $scope.parts[partObjIndex].Data);
            addPart(partObjIndex);
            event.preventDefault(); //żeby nie dawało już tego entera
        }
    }
    
    function updatePart(index) {
        //console.log("update");
        $scope.parts[index].localState = "Sending";
        var partObj = $scope.parts[index];
        parts.put(partObj).success(function () {
            $scope.parts[index].localState = "OK";
        }).error(function () {
            $scope.parts[index].localState = "Problem";
        });
    }

    function addPart(lastIndex) {
        //$scope.parts.push({ Data: "new" });
        //console.log("lastIndex: " + lastIndex);
        //console.table($scope.parts);
        var atIndex = lastIndex + 1;
        if (lastIndex == null) {
            atIndex = 0;
        }

        $scope.parts.splice(atIndex, 0, { Data: "new", NoteID: $scope.currentNoteId }); //add at index
        //console.log("after");
        //console.table($scope.parts);
        focusOn("part" + atIndex);
        $scope.parts[index].localState = "Sending";
        parts.post($scope.parts[atIndex]).success(function () {
            $scope.parts[index].localState = "OK";
        }).fail(function () {
            $scope.parts[index].localState = "Problem";
        });
    }

    function partsCheckForNull(){
        if ($scope.parts.length == 0 || $scope.parts == null) {
            addPart();
        }
    }
});
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
        console.log("Updating...");
        console.table(part);
        //TODO
        return $http({
            method: 'PUT',
            url: '/api/Parts/'+part.ID,
            data: part,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    return parts;
}]);
(function () {
    'use strict';

    
})();

var app = angular.module('ConsoleNotepad', [
        // Angular modules 
        'ngRoute'

        // Custom modules 

        // 3rd Party Modules

]);

//app.directive('contenteditable', function () {
//    return {
//        restrict: 'A', // only activate on element attribute
//        require: '?ngModel', // get a hold of NgModelController
//        link: function (scope, element, attrs, ngModel) {
//            if (!ngModel) return; // do nothing if no ng-model

//            // Specify how UI should be updated
//            ngModel.$render = function () {
//                element.html(ngModel.$viewValue || '');
//            };

//            // Listen for change events to enable binding
//            element.on('blur keyup change', function () {
//                scope.$apply(read);
//            });
//            read(); // initialize

//            // Write data to the model
//            function read() {
//                var html = element.html();
//                // When we clear the content editable the browser leaves a <br> behind
//                // If strip-br attribute is provided then we strip this out
//                if (attrs.stripBr && html == '<br>') {
//                    html = '';
//                }
//                ngModel.$setViewValue(html);
//            }
//        }
//    };
//});

app.directive('contenteditable', [function () {
    return {
        require: '?ngModel',
        scope: {

        },
        link: function (scope, element, attrs, ctrl) {
            // view -> model (when div gets blur update the view value of the model)
            element.bind('blur keyup change', function () {
                scope.$apply(function () {
                    ctrl.$setViewValue(element.html());
                });
            });

            // model -> view
            ctrl.$render = function () {
                element.html(ctrl.$viewValue);
            };

            // load init value from DOM
            ctrl.$render();

            // remove the attached events to element when destroying the scope
            scope.$on('$destroy', function () {
                element.unbind('blur');
                element.unbind('paste');
                element.unbind('focus');
            });
        }
    };
}]);
app.directive('focusOn', function () {
    return function (scope, elem, attr) {
        scope.$on('focusOn', function (e, name) {
            if (name === attr.focusOn) {
                elem[0].focus();
            }
        });
    };
});

app.factory('focusOn', function ($rootScope, $timeout) {
    return function (name) {
        $timeout(function () {
            $rootScope.$broadcast('focusOn', name);
        });
    }
});
app.controller('editorController', function ($scope, notes, parts, focusOn) {
    $scope.suggestions = {};
    $scope.highlightedSuggestion = -1;
    $scope.currentNoteId = 0;
    $scope.parts = [
        {
            Data: "new"
        }
    ];
    var timeoutUpdate; //setTimeout to update Part
    var editingPartOptions = {};
    $scope.focusOnPart = 0;

    $scope.smartBarKeyDown = function (event) {
        console.log("Refresh " + event.keyCode)
        if (event.keyCode == 32) { //space
            $scope.suggestions = notes.getSuggested($scope.smartBar).success(function (data) {
                console.table(data);
                $scope.suggestions = data;
            });
            console.log("Refreshed");
        }

        if (event.keyCode == 40 && $scope.highlightedSuggestion < $scope.suggestions.length-1) { //arrow down
            event.preventDefault();
            $scope.highlightedSuggestion++;
        }
        if (event.keyCode == 38 && $scope.highlightedSuggestion > -1) { //arrow up
            event.preventDefault();
            $scope.highlightedSuggestion--;
        }

        if (event.keyCode == 13 && $scope.highlightedSuggestion > -1) { //enter
            //uzupełnij inputa, zacznij pisanie notatki
            $scope.smartBar = "";
            console.table($scope.suggestions[$scope.highlightedSuggestion].NoteTags);
            var note = $scope.suggestions[$scope.highlightedSuggestion];
            console.table(note);
            for (var nt in note.NoteTags) {
                //console.log(nt);
                $scope.smartBar += note.NoteTags[nt].Tag.Name + " ";
            }

            $scope.currentNoteId = note.NoteId;
            $scope.parts = parts.get($scope.currentNoteId).success(function (data) {
                $scope.parts = data;
                console.log("Got data: ");
                console.table(data);
                partsCheckForNull();
            });

        }
    }

    $scope.editingPartKeyDown = function (event, partObjIndex) {
        clearTimeout(timeoutUpdate);
        timeoutUpdate = setTimeout(function () { updatePart(partObjIndex) }, 1000);
        //timeoutUpdate = setTimeout(function () { alert("chuj");}, 3000);

        //2x enter dodaje nowy part
        //console.log(partObj.Data);

        var partObj = $scope.parts[partObjIndex];
        if (event.keyCode == 13 && /\s*<br>\s*<br>\s*$/.test(partObj.Data)) { //enter
            //console.log("three enters");
            //console.log("before: " + $scope.parts[partObjIndex].Data);
            //$scope.parts[partObjIndex].Data = $scope.parts[partObjIndex].Data.replace(/\s*<br>\s*<br>\s*$/g, ""); //usun ostatni enter
            $scope.parts[partObjIndex].Data = $scope.parts[partObjIndex].Data.replace(/\s*<br>\s*$/g, "");
            //console.log("after: " + $scope.parts[partObjIndex].Data);
            addPart(partObjIndex);
            event.preventDefault(); //żeby nie dawało już tego entera
        }
    }
    
    function updatePart(index) {
        //console.log("update");
        $scope.parts[index].localState = "Sending";
        var partObj = $scope.parts[index];
        parts.put(partObj).success(function () {
            $scope.parts[index].localState = "OK";
        }).error(function () {
            $scope.parts[index].localState = "Problem";
        });
    }

    function addPart(lastIndex) {
        //$scope.parts.push({ Data: "new" });
        //console.log("lastIndex: " + lastIndex);
        //console.table($scope.parts);
        var atIndex = lastIndex + 1;
        if (lastIndex == null) {
            atIndex = 0;
        }

        $scope.parts.splice(atIndex, 0, { Data: "new", NoteID: $scope.currentNoteId }); //add at index
        //console.log("after");
        //console.table($scope.parts);
        focusOn("part" + atIndex);
        $scope.parts[index].localState = "Sending";
        parts.post($scope.parts[atIndex]).success(function () {
            $scope.parts[index].localState = "OK";
        }).error(function () {
            $scope.parts[index].localState = "Problem";
        });
    }

    function partsCheckForNull(){
        if ($scope.parts.length == 0 || $scope.parts == null) {
            addPart();
        }
    }
});
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
        console.log("Updating...");
        console.table(part);
        //TODO
        return $http({
            method: 'PUT',
            url: '/api/Parts/'+part.ID,
            data: part,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    return parts;
}]);
(function () {
    'use strict';

    
})();

var app = angular.module('ConsoleNotepad', [
        // Angular modules 
        'ngRoute'

        // Custom modules 

        // 3rd Party Modules

]);

//app.directive('contenteditable', function () {
//    return {
//        restrict: 'A', // only activate on element attribute
//        require: '?ngModel', // get a hold of NgModelController
//        link: function (scope, element, attrs, ngModel) {
//            if (!ngModel) return; // do nothing if no ng-model

//            // Specify how UI should be updated
//            ngModel.$render = function () {
//                element.html(ngModel.$viewValue || '');
//            };

//            // Listen for change events to enable binding
//            element.on('blur keyup change', function () {
//                scope.$apply(read);
//            });
//            read(); // initialize

//            // Write data to the model
//            function read() {
//                var html = element.html();
//                // When we clear the content editable the browser leaves a <br> behind
//                // If strip-br attribute is provided then we strip this out
//                if (attrs.stripBr && html == '<br>') {
//                    html = '';
//                }
//                ngModel.$setViewValue(html);
//            }
//        }
//    };
//});

app.directive('contenteditable', [function () {
    return {
        require: '?ngModel',
        scope: {

        },
        link: function (scope, element, attrs, ctrl) {
            // view -> model (when div gets blur update the view value of the model)
            element.bind('blur keyup change', function () {
                scope.$apply(function () {
                    ctrl.$setViewValue(element.html());
                });
            });

            // model -> view
            ctrl.$render = function () {
                element.html(ctrl.$viewValue);
            };

            // load init value from DOM
            ctrl.$render();

            // remove the attached events to element when destroying the scope
            scope.$on('$destroy', function () {
                element.unbind('blur');
                element.unbind('paste');
                element.unbind('focus');
            });
        }
    };
}]);
app.directive('focusOn', function () {
    return function (scope, elem, attr) {
        scope.$on('focusOn', function (e, name) {
            if (name === attr.focusOn) {
                elem[0].focus();
            }
        });
    };
});

app.factory('focusOn', function ($rootScope, $timeout) {
    return function (name) {
        $timeout(function () {
            $rootScope.$broadcast('focusOn', name);
        });
    }
});
app.controller('editorController', function ($scope, notes, parts, focusOn) {
    $scope.suggestions = {};
    $scope.highlightedSuggestion = -1;
    $scope.currentNoteId = 0;
    $scope.parts = [
        {
            Data: "new"
        }
    ];
    var timeoutUpdate; //setTimeout to update Part
    var editingPartOptions = {};
    $scope.focusOnPart = 0;

    $scope.smartBarKeyDown = function (event) {
        console.log("Refresh " + event.keyCode)
        if (event.keyCode == 32) { //space
            $scope.suggestions = notes.getSuggested($scope.smartBar).success(function (data) {
                console.table(data);
                $scope.suggestions = data;
            });
            console.log("Refreshed");
        }

        if (event.keyCode == 40 && $scope.highlightedSuggestion < $scope.suggestions.length-1) { //arrow down
            event.preventDefault();
            $scope.highlightedSuggestion++;
        }
        if (event.keyCode == 38 && $scope.highlightedSuggestion > -1) { //arrow up
            event.preventDefault();
            $scope.highlightedSuggestion--;
        }

        if (event.keyCode == 13 && $scope.highlightedSuggestion > -1) { //enter
            //uzupełnij inputa, zacznij pisanie notatki
            $scope.smartBar = "";
            console.table($scope.suggestions[$scope.highlightedSuggestion].NoteTags);
            var note = $scope.suggestions[$scope.highlightedSuggestion];
            console.table(note);
            for (var nt in note.NoteTags) {
                //console.log(nt);
                $scope.smartBar += note.NoteTags[nt].Tag.Name + " ";
            }

            $scope.currentNoteId = note.NoteId;
            $scope.parts = parts.get($scope.currentNoteId).success(function (data) {
                $scope.parts = data;
                console.log("Got data: ");
                console.table(data);
                partsCheckForNull();
            });

        }
    }

    $scope.editingPartKeyDown = function (event, partObjIndex) {
        clearTimeout(timeoutUpdate);
        timeoutUpdate = setTimeout(function () { updatePart(partObjIndex) }, 1000);
        //timeoutUpdate = setTimeout(function () { alert("chuj");}, 3000);

        //2x enter dodaje nowy part
        //console.log(partObj.Data);

        var partObj = $scope.parts[partObjIndex];
        if (event.keyCode == 13 && /\s*<br>\s*<br>\s*$/.test(partObj.Data)) { //enter
            //console.log("three enters");
            //console.log("before: " + $scope.parts[partObjIndex].Data);
            //$scope.parts[partObjIndex].Data = $scope.parts[partObjIndex].Data.replace(/\s*<br>\s*<br>\s*$/g, ""); //usun ostatni enter
            $scope.parts[partObjIndex].Data = $scope.parts[partObjIndex].Data.replace(/\s*<br>\s*$/g, "");
            //console.log("after: " + $scope.parts[partObjIndex].Data);
            addPart(partObjIndex);
            event.preventDefault(); //żeby nie dawało już tego entera
        }
    }
    
    function updatePart(index) {
        //console.log("update");
        $scope.parts[index].localState = "Sending";
        var partObj = $scope.parts[index];
        parts.put(partObj).success(function () {
            $scope.parts[index].localState = "OK";
        }).error(function () {
            $scope.parts[index].localState = "Problem";
        });
    }

    function addPart(lastIndex) {
        //$scope.parts.push({ Data: "new" });
        //console.log("lastIndex: " + lastIndex);
        //console.table($scope.parts);
        var atIndex = lastIndex + 1;
        if (lastIndex == null) {
            atIndex = 0;
        }

        $scope.parts.splice(atIndex, 0, { Data: "new", NoteID: $scope.currentNoteId }); //add at index
        //console.log("after");
        //console.table($scope.parts);
        focusOn("part" + atIndex);
        $scope.parts[index].localState = "Sending";
        parts.post($scope.parts[atIndex]).success(function (data) {
            console.log("post success");
            console.table(data);
            $scope.parts[index].localState = "OK";
        }).error(function () {
            $scope.parts[index].localState = "Problem";
        });
    }

    function partsCheckForNull(){
        if ($scope.parts.length == 0 || $scope.parts == null) {
            addPart();
        }
    }
});
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
        console.log("Updating...");
        console.table(part);
        //TODO
        return $http({
            method: 'PUT',
            url: '/api/Parts/'+part.ID,
            data: part,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    return parts;
}]);
(function () {
    'use strict';

    
})();

var app = angular.module('ConsoleNotepad', [
        // Angular modules 
        'ngRoute'

        // Custom modules 

        // 3rd Party Modules

]);

//app.directive('contenteditable', function () {
//    return {
//        restrict: 'A', // only activate on element attribute
//        require: '?ngModel', // get a hold of NgModelController
//        link: function (scope, element, attrs, ngModel) {
//            if (!ngModel) return; // do nothing if no ng-model

//            // Specify how UI should be updated
//            ngModel.$render = function () {
//                element.html(ngModel.$viewValue || '');
//            };

//            // Listen for change events to enable binding
//            element.on('blur keyup change', function () {
//                scope.$apply(read);
//            });
//            read(); // initialize

//            // Write data to the model
//            function read() {
//                var html = element.html();
//                // When we clear the content editable the browser leaves a <br> behind
//                // If strip-br attribute is provided then we strip this out
//                if (attrs.stripBr && html == '<br>') {
//                    html = '';
//                }
//                ngModel.$setViewValue(html);
//            }
//        }
//    };
//});

app.directive('contenteditable', [function () {
    return {
        require: '?ngModel',
        scope: {

        },
        link: function (scope, element, attrs, ctrl) {
            // view -> model (when div gets blur update the view value of the model)
            element.bind('blur keyup change', function () {
                scope.$apply(function () {
                    ctrl.$setViewValue(element.html());
                });
            });

            // model -> view
            ctrl.$render = function () {
                element.html(ctrl.$viewValue);
            };

            // load init value from DOM
            ctrl.$render();

            // remove the attached events to element when destroying the scope
            scope.$on('$destroy', function () {
                element.unbind('blur');
                element.unbind('paste');
                element.unbind('focus');
            });
        }
    };
}]);
app.directive('focusOn', function () {
    return function (scope, elem, attr) {
        scope.$on('focusOn', function (e, name) {
            if (name === attr.focusOn) {
                elem[0].focus();
            }
        });
    };
});

app.factory('focusOn', function ($rootScope, $timeout) {
    return function (name) {
        $timeout(function () {
            $rootScope.$broadcast('focusOn', name);
        });
    }
});
app.controller('editorController', function ($scope, notes, parts, focusOn) {
    $scope.suggestions = {};
    $scope.highlightedSuggestion = -1;
    $scope.currentNoteId = 0;
    $scope.parts = [
        {
            Data: "new"
        }
    ];
    var timeoutUpdate; //setTimeout to update Part
    var editingPartOptions = {};
    $scope.focusOnPart = 0;

    $scope.smartBarKeyDown = function (event) {
        console.log("Refresh " + event.keyCode)
        if (event.keyCode == 32) { //space
            $scope.suggestions = notes.getSuggested($scope.smartBar).success(function (data) {
                console.table(data);
                $scope.suggestions = data;
            });
            console.log("Refreshed");
        }

        if (event.keyCode == 40 && $scope.highlightedSuggestion < $scope.suggestions.length-1) { //arrow down
            event.preventDefault();
            $scope.highlightedSuggestion++;
        }
        if (event.keyCode == 38 && $scope.highlightedSuggestion > -1) { //arrow up
            event.preventDefault();
            $scope.highlightedSuggestion--;
        }

        if (event.keyCode == 13 && $scope.highlightedSuggestion > -1) { //enter
            //uzupełnij inputa, zacznij pisanie notatki
            $scope.smartBar = "";
            console.table($scope.suggestions[$scope.highlightedSuggestion].NoteTags);
            var note = $scope.suggestions[$scope.highlightedSuggestion];
            console.table(note);
            for (var nt in note.NoteTags) {
                //console.log(nt);
                $scope.smartBar += note.NoteTags[nt].Tag.Name + " ";
            }

            $scope.currentNoteId = note.NoteId;
            $scope.parts = parts.get($scope.currentNoteId).success(function (data) {
                $scope.parts = data;
                console.log("Got data: ");
                console.table(data);
                partsCheckForNull();
            });

        }
    }

    $scope.editingPartKeyDown = function (event, partObjIndex) {
        clearTimeout(timeoutUpdate);
        timeoutUpdate = setTimeout(function () { updatePart(partObjIndex) }, 1000);
        //timeoutUpdate = setTimeout(function () { alert("chuj");}, 3000);

        //2x enter dodaje nowy part
        //console.log(partObj.Data);

        var partObj = $scope.parts[partObjIndex];
        if (event.keyCode == 13 && /\s*<br>\s*<br>\s*$/.test(partObj.Data)) { //enter
            //console.log("three enters");
            //console.log("before: " + $scope.parts[partObjIndex].Data);
            //$scope.parts[partObjIndex].Data = $scope.parts[partObjIndex].Data.replace(/\s*<br>\s*<br>\s*$/g, ""); //usun ostatni enter
            $scope.parts[partObjIndex].Data = $scope.parts[partObjIndex].Data.replace(/\s*<br>\s*$/g, "");
            //console.log("after: " + $scope.parts[partObjIndex].Data);
            addPart(partObjIndex);
            event.preventDefault(); //żeby nie dawało już tego entera
        }
    }
    
    function updatePart(index) {
        //console.log("update");
        $scope.parts[index].localState = "Sending";
        var partObj = $scope.parts[index];
        parts.put(partObj).success(function () {
            $scope.parts[index].localState = "OK";
        }).error(function () {
            $scope.parts[index].localState = "Problem";
        });
    }

    function addPart(lastIndex) {
        //$scope.parts.push({ Data: "new" });
        //console.log("lastIndex: " + lastIndex);
        //console.table($scope.parts);
        var atIndex = lastIndex + 1;
        if (lastIndex == null) {
            atIndex = 0;
        }

        $scope.parts.splice(atIndex, 0, { Data: "new", NoteID: $scope.currentNoteId }); //add at index
        //console.log("after");
        //console.table($scope.parts);
        focusOn("part" + atIndex);
        $scope.parts[atIndex].localState = "Sending";
        parts.post($scope.parts[atIndex]).success(function (data) {
            console.log("post success");
            console.table(data);
            $scope.parts[index].localState = "OK";
        }).error(function () {
            $scope.parts[index].localState = "Problem";
        });
    }

    function partsCheckForNull(){
        if ($scope.parts.length == 0 || $scope.parts == null) {
            addPart();
        }
    }
});
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
        console.log("Updating...");
        console.table(part);
        //TODO
        return $http({
            method: 'PUT',
            url: '/api/Parts/'+part.ID,
            data: part,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    return parts;
}]);
(function () {
    'use strict';

    
})();

var app = angular.module('ConsoleNotepad', [
        // Angular modules 
        'ngRoute'

        // Custom modules 

        // 3rd Party Modules

]);

//app.directive('contenteditable', function () {
//    return {
//        restrict: 'A', // only activate on element attribute
//        require: '?ngModel', // get a hold of NgModelController
//        link: function (scope, element, attrs, ngModel) {
//            if (!ngModel) return; // do nothing if no ng-model

//            // Specify how UI should be updated
//            ngModel.$render = function () {
//                element.html(ngModel.$viewValue || '');
//            };

//            // Listen for change events to enable binding
//            element.on('blur keyup change', function () {
//                scope.$apply(read);
//            });
//            read(); // initialize

//            // Write data to the model
//            function read() {
//                var html = element.html();
//                // When we clear the content editable the browser leaves a <br> behind
//                // If strip-br attribute is provided then we strip this out
//                if (attrs.stripBr && html == '<br>') {
//                    html = '';
//                }
//                ngModel.$setViewValue(html);
//            }
//        }
//    };
//});

app.directive('contenteditable', [function () {
    return {
        require: '?ngModel',
        scope: {

        },
        link: function (scope, element, attrs, ctrl) {
            // view -> model (when div gets blur update the view value of the model)
            element.bind('blur keyup change', function () {
                scope.$apply(function () {
                    ctrl.$setViewValue(element.html());
                });
            });

            // model -> view
            ctrl.$render = function () {
                element.html(ctrl.$viewValue);
            };

            // load init value from DOM
            ctrl.$render();

            // remove the attached events to element when destroying the scope
            scope.$on('$destroy', function () {
                element.unbind('blur');
                element.unbind('paste');
                element.unbind('focus');
            });
        }
    };
}]);
app.directive('focusOn', function () {
    return function (scope, elem, attr) {
        scope.$on('focusOn', function (e, name) {
            if (name === attr.focusOn) {
                elem[0].focus();
            }
        });
    };
});

app.factory('focusOn', function ($rootScope, $timeout) {
    return function (name) {
        $timeout(function () {
            $rootScope.$broadcast('focusOn', name);
        });
    }
});
app.controller('editorController', function ($scope, notes, parts, focusOn) {
    $scope.suggestions = {};
    $scope.highlightedSuggestion = -1;
    $scope.currentNoteId = 0;
    $scope.parts = [
        {
            Data: "new"
        }
    ];
    var timeoutUpdate; //setTimeout to update Part
    var editingPartOptions = {};
    $scope.focusOnPart = 0;

    $scope.smartBarKeyDown = function (event) {
        console.log("Refresh " + event.keyCode)
        if (event.keyCode == 32) { //space
            $scope.suggestions = notes.getSuggested($scope.smartBar).success(function (data) {
                console.table(data);
                $scope.suggestions = data;
            });
            console.log("Refreshed");
        }

        if (event.keyCode == 40 && $scope.highlightedSuggestion < $scope.suggestions.length-1) { //arrow down
            event.preventDefault();
            $scope.highlightedSuggestion++;
        }
        if (event.keyCode == 38 && $scope.highlightedSuggestion > -1) { //arrow up
            event.preventDefault();
            $scope.highlightedSuggestion--;
        }

        if (event.keyCode == 13 && $scope.highlightedSuggestion > -1) { //enter
            //uzupełnij inputa, zacznij pisanie notatki
            $scope.smartBar = "";
            console.table($scope.suggestions[$scope.highlightedSuggestion].NoteTags);
            var note = $scope.suggestions[$scope.highlightedSuggestion];
            console.table(note);
            for (var nt in note.NoteTags) {
                //console.log(nt);
                $scope.smartBar += note.NoteTags[nt].Tag.Name + " ";
            }

            $scope.currentNoteId = note.NoteId;
            $scope.parts = parts.get($scope.currentNoteId).success(function (data) {
                $scope.parts = data;
                console.log("Got data: ");
                console.table(data);
                partsCheckForNull();
            });

        }
    }

    $scope.editingPartKeyDown = function (event, partObjIndex) {
        clearTimeout(timeoutUpdate);
        timeoutUpdate = setTimeout(function () { updatePart(partObjIndex) }, 1000);
        //timeoutUpdate = setTimeout(function () { alert("chuj");}, 3000);

        //2x enter dodaje nowy part
        //console.log(partObj.Data);

        var partObj = $scope.parts[partObjIndex];
        if (event.keyCode == 13 && /\s*<br>\s*<br>\s*$/.test(partObj.Data)) { //enter
            //console.log("three enters");
            //console.log("before: " + $scope.parts[partObjIndex].Data);
            //$scope.parts[partObjIndex].Data = $scope.parts[partObjIndex].Data.replace(/\s*<br>\s*<br>\s*$/g, ""); //usun ostatni enter
            $scope.parts[partObjIndex].Data = $scope.parts[partObjIndex].Data.replace(/\s*<br>\s*$/g, "");
            //console.log("after: " + $scope.parts[partObjIndex].Data);
            addPart(partObjIndex);
            event.preventDefault(); //żeby nie dawało już tego entera
        }
    }
    
    function updatePart(index) {
        //console.log("update");
        $scope.parts[index].localState = "Sending";
        var partObj = $scope.parts[index];
        parts.put(partObj).success(function () {
            $scope.parts[index].localState = "OK";
        }).error(function () {
            $scope.parts[index].localState = "Problem";
        });
    }

    function addPart(lastIndex) {
        //$scope.parts.push({ Data: "new" });
        //console.log("lastIndex: " + lastIndex);
        //console.table($scope.parts);
        var atIndex = lastIndex + 1;
        if (lastIndex == null) {
            atIndex = 0;
        }

        $scope.parts.splice(atIndex, 0, { Data: "new", NoteID: $scope.currentNoteId }); //add at index
        //console.log("after");
        //console.table($scope.parts);
        focusOn("part" + atIndex);
        $scope.parts[atIndex].localState = "Sending";
        parts.post($scope.parts[atIndex]).success(function (data) {
            console.log("post success");
            console.table(data);
            $scope.parts[atIndex].localState = "OK";
        }).error(function () {
            $scope.parts[atIndex].localState = "Problem";
        });
    }

    function partsCheckForNull(){
        if ($scope.parts.length == 0 || $scope.parts == null) {
            addPart();
        }
    }
});
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
        console.log("Updating...");
        console.table(part);
        //TODO
        return $http({
            method: 'PUT',
            url: '/api/Parts/'+part.ID,
            data: part,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    return parts;
}]);
(function () {
    'use strict';

    
})();

var app = angular.module('ConsoleNotepad', [
        // Angular modules 
        'ngRoute'

        // Custom modules 

        // 3rd Party Modules

]);

//app.directive('contenteditable', function () {
//    return {
//        restrict: 'A', // only activate on element attribute
//        require: '?ngModel', // get a hold of NgModelController
//        link: function (scope, element, attrs, ngModel) {
//            if (!ngModel) return; // do nothing if no ng-model

//            // Specify how UI should be updated
//            ngModel.$render = function () {
//                element.html(ngModel.$viewValue || '');
//            };

//            // Listen for change events to enable binding
//            element.on('blur keyup change', function () {
//                scope.$apply(read);
//            });
//            read(); // initialize

//            // Write data to the model
//            function read() {
//                var html = element.html();
//                // When we clear the content editable the browser leaves a <br> behind
//                // If strip-br attribute is provided then we strip this out
//                if (attrs.stripBr && html == '<br>') {
//                    html = '';
//                }
//                ngModel.$setViewValue(html);
//            }
//        }
//    };
//});

app.directive('contenteditable', [function () {
    return {
        require: '?ngModel',
        scope: {

        },
        link: function (scope, element, attrs, ctrl) {
            // view -> model (when div gets blur update the view value of the model)
            element.bind('blur keyup change', function () {
                scope.$apply(function () {
                    ctrl.$setViewValue(element.html());
                });
            });

            // model -> view
            ctrl.$render = function () {
                element.html(ctrl.$viewValue);
            };

            // load init value from DOM
            ctrl.$render();

            // remove the attached events to element when destroying the scope
            scope.$on('$destroy', function () {
                element.unbind('blur');
                element.unbind('paste');
                element.unbind('focus');
            });
        }
    };
}]);
app.directive('focusOn', function () {
    return function (scope, elem, attr) {
        scope.$on('focusOn', function (e, name) {
            if (name === attr.focusOn) {
                elem[0].focus();
            }
        });
    };
});

app.factory('focusOn', function ($rootScope, $timeout) {
    return function (name) {
        $timeout(function () {
            $rootScope.$broadcast('focusOn', name);
        });
    }
});
app.controller('editorController', function ($scope, notes, parts, focusOn) {
    $scope.suggestions = {};
    $scope.highlightedSuggestion = -1;
    $scope.currentNoteId = 0;
    $scope.parts = [
        {
            Data: "new"
        }
    ];
    var timeoutUpdate; //setTimeout to update Part
    var editingPartOptions = {};
    $scope.focusOnPart = 0;

    $scope.smartBarKeyDown = function (event) {
        console.log("Refresh " + event.keyCode)
        if (event.keyCode == 32) { //space
            $scope.suggestions = notes.getSuggested($scope.smartBar).success(function (data) {
                console.table(data);
                $scope.suggestions = data;
            });
            console.log("Refreshed");
        }

        if (event.keyCode == 40 && $scope.highlightedSuggestion < $scope.suggestions.length-1) { //arrow down
            event.preventDefault();
            $scope.highlightedSuggestion++;
        }
        if (event.keyCode == 38 && $scope.highlightedSuggestion > -1) { //arrow up
            event.preventDefault();
            $scope.highlightedSuggestion--;
        }

        if (event.keyCode == 13 && $scope.highlightedSuggestion > -1) { //enter
            //uzupełnij inputa, zacznij pisanie notatki
            $scope.smartBar = "";
            console.table($scope.suggestions[$scope.highlightedSuggestion].NoteTags);
            var note = $scope.suggestions[$scope.highlightedSuggestion];
            console.table(note);
            for (var nt in note.NoteTags) {
                //console.log(nt);
                $scope.smartBar += note.NoteTags[nt].Tag.Name + " ";
            }

            $scope.currentNoteId = note.NoteId;
            $scope.parts = parts.get($scope.currentNoteId).success(function (data) {
                $scope.parts = data;
                console.log("Got data: ");
                console.table(data);
                partsCheckForNull();
            });

        }
    }

    $scope.editingPartKeyDown = function (event, partObjIndex) {
        clearTimeout(timeoutUpdate);
        timeoutUpdate = setTimeout(function () { updatePart(partObjIndex) }, 1000);
        //timeoutUpdate = setTimeout(function () { alert("chuj");}, 3000);

        //2x enter dodaje nowy part
        //console.log(partObj.Data);

        var partObj = $scope.parts[partObjIndex];
        if (event.keyCode == 13 && /\s*<br>\s*<br>\s*$/.test(partObj.Data)) { //enter
            //console.log("three enters");
            //console.log("before: " + $scope.parts[partObjIndex].Data);
            //$scope.parts[partObjIndex].Data = $scope.parts[partObjIndex].Data.replace(/\s*<br>\s*<br>\s*$/g, ""); //usun ostatni enter
            $scope.parts[partObjIndex].Data = $scope.parts[partObjIndex].Data.replace(/\s*<br>\s*$/g, "");
            //console.log("after: " + $scope.parts[partObjIndex].Data);
            addPart(partObjIndex);
            event.preventDefault(); //żeby nie dawało już tego entera
        }
    }
    
    function updatePart(index) {
        //console.log("update");
        $scope.parts[index].localState = "Sending";
        var partObj = $scope.parts[index];
        parts.put(partObj).success(function () {
            $scope.parts[index].localState = "OK";
        }).error(function () {
            $scope.parts[index].localState = "Problem";
        });
    }

    function addPart(lastIndex) {
        //$scope.parts.push({ Data: "new" });
        //console.log("lastIndex: " + lastIndex);
        //console.table($scope.parts);
        var atIndex = lastIndex + 1;
        if (lastIndex == null) {
            atIndex = 0;
        }

        $scope.parts.splice(atIndex, 0, { Data: "new", NoteID: $scope.currentNoteId }); //add at index
        //console.log("after");
        //console.table($scope.parts);
        focusOn("part" + atIndex);
        $scope.parts[atIndex].localState = "Sending";
        parts.post($scope.parts[atIndex]).success(function (data) {
            console.log("post success");
            console.table(data);
            $scope.parts[atIndex].ID = data.ID;
            $scope.parts[atIndex].localState = "OK";
        }).error(function () {
            $scope.parts[atIndex].localState = "Problem";
        });
    }

    function partsCheckForNull(){
        if ($scope.parts.length == 0 || $scope.parts == null) {
            addPart();
        }
    }
});
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
        console.log("Updating...");
        console.table(part);
        //TODO
        return $http({
            method: 'PUT',
            url: '/api/Parts/'+part.ID,
            data: part,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    return parts;
}]);
(function () {
    'use strict';

    
})();

var app = angular.module('ConsoleNotepad', [
        // Angular modules 
        'ngRoute'

        // Custom modules 

        // 3rd Party Modules

]);

//app.directive('contenteditable', function () {
//    return {
//        restrict: 'A', // only activate on element attribute
//        require: '?ngModel', // get a hold of NgModelController
//        link: function (scope, element, attrs, ngModel) {
//            if (!ngModel) return; // do nothing if no ng-model

//            // Specify how UI should be updated
//            ngModel.$render = function () {
//                element.html(ngModel.$viewValue || '');
//            };

//            // Listen for change events to enable binding
//            element.on('blur keyup change', function () {
//                scope.$apply(read);
//            });
//            read(); // initialize

//            // Write data to the model
//            function read() {
//                var html = element.html();
//                // When we clear the content editable the browser leaves a <br> behind
//                // If strip-br attribute is provided then we strip this out
//                if (attrs.stripBr && html == '<br>') {
//                    html = '';
//                }
//                ngModel.$setViewValue(html);
//            }
//        }
//    };
//});

app.directive('contenteditable', [function () {
    return {
        require: '?ngModel',
        scope: {

        },
        link: function (scope, element, attrs, ctrl) {
            // view -> model (when div gets blur update the view value of the model)
            element.bind('blur keyup change', function () {
                scope.$apply(function () {
                    ctrl.$setViewValue(element.html());
                });
            });

            // model -> view
            ctrl.$render = function () {
                element.html(ctrl.$viewValue);
            };

            // load init value from DOM
            ctrl.$render();

            // remove the attached events to element when destroying the scope
            scope.$on('$destroy', function () {
                element.unbind('blur');
                element.unbind('paste');
                element.unbind('focus');
            });
        }
    };
}]);
app.directive('focusOn', function () {
    return function (scope, elem, attr) {
        scope.$on('focusOn', function (e, name) {
            if (name === attr.focusOn) {
                elem[0].focus();
            }
        });
    };
});

app.factory('focusOn', function ($rootScope, $timeout) {
    return function (name) {
        $timeout(function () {
            $rootScope.$broadcast('focusOn', name);
        });
    }
});
app.controller('editorController', function ($scope, notes, parts, focusOn) {
    $scope.suggestions = {};
    $scope.highlightedSuggestion = -1;
    $scope.currentNoteId = 0;
    $scope.parts = [
        {
            Data: "new"
        }
    ];
    var timeoutUpdate; //setTimeout to update Part
    var editingPartOptions = {};
    $scope.focusOnPart = 0;

    $scope.smartBarKeyDown = function (event) {
        console.log("Refresh " + event.keyCode)
        if (event.keyCode == 32) { //space
            $scope.suggestions = notes.getSuggested($scope.smartBar).success(function (data) {
                console.table(data);
                $scope.suggestions = data;
            });
            console.log("Refreshed");
        }

        if (event.keyCode == 40 && $scope.highlightedSuggestion < $scope.suggestions.length-1) { //arrow down
            event.preventDefault();
            $scope.highlightedSuggestion++;
        }
        if (event.keyCode == 38 && $scope.highlightedSuggestion > -1) { //arrow up
            event.preventDefault();
            $scope.highlightedSuggestion--;
        }

        if (event.keyCode == 13 && $scope.highlightedSuggestion > -1) { //enter
            //uzupełnij inputa, zacznij pisanie notatki
            $scope.smartBar = "";
            console.table($scope.suggestions[$scope.highlightedSuggestion].NoteTags);
            var note = $scope.suggestions[$scope.highlightedSuggestion];
            console.table(note);
            for (var nt in note.NoteTags) {
                //console.log(nt);
                $scope.smartBar += note.NoteTags[nt].Tag.Name + " ";
            }

            $scope.currentNoteId = note.NoteId;
            $scope.parts = parts.get($scope.currentNoteId).success(function (data) {
                $scope.parts = data;
                console.log("Got data: ");
                console.table(data);
                partsCheckForNull();
            });

        }
    }

    $scope.editingPartKeyDown = function (event, partObjIndex) {
        clearTimeout(timeoutUpdate);
        timeoutUpdate = setTimeout(function () { updatePart(partObjIndex) }, 1000);
        $scope.parts[index].localState = "Sending";
        //timeoutUpdate = setTimeout(function () { alert("chuj");}, 3000);

        //2x enter dodaje nowy part
        //console.log(partObj.Data);

        var partObj = $scope.parts[partObjIndex];
        if (event.keyCode == 13 && /\s*<br>\s*<br>\s*$/.test(partObj.Data)) { //enter
            //console.log("three enters");
            //console.log("before: " + $scope.parts[partObjIndex].Data);
            //$scope.parts[partObjIndex].Data = $scope.parts[partObjIndex].Data.replace(/\s*<br>\s*<br>\s*$/g, ""); //usun ostatni enter
            $scope.parts[partObjIndex].Data = $scope.parts[partObjIndex].Data.replace(/\s*<br>\s*$/g, "");
            //console.log("after: " + $scope.parts[partObjIndex].Data);
            addPart(partObjIndex);
            event.preventDefault(); //żeby nie dawało już tego entera
        }
    }
    
    function updatePart(index) {
        //console.log("update");
        $scope.parts[index].localState = "Sending";
        var partObj = $scope.parts[index];
        parts.put(partObj).success(function () {
            $scope.parts[index].localState = "OK";
        }).error(function () {
            $scope.parts[index].localState = "Problem";
        });
    }

    function addPart(lastIndex) {
        //$scope.parts.push({ Data: "new" });
        //console.log("lastIndex: " + lastIndex);
        //console.table($scope.parts);
        var atIndex = lastIndex + 1;
        if (lastIndex == null) {
            atIndex = 0;
        }

        $scope.parts.splice(atIndex, 0, { Data: "new", NoteID: $scope.currentNoteId }); //add at index
        //console.log("after");
        //console.table($scope.parts);
        focusOn("part" + atIndex);
        $scope.parts[atIndex].localState = "Sending";
        parts.post($scope.parts[atIndex]).success(function (data) {
            console.log("post success");
            console.table(data);
            $scope.parts[atIndex].ID = data.ID;
            $scope.parts[atIndex].localState = "OK";
        }).error(function () {
            $scope.parts[atIndex].localState = "Problem";
        });
    }

    function partsCheckForNull(){
        if ($scope.parts.length == 0 || $scope.parts == null) {
            addPart();
        }
    }
});
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
        console.log("Updating...");
        console.table(part);
        //TODO
        return $http({
            method: 'PUT',
            url: '/api/Parts/'+part.ID,
            data: part,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    return parts;
}]);
(function () {
    'use strict';

    
})();

var app = angular.module('ConsoleNotepad', [
        // Angular modules 
        'ngRoute'

        // Custom modules 

        // 3rd Party Modules

]);

//app.directive('contenteditable', function () {
//    return {
//        restrict: 'A', // only activate on element attribute
//        require: '?ngModel', // get a hold of NgModelController
//        link: function (scope, element, attrs, ngModel) {
//            if (!ngModel) return; // do nothing if no ng-model

//            // Specify how UI should be updated
//            ngModel.$render = function () {
//                element.html(ngModel.$viewValue || '');
//            };

//            // Listen for change events to enable binding
//            element.on('blur keyup change', function () {
//                scope.$apply(read);
//            });
//            read(); // initialize

//            // Write data to the model
//            function read() {
//                var html = element.html();
//                // When we clear the content editable the browser leaves a <br> behind
//                // If strip-br attribute is provided then we strip this out
//                if (attrs.stripBr && html == '<br>') {
//                    html = '';
//                }
//                ngModel.$setViewValue(html);
//            }
//        }
//    };
//});

app.directive('contenteditable', [function () {
    return {
        require: '?ngModel',
        scope: {

        },
        link: function (scope, element, attrs, ctrl) {
            // view -> model (when div gets blur update the view value of the model)
            element.bind('blur keyup change', function () {
                scope.$apply(function () {
                    ctrl.$setViewValue(element.html());
                });
            });

            // model -> view
            ctrl.$render = function () {
                element.html(ctrl.$viewValue);
            };

            // load init value from DOM
            ctrl.$render();

            // remove the attached events to element when destroying the scope
            scope.$on('$destroy', function () {
                element.unbind('blur');
                element.unbind('paste');
                element.unbind('focus');
            });
        }
    };
}]);
app.directive('focusOn', function () {
    return function (scope, elem, attr) {
        scope.$on('focusOn', function (e, name) {
            if (name === attr.focusOn) {
                elem[0].focus();
            }
        });
    };
});

app.factory('focusOn', function ($rootScope, $timeout) {
    return function (name) {
        $timeout(function () {
            $rootScope.$broadcast('focusOn', name);
        });
    }
});
app.controller('editorController', function ($scope, notes, parts, focusOn) {
    $scope.suggestions = {};
    $scope.highlightedSuggestion = -1;
    $scope.currentNoteId = 0;
    $scope.parts = [
        {
            Data: "new"
        }
    ];
    var timeoutUpdate; //setTimeout to update Part
    var editingPartOptions = {};
    $scope.focusOnPart = 0;

    $scope.smartBarKeyDown = function (event) {
        console.log("Refresh " + event.keyCode)
        if (event.keyCode == 32) { //space
            $scope.suggestions = notes.getSuggested($scope.smartBar).success(function (data) {
                console.table(data);
                $scope.suggestions = data;
            });
            console.log("Refreshed");
        }

        if (event.keyCode == 40 && $scope.highlightedSuggestion < $scope.suggestions.length-1) { //arrow down
            event.preventDefault();
            $scope.highlightedSuggestion++;
        }
        if (event.keyCode == 38 && $scope.highlightedSuggestion > -1) { //arrow up
            event.preventDefault();
            $scope.highlightedSuggestion--;
        }

        if (event.keyCode == 13 && $scope.highlightedSuggestion > -1) { //enter
            //uzupełnij inputa, zacznij pisanie notatki
            $scope.smartBar = "";
            console.table($scope.suggestions[$scope.highlightedSuggestion].NoteTags);
            var note = $scope.suggestions[$scope.highlightedSuggestion];
            console.table(note);
            for (var nt in note.NoteTags) {
                //console.log(nt);
                $scope.smartBar += note.NoteTags[nt].Tag.Name + " ";
            }

            $scope.currentNoteId = note.NoteId;
            $scope.parts = parts.get($scope.currentNoteId).success(function (data) {
                $scope.parts = data;
                console.log("Got data: ");
                console.table(data);
                partsCheckForNull();
            });

        }
    }

    $scope.editingPartKeyDown = function (event, partObjIndex) {
        clearTimeout(timeoutUpdate);
        timeoutUpdate = setTimeout(function () { updatePart(partObjIndex) }, 1000);
        $scope.parts[partObjIndex].localState = "Sending";
        //timeoutUpdate = setTimeout(function () { alert("chuj");}, 3000);

        //2x enter dodaje nowy part
        //console.log(partObj.Data);

        var partObj = $scope.parts[partObjIndex];
        if (event.keyCode == 13 && /\s*<br>\s*<br>\s*$/.test(partObj.Data)) { //enter
            //console.log("three enters");
            //console.log("before: " + $scope.parts[partObjIndex].Data);
            //$scope.parts[partObjIndex].Data = $scope.parts[partObjIndex].Data.replace(/\s*<br>\s*<br>\s*$/g, ""); //usun ostatni enter
            $scope.parts[partObjIndex].Data = $scope.parts[partObjIndex].Data.replace(/\s*<br>\s*$/g, "");
            //console.log("after: " + $scope.parts[partObjIndex].Data);
            addPart(partObjIndex);
            event.preventDefault(); //żeby nie dawało już tego entera
        }
    }
    
    function updatePart(index) {
        //console.log("update");
        $scope.parts[index].localState = "Sending";
        var partObj = $scope.parts[index];
        parts.put(partObj).success(function () {
            $scope.parts[index].localState = "OK";
        }).error(function () {
            $scope.parts[index].localState = "Problem";
        });
    }

    function addPart(lastIndex) {
        //$scope.parts.push({ Data: "new" });
        //console.log("lastIndex: " + lastIndex);
        //console.table($scope.parts);
        var atIndex = lastIndex + 1;
        if (lastIndex == null) {
            atIndex = 0;
        }

        $scope.parts.splice(atIndex, 0, { Data: "new", NoteID: $scope.currentNoteId }); //add at index
        //console.log("after");
        //console.table($scope.parts);
        focusOn("part" + atIndex);
        $scope.parts[atIndex].localState = "Sending";
        parts.post($scope.parts[atIndex]).success(function (data) {
            console.log("post success");
            console.table(data);
            $scope.parts[atIndex].ID = data.ID;
            $scope.parts[atIndex].localState = "OK";
        }).error(function () {
            $scope.parts[atIndex].localState = "Problem";
        });
    }

    function partsCheckForNull(){
        if ($scope.parts.length == 0 || $scope.parts == null) {
            addPart();
        }
    }
});
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
        console.log("Updating...");
        console.table(part);
        //TODO
        return $http({
            method: 'PUT',
            url: '/api/Parts/'+part.ID,
            data: part,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    return parts;
}]);
(function () {
    'use strict';

    
})();

var app = angular.module('ConsoleNotepad', [
        // Angular modules 
        'ngRoute'

        // Custom modules 

        // 3rd Party Modules

]);

//app.directive('contenteditable', function () {
//    return {
//        restrict: 'A', // only activate on element attribute
//        require: '?ngModel', // get a hold of NgModelController
//        link: function (scope, element, attrs, ngModel) {
//            if (!ngModel) return; // do nothing if no ng-model

//            // Specify how UI should be updated
//            ngModel.$render = function () {
//                element.html(ngModel.$viewValue || '');
//            };

//            // Listen for change events to enable binding
//            element.on('blur keyup change', function () {
//                scope.$apply(read);
//            });
//            read(); // initialize

//            // Write data to the model
//            function read() {
//                var html = element.html();
//                // When we clear the content editable the browser leaves a <br> behind
//                // If strip-br attribute is provided then we strip this out
//                if (attrs.stripBr && html == '<br>') {
//                    html = '';
//                }
//                ngModel.$setViewValue(html);
//            }
//        }
//    };
//});

app.directive('contenteditable', [function () {
    return {
        require: '?ngModel',
        scope: {

        },
        link: function (scope, element, attrs, ctrl) {
            // view -> model (when div gets blur update the view value of the model)
            element.bind('blur keyup change', function () {
                scope.$apply(function () {
                    ctrl.$setViewValue(element.html());
                });
            });

            // model -> view
            ctrl.$render = function () {
                element.html(ctrl.$viewValue);
            };

            // load init value from DOM
            ctrl.$render();

            // remove the attached events to element when destroying the scope
            scope.$on('$destroy', function () {
                element.unbind('blur');
                element.unbind('paste');
                element.unbind('focus');
            });
        }
    };
}]);
app.directive('focusOn', function () {
    return function (scope, elem, attr) {
        scope.$on('focusOn', function (e, name) {
            if (name === attr.focusOn) {
                elem[0].focus();
            }
        });
    };
});

app.factory('focusOn', function ($rootScope, $timeout) {
    return function (name) {
        $timeout(function () {
            $rootScope.$broadcast('focusOn', name);
        });
    }
});
app.controller('editorController', function ($scope, notes, parts, focusOn) {
    $scope.suggestions = {};
    $scope.highlightedSuggestion = -1;
    $scope.currentNoteId = 0;
    $scope.parts = [
        {
            Data: "new"
        }
    ];
    var timeoutUpdate; //setTimeout to update Part
    var editingPartOptions = {};
    $scope.focusOnPart = 0;

    $scope.smartBarKeyDown = function (event) {
        console.log("Refresh " + event.keyCode)
        if (event.keyCode == 32) { //space
            $scope.suggestions = notes.getSuggested($scope.smartBar).success(function (data) {
                console.table(data);
                $scope.suggestions = data;
            });
            console.log("Refreshed");
        }

        if (event.keyCode == 40 && $scope.highlightedSuggestion < $scope.suggestions.length-1) { //arrow down
            event.preventDefault();
            $scope.highlightedSuggestion++;
        }
        if (event.keyCode == 38 && $scope.highlightedSuggestion > -1) { //arrow up
            event.preventDefault();
            $scope.highlightedSuggestion--;
        }

        if (event.keyCode == 13 && $scope.highlightedSuggestion > -1) { //enter
            //uzupełnij inputa, zacznij pisanie notatki
            $scope.smartBar = "";
            console.table($scope.suggestions[$scope.highlightedSuggestion].NoteTags);
            var note = $scope.suggestions[$scope.highlightedSuggestion];
            console.table(note);
            for (var nt in note.NoteTags) {
                //console.log(nt);
                $scope.smartBar += note.NoteTags[nt].Tag.Name + " ";
            }

            $scope.currentNoteId = note.NoteId;
            $scope.parts = parts.get($scope.currentNoteId).success(function (data) {
                $scope.parts = data;
                console.log("Got data: ");
                console.table(data);
                partsCheckForNull();
            });

        }
    }

    $scope.editingPartKeyDown = function (event, partObjIndex) {
        clearTimeout(timeoutUpdate);
        timeoutUpdate = setTimeout(function () { updatePart(partObjIndex) }, 1000);
        $scope.parts[partObjIndex].localState = "Sending";
        //timeoutUpdate = setTimeout(function () { alert("chuj");}, 3000);

        //2x enter dodaje nowy part
        //console.log(partObj.Data);

        var partObj = $scope.parts[partObjIndex];
        if (event.keyCode == 13 && /\s*<br>\s*<br>\s*$/.test(partObj.Data)) { //enter
            //console.log("three enters");
            //console.log("before: " + $scope.parts[partObjIndex].Data);
            //$scope.parts[partObjIndex].Data = $scope.parts[partObjIndex].Data.replace(/\s*<br>\s*<br>\s*$/g, ""); //usun ostatni enter
            $scope.parts[partObjIndex].Data = $scope.parts[partObjIndex].Data.replace(/\s*<br>\s*$/g, "");
            //console.log("after: " + $scope.parts[partObjIndex].Data);
            addPart(partObjIndex);
            event.preventDefault(); //żeby nie dawało już tego entera
        }
    }
    
    function updatePart(index) {
        //console.log("update");
        $scope.parts[index].localState = "Sending";
        var partObj = $scope.parts[index];
        parts.put(partObj).success(function () {
            $scope.parts[index].localState = "OK";
        }).error(function () {
            $scope.parts[index].localState = "Problem";
        });
    }

    function addPart(lastIndex) {
        //$scope.parts.push({ Data: "new" });
        //console.log("lastIndex: " + lastIndex);
        //console.table($scope.parts);
        var atIndex = lastIndex + 1;
        if (lastIndex == null) {
            atIndex = 0;
        }

        $scope.parts.splice(atIndex, 0, { Data: "new", NoteID: $scope.currentNoteId }); //add at index
        //console.log("after");
        //console.table($scope.parts);
        focusOn("part" + atIndex);
        $scope.parts[atIndex].localState = "Sending";
        parts.post($scope.parts[atIndex]).success(function (data) {
            console.log("post success");
            console.table(data);
            $scope.parts[atIndex].ID = data.ID;
            $scope.parts[atIndex].localState = "OK";
        }).error(function () {
            $scope.parts[atIndex].localState = "Problem";
        });
    }

    function partsCheckForNull(){
        if ($scope.parts.length == 0 || $scope.parts == null) {
            addPart();
        }
    }
});
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
        return $http({
            method: 'PUT',
            url: '/api/Parts/'+part.ID,
            data: part,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    return parts;
}]);
(function () {
    'use strict';

    
})();

var app = angular.module('ConsoleNotepad', [
        // Angular modules 
        'ngRoute'

        // Custom modules 

        // 3rd Party Modules

]);

//app.directive('contenteditable', function () {
//    return {
//        restrict: 'A', // only activate on element attribute
//        require: '?ngModel', // get a hold of NgModelController
//        link: function (scope, element, attrs, ngModel) {
//            if (!ngModel) return; // do nothing if no ng-model

//            // Specify how UI should be updated
//            ngModel.$render = function () {
//                element.html(ngModel.$viewValue || '');
//            };

//            // Listen for change events to enable binding
//            element.on('blur keyup change', function () {
//                scope.$apply(read);
//            });
//            read(); // initialize

//            // Write data to the model
//            function read() {
//                var html = element.html();
//                // When we clear the content editable the browser leaves a <br> behind
//                // If strip-br attribute is provided then we strip this out
//                if (attrs.stripBr && html == '<br>') {
//                    html = '';
//                }
//                ngModel.$setViewValue(html);
//            }
//        }
//    };
//});

app.directive('contenteditable', [function () {
    return {
        require: '?ngModel',
        scope: {

        },
        link: function (scope, element, attrs, ctrl) {
            // view -> model (when div gets blur update the view value of the model)
            element.bind('blur keyup change', function () {
                scope.$apply(function () {
                    ctrl.$setViewValue(element.html());
                });
            });

            // model -> view
            ctrl.$render = function () {
                element.html(ctrl.$viewValue);
            };

            // load init value from DOM
            ctrl.$render();

            // remove the attached events to element when destroying the scope
            scope.$on('$destroy', function () {
                element.unbind('blur');
                element.unbind('paste');
                element.unbind('focus');
            });
        }
    };
}]);
app.directive('focusOn', function () {
    return function (scope, elem, attr) {
        scope.$on('focusOn', function (e, name) {
            if (name === attr.focusOn) {
                elem[0].focus();
            }
        });
    };
});

app.factory('focusOn', function ($rootScope, $timeout) {
    return function (name) {
        $timeout(function () {
            $rootScope.$broadcast('focusOn', name);
        });
    }
});
app.controller('editorController', function ($scope, notes, parts, focusOn) {
    $scope.suggestions = {};
    $scope.highlightedSuggestion = -1;
    $scope.currentNoteId = 0;
    $scope.parts = [
        {
            Data: "new"
        }
    ];
    var timeoutUpdate; //setTimeout to update Part
    var editingPartOptions = {};
    $scope.focusOnPart = 0;

    $scope.smartBarKeyDown = function (event) {
        console.log("Refresh " + event.keyCode)
        if (event.keyCode == 32) { //space
            $scope.suggestions = notes.getSuggested($scope.smartBar).success(function (data) {
                console.table(data);
                $scope.suggestions = data;
            });
            console.log("Refreshed");
        }

        if (event.keyCode == 40 && $scope.highlightedSuggestion < $scope.suggestions.length-1) { //arrow down
            event.preventDefault();
            $scope.highlightedSuggestion++;
        }
        if (event.keyCode == 38 && $scope.highlightedSuggestion > -1) { //arrow up
            event.preventDefault();
            $scope.highlightedSuggestion--;
        }

        if (event.keyCode == 13 && $scope.highlightedSuggestion > -1) { //enter
            //uzupełnij inputa, zacznij pisanie notatki
            $scope.smartBar = "";
            console.table($scope.suggestions[$scope.highlightedSuggestion].NoteTags);
            var note = $scope.suggestions[$scope.highlightedSuggestion];
            console.table(note);
            for (var nt in note.NoteTags) {
                //console.log(nt);
                $scope.smartBar += note.NoteTags[nt].Tag.Name + " ";
            }

            $scope.currentNoteId = note.NoteId;
            $scope.parts = parts.get($scope.currentNoteId).success(function (data) {
                $scope.parts = data;
                console.log("Got data: ");
                console.table(data);
                partsCheckForNull();
            });

        }
    }

    $scope.editingPartKeyDown = function (event, partObjIndex) {
        clearTimeout(timeoutUpdate);
        timeoutUpdate = setTimeout(function () { updatePart(partObjIndex) }, 1000);
        $scope.parts[partObjIndex].localState = "Sending";
        //timeoutUpdate = setTimeout(function () { alert("chuj");}, 3000);

        //2x enter dodaje nowy part
        //console.log(partObj.Data);

        var partObj = $scope.parts[partObjIndex];
        if (event.keyCode == 13 && /\s*<br>\s*<br>\s*$/.test(partObj.Data)) { //enter
            //console.log("three enters");
            //console.log("before: " + $scope.parts[partObjIndex].Data);
            //$scope.parts[partObjIndex].Data = $scope.parts[partObjIndex].Data.replace(/\s*<br>\s*<br>\s*$/g, ""); //usun ostatni enter
            $scope.parts[partObjIndex].Data = $scope.parts[partObjIndex].Data.replace(/\s*<br>\s*$/g, "");
            //console.log("after: " + $scope.parts[partObjIndex].Data);
            addPart(partObjIndex);
            event.preventDefault(); //żeby nie dawało już tego entera
        }
    }
    
    function updatePart(index) {
        //console.log("update");
        $scope.parts[index].localState = "Sending";
        var partObj = $scope.parts[index];
        parts.put(partObj).success(function () {
            $scope.parts[index].localState = "OK";
        }).error(function () {
            $scope.parts[index].localState = "Problem";
        });
    }

    function addPart(lastIndex) {
        //$scope.parts.push({ Data: "new" });
        //console.log("lastIndex: " + lastIndex);
        //console.table($scope.parts);
        var atIndex = lastIndex + 1;
        if (lastIndex == null) {
            atIndex = 0;
        }

        $scope.parts.splice(atIndex, 0, { Data: "new", NoteID: $scope.currentNoteId }); //add at index
        //console.log("after");
        //console.table($scope.parts);
        focusOn("part" + atIndex);
        $scope.parts[atIndex].localState = "Sending";
        parts.post($scope.parts[atIndex]).success(function (data) {
            console.log("post success");
            console.table(data);
            $scope.parts[atIndex].ID = data.ID;
            $scope.parts[atIndex].localState = "OK";
        }).error(function () {
            $scope.parts[atIndex].localState = "Problem";
        });
    }

    function partsCheckForNull(){
        if ($scope.parts.length == 0 || $scope.parts == null) {
            addPart();
        }
    }
});
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
        return $http({
            method: 'PUT',
            url: '/api/Parts/'+part.ID,
            data: part,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    return parts;
}]);
(function () {
    'use strict';

    
})();

var app = angular.module('ConsoleNotepad', [
        // Angular modules 
        'ngRoute'

        // Custom modules 

        // 3rd Party Modules

]);

//app.directive('contenteditable', function () {
//    return {
//        restrict: 'A', // only activate on element attribute
//        require: '?ngModel', // get a hold of NgModelController
//        link: function (scope, element, attrs, ngModel) {
//            if (!ngModel) return; // do nothing if no ng-model

//            // Specify how UI should be updated
//            ngModel.$render = function () {
//                element.html(ngModel.$viewValue || '');
//            };

//            // Listen for change events to enable binding
//            element.on('blur keyup change', function () {
//                scope.$apply(read);
//            });
//            read(); // initialize

//            // Write data to the model
//            function read() {
//                var html = element.html();
//                // When we clear the content editable the browser leaves a <br> behind
//                // If strip-br attribute is provided then we strip this out
//                if (attrs.stripBr && html == '<br>') {
//                    html = '';
//                }
//                ngModel.$setViewValue(html);
//            }
//        }
//    };
//});

app.directive('contenteditable', [function () {
    return {
        require: '?ngModel',
        scope: {

        },
        link: function (scope, element, attrs, ctrl) {
            // view -> model (when div gets blur update the view value of the model)
            element.bind('blur keyup change', function () {
                scope.$apply(function () {
                    ctrl.$setViewValue(element.html());
                });
            });

            // model -> view
            ctrl.$render = function () {
                element.html(ctrl.$viewValue);
            };

            // load init value from DOM
            ctrl.$render();

            // remove the attached events to element when destroying the scope
            scope.$on('$destroy', function () {
                element.unbind('blur');
                element.unbind('paste');
                element.unbind('focus');
            });
        }
    };
}]);
app.directive('focusOn', function () {
    return function (scope, elem, attr) {
        scope.$on('focusOn', function (e, name) {
            if (name === attr.focusOn) {
                elem[0].focus();
            }
        });
    };
});

app.factory('focusOn', function ($rootScope, $timeout) {
    return function (name) {
        $timeout(function () {
            $rootScope.$broadcast('focusOn', name);
        });
    }
});
app.controller('editorController', function ($scope, notes, parts, focusOn) {
    $scope.suggestions = {};
    $scope.highlightedSuggestion = -1;
    $scope.currentNoteId = 0;
    $scope.parts = [
        {
            Data: "new"
        }
    ];
    var timeoutUpdate; //setTimeout to update Part
    var editingPartOptions = {};
    $scope.focusOnPart = 0;

    $scope.smartBarKeyDown = function (event) {
        console.log("Refresh " + event.keyCode)
        if (event.keyCode == 32) { //space
            $scope.suggestions = notes.getSuggested($scope.smartBar).success(function (data) {
                console.table(data);
                $scope.suggestions = data;
            });
            console.log("Refreshed");
        }

        if (event.keyCode == 40 && $scope.highlightedSuggestion < $scope.suggestions.length-1) { //arrow down
            event.preventDefault();
            $scope.highlightedSuggestion++;
        }
        if (event.keyCode == 38 && $scope.highlightedSuggestion > -1) { //arrow up
            event.preventDefault();
            $scope.highlightedSuggestion--;
        }

        if (event.keyCode == 13 && $scope.highlightedSuggestion > -1) { //enter
            //uzupełnij inputa, zacznij pisanie notatki
            $scope.smartBar = "";
            console.table($scope.suggestions[$scope.highlightedSuggestion].NoteTags);
            var note = $scope.suggestions[$scope.highlightedSuggestion];
            console.table(note);
            for (var nt in note.NoteTags) {
                //console.log(nt);
                $scope.smartBar += note.NoteTags[nt].Tag.Name + " ";
            }

            $scope.currentNoteId = note.NoteId;
            $scope.parts = parts.get($scope.currentNoteId).success(function (data) {
                $scope.parts = data;
                console.log("Got data: ");
                console.table(data);
                partsCheckForNull();
            });

        }
    }

    $scope.editingPartKeyDown = function (event, partObjIndex) {
        clearTimeout(timeoutUpdate);
        timeoutUpdate = setTimeout(function () { updatePart(partObjIndex) }, 1000);
        $scope.parts[partObjIndex].localState = "Sending";
        //timeoutUpdate = setTimeout(function () { alert("chuj");}, 3000);

        //2x enter dodaje nowy part
        //console.log(partObj.Data);

        var partObj = $scope.parts[partObjIndex];
        if (event.keyCode == 13 && /\s*<br>\s*<br>\s*$/.test(partObj.Data)) { //enter
            //console.log("three enters");
            //console.log("before: " + $scope.parts[partObjIndex].Data);
            //$scope.parts[partObjIndex].Data = $scope.parts[partObjIndex].Data.replace(/\s*<br>\s*<br>\s*$/g, ""); //usun ostatni enter
            $scope.parts[partObjIndex].Data = $scope.parts[partObjIndex].Data.replace(/\s*<br>\s*$/g, "");
            //console.log("after: " + $scope.parts[partObjIndex].Data);
            addPart(partObjIndex);
            event.preventDefault(); //żeby nie dawało już tego entera
        }
    }
    
    function updatePart(index) {
        //console.log("update");
        $scope.parts[index].localState = "Sending";
        var partObj = $scope.parts[index];
        parts.put(partObj).success(function () {
            $scope.parts[index].localState = "OK";
        }).error(function () {
            $scope.parts[index].localState = "Problem";
        });
    }

    function addPart(lastIndex) {
        //$scope.parts.push({ Data: "new" });
        //console.log("lastIndex: " + lastIndex);
        //console.table($scope.parts);
        var atIndex = lastIndex + 1;
        if (lastIndex == null) {
            atIndex = 0;
        }

        $scope.parts.splice(atIndex, 0, { Data: "new", NoteID: $scope.currentNoteId }); //add at index
        //console.log("after");
        //console.table($scope.parts);
        focusOn("part" + atIndex);
        $scope.parts[atIndex].localState = "Sending";
        parts.post($scope.parts[atIndex]).success(function (data) {
            console.log("post success");
            console.table(data);
            $scope.parts[atIndex].ID = data.ID;
            $scope.parts[atIndex].localState = "OK";
        }).error(function () {
            $scope.parts[atIndex].localState = "Problem";
        });
    }

    function partsCheckForNull(){
        if ($scope.parts.length == 0 || $scope.parts == null) {
            addPart();
        }
    }
});
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
app.factory('parts', ['$http', function ($http) {

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
        return $http({
            method: 'PUT',
            url: '/api/Parts/'+part.ID,
            data: part,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    return parts;
}]);
(function () {
    'use strict';

    
})();

var app = angular.module('ConsoleNotepad', [
        // Angular modules 
        'ngRoute'

        // Custom modules 

        // 3rd Party Modules

]);

//app.directive('contenteditable', function () {
//    return {
//        restrict: 'A', // only activate on element attribute
//        require: '?ngModel', // get a hold of NgModelController
//        link: function (scope, element, attrs, ngModel) {
//            if (!ngModel) return; // do nothing if no ng-model

//            // Specify how UI should be updated
//            ngModel.$render = function () {
//                element.html(ngModel.$viewValue || '');
//            };

//            // Listen for change events to enable binding
//            element.on('blur keyup change', function () {
//                scope.$apply(read);
//            });
//            read(); // initialize

//            // Write data to the model
//            function read() {
//                var html = element.html();
//                // When we clear the content editable the browser leaves a <br> behind
//                // If strip-br attribute is provided then we strip this out
//                if (attrs.stripBr && html == '<br>') {
//                    html = '';
//                }
//                ngModel.$setViewValue(html);
//            }
//        }
//    };
//});

app.directive('contenteditable', [function () {
    return {
        require: '?ngModel',
        scope: {

        },
        link: function (scope, element, attrs, ctrl) {
            // view -> model (when div gets blur update the view value of the model)
            element.bind('blur keyup change', function () {
                scope.$apply(function () {
                    ctrl.$setViewValue(element.html());
                });
            });

            // model -> view
            ctrl.$render = function () {
                element.html(ctrl.$viewValue);
            };

            // load init value from DOM
            ctrl.$render();

            // remove the attached events to element when destroying the scope
            scope.$on('$destroy', function () {
                element.unbind('blur');
                element.unbind('paste');
                element.unbind('focus');
            });
        }
    };
}]);
app.directive('focusOn', function () {
    return function (scope, elem, attr) {
        scope.$on('focusOn', function (e, name) {
            if (name === attr.focusOn) {
                elem[0].focus();
            }
        });
    };
});

app.factory('focusOn', function ($rootScope, $timeout) {
    return function (name) {
        $timeout(function () {
            $rootScope.$broadcast('focusOn', name);
        });
    }
});
app.controller('editorController', function ($scope, notes, parts, focusOn) {
    $scope.suggestions = {};
    $scope.highlightedSuggestion = -1;
    $scope.currentNoteId = 0;
    $scope.parts = [
        {
            Data: "new"
        }
    ];
    var timeoutUpdate; //setTimeout to update Part
    var editingPartOptions = {};
    $scope.focusOnPart = 0;

    $scope.smartBarKeyDown = function (event) {
        //console.log("Refresh " + event.keyCode)
        if (event.keyCode == 32) { //space
            $scope.suggestions = notes.getSuggested($scope.smartBar).success(function (data) {
                console.table(data);
                $scope.suggestions = data;
            });
            console.log("Suggestions refreshed");
        }

        if (event.keyCode == 40 && $scope.highlightedSuggestion < $scope.suggestions.length-1) { //arrow down
            event.preventDefault();
            $scope.highlightedSuggestion++;
        }
        if (event.keyCode == 38 && $scope.highlightedSuggestion > -1) { //arrow up
            event.preventDefault();
            $scope.highlightedSuggestion--;
        }

        if (event.keyCode == 13 && $scope.highlightedSuggestion > -1) { //enter
            //uzupełnij inputa, zacznij pisanie notatki
            $scope.smartBar = "";
            console.table($scope.suggestions[$scope.highlightedSuggestion].NoteTags);
            var note = $scope.suggestions[$scope.highlightedSuggestion];
            console.table(note);
            for (var nt in note.NoteTags) {
                //console.log(nt);
                $scope.smartBar += note.NoteTags[nt].Tag.Name + " ";
            }

            $scope.currentNoteId = note.NoteId;
            $scope.parts = parts.get($scope.currentNoteId).success(function (data) {
                $scope.parts = data;
                console.log("Got data: ");
                console.table(data);
                partsCheckForNull();
            });

        }
    }

    $scope.editingPartKeyDown = function (event, partObjIndex) {
        clearTimeout(timeoutUpdate);
        timeoutUpdate = setTimeout(function () { updatePart(partObjIndex) }, 1000);
        $scope.parts[partObjIndex].localState = "Sending";
        //timeoutUpdate = setTimeout(function () { alert("chuj");}, 3000);

        //2x enter dodaje nowy part
        //console.log(partObj.Data);

        var partObj = $scope.parts[partObjIndex];
        if (event.keyCode == 13 && /\s*<br>\s*<br>\s*$/.test(partObj.Data)) { //enter
            //console.log("three enters");
            //console.log("before: " + $scope.parts[partObjIndex].Data);
            //$scope.parts[partObjIndex].Data = $scope.parts[partObjIndex].Data.replace(/\s*<br>\s*<br>\s*$/g, ""); //usun ostatni enter
            $scope.parts[partObjIndex].Data = $scope.parts[partObjIndex].Data.replace(/\s*<br>\s*$/g, "");
            //console.log("after: " + $scope.parts[partObjIndex].Data);
            addPart(partObjIndex);
            event.preventDefault(); //żeby nie dawało już tego entera
        }
    }
    
    function updatePart(index) {
        //console.log("update");
        $scope.parts[index].localState = "Sending";
        var partObj = $scope.parts[index];
        parts.put(partObj).success(function () {
            $scope.parts[index].localState = "OK";
        }).error(function () {
            $scope.parts[index].localState = "Problem";
        });
    }

    function addPart(lastIndex) {
        //$scope.parts.push({ Data: "new" });
        //console.log("lastIndex: " + lastIndex);
        //console.table($scope.parts);
        var atIndex = lastIndex + 1;
        if (lastIndex == null) {
            atIndex = 0;
        }

        $scope.parts.splice(atIndex, 0, { Data: "new", NoteID: $scope.currentNoteId }); //add at index
        //console.log("after");
        //console.table($scope.parts);
        focusOn("part" + atIndex);
        $scope.parts[atIndex].localState = "Sending";
        parts.post($scope.parts[atIndex]).success(function (data) {
            console.log("post success");
            console.table(data);
            $scope.parts[atIndex].ID = data.ID;
            $scope.parts[atIndex].localState = "OK";
        }).error(function () {
            $scope.parts[atIndex].localState = "Problem";
        });
    }

    function partsCheckForNull(){
        if ($scope.parts.length == 0 || $scope.parts == null) {
            addPart();
        }
    }
});
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
app.factory('parts', ['$http', function ($http) {

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
        return $http({
            method: 'PUT',
            url: '/api/Parts/'+part.ID,
            data: part,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    return parts;
}]);
(function () {
    'use strict';

    
})();

var app = angular.module('ConsoleNotepad', [
        // Angular modules 
        'ngRoute'

        // Custom modules 

        // 3rd Party Modules

]);

//app.directive('contenteditable', function () {
//    return {
//        restrict: 'A', // only activate on element attribute
//        require: '?ngModel', // get a hold of NgModelController
//        link: function (scope, element, attrs, ngModel) {
//            if (!ngModel) return; // do nothing if no ng-model

//            // Specify how UI should be updated
//            ngModel.$render = function () {
//                element.html(ngModel.$viewValue || '');
//            };

//            // Listen for change events to enable binding
//            element.on('blur keyup change', function () {
//                scope.$apply(read);
//            });
//            read(); // initialize

//            // Write data to the model
//            function read() {
//                var html = element.html();
//                // When we clear the content editable the browser leaves a <br> behind
//                // If strip-br attribute is provided then we strip this out
//                if (attrs.stripBr && html == '<br>') {
//                    html = '';
//                }
//                ngModel.$setViewValue(html);
//            }
//        }
//    };
//});

app.directive('contenteditable', [function () {
    return {
        require: '?ngModel',
        scope: {

        },
        link: function (scope, element, attrs, ctrl) {
            // view -> model (when div gets blur update the view value of the model)
            element.bind('blur keyup change', function () {
                scope.$apply(function () {
                    ctrl.$setViewValue(element.html());
                });
            });

            // model -> view
            ctrl.$render = function () {
                element.html(ctrl.$viewValue);
            };

            // load init value from DOM
            ctrl.$render();

            // remove the attached events to element when destroying the scope
            scope.$on('$destroy', function () {
                element.unbind('blur');
                element.unbind('paste');
                element.unbind('focus');
            });
        }
    };
}]);
app.directive('focusOn', function () {
    return function (scope, elem, attr) {
        scope.$on('focusOn', function (e, name) {
            if (name === attr.focusOn) {
                elem[0].focus();
            }
        });
    };
});

app.factory('focusOn', function ($rootScope, $timeout) {
    return function (name) {
        $timeout(function () {
            $rootScope.$broadcast('focusOn', name);
        });
    }
});
app.controller('editorController', function ($scope, notes, parts, focusOn) {
    $scope.suggestions = {};
    $scope.highlightedSuggestion = -1;
    $scope.currentNoteId = 0;
    $scope.parts = [
        {
            Data: "new"
        }
    ];
    var timeoutUpdate; //setTimeout to update Part
    var editingPartOptions = {};
    $scope.focusOnPart = 0;

    $scope.smartBarKeyDown = function (event) {
        //console.log("Refresh " + event.keyCode)
        if (event.keyCode == 32) { //space
            $scope.suggestions = notes.getSuggested($scope.smartBar).success(function (data) {
                console.table(data);
                $scope.suggestions = data;
            });
            console.log("Suggestions refreshed");
        }

        if (event.keyCode == 40 && $scope.highlightedSuggestion < $scope.suggestions.length-1) { //arrow down
            //sterowanie po menu
            event.preventDefault();
            $scope.highlightedSuggestion++;
        }
        if (event.keyCode == 38 && $scope.highlightedSuggestion > -1) { //arrow up
            event.preventDefault();
            $scope.highlightedSuggestion--;
        }

        if (event.keyCode == 13 && $scope.highlightedSuggestion > -1) { //enter
            //uzupełnij inputa, zacznij pisanie notatki
            $scope.smartBar = "";
            console.table($scope.suggestions[$scope.highlightedSuggestion].NoteTags);
            var note = $scope.suggestions[$scope.highlightedSuggestion];
            console.table(note);
            for (var nt in note.NoteTags) {
                //console.log(nt);
                $scope.smartBar += note.NoteTags[nt].Tag.Name + " ";
            }

            $scope.currentNoteId = note.NoteId;
            $scope.parts = parts.get($scope.currentNoteId).success(function (data) {
                $scope.parts = data;
                console.log("Got data: ");
                console.table(data);
                partsCheckForNull();
            });

        }
    }

    $scope.editingPartKeyDown = function (event, partObjIndex) {
        clearTimeout(timeoutUpdate);
        timeoutUpdate = setTimeout(function () { updatePart(partObjIndex) }, 1000);
        $scope.parts[partObjIndex].localState = "Sending";
        //timeoutUpdate = setTimeout(function () { alert("chuj");}, 3000);

        //2x enter dodaje nowy part
        //console.log(partObj.Data);

        var partObj = $scope.parts[partObjIndex];
        if (event.keyCode == 13 && /\s*<br>\s*<br>\s*$/.test(partObj.Data)) { //enter
            //console.log("three enters");
            //console.log("before: " + $scope.parts[partObjIndex].Data);
            //$scope.parts[partObjIndex].Data = $scope.parts[partObjIndex].Data.replace(/\s*<br>\s*<br>\s*$/g, ""); //usun ostatni enter
            $scope.parts[partObjIndex].Data = $scope.parts[partObjIndex].Data.replace(/\s*<br>\s*$/g, "");
            //console.log("after: " + $scope.parts[partObjIndex].Data);
            addPart(partObjIndex);
            event.preventDefault(); //żeby nie dawało już tego entera
        }
    }
    
    function updatePart(index) {
        //console.log("update");
        $scope.parts[index].localState = "Sending";
        var partObj = $scope.parts[index];
        parts.put(partObj).success(function () {
            $scope.parts[index].localState = "OK";
        }).error(function () {
            $scope.parts[index].localState = "Problem";
        });
    }

    function addPart(lastIndex) {
        //$scope.parts.push({ Data: "new" });
        //console.log("lastIndex: " + lastIndex);
        //console.table($scope.parts);
        var atIndex = lastIndex + 1;
        if (lastIndex == null) {
            atIndex = 0;
        }

        $scope.parts.splice(atIndex, 0, { Data: "new", NoteID: $scope.currentNoteId }); //add at index
        //console.log("after");
        //console.table($scope.parts);
        focusOn("part" + atIndex);
        $scope.parts[atIndex].localState = "Sending";
        parts.post($scope.parts[atIndex]).success(function (data) {
            console.log("post success");
            console.table(data);
            $scope.parts[atIndex].ID = data.ID;
            $scope.parts[atIndex].localState = "OK";
        }).error(function () {
            $scope.parts[atIndex].localState = "Problem";
        });
    }

    function partsCheckForNull(){
        if ($scope.parts.length == 0 || $scope.parts == null) {
            addPart();
        }
    }
});
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
app.factory('parts', ['$http', function ($http) {

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
        return $http({
            method: 'PUT',
            url: '/api/Parts/'+part.ID,
            data: part,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    return parts;
}]);
(function () {
    'use strict';

    
})();

var app = angular.module('ConsoleNotepad', [
        // Angular modules 
        'ngRoute'

        // Custom modules 

        // 3rd Party Modules

]);

//app.directive('contenteditable', function () {
//    return {
//        restrict: 'A', // only activate on element attribute
//        require: '?ngModel', // get a hold of NgModelController
//        link: function (scope, element, attrs, ngModel) {
//            if (!ngModel) return; // do nothing if no ng-model

//            // Specify how UI should be updated
//            ngModel.$render = function () {
//                element.html(ngModel.$viewValue || '');
//            };

//            // Listen for change events to enable binding
//            element.on('blur keyup change', function () {
//                scope.$apply(read);
//            });
//            read(); // initialize

//            // Write data to the model
//            function read() {
//                var html = element.html();
//                // When we clear the content editable the browser leaves a <br> behind
//                // If strip-br attribute is provided then we strip this out
//                if (attrs.stripBr && html == '<br>') {
//                    html = '';
//                }
//                ngModel.$setViewValue(html);
//            }
//        }
//    };
//});

app.directive('contenteditable', [function () {
    return {
        require: '?ngModel',
        scope: {

        },
        link: function (scope, element, attrs, ctrl) {
            // view -> model (when div gets blur update the view value of the model)
            element.bind('blur keyup change', function () {
                scope.$apply(function () {
                    ctrl.$setViewValue(element.html());
                });
            });

            // model -> view
            ctrl.$render = function () {
                element.html(ctrl.$viewValue);
            };

            // load init value from DOM
            ctrl.$render();

            // remove the attached events to element when destroying the scope
            scope.$on('$destroy', function () {
                element.unbind('blur');
                element.unbind('paste');
                element.unbind('focus');
            });
        }
    };
}]);
app.directive('focusOn', function () {
    return function (scope, elem, attr) {
        scope.$on('focusOn', function (e, name) {
            if (name === attr.focusOn) {
                elem[0].focus();
            }
        });
    };
});

app.factory('focusOn', function ($rootScope, $timeout) {
    return function (name) {
        $timeout(function () {
            $rootScope.$broadcast('focusOn', name);
        });
    }
});
app.controller('editorController', function ($scope, notes, parts, focusOn) {
    $scope.suggestions = {};
    $scope.highlightedSuggestion = -1;
    $scope.currentNoteId = 0;
    $scope.parts = [
        {
            Data: "new"
        }
    ];
    var timeoutUpdate; //setTimeout to update Part
    var editingPartOptions = {};
    $scope.focusOnPart = 0;

    $scope.smartBarKeyDown = function (event) {
        //console.log("Refresh " + event.keyCode)
        if (event.keyCode == 32) { //space
            $scope.suggestions = notes.getSuggested($scope.smartBar).success(function (data) {
                console.table(data);
                $scope.suggestions = data;
            });
            console.log("Suggestions refreshed");
        }

        if (event.keyCode == 40 && $scope.highlightedSuggestion < $scope.suggestions.length-1) { //arrow down
            //sterowanie po menu
            event.preventDefault();
            $scope.highlightedSuggestion++;
        }
        if (event.keyCode == 38 && $scope.highlightedSuggestion > -1) { //arrow up
            event.preventDefault();
            $scope.highlightedSuggestion--;
        }

        if (event.keyCode == 13 && $scope.highlightedSuggestion > -1) { //enter
            //uzupełnij inputa, zacznij pisanie notatki
            //console.table($scope.suggestions[$scope.highlightedSuggestion].NoteTags);
            $scope.smartBar = "";
            
            var note = $scope.suggestions[$scope.highlightedSuggestion];
            console.table(note);
            for (var nt in note.NoteTags) {
                //console.log(nt);
                $scope.smartBar += note.NoteTags[nt].Tag.Name + " ";
            }

            $scope.currentNoteId = note.NoteId;
            $scope.parts = parts.get($scope.currentNoteId).success(function (data) {
                $scope.parts = data;
                console.log("Got data: ");
                console.table(data);
                partsCheckForNull();
            });

        }
    }

    $scope.editingPartKeyDown = function (event, partObjIndex) {
        clearTimeout(timeoutUpdate);
        timeoutUpdate = setTimeout(function () { updatePart(partObjIndex) }, 1000);
        $scope.parts[partObjIndex].localState = "Sending";
        //timeoutUpdate = setTimeout(function () { alert("chuj");}, 3000);

        //2x enter dodaje nowy part
        //console.log(partObj.Data);

        var partObj = $scope.parts[partObjIndex];
        if (event.keyCode == 13 && /\s*<br>\s*<br>\s*$/.test(partObj.Data)) { //enter
            //console.log("three enters");
            //console.log("before: " + $scope.parts[partObjIndex].Data);
            //$scope.parts[partObjIndex].Data = $scope.parts[partObjIndex].Data.replace(/\s*<br>\s*<br>\s*$/g, ""); //usun ostatni enter
            $scope.parts[partObjIndex].Data = $scope.parts[partObjIndex].Data.replace(/\s*<br>\s*$/g, "");
            //console.log("after: " + $scope.parts[partObjIndex].Data);
            addPart(partObjIndex);
            event.preventDefault(); //żeby nie dawało już tego entera
        }
    }
    
    function updatePart(index) {
        //console.log("update");
        $scope.parts[index].localState = "Sending";
        var partObj = $scope.parts[index];
        parts.put(partObj).success(function () {
            $scope.parts[index].localState = "OK";
        }).error(function () {
            $scope.parts[index].localState = "Problem";
        });
    }

    function addPart(lastIndex) {
        //$scope.parts.push({ Data: "new" });
        //console.log("lastIndex: " + lastIndex);
        //console.table($scope.parts);
        var atIndex = lastIndex + 1;
        if (lastIndex == null) {
            atIndex = 0;
        }

        $scope.parts.splice(atIndex, 0, { Data: "new", NoteID: $scope.currentNoteId }); //add at index
        //console.log("after");
        //console.table($scope.parts);
        focusOn("part" + atIndex);
        $scope.parts[atIndex].localState = "Sending";
        parts.post($scope.parts[atIndex]).success(function (data) {
            console.log("post success");
            console.table(data);
            $scope.parts[atIndex].ID = data.ID;
            $scope.parts[atIndex].localState = "OK";
        }).error(function () {
            $scope.parts[atIndex].localState = "Problem";
        });
    }

    function partsCheckForNull(){
        if ($scope.parts.length == 0 || $scope.parts == null) {
            addPart();
        }
    }
});
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
app.factory('parts', ['$http', function ($http) {

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
        return $http({
            method: 'PUT',
            url: '/api/Parts/'+part.ID,
            data: part,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    return parts;
}]);
(function () {
    'use strict';

    
})();

var app = angular.module('ConsoleNotepad', [
        // Angular modules 
        'ngRoute'

        // Custom modules 

        // 3rd Party Modules

]);

//app.directive('contenteditable', function () {
//    return {
//        restrict: 'A', // only activate on element attribute
//        require: '?ngModel', // get a hold of NgModelController
//        link: function (scope, element, attrs, ngModel) {
//            if (!ngModel) return; // do nothing if no ng-model

//            // Specify how UI should be updated
//            ngModel.$render = function () {
//                element.html(ngModel.$viewValue || '');
//            };

//            // Listen for change events to enable binding
//            element.on('blur keyup change', function () {
//                scope.$apply(read);
//            });
//            read(); // initialize

//            // Write data to the model
//            function read() {
//                var html = element.html();
//                // When we clear the content editable the browser leaves a <br> behind
//                // If strip-br attribute is provided then we strip this out
//                if (attrs.stripBr && html == '<br>') {
//                    html = '';
//                }
//                ngModel.$setViewValue(html);
//            }
//        }
//    };
//});

app.directive('contenteditable', [function () {
    return {
        require: '?ngModel',
        scope: {

        },
        link: function (scope, element, attrs, ctrl) {
            // view -> model (when div gets blur update the view value of the model)
            element.bind('blur keyup change', function () {
                scope.$apply(function () {
                    ctrl.$setViewValue(element.html());
                });
            });

            // model -> view
            ctrl.$render = function () {
                element.html(ctrl.$viewValue);
            };

            // load init value from DOM
            ctrl.$render();

            // remove the attached events to element when destroying the scope
            scope.$on('$destroy', function () {
                element.unbind('blur');
                element.unbind('paste');
                element.unbind('focus');
            });
        }
    };
}]);
app.directive('focusOn', function () {
    return function (scope, elem, attr) {
        scope.$on('focusOn', function (e, name) {
            if (name === attr.focusOn) {
                elem[0].focus();
            }
        });
    };
});

app.factory('focusOn', function ($rootScope, $timeout) {
    return function (name) {
        $timeout(function () {
            $rootScope.$broadcast('focusOn', name);
        });
    }
});
app.controller('editorController', function ($scope, notes, parts, focusOn) {
    $scope.suggestions = {};
    $scope.highlightedSuggestion = -1;
    $scope.currentNoteId = 0;
    $scope.parts = [
        {
            Data: "new"
        }
    ];
    var timeoutUpdate; //setTimeout to update Part
    var editingPartOptions = {};
    $scope.focusOnPart = 0;

    $scope.smartBarKeyDown = function (event) {
        //console.log("Refresh " + event.keyCode)
        if (event.keyCode == 32) { //space
            $scope.suggestions = notes.getSuggested($scope.smartBar).success(function (data) {
                console.table(data);
                $scope.suggestions = data;
            });
            console.log("Suggestions refreshed");
        }

        if (event.keyCode == 40 && $scope.highlightedSuggestion < $scope.suggestions.length-1) { //arrow down
            //sterowanie po menu
            event.preventDefault();
            $scope.highlightedSuggestion++;
        }
        if (event.keyCode == 38 && $scope.highlightedSuggestion > -1) { //arrow up
            event.preventDefault();
            $scope.highlightedSuggestion--;
        }

        if (event.keyCode == 13 && $scope.highlightedSuggestion > -1) { //enter
            //uzupełnij inputa, zacznij pisanie notatki
            //console.table($scope.suggestions[$scope.highlightedSuggestion].NoteTags);

            $scope.smartBar = "";
            var note = $scope.suggestions[$scope.highlightedSuggestion];
            console.table(note);
            for (var nt in note.NoteTags) {
                //console.log(nt);
                $scope.smartBar += note.NoteTags[nt].Tag.Name + " ";
            }

            $scope.currentNoteId = note.NoteId;
            $scope.parts = parts.get($scope.currentNoteId).success(function (data) {
                $scope.parts = data;
                console.log("Got data: ");
                console.table(data);
                partsCheckForNull();
            });

        }
    }

    $scope.editingPartKeyDown = function (event, partObjIndex) {
        clearTimeout(timeoutUpdate);
        timeoutUpdate = setTimeout(function () { updatePart(partObjIndex) }, 1000);
        $scope.parts[partObjIndex].localState = "Sending";
        //timeoutUpdate = setTimeout(function () { alert("chuj");}, 3000);

        //2x enter dodaje nowy part
        //console.log(partObj.Data);

        var partObj = $scope.parts[partObjIndex];
        if (event.keyCode == 13 && /\s*<br>\s*<br>\s*$/.test(partObj.Data)) { //enter
            //console.log("three enters");
            //console.log("before: " + $scope.parts[partObjIndex].Data);
            //$scope.parts[partObjIndex].Data = $scope.parts[partObjIndex].Data.replace(/\s*<br>\s*<br>\s*$/g, ""); //usun ostatni enter
            $scope.parts[partObjIndex].Data = $scope.parts[partObjIndex].Data.replace(/\s*<br>\s*$/g, "");
            //console.log("after: " + $scope.parts[partObjIndex].Data);
            addPart(partObjIndex);
            event.preventDefault(); //żeby nie dawało już tego entera
        }
    }
    
    function updatePart(index) {
        //console.log("update");
        $scope.parts[index].localState = "Sending";
        var partObj = $scope.parts[index];
        parts.put(partObj).success(function () {
            $scope.parts[index].localState = "OK";
        }).error(function () {
            $scope.parts[index].localState = "Problem";
        });
    }

    function addPart(lastIndex) {
        //$scope.parts.push({ Data: "new" });
        //console.log("lastIndex: " + lastIndex);
        //console.table($scope.parts);
        var atIndex = lastIndex + 1;
        if (lastIndex == null) {
            atIndex = 0;
        }

        $scope.parts.splice(atIndex, 0, { Data: "new", NoteID: $scope.currentNoteId }); //add at index
        //console.log("after");
        //console.table($scope.parts);
        focusOn("part" + atIndex);
        $scope.parts[atIndex].localState = "Sending";
        parts.post($scope.parts[atIndex]).success(function (data) {
            console.log("post success");
            console.table(data);
            $scope.parts[atIndex].ID = data.ID;
            $scope.parts[atIndex].localState = "OK";
        }).error(function () {
            $scope.parts[atIndex].localState = "Problem";
        });
    }

    function partsCheckForNull(){
        if ($scope.parts.length == 0 || $scope.parts == null) {
            addPart();
        }
    }
});
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
app.factory('parts', ['$http', function ($http) {

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
        return $http({
            method: 'PUT',
            url: '/api/Parts/'+part.ID,
            data: part,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    return parts;
}]);
(function () {
    'use strict';

    
})();

var app = angular.module('ConsoleNotepad', [
        // Angular modules 
        'ngRoute'

        // Custom modules 

        // 3rd Party Modules

]);

//app.directive('contenteditable', function () {
//    return {
//        restrict: 'A', // only activate on element attribute
//        require: '?ngModel', // get a hold of NgModelController
//        link: function (scope, element, attrs, ngModel) {
//            if (!ngModel) return; // do nothing if no ng-model

//            // Specify how UI should be updated
//            ngModel.$render = function () {
//                element.html(ngModel.$viewValue || '');
//            };

//            // Listen for change events to enable binding
//            element.on('blur keyup change', function () {
//                scope.$apply(read);
//            });
//            read(); // initialize

//            // Write data to the model
//            function read() {
//                var html = element.html();
//                // When we clear the content editable the browser leaves a <br> behind
//                // If strip-br attribute is provided then we strip this out
//                if (attrs.stripBr && html == '<br>') {
//                    html = '';
//                }
//                ngModel.$setViewValue(html);
//            }
//        }
//    };
//});

app.directive('contenteditable', [function () {
    return {
        require: '?ngModel',
        scope: {

        },
        link: function (scope, element, attrs, ctrl) {
            // view -> model (when div gets blur update the view value of the model)
            element.bind('blur keyup change', function () {
                scope.$apply(function () {
                    ctrl.$setViewValue(element.html());
                });
            });

            // model -> view
            ctrl.$render = function () {
                element.html(ctrl.$viewValue);
            };

            // load init value from DOM
            ctrl.$render();

            // remove the attached events to element when destroying the scope
            scope.$on('$destroy', function () {
                element.unbind('blur');
                element.unbind('paste');
                element.unbind('focus');
            });
        }
    };
}]);
app.directive('focusOn', function () {
    return function (scope, elem, attr) {
        scope.$on('focusOn', function (e, name) {
            if (name === attr.focusOn) {
                elem[0].focus();
            }
        });
    };
});

app.factory('focusOn', function ($rootScope, $timeout) {
    return function (name) {
        $timeout(function () {
            $rootScope.$broadcast('focusOn', name);
        });
    }
});
app.controller('editorController', function ($scope, notes, parts, focusOn) {
    $scope.suggestions = {};
    $scope.highlightedSuggestion = -1;
    $scope.currentNoteId = 0;
    $scope.parts = [
        {
            Data: "new"
        }
    ];
    var timeoutUpdate; //setTimeout to update Part
    var editingPartOptions = {};
    $scope.focusOnPart = 0;

    $scope.smartBarKeyDown = function (event) {
        //console.log("Refresh " + event.keyCode)
        if (event.keyCode == 32) { //space
            $scope.suggestions = notes.getSuggested($scope.smartBar).success(function (data) {
                console.table(data);
                $scope.suggestions = data;
            });
            console.log("Suggestions refreshed");
        }

        if (event.keyCode == 40 && $scope.highlightedSuggestion < $scope.suggestions.length-1) { //arrow down
            //sterowanie po menu
            event.preventDefault();
            $scope.highlightedSuggestion++;
        }
        if (event.keyCode == 38 && $scope.highlightedSuggestion > -1) { //arrow up
            event.preventDefault();
            $scope.highlightedSuggestion--;
        }

        if (event.keyCode == 13 && $scope.highlightedSuggestion > -1) { //enter
            //uzupełnij inputa, zacznij pisanie notatki
            //console.table($scope.suggestions[$scope.highlightedSuggestion].NoteTags);

            $scope.smartBar = "";

            var note = $scope.suggestions[$scope.highlightedSuggestion];
            console.table(note);
            for (var nt in note.NoteTags) {
                //console.log(nt);
                $scope.smartBar += note.NoteTags[nt].Tag.Name + " ";
            }

            $scope.currentNoteId = note.NoteId;
            $scope.parts = parts.get($scope.currentNoteId).success(function (data) {
                $scope.parts = data;
                console.log("Got data: ");
                console.table(data);
                partsCheckForNull();
            });

        }
    }

    $scope.editingPartKeyDown = function (event, partObjIndex) {
        clearTimeout(timeoutUpdate);
        timeoutUpdate = setTimeout(function () { updatePart(partObjIndex) }, 1000);
        $scope.parts[partObjIndex].localState = "Sending";
        //timeoutUpdate = setTimeout(function () { alert("chuj");}, 3000);

        //2x enter dodaje nowy part
        //console.log(partObj.Data);

        var partObj = $scope.parts[partObjIndex];
        if (event.keyCode == 13 && /\s*<br>\s*<br>\s*$/.test(partObj.Data)) { //enter
            //console.log("three enters");
            //console.log("before: " + $scope.parts[partObjIndex].Data);
            //$scope.parts[partObjIndex].Data = $scope.parts[partObjIndex].Data.replace(/\s*<br>\s*<br>\s*$/g, ""); //usun ostatni enter
            $scope.parts[partObjIndex].Data = $scope.parts[partObjIndex].Data.replace(/\s*<br>\s*$/g, "");
            //console.log("after: " + $scope.parts[partObjIndex].Data);
            addPart(partObjIndex);
            event.preventDefault(); //żeby nie dawało już tego entera
        }
    }
    
    function updatePart(index) {
        //console.log("update");
        $scope.parts[index].localState = "Sending";
        var partObj = $scope.parts[index];
        parts.put(partObj).success(function () {
            $scope.parts[index].localState = "OK";
        }).error(function () {
            $scope.parts[index].localState = "Problem";
        });
    }

    function addPart(lastIndex) {
        //$scope.parts.push({ Data: "new" });
        //console.log("lastIndex: " + lastIndex);
        //console.table($scope.parts);
        var atIndex = lastIndex + 1;
        if (lastIndex == null) {
            atIndex = 0;
        }

        $scope.parts.splice(atIndex, 0, { Data: "new", NoteID: $scope.currentNoteId }); //add at index
        //console.log("after");
        //console.table($scope.parts);
        focusOn("part" + atIndex);
        $scope.parts[atIndex].localState = "Sending";
        parts.post($scope.parts[atIndex]).success(function (data) {
            console.log("post success");
            console.table(data);
            $scope.parts[atIndex].ID = data.ID;
            $scope.parts[atIndex].localState = "OK";
        }).error(function () {
            $scope.parts[atIndex].localState = "Problem";
        });
    }

    function partsCheckForNull(){
        if ($scope.parts.length == 0 || $scope.parts == null) {
            addPart();
        }
    }
});
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
app.factory('parts', ['$http', function ($http) {

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
        return $http({
            method: 'PUT',
            url: '/api/Parts/'+part.ID,
            data: part,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    return parts;
}]);
(function () {
    'use strict';

    
})();

var app = angular.module('ConsoleNotepad', [
        // Angular modules 
        'ngRoute'

        // Custom modules 

        // 3rd Party Modules

]);

//app.directive('contenteditable', function () {
//    return {
//        restrict: 'A', // only activate on element attribute
//        require: '?ngModel', // get a hold of NgModelController
//        link: function (scope, element, attrs, ngModel) {
//            if (!ngModel) return; // do nothing if no ng-model

//            // Specify how UI should be updated
//            ngModel.$render = function () {
//                element.html(ngModel.$viewValue || '');
//            };

//            // Listen for change events to enable binding
//            element.on('blur keyup change', function () {
//                scope.$apply(read);
//            });
//            read(); // initialize

//            // Write data to the model
//            function read() {
//                var html = element.html();
//                // When we clear the content editable the browser leaves a <br> behind
//                // If strip-br attribute is provided then we strip this out
//                if (attrs.stripBr && html == '<br>') {
//                    html = '';
//                }
//                ngModel.$setViewValue(html);
//            }
//        }
//    };
//});

app.directive('contenteditable', [function () {
    return {
        require: '?ngModel',
        scope: {

        },
        link: function (scope, element, attrs, ctrl) {
            // view -> model (when div gets blur update the view value of the model)
            element.bind('blur keyup change', function () {
                scope.$apply(function () {
                    ctrl.$setViewValue(element.html());
                });
            });

            // model -> view
            ctrl.$render = function () {
                element.html(ctrl.$viewValue);
            };

            // load init value from DOM
            ctrl.$render();

            // remove the attached events to element when destroying the scope
            scope.$on('$destroy', function () {
                element.unbind('blur');
                element.unbind('paste');
                element.unbind('focus');
            });
        }
    };
}]);
app.directive('focusOn', function () {
    return function (scope, elem, attr) {
        scope.$on('focusOn', function (e, name) {
            if (name === attr.focusOn) {
                elem[0].focus();
            }
        });
    };
});

app.factory('focusOn', function ($rootScope, $timeout) {
    return function (name) {
        $timeout(function () {
            $rootScope.$broadcast('focusOn', name);
        });
    }
});
app.controller('editorController', function ($scope, notes, parts, focusOn) {
    $scope.suggestions = {};
    $scope.highlightedSuggestion = -1;
    $scope.currentNoteId = 0;
    $scope.parts = [
        {
            Data: "new"
        }
    ];
    var timeoutUpdate; //setTimeout to update Part
    var editingPartOptions = {};
    $scope.focusOnPart = 0;

    $scope.smartBarKeyDown = function (event) {
        //console.log("Refresh " + event.keyCode)
        if (event.keyCode == 32) { //space
            $scope.suggestions = notes.getSuggested($scope.smartBar).success(function (data) {
                console.table(data);
                $scope.suggestions = data;
            });
            console.log("Suggestions refreshed");
        }

        if (event.keyCode == 40 && $scope.highlightedSuggestion < $scope.suggestions.length-1) { //arrow down
            //sterowanie po menu
            event.preventDefault();
            $scope.highlightedSuggestion++;
        }
        if (event.keyCode == 38 && $scope.highlightedSuggestion > -1) { //arrow up
            event.preventDefault();
            $scope.highlightedSuggestion--;
        }

        if (event.keyCode == 13 && $scope.highlightedSuggestion > -1) { //enter
            //uzupełnij inputa, zacznij pisanie notatki
            //console.table($scope.suggestions[$scope.highlightedSuggestion].NoteTags);

            $scope.smartBar = "";

            var note = $scope.suggestions[$scope.highlightedSuggestion];
            console.table(note);

            for (var nt in note.NoteTags) {
                //console.log(nt);
                $scope.smartBar += note.NoteTags[nt].Tag.Name + " ";
            }

            $scope.currentNoteId = note.NoteId;
            $scope.parts = parts.get($scope.currentNoteId).success(function (data) {
                $scope.parts = data;
                console.log("Got data: ");
                console.table(data);
                partsCheckForNull();
            });

        }
    }

    $scope.editingPartKeyDown = function (event, partObjIndex) {
        clearTimeout(timeoutUpdate);
        timeoutUpdate = setTimeout(function () { updatePart(partObjIndex) }, 1000);
        $scope.parts[partObjIndex].localState = "Sending";
        //timeoutUpdate = setTimeout(function () { alert("chuj");}, 3000);

        //2x enter dodaje nowy part
        //console.log(partObj.Data);

        var partObj = $scope.parts[partObjIndex];
        if (event.keyCode == 13 && /\s*<br>\s*<br>\s*$/.test(partObj.Data)) { //enter
            //console.log("three enters");
            //console.log("before: " + $scope.parts[partObjIndex].Data);
            //$scope.parts[partObjIndex].Data = $scope.parts[partObjIndex].Data.replace(/\s*<br>\s*<br>\s*$/g, ""); //usun ostatni enter
            $scope.parts[partObjIndex].Data = $scope.parts[partObjIndex].Data.replace(/\s*<br>\s*$/g, "");
            //console.log("after: " + $scope.parts[partObjIndex].Data);
            addPart(partObjIndex);
            event.preventDefault(); //żeby nie dawało już tego entera
        }
    }
    
    function updatePart(index) {
        //console.log("update");
        $scope.parts[index].localState = "Sending";
        var partObj = $scope.parts[index];
        parts.put(partObj).success(function () {
            $scope.parts[index].localState = "OK";
        }).error(function () {
            $scope.parts[index].localState = "Problem";
        });
    }

    function addPart(lastIndex) {
        //$scope.parts.push({ Data: "new" });
        //console.log("lastIndex: " + lastIndex);
        //console.table($scope.parts);
        var atIndex = lastIndex + 1;
        if (lastIndex == null) {
            atIndex = 0;
        }

        $scope.parts.splice(atIndex, 0, { Data: "new", NoteID: $scope.currentNoteId }); //add at index
        //console.log("after");
        //console.table($scope.parts);
        focusOn("part" + atIndex);
        $scope.parts[atIndex].localState = "Sending";
        parts.post($scope.parts[atIndex]).success(function (data) {
            console.log("post success");
            console.table(data);
            $scope.parts[atIndex].ID = data.ID;
            $scope.parts[atIndex].localState = "OK";
        }).error(function () {
            $scope.parts[atIndex].localState = "Problem";
        });
    }

    function partsCheckForNull(){
        if ($scope.parts.length == 0 || $scope.parts == null) {
            addPart();
        }
    }
});
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
app.factory('parts', ['$http', function ($http) {

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
        return $http({
            method: 'PUT',
            url: '/api/Parts/'+part.ID,
            data: part,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    return parts;
}]);
(function () {
    'use strict';

    
})();

var app = angular.module('ConsoleNotepad', [
        // Angular modules 
        'ngRoute'

        // Custom modules 

        // 3rd Party Modules

]);

//app.directive('contenteditable', function () {
//    return {
//        restrict: 'A', // only activate on element attribute
//        require: '?ngModel', // get a hold of NgModelController
//        link: function (scope, element, attrs, ngModel) {
//            if (!ngModel) return; // do nothing if no ng-model

//            // Specify how UI should be updated
//            ngModel.$render = function () {
//                element.html(ngModel.$viewValue || '');
//            };

//            // Listen for change events to enable binding
//            element.on('blur keyup change', function () {
//                scope.$apply(read);
//            });
//            read(); // initialize

//            // Write data to the model
//            function read() {
//                var html = element.html();
//                // When we clear the content editable the browser leaves a <br> behind
//                // If strip-br attribute is provided then we strip this out
//                if (attrs.stripBr && html == '<br>') {
//                    html = '';
//                }
//                ngModel.$setViewValue(html);
//            }
//        }
//    };
//});

app.directive('contenteditable', [function () {
    return {
        require: '?ngModel',
        scope: {

        },
        link: function (scope, element, attrs, ctrl) {
            // view -> model (when div gets blur update the view value of the model)
            element.bind('blur keyup change', function () {
                scope.$apply(function () {
                    ctrl.$setViewValue(element.html());
                });
            });

            // model -> view
            ctrl.$render = function () {
                element.html(ctrl.$viewValue);
            };

            // load init value from DOM
            ctrl.$render();

            // remove the attached events to element when destroying the scope
            scope.$on('$destroy', function () {
                element.unbind('blur');
                element.unbind('paste');
                element.unbind('focus');
            });
        }
    };
}]);
app.directive('focusOn', function () {
    return function (scope, elem, attr) {
        scope.$on('focusOn', function (e, name) {
            if (name === attr.focusOn) {
                elem[0].focus();
            }
        });
    };
});

app.factory('focusOn', function ($rootScope, $timeout) {
    return function (name) {
        $timeout(function () {
            $rootScope.$broadcast('focusOn', name);
        });
    }
});
app.controller('editorController', function ($scope, notes, parts, focusOn) {
    $scope.suggestions = {};
    $scope.highlightedSuggestion = -1;
    $scope.currentNoteId = 0;
    $scope.parts = [
        {
            Data: "new"
        }
    ];
    var timeoutUpdate; //setTimeout to update Part
    var editingPartOptions = {};
    $scope.focusOnPart = 0;

    $scope.smartBarKeyDown = function (event) {
        //console.log("Refresh " + event.keyCode)
        if (event.keyCode == 32) { //space
            $scope.suggestions = notes.getSuggested($scope.smartBar).success(function (data) {
                console.table(data);
                $scope.suggestions = data;
            });
            console.log("Suggestions refreshed");
        }

        if (event.keyCode == 40 && $scope.highlightedSuggestion < $scope.suggestions.length-1) { //arrow down
            //sterowanie po menu
            event.preventDefault();
            $scope.highlightedSuggestion++;
        }
        if (event.keyCode == 38 && $scope.highlightedSuggestion > -1) { //arrow up
            event.preventDefault();
            $scope.highlightedSuggestion--;
        }

        if (event.keyCode == 13 && $scope.highlightedSuggestion > -1) { //enter
            //uzupełnij inputa, zacznij pisanie notatki
            //console.table($scope.suggestions[$scope.highlightedSuggestion].NoteTags);

            $scope.smartBar = "";

            var note = $scope.suggestions[$scope.highlightedSuggestion];
            console.table(note);

            for (var nt in note.NoteTags) {
                $scope.smartBar += note.NoteTags[nt].Tag.Name + " ";
            }

            $scope.currentNoteId = note.NoteId;
            $scope.parts = parts.get($scope.currentNoteId).success(function (data) {
                $scope.parts = data;
                console.log("Got data: ");
                console.table(data);
                partsCheckForNull();
            });

        }
    }

    $scope.editingPartKeyDown = function (event, partObjIndex) {
        clearTimeout(timeoutUpdate);
        timeoutUpdate = setTimeout(function () { updatePart(partObjIndex) }, 1000);
        $scope.parts[partObjIndex].localState = "Sending";
        //timeoutUpdate = setTimeout(function () { alert("chuj");}, 3000);

        //2x enter dodaje nowy part
        //console.log(partObj.Data);

        var partObj = $scope.parts[partObjIndex];
        if (event.keyCode == 13 && /\s*<br>\s*<br>\s*$/.test(partObj.Data)) { //enter
            //console.log("three enters");
            //console.log("before: " + $scope.parts[partObjIndex].Data);
            //$scope.parts[partObjIndex].Data = $scope.parts[partObjIndex].Data.replace(/\s*<br>\s*<br>\s*$/g, ""); //usun ostatni enter
            $scope.parts[partObjIndex].Data = $scope.parts[partObjIndex].Data.replace(/\s*<br>\s*$/g, "");
            //console.log("after: " + $scope.parts[partObjIndex].Data);
            addPart(partObjIndex);
            event.preventDefault(); //żeby nie dawało już tego entera
        }
    }
    
    function updatePart(index) {
        //console.log("update");
        $scope.parts[index].localState = "Sending";
        var partObj = $scope.parts[index];
        parts.put(partObj).success(function () {
            $scope.parts[index].localState = "OK";
        }).error(function () {
            $scope.parts[index].localState = "Problem";
        });
    }

    function addPart(lastIndex) {
        //$scope.parts.push({ Data: "new" });
        //console.log("lastIndex: " + lastIndex);
        //console.table($scope.parts);
        var atIndex = lastIndex + 1;
        if (lastIndex == null) {
            atIndex = 0;
        }

        $scope.parts.splice(atIndex, 0, { Data: "new", NoteID: $scope.currentNoteId }); //add at index
        //console.log("after");
        //console.table($scope.parts);
        focusOn("part" + atIndex);
        $scope.parts[atIndex].localState = "Sending";
        parts.post($scope.parts[atIndex]).success(function (data) {
            console.log("post success");
            console.table(data);
            $scope.parts[atIndex].ID = data.ID;
            $scope.parts[atIndex].localState = "OK";
        }).error(function () {
            $scope.parts[atIndex].localState = "Problem";
        });
    }

    function partsCheckForNull(){
        if ($scope.parts.length == 0 || $scope.parts == null) {
            addPart();
        }
    }
});
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
app.factory('parts', ['$http', function ($http) {

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
        return $http({
            method: 'PUT',
            url: '/api/Parts/'+part.ID,
            data: part,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    return parts;
}]);
(function () {
    'use strict';

    
})();

var app = angular.module('ConsoleNotepad', [
        // Angular modules 
        'ngRoute'

        // Custom modules 

        // 3rd Party Modules

]);

//app.directive('contenteditable', function () {
//    return {
//        restrict: 'A', // only activate on element attribute
//        require: '?ngModel', // get a hold of NgModelController
//        link: function (scope, element, attrs, ngModel) {
//            if (!ngModel) return; // do nothing if no ng-model

//            // Specify how UI should be updated
//            ngModel.$render = function () {
//                element.html(ngModel.$viewValue || '');
//            };

//            // Listen for change events to enable binding
//            element.on('blur keyup change', function () {
//                scope.$apply(read);
//            });
//            read(); // initialize

//            // Write data to the model
//            function read() {
//                var html = element.html();
//                // When we clear the content editable the browser leaves a <br> behind
//                // If strip-br attribute is provided then we strip this out
//                if (attrs.stripBr && html == '<br>') {
//                    html = '';
//                }
//                ngModel.$setViewValue(html);
//            }
//        }
//    };
//});

app.directive('contenteditable', [function () {
    return {
        require: '?ngModel',
        scope: {

        },
        link: function (scope, element, attrs, ctrl) {
            // view -> model (when div gets blur update the view value of the model)
            element.bind('blur keyup change', function () {
                scope.$apply(function () {
                    ctrl.$setViewValue(element.html());
                });
            });

            // model -> view
            ctrl.$render = function () {
                element.html(ctrl.$viewValue);
            };

            // load init value from DOM
            ctrl.$render();

            // remove the attached events to element when destroying the scope
            scope.$on('$destroy', function () {
                element.unbind('blur');
                element.unbind('paste');
                element.unbind('focus');
            });
        }
    };
}]);
app.directive('focusOn', function () {
    return function (scope, elem, attr) {
        scope.$on('focusOn', function (e, name) {
            if (name === attr.focusOn) {
                elem[0].focus();
            }
        });
    };
});

app.factory('focusOn', function ($rootScope, $timeout) {
    return function (name) {
        $timeout(function () {
            $rootScope.$broadcast('focusOn', name);
        });
    }
});
app.controller('editorController', function ($scope, notes, parts, focusOn) {
    $scope.suggestions = {};
    $scope.highlightedSuggestion = -1;
    $scope.currentNoteId = 0;
    $scope.parts = [
        {
            Data: "new"
        }
    ];
    var timeoutUpdate; //setTimeout to update Part
    var editingPartOptions = {};
    $scope.focusOnPart = 0;

    $scope.smartBarKeyDown = function (event) {
        //console.log("Refresh " + event.keyCode)
        if (event.keyCode == 32) { //space
            $scope.suggestions = notes.getSuggested($scope.smartBar).success(function (data) {
                console.table(data);
                $scope.suggestions = data;
            });
            console.log("Suggestions refreshed");
        }

        if (event.keyCode == 40 && $scope.highlightedSuggestion < $scope.suggestions.length-1) { //arrow down
            //sterowanie po menu
            event.preventDefault();
            $scope.highlightedSuggestion++;
        }
        if (event.keyCode == 38 && $scope.highlightedSuggestion > -1) { //arrow up
            event.preventDefault();
            $scope.highlightedSuggestion--;
        }

        if (event.keyCode == 13 && $scope.highlightedSuggestion > -1) { //enter
            //uzupełnij inputa, zacznij pisanie notatki
            //console.table($scope.suggestions[$scope.highlightedSuggestion].NoteTags);

            $scope.smartBar = "";

            var note = $scope.suggestions[$scope.highlightedSuggestion];
            console.table(note);

            //uzupelniam smartBar o wybrane tagi
            for (var nt in note.NoteTags) {
                $scope.smartBar += note.NoteTags[nt].Tag.Name + " ";
            }

            $scope.currentNoteId = note.NoteId;
            $scope.parts = parts.get($scope.currentNoteId).success(function (data) {
                $scope.parts = data;
                console.log("Got data: ");
                console.table(data);
                partsCheckForNull();
            });

        }
    }

    $scope.editingPartKeyDown = function (event, partObjIndex) {
        clearTimeout(timeoutUpdate);
        timeoutUpdate = setTimeout(function () { updatePart(partObjIndex) }, 1000);
        $scope.parts[partObjIndex].localState = "Sending";
        //timeoutUpdate = setTimeout(function () { alert("chuj");}, 3000);

        //2x enter dodaje nowy part
        //console.log(partObj.Data);

        var partObj = $scope.parts[partObjIndex];
        if (event.keyCode == 13 && /\s*<br>\s*<br>\s*$/.test(partObj.Data)) { //enter
            //console.log("three enters");
            //console.log("before: " + $scope.parts[partObjIndex].Data);
            //$scope.parts[partObjIndex].Data = $scope.parts[partObjIndex].Data.replace(/\s*<br>\s*<br>\s*$/g, ""); //usun ostatni enter
            $scope.parts[partObjIndex].Data = $scope.parts[partObjIndex].Data.replace(/\s*<br>\s*$/g, "");
            //console.log("after: " + $scope.parts[partObjIndex].Data);
            addPart(partObjIndex);
            event.preventDefault(); //żeby nie dawało już tego entera
        }
    }
    
    function updatePart(index) {
        //console.log("update");
        $scope.parts[index].localState = "Sending";
        var partObj = $scope.parts[index];
        parts.put(partObj).success(function () {
            $scope.parts[index].localState = "OK";
        }).error(function () {
            $scope.parts[index].localState = "Problem";
        });
    }

    function addPart(lastIndex) {
        //$scope.parts.push({ Data: "new" });
        //console.log("lastIndex: " + lastIndex);
        //console.table($scope.parts);
        var atIndex = lastIndex + 1;
        if (lastIndex == null) {
            atIndex = 0;
        }

        $scope.parts.splice(atIndex, 0, { Data: "new", NoteID: $scope.currentNoteId }); //add at index
        //console.log("after");
        //console.table($scope.parts);
        focusOn("part" + atIndex);
        $scope.parts[atIndex].localState = "Sending";
        parts.post($scope.parts[atIndex]).success(function (data) {
            console.log("post success");
            console.table(data);
            $scope.parts[atIndex].ID = data.ID;
            $scope.parts[atIndex].localState = "OK";
        }).error(function () {
            $scope.parts[atIndex].localState = "Problem";
        });
    }

    function partsCheckForNull(){
        if ($scope.parts.length == 0 || $scope.parts == null) {
            addPart();
        }
    }
});
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
app.factory('parts', ['$http', function ($http) {

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
        return $http({
            method: 'PUT',
            url: '/api/Parts/'+part.ID,
            data: part,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    return parts;
}]);
(function () {
    'use strict';

    
})();

var app = angular.module('ConsoleNotepad', [
        // Angular modules 
        'ngRoute'

        // Custom modules 

        // 3rd Party Modules

]);

//app.directive('contenteditable', function () {
//    return {
//        restrict: 'A', // only activate on element attribute
//        require: '?ngModel', // get a hold of NgModelController
//        link: function (scope, element, attrs, ngModel) {
//            if (!ngModel) return; // do nothing if no ng-model

//            // Specify how UI should be updated
//            ngModel.$render = function () {
//                element.html(ngModel.$viewValue || '');
//            };

//            // Listen for change events to enable binding
//            element.on('blur keyup change', function () {
//                scope.$apply(read);
//            });
//            read(); // initialize

//            // Write data to the model
//            function read() {
//                var html = element.html();
//                // When we clear the content editable the browser leaves a <br> behind
//                // If strip-br attribute is provided then we strip this out
//                if (attrs.stripBr && html == '<br>') {
//                    html = '';
//                }
//                ngModel.$setViewValue(html);
//            }
//        }
//    };
//});

app.directive('contenteditable', [function () {
    return {
        require: '?ngModel',
        scope: {

        },
        link: function (scope, element, attrs, ctrl) {
            // view -> model (when div gets blur update the view value of the model)
            element.bind('blur keyup change', function () {
                scope.$apply(function () {
                    ctrl.$setViewValue(element.html());
                });
            });

            // model -> view
            ctrl.$render = function () {
                element.html(ctrl.$viewValue);
            };

            // load init value from DOM
            ctrl.$render();

            // remove the attached events to element when destroying the scope
            scope.$on('$destroy', function () {
                element.unbind('blur');
                element.unbind('paste');
                element.unbind('focus');
            });
        }
    };
}]);
app.directive('focusOn', function () {
    return function (scope, elem, attr) {
        scope.$on('focusOn', function (e, name) {
            if (name === attr.focusOn) {
                elem[0].focus();
            }
        });
    };
});

app.factory('focusOn', function ($rootScope, $timeout) {
    return function (name) {
        $timeout(function () {
            $rootScope.$broadcast('focusOn', name);
        });
    }
});
app.controller('editorController', function ($scope, notes, parts, focusOn) {
    $scope.suggestions = {};
    $scope.highlightedSuggestion = -1;
    $scope.currentNoteId = 0;
    $scope.parts = [
        {
            Data: "new"
        }
    ];
    var timeoutUpdate; //setTimeout to update Part
    var editingPartOptions = {};
    $scope.focusOnPart = 0;

    $scope.smartBarKeyDown = function (event) {
        //console.log("Refresh " + event.keyCode)
        if (event.keyCode == 32) { //space
            $scope.suggestions = notes.getSuggested($scope.smartBar).success(function (data) {
                console.table(data);
                $scope.suggestions = data;
            });
            console.log("Suggestions refreshed");
        }

        if (event.keyCode == 40 && $scope.highlightedSuggestion < $scope.suggestions.length-1) { //arrow down
            //sterowanie po menu
            event.preventDefault();
            $scope.highlightedSuggestion++;
        }
        if (event.keyCode == 38 && $scope.highlightedSuggestion > -1) { //arrow up
            event.preventDefault();
            $scope.highlightedSuggestion--;
        }

        if (event.keyCode == 13 && $scope.highlightedSuggestion > -1) { //enter
            //uzupełnij inputa, zacznij pisanie notatki
            //console.table($scope.suggestions[$scope.highlightedSuggestion].NoteTags);

            $scope.smartBar = "";

            var note = $scope.suggestions[$scope.highlightedSuggestion];
            console.table(note);

            //uzupelniam smartBar o wybrane tagi
            for (var nt in note.NoteTags) {
                $scope.smartBar += note.NoteTags[nt].Tag.Name + " ";
            }

            $scope.currentNoteId = note.NoteId;
            $scope.parts = parts.get($scope.currentNoteId).success(function (data) {
                $scope.parts = data;
                //console.log("Got data: ");
                console.table(data);
                partsCheckForNull();
            });

        }
    }

    $scope.editingPartKeyDown = function (event, partObjIndex) {
        clearTimeout(timeoutUpdate);
        timeoutUpdate = setTimeout(function () { updatePart(partObjIndex) }, 1000);
        $scope.parts[partObjIndex].localState = "Sending";
        //timeoutUpdate = setTimeout(function () { alert("chuj");}, 3000);

        //2x enter dodaje nowy part
        //console.log(partObj.Data);

        var partObj = $scope.parts[partObjIndex];
        if (event.keyCode == 13 && /\s*<br>\s*<br>\s*$/.test(partObj.Data)) { //enter
            //console.log("three enters");
            //console.log("before: " + $scope.parts[partObjIndex].Data);
            //$scope.parts[partObjIndex].Data = $scope.parts[partObjIndex].Data.replace(/\s*<br>\s*<br>\s*$/g, ""); //usun ostatni enter
            $scope.parts[partObjIndex].Data = $scope.parts[partObjIndex].Data.replace(/\s*<br>\s*$/g, "");
            //console.log("after: " + $scope.parts[partObjIndex].Data);
            addPart(partObjIndex);
            event.preventDefault(); //żeby nie dawało już tego entera
        }
    }
    
    function updatePart(index) {
        //console.log("update");
        $scope.parts[index].localState = "Sending";
        var partObj = $scope.parts[index];
        parts.put(partObj).success(function () {
            $scope.parts[index].localState = "OK";
        }).error(function () {
            $scope.parts[index].localState = "Problem";
        });
    }

    function addPart(lastIndex) {
        //$scope.parts.push({ Data: "new" });
        //console.log("lastIndex: " + lastIndex);
        //console.table($scope.parts);
        var atIndex = lastIndex + 1;
        if (lastIndex == null) {
            atIndex = 0;
        }

        $scope.parts.splice(atIndex, 0, { Data: "new", NoteID: $scope.currentNoteId }); //add at index
        //console.log("after");
        //console.table($scope.parts);
        focusOn("part" + atIndex);
        $scope.parts[atIndex].localState = "Sending";
        parts.post($scope.parts[atIndex]).success(function (data) {
            console.log("post success");
            console.table(data);
            $scope.parts[atIndex].ID = data.ID;
            $scope.parts[atIndex].localState = "OK";
        }).error(function () {
            $scope.parts[atIndex].localState = "Problem";
        });
    }

    function partsCheckForNull(){
        if ($scope.parts.length == 0 || $scope.parts == null) {
            addPart();
        }
    }
});
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
app.factory('parts', ['$http', function ($http) {

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
        return $http({
            method: 'PUT',
            url: '/api/Parts/'+part.ID,
            data: part,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    return parts;
}]);
(function () {
    'use strict';

    
})();

var app = angular.module('ConsoleNotepad', [
        // Angular modules 
        'ngRoute'

        // Custom modules 

        // 3rd Party Modules

]);

//app.directive('contenteditable', function () {
//    return {
//        restrict: 'A', // only activate on element attribute
//        require: '?ngModel', // get a hold of NgModelController
//        link: function (scope, element, attrs, ngModel) {
//            if (!ngModel) return; // do nothing if no ng-model

//            // Specify how UI should be updated
//            ngModel.$render = function () {
//                element.html(ngModel.$viewValue || '');
//            };

//            // Listen for change events to enable binding
//            element.on('blur keyup change', function () {
//                scope.$apply(read);
//            });
//            read(); // initialize

//            // Write data to the model
//            function read() {
//                var html = element.html();
//                // When we clear the content editable the browser leaves a <br> behind
//                // If strip-br attribute is provided then we strip this out
//                if (attrs.stripBr && html == '<br>') {
//                    html = '';
//                }
//                ngModel.$setViewValue(html);
//            }
//        }
//    };
//});

app.directive('contenteditable', [function () {
    return {
        require: '?ngModel',
        scope: {

        },
        link: function (scope, element, attrs, ctrl) {
            // view -> model (when div gets blur update the view value of the model)
            element.bind('blur keyup change', function () {
                scope.$apply(function () {
                    ctrl.$setViewValue(element.html());
                });
            });

            // model -> view
            ctrl.$render = function () {
                element.html(ctrl.$viewValue);
            };

            // load init value from DOM
            ctrl.$render();

            // remove the attached events to element when destroying the scope
            scope.$on('$destroy', function () {
                element.unbind('blur');
                element.unbind('paste');
                element.unbind('focus');
            });
        }
    };
}]);
app.directive('focusOn', function () {
    return function (scope, elem, attr) {
        scope.$on('focusOn', function (e, name) {
            if (name === attr.focusOn) {
                elem[0].focus();
            }
        });
    };
});

app.factory('focusOn', function ($rootScope, $timeout) {
    return function (name) {
        $timeout(function () {
            $rootScope.$broadcast('focusOn', name);
        });
    }
});
app.controller('editorController', function ($scope, notes, parts, focusOn) {
    $scope.suggestions = {};
    $scope.highlightedSuggestion = -1;
    $scope.currentNoteId = 0;
    $scope.parts = [
        {
            Data: "new"
        }
    ];
    var timeoutUpdate; //setTimeout to update Part
    var editingPartOptions = {};
    $scope.focusOnPart = 0;

    $scope.smartBarKeyDown = function (event) {
        //console.log("Refresh " + event.keyCode)
        if (event.keyCode == 32) { //space
            $scope.suggestions = notes.getSuggested($scope.smartBar).success(function (data) {
                console.table(data);
                $scope.suggestions = data;
            });
            console.log("Suggestions refreshed");
        }

        if (event.keyCode == 40 && $scope.highlightedSuggestion < $scope.suggestions.length-1) { //arrow down
            //sterowanie po menu
            event.preventDefault();
            $scope.highlightedSuggestion++;
        }
        if (event.keyCode == 38 && $scope.highlightedSuggestion > -1) { //arrow up
            event.preventDefault();
            $scope.highlightedSuggestion--;
        }

        if (event.keyCode == 13 && $scope.highlightedSuggestion > -1) { //enter
            //uzupełnij inputa, zacznij pisanie notatki
            //console.table($scope.suggestions[$scope.highlightedSuggestion].NoteTags);

            $scope.smartBar = "";

            var note = $scope.suggestions[$scope.highlightedSuggestion];
            console.table(note);

            //uzupelniam smartBar o wybrane tagi
            for (var nt in note.NoteTags) {
                $scope.smartBar += note.NoteTags[nt].Tag.Name + " ";
            }

            $scope.currentNoteId = note.NoteId;
            $scope.parts = parts.get($scope.currentNoteId).success(function (data) {
                $scope.parts = data;
                console.log("Got data: ");
                console.table(data);
                partsCheckForNull();
            });

        }
    }

    $scope.editingPartKeyDown = function (event, partObjIndex) {
        clearTimeout(timeoutUpdate);
        timeoutUpdate = setTimeout(function () { updatePart(partObjIndex) }, 1000);
        $scope.parts[partObjIndex].localState = "Sending";
        //timeoutUpdate = setTimeout(function () { alert("chuj");}, 3000);

        //2x enter dodaje nowy part
        //console.log(partObj.Data);

        var partObj = $scope.parts[partObjIndex];
        if (event.keyCode == 13 && /\s*<br>\s*<br>\s*$/.test(partObj.Data)) { //enter
            //console.log("three enters");
            //console.log("before: " + $scope.parts[partObjIndex].Data);
            //$scope.parts[partObjIndex].Data = $scope.parts[partObjIndex].Data.replace(/\s*<br>\s*<br>\s*$/g, ""); //usun ostatni enter
            $scope.parts[partObjIndex].Data = $scope.parts[partObjIndex].Data.replace(/\s*<br>\s*$/g, "");
            //console.log("after: " + $scope.parts[partObjIndex].Data);
            addPart(partObjIndex);
            event.preventDefault(); //żeby nie dawało już tego entera
        }
    }
    
    function updatePart(index) {
        //console.log("update");
        $scope.parts[index].localState = "Sending";
        var partObj = $scope.parts[index];
        parts.put(partObj).success(function () {
            $scope.parts[index].localState = "OK";
        }).error(function () {
            $scope.parts[index].localState = "Problem";
        });
    }

    function addPart(lastIndex) {
        //$scope.parts.push({ Data: "new" });
        //console.log("lastIndex: " + lastIndex);
        //console.table($scope.parts);
        var atIndex = lastIndex + 1;
        if (lastIndex == null) {
            atIndex = 0;
        }

        $scope.parts.splice(atIndex, 0, { Data: "new", NoteID: $scope.currentNoteId }); //add at index
        //console.log("after");
        //console.table($scope.parts);
        focusOn("part" + atIndex);
        $scope.parts[atIndex].localState = "Sending";
        parts.post($scope.parts[atIndex]).success(function (data) {
            console.log("post success");
            console.table(data);
            $scope.parts[atIndex].ID = data.ID;
            $scope.parts[atIndex].localState = "OK";
        }).error(function () {
            $scope.parts[atIndex].localState = "Problem";
        });
    }

    function partsCheckForNull(){
        if ($scope.parts.length == 0 || $scope.parts == null) {
            addPart();
        }
    }
});
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
app.factory('parts', ['$http', function ($http) {

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
        return $http({
            method: 'PUT',
            url: '/api/Parts/'+part.ID,
            data: part,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    return parts;
}]);
(function () {
    'use strict';

    
})();

var app = angular.module('ConsoleNotepad', [
        // Angular modules 
        'ngRoute'

        // Custom modules 

        // 3rd Party Modules

]);

//app.directive('contenteditable', function () {
//    return {
//        restrict: 'A', // only activate on element attribute
//        require: '?ngModel', // get a hold of NgModelController
//        link: function (scope, element, attrs, ngModel) {
//            if (!ngModel) return; // do nothing if no ng-model

//            // Specify how UI should be updated
//            ngModel.$render = function () {
//                element.html(ngModel.$viewValue || '');
//            };

//            // Listen for change events to enable binding
//            element.on('blur keyup change', function () {
//                scope.$apply(read);
//            });
//            read(); // initialize

//            // Write data to the model
//            function read() {
//                var html = element.html();
//                // When we clear the content editable the browser leaves a <br> behind
//                // If strip-br attribute is provided then we strip this out
//                if (attrs.stripBr && html == '<br>') {
//                    html = '';
//                }
//                ngModel.$setViewValue(html);
//            }
//        }
//    };
//});

app.directive('contenteditable', [function () {
    return {
        require: '?ngModel',
        scope: {

        },
        link: function (scope, element, attrs, ctrl) {
            // view -> model (when div gets blur update the view value of the model)
            element.bind('blur keyup change', function () {
                scope.$apply(function () {
                    ctrl.$setViewValue(element.html());
                });
            });

            // model -> view
            ctrl.$render = function () {
                element.html(ctrl.$viewValue);
            };

            // load init value from DOM
            ctrl.$render();

            // remove the attached events to element when destroying the scope
            scope.$on('$destroy', function () {
                element.unbind('blur');
                element.unbind('paste');
                element.unbind('focus');
            });
        }
    };
}]);
app.directive('focusOn', function () {
    return function (scope, elem, attr) {
        scope.$on('focusOn', function (e, name) {
            if (name === attr.focusOn) {
                elem[0].focus();
            }
        });
    };
});

app.factory('focusOn', function ($rootScope, $timeout) {
    return function (name) {
        $timeout(function () {
            $rootScope.$broadcast('focusOn', name);
        });
    }
});
app.controller('editorController', function ($scope, notes, parts, focusOn) {
    $scope.suggestions = {};
    $scope.highlightedSuggestion = -1;
    $scope.currentNoteId = 0;
    $scope.parts = [
        {
            Data: "new"
        }
    ];
    var timeoutUpdate; //setTimeout to update Part
    var editingPartOptions = {};
    $scope.focusOnPart = 0;

    $scope.smartBarKeyDown = function (event) {
        //console.log("Refresh " + event.keyCode)
        if (event.keyCode == 32) { //space
            $scope.suggestions = notes.getSuggested($scope.smartBar).success(function (data) {
                console.table(data);
                $scope.suggestions = data;
            });
            console.log("Suggestions refreshed");
        }

        if (event.keyCode == 40 && $scope.highlightedSuggestion < $scope.suggestions.length-1) { //arrow down
            //sterowanie po menu
            event.preventDefault();
            $scope.highlightedSuggestion++;
        }
        if (event.keyCode == 38 && $scope.highlightedSuggestion > -1) { //arrow up
            event.preventDefault();
            $scope.highlightedSuggestion--;
        }

        if (event.keyCode == 13 && $scope.highlightedSuggestion > -1) { //enter
            //uzupełnij inputa, zacznij pisanie notatki
            //console.table($scope.suggestions[$scope.highlightedSuggestion].NoteTags);

            $scope.smartBar = "";

            var note = $scope.suggestions[$scope.highlightedSuggestion];
            console.table(note);

            //uzupelniam smartBar o wybrane tagi
            for (var nt in note.NoteTags) {
                $scope.smartBar += note.NoteTags[nt].Tag.Name + " ";
            }

            $scope.currentNoteId = note.NoteId;
            $scope.parts = parts.get($scope.currentNoteId).success(function (data) {
                $scope.parts = data;
                console.log("Got data: ");
                console.table(data);
                partsCheckForNull();
            });

        }
    }

    $scope.editingPartKeyDown = function (event, partObjIndex) {
        //aktualizuj co jakis czas
        clearTimeout(timeoutUpdate);
        timeoutUpdate = setTimeout(function () { updatePart(partObjIndex) }, 1000);
        $scope.parts[partObjIndex].localState = "Sending";
        //timeoutUpdate = setTimeout(function () { alert("chuj");}, 3000);

        //2x enter dodaje nowy part
        //console.log(partObj.Data);

        var partObj = $scope.parts[partObjIndex];
        if (event.keyCode == 13 && /\s*<br>\s*<br>\s*$/.test(partObj.Data)) { //enter
            //console.log("three enters");
            //console.log("before: " + $scope.parts[partObjIndex].Data);
            //$scope.parts[partObjIndex].Data = $scope.parts[partObjIndex].Data.replace(/\s*<br>\s*<br>\s*$/g, ""); //usun ostatni enter
            $scope.parts[partObjIndex].Data = $scope.parts[partObjIndex].Data.replace(/\s*<br>\s*$/g, "");
            //console.log("after: " + $scope.parts[partObjIndex].Data);
            addPart(partObjIndex);
            event.preventDefault(); //żeby nie dawało już tego entera
        }
    }
    
    function updatePart(index) {
        //console.log("update");
        $scope.parts[index].localState = "Sending";
        var partObj = $scope.parts[index];
        parts.put(partObj).success(function () {
            $scope.parts[index].localState = "OK";
        }).error(function () {
            $scope.parts[index].localState = "Problem";
        });
    }

    function addPart(lastIndex) {
        //$scope.parts.push({ Data: "new" });
        //console.log("lastIndex: " + lastIndex);
        //console.table($scope.parts);
        var atIndex = lastIndex + 1;
        if (lastIndex == null) {
            atIndex = 0;
        }

        $scope.parts.splice(atIndex, 0, { Data: "new", NoteID: $scope.currentNoteId }); //add at index
        //console.log("after");
        //console.table($scope.parts);
        focusOn("part" + atIndex);
        $scope.parts[atIndex].localState = "Sending";
        parts.post($scope.parts[atIndex]).success(function (data) {
            console.log("post success");
            console.table(data);
            $scope.parts[atIndex].ID = data.ID;
            $scope.parts[atIndex].localState = "OK";
        }).error(function () {
            $scope.parts[atIndex].localState = "Problem";
        });
    }

    function partsCheckForNull(){
        if ($scope.parts.length == 0 || $scope.parts == null) {
            addPart();
        }
    }
});
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
app.factory('parts', ['$http', function ($http) {

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
        return $http({
            method: 'PUT',
            url: '/api/Parts/'+part.ID,
            data: part,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    return parts;
}]);
(function () {
    'use strict';

    
})();

var app = angular.module('ConsoleNotepad', [
        // Angular modules 
        'ngRoute'

        // Custom modules 

        // 3rd Party Modules

]);

//app.directive('contenteditable', function () {
//    return {
//        restrict: 'A', // only activate on element attribute
//        require: '?ngModel', // get a hold of NgModelController
//        link: function (scope, element, attrs, ngModel) {
//            if (!ngModel) return; // do nothing if no ng-model

//            // Specify how UI should be updated
//            ngModel.$render = function () {
//                element.html(ngModel.$viewValue || '');
//            };

//            // Listen for change events to enable binding
//            element.on('blur keyup change', function () {
//                scope.$apply(read);
//            });
//            read(); // initialize

//            // Write data to the model
//            function read() {
//                var html = element.html();
//                // When we clear the content editable the browser leaves a <br> behind
//                // If strip-br attribute is provided then we strip this out
//                if (attrs.stripBr && html == '<br>') {
//                    html = '';
//                }
//                ngModel.$setViewValue(html);
//            }
//        }
//    };
//});

app.directive('contenteditable', [function () {
    return {
        require: '?ngModel',
        scope: {

        },
        link: function (scope, element, attrs, ctrl) {
            // view -> model (when div gets blur update the view value of the model)
            element.bind('blur keyup change', function () {
                scope.$apply(function () {
                    ctrl.$setViewValue(element.html());
                });
            });

            // model -> view
            ctrl.$render = function () {
                element.html(ctrl.$viewValue);
            };

            // load init value from DOM
            ctrl.$render();

            // remove the attached events to element when destroying the scope
            scope.$on('$destroy', function () {
                element.unbind('blur');
                element.unbind('paste');
                element.unbind('focus');
            });
        }
    };
}]);
app.directive('focusOn', function () {
    return function (scope, elem, attr) {
        scope.$on('focusOn', function (e, name) {
            if (name === attr.focusOn) {
                elem[0].focus();
            }
        });
    };
});

app.factory('focusOn', function ($rootScope, $timeout) {
    return function (name) {
        $timeout(function () {
            $rootScope.$broadcast('focusOn', name);
        });
    }
});
app.controller('editorController', function ($scope, notes, parts, focusOn) {
    $scope.suggestions = {};
    $scope.highlightedSuggestion = -1;
    $scope.currentNoteId = 0;
    $scope.parts = [
        {
            Data: "new"
        }
    ];
    var timeoutUpdate; //setTimeout to update Part
    var editingPartOptions = {};
    $scope.focusOnPart = 0;

    $scope.smartBarKeyDown = function (event) {
        //console.log("Refresh " + event.keyCode)
        if (event.keyCode == 32) { //space
            $scope.suggestions = notes.getSuggested($scope.smartBar).success(function (data) {
                console.table(data);
                $scope.suggestions = data;
            });
            console.log("Suggestions refreshed");
        }

        if (event.keyCode == 40 && $scope.highlightedSuggestion < $scope.suggestions.length-1) { //arrow down
            //sterowanie po menu
            event.preventDefault();
            $scope.highlightedSuggestion++;
        }
        if (event.keyCode == 38 && $scope.highlightedSuggestion > -1) { //arrow up
            event.preventDefault();
            $scope.highlightedSuggestion--;
        }

        if (event.keyCode == 13 && $scope.highlightedSuggestion > -1) { //enter
            //uzupełnij inputa, zacznij pisanie notatki
            //console.table($scope.suggestions[$scope.highlightedSuggestion].NoteTags);

            $scope.smartBar = "";

            var note = $scope.suggestions[$scope.highlightedSuggestion];
            console.table(note);

            //uzupelniam smartBar o wybrane tagi
            for (var nt in note.NoteTags) {
                $scope.smartBar += note.NoteTags[nt].Tag.Name + " ";
            }

            $scope.currentNoteId = note.NoteId;
            $scope.parts = parts.get($scope.currentNoteId).success(function (data) {
                $scope.parts = data;
                console.log("Got data: ");
                console.table(data);
                partsCheckForNull();
            });

        }
    }

    $scope.editingPartKeyDown = function (event, partObjIndex) {

        //aktualizuj co jakis czas
        clearTimeout(timeoutUpdate);
        timeoutUpdate = setTimeout(function () { updatePart(partObjIndex) }, 1000);
        $scope.parts[partObjIndex].localState = "Sending";

        //2x enter dodaje nowy part
        //console.log(partObj.Data);

        var partObj = $scope.parts[partObjIndex];
        if (event.keyCode == 13 && /\s*<br>\s*<br>\s*$/.test(partObj.Data)) { //enter
            //console.log("three enters");
            //console.log("before: " + $scope.parts[partObjIndex].Data);
            //$scope.parts[partObjIndex].Data = $scope.parts[partObjIndex].Data.replace(/\s*<br>\s*<br>\s*$/g, ""); //usun ostatni enter
            $scope.parts[partObjIndex].Data = $scope.parts[partObjIndex].Data.replace(/\s*<br>\s*$/g, "");
            //console.log("after: " + $scope.parts[partObjIndex].Data);
            addPart(partObjIndex);
            event.preventDefault(); //żeby nie dawało już tego entera
        }
    }
    
    function updatePart(index) {
        //console.log("update");
        $scope.parts[index].localState = "Sending";
        var partObj = $scope.parts[index];
        parts.put(partObj).success(function () {
            $scope.parts[index].localState = "OK";
        }).error(function () {
            $scope.parts[index].localState = "Problem";
        });
    }

    function addPart(lastIndex) {
        //$scope.parts.push({ Data: "new" });
        //console.log("lastIndex: " + lastIndex);
        //console.table($scope.parts);
        var atIndex = lastIndex + 1;
        if (lastIndex == null) {
            atIndex = 0;
        }

        $scope.parts.splice(atIndex, 0, { Data: "new", NoteID: $scope.currentNoteId }); //add at index
        //console.log("after");
        //console.table($scope.parts);
        focusOn("part" + atIndex);
        $scope.parts[atIndex].localState = "Sending";
        parts.post($scope.parts[atIndex]).success(function (data) {
            console.log("post success");
            console.table(data);
            $scope.parts[atIndex].ID = data.ID;
            $scope.parts[atIndex].localState = "OK";
        }).error(function () {
            $scope.parts[atIndex].localState = "Problem";
        });
    }

    function partsCheckForNull(){
        if ($scope.parts.length == 0 || $scope.parts == null) {
            addPart();
        }
    }
});
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
app.factory('parts', ['$http', function ($http) {

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
        return $http({
            method: 'PUT',
            url: '/api/Parts/'+part.ID,
            data: part,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    return parts;
}]);
(function () {
    'use strict';

    
})();

var app = angular.module('ConsoleNotepad', [
        // Angular modules 
        'ngRoute'

        // Custom modules 

        // 3rd Party Modules

]);

//app.directive('contenteditable', function () {
//    return {
//        restrict: 'A', // only activate on element attribute
//        require: '?ngModel', // get a hold of NgModelController
//        link: function (scope, element, attrs, ngModel) {
//            if (!ngModel) return; // do nothing if no ng-model

//            // Specify how UI should be updated
//            ngModel.$render = function () {
//                element.html(ngModel.$viewValue || '');
//            };

//            // Listen for change events to enable binding
//            element.on('blur keyup change', function () {
//                scope.$apply(read);
//            });
//            read(); // initialize

//            // Write data to the model
//            function read() {
//                var html = element.html();
//                // When we clear the content editable the browser leaves a <br> behind
//                // If strip-br attribute is provided then we strip this out
//                if (attrs.stripBr && html == '<br>') {
//                    html = '';
//                }
//                ngModel.$setViewValue(html);
//            }
//        }
//    };
//});

app.directive('contenteditable', [function () {
    return {
        require: '?ngModel',
        scope: {

        },
        link: function (scope, element, attrs, ctrl) {
            // view -> model (when div gets blur update the view value of the model)
            element.bind('blur keyup change', function () {
                scope.$apply(function () {
                    ctrl.$setViewValue(element.html());
                });
            });

            // model -> view
            ctrl.$render = function () {
                element.html(ctrl.$viewValue);
            };

            // load init value from DOM
            ctrl.$render();

            // remove the attached events to element when destroying the scope
            scope.$on('$destroy', function () {
                element.unbind('blur');
                element.unbind('paste');
                element.unbind('focus');
            });
        }
    };
}]);
app.directive('focusOn', function () {
    return function (scope, elem, attr) {
        scope.$on('focusOn', function (e, name) {
            if (name === attr.focusOn) {
                elem[0].focus();
            }
        });
    };
});

app.factory('focusOn', function ($rootScope, $timeout) {
    return function (name) {
        $timeout(function () {
            $rootScope.$broadcast('focusOn', name);
        });
    }
});
app.controller('editorController', function ($scope, notes, parts, focusOn) {
    $scope.suggestions = {};
    $scope.highlightedSuggestion = -1;
    $scope.currentNoteId = 0;
    $scope.parts = [
        {
            Data: "new"
        }
    ];
    var timeoutUpdate; //setTimeout to update Part
    var editingPartOptions = {};
    $scope.focusOnPart = 0;

    $scope.smartBarKeyDown = function (event) {
        //console.log("Refresh " + event.keyCode)
        if (event.keyCode == 32) { //space
            $scope.suggestions = notes.getSuggested($scope.smartBar).success(function (data) {
                console.table(data);
                $scope.suggestions = data;
            });
            console.log("Suggestions refreshed");
        }

        if (event.keyCode == 40 && $scope.highlightedSuggestion < $scope.suggestions.length-1) { //arrow down
            //sterowanie po menu
            event.preventDefault();
            $scope.highlightedSuggestion++;
        }
        if (event.keyCode == 38 && $scope.highlightedSuggestion > -1) { //arrow up
            event.preventDefault();
            $scope.highlightedSuggestion--;
        }

        if (event.keyCode == 13 && $scope.highlightedSuggestion > -1) { //enter
            //uzupełnij inputa, zacznij pisanie notatki
            //console.table($scope.suggestions[$scope.highlightedSuggestion].NoteTags);

            $scope.smartBar = "";

            var note = $scope.suggestions[$scope.highlightedSuggestion];
            console.table(note);

            //uzupelniam smartBar o wybrane tagi
            for (var nt in note.NoteTags) {
                $scope.smartBar += note.NoteTags[nt].Tag.Name + " ";
            }

            $scope.currentNoteId = note.NoteId;
            $scope.parts = parts.get($scope.currentNoteId).success(function (data) {
                $scope.parts = data;
                console.log("Got data: ");
                console.table(data);
                partsCheckForNull();
            });

        }
    }

    $scope.editingPartKeyDown = function (event, partObjIndex) {

        //aktualizuj co jakis czas
        clearTimeout(timeoutUpdate);
        timeoutUpdate = setTimeout(function () { updatePart(partObjIndex) }, 1000);
        $scope.parts[partObjIndex].localState = "Sending";

        //2x enter dodaje nowy part
        var partObj = $scope.parts[partObjIndex];
        if (event.keyCode == 13 && /\s*<br>\s*<br>\s*$/.test(partObj.Data)) { //enter
            $scope.parts[partObjIndex].Data = $scope.parts[partObjIndex].Data.replace(/\s*<br>\s*$/g, "");
            //console.log("after: " + $scope.parts[partObjIndex].Data);
            addPart(partObjIndex);
            event.preventDefault(); //żeby nie dawało już tego entera
        }
    }
    
    function updatePart(index) {
        //console.log("update");
        $scope.parts[index].localState = "Sending";
        var partObj = $scope.parts[index];
        parts.put(partObj).success(function () {
            $scope.parts[index].localState = "OK";
        }).error(function () {
            $scope.parts[index].localState = "Problem";
        });
    }

    function addPart(lastIndex) {
        //$scope.parts.push({ Data: "new" });
        //console.log("lastIndex: " + lastIndex);
        //console.table($scope.parts);
        var atIndex = lastIndex + 1;
        if (lastIndex == null) {
            atIndex = 0;
        }

        $scope.parts.splice(atIndex, 0, { Data: "new", NoteID: $scope.currentNoteId }); //add at index
        //console.log("after");
        //console.table($scope.parts);
        focusOn("part" + atIndex);
        $scope.parts[atIndex].localState = "Sending";
        parts.post($scope.parts[atIndex]).success(function (data) {
            console.log("post success");
            console.table(data);
            $scope.parts[atIndex].ID = data.ID;
            $scope.parts[atIndex].localState = "OK";
        }).error(function () {
            $scope.parts[atIndex].localState = "Problem";
        });
    }

    function partsCheckForNull(){
        if ($scope.parts.length == 0 || $scope.parts == null) {
            addPart();
        }
    }
});
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
app.factory('parts', ['$http', function ($http) {

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
        return $http({
            method: 'PUT',
            url: '/api/Parts/'+part.ID,
            data: part,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    return parts;
}]);
(function () {
    'use strict';

    
})();

var app = angular.module('ConsoleNotepad', [
        // Angular modules 
        'ngRoute'

        // Custom modules 

        // 3rd Party Modules

]);

//app.directive('contenteditable', function () {
//    return {
//        restrict: 'A', // only activate on element attribute
//        require: '?ngModel', // get a hold of NgModelController
//        link: function (scope, element, attrs, ngModel) {
//            if (!ngModel) return; // do nothing if no ng-model

//            // Specify how UI should be updated
//            ngModel.$render = function () {
//                element.html(ngModel.$viewValue || '');
//            };

//            // Listen for change events to enable binding
//            element.on('blur keyup change', function () {
//                scope.$apply(read);
//            });
//            read(); // initialize

//            // Write data to the model
//            function read() {
//                var html = element.html();
//                // When we clear the content editable the browser leaves a <br> behind
//                // If strip-br attribute is provided then we strip this out
//                if (attrs.stripBr && html == '<br>') {
//                    html = '';
//                }
//                ngModel.$setViewValue(html);
//            }
//        }
//    };
//});

app.directive('contenteditable', [function () {
    return {
        require: '?ngModel',
        scope: {

        },
        link: function (scope, element, attrs, ctrl) {
            // view -> model (when div gets blur update the view value of the model)
            element.bind('blur keyup change', function () {
                scope.$apply(function () {
                    ctrl.$setViewValue(element.html());
                });
            });

            // model -> view
            ctrl.$render = function () {
                element.html(ctrl.$viewValue);
            };

            // load init value from DOM
            ctrl.$render();

            // remove the attached events to element when destroying the scope
            scope.$on('$destroy', function () {
                element.unbind('blur');
                element.unbind('paste');
                element.unbind('focus');
            });
        }
    };
}]);
app.directive('focusOn', function () {
    return function (scope, elem, attr) {
        scope.$on('focusOn', function (e, name) {
            if (name === attr.focusOn) {
                elem[0].focus();
            }
        });
    };
});

app.factory('focusOn', function ($rootScope, $timeout) {
    return function (name) {
        $timeout(function () {
            $rootScope.$broadcast('focusOn', name);
        });
    }
});
app.controller('editorController', function ($scope, notes, parts, focusOn) {
    $scope.suggestions = {};
    $scope.highlightedSuggestion = -1;
    $scope.currentNoteId = 0;
    $scope.parts = [
        {
            Data: "new"
        }
    ];
    var timeoutUpdate; //setTimeout to update Part
    var editingPartOptions = {};
    $scope.focusOnPart = 0;

    $scope.smartBarKeyDown = function (event) {
        //console.log("Refresh " + event.keyCode)
        if (event.keyCode == 32) { //space
            $scope.suggestions = notes.getSuggested($scope.smartBar).success(function (data) {
                console.table(data);
                $scope.suggestions = data;
            });
            console.log("Suggestions refreshed");
        }

        if (event.keyCode == 40 && $scope.highlightedSuggestion < $scope.suggestions.length-1) { //arrow down
            //sterowanie po menu
            event.preventDefault();
            $scope.highlightedSuggestion++;
        }
        if (event.keyCode == 38 && $scope.highlightedSuggestion > -1) { //arrow up
            event.preventDefault();
            $scope.highlightedSuggestion--;
        }

        if (event.keyCode == 13 && $scope.highlightedSuggestion > -1) { //enter
            //uzupełnij inputa, zacznij pisanie notatki
            //console.table($scope.suggestions[$scope.highlightedSuggestion].NoteTags);

            $scope.smartBar = "";

            var note = $scope.suggestions[$scope.highlightedSuggestion];
            console.table(note);

            //uzupelniam smartBar o wybrane tagi
            for (var nt in note.NoteTags) {
                $scope.smartBar += note.NoteTags[nt].Tag.Name + " ";
            }

            $scope.currentNoteId = note.NoteId;
            $scope.parts = parts.get($scope.currentNoteId).success(function (data) {
                $scope.parts = data;
                console.log("Got data: ");
                console.table(data);
                partsCheckForNull();
            });

        }
    }

    $scope.editingPartKeyDown = function (event, partObjIndex) {

        //aktualizuj co jakis czas
        clearTimeout(timeoutUpdate);
        timeoutUpdate = setTimeout(function () { updatePart(partObjIndex) }, 1000);
        $scope.parts[partObjIndex].localState = "Sending";

        //2x enter dodaje nowy part
        var partObj = $scope.parts[partObjIndex];
        if (event.keyCode == 13 && /\s*<br>\s*<br>\s*$/.test(partObj.Data)) { //enter
            $scope.parts[partObjIndex].Data = $scope.parts[partObjIndex].Data.replace(/\s*<br>\s*$/g, "");
            addPart(partObjIndex);
            event.preventDefault(); //żeby nie dawało już tego entera
        }
    }
    
    function updatePart(index) {
        //console.log("update");
        $scope.parts[index].localState = "Sending";
        var partObj = $scope.parts[index];
        parts.put(partObj).success(function () {
            $scope.parts[index].localState = "OK";
        }).error(function () {
            $scope.parts[index].localState = "Problem";
        });
    }

    function addPart(lastIndex) {
        //$scope.parts.push({ Data: "new" });
        //console.log("lastIndex: " + lastIndex);
        //console.table($scope.parts);
        var atIndex = lastIndex + 1;
        if (lastIndex == null) {
            atIndex = 0;
        }

        $scope.parts.splice(atIndex, 0, { Data: "new", NoteID: $scope.currentNoteId }); //add at index
        //console.log("after");
        //console.table($scope.parts);
        focusOn("part" + atIndex);
        $scope.parts[atIndex].localState = "Sending";
        parts.post($scope.parts[atIndex]).success(function (data) {
            console.log("post success");
            console.table(data);
            $scope.parts[atIndex].ID = data.ID;
            $scope.parts[atIndex].localState = "OK";
        }).error(function () {
            $scope.parts[atIndex].localState = "Problem";
        });
    }

    function partsCheckForNull(){
        if ($scope.parts.length == 0 || $scope.parts == null) {
            addPart();
        }
    }
});
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
app.factory('parts', ['$http', function ($http) {

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
        return $http({
            method: 'PUT',
            url: '/api/Parts/'+part.ID,
            data: part,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    return parts;
}]);
(function () {
    'use strict';

    
})();

var app = angular.module('ConsoleNotepad', [
        // Angular modules 
        'ngRoute'

        // Custom modules 

        // 3rd Party Modules

]);

//app.directive('contenteditable', function () {
//    return {
//        restrict: 'A', // only activate on element attribute
//        require: '?ngModel', // get a hold of NgModelController
//        link: function (scope, element, attrs, ngModel) {
//            if (!ngModel) return; // do nothing if no ng-model

//            // Specify how UI should be updated
//            ngModel.$render = function () {
//                element.html(ngModel.$viewValue || '');
//            };

//            // Listen for change events to enable binding
//            element.on('blur keyup change', function () {
//                scope.$apply(read);
//            });
//            read(); // initialize

//            // Write data to the model
//            function read() {
//                var html = element.html();
//                // When we clear the content editable the browser leaves a <br> behind
//                // If strip-br attribute is provided then we strip this out
//                if (attrs.stripBr && html == '<br>') {
//                    html = '';
//                }
//                ngModel.$setViewValue(html);
//            }
//        }
//    };
//});

app.directive('contenteditable', [function () {
    return {
        require: '?ngModel',
        scope: {

        },
        link: function (scope, element, attrs, ctrl) {
            // view -> model (when div gets blur update the view value of the model)
            element.bind('blur keyup change', function () {
                scope.$apply(function () {
                    ctrl.$setViewValue(element.html());
                });
            });

            // model -> view
            ctrl.$render = function () {
                element.html(ctrl.$viewValue);
            };

            // load init value from DOM
            ctrl.$render();

            // remove the attached events to element when destroying the scope
            scope.$on('$destroy', function () {
                element.unbind('blur');
                element.unbind('paste');
                element.unbind('focus');
            });
        }
    };
}]);
app.directive('focusOn', function () {
    return function (scope, elem, attr) {
        scope.$on('focusOn', function (e, name) {
            if (name === attr.focusOn) {
                elem[0].focus();
            }
        });
    };
});

app.factory('focusOn', function ($rootScope, $timeout) {
    return function (name) {
        $timeout(function () {
            $rootScope.$broadcast('focusOn', name);
        });
    }
});
app.controller('editorController', function ($scope, notes, parts, focusOn) {
    $scope.suggestions = {};
    $scope.highlightedSuggestion = -1;
    $scope.currentNoteId = 0;
    $scope.parts = [
        {
            Data: "new"
        }
    ];
    var timeoutUpdate; //setTimeout to update Part
    var editingPartOptions = {};
    $scope.focusOnPart = 0;

    $scope.smartBarKeyDown = function (event) {
        //console.log("Refresh " + event.keyCode)
        if (event.keyCode == 32) { //space
            $scope.suggestions = notes.getSuggested($scope.smartBar).success(function (data) {
                console.table(data);
                $scope.suggestions = data;
            });
            console.log("Suggestions refreshed");
        }

        if (event.keyCode == 40 && $scope.highlightedSuggestion < $scope.suggestions.length-1) { //arrow down
            //sterowanie po menu
            event.preventDefault();
            $scope.highlightedSuggestion++;
        }
        if (event.keyCode == 38 && $scope.highlightedSuggestion > -1) { //arrow up
            event.preventDefault();
            $scope.highlightedSuggestion--;
        }

        if (event.keyCode == 13 && $scope.highlightedSuggestion > -1) { //enter
            //uzupełnij inputa, zacznij pisanie notatki
            //console.table($scope.suggestions[$scope.highlightedSuggestion].NoteTags);

            $scope.smartBar = "";

            var note = $scope.suggestions[$scope.highlightedSuggestion];
            console.table(note);

            //uzupelniam smartBar o wybrane tagi
            for (var nt in note.NoteTags) {
                $scope.smartBar += note.NoteTags[nt].Tag.Name + " ";
            }

            $scope.currentNoteId = note.NoteId;
            $scope.parts = parts.get($scope.currentNoteId).success(function (data) {
                $scope.parts = data;
                console.log("Got data: ");
                console.table(data);
                partsCheckForNull();
            });

        }
    }

    $scope.editingPartKeyDown = function (event, partObjIndex) {

        //aktualizuj co jakis czas
        clearTimeout(timeoutUpdate);
        timeoutUpdate = setTimeout(function () { updatePart(partObjIndex) }, 1000);
        $scope.parts[partObjIndex].localState = "Sending";

        //2x enter dodaje nowy part
        var partObj = $scope.parts[partObjIndex];
        if (event.keyCode == 13 && /\s*<br>\s*<br>\s*$/.test(partObj.Data)) { //enter
            $scope.parts[partObjIndex].Data = $scope.parts[partObjIndex].Data.replace(/\s*<br>\s*$/g, "");
            addPart(partObjIndex);
            event.preventDefault(); //żeby nie dawało już tego entera
        }

    }
    
    function updatePart(index) {
        //console.log("update");
        $scope.parts[index].localState = "Sending";
        var partObj = $scope.parts[index];
        parts.put(partObj).success(function () {
            $scope.parts[index].localState = "OK";
        }).error(function () {
            $scope.parts[index].localState = "Problem";
        });
    }

    function addPart(lastIndex) {
        //$scope.parts.push({ Data: "new" });
        //console.log("lastIndex: " + lastIndex);
        //console.table($scope.parts);
        var atIndex = lastIndex + 1;
        if (lastIndex == null) {
            atIndex = 0;
        }

        $scope.parts.splice(atIndex, 0, { Data: "new", NoteID: $scope.currentNoteId }); //add at index
        //console.log("after");
        //console.table($scope.parts);
        focusOn("part" + atIndex);
        $scope.parts[atIndex].localState = "Sending";
        parts.post($scope.parts[atIndex]).success(function (data) {
            console.log("post success");
            console.table(data);
            $scope.parts[atIndex].ID = data.ID;
            $scope.parts[atIndex].localState = "OK";
        }).error(function () {
            $scope.parts[atIndex].localState = "Problem";
        });
    }

    function partsCheckForNull(){
        if ($scope.parts.length == 0 || $scope.parts == null) {
            addPart();
        }
    }
});
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
app.factory('parts', ['$http', function ($http) {

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
        return $http({
            method: 'PUT',
            url: '/api/Parts/'+part.ID,
            data: part,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    return parts;
}]);
(function () {
    'use strict';

    
})();

var app = angular.module('ConsoleNotepad', [
        // Angular modules 
        'ngRoute'

        // Custom modules 

        // 3rd Party Modules

]);

//app.directive('contenteditable', function () {
//    return {
//        restrict: 'A', // only activate on element attribute
//        require: '?ngModel', // get a hold of NgModelController
//        link: function (scope, element, attrs, ngModel) {
//            if (!ngModel) return; // do nothing if no ng-model

//            // Specify how UI should be updated
//            ngModel.$render = function () {
//                element.html(ngModel.$viewValue || '');
//            };

//            // Listen for change events to enable binding
//            element.on('blur keyup change', function () {
//                scope.$apply(read);
//            });
//            read(); // initialize

//            // Write data to the model
//            function read() {
//                var html = element.html();
//                // When we clear the content editable the browser leaves a <br> behind
//                // If strip-br attribute is provided then we strip this out
//                if (attrs.stripBr && html == '<br>') {
//                    html = '';
//                }
//                ngModel.$setViewValue(html);
//            }
//        }
//    };
//});

app.directive('contenteditable', [function () {
    return {
        require: '?ngModel',
        scope: {

        },
        link: function (scope, element, attrs, ctrl) {
            // view -> model (when div gets blur update the view value of the model)
            element.bind('blur keyup change', function () {
                scope.$apply(function () {
                    ctrl.$setViewValue(element.html());
                });
            });

            // model -> view
            ctrl.$render = function () {
                element.html(ctrl.$viewValue);
            };

            // load init value from DOM
            ctrl.$render();

            // remove the attached events to element when destroying the scope
            scope.$on('$destroy', function () {
                element.unbind('blur');
                element.unbind('paste');
                element.unbind('focus');
            });
        }
    };
}]);
app.directive('focusOn', function () {
    return function (scope, elem, attr) {
        scope.$on('focusOn', function (e, name) {
            if (name === attr.focusOn) {
                elem[0].focus();
            }
        });
    };
});

app.factory('focusOn', function ($rootScope, $timeout) {
    return function (name) {
        $timeout(function () {
            $rootScope.$broadcast('focusOn', name);
        });
    }
});
app.controller('editorController', function ($scope, notes, parts, focusOn) {
    $scope.suggestions = {};
    $scope.highlightedSuggestion = -1;
    $scope.currentNoteId = 0;
    $scope.parts = [
        {
            Data: "new"
        }
    ];
    var timeoutUpdate; //setTimeout to update Part
    var editingPartOptions = {};
    $scope.focusOnPart = 0;

    $scope.smartBarKeyDown = function (event) {
        //console.log("Refresh " + event.keyCode)
        if (event.keyCode == 32) { //space
            $scope.suggestions = notes.getSuggested($scope.smartBar).success(function (data) {
                console.table(data);
                $scope.suggestions = data;
            });
            console.log("Suggestions refreshed");
        }

        if (event.keyCode == 40 && $scope.highlightedSuggestion < $scope.suggestions.length-1) { //arrow down
            //sterowanie po menu
            event.preventDefault();
            $scope.highlightedSuggestion++;
        }
        if (event.keyCode == 38 && $scope.highlightedSuggestion > -1) { //arrow up
            event.preventDefault();
            $scope.highlightedSuggestion--;
        }

        if (event.keyCode == 13 && $scope.highlightedSuggestion > -1) { //enter
            //uzupełnij inputa, zacznij pisanie notatki
            //console.table($scope.suggestions[$scope.highlightedSuggestion].NoteTags);

            $scope.smartBar = "";

            var note = $scope.suggestions[$scope.highlightedSuggestion];
            console.table(note);

            //uzupelniam smartBar o wybrane tagi
            for (var nt in note.NoteTags) {
                $scope.smartBar += note.NoteTags[nt].Tag.Name + " ";
            }

            $scope.currentNoteId = note.NoteId;
            $scope.parts = parts.get($scope.currentNoteId).success(function (data) {
                $scope.parts = data;
                console.log("Got data: ");
                console.table(data);
                partsCheckForNull();
            });

        }
    }

    $scope.editingPartKeyDown = function (event, partObjIndex) {

        //aktualizuj co jakis czas
        clearTimeout(timeoutUpdate);
        timeoutUpdate = setTimeout(function () { updatePart(partObjIndex) }, 1000);
        $scope.parts[partObjIndex].localState = "Sending";

        //2x enter dodaje nowy part
        var partObj = $scope.parts[partObjIndex];
        if (event.keyCode == 13 && /\s*<br>\s*<br>\s*$/.test(partObj.Data)) { //enter
            $scope.parts[partObjIndex].Data = $scope.parts[partObjIndex].Data.replace(/\s*<br>\s*$/g, "");
            addPart(partObjIndex);
            event.preventDefault(); //żeby nie dawało już tego entera
        }

    }
    
    function updatePart(index) {
        $scope.parts[index].localState = "Sending";
        var partObj = $scope.parts[index];
        parts.put(partObj).success(function () {
            $scope.parts[index].localState = "OK";
        }).error(function () {
            $scope.parts[index].localState = "Problem";
        });
    }

    function addPart(lastIndex) {
        //$scope.parts.push({ Data: "new" });
        //console.log("lastIndex: " + lastIndex);
        //console.table($scope.parts);
        var atIndex = lastIndex + 1;
        if (lastIndex == null) {
            atIndex = 0;
        }

        $scope.parts.splice(atIndex, 0, { Data: "new", NoteID: $scope.currentNoteId }); //add at index
        //console.log("after");
        //console.table($scope.parts);
        focusOn("part" + atIndex);
        $scope.parts[atIndex].localState = "Sending";
        parts.post($scope.parts[atIndex]).success(function (data) {
            console.log("post success");
            console.table(data);
            $scope.parts[atIndex].ID = data.ID;
            $scope.parts[atIndex].localState = "OK";
        }).error(function () {
            $scope.parts[atIndex].localState = "Problem";
        });
    }

    function partsCheckForNull(){
        if ($scope.parts.length == 0 || $scope.parts == null) {
            addPart();
        }
    }
});
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
app.factory('parts', ['$http', function ($http) {

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
        return $http({
            method: 'PUT',
            url: '/api/Parts/'+part.ID,
            data: part,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    return parts;
}]);
(function () {
    'use strict';

    
})();

var app = angular.module('ConsoleNotepad', [
        // Angular modules 
        'ngRoute'

        // Custom modules 

        // 3rd Party Modules

]);

//app.directive('contenteditable', function () {
//    return {
//        restrict: 'A', // only activate on element attribute
//        require: '?ngModel', // get a hold of NgModelController
//        link: function (scope, element, attrs, ngModel) {
//            if (!ngModel) return; // do nothing if no ng-model

//            // Specify how UI should be updated
//            ngModel.$render = function () {
//                element.html(ngModel.$viewValue || '');
//            };

//            // Listen for change events to enable binding
//            element.on('blur keyup change', function () {
//                scope.$apply(read);
//            });
//            read(); // initialize

//            // Write data to the model
//            function read() {
//                var html = element.html();
//                // When we clear the content editable the browser leaves a <br> behind
//                // If strip-br attribute is provided then we strip this out
//                if (attrs.stripBr && html == '<br>') {
//                    html = '';
//                }
//                ngModel.$setViewValue(html);
//            }
//        }
//    };
//});

app.directive('contenteditable', [function () {
    return {
        require: '?ngModel',
        scope: {

        },
        link: function (scope, element, attrs, ctrl) {
            // view -> model (when div gets blur update the view value of the model)
            element.bind('blur keyup change', function () {
                scope.$apply(function () {
                    ctrl.$setViewValue(element.html());
                });
            });

            // model -> view
            ctrl.$render = function () {
                element.html(ctrl.$viewValue);
            };

            // load init value from DOM
            ctrl.$render();

            // remove the attached events to element when destroying the scope
            scope.$on('$destroy', function () {
                element.unbind('blur');
                element.unbind('paste');
                element.unbind('focus');
            });
        }
    };
}]);
app.directive('focusOn', function () {
    return function (scope, elem, attr) {
        scope.$on('focusOn', function (e, name) {
            if (name === attr.focusOn) {
                elem[0].focus();
            }
        });
    };
});

app.factory('focusOn', function ($rootScope, $timeout) {
    return function (name) {
        $timeout(function () {
            $rootScope.$broadcast('focusOn', name);
        });
    }
});
app.controller('editorController', function ($scope, notes, parts, focusOn) {
    $scope.suggestions = {};
    $scope.highlightedSuggestion = -1;
    $scope.currentNoteId = 0;
    $scope.parts = [
        {
            Data: "new"
        }
    ];
    var timeoutUpdate; //setTimeout to update Part
    var editingPartOptions = {};
    $scope.focusOnPart = 0;

    $scope.smartBarKeyDown = function (event) {
        //console.log("Refresh " + event.keyCode)
        if (event.keyCode == 32) { //space
            $scope.suggestions = notes.getSuggested($scope.smartBar).success(function (data) {
                console.table(data);
                $scope.suggestions = data;
            });
            console.log("Suggestions refreshed");
        }

        if (event.keyCode == 40 && $scope.highlightedSuggestion < $scope.suggestions.length-1) { //arrow down
            //sterowanie po menu
            event.preventDefault();
            $scope.highlightedSuggestion++;
        }
        if (event.keyCode == 38 && $scope.highlightedSuggestion > -1) { //arrow up
            event.preventDefault();
            $scope.highlightedSuggestion--;
        }

        if (event.keyCode == 13 && $scope.highlightedSuggestion > -1) { //enter
            //uzupełnij inputa, zacznij pisanie notatki
            //console.table($scope.suggestions[$scope.highlightedSuggestion].NoteTags);

            $scope.smartBar = "";

            var note = $scope.suggestions[$scope.highlightedSuggestion];
            console.table(note);

            //uzupelniam smartBar o wybrane tagi
            for (var nt in note.NoteTags) {
                $scope.smartBar += note.NoteTags[nt].Tag.Name + " ";
            }

            $scope.currentNoteId = note.NoteId;
            $scope.parts = parts.get($scope.currentNoteId).success(function (data) {
                $scope.parts = data;
                console.log("Got data: ");
                console.table(data);
                partsCheckForNull();
            });

        }
    }

    $scope.editingPartKeyDown = function (event, partObjIndex) {

        //aktualizuj co jakis czas
        clearTimeout(timeoutUpdate);
        timeoutUpdate = setTimeout(function () { updatePart(partObjIndex) }, 1000);
        $scope.parts[partObjIndex].localState = "Sending";

        //2x enter dodaje nowy part
        var partObj = $scope.parts[partObjIndex];
        if (event.keyCode == 13 && /\s*<br>\s*<br>\s*$/.test(partObj.Data)) { //enter
            $scope.parts[partObjIndex].Data = $scope.parts[partObjIndex].Data.replace(/\s*<br>\s*$/g, "");
            addPart(partObjIndex);
            event.preventDefault(); //żeby nie dawało już tego entera
        }

    }
    
    function updatePart(index) {

        $scope.parts[index].localState = "Sending";
        var partObj = ;
        parts.put($scope.parts[index]).success(function () {
            $scope.parts[index].localState = "OK";
        }).error(function () {
            $scope.parts[index].localState = "Problem";
        });

    }

    function addPart(lastIndex) {
        //$scope.parts.push({ Data: "new" });
        //console.log("lastIndex: " + lastIndex);
        //console.table($scope.parts);
        var atIndex = lastIndex + 1;
        if (lastIndex == null) {
            atIndex = 0;
        }

        $scope.parts.splice(atIndex, 0, { Data: "new", NoteID: $scope.currentNoteId }); //add at index
        //console.log("after");
        //console.table($scope.parts);
        focusOn("part" + atIndex);
        $scope.parts[atIndex].localState = "Sending";
        parts.post($scope.parts[atIndex]).success(function (data) {
            console.log("post success");
            console.table(data);
            $scope.parts[atIndex].ID = data.ID;
            $scope.parts[atIndex].localState = "OK";
        }).error(function () {
            $scope.parts[atIndex].localState = "Problem";
        });
    }

    function partsCheckForNull(){
        if ($scope.parts.length == 0 || $scope.parts == null) {
            addPart();
        }
    }
});
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
app.factory('parts', ['$http', function ($http) {

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
        return $http({
            method: 'PUT',
            url: '/api/Parts/'+part.ID,
            data: part,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    return parts;
}]);
(function () {
    'use strict';

    
})();

var app = angular.module('ConsoleNotepad', [
        // Angular modules 
        'ngRoute'

        // Custom modules 

        // 3rd Party Modules

]);

//app.directive('contenteditable', function () {
//    return {
//        restrict: 'A', // only activate on element attribute
//        require: '?ngModel', // get a hold of NgModelController
//        link: function (scope, element, attrs, ngModel) {
//            if (!ngModel) return; // do nothing if no ng-model

//            // Specify how UI should be updated
//            ngModel.$render = function () {
//                element.html(ngModel.$viewValue || '');
//            };

//            // Listen for change events to enable binding
//            element.on('blur keyup change', function () {
//                scope.$apply(read);
//            });
//            read(); // initialize

//            // Write data to the model
//            function read() {
//                var html = element.html();
//                // When we clear the content editable the browser leaves a <br> behind
//                // If strip-br attribute is provided then we strip this out
//                if (attrs.stripBr && html == '<br>') {
//                    html = '';
//                }
//                ngModel.$setViewValue(html);
//            }
//        }
//    };
//});

app.directive('contenteditable', [function () {
    return {
        require: '?ngModel',
        scope: {

        },
        link: function (scope, element, attrs, ctrl) {
            // view -> model (when div gets blur update the view value of the model)
            element.bind('blur keyup change', function () {
                scope.$apply(function () {
                    ctrl.$setViewValue(element.html());
                });
            });

            // model -> view
            ctrl.$render = function () {
                element.html(ctrl.$viewValue);
            };

            // load init value from DOM
            ctrl.$render();

            // remove the attached events to element when destroying the scope
            scope.$on('$destroy', function () {
                element.unbind('blur');
                element.unbind('paste');
                element.unbind('focus');
            });
        }
    };
}]);
app.directive('focusOn', function () {
    return function (scope, elem, attr) {
        scope.$on('focusOn', function (e, name) {
            if (name === attr.focusOn) {
                elem[0].focus();
            }
        });
    };
});

app.factory('focusOn', function ($rootScope, $timeout) {
    return function (name) {
        $timeout(function () {
            $rootScope.$broadcast('focusOn', name);
        });
    }
});
app.controller('editorController', function ($scope, notes, parts, focusOn) {
    $scope.suggestions = {};
    $scope.highlightedSuggestion = -1;
    $scope.currentNoteId = 0;
    $scope.parts = [
        {
            Data: "new"
        }
    ];
    var timeoutUpdate; //setTimeout to update Part
    var editingPartOptions = {};
    $scope.focusOnPart = 0;

    $scope.smartBarKeyDown = function (event) {
        //console.log("Refresh " + event.keyCode)
        if (event.keyCode == 32) { //space
            $scope.suggestions = notes.getSuggested($scope.smartBar).success(function (data) {
                console.table(data);
                $scope.suggestions = data;
            });
            console.log("Suggestions refreshed");
        }

        if (event.keyCode == 40 && $scope.highlightedSuggestion < $scope.suggestions.length-1) { //arrow down
            //sterowanie po menu
            event.preventDefault();
            $scope.highlightedSuggestion++;
        }
        if (event.keyCode == 38 && $scope.highlightedSuggestion > -1) { //arrow up
            event.preventDefault();
            $scope.highlightedSuggestion--;
        }

        if (event.keyCode == 13 && $scope.highlightedSuggestion > -1) { //enter
            //uzupełnij inputa, zacznij pisanie notatki
            //console.table($scope.suggestions[$scope.highlightedSuggestion].NoteTags);

            $scope.smartBar = "";

            var note = $scope.suggestions[$scope.highlightedSuggestion];
            console.table(note);

            //uzupelniam smartBar o wybrane tagi
            for (var nt in note.NoteTags) {
                $scope.smartBar += note.NoteTags[nt].Tag.Name + " ";
            }

            $scope.currentNoteId = note.NoteId;
            $scope.parts = parts.get($scope.currentNoteId).success(function (data) {
                $scope.parts = data;
                console.log("Got data: ");
                console.table(data);
                partsCheckForNull();
            });

        }
    }

    $scope.editingPartKeyDown = function (event, partObjIndex) {

        //aktualizuj co jakis czas
        clearTimeout(timeoutUpdate);
        timeoutUpdate = setTimeout(function () { updatePart(partObjIndex) }, 1000);
        $scope.parts[partObjIndex].localState = "Sending";

        //2x enter dodaje nowy part
        var partObj = $scope.parts[partObjIndex];
        if (event.keyCode == 13 && /\s*<br>\s*<br>\s*$/.test(partObj.Data)) { //enter
            $scope.parts[partObjIndex].Data = $scope.parts[partObjIndex].Data.replace(/\s*<br>\s*$/g, "");
            addPart(partObjIndex);
            event.preventDefault(); //żeby nie dawało już tego entera
        }

    }
    
    function updatePart(index) {

        $scope.parts[index].localState = "Sending";
        parts.put($scope.parts[index]).success(function () {
            $scope.parts[index].localState = "OK";
        }).error(function () {
            $scope.parts[index].localState = "Problem";
        });

    }

    function addPart(lastIndex) {
        //$scope.parts.push({ Data: "new" });
        //console.log("lastIndex: " + lastIndex);
        //console.table($scope.parts);
        var atIndex = lastIndex + 1;
        if (lastIndex == null) {
            atIndex = 0;
        }

        $scope.parts.splice(atIndex, 0, { Data: "new", NoteID: $scope.currentNoteId }); //add at index
        //console.log("after");
        //console.table($scope.parts);
        focusOn("part" + atIndex);
        $scope.parts[atIndex].localState = "Sending";
        parts.post($scope.parts[atIndex]).success(function (data) {
            console.log("post success");
            console.table(data);
            $scope.parts[atIndex].ID = data.ID;
            $scope.parts[atIndex].localState = "OK";
        }).error(function () {
            $scope.parts[atIndex].localState = "Problem";
        });
    }

    function partsCheckForNull(){
        if ($scope.parts.length == 0 || $scope.parts == null) {
            addPart();
        }
    }
});
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
app.factory('parts', ['$http', function ($http) {

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
        return $http({
            method: 'PUT',
            url: '/api/Parts/'+part.ID,
            data: part,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    return parts;
}]);
(function () {
    'use strict';

    
})();

var app = angular.module('ConsoleNotepad', [
        // Angular modules 
        'ngRoute'

        // Custom modules 

        // 3rd Party Modules

]);

//app.directive('contenteditable', function () {
//    return {
//        restrict: 'A', // only activate on element attribute
//        require: '?ngModel', // get a hold of NgModelController
//        link: function (scope, element, attrs, ngModel) {
//            if (!ngModel) return; // do nothing if no ng-model

//            // Specify how UI should be updated
//            ngModel.$render = function () {
//                element.html(ngModel.$viewValue || '');
//            };

//            // Listen for change events to enable binding
//            element.on('blur keyup change', function () {
//                scope.$apply(read);
//            });
//            read(); // initialize

//            // Write data to the model
//            function read() {
//                var html = element.html();
//                // When we clear the content editable the browser leaves a <br> behind
//                // If strip-br attribute is provided then we strip this out
//                if (attrs.stripBr && html == '<br>') {
//                    html = '';
//                }
//                ngModel.$setViewValue(html);
//            }
//        }
//    };
//});

app.directive('contenteditable', [function () {
    return {
        require: '?ngModel',
        scope: {

        },
        link: function (scope, element, attrs, ctrl) {
            // view -> model (when div gets blur update the view value of the model)
            element.bind('blur keyup change', function () {
                scope.$apply(function () {
                    ctrl.$setViewValue(element.html());
                });
            });

            // model -> view
            ctrl.$render = function () {
                element.html(ctrl.$viewValue);
            };

            // load init value from DOM
            ctrl.$render();

            // remove the attached events to element when destroying the scope
            scope.$on('$destroy', function () {
                element.unbind('blur');
                element.unbind('paste');
                element.unbind('focus');
            });
        }
    };
}]);
app.directive('focusOn', function () {
    return function (scope, elem, attr) {
        scope.$on('focusOn', function (e, name) {
            if (name === attr.focusOn) {
                elem[0].focus();
            }
        });
    };
});

app.factory('focusOn', function ($rootScope, $timeout) {
    return function (name) {
        $timeout(function () {
            $rootScope.$broadcast('focusOn', name);
        });
    }
});
app.controller('editorController', function ($scope, notes, parts, focusOn) {
    $scope.suggestions = {};
    $scope.highlightedSuggestion = -1;
    $scope.currentNoteId = 0;
    $scope.parts = [
        {
            Data: "new"
        }
    ];
    var timeoutUpdate; //setTimeout to update Part
    var editingPartOptions = {};
    $scope.focusOnPart = 0;

    $scope.smartBarKeyDown = function (event) {
        //console.log("Refresh " + event.keyCode)
        if (event.keyCode == 32) { //space
            $scope.suggestions = notes.getSuggested($scope.smartBar).success(function (data) {
                console.table(data);
                $scope.suggestions = data;
            });
            console.log("Suggestions refreshed");
        }

        if (event.keyCode == 40 && $scope.highlightedSuggestion < $scope.suggestions.length-1) { //arrow down
            //sterowanie po menu
            event.preventDefault();
            $scope.highlightedSuggestion++;
        }
        if (event.keyCode == 38 && $scope.highlightedSuggestion > -1) { //arrow up
            event.preventDefault();
            $scope.highlightedSuggestion--;
        }

        if (event.keyCode == 13 && $scope.highlightedSuggestion > -1) { //enter
            //uzupełnij inputa, zacznij pisanie notatki
            //console.table($scope.suggestions[$scope.highlightedSuggestion].NoteTags);

            $scope.smartBar = "";

            var note = $scope.suggestions[$scope.highlightedSuggestion];
            console.table(note);

            //uzupelniam smartBar o wybrane tagi
            for (var nt in note.NoteTags) {
                $scope.smartBar += note.NoteTags[nt].Tag.Name + " ";
            }

            $scope.currentNoteId = note.NoteId;
            $scope.parts = parts.get($scope.currentNoteId).success(function (data) {
                $scope.parts = data;
                console.log("Got data: ");
                console.table(data);
                partsCheckForNull();
            });

        }
    }

    $scope.editingPartKeyDown = function (event, partObjIndex) {

        //aktualizuj co jakis czas
        clearTimeout(timeoutUpdate);
        timeoutUpdate = setTimeout(function () { updatePart(partObjIndex) }, 1000);
        $scope.parts[partObjIndex].localState = "Sending";

        //2x enter dodaje nowy part
        var partObj = $scope.parts[partObjIndex];
        if (event.keyCode == 13 && /\s*<br>\s*<br>\s*$/.test(partObj.Data)) { //enter
            $scope.parts[partObjIndex].Data = $scope.parts[partObjIndex].Data.replace(/\s*<br>\s*$/g, "");
            addPart(partObjIndex);
            event.preventDefault(); //żeby nie dawało już tego entera
        }

    }
    
    function updatePart(index) {

        $scope.parts[index].localState = "Sending";

        parts.put($scope.parts[index]).success(function () {
            $scope.parts[index].localState = "OK";
        }).error(function () {
            $scope.parts[index].localState = "Problem";
        });

    }

    function addPart(lastIndex) {
        //$scope.parts.push({ Data: "new" });
        //console.log("lastIndex: " + lastIndex);
        //console.table($scope.parts);
        var atIndex = lastIndex + 1;
        if (lastIndex == null) {
            atIndex = 0;
        }

        $scope.parts.splice(atIndex, 0, { Data: "new", NoteID: $scope.currentNoteId }); //add at index
        //console.log("after");
        //console.table($scope.parts);
        focusOn("part" + atIndex);
        $scope.parts[atIndex].localState = "Sending";
        parts.post($scope.parts[atIndex]).success(function (data) {
            console.log("post success");
            console.table(data);
            $scope.parts[atIndex].ID = data.ID;
            $scope.parts[atIndex].localState = "OK";
        }).error(function () {
            $scope.parts[atIndex].localState = "Problem";
        });
    }

    function partsCheckForNull(){
        if ($scope.parts.length == 0 || $scope.parts == null) {
            addPart();
        }
    }
});
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
app.factory('parts', ['$http', function ($http) {

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
        return $http({
            method: 'PUT',
            url: '/api/Parts/'+part.ID,
            data: part,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    return parts;
}]);
(function () {
    'use strict';

    
})();

var app = angular.module('ConsoleNotepad', [
        // Angular modules 
        'ngRoute'

        // Custom modules 

        // 3rd Party Modules

]);

//app.directive('contenteditable', function () {
//    return {
//        restrict: 'A', // only activate on element attribute
//        require: '?ngModel', // get a hold of NgModelController
//        link: function (scope, element, attrs, ngModel) {
//            if (!ngModel) return; // do nothing if no ng-model

//            // Specify how UI should be updated
//            ngModel.$render = function () {
//                element.html(ngModel.$viewValue || '');
//            };

//            // Listen for change events to enable binding
//            element.on('blur keyup change', function () {
//                scope.$apply(read);
//            });
//            read(); // initialize

//            // Write data to the model
//            function read() {
//                var html = element.html();
//                // When we clear the content editable the browser leaves a <br> behind
//                // If strip-br attribute is provided then we strip this out
//                if (attrs.stripBr && html == '<br>') {
//                    html = '';
//                }
//                ngModel.$setViewValue(html);
//            }
//        }
//    };
//});

app.directive('contenteditable', [function () {
    return {
        require: '?ngModel',
        scope: {

        },
        link: function (scope, element, attrs, ctrl) {
            // view -> model (when div gets blur update the view value of the model)
            element.bind('blur keyup change', function () {
                scope.$apply(function () {
                    ctrl.$setViewValue(element.html());
                });
            });

            // model -> view
            ctrl.$render = function () {
                element.html(ctrl.$viewValue);
            };

            // load init value from DOM
            ctrl.$render();

            // remove the attached events to element when destroying the scope
            scope.$on('$destroy', function () {
                element.unbind('blur');
                element.unbind('paste');
                element.unbind('focus');
            });
        }
    };
}]);
app.directive('focusOn', function () {
    return function (scope, elem, attr) {
        scope.$on('focusOn', function (e, name) {
            if (name === attr.focusOn) {
                elem[0].focus();
            }
        });
    };
});

app.factory('focusOn', function ($rootScope, $timeout) {
    return function (name) {
        $timeout(function () {
            $rootScope.$broadcast('focusOn', name);
        });
    }
});
app.controller('editorController', function ($scope, notes, parts, focusOn) {
    $scope.suggestions = {};
    $scope.highlightedSuggestion = -1;
    $scope.currentNoteId = 0;
    $scope.parts = [
        {
            Data: "new"
        }
    ];
    var timeoutUpdate; //setTimeout to update Part
    var editingPartOptions = {};
    $scope.focusOnPart = 0;

    $scope.smartBarKeyDown = function (event) {
        //console.log("Refresh " + event.keyCode)
        if (event.keyCode == 32) { //space
            $scope.suggestions = notes.getSuggested($scope.smartBar).success(function (data) {
                console.table(data);
                $scope.suggestions = data;
            });
            console.log("Suggestions refreshed");
        }

        if (event.keyCode == 40 && $scope.highlightedSuggestion < $scope.suggestions.length-1) { //arrow down
            //sterowanie po menu
            event.preventDefault();
            $scope.highlightedSuggestion++;
        }
        if (event.keyCode == 38 && $scope.highlightedSuggestion > -1) { //arrow up
            event.preventDefault();
            $scope.highlightedSuggestion--;
        }

        if (event.keyCode == 13 && $scope.highlightedSuggestion > -1) { //enter
            //uzupełnij inputa, zacznij pisanie notatki
            //console.table($scope.suggestions[$scope.highlightedSuggestion].NoteTags);

            $scope.smartBar = "";

            var note = $scope.suggestions[$scope.highlightedSuggestion];
            console.table(note);

            //uzupelniam smartBar o wybrane tagi
            for (var nt in note.NoteTags) {
                $scope.smartBar += note.NoteTags[nt].Tag.Name + " ";
            }

            $scope.currentNoteId = note.NoteId;
            $scope.parts = parts.get($scope.currentNoteId).success(function (data) {
                $scope.parts = data;
                console.log("Got data: ");
                console.table(data);
                partsCheckForNull();
            });

        }
    }

    $scope.editingPartKeyDown = function (event, partObjIndex) {

        //aktualizuj co jakis czas
        clearTimeout(timeoutUpdate);
        timeoutUpdate = setTimeout(function () { updatePart(partObjIndex) }, 1000);
        $scope.parts[partObjIndex].localState = "Sending";

        //2x enter dodaje nowy part
        var partObj = $scope.parts[partObjIndex];
        if (event.keyCode == 13 && /\s*<br>\s*<br>\s*$/.test(partObj.Data)) { //enter
            $scope.parts[partObjIndex].Data = $scope.parts[partObjIndex].Data.replace(/\s*<br>\s*$/g, "");
            addPart(partObjIndex);
            event.preventDefault(); //żeby nie dawało już tego entera
        }

    }
    
    function updatePart(index) {

        $scope.parts[index].localState = "Sending";

        parts.put($scope.parts[index]).success(function () {
            $scope.parts[index].localState = "OK";
        }).error(function () {
            $scope.parts[index].localState = "Problem";
        });

    }

    function addPart(lastIndex) {;
        var atIndex = lastIndex + 1;
        if (lastIndex == null) {
            atIndex = 0;
        }

        $scope.parts.splice(atIndex, 0, { Data: "new", NoteID: $scope.currentNoteId }); //add at index
        //console.log("after");
        //console.table($scope.parts);
        focusOn("part" + atIndex);
        $scope.parts[atIndex].localState = "Sending";
        parts.post($scope.parts[atIndex]).success(function (data) {
            console.log("post success");
            console.table(data);
            $scope.parts[atIndex].ID = data.ID;
            $scope.parts[atIndex].localState = "OK";
        }).error(function () {
            $scope.parts[atIndex].localState = "Problem";
        });
    }

    function partsCheckForNull(){
        if ($scope.parts.length == 0 || $scope.parts == null) {
            addPart();
        }
    }
});
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
app.factory('parts', ['$http', function ($http) {

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
        return $http({
            method: 'PUT',
            url: '/api/Parts/'+part.ID,
            data: part,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    return parts;
}]);
(function () {
    'use strict';

    
})();

var app = angular.module('ConsoleNotepad', [
        // Angular modules 
        'ngRoute'

        // Custom modules 

        // 3rd Party Modules

]);

//app.directive('contenteditable', function () {
//    return {
//        restrict: 'A', // only activate on element attribute
//        require: '?ngModel', // get a hold of NgModelController
//        link: function (scope, element, attrs, ngModel) {
//            if (!ngModel) return; // do nothing if no ng-model

//            // Specify how UI should be updated
//            ngModel.$render = function () {
//                element.html(ngModel.$viewValue || '');
//            };

//            // Listen for change events to enable binding
//            element.on('blur keyup change', function () {
//                scope.$apply(read);
//            });
//            read(); // initialize

//            // Write data to the model
//            function read() {
//                var html = element.html();
//                // When we clear the content editable the browser leaves a <br> behind
//                // If strip-br attribute is provided then we strip this out
//                if (attrs.stripBr && html == '<br>') {
//                    html = '';
//                }
//                ngModel.$setViewValue(html);
//            }
//        }
//    };
//});

app.directive('contenteditable', [function () {
    return {
        require: '?ngModel',
        scope: {

        },
        link: function (scope, element, attrs, ctrl) {
            // view -> model (when div gets blur update the view value of the model)
            element.bind('blur keyup change', function () {
                scope.$apply(function () {
                    ctrl.$setViewValue(element.html());
                });
            });

            // model -> view
            ctrl.$render = function () {
                element.html(ctrl.$viewValue);
            };

            // load init value from DOM
            ctrl.$render();

            // remove the attached events to element when destroying the scope
            scope.$on('$destroy', function () {
                element.unbind('blur');
                element.unbind('paste');
                element.unbind('focus');
            });
        }
    };
}]);
app.directive('focusOn', function () {
    return function (scope, elem, attr) {
        scope.$on('focusOn', function (e, name) {
            if (name === attr.focusOn) {
                elem[0].focus();
            }
        });
    };
});

app.factory('focusOn', function ($rootScope, $timeout) {
    return function (name) {
        $timeout(function () {
            $rootScope.$broadcast('focusOn', name);
        });
    }
});
app.controller('editorController', function ($scope, notes, parts, focusOn) {
    $scope.suggestions = {};
    $scope.highlightedSuggestion = -1;
    $scope.currentNoteId = 0;
    $scope.parts = [
        {
            Data: "new"
        }
    ];
    var timeoutUpdate; //setTimeout to update Part
    var editingPartOptions = {};
    $scope.focusOnPart = 0;

    $scope.smartBarKeyDown = function (event) {
        //console.log("Refresh " + event.keyCode)
        if (event.keyCode == 32) { //space
            $scope.suggestions = notes.getSuggested($scope.smartBar).success(function (data) {
                console.table(data);
                $scope.suggestions = data;
            });
            console.log("Suggestions refreshed");
        }

        if (event.keyCode == 40 && $scope.highlightedSuggestion < $scope.suggestions.length-1) { //arrow down
            //sterowanie po menu
            event.preventDefault();
            $scope.highlightedSuggestion++;
        }
        if (event.keyCode == 38 && $scope.highlightedSuggestion > -1) { //arrow up
            event.preventDefault();
            $scope.highlightedSuggestion--;
        }

        if (event.keyCode == 13 && $scope.highlightedSuggestion > -1) { //enter
            //uzupełnij inputa, zacznij pisanie notatki
            //console.table($scope.suggestions[$scope.highlightedSuggestion].NoteTags);

            $scope.smartBar = "";

            var note = $scope.suggestions[$scope.highlightedSuggestion];
            console.table(note);

            //uzupelniam smartBar o wybrane tagi
            for (var nt in note.NoteTags) {
                $scope.smartBar += note.NoteTags[nt].Tag.Name + " ";
            }

            $scope.currentNoteId = note.NoteId;
            $scope.parts = parts.get($scope.currentNoteId).success(function (data) {
                $scope.parts = data;
                console.log("Got data: ");
                console.table(data);
                partsCheckForNull();
            });

        }
    }

    $scope.editingPartKeyDown = function (event, partObjIndex) {

        //aktualizuj co jakis czas
        clearTimeout(timeoutUpdate);
        timeoutUpdate = setTimeout(function () { updatePart(partObjIndex) }, 1000);
        $scope.parts[partObjIndex].localState = "Sending";

        //2x enter dodaje nowy part
        var partObj = $scope.parts[partObjIndex];
        if (event.keyCode == 13 && /\s*<br>\s*<br>\s*$/.test(partObj.Data)) { //enter
            $scope.parts[partObjIndex].Data = $scope.parts[partObjIndex].Data.replace(/\s*<br>\s*$/g, "");
            addPart(partObjIndex);
            event.preventDefault(); //żeby nie dawało już tego entera
        }

    }
    
    function updatePart(index) {

        $scope.parts[index].localState = "Sending";

        parts.put($scope.parts[index]).success(function () {
            $scope.parts[index].localState = "OK";
        }).error(function () {
            $scope.parts[index].localState = "Problem";
        });

    }

    function addPart(lastIndex) {

        var atIndex = lastIndex + 1;
        if (lastIndex == null) {
            atIndex = 0;
        }

        $scope.parts.splice(atIndex, 0, { Data: "new", NoteID: $scope.currentNoteId }); //add at index
        //console.log("after");
        //console.table($scope.parts);
        focusOn("part" + atIndex);
        $scope.parts[atIndex].localState = "Sending";
        parts.post($scope.parts[atIndex]).success(function (data) {
            console.log("post success");
            console.table(data);
            $scope.parts[atIndex].ID = data.ID;
            $scope.parts[atIndex].localState = "OK";
        }).error(function () {
            $scope.parts[atIndex].localState = "Problem";
        });
    }

    function partsCheckForNull(){
        if ($scope.parts.length == 0 || $scope.parts == null) {
            addPart();
        }
    }
});
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
app.factory('parts', ['$http', function ($http) {

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
        return $http({
            method: 'PUT',
            url: '/api/Parts/'+part.ID,
            data: part,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    return parts;
}]);
(function () {
    'use strict';

    
})();

var app = angular.module('ConsoleNotepad', [
        // Angular modules 
        'ngRoute'

        // Custom modules 

        // 3rd Party Modules

]);

//app.directive('contenteditable', function () {
//    return {
//        restrict: 'A', // only activate on element attribute
//        require: '?ngModel', // get a hold of NgModelController
//        link: function (scope, element, attrs, ngModel) {
//            if (!ngModel) return; // do nothing if no ng-model

//            // Specify how UI should be updated
//            ngModel.$render = function () {
//                element.html(ngModel.$viewValue || '');
//            };

//            // Listen for change events to enable binding
//            element.on('blur keyup change', function () {
//                scope.$apply(read);
//            });
//            read(); // initialize

//            // Write data to the model
//            function read() {
//                var html = element.html();
//                // When we clear the content editable the browser leaves a <br> behind
//                // If strip-br attribute is provided then we strip this out
//                if (attrs.stripBr && html == '<br>') {
//                    html = '';
//                }
//                ngModel.$setViewValue(html);
//            }
//        }
//    };
//});

app.directive('contenteditable', [function () {
    return {
        require: '?ngModel',
        scope: {

        },
        link: function (scope, element, attrs, ctrl) {
            // view -> model (when div gets blur update the view value of the model)
            element.bind('blur keyup change', function () {
                scope.$apply(function () {
                    ctrl.$setViewValue(element.html());
                });
            });

            // model -> view
            ctrl.$render = function () {
                element.html(ctrl.$viewValue);
            };

            // load init value from DOM
            ctrl.$render();

            // remove the attached events to element when destroying the scope
            scope.$on('$destroy', function () {
                element.unbind('blur');
                element.unbind('paste');
                element.unbind('focus');
            });
        }
    };
}]);
app.directive('focusOn', function () {
    return function (scope, elem, attr) {
        scope.$on('focusOn', function (e, name) {
            if (name === attr.focusOn) {
                elem[0].focus();
            }
        });
    };
});

app.factory('focusOn', function ($rootScope, $timeout) {
    return function (name) {
        $timeout(function () {
            $rootScope.$broadcast('focusOn', name);
        });
    }
});
app.controller('editorController', function ($scope, notes, parts, focusOn) {
    $scope.suggestions = {};
    $scope.highlightedSuggestion = -1;
    $scope.currentNoteId = 0;
    $scope.parts = [
        {
            Data: "new"
        }
    ];
    var timeoutUpdate; //setTimeout to update Part
    var editingPartOptions = {};
    $scope.focusOnPart = 0;

    $scope.smartBarKeyDown = function (event) {
        //console.log("Refresh " + event.keyCode)
        if (event.keyCode == 32) { //space
            $scope.suggestions = notes.getSuggested($scope.smartBar).success(function (data) {
                console.table(data);
                $scope.suggestions = data;
            });
            console.log("Suggestions refreshed");
        }

        if (event.keyCode == 40 && $scope.highlightedSuggestion < $scope.suggestions.length-1) { //arrow down
            //sterowanie po menu
            event.preventDefault();
            $scope.highlightedSuggestion++;
        }
        if (event.keyCode == 38 && $scope.highlightedSuggestion > -1) { //arrow up
            event.preventDefault();
            $scope.highlightedSuggestion--;
        }

        if (event.keyCode == 13 && $scope.highlightedSuggestion > -1) { //enter
            //uzupełnij inputa, zacznij pisanie notatki
            //console.table($scope.suggestions[$scope.highlightedSuggestion].NoteTags);

            $scope.smartBar = "";

            var note = $scope.suggestions[$scope.highlightedSuggestion];
            console.table(note);

            //uzupelniam smartBar o wybrane tagi
            for (var nt in note.NoteTags) {
                $scope.smartBar += note.NoteTags[nt].Tag.Name + " ";
            }

            $scope.currentNoteId = note.NoteId;
            $scope.parts = parts.get($scope.currentNoteId).success(function (data) {
                $scope.parts = data;
                console.log("Got data: ");
                console.table(data);
                partsCheckForNull();
            });

        }
    }

    $scope.editingPartKeyDown = function (event, partObjIndex) {

        //aktualizuj co jakis czas
        clearTimeout(timeoutUpdate);
        timeoutUpdate = setTimeout(function () { updatePart(partObjIndex) }, 1000);
        $scope.parts[partObjIndex].localState = "Sending";

        //2x enter dodaje nowy part
        var partObj = $scope.parts[partObjIndex];
        if (event.keyCode == 13 && /\s*<br>\s*<br>\s*$/.test(partObj.Data)) { //enter
            $scope.parts[partObjIndex].Data = $scope.parts[partObjIndex].Data.replace(/\s*<br>\s*$/g, "");
            addPart(partObjIndex);
            event.preventDefault(); //żeby nie dawało już tego entera
        }

    }
    
    function updatePart(index) {

        $scope.parts[index].localState = "Sending";

        parts.put($scope.parts[index]).success(function () {
            $scope.parts[index].localState = "OK";
        }).error(function () {
            $scope.parts[index].localState = "Problem";
        });

    }

    function addPart(lastIndex) {

        var atIndex = lastIndex + 1;
        if (lastIndex == null) {
            atIndex = 0;
        }

        $scope.parts.splice(atIndex, 0, { Data: "new", NoteID: $scope.currentNoteId }); //add at index

        focusOn("part" + atIndex);
        $scope.parts[atIndex].localState = "Sending";
        parts.post($scope.parts[atIndex]).success(function (data) {
            console.log("post success");
            console.table(data);
            $scope.parts[atIndex].ID = data.ID;
            $scope.parts[atIndex].localState = "OK";
        }).error(function () {
            $scope.parts[atIndex].localState = "Problem";
        });
    }

    function partsCheckForNull(){
        if ($scope.parts.length == 0 || $scope.parts == null) {
            addPart();
        }
    }
});
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
app.factory('parts', ['$http', function ($http) {

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
        return $http({
            method: 'PUT',
            url: '/api/Parts/'+part.ID,
            data: part,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    return parts;
}]);
(function () {
    'use strict';

    
})();

var app = angular.module('ConsoleNotepad', [
        // Angular modules 
        'ngRoute'

        // Custom modules 

        // 3rd Party Modules

]);

//app.directive('contenteditable', function () {
//    return {
//        restrict: 'A', // only activate on element attribute
//        require: '?ngModel', // get a hold of NgModelController
//        link: function (scope, element, attrs, ngModel) {
//            if (!ngModel) return; // do nothing if no ng-model

//            // Specify how UI should be updated
//            ngModel.$render = function () {
//                element.html(ngModel.$viewValue || '');
//            };

//            // Listen for change events to enable binding
//            element.on('blur keyup change', function () {
//                scope.$apply(read);
//            });
//            read(); // initialize

//            // Write data to the model
//            function read() {
//                var html = element.html();
//                // When we clear the content editable the browser leaves a <br> behind
//                // If strip-br attribute is provided then we strip this out
//                if (attrs.stripBr && html == '<br>') {
//                    html = '';
//                }
//                ngModel.$setViewValue(html);
//            }
//        }
//    };
//});

app.directive('contenteditable', [function () {
    return {
        require: '?ngModel',
        scope: {

        },
        link: function (scope, element, attrs, ctrl) {
            // view -> model (when div gets blur update the view value of the model)
            element.bind('blur keyup change', function () {
                scope.$apply(function () {
                    ctrl.$setViewValue(element.html());
                });
            });

            // model -> view
            ctrl.$render = function () {
                element.html(ctrl.$viewValue);
            };

            // load init value from DOM
            ctrl.$render();

            // remove the attached events to element when destroying the scope
            scope.$on('$destroy', function () {
                element.unbind('blur');
                element.unbind('paste');
                element.unbind('focus');
            });
        }
    };
}]);
app.directive('focusOn', function () {
    return function (scope, elem, attr) {
        scope.$on('focusOn', function (e, name) {
            if (name === attr.focusOn) {
                elem[0].focus();
            }
        });
    };
});

app.factory('focusOn', function ($rootScope, $timeout) {
    return function (name) {
        $timeout(function () {
            $rootScope.$broadcast('focusOn', name);
        });
    }
});
app.controller('editorController', function ($scope, notes, parts, focusOn) {
    $scope.suggestions = {};
    $scope.highlightedSuggestion = -1;
    $scope.currentNoteId = 0;
    $scope.parts = [
        {
            Data: "new"
        }
    ];
    var timeoutUpdate; //setTimeout to update Part
    var editingPartOptions = {};
    $scope.focusOnPart = 0;

    $scope.smartBarKeyDown = function (event) {
        //console.log("Refresh " + event.keyCode)
        if (event.keyCode == 32) { //space
            $scope.suggestions = notes.getSuggested($scope.smartBar).success(function (data) {
                console.table(data);
                $scope.suggestions = data;
            });
            console.log("Suggestions refreshed");
        }

        if (event.keyCode == 40 && $scope.highlightedSuggestion < $scope.suggestions.length-1) { //arrow down
            //sterowanie po menu
            event.preventDefault();
            $scope.highlightedSuggestion++;
        }
        if (event.keyCode == 38 && $scope.highlightedSuggestion > -1) { //arrow up
            event.preventDefault();
            $scope.highlightedSuggestion--;
        }

        if (event.keyCode == 13 && $scope.highlightedSuggestion > -1) { //enter
            //uzupełnij inputa, zacznij pisanie notatki
            //console.table($scope.suggestions[$scope.highlightedSuggestion].NoteTags);

            $scope.smartBar = "";

            var note = $scope.suggestions[$scope.highlightedSuggestion];
            console.table(note);

            //uzupelniam smartBar o wybrane tagi
            for (var nt in note.NoteTags) {
                $scope.smartBar += note.NoteTags[nt].Tag.Name + " ";
            }

            $scope.currentNoteId = note.NoteId;
            $scope.parts = parts.get($scope.currentNoteId).success(function (data) {
                $scope.parts = data;
                console.log("Got data: ");
                console.table(data);
                partsCheckForNull();
            });

        }
    }

    $scope.editingPartKeyDown = function (event, partObjIndex) {

        //aktualizuj co jakis czas
        clearTimeout(timeoutUpdate);
        timeoutUpdate = setTimeout(function () { updatePart(partObjIndex) }, 1000);
        $scope.parts[partObjIndex].localState = "Sending";

        //2x enter dodaje nowy part
        var partObj = $scope.parts[partObjIndex];
        if (event.keyCode == 13 && /\s*<br>\s*<br>\s*$/.test(partObj.Data)) { //enter
            $scope.parts[partObjIndex].Data = $scope.parts[partObjIndex].Data.replace(/\s*<br>\s*$/g, "");
            addPart(partObjIndex);
            event.preventDefault(); //żeby nie dawało już tego entera
        }

    }
    
    function updatePart(index) {

        $scope.parts[index].localState = "Sending";

        parts.put($scope.parts[index]).success(function () {
            $scope.parts[index].localState = "OK";
        }).error(function () {
            $scope.parts[index].localState = "Problem";
        });

    }

    function addPart(lastIndex) {

        var atIndex = lastIndex + 1;
        if (lastIndex == null) {
            atIndex = 0;
        }

        $scope.parts.splice(atIndex, 0, { Data: "new", NoteID: $scope.currentNoteId }); //add at index

        focusOn("part" + atIndex); //przenieś kursor do nowego parta

        $scope.parts[atIndex].localState = "Sending";
        parts.post($scope.parts[atIndex]).success(function (data) {
            console.log("post success");
            console.table(data);
            $scope.parts[atIndex].ID = data.ID;
            $scope.parts[atIndex].localState = "OK";
        }).error(function () {
            $scope.parts[atIndex].localState = "Problem";
        });
    }

    function partsCheckForNull(){
        if ($scope.parts.length == 0 || $scope.parts == null) {
            addPart();
        }
    }
});
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
app.factory('parts', ['$http', function ($http) {

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
        return $http({
            method: 'PUT',
            url: '/api/Parts/'+part.ID,
            data: part,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    return parts;
}]);
(function () {
    'use strict';

    
})();

var app = angular.module('ConsoleNotepad', [
        // Angular modules 
        'ngRoute'

        // Custom modules 

        // 3rd Party Modules

]);

//app.directive('contenteditable', function () {
//    return {
//        restrict: 'A', // only activate on element attribute
//        require: '?ngModel', // get a hold of NgModelController
//        link: function (scope, element, attrs, ngModel) {
//            if (!ngModel) return; // do nothing if no ng-model

//            // Specify how UI should be updated
//            ngModel.$render = function () {
//                element.html(ngModel.$viewValue || '');
//            };

//            // Listen for change events to enable binding
//            element.on('blur keyup change', function () {
//                scope.$apply(read);
//            });
//            read(); // initialize

//            // Write data to the model
//            function read() {
//                var html = element.html();
//                // When we clear the content editable the browser leaves a <br> behind
//                // If strip-br attribute is provided then we strip this out
//                if (attrs.stripBr && html == '<br>') {
//                    html = '';
//                }
//                ngModel.$setViewValue(html);
//            }
//        }
//    };
//});

app.directive('contenteditable', [function () {
    return {
        require: '?ngModel',
        scope: {

        },
        link: function (scope, element, attrs, ctrl) {
            // view -> model (when div gets blur update the view value of the model)
            element.bind('blur keyup change', function () {
                scope.$apply(function () {
                    ctrl.$setViewValue(element.html());
                });
            });

            // model -> view
            ctrl.$render = function () {
                element.html(ctrl.$viewValue);
            };

            // load init value from DOM
            ctrl.$render();

            // remove the attached events to element when destroying the scope
            scope.$on('$destroy', function () {
                element.unbind('blur');
                element.unbind('paste');
                element.unbind('focus');
            });
        }
    };
}]);
app.directive('focusOn', function () {
    return function (scope, elem, attr) {
        scope.$on('focusOn', function (e, name) {
            if (name === attr.focusOn) {
                elem[0].focus();
            }
        });
    };
});

app.factory('focusOn', function ($rootScope, $timeout) {
    return function (name) {
        $timeout(function () {
            $rootScope.$broadcast('focusOn', name);
        });
    }
});
app.controller('editorController', function ($scope, notes, parts, focusOn) {
    $scope.suggestions = {};
    $scope.highlightedSuggestion = -1;
    $scope.currentNoteId = 0;
    $scope.parts = [
        {
            Data: "new"
        }
    ];
    var timeoutUpdate; //setTimeout to update Part
    var editingPartOptions = {};
    $scope.focusOnPart = 0;

    $scope.smartBarKeyDown = function (event) {
        //console.log("Refresh " + event.keyCode)
        if (event.keyCode == 32) { //space
            $scope.suggestions = notes.getSuggested($scope.smartBar).success(function (data) {
                console.table(data);
                $scope.suggestions = data;
            });
            console.log("Suggestions refreshed");
        }

        if (event.keyCode == 40 && $scope.highlightedSuggestion < $scope.suggestions.length-1) { //arrow down
            //sterowanie po menu
            event.preventDefault();
            $scope.highlightedSuggestion++;
        }
        if (event.keyCode == 38 && $scope.highlightedSuggestion > -1) { //arrow up
            event.preventDefault();
            $scope.highlightedSuggestion--;
        }

        if (event.keyCode == 13 && $scope.highlightedSuggestion > -1) { //enter
            //uzupełnij inputa, zacznij pisanie notatki
            //console.table($scope.suggestions[$scope.highlightedSuggestion].NoteTags);

            $scope.smartBar = "";

            var note = $scope.suggestions[$scope.highlightedSuggestion];
            console.table(note);

            //uzupelniam smartBar o wybrane tagi
            for (var nt in note.NoteTags) {
                $scope.smartBar += note.NoteTags[nt].Tag.Name + " ";
            }

            $scope.currentNoteId = note.NoteId;
            $scope.parts = parts.get($scope.currentNoteId).success(function (data) {
                $scope.parts = data;
                console.log("Got data: ");
                console.table(data);
                partsCheckForNull();
            });

        }
    }

    $scope.editingPartKeyDown = function (event, partObjIndex) {

        //aktualizuj co jakis czas
        clearTimeout(timeoutUpdate);
        timeoutUpdate = setTimeout(function () { updatePart(partObjIndex) }, 1000);
        $scope.parts[partObjIndex].localState = "Sending";

        //2x enter dodaje nowy part
        var partObj = $scope.parts[partObjIndex];
        if (event.keyCode == 13 && /\s*<br>\s*<br>\s*$/.test(partObj.Data)) { //enter
            $scope.parts[partObjIndex].Data = $scope.parts[partObjIndex].Data.replace(/\s*<br>\s*$/g, "");
            addPart(partObjIndex);
            event.preventDefault(); //żeby nie dawało już tego entera
        }

    }
    
    function updatePart(index) {

        $scope.parts[index].localState = "Sending";

        parts.put($scope.parts[index]).success(function () {
            $scope.parts[index].localState = "OK";
        }).error(function () {
            $scope.parts[index].localState = "Problem";
        });

    }

    function addPart(lastIndex) {

        var atIndex = lastIndex + 1;
        if (lastIndex == null) {
            atIndex = 0;
        }

        $scope.parts.splice(atIndex, 0, { Data: "new", NoteID: $scope.currentNoteId }); //add at index

        focusOn("part" + atIndex); //przenieś kursor do nowego parta

        $scope.parts[atIndex].localState = "Sending";
        parts.post($scope.parts[atIndex]).success(function (data) {
            $scope.parts[atIndex].ID = data.ID;
            $scope.parts[atIndex].localState = "OK";
        }).error(function () {
            $scope.parts[atIndex].localState = "Problem";
        });
    }

    function partsCheckForNull(){
        if ($scope.parts.length == 0 || $scope.parts == null) {
            addPart();
        }
    }
});
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
app.factory('parts', ['$http', function ($http) {

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
        return $http({
            method: 'PUT',
            url: '/api/Parts/'+part.ID,
            data: part,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    return parts;
}]);
(function () {
    'use strict';

    
})();

var app = angular.module('ConsoleNotepad', [
        // Angular modules 
        'ngRoute'

        // Custom modules 

        // 3rd Party Modules

]);

//app.directive('contenteditable', function () {
//    return {
//        restrict: 'A', // only activate on element attribute
//        require: '?ngModel', // get a hold of NgModelController
//        link: function (scope, element, attrs, ngModel) {
//            if (!ngModel) return; // do nothing if no ng-model

//            // Specify how UI should be updated
//            ngModel.$render = function () {
//                element.html(ngModel.$viewValue || '');
//            };

//            // Listen for change events to enable binding
//            element.on('blur keyup change', function () {
//                scope.$apply(read);
//            });
//            read(); // initialize

//            // Write data to the model
//            function read() {
//                var html = element.html();
//                // When we clear the content editable the browser leaves a <br> behind
//                // If strip-br attribute is provided then we strip this out
//                if (attrs.stripBr && html == '<br>') {
//                    html = '';
//                }
//                ngModel.$setViewValue(html);
//            }
//        }
//    };
//});

app.directive('contenteditable', [function () {
    return {
        require: '?ngModel',
        scope: {

        },
        link: function (scope, element, attrs, ctrl) {
            // view -> model (when div gets blur update the view value of the model)
            element.bind('blur keyup change', function () {
                scope.$apply(function () {
                    ctrl.$setViewValue(element.html());
                });
            });

            // model -> view
            ctrl.$render = function () {
                element.html(ctrl.$viewValue);
            };

            // load init value from DOM
            ctrl.$render();

            // remove the attached events to element when destroying the scope
            scope.$on('$destroy', function () {
                element.unbind('blur');
                element.unbind('paste');
                element.unbind('focus');
            });
        }
    };
}]);
app.directive('focusOn', function () {
    return function (scope, elem, attr) {
        scope.$on('focusOn', function (e, name) {
            if (name === attr.focusOn) {
                elem[0].focus();
            }
        });
    };
});

app.factory('focusOn', function ($rootScope, $timeout) {
    return function (name) {
        $timeout(function () {
            $rootScope.$broadcast('focusOn', name);
        });
    }
});
app.controller('editorController', function ($scope, notes, parts, focusOn) {
    $scope.suggestions = {};
    $scope.highlightedSuggestion = -1;
    $scope.currentNoteId = 0;
    $scope.parts = [
        {
            Data: "new"
        }
    ];
    var timeoutUpdate; //setTimeout to update Part
    var editingPartOptions = {};
    $scope.focusOnPart = 0;

    $scope.smartBarKeyDown = function (event) {
        //console.log("Refresh " + event.keyCode)
        if (event.keyCode == 32) { //space
            $scope.suggestions = notes.getSuggested($scope.smartBar).success(function (data) {
                console.table(data);
                $scope.suggestions = data;
            });
            console.log("Suggestions refreshed");
        }

        if (event.keyCode == 40 && $scope.highlightedSuggestion < $scope.suggestions.length-1) { //arrow down
            //sterowanie po menu
            event.preventDefault();
            $scope.highlightedSuggestion++;
        }
        if (event.keyCode == 38 && $scope.highlightedSuggestion > -1) { //arrow up
            event.preventDefault();
            $scope.highlightedSuggestion--;
        }

        if (event.keyCode == 13 && $scope.highlightedSuggestion > -1) { //enter
            //uzupełnij inputa, zacznij pisanie notatki
            //console.table($scope.suggestions[$scope.highlightedSuggestion].NoteTags);

            $scope.smartBar = "";

            var note = $scope.suggestions[$scope.highlightedSuggestion];
            console.table(note);

            //uzupelniam smartBar o wybrane tagi
            for (var nt in note.NoteTags) {
                $scope.smartBar += note.NoteTags[nt].Tag.Name + " ";
            }

            $scope.currentNoteId = note.NoteId;
            $scope.parts = parts.get($scope.currentNoteId).success(function (data) {
                $scope.parts = data;
                console.log("Got data: ");
                console.table(data);
                partsCheckForNull();
            });

        }
    }

    $scope.editingPartKeyDown = function (event, partObjIndex) {

        //aktualizuj co jakis czas
        clearTimeout(timeoutUpdate);
        timeoutUpdate = setTimeout(function () { updatePart(partObjIndex) }, 1000);
        $scope.parts[partObjIndex].localState = "Sending";

        //2x enter dodaje nowy part
        var partObj = $scope.parts[partObjIndex];
        if (event.keyCode == 13 && /\s*<br>\s*<br>\s*$/.test(partObj.Data)) { //enter
            $scope.parts[partObjIndex].Data = $scope.parts[partObjIndex].Data.replace(/\s*<br>\s*$/g, "");
            addPart(partObjIndex);
            event.preventDefault(); //żeby nie dawało już tego entera
        }

    }
    
    function updatePart(index) {

        $scope.parts[index].localState = "Sending";

        parts.put($scope.parts[index]).success(function () {
            $scope.parts[index].localState = "OK";
        }).error(function () {
            $scope.parts[index].localState = "Problem";
        });

    }

    function addPart(lastIndex) {

        var atIndex = lastIndex + 1;
        if (lastIndex == null) {
            atIndex = 0;
        }

        $scope.parts.splice(atIndex, 0, { Data: "new", NoteID: $scope.currentNoteId }); //add at index

        focusOn("part" + atIndex); //przenieś kursor do nowego parta

        $scope.parts[atIndex].localState = "Sending";

        parts.post($scope.parts[atIndex]).success(function (data) {
            $scope.parts[atIndex].ID = data.ID;
            $scope.parts[atIndex].localState = "OK";
        }).error(function () {
            $scope.parts[atIndex].localState = "Problem";
        });
    }

    function partsCheckForNull(){
        if ($scope.parts.length == 0 || $scope.parts == null) {
            addPart();
        }
    }
});
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
app.factory('parts', ['$http', function ($http) {

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
        return $http({
            method: 'PUT',
            url: '/api/Parts/'+part.ID,
            data: part,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    return parts;
}]);
(function () {
    'use strict';

    
})();

var app = angular.module('ConsoleNotepad', [
        // Angular modules 
        'ngRoute'

        // Custom modules 

        // 3rd Party Modules

]);

//app.directive('contenteditable', function () {
//    return {
//        restrict: 'A', // only activate on element attribute
//        require: '?ngModel', // get a hold of NgModelController
//        link: function (scope, element, attrs, ngModel) {
//            if (!ngModel) return; // do nothing if no ng-model

//            // Specify how UI should be updated
//            ngModel.$render = function () {
//                element.html(ngModel.$viewValue || '');
//            };

//            // Listen for change events to enable binding
//            element.on('blur keyup change', function () {
//                scope.$apply(read);
//            });
//            read(); // initialize

//            // Write data to the model
//            function read() {
//                var html = element.html();
//                // When we clear the content editable the browser leaves a <br> behind
//                // If strip-br attribute is provided then we strip this out
//                if (attrs.stripBr && html == '<br>') {
//                    html = '';
//                }
//                ngModel.$setViewValue(html);
//            }
//        }
//    };
//});

app.directive('contenteditable', [function () {
    return {
        require: '?ngModel',
        scope: {

        },
        link: function (scope, element, attrs, ctrl) {
            // view -> model (when div gets blur update the view value of the model)
            element.bind('blur keyup change', function () {
                scope.$apply(function () {
                    ctrl.$setViewValue(element.html());
                });
            });

            // model -> view
            ctrl.$render = function () {
                element.html(ctrl.$viewValue);
            };

            // load init value from DOM
            ctrl.$render();

            // remove the attached events to element when destroying the scope
            scope.$on('$destroy', function () {
                element.unbind('blur');
                element.unbind('paste');
                element.unbind('focus');
            });
        }
    };
}]);
app.directive('focusOn', function () {
    return function (scope, elem, attr) {
        scope.$on('focusOn', function (e, name) {
            if (name === attr.focusOn) {
                elem[0].focus();
            }
        });
    };
});

app.factory('focusOn', function ($rootScope, $timeout) {
    return function (name) {
        $timeout(function () {
            $rootScope.$broadcast('focusOn', name);
        });
    }
});
app.controller('editorController', function ($scope, notes, parts, focusOn) {
    $scope.suggestions = {};
    $scope.highlightedSuggestion = -1;
    $scope.currentNoteId = 0;
    $scope.parts = [
        {
            Data: "new"
        }
    ];
    var timeoutUpdate; //setTimeout to update Part
    var editingPartOptions = {};
    $scope.focusOnPart = 0;

    $scope.smartBarKeyDown = function (event) {
        //console.log("Refresh " + event.keyCode)
        if (event.keyCode == 32) { //space
            $scope.suggestions = notes.getSuggested($scope.smartBar).success(function (data) {
                console.table(data);
                $scope.suggestions = data;
            });
            console.log("Suggestions refreshed");
        }

        if (event.keyCode == 40 && $scope.highlightedSuggestion < $scope.suggestions.length-1) { //arrow down
            //sterowanie po menu
            event.preventDefault();
            $scope.highlightedSuggestion++;
        }
        if (event.keyCode == 38 && $scope.highlightedSuggestion > -1) { //arrow up
            event.preventDefault();
            $scope.highlightedSuggestion--;
        }

        if (event.keyCode == 13 && $scope.highlightedSuggestion > -1) { //enter
            //uzupełnij inputa, zacznij pisanie notatki
            //console.table($scope.suggestions[$scope.highlightedSuggestion].NoteTags);

            $scope.smartBar = "";

            var note = $scope.suggestions[$scope.highlightedSuggestion];
            console.table(note);

            //uzupelniam smartBar o wybrane tagi
            for (var nt in note.NoteTags) {
                $scope.smartBar += note.NoteTags[nt].Tag.Name + " ";
            }

            $scope.currentNoteId = note.NoteId;
            $scope.parts = parts.get($scope.currentNoteId).success(function (data) {
                $scope.parts = data;
                console.log("Got data: ");
                console.table(data);
                partsCheckForNull();
            });

        }
    }

    $scope.editingPartKeyDown = function (event, partObjIndex) {

        //aktualizuj co jakis czas
        clearTimeout(timeoutUpdate);
        timeoutUpdate = setTimeout(function () { updatePart(partObjIndex) }, 1000);
        $scope.parts[partObjIndex].localState = "Sending";

        //2x enter dodaje nowy part
        var partObj = $scope.parts[partObjIndex];
        if (event.keyCode == 13 && /\s*<br>\s*<br>\s*$/.test(partObj.Data)) { //enter
            $scope.parts[partObjIndex].Data = $scope.parts[partObjIndex].Data.replace(/\s*<br>\s*$/g, "");
            addPart(partObjIndex);
            event.preventDefault(); //żeby nie dawało już tego entera
        }

    }
    
    function updatePart(index) {

        $scope.parts[index].localState = "Sending";

        parts.put($scope.parts[index]).success(function () {
            $scope.parts[index].localState = "OK";
        }).error(function () {
            $scope.parts[index].localState = "Problem";
        });

    }

    function addPart(lastIndex) {

        var atIndex = lastIndex + 1;
        if (lastIndex == null) {
            atIndex = 0;
        }

        $scope.parts.splice(atIndex, 0, { Data: "new", NoteID: $scope.currentNoteId }); //add at index

        focusOn("part" + atIndex); //przenieś kursor do nowego parta

        $scope.parts[atIndex].localState = "Sending";

        parts.post($scope.parts[atIndex]).success(function (data) {
            $scope.parts[atIndex].ID = data.ID;
            $scope.parts[atIndex].localState = "OK";
        }).error(function () {
            $scope.parts[atIndex].localState = "Problem";
        });
    }

    function partsCheckForNull() {

        if ($scope.parts.length == 0 || $scope.parts == null) {
            addPart();
        }

    }
});
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
app.factory('parts', ['$http', function ($http) {

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
        return $http({
            method: 'PUT',
            url: '/api/Parts/'+part.ID,
            data: part,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    return parts;
}]);