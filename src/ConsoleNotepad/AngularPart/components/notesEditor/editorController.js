app.controller('editorController', function ($scope, notes) {
    $scope.test = 'Yeah, works';
    $scope.suggestions = {};

    $scope.refresh = function (event) {
        console.log("Refresh " + event.keyCode)
        if (event.keyCode == 32) {
            $scope.suggestions = notes.getSuggested($scope.smartBar).success(function (data) {
                $scope.suggestions = data;
            });
            console.log("Refreshed");
        }
    }
});