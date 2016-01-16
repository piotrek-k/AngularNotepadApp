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