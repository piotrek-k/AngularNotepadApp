app.directive('suggestionList', function (notes, parts) {
    return {
        restrict: 'AE',
        require: 'ngModel',
        scope: {
            ngModel: '=?',
            inputId: '@',
            inputClass: '@',
            callback: '&'
        },
        link: function ($scope, elem, attrs, ngModel) {

            $scope.keyDown = function (event) {
                //console.log("!!!");

                if (event.keyCode == 32) { //space
                    $scope.suggestions = notes.getSuggested($scope.ngModel).then(function (response) {
                        //console.table(data);
                        $scope.suggestions = response.data;
                    }, null);
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
                        //wybrano opcję z listy
                        oneOfSuggestionsChosen($scope.highlightedSuggestion);
                    }
                    else {
                        //wywołaj podaną w atrybutach funkcję
                        $scope.callback()();
                    }
                }

                if (event.keyCode != 13 && event.keyCode != 40 && event.keyCode != 38) {
                    $scope.highlightedSuggestion = -1; //zmieniła się treść, wyzeruj listę z podpowiedziami
                }
            }

            $scope.suggestionClicked = function (i, evt) {
                if (evt.which === 1) {
                    oneOfSuggestionsChosen(i);
                }
            }

            function oneOfSuggestionsChosen(i) {
                //poszereguj tagi, pobierz ID notatki
                $scope.ngModel = "";
                var note = $scope.suggestions[i];
                //console.table(note.NoteTags);
                for (var nt in note.NoteTags) {
                    $scope.ngModel += note.NoteTags[nt].Tag.Name + " ";
                }

                $scope.callback()(note.NoteId);
            }
        },
        templateUrl: "/angularViews/directives/suggestionList.html"
    };
});