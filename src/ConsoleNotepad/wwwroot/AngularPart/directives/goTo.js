app.directive('goto', function (notes, parts) {
    return {
        restrict: 'E',
        scope: {
            noteName: "@",
            x: "@" //to samo. zeby bylo krocej ;P
        },
        link: function (scope, elem, attrs) {
            //scope.noteName = elem.text();
            if (scope.noteName == undefined) {
                scope.noteName = scope.x;
            }

            scope.goTo = function () {
                $("#windowsContainer").scope().addWindow(undefined, scope.noteName);
            }
        },
        template: "<font color='darkgreen' ng-click='goTo()'><b><u>{{noteName}}</u></b></font>"
    };
});