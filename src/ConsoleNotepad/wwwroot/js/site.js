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
app.directive('focusOn', function ($timeout) {
    return function (scope, elem, attr) {
        scope.$on('focusOn', function (e, name) {
            if (name === attr.focusOn) {
                $timeout(function () {

                    elem[0].focus();

                    if (typeof window.getSelection != "undefined" && typeof document.createRange != "undefined") {
                        var range = document.createRange();
                        range.selectNodeContents(elem[0]);
                        range.collapse(false);
                        var sel = window.getSelection();
                        sel.removeAllRanges();
                        sel.addRange(range);
                    } else if (typeof document.body.createTextRange != "undefined") {
                        var textRange = document.body.createTextRange();
                        textRange.moveToElementText(elem[0]);
                        textRange.collapse(false);
                        textRange.select();
                    }
                });
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
    $scope.showSuggestions = false;
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
    $scope.activePart = 0;

    getPartsByTag();
    focusOn("smartBar");

    $scope.smartBarKeyDown = function (event) {
        //console.log("Refresh " + event.keyCode)
        if (event.keyCode == 32) { //space
            $scope.suggestions = notes.getSuggested($scope.smartBar).success(function (data) {
                console.table(data);
                $scope.suggestions = data;
            });
            console.log("Suggestions refreshed");
        }

        if (event.keyCode == 40 && $scope.highlightedSuggestion < $scope.suggestions.length - 1) { //arrow down
            //sterowanie po menu
            event.preventDefault();
            $scope.highlightedSuggestion++;
        }
        else if (event.keyCode == 38 && $scope.highlightedSuggestion > -1) { //arrow up
            event.preventDefault();
            $scope.highlightedSuggestion--;
        }
        else if (event.keyCode == 13) { //enter // && $scope.highlightedSuggestion > -1
            //uzupełnij inputa, zacznij pisanie notatki
            //console.table($scope.suggestions[$scope.highlightedSuggestion].NoteTags);

            if ($scope.highlightedSuggestion != -1) {
                oneOfSuggestionsChosen($scope.highlightedSuggestion);
            }
            else {
                //nie wybrano nic z listy, trzeba więc zdobyć ID wpisanej notatki
                getPartsByTag();
            }

        }

        if (event.keyCode != 13 && event.keyCode != 40 && event.keyCode != 38) {
            $scope.highlightedSuggestion = -1; //zmieniła się treść, wyzeruj listę z podpowiedziami
        }
    }

    $scope.editingPartKeyDown = function (event, partObjIndex) {

        //aktualizuj co jakis czas
        clearTimeout(timeoutUpdate);
        timeoutUpdate = setTimeout(function () { updatePart(partObjIndex) }, 1000);
        $scope.parts[partObjIndex].localState = "Sending";

    }

    function getPartsByTag() {
        if ($scope.smartBar == undefined) {
            $scope.smartBar = "";
        }
        notes.getByTag($scope.smartBar).success(function (noteData) {
            //console.table(noteData);
            $scope.currentNoteId = noteData.NoteId;

            $scope.parts = parts.get($scope.currentNoteId).success(function (data) {
                whenPartsReceived(data);
            });
        });
    }

    function oneOfSuggestionsChosen(i) {
        $scope.smartBar = "";

        var note = $scope.suggestions[i];
        console.table(note);

        //uzupelniam smartBar o wybrane tagi
        for (var nt in note.NoteTags) {
            $scope.smartBar += note.NoteTags[nt].Tag.Name + " ";
        }

        $scope.currentNoteId = note.NoteId;

        $scope.parts = parts.get($scope.currentNoteId).success(function (data) {
            whenPartsReceived(data);
        });
    }

    function updatePart(index) {

        $scope.parts[index].localState = "Sending";

        parts.put($scope.parts[index]).success(function () {
            $scope.parts[index].localState = "OK";
        }).error(function () {
            $scope.parts[index].localState = "Problem";
        });

    }

    $scope.addPart = function () {
        var atIndex = $scope.activePart + 1;
        //console.log("atIndex: " + atIndex);

        $scope.parts.splice(atIndex, 0, { Data: "&nbsp;", NoteID: $scope.currentNoteId }); //add at index

        focusOn("part" + atIndex + "window" + $scope.$index); //przenieś kursor do nowego parta

        $scope.parts[atIndex].localState = "Sending";
        $scope.parts[atIndex].OrderPosition = $scope.parts[atIndex - 1].OrderPosition + 1;

        //to samo dzieje sie na serwerze
        for (var a in $scope.parts) {
            if (a != atIndex && $scope.parts[a].OrderPosition >= $scope.parts[atIndex].OrderPosition) {
                $scope.parts[a].OrderPosition++;
            }
        }

        parts.post($scope.parts[atIndex]).success(function (data) {
            $scope.parts[atIndex].ID = data.ID;
            $scope.parts[atIndex].localState = "OK";
        }).error(function () {
            $scope.parts[atIndex].localState = "Problem";
        });
    }

    function partsCheckForNull() {
        if ($scope.parts.length == 0 || $scope.parts == null) {
            $scope.addPart();
        }
    }

    function whenPartsReceived(data) {
        $scope.parts = data;
        //console.log("Got data: ");
        //console.table(data);
        partsCheckForNull();
        focusOn("part" + ($scope.parts.length - 1) + "window" + $scope.$index); //skocz do ostatniego utworzonego parta
    }

    $scope.suggestionClicked = function (i, evt) {
        if (evt.which === 1) {
            oneOfSuggestionsChosen(i);
        }
    }

    $scope.focusedOnPart = function (i) {
        $scope.activePart = i;
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
            url: '/api/Parts/' + part.ID,
            data: part,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    return parts;
}]);
app.controller('windowsController', function ($scope, notes, parts, focusOn) {

    $scope.numberOfWindows = [0]; //zawartosc tablicy nie ma znaczenia
    $scope.preventDuplicates = 1; //nie moze byc duplikatow, nadawaj ID okienkom

    $scope.addWindow = function (index) {
        if (index == undefined) {
            $scope.numberOfWindows.push(0);
        }
        $scope.numberOfWindows.splice(index+1, 0, $scope.preventDuplicates);
        $scope.preventDuplicates++;
        console.table($scope.numberOfWindows);
    }

    $scope.removeWindow = function (index) {
        $scope.numberOfWindows.splice(index, 1);
    }
});