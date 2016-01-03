app.controller('editorController', function ($scope, notes) {
    $scope.suggestions = {};
    $scope.highlightedSuggestion = -1;

    $scope.smartBarKeyDown = function (event) {
        console.log("Refresh " + event.keyCode)
        if (event.keyCode == 32) {
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
            for (var nt in $scope.suggestions[$scope.highlightedSuggestion].NoteTags) {
                //console.log(nt);
                $scope.smartBar += $scope.suggestions[$scope.highlightedSuggestion].NoteTags[nt].Tag.Name + " ";
            }
            
        }
    }
});